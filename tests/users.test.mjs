import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {database,seed,admin} from './module-database.test.mjs';
import {createUserHandler} from '../supabase/functions/slt-users/handler.js';
import {decorateProfile,moduleAllowed,entityWritable} from '../src/access.js';
import {createModuleStore} from '../src/module-store.js';
import {flattenPayload} from '../src/module-model.js';

test('contas: primeiro acesso, vínculo histórico, escopo, revisão e proteção do administrador',async()=>{
 const db=await database();
 try{
  await seed(db,{state:{works:[{id:'w',nome:'Obra compartilhada',ev:{id:'ev',lines:[]}}],maintenanceDemands:[{id:'os',centroCusto:'Predial',analistaResponsavel:'Maria antiga',titulo:'Existente'}]},datasets:{}});
  await db.exec(await fs.readFile(new URL('../supabase/migrations/202608310005_users_team.sql',import.meta.url),'utf8'));
  const analyst=(await db.query('select id from slt_core_analysts')).rows[0].id;
  assert.equal((await db.query('select assignee,assignee_id,revision from slt_maintenance_orders')).rows[0].assignee_id,analyst);
  assert.equal((await db.query('select revision from slt_maintenance_orders')).rows[0].revision,1);
  const member='44444444-4444-4444-8444-444444444444',other='55555555-5555-4555-8555-555555555555';
  await db.query("insert into auth.users(id,email,encrypted_password) values($1,'test@example.test','initial'),($2,'other@example.test','initial')",[member,other]);
  const as=async(role,id='')=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role '+role);};
  const details={nome:'Maria',perfil:'Analista',ativo:true,analyst_id:analyst,access:[{module:'maintenance',can_read:true,can_write:false}]};
  await as('service_role');
  await db.query('select slt_service_create_profile($1,$2,$3)',[admin,member,JSON.stringify(details)]);
  await as('authenticated',member);
  await assert.rejects(db.query('select slt_module_load()'),{code:'42501'});
  await assert.rejects(db.query('select slt_admin_users()'),{code:'42501'});
  await assert.rejects(db.query('select slt_service_create_profile($1,$2,$3)',[member,other,JSON.stringify(details)]),{code:'42501'});
  assert.equal((await db.query('select * from slt_core_analysts')).rows.length,0);
  await as('postgres');await db.query("update auth.users set encrypted_password='new personal hash' where id=$1",[member]);
  await as('authenticated',member);
  assert.equal((await db.query('select * from slt_core_analysts')).rows.length,1);
  assert.equal((await db.query('select * from slt_maintenance_orders')).rows.length,1);
  assert.equal((await db.query('select * from slt_projects_works')).rows.length,0);
  const write={entity:'maintenance_orders',key:'os',ordinal:0,child_fields:[],expected_revision:1,operation:'upsert',document:{id:'os',centroCusto:'Predial',titulo:'Alterada',analistaResponsavel:'Maria antiga'}};
  const commit=()=>db.query('select slt_commit_changes(gen_random_uuid(),$1)',[JSON.stringify([write])]);
  await assert.rejects(commit(),{code:'42501'});
  await assert.rejects(db.query('update slt360_profiles set perfil=\'Admin\''),{code:'42501'});
  await as('authenticated',admin);
  await assert.rejects(db.query('select slt_admin_update_user($1,$2,1)',[admin,JSON.stringify({...details,perfil:'Admin',ativo:false})]),{code:'22023'});
  await assert.rejects(db.query('select slt_admin_update_user($1,$2,1)',[member,JSON.stringify({...details,access:[{module:'core',can_read:true,can_write:true}]})]),{code:'22023'});
  details.access[0].can_write=true;
  await db.query('select slt_admin_update_user($1,$2,1)',[member,JSON.stringify(details)]);
  await assert.rejects(db.query('select slt_admin_update_user($1,$2,1)',[member,JSON.stringify(details)]),{code:'40001'});
  await assert.rejects(db.query('select slt_admin_update_user($1,$2,null)',[member,JSON.stringify(details)]),{code:'40001'});
  await as('authenticated',member);await commit();
  assert.equal((await db.query('select assignee_id from slt_maintenance_orders')).rows[0].assignee_id,analyst);
  await assert.rejects(db.query('select slt_module_load(\'clinical\')'),{code:'42501'});
  await assert.rejects(db.query("insert into slt360_attachments(id,nome,tipo,tamanho,module) values('ATT-11111111-1111-4111-8111-111111111111','x','text/plain',1,'clinical')"),{code:'42501'});
  await db.query("insert into slt360_attachments(id,nome,tipo,tamanho,module) values('ATT-11111111-1111-4111-8111-111111111111','x','text/plain',1,'maintenance')");
  await db.query("insert into storage.objects(bucket_id,name) values('slt360-attachments','ATT-11111111-1111-4111-8111-111111111111')");
  await as('service_role');await assert.rejects(db.query('select slt_service_create_profile($1,$2,$3)',[admin,other,JSON.stringify(details)]),{code:'23505'});
  await as('authenticated',admin);
  details.ativo=false;await db.query('select slt_admin_update_user($1,$2,2)',[member,JSON.stringify(details)]);
  await as('authenticated',member);await assert.rejects(commit(),{code:'42501'});
  assert.equal((await db.query('select * from storage.objects')).rows.length,0);
  await as('authenticated',admin);const directory=(await db.query('select slt_admin_users() as data')).rows[0].data;
  assert.equal(directory.users.length,2);assert.equal(directory.users.find(u=>u.id===member).analyst_id,analyst);
  assert.equal((await db.query('select * from slt_core_access_audit')).rows.length,3);
  await as('anon');await assert.rejects(db.query('select slt_admin_users()'),{code:'42501'});
 }finally{await db.close();}
});

