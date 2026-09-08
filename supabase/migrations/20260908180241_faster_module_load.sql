begin;

-- Accumulate one JSON array per entity and flatten once. The previous loop
-- appended every entity to the complete result, repeatedly copying a payload
-- that is currently about 8 MB.
create or replace function public.slt_module_load(module_key text default null)
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare
  e record;
  parts jsonb[] := array[]::jsonb[];
  rows_json jsonb;
  result jsonb;
begin
  if not (select active from slt_private.release_state where id=1) then
    raise exception 'Migração modular ainda não ativada' using errcode='55000';
  end if;
  if not exists(
    select 1 from public.slt360_profiles
    where id=auth.uid() and ativo and not must_change_password
  ) then
    raise exception 'Acesso negado' using errcode='42501';
  end if;
  if module_key is not null and not public.slt_has_module_access(module_key,false) then
    raise exception 'Acesso negado ao módulo' using errcode='42501';
  end if;

  for e in
    select name,module
    from slt_private.entity_catalog
    where module_key is null
       or module=module_key
       or name in ('core_units','core_sprints','core_suppliers','core_source_unit_registry_data','projects_works')
    order by name
  loop
    if public.slt_entity_access(e.name,false)
       and (
         e.name not in (
           'budget_ev_typologies','budget_ev_targets','budget_strategic_targets',
           'budget_hidden_estimates','budget_approval_works','budget_approval_weeks',
           'budget_approval_snapshots'
         )
         or coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb->>'x-client-info'='unified-1'
       ) then
      execute format(
        'select coalesce(jsonb_agg(slt_private.decode_record(%L,to_jsonb(t)) order by ordinal,record_key),''[]'') from public.%I t where deleted_at is null',
        e.name,
        'slt_'||e.name
      ) into rows_json;
      parts := array_append(parts,rows_json);
    end if;
  end loop;

  select coalesce(jsonb_agg(item order by part_order,row_order),'[]'::jsonb)
  into result
  from unnest(parts) with ordinality p(rows_json,part_order)
  cross join lateral jsonb_array_elements(p.rows_json) with ordinality i(item,row_order);

  return jsonb_build_object('schema_version',2,'records',result);
end
$function$;

commit;
