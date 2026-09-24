import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {flattenPayload,ENTITY_BY_NAME} from '../../src/module-model.js';

const id='11111111-1111-4111-8111-111111111111';
const payload={state:{
  works:[
    {id:'test-work',nome:'Obra de teste',codigoOriginal:'TEST',uf:'São Paulo - Sudeste',cidade:'São Paulo',tipoUnidade:'Clínica',classificacaoObra:'Venda de Serviços',tipologiaObra:'Reforma',anoObra:'2026',prazoDias:120,areaConstruida:100,areaEquivalente:100,ev:{id:'test-ev',status:'Incompleto',versaoAtual:1,lines:[{disciplinaId:'instalacoes-eletricas-e-spda',valorOrcado:100},{disciplinaId:'instalacoes-de-spda',valorOrcado:50}],versions:[],sicIds:[],demandaIds:[]}},
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

async function backend(page,role='Admin',malicious=false,{maintenanceSourceOverlap=false,analystCanWrite=false,analystNames=[],archivedDemandIds=[],demandRecords=null,evRecords=null,workRecords=null,sprintRecords=null,fundRecords=null,failFinanceCommit=false,moduleLoadDelay=0,sicApprovalStore=null}={}){
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
 const approval=sicApprovalStore||{payload:{obras:structuredClone(payload.state.sicApprovalWorks),weeks:structuredClone(payload.state.sicApprovalWeeks),snapshots:[],notificationReads:{}},revision:1};
 let records=flattenPayload(input).map(r=>({...r,revision:1}));
 let analysts=analystNames.map((nome,index)=>({
  id:`22222222-2222-4222-8222-${String(index+1).padStart(12,'0')}`,
  nome,
  created_at:'2026-09-09T12:00:00Z',
 }));
 const requests=[]; const moduleLoads=[]; const errors=[];
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
  else if(p.endsWith('/slt_budget_sic_approval_initial_state')){
   if(req.method()==='PATCH'){
    const expected=Number(url.searchParams.get('revision')?.replace('eq.',''));
    const body=req.postDataJSON();
    if(approval.revision===expected){
     approval.payload=body.payload;approval.revision=body.revision;
     data=[{revision:approval.revision}];
    }else data=[];
   }else if(url.searchParams.get('select')==='revision')data={revision:approval.revision};
   else data={payload:structuredClone(approval.payload),revision:approval.revision};
  }
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
  else if(p.endsWith('/slt_module_load')||p.endsWith('/slt_module_preview')){
   const module=req.postDataJSON()?.module_key;
   moduleLoads.push({kind:p.endsWith('/slt_module_preview')?'preview':'load',module});
   if(moduleLoadDelay)await new Promise(resolve=>setTimeout(resolve,moduleLoadDelay));
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
 return {requests,moduleLoads,errors};
}
async function login(page){await page.goto('./');await page.locator('#cloudLogin [name=email]').fill('admin@example.test');await page.locator('#cloudLogin [name=password]').fill('TestPassword123!');await page.locator('#cloudLogin button').click();await expect(page.locator('#legacyShell')).toBeVisible();}

test('Aprovação de SICs keeps the supplied dashboard and round-trips its full Excel backup',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="sicApprovals"]').filter({visible:true}).first().click();
 const frame=page.frameLocator('iframe.sic-approvals-frame');
 await expect(frame.getByRole('heading',{name:'Controle de EVs — Aditivos & Revisões'})).toBeVisible();
 await expect(frame.getByRole('button',{name:/Backup completo \(Excel\)/})).toBeVisible();
 await expect(frame.getByRole('button',{name:/Restaurar backup/})).toBeVisible();
 await expect(frame.locator('#weekChips')).toContainText('Semana teste');
 expect(await page.evaluate(userId=>localStorage.getItem('slt360:sic-approvals:'+userId+':initialized'),id)).toBeNull();
 page.on('dialog',dialog=>dialog.accept());
 const [download]=await Promise.all([
  page.waitForEvent('download'),frame.locator('#btnExportFullBackup').click()
 ]);
 expect(download.suggestedFilename()).toMatch(/^Controle_EVs_BACKUP_COMPLETO_.*\.xlsx$/);
 await frame.locator('#btnRestoreFullBackup').click();
 await frame.locator('#backupRestoreFile').setInputFiles({name:download.suggestedFilename(),mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:await readFile(await download.path())});
 await expect(frame.locator('#backupRestorePreview')).toContainText('Backup íntegro');
 await frame.locator('#btnConfirmBackupRestore').click();
 await expect(frame.locator('#toast')).toContainText('Restauração concluída');
 expect(b.errors).toEqual([]);
});

test('Aprovação de SICs shares Supabase state across signed-in users and rejects stale edits',async({browser,page})=>{
 const shared={payload:{obras:structuredClone(payload.state.sicApprovalWorks),weeks:structuredClone(payload.state.sicApprovalWeeks),snapshots:[],notificationReads:{}},revision:1};
 await backend(page,'Admin',false,{sicApprovalStore:shared});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="sicApprovals"]').filter({visible:true}).first().click();
 const a=page.frameLocator('iframe.sic-approvals-frame');
 await expect(a.locator('#weekChips')).toContainText('Semana teste');
 const context=await browser.newContext();
 try{
  const peer=await context.newPage();
  await backend(peer,'Admin',false,{sicApprovalStore:shared});await login(peer);
  await peer.getByRole('button',{name:'Abrir Obras'}).click();
  await peer.locator('[data-view="sicApprovals"]').filter({visible:true}).first().click();
  const b=peer.frameLocator('iframe.sic-approvals-frame');
  await expect(b.locator('#weekChips')).toContainText('Semana teste');
  const result=await a.locator('body').evaluate(el=>el.ownerDocument.defaultView.storageSet('sic-approval:notification-reads',JSON.stringify({shared:'2026-09-23'})));
  expect(result).toBe(true);
  expect(shared.revision).toBe(2);
  expect(shared.payload.notificationReads.shared).toBe('2026-09-23');
  // A stale second session cannot replace another user's decision.
  peer.on('dialog',dialog=>dialog.accept());
  const stale=await b.locator('body').evaluate(el=>el.ownerDocument.defaultView.storageSet('sic-approval:notification-reads',JSON.stringify({stale:true})));
  expect(stale).toBe(false);
  expect(shared.payload.notificationReads).toEqual({shared:'2026-09-23'});
  await peer.reload();
  await expect(peer.locator('iframe.sic-approvals-frame')).toBeVisible();
  const current=await b.locator('body').evaluate(el=>el.ownerDocument.defaultView.storageGet('sic-approval:notification-reads'));
  expect(JSON.parse(current)).toEqual({shared:'2026-09-23'});
 }finally{await context.close();}
});

test('refresh restores the last view only after the bank module is fully reloaded',async({page})=>{
 const b=await backend(page,'Admin',false,{moduleLoadDelay:300});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 await expect(page.getByRole('heading',{name:'Portfólio de Obras e EVs',exact:true})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('slt360-last-view-v1'))).toBe('portfolio');
 await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('slt360-last-ui-module-v1'))).toBe('works');
 const beforeReloadLoads=b.moduleLoads.length;

 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('#cloudGate')).toBeVisible();
 await expect(page.locator('#legacyShell')).toBeHidden();
 await expect(page.locator('#cloudMessage')).toContainText('Atualizando');
 await expect(page.getByRole('heading',{name:'Portfólio de Obras e EVs',exact:true})).toBeVisible();
 await expect(page.locator('#legacyShell')).toBeVisible();
 await expect(page.locator('#legacyShell')).not.toHaveAttribute('inert','');

 const reloadLoads=b.moduleLoads.slice(beforeReloadLoads);
 expect(reloadLoads.filter(item=>item.kind==='load'&&item.module==='budget')).toHaveLength(1);
 expect(reloadLoads.filter(item=>item.kind==='preview'&&item.module==='budget')).toHaveLength(0);
 expect(b.errors).toEqual([]);
});

