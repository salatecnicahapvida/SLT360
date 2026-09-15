import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse } from 'acorn';
import * as walk from 'acorn-walk';

test('toda persistência legada da UI espera confirmação do banco',()=>{
  const source=fs.readFileSync('src/app.js','utf8');
  assert.doesNotMatch(source,/\bsaveState\(\);/);
  assert.match(source,/async function saveState\(\)/);
  assert.match(source,/SLT_CLOUD\.saveAndWait\(module, persistedStatePayload\(\)\)/);
  const tree=parse(source,{ecmaVersion:'latest',sourceType:'module'});
  const missing=[];
  walk.ancestor(tree,{
    CallExpression(node,ancestors){
      if(node.callee.type==='Identifier'&&node.callee.name==='saveState'&&ancestors.at(-2)?.type!=='AwaitExpression') missing.push(node.start);
    }
  });
  assert.deepEqual(missing,[],'nenhuma chamada saveState pode ser fire-and-forget');
});
