export function createSaveQueue({ revision, write, onStatus = () => {} }) {
  let pending, active = false, failure = null, saving = Promise.resolve();
  async function drain() {
    active = true;
    try {
      while (pending !== undefined) {
        const snapshot = pending;
        pending = undefined;
        onStatus('saving');
        revision = await write(revision, snapshot);
      }
      onStatus('saved');
    } catch (error) {
      failure = error;
      onStatus('failed', error);
    } finally { active = false; }
  }
  return {
    save(value) {
      if (failure) return;
      pending = structuredClone(value);
      if (!active) saving = drain();
    },
    async flush() { await saving; if (failure) throw failure; },
    get dirty() { return active || pending !== undefined || failure !== null; },
  };
}
