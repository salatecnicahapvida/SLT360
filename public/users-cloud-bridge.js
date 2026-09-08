const CLOUD_MODULES = ['projects','budget','maintenance','clinical','finance'];
const LEGACY_TO_CLOUD = { projects:'projects', works:'budget', maintenance:'maintenance', clinical:'clinical', budget:'finance' };
const CLOUD_TO_LEGACY = { projects:'projects', budget:'works', maintenance:'maintenance', clinical:'clinical', finance:'budget' };

function cloudReady(){ return globalThis.SLT_CLOUD?.profile?.perfil === 'Admin'; }
function profileForApi(value){ return value === 'Gestão' || value === 'Gestor' ? 'Gestor' : value === 'Admin' ? 'Admin' : 'Analista'; }
function displayProfile(value){ return value === 'Gestor' ? 'Gestão' : value; }
function modulesForUser(user){
  if(user.perfil === 'Admin') return ['projects','works','maintenance','clinical','budget','settings'];
  return (user.access || []).filter(g=>g.can_read).map(g=>CLOUD_TO_LEGACY[g.module]).filter(Boolean);
}
function accessLabel(user){
  if(user.perfil === 'Admin') return 'Todos os módulos';
  const labels={projects:'Projetos 360',works:'Orçamento 360',maintenance:'Manutenção 360',clinical:'Eng. Clínica 360',budget:'Controle de Verbas'};
  const mods=modulesForUser(user).filter(m=>m!=='settings');
  return mods.map(m=>labels[m]||m).join(', ') || 'Sem módulos liberados';
}
function setError(form,text){ const box=form?.querySelector('[data-form-error]'); if(box) box.textContent=text||''; }
function escapeHtml(value){ return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function showTemporaryPassword(title,email,password,warning=''){
  const dialog=document.createElement('dialog');
  dialog.style.maxWidth='560px'; dialog.style.width='calc(100% - 32px)';
  const form=document.createElement('form'); form.method='dialog';
  const h=document.createElement('h2'); h.textContent=title;
  const p=document.createElement('p'); p.textContent=email||'';
  const label=document.createElement('label'); label.textContent='Senha provisória';
  const input=document.createElement('input'); input.readOnly=true; input.value=password||''; input.autocomplete='off'; input.style.width='100%';
  const note=document.createElement('p'); note.textContent='Copie agora e entregue por um canal seguro. Esta senha não será exibida novamente e deverá ser trocada no próximo acesso.';
  const warn=document.createElement('p'); warn.textContent=warning; warn.hidden=!warning;
  const button=document.createElement('button'); button.type='submit'; button.className='primary-action'; button.textContent='Concluir';
  label.append(input); form.append(h,p,label,note,warn,button); dialog.append(form); document.body.append(dialog);
  dialog.addEventListener('close',()=>dialog.remove(),{once:true}); dialog.showModal(); input.select();
}

function normalizeUserForm(panel){
  const form=panel.querySelector('#userForm'); if(!form) return;
  const password=form.elements.senha;
  if(password){ password.required=false; password.disabled=true; const label=password.closest('label'); if(label) label.hidden=true; }
  const force=form.elements.mustChangePassword;
  if(force){ force.checked=true; force.disabled=true; const label=force.closest('label'); if(label) label.hidden=true; }
  const profile=form.elements.perfil;
  if(profile && !profile.dataset.cloudNormalized){
    const current=profileForApi(profile.value);
    profile.innerHTML='<option value="Analista">Analista</option><option value="Gestor">Gestor</option><option value="Admin">Admin</option>';
    profile.value=current; profile.dataset.cloudNormalized='1';
  }
  let hint=form.querySelector('[data-cloud-password-hint]');
  if(!hint){ hint=document.createElement('p'); hint.dataset.cloudPasswordHint='1'; hint.className='muted'; hint.textContent='A senha provisória é gerada automaticamente e a troca é obrigatória no primeiro acesso.'; form.insertBefore(hint,form.querySelector('button[type="submit"]')); }
}

function renderRealUsers(panel,team){
  const table=panel.querySelector('.users-table-wrap table'); if(!table) return;
  const head=table.querySelector('thead tr');
  if(head && !head.querySelector('[data-cloud-actions-head]')){ const th=document.createElement('th'); th.dataset.cloudActionsHead='1'; th.textContent='Ações'; head.append(th); }
  const tbody=table.querySelector('tbody'); if(!tbody) return;
  const users=[...(team?.users||[])].sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR'));
  tbody.innerHTML=users.map(user=>`<tr data-cloud-user-row="${escapeHtml(user.id)}">
    <td><strong>${escapeHtml(user.nome)}</strong></td>
    <td><span class="muted">${escapeHtml(user.email)}</span></td>
    <td>${escapeHtml(displayProfile(user.perfil))}</td>
    <td>${escapeHtml(accessLabel(user))}</td>
    <td><span class="status-pill" data-status="${user.must_change_password?'Aguardando':'Completo'}">${user.must_change_password?'Provisória':'Definitiva'}</span></td>
    <td><span class="status-pill" data-status="${user.ativo?'Completo':'Reprovado'}">${user.ativo?'Ativo':'Inativo'}</span></td>
    <td>${user.id===globalThis.SLT_CLOUD.profile.id?'<span class="muted">Conta atual</span>':`<button type="button" class="secondary-action" data-cloud-reset-user="${escapeHtml(user.id)}" data-cloud-reset-email="${escapeHtml(user.email)}">Redefinir senha</button>`}</td>
  </tr>`).join('') || '<tr><td colspan="7"><span class="muted">Nenhum usuário cadastrado.</span></td></tr>';
}

let syncing=false, lastSync=0;
async function syncPanel(force=false){
  if(!cloudReady()||syncing) return;
  const panel=document.querySelector('.users-settings-panel'); if(!panel) return;
  normalizeUserForm(panel);
  ensureBackupPanel(panel);
  const now=Date.now(); if(!force && now-lastSync<1500 && panel.dataset.cloudSynced==='1') return;
  syncing=true;
  try{
    const team=await globalThis.SLT_CLOUD.adminUsers();
    globalThis.SLT_CLOUD.team=team; globalThis.SLT_CLOUD.analysts=team?.analysts||[];
    renderRealUsers(panel,team); panel.dataset.cloudSynced='1'; lastSync=Date.now();
  }catch(error){
    const form=panel.querySelector('#userForm'); setError(form,error?.message||'Não foi possível atualizar a lista de usuários.');
  }finally{ syncing=false; }
}

document.addEventListener('submit',async event=>{
  const form=event.target.closest?.('#userForm'); if(!form||!cloudReady()) return;
  event.preventDefault(); event.stopImmediatePropagation(); setError(form,'');
  const submit=form.querySelector('button[type="submit"]'); if(submit) submit.disabled=true;
  try{
    const values=new FormData(form); const nome=String(values.get('nome')||'').trim(); const email=String(values.get('email')||'').trim().toLowerCase();
    if(!nome||!email) throw new Error('Informe nome e e-mail para criar o usuário.');
    const perfil=profileForApi(String(values.get('perfil')||'Analista'));
    const selected=new Set(values.getAll('accessModules').map(String));
    if(perfil!=='Admin' && ![...selected].some(m=>LEGACY_TO_CLOUD[m])) throw new Error('Selecione pelo menos um módulo de acesso.');
    const details={nome,perfil,ativo:true,analyst_id:null,new_analyst:'',access:CLOUD_MODULES.map(module=>{const legacy=CLOUD_TO_LEGACY[module]; const enabled=perfil==='Admin'||selected.has(legacy); return {module,can_read:enabled,can_write:enabled};})};
    const result=await globalThis.SLT_CLOUD.createUser(email,details);
    form.reset(); normalizeUserForm(form.closest('.users-settings-panel')); await syncPanel(true);
    showTemporaryPassword('Usuário criado',result.email,result.temporary_password);
  }catch(error){ setError(form,error?.message||'Não foi possível criar o usuário.'); }
  finally{ if(submit) submit.disabled=false; }
},true);

document.addEventListener('click',async event=>{
  const button=event.target.closest?.('[data-cloud-reset-user]'); if(!button||!cloudReady()) return;
  event.preventDefault(); event.stopImmediatePropagation();
  const targetId=button.dataset.cloudResetUser, email=button.dataset.cloudResetEmail||'';
  if(!confirm(`Redefinir a senha de ${email}? A senha atual deixará de funcionar.`)) return;
  button.disabled=true;
  try{
    const result=await globalThis.SLT_CLOUD.resetUserPassword(targetId); await syncPanel(true);
    showTemporaryPassword('Senha redefinida',result.email||email,result.temporary_password,result.audit_warning?'A senha foi redefinida, mas o registro complementar de auditoria não foi confirmado.':'' );
  }catch(error){ alert(error?.message||'Não foi possível redefinir a senha.'); }
  finally{ button.disabled=false; }
},true);

function formatBackupDate(value){
  try{return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));}catch{return String(value||'');}
}
function formatBackupBytes(value){
  const n=Number(value)||0;
  if(n<1024) return `${n} B`;
  if(n<1024*1024) return `${(n/1024).toFixed(1)} KB`;
  return `${(n/1024/1024).toFixed(1)} MB`;
}
function backupKindLabel(kind){ return kind==='daily'?'Automático':kind==='pre_restore'?'Pré-restauração':'Manual'; }
function backupMessage(panel,text,error=false){ const node=panel?.querySelector('[data-cloud-backup-message]'); if(node){ node.textContent=text||''; node.dataset.state=error?'failed':'saved'; } }

