select pg_advisory_xact_lock(hashtextextended('slt360:remove-other-work-category', 0));

update public.slt_projects_works
set
  extra = jsonb_set(coalesce(extra, '{}'::jsonb), '{classificacaoObra}', to_jsonb(''::text), true),
  revision = revision + 1,
  updated_at = now()
where deleted_at is null
  and lower(btrim(coalesce(extra->>'classificacaoObra', ''))) in ('outro', 'outros', 'otro', 'otros');

update public.slt_core_configuration_catalog
set
  deleted_at = coalesce(deleted_at, now()),
  revision = revision + 1,
  updated_at = now()
where catalog_type = 'category'
  and deleted_at is null
  and lower(btrim(label)) in ('outro', 'outros', 'otro', 'otros');

do $$
begin
  if exists (
    select 1
    from public.slt_projects_works
    where deleted_at is null
      and lower(btrim(coalesce(extra->>'classificacaoObra', ''))) in ('outro', 'outros', 'otro', 'otros')
  ) then
    raise exception 'Ainda existem obras classificadas como Outros';
  end if;

  if exists (
    select 1
    from public.slt_core_configuration_catalog
    where catalog_type = 'category'
      and deleted_at is null
      and lower(btrim(label)) in ('outro', 'outros', 'otro', 'otros')
  ) then
    raise exception 'A categoria Outros ainda está ativa na configuração';
  end if;
end;
$$;
