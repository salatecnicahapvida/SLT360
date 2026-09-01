// The same catalog drives the relational schema, import and browser adapter.
// JSON is reserved for extension attributes and immutable historical snapshots.
const f = (name, type = 'text', reference) => ({ name, type, reference });
const fields = spec => Object.fromEntries(Object.entries(spec).map(([key, value]) => [key, typeof value === 'string' ? f(value) : value]));
const money = name => f(name, 'numeric');
const date = name => f(name, 'date');
const ref = (name, entity) => f(name, 'text', entity);
const entity = (name, module, path, spec = {}, options = {}) => ({ name, module, path, fields: fields(spec), ...options });
const taskFields = {
  id:'id', titulo:'title', obraId:ref('work_id','projects_works'), obraNome:'work_name',
  coluna:'phase', tipo:'type', sprintId:ref('sprint_id','core_sprints'), prioridade:'priority',
  analistaResponsavel:'assignee', dataPrevistaInicio:date('planned_start'), dataInicioReal:date('actual_start'),
  dataPrevistaEntrega:date('due_date'), dataEntregaReal:date('delivered_on'), observacao:'notes',
};
const serviceFields = {
  id:'id', ordemServico:'service_order', codigoOrigem:'source_code', titulo:'title',
  unidadeNome:'unit_name', unidadeId:ref('unit_key','core_units'), centroCusto:'cost_center', coluna:'phase',
  uf:'state_code', regiao:'region', tipoDespesa:'expense_type', tipoDemanda:'demand_type',
  sprintId:ref('sprint_id','core_sprints'), analistaResponsavel:'assignee', prioridade:'priority',
  dataInicio:date('started_on'), dataFim:date('finished_on'), dataPrevistaEntrega:date('due_date'),
  valorProposta:money('proposed_amount'), valorSalaTecnica:money('technical_amount'), valorNegociado:money('negotiated_amount'),
  ordemInterna:'internal_order', observacoes:'notes', assetId:ref('asset_id','clinical_assets'),
};
const sourceServiceFields = {'Código':'source_code','ORDEM DE SERVIÇO':'service_order','NOME DA UNIDADE':'unit_name','NOME DA OBRA':'work_name','CENTRO DE CUSTO':'cost_center','Fase atual':'phase','VALOR DA PROPOSTA':money('proposed_amount'),'VALOR SALA TECNICA':money('technical_amount')};
const oiFields = {ordemInterna:'internal_order',descricao:'description',montantePlanejado:money('planned_amount'),recursosAtribuidos:money('assigned_amount'),montanteDisponivel:money('available_amount'),exercicio:'fiscal_year',obraPlano:'work_name',workId:ref('work_id','projects_works')};

