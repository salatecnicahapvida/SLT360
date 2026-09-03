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

const observer=new MutationObserver(()=>{ if(document.querySelector('.users-settings-panel')) queueMicrotask(()=>syncPanel(false)); });
observer.observe(document.documentElement,{subtree:true,childList:true});
setInterval(()=>{ if(document.querySelector('.users-settings-panel')) syncPanel(false); },5000);
