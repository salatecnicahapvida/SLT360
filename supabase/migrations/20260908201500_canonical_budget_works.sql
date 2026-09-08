begin;

create or replace function slt_private.canonical_ev_work_name(value text)
returns text
language plpgsql
immutable
set search_path=''
as $$
declare normalized text;
begin
  normalized=lower(translate(coalesce(value,''),
    'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
    'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'));
  normalized=regexp_replace(normalized,'^\s*projeto\s+','','i');
  normalized=regexp_replace(normalized,'^\s*\d+(?:[.\s-]+)?','','');
  normalized=regexp_replace(normalized,'\m(hs|ho|hc)\M','hospital','g');
  normalized=regexp_replace(normalized,'\m(novo|nova)\M','','g');
  normalized=regexp_replace(normalized,'\s+[a-z]{2}\s+tec\s+\d+.*$','','i');
  normalized=regexp_replace(normalized,'\s+tec\s+\d+.*$','','i');
  normalized=regexp_replace(normalized,'[^a-z0-9]+',' ','g');
  return trim(regexp_replace(normalized,'\s+',' ','g'));
end $$;

create or replace function slt_private.canonical_ev_work_score(left_value text,right_value text)
returns integer
language plpgsql
immutable
set search_path=''
as $$
declare
  left_name text=slt_private.canonical_ev_work_name(left_value);
  right_name text=slt_private.canonical_ev_work_name(right_value);
  left_tokens text[];
  right_tokens text[];
  shared integer;
  smaller integer;
begin
  if left_name='' or right_name='' then return 0; end if;
  if left_name=right_name then return 1000; end if;
  if length(left_name)>=12 and length(right_name)>=12 and
     (position(left_name in right_name)>0 or position(right_name in left_name)>0) then
    return 800;
  end if;

  select coalesce(array_agg(distinct token),'{}') into left_tokens
  from unnest(regexp_split_to_array(left_name,'\s+')) token
  where length(token)>=4 and token not in ('novo','nova','fase','hospital','unidade','reforma','adequacao','ampliacao');
  select coalesce(array_agg(distinct token),'{}') into right_tokens
  from unnest(regexp_split_to_array(right_name,'\s+')) token
  where length(token)>=4 and token not in ('novo','nova','fase','hospital','unidade','reforma','adequacao','ampliacao');
  smaller=least(cardinality(left_tokens),cardinality(right_tokens));
  if smaller=0 then return 0; end if;
  select count(*) into shared from unnest(left_tokens) token where token=any(right_tokens);
  if shared>=2 and shared::numeric/smaller>=0.5 then
    return 400+shared*10+round((shared::numeric/smaller)*100)::integer;
  end if;
  return 0;
end $$;

do $$
declare
  imported_count integer;
  snapshot jsonb;
  snapshot_count integer;
  snapshot_bytes bigint;
  works_count integer;
  estimates_count integer;
  unlinked_count integer;
