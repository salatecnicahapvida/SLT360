create table if not exists slt_private.budget_demand_versions (
  id bigint generated always as identity primary key,
  record_key text not null,
  operation text not null check (operation in ('INSERT','UPDATE','DELETE')),
  actor uuid,
  before_values jsonb,
  after_values jsonb,
  changed_at timestamptz not null default now()
);

create index if not exists budget_demand_versions_record_key_idx
  on slt_private.budget_demand_versions(record_key, changed_at desc);

create or replace function slt_private.capture_budget_demand_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if tg_op = 'INSERT' then
    insert into slt_private.budget_demand_versions(record_key,operation,actor,before_values,after_values)
    values(new.record_key,'INSERT',auth.uid(),null,to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    insert into slt_private.budget_demand_versions(record_key,operation,actor,before_values,after_values)
    values(new.record_key,'UPDATE',auth.uid(),to_jsonb(old),to_jsonb(new));
  elsif tg_op = 'DELETE' then
    insert into slt_private.budget_demand_versions(record_key,operation,actor,before_values,after_values)
    values(old.record_key,'DELETE',auth.uid(),to_jsonb(old),null);
  end if;
  return null;
end
$function$;

drop trigger if exists capture_budget_demand_version on public.slt_budget_demands;
create trigger capture_budget_demand_version
after insert or update or delete on public.slt_budget_demands
for each row execute function slt_private.capture_budget_demand_version();

create or replace function public.slt_commit_changes(request_id uuid, changes jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare actor_id uuid=auth.uid(); input_hash text; receipt slt_private.write_receipts; change jsonb; cfg jsonb; previous jsonb; current_row jsonb; new_revision bigint; results jsonb='[]'; operation text; batch_keys integer;
begin
 if not (select active from slt_private.release_state where id=1) then raise exception 'Atualize o sistema para continuar' using errcode='55000'; end if;
 if actor_id is null or not exists(select 1 from public.slt360_profiles where id=actor_id and ativo and not must_change_password) then raise exception 'Acesso negado' using errcode='42501'; end if;
 if request_id is null or jsonb_typeof(changes) is distinct from 'array' or jsonb_array_length(changes)>5000 or octet_length(changes::text)>12000000 then raise exception 'Lote inválido' using errcode='22023'; end if;
 input_hash=md5(changes::text);
 perform pg_advisory_xact_lock(hashtextextended(actor_id::text||request_id::text,0));
 select * into receipt from slt_private.write_receipts r where r.actor=actor_id and r.request_id=slt_commit_changes.request_id;
 if found then
  if receipt.input_hash<>input_hash then raise exception 'Chave de operação reutilizada' using errcode='22023'; end if;
  return receipt.result;
 end if;
 select count(distinct (v->>'entity',v->>'key')) into batch_keys from jsonb_array_elements(changes) v;
 if batch_keys<>jsonb_array_length(changes) then raise exception 'Registro repetido no lote' using errcode='22023'; end if;

 if exists (
   select 1
   from jsonb_array_elements(changes) d
   where d->>'entity'='budget_demands'
     and d->>'operation'='delete'
     and not exists (
       select 1
       from jsonb_array_elements(changes) a
       where a->>'entity'='budget_archived_demands'
         and a->>'operation'='upsert'
         and a->>'key'=d->>'key'
     )
 ) then
   raise exception 'Exclusão de demanda exige arquivamento explícito' using errcode='22023';
 end if;

 for change in select value from jsonb_array_elements(changes) loop
  select definition into cfg from slt_private.entity_catalog where name=change->>'entity';
  if cfg is null then raise exception 'Entidade desconhecida' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('slt_'||(cfg->>'name')||'/'||(change->>'key'),0));
  execute format('select to_jsonb(t) from public.%I t where record_key=$1','slt_'||(cfg->>'name')) into previous using change->>'key';
  new_revision=slt_private.put_record(change,actor_id,false);
  execute format('select to_jsonb(t) from public.%I t where record_key=$1','slt_'||(cfg->>'name')) into current_row using change->>'key';
  operation=case when change->>'operation'='delete' then 'delete' when previous is null then 'insert' else 'update' end;
  insert into public.slt_core_change_log(module,entity,record_key,operation,actor,request_id,before_values,after_values)
   values(cfg->>'module',cfg->>'name',change->>'key',operation,actor_id,slt_commit_changes.request_id,previous,current_row);
  results=results||jsonb_build_array(jsonb_build_object('entity',cfg->>'name','key',change->>'key','revision',new_revision));
 end loop;
 insert into slt_private.write_receipts(actor,request_id,input_hash,result) values(actor_id,request_id,input_hash,results);
 return results;
end
$function$;
