begin;

-- O diretório de analistas é independente das contas. O vínculo com um usuário
-- continua opcional e é feito posteriormente pela administração de acessos.
create function public.slt_admin_create_analyst(analyst_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_name text := btrim(coalesce(analyst_name, ''));
  analyst_id uuid;
  analyst_created_at timestamptz;
  result jsonb;
begin
  perform slt_private.require_admin(auth.uid());

  if length(clean_name) not between 2 and 160 then
    raise exception 'Informe um nome de analista entre 2 e 160 caracteres' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('slt-analyst-management', 0));
  if exists (
    select 1
    from public.slt_core_analysts
    where lower(btrim(nome)) = lower(clean_name)
  ) then
    raise exception 'Este analista já está cadastrado' using errcode = '23505';
  end if;

  insert into public.slt_core_analysts(nome)
  values (clean_name)
  returning id, created_at into analyst_id, analyst_created_at;

  result := jsonb_build_object(
    'id', analyst_id,
    'nome', clean_name,
    'created_at', analyst_created_at
  );

  insert into public.slt_core_access_audit(actor, target_id, operation, before_values, after_values)
  values (auth.uid(), analyst_id, 'create_analyst', null, result);

  return result;
end
$$;

revoke all on function public.slt_admin_create_analyst(text) from public, anon, authenticated;
grant execute on function public.slt_admin_create_analyst(text) to authenticated;

notify pgrst, 'reload schema';
commit;
