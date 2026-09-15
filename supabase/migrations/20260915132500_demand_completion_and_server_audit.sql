begin;

alter table public.slt_budget_demands
  add column if not exists generated_amount numeric,
  add column if not exists ev_no_change boolean;

update slt_private.entity_catalog
set definition = jsonb_set(
  jsonb_set(
    definition,
    '{fields,valorGerado}',
    '{"name":"generated_amount","type":"numeric"}'::jsonb,
    true
  ),
  '{fields,evSemMudanca}',
  '{"name":"ev_no_change","type":"boolean"}'::jsonb,
  true
)
where name='budget_demands';

create or replace function slt_private.sync_change_history_entry(log_row public.slt_core_change_log)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_name text;
  entity_label text;
  history_key text := 'AUD-' || log_row.id::text;
  document jsonb;
begin
  if log_row.entity='core_history' then return; end if;
  if exists(select 1 from public.slt_core_history where record_key=history_key) then return; end if;

  select p.nome into actor_name
  from public.slt360_profiles p
  where p.id=log_row.actor;

  entity_label := case
    when log_row.entity='budget_demands' then 'demanda'
    when log_row.entity='budget_sics' then 'sic'
    when log_row.entity in ('budget_estimates','budget_estimate_lines','budget_estimate_versions') then 'ev'
    when log_row.entity='budget_contracts' then 'contratacao'
    when log_row.entity like 'maintenance_%' then 'manutencao'
    when log_row.entity like 'clinical_%' then 'clinica'
    when log_row.entity like 'finance_%' then 'verba'
    when log_row.entity='projects_works' then 'obra'
    when log_row.entity='core_sprints' then 'sprint'
    else log_row.entity
  end;

  document := jsonb_build_object(
    'id', history_key,
    'entidade', entity_label,
    'entidadeId', log_row.record_key,
    'campo', case log_row.operation when 'insert' then 'criação' when 'delete' then 'exclusão' else 'atualização' end,
    'usuario', coalesce(actor_name,'Sistema'),
    'timestamp', to_char(log_row.created_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'valorAnterior', case log_row.operation when 'insert' then 'Não existia' when 'delete' then 'Registro ativo' else 'Versão anterior' end,
    'valorNovo', case log_row.operation when 'insert' then 'Registro criado no banco' when 'delete' then 'Registro excluído ou arquivado no banco' else 'Registro atualizado no banco' end
  );

  perform slt_private.put_record(
    jsonb_build_object(
      'entity','core_history',
      'key',history_key,
      'operation','upsert',
      'expected_revision',0,
      'ordinal',-log_row.id,
      'child_fields','[]'::jsonb,
      'document',document
    ),
    log_row.actor,
    true
  );
end
$$;

create or replace function slt_private.mirror_change_log_to_history()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  perform slt_private.sync_change_history_entry(new);
  return new;
end
$$;

drop trigger if exists slt_mirror_change_log_to_history on public.slt_core_change_log;
create trigger slt_mirror_change_log_to_history
after insert on public.slt_core_change_log
for each row execute function slt_private.mirror_change_log_to_history();

do $$
declare
  log_row public.slt_core_change_log;
begin
  for log_row in
    select l.*
    from public.slt_core_change_log l
    where l.entity<>'core_history'
      and not exists(select 1 from public.slt_core_history h where h.record_key='AUD-'||l.id::text)
    order by l.id
  loop
    perform slt_private.sync_change_history_entry(log_row);
  end loop;
end
$$;

notify pgrst, 'reload schema';
commit;
