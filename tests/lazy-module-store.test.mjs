import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenPayload, ENTITY_BY_NAME } from '../src/module-model.js';
import { createLazyModuleStore } from '../src/lazy-module-store.js';

test('lazy modules block writes until their database snapshot is loaded',async()=>{
  const all=flattenPayload({state:{
    works:[{id:'work-1',nome:'Obra',ev:{id:'ev-1',status:'Rascunho',lines:[],versions:[]}}],
    demands:[{id:'demand-1',obraId:'work-1',titulo:'Demanda',coluna:'fazer'}],
    maintenanceDemands:[{id:'order-1',titulo:'Manutenção',centroCusto:'Manutenção predial',historico:[]}],
  }});
  const calls=[];
  const commits=[];
  let currentState={};
  const dependencies=new Set(['projects_works','core_units','core_sprints']);
  const store=createLazyModuleStore({
    async load(module){
      calls.push(module);
      return {schema_version:2,records:all.filter(row=>ENTITY_BY_NAME.get(row.entity).module===module||dependencies.has(row.entity))};
    },
    canWriteEntity:()=>true,
    async commit(requestId,changes){
      commits.push({requestId,changes});
      return changes.map(change=>({entity:change.entity,key:change.key,revision:change.expected_revision+1}));
    },
  });
  store.registerReceiver(payload=>{
    currentState=payload.state;
    return currentState;
  });

  assert.throws(()=>store.save('budget',{}),/carregamento completo do banco/);
  await store.ensure('budget');
  assert.deepEqual(calls,['budget']);
  assert.equal(store.hasLoaded('budget'),true);
  assert.equal(currentState.works[0].nome,'Obra');
  assert.equal(currentState.demands[0].titulo,'Demanda');

  currentState.demands[0].titulo='Demanda alterada';
  store.save('budget',currentState);
  await store.flush();
  assert.equal(commits.length,1);
  assert.equal(commits[0].changes.some(change=>change.entity==='budget_demands'&&change.document.titulo==='Demanda alterada'),true);

  await store.ensure('maintenance');
  assert.deepEqual(calls,['budget','maintenance']);
  assert.equal(currentState.demands[0].titulo,'Demanda alterada');
  assert.equal(currentState.maintenanceDemands[0].titulo,'Manutenção');
});