test('permissões vazias negam acesso; gravação não apaga filhos de módulo não carregado',async()=>{
 const p=decorateProfile({ativo:true,perfil:'Analista',must_change_password:false,access:[]});
 assert.deepEqual(p.accessModules,[]);assert.equal(moduleAllowed(p,'finance'),false);
 p.access=[{module:'projects',can_read:true,can_write:true}];
 const records=flattenPayload({state:{works:[{id:'w',nome:'Obra',ev:null}],history:[]}}).map(r=>({...r,revision:1}));
 let changes=[];
 const store=createModuleStore({records,canWrite:e=>entityWritable(p,e),commit:async(_,c)=>{changes=c;return c.map(r=>({...r,revision:2}));}});
 store.acceptInitialState(store.payload.state);
 const snapshot=structuredClone(store.payload.state);snapshot.works[0].nome='Editada';snapshot.works[0].ev={id:'ev',lines:[{disciplinaId:'civil',valorOrcado:0}]};snapshot.history=[{id:'fake'}];
 store.save(snapshot);await store.flush();assert.deepEqual(changes.map(c=>c.entity),['projects_works']);
});

test('serviço de contas autentica o administrador, não envia e-mail e desfaz criação incompleta',async()=>{
 let role='Analista',calls=0,fail=false,deleted=0;
 const mock={auth:{getUser:async(token)=>({data:token==='valid'?{user:{id:admin}}:null,error:token==='valid'?null:{}}),admin:{createUser:async attrs=>{calls++;assert.equal(attrs.email_confirm,true);assert.ok(attrs.password.length>=24);return {data:{user:{id:'new-user'}}};},deleteUser:async id=>{assert.equal(id,'new-user');deleted++;return {};}}},
 from:()=>({select:()=>({eq:(_,id)=>({maybeSingle:async()=>({data:id===admin?{perfil:role,ativo:true,must_change_password:false}:null})})})}),rpc:async()=>fail?{error:{code:'23505'}}:{data:{}}};
 const handler=createUserHandler(mock,'https://example.test');
 const details={nome:'Nome Teste',perfil:'Analista',ativo:true,access:[{module:'maintenance',can_read:true,can_write:true}]};
 const request=(token='valid',origin='https://example.test')=>new Request('https://server.test',{method:'POST',headers:{authorization:'Bearer '+token,origin,'content-type':'application/json'},body:JSON.stringify({email:'test@example.test',details})});
 assert.equal((await handler(request('invalid'))).status,401);
 assert.equal((await handler(request())).status,403);assert.equal(calls,0);
 role='Admin';assert.equal((await handler(request('valid','https://evil.test'))).status,403);
 const response=await handler(request());assert.equal(response.status,201);assert.equal(response.headers.get('cache-control'),'no-store');
 const result=await response.json();assert.ok(result.temporary_password);assert.equal(calls,1);
 fail=true;assert.equal((await handler(request())).status,400);assert.equal(deleted,1);
});
