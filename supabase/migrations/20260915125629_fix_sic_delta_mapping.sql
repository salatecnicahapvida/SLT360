-- Corrige a persistência relacional do valor delta informado nas disciplinas de uma SIC.
-- O frontend usa `valorDelta`; o catálogo antigo esperava `delta`, fazendo o valor cair em `extra`.

update slt_private.entity_catalog
set definition = jsonb_set(
  definition,
  '{fields}',
  ((definition->'fields') - 'delta') || jsonb_build_object(
    'valorDelta',
    jsonb_build_object('name','delta_amount','type','numeric')
  )
)
where name = 'budget_sic_items';

-- Compatibilidade para eventual registro produzido antes desta correção.
update public.slt_budget_sic_items
set delta_amount = case
      when (extra->>'valorDelta') ~ '^[-+]?[0-9]+([.,][0-9]+)?$'
        then replace(extra->>'valorDelta', ',', '.')::numeric
      else delta_amount
    end,
    extra = case
      when (extra->>'valorDelta') ~ '^[-+]?[0-9]+([.,][0-9]+)?$'
        then extra - 'valorDelta'
      else extra
    end
where delta_amount is null
  and extra ? 'valorDelta';
