import assert from 'node:assert/strict';
import test from 'node:test';

import {
  decoratePayloadWithPortfolioAlerts,
  matchApprovalCard,
  nextApprovalWeekDraft,
  portfolioApprovedAdditives,
  portfolioEVWithoutRisk,
  reconcileApprovalWeeks,
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
    { id: 'w6', start: '2026-09-21', end: '2026-09-25', status: 'closed' },
    { id: 'w8', start: '2026-10-05', end: '2026-10-09', status: 'provisional' },
    { id: 'w7', start: '2026-09-28', end: '2026-10-02', status: 'open' },
  ], '2026-10-01');
  assert.deepEqual(weeks.map(item => item.id), ['w7', 'w8']);
});

test('ativa semana provisória na data inicial e encerra automaticamente períodos passados', () => {
  const result = reconcileApprovalWeeks([
    { id: 'w7', start: '2026-09-28', end: '2026-10-02', status: 'open', placeholder: false },
    { id: 'w8', start: '2026-10-05', end: '2026-10-09', status: 'provisional', placeholder: true },
    { id: 'w9', start: '2026-10-12', end: '2026-10-16', status: 'provisional', placeholder: true },
  ], '2026-10-06');
  assert.equal(result.changed, true);
  assert.deepEqual(result.weeks.map(item => [item.id, item.status, item.placeholder]), [
    ['w7', 'closed', false],
    ['w8', 'open', false],
    ['w9', 'provisional', true],
  ]);
});

test('sugere a semana atual quando não existe pauta e evita períodos sobrepostos', () => {
  const current = nextApprovalWeekDraft([
    { id: 'w8', label: 'Semana 8', start: '2026-10-05', end: '2026-10-09', status: 'closed' },
  ], '2026-10-15');
  assert.deepEqual(current, { label: 'Semana 9', start: '2026-10-12', end: '2026-10-16' });

  const following = nextApprovalWeekDraft([
    { id: 'w9', label: 'Semana 9', start: '2026-10-12', end: '2026-10-16', status: 'open' },
  ], '2026-10-15');
  assert.deepEqual(following, { label: 'Semana 10', start: '2026-10-19', end: '2026-10-23' });
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
