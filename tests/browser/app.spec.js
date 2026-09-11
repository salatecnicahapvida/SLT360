import {test,expect} from '@playwright/test';
import {flattenPayload,ENTITY_BY_NAME} from '../../src/module-model.js';
import * as XLSX from 'xlsx';

const id='11111111-1111-4111-8111-111111111111';
const payload={state:{
  works:[
    {id:'test-work',nome:'Obra de teste',codigoOriginal:'TEST',uf:'São Paulo - Sudeste',cidade:'São Paulo',tipoUnidade:'Clínica',classificacaoObra:'Venda de Serviços',tipologiaObra:'Reforma',anoObra:'2026',prazoDias:120,areaConstruida:100,areaEquivalente:100,ev:{id:'test-ev',status:'Rascunho',versaoAtual:1,lines:[{disciplinaId:'instalacoes-eletricas-e-spda',valorOrcado:100},{disciplinaId:'instalacoes-de-spda',valorOrcado:50}],versions:[],sicIds:[],demandaIds:[]}},
    {id:'work-without-ev',nome:'Obra nova sem EV',codigoOriginal:'NEW',uf:'RN',cidade:'Natal',tipoUnidade:'Hospital',classificacaoObra:'Outros',tipologiaObra:'Retrofit',areaConstruida:0,areaEquivalente:0},
  ],
  evs:[
    {id:'evh-test-1',code:'HIST-1',project:'Obra histórica Norte - AM',year:2025,date:'2025-06-01',revision:'REV02',typology:'Hospital',technician:'Técnico A',area:200,total:1000,baseTotal:950,disciplines:{'adequacoes-civis':800,'taxa-risco':50,sics:150},items:[]},
    {id:'evh-test-2',code:'HIST-2',project:'Obra histórica Sul - RS',year:2024,date:'2024-05-01',revision:'REV01',typology:'Clínica e Medicina Preventiva',technician:'Técnico B',area:100,total:520,baseTotal:500,disciplines:{'adequacoes-civis':500,sics:20},items:[]},
    {id:'evh-test-3',code:'HIST-3',project:'ADM Barro Preto Timbiras - 2° PA',year:2024,date:'2024-04-01',revision:'REV01',typology:'Pronto Atendimento',technician:'Técnico C',area:80,total:400,baseTotal:400,disciplines:{'adequacoes-civis':400},items:[]},
  ],
  demands:[
    {id:'test-demand',obraId:'test-work',titulo:'Demanda de teste',tipo:'SIC - Solicitação de Informação',coluna:'fazer',etiquetas:['Urgente'],sicApprovalStatus:'Pendente',sicMetadata:{tituloSic:'Teste',obraNome:'Obra de teste',lecomNumber:'TEST-1'},sicDraftDisciplines:[],anexos:[],sicIds:[]},
    {id:'test-budget-demand',obraId:'test-work',titulo:'Orçamento de teste',tipo:'EmissaoInicial',coluna:'validacaoObras',sicIds:[],anexos:[]},
  ],
  sicApprovalWorks:[{id:'approval-test',descricao:'Obra SIC de teste',classificacao:'Teste',oiList:['TEST'],oiAliases:['TEST'],sics:[{id:'sic-test',lecom:'TEST',descricao:'SIC de teste',valor:20,weekId:'w-test',status:'pendente'}],ev:{semAditivos:100,aditivosAprovados:0,total:100,areaM2:10,valorM2:10},sap:{atribuidoAtual:120,comprometidoAtual:80,faturasAnosAnteriores:0},historyEvents:[],lastWeekId:'w-test'}],
  sicApprovalWeeks:[{id:'w-test',label:'Semana teste',start:'2026-09-01',end:'2026-09-07'}],sicApprovalSnapshots:[],
},datasets:{}};

