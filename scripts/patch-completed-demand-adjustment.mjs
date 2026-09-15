import fs from 'node:fs';

const appPath = 'src/app.js';
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes('data-action="edit-completed-demand-value"')) {
  const detailAnchor = [
    '          </section>',
    '',
    '          <section class="modal-section">',
    '            <div class="section-title">',
    '              <span>Detalhes</span>',
  ].join('\n');

  if (!app.includes(detailAnchor)) throw new Error('Âncora do detalhe da demanda não encontrada.');

  const completedSection = [
    '          </section>',
    '',
    '          ${demand.coluna === "concluido" ? `',
    '          <section class="modal-section demand-produced-value-section">',
    '            <div class="section-title with-action">',
    '              <span>Impacto financeiro da conclusão</span>',
    '              <button class="secondary-action compact-action" type="button" data-action="edit-completed-demand-value" data-id="${demand.id}">${demandHasRecordedValue(demand) ? "Ajustar valor gerado" : "Informar valor gerado"}</button>',
    '            </div>',
    '            <div class="split-list compact">',
    '              ${splitItem("Valor gerado", demandHasRecordedValue(demand) ? money(demand.valorGerado) : "Não informado")}',
    '              ${splitItem("Situação no EV", demand.evSemMudanca === true ? "Sem mudança no EV" : demandHasEVUpdateForCompletion(demand) ? "EV atualizado" : "Não informado")}',
    '            </div>',
    '            <p class="muted">Demandas concluídas podem ter o valor gerado complementado ou corrigido sem reabrir o card. O ajuste fica registrado no histórico e só é confirmado após gravação no banco.</p>',
    '          </section>',
    '          ` : ""}',
    '',
    '          <section class="modal-section">',
    '            <div class="section-title">',
    '              <span>Detalhes</span>',
  ].join('\n');

  app = app.replace(detailAnchor, completedSection);

  const actionAnchor = '  if (action === "complete-demand-no-ev-change") {';
  if (!app.includes(actionAnchor)) throw new Error('Âncora da ação de conclusão não encontrada.');
  const actionBlock = [
    '  if (action === "edit-completed-demand-value") {',
    '    const demand = state.demands.find((item) => item.id === actionButton.dataset.id);',
    '    if (!demand || demand.coluna !== "concluido") return;',
    '    openDemandCompletionModal(demand.id);',
    '    return;',
    '  }',
    actionAnchor,
  ].join('\n');
  app = app.replace(actionAnchor, actionBlock);

  fs.writeFileSync(appPath, app);
}

const testPath = 'tests/browser/app.spec.js';
let tests = fs.readFileSync(testPath, 'utf8');
const testName = 'completed demand can register generated amount after legacy completion';
if (!tests.includes(testName)) {
  tests += `\n\ntest('${testName}',async({page})=>{\n const demand={...structuredClone(payload.state.demands[1]),id:'legacy-completed-demand',obraId:'test-work',tipo:'DemandaExtra',coluna:'concluido',dataEntregaReal:'2026-09-15',analistaResponsavel:'Ana',sicIds:[],anexos:[]};\n const b=await backend(page,'Admin',false,{demandRecords:[demand],analystNames:['Ana']});await login(page);\n await expect(page.locator('#cloudStatus')).toHaveText('Sincronizado');\n await page.getByRole('button',{name:'Abrir Obras'}).click();\n await page.locator('article[data-id="legacy-completed-demand"]').click();\n const detail=page.locator('#demandDetailForm');\n await expect(detail.getByRole('button',{name:'Informar valor gerado'})).toBeVisible();\n await detail.getByRole('button',{name:'Informar valor gerado'}).click();\n await expect(page.getByRole('heading',{name:'Confirme o impacto no EV'})).toBeVisible();\n await page.getByRole('button',{name:/Não houve mudança no EV/}).click();\n const completion=page.locator('#demandCompletionForm');\n await completion.locator('[name="valorGerado"]').fill('1.234,56');\n await completion.getByRole('button',{name:'Concluir demanda'}).click();\n await expect.poll(()=>b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='legacy-completed-demand')?.document?.valorGerado).toBe(1234.56);\n const saved=b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='legacy-completed-demand');\n expect(saved.document.evSemMudanca).toBe(true);\n expect(saved.document.coluna).toBe('concluido');\n await page.locator('article[data-id="legacy-completed-demand"]').click();\n await expect(page.locator('#demandDetailForm').getByRole('button',{name:'Ajustar valor gerado'})).toBeVisible();\n await expect(page.locator('#demandDetailForm')).toContainText('R$ 1.234,56');\n expect(b.errors).toEqual([]);\n});\n`;
  fs.writeFileSync(testPath, tests);
}
