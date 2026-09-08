begin;

create unique index if not exists slt_budget_estimates_one_active_per_work
on public.slt_budget_estimates(parent_key)
where deleted_at is null;

create unique index if not exists slt_budget_estimate_versions_unique_active_revision
on public.slt_budget_estimate_versions(parent_key,version_number)
where deleted_at is null;

alter table public.slt_budget_demands
  add constraint slt_budget_demands_active_work_required
  check(deleted_at is not null or work_id is not null) not valid;
alter table public.slt_budget_demands
  validate constraint slt_budget_demands_active_work_required;

alter table public.slt_projects_demands
  add constraint slt_projects_demands_active_work_required
  check(deleted_at is not null or work_id is not null) not valid;
alter table public.slt_projects_demands
  validate constraint slt_projects_demands_active_work_required;

alter table public.slt_budget_import_estimates
  add constraint slt_budget_import_estimates_active_work_required
  check(deleted_at is not null or work_id is not null) not valid;
alter table public.slt_budget_import_estimates
  validate constraint slt_budget_import_estimates_active_work_required;

commit;