async function backend(page,role='Admin',malicious=false,{maintenanceSourceOverlap=false,analystCanWrite=false,analystNames=[],archivedDemandIds=[],demandRecords=null,evRecords=null}={}){
 const input=structuredClone(payload);
 if(Array.isArray(demandRecords))input.state.demands=demandRecords;
 if(Array.isArray(evRecords))input.state.evs=evRecords;
 input.state.deletedDemands=archivedDemandIds.map(demandId=>({id:demandId,titulo:'Demanda arquivada'}));
 if(malicious)input.state.works[0].nome='<img src=x onerror="window.__xss=1">Obra de teste';
 if(maintenanceSourceOverlap){
  input.state.maintenanceDemands=[
   {id:'MAN-0001',titulo:'Reparo predial atualizado',ordemServico:'OS-MAN-1',unidadeNome:'Hospital A',centroCusto:'MANUTENÇÃO PREDIAL',coluna:'andamento',historico:[{fase:'Andamento',data:'2026-09-01',observacao:'Histórico preservado'}]},
   {id:'MAN-0002',titulo:'Autoclave atualizada',ordemServico:'OS-CLI-2',unidadeNome:'Hospital B',centroCusto:'ENG CLINICA',coluna:'validacao',historico:[{fase:'Validação',data:'2026-09-02',observacao:'Histórico clínico preservado'}]},
  ];
  input.datasets.MAINTENANCE_DATA={source:'Teste de sobreposição',records:[
   {'NOME DA OBRA':'Reparo predial original','NOME DA UNIDADE':'Hospital A','CENTRO DE CUSTO':'MANUTENÇÃO PREDIAL','Fase atual':'NÃO INICIADO'},
   {'NOME DA OBRA':'Autoclave original','NOME DA UNIDADE':'Hospital B','CENTRO DE CUSTO':'ENG CLINICA','Fase atual':'NÃO INICIADO'},
  ]};
 }
 let records=flattenPayload(input).map(r=>({...r,revision:1}));
 let analysts=analystNames.map((nome,index)=>({
  id:`22222222-2222-4222-8222-${String(index+1).padStart(12,'0')}`,
  nome,
  created_at:'2026-09-09T12:00:00Z',
 }));
 const requests=[]; const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const user={id,email:'admin@example.test',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{}};
 const grants=['projects','budget','maintenance','clinical','finance'].map(module=>({module,can_read:true,can_write:role==='Admin'||analystCanWrite}));
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
  else if(p.endsWith('/slt_admin_update_analyst')){
   const body=req.postDataJSON();const analyst=analysts.find(item=>item.id===body.target_id);
   if(analyst)analyst.nome=body.analyst_name;data=analyst;
  }
  else if(p.endsWith('/slt_home_summary'))data={schema_version:2,works:{totalWorks:5,historicalEVCount:3,activeCount:2,pendingEVCount:1,contracted:0},maintenance:{totalCount:0,activeCount:0,overdueCount:0},clinical:{equipmentCount:0,unitCount:0,totalCount:0,activeCount:0},finance:{fundCount:0,availableBalance:0}};
  else if(p.endsWith('/slt_module_load')){
   const module=req.postDataJSON()?.module_key;
   const dependencies=new Set([
    ...(['budget','maintenance','clinical','projects'].includes(module)?['core_units','core_sprints','core_source_unit_registry_data']:[]),
    ...(module==='budget'?['core_suppliers']:[]),
    ...(['budget','finance','projects'].includes(module)?['projects_works']:[]),
    ...(['budget','maintenance','clinical','projects','finance'].includes(module)?['core_configuration_catalog']:[]),
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
 await expect(page.getByText(/Pendências de cotação:/)).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Sprints globais',exact:true})).toHaveCount(0);
 await expect(page.locator('#globalSearch')).toHaveCount(0);
 await expect(page.locator('[data-operational-search]')).toBeVisible();
 await expect(page.locator('.operational-board-panel').getByRole('button',{name:'Visão gerencial',exact:true})).toHaveCount(0);
 await expect(page.locator('[data-operational-filter="type"] option')).toHaveText([
  'Todas','Emissão Inicial','Revisão de Orçamento','SIC',
 ]);
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 const registeredDemandTypes=await page.locator('.demand-type-option strong').allTextContents();
 const operationalDemandTypes=await page.locator('[data-operational-filter="type"] option').allTextContents();
 expect(operationalDemandTypes.slice(1)).toEqual(registeredDemandTypes);
 await page.getByRole('button',{name:'Fechar'}).click();
 await page.locator('[data-operational-filter="type"]').selectOption('SIC');
 const pendingSicCard=page.locator('.operational-board-panel article[data-id="test-demand"]');
 await expect(pendingSicCard).toBeVisible();
 await expect(pendingSicCard.locator('.demand-card-labels')).toHaveText('Urgente');
 await expect(pendingSicCard.locator('.sic-approval-badge')).toHaveCount(0);
 await expect(pendingSicCard.getByRole('button',{name:'Aprovação'})).toHaveCount(0);
 await expect(page.locator('.operational-board-panel article[data-id="test-budget-demand"]')).toHaveCount(0);
 const clearDemandFilters=page.locator('.filter-panel').getByRole('button',{name:'Limpar filtros',exact:true});
 await expect(clearDemandFilters).toBeVisible();
 await clearDemandFilters.click();
 await expect(page.locator('[data-operational-filter="type"]')).toHaveValue('');
 await expect(page.locator('.operational-board-panel article[data-id="test-budget-demand"]')).toBeVisible();
 await expect(page.locator('[data-operational-filter="status"] option')).toHaveText([
  'Todas','Fazer','Fazendo','Pausado','Aguardando Validação Sala Técnica','Aguardando Validação Obras',
  'Aguardando Aprovação Diretoria','Concluído','Cancelado',
 ]);
 const worksTabs=page.locator('nav[aria-label="Navegação interna de Obras"] .module-tab');
 await expect(worksTabs).toHaveCount(5);
 await expect(worksTabs).toHaveText(['Visão Operacional','Visão Gerencial','Visão Estratégica','Portfólio de Obras',"Estudo de SIC's"]);
 await expect(page.locator('[data-view="ev"]:visible')).toHaveCount(0);
 await page.locator('[data-view="worksManagement"]').filter({visible:true}).first().click();
 await expect(page.getByText('Retroanálise de custos por disciplina',{exact:true})).toHaveCount(0);
 await expect(page.locator('[data-action="open-benchmark-detail"]')).toHaveCount(0);
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 await page.locator('[data-module="works"]').click();
 await expect(page.getByRole('heading',{name:'Visão Operacional',exact:true})).toBeVisible();
 for(const view of ['worksOperational','worksManagement','worksStrategic','portfolio','maintenance','maintenanceOperational','maintenanceReports','clinical','budget','sics','settings']){
  await page.locator(`[data-view="${view}"]`).filter({visible:true}).first().click();
  await expect(page.locator('#app')).not.toBeEmpty();
  if(view==='portfolio'||view==='sics')await expect(page.getByRole('button',{name:'Nova SIC',exact:true})).toHaveCount(0);
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

test('operational cards prioritize the validation date until validation is sent',async({page})=>{
 const base={...structuredClone(payload.state.demands[0]),tipo:'EmissaoInicial',sicApprovalStatus:''};
 const demands=[
  {...base,id:'validation-pending',coluna:'fazer',dataPrevEnvioValidacaoObras:'2026-10-01',dataPrevistaEntrega:'2026-10-20'},
  {...base,id:'validation-sent',coluna:'validacaoObras',dataPrevEnvioValidacaoObras:'2026-10-02',dataPrevistaEntrega:'2026-10-21'},
  {...base,id:'validation-date-missing',coluna:'fazer',dataPrevEnvioValidacaoObras:'',dataPrevistaEntrega:'2026-10-22'},
 ];
 const b=await backend(page,'Admin',false,{demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const board=page.locator('.operational-board-panel');
 await expect(board.locator('article[data-id="validation-pending"] .demand-card-date')).toHaveText('Envio p/ validação: 01/10/2026');
 await expect(board.locator('article[data-id="validation-sent"] .demand-card-date')).toHaveText('Entrega prevista: 21/10/2026');
 await expect(board.locator('article[data-id="validation-date-missing"] .demand-card-date')).toHaveText('Entrega prevista: 22/10/2026');
 await expect(board.getByRole('button',{name:'Aprovação'})).toHaveCount(0);
 expect(b.errors).toEqual([]);
});

test('module switching keeps one service order per id when source and database versions overlap',async({page})=>{
 const b=await backend(page,'Admin',false,{maintenanceSourceOverlap:true});await login(page);
 await page.locator('[data-module="maintenance"]').click();
 await expect(page.getByRole('heading',{name:'Manutenção',exact:true})).toBeVisible();
 await page.locator('[data-module="clinical"]').click();
 await expect(page.getByRole('heading',{name:'Engenharia Clínica',exact:true})).toBeVisible();
 await page.locator('[data-module="maintenance"]').click();
 await expect(page.getByRole('heading',{name:'Manutenção',exact:true})).toBeVisible();
 expect(b.errors).toEqual([]);
 await expect(page.getByText(/Identificador duplicado/)).toHaveCount(0);
});

test('management view recalculates every indicator and analyst row from the filtered demands',async({page})=>{
 const demands=[
  {id:'mgmt-1',obraId:'test-work',tipo:'SIC',coluna:'fazer',analistaResponsavel:'Ana',dataPrevistaEntrega:'2099-01-01',sicIds:[]},
  {id:'mgmt-2',obraId:'test-work',tipo:'ReemissaoCompleta',coluna:'fazendo',analistaResponsavel:'Bruno',dataPrevistaEntrega:'2000-01-01',sicIds:[]},
  {id:'mgmt-3',obraId:'test-work',tipo:'EmissaoInicial',coluna:'concluido',analistaResponsavel:'Ana',dataPrevistaEntrega:'2026-09-05',dataEntregaReal:'2026-09-04',sicIds:[]},
  {id:'mgmt-4',obraId:'test-work',tipo:'SIC',coluna:'cancelado',analistaResponsavel:'Bruno',sicIds:[]},
  {id:'mgmt-5',obraId:'test-work',tipo:'EmissaoInicial',coluna:'concluido',analistaResponsavel:'Ana',dataPrevistaEntrega:'2026-09-06',sicIds:[]},
 ];
 const b=await backend(page,'Admin',false,{analystNames:['Somente no diretório'],demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="worksManagement"]').filter({visible:true}).first().click();

 const kpiValue=label=>page.locator('.kpi-card').filter({has:page.getByText(label,{exact:true})}).locator('strong');
 await expect(kpiValue('Demandas no filtro')).toHaveText('5');
 await expect(kpiValue('Dentro do prazo')).toHaveText('2 (67%)');
 await expect(kpiValue('Atrasadas')).toHaveText('1');
 await expect(kpiValue('Em fluxo')).toHaveText('2');
 await expect(kpiValue('Concluídas')).toHaveText('2');
 await expect(kpiValue('Analistas responsáveis')).toHaveText('2');
 await expect(kpiValue('Sem data suficiente')).toHaveText('1');
 await expect(page.locator('.management-tabs button')).toHaveText(['Concluídas 2','A fazer 1','Em fluxo 2','Canceladas 1','Todas 5']);

 const analystPanel=page.locator('.panel').filter({has:page.getByRole('heading',{name:'Detalhe por analista'})});
 const analystTable=analystPanel.locator('table');
 await expect(analystTable.locator('tbody tr')).toHaveCount(2);
 await expect(analystTable.locator('tbody tr').filter({hasText:'Ana'}).locator('td')).toHaveText(['Ana','3','2','2','0','100%','—','R$ 300','1']);
 await expect(analystTable).not.toContainText('Somente no diretório');

 await page.locator('.management-tabs [data-filter="todo"]').click();
 await expect(kpiValue('Demandas no filtro')).toHaveText('1');
 await expect(kpiValue('Dentro do prazo')).toHaveText('1 (100%)');
 await expect(kpiValue('Analistas responsáveis')).toHaveText('1');
 await expect(page.locator('.panel').filter({has:page.getByRole('heading',{name:'Demandas por analista'})})).toContainText('Ana');
 await expect(analystPanel.locator('tbody tr')).toHaveCount(1);
 expect(b.errors).toEqual([]);
});

test('strategic view sums discipline values exactly and recalculates every indicator from its filters',async({page})=>{
 const evRecords=[
  {id:'strategic-1',code:'EV-001',project:'Hospital Estratégico A - SP',year:2025,date:'2025-06-01',revision:'REV01',typology:'Hospital',technician:'Técnico A',area:100,total:1000,baseTotal:1000,disciplines:{'instalacoes-de-climatizacao-e-exaustao':120,'equipamentos-de-climatizacao':80,'adequacoes-civis':800},items:[]},
  {id:'strategic-2',code:'EV-002',project:'Hospital Estratégico B - RJ',year:2024,date:'2024-06-01',revision:'REV01',typology:'Hospital',technician:'Técnico B',area:50,total:500,baseTotal:500,disciplines:{'instalacoes-de-climatizacao-e-exaustao':-20,'equipamentos-de-climatizacao':50,'adequacoes-civis':470},items:[]},
 ];
 const b=await backend(page,'Admin',false,{evRecords});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="worksStrategic"]').filter({visible:true}).first().click();

 await expect(page.getByRole('heading',{name:'Investimento por disciplina'})).toBeVisible();
 const table=page.locator('.strategic-discipline-table');
 const climateRow=table.locator('tbody tr').filter({hasText:'Instalações de Climatização e Exaustão'});
 await expect(climateRow.locator('td')).toHaveText([
  /Instalações de Climatização e Exaustão/,'R$ 100,00','6,1%','2','66,7%','R$ 50,00','R$ 50,00','R$ 0,67\/m²',
 ]);

 await climateRow.getByRole('button',{name:'Instalações de Climatização e Exaustão'}).click();
 const detail=page.locator('.strategic-discipline-detail');
 await expect(detail).toContainText('R$ 100,00');
 await expect(detail).toContainText('6,67% do total filtrado');
 await expect(detail.locator('.strategic-project-ranking tbody tr')).toHaveCount(2);
 await expect(detail.locator('.strategic-project-ranking tbody tr').first().locator('td').nth(3)).toHaveText('R$ 120,00');

 await page.locator('[data-strategic-ev-filter="year"]').selectOption('2025');
 await expect(page.locator('.strategic-analysis-scope')).toContainText('1 de 3 EVs');
 await expect(page.locator('.strategic-discipline-detail')).toContainText('R$ 120,00');
 await expect(page.locator('.strategic-project-ranking tbody tr')).toHaveCount(1);
 await page.screenshot({path:'outputs/strategic-analysis-audit.png',fullPage:true,animations:'disabled'});
 expect(b.errors).toEqual([]);
});

test('analyst edits and moves existing demands but cannot create or delete them',async({page})=>{
 const b=await backend(page,'Analista',false,{analystCanWrite:true});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await expect(page.locator('[data-action="open-demand"]')).toBeHidden();
 await page.locator('[data-action="open-demand-detail"][data-id="test-budget-demand"]').first().click();
 const detail=page.locator('#demandDetailForm');
 await expect(detail).toBeVisible();
 await expect(detail.locator('[data-action="open-delete-demand"]')).toBeHidden();
 await detail.locator('[name="observacao"]').fill('Descrição ajustada pelo analista');
 await detail.locator('[name="nota"]').fill('Ajuste permitido ao analista');
 await detail.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect.poll(()=>b.requests.some(request=>request.changes.some(change=>change.entity==='budget_demands'&&change.key==='test-budget-demand'&&change.operation==='upsert'))).toBe(true);

 await page.locator('[data-module="maintenance"]').click();
 await expect(page.locator('[data-action="open-maintenance-demand"]')).toBeHidden();
 await page.locator('[data-module="clinical"]').click();
 await expect(page.locator('[data-action="open-maintenance-demand"]')).toBeHidden();
 await expect(page.locator('[data-action="create-clinical-demand-for-asset"]')).toBeHidden();
 expect(b.errors).toEqual([]);
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
 await page.getByRole('button',{name:'Editar analista Analista Novo'}).click();
 const analystEditDialog=page.locator('#teamAnalystForm');
 await analystEditDialog.locator('[name="nome"]').fill('Analista Editado');
 await analystEditDialog.getByRole('button',{name:'Salvar alterações',exact:true}).click();
 await expect(page.locator('.analysts-panel tbody')).toContainText('Analista Editado');
 await expect(page.locator('.analysts-panel tbody')).not.toContainText('Analista Novo');

 await page.locator('[data-team-action="create"]').click();
 const userDialog=page.locator('#teamAccountForm');
 await expect(userDialog.locator('[name="analyst_id"] option')).toContainText(['Sem vínculo','Analista Editado']);
 await expect(userDialog.locator('[name="new_analyst"]')).toHaveCount(0);
 await userDialog.locator('[data-team-close]').first().click();

 await page.getByRole('button',{name:'Obras',exact:true}).click();
 await expect(page.locator('[data-operational-filter="analyst"] option')).toContainText(['Todos','Analista Editado']);
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.getByRole('button',{name:/Emissão Inicial/}).click();
 await expect(page.locator('#demandWizardStep1 .analyst-chip')).toContainText(['Sem analista','Analista Editado']);
 await page.locator('#demandWizardStep1 [data-action="close-modal"]').first().click();
 await page.locator('[data-module="maintenance"]').click();
 await page.locator('[data-view="maintenanceOperational"]').filter({visible:true}).first().click();
 await expect(page.locator('[data-maintenance-filter="analyst"] option')).toContainText(['Todos','Analista Editado']);
 await page.locator('[data-module="clinical"]').click();
 await page.locator('[data-view="clinicalOperational"]').filter({visible:true}).first().click();
 await expect(page.locator('[data-maintenance-filter="analyst"] option')).toContainText(['Todos','Analista Editado']);
 expect(b.errors).toEqual([]);
});

test('configuration catalogs can be created and edited and feed work and EV forms',async({page})=>{
 const b=await backend(page);await login(page);
 await page.locator('[data-view="settings"]').filter({visible:true}).first().click();
 const catalogs=page.locator('.configuration-catalog-card');
 await expect(catalogs).toHaveCount(6);
 await expect(catalogs.locator('h3')).toHaveText(['Disciplinas do EV','Categorias de obra','Tipologias de obra','Anos de obra','Regiões','Estados']);
 for(const type of ['discipline','category','typology','year','region','state']){
  await expect(page.locator(`[data-configuration-type="${type}"]`).getByRole('button',{name:'Novo'})).toBeVisible();
 }

 const categoryCard=page.locator('[data-configuration-type="category"]');
 await categoryCard.getByRole('button',{name:'Novo'}).click();
 await page.locator('#configurationCatalogForm [name="label"]').fill('Categoria Configurável');
 await page.locator('#configurationCatalogForm').getByRole('button',{name:'Criar item'}).click();
 const createdCategory=categoryCard.locator('.configuration-catalog-item').filter({hasText:'Categoria Configurável'});
 await expect(createdCategory).toBeVisible();
 await createdCategory.getByRole('button',{name:'Editar'}).click();
 await page.locator('#configurationCatalogForm [name="label"]').fill('Categoria Editada');
 await page.locator('#configurationCatalogForm').getByRole('button',{name:'Salvar alterações'}).click();
 await expect(categoryCard).toContainText('Categoria Editada');
 await expect(categoryCard).not.toContainText('Categoria Configurável');

 const disciplineCard=page.locator('[data-configuration-type="discipline"]');
 await expect(disciplineCard).not.toContainText('Instalações de SPDA');
 await expect(disciplineCard.locator('.configuration-catalog-item').filter({hasText:'Instalações Elétricas e SPDA'})).toHaveCount(1);
 await expect(disciplineCard).toContainText('Site Planning');
 await expect(disciplineCard).toContainText('Diversos');
 await disciplineCard.getByRole('button',{name:'Novo'}).click();
 const disciplineForm=page.locator('#configurationCatalogForm');
 await disciplineForm.locator('[name="label"]').fill('Disciplina Configurável');
 await disciplineForm.locator('[name="code"]').fill('disciplina-configuravel');
 await disciplineForm.locator('[name="category"]').selectOption('CustosDaObra');
 await disciplineForm.getByRole('button',{name:'Criar item'}).click();
 await expect(disciplineCard).toContainText('Disciplina Configurável');
 await expect.poll(()=>b.requests.some(request=>request.changes.some(change=>change.entity==='core_configuration_catalog'))).toBe(true);

 const typologyLabels=page.locator('[data-configuration-type="typology"] .configuration-catalog-item strong');
 await expect(typologyLabels).toHaveText(['Nova Unidade','Retrofit','Ampliação UE']);
 const stateCard=page.locator('[data-configuration-type="state"]');
 await expect(stateCard.locator('.configuration-catalog-item strong')).toHaveText([
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
 ]);
 await expect(stateCard).not.toContainText('Acre');

 await page.getByRole('button',{name:'Obras',exact:true}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 await page.getByRole('button',{name:'+ Nova obra',exact:true}).click();
 await expect(page.locator('#classificacaoOptions option[value="Categoria Editada"]')).toHaveCount(1);
 await expect(page.locator('#classificacaoOptions option[value="Venda de Serviço"]')).toHaveCount(1);
 await expect(page.locator('#classificacaoOptions option[value="Venda de Serviços"]')).toHaveCount(0);
 await expect(page.locator('#classificacaoOptions option[value="Ambiental"]')).toHaveCount(0);
 await expect(page.locator('#classificacaoOptions option[value="Não informada"]')).toHaveCount(0);
 expect(await page.locator('#tipologiaOptions option').evaluateAll(options=>options.map(option=>option.value))).toEqual(['Nova Unidade','Retrofit','Ampliação UE']);
 await page.locator('#workForm [data-action="close-modal"]').first().click();
 await expect(page.locator('#cloudStatus')).toHaveText('Salvo no banco');
 await page.getByRole('button',{name:'Obras',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Visão Operacional',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await expect(page.locator('.demand-type-card')).toBeVisible();
 await page.locator('.demand-type-option[data-type="SIC"]').click();
 await expect(page.locator('#demandForm [name="disciplinaId"] option[value="disciplina-configuravel"]')).toHaveText(/Disciplina Configurável/);
 await expect(page.locator('#demandForm [data-demand-project]')).toHaveCount(9);
 await expect(page.locator('#demandForm [data-demand-project="DC"]')).toHaveCount(0);
 await page.locator('#demandForm [data-action="close-modal"]').first().click();
 await expect(page.getByRole('button',{name:'Nova SIC',exact:true})).toHaveCount(0);
 expect(b.errors).toEqual([]);
});

test('new demands suggest the historical analyst, persist labels and give SICs a 15-day due date',async({page})=>{
 const b=await backend(page,'Admin',false,{archivedDemandIds:['DEM-021'],analystNames:['Técnico A']});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.getByRole('button',{name:/Emissão Inicial/}).click();
 const step1=page.locator('#demandWizardStep1');
 await expect(step1).toBeVisible();
 await expect(step1.getByText('Contexto da unidade',{exact:true})).toHaveCount(0);
 await expect(step1.getByText('Classificação',{exact:true})).toHaveCount(0);
 await expect(step1.locator('[name="descricao"]')).not.toHaveAttribute('required','');
 await expect(step1.locator('[name="analistasSelecionados"]')).toHaveValue('[]');

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
 await expect(step1.locator('[name="analistasSelecionados"]')).toHaveValue('["Técnico A"]');
 await step1.getByRole('button',{name:/Avançar/}).click();
 await expect(page.locator('#demandForm')).toBeVisible();
 await expect(page.locator('#formError')).not.toContainText('Selecione uma obra válida');
 await page.locator('#demandForm [name="etiquetas"]').fill('Urgente, Diretoria');
 await page.locator('#demandForm').getByRole('button',{name:'Salvar demanda',exact:true}).click();
 const createdCard=page.locator('.demand-card').filter({hasText:'Obra histórica Norte - AM'});
 await expect(createdCard).toBeVisible();
 await expect(createdCard).toContainText('DEM-022');
 await expect(createdCard.locator('.demand-card-labels')).toHaveText(/Urgente.*Diretoria/);
 await expect(page.locator('#cloudStatus')).toHaveText('Salvo no banco');
 const createdChange=b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='DEM-022');
 expect(createdChange?.document?.analistaResponsavel).toBe('Técnico A');
 expect(createdChange?.document?.etiquetas).toEqual(['Urgente','Diretoria']);
 expect(b.requests.flatMap(request=>request.changes).some(change=>change.entity==='budget_demands'&&change.key==='DEM-021')).toBe(false);

 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.locator('.demand-type-option[data-type="SIC"]').click();
 const sicForm=page.locator('#demandForm');
 await sicForm.locator('[data-sic-work-search]').fill('Obra histórica Norte');
 await sicForm.locator('[data-sic-work-results]').getByRole('button',{name:/Obra histórica Norte/}).click();
 await expect(sicForm.locator('[name="analistasSelecionados"]')).toHaveValue('["Técnico A"]');
 const today=await page.evaluate(()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'}));
 const due=await sicForm.locator('[name="dataPrevistaEntrega"]').inputValue();
 expect((Date.parse(`${due}T00:00:00Z`)-Date.parse(`${today}T00:00:00Z`))/86400000).toBe(15);
 expect(b.errors).toEqual([]);
});

test('first selected analyst leads and every involved discipline persists its posting details',async({page})=>{
 const b=await backend(page,'Admin',false,{analystNames:['Ana','Bruno','Carla']});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.getByRole('button',{name:/Emissão Inicial/}).click();
 const step1=page.locator('#demandWizardStep1');
 const analysts=step1.locator('[data-demand-analyst-selector]');
 await analysts.locator('label.analyst-chip').filter({hasText:'Bruno'}).click();
 await analysts.locator('label.analyst-chip').filter({hasText:'Ana'}).click();
 await analysts.locator('label.analyst-chip').filter({hasText:'Carla'}).click();
 await expect(analysts.locator('[data-demand-analyst-summary]')).toHaveText('Líder: Bruno · Complementares: Ana, Carla');
 await step1.locator('[name="obraBusca"]').fill('Obra de teste');
 await step1.getByRole('button',{name:/Avançar/}).click();

 const step2=page.locator('#demandForm');
 await expect(step2.getByText('Projetos envolvidos',{exact:true})).toBeVisible();
 const projectItems=step2.locator('[data-demand-project]');
 await expect(projectItems).toHaveCount(9);
 await expect(projectItems.locator('summary')).toHaveText(['ARQ','ELE','HID','ELO','SUB','GMD','SCI','CLI','SPDA']);
 expect(await projectItems.locator('summary').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('title')))).toEqual([
  'Arquitetura','Instalações Elétricas','Instalações Hidrosanitárias','Instalações de Dados e Voz','Subestação',
  'Instalações de Gases Medicinais','Sistema de Combate a Incêndio','Instalações de Climatização e Exaustão','Instalações de SPDA',
 ]);
 const architecture=step2.locator('[data-demand-project="ARQ"]');
 await architecture.locator('summary').click();
 await architecture.locator('[name="projetosEnvolvidos"]').check();
 await architecture.locator('[data-project-posting-owner]').fill('Bruno');
 await architecture.locator('[data-project-posting-date]').fill('2026-09-10');
 await architecture.locator('[data-project-file-location]').fill('SharePoint/Projetos/ARQ');
 const electrical=step2.locator('[data-demand-project="ELE"]');
 await electrical.locator('summary').click();
 await electrical.locator('[name="projetosEnvolvidos"]').check();
 await electrical.locator('[data-project-posting-owner]').fill('Ana');
 await electrical.locator('[data-project-posting-date]').fill('2026-09-11');
 await electrical.locator('[data-project-file-location]').fill('SharePoint/Projetos/ELE');
 await step2.getByRole('button',{name:'Salvar demanda',exact:true}).click();
 await expect.poll(()=>{
  const change=b.requests.flatMap(request=>request.changes).find(item=>item.entity==='budget_demands'&&item.document?.analistaResponsavel==='Bruno');
  return change?{
   leader:change.document.analistaResponsavel,
   complementary:change.document.analistasComplementares,
   projects:change.document.projetosEnvolvidos,
   projectDetails:change.document.projetosEnvolvidosDetalhes,
  }:null;
 }).toEqual({
  leader:'Bruno',
  complementary:['Ana','Carla'],
  projects:['ARQ','ELE'],
  projectDetails:{
   ARQ:{responsavelPostagem:'Bruno',dataPostagem:'2026-09-10',localArquivo:'SharePoint/Projetos/ARQ'},
   ELE:{responsavelPostagem:'Ana',dataPostagem:'2026-09-11',localArquivo:'SharePoint/Projetos/ELE'},
  },
 });

 const saved=b.requests.flatMap(request=>request.changes).find(item=>item.entity==='budget_demands'&&item.document?.analistaResponsavel==='Bruno');
 await page.locator(`[data-action="open-demand-detail"][data-id="${saved.document.id}"]`).click();
 const detail=page.locator('#demandDetailForm');
 const contextGrid=detail.locator('.demand-context-grid');
 await expect(contextGrid).toBeVisible();
 expect(await contextGrid.locator('.split-item').first().evaluate(node=>({display:getComputedStyle(node).display,textAlign:getComputedStyle(node.querySelector('span')).textAlign}))).toEqual({display:'grid',textAlign:'left'});
 await expect(detail.locator('[data-demand-analyst-summary]')).toHaveText('Líder: Bruno · Complementares: Ana, Carla');
 await expect(detail.locator('[name="projetosEnvolvidos"][value="ARQ"]')).toBeChecked();
 await expect(detail.locator('[name="projetosEnvolvidos"][value="ELE"]')).toBeChecked();
 await expect(detail.locator('[data-demand-project="ARQ"] [data-project-posting-owner]')).toHaveValue('Bruno');
 await expect(detail.locator('[data-demand-project="ARQ"] [data-project-posting-date]')).toHaveValue('2026-09-10');
 await expect(detail.locator('[data-demand-project="ARQ"] [data-project-file-location]')).toHaveValue('SharePoint/Projetos/ARQ');
 await detail.locator('.modal-actions').getByRole('button',{name:'Fechar',exact:true}).click();

 await page.getByRole('button',{name:'Manutenção',exact:true}).click();
 await page.locator('[data-view="maintenanceOperational"]').filter({visible:true}).first().click();
 await page.locator('[data-action="open-maintenance-demand"]').click();
 await expect(page.locator('#maintenanceDemandForm [data-demand-analyst-selector]')).toBeVisible();
 await page.locator('#maintenanceDemandForm [data-action="close-modal"]').first().click();

 await page.getByRole('button',{name:'Eng. Clínica',exact:true}).click();
 await page.locator('[data-view="clinicalOperational"]').filter({visible:true}).first().click();
 await page.locator('[data-action="open-maintenance-demand"]').click();
 await expect(page.locator('#maintenanceDemandForm [data-demand-analyst-selector]')).toBeVisible();
 expect(b.errors).toEqual([]);
});

test('analyst chips use the configured spelling without case duplicates',async({page})=>{
 const demand={...structuredClone(payload.state.demands[1]),analistaResponsavel:'SKARTH'};
 const b=await backend(page,'Admin',false,{analystNames:['Skarth'],demandRecords:[demand]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('.operational-board-panel [data-action="open-demand-detail"][data-id="test-budget-demand"]').first().click();
 const detail=page.locator('#demandDetailForm');
 await expect(detail.locator('[data-demand-analyst-option][value="Skarth"]')).toHaveCount(1);
 await expect(detail.locator('[data-demand-analyst-option][value="SKARTH"]')).toHaveCount(0);
 await expect(detail.locator('[data-demand-analyst-summary]')).toHaveText('Líder: Skarth · Complementares: Nenhum');
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
 await expect(metric('Percentual de SICs / Aditivos')).toContainText('15,00%');
 await expect(metric('SICs / Aditivos')).toHaveClass(/mini-metric--alert/);
 await expect(metric('Percentual de SICs / Aditivos')).toHaveClass(/mini-metric--alert/);
 await expect(metric('Percentual sobre o EV original')).toHaveCount(0);
 await expect(modal.locator('.ev-historical-summary')).not.toContainText('Filhas da coluna F');
 const title=modal.locator('#historicalEVTitle');
 await title.click(); // Also checks that the site header does not cover the title.
 await page.screenshot({path:'outputs/ev-summary-layout.png',fullPage:false});
 await modal.getByRole('button',{name:'Fechar',exact:true}).click();
 const safeRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:'Obra histórica Sul'});
 await safeRow.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(metric('SICs / Aditivos')).toContainText('R$ 20');
 await expect(metric('Percentual de SICs / Aditivos')).toContainText('3,85%');
 await expect(metric('SICs / Aditivos')).toHaveClass(/mini-metric--warning/);
 await expect(metric('Percentual de SICs / Aditivos')).toHaveClass(/mini-metric--warning/);
 await modal.getByRole('button',{name:'Fechar',exact:true}).click();
 await page.setViewportSize({width:390,height:844});
 await row.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await title.click();
 await modal.getByRole('button',{name:'Fechar',exact:true}).click();
 expect(b.errors).toEqual([]);
});

test('portfolio rows expose only the unified EV action and work editing',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const rows=page.locator('.portfolio-works-table tbody tr');
 const historical=rows.filter({hasText:'Obra histórica Norte'});
 await expect(historical.locator('.portfolio-actions button')).toHaveText(['Abrir EV','Editar Obra']);
 await historical.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('#historicalEVTitle')).toHaveText('Obra histórica Norte - AM');
 await expect(page.locator('.ev-historical-modal')).toContainText('REV02');
 await expect(page.locator('.ev-historical-modal').getByRole('button',{name:'Reajustar INCC',exact:true})).toBeVisible();
 await expect(page.locator('.ev-historical-modal').getByRole('button',{name:'Editar EV',exact:true})).toBeVisible();
 await page.locator('.ev-historical-modal').getByRole('button',{name:'Fechar',exact:true}).click();
 const current=rows.filter({hasText:'Obra de teste'});
 await expect(current.locator('.portfolio-actions button')).toHaveText(['Abrir EV','Editar Obra']);
 await current.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('#evModalTitle')).toHaveText('Obra de teste');
 await expect(page.locator('.ev-version-panel')).toContainText('REV01');
 expect(await page.locator('#evForm .ev-line-row').count()).toBeGreaterThan(4);
 await expect(page.locator('.ev-modal-card').getByRole('button',{name:'Reajustar INCC',exact:true})).toBeVisible();
 await page.locator('.ev-modal-card').getByRole('button',{name:'Fechar',exact:true}).click();
 const empty=rows.filter({hasText:'Obra nova sem EV'});
 await expect(empty.locator('.portfolio-actions button')).toHaveText(['Criar EV','Editar Obra']);
 await empty.getByRole('button',{name:'Criar EV',exact:true}).click();
 await expect(page.locator('#evModalTitle')).toHaveText('Obra nova sem EV');
 expect(await page.locator('#evForm .ev-line-row').count()).toBeGreaterThan(4);
 await expect(page.locator('.ev-modal-card').getByRole('button',{name:'Reajustar INCC',exact:true})).toHaveCount(0);
 await page.locator('#evForm [name="evAreaConstruida"]').fill('75');
 await page.locator('#evForm').getByRole('button',{name:'Salvar rascunho',exact:true}).click();
 await expect(page.locator('#cloudStatus')).toHaveText('Salvo no banco');
 await page.locator('.ev-modal-card').getByRole('button',{name:'Fechar',exact:true}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const updatedEmpty=page.locator('.portfolio-works-table tbody tr').filter({hasText:'Obra nova sem EV'});
 await expect(updatedEmpty.locator('td').nth(10)).toHaveText('75,00');
 await expect(updatedEmpty.locator('.portfolio-actions button')).toHaveText(['Abrir EV','Editar Obra']);
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
 await expect(page.locator('[data-portfolio-quick-filter="tipologia"] option')).toHaveText(['Todas','Nova Unidade','Retrofit','Ampliação UE']);
 const categoryFilter=page.locator('[data-portfolio-quick-filter="categoria"]');
 await expect(categoryFilter).not.toContainText('Ambiental');
 await expect(categoryFilter).not.toContainText('Outros');
 await expect(categoryFilter).not.toContainText('Não informada');
 await expect(categoryFilter).not.toContainText('Histórico importado');
 await expect(categoryFilter).not.toContainText('Venda de Serviços');
 await expect(page.locator('[data-portfolio-quick-filter="uf"] option')).toHaveText([
  'Todas','AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
 ]);
 await expect(page.getByRole('button',{name:'Limpar filtros',exact:true})).toBeVisible();
 await expect(page.locator('.portfolio-works-table thead th')).toContainText([
  'Código','Nome da obra','Estado','Região','Ano','Tipologia','Categoria','CNPJ','Endereço',
  'Área equivalente (m²)','Área construída (m²)','Tempo de obra (dias)','Total orçado','Custo por m²','Ações',
 ]);
 await expect(page.locator('.portfolio-works-table thead [data-action="sort-generic-table"]')).toHaveCount(0);
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
 await expect(historicalRow.locator('td').nth(5)).toBeEmpty();
 await expect(historicalRow.locator('td').nth(9)).toHaveText('200,00');
 await expect(historicalRow.locator('td').nth(10)).toHaveText('200,00');
 await expect(historicalRow.locator('td').nth(12)).toHaveText('R$ 1.000,00');
 await expect(historicalRow.locator('td').nth(13)).toHaveText('R$ 5,00');
 await expect(historicalRow.locator('.portfolio-actions button')).toHaveText(['Abrir EV','Editar Obra']);
 await historicalRow.getByRole('button',{name:'Editar Obra'}).click();
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
 await expect(page.locator('.ev-historical-modal').getByRole('button',{name:'Reajustar INCC'})).toBeVisible();
 await page.locator('.ev-historical-modal').getByRole('button',{name:'Fechar',exact:true}).click();
 const currentRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:'Obra de teste'});
 await expect(currentRow.locator('td').nth(2)).toHaveText('SP');
 await expect(currentRow.locator('td').nth(3)).toHaveText('Sudeste');
 await expect(currentRow.locator('td').nth(4)).toHaveText('2026');
 await expect(currentRow.locator('td').nth(5)).toBeEmpty();
 await expect(currentRow.locator('td').nth(6)).toHaveText('Venda de Serviço');
 await expect(currentRow.locator('td').nth(9)).toHaveText('100,00');
 await expect(currentRow.locator('td').nth(10)).toHaveText('100,00');
 await expect(currentRow.locator('td').nth(11)).toHaveText('120');
 await expect(currentRow.locator('td').nth(12)).toHaveText('R$ 150,00');
 await expect(currentRow.locator('td').nth(13)).toHaveText('R$ 1,50');
 await expect(currentRow.locator('.portfolio-actions button')).toHaveText(['Abrir EV','Editar Obra']);
 await currentRow.getByRole('button',{name:'Editar Obra'}).click();
 const currentWorkForm=page.locator('#workForm');
 await expect(currentWorkForm.getByRole('heading',{name:'Editar obra'})).toBeVisible();
 await currentWorkForm.locator('[name="endereco"]').fill('Rua editada, 100');
 await currentWorkForm.getByRole('button',{name:'Salvar alterações'}).click();
 await expect(currentRow.locator('td').nth(8)).toHaveText('Rua editada, 100');
 await expect.poll(()=>b.requests.some(request=>request.changes.some(change=>change.entity==='projects_works'&&change.document.endereco==='Rua editada, 100'))).toBe(true);
 const noEvRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:'Obra nova sem EV'});
 await expect(noEvRow.locator('td').nth(5)).toHaveText('Retrofit');
 await expect(noEvRow.locator('td').nth(6)).toBeEmpty();
 await expect(noEvRow.locator('td').nth(10)).toBeEmpty();
 await expect(noEvRow.locator('td').nth(12)).toBeEmpty();
 await expect(noEvRow.locator('td').nth(13)).toBeEmpty();
 await expect(noEvRow.locator('.portfolio-actions button')).toHaveText(['Criar EV','Editar Obra']);
 const ambiguousPaRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:'ADM Barro Preto Timbiras'});
 await expect(ambiguousPaRow.locator('td').nth(2)).toBeEmpty();
 await expect(ambiguousPaRow.locator('td').nth(3)).toBeEmpty();
 await expect(page.locator('.portfolio-works-table')).toHaveCount(1);
 await expect(page.locator('.ev-unified-table')).toHaveCount(0);
 const portfolioTopScroll=page.getByRole('scrollbar',{name:'Rolagem horizontal da carteira de obras'});
 await expect(portfolioTopScroll).toBeVisible();
 const [scrollBox,tableBox]=await Promise.all([portfolioTopScroll.boundingBox(),page.locator('.portfolio-works-table').boundingBox()]);
 expect(scrollBox.y+scrollBox.height).toBeLessThanOrEqual(tableBox.y);
 await page.locator('[data-view="worksStrategic"]').filter({visible:true}).first().click();
 await expect(page.locator('.portfolio-works-table')).toHaveCount(0);
 await expect(page.locator('.ev-unified-table')).toHaveCount(0);
 await expect(page.locator('.strategic-intelligence-table')).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'A lista única de obras e EVs fica no Portfólio de Obras'})).toBeVisible();
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
