import { createClient } from '@supabase/supabase-js';
import DOMPurify from 'dompurify';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';
import { decorateProfile, moduleAllowed, entityWritable, MODULE_OPTIONS } from './access.js';
import { createModuleStore } from './module-store.js';

function createPersistentAuthStorage() {
  const persistent = globalThis.localStorage;
  const legacy = globalThis.sessionStorage;

  return {
    getItem(key) {
      let value = null;
      try { value = persistent.getItem(key); } catch {}
      if (value !== null) return value;

      try { value = legacy.getItem(key); } catch {}
      if (value !== null) {
        try {
          persistent.setItem(key, value);
          legacy.removeItem(key);
        } catch {}
      }
      return value;
    },
    setItem(key, value) {
      try {
        persistent.setItem(key, value);
        try { legacy.removeItem(key); } catch {}
      } catch {
        try { legacy.setItem(key, value); } catch {}
      }
    },
    removeItem(key) {
      try { persistent.removeItem(key); } catch {}
      try { legacy.removeItem(key); } catch {}
    },
  };
}

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: createPersistentAuthStorage(),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

const gate = document.querySelector('#cloudGate');
const message = document.querySelector('#cloudMessage');
const shell = document.querySelector('#legacyShell');
const loginForm = document.querySelector('#cloudLogin');
const firstAccess = document.querySelector('#firstAccess');
const signOutButton = document.querySelector('#cloudSignOut');
let queue;
let loaded = false;
let starting = null;

function cleanHTML(html) {
  return DOMPurify.sanitize(String(html), {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
    ADD_ATTR: ['target'], FORBID_TAGS: ['iframe','object','embed','script'],
  });
}

function showRestoring(text = 'Abrindo o SLT 360…') {
  gate.hidden = false;
  gate.classList.remove('is-ready');
  gate.setAttribute('aria-busy', 'true');
  shell.hidden = true;
  loginForm.hidden = false;
  firstAccess.hidden = true;
  signOutButton.hidden = true;
  message.textContent = text;
}

function showLogin(text = '') {
  gate.hidden = false;
  gate.classList.add('is-ready');
  gate.removeAttribute('aria-busy');
  shell.hidden = true;
  loginForm.hidden = false;
  firstAccess.hidden = true;
  signOutButton.hidden = true;
  message.textContent = text;
}

function showFirstAccess() {
  gate.hidden = false;
  gate.classList.add('is-ready');
  gate.removeAttribute('aria-busy');
  shell.hidden = true;
  loginForm.hidden = true;
  firstAccess.hidden = false;
  signOutButton.hidden = false;
  message.textContent = '';
}

function showAccessError(text) {
  gate.hidden = false;
  gate.classList.add('is-ready');
  gate.removeAttribute('aria-busy');
  shell.hidden = true;
  loginForm.hidden = true;
  firstAccess.hidden = true;
  signOutButton.hidden = false;
  message.textContent = text;
}

function blockApp(text) {
  const dialog = document.createElement('dialog');
  dialog.innerHTML = cleanHTML(`<h2>Alterações não confirmadas no banco</h2><p>${text}</p><p>A tela foi bloqueada para evitar novas alterações. Copie suas anotações antes de recarregar; não há salvamento local de segurança.</p><button id="reloadCloud">Recarregar do banco</button>`);
  document.body.append(dialog);
  dialog.querySelector('button').onclick = () => location.reload();
  dialog.addEventListener('cancel', e => e.preventDefault());
  dialog.showModal();
}

