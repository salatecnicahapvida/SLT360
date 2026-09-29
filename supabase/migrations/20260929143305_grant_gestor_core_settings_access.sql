begin;

create or replace function public.slt_has_module_access(module_key text, writing boolean default false)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when module_key = 'projects' then false
    when module_key = 'core' then exists(
      select 1
      from public.slt360_profiles p
      where p.id = (select auth.uid())
        and p.ativo
        and not p.must_change_password
        and p.perfil in ('Admin', 'Gestor')
    )
    else exists(
      select 1
      from public.slt360_profiles p
      where p.id = (select auth.uid())
        and p.ativo
        and not p.must_change_password
        and (
          p.perfil = 'Admin'
          or exists(
            select 1
            from public.slt_core_module_access g
            where g.user_id = p.id
              and g.module = module_key
              and g.can_read
              and (not writing or g.can_write)
          )
        )
    )
  end;
$$;

revoke all on function public.slt_has_module_access(text, boolean) from public, anon;
grant execute on function public.slt_has_module_access(text, boolean) to authenticated;

notify pgrst, 'reload schema';
commit;
