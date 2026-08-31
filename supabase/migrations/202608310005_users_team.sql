-- Contas, equipe e autorizações são administradas por operações dedicadas.
begin;
alter table public.slt360_profiles alter column perfil set default 'Analista';
create table public.slt_core_analysts (
 id uuid primary key default gen_random_uuid(), nome text not null unique check(length(btrim(nome)) between 1 and 160),
 created_at timestamptz not null default now()
);
alter table public.slt360_profiles add column analyst_id uuid unique references public.slt_core_analysts(id),
 add column revision bigint not null default 1;
create table public.slt_core_access_audit (
 id bigint generated always as identity primary key, actor uuid references auth.users(id),
 target_id uuid not null, operation text not null, before_values jsonb, after_values jsonb,
 created_at timestamptz not null default now()
);
alter table public.slt_core_analysts enable row level security;
alter table public.slt_core_access_audit enable row level security;
revoke all on public.slt_core_analysts,public.slt_core_access_audit from public,anon,authenticated;
grant select on public.slt_core_analysts,public.slt_core_access_audit to authenticated;
create policy directory_read on public.slt_core_analysts for select to authenticated using (
 exists(select 1 from public.slt360_profiles where id=(select auth.uid()) and ativo and not must_change_password));
create policy access_audit_admin on public.slt_core_access_audit for select to authenticated using ((select public.slt360_is_admin()));

