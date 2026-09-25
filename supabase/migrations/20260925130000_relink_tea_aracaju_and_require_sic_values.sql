begin;

-- Corrige a SIC 1.389.229 pelo cadastro oficial do EV, sem depender de IDs
-- gerados. O registro de 2026 "(Arauá)" permanece intacto porque é outro
-- cadastro e não possui EV.
do $$
declare
  target_work public.slt_projects_works%rowtype;
  matching_works integer;
  matching_demands integer;
  official_ev numeric;
begin
  select count(*)
    into matching_demands
  from public.slt_budget_demands demand
  where demand.deleted_at is null
    and regexp_replace(coalesce(demand.extra#>>'{sicMetadata,lecomNumber}', demand.extra#>>'{sicMetadata,numeroSic}', ''), '[^0-9]+', '', 'g') = '1389229';

  -- Ambientes novos e bancos de teste não possuem esse dado histórico.
  if matching_demands = 0 then
    return;
  end if;
  if matching_demands <> 1 then
    raise exception 'SIC 1.389.229 ambígua: esperado exatamente um card ativo, encontrados %', matching_demands;
  end if;

  select count(*)
    into matching_works
  from public.slt_projects_works work
  where work.deleted_at is null
    and work.code = '9078'
    and work.name = '9078. Novo TEA Aracaju'
    and work.extra->>'_dadosEvsOfficial' = 'true';

  if matching_works <> 1 then
    raise exception 'Vínculo 9078 ambíguo: esperado exatamente um cadastro oficial de Novo TEA Aracaju, encontrados %', matching_works;
  end if;

  select work.*
    into target_work
  from public.slt_projects_works work
  where work.deleted_at is null
    and work.code = '9078'
    and work.name = '9078. Novo TEA Aracaju'
    and work.extra->>'_dadosEvsOfficial' = 'true';

  select round(coalesce(sum(line.budgeted_amount) filter (
      where regexp_replace(translate(lower(coalesce(line.discipline_id, '')), 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'), '[^a-z0-9]+', '', 'g') <> 'taxarisco'
        and regexp_replace(translate(lower(coalesce(line.status, '')), 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'), '[^a-z0-9]+', '', 'g') <> 'naoseaplica'
    ), 0), 2)
    into official_ev
  from public.slt_budget_estimates estimate
  join public.slt_budget_estimate_lines line
    on line.parent_key = estimate.record_key
   and line.deleted_at is null
  where estimate.parent_key = target_work.record_key
    and estimate.deleted_at is null;

  if official_ev <> 1629603.55 then
    raise exception 'EV oficial inesperado para 9078. Novo TEA Aracaju: %', official_ev;
  end if;

  update public.slt_budget_demands demand
  set work_id = target_work.record_key,
      work_name = target_work.name,
      extra = jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                coalesce(demand.extra, '{}'::jsonb),
                '{sicMetadata,obraNumber}', to_jsonb(target_work.code), true
              ),
              '{sicMetadata,obraNome}', to_jsonb(target_work.name), true
            ),
            '{unidadeNome}', to_jsonb(target_work.name), true
          ),
          '{unidadeCentro}', to_jsonb(target_work.code), true
        ),
        '{unidadeTipo}', to_jsonb(coalesce(nullif(target_work.extra->>'tipoUnidade', ''), 'TEA')), true
      ),
      revision = demand.revision + 1,
      updated_at = now()
  where demand.deleted_at is null
    and regexp_replace(coalesce(demand.extra#>>'{sicMetadata,lecomNumber}', demand.extra#>>'{sicMetadata,numeroSic}', ''), '[^0-9]+', '', 'g') = '1389229'
    and (
      demand.work_id is distinct from target_work.record_key
      or demand.work_name is distinct from target_work.name
      or demand.extra#>>'{sicMetadata,obraNumber}' is distinct from target_work.code
      or demand.extra#>>'{sicMetadata,obraNome}' is distinct from target_work.name
    );
end
$$;

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
       and old.phase = 'validacaoObras'
       and new.phase = 'validadoObras'
       and old.phase is distinct from new.phase then
      if jsonb_typeof(new.extra->'sicWorksValidation') <> 'object'
         or coalesce((new.extra#>>'{sicWorksValidation,version}')::integer, 0) <> 1
         or jsonb_typeof(new.extra#>'{sicWorksValidation,amount}') <> 'number'
         or new.generated_amount is null
         or abs(new.generated_amount - (new.extra#>>'{sicWorksValidation,amount}')::numeric) >= 0.01 then
        raise exception 'Informe o valor validado por Obras antes de mover a SIC para Validado Obras'
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
      raise exception 'Uma SIC só pode ser concluída após estar em Aprovado Diretoria'
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
