import fs from 'node:fs';
import { parse } from 'acorn';
import * as walk from 'acorn-walk';

const APP='src/app.js';
let source=fs.readFileSync(APP,'utf8');

const oldSave=`function saveState() {
  const module = dataUIModuleForView(currentView);
  if (!globalThis.SLT_CLOUD.canWrite(module)) { showToast("Aguarde o carregamento completo do banco ou confira sua permissão de edição."); return; }
  return globalThis.SLT_CLOUD.save(module, persistedStatePayload());
}`;
const newSave=`async function saveState() {
  const module = dataUIModuleForView(currentView);
  if (!globalThis.SLT_CLOUD.canWrite(module)) {
    showToast("Aguarde o carregamento completo do banco ou confira sua permissão de edição.");
    return false;
  }
  try {
    await globalThis.SLT_CLOUD.saveAndWait(module, persistedStatePayload());
    return true;
  } catch (error) {
    showToast(error?.message || "A alteração não foi confirmada pelo banco. Recarregue os dados antes de continuar.");
    return false;
  }
}`;
if(!source.includes(oldSave)) throw new Error('Definição legada de saveState não localizada.');
source=source.replace(oldSave,newSave);

function ast(text){ return parse(text,{ecmaVersion:'latest',sourceType:'module'}); }
function functionAncestor(ancestors){
  for(let i=ancestors.length-1;i>=0;i--){
    const n=ancestors[i];
    if(['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression'].includes(n.type)) return n;
  }
  return null;
}
function applyEdits(text,edits){
  const unique=new Map();
  for(const e of edits) unique.set(`${e.start}:${e.end}:${e.text}`,e);
  return [...unique.values()].sort((a,b)=>b.start-a.start||b.end-a.end).reduce((out,e)=>out.slice(0,e.start)+e.text+out.slice(e.end),text);
}
function asyncInsert(node,text){
  if(node.async) return null;
  if(node.type==='ArrowFunctionExpression') return {start:node.start,end:node.start,text:'async '};
  const prefix=text.slice(node.start,node.body.start);
  const idx=prefix.indexOf('function');
  if(idx<0) throw new Error(`Não foi possível tornar função async em ${node.start}`);
  return {start:node.start+idx,end:node.start+idx,text:'async '};
}

// Toda gravação remanescente da UI passa a esperar confirmação real do Supabase.
{
  const tree=ast(source), edits=[], funcs=new Map();
  walk.ancestor(tree,{
    CallExpression(node,ancestors){
      if(node.callee.type!=='Identifier'||node.callee.name!=='saveState'||node.arguments.length) return;
      const statement=[...ancestors].reverse().find(n=>n.type==='ExpressionStatement'&&n.expression===node);
      if(!statement) throw new Error(`saveState fora de statement simples em ${node.start}`);
      const fn=functionAncestor(ancestors);
      if(!fn) throw new Error(`saveState fora de função em ${node.start}`);
      edits.push({start:statement.start,end:statement.end,text:'if (!await saveState()) return false;'});
      funcs.set(fn.start,fn);
    }
  });
  if(edits.length<10) throw new Error(`Esperava endurecer ao menos 10 gravações; encontrei ${edits.length}.`);
  for(const fn of funcs.values()){
    const e=asyncInsert(fn,source); if(e) edits.push(e);
  }
  source=applyEdits(source,edits);
}

// Propaga await para chamadas das funções que passaram a ser assíncronas e cujo retorno/ordem importa.
const mustAwait=new Set([
  'handleProjectDemandSubmit','handleStrategicTargetsSubmit','handleEVTypologySubmit',
  'handleSprintSubmit','activateSprint','updateMaintenanceDemandPhase',
  'handleMaintenanceDemandSubmit','handleMaintenanceDetailSubmit','handleConfigurationCatalogSubmit',
  'approveSic','updateProjectStatus'
]);
for(let round=0;round<4;round++){
  const tree=ast(source),edits=[],funcs=new Map();
  walk.ancestor(tree,{
    CallExpression(node,ancestors){
      if(node.callee.type!=='Identifier'||!mustAwait.has(node.callee.name)) return;
      const parent=ancestors.at(-2);
      if(parent?.type==='AwaitExpression') return;
      const fn=functionAncestor(ancestors);
      if(!fn) return;
      edits.push({start:node.start,end:node.start,text:'await '});
      funcs.set(fn.start,fn);
    }
  });
  if(!edits.length) break;
  for(const fn of funcs.values()){
    const e=asyncInsert(fn,source); if(e) edits.push(e);
  }
  source=applyEdits(source,edits);
}

// Ajustes de chamadas conhecidas podem estar em callbacks que não usam o retorno, mas ainda devem esperar.
let tree=ast(source);
let unawaited=[];
walk.ancestor(tree,{
  CallExpression(node,ancestors){
    if(node.callee.type==='Identifier'&&node.callee.name==='saveState'){
      const parent=ancestors.at(-2);
      if(parent?.type!=='AwaitExpression') unawaited.push(node.start);
    }
    if(node.callee.type==='Identifier'&&node.callee.name==='updateMaintenanceDemandPhase'){
      const parent=ancestors.at(-2);
      if(parent?.type!=='AwaitExpression') unawaited.push(node.start);
    }
  }
});
if(unawaited.length) throw new Error(`Persistências sem await em: ${unawaited.join(', ')}`);
if(/\bsaveState\(\);/.test(source)) throw new Error('Ainda existe saveState fire-and-forget.');

fs.writeFileSync(APP,source);

const test=`import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse } from 'acorn';
import * as walk from 'acorn-walk';

test('toda persistência legada da UI espera confirmação do banco',()=>{
  const source=fs.readFileSync('src/app.js','utf8');
  assert.doesNotMatch(source,/\\bsaveState\\(\\);/);
  assert.match(source,/async function saveState\\(\\)/);
  assert.match(source,/SLT_CLOUD\\.saveAndWait\\(module, persistedStatePayload\\(\\)\\)/);
  const tree=parse(source,{ecmaVersion:'latest',sourceType:'module'});
  const missing=[];
  walk.ancestor(tree,{
    CallExpression(node,ancestors){
      if(node.callee.type==='Identifier'&&node.callee.name==='saveState'&&ancestors.at(-2)?.type!=='AwaitExpression') missing.push(node.start);
    }
  });
  assert.deepEqual(missing,[],'nenhuma chamada saveState pode ser fire-and-forget');
});
`;
fs.writeFileSync('tests/persistence-audit.test.mjs',test);
console.log('Auditoria de persistência aplicada: gravações legadas agora aguardam confirmação.');
