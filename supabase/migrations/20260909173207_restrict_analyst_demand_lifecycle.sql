begin;

create or replace function slt_private.guard_analyst_demand_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role text;
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  select profile.perfil
    into actor_role
  from public.slt360_profiles profile
  where profile.id = auth.uid()
    and profile.ativo
    and not profile.must_change_password;

  if actor_role = 'Analista'
     and (
       tg_op in ('INSERT', 'DELETE')
       or (tg_op = 'UPDATE' and ((old.deleted_at is null) <> (new.deleted_at is null)))
     ) then
    raise exception 'Analistas podem alterar e mover demandas existentes, mas não podem criar ou excluir demandas'
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end
$$;

revoke all on function slt_private.guard_analyst_demand_lifecycle() from public, anon, authenticated;

do $$
declare
  entity_name text;
  table_name text;
  trigger_name text;
begin
  foreach entity_name in array array[
    'projects_demands',
    'budget_demands',
    'budget_archived_demands',
    'maintenance_orders',
    'maintenance_archived_orders',
    'clinical_orders',
    'clinical_archived_orders'
  ] loop
    table_name := 'slt_' || entity_name;
    trigger_name := 'guard_analyst_lifecycle_' || entity_name;
    execute format('drop trigger if exists %I on public.%I', trigger_name, table_name);
    execute format(
      'create trigger %I after insert or update or delete on public.%I for each row execute function slt_private.guard_analyst_demand_lifecycle()',
      trigger_name,
      table_name
    );
  end loop;
end
$$;

commit;
