import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('migração: isolamento, gravação atômica, auditoria, revogação e anexos privados', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to anon, authenticated;
      create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);
      create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security;
      grant usage on schema storage to authenticated;
      grant select,insert on storage.objects to authenticated;
    `);
    await db.exec(await fs.readFile(new URL('../supabase/migrations/202608310001_pilot.sql',import.meta.url),'utf8'));
    const admin = '11111111-1111-4111-8111-111111111111';
    const outsider = '22222222-2222-4222-8222-222222222222';
    await db.query('insert into auth.users values ($1),($2)',[admin,outsider]);
    await db.query("insert into slt360_profiles(id,nome) values ($1,'Administrador de teste')",[admin]);
    const state = {works:[],demands:[],sics:[],contracts:[],maintenanceDemands:[],projectDemands:[]};
    await db.query('insert into slt360_state(id,payload) values (1,$1)',[JSON.stringify({state,datasets:{marker:'preservar'}})]);
    const role = async (name,id='') => {
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);
      await db.exec(`set role ${name}`);
    };
    const save = (revision,next=state) => db.query('select slt360_save($1,$2) as revision',[revision,JSON.stringify(next)]);

    await role('anon');
    await assert.rejects(db.query('select * from slt360_state'),{code:'42501'});
    await assert.rejects(save(1),{code:'42501'});
    await role('authenticated',outsider);
    assert.equal((await db.query('select * from slt360_state')).rows.length,0);
    assert.equal((await db.query('select * from slt360_profiles')).rows.length,0);
    await assert.rejects(save(1),{code:'42501'});
    await assert.rejects(db.query("insert into slt360_profiles(id,nome) values ($1,'Intruso')",[outsider]),{code:'42501'});
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('slt360-attachments','ATT-11111111-1111-4111-8111-111111111111')"),{code:'42501'});

    await role('authenticated',admin);
    assert.equal((await db.query('select * from slt360_profiles')).rows.length,1);
    await assert.rejects(db.query("update slt360_state set revision=99"),{code:'42501'});
    await assert.rejects(save(1,{...state,users:[]}),{code:'22023'});
    await assert.rejects(save(1,{...state,sics:{}}),{code:'22023'});
    assert.equal(Number((await save(1,{...state,works:[{nome:'Obra teste'}]})).rows[0].revision),2);
    await assert.rejects(save(1),{code:'40001'});
    const saved = (await db.query('select * from slt360_state')).rows[0];
    assert.equal(saved.payload.state.works[0].nome,'Obra teste');
    assert.equal(saved.payload.datasets.marker,'preservar');
    const audit = (await db.query('select * from slt360_audit')).rows;
    assert.equal(audit.length,1);
    assert.equal(audit[0].actor,admin);
    await assert.rejects(db.query('delete from slt360_audit'),{code:'42501'});
    await db.query("insert into storage.objects(bucket_id,name) values ('slt360-attachments','ATT-11111111-1111-4111-8111-111111111111')");
    assert.equal((await db.query('select * from storage.objects')).rows.length,1);
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('outro','ATT-11111111-1111-4111-8111-111111111111')"),{code:'42501'});
    await assert.rejects(db.query("insert into slt360_attachments(id,nome,tipo,tamanho,created_by) values ('ATT-11111111-1111-4111-8111-111111111111','teste','text/plain',3,$1)",[outsider]),{code:'42501'});

    await db.exec('reset role');
    assert.equal((await db.query("select public from storage.buckets where id='slt360-attachments'")).rows[0].public,false);
    await db.query('update slt360_profiles set ativo=false where id=$1',[admin]);
    await role('authenticated',admin);
    assert.equal((await db.query('select * from slt360_state')).rows.length,0);
    assert.equal((await db.query('select * from storage.objects')).rows.length,0);
    await assert.rejects(save(2),{code:'42501'});
  } finally { await db.close(); }
});