test('mouse wheel scrolls the kanban column first and then continues on the page at the column limit',async({page})=>{
 const manyDemands=Array.from({length:36},(_,index)=>({
  ...structuredClone(payload.state.demands[1]),
  id:`wheel-demand-${index+1}`,
  obraId:'test-work',
  titulo:`Demanda vertical ${index+1}`,
  coluna:'fazer',
 }));
 const b=await backend(page,'Admin',false,{demandRecords:manyDemands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();

 const board=page.locator('.kanban-board[data-kanban-scroll-board]');
 const list=page.locator('.operational-board-panel .kanban-column[data-column="fazer"] .demand-list');
 const firstCard=list.locator('.demand-card').first();
 await expect(firstCard).toBeVisible();
 await expect.poll(()=>list.evaluate(node=>node.scrollHeight>node.clientHeight)).toBe(true);

 const boardLeftBefore=await board.evaluate(node=>node.scrollLeft);
 const listTopBefore=await list.evaluate(node=>node.scrollTop);
 await firstCard.hover();
 await page.mouse.wheel(0,500);
 await expect.poll(()=>list.evaluate(node=>node.scrollTop)).toBeGreaterThan(listTopBefore);
 expect(await board.evaluate(node=>node.scrollLeft)).toBe(boardLeftBefore);

 await list.evaluate(node=>{node.scrollTop=node.scrollHeight;});
 const listBottom=await list.evaluate(node=>node.scrollTop);
 await page.evaluate(()=>window.scrollTo(0,0));
 const pageTopBefore=await page.evaluate(()=>window.scrollY);
 await list.hover({position:{x:80,y:120}});
 await page.mouse.wheel(0,700);

 await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(pageTopBefore);
 expect(Math.abs((await list.evaluate(node=>node.scrollTop))-listBottom)).toBeLessThanOrEqual(1);
 expect(await board.evaluate(node=>node.scrollLeft)).toBe(boardLeftBefore);

 await list.evaluate(node=>{node.scrollTop=0;});
 await page.evaluate(()=>window.scrollTo(0,Math.max(900,document.documentElement.scrollHeight/2)));
 const pageTopBeforeUp=await page.evaluate(()=>window.scrollY);
 await list.hover({position:{x:80,y:120}});
 await page.mouse.wheel(0,-700);

 await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeLessThan(pageTopBeforeUp);
 expect(await list.evaluate(node=>node.scrollTop)).toBe(0);
 expect(await board.evaluate(node=>node.scrollLeft)).toBe(boardLeftBefore);
 expect(b.errors).toEqual([]);
});


test('Suporte360 stays closed on validation errors until the user clicks it',async({page})=>{
 const b=await backend(page);await login(page);
 const support=page.locator('#supportAssistantMount');
 await expect(support.locator('.haptec-panel')).toHaveCount(0);

 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 await page.getByRole('button',{name:'+ Nova obra',exact:true}).click();
 const form=page.locator('#workForm');
 await form.getByRole('button',{name:'Cadastrar obra',exact:true}).click();

 await expect(form.locator('#formError')).toBeVisible();
 await expect(support.locator('.haptec-panel')).toHaveCount(0);
 await expect(support.getByRole('button',{name:/^Suporte360/})).toHaveAttribute('aria-expanded','false');

 await form.getByRole('button',{name:'Fechar',exact:true}).click();
 await support.getByRole('button',{name:/^Suporte360/}).click();
 await expect(support.locator('.haptec-panel')).toBeVisible();
 await expect(support.locator('.haptec-messages')).toContainText('obrigatório');
 expect(b.errors).toEqual([]);
});

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
 const worksHomeCard=homeCards.filter({hasText:'Obras'});
 await expect(worksHomeCard.locator('.home-launchpad-card__metrics')).toContainText('Cards em andamento');
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await expect(page.getByRole('heading',{name:'Visão Operacional',exact:true})).toBeVisible();
 await expect(page.getByText(/Pendências de cotação:/)).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Sprints globais',exact:true})).toHaveCount(0);
 await expect(page.locator('#globalSearch')).toHaveCount(0);
 await expect(page.locator('[data-operational-search]')).toBeVisible();
 await expect(page.getByRole('button',{name:'Exportar relatório filtrado',exact:true})).toBeVisible();
 await expect(page.locator('[data-operational-filter-group="status"]')).toHaveCount(1);
 await expect(page.locator('[data-operational-date-filter]')).toHaveCount(2);
 await expect(page.locator('.operational-export-hint')).toContainText('considera exatamente os filtros aplicados');
 await expect(page.locator('[data-kpi="opTotal"]')).toContainText('Total no Filtro');
 await expect(page.getByText('Total na sprint',{exact:true})).toHaveCount(0);
 await expect(page.locator('.operational-board-panel').getByRole('button',{name:'Visão gerencial',exact:true})).toHaveCount(0);
 const typeFilter=page.locator('[data-operational-filter-group="type"]');
 await expect(typeFilter.locator('.operational-multiselect-menu span')).toHaveText([
  'Emissão Inicial','Revisão de Orçamento','Demanda Extra','SIC',
 ]);
 const deadlineFilter=page.locator('[data-operational-filter-group="punctuality"]');
 await expect(deadlineFilter.locator('.operational-multiselect-menu span')).toHaveText(['Atrasadas','No prazo','Sem prazo']);
 await deadlineFilter.locator('summary').click();
 await expect(deadlineFilter).toHaveAttribute('open','');
 await page.getByRole('heading',{name:'Visão Operacional',exact:true}).click();
 await expect(deadlineFilter).not.toHaveAttribute('open','');
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
 const alignedDemandHeaders=await page.locator('.operational-board-panel article[data-id="test-demand"], .operational-board-panel article[data-id="test-budget-demand"]').evaluateAll(cards=>cards.map(card=>{
  const type=card.querySelector('.demand-type-badge')?.getBoundingClientRect();
  const sprint=card.querySelector('.sprint-flag')?.getBoundingClientRect();
  const top=card.querySelector('.demand-card-top');
  const topRect=top?.getBoundingClientRect();
  const cardRect=card.getBoundingClientRect();
  return {
    delta:type&&sprint?Math.abs(type.top-sprint.top):999,
    topFits:Boolean(topRect)&&topRect.right<=cardRect.right+1,
    noHorizontalOverflow:card.scrollWidth<=card.clientWidth+1,
  };
 }));
 alignedDemandHeaders.forEach(item=>{
  expect(item.delta).toBeLessThanOrEqual(3);
  expect(item.topFits).toBe(true);
  expect(item.noHorizontalOverflow).toBe(true);
 });
 const analystFilter=page.locator('[data-operational-filter-group="analyst"]');
 await expect(analystFilter.locator('.operational-multiselect-menu span')).toHaveText(['Sem analista']);
 await analystFilter.locator('summary').click();
 await analystFilter.locator('[data-operational-filter="analyst"][value="__sem_analista__"]').check();
 await expect(page.locator('.operational-board-panel article')).toHaveCount(2);
 await clearDemandFilters.click();
 await expect(page.locator('[data-operational-filter-group="status"]')).toHaveCount(1);
 await expect(page.locator('[data-operational-date-filter="dateFrom"]')).toHaveValue('');
 await expect(page.locator('[data-operational-date-filter="dateTo"]')).toHaveValue('');
 const worksTabs=page.locator('nav[aria-label="Navegação interna de Obras"] .module-tab');
 await expect(worksTabs).toHaveCount(6);
 await expect(worksTabs).toHaveText(['Visão Operacional','Visão Gerencial','Visão Estratégica','Portfólio de Obras',"Estudo de SIC's","Aprovação de SIC's"]);
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

test('Home counts only Obras demands that are actually in progress',async({page})=>{
 const base={...structuredClone(payload.state.demands[1]),obraId:'test-work'};
 const demands=[
  {...base,id:'home-doing',coluna:'fazendo'},
  {...base,id:'home-paused',coluna:'pausado'},
  {...base,id:'home-done',coluna:'concluido'},
  {...base,id:'home-canceled',coluna:'cancelado'},
 ];
 const b=await backend(page,'Admin',false,{demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await expect(page.locator('.operational-board-panel article')).toHaveCount(4);
 await page.getByRole('button',{name:'Home',exact:true}).click();
 const worksCard=page.locator('.home-launchpad-card--orcamento');
 await expect(worksCard.locator('.home-launchpad-card__metrics')).toContainText('Cards em andamento');
 await expect(worksCard.locator('.home-launchpad-card__metrics b').nth(1)).toHaveText('1');
 expect(b.errors).toEqual([]);
});

test('operational cards prioritize the validation date until validation is sent',async({page})=>{
 const base={...structuredClone(payload.state.demands[0]),tipo:'EmissaoInicial',sicApprovalStatus:''};
 const demands=[
  {...base,id:'validation-pending',coluna:'fazer',dataPrevEnvioValidacaoObras:'2026-10-01',dataPrevistaEntrega:'2026-10-20'},
  {...base,id:'validation-sent',coluna:'validacaoObras',dataPrevEnvioValidacaoObras:'2026-10-02',dataPrevistaEntrega:'2026-10-21'},
  {...base,id:'validation-date-missing',coluna:'fazer',dataPrevEnvioValidacaoObras:'',dataPrevistaEntrega:'2026-10-22'},
  {...base,id:'validation-overdue',coluna:'fazendo',dataPrevEnvioValidacaoObras:'2000-01-01',dataPrevistaEntrega:'2099-10-23'},
  {...base,id:'validation-completed',coluna:'concluido',dataPrevEnvioValidacaoObras:'2026-10-03',dataPrevistaEntrega:'2026-10-23',dataEntregaReal:'2026-09-15'},
 ];
 const b=await backend(page,'Admin',false,{demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const board=page.locator('.operational-board-panel');
 await expect(board.locator('article[data-id="validation-pending"] .demand-card-date')).toHaveText('Envio p/ validação: 01/10/2026');
 await expect(board.locator('article[data-id="validation-sent"] .demand-card-date')).toHaveText('Entrega prevista: 21/10/2026');
 await expect(board.locator('article[data-id="validation-date-missing"] .demand-card-date')).toHaveText('Entrega prevista: 22/10/2026');
 await expect(board.locator('article[data-id="validation-overdue"] .demand-card-date')).toHaveText('Entrega prevista: 23/10/2099');
 await expect(board.locator('article[data-id="validation-completed"] .demand-card-date')).toHaveText('Entrega real: 15/09/2026');
 await expect(board.getByRole('button',{name:'Aprovação'})).toHaveCount(0);
 expect(b.errors).toEqual([]);
});

test('demand and work modals expose a footer shortcut that opens the linked EV',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();

 await page.locator('[data-action="open-demand-detail"][data-id="test-budget-demand"]').first().click();
 const demandForm=page.locator('#demandDetailForm');
 const demandFooter=demandForm.locator('.modal-actions');
 await expect(demandFooter.getByRole('button',{name:'Abrir EV',exact:true})).toBeVisible();
 await demandFooter.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('#evForm')).toBeVisible();
 await expect(page.locator('#evModalTitle')).toContainText('Obra de teste');
 await page.locator('.ev-modal-card').getByRole('button',{name:'Fechar',exact:true}).click();

 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const row=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra de Teste/i});
 await row.locator('td').nth(1).click();
 const workForm=page.locator('#workForm');
 const workFooter=workForm.locator('.modal-actions');
 await expect(workFooter.getByRole('button',{name:'Abrir EV',exact:true})).toBeVisible();
 await workFooter.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('#evForm')).toBeVisible();
 await expect(page.locator('#evModalTitle')).toContainText('Obra de teste');
 expect(b.errors).toEqual([]);
});

test('real validation send date automatically moves the card to Obras validation',async({page})=>{
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

test('validation KPI removes Sala Técnica stage, preserves legacy cards and excludes approved director stage',async({page})=>{
 const base={...structuredClone(payload.state.demands[1]),tipo:'SIC'};
 const demands=[
  {...base,id:'validation-st-legacy',coluna:'validacaoST'},
  {...base,id:'validation-works',coluna:'validacaoObras'},
  {...base,id:'validation-director',coluna:'aprovacaoDiretoria'},
  {...base,id:'validation-director-approved',coluna:'aprovadoDiretoria'},
 ];
 const b=await backend(page,'Admin',false,{demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await expect(page.locator('.kanban-column[data-column="validacaoST"]')).toHaveCount(0);
 await expect(page.locator('.kanban-column[data-column="validacaoObras"] article')).toHaveCount(2);
 await expect(page.locator('.kanban-column[data-column="aprovadoDiretoria"] article')).toHaveCount(1);
 const validationKpi=page.locator('[data-action="open-kpi-detail"][data-kpi="opValidacao"]');
 await expect(validationKpi).toContainText('3');
 await expect(validationKpi).toContainText('Obras e Diretoria');
 await validationKpi.click();
 const metrics=page.locator('.kpi-modal-card .kpi-detail-grid .split-item');
 await expect(metrics.locator('strong')).toHaveText(['Total em validação','Aguardando Obras','Validado Obras','Aprovação Diretoria']);
 await expect(metrics.locator('span')).toHaveText(['3','2','0','1']);
 await expect(page.locator('.kpi-detail-table tbody tr')).toHaveCount(3);
 expect(b.errors).toEqual([]);
});

test('kanban reorders by displayed milestone, creation date and real completion',async({page})=>{
 const base={...structuredClone(payload.state.demands[1]),obraId:'test-work',coluna:'fazer',dataEnvioRealValidacaoObras:'',dataValidacaoObras:''};
 const demands=[
  {...base,id:'sort-no-date',dataPrevEnvioValidacaoObras:'',dataPrevistaEntrega:'',createdAt:'2026-09-01T09:00:00Z'},
  {...base,id:'sort-validation-far',dataPrevEnvioValidacaoObras:'2099-02-01',dataPrevistaEntrega:'2099-01-01',createdAt:'2026-09-01T09:00:00Z'},
  {...base,id:'sort-validation-near-new',dataPrevEnvioValidacaoObras:'2099-01-02',dataPrevistaEntrega:'2099-12-31',createdAt:'2026-09-12T09:00:00Z'},
  {...base,id:'sort-validation-near-old',dataPrevEnvioValidacaoObras:'2099-01-02',dataPrevistaEntrega:'2099-12-31',createdAt:'2026-09-10T09:00:00Z'},
  {...base,id:'sort-overdue-validation',dataPrevEnvioValidacaoObras:'2000-01-01',dataPrevistaEntrega:'2099-01-01',createdAt:'2026-09-09T09:00:00Z'},
  {...base,id:'sort-completed-old',coluna:'concluido',dataEntregaReal:'2026-09-10',createdAt:'2026-08-01T09:00:00Z'},
  {...base,id:'sort-completed-new',coluna:'concluido',dataEntregaReal:'2026-09-14',createdAt:'2026-08-02T09:00:00Z'},
 ];
 const b=await backend(page,'Admin',false,{demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 const fazer=page.locator('.kanban-column[data-column="fazer"]');
 const concluded=page.locator('.kanban-column[data-column="concluido"]');
 const expectedOpen=['sort-overdue-validation','sort-validation-near-old','sort-validation-near-new','sort-validation-far','sort-no-date'];
 const expectedCompleted=['sort-completed-new','sort-completed-old'];
 await expect(page.locator('.operational-board-panel .kanban-sort-button')).toHaveCount(9);
 expect(await fazer.locator('article').evaluateAll(cards=>cards.map(card=>card.dataset.id))).toEqual(expectedOpen);
 expect(await concluded.locator('article').evaluateAll(cards=>cards.map(card=>card.dataset.id))).toEqual(expectedCompleted);
 await fazer.locator('.demand-list').evaluate((list)=>{
  const cards=[...list.querySelectorAll('article')];
  cards.reverse().forEach(card=>list.append(card));
 });
 expect(await fazer.locator('article').evaluateAll(cards=>cards.map(card=>card.dataset.id))).toEqual([...expectedOpen].reverse());
 await page.locator('[data-action="reorder-kanban-column"][data-column="fazer"]').click();
 expect(await page.locator('.kanban-column[data-column="fazer"] article').evaluateAll(cards=>cards.map(card=>card.dataset.id))).toEqual(expectedOpen);
 await page.locator('[data-action="reorder-kanban-column"][data-column="concluido"]').click();
 expect(await page.locator('.kanban-column[data-column="concluido"] article').evaluateAll(cards=>cards.map(card=>card.dataset.id))).toEqual(expectedCompleted);
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
 await expect(counts).toHaveText(['1','1','1','1','0','0','0','0','0']);
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


test('pausing and canceling a demand require a reason and persist it in the card',async({page})=>{
 const demand={...structuredClone(payload.state.demands[1]),id:'reason-required-demand',obraId:'test-work',coluna:'fazer',phaseHistory:[]};
 const b=await backend(page,'Admin',false,{demandRecords:[demand]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await expect.poll(()=>page.evaluate(()=>window.SLT_CLOUD.canWrite('works'))).toBe(true);

 let card=page.locator('article[data-id="reason-required-demand"]');
 await expect(card).toBeVisible();
 await card.click();
 let form=page.locator('#demandDetailForm');
 await form.locator('[name="coluna"]').selectOption('pausado');
 let reason=form.locator('[name="statusReason"]');
 await expect(reason).toBeVisible();
 await expect(reason).toHaveAttribute('required','');
 await form.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(form).toBeVisible();
 await reason.fill('Aguardando definição do escopo pela área solicitante.');
 await form.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(page.locator('.kanban-column[data-column="pausado"] article[data-id="reason-required-demand"]')).toBeVisible();
 await expect.poll(()=>{
  const changes=b.requests.flatMap(request=>request.changes).filter(change=>change.entity==='budget_demands'&&change.key==='reason-required-demand');
  return changes.at(-1)?.document?.motivoPausa;
 }).toBe('Aguardando definição do escopo pela área solicitante.');

 card=page.locator('.kanban-column[data-column="pausado"] article[data-id="reason-required-demand"]');
 await card.click();
 form=page.locator('#demandDetailForm');
 await expect(form.locator('[name="statusReason"]')).toHaveValue('Aguardando definição do escopo pela área solicitante.');
 await form.locator('[name="coluna"]').selectOption('cancelado');
 reason=form.locator('[name="statusReason"]');
 await expect(reason).toBeVisible();
 await expect(reason).toHaveAttribute('required','');
 await expect(reason).toHaveValue('');
 await form.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(form).toBeVisible();
 await reason.fill('Demanda cancelada pela área solicitante.');
 await form.getByRole('button',{name:'Salvar',exact:true}).click();

 await expect(page.locator('.kanban-column[data-column="cancelado"] article[data-id="reason-required-demand"]')).toBeVisible();
 await expect.poll(()=>{
  const changes=b.requests.flatMap(request=>request.changes).filter(change=>change.entity==='budget_demands'&&change.key==='reason-required-demand');
  return changes.at(-1)?.document?.motivoCancelamento;
 }).toBe('Demanda cancelada pela área solicitante.');
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
 await expect(form.locator('[name="obraNumber"]')).toHaveCount(0);
 await expect(form.locator('[name="obraNome"]')).toHaveCount(0);
 await expect(form.locator('[name="tituloSic"]')).toHaveValue('SIC de teste');
 await expect(form.locator('[name="numeroSic"]')).toHaveValue('SIC-001');
 await expect(form.locator('[name="sicDescricao"]')).toHaveValue('Descrição da SIC');
 await expect(form.locator('[name="motivo"]')).toHaveValue('RevisaoProjeto');
 await expect(form.locator('[name="motivo"] option:not([hidden])')).toHaveText(['Revisão de Projeto','Revisão de Escopo','Escopo Complementar','Solicitação de Campo']);
 await expect(form.locator('[name="prioridade"]')).toHaveCount(1);
 await expect(form.locator('[name="dataPrevistaEntrega"]')).toHaveCount(1);
 await expect(form.locator('[name="projetosEnvolvidos"]')).toHaveCount(0);
 await expect(form.getByText('Disciplinas para postagem no EV',{exact:true})).toHaveCount(0);
 await expect(form.getByText('Arquivos anexados',{exact:true})).toHaveCount(0);
 await expect(form.getByText('Fluxo de aprovação',{exact:true})).toHaveCount(0);
 await expect(form.getByRole('button',{name:'Enviar para aprovação',exact:true})).toHaveCount(0);
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
 await expect(sic.locator('[name="obraNumber"]')).toHaveCount(0);
 await expect(sic.locator('[name="obraNome"]')).toHaveCount(0);
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
 const b=await backend(page,'Admin',false,{analystNames:['Ana','Bruno','Somente no diretório'],demandRecords:demands});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="worksManagement"]').filter({visible:true}).first().click();

 await expect(page.locator('[data-operational-search]')).toBeVisible();
 await expect(page.locator('[data-operational-filter-group]')).toHaveCount(5);
 await expect(page.locator('[data-operational-date-filter]')).toHaveCount(2);

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
 await expect(analystTable.locator('tbody tr').filter({hasText:'Ana'}).locator('td')).toHaveText(['Ana','3','2','2','0','100%','—','R$ 300,00','1']);
 await expect(analystTable).not.toContainText('Somente no diretório');

 const managementAnalystFilter=page.locator('[data-operational-filter-group="analyst"]');
 await managementAnalystFilter.locator('summary').click();
 await managementAnalystFilter.locator('[data-operational-filter="analyst"][value="Ana"]').check();
 await expect(kpiValue('Demandas no filtro')).toHaveText('3');
 await expect(kpiValue('Analistas responsáveis')).toHaveText('1');
 await expect(page.locator('.management-tabs button')).toHaveText(['Concluídas 2','A fazer 1','Em fluxo 1','Canceladas 0','Todas 3']);
 await page.locator('.filter-panel [data-action="clear-operational-filters"]').click();
 await expect(kpiValue('Demandas no filtro')).toHaveText('5');

 await page.locator('.management-tabs [data-filter="todo"]').click();
 await expect(kpiValue('Demandas no filtro')).toHaveText('1');
 await expect(kpiValue('Dentro do prazo')).toHaveText('1 (100%)');
 await expect(kpiValue('Analistas responsáveis')).toHaveText('1');
 await expect(page.locator('.panel').filter({has:page.getByRole('heading',{name:'Demandas por analista'})})).toContainText('Ana');
 await expect(analystPanel.locator('tbody tr')).toHaveCount(1);
 const managementGridTops=await page.locator('#mainContent .content-grid').evaluateAll(grids=>grids.map(grid=>{const panels=[...grid.children].filter(child=>child.classList.contains('panel'));return panels.map(panel=>Math.round(panel.getBoundingClientRect().top));}).filter(row=>row.length>1));
 for(const row of managementGridTops)expect(new Set(row).size).toBe(1);
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
 await expect.poll(()=>page.evaluate(()=>window.SLT_CLOUD.canWrite('works'))).toBe(true);
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
 await expect(catalogs).toHaveCount(7);
 await expect(catalogs.locator('h3')).toHaveText(['Status do EV','Disciplinas do EV','Categorias de obra','Tipologias de obra','Anos de obra','Regiões','Estados']);
 const evStatusCard=page.locator('[data-configuration-type="ev-status"]');
 await expect(evStatusCard.locator('.configuration-catalog-item strong')).toHaveText(['Sem EV','Incompleto','Completo']);
 await expect(evStatusCard).not.toContainText('Rascunho');
 await expect(evStatusCard.getByRole('button')).toHaveCount(0);
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
 const configuredWorkRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra de Teste/i});
 await configuredWorkRow.locator('td').nth(1).click();
 const editWorkForm=page.locator('#workForm');
 await expect(page.locator('#portfolioWorkDetail')).toHaveCount(0);
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
 await expect(page.locator('#demandForm [name="disciplinaId"]')).toHaveCount(0);
 await expect(page.locator('#demandForm [data-demand-project]')).toHaveCount(0);
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
 await expect(page.locator('#toast')).toHaveClass(/is-bank-saved/);
 await expect(page.locator('#toast')).toHaveAttribute('data-bank-saved-message','✓ Alteração salva no banco.');
 const createdChange=b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='DEM-022');
 expect(createdChange?.document?.analistaResponsavel).toBe('Técnico A');
 expect(createdChange?.document?.etiquetas).toEqual(['Urgente','Diretoria']);
 expect(b.requests.flatMap(request=>request.changes).some(change=>change.entity==='budget_demands'&&change.key==='DEM-021')).toBe(false);

 await page.getByRole('button',{name:'Nova demanda',exact:true}).click();
 await page.locator('.demand-type-option[data-type="SIC"]').click();
 const sicForm=page.locator('#demandForm');
 await expect(sicForm.locator('[name="sprintId"]')).toHaveValue('sprint-017');
 await expect(sicForm.locator('[name="obraNumber"]')).toHaveCount(0);
 await expect(sicForm.locator('[name="obraNome"]')).toHaveCount(0);
 await expect(sicForm.locator('[name="motivo"]')).toHaveValue('RevisaoProjeto');
 await expect(sicForm.locator('[name="motivo"] option')).toHaveText(['Revisão de Projeto','Revisão de Escopo','Escopo Complementar','Solicitação de Campo']);
 await expect(sicForm.getByText('Projetos envolvidos',{exact:true})).toHaveCount(0);
 await expect(sicForm.getByText('Disciplinas afetadas',{exact:true})).toHaveCount(0);
 await expect(sicForm.getByText('Arquivo em anexo',{exact:true})).toHaveCount(0);
 await expect(sicForm.locator('[name="sicFiles"]')).toHaveCount(0);
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

test('Abrir EV never falls back to the legacy historical composition modal',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const row=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra Histórica Norte/i});
 await row.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('.ev-historical-modal')).toHaveCount(0);
 await expect(page.locator('.ev-modal-card')).toBeVisible();
 await expect(page.locator('#evModalTitle')).toHaveText('Obra histórica Norte - AM');
 await expect(page.locator('#evForm [data-action="toggle-ev-zero-lines"]')).toHaveText('Exibir vazios');
 await expect(page.locator('#evForm .ev-section-row')).toHaveCount(3);
 expect(b.errors).toEqual([]);
});

test('portfolio rows expose EV and work-detail actions',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const rows=page.locator('.portfolio-works-table tbody tr');

 const historical=rows.filter({hasText:/Obra Histórica Norte/i});
 await expect(historical.locator('.portfolio-actions button')).toHaveText(['Abrir EV']);
 await historical.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('.ev-historical-modal')).toHaveCount(0);
 await expect(page.locator('#evModalTitle')).toHaveText('Obra histórica Norte - AM');
 const historicalAreas=page.locator('.ev-modal-card .ev-header-area');
 await expect(historicalAreas).toHaveCount(2);
 await expect(historicalAreas.nth(0)).toContainText('Área equivalente');
 await expect(historicalAreas.nth(0)).toContainText('200,00 m²');
 await expect(page.locator('#evForm [data-action="toggle-ev-zero-lines"]')).toHaveText('Exibir vazios');
 await expect(page.locator('#evForm .ev-section-row')).toHaveCount(3);
 const historicalZeroRows=page.locator('#evForm .ev-line-row').filter({has:page.locator('.ev-value-input')});
 const historicalValues=await historicalZeroRows.locator('.ev-value-input').evaluateAll(inputs=>inputs.map(input=>input.value));
 const historicalZeroIndexes=historicalValues.map((value,index)=>({value,index})).filter(({value})=>Math.abs(Number(String(value).replace(/\./g,'').replace(',','.'))||0)<0.000001);
 expect(historicalZeroIndexes.length).toBeGreaterThan(0);
 for(const {index} of historicalZeroIndexes.slice(0,3)) await expect(historicalZeroRows.nth(index)).toBeHidden();
 await page.locator('.ev-modal-card').getByRole('button',{name:'Fechar',exact:true}).click();

 const current=rows.filter({hasText:/Obra de Teste/i});
 await expect(current.locator('.portfolio-actions button')).toHaveText(['Abrir EV']);
 await current.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('#evModalTitle')).toHaveText('Obra de teste');
 await expect(page.locator('.ev-version-panel')).toHaveCount(0);
 const currentAreas=page.locator('.ev-modal-card .ev-header-area');
 await expect(currentAreas).toHaveCount(2);
 await expect(currentAreas.nth(0)).toContainText('Área equivalente');
 await expect(currentAreas.nth(0)).toContainText('100,00 m²');
 await expect(currentAreas.nth(1)).toContainText('Área construída');
 await expect(currentAreas.nth(1)).toContainText('100,00 m²');
 const currentKpis=page.locator('.ev-modal-card .ev-top-kpis > .mini-metric');
 await expect(currentKpis).toHaveCount(6);
 await expect(currentKpis.locator('small')).toHaveText([
  'Total da obra (sem taxa de risco)',
  'Custo da obra por m² (sem taxa de risco)',
  'Total da obra (com taxa de risco)',
  'Custo da obra por m² (com taxa de risco)',
  "Total de SIC's",
  "Percentual das SIC's no valor total da obra",
 ]);
 await expect(currentKpis.nth(1)).toContainText('/m²');
 await expect(currentKpis.nth(3)).toContainText('/m²');
 await expect(currentKpis.nth(5)).toContainText('0,00%');

 const groupHeaders=page.locator('#evForm .ev-section-row');
 await expect(groupHeaders).toHaveCount(3);
 await expect(groupHeaders.nth(0)).toContainText('Obra');
 await expect(groupHeaders.nth(1)).toContainText('Outras categorias');
 await expect(groupHeaders.nth(2)).toContainText("SIC's");
 await expect(groupHeaders.locator('[data-ev-group-total]')).toHaveCount(3);
 await expect(page.locator('#evForm [data-discipline-id="sics"]')).toHaveCount(0);

 const evRows=page.locator('#evForm .ev-line-row');
 const evInputs=evRows.locator('.ev-value-input');
 const initialValues=await evInputs.evaluateAll(inputs=>inputs.map(input=>input.value));
 const parseInput=value=>Number(String(value).replace(/\./g,'').replace(',','.'))||0;
 const initialNonZeroCount=initialValues.filter(value=>Math.abs(parseInput(value))>0.000001).length;
 const firstZeroIndex=initialValues.findIndex(value=>Math.abs(parseInput(value))<0.000001);
 expect(await evRows.count()).toBeGreaterThan(4);
 expect(firstZeroIndex).toBeGreaterThanOrEqual(0);

 const hideEmpty=page.locator('#evForm [data-action="toggle-ev-zero-lines"]');
 await expect(hideEmpty).toHaveText('Exibir vazios');
 await expect(page.locator('#evForm .ev-line-row:visible')).toHaveCount(initialNonZeroCount);
 await hideEmpty.click();
 await expect(hideEmpty).toHaveText('Ocultar vazios');
 await expect(page.locator('#evForm .ev-line-row:visible')).toHaveCount(initialValues.length);
 await evInputs.nth(firstZeroIndex).fill('25,00');
 await hideEmpty.click();
 await expect(hideEmpty).toHaveText('Exibir vazios');
 await expect(page.locator('#evForm .ev-line-row:visible')).toHaveCount(initialNonZeroCount+1);
 await hideEmpty.click();
 await expect(hideEmpty).toHaveText('Ocultar vazios');
 await evInputs.nth(firstZeroIndex).fill('0,00');

 const obraGroup=page.locator('#evForm [data-ev-group-body="CustosDaObra"]');
 const localBefore=await obraGroup.locator('.ev-line-row[data-local-line="true"]').count();
 await obraGroup.getByRole('button',{name:'+ Nova linha',exact:true}).click();
 const localRows=obraGroup.locator('.ev-line-row[data-local-line="true"]');
 await expect(localRows).toHaveCount(localBefore+1);
 const addedLocal=localRows.last();
 await addedLocal.locator('.ev-local-name-input').fill('Linha exclusiva da obra');
 await addedLocal.locator('.ev-value-input').fill('33,00');
 await expect(obraGroup.locator('[data-ev-group-total="CustosDaObra"]')).not.toHaveText('R$ 0');
 await addedLocal.getByRole('button',{name:'Excluir',exact:true}).click();
 await expect(localRows).toHaveCount(localBefore);
 await expect(page.locator('.ev-modal-card').getByRole('button',{name:'Reajustar INCC',exact:true})).toHaveCount(0);
 await expect(page.locator('.ev-modal-card').getByRole('button',{name:'Ver controle de verba',exact:true})).toHaveCount(0);
 await page.locator('.ev-modal-card').getByRole('button',{name:'Fechar',exact:true}).click();

 const empty=rows.filter({hasText:/Obra Nova Sem EV/i});
 await expect(empty.locator('.portfolio-actions button')).toHaveText(['Criar EV']);
 await empty.getByRole('button',{name:'Criar EV',exact:true}).click();
 await expect(page.locator('#evModalTitle')).toHaveText('Obra nova sem EV');
 expect(await page.locator('#evForm .ev-line-row').count()).toBeGreaterThan(4);
 await expect(page.locator('#evForm [data-action="toggle-ev-zero-lines"]')).toHaveText('Exibir vazios');
 await expect(page.locator('#evForm .ev-line-row:visible')).toHaveCount(0);
 await expect(page.locator('#evForm .ev-section-row')).toHaveCount(3);
 await expect(page.locator('.ev-modal-card').getByRole('button',{name:'Reajustar INCC',exact:true})).toHaveCount(0);
 const emptyAreas=page.locator('.ev-modal-card .ev-header-area');
 await expect(emptyAreas).toHaveCount(1);
 await expect(emptyAreas).toContainText('Área equivalente');
 await expect(emptyAreas).toContainText('—');
 await expect(page.locator('.ev-modal-card .ev-header-areas')).not.toContainText('Área construída');
 const emptyKpis=page.locator('.ev-modal-card .ev-top-kpis > .mini-metric');
 await expect(emptyKpis).toHaveCount(6);
 await expect(emptyKpis.nth(1)).toContainText('—');
 await expect(emptyKpis.nth(3)).toContainText('—');
 await expect(page.locator('.ev-modal-card .ev-master-panel')).toHaveCount(0);
 await expect(page.locator('.ev-modal-card .ev-area-panel')).toHaveCount(0);
 await expect(page.locator('.ev-modal-card .ev-attachments')).toHaveCount(0);
 await expect(page.locator('.ev-modal-card')).not.toContainText('Nomenclatura do EV padrão');
 await expect(page.locator('.ev-modal-card')).not.toContainText('Arquivos do EV');
 const completeness=page.locator('#evForm .ev-completeness-toggle');
 await expect(completeness).toContainText('EV completo?');
 await expect(completeness).toContainText('Não');
 await page.locator('#evForm').getByRole('button',{name:'Salvar EV',exact:true}).click();
 await expect(page.locator('#toast')).toHaveText('Nenhuma alteração no EV. Nenhuma nova revisão foi criada.');
 await page.locator('.ev-modal-card').getByRole('button',{name:'Fechar',exact:true}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();

 const updatedEmpty=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra Nova Sem EV/i});
 await expect(updatedEmpty.locator('.portfolio-actions button')).toHaveText(['Criar EV']);
 await updatedEmpty.locator('.portfolio-actions button').click();
 await expect(page.locator('.ev-modal-status .status-pill')).toHaveText('Sem EV');
 await expect(page.locator('.ev-modal-card .ev-top-kpis > .mini-metric')).toHaveCount(6);
 await expect(page.locator('.ev-modal-card .ev-top-kpis > .mini-metric').nth(1)).toContainText('—');
 await expect(page.locator('.ev-modal-card .ev-top-kpis > .mini-metric').nth(3)).toContainText('—');
 await expect(page.locator('.ev-modal-card .ev-master-panel, .ev-modal-card .ev-area-panel, .ev-modal-card .ev-attachments')).toHaveCount(0);
 expect(b.errors).toEqual([]);
});
test('historical EV opened from Portfolio persists after save and reload',async({page})=>{
 const historical={
  id:'evh-detached-save',
  code:'HIST-SAVE',
  project:'EV Histórico Persistência - CE',
  year:2026,
  date:'2026-08-01',
  revision:'REV01',
  typology:'Hospital',
  technician:'Técnico Persistência',
  area:250,
  total:1000,
  baseTotal:1000,
  disciplines:{'adequacoes-civis':1000},
  items:[],
 };
 const work=structuredClone(payload.state.works[0]);
 work.id='unrelated-work';
 work.nome='Obra sem relação com EV histórico';
 work.codigoOriginal='UNRELATED';
 work.chaveUnica='UNRELATED';
 const b=await backend(page,'Admin',false,{workRecords:[work],demandRecords:[],evRecords:[historical]});
 await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();

 let row=page.locator('.portfolio-works-table tbody tr').filter({hasText:'EV Histórico Persistência'});
 await expect(row).toBeVisible();
 await row.getByRole('button',{name:'Abrir EV',exact:true}).click();

 const value=page.locator('#evForm .ev-line-row[data-discipline-id="adequacoes-civis"] .ev-value-input');
 await expect(value).toHaveValue('1.000,00');
 await value.fill('1.234,56');
 await page.locator('#evForm').getByRole('button',{name:'Salvar EV',exact:true}).click();
 await expect(page.locator('#toast')).toHaveText('EV salvo no banco');

 const changes=b.requests.flatMap(request=>request.changes);
 expect(changes.some(change=>
  change.entity==='projects_works'
  && change.document?.sourceHistoricalRecordId==='evh-detached-save'
 )).toBe(true);
 expect(changes.some(change=>change.entity==='budget_estimates')).toBe(true);
 expect(changes.some(change=>
  change.entity==='budget_estimate_lines'
  && change.document?.disciplinaId==='adequacoes-civis'
  && Number(change.document?.valorOrcado)===1234.56
 )).toBe(true);

 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'Portfólio de Obras e EVs',exact:true})).toBeVisible();
 row=page.locator('.portfolio-works-table tbody tr').filter({hasText:'EV Histórico Persistência'});
 await expect(row).toBeVisible();
 await row.getByRole('button',{name:'Abrir EV',exact:true}).click();
 await expect(page.locator('#evForm .ev-line-row[data-discipline-id="adequacoes-civis"] .ev-value-input')).toHaveValue('1.234,56');
 expect(b.errors).toEqual([]);
});

