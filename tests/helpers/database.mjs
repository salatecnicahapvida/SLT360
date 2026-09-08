import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { flattenPayload } from '../../src/module-model.js';
export async function database() {
  const db=new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth;
    create table auth.users(id uuid primary key,encrypted_password text,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to anon,authenticated;
    create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);
    create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security; grant usage on schema storage to authenticated; grant select,insert on storage.objects to authenticated;`);
  for(const migration of ['202608310001_pilot.sql','202608310002_first_access.sql','202608310003_modules.sql','202608310004_import_lock_budget.sql']) await db.exec(await fs.readFile(new URL('../../supabase/migrations/'+migration,import.meta.url),'utf8'));
  return db;
}
export const admin='11111111-1111-4111-8111-111111111111';
export async function seed(db,payload) {
  await db.query('insert into auth.users(id) values($1)',[admin]);
  await db.query("insert into slt360_profiles(id,nome,must_change_password) values($1,'Administrador teste',false)",[admin]);
  await db.query('insert into slt360_state(id,payload) values(1,$1)',[JSON.stringify(payload)]);
  const records=flattenPayload(payload);
  for(const r of records) await db.query('insert into slt_private.import_stage values($1,$2,$3)',[r.entity,r.key,JSON.stringify(r)]);
  await db.query('select slt_private.activate_modules(md5(payload::text),$1) from slt360_state',[records.length]);
  return records;
}
