import assert from 'node:assert/strict';
import test from 'node:test';

import {
  decoratePayloadWithPortfolioAlerts,
  matchApprovalCard,
  portfolioApprovedAdditives,
  portfolioEVWithoutRisk,
  selectableApprovalWeeks,
  stripLivePortfolioAlerts,
} from '../src/sic-director-queue.js';

const work = {
  id: 'EVW-001',
  nome: '0000. Hospital Teste',
  codigoOriginal: '0000',
  ev: {
    lines: [
      { disciplinaId: 'estrutura', valorOrcado: 100 },
      { disciplinaId: 'sics', valorOrcado: 25 },
      { disciplinaId: 'taxa-risco', valorOrcado: 30 },
      { disciplinaId: 'instalacoes', valorOrcado: 99, status: 'Não se aplica' },
    ],
  },
};

test('calcula o EV do portfólio sem taxa de risco e separa aditivos aprovados', () => {
  assert.equal(portfolioEVWithoutRisk(work), 125);
  assert.equal(portfolioApprovedAdditives(work), 25);
});

test('prioriza vínculo explícito e não associa código 0000 de forma insegura', () => {
  const linked = { id: 'card-linked', portfolioWorkId: work.id, descricao: 'Nome histórico' };
  const other0000 = { id: 'card-other', descricao: '0000. Outra obra' };
  assert.equal(matchApprovalCard([other0000, linked], work).card, linked);
  assert.equal(matchApprovalCard([other0000], work).card, null);
});

test('oferece somente semanas abertas ou provisórias, sem selecionar histórico fechado', () => {
  const weeks = selectableApprovalWeeks([
    { id: 'w6', start: '2026-09-21', status: 'closed' },
    { id: 'w8', start: '2026-10-05', status: 'provisional' },
    { id: 'w7', start: '2026-09-28', status: 'open' },
  ]);
  assert.deepEqual(weeks.map(item => item.id), ['w7', 'w8']);
});

test('sinaliza divergência de EV sem alterar nem persistir o valor correto do card', () => {
  const payload = {
    obras: [{ id: 'card-1', portfolioWorkId: work.id, ev: { total: 120 } }],
    weeks: [{ id: 'w6', start: '2026-09-21' }],
    snapshots: [{ obraId: 'card-1', weekId: 'w6', alerts: [] }],
  };
  const decorated = decoratePayloadWithPortfolioAlerts(payload, [work]);
  assert.equal(decorated.obras[0].ev.total, 120);
  assert.equal(decorated.snapshots[0].alerts[0].code, 'portfolio_ev_mismatch_live');
  assert.equal(stripLivePortfolioAlerts(decorated).snapshots[0].alerts.length, 0);
  assert.equal(payload.snapshots[0].alerts.length, 0);
});
