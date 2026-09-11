do $$
declare
  canonical_analyst_id uuid;
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

  update public.slt_budget_demands
  set
    assignee = 'Skarth',
    assignee_id = canonical_analyst_id,
    extra = case
      when lower(btrim(coalesce(extra #>> '{sicMetadata,analistaSalaTecnica}', ''))) = 'skart'
        then jsonb_set(extra, '{sicMetadata,analistaSalaTecnica}', to_jsonb('Skarth'::text), false)
      else extra
    end,
    revision = revision + 1,
    updated_at = now()
  where deleted_at is null
    and lower(btrim(coalesce(assignee, ''))) = 'skart';
end
$$;
