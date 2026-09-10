import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudSaveFailureMessage, isTransientCloudError, retryTransientCloud } from '../src/cloud-retry.js';

test('retries a transient connection failure once', async () => {
  let calls = 0;
  const result = await retryTransientCloud(async () => {
    calls += 1;
    if (calls === 1) throw new TypeError('Failed to fetch');
    return 'confirmed';
  }, { wait: async () => {} });
  assert.equal(result, 'confirmed');
  assert.equal(calls, 2);
});

test('does not retry database conflicts or permission failures', async () => {
  for (const code of ['40001', '42501']) {
    let calls = 0;
    await assert.rejects(retryTransientCloud(async () => {
      calls += 1;
      throw { code, message: 'rejected' };
    }, { wait: async () => {} }));
    assert.equal(calls, 1);
  }
});

test('explains the actual save failure category', () => {
  assert.equal(isTransientCloudError(new TypeError('Failed to fetch')), true);
  assert.match(cloudSaveFailureMessage({ code: '40001' }), /outra sessão/);
  assert.match(cloudSaveFailureMessage({ code: '42501', message: 'Sem permissão de gravação neste módulo' }), /Sem permissão de gravação neste módulo/);
  assert.match(cloudSaveFailureMessage(new TypeError('Failed to fetch')), /nova tentativa/);
});
