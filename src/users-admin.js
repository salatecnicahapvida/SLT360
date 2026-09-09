import { MODULE_OPTIONS } from './access.js';
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderUsersPanel(cloud) {
 if(cloud.profile.perfil!=='Admin') return '';
 const users=cloud.team?.users||[], analysts=cloud.team?.analysts||cloud.analysts||[];
 return `<section class="panel users-panel" aria-labelledby="usersTitle"><div class="panel-header"><div><h2 id="usersTitle">Usuários</h2><p class="panel-subtitle">Contas individuais, vínculo com analistas e permissões por módulo.</p></div><div class="users-actions"><button class="secondary-button" data-team-action="refresh">Atualizar lista</button><button class="primary-button" data-team-action="create">Novo usuário</button></div></div>
 <div class="table-wrap"><table class="data-table" data-no-sort><thead><tr><th>Usuário</th><th>Perfil / situação</th><th>Analista vinculado</th><th>Acesso aos módulos</th><th>Ações</th></tr></thead><tbody>${users.map(u=>`<tr><td><strong>${esc(u.nome)}</strong><br><small>${esc(u.email)}</small></td><td>${esc(u.perfil)} · ${u.ativo?'Ativo':'Inativo'}${u.must_change_password?'<br><small>Troca de senha pendente</small>':''}</td><td>${esc(analysts.find(a=>a.id===u.analyst_id)?.nome||'Sem vínculo')}</td><td>${u.perfil==='Admin'?'Todos · edição':MODULE_OPTIONS.filter(m=>u.access?.some(g=>g.module===m.id&&g.can_read)).map(m=>`${m.label}: ${u.access.find(g=>g.module===m.id).can_write?'edição':'consulta'}`).join('<br>')||'Nenhum módulo'}</td><td><div class="users-actions"><button class="secondary-button" data-team-action="edit" data-user-id="${esc(u.id)}" aria-label="Editar ${esc(u.nome)}">Editar acesso</button>${u.id!==cloud.profile.id?`<button class="secondary-button" data-team-action="reset-password" data-user-id="${esc(u.id)}" aria-label="Redefinir senha de ${esc(u.nome)}">Redefinir senha</button>`:''}</div></td></tr>`).join('')||'<tr><td colspan="5">Atualize a lista para consultar os usuários.</td></tr>'}</tbody></table></div>
 <p class="muted">As permissões liberam os registros do módulo, não apenas as tarefas do analista vinculado. Desativar a conta bloqueia novos acessos e preserva o histórico.</p></section>
 <section class="panel users-panel analysts-panel" aria-labelledby="analystsTitle"><div class="panel-header"><div><h2 id="analystsTitle">Analistas</h2><p class="panel-subtitle">Cadastre aqui os responsáveis que devem aparecer nos filtros e nas demandas.</p></div><button class="primary-button" data-team-action="create-analyst">Novo analista</button></div>
 <div class="table-wrap"><table class="data-table" data-no-sort><thead><tr><th>Analista</th><th>Usuário associado</th><th>Situação do vínculo</th></tr></thead><tbody>${analysts.map(a=>{const linked=users.find(u=>u.analyst_id===a.id);return `<tr><td><strong>${esc(a.nome)}</strong></td><td>${linked?`${esc(linked.nome)}<br><small>${esc(linked.email)}</small>`:'—'}</td><td>${linked?'Associado':'Disponível para associação'}</td></tr>`;}).join('')||'<tr><td colspan="3">Nenhum analista cadastrado.</td></tr>'}</tbody></table></div>
 <p class="muted">O analista pode existir sem conta. Quando necessário, associe-o ao editar ou criar um usuário.</p></section>`;
}
export function mountUsersAdmin(cloud,onUpdated) {
 async function refresh(){cloud.team=await cloud.adminUsers();cloud.analysts=cloud.team.analysts;onUpdated();}
 document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-team-action]');if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(cloud.profile.perfil!=='Admin')return;
  if(button.dataset.teamAction==='refresh'){
   button.disabled=true;try{await refresh();}catch{button.textContent='Falha ao atualizar. Tente novamente.';button.disabled=false;}return;
  }
  if(button.dataset.teamAction==='create-analyst'){
   const analystDialog=document.createElement('dialog');analystDialog.className='user-editor';
   analystDialog.innerHTML=cloud.cleanHTML(`<form id="teamAnalystForm"><div class="panel-header"><h2>Novo analista</h2><button type="button" data-analyst-close aria-label="Fechar">×</button></div><p>Cadastre o responsável para disponibilizá-lo em todos os filtros e seletores de analista. A associação com uma conta de usuário pode ser feita depois.</p><label>Nome do analista<input name="nome" required minlength="2" maxlength="160" autocomplete="name" autofocus></label><p role="alert" data-analyst-error></p><div class="users-actions"><button type="button" data-analyst-close>Cancelar</button><button type="submit" class="primary-button">Criar analista</button></div></form>`);
   document.body.append(analystDialog);analystDialog.showModal();
   const analystForm=analystDialog.querySelector('form');let analystBusy=false;
   const closeAnalyst=()=>{if(!analystBusy){analystDialog.close();analystDialog.remove();}};
   analystDialog.querySelectorAll('[data-analyst-close]').forEach(b=>b.onclick=closeAnalyst);
   analystDialog.addEventListener('cancel',e=>{e.preventDefault();closeAnalyst();});
   analystForm.addEventListener('submit',async e=>{
    e.preventDefault();e.stopPropagation();if(analystBusy)return;
    const name=analystForm.elements.nome.value.trim();
    const errorBox=analystDialog.querySelector('[data-analyst-error]');errorBox.textContent='';
    analystBusy=true;analystForm.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{await cloud.createAnalyst(name);analystBusy=false;closeAnalyst();await refresh();}
    catch(error){errorBox.textContent=error.message||'Não foi possível cadastrar o analista.';analystBusy=false;analystForm.querySelectorAll('button').forEach(b=>b.disabled=false);}
   });
   return;
  }
  const user=cloud.team?.users.find(u=>u.id===button.dataset.userId);
  if(button.dataset.teamAction==='reset-password'){
   if(!user||user.id===cloud.profile.id)return;
   const resetDialog=document.createElement('dialog');resetDialog.className='user-editor';
   resetDialog.innerHTML=cloud.cleanHTML(`<div class="panel-header"><h2>Redefinir senha</h2><button type="button" data-reset-close aria-label="Fechar">×</button></div><p>Redefinir a senha de <strong>${esc(user.nome)}</strong>?</p><p>A senha atual deixará de funcionar. Uma nova senha provisória será exibida uma única vez e a pessoa deverá criar outra senha no próximo acesso.</p><p role="alert" data-reset-error></p><div class="users-actions"><button type="button" data-reset-close>Cancelar</button><button type="button" class="primary-button" data-reset-confirm>Redefinir senha</button></div>`);
   document.body.append(resetDialog);resetDialog.showModal();let busy=false;
   const close=()=>{if(!busy){resetDialog.close();resetDialog.remove();}};
   resetDialog.querySelectorAll('[data-reset-close]').forEach(b=>b.onclick=close);
   resetDialog.addEventListener('cancel',e=>{e.preventDefault();close();});
   resetDialog.querySelector('[data-reset-confirm]').onclick=async()=>{
    if(busy)return;busy=true;resetDialog.querySelectorAll('button').forEach(b=>b.disabled=true);
    const errorBox=resetDialog.querySelector('[data-reset-error]');errorBox.textContent='';
    try{
     const result=await cloud.resetUserPassword(user.id);
     resetDialog.innerHTML=cloud.cleanHTML(`<h2>Senha redefinida</h2><p><strong>${esc(result.email||user.email)}</strong></p><label>Nova senha provisória<input readonly value="${esc(result.temporary_password)}" autocomplete="off"></label><p>Guarde agora e entregue por um canal seguro. Esta senha não será exibida novamente. No próximo acesso, o usuário será obrigado a criar uma senha pessoal.</p><button class="primary-button" data-reset-finish>Concluir</button><p role="status" data-refresh-status></p>`);
     busy=false;resetDialog.querySelector('[data-reset-finish]').onclick=close;
     try{await refresh();}catch{resetDialog.querySelector('[data-refresh-status]').textContent='Senha redefinida. Atualize a lista depois de fechar.';}
    }catch(error){errorBox.textContent=error.message||'Não foi possível redefinir a senha. Atualize a lista antes de tentar novamente.';busy=false;resetDialog.querySelectorAll('button').forEach(b=>b.disabled=false);}
   };
   return;
  }
  const dialog=document.createElement('dialog');dialog.className='user-editor';
  const self=user?.id===cloud.profile.id;
  dialog.innerHTML=cloud.cleanHTML(`<form id="teamAccountForm"><div class="panel-header"><h2>${user?'Editar acesso':'Novo usuário'}</h2><button type="button" data-team-close aria-label="Fechar">×</button></div><p>Preencha a conta e, se necessário, associe o analista usado nas demandas.</p>
   <div class="user-form-grid"><label>Nome completo<input name="nome" required minlength="2" maxlength="160" value="${esc(user?.nome)}" autocomplete="name"></label>
   <label>E-mail de acesso<input name="email" type="email" required maxlength="254" value="${esc(user?.email)}" ${user?'readonly':''} autocomplete="off"></label>
   <label>Perfil<select name="perfil" ${self?'disabled':''}>${['Analista','Gestor','Admin'].map(p=>`<option ${p===(user?.perfil||'Analista')?'selected':''}>${p}</option>`).join('')}</select></label>
   <label>Analista associado<select name="analyst_id"><option value="">Sem vínculo</option>${(cloud.analysts||[]).map(a=>{const linked=(cloud.team?.users||[]).find(u=>u.analyst_id===a.id&&u.id!==user?.id);return `<option value="${esc(a.id)}" ${user?.analyst_id===a.id?'selected':''} ${linked?'disabled':''}>${esc(a.nome)}${linked?' · já vinculado':''}</option>`;}).join('')}</select></label>
   <label class="user-active"><input name="ativo" type="checkbox" ${user?.ativo!==false?'checked':''} ${self?'disabled':''}>Conta ativa</label></div>
   <fieldset class="user-permissions"><legend>Permissões por módulo</legend><p data-admin-hint hidden>Administradores têm acesso completo, inclusive à gestão de usuários.</p><div data-grants>${MODULE_OPTIONS.map(m=>{const g=user?.access?.find(g=>g.module===m.id);return `<label>${m.label}<select name="grant_${m.id}"><option value="none">Sem acesso</option><option value="read" ${g?.can_read&&!g?.can_write?'selected':''}>Somente consulta</option><option value="write" ${g?.can_write?'selected':''}>Consulta e edição</option></select></label>`;}).join('')}</div></fieldset>
   <p class="muted">Unidades, sprints e fornecedores são referências compartilhadas de consulta. O cadastro de obras é compartilhado entre Projetos e Obras; Controle de Verba apenas consulta esse cadastro.</p>
   ${!user?'<p>A senha provisória será gerada após o cadastro e exibida uma única vez. Entregue-a à pessoa por um canal seguro. Ela deverá trocá-la no primeiro acesso.</p>':''}
   <p role="alert" data-team-error></p><div class="users-actions"><button type="button" data-team-close>Cancelar</button><button type="submit" class="primary-button">${user?'Salvar acesso':'Criar usuário'}</button></div></form>`);
  document.body.append(dialog);dialog.showModal();
  const form=dialog.querySelector('form');let busy=false;
  const close=()=>{if(!busy){dialog.close();dialog.remove();}};
  dialog.querySelectorAll('[data-team-close]').forEach(b=>b.onclick=close);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  const roleChange=()=>{const admin=form.elements.perfil.value==='Admin';dialog.querySelector('[data-admin-hint]').hidden=!admin;dialog.querySelector('[data-grants]').hidden=admin;};
  form.elements.perfil.onchange=roleChange;roleChange();
  form.addEventListener('submit',async e=>{
   e.preventDefault();e.stopPropagation();if(busy)return;
   const details={nome:form.elements.nome.value.trim(),perfil:form.elements.perfil.value,ativo:form.elements.ativo.checked,analyst_id:form.elements.analyst_id.value||null,new_analyst:'',access:MODULE_OPTIONS.map(m=>({module:m.id,can_read:form.elements['grant_'+m.id].value!=='none',can_write:form.elements['grant_'+m.id].value==='write'}))};
   const errorBox=dialog.querySelector('[data-team-error]');errorBox.textContent='';
   busy=true;form.querySelectorAll('button').forEach(b=>b.disabled=true);
   try{
    const result=user?await cloud.updateUser(user.id,details,user.revision):await cloud.createUser(form.elements.email.value.trim(),details);
    // A senha fica somente neste diálogo. Não persiste em estado, logs ou armazenamento.
    if(!user){
     dialog.innerHTML=cloud.cleanHTML(`<h2>Usuário criado</h2><p><strong>${esc(result.email)}</strong></p><label>Senha provisória<input readonly value="${esc(result.temporary_password)}" autocomplete="off"></label><p>Guarde agora e entregue por um canal seguro. Esta senha não será exibida novamente. A troca será obrigatória no primeiro acesso.</p><button class="primary-button" data-finish>Concluir</button><p role="status" data-refresh-status></p>`);
     busy=false;dialog.querySelector('[data-finish]').onclick=close;
     try{await refresh();}catch{dialog.querySelector('[data-refresh-status]').textContent='Conta criada. Atualize a lista depois de fechar.';}
    }else{busy=false;close();await refresh();if(self)location.reload();}
   }catch(error){errorBox.textContent=error.message||'Não foi possível confirmar. Atualize a lista antes de tentar novamente.';busy=false;form.querySelectorAll('button').forEach(b=>b.disabled=false);}
  });
 },true);
 if(cloud.profile.perfil==='Admin'&&!cloud.team)refresh().catch(()=>{});
}
