import fs from 'node:fs';

const appPath = 'src/app.js';
const stylesPath = 'src/styles.css';
const testPath = 'tests/browser/app.spec.js';

let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');
let tests = fs.readFileSync(testPath, 'utf8');

const comparatorAnchor = `function compareOperationalDemandsByDelivery(first, second) {
  const firstDate = dateOnly(first?.dataPrevistaEntrega) || "9999-12-31";
  const secondDate = dateOnly(second?.dataPrevistaEntrega) || "9999-12-31";
  const dateComparison = firstDate.localeCompare(secondDate);
  if (dateComparison) return dateComparison;
  return String(first?.id || "").localeCompare(String(second?.id || ""), "pt-BR", { numeric: true });
}
`;

const comparatorReplacement = `${comparatorAnchor}
function operationalDemandCreationTimestamp(demand) {
  const raw = demand?.createdAt || demand?.dataCriacao || demand?.dataPrevistaInicio || "";
  const instant = raw ? new Date(raw).getTime() : Number.NaN;
  return Number.isFinite(instant) ? instant : Number.MAX_SAFE_INTEGER;
}

function compareKanbanColumnDemands(first, second, columnId) {
  if (columnId === "concluido") {
    const firstCompleted = dateOnly(first?.dataEntregaReal) || "";
    const secondCompleted = dateOnly(second?.dataEntregaReal) || "";
    if (firstCompleted || secondCompleted) {
      if (!firstCompleted) return 1;
      if (!secondCompleted) return -1;
      const completedComparison = secondCompleted.localeCompare(firstCompleted);
      if (completedComparison) return completedComparison;
    }
  } else {
    const firstMarker = dateOnly(demandCardDateInfo(first)?.date) || "9999-12-31";
    const secondMarker = dateOnly(demandCardDateInfo(second)?.date) || "9999-12-31";
    const markerComparison = firstMarker.localeCompare(secondMarker);
    if (markerComparison) return markerComparison;
  }

  const creationComparison = operationalDemandCreationTimestamp(first) - operationalDemandCreationTimestamp(second);
  if (creationComparison) return creationComparison;
  return String(first?.id || "").localeCompare(String(second?.id || ""), "pt-BR", { numeric: true });
}

function sortKanbanColumnDemands(demands, columnId) {
  return [...demands].sort((first, second) => compareKanbanColumnDemands(first, second, columnId));
}
`;

if (!app.includes('function compareKanbanColumnDemands(first, second, columnId)')) {
  if (!app.includes(comparatorAnchor)) throw new Error('Comparador operacional não localizado.');
  app = app.replace(comparatorAnchor, comparatorReplacement);
}

const kanbanOld = `        .map((column) => {
          const demands = filtered.filter((demand) => demand.coluna === column.id);
          return \`
            <section class="kanban-column" data-column="\${column.id}">
              <header>
                <h2>\${column.label}</h2>
                <span class="kanban-count" aria-label="\${demands.length} demandas">\${demands.length}</span>
              </header>
              <div class="demand-list">
                \${demands.length ? demands.map(renderDemandCard).join("") : \`<div class="empty-state kanban-empty">Nenhuma demanda</div>\`}
              </div>
            </section>
          \`;
        })`;

const kanbanNew = `        .map((column) => {
          const demands = sortKanbanColumnDemands(filtered.filter((demand) => demand.coluna === column.id), column.id);
          const sortTitle = column.id === "concluido"
            ? "Reordenar por conclusão real, da mais recente para a mais antiga"
            : "Reordenar pelo marco exibido no card; em empate, priorizar o card criado primeiro";
          return \`
            <section class="kanban-column" data-column="\${column.id}">
              <header>
                <h2>\${column.label}</h2>
                <div class="kanban-column-header-meta">
                  <span class="kanban-count" aria-label="\${demands.length} demandas">\${demands.length}</span>
                  <button class="kanban-sort-button" type="button" data-action="reorder-kanban-column" data-column="\${column.id}" aria-label="Reordenar etapa \${column.label}" title="\${escapeAttribute(sortTitle)}">⇅</button>
                </div>
              </header>
              <div class="demand-list">
                \${demands.length ? demands.map(renderDemandCard).join("") : \`<div class="empty-state kanban-empty">Nenhuma demanda</div>\`}
              </div>
            </section>
          \`;
        })`;

if (!app.includes('data-action="reorder-kanban-column"')) {
  if (!app.includes(kanbanOld)) throw new Error('Markup das colunas do Kanban não localizado.');
  app = app.replace(kanbanOld, kanbanNew);
}

const actionAnchor = `  if (action === "set-operational-view") {
    operationalViewMode = actionButton.dataset.mode || "kanban";
    render();
  }`;
const actionReplacement = `  if (action === "reorder-kanban-column") {
    const column = columns.find((item) => item.id === actionButton.dataset.column);
    if (!column) return;
    render();
    showToast(column.id === "concluido"
      ? \`\${column.label}: ordenado pela conclusão real, do mais recente para o mais antigo.\`
      : \`\${column.label}: ordenado pelo marco exibido no card e, em empate, pela criação.\`);
  }
  if (action === "set-operational-view") {
    operationalViewMode = actionButton.dataset.mode || "kanban";
    render();
  }`;
