import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// Public configuration copied from the HAPCAPEX public client, never a secret/service-role key.
const HAP_URL='https://kuvwfyuhrnfsubkapeek.supabase.co';
const hapClient=createClient(HAP_URL,'sb_publishable_-MtsnK_nyG5ZryuLDynTdg_R8hT1s66',{auth:{storageKey:'slt360-hapcapex-isolated-auth',persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
let hapAuthenticated=false;
let hapSyncMessage='';


const EXERCISE = 2026;
let financeEntries = [];
let metadata = null;
let financialSearch = '';
let financialStatus = 'all';
let selectedFinanceWorkId = '';
let oiQuery = '';
let oiGroup = '';
let oiHead = '';
let selectedOI = '';
const formatMoney = value => value === null || value === undefined ? '—' : new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
const clean = value => String(value ?? '').trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const key = value => String(value ?? '').trim().replace(/\D/g,'');
const number = value => typeof value === 'number' ? value : Number(String(value ?? '').replace(/\./g,'').replace(',','.')) || 0;
const safeText = value => String(value ?? '').trim();

export function parseCapexWorkbook(buffer) {
  const book = XLSX.read(buffer,{type:'array'});
  const sheet = book.Sheets['Relatorio Geral'];
  if (!sheet) throw new Error('A planilha precisa conter a aba "Relatorio Geral".');
  const rows = XLSX.utils.sheet_to_json(sheet,{header:1,defval:null});
  if (!String(rows[2]?.[2] || '').includes('2026')) throw new Error('O relatório não corresponde ao exercício 2026.');
  const header = rows.findIndex(row => String(row?.[0] || '').trim() === 'Ordem Interna' && String(row?.[4] || '').trim() === 'CAPEX Inicial');
  if (header < 0) throw new Error('Cabeçalho financeiro oficial não identificado.');
  const seen = new Set();
  const entries = [];
  for (const row of rows.slice(header + 1)) {
    const oiList = safeText(row?.[0]).split(/[,;\/\s]+/).map(key).filter(Boolean);
    if (!oiList.length || !row?.[1]) continue;
    const unique = [...new Set(oiList)];
    if (unique.some(oi => seen.has(oi))) throw new Error('OI duplicada no relatório: ' + unique.filter(oi => seen.has(oi)).join(', '));
    unique.forEach(oi => seen.add(oi));
    const initial = number(row[4]), current = number(row[5]), committed = number(row[6]), realized = number(row[7]), paid = number(row[8]), balance = number(row[9]);
    entries.push({oiList:unique,nome:safeText(row[1]),pacote:safeText(row[2]),head:safeText(row[3]),initial,current,committed,realized,paid,balance,category:safeText(row[10]),difference:current-committed-balance});
  }
  if (!entries.length) throw new Error('Nenhum lançamento financeiro válido foi encontrado.');
  const totals = ['initial','current','committed','realized','paid','balance'].reduce((o,k)=>(o[k]=entries.reduce((s,e)=>s+e[k],0),o),{});
  const reported = rows[4] || [];
  const columns = {initial:4,current:5,committed:6,realized:7,paid:8,balance:9};
  for(const [field,col] of Object.entries(columns)){
    if(typeof reported[col]==='number' && Math.abs(totals[field]-reported[col])>0.11) throw new Error('Total de '+field+' diverge do total oficial do relatório.');
  }
  return {entries,totals,year:EXERCISE,source:'HAPCAPEX — Relatório Geral',issued:safeText(rows[3]?.[2]),validatedAt:new Date().toISOString()};
}

export function financialReconciliation(portfolio, entries=financeEntries) {
  const result=[];
  const byOI=new Map();
  for(const e of entries) for(const oi of e.oiList){if(!byOI.has(oi))byOI.set(oi,[]);byOI.get(oi).push(e);}
  const assigned=new Set();
  const oiOwners=new Map();
  for(const work of portfolio) for(const oi of String(work.sap??'').split(/[,;\\/\\s]+/).map(key).filter(Boolean)){
    if(!oiOwners.has(oi))oiOwners.set(oi,new Set());
    oiOwners.get(oi).add(String(work.id));
  }
  // Inclui obras iniciadas em anos anteriores que possuem movimento no exercício 2026.
  // Ano de cadastro do empreendimento não é o exercício do registro financeiro.
  for(const work of portfolio.filter(w=>String(w.year)===String(EXERCISE) || String(w.sap??'').split(/[,;\/\s]+/).map(key).some(oi=>byOI.has(oi)))){
    const oiList=[...new Set(String(work.sap??'').split(/[,;\/\s]+/).map(key).filter(Boolean))];
    const hits=[...new Set(oiList.flatMap(oi=>byOI.get(oi)||[]))];
    const ambiguous=hits.some(e=>e.oiList.some(oi=>(byOI.get(oi)||[]).length>1 || (oiOwners.get(oi)?.size||0)>1)) || hits.some(e=>assigned.has(e));
    if(!ambiguous) hits.forEach(e=>assigned.add(e));
    const add=field=>hits.every(e=>e[field]!=null)?hits.reduce((v,e)=>v+e[field],0):null;
    const grouped=hits.length?{current:add('current'),committed:add('committed'),realized:add('realized'),balance:add('balance'),initial:add('initial'),paid:add('paid')}:null;
    result.push({work,entry:!ambiguous?grouped:null,status:ambiguous?'Conflito de vínculo':hits.length===0?'Sem conciliação':'Conciliado'});
  }
  return {rows:result,unmatched:entries.filter(e=>!assigned.has(e)),totals:metadata?.totals||null};
}


const percent = (a,b) => b > 0 ? (a / b * 100).toFixed(1).replace('.',',') + '%' : '—';
const compact = value => value == null ? '—' : new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:2,style:'currency',currency:'BRL'}).format(value);
const financeCard = (label,value,detail='',tone='') => '<article class="panel" style="padding:19px;border-top:3px solid '+(tone||'#1769aa')+';min-width:180px;flex:1"><div style="color:#61758b;font-weight:700;font-size:12px;text-transform:uppercase">'+clean(label)+'</div><div style="font-size:clamp(20px,2vw,28px);font-weight:800;color:#093866;margin:8px 0">'+compact(value)+'</div><small>'+clean(detail)+'</small></article>';
const shareRows = (entries,field,valueKey='current') => {
  const groups=new Map();
  for(const e of entries){
    const name=String(e[field]||'Não informado').trim();
    const row=groups.get(name)||{name,count:0,value:0};
    row.count++;row.value+=e[valueKey]||0;groups.set(name,row);
  }
  return [...groups.values()].sort((a,b)=>b.value-a.value);
};
const rank = (rows,total,n=7) => '<div style="display:grid;gap:11px">'+rows.slice(0,n).map((r,i)=>'<div><div style="display:flex;justify-content:space-between;gap:8px"><span style="font-weight:600">'+(i+1)+'. '+clean(r.name)+'</span><strong>'+compact(r.value)+'</strong></div><div style="background:#e7eef6;height:9px;border-radius:8px;overflow:hidden;margin-top:5px"><div style="height:100%;background:#0f67aa;width:'+Math.min(100,Math.max(0,total?r.value/total*100:0))+'%"></div></div></div>').join('')+'</div>';
export async function connectHapcapex(email,password,rerender) {
  hapSyncMessage='Conectando com segurança ao HAPCAPEX...';
  let error;
  try { ({error}=await hapClient.auth.signInWithPassword({email,password})); }
  catch (cause) { error=cause; }
  if(error){
    const network=/failed to fetch|network|fetch failed|load failed/i.test(String(error.message||''));
    console.warn('[HAPCAPEX] Falha de conexão/autenticação (sem dados de credenciais):', {name:error.name,code:error.code,status:error.status,message:error.message});
    hapSyncMessage=network
      ? 'Falha de comunicação com o Supabase do HAPCAPEX — NÃO é confirmação de senha incorreta. Confira se o HAPCAPEX abre nesta mesma rede e se seu navegador permite a conexão; desative temporariamente bloqueadores/VPN corporativa apenas se autorizado pela TI. Se persistir, solicite à TI a verificação da conexão HTTPS/CORS com kuvwfyuhrnfsubkapeek.supabase.co.'
      : 'HAPCAPEX não autorizou o login: '+error.message;
    hapAuthenticated=false;
    rerender();return;
  }
  hapAuthenticated=true;
  hapSyncMessage='Autenticado. Consultando dados financeiros autorizados...';
  await refreshHapcapex(rerender);
}
export async function refreshHapcapex(rerender) {
  if(!hapAuthenticated){hapSyncMessage='Conecte-se ao HAPCAPEX antes da atualização.';rerender();return;}
  const {data,error}=await hapClient.rpc('obter_gerencial_controle_v4082',{p_exercicio:2026});
  if(error){hapSyncMessage='Consulta financeira não autorizada ou indisponível: '+error.message;rerender();return;}
  // A resposta gerencial é agregada e tem esquema próprio. Não inventar equivalência com linhas de relatório.
  const rows=Array.isArray(data?.itens)?data.itens:Array.isArray(data?.obras)?data.obras:Array.isArray(data?.ois)?data.ois:null;
  if(!rows){hapSyncMessage='HAPCAPEX autenticado, porém o retorno gerencial não possui linhas de OI no formato esperado. É necessário mapear a função de origem antes de habilitar os KPIs. Nenhum dado foi substituído.';rerender();return;}
  const mapped=rows.map(o=>{
    const monthly=o.realizado_mensal && typeof o.realizado_mensal==='object' ? Object.entries(o.realizado_mensal).filter(([month])=>month.startsWith('2026-')).reduce((total,[,amount])=>total+number(amount),0) : null;
    return {oiList:[key(o.oi)].filter(Boolean),nome:safeText(o.nome),pacote:safeText(o.pacote),head:safeText(o.head),initial:null,current:typeof o.atribuido==='number'?o.atribuido:null,committed:typeof o.compromissado==='number'?o.compromissado:null,realized:monthly,paid:null,balance:typeof o.saldo==='number'?o.saldo:null};
  }).filter(o=>o.oiList.length && o.current!==null && o.committed!==null && o.realized!==null);
  if(!mapped.length){hapSyncMessage='HAPCAPEX autenticado, porém a estrutura financeira retornada não corresponde ao esperado. Nenhum dado anterior foi substituído.';rerender();return;}
  const duplicates=new Set();
  for(const o of mapped){if(duplicates.has(o.oiList[0])){hapSyncMessage='O HAPCAPEX retornou OIs duplicadas. Sincronização interrompida para evitar dupla contagem.';rerender();return;}duplicates.add(o.oiList[0]);}
  financeEntries=mapped;
  const totals={initial:null,current:mapped.reduce((v,o)=>v+o.current,0),committed:mapped.reduce((v,o)=>v+o.committed,0),realized:mapped.reduce((v,o)=>v+o.realized,0),paid:null,balance:mapped.every(o=>o.balance!==null)?mapped.reduce((v,o)=>v+o.balance,0):null};
  metadata={totals,source:'HAPCAPEX online — função Gerencial',year:2026,validatedAt:new Date().toISOString()};
  hapSyncMessage=mapped.length+' OIs sincronizadas. CAPEX inicial e desembolsado não são fornecidos por esta função e permanecem indisponíveis; confira a cobertura.';
  rerender();
}

export function renderStrategicFinance(portfolio,toolbar) {
  const {rows,unmatched,totals}=financialReconciliation(portfolio);
  const linked=rows.filter(r=>r.entry);
  const filterTerm=financialSearch.toLocaleLowerCase('pt-BR');
  const visible=rows.filter(({work,status})=>(financialStatus==='all'||(financialStatus==='linked' ? status==='Conciliado' : status!=='Conciliado')) && (!filterTerm || [work.nome,work.codigo,work.sap,work.uf,work.tipologia,work.regional].some(x=>String(x||'').toLocaleLowerCase('pt-BR').includes(filterTerm))));
  const selected=rows.find(r=>String(r.work.id)===selectedFinanceWorkId);
  const financial=financeEntries;
  const reconciledCurrent=linked.reduce((v,r)=>v+r.entry.current,0);
  const reconciledRealized=linked.reduce((v,r)=>v+r.entry.realized,0);
  const withEV=linked.filter(r=>r.work.evInitial != null);
  const forecast=withEV.reduce((v,r)=>v+r.work.evInitial,0);
  const linkedRealized=withEV.reduce((v,r)=>v+r.entry.realized,0);
  const cardSet=[
    ['CAPEX inicial',totals?.initial,'Base original de 2026','#1976b7'],
    ['CAPEX atual',totals?.current,'Orçamento vigente','#0c5893'],
    ['Compromissado',totals?.committed,percent(totals?.committed,totals?.current)+' do CAPEX atual','#9b6d19'],
    ['Realizado',totals?.realized,percent(totals?.realized,totals?.current)+' do CAPEX atual','#17805f'],
    ['Desembolsado',totals?.paid,totals?.paid == null ? 'Não fornecido na consulta gerencial' : percent(totals.paid,totals?.realized)+' do realizado','#318a87'],
    ['Saldo livre',totals?.balance,percent(totals?.balance,totals?.current)+' disponível','#364fac']
  ].map(([label,value,detail,color])=>financeCard(label,value,detail,color)).join('');
  const quality=[
    ['Registros financeiros',financial.length],
    ['Obras SLT no recorte',rows.length],
    ['Vínculos exatos',linked.length],
    ['Registros não vinculados',unmatched.length],
    ['Cobertura CAPEX',percent(reconciledCurrent,totals?.current)],
    ['Cobertura realizado',percent(reconciledRealized,totals?.realized)]
  ].map(([label,value])=>'<div style="padding:12px;background:#f1f6fb;border-radius:10px"><strong style="font-size:21px;color:#073b6d">'+value+'</strong><div style="font-size:12px">'+label+'</div></div>').join('');
  const items=[
    ['CAPEX inicial',totals?.initial],
    ['CAPEX atual',totals?.current],
    ['Compromissado',totals?.committed],
    ['Realizado',totals?.realized],
    ['Desembolsado',totals?.paid]
  ];
  const max=Math.max(1,...items.map(x=>x[1]||0));
  const financeBars='<div style="display:grid;gap:14px">'+items.map(([name,v])=>'<div><div style="display:flex;justify-content:space-between"><strong>'+name+'</strong><span>'+formatMoney(v)+'</span></div><div style="background:#e6edf5;border-radius:8px;height:17px;overflow:hidden"><div style="height:100%;width:'+((v||0)/max*100)+'%;background:#135b9b"></div></div></div>').join('')+'</div>';
  const byPackage=shareRows(financial,'pacote'),byHead=shareRows(financial,'head'),topWorks=[...financial].sort((a,b)=>b.realized-a.realized).map(e=>({name:e.nome,value:e.realized}));
  const financeGroups=[...new Set(financial.map(x=>x.pacote||'Não informado'))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const financeHeads=[...new Set(financial.map(x=>x.head||'Não informado'))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const visibleOI=financial.filter(e=>(!oiGroup || (e.pacote||'Não informado')===oiGroup) && (!oiHead || (e.head||'Não informado')===oiHead) && (!oiQuery || [e.nome,e.oiList.join(','),e.pacote,e.head].some(v=>String(v||'').toLocaleLowerCase('pt-BR').includes(oiQuery.toLocaleLowerCase('pt-BR'))))).sort((a,b)=>(b.realized??0)-(a.realized??0));
  const oiDetails=financial.find(x=>x.oiList.includes(selectedOI));
  const section=(title,body)=>'<section class="panel" style="padding:22px;min-width:0"><h3 style="color:#083e75;margin-top:0">'+title+'</h3>'+body+'</section>';
  const individualFinance=section('Investigar investimentos · todas as OIs do HAPCAPEX',
    '<p>Explore diretamente os '+financial.length+' registros financeiros, inclusive os '+unmatched.length+' sem vínculo cadastral com os EVs. Clique em uma OI para abrir sua ficha financeira.</p>'+
    '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:end"><label style="display:grid;gap:5px">Pesquisar nome, OI, pacote ou HEAD<input id="hapOiSearch" value="'+clean(oiQuery)+'" placeholder="Ex.: 50157002 ou nome da obra" style="min-width:280px;padding:10px"></label>'+
    '<label style="display:grid;gap:5px">Pacote<select id="hapOiPackage" style="min-width:220px;padding:10px"><option value="">Todos os pacotes</option>'+financeGroups.map(n=>'<option value="'+clean(n)+'"'+(oiGroup===n?' selected':'')+'>'+clean(n)+'</option>').join('')+'</select></label><label style="display:grid;gap:5px">HEAD<select id="hapOiHead" style="min-width:220px;padding:10px"><option value="">Todos os HEADs</option>'+financeHeads.map(n=>'<option value="'+clean(n)+'"'+(oiHead===n?' selected':'')+'>'+clean(n)+'</option>').join('')+'</select></label><button type="button" id="hapClearFinancialFilters" class="secondary-action">Limpar filtros</button><strong>'+visibleOI.length+' OIs encontradas</strong></div>'+
    '<div style="overflow:auto;max-height:580px;margin-top:16px"><table class="data-table"><thead><tr><th>OI · abrir ficha</th><th>Obra</th><th>Pacote</th><th>HEAD</th><th>CAPEX vigente</th><th>Compromissado</th><th>Realizado 2026</th><th>Saldo</th></tr></thead><tbody>'+
    visibleOI.slice(0,250).map(e=>'<tr><td><button type="button" class="secondary-action" data-hap-oi="'+clean(e.oiList[0])+'">'+clean(e.oiList.join(' / '))+'</button></td><td>'+clean(e.nome)+'</td><td>'+clean(e.pacote)+'</td><td>'+clean(e.head)+'</td><td>'+formatMoney(e.current)+'</td><td>'+formatMoney(e.committed)+'</td><td>'+formatMoney(e.realized)+'</td><td>'+formatMoney(e.balance)+'</td></tr>').join('')+'</tbody></table></div>'+
    (visibleOI.length>250?'<p>Exibindo as primeiras 250 OIs do filtro. Refine sua pesquisa para consultar as demais.</p>':'')
  );
  const oiFicha=oiDetails?section('Ficha financeira HAPCAPEX · OI '+clean(selectedOI),
    '<h4>'+clean(oiDetails.nome)+'</h4><p>Fonte: HAPCAPEX online, exercício 2026. A ficha financeira não presume vínculo com EV/SIC sem OI/SAP validada.</p>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px">'+[
      ['OI',oiDetails.oiList.join(' / ')],['Pacote',oiDetails.pacote],['HEAD',oiDetails.head],['CAPEX vigente',formatMoney(oiDetails.current)],['Compromissado',formatMoney(oiDetails.committed)],['Realizado 2026',formatMoney(oiDetails.realized)],['Saldo livre',formatMoney(oiDetails.balance)],['Comprometimento',percent(oiDetails.committed,oiDetails.current)],['Execução 2026',percent(oiDetails.realized,oiDetails.current)]
    ].map(([k,v])=>'<div style="background:#edf4fa;border-radius:9px;padding:15px"><small>'+clean(k)+'</small><div style="font-weight:800;margin-top:6px">'+clean(v)+'</div></div>').join('')+'</div>'+
    '<p style="margin-top:15px">Os valores de realizado representam o exercício financeiro, não necessariamente o custo final da obra. CAPEX inicial e desembolsos não estão disponíveis nesta consulta.</p><button type="button" class="secondary-action" data-hap-oi-close>Fechar ficha</button>'):'';
  const table=visible.map(({work,entry,status})=>'<tr><td><button type="button" class="secondary-action" data-capex-work="'+clean(work.id)+'" style="text-align:left;font-weight:700">'+clean(work.nome)+'</button></td><td>'+clean(work.sap)+'</td><td>'+clean(work.uf)+'</td><td>'+clean(work.tipologia)+'</td><td>'+formatMoney(work.evInitial)+'</td><td>'+formatMoney(entry?.current)+'</td><td>'+formatMoney(entry?.realized)+'</td><td>'+formatMoney(entry?.paid)+'</td><td>'+clean(status)+'</td></tr>').join('');
  const workPanel=selected ? section('Ficha integrada do empreendimento · '+clean(selected.work.nome),'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">'+
    [['Código',selected.work.codigo],['OI/SAP',selected.work.sap],['Região',selected.work.regional],['UF',selected.work.uf],['Tipologia',selected.work.tipologia],['Situação',selected.work.status],['EV inicial',formatMoney(selected.work.evInitial)],['SICs / aditivos',formatMoney(selected.work.evAdditives)],['EV atualizado',formatMoney(selected.work.evUpdated)],['CAPEX atual 2026',formatMoney(selected.entry?.current)],['Compromissado 2026',formatMoney(selected.entry?.committed)],['Realizado 2026',formatMoney(selected.entry?.realized)],['Desembolsado 2026',formatMoney(selected.entry?.paid)],['Saldo livre 2026',formatMoney(selected.entry?.balance)],['Conciliação',selected.status]].map(([name,value])=>'<div style="padding:12px;background:#f2f6fb;border-radius:9px"><small>'+clean(name)+'</small><p style="font-weight:700;margin:4px 0">'+clean(value??'Não informado')+'</p></div>').join('')+
    '</div><p style="margin-top:15px">Os valores financeiros pertencem ao exercício 2026. Ausência de vínculo exato não é interpretada como valor zero. EV total e realizado anual não são automaticamente comparáveis.</p><button class="secondary-action" type="button" data-capex-close>Fechar ficha</button>') : '';
  const exploration=section('Explorar carteira · obra a obra','<div style="display:flex;flex-wrap:wrap;align-items:end;gap:12px"><label style="display:grid;gap:4px">Localizar obra, código, OI, UF ou tipologia<input id="capexWorkSearch" value="'+clean(financialSearch)+'" placeholder="Pesquisar empreendimento..." style="min-width:270px;padding:9px"></label><label style="display:grid;gap:4px">Situação da conciliação<select id="capexWorkStatus" style="padding:9px"><option value="all"'+(financialStatus==='all'?' selected':'')+'>Todas</option><option value="linked"'+(financialStatus==='linked'?' selected':'')+'>Conciliadas</option><option value="pending"'+(financialStatus==='pending'?' selected':'')+'>Pendentes / conflito</option></select></label><span>'+visible.length+' obras no filtro</span></div><p>Selecione uma obra na tabela para consultar seu EV, dados cadastrais e financeiro conciliado.</p>');
  return toolbar+ '<div style="display:grid;gap:20px">'+
    '<section class="panel" style="padding:24px;background:linear-gradient(115deg,#073b6b,#0c65a3);color:white;border-radius:14px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:18px"><div><div style="font-size:12px;letter-spacing:2px;font-weight:700">SLT 360° · INTELIGÊNCIA DE INVESTIMENTOS</div><h2 style="font-size:29px;margin:10px 0;color:white">Panorama Estratégico-Financeiro | CAPEX 2026</h2><p style="color:#e1f0ff;max-width:760px;margin:0">Da estimativa técnica à execução financeira. Dados oficiais de 2026; vínculos auditáveis com EVs e portfólio para fundamentar CAPEX futuros.</p></div><div style="align-self:center;padding:12px 20px;border:1px solid #82b8e0;border-radius:12px">EXERCÍCIO <strong>2026</strong></div></div></section>'+
    '<section class="panel" style="padding:17px"><h3>Conexão direta com HAPCAPEX</h3><p>Autenticação no projeto oficial. Senha mantida somente durante a operação de login, sem armazenamento local pelo SLT 360°.</p><form id="hapcapexConnect" style="display:flex;flex-wrap:wrap;gap:10px;align-items:end"><label>E-mail<input required type="email" name="email" autocomplete="username"></label><label>Senha<input required type="password" name="password" autocomplete="current-password"></label><button type="submit">Conectar ao HAPCAPEX</button><button type="button" id="hapcapexRefresh" '+(!hapAuthenticated?'disabled':'')+'>Sincronizar</button></form><p role="status">'+clean(hapSyncMessage)+'</p><hr><div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px"><label for="capex2026Input" style="font-weight:700">Atualizar relatório HAPCAPEX 2026</label><input id="capex2026Input" type="file" accept=".xlsx,.xls" aria-label="Importar relatório HAPCAPEX 2026"><span style="color:#546779">'+(metadata?'Relatório validado nesta sessão; dados não persistidos':'Aguardando importação de fonte financeira')+'</span></div><div id="capex2026Message" role="status"></div></section>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px">'+cardSet+'</div>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px">'+quality+'</div>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px">'+
       section('Execução do orçamento de 2026',financeBars)+
       section('Concentração por pacote',financial.length?rank(byPackage,totals?.current):'<p>Importe o relatório financeiro.</p>')+
       section('Investimentos por HEAD',financial.length?rank(byHead,totals?.current):'<p>Importe o relatório financeiro.</p>')+
       section('Obras com maior realizado',financial.length?rank(topWorks,totals?.realized):'<p>Importe o relatório financeiro.</p>')+
    '</div>'+
    section('Rastreabilidade e qualidade da integração','<p>O HAPCAPEX permanece como fonte oficial financeira. Os totais acima incluem todos os seus registros, mesmo os ainda não vinculados ao Portfólio. Conciliações pendentes não são atribuídas artificialmente a obras.</p><p><strong>CAPEX conciliado:</strong> '+formatMoney(reconciledCurrent)+' · <strong>Realizado conciliado:</strong> '+formatMoney(reconciledRealized)+' · <strong>Registros financeiros pendentes:</strong> '+unmatched.length+'</p>')+
    section('Inteligência para CAPEX futuros — EV × execução','<p><strong>EV inicial das obras conciliadas:</strong> '+formatMoney(withEV.length?forecast:null)+' · <strong>Realizado 2026 dessas obras:</strong> '+formatMoney(withEV.length?linkedRealized:null)+'</p><p>Esses valores são referências de acompanhamento, não um indicador definitivo de acurácia. Para comparar EV total e custo final, exigem-se conclusão financeira, escopo equivalente e custo acumulado validado.</p>')+
    individualFinance+oiFicha+exploration+workPanel+
    '<details open class="panel" style="padding:20px"><summary style="font-weight:800;color:#063c71;cursor:pointer">Obras e conciliação · '+visible.length+' obras do portfólio e '+unmatched.length+' lançamentos sem vínculo</summary><div style="overflow:auto;margin-top:16px"><table class="data-table"><thead><tr><th>Obra</th><th>OI/SAP</th><th>UF</th><th>Tipologia</th><th>EV inicial</th><th>CAPEX atual</th><th>Realizado 2026</th><th>Desembolsado</th><th>Vínculo</th></tr></thead><tbody>'+table+'</tbody></table></div></details>'+
  '</div>';
}
export function bindCapex2026Import(rerender) {
  document.getElementById('hapcapexConnect')?.addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;const email=form.elements.namedItem('email').value;const password=form.elements.namedItem('password').value;form.elements.namedItem('password').value='';await connectHapcapex(email,password,rerender);});
  document.getElementById('hapcapexRefresh')?.addEventListener('click',()=>void refreshHapcapex(rerender));
  const input=document.getElementById('capex2026Input');
  document.getElementById('hapOiSearch')?.addEventListener('input',event=>{oiQuery=event.target.value;});
  document.getElementById('hapOiSearch')?.addEventListener('change',event=>{oiQuery=event.target.value;rerender();});
  document.getElementById('hapOiPackage')?.addEventListener('change',event=>{oiGroup=event.target.value;rerender();});
  document.getElementById('hapOiHead')?.addEventListener('change',event=>{oiHead=event.target.value;rerender();});
  document.getElementById('hapClearFinancialFilters')?.addEventListener('click',()=>{oiGroup='';oiHead='';oiQuery='';rerender();});
  document.querySelectorAll('[data-hap-oi]').forEach(button=>button.addEventListener('click',()=>{selectedOI=button.dataset.hapOi;rerender();document.querySelector('[data-hap-oi-close]')?.scrollIntoView({block:'center'});}));
  document.querySelector('[data-hap-oi-close]')?.addEventListener('click',()=>{selectedOI='';rerender();});
  document.getElementById('capexWorkSearch')?.addEventListener('change',event=>{financialSearch=event.target.value;rerender();});
  document.getElementById('capexWorkStatus')?.addEventListener('change',event=>{financialStatus=event.target.value;rerender();});
  document.querySelectorAll('[data-capex-work]').forEach(button=>button.addEventListener('click',()=>{selectedFinanceWorkId=button.dataset.capexWork;rerender();document.querySelector('[data-capex-close]')?.scrollIntoView({block:'center'});}));
  document.querySelector('[data-capex-close]')?.addEventListener('click',()=>{selectedFinanceWorkId='';rerender();});
  if(!input)return;
  input.addEventListener('change',async event=>{
    const file=event.target.files?.[0];
    if(!file)return;
    try{
      const report=parseCapexWorkbook(await file.arrayBuffer());
      financeEntries=report.entries;metadata=report;
      rerender();
    }catch(error){
      const target=document.getElementById('capex2026Message');
      if(target)target.textContent='Importação rejeitada: '+error.message;
    }
  },{once:true});
}
