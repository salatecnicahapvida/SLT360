begin;

-- Classifica os ciclos existentes sem recriar SICs históricas. A Semana 06 já
-- contém os cards correntes e permanece intacta; somente recebe o status aberto.
with current_state as (
  select id, payload
  from public.slt_budget_sic_approval_initial_state
  where id = 1
  for update
), normalized as (
  select
    id,
    jsonb_set(
      jsonb_set(
        payload,
        '{weeks}',
        coalesce((
          select jsonb_agg(
            case
              when week->>'id' = 'w-postponed-1789735425001'
                then jsonb_set(week, '{status}', '"open"'::jsonb, true)
              when week->>'id' = 'w-postponed-1790252437364'
                then jsonb_set(week, '{status}', '"provisional"'::jsonb, true)
              else jsonb_set(week, '{status}', '"closed"'::jsonb, true)
            end
            order by ordinality
          )
          from jsonb_array_elements(payload->'weeks') with ordinality as item(week, ordinality)
        ), '[]'::jsonb),
        false
      ),
      '{obras}',
      coalesce((
        select jsonb_agg(
          case
            when card->>'id' = 'obra-0000-novo-hospital-rio-de-janeiro-e5rvsa'
              then jsonb_set(card, '{portfolioWorkId}', '"EVW-evh-0009"'::jsonb, true)
            when card->>'id' = 'oi-50158033_50159350_50159424'
              then jsonb_set(card, '{portfolioWorkId}', '"EVW-evh-0019"'::jsonb, true)
            else card
          end
          order by ordinality
        )
        from jsonb_array_elements(payload->'obras') with ordinality as item(card, ordinality)
      ), '[]'::jsonb),
      false
    ) as payload
  from current_state
)
update public.slt_budget_sic_approval_initial_state target
set payload = normalized.payload,
    revision = target.revision + 1,
    updated_at = now()
from normalized
where target.id = normalized.id;

create or replace function slt_private.queue_sic_for_director_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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

  select item.value, item.ordinality::integer
    into week, week_index
  from jsonb_array_elements(shared_payload->'weeks') with ordinality item(value, ordinality)
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

  if exists (
    select 1
    from jsonb_array_elements(shared_payload->'obras') obra
    cross join lateral jsonb_array_elements(coalesce(obra->'sics', '[]'::jsonb)) queued_sic
    where queued_sic->>'demandId' = new.record_key
  ) then
    raise exception 'Esta demanda já possui uma SIC na base de aprovação da Diretoria'
      using errcode = '23505';
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
$$;

revoke all on function slt_private.queue_sic_for_director_approval() from public, anon, authenticated;

drop trigger if exists queue_sic_for_director_approval on public.slt_budget_demands;
create trigger queue_sic_for_director_approval
after update of phase, extra, work_id on public.slt_budget_demands
for each row
execute function slt_private.queue_sic_for_director_approval();

commit;
