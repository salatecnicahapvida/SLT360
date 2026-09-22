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
      'activeCount',(select count(*) from public.slt_budget_demands where deleted_at is null and coalesce(phase,'') not in ('pausado','concluido','cancelado')),
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

commit;
