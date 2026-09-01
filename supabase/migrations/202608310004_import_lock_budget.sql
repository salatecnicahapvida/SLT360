-- Import runs while the modular API is disabled and the legacy row is locked.
-- Avoid one advisory lock per imported row on the Supabase Free plan.
-- Ordinary writes retain the per-record concurrency guard.
begin;
create or replace function slt_private.put_record(change jsonb, actor_id uuid, importing boolean default false) returns bigint language plpgsql set search_path='' as $$
declare cfg jsonb; item jsonb=change->'document'; key text=change->>'key'; tab text; before_row jsonb; values_json jsonb; fld record; value jsonb; columns_sql text; values_sql text; updates_sql text; expected bigint; next_revision bigint; empty_keys text[]='{}'; present_keys text[]='{}'; string_keys text[]='{}'; allowed_children text[]; child text; other record; has_dependents boolean;
begin
 select definition into cfg from slt_private.entity_catalog where name=change->>'entity';
 if cfg is null then raise exception 'Entidade desconhecida' using errcode='22023'; end if;
 tab='slt_'||(cfg->>'name');
 if not importing and (coalesce((cfg->>'readonly')::boolean,false) or not public.slt_has_module_access(cfg->>'module',true)) then raise exception 'Sem permissão de gravação neste módulo' using errcode='42501'; end if;
 if length(key) not between 1 and 1500 then raise exception 'Identificador inválido' using errcode='22023'; end if;
 if not importing then perform pg_advisory_xact_lock(hashtextextended(tab||'/'||key,0)); end if;
 execute format('select to_jsonb(t) from public.%I t where record_key=$1 for update',tab) into before_row using key;
 expected=coalesce((change->>'expected_revision')::bigint,0);
 if not importing and (coalesce((before_row->>'revision')::bigint,0)<>expected or before_row->>'deleted_at' is not null) then raise exception 'Registro alterado em outra sessão: %',tab using errcode='40001'; end if;
 next_revision=coalesce((before_row->>'revision')::bigint,0)+1;
 if change->>'operation'='delete' then
  if before_row is null then raise exception 'Registro inexistente' using errcode='22023'; end if;
  for other in select name,definition from slt_private.entity_catalog where definition->>'parent'=cfg->>'name' loop
   execute format('select exists(select 1 from public.%I where parent_key=$1 and deleted_at is null)','slt_'||other.name) into has_dependents using key;
   if has_dependents then raise exception 'Exclua os registros dependentes primeiro' using errcode='23503'; end if;
  end loop;
  execute format('update public.%I set deleted_at=now(),updated_at=now(),updated_by=$2,revision=$3 where record_key=$1',tab) using key,actor_id,next_revision;
  return next_revision;
 end if;
 if jsonb_typeof(item) is distinct from 'object' or item ?| array['password','senha','users','activeRole'] then raise exception 'Registro inválido' using errcode='22023'; end if;
 select coalesce(array_agg(definition->>'child'),'{}') into allowed_children from slt_private.entity_catalog where definition->>'parent'=cfg->>'name';
 if item ?| allowed_children then raise exception 'Filhos devem usar as próprias tabelas' using errcode='22023'; end if;
 if not array(select jsonb_array_elements_text(coalesce(change->'child_fields','[]'))) <@ allowed_children then raise exception 'Relação inválida' using errcode='22023'; end if;
 values_json=jsonb_build_object('record_key',key,'ordinal',coalesce(change->'ordinal','0'),'parent_key',change->'parent_key','child_fields',coalesce(change->'child_fields','[]'),'revision',next_revision,'updated_at',now(),'updated_by',actor_id,'deleted_at',null);
 for fld in select j.key,j.value from jsonb_each(cfg->'fields') j loop
  value=coalesce(item->fld.key,'null'::jsonb);
  if item ? fld.key then present_keys=array_append(present_keys,fld.key); end if;
  if jsonb_typeof(value)='string' and fld.value->>'type' in ('numeric','integer') then string_keys=array_append(string_keys,fld.key); end if;
  if value='""'::jsonb and (fld.value->>'type'<>'text' or fld.value ? 'reference') then empty_keys=array_append(empty_keys,fld.key); value='null'::jsonb; end if;
  values_json=values_json||jsonb_build_object(fld.value->>'name',value);
 end loop;
 values_json=values_json||jsonb_build_object('field_keys',present_keys,'empty_fields',empty_keys,'string_fields',string_keys,'extra',item-array(select jsonb_object_keys(cfg->'fields')));
 select string_agg(format('%I',k),','), string_agg(format('v.%I',k),','), string_agg(format('%I=excluded.%I',k,k),',') into columns_sql,values_sql,updates_sql from jsonb_object_keys(values_json) k;
 execute format('insert into public.%I(%s) select %s from jsonb_populate_record(null::public.%I,$1) v on conflict(record_key) do update set %s',tab,columns_sql,values_sql,tab,updates_sql) using values_json;
 return next_revision;
end $$;
revoke all on function slt_private.put_record(jsonb,uuid,boolean) from public,anon,authenticated;
commit;
