begin;

create or replace function slt_private.require_active_work_for_budget_demand()
returns trigger
language plpgsql
set search_path=''
as $function$
declare
  current_work_id text;
  current_deleted_at timestamptz;
begin
  select demand.work_id,demand.deleted_at
  into current_work_id,current_deleted_at
  from public.slt_budget_demands demand
  where demand.record_key=new.record_key;

  if found and current_deleted_at is null and (
    current_work_id is null
    or not exists (
      select 1
      from public.slt_projects_works work
      where work.record_key=current_work_id
        and work.deleted_at is null
    )
  ) then
    raise exception 'Toda demanda de Obras precisa estar vinculada a uma obra ativa cadastrada'
      using errcode='23503';
  end if;
  return null;
end
$function$;

drop trigger if exists require_active_work_for_budget_demand on public.slt_budget_demands;
create constraint trigger require_active_work_for_budget_demand
after insert or update on public.slt_budget_demands
deferrable initially deferred
for each row execute function slt_private.require_active_work_for_budget_demand();

create or replace function slt_private.prevent_work_without_active_budget_demands()
returns trigger
language plpgsql
set search_path=''
as $function$
declare
  current_deleted_at timestamptz;
begin
  select work.deleted_at
  into current_deleted_at
  from public.slt_projects_works work
  where work.record_key=old.record_key;

  if found and current_deleted_at is null then
    return null;
  end if;

  if exists (
    select 1
    from public.slt_budget_demands demand
    where demand.work_id=old.record_key
      and demand.deleted_at is null
  ) then
    raise exception 'A obra possui demandas ativas e não pode ser desativada ou excluída'
      using errcode='23503';
  end if;

  return null;
end
$function$;

drop trigger if exists prevent_work_archive_with_active_budget_demands on public.slt_projects_works;
create constraint trigger prevent_work_archive_with_active_budget_demands
after update on public.slt_projects_works
deferrable initially deferred
for each row
when (old.deleted_at is null and new.deleted_at is not null)
execute function slt_private.prevent_work_without_active_budget_demands();

drop trigger if exists prevent_work_delete_with_active_budget_demands on public.slt_projects_works;
create constraint trigger prevent_work_delete_with_active_budget_demands
after delete on public.slt_projects_works
deferrable initially deferred
for each row execute function slt_private.prevent_work_without_active_budget_demands();

commit;
