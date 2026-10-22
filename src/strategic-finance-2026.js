import * as XLSX from 'xlsx';

const EXERCISE = 2026;
let financeEntries = [];
let metadata = null;
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
  // Inclui obras iniciadas em anos anteriores que possuem movimento no exercício 2026.
  // Ano de cadastro do empreendimento não é o exercício do registro financeiro.
  for(const work of portfolio.filter(w=>String(w.year)===String(EXERCISE) || String(w.sap??'').split(/[,;\/\s]+/).map(key).some(oi=>byOI.has(oi)))){
    const oiList=[...new Set(String(work.sap??'').split(/[,;\/\s]+/).map(key).filter(Boolean))];
    const hits=[...new Set(oiList.flatMap(oi=>byOI.get(oi)||[]))];
    const ambiguous=hits.length>1 || hits.some(e=>e.oiList.some(oi=>(byOI.get(oi)||[]).length>1)) || hits.some(e=>assigned.has(e));
    if(!ambiguous && hits.length===1)assigned.add(hits[0]);
    result.push({work,entry:!ambiguous&&hits.length===1?hits[0]:null,status:ambiguous?'Conflito de vínculo':hits.length===0?'Sem conciliação':'Conciliado'});
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
export function renderStrategicFinance(portfolio,toolbar) {
  const {rows,unmatched,totals}=financialReconciliation(portfolio);
  const linked=rows.filter(r=>r.entry);
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
    ['Desembolsado',totals?.paid,percent(totals?.paid,totals?.realized)+' do realizado','#318a87'],
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
  const section=(title,body)=>'<section class="panel" style="padding:22px;min-width:0"><h3 style="color:#083e75;margin-top:0">'+title+'</h3>'+body+'</section>';
  const table=rows.map(({work,entry,status})=>'<tr><td>'+clean(work.nome)+'</td><td>'+clean(work.sap)+'</td><td>'+clean(work.uf)+'</td><td>'+clean(work.tipologia)+'</td><td>'+formatMoney(work.evInitial)+'</td><td>'+formatMoney(entry?.current)+'</td><td>'+formatMoney(entry?.realized)+'</td><td>'+formatMoney(entry?.paid)+'</td><td>'+clean(status)+'</td></tr>').join('');
  return toolbar+ '<div style="display:grid;gap:20px">'+
    '<section class="panel" style="padding:24px;background:linear-gradient(115deg,#073b6b,#0c65a3);color:white;border-radius:14px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:18px"><div><div style="font-size:12px;letter-spacing:2px;font-weight:700">SLT 360° · INTELIGÊNCIA DE INVESTIMENTOS</div><h2 style="font-size:29px;margin:10px 0;color:white">Panorama Estratégico-Financeiro | CAPEX 2026</h2><p style="color:#e1f0ff;max-width:760px;margin:0">Da estimativa técnica à execução financeira. Dados oficiais de 2026; vínculos auditáveis com EVs e portfólio para fundamentar CAPEX futuros.</p></div><div style="align-self:center;padding:12px 20px;border:1px solid #82b8e0;border-radius:12px">EXERCÍCIO <strong>2026</strong></div></div></section>'+
    '<section class="panel" style="padding:17px"><div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px"><label for="capex2026Input" style="font-weight:700">Atualizar relatório HAPCAPEX 2026</label><input id="capex2026Input" type="file" accept=".xlsx,.xls" aria-label="Importar relatório HAPCAPEX 2026"><span style="color:#546779">'+(metadata?'Relatório validado nesta sessão; dados não persistidos':'Aguardando importação de fonte financeira')+'</span></div><div id="capex2026Message" role="status"></div></section>'+
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
    '<details class="panel" style="padding:20px"><summary style="font-weight:800;color:#063c71;cursor:pointer">Auditoria técnica · '+rows.length+' obras do portfólio e '+unmatched.length+' lançamentos sem vínculo</summary><div style="overflow:auto;margin-top:16px"><table class="data-table"><thead><tr><th>Obra</th><th>OI/SAP</th><th>UF</th><th>Tipologia</th><th>EV inicial</th><th>CAPEX atual</th><th>Realizado 2026</th><th>Desembolsado</th><th>Vínculo</th></tr></thead><tbody>'+table+'</tbody></table></div></details>'+
  '</div>';
}
export function bindCapex2026Import(rerender) {
  const input=document.getElementById('capex2026Input');
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
