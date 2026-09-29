import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { headers: { 'x-client-info': 'slt360-ev-tracking-2' } },
  auth: { persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
});

const TABLE = 'slt_budget_ev_tracking';
let trackingRows = [];
let trackingLoaded = false;
let trackingPromise = null;
let reviewFilter = '';
let pendingFilter = '';
let lastHistoricalRecordId = '';
let scanScheduled = false;

function localDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function cleanHTML(html) {
  return globalThis.SLT_CLOUD?.cleanHTML ? globalThis.SLT_CLOUD.cleanHTML(html) : html;
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
  const text = form.closest('.ev-modal-card')?.querySelector('.ev-modal-status .tag')?.textContent || '';
  return Number(String(text).match(/\d+/)?.[0] || 0);
}

function modalContext(form) {
  const rawWorkId = String(form?.dataset?.workId || '').trim();
  const historicalPrefix = 'historical-work-';
  const historicalFromWorkId = rawWorkId.startsWith(historicalPrefix)
    ? rawWorkId.slice(historicalPrefix.length)
    : '';
  const historicalRecordId = historicalFromWorkId || lastHistoricalRecordId || '';
  const workId = historicalFromWorkId ? '' : rawWorkId;
  const evKey = workId
    ? `work:${workId}`
    : historicalRecordId
      ? `historical:${historicalRecordId}`
      : `work:${rawWorkId}`;
  return { evKey, workId, historicalRecordId, revision: revisionFromModal(form) };
}

async function loadTracking(force = false) {
  if (!force && trackingLoaded) return trackingRows;
  if (!force && trackingPromise) return trackingPromise;
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
  return trackingRows.find(row =>
    row.ev_key === context.evKey ||
    (context.workId && row.work_id === context.workId) ||
    (context.historicalRecordId && row.historical_record_id === context.historicalRecordId)
  ) || null;
}

function peopleOptions() {
  const names = [profileName(), ...(globalThis.SLT_CLOUD?.analysts || []).map(item => item?.nome)]
    .map(value => String(value || '').trim())
    .filter(Boolean);
  return [...new Set(names)]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map(name => `<option value="${escapeHTML(name)}"></option>`)
    .join('');
}

function trackingPanelHTML(context, row) {
  const writable = canWrite();
  const reviewed = Boolean(row?.reviewed);
  const pending = Boolean(row?.has_pending);
  const disabled = writable ? '' : 'disabled';
  const revision = context.revision ? `REV${String(context.revision).padStart(2, '0')}` : 'REV atual';
  return `
    <section class="ev-tracking-panel" data-ev-tracking-panel>
      <div class="ev-tracking-heading">
        <div>
          <span class="eyebrow">Controle de revisão</span>
          <h3>Revisão e pendências do EV</h3>
          <p>Registro separado da carga histórica. Referência atual: <strong>${revision}</strong>.</p>
        </div>
        ${writable ? '' : '<span class="tag">Somente consulta</span>'}
      </div>
      <div class="ev-tracking-grid">
        <article class="ev-tracking-card ${reviewed ? 'is-reviewed' : ''}" data-review-card>
          <label class="ev-tracking-toggle">
            <input type="checkbox" data-ev-reviewed ${reviewed ? 'checked' : ''} ${disabled}>
            <span><strong>EV revisado</strong><small>Marque quando a revisão deste EV estiver concluída.</small></span>
          </label>
          <div class="ev-tracking-fields" data-review-fields>
            <label class="field"><span>Data da revisão *</span><input type="date" data-reviewed-on value="${escapeHTML(row?.reviewed_on || localDate())}" ${reviewed ? '' : 'disabled'} ${disabled}></label>
            <label class="field"><span>Revisado por *</span><input data-reviewed-by list="evTrackingPeople" maxlength="120" value="${escapeHTML(row?.reviewed_by || profileName())}" ${reviewed ? '' : 'disabled'} ${disabled}></label>
            ${row?.reviewed_revision != null ? `<small class="ev-tracking-audit">Registrado na REV${String(row.reviewed_revision).padStart(2, '0')}</small>` : ''}
          </div>
        </article>
        <article class="ev-tracking-card ${pending ? 'has-pending' : ''}" data-pending-card>
          <label class="ev-tracking-toggle">
            <input type="checkbox" data-ev-pending ${pending ? 'checked' : ''} ${disabled}>
            <span><strong>EV possui pendência</strong><small>Registre exatamente o que ainda precisa ser resolvido.</small></span>
          </label>
          <div class="ev-tracking-fields" data-pending-fields>
            <label class="field ev-tracking-note"><span>O que está pendente? *</span><textarea rows="3" maxlength="1000" data-pending-note ${pending ? '' : 'disabled'} ${disabled}>${escapeHTML(row?.pending_note || '')}</textarea></label>
            <label class="field"><span>Data do registro *</span><input type="date" data-pending-on value="${escapeHTML(row?.pending_on || localDate())}" ${pending ? '' : 'disabled'} ${disabled}></label>
            <label class="field"><span>Informado por *</span><input data-pending-by list="evTrackingPeople" maxlength="120" value="${escapeHTML(row?.pending_by || profileName())}" ${pending ? '' : 'disabled'} ${disabled}></label>
            ${row?.pending_revision != null ? `<small class="ev-tracking-audit">Pendência registrada na REV${String(row.pending_revision).padStart(2, '0')}</small>` : ''}
          </div>
        </article>
      </div>
      <datalist id="evTrackingPeople">${peopleOptions()}</datalist>
      <div class="ev-tracking-actions">
        <span data-tracking-message></span>
        ${writable ? '<button class="secondary-action" type="button" data-tracking-save>Salvar revisão / pendência</button>' : ''}
      </div>
    </section>`;
}

