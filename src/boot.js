import { createClient } from '@supabase/supabase-js';
import DOMPurify from 'dompurify';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';
import { decorateProfile, moduleAllowed, entityWritable, MODULE_OPTIONS } from './access.js';
import { createModuleStore } from './module-store.js';

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { storage: sessionStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
const gate = document.querySelector('#cloudGate');
const message = document.querySelector('#cloudMessage');
const shell = document.querySelector('#legacyShell');
let queue, loaded = false;

function cleanHTML(html) {
  return DOMPurify.sanitize(String(html), {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
    ADD_ATTR: ['target'], FORBID_TAGS: ['iframe','object','embed','script'],
  });
}

function blockApp(text) {
  const dialog = document.createElement('dialog');
  dialog.innerHTML = cleanHTML(`<h2>Alterações não confirmadas no banco</h2><p>${text}</p><p>A tela foi bloqueada para evitar novas alterações. Copie suas anotações antes de recarregar; não há salvamento local de segurança.</p><button id="reloadCloud">Recarregar do banco</button>`);
  document.body.append(dialog);
  dialog.querySelector('button').onclick = () => location.reload();
  dialog.addEventListener('cancel', e => e.preventDefault());
  dialog.showModal();
}

async function start() {
  message.textContent = 'Conferindo acesso…';
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) { message.textContent = ''; return; }
  document.querySelector('#cloudSignOut').hidden = false;
  const { data: profile, error: profileError } = await client.from('slt360_profiles').select('id,nome,perfil,ativo,must_change_password,analyst_id,revision').eq('id', auth.user.id).maybeSingle();
  if (profileError || !profile?.ativo || !['Admin','Gestor','Analista'].includes(profile.perfil)) {
    message.textContent = 'Sua conta não está ativa no sistema. Solicite a liberação ao responsável.';
    document.querySelector('#cloudSignOut').hidden = false;
    return;
  }
  if (profile.must_change_password !== false) {
    document.querySelector('#cloudLogin').hidden = true;
    document.querySelector('#firstAccess').hidden = false;
    message.textContent = '';
    return;
  }
  const { data: row, error: dataError } = await client.rpc('slt_module_load');
  if (dataError || row?.schema_version !== 2) { message.textContent = 'A base modular não está acessível. Verifique a conexão e a liberação do acesso; nenhum dado local será usado.'; return; }
  const [grants, directory] = await Promise.all([
    client.from('slt_core_module_access').select('module,can_read,can_write').eq('user_id',profile.id),
    client.from('slt_core_analysts').select('id,nome').order('nome'),
  ]);
  if(grants.error || directory.error){message.textContent='Não foi possível conferir as permissões. Tente entrar novamente.';return;}
  const currentProfile = decorateProfile({...profile,email:auth.user.email,access:grants.data||[]});
  let team=null;
  if(profile.perfil==='Admin') { const response=await client.rpc('slt_admin_users'); if(response.error){message.textContent='Não foi possível carregar a gestão de acessos.';return;} team=response.data; }

  queue = createModuleStore({ records: row.records, canWrite:entity=>entityWritable(currentProfile,entity),
    async commit(request_id, changes) {
      const { data, error } = await client.rpc('slt_commit_changes', { request_id, changes });
      if (error) throw error;
      return data;
    },
    onStatus(status) {
      const node = document.querySelector('#cloudStatus');
      node.textContent = status === 'saving' ? 'Salvando no banco…' : status === 'saved' ? 'Salvo no banco' : 'Não salvo — recarregue antes de continuar';
      node.dataset.state = status;
      if (status === 'failed') blockApp('Houve falha de conexão, perda de permissão ou outra sessão salvou uma versão mais recente.');
    },
  });
  const payload = queue.payload;
  for (const key of ['SIC_BI_DATA','INVESTMENT_PLAN_DATA','UNIT_REGISTRY_DATA','MAINTENANCE_DATA','CAPEX_CONTROL_DATA','COMMISSION_OBRAS_DATA','HAPCAPEX_REFERENCE']) {
    if (Object.hasOwn(payload.datasets || {}, key)) globalThis[key] = payload.datasets[key];
  }
  globalThis.TRACO_IMPORTED_STATE = { ...payload.state, users: [currentProfile], activeRole: currentProfile.perfil };
  globalThis.SLT_CLOUD = {
    profile: currentProfile, analysts: directory.data||[], team, cleanHTML,
    canWrite: uiModule => moduleAllowed(currentProfile,MODULE_OPTIONS.find(m=>m.ui===uiModule)?.id||'core',true),
    async adminUsers(){const r=await client.rpc('slt_admin_users');if(r.error)throw r.error;return r.data;},
    async updateUser(target_id,details,expected_revision){const r=await client.rpc('slt_admin_update_user',{target_id,details,expected_revision});if(r.error)throw r.error;return r.data;},
    async createUser(email,details){
      const r=await client.functions.invoke('slt-users',{body:{email,details}});
      if(r.error){let detail;try{detail=await r.error.context?.json();}catch{}throw new Error(detail?.error||'Não foi possível confirmar o cadastro. Atualize a lista antes de repetir.');}
      return r.data;
    },
    save: snapshot => queue.save(snapshot), acceptInitialState: snapshot => queue.acceptInitialState(snapshot),
    async logout() { try { await queue.flush(); } catch { return; } await client.auth.signOut(); location.reload(); },
    async saveAttachment(record) {
      if (record.blob.size > 10485760) throw new Error('O limite por anexo é 10 MB.');
      // Metadata first: Storage policies verify the module before accepting the file.
      const result = await client.from('slt360_attachments').insert({id:record.id,nome:record.nome,tipo:record.tipo,tamanho:record.tamanho,module:record.module});
      if (result.error) throw result.error;
      const upload = await client.storage.from('slt360-attachments').upload(record.id, record.blob, { upsert:false, contentType:record.blob.type || 'application/octet-stream' });
      if (upload.error) throw upload.error;
    },
    async readAttachment(id) {
      const info = await client.from('slt360_attachments').select('nome,tipo').eq('id',id).single();
      if (info.error) throw info.error;
      const file = await client.storage.from('slt360-attachments').download(id);
      if (file.error) throw file.error;
      return {...info.data,blob:file.data};
    },
  };
  gate.hidden = true;
  shell.hidden = false;
  try {
    const [echarts, chart] = await Promise.all([import('echarts'), import('chart.js/auto')]);
    globalThis.echarts = echarts;
    globalThis.Chart = chart.default;
    await import('./app.js');
    loaded = true;
  } catch (error) {
    shell.hidden = true;
    gate.hidden = false;
    message.textContent = 'Não foi possível iniciar o sistema. Informe o responsável; a base não foi substituída.';
    throw error;
  }
}

