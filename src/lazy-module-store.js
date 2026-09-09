import { hydrateRecords, recordKey } from './module-model.js';
import { createModuleStore } from './module-store.js';

export function createLazyModuleStore({ load, commit, canWriteEntity, onStatus = () => {} }) {
  const records = new Map();
  const queues = new Map();
  const loaded = new Set();
  const pending = new Map();
  let receivePayload = null;
  let loadChain = Promise.resolve();

  const writableInModule = (entity, module) =>
    canWriteEntity(entity) && (entity.module === module || (module === 'budget' && entity.name === 'projects_works'));

  const updateCommittedRecords = (changes, result) => {
    const revisions = new Map(result.map(row => [recordKey(row), Number(row.revision)]));
    for (const change of changes) {
      const key = recordKey(change);
      if (change.operation === 'delete') records.delete(key);
      else records.set(key, { ...change, revision: revisions.get(key) });
    }
  };

  async function flush() {
    await Promise.all([...queues.values()].map(queue => queue.flush()));
  }

  async function loadOne(module) {
    if (!receivePayload) throw new Error('O aplicativo ainda não está pronto para receber dados do banco.');
    await flush();
    const response = await load(module);
    if (!response || response.schema_version !== 2 || !Array.isArray(response.records)) {
      throw new Error('A resposta do banco para este módulo é inválida.');
    }

    const previousRecords = new Map(records);
    response.records.forEach(row => records.set(recordKey(row), row));
    try {
      const queue = createModuleStore({
        records: response.records,
        canWrite: entity => writableInModule(entity, module),
        commit,
        onStatus,
        onCommitted: updateCommittedRecords,
      });
      const snapshot = await receivePayload(hydrateRecords([...records.values()]), module);
      queue.acceptInitialState(snapshot);
      queues.set(module, queue);
      loaded.add(module);
      return snapshot;
    } catch (error) {
      records.clear();
      previousRecords.forEach((row, key) => records.set(key, row));
      throw error;
    }
  }

  function ensure(module) {
    if (loaded.has(module)) return Promise.resolve();
    if (pending.has(module)) return pending.get(module);
    const task = loadChain.then(() => loadOne(module));
    loadChain = task.catch(() => {});
    pending.set(module, task);
    task.then(
      () => pending.delete(module),
      () => pending.delete(module),
    );
    return task;
  }

  function queueFor(module) {
    if (!loaded.has(module) || !queues.has(module)) {
      throw new Error('Aguarde o carregamento completo do banco antes de inserir ou alterar dados.');
    }
    return queues.get(module);
  }

  return {
    registerReceiver(receiver) { receivePayload = receiver; },
    ensure,
    hasLoaded: module => loaded.has(module),
    save(module, snapshot) { queueFor(module).save(snapshot); },
    async saveAndWait(module, snapshot) {
      const queue = queueFor(module);
      queue.save(snapshot);
      await queue.flush();
    },
    flush,
    get dirty() { return [...queues.values()].some(queue => queue.dirty); },
  };
}

export function dataModuleForUI(uiModule) {
  return ({ works: 'budget', maintenance: 'maintenance', clinical: 'clinical', budget: 'finance', settings: 'core', projects: 'projects' })[uiModule] || '';
}
