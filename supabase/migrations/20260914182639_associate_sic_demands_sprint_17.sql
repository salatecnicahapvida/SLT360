select pg_advisory_xact_lock(hashtextextended('slt360:associate-sic-demands-sprint-17', 0));

do $$
declare
  target_sprint_key text;
  target_sprint_count bigint;
  sic_count bigint;
  remaining_sic_count bigint;
begin
  select count(*)
    into sic_count
  from public.slt_budget_demands
  where deleted_at is null
    and (
      lower(coalesce(type, '')) ~ '(^|[^a-z])sic([^a-z]|$)'
      or lower(translate(coalesce(type, ''), 'áàâãéêíóôõúç', 'aaaaeeiooouc')) like '%solicitacao%informac%'
      or regexp_replace(
        lower(translate(coalesce(type, ''), 'áàâãéêíóôõúç', 'aaaaeeiooouc')),
        '[^a-z0-9]+',
        '',
        'g'
      ) = 'informacaocontratada'
    );

  if sic_count = 0 then
    return;
  end if;

  select count(*), min(record_key)
    into target_sprint_count, target_sprint_key
  from public.slt_core_sprints
  where deleted_at is null
    and lower(btrim(name)) = 'sprint 17'
    and lower(btrim(status)) = 'ativa';

  if target_sprint_count <> 1 or target_sprint_key is null then
    raise exception
      'Esperada exatamente uma Sprint 17 ativa no cadastro; encontradas %',
      target_sprint_count;
  end if;

  update public.slt_budget_demands
  set sprint_id = target_sprint_key,
      field_keys = case
        when 'sprintId' = any(coalesce(field_keys, '{}'::text[])) then field_keys
        else array_append(coalesce(field_keys, '{}'::text[]), 'sprintId')
      end,
      empty_fields = array_remove(coalesce(empty_fields, '{}'::text[]), 'sprintId'),
      revision = revision + 1,
      updated_at = now()
  where deleted_at is null
    and (
      lower(coalesce(type, '')) ~ '(^|[^a-z])sic([^a-z]|$)'
      or lower(translate(coalesce(type, ''), 'áàâãéêíóôõúç', 'aaaaeeiooouc')) like '%solicitacao%informac%'
      or regexp_replace(
        lower(translate(coalesce(type, ''), 'áàâãéêíóôõúç', 'aaaaeeiooouc')),
        '[^a-z0-9]+',
        '',
        'g'
      ) = 'informacaocontratada'
    )
    and sprint_id is distinct from target_sprint_key;

  select count(*)
    into remaining_sic_count
  from public.slt_budget_demands
  where deleted_at is null
    and (
      lower(coalesce(type, '')) ~ '(^|[^a-z])sic([^a-z]|$)'
      or lower(translate(coalesce(type, ''), 'áàâãéêíóôõúç', 'aaaaeeiooouc')) like '%solicitacao%informac%'
      or regexp_replace(
        lower(translate(coalesce(type, ''), 'áàâãéêíóôõúç', 'aaaaeeiooouc')),
        '[^a-z0-9]+',
        '',
        'g'
      ) = 'informacaocontratada'
    )
    and sprint_id is distinct from target_sprint_key;

  if remaining_sic_count <> 0 then
    raise exception
      'Ainda existem % demandas SIC fora da Sprint 17 após a migração',
      remaining_sic_count;
  end if;
end
$$;
