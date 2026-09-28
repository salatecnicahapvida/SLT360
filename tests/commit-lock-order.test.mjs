import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260928141410_order_commit_record_locks.sql';
const sql = fs.readFileSync(migrationPath, 'utf8');

test('slt_commit_changes reserva locks em ordem determinística antes de gravar', () => {
  const orderedLockLoop = /for change in\s+select value\s+from jsonb_array_elements\(changes\)\s+order by value->>'entity', value->>'key'\s+loop[\s\S]*?perform pg_advisory_xact_lock\(/;
  assert.match(sql, orderedLockLoop, 'o lote precisa reservar todos os registros em ordem entity/key');

  const orderedLoopStart = sql.search(/for change in\s+select value\s+from jsonb_array_elements\(changes\)\s+order by/);
  const writeLoopStart = sql.indexOf('for change in select value from jsonb_array_elements(changes) loop', orderedLoopStart + 1);
  assert.ok(orderedLoopStart >= 0 && writeLoopStart > orderedLoopStart, 'a reserva de locks deve acontecer antes do loop de escrita');

  const writeLoop = sql.slice(writeLoopStart);
  assert.doesNotMatch(
    writeLoop,
    /perform pg_advisory_xact_lock\(\s*hashtextextended\('slt_'/,
    'o loop de escrita não deve voltar a adquirir locks por registro em ordem variável',
  );
});