test('legacy consolidated SIC can be edited and deleted from the EV',async({page})=>{
 const legacyWork=structuredClone(payload.state.works[0]);
 legacyWork.id='legacy-sic-work';
 legacyWork.nome='Obra com SIC legacy';
 legacyWork.codigoOriginal='LSIC';
 legacyWork.chaveUnica='LSIC';
 legacyWork.ev={
  ...legacyWork.ev,
  id:'legacy-sic-ev',
  lines:[
   {disciplinaId:'adequacoes-civis',valorOrcado:100,status:'Orçado'},
   {disciplinaId:'sics',valorOrcado:1234.56,status:'Orçado',sicDetails:[]},
  ],
 };
 const b=await backend(page,'Admin',false,{workRecords:[legacyWork],demandRecords:[],evRecords:[]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const row=page.locator('.portfolio-works-table tbody tr').filter({hasText:'Obra com SIC legacy'});
 await row.getByRole('button',{name:'Abrir EV',exact:true}).click();

 let legacyRow=page.locator('#evForm .ev-sic-posted-row[data-ev-legacy-sic="true"]');
 await expect(legacyRow).toBeVisible();
 await expect(legacyRow.locator('[data-ev-legacy-sic-value]')).toHaveValue('1.234,56');
 await legacyRow.locator('[data-ev-legacy-sic-reference]').fill('SIC LEG 01');
 await legacyRow.locator('[data-ev-legacy-sic-title]').fill('Ajuste histórico consolidado');
 await legacyRow.locator('[data-ev-legacy-sic-value]').fill('2.345,67');
 await page.locator('#evForm').getByRole('button',{name:'Salvar EV',exact:true}).click();
 await expect(page.locator('#toast')).toHaveText('EV salvo no banco');

 legacyRow=page.locator('#evForm .ev-sic-posted-row[data-ev-legacy-sic="true"]');
 await expect(legacyRow.locator('[data-ev-legacy-sic-reference]')).toHaveValue('SIC LEG 01');
 await expect(legacyRow.locator('[data-ev-legacy-sic-title]')).toHaveValue('Ajuste histórico consolidado');
 await expect(legacyRow.locator('[data-ev-legacy-sic-value]')).toHaveValue('2.345,67');
 expect(b.requests.flatMap(request=>request.changes).some(change=>
  change.entity==='budget_estimate_lines'
  && change.document?.disciplinaId==='sics'
  && Number(change.document?.valorOrcado)===2345.67
 )).toBe(true);

 await legacyRow.getByRole('button',{name:'Excluir',exact:true}).click();
 await expect(page.locator('#evForm .ev-sic-posted-row[data-ev-legacy-sic="true"]')).toHaveCount(0);
 await page.locator('#evForm').getByRole('button',{name:'Salvar EV',exact:true}).click();
 await expect(page.locator('#toast')).toHaveText('EV salvo no banco');
 await expect(page.locator('#evForm .ev-sic-posted-row[data-ev-legacy-sic="true"]')).toHaveCount(0);
 expect(b.requests.flatMap(request=>request.changes).some(change=>
  change.entity==='budget_estimate_lines' && change.operation==='delete'
 )).toBe(true);
 expect(b.errors).toEqual([]);
});

test('EV local child line persists only in the selected work and not in global configuration',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const row=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra de Teste/i});
 await row.getByRole('button',{name:'Abrir EV',exact:true}).click();

 const obraGroup=page.locator('#evForm [data-ev-group-body="CustosDaObra"]');
 await obraGroup.getByRole('button',{name:'+ Nova linha',exact:true}).click();
 const localRow=obraGroup.locator('.ev-line-row[data-local-line="true"]').last();
 await localRow.locator('.ev-local-name-input').fill('Mobilização exclusiva da obra');
 await localRow.locator('.ev-value-input').fill('0,00');
 await page.locator('#evForm').getByRole('button',{name:'Salvar EV',exact:true}).click();
 await expect(page.locator('#toast')).toHaveText('EV salvo no banco');
 await expect(page.locator('#evForm')).toBeVisible();

 const savedName=page.locator('#evForm .ev-line-row[data-local-line="true"] .ev-local-name-input');
 await expect(savedName).toHaveCount(1);
 await expect(savedName).toHaveValue('Mobilização exclusiva da obra');
 const savedRow=savedName.locator('xpath=ancestor::tr');
 await expect(savedRow).toBeHidden();

 const changes=b.requests.flatMap(request=>request.changes);
 const localChange=changes.find(change=>change.entity==='budget_estimate_lines'&&change.document?.localName==='Mobilização exclusiva da obra');
 expect(localChange).toBeTruthy();
 expect(localChange.document.localCategory).toBe('CustosDaObra');
 expect(localChange.document.isLocalEVLine).toBe(true);
 expect(changes.some(change=>change.entity==='core_configuration_catalog'&&change.document?.label==='Mobilização exclusiva da obra')).toBe(false);
 expect(b.errors).toEqual([]);
});

