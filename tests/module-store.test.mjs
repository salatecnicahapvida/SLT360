import test from 'node:test';
import assert from 'node:assert/strict';
import {flattenPayload} from '../src/module-model.js';
import {createModuleStore} from '../src/module-store.js';
test('grava apenas a entidade alterada e não regrava uma lista ao inserir no início',async()=>{
 const state={works:[{id:'w1',nome:'Obra',ev:{id:'ev1',lines:[{disciplinaId:'civil',valorOrcado:10}],versions:[]}}],maintenanceDemands:[{id:'m1',titulo:'OS1'},{id:'m2',titulo:'OS2'}]};
 const batches=[];
 const store=createModuleStore({records:flattenPayload({state}).map(r=>({...r,revision:1})),commit:async(id,changes)=>{batches.push(changes);return changes.map(c=>({...c,revision:c.expected_revision+1}));}});
 store.acceptInitialState(state);
 const edited=structuredClone(state);edited.works[0].ev.lines[0].valorOrcado=20;
 store.save(edited);await store.flush();assert.deepEqual(batches[0].map(c=>c.entity),['budget_estimate_lines']);
 edited.maintenanceDemands.unshift({id:'m3',titulo:'OS3'});store.save(edited);await store.flush();
 assert.equal(batches[1].length,1);assert.equal(batches[1][0].key,'m3');assert.ok(batches[1][0].ordinal<0);
 store.save(edited);await store.flush();assert.equal(batches.length,2);
});
test('não anuncia sucesso quando o banco rejeita; mantém alerta de alterações pendentes',async()=>{
 const events=[];const store=createModuleStore({records:[],commit:async()=>{throw new Error('conflito');},onStatus:s=>events.push(s)});
 store.save({works:[{id:'w'}]});await assert.rejects(store.flush(),/conflito/);
 assert.equal(store.dirty,true);assert.deepEqual(events,['saving','failed']);
});
