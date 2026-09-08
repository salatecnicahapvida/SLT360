-- Additive integration: no existing business records are replaced.
begin;
insert into slt_private.entity_catalog(name,module,definition) select e->>'name',e->>'module',e from jsonb_array_elements('[{"name":"budget_ev_typologies","module":"budget","path":"state.evTypologyOverrides","fields":{},"kind":"map"},{"name":"budget_ev_targets","module":"budget","path":"state.evReferenceTargets","fields":{},"kind":"map"},{"name":"budget_strategic_targets","module":"budget","path":"state.strategicTargetOverrides","fields":{},"kind":"map"},{"name":"budget_hidden_estimates","module":"budget","path":"state.deletedEVRecordIds","fields":{},"kind":"set"},{"name":"budget_approval_works","module":"budget","path":"state.sicApprovalWorks","fields":{"id":{"name":"id","type":"text"},"descricao":{"name":"description","type":"text"}}},{"name":"budget_approval_weeks","module":"budget","path":"state.sicApprovalWeeks","fields":{"id":{"name":"id","type":"text"},"label":{"name":"label","type":"text"},"start":{"name":"starts_on","type":"date"},"end":{"name":"ends_on","type":"date"}}},{"name":"budget_approval_snapshots","module":"budget","path":"state.sicApprovalSnapshots","fields":{"id":{"name":"id","type":"text"},"weekId":{"name":"week_id","type":"text","reference":"budget_approval_weeks"},"obraId":{"name":"work_id","type":"text","reference":"budget_approval_works"}}}]'::jsonb) e;
create table public.slt_budget_ev_typologies (record_key text primary key check(length(record_key) between 1 and 1500), revision bigint not null default 1 check(revision>0), ordinal numeric not null default 0, parent_key text, child_fields text[] not null default '{}', field_keys text[] not null default '{}', empty_fields text[] not null default '{}', string_fields text[] not null default '{}', extra jsonb not null default '{}' check(jsonb_typeof(extra)='object'), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), deleted_at timestamptz);
alter table public.slt_budget_ev_typologies enable row level security;
revoke all on public.slt_budget_ev_typologies from public,anon,authenticated;
grant select on public.slt_budget_ev_typologies to authenticated;
create policy module_read on public.slt_budget_ev_typologies for select to authenticated using(deleted_at is null and (select public.slt_has_module_access('budget',false)));
create table public.slt_budget_ev_targets (record_key text primary key check(length(record_key) between 1 and 1500), revision bigint not null default 1 check(revision>0), ordinal numeric not null default 0, parent_key text, child_fields text[] not null default '{}', field_keys text[] not null default '{}', empty_fields text[] not null default '{}', string_fields text[] not null default '{}', extra jsonb not null default '{}' check(jsonb_typeof(extra)='object'), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), deleted_at timestamptz);
alter table public.slt_budget_ev_targets enable row level security;
revoke all on public.slt_budget_ev_targets from public,anon,authenticated;
grant select on public.slt_budget_ev_targets to authenticated;
create policy module_read on public.slt_budget_ev_targets for select to authenticated using(deleted_at is null and (select public.slt_has_module_access('budget',false)));
create table public.slt_budget_strategic_targets (record_key text primary key check(length(record_key) between 1 and 1500), revision bigint not null default 1 check(revision>0), ordinal numeric not null default 0, parent_key text, child_fields text[] not null default '{}', field_keys text[] not null default '{}', empty_fields text[] not null default '{}', string_fields text[] not null default '{}', extra jsonb not null default '{}' check(jsonb_typeof(extra)='object'), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), deleted_at timestamptz);
alter table public.slt_budget_strategic_targets enable row level security;
revoke all on public.slt_budget_strategic_targets from public,anon,authenticated;
grant select on public.slt_budget_strategic_targets to authenticated;
create policy module_read on public.slt_budget_strategic_targets for select to authenticated using(deleted_at is null and (select public.slt_has_module_access('budget',false)));
create table public.slt_budget_hidden_estimates (record_key text primary key check(length(record_key) between 1 and 1500), revision bigint not null default 1 check(revision>0), ordinal numeric not null default 0, parent_key text, child_fields text[] not null default '{}', field_keys text[] not null default '{}', empty_fields text[] not null default '{}', string_fields text[] not null default '{}', extra jsonb not null default '{}' check(jsonb_typeof(extra)='object'), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), deleted_at timestamptz);
alter table public.slt_budget_hidden_estimates enable row level security;
revoke all on public.slt_budget_hidden_estimates from public,anon,authenticated;
grant select on public.slt_budget_hidden_estimates to authenticated;
create policy module_read on public.slt_budget_hidden_estimates for select to authenticated using(deleted_at is null and (select public.slt_has_module_access('budget',false)));
create table public.slt_budget_approval_works (record_key text primary key check(length(record_key) between 1 and 1500), revision bigint not null default 1 check(revision>0), ordinal numeric not null default 0, parent_key text, child_fields text[] not null default '{}', field_keys text[] not null default '{}', empty_fields text[] not null default '{}', string_fields text[] not null default '{}', extra jsonb not null default '{}' check(jsonb_typeof(extra)='object'), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), deleted_at timestamptz, id text, description text);
alter table public.slt_budget_approval_works enable row level security;
revoke all on public.slt_budget_approval_works from public,anon,authenticated;
grant select on public.slt_budget_approval_works to authenticated;
create policy module_read on public.slt_budget_approval_works for select to authenticated using(deleted_at is null and (select public.slt_has_module_access('budget',false)));
create table public.slt_budget_approval_weeks (record_key text primary key check(length(record_key) between 1 and 1500), revision bigint not null default 1 check(revision>0), ordinal numeric not null default 0, parent_key text, child_fields text[] not null default '{}', field_keys text[] not null default '{}', empty_fields text[] not null default '{}', string_fields text[] not null default '{}', extra jsonb not null default '{}' check(jsonb_typeof(extra)='object'), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), deleted_at timestamptz, id text, label text, starts_on date, ends_on date);
alter table public.slt_budget_approval_weeks enable row level security;
revoke all on public.slt_budget_approval_weeks from public,anon,authenticated;
grant select on public.slt_budget_approval_weeks to authenticated;
create policy module_read on public.slt_budget_approval_weeks for select to authenticated using(deleted_at is null and (select public.slt_has_module_access('budget',false)));
create table public.slt_budget_approval_snapshots (record_key text primary key check(length(record_key) between 1 and 1500), revision bigint not null default 1 check(revision>0), ordinal numeric not null default 0, parent_key text, child_fields text[] not null default '{}', field_keys text[] not null default '{}', empty_fields text[] not null default '{}', string_fields text[] not null default '{}', extra jsonb not null default '{}' check(jsonb_typeof(extra)='object'), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), deleted_at timestamptz, id text, week_id text, work_id text);
alter table public.slt_budget_approval_snapshots enable row level security;
revoke all on public.slt_budget_approval_snapshots from public,anon,authenticated;
grant select on public.slt_budget_approval_snapshots to authenticated;
create policy module_read on public.slt_budget_approval_snapshots for select to authenticated using(deleted_at is null and (select public.slt_has_module_access('budget',false)));
alter table public.slt_budget_approval_snapshots add foreign key (week_id) references public.slt_budget_approval_weeks(record_key) deferrable initially deferred;
create index on public.slt_budget_approval_snapshots(week_id);
alter table public.slt_budget_approval_snapshots add foreign key (work_id) references public.slt_budget_approval_works(record_key) deferrable initially deferred;
create index on public.slt_budget_approval_snapshots(work_id);
do $$ declare signature text; definition text; begin
  foreach signature in array array['public.slt_commit_changes(uuid,jsonb)','public.slt_backup_restore(uuid)','slt_private.capture_app_snapshot()'] loop
    select pg_get_functiondef(signature::regprocedure) into definition;
    if position('slt360/state-consistency' in definition)>0 then raise exception 'Lock already installed'; end if;
    definition=regexp_replace(definition,'\mbegin\M', E'begin\n perform pg_advisory_xact_lock' || case when signature like '%slt_commit_changes%' then '_shared' else '' end || E'(hashtextextended(''slt360/state-consistency'',0));', 'i');
    execute definition;
  end loop;
