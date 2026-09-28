import test from 'node:test';
import assert from 'node:assert/strict';
import { createPersistenceCoordinator } from '../src/persistence-coordinator.js';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

function fakeTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener(type, fn) { if (listeners.get(type) === fn) listeners.delete(type); },
    fire(type, event) { listeners.get(type)?.(event); },
  };
}

test('só marca Salvo depois que todas as gravações concorrentes terminam', async () => {
  const states = [];
  const target = fakeTarget();
  const coordinator = createPersistenceCoordinator({ render: state => states.push(state), target });
  const first = deferred();
  const second = deferred();
  const saveFirst = coordinator.track(() => first.promise);
  const saveSecond = coordinator.track(() => second.promise);

  const p1 = saveFirst();
  const p2 = saveSecond();
  assert.equal(coordinator.state, 'saving');
  assert.equal(coordinator.activeWrites, 2);

  first.resolve('one');
  await p1;
  assert.equal(coordinator.state, 'saving');
  assert.equal(coordinator.activeWrites, 1);

  second.resolve('two');
  await p2;
  assert.equal(coordinator.state, 'saved');
  assert.equal(coordinator.activeWrites, 0);
  assert.deepEqual(states.at(-2), 'saving');
  assert.equal(states.at(-1), 'saved');
});

test('avisa ao fechar a página enquanto existe gravação pendente', async () => {
  const target = fakeTarget();
  const coordinator = createPersistenceCoordinator({ target });
  const pending = deferred();
  const save = coordinator.track(() => pending.promise);
  const operation = save();

  const event = { prevented: false, returnValue: undefined, preventDefault() { this.prevented = true; } };
  target.fire('beforeunload', event);
  assert.equal(event.prevented, true);
  assert.equal(event.returnValue, '');

  pending.resolve(true);
  await operation;
  const after = { prevented: false, returnValue: undefined, preventDefault() { this.prevented = true; } };
  target.fire('beforeunload', after);
  assert.equal(after.prevented, false);
  assert.equal(after.returnValue, undefined);
});

test('mantém estado de falha quando uma gravação é rejeitada', async () => {
  const coordinator = createPersistenceCoordinator({ target: fakeTarget() });
  const save = coordinator.track(async () => { throw new Error('bank rejected'); });
  await assert.rejects(save(), /bank rejected/);
  assert.equal(coordinator.state, 'failed');
  coordinator.resetFailure();
  assert.equal(coordinator.state, 'saved');
});
