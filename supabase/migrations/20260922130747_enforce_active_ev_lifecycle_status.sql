update public.slt_budget_estimates e
set deleted_at = now(),
    revision = revision + 1,
    updated_at = now(),
    updated_by = null
where e.deleted_at is null
  and coalesce(e.status,'') in ('Rascunho','Em cotação','Sem EV')
  and coalesce(e.version_number,0) = 0
  and not exists (
    select 1
    from public.slt_budget_estimate_lines l
    where l.parent_key = e.record_key
      and l.deleted_at is null
  )
  and not exists (
    select 1
    from public.slt_budget_estimate_versions v
    where v.parent_key = e.record_key
      and v.deleted_at is null
  );

update public.slt_budget_estimates
set status = 'Incompleto',
    revision = revision + 1,
    updated_at = now(),
    updated_by = null
where deleted_at is null
  and coalesce(status,'') in ('Rascunho','Em cotação','Sem EV');

alter table public.slt_budget_estimates
  add constraint slt_budget_estimates_active_status_check
  check (
    deleted_at is not null
    or (
      status is not null
      and status in ('Incompleto','Completo')
    )
  );
