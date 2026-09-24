const normalize = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const roundMoney = value => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

function activeEVLine(line) {
  const status = normalize(line?.status);
  return status !== 'nao se aplica';
}

function isRiskLine(line) {
  const discipline = normalize(line?.disciplinaId).replace(/\s+/g, '-');
  return discipline === 'taxa-risco';
}

export function portfolioEVWithoutRisk(work) {
  return roundMoney((work?.ev?.lines || [])
    .filter(activeEVLine)
    .filter(line => !isRiskLine(line))
    .reduce((sum, line) => sum + Number(line?.valorOrcado || 0), 0));
}

export function portfolioApprovedAdditives(work) {
  return roundMoney((work?.ev?.lines || [])
    .filter(activeEVLine)
    .filter(line => normalize(line?.disciplinaId) === 'sics')
    .reduce((sum, line) => sum + Number(line?.valorOrcado || 0), 0));
}

function workCode(work) {
  return String(work?.codigoOriginal || work?.code || work?.chaveUnica || '').trim();
}

function cardCode(card) {
  return String(card?.descricao || '').trim().match(/^(\d+)/)?.[1] || '';
}

function exactNameMatch(card, work) {
  const workNames = [work?.nome, work?.name, work?._pasta1Scope]
    .map(normalize)
    .filter(Boolean);
  const cardNames = [card?.descricao, ...(card?.descricaoAliases || [])]
    .map(normalize)
    .filter(Boolean);
  return workNames.some(name => cardNames.includes(name));
}

export function matchApprovalCard(cards, work) {
  const list = Array.isArray(cards) ? cards : [];
  if (!work?.id) return { card: null, reason: 'missing-work', ambiguous: false };

  const linked = list.filter(card => String(card?.portfolioWorkId || '') === String(work.id));
  if (linked.length === 1) return { card: linked[0], reason: 'portfolio-link', ambiguous: false };
  if (linked.length > 1) return { card: null, reason: 'duplicate-portfolio-link', ambiguous: true };

  const exact = list.filter(card => !card?.portfolioWorkId && exactNameMatch(card, work));
  if (exact.length === 1) return { card: exact[0], reason: 'exact-name', ambiguous: false };
  if (exact.length > 1) return { card: null, reason: 'duplicate-name', ambiguous: true };

  const code = workCode(work);
  if (code && code !== '0000') {
    const byCode = list.filter(card => !card?.portfolioWorkId && cardCode(card) === code);
    if (byCode.length === 1) return { card: byCode[0], reason: 'unique-code', ambiguous: false };
    if (byCode.length > 1) return { card: null, reason: 'duplicate-code', ambiguous: true };
  }
  return { card: null, reason: 'not-found', ambiguous: false };
}

export function approvalWeekStatus(week) {
  const explicit = String(week?.status || '').toLowerCase();
  if (['open', 'provisional', 'closed'].includes(explicit)) return explicit;
  return week?.placeholder ? 'provisional' : 'open';
}

export function selectableApprovalWeeks(weeks) {
  return (Array.isArray(weeks) ? weeks : [])
    .filter(week => approvalWeekStatus(week) !== 'closed')
    .sort((a, b) => String(a?.start || '').localeCompare(String(b?.start || '')));
}

export function approvalSnapshotFor(payload, cardId, weekId) {
  return (payload?.snapshots || []).find(snapshot =>
    String(snapshot?.obraId) === String(cardId) && String(snapshot?.weekId) === String(weekId)
  ) || null;
}

const LIVE_ALERT_CODES = new Set(['portfolio_ev_mismatch_live', 'portfolio_link_missing_live']);

export function stripLivePortfolioAlerts(payload) {
  const clean = structuredClone(payload || {});
  clean.snapshots = (clean.snapshots || []).map(snapshot => ({
    ...snapshot,
    alerts: (snapshot?.alerts || []).filter(alert => !LIVE_ALERT_CODES.has(alert?.code)),
  }));
  return clean;
}

function latestSnapshot(payload, card) {
  const weekById = new Map((payload?.weeks || []).map(week => [String(week.id), week]));
  return (payload?.snapshots || [])
    .filter(snapshot => String(snapshot?.obraId) === String(card?.id))
    .sort((a, b) => {
      const aWeek = weekById.get(String(a?.weekId));
      const bWeek = weekById.get(String(b?.weekId));
      return String(bWeek?.start || '').localeCompare(String(aWeek?.start || ''));
    })[0] || null;
}

function liveAlert(code, severity, title, text) {
  return { id: code, code, severity, title, text, autoFixed: false, at: new Date().toISOString() };
}

export function decoratePayloadWithPortfolioAlerts(payload, works) {
  const decorated = stripLivePortfolioAlerts(payload);
  const workList = Array.isArray(works) ? works : [];
  for (const card of decorated.obras || []) {
    const linked = card?.portfolioWorkId
      ? workList.find(work => String(work?.id) === String(card.portfolioWorkId))
      : null;
    const candidates = linked
      ? [linked]
      : workList.filter(work => matchApprovalCard([card], work).card === card);
    const work = candidates.length === 1 ? candidates[0] : null;
    const snapshot = latestSnapshot(decorated, card);
    if (!snapshot) continue;
    snapshot.alerts = Array.isArray(snapshot.alerts) ? snapshot.alerts : [];
    if (!work) {
      snapshot.alerts.push(liveAlert(
        'portfolio_link_missing_live',
        'warning',
        'Vínculo com o portfólio pendente',
        'Não foi possível identificar com segurança o EV correspondente no portfólio. A conferência automática permanece pendente.'
      ));
      continue;
    }
    const portfolioTotal = portfolioEVWithoutRisk(work);
    const cardTotal = roundMoney(card?.ev?.total);
    const difference = roundMoney(portfolioTotal - cardTotal);
    if (Math.abs(difference) < 0.01) continue;
    const money = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    snapshot.alerts.push(liveAlert(
      'portfolio_ev_mismatch_live',
      'critical',
      'EV do portfólio divergente',
      `EV correto do card: ${money(cardTotal)}. EV atual do portfólio sem taxa de risco: ${money(portfolioTotal)}. Diferença: ${money(difference)}.`
    ));
  }
  return decorated;
}

export { normalize as normalizeApprovalText, roundMoney as roundApprovalMoney };
