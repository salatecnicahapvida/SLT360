import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { flattenPayload,hydrateRecords } from '../src/module-model.js';
export async function database() {
  const db=new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key,encrypted_password text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to anon,authenticated;
    create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);
    create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security; grant usage on schema storage to authenticated; grant select,insert on storage.objects to authenticated;`);
  for(const migration of ['202608310001_pilot.sql','202608310002_first_access.sql','202608310003_modules.sql']) await db.exec(await fs.readFile(new URL('../supabase/migrations/'+migration,import.meta.url),'utf8'));
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
test('módulos: dados separados, RLS, concorrência por registro, transação, idempotência e auditoria',async()=>{
 const db=await database();
 try {
  const payload={state:{works:[{id:'work-1',nome:'Obra teste',ev:{id:'ev-1',status:'Rascunho',lines:[{disciplinaId:'civil',valorOrcado:12.34}],versions:[]}}],demands:[{id:'demand-1',obraId:'work-1',sprintId:'',coluna:'entrada'}],maintenanceDemands:[{id:'order-1',titulo:'Predial',centroCusto:'Manutenção predial',valorProposta:22,historico:[]},{id:'order-2',titulo:'Clínica',centroCusto:'Engenharia clínica',valorProposta:11,historico:[]}]},datasets:{}};
  await seed(db,payload);
  const as=async(role,id='')=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role '+role);};
  const read=async(module=null)=>(await db.query('select slt_module_load($1) result',[module])).rows[0].result;
  let request=0;
  const commit=(changes,id)=>db.query('select slt_commit_changes($1,$2) result',[id||`00000000-0000-4000-8000-${String(++request).padStart(12,'0')}`,JSON.stringify(changes)]);
  const change=(entity,key,document,expected_revision=1)=>({entity,key,document,expected_revision,ordinal:0,child_fields:[],operation:'upsert'});
  await as('anon'); await assert.rejects(read(),{code:'42501'});
  await as('authenticated','22222222-2222-4222-8222-222222222222');await assert.rejects(read(),{code:'42501'});
  assert.equal((await db.query('select * from slt_maintenance_orders')).rows.length,0);
  await as('authenticated',admin);
  assert.equal((await read('maintenance')).records.filter(r=>r.entity==='maintenance_orders').length,1);
  assert.equal((await read('clinical')).records.filter(r=>r.entity==='clinical_orders').length,1);
  const loaded=await read();
  assert.deepEqual(hydrateRecords(loaded.records).state.works,payload.state.works);
  assert.deepEqual(hydrateRecords(loaded.records).state.demands,payload.state.demands);
  await assert.rejects(db.query('select * from slt360_state'),{code:'42501'});
  await assert.rejects(db.query('select slt360_save(1,$1)',[JSON.stringify(payload.state)]),{code:'42501'});
  await assert.rejects(db.query("update slt_maintenance_orders set title='intrusão'"),{code:'42501'});
  await assert.rejects(db.query('select * from slt_private.import_stage'),{code:'42501'});
  const update1=change('maintenance_orders','order-1',{...payload.state.maintenanceDemands[0],titulo:'Editada'}); update1.child_fields=['historico'];delete update1.document.historico;
  const update2=change('clinical_orders','order-2',{...payload.state.maintenanceDemands[1],titulo:'Editada clínica'});update2.child_fields=['historico'];delete update2.document.historico;
  const fixed='99999999-9999-4999-8999-999999999999';
  const first=await commit([update1],fixed);
  assert.deepEqual(await commit([update1],fixed),first);
  await assert.rejects(commit([update2],fixed),{code:'22023'});
  await commit([update2]); // Same initial revision in another module is not a conflict.
  await assert.rejects(commit([update1]),{code:'40001'});
  const budget=change('budget_demands','demand-1',{...payload.state.demands[0],coluna:'entregue'});
  await assert.rejects(commit([budget,update1]),{code:'40001'});
  assert.equal((await db.query('select phase from slt_budget_demands')).rows[0].phase,'entrada');
  await assert.rejects(commit([change('budget_contracts','contract-1',{id:'contract-1',obraId:'missing'},0)]),{code:'23503'});
  assert.equal((await db.query('select * from slt_budget_contracts')).rows.length,0);
  assert.equal((await db.query('select * from slt_core_change_log')).rows.length,2);
  await assert.rejects(db.query('delete from slt_core_change_log'),{code:'42501'});
  await db.exec('reset role');
  await assert.rejects(db.query('update slt360_state set revision=99'),{code:'55000'});
  const member='33333333-3333-4333-8333-333333333333';
  await db.query('insert into auth.users(id) values($1)',[member]);
  await db.query("insert into slt360_profiles(id,nome,perfil,must_change_password) values($1,'Analista teste','Analista',false)",[member]);
  await db.query("insert into slt_core_module_access(user_id,module,can_write) values($1,'maintenance',true)",[member]);
  await as('authenticated',member);
  assert.equal((await db.query('select * from slt_maintenance_orders')).rows.length,1);
  assert.equal((await db.query('select * from slt_clinical_orders')).rows.length,0);
  assert.equal((await db.query('select * from slt_budget_demands')).rows.length,0);
  await assert.rejects(read('clinical'),{code:'42501'});
  await assert.rejects(commit([{...update2,expected_revision:2}]),{code:'42501'});
  await assert.rejects(commit([change('maintenance_source_readings','source-new',{},0)]),{code:'42501'});
  await commit([{...update1,expected_revision:2}]);
  await db.exec('reset role');await db.query('update slt360_profiles set ativo=false where id=$1',[member]);
  await as('authenticated',member);await assert.rejects(read('maintenance'),{code:'42501'});
  await db.exec('reset role');await db.query('update slt360_profiles set must_change_password=true where id=$1',[admin]);
  await as('authenticated',admin);await assert.rejects(read(),{code:'42501'});
 } finally{await db.close();}
});
