create table if not exists slt_private.state_backups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid,
  kind text not null check (kind in ('daily','manual','pre_restore')),
  label text,
  schema_version integer not null default 2,
  record_count integer not null,
  size_bytes bigint not null,
  snapshot jsonb not null
);

create index if not exists state_backups_created_at_idx on slt_private.state_backups(created_at desc);
create index if not exists state_backups_kind_created_at_idx on slt_private.state_backups(kind,created_at desc);

revoke all on slt_private.state_backups from public, anon, authenticated;

create or replace function slt_private.capture_app_snapshot()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  e record;
  rows_json jsonb;
  records jsonb='[]'::jsonb;
begin
  for e in select name from slt_private.entity_catalog order by name loop
    execute format(
      'select coalesce(jsonb_agg(slt_private.decode_record(%L,to_jsonb(t)) order by ordinal,record_key),''[]''::jsonb) from public.%I t where deleted_at is null',
      e.name,
      'slt_'||e.name
    ) into rows_json;
    records=records||coalesce(rows_json,'[]'::jsonb);
  end loop;

  return jsonb_build_object(
    'format','slt360-backup-v1',
    'schema_version',2,
    'captured_at',now(),
    'records',records,
    'profiles',coalesce((select jsonb_agg(jsonb_build_object(
      'id',p.id,'nome',p.nome,'perfil',p.perfil,'ativo',p.ativo,
      'must_change_password',p.must_change_password,'analyst_id',p.analyst_id,'revision',p.revision
    ) order by p.nome) from public.slt360_profiles p),'[]'::jsonb),
    'module_access',coalesce((select jsonb_agg(to_jsonb(a) order by a.user_id,a.module) from public.slt_core_module_access a),'[]'::jsonb),
    'analysts',coalesce((select jsonb_agg(to_jsonb(a) order by a.nome) from public.slt_core_analysts a),'[]'::jsonb),
    'attachments',coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at,a.id) from public.slt360_attachments a),'[]'::jsonb)
  );
end $$;

revoke all on function slt_private.capture_app_snapshot() from public, anon, authenticated;

create or replace function slt_private.require_active_user(require_admin boolean default false)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare actor uuid=auth.uid();
begin
  if actor is null or not exists(
    select 1 from public.slt360_profiles p
    where p.id=actor and p.ativo and not p.must_change_password
      and (not require_admin or p.perfil='Admin')
  ) then
    raise exception 'Acesso negado' using errcode='42501';
  end if;
  return actor;
end $$;

revoke all on function slt_private.require_active_user(boolean) from public, anon, authenticated;

create or replace function public.slt_backup_daily()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  actor uuid;
  existing slt_private.state_backups;
  snap jsonb;
  bid uuid;
  cnt integer;
  bytes bigint;
begin
  actor=slt_private.require_active_user(false);
  perform pg_advisory_xact_lock(hashtextextended('slt360/daily-backup',0));

  select * into existing
  from slt_private.state_backups
  where kind='daily' and created_at >= now()-interval '24 hours'
  order by created_at desc
  limit 1;

  if found then
    return jsonb_build_object('id',existing.id,'created_at',existing.created_at,'record_count',existing.record_count,'size_bytes',existing.size_bytes,'created',false);
  end if;

  snap=slt_private.capture_app_snapshot();
  cnt=jsonb_array_length(coalesce(snap->'records','[]'::jsonb));
  bytes=octet_length(snap::text);

  insert into slt_private.state_backups(created_by,kind,label,schema_version,record_count,size_bytes,snapshot)
  values(actor,'daily','Backup automático',2,cnt,bytes,snap)
  returning id into bid;

  delete from slt_private.state_backups
  where kind in ('daily','pre_restore') and created_at < now()-interval '14 days';

  return jsonb_build_object('id',bid,'created_at',now(),'record_count',cnt,'size_bytes',bytes,'created',true);
end $$;

create or replace function public.slt_backup_manual(backup_label text default null)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare actor uuid; snap jsonb; bid uuid; cnt integer; bytes bigint;
begin
  actor=slt_private.require_active_user(true);
  snap=slt_private.capture_app_snapshot();
  cnt=jsonb_array_length(coalesce(snap->'records','[]'::jsonb));
  bytes=octet_length(snap::text);
  insert into slt_private.state_backups(created_by,kind,label,schema_version,record_count,size_bytes,snapshot)
  values(actor,'manual',coalesce(nullif(trim(backup_label),''),'Backup manual'),2,cnt,bytes,snap)
  returning id into bid;
  delete from slt_private.state_backups where created_at < now()-interval '14 days';
  return jsonb_build_object('id',bid,'created_at',now(),'record_count',cnt,'size_bytes',bytes);