async function startInternal() {
  showRestoring('Restaurando sua sessão…');

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  const session = sessionData?.session;
  const authUser = session?.user;
  if (sessionError || !authUser) {
    showLogin();
    return;
  }

  const chartLibrariesPromise = Promise.all([import('echarts'), import('chart.js/auto')]);
  const [profileResponse, moduleResponse] = await Promise.all([
    client.from('slt360_profiles').select('id,nome,perfil,ativo,must_change_password,analyst_id,revision').eq('id', authUser.id).maybeSingle(),
    client.rpc('slt_module_load'),
  ]);

  const { data: profile, error: profileError } = profileResponse;
  if (profileError || !profile?.ativo || !['Admin','Gestor','Analista'].includes(profile.perfil)) {
    showAccessError('Sua conta não está ativa no sistema. Solicite a liberação ao responsável.');
    return;
  }
  if (profile.must_change_password !== false) {
    showFirstAccess();
    return;
  }

  const { data: row, error: dataError } = moduleResponse;
  if (dataError || row?.schema_version !== 2) {
    showAccessError('A base modular não está acessível. Verifique a conexão e a liberação do acesso; nenhum dado local será usado.');
    return;
  }

  const [grants, directory, teamResponse] = await Promise.all([
    client.from('slt_core_module_access').select('module,can_read,can_write').eq('user_id', profile.id),
    client.from('slt_core_analysts').select('id,nome').order('nome'),
    profile.perfil === 'Admin' ? client.rpc('slt_admin_users') : Promise.resolve({ data: null, error: null }),
  ]);

  if (grants.error || directory.error) {
    showAccessError('Não foi possível conferir as permissões. Tente entrar novamente.');
    return;
  }
  if (teamResponse.error) {
    showAccessError('Não foi possível carregar a gestão de acessos.');
    return;
  }

  const currentProfile = decorateProfile({ ...profile, email: authUser.email, access: grants.data || [] });
  const team = teamResponse.data;

  queue = createModuleStore({
    records: row.records,
    canWrite: entity => entityWritable(currentProfile, entity),
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
    profile: currentProfile,
    analysts: directory.data || [],
    team,
    cleanHTML,
    canWrite: uiModule => moduleAllowed(currentProfile, MODULE_OPTIONS.find(m => m.ui === uiModule)?.id || 'core', true),
    async adminUsers() {
      const r = await client.rpc('slt_admin_users');
      if (r.error) throw r.error;
      return r.data;
    },
    async updateUser(target_id, details, expected_revision) {
      const r = await client.rpc('slt_admin_update_user', { target_id, details, expected_revision });
      if (r.error) throw r.error;
      return r.data;
    },
    async createUser(email, details) {
      const r = await client.functions.invoke('slt-users', { body: { email, details } });
      if (r.error) {
        let detail;
        try { detail = await r.error.context?.json(); } catch {}
        throw new Error(detail?.error || 'Não foi possível confirmar o cadastro. Atualize a lista antes de repetir.');
      }
      return r.data;
    },
    async resetUserPassword(target_id) {
      const r = await client.functions.invoke('slt-users', { body: { action: 'reset_password', target_id } });
      if (r.error) {
        let detail;
        try { detail = await r.error.context?.json(); } catch {}
        throw new Error(detail?.error || 'Não foi possível redefinir a senha. Atualize a lista e tente novamente.');
      }
      return r.data;
    },
    save: snapshot => queue.save(snapshot),
    acceptInitialState: snapshot => queue.acceptInitialState(snapshot),
    async logout() {
      try { await queue.flush(); } catch { return; }
      await client.auth.signOut();
      location.reload();
    },
    async saveAttachment(record) {
      if (record.blob.size > 10485760) throw new Error('O limite por anexo é 10 MB.');
      const result = await client.from('slt360_attachments').insert({ id: record.id, nome: record.nome, tipo: record.tipo, tamanho: record.tamanho, module: record.module });
      if (result.error) throw result.error;
      const upload = await client.storage.from('slt360-attachments').upload(record.id, record.blob, { upsert: false, contentType: record.blob.type || 'application/octet-stream' });
      if (upload.error) throw upload.error;
    },
    async readAttachment(id) {
      const info = await client.from('slt360_attachments').select('nome,tipo').eq('id', id).single();
      if (info.error) throw info.error;
      const file = await client.storage.from('slt360-attachments').download(id);
      if (file.error) throw file.error;
      return { ...info.data, blob: file.data };
    },
  };

  const [echarts, chart] = await chartLibrariesPromise;
  globalThis.echarts = echarts;
  globalThis.Chart = chart.default;

  gate.hidden = true;
  gate.classList.remove('is-ready');
  gate.removeAttribute('aria-busy');
  shell.hidden = false;

  try {
    await import('./app.js');
    loaded = true;
  } catch (error) {
    shell.hidden = true;
    showAccessError('Não foi possível iniciar o sistema. Informe o responsável; a base não foi substituída.');
    throw error;
  }
}

function start() {
  if (!starting) {
    starting = startInternal().finally(() => { starting = null; });
  }
  return starting;
}

document.querySelector('#cloudLogin').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  button.disabled = true;
  message.textContent = 'Entrando…';
  try {
    const values = new FormData(form);
    const { error } = await client.auth.signInWithPassword({ email: String(values.get('email')).trim(), password: String(values.get('password')) });
    form.elements.password.value = '';
    if (error) {
      showLogin('Não foi possível entrar. Verifique seu e-mail, senha e conexão.');
      return;
    }
    await start();
  } catch {
    showLogin('Falha de conexão. Tente novamente.');
  } finally {
    button.disabled = false;
  }
});

signOutButton.onclick = async () => {
  await client.auth.signOut();
  location.reload();
};

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
  } finally {
    button.disabled = false;
  }
});

window.addEventListener('beforeunload', event => {
  if (queue?.dirty) {
    event.preventDefault();
    event.returnValue = '';
  }
});

client.auth.onAuthStateChange(event => {
  if (loaded && event === 'SIGNED_OUT') {
    shell.hidden = true;
    gate.hidden = false;
    location.reload();
  }
});

start().catch(() => {
  showAccessError('Não foi possível carregar o sistema. Verifique sua conexão.');
});
