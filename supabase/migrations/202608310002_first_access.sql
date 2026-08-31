-- Primeiro acesso: senha provisória autentica, mas não libera dados do sistema.
begin;
alter table public.slt360_profiles
  add column must_change_password boolean not null default true,
  add column password_changed_at timestamptz;

create or replace function public.slt360_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.slt360_profiles
    where id = (select auth.uid()) and ativo and perfil = 'Admin'
      and not must_change_password);
$$;
revoke all on function public.slt360_is_admin() from public, anon;
grant execute on function public.slt360_is_admin() to authenticated;

-- Só a alteração efetiva da senha no Auth libera o primeiro acesso.
-- Metadados enviados pelo navegador não podem remover a exigência.
create function public.slt360_password_changed() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.encrypted_password is distinct from old.encrypted_password
     and coalesce(new.encrypted_password, '') <> '' then
    update public.slt360_profiles
      set must_change_password = false, password_changed_at = now()
      where id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function public.slt360_password_changed() from public, anon, authenticated;
create trigger slt360_on_password_changed
after update of encrypted_password on auth.users
for each row execute function public.slt360_password_changed();
commit;