function setFieldsEnabled(panel, kind, enabled) {
  const fields = panel.querySelector(kind === 'review' ? '[data-review-fields]' : '[data-pending-fields]');
  fields?.querySelectorAll('input, textarea').forEach(field => { field.disabled = !enabled || !canWrite(); });
  panel.querySelector(kind === 'review' ? '[data-review-card]' : '[data-pending-card]')
    ?.classList.toggle(kind === 'review' ? 'is-reviewed' : 'has-pending', enabled);
}

function panelMessage(panel, text, state = '') {
  const node = panel.querySelector('[data-tracking-message]');
  if (!node) return;
  node.textContent = text;
  node.dataset.state = state;
}

async function saveTracking(panel, form) {
  const context = modalContext(form);
  const reviewed = Boolean(panel.querySelector('[data-ev-reviewed]')?.checked);
  const hasPending = Boolean(panel.querySelector('[data-ev-pending]')?.checked);
  const reviewedOn = panel.querySelector('[data-reviewed-on]')?.value || '';
  const reviewedBy = String(panel.querySelector('[data-reviewed-by]')?.value || '').trim();
  const pendingNote = String(panel.querySelector('[data-pending-note]')?.value || '').trim();
  const pendingOn = panel.querySelector('[data-pending-on]')?.value || '';
  const pendingBy = String(panel.querySelector('[data-pending-by]')?.value || '').trim();

  if (reviewed && (!reviewedOn || !reviewedBy)) {
    panelMessage(panel, 'Informe a data e quem revisou o EV.', 'error');
    return;
  }
  if (hasPending && (!pendingNote || !pendingOn || !pendingBy)) {
    panelMessage(panel, 'Informe a pendência, a data e quem fez o registro.', 'error');
    return;
  }

  const button = panel.querySelector('[data-tracking-save]');
  if (button) button.disabled = true;
  panelMessage(panel, 'Salvando…', 'saving');
  const payload = {
    ev_key: context.evKey,
    work_id: context.workId || null,
    historical_record_id: context.historicalRecordId || null,
    reviewed,
    reviewed_on: reviewed ? reviewedOn : null,
    reviewed_by: reviewed ? reviewedBy : null,
    reviewed_revision: reviewed ? context.revision : null,
    has_pending: hasPending,
    pending_note: hasPending ? pendingNote : null,
    pending_on: hasPending ? pendingOn : null,
    pending_by: hasPending ? pendingBy : null,
    pending_revision: hasPending ? context.revision : null,
  };
  const { data, error } = await client.from(TABLE).upsert(payload, { onConflict: 'ev_key' }).select().single();
  if (button) button.disabled = false;
  if (error) {
    panelMessage(panel, error.message || 'Não foi possível salvar.', 'error');
    return;
  }
  const index = trackingRows.findIndex(item => item.ev_key === data.ev_key);
  if (index >= 0) trackingRows[index] = data;
  else trackingRows.unshift(data);
  panelMessage(panel, 'Registro salvo no banco.', 'success');
  globalThis.dispatchEvent?.(new CustomEvent('slt360:bank-saved', { detail: { message: 'Revisão/pendência do EV salva no banco.' } }));
  applyPortfolioTracking();
}

