begin;

-- A validação de Obras passa a aceitar três situações de execução, mantendo
-- compatibilidade com os registros antigos que armazenavam apenas booleano.
create or replace function slt_private.require_sic_service_execution()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  validation jsonb;
  execution_status text;
  execution_details text;
begin
  if old.phase is distinct from new.phase
     and old.phase = 'validacaoObras'
     and new.phase = 'validadoObras'
     and coalesce(new.type, '') in (
       'SIC',
       'Solicitação de Informações',
       'Solicitacao de Informacoes',
       'Solicitação de Informação',
       'Solicitacao de Informacao'
     ) then
    validation := new.extra->'sicWorksValidation';
    execution_status := coalesce(validation->>'serviceExecutionStatus', '');
    if execution_status = '' and jsonb_typeof(validation->'serviceExecuted') = 'boolean' then
      execution_status := case when (validation->>'serviceExecuted')::boolean then 'executed' else 'not_executed' end;
    end if;
    execution_details := trim(coalesce(validation->>'serviceExecutionDetails', ''));

    if jsonb_typeof(validation) is distinct from 'object'
       or jsonb_typeof(validation->'amount') is distinct from 'number'
       or execution_status not in ('executed', 'not_executed', 'partially_executed') then
      raise exception 'Informe o valor da SIC e a situação de execução dos serviços antes de validar por Obras'
        using errcode = '23514';
    end if;
    if execution_status = 'partially_executed' and length(execution_details) < 10 then
      raise exception 'Descreva quais atividades da SIC foram executadas e quais ainda não foram executadas'
        using errcode = '23514';
    end if;
  end if;

  return new;
end
$$;

revoke all on function slt_private.require_sic_service_execution()
from public, anon, authenticated;

drop trigger if exists require_sic_service_execution
on public.slt_budget_demands;

create trigger require_sic_service_execution
before update of phase, extra
on public.slt_budget_demands
for each row
execute function slt_private.require_sic_service_execution();

-- Copia o status canônico e, quando parcial, seu detalhamento para a SIC
-- correta da pauta da Diretoria sem alterar semana, valor ou quadro-resumo.
create or replace function slt_private.sync_sic_service_execution()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  validation jsonb;
  execution_status text;
  execution_details text;
  service_executed jsonb;
  confirmed_at jsonb;
  shared_payload jsonb;
  rebuilt_cards jsonb;
  matching_sics integer;
begin
  if old.phase is not distinct from new.phase
     or old.phase <> 'validadoObras'
     or new.phase <> 'aprovacaoDiretoria'
     or coalesce(new.type, '') not in (
       'SIC',
       'Solicitação de Informações',
       'Solicitacao de Informacoes',
       'Solicitação de Informação',
       'Solicitacao de Informacao'
     ) then
    return new;
  end if;

  validation := new.extra->'sicWorksValidation';
  execution_status := coalesce(validation->>'serviceExecutionStatus', '');
  if execution_status = '' and jsonb_typeof(validation->'serviceExecuted') = 'boolean' then
    execution_status := case when (validation->>'serviceExecuted')::boolean then 'executed' else 'not_executed' end;
  end if;
  if execution_status not in ('executed', 'not_executed', 'partially_executed') then
    return new;
  end if;
  execution_details := case
    when execution_status = 'partially_executed' then trim(coalesce(validation->>'serviceExecutionDetails', ''))
    else ''
  end;
  if execution_status = 'partially_executed' and length(execution_details) < 10 then
    raise exception 'A execução parcial da SIC exige o detalhamento das atividades executadas e pendentes'
      using errcode = '23514';
  end if;
  service_executed := case
    when execution_status = 'executed' then 'true'::jsonb
    when execution_status = 'not_executed' then 'false'::jsonb
    else 'null'::jsonb
  end;
  confirmed_at := coalesce(validation->'validatedAt', to_jsonb(now()));

  select state.payload
    into shared_payload
  from public.slt_budget_sic_approval_initial_state state
  where state.id = 1
  for update;

  if shared_payload is null then
    raise exception 'A base compartilhada de Aprovação de SICs não está disponível'
      using errcode = '55000';
  end if;

  select count(*)::integer
    into matching_sics
  from jsonb_array_elements(coalesce(shared_payload->'obras', '[]'::jsonb)) card
  cross join lateral jsonb_array_elements(coalesce(card->'sics', '[]'::jsonb)) sic
  where sic->>'demandId' = new.record_key;

  if matching_sics <> 1 then
    raise exception 'Não foi possível sincronizar a execução do serviço com o card único da SIC'
      using errcode = case when matching_sics = 0 then '23503' else '23505' end;
  end if;

  select coalesce(jsonb_agg(
    jsonb_set(
      card.value,
      '{sics}',
      (
        select coalesce(jsonb_agg(
          case
            when sic.value->>'demandId' = new.record_key then
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    jsonb_set(sic.value, '{serviceExecuted}', service_executed, true),
                    '{serviceExecutionStatus}', to_jsonb(execution_status), true
                  ),
                  '{serviceExecutionDetails}', to_jsonb(execution_details), true
                ),
                '{serviceExecutionConfirmedAt}', confirmed_at, true
              )
            else sic.value
          end
          order by sic.ordinality
        ), '[]'::jsonb)
        from jsonb_array_elements(coalesce(card.value->'sics', '[]'::jsonb))
          with ordinality sic(value, ordinality)
      ),
      true
    )
    order by card.ordinality
  ), '[]'::jsonb)
    into rebuilt_cards
  from jsonb_array_elements(coalesce(shared_payload->'obras', '[]'::jsonb))
    with ordinality card(value, ordinality);

  shared_payload := jsonb_set(shared_payload, '{obras}', rebuilt_cards, true);

  update public.slt_budget_sic_approval_initial_state
  set payload = shared_payload,
      revision = revision + 1,
      updated_at = now()
  where id = 1;

  return new;
end
$$;

revoke all on function slt_private.sync_sic_service_execution()
from public, anon, authenticated;

drop trigger if exists sync_sic_service_execution
on public.slt_budget_demands;

create trigger sync_sic_service_execution
after update of phase, extra, work_id
on public.slt_budget_demands
for each row
execute function slt_private.sync_sic_service_execution();

commit;
