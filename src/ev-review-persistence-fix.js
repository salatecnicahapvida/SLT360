import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { headers: { 'x-client-info': 'slt360-ev-review-persistence-fix-1' } },
  auth: { persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
});

const TABLE = 'slt_budget_ev_tracking';
let trackingRows = [];
let trackingLoaded = false;
let trackingPromise = null;
let lastHistoricalRecordId = '';
let scanScheduled = false;
let refreshScheduled = false;

function localDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function profileName() {
  return String(globalThis.SLT_CLOUD?.profile?.nome || '').trim();
}

function canWrite() {
  const cloud = globalThis.SLT_CLOUD;
  if (!cloud) return false;
  if (typeof cloud.canWritePermission === 'function') return Boolean(cloud.canWritePermission('works'));
  return Boolean(cloud.canWrite?.('works'));
}

function revisionFromModal(form) {
  const text = form?.closest('.ev-modal-card')?.querySelector('.ev-modal-status .tag')?.textContent || '';
  return Number(String(text).match(/\d+/)?.[0] || 0);
}

function historicalRecordFromWorkId(workId) {
  const value = String(workId || '').trim();
  const prefixes = ['EVW-', 'historical-work-', 'historical-budget-'];
  const prefix = prefixes.find(item => value.startsWith(item));
  return prefix ? value.slice(prefix.length) : '';
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function contextForForm(form) {
  const rawWorkId = String(form?.dataset?.workId || '').trim();
  const historicalRecordId = historicalRecordFromWorkId(rawWorkId) || lastHistoricalRecordId || '';
  if (historicalRecordId) {
    const evKey = `historical:${historicalRecordId}`;
    return {
      evKey,
      workId: '',
      historicalRecordId,
      revision: revisionFromModal(form),
      candidateKeys: unique([
        evKey,
        `work:EVW-${historicalRecordId}`,
        rawWorkId ? `work:${rawWorkId}` : '',
        `work:${historicalRecordId}`,
      ]),
    };
  }
  const evKey = `work:${rawWorkId}`;
  return {
    evKey,
    workId: rawWorkId,
    historicalRecordId: '',
    revision: revisionFromModal(form),
    candidateKeys: unique([evKey]),
  };
}

async function loadTracking(force = false) {
  if (trackingLoaded && !force) return trackingRows;
  if (trackingPromise && !force) return trackingPromise;
  trackingPromise = (async () => {
    const { data, error } = await client.from(TABLE).select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    trackingRows = Array.isArray(data) ? data : [];
    trackingLoaded = true;
    return trackingRows;
  })();
  try {
    return await trackingPromise;
  } finally {
    trackingPromise = null;
  }
}

function trackingForContext(context) {
  for (const key of context.candidateKeys || []) {
    const row = trackingRows.find(item => item.ev_key === key);
    if (row) return row;
  }
  if (context.historicalRecordId) {
    const row = trackingRows.find(item => item.historical_record_id === context.historicalRecordId);
    if (row) return row;
  }
  if (context.workId) {
    const row = trackingRows.find(item => item.work_id === context.workId);
    if (row) return row;
  }
  return null;
}

function rowCandidateKeys(row) {
  const rowId = String(row?.dataset?.id || '').trim();
  const historicalButton = row?.querySelector('[data-action="edit-historical-ev"][data-id]');
  const currentButton = row?.querySelector('[data-action="open-ev-modal"][data-id]');
  const historicalId = String(historicalButton?.dataset?.id || '').trim();
  const currentId = String(currentButton?.dataset?.id || '').trim();
  if (historicalId) {
    return unique([
      `historical:${historicalId}`,
      `work:EVW-${historicalId}`,
      rowId ? `work:${rowId}` : '',
      `work:${historicalId}`,
    ]);
  }
  return unique([
    rowId ? `work:${rowId}` : '',
    currentId ? `work:${currentId}` : '',
    currentId ? `historical:${currentId}` : '',
    currentId ? `work:EVW-${currentId}` : '',
  ]);
}

function trackingForPortfolioRow(row) {
  const keys = rowCandidateKeys(row);
  for (const key of keys) {
    const tracking = trackingRows.find(item => item.ev_key === key);
    if (tracking) return tracking;
  }
  return null;
}

function setPanelMessage(panel, text, state = '') {
  const node = panel?.querySelector('[data-tracking-message]');
  if (!node) return;
  node.textContent = text;
  node.dataset.state = state;
}

function applyReviewState(panel, row) {
  if (!panel) return;
  const reviewed = Boolean(row?.reviewed);
  const checkbox = panel.querySelector('[data-ev-reviewed]');
  const date = panel.querySelector('[data-reviewed-on]');
  const person = panel.querySelector('[data-reviewed-by]');
  const card = panel.querySelector('[data-review-card]');
  if (checkbox) checkbox.checked = reviewed;
  if (date) {
    date.value = row?.reviewed_on || date.value || localDate();
    date.disabled = !reviewed || !canWrite();
  }
  if (person) {
    person.value = row?.reviewed_by || person.value || profileName();
    person.disabled = !reviewed || !canWrite();
  }
  card?.classList.toggle('is-reviewed', reviewed);
}

function relabelPanel(panel) {
  const strong = panel?.querySelector('[data-review-card] .ev-tracking-toggle strong');
  if (strong && strong.textContent !== 'EV Revisado?') strong.textContent = 'EV Revisado?';
}

function relabelFilters() {
  document.querySelectorAll('[data-ev-review-filter]').forEach(select => {
    const label = select.closest('label');
    const title = label?.querySelector(':scope > span');
    if (title && title.textContent !== 'EV Revisado?') title.textContent = 'EV Revisado?';
    const all = select.querySelector('option[value=""]');
    const yes = select.querySelector('option[value="yes"]');
    const no = select.querySelector('option[value="no"]');
    if (all) all.textContent = 'Todos';
    if (yes) yes.textContent = 'Sim';
    if (no) no.textContent = 'Não';
  });
}

function tagPanel(panel) {
  if (!panel) return null;
  const form = panel.closest('form');
  if (!form) return null;
  const context = contextForForm(form);
  panel.dataset.evKey = context.evKey;
  relabelPanel(panel);
  return { form, context };
}

async function hydratePanel(panel) {
  const tagged = tagPanel(panel);
  if (!tagged) return;
  try {
    await loadTracking();
    if (!panel.isConnected) return;
    const latest = contextForForm(tagged.form);
    panel.dataset.evKey = latest.evKey;
    applyReviewState(panel, trackingForContext(latest));
    panel.dataset.evReviewPersistenceMounted = 'true';
  } catch (error) {
    console.warn('Não foi possível restaurar o status de revisão do EV.', error);
  }
}

async function saveReview(panel) {
  if (!panel || !canWrite()) return;
  const form = panel.closest('form');
  if (!form) return;
  const context = contextForForm(form);
  panel.dataset.evKey = context.evKey;
  const checkbox = panel.querySelector('[data-ev-reviewed]');
  const reviewed = Boolean(checkbox?.checked);
  const date = panel.querySelector('[data-reviewed-on]');
  const person = panel.querySelector('[data-reviewed-by]');
  if (reviewed) {
    if (date && !date.value) date.value = localDate();
    if (person && !String(person.value || '').trim()) person.value = profileName();
  }
  const reviewedOn = date?.value || '';
  const reviewedBy = String(person?.value || '').trim();
  if (reviewed && (!reviewedOn || !reviewedBy)) {
    setPanelMessage(panel, 'Informe a data e quem revisou o EV.', 'error');
    return;
  }

  setPanelMessage(panel, 'Salvando…', 'saving');
  try {
    await loadTracking();
    const existing = trackingForContext(context);
    const payload = {
      ev_key: context.evKey,
      work_id: context.workId || null,
      historical_record_id: context.historicalRecordId || null,
      reviewed,
      reviewed_on: reviewed ? reviewedOn : null,
      reviewed_by: reviewed ? reviewedBy : null,
      reviewed_revision: reviewed ? (context.revision || null) : null,
      has_pending: Boolean(existing?.has_pending),
      pending_note: existing?.pending_note || null,
      pending_on: existing?.pending_on || null,
      pending_by: existing?.pending_by || null,
      pending_revision: existing?.pending_revision ?? null,
    };
    const { data, error } = await client.from(TABLE).upsert(payload, { onConflict: 'ev_key' }).select().single();
    if (error) throw error;
    const index = trackingRows.findIndex(item => item.ev_key === data.ev_key);
    if (index >= 0) trackingRows[index] = data;
    else trackingRows.unshift(data);
    applyReviewState(panel, data);
    setPanelMessage(panel, 'EV Revisado? salvo automaticamente.', 'success');
    applyPortfolioTracking();
    globalThis.dispatchEvent?.(new CustomEvent('slt360:bank-saved', {
      detail: { message: 'Status EV Revisado? salvo no banco.' },
    }));
  } catch (error) {
    console.warn('Não foi possível salvar o status de revisão do EV.', error);
    setPanelMessage(panel, error?.message || 'Não foi possível salvar.', 'error');
  }
}

function syncReviewedBadge(row, tracking) {
  const actions = row.querySelector('.portfolio-actions');
  if (!actions) return;
  let badge = actions.querySelector('.ev-tracking-badge.is-reviewed');
  if (!tracking?.reviewed) {
    badge?.remove();
    return;
  }
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'ev-tracking-badge is-reviewed';
    actions.prepend(badge);
  }
  if (badge.textContent !== 'Revisado') badge.textContent = 'Revisado';
}

