import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {businessDate} from '../src/dates.js';
import {csvCell} from '../src/csv.js';
import {arithmetic} from '../src/arithmetic.js';
import {flattenPayload,hydrateRecords} from '../src/module-model.js';
import {createModuleStore} from '../src/module-store.js';
import {database,seed,admin} from './helpers/database.mjs';

test('business date follows São Paulo and changes across midnight',()=>{
 assert.equal(businessDate(new Date('2026-09-09T02:59:59Z')),'2026-09-08');
 assert.equal(businessDate(new Date('2026-09-09T03:00:00Z')),'2026-09-09');
});
test('spreadsheet arithmetic respects precedence without executing JavaScript',()=>{
 assert.equal(arithmetic('=10 + 2*(3 - 1)'),14);
 assert.equal(arithmetic('=-10/2'),-5);
 assert.equal(arithmetic('=1/0'),null);
 assert.equal(arithmetic('=alert(1)'),null);
 assert.equal(arithmetic('=1;2'),null);
});
test('CSV neutralizes formulas while preserving numeric amounts',()=>{
 assert.equal(csvCell('=1+1'),'"\'=1+1"');
 assert.equal(csvCell(' @SUM(1)'),'"\'@SUM(1)"');
 assert.equal(csvCell(-12),'"-12"');
 assert.equal(csvCell('A "B"'),'"A ""B"""');
});

test('EV settings, hidden historical IDs and SIC state round-trip without losing data',()=>{
 const state={configurationCatalog:[{id:'category/test',type:'category',label:'Teste',active:true}],evTypologyOverrides:{x:'Hospital'},evReferenceTargets:{x:{value:12}},strategicTargetOverrides:{hospital:{targetMin:10,targetMax:20}},deletedEVRecordIds:['x'],demands:[{id:'d',obraId:'w',analistaResponsavel:'Bruno',analistasComplementares:['Ana','Carla'],projetosEnvolvidos:['ARQ','ELE'],projetosEnvolvidosDetalhes:{ARQ:{responsavelPostagem:'Bruno',dataPostagem:'2026-09-10',localArquivo:'SharePoint/ARQ'}}}],sicApprovalWorks:[{id:'w',descricao:'Test',sics:[]}],sicApprovalWeeks:[{id:'week',label:'Test'}],sicApprovalSnapshots:[{weekId:'week',obraId:'w',ev:{total:1}}]};
 const result=hydrateRecords(flattenPayload({state})).state;
 for(const key of Object.keys(state)) assert.deepEqual(result[key],state[key],key);
});