async function mountEVPanel(form) {
  if (!form || form.dataset.evTrackingMounted === 'true') return;
  form.dataset.evTrackingMounted = 'true';
  try {
    await loadTracking();
    if (!form.isConnected) return;
    const context = modalContext(form);
    const holder = document.createElement('div');
    holder.innerHTML = cleanHTML(trackingPanelHTML(context, trackingForContext(context)));
    const panel = holder.firstElementChild;
    const toolbar = form.querySelector('.ev-editor-toolbar');
    if (toolbar) toolbar.before(panel);
    else form.prepend(panel);

    panel.querySelector('[data-ev-reviewed]')?.addEventListener('change', event => {
      const checked = event.currentTarget.checked;
      if (checked) {
        const date = panel.querySelector('[data-reviewed-on]');
        const person = panel.querySelector('[data-reviewed-by]');
        if (date && !date.value) date.value = localDate();
        if (person && !person.value) person.value = profileName();
      }
      setFieldsEnabled(panel, 'review', checked);
    });
    panel.querySelector('[data-ev-pending]')?.addEventListener('change', event => {
      const checked = event.currentTarget.checked;
      if (checked) {
        const date = panel.querySelector('[data-pending-on]');
        const person = panel.querySelector('[data-pending-by]');
        if (date && !date.value) date.value = localDate();
        if (person && !person.value) person.value = profileName();
      }
      setFieldsEnabled(panel, 'pending', checked);
    });
    panel.querySelector('[data-tracking-save]')?.addEventListener('click', () => saveTracking(panel, form));
  } catch (error) {
    form.dataset.evTrackingMounted = 'error';
    console.warn('Não foi possível carregar o controle de revisão do EV.', error);
  }
}

function trackingForPortfolioRow(row) {
  const rowId = String(row.dataset.id || '');
  const button = row.querySelector('[data-action="edit-historical-ev"], [data-action="open-ev-modal"]');
  const openId = String(button?.dataset.id || '');
  return trackingRows.find(item =>
    item.ev_key === `work:${rowId}` || item.work_id === rowId ||
    (openId && (item.ev_key === `historical:${openId}` || item.historical_record_id === openId))
  ) || null;
}

function syncBadge(actions, selector, shouldExist, html) {
  const current = actions.querySelector(selector);
  if (shouldExist && !current) actions.insertAdjacentHTML('afterbegin', html);
  else if (!shouldExist && current) current.remove();
}

function decoratePortfolioRow(row, tracking) {
  const actions = row.querySelector('.portfolio-actions');
  if (!actions) return;
  syncBadge(actions, '.ev-tracking-badge.is-reviewed', Boolean(tracking?.reviewed), '<span class="ev-tracking-badge is-reviewed">Revisado</span>');
  syncBadge(actions, '.ev-tracking-badge.has-pending', Boolean(tracking?.has_pending), '<span class="ev-tracking-badge has-pending">Pendência</span>');
}

function applyPortfolioTracking() {
  const table = document.querySelector('.portfolio-works-table');
  if (!table) return;
  let visible = 0;
  table.querySelectorAll('tbody .portfolio-work-row').forEach(row => {
    const tracking = trackingForPortfolioRow(row);
    decoratePortfolioRow(row, tracking);
    const reviewedMatches = !reviewFilter || (reviewFilter === 'yes' ? Boolean(tracking?.reviewed) : !tracking?.reviewed);
    const pendingMatches = !pendingFilter || (pendingFilter === 'yes' ? Boolean(tracking?.has_pending) : !tracking?.has_pending);
    const hidden = !(reviewedMatches && pendingMatches);
    if (row.hidden !== hidden) row.hidden = hidden;
    if (!hidden) visible += 1;
  });
  const summary = document.querySelector('[data-ev-tracking-filter-summary]');
  if (summary) summary.textContent = `${visible} ${visible === 1 ? 'EV visível' : 'EVs visíveis'} com os filtros de revisão`;
}

async function mountPortfolioFilters(bar) {
  if (!bar || bar.dataset.evTrackingFiltersMounted === 'true') return;
  bar.dataset.evTrackingFiltersMounted = 'true';
  try {
    await loadTracking();
  } catch (error) {
    console.warn('Não foi possível carregar os filtros de revisão dos EVs.', error);
    return;
  }
  if (!bar.isConnected) return;
  const clear = bar.querySelector('[data-action="clear-portfolio-filters"]');
  const wrapper = document.createElement('div');
  wrapper.className = 'ev-tracking-filter-group';
  wrapper.innerHTML = cleanHTML(`
    <label class="field"><span>Revisão</span><select data-ev-review-filter>
      <option value="">Todos</option><option value="yes">Revisados</option><option value="no">Não revisados</option>
    </select></label>
    <label class="field"><span>Pendência</span><select data-ev-pending-filter>
      <option value="">Todos</option><option value="yes">Com pendência</option><option value="no">Sem pendência</option>
    </select></label>
    <span class="ev-tracking-filter-summary" data-ev-tracking-filter-summary></span>`);
  if (clear) clear.before(wrapper);
  else bar.append(wrapper);
  const reviewSelect = wrapper.querySelector('[data-ev-review-filter]');
  const pendingSelect = wrapper.querySelector('[data-ev-pending-filter]');
  reviewSelect.value = reviewFilter;
  pendingSelect.value = pendingFilter;
  reviewSelect.addEventListener('change', event => { reviewFilter = event.currentTarget.value; applyPortfolioTracking(); });
  pendingSelect.addEventListener('change', event => { pendingFilter = event.currentTarget.value; applyPortfolioTracking(); });
  applyPortfolioTracking();
}