function applyPortfolioTracking() {
  relabelFilters();
  const table = document.querySelector('.portfolio-works-table');
  if (!table || !trackingLoaded) return;
  const reviewFilter = document.querySelector('[data-ev-review-filter]')?.value || '';
  const pendingFilter = document.querySelector('[data-ev-pending-filter]')?.value || '';
  let visible = 0;
  table.querySelectorAll('tbody .portfolio-work-row').forEach(row => {
    const tracking = trackingForPortfolioRow(row);
    syncReviewedBadge(row, tracking);
    const reviewed = Boolean(tracking?.reviewed);
    const hasPending = Boolean(tracking?.has_pending);
    const reviewMatches = !reviewFilter || (reviewFilter === 'yes' ? reviewed : !reviewed);
    const pendingMatches = !pendingFilter || (pendingFilter === 'yes' ? hasPending : !hasPending);
    const hidden = !(reviewMatches && pendingMatches);
    row.hidden = hidden;
    if (!hidden) visible += 1;
  });
  const summary = document.querySelector('[data-ev-tracking-filter-summary]');
  if (summary) summary.textContent = `${visible} EV${visible === 1 ? '' : 's'} visível${visible === 1 ? '' : 'eis'} com os filtros de revisão e pendência`;
}

function scan() {
  scanScheduled = false;
  relabelFilters();
  document.querySelectorAll('[data-ev-tracking-panel]').forEach(panel => {
    tagPanel(panel);
    if (panel.dataset.evReviewPersistenceMounted !== 'true') hydratePanel(panel);
  });
  if (document.querySelector('.portfolio-works-table')) {
    loadTracking().then(applyPortfolioTracking).catch(error => console.warn('Não foi possível aplicar o filtro EV Revisado?.', error));
  }
}