test('all migrations: private SIC/settings, atomic saves, explicit archive, backup, restore and work links',async()=>{
 const db=await database();
 try{
  await seed(db,{state:{
   works:[{id:'w',nome:'Test',classificacaoObra:'Outros'},{id:'inactive-work',nome:'Inactive'}],
   demands:[
    {id:'d',obraId:'w',titulo:'Test',tipo:'SIC',coluna:'fazer',sprintId:'sprint-15',analistaResponsavel:'Skarth'},
    {id:'skart-demand',obraId:'w',titulo:'Grafia antiga',tipo:'ReemissaoCompleta',coluna:'fazendo',sprintId:'sprint-15',analistaResponsavel:'SKART',dataInicioReal:'2026-01-01'},
   ],
   sprints:[
    {id:'sprint-15',nome:'Sprint 15',status:'Encerrada',dataInicio:'2026-08-17',dataFim:'2026-08-28'},
    {id:'sprint-017',nome:'Sprint 17',status:'Ativa',dataInicio:'2026-09-14',dataFim:'2026-09-27'},
   ],
  },datasets:{}});
  const migrations=(await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>n>='202608310005').sort();
  for(const name of migrations)await db.exec(await fs.readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
  const backupCapture=(await db.query("select provolatile,pg_get_functiondef(oid) definition from pg_proc where oid='slt_private.capture_app_snapshot()'::regprocedure")).rows[0];
  assert.equal(backupCapture.provolatile,'s','o snapshot de backup usa uma visão estável');
  assert.doesNotMatch(backupCapture.definition,/pg_advisory_xact_lock\(hashtextextended\('slt360\/state-consistency'/,'o snapshot não pode segurar lock exclusivo contra gravações');
  const dailyBackupDefinition=(await db.query("select pg_get_functiondef('public.slt_backup_daily()'::regprocedure) definition")).rows[0].definition;
  assert.match(dailyBackupDefinition,/pg_try_advisory_xact_lock/,'logins simultâneos não formam fila de backups');
  assert.match(dailyBackupDefinition,/pg_advisory_xact_lock_shared/,'backup e gravação compartilham o lock de consistência');
  const commitSettings=(await db.query("select proconfig from pg_proc where oid='public.slt_commit_changes(uuid,jsonb)'::regprocedure")).rows[0].proconfig;
  assert.ok(commitSettings.includes('lock_timeout=3s'),'gravação falha rápido em vez de ficar indefinidamente em espera');
  await db.query(`insert into slt_budget_sic_approval_initial_state(id,payload,source_checksum)
    values(1,$1,'test')`,[JSON.stringify({
      obras:[{id:'approval-w',portfolioWorkId:'w',descricao:'Test',ev:{total:100,semAditivos:90,aditivosAprovados:10,areaM2:10,valorM2:10},sap:{faturasAnosAnteriores:5},sics:[],historyEvents:[]}],
      weeks:[{id:'week-6',label:'Semana 6',start:'2026-09-21',end:'2026-09-25',status:'open',placeholder:false}],
      snapshots:[],notificationReads:{},
    })]);
  await db.query("update slt_budget_demands set phase='validacaoObras' where record_key='d'");
  await assert.rejects(
    db.query("update slt_budget_demands set phase='validadoObras' where record_key='d'"),
    (error)=>error?.code==='23514' && /situação de execução/i.test(error.message),
    'a validação de Obras exige a situação de execução do serviço',
  );
  await assert.rejects(
    db.query(`update slt_budget_demands
      set phase='validadoObras',
          extra=extra||$1::jsonb
      where record_key='d'`,[JSON.stringify({
        sicWorksValidation:{version:3,amount:12.34,serviceExecuted:null,serviceExecutionStatus:'partially_executed',serviceExecutionDetails:''},
      })]),
    (error)=>error?.code==='23514' && /quais atividades/i.test(error.message),
    'a execução parcial exige o detalhamento das atividades executadas e pendentes',
  );
  await db.query(`update slt_budget_demands
    set phase='validadoObras',
        extra=extra||$1::jsonb
    where record_key='d'`,[JSON.stringify({
      sicWorksValidation:{version:3,amount:12.34,serviceExecuted:null,serviceExecutionStatus:'partially_executed',serviceExecutionDetails:'Pintura executada; climatização ainda não executada.',validatedAt:'2026-10-30T12:00:00.000Z',validatedBy:'Obras'},
    })]);
  await db.query(`update slt_budget_demands
    set phase='aprovacaoDiretoria',
        extra=extra||$1::jsonb
    where record_key='d'`,[JSON.stringify({
      sicMetadata:{lecomNumber:'1.234.567',descricaoSic:'SIC criada pelo Kanban'},
      sicDirectorApproval:{version:1,weekId:'week-6',approvalCardId:'approval-w',sicValue:12.34,priorInvoices:5,assignedAmount:80,committedAmount:30,oiList:[],classification:'Teste'},
    })]);
  await assert.rejects(
    db.query(`insert into slt_budget_demands(record_key,work_id,type,extra)
      values('duplicate-lecom','w','SIC',$1::jsonb)`,[JSON.stringify({sicMetadata:{lecomNumber:'1234567'}})]),
    (error)=>error?.code==='23505' && /LECOM já existe no card d/i.test(error.message),
    'pontuação não permite recriar um LECOM ativo',
  );
  await db.query(`insert into slt_budget_archived_demands(record_key,work_id,type,extra)
    values('archived-lecom','w','SIC',$1::jsonb)`,[JSON.stringify({sicMetadata:{lecomNumber:'9.876.543'}})]);
  await assert.rejects(
    db.query(`insert into slt_budget_demands(record_key,work_id,type,extra)
      values('duplicate-archived-lecom','w','SIC',$1::jsonb)`,[JSON.stringify({sicMetadata:{lecomNumber:'9876543'}})]),
    (error)=>error?.code==='23505' && /archived-lecom/i.test(error.message),
    'um LECOM arquivado continua reservado para impedir outro card',
  );
  let queued=(await db.query(`select payload from slt_budget_sic_approval_initial_state where id=1`)).rows[0].payload;
  assert.equal(queued.obras[0].ev.total,100,'preserva o EV histórico correto do card');
  assert.equal(queued.obras[0].sics.length,1);
  assert.equal(queued.obras[0].sics[0].demandId,'d');
  assert.equal(queued.obras[0].sics[0].serviceExecuted,null,'preserva o booleano legado como nulo na execução parcial');
  assert.equal(queued.obras[0].sics[0].serviceExecutionStatus,'partially_executed','sincroniza a execução parcial com a Aprovação de SICs');
  assert.equal(queued.obras[0].sics[0].serviceExecutionDetails,'Pintura executada; climatização ainda não executada.','sincroniza o detalhamento da execução parcial');
  assert.equal(queued.snapshots[0].sap.saldoAtual,50);

  // Corrigir o valor no Kanban deve sincronizar a SIC já existente sem perder
  // o quadro-resumo montado na apresentação da Diretoria.
  const originalSicId=queued.obras[0].sics[0].id;
  queued.obras[0].sics[0].quadroResumo=[{id:'q-1',descricao:'Item do quadro-resumo',valor:12.34}];
  queued.obras[0].sics[0].quadroResumoAtivo=true;
  queued.obras[0].sics[0].quadroResumoAberto=true;
  await db.query(`update slt_budget_sic_approval_initial_state
    set payload=$1, revision=revision+1 where id=1`,[JSON.stringify(queued)]);
  await db.query(`update slt_budget_demands
    set phase='validadoObras',
        extra=extra||$1::jsonb
    where record_key='d'`,[JSON.stringify({
      sicWorksValidation:{version:3,amount:12.34,serviceExecuted:false,serviceExecutionStatus:'not_executed',serviceExecutionDetails:'',validatedAt:'2026-10-30T13:00:00.000Z',validatedBy:'Obras'},
    })]);
  await db.query(`update slt_budget_demands
    set phase='aprovacaoDiretoria',
        extra=extra||$1::jsonb
    where record_key='d'`,[JSON.stringify({
      sicDirectorApproval:{version:1,weekId:'week-6',approvalCardId:'approval-w',sicValue:19.99,priorInvoices:5,assignedAmount:80,committedAmount:30,oiList:[],classification:'Teste'},
    })]);
  queued=(await db.query(`select payload from slt_budget_sic_approval_initial_state where id=1`)).rows[0].payload;
  assert.equal(queued.obras[0].sics.length,1,'o reenvio atualiza a SIC existente sem duplicar');
  assert.equal(queued.obras[0].sics[0].id,originalSicId,'preserva a identidade da SIC no quadro');
  assert.equal(queued.obras[0].sics[0].valor,19.99,'sincroniza o valor revisado do Kanban');
  assert.equal(queued.obras[0].sics[0].serviceExecuted,false,'sincroniza a revisão da situação de execução');
  assert.equal(queued.obras[0].sics[0].serviceExecutionStatus,'not_executed');
  assert.equal(queued.obras[0].sics[0].serviceExecutionDetails,'');
  assert.deepEqual(queued.obras[0].sics[0].quadroResumo,[{id:'q-1',descricao:'Item do quadro-resumo',valor:12.34}],'preserva o quadro-resumo existente');
  assert.equal(queued.obras[0].sics[0].quadroResumoAtivo,true);
  assert.equal(queued.obras[0].sics[0].quadroResumoAberto,true);
  assert.equal(queued.obras[0].historyEvents.filter(event=>event.type==='sic_value_synced').length,1,'registra a sincronização do valor no histórico');

  // Se o valor já estiver igual ao Kanban, a movimentação também é aceita sem
  // criar uma segunda SIC nem gerar eventos de alteração desnecessários.
  await db.query("update slt_budget_demands set phase='validadoObras' where record_key='d'");
  await db.query(`update slt_budget_demands
    set phase='aprovacaoDiretoria',
        extra=extra||$1::jsonb
    where record_key='d'`,[JSON.stringify({
      sicDirectorApproval:{version:1,weekId:'week-6',approvalCardId:'approval-w',sicValue:19.99,priorInvoices:5,assignedAmount:80,committedAmount:30,oiList:[],classification:'Teste'},
    })]);
  queued=(await db.query(`select payload from slt_budget_sic_approval_initial_state where id=1`)).rows[0].payload;
  assert.equal(queued.obras[0].sics.length,1,'o valor idêntico não cria duplicidade');
  assert.equal(queued.obras[0].sics[0].valor,19.99);
  assert.equal(queued.obras[0].historyEvents.filter(event=>event.type==='sic_value_synced').length,1,'valor idêntico não gera sincronização repetida');
  assert.deepEqual(queued.obras[0].sics[0].quadroResumo,[{id:'q-1',descricao:'Item do quadro-resumo',valor:12.34}]);

  // Excluir o card da pauta não apaga a demanda operacional. Ao devolvê-la a
  // Validado Obras e enviá-la novamente, a pendência oculta deve ser substituída
  // por uma única entrada ativa, sem falso positivo de duplicidade.
  queued.obras[0].excludedWeekIds=['week-6'];
  await db.query(`update slt_budget_sic_approval_initial_state
    set payload=$1, revision=revision+1 where id=1`,[JSON.stringify(queued)]);
  await db.query("update slt_budget_demands set phase='validadoObras' where record_key='d'");
  await db.query(`update slt_budget_demands
    set phase='aprovacaoDiretoria',
        extra=extra||$1::jsonb
    where record_key='d'`,[JSON.stringify({
      sicDirectorApproval:{version:1,weekId:'week-6',approvalCardId:'approval-w',sicValue:12.34,priorInvoices:5,assignedAmount:80,committedAmount:30,oiList:[],classification:'Teste'},
    })]);
  queued=(await db.query(`select payload from slt_budget_sic_approval_initial_state where id=1`)).rows[0].payload;
  assert.deepEqual(queued.obras[0].excludedWeekIds,[],'a semana recriada volta a ficar visível');
  assert.equal(queued.obras[0].sics.length,1,'a pendência excluída é substituída, não duplicada');
  assert.equal(queued.obras[0].sics[0].demandId,'d');
  await db.query("update slt_budget_demands set notes='sem nova transição' where record_key='d'");
  queued=(await db.query(`select payload from slt_budget_sic_approval_initial_state where id=1`)).rows[0].payload;
  assert.equal(queued.obras[0].sics.length,1,'não retroalimenta nem duplica demanda já na etapa');
  assert.equal((await db.query("select extra->>'classificacaoObra' category from slt_projects_works where record_key='w'")).rows[0].category,'');
  assert.equal((await db.query("select sprint_id from slt_budget_demands where record_key='d'")).rows[0].sprint_id,'sprint-017');
  const skarthAssignment=(await db.query("select assignee,assignee_id from slt_budget_demands where record_key='skart-demand'")).rows[0];
  assert.equal(skarthAssignment.assignee,'Skarth');
  assert.ok(skarthAssignment.assignee_id);
  assert.equal((await db.query("select count(*)::int total from slt_core_analysts where lower(btrim(nome))='skart'")).rows[0].total,0);
  await assert.rejects(
   db.query("insert into slt_budget_demands(record_key,work_id,type,assignee) values('invalid-analyst','w','ReemissaoCompleta','Intruso')"),
   {code:'23503'}
  );
  await assert.rejects(
   db.query("insert into slt_budget_demands(record_key,work_id,type,extra) values('invalid-complementary','w','ReemissaoCompleta','{\"analistasComplementares\":[\"Intruso\"]}')"),
   {code:'23503'}
  );
  await db.query("insert into slt_budget_demands(record_key,work_id,type,assignee,extra) values('valid-analyst','w','ReemissaoCompleta','sKaRtH','{\"analistasComplementares\":[\"SKARTH\"]}')");
  const validAssignment=(await db.query("select assignee,extra->'analistasComplementares' complementary from slt_budget_demands where record_key='valid-analyst'")).rows[0];
  assert.equal(validAssignment.assignee,'Skarth');
  assert.deepEqual(validAssignment.complementary,['Skarth']);
  await db.query("delete from slt_budget_demands where record_key='valid-analyst'");
  const phaseTracking=(await db.query("select extra->>'phaseStartedAt' started_at, extra->>'phaseStartedAtEstimated' estimated, extra->>'createdAt' demand_created_at, created_at from slt_budget_demands where record_key='skart-demand'")).rows[0];
  assert.match(phaseTracking.started_at,/^\d{4}-\d{2}-\d{2}T/);
  assert.equal(new Date(phaseTracking.started_at).getTime(),new Date(phaseTracking.demand_created_at).getTime());
  assert.equal(new Date(phaseTracking.started_at).getTime(),new Date(phaseTracking.created_at).getTime());
  assert.equal(phaseTracking.estimated,'false');
  await db.query("update slt_projects_works set deleted_at=now() where record_key='inactive-work'");
  for(const type of ['EmissaoInicial','ReemissaoCompleta','SIC']){
   await assert.rejects(
    db.query("insert into slt_budget_demands(record_key,work_id,type) values($1,'inactive-work',$2)",[`invalid-${type}`,type]),
    {code:'23503'}
   );
  }
  await assert.rejects(db.query("update slt_projects_works set deleted_at=now() where record_key='w'"),{code:'23503'});
  const as=async(role,id='')=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role '+role);};
  let request=1;
  const commit=changes=>db.query('select slt_commit_changes($1,$2) result',[`00000000-0000-4000-8000-${String(request++).padStart(12,'0')}`,JSON.stringify(changes)]);
  await as('authenticated',admin);
  await commit([{
   entity:'budget_demands',key:'created-demand',operation:'upsert',expected_revision:0,ordinal:1,child_fields:[],
   document:{id:'created-demand',tipo:'EmissaoInicial',coluna:'fazer',obraId:'w',titulo:'Demanda criada'},
  }]);
  assert.equal((await db.query("select count(*)::integer total from slt_budget_demands where record_key='created-demand' and deleted_at is null")).rows[0].total,1);
  assert.equal((await db.query("select has_table_privilege('authenticated','slt_projects_works','UPDATE') allowed")).rows[0].allowed,false,'criar demanda não concede edição direta das obras');
  await as('anon');await assert.rejects(db.query('select * from slt_budget_approval_works'),{code:'42501'});
  await as('authenticated',admin);
  const state={configurationCatalog:[{id:'category/test',type:'category',label:'Teste',active:true}],sicApprovalWorks:[{id:'aw',descricao:'Approval'}],sicApprovalWeeks:[{id:'week',start:'2026-09-01'}],sicApprovalSnapshots:[{weekId:'week',obraId:'aw',ev:{total:123}}],evReferenceTargets:{hospital:{value:100}},deletedEVRecordIds:['hist']};
  const changes=flattenPayload({state}).map(r=>({...r,expected_revision:0,operation:'upsert'}));
  await commit(changes);
  const legacy=(await db.query('select slt_module_load() result')).rows[0].result;
  assert.equal(legacy.records.some(r=>r.entity==='budget_approval_works'),false,'legacy clients receive their compatible catalog');
  await db.query("select set_config('request.headers',$1,false)", [JSON.stringify({'x-client-info':'unified-1'})]);
  const loaded=(await db.query('select slt_module_load() result')).rows[0].result;
  for(const key of Object.keys(state))assert.deepEqual(hydrateRecords(loaded.records).state[key],state[key]);
  const tombstoneKey='revived-after-delete';
  const tombstoneCreate={
   entity:'budget_approval_works',key:tombstoneKey,operation:'upsert',expected_revision:0,ordinal:99,child_fields:[],
   document:{id:tombstoneKey,descricao:'Primeira versão'},
  };
  await commit([tombstoneCreate]);
  await commit([{...tombstoneCreate,operation:'delete',expected_revision:1}]);
  const revived=(await commit([{...tombstoneCreate,document:{id:tombstoneKey,descricao:'Recriado'}}])).rows[0].result;
  assert.equal(Number(revived[0].revision),1,'registro excluído pode ser recriado como uma nova revisão lógica');
  assert.equal((await db.query('select description from slt_budget_approval_works where record_key=$1 and deleted_at is null',[tombstoneKey])).rows[0].description,'Recriado');
  await assert.rejects(
   commit([{...tombstoneCreate,document:{id:tombstoneKey,descricao:'Cliente desatualizado'},expected_revision:2}]),
   {code:'PT409'},
   'recriação não remove a proteção contra clientes com revisão antiga',
  );
  const home=(await db.query('select slt_home_summary() result')).rows[0].result;
  assert.equal(home.schema_version,2);
  assert.equal(Number(home.works.totalWorks),1);
  assert.equal(Number(home.works.activeCount),3);
  await assert.rejects(commit([{entity:'budget_demands',key:'d',operation:'delete',expected_revision:1}]),{code:'22023'});
  const backup=(await db.query("select slt_backup_manual('test') result")).rows[0].result;
  const daily=(await db.query('select slt_backup_daily() result')).rows[0].result;
  assert.equal(daily.created,false,'a manual backup suppresses a redundant daily copy for 24 hours');
  await commit([{...changes.find(c=>c.entity==='budget_approval_works'),document:{id:'aw',descricao:'Changed'},expected_revision:1}]);
  await db.query('select slt_backup_restore($1)',[backup.id]);
  assert.ok((await db.query('select count(*)::integer total from slt_backup_list()')).rows[0].total<=2);
  assert.equal((await db.query('select description from slt_budget_approval_works')).rows[0].description,'Approval');
  await assert.rejects(commit([{...changes.find(c=>c.entity==='budget_approval_works'),expected_revision:2}]),{code:'PT409'});
  assert.equal((await db.query('select * from slt_budget_demands where deleted_at is null')).rows.length,3);
  await as('authenticated','22222222-2222-4222-8222-222222222222');
  await assert.rejects(db.query('select slt_backup_restore($1)',[backup.id]),{code:'42501'});
  assert.equal((await db.query('select * from slt_budget_approval_works')).rows.length,0);
 }finally{await db.close();}
});
