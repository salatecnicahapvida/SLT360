import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { headers: { 'x-client-info': 'slt360-ev-pending-items-2' } },
  auth: { persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
});

const PENDING_TABLE = 'slt_budget_ev_pending_items';
const TRACKING_TABLE = 'slt_budget_ev_tracking';
const itemsByEv = new Map();
const trackingByEv = new Map();
let loaded = false;
let loadingPromise = null;
let reviewFilter = '';
let pendingFilter = '';
let scanScheduled = false;
let refreshScheduled = false;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function cleanHTML(html) {
  return globalThis.SLT_CLOUD?.cleanHTML ? globalThis.SLT_CLOUD.cleanHTML(html) : html;
}

function localDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function formatDate(value) {
  if (!value) return '—';
  const [year, month, day] = String(value).slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : String(value);
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

function revisionFromPanel(panel) {
  const text = panel?.querySelector('.ev-tracking-heading')?.textContent || '';
  return Number(String(text).match(/REV\s*0*(\d+)/i)?.[1] || 0);
}

function contextFromPanel(panel) {
  // The form owns the EV identity; never reuse a previous panel or click.
  const rawWorkId = String(panel?.closest('form')?.dataset?.workId || '').trim();
  const prefix = 'historical-work-';
  const historicalRecordId = rawWorkId.startsWith(prefix) ? rawWorkId.slice(prefix.length) : '';
  const workId = historicalRecordId ? '' : rawWorkId;
  const evKey = historicalRecordId ? `historical:${historicalRecordId}` : workId ? `work:${workId}` : '';
  return { evKey, workId, historicalRecordId, revision: revisionFromPanel(panel) };
}

function indexPending(rows) {
  itemsByEv.clear();
  for (const row of rows || []) {
    // Legacy unscoped rows cannot safely be attributed to any work.
    if (!row.ev_key || (!row.work_id && !row.historical_record_id)) continue;
    if (!itemsByEv.has(row.ev_key)) itemsByEv.set(row.ev_key, []);
    itemsByEv.get(row.ev_key).push(row);
  }
  for (const list of itemsByEv.values()) {
    list.sort((a, b) => {
      if (Boolean(a.resolved) !== Boolean(b.resolved)) return a.resolved ? 1 : -1;
      return String(b.recorded_on || b.created_at || '').localeCompare(String(a.recorded_on || a.created_at || ''));
    });
  }
}

function indexTracking(rows) {
  trackingByEv.clear();
  for (const row of rows || []) trackingByEv.set(row.ev_key, row);
}

async function loadAll(force = false) {
  if (loaded && !force) return;
  if (loadingPromise && !force) return loadingPromise;
  loadingPromise = (async () => {
    const [pendingResult, trackingResult] = await Promise.all([
      client.from(PENDING_TABLE).select('*').order('recorded_on', { ascending: false }).order('created_at', { ascending: false }),
      client.from(TRACKING_TABLE).select('*').order('updated_at', { ascending: false }),
    ]);
    if (pendingResult.error) throw pendingResult.error;
    if (trackingResult.error) throw trackingResult.error;
    indexPending(pendingResult.data || []);
    indexTracking(trackingResult.data || []);
    loaded = true;
  })();
  try {
    await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

function pendingItems(evKey) {
  return evKey ? itemsByEv.get(evKey) || [] : [];
}

function openPendingItems(evKey) {
  return pendingItems(evKey).filter(item => !item.resolved);
}

function listAttribute(panel) {
  return panel.closest('form')?.querySelector('#evTrackingPeople') ? ' list="evTrackingPeople"' : '';
}

function pendingItemHTML(item, write, listAttr) {
  const recordedRevision = item.recorded_revision != null ? ` · REV${String(item.recorded_revision).padStart(2, '0')}` : '';
  const resolvedRevision = item.resolved_revision != null ? ` · REV${String(item.resolved_revision).padStart(2, '0')}` : '';
  return `
    <article class="multi-pending-item ${item.resolved ? 'is-resolved' : 'is-open'}" data-pending-item="${escapeHTML(item.id)}">
      <div class="multi-pending-item-main">
        <span class="multi-pending-status ${item.resolved ? 'is-resolved' : 'is-open'}">${item.resolved ? 'Resolvida' : 'Aberta'}</span>
        <strong>${escapeHTML(item.description)}</strong>
        <small>Registrada em ${formatDate(item.recorded_on)} por ${escapeHTML(item.recorded_by)}${recordedRevision}</small>
        ${item.resolved ? `<small>Resolvida em ${formatDate(item.resolved_on)} por ${escapeHTML(item.resolved_by)}${resolvedRevision}</small>` : ''}
      </div>
      ${write && !item.resolved ? `
        <div class="multi-pending-resolve" data-pending-resolve-editor hidden>
          <label class="field"><span>Data da resolução *</span><input type="date" data-resolved-on value="${localDate()}" /></label>
          <label class="field"><span>Resolvida por *</span><input data-resolved-by${listAttr} maxlength="120" value="${escapeHTML(profileName())}" /></label>
          <div class="multi-pending-resolve-actions">
            <button type="button" class="secondary-action" data-action="cancel-resolve-pending">Cancelar</button>
            <button type="button" class="primary-action" data-action="confirm-resolve-pending">Confirmar resolução</button>
          </div>
        </div>
        <button type="button" class="secondary-action multi-pending-resolve-button" data-action="resolve-pending-item">Marcar como resolvida</button>
      ` : ''}
    </article>`;
}

function sectionContent(panel) {
  const { evKey } = contextFromPanel(panel);
  const items = pendingItems(evKey);
  const open = items.filter(item => !item.resolved);
  const resolved = items.filter(item => item.resolved);
  const write = canWrite();
  const listAttr = listAttribute(panel);
  return `
    <div class="multi-pending-heading">
      <div>
        <span class="eyebrow">Pendências do EV</span>
        <h3>Pendências individuais</h3>
        <p>Cada pendência fica registrada separadamente e pode ser encerrada sem apagar o histórico.</p>
      </div>
      <span class="multi-pending-count ${open.length ? 'has-open' : ''}">${open.length} aberta${open.length === 1 ? '' : 's'}</span>
    </div>
    ${write ? `
      <div class="multi-pending-create">
        <label class="field multi-pending-description"><span>Nova pendência *</span><textarea rows="3" maxlength="1000" data-new-pending-description placeholder="Descreva objetivamente o que ainda precisa ser resolvido"></textarea></label>
        <label class="field"><span>Data do registro *</span><input type="date" data-new-pending-on value="${localDate()}" /></label>
        <label class="field"><span>Informado por *</span><input data-new-pending-by${listAttr} maxlength="120" value="${escapeHTML(profileName())}" /></label>
        <button type="button" class="primary-action" data-action="add-pending-item">Adicionar pendência</button>
      </div>
    ` : ''}
    <div class="multi-pending-message" data-multi-pending-message></div>
    <div class="multi-pending-list">
      ${open.length ? open.map(item => pendingItemHTML(item, write, listAttr)).join('') : '<div class="multi-pending-empty">Nenhuma pendência aberta neste EV.</div>'}
      ${resolved.length ? `
        <details class="multi-pending-resolved-group">
          <summary>${resolved.length} pendência${resolved.length === 1 ? '' : 's'} resolvida${resolved.length === 1 ? '' : 's'}</summary>
          <div class="multi-pending-resolved-list">${resolved.map(item => pendingItemHTML(item, false, listAttr)).join('')}</div>
        </details>
      ` : ''}
    </div>`;
}

function setMessage(section, text, state = '') {
  const node = section?.querySelector('[data-multi-pending-message]');
  if (!node) return;
  node.textContent = text;
  node.dataset.state = state;
}

function updateLegacyFields(panel) {
  const context = contextFromPanel(panel);
  const latest = openPendingItems(context.evKey)[0] || null;
  const checkbox = panel.querySelector('[data-ev-has-pending]');
  const note = panel.querySelector('[data-ev-pending-note]');
  const date = panel.querySelector('[data-ev-pending-on]');
  const by = panel.querySelector('[data-ev-pending-by]');
  if (checkbox) checkbox.checked = Boolean(latest);
  if (note) note.value = latest?.description || '';
  if (date) date.value = latest?.recorded_on || localDate();
  if (by) by.value = latest?.recorded_by || profileName();
}

function renderPanel(panel) {
  if (!panel?.isConnected || !contextFromPanel(panel).evKey) return;
  panel.dataset.evKey = contextFromPanel(panel).evKey;
  let section = panel.querySelector('[data-multi-pending-section]');
  if (!section) {
    section = document.createElement('section');
    section.className = 'multi-pending-section';
    section.dataset.multiPendingSection = 'true';
    const grid = panel.querySelector('.ev-tracking-grid');
    if (grid) grid.after(section);
    else panel.append(section);
  }
  section.innerHTML = cleanHTML(sectionContent(panel));
  const saveButton = panel.querySelector('[data-ev-tracking-save]');
  if (saveButton && saveButton.textContent !== 'Salvar revisão') saveButton.textContent = 'Salvar revisão';
  updateLegacyFields(panel);
}

async function syncTrackingSummary(context) {
  const latest = openPendingItems(context.evKey)[0] || null;
  const { data, error } = await client.from(TRACKING_TABLE).upsert({
    ev_key: context.evKey,
    work_id: context.workId || null,
    historical_record_id: context.historicalRecordId || null,
    has_pending: Boolean(latest),
    pending_note: latest?.description || null,
    pending_on: latest?.recorded_on || null,
    pending_by: latest?.recorded_by || null,
    pending_revision: latest?.recorded_revision ?? null,
  }, { onConflict: 'ev_key' }).select().single();
  if (error) throw error;
  trackingByEv.set(context.evKey, data);
}

async function addPending(section, panel) {
  const context = contextFromPanel(panel);
  if (!context.evKey || !canWrite()) {
    setMessage(section, 'Não foi possível identificar o EV ou autorizar o registro.', 'error');
    return;
  }
  const description = String(section.querySelector('[data-new-pending-description]')?.value || '').trim();
  const recordedOn = section.querySelector('[data-new-pending-on]')?.value || '';
  const recordedBy = String(section.querySelector('[data-new-pending-by]')?.value || '').trim();
  if (!description || !recordedOn || !recordedBy) {
    setMessage(section, 'Informe a pendência, a data e quem fez o registro.', 'error');
    return;
  }
  const button = section.querySelector('[data-action="add-pending-item"]');
  if (button) button.disabled = true;
  setMessage(section, 'Salvando pendência…', 'saving');
  const { data, error } = await client.from(PENDING_TABLE).insert({
    ev_key: context.evKey,
    work_id: context.workId || null,
    historical_record_id: context.historicalRecordId || null,
    description,
    recorded_on: recordedOn,
    recorded_by: recordedBy,
    recorded_revision: context.revision || null,
  }).select().single();
  if (error) {
    if (button) button.disabled = false;
    setMessage(section, error.message || 'Não foi possível adicionar a pendência.', 'error');
    return;
  }
  const list = pendingItems(context.evKey).slice();
  list.unshift(data);
  itemsByEv.set(context.evKey, list);
  await syncTrackingSummary(context);
  renderPanel(panel);
  decoratePortfolioPending();
  applyPortfolioFilters();
  globalThis.dispatchEvent?.(new CustomEvent('slt360:bank-saved', { detail: { message: 'Pendência do EV salva no banco.' } }));
}

async function resolvePending(section, panel, itemNode) {
  const context = contextFromPanel(panel);
  const id = String(itemNode?.dataset?.pendingItem || '');
  if (!context.evKey || !canWrite() || !pendingItems(context.evKey).some(item => item.id === id)) {
    setMessage(section, 'Esta pendência não pertence ao EV aberto.', 'error');
    return;
  }
  const resolvedOn = itemNode?.querySelector('[data-resolved-on]')?.value || '';
  const resolvedBy = String(itemNode?.querySelector('[data-resolved-by]')?.value || '').trim();
  if (!resolvedOn || !resolvedBy) {
    setMessage(section, 'Informe a data e quem resolveu a pendência.', 'error');
    return;
  }
  const button = itemNode.querySelector('[data-action="confirm-resolve-pending"]');
  if (button) button.disabled = true;
  setMessage(section, 'Registrando resolução…', 'saving');
  const { data, error } = await client.from(PENDING_TABLE).update({
    resolved: true,
    resolved_on: resolvedOn,
    resolved_by: resolvedBy,
    resolved_revision: context.revision || null,
  }).eq('id', id).eq('ev_key', context.evKey).select().single();
  if (error) {
    if (button) button.disabled = false;
    setMessage(section, error.message || 'Não foi possível resolver a pendência.', 'error');
    return;
  }
  itemsByEv.set(context.evKey, pendingItems(context.evKey).map(item => item.id === data.id ? data : item));
  await syncTrackingSummary(context);
  renderPanel(panel);
  decoratePortfolioPending();
  applyPortfolioFilters();
  globalThis.dispatchEvent?.(new CustomEvent('slt360:bank-saved', { detail: { message: 'Pendência do EV marcada como resolvida.' } }));
}

function portfolioEvKey(row) {
  const rowId = String(row?.dataset?.id || '').trim();
  const button = row?.querySelector('[data-action="edit-historical-ev"], [data-action="open-ev-modal"]');
  const openId = String(button?.dataset?.id || '').trim();
  const candidates = [
    rowId ? `work:${rowId}` : '',
    openId ? `historical:${openId}` : '',
    openId ? `work:${openId}` : '',
  ].filter(Boolean);
  return candidates.find(key => trackingByEv.has(key) || itemsByEv.has(key)) || candidates[0] || '';
}

function decoratePortfolioPending() {
  const table = document.querySelector('.portfolio-works-table');
  if (!table) return;
  table.querySelectorAll('tbody .portfolio-work-row').forEach(row => {
    const actions = row.querySelector('.portfolio-actions');
    if (!actions) return;
    const count = openPendingItems(portfolioEvKey(row)).length;
    let badge = actions.querySelector('.ev-multi-pending-badge');
    if (!count) {
      badge?.remove();
      return;
    }
    const label = count === 1 ? '1 pendência' : `${count} pendências`;
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'ev-multi-pending-badge';
      actions.prepend(badge);
    }
    if (badge.textContent !== label) badge.textContent = label;
  });
}

function applyPortfolioFilters() {
  const table = document.querySelector('.portfolio-works-table');
  if (!table) return;
  const reviewSelect = document.querySelector('[data-ev-review-filter][data-multi-filter-owned="true"]');
  const pendingSelect = document.querySelector('[data-ev-pending-filter][data-multi-filter-owned="true"]');
  reviewFilter = reviewSelect?.value ?? reviewFilter;
  pendingFilter = pendingSelect?.value ?? pendingFilter;
  let visible = 0;
  table.querySelectorAll('tbody .portfolio-work-row').forEach(row => {
    const evKey = portfolioEvKey(row);
    const reviewed = Boolean(trackingByEv.get(evKey)?.reviewed);
    const hasOpen = openPendingItems(evKey).length > 0;
    const reviewMatches = !reviewFilter || (reviewFilter === 'yes' ? reviewed : !reviewed);
    const pendingMatches = !pendingFilter || (pendingFilter === 'yes' ? hasOpen : !hasOpen);
    const nextHidden = !(reviewMatches && pendingMatches);
    if (row.hidden !== nextHidden) row.hidden = nextHidden;
    if (!nextHidden) visible += 1;
  });
  const summary = document.querySelector('[data-ev-tracking-filter-summary]');
  if (summary) {
    const text = `${visible} EV${visible === 1 ? '' : 's'} visível${visible === 1 ? '' : 'eis'} com os filtros de revisão e pendência`;
    if (summary.textContent !== text) summary.textContent = text;
  }
}

function ownFilter(select, type) {
  if (!select || select.dataset.multiFilterOwned === 'true') return;
  const clone = select.cloneNode(true);
  clone.dataset.multiFilterOwned = 'true';
  clone.value = type === 'review' ? reviewFilter : pendingFilter;
  select.replaceWith(clone);
}

async function enhancePortfolio() {
  await loadAll();
  const reviewSelect = document.querySelector('[data-ev-review-filter]');
  const pendingSelect = document.querySelector('[data-ev-pending-filter]');
  if (!reviewSelect || !pendingSelect) return;
  ownFilter(reviewSelect, 'review');
  ownFilter(pendingSelect, 'pending');
  decoratePortfolioPending();
  applyPortfolioFilters();
}

async function enhancePanel(panel) {
  if (!panel || panel.dataset.multiPendingMounted === 'true') return;
  panel.dataset.multiPendingMounted = 'true';
  try {
    await loadAll();
    if (!panel.isConnected) return;
    renderPanel(panel);
  } catch (error) {
    panel.dataset.multiPendingMounted = 'error';
    console.warn('Não foi possível carregar as pendências individuais do EV.', error);
  }
}

function installStyles() {
  if (document.querySelector('#multiPendingStyles')) return;
  const style = document.createElement('style');
  style.id = 'multiPendingStyles';
  style.textContent = `
    .ev-tracking-card.is-pending-card{display:none!important}.ev-tracking-grid{grid-template-columns:1fr!important}.ev-tracking-badge.has-pending{display:none!important}
    .multi-pending-section{margin-top:14px;padding-top:14px;border-top:1px solid var(--border,#dfe5ec)}
    .multi-pending-heading{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.multi-pending-heading h3{margin:3px 0 4px}.multi-pending-heading p{margin:0;color:var(--muted,#667085);font-size:13px}
    .multi-pending-count{display:inline-flex;padding:5px 9px;border-radius:999px;background:#eef2f6;color:#52606d;font-size:11px;font-weight:700;white-space:nowrap}.multi-pending-count.has-open{background:#fff1dd;color:#9a5b00}
    .multi-pending-create{display:grid;grid-template-columns:2fr 1fr 1.3fr auto;gap:10px;align-items:end;margin-top:14px;padding:12px;border:1px dashed var(--border,#dfe5ec);border-radius:12px}.multi-pending-create .primary-action{min-height:38px;white-space:nowrap}
    .multi-pending-message{min-height:18px;margin-top:8px;font-size:12px}.multi-pending-message[data-state="error"]{color:#b42318}
    .multi-pending-list{display:grid;gap:9px;margin-top:4px}.multi-pending-item{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:11px 12px;border:1px solid var(--border,#dfe5ec);border-radius:11px;background:rgba(148,163,184,.035)}.multi-pending-item.is-open{border-color:#efb45f;background:rgba(245,158,11,.055)}.multi-pending-item.is-resolved{opacity:.78}
    .multi-pending-item-main{display:grid;gap:3px;min-width:0}.multi-pending-item-main strong{white-space:pre-wrap}.multi-pending-item-main small{color:var(--muted,#667085)}.multi-pending-status{display:inline-flex;width:max-content;padding:3px 7px;border-radius:999px;font-size:10px;font-weight:700}.multi-pending-status.is-open{background:#fff1dd;color:#9a5b00}.multi-pending-status.is-resolved{background:#e9f8ee;color:#16713b}
    .multi-pending-resolve{display:grid;grid-template-columns:1fr 1.3fr;gap:8px;min-width:min(440px,100%)}.multi-pending-resolve-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px}.multi-pending-resolve-button{white-space:nowrap}.multi-pending-empty{padding:12px;border-radius:10px;background:rgba(148,163,184,.06);color:var(--muted,#667085);font-size:13px}.multi-pending-resolved-group{margin-top:3px}.multi-pending-resolved-group summary{cursor:pointer;color:var(--muted,#667085);font-size:12px;font-weight:700}.multi-pending-resolved-list{display:grid;gap:8px;margin-top:8px}
    .ev-multi-pending-badge{display:inline-flex;align-items:center;padding:3px 7px;border-radius:999px;font-size:10px;font-weight:700;white-space:nowrap;background:#fff1dd;color:#9a5b00}
    @media(max-width:900px){.multi-pending-heading,.multi-pending-item{flex-direction:column;align-items:stretch}.multi-pending-create{grid-template-columns:1fr}.multi-pending-resolve{grid-template-columns:1fr;min-width:0}.multi-pending-resolve-actions{grid-column:auto;flex-direction:column}.multi-pending-create .primary-action,.multi-pending-resolve-button{width:100%}}
  `;
  document.head.append(style);
}

function scan() {
  scanScheduled = false;
  installStyles();
  document.querySelectorAll('[data-ev-tracking-panel]:not([data-multi-pending-mounted="true"])').forEach(panel => enhancePanel(panel));
  if (document.querySelector('.portfolio-works-table')) {
    enhancePortfolio().catch(error => console.warn('Não foi possível aplicar os filtros de pendências.', error));
  }
}

function scheduleScan() {
  if (scanScheduled) return;
  scanScheduled = true;
  queueMicrotask(scan);
}

function scheduleBankRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  setTimeout(async () => {
    refreshScheduled = false;
    try {
      await loadAll(true);
      document.querySelectorAll('[data-ev-tracking-panel][data-multi-pending-mounted="true"]').forEach(renderPanel);
      decoratePortfolioPending();
      applyPortfolioFilters();
    } catch (error) {
      console.warn('Não foi possível atualizar o controle de pendências.', error);
    }
  }, 0);
}

function install() {
  document.addEventListener('click', event => {
    const actionNode = event.target.closest?.('[data-action]');
    const action = actionNode?.dataset?.action || '';
    if (action === 'clear-portfolio-filters') {
      reviewFilter = '';
      pendingFilter = '';
      scheduleScan();
      return;
    }
    const section = event.target.closest?.('[data-multi-pending-section]');
    if (!section) return;
    const panel = section.closest('[data-ev-tracking-panel]');
    const itemNode = event.target.closest('[data-pending-item]');
    if (action === 'add-pending-item') addPending(section, panel);
    if (action === 'resolve-pending-item') {
      const editor = itemNode?.querySelector('[data-pending-resolve-editor]');
      if (editor) editor.hidden = false;
      if (actionNode) actionNode.hidden = true;
    }
    if (action === 'cancel-resolve-pending') {
      const editor = itemNode?.querySelector('[data-pending-resolve-editor]');
      const openButton = itemNode?.querySelector('[data-action="resolve-pending-item"]');
      if (editor) editor.hidden = true;
      if (openButton) openButton.hidden = false;
    }
    if (action === 'confirm-resolve-pending') resolvePending(section, panel, itemNode);
  }, true);

  document.addEventListener('change', event => {
    if (event.target.matches('[data-ev-review-filter][data-multi-filter-owned="true"]')) {
      reviewFilter = event.target.value;
      applyPortfolioFilters();
    }
    if (event.target.matches('[data-ev-pending-filter][data-multi-filter-owned="true"]')) {
      pendingFilter = event.target.value;
      applyPortfolioFilters();
    }
  }, true);

  globalThis.addEventListener?.('slt360:bank-saved', scheduleBankRefresh);
  new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
  scheduleScan();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();
