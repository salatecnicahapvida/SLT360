import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { parse } from 'acorn';
import { simple } from 'acorn-walk';

const source = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

for (const [variant, code] of [['source', source]]) {
  let handler;
  simple(parse(code, { ecmaVersion: 'latest', sourceType: 'module' }), {
    IfStatement(node) {
      if (node.test.type === 'BinaryExpression' && node.test.left.name === 'action' && node.test.right.value === 'open-work-ev') {
        handler = code.slice(node.start, node.end);
      }
    },
  });
  assert.ok(handler, 'Linked EV handler must exist');

  test(`${variant}: opens the card's exact work after navigating, regardless of previous selection`, () => {
    const calls = [];
    const work = { id: 'parauapebas', codigo: '0000' };
    const context = {
      action: 'open-work-ev', actionButton: { dataset: { id: work.id } },
      selectedWorkId: 'another-work-with-code-0000',
      workById: id => id === work.id ? work : undefined,
      closeModal: () => calls.push('close'),
      setView: view => calls.push(['view', view]),
      openEVModal: id => calls.push(['open', id]),
    };
    vm.runInNewContext(`(function () { ${handler} })()`, context);
    assert.equal(context.selectedWorkId, work.id);
    assert.deepEqual(calls, ['close', ['view', 'ev'], ['open', work.id]]);
  });

  test(`${variant}: missing work does not open an unrelated EV or close the card`, () => {
    const context = {
      action: 'open-work-ev', actionButton: { dataset: { id: 'deleted-work' } },
      selectedWorkId: 'previous-work', workById: () => undefined,
      closeModal: () => assert.fail('Must keep the card open'),
      setView: () => assert.fail('Must not navigate'),
      openEVModal: () => assert.fail('Must not open an unrelated EV'),
    };
    vm.runInNewContext(`(function () { ${handler} })()`, context);
    assert.equal(context.selectedWorkId, 'previous-work');
  });
}
