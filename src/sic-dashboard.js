import { csvCell } from './csv.js';
import * as XLSX from 'xlsx';
import { arithmetic } from './arithmetic.js';
// Native SIC approval component. Operational records come exclusively from Supabase.
import styles from './sic-dashboard.css';
import template from './sic-dashboard.html';
export function mountSicDashboard(host,cloud){
 if(host.shadowRoot) return;
 const root=host.attachShadow({mode:'open'});
 const css=document.createElement('style');css.textContent=styles;root.append(css);
 const content=document.createElement('div');content.innerHTML=cloud.cleanHTML(template);root.append(content);
 root.addEventListener('click',event=>{if(!cloud.canWrite() && event.target.closest('button,input,textarea,select')?.matches('[data-sicstatus],[data-sapsave],[data-save-sic],[data-sapedit],[data-editsic],#btnConfirmImport,#btnConfirmAddCurrent')) {event.preventDefault();event.stopImmediatePropagation();}},true);

/* =========================================================
   SEED DATA — Semana 1 (17/08 a 21/08/2026)
   ========================================================= */




/* =========================================================
   HELPERS DE FORMATAÇÃO
   ========================================================= */
function fmtBRL(v){
  if(v===null||v===undefined||isNaN(v)) return '—';
  return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}
function fmtNum(v,dec){
  if(v===null||v===undefined||isNaN(v)) return '—';
  return v.toLocaleString('pt-BR',{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0});
}
function fmtPct(v,dec=1){
  if(v===null||v===undefined||isNaN(v)) return '—';
  return v.toLocaleString('pt-BR',{minimumFractionDigits:dec,maximumFractionDigits:dec})+'%';
}
function pctAditivos(ev){
  if(!ev || !ev.semAditivos || ev.semAditivos<=0) return null;
  return ((ev.aditivosAprovados||0)/ev.semAditivos)*100;
}
function fmtDate(d){
  if(!d) return '';
  const parts=d.split('-');
  if(parts.length!==3) return d;
  return `${parts[2]}/${parts[1]}`;
}
function esc(s){
  if(s===null||s===undefined) return '';
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function slugify(s){
  return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-zA-Z0-9]+/g,'-').replace(/(^-|-$)/g,'').toLowerCase();
}

/* =========================================================
   ARMAZENAMENTO PERSISTENTE
   - Prioriza window.storage quando existir (compatibilidade com Claude)
   - Mantém cópia em localStorage para funcionamento em navegador comum
   ========================================================= */






function ensureDataSchema(obras, weeks, snapshots){
  (obras||[]).forEach(o=>{
    o.sics = Array.isArray(o.sics) ? o.sics : [];
    o.oiList = Array.isArray(o.oiList) ? o.oiList.map(String) : [];
    o.oiAliases = Array.isArray(o.oiAliases) ? o.oiAliases : [...o.oiList];
    o.oiList.forEach(oi=>{ if(oi && !o.oiAliases.includes(oi)) o.oiAliases.push(oi); });
    o.descricaoAliases = Array.isArray(o.descricaoAliases) ? o.descricaoAliases : [];
    if(o.descricao && !o.descricaoAliases.includes(o.descricao)) o.descricaoAliases.push(o.descricao);
    o.historyEvents = Array.isArray(o.historyEvents) ? o.historyEvents : [];
    // Para movimentações de uma mesma SIC/Revisão, mantém somente a ação mais recente.
    // Eventos de SAP/importação continuam com histórico completo.
    const latestSicEvent = new Map();
    const otherEvents = [];
    o.historyEvents.forEach(evt=>{
      const isSicEvent = evt && evt.sicId && String(evt.type||'').startsWith('sic_');
      if(!isSicEvent){ otherEvents.push(evt); return; }
      const prev = latestSicEvent.get(evt.sicId);
      if(!prev || String(evt.at||'') >= String(prev.at||'')) latestSicEvent.set(evt.sicId, evt);
    });
    o.historyEvents = otherEvents.concat(Array.from(latestSicEvent.values()));
    o.sics.forEach(s=>{
      if(typeof s.appliedToEV !== 'boolean') s.appliedToEV = false;
      if(!('evAppliedAmount' in s)) s.evAppliedAmount = 0;
      if(!('appliedAt' in s)) s.appliedAt = null;
    });
  });
  (weeks||[]).forEach(w=>{ if(!('fingerprint' in w)) w.fingerprint = null; });
  return {obras:obras||[], weeks:weeks||[], snapshots:snapshots||[]};
}

async function loadStore(){ const data = cloud.load(); return ensureDataSchema(data.obras, data.weeks, data.snapshots); }

async function persistAll(obras,weeks,snapshots){
  if(!cloud.canWrite()) { showToast('Seu acesso permite apenas consulta.','err'); return false; }
  try { await cloud.save({obras,weeks,snapshots}); return true; }
  catch { showToast('Não salvo no banco. Recarregue antes de continuar.','err'); return false; }
 }

/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */
const state = {
  obras: [], weeks: [], snapshots: [],
  selectedWeekId: 'all', search: '', classFilter: new Set(), onlyPending: false,
  openPanelObraId: null, expandedDesc: new Set(), sapEditObraId: null, sicEditId: null,
};

/* =========================================================
   REGRAS DE NEGÓCIO / VALIDAÇÃO DE ENGENHARIA DE CUSTOS
   - EV TOTAL    = EV S/ADITIVOS + ADITIVOS/REVISÕES
   - SALDO ATUAL = ATRIBUÍDO ATUAL − COMPROMISSADO ATUAL
   - DIFF EV     = (ATRIBUÍDO ATUAL + FATURAS ANOS ANTERIORES) − EV TOTAL
   ========================================================= */
