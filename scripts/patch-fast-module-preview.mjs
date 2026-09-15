import fs from 'node:fs';

const bootPath='src/boot.js';
let boot=fs.readFileSync(bootPath,'utf8');
const bootAnchor=`    isModuleLoaded(uiModule) {
      if (uiModule === 'home') return true;
      const module = dataModule(uiModule);
      return Boolean(module && lazyStore.hasLoaded(module));
    },
    async ensureModule(uiModule) {`;
const bootReplacement=`    isModuleLoaded(uiModule) {
      if (uiModule === 'home') return true;
      const module = dataModule(uiModule);
      return Boolean(module && lazyStore.hasLoaded(module));
    },
    async previewModule(uiModule) {
      if (uiModule === 'home') return;
      const module = dataModule(uiModule);
      if (!module || !moduleAllowed(currentProfile, module)) throw new Error('Seu perfil não possui acesso a este módulo.');
      if (lazyStore.hasLoaded(module)) return;
      const [response] = await Promise.all([
        startupRest(session, 'rpc/slt_module_preview', { method: 'POST', body: { module_key: module } }),
        ensureAnalystDirectory(),
      ]);
      if (response.error) throw new Error(response.error.message || \`Não foi possível abrir rapidamente o módulo \${module}.\`);
      if (!lazyStore.hasLoaded(module)) await lazyStore.preview(module, response.data);
    },
    async ensureModule(uiModule) {`;
if(!boot.includes('async previewModule(uiModule)')){
  if(!boot.includes(bootAnchor)) throw new Error('Âncora de preview no boot não encontrada.');
  boot=boot.replace(bootAnchor,bootReplacement);
  fs.writeFileSync(bootPath,boot);
}

const appPath='src/app.js';
let app=fs.readFileSync(appPath,'utf8');
const ensureAnchor=`    try {
      await globalThis.SLT_CLOUD.ensureModule(dataModule);`;
const ensureReplacement=`    try {
      const normalizedView = viewAliases[view] || view;
      if (normalizedView === "worksOperational" && typeof globalThis.SLT_CLOUD.previewModule === "function") {
        try {
          await globalThis.SLT_CLOUD.previewModule(dataModule);
          if (request !== viewNavigationRequest) return;
          currentView = view;
          render();
        } catch (previewError) {
          console.warn("A prévia rápida de Obras não foi carregada; seguindo com o carregamento completo.", previewError);
        }
      }
      await globalThis.SLT_CLOUD.ensureModule(dataModule);`;
if(!app.includes('A prévia rápida de Obras não foi carregada')){
  if(!app.includes(ensureAnchor)) throw new Error('Âncora de carregamento de módulo no app não encontrada.');
  app=app.replace(ensureAnchor,ensureReplacement);
  fs.writeFileSync(appPath,app);
}

const lazyTestPath='tests/lazy-module-store.test.mjs';
let lazyTests=fs.readFileSync(lazyTestPath,'utf8');
const lazyAnchor=`  assert.throws(()=>store.save('budget',{}),/carregamento completo do banco/);
  await store.ensure('budget');`;
const lazyReplacement=`  assert.throws(()=>store.save('budget',{}),/carregamento completo do banco/);
  const budgetPreview={schema_version:2,records:all.filter(row=>['budget_demands','projects_works','core_units','core_sprints'].includes(row.entity))};
  await store.preview('budget',budgetPreview);
  assert.equal(store.hasLoaded('budget'),false);
  assert.equal(currentState.demands[0].titulo,'Demanda');
  assert.throws(()=>store.save('budget',currentState),/carregamento completo do banco/);
  await store.ensure('budget');`;
if(!lazyTests.includes('const budgetPreview=')){
  if(!lazyTests.includes(lazyAnchor)) throw new Error('Âncora do teste do lazy store não encontrada.');
  lazyTests=lazyTests.replace(lazyAnchor,lazyReplacement);
  fs.writeFileSync(lazyTestPath,lazyTests);
}

const browserPath='tests/browser/app.spec.js';
let browser=fs.readFileSync(browserPath,'utf8');
if(!browser.includes("p.endsWith('/slt_module_preview')")){
  const backendAnchor=`  else if(p.endsWith('/slt_module_load')){`;
  const backendReplacement=`  else if(p.endsWith('/slt_module_load')||p.endsWith('/slt_module_preview')){`;
  if(!browser.includes(backendAnchor)) throw new Error('Mock do carregamento modular não encontrado.');
  browser=browser.replace(backendAnchor,backendReplacement);
  fs.writeFileSync(browserPath,browser);
}
