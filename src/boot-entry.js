import './boot.js';
import './ev-tracking-ui.js';
import './ev-pending-items-ui.js';
import { createPersistenceCoordinator } from './persistence-coordinator.js';

const trackedWriteMethods = [
  'saveAndWait',
  'createAnalyst',
  'updateAnalyst',
  'updateUser',
  'createUser',
  'resetUserPassword',
  'saveAttachment',
];

function statusNode() {
  return document.querySelector('#cloudStatus');
}

function ensurePersistenceStatusVisuals() {
  if (document.querySelector('#persistenceStatusVisuals')) return;
  const style = document.createElement('style');
  style.id = 'persistenceStatusVisuals';
  style.textContent = `
    #cloudStatus[data-persistence-coordinator="true"] { font-size: 0 !important; }
    #cloudStatus[data-persistence-coordinator="true"]::after {
      content: attr(data-display-label);
      font-size: 12px;
    }
  `;
  document.head.append(style);
}

function renderPersistenceStatus(state) {
  const node = statusNode();
  if (!node) return;
  ensurePersistenceStatusVisuals();
  const internalLabel = state === 'saving' ? 'Sincronizando…' : state === 'failed' ? 'Falha na sincronização' : 'Sincronizado';
  const displayLabel = state === 'saving' ? 'Salvando…' : state === 'failed' ? 'Erro ao salvar' : 'Salvo';
  if (node.textContent !== internalLabel) node.textContent = internalLabel;
  if (node.dataset.state !== state) node.dataset.state = state;
  node.dataset.persistenceCoordinator = 'true';
  node.dataset.displayLabel = displayLabel;
  node.setAttribute('aria-label', displayLabel);
  if (state === 'saving') node.setAttribute('aria-busy', 'true');
  else node.removeAttribute('aria-busy');
}

function showPortfolioReadWarning() {
  if (document.querySelector('#cloudReadWarning')) return;
  const warning = document.createElement('div');
  warning.id = 'cloudReadWarning';
  warning.setAttribute('role', 'status');
  warning.textContent = 'Portfólio aberto em consulta parcial. A carga completa da nuvem não terminou; a edição permanece bloqueada até atualizar a página.';
  warning.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:9999;max-width:min(760px,calc(100vw - 24px));padding:10px 14px;border:1px solid #e2bd69;border-radius:10px;background:#fff8e7;color:#674d12;box-shadow:0 6px 22px rgba(0,0,0,.12);font:600 13px/1.35 system-ui,sans-serif;text-align:center';
  document.body.append(warning);
}

function clearPortfolioReadWarning() {
  document.querySelector('#cloudReadWarning')?.remove();
}

function isModuleTimeout(error) {
  const message = String(error?.message || error || '');
  return /statement timeout|57014|timeout/i.test(message);
}

function rememberedWorksModule() {
  try {
    return sessionStorage.getItem('slt360-last-ui-module-v1') === 'works';
  } catch {
    return false;
  }
}

function installCloudPersistenceCoordinator() {
  const cloud = globalThis.SLT_CLOUD;
  if (!cloud || cloud.__persistenceCoordinatorInstalled) return false;

  const coordinator = createPersistenceCoordinator({ render: renderPersistenceStatus, target: globalThis });
  const node = statusNode();
  const observer = node && typeof MutationObserver !== 'undefined'
    ? new MutationObserver(() => renderPersistenceStatus(coordinator.state))
    : null;
  observer?.observe(node, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['data-state'] });

  for (const name of trackedWriteMethods) {
    if (typeof cloud[name] !== 'function') continue;
    const original = cloud[name].bind(cloud);
    cloud[name] = coordinator.track(original);
  }

  if (typeof cloud.saveSicApprovalSnapshot === 'function') {
    const original = cloud.saveSicApprovalSnapshot.bind(cloud);
    cloud.saveSicApprovalSnapshot = coordinator.track(original, { success: result => Boolean(result) });
  }

  const previewed = new Set();
  if (typeof cloud.previewModule === 'function') {
    const originalPreview = cloud.previewModule.bind(cloud);
    cloud.previewModule = async uiModule => {
      const result = await originalPreview(uiModule);
      previewed.add(uiModule);
      return result;
    };
  }

  let firstWorksEnsure = true;
  const restoreWorksWithoutPreview = rememberedWorksModule();
  if (typeof cloud.ensureModule === 'function') {
    const originalEnsure = cloud.ensureModule.bind(cloud);
    cloud.ensureModule = async uiModule => {
      if (uiModule !== 'works') return originalEnsure(uiModule);

      const restoringLoadedView = firstWorksEnsure && restoreWorksWithoutPreview;
      firstWorksEnsure = false;
      if (restoringLoadedView) {
        const result = await originalEnsure(uiModule);
        clearPortfolioReadWarning();
        return result;
      }

      let hasPreview = previewed.has('works');
      if (!hasPreview && typeof cloud.previewModule === 'function') {
        try {
          await cloud.previewModule('works');
          hasPreview = true;
        } catch (error) {
          console.warn('A prévia do Portfólio não pôde ser carregada.', error);
        }
      }
      try {
        const result = await originalEnsure(uiModule);
        clearPortfolioReadWarning();
        return result;
      } catch (error) {
        if (hasPreview && isModuleTimeout(error)) {
          showPortfolioReadWarning();
          return undefined;
        }
        throw error;
      }
    };
  }

  cloud.__persistenceCoordinatorInstalled = true;
  cloud.__persistenceCoordinator = coordinator;
  coordinator.render();
  return true;
}

function installWhenReady() {
  if (installCloudPersistenceCoordinator()) return;
  setTimeout(installWhenReady, 100);
}

installWhenReady();
