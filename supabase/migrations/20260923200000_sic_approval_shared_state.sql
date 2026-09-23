begin;

-- The existing private imported workbook remains the shared starting state.
-- Its provenance checksum is immutable to browser clients.
alter table public.slt_budget_sic_approval_initial_state
  add column if not exists revision bigint not null default 1,
  add column if not exists updated_at timestamptz not null default now();

alter table public.slt_budget_sic_approval_initial_state
  add constraint sic_approval_payload_shape check (
    jsonb_typeof(payload) = 'object'
    and jsonb_typeof(payload->'obras') = 'array'
    and jsonb_typeof(payload->'weeks') = 'array'
    and jsonb_typeof(payload->'snapshots') = 'array'
    and jsonb_typeof(payload->'notificationReads') = 'object'
    and octet_length(payload::text) <= 3000000
  );

revoke all on public.slt_budget_sic_approval_initial_state from anon, authenticated;
grant select on public.slt_budget_sic_approval_initial_state to authenticated;
grant update (payload, revision, updated_at) on public.slt_budget_sic_approval_initial_state to authenticated;

create policy sic_approval_shared_update
  on public.slt_budget_sic_approval_initial_state
  for update to authenticated
  using ((select public.slt_has_module_access('budget', true)))
  with check ((select public.slt_has_module_access('budget', true)));

commit;
