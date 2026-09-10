const TRANSIENT_CODES = new Set(['PGRST000', 'PGRST001', 'PGRST002', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED']);

export function isTransientCloudError(error) {
  const code = String(error?.code || '').toUpperCase();
  const status = Number(error?.status || error?.context?.status || 0);
  const message = String(error?.message || error || '');
  return TRANSIENT_CODES.has(code)
    || status === 408
    || status === 429
    || status >= 500
    || /failed to fetch|fetch failed|network|connection|load failed|timeout|temporar/i.test(message);
}

export async function retryTransientCloud(operation, { attempts = 2, wait = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !isTransientCloudError(error)) throw error;
      await wait(300 * attempt);
    }
  }
  throw lastError;
}

export function cloudSaveFailureMessage(error) {
  const code = String(error?.code || '').toUpperCase();
  const detail = String(error?.message || '').trim();
  if (code === '40001') return 'Os dados foram alterados em outra sessão. Recarregue para receber a versão mais recente antes de salvar novamente.';
  if (code === '42501') return `Sua sessão ou permissão de edição não foi confirmada pelo banco.${detail ? ` Detalhe informado: ${detail}` : ''} Recarregue e entre novamente se necessário.`;
  if (isTransientCloudError(error)) return 'A conexão com o banco falhou mesmo após uma nova tentativa. Recarregue e tente salvar novamente.';
  return String(error?.message || 'O banco recusou a alteração. Recarregue antes de tentar novamente.');
}