export const MODULES = ['core','projects','budget','maintenance','clinical','finance'];
export const ENTITIES = [
  entity('core_units','core','datasets.UNIT_REGISTRY_DATA.records',{'CENTRO':'unit_code','TIPO':'type','CNPJ':'tax_id','CEP':'postal_code','MUNICIPIO':'city','NOME UNIDADE':'name'},{readonly:true,key:'CENTRO'}),
  entity('core_suppliers','core','state.suppliers',{id:'id',nome:'name',cnpj:'tax_id',email:'email',telefone:'phone',status:'status'}),
  entity('core_sprints','core','state.sprints',{id:'id',nome:'name',dataInicio:date('starts_on'),dataFim:date('ends_on'),status:'status'}),
  entity('projects_works','projects','state.works',{id:'id',nome:'name',codigoOriginal:'code',unit:'unit_name',status:'status',cnpj:'tax_id',uf:'state_code',cidade:'city',regiao:'region',ordemInternaSAP:'internal_order',plannedStart:date('planned_start'),plannedEnd:date('planned_end'),plannedValue:money('planned_amount'),contractedValue:money('contracted_amount'),realizedValue:money('realized_amount'),area:money('area_m2')}),
  entity('projects_demands','projects','state.projectDemands',taskFields),
  entity('projects_plan_stages','projects','datasets.INVESTMENT_PLAN_DATA.records',{registro:'work_code',chaveEtapa:'stage_code',obra:'work_name',etapa:'stage',etapaOrdem:f('stage_order','integer'),inicioPlanejado:date('planned_start'),terminoPlanejado:date('planned_end'),status:'status',uf:'state_code',regiao:'region'},{readonly:true}),
  entity('projects_stage_status','projects','state.projectStatusOverrides',{}, {kind:'map'}),
  entity('projects_commission_readings','projects','datasets.COMMISSION_OBRAS_DATA.records',{id:'id',codigoObra:'work_code',nomeObra:'work_name',mes:'month',status:'status',valorSalaTecnica:money('technical_amount'),valorNegociado:money('negotiated_amount'),aditivos:money('amendments_amount'),areaM2:money('area_m2')},{readonly:true}),
  entity('projects_import_revisions','projects','state.workRevisions',{id:'id',workId:ref('work_id','projects_works'),revision:f('version_number','integer'),reason:'reason',snapshot:f('snapshot','jsonb')},{readonly:true}),
  entity('budget_demands','budget','state.demands',taskFields),
  entity('budget_estimates','budget',null,{id:'id',status:'status',versaoAtual:f('version_number','integer')},{parent:'projects_works',child:'ev',kind:'one'}),
  entity('budget_estimate_lines','budget',null,{id:'id',disciplinaId:'discipline_id',status:'status',valorOrcado:money('budgeted_amount'),valorContratado:money('contracted_amount'),quantidade:money('quantity'),valorUnitario:money('unit_amount')},{parent:'budget_estimates',child:'lines',key:'disciplinaId'}),
  entity('budget_estimate_versions','budget',null,{numero:f('version_number','integer'),data:date('recorded_on'),origem:'origin',valorTotal:money('total_amount'),custoM2:money('cost_m2')},{parent:'budget_estimates',child:'versions'}),
  entity('budget_sics','budget','state.sics',{id:'id',obraId:ref('work_id','projects_works'),demandaId:ref('demand_id','budget_demands'),numeroSic:'sic_number',titulo:'title',status:'status',motivo:'reason',dataAbertura:date('opened_on'),dataAprovacao:date('approved_on'),aprovadoPor:'approved_by'}),
  entity('budget_sic_items','budget',null,{disciplinaId:'discipline_id',valorAnterior:money('previous_amount'),valorNovo:money('new_amount'),delta:money('delta_amount')},{parent:'budget_sics',child:'disciplinasAfetadas',key:'disciplinaId'}),
  entity('budget_contracts','budget','state.contracts',{id:'id',obraId:ref('work_id','projects_works'),fornecedorId:ref('supplier_id','core_suppliers'),disciplinaId:'discipline_id',numeroContrato:'contract_number',valor:money('amount'),data:date('contracted_on')}),
  entity('budget_revisions','budget','state.budgetRevisions',{id:'id',workId:ref('work_id','projects_works'),obraId:ref('obra_id','projects_works'),reason:'reason'}),
  entity('budget_import_estimates','budget','state.evs',{id:'id',workId:ref('work_id','projects_works'),status:'status',total:money('total_amount'),revision:f('version_number','integer')},{readonly:true}),
  entity('budget_archived_demands','budget','state.deletedDemands',taskFields),
  entity('budget_sic_readings','budget','datasets.SIC_BI_DATA.records',{obra:'work_code',nomeObra:'work_name',numeroSic:'sic_number',disciplina:'discipline',valor:money('amount'),dataPostagem:date('posted_on'),sprint:'sprint_name',estado:'state_code',movimento:'movement'},{readonly:true}),
  entity('budget_sprint_readings','budget','datasets.SIC_BI_DATA.demandSummary',{sprint:'sprint_name',planejadas:f('planned_count','integer'),extras:f('extra_count','integer'),total:f('total_count','integer'),entregues:f('delivered_count','integer')},{readonly:true}),
  entity('clinical_assets','clinical','state.clinicalAssets',{id:'id',equipamento:'name',patrimonio:'asset_tag',numeroSerie:'serial_number',fabricante:'manufacturer',modelo:'model',unidadeNome:'unit_name',unidadeId:ref('unit_key','core_units'),status:'status'}),
  entity('maintenance_orders','maintenance','state.maintenanceDemands',Object.fromEntries(Object.entries(serviceFields).filter(([k])=>k!=='assetId')),{filter:'maintenance'}),
  entity('clinical_orders','clinical','state.maintenanceDemands',serviceFields,{filter:'clinical'}),
  ...['maintenance','clinical'].flatMap(module=>[
    entity(`${module}_order_events`,module,null,{fase:'phase',data:date('occurred_on'),observacao:'notes'},{parent:`${module}_orders`,child:'historico'}),
    entity(`${module}_archived_orders`,module,'state.deletedMaintenanceDemands',serviceFields,{filter:module}),
    entity(`${module}_source_readings`,module,'datasets.MAINTENANCE_DATA.records',sourceServiceFields,{readonly:true,filter:module}),
  ]),
  entity('finance_funds','finance','state.funds',{id:'id',workId:ref('work_id','projects_works'),code:'code',type:'type',year:f('fiscal_year','integer'),account:'account',costCenter:'cost_center',status:'status',requested:money('requested_amount'),approved:money('approved_amount'),committed:money('committed_amount'),used:money('used_amount')}),
  entity('finance_movements','finance','state.fundMovements',{id:'id',fundId:ref('fund_id','finance_funds'),workId:ref('work_id','projects_works'),type:'type',valor:money('amount'),value:money('value_amount'),date:date('occurred_on')}),
  entity('finance_manual_orders','finance','state.capexManualOiRows',oiFields,{key:'ordemInterna'}),
  entity('finance_internal_orders','finance','datasets.CAPEX_CONTROL_DATA.baseOi',oiFields,{readonly:true}),
  entity('finance_order_classifications','finance','datasets.CAPEX_CONTROL_DATA.dePara',{ordemInterna:'internal_order',descricao:'description',obraPlano:'work_name',categoriaOrc:'budget_category',grupoExecutivo:'executive_group'},{readonly:true}),
  entity('finance_transfers','finance','datasets.CAPEX_CONTROL_DATA.transferencias',{codOrigem:'source_code',codDestino:'destination_code',numeroDocumento:'document_number',valor:money('amount'),data:date('occurred_on'),justificativa:'reason'},{readonly:true}),
  entity('finance_consumption_entries','finance','datasets.CAPEX_CONTROL_DATA.consumo.topLines',{ordemInterna:'internal_order',obraPlano:'work_name',valor:money('amount'),dataLancamento:date('posted_on'),fornecedor:'supplier_name',documentoReferencia:'document_number',categoriaResumo:'category'},{readonly:true}),
  ...['byOi','byMonth','byMonthPlanned','byMonthUnplanned','byMonthOper','byCategory','byCostCenter'].map(series=>entity(`finance_consumption_${series.replace(/[A-Z]/g,c=>'_'+c.toLowerCase())}`,'finance',`datasets.CAPEX_CONTROL_DATA.consumo.${series}`,{label:'label',valor:money('amount')},{readonly:true})),
  ...['summaryInvestments','summaryCostLines'].map((key,i)=>entity(`maintenance_${i?'cost_lines':'investments'}`,'maintenance',`datasets.MAINTENANCE_DATA.${key}`,{obra:'work_name',linha:'cost_line',valor:money('amount')},{readonly:true})),
  entity('core_history','core','state.history',{id:'id',entidade:'entity_type',entidadeId:'entity_id',campo:'field_name',usuario:'actor_name',timestamp:'occurred_at'}),
  // One small record holds source labels and scalar totals, never the dataset's rows.
  ...[['UNIT_REGISTRY_DATA','core'],['INVESTMENT_PLAN_DATA','projects'],['COMMISSION_OBRAS_DATA','projects'],['SIC_BI_DATA','budget'],['MAINTENANCE_DATA','maintenance'],['CAPEX_CONTROL_DATA','finance'],['HAPCAPEX_REFERENCE','finance']].map(([source,module])=>entity(`${module}_source_${source.toLowerCase()}`,module,`datasets.${source}`,{}, {kind:'metadata',readonly:true})),
];
export const ENTITY_BY_NAME = new Map(ENTITIES.map(e=>[e.name,e]));
export const childrenOf = name => ENTITIES.filter(e=>e.parent===name);
const clone = value => structuredClone(value);
const assetFields = ['equipamento','patrimonio','numeroSerie','fabricante','modelo'];
const at = (value,path) => path.split('.').reduce((v,k)=>v?.[k],value);
const set = (value,path,data) => { const keys=path.split('.'); let target=value; for(const key of keys.slice(0,-1)) target=target[key]??={}; target[keys.at(-1)]=data; };
const normalize = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function isClinical(item) {
  const text=normalize(item.centroCusto || item['CENTRO DE CUSTO']);
  return text.includes('clinica') && ['engenharia','eng ','eng.','engª'].some(v=>text.includes(v));
}
const accepts = (entity,item) => !entity.filter || isClinical(item)===(entity.filter==='clinical');
function metadata(value) {
  if (Array.isArray(value)) return undefined;
  if (value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,metadata(v)]).filter(([,v])=>v!==undefined));
  return value;
}
export const recordKey = row => `${row.entity}\u0000${row.key}`;
export function flattenPayload(payload,{writableOnly=false}={}) {
  const records=[];
  function append(e,item,ordinal,key,parent=null) {
    const document=clone(item);
    if(e.name==='clinical_orders' && document.assetId) {
      for(const key of [...assetFields,'assetName']) delete document[key];
    }
    const childFields=[];
    for(const child of childrenOf(e.name)) {
      if(!Object.hasOwn(document,child.child)) continue;
      childFields.push(child.child);
      const nested=document[child.child]; delete document[child.child];
      if(child.kind==='one') { if(nested!=null) append(child,nested,0,`${key}/one`,key); }
      else (nested||[]).forEach((v,i)=>append(child,v,i,`${key}/${String(v[child.key||'id'] ?? i)}`,key));
    }
    records.push({entity:e.name,key:String(key),ordinal,parent_key:parent,child_fields:childFields,document});
  }
  for(const e of ENTITIES.filter(e=>e.path && (!writableOnly || !e.readonly))) {
    const value=at(payload,e.path);
    if(e.kind==='metadata') { if(value) append(e,metadata(value),0,'source'); }
    else if(e.kind==='map') Object.entries(value||{}).forEach(([key,v],i)=>append(e,{value:v},i,key));
    else (value||[]).forEach((item,i)=>{ if(accepts(e,item)) append(e,item,i,String(item[e.key||'id']??i)); });
  }
  const keys=new Set();
  for(const r of records) { const key=recordKey(r); if(keys.has(key)) throw new Error(`Identificador duplicado em ${r.entity}: ${r.key}`); keys.add(key); }
  // Parents must be inserted before children, and deleted after them.
  const rank=e=>e.parent ? rank(ENTITY_BY_NAME.get(e.parent))+1 : 0;
  return records.sort((a,b)=>rank(ENTITY_BY_NAME.get(a.entity))-rank(ENTITY_BY_NAME.get(b.entity)));
}
export function hydrateRecords(records) {
  const payload={state:{},datasets:{}};
  const groups=new Map(ENTITIES.map(e=>[e.name,records.filter(r=>r.entity===e.name).sort((a,b)=>a.ordinal-b.ordinal||a.key.localeCompare(b.key))]));
  function doc(e,row) {
    const value=clone(row.document);
    if(e.name==='clinical_orders' && value.assetId) {
      const asset=groups.get('clinical_assets').find(r=>r.key===value.assetId)?.document;
      if(asset) {
        for(const key of assetFields) if(Object.hasOwn(asset,key)) value[key]=asset[key];
        value.assetName=asset.equipamento||'';
      }
    }
    for(const child of childrenOf(e.name)) {
      if(!(row.child_fields||[]).includes(child.child)) continue;
      const nested=groups.get(child.name).filter(r=>r.parent_key===row.key).map(r=>doc(child,r));
      value[child.child]=child.kind==='one' ? nested[0]??null : nested;
    }
    return value;
  }
  // Source metadata must be merged before its normalized rows.
  for(const e of ENTITIES.filter(e=>e.kind==='metadata')) {
    const row=groups.get(e.name)[0]; if(row) set(payload,e.path,doc(e,row));
  }
  for(const e of ENTITIES.filter(e=>e.path && e.kind!=='metadata')) {
    if(e.kind==='map') set(payload,e.path,Object.fromEntries(groups.get(e.name).map(r=>[r.key,r.document.value])));
    else {
      const related=ENTITIES.filter(x=>x.path===e.path);
      const merged=related.flatMap(x=>groups.get(x.name).map(r=>({e:x,r}))).sort((a,b)=>a.r.ordinal-b.r.ordinal||a.r.key.localeCompare(b.r.key));
      set(payload,e.path,merged.map(({e,r})=>doc(e,r)));
    }
  }
  return payload;
}
