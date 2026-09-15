import {test,expect} from '@playwright/test';
import {flattenPayload,ENTITY_BY_NAME} from '../../src/module-model.js';
import * as XLSX from 'xlsx';

const id='11111111-1111-4111-8111-111111111111';
const payload={state:{
  works:[
    {id:'test-work',nome:'Obra de teste',codigoOriginal:'TEST',uf:'São Paulo - Sudeste',cidade:'São Paulo',tipoUnidade:'Clínica',classificacaoObra:'Venda de Serviços',tipologiaObra:'Reforma',anoObra:'2026',prazoDias:120,areaConstruida:100,areaEquivalente:100,ev:{id:'test-ev',status:'Rascunho',versaoAtual:1,lines:[{disciplinaId:'instalacoes-eletricas-e-spda',valorOrcado:100},{disciplinaId:'instalacoes-de-spda',valorOrcado:50}],versions:[],sicIds:[],demandaIds:[]}},
    {id:'work-without-ev',nome:'Obra nova sem EV',codigoOriginal:'',uf:'RN',cidade:'Natal',tipoUnidade:'Hospital',classificacaoObra:'Outros',tipologiaObra:'Retrofit',areaConstruida:0,areaEquivalente:0},
  ],
  evs:[
    {id:'evh-test-1',code:'HIST-1',project:'Obra histórica Norte - AM',year:2025,date:'2025-06-01',revision:'REV02',typology:'Hospital',technician:'Técnico A',area:200,total:1000,baseTotal:950,disciplines:{'adequacoes-civis':800,'taxa-risco':50,sics:150},items:[]},
    {id:'evh-test-2',code:'HIST-2',project:'Obra histórica Sul - RS',year:2024,date:'2024-05-01',revision:'REV01',typology:'Clínica e Medicina Preventiva',technician:'Técnico B',area:100,total:520,baseTotal:500,disciplines:{'adequacoes-civis':500,sics:20},items:[]},
    {id:'evh-test-3',code:'HIST-3',project:'ADM Barro Preto Timbiras - 2° PA',year:2024,date:'2024-04-01',revision:'REV01',typology:'Pronto Atendimento',technician:'Técnico C',area:80,total:400,baseTotal:400,disciplines:{'adequacoes-civis':400},items:[]},
  ],
  demands:[
    {id:'test-demand',obraId:'test-work',titulo:'Demanda de teste',tipo:'SIC',coluna:'fazer',etiquetas:['Urgente'],sicApprovalStatus:'Pendente',sicMetadata:{tituloSic:'Teste',obraNome:'Obra de teste',lecomNumber:'TEST-1'},sicDraftDisciplines:[],anexos:[],sicIds:[]},
    {id:'test-budget-demand',obraId:'test-work',titulo:'Orçamento de teste',tipo:'EmissaoInicial',coluna:'validacaoObras',sicIds:[],anexos:[]},
  ],
  sicApprovalWorks:[{id:'approval-test',descricao:'Obra SIC de teste',classificacao:'Teste',oiList:['TEST'],oiAliases:['TEST'],sics:[{id:'sic-test',lecom:'TEST',descricao:'SIC de teste',valor:20,weekId:'w-test',status:'pendente'}],ev:{semAditivos:100,aditivosAprovados:0,total:100,areaM2:10,valorM2:10},sap:{atribuidoAtual:120,comprometidoAtual:80,faturasAnosAnteriores:0},historyEvents:[],lastWeekId:'w-test'}],
  sicApprovalWeeks:[{id:'w-test',label:'Semana teste',start:'2026-09-01',end:'2026-09-07'}],sicApprovalSnapshots:[],
},datasets:{}};

async function backend(page,role='Admin',malicious=false,{maintenanceSourceOverlap=false,analystCanWrite=false,analystNames=[],archivedDemandIds=[],demandRecords=null,evRecords=null,workRecords=null,sprintRecords=null,fundRecords=null,failFinanceCommit=false}={}){
 const input=structuredClone(payload);
 if(Array.isArray(workRecords))input.state.works=workRecords;
 if(Array.isArray(demandRecords))input.state.demands=demandRecords;
 if(Array.isArray(evRecords))input.state.evs=evRecords;
 if(Array.isArray(sprintRecords))input.state.sprints=sprintRecords;
 if(Array.isArray(fundRecords))input.state.funds=fundRecords;
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
   if(failFinanceCommit&&body.changes.some(change=>change.entity.startsWith('finance_'))){
    await route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({message:'permission denied for finance_funds',code:'42501'})});
    return;
   }
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
 const supportMount=page.locator('#supportAssistantMount');
 await expect(supportMount.getByRole('button',{name:/^Suporte360/})).toBeVisible();
 const supportLauncher=supportMount.locator('.haptec-launcher');
 await expect(supportLauncher).toHaveCSS('cursor','pointer');
 const supportAnimationNames=await supportLauncher.evaluate(element=>{
  const nodes=[element,...element.querySelectorAll('*')];
  return nodes.flatMap(node=>[
   getComputedStyle(node).animationName,
   getComputedStyle(node,'::before').animationName,
   getComputedStyle(node,'::after').animationName,
  ]);
 });
 expect([...new Set(supportAnimationNames)]).toEqual(['none']);
 await expect(supportMount.locator('[data-haptec-drag-handle]')).toHaveCount(0);
 await expect(page.getByText('Haptec360',{exact:true})).toHaveCount(0);
 expect(await supportMount.evaluate(element=>element.closest('.app-header')!==null)).toBe(true);
 await supportMount.getByRole('button',{name:/^Suporte360/}).click();
 await expect(supportMount.locator('.haptec-panel')).toBeVisible();
 await supportMount.getByRole('button',{name:'Minimizar Suporte360'}).click();
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
 await expect(page.locator('[data-kpi="opTotal"]')).toContainText('Total no Filtro');
 await expect(page.getByText('Total na sprint',{exact:true})).toHaveCount(0);
 await expect(page.locator('.operational-board-panel').getByRole('button',{name:'Visão gerencial',exact:true})).toHaveCount(0);
 const typeFilter=page.locator('[data-operational-filter-group="type"]');
 await expect(typeFilter.locator('.operational-multiselect-menu span')).toHaveText([
  'Emissão Inicial','Revisão de Orçamento','Demanda Extra','SIC',
 ]);
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 const registeredDemandTypes=await page.locator('.demand-type-option strong').allTextContents();
 const operationalDemandTypes=await typeFilter.locator('.operational-multiselect-menu span').allTextContents();
 expect(operationalDemandTypes).toEqual(registeredDemandTypes);
 await page.getByRole('button',{name:'Fechar'}).click();
 await typeFilter.locator('summary').click();
 await typeFilter.locator('[data-operational-filter="type"][value="SIC"]').check();
 const pendingSicCard=page.locator('.operational-board-panel article[data-id="test-demand"]');
 await expect(pendingSicCard).toBeVisible();
 await expect(pendingSicCard.locator('.demand-card-labels')).toHaveText('Urgente');
 await expect(pendingSicCard.locator('.sic-approval-badge')).toHaveCount(0);
 await expect(pendingSicCard.getByRole('button',{name:'Aprovação'})).toHaveCount(0);
 await expect(page.locator('.operational-board-panel article[data-id="test-budget-demand"]')).toHaveCount(0);
 await page.locator('[data-operational-filter-group="type"] [data-operational-filter="type"][value="EmissaoInicial"]').check();
 await expect(page.locator('.operational-board-panel article[data-id="test-budget-demand"]')).toBeVisible();
 const clearDemandFilters=page.locator('.filter-panel').getByRole('button',{name:'Limpar filtros',exact:true});
 await expect(clearDemandFilters).toBeVisible();
 await clearDemandFilters.click();
 await expect(page.locator('[data-operational-filter]:checked')).toHaveCount(0);
 await expect(page.locator('.operational-board-panel article[data-id="test-budget-demand"]')).toBeVisible();
 const analystFilter=page.locator('[data-operational-filter-group="analyst"]');
 await expect(analystFilter.locator('.operational-multiselect-menu span')).toHaveText(['Sem analista']);
 await analystFilter.locator('summary').click();
 await analystFilter.locator('[data-operational-filter="analyst"][value="__sem_analista__"]').check();
 await expect(page.locator('.operational-board-panel article')).toHaveCount(2);
 await clearDemandFilters.click();
 await expect(page.locator('[data-operational-filter-group="status"]')).toHaveCount(0);
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

