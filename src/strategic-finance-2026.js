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
  for(const work of portfolio.filter(w=>String(w.year)===String(EXERCISE))){
    const oiList=[...new Set(String(work.sap??'').split(/[,;\/\s]+/).map(key).filter(Boolean))];
    const hits=[...new Set(oiList.flatMap(oi=>byOI.get(oi)||[]))];
    const ambiguous=hits.length>1 || hits.some(e=>e.oiList.some(oi=>(byOI.get(oi)||[]).length>1)) || hits.some(e=>assigned.has(e));
    if(!ambiguous && hits.length===1)assigned.add(hits[0]);
    result.push({work,entry:!ambiguous&&hits.length===1?hits[0]:null,status:ambiguous?'Conflito de vínculo':hits.length===0?'Sem conciliação':'Conciliado'});
  }
  return {rows:result,unmatched:entries.filter(e=>!assigned.has(e)),totals:metadata?.totals||null};
}

export function renderStrategicFinance(portfolio,toolbar) {
  const {rows,unmatched,totals}=financialReconciliation(portfolio);
  const linked=rows.filter(r=>r.entry);
  const withEV=linked.filter(r=>r.work.evInitial !== null && r.work.evInitial !== undefined);
  const sums=withEV.reduce((a,r)=>({ev:a.ev+r.work.evInitial,realized:a.realized+r.entry.realized,revised:a.revised+r.work.evUpdated}),{ev:0,realized:0,revised:0});
  const filters=metadata?'<strong>Relatório de 2026 validado em memória (não publicado nem persistido).</strong>':'<strong>Sem base oficial importada: indicadores financeiros indisponíveis.</strong>';
  const card=(name,value)=>'<div class="panel" style="padding:14px;min-width:150px;flex:1"><small>'+name+'</small><h3>'+formatMoney(value)+'</h3></div>';
  const cards=[['CAPEX inicial',totals?.initial],['CAPEX atual',totals?.current],['Compromissado',totals?.committed],['Realizado',totals?.realized],['Desembolsado',totals?.paid],['Saldo livre',totals?.balance],['EV inicial vinculado',withEV.length?sums.ev:null],['Realizado vinculado ao EV',withEV.length?sums.realized:null],['Desvio definitivo (elegíveis)',null]].map(([n,v])=>card(n,v)).join('');
  const completed = work => /conclu[ií]d|finalizad|entregue|encerrad/i.test(String(work.status || ''));
  // Elegibilidade definitiva requer validação externa do custo final acumulado e da equivalência de escopo.
  // O relatório anual de 2026, isoladamente, nunca demonstra essas condições.
  const accuracy = [];
  const accuracyM = null;
  const byType = new Map();
  for(const r of accuracy){
    const typology=String(r.work.tipologia||'Não classificada');
    const group=byType.get(typology)||{typology,count:0,ev:0,realized:0};
    group.count++;group.ev+=r.work.evInitial;group.realized+=r.entry.realized;
    byType.set(typology,group);
  }
  const typeRows=[...byType.values()].sort((a,b)=>b.count-a.count).map(g=>'<tr><td>'+clean(g.typology)+'</td><td>'+g.count+'</td><td>'+formatMoney(g.ev)+'</td><td>'+formatMoney(g.realized)+'</td><td>'+((g.realized/g.ev-1)*100).toFixed(1)+'%</td></tr>').join('');
  const body=rows.map(({work,entry,status})=>{
    const forecast=work.evInitial;
    // Não comparar EV total plurianual ao realizado anual de 2026 sem confirmação de equivalência.
    const comparable = work.scopePeriodValidated === true && work.finalCostValidated === true && completed(work);
    const deviation=comparable && entry && forecast !== null && forecast !== undefined ? entry.realized-forecast : null;
    const deviationPct=deviation!==null && forecast>0 ? (deviation/forecast*100).toFixed(1)+'%' : '—';
    const phase=completed(work)?'Concluída':'Em execução / outra situação';
    return '<tr><td>'+clean(work.nome)+'</td><td>'+clean(work.sap)+'</td><td>'+clean(work.uf)+'</td><td>'+clean(work.tipologia)+'</td><td>'+clean(phase)+'</td><td>'+formatMoney(forecast)+'</td><td>'+formatMoney(work.evAdditives)+'</td><td>'+formatMoney(work.evUpdated)+'</td><td>'+formatMoney(entry?.realized)+'</td><td>'+formatMoney(deviation)+'</td><td>'+deviationPct+'</td><td>'+formatMoney(entry?.current)+'</td><td>'+formatMoney(entry?.committed)+'</td><td>'+formatMoney(entry?.paid)+'</td><td>'+formatMoney(entry?.balance)+'</td><td>'+clean(status)+'</td></tr>';
  }).join('');
  return toolbar+'<section class="panel" style="padding:20px"><h2>CAPEX 2026 · Visão Estratégico-Financeira</h2><p>Exercício fixo de 2026. O EV inicial representa a previsão de investimento. Compare-o ao realizado financeiro de 2026; desvios definitivos somente serão exibidos mediante validação do custo final acumulado e equivalência de escopo/período. O EV atualizado considera os aditivos e não substitui o CAPEX autorizado. Vínculo apenas por OI/SAP exata.</p><p>'+filters+'</p><label for="capex2026Input">Importar relatório oficial HAPCAPEX (.xlsx) para validação local</label><input id="capex2026Input" type="file" accept=".xlsx,.xls" aria-label="Importar relatório HAPCAPEX 2026"><p id="capex2026Message" role="status"></p><div style="display:flex;flex-wrap:wrap;gap:12px">'+cards+'</div><p>'+linked.length+' obras vinculadas · '+rows.length+' obras 2026 · '+unmatched.length+' registros financeiros sem vínculo; valores não conciliados não são distribuídos por obra.</p><h3>Acurácia definitiva — aguardando validação técnica</h3><p>'+accuracy.length+' obras concluídas com vínculo e EV inicial positivo · erro percentual absoluto médio: '+(accuracyM===null?'indisponível':accuracyM.toFixed(1)+'%')+'. A conclusão cadastral, isoladamente, não comprova custo final acumulado, escopo comparável ou encerramento financeiro. Não é calculada acurácia definitiva com o realizado anual de 2026.</p><div style="overflow:auto"><table class="data-table"><thead><tr><th>Tipologia</th><th>Obras</th><th>EV inicial</th><th>Realizado</th><th>Desvio ponderado</th></tr></thead><tbody>'+typeRows+'</tbody></table></div><h3>Conciliação por obra</h3><div style="overflow:auto"><table class="data-table"><thead><tr><th>Obra</th><th>OI/SAP</th><th>UF</th><th>Tipologia</th><th>Situação</th><th>EV inicial (previsão)</th><th>SICs/aditivos</th><th>EV atualizado</th><th>Realizado 2026</th><th>Desvio realizado − EV inicial</th><th>Desvio %</th><th>CAPEX atual</th><th>Compromissado</th><th>Desembolsado</th><th>Saldo livre</th><th>Conciliação</th></tr></thead><tbody>'+body+'</tbody></table></div></section>';
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
