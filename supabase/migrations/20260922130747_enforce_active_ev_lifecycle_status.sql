alter table public.slt_budget_estimates
  add constraint slt_budget_estimates_active_status_check
  check (
    deleted_at is not null
    or (
      status is not null
      and status in ('Incompleto','Completo')
    )
  );