if (!app.includes('action === "reorder-kanban-column"')) {
  if (!app.includes(actionAnchor)) throw new Error('Ação de troca de visualização operacional não localizada.');
  app = app.replace(actionAnchor, actionReplacement);
}

const styleBlock = `

.kanban-column-header-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.kanban-sort-button {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #d9e2ee;
  border-radius: 8px;
  background: #ffffff;
  color: #53657a;
  display: inline-grid;
  place-items: center;
  font: inherit;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(18, 38, 63, 0.05);
}

.kanban-sort-button:hover {
  background: #f3f7fc;
  border-color: #b8c8da;
  color: #174f9e;
}

.kanban-sort-button:focus-visible {
  outline: 2px solid #2f72c4;
  outline-offset: 2px;
}
`;
if (!styles.includes('.kanban-sort-button {')) styles += styleBlock;

const testPattern = /test\('operational demands are always ordered by nearest delivery date',[\s\S]*?\n\}\);\n\ntest\('operational demand cards and list standardize work names'/;
const testReplacement = `test('kanban reorders by displayed milestone, creation date and real completion',async({page})=>{
 const base={...structuredClone(payload.state.demands[1]),obraId:'test-work',coluna:'fazer',dataEnvioRealValidacaoObras:'',dataValidacaoObras:''};
 const demands=[
  {...base,id:'sort-no-date',dataPrevEnvioValidacaoObras:'',dataPrevistaEntrega:'',createdAt:'2026-09-01T09:00:00Z'},
  {...base,id:'sort-validation-far',dataPrevEnvioValidacaoObras:'2099-02-01',dataPrevistaEntrega:'2099-01-01',createdAt:'2026-09-01T09:00:00Z'},
  {...base,id:'sort-validation-near-new',dataPrevEnvioValidacaoObras:'2099-01-02',dataPrevistaEntrega:'2099-12-31',createdAt:'2026-09-12T09:00:00Z'},
  {...base,id:'sort-validation-near-old',dataPrevEnvioValidacaoObras:'2099-01-02',dataPrevistaEntrega:'2099-12-31',createdAt:'2026-09-10T09:00:00Z'},
  {...base,id:'sort-overdue-validation',dataPrevEnvioValidacaoObras:'2000-01-01',dataPrevistaEntrega:'2099-01-01',createdAt:'2026-09-09T09:00:00Z'},
  {...base,id:'sort-completed-old',coluna:'concluido',dataPrevEnvioValidacaoObras:'2000-01-01',dataPrevistaEntrega:'2099-12-31',dataEntregaReal:'2026-09-10',createdAt:'2026-08-01T09:00:00Z'},
  {...base,id:'sort-completed-new',coluna:'concluido',dataPrevEnvioValidacaoObras:'2000-01-01',dataPrevistaEntrega:'2099-01-01',dataEntregaReal:'2026-09-14',createdAt:'2026-08-02T09:00:00Z'},
 ];
 const b=await backend(page,'Admin',false,{demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const fazer=page.locator('.kanban-column[data-column="fazer"]');
 const concluded=page.locator('.kanban-column[data-column="concluido"]');
 const expectedOpen=['sort-overdue-validation','sort-validation-near-old','sort-validation-near-new','sort-validation-far','sort-no-date'];
 const expectedCompleted=['sort-completed-new','sort-completed-old'];
 await expect(page.locator('.operational-board-panel .kanban-sort-button')).toHaveCount(8);
 expect(await fazer.locator('article').evaluateAll(cards=>cards.map(card=>card.dataset.id))).toEqual(expectedOpen);
 expect(await concluded.locator('article').evaluateAll(cards=>cards.map(card=>card.dataset.id))).toEqual(expectedCompleted);
 await fazer.locator('.demand-list').evaluate((list)=>{
  const cards=[...list.querySelectorAll('article')];
  cards.reverse().forEach(card=>list.append(card));
 });
 expect(await fazer.locator('article').evaluateAll(cards=>cards.map(card=>card.dataset.id))).toEqual([...expectedOpen].reverse());
 await page.getByRole('button',{name:'Reordenar etapa Fazer'}).click();
 expect(await page.locator('.kanban-column[data-column="fazer"] article').evaluateAll(cards=>cards.map(card=>card.dataset.id))).toEqual(expectedOpen);
 await page.getByRole('button',{name:'Reordenar etapa Concluído'}).click();
 expect(await page.locator('.kanban-column[data-column="concluido"] article').evaluateAll(cards=>cards.map(card=>card.dataset.id))).toEqual(expectedCompleted);
 expect(b.errors).toEqual([]);
});

test('operational demand cards and list standardize work names'`;
if (!tests.includes("test('kanban reorders by displayed milestone, creation date and real completion'")) {
  if (!testPattern.test(tests)) throw new Error('Teste antigo de ordenação operacional não localizado.');
  tests = tests.replace(testPattern, testReplacement);
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(stylesPath, styles);
fs.writeFileSync(testPath, tests);