test('legacy EV status never exposes draft and only accepts the explicit lifecycle value',async({page})=>{
 const legacy={
  ...structuredClone(payload.state.works[0]),
  id:'legacy-draft-work',
  nome:'Obra EV legado',
  codigoOriginal:'LEG',
  ev:{
   ...structuredClone(payload.state.works[0].ev),
   id:'legacy-draft-ev',
   status:'Rascunho',
   lines:[
    {disciplinaId:'adequacoes-civis',valorOrcado:100,status:'Estimado'},
   ],
  },
 };
 const b=await backend(page,'Admin',false,{workRecords:[legacy],demandRecords:[],evRecords:[]});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 const statusFilter=page.locator('[data-portfolio-quick-filter="evStatus"]');
 await expect(statusFilter.locator('option')).toHaveText(['Todos','Sem EV','Incompleto','Completo']);
 await expect(statusFilter).not.toContainText('Rascunho');
 const row=page.locator('.portfolio-works-table tbody tr').filter({hasText:'Obra EV legado'});
 await expect(page.locator('#portfolioWorkDetail')).toHaveCount(0);
 await row.locator('.portfolio-actions button').click();
 await expect(page.locator('.ev-modal-status .status-pill')).toHaveText('Incompleto');
 await expect(page.locator('.ev-modal-card')).not.toContainText('Rascunho');
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
 const createdWorkRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Nova obra com verba/i});
 await createdWorkRow.locator('td').nth(1).click();
 const editForm=page.locator('#workForm');
 await expect(page.locator('#portfolioWorkDetail')).toHaveCount(0);
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
 await unlinkedRow.locator('td').nth(1).click();
 const unlinkedEditor=page.locator('#workForm');
 await expect(unlinkedEditor.getByRole('heading',{name:'Editar obra',exact:true})).toBeVisible();
 await expect(unlinkedEditor.getByRole('button',{name:'Excluir obra',exact:true})).toBeVisible();
 await expect(page.locator('#portfolioWorkDetail')).toHaveCount(0);
 await unlinkedEditor.getByRole('button',{name:'Excluir obra',exact:true}).click();

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
 await linkedRow.locator('td').nth(1).click();
 const linkedEditor=page.locator('#workForm');
 await expect(linkedEditor.getByRole('heading',{name:'Editar obra',exact:true})).toBeVisible();
 await linkedEditor.getByRole('button',{name:'Excluir obra',exact:true}).click();
 const blockedModal=page.locator('.work-delete-modal');
 await expect(blockedModal.getByRole('heading',{name:'Esta obra não pode ser excluída',exact:true})).toBeVisible();
 await expect(blockedModal.locator('.split-item').filter({hasText:'EVs vinculados'}).locator('span')).toHaveText('1');
 await expect(blockedModal.locator('.split-item').filter({hasText:'Demandas vinculadas'}).locator('span')).toHaveText('2');
 await expect(blockedModal.locator('[data-work-delete-check]')).toHaveCount(0);
 await expect(blockedModal.getByRole('button',{name:'Excluir definitivamente',exact:true})).toHaveCount(0);
 expect(b.errors).toEqual([]);
});
test('portfolio includes works without EV, keeps the table concise and opens the work editor directly',async({page})=>{
 const b=await backend(page);await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="portfolio"]').filter({visible:true}).first().click();
 await expect(page.getByRole('heading',{name:'Portfólio de Obras e EVs',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Fluxo de valor de orçamentação de projetos',exact:true})).toHaveCount(0);
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
 await expect(page.locator('[data-portfolio-quick-filter="evStatus"] option')).toHaveText([
  'Todos','Sem EV','Incompleto','Completo',
 ]);
 await expect(page.locator('[data-portfolio-quick-filter="evStatus"]')).not.toContainText('Rascunho');
 await expect(page.locator('.portfolio-works-table thead .portfolio-sort-button span')).toHaveText([
  'Código','Nome da obra','Estado','Região','Ano','Tipologia','Categoria',
  'Área equivalente (m²)','Total orçado (sem taxa de risco)','Custo por m² (sem taxa de risco)',
 ]);
 await expect(page.locator('.portfolio-works-table thead th').last()).toHaveText('Ações');
 await expect(page.locator('.portfolio-works-table thead [data-action="sort-portfolio"]')).toHaveCount(10);
 const yearSort=page.locator('.portfolio-works-table [data-action="sort-portfolio"][data-sort-key="year"]');
 await expect(yearSort.locator('..')).toHaveAttribute('aria-sort','descending');
 const defaultCodes=await page.locator('.portfolio-works-table tbody tr td:first-child').allTextContents();
 expect(defaultCodes).toEqual(['TEST','HIST-1','HIST-3','HIST-2','0000']);
 const codeSort=page.locator('.portfolio-works-table [data-action="sort-portfolio"][data-sort-key="codigo"]');
 await codeSort.click();
 await expect(codeSort.locator('..')).toHaveAttribute('aria-sort','descending');
 await codeSort.click();
 await expect(codeSort.locator('..')).toHaveAttribute('aria-sort','ascending');
 await yearSort.click();
 await expect(yearSort.locator('..')).toHaveAttribute('aria-sort','descending');
 const portfolioScroll=page.locator('.portfolio-works-scroll');
 await expect(portfolioScroll).toBeVisible();
 const scrollStyle=await portfolioScroll.evaluate(element=>({
  overflowY:getComputedStyle(element).overflowY,
  gutter:getComputedStyle(element).scrollbarGutter,
 }));
 expect(scrollStyle.overflowY).toBe('scroll');
 expect(scrollStyle.gutter).toContain('stable');
 await expect(page.locator('.portfolio-works-table thead')).not.toContainText('CNPJ');
 await expect(page.locator('.portfolio-works-table thead')).not.toContainText('Endereço');
 await expect(page.locator('.portfolio-works-table thead')).not.toContainText('Área construída');
 await expect(page.locator('.portfolio-works-table thead')).not.toContainText('Tempo de obra');
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
 await expect(historicalRow.locator('td').nth(7)).toHaveText('200,00');
 await expect(historicalRow.locator('td').nth(8)).toHaveText('R$ 950,00');
 await expect(historicalRow.locator('td').nth(9)).toHaveText('R$ 4,75');
 await expect(historicalRow.locator('.portfolio-actions button')).toHaveText(['Abrir EV']);
 await expect(historicalRow.getByRole('button',{name:'Abrir Obra'})).toHaveCount(0);

 await historicalRow.locator('td').nth(1).click();
 const historicalWorkForm=page.locator('#workForm');
 await expect(page.locator('#portfolioWorkDetail')).toHaveCount(0);
 await expect(historicalWorkForm.getByRole('heading',{name:'Editar obra'})).toBeVisible();
 await expect(historicalWorkForm.locator('[name="sourceHistoricalRecordId"]')).toHaveValue('evh-test-1');
 await expect(historicalWorkForm.locator('[name="nome"]')).toHaveValue('Obra histórica Norte - AM');
 await expect(historicalWorkForm.locator('[name="anoObra"]')).toHaveValue('2025');
 await historicalWorkForm.locator('[name="cidade"]').fill('Manaus');
 await historicalWorkForm.locator('[name="endereco"]').fill('Rua histórica, 10');
 await historicalWorkForm.getByRole('button',{name:'Salvar alterações'}).click();
 await expect(page.locator('.portfolio-works-table tbody tr')).toHaveCount(5);
 await expect(historicalRow).not.toContainText('Rua histórica, 10');
 await expect.poll(()=>b.requests.some(request=>request.changes.some(change=>change.entity==='projects_works'&&change.document.sourceHistoricalRecordId==='evh-test-1'&&change.document.endereco==='Rua histórica, 10'))).toBe(true);

 await historicalRow.locator('td').nth(1).click();
 const historicalWorkFormReopened=page.locator('#workForm');
 await expect(historicalWorkFormReopened.locator('[name="endereco"]')).toHaveValue('Rua histórica, 10');
 await historicalWorkFormReopened.getByRole('button',{name:'Fechar',exact:true}).click();

 await historicalRow.getByRole('button',{name:'Abrir EV'}).click();
 await expect(page.locator('.ev-historical-modal')).toHaveCount(0);
 await expect(page.locator('#evModalTitle')).toContainText('Obra Histórica Norte');
 await expect(page.locator('#evForm')).toBeVisible();
 await expect(page.locator('#evForm [data-action="toggle-ev-zero-lines"]')).toHaveText('Exibir vazios');
 await page.locator('.ev-modal-card').getByRole('button',{name:'Fechar',exact:true}).click();

 const currentRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra de Teste/i});
 await expect(currentRow.locator('td').nth(1)).toHaveText('TEST. Obra de Teste');
 await expect(currentRow.locator('td').nth(2)).toHaveText('SP');
 await expect(currentRow.locator('td').nth(3)).toHaveText('Sudeste');
 await expect(currentRow.locator('td').nth(4)).toHaveText('2026');
 await expect(currentRow.locator('td').nth(5)).toBeEmpty();
 await expect(currentRow.locator('td').nth(6)).toHaveText('Venda de Serviço');
 await expect(currentRow.locator('td').nth(7)).toHaveText('100,00');
 await expect(currentRow.locator('td').nth(8)).toHaveText('R$ 150,00');
 await expect(currentRow.locator('td').nth(9)).toHaveText('R$ 1,50');
 await expect(currentRow.locator('.portfolio-actions button')).toHaveText(['Abrir EV']);

 await currentRow.locator('td').nth(1).click();
 const currentWorkForm=page.locator('#workForm');
 await expect(page.locator('#portfolioWorkDetail')).toHaveCount(0);
 await expect(currentWorkForm.locator('[name="prazoDias"]')).toHaveValue('120');
 await expect(currentWorkForm.locator('[name="areaConstruida"]')).toHaveValue('100');
 await expect(currentWorkForm.locator('[name="cnpj"]')).toBeVisible();
 await expect(currentWorkForm.locator('[name="endereco"]')).toBeVisible();
 await expect(currentWorkForm.getByRole('button',{name:'Excluir obra',exact:true})).toBeVisible();
 await expect(currentWorkForm.getByRole('heading',{name:'Editar obra'})).toBeVisible();
 await currentWorkForm.locator('[name="endereco"]').fill('Rua editada, 100');
 await currentWorkForm.getByRole('button',{name:'Salvar alterações'}).click();
 await expect(currentRow).not.toContainText('Rua editada, 100');
 await expect.poll(()=>b.requests.some(request=>request.changes.some(change=>change.entity==='projects_works'&&change.document.endereco==='Rua editada, 100'))).toBe(true);
 await currentRow.locator('td').nth(1).click();
 const currentWorkFormReopened=page.locator('#workForm');
 await expect(currentWorkFormReopened.locator('[name="endereco"]')).toHaveValue('Rua editada, 100');
 await currentWorkFormReopened.getByRole('button',{name:'Fechar',exact:true}).click();

 const noEvRow=page.locator('.portfolio-works-table tbody tr').filter({hasText:/Obra Nova Sem EV/i});
 await expect(noEvRow.locator('td').nth(0)).toHaveText('0000');
 await expect(noEvRow.locator('td').nth(1)).toHaveText('0000. Obra Nova sem EV');
 await expect(noEvRow.locator('td').nth(5)).toHaveText('Retrofit Unidade Existente');
 await expect(noEvRow.locator('td').nth(6)).toBeEmpty();
 await expect(noEvRow.locator('td').nth(7)).toBeEmpty();
 await expect(noEvRow.locator('td').nth(8)).toBeEmpty();
 await expect(noEvRow.locator('td').nth(9)).toBeEmpty();
 await expect(noEvRow.locator('.portfolio-actions button')).toHaveText(['Criar EV']);

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
test('operational cards drag between columns and SICs pass through Validado Obras with Lecon visible',async({page})=>{
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
 await expect.poll(()=>page.evaluate(()=>window.SLT_CLOUD.canWrite('works'))).toBe(true);
 const kanbanColumns=page.locator('.operational-board-panel .kanban-column');
 await expect(kanbanColumns).toHaveCount(9);
 const kanbanHeight=(await kanbanColumns.first().boundingBox()).height;
 expect(kanbanHeight).toBeGreaterThanOrEqual(2080);
 expect(kanbanHeight).toBeLessThanOrEqual(3040);
 await expect(kanbanColumns.locator('header h2')).toHaveText([
  'Fazer','Fazendo','Pausado','Aguardando Validação Obras','Validado Obras','Aguardando Aprovação Diretoria',
  'Aprovado Diretoria','Concluído','Cancelado',
 ]);

 await page.locator('[data-action="open-demand-detail"][data-id="test-budget-demand"]').click();
 const nonSicStatus=page.locator('#demandDetailForm [name="coluna"]');
 await expect(nonSicStatus.locator('option[value="aprovacaoDiretoria"]')).toHaveAttribute('disabled','');
 await expect(nonSicStatus.locator('option[value="aprovadoDiretoria"]')).toHaveAttribute('disabled','');
 await page.locator('.modal-actions').getByRole('button',{name:'Fechar',exact:true}).click();

 const validationColumn=page.locator('.kanban-column[data-column="validacaoObras"]');
 const validatedColumn=page.locator('.kanban-column[data-column="validadoObras"]');
 const directorColumn=page.locator('.kanban-column[data-column="aprovacaoDiretoria"]');
 const directorApprovedColumn=page.locator('.kanban-column[data-column="aprovadoDiretoria"]');
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
 await expect(sicCard.locator('[data-demand-drag-handle]')).toBeVisible();
 await page.mouse.move(sourceBox.x+sourceBox.width/2,sourceBox.y+sourceBox.height/2);
 await page.mouse.down();
 await page.mouse.move(sourceBox.x+sourceBox.width/2+24,sourceBox.y+sourceBox.height/2,{steps:2});
 await expect(page.locator('.demand-drag-ghost')).toHaveCount(1);
 await expect(page.locator('.operational-board-panel .kanban-column.is-drop-eligible')).not.toHaveCount(0);
 await page.mouse.move(targetBox.x+targetBox.width/2,targetBox.y+Math.min(targetBox.height/2,120),{steps:8});
 await expect(fazendoColumn).toHaveClass(/is-drag-over/);
 await page.mouse.up();
 await expect(page.locator('.demand-drag-ghost')).toHaveCount(0);
 await expect(fazendoColumn.locator('article[data-id="test-demand"]')).toBeVisible();
 await expect(fazendoColumn.locator('article[data-id="test-demand"] .demand-card-stage-duration')).toHaveText('menos de 1 dia');
 await expect(directorColumn.locator('article[data-id="test-budget-demand"]')).toHaveCount(0);
 await page.waitForTimeout(400);
 await fazendoColumn.locator('article[data-id="test-demand"]').click();
 const sicStatus=page.locator('#demandDetailForm [name="coluna"]');
 await expect(sicStatus).toHaveValue('fazendo');
 await expect(sicStatus.locator('option[value="validacaoObras"]')).not.toHaveAttribute('disabled','');
 await expect(sicStatus.locator('option[value="validadoObras"]')).not.toHaveAttribute('disabled','');
 await expect(sicStatus.locator('option[value="aprovacaoDiretoria"]')).not.toHaveAttribute('disabled','');
 await expect(sicStatus.locator('option[value="aprovadoDiretoria"]')).toHaveAttribute('disabled','');
 await expect(sicStatus.locator('option[value="concluido"]')).not.toHaveAttribute('disabled','');

 await sicStatus.selectOption('validacaoObras');
 await page.locator('.modal-actions').getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(validationColumn.locator('article[data-id="test-demand"]')).toBeVisible();

 await validationColumn.locator('article[data-id="test-demand"]').click();
 const validationStatus=page.locator('#demandDetailForm [name="coluna"]');
 await validationStatus.selectOption('validadoObras');
 await page.locator('.modal-actions').getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(validatedColumn.locator('article[data-id="test-demand"]')).toBeVisible();

 await validatedColumn.locator('article[data-id="test-demand"]').click();
 const validatedStatus=page.locator('#demandDetailForm [name="coluna"]');
 await validatedStatus.selectOption('aprovacaoDiretoria');
 await page.locator('.modal-actions').getByRole('button',{name:'Salvar',exact:true}).click();
 const queue=page.locator('#sicDirectorQueueForm');
 await expect(queue).toBeVisible();
 await queue.locator('[name="approvalWeekId"]').selectOption('w-test');
 await queue.locator('[name="approvalCardId"]').selectOption('approval-test');
 await queue.locator('[name="approvalSicValue"]').fill('20,00');
 await queue.locator('[name="approvalAssigned"]').fill('120,00');
 await queue.locator('[name="approvalCommitted"]').fill('80,00');
 await queue.getByRole('button',{name:'Confirmar e mover'}).click();
 await expect(directorColumn.locator('article[data-id="test-demand"]')).toBeVisible();

 await directorColumn.locator('article[data-id="test-demand"]').click();
 const approvedStatus=page.locator('#demandDetailForm [name="coluna"]');
 await expect(approvedStatus.locator('option[value="aprovadoDiretoria"]')).not.toHaveAttribute('disabled','');
 await expect(approvedStatus.locator('option[value="concluido"]')).not.toHaveAttribute('disabled','');
 await approvedStatus.selectOption('aprovadoDiretoria');
 await page.locator('.modal-actions').getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(directorApprovedColumn.locator('article[data-id="test-demand"]')).toBeVisible();
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
 const afterPreview=await page.evaluate(()=>window.__fetchStarts);
 expect(afterPreview.filter(entry=>new URL(entry.url).pathname.endsWith('/slt_module_preview'))).toHaveLength(1);
 await expect.poll(()=>page.evaluate(()=>window.SLT_CLOUD.isModuleLoaded('works'))).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.SLT_CLOUD.canWrite('works'))).toBe(true);
 const afterModule=await page.evaluate(()=>window.__fetchStarts);
 expect(afterModule.filter(entry=>new URL(entry.url).pathname.endsWith('/slt_module_preview'))).toHaveLength(1);
 expect(afterModule.filter(entry=>new URL(entry.url).pathname.endsWith('/slt_module_load'))).toHaveLength(1);
 expect(afterModule.filter(entry=>new URL(entry.url).pathname.endsWith('/slt_core_analysts'))).toHaveLength(1);
 expect(b.errors).toEqual([]);
});

