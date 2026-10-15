begin;

create or replace function slt_private.normalize_sic_lecom(payload jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    lower(regexp_replace(
      btrim(coalesce(
        payload #>> '{sicMetadata,lecomNumber}',
        payload ->> 'lecomNumber',
        payload ->> 'lecom',
        ''
      )),
      '[^[:alnum:]]',
      '',
      'g'
    )),
    '^lecom',
    ''
  );
$$;

create index if not exists slt_budget_demands_sic_lecom_lookup
on public.slt_budget_demands (slt_private.normalize_sic_lecom(extra))
where deleted_at is null and lower(coalesce(type,'')) = 'sic';

create index if not exists slt_budget_archived_demands_sic_lecom_lookup
on public.slt_budget_archived_demands (slt_private.normalize_sic_lecom(extra))
where deleted_at is null and lower(coalesce(type,'')) = 'sic';

create or replace function slt_private.prevent_duplicate_sic_lecom()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  lecom_key text := slt_private.normalize_sic_lecom(new.extra);
  conflicting_card text;
begin
  if new.deleted_at is not null
     or lower(coalesce(new.type,'')) <> 'sic'
     or lecom_key = '' then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and lecom_key = slt_private.normalize_sic_lecom(old.extra)
     and not (old.deleted_at is not null and new.deleted_at is null) then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('slt360/sic-lecom/' || lecom_key, 0)
  );

  select demand.record_key into conflicting_card
  from public.slt_budget_demands demand
  where demand.deleted_at is null
    and lower(coalesce(demand.type,'')) = 'sic'
    and demand.record_key <> new.record_key
    and slt_private.normalize_sic_lecom(demand.extra) = lecom_key
  limit 1;

  if conflicting_card is null then
    select demand.record_key into conflicting_card
    from public.slt_budget_archived_demands demand
    where demand.deleted_at is null
      and lower(coalesce(demand.type,'')) = 'sic'
      and demand.record_key <> new.record_key
      and slt_private.normalize_sic_lecom(demand.extra) = lecom_key
    limit 1;
  end if;

  if conflicting_card is not null then
    raise exception 'Este número de LECOM já existe no card %. Abra e atualize o card existente em vez de criar outro.', conflicting_card
      using errcode = '23505', constraint = 'slt_budget_demands_unique_sic_lecom';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_duplicate_sic_lecom on public.slt_budget_demands;
create trigger prevent_duplicate_sic_lecom
before insert or update of type, extra, deleted_at on public.slt_budget_demands
for each row execute function slt_private.prevent_duplicate_sic_lecom();

commit;
