begin;

-- A demanda e a obra usam a mesma trava lógica das gravações normais. Isso
-- mantém a validação concorrente sem exigir UPDATE direto na tabela de obras.
create or replace function slt_private.require_active_work_for_budget_demand()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  current_work_id text;
  current_deleted_at timestamptz;
  active_work_id text;
begin
  select demand.work_id,demand.deleted_at
    into current_work_id,current_deleted_at
  from public.slt_budget_demands demand
  where demand.record_key = new.record_key;

  if found and current_deleted_at is null then
    if current_work_id is not null then
      perform pg_advisory_xact_lock(
        hashtextextended('slt_projects_works/' || current_work_id, 0)
      );

      select work.record_key
        into active_work_id
      from public.slt_projects_works work
      where work.record_key = current_work_id
        and work.deleted_at is null;
    end if;

    if active_work_id is null then
      raise exception 'Toda demanda de Obras precisa estar vinculada a uma obra ativa cadastrada'
        using errcode = '23503';
    end if;
  end if;

  return null;
end
$function$;

revoke all on function slt_private.require_active_work_for_budget_demand()
  from public, anon, authenticated;

commit;
