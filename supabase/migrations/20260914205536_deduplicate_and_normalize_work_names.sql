begin;

select pg_advisory_xact_lock(hashtextextended('slt360/work-deduplication',0));

create or replace function slt_private.canonical_work_identity(value text)
returns text
language sql
immutable
set search_path=''
as $$
  select trim(regexp_replace(
    regexp_replace(
      regexp_replace(
        lower(translate(coalesce(value,''),
          'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
          'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC')),
        '^\s*[0-9]{1,10}\s*\.?\s*','','i'),
      '\s*-\s*(ac|al|ap|am|ba|ce|df|es|go|ma|mt|ms|mg|pa|pb|pr|pe|pi|rj|rn|rs|ro|rr|sc|sp|se|to)\s*$','','i'),
    '[^a-z0-9]+',' ','g'))
$$;

create or replace function slt_private.format_work_name(value text)
returns text
language plpgsql
immutable
set search_path=''
as $$
declare
  formatted text;
  token text;
begin
  formatted=trim(regexp_replace(
    coalesce(value,''),
    '\s*-\s*(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\s*$','','i'));
  formatted=initcap(lower(formatted));

  foreach token in array array[
    'ABA','ABC','ADM','AME','AVC','AVCB','BH','CAPS','CB','CC','CCG','CCIH','CD','CDI',
    'CEO','CER','CLI','CMD','CME','CQV','CTI','DIB','ECG','EEG','ELO','ETE','EV','FUSAM',
    'GLP','GMD','HAP','HAPFOR','HB','HC','HCOR','HIABC','HO','HS','HTL','HVAC','IMESA',
    'IPSA','IT','MP','NDI','NHE','NIR','NL','NTE','NTH','NTO','PA','PPC','PPCI','PPP',
    'PROMED','PS','PSF','RH','RM','RNM','RPA','RX','SAD','SADT','SAMU','SCI','SEALM',
    'SEMED','SF','SIC','SND','SPDA','STR','SUB','SUS','T9','TC','TEA','TI','UA','UASA',
    'UBS','UCI','UPA','USG','UTI','VI','VISA','VS'
  ] loop
    formatted=regexp_replace(
      formatted,
      '(^|[^[:alnum:]])'||token||'([^[:alnum:]]|$)',
      E'\\1'||token||E'\\2',
      'gi');
  end loop;

  foreach token in array array['a','as','com','de','da','das','do','dos','e','em','o','os','para','por','sem'] loop
    formatted=regexp_replace(
      formatted,
      '(^|[^[:alnum:]])'||token||'([^[:alnum:]]|$)',
      E'\\1'||token||E'\\2',
      'gi');
  end loop;

  return trim(regexp_replace(formatted,'\s+',' ','g'));
end $$;

create temporary table duplicate_work_map(
  old_key text primary key,
  new_key text not null,
  reason text not null
) on commit drop;

insert into duplicate_work_map(old_key,new_key,reason) values
  ('PLN-2025-3974-13AH8B3','EVW-evh-0364','mesmo nome e código 3974'),
  ('PLN-2024-3707-08NFW9H','EVW-evh-0419','mesmo nome e código 3707'),
  ('PLN-2026-9080-17OJK42','EVW-evh-0087','mesmo nome e código 9080'),
  ('PLN-2026-9084-0S57WTY','EVW-evh-0024','mesmo nome e código 9084'),
  ('PLN-2026-0000-0DXHEIY','EVW-evh-0011','mesmo nome e exercício 2026'),
  ('PLN-2023-9054-0TFQ93R','PLN-2023-9017-1QLAFJM','mesmo nome, UF e exercício 2023');

do $$
begin
  if exists(
    select 1 from duplicate_work_map m
    where ((select count(*) from public.slt_projects_works work
      where work.deleted_at is null and work.record_key in (m.old_key,m.new_key)))=1
  ) then
    raise exception 'Consolidação cancelada: uma duplicata está ativa sem sua obra oficial correspondente';
  end if;

  delete from duplicate_work_map m
  where not exists(select 1 from public.slt_projects_works work where work.record_key=m.old_key and work.deleted_at is null);

  if exists(
    select 1 from duplicate_work_map m
    join public.slt_projects_works old_work on old_work.record_key=m.old_key
    join public.slt_projects_works new_work on new_work.record_key=m.new_key
    where slt_private.canonical_work_identity(old_work.name)<>slt_private.canonical_work_identity(new_work.name)
  ) then
    raise exception 'Consolidação cancelada: os nomes deixaram de representar o mesmo escopo';
  end if;

  if exists(select 1 from duplicate_work_map m join public.slt_budget_archived_demands x on x.work_id=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_budget_contracts x on x.work_id=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_budget_demands x on x.work_id=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_budget_estimates x on x.parent_key=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_budget_import_estimates x on x.work_id=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_budget_revisions x on x.work_id=m.old_key or x.obra_id=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_budget_sics x on x.work_id=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_finance_funds x on x.work_id=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_finance_internal_orders x on x.work_id=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_finance_manual_orders x on x.work_id=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_finance_movements x on x.work_id=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_projects_demands x on x.work_id=m.old_key)
     or exists(select 1 from duplicate_work_map m join public.slt_projects_import_revisions x on x.work_id=m.old_key) then
    raise exception 'Consolidação cancelada: uma duplicata passou a possuir vínculos; revise o mapeamento antes de prosseguir';
  end if;
