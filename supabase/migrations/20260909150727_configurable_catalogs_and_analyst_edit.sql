begin;

insert into slt_private.entity_catalog(name,module,definition)
values (
  'core_configuration_catalog',
  'core',
  '{"name":"core_configuration_catalog","module":"core","path":"state.configurationCatalog","fields":{"id":{"name":"id","type":"text"},"type":{"name":"catalog_type","type":"text"},"label":{"name":"label","type":"text"},"code":{"name":"code","type":"text"},"region":{"name":"region","type":"text"},"category":{"name":"category","type":"text"},"position":{"name":"position","type":"integer"}}}'::jsonb
)
on conflict(name) do update set module=excluded.module,definition=excluded.definition;

create table if not exists public.slt_core_configuration_catalog (
  record_key text primary key check(length(record_key) between 1 and 1500),
  revision bigint not null default 1 check(revision>0),
  ordinal numeric not null default 0,
  parent_key text,
  child_fields text[] not null default '{}',
  field_keys text[] not null default '{}',
  empty_fields text[] not null default '{}',
  string_fields text[] not null default '{}',
  extra jsonb not null default '{}' check(jsonb_typeof(extra)='object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz,
  id text,
  catalog_type text,
  label text,
  code text,
  region text,
  category text,
  position integer
);

alter table public.slt_core_configuration_catalog enable row level security;
revoke all on public.slt_core_configuration_catalog from public,anon,authenticated;
grant select on public.slt_core_configuration_catalog to authenticated;

create or replace function public.slt_entity_access(entity_key text,writing boolean default false)
returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select public.slt_has_module_access(e.module,writing)
  or (e.name='projects_works' and (public.slt_has_module_access('budget',writing) or (not writing and public.slt_has_module_access('finance',false))))
  or (not writing and e.name in ('core_units','core_sprints','core_suppliers','core_source_unit_registry_data','core_configuration_catalog') and exists(select 1 from public.slt_core_module_access g where g.user_id=auth.uid() and public.slt_has_module_access(g.module,false)))
  from slt_private.entity_catalog e where e.name=entity_key),false);
$$;

revoke all on function public.slt_entity_access(text,boolean) from public,anon;
grant execute on function public.slt_entity_access(text,boolean) to authenticated;

drop policy if exists module_read on public.slt_core_configuration_catalog;
create policy module_read on public.slt_core_configuration_catalog for select to authenticated
using(deleted_at is null and (select public.slt_entity_access('core_configuration_catalog',false)));

create or replace function public.slt_module_load(module_key text default null)
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare
  e record;
  parts jsonb[] := array[]::jsonb[];
  rows_json jsonb;
  result jsonb;
begin
  if not (select active from slt_private.release_state where id=1) then raise exception 'Migração modular ainda não ativada' using errcode='55000'; end if;
  if not exists(select 1 from public.slt360_profiles where id=auth.uid() and ativo and not must_change_password) then raise exception 'Acesso negado' using errcode='42501'; end if;
  if module_key is not null and not public.slt_has_module_access(module_key,false) then raise exception 'Acesso negado ao módulo' using errcode='42501'; end if;

  for e in
    select name,module
    from slt_private.entity_catalog
    where module_key is null
       or module=module_key
       or (module_key in ('budget','maintenance','clinical','projects') and name in ('core_units','core_sprints','core_source_unit_registry_data'))
       or (module_key='budget' and name='core_suppliers')
       or (module_key in ('budget','finance','projects') and name='projects_works')
       or (module_key in ('budget','maintenance','clinical','projects','finance') and name='core_configuration_catalog')
    order by name
  loop
    if public.slt_entity_access(e.name,false)
       and (
         e.name not in (
           'budget_ev_typologies','budget_ev_targets','budget_strategic_targets',
           'budget_hidden_estimates','budget_approval_works','budget_approval_weeks',
           'budget_approval_snapshots'
         )
         or coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb->>'x-client-info'='unified-1'
       ) then
      execute format(
        'select coalesce(jsonb_agg(slt_private.decode_record(%L,to_jsonb(t)) order by ordinal,record_key),''[]'') from public.%I t where deleted_at is null',
        e.name,
        'slt_'||e.name
      ) into rows_json;
      parts := array_append(parts,rows_json);
    end if;
  end loop;

  select coalesce(jsonb_agg(item order by part_order,row_order),'[]'::jsonb)
  into result
  from unnest(parts) with ordinality p(rows_json,part_order)
  cross join lateral jsonb_array_elements(p.rows_json) with ordinality i(item,row_order);

  return jsonb_build_object('schema_version',2,'records',result);
end
$function$;

revoke all on function public.slt_module_load(text) from public,anon;
grant execute on function public.slt_module_load(text) to authenticated;

create function public.slt_admin_update_analyst(target_id uuid, analyst_name text)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  analyst_uuid uuid := target_id;
  clean_name text := btrim(coalesce(analyst_name,''));
  prior jsonb;
  result jsonb;
  table_key text;
begin
  perform slt_private.require_admin(auth.uid());
  if length(clean_name) not between 2 and 160 then raise exception 'Informe um nome de analista entre 2 e 160 caracteres' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('slt-analyst-management',0));
  select to_jsonb(a) into prior from public.slt_core_analysts a where a.id=analyst_uuid for update;
  if prior is null then raise exception 'Analista não encontrado' using errcode='22023'; end if;
  if exists(select 1 from public.slt_core_analysts a where a.id<>analyst_uuid and lower(btrim(a.nome))=lower(clean_name)) then
    raise exception 'Este analista já está cadastrado' using errcode='23505';
  end if;
  update public.slt_core_analysts set nome=clean_name where id=analyst_uuid;
  foreach table_key in array array['projects_demands','budget_demands','budget_archived_demands','maintenance_orders','clinical_orders','maintenance_archived_orders','clinical_archived_orders'] loop
    execute format('update public.%I set assignee=$1 where assignee_id=$2','slt_'||table_key) using clean_name,analyst_uuid;
  end loop;
  select to_jsonb(a) into result from public.slt_core_analysts a where a.id=analyst_uuid;
  insert into public.slt_core_access_audit(actor,target_id,operation,before_values,after_values)
  values(auth.uid(),analyst_uuid,'update_analyst',prior,result);
  return result;
end
$$;

revoke all on function public.slt_admin_update_analyst(uuid,text) from public,anon,authenticated;
grant execute on function public.slt_admin_update_analyst(uuid,text) to authenticated;

notify pgrst, 'reload schema';
commit;
