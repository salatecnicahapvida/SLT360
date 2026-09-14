begin;

select pg_advisory_xact_lock(hashtextextended('slt360:use-demand-creation-for-stage-time', 0));

create or replace function slt_private.initialize_budget_demand_stage_tracking()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  creation_value jsonb;
  history_count integer;
begin
  creation_value := case
    when jsonb_typeof(new.extra->'createdAt') = 'string'
      and nullif(btrim(new.extra->>'createdAt'), '') is not null
      then new.extra->'createdAt'
    else to_jsonb(new.created_at)
  end;

  new.extra := jsonb_set(new.extra, '{createdAt}', creation_value, true);
  history_count := case
    when jsonb_typeof(new.extra->'phaseHistory') = 'array'
      then jsonb_array_length(new.extra->'phaseHistory')
    else 0
  end;

  if tg_table_name = 'slt_budget_demands'
    and history_count = 0
    and nullif(btrim(new.extra->>'phaseStartedAt'), '') is null
  then
    new.extra := jsonb_set(
      jsonb_set(new.extra, '{phaseStartedAt}', creation_value, true),
      '{phaseStartedAtEstimated}',
      'false'::jsonb,
      true
    );
  end if;

  return new;
end;
$$;

revoke all on function slt_private.initialize_budget_demand_stage_tracking() from public, anon, authenticated;

drop trigger if exists initialize_budget_demand_stage_tracking on public.slt_budget_demands;
create trigger initialize_budget_demand_stage_tracking
before insert on public.slt_budget_demands
for each row execute function slt_private.initialize_budget_demand_stage_tracking();

drop trigger if exists initialize_budget_demand_stage_tracking on public.slt_budget_archived_demands;
create trigger initialize_budget_demand_stage_tracking
before insert on public.slt_budget_archived_demands
for each row execute function slt_private.initialize_budget_demand_stage_tracking();

update public.slt_budget_demands
set extra = jsonb_set(extra, '{createdAt}', to_jsonb(created_at), true),
    revision = revision + 1,
    updated_at = now()
where deleted_at is null
  and nullif(btrim(extra->>'createdAt'), '') is null;

update public.slt_budget_archived_demands
set extra = jsonb_set(extra, '{createdAt}', to_jsonb(created_at), true),
    revision = revision + 1,
    updated_at = now()
where deleted_at is null
  and nullif(btrim(extra->>'createdAt'), '') is null;

update public.slt_budget_demands
set extra = jsonb_set(
      jsonb_set(extra, '{phaseStartedAt}', extra->'createdAt', true),
      '{phaseStartedAtEstimated}',
      'false'::jsonb,
      true
    ),
    revision = revision + 1,
    updated_at = now()
where deleted_at is null
  and case
        when jsonb_typeof(extra->'phaseHistory') = 'array'
          then jsonb_array_length(extra->'phaseHistory')
        else 0
      end = 0
  and (
    nullif(btrim(extra->>'phaseStartedAt'), '') is null
    or coalesce((extra->>'phaseStartedAtEstimated')::boolean, false)
  );

update public.slt_budget_archived_demands
set extra = jsonb_set(
      jsonb_set(extra, '{phaseStartedAt}', extra->'createdAt', true),
      '{phaseStartedAtEstimated}',
      'false'::jsonb,
      true
    ),
    revision = revision + 1,
    updated_at = now()
where deleted_at is null
  and case
        when jsonb_typeof(extra->'phaseHistory') = 'array'
          then jsonb_array_length(extra->'phaseHistory')
        else 0
      end = 0
  and (
    nullif(btrim(extra->>'phaseStartedAt'), '') is null
    or coalesce((extra->>'phaseStartedAtEstimated')::boolean, false)
  );

do $$
declare
  invalid_count bigint;
begin
  select count(*)
    into invalid_count
    from public.slt_budget_demands
   where deleted_at is null
     and (
       nullif(btrim(extra->>'createdAt'), '') is null
       or (
         case
           when jsonb_typeof(extra->'phaseHistory') = 'array'
             then jsonb_array_length(extra->'phaseHistory')
           else 0
         end = 0
         and (extra->>'phaseStartedAt')::timestamptz is distinct from (extra->>'createdAt')::timestamptz
       )
     );

  if invalid_count <> 0 then
    raise exception 'Ainda existem % demandas com contagem inicial diferente da criação', invalid_count;
  end if;
end;
$$;

commit;