test('SIC study is sourced only from operational SIC demand cards',async({page})=>{
 const sicDemand={
  ...structuredClone(payload.state.demands[0]),
  id:'sic-operational-source',
  obraId:'test-work',
  tipo:'SIC',
  coluna:'fazendo',
  analistaResponsavel:'Ana',
  createdAt:'2026-09-20T12:00:00Z',
  sprintId:'sprint-017',
  sicMetadata:{tituloSic:'SIC operacional',numeroSic:'SIC-900',lecomNumber:'LECOM-900',motivo:'RevisaoEscopo'},
 };
 const nonSic={...structuredClone(payload.state.demands[1]),id:'not-sic-source',tipo:'EmissaoInicial'};
 const b=await backend(page,'Admin',false,{demandRecords:[sicDemand,nonSic],analystNames:['Ana']});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="sics"]').filter({visible:true}).first().click();
 await expect(page.locator('[data-action="set-sic-view"]')).toHaveText(['Base operacional','Executivo','Diagnóstico','Performance','Aprovação']);
 await expect(page.getByText('SIC-900',{exact:true}).first()).toBeVisible();
 await expect(page.getByText('Revisão de Escopo',{exact:true}).first()).toBeVisible();
 await expect(page.getByText('Obra SIC de teste',{exact:true})).toHaveCount(0);
 await expect(page.getByText('HIST-1',{exact:true})).toHaveCount(0);
 await expect(page.locator('#sicApprovalDashboard')).toHaveCount(0);
 await page.getByText('SIC-900',{exact:true}).first().click();
 await expect(page.getByRole('heading',{name:'SIC-900'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Abrir card operacional'})).toBeVisible();
 expect(b.errors).toEqual([]);
});

test('database grants allow finance for an analyst while SIC study remains read-only operational data',async({page})=>{
 const b=await backend(page,'Analista');await login(page);
 await page.locator('[data-view="budget"]').filter({visible:true}).first().click();
 await expect(page.locator('#app')).toContainText('Verba');
 await page.locator('[data-view="worksOperational"]').filter({visible:true}).first().click();
 await page.locator('[data-view="sics"]').filter({visible:true}).first().click();
 await expect(page.locator('[data-action="set-sic-view"]')).toHaveText(['Base operacional','Executivo','Diagnóstico','Performance','Aprovação']);
 await expect(page.locator('[data-view-mode="approval"]')).toHaveCount(1);
 await expect(page.locator('#btnOpenImport')).toHaveCount(0);
 await expect(page.locator('[data-approve]')).toHaveCount(0);
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

test('legacy SIC approval import is no longer exposed in the study',async({page})=>{
 const b=await backend(page);await login(page);
 await page.locator('[data-view="worksOperational"]').filter({visible:true}).first().click();
 await page.locator('[data-view="sics"]').filter({visible:true}).first().click();
 await expect(page.locator('[data-view-mode="approval"]')).toHaveCount(1);
 await expect(page.locator('#btnOpenImport')).toHaveCount(0);
 await expect(page.getByText('Obra SIC de teste',{exact:true})).toHaveCount(0);
 await expect(page.getByText('Demanda de teste',{exact:true})).toHaveCount(0);
 expect(b.requests).toHaveLength(0);
 expect(b.errors).toEqual([]);
});


test('posting an approved SIC does not create a new EV revision',async({page})=>{
 const demand={
  ...structuredClone(payload.state.demands[0]),
  id:'sic-post-no-revision',
  obraId:'test-work',
  tipo:'SIC',
  coluna:'aprovadoDiretoria',
  analistaResponsavel:'Ana',
  sicApprovalStatus:'Aprovado',
  sicApprovalApprovedAt:'2026-09-22',
  sicApprovalApprovedBy:'Gestor',
  sicIds:[],
  sicDraftDisciplines:[{disciplinaId:'instalacoes-eletricas-e-spda',valorDelta:25}],
  sicMetadata:{...structuredClone(payload.state.demands[0].sicMetadata),tituloSic:'SIC sem revisão na postagem',numeroSic:'SIC-POST-001',motivo:'RevisaoProjeto'},
 };
 const work=structuredClone(payload.state.works[0]);
 work.ev.versaoAtual=1;
 work.ev.versions=[];
 const b=await backend(page,'Admin',false,{workRecords:[work],demandRecords:[demand],analystNames:['Ana']});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('[data-view="sics"]').filter({visible:true}).first().click();
 await page.locator('[data-action="set-sic-view"][data-view-mode="approval"]').click();
 const postButton=page.locator('[data-action="post-sic-to-ev"][data-id="sic-post-no-revision"]');
 await expect(postButton).toBeVisible();
 await postButton.click();
 await expect(page.locator('#evForm')).toBeVisible();
 await expect(page.locator('#legacyShell > #toast')).toHaveText('SIC postada no EV.');
 const sicGroup=page.locator('#evForm [data-ev-group-body="Sics"]');
 await expect(sicGroup.locator('[data-ev-group-total="Sics"]')).toContainText('R$ 25,00');
 await expect(sicGroup.locator('.ev-sic-posted-row')).toHaveCount(1);
 await expect(sicGroup.locator('.ev-sic-posted-row')).toContainText('LECOM TEST-1');
 await expect(sicGroup.locator('.ev-sic-posted-row')).toContainText('SIC sem revisão na postagem');
 await expect(page.locator('#evForm [data-discipline-id="sics"]')).toHaveCount(0);
 const sicMetric=page.locator('.ev-modal-card .ev-top-kpis > .mini-metric').filter({has:page.getByText("Total de SIC's",{exact:true})});
 await expect(sicMetric).toContainText('R$ 25,00');
 const changes=b.requests.flatMap(request=>request.changes);
 expect(changes.some(change=>change.entity==='budget_estimate_versions')).toBe(false);
 const estimateChanges=changes.filter(change=>change.entity==='budget_estimates');
 expect(estimateChanges.some(change=>change.document?.version_number>1)).toBe(false);
 expect(b.errors).toEqual([]);
});

test('Analista can validate Obras but cannot send a SIC to Diretoria',async({page})=>{
 const demand={
  ...structuredClone(payload.state.demands[0]),
  id:'sic-validation-analyst',
  obraId:'test-work',
  tipo:'SIC',
  coluna:'validacaoObras',
  analistaResponsavel:'Ana',
  dataValidacaoObras:'',
  sicMetadata:{...structuredClone(payload.state.demands[0].sicMetadata),tituloSic:'SIC validação de obras'},
 };
 const b=await backend(page,'Analista',false,{demandRecords:[demand],analystNames:['Ana'],analystCanWrite:true});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();

 const card=page.locator('.kanban-column[data-column="validacaoObras"] article[data-id="sic-validation-analyst"]');
 await expect(card).toBeVisible();
 await card.click();
 const status=page.locator('#demandDetailForm [name="coluna"]');
 await status.selectOption('validadoObras');
 await page.locator('#demandDetailForm').getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(page.locator('.kanban-column[data-column="validadoObras"] article[data-id="sic-validation-analyst"]')).toBeVisible();

 await page.locator('article[data-id="sic-validation-analyst"]').click();
 const validatedStatus=page.locator('#demandDetailForm [name="coluna"]');
 await validatedStatus.selectOption('aprovacaoDiretoria');
 await expect(page.locator('#toast')).toHaveText('Somente usuários Gestor ou Admin podem mover uma SIC de Validado Obras para Aguardando Aprovação Diretoria.');
 await expect(validatedStatus).toHaveValue('validadoObras');
 await page.locator('#demandDetailForm .modal-actions').getByRole('button',{name:'Fechar',exact:true}).click();
 await expect(page.locator('.kanban-column[data-column="validadoObras"] article[data-id="sic-validation-analyst"]')).toBeVisible();
 expect(b.errors).toEqual([]);
});

test('Gestor chooses the week and queues only the new validated SIC for Diretoria',async({page})=>{
 const demand={
  ...structuredClone(payload.state.demands[0]),
  id:'sic-validation-manager',
  obraId:'test-work',
  tipo:'SIC',
  coluna:'validadoObras',
  analistaResponsavel:'Ana',
  dataValidacaoObras:'2026-09-23',
  sicMetadata:{...structuredClone(payload.state.demands[0].sicMetadata),tituloSic:'SIC validada por obras'},
 };
 const b=await backend(page,'Gestor',false,{demandRecords:[demand],analystNames:['Ana'],analystCanWrite:true});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('article[data-id="sic-validation-manager"]').click();
 const status=page.locator('#demandDetailForm [name="coluna"]');
 await status.selectOption('aprovacaoDiretoria');
 await page.locator('#demandDetailForm').getByRole('button',{name:'Salvar',exact:true}).click();
 const queue=page.locator('#sicDirectorQueueForm');
 await expect(queue).toBeVisible();
 await expect(queue.locator('[name="approvalWeekId"]')).toHaveValue('');
 await queue.locator('[name="approvalWeekId"]').selectOption('w-test');
 await queue.locator('[name="approvalCardId"]').selectOption('approval-test');
 await queue.locator('[name="approvalSicValue"]').fill('12,34');
 await queue.locator('[name="approvalAssigned"]').fill('120,00');
 await queue.locator('[name="approvalCommitted"]').fill('80,00');
 await queue.getByRole('button',{name:'Confirmar e mover'}).click();
 await expect(page.locator('.kanban-column[data-column="aprovacaoDiretoria"] article[data-id="sic-validation-manager"]')).toBeVisible();
 const demandChange=b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='sic-validation-manager');
 expect(demandChange.document.sicDirectorApproval).toMatchObject({version:1,weekId:'w-test',approvalCardId:'approval-test',sicValue:12.34,priorInvoices:0,assignedAmount:120,committedAmount:80});
 expect(b.errors).toEqual([]);
});

test('Analista can move SIC from director approval to director approved',async({page})=>{
 const demand={
  ...structuredClone(payload.state.demands[0]),
  id:'sic-director-analyst',
  obraId:'test-work',
  tipo:'SIC',
  coluna:'aprovacaoDiretoria',
  analistaResponsavel:'Ana',
  sicMetadata:{...structuredClone(payload.state.demands[0].sicMetadata),tituloSic:'SIC aprovação de diretoria'},
 };
 const b=await backend(page,'Analista',false,{demandRecords:[demand],analystNames:['Ana'],analystCanWrite:true});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('article[data-id="sic-director-analyst"]').click();
 const status=page.locator('#demandDetailForm [name="coluna"]');
 await status.selectOption('aprovadoDiretoria');
 await page.locator('#demandDetailForm').getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(page.locator('.kanban-column[data-column="aprovadoDiretoria"] article[data-id="sic-director-analyst"]')).toBeVisible();
 expect(b.errors).toEqual([]);
});


test('operational completion requires real delivery date, EV decision and generated amount',async({page})=>{
 const demand={...structuredClone(payload.state.demands[1]),id:'finish-demand',obraId:'test-work',tipo:'EmissaoInicial',coluna:'fazendo',dataEntregaReal:'',analistaResponsavel:'Ana',sicIds:[],anexos:[]};
 const b=await backend(page,'Analista',false,{demandRecords:[demand],analystNames:['Ana'],analystCanWrite:true});await login(page);
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
 await expect(completion.locator('[name="dataEntregaReal"]')).toHaveAttribute('required','');
 await completion.locator('[name="valorGerado"]').fill('0,00');
 await completion.getByRole('button',{name:'Concluir demanda'}).click();
 await expect(completion).toBeVisible();
 await expect(completion.locator('#formError')).toContainText('Data entrega real');
 expect(b.requests.flatMap(request=>request.changes).some(change=>change.entity==='budget_demands'&&change.key==='finish-demand'&&change.document?.coluna==='concluido')).toBe(false);
 await completion.locator('[name="dataEntregaReal"]').fill('2026-09-21');
 await completion.getByRole('button',{name:'Concluir demanda'}).click();
 await expect.poll(()=>b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='finish-demand'&&change.document?.coluna==='concluido')?.document?.evSemMudanca).toBe(true);
 const completedChange=b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='finish-demand'&&change.document?.coluna==='concluido');
 expect(completedChange.document.valorGerado).toBe(0);
 expect(completedChange.document.dataEntregaReal).toBe('2026-09-21');
 const card=page.locator('article[data-id="finish-demand"]');
 await expect(card).toBeVisible();
 await expect(card.locator('.demand-card-stage-time')).toHaveCount(0);
 await expect(card.locator('.demand-card-value')).toContainText(/R\$\s*0/);
 expect(b.errors).toEqual([]);
});


test('saving the EV from the completion flow resumes the final required fields',async({page})=>{
 const demand={...structuredClone(payload.state.demands[1]),id:'finish-after-ev',obraId:'test-work',tipo:'EmissaoInicial',coluna:'fazendo',dataEntregaReal:'',analistaResponsavel:'Ana',sicIds:[],anexos:[]};
 const b=await backend(page,'Analista',false,{demandRecords:[demand],analystNames:['Ana'],analystCanWrite:true});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('article[data-id="finish-after-ev"]').click();
 const detail=page.locator('#demandDetailForm');
 await detail.locator('[name="coluna"]').selectOption('concluido');
 await detail.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Confirme o impacto no EV'})).toBeVisible();
 await page.getByRole('button',{name:/Atualizar o EV/}).click();

 const evForm=page.locator('#evForm');
 await expect(evForm).toBeVisible();
 await expect(evForm).toHaveAttribute('data-completion-demand-id','finish-after-ev');
 await evForm.locator('.ev-line-row:visible .ev-value-input').first().fill('125,00');
 await evForm.getByRole('button',{name:'Salvar EV',exact:true}).click();
 const deviation=page.locator('[data-ev-haptec-confirm]');
 if(await deviation.isVisible().catch(()=>false)){
  await deviation.locator('[data-ev-haptec-check]').check();
  await deviation.getByRole('button',{name:'Confirmar e salvar EV',exact:true}).click();
 }

 await expect.poll(()=>b.requests.flatMap(request=>request.changes).filter(change=>change.entity==='budget_estimate_versions').length).toBe(1);
 const completion=page.locator('#demandCompletionForm');
 await expect(completion).toBeVisible();
 await expect(completion.locator('.completion-resume-notice')).toContainText('EV salvo');
 await expect(completion.locator('.completion-resume-notice')).toContainText('dados finais');
 await expect(completion.locator('[name="dataEntregaReal"]')).toBeVisible();
 await expect(completion.locator('[name="valorGerado"]')).toHaveValue('25,00');
 await expect(completion).toContainText('Preenchido automaticamente com o impacto financeiro da revisão salva no EV');
 const completionVersion=b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_estimate_versions');
 expect(completionVersion.document.valorAnterior).toBe(150);
 expect(completionVersion.document.impactoDemanda).toBe(25);
 await completion.locator('[name="dataEntregaReal"]').fill('2026-09-22');
 await completion.locator('[name="valorGerado"]').fill('123,45');
 await completion.getByRole('button',{name:'Concluir demanda'}).click();
 await expect.poll(()=>b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='finish-after-ev'&&change.document?.coluna==='concluido')?.document?.valorGerado).toBe(123.45);
 const completed=b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='finish-after-ev'&&change.document?.coluna==='concluido');
 expect(completed.document.evSemMudanca).toBe(false);
 expect(completed.document.dataEntregaReal).toBe('2026-09-22');
 expect(b.errors).toEqual([]);
});

