begin;

-- Marco de transição para o status manual do EV.
-- Todos os EVs que já existem nesta data passam a ser considerados completos.
-- A partir daqui, novos EVs começam incompletos e alterações posteriores
-- preservam a escolha explícita feita no próprio editor do EV.
update public.slt_budget_estimates
set status = 'Completo',
    revision = revision + 1,
    updated_at = now(),
    updated_by = null
where deleted_at is null
  and status is distinct from 'Completo';

commit;