end $$;

-- Reconcile historical composition support that previously existed only remotely.
create table if not exists public.slt_budget_historical_ev_details (
 record_key text primary key references public.slt_budget_import_estimates(record_key),
 items jsonb not null default '[]'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.slt_budget_historical_ev_details enable row level security;
revoke all on public.slt_budget_historical_ev_details from public,anon,authenticated;
create policy budget_detail_read on public.slt_budget_historical_ev_details for select to authenticated
 using((select public.slt_has_module_access('budget',false)));
create or replace function public.slt_budget_historical_ev_items(ev_id text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.slt_has_module_access('budget',false) then raise exception 'Acesso negado ao módulo' using errcode='42501'; end if;
 select d.items into result from public.slt_budget_historical_ev_details d
 join public.slt_budget_import_estimates e on e.record_key=d.record_key
 where e.deleted_at is null and e.id=ev_id limit 1;
 return coalesce(result,'[]'::jsonb);
end $$;
-- Historical helpers may exist only in deployments upgraded on September 4.
-- Keep their server authorization checks and remove anonymous EXECUTE inheritance.
do $$ declare signature text; begin
 foreach signature in array array['public.slt_budget_historical_ev_items(text)','public.slt_home_summary()','public.slt_initial_load()'] loop
  if to_regprocedure(signature) is not null then
   execute 'revoke all on function '||signature||' from public,anon';
   execute 'grant execute on function '||signature||' to authenticated';
  end if;
 end loop;
end $$;
commit;
