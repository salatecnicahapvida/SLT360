// Private operator tool. Output must remain outside this repository and GitHub.
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { parse } from 'acorn';
import { ENTITIES, ENTITY_BY_NAME, flattenPayload, hydrateRecords } from '../src/module-model.js';
import assert from 'node:assert/strict';
const [input,output] = process.argv.slice(2);
if(!input||!output) throw new Error('Informe arquivo privado de origem e diretório privado de destino.');
if(path.resolve(output).startsWith(process.cwd()+path.sep)) throw new Error('O destino precisa ficar fora do repositório público.');
const payload=JSON.parse(await fs.readFile(input,'utf8'));
if(!Array.isArray(payload.state.maintenanceDemands)) {
  const source=await fs.readFile('src/app.js','utf8');
  const names=['normalizeSearchText','cleanImportedText','recordValue','importedText','parseImportedNumber','excelSerialToISO','normalizeMaintenancePhase','maintenanceDemandsFromImportedData'];
  const body=parse(source,{ecmaVersion:'latest',sourceType:'module'}).body;
  const functions=names.map(name=>{const fn=body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name); if(!fn)throw new Error(name); return source.slice(fn.start,fn.end);}).join('\n');
  const converter=vm.runInNewContext(functions+'\nmaintenanceDemandsFromImportedData');
  payload.state.maintenanceDemands=JSON.parse(JSON.stringify(converter(payload.datasets.MAINTENANCE_DATA.records||[])));
}
payload.state.clinicalAssets??=[];
const records=flattenPayload(payload).map(r=>({...r,depth:depth(ENTITY_BY_NAME.get(r.entity))}));
function depth(e){return e.parent?depth(ENTITY_BY_NAME.get(e.parent))+1:0;}
const restored=hydrateRecords(records);
for(const key of Object.keys(payload.datasets)) assert.deepEqual(restored.datasets[key],payload.datasets[key],`Dataset ${key}`);
for(const e of ENTITIES.filter(e=>e.path?.startsWith('state.'))) {
  const key=e.path.slice(6); if(payload.state[key]!==undefined) assert.deepEqual(restored.state[key],payload.state[key],`State ${key}`);
}
await fs.mkdir(output,{recursive:true});
await fs.writeFile(path.join(output,'module-records.json'),JSON.stringify(records));
await fs.writeFile(path.join(output,'normalized-source.json'),JSON.stringify(payload));
const batches=[]; let batch=[],size=0;
for(const record of records){const bytes=Buffer.byteLength(JSON.stringify(record));if(size+bytes>90000&&batch.length){batches.push(batch);batch=[];size=0;}batch.push(record);size+=bytes;}
if(batch.length)batches.push(batch);
for(let i=0;i<batches.length;i++) {
  const b64=Buffer.from(JSON.stringify(batches[i])).toString('base64');
  const sql=`insert into slt_private.import_stage(entity,record_key,record) select r->>'entity',r->>'key',r from jsonb_array_elements(convert_from(decode('${b64}','base64'),'UTF8')::jsonb) r on conflict(entity,record_key) do update set record=excluded.record;\nselect count(*) as staged_records from slt_private.import_stage;`;
  await fs.writeFile(path.join(output,`batch-${String(i+1).padStart(3,'0')}.sql`),sql);
}
const counts=Object.fromEntries(ENTITIES.map(e=>[e.name,records.filter(r=>r.entity===e.name).length]));
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify({records:records.length,batches:batches.length,counts},null,2));
console.log(JSON.stringify({records:records.length,batches:batches.length,counts},null,2));