function ensureBackupPanel(panel){
  if(!cloudReady()||!panel||panel.querySelector('[data-cloud-backup-panel]')) return;
  const section=document.createElement('section');
  section.dataset.cloudBackupPanel='1';
  section.style.marginTop='28px';
  section.style.paddingTop='24px';
  section.style.borderTop='1px solid rgba(0,0,0,.12)';
  section.innerHTML=`
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
      <div>
        <h3 style="margin:0 0 6px">Backup & Segurança</h3>
        <p class="muted" style="margin:0">Snapshot automático a cada 24 horas, retenção de 14 dias. A restauração cria antes uma cópia de segurança do estado atual.</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="primary-action" data-cloud-export-backup>Exportar backup completo (JSON)</button>
        <button type="button" class="secondary-action" data-cloud-create-backup>Criar backup agora</button>
        <button type="button" class="secondary-action" data-cloud-refresh-backups>Atualizar</button>
      </div>
    </div>
    <p class="muted" data-cloud-backup-message style="min-height:1.3em"></p>
    <div class="users-table-wrap">
      <table>
        <thead><tr><th>Data</th><th>Tipo</th><th>Nome</th><th>Registros</th><th>Tamanho</th><th>Criado por</th><th>Ação</th></tr></thead>
        <tbody data-cloud-backup-rows><tr><td colspan="7"><span class="muted">Carregando backups…</span></td></tr></tbody>
      </table>
    </div>`;
  panel.append(section);
  queueMicrotask(()=>refreshBackups(panel));
}