test('completion does not create EV revision when nothing changed',async({page})=>{
 const demand={...structuredClone(payload.state.demands[1]),id:'finish-without-ev-change',obraId:'test-work',tipo:'DemandaExtra',coluna:'fazendo',dataEntregaReal:'',analistaResponsavel:'Ana',sicIds:[],anexos:[]};
 const b=await backend(page,'Analista',false,{demandRecords:[demand],analystNames:['Ana'],analystCanWrite:true});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('article[data-id="finish-without-ev-change"]').click();
 const detail=page.locator('#demandDetailForm');
 await detail.locator('[name="coluna"]').selectOption('concluido');
 await detail.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Confirme o impacto no EV'})).toBeVisible();
 await page.getByRole('button',{name:/Atualizar o EV/}).click();

 const evForm=page.locator('#evForm');
 await expect(evForm).toHaveAttribute('data-completion-demand-id','finish-without-ev-change');
 await evForm.getByRole('button',{name:'Salvar EV',exact:true}).click();
 const deviation=page.locator('[data-ev-haptec-confirm]');
 if(await deviation.isVisible().catch(()=>false)){
  await deviation.locator('[data-ev-haptec-check]').check();
  await deviation.getByRole('button',{name:'Confirmar e salvar EV',exact:true}).click();
 }

 await expect(page.getByRole('heading',{name:'Confirme o impacto no EV'})).toBeVisible();
 await expect(page.getByRole('button',{name:/Não houve mudança no EV/})).toBeVisible();
 expect(b.requests.flatMap(request=>request.changes).some(change=>change.entity==='budget_estimate_versions')).toBe(false);
 expect(b.errors).toEqual([]);
});