-- Preserve os nomes históricos. A vinculação não reescreve demandas nem revisões.
do $$ declare t text; begin
 foreach t in array array['projects_demands','budget_demands','budget_archived_demands','maintenance_orders','clinical_orders','maintenance_archived_orders','clinical_archived_orders'] loop
  execute format('insert into public.slt_core_analysts(nome) select distinct assignee from public.%I where nullif(btrim(assignee),'''') is not null and length(assignee)<=160 and lower(btrim(assignee)) not in (''a definir'',''sem analista'',''-'',''—'') on conflict(nome) do nothing','slt_'||t);
  execute format('insert into public.slt_core_analysts(nome) select distinct x from public.%I, jsonb_array_elements_text(case when jsonb_typeof(extra->''analistasComplementares'')=''array'' then extra->''analistasComplementares'' else ''[]'' end) x where length(btrim(x)) between 1 and 160 on conflict(nome) do nothing','slt_'||t);
  execute format('alter table public.%I add column assignee_id uuid references public.slt_core_analysts(id)','slt_'||t);
  execute format('update public.%I t set assignee_id=a.id from public.slt_core_analysts a where a.nome=t.assignee','slt_'||t);
  execute format('create index on public.%I(assignee_id) where deleted_at is null','slt_'||t);
 end loop;
end $$;
create function slt_private.link_assignee() returns trigger language plpgsql security definer set search_path='' as $$
begin
 select id into new.assignee_id from public.slt_core_analysts where nome=new.assignee;
 return new;
end $$;
revoke all on function slt_private.link_assignee() from public,anon,authenticated;
do $$ declare t text; begin
 foreach t in array array['projects_demands','budget_demands','budget_archived_demands','maintenance_orders','clinical_orders','maintenance_archived_orders','clinical_archived_orders'] loop
  execute format('create trigger link_assignee before insert or update of assignee on public.%I for each row execute function slt_private.link_assignee()','slt_'||t);
 end loop;
end $$;

create function slt_private.require_admin(actor_id uuid) returns void language plpgsql set search_path='' as $$
begin
 if not exists(select 1 from public.slt360_profiles where id=actor_id and ativo and perfil='Admin' and not must_change_password) then
  raise exception 'Apenas administradores podem gerenciar acessos' using errcode='42501';
 end if;
end $$;
create function slt_private.validate_account(details jsonb) returns void language plpgsql set search_path='' as $$
declare g jsonb; begin
 if jsonb_typeof(details) is distinct from 'object' or length(btrim(coalesce(details->>'nome',''))) not between 2 and 160
 or coalesce(details->>'perfil','') not in ('Admin','Gestor','Analista') or jsonb_typeof(details->'ativo') is distinct from 'boolean'
 or jsonb_typeof(details->'access') is distinct from 'array' or jsonb_array_length(details->'access')>5
 or length(coalesce(details->>'new_analyst',''))>160 then raise exception 'Cadastro inválido' using errcode='22023'; end if;
 if (select count(*)<>count(distinct value->>'module') from jsonb_array_elements(details->'access')) then raise exception 'Módulo repetido' using errcode='22023'; end if;
 for g in select value from jsonb_array_elements(details->'access') loop
  if coalesce(g->>'module','') not in ('projects','budget','maintenance','clinical','finance')
   or jsonb_typeof(g->'can_read') is distinct from 'boolean' or jsonb_typeof(g->'can_write') is distinct from 'boolean'
   or ((g->>'can_write')::boolean and not (g->>'can_read')::boolean) then raise exception 'Permissão inválida' using errcode='22023'; end if;
 end loop;
 if nullif(details->>'analyst_id','') is not null and nullif(btrim(details->>'new_analyst'),'') is not null then raise exception 'Escolha um analista existente ou cadastre um novo' using errcode='22023'; end if;
end $$;
create function slt_private.write_account(actor_id uuid,target_id uuid,details jsonb,expected_revision bigint,creating boolean) returns jsonb language plpgsql set search_path='' as $$
declare prior jsonb; linked uuid; result jsonb; begin
 perform pg_advisory_xact_lock(hashtextextended('slt-account-management',0));
 perform slt_private.require_admin(actor_id);
 perform slt_private.validate_account(details);
 select to_jsonb(p)||jsonb_build_object('access',coalesce((select jsonb_agg(to_jsonb(g)-'user_id') from public.slt_core_module_access g where g.user_id=p.id),'[]')) into prior from public.slt360_profiles p where id=target_id for update;
 if creating and prior is not null then raise exception 'Conta já cadastrada' using errcode='23505'; end if;
 if not creating and (prior is null or (prior->>'revision')::bigint is distinct from expected_revision) then raise exception 'O cadastro foi alterado. Atualize a lista antes de salvar.' using errcode='40001'; end if;
 if actor_id=target_id and (details->>'perfil'<>'Admin' or not (details->>'ativo')::boolean) then raise exception 'Você não pode desativar nem retirar seu próprio acesso de administrador' using errcode='22023'; end if;
 linked=nullif(details->>'analyst_id','')::uuid;
 if nullif(btrim(details->>'new_analyst'),'') is not null then
  insert into public.slt_core_analysts(nome) values(btrim(details->>'new_analyst')) returning id into linked;
 end if;
 if linked is not null and not exists(select 1 from public.slt_core_analysts where id=linked) then raise exception 'Analista inexistente' using errcode='22023'; end if;
 if exists(select 1 from public.slt360_profiles where analyst_id=linked and id<>target_id) then raise exception 'Este analista já está vinculado a outra conta' using errcode='23505'; end if;
 if creating then
  insert into public.slt360_profiles(id,nome,perfil,ativo,analyst_id,must_change_password)
  values(target_id,btrim(details->>'nome'),details->>'perfil',(details->>'ativo')::boolean,linked,true);
 else
  update public.slt360_profiles set nome=btrim(details->>'nome'),perfil=details->>'perfil',ativo=(details->>'ativo')::boolean,analyst_id=linked,revision=revision+1 where id=target_id;
 end if;
 delete from public.slt_core_module_access where user_id=target_id;
 insert into public.slt_core_module_access(user_id,module,can_read,can_write)
 select target_id,g->>'module',(g->>'can_read')::boolean,(g->>'can_write')::boolean from jsonb_array_elements(details->'access') g;
 select to_jsonb(p)||jsonb_build_object('access',details->'access') into result from public.slt360_profiles p where id=target_id;
 insert into public.slt_core_access_audit(actor,target_id,operation,before_values,after_values) values(actor_id,target_id,case when creating then 'create' else 'update' end,prior,result);
 return result;
end $$;
revoke all on function slt_private.require_admin(uuid),slt_private.validate_account(jsonb),slt_private.write_account(uuid,uuid,jsonb,bigint,boolean) from public,anon,authenticated;

create function public.slt_admin_users() returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; begin
 perform slt_private.require_admin(auth.uid());
 select jsonb_build_object('users',coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('email',u.email,'access',coalesce((select jsonb_agg(to_jsonb(g)-'user_id' order by module) from public.slt_core_module_access g where g.user_id=p.id),'[]')) order by p.nome),'[]'),
 'analysts',(select coalesce(jsonb_agg(to_jsonb(a) order by nome),'[]') from public.slt_core_analysts a)) into result
 from public.slt360_profiles p join auth.users u on u.id=p.id;
 return result;
end $$;
create function public.slt_admin_update_user(target_id uuid,details jsonb,expected_revision bigint) returns jsonb language sql security definer set search_path='' as $$
 select slt_private.write_account(auth.uid(),target_id,details,expected_revision,false);
$$;
-- Somente o serviço no servidor conclui a criação após o Supabase Auth.
create function public.slt_service_create_profile(actor_id uuid,target_id uuid,details jsonb) returns jsonb language sql security definer set search_path='' as $$
 select slt_private.write_account(actor_id,target_id,details,0,true);
$$;
revoke all on function public.slt_admin_users(),public.slt_admin_update_user(uuid,jsonb,bigint),public.slt_service_create_profile(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.slt_admin_users(),public.slt_admin_update_user(uuid,jsonb,bigint) to authenticated;
grant execute on function public.slt_service_create_profile(uuid,uuid,jsonb) to service_role;

-- Cadastros comuns: unidades, sprints e fornecedores são referências de leitura.
-- O cadastro de obras é compartilhado entre Projetos/Orçamento; Financeiro só consulta.
create function public.slt_entity_access(entity_key text,writing boolean default false) returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select public.slt_has_module_access(e.module,writing)
  or (e.name='projects_works' and (public.slt_has_module_access('budget',writing) or (not writing and public.slt_has_module_access('finance',false))))
  or (not writing and e.name in ('core_units','core_sprints','core_suppliers','core_source_unit_registry_data') and exists(select 1 from public.slt_core_module_access g where g.user_id=auth.uid() and public.slt_has_module_access(g.module,false)))
  from slt_private.entity_catalog e where e.name=entity_key),false);
$$;
revoke all on function public.slt_entity_access(text,boolean) from public,anon;
grant execute on function public.slt_entity_access(text,boolean) to authenticated;
do $$ declare e record; begin
 for e in select name from slt_private.entity_catalog loop
  execute format('drop policy module_read on public.%I','slt_'||e.name);
  execute format('create policy module_read on public.%I for select to authenticated using(deleted_at is null and (select public.slt_entity_access(%L,false)))','slt_'||e.name,e.name);
 end loop;
end $$;
create or replace function public.slt_module_load(module_key text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare e record; result jsonb='[]'; rows_json jsonb; begin
 if not (select active from slt_private.release_state where id=1) then raise exception 'Migração modular ainda não ativada' using errcode='55000'; end if;
 if not exists(select 1 from public.slt360_profiles where id=auth.uid() and ativo and not must_change_password) then raise exception 'Acesso negado' using errcode='42501'; end if;
 if module_key is not null and not public.slt_has_module_access(module_key,false) then raise exception 'Acesso negado ao módulo' using errcode='42501'; end if;
 for e in select name,module from slt_private.entity_catalog where module_key is null or module=module_key or name in ('core_units','core_sprints','core_suppliers','core_source_unit_registry_data','projects_works') order by name loop
  if public.slt_entity_access(e.name,false) then
   execute format('select coalesce(jsonb_agg(slt_private.decode_record(%L,to_jsonb(t)) order by ordinal,record_key),''[]'') from public.%I t where deleted_at is null',e.name,'slt_'||e.name) into rows_json;
   result=result||rows_json;
  end if;
 end loop;
 return jsonb_build_object('schema_version',2,'records',result);
end $$;

-- Anexos herdam o escopo do módulo, inclusive em downloads diretos.
alter table public.slt360_attachments add column module text check(module in ('projects','budget','maintenance','clinical','finance'));
drop policy attachment_admin_read on public.slt360_attachments;
drop policy attachment_admin_insert on public.slt360_attachments;
create policy attachment_scoped_read on public.slt360_attachments for select to authenticated using(public.slt360_is_admin() or public.slt_has_module_access(module,false));
create policy attachment_scoped_insert on public.slt360_attachments for insert to authenticated with check(created_by=auth.uid() and (public.slt360_is_admin() or public.slt_has_module_access(module,true)));
drop policy slt360_files_read on storage.objects;
drop policy slt360_files_insert on storage.objects;
create policy slt360_files_read on storage.objects for select to authenticated using(bucket_id='slt360-attachments' and exists(select 1 from public.slt360_attachments a where a.id=name and (public.slt360_is_admin() or public.slt_has_module_access(a.module,false))));
create policy slt360_files_insert on storage.objects for insert to authenticated with check(bucket_id='slt360-attachments' and name ~ '^ATT-[0-9a-f-]{36}$' and (public.slt360_is_admin() or exists(select 1 from public.slt360_attachments a where a.id=name and a.created_by=auth.uid() and public.slt_has_module_access(a.module,true))));
create or replace function slt_private.put_record(change jsonb, actor_id uuid, importing boolean default false) returns bigint language plpgsql set search_path='' as $$
declare cfg jsonb; item jsonb=change->'document'; key text=change->>'key'; tab text; before_row jsonb; values_json jsonb; fld record; value jsonb; columns_sql text; values_sql text; updates_sql text; expected bigint; next_revision bigint; empty_keys text[]='{}'; present_keys text[]='{}'; string_keys text[]='{}'; allowed_children text[]; child text; other record; has_dependents boolean;
begin
 select definition into cfg from slt_private.entity_catalog where name=change->>'entity';
 if cfg is null then raise exception 'Entidade desconhecida' using errcode='22023'; end if;
 tab='slt_'||(cfg->>'name');
 if not importing and (coalesce((cfg->>'readonly')::boolean,false) or not public.slt_entity_access(cfg->>'name',true)) then raise exception 'Sem permissão de gravação neste módulo' using errcode='42501'; end if;
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

notify pgrst, 'reload schema';
commit;
