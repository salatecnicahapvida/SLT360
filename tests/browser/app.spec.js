import {test,expect} from '@playwright/test';
import {flattenPayload,ENTITY_BY_NAME} from '../../src/module-model.js';
import * as XLSX from 'xlsx';

const id='11111111-1111-4111-8111-111111111111';
const payload={state:{
  works:[
    {id:'test-work',nome:'Obra de teste',codigoOriginal:'TEST',uf:'SP',cidade:'São Paulo',tipoUnidade:'Clínica',tipologiaObra:'Reforma',anoObra:'2026',prazoDias:120,areaConstruida:100,areaEquivalente:100,ev:{id:'test-ev',status:'Rascunho',versaoAtual:1,lines:[],versions:[],sicIds:[],demandaIds:[]}},
    {id:'work-without-ev',nome:'Obra nova sem EV',codigoOriginal:'NEW',uf:'RN',cidade:'Natal',tipoUnidade:'Hospital',tipologiaObra:'Retrofit',areaConstruida:0,areaEquivalente:0},
  ],
  evs:[
    {id:'evh-test-1',code:'HIST-1',project:'Obra histórica Norte - AM',year:2025,date:'2025-06-01',revision:'REV02',typology:'Hospital',technician:'Técnico A',area:200,total:1000,baseTotal:950,disciplines:{'adequacoes-civis':800,'taxa-risco':50,sics:150},items:[]},
    {id:'evh-test-2',code:'HIST-2',project:'Obra histórica Sul - RS',year:2024,date:'2024-05-01',revision:'REV01',typology:'Clínica e Medicina Preventiva',technician:'Técnico B',area:100,total:520,baseTotal:500,disciplines:{'adequacoes-civis':500,sics:20},items:[]},
    {id:'evh-test-3',code:'HIST-3',project:'ADM Barro Preto Timbiras - 2° PA',year:2024,date:'2024-04-01',revision:'REV01',typology:'Pronto Atendimento',technician:'Técnico C',area:80,total:400,baseTotal:400,disciplines:{'adequacoes-civis':400},items:[]},
  ],
  demands:[
    {id:'test-demand',obraId:'test-work',titulo:'Demanda de teste',tipo:'SIC',coluna:'fazer',sicApprovalStatus:'Pendente',sicMetadata:{tituloSic:'Teste',obraNome:'Obra de teste',lecomNumber:'TEST-1'},sicDraftDisciplines:[],anexos:[],sicIds:[]},
    {id:'test-budget-demand',obraId:'test-work',titulo:'Orçamento de teste',tipo:'EmissaoInicial',coluna:'validacaoObras',sicIds:[],anexos:[]},
  ],
  sicApprovalWorks:[{id:'approval-test',descricao:'Obra SIC de teste',classificacao:'Teste',oiList:['TEST'],oiAliases:['TEST'],sics:[{id:'sic-test',lecom:'TEST',descricao:'SIC de teste',valor:20,weekId:'w-test',status:'pendente'}],ev:{semAditivos:100,aditivosAprovados:0,total:100,areaM2:10,valorM2:10},sap:{atribuidoAtual:120,comprometidoAtual:80,faturasAnosAnteriores:0},historyEvents:[],lastWeekId:'w-test'}],
  sicApprovalWeeks:[{id:'w-test',label:'Semana teste',start:'2026-09-01',end:'2026-09-07'}],sicApprovalSnapshots:[],
},datasets:{}};

