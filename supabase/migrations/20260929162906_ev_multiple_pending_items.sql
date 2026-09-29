begin;

create table if not exists public.slt_budget_ev_pending_items (
  id uuid primary key default gen_random_uuid(),
  ev_key text not null,
  work_id text,
  historical_record_id text,
  description text not null,
  recorded_on date not null,
  recorded_by text not null,
  recorded_revision integer,
  resolved boolean not null default false,
  resolved_on date,
  resolved_by text,
  resolved_revision integer,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  constraint slt_budget_ev_pending_items_description_check check (nullif(btrim(description), '') is not null),
  constraint slt_budget_ev_pending_items_recorded_by_check check (nullif(btrim(recorded_by), '') is not null),
  constraint slt_budget_ev_pending_items_resolution_check check (
    (not resolved) or (
      resolved_on is not null
      and nullif(btrim(resolved_by), '') is not null
    )
  )
);

create index if not exists slt_budget_ev_pending_items_ev_key_idx
  on public.slt_budget_ev_pending_items(ev_key);
create index if not exists slt_budget_ev_pending_items_open_idx
  on public.slt_budget_ev_pending_items(ev_key, resolved);

alter table public.slt_budget_ev_pending_items enable row level security;

revoke all on table public.slt_budget_ev_pending_items from anon, authenticated;
grant select, insert, update on table public.slt_budget_ev_pending_items to authenticated;

drop policy if exists ev_pending_items_read on public.slt_budget_ev_pending_items;
create policy ev_pending_items_read
  on public.slt_budget_ev_pending_items
  for select to authenticated
  using ((select public.slt_has_module_access('budget', false)));

drop policy if exists ev_pending_items_insert on public.slt_budget_ev_pending_items;
create policy ev_pending_items_insert
  on public.slt_budget_ev_pending_items
  for insert to authenticated
  with check ((select public.slt_has_module_access('budget', true)));

drop policy if exists ev_pending_items_update on public.slt_budget_ev_pending_items;
create policy ev_pending_items_update
  on public.slt_budget_ev_pending_items
  for update to authenticated
  using ((select public.slt_has_module_access('budget', true)))
  with check ((select public.slt_has_module_access('budget', true)));

create or replace function public.slt_budget_touch_ev_pending_item()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  if not new.resolved then
    new.resolved_on := null;
    new.resolved_by := null;
    new.resolved_revision := null;
  end if;
  return new;
end;
$$;

revoke all on function public.slt_budget_touch_ev_pending_item() from public, anon, authenticated;

drop trigger if exists slt_budget_touch_ev_pending_item on public.slt_budget_ev_pending_items;
create trigger slt_budget_touch_ev_pending_item
before insert or update on public.slt_budget_ev_pending_items
for each row execute function public.slt_budget_touch_ev_pending_item();

insert into public.slt_budget_ev_pending_items (
  ev_key, work_id, historical_record_id, description,
  recorded_on, recorded_by, recorded_revision,
  resolved, created_at, updated_at, updated_by
)
select
  t.ev_key,
  t.work_id,
  t.historical_record_id,
  t.pending_note,
  t.pending_on,
  t.pending_by,
  t.pending_revision,
  false,
  coalesce(t.updated_at, now()),
  coalesce(t.updated_at, now()),
  t.updated_by
from public.slt_budget_ev_tracking t
where t.has_pending
  and t.pending_note is not null
  and t.pending_on is not null
  and t.pending_by is not null
  and not exists (
    select 1 from public.slt_budget_ev_pending_items p
    where p.ev_key = t.ev_key
  );

notify pgrst, 'reload schema';
commit;
