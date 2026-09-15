import fs from 'node:fs';

const appPath = 'src/app.js';
const testPath = 'tests/browser/app.spec.js';
let app = fs.readFileSync(appPath, 'utf8');
let tests = fs.readFileSync(testPath, 'utf8');

const cardDatePattern = /function demandCardDateInfo\(demand\) \{[\s\S]*?\n\}\n\nfunction demandTimingInfo\(demand\) \{/;
const cardDateReplacement = `function demandCardDateInfo(demand) {
  const validationSent = Boolean(
    demand.dataEnvioRealValidacaoObras
    || demand.dataValidacaoObras
    || ["validacaoObras", "aprovacaoDiretoria", "concluido"].includes(demand.coluna),
  );
  const validationDate = dateOnly(demand.dataPrevEnvioValidacaoObras);
  const validationDeadlineStillActive = Boolean(validationDate && validationDate >= todayISO());
  if (!validationSent && validationDeadlineStillActive) {
    return {
      date: validationDate,
      dateLabel: \`Envio p/ validação: \${dateText(validationDate)}\`,
      isValidation: true,
    };
  }
  return {
    date: demand.dataPrevistaEntrega || "",
    dateLabel: demand.dataPrevistaEntrega ? \`Entrega prevista: \${dateText(demand.dataPrevistaEntrega)}\` : "Sem data prevista",
    isValidation: false,
  };
}

function demandTimingInfo(demand) {`;
if (!cardDatePattern.test(app)) throw new Error('Função demandCardDateInfo não localizada.');
app = app.replace(cardDatePattern, cardDateReplacement);

const completedDateOld = 'dateLabel: demand.dataEntregaReal ? `Concluída em ${dateText(demand.dataEntregaReal)}` : "Concluída",';
const completedDateNew = 'dateLabel: demand.dataEntregaReal ? `Entrega real: ${dateText(demand.dataEntregaReal)}` : "Concluída",';
if (!app.includes(completedDateOld)) throw new Error('Rótulo de data concluída não localizado.');
app = app.replace(completedDateOld, completedDateNew);

const requestedColumnOld = '  const requestedColumn = formData.get("coluna") || demand.coluna;\n  const nextTypeIsSic = demandTypeKey(demand.tipo) === "SIC";';
const requestedColumnNew = `  const selectedColumn = formData.get("coluna") || demand.coluna;
  const validationWasJustSent = !demandSnapshot.dataEnvioRealValidacaoObras && Boolean(demand.dataEnvioRealValidacaoObras);
  const validationColumnIndex = columns.findIndex((item) => item.id === "validacaoObras");
  const selectedColumnIndex = columns.findIndex((item) => item.id === selectedColumn);
  const shouldAutoAdvanceToWorksValidation = Boolean(
    validationWasJustSent
    && !demand.naoEnviarValidacaoObras
    && selectedColumnIndex >= 0
    && validationColumnIndex >= 0
    && selectedColumnIndex < validationColumnIndex
  );
  const requestedColumn = shouldAutoAdvanceToWorksValidation ? "validacaoObras" : selectedColumn;
  const nextTypeIsSic = demandTypeKey(demand.tipo) === "SIC";`;
if (!app.includes(requestedColumnOld)) throw new Error('Ponto de decisão da coluna da demanda não localizado.');
app = app.replace(requestedColumnOld, requestedColumnNew);

const demandArrayAnchor = "  {...base,id:'validation-date-missing',coluna:'fazer',dataPrevEnvioValidacaoObras:'',dataPrevistaEntrega:'2026-10-22'},\n ];";
const demandArrayReplacement = "  {...base,id:'validation-date-missing',coluna:'fazer',dataPrevEnvioValidacaoObras:'',dataPrevistaEntrega:'2026-10-22'},\n  {...base,id:'validation-overdue',coluna:'fazendo',dataPrevEnvioValidacaoObras:'2000-01-01',dataPrevistaEntrega:'2099-10-23'},\n  {...base,id:'validation-completed',coluna:'concluido',dataPrevEnvioValidacaoObras:'2026-10-03',dataPrevistaEntrega:'2026-10-23',dataEntregaReal:'2026-09-15'},\n ];";
if (!tests.includes(demandArrayAnchor)) throw new Error('Lista do teste de datas operacionais não localizada.');
tests = tests.replace(demandArrayAnchor, demandArrayReplacement);

const dateAssertionsAnchor = " await expect(board.locator('article[data-id=\"validation-date-missing\"] .demand-card-date')).toHaveText('Entrega prevista: 22/10/2026');\n await expect(board.getByRole('button',{name:'Aprovação'})).toHaveCount(0);";
const dateAssertionsReplacement = " await expect(board.locator('article[data-id=\"validation-date-missing\"] .demand-card-date')).toHaveText('Entrega prevista: 22/10/2026');\n await expect(board.locator('article[data-id=\"validation-overdue\"] .demand-card-date')).toHaveText('Entrega prevista: 23/10/2099');\n await expect(board.locator('article[data-id=\"validation-completed\"] .demand-card-date')).toHaveText('Entrega real: 15/09/2026');\n await expect(board.getByRole('button',{name:'Aprovação'})).toHaveCount(0);";
if (!tests.includes(dateAssertionsAnchor)) throw new Error('Asserções do teste de datas operacionais não localizadas.');
tests = tests.replace(dateAssertionsAnchor, dateAssertionsReplacement);

const nextTestAnchor = "test('operational proximity alert uses only the next 24-hour date window for validation and delivery',async({page})=>{";
const autoMoveTest = `test('real validation send date automatically moves the card to Obras validation',async({page})=>{
 const demand={
  ...structuredClone(payload.state.demands[1]),
  id:'auto-validation-move',obraId:'test-work',tipo:'EmissaoInicial',coluna:'fazendo',
  dataEnvioRealValidacaoObras:'',dataValidacaoObras:'',dataPrevistaEntrega:'2099-10-20',sicIds:[],
 };
 const b=await backend(page,'Admin',false,{demandRecords:[demand]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-action="open-demand-detail"][data-id="auto-validation-move"]').click();
 const form=page.locator('#demandDetailForm');
 await form.locator('[name="dataEnvioRealValidacaoObras"]').fill('2026-09-15');
 await form.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(form).toHaveCount(0);
 await expect(page.locator('.kanban-column[data-column="validacaoObras"] article[data-id="auto-validation-move"]')).toBeVisible();
 await expect.poll(()=>{
  const changes=b.requests.flatMap(request=>request.changes).filter(change=>change.entity==='budget_demands'&&change.key==='auto-validation-move');
  return changes.at(-1)?.document?.coluna;
 }).toBe('validacaoObras');
 expect(b.errors).toEqual([]);
});

${nextTestAnchor}`;
if (!tests.includes(nextTestAnchor)) throw new Error('Âncora para inserir teste de avanço automático não localizada.');
tests = tests.replace(nextTestAnchor, autoMoveTest);

fs.writeFileSync(appPath, app);
fs.writeFileSync(testPath, tests);