async function backend(page,role='Admin',malicious=false){
 const input=structuredClone(payload);
 if(malicious)input.state.works[0].nome='<img src=x onerror="window.__xss=1">Obra de teste';
 let records=flattenPayload(input).map(r=>({...r,revision:1}));
 let analysts=[];
 const requests=[]; const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const user={id,email:'admin@example.test',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{}};
 const grants=['budget','maintenance','clinical','finance'].map(module=>({module,can_read:true,can_write:role==='Admin'}));
 const profile={id,nome:'Usuário teste',perfil:role,ativo:true,must_change_password:false,revision:1};
 const token=['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})).toString('base64url'),'test'].join('.');
 await page.route('https://mgpkgxcenxnqvvujlclh.supabase.co/**',async route=>{
  const req=route.request(),url=new URL(req.url()),p=url.pathname;
  let data=[];
  if(p==='/auth/v1/token')data={access_token:token,refresh_token:'test-refresh',expires_in:3600,token_type:'bearer',user};
  else if(p==='/auth/v1/user')data=user;
  else if(p.endsWith('/slt360_profiles'))data=[profile];
  else if(p.endsWith('/slt_core_module_access'))data=grants;
  else if(p.endsWith('/slt_core_analysts'))data=analysts;
  else if(p.endsWith('/slt_admin_users'))data={users:[{...profile,email:user.email,access:grants}],analysts};
  else if(p.endsWith('/slt_admin_create_analyst')){
   const body=req.postDataJSON();const analyst={id:'22222222-2222-4222-8222-222222222222',nome:body.analyst_name,created_at:'2026-09-09T12:00:00Z'};
   analysts=[...analysts,analyst];data=analyst;
  }
  else if(p.endsWith('/slt_home_summary'))data={schema_version:2,works:{totalWorks:5,historicalEVCount:3,activeCount:2,pendingEVCount:1,contracted:0},maintenance:{totalCount:0,activeCount:0,overdueCount:0},clinical:{equipmentCount:0,unitCount:0,totalCount:0,activeCount:0},finance:{fundCount:0,availableBalance:0}};
  else if(p.endsWith('/slt_module_load')){
   const module=req.postDataJSON()?.module_key;
   const dependencies=new Set([
    ...(['budget','maintenance','clinical','projects'].includes(module)?['core_units','core_sprints','core_source_unit_registry_data']:[]),
    ...(module==='budget'?['core_suppliers']:[]),
    ...(['budget','finance','projects'].includes(module)?['projects_works']:[]),
   ]);
   data={schema_version:2,records:module?records.filter(row=>ENTITY_BY_NAME.get(row.entity)?.module===module||dependencies.has(row.entity)):records};
  }
  else if(p.endsWith('/slt_backup_daily'))data={created:false};
  else if(p.endsWith('/slt_commit_changes')){
   const body=req.postDataJSON();requests.push(body);
   for(const c of body.changes){records=records.filter(r=>!(r.entity===c.entity&&r.key===c.key));if(c.operation!=='delete')records.push({...c,revision:c.expected_revision+1});}
   data=body.changes.map(c=>({entity:c.entity,key:c.key,revision:c.expected_revision+1}));
  }
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 return {requests,errors};
}
async function login(page){await page.goto('./');await page.locator('#cloudLogin [name=email]').fill('admin@example.test');await page.locator('#cloudLogin [name=password]').fill('TestPassword123!');await page.locator('#cloudLogin button').click();await expect(page.locator('#legacyShell')).toBeVisible();}

test('all active views load, SIC is native, no automatic writes on startup',async({page})=>{
 const b=await backend(page);await login(page);
 const homeCards=page.locator('.home-launchpad-card');
 await expect(homeCards).toHaveCount(4);
 await expect(homeCards.locator('.home-launchpad-card__number')).toHaveText(['01','02','03','04']);
 await expect(homeCards.locator('.home-launchpad-card__body strong')).toHaveText(['Obras','Manutenção','Eng. Clínica','Controle de Verba']);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await expect(page.getByRole('heading',{name:'Visão Operacional',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Sprints globais',exact:true})).toHaveCount(0);
 await expect(page.locator('#globalSearch')).toHaveCount(0);
 await expect(page.locator('[data-operational-search]')).toBeVisible();
 await expect(page.locator('.operational-board-panel').getByRole('button',{name:'Visão gerencial',exact:true})).toHaveCount(0);
 await expect(page.locator('[data-operational-filter="type"] option[value="SIC"]')).toHaveText('SIC');
 await expect(page.locator('[data-operational-filter="status"] option')).toHaveText([
  'Todas','Fazer','Fazendo','Pausado','Aguardando Validação Sala Técnica','Aguardando Validação Obras',
  'Aguardando Aprovação Diretoria','Concluído','Cancelado',
 ]);
 const worksTabs=page.locator('nav[aria-label="Navegação interna de Obras"] .module-tab');
 await expect(worksTabs).toHaveCount(5);
 await expect(worksTabs).toHaveText(['Visão Operacional','Visão Gerencial','Visão Estratégica','Portfólio de Obras',"Estudo de SIC's"]);
 await expect(page.locator('[data-view="ev"]:visible')).toHaveCount(0);
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 await page.locator('[data-module="works"]').click();
 await expect(page.getByRole('heading',{name:'Visão Operacional',exact:true})).toBeVisible();
 for(const view of ['worksOperational','worksManagement','worksStrategic','portfolio','maintenance','maintenanceOperational','maintenanceReports','clinical','budget','sics','settings']){
  await page.locator(`[data-view="${view}"]`).filter({visible:true}).first().click();
  await expect(page.locator('#app')).not.toBeEmpty();
 }
 await expect(page.locator('[data-team-action="create"]')).toBeVisible();
 const settingsHistory=page.locator('.settings-history-panel');
 await expect(settingsHistory).not.toHaveAttribute('open','');
 await expect(settingsHistory.getByText('Sem histórico registrado.')).not.toBeVisible();
 await settingsHistory.locator('summary').click();
 await expect(settingsHistory).toHaveAttribute('open','');
 await expect(settingsHistory.getByText('Sem histórico registrado.')).toBeVisible();
 await expect(settingsHistory.getByText('Recolher')).toBeVisible();
 expect(b.requests).toHaveLength(0);expect(b.errors).toEqual([]);
 await page.screenshot({path:'outputs/settings-audit.png',fullPage:true});
});

test('kanban horizontal scrollbar stays above the column names',async({page})=>{
 await backend(page);await login(page);

 const expectTopScrollbar=async()=>{
  const topScroll=page.locator('[data-kanban-top-scroll]');
  const board=page.locator('[data-kanban-scroll-board]');
  await expect(topScroll).toBeVisible();
  const positions=await Promise.all([
   topScroll.boundingBox(),
   board.locator('.kanban-column header').first().boundingBox(),
  ]);
  expect(positions[0].y+positions[0].height).toBeLessThanOrEqual(positions[1].y);
  await topScroll.press('ArrowRight');
  await expect.poll(()=>board.evaluate(element=>element.scrollLeft)).toBe(80);
  await expect(topScroll).toHaveAttribute('aria-valuenow','80');
  await expect.poll(()=>board.evaluate(element=>getComputedStyle(element).scrollbarWidth)).toBe('none');
 };

 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await expectTopScrollbar();
 await page.getByRole('button',{name:'Manutenção',exact:true}).click();
 await page.locator('[data-view="maintenanceOperational"]').filter({visible:true}).first().click();
 await expectTopScrollbar();
 await page.getByRole('button',{name:'Eng. Clínica',exact:true}).click();
 await page.locator('[data-view="clinicalOperational"]').filter({visible:true}).first().click();
 await expectTopScrollbar();
 await page.screenshot({path:'outputs/clinical-kanban-top-scroll.png',fullPage:false});
});

test('analyst directory is separate from users and feeds every analyst filter',async({page})=>{
 const b=await backend(page);await login(page);
 await page.locator('[data-view="settings"]').filter({visible:true}).first().click();
 await expect(page.getByRole('heading',{name:'Usuários',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Analistas',exact:true})).toBeVisible();
 await expect(page.locator('.users-panel [data-action="sort-generic-table"]')).toHaveCount(0);

 await page.locator('[data-team-action="create-analyst"]').click();
 const analystDialog=page.locator('#teamAnalystForm');
 await analystDialog.locator('[name="nome"]').fill('Analista Novo');
 await analystDialog.getByRole('button',{name:'Criar analista',exact:true}).click();
 await expect(page.locator('.analysts-panel tbody')).toContainText('Analista Novo');

 await page.locator('[data-team-action="create"]').click();
 const userDialog=page.locator('#teamAccountForm');
 await expect(userDialog.locator('[name="analyst_id"] option')).toContainText(['Sem vínculo','Analista Novo']);
 await expect(userDialog.locator('[name="new_analyst"]')).toHaveCount(0);
 await userDialog.locator('[data-team-close]').first().click();

 await page.getByRole('button',{name:'Obras',exact:true}).click();
 await expect(page.locator('[data-operational-filter="analyst"] option')).toContainText(['Todos','Analista Novo']);
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.getByRole('button',{name:/Emissão Inicial/}).click();
 await expect(page.locator('#demandWizardStep1 .analyst-chip')).toContainText(['Sem analista','Analista Novo']);
 await page.locator('#demandWizardStep1 [data-action="close-modal"]').first().click();
 await page.locator('[data-module="maintenance"]').click();
 await page.locator('[data-view="maintenanceOperational"]').filter({visible:true}).first().click();
 await expect(page.locator('[data-maintenance-filter="analyst"] option')).toContainText(['Todos','Analista Novo']);
 await page.locator('[data-module="clinical"]').click();
 await page.locator('[data-view="clinicalOperational"]').filter({visible:true}).first().click();
 await expect(page.locator('[data-maintenance-filter="analyst"] option')).toContainText(['Todos','Analista Novo']);
 expect(b.errors).toEqual([]);
});

test('initial budget demand is optional, shows work year and accepts every portfolio work',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.getByRole('button',{name:/Emissão Inicial/}).click();
 const step1=page.locator('#demandWizardStep1');
 await expect(step1).toBeVisible();
 await expect(step1.getByText('Contexto da unidade',{exact:true})).toHaveCount(0);
 await expect(step1.getByText('Classificação',{exact:true})).toHaveCount(0);
 await expect(step1.locator('[name="descricao"]')).not.toHaveAttribute('required','');
 await expect(step1.locator('[name="analistaResponsavel"]:checked')).toHaveValue('');

 const descriptionBox=await step1.locator('[name="descricao"]').boundingBox();
 const sprintBox=await step1.locator('[name="sprintId"]').boundingBox();
 const workBox=await step1.locator('[name="obraBusca"]').boundingBox();
 expect(descriptionBox.y).toBeLessThan(sprintBox.y);
 expect(sprintBox.y).toBeLessThan(workBox.y);

 const currentOption=step1.locator('#demandWorkOptions option[value="Obra de teste"]');
 const historicalOption=step1.locator('#demandWorkOptions option[value="Obra histórica Norte - AM"]');
 await expect(currentOption).toHaveText('2026');
 await expect(historicalOption).toHaveText('2025');
 await expect(currentOption).not.toContainText('TEST');
 await expect(currentOption).not.toContainText('undefined');
 await page.screenshot({path:'outputs/initial-demand-audit.png',fullPage:true,animations:'disabled'});

 await step1.locator('[name="obraBusca"]').fill('Obra histórica Norte - AM');
 await step1.getByRole('button',{name:/Avançar/}).click();
 await expect(page.locator('#demandForm')).toBeVisible();
 await expect(page.locator('#formError')).not.toContainText('Selecione uma obra válida');
 await page.locator('#demandForm').getByRole('button',{name:'Salvar demanda',exact:true}).click();
 await expect(page.locator('.demand-card').filter({hasText:'Obra histórica Norte - AM'})).toBeVisible();
 expect(b.errors).toEqual([]);
});

test('historical EV shows original and additive totals with an unobstructed title',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const row=page.locator('.portfolio-works-table tbody tr').filter({hasText:'Obra histórica Norte'});
 await row.getByRole('button',{name:'Abrir EV',exact:true}).click();
 const modal=page.locator('.ev-historical-modal');
 await expect(modal.locator('#historicalEVTitle')).toHaveText('Obra histórica Norte - AM');
 const metric=label=>modal.locator('.ev-historical-summary > .mini-metric').filter({has:page.getByText(label,{exact:true})});
 await expect(metric('Valor total do EV')).toContainText('R$ 1.000');
 await expect(metric('Valor do EV original (sem SICs)')).toContainText('R$ 850');
 await expect(metric('SICs / Aditivos')).toContainText('R$ 150');
 await expect(metric('Flag de SICs / Aditivos')).toContainText('Acima de 5%');
 await expect(metric('SICs / Aditivos')).toHaveClass(/mini-metric--alert/);
 await expect(metric('Flag de SICs / Aditivos')).toHaveClass(/mini-metric--alert/);
 await expect(metric('Percentual sobre o EV original')).toHaveCount(0);
 await expect(modal.locator('.ev-historical-summary')).not.toContainText('Filhas da coluna F');
 const title=modal.locator('#historicalEVTitle');
 await title.click(); // Also checks that the site header does not cover the title.
 await page.screenshot({path:'outputs/ev-summary-layout.png',fullPage:false});
 await modal.getByRole('button',{name:'Fechar',exact:true}).click();
 const safeRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:'Obra histórica Sul'});
 await safeRow.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(metric('SICs / Aditivos')).toContainText('R$ 20');
 await expect(metric('Flag de SICs / Aditivos')).toContainText('Atenção: entre 3% e 5%');
 await expect(metric('SICs / Aditivos')).toHaveClass(/mini-metric--warning/);
 await expect(metric('Flag de SICs / Aditivos')).toHaveClass(/mini-metric--warning/);
 await modal.getByRole('button',{name:'Fechar',exact:true}).click();
 await page.setViewportSize({width:390,height:844});
 await row.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await title.click();
 await modal.getByRole('button',{name:'Fechar',exact:true}).click();
 expect(b.errors).toEqual([]);
});

test('portfolio rows open options for the exact current or historical EV and handle works without EV',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const rows=page.locator('.portfolio-works-table tbody tr');
 await rows.filter({hasText:'Obra histórica Norte'}).locator('td').nth(1).click();
 const options=page.getByRole('dialog');
 await expect(options).toContainText('Obra histórica Norte - AM');
 await options.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('#historicalEVTitle')).toHaveText('Obra histórica Norte - AM');
 await page.locator('.ev-historical-modal').getByRole('button',{name:'Fechar',exact:true}).click();
 const current=rows.filter({hasText:'Obra de teste'});
 await current.focus();await current.press('Enter');
 await expect(options).toContainText('Obra de teste');
 await options.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('#evModalTitle')).toHaveText('Obra de teste');
 await page.locator('.ev-modal-card').getByRole('button',{name:'Fechar',exact:true}).press('Enter');
 const empty=rows.filter({hasText:'Obra nova sem EV'});
 await empty.focus();await empty.press('Space');
 await expect(options).toContainText('Esta obra ainda não possui EV vinculado.');
 await expect(options.getByRole('button',{name:'Abrir EV'})).toHaveCount(0);
 await options.getByRole('button',{name:'Fechar'}).click();
 await current.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('#evModalTitle')).toHaveText('Obra de teste');
 await expect(options).toHaveCount(0);
 expect(b.errors).toEqual([]);
});

test('portfolio includes works without EV, selectable filters and the single requested KPI',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 await expect(page.getByRole('heading',{name:'Portfólio de Obras e EVs',exact:true})).toBeVisible();
 const kpis=page.locator('.portfolio-kpis');
 await expect(kpis).toContainText('Obras no portfólio');
 await expect(kpis).toContainText('5');
 await expect(kpis).toContainText('4 obras possuem EVs associados');
 await expect(kpis).not.toContainText('855 da base oficial');
 await expect(kpis).not.toContainText('Etapas de Projetos');
 await expect(kpis).not.toContainText('Projetos próximos');
 await expect(kpis).not.toContainText('Vínculos com EV');
 await expect(kpis).not.toContainText('Projetos atrasados');
 await expect(page.locator('[data-portfolio-quick-filter]')).toHaveCount(7);
 await expect(page.locator('[data-portfolio-quick-filter="origem"]')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Limpar filtros',exact:true})).toBeVisible();
 await expect(page.locator('.portfolio-works-table thead th')).toContainText([
  'Código','Nome da obra','Estado','Região','Ano','Tipologia','Categoria','CNPJ','Endereço',
  'Área equivalente (m²)','Tempo de obra (dias)','Total orçado','Custo por m²','Ações',
 ]);
 await page.locator('[data-portfolio-quick-filter="year"]').selectOption('2024');
 await expect(kpis).toContainText('2');
 await expect(kpis).toContainText('2 obras possuem EVs associados');
 await expect(page.locator('.portfolio-works-table tbody tr')).toHaveCount(2);
 await page.locator('[data-portfolio-search]').fill('Sul');
 await expect(page.locator('.portfolio-works-table tbody tr')).toHaveCount(1);
 await expect(page.locator('.portfolio-works-table tbody')).toContainText('Obra histórica Sul');
 await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();
 await expect(page.locator('.portfolio-works-table tbody tr')).toHaveCount(5);
 const historicalRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:'Obra histórica Norte'});
 await expect(historicalRow.locator('td').nth(1)).toHaveText('Obra histórica Norte - AM');
 await expect(historicalRow).not.toContainText('Histórico');
 await expect(historicalRow).not.toContainText('Técnico A');
 await expect(historicalRow.locator('td').nth(2)).toHaveText('AM');
 await expect(historicalRow.locator('td').nth(3)).toHaveText('Norte');
 await expect(historicalRow.locator('td').nth(4)).toHaveText('2025');
 await expect(historicalRow.locator('td').nth(5)).toHaveText('Hospital');
 await expect(historicalRow.locator('td').nth(9)).toHaveText('200,00');
 await expect(historicalRow.locator('td').nth(11)).toHaveText('R$ 1.000,00');
 await expect(historicalRow.locator('td').nth(12)).toHaveText('R$ 5,00');
 await expect(historicalRow.getByRole('button',{name:'Abrir EV'})).toBeVisible();
 await historicalRow.getByRole('button',{name:'Editar obra'}).click();
 const historicalWorkForm=page.locator('#workForm');
 await expect(historicalWorkForm.getByRole('heading',{name:'Editar obra'})).toBeVisible();
 await expect(historicalWorkForm.locator('[name="sourceHistoricalRecordId"]')).toHaveValue('evh-test-1');
 await expect(historicalWorkForm.locator('[name="nome"]')).toHaveValue('Obra histórica Norte - AM');
 await expect(historicalWorkForm.locator('[name="anoObra"]')).toHaveValue('2025');
 await historicalWorkForm.locator('[name="cidade"]').fill('Manaus');
 await historicalWorkForm.locator('[name="endereco"]').fill('Rua histórica, 10');
 await historicalWorkForm.getByRole('button',{name:'Salvar alterações'}).click();
 await expect(page.locator('.portfolio-works-table tbody tr')).toHaveCount(5);
 await expect(historicalRow.locator('td').nth(8)).toHaveText('Rua histórica, 10');
 await expect.poll(()=>b.requests.some(request=>request.changes.some(change=>change.entity==='projects_works'&&change.document.sourceHistoricalRecordId==='evh-test-1'&&change.document.endereco==='Rua histórica, 10'))).toBe(true);
 await historicalRow.getByRole('button',{name:'Abrir EV'}).click();
 await expect(page.locator('.ev-historical-modal')).toContainText('Técnico: Técnico A');
 await page.locator('.ev-historical-modal').getByRole('button',{name:'Fechar',exact:true}).click();
 const currentRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:'Obra de teste'});
 await expect(currentRow.locator('td').nth(2)).toHaveText('SP');
 await expect(currentRow.locator('td').nth(3)).toHaveText('Sudeste');
 await expect(currentRow.locator('td').nth(4)).toHaveText('2026');
 await expect(currentRow.locator('td').nth(5)).toHaveText('Reforma');
 await expect(currentRow.locator('td').nth(6)).toBeEmpty();
 await expect(currentRow.locator('td').nth(9)).toHaveText('100,00');
 await expect(currentRow.locator('td').nth(10)).toHaveText('120');
 await expect(currentRow.getByRole('button',{name:'Abrir EV'})).toBeVisible();
 await currentRow.getByRole('button',{name:'Editar obra'}).click();
 const currentWorkForm=page.locator('#workForm');
 await expect(currentWorkForm.getByRole('heading',{name:'Editar obra'})).toBeVisible();
 await currentWorkForm.locator('[name="endereco"]').fill('Rua editada, 100');
 await currentWorkForm.getByRole('button',{name:'Salvar alterações'}).click();
 await expect(currentRow.locator('td').nth(8)).toHaveText('Rua editada, 100');
 await expect.poll(()=>b.requests.some(request=>request.changes.some(change=>change.entity==='projects_works'&&change.document.endereco==='Rua editada, 100'))).toBe(true);
 const noEvRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:'Obra nova sem EV'});
 await expect(noEvRow.locator('td').nth(11)).toBeEmpty();
 await expect(noEvRow.locator('td').nth(12)).toBeEmpty();
 await expect(noEvRow.locator('td').nth(13)).toContainText('Sem EV');
 await expect(noEvRow.getByRole('button',{name:'Abrir EV'})).toHaveCount(0);
 await expect(noEvRow.getByRole('button',{name:'Editar obra'})).toBeVisible();
 const ambiguousPaRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:'ADM Barro Preto Timbiras'});
 await expect(ambiguousPaRow.locator('td').nth(2)).toBeEmpty();
 await expect(ambiguousPaRow.locator('td').nth(3)).toBeEmpty();
 await expect(page.getByRole('heading',{name:'Todos os EVs oficiais em uma única visão',exact:true})).toBeVisible();
 await expect(page.locator('[data-ev-history-filter="technician"]')).toHaveCount(0);
 await expect(page.locator('.ev-history-heading')).toContainText('3 da carga inicial DADOS EVS + 1 novo');
 await expect(page.locator('.ev-history-heading')).toContainText('DADOS EVS');
 await page.screenshot({path:'outputs/portfolio-audit.png',fullPage:true,animations:'disabled'});
 expect(b.errors).toEqual([]);
});

