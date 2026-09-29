import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { headers: { 'x-client-info': 'slt360-ev-pending-items-1' } },
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
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
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
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
  const evKey = String(panel?.dataset?.evKey || '').trim();
  const workId = evKey.startsWith('work:') ? evKey.slice(5) : '';
  const historicalRecordId = evKey.startsWith('historical:') ? evKey.slice(11) : '';
  return { evKey, workId, historicalRecordId, revision: revisionFromPanel(panel) };
}

function groupRows(rows) {
  itemsByEv.clear();
  for (const row of rows || []) {
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
    groupRows(pendingResult.data || []);
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
  return itemsByEv.get(evKey) || [];
}

function openPendingItems(evKey) {
  return pendingItems(evKey).filter(item => !item.resolved);
}

function peopleListId(panel) {
  return panel.closest('form')?.querySelector('#evTrackingPeople') ? 'evTrackingPeople' : '';
}

function message(holder, text, state = '') {
  const node = holder.querySelector('[data-multi-pending-message]');
  if (!node) return;
  node.textContent = text;
  node.dataset.state = state;
}

function pendingItemHTML(item, write, listId) {
  const revision = item.recorded_revision != null ? ` · REV${String(item.recorded_revision).padStart(2, '0')}` : '';
  const resolvedRevision = item.resolved_revision != null ? ` · REV${String(item.resolved_revision).padStart(2, '0')}` : '';
  return `
    <article class="multi-pending-item ${item.resolved ? 'is-resolved' : 'is-open'}" data-pending-item="${escapeHTML(item.id)}">
      <div class="multi-pending-item-main">
        <div class="multi-pending-item-status">
          <span class="multi-pending-status ${item.resolved ? 'is-resolved' : 'is-open'}">${item.resolved ? 'Resolvida' : 'Aberta'}</span>
        </div>
        <strong>${escapeHTML(item.description)}</strong>
        <small>Registrada em ${formatDate(item.recorded_on)} por ${escapeHTML(item.recorded_by)}${revision}</small>
        ${item.resolved ? `<small>Resolvida em ${formatDate(item.resolved_on)} por ${escapeHTML(item.resolved_by)}${resolvedRevision}</small>` : ''}
      </div>
      ${write && !item.resolved ? `
        <div class="multi-pending-resolve" data-pending-resolve-editor hidden>
          <label class="field"><span>Data da resolução *</span><input type="date" data-resolved-on value="${localDate()}" /></label>
          <label class="field"><span>Resolvida por *</span><input data-resolved-by ${listId ? `list="${listId}"` : ''} maxlength="120" value="${escapeHTML(profileName())}" /></label>
          <div class="multi-pending-resolve-actions">
            <button type="button" class="secondary-action" data-action="cancel-resolve-pending">Cancelar</button>
            <button type="button" class="primary-action" data-action="confirm-resolve-pending">Confirmar resolução</button>
          </div>
        </div>
        <button type="button" class="secondary-action multi-pending-resolve-button" data-action="resolve-pending-item">Marcar como resolvida</button>
      ` : ''}
    </article>`;
}

function sectionHTML(panel) {
  const context = contextFromPanel(panel);
  const items = pendingItems(context.evKey);
  const open = items.filter(item => !item.resolved);
  const resolved = items.filter(item => item.resolved);
  const write = canWrite();
  const listId = peopleListId(panel);
  return `
    <section class="multi-pending-section" data-multi-pending-section data-ev-key="${escapeHTML(context.evKey)}">
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
          <label class="field"><span>Informado por *</span><input data-new-pending-by ${listId ? `list="${listId}"` : ''} maxlength="120" value="${escapeHTML(profileName())}" /></label>
          <button type="button" class="primary-action" data-action="add-pending-item">Adicionar pendência</button>
        </div>
      ` : ''}
      <div class="multi-pending-message" data-multi-pending-message></div>
      <div class="multi-pending-list">
        ${open.length ? open.map(item => pendingItemHTML(item, write, listId)).join('') : '<div class="multi-pending-empty">Nenhuma pendência aberta neste EV.</div>'}
        ${resolved.length ? `
          <details class="multi-pending-resolved-group">
            <summary>${resolved.length} pendência${resolved.length === 1 ? '' : 's'} resolvida${resolved.length === 1 ? '' : 's'}</summary>
            <div class="multi-pending-resolved-list">${resolved.map(item => pendingItemHTML(item, false, listId)).join('')}</div>
          </details>
        ` : ''}
      </div>
    </section>`;
}

async function syncTrackingSummary(context) {
  const open = openPendingItems(context.evKey);
  const latest = open[0] || null;
  const payload = {
    ev_key: context.evKey,
    work_id: context.workId || null,
    historical_record_id: context.historicalRecordId || null,
    has_pending: Boolean(latest),
    pending_note: latest?.description || null,
    pending_on: latest?.recorded_on || null,
    pending_by: latest?.recorded_by || null,
    pending_revision: latest?.recorded_revision ?? null,
  };
  const { data, error } = await client.from(TRACKING_TABLE)
    .upsert(payload, { onConflict: 'ev_key' })
    .select()
    .single();
  if (error) throw error;
  trackingByEv.set(context.evKey, data);
  return data;
}

function updateLegacyPendingFields(panel, context) {
  const open = openPendingItems(context.evKey);
  const latest = open[0] || null;
  const checkbox = panel.querySelector('[data-ev-has-pending]');
  const note = panel.querySelector('[data-ev-pending-note]');
  const date = panel.querySelector('[data-ev-pending-on]');
  const by = panel.querySelector('[data-ev-pending-by]');
  if (checkbox) checkbox.checked = Boolean(latest);
  if (note) note.value = latest?.description || '';
  if (date) date.value = latest?.recorded_on || localDate();
  if (by) by.value = latest?.recorded_by || profileName();
}

async function refreshSection(panel, holder) {
  const replacement = document.createElement('div');
  replacement.innerHTML = cleanHTML(sectionHTML(panel));
  const next = replacement.firstElementChild;
  holder.replaceWith(next);
  updateLegacyPendingFields(panel, contextFromPanel(panel));
  decoratePortfolioPending();
  applyPortfolioFilters();
}

async function addPending(panel, holder) {
  const context = contextFromPanel(panel);
  const description = String(holder.querySelector('[data-new-pending-description]')?.value || '').trim();
  const recordedOn = holder.querySelector('[data-new-pending-on]')?.value || '';
  const recordedBy = String(holder.querySelector('[data-new-pending-by]')?.value || '').trim();
  if (!description || !recordedOn || !recordedBy) {
    message(holder, 'Informe a pendência, a data e quem fez o registro.', 'error');
    return;
  }
  const button = holder.querySelector('[data-action="add-pending-item"]');
  if (button) button.disabled = true;
  message(holder, 'Salvando pendência…', 'saving');
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
    message(holder, error.message || 'Não foi possível adicionar a pendência.', 'error');
    return;
  }
  const list = pendingItems(context.evKey).slice();
  list.unshift(data);
  itemsByEv.set(context.evKey, list);
  await syncTrackingSummary(context);
  await refreshSection(panel, holder);
  globalThis.dispatchEvent?.(new CustomEvent('slt360:bank-saved', { detail: { message: 'Pendência do EV salva no banco.' } }));
}

async function resolvePending(panel, holder, itemNode) {
  const context = contextFromPanel(panel);
  const id = String(itemNode?.dataset?.pendingItem || '');
  const resolvedOn = itemNode.querySelector('[data-resolved-on]')?.value || '';
  const resolvedBy = String(itemNode.querySelector('[data-resolved-by]')?.value || '').trim();
  if (!resolvedOn || !resolvedBy) {
    message(holder, 'Informe a data e quem resolveu a pendência.', 'error');
    return;
  }
  const button = itemNode.querySelector('[data-action="confirm-resolve-pending"]');
  if (button) button.disabled = true;
  message(holder, 'Registrando resolução…', 'saving');
  const { data, error } = await client.from(PENDING_TABLE)
    .update({
      resolved: true,
      resolved_on: resolvedOn,
      resolved_by: resolvedBy,
      resolved_revision: context.revision || null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (button) button.disabled = false;
    message(holder, error.message || 'Não foi possível resolver a pendência.', 'error');
    return;
  }
  const list = pendingItems(context.evKey).map(item => item.id === data.id ? data : item);
  itemsByEv.set(context.evKey, list);
  await syncTrackingSummary(context);
  await refreshSection(panel, holder);
  globalThis.dispatchEvent?.(new CustomEvent('slt360:bank-saved', { detail: { message: 'Pendência do EV marcada como resolvida.' } }));
}

function bindSection(panel, holder) {
  holder.addEventListener('click', event => {
    const action = event.target.closest?.('[data-action]')?.dataset?.action;
    if (!action) return;
    const itemNode = event.target.closest('[data-pending-item]');
    if (action === 'add-pending-item') addPending(panel, holder);
    if (action === 'resolve-pending-item') {
      const editor = itemNode?.querySelector('[data-pending-resolve-editor]');
      if (editor) editor.hidden = false;
      const openButton = itemNode?.querySelector('[data-action="resolve-pending-item"]');
      if (openButton) openButton.hidden = true;
    }
    if (action === 'cancel-resolve-pending') {
      const editor = itemNode?.querySelector('[data-pending-resolve-editor]');
      if (editor) editor.hidden = true;
      const openButton = itemNode?.querySelector('[data-action="resolve-pending-item"]');
      if (openButton) openButton.hidden = false;
    }
    if (action === 'confirm-resolve-pending') resolvePending(panel, holder, itemNode);
  });
}

async function enhancePanel(panel) {
  if (!panel || panel.dataset.multiPendingMounted === 'true') return;
  panel.dataset.multiPendingMounted = 'true';
  try {
    await loadAll();
    if (!panel.isConnected) return;
    const existing = panel.parentElement?.querySelector('[data-multi-pending-section]');
    if (existing) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = cleanHTML(sectionHTML(panel));
    const section = wrapper.firstElementChild;
    const grid = panel.querySelector('.ev-tracking-grid');
    if (grid) grid.after(section);
    else panel.append(section);
    const saveButton = panel.querySelector('[data-ev-tracking-save]');
    if (saveButton) saveButton.textContent = 'Salvar revisão';
    updateLegacyPendingFields(panel, contextFromPanel(panel));
    bindSection(panel, section);
  } catch (error) {
    panel.dataset.multiPendingMounted = 'error';
    console.warn('Não foi possível carregar as pendências individuais do EV.', error);
  }
}

function portfolioEvKey(row) {
  const rowId = String(row?.dataset?.id || '').trim();
  const button = row?.querySelector('[data-action="edit-historical-ev"], [data-action="open-ev-modal"]');
  const openId = String(button?.dataset?.id || '').trim();
  if (trackingByEv.has(`work:${rowId}`)) return `work:${rowId}`;
  if (openId && trackingByEv.has(`historical:${openId}`)) return `historical:${openId}`;
  if (rowId) return `work:${rowId}`;
  return openId ? `historical:${openId}` : '';
}

function decoratePortfolioPending() {
  const table = document.querySelector('.portfolio-works-table');
  if (!table) return;
  table.querySelectorAll('tbody .portfolio-work-row').forEach(row => {
    const actions = row.querySelector('.portfolio-actions');
    if (!actions) return;
    const evKey = portfolioEvKey(row);
    const count = openPendingItems(evKey).length;
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
    row.hidden = !(reviewMatches && pendingMatches);
    if (!row.hidden) visible += 1;
  });
  const summary = document.querySelector('[data-ev-tracking-filter-summary]');
  if (summary) summary.textContent = `${visible} EV${visible === 1 ? '' : 's'} visível${visible === 1 ? '' : 'eis'} com os filtros de revisão e pendência`;
}

function ownFilter(select, type) {
  if (!select || select.dataset.multiFilterOwned === 'true') return select;
  const clone = select.cloneNode(true);
  clone.dataset.multiFilterOwned = 'true';
  clone.value = type === 'review' ? reviewFilter : pendingFilter;
  select.replaceWith(clone);
  clone.addEventListener('change', event => {
    if (type === 'review') reviewFilter = event.currentTarget.value;
    else pendingFilter = event.currentTarget.value;
    applyPortfolioFilters();
  });
  return clone;
}

async function enhancePortfolio() {
  try {
    await loadAll();
  } catch (error) {
    console.warn('Não foi possível carregar os filtros de pendências dos EVs.', error);
    return;
  }
  const reviewSelect = document.querySelector('[data-ev-review-filter]');
  const pendingSelect = document.querySelector('[data-ev-pending-filter]');
  if (!reviewSelect || !pendingSelect) return;
  ownFilter(reviewSelect, 'review');
  ownFilter(pendingSelect, 'pending');
  decoratePortfolioPending();
  applyPortfolioFilters();
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
    .multi-pending-create{display:grid;grid-template-columns:2fr 1fr 1.3fr auto;gap:10px;align-items:end;margin-top:14px;padding:12px;border:1px dashed var(--border,#dfe5ec);border-radius:12px}.multi-pending-description{grid-row:span 1}.multi-pending-create .primary-action{min-height:38px;white-space:nowrap}
    .multi-pending-message{min-height:18px;margin-top:8px;font-size:12px}.multi-pending-message[data-state="error"]{color:#b42318}.multi-pending-message[data-state="success"]{color:#16713b}
    .multi-pending-list{display:grid;gap:9px;margin-top:4px}.multi-pending-item{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:11px 12px;border:1px solid var(--border,#dfe5ec);border-radius:11px;background:rgba(148,163,184,.035)}.multi-pending-item.is-open{border-color:#efb45f;background:rgba(245,158,11,.055)}.multi-pending-item.is-resolved{opacity:.78}
    .multi-pending-item-main{display:grid;gap:3px;min-width:0}.multi-pending-item-main strong{white-space:pre-wrap}.multi-pending-item-main small{color:var(--muted,#667085)}.multi-pending-status{display:inline-flex;padding:3px 7px;border-radius:999px;font-size:10px;font-weight:700}.multi-pending-status.is-open{background:#fff1dd;color:#9a5b00}.multi-pending-status.is-resolved{background:#e9f8ee;color:#16713b}
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
  if (document.querySelector('.portfolio-works-table')) enhancePortfolio();
}

function scheduleScan() {
  if (scanScheduled) return;
  scanScheduled = true;
  queueMicrotask(scan);
}

function install() {
  document.addEventListener('click', event => {
    if (event.target.closest?.('[data-action="clear-portfolio-filters"]')) {
      reviewFilter = '';
      pendingFilter = '';
      scheduleScan();
    }
  }, true);
  new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
  scheduleScan();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();