test('SIC like DEM-027 can be concluded by an Analyst after final fields',async({page})=>{
 const demand={
  ...structuredClone(payload.state.demands[0]),
  id:'sic-finish-demand',
  obraId:'test-work',
  tipo:'SIC',
  coluna:'aprovadoDiretoria',
  dataEntregaReal:'',
  analistaResponsavel:'Ana',
  sicIds:[],
  anexos:[],
  sicApprovalStatus:'Pendente',
  sicMetadata:{
   ...structuredClone(payload.state.demands[0].sicMetadata),
   tituloSic:'CAMINHÃO PIPA e CAMINHÃO VACOL',
   lecomNumber:'1.187.542',
   numeroSic:'5',
   analistaSalaTecnica:'Ana',
  },
 };
 const b=await backend(page,'Analista',false,{demandRecords:[demand],analystNames:['Ana'],analystCanWrite:true});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('article[data-id="sic-finish-demand"]').click();
 const detail=page.locator('#demandDetailForm');
 await expect(detail.locator('[name="coluna"] option[value="concluido"]')).not.toHaveAttribute('disabled','');
 await detail.locator('[name="coluna"]').selectOption('concluido');
 await detail.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Obrigatoriedades para concluir a SIC'})).toBeVisible();
 await expect(page.getByText('Preencher/alterar o EV ou declarar que não houve mudança',{exact:true})).toBeVisible();
 await expect(page.getByText('Valor da demanda',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:/Não houve mudança no EV/}).click();
 const completion=page.locator('#demandCompletionForm');
 await expect(completion.getByText('Valor da demanda (R$) *',{exact:true})).toBeVisible();
 await completion.locator('[name="valorGerado"]').fill('0,00');
 const finishButton=completion.getByRole('button',{name:'Concluir demanda'});
 await expect(finishButton).toHaveAttribute('data-action','save-demand-completion');
 await finishButton.click();
 await expect(completion.locator('#formError')).toContainText('Data entrega real');
 await completion.locator('[name="dataEntregaReal"]').fill('2026-09-21');
 await finishButton.click();
 await expect.poll(()=>b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='sic-finish-demand'&&change.document?.coluna==='concluido')?.document?.dataEntregaReal).toBe('2026-09-21');
 await expect.poll(()=>b.requests.flatMap(request=>request.changes).find(change=>change.entity==='budget_demands'&&change.key==='sic-finish-demand'&&change.document?.coluna==='concluido')?.document?.valorGerado).toBe(0);
 expect(b.errors).toEqual([]);
});

