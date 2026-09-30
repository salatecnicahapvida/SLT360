let scheduled = false;
let lastOpenedEVRecordId = '';

function canDeleteEVRecords() {
  const role = String(globalThis.SLT_CLOUD?.profile?.perfil || '').trim();
  return role === 'Admin' || role === 'Gestor';
}

function installStyles() {
  if (document.querySelector('#evDeleteCollapseStyles')) return;
  const style = document.createElement('style');
  style.id = 'evDeleteCollapseStyles';
  style.textContent = `
    .ev-tracking-heading { align-items:center; }
    .ev-review-collapse-toggle { margin-left:auto; white-space:nowrap; }
    .ev-tracking-panel[data-review-collapsed="true"] { padding-bottom:12px; }
    .ev-editor-actions .ev-delete-action { margin-right:auto; }
    .ev-tracking-card.is-pending-card { display:none !important; }
    .ev-tracking-grid { grid-template-columns:1fr !important; }
  `;
  document.head.append(style);
}

function unifyPendingFields(panel) {
  if (!panel) return;
  const pendingCard = panel.querySelector('[data-pending-card]');
  if (pendingCard) {
    pendingCard.classList.add('is-pending-card');
    pendingCard.querySelector('[data-ev-pending]')?.setAttribute('data-ev-has-pending', '');
    pendingCard.querySelector('[data-pending-note]')?.setAttribute('data-ev-pending-note', '');
    pendingCard.querySelector('[data-pending-on]')?.setAttribute('data-ev-pending-on', '');
    pendingCard.querySelector('[data-pending-by]')?.setAttribute('data-ev-pending-by', '');
  }
  const saveButton = panel.querySelector('[data-tracking-save]');
  if (saveButton && saveButton.textContent !== 'Salvar revisão') saveButton.textContent = 'Salvar revisão';
}

function applyReviewCollapsedState(panel) {
  if (!panel) return;
  const collapsed = panel.dataset.reviewCollapsed !== 'false';
  panel.dataset.reviewCollapsed = collapsed ? 'true' : 'false';
  panel.querySelectorAll(':scope > .ev-tracking-grid, :scope > .multi-pending-section, :scope > .ev-tracking-actions, :scope > datalist')
    .forEach(node => { node.hidden = collapsed; });
  const button = panel.querySelector('[data-toggle-ev-review]');
  if (button) {
    const label = collapsed ? 'Expandir' : 'Recolher';
    if (button.textContent !== label) button.textContent = label;
    button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }
}

function enhanceReviewPanel(panel) {
  if (!panel) return;
  unifyPendingFields(panel);
  if (panel.dataset.reviewCollapseMounted !== 'true') {
    panel.dataset.reviewCollapseMounted = 'true';
    panel.dataset.reviewCollapsed = 'true';
    const heading = panel.querySelector('.ev-tracking-heading');
    if (heading) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondary-action ev-review-collapse-toggle';
      button.dataset.toggleEvReview = 'true';
      button.textContent = 'Expandir';
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', () => {
        panel.dataset.reviewCollapsed = panel.dataset.reviewCollapsed === 'true' ? 'false' : 'true';
        applyReviewCollapsedState(panel);
      });
      heading.append(button);
    }
  }
  applyReviewCollapsedState(panel);
}

function exactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function portfolioRecordIdForWork(workId) {
  if (!workId) return '';
  const row = document.querySelector(`.portfolio-work-row[data-id="${CSS.escape(workId)}"]`);
  const historicalButton = row?.querySelector('[data-action="edit-historical-ev"][data-id]');
  if (historicalButton?.dataset.id) return String(historicalButton.dataset.id);
  const currentButton = row?.querySelector('[data-action="open-ev-modal"][data-id]');
  if (currentButton?.dataset.id) return `current-${workId}`;
  return '';
}

function recordIdFromSyntheticHistoricalWork(workId) {
  const prefix = 'EVW-';
  return workId.startsWith(prefix) ? workId.slice(prefix.length) : '';
}

function deleteRecordIdForEVForm(form) {
  const workId = String(form?.dataset?.workId || '').trim();
  if (!workId) return '';

  const portfolioRecordId = portfolioRecordIdForWork(workId);
  if (portfolioRecordId) return portfolioRecordId;

  const syntheticHistoricalId = recordIdFromSyntheticHistoricalWork(workId);
  if (syntheticHistoricalId) return syntheticHistoricalId;

  if (lastOpenedEVRecordId) return lastOpenedEVRecordId;

  const historicalPrefix = 'historical-budget-';
  if (workId.startsWith(historicalPrefix)) return workId.slice(historicalPrefix.length);

  const directCurrentId = `current-${workId}`;
  if (document.querySelector(`[data-action="delete-ev-record"][data-id="${CSS.escape(directCurrentId)}"]`)) {
    return directCurrentId;
  }

  const openButton = [...document.querySelectorAll('[data-action="open-ev-modal"]')]
    .find(button => String(button.dataset.id || '') === workId);
  const rowDelete = openButton?.closest('tr')?.querySelector('[data-action="delete-ev-record"][data-id]');
  if (rowDelete?.dataset.id) return rowDelete.dataset.id;

  const modalTitle = exactText(form.closest('.ev-modal-card')?.querySelector('#evModalTitle')?.textContent);
  if (modalTitle) {
    const matchingRow = [...document.querySelectorAll('.ev-unified-table tbody tr')]
      .find(row => exactText(row.querySelector('.ev-history-project-link')?.textContent) === modalTitle);
    const matchingDelete = matchingRow?.querySelector('[data-action="delete-ev-record"][data-id]');
    if (matchingDelete?.dataset.id) return matchingDelete.dataset.id;
  }

  return directCurrentId;
}

function enhanceEVModal(form) {
  if (!form || form.dataset.evDeleteMounted === 'true' || !canDeleteEVRecords()) return;
  const footer = form.querySelector('.ev-editor-actions');
  if (!footer) return;
  const recordId = deleteRecordIdForEVForm(form);
  if (!recordId) return;

  form.dataset.evDeleteMounted = 'true';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ghost-button danger-action ev-delete-action';
  button.dataset.action = 'delete-ev-record';
  button.dataset.id = recordId;
  button.textContent = 'Excluir EV';
  footer.prepend(button);
}

function scan() {
  scheduled = false;
  installStyles();
  document.querySelectorAll('[data-ev-tracking-panel]').forEach(enhanceReviewPanel);
  document.querySelectorAll('#evForm').forEach(enhanceEVModal);
}

function scheduleScan() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(scan);
}

document.addEventListener('click', event => {
  const button = event.target.closest?.('[data-action]');
  if (!button) return;
  const action = String(button.dataset.action || '');
  if (action === 'edit-historical-ev') {
    lastOpenedEVRecordId = String(button.dataset.id || '');
  } else if (action === 'open-ev-modal') {
    const workId = String(button.dataset.id || '');
    lastOpenedEVRecordId = portfolioRecordIdForWork(workId) || recordIdFromSyntheticHistoricalWork(workId) || (workId ? `current-${workId}` : '');
  } else if (action === 'open-work-ev') {
    const workId = String(button.dataset.id || '');
    lastOpenedEVRecordId = portfolioRecordIdForWork(workId) || recordIdFromSyntheticHistoricalWork(workId) || '';
  } else if (action === 'close-modal' || action === 'confirm-delete-ev-record') {
    lastOpenedEVRecordId = '';
  }
}, true);

new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true });
scheduleScan();
