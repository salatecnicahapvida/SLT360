export function createPersistenceCoordinator({ render = () => {}, target = globalThis } = {}) {
  let activeWrites = 0;
  let failed = false;

  const state = () => failed ? 'failed' : activeWrites > 0 ? 'saving' : 'saved';
  const emit = () => render(state(), { activeWrites, failed });

  const beforeUnload = event => {
    if (activeWrites <= 0) return;
    event.preventDefault?.();
    event.returnValue = '';
  };

  target?.addEventListener?.('beforeunload', beforeUnload);

  function track(operation, { success = () => true } = {}) {
    return async (...args) => {
      if (activeWrites === 0) failed = false;
      activeWrites += 1;
      emit();
      try {
        const result = await operation(...args);
        if (!success(result)) failed = true;
        return result;
      } catch (error) {
        failed = true;
        throw error;
      } finally {
        activeWrites = Math.max(0, activeWrites - 1);
        emit();
      }
    };
  }

  return {
    track,
    render: emit,
    resetFailure() { if (activeWrites === 0) { failed = false; emit(); } },
    dispose() { target?.removeEventListener?.('beforeunload', beforeUnload); },
    get activeWrites() { return activeWrites; },
    get state() { return state(); },
  };
}
