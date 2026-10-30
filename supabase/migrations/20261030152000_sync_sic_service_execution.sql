begin;

-- Toda nova validação de Obras deve registrar, além do valor, se o serviço da
-- SIC já foi executado. O dado permanece no JSON auditável da demanda.
create or replace function slt_private.require_sic_service_execution()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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
    if jsonb_typeof(new.extra->'sicWorksValidation') is distinct from 'object'
       or jsonb_typeof(new.extra#>'{sicWorksValidation,amount}') is distinct from 'number'
       or jsonb_typeof(new.extra#>'{sicWorksValidation,serviceExecuted}') is distinct from 'boolean' then
      raise exception 'Informe o valor da SIC e se o serviço já foi executado antes de validar por Obras'
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

-- O gatilho de enfileiramento cria/atualiza a SIC na pauta da Diretoria. Este
-- segundo gatilho, executado depois dele na mesma transação, copia a situação
-- de execução para o item correto sem alterar semana, valor ou quadro-resumo.
create or replace function slt_private.sync_sic_service_execution()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
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

  service_executed := new.extra#>'{sicWorksValidation,serviceExecuted}';
  if jsonb_typeof(service_executed) is distinct from 'boolean' then
    -- Compatibilidade com SICs históricas que já estavam em Validado Obras
    -- antes da criação deste preenchimento.
    return new;
  end if;
  confirmed_at := coalesce(new.extra#>'{sicWorksValidation,validatedAt}', to_jsonb(now()));

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
                jsonb_set(sic.value, '{serviceExecuted}', service_executed, true),
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
