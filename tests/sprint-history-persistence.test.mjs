import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenPayload, hydrateRecords } from '../src/module-model.js';
import { createModuleStore } from '../src/module-store.js';
import { database, seed, admin } from './helpers/database.mjs';

test('criar uma sprint preserva as chaves do histórico legado sem id no documento', async () => {
  const records = [
    ...flattenPayload({ state: { sprints: [{ id: 'sprint-17', nome: 'Sprint 17', status: 'Ativa' }] } }),
    ...Array.from({ length: 4 }, (_, index) => ({
      entity: 'core_history', key: `MAN-legacy-${index}`, ordinal: index,
      parent_key: null, child_fields: [], document: { campo: 'importação' },
    })),
  ].map(row => ({ ...row, revision: 1 }));
  const stored = new Map(records.map(row => [`${row.entity}/${row.key}`, row]));
  const batches = [];
  const store = createModuleStore({
    records,
    async commit(_, changes) {
      for (const change of changes) {
        const previous = stored.get(`${change.entity}/${change.key}`);
        if (change.operation === 'delete' && !previous) throw new Error('Registro inexistente');
        assert.equal(change.expected_revision, previous?.revision || 0);
      }
      batches.push(changes);
      for (const change of changes) stored.set(`${change.entity}/${change.key}`, { ...change, revision: change.expected_revision + 1 });
      return changes.map(change => ({ entity: change.entity, key: change.key, revision: change.expected_revision + 1 }));
    },
  });
  const state = hydrateRecords(records).state;
  store.acceptInitialState(state);
  state.sprints[0].status = 'Encerrada';
  state.sprints.push({ id: 'sprint-18', nome: 'Sprint 18', status: 'Ativa' });
  state.history.unshift({ id: 'HIS-001', entidade: 'sprint', entidadeId: 'sprint-18', campo: 'criação' });
  store.save(state);
  await store.flush();

  assert.deepEqual(batches[0].map(change => [change.entity, change.key, change.operation]), [
    ['core_sprints', 'sprint-17', 'upsert'],
    ['core_sprints', 'sprint-18', 'upsert'],
    ['core_history', 'HIS-001', 'upsert'],
  ]);
  assert.equal(store.dirty, false);
  assert.deepEqual(state.history.slice(1).map(entry => entry.id), records.slice(1).map(row => row.key));
  store.save(state);
  await store.flush();
  assert.equal(batches.length, 1, 'não regrava o histórico normalizado');
});

test('RPC cria a sprint com histórico legado sem field_keys e preserva a revisão antiga', async () => {
  const db = await database();
  try {
    await seed(db, { state: {
      sprints: [{ id: 'sprint-17', nome: 'Sprint 17', status: 'Ativa' }],
      history: [{ id: 'MAN-legacy-id', campo: 'importação' }],
    } });
    await db.exec("update slt_core_history set field_keys='{}' where record_key='MAN-legacy-id'");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [admin]);
    await db.exec('set role authenticated');
    const records = (await db.query("select slt_module_load('core') payload")).rows[0].payload.records;
    const store = createModuleStore({
      records,
      async commit(requestId, changes) {
        return (await db.query('select slt_commit_changes($1,$2) result', [requestId, JSON.stringify(changes)])).rows[0].result;
      },
    });
    const state = store.payload.state;
    store.acceptInitialState(state);
    state.sprints[0].status = 'Encerrada';
    state.sprints.push({ id: 'sprint-18', nome: 'Sprint 18', status: 'Ativa' });
    state.history.unshift({ id: 'HIS-001', entidade: 'sprint', entidadeId: 'sprint-18', campo: 'criação' });
    store.save(state);
    await store.flush();
    const loaded = (await db.query("select slt_module_load('core') payload")).rows[0].payload.records;
    assert.equal(loaded.find(row => row.entity === 'core_sprints' && row.key === 'sprint-18').document.status, 'Ativa');
    assert.equal(loaded.find(row => row.entity === 'core_sprints' && row.key === 'sprint-17').document.status, 'Encerrada');
    assert.equal(loaded.find(row => row.entity === 'core_history' && row.key === 'MAN-legacy-id').revision, 1);
    assert.equal(loaded.filter(row => row.entity === 'core_history').length, 2);
  } finally {
    await db.close();
  }
});