function round2(v){ return Math.round((v+Number.EPSILON)*100)/100; }
function recalcEV(ev){
  if(!ev) return ev;
  ev.semAditivos = round2(Number(ev.semAditivos)||0);
  ev.aditivosAprovados = round2(Number(ev.aditivosAprovados)||0);
  ev.total = round2(ev.semAditivos + ev.aditivosAprovados);
  ev.areaM2 = Number(ev.areaM2)||0;
  ev.valorM2 = ev.areaM2>0 ? ev.total/ev.areaM2 : 0;
  return ev;
}
function recalcSAP(sap, ev){
  if(!sap) return sap;
  sap.faturasAnosAnteriores = round2(Number(sap.faturasAnosAnteriores)||0);
  sap.atribuidoAtual = round2(Number(sap.atribuidoAtual)||0);
  sap.comprometidoAtual = round2(Number(sap.comprometidoAtual)||0);
  sap.saldoAtual = round2(sap.atribuidoAtual - sap.comprometidoAtual);
  sap.diffEV = round2(sap.atribuidoAtual + sap.faturasAnosAnteriores - ((ev&&ev.total)||0));
  return sap;
}
function addHistoryEvent(o, type, text, meta={}){
  o.historyEvents = Array.isArray(o.historyEvents) ? o.historyEvents : [];
  // Uma SIC/Revisão deve possuir apenas uma movimentação no histórico:
  // qualquer nova ação sobre a mesma SIC substitui a ação anterior daquela SIC.
  if(meta.sicId && String(type||'').startsWith('sic_')){
    o.historyEvents = o.historyEvents.filter(evt => !(evt && evt.sicId===meta.sicId && String(evt.type||'').startsWith('sic_')));
  }
  o.historyEvents.push({id:'evt-'+Date.now()+'-'+Math.random().toString(36).slice(2,7), type, text, at:new Date().toISOString(), ...meta});
}
function fmtDateTimeBR(iso){
  if(!iso) return '';
  try{return new Date(iso).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch(e){return iso;}
}
function parseMoneyInput(v){
  if(typeof v==='number') return v;
  let s=String(v||'').trim().replace(/R\$/g,'').replace(/\s/g,'');
  if(!s) return null;
  if(s.includes(',')) s=s.replace(/\./g,'').replace(',','.');
  const n=Number(s); return Number.isFinite(n)?n:null;
}

function applyApprovedDelta(obra, sicWeekId, delta){
  delta=round2(Number(delta)||0);
  if(!obra || Math.abs(delta)<0.001) return;
  obra.ev=obra.ev||{semAditivos:0,aditivosAprovados:0,total:0,areaM2:0,valorM2:0};
  obra.ev.aditivosAprovados=round2((obra.ev.aditivosAprovados||0)+delta);
  recalcEV(obra.ev); recalcSAP(obra.sap,obra.ev);

  const sourceWeek=state.weeks.find(w=>w.id===sicWeekId);
  const sourceStart=sourceWeek ? sourceWeek.start : null;
  state.snapshots.forEach(snap=>{
    if(!snap || snap.obraId!==obra.id) return;
    const w=state.weeks.find(x=>x.id===snap.weekId);
    if(sourceStart && w && w.start < sourceStart) return;
    if(!sourceStart && snap.weekId!==sicWeekId) return;
    if(!snap.ev){
      snap.ev=JSON.parse(JSON.stringify(obra.ev));
    }else{
      snap.ev.aditivosAprovados=round2((snap.ev.aditivosAprovados||0)+delta);
      recalcEV(snap.ev);
    }
    recalcSAP(snap.sap,snap.ev);
    snap.updatedAt=new Date().toISOString();
  });
}

function validateObra(o){
  const flags=[];
  const evCalc = round2((o.ev.semAditivos||0)+(o.ev.aditivosAprovados||0));
  if(Math.abs(evCalc-(o.ev.total||0))>2){
    flags.push(`EV total (${fmtBRL(o.ev.total)}) diverge do esperado pela fórmula EV s/aditivos + aditivos aprovados (${fmtBRL(evCalc)}).`);
  }
  if(o.hasOI && o.sap){
    const saldoCalc = round2((o.sap.atribuidoAtual||0)-(o.sap.comprometidoAtual||0));
    if(Math.abs(saldoCalc-(o.sap.saldoAtual||0))>2){
      flags.push(`Saldo atual (${fmtBRL(o.sap.saldoAtual)}) diverge do esperado (atribuído − comprometido = ${fmtBRL(saldoCalc)}).`);
    }
    const diffCalc = round2((o.sap.atribuidoAtual||0)+(o.sap.faturasAnosAnteriores||0)-(o.ev.total||0));
    if(Math.abs(diffCalc-(o.sap.diffEV||0))>2){
      flags.push(`Diff EV (${fmtBRL(o.sap.diffEV)}) diverge do esperado ((atribuído + faturas) − EV total = ${fmtBRL(diffCalc)}).`);
    }
  }
  return flags;
}
function isSaldoCritico(o){
  if(!o.hasOI || !o.sap) return false;
  const saldo=o.sap.saldoAtual||0, atrib=o.sap.atribuidoAtual||0;
  if(saldo<=0) return true;
  if(atrib>0 && (saldo/atrib)<0.02) return true;
  return false;
}

/* =========================================================
   DERIVAÇÕES / SELEÇÕES
   ========================================================= */
function allClassificacoes(){
  const set=new Set();
  state.obras.forEach(o=>{ if(o.classificacao) set.add(o.classificacao); });
  return Array.from(set).sort();
}
function sicsForObraInSelectedWeek(o){
  if(state.selectedWeekId==='all') return o.sics;
  return o.sics.filter(s=>s.weekId===state.selectedWeekId);
}
function filteredObras(){
  const q = state.search.trim().toLowerCase();
  return state.obras.filter(o=>{
    if(state.selectedWeekId!=='all'){
      const hasSicThisWeek = o.sics.some(s=>s.weekId===state.selectedWeekId);
      if(!hasSicThisWeek) return false;
    }
    if(state.classFilter.size>0 && !state.classFilter.has(o.classificacao)) return false;
    if(state.onlyPending){
      const sics = sicsForObraInSelectedWeek(o);
      if(!sics.some(s=>s.status==='pendente')) return false;
    }
    if(q){
      const hay = (o.descricao+' '+o.oiRaw+' '+o.classificacao).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
}
function currentWeekMeta(){
  if(state.selectedWeekId==='all') return null;
  return state.weeks.find(w=>w.id===state.selectedWeekId);
}

/* =========================================================
   RENDER
   ========================================================= */
function render(){
  lockReadOnlyControls();
  renderHeaderSub();
  renderWeekChips();
  renderKPIs();
  renderFilterBar();
  renderObraTable();
  root.getElementById('footStamp').textContent =
    `${state.obras.length} obra(s) cadastradas · ${state.weeks.length} semana(s) no histórico`;
}

function lockReadOnlyControls(){
 if(cloud.canWrite())return;
 root.querySelectorAll('[data-approve],[data-disapprove],[data-descedit],[data-sicvalueedit],[data-sicvaluesave],[data-sicvalueinput],[data-sapstart],[data-sapsave],[data-sapedit],#btnOpenImport,#btnOpenAddCurrent,#btnConfirmImport,#btnConfirmAddCurrent').forEach(el=>{el.disabled=true;el.title='Seu acesso permite apenas consulta.';});
}

function renderHeaderSub(){
  const wm = currentWeekMeta();
  const scope = wm ? `${wm.label} (${fmtDate(wm.start)}–${fmtDate(wm.end)})` : 'todas as semanas';
  const pend = state.obras.reduce((n,o)=>n+sicsForObraInSelectedWeek(o).filter(s=>s.status==='pendente').length,0);
  root.getElementById('header-sub').textContent =
    `Estudos de Viabilidade, Aditivos e Revisões — ${scope} · ${pend} SIC(s) aguardando aprovação`;
}

function renderWeekChips(){
  const el = root.getElementById('weekChips');
  const weeksSorted = [...state.weeks].sort((a,b)=>a.start.localeCompare(b.start));
  let html = '';
  weeksSorted.forEach(w=>{
    const active = state.selectedWeekId===w.id;
    html += `<button class="month-chip ${active?'active':''}" data-week="${esc(w.id)}">${esc(w.label)}<span class="rng">${fmtDate(w.start)}–${fmtDate(w.end)}</span></button>`;
  });
  html += `<button class="month-chip ${state.selectedWeekId==='all'?'active':''}" data-week="all">Todas as semanas</button>`;
  el.innerHTML = cloud.cleanHTML(html);
  root.getElementById('weekInfo').textContent = `${weeksSorted.length} semana(s) importada(s)`;
  el.querySelectorAll('.month-chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{ state.selectedWeekId = btn.dataset.week; render(); });
  });
}

function renderKPIs(){
  const el = root.getElementById('kpiRow');
  const inScope = state.selectedWeekId==='all' ? state.obras : state.obras.filter(o=>snapshotForObraWeek(o,state.selectedWeekId));
  let novasQtd=0, novasValor=0;
  inScope.forEach(o=>{ sicsForObraInSelectedWeek(o).forEach(s=>{ novasQtd++; novasValor += (s.valor||0); }); });

  const views = inScope.map(o=>({o, view:panelDataForSelection(o)}));
  const evTotalCarteira = views.reduce((sum,x)=>sum+((x.view.ev&&x.view.ev.total)||0),0);
  const saldoCriticoCount = views.filter(x=>{
    const sap=x.view.sap;
    if(!sap) return false;
    const saldo=sap.saldoAtual||0, atrib=sap.atribuidoAtual||0;
    return saldo<=0 || (atrib>0 && (saldo/atrib)<0.02);
  }).length;
  const semOICount = views.filter(x=>!x.view.sap).length;
  const wm = currentWeekMeta();
  const kpiLabel = wm ? `Novas SICs — ${esc(wm.label)}` : 'Novas SICs — todas as semanas';
  const evLabel = wm ? `EV total — ${esc(wm.label)}` : 'EV total da carteira';
  const scopeSub = wm ? `${inScope.length} obra(s) no snapshot da semana` : `${inScope.length} obra(s) — estado atual`;

  el.innerHTML = cloud.cleanHTML(`
    <div class="kpi-card laranja">
      <p class="kpi-label">${kpiLabel}</p>
      <div class="kpi-value">${fmtBRL(novasValor)}</div>
      <p class="kpi-sub">${novasQtd} SIC${novasQtd===1?'':'s'} para aprovação</p>
    </div>
    <div class="kpi-card">
      <p class="kpi-label">${evLabel}</p>
      <div class="kpi-value">${fmtBRL(evTotalCarteira)}</div>
      <p class="kpi-sub">${scopeSub}</p>
    </div>
    <div class="kpi-card ${saldoCriticoCount>0?'vermelho':'verde'}">
      <p class="kpi-label">Saldo crítico no SAP</p>
      <div class="kpi-value">${saldoCriticoCount}</div>
      <p class="kpi-sub">saldo ≤ 0 ou &lt; 2% do atribuído</p>
    </div>
    <div class="kpi-card ${semOICount>0?'vermelho':'verde'}">
      <p class="kpi-label">Obras sem OI no SAP</p>
      <div class="kpi-value">${semOICount}</div>
      <p class="kpi-sub">${wm?'na semana selecionada':'aguardando criação de ordem interna'}</p>
    </div>
  `);
}

function renderFilterBar(){
  const el = root.getElementById('filterBar');
  const classes = allClassificacoes();
  el.innerHTML = cloud.cleanHTML(`
    <input type="text" id="searchInput" placeholder="🔍  Buscar por obra, OI ou classificação…" value="${esc(state.search)}">
    <div class="chip-group" id="classChips">
      ${classes.map(c=>`<button class="fchip ${state.classFilter.has(c)?'active':''}" data-cls="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>
    <label class="toggle-pend"><input type="checkbox" id="onlyPendingChk" ${state.onlyPending?'checked':''}> Só com SICs pendentes</label>
    <button class="btn-clear" id="clearFilters">✕ Limpar filtros</button>
  `);
  root.getElementById('searchInput').addEventListener('input', e=>{ state.search = e.target.value; renderObraTable(); });
  el.querySelectorAll('#classChips .fchip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const c = chip.dataset.cls;
      if(state.classFilter.has(c)) state.classFilter.delete(c); else state.classFilter.add(c);
      renderFilterBar(); renderObraTable();
    });
  });
  root.getElementById('onlyPendingChk').addEventListener('change', e=>{ state.onlyPending = e.target.checked; renderObraTable(); });
  root.getElementById('clearFilters').addEventListener('click', ()=>{
    state.search=''; state.classFilter.clear(); state.onlyPending=false; renderFilterBar(); renderObraTable();
  });
}

function approvalStatus(sics){
  const n = sics.length;
  if(n===0) return null;
  const nAp = sics.filter(s=>s.status==='aprovado').length;
  const nRep = sics.filter(s=>s.status==='reprovado').length;
  if(nAp===n) return 'aprovado';
  if(nAp>0) return 'parcial';
  if(nRep===n) return 'nao-aprovado';
  return 'aguardando';
}
function situacaoBadge(o, sics){
  const st = approvalStatus(sics);
  if(st===null) return `<span style="color:var(--texto-suave)">—</span>`;
  if(st==='aprovado') return `<span class="badge-ok">Aprovado</span>`;
  if(st==='parcial') return `<span class="badge-parcial">Aprovado Parcial</span>`;
  if(st==='nao-aprovado') return `<span class="badge-critico">Não Aprovado</span>`;
  return `<span class="badge-atencao">Aguard. Aprovação</span>`;
}

function recursosTotaisDaObra(sap){
  if(!sap) return null;
  return round2((sap.faturasAnosAnteriores||0) + (sap.atribuidoAtual||0));
}

function renderObraTable(){
  const grid = root.getElementById('obraCardsGrid');
  const list = filteredObras();
  if(!grid) return;
  if(list.length===0){
    grid.innerHTML = cloud.cleanHTML(`<div class="cards-empty"><div class="empty-state"><p class="big">Nenhuma obra encontrada</p><p>Ajuste os filtros ou selecione outra semana.</p></div></div>`);
    return;
  }
  const sorted = [...list].sort((a,b)=>{
    const aPend = sicsForObraInSelectedWeek(a).some(s=>s.status==='pendente');
    const bPend = sicsForObraInSelectedWeek(b).some(s=>s.status==='pendente');
    if(aPend!==bPend) return aPend? -1:1;
    const av=panelDataForSelection(a), bv=panelDataForSelection(b);
    return ((bv.ev&&bv.ev.total)||0)-((av.ev&&av.ev.total)||0);
  });

  grid.innerHTML = cloud.cleanHTML(sorted.map(o=>{
    const sics = sicsForObraInSelectedWeek(o);
    const sicValor = round2(sics.reduce((sum,x)=>sum+(x.valor||0),0));
    const view = panelDataForSelection(o);
    const ev = view.ev || o.ev || {};
    const sap = view.sap;
    const recursos = recursosTotaisDaObra(sap);
    // Regra executiva: Diff EV = Recursos Totais - EV Atual. Negativo = falta de verba.
    const diff = sap ? round2(recursos - (ev.total||0)) : null;
    const diffClass = diff===null ? 'neutral' : (diff < -2 ? 'deficit' : 'ok');
    const oiText = state.selectedWeekId==='all'
      ? (o.hasOI ? o.oiRaw : 'Sem OI no SAP')
      : (sap ? o.oiRaw : 'Sem OI no SAP na semana');
    const classificacao = o.classificacao || 'Sem classificação';

    return `
    <article class="obra-card" data-obra="${esc(o.id)}" tabindex="0" role="button" aria-label="Abrir detalhes de ${esc(o.descricao)}">
      <div class="obra-card-head">
        <div class="obra-card-topline">
          <div class="obra-card-title">${esc(o.descricao)}</div>
          <div>${situacaoBadge(o, sics)}</div>
        </div>
        <div class="obra-card-meta">
          <span class="mini-tag">OI: ${esc(oiText)}</span>
          <span class="mini-tag">${esc(classificacao)}</span>
        </div>
      </div>

      <div class="obra-card-primary">
        <div class="metric-hero">
          <div class="metric-label">EV Atual</div>
          <div class="metric-value">${fmtBRL(ev.total)}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">R$/m²</div>
          <div class="metric-value">${fmtBRL(ev.valorM2)}</div>
        </div>
      </div>

      <div class="obra-card-evbase">
        <div class="evbase-item">
          <div class="evbase-label">EV Inicial · s/ aditivos</div>
          <div class="evbase-value">${fmtBRL(ev.semAditivos)}</div>
        </div>
        <div class="evbase-item percent">
          <div class="evbase-label">Aditivos aprovados / EV inicial</div>
          <div class="evbase-value">${fmtPct(pctAditivos(ev))}</div>
        </div>
      </div>

      <div class="obra-card-sics">
        <div>
          <div class="metric-label">Novas SICs</div>
          <div class="metric-value">${sics.length}</div>
        </div>
        <div>
          <div class="metric-label">Valor das novas SICs</div>
          <div class="metric-value">${fmtBRL(sicValor)}</div>
        </div>
      </div>

      <div class="obra-card-fin">
        <div class="fin-item">
          <div class="fin-label">Consumos anos anteriores</div>
          <div class="fin-value">${sap ? fmtBRL(sap.faturasAnosAnteriores) : '—'}</div>
        </div>
        <div class="fin-item">
          <div class="fin-label">Atribuído atual</div>
          <div class="fin-value">${sap ? fmtBRL(sap.atribuidoAtual) : '—'}</div>
        </div>
        <div class="fin-item full recursos">
          <div class="fin-label">Recursos Totais</div>
          <div class="fin-value">${sap ? fmtBRL(recursos) : '—'}</div>
        </div>
      </div>

      <div class="obra-card-diff ${diffClass}">
        <span class="diff-label">Diff. EV · Recursos Totais − EV Atual</span>
        <span class="diff-value">${diff===null ? '—' : fmtBRL(diff)}</span>
      </div>
    </article>`;
  }).join(''));

  grid.querySelectorAll('.obra-card').forEach(card=>{
    card.addEventListener('click', ()=> openPanel(card.dataset.obra));
    card.addEventListener('keydown', e=>{
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openPanel(card.dataset.obra); }
    });
  });
}

/* ---------- SIDE PANEL ---------- */
function openPanel(obraId){
  const o = state.obras.find(x=>x.id===obraId);
  if(!o) return;
  state.openPanelObraId = obraId;
  state.sapEditObraId = null;
  root.getElementById('panel-tag').textContent = o.classificacao || '';
  root.getElementById('panel-title').textContent = o.descricao;
  root.getElementById('panel-body').innerHTML = cloud.cleanHTML(renderPanelBody(o));
  attachPanelEvents(o);
  root.getElementById('obra-overlay').classList.add('open');
  root.getElementById('obra-panel').classList.add('open');
}
function closePanel(){
  root.getElementById('obra-overlay').classList.remove('open');
  root.getElementById('obra-panel').classList.remove('open');
  state.openPanelObraId = null;
  state.sapEditObraId = null;
}

function snapshotForObraWeek(o, weekId){
  if(!o || !weekId || weekId==='all') return null;
  return state.snapshots.find(s=>s.obraId===o.id && s.weekId===weekId) || null;
}

function panelDataForSelection(o){
  const snap = snapshotForObraWeek(o, state.selectedWeekId);
  return snap ? {ev:snap.ev||o.ev, sap:snap.sap, historical:true} : {ev:o.ev, sap:o.sap, historical:false};
}

function validateObraView(o, ev, sap){
  const proxy = {...o, ev:ev||o.ev, sap:sap===undefined?o.sap:sap};
  return validateObra(proxy);
}

function renderHistorySection(o){
  const snaps = state.snapshots
    .filter(s=>s.obraId===o.id)
    .map(s=>({snap:s, week:state.weeks.find(w=>w.id===s.weekId)}))
    .filter(x=>x.week)
    .sort((a,b)=>a.week.start.localeCompare(b.week.start));
  if(!snaps.length) return '';

  let prevEV = null;
  const rows = snaps.map(({snap,week})=>{
    const evTotal = snap.ev ? (snap.ev.total||0) : 0;
    const delta = prevEV===null ? null : evTotal-prevEV;
    prevEV = evTotal;
    const deltaHtml = delta===null || Math.abs(delta)<0.01 ? '' : `<span class="history-delta ${delta>0?'pos':'neg'}">${delta>0?'+':''}${fmtBRL(delta)}</span>`;
    const selected = state.selectedWeekId===week.id ? 'selected-history' : '';
    return `<tr class="${selected}">
      <td>${esc(week.label)} <span style="font-weight:500;color:var(--texto-suave)">${fmtDate(week.start)}–${fmtDate(week.end)}</span></td>
      <td>${fmtBRL(evTotal)}${deltaHtml}</td>
      <td>${fmtBRL(snap.ev?snap.ev.aditivosAprovados:null)}</td>
      <td>${snap.sap?fmtBRL(snap.sap.atribuidoAtual):'—'}</td>
      <td>${snap.sap?fmtBRL(snap.sap.saldoAtual):'—'}</td>
      <td>${snap.sap?fmtBRL(snap.sap.diffEV):'—'}</td>
    </tr>`;
  }).join('');

  const events = [...(o.historyEvents||[])].sort((a,b)=>(b.at||'').localeCompare(a.at||''));
  const eventsHtml = events.length ? `<div class="panel-section">
    <div class="panel-section-title">🕘 Movimentações da obra</div>
    <div class="event-list">${events.map(e=>{
      const cls=e.type==='sic_approved'?'approval':e.type==='sic_reversed'?'reversal':e.type==='sap_edit'?'sapedit':'';
      return `<div class="event-item ${cls}"><div class="event-top"><span>${esc(e.weekLabel||'')}</span><span>${fmtDateTimeBR(e.at)}</span></div><div class="event-text">${esc(e.text||'')}</div></div>`;
    }).join('')}</div>
  </div>` : '';

  return `<div class="panel-section">
    <div class="panel-section-title">📈 Histórico semanal da obra</div>
    <div class="history-wrap">
      <table class="history-table">
        <thead><tr><th>Semana</th><th>EV Total</th><th>Aditivos</th><th>Atribuído SAP</th><th>Saldo SAP</th><th>Diff. EV</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>${eventsHtml}`;
}

function renderPanelBody(o){
  const view = panelDataForSelection(o);
  const ev = view.ev || o.ev;
  const sap = view.sap;
  const flags = validateObraView(o, ev, sap);
  const sics = [...sicsForObraInSelectedWeek(o)].sort((a,b)=>a.weekId<b.weekId?1:-1);
  const scopeLabel = state.selectedWeekId==='all' ? 'estado atual' : (view.historical ? 'snapshot da semana selecionada' : 'estado atual');

  const dadosSection = `
    <div class="panel-section">
      <div class="panel-section-title">🏗️ Dados da Obra</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="badge-neutro">${o.hasOI? esc(o.oiRaw) : 'Sem OI no SAP'}</span>
        <span class="badge-neutro">${esc(o.classificacao||'—')}</span>
      </div>
    </div>`;

  const evSection = `
    <div class="panel-section">
      <div class="panel-section-title">📐 Estudo de Viabilidade — ${scopeLabel}</div>
      <div class="panel-kpis ev-kpis">
        <div class="panel-kpi"><div class="panel-kpi-label">EV inicial · s/ aditivos</div><div class="panel-kpi-value">${fmtBRL(ev.semAditivos)}</div></div>
        <div class="panel-kpi laranja"><div class="panel-kpi-label">Aditivos aprovados</div><div class="panel-kpi-value">${fmtBRL(ev.aditivosAprovados)}</div></div>
        <div class="panel-kpi laranja"><div class="panel-kpi-label">Aditivos / EV inicial</div><div class="panel-kpi-value">${fmtPct(pctAditivos(ev))}</div></div>
        <div class="panel-kpi verde"><div class="panel-kpi-label">EV atual</div><div class="panel-kpi-value">${fmtBRL(ev.total)}</div></div>
      </div>
      <div class="panel-dates" style="margin-top:10px">
        <div class="panel-date-box"><div class="panel-date-label">Área</div><div class="panel-date-value">${fmtNum(ev.areaM2,2)} m²</div></div>
        <div class="panel-date-box"><div class="panel-date-label">R$/m²</div><div class="panel-date-value">${fmtBRL(ev.valorM2)}</div></div>
      </div>
    </div>`;

  let sapSection;
  if(o.hasOI && sap){
    const canEditSap = (state.selectedWeekId==='all'||state.selectedWeekId===o.lastWeekId);
    const editingSap = canEditSap && state.sapEditObraId===o.id;
    sapSection = `
    <div class="panel-section">
      <div class="panel-section-title">💰 Verba SAP — ${scopeLabel}</div>
      ${canEditSap ? `<div class="sap-actions">${editingSap
        ? `<button class="sap-cancel-btn" data-sapcancel data-obraid="${esc(o.id)}">Cancelar</button><button class="sap-save-btn" data-sapsave data-obraid="${esc(o.id)}">Salvar alterações</button>`
        : `<button class="sap-edit-btn" data-sapstart data-obraid="${esc(o.id)}">✎ Editar verba SAP</button>`}</div>` : ''}
      <div class="panel-kpis">
        <div class="panel-kpi"><div class="panel-kpi-label">Faturas anos ant.</div><div class="panel-kpi-value">${fmtBRL(sap.faturasAnosAnteriores)}</div></div>
        <div class="panel-kpi"><div class="panel-kpi-label">Atribuído atual</div><div class="panel-kpi-value">${editingSap?`<input class="editable-money" data-sapedit="atribuidoAtual" data-obraid="${esc(o.id)}" value="${Number(sap.atribuidoAtual||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}">`:`<div class="sap-display-value">${fmtBRL(sap.atribuidoAtual)}</div>`}</div></div>
        <div class="panel-kpi"><div class="panel-kpi-label">Comprometido</div><div class="panel-kpi-value">${editingSap?`<input class="editable-money" data-sapedit="comprometidoAtual" data-obraid="${esc(o.id)}" value="${Number(sap.comprometidoAtual||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}">`:`<div class="sap-display-value">${fmtBRL(sap.comprometidoAtual)}</div>`}</div></div>
      </div>
      <div class="total-row">
        <span class="t-label">Saldo atual</span>
        <span class="t-val ${sap.saldoAtual<=0?'neg':'pos'}">${fmtBRL(sap.saldoAtual)}</span>
      </div>
      <div class="total-row">
        <span class="t-label">Diff. vs. EV total</span>
        <span class="t-val ${sap.diffEV<0?'neg':'pos'}">${fmtBRL(sap.diffEV)}</span>
      </div>
      ${editingSap?'<div class="edit-note">Altere os valores e clique em Salvar alterações. Saldo e Diff. EV serão recalculados após a confirmação.</div>':''}
    </div>`;
  }else{
    sapSection = `
    <div class="panel-section">
      <div class="panel-section-title">💰 Verba SAP</div>
      <p class="no-oi-note">${o.hasOI?'Não há snapshot de verba SAP disponível para esta semana.':'Obra ainda sem Ordem Interna criada no SAP — não há histórico de verba, atribuição ou saldo até a OI ser aberta.'}</p>
    </div>`;
  }

  const flagsHtml = flags.length ? `<div class="panel-section">${flags.map(f=>`<div class="warn-flag">⚠ ${esc(f)}</div>`).join('')}</div>` : '';

  const sicsHtml = sics.length ? sics.map(s=>renderSicItem(o,s)).join('') : `<p style="font-size:12.5px;color:var(--texto-suave)">Nenhuma SIC nesta seleção.</p>`;
  const totalSicsValor = sics.reduce((sum,s)=>sum+(Number(s.valor)||0),0);
  const sicsSection = `
    <div class="panel-section">
      <div class="panel-section-title">🧾 SICs / Revisões — ${sics.length} item(ns)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div class="panel-kpi laranja">
          <div class="panel-kpi-label">Novas SICs nesta seleção</div>
          <div class="panel-kpi-value">${sics.length}</div>
        </div>
        <div class="panel-kpi laranja">
          <div class="panel-kpi-label">Valor total das novas SICs</div>
          <div class="panel-kpi-value">${fmtBRL(totalSicsValor)}</div>
        </div>
      </div>
      ${sicsHtml}
    </div>`;

  return dadosSection + evSection + sapSection + flagsHtml + renderHistorySection(o) + sicsSection;
}

function renderSicItem(o, s){
  const wm = state.weeks.find(w=>w.id===s.weekId);
  const editingValue = state.sicEditId===s.id;
  const valueHtml = editingValue ? `
      <div class="sic-value-edit-row">
        <input class="sic-value-input" data-sicvalueinput data-obraid="${esc(o.id)}" data-sicid="${esc(s.id)}" value="${esc(Number(s.valor||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}))}">
        <button class="sic-value-save" data-sicvaluesave data-obraid="${esc(o.id)}" data-sicid="${esc(s.id)}">Salvar</button>
        <button class="sic-value-cancel" data-sicvaluecancel>Cancelar</button>
      </div>` : `
      <div class="sic-value-wrap">
        <span class="sic-valor">${fmtBRL(s.valor)}</span>
        <button class="sic-edit-btn" data-sicvalueedit data-obraid="${esc(o.id)}" data-sicid="${esc(s.id)}">✎ Editar valor</button>
      </div>`;
  return `
  <div class="sic-item">
    <div class="sic-top">
      <div><span class="sic-lecom">${esc(s.lecom||'—')}</span><span class="sic-week-tag">${wm? esc(wm.label):''}</span></div>
      ${valueHtml}
    </div>
    <textarea class="sic-desc-edit" data-descedit data-obraid="${esc(o.id)}" data-sicid="${esc(s.id)}" rows="3">${esc(s.descricao||'')}</textarea>
    <div class="sic-desc-hint">Texto editável — ajuste antes de apresentar.<span class="sic-saved-tag" data-saved-sic="${esc(s.id)}">salvo ✓</span></div>
    <div class="sic-bottom">
      <div class="approve-row">
        <label class="approve-check ok" data-approvewrap data-obraid="${esc(o.id)}" data-sicid="${esc(s.id)}">
          <input type="checkbox" data-approve data-obraid="${esc(o.id)}" data-sicid="${esc(s.id)}" ${s.status==='aprovado'?'checked':''}> Aprovado
        </label>
        <label class="approve-check no" data-disapprovewrap data-obraid="${esc(o.id)}" data-sicid="${esc(s.id)}">
          <input type="checkbox" data-disapprove data-obraid="${esc(o.id)}" data-sicid="${esc(s.id)}" ${s.status==='reprovado'?'checked':''}> Não aprovado
        </label>
      </div>
    </div>
  </div>`;
}

function attachPanelEvents(o){
  lockReadOnlyControls();
  root.querySelectorAll('[data-sicvalueedit]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.sicEditId=btn.dataset.sicid;
      root.getElementById('panel-body').innerHTML=cloud.cleanHTML(renderPanelBody(o));
      attachPanelEvents(o);
      const inp=root.querySelector('[data-sicvalueinput]');
      if(inp){ inp.focus(); inp.select(); }
    });
  });
  root.querySelectorAll('[data-sicvaluecancel]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.sicEditId=null;
      root.getElementById('panel-body').innerHTML=cloud.cleanHTML(renderPanelBody(o));
      attachPanelEvents(o);
    });
  });
  root.querySelectorAll('[data-sicvaluesave]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const inp=root.querySelector(`[data-sicvalueinput][data-sicid="${CSS.escape(btn.dataset.sicid)}"]`);
      if(inp) await saveSicValue(btn.dataset.obraid,btn.dataset.sicid,inp.value,o);
    });
  });
  root.querySelectorAll('[data-sicvalueinput]').forEach(inp=>{
    inp.addEventListener('keydown', async e=>{
      if(e.key==='Enter'){ e.preventDefault(); await saveSicValue(inp.dataset.obraid,inp.dataset.sicid,inp.value,o); }
      if(e.key==='Escape'){ e.preventDefault(); state.sicEditId=null; root.getElementById('panel-body').innerHTML=cloud.cleanHTML(renderPanelBody(o)); attachPanelEvents(o); }
    });
  });
  root.querySelectorAll('[data-descedit]').forEach(ta=>{
    ta.style.height = 'auto';
    ta.style.height = (ta.scrollHeight+2)+'px';
    ta.addEventListener('input', ()=>{ ta.style.height='auto'; ta.style.height=(ta.scrollHeight+2)+'px'; });
    ta.addEventListener('blur', async ()=>{
      await saveSicDescricao(ta.dataset.obraid, ta.dataset.sicid, ta.value, ta.dataset.sicid);
    });
  });
  root.querySelectorAll('[data-approve]').forEach(chk=>{
    chk.addEventListener('change', async ()=>{
      await setSicStatus(chk.dataset.obraid, chk.dataset.sicid, chk.checked ? 'aprovado' : 'pendente', o);
    });
  });
  root.querySelectorAll('[data-disapprove]').forEach(chk=>{
    chk.addEventListener('change', async ()=>{
      await setSicStatus(chk.dataset.obraid, chk.dataset.sicid, chk.checked ? 'reprovado' : 'pendente', o);
    });
  });
  root.querySelectorAll('[data-sapstart]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.sapEditObraId = btn.dataset.obraid;
      root.getElementById('panel-body').innerHTML = cloud.cleanHTML(renderPanelBody(o));
      attachPanelEvents(o);
      const first = root.querySelector('[data-sapedit="atribuidoAtual"]');
      if(first) first.focus();
    });
  });
  root.querySelectorAll('[data-sapcancel]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.sapEditObraId = null;
      root.getElementById('panel-body').innerHTML = cloud.cleanHTML(renderPanelBody(o));
      attachPanelEvents(o);
    });
  });
  root.querySelectorAll('[data-sapsave]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{ await saveSapEdits(btn.dataset.obraid); });
  });
  root.querySelectorAll('[data-sapedit]').forEach(inp=>{
    inp.addEventListener('keydown', e=>{
      if(e.key==='Enter'){ e.preventDefault(); const saveBtn=root.querySelector('[data-sapsave]'); if(saveBtn) saveBtn.click(); }
      if(e.key==='Escape'){ e.preventDefault(); const cancelBtn=root.querySelector('[data-sapcancel]'); if(cancelBtn) cancelBtn.click(); }
    });
  });
}

async function saveSicDescricao(obraId, sicId, novoTexto, sicIdForTag){
  const obra = state.obras.find(x=>x.id===obraId);
  if(!obra) return;
  const sic = obra.sics.find(s=>s.id===sicId);
  if(!sic) return;
  const prev = sic.descricao;
  if(prev === novoTexto) return;
  sic.descricao = novoTexto;
  const ok = await persistAll(state.obras, state.weeks, state.snapshots);
  if(!ok){
    sic.descricao = prev;
    showToast('Não foi possível salvar o texto — tente novamente.', 'err');
    return;
  }
  const tag = Array.from(root.querySelectorAll('[data-saved-sic]')).find(el=>el.dataset.savedSic===sicIdForTag);
  if(tag){ tag.classList.add('show'); setTimeout(()=>tag.classList.remove('show'), 1800); }
}

async function saveSapEdits(obraId){
  const obra = state.obras.find(x=>x.id===obraId);
  if(!obra || !obra.sap) return;
  const atribInput = root.querySelector('[data-sapedit="atribuidoAtual"]');
  const compInput = root.querySelector('[data-sapedit="comprometidoAtual"]');
  if(!atribInput || !compInput) return;

  const newAtrib = parseMoneyInput(atribInput.value);
  const newComp = parseMoneyInput(compInput.value);
  if(newAtrib===null || newAtrib<0 || newComp===null || newComp<0){
    showToast('Informe valores válidos para Atribuído e Comprometido.', 'err');
    return;
  }

  const prevAtrib = obra.sap.atribuidoAtual||0;
  const prevComp = obra.sap.comprometidoAtual||0;
  const changedAtrib = Math.abs(prevAtrib-newAtrib)>=0.005;
  const changedComp = Math.abs(prevComp-newComp)>=0.005;
  if(!changedAtrib && !changedComp){
    state.sapEditObraId = null;
    root.getElementById('panel-body').innerHTML=cloud.cleanHTML(renderPanelBody(obra));
    attachPanelEvents(obra);
    return;
  }

  const oldSap = JSON.parse(JSON.stringify(obra.sap));
  obra.sap.atribuidoAtual = round2(newAtrib);
  obra.sap.comprometidoAtual = round2(newComp);
  recalcSAP(obra.sap, obra.ev);

  const wm = state.weeks.find(w=>w.id===obra.lastWeekId);
  const snap = snapshotForObraWeek(obra, obra.lastWeekId);
  if(snap){ snap.sap = JSON.parse(JSON.stringify(obra.sap)); snap.updatedAt = new Date().toISOString(); }

  const changes=[];
  if(changedAtrib) changes.push(`Atribuído atual: ${fmtBRL(prevAtrib)} → ${fmtBRL(newAtrib)}`);
  if(changedComp) changes.push(`Comprometido: ${fmtBRL(prevComp)} → ${fmtBRL(newComp)}`);
  addHistoryEvent(obra,'sap_edit',`${changes.join(' · ')}. Saldo atualizado para ${fmtBRL(obra.sap.saldoAtual)} e Diff. EV para ${fmtBRL(obra.sap.diffEV)}.`,{weekId:obra.lastWeekId,weekLabel:wm?wm.label:''});

  const ok=await persistAll(state.obras,state.weeks,state.snapshots);
  if(!ok){
    obra.sap=oldSap;
    if(snap) snap.sap=JSON.parse(JSON.stringify(oldSap));
    showToast('Não foi possível salvar a alteração.', 'err');
    return;
  }

  state.sapEditObraId = null;
  root.getElementById('panel-body').innerHTML=cloud.cleanHTML(renderPanelBody(obra));
  attachPanelEvents(obra);
  renderKPIs(); renderObraTable(); renderHeaderSub();
  showToast('Verba SAP atualizada.', 'ok');
}

async function saveSicValue(obraId, sicId, rawValue, obraRef){
  const obra=state.obras.find(x=>x.id===obraId);
  if(!obra) return;
  const sic=obra.sics.find(x=>x.id===sicId);
  if(!sic) return;
  const parsed=parseMoneyInput(rawValue);
  if(parsed===null){ showToast('Informe um valor válido para a SIC/Revisão.','err'); return; }
  const newValue=round2(parsed);
  const oldValue=round2(Number(sic.valor)||0);
  if(Math.abs(newValue-oldValue)<0.001){
    state.sicEditId=null;
    root.getElementById('panel-body').innerHTML=cloud.cleanHTML(renderPanelBody(obraRef)); attachPanelEvents(obraRef);
    return;
  }

  const before=JSON.stringify({ev:obra.ev,sap:obra.sap,sic:JSON.parse(JSON.stringify(sic)),events:obra.historyEvents,snapshots:state.snapshots});
  const wm=state.weeks.find(w=>w.id===sic.weekId);
  sic.valor=newValue; sic.valueUpdatedAt=new Date().toISOString();

  let financialDelta=0;
  if(sic.appliedToEV){
    const previouslyApplied=round2(Number(sic.evAppliedAmount)||oldValue);
    financialDelta=round2(newValue-previouslyApplied);
    applyApprovedDelta(obra,sic.weekId,financialDelta);
    sic.evAppliedAmount=newValue;
  }

  const impactText=sic.appliedToEV
    ? ` Impacto no EV: ${financialDelta>=0?'+':''}${fmtBRL(financialDelta)}. Novo EV Total: ${fmtBRL(obra.ev.total)}.`
    : ' SIC ainda não aprovada: o EV não foi alterado.';
  addHistoryEvent(obra,'sic_value_edited',`Valor da SIC/Revisão ${sic.lecom||'sem Lecom'} revisado de ${fmtBRL(oldValue)} para ${fmtBRL(newValue)}.${impactText}`,{weekId:sic.weekId,weekLabel:wm?wm.label:'',sicId:sic.id,amount:financialDelta,newValue,oldValue});

  const ok=await persistAll(state.obras,state.weeks,state.snapshots);
  if(!ok){
    const b=JSON.parse(before); obra.ev=b.ev; obra.sap=b.sap; Object.keys(sic).forEach(k=>delete sic[k]); Object.assign(sic,b.sic); obra.historyEvents=b.events; state.snapshots=b.snapshots;
    showToast('Não foi possível salvar a revisão do valor.','err'); return;
  }
  state.sicEditId=null;
  root.getElementById('panel-body').innerHTML=cloud.cleanHTML(renderPanelBody(obraRef)); attachPanelEvents(obraRef);
  renderKPIs(); renderObraTable(); renderHeaderSub();
  showToast(sic.appliedToEV?'Valor revisado e cálculos atualizados.':'Valor da SIC/Revisão atualizado.','ok');
}

async function setSicStatus(obraId, sicId, newStatus, obraRef){
  const obra = state.obras.find(x=>x.id===obraId);
  if(!obra) return;
  const sic = obra.sics.find(s=>s.id===sicId);
  if(!sic) return;
  const prevStatus = sic.status;
  const before = JSON.stringify({ev:obra.ev,sap:obra.sap,sic:{status:sic.status,appliedToEV:sic.appliedToEV,evAppliedAmount:sic.evAppliedAmount,appliedAt:sic.appliedAt},events:obra.historyEvents,snapshots:state.snapshots});
  const amount = round2(Number(sic.valor)||0);
  const wm = state.weeks.find(w=>w.id===sic.weekId);

  // Aprovação financeira: aplica apenas uma vez.
  if(newStatus==='aprovado' && !sic.appliedToEV && amount!==0){
    applyApprovedDelta(obra,sic.weekId,amount);
    sic.appliedToEV=true; sic.evAppliedAmount=amount; sic.appliedAt=new Date().toISOString();
    addHistoryEvent(obra,'sic_approved',`SIC/Revisão ${sic.lecom||'sem Lecom'} aprovada: ${fmtBRL(amount)} incorporados aos Aditivos Aprovados. Novo EV Total: ${fmtBRL(obra.ev.total)}.`,{weekId:sic.weekId,weekLabel:wm?wm.label:'',sicId:sic.id,amount});
  }

  // Se uma aprovação já aplicada for desfeita/reprovada, estorna o impacto financeiro.
  if(newStatus!=='aprovado' && sic.appliedToEV){
    const applied=round2(Number(sic.evAppliedAmount)||amount);
    applyApprovedDelta(obra,sic.weekId,-applied);
    addHistoryEvent(obra,'sic_reversed',`Aprovação da SIC/Revisão ${sic.lecom||'sem Lecom'} desfeita: ${fmtBRL(applied)} estornados dos Aditivos Aprovados. Novo EV Total: ${fmtBRL(obra.ev.total)}.`,{weekId:sic.weekId,weekLabel:wm?wm.label:'',sicId:sic.id,amount:-applied});
    sic.appliedToEV=false; sic.evAppliedAmount=0; sic.appliedAt=null;
  }

  sic.status = newStatus;
  sic.statusUpdatedAt = new Date().toISOString();
  const ok = await persistAll(state.obras, state.weeks, state.snapshots);
  if(!ok){
    const b=JSON.parse(before); obra.ev=b.ev; obra.sap=b.sap; sic.status=b.sic.status; sic.appliedToEV=b.sic.appliedToEV; sic.evAppliedAmount=b.sic.evAppliedAmount; sic.appliedAt=b.sic.appliedAt; obra.historyEvents=b.events; state.snapshots=b.snapshots;
    showToast('Não foi possível salvar a alteração — tente novamente.', 'err');
  }else if(prevStatus!==newStatus){
    showToast(newStatus==='aprovado'?'SIC aprovada e incorporada ao EV.':newStatus==='reprovado'?'SIC marcada como não aprovada.':'Status atualizado.', 'ok');
  }
  root.getElementById('panel-body').innerHTML = cloud.cleanHTML(renderPanelBody(obraRef));
  attachPanelEvents(obraRef);
  renderKPIs(); renderObraTable(); renderHeaderSub();
}

/* =========================================================
   TOAST
   ========================================================= */
let toastTimer=null;
function showToast(msg, kind){
  const t = root.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (kind==='err'?' err':kind==='ok'?' ok':'');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.className='toast'; }, 3200);
}

/* =========================================================
   EXPORTAR CSV DA VISÃO ATUAL
   ========================================================= */
function exportCurrentViewCSV(){
  const list = filteredObras();
  const rows = [['OI','Obra','Classificação','EV Total','R$/m²','Saldo SAP','Nº SICs','Valor SICs','Status das SICs']];
  list.forEach(o=>{
    const sics = sicsForObraInSelectedWeek(o);
    const statuses = sics.map(s=>s.status).join('; ');
    const view=panelDataForSelection(o); const ev=view.ev||o.ev; const sap=view.sap;
    rows.push([o.oiRaw, o.descricao, o.classificacao, ev.total, ev.valorM2, sap? sap.saldoAtual : 'N/A', sics.length, sics.reduce((s,x)=>s+(x.valor||0),0), statuses]);
  });
  const csv = rows.map(r=>r.map(csvCell).join(';')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const wm = currentWeekMeta();
  a.href = url; a.download = `controle-evs-${wm? slugify(wm.label) : 'todas-semanas'}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* =========================================================
   IMPORTAÇÃO DE NOVA SEMANA (mesmo modelo de planilha)
   ========================================================= */
let importedRows = null;

function openImportModal(){
  root.getElementById('importOverlay').classList.add('show');
  root.getElementById('fileInput').value='';
  root.getElementById('fileDropLabel').textContent='Escolher arquivo…';
  root.getElementById('fileDrop').classList.remove('has-file');
  root.getElementById('weekLabel').value = `Semana ${state.weeks.length+1}`;
  root.getElementById('weekStart').value='';
  root.getElementById('weekEnd').value='';
  root.getElementById('importPreview').innerHTML=cloud.cleanHTML('');
  root.getElementById('btnConfirmImport').disabled = true;
  importedRows = null;
}
function closeImportModal(){ root.getElementById('importOverlay').classList.remove('show'); }

function parseBRL(str){
  if(str===null||str===undefined) return null;
  if(typeof str==='number') return str;
  let s = String(str).replace(/R\$/g,'').trim();
  if(!s) return null;
  const lastComma = s.lastIndexOf(','), lastDot = s.lastIndexOf('.');
  const lastSep = Math.max(lastComma,lastDot);
  if(lastSep===-1){ const n=parseFloat(s); return isNaN(n)?null:n; }
  const intPart = s.slice(0,lastSep).replace(/[.,]/g,'');
  const decPart = s.slice(lastSep+1);
  const n = parseFloat(intPart+'.'+decPart);
  return isNaN(n)?null:n;
}
function splitMulti(val){
  if(val===null||val===undefined) return [];
  const s = String(val).trim();
  if(!s) return [];
  return s.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
}
function parseValores(raw){
  if(raw===null||raw===undefined) return [];
  if(typeof raw==='number') return [raw];
  const lines = String(raw).trim().split(/\n\s*\n/);
  const vals=[];
  lines.forEach(line=>{
    line=line.trim();
    if(!line) return;
    if(/^total/i.test(line)) return;
    const v = parseBRL(line);
    if(v!==null) vals.push(v);
  });
  return vals;
}
function parseCellNumber(v){
  if(v===null||v===undefined||v==='') return null;
  if(typeof v==='number') return v;
  const s=String(v).trim();
  if(s.startsWith('=') && /^[=+\-*/().\d\s]+$/.test(s)){
    try{
      const n=arithmetic(s);
      return Number.isFinite(n)?n:null;
    }catch(e){}
  }
  return parseBRL(v);
}
function findHeaderColumn(headerNorm, aliases){
  for(let i=0;i<headerNorm.length;i++){
    const h=headerNorm[i];
    if(aliases.some(a=>h===a || h.includes(a))) return i;
  }
  return -1;
}
function parseWorkbookRows(workbook){
  const sheetName = workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:null, raw:true});

  let headerIdx=-1, headerNorm=[];
  for(let r=0;r<Math.min(rows.length,20);r++){
    const n=(rows[r]||[]).map(v=>normalizeText(v));
    const hasOI=n.some(x=>x==='oi' || x.includes('ordem interna'));
    const hasDesc=n.some(x=>x==='descricao' || x.includes('descricao'));
    const hasLecom=n.some(x=>x.includes('lecom'));
    if(hasOI && hasDesc && hasLecom){ headerIdx=r; headerNorm=n; break; }
  }
  if(headerIdx<0) throw new Error('Cabeçalho não reconhecido. É necessário conter OI, DESCRIÇÃO e Nº(S) LECOM.');

  const col={
    oi:findHeaderColumn(headerNorm,['oi','ordem interna']),
    desc:findHeaderColumn(headerNorm,['descricao']),
    cls:findHeaderColumn(headerNorm,['classificacao']),
    evSem:findHeaderColumn(headerNorm,['ev s aditivos','ev sem aditivos']),
    aditivos:findHeaderColumn(headerNorm,['aditivos revisoes','aditivos aprovados','aditivos']),
    evTotal:findHeaderColumn(headerNorm,['ev total']),
    area:findHeaderColumn(headerNorm,['area m2','area']),
    valorM2:findHeaderColumn(headerNorm,['r m2','r m²']),
    lecom:findHeaderColumn(headerNorm,['lecom']),
    sicDesc:findHeaderColumn(headerNorm,['descricao da s sic','descricao sic','descricao da sic']),
    sicValor:findHeaderColumn(headerNorm,['valor de cada sic','valor sic']),
    faturas:findHeaderColumn(headerNorm,['faturas em anos anteriores','faturas anos anteriores','faturas']),
    atrib:findHeaderColumn(headerNorm,['atribuido atual','atribuido']),
    comprom:findHeaderColumn(headerNorm,['compromissado atual','comprometido atual','compromissado','comprometido']),
    saldo:findHeaderColumn(headerNorm,['saldo atual']),
    diff:findHeaderColumn(headerNorm,['diff ev'])
  };
  const get=(row,k)=>col[k]>=0 ? row[col[k]] : null;
  const parsed=[];
  let current=null;

  function pushSicFromRow(row, target){
    const lecom=get(row,'lecom'), desc=get(row,'sicDesc'), valorRaw=get(row,'sicValor');
    const lecoms=splitMulti(lecom);
    const descs=splitMulti(desc);
    const valores=parseValores(valorRaw);
    const hasSingleLecom=lecom!==null&&lecom!==undefined&&String(lecom).trim()!=='';
    const hasSingleDesc=desc!==null&&desc!==undefined&&String(desc).trim()!=='';
    const directVal=parseCellNumber(valorRaw);
    const finalLecoms=lecoms.length?lecoms:(hasSingleLecom?[String(lecom).trim()]:[]);
    const finalDescs=descs.length?descs:(hasSingleDesc?[String(desc).trim()]:[]);
    const finalValores=valores.length?valores:(directVal!==null?[directVal]:[]);
    const hasAny=finalLecoms.length||finalDescs.length||finalValores.length;
    if(!hasAny) return;
    const n=Math.max(finalLecoms.length,finalDescs.length,finalValores.length);
    for(let i=0;i<n;i++){
      target.sics.push({
        lecom:finalLecoms[i]!==undefined?finalLecoms[i]:(finalLecoms.length===1?finalLecoms[0]:null),
        descricao:finalDescs[i]!==undefined?finalDescs[i]:(finalDescs.length===1?finalDescs[0]:null),
        valor:finalValores[i]!==undefined?finalValores[i]:(finalValores.length===1?finalValores[0]:null)
      });
    }
  }

  for(let r=headerIdx+1;r<rows.length;r++){
    const row=rows[r]||[];
    const oiCell=get(row,'oi'), descCell=get(row,'desc');
    const startsObra=(oiCell!==null&&oiCell!==undefined&&String(oiCell).trim()!=='') ||
                     (descCell!==null&&descCell!==undefined&&String(descCell).trim()!=='');
    if(startsObra){
      const oiRaw=oiCell===null||oiCell===undefined?'':String(oiCell).trim();
      const hasOI=oiRaw.toUpperCase()!=='N/A' && oiRaw!=='';
      const oiList=hasOI?oiRaw.split(';').map(x=>x.trim()).filter(Boolean):[];
      const evSem=parseCellNumber(get(row,'evSem'))||0;
      const aditivos=parseCellNumber(get(row,'aditivos'))||0;
      let evTotal=parseCellNumber(get(row,'evTotal'));
      if(evTotal===null) evTotal=evSem+aditivos;
      const area=parseCellNumber(get(row,'area'))||0;
      let valorM2=parseCellNumber(get(row,'valorM2'));
      if(valorM2===null) valorM2=area?evTotal/area:0;

      let sap=null;
      if(hasOI){
        const faturas=parseCellNumber(get(row,'faturas'))||0;
        const atrib=parseCellNumber(get(row,'atrib'))||0;
        const comprom=parseCellNumber(get(row,'comprom'))||0;
        let saldo=parseCellNumber(get(row,'saldo'));
        if(saldo===null) saldo=atrib-comprom;
        let diff=parseCellNumber(get(row,'diff'));
        if(diff===null) diff=faturas+atrib-evTotal;
        sap={faturasAnosAnteriores:faturas,atribuidoAtual:atrib,comprometidoAtual:comprom,saldoAtual:saldo,diffEV:diff};
      }
      current={
        oiRaw,hasOI,oiList,descricao:descCell||'',classificacao:get(row,'cls')||'',
        ev:{semAditivos:evSem,aditivosAprovados:aditivos,total:evTotal,areaM2:area,valorM2},
        sap,sics:[]
      };
      parsed.push(current);
      pushSicFromRow(row,current);
    }else if(current){
      pushSicFromRow(row,current);
    }
  }
  return parsed.filter(x=>x.descricao || x.oiRaw || (x.sics&&x.sics.length));
}

function normalizeText(v){
  return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
function simpleHash(str){
  let h = 2166136261;
  for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h,16777619); }
  return (h>>>0).toString(36);
}
function obraIdFor(row){
  const base = normalizeText(row.descricao||'obra').slice(0,70);
  const oiBase = (row.oiList||[]).join('|');
  return 'obra-'+slugify(base||'obra')+'-'+simpleHash(base+'|'+oiBase);
}
function findExistingObra(row){
  const rowOIs = new Set((row.oiList||[]).map(String));
  if(rowOIs.size){
    const byOI = state.obras.find(o=>{
      const known = new Set([...(o.oiList||[]), ...(o.oiAliases||[])].map(String));
      return [...rowOIs].some(oi=>known.has(oi));
    });
    if(byOI) return byOI;
  }
  const nd = normalizeText(row.descricao);
  if(nd){
    const byDesc = state.obras.find(o=>{
      const aliases = [o.descricao, ...(o.descricaoAliases||[])];
      return aliases.some(d=>normalizeText(d)===nd);
    });
    if(byDesc) return byDesc;
  }
  return null;
}
function mergeObraIdentity(obra, row){
  obra.oiAliases = Array.isArray(obra.oiAliases) ? obra.oiAliases : [];
  [...(obra.oiList||[]), ...(row.oiList||[])].forEach(oi=>{ if(oi && !obra.oiAliases.includes(String(oi))) obra.oiAliases.push(String(oi)); });
  obra.descricaoAliases = Array.isArray(obra.descricaoAliases) ? obra.descricaoAliases : [];
  [obra.descricao, row.descricao].forEach(d=>{ if(d && !obra.descricaoAliases.includes(d)) obra.descricaoAliases.push(d); });
}
function sicFingerprint(s){
  return simpleHash([normalizeText(s.lecom), normalizeText(s.descricao), round2(Number(s.valor)||0)].join('|'));
}
function importFingerprint(rows){
  const normalized = rows.map(r=>({
    oi:[...(r.oiList||[])].sort(), desc:normalizeText(r.descricao), cls:normalizeText(r.classificacao),
    ev:[round2(r.ev.semAditivos||0),round2(r.ev.aditivosAprovados||0),round2(r.ev.total||0),round2(r.ev.areaM2||0),round2(r.ev.valorM2||0)],
    sap:r.sap?[round2(r.sap.faturasAnosAnteriores||0),round2(r.sap.atribuidoAtual||0),round2(r.sap.comprometidoAtual||0),round2(r.sap.saldoAtual||0),round2(r.sap.diffEV||0)]:null,
    sics:(r.sics||[]).map(s=>sicFingerprint(s)).sort()
  })).sort((a,b)=>(a.desc+JSON.stringify(a.oi)).localeCompare(b.desc+JSON.stringify(b.oi)));
  return simpleHash(JSON.stringify(normalized));
}








function latestWeek(){
  return [...state.weeks].sort((a,b)=>(a.start||'').localeCompare(b.start||'')).pop() || null;
}

async function addRowsToWeek(rows, week, options={}){
  if(!week) throw new Error('Nenhuma semana vigente encontrada.');
  const nowIso = new Date().toISOString();
  let addedSics=0, skippedSics=0, addedObras=0, touchedObras=0;
  const touched = new Set();

  rows.forEach(row=>{
    let obra=findExistingObra(row);
    if(!obra){
      const id=obraIdFor(row);
      const ev=recalcEV(JSON.parse(JSON.stringify(row.ev||{})));
      const sap=row.sap?recalcSAP(JSON.parse(JSON.stringify(row.sap)),ev):null;
      obra={
        id, oiList:row.oiList||[], oiRaw:row.oiRaw||'', hasOI:!!row.hasOI,
        oiAliases:[...(row.oiList||[])], descricao:row.descricao||'',
        descricaoAliases:row.descricao?[row.descricao]:[], classificacao:row.classificacao||'',
        ev, sap, lastWeekId:week.id, sics:[], historyEvents:[]
      };
      state.obras.push(obra);
      addedObras++;
    }else{
      mergeObraIdentity(obra,row);
      if(row.oiRaw!==undefined && row.oiRaw!==null && String(row.oiRaw).trim()!==''){
        obra.oiRaw=row.oiRaw; obra.oiList=row.oiList||obra.oiList; obra.hasOI=!!row.hasOI;
      }
      if(row.descricao) obra.descricao=row.descricao;
      if(row.classificacao) obra.classificacao=row.classificacao;

      // Em acréscimos da semana, preserva decisões e edições financeiras já realizadas no dashboard.
      // Atualiza apenas bases estruturais quando vierem preenchidas.
      if(row.ev){
        const incoming=row.ev;
        if(Number(incoming.semAditivos)) obra.ev.semAditivos=Number(incoming.semAditivos);
        if(Number(incoming.areaM2)) obra.ev.areaM2=Number(incoming.areaM2);
        obra.ev.aditivosAprovados=Math.max(Number(obra.ev.aditivosAprovados)||0,Number(incoming.aditivosAprovados)||0);
        recalcEV(obra.ev);
      }
      if(row.sap){
        if(!obra.sap) obra.sap=JSON.parse(JSON.stringify(row.sap));
        else{
          if(Number(row.sap.faturasAnosAnteriores)||Number(row.sap.faturasAnosAnteriores)===0){
            obra.sap.faturasAnosAnteriores=Number(row.sap.faturasAnosAnteriores)||0;
          }
          // Atribuído/Comprometido editados manualmente no dashboard prevalecem.
        }
        recalcSAP(obra.sap,obra.ev);
      }
      obra.lastWeekId=week.id;
    }

    const existingFingerprints=new Set((obra.sics||[]).map(s=>s.fingerprint||sicFingerprint(s)));
    const seen=new Set();
    (row.sics||[]).forEach((s,i)=>{
      const sfp=sicFingerprint(s);
      if(existingFingerprints.has(sfp)||seen.has(sfp)){ skippedSics++; return; }
      seen.add(sfp);
      obra.sics.push({
        id:`sic-${simpleHash(obra.id+'|'+week.id+'|'+sfp+'|'+Date.now()+'|'+i)}`,
        lecom:s.lecom, descricao:s.descricao, valor:s.valor, weekId:week.id, fingerprint:sfp,
        status:'pendente', statusUpdatedAt:null, appliedToEV:false, evAppliedAmount:0, appliedAt:null
      });
      addedSics++;
      touched.add(obra.id);
    });

    if(addedObras>0 || touched.has(obra.id)){
      touchedObras++;
      state.snapshots=state.snapshots.filter(s=>!(s.weekId===week.id&&s.obraId===obra.id));
      state.snapshots.push({
        weekId:week.id, obraId:obra.id,
        ev:JSON.parse(JSON.stringify(obra.ev)),
        sap:obra.sap?JSON.parse(JSON.stringify(obra.sap)):null,
        capturedAt:nowIso, updatedAt:nowIso
      });
      if(!options.silentHistory){
        const origem=options.sourceLabel?` (${options.sourceLabel})`:'';
        addHistoryEvent(obra,'incremental_import',
          `Acréscimo na ${week.label}${origem}: novas SICs/Revisões incorporadas à semana vigente.`,
          {weekId:week.id,weekLabel:week.label});
      }
    }
  });

  if(options.bundleId){
    week.incrementBundles=Array.isArray(week.incrementBundles)?week.incrementBundles:[];
    if(!week.incrementBundles.includes(options.bundleId)) week.incrementBundles.push(options.bundleId);
  }
  return {addedSics,skippedSics,addedObras,touchedObras};
}





let addCurrentRows=null;
function openAddCurrentModal(){
  const week=latestWeek();
  if(!week){ showToast('Nenhuma semana vigente encontrada. Importe uma semana primeiro.','err'); return; }
  root.getElementById('addCurrentOverlay').classList.add('show');
  root.getElementById('addCurrentFileInput').value='';
  root.getElementById('addCurrentFileLabel').textContent='Escolher arquivo…';
  root.getElementById('addCurrentFileDrop').classList.remove('has-file');
  root.getElementById('addCurrentPreview').innerHTML=cloud.cleanHTML('');
  root.getElementById('btnConfirmAddCurrent').disabled=true;
  addCurrentRows=null;
  root.getElementById('currentWeekTarget').innerHTML=
    cloud.cleanHTML(`<strong>Destino:</strong> ${esc(week.label)} · ${fmtDate(week.start)}–${fmtDate(week.end)}<br>
     <span style="font-size:11px;opacity:.8">As novas SICs/Revisões serão acrescentadas a esta mesma semana. Nenhuma nova semana será criada.</span>`);
}
function closeAddCurrentModal(){
  root.getElementById('addCurrentOverlay').classList.remove('show');
  addCurrentRows=null;
}

(()=>{
  root.getElementById('btnOpenImport').addEventListener('click', openImportModal);
  root.getElementById('btnOpenAddCurrent').addEventListener('click', openAddCurrentModal);
  root.getElementById('btnCloseAddCurrent').addEventListener('click', closeAddCurrentModal);
  root.getElementById('btnCancelAddCurrent').addEventListener('click', closeAddCurrentModal);
  root.getElementById('addCurrentOverlay').addEventListener('click', e=>{ if(e.target.id==='addCurrentOverlay') closeAddCurrentModal(); });

  root.getElementById('addCurrentFileInput').addEventListener('change', e=>{
    const file=e.target.files[0];
    const previewEl=root.getElementById('addCurrentPreview');
    const confirmBtn=root.getElementById('btnConfirmAddCurrent');
    if(!file) return;
    root.getElementById('addCurrentFileLabel').textContent=file.name;
    root.getElementById('addCurrentFileDrop').classList.add('has-file');
    previewEl.innerHTML=cloud.cleanHTML('<div class="preview-box">Lendo acréscimos…</div>');
    confirmBtn.disabled=true;
    const reader=new FileReader();
    reader.onload=evt=>{
      try{
        const data=new Uint8Array(evt.target.result);
        const wb=XLSX.read(data,{type:'array'});
        const parsed=parseWorkbookRows(wb);
        if(!parsed.length){
          previewEl.innerHTML=cloud.cleanHTML('<div class="preview-box err">Nenhuma obra/SIC foi encontrada no arquivo.</div>');
          addCurrentRows=null; return;
        }
        addCurrentRows=parsed;
        const totalSics=parsed.reduce((n,o)=>n+(o.sics||[]).length,0);
        const totalValor=parsed.reduce((n,o)=>n+(o.sics||[]).reduce((s,x)=>s+(Number(x.valor)||0),0),0);
        previewEl.innerHTML=cloud.cleanHTML(`<div class="preview-box"><strong>${parsed.length}</strong> obra(s) identificada(s) · <strong>${totalSics}</strong> SIC(s)/Revisão(ões) no arquivo · saldo líquido ${fmtBRL(totalValor)}.<br><span style="font-size:11px;opacity:.8">Itens já existentes na semana serão ignorados automaticamente.</span></div>`);
        confirmBtn.disabled=false;
      }catch(err){
        console.error(err);
        previewEl.innerHTML=cloud.cleanHTML(`<div class="preview-box err">Não foi possível ler o arquivo: ${esc(err.message||'erro desconhecido')}.</div>`);
        addCurrentRows=null;
      }
    };
    reader.onerror=()=>{ previewEl.innerHTML=cloud.cleanHTML('<div class="preview-box err">Falha ao carregar o arquivo.</div>'); };
    reader.readAsArrayBuffer(file);
  });

  root.getElementById('btnConfirmAddCurrent').addEventListener('click',async()=>{
    if(!addCurrentRows||!addCurrentRows.length) return;
    const week=latestWeek();
    if(!week){ showToast('Nenhuma semana vigente encontrada.','err'); return; }
    const btn=root.getElementById('btnConfirmAddCurrent');
    btn.disabled=true; btn.textContent='Acrescentando…';
    try{
      const result=await addRowsToWeek(addCurrentRows,week,{sourceLabel:'importação manual'});
      const ok=await persistAll(state.obras,state.weeks,state.snapshots);
      if(!ok) throw new Error('Falha ao salvar os dados no navegador.');
      state.selectedWeekId=week.id;
      closeAddCurrentModal();
      render();
      const dup=result.skippedSics?` · ${result.skippedSics} duplicada(s) ignorada(s)`:'';
      showToast(`${result.addedSics} SIC(s)/Revisão(ões) acrescentada(s) à ${week.label}${dup}.`,'ok');
    }catch(err){
      console.error(err);
      showToast(err.message||'Não foi possível acrescentar os dados.','err');
    }finally{
      btn.textContent='Acrescentar à semana';
      btn.disabled=false;
    }
  });
  root.getElementById('btnExport').addEventListener('click', exportCurrentViewCSV);
  root.getElementById('btnCloseModal').addEventListener('click', closeImportModal);
  root.getElementById('btnCancelImport').addEventListener('click', closeImportModal);
  root.getElementById('importOverlay').addEventListener('click', (e)=>{ if(e.target.id==='importOverlay') closeImportModal(); });

  root.getElementById('fileInput').addEventListener('change', (e)=>{
    const file = e.target.files[0];
    const previewEl = root.getElementById('importPreview');
    const confirmBtn = root.getElementById('btnConfirmImport');
    if(!file){ return; }
    root.getElementById('fileDropLabel').textContent = file.name;
    root.getElementById('fileDrop').classList.add('has-file');
    previewEl.innerHTML = cloud.cleanHTML(`<div class="preview-box">Lendo planilha…</div>`);
    confirmBtn.disabled = true;

    const reader = new FileReader();
    reader.onload = (evt)=>{
      try{
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, {type:'array'});
        const parsed = parseWorkbookRows(wb);
        if(parsed.length===0){
          previewEl.innerHTML = cloud.cleanHTML(`<div class="preview-box err">Nenhuma linha de obra foi encontrada. Confira se o arquivo segue o mesmo modelo (cabeçalhos nas linhas 1–2, dados a partir da linha 3).</div>`);
          importedRows = null; return;
        }
        importedRows = parsed;
        const totalSics = parsed.reduce((s,o)=>s+o.sics.length,0);
        const totalValor = parsed.reduce((s,o)=>s+o.sics.reduce((ss,x)=>ss+(x.valor||0),0),0);
        previewEl.innerHTML = cloud.cleanHTML(`<div class="preview-box"><strong>${parsed.length}</strong> obra(s) lida(s) · <strong>${totalSics}</strong> SIC(s) novas · valor total ${fmtBRL(totalValor)}</div>`);
        confirmBtn.disabled = false;
      }catch(err){
        console.error(err);
        previewEl.innerHTML = cloud.cleanHTML(`<div class="preview-box err">Não foi possível ler o arquivo: ${esc(err.message||'')}. Verifique se é um .xlsx válido.</div>`);
        importedRows = null;
      }
    };
    reader.onerror = ()=>{ previewEl.innerHTML = cloud.cleanHTML(`<div class="preview-box err">Falha ao carregar o arquivo.</div>`); };
    reader.readAsArrayBuffer(file);
  });

  root.getElementById('btnConfirmImport').addEventListener('click', async ()=>{
    if(!importedRows || importedRows.length===0) return;
    const label = root.getElementById('weekLabel').value.trim() || `Semana ${state.weeks.length+1}`;
    const start = root.getElementById('weekStart').value;
    const end = root.getElementById('weekEnd').value;
    if(!start || !end){ showToast('Informe o início e o fim da semana.', 'err'); return; }
    if(end < start){ showToast('A data final não pode ser anterior à data inicial.', 'err'); return; }

    const fp = importFingerprint(importedRows);
    const duplicateWeek = state.weeks.find(w=>
      (w.start===start && w.end===end) ||
      (w.fingerprint && w.fingerprint===fp)
    );
    if(duplicateWeek){
      showToast(`Importação duplicada: os dados já constam em ${duplicateWeek.label}.`, 'err');
      return;
    }

    const weekId = 'w'+(state.weeks.length+1)+'-'+Date.now();
    const confirmBtn = root.getElementById('btnConfirmImport');
    confirmBtn.disabled = true; confirmBtn.textContent = 'Importando…';

    const nowIso = new Date().toISOString();
    let addedSics = 0, skippedSics = 0;
    importedRows.forEach(row=>{
      let obra = findExistingObra(row);
      if(!obra){
        const id = obraIdFor(row);
        obra = {
          id, oiList:row.oiList, oiRaw:row.oiRaw, hasOI:row.hasOI,
          oiAliases:[...(row.oiList||[])], descricao:row.descricao, descricaoAliases:row.descricao?[row.descricao]:[],
          classificacao:row.classificacao, ev:recalcEV(JSON.parse(JSON.stringify(row.ev))), sap:row.sap?recalcSAP(JSON.parse(JSON.stringify(row.sap)),row.ev):null, lastWeekId:weekId, sics:[], historyEvents:[]
        };
        state.obras.push(obra);
      }else{
        mergeObraIdentity(obra,row);
        obra.oiRaw = row.oiRaw; obra.hasOI = row.hasOI; obra.oiList = row.oiList;
        obra.descricao = row.descricao; obra.classificacao = row.classificacao;
        // O dashboard preserva aprovações financeiras já registradas, mesmo se a planilha seguinte ainda estiver desatualizada.
        const importedEV = JSON.parse(JSON.stringify(row.ev));
        importedEV.aditivosAprovados = Math.max(Number(importedEV.aditivosAprovados)||0, Number(obra.ev&&obra.ev.aditivosAprovados)||0);
        obra.ev = recalcEV(importedEV);
        if(row.sap){
          const importedSAP=JSON.parse(JSON.stringify(row.sap));
          if(obra.sap){
            importedSAP.atribuidoAtual=Math.max(Number(importedSAP.atribuidoAtual)||0,Number(obra.sap.atribuidoAtual)||0);
            importedSAP.comprometidoAtual=Math.max(Number(importedSAP.comprometidoAtual)||0,Number(obra.sap.comprometidoAtual)||0);
          }
          obra.sap=recalcSAP(importedSAP,obra.ev);
        }else obra.sap=null;
        obra.lastWeekId = weekId;
      }

      const existingFingerprints = new Set((obra.sics||[]).map(s=>s.fingerprint||sicFingerprint(s)));
      const seenThisImport = new Set();
      (row.sics||[]).forEach((s,i)=>{
        const sfp = sicFingerprint(s);
        if(existingFingerprints.has(sfp) || seenThisImport.has(sfp)){ skippedSics++; return; }
        seenThisImport.add(sfp);
        obra.sics.push({
          id:`sic-${simpleHash(obra.id+'|'+weekId+'|'+sfp+'|'+i)}-${Date.now()}-${i}`,
          lecom:s.lecom, descricao:s.descricao, valor:s.valor, weekId, fingerprint:sfp,
          status:'pendente', statusUpdatedAt:null, appliedToEV:false, evAppliedAmount:0, appliedAt:null
        });
        addedSics++;
      });

      // mantém um único snapshot por obra/semana
      state.snapshots = state.snapshots.filter(s=>!(s.weekId===weekId && s.obraId===obra.id));
      state.snapshots.push({weekId, obraId:obra.id, ev:JSON.parse(JSON.stringify(obra.ev)), sap:obra.sap?JSON.parse(JSON.stringify(obra.sap)):null, capturedAt:nowIso});
      addHistoryEvent(obra,'week_import',`${label} importada. EV Total inicial da semana: ${fmtBRL(obra.ev.total)}${obra.sap?` · Atribuído: ${fmtBRL(obra.sap.atribuidoAtual)} · Comprometido: ${fmtBRL(obra.sap.comprometidoAtual)}`:''}.`,{weekId,weekLabel:label});
    });
    state.weeks.push({id:weekId, label, start, end, importedAt:nowIso, fingerprint:fp});

    const ok = await persistAll(state.obras, state.weeks, state.snapshots);
    confirmBtn.textContent = 'Importar semana';
    if(!ok){ showToast('Não foi possível salvar a importação — verifique as conexão e o acesso ao banco.', 'err'); confirmBtn.disabled = false; return; }
    state.selectedWeekId = weekId;
    closeImportModal();
    render();
    const dupMsg = skippedSics ? ` · ${skippedSics} SIC(s) duplicada(s) ignorada(s)` : '';
    showToast(`${label} importada: ${addedSics} SIC(s) nova(s)${dupMsg}.`, 'ok');
  });
})();
/* =========================================================
   BOOTSTRAP
   ========================================================= */
(async function init(){
  try{
    const {obras, weeks, snapshots} = await loadStore();
    state.obras = obras; state.weeks = weeks; state.snapshots = snapshots;


    const weeksSorted = [...state.weeks].sort((a,b)=>a.start.localeCompare(b.start));
    state.selectedWeekId = weeksSorted.length? weeksSorted[weeksSorted.length-1].id : 'all';
    render();
  }catch(err){
    console.error(err);
    root.getElementById('header-sub').textContent = 'Não foi possível carregar os dados.';
  }
})();

}
