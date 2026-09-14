select pg_advisory_xact_lock(hashtextextended('slt360:backfill-budget-demand-phase-started-at', 0));

update public.slt_budget_demands
set extra = jsonb_set(
      jsonb_set(
        coalesce(extra, '{}'::jsonb),
        '{phaseStartedAt}',
        to_jsonb(
          coalesce(
            case
              when phase = 'fazendo' and actual_start is not null
                then actual_start::timestamp at time zone 'America/Sao_Paulo'
              when phase in ('validacaoST', 'validacaoObras')
                and coalesce(extra->>'dataEnvioRealValidacaoObras', '') ~ '^\d{4}-\d{2}-\d{2}$'
                then (extra->>'dataEnvioRealValidacaoObras')::date::timestamp at time zone 'America/Sao_Paulo'
              when phase = 'aprovacaoDiretoria'
                and coalesce(extra->>'dataValidacaoObras', '') ~ '^\d{4}-\d{2}-\d{2}$'
                then (extra->>'dataValidacaoObras')::date::timestamp at time zone 'America/Sao_Paulo'
              when phase = 'concluido' and delivered_on is not null
                then delivered_on::timestamp at time zone 'America/Sao_Paulo'
              else null
            end,
            created_at
          )
        ),
        true
      ),
      '{phaseStartedAtEstimated}',
      'true'::jsonb,
      true
    ),
    revision = revision + 1,
    updated_at = now()
where deleted_at is null
  and nullif(extra->>'phaseStartedAt', '') is null;

do $$
declare
  missing_count bigint;
begin
  select count(*)
    into missing_count
  from public.slt_budget_demands
  where deleted_at is null
    and nullif(extra->>'phaseStartedAt', '') is null;

  if missing_count <> 0 then
    raise exception
      'Ainda existem % demandas ativas sem início da etapa atual',
      missing_count;
  end if;
end
$$;