function installStyles() {
  if (document.querySelector('#evTrackingStyles')) return;
  const style = document.createElement('style');
  style.id = 'evTrackingStyles';
  style.textContent = `
    .ev-tracking-panel{margin:0 0 16px;padding:16px;border:1px solid var(--border,#dfe5ec);border-radius:14px;background:var(--surface,#fff)}
    .ev-tracking-heading{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:12px}.ev-tracking-heading h3{margin:3px 0 4px}.ev-tracking-heading p{margin:0;color:var(--muted,#667085);font-size:13px}
    .ev-tracking-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ev-tracking-card{border:1px solid var(--border,#dfe5ec);border-radius:12px;padding:12px;background:rgba(148,163,184,.05)}.ev-tracking-card.is-reviewed{border-color:#86c89a;background:rgba(22,163,74,.06)}.ev-tracking-card.has-pending{border-color:#efb45f;background:rgba(245,158,11,.08)}
    .ev-tracking-toggle{display:flex;gap:10px;align-items:flex-start;cursor:pointer}.ev-tracking-toggle input{margin-top:3px}.ev-tracking-toggle span{display:grid;gap:2px}.ev-tracking-toggle small,.ev-tracking-audit{color:var(--muted,#667085);font-size:12px}
    .ev-tracking-fields{display:grid;grid-template-columns:1fr 1.3fr;gap:10px;margin-top:12px}.ev-tracking-note{grid-column:1/-1}.ev-tracking-audit{grid-column:1/-1}
    .ev-tracking-actions{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:12px}.ev-tracking-actions [data-state="error"]{color:#b42318}.ev-tracking-actions [data-state="success"]{color:#16713b}
    .ev-tracking-filter-group{display:contents}.ev-tracking-filter-summary{align-self:end;padding:0 4px 10px;color:var(--muted,#667085);font-size:11px;white-space:nowrap}.ev-tracking-badge{display:inline-flex;align-items:center;padding:3px 7px;border-radius:999px;font-size:10px;font-weight:700;white-space:nowrap}.ev-tracking-badge.is-reviewed{background:#e9f8ee;color:#16713b}.ev-tracking-badge.has-pending{background:#fff1dd;color:#9a5b00}
    @media(max-width:900px){.ev-tracking-grid{grid-template-columns:1fr}.ev-tracking-fields{grid-template-columns:1fr}.ev-tracking-note,.ev-tracking-audit{grid-column:auto}.ev-tracking-heading,.ev-tracking-actions{flex-direction:column;align-items:stretch}.ev-tracking-filter-summary{display:none}}
  `;
  document.head.append(style);
}

function scan() {
  scanScheduled = false;
  installStyles();
  document.querySelectorAll('#evForm:not([data-ev-tracking-mounted="true"])').forEach(form => mountEVPanel(form));
  document.querySelectorAll('.portfolio-filter-bar:not([data-ev-tracking-filters-mounted="true"])').forEach(bar => mountPortfolioFilters(bar));
  if (trackingLoaded && document.querySelector('.portfolio-works-table')) applyPortfolioTracking();
}

function scheduleScan() {
  if (scanScheduled) return;
  scanScheduled = true;
  requestAnimationFrame(scan);
}

function install() {
  document.addEventListener('click', event => {
    const clicked = event.target.closest?.('[data-action]');
    if (!clicked) return;
    if (clicked.dataset.action === 'clear-portfolio-filters') {
      reviewFilter = '';
      pendingFilter = '';
    }
    if (['edit-historical-ev', 'open-ev-modal', 'open-work-ev'].includes(clicked.dataset.action)) {
      lastHistoricalRecordId = clicked.dataset.action === 'edit-historical-ev' ? String(clicked.dataset.id || '') : '';
    }
  }, true);
  new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
  scheduleScan();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();
