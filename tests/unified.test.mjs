import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {businessDate} from '../src/dates.js';
import {csvCell} from '../src/csv.js';
import {arithmetic} from '../src/arithmetic.js';
import {flattenPayload,hydrateRecords} from '../src/module-model.js';
import {createModuleStore} from '../src/module-store.js';
import {database,seed,admin} from './helpers/database.mjs';

test('business date follows São Paulo and changes across midnight',()=>{
 assert.equal(businessDate(new Date('2026-09-09T02:59:59Z')),'2026-09-08');
 assert.equal(businessDate(new Date('2026-09-09T03:00:00Z')),'2026-09-09');
});
test('spreadsheet arithmetic respects precedence without executing JavaScript',()=>{
 assert.equal(arithmetic('=10 + 2*(3 - 1)'),14);
 assert.equal(arithmetic('=-10/2'),-5);
 assert.equal(arithmetic('=1/0'),null);
 assert.equal(arithmetic('=alert(1)'),null);
 assert.equal(arithmetic('=1;2'),null);
});
test('CSV neutralizes formulas while preserving numeric amounts',()=>{
 assert.equal(csvCell('=1+1'),'"\'=1+1"');
 assert.equal(csvCell(' @SUM(1)'),'"\'@SUM(1)"');
 assert.equal(csvCell(-12),'"-12"');
 assert.equal(csvCell('A "B"'),'"A ""B"""');
});

test('EV settings, hidden historical IDs and SIC state round-trip without losing data',()=>{
 const state={evTypologyOverrides:{x:'Hospital'},evReferenceTargets:{x:{value:12}},strategicTargetOverrides:{hospital:{targetMin:10,targetMax:20}},deletedEVRecordIds:['x'],sicApprovalWorks:[{id:'w',descricao:'Test',sics:[]}],sicApprovalWeeks:[{id:'week',label:'Test'}],sicApprovalSnapshots:[{weekId:'week',obraId:'w',ev:{total:1}}]};
 const result=hydrateRecords(flattenPayload({state})).state;
 for(const key of Object.keys(state)) assert.deepEqual(result[key],state[key],key);
});

test('all migrations: private SIC/settings, atomic saves, explicit archive, backup, restore and work links',async()=>{
 const db=await database();
 try{
  await seed(db,{state:{works:[{id:'w',nome:'Test'},{id:'inactive-work',nome:'Inactive'}],demands:[{id:'d',obraId:'w',titulo:'Test'}]},datasets:{}});
  const migrations=(await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>n>='202608310005').sort();
  for(const name of migrations)await db.exec(await fs.readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
  await db.query("update slt_projects_works set deleted_at=now() where record_key='inactive-work'");
  for(const type of ['EmissaoInicial','ReemissaoCompleta','SIC']){
   await assert.rejects(
    db.query("insert into slt_budget_demands(record_key,work_id,type) values($1,'inactive-work',$2)",[`invalid-${type}`,type]),
    {code:'23503'}
   );
  }
  await assert.rejects(db.query("update slt_projects_works set deleted_at=now() where record_key='w'"),{code:'23503'});
  const as=async(role,id='')=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role '+role);};
  let request=1;
  const commit=changes=>db.query('select slt_commit_changes($1,$2) result',[`00000000-0000-4000-8000-${String(request++).padStart(12,'0')}`,JSON.stringify(changes)]);
  await as('anon');await assert.rejects(db.query('select * from slt_budget_approval_works'),{code:'42501'});
  await as('authenticated',admin);
  const state={sicApprovalWorks:[{id:'aw',descricao:'Approval'}],sicApprovalWeeks:[{id:'week',start:'2026-09-01'}],sicApprovalSnapshots:[{weekId:'week',obraId:'aw',ev:{total:123}}],evReferenceTargets:{hospital:{value:100}},deletedEVRecordIds:['hist']};
  const changes=flattenPayload({state}).map(r=>({...r,expected_revision:0,operation:'upsert'}));
  await commit(changes);
  const legacy=(await db.query('select slt_module_load() result')).rows[0].result;
  assert.equal(legacy.records.some(r=>r.entity==='budget_approval_works'),false,'legacy clients receive their compatible catalog');
  await db.query("select set_config('request.headers',$1,false)", [JSON.stringify({'x-client-info':'unified-1'})]);
  const loaded=(await db.query('select slt_module_load() result')).rows[0].result;
  for(const key of Object.keys(state))assert.deepEqual(hydrateRecords(loaded.records).state[key],state[key]);
  await assert.rejects(commit([{entity:'budget_demands',key:'d',operation:'delete',expected_revision:1}]),{code:'22023'});
  const backup=(await db.query("select slt_backup_manual('test') result")).rows[0].result;
  const daily=(await db.query('select slt_backup_daily() result')).rows[0].result;
  assert.equal(daily.created,false,'a manual backup suppresses a redundant daily copy for 24 hours');
  await commit([{...changes.find(c=>c.entity==='budget_approval_works'),document:{id:'aw',descricao:'Changed'},expected_revision:1}]);
  await db.query('select slt_backup_restore($1)',[backup.id]);
  assert.ok((await db.query('select count(*)::integer total from slt_backup_list()')).rows[0].total<=2);
  assert.equal((await db.query('select description from slt_budget_approval_works')).rows[0].description,'Approval');
  await assert.rejects(commit([{...changes.find(c=>c.entity==='budget_approval_works'),expected_revision:2}]),{code:'40001'});
  assert.equal((await db.query('select * from slt_budget_demands where deleted_at is null')).rows.length,1);
  await as('authenticated','22222222-2222-4222-8222-222222222222');
  await assert.rejects(db.query('select slt_backup_restore($1)',[backup.id]),{code:'42501'});
  assert.equal((await db.query('select * from slt_budget_approval_works')).rows.length,0);
 }finally{await db.close();}
});
