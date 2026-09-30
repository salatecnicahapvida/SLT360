begin;

create table if not exists public.slt_budget_deletion_audit (
  id bigint generated always as identity primary key,
  entity_type text not null check (entity_type in ('ev','work')),
  work_key text not null,
  justification text not null check (char_length(btrim(justification)) >= 5),
  deleted_at timestamptz not null default now(),
  deleted_by uuid not null default auth.uid()
);

alter table public.slt_budget_deletion_audit enable row level security;
revoke all on table public.slt_budget_deletion_audit from anon, authenticated;
grant select, insert on table public.slt_budget_deletion_audit to authenticated;
grant usage, select on sequence public.slt_budget_deletion_audit_id_seq to authenticated;

drop policy if exists budget_deletion_audit_read on public.slt_budget_deletion_audit;
create policy budget_deletion_audit_read on public.slt_budget_deletion_audit
  for select to authenticated
  using ((select public.slt_has_module_access('budget', false)));

drop policy if exists budget_deletion_audit_insert on public.slt_budget_deletion_audit;
create policy budget_deletion_audit_insert on public.slt_budget_deletion_audit
  for insert to authenticated
  with check ((select public.slt_has_module_access('budget', true)) and deleted_by = (select auth.uid()));

create or replace function public.slt_budget_delete_ev(work_key text, justification text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  estimate_key text;
begin
  if not public.slt_has_module_access('budget', true) then
    raise exception 'Seu perfil não permite excluir EVs.' using errcode='42501';
  end if;
  if char_length(btrim(coalesce(justification,''))) < 5 then
    raise exception 'Informe uma justificativa com pelo menos 5 caracteres.' using errcode='22023';
  end if;

  select record_key into estimate_key
  from public.slt_budget_estimates
  where parent_key = work_key and deleted_at is null
  order by updated_at desc nulls last
  limit 1;

  if estimate_key is null then
    raise exception 'Esta obra não possui EV ativo para excluir.' using errcode='P0002';
  end if;

  update public.slt_budget_estimate_lines
     set deleted_at=now(), updated_at=now(), updated_by=auth.uid(), revision=revision+1
   where parent_key=estimate_key and deleted_at is null;

  update public.slt_budget_estimate_versions
     set deleted_at=now(), updated_at=now(), updated_by=auth.uid(), revision=revision+1
   where parent_key=estimate_key and deleted_at is null;

  update public.slt_budget_estimates
     set deleted_at=now(), updated_at=now(), updated_by=auth.uid(), revision=revision+1
   where record_key=estimate_key and deleted_at is null;

  delete from public.slt_budget_ev_pending_items where work_id=work_key;
  delete from public.slt_budget_ev_tracking where work_id=work_key;

  insert into public.slt_budget_deletion_audit(entity_type,work_key,justification,deleted_by)
  values ('ev',work_key,btrim(justification),auth.uid());
end;
$$;

revoke all on function public.slt_budget_delete_ev(text,text) from public, anon;
grant execute on function public.slt_budget_delete_ev(text,text) to authenticated;

create or replace function public.slt_budget_delete_work(work_key text, justification text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.slt_has_module_access('budget', true) then
    raise exception 'Seu perfil não permite excluir obras.' using errcode='42501';
  end if;
  if char_length(btrim(coalesce(justification,''))) < 5 then
    raise exception 'Informe uma justificativa com pelo menos 5 caracteres.' using errcode='22023';
  end if;
  if exists(select 1 from public.slt_budget_estimates where parent_key=work_key and deleted_at is null) then
    raise exception 'Exclua o EV desta obra antes de excluir a obra.' using errcode='23503';
  end if;
  if exists(select 1 from public.slt_budget_demands where work_id=work_key and deleted_at is null)
     or exists(select 1 from public.slt_budget_sics where work_id=work_key and deleted_at is null)
     or exists(select 1 from public.slt_budget_contracts where work_id=work_key and deleted_at is null)
     or exists(select 1 from public.slt_budget_revisions where (work_id=work_key or obra_id=work_key) and deleted_at is null)
     or exists(select 1 from public.slt_finance_funds where work_id=work_key and deleted_at is null) then
    raise exception 'A obra ainda possui demandas, SICs, contratos, revisões ou verbas vinculadas. Remova/arquive esses vínculos antes da exclusão.' using errcode='23503';
  end if;

  update public.slt_projects_works
     set deleted_at=now(), updated_at=now(), updated_by=auth.uid(), revision=revision+1
   where record_key=work_key and deleted_at is null;

  if not found then
    raise exception 'Obra não localizada ou já excluída.' using errcode='P0002';
  end if;

  insert into public.slt_budget_deletion_audit(entity_type,work_key,justification,deleted_by)
  values ('work',work_key,btrim(justification),auth.uid());
end;
$$;

revoke all on function public.slt_budget_delete_work(text,text) from public, anon;
grant execute on function public.slt_budget_delete_work(text,text) to authenticated;

notify pgrst, 'reload schema';
commit;
