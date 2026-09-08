import { ENTITIES, ENTITY_BY_NAME, flattenPayload, hydrateRecords, recordKey } from './module-model.js';
const canonical = value => JSON.stringify(value,(_,v)=>v && typeof v==='object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])) : v);
const content = r => canonical([r.document,r.child_fields,r.parent_key]);
export function createModuleStore({records,commit,canWrite=()=>true,onStatus=()=>{},newRequestId=()=>crypto.randomUUID()}) {
  let baseline=new Map(records.filter(r=>!ENTITY_BY_NAME.get(r.entity)?.readonly && canWrite(ENTITY_BY_NAME.get(r.entity))).map(r=>[recordKey(r),r]));
  const versions=new Map(records.map(r=>[recordKey(r),r.revision]));
  let pending,active=false,failure=null,saving=Promise.resolve();
  function initial(snapshot) {
    if(active) throw new Error('Inicialização após gravação');
    // UI normalization is not itself a user edit. It is persisted with the next edit to that row.
    baseline=new Map(flattenPayload({state:snapshot},{writableOnly:true}).filter(r=>canWrite(ENTITY_BY_NAME.get(r.entity))).map(r=>{ const old=baseline.get(recordKey(r)); return [recordKey(r),{...r,ordinal:old?.ordinal??r.ordinal}]; }));
  }
  async function drain() {
    active=true;
    try {
      while(pending!==undefined) {
        const snapshot=pending; pending=undefined;
        const next=flattenPayload({state:snapshot},{writableOnly:true}).filter(r=>canWrite(ENTITY_BY_NAME.get(r.entity)));
        const nextMap=new Map(next.map(r=>[recordKey(r),r]));
        const explicitlyArchivedDemandKeys=new Set(next.filter(r=>r.entity==='budget_archived_demands').map(r=>r.key));
        const protectedMissing=[];
        const changes=[];
        for(let i=0;i<next.length;i++) {
          const row=next[i],key=recordKey(row),old=baseline.get(key);
          row.ordinal=old?.ordinal??row.ordinal;
          if(!old) {
            const following=next.slice(i+1).find(r=>r.entity===row.entity&&r.parent_key===row.parent_key&&baseline.has(recordKey(r)));
            const prior=next.slice(0,i).reverse().find(r=>r.entity===row.entity&&r.parent_key===row.parent_key);
            row.ordinal=following ? (prior ? (Number(prior.ordinal)+Number(baseline.get(recordKey(following)).ordinal))/2 : Number(baseline.get(recordKey(following)).ordinal)-1) : prior ? Number(prior.ordinal)+1 : 0;
          }
          if(!old || content(old)!==content(row)) changes.push({...row,expected_revision:versions.get(key)||0,operation:'upsert'});
        }
        const removed=[...baseline.values()].filter(r=>{
          if(nextMap.has(recordKey(r))) return false;
          // Demandas de Orçamento só podem ser excluídas por uma ação explícita,
          // que também cria o registro correspondente na lixeira/arquivo.
          // Um snapshot parcial nunca é autorização para apagar uma demanda.
          if(r.entity==='budget_demands' && !explicitlyArchivedDemandKeys.has(r.key)) {
            protectedMissing.push(r);
            return false;
          }
          return true;
        }).reverse().map(r=>({...r,expected_revision:versions.get(recordKey(r))||0,operation:'delete'}));
        // Delete children first; ordinary upserts remain parent-first.
        changes.unshift(...removed);
        if(changes.length) {
          onStatus('saving');
          const result=await commit(newRequestId(),changes);
          const confirmed=new Map((Array.isArray(result)?result:[]).map(r=>[recordKey(r),Number(r.revision)]));
          if(!Array.isArray(result) || result.length!==changes.length || confirmed.size!==changes.length || changes.some(c=>confirmed.get(recordKey(c))!==Number(c.expected_revision)+1)) {
            throw new Error('O banco não confirmou todos os registros. Recarregue para conferir o resultado.');
          }
          for(const row of result) versions.set(recordKey(row),row.revision);
        }
        baseline=new Map([...next,...protectedMissing].map(r=>[recordKey(r),r]));
      }
      onStatus('saved');
    } catch(error) { failure=error; onStatus('failed',error); }
    finally {active=false;}
  }
  return {
    payload:hydrateRecords(records),
    acceptInitialState:initial,
    save(snapshot) { if(failure)return; pending=structuredClone(snapshot); if(!active)saving=drain(); },
    async flush(){await saving;if(failure)throw failure;},
    get dirty(){return active||pending!==undefined||failure!==null;},
  };
}