end $$;

create or replace function public.slt_backup_list()
returns table(id uuid,created_at timestamptz,kind text,label text,record_count integer,size_bytes bigint,created_by_name text)
language plpgsql
security definer
set search_path=''
as $$
begin
  perform slt_private.require_active_user(true);
  return query
  select b.id,b.created_at,b.kind,b.label,b.record_count,b.size_bytes,p.nome
  from slt_private.state_backups b
  left join public.slt360_profiles p on p.id=b.created_by
  where b.created_at >= now()-interval '14 days'
  order by b.created_at desc;
end $$;

create or replace function public.slt_backup_export()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare snap jsonb;
begin
  perform slt_private.require_active_user(true);
  snap=slt_private.capture_app_snapshot();
  return snap||jsonb_build_object('exported_at',now(),'exported_by',auth.uid());
end $$;

create or replace function public.slt_backup_restore(backup_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  actor uuid;
  chosen slt_private.state_backups;
  before_snap jsonb;
  before_count integer;
  before_bytes bigint;
  e record;
  rec jsonb;
  restored integer=0;
begin
  actor=slt_private.require_active_user(true);
  perform pg_advisory_xact_lock(hashtextextended('slt360/full-restore',0));

  select * into chosen from slt_private.state_backups where id=backup_id;
  if not found then raise exception 'Backup não encontrado' using errcode='22023'; end if;
  if chosen.schema_version<>2 or chosen.snapshot->>'format'<>'slt360-backup-v1' then
    raise exception 'Formato de backup incompatível' using errcode='22023';
  end if;

  before_snap=slt_private.capture_app_snapshot();
  before_count=jsonb_array_length(coalesce(before_snap->'records','[]'::jsonb));
  before_bytes=octet_length(before_snap::text);
  insert into slt_private.state_backups(created_by,kind,label,schema_version,record_count,size_bytes,snapshot)
  values(actor,'pre_restore','Antes de restaurar '||to_char(chosen.created_at at time zone 'America/Sao_Paulo','DD/MM/YYYY HH24:MI'),2,before_count,before_bytes,before_snap);

  for e in select name from slt_private.entity_catalog loop
    execute format('update public.%I set deleted_at=now(),updated_at=now(),updated_by=$1 where deleted_at is null','slt_'||e.name) using actor;
  end loop;

  for e in
    with recursive ranked as (
      select c.name,c.module,0 as depth
      from slt_private.entity_catalog c
      where coalesce(c.definition->>'parent','')=''
      union all
      select c.name,c.module,r.depth+1
      from slt_private.entity_catalog c
      join ranked r on c.definition->>'parent'=r.name
    )
    select name,module,depth from ranked
    order by case module when 'core' then 0 when 'projects' then 1 when 'budget' then 2 when 'maintenance' then 3 when 'clinical' then 4 when 'finance' then 5 else 9 end,depth,name
  loop
    for rec in
      select value from jsonb_array_elements(chosen.snapshot->'records')
      where value->>'entity'=e.name
      order by coalesce((value->>'ordinal')::numeric,0),value->>'key'
    loop
      perform slt_private.put_record(rec||jsonb_build_object('operation','upsert','expected_revision',0),actor,true);
      restored=restored+1;
    end loop;
  end loop;

  delete from slt_private.state_backups where created_at < now()-interval '14 days';
  return jsonb_build_object('restored_backup_id',chosen.id,'restored_records',restored,'restored_at',now());
end $$;

revoke all on function public.slt_backup_daily() from public,anon;
revoke all on function public.slt_backup_manual(text) from public,anon;
revoke all on function public.slt_backup_list() from public,anon;
revoke all on function public.slt_backup_export() from public,anon;
revoke all on function public.slt_backup_restore(uuid) from public,anon;

grant execute on function public.slt_backup_daily() to authenticated;
grant execute on function public.slt_backup_manual(text) to authenticated;
grant execute on function public.slt_backup_list() to authenticated;
grant execute on function public.slt_backup_export() to authenticated;
grant execute on function public.slt_backup_restore(uuid) to authenticated;
