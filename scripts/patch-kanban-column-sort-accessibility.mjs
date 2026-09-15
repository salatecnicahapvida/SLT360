import fs from 'node:fs';

const appPath = 'src/app.js';
const testPath = 'tests/browser/app.spec.js';
let app = fs.readFileSync(appPath, 'utf8');
let tests = fs.readFileSync(testPath, 'utf8');

app = app.replace(
  'aria-label="Reordenar etapa ${column.label}" title="${escapeAttribute(sortTitle)}"',
  'aria-label="Reordenar cards" title="${escapeAttribute(sortTitle)}"',
);

tests = tests.replace(
  "await page.getByRole('button',{name:'Reordenar etapa Fazer'}).click();",
  "await page.locator('[data-action=\"reorder-kanban-column\"][data-column=\"fazer\"]').click();",
);
tests = tests.replace(
  "await page.getByRole('button',{name:'Reordenar etapa Concluído'}).click();",
  "await page.locator('[data-action=\"reorder-kanban-column\"][data-column=\"concluido\"]').click();",
);

fs.writeFileSync(appPath, app);
fs.writeFileSync(testPath, tests);
