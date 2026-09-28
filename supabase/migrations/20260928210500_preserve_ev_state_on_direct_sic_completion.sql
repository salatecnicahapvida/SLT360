create or replace function slt_private.guard_analyst_demand_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role text;
  sic_type boolean;
  waiver jsonb;
  waiver_version integer;
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
    waiver := new.extra->'sicDirectorWaiver';
    waiver_version := case
      when coalesce(waiver->>'version', '') ~ '^[0-9]+$' then (waiver->>'version')::integer
      else 0
    end;

    if sic_type
       and (old.extra->'sicDirectorWaiver') is distinct from waiver then
      if waiver_version = 1 then
        if actor_role not in ('Admin', 'Gestor') then
          raise exception 'Somente Gestor ou Admin pode registrar a dispensa da aprovação da Diretoria'
            using errcode = '42501';
        end if;
        if jsonb_typeof(waiver) <> 'object'
           or length(trim(coalesce(waiver->>'reason', ''))) < 10
           or trim(coalesce(waiver->>'waivedAt', '')) = ''
           or trim(coalesce(waiver->>'waivedBy', '')) = ''
           or coalesce(waiver->>'waivedById', '') <> auth.uid()::text then
          raise exception 'A dispensa da Diretoria exige justificativa, data e identificação do Gestor/Admin responsável'
            using errcode = '23514';
        end if;
      elsif waiver_version = 2 then
        if old.phase <> 'validadoObras'
           or new.phase <> 'concluido'
           or jsonb_typeof(waiver) <> 'object'
           or coalesce(waiver->>'required', '') <> 'false'
           or coalesce(waiver->>'sourcePhase', '') <> 'validadoObras'
           or trim(coalesce(waiver->>'waivedAt', '')) = ''
           or trim(coalesce(waiver->>'waivedBy', '')) = ''
           or coalesce(waiver->>'waivedById', '') <> auth.uid()::text
           or jsonb_typeof(waiver->'confirmedAmount') <> 'number'
           or new.generated_amount is null
           or abs(new.generated_amount - (waiver->>'confirmedAmount')::numeric) >= 0.01
           or new.delivered_on is null then
          raise exception 'A conclusão direta exige confirmação da dispensa, do usuário e do valor da SIC'
            using errcode = '23514';
        end if;
      else
        raise exception 'O registro de dispensa da Diretoria é inválido'
          using errcode = '23514';
      end if;
    end if;

    if sic_type
       and new.phase = 'aprovacaoDiretoria'
       and old.phase is distinct from new.phase then
      if old.phase <> 'validadoObras' then
        raise exception 'Aguardando Aprovação Diretoria só pode ser acessado a partir de Validado Obras'
          using errcode = '42501';
      end if;
      if actor_role not in ('Admin', 'Gestor') then
        raise exception 'Somente Gestor ou Admin pode mover uma SIC de Validado Obras para Aguardando Aprovação Diretoria'
          using errcode = '42501';
      end if;
    end if;

    if sic_type
       and new.phase = 'aprovadoDiretoria'
       and old.phase is distinct from new.phase then
      if old.phase <> 'aprovacaoDiretoria' then
        raise exception 'Aprovado Diretoria só pode ser acessado a partir de Aguardando Aprovação Diretoria'
          using errcode = '42501';
      end if;
      if actor_role not in ('Admin', 'Gestor') then
        raise exception 'Somente Gestor ou Admin pode mover uma SIC de Aguardando Aprovação Diretoria para Aprovado Diretoria'
          using errcode = '42501';
      end if;
      if jsonb_typeof(new.extra->'sicDirectorDecision') <> 'object'
         or coalesce((new.extra#>>'{sicDirectorDecision,version}')::integer, 0) <> 1
         or jsonb_typeof(new.extra#>'{sicDirectorDecision,finalAmount}') <> 'number'
         or new.generated_amount is null
         or abs(new.generated_amount - (new.extra#>>'{sicDirectorDecision,finalAmount}')::numeric) >= 0.01 then
        raise exception 'Confirme o valor aprovado pela Diretoria antes de mover a SIC'
          using errcode = '23514';
      end if;
    end if;

    if sic_type
       and new.phase = 'concluido'
       and old.phase is distinct from new.phase
       and old.phase <> 'aprovadoDiretoria' then
      if old.phase = 'validadoObras' then
        if waiver_version <> 2
           or coalesce(waiver->>'required', '') <> 'false'
           or coalesce(waiver->>'sourcePhase', '') <> 'validadoObras'
           or coalesce(waiver->>'waivedById', '') <> auth.uid()::text
           or jsonb_typeof(waiver->'confirmedAmount') <> 'number'
           or new.generated_amount is null
           or abs(new.generated_amount - (waiver->>'confirmedAmount')::numeric) >= 0.01 then
          raise exception 'Confirme que a SIC não necessita da Diretoria e informe o valor antes de concluir'
            using errcode = '42501';
        end if;
      elsif old.phase = 'aprovacaoDiretoria' then
        if actor_role not in ('Admin', 'Gestor')
           or waiver_version <> 1
           or length(trim(coalesce(waiver->>'reason', ''))) < 10
           or trim(coalesce(waiver->>'waivedAt', '')) = ''
           or trim(coalesce(waiver->>'waivedBy', '')) = ''
           or trim(coalesce(waiver->>'waivedById', '')) = '' then
          raise exception 'Uma SIC só pode ser concluída após aprovação da Diretoria ou dispensa auditada por Gestor/Admin'
            using errcode = '42501';
        end if;
      else
        raise exception 'A conclusão direta da SIC só é permitida a partir de Validado Obras'
          using errcode = '42501';
      end if;
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
