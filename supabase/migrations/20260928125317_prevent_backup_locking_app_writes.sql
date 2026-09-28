begin;

-- Os backups completos cresceram para mais de 18 mil registros. O snapshot
-- antigo segurava um lock exclusivo global durante toda a leitura e, quando
-- vários navegadores tentavam gerar o backup diário, as gravações do Kanban
-- aguardavam até o timeout do PostgREST. O snapshot passa a usar uma visão
-- estável da transação e compartilha o lock global com as gravações normais;
-- somente uma restauração continua exclusiva.
create or replace function slt_private.capture_app_snapshot()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  e record;
  rows_json jsonb;
  records jsonb = '[]'::jsonb;
begin
  for e in select name from slt_private.entity_catalog order by name loop
    execute format(
      'select coalesce(jsonb_agg(slt_private.decode_record(%L,to_jsonb(t)) order by ordinal,record_key),''[]''::jsonb) from public.%I t where deleted_at is null',
      e.name,
      'slt_' || e.name
    ) into rows_json;
    records = records || coalesce(rows_json, '[]'::jsonb);
  end loop;

  return jsonb_build_object(
    'format', 'slt360-backup-v1',
    'schema_version', 2,
    'captured_at', now(),
    'records', records,
    'profiles', coalesce((select jsonb_agg(jsonb_build_object(
      'id', p.id, 'nome', p.nome, 'perfil', p.perfil, 'ativo', p.ativo,
      'must_change_password', p.must_change_password, 'analyst_id', p.analyst_id, 'revision', p.revision
    ) order by p.nome) from public.slt360_profiles p), '[]'::jsonb),
    'module_access', coalesce((select jsonb_agg(to_jsonb(a) order by a.user_id, a.module) from public.slt_core_module_access a), '[]'::jsonb),
    'analysts', coalesce((select jsonb_agg(to_jsonb(a) order by a.nome) from public.slt_core_analysts a), '[]'::jsonb),
    'attachments', coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at, a.id) from public.slt360_attachments a), '[]'::jsonb)
  );
end
$$;

revoke all on function slt_private.capture_app_snapshot() from public, anon, authenticated;

create or replace function public.slt_backup_daily()
returns jsonb
language plpgsql
security definer
set search_path = ''
set statement_timeout = '55s'
as $$
declare
  actor uuid;
  existing slt_private.state_backups;
  snap jsonb;
  bid uuid;
  cnt integer;
  bytes bigint;
begin
  actor = slt_private.require_active_user(false);

  select * into existing
  from slt_private.state_backups
  where created_at >= now() - interval '24 hours'
  order by created_at desc
  limit 1;

  if found then
    return jsonb_build_object(
      'id', existing.id,
      'created_at', existing.created_at,
      'record_count', existing.record_count,
      'size_bytes', existing.size_bytes,
      'created', false
    );
  end if;

  -- Vários logins simultâneos não devem formar uma fila de snapshots pesados.
  if not pg_try_advisory_xact_lock(hashtextextended('slt360/daily-backup', 0)) then
    return jsonb_build_object('created', false, 'busy', true);
  end if;

  -- Confere novamente depois de ganhar a eleição do backup diário.
  select * into existing
  from slt_private.state_backups
  where created_at >= now() - interval '24 hours'
  order by created_at desc
  limit 1;

  if found then
    return jsonb_build_object(
      'id', existing.id,
      'created_at', existing.created_at,
      'record_count', existing.record_count,
      'size_bytes', existing.size_bytes,
      'created', false
    );
  end if;

  -- Compartilha o lock com gravações; restaurações continuam exclusivas.
  perform pg_advisory_xact_lock_shared(hashtextextended('slt360/state-consistency', 0));
  snap = slt_private.capture_app_snapshot();
  cnt = jsonb_array_length(coalesce(snap->'records', '[]'::jsonb));
  bytes = octet_length(snap::text);

  insert into slt_private.state_backups(created_by, kind, label, schema_version, record_count, size_bytes, snapshot)
  values(actor, 'daily', 'Backup automático', 2, cnt, bytes, snap)
  returning id into bid;

  return jsonb_build_object('id', bid, 'created_at', now(), 'record_count', cnt, 'size_bytes', bytes, 'created', true);
end
$$;

create or replace function public.slt_backup_manual(backup_label text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
set statement_timeout = '55s'
as $$
declare actor uuid; snap jsonb; bid uuid; cnt integer; bytes bigint;
begin
  actor = slt_private.require_active_user(true);
  perform pg_advisory_xact_lock_shared(hashtextextended('slt360/state-consistency', 0));
  snap = slt_private.capture_app_snapshot();
  cnt = jsonb_array_length(coalesce(snap->'records', '[]'::jsonb));
  bytes = octet_length(snap::text);
  insert into slt_private.state_backups(created_by, kind, label, schema_version, record_count, size_bytes, snapshot)
  values(actor, 'manual', coalesce(nullif(trim(backup_label), ''), 'Backup manual'), 2, cnt, bytes, snap)
  returning id into bid;
  delete from slt_private.state_backups where created_at < now() - interval '14 days';
  return jsonb_build_object('id', bid, 'created_at', now(), 'record_count', cnt, 'size_bytes', bytes);
end
$$;

create or replace function public.slt_backup_export()
returns jsonb
language plpgsql
security definer
set search_path = ''
set statement_timeout = '55s'
as $$
declare snap jsonb;
begin
  perform slt_private.require_active_user(true);
  perform pg_advisory_xact_lock_shared(hashtextextended('slt360/state-consistency', 0));
  snap = slt_private.capture_app_snapshot();
  return snap || jsonb_build_object('exported_at', now(), 'exported_by', auth.uid());
end
$$;

-- Se uma restauração ou outra operação excepcional estiver segurando um lock,
-- a tela deve falhar rápido e explicar o erro, nunca ficar indefinidamente em
-- "Concluindo…". O cliente já possui uma repetição controlada e idempotente.
alter function public.slt_commit_changes(uuid, jsonb) set lock_timeout = '3s';

revoke all on function public.slt_backup_daily() from public, anon;
revoke all on function public.slt_backup_manual(text) from public, anon;
revoke all on function public.slt_backup_export() from public, anon;
grant execute on function public.slt_backup_daily() to authenticated;
grant execute on function public.slt_backup_manual(text) to authenticated;
grant execute on function public.slt_backup_export() to authenticated;

commit;