test('SIC completion returns to obligations after EV save before final data',async({page})=>{
 const demand={
  ...structuredClone(payload.state.demands[0]),
  id:'sic-finish-after-ev',
  obraId:'test-work',
  tipo:'SIC',
  coluna:'aprovadoDiretoria',
  dataEntregaReal:'',
  analistaResponsavel:'Ana',
  sicIds:['SIC-POSTED'],
  sicPostedAt:'2026-09-20',
  anexos:[],
  sicMetadata:{...structuredClone(payload.state.demands[0].sicMetadata),tituloSic:'SIC com ajuste no EV'},
 };
 const postedWork=structuredClone(payload.state.works[0]);
 postedWork.ev.versaoAtual=1;
 postedWork.ev.versions=[];
 const b=await backend(page,'Analista',false,{workRecords:[postedWork],demandRecords:[demand],analystNames:['Ana'],analystCanWrite:true});await login(page);
 await page.getByRole('button',{name:'Abrir Obras'}).click();
 await page.locator('article[data-id="sic-finish-after-ev"]').click();
 const detail=page.locator('#demandDetailForm');
 await detail.locator('[name="coluna"]').selectOption('concluido');
 await detail.getByRole('button',{name:'Salvar',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Obrigatoriedades para concluir a SIC'})).toBeVisible();
 await expect(page.getByRole('button',{name:/Atualizar o EV/})).toBeVisible();
 await expect(page.getByRole('button',{name:/Não houve mudança no EV/})).toHaveCount(0);
 await expect(page.getByRole('button',{name:/Continuar para os dados finais/})).toHaveCount(0);
 await page.getByRole('button',{name:/Atualizar o EV/}).click();

 const evForm=page.locator('#evForm');
 await expect(evForm).toBeVisible();
 await expect(evForm).toHaveAttribute('data-completion-demand-id','sic-finish-after-ev');
 await evForm.locator('.ev-line-row:visible .ev-value-input').first().fill('110,00');
 await evForm.getByRole('button',{name:'Salvar EV',exact:true}).click();
 const deviation=page.locator('[data-ev-haptec-confirm]');
 if(await deviation.isVisible().catch(()=>false)){
  await deviation.locator('[data-ev-haptec-check]').check();
  await deviation.getByRole('button',{name:'Confirmar e salvar EV',exact:true}).click();
 }

 await expect.poll(()=>b.requests.flatMap(request=>request.changes).filter(change=>change.entity==='budget_estimate_versions').length).toBe(1);
 await expect(page.getByRole('heading',{name:'Obrigatoriedades para concluir a SIC'})).toBeVisible();
 const checklist=page.locator('.demand-completion-card');
 await expect(checklist.locator('.completion-resume-notice')).toContainText('EV salvo');
 await expect(checklist).toContainText('✓ EV atualizado e salvo');
 await expect(checklist).toContainText('Data entrega real');
 await expect(checklist).toContainText('Valor da demanda');
 await checklist.getByRole('button',{name:/Continuar para os dados finais/}).click();

 const completion=page.locator('#demandCompletionForm');
 await expect(completion).toBeVisible();
 await expect(completion.locator('[name="dataEntregaReal"]')).toBeVisible();
 await expect(completion.locator('[name="valorGerado"]')).toHaveValue('40,00');
 await expect(completion).toContainText('Preenchido automaticamente com o impacto financeiro da revisão salva no EV');
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
