begin;

create or replace function slt_private.guard_analyst_demand_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role text;
  sic_type boolean;
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

  if tg_table_name = 'slt_budget_demands' and tg_op = 'UPDATE' then
    sic_type := coalesce(new.type, '') in (
      'SIC',
      'Solicitação de Informações',
      'Solicitacao de Informacoes',
      'Solicitação de Informação',
      'Solicitacao de Informacao'
    );

    if sic_type
       and new.phase = 'aprovadoDiretoria'
       and old.phase is distinct from new.phase then
      if old.phase <> 'aprovacaoDiretoria' then
        raise exception 'Aprovado Pela Diretoria só pode ser acessado a partir de Aguardando Aprovação Diretoria'
          using errcode = '42501';
      end if;
      if actor_role not in ('Admin', 'Gestor') then
        raise exception 'Somente Gestor ou Admin pode aprovar uma SIC pela Diretoria'
          using errcode = '42501';
      end if;
    end if;

    if sic_type
       and new.phase = 'concluido'
       and old.phase is distinct from new.phase
       and old.phase <> 'aprovadoDiretoria' then
      raise exception 'Uma SIC só pode ser concluída após estar em Aprovado Pela Diretoria'
        using errcode = '42501';
    end if;

    if new.phase = 'concluido'
       and old.phase is distinct from new.phase
       and new.delivered_on is null then
      raise exception 'Data entrega real é obrigatória para concluir a demanda'
        using errcode = '23514';
    end if;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end
$$;

revoke all on function slt_private.guard_analyst_demand_lifecycle() from public, anon, authenticated;

commit;
