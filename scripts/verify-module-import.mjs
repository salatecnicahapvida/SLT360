// Run against a private prepared import, never against production.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { database,admin } from '../tests/module-database.test.mjs';
import { ENTITIES,hydrateRecords } from '../src/module-model.js';
const dir=process.argv[2];if(!dir)throw new Error('Informe diretório privado da importação.');
const records=JSON.parse(await fs.readFile(path.join(dir,'module-records.json'),'utf8'));
const source=JSON.parse(await fs.readFile(path.join(dir,'normalized-source.json'),'utf8'));
const db=await database();
try {
 await db.query('insert into auth.users(id) values($1)',[admin]);
 await db.query("insert into slt360_profiles(id,nome,must_change_password) values($1,'Teste local',false)",[admin]);
 await db.query('insert into slt360_state(id,payload) values(1,$1)',[JSON.stringify(source)]);
 await db.query("insert into slt_private.import_stage select r->>'entity',r->>'key',r from jsonb_array_elements($1::jsonb) r",[JSON.stringify(records)]);
 await db.query('select slt_private.activate_modules(md5(payload::text),$1) from slt360_state',[records.length]);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[admin]);
 await db.exec('set role authenticated');
 const result=(await db.query('select slt_module_load() result')).rows[0].result;
 const restored=hydrateRecords(result.records);
 const differences=[];
 function compare(a,b,p) {
  if(JSON.stringify(a)===JSON.stringify(b))return;
  if(a&&b&&typeof a==='object'&&typeof b==='object') {for(const key of new Set([...Object.keys(a),...Object.keys(b)]))compare(a[key],b[key],p+'.'+key);return;}
  if(a===b)return;
  differences.push({path:p,sourceType:typeof a,resultType:typeof b});
 }
 compare(source.datasets,restored.datasets,'datasets');
 for(const e of ENTITIES.filter(e=>e.path?.startsWith('state.'))) {const k=e.path.slice(6);if(source.state[k]!==undefined)compare(source.state[k],restored.state[k],k);}
 await fs.writeFile(path.join(dir,'verification.json'),JSON.stringify({records:result.records.length,differences},null,2));
 assert.equal(differences.length,0,`Diferenças no arquivo privado verification.json: ${differences.length}`);
 assert.equal(result.records.length,records.length);
 console.log(`Preservação confirmada: ${records.length} registros, todas as entidades e bases de referência; valores e tipos idênticos.`);
} finally {await db.close();}