begin
  select count(*) into imported_count
  from public.slt_budget_import_estimates
  where deleted_at is null;

  if imported_count=0 then
    return;
  end if;
  if imported_count<>855 then
    raise exception 'Migração cancelada: esperado 855 EVs da DADOS EVS, encontrado %',imported_count;
  end if;

  snapshot=slt_private.capture_app_snapshot();
  snapshot_count=jsonb_array_length(coalesce(snapshot->'records','[]'::jsonb));
  snapshot_bytes=octet_length(snapshot::text);
  insert into slt_private.state_backups(created_by,kind,label,schema_version,record_count,size_bytes,snapshot)
  values(null,'manual','Antes de materializar 855 obras e EVs da DADOS EVS',2,snapshot_count,snapshot_bytes,snapshot);

  create temporary table canonical_old_works(record_key text primary key) on commit drop;
  insert into canonical_old_works
  select record_key from public.slt_projects_works where deleted_at is null;

  create temporary table canonical_work_map(old_key text primary key,new_key text not null) on commit drop;
  insert into canonical_work_map(old_key,new_key)
  select distinct on (w.record_key)
    w.record_key,
    'EVW-'||e.record_key
  from public.slt_projects_works w
  cross join public.slt_budget_import_estimates e
  cross join lateral (
    select slt_private.canonical_ev_work_score(w.name,e.extra->>'project')+
      case
        when coalesce(nullif(regexp_replace(coalesce(w.extra->>'chaveUnica',w.code,''),'\D','','g'),''),'0') !~ '^0+$'
         and coalesce(nullif(regexp_replace(coalesce(e.extra->>'code',''),'\D','','g'),''),'0') !~ '^0+$'
         and regexp_replace(coalesce(w.extra->>'chaveUnica',w.code,''),'\D','','g')::bigint=
             regexp_replace(coalesce(e.extra->>'code',''),'\D','','g')::bigint
        then 200 else 0
      end as score
  ) scored
  where w.deleted_at is null
    and e.deleted_at is null
    and slt_private.canonical_ev_work_score(w.name,e.extra->>'project')>0
  order by w.record_key,scored.score desc,e.ordinal,e.record_key;

  insert into public.slt_projects_works(
    record_key,revision,ordinal,parent_key,child_fields,field_keys,empty_fields,string_fields,extra,
    created_at,updated_at,updated_by,deleted_at,id,name,code,status,state_code,region,area_m2
  )
  select
    'EVW-'||e.record_key,1,e.ordinal,null,array['ev'],
    array['id','nome','codigoOriginal','status','uf','regiao','area'],array[]::text[],array[]::text[],
    jsonb_build_object(
      'chaveUnica',case when coalesce(e.extra->>'code','') ~ '^[0]+$' then e.record_key else coalesce(e.extra->>'code',e.record_key) end,
      'tipoUnidade','',
      'tipologiaObra',coalesce(e.extra->>'typology',''),
      'classificacaoObra','',
      'areaConstruida',coalesce((e.extra->>'area')::numeric,0),
      'areaEquivalente',coalesce((e.extra->>'area')::numeric,0),
      '_dadosEvsOfficial',true,
      'historicalRecordId',e.record_key,
      'source','DADOS EVS'
    ),
    now(),now(),null,null,
    'EVW-'||e.record_key,
    coalesce(e.extra->>'project','EV sem nome'),
    coalesce(e.extra->>'code',''),
    'Histórico',
    coalesce((regexp_match(coalesce(e.extra->>'project',''),'[-/_]\s*(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\s*$','i'))[1],''),
    '',
    coalesce((e.extra->>'area')::numeric,0)
  from public.slt_budget_import_estimates e
  where e.deleted_at is null
  on conflict(record_key) do update set
    revision=public.slt_projects_works.revision+1,
    ordinal=excluded.ordinal,
    child_fields=excluded.child_fields,
    field_keys=excluded.field_keys,
    empty_fields=excluded.empty_fields,
    string_fields=excluded.string_fields,
    extra=excluded.extra,
    updated_at=now(),updated_by=null,deleted_at=null,
    id=excluded.id,name=excluded.name,code=excluded.code,status=excluded.status,
    state_code=excluded.state_code,region=excluded.region,area_m2=excluded.area_m2;

  update public.slt_projects_works
  set region=case state_code
    when 'AC' then 'Norte' when 'AP' then 'Norte' when 'AM' then 'Norte' when 'PA' then 'Norte' when 'RO' then 'Norte' when 'RR' then 'Norte' when 'TO' then 'Norte'
    when 'AL' then 'Nordeste' when 'BA' then 'Nordeste' when 'CE' then 'Nordeste' when 'MA' then 'Nordeste' when 'PB' then 'Nordeste' when 'PE' then 'Nordeste' when 'PI' then 'Nordeste' when 'RN' then 'Nordeste' when 'SE' then 'Nordeste'
    when 'DF' then 'Centro-Oeste' when 'GO' then 'Centro-Oeste' when 'MT' then 'Centro-Oeste' when 'MS' then 'Centro-Oeste'
    when 'ES' then 'Sudeste' when 'MG' then 'Sudeste' when 'RJ' then 'Sudeste' when 'SP' then 'Sudeste'
    when 'PR' then 'Sul' when 'RS' then 'Sul' when 'SC' then 'Sul'
    else '' end,
    updated_at=now()
  where deleted_at is null and extra->>'_dadosEvsOfficial'='true';

  update public.slt_budget_import_estimates e
  set work_id='EVW-'||e.record_key,
      field_keys=(select array_agg(distinct value order by value) from unnest(e.field_keys||array['workId']) value),
      revision=e.revision+1,updated_at=now(),updated_by=null
  where e.deleted_at is null;

  update public.slt_budget_estimate_lines set deleted_at=now(),updated_at=now(),revision=revision+1 where deleted_at is null;
  update public.slt_budget_estimate_versions set deleted_at=now(),updated_at=now(),revision=revision+1 where deleted_at is null;
  update public.slt_budget_estimates set deleted_at=now(),updated_at=now(),revision=revision+1 where deleted_at is null;

  insert into public.slt_budget_estimates(
    record_key,revision,ordinal,parent_key,child_fields,field_keys,empty_fields,string_fields,extra,
    created_at,updated_at,updated_by,deleted_at,id,status,version_number
  )
  select
    'EVW-'||e.record_key||'/one',1,0,'EVW-'||e.record_key,array['lines','versions'],
    array['id','status','versaoAtual'],array[]::text[],array[]::text[],
    jsonb_build_object('_dadosEvsOfficial',true,'historicalRecordId',e.record_key,'anexos',jsonb_build_array(),'demandaIds',jsonb_build_array(),'sicIds',jsonb_build_array()),
    now(),now(),null,null,
    'EV-'||e.record_key,'Completo',
    coalesce(((regexp_match(coalesce(e.extra->>'sourceRevision',''),'\d+'))[1])::integer,0)
  from public.slt_budget_import_estimates e
  where e.deleted_at is null;

  insert into public.slt_budget_estimate_lines(
    record_key,revision,ordinal,parent_key,child_fields,field_keys,empty_fields,string_fields,extra,
    created_at,updated_at,updated_by,deleted_at,id,discipline_id,status,budgeted_amount,contracted_amount,quantity,unit_amount
  )
  select
    'EVW-'||e.record_key||'/one/'||d.key,1,row_number() over(partition by e.record_key order by d.key)-1,
    'EVW-'||e.record_key||'/one',array[]::text[],
    array['id','disciplinaId','status','valorOrcado','valorContratado','quantidade','valorUnitario'],array[]::text[],array[]::text[],jsonb_build_object(),
    now(),now(),null,null,
    'EVL-'||e.record_key||'-'||d.key,d.key,'Orçado',(d.value #>> '{}')::numeric,0,0,0
  from public.slt_budget_import_estimates e
  cross join lateral jsonb_each(coalesce(e.extra->'disciplines','{}'::jsonb)) d
  where e.deleted_at is null;

  insert into public.slt_budget_estimate_versions(
    record_key,revision,ordinal,parent_key,child_fields,field_keys,empty_fields,string_fields,extra,
    created_at,updated_at,updated_by,deleted_at,version_number,recorded_on,origin,total_amount,cost_m2
  )
  select
    'EVW-'||e.record_key||'/one/0',1,0,'EVW-'||e.record_key||'/one',array[]::text[],
    array['numero','data','origem','valorTotal','custoM2'],array[]::text[],array[]::text[],jsonb_build_object(),
    now(),now(),null,null,
    coalesce(((regexp_match(coalesce(e.extra->>'sourceRevision',''),'\d+'))[1])::integer,0),
    case when coalesce(e.extra->>'date','') ~ '^\d{4}-\d{2}-\d{2}' then substring(e.extra->>'date',1,10)::date end,
    'Importado de DADOS EVS',coalesce(e.total_amount,(e.extra->>'total')::numeric,0),
    case when coalesce((e.extra->>'area')::numeric,0)>0 then coalesce(e.total_amount,(e.extra->>'total')::numeric,0)/(e.extra->>'area')::numeric else 0 end
  from public.slt_budget_import_estimates e
  where e.deleted_at is null;

  update public.slt_budget_demands d set work_id=m.new_key,work_name=w.name,updated_at=now(),revision=d.revision+1
  from canonical_work_map m join public.slt_projects_works w on w.record_key=m.new_key
  where d.deleted_at is null and d.work_id=m.old_key;
  update public.slt_budget_demands d set deleted_at=now(),updated_at=now(),revision=d.revision+1
  where d.deleted_at is null and d.work_id in(select record_key from canonical_old_works);

  update public.slt_budget_archived_demands d set work_id=m.new_key,work_name=w.name,updated_at=now(),revision=d.revision+1
  from canonical_work_map m join public.slt_projects_works w on w.record_key=m.new_key
  where d.deleted_at is null and d.work_id=m.old_key;
  update public.slt_budget_archived_demands d set deleted_at=now(),updated_at=now(),revision=d.revision+1
  where d.deleted_at is null and d.work_id in(select record_key from canonical_old_works);

  update public.slt_projects_demands d set work_id=m.new_key,work_name=w.name,updated_at=now(),revision=d.revision+1
  from canonical_work_map m join public.slt_projects_works w on w.record_key=m.new_key
  where d.deleted_at is null and d.work_id=m.old_key;
  update public.slt_projects_demands d set deleted_at=now(),updated_at=now(),revision=d.revision+1
  where d.deleted_at is null and d.work_id in(select record_key from canonical_old_works);

  update public.slt_projects_import_revisions r set work_id=m.new_key,updated_at=now(),revision=r.revision+1
  from canonical_work_map m where r.deleted_at is null and r.work_id=m.old_key;
  update public.slt_projects_import_revisions r set deleted_at=now(),updated_at=now(),revision=r.revision+1
  where r.deleted_at is null and r.work_id in(select record_key from canonical_old_works);

  update public.slt_budget_contracts r set work_id=m.new_key,updated_at=now(),revision=r.revision+1
  from canonical_work_map m where r.deleted_at is null and r.work_id=m.old_key;
  update public.slt_budget_contracts r set deleted_at=now(),updated_at=now(),revision=r.revision+1
  where r.deleted_at is null and r.work_id in(select record_key from canonical_old_works);

  update public.slt_budget_sics r set work_id=m.new_key,updated_at=now(),revision=r.revision+1
  from canonical_work_map m where r.deleted_at is null and r.work_id=m.old_key;
  update public.slt_budget_sics r set deleted_at=now(),updated_at=now(),revision=r.revision+1
  where r.deleted_at is null and r.work_id in(select record_key from canonical_old_works);

  update public.slt_budget_revisions r set work_id=m.new_key,updated_at=now(),revision=r.revision+1
  from canonical_work_map m where r.deleted_at is null and r.work_id=m.old_key;
  update public.slt_budget_revisions r set obra_id=m.new_key,updated_at=now(),revision=r.revision+1
  from canonical_work_map m where r.deleted_at is null and r.obra_id=m.old_key;
  update public.slt_budget_revisions r set deleted_at=now(),updated_at=now(),revision=r.revision+1
  where r.deleted_at is null and (r.work_id in(select record_key from canonical_old_works) or r.obra_id in(select record_key from canonical_old_works));

  update public.slt_finance_funds r set work_id=m.new_key,updated_at=now(),revision=r.revision+1
  from canonical_work_map m where r.deleted_at is null and r.work_id=m.old_key;
  update public.slt_finance_funds r set deleted_at=now(),updated_at=now(),revision=r.revision+1
  where r.deleted_at is null and r.work_id in(select record_key from canonical_old_works);

  update public.slt_finance_internal_orders r set work_id=m.new_key,updated_at=now(),revision=r.revision+1
  from canonical_work_map m where r.deleted_at is null and r.work_id=m.old_key;
  update public.slt_finance_internal_orders r set deleted_at=now(),updated_at=now(),revision=r.revision+1
  where r.deleted_at is null and r.work_id in(select record_key from canonical_old_works);

  update public.slt_finance_manual_orders r set work_id=m.new_key,updated_at=now(),revision=r.revision+1
  from canonical_work_map m where r.deleted_at is null and r.work_id=m.old_key;
  update public.slt_finance_manual_orders r set deleted_at=now(),updated_at=now(),revision=r.revision+1
  where r.deleted_at is null and r.work_id in(select record_key from canonical_old_works);

  update public.slt_finance_movements r set work_id=m.new_key,updated_at=now(),revision=r.revision+1
  from canonical_work_map m where r.deleted_at is null and r.work_id=m.old_key;
  update public.slt_finance_movements r set deleted_at=now(),updated_at=now(),revision=r.revision+1
  where r.deleted_at is null and r.work_id in(select record_key from canonical_old_works);

  update public.slt_projects_works w
  set deleted_at=now(),updated_at=now(),revision=w.revision+1
  where w.deleted_at is null and w.record_key in(select record_key from canonical_old_works);

  select count(*) into works_count from public.slt_projects_works where deleted_at is null;
  select count(*) into estimates_count from public.slt_budget_estimates where deleted_at is null;
  select count(*) into unlinked_count
  from public.slt_budget_import_estimates e
  left join public.slt_projects_works w on w.record_key=e.work_id and w.deleted_at is null
  left join public.slt_budget_estimates v on v.parent_key=w.record_key and v.deleted_at is null
  where e.deleted_at is null and (w.record_key is null or v.record_key is null);

  if works_count<>855 or estimates_count<>855 or unlinked_count<>0 then
    raise exception 'Migração inconsistente: obras %, EVs %, vínculos ausentes %',works_count,estimates_count,unlinked_count;
  end if;
  if exists(
    select 1 from public.slt_budget_demands d
    left join public.slt_projects_works w on w.record_key=d.work_id and w.deleted_at is null
    where d.deleted_at is null and w.record_key is null
  ) then
    raise exception 'Migração inconsistente: demanda ativa sem obra ativa';
  end if;
end $$;

drop function slt_private.canonical_ev_work_score(text,text);
drop function slt_private.canonical_ev_work_name(text);

commit;
