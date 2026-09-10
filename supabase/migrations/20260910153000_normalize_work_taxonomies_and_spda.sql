select pg_advisory_xact_lock(hashtextextended('slt360:normalize-work-taxonomies-and-spda', 0));

create temporary table slt_normalization_totals on commit drop as
select
  coalesce(sum(budgeted_amount), 0) as budgeted_amount,
  coalesce(sum(contracted_amount), 0) as contracted_amount
from public.slt_budget_estimate_lines
where deleted_at is null;

create function pg_temp.normalize_ev_items(items jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(items) <> 'array' then items
    else coalesce((
      select jsonb_agg(
        case
          when item->>'disciplineId' = 'instalacoes-de-spda' then
            jsonb_set(
              jsonb_set(item, '{disciplineId}', to_jsonb('instalacoes-eletricas-e-spda'::text), false),
              '{description}',
              to_jsonb('Instalações Elétricas e SPDA'::text),
              true
            )
          else item
        end
        order by ordinal
      )
      from jsonb_array_elements(items) with ordinality as source(item, ordinal)
    ), '[]'::jsonb)
  end;
$$;

create function pg_temp.normalize_ev_payload(payload jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized jsonb := payload;
  disciplines jsonb;
  combined_amount numeric;
begin
  if jsonb_typeof(payload) <> 'object' then
    return payload;
  end if;

  if jsonb_typeof(payload->'items') = 'array' then
    normalized := jsonb_set(normalized, '{items}', pg_temp.normalize_ev_items(payload->'items'), false);
  end if;
  if jsonb_typeof(payload->'sicItems') = 'array' then
    normalized := jsonb_set(normalized, '{sicItems}', pg_temp.normalize_ev_items(payload->'sicItems'), false);
  end if;

  disciplines := payload->'disciplines';
  if jsonb_typeof(disciplines) = 'object' and disciplines ? 'instalacoes-de-spda' then
    combined_amount := coalesce((disciplines->>'instalacoes-eletricas-e-spda')::numeric, 0)
      + coalesce((disciplines->>'instalacoes-de-spda')::numeric, 0);
    disciplines := jsonb_set(
      disciplines - 'instalacoes-de-spda',
      '{instalacoes-eletricas-e-spda}',
      to_jsonb(combined_amount),
      true
    );
    normalized := jsonb_set(normalized, '{disciplines}', disciplines, false);
  end if;

  return normalized;
end;
$$;

with normalized as (
  select
    record_key,
    case lower(btrim(coalesce(extra->>'classificacaoObra', '')))
      when 'histórico importado' then ''
      when 'historico importado' then ''
      when 'não informada' then ''
      when 'nao informada' then ''
      when 'não informado' then ''
      when 'nao informado' then ''
      when 'ambiental' then ''
      when 'venda de serviço' then 'Venda de Serviço'
      when 'venda de servico' then 'Venda de Serviço'
      when 'venda de serviços' then 'Venda de Serviço'
      when 'venda de servicos' then 'Venda de Serviço'
      when 'adequação regulatória' then 'Adequação Regulatória'
      when 'adequacao regulatoria' then 'Adequação Regulatória'
      when 'eficiência operacional' then 'Eficiência Operacional'
      when 'eficiencia operacional' then 'Eficiência Operacional'
      when 'fachada' then 'Fachada'
      when 'obra emergencial' then 'Obra Emergencial'
      when 'obra estratégica' then 'Obra Estratégica'
      when 'obra estrategica' then 'Obra Estratégica'
      when 'suficiência de rede' then 'Suficiência de Rede'
      when 'suficiencia de rede' then 'Suficiência de Rede'
      when 'verticalização' then 'Verticalização'
      when 'verticalizacao' then 'Verticalização'
      when 'padronização de unidade' then 'Padronização de Unidade'
      when 'padronizacao de unidade' then 'Padronização de Unidade'
      when 'risco assistencial' then 'Risco Assistencial'
      else btrim(coalesce(extra->>'classificacaoObra', ''))
    end as category,
    case lower(btrim(coalesce(extra->>'tipologiaObra', '')))
      when 'nova unidade' then 'Nova Unidade'
      when 'retrofit' then 'Retrofit'
      when 'ampliação' then 'Ampliação UE'
      when 'ampliacao' then 'Ampliação UE'
      when 'ampliação ue' then 'Ampliação UE'
      when 'ampliacao ue' then 'Ampliação UE'
      else ''
    end as typology,
    case
      when upper(btrim(coalesce(state_code, ''))) = any(array[
        'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
        'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
      ]) then upper(btrim(state_code))
      else ''
    end as state_code
  from public.slt_projects_works
  where deleted_at is null
), with_region as (
  select *, case
    when state_code = any(array['AC','AP','AM','PA','RO','RR','TO']) then 'Norte'
    when state_code = any(array['AL','BA','CE','MA','PB','PE','PI','RN','SE']) then 'Nordeste'
    when state_code = any(array['DF','GO','MT','MS']) then 'Centro Oeste'
    when state_code = any(array['ES','MG','RJ','SP']) then 'Sudeste'
    when state_code = any(array['PR','RS','SC']) then 'Sul'
    else null
  end as canonical_region
  from normalized
)
update public.slt_projects_works as work
set
  extra = work.extra || jsonb_build_object(
    'classificacaoObra', normalized.category,
    'tipologiaObra', normalized.typology
  ),
  state_code = normalized.state_code,
  region = coalesce(normalized.canonical_region, work.region),
  revision = work.revision + 1,
  updated_at = now()
from with_region as normalized
where work.record_key = normalized.record_key
  and (
    work.extra->>'classificacaoObra' is distinct from normalized.category
    or work.extra->>'tipologiaObra' is distinct from normalized.typology
    or work.state_code is distinct from normalized.state_code
    or (normalized.canonical_region is not null and work.region is distinct from normalized.canonical_region)
  );

update public.slt_core_configuration_catalog
set
  label = case record_key
    when 'typology/default-1' then 'Nova Unidade'
    when 'typology/default-2' then 'Retrofit'
    when 'typology/default-3' then 'Ampliação UE'
  end,
  position = case record_key
    when 'typology/default-1' then 1
    when 'typology/default-2' then 2
    when 'typology/default-3' then 3
  end,
  ordinal = case record_key
    when 'typology/default-1' then 0
    when 'typology/default-2' then 1
    when 'typology/default-3' then 2
  end,
  extra = extra || '{"active":true}'::jsonb,
  deleted_at = null,
  revision = revision + 1,
  updated_at = now()
where catalog_type = 'typology'
  and record_key in ('typology/default-1', 'typology/default-2', 'typology/default-3');

update public.slt_core_configuration_catalog
set deleted_at = coalesce(deleted_at, now()), revision = revision + 1, updated_at = now()
where catalog_type = 'typology'
  and record_key not in ('typology/default-1', 'typology/default-2', 'typology/default-3')
  and deleted_at is null;

update public.slt_core_configuration_catalog
set label = 'Venda de Serviço', revision = revision + 1, updated_at = now()
where catalog_type = 'category'
  and lower(btrim(label)) in ('venda de serviço', 'venda de servico', 'venda de serviços', 'venda de servicos')
  and label is distinct from 'Venda de Serviço'
  and deleted_at is null;

update public.slt_core_configuration_catalog
set deleted_at = coalesce(deleted_at, now()), revision = revision + 1, updated_at = now()
where catalog_type = 'category'
  and lower(btrim(label)) in (
    'histórico importado', 'historico importado', 'não informada', 'nao informada',
    'não informado', 'nao informado', 'ambiental'
  )
  and deleted_at is null;

update public.slt_core_configuration_catalog
set deleted_at = coalesce(deleted_at, now()), revision = revision + 1, updated_at = now()
where catalog_type = 'discipline'
  and (code in ('instalacoes-de-spda', 'instalacoes-spda') or lower(btrim(label)) = 'instalações de spda')
  and deleted_at is null;

update public.slt_core_configuration_catalog
set label = 'Instalações Elétricas e SPDA', code = 'instalacoes-eletricas-e-spda', revision = revision + 1, updated_at = now()
where catalog_type = 'discipline'
  and (code = 'instalacoes-eletricas-e-spda' or lower(btrim(label)) = 'instalações elétricas e spda')
  and deleted_at is null
  and (label is distinct from 'Instalações Elétricas e SPDA' or code is distinct from 'instalacoes-eletricas-e-spda');

update public.slt_core_configuration_catalog
set label = upper(btrim(code)), code = upper(btrim(code)), revision = revision + 1, updated_at = now()
where catalog_type = 'state'
  and upper(btrim(coalesce(code, ''))) = any(array[
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
    'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  ])
  and (label is distinct from upper(btrim(code)) or code is distinct from upper(btrim(code)))
  and deleted_at is null;

update public.slt_core_configuration_catalog
set deleted_at = coalesce(deleted_at, now()), revision = revision + 1, updated_at = now()
where catalog_type = 'state'
  and upper(btrim(coalesce(code, ''))) <> all(array[
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
    'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  ])
  and deleted_at is null;

update public.slt_budget_estimate_lines as target
set
  budgeted_amount = coalesce(target.budgeted_amount, 0) + coalesce(source.budgeted_amount, 0),
  contracted_amount = coalesce(target.contracted_amount, 0) + coalesce(source.contracted_amount, 0),
  quantity = coalesce(target.quantity, 0) + coalesce(source.quantity, 0),
  unit_amount = coalesce(target.unit_amount, 0) + coalesce(source.unit_amount, 0),
  revision = greatest(target.revision, source.revision) + 1,
  updated_at = now()
from public.slt_budget_estimate_lines as source
where source.discipline_id = 'instalacoes-de-spda'
  and source.deleted_at is null
  and target.record_key = replace(source.record_key, 'instalacoes-de-spda', 'instalacoes-eletricas-e-spda')
  and target.deleted_at is null;

update public.slt_budget_estimate_lines as source
set deleted_at = now(), revision = source.revision + 1, updated_at = now()
where source.discipline_id = 'instalacoes-de-spda'
  and source.deleted_at is null
  and exists (
    select 1
    from public.slt_budget_estimate_lines as target
    where target.record_key = replace(source.record_key, 'instalacoes-de-spda', 'instalacoes-eletricas-e-spda')
      and target.deleted_at is null
  );

update public.slt_budget_estimate_lines
set
  record_key = replace(record_key, 'instalacoes-de-spda', 'instalacoes-eletricas-e-spda'),
  id = replace(id, 'instalacoes-de-spda', 'instalacoes-eletricas-e-spda'),
  discipline_id = 'instalacoes-eletricas-e-spda',
  revision = revision + 1,
  updated_at = now()
where discipline_id = 'instalacoes-de-spda'
  and deleted_at is null;

update public.slt_budget_import_estimates
set
  extra = pg_temp.normalize_ev_payload(extra),
  revision = revision + 1,
  updated_at = now()
where deleted_at is null
  and extra::text like '%instalacoes-de-spda%';

update public.slt_budget_historical_ev_details
set items = pg_temp.normalize_ev_items(items), updated_at = now()
where items::text like '%instalacoes-de-spda%';

do $$
declare
  before_budgeted numeric;
  before_contracted numeric;
  after_budgeted numeric;
  after_contracted numeric;
begin
  select budgeted_amount, contracted_amount
  into before_budgeted, before_contracted
  from slt_normalization_totals;

  select coalesce(sum(budgeted_amount), 0), coalesce(sum(contracted_amount), 0)
  into after_budgeted, after_contracted
  from public.slt_budget_estimate_lines
  where deleted_at is null;

  if before_budgeted is distinct from after_budgeted or before_contracted is distinct from after_contracted then
    raise exception 'A consolidação de SPDA alteraria os totais financeiros das linhas de EV';
  end if;

  if exists (
    select 1 from public.slt_projects_works
    where deleted_at is null
      and coalesce(extra->>'tipologiaObra', '') not in ('', 'Nova Unidade', 'Retrofit', 'Ampliação UE')
  ) then
    raise exception 'Ainda existem tipologias de obra fora da configuração permitida';
  end if;

  if exists (
    select 1 from public.slt_projects_works
    where deleted_at is null
      and lower(btrim(coalesce(extra->>'classificacaoObra', ''))) in (
        'histórico importado', 'historico importado', 'não informada', 'nao informada',
        'não informado', 'nao informado', 'ambiental', 'venda de serviços', 'venda de servicos'
      )
  ) then
    raise exception 'Ainda existem categorias de obra que deveriam ter sido removidas ou unificadas';
  end if;

  if exists (
    select 1 from public.slt_projects_works
    where deleted_at is null
      and coalesce(state_code, '') <> ''
      and state_code <> all(array[
        'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
        'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
      ])
  ) then
    raise exception 'Ainda existem estados fora do formato de sigla';
  end if;

  if exists (
    select 1 from public.slt_budget_estimate_lines
    where deleted_at is null and discipline_id = 'instalacoes-de-spda'
  ) or exists (
    select 1 from public.slt_budget_import_estimates
    where deleted_at is null and extra::text like '%instalacoes-de-spda%'
  ) or exists (
    select 1 from public.slt_budget_historical_ev_details
    where items::text like '%instalacoes-de-spda%'
  ) then
    raise exception 'Ainda existem referências ativas à disciplina Instalações de SPDA';
  end if;
end;
$$;
