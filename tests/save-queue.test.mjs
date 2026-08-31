import test from 'node:test';
import assert from 'node:assert/strict';
import { createSaveQueue } from '../src/save-queue.js';

test('serializa revisões, preserva a cópia e agrupa alterações pendentes', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const calls = [], statuses = [];
  const queue = createSaveQueue({ revision: 7, onStatus: s => statuses.push(s),
    write: async (revision, snapshot) => {
      calls.push({revision,snapshot});
      if (calls.length === 1) await gate;
      return revision + 1;
    },
  });
  const value = {works:[{nome:'Primeira'}]};
  queue.save(value);
  value.works[0].nome = 'Mutação posterior';
  queue.save({works:[{nome:'Segunda'}]});
  queue.save({works:[{nome:'Terceira'}]});
  assert.equal(queue.dirty, true);
  release();
  await queue.flush();
  assert.deepEqual(calls, [
    {revision:7,snapshot:{works:[{nome:'Primeira'}]}},
    {revision:8,snapshot:{works:[{nome:'Terceira'}]}},
  ]);
  assert.equal(queue.dirty, false);
  assert.deepEqual(statuses,['saving','saving','saved']);
});

test('conflito interrompe a fila sem anunciar salvamento nem sobrescrever', async () => {
  let writes = 0;
  const statuses = [];
  const failure = new Error('Conflito de versão');
  const queue = createSaveQueue({revision:1,onStatus:s=>statuses.push(s),
    write:async()=>{writes++; throw failure;},
  });
  queue.save({works:[]});
  await assert.rejects(queue.flush(), failure);
  queue.save({works:[{nome:'Não enviar'}]});
  await assert.rejects(queue.flush(), failure);
  assert.equal(writes,1);
  assert.equal(queue.dirty,true);
  assert.deepEqual(statuses,['saving','failed']);
});
