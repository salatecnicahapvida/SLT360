import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { headers: { 'x-client-info': 'slt360-ev-delete-collapse-1' } },
  auth: { persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
});

let scheduled = false;

function canWriteWorks() {
  const cloud = globalThis.SLT_CLOUD;
  if (!cloud) return false;
  if (typeof cloud.canWritePermission === 'function') return Boolean(cloud.canWritePermission('works'));
  return Boolean(cloud.canWrite?.('works'));
}

function installStyles() {
  if (document.querySelector('#evDeleteCollapseStyles')) return;
  const style = document.createElement('style');
  style.id = 'evDeleteCollapseStyles';
  style.textContent = `
    .ev-tracking-heading { align-items:center; }
    .ev-review-collapse-toggle { margin-left:auto; white-space:nowrap; }
    .ev-tracking-panel[data-review-collapsed="true"] { padding-bottom:12px; }
    .ev-delete-action { margin-right:auto; }
  `;
  document.head.append(style);
}

function applyReviewCollapsedState(panel) {
  const collapsed = panel.dataset.reviewCollapsed !== 'false';
  panel.dataset.reviewCollapsed = collapsed ? 'true' : 'false';
  panel.querySelectorAll(':scope > .ev-tracking-grid, :scope > .multi-pending-section, :scope > .ev-tracking-actions, :scope > datalist')
    .forEach(node => { node.hidden = collapsed; });
  const button = panel.querySelector('[data-toggle-ev-review]');
  if (button) {
    button.textContent = collapsed ? 'Expandir' : 'Recolher';
    button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }
}

function enhanceReviewPanel(panel) {
  if (!panel || panel.dataset.reviewCollapseMounted === 'true') {
    applyReviewCollapsedState(panel);
    return;
  }
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
  applyReviewCollapsedState(panel);
}

function askReason(label) {
  const reason = String(globalThis.prompt(`Informe a justificativa para excluir ${label}:`) || '').trim();
  if (!reason) return '';
  if (reason.length < 5) {
    globalThis.alert('Informe uma justificativa com pelo menos 5 caracteres.');
    return '';
  }
  return reason;
}

async function runDelete(functionName, workId, reason, button) {
  if (button) button.disabled = true;
  try {
    const { error } = await client.rpc(functionName, { work_key: workId, justification: reason });
    if (error) throw error;
    globalThis.dispatchEvent?.(new CustomEvent('slt360:bank-saved', { detail: { message: 'Exclusão salva no banco.' } }));
    location.reload();
  } catch (error) {
    const message = String(error?.message || error || 'Não foi possível concluir a exclusão.');
    globalThis.alert(message);
    if (button) button.disabled = false;
  }
}

function enhanceEVModal(form) {
  if (!form || form.dataset.evDeleteMounted === 'true' || !canWriteWorks()) return;
  const workId = String(form.dataset.workId || '').trim();
  if (!workId || workId.startsWith('historical-')) return;
  const footer = form.querySelector('.modal-actions') || form.closest('.ev-modal-card')?.querySelector('.modal-actions');
  if (!footer) return;
  form.dataset.evDeleteMounted = 'true';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'danger-action ev-delete-action';
  button.textContent = 'Excluir EV';
  button.addEventListener('click', async () => {
    if (!globalThis.confirm('Excluir este EV? As linhas e versões do EV também serão removidas. A obra permanecerá cadastrada.')) return;
    const reason = askReason('o EV');
    if (!reason) return;
    await runDelete('slt_budget_delete_ev', workId, reason, button);
  });
  footer.prepend(button);
}

function enhanceWorkModal(form) {
  if (!form || form.dataset.workDeleteMounted === 'true' || !canWriteWorks()) return;
  const field = form.querySelector('[name="workId"]');
  const workId = String(field?.value || '').trim();
  if (!workId) return;
  const footer = form.querySelector('.modal-actions');
  if (!footer) return;
  form.dataset.workDeleteMounted = 'true';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'danger-action ev-delete-action';
  button.textContent = 'Excluir obra';
  button.addEventListener('click', async () => {
    if (!globalThis.confirm('Excluir esta obra? O sistema só permitirá a exclusão se o EV já tiver sido excluído e não houver outros registros ativos vinculados.')) return;
    const reason = askReason('a obra');
    if (!reason) return;
    await runDelete('slt_budget_delete_work', workId, reason, button);
  });
  footer.prepend(button);
}

function scan() {
  scheduled = false;
  installStyles();
  document.querySelectorAll('[data-ev-tracking-panel]').forEach(enhanceReviewPanel);
  document.querySelectorAll('#evForm').forEach(enhanceEVModal);
  document.querySelectorAll('#workForm').forEach(enhanceWorkModal);
}

function scheduleScan() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(scan);
}

new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true });
scheduleScan();
