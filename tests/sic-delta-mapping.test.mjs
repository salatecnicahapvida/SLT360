import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { database, seed, admin } from './helpers/database.mjs';

test('SIC valorDelta is persisted in delta_amount instead of JSON extra', async () => {
  const db = await database();
  try {
    await seed(db, { state: {
      works: [{ id: 'w', nome: 'Obra teste' }],
      demands: [{ id: 'd', obraId: 'w', titulo: 'SIC teste', tipo: 'SIC', coluna: 'fazer' }],
    }, datasets: {} });

    const migration = await fs.readFile(
      new URL('../supabase/migrations/20260915125629_fix_sic_delta_mapping.sql', import.meta.url),
      'utf8'
    );
    await db.exec(migration);

    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [admin]);
    await db.exec('set role authenticated');
    const changes = [
      {
        entity: 'budget_sics', key: 'sic-1', operation: 'upsert', expected_revision: 0, ordinal: 0,
        child_fields: ['disciplinasAfetadas'],
        document: { id: 'sic-1', obraId: 'w', demandaId: 'd', numeroSic: 'SIC-1', titulo: 'Teste', status: 'Aprovado' },
      },
      {
        entity: 'budget_sic_items', key: 'sic-1/adequacoes-civis', operation: 'upsert', expected_revision: 0, ordinal: 0,
        parent_key: 'sic-1', child_fields: [],
        document: { disciplinaId: 'adequacoes-civis', valorDelta: 123.45 },
      },
    ];
    await db.query(
      'select slt_commit_changes($1,$2)',
      ['99999999-9999-4999-8999-999999999999', JSON.stringify(changes)]
    );

    const row = (await db.query(
      "select delta_amount, extra from slt_budget_sic_items where record_key='sic-1/adequacoes-civis'"
    )).rows[0];
    assert.equal(Number(row.delta_amount), 123.45);
    assert.equal(Object.hasOwn(row.extra || {}, 'valorDelta'), false);
  } finally {
    await db.close();
  }
});
