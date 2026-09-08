begin;

create or replace function slt_private.prune_state_backups()
returns trigger
language plpgsql
set search_path=''
as $$
begin
  delete from slt_private.state_backups
  where id in (
    select id
    from slt_private.state_backups
    order by created_at desc,id desc
    offset 2
  );
  return new;
end $$;

revoke all on function slt_private.prune_state_backups() from public,anon,authenticated;

drop trigger if exists state_backups_keep_latest_two on slt_private.state_backups;
create trigger state_backups_keep_latest_two
after insert on slt_private.state_backups
for each statement execute function slt_private.prune_state_backups();

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
  where created_at >= now()-interval '24 hours'
  order by created_at desc
  limit 1;

  if found then
    return jsonb_build_object(
      'id',existing.id,
      'created_at',existing.created_at,
      'record_count',existing.record_count,
      'size_bytes',existing.size_bytes,
      'created',false
    );
  end if;

  snap=slt_private.capture_app_snapshot();
  cnt=jsonb_array_length(coalesce(snap->'records','[]'::jsonb));
  bytes=octet_length(snap::text);

  insert into slt_private.state_backups(created_by,kind,label,schema_version,record_count,size_bytes,snapshot)
  values(actor,'daily','Backup automático',2,cnt,bytes,snap)
  returning id into bid;

  return jsonb_build_object('id',bid,'created_at',now(),'record_count',cnt,'size_bytes',bytes,'created',true);
end $$;

revoke all on function public.slt_backup_daily() from public,anon;
grant execute on function public.slt_backup_daily() to authenticated;

delete from slt_private.state_backups
where id in (
  select id
  from slt_private.state_backups
  order by created_at desc,id desc
  offset 2
);

commit;
