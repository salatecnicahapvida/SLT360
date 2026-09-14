do $$
declare
  canonical_analyst_id uuid;
  entity_name text;
  remaining_count bigint := 0;
  entity_remaining bigint;
begin
  select id
    into canonical_analyst_id
  from public.slt_core_analysts
  where lower(btrim(nome)) = 'skarth'
  order by created_at, id
  limit 1;

  if canonical_analyst_id is null then
    return;
  end if;

  foreach entity_name in array array[
    'projects_demands',
    'budget_demands',
    'budget_archived_demands',
    'maintenance_orders',
    'clinical_orders',
    'maintenance_archived_orders',
    'clinical_archived_orders'
  ] loop
    execute format($update$
      update public.%I
      set
        assignee = case
          when lower(btrim(coalesce(assignee, ''))) = 'skart' then 'Skarth'
          else assignee
        end,
        assignee_id = case
          when lower(btrim(coalesce(assignee, ''))) = 'skart' then $1
          else assignee_id
        end,
        extra = case
          when lower(btrim(coalesce(extra #>> '{sicMetadata,analistaSalaTecnica}', ''))) = 'skart' then
            jsonb_set(
              case
                when exists (
                  select 1
                  from jsonb_array_elements_text(
                    case when jsonb_typeof(extra->'analistasComplementares') = 'array'
                      then extra->'analistasComplementares'
                      else '[]'::jsonb
                    end
                  ) as analyst(name)
                  where lower(btrim(analyst.name)) = 'skart'
                ) then jsonb_set(
                  extra,
                  '{analistasComplementares}',
                  (
                    select jsonb_agg(
                      to_jsonb(case when lower(btrim(analyst.name)) = 'skart' then 'Skarth' else analyst.name end)
                      order by analyst.position
                    )
                    from jsonb_array_elements_text(extra->'analistasComplementares') with ordinality as analyst(name, position)
                  ),
                  false
                )
                else extra
              end,
              '{sicMetadata,analistaSalaTecnica}',
              to_jsonb('Skarth'::text),
              false
            )
          when exists (
            select 1
            from jsonb_array_elements_text(
              case when jsonb_typeof(extra->'analistasComplementares') = 'array'
                then extra->'analistasComplementares'
                else '[]'::jsonb
              end
            ) as analyst(name)
            where lower(btrim(analyst.name)) = 'skart'
          ) then jsonb_set(
            extra,
            '{analistasComplementares}',
            (
              select jsonb_agg(
                to_jsonb(case when lower(btrim(analyst.name)) = 'skart' then 'Skarth' else analyst.name end)
                order by analyst.position
              )
              from jsonb_array_elements_text(extra->'analistasComplementares') with ordinality as analyst(name, position)
            ),
            false
          )
          else extra
        end,
        revision = revision + 1,
        updated_at = now()
      where lower(btrim(coalesce(assignee, ''))) = 'skart'
         or lower(btrim(coalesce(extra #>> '{sicMetadata,analistaSalaTecnica}', ''))) = 'skart'
         or exists (
           select 1
           from jsonb_array_elements_text(
             case when jsonb_typeof(extra->'analistasComplementares') = 'array'
               then extra->'analistasComplementares'
               else '[]'::jsonb
             end
           ) as analyst(name)
           where lower(btrim(analyst.name)) = 'skart'
         )
    $update$, 'slt_' || entity_name)
    using canonical_analyst_id;

    execute format($verify$
      select count(*)
      from public.%I
      where lower(btrim(coalesce(assignee, ''))) = 'skart'
         or lower(btrim(coalesce(extra #>> '{sicMetadata,analistaSalaTecnica}', ''))) = 'skart'
         or exists (
           select 1
           from jsonb_array_elements_text(
             case when jsonb_typeof(extra->'analistasComplementares') = 'array'
               then extra->'analistasComplementares'
               else '[]'::jsonb
             end
           ) as analyst(name)
           where lower(btrim(analyst.name)) = 'skart'
         )
    $verify$, 'slt_' || entity_name)
    into entity_remaining;

    remaining_count := remaining_count + entity_remaining;
  end loop;

  if remaining_count <> 0 then
    raise exception 'Ainda existem % referências ao analista SKART', remaining_count;
  end if;

  delete from public.slt_core_analysts duplicate
  where duplicate.id <> canonical_analyst_id
    and lower(btrim(duplicate.nome)) = 'skart'
    and not exists (
      select 1
      from public.slt360_profiles profile
      where profile.analyst_id = duplicate.id
    );
end
$$;
