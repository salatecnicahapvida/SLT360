-- SLT360: piloto administrativo. Sem acesso anônimo ou cadastro automático de perfis.
begin;
create table public.slt360_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  perfil text not null default 'Admin' check (perfil = 'Admin'),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.slt360_profiles enable row level security;
revoke all on public.slt360_profiles from anon, authenticated;
grant select on public.slt360_profiles to authenticated;
create policy own_profile on public.slt360_profiles for select to authenticated
  using (id = (select auth.uid()) and ativo);

create function public.slt360_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.slt360_profiles
    where id = (select auth.uid()) and ativo and perfil = 'Admin');
$$;
revoke all on function public.slt360_is_admin() from public, anon;
grant execute on function public.slt360_is_admin() to authenticated;

create table public.slt360_state (
  id integer primary key check (id = 1),
  revision bigint not null default 1,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table public.slt360_state enable row level security;
revoke all on public.slt360_state from anon, authenticated;
grant select on public.slt360_state to authenticated;
create policy admin_read on public.slt360_state for select to authenticated
  using ((select public.slt360_is_admin()));

create table public.slt360_audit (
  id bigint generated always as identity primary key,
  revision bigint not null,
  actor uuid references auth.users(id),
  created_at timestamptz not null default now(),
  operation text not null
);
alter table public.slt360_audit enable row level security;
revoke all on public.slt360_audit from anon, authenticated;
grant select on public.slt360_audit to authenticated;
create policy admin_audit_read on public.slt360_audit for select to authenticated
  using ((select public.slt360_is_admin()));

-- Uma gravação atômica com revisão esperada evita sobrescrever outra sessão.
create function public.slt360_save(expected_revision bigint, next_state jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare new_revision bigint;
begin
  if not public.slt360_is_admin() then raise exception 'Acesso negado' using errcode = '42501'; end if;
  if jsonb_typeof(next_state) is distinct from 'object'
     or octet_length(next_state::text) > 25000000
     or not (next_state ?& array['works','demands','sics','contracts','maintenanceDemands','projectDemands'])
     or jsonb_typeof(next_state->'works') is distinct from 'array'
     or jsonb_typeof(next_state->'demands') is distinct from 'array'
     or jsonb_typeof(next_state->'sics') is distinct from 'array'
     or jsonb_typeof(next_state->'contracts') is distinct from 'array'
     or jsonb_typeof(next_state->'maintenanceDemands') is distinct from 'array'
     or jsonb_typeof(next_state->'projectDemands') is distinct from 'array'
     or next_state ?| array['users','senha','password','activeRole'] then
    raise exception 'Estado inválido' using errcode = '22023';
  end if;
  update public.slt360_state
    set payload = jsonb_set(payload, '{state}', next_state),
        revision = revision + 1, updated_at = now(), updated_by = auth.uid()
    where id = 1 and revision = expected_revision
    returning revision into new_revision;
  if new_revision is null then
    raise exception 'Conflito de versão. Recarregue os dados antes de salvar.' using errcode = '40001';
  end if;
  insert into public.slt360_audit(revision, actor, operation)
    values (new_revision, auth.uid(), 'save');
  return new_revision;
end;
$$;
revoke all on function public.slt360_save(bigint,jsonb) from public, anon;
grant execute on function public.slt360_save(bigint,jsonb) to authenticated;

create table public.slt360_attachments (
  id text primary key check (id ~ '^ATT-[0-9a-f-]{36}$'),
  nome text not null,
  tipo text not null,
  tamanho bigint not null check (tamanho between 0 and 10485760),
  created_at timestamptz not null default now(),
  created_by uuid not null default auth.uid() references auth.users(id)
);
alter table public.slt360_attachments enable row level security;
revoke all on public.slt360_attachments from anon, authenticated;
grant select, insert on public.slt360_attachments to authenticated;
create policy attachment_admin_read on public.slt360_attachments for select to authenticated
  using ((select public.slt360_is_admin()));
create policy attachment_admin_insert on public.slt360_attachments for insert to authenticated
  with check ((select public.slt360_is_admin()) and created_by = (select auth.uid()));

insert into storage.buckets(id, name, public, file_size_limit)
values ('slt360-attachments', 'slt360-attachments', false, 10485760);
create policy slt360_files_read on storage.objects for select to authenticated
  using (bucket_id = 'slt360-attachments' and (select public.slt360_is_admin()));
create policy slt360_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'slt360-attachments' and (select public.slt360_is_admin())
    and name ~ '^ATT-[0-9a-f-]{36}$');
commit;
