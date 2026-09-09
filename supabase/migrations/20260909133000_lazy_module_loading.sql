begin;

create or replace function public.slt_home_summary()
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare
  works_summary jsonb := '{}'::jsonb;
  maintenance_summary jsonb := '{}'::jsonb;
  clinical_summary jsonb := '{}'::jsonb;
  finance_summary jsonb := '{}'::jsonb;
  source_total bigint := 0;
  source_active bigint := 0;
  local_total bigint := 0;
  local_active bigint := 0;
begin
  if not exists(
    select 1 from public.slt360_profiles
    where id=auth.uid() and ativo and not must_change_password
  ) then
    raise exception 'Acesso negado' using errcode='42501';
  end if;

  if public.slt_has_module_access('budget',false) then
    select jsonb_build_object(
      'totalWorks',(select count(*) from public.slt_projects_works where deleted_at is null),
      'historicalEVCount',(select count(*) from public.slt_budget_import_estimates where deleted_at is null),
      'activeCount',(select count(*) from public.slt_budget_demands where deleted_at is null and coalesce(phase,'') not in ('concluido','cancelado')),
      'pendingEVCount',(select count(*) from public.slt_budget_estimates where deleted_at is null and coalesce(status,'') <> 'Completo'),
      'contracted',(select coalesce(sum(contracted_amount),0) from public.slt_budget_estimate_lines where deleted_at is null)
    ) into works_summary;
  end if;

  if public.slt_has_module_access('maintenance',false) then
    select count(*), count(*) filter(where lower(coalesce(phase,'')) !~ '(postado|arquivad|finaliz)')
    into source_total,source_active from public.slt_maintenance_source_readings where deleted_at is null;
    select count(*), count(*) filter(where coalesce(phase,'') not in ('postado','postadoComRc','cardsArquivados','finalizada'))
    into local_total,local_active from public.slt_maintenance_orders where deleted_at is null;
    maintenance_summary := jsonb_build_object(
      'totalCount',greatest(source_total,local_total),
      'activeCount',greatest(source_active,local_active),
      'overdueCount',0
    );
  end if;

  if public.slt_has_module_access('clinical',false) then
    select count(*), count(*) filter(where lower(coalesce(phase,'')) !~ '(postado|arquivad|finaliz)')
    into source_total,source_active from public.slt_clinical_source_readings where deleted_at is null;
    select count(*), count(*) filter(where coalesce(phase,'') not in ('postado','postadoComRc','cardsArquivados','finalizada'))
    into local_total,local_active from public.slt_clinical_orders where deleted_at is null;
    clinical_summary := jsonb_build_object(
      'equipmentCount',(select count(*) from public.slt_clinical_assets where deleted_at is null),
      'unitCount',(select count(distinct unit_name) from public.slt_clinical_assets where deleted_at is null and nullif(trim(unit_name),'') is not null),
      'totalCount',greatest(source_total,local_total),
      'activeCount',greatest(source_active,local_active)
    );
  end if;

  if public.slt_has_module_access('finance',false) then
    select jsonb_build_object(
      'fundCount',count(*),
      'availableBalance',coalesce(sum(coalesce(approved_amount,requested_amount,0)-coalesce(committed_amount,used_amount,0)),0)
    ) into finance_summary
    from public.slt_finance_funds where deleted_at is null;
  end if;

  return jsonb_build_object(
    'schema_version',2,
    'works',works_summary,
    'maintenance',maintenance_summary,
    'clinical',clinical_summary,
    'finance',finance_summary
  );
end
$function$;

revoke all on function public.slt_home_summary() from public,anon;
grant execute on function public.slt_home_summary() to authenticated;

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
  if not exists(select 1 from public.slt360_profiles where id=auth.uid() and ativo and not must_change_password) then
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
       or (module_key in ('budget','maintenance','clinical','projects') and name in ('core_units','core_sprints','core_source_unit_registry_data'))
       or (module_key='budget' and name='core_suppliers')
       or (module_key in ('budget','finance','projects') and name='projects_works')
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
