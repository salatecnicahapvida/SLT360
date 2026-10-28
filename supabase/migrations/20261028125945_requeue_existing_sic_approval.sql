begin;

-- Uma SIC pode voltar da Diretoria para Validação de Obras para revisão de
-- valor. Ao ser reenviada, a entrada existente deve ser reutilizada: o quadro
-- resumo e o histórico permanecem no mesmo registro e somente os dados
-- operacionais revisados são sincronizados.

create or replace function slt_private.sic_requeue_was_handled(p_record_key text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    current_setting('slt360.sic_requeue_' || md5(coalesce(p_record_key, '')), true),
    ''
  ) = '1'
$$;

revoke all on function slt_private.sic_requeue_was_handled(text)
from public, anon, authenticated;

create or replace function slt_private.reuse_pending_sic_for_director_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  queue jsonb;
  shared_payload jsonb;
  week jsonb;
  card jsonb;
  existing_sic jsonb;
  snapshot jsonb;
  event jsonb;
  card_index integer;
  sic_index integer;
  week_id text;
  week_label text;
  week_status text;
  selected_card_id text;
  lecom text;
  sic_description text;
  source_week_id text;
  old_value numeric;
  new_value numeric;
  prior_invoices numeric;
  assigned_amount numeric;
  committed_amount numeric;
  balance_amount numeric;
  card_total numeric;
  current_last_start text;
  target_start text;
  excluded_week_ids jsonb;
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

  queue := new.extra->'sicDirectorApproval';
  if jsonb_typeof(queue) <> 'object'
     or coalesce((queue->>'version')::integer, 0) <> 1 then
    return new;
  end if;

  select state.payload
    into shared_payload
  from public.slt_budget_sic_approval_initial_state state
  where state.id = 1
  for update;

  if shared_payload is null then
    return new;
  end if;

  select obra.value, obra.ordinality::integer, sic.value, sic.ordinality::integer
    into card, card_index, existing_sic, sic_index
  from jsonb_array_elements(coalesce(shared_payload->'obras', '[]'::jsonb))
    with ordinality obra(value, ordinality)
  cross join lateral jsonb_array_elements(coalesce(obra.value->'sics', '[]'::jsonb))
    with ordinality sic(value, ordinality)
  where sic.value->>'demandId' = new.record_key
     or sic.value->>'id' = 'kanban-' || md5(new.record_key)
  order by case when sic.value->>'demandId' = new.record_key then 0 else 1 end,
           obra.ordinality,
           sic.ordinality
  limit 1;

  -- Não é um reenvio: o gatilho original criará a SIC normalmente.
  if existing_sic is null then
    return new;
  end if;

  if lower(coalesce(existing_sic->>'status', 'pendente')) <> 'pendente' then
    raise exception 'A SIC já possui uma decisão na Aprovação da Diretoria. Desfaça a decisão antes de reenviá-la'
      using errcode = '23514';
  end if;

  if nullif(card->>'portfolioWorkId', '') is not null
     and card->>'portfolioWorkId' <> new.work_id then
    raise exception 'A SIC existente está vinculada a outra obra do portfólio'
      using errcode = '23514';
  end if;

  selected_card_id := nullif(btrim(queue->>'approvalCardId'), '');
  if selected_card_id is not null and selected_card_id <> card->>'id' then
    raise exception 'A SIC já pertence ao card % e deve ser reenviada pelo mesmo vínculo', card->>'descricao'
      using errcode = '23514';
  end if;
  selected_card_id := card->>'id';
  new.extra := jsonb_set(
    new.extra,
    '{sicDirectorApproval,approvalCardId}',
    to_jsonb(selected_card_id),
    true
  );

  if jsonb_typeof(queue->'sicValue') <> 'number'
     or jsonb_typeof(queue->'priorInvoices') <> 'number'
     or jsonb_typeof(queue->'assignedAmount') <> 'number'
     or jsonb_typeof(queue->'committedAmount') <> 'number' then
    raise exception 'Os valores financeiros da Aprovação de SICs estão incompletos'
      using errcode = '23514';
  end if;

  week_id := nullif(btrim(queue->>'weekId'), '');
  if week_id is null then
    raise exception 'Escolha manualmente a semana de apresentação da SIC'
      using errcode = '23514';
  end if;

  select item.value
    into week
  from jsonb_array_elements(coalesce(shared_payload->'weeks', '[]'::jsonb)) item(value)
  where item.value->>'id' = week_id;

  if week is null then
    raise exception 'A semana selecionada não existe mais. Recarregue e escolha novamente'
      using errcode = '23514';
  end if;
  week_status := lower(coalesce(
    week->>'status',
    case when coalesce((week->>'placeholder')::boolean, false) then 'provisional' else 'open' end
  ));
  if week_status = 'closed' then
    raise exception 'A semana selecionada está encerrada e não aceita novas SICs'
      using errcode = '23514';
  end if;
  week_label := coalesce(nullif(week->>'label', ''), 'Semana');

  source_week_id := existing_sic->>'weekId';
  old_value := round(coalesce((existing_sic->>'valor')::numeric, 0), 2);
  new_value := round((queue->>'sicValue')::numeric, 2);
  lecom := coalesce(
    nullif(btrim(new.extra#>>'{sicMetadata,lecomNumber}'), ''),
    nullif(btrim(new.extra#>>'{sicMetadata,numeroSic}'), ''),
    nullif(btrim(existing_sic->>'lecom'), ''),
    new.record_key
  );
  sic_description := coalesce(
    nullif(btrim(new.extra#>>'{sicMetadata,descricaoSic}'), ''),
    nullif(btrim(new.notes), ''),
    nullif(btrim(existing_sic->>'descricao'), ''),
    coalesce(new.title, 'SIC')
  );

  existing_sic := jsonb_set(existing_sic, '{demandId}', to_jsonb(new.record_key), true);
  existing_sic := jsonb_set(existing_sic, '{portfolioWorkId}', to_jsonb(new.work_id), true);
  existing_sic := jsonb_set(existing_sic, '{lecom}', to_jsonb(lecom), true);
  existing_sic := jsonb_set(existing_sic, '{descricao}', to_jsonb(sic_description), true);
  existing_sic := jsonb_set(existing_sic, '{valor}', to_jsonb(new_value), true);
  existing_sic := jsonb_set(existing_sic, '{weekId}', to_jsonb(week_id), true);
  existing_sic := jsonb_set(existing_sic, '{statusUpdatedAt}', to_jsonb(now()), true);
  existing_sic := jsonb_set(
    existing_sic,
    '{fingerprint}',
    to_jsonb(md5(new.record_key || '|' || week_id || '|' || lecom)),
    true
  );

  card := jsonb_set(card, '{portfolioWorkId}', to_jsonb(new.work_id), true);
  card := jsonb_set(card, array['sics', (sic_index - 1)::text], existing_sic, false);

  excluded_week_ids := coalesce(card->'excludedWeekIds', '[]'::jsonb);
  select coalesce(jsonb_agg(to_jsonb(item.value) order by item.ordinality), '[]'::jsonb)
    into excluded_week_ids
  from jsonb_array_elements_text(excluded_week_ids)
    with ordinality item(value, ordinality)
  where item.value <> week_id;
  card := jsonb_set(card, '{excludedWeekIds}', excluded_week_ids, true);

  select item.value
    into snapshot
  from jsonb_array_elements(coalesce(shared_payload->'snapshots', '[]'::jsonb)) item(value)
  where item.value->>'obraId' = selected_card_id
    and item.value->>'weekId' = week_id;

  card_total := coalesce((card#>>'{ev,total}')::numeric, 0);
  if snapshot is null then
    prior_invoices := (queue->>'priorInvoices')::numeric;
    assigned_amount := (queue->>'assignedAmount')::numeric;
    committed_amount := (queue->>'committedAmount')::numeric;
    balance_amount := round(assigned_amount - committed_amount, 2);
    snapshot := jsonb_build_object(
      'weekId', week_id,
      'obraId', selected_card_id,
      'ev', card->'ev',
      'sap', jsonb_build_object(
        'faturasAnosAnteriores', prior_invoices,
        'atribuidoAtual', assigned_amount,
        'comprometidoAtual', committed_amount,
        'saldoAtual', balance_amount,
        'diffEV', round(prior_invoices + assigned_amount - card_total, 2)
      ),
      'alerts', '[]'::jsonb,
      'capturedAt', to_jsonb(now()),
      'updatedAt', to_jsonb(now())
    );
    shared_payload := jsonb_set(
      shared_payload,
      '{snapshots}',
      coalesce(shared_payload->'snapshots', '[]'::jsonb) || jsonb_build_array(snapshot),
      false
    );
  end if;

  event := jsonb_build_object(
    'id', 'evt-requeue-' || md5(new.record_key || '|' || week_id || '|' || clock_timestamp()::text),
    'type', 'sic_requeued',
    'sicId', existing_sic->>'id',
    'demandId', new.record_key,
    'amount', new_value,
    'previousAmount', old_value,
    'weekId', week_id,
    'weekLabel', week_label,
    'sourceWeekId', source_week_id,
    'at', to_jsonb(now()),
    'text', case
      when old_value = new_value then format(
        'SIC/Revisão %s reenviada pelo Kanban para %s; valor conferido e mantido em %s.',
        lecom, week_label, new_value
      )
      else format(
        'SIC/Revisão %s reenviada pelo Kanban para %s; valor sincronizado de %s para %s.',
        lecom, week_label, old_value, new_value
      )
    end
  );
  card := jsonb_set(
    card,
    '{historyEvents}',
    coalesce(card->'historyEvents', '[]'::jsonb) || jsonb_build_array(event),
    true
  );

  select candidate->>'start'
    into current_last_start
  from jsonb_array_elements(coalesce(shared_payload->'weeks', '[]'::jsonb)) candidate
  where candidate->>'id' = card->>'lastWeekId';
  target_start := coalesce(week->>'start', '');
  if current_last_start is null or target_start >= current_last_start then
    card := jsonb_set(card, '{lastWeekId}', to_jsonb(week_id), true);
    card := jsonb_set(card, '{sap}', snapshot->'sap', true);
  end if;

  shared_payload := jsonb_set(
    shared_payload,
    array['obras', (card_index - 1)::text],
    card,
    false
  );
  update public.slt_budget_sic_approval_initial_state
  set payload = shared_payload,
      revision = revision + 1,
      updated_at = now()
  where id = 1;

  perform set_config(
    'slt360.sic_requeue_' || md5(new.record_key),
    '1',
    true
  );
  return new;
end
$$;

revoke all on function slt_private.reuse_pending_sic_for_director_approval()
from public, anon, authenticated;

drop trigger if exists handle_existing_sic_requeue
on public.slt_budget_demands;

-- O nome começa com "handle" para executar antes de
-- prepare_excluded_sic_requeue (gatilhos do mesmo tipo seguem ordem alfabética).
create trigger handle_existing_sic_requeue
before update of phase, extra, work_id
on public.slt_budget_demands
for each row
execute function slt_private.reuse_pending_sic_for_director_approval();

drop trigger if exists queue_sic_for_director_approval
on public.slt_budget_demands;

create trigger queue_sic_for_director_approval
after update of phase, extra, work_id
on public.slt_budget_demands
for each row
when (not slt_private.sic_requeue_was_handled(new.record_key))
execute function slt_private.queue_sic_for_director_approval();

commit;
