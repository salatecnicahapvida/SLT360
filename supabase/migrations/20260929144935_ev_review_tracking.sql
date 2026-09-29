begin;

create table if not exists public.slt_budget_ev_tracking (
  ev_key text primary key,
  work_id text,
  historical_record_id text,
  reviewed boolean not null default false,
  reviewed_on date,
  reviewed_by text,
  reviewed_revision integer,
  has_pending boolean not null default false,
  pending_note text,
  pending_on date,
  pending_by text,
  pending_revision integer,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  constraint slt_budget_ev_tracking_review_fields check (
    (not reviewed) or (reviewed_on is not null and nullif(btrim(reviewed_by), '') is not null)
  ),
  constraint slt_budget_ev_tracking_pending_fields check (
    (not has_pending) or (
      pending_on is not null
      and nullif(btrim(pending_by), '') is not null
      and nullif(btrim(pending_note), '') is not null
    )
  )
);

alter table public.slt_budget_ev_tracking enable row level security;

drop policy if exists ev_tracking_read on public.slt_budget_ev_tracking;
create policy ev_tracking_read
  on public.slt_budget_ev_tracking
  for select to authenticated
  using ((select public.slt_has_module_access('budget', false)));

drop policy if exists ev_tracking_insert on public.slt_budget_ev_tracking;
create policy ev_tracking_insert
  on public.slt_budget_ev_tracking
  for insert to authenticated
  with check ((select public.slt_has_module_access('budget', true)));

drop policy if exists ev_tracking_update on public.slt_budget_ev_tracking;
create policy ev_tracking_update
  on public.slt_budget_ev_tracking
  for update to authenticated
  using ((select public.slt_has_module_access('budget', true)))
  with check ((select public.slt_has_module_access('budget', true)));

grant select, insert, update on public.slt_budget_ev_tracking to authenticated;

create or replace function public.slt_budget_touch_ev_tracking()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  if not new.reviewed then
    new.reviewed_on := null;
    new.reviewed_by := null;
    new.reviewed_revision := null;
  end if;
  if not new.has_pending then
    new.pending_note := null;
    new.pending_on := null;
    new.pending_by := null;
    new.pending_revision := null;
  end if;
  return new;
end;
$$;

drop trigger if exists slt_budget_touch_ev_tracking on public.slt_budget_ev_tracking;
create trigger slt_budget_touch_ev_tracking
before insert or update on public.slt_budget_ev_tracking
for each row execute function public.slt_budget_touch_ev_tracking();

commit;
