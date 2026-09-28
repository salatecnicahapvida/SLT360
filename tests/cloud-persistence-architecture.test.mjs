import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');

test('dados operacionais não usam armazenamento local como persistência', () => {
  const operationalSources = [
    'src/app.js',
    'src/module-store.js',
    'src/lazy-module-store.js',
    'src/sic-dashboard.js',
    'src/sic-approvals.js',
    'src/users-admin.js',
  ];
  const forbidden = /\blocalStorage\s*\.\s*(?:getItem|setItem|removeItem)\s*\(|\bindexedDB\s*\./;
  for (const path of operationalSources) {
    assert.doesNotMatch(read(path), forbidden, `${path} não pode persistir dados de negócio somente no navegador`);
  }
});

test('sessionStorage do aplicativo fica restrito a preferências de navegação', () => {
  const source = read('src/app.js');
  const storageLines = source.split('\n').filter(line => /sessionStorage\s*\./.test(line));
  for (const line of storageLines) {
    assert.match(line, /LAST_VIEW_STORAGE_KEY|LAST_UI_MODULE_STORAGE_KEY|slt360-last-view-v1|slt360-last-ui-module-v1/);
  }
});

test('build oficial inicia pelo coordenador de persistência', () => {
  const build = read('scripts/build.mjs');
  assert.match(build, /entryPoints:\['src\/boot-entry\.js'\]/);
  const entry = read('src/boot-entry.js');
  assert.match(entry, /createPersistenceCoordinator/);
  assert.match(entry, /beforeunload|persistenceCoordinator/);
  assert.match(entry, /Salvando…/);
  assert.match(entry, /Salvo/);
});

test('Portfólio tem carga tolerante ao volume e conflito multiusuário explícito', () => {
  const sql = read('supabase/migrations/20260928144949_harden_cloud_persistence_and_portfolio_loading.sql');
  assert.match(sql, /slt_module_load\(text\) set statement_timeout = '30s'/);
  assert.match(sql, /'budget_estimates'/);
  assert.match(sql, /statement_timeout='15s'/);
  assert.match(sql, /PT409/);
});

test('aplicadores históricos de patch não fazem parte da fonte atual', () => {
  const obsolete = [
    '.github/workflows/apply-fast-module-preview.yml',
    '.github/workflows/apply-kanban-column-sort.yml',
    '.github/workflows/apply-validation-flow-intelligence.yml',
    'scripts/patch-fast-module-preview.mjs',
    'scripts/patch-kanban-column-sort.mjs',
    'scripts/patch-kanban-column-sort-accessibility.mjs',
    'scripts/patch-validation-flow-intelligence.mjs',
  ];
  for (const path of obsolete) assert.equal(fs.existsSync(path), false, `${path} não deve voltar à fonte ativa`);
});