let backupSyncing=false;
async function refreshBackups(panel=document.querySelector('.users-settings-panel')){
  if(!cloudReady()||!panel||backupSyncing) return;
  ensureBackupPanel(panel);
  const tbody=panel.querySelector('[data-cloud-backup-rows]'); if(!tbody) return;
  backupSyncing=true;
  try{
    const rows=await globalThis.SLT_CLOUD.backupList();
    tbody.innerHTML=rows.map(item=>`<tr>
      <td>${escapeHtml(formatBackupDate(item.created_at))}</td>
      <td>${escapeHtml(backupKindLabel(item.kind))}</td>
      <td>${escapeHtml(item.label||'')}</td>
      <td>${escapeHtml(item.record_count)}</td>
      <td>${escapeHtml(formatBackupBytes(item.size_bytes))}</td>
      <td>${escapeHtml(item.created_by_name||'Sistema')}</td>
      <td><button type="button" class="secondary-action" data-cloud-restore-backup="${escapeHtml(item.id)}" data-cloud-restore-date="${escapeHtml(formatBackupDate(item.created_at))}">Restaurar</button></td>
    </tr>`).join('') || '<tr><td colspan="7"><span class="muted">Nenhum backup disponível.</span></td></tr>';
    backupMessage(panel,'Backups conferidos.');
  }catch(error){
    tbody.innerHTML='<tr><td colspan="7"><span class="muted">Não foi possível carregar os backups.</span></td></tr>';
    backupMessage(panel,error?.message||'Não foi possível carregar os backups.',true);
  }finally{ backupSyncing=false; }
}

function downloadJson(data){
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download=`SLT360-backup-completo-${stamp}.json`; document.body.append(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

document.addEventListener('click',async event=>{
  if(!cloudReady()) return;
  const panel=document.querySelector('.users-settings-panel');
  const exportButton=event.target.closest?.('[data-cloud-export-backup]');
  const createButton=event.target.closest?.('[data-cloud-create-backup]');
  const refreshButton=event.target.closest?.('[data-cloud-refresh-backups]');
  const restoreButton=event.target.closest?.('[data-cloud-restore-backup]');
  const button=exportButton||createButton||refreshButton||restoreButton;
  if(!button) return;
  event.preventDefault(); event.stopImmediatePropagation(); button.disabled=true;
  try{
    if(exportButton){
      backupMessage(panel,'Gerando o JSON diretamente da nuvem…');
      const data=await globalThis.SLT_CLOUD.exportBackup(); downloadJson(data);
      backupMessage(panel,'Backup JSON exportado. Guarde o arquivo em local seguro.');
    }else if(createButton){
      const label=prompt('Nome opcional para este backup:','Backup manual');
      if(label===null) return;
      backupMessage(panel,'Criando snapshot no Supabase…');
      await globalThis.SLT_CLOUD.createBackup(label); await refreshBackups(panel);
      backupMessage(panel,'Backup manual criado.');
    }else if(refreshButton){
      await refreshBackups(panel);
    }else if(restoreButton){
      const date=restoreButton.dataset.cloudRestoreDate||'';
      const phrase=prompt(`Restaurar o estado de ${date}?\n\nAntes da restauração o SLT360 criará automaticamente um backup do estado atual.\n\nDigite RESTAURAR para confirmar:`,'');
      if(phrase!=='RESTAURAR') return;
      backupMessage(panel,'Criando backup de segurança e restaurando… Não feche esta página.');
      await globalThis.SLT_CLOUD.restoreBackup(restoreButton.dataset.cloudRestoreBackup);
    }
  }catch(error){ backupMessage(panel,error?.message||'A operação de backup falhou.',true); alert(error?.message||'A operação de backup falhou.'); }
  finally{ button.disabled=false; }
},true);

const observer=new MutationObserver(()=>{ if(document.querySelector('.users-settings-panel')) queueMicrotask(()=>syncPanel(false)); });
observer.observe(document.documentElement,{subtree:true,childList:true});
setInterval(()=>{ if(document.querySelector('.users-settings-panel')) syncPanel(false); },5000);