test('only SICs enter director approval after Works validation',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const kanbanColumns=page.locator('.operational-board-panel .kanban-column');
 await expect(kanbanColumns).toHaveCount(8);
 expect((await kanbanColumns.first().boundingBox()).height).toBeGreaterThanOrEqual(1100);
 await expect(kanbanColumns.locator('header h2')).toHaveText([
  'Fazer','Fazendo','Pausado','Aguardando Validação Sala Técnica','Aguardando Validação Obras',
  'Aguardando Aprovação Diretoria','Concluído','Cancelado',
 ]);

 await page.locator('[data-action="open-demand-detail"][data-id="test-budget-demand"]').click();
 const nonSicStatus=page.locator('[data-action="update-demand-status"][data-id="test-budget-demand"]');
 await expect(nonSicStatus.locator('option[value="aprovacaoDiretoria"]')).toHaveCount(0);
 await page.locator('.modal-actions').getByRole('button',{name:'Fechar',exact:true}).click();

 await page.locator('[data-action="open-demand-detail"][data-id="test-demand"]').click();
 const sicStatus=page.locator('[data-action="update-demand-status"][data-id="test-demand"]');
 await expect(sicStatus.locator('option[value="aprovacaoDiretoria"]')).toHaveCount(1);
 await sicStatus.selectOption('validacaoObras');
 await sicStatus.selectOption('concluido');
 await expect(sicStatus).toHaveValue('aprovacaoDiretoria');
 await page.locator('.modal-actions').getByRole('button',{name:'Fechar',exact:true}).click();
 const directorColumn=page.locator('.kanban-column[data-column="aprovacaoDiretoria"]');
 await expect(directorColumn.locator('article[data-id="test-demand"]')).toBeVisible();
 await expect(directorColumn.locator('article[data-id="test-budget-demand"]')).toHaveCount(0);
 await page.screenshot({path:'outputs/works-kanban-audit.png',fullPage:true,animations:'disabled'});
 expect(b.errors).toEqual([]);
});

