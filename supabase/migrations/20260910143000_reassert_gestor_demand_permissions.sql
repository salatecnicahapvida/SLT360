begin;

-- A autorização gravada para o módulo também vale para Gestores. Esta
-- redefinição corrige instalações que ainda restringem a escrita ao Admin.
create or replace function public.slt_has_module_access(module_key text, writing boolean default false)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1
    from public.slt360_profiles profile
    where profile.id = auth.uid()
      and profile.ativo
      and not profile.must_change_password
      and (
        profile.perfil = 'Admin'
        or exists(
          select 1
          from public.slt_core_module_access access
          where access.user_id = profile.id
            and access.module = module_key
            and access.can_read
            and (not writing or access.can_write)
        )
      )
  );
$$;

revoke all on function public.slt_has_module_access(text, boolean) from public, anon;
grant execute on function public.slt_has_module_access(text, boolean) to authenticated;

-- Analistas podem editar demandas existentes. Admin e Gestor com permissão
-- de escrita podem criar, arquivar e restaurar demandas.
create or replace function slt_private.guard_analyst_demand_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role text;
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  select profile.perfil
    into actor_role
  from public.slt360_profiles profile
  where profile.id = auth.uid()
    and profile.ativo
    and not profile.must_change_password;

  if actor_role is null then
    raise exception 'Sessão sem perfil ativo para alterar demandas'
      using errcode = '42501';
  end if;

  if actor_role = 'Analista'
     and (
       tg_op in ('INSERT', 'DELETE')
       or (tg_op = 'UPDATE' and ((old.deleted_at is null) <> (new.deleted_at is null)))
     ) then
    raise exception 'Analistas podem alterar e mover demandas existentes, mas não podem criar ou excluir demandas'
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end
$$;

revoke all on function slt_private.guard_analyst_demand_lifecycle() from public, anon, authenticated;

commit;
