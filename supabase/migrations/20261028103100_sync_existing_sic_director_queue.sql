begin;

-- Reenvio idempotente de SICs: se a demanda já está na pauta da Diretoria,
-- sincroniza o valor no card existente sem apagar o quadro-resumo.
CREATE OR REPLACE FUNCTION slt_private.queue_sic_for_director_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  queue jsonb;
  shared_payload jsonb;
  week jsonb;
  week_index integer;
  week_status text;
  work_row public.slt_projects_works%rowtype;
  card jsonb;
  card_index integer;
  snapshot jsonb;
  snapshot_index integer;
  sic jsonb;
  event jsonb;
  card_id text;
  week_id text;
  week_label text;
  lecom text;
  sic_description text;
  oi_raw text;
  classification text;
  current_last_start text;
  portfolio_total numeric := 0;
  portfolio_additives numeric := 0;
  portfolio_area numeric := 0;
  card_total numeric := 0;
  prior_invoices numeric;
  assigned_amount numeric;
  committed_amount numeric;
  balance_amount numeric;
  is_new_card boolean := false;
  existing_sic jsonb;
  existing_sic_index integer;
  existing_sic_count integer := 0;
  existing_week_id text;
  existing_status text;
  existing_value numeric;
  new_sic_value numeric;
  value_changed boolean := false;
  status_needs_reset boolean := false;
  applied_to_ev boolean := false;
  payload_changed boolean := false;