function scheduleScan() {
  if (scanScheduled) return;
  scanScheduled = true;
  queueMicrotask(scan);
}

function scheduleRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  setTimeout(async () => {
    refreshScheduled = false;
    try {
      await loadTracking(true);
      document.querySelectorAll('[data-ev-tracking-panel]').forEach(panel => {
        const tagged = tagPanel(panel);
        if (tagged) applyReviewState(panel, trackingForContext(tagged.context));
      });
      applyPortfolioTracking();
    } catch (error) {
      console.warn('Não foi possível atualizar o status EV Revisado?.', error);
    }
  }, 0);
}

function install() {
  document.addEventListener('click', event => {
    const actionNode = event.target.closest?.('[data-action]');
    const action = String(actionNode?.dataset?.action || '');
    if (action === 'edit-historical-ev') {
      lastHistoricalRecordId = String(actionNode.dataset.id || '').trim();
    } else if (action === 'open-ev-modal' || action === 'open-work-ev') {
      const id = String(actionNode?.dataset?.id || '').trim();
      lastHistoricalRecordId = historicalRecordFromWorkId(id);
    } else if (action === 'close-modal') {
      lastHistoricalRecordId = '';
    }

    const saveButton = event.target.closest?.('[data-tracking-save]');
    if (saveButton) {
      const panel = saveButton.closest('[data-ev-tracking-panel]');
      event.preventDefault();
      event.stopImmediatePropagation();
      saveReview(panel);
    }
  }, true);

  document.addEventListener('change', event => {
    if (event.target.matches('[data-ev-reviewed]')) {
      const panel = event.target.closest('[data-ev-tracking-panel]');
      queueMicrotask(() => saveReview(panel));
      return;
    }
    if (event.target.matches('[data-reviewed-on], [data-reviewed-by]')) {
      const panel = event.target.closest('[data-ev-tracking-panel]');
      if (panel?.querySelector('[data-ev-reviewed]')?.checked) queueMicrotask(() => saveReview(panel));
      return;
    }
    if (event.target.matches('[data-ev-review-filter], [data-ev-pending-filter]')) {
      queueMicrotask(applyPortfolioTracking);
    }
  }, false);

  globalThis.addEventListener?.('slt360:bank-saved', scheduleRefresh);
  new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true });
  scheduleScan();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();
