const KEYS = new Set([
  'sic-approval:obras',
  'sic-approval:weeks',
  'sic-approval:snapshots',
  'sic-approval:notification-reads',
]);
const CHANNEL = 'slt360-sic-approvals-v1';

export function mountSicApprovals(target, cloud) {
  if (!target || !cloud?.canRead('works')) return () => {};
  let active = true;
  const frame = document.createElement('iframe');
  frame.title = 'Aprovação de SIC’s';
  frame.className = 'sic-approvals-frame';
  frame.style.cssText = 'display:block;width:100%;height:calc(100vh - 215px);min-height:720px;border:0;border-radius:12px;background:#f4f6fa';
  frame.setAttribute('sandbox', 'allow-scripts allow-downloads allow-modals');
  const prefix = `slt360:sic-approvals:${cloud.profile.id}:`;
  const reply = (id, value, error) => {
    if (active && frame.contentWindow) frame.contentWindow.postMessage({ channel: CHANNEL, id, value, error }, '*');
  };
  const initial = cloud.sicApprovalInitialState().then(data => {
    if (!active) return;
    if (!Array.isArray(data?.obras) || !Array.isArray(data?.weeks) || !Array.isArray(data?.snapshots)) {
      throw new Error('A base inicial de Aprovação de SIC’s está incompleta.');
    }
    // Keep the workbook's exact state as the first local copy. An existing local
    // copy may contain newer decisions and must never be replaced on navigation.
    const values = {
      'sic-approval:obras': data.obras,
      'sic-approval:weeks': data.weeks,
      'sic-approval:snapshots': data.snapshots,
      'sic-approval:notification-reads': data.notificationReads || {},
    };
    if (localStorage.getItem(prefix + 'initialized') !== '1') {
      for (const [key, value] of Object.entries(values)) localStorage.setItem(prefix + key, JSON.stringify(value));
      localStorage.setItem(prefix + 'initialized', '1');
    }
  });
  async function onMessage(event) {
    if (!active || event.source !== frame.contentWindow || event.data?.channel !== CHANNEL) return;
    const { id, action, key, value } = event.data;
    try {
      await initial;
      if (!active) return;
      if (action === 'ready') return reply(id, true);
      if (!KEYS.has(key)) throw new Error('Chave de armazenamento inválida.');
      if (action === 'get') return reply(id, localStorage.getItem(prefix + key));
      if (!cloud.canWrite('works')) throw new Error('Seu perfil não permite editar Obras.');
      if (action === 'set') {
        if (typeof value !== 'string' || value.length > 3000000) throw new Error('Dados de SIC inválidos ou grandes demais.');
        localStorage.setItem(prefix + key, value);
        return reply(id, true);
      }
      if (action === 'delete') {
        localStorage.removeItem(prefix + key);
        return reply(id, true);
      }
      throw new Error('Operação não permitida.');
    } catch (error) {
      reply(id, null, error.message || 'Não foi possível acessar os dados de SIC.');
    }
  }
  window.addEventListener('message', onMessage);
  frame.src = 'sic-approvals.html';
  target.append(frame);
  return () => {
    active = false;
    window.removeEventListener('message', onMessage);
    frame.remove();
  };
}