test('startup loads only home counters and a module stays read-only until its database snapshot arrives',async({page})=>{
 await page.addInitScript(()=>{
  const original=window.fetch.bind(window);window.__fetchStarts=[];
  window.fetch=(...args)=>{
   const url=String(args[0]?.url||args[0]);window.__fetchStarts.push({url,at:performance.now()});
   if(url.includes('/auth/v1/token'))return original(...args);
   return new Promise(resolve=>setTimeout(resolve,180)).then(()=>original(...args));
  };
 });
 const b=await backend(page);await login(page);
 const expected=['/auth/v1/user','/rest/v1/slt360_profiles','/rest/v1/rpc/slt_home_summary','/rest/v1/slt_core_module_access'];
 const initiated=await page.evaluate(()=>window.__fetchStarts);
 const starts=expected.map(path=>initiated.find(entry=>new URL(entry.url).pathname===path)?.at);
 expect(starts.every(Number.isFinite)).toBe(true);
 expect(Math.max(...starts)-Math.min(...starts),JSON.stringify(initiated)).toBeLessThan(100);
 expect(initiated.some(entry=>new URL(entry.url).pathname.endsWith('/slt_module_load'))).toBe(false);
 expect(initiated.some(entry=>new URL(entry.url).pathname.endsWith('/slt_core_analysts'))).toBe(false);
 expect(initiated.some(entry=>new URL(entry.url).pathname.endsWith('/slt_backup_daily'))).toBe(false);
 expect(await page.evaluate(()=>({echarts:Boolean(window.echarts),chart:Boolean(window.Chart)}))).toEqual({echarts:false,chart:false});
 expect(await page.evaluate(()=>window.SLT_CLOUD.canWrite('works'))).toBe(false);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await expect(page.getByRole('heading',{name:'Visão Operacional',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>window.SLT_CLOUD.isModuleLoaded('works'))).toBe(true);
 expect(await page.evaluate(()=>window.SLT_CLOUD.canWrite('works'))).toBe(true);
 const afterModule=await page.evaluate(()=>window.__fetchStarts);
 expect(afterModule.filter(entry=>new URL(entry.url).pathname.endsWith('/slt_module_load'))).toHaveLength(1);
 expect(afterModule.filter(entry=>new URL(entry.url).pathname.endsWith('/slt_core_analysts'))).toHaveLength(1);
 expect(b.errors).toEqual([]);
});

test('SIC approval persists to the same cloud queue and survives reload',async({page})=>{
 const b=await backend(page);await login(page);
 await page.locator('[data-view="worksOperational"]').filter({visible:true}).first().click();
 await page.locator('[data-view="sics"]').filter({visible:true}).first().click();
 const tabs=page.locator('[data-action="set-sic-view"]');
 if(await tabs.count())await tabs.filter({hasText:/Aprova/}).first().click();
 await expect(page.locator('#sicApprovalDashboard')).toBeVisible();
 await expect(page.locator('iframe')).toHaveCount(0);
 await expect(page.getByText('Obra SIC de teste',{exact:true}).first()).toBeVisible();
 await page.getByText('Obra SIC de teste',{exact:true}).first().click();
 await page.locator('[data-approve][data-sicid="sic-test"]').check();
 await expect.poll(()=>b.requests.length).toBeGreaterThan(0);
 expect(b.requests.at(-1).changes.some(c=>c.entity==='budget_approval_works'&&c.document.sics[0].status==='aprovado')).toBe(true);
 await page.reload();await expect(page.locator('#legacyShell')).toBeVisible();
 await page.locator('[data-view="worksOperational"]').filter({visible:true}).first().click();
 await page.locator('[data-view="sics"]').filter({visible:true}).first().click();
 await page.locator('[data-action="set-sic-view"][data-view-mode="approval"]').click();
 await page.getByText('Obra SIC de teste',{exact:true}).first().click();
 await expect(page.locator('[data-approve][data-sicid="sic-test"]')).toBeChecked();
 await page.screenshot({path:'outputs/sic-audit.png',fullPage:true,animations:'disabled'});
 expect(b.errors).toEqual([]);
});

test('database grants allow finance for an analyst while mutations stay blocked',async({page})=>{
 const b=await backend(page,'Analista');await login(page);
 await page.locator('[data-view="budget"]').filter({visible:true}).first().click();
 await expect(page.locator('#app')).toContainText('Verba');
 await page.locator('[data-view="worksOperational"]').filter({visible:true}).first().click();
 await page.locator('[data-view="sics"]').filter({visible:true}).first().click();
 await page.locator('[data-action="set-sic-view"][data-view-mode="approval"]').click();
 await page.getByText('Obra SIC de teste',{exact:true}).first().click();
 await expect(page.locator('[data-approve][data-sicid="sic-test"]')).toBeDisabled();
 await expect(page.locator('[data-descedit][data-sicid="sic-test"]')).toBeDisabled();
 expect(b.requests).toHaveLength(0);expect(b.errors).toEqual([]);
});

test('stored HTML cannot execute scripts and the old public SIC endpoint is gone',async({page,request})=>{
 const b=await backend(page,'Admin',true);await login(page);
 await page.locator('[data-view="worksOperational"]').filter({visible:true}).first().click();
 await page.locator('[data-action="open-demand-detail"]').first().click();
 expect(await page.evaluate(()=>window.__xss)).toBeUndefined();
 await expect(page.locator('[onerror],[onclick],iframe')).toHaveCount(0);
 expect((await request.get('./sic-approval-dashboard.html')).status()).toBe(404);
 expect(b.errors).toEqual([]);
});

test('Excel import stays available inside the native SIC panel and saves to Supabase',async({page})=>{
 const b=await backend(page);await login(page);
 await page.locator('[data-view="worksOperational"]').filter({visible:true}).first().click();
 await page.locator('[data-view="sics"]').filter({visible:true}).first().click();
 await page.locator('[data-action="set-sic-view"][data-view-mode="approval"]').click();
 await page.locator('#btnOpenImport').click();
 const book=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([
  ['OI','Descrição','Classificação','EV sem aditivos','Aditivos','EV total','Área','LECOM','Descrição SIC','Valor SIC'],
  ['OI-NEW','Obra importada teste','Teste',100,0,100,10,'NEW-SIC','SIC importada',15],
 ]),'Importação');
 await page.locator('#fileInput').setInputFiles({name:'fixture.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:XLSX.write(book,{type:'buffer',bookType:'xlsx'})});
 await expect(page.locator('#btnConfirmImport')).toBeEnabled();
 await page.locator('#weekLabel').fill('Semana importada');
 await page.locator('#weekStart').fill('2026-09-08');await page.locator('#weekEnd').fill('2026-09-14');
 await page.locator('#btnConfirmImport').click();
 await expect.poll(()=>b.requests.length).toBeGreaterThan(0);
 await expect(page.getByText('Obra importada teste',{exact:true}).first()).toBeVisible();
 expect(b.requests.at(-1).changes.some(c=>c.entity==='budget_approval_works'&&c.document.descricao==='Obra importada teste')).toBe(true);
 expect(b.errors).toEqual([]);
});
