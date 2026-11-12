begin;

-- Permite corrigir a situação de execução depois da validação de Obras. Quando
-- a SIC já existe na pauta da Diretoria, a correção é refletida no mesmo item,
-- sem mover a demanda, duplicar a SIC ou alterar valor, semana e quadro-resumo.
create or replace function slt_private.sync_sic_service_execution_correction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  validation jsonb;
  execution_status text;
  execution_details text;
  execution_updated_by text;
  service_executed jsonb;
  confirmed_at jsonb;
  shared_payload jsonb;
  rebuilt_cards jsonb;
  matching_sics integer;
begin
  if coalesce(new.type, '') not in (
       'SIC',
       'Solicitação de Informações',
       'Solicitacao de Informacoes',
       'Solicitação de Informação',
       'Solicitacao de Informacao'
     )
     or old.extra->'sicWorksValidation' is not distinct from new.extra->'sicWorksValidation'
     or (
       old.phase is distinct from new.phase
       and old.phase = 'validadoObras'
       and new.phase = 'aprovacaoDiretoria'
     ) then
    return new;
  end if;

  validation := new.extra->'sicWorksValidation';
  execution_status := coalesce(validation->>'serviceExecutionStatus', '');
  if execution_status = '' and jsonb_typeof(validation->'serviceExecuted') = 'boolean' then
    execution_status := case when (validation->>'serviceExecuted')::boolean then 'executed' else 'not_executed' end;
  end if;
  execution_details := case
    when execution_status = 'partially_executed' then trim(coalesce(validation->>'serviceExecutionDetails', ''))
    else ''
  end;

  if execution_status not in ('executed', 'not_executed', 'partially_executed') then
    raise exception 'Informe uma situação válida para a execução dos serviços da SIC'
      using errcode = '23514';
  end if;
  if execution_status = 'partially_executed' and length(execution_details) < 10 then
    raise exception 'A execução parcial da SIC exige o detalhamento das atividades executadas e pendentes'
      using errcode = '23514';
  end if;

  execution_updated_by := coalesce(
    nullif(trim(validation->>'serviceExecutionUpdatedBy'), ''),
    nullif(trim(validation->>'validatedBy'), ''),
    'Sistema'
  );
  service_executed := case
    when execution_status = 'executed' then 'true'::jsonb
    when execution_status = 'not_executed' then 'false'::jsonb
    else 'null'::jsonb
  end;
  confirmed_at := coalesce(
    validation->'serviceExecutionUpdatedAt',
    validation->'validatedAt',
    to_jsonb(now())
  );

  select state.payload
    into shared_payload
  from public.slt_budget_sic_approval_initial_state state
  where state.id = 1
  for update;

  if shared_payload is null then
    return new;
  end if;

  select count(*)::integer
    into matching_sics
  from jsonb_array_elements(coalesce(shared_payload->'obras', '[]'::jsonb)) card
  cross join lateral jsonb_array_elements(coalesce(card->'sics', '[]'::jsonb)) sic
  where sic->>'demandId' = new.record_key;

  -- Antes da ida à Diretoria ainda não existe item para sincronizar. A própria
  -- transição futura usará o status corrigido já gravado na demanda.
  if matching_sics = 0 then
    return new;
  end if;
  if matching_sics > 1 then
    raise exception 'Não foi possível sincronizar a correção com um card único da SIC'
      using errcode = '23505';
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
                    jsonb_set(
                      jsonb_set(sic.value, '{serviceExecuted}', service_executed, true),
                      '{serviceExecutionStatus}', to_jsonb(execution_status), true
                    ),
                    '{serviceExecutionDetails}', to_jsonb(execution_details), true
                  ),
                  '{serviceExecutionConfirmedAt}', confirmed_at, true
                ),
                '{serviceExecutionUpdatedBy}', to_jsonb(execution_updated_by), true
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

  update public.slt_budget_sic_approval_initial_state
  set payload = jsonb_set(shared_payload, '{obras}', rebuilt_cards, true),
      revision = revision + 1,
      updated_at = now()
  where id = 1;

  return new;
end
$$;

revoke all on function slt_private.sync_sic_service_execution_correction()
from public, anon, authenticated;

drop trigger if exists sync_sic_service_execution_correction
on public.slt_budget_demands;

create trigger sync_sic_service_execution_correction
after update of extra
on public.slt_budget_demands
for each row
execute function slt_private.sync_sic_service_execution_correction();

commit;
