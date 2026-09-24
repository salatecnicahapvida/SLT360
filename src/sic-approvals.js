import { decoratePayloadWithPortfolioAlerts, stripLivePortfolioAlerts } from './sic-director-queue.js';

const KEYS = new Set([
  'sic-approval:obras',
  'sic-approval:weeks',
  'sic-approval:snapshots',
  'sic-approval:notification-reads',
]);
const FIELDS = {
  'sic-approval:obras': 'obras',
  'sic-approval:weeks': 'weeks',
  'sic-approval:snapshots': 'snapshots',
  'sic-approval:notification-reads': 'notificationReads',
};
const CHANNEL = 'slt360-sic-approvals-v1';

export function mountSicApprovals(target, cloud, portfolioWorks = []) {
  if (!target || !cloud?.canRead('works')) return () => {};
  let active = true;
  const frame = document.createElement('iframe');
  frame.title = 'Aprovação de SIC’s';
  frame.className = 'sic-approvals-frame';
  frame.style.cssText = 'display:block;width:100%;height:calc(100vh - 215px);min-height:720px;border:0;border-radius:12px;background:#f4f6fa';
  frame.setAttribute('sandbox', 'allow-scripts allow-downloads allow-modals');
  let snapshot;
  let displayPayload;
  let fetching;
  let writing = Promise.resolve();
  let checking = false;
  function load() {
    if (!fetching) fetching = cloud.sicApprovalSnapshot().then(row => {
      if (!Array.isArray(row?.payload?.obras) || !Array.isArray(row?.payload?.weeks) || !Array.isArray(row?.payload?.snapshots)) {
        throw new Error('A base compartilhada de Aprovação de SIC’s está incompleta.');
      }
      snapshot = { ...row, payload: stripLivePortfolioAlerts(row.payload) };
      displayPayload = decoratePayloadWithPortfolioAlerts(snapshot.payload, portfolioWorks);
      return row;
    }).finally(() => { fetching = null; });
    return fetching;
  }
  const initial = load();
  const reply = (id, value, error) => {
    if (active && frame.contentWindow) frame.contentWindow.postMessage({ channel: CHANNEL, id, value, error }, '*');
  };
  async function write(changes) {
    if (!cloud.canWrite('works')) throw new Error('Seu perfil não permite editar Obras.');
    const payload = stripLivePortfolioAlerts({ ...displayPayload, ...changes });
    const saved = await cloud.saveSicApprovalSnapshot(payload, snapshot.revision);
    if (!saved) throw new Error('CONFLITO_SIC: Outro usuário alterou estes dados. Recarregue para ver a versão atual antes de editar novamente.');
    snapshot = { payload, revision: saved.revision };
    displayPayload = decoratePayloadWithPortfolioAlerts(payload, portfolioWorks);
    return true;
  }
  async function onMessage(event) {
    if (!active || event.source !== frame.contentWindow || event.data?.channel !== CHANNEL) return;
    const { id, action, key, value } = event.data;
    try {
      await initial;
      if (!active) return;
      if (action === 'ready') return reply(id, true);
      if ((action === 'get' || action === 'set') && !KEYS.has(key)) throw new Error('Chave de armazenamento inválida.');
      if (action === 'get') return reply(id, JSON.stringify(displayPayload[FIELDS[key]] ?? (key.endsWith('notification-reads') ? {} : [])));
      if (action === 'set') {
        if (typeof value !== 'string' || value.length > 3000000) throw new Error('Dados de SIC inválidos ou grandes demais.');
        const data = JSON.parse(value);
        return reply(id, await (writing = writing.then(() => write({ [FIELDS[key]]: data }))));
      }
      if (action === 'saveAll' || action === 'restore') {
        const fields = action === 'restore' ? ['obras', 'weeks', 'snapshots', 'notificationReads'] : ['obras', 'weeks', 'snapshots'];
        if (!value || fields.some(field => !Object.hasOwn(value, field)) || JSON.stringify(value).length > 3000000) throw new Error('Dados de SIC inválidos ou incompletos.');
        return reply(id, await (writing = writing.then(() => write(Object.fromEntries(fields.map(field => [field, value[field]]))))));
      }
      throw new Error('Operação não permitida.');
    } catch (error) {
      writing = writing.catch(() => {});
      reply(id, null, error.message || 'Não foi possível acessar os dados de SIC.');
    }
  }
  async function checkForChanges() {
    if (!active || !snapshot || checking || document.hidden) return;
    checking = true;
    try {
      const revision = await cloud.sicApprovalRevision();
      if (active && snapshot && revision !== snapshot.revision) frame.contentWindow?.postMessage({ channel: CHANNEL, action: 'changed' }, '*');
    } catch (error) {
      console.warn('Não foi possível conferir atualizações de SICs.', error);
    } finally { checking = false; }
  }
  const timer = setInterval(checkForChanges, 10000);
  const onFocus = () => { void checkForChanges(); };
  window.addEventListener('focus', onFocus);
  window.addEventListener('message', onMessage);
  frame.src = 'sic-approvals.html';
  target.append(frame);
  return () => {
    active = false;
    clearInterval(timer);
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('message', onMessage);
    frame.remove();
  };
}
