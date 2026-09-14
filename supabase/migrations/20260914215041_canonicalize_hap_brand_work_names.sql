begin;

select pg_advisory_xact_lock(hashtextextended('slt360/work-name-canonicalization',0));

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
    'GLP','GMD','HAP','HB','HC','HCOR','HIABC','HO','HS','HTL','HVAC','IMESA',
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

  formatted=regexp_replace(formatted,'(^|[^[:alnum:]])Hapnatal([^[:alnum:]]|$)',E'\\1HapNatal\\2','gi');
  formatted=regexp_replace(formatted,'(^|[^[:alnum:]])Hapfor([^[:alnum:]]|$)',E'\\1HapFor\\2','gi');

  return trim(regexp_replace(formatted,'\s+',' ','g'));
end $$;

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

update public.slt_budget_import_estimates estimate
set revision=estimate.revision+1,
    updated_at=now(),
    extra=jsonb_set(estimate.extra,'{project}',to_jsonb(slt_private.format_work_name(estimate.extra->>'project')),true)
where estimate.deleted_at is null
  and coalesce(estimate.extra->>'project','')<>''
  and estimate.extra->>'project' is distinct from slt_private.format_work_name(estimate.extra->>'project');

update public.slt_budget_demands demand
set revision=demand.revision+1,
    updated_at=now(),
    work_name=work.name,
    extra=case
      when jsonb_typeof(demand.extra->'sicMetadata')='object'
        then jsonb_set(demand.extra,'{sicMetadata,obraNome}',to_jsonb(work.name),true)
      else demand.extra
    end
from public.slt_projects_works work
where demand.deleted_at is null
  and work.deleted_at is null
  and demand.work_id=work.record_key
  and (demand.work_name is distinct from work.name
    or (jsonb_typeof(demand.extra->'sicMetadata')='object'
      and demand.extra->'sicMetadata'->>'obraNome' is distinct from work.name));

update public.slt_budget_archived_demands demand
set revision=demand.revision+1,
    updated_at=now(),
    work_name=work.name
from public.slt_projects_works work
where demand.deleted_at is null
  and work.deleted_at is null
  and demand.work_id=work.record_key
  and demand.work_name is distinct from work.name;

update public.slt_projects_demands demand
set revision=demand.revision+1,
    updated_at=now(),
    work_name=work.name
from public.slt_projects_works work
where demand.deleted_at is null
  and work.deleted_at is null
  and demand.work_id=work.record_key
  and demand.work_name is distinct from work.name;

do $$
begin
  if exists(
    select 1 from public.slt_projects_works
    where deleted_at is null and name<>slt_private.format_work_name(name)
  ) then
    raise exception 'Normalização inconsistente: ainda existem obras fora do padrão';
  end if;

  if exists(
    select 1 from public.slt_budget_import_estimates
    where deleted_at is null
      and coalesce(extra->>'project','')<>''
      and extra->>'project'<>slt_private.format_work_name(extra->>'project')
  ) then
    raise exception 'Normalização inconsistente: ainda existem EVs com nome de obra fora do padrão';
  end if;

  if exists(
    select 1 from public.slt_projects_works
    where deleted_at is null
      and (name~* 'hapnatal' and name!~ '(^|[^[:alnum:]])HapNatal([^[:alnum:]]|$)'
        or name~* 'hapfor' and name!~ '(^|[^[:alnum:]])HapFor([^[:alnum:]]|$)')
  ) then
    raise exception 'Normalização inconsistente: marcas HapNatal ou HapFor fora do padrão';
  end if;
end $$;

commit;