test('operational proximity alert uses only the next 24-hour date window for validation and delivery',async({page})=>{
 const saoDate=(offsetDays)=>{
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()+offsetDays*86400000));
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${values.year}-${values.month}-${values.day}`;
 };
 const base={...structuredClone(payload.state.demands[1]),tipo:'EmissaoInicial',sicApprovalStatus:'',dataPrevistaEntrega:saoDate(10)};
 const demands=[
  {...base,id:'validation-next-day',coluna:'fazer',dataPrevEnvioValidacaoObras:saoDate(1)},
  {...base,id:'validation-two-days',coluna:'fazer',dataPrevEnvioValidacaoObras:saoDate(2)},
  {...base,id:'delivery-next-day',coluna:'validacaoObras',dataPrevEnvioValidacaoObras:saoDate(1),dataPrevistaEntrega:saoDate(1)},
  {...base,id:'delivery-two-days',coluna:'validacaoObras',dataPrevEnvioValidacaoObras:saoDate(1),dataPrevistaEntrega:saoDate(2)},
 ];
 const b=await backend(page,'Admin',false,{demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const board=page.locator('.operational-board-panel');
 await expect(board.locator('article[data-id="validation-next-day"] .demand-card-alert')).toHaveText('Próximo do envio p/ validação');
 await expect(board.locator('article[data-id="validation-two-days"] .demand-card-alert')).toHaveText('Em dia');
 await expect(board.locator('article[data-id="delivery-next-day"] .demand-card-alert')).toHaveText('Próximo da entrega');
 await expect(board.locator('article[data-id="delivery-two-days"] .demand-card-alert')).toHaveText('Em dia');
 expect(b.errors).toEqual([]);
});

test('validation KPI includes and separates all three validation statuses',async({page})=>{
 const base={...structuredClone(payload.state.demands[1]),tipo:'SIC'};
 const demands=[
  {...base,id:'validation-st',coluna:'validacaoST'},
  {...base,id:'validation-works',coluna:'validacaoObras'},
  {...base,id:'validation-director',coluna:'aprovacaoDiretoria'},
 ];
 const b=await backend(page,'Admin',false,{demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const validationKpi=page.locator('[data-action="open-kpi-detail"][data-kpi="opValidacao"]');
 await expect(validationKpi).toContainText('3');
 await expect(validationKpi).toContainText('Sala Técnica, Obras e Diretoria');
 await validationKpi.click();
 const metrics=page.locator('.kpi-modal-card .kpi-detail-grid .split-item');
 await expect(metrics.locator('strong')).toHaveText(['Total em validação','Sala Técnica','Equipe de Obras','Aprovação Diretoria']);
 await expect(metrics.locator('span')).toHaveText(['3','1','1','1']);
 await expect(page.locator('.kpi-detail-table tbody tr')).toHaveCount(3);
 expect(b.errors).toEqual([]);
});

test('operational demands are always ordered by nearest delivery date',async({page})=>{
 const base={...structuredClone(payload.state.demands[1]),obraId:'test-work',coluna:'fazer'};
 const demands=[
  {...base,id:'delivery-no-date',dataPrevistaEntrega:''},
  {...base,id:'delivery-far',dataPrevistaEntrega:'2026-10-20'},
  {...base,id:'delivery-overdue',dataPrevistaEntrega:'2026-09-01'},
  {...base,id:'delivery-near',dataPrevistaEntrega:'2026-09-20'},
 ];
 const b=await backend(page,'Admin',false,{demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const expected=['delivery-overdue','delivery-near','delivery-far','delivery-no-date'];
 expect(await page.locator('.kanban-column[data-column="fazer"] article').evaluateAll(cards=>cards.map(card=>card.dataset.id))).toEqual(expected);
 await page.getByRole('button',{name:'Lista',exact:true}).click();
 expect(await page.locator('.operational-list-table tbody tr').evaluateAll(rows=>rows.map(row=>row.dataset.id))).toEqual(expected);
 expect(b.errors).toEqual([]);
});

test('operational demand cards and list standardize work names',async({page})=>{
 const work={...structuredClone(payload.state.works[0]),nome:'9902. PA BARRA IT DA TIJUCA - RJ',codigoOriginal:'9902',uf:'RJ'};
 const demand={...structuredClone(payload.state.demands[1]),id:'uppercase-work-demand',obraId:work.id,coluna:'fazer',observacao:'Descrição inicial da demanda para conferência.'};
 const b=await backend(page,'Admin',false,{workRecords:[work],demandRecords:[demand]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const card=page.locator('article[data-id="uppercase-work-demand"]');
 await expect(card.locator('h3')).toHaveText('9902. PA Barra IT da Tijuca');
 await expect(card.locator('.demand-card-description')).toHaveText('Descrição inicial da demanda para conferência.');
 await page.getByRole('button',{name:'Lista',exact:true}).click();
 await expect(page.locator('tr[data-id="uppercase-work-demand"] td').nth(1)).toHaveText('9902. PA Barra IT da Tijuca');
 expect(b.errors).toEqual([]);
});

test('SIC without a title does not put its description on the card',async({page})=>{
 const sic={...structuredClone(payload.state.demands[0]),id:'sic-without-title',titulo:'',observacao:'Descrição legada da SIC',sicMetadata:{lecomNumber:'TEST-2',descricaoSic:'Descrição legada da SIC'}};
 const b=await backend(page,'Admin',false,{demandRecords:[sic]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const card=page.locator('article[data-id="sic-without-title"]');
 await expect(card.locator('.sic-card-title')).toHaveCount(0);
 await expect(card.locator('.demand-card-description')).toHaveCount(0);
 await expect(card).not.toContainText('Descrição legada da SIC');
 expect(b.errors).toEqual([]);
});

test('kanban shows column totals and time in the current stage for every demand type',async({page})=>{
 const phaseStartedAt=new Date(Date.now()-(26*60*60*1000)).toISOString();
 const base={...structuredClone(payload.state.demands[1]),obraId:'test-work',phaseStartedAt,phaseStartedAtEstimated:false};
 const demands=[
  {...base,id:'stage-initial',tipo:'EmissaoInicial',coluna:'fazer'},
  {...base,id:'stage-revision',tipo:'ReemissaoCompleta',coluna:'fazendo'},
  {...base,id:'stage-extra',tipo:'DemandaExtra',coluna:'pausado'},
  {...structuredClone(payload.state.demands[0]),id:'stage-sic',obraId:'test-work',tipo:'SIC',coluna:'validacaoObras',phaseStartedAt,phaseStartedAtEstimated:false},
 ];
 const b=await backend(page,'Admin',false,{demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const counts=page.locator('.operational-board-panel .kanban-count');
 await expect(counts).toHaveText(['1','1','1','0','1','0','0','0']);
 expect(await counts.first().evaluate((element)=>getComputedStyle(element).color)).not.toBe('rgba(0, 0, 0, 0)');
 const expectedTypeBadges=new Map([
  ['stage-initial','Emissão Inicial'],['stage-revision','Rev. Orç.'],['stage-extra','Dem. Extra'],['stage-sic','SIC'],
 ]);
 const expectedTypeTitles=new Map([
  ['stage-initial','Emissão Inicial'],['stage-revision','Revisão de Orçamento'],['stage-extra','Demanda Extra'],['stage-sic','SIC'],
 ]);
 for(const demand of demands){
  const card=page.locator(`article[data-id="${demand.id}"]`);
  await expect(card.locator('.demand-code')).toHaveCount(0);
  await expect(card.locator('[data-action="open-delete-demand"]')).toHaveCount(0);
  await expect(card.locator('.demand-type-badge')).toHaveText(expectedTypeBadges.get(demand.id));
  await expect(card.locator('.demand-type-badge')).toHaveAttribute('title',expectedTypeTitles.get(demand.id));
  await expect(card.locator('.demand-card-stage-time span').first()).toHaveText('Tempo na etapa:');
  await expect(card.locator('.demand-card-stage-duration')).toHaveText('1 dia');
  const positions=await card.locator('.demand-card-stage-time').evaluate(element=>{
   const label=element.querySelector('span:first-child').getBoundingClientRect();
   const duration=element.querySelector('.demand-card-stage-duration').getBoundingClientRect();
   return {gap:duration.left-label.right,sameLine:Math.abs(duration.top-label.top)<1};
  });
  expect(positions.sameLine).toBe(true);
  expect(positions.gap).toBeLessThanOrEqual(5);
  const stageTimeStyles=await card.locator('.demand-card-stage-time').evaluate(element=>{
   const label=getComputedStyle(element.querySelector('span:first-child'));
   const duration=getComputedStyle(element.querySelector('.demand-card-stage-duration'));
   return {
    label:{color:label.color,fontFamily:label.fontFamily,fontSize:label.fontSize,fontWeight:label.fontWeight},
    duration:{color:duration.color,fontFamily:duration.fontFamily,fontSize:duration.fontSize,fontWeight:duration.fontWeight},
   };
  });
  expect(stageTimeStyles.duration).toEqual(stageTimeStyles.label);
  if(demand.id==='stage-initial'){
   await card.evaluate(element=>{element.style.width='180px';});
   const overflow=await card.evaluate(element=>{
    const bounds=element.getBoundingClientRect();
    return [...element.querySelectorAll('.demand-card-top, .demand-card-top *, .demand-card-stage-time, .demand-card-stage-time *')]
     .filter(child=>child.getBoundingClientRect().right>bounds.right+1).length;
   });
   expect(overflow).toBe(0);
   await card.evaluate(element=>{element.style.width='';});
  }
  await card.click();
  const stageSummary=page.locator('#demandDetailForm .demand-stage-summary');
  await expect(stageSummary).toContainText('Tempo na etapa atual');
  await expect(stageSummary.locator('strong')).toHaveText('1 dia');
  await page.locator('#demandDetailForm footer').getByRole('button',{name:'Fechar',exact:true}).click();
 }
 expect(b.errors).toEqual([]);
});

test('legacy stage counters start at demand creation instead of the demand start date',async({page})=>{
 const createdAt=new Date(Date.now()-(50*60*60*1000)).toISOString();
 const oldDemandStart=new Date(Date.now()-(15*24*60*60*1000)).toISOString();
 const demand={
  ...structuredClone(payload.state.demands[1]),
  id:'creation-based-stage-demand',
  obraId:'test-work',
  coluna:'fazendo',
  createdAt,
  dataInicioReal:oldDemandStart.slice(0,10),
  phaseStartedAt:oldDemandStart,
  phaseStartedAtEstimated:true,
  phaseHistory:[],
 };
 const b=await backend(page,'Admin',false,{demandRecords:[demand]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const card=page.locator('article[data-id="creation-based-stage-demand"]');
 await expect(card.locator('.demand-card-stage-duration')).toHaveText('2 dias');
 await card.click();
 await expect(page.locator('#demandDetailForm .demand-stage-summary strong')).toHaveText('2 dias');
 expect(b.errors).toEqual([]);
});

test('moving a demand resets the current stage timer and preserves every previous period',async({page})=>{
 const phaseStartedAt=new Date(Date.now()-(74*60*60*1000)).toISOString();
 const demand={...structuredClone(payload.state.demands[1]),id:'stage-history-demand',obraId:'test-work',coluna:'fazer',phaseStartedAt,phaseStartedAtEstimated:false,phaseHistory:[]};
 const b=await backend(page,'Admin',false,{demandRecords:[demand]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const card=page.locator('article[data-id="stage-history-demand"]');
 await expect(card.locator('.demand-card-stage-duration')).toHaveText('3 dias');
 await card.click();
 const form=page.locator('#demandDetailForm');
 await form.locator('[name="coluna"]').selectOption('fazendo');
 await form.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(card.locator('.demand-card-stage-duration')).toHaveText('menos de 1 dia');
 await card.click();
 const periods=page.locator('#demandDetailForm .demand-stage-period');
 await expect(periods).toHaveCount(2);
 await expect(periods.nth(0)).toContainText('Fazer');
 await expect(periods.nth(0)).toContainText('3 dias');
 await expect(periods.nth(1)).toContainText('Fazendo');
 await expect(periods.nth(1)).toContainText('menos de 1 dia');
 await expect(periods.nth(1)).toHaveClass(/is-current/);
 expect(b.errors).toEqual([]);
});

test('completed demand hides current-stage age while canceled demand keeps its stopped counter',async({page})=>{
 const phaseStartedAt=new Date(Date.now()-(5*24*60*60*1000)).toISOString();
 const phaseEndedAt=new Date(Date.now()-(3*24*60*60*1000)).toISOString();
 const base={...structuredClone(payload.state.demands[1]),obraId:'test-work',phaseStartedAt,phaseEndedAt,phaseStartedAtEstimated:false,phaseHistory:[]};
 const demands=[
  {...base,id:'stage-completed',tipo:'EmissaoInicial',coluna:'concluido',dataEntregaReal:phaseEndedAt.slice(0,10),valorGerado:0},
  {...base,id:'stage-canceled',tipo:'DemandaExtra',coluna:'cancelado'},
 ];
 const b=await backend(page,'Admin',false,{demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const completed=page.locator('article[data-id="stage-completed"]');
 await expect(completed.locator('.demand-card-stage-time')).toHaveCount(0);
 await completed.click();
 let detail=page.locator('#demandDetailForm');
 await expect(detail.locator('.demand-stage-summary')).toHaveCount(0);
 await expect(detail.locator('.demand-stage-period').last()).not.toContainText('agora');
 await detail.locator('footer').getByRole('button',{name:'Fechar',exact:true}).click();
 const canceled=page.locator('article[data-id="stage-canceled"]');
 await expect(canceled.locator('.demand-card-stage-duration')).toHaveText('2 dias');
 await expect(canceled.locator('.demand-card-stage-time')).toHaveAttribute('title',/Contagem encerrada em/);
 await canceled.click();
 detail=page.locator('#demandDetailForm');
 await expect(detail.locator('.demand-stage-summary small')).toContainText('contagem encerrada em');
 await expect(detail.locator('.demand-stage-period').last()).not.toContainText('agora');
 expect(b.errors).toEqual([]);
});

test('existing operational card saves sprint together with the other edits',async({page})=>{
 const sprints=[
  {id:'sprint-16',nome:'Sprint 16',dataInicio:'2026-08-31',dataFim:'2026-09-13',status:'Encerrada'},
  {id:'sprint-17',nome:'Sprint 17',dataInicio:'2026-09-14',dataFim:'2026-09-27',status:'Ativa'},
 ];
 const demand={
  ...structuredClone(payload.state.demands[1]),
  sprintId:'sprint-16',
  observacao:'Descrição anterior',
  prioridade:'Baixa',
  dataPrevistaEntrega:'2026-09-20',
 };
 const b=await backend(page,'Admin',false,{demandRecords:[demand],sprintRecords:sprints});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-action="open-demand-detail"][data-id="test-budget-demand"]').click();
 const form=page.locator('#demandDetailForm');
 await form.locator('[name="sprintId"]').selectOption('sprint-17');
 await expect(form).toBeVisible();
 await expect(form.locator('[name="obraBusca"]')).toHaveValue('Obra de teste');
 await expect(form.locator('[name="obraId"]')).toHaveValue('test-work');
 await expect(form.getByText('Contexto da unidade',{exact:true})).toHaveCount(0);
 await expect(form.getByText('Sprint atual',{exact:true})).toHaveCount(0);
 await expect(form.locator('[name="sprintId"]')).toHaveCount(1);
 await form.locator('[name="descricao"]').fill('Descrição atualizada no mesmo salvamento');
 await form.locator('[name="prioridade"]').selectOption('Alta');
 await form.locator('[name="dataPrevistaEntrega"]').fill('2026-09-27');
 await form.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(form).toHaveCount(0);
 await page.locator('[data-action="open-demand-detail"][data-id="test-budget-demand"]').click();
 const reopened=page.locator('#demandDetailForm');
 await expect(reopened.locator('[name="sprintId"]')).toHaveValue('sprint-17');
 await expect(reopened.locator('[name="descricao"]')).toHaveValue('Descrição atualizada no mesmo salvamento');
 await expect(reopened.locator('[name="prioridade"]')).toHaveValue('Alta');
 await expect(reopened.locator('[name="dataPrevistaEntrega"]')).toHaveValue('2026-09-27');
 await reopened.locator('[name="obraBusca"]').fill('Obra nova sem EV');
 await expect(reopened.locator('[name="obraId"]')).toHaveValue('work-without-ev');
 await reopened.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect.poll(()=>b.requests.length).toBeGreaterThan(0);
 await expect.poll(()=>{
  const changes=b.requests.flatMap(request=>request.changes).filter(change=>change.entity==='budget_demands'&&change.key==='test-budget-demand');
  return changes.at(-1)?.document?.obraId;
 }).toBe('work-without-ev');
 expect(b.errors).toEqual([]);
});

test('SIC card exposes the same editable identification fields used at creation',async({page})=>{
 const demand={
  ...structuredClone(payload.state.demands[0]),
  sprintId:'sprint-17',
  analistaResponsavel:'Ana',
  sicMetadata:{
   lecomNumber:'LECOM-2026-001',obraNumber:'TEST',obraNome:'Obra de teste',tituloSic:'SIC de teste',numeroSic:'SIC-001',
   descricaoSic:'Descrição da SIC',analistaSalaTecnica:'Ana',motivo:'AlteracaoProjeto',
  },
 };
 const b=await backend(page,'Admin',false,{demandRecords:[demand],analystNames:['Ana']});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-action="open-demand-detail"][data-id="test-demand"]').click();
 const form=page.locator('#demandDetailForm');
 await expect(form.locator('[name="sprintId"]')).toHaveCount(1);
 await expect(form.locator('[name="obraBusca"]')).toHaveValue('Obra de teste');
 await expect(form.locator('[name="lecomNumber"]')).toHaveValue('LECOM-2026-001');
 await expect(form.locator('[name="obraNumber"]')).toHaveValue('TEST');
 await expect(form.locator('[name="obraNome"]')).toHaveValue('Obra de teste');
 await expect(form.locator('[name="tituloSic"]')).toHaveValue('SIC de teste');
 await expect(form.locator('[name="numeroSic"]')).toHaveValue('SIC-001');
 await expect(form.locator('[name="sicDescricao"]')).toHaveValue('Descrição da SIC');
 await expect(form.locator('[name="motivo"]')).toHaveValue('AlteracaoProjeto');
 await expect(form.locator('[name="prioridade"]')).toHaveCount(1);
 await expect(form.locator('[name="dataPrevistaEntrega"]')).toHaveCount(1);
 await expect(form.locator('[name="projetosEnvolvidos"]')).toHaveCount(12);
 expect(b.errors).toEqual([]);
});

test('budget demand forms, including extra demand, use one work selector and keep description optional',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 for(const type of ['EmissaoInicial','ReemissaoCompleta','DemandaExtra']){
  await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
  await page.locator(`.demand-type-option[data-type="${type}"]`).click();
  const step1=page.locator('#demandWizardStep1');
  await expect(step1.getByText('Descrição da demanda',{exact:true})).toBeVisible();
  await expect(step1.locator('[name="descricao"]')).not.toHaveAttribute('required','');
  await expect(step1.getByText('Contexto da unidade',{exact:true})).toHaveCount(0);
  await expect(step1.getByText('Classificação',{exact:true})).toHaveCount(0);
  await expect(step1.locator('[data-demand-unit-search]')).toHaveCount(0);
  await expect(step1.locator('[name="tipo"]')).toHaveAttribute('type','hidden');
  await expect(step1.locator('[name="sprintId"]')).toHaveCount(1);
  await expect(step1.locator('[name="obraBusca"]')).toHaveCount(1);
  await expect(step1.locator('#demandWorkOptions option[value="Obra de teste"]')).toHaveText('2026');
  await expect(step1.locator('#demandWorkOptions option[value="Obra histórica Norte - AM"]')).toHaveText('2025');
  if(type!=='EmissaoInicial'){
   await step1.locator('[name="obraBusca"]').fill('Obra de teste');
   await step1.getByRole('button',{name:/Avançar/}).click();
   await expect(page.locator('#demandForm')).toBeVisible();
   await page.locator('#demandForm [data-action="close-modal"]').first().click();
  }else{
   await step1.locator('[data-action="close-modal"]').first().click();
  }
 }
 expect(b.errors).toEqual([]);
});

test('new work demands list only works from 2025 onward, including SIC',async({page})=>{
 const older={...structuredClone(payload.state.works[0]),id:'older-work',nome:'Obra de 2024',codigoOriginal:'2024',anoObra:'2024'};
 const noYear={...structuredClone(payload.state.works[0]),id:'undated-work',nome:'Obra sem ano',codigoOriginal:'0000',anoObra:'',ev:{...structuredClone(payload.state.works[0].ev),versions:[{numero:1,data:'2026-06-01'}]}};
 const eligible={...structuredClone(payload.state.works[0]),id:'eligible-work',nome:'Obra de 2025',codigoOriginal:'2025',anoObra:'2025'};
 const b=await backend(page,'Admin',false,{workRecords:[older,noYear,eligible,payload.state.works[0]],demandRecords:[]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 for(const type of ['EmissaoInicial','ReemissaoCompleta','DemandaExtra']){
  await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
  await page.locator(`.demand-type-option[data-type="${type}"]`).click();
  const step1=page.locator('#demandWizardStep1');
  await expect(step1.locator('#demandWorkOptions option[value="Obra de 2025"]')).toHaveCount(1);
  await expect(step1.locator('#demandWorkOptions option[value="Obra de 2024"]')).toHaveCount(0);
  await expect(step1.locator('#demandWorkOptions option[value="Obra sem ano"]')).toHaveCount(0);
  await expect(step1.locator('#demandWorkOptions option[value="Obra histórica Sul - RS"]')).toHaveCount(0);
  await step1.locator('[name="obraBusca"]').fill('Obra de 2024');
  await step1.locator('[name="obraId"]').evaluate(element=>{element.value='older-work';});
  await step1.getByRole('button',{name:/Avançar/}).click();
  await expect(step1.locator('#formError')).toContainText('2025 em diante');
  await step1.locator('[name="obraBusca"]').fill('Obra de 2025');
  await step1.getByRole('button',{name:/Avançar/}).click();
  await expect(page.locator('#demandForm [name="obraId"]')).toHaveValue('eligible-work');
  await page.locator('#demandForm [data-action="close-modal"]').first().click();
 }
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.locator('.demand-type-option[data-type="SIC"]').click();
 const sic=page.locator('#demandForm');
 await sic.locator('[data-sic-work-search]').fill('Obra de 2024');
 await expect(sic.locator('[data-sic-work-results] [data-action="select-sic-work"]')).toHaveCount(0);
 await sic.locator('[name="obraId"]').evaluate(element=>{element.value='older-work';});
 await sic.locator('[name="obraNumber"]').fill('2024');
 await sic.locator('[name="obraNome"]').fill('Obra de 2024');
 await sic.locator('[data-action="submit-demand-form"]').click();
 await expect(sic.locator('#formError')).toContainText('2025 em diante');
 expect(b.requests.flatMap(request=>request.changes).filter(change=>change.entity==='budget_demands')).toHaveLength(0);
 await sic.locator('[data-sic-work-search]').fill('Obra de 2025');
 await expect(sic.locator('[data-sic-work-results] [data-action="select-sic-work"]')).toHaveCount(1);
 await sic.locator('[data-action="select-sic-work"]').click();
 await expect(sic.locator('[name="obraId"]')).toHaveValue('eligible-work');
 expect(b.errors).toEqual([]);
});

test('existing demands linked to older works can still be edited',async({page})=>{
 const older={...structuredClone(payload.state.works[0]),id:'older-work',nome:'Obra de 2024',anoObra:'2024'};
 const demand={...structuredClone(payload.state.demands[1]),id:'older-demand',obraId:older.id,coluna:'fazer'};
 const b=await backend(page,'Admin',false,{workRecords:[older],demandRecords:[demand]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('article[data-id="older-demand"]').click();
 const detail=page.locator('#demandDetailForm');
 await expect(detail.locator('[name="obraId"]')).toHaveValue(older.id);
 await expect(detail.locator('#demandWorkOptions option[value="Obra de 2024"]')).toHaveCount(0);
 await detail.locator('[name="nota"]').fill('Ajuste em demanda histórica');
 await detail.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect.poll(()=>b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key===demand.id)?.document?.obraId).toBe(older.id);
 expect(b.errors).toEqual([]);
});

test('budget revision keeps the selected official work id for work 4201',async({page})=>{
 const officialWork={...structuredClone(payload.state.works[0]),id:'EVW-evh-0012',nome:'Adequação Visa HO Jardim America (CME)',codigoOriginal:'4201',uf:'GO',cidade:'Goiânia',anoObra:'2026'};
 const officialEV={id:'evh-0012',workId:officialWork.id,code:'42011',project:'42011. ADEQUAÇÃO VISA HO JARDIM AMERICA (CME) - GO',year:2026,date:'2026-08-27',revision:'REV03',typology:'Hospital',technician:'Leonardo',area:394.74,total:536542.5,disciplines:{'adequacoes-civis':39012.62},items:[]};
 const b=await backend(page,'Admin',false,{workRecords:[officialWork],evRecords:[officialEV],demandRecords:[]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.locator('.demand-type-option[data-type="ReemissaoCompleta"]').click();
 const step1=page.locator('#demandWizardStep1');
 await step1.locator('[name="obraBusca"]').fill('4201. Adequação Visa HO Jardim America (CME)');
 await step1.getByRole('button',{name:/Avançar/}).click();
 const step2=page.locator('#demandForm');
 await expect(step2.locator('[name="obraId"]')).toHaveValue(officialWork.id);
 await step2.getByRole('button',{name:'Salvar demanda',exact:true}).click();
 await expect.poll(()=>b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands')?.document?.obraId).toBe(officialWork.id);
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
  {id:'mgmt-3',obraId:'test-work',tipo:'EmissaoInicial',coluna:'concluido',analistaResponsavel:'Ana',dataPrevistaEntrega:'2026-09-05',dataEntregaReal:'2026-09-04',valorGerado:100,sicIds:[]},
  {id:'mgmt-4',obraId:'test-work',tipo:'SIC',coluna:'cancelado',analistaResponsavel:'Bruno',sicIds:[]},
  {id:'mgmt-5',obraId:'test-work',tipo:'EmissaoInicial',coluna:'concluido',analistaResponsavel:'Ana',dataPrevistaEntrega:'2026-09-06',valorGerado:200,sicIds:[]},
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
 await expect(page.locator('[data-strategic-ev-filter="typology"] option')).toHaveText([
  'Todas as tipologias','Nova Unidade','Retrofit Unidade Existente','Ampliação Unidade Existente','Retrofit + Ampliação',
 ]);
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
 await expect(page.locator('.operational-board-panel .demand-card [data-action="open-delete-demand"]')).toHaveCount(0);
 await expect(page.locator('[data-action="open-demand"]')).toBeHidden();
 await page.locator('[data-action="open-demand-detail"][data-id="test-budget-demand"]').first().click();
 const detail=page.locator('#demandDetailForm');
 await expect(detail).toBeVisible();
 await expect(detail.locator('[data-action="open-delete-demand"]')).toBeHidden();
 await detail.locator('[name="descricao"]').fill('Descrição ajustada pelo analista');
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

test('manager can delete demands only after opening the card',async({page})=>{
 const b=await backend(page,'Gestor',false,{analystCanWrite:true});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const card=page.locator('.operational-board-panel .demand-card[data-id="test-budget-demand"]').first();
 await expect(card.locator('[data-action="open-delete-demand"]')).toHaveCount(0);
 await card.click();
 const detail=page.locator('#demandDetailForm');
 await expect(detail.locator('[data-action="open-delete-demand"]')).toBeVisible();
 await detail.locator('[data-action="open-delete-demand"]').click();
 await expect(page.locator('#deleteDemandForm')).toBeVisible();
 expect(b.errors).toEqual([]);
});

test('settings activate an existing sprint and do not expose the work-base restore button',async({page})=>{
 const sprints=[
  {id:'sprint-16',nome:'Sprint 16',dataInicio:'2026-08-31',dataFim:'2026-09-13',status:'Ativa'},
  {id:'sprint-17',nome:'Sprint 17',dataInicio:'2026-09-14',dataFim:'2026-09-27',status:'Planejada'},
 ];
 const b=await backend(page,'Admin',false,{sprintRecords:sprints});await login(page);
 await page.locator('[data-view="settings"]').filter({visible:true}).first().click();
 await expect(page.getByRole('button',{name:'Restaurar base Obras',exact:true})).toHaveCount(0);
 await expect(page.locator('.sprint-settings-panel .panel-header .tag')).toHaveText('Sprint ativa: Sprint 16');
 const sprint16=page.locator('.sprint-table tbody tr').filter({hasText:'Sprint 16'});
 const sprint17=page.locator('.sprint-table tbody tr').filter({hasText:'Sprint 17'});
 await expect(sprint16.locator('td').nth(5)).toHaveText('Atual');
 await sprint17.getByRole('button',{name:'Tornar atual — Sprint 17'}).click();
 await expect(page.locator('.sprint-settings-panel .panel-header .tag')).toHaveText('Sprint ativa: Sprint 17');
 await expect(page.locator('.sprint-table tbody tr').filter({hasText:'Sprint 16'}).locator('td').nth(3)).toHaveText('Encerrada');
 await expect(page.locator('.sprint-table tbody tr').filter({hasText:'Sprint 17'}).locator('td').nth(3)).toHaveText('Ativa');
 await expect.poll(()=>b.requests.some(request=>request.changes.some(change=>change.entity==='core_sprints'&&change.key==='sprint-17'&&change.document.status==='Ativa'))).toBe(true);
 expect(b.errors).toEqual([]);
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
 await expect(page.locator('[data-operational-filter-group="analyst"] .operational-multiselect-menu span')).toContainText(['Sem analista','Analista Editado']);
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.locator('.demand-type-option[data-type="EmissaoInicial"]').click();
 await expect(page.locator('#demandWizardStep1 .analyst-chip')).toContainText(['Sem analista','Analista Editado']);
 await page.locator('#demandWizardStep1 [data-action="close-modal"]').first().click();
 await page.locator('[data-module="maintenance"]').click();
 await page.locator('[data-view="maintenanceOperational"]').filter({visible:true}).first().click();
 await expect(page.locator('[data-maintenance-filter="analyst"] option')).toContainText(['Todos','Sem analista','Analista Editado']);
 await page.locator('[data-module="clinical"]').click();
 await page.locator('[data-view="clinicalOperational"]').filter({visible:true}).first().click();
 await expect(page.locator('[data-maintenance-filter="analyst"] option')).toContainText(['Todos','Sem analista','Analista Editado']);
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
 await expect(typologyLabels).toHaveText(['Nova Unidade','Retrofit Unidade Existente','Ampliação Unidade Existente','Retrofit + Ampliação']);
 const stateCard=page.locator('[data-configuration-type="state"]');
 await expect(stateCard.locator('.configuration-catalog-item strong')).toHaveText([
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
 ]);
 await expect(stateCard).not.toContainText('Acre');

 await page.getByRole('button',{name:'Obras',exact:true}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 await page.locator('[data-action="edit-portfolio-work"][data-id="test-work"]').click();
 const editWorkForm=page.locator('#workForm');
 await expect(editWorkForm.getByText('Contexto da unidade',{exact:true})).toHaveCount(0);
 await expect(editWorkForm.getByText('Assistente de busca de unidades',{exact:true})).toHaveCount(0);
 await expect(editWorkForm.locator('[name="unidadeModo"]')).toHaveCount(0);
 await editWorkForm.getByRole('button',{name:'Fechar',exact:true}).click();
 await page.getByRole('button',{name:'+ Nova obra',exact:true}).click();
 const newWorkForm=page.locator('#workForm');
 await expect(newWorkForm.getByText('Contexto da unidade',{exact:true})).toHaveCount(0);
 await expect(newWorkForm.getByText('Assistente de busca de unidades',{exact:true})).toHaveCount(0);
 await expect(newWorkForm.locator('[name="unidadeModo"]')).toHaveCount(0);
 await expect(newWorkForm.locator('[name="tipoVerba"]')).toHaveValue('');
 await expect(newWorkForm.locator('[name="tipoVerba"]')).not.toHaveAttribute('required','');
 await expect(newWorkForm.locator('[name="ordemInternaSAP"]')).not.toHaveAttribute('required','');
 await expect(newWorkForm.locator('[name="valorVerbaAportada"]')).not.toHaveAttribute('required','');
 await expect(page.locator('#classificacaoOptions option[value="Categoria Editada"]')).toHaveCount(1);
 await expect(page.locator('#classificacaoOptions option[value="Venda de Serviço"]')).toHaveCount(1);
 await expect(page.locator('#classificacaoOptions option[value="Venda de Serviços"]')).toHaveCount(0);
 await expect(page.locator('#classificacaoOptions option[value="Ambiental"]')).toHaveCount(0);
 await expect(page.locator('#classificacaoOptions option[value="Não informada"]')).toHaveCount(0);
 await expect(newWorkForm.locator('[name="tipologiaObra"] option')).toHaveText([
  'Selecione','Nova Unidade','Retrofit Unidade Existente','Ampliação Unidade Existente','Retrofit + Ampliação',
 ]);
 await newWorkForm.locator('[name="nome"]').fill('OBRA SEM ORIGEM DE VERBA - PE');
 await newWorkForm.locator('[name="tipoUnidade"]').fill('Hospital');
 await newWorkForm.locator('[name="cidade"]').fill('Recife');
 await newWorkForm.locator('[name="uf"]').fill('PE');
 await newWorkForm.locator('[name="regiao"]').fill('Nordeste');
 await newWorkForm.locator('[name="anoObra"]').fill('2026');
 await newWorkForm.getByRole('button',{name:'Cadastrar obra',exact:true}).click();
 await expect(page.locator('#workForm')).toHaveCount(0);
 await expect.poll(()=>b.requests.flatMap(request=>request.changes).find(change=>change.entity==='projects_works')?.document?.nome).toBe('Obra sem Origem de Verba');
 await expect.poll(()=>b.requests.flatMap(request=>request.changes).some(change=>change.entity==='projects_works'&&change.document?.tipoVerba===''&&change.document?.ordemInternaSAP===''&&change.document?.valorVerbaAportada===0)).toBe(true);
 await expect(page.locator('#cloudStatus')).toHaveText('Sincronizado');
 await page.getByRole('button',{name:'+ Nova obra',exact:true}).click();
 const duplicateWorkForm=page.locator('#workForm');
 await duplicateWorkForm.locator('[name="nome"]').fill('Obra sem origem de verba');
 await duplicateWorkForm.locator('[name="tipoUnidade"]').fill('Hospital');
 await duplicateWorkForm.locator('[name="cidade"]').fill('Recife');
 await duplicateWorkForm.locator('[name="uf"]').fill('PE');
 await duplicateWorkForm.locator('[name="regiao"]').fill('Nordeste');
 await duplicateWorkForm.locator('[name="anoObra"]').fill('2026');
 await duplicateWorkForm.getByRole('button',{name:'Cadastrar obra',exact:true}).click();
 await expect(duplicateWorkForm.locator('#formError')).toContainText('já está cadastrada');
 await duplicateWorkForm.locator('[name="anoObra"]').fill('2027');
 await duplicateWorkForm.getByRole('button',{name:'Cadastrar obra',exact:true}).click();
 await expect(page.locator('#workForm')).toHaveCount(0);
 await page.getByRole('button',{name:'Obras',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Visão Operacional',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await expect(page.locator('.demand-type-card')).toBeVisible();
 await page.locator('.demand-type-option[data-type="SIC"]').click();
 await expect(page.locator('#demandForm [name="disciplinaId"] option[value="disciplina-configuravel"]')).toHaveText(/Disciplina Configurável/);
 await expect(page.locator('#demandForm [data-demand-project]')).toHaveCount(12);
 await expect(page.locator('#demandForm [data-demand-project="DC"]')).toHaveCount(0);
 await page.locator('#demandForm [data-action="close-modal"]').first().click();
 await expect(page.getByRole('button',{name:'Nova SIC',exact:true})).toHaveCount(0);
 expect(b.errors).toEqual([]);
});

test('new demands suggest the historical analyst, persist labels and give SICs a 15-day due date',async({page})=>{
 const sprints=[
  {id:'sprint-016',nome:'Sprint 16',dataInicio:'2026-08-31',dataFim:'2026-09-13',status:'Encerrada'},
  {id:'sprint-017',nome:'Sprint 17',dataInicio:'2026-09-14',dataFim:'2026-09-27',status:'Ativa'},
 ];
 const b=await backend(page,'Admin',false,{archivedDemandIds:['DEM-021'],analystNames:['Técnico A'],sprintRecords:sprints});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.locator('.demand-type-option[data-type="EmissaoInicial"]').click();
 const step1=page.locator('#demandWizardStep1');
 await expect(step1).toBeVisible();
 await expect(step1.getByText('Contexto da unidade',{exact:true})).toHaveCount(0);
 await expect(step1.getByText('Classificação',{exact:true})).toHaveCount(0);
 await expect(step1.getByText('Descrição da demanda',{exact:true})).toBeVisible();
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
 await expect(createdCard).toHaveAttribute('data-id','DEM-022');
 await expect(createdCard.locator('.demand-code')).toHaveCount(0);
 await expect(createdCard.locator('.demand-type-badge')).toHaveText('Emissão Inicial');
 await expect(createdCard.locator('.demand-card-labels')).toHaveText(/Urgente.*Diretoria/);
 await expect(page.locator('#cloudStatus')).toHaveText('Sincronizado');
 const createdChange=b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='DEM-022');
 expect(createdChange?.document?.analistaResponsavel).toBe('Técnico A');
 expect(createdChange?.document?.etiquetas).toEqual(['Urgente','Diretoria']);
 expect(b.requests.flatMap(request=>request.changes).some(change=>change.entity==='budget_demands'&&change.key==='DEM-021')).toBe(false);

 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.locator('.demand-type-option[data-type="SIC"]').click();
 const sicForm=page.locator('#demandForm');
 await expect(sicForm.locator('[name="sprintId"]')).toHaveValue('sprint-017');
 await expect(sicForm.locator('[name="sprintId"] option')).toHaveText(['Sem sprint','Sprint 16','Sprint 17']);
 await sicForm.locator('[data-sic-work-search]').fill('Obra histórica Norte');
 await sicForm.locator('[data-sic-work-results]').getByRole('button',{name:/Obra histórica Norte/}).click();
 await expect(sicForm.locator('[data-sic-work-results]')).toContainText('Ano: 2025');
 await expect(sicForm.locator('[data-sic-work-search]')).toHaveValue(/Ano: 2025/);
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
 await page.locator('.demand-type-option[data-type="EmissaoInicial"]').click();
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
 await expect(projectItems).toHaveCount(12);
 await expect(projectItems.locator('summary')).toHaveText(['ARQ','ELE','HID','ELO','SUB','GMD','SCI','CLI','SPDA','STR','FUN','DRE']);
 expect(await projectItems.locator('summary').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('title')))).toEqual([
  'Arquitetura','Instalações Elétricas','Instalações Hidrosanitárias','Instalações de Dados e Voz','Subestação',
  'Instalações de Gases Medicinais','Sistema de Combate a Incêndio','Instalações de Climatização e Exaustão','Instalações de SPDA',
  'Estrutura','Fundações','Drenagem',
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
 await expect(detail.locator('.demand-context-grid')).toHaveCount(0);
 await expect(detail.locator('[name="obraBusca"]')).toHaveValue('Obra de teste');
 await expect(detail.getByText('Descrição da demanda',{exact:true})).toBeVisible();
 await expect(detail.locator('[name="descricao"]')).not.toHaveAttribute('required','');
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
 const demand={...structuredClone(payload.state.demands[1]),analistaResponsavel:'SKART',analistasComplementares:['Intruso']};
 const b=await backend(page,'Admin',false,{analystNames:['Skarth'],demandRecords:[demand]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('.operational-board-panel [data-action="open-demand-detail"][data-id="test-budget-demand"]').first().click();
 const detail=page.locator('#demandDetailForm');
 await expect(detail.locator('[data-demand-analyst-option][value="Skarth"]')).toHaveCount(1);
 await expect(detail.locator('[data-demand-analyst-option][value="SKART"]')).toHaveCount(0);
 await expect(detail.locator('[data-demand-analyst-option][value="Intruso"]')).toHaveCount(0);
 await expect(detail.locator('[data-demand-analyst-summary]')).toHaveText('Líder: Skarth · Complementares: Nenhum');
 const requestCount=b.requests.length;
 await detail.locator('[name="analistasSelecionados"]').evaluate(input=>{input.value='["Intruso"]';});
 await detail.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(detail.locator('#formError')).toContainText('não está cadastrado em Configurações');
 expect(b.requests).toHaveLength(requestCount);
 expect(b.errors).toEqual([]);
});

test('historical EV shows original and additive totals with an unobstructed title',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const row=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra Histórica Norte/i});
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
 const safeRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra Histórica Sul/i});
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
 const historical=rows.filter({hasText:/Obra Histórica Norte/i});
 await expect(historical.locator('.portfolio-actions button')).toHaveText(['Abrir EV','Editar Obra']);
 await historical.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('#historicalEVTitle')).toHaveText('Obra histórica Norte - AM');
 await expect(page.locator('.ev-historical-modal')).toContainText('REV02');
 await expect(page.locator('.ev-historical-modal').getByRole('button',{name:'Reajustar INCC',exact:true})).toBeVisible();
 await expect(page.locator('.ev-historical-modal').getByRole('button',{name:'Editar EV',exact:true})).toBeVisible();
 await page.locator('.ev-historical-modal').getByRole('button',{name:'Fechar',exact:true}).click();
 const current=rows.filter({hasText:/Obra de Teste/i});
 await expect(current.locator('.portfolio-actions button')).toHaveText(['Abrir EV','Editar Obra']);
 await current.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('#evModalTitle')).toHaveText('Obra de teste');
 await expect(page.locator('.ev-version-panel')).toContainText('REV01');
 expect(await page.locator('#evForm .ev-line-row').count()).toBeGreaterThan(4);
 await expect(page.locator('.ev-modal-card').getByRole('button',{name:'Reajustar INCC',exact:true})).toBeVisible();
 await page.locator('.ev-modal-card').getByRole('button',{name:'Fechar',exact:true}).click();
 const empty=rows.filter({hasText:/Obra Nova Sem EV/i});
 await expect(empty.locator('.portfolio-actions button')).toHaveText(['Criar EV','Editar Obra']);
 await empty.getByRole('button',{name:'Criar EV',exact:true}).click();
 await expect(page.locator('#evModalTitle')).toHaveText('Obra nova sem EV');
 expect(await page.locator('#evForm .ev-line-row').count()).toBeGreaterThan(4);
 await expect(page.locator('.ev-modal-card').getByRole('button',{name:'Reajustar INCC',exact:true})).toHaveCount(0);
 await page.locator('#evForm [name="evAreaConstruida"]').fill('75');
 await page.locator('#evForm').getByRole('button',{name:'Salvar rascunho',exact:true}).click();
 await expect(page.locator('#cloudStatus')).toHaveText('Sincronizado');
 await page.locator('.ev-modal-card').getByRole('button',{name:'Fechar',exact:true}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const updatedEmpty=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra Nova Sem EV/i});
 await expect(updatedEmpty.locator('td').nth(10)).toHaveText('75,00');
 await expect(updatedEmpty.locator('.portfolio-actions button')).toHaveText(['Abrir EV','Editar Obra']);
 expect(b.errors).toEqual([]);
});

test('work funding is persisted in Works and Finance before confirming the form',async({page})=>{
 const b=await backend(page,'Admin',false,{fundRecords:[{id:'seed-fund',workId:'test-work',obraId:'test-work',ordemInternaSAP:'OI-TESTE-1',ordemInterna:'OI-TESTE-1',account:'OI-TESTE-1',type:'works',approved:50,requested:50}]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 await page.getByRole('button',{name:'+ Nova obra',exact:true}).click();
 const form=page.locator('#workForm');
 await form.locator('[name="nome"]').fill('Nova obra com verba');
 await form.locator('[name="tipoUnidade"]').fill('Hospital');
 await form.locator('[name="cidade"]').fill('Recife');
 await form.locator('[name="uf"]').fill('PE');
 await form.locator('[name="regiao"]').fill('Nordeste');
 await form.locator('[name="anoObra"]').fill('2026');
 await form.locator('[name="tipoVerba"]').selectOption('CAPEX');
 await form.locator('[name="ordemInternaSAP"]').fill('OI-TESTE-1');
 await form.locator('[name="valorVerbaAportada"]').fill('1000');
 await form.getByRole('button',{name:'Cadastrar obra',exact:true}).click();
 await expect(form).toHaveCount(0);
 const changes=b.requests.flatMap(request=>request.changes);
 const work=changes.find(change=>change.entity==='projects_works'&&change.document?.nome?.toLowerCase()==='nova obra com verba');
 expect(work).toBeTruthy();
 expect(changes.filter(change=>change.entity==='projects_works'&&change.key===work.key)).toHaveLength(1);
 expect(changes.some(change=>change.entity==='finance_funds'&&change.document?.workId===work.key)).toBe(true);
 expect(changes.some(change=>change.entity==='finance_funds'&&change.key==='seed-fund')).toBe(false);
 expect(changes.some(change=>change.entity==='finance_manual_orders'&&change.document?.workId===work.key)).toBe(true);
 await expect(page.locator('#cloudStatus')).toHaveText('Sincronizado');
 await page.locator(`[data-action="edit-portfolio-work"][data-id="${work.key}"]`).click();
 const editForm=page.locator('#workForm');
 await editForm.locator('[name="valorVerbaAportada"]').fill('1200');
 await editForm.getByRole('button',{name:'Salvar alterações',exact:true}).click();
 await expect(editForm).toHaveCount(0);
 const updates=b.requests.flatMap(request=>request.changes).filter(change=>change.operation==='upsert');
 expect(updates.some(change=>change.entity==='projects_works'&&change.key===work.key&&change.document.valorVerbaAportada===1200)).toBe(true);
 expect(updates.some(change=>change.entity==='finance_funds'&&change.document?.workId===work.key&&change.document?.approved===1200)).toBe(true);
 expect(updates.some(change=>change.entity==='finance_manual_orders'&&change.document?.workId===work.key&&change.document?.montantePlanejado===1200)).toBe(true);
 expect(b.errors).toEqual([]);
});

test('work funding failure never reports a fully saved work',async({page})=>{
 const b=await backend(page,'Admin',false,{failFinanceCommit:true});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 await page.getByRole('button',{name:'+ Nova obra',exact:true}).click();
 const form=page.locator('#workForm');
 await form.locator('[name="nome"]').fill('Obra com falha financeira');
 await form.locator('[name="tipoUnidade"]').fill('Hospital');
 await form.locator('[name="cidade"]').fill('Recife');
 await form.locator('[name="uf"]').fill('PE');
 await form.locator('[name="regiao"]').fill('Nordeste');
 await form.locator('[name="tipoVerba"]').selectOption('CAPEX');
 await form.locator('[name="ordemInternaSAP"]').fill('OI-FALHA');
 await form.locator('[name="valorVerbaAportada"]').fill('1000');
 await form.getByRole('button',{name:'Cadastrar obra',exact:true}).click();
 await expect(page.locator('#cloudStatus')).toHaveText('Falha na sincronização');
 await expect(page.getByRole('heading',{name:'Alterações não confirmadas no banco'})).toBeVisible();
 await expect(form).toBeVisible();
 await expect(form.locator('#formError')).toContainText('A obra foi salva, mas a integração financeira falhou');
 expect(b.requests.some(request=>request.changes.some(change=>change.entity==='projects_works'))).toBe(true);
 expect(b.requests.some(request=>request.changes.some(change=>change.entity==='finance_funds'))).toBe(true);
 expect(b.errors).toEqual([]);
});

test('portfolio standardizes work names, preserves acronyms and supplies missing codes',async({page})=>{
 const works=[
  {id:'upper-work',nome:'9902. PA BARRA DE HTL / HS / IT - RJ',codigoOriginal:'',uf:'RJ',cidade:'Rio de Janeiro',tipoUnidade:'Pronto Atendimento'},
  {id:'lower-work',nome:'novo centro de tea - sp',codigoOriginal:'1234',uf:'SP',cidade:'São Paulo',tipoUnidade:'TEA'},
  {id:'missing-code-work',nome:'clínica de apoio - ce',codigoOriginal:'',uf:'CE',cidade:'Fortaleza',tipoUnidade:'Clínica'},
  {id:'brand-work',nome:'0000. AMPLIAÇÃO HAPNATAL E HAPFOR - CE',codigoOriginal:'',uf:'CE',cidade:'Fortaleza',tipoUnidade:'Hospital'},
 ];
 const b=await backend(page,'Admin',false,{workRecords:works,demandRecords:[],evRecords:[]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const rows=page.locator('.portfolio-works-table tbody tr');
 await expect(rows).toHaveCount(4);
 await expect(rows.filter({hasText:'PA Barra'}).locator('td').nth(0)).toHaveText('9902');
 await expect(rows.filter({hasText:'PA Barra'}).locator('td').nth(1)).toHaveText('9902. PA Barra de HTL / HS / IT');
 await expect(rows.filter({hasText:'Novo Centro'}).locator('td').nth(1)).toHaveText('1234. Novo Centro de TEA');
 await expect(rows.filter({hasText:'Clínica de Apoio'}).locator('td').nth(0)).toHaveText('0000');
 await expect(rows.filter({hasText:'Clínica de Apoio'}).locator('td').nth(1)).toHaveText('0000. Clínica de Apoio');
 await expect(rows.filter({hasText:'HapNatal'}).locator('td').nth(1)).toHaveText('0000. Ampliação HapNatal e HapFor');
 expect(b.errors).toEqual([]);
});

test('admin deletes an unlinked work and linked works remain protected',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();

 const unlinkedRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra Nova Sem EV/i});
 await unlinkedRow.getByRole('button',{name:'Editar Obra',exact:true}).click();
 const workForm=page.locator('#workForm');
 await expect(workForm.getByRole('button',{name:'Excluir obra',exact:true})).toBeVisible();
 await workForm.getByRole('button',{name:'Excluir obra',exact:true}).click();

 const deleteModal=page.locator('.work-delete-modal');
 await expect(deleteModal.getByRole('heading',{name:'Excluir esta obra?',exact:true})).toBeVisible();
 await expect(deleteModal.locator('.split-item').filter({hasText:'EVs vinculados'}).locator('span')).toHaveText('0');
 await expect(deleteModal.locator('.split-item').filter({hasText:'Demandas vinculadas'}).locator('span')).toHaveText('0');
 const confirmDelete=deleteModal.getByRole('button',{name:'Excluir definitivamente',exact:true});
 await expect(confirmDelete).toBeDisabled();
 await deleteModal.locator('[data-work-delete-check]').check();
 await expect(confirmDelete).toBeEnabled();
 await confirmDelete.click();

 await expect(deleteModal).toHaveCount(0);
 await expect(unlinkedRow).toHaveCount(0);
 await expect.poll(()=>b.requests.flatMap(request=>request.changes).some(change=>change.entity==='projects_works'&&change.key==='work-without-ev'&&change.operation==='delete')).toBe(true);

 const linkedRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra de Teste/i});
 await linkedRow.getByRole('button',{name:'Editar Obra',exact:true}).click();
 await page.locator('#workForm').getByRole('button',{name:'Excluir obra',exact:true}).click();
 const blockedModal=page.locator('.work-delete-modal');
 await expect(blockedModal.getByRole('heading',{name:'Esta obra não pode ser excluída',exact:true})).toBeVisible();
 await expect(blockedModal.locator('.split-item').filter({hasText:'EVs vinculados'}).locator('span')).toHaveText('1');
 await expect(blockedModal.locator('.split-item').filter({hasText:'Demandas vinculadas'}).locator('span')).toHaveText('2');
 await expect(blockedModal.locator('[data-work-delete-check]')).toHaveCount(0);
 await expect(blockedModal.getByRole('button',{name:'Excluir definitivamente',exact:true})).toHaveCount(0);
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
 await expect(page.locator('[data-portfolio-quick-filter="tipologia"] option')).toHaveText([
  'Todas','Nova Unidade','Retrofit Unidade Existente','Ampliação Unidade Existente','Retrofit + Ampliação',
 ]);
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
 await expect(page.locator('.portfolio-works-table tbody')).toContainText('Obra Histórica Sul');
 await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();
 await expect(page.locator('.portfolio-works-table tbody tr')).toHaveCount(5);
 const historicalRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra Histórica Norte/i});
 await expect(historicalRow.locator('td').nth(0)).toHaveText('HIST-1');
 await expect(historicalRow.locator('td').nth(1)).toHaveText('HIST-1. Obra Histórica Norte');
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
 const currentRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra de Teste/i});
 await expect(currentRow.locator('td').nth(1)).toHaveText('TEST. Obra de Teste');
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
 const noEvRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra Nova Sem EV/i});
 await expect(noEvRow.locator('td').nth(0)).toHaveText('0000');
 await expect(noEvRow.locator('td').nth(1)).toHaveText('0000. Obra Nova sem EV');
 await expect(noEvRow.locator('td').nth(5)).toHaveText('Retrofit Unidade Existente');
 await expect(noEvRow.locator('td').nth(6)).toBeEmpty();
 await expect(noEvRow.locator('td').nth(10)).toBeEmpty();
 await expect(noEvRow.locator('td').nth(12)).toBeEmpty();
 await expect(noEvRow.locator('td').nth(13)).toBeEmpty();
 await expect(noEvRow.locator('.portfolio-actions button')).toHaveText(['Criar EV','Editar Obra']);
 const ambiguousPaRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:'ADM Barro Preto Timbiras'});
 await expect(ambiguousPaRow.locator('td').nth(1)).toHaveText('HIST-3. ADM Barro Preto Timbiras - 2° PA');
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

test('operational cards drag between columns and SICs enter director approval directly with Lecon visible',async({page})=>{
 const legacySic={
  ...structuredClone(payload.state.demands[0]),
  tipo:'Solicitação de Informações',
  observacao:'Descrição exclusiva da SIC que não deve aparecer no card.',
  sicMetadata:{
   ...structuredClone(payload.state.demands[0].sicMetadata),
   descricaoSic:'Descrição exclusiva da SIC que não deve aparecer no card.',
  },
 };
 const b=await backend(page,'Admin',false,{demandRecords:[legacySic,structuredClone(payload.state.demands[1])]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const kanbanColumns=page.locator('.operational-board-panel .kanban-column');
 await expect(kanbanColumns).toHaveCount(8);
 expect((await kanbanColumns.first().boundingBox()).height).toBeGreaterThanOrEqual(1100);
 await expect(kanbanColumns.locator('header h2')).toHaveText([
  'Fazer','Fazendo','Pausado','Aguardando Validação Sala Técnica','Aguardando Validação Obras',
  'Aguardando Aprovação Diretoria','Concluído','Cancelado',
 ]);

 await page.locator('[data-action="open-demand-detail"][data-id="test-budget-demand"]').click();
 const nonSicStatus=page.locator('#demandDetailForm [name="coluna"]');
 await expect(nonSicStatus.locator('option[value="aprovacaoDiretoria"]')).toHaveAttribute('disabled','');
 await page.locator('.modal-actions').getByRole('button',{name:'Fechar',exact:true}).click();

 const directorColumn=page.locator('.kanban-column[data-column="aprovacaoDiretoria"]');
 const fazerColumn=page.locator('.kanban-column[data-column="fazer"]');
 const fazendoColumn=page.locator('.kanban-column[data-column="fazendo"]');
 const sicCard=fazerColumn.locator('article[data-id="test-demand"]');
 await expect(sicCard.locator('.sic-card-title')).toHaveText('Teste');
 await expect(sicCard.locator('.sic-card-lecom span')).toHaveText('Lecon');
 await expect(sicCard.locator('.sic-card-lecom strong')).toHaveText('TEST-1');
 await expect(sicCard.locator('.demand-card-description')).toHaveCount(0);
 const leconAlignment=await sicCard.locator('.sic-card-lecom').evaluate(element=>{
  const label=element.querySelector('span').getBoundingClientRect();
  const value=element.querySelector('strong').getBoundingClientRect();
  return Math.abs(label.bottom-value.bottom);
 });
 expect(leconAlignment).toBeLessThanOrEqual(1);
 await sicCard.scrollIntoViewIfNeeded();
 const [sourceBox,targetBox]=await Promise.all([sicCard.boundingBox(),fazendoColumn.locator('.demand-list').boundingBox()]);
 await page.mouse.move(sourceBox.x+sourceBox.width/2,sourceBox.y+sourceBox.height/2);
 await page.mouse.down();
 await page.mouse.move(targetBox.x+targetBox.width/2,targetBox.y+Math.min(targetBox.height/2,120),{steps:8});
 await page.mouse.up();
 await expect(fazendoColumn.locator('article[data-id="test-demand"]')).toBeVisible();
 await expect(fazendoColumn.locator('article[data-id="test-demand"] .demand-card-stage-duration')).toHaveText('menos de 1 dia');
 await expect(directorColumn.locator('article[data-id="test-budget-demand"]')).toHaveCount(0);
 await page.waitForTimeout(400);
 await fazendoColumn.locator('article[data-id="test-demand"]').click();
 const sicStatus=page.locator('#demandDetailForm [name="coluna"]');
 await expect(sicStatus).toHaveValue('fazendo');
 await expect(sicStatus.locator('option[value="aprovacaoDiretoria"]')).not.toHaveAttribute('disabled','');
 await sicStatus.selectOption('aprovacaoDiretoria');
 await expect(sicStatus).toHaveValue('aprovacaoDiretoria');
 await page.locator('.modal-actions').getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(directorColumn.locator('article[data-id="test-demand"]')).toBeVisible();
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


test('operational completion requires EV decision then generated amount',async({page})=>{
 const demand={...structuredClone(payload.state.demands[1]),id:'finish-demand',obraId:'test-work',tipo:'EmissaoInicial',coluna:'fazendo',analistaResponsavel:'Ana',sicIds:[],anexos:[]};
 const b=await backend(page,'Admin',false,{demandRecords:[demand],analystNames:['Ana']});await login(page);
 await expect(page.locator('#cloudStatus')).toHaveText('Sincronizado');
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('article[data-id="finish-demand"]').click();
 const detail=page.locator('#demandDetailForm');
 await expect(detail.locator('[name="tipo"] option')).toHaveText(['Emissão Inicial','Revisão de Orçamento','Demanda Extra','SIC']);
 await expect(detail.getByText('Saldo',{exact:true})).toHaveCount(0);
 await detail.locator('[name="coluna"]').selectOption('concluido');
 await detail.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Confirme o impacto no EV'})).toBeVisible();
 await page.getByRole('button',{name:/Não houve mudança no EV/}).click();
 const completion=page.locator('#demandCompletionForm');
 await expect(completion).toBeVisible();
 await completion.locator('[name="valorGerado"]').fill('0,00');
 await completion.getByRole('button',{name:'Concluir demanda'}).click();
 await expect.poll(()=>b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='finish-demand'&&change.document?.coluna==='concluido')?.document?.evSemMudanca).toBe(true);
 const completedChange=b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='finish-demand'&&change.document?.coluna==='concluido');
 expect(completedChange.document.valorGerado).toBe(0);
 const card=page.locator('article[data-id="finish-demand"]');
 await expect(card).toBeVisible();
 await expect(card.locator('.demand-card-stage-time')).toHaveCount(0);
 await expect(card.locator('.demand-card-value')).toContainText(/R\$\s*0/);
 expect(b.errors).toEqual([]);
});


test('completed demand can register generated amount after legacy completion',async({page})=>{
 const demand={...structuredClone(payload.state.demands[1]),id:'legacy-completed-demand',obraId:'test-work',tipo:'DemandaExtra',coluna:'concluido',dataEntregaReal:'2026-09-15',analistaResponsavel:'Ana',sicIds:[],anexos:[]};
 const b=await backend(page,'Admin',false,{demandRecords:[demand],analystNames:['Ana']});await login(page);
 await expect(page.locator('#cloudStatus')).toHaveText('Sincronizado');
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('article[data-id="legacy-completed-demand"]').click();
 const detail=page.locator('#demandDetailForm');
 await expect(detail.getByRole('button',{name:'Informar valor gerado'})).toBeVisible();
 await detail.getByRole('button',{name:'Informar valor gerado'}).click();
 await expect(page.getByRole('heading',{name:'Confirme o impacto no EV'})).toBeVisible();
 await page.getByRole('button',{name:/Não houve mudança no EV/}).click();
 const completion=page.locator('#demandCompletionForm');
 await completion.locator('[name="valorGerado"]').fill('1.234,56');
 await completion.getByRole('button',{name:'Concluir demanda'}).click();
 await expect.poll(()=>b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='legacy-completed-demand')?.document?.valorGerado).toBe(1234.56);
 const saved=b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='legacy-completed-demand');
 expect(saved.document.evSemMudanca).toBe(true);
 expect(saved.document.coluna).toBe('concluido');
 await page.locator('article[data-id="legacy-completed-demand"]').click();
 const savedDetail=page.locator('#demandDetailForm');
 await expect(savedDetail.getByRole('button',{name:'Ajustar valor gerado'})).toBeVisible();
 await expect(savedDetail).toContainText('Valor gerado');
 await expect(savedDetail).toContainText('Sem mudança no EV');
 expect(b.errors).toEqual([]);
});