begin
  -- Regra estritamente prospectiva: só a nova transição cria a entrada.
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
  if jsonb_typeof(queue) <> 'object' or coalesce((queue->>'version')::integer, 0) <> 1 then
    raise exception 'Preencha os dados da semana de Aprovação de SICs antes de mover o card'
      using errcode = '23514';
  end if;
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

  select state.payload
    into shared_payload
  from public.slt_budget_sic_approval_initial_state state
  where state.id = 1
  for update;

  if shared_payload is null then
    raise exception 'A base compartilhada de Aprovação de SICs não está disponível'
      using errcode = '55000';
  end if;

  select work.*
    into work_row
  from public.slt_projects_works work
  where work.record_key = new.work_id
    and work.deleted_at is null;

  if not found then
    raise exception 'A demanda precisa estar vinculada a uma obra ativa do portfólio'
      using errcode = '23503';
  end if;

  select count(*)::integer
    into existing_sic_count
  from jsonb_array_elements(coalesce(shared_payload->'obras', '[]'::jsonb))
       with ordinality as card_item(value, ordinality)
  cross join lateral jsonb_array_elements(coalesce(card_item.value->'sics', '[]'::jsonb))
       with ordinality as sic_item(value, ordinality)
  where sic_item.value->>'demandId' = new.record_key;

  if existing_sic_count > 1 then
    raise exception 'Esta demanda possui mais de uma entrada na base de aprovação da Diretoria; corrija a duplicidade antes de reenviar'
      using errcode = '23505';
  end if;

  if existing_sic_count = 1 then
    select card_item.ordinality::integer, sic_item.value, sic_item.ordinality::integer
      into card_index, existing_sic, existing_sic_index
    from jsonb_array_elements(coalesce(shared_payload->'obras', '[]'::jsonb))
         with ordinality as card_item(value, ordinality)
    cross join lateral jsonb_array_elements(coalesce(card_item.value->'sics', '[]'::jsonb))
         with ordinality as sic_item(value, ordinality)
    where sic_item.value->>'demandId' = new.record_key
    order by card_item.ordinality, sic_item.ordinality
    limit 1;

    select item.value
      into card
    from jsonb_array_elements(coalesce(shared_payload->'obras', '[]'::jsonb))
         with ordinality as item(value, ordinality)
    where item.ordinality = card_index;

    if card is null then
      raise exception 'Não foi possível localizar o card existente de Aprovação da Diretoria'
        using errcode = '23503';
    end if;
    if nullif(existing_sic->>'portfolioWorkId', '') is not null
       and existing_sic->>'portfolioWorkId' <> work_row.record_key then
      raise exception 'A SIC existente está vinculada a outra obra do portfólio'
        using errcode = '23514';
    end if;
    if nullif(card->>'portfolioWorkId', '') is not null
       and card->>'portfolioWorkId' <> work_row.record_key then
      raise exception 'O card existente de Aprovação da Diretoria está vinculado a outra obra'
        using errcode = '23514';
    end if;

    existing_week_id := nullif(btrim(existing_sic->>'weekId'), '');
    if existing_week_id is null then
      existing_week_id := week_id;
    end if;

    select item.value, item.ordinality::integer
      into week, week_index
    from jsonb_array_elements(coalesce(shared_payload->'weeks', '[]'::jsonb))
         with ordinality as item(value, ordinality)
    where item.value->>'id' = existing_week_id;

    if week is null then
      raise exception 'A semana vinculada à SIC existente não foi encontrada; o card foi preservado sem alterações'
        using errcode = '23503';
    end if;

    card_id := card->>'id';
    week_id := existing_week_id;
    week_label := coalesce(nullif(week->>'label', ''), 'Semana');
    existing_status := lower(coalesce(existing_sic->>'status', 'pendente'));
    existing_value := round(coalesce((existing_sic->>'valor')::numeric, 0), 2);
    new_sic_value := round((queue->>'sicValue')::numeric, 2);
    value_changed := existing_value is distinct from new_sic_value;
    applied_to_ev := coalesce((existing_sic->>'appliedToEV')::boolean, false);
    status_needs_reset := existing_status = 'reprovado'
      or (existing_status = 'aprovado' and value_changed);

    if applied_to_ev and (value_changed or existing_status = 'reprovado') then
      raise exception 'Esta SIC já foi aplicada ao EV; não é possível alterar seu valor pelo reenvio do Kanban'
        using errcode = '23514';
    end if;

    payload_changed := false;
    sic := existing_sic;

    if value_changed then
      sic := jsonb_set(sic, '{valor}', to_jsonb(new_sic_value), true);
      payload_changed := true;
    end if;
    if nullif(sic->>'weekId', '') is null then
      sic := jsonb_set(sic, '{weekId}', to_jsonb(week_id), true);
      payload_changed := true;
    end if;
    if nullif(sic->>'portfolioWorkId', '') is null then
      sic := jsonb_set(sic, '{portfolioWorkId}', to_jsonb(work_row.record_key), true);
      payload_changed := true;
    end if;
    if nullif(card->>'portfolioWorkId', '') is null then
      card := jsonb_set(card, '{portfolioWorkId}', to_jsonb(work_row.record_key), true);
      payload_changed := true;
    end if;
    if status_needs_reset then
      sic := jsonb_set(sic, '{status}', to_jsonb('pendente'::text), true);
      sic := jsonb_set(sic, '{statusUpdatedAt}', 'null'::jsonb, true);
      payload_changed := true;
    end if;

    if payload_changed then
      card := jsonb_set(card, array['sics', (existing_sic_index - 1)::text], sic, false);

      if value_changed then
        event := jsonb_build_object(
          'id', 'evt-sic-value-sync-' || md5(new.record_key || '|' || clock_timestamp()::text || '|' || existing_value::text || '|' || new_sic_value::text),
          'type', 'sic_value_synced',
          'sicId', sic->>'id',
          'demandId', new.record_key,
          'amount', new_sic_value,
          'previousAmount', existing_value,
          'weekId', week_id,
          'weekLabel', week_label,
          'at', to_jsonb(now()),
          'text', format('SIC/Revisão %s sincronizada com o valor atual do Kanban.', coalesce(sic->>'lecom', 'SIC'))
        );
      elsif status_needs_reset then
        event := jsonb_build_object(
          'id', 'evt-sic-requeued-' || md5(new.record_key || '|' || clock_timestamp()::text),
          'type', 'sic_requeued',
          'sicId', sic->>'id',
          'demandId', new.record_key,
          'amount', new_sic_value,
          'weekId', week_id,
          'weekLabel', week_label,
          'at', to_jsonb(now()),
          'text', format('SIC/Revisão %s reenviada para aprovação da Diretoria.', coalesce(sic->>'lecom', 'SIC'))
        );
      end if;

      if value_changed or status_needs_reset then
        card := jsonb_set(
          card,
          '{historyEvents}',
          coalesce(card->'historyEvents', '[]'::jsonb) || jsonb_build_array(event),
          true
        );
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
    end if;

    -- A SIC já existe: atualiza o valor em seu próprio card e preserva o
    -- quadro-resumo, a semana, os vínculos e os demais dados da apresentação.
    return new;
  end if;

  select item.value, item.ordinality::integer
    into week, week_index
  from jsonb_array_elements(coalesce(shared_payload->'weeks', '[]'::jsonb))
       with ordinality as item(value, ordinality)
  where item.value->>'id' = week_id;

  if week is null then
    raise exception 'A semana selecionada não existe mais. Recarregue e escolha novamente'
      using errcode = '23514';
  end if;
  week_status := lower(coalesce(week->>'status', case when coalesce((week->>'placeholder')::boolean, false) then 'provisional' else 'open' end));
  if week_status = 'closed' then
    raise exception 'A semana selecionada está encerrada e não aceita novas SICs'
      using errcode = '23514';
  end if;
  week_label := coalesce(nullif(week->>'label', ''), 'Semana');

  select
    coalesce(sum(line.budgeted_amount) filter (
      where regexp_replace(translate(lower(coalesce(line.discipline_id, '')), 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'), '[^a-z0-9]+', '', 'g') <> 'taxarisco'
        and regexp_replace(translate(lower(coalesce(line.status, '')), 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'), '[^a-z0-9]+', '', 'g') <> 'naoseaplica'
    ), 0),
    coalesce(sum(line.budgeted_amount) filter (
      where regexp_replace(translate(lower(coalesce(line.discipline_id, '')), 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'), '[^a-z0-9]+', '', 'g') = 'sics'
        and regexp_replace(translate(lower(coalesce(line.status, '')), 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'), '[^a-z0-9]+', '', 'g') <> 'naoseaplica'
    ), 0)
    into portfolio_total, portfolio_additives
  from public.slt_budget_estimates estimate
  join public.slt_budget_estimate_lines line
    on line.parent_key = estimate.record_key
   and line.deleted_at is null
  where estimate.parent_key = work_row.record_key
    and estimate.deleted_at is null;

  portfolio_total := round(portfolio_total, 2);
  portfolio_additives := round(portfolio_additives, 2);
  portfolio_area := coalesce(work_row.area_m2, 0);
  card_id := nullif(btrim(queue->>'approvalCardId'), '');

  if card_id is not null then
    select item.value, item.ordinality::integer
      into card, card_index
    from jsonb_array_elements(shared_payload->'obras') with ordinality item(value, ordinality)
    where item.value->>'id' = card_id;
    if card is null then
      raise exception 'O card de Aprovação de SICs selecionado não existe mais'
        using errcode = '23503';
    end if;
    if nullif(card->>'portfolioWorkId', '') is not null
       and card->>'portfolioWorkId' <> work_row.record_key then
      raise exception 'O card selecionado está vinculado a outra obra do portfólio'
        using errcode = '23514';
    end if;
    card := jsonb_set(card, '{portfolioWorkId}', to_jsonb(work_row.record_key), true);
  else
    is_new_card := true;
    card_id := 'portfolio-' || md5(work_row.record_key);
    if exists (select 1 from jsonb_array_elements(shared_payload->'obras') item where item->>'id' = card_id) then
      raise exception 'Já existe um card para esta obra. Recarregue e confirme o vínculo'
        using errcode = '23505';
    end if;
    if jsonb_typeof(queue->'oiList') <> 'array' or jsonb_array_length(queue->'oiList') = 0 then
      raise exception 'Informe pelo menos uma OI para criar o card da obra'
        using errcode = '23514';
    end if;
    classification := nullif(btrim(queue->>'classification'), '');
    if classification is null then
      raise exception 'Informe a classificação para criar o card da obra'
        using errcode = '23514';
    end if;
    select string_agg(value, ' · ' order by ordinality)
      into oi_raw
    from jsonb_array_elements_text(queue->'oiList') with ordinality item(value, ordinality);
    card := jsonb_build_object(
      'id', card_id,
      'portfolioWorkId', work_row.record_key,
      'descricao', work_row.name,
      'descricaoAliases', jsonb_build_array(work_row.name),
      'classificacao', classification,
      'oiList', queue->'oiList',
      'oiAliases', queue->'oiList',
      'oiRaw', coalesce(oi_raw, ''),
      'hasOI', true,
      'ev', jsonb_build_object(
        'total', portfolio_total,
        'semAditivos', portfolio_total - portfolio_additives,
        'aditivosAprovados', portfolio_additives,
        'areaM2', portfolio_area,
        'valorM2', case when portfolio_area <> 0 then portfolio_total / portfolio_area else 0 end
      ),
      'sap', '{}'::jsonb,
      'sics', '[]'::jsonb,
      'historyEvents', '[]'::jsonb,
      'excludedWeekIds', '[]'::jsonb,
      'dataMigrations', '[]'::jsonb,
      'baseAditivosAprovados', null,
      'baseAditivosUpdatedAt', null
    );
  end if;

  card_total := coalesce((card#>>'{ev,total}')::numeric, portfolio_total);
  select item.value, item.ordinality::integer
    into snapshot, snapshot_index
  from jsonb_array_elements(shared_payload->'snapshots') with ordinality item(value, ordinality)
  where item.value->>'obraId' = card_id
    and item.value->>'weekId' = week_id;

  if snapshot is null then
    prior_invoices := (queue->>'priorInvoices')::numeric;
    assigned_amount := (queue->>'assignedAmount')::numeric;
    committed_amount := (queue->>'committedAmount')::numeric;
    balance_amount := round(assigned_amount - committed_amount, 2);
    snapshot := jsonb_build_object(
      'weekId', week_id,
      'obraId', card_id,
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
  else
    prior_invoices := coalesce((snapshot#>>'{sap,faturasAnosAnteriores}')::numeric, 0);
    assigned_amount := coalesce((snapshot#>>'{sap,atribuidoAtual}')::numeric, 0);
    committed_amount := coalesce((snapshot#>>'{sap,comprometidoAtual}')::numeric, 0);
  end if;

  lecom := coalesce(
    nullif(btrim(new.extra#>>'{sicMetadata,lecomNumber}'), ''),
    nullif(btrim(new.extra#>>'{sicMetadata,numeroSic}'), ''),
    new.record_key
  );
  sic_description := coalesce(
    nullif(btrim(new.extra#>>'{sicMetadata,descricaoSic}'), ''),
    nullif(btrim(new.notes), ''),
    coalesce(new.title, 'SIC')
  );
  sic := jsonb_build_object(
    'id', 'kanban-' || md5(new.record_key),
    'demandId', new.record_key,
    'portfolioWorkId', work_row.record_key,
    'lecom', lecom,
    'descricao', sic_description,
    'valor', round((queue->>'sicValue')::numeric, 2),
    'weekId', week_id,
    'status', 'pendente',
    'statusUpdatedAt', null,
    'appliedToEV', false,
    'evAppliedAmount', 0,
    'appliedAt', null,
    'quadroResumo', '[]'::jsonb,
    'quadroResumoAtivo', false,
    'quadroResumoAberto', false,
    'fingerprint', md5(new.record_key || '|' || week_id || '|' || lecom)
  );
  event := jsonb_build_object(
    'id', 'evt-queue-' || md5(new.record_key || '|' || week_id),
    'type', 'sic_queued',
    'sicId', sic->>'id',
    'demandId', new.record_key,
    'amount', (sic->>'valor')::numeric,
    'weekId', week_id,
    'weekLabel', week_label,
    'at', to_jsonb(now()),
    'text', format('SIC/Revisão %s incluída automaticamente em %s a partir do Kanban de Obras.', lecom, week_label)
  );

  card := jsonb_set(card, '{sics}', coalesce(card->'sics', '[]'::jsonb) || jsonb_build_array(sic), true);
  card := jsonb_set(card, '{historyEvents}', coalesce(card->'historyEvents', '[]'::jsonb) || jsonb_build_array(event), true);

  select candidate->>'start'
    into current_last_start
  from jsonb_array_elements(shared_payload->'weeks') candidate
  where candidate->>'id' = card->>'lastWeekId';
  if current_last_start is null or coalesce(week->>'start', '') >= current_last_start then
    card := jsonb_set(card, '{lastWeekId}', to_jsonb(week_id), true);
    card := jsonb_set(card, '{sap}', snapshot->'sap', true);
  end if;

  if is_new_card then
    shared_payload := jsonb_set(
      shared_payload,
      '{obras}',
      coalesce(shared_payload->'obras', '[]'::jsonb) || jsonb_build_array(card),
      false
    );
  else
    shared_payload := jsonb_set(
      shared_payload,
      array['obras', (card_index - 1)::text],
      card,
      false
    );
  end if;

  update public.slt_budget_sic_approval_initial_state
  set payload = shared_payload,
      revision = revision + 1,
      updated_at = now()
  where id = 1;

  return new;
end
$function$;
revoke all on function slt_private.queue_sic_for_director_approval() from public, anon, authenticated;

commit;
