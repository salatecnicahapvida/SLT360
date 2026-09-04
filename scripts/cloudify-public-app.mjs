const functionBodies = {
  loadState: `const loaded = normalizeState(baseState);
  loaded.works = arrayOrFallback(loaded.works).map((work) => {
    if (work?.ev) return work;
    return {
      ...work,
      ev: {
        id: \`EV-\${work?.id || ""}\`,
        status: "Sem EV",
        versaoAtual: 0,
        lines: [],
        versions: [],
        demandaIds: [],
        sicIds: [],
        _virtualEmptyEV: true,
      },
    };
  });
  return loaded;`,
  saveState: `return globalThis.SLT_CLOUD.save(persistedStatePayload());`,
  persistedStatePayload: `const works = arrayOrFallback(state.works).map((work) => {
    if (!work?.ev?._virtualEmptyEV) return work;
    const ev = work.ev;
    const hasBudgetData =
      Number(ev.versaoAtual || 0) > 0 ||
      (ev.lines || []).length > 0 ||
      (ev.versions || []).length > 0 ||
      (ev.demandaIds || []).length > 0 ||
      (ev.sicIds || []).length > 0 ||
      (ev.status && !["Sem EV", "Rascunho"].includes(ev.status));
    const cleanWork = { ...work };
    if (!hasBudgetData) {
      delete cleanWork.ev;
      return cleanWork;
    }
    cleanWork.ev = { ...ev };
    delete cleanWork.ev._virtualEmptyEV;
    if (cleanWork.ev.status === "Sem EV") cleanWork.ev.status = "Rascunho";
    return cleanWork;
  });
  return {
    works,
    demands: arrayOrFallback(state.demands),
    sics: arrayOrFallback(state.sics),
    contracts: arrayOrFallback(state.contracts),
    suppliers: arrayOrFallback(state.suppliers),
    funds: arrayOrFallback(state.funds),
    fundMovements: arrayOrFallback(state.fundMovements),
    budgetRevisions: arrayOrFallback(state.budgetRevisions),
    deletedDemands: arrayOrFallback(state.deletedDemands),
    deletedMaintenanceDemands: arrayOrFallback(state.deletedMaintenanceDemands),
    sprints: arrayOrFallback(state.sprints),
    history: arrayOrFallback(state.history),
    capexManualOiRows: arrayOrFallback(state.capexManualOiRows),
    projectDemands: arrayOrFallback(state.projectDemands),
    maintenanceDemands: arrayOrFallback(state.maintenanceDemands),
    clinicalAssets: arrayOrFallback(state.clinicalAssets),
    workRevisions: arrayOrFallback(state.workRevisions),
    evs: arrayOrFallback(state.evs),
    projectStatusOverrides: state.projectStatusOverrides || {},
    evTypologyOverrides: state.evTypologyOverrides || {},
    evReferenceTargets: state.evReferenceTargets || {},
    strategicTargetOverrides: state.strategicTargetOverrides || {},
    deletedEVRecordIds: arrayOrFallback(state.deletedEVRecordIds),
  };`,
  filteredEVWorks: `const works = arrayOrFallback(state.works).filter((work) => !work.ev?._virtualEmptyEV);
  const terms = normalizeSearchText([searchTerm, evAssistantQuery].filter(Boolean).join(" "))
    .trim()
    .split(/\\s+/)
    .filter(Boolean);
  if (!terms.length) return works;
  return works.filter((work) => terms.every((term) => workSearchText(work).includes(term)));`,
  normalizeUserProfile: `if (perfil === "Gestor") return "Gestão";
  return roleDefinitions[perfil] ? perfil : "Analista";`,
  defaultPasswordForProfile: `return "";`,
  normalizeAccessModules: `const valid = new Set(userAccessModules.map((module) => module.id));
  const source = Array.isArray(modules) ? modules : [];
  return [...new Set(source.map(String).filter((module) => valid.has(module)))];`,
  normalizeUserCredentials: `const perfil = normalizeUserProfile(user.perfil);
  const accessModules = normalizeAccessModules(user.accessModules || user.modulos || user.modules, perfil);
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    perfil,
    status: user.status || "Ativo",
    accessModules,
    accessViews: accessViewsForModules(accessModules),
    mustChangePassword: false,
    senhaProvisoria: false,
  };`,
  loadAuthSession: `return { userId: globalThis.SLT_CLOUD.profile.id };`,
  saveAuthSession: `/* Sessão gerenciada exclusivamente pelo Supabase Auth. */`,
  currentUser: `return globalThis.SLT_CLOUD.profile;`,
  loginUser: `return false;`,
  validateUserPassword: `return false;`,
  loginWithCredentials: `return false;`,
  logoutUser: `globalThis.SLT_CLOUD.logout();`,
  saveAttachmentRecord: `const modules = { projects: "projects", works: "budget", maintenance: "maintenance", clinical: "clinical", budget: "finance" };
  return globalThis.SLT_CLOUD.saveAttachment({ ...record, module: modules[viewModule(currentView)] || "budget" });`,
  readAttachmentRecord: `return globalThis.SLT_CLOUD.readAttachment(id);`,
};