document.querySelector('#cloudLogin').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  button.disabled = true;
  message.textContent = 'Entrando…';
  try {
    const values = new FormData(form);
    const { error } = await client.auth.signInWithPassword({email:String(values.get('email')).trim(),password:String(values.get('password'))});
    form.elements.password.value = '';
    if (error) { message.textContent = 'Não foi possível entrar. Verifique seu e-mail, senha e conexão.'; return; }
    await start();
  } catch { message.textContent = 'Falha de conexão. Tente novamente.'; }
  finally { button.disabled = false; }
});
document.querySelector('#cloudSignOut').onclick = async () => { await client.auth.signOut(); location.reload(); };
document.querySelector('#firstAccessForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  const password = form.elements.newPassword.value;
  if (password !== form.elements.confirmPassword.value) {
    message.textContent = 'As duas senhas precisam ser iguais.';
    return;
  }
  if (password.length < 12 || new TextEncoder().encode(password).length > 72 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    message.textContent = 'Use de 12 a 72 caracteres (até 72 bytes), com maiúsculas, minúsculas e números.';
    return;
  }
  button.disabled = true;
  message.textContent = 'Atualizando sua senha…';
  try {
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      message.textContent = error.code === 'same_password'
        ? 'Escolha uma senha diferente da senha provisória.'
        : error.code === 'weak_password'
          ? 'A senha foi recusada por segurança. Escolha uma senha mais forte.'
          : 'Não foi possível trocar a senha. Confira sua conexão e tente novamente; se a sessão expirou, saia e entre de novo.';
      return;
    }
    form.reset();
    message.textContent = 'Senha atualizada. Conferindo a liberação do acesso…';
    location.reload();
  } catch {
    message.textContent = 'Não foi possível confirmar a troca. Tente entrar novamente com a nova senha antes de repetir.';
  } finally { button.disabled = false; }
});
window.addEventListener('beforeunload', event => { if (queue?.dirty) { event.preventDefault(); event.returnValue = ''; } });
client.auth.onAuthStateChange(event => {
  if (loaded && event === 'SIGNED_OUT') { shell.hidden = true; gate.hidden = false; location.reload(); }
});
start().catch(() => { message.textContent = 'Não foi possível carregar o sistema. Verifique sua conexão.'; });
