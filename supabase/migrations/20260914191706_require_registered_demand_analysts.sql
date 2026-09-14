begin;

create or replace function slt_private.require_registered_demand_analysts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  analyst_name text;
  canonical_name text;
  canonical_id uuid;
  canonical_complementaries jsonb := '[]'::jsonb;
begin
  analyst_name := nullif(btrim(coalesce(new.assignee, '')), '');
  if analyst_name is null then
    new.assignee_id := null;
  else
    select analyst.nome, analyst.id
      into canonical_name, canonical_id
      from public.slt_core_analysts analyst
     where lower(btrim(analyst.nome)) = lower(analyst_name)
     limit 1;
    if canonical_id is null then
      raise exception 'Analista não cadastrado em Configurações: %', analyst_name
        using errcode = '23503';
    end if;
    new.assignee := canonical_name;
    new.assignee_id := canonical_id;
  end if;

  if jsonb_typeof(new.extra->'analistasComplementares') = 'array' then
    for analyst_name in
      select nullif(btrim(value), '')
        from jsonb_array_elements_text(new.extra->'analistasComplementares')
    loop
      continue when analyst_name is null;
      canonical_name := null;
      select analyst.nome
        into canonical_name
        from public.slt_core_analysts analyst
       where lower(btrim(analyst.nome)) = lower(analyst_name)
       limit 1;
      if canonical_name is null then
        raise exception 'Analista complementar não cadastrado em Configurações: %', analyst_name
          using errcode = '23503';
      end if;
      canonical_complementaries := canonical_complementaries || jsonb_build_array(canonical_name);
    end loop;
    new.extra := jsonb_set(new.extra, '{analistasComplementares}', canonical_complementaries, false);
  end if;

  analyst_name := nullif(btrim(coalesce(new.extra #>> '{sicMetadata,analistaSalaTecnica}', '')), '');
  if analyst_name is not null then
    canonical_name := null;
    select analyst.nome
      into canonical_name
      from public.slt_core_analysts analyst
     where lower(btrim(analyst.nome)) = lower(analyst_name)
     limit 1;
    if canonical_name is null then
      raise exception 'Analista da Sala Técnica não cadastrado em Configurações: %', analyst_name
        using errcode = '23503';
    end if;
    new.extra := jsonb_set(
      new.extra,
      '{sicMetadata,analistaSalaTecnica}',
      to_jsonb(canonical_name),
      false
    );
  end if;

  return new;
end;
$$;

revoke all on function slt_private.require_registered_demand_analysts() from public, anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'projects_demands',
    'budget_demands',
    'budget_archived_demands',
    'maintenance_orders',
    'clinical_orders',
    'maintenance_archived_orders',
    'clinical_archived_orders'
  ]
  loop
    execute format(
      'drop trigger if exists require_registered_demand_analysts on public.%I',
      'slt_' || table_name
    );
    execute format(
      'create trigger require_registered_demand_analysts before insert or update of assignee, extra on public.%I for each row execute function slt_private.require_registered_demand_analysts()',
      'slt_' || table_name
    );
  end loop;
end;
$$;

commit;