const SAFE_DEFAULT_STATE = `{
  version: 8,
  works: [], demands: [], sics: [], contracts: [], suppliers: [],
  users: [], activeRole: "Admin", deletedDemands: [], deletedMaintenanceDemands: [],
  sprints: [], history: [], funds: [], fundMovements: [], budgetRevisions: [],
  maintenanceDemands: [], projectDemands: [], capexManualOiRows: [], clinicalAssets: [],
  workRevisions: [], evs: [], projectStatusOverrides: {}, evTypologyOverrides: {},
  evReferenceTargets: {}, strategicTargetOverrides: {}, deletedEVRecordIds: []
}`;

function skipQuoted(source, index, quote) {
  for (let i = index + 1; i < source.length; i += 1) {
    if (source[i] === "\\") {
      i += 1;
      continue;
    }
    if (source[i] === quote) return i;
  }
  throw new Error(`String não encerrada a partir de ${index}`);
}

function skipTemplate(source, index) {
  for (let i = index + 1; i < source.length; i += 1) {
    if (source[i] === "\\") {
      i += 1;
      continue;
    }
    if (source[i] === "`") return i;
  }
  throw new Error(`Template literal não encerrado a partir de ${index}`);
}

function matchingBrace(source, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === "'" || ch === '"') {
      i = skipQuoted(source, i, ch);
      continue;
    }
    if (ch === "`") {
      i = skipTemplate(source, i);
      continue;
    }
    if (ch === "/" && next === "/") {
      i = source.indexOf("\n", i + 2);
      if (i === -1) return source.length - 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      if (end === -1) throw new Error(`Comentário não encerrado a partir de ${i}`);
      i = end + 1;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`Bloco não encerrado a partir de ${openIndex}`);
}

function replaceFunction(source, name, body) {
  const pattern = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`);
  const match = pattern.exec(source);
  if (!match) throw new Error(`Função obrigatória não encontrada: ${name}`);
  const paramsClose = source.indexOf(")", match.index + match[0].length);
  if (paramsClose === -1) throw new Error(`Parâmetros não encerrados: ${name}`);
  const open = source.indexOf("{", paramsClose + 1);
  if (open === -1) throw new Error(`Corpo não encontrado: ${name}`);
  const close = matchingBrace(source, open);
  return `${source.slice(0, open + 1)}\n  ${body.replace(/\n/g, "\n  ")}\n${source.slice(close)}`;
}

function replaceConstObject(source, name, replacement) {
  const marker = `const ${name} =`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Constante obrigatória não encontrada: ${name}`);
  const open = source.indexOf("{", start + marker.length);
  if (open === -1) throw new Error(`Objeto de ${name} não encontrado`);
  const close = matchingBrace(source, open);
  return `${source.slice(0, open)}${replacement}${source.slice(close + 1)}`;
}

function insertBeforeFinalRender(source) {
  const marker = "render();";
  const index = source.lastIndexOf(marker);
  if (index === -1) throw new Error("Chamada final render() não encontrada");
  return `${source.slice(0, index)}globalThis.SLT_CLOUD.acceptInitialState(persistedStatePayload());\n${source.slice(index)}`;
}

export function cloudifyPublicApp(input) {
  let source = String(input || "").replace(/^\uFEFF/, "");
  source = replaceConstObject(source, "defaultState", SAFE_DEFAULT_STATE);
  for (const [name, body] of Object.entries(functionBodies)) {
    const exists = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`).test(source);
    if (!exists && ["saveAttachmentRecord", "readAttachmentRecord"].includes(name)) continue;
    source = replaceFunction(source, name, body);
  }
  source = source.replaceAll(
    'work.ev.status !== "Completo"',
    '!work.ev?._virtualEmptyEV && work.ev.status !== "Completo"'
  );
  source = insertBeforeFinalRender(source);

  const forbidden = /admin360|gestao360|analista360|orcamento360|projetos360|Novo Hospital Ibirapuera|\bOBR-\d{4}-\d{3}\b|\bDEM-\d{3}\b/;
  if (forbidden.test(source)) {
    throw new Error("A adaptação cloud ainda contém conteúdo local de demonstração.");
  }
  return source;
}
