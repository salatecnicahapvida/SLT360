import { createClient } from '@supabase/supabase-js';
import DOMPurify from 'dompurify';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';
import { createSaveQueue } from './save-queue.js';

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
  const { data: profile, error: profileError } = await client.from('slt360_profiles').select('id,nome,perfil,ativo').eq('id', auth.user.id).maybeSingle();
  if (profileError || !profile?.ativo || profile.perfil !== 'Admin') {
    message.textContent = 'Sua conta ainda não foi habilitada para o piloto administrativo. Solicite a liberação ao responsável.';
    document.querySelector('#cloudSignOut').hidden = false;
    return;
  }
  const { data: row, error: dataError } = await client.from('slt360_state').select('revision,payload').eq('id',1).maybeSingle();
  if (dataError || !row) { message.textContent = 'A base ainda não foi instalada ou não está acessível. Nenhum dado de demonstração será carregado.'; return; }
  const { payload } = row;
  const currentProfile = { ...profile, email: auth.user.email, status: 'Ativo', accessModules: ['projects','works','maintenance','clinical','budget','settings'] };
  queue = createSaveQueue({ revision: row.revision,
    async write(expected_revision, next_state) {
      const { data, error } = await client.rpc('slt360_save', { expected_revision, next_state });
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
  for (const key of ['SIC_BI_DATA','INVESTMENT_PLAN_DATA','UNIT_REGISTRY_DATA','MAINTENANCE_DATA','CAPEX_CONTROL_DATA','COMMISSION_OBRAS_DATA','HAPCAPEX_REFERENCE']) {
    if (Object.hasOwn(payload.datasets || {}, key)) globalThis[key] = payload.datasets[key];
  }
  globalThis.TRACO_IMPORTED_STATE = { ...payload.state, users: [currentProfile], activeRole: 'Admin' };
  globalThis.SLT_CLOUD = {
    profile: currentProfile, cleanHTML, save: snapshot => queue.save(snapshot),
    async logout() { try { await queue.flush(); } catch { return; } await client.auth.signOut(); location.reload(); },
    async saveAttachment(record) {
      if (record.blob.size > 10485760) throw new Error('O limite por anexo é 10 MB.');
      const upload = await client.storage.from('slt360-attachments').upload(record.id, record.blob, { upsert:false, contentType:record.blob.type || 'application/octet-stream' });
      if (upload.error) throw upload.error;
      const result = await client.from('slt360_attachments').insert({id:record.id,nome:record.nome,tipo:record.tipo,tamanho:record.tamanho});
      if (result.error) throw result.error;
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
window.addEventListener('beforeunload', event => { if (queue?.dirty) { event.preventDefault(); event.returnValue = ''; } });
client.auth.onAuthStateChange(event => {
  if (loaded && event === 'SIGNED_OUT') { shell.hidden = true; gate.hidden = false; location.reload(); }
});
start().catch(() => { message.textContent = 'Não foi possível carregar o sistema. Verifique sua conexão.'; });
