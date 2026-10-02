-- A remoção de um card da pauta semanal é representada por excludedWeekIds.
-- Antes desta migração, a SIC permanecia no JSON compartilhado e o gatilho de
-- enfileiramento a interpretava como duplicada, impedindo a recriação pelo Kanban.
--
-- Este gatilho anterior ao enfileiramento materializa a exclusão quando a mesma
-- demanda volta para a Diretoria: remove somente pendências ocultas, reabre a
-- semana do card correto e preserva decisões, histórico e o card operacional.

create or replace function slt_private.prepare_excluded_sic_requeue()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  queue jsonb;
  shared_payload jsonb;
  original_payload jsonb;
  rebuilt_cards jsonb := '[]'::jsonb;
  card jsonb;
  excluded_week_ids jsonb;
  cleaned_sics jsonb;
  target_card_id text;
  target_week_id text;
  target_week_was_excluded boolean;
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
  if jsonb_typeof(queue) <> 'object' then
    return new;
  end if;

  target_week_id := nullif(btrim(queue->>'weekId'), '');
  if target_week_id is null then
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
  original_payload := shared_payload;

  target_card_id := nullif(btrim(queue->>'approvalCardId'), '');
  if target_card_id is null then
    select item.value->>'id'
      into target_card_id
    from jsonb_array_elements(coalesce(shared_payload->'obras', '[]'::jsonb))
      with ordinality item(value, ordinality)
    where item.value->>'portfolioWorkId' = new.work_id
    order by item.ordinality
    limit 1;

    if target_card_id is not null then
      new.extra := jsonb_set(
        new.extra,
        '{sicDirectorApproval,approvalCardId}',
        to_jsonb(target_card_id),
        true
      );
    end if;
  end if;

  for card in
    select item.value
    from jsonb_array_elements(coalesce(shared_payload->'obras', '[]'::jsonb))
      with ordinality item(value, ordinality)
    order by item.ordinality
  loop
    excluded_week_ids := coalesce(card->'excludedWeekIds', '[]'::jsonb);
    target_week_was_excluded := card->>'id' = target_card_id
      and excluded_week_ids @> jsonb_build_array(target_week_id);

    select coalesce(jsonb_agg(sic.value order by sic.ordinality), '[]'::jsonb)
      into cleaned_sics
    from jsonb_array_elements(coalesce(card->'sics', '[]'::jsonb))
      with ordinality sic(value, ordinality)
    where not (
      lower(coalesce(sic.value->>'status', 'pendente')) = 'pendente'
      and (
        (
          sic.value->>'demandId' = new.record_key
          and excluded_week_ids @> jsonb_build_array(coalesce(sic.value->>'weekId', ''))
        )
        or (
          target_week_was_excluded
          and sic.value->>'weekId' = target_week_id
        )
      )
    );

    card := jsonb_set(card, '{sics}', cleaned_sics, true);

    if target_week_was_excluded then
      select coalesce(jsonb_agg(to_jsonb(excluded.value) order by excluded.ordinality), '[]'::jsonb)
        into excluded_week_ids
      from jsonb_array_elements_text(excluded_week_ids)
        with ordinality excluded(value, ordinality)
      where excluded.value <> target_week_id;

      card := jsonb_set(card, '{excludedWeekIds}', excluded_week_ids, true);
    end if;

    rebuilt_cards := rebuilt_cards || jsonb_build_array(card);
  end loop;

  shared_payload := jsonb_set(shared_payload, '{obras}', rebuilt_cards, true);
  if shared_payload is distinct from original_payload then
    update public.slt_budget_sic_approval_initial_state
    set payload = shared_payload,
        revision = revision + 1,
        updated_at = now()
    where id = 1;
  end if;

  return new;
end
$$;

revoke all on function slt_private.prepare_excluded_sic_requeue()
from public, anon, authenticated;

drop trigger if exists prepare_excluded_sic_requeue
on public.slt_budget_demands;

create trigger prepare_excluded_sic_requeue
before update of phase, extra, work_id
on public.slt_budget_demands
for each row
execute function slt_private.prepare_excluded_sic_requeue();
