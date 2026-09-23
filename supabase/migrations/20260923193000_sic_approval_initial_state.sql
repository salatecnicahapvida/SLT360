begin;

-- The source workbook is imported privately after this schema migration.
-- No operational data is committed to this public repository.
create table if not exists public.slt_budget_sic_approval_initial_state (
  id smallint primary key default 1 check (id = 1),
  payload jsonb not null,
  source_checksum text not null,
  imported_at timestamptz not null default now()
);

alter table public.slt_budget_sic_approval_initial_state enable row level security;
revoke all on public.slt_budget_sic_approval_initial_state from anon, authenticated;
grant select on public.slt_budget_sic_approval_initial_state to authenticated;
create policy sic_approval_initial_state_read
  on public.slt_budget_sic_approval_initial_state
  for select to authenticated
  using ((select public.slt_has_module_access('budget', false)));

commit;