end $$;

update public.slt_projects_works winner
set revision=winner.revision+1,
    updated_at=now(),
    extra=winner.extra||jsonb_strip_nulls(jsonb_build_object(
      'anoObra',coalesce(nullif(winner.extra->>'anoObra',''),nullif(loser.extra->>'anoObra','')),
      'tipoUnidade',coalesce(nullif(winner.extra->>'tipoUnidade',''),nullif(loser.extra->>'tipoUnidade','')),
      'prazoDias',coalesce(nullif(winner.extra->>'prazoDias',''),nullif(loser.extra->>'prazoDias','')),
      'classificacaoObra',coalesce(nullif(winner.extra->>'classificacaoObra',''),nullif(loser.extra->>'classificacaoObra','')),
      'tipologiaObra',coalesce(nullif(winner.extra->>'tipologiaObra',''),nullif(loser.extra->>'tipologiaObra','')),
      '_pasta1Import',true,
      '_pasta1SourceRow',loser.extra->'_pasta1SourceRow',
      '_pasta1Scope',loser.extra->'_pasta1Scope',
      '_pasta1Criterion','Duplicata consolidada na obra oficial',
      '_mergedDuplicateWorkKeys',coalesce(winner.extra->'_mergedDuplicateWorkKeys','[]'::jsonb)||to_jsonb(loser.record_key)
    ))
from duplicate_work_map mapping
join public.slt_projects_works loser on loser.record_key=mapping.old_key
where winner.record_key=mapping.new_key;

update public.slt_projects_works loser
set revision=loser.revision+1,
    updated_at=now(),
    deleted_at=now(),
    status='Duplicada consolidada',
    extra=loser.extra||jsonb_build_object(
      '_mergedInto',mapping.new_key,
      '_duplicateReason',mapping.reason,
      '_archivedAsDuplicateAt',now()
    )
from duplicate_work_map mapping
where loser.record_key=mapping.old_key;

update public.slt_projects_works work
set revision=work.revision+1,
    updated_at=now(),
    name=slt_private.format_work_name(work.name),
    unit_name=case
      when slt_private.canonical_work_identity(work.unit_name)=slt_private.canonical_work_identity(work.name)
        then slt_private.format_work_name(work.unit_name)
      else work.unit_name
    end,
    extra=case
      when slt_private.canonical_work_identity(work.extra->>'unidadeNome')=slt_private.canonical_work_identity(work.name)
        then jsonb_set(work.extra,'{unidadeNome}',to_jsonb(slt_private.format_work_name(work.extra->>'unidadeNome')),true)
      else work.extra
    end
where work.deleted_at is null
  and (work.name is distinct from slt_private.format_work_name(work.name)
    or (slt_private.canonical_work_identity(work.unit_name)=slt_private.canonical_work_identity(work.name)
      and work.unit_name is distinct from slt_private.format_work_name(work.unit_name))
    or (slt_private.canonical_work_identity(work.extra->>'unidadeNome')=slt_private.canonical_work_identity(work.name)
      and work.extra->>'unidadeNome' is distinct from slt_private.format_work_name(work.extra->>'unidadeNome')));

with source as (
  select distinct on (estimate.work_id)
    estimate.work_id,
    substring(estimate.extra->>'date',1,4) work_year
  from public.slt_budget_import_estimates estimate
  where estimate.deleted_at is null
    and estimate.extra->>'date'~'^\d{4}-\d{2}-\d{2}'
  order by estimate.work_id,estimate.ordinal desc
)
update public.slt_projects_works work
set revision=work.revision+1,
    updated_at=now(),
    extra=jsonb_set(work.extra,'{anoObra}',to_jsonb(source.work_year),true)
from source
where work.deleted_at is null
  and source.work_id=work.record_key
  and coalesce(work.extra->>'anoObra','')=''
  and source.work_year<>'';

create or replace function slt_private.normalize_work_name_on_write()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  new.name=slt_private.format_work_name(new.name);
  if new.unit_name is null or btrim(new.unit_name)='' then
    new.unit_name=new.name;
  end if;
  return new;
end $$;

drop trigger if exists normalize_work_name_on_write on public.slt_projects_works;
create trigger normalize_work_name_on_write
before insert or update of name on public.slt_projects_works
for each row execute function slt_private.normalize_work_name_on_write();

set constraints all immediate;

drop index if exists public.slt_projects_works_unique_named_code;
drop index if exists public.slt_projects_works_unique_uncoded_scope;
create unique index if not exists slt_projects_works_unique_name_year
on public.slt_projects_works(
  slt_private.canonical_work_identity(name),
  coalesce(extra->>'anoObra','')
)
where deleted_at is null;

do $$
begin
  if (select count(*) from public.slt_projects_works where deleted_at is null and record_key in (select old_key from duplicate_work_map))<>0 then
    raise exception 'Consolidação inconsistente: ainda existem duplicatas ativas';
  end if;
  if (select count(*) from public.slt_projects_works where deleted_at is null and record_key in (select new_key from duplicate_work_map))<>(select count(*) from duplicate_work_map) then
    raise exception 'Consolidação inconsistente: uma obra oficial foi removida';
  end if;
  if exists(
    select 1 from public.slt_projects_works
    where deleted_at is null
      and name<>slt_private.format_work_name(name)
  ) then
    raise exception 'Normalização inconsistente: ainda existem nomes fora do padrão';
  end if;
end $$;

commit;
