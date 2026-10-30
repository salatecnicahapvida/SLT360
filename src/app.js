import { renderStrategicFinance, bindCapex2026Import } from './strategic-finance-2026.js';
import { csvCell } from './csv.js';
import { evAdditiveSummary } from './ev-additives.js';
import { businessDate } from './dates.js';
import { renderUsersPanel, mountUsersAdmin } from './users-admin.js';
import { renderBackupsPanel, mountBackups } from './backups-ui.js';
import { mountSicApprovals } from './sic-approvals.js';
import {
  approvalSnapshotFor,
  approvalWeekStatus,
  matchApprovalCard,
  nextApprovalWeekDraft,
  portfolioApprovedAdditives,
  portfolioEVWithoutRisk,
  reconcileApprovalWeeks,
  selectableApprovalWeeks,
} from './sic-director-queue.js';
let unmountSicApprovals = () => {};
const STORAGE_KEY = "slt360-state-v8-full-ev-project-reset";
const LAST_VIEW_STORAGE_KEY = "slt360-last-view-v1";
const LAST_UI_MODULE_STORAGE_KEY = "slt360-last-ui-module-v1";

const MIRO_FLOW_URL = "https://miro.com/app/board/uXjVKxg3MFc=/";
const AUTH_SESSION_KEY = "slt360-auth-session-v1";
const ATTACHMENT_DB_NAME = "slt360-attachments-v1";
const ATTACHMENT_STORE_NAME = "files";

const INVESTMENT_PLAN_YEAR = "2026";

const viewAliases = {
  worksHome: "worksOperational",
  worksPortfolio: "portfolio",
  worksHistory: "portfolio",
  ev: "portfolio",
  worksIntelligence: "worksManagement",
  worksOverview: "worksOperational",
  projectsOverview: "projectsHome",
  projectsPlan: "projectsPortfolio",
  investmentPlan: "projectsPortfolio",
  maintenanceOverview: "maintenance",
  clinicalOverview: "clinical",
  fundsOverview: "budget",
  fundsBalances: "budget",
};

const strategicCostTargets = [
  {
    id: "hospital-alta",
    label: "Hospital alta complexidade",
    targetMax: 5000,
    targetLabel: "atÃ© R$ 5.000/mÂ²",
  },
  {
    id: "hospital-media",
    label: "Hospital mÃ©dia complexidade",
    targetMin: 3500,
    targetMax: 4000,
    targetLabel: "R$ 3.500 a R$ 4.000/mÂ²",
  },
  {
    id: "pronto-atendimento",
    label: "Pronto atendimento",
    targetMax: 3000,
    targetLabel: "atÃ© R$ 3.000/mÂ²",
  },
  {
    id: "clinicas-diagnosticos-labs-teas",
    label: "ClÃ­nicas, diagnÃ³sticos, laboratÃ³rios e TEAs",
    targetMax: 2000,
    targetLabel: "atÃ© R$ 2.000/mÂ²",
  },
];

function strategicTargetLabel(target) {
  if (target.targetMin) return `${money(target.targetMin)} a ${money(target.targetMax)}/mÂ²`;
  return `atÃ© ${money(target.targetMax)}/mÂ²`;
}

function effectiveStrategicCostTargets() {
  return strategicCostTargets.map((target) => {
    const override = state?.strategicTargetOverrides?.[target.id] || {};
    const effective = {
      ...target,
      targetMin: Number(override.targetMin) || Number(target.targetMin) || 0,
      targetMax: Number(override.targetMax) || Number(target.targetMax) || 0,
    };
    return { ...effective, targetLabel: strategicTargetLabel(effective) };
  });
}

function strategicTargetById(id) {
  return effectiveStrategicCostTargets().find((target) => target.id === id) || null;
}

let hapcapexReference = globalThis.HAPCAPEX_REFERENCE || {capexInicial:0, contingenciamentos:0, aportesExtras:0, capexAtual:0, previstoHistorico:{}};

const columns = [
  { id: "pullPlanning", label: "Pull Planning" },
  { id: "fazer", label: "Fazer" },
  { id: "fazendo", label: "Fazendo" },
  { id: "pausado", label: "Pausado" },
  { id: "validacaoObras", label: "Aguardando ValidaÃ§Ã£o Obras" },
  { id: "validadoObras", label: "Validado Obras" },
  { id: "aprovacaoDiretoria", label: "Aguardando AprovaÃ§Ã£o Diretoria" },
  { id: "aprovadoDiretoria", label: "Aprovado Diretoria" },
  { id: "concluido", label: "ConcluÃ­do" },
  { id: "cancelado", label: "Cancelado" },
];
const demandValidationColumnIds = ["validacaoObras", "validadoObras", "aprovacaoDiretoria"];

const worksViewIds = [
  "worksOperational",
  "worksManagement",
  "worksStrategic",
  "worksStrategicFinance",
  "portfolio",
  "sics",
  "sicApprovals",
];

const worksNavItems = [
  { view: "worksOperational", label: "VisÃ£o Operacional" },
  { view: "worksManagement", label: "VisÃ£o Gerencial" },
  { view: "worksStrategic", label: "VisÃ£o EstratÃ©gica" },
  { view: "worksStrategicFinance", label: "VisÃ£o EstratÃ©gico-Financeira" },
  { view: "portfolio", label: "PortfÃ³lio de Obras" },
  { view: "sics", label: "Estudo de SIC's" },
  { view: "sicApprovals", label: "AprovaÃ§Ã£o de SIC's" },
];

const projectColumns = [
  { id: "planejado", label: "Planejado", tone: "blue" },
  { id: "emProjetos", label: "Em projetos", tone: "orange" },
  { id: "salaTecnica", label: "Entregue para ST", tone: "green" },
  { id: "atrasado", label: "Atrasado", tone: "red" },
  { id: "concluido", label: "ConcluÃ­do", tone: "green" },
  { id: "paralisado", label: "Paralisado", tone: "gray" },
];

const projectDemandTypes = [
  {
    id: "planoInvestimento",
    label: "Plano de investimento",
    shortLabel: "Plano",
    detail: "Demanda vinculada a uma obra do Plano de Investimento.",
  },
  {
    id: "sdr",
    label: "SDR - SolicitaÃ§Ã£o de RegulatÃ³rio",
    shortLabel: "SDR",
    detail: "SolicitaÃ§Ã£o originada pela VISA ou por outro Ã³rgÃ£o regulador.",
  },
  {
    id: "sic",
    label: "SIC - Ajuste de projetos",
    shortLabel: "SIC",
    detail: "Ajuste de projeto solicitado por Obras.",
  },
  {
    id: "avulsa",
    label: "Demanda Avulsa",
    shortLabel: "Avulsa",
    detail: "SolicitaÃ§Ã£o de Ã¡rea terceira demandante.",
  },
];

function demandProjectOptions() {
  return [
    { id: "ARQ", label: "Arquitetura" },
    { id: "ELE", label: "InstalaÃ§Ãµes ElÃ©tricas" },
    { id: "HID", label: "InstalaÃ§Ãµes HidrosanitÃ¡rias" },
    { id: "ELO", label: "InstalaÃ§Ãµes de Dados e Voz" },
    { id: "SUB", label: "SubestaÃ§Ã£o" },
    { id: "GMD", label: "InstalaÃ§Ãµes de Gases Medicinais" },
    { id: "SCI", label: "Sistema de Combate a IncÃªndio" },
    { id: "CLI", label: "InstalaÃ§Ãµes de ClimatizaÃ§Ã£o e ExaustÃ£o" },
    { id: "SPDA", label: "InstalaÃ§Ãµes de SPDA" },
    { id: "STR", label: "Estrutura" },
    { id: "FUN", label: "FundaÃ§Ãµes" },
    { id: "DRE", label: "Drenagem" },
  ];
}

const projectViewIds = [
  "projectsHome",
  "projectsPortfolio",
  "projectsPlan",
  "projectsOperational",
  "projectsManagement",
  "projectsStrategic",
];

const projectNavItems = [
  { view: "projectsHome", label: "InÃ­cio" },
  { view: "projectsPortfolio", label: "PortfÃ³lio" },
  { view: "projectsOperational", label: "Operacional" },
  { view: "projectsManagement", label: "Gerencial" },
  { view: "projectsStrategic", label: "EstratÃ©gica" },
];

const maintenanceColumns = [
  { id: "naoIniciado", label: "NÃ£o iniciada", tone: "blue", pipefy: ["NÃƒO INICIADO", "NAO INICIADO"] },
  { id: "emDuplicidade", label: "Em duplicidade", tone: "gray", pipefy: ["EM DUPLICIDADE"] },
  { id: "andamento", label: "Andamento", tone: "green", pipefy: ["ANDAMENTO"] },
  { id: "validacao", label: "ValidaÃ§Ã£o", tone: "orange", pipefy: ["VALIDAÃ‡ÃƒO", "VALIDACAO"] },
  { id: "devolvido", label: "Devolvido", tone: "red", pipefy: ["DEVOLVIDO"] },
  { id: "postado", label: "Postado", tone: "blue", pipefy: ["POSTADO"] },
  { id: "postadoComRc", label: "Postado com RC", tone: "cyan", pipefy: ["POSTADO COM RC"] },
  { id: "cardsArquivados", label: "Cards arquivados", tone: "gray", pipefy: ["ARQUIVADO", "CARDS ARQUIVADOS"] },
  { id: "finalizada", label: "Finalizada", tone: "green", pipefy: ["FINALIZADO", "FINALIZADA"] },
];

const maintenanceViewIds = [
  "maintenance",
  "maintenanceOperational",
  "maintenanceReports",
  "maintenanceTimeline",
  "maintenanceExecutive",
  "maintenanceSettings",
];

const clinicalViewIds = [
  "clinical",
  "clinicalOperational",
  "clinicalReports",
  "clinicalTimeline",
  "clinicalExecutive",
  "clinicalSettings",
];

const maintenanceNavItems = [
  { view: "maintenance", label: "InÃ­cio" },
  { view: "maintenanceOperational", label: "Operacional" },
  { view: "maintenanceReports", label: "BI ManutenÃ§Ã£o" },
  { view: "maintenanceTimeline", label: "Linha do Tempo" },
  { view: "maintenanceExecutive", label: "Executiva" },
  { view: "maintenanceSettings", label: "ConfiguraÃ§Ãµes" },
];

const clinicalNavItems = [
  { view: "clinical", label: "InÃ­cio" },
  { view: "clinicalOperational", label: "Operacional" },
  { view: "clinicalReports", label: "BI Eng. ClÃ­nica" },
  { view: "clinicalTimeline", label: "Linha do Tempo" },
  { view: "clinicalExecutive", label: "Executiva" },
  { view: "clinicalSettings", label: "Parque TecnolÃ³gico" },
];

const moduleHeaders = {
  projects: {
    eyebrow: "MÃ³dulo 01",
    label: "Projetos 360",
    logo: "assets/module-icon-projetos.png",
    tone: "cyan",
  },
  works: {
    eyebrow: "MÃ³dulo 01",
    label: "Obras",
    logo: "assets/module-icon-obras.png",
    tone: "blue",
  },
  maintenance: {
    eyebrow: "MÃ³dulo 02",
    label: "ManutenÃ§Ã£o",
    logo: "assets/module-icon-manutencao.png",
    tone: "orange",
  },
  clinical: {
    eyebrow: "MÃ³dulo 03",
    label: "Eng. ClÃ­nica",
    logo: "assets/module-icon-clinica.png",
    tone: "green",
  },
  budget: {
    eyebrow: "MÃ³dulo 04",
    label: "Controle de Verba",
    logo: "assets/module-icon-verbas.png",
    tone: "red",
  },
};

const roleDefinitions = {Admin:{label:"Admin",description:"AdministraÃ§Ã£o do sistema"},Gestor:{label:"Gestor",description:"Acesso conforme permissÃµes por mÃ³dulo"},Analista:{label:"Analista",description:"Acesso conforme permissÃµes por mÃ³dulo"}};

const userAccessModules = [
  {
    id: "projects",
    label: "Projetos 360",
    detail: "InÃ­cio, portfÃ³lio, operacional, gerencial e estratÃ©gica.",
    views: projectViewIds,
  },
  {
    id: "works",
    label: "Obras",
    detail: "Operacional, gerencial, estratÃ©gica, portfÃ³lio com EVs e estudo de SIC's.",
    views: worksViewIds,
  },
  {
    id: "maintenance",
    label: "ManutenÃ§Ã£o",
    detail: "InÃ­cio, operacional, BI, linha do tempo e executiva.",
    views: maintenanceViewIds,
  },
  {
    id: "clinical",
    label: "Eng. ClÃ­nica",
    detail: "InÃ­cio, operacional, BI, linha do tempo e executiva.",
    views: clinicalViewIds,
  },
  {
    id: "budget",
    label: "Controle de Verbas",
    detail: "CAPEX/OPEX, transferÃªncias e curva de CAPEX.",
    views: ["budget"],
  },
  {
    id: "settings",
    label: "ConfiguraÃ§Ã£o",
    detail: "UsuÃ¡rios, sprints, equipe, dicionÃ¡rios e auditoria.",
    views: ["settings", "team", "analytics", "suppliers", "worksSettings", "maintenanceSettings", "clinicalSettings"],
  },
];

const baseDisciplines = [
  ["fundacoes-e-contencoes", "FundaÃ§Ãµes e ContenÃ§Ãµes", "CustosDaObra", true],
  ["estruturas", "Estruturas", "CustosDaObra", true],
  ["adequacoes-civis", "AdequaÃ§Ãµes Civis", "CustosDaObra", true],
  ["fachadas", "Fachadas", "CustosDaObra", true],
  ["instalacoes-eletricas-e-spda", "InstalaÃ§Ãµes ElÃ©tricas e SPDA", "CustosDaObra", true],
  ["instalacoes-hidrossanitarias", "InstalaÃ§Ãµes HidrossanitÃ¡rias", "CustosDaObra", true],
  ["instalacoes-de-gases-medicinais", "InstalaÃ§Ãµes de Gases Medicinais", "CustosDaObra", true],
  ["instalacoes-de-combate-a-incendio", "InstalaÃ§Ãµes de Combate a IncÃªndio", "CustosDaObra", true],
  ["instalacoes-de-climatizacao-e-exaustao", "InstalaÃ§Ãµes de ClimatizaÃ§Ã£o e ExaustÃ£o", "CustosDaObra", true],
  ["dados-voz-cftv-chamada", "Infraestrutura de Dados/Voz/Seg. Patrimonial/CFTV/Chamada", "CustosDaObra", true],
  ["custos-indiretos", "Custos Indiretos", "CustosDaObra", true],
  ["site-planning", "Site Planning", "CustosDaObra", true],
  ["diversos", "Diversos", "CustosDaObra", true],
  ["instalacoes-de-glp", "InstalaÃ§Ãµes de GLP", "CustosDaObra", true],
  ["projetos-tecnicos", "Projetos TÃ©cnicos", "OutrasCategorias", true],
  ["projetos-legalizacao", "Projetos LegalizaÃ§Ã£o", "OutrasCategorias", true],
  ["dados-e-voz-seguranca-patrimonial-chamada-hospitalar", "Dados e Voz/SeguranÃ§a Patrimonial/Chamada Hospitalar", "OutrasCategorias", true],
  ["equipamentos-de-climatizacao", "Equipamentos de ClimatizaÃ§Ã£o", "OutrasCategorias", true],
  ["artefatos-inox", "Artefatos em Inox", "OutrasCategorias", true],
  ["marcenaria", "Marcenaria", "OutrasCategorias", true],
  ["reguas-medicinais", "RÃ©guas Medicinais", "OutrasCategorias", true],
  ["gerador-subestacao-transformador-cubiculos", "Gerador/SubestaÃ§Ã£o/Transformador/CubÃ­culos", "OutrasCategorias", true],
  ["elevadores-plataforma-elevatoria", "Elevadores/Plataforma ElevatÃ³ria", "OutrasCategorias", true],
  ["compressor-bomba-de-vacuo-driox", "Compressor/Bomba de VÃ¡cuo/Driox", "OutrasCategorias", true],
  ["it-medico-nobreak", "IT MÃ©dico/Nobreak", "OutrasCategorias", true],
  ["ete-eta", "ETE/ETA", "OutrasCategorias", true],
  ["correio-pneumatico", "Correio PneumÃ¡tico", "OutrasCategorias", true],
  ["controle-acessos", "Controle de Acessos", "OutrasCategorias", true],
  ["planejamento-obras", "Planejamento de Obras", "OutrasCategorias", true],
  ["contas-consumo", "Contas de Consumo", "OutrasCategorias", true],
  ["comunicacao-visual-externa-e-interna", "ComunicaÃ§Ã£o Visual Externa e Interna", "OutrasCategorias", true],
  ["quadros-eletricos", "Quadros ElÃ©tricos", "OutrasCategorias", true],
  ["sics", "SIC's", "Sics", false],
  ["sistemas-de-automacao", "Sistemas de AutomaÃ§Ã£o", "OutrasCategorias", true],
  ["taxa-risco", "Taxa de Risco (5%)", "OutrasCategorias", false],
  ["blindagem", "Blindagem", "OutrasCategorias", true],
  ["paisagismo-e-ou-compensacao-ambiental", "Paisagismo e/ou CompensaÃ§Ã£o Ambiental", "OutrasCategorias", true],
  ["camara-fria", "CÃ¢mara Fria", "OutrasCategorias", true],
  ["outras-linhas-ev", "Outras Linhas do EV", "OutrasCategorias", false],
  ["sistema-de-aquecimento-de-agua", "Sistema de Aquecimento de Ãgua", "OutrasCategorias", true],
].map(([id, nome, categoria, selecionavelParaSIC], index) => ({
  id,
  nome,
  categoria,
  posicao: index + 1,
  ativo: true,
  selecionavelParaSIC,
}));

const disciplineAliases = {
  "fundacoes-contencoes": "fundacoes-e-contencoes",
  "instalacoes-eletricas-spda": "instalacoes-eletricas-e-spda",
  "gases-medicinais": "instalacoes-de-gases-medicinais",
  "combate-incendio": "instalacoes-de-combate-a-incendio",
  "instalacoes-spda": "instalacoes-eletricas-e-spda",
  "instalacoes-de-spda": "instalacoes-eletricas-e-spda",
  "climatizacao-exaustao": "instalacoes-de-climatizacao-e-exaustao",
  glp: "instalacoes-de-glp",
  "dados-voz-seguranca-chamada": "dados-e-voz-seguranca-patrimonial-chamada-hospitalar",
  "equipamentos-climatizacao": "equipamentos-de-climatizacao",
  "gerador-subestacao": "gerador-subestacao-transformador-cubiculos",
  elevadores: "elevadores-plataforma-elevatoria",
  "compressor-vacuo-driox": "compressor-bomba-de-vacuo-driox",
  "comunicacao-visual": "comunicacao-visual-externa-e-interna",
  automacao: "sistemas-de-automacao",
  paisagismo: "paisagismo-e-ou-compensacao-ambiental",
  "sistema-aquecimento-agua": "sistema-de-aquecimento-de-agua",
};

const baseRegions = ["Norte", "Nordeste", "Centro Oeste", "Sudeste", "Sul"];
const baseStates = [
  ["AC", "Acre", "Norte"], ["AL", "Alagoas", "Nordeste"], ["AP", "AmapÃ¡", "Norte"],
  ["AM", "Amazonas", "Norte"], ["BA", "Bahia", "Nordeste"], ["CE", "CearÃ¡", "Nordeste"],
  ["DF", "Distrito Federal", "Centro Oeste"], ["ES", "EspÃ­rito Santo", "Sudeste"],
  ["GO", "GoiÃ¡s", "Centro Oeste"], ["MA", "MaranhÃ£o", "Nordeste"], ["MT", "Mato Grosso", "Centro Oeste"],
  ["MS", "Mato Grosso do Sul", "Centro Oeste"], ["MG", "Minas Gerais", "Sudeste"], ["PA", "ParÃ¡", "Norte"],
  ["PB", "ParaÃ­ba", "Nordeste"], ["PR", "ParanÃ¡", "Sul"], ["PE", "Pernambuco", "Nordeste"],
  ["PI", "PiauÃ­", "Nordeste"], ["RJ", "Rio de Janeiro", "Sudeste"], ["RN", "Rio Grande do Norte", "Nordeste"],
  ["RS", "Rio Grande do Sul", "Sul"], ["RO", "RondÃ´nia", "Norte"], ["RR", "Roraima", "Norte"],
  ["SC", "Santa Catarina", "Sul"], ["SP", "SÃ£o Paulo", "Sudeste"], ["SE", "Sergipe", "Nordeste"],
  ["TO", "Tocantins", "Norte"],
];

const canonicalCategoryMap = new Map([
  ["adequacao regulatoria", "AdequaÃ§Ã£o RegulatÃ³ria"],
  ["eficiencia operacional", "EficiÃªncia Operacional"],
  ["fachada", "Fachada"],
  ["obra emergencial", "Obra Emergencial"],
  ["obra estrategica", "Obra EstratÃ©gica"],
  ["suficiencia de rede", "SuficiÃªncia de Rede"],
  ["verticalizacao", "VerticalizaÃ§Ã£o"],
  ["venda de servico", "Venda de ServiÃ§o"],
  ["venda de servicos", "Venda de ServiÃ§o"],
  ["padronizacao de unidade", "PadronizaÃ§Ã£o de Unidade"],
  ["risco assistencial", "Risco Assistencial"],
]);
const removedCategoryKeys = new Set([
  "historico importado", "historico importadado", "nao informada", "nao informado", "ambiental",
  "outro", "outros", "otro", "otros",
]);
const workTypologyOptions = Object.freeze([
  "Nova Unidade",
  "Retrofit Unidade Existente",
  "AmpliaÃ§Ã£o Unidade Existente",
  "Retrofit + AmpliaÃ§Ã£o",
]);
const canonicalTypologyMap = new Map([
  ["nova unidade", "Nova Unidade"],
  ["retrofit", "Retrofit Unidade Existente"],
  ["retrofit unidade existente", "Retrofit Unidade Existente"],
  ["retrofit de unidade existente", "Retrofit Unidade Existente"],
  ["ampliacao", "AmpliaÃ§Ã£o Unidade Existente"],
  ["ampliacao ue", "AmpliaÃ§Ã£o Unidade Existente"],
  ["ampliacao unidade existente", "AmpliaÃ§Ã£o Unidade Existente"],
  ["ampliacao de unidade existente", "AmpliaÃ§Ã£o Unidade Existente"],
  ["retrofit + ampliacao", "Retrofit + AmpliaÃ§Ã£o"],
  ["retrofit ampliacao", "Retrofit + AmpliaÃ§Ã£o"],
  ["retrofit e ampliacao", "Retrofit + AmpliaÃ§Ã£o"],
]);

function canonicalWorkCategory(value) {
  const label = String(value || "").trim();
  const key = normalizeSearchText(label);
  if (!key || removedCategoryKeys.has(key)) return "";
  return canonicalCategoryMap.get(key) || label;
}

function canonicalWorkTypology(value) {
  const key = normalizeSearchText(value).trim();
  if (key.includes("retrofit") && key.includes("ampliacao")) return "Retrofit + AmpliaÃ§Ã£o";
  return canonicalTypologyMap.get(key) || "";
}

function canonicalStateCode(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const validCodes = new Set(baseStates.map(([code]) => code));
  const code = raw.toUpperCase().split(/[^A-Z]+/).find((part) => validCodes.has(part));
  if (code) return code;
  const normalized = ` ${normalizeSearchText(raw)} `;
  return baseStates.find(([, label]) => normalized.includes(` ${normalizeSearchText(label)} `))?.[0] || "";
}

function canonicalStateRegion(code) {
  return baseStates.find(([stateCode]) => stateCode === canonicalStateCode(code))?.[2] || "";
}

function normalizeEVLines(lines = []) {
  const merged = new Map();
  arrayOrFallback(lines).forEach((sourceLine) => {
    const disciplineId = canonicalDisciplineId(sourceLine.disciplinaId);
    const line = { ...sourceLine, disciplinaId: disciplineId };
    const current = merged.get(disciplineId);
    if (!current) {
      merged.set(disciplineId, line);
      return;
    }
    ["valorOrcado", "valorContratado", "quantidade", "valorUnitario"].forEach((field) => {
      current[field] = Number(current[field] || 0) + Number(line[field] || 0);
    });
  });
  return [...merged.values()];
}

function normalizeWorkTaxonomy(work = {}) {
  const uf = canonicalStateCode(work.uf || work.estado);
  const ev = work.ev ? {
    ...work.ev,
    lines: normalizeEVLines(work.ev.lines),
    versions: arrayOrFallback(work.ev.versions).map((version) => ({
      ...version,
      diffPorDisciplina: arrayOrFallback(version.diffPorDisciplina).map((diff) => ({ ...diff, disciplinaId: canonicalDisciplineId(diff.disciplinaId) })),
    })),
  } : work.ev;
  return {
    ...work,
    uf,
    estado: uf,
    regiao: canonicalStateRegion(uf) || String(work.regiao || "").trim(),
    classificacaoObra: canonicalWorkCategory(work.classificacaoObra),
    tipologiaObra: canonicalWorkTypology(work.tipologiaObra),
    ev,
  };
}

const configurationCatalogDefinitions = {
  discipline: { label: "Disciplinas do EV", singular: "disciplina" },
  category: { label: "Categorias de obra", singular: "categoria" },
  typology: { label: "Tipologias de obra", singular: "tipologia" },
  year: { label: "Anos de obra", singular: "ano" },
  region: { label: "RegiÃµes", singular: "regiÃ£o" },
  state: { label: "Estados", singular: "estado" },
};

const defaultState = {
  version: 8,
  works: [], demands: [], sics: [], contracts: [], suppliers: [],
  users: [], activeRole: "Admin", deletedDemands: [], deletedMaintenanceDemands: [],
  sprints: [], history: [], funds: [], fundMovements: [], budgetRevisions: [],
  maintenanceDemands: [], projectDemands: [], capexManualOiRows: [], clinicalAssets: [],
  workRevisions: [], evs: [], projectStatusOverrides: {}, evTypologyOverrides: {},
  evReferenceTargets: {}, strategicTargetOverrides: {}, deletedEVRecordIds: [], deletedEVArchive: [], configurationCatalog: []
};

function importSignature(imported = {}) {
  return [
    imported.storageKey || STORAGE_KEY,
    imported.source || "base-interna",
    imported.sourceSheet || "",
    imported.schemaSource || "",
    imported.version || "",
    imported.works?.length || 0,
    imported.history?.[0]?.timestamp || "",
  ].filter(Boolean).join("|");
}

function createBaseState(imported = {}) {
  const importedMaintenance = maintenanceDemandsFromImportedData(globalThis.MAINTENANCE_DATA?.records || []);
  return {
    ...defaultState,
    ...imported,
    importSignature: importSignature(imported),
    users: imported.users || defaultState.users,
    activeRole: imported.activeRole || defaultState.activeRole,
    sicBi: globalThis.SIC_BI_DATA || { records: [], demandSummary: [] },
    investmentPlan: globalThis.INVESTMENT_PLAN_DATA || { source: "", sheet: "", records: [] },
    unitRegistry: globalThis.UNIT_REGISTRY_DATA || { source: "", sheet: "", records: [] },
    maintenanceBi: globalThis.MAINTENANCE_DATA || { source: "", sheet: "", records: [] },
    capexControl: globalThis.CAPEX_CONTROL_DATA || { source: "", baseOi: [], dePara: [], transferencias: [], consumo: {} },
    commissionObras: globalThis.COMMISSION_OBRAS_DATA || { source: "", sheet: "", summary: {}, records: [] },
    maintenanceDemands: mergeMaintenanceDemands(imported.maintenanceDemands || [], importedMaintenance),
  };
}

let baseState = createBaseState(globalThis.TRACO_IMPORTED_STATE || {});

const demandFormQueryKeys = [
  "analistaResponsavel",
  "observacao",
  "descricao",
  "tipo",
  "sprintId",
  "coluna",
  "prioridade",
  "dataPrevistaInicio",
  "dataInicioReal",
  "dataPrevEnvioValidacaoObras",
  "dataEnvioRealValidacaoObras",
  "dataValidacaoObras",
  "dataPrevistaEntrega",
  "dataEntregaReal",
  "nota",
];

function cleanLeakedDemandQueryParams() {
  if (!window.location.search) return;
  const params = new URLSearchParams(window.location.search);
  const looksLikeDemandSubmit = demandFormQueryKeys.some((key) => params.has(key));
  if (!looksLikeDemandSubmit) return;
  const cleanUrl = `${window.location.origin}${window.location.pathname}${window.location.hash || ""}`;
  window.history.replaceState({}, document.title, cleanUrl);
}

cleanLeakedDemandQueryParams();

let state = loadState();
let authSession = loadAuthSession();
let currentView = "dashboard";
let viewNavigationRequest = 0;
let selectedWorkId = state.works[0]?.id || "";
let searchTerm = "";
let operationalViewMode = "kanban";
let demandPointerDragState = null;
let demandDragSuppressClickUntil = 0;
let pendingDemandCompletion = null;
let pendingDirectSicCompletion = null;
const unassignedAnalystFilterValue = "__sem_analista__";
const unassignedSprintFilterValue = "__sem_sprint__";
let operationalFilters = {
  query: "",
  sprintId: [],
  analyst: [],
  type: [],
  status: [],
  validationGroup: false,
  engineeringMeeting: [],
  punctuality: [],
  dateFrom: "",
  dateTo: "",
};
let managementStatusFilter = "all";
let strategicHistoricalQuery = "";
let strategicHistoricalFilters = { year: "", region: "", status: "" };
let evAssistantQuery = "";
let evHistoricalFilters = { query: "", year: "", typology: "", discipline: "", technician: "" };
let evHistoricalSort = { key: "", direction: "" };
let sltINCCCalculator = { value: 0, basePeriod: "2023-12" };
let sicViewMode = "report";
let sicSearchQuery = "";
let dashboardReportsFilter = "active";
let budgetViewMode = "inicio";
let budgetFilters = {
  query: "",
  categoriaOrc: "",
  status: "",
  centroFinanceiro: "",
};
let budgetTransferCheck = null;
let transferFlowViewMode = "oi";
let transferTrackerQuery = "";
let transferTrackerQuery2 = "";
let transferAllSearch = "";
let transferNetSearch = "";
let transferMonthFilter = "";
let transferAllPage = 1;
let transferNetPage = 1;
let capexCurveTableMode = "previsto";
let capexCurveScope = "obras";
let capexCurveMonthFilter = [];
let transferEchartInstances = {};
let hapcapexChartInstances = {};
let sicDashboardModulePromise = null;
let maintenanceViewMode = "kanban";
let maintenanceFilters = {
  query: "",
  sprint: "",
  analyst: "",
  phase: "",
  expense: "",
  costCenter: "",
  unitType: "",
};
let clinicalViewMode = "kanban";
let clinicalParkQuery = "";
let clinicalFilters = {
  query: "",
  sprint: "",
  analyst: "",
  phase: "",
  expense: "",
  equipment: "",
  unitType: "",
};
let haptecOpen = false;
let haptecMessages = [];
let demandWizardDraft = {};
let workModalReturnMode = "";
let workModalPlanDraft = null;
function createPortfolioQuickFilters() {
  return {
    query: "",
    year: "",
    categoria: "",
    tipoUnidade: "",
    tipologia: "",
    regional: "",
    uf: "",
    evStatus: "",
  };
}

let portfolioQuickFilters = createPortfolioQuickFilters();
// Ordem inicial da carteira: ano mais recente; em empate, maior cÃ³digo de obra.
let portfolioSort = { key: "year", direction: "desc" };
let investmentPlanFilters = {
  query: "",
  etapa: "Projetos",
  status: "",
  regiao: "",
  dateFrom: "",
  dateTo: "",
};
let strategicEVDecisionFilters = {
  query: "",
  status: "",
  targetId: "",
  year: "",
};
let strategicEVFilters = {
  year: "",
  typology: "",
  discipline: "",
};
let projectPlanFilters = {
  query: "",
  etapa: "",
  status: "",
  regiao: "",
  dateFrom: "",
  dateTo: "",
};
let projectOperationalFilters = {
  query: "",
  status: "",
  regiao: "",
  type: "",
  punctuality: "",
};
let projectOperationalViewMode = "kanban";
let portfolioFilters = {
  idApp: "",
  codigo: "",
  nome: "",
  tipoUnidade: "",
  cidadeUf: "",
  regional: "",
  prazo: "",
  classificacao: "",
  tipologia: "",
  areaEquivalente: "",
  areaConstruida: "",
  sap: "",
  cnpj: "",
  endereco: "",
  evStatus: "",
  capex: "",
  risco: "",
};

const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modalRoot");
const toast = document.querySelector("#toast");
const sortableTableObserver = typeof MutationObserver !== "undefined" ? new MutationObserver(() => enhanceSortableTables()) : null;
let kanbanScrollObservers = [];
sortableTableObserver?.observe(modalRoot, { childList: true, subtree: true });

const EV_LIFECYCLE_STATUSES = ["Sem EV", "Incompleto", "Completo"];

function virtualEmptyEV(work) {
  return {
    id: `EV-${work?.id || ""}`,
    status: "Sem EV",
    versaoAtual: 0,
    lines: [],
    versions: [],
    demandaIds: [],
    sicIds: [],
    anexos: [],
    _virtualEmptyEV: true,
  };
}

function evHasBudgetData(ev) {
  if (!ev) return false;
  return (
    Number(ev.versaoAtual || 0) > 0
    || arrayOrFallback(ev.lines).length > 0
    || arrayOrFallback(ev.versions).length > 0
    || arrayOrFallback(ev.demandaIds).length > 0
    || arrayOrFallback(ev.sicIds).length > 0
    || arrayOrFallback(ev.anexos).length > 0
  );
}

function effectiveEVStatus(work) {
  if (!work?.ev || work.ev._virtualEmptyEV || !evHasBudgetData(work.ev)) return "Sem EV";
  return work.ev.status === "Completo" ? "Completo" : "Incompleto";
}

function normalizeWorkEVLifecycle(work) {
  if (!work?.ev || !evHasBudgetData(work.ev)) return { ...work, ev: virtualEmptyEV(work) };
  const normalized = { ...work, ev: { ...work.ev } };
  normalized.ev.status = normalized.ev.status === "Completo" ? "Completo" : "Incompleto";
  delete normalized.ev._virtualEmptyEV;
  return normalized;
}

function loadState() {
  const loaded = normalizeState(baseState);
  loaded.works = arrayOrFallback(loaded.works).map(normalizeWorkEVLifecycle);
  return loaded;
}

function normalizeState(saved) {
  const base = clone(baseState);
  const sprints = arrayOrFallback(saved.sprints, base.sprints);
  const savedMaintenanceDemands = Array.isArray(saved.localMaintenanceDemands)
    ? saved.localMaintenanceDemands
    : arrayOrFallback(saved.maintenanceDemands);
  const baseMaintenanceDemands = arrayOrFallback(base.maintenanceDemands);
  const works = arrayOrFallback(saved.works, base.works).map(normalizeWorkTaxonomy);
  return {
    ...base,
    ...saved,
    works,
    demands: normalizeDemands(arrayOrFallback(saved.demands, base.demands), works),
    sics: arrayOrFallback(saved.sics, base.sics),
    contracts: arrayOrFallback(saved.contracts, base.contracts),
    suppliers: arrayOrFallback(saved.suppliers, base.suppliers),
    funds: arrayOrFallback(saved.funds, base.funds),
    fundMovements: arrayOrFallback(saved.fundMovements, base.fundMovements),
    budgetRevisions: arrayOrFallback(saved.budgetRevisions, base.budgetRevisions),
    users: arrayOrFallback(saved.users, base.users).map(normalizeUserCredentials),
    maintenanceDemands: normalizeMaintenanceDemands(mergeMaintenanceDemands(savedMaintenanceDemands, baseMaintenanceDemands), sprints),
    activeRole: roleDefinitions[saved.activeRole] ? saved.activeRole : base.activeRole || "GestÃ£o",
    deletedDemands: arrayOrFallback(saved.deletedDemands, base.deletedDemands),
    deletedMaintenanceDemands: arrayOrFallback(saved.deletedMaintenanceDemands, base.deletedMaintenanceDemands),
    sprints,
    sicBi: saved.sicBi || base.sicBi || { records: [], demandSummary: [] },
    investmentPlan: base.investmentPlan || { source: "", sheet: "", records: [] },
    unitRegistry: base.unitRegistry || { source: "", sheet: "", records: [] },
    maintenanceBi: base.maintenanceBi || { source: "", sheet: "", records: [] },
    capexControl: base.capexControl || { source: "", baseOi: [], dePara: [], transferencias: [], consumo: {} },
    commissionObras: base.commissionObras || { source: "", sheet: "", summary: {}, records: [] },
    capexManualOiRows: arrayOrFallback(saved.capexManualOiRows, base.capexManualOiRows),
    projectDemands: arrayOrFallback(saved.projectDemands, base.projectDemands).map(normalizeDemandAnalysts),
    projectStatusOverrides: saved.projectStatusOverrides && typeof saved.projectStatusOverrides === "object" ? saved.projectStatusOverrides : {},
    evReferenceTargets: saved.evReferenceTargets && typeof saved.evReferenceTargets === "object" ? saved.evReferenceTargets : {},
    strategicTargetOverrides: saved.strategicTargetOverrides && typeof saved.strategicTargetOverrides === "object" ? saved.strategicTargetOverrides : {},
    configurationCatalog: arrayOrFallback(saved.configurationCatalog, base.configurationCatalog),
    history: arrayOrFallback(saved.history, base.history),
  };
}

function normalizeDemands(demands = [], works = []) {
  return arrayOrFallback(demands).map((item) => normalizeDemandRecord(item, works));
}

const analystNameAliases = new Map([
  ["skart", "Skarth"],
  ["skarth", "Skarth"],
]);

function canonicalAnalystName(name) {
  const cleanName = String(name || "").trim();
  const key = normalizeSearchText(cleanName);
  if (!key) return "";
  const aliasName = analystNameAliases.get(key);
  if (aliasName) return aliasName;
  const directoryName = (globalThis.SLT_CLOUD?.analysts || [])
    .map((analyst) => String(analyst.nome || "").trim())
    .find((analystName) => normalizeSearchText(analystName) === key);
  return directoryName || cleanName;
}

function configuredAnalystNames() {
  const namesByKey = new Map();
  (globalThis.SLT_CLOUD?.analysts || [])
    .map((analyst) => canonicalAnalystName(analyst.nome))
    .filter(Boolean)
    .forEach((name) => {
      const key = normalizeSearchText(name);
      if (!namesByKey.has(key)) namesByKey.set(key, name);
    });
  return [...namesByKey.values()];
}

function registeredAnalystName(name) {
  const key = normalizeSearchText(canonicalAnalystName(name));
  if (!key) return "";
  return configuredAnalystNames().find((analyst) => normalizeSearchText(analyst) === key) || "";
}

function demandAnalystNames(demand = {}) {
  const names = [demand.analistaResponsavel, ...arrayOrFallback(demand.analistasComplementares)]
    .map(canonicalAnalystName)
    .filter(Boolean);
  const seen = new Set();
  return names.filter((name) => {
    const key = normalizeSearchText(name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeDemandAnalysts(demand = {}) {
  const analysts = demandAnalystNames(demand);
  return {
    ...demand,
    analistaResponsavel: analysts[0] || "",
    analistasComplementares: analysts.slice(1),
  };
}

function normalizeDemandProjectDetails(details = {}) {
  if (!details || typeof details !== "object" || Array.isArray(details)) return {};
  return Object.fromEntries(Object.entries(details).map(([projectId, value]) => {
    const item = value && typeof value === "object" ? value : {};
    return [String(projectId || "").trim().toUpperCase(), {
      responsavelPostagem: String(item.responsavelPostagem || "").trim(),
      dataPostagem: String(item.dataPostagem || "").trim(),
      localArquivo: String(item.localArquivo || "").trim(),
    }];
  }).filter(([projectId]) => projectId));
}

function normalizeDemandLabels(labels = []) {
  const values = Array.isArray(labels) ? labels : String(labels || "").split(/[,;\n]+/);
  const normalized = values
    .map((label) => String(label || "").trim().slice(0, 32))
    .filter(Boolean);
  return [...new Map(normalized.map((label) => [normalizeSearchText(label), label])).values()].slice(0, 6);
}

function normalizeSicLecom(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/^lecom/, "");
}

function sicLecomFromDemand(demand = {}) {
  const metadata = demand.sicMetadata && typeof demand.sicMetadata === "object" ? demand.sicMetadata : {};
  return metadata.lecomNumber || demand.lecomNumber || demand.lecom || "";
}

function findSicLecomConflict(value, excludeDemandId = "") {
  const key = normalizeSicLecom(value);
  if (!key) return null;
  const demands = [
    ...(state.demands || []).map((demand) => ({ demand, archived: false })),
    ...(state.deletedDemands || []).map((demand) => ({ demand, archived: true })),
  ];
  const demandMatch = demands.find(({ demand }) => (
    demand.id !== excludeDemandId
    && demandTypeKey(demand.tipo) === "SIC"
    && normalizeSicLecom(sicLecomFromDemand(demand)) === key
  ));
  if (demandMatch) return { ...demandMatch, source: "demand" };
  const sic = (state.sics || []).find((item) => (
    item.demandaId !== excludeDemandId
    && normalizeSicLecom(item.lecomNumber || item.lecom) === key
  ));
  return sic ? { sic, archived: false, source: "ev" } : null;
}

function sicLecomConflictMessage(value, conflict) {
  if (conflict?.source === "ev") {
    return `O LECOM ${value} jÃ¡ pertence Ã  SIC ${conflict.sic.id || "registrada"} no EV. Abra o registro existente em vez de criar outro card.`;
  }
  const demand = conflict?.demand || {};
  const work = workById(demand.obraId)?.nome || demand.sicMetadata?.obraNome || demand.obraNome || "obra nÃ£o informada";
  const stage = conflict?.archived ? "arquivado" : (columnById(demand.coluna)?.label || demand.coluna || "etapa nÃ£o informada");
  return `JÃ¡ existe um card de SIC com o LECOM ${value}: ${demand.id || "card existente"} â€” ${work} (${stage}). Abra e atualize esse card em vez de criar outro.`;
}

function normalizeDemandRecord(item = {}, works = []) {
  const sprintIds = demandSprintIds(item);
  const demand = normalizeDemandAnalysts({
    ...item,
    sprintIds,
    sprintId: sprintIds.at(-1) || "",
    coluna: item.coluna === "validacaoST" ? "validacaoObras" : item.coluna,
    etiquetas: normalizeDemandLabels(item.etiquetas),
    projetosEnvolvidos: arrayOrFallback(item.projetosEnvolvidos),
    projetosEnvolvidosDetalhes: normalizeDemandProjectDetails(item.projetosEnvolvidosDetalhes),
    sicIds: arrayOrFallback(item.sicIds),
    anexos: arrayOrFallback(item.anexos),
  });
  if (demandTypeKey(demand.tipo) !== "SIC") return demand;

  const rawMetadata = demand.sicMetadata && typeof demand.sicMetadata === "object" ? demand.sicMetadata : {};
  const metadataAttachments = arrayOrFallback(rawMetadata.anexos);
  const attachments = uniqueAttachments([...demand.anexos, ...metadataAttachments]);
  const posted = demand.sicIds.length > 0 || rawMetadata.postadaNoEv === true || demand.sicApprovalStatus === "Postada";
  const knownStatus = ["Pendente", "Em revisÃ£o", "Aprovado", "Reprovado", "Postada"].includes(demand.sicApprovalStatus);
  const approvalStatus = posted ? "Postada" : knownStatus ? demand.sicApprovalStatus : "Pendente";
  const createdDate = dateOnly(demand.createdAt) || demand.dataPrevistaInicio || todayISO();
  const updatedDate = dateOnly(demand.updatedAt) || todayISO();

  return {
    ...demand,
    sicMetadata: {
      ...rawMetadata,
      lecomNumber: rawMetadata.lecomNumber || demand.lecomNumber || demand.lecom || demand.numeroSic || "",
      obraNumber: rawMetadata.obraNumber || demand.obraNumber || "",
      obraNome: rawMetadata.obraNome || demand.obraNome || works.find((work) => work.id === demand.obraId)?.nome || "",
      tituloSic: rawMetadata.tituloSic || demand.tituloSic || demand.titulo || "",
      numeroSic: rawMetadata.numeroSic || demand.numeroSic || rawMetadata.lecomNumber || demand.lecomNumber || "",
      descricaoSic: rawMetadata.descricaoSic || demand.descricaoSic || demand.observacao || "",
      analistaSalaTecnica: rawMetadata.analistaSalaTecnica || demand.analistaSalaTecnica || demand.analistaResponsavel || "",
      motivo: rawMetadata.motivo || demand.motivo || "RevisaoProjeto",
      anexos: attachments,
    },
    sicDraftDisciplines: arrayOrFallback(demand.sicDraftDisciplines),
    sicApprovalStatus: approvalStatus,
    sicApprovalRequestedAt: demand.sicApprovalRequestedAt || createdDate,
    sicApprovalApprovedAt: demand.sicApprovalApprovedAt || (approvalStatus === "Aprovado" ? demand.dataValidacaoObras || updatedDate : ""),
    sicApprovalApprovedBy: demand.sicApprovalApprovedBy || "",
    sicApprovalRejectedAt: demand.sicApprovalRejectedAt || (approvalStatus === "Reprovado" ? updatedDate : ""),
    sicApprovalRejectedBy: demand.sicApprovalRejectedBy || "",
    sicPostedAt: demand.sicPostedAt || (posted ? demand.dataEntregaReal || updatedDate : ""),
    anexos: attachments,
  };
}

function dateOnly(value) {
  const match = String(value || "").match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function arrayOrFallback(value, fallback = []) {
  if (Array.isArray(value)) return value;
  return Array.isArray(fallback) ? fallback : [];
}

function catalogEntry(type, id, label, attributes = {}) {
  return { id: `${type}/${id}`, type, label, active: true, ...attributes };
}

function appendCatalogValues(items, type, values = []) {
  const result = [...items];
  const labels = new Set(result.map((item) => normalizeSearchText(item.label)));
  values.filter(Boolean).forEach((value) => {
    const label = String(value).trim();
    const normalized = normalizeSearchText(label);
    if (!normalized || labels.has(normalized)) return;
    labels.add(normalized);
    result.push(catalogEntry(type, `derived-${normalized.replace(/[^a-z0-9]+/g, "-")}`, label));
  });
  return result;
}

function defaultConfigurationItems(type) {
  if (type === "discipline") {
    return baseDisciplines.map((discipline) => catalogEntry(type, discipline.id, discipline.nome, {
      code: discipline.id,
      category: discipline.categoria,
      position: discipline.posicao,
      selectableForSIC: discipline.selecionavelParaSIC,
    }));
  }
  if (type === "category") {
    const defaults = [
      "AdequaÃ§Ã£o RegulatÃ³ria", "EficiÃªncia Operacional", "Fachada", "Obra Emergencial", "Obra EstratÃ©gica",
      "SuficiÃªncia de Rede", "VerticalizaÃ§Ã£o", "Venda de ServiÃ§o", "PadronizaÃ§Ã£o de Unidade", "Risco Assistencial",
    ].map((label, index) => catalogEntry(type, `default-${index + 1}`, label));
    return appendCatalogValues(defaults, type, arrayOrFallback(state?.works).map((work) => canonicalWorkCategory(work.classificacaoObra)));
  }
  if (type === "typology") {
    return workTypologyOptions.map((label, index) => catalogEntry(type, `default-${index + 1}`, label));
  }
  if (type === "year") {
    const currentYear = new Date().getFullYear();
    const defaults = Array.from({ length: 11 }, (_, index) => String(currentYear - 5 + index));
    return appendCatalogValues([], type, [...defaults, ...arrayOrFallback(state?.works).map((work) => work.anoObra)])
      .sort((left, right) => Number(left.label) - Number(right.label));
  }
  if (type === "region") return baseRegions.map((label, index) => catalogEntry(type, `default-${index + 1}`, label));
  if (type === "state") {
    return baseStates.map(([code, , region]) => catalogEntry(type, code.toLowerCase(), code, { code, region }));
  }
  return [];
}

function normalizeConfigurationItems(type, items = []) {
  const normalized = [];
  const seen = new Set();
  items.forEach((sourceItem) => {
    const item = { ...sourceItem };
    if (type === "category") item.label = canonicalWorkCategory(item.label);
    if (type === "typology") item.label = canonicalWorkTypology(item.label);
    if (type === "state") {
      item.code = canonicalStateCode(item.code || item.label);
      item.label = item.code;
      item.region = String(item.region || "").trim() || canonicalStateRegion(item.code);
    }
    if (type === "discipline") {
      item.code = canonicalDisciplineId(item.code || item.id.replace(/^discipline\//, ""));
      if (item.code === "instalacoes-eletricas-e-spda") item.label = "InstalaÃ§Ãµes ElÃ©tricas e SPDA";
    }
    const identity = type === "discipline" ? item.code : type === "state" ? item.code : normalizeSearchText(item.label);
    if (!identity || seen.has(identity)) return;
    seen.add(identity);
    normalized.push(item);
  });
  return normalized;
}

function configurationItems(type, { includeInactive = false } = {}) {
  const stored = arrayOrFallback(state?.configurationCatalog).filter((item) => item.type === type);
  const source = type === "typology" && stored.length
    ? [...stored, ...defaultConfigurationItems(type)]
    : stored.length ? stored : defaultConfigurationItems(type);
  const items = normalizeConfigurationItems(type, source);
  return items
    .map((item, index) => ({
      ...item,
      active: type === "typology" ? true : item.active !== false,
      position: type === "typology" ? workTypologyOptions.indexOf(item.label) + 1 : Number(item.position || index + 1),
    }))
    .filter((item) => includeInactive || item.active !== false)
    .sort((left, right) => Number(left.position || 999) - Number(right.position || 999) || String(left.label).localeCompare(String(right.label), "pt-BR"));
}

function configurationLabels(type) {
  return configurationItems(type).map((item) => type === "state" ? item.code : item.label).filter(Boolean);
}

function configuredDisciplines({ includeInactive = true } = {}) {
  return configurationItems("discipline", { includeInactive }).map((item) => {
    const id = item.code || item.id.replace(/^discipline\//, "");
    return {
      id,
      nome: item.label,
      categoria: id === "sics" ? "Sics" : item.category || "OutrasCategorias",
      posicao: Number(item.position || 999),
      ativo: item.active !== false,
      selecionavelParaSIC: item.active !== false && item.selectableForSIC !== false,
    };
  });
}

function persistConfigurationType(type, items) {
  state.configurationCatalog = [
    ...arrayOrFallback(state.configurationCatalog).filter((item) => item.type !== type),
    ...normalizeConfigurationItems(type, items),
  ];
}

function normalizeMaintenanceDemands(demands = [], sprints = []) {
  return normalizeMaintenanceFinancials(demands).map((item) => normalizeMaintenanceSprintLink(normalizeDemandAnalysts(item), sprints));
}

function normalizeMaintenanceSprintLink(item, sprints = []) {
  const sprint = sprintByReference(item?.sprintId || item?.sprint, sprints);
  if (!sprint) {
    return {
      ...item,
      sprintId: item?.sprintId || "",
      sprint: item?.sprint || "Sem sprint",
    };
  }
  return {
    ...item,
    sprintId: sprint.id,
    sprint: sprint.nome,
  };
}

function normalizeMaintenanceFinancials(demands = []) {
  return demands.map((item) => {
    if (!normalizeSearchText(item?.tipoDespesa || "").includes("opex")) return item;
    return { ...item, valorNegociado: 0 };
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function saveState() {
  const module = dataUIModuleForView(currentView);
  if (!globalThis.SLT_CLOUD.canWrite(module)) {
    showToast("Aguarde o carregamento completo do banco ou confira sua permissÃ£o de ediÃ§Ã£o.");
    return false;
  }
  try {
    await globalThis.SLT_CLOUD.saveAndWait(module, persistedStatePayload());
    return true;
  } catch (error) {
    showToast(error?.message || "A alteraÃ§Ã£o nÃ£o foi confirmada pelo banco. Recarregue os dados antes de continuar.");
    return false;
  }
}

async function saveStateAndWait() {
  const module = dataUIModuleForView(currentView);
  if (!globalThis.SLT_CLOUD.canWrite(module)) throw new Error("Aguarde o carregamento completo do banco ou confira sua permissÃ£o de ediÃ§Ã£o.");
  return await globalThis.SLT_CLOUD.saveAndWait(module, persistedStatePayload());
}

function persistedStatePayload() {
  const works = arrayOrFallback(state.works).map((work) => {
      const normalized = normalizeWorkEVLifecycle(work);
      const cleanWork = { ...normalized };
      if (!normalized.ev || normalized.ev._virtualEmptyEV || !evHasBudgetData(normalized.ev)) {
        delete cleanWork.ev;
        return cleanWork;
      }
      cleanWork.ev = { ...normalized.ev, status: effectiveEVStatus(normalized) };
      delete cleanWork.ev._virtualEmptyEV;
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
      configurationCatalog: arrayOrFallback(state.configurationCatalog),
      deletedEVRecordIds: arrayOrFallback(state.deletedEVRecordIds),
      deletedEVArchive: arrayOrFallback(state.deletedEVArchive),
    sicApprovalWorks: arrayOrFallback(state.sicApprovalWorks),
    sicApprovalWeeks: arrayOrFallback(state.sicApprovalWeeks),
    sicApprovalSnapshots: arrayOrFallback(state.sicApprovalSnapshots),
    };
}

function normalizeUserProfile(perfil) { return ["Admin", "Gestor", "Analista"].includes(perfil) ? perfil : "Analista"; }

function defaultAccessModulesForProfile(perfil) {
  const profile = normalizeUserProfile(perfil);
  if (profile === "Analista de OrÃ§amento") return ["works"];
  if (profile === "Analista de Projetos") return ["projects"];
  if (profile === "Analista") return ["projects", "works", "maintenance", "clinical"];
  return userAccessModules.map((module) => module.id);
}

function normalizeAccessModules(modules, perfil) {
  const valid = new Set(userAccessModules.map((module) => module.id));
    const source = Array.isArray(modules) ? modules : [];
    return [...new Set(source.map(String).filter((module) => valid.has(module)))];
}

function accessViewsForModules(modules = []) {
  const enabled = new Set(modules);
  return userAccessModules
    .filter((module) => enabled.has(module.id))
    .flatMap((module) => module.views)
    .map((view) => viewAliases[view] || view)
    .filter((view, index, list) => list.indexOf(view) === index);
}

function normalizeUserCredentials(user = {}) {
  const perfil = normalizeUserProfile(user.perfil);
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
    };
}

function loadAuthSession() {
  return { userId: globalThis.SLT_CLOUD.profile.id };
}

function currentUser() {
  return globalThis.SLT_CLOUD.profile;
}

function isAuthenticated() {
  return Boolean(currentUser());
}

function logoutUser() {
  globalThis.SLT_CLOUD.logout();
}

function authenticatedRole() {
  return normalizeUserProfile(currentUser()?.perfil || state.activeRole || "GestÃ£o");
}

function canAccessModule(module) { return module === "home" || globalThis.SLT_CLOUD.canRead(module); }

function viewModule(view) {
  const normalized = viewAliases[view] || view;
  if (projectViewIds.includes(normalized)) return "projects";
  if (worksViewIds.includes(normalized) || ["kanban", "portfolio", "ev", "sics"].includes(normalized)) return "works";
  if (maintenanceViewIds.includes(normalized)) return "maintenance";
  if (clinicalViewIds.includes(normalized)) return "clinical";
  if (normalized === "budget") return "budget";
  if (["settings", "team", "analytics", "suppliers"].includes(normalized)) return "settings";
  return "home";
}

function dataUIModuleForView(view) {
  const normalized = viewAliases[view] || view;
  if (["worksSettings", "analytics"].includes(normalized)) return "works";
  return viewModule(normalized);
}

function money(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function moneyCents(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function moneyCompact(value) {
  const amount = Number(value) || 0;
  const abs = Math.abs(amount);
  if (abs >= 1000000000) return `R$ ${number(amount / 1000000000, 2)} bi`;
  if (abs >= 1000000) return `R$ ${number(amount / 1000000, 2)} mi`;
  if (abs >= 1000) return `R$ ${number(amount / 1000, 2)} mil`;
  return money(amount);
}

function metricCompact(value, unit = "") {
  const amount = Number(value) || 0;
  const abs = Math.abs(amount);
  if (abs >= 1000000000) return `${number(amount / 1000000000, 1)} bi${unit}`;
  if (abs >= 1000000) return `${number(amount / 1000000, 1)} mi${unit}`;
  if (abs >= 1000) return `${number(amount / 1000, 1)} mil${unit}`;
  return `${number(amount, unit ? 1 : 0)}${unit}`;
}

function number(value, digits = 0) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value || 0);
}

function dateText(value) {
  if (!value) return "Pendente";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function todayISO() { return businessDate(); }

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cleanImportedText(value) {
  const text = String(value ?? "").trim();
  if (!/[ÃƒÃ‚]/.test(text)) return text || "NÃ£o informado";
  try {
    const bytes = Array.from(text)
      .map((char) => {
        const code = char.charCodeAt(0);
        return code <= 255 ? `%${code.toString(16).padStart(2, "0")}` : encodeURIComponent(char);
      })
      .join("");
    return decodeURIComponent(bytes).replace(/Ã‚/g, "").trim() || text;
  } catch (error) {
    return text;
  }
}

function recordValue(record, candidates, fallback = "") {
  const keys = Object.keys(record || {});
  for (const candidate of candidates) {
    const direct = record?.[candidate];
    if (direct !== undefined && direct !== null && String(direct).trim() !== "") return direct;
    const normalizedCandidate = normalizeSearchText(candidate);
    const matchedKey = keys.find((key) => normalizeSearchText(key) === normalizedCandidate);
    if (matchedKey && record[matchedKey] !== undefined && record[matchedKey] !== null && String(record[matchedKey]).trim() !== "") {
      return record[matchedKey];
    }
  }
  return fallback;
}

function importedText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text ? cleanImportedText(text) : fallback;
}

function parseImportedNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const text = String(value ?? "").trim();
  if (!text) return 0;
  const normalized = text.includes(",")
    ? text.replace(/\./g, "").replace(",", ".")
    : text;
  const parsed = Number(normalized.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function excelSerialToISO(value) {
  if (!value) return "";
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    const [day, month, year] = text.split("/");
    return `${year}-${month}-${day}`;
  }
  const serial = Number(text.replace(",", "."));
  if (!Number.isFinite(serial) || serial <= 0) return "";
  const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000);
  return date.toISOString().slice(0, 10);
}

function normalizeMaintenancePhase(value) {
  const normalized = normalizeSearchText(value);
  if (normalized.includes("duplicidade")) return "emDuplicidade";
  if (normalized.includes("postado com rc")) return "postadoComRc";
  if (normalized.includes("postado")) return "postado";
  if (normalized.includes("arquivado") || normalized.includes("cards arquivados")) return "cardsArquivados";
  if (normalized.includes("finaliz")) return "finalizada";
  if (normalized.includes("valid")) return "validacao";
  if (normalized.includes("devolv")) return "devolvido";
  if (normalized.includes("andamento")) return "andamento";
  if (normalized.includes("nao iniciado") || normalized.includes("nÃ£o iniciado")) return "naoIniciado";
  return "naoIniciado";
}

function maintenancePhaseById(id) {
  return maintenanceColumns.find((column) => column.id === id) || maintenanceColumns[0];
}

function maintenanceStatusLabel(item) {
  return maintenancePhaseById(item?.coluna).label;
}

function maintenanceDemandsFromImportedData(records = []) {
  return records.map((record, index) => {
    const createdAt = excelSerialToISO(recordValue(record, ["Criado em", "DATA DE INICIO", "DATA INICIO"]));
    const finishedAt = excelSerialToISO(recordValue(record, ["Finalizado em", "DATA FIM", "Finalizado"]));
    const dueAt = excelSerialToISO(recordValue(record, ["Data de vencimento", "DATA DE VENCIMENTO", "Vencimento"]));
    const updatedAt = excelSerialToISO(recordValue(record, ["Atualizado em", "ATUALIZADO EM"])) || finishedAt || createdAt;
    const rawPhase = importedText(recordValue(record, ["Fase atual", "FASE ATUAL", "Status"]), "NÃƒO INICIADO");
    const phase = normalizeMaintenancePhase(rawPhase);
    const unitName = importedText(recordValue(record, ["NOME DA UNIDADE", "UNIDADE"]), "Unidade nÃ£o informada");
    const workName = importedText(recordValue(record, ["NOME DA OBRA", "OBRA", "TÃ­tulo", "TITULO"]), unitName);
    const os = importedText(recordValue(record, ["ORDEM DE SERVIÃ‡O", "OS"]), "S/OS");
    const code = importedText(recordValue(record, ["CÃ³digo", "CODIGO"]), "");
    const tipoDespesa = importedText(recordValue(record, ["TIPO DE DESPESA"]), "OPEX");
    const isOpex = normalizeSearchText(tipoDespesa).includes("opex");
    return {
      id: `MAN-${String(index + 1).padStart(4, "0")}`,
      codigoOrigem: code,
      ordemInterna: importedText(recordValue(record, ["ORDEM INTERNA"]), ""),
      ordemServico: os,
      titulo: workName,
      unidadeNome: unitName,
      unidadeId: importedText(recordValue(record, ["CÃ“DIGO UNIDADE", "CODIGO UNIDADE", "CENTRO"]), ""),
      tipologia: importedText(recordValue(record, ["TIPOLOGIA"]), "NÃ£o informada"),
      uf: importedText(recordValue(record, ["ESTADO DA UNIDADE", "UF"]), ""),
      estado: importedText(recordValue(record, ["ESTADO"]), ""),
      regiao: importedText(recordValue(record, ["REGIÃƒO", "REGIAO", "REGIÃƒO 2", "REGIAO 2"]), ""),
      regional: importedText(recordValue(record, ["REGIONAL"]), ""),
      cnpj: importedText(recordValue(record, ["CNPJ"]), ""),
      endereco: "",
      cep: importedText(recordValue(record, ["CEP"]), ""),
      requisicaoCompra: code && code !== "S/CÃ“DIGO" ? code : "",
      centroCusto: importedText(recordValue(record, ["CENTRO DE CUSTO"]), "ManutenÃ§Ã£o predial"),
      tipoDemanda: "Normal",
      tipoDespesa,
      coluna: phase,
      fasePipefy: rawPhase,
      dataInicio: createdAt,
      dataFim: finishedAt,
      dataPrevistaEntrega: dueAt || finishedAt || "",
      valorProposta: parseImportedNumber(recordValue(record, ["VALOR DA PROPOSTA INICIAL", "VALOR PROPOSTA INICIAL", "PROPOSTA INICIAL", "VALOR DA PROPOSTA"])),
      valorSalaTecnica: parseImportedNumber(recordValue(record, ["VALOR SALA TECNICA", "VALOR SALA TÃ‰CNICA"])),
      valorNegociado: isOpex ? 0 : parseImportedNumber(recordValue(record, ["VALOR NEGOCIADO"])),
      sprintId: "",
      sprint: importedText(recordValue(record, ["SPRINT"]), "Sem sprint"),
      planejamento: importedText(recordValue(record, ["DESCRIÃ‡ÃƒO CENTRO FINANCEIRO", "PLANEJAMENTO"]), ""),
      observacoes: importedText(recordValue(record, ["OBSERVAÃ‡Ã•ES GERAIS", "OBSERVACOES GERAIS"]), ""),
      analistaResponsavel: importedText(recordValue(record, ["ResponsÃ¡veis", "RESPONSAVEIS", "RESPONSÃVEIS"]), ""),
      prioridade: phase === "devolvido" ? "Alta" : "MÃ©dia",
      phaseStartedAt: phase === "naoIniciado" ? createdAt : updatedAt,
      createdAt,
      updatedAt,
      historico: [
        { fase: "Entrada", data: createdAt, observacao: "Registro importado do relatÃ³rio de manutenÃ§Ã£o." },
        ...(finishedAt ? [{ fase: rawPhase, data: finishedAt, observacao: "Ãšltima fase registrada no relatÃ³rio." }] : []),
      ],
    };
  });
}

function maintenanceDemandKey(item) {
  const id = String(item?.id || "").trim();
  if (id) return `id:${normalizeSearchText(id)}`;
  return `fallback:${normalizeSearchText([item?.ordemServico, item?.titulo, item?.unidadeNome].filter(Boolean).join("|"))}`;
}

function mergeMaintenanceDemands(savedDemands = [], baseDemands = []) {
  const merged = new Map();
  baseDemands.forEach((item) => merged.set(maintenanceDemandKey(item), item));
  savedDemands.forEach((item) => merged.set(maintenanceDemandKey(item), item));
  return [...merged.values()];
}

function canonicalDisciplineId(id) {
  return disciplineAliases[id] || id;
}

function disciplineById(id) {
  const canonicalId = canonicalDisciplineId(id);
  return configuredDisciplines().find((discipline) => discipline.id === canonicalId) || {
    id,
    nome: id,
    categoria: "OutrasCategorias",
    posicao: 999,
    selecionavelParaSIC: false,
  };
}

function isLocalEVLine(line) {
  return Boolean(line?.isLocalEVLine || line?.isLocal);
}

function evLineCategory(line) {
  if (!line) return "OutrasCategorias";
  if (isLocalEVLine(line)) {
    return ["CustosDaObra", "OutrasCategorias", "Sics"].includes(line.localCategory)
      ? line.localCategory
      : "OutrasCategorias";
  }
  return canonicalDisciplineId(line.disciplinaId) === "sics"
    ? "Sics"
    : disciplineById(line.disciplinaId).categoria;
}

function evLineDisplayName(line) {
  if (isLocalEVLine(line)) {
    return String(line.localName || line.nome || line.disciplinaId || "Linha local");
  }
  return disciplineById(line?.disciplinaId).nome;
}

function evLinePosition(line, fallback = 999) {
  if (isLocalEVLine(line)) return Number(line.localPosition || fallback);
  return Number(disciplineById(line?.disciplinaId).posicao || fallback);
}

function evPostedSicDetails(work) {
  const posted = (state.sics || []).filter(
    (sic) => sic.obraId === work?.id && String(sic.status || "Aprovado") === "Aprovado"
  );
  if (posted.length) {
    return posted.map((sic) =>
      evSicDetailViewModel({
        id: sic.id,
        numeroSic: sic.numeroSic || sic.id,
        lecomNumber: sic.lecomNumber || "",
        titulo: sicDisplayTitle(sic),
        valor: sicTotal(sic),
        status: sic.status || "Aprovado",
      })
    );
  }
  const summaryLine = (work?.ev?.lines || []).find(
    (line) => !isLocalEVLine(line) && canonicalDisciplineId(line.disciplinaId) === "sics"
  );
  return (summaryLine?.sicDetails || []).map((item) => evSicDetailViewModel(item));
}

function evSicGroupTotal(work) {
  const lines = work?.ev?.lines || [];
  const summaryLine = lines.find(
    (line) => !isLocalEVLine(line) && canonicalDisciplineId(line.disciplinaId) === "sics"
  );
  const postedDetails = evPostedSicDetails(work);
  const postedTotal = postedDetails.length
    ? postedDetails.reduce((sum, item) => sum + Number(item.valor || 0), 0)
    : summaryLine && normalizeEVLineStatus(summaryLine.status) !== "NÃ£o se aplica"
      ? Number(summaryLine.valorOrcado || 0)
      : 0;
  const localTotal = lines
    .filter(
      (line) =>
        isLocalEVLine(line) &&
        evLineCategory(line) === "Sics" &&
        normalizeEVLineStatus(line.status) !== "NÃ£o se aplica"
    )
    .reduce((sum, line) => sum + Number(line.valorOrcado || 0), 0);
  return postedTotal + localTotal;
}

function isRiskLine(line) {
  return canonicalDisciplineId(line.disciplinaId) === "taxa-risco";
}

function workById(id) {
  const current = state.works.find((work) => work.id === id);
  if (current) return current;
  const prefix = "historical-budget-";
  if (!String(id || "").startsWith(prefix)) return undefined;
  const historicalId = String(id).slice(prefix.length);
  const record = arrayOrFallback(state.evs).find((item) => String(item.id) === historicalId);
  return record ? historicalBudgetWorkFromRecord(record) : undefined;
}

function supplierById(id) {
  return state.suppliers.find((supplier) => supplier.id === id);
}

function sicsForWork(workId, status = "Aprovado") {
  return state.sics.filter((sic) => sic.obraId === workId && (!status || sic.status === status));
}

function aditivadoByDiscipline(workId, disciplineId) {
  const canonicalId = canonicalDisciplineId(disciplineId);
  if (canonicalId === "sics") return 0;
  return sicsForWork(workId, "Aprovado")
    .filter((sic) => canonicalDisciplineId(sic.evLineDisciplineId) !== "sics")
    .reduce((total, sic) => {
      const item = sic.disciplinasAfetadas.find((entry) => canonicalDisciplineId(entry.disciplinaId) === canonicalId);
      return total + (item?.valorDelta || 0);
    }, 0);
}

function contratadoByDiscipline(workId, disciplineId) {
  const canonicalId = canonicalDisciplineId(disciplineId);
  return state.contracts
    .filter((contract) => contract.obraId === workId && canonicalDisciplineId(contract.disciplinaId) === canonicalId)
    .reduce((total, contract) => total + contract.valor, 0);
}

function lineTotals(work, line) {
  const aditivado = aditivadoByDiscipline(work.id, line.disciplinaId);
  const contratado = contratadoByDiscipline(work.id, line.disciplinaId);
  return {
    orcado: line.valorOrcado || 0,
    aditivado,
    contratado,
    saldo: (line.valorOrcado || 0) + aditivado - contratado,
  };
}

function ensureEVLineForDiscipline(work, disciplineId) {
  const canonicalId = canonicalDisciplineId(disciplineId);
  work.ev.lines = work.ev.lines || [];
  let line = work.ev.lines.find((item) => canonicalDisciplineId(item.disciplinaId) === canonicalId);
  if (!line) {
    line = {
      disciplinaId: canonicalId,
      valorOrcado: 0,
      status: "Estimado",
      sicIds: [],
    };
    work.ev.lines.push(line);
  }
  line.sicIds = [...new Set([...(line.sicIds || [])])];
  return line;
}

function syncSicWithEV(work, sic) {
  if (!work || !sic) return;
  work.ev.sicIds = [...new Set([...(work.ev.sicIds || []), sic.id])];
  (sic.disciplinasAfetadas || []).forEach((item) => {
    const line = ensureEVLineForDiscipline(work, item.disciplinaId);
    line.sicIds = [...new Set([...(line.sicIds || []), sic.id])];
  });
  if (canonicalDisciplineId(sic.evLineDisciplineId) === "sics") {
    syncWorkSicSummaryLine(work);
  }
  work.ev.lines.sort((a, b) => disciplineById(a.disciplinaId).posicao - disciplineById(b.disciplinaId).posicao);
  work.ev.status = deriveEVStatus(work);
}

function syncWorkSicSummaryLine(work) {
  if (!work) return;
  const line = ensureEVLineForDiscipline(work, "sics");
  const postedSics = state.sics.filter((sic) => sic.obraId === work.id && canonicalDisciplineId(sic.evLineDisciplineId) === "sics");
  const total = postedSics.reduce((sum, sic) => sum + sicTotal(sic), 0);
  const riskReadings = postedSics.map((sic) => sicRiskReading(work, sic));
  line.valorOrcado = total;
  line.status = total ? "OrÃ§ado" : "NÃ£o se aplica";
  line.sicIds = postedSics.map((sic) => sic.id);
  line.riskExceeded = riskReadings.some((reading) => reading.exceeded);
  line.sicDetails = postedSics.map((sic) => {
    const risk = sicRiskReading(work, sic);
    return {
      id: sic.id,
      numeroSic: sic.numeroSic || sic.id,
      lecomNumber: sic.lecomNumber || "",
      titulo: sic.titulo || sic.descricao || "SIC sem tÃ­tulo",
      valor: sicTotal(sic),
      status: sic.status || "Pendente",
      riskExceeded: risk.exceeded,
      riskReserve: risk.reserve,
      riskAvailable: risk.available,
      riskExcess: risk.excess,
    };
  });
}

function workTotals(work, options = {}) {
  const includeRisk = options.excludeRisk === true ? false : (options.includeRisk === true || work?._historicalBudgetWork === true);
  const includeInitialBudgetFallback = options.includeInitialBudgetFallback === true;
  const lines = work?.ev?.lines || [];
  const totals = lines.reduce(
    (total, line) => {
      if (normalizeEVLineStatus(line.status) === "NÃ£o se aplica") return total;
      if (!includeRisk && isRiskLine(line)) return total;
      const values = lineTotals(work, line);
      total.orcado += values.orcado;
      total.aditivado += values.aditivado;
      total.contratado += values.contratado;
      total.saldo += values.saldo;
      return total;
    },
    { orcado: 0, aditivado: 0, contratado: 0, saldo: 0 }
  );
  const hasDetailedEV = lines.some(
    (line) => !isRiskLine(line) && normalizeEVLineStatus(line.status) !== "NÃ£o se aplica" && Number(line.valorOrcado || 0) > 0
  );
  const fallbackValue = includeInitialBudgetFallback && !hasDetailedEV ? plannedWorkValue(work) : 0;
  if (fallbackValue > 0) {
    totals.orcado += fallbackValue;
    totals.saldo += fallbackValue;
  }
  return totals;
}

function plannedWorkValue(work) {
  return Number(work?.plannedValue ?? work?.valorAprovado ?? work?.capexAprovado ?? 0) || 0;
}

function workBudgetValue(work, options = {}) {
  const values = workTotals(work, options);
  return values.orcado + values.aditivado;
}

function evTopKpiReading(work) {
  const area = Number(work?.areaEquivalente || 0) || 0;
  const totalWithoutRisk = workBudgetValue(work);
  const totalWithRisk = workBudgetValue(work, { includeRisk: true });
  const totalSics = evSicGroupTotal(work);
  return {
    area,
    totalWithoutRisk,
    costWithoutRisk: area ? totalWithoutRisk / area : 0,
    totalWithRisk,
    costWithRisk: area ? totalWithRisk / area : 0,
    totalSics,
  };
}

function strategicCostTargetForWork(work) {
  const manualTargetId = String(work?.metaCustoM2TargetId || work?.metaCustoM2 || "").trim();
  const manualTarget = strategicTargetById(manualTargetId);
  if (manualTarget) return manualTarget;

  const type = normalizeSearchText(work.tipoUnidade);
  const text = normalizeSearchText(`${work.nome} ${work.tipoUnidade} ${work.tipologiaObra} ${work.classificacaoObra}`);

  if (type.includes("pronto atendimento")) {
    return strategicTargetById("pronto-atendimento");
  }

  if (type.includes("hospital")) {
    const highComplexitySignals = ["novo hospital", "nova unidade", "hemodinam", "leitos", "uti", "centro cirurg", "maternidade", "alta complexidade"];
    const isHighComplexity = highComplexitySignals.some((signal) => text.includes(signal));
    return strategicTargetById(isHighComplexity ? "hospital-alta" : "hospital-media");
  }

  const compactCareTypes = ["clinica", "diagnostico", "laboratorio", "lab", "tea", "coleta", "medprev"];
  if (compactCareTypes.some((signal) => type.includes(signal) || text.includes(signal))) {
    return strategicTargetById("clinicas-diagnosticos-labs-teas");
  }

  return null;
}

function strategicCostTargetOptions(selected = "") {
  return [`<option value="" ${!selected ? "selected" : ""}>ClassificaÃ§Ã£o automÃ¡tica pelo sistema</option>`]
    .concat(
      effectiveStrategicCostTargets().map(
        (target) => `<option value="${target.id}" ${selected === target.id ? "selected" : ""}>${target.label} (${target.targetLabel})</option>`
      )
    )
    .join("");
}

function strategicCostTargetModeLabel(work) {
  const manualTargetId = String(work?.metaCustoM2TargetId || work?.metaCustoM2 || "").trim();
  return manualTargetId ? "Revisada manualmente" : "AutomÃ¡tica";
}

function strategicCostAreaForWork(work) {
  return Number(work?.areaEquivalente || work?.areaConstruida || 0) || 0;
}

function strategicCostReadingForWork(work) {
  const target = strategicCostTargetForWork(work);
  const value = workBudgetValue(work);
  const area = strategicCostAreaForWork(work);
  const costM2 = area ? value / area : 0;
  const measured = Boolean(target && value > 0 && area > 0);
  const aboveTarget = measured && costM2 > target.targetMax;
  const belowRange = measured && target.targetMin && costM2 < target.targetMin;
  return {
    work,
    target,
    value,
    area,
    costM2,
    measured,
    aboveTarget,
    belowRange,
    status: !target || !area || !value ? "Sem leitura" : aboveTarget ? "Acima da meta" : belowRange ? "Abaixo da faixa" : "Dentro da meta",
  };
}

function isStrategicCostReadingValid(reading) {
  return Boolean(reading?.measured && reading.value > 0 && reading.area > 0 && reading.costM2 > 0);
}

function commissionObrasRecords() {
  const updatedRecords = globalThis.GENERAL_WORKS_DATA?.records;
  return Array.isArray(updatedRecords) && updatedRecords.length ? updatedRecords : arrayOrFallback(state.commissionObras?.records);
}

function isCommissionObraReadingValid(record) {
  return Boolean(record?.leituraValidaM2 && Number(record.precoM2) > 0 && Number(record.areaM2) > 0 && Number(record.valorNegociado) > 0);
}

function validCommissionObrasRecords(records = commissionObrasRecords()) {
  return records.filter(isCommissionObraReadingValid);
}

function strategicCostTargetForCommissionRecord(record) {
  const type = normalizeSearchText(`${record?.tipoObra || ""} ${record?.tipoObras || ""} ${record?.tipoObra2 || ""} ${record?.nivelObra || ""}`);
  const text = normalizeSearchText(`${record?.nomeObra || ""} ${record?.classificacaoObra || ""} ${record?.nivelObra || ""} ${record?.tipoObra || ""}`);

  if (type.includes("hospital") || type.includes("hospitais") || text.includes("hospital") || /\bhs\b/.test(text)) {
    const highComplexitySignals = ["novo hospital", "nova unidade", "hemodinam", "leitos", "uti", "centro cirurg", "maternidade", "alta complexidade"];
    const isHighComplexity = highComplexitySignals.some((signal) => text.includes(signal) || type.includes(signal));
    return strategicTargetById(isHighComplexity ? "hospital-alta" : "hospital-media");
  }

  if (type.includes("pronto atendimento") || text.includes("pronto atendimento") || /\bpa\b/.test(text)) {
    return strategicTargetById("pronto-atendimento");
  }

  const compactCareTypes = ["clinica", "diagnostico", "laboratorio", "lab", "tea", "coleta", "medprev", "ambulator"];
  if (compactCareTypes.some((signal) => type.includes(signal) || text.includes(signal))) {
    return strategicTargetById("clinicas-diagnosticos-labs-teas");
  }

  return null;
}

function strategicCostTargetForUnifiedRecord(record) {
  const type = normalizeSearchText(record?.typology || "");
  const text = normalizeSearchText(`${record?.project || ""} ${record?.typology || ""}`);
  if (type.includes("pronto atendimento") || text.includes("pronto atendimento") || /\bpa\b/.test(text)) {
    return strategicTargetById("pronto-atendimento");
  }
  const compactCareTypes = ["clinica", "diagnostico", "laboratorio", "lab", "tea", "coleta", "medprev", "ambulator"];
  if (compactCareTypes.some((signal) => type.includes(signal) || text.includes(signal))) {
    return strategicTargetById("clinicas-diagnosticos-labs-teas");
  }
  if (type.includes("hospital") || text.includes("hospital") || /\bhs\b/.test(text) || text.includes("hapfor")) {
    const highComplexitySignals = ["novo hospital", "novo hs", "nova unidade", "nova torre", "hemodinam", "leitos", "uti", "centro cirurg", "maternidade", "alta complexidade"];
    const isHighComplexity = highComplexitySignals.some((signal) => text.includes(signal));
    return strategicTargetById(isHighComplexity ? "hospital-alta" : "hospital-media");
  }
  return null;
}

function strategicEVDecision(row, totalValue) {
  const costM2 = Number(row.record.area) > 0 ? row.valor / Number(row.record.area) : 0;
  const target = strategicCostTargetForUnifiedRecord(row.record);
  const benchmark = Number(target?.targetMax) || 0;
  const deviation = costM2 && benchmark ? ((costM2 / benchmark) - 1) * 100 : 0;
  const share = (row.valor / Math.max(totalValue, 1)) * 100;
  let reading = "Dentro da meta";
  let tone = "green";
  let status = "within";
  if (!target) { reading = "Classificar meta do EV"; tone = "gray"; status = "unclassified"; }
  else if (!costM2) { reading = "Sem Ã¡rea para validar R$/mÂ²"; tone = "gray"; status = "unclassified"; }
  else if (costM2 > target.targetMax) { reading = `Acima da meta em ${number(Math.abs(deviation), 0)}%`; tone = "red"; status = "above"; }
  else if (target.targetMin && costM2 < target.targetMin) { reading = `Abaixo da faixa em ${number(((target.targetMin / costM2) - 1) * 100, 0)}%`; tone = "orange"; status = "below"; }
  else if (Math.abs(deviation) >= 15) { reading = `Margem de ${number(Math.abs(deviation), 0)}% atÃ© o limite`; tone = "blue"; }
  else if (share >= 5) { reading = `Alta concentraÃ§Ã£o: ${number(share, 1)}% da base`; tone = "blue"; }
  return { ...row, costM2, target, deviation, share, reading, tone, status };
}

function matchesStrategicEVDecisionFilters(row) {
  const filters = strategicEVDecisionFilters;
  const terms = normalizeSearchText(filters.query).split(/\s+/).filter(Boolean);
  const searchable = normalizeSearchText(`${row.record.project} ${row.record.code} ${row.record.typology} ${row.record.technician || ""} ${row.record.year}`);
  const statusMatches = !filters.status || row.status === filters.status || (filters.status === "outside" && ["above", "below"].includes(row.status));
  return statusMatches
    && (!filters.targetId || row.target?.id === filters.targetId)
    && (!filters.year || String(row.record.year) === filters.year)
    && (!terms.length || terms.every((term) => searchable.includes(term)));
}

function commissionBenchmarkSummary() {
  const records = validCommissionObrasRecords();
  const area = records.reduce((sum, record) => sum + (Number(record.areaM2) || 0), 0);
  const valorSalaTecnica = records.reduce((sum, record) => sum + (Number(record.valorSalaTecnica) || 0), 0);
  const valorNegociado = records.reduce((sum, record) => sum + (Number(record.valorNegociado) || 0), 0);
  const precoM2Values = records.map((record) => Number(record.precoM2) || 0);
  return {
    records,
    count: records.length,
    area,
    valorSalaTecnica,
    valorNegociado,
    savingTecnico: valorSalaTecnica - valorNegociado,
    precoM2Ponderado: area ? valorNegociado / area : 0,
    precoM2Mediana: median(precoM2Values),
  };
}

function strategicCostTargetRows() {
  const grouped = effectiveStrategicCostTargets().map((target) => ({
    ...target,
    works: [],
    readings: [],
    capex: 0,
    area: 0,
    costM2: 0,
    measuredCount: 0,
    withinCount: 0,
    aboveCount: 0,
    belowRangeCount: 0,
    adherence: 0,
    historicalCount: 0,
    historicalArea: 0,
    historicalSalaTecnica: 0,
    historicalNegociado: 0,
    historicalSavingTecnico: 0,
    historicalPrecoM2Ponderado: 0,
    historicalPrecoM2Mediana: 0,
    status: "Sem leitura",
    sourceHistoricalOnly: true,
  }));

  validCommissionObrasRecords().forEach((record) => {
    const target = strategicCostTargetForCommissionRecord(record);
    if (!target) return;
    const value = Number(record.valorNegociado) || 0;
    const area = Number(record.areaM2) || 0;
    const costM2 = area ? value / area : 0;
    const aboveTarget = costM2 > target.targetMax;
    const belowRange = Boolean(target.targetMin && costM2 < target.targetMin);
    const work = {
      id: record.id,
      nome: record.nomeObra,
      tipoUnidade: record.tipoObra || record.tipologiaObra,
      classificacaoObra: record.classificacaoObra,
      cidade: record.cidade,
      uf: record.uf,
      regiao: record.regiao,
    };
    const reading = {
      work,
      record,
      target,
      value,
      area,
      costM2,
      measured: true,
      aboveTarget,
      belowRange,
      status: aboveTarget ? "Acima da meta" : belowRange ? "Abaixo da faixa" : "Dentro da meta",
    };
    const row = grouped.find((item) => item.id === target.id);
    if (!row) return;
    row.works.push(work);
    row.readings.push(reading);
    row.capex += value;
    row.area += area;
  });

  grouped.forEach((row) => {
    const measuredReadings = row.readings.filter(isStrategicCostReadingValid);
    row.measuredCount = measuredReadings.length;
    row.aboveCount = measuredReadings.filter((reading) => reading.aboveTarget).length;
    row.belowRangeCount = measuredReadings.filter((reading) => reading.belowRange).length;
    row.withinCount = measuredReadings.filter((reading) => !reading.aboveTarget && !reading.belowRange).length;
    row.costM2 = row.area ? row.capex / row.area : 0;
    row.adherence = row.measuredCount ? (row.withinCount / row.measuredCount) * 100 : 0;
    row.status = !row.measuredCount ? "Sem leitura" : row.costM2 > row.targetMax ? "Acima da meta" : row.targetMin && row.costM2 < row.targetMin ? "Abaixo da faixa" : "Dentro da meta";
    row.historicalCount = row.measuredCount;
    row.historicalArea = row.area;
    row.historicalSalaTecnica = row.readings.reduce((sum, reading) => sum + (Number(reading.record.valorSalaTecnica) || 0), 0);
    row.historicalNegociado = row.capex;
    row.historicalSavingTecnico = row.historicalSalaTecnica - row.historicalNegociado;
    row.historicalPrecoM2Ponderado = row.costM2;
    row.historicalPrecoM2Mediana = median(row.readings.map((reading) => reading.costM2));
  });

  return grouped;
}

function strategicCostTargetSummary(rows = strategicCostTargetRows()) {
  const measured = rows.reduce((total, row) => total + row.measuredCount, 0);
  const within = rows.reduce((total, row) => total + row.withinCount, 0);
  const above = rows.reduce((total, row) => total + row.aboveCount, 0);
  const capex = rows.reduce((total, row) => total + row.capex, 0);
  const area = rows.reduce((total, row) => total + row.area, 0);
  return {
    measured,
    within,
    above,
    adherence: measured ? (within / measured) * 100 : 0,
    averageCostM2: area ? capex / area : 0,
  };
}

function strategicCostTargetStatusTone(status) {
  if (status === "Dentro da meta") return "Completo";
  if (status === "Acima da meta") return "Saldo crÃ­tico";
  if (status === "Abaixo da faixa") return "Pendente";
  return "Aguardando";
}

function worksAboveStrategicCostTarget() {
  return strategicCostTargetRows()
    .flatMap((row) => row.readings)
    .filter((reading) => reading.aboveTarget)
    .sort((a, b) => b.costM2 - a.costM2);
}

function workHasEVValuesForConclusion(work) {
  return (work?.ev?.lines || []).some((line) => {
    const status = normalizeEVLineStatus(line.status);
    return !isRiskLine(line) && status !== "NÃ£o se aplica" && Number(line.valorOrcado || 0) > 0;
  });
}

function worksWithCriticalBalance() {
  return budgetWorks().filter((work) => {
    const values = workTotals(work);
    const approvedBudget = values.orcado + values.aditivado;
    return approvedBudget > 0 && values.saldo / approvedBudget < 0.18;
  });
}

function allTotals(options = {}) {
  return budgetWorks().reduce(
    (total, work) => {
      const values = workTotals(work, options);
      total.orcado += values.orcado;
      total.aditivado += values.aditivado;
      total.contratado += values.contratado;
      total.saldo += values.saldo;
      return total;
    },
    { orcado: 0, aditivado: 0, contratado: 0, saldo: 0 }
  );
}

function pendingDemands() {
  return state.demands.filter((demand) => !["concluido", "cancelado"].includes(demand.coluna));
}

function overdueDemands() {
  return state.demands.filter(
    (demand) =>
      !["concluido", "cancelado"].includes(demand.coluna) &&
      demand.dataPrevistaEntrega &&
      demand.dataPrevistaEntrega < todayISO()
  );
}

function workContractsValue(work) {
  return (state.contracts || [])
    .filter((contract) => contract.obraId === work.id || contract.workId === work.id)
    .reduce((sum, contract) => sum + Number(contract.valor || contract.value || contract.amount || 0), 0);
}

function workFundUsedValue(work) {
  return (state.funds || [])
    .filter((fund) => fund.workId === work.id || fund.obraId === work.id)
    .reduce((sum, fund) => sum + Number(fund.used || fund.comprometido || fund.committed || 0), 0);
}

function workBudgetRevisionValue(work) {
  return (state.budgetRevisions || [])
    .filter((revision) => revision.workId === work.id || revision.obraId === work.id)
    .reduce((sum, revision) => sum + Number(revision.value || revision.valor || revision.total || 0), 0);
}

function bestHistoricalWorkValue(work) {
  const realized = Number(work?.realizedValue || work?.valorRealizado || work?.valorExecutado || work?.executedValue || 0);
  if (realized > 0) return realized;
  const contracts = workContractsValue(work);
  if (contracts > 0) return contracts;
  const usedFunds = workFundUsedValue(work);
  if (usedFunds > 0) return usedFunds;
  const revisions = workBudgetRevisionValue(work);
  if (revisions > 0) return revisions;
  return plannedWorkValue(work) || workBudgetValue(work);
}

function fundMovementTotal(fund, direction) {
  const id = fund?.id;
  if (!id) return 0;
  return (state.fundMovements || []).reduce((sum, movement) => {
    const value = Number(movement.valor || movement.value || movement.amount || 0);
    if (direction === "received" && (movement.toFundId === id || movement.to === id)) return sum + value;
    if (direction === "sent" && (movement.fromFundId === id || movement.from === id)) return sum + value;
    return sum;
  }, 0);
}

function fundAvailableBalance(fund) {
  const approved = Number(fund?.approved || fund?.valorAprovado || fund?.requested || fund?.valorSolicitado || 0);
  const received = fundMovementTotal(fund, "received");
  const sent = fundMovementTotal(fund, "sent");
  const committed = Number(fund?.committed || fund?.valorComprometido || fund?.used || fund?.valorUtilizado || 0);
  return approved + received - sent - committed;
}

function positiveFundsBalanceTotal() {
  return (state.funds || []).reduce((sum, fund) => {
    const balance = fundAvailableBalance(fund);
    return balance > 0 ? sum + balance : sum;
  }, 0);
}

function dashboardDemandRows() {
  const workRows = (state.demands || []).map((demand) => {
    const work = workById(demand.obraId);
    const status = demandStatusLabel(demand);
    return {
      id: demand.id,
      module: "Obras",
      title: work?.nome || demand.obraNome || demand.observacao || demand.id,
      status,
      rawStatus: demand.coluna || "",
      dueDate: demand.dataPrevistaEntrega || "",
      responsible: demand.analistaResponsavel || "",
      value: demandProducedValue(demand),
      active: !["concluido", "cancelado"].includes(demand.coluna),
      overdue: isDemandLate(demand),
      waitingFunds: normalizeSearchText(status).includes("verba"),
      validation: demandValidationColumnIds.includes(demand.coluna) || normalizeSearchText(status).includes("validacao"),
      waitingInfo: normalizeSearchText(status).includes("aguardando") && !normalizeSearchText(status).includes("verba"),
      unassigned: !demand.analistaResponsavel,
    };
  });

  const maintenanceRows = (state.maintenanceDemands || []).map((item) => {
    const isClinical = isClinicalMaintenanceDemand(item);
    const status = maintenanceStatusLabel(item);
    const active = !isMaintenanceClosed(item);
    return {
      id: item.id,
      module: isClinical ? "Eng. ClÃ­nica" : "ManutenÃ§Ã£o",
      title: item.titulo || item.unidadeNome || item.ordemServico || item.id,
      status,
      rawStatus: item.coluna || "",
      dueDate: item.dataPrevistaEntrega || item.dataFim || "",
      responsible: item.analistaResponsavel || "",
      value: maintenanceValue(item),
      active,
      overdue: active && (isMaintenanceLate(item) || Boolean(item.dataPrevistaEntrega && item.dataPrevistaEntrega < todayISO())),
      waitingFunds: normalizeSearchText(status).includes("verba"),
      validation: normalizeSearchText(status).includes("validacao"),
      waitingInfo: normalizeSearchText(status).includes("aguardando") && !normalizeSearchText(status).includes("verba"),
      unassigned: !item.analistaResponsavel,
    };
  });

  return [...workRows, ...maintenanceRows];
}

function dashboardDemandIndicators() {
  const rows = dashboardDemandRows();
  const active = rows.filter((row) => row.active);
  return {
    rows,
    active,
    overdue: active.filter((row) => row.overdue),
    waitingInfo: active.filter((row) => row.waitingInfo),
    validation: active.filter((row) => row.validation),
    waitingFunds: active.filter((row) => row.waitingFunds),
    unassigned: active.filter((row) => row.unassigned),
  };
}

function moduleDemandMetrics(module) {
  let rows = [];
  let value = 0;
  if (module === "works") {
    rows = dashboardDemandRows().filter((row) => row.module === "Obras");
    value = (state.works || []).reduce((sum, work) => sum + bestHistoricalWorkValue(work), 0);
  }
  if (module === "maintenance") {
    const items = maintenanceItemsForModule("maintenance");
    rows = dashboardDemandRows().filter((row) => row.module === "ManutenÃ§Ã£o");
    value = maintenanceValueTotals(items).salaTecnica;
  }
  if (module === "clinical") {
    const items = maintenanceItemsForModule("clinical");
    rows = dashboardDemandRows().filter((row) => row.module === "Eng. ClÃ­nica");
    value = maintenanceValueTotals(items).salaTecnica;
  }
  return {
    demands: rows,
    active: rows.filter((row) => row.active),
    overdue: rows.filter((row) => row.active && row.overdue),
    completed: rows.filter((row) => !row.active),
    value,
  };
}

function approvedSicTotal() {
  return state.sics
    .filter((sic) => sic.status === "Aprovado")
    .flatMap((sic) => sic.disciplinasAfetadas)
    .reduce((total, item) => total + item.valorDelta, 0);
}

function sicTotal(sic) {
  return sic.disciplinasAfetadas.reduce((total, item) => total + item.valorDelta, 0);
}

function workRiskReserve(work) {
  return (work?.ev.lines || []).filter(isRiskLine).reduce((sum, line) => sum + (line.valorOrcado || 0), 0);
}

function approvedPositiveSicTotalForWork(workId) {
  return sicsForWork(workId, "Aprovado").reduce((sum, sic) => sum + Math.max(sicTotal(sic), 0), 0);
}

function sicRiskReading(work, sic, totalOverride = null) {
  const total = Math.max(Number(totalOverride ?? (sic ? sicTotal(sic) : 0)) || 0, 0);
  const storedReserve = Number(sic?.riskReserveAtPost);
  const storedAvailable = Number(sic?.riskAvailableAtPost);
  const storedExcess = Number(sic?.riskExcessAtPost);
  const reserve = Number.isFinite(storedReserve) ? storedReserve : workRiskReserve(work);
  const available = Number.isFinite(storedAvailable)
    ? storedAvailable
    : Math.max(workRiskReserve(work) - approvedPositiveSicTotalForWork(work?.id), 0);
  const excess = Math.max(Number.isFinite(storedExcess) ? storedExcess : total - available, 0);
  return {
    total,
    reserve,
    available,
    excess,
    exceeded: Boolean(sic?.riskExceeded) || excess > 0,
  };
}

function categoryLabel(category) {
  if (category === "CustosDaObra") return "Custos da Obra";
  if (category === "Sics") return "SIC's";
  return "Outras Categorias";
}

const sicMotivoDefinitions = [
  { id: "RevisaoProjeto", label: "RevisÃ£o de Projeto" },
  { id: "RevisaoEscopo", label: "RevisÃ£o de Escopo" },
  { id: "EscopoComplementar", label: "Escopo Complementar" },
  { id: "SolicitacaoCampo", label: "SolicitaÃ§Ã£o de Campo" },
];

function normalizeSicMotivo(value) {
  const raw = String(value || "").trim();
  if (raw === "AlteracaoProjeto") return "RevisaoProjeto";
  return raw;
}

function motivationLabel(value) {
  const normalized = normalizeSicMotivo(value);
  const current = sicMotivoDefinitions.find((item) => item.id === normalized);
  if (current) return current.label;
  if (normalized === "InformacaoContratada") return "SolicitaÃ§Ã£o de InformaÃ§Ã£o da Contratada";
  return normalized || "NÃ£o informado";
}

function sicMotivoOptions(selected = "") {
  const normalized = normalizeSicMotivo(selected);
  const isCurrent = sicMotivoDefinitions.some((item) => item.id === normalized);
  const legacy = normalized && !isCurrent
    ? `<option value="${escapeAttribute(normalized)}" selected hidden>${escapeAttribute(motivationLabel(normalized))} (legado)</option>`
    : "";
  return legacy + sicMotivoDefinitions
    .map((item) => `<option value="${item.id}" ${item.id === normalized ? "selected" : ""}>${item.label}</option>`)
    .join("");
}

function demandTypeKey(value) {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (
    /\bsic\b/.test(normalized)
    || /solicitacao\s+(?:de\s+)?informac(?:ao|oes)/.test(normalized)
    || normalized.replace(/\s+/g, "") === "informacaocontratada"
  ) return "SIC";
  if (normalized.includes("demanda extra") || normalized.replace(/[^a-z0-9]/g, "") === "demandaextra" || normalized === "extra") return "DemandaExtra";
  if (normalized.includes("reemissao") || normalized.includes("revisao")) return "ReemissaoCompleta";
  if (normalized.includes("emissao") || normalized.includes("demanda inicial") || normalized.includes("novo orcamento")) return "EmissaoInicial";
  return value;
}

const workDemandTypeDefinitions = [
  {
    id: "EmissaoInicial",
    label: "EmissÃ£o Inicial",
    description: "Primeira anÃ¡lise orÃ§amentÃ¡ria de uma obra nova",
    icon: "â–£",
    iconClass: "",
  },
  {
    id: "ReemissaoCompleta",
    label: "RevisÃ£o de OrÃ§amento",
    description: "Atualiza o EV de uma obra que jÃ¡ possui estudo de viabilidade",
    icon: "â†»",
    iconClass: "demand-type-icon--blue",
  },
  {
    id: "DemandaExtra",
    label: "Demanda Extra",
    description: "Demanda adicional vinculada a uma obra e Ã  revisÃ£o do EV",
    icon: "+",
    iconClass: "demand-type-icon--blue",
  },
  {
    id: "SIC",
    label: "SIC",
    description: "SolicitaÃ§Ã£o de InformaÃ§Ã£o da Contratada vinculada a uma obra e ao EV",
    icon: "?",
    iconClass: "demand-type-icon--green",
  },
];

function demandTypeLabel(value) {
  const key = demandTypeKey(value);
  return workDemandTypeDefinitions.find((type) => type.id === key)?.label || value;
}

function newWorkDemandColumn(type) {
  return ["EmissaoInicial", "ReemissaoCompleta", "DemandaExtra"].includes(demandTypeKey(type))
    ? "pullPlanning"
    : "fazer";
}

function demandTypeCardLabel(value) {
  const map = {
    EmissaoInicial: "EmissÃ£o Inicial",
    ReemissaoCompleta: "Rev. OrÃ§.",
    DemandaExtra: "Dem. Extra",
    SIC: "SIC",
  };
  return map[demandTypeKey(value)] || "Demanda";
}

function nextCode(prefix, collection) {
  const items = Array.isArray(collection) ? collection : [];
  const highest = items.reduce((max, item) => {
    const numeric = Number(String(item?.id || "").replace(`${prefix}-`, ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);
  return `${prefix}-${String(highest + 1).padStart(3, "0")}`;
}

function nextDemandCode() {
  return nextCode("DEM", [
    ...(state.demands || []),
    ...(state.deletedDemands || []),
  ]);
}

function nextContractNumber() {
  const highest = state.contracts.reduce((max, contract) => {
    const match = String(contract.numeroContrato || "").match(/^CT-2026-(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `CT-2026-${String(highest + 1).padStart(3, "0")}`;
}

function addHistory({ entidade, entidadeId, campo, valorAnterior, valorNovo }) {
  if (!Array.isArray(state.history)) state.history = clone(baseState.history || []);
  state.history.unshift({
    id: nextCode("HIS", state.history),
    entidade,
    entidadeId,
    campo,
    valorAnterior,
    valorNovo,
    usuario: "GestÃ£o ST",
    timestamp: new Date().toISOString(),
  });
}



function downloadCsv(filename, headers, rows) {
  const content = [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportWorksOperationalReport() {
  const rows = filteredDemands().map((demand) => {
    const work = workById(demand.obraId);
    const sicInfo = demandSicInfo(demand) || {};
    return [
      demand.id,
      demandTypeLabel(demand.tipo),
      work?.nome || demand.obraNome || "Obra nÃ£o vinculada",
      work?.codigoOriginal || work?.chaveUnica || "",
      demand.unidadeModo === "existente" ? "Obra em unidade existente" : "Unidade nova",
      demand.unidadeNome || "",
      demand.unidadeTipo || "",
      demand.unidadeMunicipio || "",
      demand.unidadeCnpj || "",
      demand.unidadeCentro || "",
      demandAnalystNames(demand).join(" | ") || "A definir",
      demandSprintIds(demand).length ? demandSprintNames(demand, " | ") : "",
      demandStatusLabel(demand),
      demand.prioridade || "",
      demand.dataPrevistaInicio || "",
      demand.dataPrevistaEntrega || "",
      demand.dataEntregaReal || "",
      isDemandLate(demand) ? "Atrasado" : "Em dia",
      sicInfo.lecomNumber || "",
      sicInfo.tituloSic || "",
      isEngineeringMeetingSic(demand) ? "Sim" : "NÃ£o",
      demandHasRecordedValue(demand) ? money(demandRecordedValue(demand)) : "",
      demand.observacao || "",
    ];
  });
  downloadCsv(
    `SLT360-relatorio-operacional-${todayISO()}.csv`,
    ["CÃ³digo", "Tipo", "Obra", "CÃ³digo obra", "Tipo intervenÃ§Ã£o", "Unidade base", "Tipo unidade base", "Cidade/UF base", "CNPJ base", "Centro base", "Analistas", "Sprint", "Status", "Prioridade", "InÃ­cio previsto", "Entrega prevista", "Entrega real", "Prazo", "NÂº LECOM", "TÃ­tulo SIC", "Cobrado em reuniÃ£o", "Valor da demanda", "ObservaÃ§Ã£o"],
    rows
  );
  showToast(`RelatÃ³rio de Obras exportado com ${rows.length} card(s).`);
}

function exportMaintenanceOperationalReport() {
  const labels = maintenanceModuleLabels();
  const rows = filteredMaintenanceDemands().map((item) => [
    item.id,
    item.ordemServico || "",
    item.codigoOrigem || "",
    item.titulo || "",
    item.unidadeNome || "",
    item.uf || "",
    item.cnpj || "",
    item.centroCusto || "",
    item.tipoDemanda || "",
    item.tipoDespesa || "",
    item.tipologia || "",
    maintenanceSprintName(item),
    maintenanceStatusLabel(item),
    item.analistaResponsavel || "A definir",
    item.prioridade || "",
    item.dataInicio || "",
    item.dataPrevistaEntrega || "",
    item.dataFim || "",
    `${maintenanceLeadTime(item)} dias`,
    `${maintenancePhaseDays(item)} dias`,
    money(maintenanceMoneyValue(item, "valorProposta")),
    money(maintenanceMoneyValue(item, "valorSalaTecnica")),
    isMaintenanceOpex(item) ? "" : money(maintenanceMoneyValue(item, "valorNegociado")),
    clinicalEquipmentName(item) || "",
    item.patrimonio || item.numeroSerie || "",
    item.fabricante || "",
    item.modelo || "",
    item.planejamento || "",
    item.observacoes || "",
  ]);
  downloadCsv(
    `SLT360-${labels.isClinical ? "engenharia-clinica" : "manutencao"}-kanban-${todayISO()}.csv`,
    ["ID", "OS", "CÃ³digo origem", "TÃ­tulo", "Unidade", "UF", "CNPJ", "Centro de custo", "Tipo demanda", "Tipo despesa", "Tipologia", "Sprint", "Fase", "Analista", "Prioridade", "InÃ­cio", "Entrega prevista", "Fim", "Lead time", "Tempo na fase", "Valor proposta", "Valor Sala TÃ©cnica", "Valor negociado CAPEX", "Equipamento", "PatrimÃ´nio/sÃ©rie", "Fabricante", "Modelo", "Planejamento", "ObservaÃ§Ãµes"],
    rows
  );
  showToast(`RelatÃ³rio de ${labels.short} exportado com ${rows.length} card(s).`);
}

function activeRole() {
  return authenticatedRole();
}

function canDeleteDemand() {
  return ["Admin", "Gestor"].includes(activeRole()) && globalThis.SLT_CLOUD.canWrite("works");
}

function canAccessView(view) { const module = viewModule(viewAliases[view] || view); return module !== "projects" && canAccessModule(module); }

const demandLifecycleActions = new Set([
  "open-demand", "open-global-demand", "open-global-demand-type", "open-maintenance-demand", "open-project-demand",
  "create-clinical-demand-for-asset", "create-budget-from-project", "start-budget-from-plan", "start-demand-wizard",
  "submit-demand-step", "submit-demand-form", "open-delete-demand",
]);

function analystDemandLifecycleBlocked(action = "") {
  return activeRole() === "Analista" && demandLifecycleActions.has(action);
}

function demandLifecycleDeniedMessage() {
  return "Analistas podem preencher, alterar e mover demandas existentes, mas nÃ£o podem criar ou excluir demandas.";
}

function ensureDemandLifecycleAllowed(form = null) {
  if (activeRole() !== "Analista") return true;
  if (form) showFormError(demandLifecycleDeniedMessage(), form);
  else showToast(demandLifecycleDeniedMessage());
  return false;
}

function canMutateUI(action) {
  if (analystDemandLifecycleBlocked(action)) return false;
  const module = /sprint|supplier/.test(action) ? "settings" : dataUIModuleForView(currentView);
  if (["open-demand", "open-global-demand", "open-maintenance-demand"].includes(action)) {
    return globalThis.SLT_CLOUD.canWritePermission?.(module) ?? globalThis.SLT_CLOUD.canWrite(module);
  }
  const writeAction = /^(save-|delete-|approve-|reject-|post-|move-|update-|create-|edit-)/.test(action) || ["open-work","open-contract","open-sprint","open-delete-demand","open-ev-reference-targets","open-strategic-targets","open-config-catalog"].includes(action);
  if (!writeAction) return true;
  return globalThis.SLT_CLOUD.canWrite(module);
}

function applyRolePermissions() {
  const role = activeRole();
  const user = currentUser();
  const requiresPasswordChange = Boolean(user?.mustChangePassword || user?.senhaProvisoria);
  document.body.classList.toggle("is-logged-out", !user);
  document.querySelectorAll("[data-view]").forEach((element) => {
    const view = viewAliases[element.dataset.view] || element.dataset.view;
    const module = viewModule(view);
    if (module !== "home") element.hidden = requiresPasswordChange || !canAccessView(view);
  });
  const chip = document.querySelector(".user-chip");
  if (chip) {
    chip.textContent = user ? `${user.nome} Â· ${requiresPasswordChange ? "Primeiro acesso" : role}` : "Acesso";
    chip.title = user?.email || roleDefinitions[role]?.description || "";
  }
  const headerSearch = document.querySelector(".header-actions .search-box");
  const headerNewDemand = document.querySelector('.header-actions [data-action="open-demand"], .header-actions [data-action="open-global-demand"]');
  const isHome = currentView === "dashboard" || !user || requiresPasswordChange;
  if (headerSearch) headerSearch.hidden = isHome;
  if (headerNewDemand) headerNewDemand.hidden = isHome;
  document.querySelectorAll('[data-action]').forEach(button => {
    if (analystDemandLifecycleBlocked(button.dataset.action)) {
      button.hidden = true;
      button.disabled = true;
      button.title = demandLifecycleDeniedMessage();
    } else if (!canMutateUI(button.dataset.action)) {
      button.disabled = true;
      button.title = 'Seu acesso permite apenas consulta.';
    }
  });
  const logoutButton = document.querySelector('[data-action="logout"]');
  if (logoutButton) logoutButton.hidden = !user;
}

function updateViewNavigation(view) {
  document.querySelectorAll("[data-view]").forEach((button) => {
    const isTopProjects = button.dataset.module === "projects" && projectViewIds.includes(view);
    const isTopWorks = button.dataset.module === "works" && worksViewIds.includes(view);
    const isTopMaintenance = button.dataset.module === "maintenance" && maintenanceViewIds.includes(view);
    const isTopClinical = button.dataset.module === "clinical" && clinicalViewIds.includes(view);
    const aliasedButtonView = viewAliases[button.dataset.view] || button.dataset.view;
    button.classList.toggle("is-active", aliasedButtonView === view || isTopProjects || isTopWorks || isTopMaintenance || isTopClinical);
  });
}

function renderModuleLoading(view) {
  const labels = { works: "Obras", maintenance: "ManutenÃ§Ã£o", clinical: "Engenharia ClÃ­nica", budget: "Controle de Verba", settings: "ConfiguraÃ§Ãµes" };
  const module = dataUIModuleForView(view);
  app.innerHTML = globalThis.SLT_CLOUD.cleanHTML(`
    <section class="panel module-loading-panel" aria-live="polite" aria-busy="true">
      <span class="eyebrow">Carregando banco</span>
      <h1>${labels[module] || "MÃ³dulo"}</h1>
      <p>Buscando e conferindo os dados antes de liberar consultas e inserÃ§Ãµesâ€¦</p>
    </section>
  `);
}

function rememberedView() {
  try {
    return sessionStorage.getItem(LAST_VIEW_STORAGE_KEY) || "dashboard";
  } catch {
    return "dashboard";
  }
}

function rememberView(view) {
  const normalizedView = viewAliases[view] || view || "dashboard";
  try {
    sessionStorage.setItem(LAST_VIEW_STORAGE_KEY, normalizedView);
    sessionStorage.setItem(LAST_UI_MODULE_STORAGE_KEY, dataUIModuleForView(normalizedView));
  } catch {}
}

async function setView(view, options = {}) {
  const allowPreview = options.allowPreview !== false;
  const remember = options.remember !== false;
  const scroll = options.scroll !== false;
  if (view === "investmentPlan" || view === "projectsPlan") view = "projectsPortfolio";
  view = viewAliases[view] || view;
  if (!canAccessView(view)) {
    showToast("Seu perfil nÃ£o possui acesso a esta visÃ£o.");
    view = "dashboard";
  }
  const request = ++viewNavigationRequest;
  const previousView = currentView;
  const dataModule = dataUIModuleForView(view);
  updateViewNavigation(view);
  if (dataModule !== "home" && !globalThis.SLT_CLOUD.isModuleLoaded(dataModule)) {
    renderModuleLoading(view);
    try {
      const normalizedView = viewAliases[view] || view;
      if (allowPreview && normalizedView === "worksOperational" && typeof globalThis.SLT_CLOUD.previewModule === "function") {
        try {
          await globalThis.SLT_CLOUD.previewModule(dataModule);
          if (request !== viewNavigationRequest) return;
          currentView = view;
          render();
        } catch (previewError) {
          console.warn("A prÃ©via rÃ¡pida de Obras nÃ£o foi carregada; seguindo com o carregamento completo.", previewError);
        }
      }
      await globalThis.SLT_CLOUD.ensureModule(dataModule);
    } catch (error) {
      if (request !== viewNavigationRequest) return;
      currentView = previousView;
      updateViewNavigation(previousView);
      render();
      showToast(error.message || "NÃ£o foi possÃ­vel carregar os dados deste mÃ³dulo.");
      return;
    }
  }
  if (request !== viewNavigationRequest) return;
  currentView = view;
  updateViewNavigation(view);
  if (remember) rememberView(view);
  render();
  if (scroll) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.querySelector(".app-shell")?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
  }
}

function render() {
  if (!canAccessView(currentView)) currentView = "dashboard";
  const views = {
    dashboard: renderDashboard,
    team: renderTeam,
    projectsHome: renderProjectsHome,
    projectsPortfolio: renderProjectsPortfolio,
    projectsPlan: renderProjectsPortfolio,
    projectsOperational: renderProjectsOperational,
    projectsManagement: renderProjectsManagement,
    projectsStrategic: renderProjectsStrategic,
    worksHome: renderWorksHome,
    worksOperational: renderWorksOperational,
    worksManagement: renderWorksManagement,
    worksStrategic: renderWorksStrategic,
    worksStrategicFinance: () => renderStrategicFinance(portfolioRows(false,false), renderWorksToolbar("worksStrategicFinance","VisÃ£o EstratÃ©gico-Financeira","IntegraÃ§Ã£o CAPEX 2026")),
    worksSettings: renderWorksSettings,
    kanban: renderWorksOperational,
    portfolio: renderPortfolio,
    investmentPlan: renderProjectsPortfolio,
    ev: renderPortfolio,
    maintenance: renderMaintenance,
    maintenanceOperational: renderMaintenanceOperational,
    maintenanceReports: renderMaintenanceReports,
    maintenanceTimeline: renderMaintenanceTimeline,
    maintenanceExecutive: renderMaintenanceExecutive,
    maintenanceSettings: renderMaintenanceSettings,
    clinical: renderClinical,
    clinicalOperational: renderClinicalOperational,
    clinicalReports: renderClinicalReports,
    clinicalTimeline: renderClinicalTimeline,
    clinicalExecutive: renderClinicalExecutive,
    clinicalSettings: renderClinicalSettings,
    budget: renderBudgetControl,
    reports: renderReports,
    sics: renderSics,
    sicApprovals: renderSicApprovalsTab,
    analytics: renderAnalytics,
    suppliers: renderSuppliers,
    settings: renderSettings,
  };
  unmountSicApprovals();
  app.innerHTML = globalThis.SLT_CLOUD.cleanHTML((views[currentView] || renderDashboard)());
  if (currentView === 'worksStrategicFinance') bindCapex2026Import(render);
  if (currentView === 'sicApprovals') unmountSicApprovals = mountSicApprovals(app.querySelector('#sicApprovalsMount'), globalThis.SLT_CLOUD, state.works, state.demands);
  refreshHaptecAssistant();
  applyRolePermissions();
  enhanceSortableTables();
  mountKanbanTopScrollbars();
  scheduleDashboardCharts();
}

function enhanceSortableTables() {
  document.querySelectorAll("table.data-table:not([data-no-sort])").forEach((table, tableIndex) => {
    table.dataset.sortableTable = table.dataset.sortableTable || `table-${tableIndex}`;
    table.querySelectorAll("tbody tr").forEach((row, rowIndex) => {
      if (!row.dataset.originalSortIndex) row.dataset.originalSortIndex = String(rowIndex);
    });
    table.querySelectorAll("thead th").forEach((header, columnIndex) => {
      if (header.querySelector('[data-action="sort-ev-history"], [data-action="sort-generic-table"]')) return;
      const label = header.textContent.trim();
      if (!label || normalizeSearchText(label) === "acao") return;
      header.classList.add("generic-sortable-th");
      header.innerHTML = globalThis.SLT_CLOUD.cleanHTML(`<button type="button" data-action="sort-generic-table" data-column-index="${columnIndex}" title="Clique: maior para menor; segundo clique: menor para maior; terceiro clique: ordem original"><span>${escapeAttribute(label)}</span><i>â†•</i></button>`);
    });
  });
}

function mountKanbanTopScrollbars() {
  kanbanScrollObservers.forEach((observer) => observer.disconnect());
  kanbanScrollObservers = [];

  document.querySelectorAll("[data-kanban-top-scroll]").forEach((topScroll) => {
    const board = topScroll.nextElementSibling;
    const track = topScroll.querySelector("[data-kanban-scroll-track]");
    const thumb = topScroll.querySelector("[data-kanban-scroll-thumb]");
    if (!board?.matches("[data-kanban-scroll-board]") || !track || !thumb) return;

    let maxScroll = 0;
    let thumbTravel = 0;
    let dragOffset = 0;
    let dragging = false;

    const syncTop = () => {
      const progress = maxScroll ? board.scrollLeft / maxScroll : 0;
      thumb.style.transform = `translateX(${Math.min(thumbTravel, Math.max(0, progress * thumbTravel))}px)`;
      topScroll.setAttribute("aria-valuenow", String(Math.round(board.scrollLeft)));
    };
    const updateWidth = () => {
      maxScroll = Math.max(0, board.scrollWidth - board.clientWidth);
      const trackWidth = track.clientWidth;
      const innerTrackWidth = Math.max(0, trackWidth - 4);
      const visibleRatio = board.scrollWidth ? board.clientWidth / board.scrollWidth : 1;
      const thumbWidth = Math.min(innerTrackWidth, Math.max(56, innerTrackWidth * visibleRatio));
      thumb.style.width = `${thumbWidth}px`;
      thumbTravel = Math.max(0, innerTrackWidth - thumbWidth);
      topScroll.hidden = maxScroll <= 1;
      topScroll.setAttribute("aria-valuemax", String(Math.round(maxScroll)));
      syncTop();
    };
    const moveFromPointer = (clientX) => {
      const trackBox = track.getBoundingClientRect();
      const thumbLeft = Math.min(thumbTravel, Math.max(0, clientX - trackBox.left - dragOffset));
      board.scrollLeft = thumbTravel ? (thumbLeft / thumbTravel) * maxScroll : 0;
      syncTop();
    };

    board.addEventListener("scroll", syncTop, { passive: true });
    track.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      const thumbBox = thumb.getBoundingClientRect();
      const insideThumb = event.clientX >= thumbBox.left && event.clientX <= thumbBox.right;
      dragOffset = insideThumb ? event.clientX - thumbBox.left : thumbBox.width / 2;
      dragging = true;
      track.setPointerCapture(event.pointerId);
      moveFromPointer(event.clientX);
    });
    track.addEventListener("pointermove", (event) => {
      if (dragging) moveFromPointer(event.clientX);
    });
    const endDrag = () => { dragging = false; };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    topScroll.addEventListener("keydown", (event) => {
      const step = event.key === "PageDown" || event.key === "PageUp" ? board.clientWidth * 0.8 : 80;
      if (event.key === "Home") board.scrollLeft = 0;
      else if (event.key === "End") board.scrollLeft = maxScroll;
      else if (event.key === "ArrowRight" || event.key === "PageDown") board.scrollLeft += step;
      else if (event.key === "ArrowLeft" || event.key === "PageUp") board.scrollLeft -= step;
      else return;
      event.preventDefault();
      syncTop();
    });
    topScroll.addEventListener("wheel", (event) => {
      const delta = event.deltaX || event.deltaY;
      if (!delta || maxScroll <= 1) return;
      const before = board.scrollLeft;
      board.scrollLeft = Math.min(maxScroll, Math.max(0, before + delta));
      if (Math.abs(board.scrollLeft - before) < 0.5) return;
      event.preventDefault();
      syncTop();
    }, { passive: false });
    updateWidth();
    window.requestAnimationFrame?.(updateWidth);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateWidth);
      observer.observe(board);
      kanbanScrollObservers.push(observer);
    }
  });
}

function renderKanbanTopScrollbar(label = "Rolagem horizontal do Kanban") {
  return `
    <div class="kanban-top-scroll" data-kanban-top-scroll role="scrollbar" aria-label="${escapeAttribute(label)}" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" tabindex="0">
      <div class="kanban-top-scroll-track" data-kanban-scroll-track>
        <div class="kanban-top-scroll-thumb" data-kanban-scroll-thumb></div>
      </div>
    </div>
  `;
}

function genericTableSortValue(cell) {
  const raw = String(cell?.dataset.sortValue || cell?.innerText || cell?.textContent || "").trim();
  const compact = raw.replace(/\s+/g, " ");
  const numericCandidate = compact.replace(/R\$\s?/gi, "").replace(/\s?(mÂ²|mi|mil|bi|%|sics?|obras?)\b/gi, "").trim();
  if (/^-?[\d.]+(?:,\d+)?$/.test(numericCandidate)) {
    let multiplier = 1;
    if (/\bmil\b/i.test(compact)) multiplier = 1e3;
    if (/\bmi\b/i.test(compact)) multiplier = 1e6;
    if (/\bbi\b/i.test(compact)) multiplier = 1e9;
    return { type: "number", value: Number(numericCandidate.replace(/\./g, "").replace(",", ".")) * multiplier };
  }
  const isoDate = compact.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) return { type: "number", value: Number(`${isoDate[1]}${isoDate[2]}${isoDate[3]}`) };
  return { type: "text", value: normalizeSearchText(compact) };
}

function sortGenericTable(button) {
  const table = button.closest("table");
  if (!table) return;
  const columnIndex = Number(button.dataset.columnIndex);
  const sameColumn = Number(table.dataset.sortColumn) === columnIndex;
  const current = sameColumn ? table.dataset.sortDirection || "" : "";
  const direction = current === "" ? "desc" : current === "desc" ? "asc" : "";
  table.dataset.sortColumn = direction ? String(columnIndex) : "";
  table.dataset.sortDirection = direction;
  table.querySelectorAll('[data-action="sort-generic-table"] i').forEach((icon) => { icon.textContent = "â†•"; });
  button.querySelector("i").textContent = direction === "desc" ? "â†“" : direction === "asc" ? "â†‘" : "â†•";
  table.querySelectorAll("tbody").forEach((body) => {
    const rows = [...body.querySelectorAll(":scope > tr")];
    rows.sort((left, right) => {
      if (!direction) return Number(left.dataset.originalSortIndex) - Number(right.dataset.originalSortIndex);
      const a = genericTableSortValue(left.children[columnIndex]);
      const b = genericTableSortValue(right.children[columnIndex]);
      const comparison = a.type === "number" && b.type === "number" ? a.value - b.value : String(a.value).localeCompare(String(b.value), "pt-BR");
      return (direction === "desc" ? -1 : 1) * comparison || Number(left.dataset.originalSortIndex) - Number(right.dataset.originalSortIndex);
    });
    rows.forEach((row) => body.appendChild(row));
  });
}

function scheduleDashboardCharts() {
  const callback = () => {
    const needsCharts = document.querySelector("#sankeyChart, #monthlyChart, #sendersChart, #receiversChart, #chartLine, #chartAcumulado, #chartDesvio, #chartStacked");
    if (needsCharts && (!globalThis.echarts || !globalThis.Chart)) {
      globalThis.SLT_CLOUD.ensureCharts().then(() => {
        if (needsCharts.isConnected) callback();
      }).catch(() => {
        if (needsCharts.isConnected) renderTransferChartEmpty(needsCharts.id, "NÃ£o foi possÃ­vel carregar a biblioteca de grÃ¡ficos.");
      });
      return;
    }
    renderTransferDashboardCharts();
    renderHapcapexDashboardCharts();
    mountSicApprovalView();
  };
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(callback);
    return;
  }
  setTimeout(callback, 0);
}

function mountSicApprovalView() {
  const host = document.querySelector('#sicApprovalDashboard');
  if (!host) return;
  if (!sicDashboardModulePromise) sicDashboardModulePromise = import('./sic-dashboard.js');
  sicDashboardModulePromise.then(({ mountSicDashboard }) => {
    if (!host.isConnected) return;
    mountSicDashboard(host, {
      cleanHTML: globalThis.SLT_CLOUD.cleanHTML,
      canWrite: () => globalThis.SLT_CLOUD.canWrite('works'),
      load: () => ({obras: structuredClone(state.sicApprovalWorks || []), weeks: structuredClone(state.sicApprovalWeeks || []), snapshots: structuredClone(state.sicApprovalSnapshots || [])}),
      async save({obras, weeks, snapshots}) {
        if (!globalThis.SLT_CLOUD.canWrite('works')) throw new Error('Seu acesso permite apenas consulta.');
        state.sicApprovalWorks = structuredClone(obras);
        state.sicApprovalWeeks = structuredClone(weeks);
        state.sicApprovalSnapshots = structuredClone(snapshots);
        await globalThis.SLT_CLOUD.saveAndWait('works', persistedStatePayload());
      },
    });
  }).catch(() => {
    if (host.isConnected) host.innerHTML = '<div class="empty-state">NÃ£o foi possÃ­vel carregar o painel de SICs.</div>';
  });
}

function renderToolbar(title, subtitle, actions = "", module = null) {
  const moduleIntro = module?.label === title ? module.eyebrow : module?.label;
  const titleBlock = module
    ? `
      <div class="toolbar-title">
        <span class="toolbar-logo" data-tone="${module.tone}" aria-hidden="true">
          <img src="${module.logo}" alt="" />
        </span>
        <div>
          <span class="toolbar-module">${moduleIntro}</span>
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
      </div>
    `
    : `
      <div>
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
    `;

  return `
    <div class="toolbar">
      ${titleBlock}
      <div class="inline-actions">${actions}</div>
    </div>
  `;
}

function haptecGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const haptecPersona = Object.freeze({
  name: "Suporte360",
  role: "assistente generativo, guia de navegaÃ§Ã£o, analista de dados e auditor proativo do SLT 360",
  missingData:
    "Ainda nÃ£o encontrei esse dado atualizado no SLT 360. Gostaria de navegar atÃ© a tela de cadastro para inseri-lo?",
});

const haptecFaceStates = new Set(["smiling_ready", "validating", "error_alert", "thinking", "searching"]);
const haptecFaceTagRegex = /^\[FACE:\s*(smiling_ready|validating|error_alert|thinking|searching)\]\s*/i;

function haptecWithFace(face, text) {
  const state = haptecFaceStates.has(face) ? face : "smiling_ready";
  const cleanText = String(text || "").replace(haptecFaceTagRegex, "").trim();
  return `[FACE: ${state}]\n${cleanText}`;
}

function haptecExtractFace(text = "") {
  const match = String(text || "").match(haptecFaceTagRegex);
  return match?.[1] || "smiling_ready";
}

function haptecVisibleText(text = "") {
  return String(text || "").replace(haptecFaceTagRegex, "").trim();
}

function haptecMissingDataMessage(context = "") {
  return context ? `${context}\n${haptecPersona.missingData}` : haptecPersona.missingData;
}

function haptecCurrentContext() {
  if (currentView === "dashboard") return "InÃ­cio";
  if (projectViewIds.includes(currentView)) return "Projetos 360";
  if (["portfolio", "investmentPlan"].includes(currentView)) return "PortfÃ³lio de Obras";
  if (["worksOperational", "kanban"].includes(currentView)) return "Operacional de Obras";
  if (currentView === "worksManagement") return "Gerencial de Obras";
  if (currentView === "worksStrategic") return "EstratÃ©gica de Obras";
  if (currentView === "sics") return "Estudo de SIC's";
  if (currentView === "maintenanceOperational") return "Operacional de ManutenÃ§Ã£o";
  if (maintenanceViewIds.includes(currentView)) return "ManutenÃ§Ã£o";
  if (currentView === "clinical") return "Engenharia ClÃ­nica";
  if (currentView === "budget") return "Controle de Verbas";
  return "SLT 360";
}

function haptecWelcomeText() {
  return haptecWithFace(
    "smiling_ready",
    `${haptecGreeting()}! Sou o Suporte360, seu guia, analista de dados e auditor da Sala TÃ©cnica. Posso te ajudar a navegar, encontrar obras, conferir Kanban, EVs, SICs, verbas e indicadores. VocÃª estÃ¡ em ${haptecCurrentContext()}.`
  );
}

function haptecViewHelp() {
  if (currentView === "dashboard") {
    return "Na tela inicial vocÃª escolhe o mÃ³dulo principal: Obras, ManutenÃ§Ã£o, Eng. ClÃ­nica ou Controle de Verbas. Ã‰ o hub integrador da Sala TÃ©cnica, feito para entrar rÃ¡pido no fluxo certo.";
  }
  if (projectViewIds.includes(currentView)) {
    return "Em Projetos 360 vocÃª acompanha o Plano de Investimento, prazos de entrega de projetos e o Kanban que alimenta o inÃ­cio da orÃ§amentaÃ§Ã£o na Sala TÃ©cnica.";
  }
  if (["portfolio", "investmentPlan"].includes(currentView)) {
    return "No PortfÃ³lio de Obras ficam todas as obras cadastradas. Use a busca e os filtros para localizar a obra; o EV aparece quando jÃ¡ estiver vinculado.";
  }
  if (["worksOperational", "kanban"].includes(currentView)) {
    return "No Operacional de Obras vocÃª acompanha a esteira em Kanban ou lista. Caminho rÃ¡pido: filtre a sprint ou analista, clique no card, atualize status e confira EV antes de concluir.";
  }
  if (currentView === "sics") {
    return "No Estudo de SIC's vocÃª acompanha exclusivamente os cards de SIC da Demanda Operacional. Use os filtros para localizar obra, motivo, status, sprint, analista ou tipologia.";
  }
  if (currentView === "maintenanceOperational") {
    return "No Operacional de ManutenÃ§Ã£o o Kanban segue as fases Pipefy. Use os filtros de sprint, fase, tipo de despesa, centro de custo e tipologia para limpar a fila.";
  }
  if (maintenanceViewIds.includes(currentView)) {
    return "Em ManutenÃ§Ã£o vocÃª analisa OS, lead time, valores de proposta, valor Sala TÃ©cnica, saving tÃ©cnico e concentraÃ§Ã£o por unidade, estado, tipologia e centro de custo.";
  }
  if (currentView === "budget") {
    return "No Controle de Verbas vocÃª cruza verba aportada, EV, contrataÃ§Ã£o, risco e SICs. Ã‰ a rÃ©gua financeira do projeto, antes que algum valor saia do prumo.";
  }
  return `VocÃª estÃ¡ em ${haptecCurrentContext()}. Posso te indicar filtros, atalhos e prÃ³ximos passos da navegaÃ§Ã£o.`;
}

function haptecModuleSummary() {
  return [
    "Obras: portfÃ³lio, EV, orÃ§amentaÃ§Ã£o, SICs, planejamento, cronograma e visÃµes gerenciais.",
    "ManutenÃ§Ã£o: OS, unidades, Kanban, SLA, lead time, valores, saving tÃ©cnico e desempenho operacional.",
    "Eng. ClÃ­nica: parque tecnolÃ³gico, ativos, OS, demandas assistenciais, qualidade e histÃ³rico por equipamento.",
    "Controle de Verbas: FEL, verba aportada, EV, contrataÃ§Ã£o, risco, aditivos, SICs e governanÃ§a orÃ§amentÃ¡ria."
  ].join("\n");
}

function haptecTopEVWork() {
  return budgetWorks()
    .map((work) => ({ work, value: workBudgetValue(work) }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)[0];
}

function haptecTopEVAnswer() {
  const top = haptecTopEVWork();
  if (!top) return haptecMissingDataMessage("Ainda nÃ£o encontrei EV com valor preenchido. Caminho sugerido: Obras > EV > Abrir EV.");
  const area = top.work.areaEquivalente || top.work.areaConstruida || 0;
  const costM2 = area ? top.value / area : 0;
  return [
    `A obra com maior valor de EV hoje Ã© ${top.work.nome}.`,
    `Valor do EV: ${money(top.value)}.`,
    `${top.work.regiao || "Sem regiÃ£o"} | ${top.work.tipoUnidade || "Sem tipologia"}${costM2 ? ` | ${money(costM2)}/mÂ²` : ""}.`,
    "PrÃ³ximo passo: abrir a composiÃ§Ã£o do EV para validar disciplinas de maior impacto."
  ].join("\n");
}

function haptecPortfolioDataAnswer() {
  const totals = allTotals();
  const capex = totals.orcado + totals.aditivado;
  const completed = budgetWorks().filter((work) => effectiveEVStatus(work) === "Completo").length;
  const incomplete = budgetWorks().filter((work) => effectiveEVStatus(work) === "Incompleto").length;
  const withoutEV = budgetWorks().filter((work) => effectiveEVStatus(work) === "Sem EV").length;
  const top = haptecTopEVWork();
  return [
    `O portfÃ³lio tem ${budgetWorks().length} obra(s).`,
    `CAPEX/EV consolidado: ${money(capex)}.`,
    `${completed} EV(s) completo(s), ${incomplete} incompleto(s) e ${withoutEV} obra(s) sem EV.`,
    top ? `Maior EV: ${top.work.nome}, com ${money(top.value)}.` : "Ainda sem EV valorizado."
  ].join("\n");
}

function haptecSicDataAnswer() {
  const total = state.sics.length;
  if (!total) return haptecMissingDataMessage("Ainda nÃ£o hÃ¡ SIC cadastrada na base atual.");
  const approved = state.sics.filter((sic) => sic.status === "Aprovado");
  const pending = state.sics.filter((sic) => sic.status === "Pendente");
  const approvedValue = approved.reduce((sum, sic) => sum + sicTotal(sic), 0);
  const top = state.sics
    .map((sic) => ({ sic, value: Math.abs(sicTotal(sic)) }))
    .sort((a, b) => b.value - a.value)[0];
  return [
    `Temos ${total} SIC(s) cadastrada(s) no sistema.`,
    `${approved.length} aprovada(s), ${pending.length} pendente(s).`,
    `Impacto aprovado no EV: ${money(approvedValue)}.`,
    top ? `Maior SIC: ${top.sic.titulo || top.sic.id}, com ${money(top.value)}.` : "Ainda sem valor de SIC para analisar."
  ].join("\n");
}

function haptecHasAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function haptecCountBy(items, getKey) {
  const map = new Map();
  items.forEach((item) => {
    const key = getKey(item) || "NÃ£o informado";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || String(a.label).localeCompare(String(b.label), "pt-BR"));
}

function haptecValueBy(items, getKey, getValue) {
  const map = new Map();
  items.forEach((item) => {
    const key = getKey(item) || "NÃ£o informado";
    map.set(key, (map.get(key) || 0) + Number(getValue(item) || 0));
  });
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || String(a.label).localeCompare(String(b.label), "pt-BR"));
}

function haptecRowsText(rows, valueFormatter = (value) => String(value), limit = 5) {
  if (!rows.length) return "Sem dados para listar.";
  return rows
    .slice(0, limit)
    .map((row, index) => `${index + 1}. ${row.label}: ${valueFormatter(row.count ?? row.value)}`)
    .join("\n");
}

function haptecWorksKanbanItems() {
  return filteredDemands();
}

function haptecWorksKanbanScope() {
  return operationalActiveFilterText() ? "no filtro atual do Operacional de Obras" : "na esteira de Obras";
}

function haptecWorksKanbanAnswer(text) {
  const items = haptecWorksKanbanItems();
  const scope = haptecWorksKanbanScope();
  const late = items.filter(isDemandLate);
  const active = items.filter((item) => !["concluido", "cancelado"].includes(item.coluna));
  const doing = items.filter((item) => item.coluna === "fazendo");
  const validation = items.filter((item) => demandValidationColumnIds.includes(item.coluna));
  const sicCards = items.filter((item) => demandTypeKey(item.tipo) === "SIC");

  if (haptecHasAny(text, ["analista", "responsavel"])) {
    const rows = haptecCountBy(items, (item) => item.analistaResponsavel || "A definir");
    return `Cards de Obras por analista ${scope}:\n${haptecRowsText(rows, (value) => `${value} card(s)`)}.`;
  }

  if (haptecHasAny(text, ["obra com mais", "mais cards", "maior fila", "mais demandas"])) {
    const rows = haptecCountBy(active, (item) => workById(item.obraId)?.nome || "Obra nÃ£o vinculada");
    return `Projetos/obras com mais cards ativos ${scope}:\n${haptecRowsText(rows, (value) => `${value} card(s)`)}.`;
  }

  if (haptecHasAny(text, ["bucket", "coluna", "status", "fase"])) {
    const rows = columns.map((column) => ({
      label: column.label,
      count: items.filter((item) => item.coluna === column.id).length,
    }));
    return `DistribuiÃ§Ã£o por coluna ${scope}:\n${haptecRowsText(rows, (value) => `${value} card(s)`, rows.length)}.`;
  }

  if (haptecHasAny(text, ["atras", "fora do prazo"]) && haptecHasAny(text, ["andamento", "fazendo", "execucao"])) {
    return `Hoje ${scope}: ${doing.length} card(s) em andamento/Fazendo e ${late.length} card(s) em atraso. Total ativo: ${active.length}.`;
  }

  if (haptecHasAny(text, ["atras", "fora do prazo"])) {
    const sample = late.slice(0, 4).map((item) => `${item.id} - ${workById(item.obraId)?.nome || item.obraNome || "sem obra"}`).join("; ");
    return `${late.length} card(s) de Obras estÃ£o em atraso ${scope}.${sample ? ` Principais: ${sample}.` : ""}`;
  }

  if (haptecHasAny(text, ["andamento", "fazendo", "execucao"])) {
    return `${doing.length} card(s) estÃ£o em andamento/Fazendo ${scope}. A fila ativa total tem ${active.length} card(s).`;
  }

  if (haptecHasAny(text, ["validacao", "validar"])) {
    return `${validation.length} card(s) estÃ£o no fluxo de validaÃ§Ã£o ${scope}: ${items.filter((item) => item.coluna === "validacaoObras").length} aguardando Obras, ${items.filter((item) => item.coluna === "validadoObras").length} validado(s) por Obras e ${items.filter((item) => item.coluna === "aprovacaoDiretoria").length} em aprovaÃ§Ã£o da Diretoria.`;
  }

  if (haptecHasAny(text, ["sic"])) {
    return `${sicCards.length} card(s) de SIC estÃ£o ${scope}. Destes, ${sicCards.filter(isDemandLate).length} estÃ£o em atraso.`;
  }

  return `Resumo do Kanban de Obras ${scope}: ${items.length} card(s), ${active.length} ativo(s), ${doing.length} em andamento, ${validation.length} aguardando validaÃ§Ã£o e ${late.length} em atraso.`;
}

function haptecEVDataAnswer(text) {
  const works = budgetWorks() || [];
  const completed = works.filter((work) => effectiveEVStatus(work) === "Completo");
  const incomplete = works.filter((work) => effectiveEVStatus(work) === "Incompleto");
  const withoutEV = works.filter((work) => effectiveEVStatus(work) === "Sem EV");
  const total = works.reduce((sum, work) => sum + workBudgetValue(work), 0);
  const top = haptecTopEVWork();

  if (haptecHasAny(text, ["pendente", "incompleto"])) return `Hoje temos ${incomplete.length} EV(s) incompleto(s), ${completed.length} completo(s) e ${withoutEV.length} obra(s) sem EV.`;
  if (haptecHasAny(text, ["completo", "cotacao completa", "finalizado"])) return `${completed.length} EV(s) estÃ£o completos. Isso representa ${number((completed.length / Math.max(works.length, 1)) * 100, 1)}% do portfÃ³lio.`;
  if (haptecHasAny(text, ["sem ev"])) return `${withoutEV.length} obra(s) ainda nÃ£o possuem EV.`;
  if (haptecHasAny(text, ["total", "consolidado", "somatorio", "soma"])) return `O valor total de EV consolidado Ã© ${money(total)}. ${top ? `O maior EV Ã© ${top.work.nome}, com ${money(top.value)}.` : ""}`;
  return haptecTopEVAnswer();
}

function haptecDisciplineIdsFromQuestion(text) {
  const aliases = [
    ["marcenaria", ["marcenaria"]],
    ["climatizacao", ["equipamentos-de-climatizacao", "instalacoes-de-climatizacao-e-exaustao"]],
    ["inox", ["artefatos-inox"]],
    ["comunicacao visual", ["comunicacao-visual-externa-e-interna"]],
    ["dados e voz", ["dados-e-voz-seguranca-patrimonial-chamada-hospitalar"]],
    ["seguranca patrimonial", ["dados-e-voz-seguranca-patrimonial-chamada-hospitalar"]],
    ["chamada hospitalar", ["dados-e-voz-seguranca-patrimonial-chamada-hospitalar"]],
    ["quadros eletricos", ["quadros-eletricos"]],
    ["projetos", ["projetos-tecnicos", "projetos-legalizacao"]],
    ["gerador", ["gerador-subestacao-transformador-cubiculos"]],
    ["elevador", ["elevadores-plataforma-elevatoria"]],
    ["gases medicinais", ["reguas-medicinais", "instalacoes-de-gases-medicinais"]],
    ["reguas medicinais", ["reguas-medicinais"]],
    ["taxa de risco", ["taxa-risco"]],
    ["blindagem", ["blindagem"]],
    ["fachada", ["fachadas"]],
    ["estrutura", ["estruturas"]],
  ];
  for (const [term, ids] of aliases) if (text.includes(term)) return ids;
  const direct = configuredDisciplines().find((item) => text.includes(normalizeSearchText(item.nome)));
  return direct ? [direct.id] : [];
}

function haptecEVRecordFromQuestion(text) {
  const stop = new Set(["projeto", "hospital", "clinica", "adequacao", "novo", "nova", "obra", "tec", "medprev", "pronto", "atendimento"]);
  const candidates = evUnifiedRecords().map((record) => {
    const code = evUnifiedCode(record.code);
    const tokens = [...new Set(evUnifiedName(record.project).split(" ").filter((token) => token.length >= 4 && !stop.has(token)))];
    let score = tokens.reduce((sum, token) => sum + (text.includes(token) ? Math.min(token.length, 8) : 0), 0);
    const codeMatch = Boolean(code && new RegExp(`\\b${code}\\b`).test(text));
    if (codeMatch) score += 30;
    return { record, score, codeMatch, matches: tokens.filter((token) => text.includes(token)).length };
  }).filter((item) => item.score > 0 && (item.matches > 0 || item.codeMatch)).sort((a, b) => b.score - a.score || Number(b.record.total || 0) - Number(a.record.total || 0));
  return candidates[0]?.record || null;
}

function haptecCombinedBenchmark(records, disciplineIds) {
  const shares = records.filter((record) => Number(record.baseTotal) > 0)
    .map((record) => disciplineIds.reduce((sum, id) => sum + Number(record.disciplines?.[id] || 0), 0) / Number(record.baseTotal) * 100)
    .filter((value) => value > 0 && Number.isFinite(value));
  const mean = shares.length ? shares.reduce((sum, value) => sum + value, 0) / shares.length : 0;
  const variance = shares.length ? shares.reduce((sum, value) => sum + (value - mean) ** 2, 0) / shares.length : 0;
  return { count: shares.length, mean, median: evPercentile(shares, .5), p25: evPercentile(shares, .25), p75: evPercentile(shares, .75), stdDev: Math.sqrt(variance) };
}

function haptecEVIntelligenceAnswer(text) {
  const disciplineIds = haptecDisciplineIdsFromQuestion(text);
  const record = haptecEVRecordFromQuestion(text);
  if (!record) return "";
  if (!disciplineIds.length) {
    if (!haptecHasAny(text, ["composicao", "disciplinas", "maiores", "principais", "detalhe"])) return "";
    const rows = Object.entries(record.disciplines || {}).filter(([, value]) => Number(value) > 0).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 6);
    return `ComposiÃ§Ã£o principal do EV ${record.project} (${record.year}):\n${rows.map(([id, value], index) => `${index + 1}. ${disciplineById(id).nome}: ${money(value)} (${number(Number(value) / Math.max(Number(record.total), 1) * 100, 2)}%)`).join("\n")}\nTotal do EV: ${money(record.total)}.`;
  }
  const value = disciplineIds.reduce((sum, id) => sum + Number(record.disciplines?.[id] || 0), 0);
  const share = Number(record.total) ? value / Number(record.total) * 100 : 0;
  const comparable = evHistoricalSourceRecords().filter((item) => item.typology === record.typology);
  const benchmark = haptecCombinedBenchmark(comparable.length >= 20 ? comparable : evHistoricalSourceRecords(), disciplineIds);
  const zScore = benchmark.stdDev ? (share - benchmark.mean) / benchmark.stdDev : 0;
  const label = disciplineIds.length > 1 ? disciplineIds.map((id) => disciplineById(id).nome).join(" + ") : disciplineById(disciplineIds[0]).nome;
  const assessment = Math.abs(zScore) >= 2 ? `AtenÃ§Ã£o: estÃ¡ ${number(Math.abs(zScore), 1)}Ïƒ ${zScore > 0 ? "acima" : "abaixo"} da mÃ©dia histÃ³rica; recomendo averiguar o escopo e as quantidades.` : "A participaÃ§Ã£o estÃ¡ dentro do comportamento histÃ³rico esperado.";
  return `${label} no EV ${record.project}:\nValor: ${money(value)}.\nParticipaÃ§Ã£o no EV total: ${number(share, 2)}%.\nReferÃªncia ${record.typology}: mÃ©dia ${number(benchmark.mean, 2)}%, mediana ${number(benchmark.median, 2)}% e faixa central de ${number(benchmark.p25, 2)}% a ${number(benchmark.p75, 2)}% (${benchmark.count} EVs).\n${assessment}`;
}

function haptecNewEVCopilotAnswer(text) {
  const typologies = [...new Set(evHistoricalSourceRecords().map((record) => record.typology))];
  const typology = typologies.find((item) => text.includes(normalizeSearchText(item))) || (text.includes("hospital") ? "Hospital" : text.includes("tea") ? "TEA" : text.includes("clinica") ? "ClÃ­nica e Medicina Preventiva" : "");
  const records = typology ? evHistoricalSourceRecords().filter((record) => record.typology === typology) : evHistoricalSourceRecords();
  const rows = evHistoricalBenchmarkRows(records).filter((row) => row.count >= 8).slice(0, 6);
  return `Copiloto para novo EV${typology ? ` de ${typology}` : ""}:\nBase utilizada: ${records.length} EVs histÃ³ricos.\nComposiÃ§Ãµes de referÃªncia:\n${rows.map((row, index) => `${index + 1}. ${row.discipline.nome}: mediana ${number(row.median, 1)}% | faixa central ${number(row.p25, 1)}%â€“${number(row.p75, 1)}% | ${row.count} EVs`).join("\n")}\nComo conduzir: preencha primeiro Ã¡rea e escopo; compare as disciplinas crÃ­ticas; investigue desvios acima de 2Ïƒ; valide omissÃµes com valor zero; e sÃ³ entÃ£o confirme risco e total do EV. Posso analisar cada disciplina enquanto vocÃª preenche.`;
}

function haptecINCCAnswer(text) {
  const record = haptecEVRecordFromQuestion(text);
  if (!record) return `A Calculadora SLT usa o INCC-M oficial da FGV, com atualizaÃ§Ã£o composta atÃ© ${sltINCCData.latestLabel}. Abra Obras > EV > Calculadoras SLT e informe o valor e o ano-base.`;
  if (Number(record.year) >= 2026) return `O EV ${record.project} Ã© de ${record.year}, mesma competÃªncia anual da referÃªncia atual (${sltINCCData.latestLabel}). Para uma atualizaÃ§Ã£o precisa dentro de 2026, informe tambÃ©m o mÃªs-base.`;
  const reading = sltINCCReading(record.total, record.year);
  return `AtualizaÃ§Ã£o INCC-M do EV ${record.project}:\nValor original (${record.year}): ${money(record.total)}.\nFator composto atÃ© ${sltINCCData.latestLabel}: ${number(reading.factor, 4)}Ã— (${number(reading.percentage, 2)}%).\nCorreÃ§Ã£o estimada: ${money(reading.correction)}.\nValor atualizado: ${money(reading.updated)}.\nFonte: FGV IBRE. Estimativa gerencial; valide a clÃ¡usula contratual aplicÃ¡vel.`;
}

function haptecPortfolioQuestionAnswer(text) {
  const works = budgetWorks() || [];
  if (haptecHasAny(text, ["regiao", "regional"])) {
    return `PortfÃ³lio por regiÃ£o:\n${haptecRowsText(haptecCountBy(works, (work) => work.regiao), (value) => `${value} obra(s)`)}.`;
  }
  if (haptecHasAny(text, ["tipo", "tipologia", "unidade"])) {
    return `PortfÃ³lio por tipo de unidade:\n${haptecRowsText(haptecCountBy(works, (work) => work.tipoUnidade), (value) => `${value} obra(s)`)}.`;
  }
  if (haptecHasAny(text, ["classificacao", "classe", "motivo"])) {
    return `PortfÃ³lio por classificaÃ§Ã£o:\n${haptecRowsText(haptecCountBy(works, (work) => work.classificacaoObra), (value) => `${value} obra(s)`)}.`;
  }
  return haptecPortfolioDataAnswer();
}

function haptecSicQuestionAnswer(text) {
  const records = typeof sicLineRecords === "function" ? sicLineRecords() : [];
  const created = state.sics || [];
  if (haptecHasAny(text, ["disciplina"])) {
    const rows = records.length ? sicGroupedRecords(records, "disciplina").slice(0, 5) : haptecValueBy(created, (sic) => disciplineById(sic.evLineDisciplineId || "sics").nome, sicTotal);
    return `SICs por disciplina:\n${haptecRowsText(rows.map((row) => ({ label: row.label, value: row.valor ?? row.value ?? row.count })), money)}.`;
  }
  if (haptecHasAny(text, ["estado", "uf"])) {
    const rows = records.length ? sicGroupedRecords(records, "estado").slice(0, 5) : [];
    return rows.length ? `SICs por estado:\n${haptecRowsText(rows.map((row) => ({ label: row.label, value: row.valor })), money)}.` : haptecSicDataAnswer();
  }
  if (haptecHasAny(text, ["motivo", "causa"])) {
    const rows = records.length ? sicGroupedRecords(records, "motivo").slice(0, 5) : [];
    return rows.length ? `Principais motivos de SIC:\n${haptecRowsText(rows.map((row) => ({ label: row.label, value: row.valor })), money)}.` : haptecSicDataAnswer();
  }
  return haptecSicDataAnswer();
}

function haptecMaintenanceDataAnswer() {
  const items = filteredMaintenanceDemands();
  const metrics = maintenanceMetrics(items);
  const values = maintenanceValueTotals(items);
  return [
    `ManutenÃ§Ã£o no filtro atual: ${items.length} demanda(s).`,
    `${metrics.active.length} em fluxo, ${metrics.late.length} acima de 23 dias.`,
    `Valor Sala TÃ©cnica: ${money(values.salaTecnica)}.`,
    `Saving tÃ©cnico: ${money(Math.max(values.savingTecnico, 0))}.`
  ].join("\n");
}

function haptecMaintenanceQuestionAnswer(text) {
  const items = filteredMaintenanceDemands();
  const metrics = maintenanceMetrics(items);
  if (haptecHasAny(text, ["centro de custo", "custo"])) {
    const rows = haptecValueBy(items, (item) => item.centroCusto, maintenanceValue);
    return `ManutenÃ§Ã£o por centro de custo:\n${haptecRowsText(rows, money)}.`;
  }
  if (haptecHasAny(text, ["estado", "uf"])) {
    const rows = haptecValueBy(items, (item) => item.uf, maintenanceValue);
    return `ManutenÃ§Ã£o por estado:\n${haptecRowsText(rows, money)}.`;
  }
  if (haptecHasAny(text, ["fase", "pipefy", "bucket", "coluna", "status"])) {
    const rows = maintenanceColumns.map((column) => ({
      label: column.label,
      count: items.filter((item) => item.coluna === column.id).length,
    }));
    return `Kanban de ManutenÃ§Ã£o por fase:\n${haptecRowsText(rows, (value) => `${value} card(s)`, rows.length)}.`;
  }
  if (haptecHasAny(text, ["atras", "lead time", "fora do prazo"])) return `${metrics.late.length} demanda(s) de ManutenÃ§Ã£o estÃ£o acima do lead time de 23 dias. Lead time mÃ©dio: ${number(metrics.avgLead)} dia(s).`;
  if (haptecHasAny(text, ["andamento", "ativo", "fluxo"])) return `${metrics.active.length} demanda(s) de ManutenÃ§Ã£o estÃ£o em fluxo no filtro atual. Valor Sala TÃ©cnica: ${money(metrics.values.salaTecnica)}.`;
  return haptecMaintenanceDataAnswer();
}

function haptecBudgetDataAnswer() {
  const totals = allTotals();
  return [
    `Controle de Verbas consolidado: ${money(totals.orcado + totals.aditivado)}.`,
    `Contratado: ${money(totals.contratado)}.`,
    `Saldo disponÃ­vel: ${money(totals.saldo)}.`,
    `Se o saldo apertar, Ã© hora de conferir risco, SICs e aporte antes da obra pedir passagem.`
  ].join("\n");
}

function haptecStrategicQuestionAnswer(text) {
  const rows = strategicCostTargetRows();
  const summary = strategicCostTargetSummary(rows);
  if (haptecHasAny(text, ["meta", "m2", "mÂ²", "custo por m"])) {
    const targetText = rows
      .map((row) => `${row.label}: ${row.measuredCount ? `${number(row.adherence, 1)}% dentro da meta, ${money(row.costM2)}/mÂ²` : "sem leitura"}`)
      .join("\n");
    return `AderÃªncia Ã s metas de custo/mÂ²: ${number(summary.adherence, 1)}% geral.\n${targetText}`;
  }
  const above = worksAboveStrategicCostTarget();
  return above.length
    ? `Temos ${above.length} obra(s) acima da meta de custo/mÂ². Top desvio: ${above[0].work.nome}, com ${money(above[0].costM2)}/mÂ².`
    : "Nenhuma obra medida estÃ¡ acima da meta de custo/mÂ². Por enquanto, o prumo executivo estÃ¡ alinhado.";
}

function haptecQuestionSuggestions() {
  return [
    "Onde estou no sistema?",
    "Explique os mÃ³dulos do SLT 360.",
    "Quantos cards estÃ£o em andamento no Kanban de Obras?",
    "Quantos cards de Obras estÃ£o em atraso?",
    "Quantos cards aguardam validaÃ§Ã£o?",
    "Qual analista tem mais cards em Obras?",
    "Qual obra tem mais cards ativos?",
    "Qual a obra com o maior valor de EV hoje?",
    "Qual o percentual de marcenaria no EV Atibaia?",
    "Mostre a composiÃ§Ã£o do EV 4343.",
    "Ajude a conduzir um novo EV de Hospital.",
    "Atualize o EV 4343 pelo INCC.",
    "Quantos EVs estÃ£o pendentes?",
    "Qual o valor total de EV consolidado?",
    "Quantas SICs estÃ£o pendentes?",
    "Qual o maior valor de SIC?",
    "Quais os principais motivos de SIC?",
    "Quais disciplinas tÃªm maior impacto de SIC?",
    "Quantas demandas de ManutenÃ§Ã£o estÃ£o atrasadas?",
    "Qual centro de custo tem maior valor em ManutenÃ§Ã£o?",
    "Qual o valor Sala TÃ©cnica de ManutenÃ§Ã£o?",
    "Qual o saldo disponÃ­vel no Controle de Verbas?",
    "Como estÃ¡ a meta de custo por mÂ²?",
    "Quais obras estÃ£o acima da meta de custo por mÂ²?",
    "Como criar uma nova demanda?",
    "Como postar uma SIC no EV?"
  ];
}

function haptecQuestionBankAnswer() {
  return `Posso responder perguntas como:\n${haptecQuestionSuggestions()
    .slice(0, 12)
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n")}`;
}

function haptecAnswerBody(question = "") {
  const text = normalizeSearchText(question);
  const operationalQuestion = haptecHasAny(text, ["kanban", "kamban", "card", "cards", "esteira", "bucket", "coluna", "fazendo", "andamento", "atras", "validacao", "analista", "fase"]);
  if (haptecHasAny(text, ["quem e voce", "quem Ã© voce", "quem Ã© vocÃª", "haptec", "copiloto", "co-piloto"])) {
    return `Sou o ${haptecPersona.name}, ${haptecPersona.role}. Eu ajudo na navegaÃ§Ã£o e respondo perguntas com base nos dados visÃ­veis do SLT 360 para o seu perfil.`;
  }
  if (!text || text.includes("explicar tela") || text.includes("ajuda")) return haptecViewHelp();
  if (haptecHasAny(text, ["perguntas", "o que voce sabe", "o que vocÃª sabe", "exemplos", "treinado"])) return haptecQuestionBankAnswer();
  if (text.includes("incc")) return haptecINCCAnswer(text);
  if (haptecHasAny(text, ["novo ev", "nova ev", "conduzir ev", "montar ev", "copiloto ev", "ajude no ev"])) return haptecNewEVCopilotAnswer(text);
  const evIntelligence = haptecEVIntelligenceAnswer(text);
  if (evIntelligence) return evIntelligence;
  if ((text.includes("maior") || text.includes("mais alto")) && (text.includes("ev") || text.includes("valor"))) return haptecTopEVAnswer();
  if (text.includes("manut")) return haptecMaintenanceQuestionAnswer(text);
  if (maintenanceViewIds.includes(currentView) && operationalQuestion && !text.includes("obra")) return haptecMaintenanceQuestionAnswer(text);
  if (operationalQuestion) return haptecWorksKanbanAnswer(text);
  if (text.includes("ev") || text.includes("viabilidade")) return haptecEVDataAnswer(text);
  if (text.includes("sic") && ["quanto", "quant", "valor", "maior", "total", "report", "diagnostico", "aprovad", "pendente", "motivo", "causa", "disciplina", "estado"].some((term) => text.includes(term))) return haptecSicQuestionAnswer(text);
  if (haptecHasAny(text, ["meta", "m2", "mÂ²", "custo por m", "acima da meta"])) return haptecStrategicQuestionAnswer(text);
  if (text.includes("portfolio") || text.includes("portifolio") || text.includes("quantas obras") || text.includes("capex")) return haptecPortfolioQuestionAnswer(text);
  if (text.includes("verba") || text.includes("saldo") || text.includes("contratado")) return haptecBudgetDataAnswer();
  if (text.includes("modulo") || text.includes("dashboard") || text.includes("inicio")) return haptecModuleSummary();
  if (text.includes("nova demanda") || text.includes("demanda")) {
    if (maintenanceViewIds.includes(currentView)) return "Para criar demanda de ManutenÃ§Ã£o: ManutenÃ§Ã£o > Operacional > + Nova demanda. Busque a unidade, confira CNPJ/endereÃ§o, preencha datas, valores e salve para entrar no Kanban.";
    return "Para criar demanda de Obras: Obras > Operacional > + Nova demanda. Escolha EmissÃ£o Inicial, RevisÃ£o de OrÃ§amento ou SIC, vincule a obra e salve para entrar na coluna inicial do Kanban.";
  }
  if (text.includes("sic")) return "Para SIC: Obras > SICs ou Operacional > + Nova demanda > SIC. Preencha LECOM, obra, tÃ­tulo, descriÃ§Ã£o, disciplinas e anexo. A postagem no EV leva os valores para a linha 32.";
  if (text.includes("verba") || text.includes("orcamento") || text.includes("custo")) return "Para verba/custo: Controle de Verbas consolida aportes, EV, contrataÃ§Ã£o e SICs. Em Obras, a visÃ£o EstratÃ©gica mostra CAPEX, metas por mÂ² e maiores investimentos.";
  if (text.includes("kpi") || text.includes("indicador") || text.includes("relatorio")) return "Para indicadores: use as abas Gerencial, EstratÃ©gica, BI ManutenÃ§Ã£o ou Linha do Tempo. Os KPIs clicÃ¡veis abrem detalhes, para vocÃª sair do nÃºmero e chegar na causa.";
  if (text.includes("filtro") || text.includes("buscar") || text.includes("pesquisar")) return "Use a busca principal da aba e combine com os selects. No PortfÃ³lio busque por obra/cidade; em ManutenÃ§Ã£o use OS, unidade, centro de custo ou tipologia; em EV use a busca assistida.";
  return "Entendi. Me diga se vocÃª quer achar uma obra, criar demanda, abrir EV, analisar SICs ou navegar para um mÃ³dulo. Eu te passo o caminho mais curto.";
}

function haptecFaceForAnswer(question = "", answer = "") {
  const text = normalizeSearchText(`${question} ${answer}`);
  if (haptecFaceTagRegex.test(String(answer || ""))) return haptecExtractFace(answer);
  if (haptecHasAny(text, ["documento", "arquivo", "anexo", "prancha", "especificacao", "especificaÃ§Ã£o", "repositorio", "repositÃ³rio"])) return "searching";
  if (haptecHasAny(text, ["salvo", "salva", "sucesso", "concluido com sucesso", "preenchidos corretamente", "registrado com sucesso"])) return "validating";
  if (haptecHasAny(text, ["atras", "fora do prazo", "acima da meta", "acima do lead time", "saldo apertar", "falt", "obrigatorio", "obrigatÃ³rio", "inconsist", "pendente", "sem dados", "ainda nao", "ainda nÃ£o"])) return "error_alert";
  if (haptecHasAny(text, ["quanto", "quant", "valor", "r$", "maior", "total", "capex", "ev", "sic", "saldo", "contratado", "meta", "m2", "mÂ²", "kanban", "kamban", "cards", "analista", "centro de custo", "lead time", "saving", "dashboard report", "diagnostico", "diagnÃ³stico", "indicador", "kpi"])) return "thinking";
  return "smiling_ready";
}

function haptecAnswer(question = "") {
  const answer = haptecAnswerBody(question);
  return haptecWithFace(haptecFaceForAnswer(question, answer), answer);
}

function renderHaptecMessage(message) {
  const face = message.role === "bot" ? haptecExtractFace(message.text) : "";
  const paragraphs = haptecVisibleText(message.text || "")
    .split("\n")
    .filter(Boolean)
    .map((line) => `<p>${escapeAttribute(line)}</p>`)
    .join("");
  return `<div class="haptec-message" data-role="${message.role}"${face ? ` data-face="${face}"` : ""}>${paragraphs}</div>`;
}

function addHaptecMessage(role, text) {
  haptecMessages = haptecMessages.concat({ role, text }).slice(-10);
}

function haptecSystemNotice(message, face = "smiling_ready") {
  const clean = String(message || "").trim();
  if (!clean) return;
  addHaptecMessage("bot", haptecWithFace(face, clean));
  refreshHaptecAssistant();
}

function refreshHaptecAssistant() {
  const mount = document.querySelector("#supportAssistantMount");
  if (mount) mount.innerHTML = globalThis.SLT_CLOUD.cleanHTML(renderHaptecAssistant());
}

function haptecFaceForSystemMessage(message = "") {
  const text = normalizeSearchText(message);
  if (haptecHasAny(text, ["antes de", "nao encontrei", "nÃ£o encontrei", "nao possui", "nÃ£o possui", "revise", "protegido", "obrigatorio", "obrigatÃ³rio", "pendente", "erro", "falha", "atras", "risco"])) return "error_alert";
  if (haptecHasAny(text, ["salvo", "salva", "cadastrad", "criad", "atualizad", "postad", "aprovad", "exportad", "restaurad", "sincronizad", "registrad"])) return "validating";
  return "";
}

function handleHaptecQuestion(question) {
  const text = String(question || "").trim();
  if (!text) return;
  addHaptecMessage("user", text);
  addHaptecMessage("bot", haptecAnswer(text));
  haptecOpen = true;
  render();
}

function haptecCurrentFace() {
  const lastBot = [...haptecMessages].reverse().find((message) => message.role === "bot");
  return haptecExtractFace(lastBot?.text || haptecWelcomeText());
}

function haptecFaceLabel(face = "smiling_ready") {
  const labels = {
    smiling_ready: "Pronto",
    validating: "Validando",
    error_alert: "Alerta",
    thinking: "Analisando",
    searching: "Buscando",
  };
  return labels[face] || labels.smiling_ready;
}

function haptecFaceBadge(face = "smiling_ready") {
  const badges = {
    smiling_ready: "OK",
    validating: "OK",
    error_alert: "!",
    thinking: "...",
    searching: "BUS",
  };
  return badges[face] || badges.smiling_ready;
}

function renderHaptecRobot(extraClass = "", face = haptecCurrentFace()) {
  const faceClass = haptecFaceStates.has(face) ? `is-face-${face}` : "is-face-smiling_ready";
  return `
    <span class="haptec-robot ${extraClass} ${faceClass}" aria-hidden="true">
      <span class="haptec-robot-face-badge">${haptecFaceBadge(face)}</span>
      <span class="haptec-robot-ear is-left"></span>
      <span class="haptec-robot-ear is-right"></span>
      <span class="haptec-robot-head">
        <span class="haptec-robot-eye is-left"></span>
        <span class="haptec-robot-eye is-right"></span>
        <span class="haptec-robot-face-mark"></span>
        <span class="haptec-robot-mouth"></span>
        <span class="haptec-robot-scan"></span>
      </span>
      <span class="haptec-robot-neck"></span>
      <span class="haptec-robot-body">
        <span class="haptec-robot-core"></span>
      </span>
      <span class="haptec-robot-arm is-left"></span>
      <span class="haptec-robot-arm is-right"></span>
      <span class="haptec-robot-leg is-left"></span>
      <span class="haptec-robot-leg is-right"></span>
    </span>
  `;
}

function latestHaptecBotText() {
  const lastBot = [...haptecMessages].reverse().find((message) => message.role === "bot");
  return lastBot?.text || haptecWelcomeText();
}

function speakHaptec(text = latestHaptecBotText()) {
  if (!("speechSynthesis" in window)) {
    showToast("Seu navegador nÃ£o liberou voz para o Suporte360.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(haptecVisibleText(text || "").replace(/\s+/g, " ").trim());
  utterance.lang = "pt-BR";
  utterance.rate = 1.08;
  utterance.pitch = 1.55;
  utterance.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferredNames = /maria|francisca|google.*portugu|luciana|helena|brasil|portugu/i;
  const voice =
    voices.find((item) => /pt-BR/i.test(item.lang) && preferredNames.test(item.name)) ||
    voices.find((item) => /pt-BR/i.test(item.lang)) ||
    voices.find((item) => /pt|portugu/i.test(`${item.lang} ${item.name}`));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

function renderHaptecAssistant() {
  const messages = haptecMessages.length ? haptecMessages : [{ role: "bot", text: haptecWelcomeText() }];
  const currentFace = haptecExtractFace([...messages].reverse().find((message) => message.role === "bot")?.text || haptecWelcomeText());
  return `
    <aside class="haptec-assistant ${haptecOpen ? "is-open" : ""}" data-face="${currentFace}" aria-label="Suporte360 - assistente do SLT 360">
      <button class="haptec-launcher" type="button" data-action="toggle-haptec" title="Abrir Suporte360" aria-expanded="${haptecOpen ? "true" : "false"}">
        ${renderHaptecRobot("is-launcher", currentFace)}
        <span>
          <strong>Suporte360</strong>
          <small>${haptecFaceLabel(currentFace)} Â· Guia SLT</small>
        </span>
      </button>
      ${
        haptecOpen
          ? `
            <section class="haptec-panel">
              <header>
                <div class="haptec-title">
                  ${renderHaptecRobot("is-panel", currentFace)}
                  <div>
                    <strong>Suporte360</strong>
                    <small><span class="haptec-face-state" data-face="${currentFace}">${haptecFaceLabel(currentFace)}</span> Â· ${haptecCurrentContext()}</small>
                  </div>
                </div>
                <div class="haptec-header-actions">
                  <button class="ghost-button compact-action" type="button" data-action="haptec-speak">Ouvir</button>
                  <button class="icon-button" type="button" aria-label="Minimizar Suporte360" data-action="toggle-haptec">Ã—</button>
                </div>
              </header>
              <div class="haptec-body">
                <div class="haptec-messages">
                  ${messages.map(renderHaptecMessage).join("")}
                </div>
                <details class="haptec-suggestions">
                  <summary>Atalhos e perguntas</summary>
                  <div class="haptec-suggestion-block">
                    <span>RÃ¡pidos</span>
                    <div class="haptec-quick-actions">
                      <button type="button" data-action="haptec-ask" data-prompt="Explicar tela">Explicar tela</button>
                      <button type="button" data-action="haptec-ask" data-prompt="Qual a obra com o maior valor de EV hoje?">Maior EV</button>
                      <button type="button" data-action="haptec-ask" data-prompt="Quais perguntas vocÃª sabe responder?">Perguntas</button>
                    </div>
                  </div>
                  <div class="haptec-suggestion-block">
                    <span>NavegaÃ§Ã£o</span>
                    <div class="haptec-shortcuts">
                      <button type="button" data-action="haptec-nav" data-target-view="portfolio">Obras e EVs</button>
                      <button type="button" data-action="haptec-nav" data-target-view="maintenanceOperational">ManutenÃ§Ã£o</button>
                      <button type="button" data-action="haptec-nav" data-target-view="sics">SICs</button>
                      <button type="button" data-action="haptec-nav" data-target-view="budget">Verbas</button>
                    </div>
                  </div>
                  <div class="haptec-suggestion-block">
                    <span>Perguntas inteligentes</span>
                    <div class="haptec-question-list">
                      ${haptecQuestionSuggestions()
                        .slice(0, 6)
                        .map((prompt) => `<button type="button" data-action="haptec-ask" data-prompt="${escapeAttribute(prompt)}">${prompt}</button>`)
                        .join("")}
                    </div>
                  </div>
                </details>
              </div>
              <form class="haptec-form" id="haptecForm">
                <input name="question" autocomplete="off" placeholder="Pergunte ao Suporte360..." />
                <button type="submit">Enviar</button>
              </form>
            </section>
          `
          : ""
      }
    </aside>
  `;
}

function miroButton(label = "Abrir Miro") {
  return `<a class="secondary-action link-action" href="${MIRO_FLOW_URL}" target="_blank" rel="noreferrer">${label}</a>`;
}

function renderSicApprovalsTab() {
  return `${renderWorksToolbar('sicApprovals', 'AprovaÃ§Ã£o de SIC\'s', 'Controle de EVs, aditivos e revisÃµes')}<section id="sicApprovalsMount"></section>`;
}

function renderWorksTabs(activeView) {
  return `
    <nav class="module-tabs" aria-label="NavegaÃ§Ã£o interna de Obras">
      ${worksNavItems
        .filter((item) => canAccessView(item.view))
        .map(
          (item) => `
            <button class="module-tab ${item.view === activeView ? "is-active" : ""}" type="button" data-view="${item.view}">
              ${item.label}
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderWorksToolbar(activeView, title, subtitle, actions = "") {
  return `
    ${renderToolbar(title, subtitle, actions, moduleHeaders.works)}
    ${renderWorksTabs(activeView)}
  `;
}

function renderProjectTabs(activeView) {
  return `
    <nav class="module-tabs" aria-label="NavegaÃ§Ã£o interna de Projetos">
      ${projectNavItems
        .filter((item) => canAccessView(item.view))
        .map(
          (item) => `
            <button class="module-tab ${item.view === activeView ? "is-active" : ""}" type="button" data-view="${item.view}">
              ${item.label}
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderProjectToolbar(activeView, title, subtitle, actions = "") {
  return `
    ${renderToolbar(title, subtitle, actions, moduleHeaders.projects)}
    ${renderProjectTabs(activeView)}
  `;
}

function projectPlanRows(applyFilters = true) {
  const workIndex = state.works.map((work) => ({
    work,
    workName: normalizeSearchText(work.nome),
    workKey: normalizeSearchText(work.chaveUnica),
  }));
  const rows = investmentPlanRecords()
    .map((record) => {
      const work = planWorkMatch(record, workIndex);
      const regiao = normalizedPlanRegion(record.regiao);
      const statusInfo = planDeliveryStatus(record);
      return {
        ...record,
        regiao,
        obraId: work?.id || "",
        obraPortfolio: work?.nome || "",
        isProject: isPlanProject(record),
        statusInfo,
        projectStatus: projectStatusKey({ ...record, regiao, statusInfo }),
        inicioOrcamentacao: isPlanProject(record) ? addDaysISO(record.terminoPlanejado, 1) : "",
      };
    })
    .sort((a, b) => {
      const aDate = a.terminoPlanejado || "9999-12-31";
      const bDate = b.terminoPlanejado || "9999-12-31";
      return aDate.localeCompare(bDate) || String(a.obra || "").localeCompare(String(b.obra || ""));
    });

  if (!applyFilters) return rows;
  const terms = normalizeSearchText([searchTerm, projectPlanFilters.query].filter(Boolean).join(" ")).split(/\s+/).filter(Boolean);
  return rows.filter((row) => {
    if (projectPlanFilters.etapa && row.etapa !== projectPlanFilters.etapa) return false;
    if (projectPlanFilters.status && row.status !== projectPlanFilters.status) return false;
    if (projectPlanFilters.regiao && row.regiao !== projectPlanFilters.regiao) return false;
    if (projectPlanFilters.dateFrom && (!row.terminoPlanejado || row.terminoPlanejado < projectPlanFilters.dateFrom)) return false;
    if (projectPlanFilters.dateTo && (!row.terminoPlanejado || row.terminoPlanejado > projectPlanFilters.dateTo)) return false;
    if (terms.length && !terms.every((term) => planRecordSearchText(row).includes(term))) return false;
    return true;
  });
}

function projectStatusOverrideKey(row) {
  return String(row?.row || row?.registro || row?.chaveEtapa || row?.obra || "").trim();
}

function projectStatusOverride(row) {
  const key = projectStatusOverrideKey(row);
  if (!key) return null;
  return state.projectStatusOverrides?.[key] || null;
}

function projectStatusKey(row) {
  const override = projectStatusOverride(row);
  if (override?.status && projectColumns.some((column) => column.id === override.status)) return override.status;
  if (row.customProjectDemand && row.projectStatus && projectColumns.some((column) => column.id === row.projectStatus)) return row.projectStatus;
  const normalizedStatus = normalizeSearchText(row.status);
  const normalizedStage = normalizeSearchText(row.etapa);
  const statusInfo = row.statusInfo || planDeliveryStatus(row);
  if (normalizedStatus.includes("cancel") || normalizedStatus.includes("paralis")) return "paralisado";
  if (row.terminoReal || normalizedStatus.includes("entregue") || normalizedStatus.includes("conclu")) return "salaTecnica";
  if (statusInfo.label === "Projeto atrasado") return "atrasado";
  if (row.inicioPlanejado && row.inicioPlanejado <= todayISO()) return "emProjetos";
  if (normalizedStage.includes("sala tecnica") || normalizedStage.includes("orcamento")) return "salaTecnica";
  return "planejado";
}

function projectColumnById(id) {
  return projectColumns.find((column) => column.id === id) || projectColumns[0];
}

function projectStatusOptions(selectedStatus) {
  return projectColumns
    .map((column) => `<option value="${column.id}" ${selectedStatus === column.id ? "selected" : ""}>${column.label}</option>`)
    .join("");
}

function projectDemandTypeById(id) {
  return projectDemandTypes.find((type) => type.id === id) || projectDemandTypes[0];
}

function projectDemandTypeOptions(selectedType = "planoInvestimento") {
  return projectDemandTypes
    .map((type) => `<option value="${type.id}" ${selectedType === type.id ? "selected" : ""}>${type.label}</option>`)
    .join("");
}

function projectBudgetDemandForRow(row) {
  const key = projectStatusOverrideKey(row);
  if (!key) return null;
  return (state.demands || []).find((demand) => String(demand.projectPlanRow || demand.origemProjetoRow || "") === key) || null;
}

function projectCustomDemandRows() {
  return (state.projectDemands || []).map((demand) => {
    const type = projectDemandTypeById(demand.tipoDemanda);
    const work = demand.obraId ? workById(demand.obraId) : null;
    const status = projectColumnById(demand.status || "planejado");
    const cidadeUf = demand.cidadeUf || [work?.cidade, work?.uf].filter(Boolean).join("/") || "";
    const [praca = "", uf = ""] = cidadeUf.split("/");
    return {
      row: demand.id,
      registro: demand.id,
      obra: demand.obraNome || work?.nome || demand.titulo || "Demanda de Projetos",
      chaveEtapa: demand.id,
      tipoUnidade: demand.tipoUnidade || work?.tipoUnidade || type.shortLabel,
      praca,
      uf,
      cidadeUf,
      regiao: demand.regiao || work?.regiao || "",
      etapa: type.shortLabel,
      status: status.label,
      statusInfo: { label: status.label, tone: status.tone },
      classificacaoObra: demand.origem || type.label,
      tipologiaObra: type.shortLabel,
      observacoes: demand.descricao || "",
      inicioPlanejado: demand.dataInicio || demand.createdAt || "",
      terminoPlanejado: demand.dataPrevistaEntrega || "",
      terminoReal: demand.dataEntregaReal || "",
      inicioOrcamentacao: "",
      obraId: demand.obraId || "",
      obraPortfolio: work?.nome || "",
      isProject: true,
      customProjectDemand: true,
      customDemandId: demand.id,
      tipoDemanda: demand.tipoDemanda,
      tipoDemandaLabel: type.label,
      solicitante: demand.solicitante || "",
      orgaoRegulador: demand.orgaoRegulador || "",
      projectStatus: demand.status || "planejado",
    };
  });
}

function projectOperationalRows(applyFilters = true) {
  // O Kanban operacional comeÃ§a vazio para a fase de testes e passa a exibir
  // somente cards criados explicitamente no mÃ³dulo de Projetos.
  let rows = [...projectCustomDemandRows()];
  if (!applyFilters) return rows;
  const terms = normalizeSearchText([searchTerm, projectOperationalFilters.query].filter(Boolean).join(" ")).split(/\s+/).filter(Boolean);
  rows = rows.filter((row) => {
    const status = projectStatusKey(row);
    const text = planRecordSearchText(row);
    if (terms.length && !terms.every((term) => text.includes(term))) return false;
    if (projectOperationalFilters.status && status !== projectOperationalFilters.status) return false;
    if (projectOperationalFilters.regiao && row.regiao !== projectOperationalFilters.regiao) return false;
    if (projectOperationalFilters.type && row.tipoUnidade !== projectOperationalFilters.type) return false;
    if (projectOperationalFilters.punctuality === "late" && status !== "atrasado") return false;
    if (projectOperationalFilters.punctuality === "onTime" && status === "atrasado") return false;
    return true;
  });
  return rows;
}

function projectRowsByStatus(rows, status) {
  return rows.filter((row) => projectStatusKey(row) === status);
}

function projectGroupRows(rows, field) {
  return groupRowsBy(rows.map((row) => ({ ...row, [field]: row[field] || "NÃ£o informado" })), field);
}

function projectMonthRows(rows) {
  const monthMap = new Map();
  rows.forEach((row) => {
    const key = row.terminoPlanejado ? row.terminoPlanejado.slice(0, 7) : "Sem data";
    const label = key === "Sem data" ? key : key.split("-").reverse().join("/");
    monthMap.set(label, (monthMap.get(label) || 0) + 1);
  });
  return [...monthMap.entries()].map(([label, valor]) => ({ label, valor })).sort((a, b) => String(a.label).localeCompare(String(b.label)));
}

function projectMetrics(rows = projectPlanRows(false)) {
  const projectRows = rows.filter((row) => row.isProject);
  const delivered = projectRows.filter((row) => ["salaTecnica", "concluido"].includes(projectStatusKey(row)));
  const late = projectRowsByStatus(projectRows, "atrasado");
  const next = projectRows.filter((row) => row.terminoPlanejado && row.terminoPlanejado >= todayISO() && daysBetween(todayISO(), row.terminoPlanejado) <= 30);
  return {
    rows,
    projectRows,
    delivered,
    late,
    next,
    regions: new Set(rows.map((row) => row.regiao).filter(Boolean)).size,
    types: new Set(rows.map((row) => row.tipoUnidade).filter(Boolean)).size,
  };
}

function renderProjectsHome() {
  const metrics = projectMetrics();
  const rows = projectPlanRows(true);
  return `
    ${renderProjectToolbar("projectsHome", "Projetos 360", "Setor de Projetos como fonte oficial para alimentar Obras", `
      <span class="tag">${metrics.rows.length} linhas no plano</span>
      <button class="secondary-action" type="button" data-view="projectsPortfolio">Abrir portfÃ³lio</button>
      <button class="primary-action" type="button" data-view="projectsOperational">Abrir Kanban</button>
    `)}

    <section class="kpi-grid">
      ${kpi("Projetos no plano", String(metrics.projectRows.length), "Etapa Projetos no investimento 2026", "blue")}
      ${kpi("PrÃ³ximas entregas", String(metrics.next.length), "TÃ©rmino planejado em atÃ© 30 dias", "orange")}
      ${kpi("Projetos atrasados", String(metrics.late.length), "Sem tÃ©rmino real e prazo vencido", metrics.late.length ? "red" : "green")}
      ${kpi("Entregues Ã  ST", String(metrics.delivered.length), "Base disponÃ­vel para orÃ§amentaÃ§Ã£o", "green")}
      ${kpi("RegiÃµes atendidas", String(metrics.regions), "Cobertura no plano", "blue")}
      ${kpi("Tipos de unidade", String(metrics.types), "Perfis no portfÃ³lio de Projetos", "orange")}
    </section>

    <div class="content-grid three">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Projetos por regiÃ£o</h2>
            <p class="panel-subtitle">DistribuiÃ§Ã£o da carteira do plano</p>
          </div>
        </div>
        ${barList(projectGroupRows(rows, "regiao"), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Projetos por tipo</h2>
            <p class="panel-subtitle">Tipos de unidade em planejamento</p>
          </div>
        </div>
        ${barList(projectGroupRows(rows, "tipoUnidade"), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>PrÃ³ximas entregas</h2>
            <p class="panel-subtitle">Fila que alimenta Obras</p>
          </div>
        </div>
        <div class="alert-list">
          ${metrics.next.slice(0, 6).map(renderProjectAlertItem).join("") || `<div class="empty-state">Sem entregas de projeto nos prÃ³ximos 30 dias.</div>`}
        </div>
      </section>
    </div>
  `;
}

function renderProjectAlertItem(row) {
  return `
    <button class="alert-item is-clickable" type="button" data-action="open-project-plan-detail" data-row="${row.row}">
      <div>
        <strong>${escapeAttribute(row.obra || "Projeto sem nome")}</strong>
        <span class="muted">${escapeAttribute(row.regiao || "Sem regiÃ£o")} | tÃ©rmino ${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "sem data"}</span>
      </div>
    </button>
  `;
}

function renderProjectsPortfolio() {
  const allRows = projectPlanRows(false);
  const rows = projectPlanRows(true);
  const metrics = projectMetrics(allRows);
  return `
    ${renderProjectToolbar("projectsPortfolio", "PortfÃ³lio / Plano de Investimento", "Base Ãºnica do Projetos 360 para prazos, entregas e inÃ­cio da orÃ§amentaÃ§Ã£o", `
      <span class="tag">${rows.length} registros no filtro</span>
      <button class="secondary-action" type="button" data-action="clear-project-plan-filters">Limpar filtros</button>
    `)}
    <section class="kpi-grid">
      ${kpi("Registros no plano", String(metrics.rows.length), "Plano de Investimento 2026", "blue")}
      ${kpi("Etapa Projetos", String(metrics.projectRows.length), "Itens aguardados pela Sala TÃ©cnica", "orange")}
      ${kpi("Atrasados", String(metrics.late.length), "Projetos com prazo vencido", metrics.late.length ? "red" : "green")}
      ${kpi("Tipos de unidade", String(metrics.types), "Perfis distintos", "blue")}
    </section>
    <section class="panel investment-plan-panel">
      ${renderProjectPlanFilters(allRows)}
      ${renderProjectPlanTable(rows)}
    </section>
  `;
}

function renderProjectPlanFilters(allRows) {
  const etapas = [...new Set(allRows.map((row) => row.etapa).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const status = [...new Set(allRows.map((row) => row.status).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const regioes = [...new Set(allRows.map((row) => row.regiao).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return `
    <div class="investment-filter-bar project-filter-bar">
      <label class="field investment-search-field">
        <span>Buscar no plano</span>
        <input data-project-plan-search value="${escapeAttribute(projectPlanFilters.query)}" placeholder="Buscar por obra, etapa, cidade, UF, status ou observaÃ§Ã£o..." />
      </label>
      <label class="field">
        <span>Etapa</span>
        <select data-project-plan-filter="etapa">
          <option value="">Todas</option>
          ${etapas.map((value) => `<option value="${escapeAttribute(value)}" ${projectPlanFilters.etapa === value ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span>Status</span>
        <select data-project-plan-filter="status">
          <option value="">Todos</option>
          ${status.map((value) => `<option value="${escapeAttribute(value)}" ${projectPlanFilters.status === value ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span>RegiÃ£o</span>
        <select data-project-plan-filter="regiao">
          <option value="">Todas</option>
          ${regioes.map((value) => `<option value="${escapeAttribute(value)}" ${projectPlanFilters.regiao === value ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span>Projeto de</span>
        <input type="date" data-project-plan-filter="dateFrom" value="${projectPlanFilters.dateFrom}" />
      </label>
      <label class="field">
        <span>Projeto atÃ©</span>
        <input type="date" data-project-plan-filter="dateTo" value="${projectPlanFilters.dateTo}" />
      </label>
    </div>
  `;
}

function renderProjectPlanTable(rows) {
  return `
    <div class="table-wrap project-plan-table-wrap">
      <table class="data-table project-plan-table">
        <thead>
          <tr>
            <th>Obra / Projeto</th>
            <th>CÃ³d. Obra</th>
            <th>Tipo</th>
            <th>Cidade / UF</th>
            <th>RegiÃ£o</th>
            <th>Etapa</th>
            <th class="numeric">SLA</th>
            <th>InÃ­cio Planejado</th>
            <th>TÃ©rmino Projeto</th>
            <th>TÃ©rmino Real</th>
            <th>Status Projeto</th>
            <th>InÃ­cio OrÃ§amentaÃ§Ã£o</th>
            <th>AÃ§Ãµes</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows
              .map((row) => {
                const work = row.obraId ? workById(row.obraId) : null;
                const projectStatus = projectColumnById(projectStatusKey(row));
                return `
                  <tr data-action="open-project-plan-detail" data-row="${row.row}" role="button" tabindex="0">
                    <td><strong>${escapeAttribute(row.obra || "Projeto sem nome")}</strong><br /><span class="muted">${escapeAttribute(row.chaveEtapa || "Plano de Investimento")}</span></td>
                    <td>${escapeAttribute(work?.codigoOriginal || row.registro || "0000")}</td>
                    <td>${escapeAttribute(work?.tipoUnidade || row.tipoUnidade || "â€”")}</td>
                    <td>${escapeAttribute(`${work?.cidade || row.praca || "â€”"}/${work?.uf || row.uf || "â€”"}`)}</td>
                    <td>${escapeAttribute(work?.regiao || row.regiao || "â€”")}</td>
                    <td><span class="tag">${escapeAttribute(row.etapa || "â€”")}</span></td>
                    <td class="numeric">${row.slaDias ?? "â€”"}</td>
                    <td>${row.inicioPlanejado ? dateText(row.inicioPlanejado) : "â€”"}</td>
                    <td><strong>${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "â€”"}</strong></td>
                    <td>${row.terminoReal ? dateText(row.terminoReal) : "â€”"}</td>
                    <td><span class="status-pill" data-status="${projectStatus.tone}">${projectStatus.label}</span></td>
                    <td>${row.inicioOrcamentacao ? `<strong>${dateText(row.inicioOrcamentacao)}</strong><br /><span class="muted">apÃ³s Projetos</span>` : "â€”"}</td>
                    <td>
                      <div class="table-actions">
                        ${row.obraId ? `<button class="secondary-action compact-action" type="button" data-action="start-budget-from-plan" data-row="${row.row}">Enviar para Obras</button>` : `<button class="secondary-action compact-action" type="button" data-action="open-work-from-plan" data-row="${row.row}">Cadastrar</button>`}
                      </div>
                    </td>
                  </tr>
                `;
              })
              .join("") || `<tr><td colspan="13"><div class="empty-state">Nenhum registro encontrado no Plano de Investimento.</div></td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function renderProjectsOperational() {
  const filtered = projectOperationalRows(true);
  const allRows = projectOperationalRows(false);
  return `
    ${renderProjectToolbar("projectsOperational", "Operacional de Projetos", "Kanban de entregas de Projetos que abastecem a esteira de Obras", `
      <button class="secondary-action" type="button" data-action="clear-project-operational-filters">Limpar filtros</button>
      <button class="primary-action" type="button" data-action="open-project-demand">+ Nova demanda</button>
      <button class="primary-action" type="button" data-view="projectsPortfolio">Abrir portfÃ³lio</button>
    `)}
    ${renderProjectOperationalFilters(allRows)}
    <section class="kpi-grid">
      ${kpi("Projetos no filtro", String(filtered.length), "Registros visÃ­veis", "blue")}
      ${kpi("Planejados", String(projectRowsByStatus(filtered, "planejado").length), "Ainda nÃ£o iniciados", "blue")}
      ${kpi("Em projetos", String(projectRowsByStatus(filtered, "emProjetos").length), "Em execuÃ§Ã£o", "orange")}
      ${kpi("Entregues Ã  ST", String(projectRowsByStatus(filtered, "salaTecnica").length), "Prontos para orÃ§amento", "green")}
      ${kpi("Atrasados", String(projectRowsByStatus(filtered, "atrasado").length), "Prazo vencido", projectRowsByStatus(filtered, "atrasado").length ? "red" : "green")}
      ${kpi("Paralisados", String(projectRowsByStatus(filtered, "paralisado").length), "Sem avanÃ§o", "red")}
    </section>
    <section class="panel operational-board-panel">
      <div class="panel-header">
        <div>
          <h2>Kanban de Projetos</h2>
          <p class="panel-subtitle">Clique no card para ver prazos, etapa, vÃ­nculo e inÃ­cio da orÃ§amentaÃ§Ã£o</p>
        </div>
        <div class="inline-actions">
          <div class="segmented">
            <button class="${projectOperationalViewMode === "kanban" ? "is-active" : ""}" type="button" data-action="set-project-operational-view" data-mode="kanban">Kanban</button>
            <button class="${projectOperationalViewMode === "list" ? "is-active" : ""}" type="button" data-action="set-project-operational-view" data-mode="list">Lista</button>
          </div>
        </div>
      </div>
      ${projectOperationalViewMode === "kanban" ? renderProjectKanbanBoard(filtered) : renderProjectOperationalList(filtered)}
    </section>
  `;
}

function renderProjectOperationalFilters(allRows) {
  const regioes = [...new Set(allRows.map((row) => row.regiao).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const types = [...new Set(allRows.map((row) => row.tipoUnidade).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return `
    <section class="panel filter-panel">
      <label class="field">
        <span>Buscar projeto</span>
        <input data-project-operational-search value="${escapeAttribute(projectOperationalFilters.query)}" placeholder="Buscar por obra, cidade, UF, etapa ou observaÃ§Ã£o..." />
      </label>
      <div class="filter-grid">
        <label class="field">
          <span>Status</span>
          <select data-project-operational-filter="status">
            <option value="">Todos</option>
            ${projectColumns.map((column) => `<option value="${column.id}" ${projectOperationalFilters.status === column.id ? "selected" : ""}>${column.label}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>RegiÃ£o</span>
          <select data-project-operational-filter="regiao">
            <option value="">Todas</option>
            ${regioes.map((value) => `<option value="${escapeAttribute(value)}" ${projectOperationalFilters.regiao === value ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Tipo de unidade</span>
          <select data-project-operational-filter="type">
            <option value="">Todos</option>
            ${types.map((value) => `<option value="${escapeAttribute(value)}" ${projectOperationalFilters.type === value ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Prazo</span>
          <select data-project-operational-filter="punctuality">
            <option value="">Todos</option>
            <option value="late" ${projectOperationalFilters.punctuality === "late" ? "selected" : ""}>Atrasados</option>
            <option value="onTime" ${projectOperationalFilters.punctuality === "onTime" ? "selected" : ""}>No prazo</option>
          </select>
        </label>
      </div>
    </section>
  `;
}

function renderProjectKanbanBoard(rows) {
  return `
    <div class="kanban-board project-kanban-board">
      ${projectColumns
        .map((column) => {
          const scoped = rows.filter((row) => projectStatusKey(row) === column.id);
          return `
            <section class="kanban-column" data-column="${column.id}">
              <header>
                <h2>${column.label}</h2>
                <span class="kanban-count">${scoped.length}</span>
              </header>
              <div class="demand-list">
                ${scoped.length ? scoped.map(renderProjectCard).join("") : `<div class="empty-state kanban-empty">Nenhum projeto</div>`}
              </div>
            </section>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderProjectCard(row) {
  const status = projectColumnById(projectStatusKey(row));
  const budgetDemand = projectBudgetDemandForRow(row);
  const type = row.customProjectDemand ? projectDemandTypeById(row.tipoDemanda) : projectDemandTypeById("planoInvestimento");
  return `
    <article class="demand-card project-demand-card" data-status="${status.id}" data-action="open-project-plan-detail" data-row="${row.row}" role="button" tabindex="0">
      <div class="demand-card-top">
        <span class="demand-code">${escapeAttribute(row.registro || `PL-${row.row}`)}</span>
        <span class="priority-pill">${escapeAttribute(type.shortLabel)}</span>
      </div>
      <h3>${escapeAttribute(row.obra || "Projeto sem nome")}</h3>
      <div class="demand-card-meta">
        <span>${escapeAttribute(row.regiao || "Sem regiÃ£o")}</span>
        <b>${escapeAttribute(row.tipoUnidade || "â€”")}</b>
      </div>
      <div class="demand-card-unit-badge">${escapeAttribute(type.label)}</div>
      ${budgetDemand ? `<div class="demand-card-unit-badge">Demanda de Obras criada Â· ${escapeAttribute(budgetDemand.id)}</div>` : ""}
      <span class="demand-card-date">TÃ©rmino: ${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "sem data"}</span>
      <div class="demand-card-alert" data-tone="${status.tone === "red" ? "red" : status.tone === "orange" ? "orange" : "green"}">
        <i></i>
        <strong>${escapeAttribute(row.statusInfo?.label || status.label)}</strong>
      </div>
      ${row.inicioOrcamentacao ? `<div class="demand-card-value"><span>InÃ­cio orÃ§amento</span><strong>${dateText(row.inicioOrcamentacao)}</strong></div>` : ""}
    </article>
  `;
}

function renderProjectOperationalList(rows) {
  if (!rows.length) return `<div class="empty-state">Nenhum projeto encontrado no filtro atual.</div>`;
  return `
    <div class="table-wrap project-operational-table-wrap">
      <table class="data-table project-operational-table">
        <thead>
          <tr>
            <th>Obra / Projeto</th>
            <th>Tipo demanda</th>
            <th>Tipo</th>
            <th>RegiÃ£o</th>
            <th>Etapa</th>
            <th>TÃ©rmino Projeto</th>
            <th>Status</th>
            <th>InÃ­cio OrÃ§amentaÃ§Ã£o</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((row) => {
              const status = projectColumnById(projectStatusKey(row));
              const type = row.customProjectDemand ? projectDemandTypeById(row.tipoDemanda) : projectDemandTypeById("planoInvestimento");
              return `
                <tr data-action="open-project-plan-detail" data-row="${row.row}" role="button" tabindex="0">
                  <td><strong>${escapeAttribute(row.obra || "Projeto sem nome")}</strong><br /><span class="muted">${escapeAttribute(row.chaveEtapa || "")}</span></td>
                  <td><span class="status-pill" data-status="blue">${escapeAttribute(type.shortLabel)}</span></td>
                  <td>${escapeAttribute(row.tipoUnidade || "â€”")}</td>
                  <td>${escapeAttribute(row.regiao || "â€”")}</td>
                  <td>${escapeAttribute(row.etapa || "â€”")}</td>
                  <td>${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "â€”"}</td>
                  <td><span class="status-pill" data-status="${status.tone}">${status.label}</span></td>
                  <td>${row.inicioOrcamentacao ? dateText(row.inicioOrcamentacao) : "â€”"}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function projectPlanOptionLabel(row) {
  return `${row.obra || "Projeto sem nome"} | ${row.praca || "Sem cidade"}/${row.uf || "UF"} | ${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "sem tÃ©rmino"}`;
}

function projectPlanDatalist() {
  const rows = projectPlanRows(false).filter((row) => row.isProject);
  return `
    <datalist id="projectPlanOptions">
      ${rows.map((row) => `<option value="${escapeAttribute(projectPlanOptionLabel(row))}">${escapeAttribute(row.chaveEtapa || row.registro || "")}</option>`).join("")}
    </datalist>
  `;
}

function projectWorkDatalist() {
  return `
    <datalist id="projectDemandWorkOptions">
      ${eligibleDemandWorkCatalog().map((work) => `<option value="${escapeAttribute(workOptionLabel(work))}">${escapeAttribute(workSearchYearText(work))}</option>`).join("")}
    </datalist>
  `;
}

function findProjectPlanByTypedSearch(value) {
  const normalized = normalizeSearchText(value);
  if (!normalized) return null;
  const rows = projectPlanRows(false).filter((row) => row.isProject);
  const exact = rows.find((row) => normalizeSearchText(projectPlanOptionLabel(row)) === normalized);
  if (exact) return exact;
  const terms = normalized.split(/\s+/).filter(Boolean);
  return rows.find((row) => {
    const text = normalizeSearchText([projectPlanOptionLabel(row), planRecordSearchText(row), row.row, row.registro].join(" "));
    return terms.every((term) => text.includes(term));
  }) || null;
}

function renderProjectDemandFields(type) {
  if (type.id === "planoInvestimento") {
    return `
      <label class="field full-span">
        <span>Buscar obra do Plano de Investimento *</span>
        <input name="planBusca" list="projectPlanOptions" autocomplete="off" placeholder="Digite nome da obra, cidade, UF ou etapa..." required />
      </label>
      ${projectPlanDatalist()}
      <div class="helper-card full-span">
        <strong>Plano de investimento</strong>
        <span>A demanda serÃ¡ vinculada Ã  linha selecionada do plano e entrarÃ¡ no kanban de Projetos como Planejado.</span>
      </div>
    `;
  }

  return `
    <label class="field">
      <span>TÃ­tulo da demanda *</span>
      <input name="titulo" placeholder="${type.id === "sdr" ? "Ex.: AdequaÃ§Ã£o solicitada pela VISA" : type.id === "sic" ? "Ex.: Ajuste de projeto solicitado por Obras" : "Ex.: Estudo solicitado pela Ã¡rea demandante"}" required />
    </label>
    <label class="field">
      <span>${type.id === "sdr" ? "Ã“rgÃ£o regulador" : "Solicitante / Ã¡rea demandante"}</span>
      <input name="${type.id === "sdr" ? "orgaoRegulador" : "solicitante"}" placeholder="${type.id === "sdr" ? "VISA, Corpo de Bombeiros, Prefeitura..." : "Obras, OperaÃ§Ãµes, Diretoria, unidade..."}" />
    </label>
    <label class="field full-span">
      <span>Vincular obra/unidade existente</span>
      <input name="obraBusca" list="projectDemandWorkOptions" autocomplete="off" placeholder="Digite nome da obra, chave, cidade ou UF..." />
    </label>
    ${projectWorkDatalist()}
    <label class="field">
      <span>Prioridade</span>
      <select name="prioridade">${priorityOptions(type.id === "sdr" ? "Alta" : "MÃ©dia")}</select>
    </label>
    <label class="field">
      <span>Data prevista de entrega</span>
      <input name="dataPrevistaEntrega" type="date" />
    </label>
    <label class="field full-span">
      <span>DescriÃ§Ã£o da demanda</span>
      <textarea name="descricao" rows="4" placeholder="Descreva o escopo, origem da solicitaÃ§Ã£o, premissas e observaÃ§Ãµes relevantes..."></textarea>
    </label>
  `;
}

function openProjectDemandModal(selectedType = "planoInvestimento") {
  const type = projectDemandTypeById(selectedType);
  modalRoot.innerHTML = globalThis.SLT_CLOUD.cleanHTML(`
    <div class="modal-backdrop">
      <section class="modal-card kpi-modal-card project-demand-modal" aria-labelledby="projectDemandTitle">
        <header>
          <div>
            <span class="eyebrow">Projetos 360</span>
            <h2 id="projectDemandTitle">Nova demanda de Projetos</h2>
            <p class="muted">Classifique a origem da demanda e envie para o kanban operacional.</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">Ã—</button>
        </header>
        <form id="projectDemandForm" class="modal-body">
          <div class="error-box inline-form-error" data-form-error></div>
          <div class="form-grid">
            <label class="field full-span">
              <span>Tipo de demanda *</span>
              <select name="tipoDemanda" data-project-demand-type required>
                ${projectDemandTypeOptions(type.id)}
              </select>
            </label>
            <div class="helper-card full-span">
              <strong>${escapeAttribute(type.label)}</strong>
              <span>${escapeAttribute(type.detail)}</span>
            </div>
            <section class="modal-section demand-analyst-section full-span">
              <div class="section-title">
                <span>Analistas da demanda</span>
              </div>
              ${analystChipOptions()}
            </section>
            ${renderProjectDemandFields(type)}
          </div>
        </form>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
          <button class="primary-action" type="submit" form="projectDemandForm">Salvar demanda</button>
        </footer>
      </section>
    </div>
  `);
}

async function handleProjectDemandSubmit(form) {
  if (!ensureDemandLifecycleAllowed(form)) return;
  const formData = new FormData(form);
  const analystAssignment = analystAssignmentFromForm(form);
  if (!validateDemandAnalysts(analystAssignment, form)) return;
  const typeId = String(formData.get("tipoDemanda") || "planoInvestimento");
  const type = projectDemandTypeById(typeId);

  if (type.id === "planoInvestimento") {
    const record = findProjectPlanByTypedSearch(formData.get("planBusca"));
    if (!record) {
      showFormError("Selecione uma obra vÃ¡lida do Plano de Investimento.", form);
      return;
    }
    if (!state.projectStatusOverrides || typeof state.projectStatusOverrides !== "object") state.projectStatusOverrides = {};
    const key = projectStatusOverrideKey(record);
    state.projectStatusOverrides[key] = {
      ...(state.projectStatusOverrides[key] || {}),
      status: "planejado",
      updatedAt: todayISO(),
      updatedBy: currentUser()?.nome || "Projetos 360",
      demandType: type.id,
      ...analystAssignment,
    };
    addHistory({
      entidade: "projeto",
      entidadeId: key,
      campo: "criaÃ§Ã£o",
      valorAnterior: "Plano de Investimento",
      valorNovo: "Demanda criada no kanban de Projetos",
    });
    if (!await saveState()) return false;
    projectOperationalFilters.query = record.obra || "";
    projectOperationalViewMode = "kanban";
    closeModal();
    setView("projectsOperational");
    showToast("Demanda do Plano de Investimento enviada para o kanban de Projetos.");
    return;
  }

  const title = String(formData.get("titulo") || "").trim();
  if (!title) {
    showFormError("Informe o tÃ­tulo da demanda para criar o card de Projetos.", form);
    return;
  }

  const work = findWorkByTypedSearch(formData.get("obraBusca"), eligibleDemandWorkCatalog());
  if (String(formData.get("obraBusca") || "").trim() && !work) {
    showFormError("Para vincular uma obra Ã  demanda, selecione uma obra do ano de 2025 em diante.", form);
    return;
  }
  const id = nextCode("PRJ", state.projectDemands || []);
  const cidadeUf = work ? [work.cidade, work.uf].filter(Boolean).join("/") : "";
  const demand = {
    id,
    tipoDemanda: type.id,
    titulo: title,
    descricao: String(formData.get("descricao") || "").trim(),
    solicitante: type.id === "sdr" ? "" : String(formData.get("solicitante") || "").trim(),
    orgaoRegulador: type.id === "sdr" ? String(formData.get("orgaoRegulador") || "").trim() : "",
    origem: type.label,
    prioridade: String(formData.get("prioridade") || "MÃ©dia"),
    obraId: work?.id || "",
    obraNome: work?.nome || title,
    cidadeUf,
    regiao: work?.regiao || "",
    tipoUnidade: work?.tipoUnidade || type.shortLabel,
    status: "planejado",
    dataInicio: todayISO(),
    dataPrevistaEntrega: String(formData.get("dataPrevistaEntrega") || ""),
    dataEntregaReal: "",
    createdAt: todayISO(),
    updatedAt: todayISO(),
    createdBy: currentUser()?.nome || "Projetos 360",
    ...analystAssignment,
  };

  if (!Array.isArray(state.projectDemands)) state.projectDemands = [];
  state.projectDemands.unshift(demand);
  addHistory({
    entidade: "projeto",
    entidadeId: id,
    campo: "criaÃ§Ã£o",
    valorAnterior: "Nova demanda",
    valorNovo: `${type.label}: ${title}`,
  });
  if (!await saveState()) return false;
  projectOperationalFilters.query = id;
  projectOperationalViewMode = "kanban";
  closeModal();
  setView("projectsOperational");
  showToast(`${type.shortLabel} criada no kanban de Projetos em Planejado.`);
}

function renderProjectsManagement() {
  const rows = projectPlanRows(true).filter((row) => row.isProject);
  return `
    ${renderProjectToolbar("projectsManagement", "VisÃ£o Gerencial de Projetos", "Leitura tÃ¡tica de atrasos, regiÃµes, etapas e alimentaÃ§Ã£o da Sala TÃ©cnica", `
      <button class="secondary-action" type="button" data-action="clear-project-plan-filters">Limpar filtros</button>
    `)}
    <section class="kpi-grid">
      ${kpi("Projetos analisados", String(rows.length), "Filtro atual", "blue")}
      ${kpi("Atrasados", String(projectRowsByStatus(rows, "atrasado").length), "Exigem tratativa", projectRowsByStatus(rows, "atrasado").length ? "red" : "green")}
      ${kpi("Em andamento", String(projectRowsByStatus(rows, "emProjetos").length), "ExecuÃ§Ã£o de projetos", "orange")}
      ${kpi("Entregues Ã  ST", String(projectRowsByStatus(rows, "salaTecnica").length), "Liberados para orÃ§amento", "green")}
    </section>
    <div class="content-grid three">
      <section class="panel">
        <div class="panel-header"><div><h2>Status da carteira</h2><p class="panel-subtitle">DistribuiÃ§Ã£o da esteira de Projetos</p></div></div>
        ${barList(projectColumns.map((column) => ({ label: column.label, valor: projectRowsByStatus(rows, column.id).length })), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>RegiÃµes</h2><p class="panel-subtitle">Carga de projetos por regiÃ£o</p></div></div>
        ${barList(projectGroupRows(rows, "regiao"), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>Entregas por mÃªs</h2><p class="panel-subtitle">TÃ©rmino planejado de Projetos</p></div></div>
        ${barList(projectMonthRows(rows), "valor", (value) => String(value))}
      </section>
    </div>
  `;
}

function renderProjectsStrategic() {
  const rows = projectPlanRows(true).filter((row) => row.isProject);
  const metrics = projectMetrics(rows);
  const adherence = metrics.projectRows.length ? ((metrics.delivered.length / metrics.projectRows.length) * 100) : 0;
  return `
    ${renderProjectToolbar("projectsStrategic", "VisÃ£o EstratÃ©gica de Projetos", "Panorama executivo das entregas que habilitam orÃ§amento, verba e execuÃ§Ã£o", ``)}
    <section class="budget-hero project-hero">
      <div>
        <span class="eyebrow">Resumo executivo</span>
        <strong>${number(adherence, 0)}%</strong>
        <p>dos projetos medidos jÃ¡ foram entregues ou liberados para a Sala TÃ©cnica.</p>
      </div>
      <div class="budget-hero-grid">
        ${splitItem("Projetos", String(metrics.projectRows.length))}
        ${splitItem("Atrasados", String(metrics.late.length))}
        ${splitItem("PrÃ³ximos 30 dias", String(metrics.next.length))}
        ${splitItem("RegiÃµes", String(metrics.regions))}
      </div>
    </section>
    <div class="content-grid three">
      <section class="panel">
        <div class="panel-header"><div><h2>Tipo de unidade</h2><p class="panel-subtitle">Onde estÃ¡ a maior carga de Projetos</p></div></div>
        ${barList(projectGroupRows(rows, "tipoUnidade"), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>ClassificaÃ§Ã£o</h2><p class="panel-subtitle">MotivaÃ§Ã£o de investimento</p></div></div>
        ${barList(projectGroupRows(rows, "classificacaoObra"), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>Fila crÃ­tica</h2><p class="panel-subtitle">Projetos atrasados para atuaÃ§Ã£o executiva</p></div></div>
        <div class="alert-list">
          ${metrics.late.slice(0, 8).map(renderProjectAlertItem).join("") || `<div class="empty-state">Sem projeto atrasado no filtro atual.</div>`}
        </div>
      </section>
    </div>
  `;
}

function openProjectPlanDetail(rowNumber) {
  const row = projectOperationalRows(false).find((item) => String(item.row) === String(rowNumber));
  if (!row) return;
  const status = projectColumnById(projectStatusKey(row));
  const type = row.customProjectDemand ? projectDemandTypeById(row.tipoDemanda) : projectDemandTypeById("planoInvestimento");
  const work = row.obraId ? workById(row.obraId) : null;
  const budgetDemand = projectBudgetDemandForRow(row);
  const budgetColumn = budgetDemand ? columnById(budgetDemand.coluna) : null;
  modalRoot.innerHTML = globalThis.SLT_CLOUD.cleanHTML(`
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card project-detail-modal" aria-labelledby="projectDetailTitle">
        <header>
          <div>
            <span class="eyebrow">Projetos 360 Â· ${escapeAttribute(type.label)}</span>
            <h2 id="projectDetailTitle">${escapeAttribute(row.obra || "Projeto sem nome")}</h2>
            <p class="muted">${escapeAttribute(row.regiao || "Sem regiÃ£o")} | ${escapeAttribute(row.tipoUnidade || "Sem tipo")} | ${escapeAttribute(row.chaveEtapa || "Plano de Investimento")}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">Ã—</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${splitItem("Tipo de demanda", type.label)}
            ${splitItem("Status Projeto", status.label)}
            ${splitItem("Etapa", row.etapa || "â€”")}
            ${splitItem("SLA", row.slaDias ? `${row.slaDias} dias` : "â€”")}
            ${splitItem("InÃ­cio orÃ§amento", row.inicioOrcamentacao ? dateText(row.inicioOrcamentacao) : "â€”")}
            ${row.solicitante ? splitItem("Solicitante", row.solicitante) : ""}
            ${row.orgaoRegulador ? splitItem("Ã“rgÃ£o regulador", row.orgaoRegulador) : ""}
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <tbody>
                <tr><th>InÃ­cio planejado</th><td>${row.inicioPlanejado ? dateText(row.inicioPlanejado) : "â€”"}</td></tr>
                <tr><th>TÃ©rmino planejado</th><td>${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "â€”"}</td></tr>
                <tr><th>TÃ©rmino real</th><td>${row.terminoReal ? dateText(row.terminoReal) : "â€”"}</td></tr>
                <tr><th>Cidade / UF</th><td>${escapeAttribute(`${row.praca || "â€”"}/${row.uf || "â€”"}`)}</td></tr>
                <tr><th>ClassificaÃ§Ã£o</th><td>${escapeAttribute(row.classificacaoObra || "â€”")}</td></tr>
                <tr><th>Tipologia</th><td>${escapeAttribute(row.tipologiaObra || "â€”")}</td></tr>
                <tr><th>ObservaÃ§Ãµes</th><td>${escapeAttribute(row.observacoes || "â€”")}</td></tr>
                <tr><th>VÃ­nculo Obras</th><td>${work ? escapeAttribute(work.nome) : "Sem cadastro vinculado em Obras"}</td></tr>
              </tbody>
            </table>
          </div>
          <form class="project-status-form" data-project-status-form>
            <div class="error-box inline-form-error" data-form-error></div>
            <div class="form-grid compact-form-grid">
              <label class="field">
                <span>Status operacional do projeto</span>
                <select name="projectStatus" required>
                  ${projectStatusOptions(status.id)}
                </select>
              </label>
              <div class="project-handoff-card" data-status="${status.tone}">
                <span>IntegraÃ§Ã£o com Obras</span>
                <strong>${row.customProjectDemand ? "Demanda interna de Projetos" : budgetDemand ? `${budgetDemand.id} Â· ${budgetColumn?.label || "Fazer"}` : work ? "Pronto para gerar card" : "Aguardando cadastro em Obras"}</strong>
                <small>${row.customProjectDemand ? "Use o status para controlar o fluxo de Projetos. As demandas do Plano continuam gerando card em Obras ao entregar para ST." : budgetDemand ? "Card jÃ¡ criado na esteira de Obras." : "Ao salvar como Entregue para ST, serÃ¡ criado um card em Obras > Fazer."}</small>
              </div>
            </div>
            <div class="project-status-actions">
              <button class="primary-action" type="button" data-action="update-project-status" data-row="${row.row}">Salvar status</button>
              ${budgetDemand ? `<button class="secondary-action" type="button" data-action="open-demand-detail" data-id="${budgetDemand.id}">Abrir card em Obras</button>` : ""}
            </div>
          </form>
        </div>
        <footer class="modal-actions">
          ${row.customProjectDemand ? "" : budgetDemand ? `<button class="primary-action" type="button" data-action="open-demand-detail" data-id="${budgetDemand.id}">Abrir Obras</button>` : work ? `<button class="primary-action" type="button" data-action="create-budget-from-project" data-row="${row.row}">Criar card em Obras</button>` : `<button class="primary-action" type="button" data-action="open-work-from-plan" data-row="${row.row}">Cadastrar em Obras</button>`}
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
        </footer>
      </section>
    </div>
  `);
}

function renderMaintenanceTabs(activeView) {
  return `
    <nav class="module-tabs" aria-label="NavegaÃ§Ã£o interna de ManutenÃ§Ã£o">
      ${maintenanceNavItems
        .filter((item) => canAccessView(item.view))
        .map(
          (item) => `
            <button class="module-tab ${item.view === activeView ? "is-active" : ""}" type="button" data-view="${item.view}">
              ${item.label}
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderMaintenanceToolbar(activeView, title, subtitle, actions = "") {
  return `
    ${renderToolbar(title, subtitle, actions, moduleHeaders.maintenance)}
    ${renderMaintenanceTabs(activeView)}
  `;
}

function renderClinicalTabs(activeView) {
  return `
    <nav class="module-tabs" aria-label="NavegaÃ§Ã£o interna de Engenharia ClÃ­nica">
      ${clinicalNavItems
        .filter((item) => canAccessView(item.view))
        .map(
          (item) => `
            <button class="module-tab ${item.view === activeView ? "is-active" : ""}" type="button" data-view="${item.view}">
              ${item.label}
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderClinicalToolbar(activeView, title, subtitle, actions = "") {
  return `
    ${renderToolbar(title, subtitle, actions, moduleHeaders.clinical)}
    ${renderClinicalTabs(activeView)}
  `;
}

function renderDashboard() {
  const modules = moduleSummaries();
  return `
    <section class="dashboard-portal dashboard-portal--home-brand" aria-label="Entrada do SLT 360">
      <div class="home-brand-copy">
        <span class="eyebrow">SLT 360Âº</span>
        <h1>Sala TÃ©cnica 360Âº</h1>
        <p>Hub Integrador da Sala TÃ©cnica</p>
      </div>
      <div class="home-brand-seal" aria-hidden="true">
        <img src="assets/logo-hapvida.png" alt="" />
        <span>GestÃ£o integrada de engenharia</span>
      </div>
    </section>

    ${renderHomeFlower(modules)}
  `;
}

function renderHomeFlower(modules) {
  const orderedModules = ["orcamento", "manutencao", "clinica", "gestao"]
    .map((id) => modules.find((module) => module.id === id))
    .filter(Boolean);
  return `
    <section class="home-launchpad-section" aria-label="MÃ³dulos do SLT 360">
      <div class="home-launchpad-panel">
        <span class="eyebrow">Hub integrador</span>
        <h2>Escolha o mÃ³dulo de trabalho</h2>
        <p>Uma entrada Ãºnica para conectar obras, manutenÃ§Ã£o, engenharia clÃ­nica e controle de verbas no mesmo fluxo de gestÃ£o.</p>
        <div class="home-launchpad-flow" aria-label="Fluxo de valor da Sala TÃ©cnica">
          <span>OrÃ§ar</span>
          <i aria-hidden="true"></i>
          <span>Executar</span>
          <i aria-hidden="true"></i>
          <span>Controlar</span>
        </div>
      </div>
      <div class="home-launchpad-grid">
        ${orderedModules.map(renderHomeLaunchpadCard).join("")}
      </div>
    </section>
  `;
}

function renderHomeLaunchpadCard(module) {
  const primary = module.metrics[0] || { label: "Indicador", value: "-" };
  const secondary = module.metrics[1] || null;
  const descriptions = {
    orcamento: "Esteira de EVs, sprints e validaÃ§Ã£o orÃ§amentÃ¡ria.",
    manutencao: "Demandas prediais, fluxo operacional, CAPEX/OPEX e indicadores.",
    clinica: "Parque tecnolÃ³gico, ordens de serviÃ§o e desempenho assistencial.",
    gestao: "CAPEX, OPEX, OIs, transferÃªncias, saldo e curva financeira.",
  };
  const description = module.description || descriptions[module.id] || "Acesse as visÃµes operacionais, gerenciais e executivas.";
  return `
    <button class="home-launchpad-card home-launchpad-card--${module.id}" type="button" data-tone="${module.tone}" data-view="${module.view}" aria-label="Abrir ${module.title}">
      <span class="home-launchpad-card__top">
        <span class="home-launchpad-card__icon" aria-hidden="true">
          <img src="${module.logo}" alt="" />
        </span>
        <span class="home-launchpad-card__number">${module.eyebrow}</span>
      </span>
      <span class="home-launchpad-card__body">
        <strong>${module.title}</strong>
        <small>${description}</small>
      </span>
      <span class="home-launchpad-card__metrics">
        <span>
          <b>${primary.value}</b>
          <em>${primary.label}</em>
        </span>
        ${
          secondary
            ? `<span>
                <b>${secondary.value}</b>
                <em>${secondary.label}</em>
              </span>`
            : ""
        }
      </span>
      <span class="home-launchpad-card__action">
        Abrir mÃ³dulo
        <i aria-hidden="true"></i>
      </span>
    </button>
  `;
}

function reportsRowsByFilter(filter = dashboardReportsFilter) {
  const indicators = dashboardDemandIndicators();
  if (filter === "active") return indicators.active;
  if (filter === "overdue") return indicators.overdue;
  if (filter === "validation") return indicators.validation;
  if (filter === "waitingFunds") return indicators.waitingFunds;
  if (filter === "unassigned") return indicators.unassigned;
  if (filter === "waitingInfo") return indicators.waitingInfo;
  return indicators.rows;
}

function reportFilterLabel(filter = dashboardReportsFilter) {
  const labels = {
    all: "Todas",
    active: "Ativas",
    overdue: "Atrasadas",
    validation: "Aguardando validaÃ§Ã£o",
    waitingFunds: "Aguardando verba",
    waitingInfo: "Aguardando informaÃ§Ãµes",
    unassigned: "Sem responsÃ¡vel",
  };
  return labels[filter] || labels.active;
}

function renderReports() {
  const filters = ["active", "overdue", "validation", "waitingFunds", "waitingInfo", "unassigned", "all"];
  const terms = normalizeSearchText(searchTerm).split(/\s+/).filter(Boolean);
  const rows = reportsRowsByFilter().filter((row) => {
    if (!terms.length) return true;
    const text = normalizeSearchText([row.module, row.id, row.title, row.status, row.responsible].join(" "));
    return terms.every((term) => text.includes(term));
  });
  return `
    ${renderToolbar("RelatÃ³rios 360", "Demandas consolidadas dos mÃ³dulos de Obras, ManutenÃ§Ã£o e Engenharia ClÃ­nica", "")}
    <section class="panel">
      <div class="module-tabs report-tabs">
        ${filters
          .map(
            (filter) => `
              <button class="module-tab ${dashboardReportsFilter === filter ? "is-active" : ""}" type="button" data-action="set-dashboard-report-filter" data-report-filter="${filter}">
                ${reportFilterLabel(filter)}
              </button>
            `
          )
          .join("")}
      </div>
      <div class="panel-header">
        <div>
          <h2>${reportFilterLabel()}</h2>
          <p class="panel-subtitle">${number(rows.length)} demanda(s) no filtro atual</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>MÃ³dulo</th>
              <th>CÃ³digo</th>
              <th>Demanda</th>
              <th>Status</th>
              <th>ResponsÃ¡vel</th>
              <th>Prazo</th>
              <th class="numeric">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    <td>${row.module}</td>
                    <td><strong>${row.id}</strong></td>
                    <td>${row.title}</td>
                    <td><span class="status-pill" data-status="${row.overdue ? "Atrasada" : row.status}">${row.overdue ? "Atrasada" : row.status}</span></td>
                    <td>${row.responsible || "A definir"}</td>
                    <td>${dateText(row.dueDate)}</td>
                    <td class="numeric">${money(row.value)}</td>
                  </tr>
                `
              )
              .join("") || `<tr><td colspan="7">Nenhuma demanda encontrada.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderTeam() {
  const load = analystLoad(false);
  return `
    ${renderToolbar("Equipe", "DistribuiÃ§Ã£o de demandas e perfis de acesso da Sala TÃ©cnica", `
      <button class="secondary-action" type="button" data-view="settings">ConfiguraÃ§Ãµes</button>
    `)}
    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Carga da equipe</h2>
            <p class="panel-subtitle">Demandas abertas por responsÃ¡vel</p>
          </div>
        </div>
        ${barList(load, "valor", (value) => `${number(value)} demanda(s)`)}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>UsuÃ¡rios</h2>
            <p class="panel-subtitle">Perfis Admin, GestÃ£o e Analista</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Nome</th><th>Perfil</th><th>Status</th><th>MÃ³dulos liberados</th></tr>
            </thead>
            <tbody>
              ${(state.users || [])
                .map(
                  (user) => `
                    <tr>
                      <td><strong>${user.nome}</strong><br /><span class="muted">${user.email || ""}</span></td>
                      <td>${user.perfil}</td>
                      <td>${user.status || "Ativo"}</td>
                      <td>${renderUserAccessChips(user)}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function moduleSummaries() {
  const summary = globalThis.SLT_HOME_SUMMARY || {};
  const worksLoaded = globalThis.SLT_CLOUD.isModuleLoaded("works");
  const maintenanceLoaded = globalThis.SLT_CLOUD.isModuleLoaded("maintenance");
  const clinicalLoaded = globalThis.SLT_CLOUD.isModuleLoaded("clinical");
  const financeLoaded = globalThis.SLT_CLOUD.isModuleLoaded("budget");
  const worksMetrics = worksLoaded ? moduleDemandMetrics("works") : null;
  const worksInProgressCount = worksLoaded
    ? worksMetrics.demands.filter((row) => !["pausado", "concluido", "cancelado"].includes(row.rawStatus)).length
    : Number(summary.works?.activeCount || 0);
  const maintenancePortfolio = maintenanceLoaded ? maintenanceItemsForModule("maintenance") : null;
  const maintenancePortfolioMetrics = maintenanceLoaded ? moduleDemandMetrics("maintenance") : null;
  const clinicalPortfolioMetrics = clinicalLoaded ? moduleDemandMetrics("clinical") : null;
  const fundsBalance = financeLoaded ? positiveFundsBalanceTotal() : Number(summary.finance?.availableBalance || 0);
  const totals = worksLoaded ? allTotals() : { contratado: Number(summary.works?.contracted || 0) };
  const pendingEvs = worksLoaded ? budgetWorks().filter((work) => effectiveEVStatus(work) === "Incompleto").length : Number(summary.works?.pendingEVCount || 0);
  const historicalEVCount = worksLoaded
    ? arrayOrFallback(globalThis.EV_HISTORICAL_DATA?.records).length
    : Number(summary.works?.historicalEVCount || 0);
  const clinicalEquipmentCount = clinicalLoaded
    ? Number(globalThis.CLINICAL_EQUIPMENT_DATA?.summary?.equipment || clinicalEquipmentRecords().length || 0)
    : Number(summary.clinical?.equipmentCount || 0);
  const clinicalUnitCount = clinicalLoaded
    ? Number(globalThis.CLINICAL_EQUIPMENT_DATA?.summary?.units || 0)
    : Number(summary.clinical?.unitCount || 0);

  return [
    {
      id: "orcamento",
      view: "worksOperational",
      eyebrow: "01",
      title: "Obras",
      logo: moduleHeaders.works.logo,
      tone: "blue",
      metrics: [
        { label: "EVs histÃ³ricos", value: number(historicalEVCount) },
        { label: "Cards em andamento", value: String(worksInProgressCount) },
        { label: "EVs incompletos", value: String(pendingEvs) },
      ],
    },
    {
      id: "manutencao",
      view: "maintenanceOverview",
      eyebrow: "02",
      title: "ManutenÃ§Ã£o",
      logo: moduleHeaders.maintenance.logo,
      tone: "orange",
      metrics: [
        { label: "Cards operacionais", value: String(maintenancePortfolio?.length ?? Number(summary.maintenance?.totalCount || 0)) },
        { label: "Em fluxo", value: String(maintenancePortfolioMetrics?.active.length ?? Number(summary.maintenance?.activeCount || 0)) },
        { label: "Atrasadas", value: String(maintenancePortfolioMetrics?.overdue.length ?? Number(summary.maintenance?.overdueCount || 0)) },
      ],
    },
    {
      id: "clinica",
      view: "clinicalOverview",
      eyebrow: "03",
      title: "Eng. ClÃ­nica",
      logo: moduleHeaders.clinical.logo,
      tone: "green",
      metrics: [
        { label: "Equipamentos", value: number(clinicalEquipmentCount) },
        { label: "Unidades", value: number(clinicalUnitCount) },
        { label: "OS em fluxo", value: String(clinicalPortfolioMetrics?.active.length ?? Number(summary.clinical?.activeCount || 0)) },
      ],
    },
    {
      id: "gestao",
      view: "fundsOverview",
      eyebrow: "04",
      title: "Controle de Verba",
      logo: moduleHeaders.budget.logo,
      tone: "red",
      metrics: [
        { label: "Verbas", value: String(financeLoaded ? state.funds?.length || 0 : Number(summary.finance?.fundCount || 0)) },
        { label: "Saldo disponÃ­vel", value: moneyCompact(fundsBalance) },
        { label: "Contratado", value: moneyCompact(totals.contratado) },
      ],
    },
  ].filter((module) => canAccessView(viewAliases[module.view] || module.view));
}

function kpi(label, value, hint, tone, view = "", detailKey = "") {
  const viewAttr = view ? ` data-view="${view}" role="button" tabindex="0"` : "";
  const detailAttr = detailKey ? ` data-action="open-kpi-detail" data-kpi="${detailKey}" role="button" tabindex="0"` : "";
  const isClickable = view || detailKey;
  const clickLabel = detailKey ? "Abrir detalhe" : "Abrir visÃ£o";
  return `
    <article class="kpi-card ${isClickable ? "is-clickable" : ""}" data-tone="${tone}" data-click-label="${clickLabel}"${viewAttr}${detailAttr}>
      <small>${label}</small>
      <strong>${value}</strong>
      <span>${hint}</span>
    </article>
  `;
}

function alertItem(title, detail) {
  return `
    <div class="alert-item">
      <div>
        <strong>${title}</strong>
        <span class="muted">${detail}</span>
      </div>
    </div>
  `;
}

function openKpiDetail(key, detail = kpiDetailData(key)) {
  if (!detail) return;
  modalRoot.innerHTML = globalThis.SLT_CLOUD.cleanHTML(`
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card" aria-labelledby="kpiDetailTitle">
        <header>
          <div>
            <span class="eyebrow">${detail.eyebrow || "Indicador"}</span>
            <h2 id="kpiDetailTitle">${detail.title}</h2>
            <p class="muted">${detail.subtitle}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">Ã—</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${detail.metrics.map((metric) => splitItem(metric.label, metric.value)).join("")}
          </div>
          ${
            detail.rows.length
              ? `<label class="field kpi-modal-search">
                  <span>Buscar neste indicador</span>
                  <input data-kpi-modal-search placeholder="Digite obra, regiÃ£o, tipo, status, analista..." />
                </label>`
              : ""
          }
          ${renderKpiDetailTable(detail)}
        </div>
        <footer class="modal-actions">
          ${detail.operationalFilter ? `<button class="secondary-action" type="button" data-action="apply-operational-filter" data-kpi="${detail.operationalFilter}">Filtrar no operacional</button>` : ""}
          ${detail.view ? `<button class="primary-action" type="button" data-view="${detail.view}">${detail.viewLabel || "Abrir visÃ£o"}</button>` : ""}
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
        </footer>
      </section>
    </div>
  `);
}

function renderKpiDetailTable(detail) {
  if (!detail.rows.length) return `<div class="empty-state">Nenhum item encontrado para este indicador.</div>`;
  return `
    <div class="table-wrap kpi-detail-table">
      <table class="data-table">
        <thead>
          <tr>${detail.columns.map((column) => `<th>${column}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${detail.rows
            .map((row) => `<tr data-kpi-row>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
      <p class="muted kpi-result-count" data-kpi-result-count>Mostrando ${detail.rows.length} de ${detail.rows.length} registros.</p>
    </div>
  `;
}

function kpiDetailData(key) {
  if (key.startsWith("mgmt:")) return managementDetailData(key.slice(5));
  const rows = portfolioRows(false, false);
  const totals = allTotals();
  const capex = totals.orcado + totals.aditivado;
  const active = pendingDemands();
  const completed = completedDemands();
  const overdue = overdueDemands();
  const pendingEvs = budgetWorks().filter((work) => effectiveEVStatus(work) === "Incompleto");
  const nearMilestone = rows.filter((row) => row.marcoStatus === "PrÃ³ximo");

  const workDetail = (title, subtitle, works, metrics, view = "portfolio", viewLabel = "Abrir portfÃ³lio") => ({
    title,
    subtitle,
    eyebrow: "PortfÃ³lio de Obras",
    metrics,
    columns: ["Obra", "RegiÃ£o", "Tipo", "EV", "CAPEX"],
    rows: works.map((work) => {
      const item = work.id ? work : workById(work.id);
      const values = item ? workTotals(item) : { orcado: 0, aditivado: 0 };
      return [
        `<strong>${item?.nome || work.nome}</strong>`,
        item?.regiao || work.regional || "â€”",
        item?.tipoUnidade || work.tipoUnidade || "â€”",
        item ? effectiveEVStatus(item) : work.evStatus || "Sem EV",
        money(values.orcado + values.aditivado || work.capex),
      ];
    }),
    view,
    viewLabel,
  });

  const demandDetail = (title, subtitle, demands, metrics, operationalFilter = "", view = "worksOperational") => ({
    title,
    subtitle,
    eyebrow: "Fluxo Operacional",
    metrics,
    columns: ["CÃ³digo", "Obra", "Tipo", "Analista", "Sprint", "Status", "Prazo"],
    rows: demandRows(demands),
    operationalFilter,
    view,
    viewLabel: "Abrir operacional",
  });

  if (key === "worksPortfolio") {
    return workDetail("Obras no portfÃ³lio", "Carteira cadastrada do plano de investimento.", budgetWorks(), [
      { label: "Total de obras", value: String(budgetWorks().length) },
      { label: "RegiÃµes", value: String(new Set(budgetWorks().map((work) => work.regiao)).size) },
      { label: "CAPEX", value: money(capex) },
      { label: "EVs incompletos", value: String(pendingEvs.length) },
    ]);
  }
  if (key === "activeDemands") {
    return demandDetail("Demandas ativas", "Demandas abertas na esteira operacional de Obras.", active, [
      { label: "Ativas", value: String(active.length) },
      { label: "Atrasadas", value: String(overdue.length) },
      { label: "Analistas", value: String(uniqueAnalysts().length) },
      { label: "Sprints", value: String((state.sprints || []).length) },
    ], "activeDemands");
  }
  if (key === "overdueDemands") {
    return demandDetail("Demandas atrasadas", "Itens fora da data prevista de entrega.", overdue, [
      { label: "Atrasadas", value: String(overdue.length) },
      { label: "Maior impacto", value: topLabel(activeLoadByWork()) },
      { label: "Analistas envolvidos", value: String(new Set(overdue.map((demand) => demand.analistaResponsavel).filter(Boolean)).size) },
      { label: "Data base", value: dateText(todayISO()) },
    ], "overdueDemands");
  }
  if (key === "capexConsolidated") {
    const ranked = budgetWorks()
      .map((work) => ({ work, total: workTotals(work).orcado + workTotals(work).aditivado }))
      .sort((a, b) => b.total - a.total)
      .map((item) => item.work);
    return workDetail("Total orÃ§ado", "Maiores EVs que compÃµem a carteira de investimento.", ranked, [
      { label: "EV + SICs", value: money(capex) },
      { label: "Contratado", value: money(totals.contratado) },
      { label: "Saldo", value: money(totals.saldo) },
      { label: "Obras", value: String(budgetWorks().length) },
    ], "budget", "Abrir Controle de Verba");
  }
  if (key === "nearMilestone") {
    const works = nearMilestone.map((row) => workById(row.id)).filter(Boolean);
    return workDetail("PrÃ³ximas do marco", "Obras com marco de acompanhamento prÃ³ximo ou EV ainda incompleto.", works, [
      { label: "PrÃ³ximas", value: String(works.length) },
      { label: "EVs incompletos", value: String(pendingEvs.length) },
      { label: "Marco dominante", value: topLabel(groupRowsBy(nearMilestone, "proximoMarco")) },
      { label: "Carteira", value: String(rows.length) },
    ]);
  }
  if (key === "pendingEvs") {
    return workDetail("EVs incompletos", "Obras que possuem EV, mas cujo preenchimento ainda nÃ£o estÃ¡ completo.", pendingEvs, [
      { label: "Incompletos", value: String(pendingEvs.length) },
      { label: "Completos", value: String(budgetWorks().filter((work) => effectiveEVStatus(work) === "Completo").length) },
      { label: "% incompleto", value: `${number((pendingEvs.length / Math.max(budgetWorks().filter((work) => effectiveEVStatus(work) !== "Sem EV").length, 1)) * 100)}%` },
      { label: "Sem EV", value: String(budgetWorks().filter((work) => effectiveEVStatus(work) === "Sem EV").length) },
    ], "ev", "Abrir EVs");
  }
  if (key === "completedDemands") {
    return demandDetail("Demandas concluÃ­das", "Entregas registradas no fluxo operacional.", completed, [
      { label: "ConcluÃ­das", value: String(completed.length) },
      { label: "No prazo", value: String(completed.filter((demand) => demandDeliveryDelay(demand) <= 0).length) },
      { label: "Com atraso", value: String(completed.filter((demand) => demandDeliveryDelay(demand) > 0).length) },
      { label: "Valor produzido", value: money(completed.reduce((sum, demand) => sum + demandProducedValue(demand), 0)) },
    ], "completedDemands", "worksManagement");
  }
  if (key === "analysts") {
    return {
      title: "Analistas mobilizados",
      subtitle: "Carga aberta, entregas concluÃ­das e atraso por responsÃ¡vel.",
      eyebrow: "Capacidade Operacional",
      metrics: [
        { label: "Analistas", value: String(uniqueAnalysts().length) },
        { label: "Demandas abertas", value: String(active.length) },
        { label: "ConcluÃ­das", value: String(completed.length) },
        { label: "Atrasadas", value: String(overdue.length) },
      ],
      columns: ["Analista", "Abertas", "ConcluÃ­das", "Atrasadas", "Valor produzido"],
      rows: uniqueAnalysts().map((analyst) => [
        `<strong>${analyst}</strong>`,
        String(active.filter((demand) => demand.analistaResponsavel === analyst).length),
        String(completed.filter((demand) => demand.analistaResponsavel === analyst).length),
        String(overdue.filter((demand) => demand.analistaResponsavel === analyst).length),
        money(completed.filter((demand) => demand.analistaResponsavel === analyst).reduce((sum, demand) => sum + demandProducedValue(demand), 0)),
      ]),
      view: "worksManagement",
      viewLabel: "Abrir gerencial",
    };
  }
  if (key.startsWith("sic")) return sicKpiDetailData(key);
  if (key.startsWith("strategic")) return strategicKpiDetailData(key);
  if (key.startsWith("op")) return operationalKpiDetailData(key);
  return null;
}

function sicKpiDetailData(key) {
  const data = sicDashboardData();
  const selectors = {
    sicImpact: data.records,
    sicAdditives: data.additions,
    sicSuppressions: data.suppressions,
    sicWorks: data.records,
    sicTotal: data.records,
  };
  const titles = {
    sicImpact: "Impacto lÃ­quido das SICs",
    sicAdditives: "Valores de Aditivos",
    sicSuppressions: "SupressÃµes",
    sicWorks: "Obras impactadas por SICs",
    sicTotal: "SICs analisadas",
  };
  const records = selectors[key];
  if (!records) return null;
  const rows = sicSummaryRows(records);
  return {
    title: titles[key],
    subtitle: "Detalhe filtrado da base histÃ³rica de SICs.",
    eyebrow: "BI de SICs",
    metrics: [
      { label: "Linhas", value: String(records.length) },
      { label: "SICs", value: String(rows.length) },
      { label: "Obras", value: String(new Set(records.map((record) => `${record.obra}|${record.nomeObra}`)).size) },
      { label: "Impacto", value: money(records.reduce((sum, record) => sum + record.valor, 0)) },
    ],
    columns: ["SIC", "Obra", "Movimento", "Disciplinas", "Valor", "Sprint"],
    rows: rows.map((sic) => [
      `<strong>${sic.id}</strong>`,
      `<strong>${sic.nomeObra}</strong><br /><span class="muted">${sic.estado}</span>`,
      sic.movimento,
      sic.disciplinas.slice(0, 3).join(", "),
      money(sic.valor),
      sic.sprint,
    ]),
    view: "sics",
    viewLabel: "Abrir SICs",
  };
}

function strategicKpiDetailData(key) {
  if (key === "strategicUnifiedEV" || key === "strategicUnifiedTop5") {
    const records = evUnifiedRecords().slice().sort((a, b) => Number(b.total || 0) - Number(a.total || 0));
    const selected = key === "strategicUnifiedTop5" ? records.slice(0, 5) : records;
    const total = records.reduce((sum, record) => sum + Number(record.total || 0), 0);
    const valid = records.filter((record) => Number(record.total) > 0 && Number(record.area) > 0);
    const area = valid.reduce((sum, record) => sum + Number(record.area || 0), 0);
    const validValue = valid.reduce((sum, record) => sum + Number(record.total || 0), 0);
    return {
      eyebrow: "VisÃ£o EstratÃ©gica Â· Base EV",
      title: key === "strategicUnifiedTop5" ? "Cinco maiores EVs da base unificada" : "Base estratÃ©gica unificada de EVs",
      subtitle: "A mesma origem de dados da aba EV, sem indicadores paralelos da antiga Base Geral.",
      metrics: [
        { label: "EVs", value: String(records.length) },
        { label: "Valor total", value: money(total) },
        { label: "Ãrea vÃ¡lida", value: `${number(area)} mÂ²` },
        { label: "EVs com Ã¡rea vÃ¡lida", value: String(valid.length) },
      ],
      columns: ["Ano / EV", "Tipologia", "Origem", "Valor", "Ãrea", "Custo/mÂ²", "% da base"],
      rows: selected.map((record) => [
        `<strong>${record.year} Â· ${escapeAttribute(record.project)}</strong><br /><span class="muted">${escapeAttribute(record.code || "Sem cÃ³digo")} Â· ${escapeAttribute(record.revision || "")}</span>`,
        record.typology || "NÃ£o informada",
        record.sourceLabel || "Base EV",
        money(record.total),
        record.area ? `${number(record.area)} mÂ²` : "â€”",
        record.area && record.total ? `${money(record.total / record.area)}/mÂ²` : "â€”",
        `${number((Number(record.total || 0) / Math.max(total, 1)) * 100, 1)}%`,
      ]),
      view: "ev",
      viewLabel: "Abrir aba EV",
    };
  }
  const totals = allTotals();
  const sourceRecords = historicalWorksRecords();
  const sourceSummary = historicalWorksSummary(sourceRecords);
  const capex = sourceSummary.salaTecnica;
  const negotiatedTotal = sourceSummary.negociado;
  const ranked = investmentRankingRows();
  const workColumns = ["Obra", "RegiÃ£o", "Tipo", "ClassificaÃ§Ã£o", "Valor", "Custo/mÂ²"];
  const workRows = (works) =>
    works.map((work) => {
      const values = workTotals(work);
      const total = values.orcado + values.aditivado;
      return [
        `<strong>${work.nome}</strong>`,
        work.regiao || "â€”",
        work.tipoUnidade || "â€”",
        work.classificacaoObra || "â€”",
        money(total),
        work.areaEquivalente ? `${money(total / work.areaEquivalente)}/mÂ²` : "â€”",
      ];
    });
  const targetRows = strategicCostTargetRows();
  const targetSummary = strategicCostTargetSummary(targetRows);
  const commissionSummary = commissionBenchmarkSummary();
  const targetWorkColumns = ["Obra", "ClassificaÃ§Ã£o", "Cidade/UF", "EV / CAPEX", "Ãrea vÃ¡lida", "Custo/mÂ²", "Desvio", "Status"];
  const targetWorkRows = (readings) =>
    readings
      .filter(isStrategicCostReadingValid)
      .map((reading) => [
        `<strong>${reading.work.nome}</strong><br /><span class="muted">${reading.work.tipoUnidade || "Tipo nÃ£o informado"} Â· ${reading.work.classificacaoObra || "Sem classificaÃ§Ã£o"}</span>`,
        strategicCostTargetModeLabel(reading.work),
        `${reading.work.cidade || "â€”"}/${reading.work.uf || "â€”"}`,
        money(reading.value),
        `${number(reading.area)} mÂ²`,
        `${money(reading.costM2)}/mÂ²`,
        reading.target ? `${money(reading.costM2 - reading.target.targetMax)}/mÂ²` : "â€”",
        `<span class="status-pill" data-status="${strategicCostTargetStatusTone(reading.status)}">${reading.status}</span>`,
      ]);
  const detailBase = {
    eyebrow: "VisÃ£o EstratÃ©gica",
    metrics: [
      { label: "Sala TÃ©cnica", value: money(capex) },
      { label: "Negociado", value: money(negotiatedTotal) },
      { label: "Obras", value: String(sourceRecords.length) },
      { label: "Ãrea", value: `${number(sourceSummary.area)} mÂ²` },
    ],
    view: "worksStrategic",
    viewLabel: "Abrir estratÃ©gica",
  };

  if (key.startsWith("strategicCostTarget:")) {
    const targetId = key.split(":")[1];
    const row = targetRows.find((item) => item.id === targetId);
    if (!row) return null;
    const readings = row.readings
      .filter(isStrategicCostReadingValid)
      .slice()
      .sort((a, b) => {
        const statusWeight = (reading) => (reading.aboveTarget ? 3 : reading.belowRange ? 2 : reading.measured ? 1 : 0);
        return statusWeight(b) - statusWeight(a) || b.value - a.value;
      });
    return {
      ...detailBase,
      title: row.label,
      subtitle: `Somente obras da Base Geral com valor negociado, Ã¡rea e custo/mÂ² vÃ¡lidos entram nesta leitura. Meta SLT: ${row.targetLabel}.`,
      metrics: [
        { label: "Obras vÃ¡lidas", value: String(readings.length) },
        { label: "Valor negociado", value: money(row.capex) },
        { label: "Ãrea vÃ¡lida", value: `${number(row.area)} mÂ²` },
        { label: "Custo mÃ©dio mÂ²", value: row.costM2 ? `${money(row.costM2)}/mÂ²` : "Sem leitura" },
        { label: "Dentro da meta", value: String(row.withinCount) },
        { label: "Acima da meta", value: String(row.aboveCount) },
        { label: "Abaixo da faixa", value: String(row.belowRangeCount) },
        { label: "AderÃªncia", value: row.measuredCount ? `${number(row.adherence)}%` : "Sem leitura" },
        { label: "HistÃ³rico ComissÃ£o", value: row.historicalCount ? `${money(row.historicalPrecoM2Mediana || row.historicalPrecoM2Ponderado)}/mÂ²` : "Sem base" },
        { label: "Hist. negociado", value: money(row.historicalNegociado) },
      ],
      columns: targetWorkColumns,
      rows: targetWorkRows(readings),
    };
  }

  if (key === "strategicCostTargets") {
    return {
      ...detailBase,
      title: "AderÃªncia Ã  meta de custo por mÂ²",
      subtitle: "ComparaÃ§Ã£o por tipologia contra as premissas da Sala TÃ©cnica.",
      metrics: [
        { label: "Obras vÃ¡lidas", value: String(targetSummary.measured) },
        { label: "Dentro da meta", value: String(targetSummary.within) },
        { label: "Acima da meta", value: String(targetSummary.above) },
        { label: "AderÃªncia", value: targetSummary.measured ? `${number(targetSummary.adherence)}%` : "Sem leitura" },
        { label: "Base histÃ³rica", value: String(commissionSummary.count) },
        { label: "MÂ² histÃ³rico", value: commissionSummary.count ? `${money(commissionSummary.precoM2Mediana || commissionSummary.precoM2Ponderado)}/mÂ²` : "Sem base" },
      ],
      columns: ["Tipologia", "Meta SLT", "Obras vÃ¡lidas", "Negociado", "Ãrea vÃ¡lida", "Custo/mÂ²", "AderÃªncia", "Mediana mÂ²", "Negociado total", "Status"],
      rows: targetRows.map((row) => [
        `<strong>${row.label}</strong>`,
        row.targetLabel,
        String(row.measuredCount),
        money(row.capex),
        `${number(row.area)} mÂ²`,
        row.costM2 ? `${money(row.costM2)}/mÂ²` : "â€”",
        row.measuredCount ? `${number(row.adherence)}%` : "â€”",
        row.historicalCount ? `${money(row.historicalPrecoM2Mediana || row.historicalPrecoM2Ponderado)}/mÂ²` : "â€”",
        row.historicalCount ? money(row.historicalNegociado) : "â€”",
        `<span class="status-pill" data-status="${strategicCostTargetStatusTone(row.status)}">${row.status}</span>`,
      ]),
    };
  }

  if (key === "strategicCommissionBase") {
    const records = sourceRecords
      .slice()
      .sort((a, b) => (Number(b.valorNegociado) || 0) - (Number(a.valorNegociado) || 0));
    return {
      ...detailBase,
      title: "Base Geral de Obras 2023 a 2026",
      subtitle: "Todas as linhas de obras importadas; campos ausentes permanecem identificados na consulta.",
      metrics: [
        { label: "Obras importadas", value: String(sourceRecords.length) },
        { label: "Valor Sala TÃ©cnica", value: money(sourceSummary.salaTecnica) },
        { label: "Valor negociado", value: money(sourceSummary.negociado) },
        { label: "Saving tÃ©cnico", value: money(sourceSummary.saving) },
        { label: "Ãrea histÃ³rica", value: `${number(sourceSummary.area)} mÂ²` },
        { label: "PreÃ§o/mÂ² mediano", value: commissionSummary.count ? `${money(commissionSummary.precoM2Mediana)}/mÂ²` : "Sem base" },
      ],
      columns: ["Obra", "UF", "RegiÃ£o", "ClassificaÃ§Ã£o", "Tipo", "Sala TÃ©cnica", "Negociado", "Ãrea", "PreÃ§o/mÂ²", "Status"],
      rows: records.map((record) => [
        `<strong>${record.nomeObra || record.nomeObraOriginal || "Sem nome"}</strong><br /><span class="muted">${record.codigoObra || "Sem cÃ³digo"} Â· ${dateText(record.mes)}</span>`,
        record.uf || "â€”",
        record.regiao || "â€”",
        record.classificacaoObra || "â€”",
        record.tipoObra || record.tipoObras || "â€”",
        money(record.valorSalaTecnica),
        money(record.valorNegociado),
        `${number(record.areaM2)} mÂ²`,
        `${money(record.precoM2)}/mÂ²`,
        record.status || "â€”",
      ]),
    };
  }

  if (key === "strategicAboveTarget") {
    const readings = worksAboveStrategicCostTarget();
    return {
      ...detailBase,
      title: "Obras acima da meta de custo por mÂ²",
      subtitle: "Obras que ultrapassam o teto definido para a tipologia.",
      metrics: [
        { label: "Acima da meta", value: String(readings.length) },
        { label: "Maior custo/mÂ²", value: readings[0] ? `${money(readings[0].costM2)}/mÂ²` : "â€”" },
        { label: "Meta mais crÃ­tica", value: readings[0]?.target?.label || "Sem leitura" },
        { label: "Desvio mÃ¡ximo", value: readings[0]?.target ? `${money(readings[0].costM2 - readings[0].target.targetMax)}/mÂ²` : "â€”" },
      ],
      columns: targetWorkColumns,
      rows: targetWorkRows(readings),
    };
  }

  if (key === "strategicRegions") {
    const rows = historicalNegotiatedByRegion();
    return {
      ...detailBase,
      title: "RegiÃµes atendidas",
      subtitle: "DistribuiÃ§Ã£o regional do valor negociado nas 485 obras da Base Geral.",
      columns: ["RegiÃ£o", "Valor negociado", "% do total"],
      rows: rows.map((row) => [row.label, money(row.valor), `${number((row.valor / Math.max(negotiatedTotal, 1)) * 100, 1)}%`]),
    };
  }

  if (key === "strategicTop5") {
    const rows = historicalInvestmentRankingRows().slice(0, 5);
    return {
      ...detailBase,
      title: "ConcentraÃ§Ã£o Top 5",
      subtitle: "Cinco maiores valores negociados da Base Geral atualizada.",
      columns: ["Obra", "RegiÃ£o", "ClassificaÃ§Ã£o", "Negociado", "% do total", "Ãrea", "Custo/mÂ²"],
      rows: rows.map(({ record, valor }) => [
        `<strong>${record.nomeObra}</strong><br /><span class="muted">${record.codigoObra || "Sem cÃ³digo"}</span>`,
        record.regiao || "â€”",
        historicalClassificationLabel(record.classificacaoObra),
        money(valor),
        `${number((valor / Math.max(negotiatedTotal, 1)) * 100, 1)}%`,
        `${number(record.areaM2)} mÂ²`,
        record.precoM2 ? `${money(record.precoM2)}/mÂ²` : "â€”",
      ]),
    };
  }

  const map = {
    strategicCapex: {
      title: "CAPEX total",
      subtitle: "ComposiÃ§Ã£o executiva dos EVs consolidados.",
      works: ranked.map((row) => row.work),
    },
    strategicWorks: {
      title: "Obras estratÃ©gicas",
      subtitle: "Projetos classificados como estratÃ©gicos, expansÃ£o ou verticalizaÃ§Ã£o.",
      works: budgetWorks().filter(isStrategicWork),
    },
    strategicNewUnits: {
      title: "Novas unidades",
      subtitle: "Projetos associados Ã  expansÃ£o de rede e novas operaÃ§Ãµes.",
      works: budgetWorks().filter(isNewUnit),
    },
    strategicPendingEvs: {
      title: "EVs incompletos",
      subtitle: "Estudos de viabilidade existentes que ainda estÃ£o incompletos.",
      works: budgetWorks().filter((work) => effectiveEVStatus(work) === "Incompleto"),
    },
    strategicCriticalBalance: {
      title: "Saldo crÃ­tico",
      subtitle: "Obras com saldo financeiro em atenÃ§Ã£o para decisÃ£o executiva.",
      works: worksWithCriticalBalance(),
    },
    strategicTop5: {
      title: "ConcentraÃ§Ã£o Top 5",
      subtitle: "Projetos que mais concentram o CAPEX total da carteira.",
      works: ranked.slice(0, 5).map((row) => row.work),
    },
  };
  const item = map[key];
  if (!item) return null;
  return {
    ...detailBase,
    title: item.title,
    subtitle: item.subtitle,
    columns: workColumns,
    rows: workRows(item.works),
  };
}

function demandRows(demands) {
  return demands.map((demand) => {
    const work = workById(demand.obraId);
    return [
      `<strong>${demand.id}</strong>`,
      work?.nome || "Obra nÃ£o localizada",
      demandTypeLabel(demand.tipo),
      demand.analistaResponsavel || "â€”",
      demandSprintIds(demand).length ? demandSprintNames(demand, " | ") : "â€”",
      demandStatusLabel(demand),
      isDemandLate(demand) ? "Atrasada" : dateText(demand.dataPrevistaEntrega),
    ];
  });
}

function operationalKpiDetailData(key) {
  const filtered = filteredDemands();
  const map = {
    opTotal: { title: "Total no filtro operacional", demands: filtered, metric: "Total", filter: "opTotal" },
    opPullPlanning: { title: "Demandas em Pull Planning", demands: filtered.filter((demand) => demand.coluna === "pullPlanning"), metric: "Pull Planning", filter: "opPullPlanning" },
    opFazer: { title: "Demandas a iniciar", demands: filtered.filter((demand) => demand.coluna === "fazer"), metric: "A iniciar", filter: "opFazer" },
    opFazendo: { title: "Demandas em execuÃ§Ã£o", demands: filtered.filter((demand) => demand.coluna === "fazendo"), metric: "Em execuÃ§Ã£o", filter: "opFazendo" },
    opPausado: { title: "Demandas pausadas", demands: filtered.filter((demand) => demand.coluna === "pausado"), metric: "Pausadas", filter: "opPausado" },
    opValidacao: {
      title: "Demandas em validaÃ§Ã£o",
      demands: filtered.filter((demand) => demandValidationColumnIds.includes(demand.coluna)),
      metric: "ValidaÃ§Ã£o",
      filter: "opValidacao",
    },
    opConcluido: { title: "Demandas concluÃ­das", demands: filtered.filter((demand) => demand.coluna === "concluido"), metric: "ConcluÃ­das", filter: "opConcluido" },
    opCancelado: { title: "Demandas canceladas", demands: filtered.filter((demand) => demand.coluna === "cancelado"), metric: "Canceladas", filter: "opCancelado" },
    opAtrasadas: { title: "Demandas atrasadas", demands: filtered.filter(isDemandLate), metric: "Atrasadas", filter: "opAtrasadas" },
  };
  const item = map[key];
  if (!item) return null;
  const validationMetrics = key === "opValidacao"
    ? [
        { label: "Total em validaÃ§Ã£o", value: String(item.demands.length) },
        { label: "Aguardando Obras", value: String(item.demands.filter((demand) => demand.coluna === "validacaoObras").length) },
        { label: "Validado Obras", value: String(item.demands.filter((demand) => demand.coluna === "validadoObras").length) },
        { label: "AprovaÃ§Ã£o Diretoria", value: String(item.demands.filter((demand) => demand.coluna === "aprovacaoDiretoria").length) },
      ]
    : null;
  return {
    title: item.title,
    subtitle: operationalActiveFilterText() || "Leitura do painel operacional no filtro atual.",
    eyebrow: "Painel Operacional",
    metrics: validationMetrics || [
      { label: item.metric, value: String(item.demands.length) },
      { label: "Analistas", value: String(new Set(item.demands.map((demand) => demand.analistaResponsavel).filter(Boolean)).size) },
      { label: "Atrasadas", value: String(item.demands.filter(isDemandLate).length) },
      { label: "Sem analista", value: String(item.demands.filter((demand) => !demand.analistaResponsavel).length) },
    ],
    columns: ["CÃ³digo", "Obra", "Tipo", "Analista", "Sprint", "Status", "Prazo"],
    rows: demandRows(item.demands),
    operationalFilter: item.filter,
    view: "worksOperational",
    viewLabel: "Abrir operacional",
  };
}

function groupRowsBy(rows, field) {
  const map = new Map();
  rows.forEach((row) => {
    const label = row[field] || "NÃ£o informado";
    map.set(label, (map.get(label) || 0) + 1);
  });
  return [...map.entries()].map(([label, valor]) => ({ label, valor })).sort((a, b) => b.valor - a.valor);
}

function barList(items, valueKey, formatter) {
  if (!items.length) return `<div class="empty-state">Sem dados para exibir.</div>`;
  const max = Math.max(...items.map((item) => item[valueKey]), 1);
  return `
    <div class="bar-list">
      ${items
        .map((item, index) => {
          const width = Math.max((item[valueKey] / max) * 100, 2);
          const colors = ["var(--blue)", "var(--orange)", "var(--green)", "var(--cyan)", "var(--yellow)"];
          const drillAttrs = item.drillField
            ? ` role="button" tabindex="0" data-action="open-sic-slice" data-field="${item.drillField}" data-label="${escapeAttribute(item.drillLabel || item.label)}"`
            : "";
          return `
            <div class="bar-row ${item.drillField ? "is-clickable" : ""}"${drillAttrs}>
              <span class="bar-label">${item.label}</span>
              <span class="bar-track">
                <span class="bar-fill" style="width:${width}%; background:${colors[index % colors.length]}"></span>
              </span>
              <span class="bar-value">${formatter(item[valueKey])}</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderWorksHome() {
  const rows = portfolioRows();
  const totals = allTotals();
  const capex = totals.orcado + totals.aditivado;
  const overdue = overdueDemands();
  const activeDemands = pendingDemands();
  const completed = completedDemands();
  const analysts = uniqueAnalysts();
  const pendingEvs = rows.filter((row) => row.evStatus === "Incompleto").length;
  const nearMilestone = rows.filter((row) => row.marcoStatus === "PrÃ³ximo").length;

  return `
    ${renderWorksToolbar("worksHome", "Obras", "Central de orÃ§amentaÃ§Ã£o da Sala TÃ©cnica com portfÃ³lio, EV, SICs e visÃµes gerenciais", `
      ${miroButton("Fluxos no Miro")}
      <button class="secondary-action" type="button" data-view="portfolio">Consultar portfÃ³lio</button>
      <button class="primary-action" type="button" data-action="open-demand">Nova demanda</button>
    `)}

    <section class="kpi-grid">
      ${kpi("Obras no portfÃ³lio", String(rows.length), "Carteira do plano de investimento", "blue", "", "worksPortfolio")}
      ${kpi("Demandas ativas", String(activeDemands.length), "Fluxo operacional de obras", "orange", "", "activeDemands")}
      ${kpi("Demandas atrasadas", String(overdue.length), "Itens fora do prazo previsto", overdue.length ? "red" : "green", "", "overdueDemands")}
      ${kpi("Total orÃ§ado", money(capex), "EVs + SICs aprovadas", "blue", "", "capexConsolidated")}
      ${kpi("PrÃ³ximas do marco", String(nearMilestone), "Acompanhamento executivo", "green", "", "nearMilestone")}
      ${kpi("EVs incompletos", String(pendingEvs), "EVs existentes ainda com preenchimento incompleto", pendingEvs ? "red" : "green", "", "pendingEvs")}
      ${kpi("Demandas concluÃ­das", String(completed.length), "Entregas registradas", "green", "", "completedDemands")}
      ${kpi("Analistas mobilizados", String(analysts.length), analysts.join(", ") || "Sem analistas", "orange", "", "analysts")}
    </section>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Fila crÃ­tica</h2>
            <p class="panel-subtitle">Demandas atrasadas ou aguardando validaÃ§Ã£o</p>
          </div>
          <button class="secondary-action" type="button" data-view="worksOperational">Ver todas</button>
        </div>
        <div class="alert-list">
          ${criticalDemandItems().join("") || `<div class="empty-state">Sem demanda crÃ­tica no momento.</div>`}
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Obras com maior carga ativa</h2>
            <p class="panel-subtitle">Quantidade de demandas abertas por obra</p>
          </div>
          <button class="secondary-action" type="button" data-view="portfolio">Abrir obras</button>
        </div>
        ${barList(activeLoadByWork(), "valor", (value) => `${value} ativa${value === 1 ? "" : "s"}`)}
      </section>
    </div>

    <div class="content-grid three">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Capacidade em uso</h2>
            <p class="panel-subtitle">Demandas abertas por analista</p>
          </div>
        </div>
        ${barList(analystLoad(false), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>DistribuiÃ§Ã£o regional</h2>
            <p class="panel-subtitle">Quantidade de obras por regiÃ£o</p>
          </div>
        </div>
        ${barList(workCountBy("regiao"), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>ComposiÃ§Ã£o do portfÃ³lio</h2>
            <p class="panel-subtitle">Tipos de unidade no plano</p>
          </div>
        </div>
        ${barList(workCountBy("tipoUnidade"), "valor", (value) => String(value))}
      </section>
    </div>
  `;
}

function renderWorksOperational() {
  const filtered = filteredDemands();
  const activeSprint = currentSprint();
  const awaitingValidation = filtered.filter((demand) => demandValidationColumnIds.includes(demand.coluna)).length;
  const inProgress = filtered.filter((demand) => demand.coluna === "fazendo").length;
  const paused = filtered.filter((demand) => demand.coluna === "pausado").length;
  const concluded = filtered.filter((demand) => demand.coluna === "concluido").length;
  const canceled = filtered.filter((demand) => demand.coluna === "cancelado").length;
  const late = filtered.filter(isDemandLate).length;
  const engineeringMeeting = filtered.filter(isEngineeringMeetingSic).length;

  return `
    ${renderWorksToolbar("worksOperational", "VisÃ£o Operacional", "Planejamento, fluxo de trabalho e controle dos marcos de entrega por sprint", `
      <button class="secondary-action" type="button" data-action="export-works-operational">Exportar relatÃ³rio filtrado</button>
      <button class="primary-action" type="button" data-action="open-demand">Nova demanda</button>
    `)}
    <section class="status-line module-status-line">
      <span class="tag">Sprint atual: ${activeSprint?.nome || "Sem sprint ativa"}</span>
    </section>

    ${renderOperationalFilters()}

    <section class="kpi-grid">
      ${kpi("Total no Filtro", String(filtered.length), "Demandas no filtro atual", "blue", "", "opTotal")}
      ${kpi("Pull Planning", String(filtered.filter((demand) => demand.coluna === "pullPlanning").length), "Planejamento das demandas", "blue", "", "opPullPlanning")}
      ${kpi("A iniciar", String(filtered.filter((demand) => demand.coluna === "fazer").length), "Fila Fazer", "orange", "", "opFazer")}
      ${kpi("Em execuÃ§Ã£o", String(inProgress), "Fila Fazendo", "green", "", "opFazendo")}
      ${kpi("Pausado", String(paused), "Aguardando destrava", "orange", "", "opPausado")}
      ${kpi("ValidaÃ§Ã£o", String(awaitingValidation), "Obras e Diretoria", "blue", "", "opValidacao")}
      ${kpi("ConcluÃ­do", String(concluded), "Entregas registradas", "green", "", "opConcluido")}
      ${kpi("Cancelado", String(canceled), "Itens encerrados sem entrega", "red", "", "opCancelado")}
      ${kpi("Atrasadas", String(late), "Prazo previsto vencido", late ? "red" : "green", "", "opAtrasadas")}
      ${kpi("Cobrado em reuniÃ£o", String(engineeringMeeting), "SICs cobradas em reuniÃ£o", engineeringMeeting ? "orange" : "green", "", "opEngineeringMeeting")}
    </section>

    <section class="panel operational-board-panel">
      <div class="panel-header">
        <div>
          <h2>Kanban operacional</h2>
          <p class="panel-subtitle">Demandas por status, responsÃ¡vel e prazo</p>
        </div>
        <div class="inline-actions">
          <div class="segmented">
            <button class="${operationalViewMode === "kanban" ? "is-active" : ""}" type="button" data-action="set-operational-view" data-mode="kanban">Kanban</button>
            <button class="${operationalViewMode === "list" ? "is-active" : ""}" type="button" data-action="set-operational-view" data-mode="list">Lista</button>
          </div>
        </div>
      </div>
      ${renderOperationalFilterBanner()}
      ${operationalViewMode === "kanban" ? renderKanbanBoard(filtered) : renderOperationalList(filtered)}
    </section>
  `;
}

function filteredDemands() {
  return state.demands.filter((demand) => {
    const work = workById(demand.obraId);
    const sprintIds = demandSprintIds(demand);
    const sicInfo = demandSicInfo(demand) || {};
    const text = normalizeSearchText(
      `${demand.id} ${work?.nome || ""} ${demandAnalystNames(demand).join(" ")} ${normalizeDemandLabels(demand.etiquetas).join(" ")} ${demandSprintNames(demand, " ")} ${demand.tipo} ${demand.observacao || ""} ${sicInfo.lecomNumber || ""} ${sicInfo.numeroSic || ""} ${sicInfo.tituloSic || ""} ${sicInfo.obraNumber || ""} ${sicInfo.obraNome || ""}`
    );
    const query = normalizeSearchText([searchTerm, operationalFilters.query].filter(Boolean).join(" ")).trim();
    if (query && !query.split(/\s+/).every((part) => text.includes(part))) return false;
    const selectedSprints = operationalFilterValues("sprintId");
    const selectedAnalysts = operationalFilterValues("analyst");
    const selectedTypes = operationalFilterValues("type");
    const selectedStatuses = operationalFilterValues("status");
    const selectedEngineeringMeeting = operationalFilterValues("engineeringMeeting");
    const selectedPunctualities = operationalFilterValues("punctuality");
    const plannedDelivery = dateOnly(demand.dataPrevistaEntrega);
    if (operationalFilters.dateFrom && (!plannedDelivery || plannedDelivery < operationalFilters.dateFrom)) return false;
    if (operationalFilters.dateTo && (!plannedDelivery || plannedDelivery > operationalFilters.dateTo)) return false;
    if (selectedSprints.length) {
      const matchesUnassignedSprint = selectedSprints.includes(unassignedSprintFilterValue) && !sprintIds.length;
      const matchesSprint = sprintIds.some((sprintId) => selectedSprints.includes(sprintId));
      if (!matchesUnassignedSprint && !matchesSprint) return false;
    }
    if (selectedAnalysts.length) {
      const demandAnalysts = demandAnalystNames(demand);
      const matchesUnassigned = selectedAnalysts.includes(unassignedAnalystFilterValue) && !demandAnalysts.length;
      const matchesAnalyst = demandAnalysts.some((analyst) => selectedAnalysts.includes(analyst));
      if (!matchesUnassigned && !matchesAnalyst) return false;
    }
    if (selectedTypes.length && !selectedTypes.includes(demandTypeKey(demand.tipo))) return false;
    if (operationalFilters.validationGroup && !demandValidationColumnIds.includes(demand.coluna)) return false;
    if (selectedStatuses.length && !selectedStatuses.includes(demand.coluna)) return false;
    if (selectedEngineeringMeeting.length && !isEngineeringMeetingSic(demand)) return false;
    if (selectedPunctualities.length) {
      const punctuality =
        demand.coluna === "pausado" || !plannedDelivery
          ? "noDeadline"
          : isDemandLate(demand)
            ? "late"
            : "onTime";
      if (!selectedPunctualities.includes(punctuality)) return false;
    }
    return true;
  }).sort(compareOperationalDemandsByDelivery);
}

function compareOperationalDemandsByDelivery(first, second) {
  const engineeringMeetingComparison = Number(isEngineeringMeetingSic(second)) - Number(isEngineeringMeetingSic(first));
  if (engineeringMeetingComparison) return engineeringMeetingComparison;
  const firstDate = dateOnly(first?.dataPrevistaEntrega) || "9999-12-31";
  const secondDate = dateOnly(second?.dataPrevistaEntrega) || "9999-12-31";
  const dateComparison = firstDate.localeCompare(secondDate);
  if (dateComparison) return dateComparison;
  return String(first?.id || "").localeCompare(String(second?.id || ""), "pt-BR", { numeric: true });
}

function operationalDemandCreationTimestamp(demand) {
  const raw = demand?.createdAt || demand?.dataCriacao || demand?.dataPrevistaInicio || "";
  const instant = raw ? new Date(raw).getTime() : Number.NaN;
  return Number.isFinite(instant) ? instant : Number.MAX_SAFE_INTEGER;
}

function compareKanbanColumnDemands(first, second, columnId) {
  if (!["concluido", "cancelado"].includes(columnId)) {
    const engineeringMeetingComparison = Number(isEngineeringMeetingSic(second)) - Number(isEngineeringMeetingSic(first));
    if (engineeringMeetingComparison) return engineeringMeetingComparison;
  }
  if (columnId === "pullPlanning") {
    const firstStart = dateOnly(first?.dataPrevistaInicio) || "9999-12-31";
    const secondStart = dateOnly(second?.dataPrevistaInicio) || "9999-12-31";
    const startComparison = firstStart.localeCompare(secondStart);
    if (startComparison) return startComparison;
  } else if (columnId === "concluido") {
    const firstCompleted = dateOnly(first?.dataEntregaReal) || "";
    const secondCompleted = dateOnly(second?.dataEntregaReal) || "";
    if (firstCompleted || secondCompleted) {
      if (!firstCompleted) return 1;
      if (!secondCompleted) return -1;
      const completedComparison = secondCompleted.localeCompare(firstCompleted);
      if (completedComparison) return completedComparison;
    }
  } else {
    const firstMarker = dateOnly(demandCardDateInfo(first)?.date) || "9999-12-31";
    const secondMarker = dateOnly(demandCardDateInfo(second)?.date) || "9999-12-31";
    const markerComparison = firstMarker.localeCompare(secondMarker);
    if (markerComparison) return markerComparison;
  }
  const creationComparison = operationalDemandCreationTimestamp(first) - operationalDemandCreationTimestamp(second);
  if (creationComparison) return creationComparison;
  return String(first?.id || "").localeCompare(String(second?.id || ""), "pt-BR", { numeric: true });
}

function sortKanbanColumnDemands(demands, columnId) {
  return [...demands].sort((first, second) => compareKanbanColumnDemands(first, second, columnId));
}

function operationalFilterValues(key) {
  const value = operationalFilters[key];
  if (Array.isArray(value)) return value.map((item) => String(item || "")).filter(Boolean);
  return value ? [String(value)] : [];
}

function renderOperationalMultiFilter(key, label, options, emptyLabel) {
  const selected = operationalFilterValues(key);
  const selectedSet = new Set(selected);
  const selectedLabels = options.filter((option) => selectedSet.has(option.value)).map((option) => option.label);
  const summary = !selectedLabels.length
    ? emptyLabel
    : selectedLabels.length === 1
      ? selectedLabels[0]
      : `${selectedLabels[0]} +${selectedLabels.length - 1}`;
  return `
    <details class="operational-multiselect" data-operational-filter-group="${key}">
      <summary title="${escapeAttribute(selectedLabels.join(", ") || emptyLabel)}">
        <span>${label}</span>
        <strong>${escapeAttribute(summary)}</strong>
      </summary>
      <div class="operational-multiselect-menu" role="group" aria-label="${label}">
        ${options.map((option) => `
          <label>
            <input type="checkbox" data-operational-filter="${key}" value="${escapeAttribute(option.value)}" ${selectedSet.has(option.value) ? "checked" : ""} />
            <span>${escapeAttribute(option.label)}</span>
          </label>
        `).join("")}
      </div>
    </details>
  `;
}

function renderOperationalFilters() {
  return `
    <section class="panel filter-panel">
      <label class="field">
        <span>Buscar demanda</span>
        <input data-operational-search value="${escapeAttribute(operationalFilters.query)}" placeholder="Buscar por cÃ³digo, obra ou descriÃ§Ã£o..." />
      </label>
      <div class="filter-grid">
        ${renderOperationalMultiFilter("sprintId", "Sprint", [
          { value: unassignedSprintFilterValue, label: "Sem sprint" },
          ...(state.sprints || []).map((sprint) => ({ value: sprint.id, label: sprint.nome })),
        ], "Todas")}
        ${renderOperationalMultiFilter("analyst", "Analista", [
          { value: unassignedAnalystFilterValue, label: "Sem analista" },
          ...uniqueAnalysts().map((analyst) => ({ value: analyst, label: analyst })),
        ], "Todos")}
        ${renderOperationalMultiFilter("type", "Tipo de atividade", workDemandTypeDefinitions.map((type) => ({ value: type.id, label: type.label })), "Todas")}
        ${renderOperationalMultiFilter("status", "Status", columns.map((column) => ({ value: column.id, label: column.label })), "Todos")}
        ${renderOperationalMultiFilter("engineeringMeeting", "Cobrado em reuniÃ£o", [
          { value: "flagged", label: "Somente cobradas" },
        ], "Todas as SICs")}
        ${renderOperationalMultiFilter("punctuality", "Prazo", [
          { value: "late", label: "Atrasadas" },
          { value: "onTime", label: "No prazo" },
          { value: "noDeadline", label: "Sem prazo" },
        ], "Todos")}
        <label class="field operational-date-filter">
          <span>Entrega prevista de</span>
          <input type="date" data-operational-date-filter="dateFrom" value="${escapeAttribute(operationalFilters.dateFrom || "")}" />
        </label>
        <label class="field operational-date-filter">
          <span>Entrega prevista atÃ©</span>
          <input type="date" data-operational-date-filter="dateTo" value="${escapeAttribute(operationalFilters.dateTo || "")}" />
        </label>
      </div>
      <p class="muted operational-export-hint">Esta visÃ£o considera exatamente os filtros aplicados nos dados e indicadores exibidos.</p>
      <div class="operational-filter-actions">
        <button class="secondary-action" type="button" data-action="clear-operational-filters">Limpar filtros</button>
      </div>
    </section>
  `;
}

function renderOperationalFilterBanner() {
  const active = operationalActiveFilterText();
  if (!active) return "";
  return `
    <div class="active-filter-banner">
      <span>${active}</span>
      <button class="secondary-action" type="button" data-action="clear-operational-filters">Remover filtro</button>
    </div>
  `;
}

function renderKanbanBoard(filtered) {
  return `
    ${renderKanbanTopScrollbar()}
    <div class="kanban-board" data-kanban-scroll-board style="--kanban-column-count: ${columns.length}">
      ${columns
        .map((column) => {
          const demands = sortKanbanColumnDemands(filtered.filter((demand) => demand.coluna === column.id), column.id);
          const sortTitle = column.id === "pullPlanning"
            ? "Reordenar pela previsÃ£o de inÃ­cio, da mais prÃ³xima para a mais distante; sem previsÃ£o ao final"
            : column.id === "concluido"
              ? "Reordenar por conclusÃ£o real, da mais recente para a mais antiga"
              : "Reordenar pelo marco exibido no card; em empate, priorizar o card criado primeiro";
          return `
            <section class="kanban-column" data-column="${column.id}">
              <header>
                <h2>${column.label}</h2>
                <div class="kanban-column-header-meta">
                  <span class="kanban-count" aria-label="${demands.length} demandas">${demands.length}</span>
                  <button class="kanban-sort-button" type="button" data-action="reorder-kanban-column" data-column="${column.id}" aria-label="Reordenar cards" title="${escapeAttribute(sortTitle)}">â‡…</button>
                </div>
              </header>
              <div class="demand-list">
                ${demands.length ? demands.map(renderDemandCard).join("") : `<div class="empty-state kanban-empty">Nenhuma demanda</div>`}
              </div>
            </section>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderOperationalList(filtered) {
  if (!filtered.length) return `<div class="empty-state">Nenhuma demanda encontrada no filtro atual.</div>`;
  return `
    <div class="table-wrap">
      <table class="data-table operational-list-table">
        <thead>
          <tr>
            <th>CÃ³digo</th>
            <th>Obra</th>
            <th>Tipo</th>
            <th>Analista</th>
            <th>Sprint</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th>ReuniÃ£o Eng.</th>
            <th class="numeric">Valor da demanda</th>
            <th>Prazo</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(renderOperationalListRow).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderOperationalListRow(demand) {
  const work = workById(demand.obraId);
  const workLabel = work ? workDisplayLabel(work) : "Obra nÃ£o localizada";
  const isSic = demandTypeKey(demand.tipo) === "SIC";
  const approval = isSic ? sicApprovalReading(demand) : null;
  const value = demandRecordedValue(demand);
  return `
    <tr data-action="open-demand-detail" data-id="${demand.id}" role="button" tabindex="0">
      <td><strong>${demand.id}</strong></td>
      <td><strong>${escapeAttribute(workLabel)}</strong></td>
      <td>
        ${demandTypeLabel(demand.tipo)}
        ${
          approval
            ? `<button class="sic-approval-list-link" type="button" data-action="open-sic-approval" data-id="${demand.id}">
                ${approval.label}
              </button>`
            : ""
        }
      </td>
      <td>${demand.analistaResponsavel || "â€”"}</td>
      <td>${demandSprintIds(demand).length ? escapeAttribute(demandSprintNames(demand, " | ")) : "â€”"}</td>
      <td><span class="status-dot" data-status="${demand.coluna}"></span>${demandStatusLabel(demand)}</td>
      <td><span class="tag">${demand.prioridade}</span></td>
      <td>${isEngineeringMeetingSic(demand) ? '<span class="sic-engineering-meeting-flag">Cobrar</span>' : "â€”"}</td>
      <td class="numeric">${demandHasRecordedValue(demand) ? money(value) : "â€”"}</td>
      <td>${demand.coluna === "pausado" ? dateText(demand.dataPrevistaEntrega) : isDemandLate(demand) ? `<span class="status-pill" data-status="Atrasada">Atrasada</span>` : dateText(demand.dataPrevistaEntrega)}</td>
    </tr>
  `;
}

function renderDemandCard(demand) {
  const isPullPlanning = demand.coluna === "pullPlanning";
  const work = workById(demand.obraId);
  const workLabel = work ? workDisplayLabel(work) : "Obra nÃ£o localizada";
  const description = String(demand.observacao || demand.sicMetadata?.descricaoSic || "").trim();
  const sprintIds = demandSprintIds(demand);
  const sprintFlags = sprintIds.length
    ? sprintIds.map((sprintId) => {
        const sprintName = sprintById(sprintId)?.nome || sprintId;
        return `<span class="sprint-flag" title="${escapeAttribute(sprintName)}">${escapeAttribute(sprintFlagLabel(sprintName))}</span>`;
      }).join("")
    : '<span class="sprint-flag" title="Sem sprint">S/N</span>';
  const timing = demandTimingInfo(demand);
  const cardDateLabels = demandCardDateLabels(demand, timing.dateLabel);
  const stageTime = demandStageTimeInfo(demand);
  const complementCount = (demand.analistasComplementares || []).length;
  const isSic = demandTypeKey(demand.tipo) === "SIC";
  const sicInfo = isSic ? demandSicInfo(demand) : null;
  const sicTitle = String(sicInfo?.tituloSic || "").trim();
  const lecomNumber = sicInfo?.lecomNumber || "";
  const serviceExecuted = isSic ? sicWorksServiceExecuted(demand) : null;
  const approval = isSic ? sicApprovalReading(demand) : null;
  const value = demandRecordedValue(demand);
  const timingAlert = isPullPlanning || demand.coluna === "pausado"
    ? ""
    : '<div class="demand-card-alert" data-tone="' + escapeAttribute(timing.tone) + '"><i></i><strong>' + escapeAttribute(timing.label) + '</strong></div>';
  return `
    <article class="demand-card ${isSic ? "is-sic" : ""} ${isEngineeringMeetingSic(demand) ? "is-engineering-meeting" : ""}" data-status="${demand.coluna}" data-action="open-demand-detail" data-id="${demand.id}" role="button" tabindex="0">
      <div class="demand-card-top">
        <div class="demand-card-id">
          <span class="demand-type-badge" data-type="${escapeAttribute(demandTypeKey(demand.tipo))}" title="${escapeAttribute(demandTypeLabel(demand.tipo))}">${escapeAttribute(demandTypeCardLabel(demand.tipo))}</span>
        </div>
        <div class="demand-card-actions">
          ${sprintFlags}
          <span class="priority-pill">${demand.prioridade || "MÃ©dia"}</span>
          <span class="demand-drag-handle" data-demand-drag-handle title="Arrastar card" aria-hidden="true">â ¿</span>
        </div>
      </div>
      <h3>${escapeAttribute(workLabel)}</h3>
      ${description && !isSic ? `<p class="demand-card-description" title="${escapeAttribute(description)}">${escapeAttribute(description)}</p>` : ""}
      ${isSic && sicTitle && sicTitle !== "â€”" ? `<p class="sic-card-title" title="${escapeAttribute(sicTitle)}">${escapeAttribute(sicTitle)}</p>` : ""}
      ${isSic ? `<div class="sic-card-lecom"><span>Lecon</span><strong>${escapeAttribute(lecomNumber && lecomNumber !== "â€”" ? lecomNumber : "NÃ£o informado")}</strong></div>` : ""}
      ${serviceExecuted === null ? "" : `<span class="sic-service-execution-badge" data-executed="${serviceExecuted}">${serviceExecuted ? "ServiÃ§o executado" : "ServiÃ§o nÃ£o executado"}</span>`}
      ${isEngineeringMeetingSic(demand) ? '<span class="sic-engineering-meeting-flag">Cobrado em reuniÃ£o</span>' : ""}
      ${renderDemandCardLabels(demand.etiquetas)}
      ${
        !isPullPlanning && approval && approval.status !== "Pendente"
          ? `<div class="sic-card-sync">
              <span class="sic-approval-badge" data-status="${approval.dataStatus}">${approval.label}</span>
            </div>`
          : ""
      }
      ${demand.unidadeModo === "existente" ? `<div class="demand-card-unit-badge">Unidade existente Â· ${escapeAttribute(demand.unidadeNome || "cadastro mestre")}</div>` : ""}
      <div class="demand-card-meta">
        <span>${demand.analistaResponsavel || "Analista a definir"}</span>
        ${complementCount ? `<b>+${complementCount}</b>` : ""}
      </div>
      ${isPullPlanning || ["concluido", "cancelado"].includes(demand.coluna) ? "" : `
      <div class="demand-card-stage-time" title="${stageTime.closed ? `Contagem encerrada em ${escapeAttribute(stageTime.endedLabel)}` : `Desde ${escapeAttribute(stageTime.startedLabel)}`}${stageTime.estimated ? " Â· referÃªncia estimada para demanda antiga" : ""}">
        <span>Tempo na etapa:</span>
        <span class="demand-card-stage-duration">${stageTime.durationLabel}</span>
      </div>
      `}
      ${cardDateLabels.map((label) => `<span class="demand-card-date">${escapeAttribute(label)}</span>`).join("")}
      ${timingAlert}
      ${
        demandHasRecordedValue(demand) && (demand.coluna === "concluido" || (isSic && ["validadoObras", "aprovacaoDiretoria", "aprovadoDiretoria"].includes(demand.coluna)))
          ? `<div class="demand-card-value"><span>${demand.coluna === "aprovadoDiretoria" ? "Valor aprovado pela Diretoria" : demand.coluna === "concluido" ? "Valor da demanda" : "Valor validado por Obras"}</span><strong>${money(value)}</strong></div>`
          : ""
      }
    </article>
  `;
}

function demandCardDateLabels(demand, fallbackLabel) {
  const dateLabel = (label, value) => `${label}: ${dateText(dateOnly(value))}`;
  const deliveryLabel = dateLabel("Entrega prevista", demand.dataPrevistaEntrega);
  if (demand.coluna === "pullPlanning") {
    return [
      dateLabel("InÃ­cio previsto", demand.dataPrevistaInicio),
      dateLabel("TÃ©rmino previsto", demand.dataPrevistaEntrega),
    ];
  }
  if (["fazer", "fazendo"].includes(demand.coluna)) {
    const validationDate = dateOnly(demand.dataPrevEnvioValidacaoObras);
    return validationDate && validationDate >= todayISO()
      ? [dateLabel("Envio p/ validaÃ§Ã£o", validationDate), deliveryLabel]
      : [deliveryLabel];
  }
  if (demand.coluna === "validacaoObras") {
    return [dateLabel("Envio p/ validaÃ§Ã£o", demand.dataEnvioRealValidacaoObras), deliveryLabel];
  }
  if (demand.coluna === "validadoObras") {
    return [dateLabel("ValidaÃ§Ã£o Obras", demand.dataValidacaoObras), deliveryLabel];
  }
  return [fallbackLabel];
}

function renderDemandCardLabels(labels = []) {
  const normalized = normalizeDemandLabels(labels);
  if (!normalized.length) return "";
  return `<div class="demand-card-labels" aria-label="Etiquetas do card">${normalized
    .map((label) => `<span>${escapeAttribute(label)}</span>`)
    .join("")}</div>`;
}

function renderDemandLabelsField(labels = []) {
  return `
    <label class="field full-span demand-labels-field">
      <span>Etiquetas do card</span>
      <input name="etiquetas" value="${escapeAttribute(normalizeDemandLabels(labels).join(", "))}" placeholder="Ex.: Urgente, Diretoria, Fornecedor" maxlength="200" />
      <small class="muted">Separe por vÃ­rgulas. AtÃ© 6 etiquetas serÃ£o exibidas dentro do card.</small>
    </label>
  `;
}

function demandStageInstant(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00-03:00` : text;
  const instant = new Date(normalized);
  return Number.isNaN(instant.getTime()) ? null : instant;
}

function formatDemandStageDuration(startedAt, endedAt = new Date()) {
  const elapsedDays = Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 86400000));
  if (elapsedDays < 1) return "menos de 1 dia";
  return `${elapsedDays} ${elapsedDays === 1 ? "dia" : "dias"}`;
}

function demandStageTimeInfo(demand) {
  const currentStage = columnById(demand?.coluna);
  const closed = ["concluido", "cancelado"].includes(currentStage?.id || demand?.coluna);
  const stageKey = normalizeSearchText(currentStage?.label || demand?.coluna || "");
  const histories = arrayOrFallback(state.history)
    .filter((item) => {
      if (item.entidadeId !== demand?.id || normalizeSearchText(item.entidade) !== "demanda") return false;
      if (normalizeSearchText(item.campo) !== "coluna") return false;
      return !stageKey || normalizeSearchText(item.valorNovo) === stageKey;
    })
    .map((item) => demandStageInstant(item.timestamp))
    .filter(Boolean)
    .sort((left, right) => right.getTime() - left.getTime());
  const creationHistory = arrayOrFallback(state.history)
    .filter((item) => item.entidadeId === demand?.id && normalizeSearchText(item.entidade) === "demanda" && normalizeSearchText(item.campo) === "criacao")
    .map((item) => demandStageInstant(item.timestamp))
    .filter(Boolean)
    .sort((left, right) => right.getTime() - left.getTime());
  const explicit = demandStageInstant(demand?.phaseStartedAt);
  const explicitIsEstimated = Boolean(demand?.phaseStartedAtEstimated);
  const historyInstant = histories[0] || null;
  const creationInstant = creationHistory[0] || demandStageInstant(demand?.createdAt);
  const startedAt = (explicit && !explicitIsEstimated ? explicit : null)
    || historyInstant
    || creationInstant
    || explicit
    || demandStageInstant(todayISO());
  const storedEndedAt = demandStageInstant(demand?.phaseEndedAt);
  const legacyEndedAt = historyInstant
    || demandStageInstant(demand?.updatedAt)
    || demandStageInstant(demand?.dataEntregaReal)
    || startedAt;
  const endedAt = closed
    ? new Date(Math.max(startedAt.getTime(), (storedEndedAt || legacyEndedAt).getTime()))
    : new Date();
  const estimated = explicit && !explicitIsEstimated ? false : !historyInstant;
  return {
    stageId: currentStage?.id || demand?.coluna || "",
    stageLabel: currentStage?.label || demand?.coluna || "Sem etapa",
    startedAt,
    endedAt,
    closed,
    durationLabel: formatDemandStageDuration(startedAt, endedAt),
    startedLabel: new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(startedAt),
    endedLabel: new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(endedAt),
    estimated,
  };
}

function demandStageId(value) {
  const key = normalizeSearchText(value);
  return columns.find((column) => normalizeSearchText(column.id) === key || normalizeSearchText(column.label) === key)?.id || "";
}

function demandDerivedClosedStagePeriods(demand) {
  const changes = arrayOrFallback(state.history)
    .filter((item) => item.entidadeId === demand?.id && normalizeSearchText(item.entidade) === "demanda" && normalizeSearchText(item.campo) === "coluna")
    .map((item) => ({ ...item, instant: demandStageInstant(item.timestamp) }))
    .filter((item) => item.instant)
    .sort((left, right) => left.instant.getTime() - right.instant.getTime());
  if (!changes.length) return [];
  const creationInstant = arrayOrFallback(state.history)
    .filter((item) => item.entidadeId === demand?.id && normalizeSearchText(item.entidade) === "demanda" && normalizeSearchText(item.campo) === "criacao")
    .map((item) => demandStageInstant(item.timestamp))
    .filter(Boolean)
    .sort((left, right) => left.getTime() - right.getTime())[0]
    || demandStageInstant(demand?.createdAt);
  const periods = [];
  let stageId = demandStageId(changes[0].valorAnterior);
  let startedAt = creationInstant;
  changes.forEach((change) => {
    if (stageId && startedAt && change.instant >= startedAt) {
      periods.push({
        stageId,
        stageLabel: columnById(stageId)?.label || change.valorAnterior || stageId,
        startedAt: startedAt.toISOString(),
        endedAt: change.instant.toISOString(),
        estimated: true,
      });
    }
    stageId = demandStageId(change.valorNovo);
    startedAt = change.instant;
  });
  return periods;
}

function demandStagePeriods(demand) {
  const stored = arrayOrFallback(demand?.phaseHistory)
    .map((period) => {
      const startedAt = demandStageInstant(period.startedAt);
      const endedAt = demandStageInstant(period.endedAt);
      const stageId = demandStageId(period.stageId || period.stageLabel);
      if (!startedAt || !endedAt || !stageId) return null;
      return {
        stageId,
        stageLabel: columnById(stageId)?.label || period.stageLabel || stageId,
        startedAt,
        endedAt,
        estimated: Boolean(period.estimated),
        current: false,
      };
    })
    .filter(Boolean);
  const closed = stored.length
    ? stored
    : demandDerivedClosedStagePeriods(demand).map((period) => ({
        ...period,
        startedAt: demandStageInstant(period.startedAt),
        endedAt: demandStageInstant(period.endedAt),
      }));
  const current = demandStageTimeInfo(demand);
  return [
    ...closed,
    {
      stageId: current.stageId,
      stageLabel: current.stageLabel,
      startedAt: current.startedAt,
      endedAt: current.endedAt,
      estimated: current.estimated,
      current: true,
      closed: current.closed,
    },
  ].filter((period) => period.startedAt && period.endedAt && period.stageId);
}

function demandStageMomentLabel(instant) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(instant);
}

function renderDemandStagePeriods(demand) {
  const periods = demandStagePeriods(demand);
  return `
    <div class="demand-stage-history" aria-label="HistÃ³rico de tempo por etapa">
      ${periods.map((period) => `
        <article class="demand-stage-period ${period.current ? "is-current" : ""}">
          <div>
            <strong>${escapeAttribute(period.stageLabel)}</strong>
            <small>${demandStageMomentLabel(period.startedAt)} â†’ ${period.current && !period.closed ? "agora" : demandStageMomentLabel(period.endedAt)}${period.estimated ? " Â· horÃ¡rio estimado" : ""}</small>
          </div>
          <span>${formatDemandStageDuration(period.startedAt, period.endedAt)}</span>
        </article>
      `).join("")}
    </div>
  `;
}

function demandCardDateInfo(demand) {
  const validationSent = Boolean(
    demand.dataEnvioRealValidacaoObras
    || demand.dataValidacaoObras
    || ["validacaoObras", "validadoObras", "aprovacaoDiretoria", "aprovadoDiretoria", "concluido"].includes(demand.coluna),
  );
  const validationDate = dateOnly(demand.dataPrevEnvioValidacaoObras);
  const validationDeadlineStillActive = Boolean(validationDate && validationDate >= todayISO());
  if (!validationSent && validationDeadlineStillActive) {
    return {
      date: validationDate,
      dateLabel: `Envio p/ validaÃ§Ã£o: ${dateText(validationDate)}`,
      isValidation: true,
    };
  }
  return {
    date: demand.dataPrevistaEntrega || "",
    dateLabel: demand.dataPrevistaEntrega ? `Entrega prevista: ${dateText(demand.dataPrevistaEntrega)}` : "Sem data prevista",
    isValidation: false,
  };
}

function demandTimingInfo(demand) {
  if (demand.coluna === "cancelado") {
    return { tone: "gray", label: "Cancelada", dateLabel: "Sem entrega ativa" };
  }
  if (demand.coluna === "concluido") {
    return {
      tone: "green",
      label: demandDeliveryDelay(demand) > 0 ? `ConcluÃ­da com ${demandDeliveryDelay(demand)} d de atraso` : "Entregue no prazo",
      dateLabel: demand.dataEntregaReal ? `Entrega real: ${dateText(demand.dataEntregaReal)}` : "ConcluÃ­da",
    };
  }
  const activeDate = demandCardDateInfo(demand);
  if (isDemandLate(demand)) {
    const lateDays = daysBetween(demand.dataPrevistaEntrega, todayISO());
    return {
      tone: "red",
      label: `Atrasada hÃ¡ ${lateDays} dia${lateDays === 1 ? "" : "s"}`,
      dateLabel: activeDate.dateLabel,
    };
  }
  const daysToActiveDate = activeDate.date ? daysBetween(todayISO(), activeDate.date) : Number.POSITIVE_INFINITY;
  if (daysToActiveDate >= 0 && daysToActiveDate <= 1) {
    return {
      tone: "orange",
      label: activeDate.isValidation ? "PrÃ³ximo do envio p/ validaÃ§Ã£o" : "PrÃ³ximo da entrega",
      dateLabel: activeDate.dateLabel,
    };
  }
  return {
    tone: "green",
    label: "Em dia",
    dateLabel: activeDate.dateLabel,
  };
}

function completedDemands() {
  return state.demands.filter((demand) => demand.coluna === "concluido");
}

function currentSprint() {
  const sprints = Array.isArray(state.sprints) ? state.sprints : [];
  return sprints.find((sprint) => sprint.status === "Ativa") || null;
}

function sprintById(id) {
  return (state.sprints || []).find((sprint) => sprint.id === id);
}

function demandSprintIds(demand = {}) {
  const stored = Array.isArray(demand?.sprintIds) ? demand.sprintIds : [];
  const legacy = String(demand?.sprintId || "").trim();
  return [...new Set([...stored, legacy].map((id) => String(id || "").trim()).filter(Boolean))];
}

function normalizeSelectedSprintIds(values = []) {
  const selected = [...new Set((Array.isArray(values) ? values : [values]).map((id) => String(id || "").trim()).filter(Boolean))];
  const position = new Map((state.sprints || []).map((sprint, index) => [String(sprint.id), { sprint, index }]));
  return selected.sort((leftId, rightId) => {
    const left = position.get(leftId);
    const right = position.get(rightId);
    if (!left && !right) return selected.indexOf(leftId) - selected.indexOf(rightId);
    if (!left) return 1;
    if (!right) return -1;
    const leftDate = dateOnly(left.sprint.dataInicio) || dateOnly(left.sprint.dataFim) || "9999-12-31";
    const rightDate = dateOnly(right.sprint.dataInicio) || dateOnly(right.sprint.dataFim) || "9999-12-31";
    return leftDate.localeCompare(rightDate) || left.index - right.index;
  });
}

function demandPrimarySprint(demand) {
  const ids = demandSprintIds(demand);
  return ids.length ? sprintById(ids.at(-1)) : null;
}

function demandSprintNames(demand, separator = " Â· ") {
  const ids = demandSprintIds(demand);
  if (!ids.length) return "Sem sprint";
  return ids.map((id) => sprintById(id)?.nome || id).join(separator);
}

function demandSprintPeriodText(value) {
  const ids = Array.isArray(value) ? value : demandSprintIds(value);
  const periods = ids.map((id) => sprintById(id)).filter(Boolean);
  if (!periods.length) return "Sem perÃ­odo vinculado";
  return periods
    .map((sprint) => `${sprint.nome}: ${dateText(sprint.dataInicio)} â†’ ${dateText(sprint.dataFim)}`)
    .join(" Â· ");
}

function sprintIdsFromFormData(formData) {
  return normalizeSelectedSprintIds(formData.getAll("sprintId"));
}

// Sugere todas as sprints cujo perÃ­odo se sobrepÃµe ao planejamento.
// A sugestÃ£o nÃ£o altera demandas jÃ¡ cadastradas e pode ser editada pelo usuÃ¡rio.
function refreshSprintPicker(form) {
  const picker = form?.querySelector(".sprint-picker");
  if (!picker) return;
  const checked = [...picker.querySelectorAll('input[name="sprintId"]:checked')];
  const names = checked.map((input) => sprintById(input.value)?.nome || input.value);
  const label = picker.querySelector(".sprint-picker-value");
  const count = picker.querySelector(".sprint-picker-count");
  if (label) label.textContent = names.join(", ") || "Selecionar sprints";
  if (count) count.textContent = checked.length ? checked.length + " selecionada(s)" : "Nenhuma selecionada";
}

function suggestedDemandSprintIds(startValue, endValue) {
  const start = dateOnly(startValue);
  const end = dateOnly(endValue);
  if (!start && !end) return [];
  const from = start && end ? (start < end ? start : end) : start || end;
  const to = start && end ? (start > end ? start : end) : start || end;
  return normalizeSelectedSprintIds((state.sprints || []).filter((sprint) => {
    const begin = dateOnly(sprint.dataInicio);
    const finish = dateOnly(sprint.dataFim);
    return begin && finish && begin <= to && finish >= from;
  }).map((sprint) => sprint.id));
}

function suggestSprintsInDemandForm(form, startValue, endValue) {
  const options = form?.querySelectorAll('.sprint-checkbox-list input[name="sprintId"]');
  if (!options?.length) return;
  const suggested = suggestedDemandSprintIds(startValue, endValue);
  if (!suggested.length) return; // Nenhuma data correspondente: manter seleÃ§Ã£o manual.
  options.forEach((option) => {
    option.checked = suggested.includes(option.value);
  });
  refreshSprintPicker(form);
  const hint = form.querySelector("[data-sprint-auto-hint]");
  if (hint) hint.textContent = "SugestÃ£o pelas datas: " + demandSprintPeriodText(suggested) + ". VocÃª pode ajustar a seleÃ§Ã£o.";
}

function sprintByReference(value, sprints) {
  const text = String(value || "").trim();
  if (!text) return null;
  let availableSprints = Array.isArray(sprints) ? sprints : [];
  if (!Array.isArray(sprints)) {
    try {
      availableSprints = state.sprints || [];
    } catch (error) {
      availableSprints = [];
    }
  }
  const normalized = normalizeSearchText(text);
  const flag = normalizeSearchText(sprintFlagLabel(text));
  return availableSprints.find((sprint) => {
    const sprintName = normalizeSearchText(sprint.nome || "");
    const sprintId = normalizeSearchText(sprint.id || "");
    const sprintFlag = normalizeSearchText(sprintFlagLabel(sprint.nome || sprint.id));
    return sprint.id === text || sprintId === normalized || sprintName === normalized || sprintFlag === flag;
  });
}

function maintenanceSprint(item) {
  return sprintByReference(item?.sprintId) || sprintByReference(item?.sprint);
}

function maintenanceSprintId(item) {
  return maintenanceSprint(item)?.id || "";
}

function maintenanceSprintName(item) {
  return maintenanceSprint(item)?.nome || item?.sprint || "Sem sprint";
}

function sprintFlagLabel(value) {
  const text = String(value || "").trim();
  if (!text) return "S/N";
  const match = text.match(/(?:sprint|s)\D*(\d+)/i) || text.match(/(\d+)/);
  if (match) return `S${match[1]}`;
  return text.replace(/^sprint\s*/i, "").trim().slice(0, 5).toUpperCase() || "S/N";
}

function columnById(id) {
  return columns.find((column) => column.id === id);
}

function demandStatusLabel(demand) {
  return columnById(demand.coluna)?.label || demand.coluna || "Sem status";
}

function isEngineeringMeetingSic(demand) {
  return demandTypeKey(demand?.tipo) === "SIC" && demand?.sicEngineeringMeeting === true;
}

function isDemandLate(demand) {
  return (
    !["concluido", "cancelado", "pausado"].includes(demand.coluna) &&
    demand.dataPrevistaEntrega &&
    demand.dataPrevistaEntrega < todayISO()
  );
}

function resetOperationalFilters() {
  operationalFilters = {
    query: "",
    sprintId: [],
    analyst: [],
    type: [],
    status: [],
    validationGroup: false,
    engineeringMeeting: [],
    punctuality: [],
    dateFrom: "",
    dateTo: "",
  };
}

function resetProjectPlanFilters() {
  projectPlanFilters = {
    query: "",
    etapa: "",
    status: "",
    regiao: "",
    dateFrom: "",
    dateTo: "",
  };
}

function resetProjectOperationalFilters() {
  projectOperationalFilters = {
    query: "",
    status: "",
    regiao: "",
    type: "",
    punctuality: "",
  };
}

function operationalActiveFilterText() {
  const active = [];
  if (operationalFilters.query) active.push(`busca "${operationalFilters.query}"`);
  const sprints = operationalFilterValues("sprintId");
  const analysts = operationalFilterValues("analyst");
  const types = operationalFilterValues("type");
  const statuses = operationalFilterValues("status");
  const engineeringMeeting = operationalFilterValues("engineeringMeeting");
  const punctualities = operationalFilterValues("punctuality");
  if (sprints.length) active.push(sprints.map((id) => sprintById(id)?.nome || "sprint selecionada").join(", "));
  if (analysts.length) active.push(`analistas ${analysts.map((analyst) => analyst === unassignedAnalystFilterValue ? "Sem analista" : analyst).join(", ")}`);
  if (types.length) active.push(types.map(demandTypeLabel).join(", "));
  if (operationalFilters.validationGroup) active.push("validaÃ§Ã£o Obras e Diretoria");
  if (statuses.length) active.push(statuses.map((status) => columnById(status)?.label || status).join(", "));
  if (engineeringMeeting.length) active.push("SICs cobradas em reuniÃ£o");
  if (punctualities.length) active.push(punctualities.map((value) => value === "late" ? "atrasadas" : value === "noDeadline" ? "sem prazo" : "no prazo").join(", "));
  if (operationalFilters.dateFrom || operationalFilters.dateTo) {
    const from = operationalFilters.dateFrom ? dateText(operationalFilters.dateFrom) : "inÃ­cio";
    const to = operationalFilters.dateTo ? dateText(operationalFilters.dateTo) : "sem limite";
    active.push(`entrega prevista ${from} a ${to}`);
  }
  return active.length ? `Filtrando por: ${active.join(" | ")}` : "";
}

function applyOperationalKpiFilter(key) {
  const map = {
    opTotal: {},
    activeDemands: {},
    opPullPlanning: { status: "pullPlanning" },
    opFazer: { status: "fazer" },
    opFazendo: { status: "fazendo" },
    opPausado: { status: "pausado" },
    opValidacao: { validationGroup: true },
    opConcluido: { status: "concluido" },
    completedDemands: { status: "concluido" },
    opCancelado: { status: "cancelado" },
    overdueDemands: { punctuality: "late" },
    opAtrasadas: { punctuality: "late" },
    opEngineeringMeeting: { engineeringMeeting: true },
  };
  const filter = map[key];
  if (!filter) return;
  operationalFilters.status = filter.status ? [filter.status] : [];
  operationalFilters.validationGroup = Boolean(filter.validationGroup);
  operationalFilters.engineeringMeeting = filter.engineeringMeeting ? ["flagged"] : [];
  operationalFilters.punctuality = filter.punctuality ? [filter.punctuality] : [];
  operationalViewMode = "list";
  closeModal();
  setView("worksOperational");
}

function uniqueAnalysts() {
  return configuredAnalystNames();
}

function daysBetween(start, end) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.round((endDate - startDate) / 86400000);
}

function criticalDemandItems() {
  const critical = state.demands
    .filter((demand) => {
      const isLate =
        !["concluido", "cancelado"].includes(demand.coluna) &&
        demand.dataPrevistaEntrega &&
        demand.dataPrevistaEntrega < todayISO();
      return isLate || demandValidationColumnIds.includes(demand.coluna);
    })
    .slice(0, 5);

  return critical.map((demand) => {
    const work = workById(demand.obraId);
    const lateDays =
      demand.dataPrevistaEntrega && demand.dataPrevistaEntrega < todayISO()
        ? daysBetween(demand.dataPrevistaEntrega, todayISO())
        : 0;
    const column = columns.find((item) => item.id === demand.coluna)?.label || demand.coluna;
    const statusText = lateDays > 0 ? `Atrasada hÃ¡ ${lateDays} dia${lateDays === 1 ? "" : "s"}` : column;
    return alertItem(
      `${work?.nome || "Obra nÃ£o localizada"} | ${demand.id}`,
      `${demand.analistaResponsavel} | ${column} | ${statusText}`
    );
  });
}

function activeLoadByWork() {
  return state.works
    .map((work) => ({
      label: work.nome,
      valor: pendingDemands().filter((demand) => demand.obraId === work.id).length,
    }))
    .filter((item) => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}

function analystLoad(includeCompleted = true) {
  const map = new Map();
  state.demands
    .filter((demand) => includeCompleted || !["concluido", "cancelado"].includes(demand.coluna))
    .forEach((demand) => {
      [demand.analistaResponsavel, ...(demand.analistasComplementares || [])]
        .filter(Boolean)
        .forEach((analyst) => map.set(analyst, (map.get(analyst) || 0) + 1));
    });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function workCountBy(field) {
  const map = new Map();
  budgetWorks().forEach((work) => {
    const label = work[field] || "NÃ£o informado";
    map.set(label, (map.get(label) || 0) + 1);
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function workCountByForDemands(demands, field) {
  const map = new Map();
  demands.forEach((demand) => {
    const work = workById(demand.obraId);
    const label = work?.[field] || "NÃ£o informado";
    map.set(label, (map.get(label) || 0) + 1);
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function median(values) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function managementDeadlineReading(demand) {
  if (demand.coluna === "cancelado") return { status: "excluded", delay: 0 };
  const plannedDate = dateOnly(demand.dataPrevistaEntrega);
  if (!plannedDate) return { status: "noDate", delay: 0 };
  const referenceDate = demand.coluna === "concluido" ? dateOnly(demand.dataEntregaReal) : todayISO();
  if (!referenceDate) return { status: "noDate", delay: 0 };
  const delay = Math.max(daysBetween(plannedDate, referenceDate), 0);
  return { status: delay > 0 ? "late" : "onTime", delay };
}

function managementDemandSummary(demands = []) {
  const scoped = arrayOrFallback(demands);
  const completed = scoped.filter((demand) => demand.coluna === "concluido");
  const onHold = scoped.filter((demand) => ["pullPlanning", "pausado"].includes(demand.coluna));
  const active = scoped.filter((demand) => !["concluido", "cancelado", "pullPlanning", "pausado"].includes(demand.coluna));
  const canceled = scoped.filter((demand) => demand.coluna === "cancelado");
  const deadlineRows = scoped.map((demand) => ({ demand, ...managementDeadlineReading(demand) }));
  const onTime = deadlineRows.filter((row) => row.status === "onTime");
  const late = deadlineRows.filter((row) => row.status === "late");
  const noDate = deadlineRows.filter((row) => row.status === "noDate");
  const assessed = onTime.length + late.length;
  return {
    scoped,
    completed,
    active,
    onHold,
    canceled,
    onTime,
    late,
    noDate,
    punctualPercent: assessed ? (onTime.length / assessed) * 100 : 0,
    averageDelay: late.length ? late.reduce((sum, row) => sum + row.delay, 0) / late.length : 0,
  };
}

function analystsForDemands(demands = []) {
  const names = arrayOrFallback(demands)
    .map((demand) => String(demand.analistaResponsavel || "").trim())
    .filter(Boolean);
  return [...new Map(names.map((name) => [normalizeSearchText(name), name])).values()];
}

function managementAnalystLabel(demand) {
  return String(demand.analistaResponsavel || "").trim() || "NÃ£o informado";
}

function managementProduction(demands) {
  const completed = demands.filter((demand) => demand.coluna === "concluido");
  const eligible = completed.filter((demand) => managementDemandArea(demand) > 0);
  const area = eligible.reduce((sum, demand) => sum + managementDemandArea(demand), 0);
  return { completed, eligible, area, value: completed.reduce((sum, demand) => sum + demandProducedValue(demand), 0) };
}

function managementDemandArea(demand) {
  const work = workById(demand.obraId);
  const equivalent = Number(work?.areaEquivalente);
  const built = Number(work?.areaConstruida);
  return Number.isFinite(equivalent) && equivalent > 0 ? equivalent : Number.isFinite(built) && built > 0 ? built : 0;
}

function managementMetricDemands(metric, demands = managementFilteredDemands()) {
  const summary = managementDemandSummary(demands);
  if (["completed", "value"].includes(metric)) return summary.completed;
  if (metric === "area") return managementProduction(demands).eligible;
  if (metric === "active") return summary.active;
  if (metric === "onHold") return summary.onHold;
  if (metric === "canceled") return summary.canceled;
  if (["onTime", "late", "noDate"].includes(metric)) return summary[metric].map((row) => row.demand);
  if (metric === "deadline") return demands.filter((demand) => demand.coluna !== "cancelado");
  if (metric === "assessed") return demands.filter((demand) => ["onTime", "late"].includes(managementDeadlineReading(demand).status));
  if (metric === "responsible") return demands.filter((demand) => String(demand.analistaResponsavel || "").trim());
  return demands;
}

function managementGroupLabel(demand, group) {
  if (group === "analyst") return managementAnalystLabel(demand);
  if (group === "sprint") return sprintById(demand.sprintId)?.nome || "Sem sprint";
  if (group === "type") return demandTypeLabel(demand.tipo);
  if (group === "classification") return workById(demand.obraId)?.classificacaoObra || "NÃ£o informado";
  return "";
}

function managementChartRows(demands, metric, group = "analyst") {
  const groups = new Map();
  managementMetricDemands(metric, demands).forEach((demand) => {
    const label = managementGroupLabel(demand, group);
    const key = normalizeSearchText(label);
    if (!groups.has(key)) groups.set(key, { label, demands: [] });
    groups.get(key).demands.push(demand);
  });
  return [...groups.values()].map(({ label, demands: items }) => {
    const summary = managementDemandSummary(items);
    const production = managementProduction(items);
    let value = items.length;
    if (metric === "value") value = production.value;
    if (metric === "area") value = production.area;
    if (metric === "assessed") value = summary.punctualPercent;
    if (metric === "late") value = summary.averageDelay;
    return { label, value, count: items.length };
  }).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt-BR"));
}

function managementLeaders(demands, metric) {
  const ranked = managementChartRows(demands.filter((demand) => String(demand.analistaResponsavel || "").trim()), metric);
  if (!ranked.length || ranked[0].value <= 0) return [];
  return ranked.filter((row) => Math.abs(row.value - ranked[0].value) < 1e-9);
}

function managementDetailAttributes(metric, group = "", value = "", column = "") {
  return `data-action="open-management-detail" data-metric="${escapeAttribute(metric)}" data-group="${escapeAttribute(group)}" data-value="${escapeAttribute(value)}"${column ? ` data-column="${escapeAttribute(column)}"` : ""}`;
}

function managementDetailData(metric = "all", group = "", value = "", column = "") {
  const scoped = managementFilteredDemands();
  let demands = managementMetricDemands(metric, scoped);
  if (group === "leader") {
    const names = new Set(managementLeaders(scoped, metric).map((row) => normalizeSearchText(row.label)));
    demands = demands.filter((demand) => names.has(normalizeSearchText(managementAnalystLabel(demand))));
  } else if (group) {
    demands = demands.filter((demand) => normalizeSearchText(managementGroupLabel(demand, group)) === normalizeSearchText(value));
  }
  if (column) demands = demands.filter((demand) => demand.coluna === column);
  const titles = { all: "Demandas no filtro", completed: "Demandas concluÃ­das", canceled: "Demandas canceladas", value: "Valor produzido", area: "ProduÃ§Ã£o em mÂ²", active: "Demandas em fluxo", onHold: "Demandas On Hold", onTime: "Demandas dentro do prazo", late: "Demandas atrasadas", noDate: "Demandas sem data suficiente", responsible: "Demandas por responsÃ¡vel", deadline: "SituaÃ§Ã£o dos prazos", assessed: "Prazo por analista" };
  const production = managementProduction(demands);
  const areaNote = " A produÃ§Ã£o em mÂ² soma a Ã¡rea equivalente (ou construÃ­da) das demandas concluÃ­das, mesmo sem valor financeiro registrado. A Ã¡rea Ã© somada por demanda, inclusive em novas entregas da mesma obra.";
  return {
    eyebrow: "VisÃ£o Gerencial Â· demandas do indicador",
    title: `${titles[metric] || titles.all}${group === "leader" ? " Â· lideranÃ§a" : value ? ` Â· ${escapeAttribute(value)}` : ""}${column ? ` Â· ${escapeAttribute(columns.find((item) => item.id === column)?.label || "Etapa nÃ£o informada")}` : ""}`,
    subtitle: `Respeita todos os filtros e a etapa selecionada. Clique no cÃ³digo para abrir a demanda.${areaNote}`,
    metrics: [
      { label: "Demandas", value: String(demands.length) },
      { label: "Valor produzido", value: money(production.value) },
      { label: "ProduÃ§Ã£o em mÂ²", value: `${number(production.area, 2)} mÂ²` },
    ],
    columns: ["Demanda", "Obra", "Atividade", "Analista", "Sprint", "Etapa", "Entrega prevista", "Entrega real", "Valor produzido", "Ãrea (mÂ²)"],
    rows: demands.map((demand) => [
      `<button class="management-demand-link" type="button" data-action="open-demand-detail" data-id="${escapeAttribute(demand.id)}">${escapeAttribute(demand.id)}</button>`,
      escapeAttribute(workById(demand.obraId)?.nome || "Obra nÃ£o localizada"),
      escapeAttribute(demandTypeLabel(demand.tipo)),
      escapeAttribute(managementAnalystLabel(demand)),
      escapeAttribute(sprintById(demand.sprintId)?.nome || "Sem sprint"),
      escapeAttribute(demandStatusLabel(demand)),
      dateText(demand.dataPrevistaEntrega),
      dateText(demand.dataEntregaReal),
      demand.coluna === "concluido" && demandHasRecordedValue(demand) ? money(demandProducedValue(demand)) : "â€”",
      managementDemandArea(demand) ? number(managementDemandArea(demand), 2) : "â€”",
    ]),
  };
}

function managementChartColor(group, label) {
  const colors = ["#2563eb", "#087f8c", "#7c3aed", "#c2410c", "#be185d", "#15803d", "#475569", "#0e7490", "#4338ca", "#a52745", "#a16207", "#a21caf", "#0369a1", "#047857", "#6d28d9", "#9a3412"];
  const labels = [...new Set(state.demands.map((demand) => normalizeSearchText(managementGroupLabel(demand, group))))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  return colors[Math.max(labels.indexOf(normalizeSearchText(label)), 0) % colors.length];
}

function managementMetricText(metric, value, count = 0) {
  if (metric === "value") return money(value);
  if (metric === "area") return `${number(value, 2)} mÂ²`;
  if (metric === "assessed") return `${number(value)}% Â· ${count} avaliadas`;
  if (metric === "late") return `${number(value, 1)} dias Â· ${count} atrasadas`;
  return String(value);
}

function managementPanel(title, subtitle, body, metric = "all", className = "") {
  return `<section class="panel management-panel ${className}"><div class="panel-header"><div><h2>${title}</h2><p class="panel-subtitle">${subtitle}</p></div><button class="management-see-all" type="button" ${managementDetailAttributes(metric)} aria-label="Ver demandas: ${title}">Ver demandas</button></div>${body}</section>`;
}

function managementRankingRows(demands, metric) {
  const assigned = demands.filter((demand) => demand.coluna === "concluido" && String(demand.analistaResponsavel || "").trim());
  const rows = managementChartRows(assigned, metric);
  const represented = new Set(rows.map((row) => normalizeSearchText(row.label)));
  analystsForDemands(assigned).forEach((label) => {
    if (!represented.has(normalizeSearchText(label))) rows.push({ label, value: 0, count: 0 });
  });
  return rows.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt-BR"));
}

function renderManagementRanking(demands, metric) {
  const rows = managementRankingRows(demands, metric);
  const max = Math.max(...rows.map((row) => row.value), 1);
  const unassigned = managementMetricDemands(metric, demands).filter((demand) => !String(demand.analistaResponsavel || "").trim());
  const ranking = rows.length ? `<ol class="management-ranking" data-metric="${metric}">${rows.map((row) => {
    const position = rows.findIndex((item) => Math.abs(item.value - row.value) < 1e-9) + 1;
    const tied = rows.filter((item) => Math.abs(item.value - row.value) < 1e-9).length > 1;
    const formatted = managementMetricText(metric, row.value);
    return `<li><button class="management-rank" type="button" data-position="${position}" ${managementDetailAttributes(metric, "analyst", row.label)} style="--chart-color:${managementChartColor("analyst", row.label)}" aria-label="${escapeAttribute(`${position}Âº lugar${tied ? ', empate' : ''}: ${row.label}, ${formatted}. Ver demandas`)}"><span class="management-rank-position">${position}Âº</span><span class="management-rank-reading"><strong>${escapeAttribute(row.label)}</strong><span>${formatted}</span><span class="management-rank-track" aria-hidden="true"><i style="width:${row.value / max * 100}%"></i></span>${tied ? '<small>Empate</small>' : ''}</span></button></li>`;
  }).join("")}</ol>` : `<div class="empty-state">Nenhum analista com produÃ§Ã£o concluÃ­da neste filtro.</div>`;
  return `${ranking}<div class="management-ranking-footer"><span>${rows.length} analistas Â· ordem decrescente</span>${unassigned.length ? `<button class="management-see-all" type="button" ${managementDetailAttributes(metric, "analyst", "NÃ£o informado")}>${unassigned.length} demandas sem responsÃ¡vel</button>` : ""}</div>`;
}

function renderManagementGauges(demands) {
  const rows = managementChartRows(demands, "assessed");
  return rows.length ? `<div class="management-gauges">${rows.map((row) => `<button class="management-gauge" type="button" ${managementDetailAttributes("assessed", "analyst", row.label)} aria-label="${escapeAttribute(`${row.label}: ${managementMetricText('assessed', row.value, row.count)}. Ver demandas`)}"><span class="management-gauge-ring" style="background:conic-gradient(#15803d 0 ${row.value}%, #dc5965 ${row.value}% 100%)"><strong>${number(row.value)}%</strong></span><strong>${escapeAttribute(row.label)}</strong><small>${row.count} avaliadas</small></button>`).join("")}</div><p class="management-chart-note">Verde: no prazo Â· vermelho: com atraso</p>` : `<div class="empty-state">Nenhuma demanda com prazo avaliado.</div>`;
}

function renderManagementDots(demands) {
  const rows = managementChartRows(demands, "late");
  const max = Math.max(...rows.map((row) => row.value), 1);
  return rows.length ? `<div class="management-dot-list">${rows.map((row) => `<button class="management-dot-row" type="button" ${managementDetailAttributes("late", "analyst", row.label)}><span class="management-bar-caption"><strong>${escapeAttribute(row.label)}</strong><span>${managementMetricText("late", row.value, row.count)}</span></span><span class="management-dot-track" aria-hidden="true"><i style="left:clamp(7px, ${row.value / max * 100}%, calc(100% - 7px))"></i></span></button>`).join("")}</div>` : `<div class="empty-state">Nenhuma demanda atrasada neste filtro.</div>`;
}

function renderManagementProfileLegend(rows, group) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return `<div class="management-profile-legend">${rows.map((row) => `<button class="management-profile-item" type="button" ${managementDetailAttributes("all", group, row.label)}><i style="background:${managementChartColor(group, row.label)}" aria-hidden="true"></i><span>${escapeAttribute(row.label)}</span><strong>${row.value} <small>(${number(row.value / total * 100)}%)</small></strong></button>`).join("")}</div>`;
}

function renderManagementActivityDonut(demands) {
  const rows = managementChartRows(demands, "all", "type");
  if (!rows.length) return `<div class="empty-state">Nenhuma demanda neste filtro.</div>`;
  let start = 0;
  const stops = rows.map((row) => {
    const end = start + row.value / demands.length * 100;
    const stop = `${managementChartColor("type", row.label)} ${start}% ${end}%`;
    start = end;
    return stop;
  }).join(", ");
  return `<div class="management-profile"><button class="donut-chart management-activity-donut" type="button" style="background:conic-gradient(${stops})" ${managementDetailAttributes("all")} aria-label="Ver ${demands.length} demandas por tipo de atividade"><span>${demands.length}</span><small>demandas</small></button>${renderManagementProfileLegend(rows, "type")}</div>`;
}

function managementTreemapTiles(rows, x = 0, y = 0, width = 100, height = 100) {
  if (rows.length === 1) return [{ ...rows[0], x, y, width, height }];
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  let split = 1;
  let accumulated = rows[0].value;
  let distance = Math.abs(accumulated - total / 2);
  let selected = accumulated;
  for (let index = 1; index < rows.length - 1; index += 1) {
    accumulated += rows[index].value;
    if (Math.abs(accumulated - total / 2) < distance) {
      split = index + 1;
      selected = accumulated;
      distance = Math.abs(accumulated - total / 2);
    }
  }
  const ratio = selected / total;
  return width >= height
    ? [...managementTreemapTiles(rows.slice(0, split), x, y, width * ratio, height), ...managementTreemapTiles(rows.slice(split), x + width * ratio, y, width * (1 - ratio), height)]
    : [...managementTreemapTiles(rows.slice(0, split), x, y, width, height * ratio), ...managementTreemapTiles(rows.slice(split), x, y + height * ratio, width, height * (1 - ratio))];
}

function renderManagementTreemap(demands) {
  const rows = managementChartRows(demands, "all", "classification");
  if (!rows.length) return `<div class="empty-state">Nenhuma demanda neste filtro.</div>`;
  return `<div class="management-treemap" aria-label="Mapa de Ã¡reas: o tamanho representa a quantidade de demandas">${managementTreemapTiles(rows).map((row) => `<button class="management-treemap-tile" type="button" style="left:${row.x}%;top:${row.y}%;width:${row.width}%;height:${row.height}%;--chart-color:${managementChartColor("classification", row.label)}" ${managementDetailAttributes("all", "classification", row.label)} aria-label="${escapeAttribute(`${row.label}: ${row.value} demandas. Ver demandas`)}"><strong>${escapeAttribute(row.label)}</strong><span>${row.value} demandas</span></button>`).join("")}</div>${renderManagementProfileLegend(rows, "classification")}`;
}

function renderManagementDeadlines(summary) {
  const rows = [ { metric: "onTime", label: "No prazo", tone: "green" }, { metric: "late", label: "Com atraso", tone: "red" }, { metric: "noDate", label: "Sem data suficiente", tone: "gray" } ];
  const count = summary.onTime.length + summary.late.length + summary.noDate.length;
  const total = Math.max(count, 1);
  const punctual = summary.onTime.length / total * 100;
  const delayed = summary.late.length / total * 100;
  const gradient = count ? `conic-gradient(var(--green) 0 ${punctual}%, var(--red) ${punctual}% ${punctual + delayed}%, #9aaaba ${punctual + delayed}% 100%)` : "#e5eaf2";
  return `<div class="management-deadlines"><button class="donut-chart" type="button" style="background:${gradient}" ${managementDetailAttributes("deadline")} aria-label="Ver ${count} demandas da situaÃ§Ã£o dos prazos"><span>${count}</span><small>demandas</small></button><div class="management-deadline-legend">${rows.map(({ metric, label, tone }) => `<button type="button" class="management-legend" data-tone="${tone}" ${managementDetailAttributes(metric)}><i aria-hidden="true"></i><span>${label}</span><strong>${summary[metric].length} (${number(summary[metric].length / total * 100)}%)</strong></button>`).join("")}</div></div>`;
}

function renderWorksManagement() {
  // Acesso contextual Ã  mesma base financeira, sem incorporar OIs Ã s contagens de demandas.

  const demands = managementFilteredDemands();
  const summary = managementDemandSummary(demands);
  const production = managementProduction(demands);
  const completedSummary = managementDemandSummary(summary.completed);
  const completedPercent = (count) => number(summary.completed.length ? count / summary.completed.length * 100 : 0);
  const completedHint = [
    `Entregues no prazo: ${completedSummary.onTime.length} (${completedPercent(completedSummary.onTime.length)}%)`,
    `Entregues em atraso: ${completedSummary.late.length} (${completedPercent(completedSummary.late.length)}%)`,
    ...(completedSummary.noDate.length ? [`Sem data suficiente: ${completedSummary.noDate.length} (${completedPercent(completedSummary.noDate.length)}%)`] : []),
  ].join("<br>");
  const activeSummary = managementDemandSummary(summary.active);
  const activePercent = (count) => number(summary.active.length ? count / summary.active.length * 100 : 0);
  const activeHint = [
    `No prazo: ${activeSummary.onTime.length} (${activePercent(activeSummary.onTime.length)}%)`,
    `Em atraso: ${activeSummary.late.length} (${activePercent(activeSummary.late.length)}%)`,
    ...(activeSummary.noDate.length ? [`Sem data suficiente: ${activeSummary.noDate.length} (${activePercent(activeSummary.noDate.length)}%)`] : []),
  ].join("<br>");
  const missingValue = summary.completed.filter((demand) => !demandHasRecordedValue(demand)).length;
  const missingArea = summary.completed.length - production.eligible.length;
  const missingHint = (count, field) => count ? `${count} demanda${count === 1 ? " concluÃ­da" : "s concluÃ­das"} sem ${field}` : "";
  const metric = (label, value, hint, tone, key) => kpi(label, value, hint, tone, "", `mgmt:${key}`);
  return `
    ${renderWorksToolbar("worksManagement", "VisÃ£o Gerencial", "ProduÃ§Ã£o, carga de trabalho e prazos da equipe Â· clique nos resultados para ver as demandas", `
      <button class="secondary-action" type="button" data-view="worksOperational">Operacional</button>
      <button class="primary-action" type="button" data-action="open-demand">Nova demanda</button>
    `)}
    <section class="panel" style="padding:16px;margin-bottom:14px"><strong>InteligÃªncia integrada</strong><p>Demandas e produtividade sÃ£o calculadas na base operacional. Para analisar investimento e execuÃ§Ã£o financeira por OI, abra a fonte integrada HAPCAPEX; para custos previstos por disciplina, consulte a VisÃ£o EstratÃ©gica.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="secondary-action" data-view="worksStrategicFinance">Explorar CAPEX e OIs</button><button type="button" class="secondary-action" data-view="worksStrategic">Investigar EVs e custos/mÂ²</button><button type="button" class="secondary-action" data-view="portfolio">PortfÃ³lio de obras</button></div></section>
    ${renderOperationalFilters()}
    ${renderOperationalFilterBanner()}
    ${renderManagementStatusTabs()}
    <div class="works-management">
      <section class="kpi-grid management-kpis">
        ${metric("Demandas no filtro", String(demands.length), "Carteira selecionada", "blue", "all")}
        ${metric("ConcluÃ­das", String(summary.completed.length), completedHint, "green", "completed")}
        ${metric("Em fluxo", String(summary.active.length), activeHint, "blue", "active")}
        ${metric("On Hold", String(summary.onHold.length), `Pull Planning: ${summary.onHold.filter((demand) => demand.coluna === "pullPlanning").length}<br>Pausado: ${summary.onHold.filter((demand) => demand.coluna === "pausado").length}`, "orange", "onHold")}
        ${metric("Canceladas", String(summary.canceled.length), "", "red", "canceled")}
        ${metric("Valor produzido", money(production.value), missingHint(missingValue, "valor"), "orange", "value")}
        ${metric("ProduÃ§Ã£o em mÂ²", `${number(production.area, 2)} mÂ²`, missingHint(missingArea, "Ã¡rea"), "blue", "area")}
      </section>
      <section class="management-section" aria-labelledby="managementProductionTitle">
        <div class="management-section-heading"><h2 id="managementProductionTitle">Rankings de produÃ§Ã£o por analista</h2></div>
        <div class="management-grid">
          ${managementPanel("Ranking de entregas", "Demandas concluÃ­das Â· empates mantÃªm a mesma posiÃ§Ã£o", renderManagementRanking(demands, "completed"), "completed")}
          ${managementPanel("Ranking de valor financeiro", "Valor produzido nas demandas concluÃ­das", renderManagementRanking(demands, "value"), "value")}
          ${managementPanel("ProduÃ§Ã£o em mÂ² por analista", "Ranking pela soma das Ã¡reas concluÃ­das", renderManagementRanking(demands, "area"), "area")}
        </div>
      </section>
      <section class="management-section" aria-labelledby="managementDeadlineTitle">
        <div class="management-section-heading"><h2 id="managementDeadlineTitle">EficiÃªncia de prazo</h2></div>
        <div class="management-grid">
          ${managementPanel("SituaÃ§Ã£o dos prazos", "Clique na legenda ou no total para abrir as demandas", renderManagementDeadlines(summary), "deadline")}
          ${managementPanel("Prazo por analista", "Percentual no prazo Â· somente demandas avaliadas", renderManagementGauges(demands), "assessed")}
          ${managementPanel("Atraso mÃ©dio por analista", "Dias de atraso Â· somente demandas atrasadas", renderManagementDots(demands), "late")}
        </div>
      </section>
      <section class="management-section" aria-labelledby="managementProfileTitle">
        <div class="management-section-heading"><h2 id="managementProfileTitle">Perfil das demandas</h2><p>Atividade e classificaÃ§Ã£o da obra, separados dos indicadores de prazo.</p></div>
        <div class="management-grid management-grid-two">
          ${managementPanel("Demandas por tipo de atividade", "DistribuiÃ§Ã£o dentro do filtro gerencial", renderManagementActivityDonut(demands), "all", "management-activity-panel")}
          ${managementPanel("Por classificaÃ§Ã£o da obra", "Tamanho dos blocos = quantidade de demandas", renderManagementTreemap(demands))}
        </div>
      </section>
    </div>
  `;
}

function managementFilteredDemands() {
  const demands = filteredDemands();
  if (managementStatusFilter === "completed") return demands.filter((demand) => demand.coluna === "concluido");
  if (managementStatusFilter === "planning") return demands.filter((demand) => demand.coluna === "pullPlanning");
  if (managementStatusFilter === "todo") return demands.filter((demand) => demand.coluna === "fazer");
  if (managementStatusFilter === "progress") return demands.filter((demand) => !["concluido", "cancelado", "pullPlanning", "pausado"].includes(demand.coluna));
  if (managementStatusFilter === "onHold") return demands.filter((demand) => ["pullPlanning", "pausado"].includes(demand.coluna));
  if (managementStatusFilter === "canceled") return demands.filter((demand) => demand.coluna === "cancelado");
  return demands;
}

function renderManagementStatusTabs() {
  const demands = filteredDemands();
  const tabs = [
    { id: "completed", label: "ConcluÃ­das", count: demands.filter((demand) => demand.coluna === "concluido").length },
    { id: "planning", label: "Pull Planning", count: demands.filter((demand) => demand.coluna === "pullPlanning").length },
    { id: "todo", label: "A fazer", count: demands.filter((demand) => demand.coluna === "fazer").length },
    { id: "progress", label: "Em fluxo", count: demands.filter((demand) => !["concluido", "cancelado", "pullPlanning", "pausado"].includes(demand.coluna)).length },
    { id: "onHold", label: "On Hold", count: demands.filter((demand) => ["pullPlanning", "pausado"].includes(demand.coluna)).length },
    { id: "canceled", label: "Canceladas", count: demands.filter((demand) => demand.coluna === "cancelado").length },
    { id: "all", label: "Todas", count: demands.length },
  ];
  return `
    <section class="management-tabs">
      ${tabs
        .map(
          (tab) => `
            <button class="${managementStatusFilter === tab.id ? "is-active" : ""}" type="button" data-action="set-management-filter" data-filter="${tab.id}">
              ${tab.label} <span>${tab.count}</span>
            </button>
          `
        )
        .join("")}
    </section>
  `;
}

function renderDeliveryDonut(onTime, delayed, noDate) {
  const total = Math.max(onTime + delayed + noDate, 1);
  const onTimePct = (onTime / total) * 100;
  const delayedPct = (delayed / total) * 100;
  const gradient = `conic-gradient(var(--green) 0 ${onTimePct}%, var(--red) ${onTimePct}% ${onTimePct + delayedPct}%, #9aaaba ${onTimePct + delayedPct}% 100%)`;
  return `
    <div class="donut-panel">
      <div class="donut-chart" style="background:${gradient}">
        <span>${onTime + delayed + noDate}</span>
        <small>demandas</small>
      </div>
      <div class="donut-legend">
        ${legendItem("No prazo", `${onTime} (${number((onTime / total) * 100)}%)`, "green")}
        ${legendItem("Com atraso", `${delayed} (${number((delayed / total) * 100)}%)`, "red")}
        ${legendItem("Sem data suficiente", `${noDate} (${number((noDate / total) * 100)}%)`, "gray")}
      </div>
    </div>
  `;
}

function legendItem(label, value, tone) {
  return `
    <span class="legend-item" data-tone="${tone}">
      <i></i>
      <strong>${label}</strong>
      <small>${value}</small>
    </span>
  `;
}

function historicalWorksRecords() {
  return Array.isArray(globalThis.GENERAL_WORKS_DATA?.records) ? globalThis.GENERAL_WORKS_DATA.records : [];
}

function historicalWorksSummary(records) {
  const area = records.reduce((sum, record) => sum + (Number(record.areaM2) || 0), 0);
  const salaTecnica = records.reduce((sum, record) => sum + (Number(record.valorSalaTecnica) || 0), 0);
  const negociado = records.reduce((sum, record) => sum + (Number(record.valorNegociado) || 0), 0);
  const validArea = records.filter((record) => Number(record.areaM2) > 0 && Number(record.valorNegociado) >= 0);
  const validAreaTotal = validArea.reduce((sum, record) => sum + Number(record.areaM2), 0);
  const validNegotiated = validArea.reduce((sum, record) => sum + (Number(record.valorNegociado) || 0), 0);
  return {
    count: records.length,
    area,
    salaTecnica,
    negociado,
    saving: salaTecnica - negociado,
    precoM2: validAreaTotal ? validNegotiated / validAreaTotal : 0,
  };
}

function executiveKpi(label, value, exact, hint, tone, detailKey, tag = "KPI") {
  return `
    <article class="executive-kpi-card is-clickable" data-tone="${tone}" data-action="open-kpi-detail" data-kpi="${detailKey}" role="button" tabindex="0">
      <header><span>${escapeAttribute(tag)}</span><small>${escapeAttribute(label)}</small></header>
      <strong>${value}</strong>
      ${exact ? `<b>${exact}</b>` : ""}
      <p>${hint}</p>
      <em>Ver anÃ¡lise â†’</em>
    </article>
  `;
}

function strategicHeroMetric(label, value, detail = "", tag = "KPI", tone = "blue", progress = 100) {
  return `
    <article class="strategic-hero-metric" data-tone="${tone}" style="--metric-progress:${Math.max(2, Math.min(progress, 100))}%">
      <header><span>${tag}</span><small>${label}</small></header>
      <strong>${value}</strong>
      ${detail ? `<p>${detail}</p>` : ""}
      <i><b></b></i>
    </article>
  `;
}

function historicalClassificationLabel(value) {
  const key = normalizeSearchText(value).trim();
  const labels = {
    "adequacao regulatoria": "AdequaÃ§Ã£o RegulatÃ³ria",
    "suficiencia de rede": "SuficiÃªncia de Rede",
    "eficiencia operacional": "EficiÃªncia Operacional",
    "obra estrategica": "Obra EstratÃ©gica",
    "verticalizacao": "VerticalizaÃ§Ã£o",
    "venda de servico": "Venda de ServiÃ§o",
    "obra emergencial": "Obra Emergencial",
    "padronizacao de unidade": "PadronizaÃ§Ã£o de Unidade",
    "fachada": "Fachada",
  };
  return labels[key] || (value && value !== "-" ? value : "NÃ£o informada");
}

function historicalNegotiatedByRegion() {
  const grouped = new Map();
  historicalWorksRecords().forEach((record) => {
    const label = record.regiao || "NÃ£o informada";
    grouped.set(label, (grouped.get(label) || 0) + (Number(record.valorNegociado) || 0));
  });
  return [...grouped.entries()].map(([label, valor]) => ({ label, valor })).sort((a, b) => b.valor - a.valor);
}

function historicalInvestmentRankingRows() {
  return historicalWorksRecords()
    .map((record) => ({ record, valor: Number(record.valorNegociado) || 0 }))
    .filter((row) => row.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}

function strategicEVScopeRecords(sourceRecords, { ignoreDiscipline = false } = {}) {
  return sourceRecords.filter((record) => {
    if (strategicEVFilters.year && String(record.year) !== strategicEVFilters.year) return false;
    if (strategicEVFilters.typology && record.typology !== strategicEVFilters.typology) return false;
    if (!ignoreDiscipline && strategicEVFilters.discipline && !Number(record.disciplines?.[strategicEVFilters.discipline] || 0)) return false;
    return true;
  });
}

function strategicDisciplineRows(records) {
  const portfolioTotal = records.reduce((sum, record) => sum + Number(record.total || 0), 0);
  return configuredDisciplines({ includeInactive: false })
    .filter((discipline) => !["taxa-risco", "sics", "outras-linhas-ev"].includes(discipline.id))
    .map((discipline) => {
      const withValue = records.filter((record) => Number(record.disciplines?.[discipline.id] || 0) !== 0);
      const values = withValue.map((record) => Number(record.disciplines[discipline.id]) || 0);
      const total = values.reduce((sum, value) => sum + value, 0);
      const withArea = withValue.filter((record) => Number(record.area) > 0);
      const area = withArea.reduce((sum, record) => sum + Number(record.area || 0), 0);
      const valueWithArea = withArea.reduce((sum, record) => sum + Number(record.disciplines?.[discipline.id] || 0), 0);
      const benchmark = evHistoricalBenchmark(records, discipline.id);
      return {
        discipline,
        total,
        count: withValue.length,
        coverage: records.length ? (withValue.length / records.length) * 100 : 0,
        shareInEVs: portfolioTotal ? (total / portfolioTotal) * 100 : 0,
        average: values.length ? total / values.length : 0,
        medianValue: evPercentile(values, 0.5),
        costM2: area ? valueWithArea / area : 0,
        benchmark,
      };
    })
    .filter((row) => row.count > 0)
    .sort((left, right) => right.total - left.total);
}

function strategicGroupedRows(records, field, disciplineId = "") {
  const groups = new Map();
  records.forEach((record) => {
    const label = String(record[field] || "NÃ£o informado");
    const current = groups.get(label) || { label, count: 0, total: 0, area: 0, valueWithArea: 0, disciplineTotal: 0 };
    const area = Number(record.area || 0);
    const total = Number(record.total || 0);
    current.count += 1;
    current.total += total;
    current.disciplineTotal += disciplineId ? Number(record.disciplines?.[disciplineId] || 0) : 0;
    if (area > 0 && total > 0) {
      current.area += area;
      current.valueWithArea += total;
    }
    groups.set(label, current);
  });
  return [...groups.values()].map((row) => ({ ...row, costM2: row.area ? row.valueWithArea / row.area : 0 }));
}

function renderStrategicBarRows(rows, valueKey, total, formatter = moneyCompact) {
  const max = Math.max(...rows.map((row) => Number(row[valueKey] || 0)), 1);
  return rows.map((row) => `<div class="strategic-analysis-bar">
    <div><strong>${escapeAttribute(row.label)}</strong><small>${number(row.count)} EVs Â· ${moneyCents(row.total)}${row.costM2 ? ` Â· ${moneyCents(row.costM2)}/mÂ²` : ""}</small></div>
    <i><b style="width:${Math.max(2, (Number(row[valueKey] || 0) / max) * 100)}%"></b></i>
    <span><b>${formatter(Number(row[valueKey] || 0))}</b><small>${total ? `${number((Number(row[valueKey] || 0) / total) * 100, 1)}%` : "0,0%"}</small></span>
  </div>`).join("") || `<div class="empty-state">Sem dados para o recorte selecionado.</div>`;
}

function renderWorksStrategic() {
  const sourceRecords = evUnifiedRecords();
  const records = strategicEVScopeRecords(sourceRecords);
  const scopedAreaRecords = records.filter((record) => Number(record.total) > 0 && Number(record.area) > 0);
  const totalValue = records.reduce((sum, record) => sum + Number(record.total || 0), 0);
  const validValue = scopedAreaRecords.reduce((sum, record) => sum + Number(record.total || 0), 0);
  const totalArea = scopedAreaRecords.reduce((sum, record) => sum + Number(record.area || 0), 0);
  const weightedCostM2 = totalArea ? validValue / totalArea : 0;
  const historicalCount = records.filter((record) => record.sourceKind === "historical").length;
  const currentCount = records.filter((record) => record.sourceKind === "current").length;
  const investmentRows = records.map((record) => ({ record, valor: Number(record.total) || 0 })).filter((row) => row.valor > 0).sort((a, b) => b.valor - a.valor);
  const topInvestment = investmentRows[0];
  const topFiveValue = investmentRows.slice(0, 5).reduce((sum, row) => sum + row.valor, 0);
  const topFiveShare = totalValue ? (topFiveValue / totalValue) * 100 : 0;
  const disciplineRows = strategicDisciplineRows(records);
  const selectedDiscipline = strategicEVFilters.discipline ? disciplineById(strategicEVFilters.discipline) : null;
  const selectedDisciplineRow = disciplineRows.find((row) => row.discipline.id === strategicEVFilters.discipline);
  const selectedDisciplineTotal = records.reduce((sum, record) => sum + Number(record.disciplines?.[strategicEVFilters.discipline] || 0), 0);
  const selectedDisciplineShare = totalValue ? (selectedDisciplineTotal / totalValue) * 100 : 0;
  const byYear = strategicGroupedRows(records, "year", strategicEVFilters.discipline).sort((a, b) => String(a.label).localeCompare(String(b.label), "pt-BR"));
  const byTypology = strategicGroupedRows(records, "typology", strategicEVFilters.discipline).sort((a, b) => b.total - a.total);
  const filterBase = strategicEVScopeRecords(sourceRecords, { ignoreDiscipline: true });
  const selectableDisciplines = configuredDisciplines({ includeInactive: false }).filter((discipline) => !["taxa-risco", "sics", "outras-linhas-ev"].includes(discipline.id));
  const disciplineValueFor = (record) => strategicEVFilters.discipline ? Number(record.disciplines?.[strategicEVFilters.discipline] || 0) : 0;

  return `
    ${renderWorksToolbar("worksStrategic", "VisÃ£o EstratÃ©gica", `Base oficial de ${sourceRecords.length} EVs Â· mesma fonte da DADOS EVS`, `
      <button class="secondary-action" type="button" data-view="portfolio">PortfÃ³lio</button>
      <button class="primary-action" type="button" data-view="budget">Controle de Verbas</button>
    `)}

    <section class="panel" style="padding:16px;margin-bottom:14px"><strong>Investimento e engenharia integrados</strong><p>Os indicadores desta aba sÃ£o estimativas dos EVs. Consulte o realizado financeiro na VisÃ£o EstratÃ©gico-Financeira, com pesquisa por OI, HEAD e pacote. Valores entre bases nÃ£o sÃ£o equivalentes sem vÃ­nculo auditÃ¡vel.</p><div style="display:flex;flex-wrap:wrap;gap:10px"><button type="button" class="secondary-action" data-view="worksStrategicFinance">Consultar HAPCAPEX / OIs</button><button type="button" class="secondary-action" data-view="worksManagement">Analisar demandas</button><button type="button" class="secondary-action" data-view="portfolio">Abrir EVs e obras</button></div></section>
    <section class="panel strategic-analysis-intro">
      <div><span class="eyebrow">InteligÃªncia de custos dos EVs</span><h2>Investimento orÃ§ado, composiÃ§Ã£o e referÃªncias histÃ³ricas</h2><p class="panel-subtitle">Os valores representam os custos previstos nos Estudos de Viabilidade. Eles nÃ£o correspondem a pagamentos realizados. Use os filtros para recalcular todos os indicadores e detalhar qualquer disciplina da base.</p></div>
      <div class="strategic-analysis-filters">
        <label class="field"><span>Ano do EV</span><select data-strategic-ev-filter="year">${evHistoricalFilterOptions(sourceRecords.map((record) => String(record.year)), strategicEVFilters.year, "Todos os anos")}</select></label>
        <label class="field"><span>Tipologia</span><select data-strategic-ev-filter="typology">${evHistoricalFilterOptions(workTypologyOptions, strategicEVFilters.typology, "Todas as tipologias", (value) => value, true)}</select></label>
        <label class="field"><span>Disciplina</span><select data-strategic-ev-filter="discipline">${evHistoricalFilterOptions(selectableDisciplines.map((discipline) => discipline.id), strategicEVFilters.discipline, "Todas as disciplinas", (id) => disciplineById(id).nome)}</select></label>
        <button class="secondary-action" type="button" data-action="clear-strategic-ev-filters">Limpar filtros</button>
      </div>
      <p class="strategic-analysis-scope"><strong>${number(records.length)} de ${number(sourceRecords.length)} EVs</strong> no recorte atual${selectedDiscipline ? ` Â· somente EVs com ${escapeAttribute(selectedDiscipline.nome)}` : ""}.</p>
    </section>

    <section class="strategic-hero panel">
      <article class="strategic-main-kpi" data-tone="green" style="--hero-progress:360deg">
        <header><span class="eyebrow">Indicador principal</span><em>Fonte Ãºnica Â· Base de EVs</em></header>
        <div class="strategic-main-kpi__body">
          <span class="strategic-main-ring"><b>${number(records.length)}</b><small>EVs</small></span>
          <span class="strategic-main-copy">
            <strong>Base estratÃ©gica sincronizada com a DADOS EVS</strong>
            <small>Todos os indicadores abaixo respondem ao recorte selecionado e usam a carga oficial mais os novos EVs.</small>
            <span class="strategic-main-breakdown">
              <span data-tone="green"><i></i><b>${historicalCount}</b><small>Base DADOS EVS</small></span>
              <span data-tone="blue"><i></i><b>${currentCount}</b><small>Novos cadastros</small></span>
              <span data-tone="orange"><i></i><b>${scopedAreaRecords.length}</b><small>Com Ã¡rea vÃ¡lida</small></span>
            </span>
          </span>
        </div>
        <span class="strategic-main-footer"><i>Base inicial DADOS EVS + novos cadastros</i><b>AtualizaÃ§Ã£o automÃ¡tica</b></span>
      </article>
      <div class="strategic-hero-metrics">
        ${strategicHeroMetric("Investimento orÃ§ado nos EVs", moneyCompact(totalValue), moneyCents(totalValue), "EV", "blue", 100)}
        ${strategicHeroMetric("Maior EV", topInvestment ? topInvestment.record.project : "Sem carteira", topInvestment ? `${moneyCompact(topInvestment.valor)} Â· ${number((topInvestment.valor / Math.max(totalValue, 1)) * 100, 1)}% da base` : "", "TOP 1", "orange", topInvestment ? (topInvestment.valor / Math.max(totalValue, 1)) * 100 : 0)}
        ${strategicHeroMetric("Custo mÃ©dio ponderado", weightedCostM2 ? `${moneyCents(weightedCostM2)}/mÂ²` : "Sem leitura", `${number(totalArea, 2)} mÂ² Â· ${scopedAreaRecords.length} EVs vÃ¡lidos`, "R$/MÂ²", "green", 100)}
        ${strategicHeroMetric(selectedDiscipline ? selectedDiscipline.nome : "ConcentraÃ§Ã£o Top 5", selectedDiscipline ? moneyCompact(selectedDisciplineTotal) : `${number(topFiveShare, 1)}%`, selectedDiscipline ? `${moneyCents(selectedDisciplineTotal)} Â· ${number(selectedDisciplineShare, 1)}% dos EVs filtrados` : `${moneyCompact(topFiveValue)} Â· ${moneyCents(topFiveValue)}`, selectedDiscipline ? "DISC." : "TOP 5", "purple", selectedDiscipline ? selectedDisciplineShare : topFiveShare)}
      </div>
    </section>

    <div class="strategic-section-heading">
      <div><span>Painel executivo</span><h2>Indicadores estratÃ©gicos</h2></div>
      <p>Valores abreviados para leitura rÃ¡pida, com o montante exato logo abaixo.</p>
    </div>
    <section class="strategic-kpis">
      ${executiveKpi("EVs no recorte", number(records.length), `${historicalCount} histÃ³ricos + ${currentCount} novos`, "Quantidade considerada em todos os cÃ¡lculos desta tela", "blue", "strategicUnifiedEV", "EV")}
      ${executiveKpi("Investimento orÃ§ado", moneyCompact(totalValue), moneyCents(totalValue), "Soma exata do valor total dos EVs filtrados", "green", "strategicUnifiedEV", "VALOR")}
      ${executiveKpi("Ãrea equivalente vÃ¡lida", metricCompact(totalArea, " mÂ²"), `${number(totalArea, 2)} mÂ²`, `${scopedAreaRecords.length} EVs com valor e Ã¡rea`, "blue", "strategicUnifiedEV", "ÃREA")}
      ${executiveKpi("Custo mÃ©dio ponderado", weightedCostM2 ? `${moneyCents(weightedCostM2)}/mÂ²` : "Sem leitura", `${moneyCents(validValue)} Ã· ${number(totalArea, 2)} mÂ²`, "Calculado apenas com EVs que tÃªm valor e Ã¡rea vÃ¡lidos", "green", "strategicUnifiedEV", "R$/MÂ²")}
      ${executiveKpi("Sem leitura de mÂ²", number(records.length - scopedAreaRecords.length), `${scopedAreaRecords.length} leituras vÃ¡lidas`, "EVs sem valor ou Ã¡rea equivalente no recorte", records.length > scopedAreaRecords.length ? "orange" : "green", "strategicUnifiedEV", "QUALIDADE")}
      ${executiveKpi("Disciplinas com valor", number(disciplineRows.length), "Custos discriminados na composiÃ§Ã£o", "Taxa de risco, SICs e linhas residuais nÃ£o entram neste ranking", "green", "strategicUnifiedEV", "DISC.")}
      ${executiveKpi(selectedDiscipline ? `Valor em ${selectedDiscipline.nome}` : "Maior disciplina", moneyCompact(selectedDisciplineRow?.total || disciplineRows[0]?.total || 0), moneyCents(selectedDisciplineRow?.total || disciplineRows[0]?.total || 0), selectedDiscipline ? `${number(selectedDisciplineShare, 1)}% do valor total dos EVs filtrados` : (disciplineRows[0]?.discipline.nome || "Sem composiÃ§Ã£o"), "blue", "strategicUnifiedEV", "CUSTO")}
      ${executiveKpi("ConcentraÃ§Ã£o Top 5", `${number(topFiveShare, 1)}%`, `${moneyCompact(topFiveValue)} Â· ${moneyCents(topFiveValue)}`, "ParticipaÃ§Ã£o dos cinco maiores EVs", topFiveShare > 80 ? "orange" : "blue", "strategicUnifiedTop5", "TOP 5")}
    </section>

    <section class="panel strategic-discipline-panel">
      <div class="panel-header"><div><span class="eyebrow">ComposiÃ§Ã£o financeira</span><h2>Investimento por disciplina</h2><p class="panel-subtitle">O valor Ã© a soma direta das linhas da disciplina. A participaÃ§Ã£o compara esse valor com toda a carteira filtrada; o R$/mÂ² usa somente os EVs da disciplina com Ã¡rea vÃ¡lida.</p></div><span class="tag">${disciplineRows.length} disciplinas</span></div>
      <div class="table-wrap"><table class="data-table strategic-discipline-table"><thead><tr><th>Disciplina</th><th class="numeric">Valor orÃ§ado</th><th class="numeric">% da carteira</th><th class="numeric">EVs</th><th class="numeric">Cobertura</th><th class="numeric">MÃ©dia por EV</th><th class="numeric">Mediana por EV</th><th class="numeric">R$/mÂ²</th></tr></thead><tbody>
        ${disciplineRows.map((row) => `<tr class="${row.discipline.id === strategicEVFilters.discipline ? "is-selected" : ""}"><td><button type="button" class="strategic-discipline-link" data-action="select-strategic-discipline" data-discipline-id="${escapeAttribute(row.discipline.id)}">${escapeAttribute(row.discipline.nome)}</button><small>ParticipaÃ§Ã£o tÃ­pica: ${number(row.benchmark.median, 1)}% Â· faixa central ${number(row.benchmark.p25, 1)}%â€“${number(row.benchmark.p75, 1)}%</small></td><td class="numeric"><strong>${moneyCents(row.total)}</strong></td><td class="numeric">${number(row.shareInEVs, 1)}%</td><td class="numeric">${number(row.count)}</td><td class="numeric">${number(row.coverage, 1)}%</td><td class="numeric">${moneyCents(row.average)}</td><td class="numeric">${moneyCents(row.medianValue)}</td><td class="numeric">${row.costM2 ? `${moneyCents(row.costM2)}/mÂ²` : "â€”"}</td></tr>`).join("") || `<tr><td colspan="8"><div class="empty-state">Nenhuma disciplina com valor no recorte.</div></td></tr>`}
      </tbody></table></div>
    </section>

    ${selectedDiscipline ? `<section class="panel strategic-discipline-detail">
      <div class="panel-header"><div><span class="eyebrow">Detalhamento da disciplina</span><h2>${escapeAttribute(selectedDiscipline.nome)}</h2><p class="panel-subtitle">Ranking dos EVs pelo valor previsto nesta disciplina. O percentual usa o valor total de cada EV como denominador.</p></div><button class="secondary-action" type="button" data-action="clear-strategic-discipline">Ver todas as disciplinas</button></div>
      <div class="strategic-detail-kpis"><article><span>Valor da disciplina</span><strong>${moneyCents(selectedDisciplineTotal)}</strong><small>${number(selectedDisciplineShare, 2)}% do total filtrado</small></article><article><span>EVs com a disciplina</span><strong>${number(records.length)}</strong><small>${number((records.length / Math.max(filterBase.length, 1)) * 100, 1)}% dos EVs de ano e tipologia</small></article><article><span>MÃ©dia por EV</span><strong>${moneyCents(selectedDisciplineRow?.average || 0)}</strong><small>Mediana ${moneyCents(selectedDisciplineRow?.medianValue || 0)}</small></article><article><span>Custo da disciplina por mÂ²</span><strong>${selectedDisciplineRow?.costM2 ? `${moneyCents(selectedDisciplineRow.costM2)}/mÂ²` : "Sem leitura"}</strong><small>MÃ©dia ponderada pela Ã¡rea vÃ¡lida</small></article></div>
      <div class="table-wrap"><table class="data-table strategic-project-ranking"><thead><tr><th>EV / obra</th><th>Ano</th><th>Tipologia</th><th class="numeric">Valor da disciplina</th><th class="numeric">% do EV</th><th class="numeric">Valor total do EV</th><th>AÃ§Ã£o</th></tr></thead><tbody>${[...records].sort((a, b) => disciplineValueFor(b) - disciplineValueFor(a)).slice(0, 20).map((record) => { const value = disciplineValueFor(record); const historical = record.sourceKind === "historical"; return `<tr><td><strong>${escapeAttribute(record.project)}</strong><small>${escapeAttribute(record.code || "Sem cÃ³digo")} Â· ${escapeAttribute(record.revision || "")}</small></td><td>${escapeAttribute(String(record.year || "â€”"))}</td><td>${escapeAttribute(record.typology || "NÃ£o informada")}</td><td class="numeric"><strong>${moneyCents(value)}</strong></td><td class="numeric">${record.total ? `${number((value / record.total) * 100, 2)}%` : "â€”"}</td><td class="numeric">${moneyCents(record.total)}</td><td><button class="secondary-action compact-action" type="button" data-action="${historical ? "edit-historical-ev" : "open-ev-modal"}" data-id="${escapeAttribute(historical ? record.id : record.workId)}">Abrir EV</button></td></tr>`; }).join("")}</tbody></table></div>
    </section>` : ""}

    <section class="strategic-analysis-grid">
      <article class="panel"><div class="panel-header"><div><span class="eyebrow">EvoluÃ§Ã£o histÃ³rica</span><h2>Investimento por ano</h2><p class="panel-subtitle">Valor total orÃ§ado e custo mÃ©dio ponderado por mÂ² em cada ano.</p></div></div><div class="strategic-analysis-bars">${renderStrategicBarRows(byYear, strategicEVFilters.discipline ? "disciplineTotal" : "total", strategicEVFilters.discipline ? selectedDisciplineTotal : totalValue)}</div></article>
      <article class="panel"><div class="panel-header"><div><span class="eyebrow">Perfil da carteira</span><h2>Investimento por tipologia</h2><p class="panel-subtitle">DistribuiÃ§Ã£o do orÃ§amento entre hospitais, clÃ­nicas, unidades administrativas e demais tipologias.</p></div></div><div class="strategic-analysis-bars">${renderStrategicBarRows(byTypology, strategicEVFilters.discipline ? "disciplineTotal" : "total", strategicEVFilters.discipline ? selectedDisciplineTotal : totalValue)}</div></article>
    </section>

    <section class="panel strategic-top-projects"><div class="panel-header"><div><span class="eyebrow">ConcentraÃ§Ã£o do investimento</span><h2>Maiores EVs do recorte</h2><p class="panel-subtitle">Ranking pelo valor total orÃ§ado para identificar onde a carteira estÃ¡ mais concentrada.</p></div></div><div class="strategic-top-projects-grid">${investmentRows.slice(0, 10).map((row, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeAttribute(row.record.project)}</strong><small>${escapeAttribute(String(row.record.year || "â€”"))} Â· ${escapeAttribute(row.record.typology || "NÃ£o informada")}</small></div><b>${moneyCents(row.valor)}</b><em>${number((row.valor / Math.max(totalValue, 1)) * 100, 1)}%</em></article>`).join("") || `<div class="empty-state">Sem EVs no recorte selecionado.</div>`}</div></section>

    <section class="panel strategic-portfolio-link">
      <div>
        <span class="eyebrow">Carteira detalhada</span>
        <h2>A lista Ãºnica de obras e EVs fica no PortfÃ³lio de Obras</h2>
        <p class="panel-subtitle">Abra o PortfÃ³lio para consultar todas as obras cadastradas e acessar visualizaÃ§Ã£o, ediÃ§Ã£o e reajuste por INCC de cada EV.</p>
      </div>
      <button class="primary-action" type="button" data-view="portfolio">Abrir carteira Ãºnica</button>
    </section>
  `;
}

function openEVReferenceTargetsModal() {
  const rows = effectiveStrategicCostTargets();
  modalRoot.innerHTML = globalThis.SLT_CLOUD.cleanHTML(`
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card ev-reference-modal" role="dialog" aria-modal="true" aria-labelledby="evReferenceTitle" data-modal-panel>
        <header class="modal-header">
          <div><span class="eyebrow">PREMISSAS DA SALA TÃ‰CNICA</span><h2 id="evReferenceTitle">Metas oficiais de custo por mÂ²</h2><p>Estas metas orientam os alertas da visÃ£o EstratÃ©gica e a validaÃ§Ã£o dos novos EVs.</p></div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">Ã—</button>
        </header>
        <div class="reference-guidance"><strong>ReferÃªncia corporativa, nÃ£o histÃ³rica</strong><span>Os dados histÃ³ricos apoiam a anÃ¡lise, mas os alertas abaixo sÃ£o calculados exclusivamente contra as metas definidas pela Sala TÃ©cnica.</span></div>
        <div class="table-wrap ev-reference-table-wrap">
          <table class="data-table ev-reference-table">
            <thead><tr><th>CLASSIFICAÃ‡ÃƒO DA META</th><th>LIMITE MÃNIMO (R$/MÂ²)</th><th>LIMITE MÃXIMO (R$/MÂ²)</th><th>REGRA ATUAL</th></tr></thead>
            <tbody>${rows.map((row) => `<tr><td><strong>${escapeAttribute(row.label)}</strong></td><td><input class="reference-target-input" type="number" min="0" step="1" data-target-id="${row.id}" data-target-field="targetMin" value="${row.targetMin || ""}" placeholder="Sem mÃ­nimo" aria-label="Limite mÃ­nimo de ${escapeAttribute(row.label)}"></td><td><input class="reference-target-input" type="number" min="0" step="1" data-target-id="${row.id}" data-target-field="targetMax" value="${row.targetMax || ""}" required aria-label="Limite mÃ¡ximo de ${escapeAttribute(row.label)}"></td><td><strong>${escapeAttribute(row.targetLabel)}</strong></td></tr>`).join("")}</tbody>
          </table>
        </div>
        <footer class="modal-actions"><button class="ghost-button" type="button" data-action="close-modal">Cancelar</button><button class="primary-action" type="button" data-action="save-ev-reference-targets">Salvar referÃªncias</button></footer>
      </section>
    </div>`);
}

async function saveEVReferenceTargets() {
  const targets = {};
  modalRoot.querySelectorAll("[data-target-id]").forEach((input) => {
    const value = Number(input.value) || 0;
    targets[input.dataset.targetId] = targets[input.dataset.targetId] || {};
    targets[input.dataset.targetId][input.dataset.targetField] = value;
  });
  const invalid = Object.entries(targets).find(([, target]) => !target.targetMax || (target.targetMin && target.targetMin > target.targetMax));
  if (invalid) {
    showToast("Revise as metas: o limite mÃ¡ximo Ã© obrigatÃ³rio e deve ser maior que o mÃ­nimo.");
    return;
  }
  state.strategicTargetOverrides = targets;
  if (!await saveState()) return false;
  closeModal();
  render();
  showToast("Metas de referÃªncia atualizadas. Alertas executivos recalculados.");
}

function demandDeliveryDelay(demand) {
  if (!demand.dataPrevistaEntrega || !demand.dataEntregaReal) return 0;
  return Math.max(daysBetween(demand.dataPrevistaEntrega, demand.dataEntregaReal), 0);
}

function demandHasRecordedValue(demand) {
  return demand?.valorGerado !== undefined && demand?.valorGerado !== null && String(demand.valorGerado).trim() !== "";
}

function demandRecordedValue(demand) {
  return demandHasRecordedValue(demand) ? Number(demand.valorGerado) || 0 : 0;
}

function demandProducedValue(demand) {
  return Math.abs(demandRecordedValue(demand));
}

function productionByAnalyst(demands = completedDemands()) {
  const map = new Map();
  demands.forEach((demand) => {
    const analyst = demand.analistaResponsavel || "NÃ£o informado";
    map.set(analyst, (map.get(analyst) || 0) + 1);
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function valueByAnalyst(demands = completedDemands()) {
  const map = new Map();
  demands.forEach((demand) => {
    const analyst = demand.analistaResponsavel || "NÃ£o informado";
    map.set(analyst, (map.get(analyst) || 0) + demandProducedValue(demand));
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function productionBySprint(demands = completedDemands()) {
  const map = new Map();
  demands.forEach((demand) => {
    const sprint = (state.sprints || []).find((item) => item.id === demand.sprintId);
    const label = sprint?.nome || "Sem sprint";
    map.set(label, (map.get(label) || 0) + 1);
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function demandCountByType(demands = state.demands) {
  const map = new Map();
  demands.forEach((demand) => {
    const label = demandTypeLabel(demand.tipo);
    map.set(label, (map.get(label) || 0) + 1);
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function topLabel(items) {
  return items[0] ? `${items[0].label} (${items[0].valor})` : "Sem dados";
}

function renderAnalystDetailTable(demands = []) {
  const scopedDemands = arrayOrFallback(demands);
  const analysts = analystsForDemands(scopedDemands)
    .map((analyst) => ({
      analyst,
      demands: scopedDemands.filter((demand) => normalizeSearchText(demand.analistaResponsavel) === normalizeSearchText(analyst)),
    }))
    .sort((a, b) => b.demands.length - a.demands.length || a.analyst.localeCompare(b.analyst, "pt-BR"));
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Analista</th>
            <th class="numeric">Total</th>
            <th class="numeric">ConcluÃ­das</th>
            <th class="numeric">No prazo</th>
            <th class="numeric">Atrasadas</th>
            <th class="numeric">% no prazo</th>
            <th class="numeric">Atraso mÃ©dio</th>
            <th class="numeric">Valor produzido</th>
            <th class="numeric">Em fluxo</th>
          </tr>
        </thead>
        <tbody>
          ${analysts.length ? analysts
            .map(({ analyst, demands: analystDemands }) => {
              const summary = managementDemandSummary(analystDemands);
              const assessed = summary.onTime.length + summary.late.length;
              const value = summary.completed.reduce((sum, demand) => sum + demandProducedValue(demand), 0);
              return `
                <tr>
                  <td><strong>${escapeAttribute(analyst)}</strong></td>
                  <td class="numeric">${analystDemands.length}</td>
                  <td class="numeric">${summary.completed.length}</td>
                  <td class="numeric">${summary.onTime.length}</td>
                  <td class="numeric">${summary.late.length}</td>
                  <td class="numeric">${assessed ? `${number((summary.onTime.length / assessed) * 100)}%` : "â€”"}</td>
                  <td class="numeric">${summary.late.length ? `${number(summary.averageDelay, 1)} d` : "â€”"}</td>
                  <td class="numeric">${money(value)}</td>
                  <td class="numeric">${summary.active.length}</td>
                </tr>
              `;
            })
            .join("") : `<tr><td colspan="9" class="empty-cell">Nenhum analista responsÃ¡vel nas demandas deste filtro.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function isStrategicWork(work) {
  const text = `${work.classificacaoObra} ${work.tipologiaObra} ${work.nome}`.toLowerCase();
  return text.includes("estratÃ©g") || text.includes("expans") || text.includes("vertical");
}

function isNewUnit(work) {
  const text = `${work.classificacaoObra} ${work.tipologiaObra} ${work.nome}`.toLowerCase();
  return text.includes("nova") || text.includes("novo");
}

function investmentRankingRows() {
  return budgetWorks()
    .map((work) => {
      const values = workTotals(work);
      return { work, valor: values.orcado + values.aditivado };
    })
    .sort((a, b) => b.valor - a.valor);
}

function openInvestmentDetailModal(workId) {
  const work = workById(workId);
  if (!work) return;
  const totals = workTotals(work);
  const total = totals.orcado + totals.aditivado;
  const rows = (work.ev.lines || [])
    .filter((line) => !isRiskLine(line))
    .map((line) => {
      const discipline = disciplineById(line.disciplinaId);
      const values = lineTotals(work, line);
      const value = values.orcado + values.aditivado;
      return {
        discipline,
        status: line.status,
        value,
        percent: (value / Math.max(total, 1)) * 100,
        unit: work.areaEquivalente ? value / work.areaEquivalente : 0,
      };
    })
    .sort((a, b) => b.value - a.value);
  if (!rows.length && plannedWorkValue(work) > 0) {
    rows.push({
      discipline: { id: "capex-aprovado", nome: "CAPEX aprovado sem decomposiÃ§Ã£o no EV" },
      status: "Estimado",
      value: plannedWorkValue(work),
      percent: 100,
      unit: work.areaEquivalente ? plannedWorkValue(work) / work.areaEquivalente : 0,
    });
  }
  const foundation = rows.find((row) => row.discipline.id === "fundacoes-e-contencoes");
  const targetReading = strategicCostReadingForWork(work);
  modalRoot.innerHTML = globalThis.SLT_CLOUD.cleanHTML(`
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card" aria-labelledby="investmentTitle">
        <header>
          <div>
            <span class="eyebrow">ComposiÃ§Ã£o do investimento</span>
            <h2 id="investmentTitle">${work.nome}</h2>
            <p class="muted">${work.regiao} | ${work.tipoUnidade} | ${work.cidade}/${work.uf}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">Ã—</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${splitItem("Investimento total", money(total))}
            ${splitItem("FundaÃ§Ã£o", foundation ? `${number(foundation.percent, 1)}%` : "N/A")}
            ${splitItem("Ãrea equivalente", `${number(work.areaEquivalente)} mÂ²`)}
            ${splitItem("Custo por mÂ²", work.areaEquivalente ? `${money(total / work.areaEquivalente)}/mÂ²` : "â€”")}
            ${splitItem("Meta SLT", targetReading.target?.targetLabel || "Sem meta por tipologia")}
            ${splitItem("AderÃªncia", targetReading.status)}
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th class="numeric">Valor</th>
                  <th class="numeric">% do EV</th>
                  <th class="numeric">R$/mÂ²</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (row) => `
                      <tr>
                        <td><strong>${row.discipline.nome}</strong></td>
                        <td class="numeric">${money(row.value)}</td>
                        <td class="numeric">${number(row.percent, 1)}%</td>
                        <td class="numeric">${row.unit ? money(row.unit) : "â€”"}</td>
                        <td><span class="status-pill" data-status="${normalizeEVLineStatus(row.status)}">${normalizeEVLineStatus(row.status)}</span></td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
        <footer class="modal-actions">
          <button class="primary-action" type="button" data-action="open-work-ev" data-id="${work.id}">Abrir EV</button>
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
        </footer>
      </section>
    </div>
  `);
}

function renderPortfolio() {
  const allRows = portfolioRows(false, false);
  const rows = sortPortfolioRows(portfolioRows(true, false));
  const evCount = evUnifiedRecords().length;
  const worksWithEVCount = rows.filter((row) => row.hasAssociatedEV).length;
  const worksWithEVLabel = worksWithEVCount === 1
    ? "1 obra possui EV associado"
    : `${worksWithEVCount} obras possuem EVs associados`;

  return `
    ${renderWorksToolbar("portfolio", "PortfÃ³lio de Obras e EVs", `${allRows.length} obras cadastradas e ${evCount} EVs vinculados em uma Ãºnica visÃ£o`, `
      <span class="tag">${allRows.length} obras cadastradas</span>
      <button class="primary-action" type="button" data-action="open-work">+ Nova obra</button>
    `)}

    <section class="kpi-grid portfolio-kpis">
      ${kpi("Obras no portfÃ³lio", String(rows.length), worksWithEVLabel, "blue")}
    </section>

    <section class="panel portfolio-panel">
      <div class="panel-heading">
        <div>
          <h2>Carteira oficial de obras e EVs</h2>
          <p class="panel-subtitle">Cada linha corresponde a uma obra cadastrada; o EV aparece quando jÃ¡ estiver vinculado.</p>
        </div>
      </div>
      ${renderPortfolioFilters(allRows)}
      ${renderPortfolioTable(rows)}
    </section>
    ${renderSLTCalculator()}
  `;
}

function portfolioFilterOptions(rows, field, selected, allLabel, configuredValues = null) {
  const sourceValues = configuredValues || rows.map((row) => row[field]);
  const values = [...new Set(sourceValues.filter((value) => value !== "" && value !== null && value !== undefined))];
  if (!configuredValues) values.sort((left, right) => String(left).localeCompare(String(right), "pt-BR", { numeric: true }));
  return `<option value="">${allLabel}</option>${values
    .map((value) => `<option value="${escapeAttribute(value)}" ${String(value) === String(selected) ? "selected" : ""}>${escapeAttribute(value)}</option>`)
    .join("")}`;
}

function renderPortfolioFilters(rows) {
  return `
    <div class="portfolio-filter-bar">
      <label class="field portfolio-search-field">
        <span>Buscar obra</span>
        <input data-portfolio-search value="${escapeAttribute(portfolioQuickFilters.query)}" placeholder="Nome, cÃ³digo, cidade ou regiÃ£o..." />
      </label>
      <label class="field"><span>Ano</span><select data-portfolio-quick-filter="year">${portfolioFilterOptions(rows, "year", portfolioQuickFilters.year, "Todos os anos", configurationLabels("year"))}</select></label>
      <label class="field"><span>Categoria</span><select data-portfolio-quick-filter="categoria">${portfolioFilterOptions(rows, "categoria", portfolioQuickFilters.categoria, "Todas", configurationLabels("category"))}</select></label>
      <label class="field"><span>Tipo</span><select data-portfolio-quick-filter="tipoUnidade">${portfolioFilterOptions(rows, "tipoUnidade", portfolioQuickFilters.tipoUnidade, "Todos")}</select></label>
      <label class="field"><span>Tipologia</span><select data-portfolio-quick-filter="tipologia">${portfolioFilterOptions(rows, "tipologia", portfolioQuickFilters.tipologia, "Todas", configurationLabels("typology"))}</select></label>
      <label class="field"><span>RegiÃ£o</span><select data-portfolio-quick-filter="regional">${portfolioFilterOptions(rows, "regional", portfolioQuickFilters.regional, "Todas", configurationLabels("region"))}</select></label>
      <label class="field"><span>UF</span><select data-portfolio-quick-filter="uf">${portfolioFilterOptions(rows, "uf", portfolioQuickFilters.uf, "Todas", configurationLabels("state"))}</select></label>
      <label class="field"><span>Status do EV</span><select data-portfolio-quick-filter="evStatus">${portfolioFilterOptions(rows, "evStatus", portfolioQuickFilters.evStatus, "Todos", EV_LIFECYCLE_STATUSES)}</select></label>
      <button class="secondary-action" type="button" data-action="clear-portfolio-filters">Limpar filtros</button>
    </div>
  `;
}

const workNameAcronyms = new Set([
  ...baseStates.map(([code]) => code),
  "HTL", "HS", "HO", "TEA", "HC", "HAP", "PA", "NTE", "NTO", "AME", "CD",
  "EV", "SIC", "SPDA", "UTI", "UPA", "UBS", "CDI", "CME", "CTI", "UCI", "SADT",
  "CCIH", "AVCB", "PPCI", "PPC", "AVC", "HVAC", "CEO", "CER", "CAPS", "PS", "PSF",
  "RH", "TI", "IT", "ADM", "NDI", "NIR", "NHE", "SAMU", "SUS", "RNM", "RM", "TC", "RX",
  "USG", "ECG", "EEG", "RFT", "AMP", "RFA", "NVU", "CC", "VISA", "NL", "MP", "VS",
  "NTH", "ABA", "ETE", "SND", "ABC", "BH", "CB", "CCG", "CMD", "CQV", "FUSAM",
  "GLP", "HB", "HCOR", "HIABC", "IMESA", "IPSA", "PPP", "PROMED", "RPA", "SAD", "SEALM",
  "SEMED", "SF", "UA", "UASA", "VI", "ELO", "GMD", "SCI", "CLI", "STR", "SUB",
]);
const workNameLowercaseWords = new Set(["a", "as", "com", "de", "da", "das", "do", "dos", "e", "em", "o", "os", "para", "por", "sem"]);
const workNameBrandCasing = new Map([
  ["HAPNATAL", "HapNatal"],
  ["HAPFOR", "HapFor"],
]);

function portfolioWorkDisplayCode(row) {
  const explicitCode = String(row?.codigo || row?.codigoOriginal || "").trim().replace(/[.\s]+$/g, "");
  if (explicitCode && !/^(undefined|null)$/i.test(explicitCode)) return explicitCode;
  const embeddedCode = String(row?.nome || "").match(/^\s*(\d{1,10})\s*\.\s*/)?.[1];
  return embeddedCode || "0000";
}

function titleCaseWorkNamePart(part, sourceWasAllUpper) {
  const coreMatch = String(part).match(/[0-9\p{L}]+(?:['â€™][0-9\p{L}]+)*/u);
  if (!coreMatch) return part;
  const core = coreMatch[0];
  const prefix = part.slice(0, coreMatch.index);
  const suffix = part.slice(coreMatch.index + core.length);
  const lower = core.toLocaleLowerCase("pt-BR");
  const upper = core.toLocaleUpperCase("pt-BR");
  if (workNameBrandCasing.has(upper)) return `${prefix}${workNameBrandCasing.get(upper)}${suffix}`;
  if (workNameLowercaseWords.has(lower)) return `${prefix}${lower}${suffix}`;
  const intentionallyUpper = !sourceWasAllUpper && core === upper && core !== lower && core.length <= 6;
  if (workNameAcronyms.has(upper) || intentionallyUpper || /\d/.test(core) && core === upper) {
    return `${prefix}${upper}${suffix}`;
  }
  const titled = lower.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("pt-BR"));
  return `${prefix}${titled}${suffix}`;
}

function portfolioWorkDisplayName(row) {
  let name = String(row?.nome || "").replace(/^\s*\d{1,10}\s*\.\s*/, "").trim();
  const suffix = name.match(/\s*-\s*([A-Za-z]{2})\s*$/);
  const rowUf = canonicalStateCode(row?.uf);
  if (suffix && rowUf && suffix[1].toUpperCase() === rowUf) name = name.slice(0, suffix.index).trim();
  const letters = name.replace(/[^\p{L}]/gu, "");
  const sourceWasAllUpper = Boolean(letters) && letters === letters.toLocaleUpperCase("pt-BR");
  return name
    .split(/(\s+|\/|-)/)
    .map((part) => /^(\s+|\/|-)$/.test(part) ? part : titleCaseWorkNamePart(part, sourceWasAllUpper))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function workDisplayLabel(row) {
  const name = portfolioWorkDisplayName(row);
  if (!name) return `${portfolioWorkDisplayCode(row)}. Obra sem nome`;
  return `${portfolioWorkDisplayCode(row)}. ${name}`;
}

function portfolioSortValue(row, key) {
  if (key === "codigo") return portfolioWorkDisplayCode(row);
  if (key === "nome") return portfolioWorkDisplayName(row);
  if (key === "uf") return row.uf || "";
  if (key === "regional") return row.regional || "";
  if (key === "year") return Number(row.year || 0);
  if (key === "tipologia") return row.tipologia || "";
  if (key === "categoria") return row.categoria || "";
  if (key === "areaEquivalente") return Number(row.areaEquivalente || 0);
  if (key === "capex") return Number(row.capex || 0);
  if (key === "custoM2") return Number(row.custoM2 || 0);
  return "";
}

function comparePortfolioValues(left, right) {
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left || "").localeCompare(String(right || ""), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

function sortPortfolioRows(rows) {
  const { key, direction } = portfolioSort;
  const factor = direction === "asc" ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((leftItem, rightItem) => {
      const left = leftItem.row;
      const right = rightItem.row;
      const primary = comparePortfolioValues(
        portfolioSortValue(left, key),
        portfolioSortValue(right, key)
      );
      if (primary) return primary * factor;

      // OrdenaÃ§Ã£o inicial e desempate oficial: ano mais recente e cÃ³digo maior primeiro.
      if (key !== "year") {
        const yearTie = comparePortfolioValues(Number(left.year || 0), Number(right.year || 0));
        if (yearTie) return yearTie * -1;
      }
      if (key !== "codigo") {
        const codeTie = comparePortfolioValues(portfolioWorkDisplayCode(left), portfolioWorkDisplayCode(right));
        if (codeTie) return codeTie * -1;
      }
      return leftItem.index - rightItem.index;
    })
    .map(({ row }) => row);
}

function portfolioSortHeader(label, key, { numeric = false } = {}) {
  const active = portfolioSort.key === key;
  const arrow = active ? (portfolioSort.direction === "asc" ? "â–²" : "â–¼") : "â†•";
  const ariaSort = active ? (portfolioSort.direction === "asc" ? "ascending" : "descending") : "none";
  return `
    <th class="${numeric ? "numeric " : ""}portfolio-sort-th" aria-sort="${ariaSort}">
      <button class="portfolio-sort-button" type="button" data-action="sort-portfolio" data-sort-key="${key}" title="Ordenar por ${escapeAttribute(label)}">
        <span>${label}</span><i aria-hidden="true">${arrow}</i>
      </button>
    </th>
  `;
}

function renderPortfolioTable(rows) {
  return `
    <div class="portfolio-table-scroll-shell">
      ${renderKanbanTopScrollbar("Rolagem horizontal da carteira de obras")}
      <div class="table-wrap portfolio-plan-table-wrap portfolio-works-scroll" data-kanban-scroll-board>
      <table class="data-table portfolio-table portfolio-works-table" data-no-sort>
        <thead>
          <tr>
            ${portfolioSortHeader("CÃ³digo", "codigo")}
            ${portfolioSortHeader("Nome da obra", "nome")}
            ${portfolioSortHeader("Estado", "uf")}
            ${portfolioSortHeader("RegiÃ£o", "regional")}
            ${portfolioSortHeader("Ano", "year")}
            ${portfolioSortHeader("Tipologia", "tipologia")}
            ${portfolioSortHeader("Categoria", "categoria")}
            ${portfolioSortHeader("Ãrea equivalente (mÂ²)", "areaEquivalente", { numeric: true })}
            ${portfolioSortHeader("Total orÃ§ado (sem taxa de risco)", "capex", { numeric: true })}
            ${portfolioSortHeader("Custo por mÂ² (sem taxa de risco)", "custoM2", { numeric: true })}
            <th>AÃ§Ãµes</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => {
            const displayCode = portfolioWorkDisplayCode(row);
            const displayName = portfolioWorkDisplayName(row);
            return `
            <tr class="portfolio-work-row" data-action="open-portfolio-work" data-id="${escapeAttribute(row.id)}" tabindex="0" title="Clique para editar a obra">
              <td><strong>${escapeAttribute(displayCode)}</strong></td>
              <td><strong>${escapeAttribute(displayCode)}. ${escapeAttribute(displayName)}</strong></td>
              <td>${escapeAttribute(row.uf || "")}</td>
              <td>${escapeAttribute(row.regional || "")}</td>
              <td>${escapeAttribute(row.year || "")}</td>
              <td>${escapeAttribute(row.tipologia || "")}</td>
              <td>${escapeAttribute(row.categoria || "")}</td>
              <td class="numeric">${row.areaEquivalente ? number(row.areaEquivalente, 2) : ""}</td>
              <td class="numeric">${row.hasAssociatedEV ? `<strong>${moneyCents(row.capex)}</strong>` : ""}</td>
              <td class="numeric">${row.custoM2 === null ? "" : `<strong>${moneyCents(row.custoM2)}</strong>`}</td>
              <td><div class="table-actions portfolio-actions">
                <button class="primary-action compact-action" type="button" data-action="${row.isHistorical ? "edit-historical-ev" : "open-ev-modal"}" data-id="${escapeAttribute(row.openId)}">${row.hasAssociatedEV ? "Abrir EV" : "Criar EV"}</button>
              </div></td>
            </tr>
          `;
          }).join("") || `<tr><td colspan="11"><div class="empty-state">Nenhuma obra encontrada com os filtros selecionados.</div></td></tr>`}
        </tbody>
      </table>
      </div>
    </div>
  `;
}

function openPortfolioWorkEditor(workId) {
  const row = portfolioRows(false, false).find((item) => item.id === workId);
  if (!row) return;
  const registeredWork = state.works.find((work) => work.id === row.id);
  workModalReturnMode = "";
  workModalPlanDraft = null;
  if (registeredWork) {
    openWorkModal(registeredWork.id);
    return;
  }
  openWorkModal("", { historicalRecordId: row.openId });
}

function renderPortfolioInvestmentPlanTable(rows) {
  return `
    <div class="table-wrap portfolio-plan-table-wrap">
      <table class="data-table portfolio-table portfolio-plan-table">
        <thead>
          <tr>
            <th>Nome da obra (Plano)</th>
            <th>CÃ³d. Obra</th>
            <th>Tipo</th>
            <th>Cidade / UF</th>
            <th>RegiÃ£o</th>
            <th>Etapa</th>
            <th class="numeric">SLA</th>
            <th>TÃ©rmino Projeto</th>
            <th>InÃ­cio OrÃ§amentaÃ§Ã£o</th>
            <th>ClassificaÃ§Ã£o</th>
            <th>Tipologia</th>
            <th class="numeric">Ãrea Eq. (mÂ²)</th>
            <th>SAP</th>
            <th>EV</th>
            <th>AÃ§Ãµes</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows
              .map((row) => {
                const work = workById(row.obraId);
                const canBudget = row.isProject && row.inicioOrcamentacao && work;
                const planName = work?.nome || row.obra || "Obra sem nome";
                const planReference =
                  work?.nome && row.obra && normalizeSearchText(work.nome) !== normalizeSearchText(row.obra)
                    ? `Plano: ${row.obra}`
                    : row.chaveEtapa || "Plano de Investimento 2026";
                const cityUf = `${work?.cidade || row.praca || "â€”"}/${work?.uf || row.uf || "â€”"}`;
                const prazo = work?.prazoDias || (work ? plannedDurationForWork(work) : "") || row.slaDias || "â€”";
                return `
                  <tr>
                    <td>
                      <strong>${escapeAttribute(planName)}</strong>
                      <br /><span class="muted">${escapeAttribute(planReference)}</span>
                    </td>
                    <td>${work ? `<strong>${escapeAttribute(work.codigoOriginal || "0000")}</strong>` : `<span class="status-pill" data-status="Pendente">Sem cadastro</span>`}</td>
                    <td>${escapeAttribute(work?.tipoUnidade || row.tipoUnidade || "â€”")}</td>
                    <td>${escapeAttribute(cityUf)}</td>
                    <td>${escapeAttribute(work?.regiao || row.regiao || "â€”")}</td>
                    <td><span class="tag">${escapeAttribute(row.etapa || "â€”")}</span></td>
                    <td class="numeric">${row.slaDias ?? "â€”"}</td>
                    <td><strong>${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "â€”"}</strong><br /><span class="status-pill" data-status="${row.statusInfo.tone}">${row.statusInfo.label}</span></td>
                    <td>${row.inicioOrcamentacao ? `<strong>${dateText(row.inicioOrcamentacao)}</strong><br /><span class="muted">apÃ³s Projetos</span>` : "â€”"}</td>
                    <td>${escapeAttribute(work?.classificacaoObra || row.classificacaoObra || "â€”")}</td>
                    <td>${escapeAttribute(work?.tipologiaObra || row.tipologiaObra || "â€”")}</td>
                    <td class="numeric">${work?.areaEquivalente ? number(work.areaEquivalente) : "â€“"}</td>
                    <td>${escapeAttribute(work?.ordemInternaSAP || "â€”")}</td>
                    <td>${work ? `<span class="status-pill" data-status="${effectiveEVStatus(work)}">${effectiveEVStatus(work)}</span>` : `<span class="status-pill" data-status="Sem EV">Sem EV</span>`}</td>
                    <td>
                      <div class="table-actions portfolio-actions">
                        ${work ? `<button class="secondary-action compact-action" type="button" data-action="open-ev-modal" data-id="${work.id}">${effectiveEVStatus(work) === "Sem EV" ? "Criar EV" : "Abrir EV"}</button>` : ""}
                        ${canBudget ? `<button class="ghost-button compact-action" type="button" data-action="start-budget-from-plan" data-row="${row.row}">Enviar para Obras</button>` : ""}
                        ${work ? `<button class="ghost-button compact-action" type="button" data-action="edit-work" data-id="${work.id}">Editar</button>` : `<button class="secondary-action compact-action" type="button" data-action="open-work-from-plan" data-row="${row.row}">Cadastrar</button>`}
                      </div>
                    </td>
                  </tr>
                `;
              })
              .join("") || `<tr><td colspan="15"><div class="empty-state">Nenhum registro encontrado no Plano de Investimento 2026.</div></td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function portfolioRows(applySearch = false, applyColumnFilters = true) {
  const milestones = ["EV aprovado", "OrÃ§amento executivo", "ContrataÃ§Ã£o", "InÃ­cio de obra", "Entrega tÃ©cnica"];
  const works = budgetWorks();
  const rows = works.map((work, index) => {
    const historicalRecord = work._historicalBudgetWork
      ? arrayOrFallback(state.evs).find((record) => record.id === work.historicalRecordId)
      : null;
    const totals = workTotals(work, { excludeRisk: true });
    const capex = totals.orcado + totals.aditivado;
    const saldoRatio = totals.saldo / Math.max(capex, 1);
    const latestVersion = arrayOrFallback(work.ev?.versions).at(-1);
    const year = String(work.anoObra || historicalRecord?.year || latestVersion?.data || "").slice(0, 4);
    const tipologia = canonicalWorkTypology(work.tipologiaObra);
    const uf = canonicalStateCode(work.uf || ufFromWorkName(work.nome));
    const regional = String(work.regiao || regionFromUf(uf) || "").trim();
    const areaEquivalente = Number(work.areaEquivalente || 0);
    const hasAssociatedEV = Boolean(work._historicalBudgetWork || (work.ev && !work.ev._virtualEmptyEV));
    return {
      id: work.id,
      idApp: work.chaveUnica,
      codigo: work.codigoOriginal,
      nome: work.nome,
      regional,
      uf,
      cidadeUf: [work.cidade, uf].filter(Boolean).join(" / "),
      tipoUnidade: work.tipoUnidade,
      tipologia,
      classificacao: canonicalWorkCategory(work.classificacaoObra),
      categoria: canonicalWorkCategory(work.classificacaoObra),
      year,
      tecnico: historicalRecord?.technician || "",
      isHistorical: Boolean(work._historicalBudgetWork),
      hasAssociatedEV,
      evInitial: hasAssociatedEV ? totals.orcado : null,
      evAdditives: hasAssociatedEV ? totals.aditivado : null,
      evUpdated: hasAssociatedEV ? capex : null,
      openId: work._historicalBudgetWork ? work.historicalRecordId : work.id,
      evId: work.ev.id || (work._historicalBudgetWork ? work.historicalRecordId : `EV-${work.id}`),
      prazo: work.prazoDias || plannedDurationForWork(work),
      areaEquivalente,
      areaConstruida: work.areaConstruida || 0,
      sap: work.ordemInternaSAP || "â€”",
      cnpj: work.cnpj || "",
      endereco: work.endereco || "",
      status: work.status,
      evStatus: effectiveEVStatus(work),
      capex,
      custoM2: hasAssociatedEV && areaEquivalente > 0 ? capex / areaEquivalente : null,
      contratado: totals.contratado,
      saldo: totals.saldo,
      proximoMarco: milestones[index % milestones.length],
      marcoStatus: index === 0 || effectiveEVStatus(work) === "Incompleto" ? "PrÃ³ximo" : "Planejado",
      risco: saldoRatio < 0.18 ? "Alto" : effectiveEVStatus(work) === "Incompleto" ? "MÃ©dio" : "Baixo",
    };
  });
  const quickFiltered = applySearch ? rows.filter(portfolioRowMatchesQuickFilters) : rows;
  return applyColumnFilters ? quickFiltered.filter(portfolioRowMatchesFilters) : quickFiltered;
}

function portfolioRowMatchesQuickFilters(row) {
  const terms = normalizeSearchText([searchTerm, portfolioQuickFilters.query].filter(Boolean).join(" ")).trim();
  const searchable = normalizeSearchText([
    row.idApp, row.codigo, row.nome, row.cidadeUf, row.regional, row.uf, row.tipoUnidade,
    row.tipologia, row.categoria, row.year, row.evStatus,
  ].join(" "));
  if (terms && !terms.split(/\s+/).every((term) => searchable.includes(term))) return false;
  return ["year", "categoria", "tipoUnidade", "tipologia", "regional", "uf", "evStatus"]
    .every((field) => !portfolioQuickFilters[field] || String(row[field]) === String(portfolioQuickFilters[field]));
}

function portfolioRowMatchesFilters(row) {
  return Object.entries(portfolioFilters).every(([field, value]) => {
    if (!value) return true;
    const raw = field === "capex" ? `${row.capex} ${money(row.capex)}` : row[field];
    return normalizeSearchText(raw).includes(normalizeSearchText(value).trim());
  });
}

function plannedDurationForWork(work) {
  const relatedDemands = state.demands.filter((demand) => demand.obraId === work.id && demand.dataPrevistaInicio && demand.dataPrevistaEntrega);
  if (!relatedDemands.length) return "â€”";
  return Math.max(...relatedDemands.map((demand) => Math.max(daysBetween(demand.dataPrevistaInicio, demand.dataPrevistaEntrega), 1)));
}

function workSearchText(work) {
  const text = [
    work.chaveUnica,
    work.codigoOriginal,
    work.nome,
    work.unidadeNome,
    work.unidadeCnpj,
    work.unidadeCentro,
    work.tipoUnidade,
    work.cidade,
    work.uf,
    work.regiao,
    work.classificacaoObra,
    work.tipologiaObra,
    work.ordemInternaSAP,
  ]
    .join(" ");
  return normalizeSearchText(text);
}

function isInvestmentPlanCurrentYear(record) {
  const plannedYear = String(record.anoTerminoPlanejado || "").trim();
  if (plannedYear) return plannedYear === INVESTMENT_PLAN_YEAR;
  return String(record.terminoPlanejado || "").startsWith(`${INVESTMENT_PLAN_YEAR}-`);
}

function investmentPlanRecords() {
  return (state.investmentPlan?.records || []).filter(isInvestmentPlanCurrentYear);
}

function normalizedPlanRegion(value) {
  const region = cleanImportedText(value);
  const map = {
    N: "Norte",
    NE: "Nordeste",
    CO: "Centro Oeste",
    SE: "Sudeste",
    S: "Sul",
  };
  return map[region.toUpperCase()] || region;
}

function addDaysISO(value, days) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isPlanProject(record) {
  return normalizeSearchText(record.etapa) === "projetos";
}

function planWorkMatch(record, workIndex = null) {
  const planName = normalizeSearchText(record.obra);
  const index = workIndex || state.works.map((work) => ({
    work,
    workName: normalizeSearchText(work.nome),
    workKey: normalizeSearchText(work.chaveUnica),
  }));
  const match = index.find(({ workName, workKey }) => {
    return workName === planName || workName.includes(planName) || planName.includes(workName) || workKey.includes(planName);
  });
  return match?.work || null;
}

function planRecordSearchText(row) {
  return normalizeSearchText([
    row.obra,
    row.chaveEtapa,
    row.tipoUnidade,
    row.praca,
    row.uf,
    row.regiao,
    row.etapa,
    row.status,
    row.classificacaoObra,
    row.tipologiaObra,
    row.tipoDemandaLabel,
    row.solicitante,
    row.orgaoRegulador,
    row.observacoes,
  ].join(" "));
}

function planDeliveryStatus(row) {
  const normalizedStatus = normalizeSearchText(row.status);
  if (normalizedStatus.includes("cancel")) return { label: "Cancelada", tone: "Cancelada" };
  if (normalizedStatus.includes("nao se aplica")) return { label: "NÃ£o se aplica", tone: "Rascunho" };
  if (row.terminoReal) {
    const late = row.terminoPlanejado && row.terminoReal > row.terminoPlanejado;
    return { label: late ? "Entregue com atraso" : "Entregue", tone: late ? "Atrasada" : "Completo" };
  }
  if (row.terminoPlanejado && row.terminoPlanejado < todayISO()) return { label: "Projeto atrasado", tone: "Saldo crÃ­tico" };
  if (row.terminoPlanejado && daysBetween(todayISO(), row.terminoPlanejado) <= 30) return { label: "PrÃ³ximo", tone: "Pendente" };
  return { label: row.status || "Planejado", tone: "Aguardando" };
}

function manualInvestmentPlanRows(planRows = []) {
  const linkedWorkIds = new Set(planRows.map((row) => row.obraId).filter(Boolean));
  const planNames = new Set(planRows.map((row) => normalizeSearchText(row.obra)).filter(Boolean));
  const manualOiWorkIds = new Set((state.capexManualOiRows || []).map((row) => row.workId).filter(Boolean));

  return state.works
    .filter((work) => {
      if (!work || linkedWorkIds.has(work.id)) return false;
      const workName = normalizeSearchText(work.nome);
      const hasManualFinancialLink =
        Number(work.valorVerbaAportada || work.valorEstimado || 0) > 0 ||
        Boolean(work.tipoVerba || work.origemVerba) ||
        manualOiWorkIds.has(work.id);
      return hasManualFinancialLink && (!workName || !planNames.has(workName));
    })
    .map((work) => ({
      row: `manual-${work.id}`,
      registro: work.codigoOriginal || work.ordemInternaSAP || "0000",
      obra: work.nome || "Obra sem nome",
      chaveEtapa: "Cadastro SLT 360",
      tipoUnidade: work.tipoUnidade || "",
      praca: work.cidade || "",
      uf: work.uf || "",
      regiao: work.regiao || "",
      etapa: "Projetos",
      status: "Cadastro SLT 360",
      classificacaoObra: canonicalWorkCategory(work.classificacaoObra),
      tipologiaObra: canonicalWorkTypology(work.tipologiaObra),
      observacoes: "Obra cadastrada diretamente no SLT 360 e integrada ao Controle de Verbas.",
      slaDias: work.prazoDias || "",
      inicioPlanejado: "",
      terminoPlanejado: "",
      terminoReal: "",
      obraId: work.id,
      obraPortfolio: work.nome || "",
      isProject: false,
      isManualPortfolio: true,
      inicioOrcamentacao: "",
      statusInfo: { label: "Cadastro SLT 360", tone: "Aguardando" },
    }));
}

function investmentPlanRows(applyFilters = true) {
  const terms = normalizeSearchText([searchTerm, investmentPlanFilters.query].filter(Boolean).join(" ")).split(/\s+/).filter(Boolean);
  const workIndex = state.works.map((work) => ({
    work,
    workName: normalizeSearchText(work.nome),
    workKey: normalizeSearchText(work.chaveUnica),
  }));
  const planRows = investmentPlanRecords()
    .map((record) => {
      const work = planWorkMatch(record, workIndex);
      const regiao = normalizedPlanRegion(record.regiao);
      const statusInfo = planDeliveryStatus(record);
      return {
        ...record,
        regiao,
        obraId: work?.id || "",
        obraPortfolio: work?.nome || "",
        isProject: isPlanProject(record),
        statusInfo,
        inicioOrcamentacao: isPlanProject(record) ? addDaysISO(record.terminoPlanejado, 1) : "",
      };
    });
  const rows = [...planRows, ...manualInvestmentPlanRows(planRows)]
    .sort((a, b) => {
      if (a.isManualPortfolio !== b.isManualPortfolio) return a.isManualPortfolio ? -1 : 1;
      const aDate = a.terminoPlanejado || "9999-12-31";
      const bDate = b.terminoPlanejado || "9999-12-31";
      return aDate.localeCompare(bDate) || a.obra.localeCompare(b.obra);
    });

  if (!applyFilters) return rows;

  return rows.filter((row) => {
    if (investmentPlanFilters.etapa && row.etapa !== investmentPlanFilters.etapa) return false;
    if (investmentPlanFilters.status && row.status !== investmentPlanFilters.status) return false;
    if (investmentPlanFilters.regiao && row.regiao !== investmentPlanFilters.regiao) return false;
    if (investmentPlanFilters.dateFrom && (!row.terminoPlanejado || row.terminoPlanejado < investmentPlanFilters.dateFrom)) return false;
    if (investmentPlanFilters.dateTo && (!row.terminoPlanejado || row.terminoPlanejado > investmentPlanFilters.dateTo)) return false;
    if (terms.length && !terms.every((term) => planRecordSearchText(row).includes(term))) return false;
    return true;
  });
}

function renderInvestmentPlanFilters(allRows) {
  const etapas = [...new Set(allRows.map((row) => row.etapa).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const status = [...new Set(allRows.map((row) => row.status).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const regioes = [...new Set(allRows.map((row) => row.regiao).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return `
    <div class="investment-filter-bar">
      <label class="field investment-search-field">
        <span>Buscar no plano</span>
        <input data-investment-plan-search value="${escapeAttribute(investmentPlanFilters.query)}" placeholder="Buscar por obra, etapa, cidade, UF, status ou observaÃ§Ã£o..." />
      </label>
      <label class="field">
        <span>Etapa</span>
        <select data-investment-plan-filter="etapa">
          <option value="">Todas</option>
          ${etapas.map((value) => `<option value="${escapeAttribute(value)}" ${investmentPlanFilters.etapa === value ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span>Status</span>
        <select data-investment-plan-filter="status">
          <option value="">Todos</option>
          ${status.map((value) => `<option value="${escapeAttribute(value)}" ${investmentPlanFilters.status === value ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span>RegiÃ£o</span>
        <select data-investment-plan-filter="regiao">
          <option value="">Todas</option>
          ${regioes.map((value) => `<option value="${escapeAttribute(value)}" ${investmentPlanFilters.regiao === value ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span>Projeto de</span>
        <input type="date" data-investment-plan-filter="dateFrom" vaßŽüã†òµë(š+myÒf–ÆÃ¢fÇ6RÀ¢&÷&FW%v–GFƒ¢2À¢ö–çE&F—W3¢BÀ¢ÒÀ¢°¢Æ&VÃ¢%&VÆ—¦FòÆæV¦Fò"À¢FF¢&÷w2æÖ‚‡&÷r’Óâ&÷rç&VÆ—¦FõÆæV¦Fô7V×VÆFò’À¢&÷&FW$6öÆ÷#¢"3„cT"À¢&6¶w&÷VæD6öÆ÷#¢'&v&ƒÃC2Ã“Âã‚’"À¢FVç6–öã¢ã3RÀ¢f–ÆÃ¢fÇ6RÀ¢&÷&FW%v–GFƒ¢2À¢ö–çE&F—W3¢BÀ¢ÒÀ¢°¢Æ&VÃ¢%&VÆ—¦FòF÷FÂ"À¢FF¢&÷w2æÖ‚‡&÷r’Óâ&÷rç&VÆ—¦FõF÷FÄ7V×VÆFò’À¢&÷&FW$6öÆ÷#¢"4dcƒs""À¢&6¶w&÷VæD6öÆ÷#¢'&v&ƒ#SRÃ3RÃ"Âã‚’"À¢FVç6–öã¢ã3RÀ¢f–ÆÃ¢fÇ6RÀ¢&÷&FW%v–GFƒ¢2À¢ö–çE&F—W3¢BÀ¢ÒÀ¢ÒÀ¢ÒÀ¢÷F–öç3¢6†'D&6T÷F–öç2‚’À¢Ò“°§Ð ¦gVæ7F–öâ&VæFW$†6W„FWf–F–öä6çf2‡&÷w2’°¢6öç7B6çf2ÒFö7VÖVçBævWDVÆVÖVçD'”–B‚&6†'DFW7f–ò"“°¢–b‚6çf2’&WGW&ã°¢FW7G&÷”6†'D§4–ç7Fæ6R††6W„6†'D–ç7Fæ6W2Â&6†'DFW7f–ò"“°¢–b‚&÷w2æÆVæwF‚’°¢&VæFW$†6W„6†'DV×G’‚&6†'DFW7f–ò"Â%6VÒFW7f–÷2&W†–&—"æòf–ÇG&òGVÂâ"“°¢&WGW&ã°¢Ð¢6öç7B÷&FW&VBÒ&÷w2ç6Æ–6R‚’ç6÷'B‚†Â"’ÓâÖF‚æ'2†æFWf–F–öâ’ÒÖF‚æ'2†"æFWf–F–öâ’“°¢†6W„6†'D–ç7Fæ6W2æ6†'DFW7f–òÒæWr6†'B†6çf2Â°¢G—S¢&&""À¢FF¢°¢Æ&VÇ3¢÷&FW&VBæÖ‚‡&÷r’Óâ&÷ræö'&Ææò’À¢FF6WG3¢°¢°¢Æ&VÃ¢$FW7f–ò&Wf—7Fò‚&VÆ—¦Fò"À¢FF¢÷&FW&VBæÖ‚‡&÷r’Óâ&÷ræFWf–F–öâ’À¢&6¶w&÷VæD6öÆ÷#¢÷&FW&VBæÖ‚‡&÷r’Óâ‡&÷rç7FGW2çFöæRÓÓÒ'&VB"ò"4dc#$2"¢&÷rç7FGW2çFöæRÓÓÒ&÷&ævR"ò"4dcƒs""¢"3„cT"’’À¢&÷&FW%&F—W3¢rÀ¢&%W&6VçFvS¢ãc"À¢ÒÀ¢ÒÀ¢ÒÀ¢÷F–öç3¢6†'D&6T÷F–öç2‡°¢–æFW„†—3¢'’"À¢ÇVv–ç3¢°¢ââæ6†'D&6T÷F–öç2‚’çÇVv–ç2À¢ÆVvVæC¢²F—7Æ“¢fÇ6RÒÀ¢ÒÀ¢66ÆW3¢°¢ƒ¢²F–6·3¢6†'D7W'&Væ7”÷F–öç2‚’Âw&–C¢²6öÆ÷#¢"4TTcc‚"ÒÒÀ¢“¢²F–6·3¢²6öÆ÷#¢"33CCSB"ÂföçC¢²6—¦S¢ÒÒÂw&–C¢²F—7Æ“¢fÇ6RÒÒÀ¢ÒÀ¢öä6Æ–6³¢…öWfVçBÂVÆVÖVçG2’Óâ°¢6öç7B—FVÒÒVÆVÖVçG3òå³Ó°¢–b†—FVÒ’÷Vä6W„7W'fTFWF–Â‚&ö'&"Â÷&FW&VE¶—FVÒæ–æFW…Óòæö'&ÆæòÇÂ""“°¢ÒÀ¢Ò’À¢Ò“°§Ð ¦gVæ7F–öâ&VæFW$†6W…7F6¶VD6çf2†ÖöçF…&÷w2Âw&÷W2’°¢6öç7B6çf2ÒFö7VÖVçBævWDVÆVÖVçD'”–B‚&6†'E7F6¶VB"“°¢–b‚6çf2’&WGW&ã°¢FW7G&÷”6†'D§4–ç7Fæ6R††6W„6†'D–ç7Fæ6W2Â&6†'E7F6¶VB"“°¢6öç7BF÷FÂÒÖF‚æÖ‚†w&÷W2ç&VGV6R‚‡7VÒÂ&÷r’Óâ7VÒ²&÷rçfÇVRÂ’Â“°¢6öç7BÖöçF…F÷FÂÒÖF‚æÖ‚†ÖöçF…&÷w2ç&VGV6R‚‡7VÒÂ&÷r’Óâ7VÒ²&÷rç&Wf—7FòÂ’Â“°¢6öç7BÆWGFRÒ²"3#$S„"Â"3SS$Cb"Â"3„cT"Â"4dcƒs""Â"3ƒtc”2"Â"4#ss“b"Â"4dcSr"Â"3ccsƒR%Ó°¢†6W„6†'D–ç7Fæ6W2æ6†'E7F6¶VBÒæWr6†'B†6çf2Â°¢G—S¢&&""À¢FF¢°¢Æ&VÇ3¢ÖöçF…&÷w2æÖ‚‡&÷r’Óâ&÷ræÖöçF‚’À¢FF6WG3¢w&÷W2æÖ‚†w&÷WÂ–æFW‚’Óâ‡°¢Æ&VÃ¢w&÷WæÆ&VÂÀ¢FF¢ÖöçF…&÷w2æÖ‚†ÖöçF‚’Óâw&÷WçfÇVR¢†ÖöçF‚ç&Wf—7FòòÖöçF…F÷FÂ’’À¢&6¶w&÷VæD6öÆ÷#¢ÆWGFU¶–æFW‚RÆWGFRæÆVæwF…ÒÀ¢7F6³¢&6W‚"À¢&÷&FW%&F—W3¢BÀ¢Ò’’À¢ÒÀ¢÷F–öç3¢6†'D&6T÷F–öç2‡°¢ÇVv–ç3¢°¢ââæ6†'D&6T÷F–öç2‚’çÇVv–ç2À¢FööÇF—¢°¢ââæ6†'D&6T÷F–öç2‚’çÇVv–ç2çFööÇF—À¢6ÆÆ&6·3¢°¢Æ&VÃ¢†6öçFW‡B’ÓâG¶6öçFW‡BæFF6WBæÆ&VÇÓ¢G¶ÖöæW”6VçG2†6öçFW‡Bç'6VBç’—Ò‚G¶çVÖ&W"‚‚†6öçFW‡Bç'6VBç’ÇÂ’òF÷FÂ’¢Â—ÒRF6FVv÷&––À¢ÒÀ¢ÒÀ¢ÒÀ¢66ÆW3¢°¢ƒ¢²7F6¶VC¢G'VRÂF–6·3¢²6öÆ÷#¢"3ccsƒR"ÒÂw&–C¢²F—7Æ“¢fÇ6RÒÒÀ¢“¢²7F6¶VC¢G'VRÂF–6·3¢6†'D7W'&Væ7”÷F–öç2‚’Âw&–C¢²6öÆ÷#¢"4TTcc‚"ÒÒÀ¢ÒÀ¢Ò’À¢Ò“°§Ð ¦gVæ7F–öâ&VæFW$†6W…47W'fR‡&÷w2’°¢6öç7Bv–GF‚Òsc°¢6öç7B†V–v‡BÒ3°¢6öç7BÆVgBÒSƒ°¢6öç7B&–v‡BÒ#°¢6öç7BF÷Ò#°¢6öç7B&÷GFöÒÒC#°¢6öç7BÆ÷Ev–GF‚Òv–GF‚ÒÆVgBÒ&–v‡C°¢6öç7BÆ÷D†V–v‡BÒ†V–v‡BÒF÷Ò&÷GFöÓ°¢6öç7BÖ‚ÒÖF‚æÖ‚€¢ââç&÷w2æÖ‚‡&÷r’ÓâÖF‚æÖ‚‡&÷rç&Wf—7Fô7V×VÆFòÂ&÷rç&VÆ—¦FõÆæV¦Fô7V×VÆFòÂ&÷rç&VÆ—¦FõF÷FÄ7V×VÆFò’’À¢¢“°¢6öç7B„f÷"Ò†–æFW‚’ÓâÆVgB²‡Æ÷Ev–GF‚òÖF‚æÖ‚‡&÷w2æÆVæwF‚ÒÂ’’¢–æFWƒ°¢6öç7B”f÷"Ò‡fÇVR’ÓâF÷²Æ÷D†V–v‡BÒ„ÖF‚æÖ‚‡fÇVRÂ’òÖ‚’¢Æ÷D†V–v‡C°¢6öç7Bö–çG2Ò†f–VÆB’Óâ&÷w2æÖ‚‡&÷rÂ–æFW‚’ÓâG¶çVÖ&W%&r‡„f÷"†–æFW‚’—ÒÂG¶çVÖ&W%&r‡”f÷"‡&÷u¶f–VÆEÒ’—Ö’æ¦ö–â‚""“°¢6öç7BÖöçF…F–6·2Ò&÷w0¢æÖ‚‡&÷rÂ–æFW‚’Óâ°¢6öç7B‚Ò„f÷"†–æFW‚“°¢&WGW&âÇFW‡BƒÒ"G¶çVÖ&W%&r‡‚—Ò"“Ò"G¶†V–v‡BÒwÒ"FW‡BÖæ6†÷#Ò&Ö–FFÆR#âG·&÷ræÖöçF‡ÓÂ÷FW‡Cæ°¢Ò¢æ¦ö–â‚""“°¢6öç7B6—&6ÆW2Ò†f–VÆBÂ6Ç2’Óà¢&÷w0¢æÖ‚‡&÷rÂ–æFW‚’Óâ°¢6öç7B‚Ò„f÷"†–æFW‚“°¢6öç7B’Ò”f÷"‡&÷u¶f–VÆEÒ“°¢&WGW&âÆ6—&6ÆR6Æ73Ò"G¶6Ç7Ò"7ƒÒ"G¶çVÖ&W%&r‡‚—Ò"7“Ò"G¶çVÖ&W%&r‡’—Ò"#Ò#B#ãÇF—FÆSâG·&÷ræÖöçF‡Ó¢G¶ÖöæW”6VçG2‡&÷u¶f–VÆEÒ—ÓÂ÷F—FÆSãÂö6—&6ÆSæ°¢Ò¢æ¦ö–â‚""“°¢6öç7Bw&–BÒ³Âã#RÂãRÂãsRÂÐ¢æÖ‚‡7FW’Óâ°¢6öç7B’ÒF÷²Æ÷D†V–v‡BÒÆ÷D†V–v‡B¢7FW°¢&WGW&â ¢ÆÆ–æRƒÒ"G¶ÆVgGÒ"ƒ#Ò"G·v–GF‚Ò&–v‡GÒ"“Ò"G¶çVÖ&W%&r‡’—Ò"“#Ò"G¶çVÖ&W%&r‡’—Ò#ãÂöÆ–æSà¢ÇFW‡BƒÒ#‚"“Ò"G¶çVÖ&W%&r‡’²B—Ò#âG¶ÖöæW”6ö×7B†Ö‚¢7FW—ÓÂ÷FW‡Cà¢°¢Ò¢æ¦ö–â‚""“°¢&WGW&â ¢ÆF—b6Æ73Ò&†6W‚×67W'fR#à¢Ç7frf–Wt&÷ƒÒ#G·v–GF‡ÒG¶†V–v‡GÒ"&öÆSÒ&–Ör"&–ÖÆ&VÃÒ$7W'f2Fò4U‚6öÒ&Wf—7FòR&VÆ—¦Fò7V×VÆFò#à¢Ær6Æ73Ò&†6W‚×67W'fRÖw&–B#âG¶w&–GÓÂösà¢ÇöÇ–Æ–æR6Æ73Ò'ÆææVB"ö–çG3Ò"G·ö–çG2‚'&Wf—7Fô7V×VÆFò"—Ò#ãÂ÷öÇ–Æ–æSà¢ÇöÇ–Æ–æR6Æ73Ò'&VÂ×ÆææVB"ö–çG3Ò"G·ö–çG2‚'&VÆ—¦FõÆæV¦Fô7V×VÆFò"—Ò#ãÂ÷öÇ–Æ–æSà¢ÇöÇ–Æ–æR6Æ73Ò'&VÂ×F÷FÂ"ö–çG3Ò"G·ö–çG2‚'&VÆ—¦FõF÷FÄ7V×VÆFò"—Ò#ãÂ÷öÇ–Æ–æSà¢G¶6—&6ÆW2‚'&Wf—7Fô7V×VÆFò"Â'ÆææVBÖF÷B"—Ð¢G¶6—&6ÆW2‚'&VÆ—¦FõÆæV¦Fô7V×VÆFò"Â'&VÂ×ÆææVBÖF÷B"—Ð¢G¶6—&6ÆW2‚'&VÆ—¦FõF÷FÄ7V×VÆFò"Â'&VÂ×F÷FÂÖF÷B"—Ð¢Ær6Æ73Ò&†6W‚×67W'fRÖÖöçF‡2#âG¶ÖöçF…F–6·7ÓÂösà¢Â÷7fsà¢ÂöF—cà¢ÆF—b6Æ73Ò&6†'BÖÆVvVæB#à¢Ç7ããÆ’FF×FöæSÒ&&ÇVR#ãÂö“å&Wf—7Fò7V×VÆFóÂ÷7ãà¢Ç7ããÆ’FF×FöæSÒ&w&VVâ#ãÂö“å&VÆ—¦FòÆæV¦FóÂ÷7ãà¢Ç7ããÆ’FF×FöæSÒ&÷&ævR#ãÂö“å&VÆ—¦FòF÷FÃÂ÷7ãà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâçVÖ&W%&r‡fÇVR’°¢&WGW&â„çVÖ&W"‡fÇVR’ÇÂ’çFôf—†VBƒ"“°§Ð ¦gVæ7F–öâ&VæFW$†6W…&—6µæVÂ‡&÷w2’°¢6öç7B&—6·•&÷w2Ò&÷w2æf–ÇFW"‚‡&÷r’Óâ&÷rç7FGW2çFöæRÓÒ&w&VVâ"’ç6Æ–6RƒÂ“°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò'&—6²Ö6&B—2Ö6Æ–6¶&ÆR"FFÖ7F–öãÒ&÷VâÖ6W‚Ö7W'fRÖFWF–Â"FFÖFWF–ÃÒ'&—66÷2"&öÆSÒ&'WGFöâ"F&–æFWƒÒ##à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#å–æVÂFR&—66÷2ÒFW7f–ò&Wf—7Fòg2&VÆ—¦FóÂöF—cà¢ÆF—b6Æ73Ò&†6W‚×&—6²Öw&–B#à¢G°¢&—6·•&÷w2æÆVæwF€¢ò&—6·•&÷w0¢æÖ‚‡&÷r’Óâ ¢Æ'F–6ÆRFF×FöæSÒ"G·&÷rç7FGW2çFöæWÒ"FFÖ7F–öãÒ&÷VâÖ6W‚Ö7W'fRÖFWF–Â"FFÖFWF–ÃÒ&ö'&"FFÖÆ&VÃÒ"G¶W66TGG&–'WFR‡&÷ræö'&Ææò—Ò"&öÆSÒ&'WGFöâ"F&–æFWƒÒ##à¢Ç7G&öæsâG·&÷ræö'&Ææ÷ÓÂ÷7G&öæsà¢Ç7ãâG·&÷rç7FGW2æÆ&VÇÒ+rG¶çVÖ&W"‡&÷ræFWf–F–öåW&6VçBÂ—ÒSÂ÷7ãà¢ÆVÓâG¶ÖöæW”6VçG2‡&÷ræFWf–F–öâ—ÓÂöVÓà¢Âö'F–6ÆSà¢¢æ¦ö–â‚""¢¢ÆF—b6Æ73Ò&V×G’×7FFR#äæVæ‡VÒFW7f–ò7,:×F–6òæòf–ÇG&òGVÂãÂöF—cæ ¢Ð¢ÂöF—cà¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ&VæFW$†6W„æÇ—6—2†ÖWG&–72ÂF÷v÷&·2’°¢6öç7Bv÷'7BÒF÷v÷&·2æf–æB‚‡&÷r’Óâ&÷rç7FGW2çFöæRÓÒ&w&VVâ"’ÇÂF÷v÷&·5³Ó°¢6öç7B7FGW5FW‡BÐ¢ÖWG&–72ç7FGW2çFöæRÓÓÒ&w&VVâ ¢ò$7W'f7V×VÆFW7L:FVçG&òFf—†FR6öçG&öÆRFRRâ ¢¢7W'f7V×VÆFW7L:VÒG¶ÖWG&–72ç7FGW2æÆ&VÂçFôÆ÷vW$66R‚—ÒÂ6öÒFW7f–òFRG¶çVÖ&W"†ÖWG&–72æFWf–F–öåW&6VçBÂ—ÒR6ö'&Rò&Wf—7Fò•DBæ°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò&æÇ—6—2Ö6&B—2Ö6Æ–6¶&ÆR"FFÖ7F–öãÒ&÷VâÖ6W‚Ö7W'fRÖFWF–Â"FFÖFWF–ÃÒ&æÆ—6R"&öÆSÒ&'WGFöâ"F&–æFWƒÒ##à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#äì:Æ—6R–çFW'&WFF—fFR&—66÷2Ò6ö÷&FVæ:|:6ò6ÆL:–6æ–6ÂöF—cà¢ÇâG·7FGW5FW‡GÓÂ÷à¢ÇâG°¢v÷'7@¢ò&–æ6—ÂöçFòFRFVì:|:6ó¢Ç7G&öæsâG·v÷'7Bæö'&Ææ÷ÓÂ÷7G&öæsâÂ6öÒFW7f–òFRÇ7G&öæsâG¶ÖöæW”6VçG2‡v÷'7BæFWf–F–öâ—ÓÂ÷7G&öæsâg&VçFR:&VfW,:¦æ6–•DBW7F–ÖFæ ¢¢$–æFì:6òŒ:ö'&6öÒFW7f–ò6Æ7VÆFòæòf–ÇG&òGVÂâ ¢ÓÂ÷à¢Çå&V6öÖVæF:|:6ó¢&Wf—6"ô—26öÒ7FGW27,:×F–6òçFW2FR&÷f"æ÷f24”72÷RG&ç6fW,:¦æ6–2Âv&çF–æFòVRò6öç7VÖòW7FV¦FVçG&òFfW&&÷'FFãÂ÷à¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ÷Vä6W„7W'fTFWF–Â†FWF–Ä¶W’ÂÆ&VÂÒ""’°¢6öç7BÆÅ&÷w2Ò6W„7W'fU66÷VE&÷w2†f–ÇFW&VD6W…&÷w2‚’“°¢6öç7BÖöçF…&÷w2Ò6W„ÖöçF†Ç•&÷w2†6W„7W'fU66÷RÓÓÒ&ÖçWFVæ6ò"òÖF‚æÖ‚†6W…7VÖÖ'’†ÆÅ&÷w2’çF÷FÅfW&&Â’¢†6W…&VfW&Væ6Ræ6W„GVÂ“°¢6öç7BÖWG&–72Ò6W„7W'fTÖWG&–72†ÖöçF…&÷w2“°¢6öç7B7W'fU&÷w2Ò6W„7W'fUv÷&µ&÷w2†ÆÅ&÷w2ÂÖWG&–72ç—FDf7F÷"“°¢6öç7B6VÆV7FVE&÷w2ÒFWF–Ä¶W’ÓÓÒ&ö'&"bbÆ&VÂò7W'fU&÷w2æf–ÇFW"‚‡&÷r’Óâ&÷ræö'&ÆæòÓÓÒÆ&VÂ’¢7W'fU&÷w3°¢6öç7BFWF–ÂÒ6W„7W'fTFWF–Ä6öçFVçB†FWF–Ä¶W’ÂÆ&VÂÂ6VÆV7FVE&÷w2ÂÖöçF…&÷w2ÂÖWG&–72“°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Ç6V7F–öâ6Æ73Ò&ÖöFÂÖ6&B·’ÖÖöFÂÖ6&B6W‚Ö7W'fRÖFWF–ÂÖÖöFÂ"&–ÖÆ&VÆÆVF'“Ò&6W„7W'fTFWF–ÅF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#ä7W'fFR4UƒÂ÷7ãà¢Æƒ"–CÒ&6W„7W'fTFWF–ÅF—FÆR#âG¶FWF–ÂçF—FÆWÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#âG¶FWF–Âç7V'F—FÆWÓÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&·’ÖFWF–ÂÖw&–B#à¢G¶FWF–ÂæÖWG&–72æÖ‚†ÖWG&–2’Óâ7Æ—D—FVÒ†ÖWG&–2æÆ&VÂÂÖWG&–2çfÇVR’’æ¦ö–â‚""—Ð¢ÂöF—cà¢G¶FWF–Âæ&öG—Ð¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'6WBÖ'VFvWB×F""FF×F#Ò&6W‚#ä'&—"6öçG&öÆRFR4UƒÂö'WGFöãà¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#äfV6†#Âö'WGFöãà¢Âöfö÷FW#à¢Â÷6V7F–öãà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ6W„7W'fTFWF–Ä6öçFVçB†FWF–Ä¶W’ÂÆ&VÂÂ&÷w2ÂÖöçF…&÷w2ÂÖWG&–72’°¢6öç7B7VÖÖ'’Ò6W…7VÖÖ'’‡&÷w2“°¢6öç7B&6TÖWG&–72Ò°¢²Æ&VÃ¢$ô—2"ÂfÇVS¢7G&–ær‡&÷w2æÆVæwF‚’ÒÀ¢²Æ&VÃ¢%fW&&"ÂfÇVS¢ÖöæW’‡7VÖÖ'’çF÷FÅfW&&’ÒÀ¢²Æ&VÃ¢%&VÆ—¦Fò"ÂfÇVS¢ÖöæW’‡&÷w2ç&VGV6R‚‡7VÒÂ&÷r’Óâ7VÒ²&÷rç&VÆ—¦VBÂ’’ÒÀ¢²Æ&VÃ¢%6ÆFò"ÂfÇVS¢ÖöæW’‡7VÖÖ'’çF÷FÅ6ÆFò’ÒÀ¢Ó°¢–b…²&7W'f2"Â&ÖVç6Â"Â&7V×VÆFò"Â'&Wf—7Fò"Â'&VÆ—¦Fò"Â&æõÆæV¦Fò"Â&FW7f–ò%Òæ–æ6ÇVFW2†FWF–Ä¶W’’’°¢&WGW&â°¢F—FÆS¢6W„7W'fTFWF–ÅF—FÆR†FWF–Ä¶W’’À¢7V'F—FÆS¢G¶ÖWG&–72æ†4ÖöçF…6VÆV7F–öâò%W,:ÖöFò6VÆV6–öæFò"¢%&VfW,:¦æ6–7V×VÆF'Ó¢G¶ÖWG&–72çW&–öDÆ&VÇÒâ&Wf—7FòR&VÆ—¦Fò6W&F÷2÷"v÷fW&æì:væÀ¢ÖWG&–73¢°¢²Æ&VÃ¢%&Wf—7Fò•DB"ÂfÇVS¢ÖöæW’†ÖWG&–72çÆææVE—FB’ÒÀ¢²Æ&VÃ¢%&VÆ—¦FòÆæV¦Fò"ÂfÇVS¢ÖöæW’†ÖWG&–72çÆææVE&VÆ—¦VE—FB’ÒÀ¢²Æ&VÃ¢$ì:6òÆæV¦F2òõU""ÂfÇVS¢ÖöæW’†ÖWG&–72çVçÆææVE—FB’ÒÀ¢²Æ&VÃ¢$FW7f–ò"ÂfÇVS¢G¶ÖöæW’†ÖWG&–72æFWf–F–öâ—Ò‚G¶çVÖ&W"†ÖWG&–72æFWf–F–öåW&6VçBÂ—ÒR–ÒÀ¢ÒÀ¢&öG“¢ ¢G·&VæFW$†6W…47W'fR†ÖöçF…&÷w2—Ð¢ÆF—b6Æ73Ò'F&ÆR×w&6W‚×F&ÆR×w&#à¢ÇF&ÆR6Æ73Ò&FF×F&ÆR#à¢ÇF†VCà¢ÇG#à¢ÇFƒäÜ:§3Â÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#å&Wf—7FóÂ÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#å&VÆ—¦FòÆæV¦FóÂ÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#äì:6òÆæV¦FòòõU#Â÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#å&VÆ—¦FòF÷FÃÂ÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#å&Wf—7Fò7V×VÆFóÂ÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#å&VÆ—¦Fò7V×VÆFóÂ÷Fƒà¢Â÷G#à¢Â÷F†VCà¢ÇF&öG“à¢G¶ÖöçF…&÷w0¢æÖ‚‡&÷r’Óâ°¢6öç7BVçÆææVBÒ&÷rç&VÆ—¦FôæõÆæV¦Fò²&÷rç&VÆ—¦Fô÷W#°¢&WGW&â ¢ÇG#à¢ÇFCãÇ7G&öæsâG·&÷ræÖöçF‡Òó#cÂ÷7G&öæsãÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG¶ÖöæW”6VçG2‡&÷rç&Wf—7Fò—ÓÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG¶ÖöæW”6VçG2‡&÷rç&VÆ—¦FõÆæV¦Fò—ÓÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG¶ÖöæW”6VçG2‡VçÆææVB—ÓÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG¶ÖöæW”6VçG2‡&÷rç&VÆ—¦FõÆæV¦Fò²VçÆææVB—ÓÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG¶ÖöæW”6VçG2‡&÷rç&Wf—7Fô7V×VÆFò—ÓÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG¶ÖöæW”6VçG2‡&÷rç&VÆ—¦FõF÷FÄ7V×VÆFò—ÓÂ÷FCà¢Â÷G#à¢°¢Ò¢æ¦ö–â‚""—Ð¢Â÷F&öG“à¢Â÷F&ÆSà¢ÂöF—cà¢À¢Ó°¢Ð ¢–b†FWF–Ä¶W’ÓÓÒ'F—öÆöv–2"’°¢6öç7Bw&÷W2Ò6W„7W'fTw&÷W&÷w2‡&÷w2Â&6FVv÷&–÷&2"Â'fW&&"Â3“°¢&WGW&â°¢F—FÆS¢$4U‚÷"F—öÆöv–"À¢7V'F—FÆS¢$6ö×÷6œ:|:6òFfW&&÷"6FVv÷&–õ$2æòf–ÇG&òGVÂâ"À¢ÖWG&–73¢&6TÖWG&–72À¢&öG“¢&VæFW$6W„7W'fTFWF–ÅF&ÆR€¢²%F—öÆöv–"Â%fW&&"Â"RFòF÷FÂ%ÒÀ¢w&÷W2æÖ‚‡&÷r’Óâ·&÷ræÆ&VÂÂÖöæW”6VçG2‡&÷rçfÇVR’ÂG¶çVÖ&W"‚‡&÷rçfÇVRòÖF‚æÖ‚‡7VÖÖ'’çF÷FÅfW&&Â’’¢Â—ÒVÒ¢’À¢Ó°¢Ð ¢–b…²'&—66÷2"Â&FW7f–÷2"Â&æÆ—6R%Òæ–æ6ÇVFW2†FWF–Ä¶W’’’°¢6öç7B&—6·’Ò&÷w2æf–ÇFW"‚‡&÷r’Óâ&÷rç7FGW2çFöæRÓÒ&w&VVâ"’ç6Æ–6RƒÂƒ“°¢&WGW&â°¢F—FÆS¢%&—66÷2RFW7f–÷2F7W'f"À¢7V'F—FÆS¢$ö'&26öÒÖ–÷"f7FÖVçFòVçG&R&VfW,:¦æ6–•DBR&VÆ—¦Fò–FVçF–f–6Fòâ"À¢ÖWG&–73¢°¢ââæ&6TÖWG&–72À¢²Æ&VÃ¢$—FVç2VÒ&—66ò"ÂfÇVS¢7G&–ær‡&—6·’æÆVæwF‚’ÒÀ¢ÒÀ¢&öG“¢&VæFW$6W„7W'fTFWF–ÅF&ÆR€¢²$ö'&"Â$ô’"Â$6FVv÷&–"Â%&Wf—7Fò•DB"Â%&VÆ—¦Fò"Â$FW7f–ò"Â%7FGW2%ÒÀ¢&—6·’æÖ‚‡&÷r’Óâ°¢&÷ræö'&ÆæòÀ¢&÷ræ÷&FVÔ–çFW&æÇÂ%6VÒô’"À¢&÷ræ6FVv÷&–÷&2À¢ÖöæW”6VçG2‡&÷rçÆææVE—FB’À¢ÖöæW”6VçG2‡&÷rç&VÆ—¦VB’À¢ÖöæW”6VçG2‡&÷ræFWf–F–öâ’À¢&÷rç7FGW2æÆ&VÂÀ¢Ò¢’À¢Ó°¢Ð ¢–b†FWF–Ä¶W’ÓÓÒ&v÷fW&ææ6"’°¢&WGW&â°¢F—FÆS¢$v÷fW&æì:vF7W'f"À¢7V'F—FÆS¢%&Vw&2W6F2&ÆW"7W'fFR4U‚FVçG&òFò4ÅB3câ"À¢ÖWG&–73¢°¢²Æ&VÃ¢$4U‚–æ–6–Â"ÂfÇVS¢ÖöæW’††6W…&VfW&Væ6Ræ6W„–æ–6–Â’ÒÀ¢²Æ&VÃ¢$÷'FW2W‡G&2"ÂfÇVS¢ÖöæW’††6W…&VfW&Væ6Ræ÷'FW4W‡G&2’ÒÀ¢²Æ&VÃ¢$6öçF–ævVæ6–ÖVçF÷2"ÂfÇVS¢ÖöæW’††6W…&VfW&Væ6Ræ6öçF–ævVæ6–ÖVçF÷2’ÒÀ¢²Æ&VÃ¢$4U‚GVÂ"ÂfÇVS¢ÖöæW’††6W…&VfW&Væ6Ræ6W„GVÂ’ÒÀ¢ÒÀ¢&öG“¢ ¢ÆF—b6Æ73Ò'7Æ—BÖÆ—7B#à¢G·7Æ—D—FVÒ‚$l;7&×VÆ"Â$4U‚GVÂÒ4U‚–æ–6–Â²÷'FW2W‡G&2Ò6öçF–ævVæ6–ÖVçF÷2"—Ð¢G·7Æ—D—FVÒ‚$†—7L;7&–6ò"Â$¦âó#b§Vâó#b&W6W'fÒò&Wf—7Fò&÷fFòFò&ö×BÖW7G&R"—Ð¢G·7Æ—D—FVÒ‚%6W&:|:6ò"Â$ì:6òÆæV¦F2òõU"f–6Ò6W&F2Fò4U‚–æF—f–GVÂFò&ö¦WFò"—Ð¢G·7Æ—D—FVÒ‚%G&f"Â$UbR4”2<;2FWfVÒ6öç7VÖ—"fW&&W†—7FVçFRæô’f–æ7VÆF"—Ð¢ÂöF—cà¢À¢Ó°¢Ð ¢6öç7BÆ–Ö—FVE&÷w2Ò&÷w2ç6Æ–6RƒÂƒ“°¢&WGW&â°¢F—FÆS¢FWF–Ä¶W’ÓÓÒ&ö'&"bbÆ&VÂòÆ&VÂ¢6W„7W'fTFWF–ÅF—FÆR†FWF–Ä¶W’’À¢7V'F—FÆS¢$FWFÆ†ÖVçFòF2ô—2RfW&&2Fòf–ÇG&òGVÂâ"À¢ÖWG&–73¢&6TÖWG&–72À¢&öG“¢&VæFW$6W„7W'fTFWF–ÅF&ÆR€¢²$ö'&"Â$ô’"Â$6FVv÷&–"Â%fW&&"Â$6öç7VÖ–Fò"Â%6ÆFò"Â%7FGW2%ÒÀ¢Æ–Ö—FVE&÷w2æÖ‚‡&÷r’Óâ°¢6öç7B7FGW2Ò6W…&÷u7FGW2‡&÷r“°¢&WGW&â°¢&÷ræö'&ÆæòÀ¢&÷ræ÷&FVÔ–çFW&æÇÂ%6VÒô’"À¢&÷ræ6FVv÷&–÷&2À¢ÖöæW”6VçG2‡&÷rçfW&&’À¢ÖöæW”6VçG2‡&÷ræ6öç7VÖ–Fò’À¢ÖöæW”6VçG2‡&÷rç6ÆFò’À¢7FGW2æÆ&VÂÀ¢Ó°¢Ò¢’À¢Ó°§Ð ¦gVæ7F–öâ6W„7W'fTFWF–ÅF—FÆR†¶W’’°¢6öç7BF—FÆW2Ò°¢6W„GVÃ¢$4U‚GVÂ"À¢&Wf—7Fó¢%&Wf—7Fò•DB"À¢&VÆ—¦Fó¢%&VÆ—¦FòÆæV¦Fò"À¢æõÆæV¦Fó¢$ì:6òÆæV¦F2òõU""À¢FW7f–ó¢$FW7f–ò•DB"À¢ö—3¢$ô—2æòf–ÇG&ò"À¢6öÖö—3¢%6öÖF2ô—2–×÷'FF2"À¢6ÆFó¢%6ÆFòF2ô—2"À¢7W'f3¢$7W'f2Fò4U‚"À¢ÖVç6Ã¢$fÇW†òÖVç6Â"À¢7V×VÆFó¢$6öç7VÖò7V×VÆFò"À¢FW7f–÷3¢$FW7f–÷2÷"ö'&"À¢Ó°¢&WGW&âF—FÆW5¶¶W•ÒÇÂ$FWFÆ†RF7W'fFR4U‚#°§Ð ¦gVæ7F–öâ&VæFW$6W„7W'fTFWF–ÅF&ÆR†6öÇVÖç2Â&÷w2’°¢–b‚&÷w2æÆVæwF‚’&WGW&âÆF—b6Æ73Ò&V×G’×7FFR#å6VÒ&Vv—7G&÷2&W†–&—"æW7FRFWFÆ†RãÂöF—cæ°¢&WGW&â ¢ÆF—b6Æ73Ò'F&ÆR×w&6W‚×F&ÆR×w&#à¢ÇF&ÆR6Æ73Ò&FF×F&ÆR#à¢ÇF†VCà¢ÇG#âG¶6öÇVÖç2æÖ‚†6öÇVÖâ’ÓâÇFƒâG¶6öÇVÖçÓÂ÷Fƒæ’æ¦ö–â‚""—ÓÂ÷G#à¢Â÷F†VCà¢ÇF&öG“à¢G·&÷w2æÖ‚‡&÷r’ÓâÇG#âG·&÷ræÖ‚†6VÆÂÂ–æFW‚’ÓâÇFB6Æ73Ò"G¶–æFW‚â"ò&çVÖW&–2"¢"'Ò#âG¶6VÆÇÓÂ÷FCæ’æ¦ö–â‚""—ÓÂ÷G#æ’æ¦ö–â‚""—Ð¢Â÷F&öG“à¢Â÷F&ÆSà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ6W„ÖöçF†Ç•&÷w2‡F÷FÅfW&&’°¢6öç7B÷&FW"Ò²$¤â"Â$dUb"Â$Ô""Â$%""Â$Ô’"Â$¥Tâ"Â$¥TÂ"Â$tò"Â%4UB"Â$õUB"Â$äõb"Â$DU¢%Ó°¢6öç7BfÇVW2ÒæWrÖ‚†6W„FF‚’æ6öç7VÖóòæ'”ÖöçF‚ÇÂµÒ’æÖ‚‡&÷r’Óâµ7G&–ær‡&÷ræÆ&VÂÇÂ""’çFõWW$66R‚’ÂçVÖ&W"‡&÷rçfÆ÷"’ÇÂÒ’“°¢6öç7BÆææVEfÇVW2ÒæWrÖ‚†6W„FF‚’æ6öç7VÖóòæ'”ÖöçF…ÆææVBÇÂµÒ’æÖ‚‡&÷r’Óâµ7G&–ær‡&÷ræÆ&VÂÇÂ""’çFõWW$66R‚’ÂçVÖ&W"‡&÷rçfÆ÷"’ÇÂÒ’“°¢6öç7BVçÆææVEfÇVW2ÒæWrÖ‚†6W„FF‚’æ6öç7VÖóòæ'”ÖöçF…VçÆææVBÇÂµÒ’æÖ‚‡&÷r’Óâµ7G&–ær‡&÷ræÆ&VÂÇÂ""’çFõWW$66R‚’ÂçVÖ&W"‡&÷rçfÆ÷"’ÇÂÒ’“°¢6öç7B÷W%fÇVW2ÒæWrÖ‚†6W„FF‚’æ6öç7VÖóòæ'”ÖöçF„÷W"ÇÂµÒ’æÖ‚‡&÷r’Óâµ7G&–ær‡&÷ræÆ&VÂÇÂ""’çFõWW$66R‚’ÂçVÖ&W"‡&÷rçfÆ÷"’ÇÂÒ’“°¢6öç7B†—7F÷'’Ò†6W…&VfW&Væ6Rç&Wf—7Fô†—7F÷&–6ó°¢6öç7B†—7F÷'•F÷FÂÒö&¦V7BçfÇVW2††—7F÷'’’ç&VGV6R‚‡7VÒÂfÇVR’Óâ7VÒ²fÇVRÂ“°¢6öç7BgWGW&TÖöçF‡2Ò÷&FW"æf–ÇFW"‚†ÖöçF‚’Óâ†—7F÷'•¶ÖöçF…Ò“°¢6öç7BgWGW&U&VfW&Væ6RÒgWGW&TÖöçF‡2æÆVæwF‚òÖF‚æÖ‚‡F÷FÅfW&&Ò†—7F÷'•F÷FÂÂ’ògWGW&TÖöçF‡2æÆVæwF‚¢°¢ÆWB7V×VÆF—fRÒ°¢ÆWBÆææVD7V×VÆF—fRÒ°¢ÆWBÆææVE&VÆ—¦VD7V×VÆF—fRÒ°¢ÆWBF÷FÄ7V×VÆF—fRÒ°¢&WGW&â÷&FW"æÖ‚†ÖöçF‚Â–æFW‚’Óâ°¢6öç7B&VÆ—¦FõF÷FÂÒfÇVW2ævWB†ÖöçF‚’ÇÂ°¢6öç7B&VÆ—¦FõÆæV¦FòÒÆææVEfÇVW2æ†2†ÖöçF‚’òÆææVEfÇVW2ævWB†ÖöçF‚’ÇÂ¢&VÆ—¦FõF÷FÃ°¢6öç7B&VÆ—¦FôæõÆæV¦FòÒVçÆææVEfÇVW2ævWB†ÖöçF‚’ÇÂ°¢6öç7B&VÆ—¦Fô÷W"Ò÷W%fÇVW2ævWB†ÖöçF‚’ÇÂ°¢6öç7B&Wf—7FòÒ†—7F÷'•¶ÖöçF…ÒÇÂgWGW&U&VfW&Væ6S°¢7V×VÆF—fR³Ò&VÆ—¦FõF÷FÃ°¢ÆææVD7V×VÆF—fR³Ò&Wf—7Fó°¢ÆææVE&VÆ—¦VD7V×VÆF—fR³Ò&VÆ—¦FõÆæV¦Fó°¢F÷FÄ7V×VÆF—fR³Ò&VÆ—¦FõÆæV¦Fò²&VÆ—¦FôæõÆæV¦Fò²&VÆ—¦Fô÷W#°¢&WGW&â°¢ÖöçF‚À¢–æFW‚À¢&VÆ—¦Fó¢&VÆ—¦FõF÷FÂÀ¢&VÆ—¦FõF÷FÂÀ¢&VÆ—¦FõÆæV¦FòÀ¢&VÆ—¦FôæõÆæV¦FòÀ¢&VÆ—¦Fô÷W"À¢7V×VÆFó¢7V×VÆF—fRÀ¢&Wf—7FòÀ¢&Wf—7Fô7V×VÆFó¢ÆææVD7V×VÆF—fRÀ¢&VÆ—¦FõÆæV¦Fô7V×VÆFó¢ÆææVE&VÆ—¦VD7V×VÆF—fRÀ¢&VÆ—¦FõF÷FÄ7V×VÆFó¢F÷FÄ7V×VÆF—fRÀ¢Ó°¢Ò“°§Ð ¦gVæ7F–öâ6W„6Æ÷6VDÖöçF„–æFW‚‚’°¢6öç7BFFRÒæWrFFR†G·FöF”•4ò‚—ÕC££“°¢6öç7B&Wf–÷W4ÖöçF‚ÒçVÖ&W"æ—4f–æ—FR†FFRævWDÖöçF‚‚’’òFFRævWDÖöçF‚‚’Ò¢c°¢&WGW&âÖF‚æÖ‚ƒÂÖF‚æÖ–â‡&Wf–÷W4ÖöçF‚Â’“°§Ð ¦gVæ7F–öâ6W„FWf–F–öå7FGW2‡W&6VçB’°¢6öç7B'6öÇWFRÒÖF‚æ'2„çVÖ&W"‡W&6VçB’ÇÂ“°¢–b†'6öÇWFRÃÒ’&WGW&â²Æ&VÃ¢$æ÷&ÖÂ"ÂFöæS¢&w&VVâ"Ó°¢–b†'6öÇWFRÃÒ#R’&WGW&â²Æ&VÃ¢$FVì:|:6ò"ÂFöæS¢&÷&ævR"Ó°¢&WGW&â²Æ&VÃ¢$7,:×F–6ò"ÂFöæS¢'&VB"Ó°§Ð ¦gVæ7F–öâ7Æ—D—FVÒ†Æ&VÂÂfÇVR’°¢&WGW&â ¢ÆF—b6Æ73Ò'7Æ—BÖ—FVÒ#à¢Ç7G&öæsâG¶Æ&VÇÓÂ÷7G&öæsà¢Ç7â6Æ73Ò&×WFVB#âG·fÇVWÓÂ÷7ãà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâfÆ÷u7FW†çVÖ&W$Æ&VÂÂF—FÆRÂFWF–Â’°¢&WGW&â ¢ÆF—b6Æ73Ò&fÆ÷r×7FW#à¢Ç7ãâG¶çVÖ&W$Æ&VÇÓÂ÷7ãà¢ÆF—cà¢Ç7G&öæsâG·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃâG¶FWF–ÇÓÂ÷6ÖÆÃà¢ÂöF—cà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ6–4Æ–æU&V6÷&G2‚’°¢&WGW&â‡7FFRæFVÖæG2ÇÂµÒ¢æf–ÇFW"‚†FVÖæB’ÓâFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2"¢æÖ‚†FVÖæB’Óâ°¢6öç7Bv÷&²Òv÷&´'”–B†FVÖæBæö'&–B“°¢6öç7BÖWFFFÒFVÖæBç6–4ÖWFFFÇÂ·Ó°¢6öç7B7&–çBÒ7&–çD'”–B†FVÖæBç7&–çD–B“°¢6öç7B&V6÷&FVEfÇVRÒFVÖæD†5&V6÷&FVEfÇVR†FVÖæB’òFVÖæE&öGV6VEfÇVR†FVÖæB’¢°¢6öç7B7&VFVDöâÒFFTöæÇ’†FVÖæBæ7&VFVDB’ÇÂFVÖæBæFF&Wf—7F–æ–6–òÇÂFVÖæBæFF–æ–6–õ&VÂÇÂ"#°¢6öç7B7FGW2ÒFVÖæE7FGW4Æ&VÂ†FVÖæB“°¢6öç7B&VfW&Væ6RÒ7G&–ær†ÖWFFFæçVÖW&õ6–2ÇÂÖWFFFæÆV6öÔçVÖ&W"ÇÂFVÖæBæ–BÇÂ""’çG&–Ò‚’ÇÂFVÖæBæ–C°¢&WGW&â°¢6÷W&6S¢$FVÖæF÷W&6–öæÂ"À¢–C¢&VfW&Væ6RÀ¢6&D–C¢FVÖæBæ–BÀ¢ÆV6öÓ¢ÖWFFFæÆV6öÔçVÖ&W"ÇÂ""À¢F—GVÆó¢ÖWFFFçF—GVÆõ6–2ÇÂFVÖæBçF—GVÆòÇÂ""À¢ö'&¢v÷&³òæ6öF–vô÷&–v–æÂÇÂv÷&³òæ6†fUVæ–6ÇÂFVÖæBæö'&–BÇÂ.(	B"À¢æöÖTö'&¢v÷&³òææöÖRÇÂÖWFFFæö'&æöÖRÇÂ$ö'&ì:6òÆö6Æ—¦F"À¢F—66—Æ–æ¢$ì:6ò6RÆ–6"À¢fÆ÷#¢&V6÷&FVEfÇVRÀ¢Ö÷F—fó¢Ö÷F—fF–öäÆ&VÂ†ÖWFFFæÖ÷F—fò’À¢Ö÷f–ÖVçFó¢7FGW2À¢7&–çC¢7&–çCòææöÖRÇÂFVÖæBç7&–çD–BÇÂ%6VÒ7&–çB"À¢W7FFó¢v÷&³òçVbÇÂ.(	B"À¢æÆ—7F¢FVÖæBææÆ—7F&W7öç6fVÂÇÂ$FVf–æ—""À¢F—öÆöv–¢v÷&³òçF—õVæ–FFRÇÂ$ì:6ò–æf÷&ÖF"À¢w'Wó¢$FVÖæF÷W&6–öæÂ"À¢FF÷7FvVÓ¢7&VFVDöâÀ¢7FGW2À¢7FGW4–C¢FVÖæBæ6öÇVæÀ¢&–÷&–FFS¢FVÖæBç&–÷&–FFRÇÂ.(	B"À¢7F–öä–C¢FVÖæBæ–BÀ¢æó¢7&VFVDöâç6Æ–6RƒÂB’ÇÂ$GVÂ"À¢Ó°¢Ò“°§Ð ¦gVæ7F–öâ6–57VÖÖ'•&÷w2‡&V6÷&G2Ò6–4Æ–æU&V6÷&G2‚’’°¢6öç7BÖÒæWrÖ‚“°¢&V6÷&G2æf÷$V6‚‚‡&V6÷&B’Óâ°¢6öç7B¶W’ÒG·&V6÷&Bç6÷W&6W×ÂG·&V6÷&Bæ–G×ÂG·&V6÷&Bæö'&×ÂG·&V6÷&BææöÖTö'&×ÂG·&V6÷&BæÖ÷f–ÖVçF÷Ö°¢6öç7B7W'&VçBÐ¢ÖævWB†¶W’’ÇÀ¢°¢ââç&V6÷&BÀ¢fÆ÷#¢À¢F—66—Æ–æ3¢æWr6WB‚’À¢Ö÷F—f÷3¢æWr6WB‚’À¢F—öÆöv–3¢æWr6WB‚’À¢w'W÷3¢æWr6WB‚’À¢Ó°¢7W'&VçBçfÆ÷"³Ò&V6÷&BçfÆ÷#°¢7W'&VçBæF—66—Æ–æ2æFB‡&V6÷&BæF—66—Æ–æ“°¢7W'&VçBæÖ÷F—f÷2æFB‡&V6÷&BæÖ÷F—fò“°¢7W'&VçBçF—öÆöv–2æFB‡&V6÷&BçF—öÆöv–“°¢7W'&VçBæw'W÷2æFB‡&V6÷&Bæw'Wò“°¢Öç6WB†¶W’Â7W'&VçB“°¢Ò“°¢&WGW&â²ââæÖçfÇVW2‚•Ð¢æÖ‚‡&÷r’Óâ‡°¢ââç&÷rÀ¢F—66—Æ–æ3¢²ââç&÷ræF—66—Æ–æ5ÒÀ¢Ö÷F—f÷3¢²ââç&÷ræÖ÷F—f÷5ÒÀ¢F—öÆöv–3¢²ââç&÷rçF—öÆöv–5ÒÀ¢w'W÷3¢²ââç&÷ræw'W÷5ÒÀ¢Ò’¢ç6÷'B‚†Â"’ÓâÖF‚æ'2†"çfÆ÷"’ÒÖF‚æ'2†çfÆ÷"’“°§Ð ¦gVæ7F–öâ6–4&÷fÅ&VF–ær†FVÖæB’°¢–b†FVÖæEG—T¶W’†FVÖæCòçF—ò’ÓÒ%4”2"’°¢&WGW&â²Æ&VÃ¢$ì:6ò:’4”2"Â7FGW3¢""ÂFF7FGW3¢$ì:6ò6RÆ–6"ÂFöæS¢&w&’"Ó°¢Ð¢–b‚†FVÖæBç6–4–G2ÇÂµÒ’æÆVæwF‚ÇÂFVÖæBç6–4&÷fÅ7FGW2ÓÓÒ%÷7FF"’°¢&WGW&â²Æ&VÃ¢%÷7FFæòUb"Â7FGW3¢%÷7FF"ÂFF7FGW3¢$&÷fFò"ÂFöæS¢&w&VVâ"Ó°¢Ð¢6öç7B7FGW2ÒFVÖæBç6–4&÷fÅ7FGW2ÇÂ%VæFVçFR#°¢–b‡7FGW2ÓÓÒ$&÷fFò"’&WGW&â²Æ&VÃ¢$&÷fF&÷7FvVÒ"Â7FGW2ÂFF7FGW3¢$&÷fFò"ÂFöæS¢&w&VVâ"Ó°¢–b‡7FGW2ÓÓÒ%&W&÷fFò"’&WGW&â²Æ&VÃ¢%&W&÷fF"Â7FGW2ÂFF7FGW3¢%&W&÷fFò"ÂFöæS¢'&VB"Ó°¢–b‡7FGW2ÓÓÒ$VÒ&Wf—<:6ò"’&WGW&â²Æ&VÃ¢$VÒ&Wf—<:6ò"Â7FGW2ÂFF7FGW3¢$6÷FFò"ÂFöæS¢&&ÇVR"Ó°¢&WGW&â²Æ&VÃ¢$wV&FæFò&÷f:|:6ò"Â7FGW3¢%VæFVçFR"ÂFF7FGW3¢%VæFVçFR"ÂFöæS¢&÷&ævR"Ó°§Ð ¦gVæ7F–öâ6–4&÷fÅfÇVR†FVÖæB’°¢–b‚†FVÖæBç6–4–G2ÇÂµÒ’æÆVæwF‚’°¢&WGW&â†FVÖæBç6–4–G2ÇÂµÒ¢æÖ‚†–B’Óâ7FFRç6–72æf–æB‚‡6–2’Óâ6–2æ–BÓÓÒ–B’¢æf–ÇFW"„&ööÆVâ¢ç&VGV6R‚‡7VÒÂ6–2’Óâ7VÒ²ÖF‚æ'2‡6–5F÷FÂ‡6–2’’Â“°¢Ð¢6öç7BG&gEF÷FÂÒ†FVÖæBç6–4G&gDF—66—Æ–æW2ÇÂµÒ’ç&VGV6R‚‡7VÒÂ—FVÒ’Óâ7VÒ²ÖF‚æ'2„çVÖ&W"†—FVÒçfÆ÷$FVÇF’ÇÂ’Â“°¢–b†G&gEF÷FÂ’&WGW&âG&gEF÷FÃ°¢&WGW&â°¢FVÖæBçfÆ÷%6–4†—7F÷&–6òÀ¢FVÖæBçfÆ÷%6–2À¢FVÖæBçfÆ÷$W7F–ÖFòÀ¢FVÖæBçfÆ÷%&Wf—7FòÀ¢FVÖæBç6–4ÖWFFFòçfÆ÷%6–2À¢FVÖæBç6–4ÖWFFFòçfÆ÷%&Wf—7FòÀ¢Òç&VGV6R‚‡F÷FÂÂfÇVR’Óâ°¢–b‡F÷FÂ’&WGW&âF÷FÃ°¢6öç7BF—&V7BÒçVÖ&W"‡fÇVR“°¢6öç7B'6VBÒçVÖ&W"æ—4f–æ—FR†F—&V7B’òF—&V7B¢'6T7W'&Væ7’‡fÇVR“°¢&WGW&âÖF‚æ'2‡'6VBÇÂ“°¢ÒÂ“°§Ð ¦gVæ7F–öâ6–4&÷fÄ—FV×2†–væ÷&U6V&6‚ÒfÇ6R’°¢6öç7BFW&×2Ò–væ÷&U6V&6‚òµÒ¢æ÷&ÖÆ—¦U6V&6…FW‡B‡6–56V&6…VW'’’ç7Æ—B‚õÇ2²ò’æf–ÇFW"„&ööÆVâ“°¢&WGW&â‡7FFRæFVÖæG2ÇÂµÒ¢æf–ÇFW"‚†FVÖæB’ÓâFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2"¢æÖ‚†FVÖæB’Óâ°¢6öç7Bv÷&²Òv÷&´'”–B†FVÖæBæö'&–B“°¢6öç7B–æfòÒFVÖæE6–4–æfò†FVÖæB’ÇÂ·Ó°¢6öç7B&÷fÂÒ6–4&÷fÅ&VF–ær†FVÖæB“°¢6öç7BfÇVRÒ6–4&÷fÅfÇVR†FVÖæB“°¢6öç7BFW‡BÒæ÷&ÖÆ—¦U6V&6…FW‡B…°¢FVÖæBæ–BÀ¢v÷&³òææöÖRÀ¢v÷&³òæ6öF–vô÷&–v–æÂÀ¢v÷&³òæ6†fUVæ–6À¢v÷&³òæ6–FFRÀ¢v÷&³òçVbÀ¢–æfòæÆV6öÔçVÖ&W"À¢–æfòçF—GVÆõ6–2À¢–æfòæçVÖW&õ6–2À¢–æfòææÆ—7F6ÆFV6æ–6À¢&÷fÂæÆ&VÂÀ¢FVÖæE7FGW4Æ&VÂ†FVÖæB’À¢Òæ¦ö–â‚""’“°¢&WGW&â²FVÖæBÂv÷&²Â–æfòÂ&÷fÂÂfÇVRÂ6V&6†&ÆUFW‡C¢FW‡BÓ°¢Ò¢æf–ÇFW"‚†—FVÒ’ÓâFW&×2æÆVæwF‚ÇÂFW&×2æWfW'’‚‡FW&Ò’Óâ—FVÒç6V&6†&ÆUFW‡Bæ–æ6ÇVFW2‡FW&Ò’’¢ç6÷'B‚†Â"’Óâ°¢6öç7B÷&FW"Ò²VæFVçFS¢Â&W&÷fFó¢"Â&÷fFó¢2Â÷7FF¢BÓ°¢&WGW&â†÷&FW%¶æ&÷fÂç7FGW5ÒÇÂ’’Ò†÷&FW%¶"æ&÷fÂç7FGW5ÒÇÂ’’ÇÂ"çfÇVRÒçfÇVS°¢Ò“°§Ð ¦gVæ7F–öâ6–4&÷fÄF6†&ö&DFF‚’°¢6öç7B—FV×2Ò6–4&÷fÄ—FV×2‚“°¢6öç7BÆÄ—FV×2Ò6–4&÷fÄ—FV×2‡G'VR“°¢6öç7BVæF–ærÒ—FV×2æf–ÇFW"‚†—FVÒ’Óâ—FVÒæ&÷fÂç7FGW2ÓÓÒ%VæFVçFR"“°¢6öç7B&÷fVBÒ—FV×2æf–ÇFW"‚†—FVÒ’Óâ—FVÒæ&÷fÂç7FGW2ÓÓÒ$&÷fFò"“°¢6öç7B&V¦V7FVBÒ—FV×2æf–ÇFW"‚†—FVÒ’Óâ—FVÒæ&÷fÂç7FGW2ÓÓÒ%&W&÷fFò"“°¢6öç7B÷7FVBÒ—FV×2æf–ÇFW"‚†—FVÒ’Óâ—FVÒæ&÷fÂç7FGW2ÓÓÒ%÷7FF"“°¢&WGW&â°¢—FV×2À¢ÆÄ—FV×2À¢VæF–ærÀ¢&÷fVBÀ¢&V¦V7FVBÀ¢÷7FVBÀ¢F÷FÅfÇVS¢—FV×2ç&VGV6R‚‡7VÒÂ—FVÒ’Óâ7VÒ²—FVÒçfÇVRÂ’À¢VæF–æufÇVS¢VæF–ærç&VGV6R‚‡7VÒÂ—FVÒ’Óâ7VÒ²—FVÒçfÇVRÂ’À¢Ó°§Ð ¦gVæ7F–öâ&VæFW%6–72‚’°¢6öç7Bf–Ww2Ò6–5f–WtÖWF‚“°¢–b‚f–Ww2ç6öÖR‚‡f–Wr’Óâf–Wræ–BÓÓÒ6–5f–WtÖöFR’’6–5f–WtÖöFRÒ'&W÷'B#°¢6öç7BFFÒ6–4F6†&ö&DFF‚“°¢6öç7B7F—fRÒf–Ww2æf–æB‚‡f–Wr’Óâf–Wræ–BÓÓÒ6–5f–WtÖöFR’ÇÂf–Ww5³Ó° ¢&WGW&â ¢G·&VæFW%v÷&·5FööÆ&"‚'6–72"Â$W7GVFòFR4”2w2"ÂG¶7F—fRçF—FÆWÒ+rG¶7F—fRç7V'F—FÆWÖ—Ð¢G·&VæFW%6–5f–WuF'2‚—Ð¢G·&VæFW%6–4f–ÇFW$&"†FF—Ð¢G·&VæFW%6–5f–Wr†FF—Ð¢°§Ð ¦gVæ7F–öâ6–5f–WtÖWF‚’°¢&WGW&â°¢°¢–C¢'&W÷'B"À¢Æ&VÃ¢$&6R÷W&6–öæÂ"À¢F—FÆS¢%4”72FFVÖæF÷W&6–öæÂ"À¢7V'F—FÆS¢$föçFR;¦æ–6¢6&G2FòF—ò4”27&–F÷2æFVÖæF÷W&6–öæÂ"À¢ÒÀ¢°¢–C¢&W†V7WF—fR"À¢Æ&VÃ¢$W†V7WF—fò"À¢F—FÆS¢%&VÆL;7&–òW†V7WF—fò"À¢7V'F—FÆS¢$ÆV—GW&F6'FV—&FR4”726F7G&F2æòfÇW†ò÷W&6–öæÂ"À¢ÒÀ¢°¢–C¢&F–væ÷7F–2"À¢Æ&VÃ¢$F–vì;77F–6ò"À¢F—FÆS¢%&VÆL;7&–òF–vì;77F–6ò"À¢7V'F—FÆS¢$Ö÷F—f÷2Â7FGW2ÂæÆ—7F2RF—öÆöv–2F24”72÷W&6–öæ—2"À¢ÒÀ¢°¢–C¢'W&f÷&Öæ6R"À¢Æ&VÃ¢%W&f÷&Öæ6R"À¢F—FÆS¢%&VÆL;7&–òW&f÷&Öæ6R"À¢7V'F—FÆS¢$WföÇ\:|:6òRF—7G&–'Vœ:|:6òF÷26&G2FR4”2æò¶æ&â"À¢ÒÀ¢°¢–C¢&&÷fÂ"À¢Æ&VÃ¢$&÷f:|:6ò"À¢F—FÆS¢$&÷f:|:6òR÷7FvVÒFR4”72"À¢7V'F—FÆS¢%4”72÷W&6–öæ—2wV&FæFò&÷f:|:6òÂ&÷fF2R÷7FF2æòUb"À¢ÒÀ¢Ó°§Ð ¦gVæ7F–öâ&VæFW%6–5f–WuF'2‚’°¢&WGW&â ¢Ææb6Æ73Ò'6–2×f–Wr×F'2"&–ÖÆ&VÃÒ%f—<;VW2FR4”72#à¢G·6–5f–WtÖWF‚¢æÖ€¢‡f–Wr’Óâ ¢Æ'WGFöâ6Æ73Ò"G·6–5f–WtÖöFRÓÓÒf–Wræ–Bò&—2Ö7F—fR"¢"'Ò"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'6WB×6–2×f–Wr"FF×f–WrÖÖöFSÒ"G·f–Wræ–GÒ#à¢G·f–WræÆ&VÇÐ¢Âö'WGFöãà¢ ¢¢æ¦ö–â‚""—Ð¢Âöæcà¢°§Ð ¦gVæ7F–öâ6–4F6†&ö&DFF†÷F–öç2Ò·Ò’°¢6öç7BÆÅ&V6÷&G2Ò6–4Æ–æU&V6÷&G2‚“°¢6öç7B&V6÷&G2Ò÷F–öç2æ–væ÷&U6V&6‚òÆÅ&V6÷&G2¢f–ÇFW%6–5&V6÷&G2†ÆÅ&V6÷&G2“°¢6öç7B&÷w2Ò6–57VÖÖ'•&÷w2‡&V6÷&G2“°¢6öç7B6ö×ÆWFVBÒ&V6÷&G2æf–ÇFW"‚‡&V6÷&B’Óâ&V6÷&Bç7FGW4–BÓÓÒ&6öæ6ÇV–Fò"“°¢6öç7B6æ6VÆVBÒ&V6÷&G2æf–ÇFW"‚‡&V6÷&B’Óâ&V6÷&Bç7FGW4–BÓÓÒ&6æ6VÆFò"“°¢6öç7BW6VBÒ&V6÷&G2æf–ÇFW"‚‡&V6÷&B’Óâ&V6÷&Bç7FGW4–BÓÓÒ'W6Fò"“°¢6öç7BF—&V7F÷"Ò&V6÷&G2æf–ÇFW"‚‡&V6÷&B’Óâ²&&÷f6ôF—&WF÷&–"Â&&÷fFôF—&WF÷&–%Òæ–æ6ÇVFW2‡&V6÷&Bç7FGW4–B’“°¢6öç7B–äfÆ÷rÒ&V6÷&G2æf–ÇFW"‚‡&V6÷&B’Óâ²&6öæ6ÇV–Fò"Â&6æ6VÆFò%Òæ–æ6ÇVFW2‡&V6÷&Bç7FGW4–B’“°¢6öç7BvVæW&FVEfÇVRÒ&V6÷&G2ç&VGV6R‚‡7VÒÂ&V6÷&B’Óâ7VÒ²„çVÖ&W"‡&V6÷&BçfÆ÷"’ÇÂ’Â“°¢&WGW&â°¢ÆÅ&V6÷&G2À¢&V6÷&G2À¢&÷w2À¢6ö×ÆWFVBÀ¢6æ6VÆVBÀ¢W6VBÀ¢F—&V7F÷"À¢–äfÆ÷rÀ¢vVæW&FVEfÇVRÀ¢æWD–×7C¢vVæW&FVEfÇVRÀ¢F÷FÄ'3¢vVæW&FVEfÇVRÀ¢–×7FVEv÷&·3¢æWr6WB‡&V6÷&G2æÖ‚‡&V6÷&B’ÓâG·&V6÷&Bæö'&×ÂG·&V6÷&BææöÖTö'&Ö’’ç6—¦RÀ¢Væ—VU6–73¢æWr6WB‡&V6÷&G2æÖ‚‡&V6÷&B’Óâ&V6÷&Bæ6&D–BÇÂ&V6÷&Bæ7F–öä–BÇÂ&V6÷&Bæ–B’’ç6—¦RÀ¢W&–öC¢6–5W&–öDÆ&VÂ‡&V6÷&G2’À¢Ó°§Ð ¦gVæ7F–öâf–ÇFW%6–5&V6÷&G2‡&V6÷&G2’°¢6öç7BFW&×2Òæ÷&ÖÆ—¦U6V&6…FW‡B‡6–56V&6…VW'’’ç7Æ—B‚õÇ2²ò’æf–ÇFW"„&ööÆVâ“°¢–b‚FW&×2æÆVæwF‚’&WGW&â&V6÷&G3°¢&WGW&â&V6÷&G2æf–ÇFW"‚‡&V6÷&B’Óâ°¢6öç7BFW‡BÒæ÷&ÖÆ—¦U6V&6…FW‡B…°¢&V6÷&Bæ–BÀ¢&V6÷&Bæö'&À¢&V6÷&BææöÖTö'&À¢&V6÷&BæF—66—Æ–æÀ¢&V6÷&BæÖ÷F—fòÀ¢&V6÷&BæÖ÷f–ÖVçFòÀ¢&V6÷&Bç7&–çBÀ¢&V6÷&BæW7FFòÀ¢&V6÷&BææÆ—7FÀ¢&V6÷&BçF—öÆöv–À¢&V6÷&Bæw'WòÀ¢&V6÷&Bç7FGW2À¢&V6÷&Bç6÷W&6RÀ¢&V6÷&BææòÀ¢Òæ¦ö–â‚""’“°¢&WGW&âFW&×2æWfW'’‚‡FW&Ò’ÓâFW‡Bæ–æ6ÇVFW2‡FW&Ò’“°¢Ò“°§Ð ¦gVæ7F–öâ6–5W&–öDÆ&VÂ‡&V6÷&G2’°¢6öç7BFFW2Ò&V6÷&G0¢æÖ‚‡&V6÷&B’Óâ7G&–ær‡&V6÷&BæFF÷7FvVÒÇÂ""’æÖF6‚‚õÆG³GÒÕÆG³'ÒÕÆG³'Òò“òå³ÒÇÂ7G&–ær‡&V6÷&BæFF÷7FvVÒÇÂ""’ç6Æ–6RƒÂ’¢æf–ÇFW"„&ööÆVâ¢ç6÷'B‚“°¢–b‚FFW2æÆVæwF‚’&WGW&â%W,:ÖöFòì:6ò–æf÷&ÖFò#°¢&WGW&âG¶FFUFW‡B†FFW5³Ò—ÒÒG¶FFUFW‡B†FFW5¶FFW2æÆVæwF‚ÒÒ—Ö°§Ð ¦gVæ7F–öâ6–4w&÷WVE&V6÷&G2‡&V6÷&G2ÂvWDÆ&VÂ’°¢6öç7BÖÒæWrÖ‚“°¢&V6÷&G2æf÷$V6‚‚‡&V6÷&B’Óâ°¢6öç7BÆ&VÂÒ6ÆVä–×÷'FVEFW‡B‡G—VöbvWDÆ&VÂÓÓÒ&gVæ7F–öâ"òvWDÆ&VÂ‡&V6÷&B’¢&V6÷&E¶vWDÆ&VÅÒ’ÇÂ$ì:6ò–æf÷&ÖFò#°¢6öç7B7W'&VçBÐ¢ÖævWB†Æ&VÂ’ÇÀ¢°¢Æ&VÂÀ¢fÆ÷#¢À¢6–væVC¢À¢6÷VçC¢À¢FF—F–öç3¢À¢7W&W76–öç3¢À¢6–4–G3¢æWr6WB‚’À¢v÷&´–G3¢æWr6WB‚’À¢Ó°¢6öç7BfÇVRÒçVÖ&W"‡&V6÷&BçfÆ÷"’ÇÂ°¢7W'&VçBçfÆ÷"³ÒÖF‚æ'2‡fÇVR“°¢7W'&VçBç6–væVB³ÒfÇVS°¢7W'&VçBæ6÷VçB³Ò°¢–b‡fÇVRãÒ’7W'&VçBæFF—F–öç2³ÒfÇVS°¢VÇ6R7W'&VçBç7W&W76–öç2³ÒÖF‚æ'2‡fÇVR“°¢7W'&VçBç6–4–G2æFB‡&V6÷&Bæ–B“°¢7W'&VçBçv÷&´–G2æFB†G·&V6÷&Bæö'&×ÂG·&V6÷&BææöÖTö'&Ö“°¢Öç6WB†Æ&VÂÂ7W'&VçB“°¢Ò“°¢&WGW&â²ââæÖçfÇVW2‚•Ð¢æÖ‚‡&÷r’Óâ‡°¢ââç&÷rÀ¢6–73¢&÷rç6–4–G2ç6—¦RÀ¢v÷&·3¢&÷rçv÷&´–G2ç6—¦RÀ¢Ò’¢ç6÷'B‚†Â"’Óâ"çfÆ÷"ÒçfÆ÷"“°§Ð ¦gVæ7F–öâ6–46÷7E&÷w2†f–VÆBÂÆ–Ö—BÒÂ&V6÷&G2Ò6–4Æ–æU&V6÷&G2‚’’°¢&WGW&â6–4w&÷WVE&V6÷&G2‡&V6÷&G2Âf–VÆB¢æÖ‚‡&÷r’Óâ‡²ââç&÷rÂfÆ÷#¢&÷rçfÆ÷"ÂG&–ÆÄf–VÆC¢f–VÆBÒ’¢ç6Æ–6RƒÂÆ–Ö—B“°§Ð ¦gVæ7F–öâ6–46÷VçE&÷w2†f–VÆBÂÆ–Ö—BÒÂ&V6÷&G2Ò6–4Æ–æU&V6÷&G2‚’’°¢&WGW&â6–4w&÷WVE&V6÷&G2‡&V6÷&G2Âf–VÆB¢æÖ‚‡&÷r’Óâ‡²ââç&÷rÂfÆ÷#¢&÷rç6–72ÂG&–ÆÄf–VÆC¢f–VÆBÒ’¢ç6÷'B‚†Â"’Óâ"çfÆ÷"ÒçfÆ÷"¢ç6Æ–6RƒÂÆ–Ö—B“°§Ð ¦gVæ7F–öâ&VæFW%6–4f–ÇFW$&"†FF’°¢–b‡6–5f–WtÖöFRÓÓÒ&&÷fÂ"’°¢6öç7B&÷fÄFFÒ6–4&÷fÄF6†&ö&DFF‚“°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò'6–2Öf–ÇFW"Ö&"6–2Ö&÷fÂÖf–ÇFW"Ö&"#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB6–2×6V&6‚Öf–VÆB#à¢Ç7ãä76—7FVçFRFR'W66F&÷f:|:6óÂ÷7ãà¢Æ–çWBFF×6–2×6V&6‚fÇVSÒ"G¶W66TGG&–'WFR‡6–56V&6…VW'’—Ò"Æ6V†öÆFW#Ò$'W66"÷"ö'&ÂÄT4ôÒÂL:×GVÆòÂæÆ—7FÂ7FGW2÷R6&Bâââ"óà¢ÂöÆ&VÃà¢ÆF—b6Æ73Ò'6–2Öf–ÇFW"×7VÖÖ'’#à¢Ç7ãâG¶&÷fÄFFæ—FV×2æÆVæwF‡Ò4”2‡2’æòf–ÇG&óÂ÷7ãà¢Ç7ãâG¶&÷fÄFFçVæF–æræÆVæwF‡ÒwV&FæFóÂ÷7ãà¢Ç7ãâG¶&÷fÄFFæ&÷fVBæÆVæwF‡Ò&÷fF3Â÷7ãà¢Ç7ãâG¶&÷fÄFFç÷7FVBæÆVæwF‡Ò÷7FF3Â÷7ãà¢Ç7ãâG¶ÖöæW’†&÷fÄFFçVæF–æufÇVR—ÒVÒì:Æ—6SÂ÷7ãà¢ÂöF—cà¢G·6–56V&6…VW'’òÆ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6ÆV"×6–2×6V&6‚#äÆ–×"'W66Âö'WGFöãæ¢"'Ð¢Â÷6V7F–öãà¢°¢Ð¢6öç7B7&–çG2ÒæWr6WB†FFç&V6÷&G2æÖ‚‡&V6÷&B’Óâ&V6÷&Bç7&–çB’æf–ÇFW"„&ööÆVâ’’ç6—¦S°¢6öç7B7FGW6W2ÒæWr6WB†FFç&V6÷&G2æÖ‚‡&V6÷&B’Óâ&V6÷&Bç7FGW2’æf–ÇFW"„&ööÆVâ’’ç6—¦S°¢6öç7BÖ÷F—fW2ÒæWr6WB†FFç&V6÷&G2æÖ‚‡&V6÷&B’Óâ&V6÷&BæÖ÷F—fò’æf–ÇFW"„&ööÆVâ’’ç6—¦S°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò'6–2Öf–ÇFW"Ö&"#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB6–2×6V&6‚Öf–VÆB#à¢Ç7ãä'W66"4”3Â÷7ãà¢Æ–çWBFF×6–2×6V&6‚fÇVSÒ"G¶W66TGG&–'WFR‡6–56V&6…VW'’—Ò"Æ6V†öÆFW#Ò$'W66"÷"4”2Â6&BÂö'&ÂÖ÷F—fòÂ7FGW2Â7&–çB÷RæÆ—7Fâââ"óà¢ÂöÆ&VÃà¢ÆF—b6Æ73Ò'6–2Öf–ÇFW"×7VÖÖ'’#à¢Ç7ãâG¶FFçVæ—VU6–77Ò4”73Â÷7ãà¢Ç7ãâG¶FFæ–×7FVEv÷&·7Òö'&3Â÷7ãà¢Ç7ãâG·7FGW6W7Ò7FGW3Â÷7ãà¢Ç7ãâG¶Ö÷F—fW7ÒÖ÷F—f÷3Â÷7ãà¢Ç7ãâG·7&–çG7Ò7&–çG3Â÷7ãà¢Ç7ãâG¶FFçW&–öGÓÂ÷7ãà¢ÂöF—cà¢G·6–56V&6…VW'’òÆ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6ÆV"×6–2×6V&6‚#äÆ–×"'W66Âö'WGFöãæ¢"'Ð¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ&VæFW%6–5f–Wr†FF’°¢6öç7Bf–Ww2Ò°¢&W÷'C¢&VæFW%6–5&W÷'Ef–WrÀ¢F–ÖVÆ–æS¢&VæFW%6–5F–ÖVÆ–æUf–WrÀ¢W†V7WF—fS¢&VæFW%6–4W†V7WF—fUf–WrÀ¢F–væ÷7F–3¢&VæFW%6–4F–væ÷7F–5f–WrÀ¢W&f÷&Öæ6S¢&VæFW%6–5W&f÷&Öæ6Uf–WrÀ¢&÷fÃ¢&VæFW%6–4&÷fÅf–WrÀ¢Ó°¢&WGW&â‡f–Ww5·6–5f–WtÖöFUÒÇÂ&VæFW%6–5&W÷'Ef–Wr’†FF“°§Ð ¦gVæ7F–öâ&VæFW%6–4&÷fÅf–Wr‚’²&WGW&âÇ6V7F–öâ–CÒ'6–4&÷fÄF6†&ö&B#ãÂ÷6V7F–öãâG·&VæFW%6–4&÷fÅ7–æ6VDÆ—7B‚—Ö²Ð ¦gVæ7F–öâ&VæFW%6–4&÷fÅ7–æ6VDÆ—7B‚’°¢6öç7BFFÒ6–4&÷fÄF6†&ö&DFF‚“°¢6öç7B&÷w2ÒFFæ—FV×3°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò'æVÂ6–2Ö&÷fÂ×æVÂ6–2Ö&÷fÂ×7–æ2ÖÆ—7B×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#äÆ—7F6–æ7&öæ—¦F4ÅB3cÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#äö–ò÷W&6–öæÂÆ–vFò÷26&G2Fò¶æ&ââ÷7FvVÒæòUb6öçF–çV&Æ÷VVFL:’&÷f:|:6òãÂ÷à¢ÂöF—cà¢G·&VæFW%6–4&÷fÅ7–æ6VE7VÖÖ'’†FF—Ð¢ÂöF—cà¢Ç6V7F–öâ6Æ73Ò'6–2Öf–ÇFW"Ö&"6–2Ö&÷fÂÖf–ÇFW"Ö&"#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB6–2×6V&6‚Öf–VÆB#à¢Ç7ãä'W66"æÆ—7F6–æ7&öæ—¦FÂ÷7ãà¢Æ–çWBFF×6–2×6V&6‚fÇVSÒ"G¶W66TGG&–'WFR‡6–56V&6…VW'’—Ò"Æ6V†öÆFW#Ò$'W66"÷"ö'&ÂÄT4ôÒÂL:×GVÆòÂæÆ—7FÂ7FGW2÷R6&Bâââ"óà¢ÂöÆ&VÃà¢G·6–56V&6…VW'’òÆ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6ÆV"×6–2×6V&6‚#äÆ–×"'W66Âö'WGFöãæ¢"'Ð¢Â÷6V7F–öãà¢G°¢&÷w2æÆVæwF€¢òÆF—b6Æ73Ò'F&ÆR×w&6–2Ö&÷fÂ×F&ÆR×w&#à¢ÇF&ÆR6Æ73Ò&FF×F&ÆR6–2Ö&÷fÂ×F&ÆR#à¢ÇF†VCà¢ÇG#à¢ÇFƒä6&CÂ÷Fƒà¢ÇFƒäö'&Â÷Fƒà¢ÇFƒäÄT4ôÒòL:×GVÆóÂ÷Fƒà¢ÇFƒäæÆ—7F5CÂ÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#åfÆ÷"&Wf—7FóÂ÷Fƒà¢ÇFƒå7FGW3Â÷Fƒà¢ÇFƒä:|:6óÂ÷Fƒà¢Â÷G#à¢Â÷F†VCà¢ÇF&öG“à¢G·&÷w2æÖ‡&VæFW%6–4&÷fÅ&÷r’æ¦ö–â‚""—Ð¢Â÷F&öG“à¢Â÷F&ÆSà¢ÂöF—cæ ¢¢ÆF—b6Æ73Ò&V×G’×7FFR#äæVæ‡VÖ4”2Væ6öçG&F&&÷f:|:6òæòf–ÇG&òGVÂãÂöF—cæ ¢Ð¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ&VæFW%6–4&÷fÅ7–æ6VE7VÖÖ'’†FF’°¢&WGW&â ¢ÆF—b6Æ73Ò'6–2Ö&÷fÂ×7–æ2×7VÖÖ'’#à¢Ç7ãâG¶FFæ—FV×2æÆVæwF‡Ò4”2‡2’æòf–ÇG&óÂ÷7ãà¢Ç7ãâG¶FFçVæF–æræÆVæwF‡ÒwV&FæFóÂ÷7ãà¢Ç7ãâG¶FFæ&÷fVBæÆVæwF‡Ò&÷fF3Â÷7ãà¢Ç7ãâG¶FFç÷7FVBæÆVæwF‡Ò÷7FF3Â÷7ãà¢Ç7G&öæsâG¶ÖöæW’†FFçVæF–æufÇVR—ÒVÒì:Æ—6SÂ÷7G&öæsà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW%6–4&÷fÅ&÷r†—FVÒ’°¢6öç7B²FVÖæBÂv÷&²Â–æfòÂ&÷fÂÂfÇVRÒÒ—FVÓ°¢6öç7B6ä&÷fRÒ&÷fÂç7FGW2ÓÒ$&÷fFò"bb&÷fÂç7FGW2ÓÒ%÷7FF#°¢6öç7B6å÷7BÒ&÷fÂç7FGW2ÓÓÒ$&÷fFò#°¢6öç7B6å&V¦V7BÒ&÷fÂç7FGW2ÓÒ%&W&÷fFò"bb&÷fÂç7FGW2ÓÒ%÷7FF#°¢&WGW&â ¢ÇG#à¢ÇFCà¢Ç7G&öæsâG¶FVÖæBæ–GÓÂ÷7G&öæsà¢Ç6ÖÆÃâG¶FVÖæE7FGW4Æ&VÂ†FVÖæB—Ò+rG·7&–çD'”–B†FVÖæBç7&–çD–B“òææöÖRÇÂ%6VÒ7&–çB'ÓÂ÷6ÖÆÃà¢Â÷FCà¢ÇFCà¢Ç7G&öæsâG·v÷&³òææöÖRÇÂ–æfòæö'&æöÖRÇÂ$ö'&ì:6òÆö6Æ—¦F'ÓÂ÷7G&öæsà¢Ç6ÖÆÃâGµ·v÷&³òæ6öF–vô÷&–v–æÂÇÂ–æfòæö'&çVÖ&W"Âv÷&³òæ6–FFRbbv÷&³òçVbòG·v÷&²æ6–FFWÒòG·v÷&²çVgÖ¢"%Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"+r"’ÇÂ%6VÒ&VfW,:¦æ6–'ÓÂ÷6ÖÆÃà¢Â÷FCà¢ÇFCà¢Ç7G&öæsâG¶–æfòæÆV6öÔçVÖ&W"bb–æfòæÆV6öÔçVÖ&W"ÓÒ.(	B"ò–æfòæÆV6öÔçVÖ&W"¢%6VÒÄT4ôÒ'ÓÂ÷7G&öæsà¢Ç6ÖÆÃâG¶–æfòçF—GVÆõ6–2ÇÂ%6VÒL:×GVÆò'ÓÂ÷6ÖÆÃà¢Â÷FCà¢ÇFCâG¶–æfòææÆ—7F6ÆFV6æ–6ÇÂFVÖæBææÆ—7F&W7öç6fVÂÇÂ.(	B'ÓÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG·fÇVRòÖöæW’‡fÇVR’¢.(	B'ÓÂ÷FCà¢ÇFCãÇ7â6Æ73Ò'7FGW2×–ÆÂ"FF×7FGW3Ò"G¶&÷fÂæFF7FGW7Ò#âG¶&÷fÂæÆ&VÇÓÂ÷7ããÂ÷FCà¢ÇFCà¢ÆF—b6Æ73Ò&–æÆ–æRÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷VâÖFVÖæBÖFWF–Â"FFÖ–CÒ"G¶FVÖæBæ–GÒ#ä'&—"6&CÂö'WGFöãà¢G¶6ä&÷fRòÆ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&&÷fR×6–2ÖFVÖæB"FFÖ–CÒ"G¶FVÖæBæ–GÒ#ä&÷f#Âö'WGFöãæ¢"'Ð¢G¶6å÷7BòÆ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'÷7B×6–2×FòÖWb"FFÖ–CÒ"G¶FVÖæBæ–GÒ#å÷7F"UcÂö'WGFöãæ¢"'Ð¢G¶6å&V¦V7BòÆ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ6ö×7BÖ7F–öâFævW"Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'&V¦V7B×6–2ÖFVÖæB"FFÖ–CÒ"G¶FVÖæBæ–GÒ#å&W&÷f#Âö'WGFöãæ¢"'Ð¢ÂöF—cà¢Â÷FCà¢Â÷G#à¢°§Ð ¦gVæ7F–öâ&VæFW%6–4·—2†FF’°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò&·’Öw&–B6–2Ö·’Öw&–B#à¢G¶·’‚%4”72"ÂçVÖ&W"†FFçVæ—VU6–72’Â$6&G2FòF—ò4”2æFVÖæF÷W&6–öæÂ"Â&&ÇVR"Â""Â'6–5F÷FÂ"—Ð¢G¶·’‚$VÒfÇW†ò"ÂçVÖ&W"†FFæ–äfÆ÷ræÆVæwF‚’Â$6&G2–æFì:6ò6öæ6Ç\:ÖF÷2÷R6æ6VÆF÷2"Â&÷&ævR"Â""Â'6–4–äfÆ÷r"—Ð¢G¶·’‚$F—&WF÷&–"ÂçVÖ&W"†FFæF—&V7F÷"æÆVæwF‚’Â$wV&FæFò&÷f:|:6ò÷R¬:&÷fF2VÆF—&WF÷&–"Â&&ÇVR"Â""Â'6–4F—&V7F÷""—Ð¢G¶·’‚$6öæ6Ç\:ÖF2"ÂçVÖ&W"†FFæ6ö×ÆWFVBæÆVæwF‚’Â$6&G26öæ6Ç\:ÖF÷2"Â&w&VVâ"Â""Â'6–46ö×ÆWFVB"—Ð¢G¶·’‚%fÆ÷"vW&Fò"ÂÖöæW”6ö×7B†FFævVæW&FVEfÇVR’ÂG¶ÖöæW’†FFævVæW&FVEfÇVR—Ò&Vv—7G&Fòæ÷26&G26öæ6Ç\:ÖF÷6Â&&ÇVR"Â""Â'6–5fÇVR"—Ð¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ&VæFW%6–5&W÷'Ef–Wr†FF’°¢&WGW&â ¢G·&VæFW%6–4·—2†FF—Ð¢ÆF—b6Æ73Ò&6öçFVçBÖw&–B6–2×&W÷'BÖw&–B#à¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#å4”72÷"Ö÷F—fóÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#äF—7G&–'Vœ:|:6òF÷2Ö÷F—f÷2–æf÷&ÖF÷2æ÷26&G3Â÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡6–46÷VçE&÷w2‚&Ö÷F—fò"ÂÂFFç&V6÷&G2’Â'fÆ÷""Â‡fÇVR’Óâ7G&–ær‡fÇVR’—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#å4”72÷"7FGW3Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#å÷6œ:|:6òGVÂF÷26&G2æòfÇW†ò÷W&6–öæÃÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡6–46÷VçE&÷w2‚'7FGW2"ÂÂFFç&V6÷&G2’Â'fÆ÷""Â‡fÇVR’Óâ7G&–ær‡fÇVR’—Ð¢Â÷6V7F–öãà¢ÂöF—cà¢ÆF—b6Æ73Ò&6öçFVçBÖw&–B6–2×&W÷'BÖw&–B#à¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#å4”72÷"æÆ—7FÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#åföÇVÖRFR6&G2÷"&W7öç<:fVÃÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡6–46÷VçE&÷w2‚&æÆ—7F"ÂÂFFç&V6÷&G2’Â'fÆ÷""Â‡fÇVR’Óâ7G&–ær‡fÇVR’—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#å4”72÷"F—öÆöv–Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#äF—7G&–'Vœ:|:6ò÷"F—òFRVæ–FFRFö'&f–æ7VÆFÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡6–46÷VçE&÷w2‚'F—öÆöv–"ÂÂFFç&V6÷&G2’Â'fÆ÷""Â‡fÇVR’Óâ7G&–ær‡fÇVR’—Ð¢Â÷6V7F–öãà¢ÂöF—cà¢G·&VæFW%6–4†—7F÷'•æVÂ†FFç&÷w2—Ð¢°§Ð ¦gVæ7F–öâ&VæFW%6–5F–ÖVÆ–æUf–Wr†FF’°¢6öç7BÖöçF‡2Ò6–5F–ÖVÆ–æU&÷w2†FFç&V6÷&G2Â&ÖöçF‚"“°¢6öç7B7&–çG2Ò6–5F–ÖVÆ–æU&÷w2†FFç&V6÷&G2Â'7&–çB"“°¢&WGW&â ¢G·&VæFW%6–4·—2†FF—Ð¢ÆF—b6Æ73Ò&6öçFVçBÖw&–B#à¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#äÜ:§2Ü:§3Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#ä–×7Fòf–ææ6V—&òRföÇVÖR÷"FFFR÷7FvVÓÂ÷à¢ÂöF—cà¢ÂöF—cà¢G·&VæFW%6–5F–ÖVÆ–æR†ÖöçF‡2Â&ÖöçF‚"—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#ä7V×VÆFóÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#ä7W'f7V×VÆFFR7W7FòR4”72æòW,:ÖöFóÂ÷à¢ÂöF—cà¢ÂöF—cà¢G·&VæFW%6–467V×VÆFVEF–ÖVÆ–æR†ÖöçF‡2—Ð¢Â÷6V7F–öãà¢ÂöF—cà¢ÆF—b6Æ73Ò&6öçFVçBÖw&–BF‡&VR#à¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#å4”72÷"7&–çCÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#åföÇVÖRFR6öÆ–6—F:|;VW2æò6–6Æò÷W&6–öæÃÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡7&–çG2ç6Æ–6RƒÂ"’æÖ‚‡&÷r’Óâ‡²Æ&VÃ¢&÷ræÆ&VÂÂfÆ÷#¢&÷rç6–72ÂG&–ÆÄf–VÆC¢'7&–çB"ÂG&–ÆÄÆ&VÃ¢&÷ræ¶W’Ò’’Â'fÆ÷""Â‡fÇVR’Óâ7G&–ær‡fÇVR’—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#ä7W7Fò÷"7&–çCÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#ä–×7Fòf–ææ6V—&ò÷"6–6ÆóÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡7&–çG2ç6Æ–6RƒÂ"’æÖ‚‡&÷r’Óâ‡²ââç&÷rÂG&–ÆÄf–VÆC¢'7&–çB"ÂG&–ÆÄÆ&VÃ¢&÷ræ¶W’Ò’’Â'fÆ÷""ÂÖöæW’—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#å4”72÷"Ü:§3Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#äÆV—GW&ÖVç6ÂFRföÇVÖRÂ6W&FFR7&–çCÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B†ÖöçF‡2æÖ‚‡&÷r’Óâ‡²ââç&÷rÂfÆ÷#¢&÷rç6–72ÂG&–ÆÄf–VÆC¢&ÖöçF‚"ÂG&–ÆÄÆ&VÃ¢&÷ræ¶W’Ò’’Â'fÆ÷""Â‡fÇVR’Óâ7G&–ær‡fÇVR’—Ð¢Â÷6V7F–öãà¢ÂöF—cà¢G·&VæFW%6–4†—7F÷'•æVÂ†FFç&÷w2ç6Æ–6RƒÂ#’—Ð¢°§Ð ¦gVæ7F–öâ&VæFW%6–4W†V7WF—fUf–Wr†FF’°¢&WGW&â ¢G·&VæFW%6–4·—2†FF—Ð¢ÆF—b6Æ73Ò&6öçFVçBÖw&–B6–2ÖW†V7WF—fRÖw&–B#à¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#äì+¢FRö'&2R4”73Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#å&W7VÖò÷"F—öÆöv–FVæ–FFSÂ÷à¢ÂöF—cà¢ÂöF—cà¢G·&VæFW%6–5G—öÆöw”6&G2‡6–4w&÷WVE&V6÷&G2†FFç&V6÷&G2Â'F—öÆöv–"’ç6Æ–6RƒÂr’—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#äì+¢FR4”72÷"F—öÆöv–Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#ä6ö×÷6œ:|:6òVçF—FF—fF6'FV—&Â÷à¢ÂöF—cà¢ÂöF—cà¢G·&VæFW%&–æt6†'B‡6–46÷VçE&÷w2‚'F—öÆöv–"Â‚ÂFFç&V6÷&G2’Â7G&–ær†FFçVæ—VU6–72’Â%4”72"—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#äì+¢FR4”72÷"W7FFóÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#ä6öæ6VçG&:|:6òvVöw,:f–6F÷2FW7f–÷3Â÷à¢ÂöF—cà¢ÂöF—cà¢G·&VæFW%6–57FFTw&–B‡6–4w&÷WVE&V6÷&G2†FFç&V6÷&G2Â&W7FFò"’ç6Æ–6RƒÂ"’—Ð¢Â÷6V7F–öãà¢ÂöF—cà¢ÆF—b6Æ73Ò'6–2×7VÖÖ'’×&–÷&—G’ÖÆ–÷WB#à¢Ç6V7F–öâ6Æ73Ò'æVÂ6–2Ö6ö×7B×7VÖÖ'’×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#åfÆ÷"vW&Fò÷"F—öÆöv–Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#åfÆ÷&W2&Vv—7G&F÷2æ÷26&G26öæ6Ç\:ÖF÷3Â÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡6–46÷7E&÷w2‚'F—öÆöv–"Â‚ÂFFç&V6÷&G2’Â'fÆ÷""ÂÖöæW”6ö×7B—Ð¢Â÷6V7F–öãà¢G·&VæFW%6–5F&ÆUæVÂ‚%Ææ–Æ†6öç6öÆ–FF÷"W7FFò"Â$&6R&–æ6—Â&ì:Æ—6R(	B6Æ—VRæ÷26&\:vÆ†÷2&÷&FVæ""Â6–4w&÷WVE&V6÷&G2†FFç&V6÷&G2Â&W7FFò"’Â$W7FFò"Â&W7FFò"—Ð¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW%6–4F–væ÷7F–5f–Wr†FF’°¢&WGW&â ¢G·&VæFW%6–4·—2†FF—Ð¢ÆF—b6Æ73Ò'6–2ÖæÇ—6—2Öw&–B#à¢Ç6V7F–öâ6Æ73Ò'æVÂ6–2×&æ¶–ær×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Ç7â6Æ73Ò'æVÂÖW–V'&÷r#äÔõD•dõ3Â÷7ãà¢Æƒ#äÖ÷F—f÷2Ö—2&V6÷'&VçFW3Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#åVçF–FFRFR4”72÷"Ö÷F—fò&Vv—7G&FóÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡6–46÷VçE&÷w2‚&Ö÷F—fò"ÂÂFFç&V6÷&G2’Â'fÆ÷""Â‡fÇVR’ÓâG·fÇVWÒ4”2G·fÇVRÓÓÒò""¢'2'Ö—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ6–2×&æ¶–ær×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Ç7â6Æ73Ò'æVÂÖW–V'&÷r#å5DEU3Â÷7ãà¢Æƒ#äF—7G&–'Vœ:|:6òFòfÇW†óÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#äöæFR÷26&G2W7L:6òæò¶æ&ãÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡6–46÷VçE&÷w2‚'7FGW2"ÂÂFFç&V6÷&G2’Â'fÆ÷""Â‡fÇVR’ÓâG·fÇVWÒ4”2G·fÇVRÓÓÒò""¢'2'Ö—Ð¢Â÷6V7F–öãà¢ÂöF—cà¢ÆF—b6Æ73Ò'6–2ÖæÇ—6—2Öw&–B#à¢Ç6V7F–öâ6Æ73Ò'æVÂ6–2×&æ¶–ær×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Ç7â6Æ73Ò'æVÂÖW–V'&÷r#ääÄ•5D3Â÷7ãà¢Æƒ#ä6'FV—&÷"æÆ—7FÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#åVçF–FFRFR4”726ö"&W7öç6&–Æ–FFSÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡6–46÷VçE&÷w2‚&æÆ—7F"ÂÂFFç&V6÷&G2’Â'fÆ÷""Â‡fÇVR’Óâ7G&–ær‡fÇVR’—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ6–2×&æ¶–ær×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Ç7â6Æ73Ò'æVÂÖW–V'&÷r#åD•ôÄôt”3Â÷7ãà¢Æƒ#ä6'FV—&÷"F—öÆöv–Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#åföÇVÖRFR4”72÷"F—òFRVæ–FFSÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡6–46÷VçE&÷w2‚'F—öÆöv–"ÂÂFFç&V6÷&G2’Â'fÆ÷""Â‡fÇVR’Óâ7G&–ær‡fÇVR’—Ð¢Â÷6V7F–öãà¢ÂöF—cà¢ÆF—b6Æ73Ò'6–2ÖgVÆÂ×F&ÆR×7F6²#à¢G·&VæFW%6–5F&ÆUæVÂ‚%&W7VÖò÷"Ö÷F—fò"Â$ö'&2R4”72÷"Ö÷F—fò6F7G&Fò"Â6–4w&÷WVE&V6÷&G2†FFç&V6÷&G2Â&Ö÷F—fò"’ç6Æ–6RƒÂ#’Â$Ö÷F—fò"Â&Ö÷F—fò"—Ð¢G·&VæFW%6–5F&ÆUæVÂ‚%&W7VÖò÷"7FGW2"Â$F—7G&–'Vœ:|:6òGVÂF÷26&G2"Â6–4w&÷WVE&V6÷&G2†FFç&V6÷&G2Â'7FGW2"’ç6Æ–6RƒÂ#’Â%7FGW2"Â'7FGW2"—Ð¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW%6–5W&f÷&Öæ6Uf–Wr†FF’°¢&WGW&â ¢G·&VæFW%6–4·—2†FF—Ð¢ÆF—b6Æ73Ò'6–2ÖæÇ—6—2Öw&–B#à¢Ç6V7F–öâ6Æ73Ò'æVÂ6–2×&æ¶–ær×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Ç7â6Æ73Ò'æVÂÖW–V'&÷r#ådôÅTÔSÂ÷7ãà¢Æƒ#å4”72÷"7FGW3Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#å'F–6—:|:6òFR6FWFFòfÇW†ò÷W&6–öæÃÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡6–46÷VçE&÷w2‚'7FGW2"ÂÂFFç&V6÷&G2’Â'fÆ÷""Â‡fÇVR’ÓâG·fÇVWÒ4”2G·fÇVRÓÓÒò""¢'2'Ö—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ6–2×&æ¶–ær×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Ç7â6Æ73Ò'æVÂÖW–V'&÷r#å$U5ôå4$”Ä”DDSÂ÷7ãà¢Æƒ#å4”72÷"æÆ—7FÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#äF—7G&–'Vœ:|:6òF6'FV—&÷W&6–öæÃÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡6–46÷VçE&÷w2‚&æÆ—7F"ÂÂFFç&V6÷&G2’Â'fÆ÷""Â‡fÇVR’Óâ7G&–ær‡fÇVR’—Ð¢Â÷6V7F–öãà¢ÂöF—cà¢ÆF—b6Æ73Ò'6–2ÖgVÆÂ×F&ÆR×7F6²#à¢G·&VæFW%6–5F&ÆUæVÂ‚$ö'&26öÒÖ—24”72"Â%&æ¶–ær÷"VçF–FFRFR6&G2"Â6–4w&÷WVE&V6÷&G2†FFç&V6÷&G2Â&æöÖTö'&"’ç6Æ–6RƒÂS’Â$ö'&"Â&æöÖTö'&"—Ð¢G·&VæFW%6–5F&ÆUæVÂ‚%4”72÷"F—öÆöv–"Â$F—7G&–'Vœ:|:6ò÷"F—òFRVæ–FFR"Â6–4w&÷WVE&V6÷&G2†FFç&V6÷&G2Â'F—öÆöv–"’ç6Æ–6RƒÂ3’Â%F—öÆöv–"Â'F—öÆöv–"—Ð¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW%&–æt6†'B†—FV×2Â6VçFW%fÇVRÂ6VçFW$Æ&VÂ’°¢–b‚—FV×2æÆVæwF‚’&WGW&âÆF—b6Æ73Ò&V×G’×7FFR#å6VÒFF÷2&W†–&—"ãÂöF—cæ°¢6öç7B6öÆ÷'2Ò²"3V6’"Â"3&cƒVB"Â"3†cV"Â"6cs“’"Â"3cv3–""Â"3–&"Â"6C“&C#"Â"6#ss“b%Ó°¢6öç7BF÷FÂÒ—FV×2ç&VGV6R‚‡7VÒÂ—FVÒ’Óâ7VÒ²ÖF‚æ'2†—FVÒçfÆ÷"ÇÂ’Â’ÇÂ°¢ÆWB7W'6÷"Ò°¢6öç7B7F÷2Ò—FV×0¢æÖ‚†—FVÒÂ–æFW‚’Óâ°¢6öç7B6†&RÒ„ÖF‚æ'2†—FVÒçfÆ÷"ÇÂ’òF÷FÂ’¢°¢6öç7B7F'BÒ7W'6÷#°¢7W'6÷"³Ò6†&S°¢&WGW&âG¶6öÆ÷'5¶–æFW‚R6öÆ÷'2æÆVæwF…×ÒG·7F'GÒRG¶7W'6÷'ÒV°¢Ò¢æ¦ö–â‚"Â"“°¢&WGW&â ¢ÆF—b6Æ73Ò'&–ær×æVÂ#à¢ÆF—b6Æ73Ò'&–ærÖ6†'B"7G–ÆSÒ&&6¶w&÷VæC¢6öæ–2Öw&F–VçB‚G·7F÷7Ò’#à¢Ç7ãâG¶6VçFW%fÇVWÓÂ÷7ãà¢Ç6ÖÆÃâG¶6VçFW$Æ&VÇÓÂ÷6ÖÆÃà¢ÂöF—cà¢ÆF—b6Æ73Ò'&–ærÖÆVvVæB#à¢G¶—FV×0¢æÖ€¢†—FVÒÂ–æFW‚’Óâ ¢Ç7ãà¢Æ’7G–ÆSÒ&&6¶w&÷VæC¢G¶6öÆ÷'5¶–æFW‚R6öÆ÷'2æÆVæwF…×Ò#ãÂö“à¢Ç7G&öæsâG¶—FVÒæÆ&VÇÓÂ÷7G&öæsà¢Ç6ÖÆÃâG¶çVÖ&W"†—FVÒçfÆ÷"ÇÂ—Ò4”2G´çVÖ&W"†—FVÒçfÆ÷"ÇÂ’ÓÓÒò""¢'2'ÓÂ÷6ÖÆÃà¢Â÷7ãà¢ ¢¢æ¦ö–â‚""—Ð¢ÂöF—cà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâf–VÆDÆ&VÂ†f–VÆB’°¢6öç7BÆ&VÇ2Ò°¢ÖöçFƒ¢$Ü:§2"À¢7&–çC¢%7&–çB"À¢Ö÷F—fó¢$Ö÷F—fò"À¢7FGW3¢%7FGW2"À¢F—öÆöv–¢%F—öÆöv–"À¢W7FFó¢$W7FFò"À¢æöÖTö'&¢$ö'&"À¢æÆ—7F¢$æÆ—7F"À¢Ó°¢&WGW&âÆ&VÇ5¶f–VÆEÒÇÂf–VÆC°§Ð ¦gVæ7F–öâ÷Vå6–56Æ–6TFWF–ÄÖöFÂ†f–VÆBÂÆ&VÂ’°¢6öç7B&V6÷&G2Òf–ÇFW%6–5&V6÷&G2‡6–4Æ–æU&V6÷&G2‚’’æf–ÇFW"‚‡&V6÷&B’Óâ°¢–b†f–VÆBÓÓÒ&ÖöçF‚"’°¢6öç7B¶W’Ò&V6÷&BæFF÷7FvVÒò&V6÷&BæFF÷7FvVÒç6Æ–6RƒÂr’¢'6VÒÖFF#°¢&WGW&â¶W’ÓÓÒÆ&VÃ°¢Ð¢–b†f–VÆBÓÓÒ'7&–çB"’°¢6öç7B&u7&–çBÒ6ÆVä–×÷'FVEFW‡B‡&V6÷&Bç7&–çBÇÂ.(	B"“°¢6öç7B7&–çDÆ&VÂÒæ÷&ÖÆ—¦U6V&6…FW‡B‡&u7&–çB’æ–æ6ÇVFW2‚'7&–çB"’ò&u7&–çB¢7&–çBG·&u7&–çGÖ°¢&WGW&â7&–çDÆ&VÂÓÓÒÆ&VÃ°¢Ð¢&WGW&â6ÆVä–×÷'FVEFW‡B‡&V6÷&E¶f–VÆEÒ’ÓÓÒÆ&VÃ°¢Ò“°¢6öç7BF—FÆRÒf–VÆBÓÓÒ&ÖöçF‚"ò†Æ&VÂÓÓÒ'6VÒÖFF"ò%6VÒFF"¢FFUFW‡B†G¶Æ&VÇÒÓ’’¢Æ&VÃ°¢6öç7B&÷w2Ò6–57VÖÖ'•&÷w2‡&V6÷&G2“°¢6öç7BvVæW&FVEfÇVRÒ&V6÷&G2ç&VGV6R‚‡7VÒÂ&V6÷&B’Óâ7VÒ²„çVÖ&W"‡&V6÷&BçfÆ÷"’ÇÂ’Â“°¢6öç7B–äfÆ÷rÒ&V6÷&G2æf–ÇFW"‚‡&V6÷&B’Óâ²&6öæ6ÇV–Fò"Â&6æ6VÆFò%Òæ–æ6ÇVFW2‡&V6÷&Bç7FGW4–B’’æÆVæwFƒ°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Ç6V7F–öâ6Æ73Ò&ÖöFÂÖ6&B·’ÖÖöFÂÖ6&B"&–ÖÆ&VÆÆVF'“Ò'6–56Æ–6UF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#äFWFÆ†RFR4”72÷W&6–öæ—3Â÷7ãà¢Æƒ"–CÒ'6–56Æ–6UF—FÆR#âG¶W66TGG&–'WFR‡F—FÆR—ÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#âG¶f–VÆDÆ&VÂ†f–VÆB—ÒÂG·&÷w2æÆVæwF‡Ò4”2‡2“Â÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&·’ÖFWF–ÂÖw&–B#à¢G·7Æ—D—FVÒ‚%4”72"Â7G&–ær‡&÷w2æÆVæwF‚’—Ð¢G·7Æ—D—FVÒ‚$VÒfÇW†ò"Â7G&–ær†–äfÆ÷r’—Ð¢G·7Æ—D—FVÒ‚$ö'&2"Â7G&–ær†æWr6WB‡&V6÷&G2æÖ‚‡&V6÷&B’ÓâG·&V6÷&Bæö'&×ÂG·&V6÷&BææöÖTö'&Ö’’ç6—¦R’—Ð¢G·7Æ—D—FVÒ‚%fÆ÷"vW&Fò"ÂÖöæW’†vVæW&FVEfÇVR’—Ð¢ÂöF—cà¢G·&VæFW%6–5&V6÷&G5F&ÆR‡&V6÷&G2—Ð¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#äfV6†#Âö'WGFöãà¢Âöfö÷FW#à¢Â÷6V7F–öãà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ÷Vå6–5F–ÖVÆ–æTFWF–ÄÖöFÂ†ÖöFRÂ¶W’’°¢÷Vå6–56Æ–6TFWF–ÄÖöFÂ†ÖöFRÓÓÒ&ÖöçF‚"ò&ÖöçF‚"¢'7&–çB"Â¶W’“°§Ð ¦gVæ7F–öâ6–5F–ÖVÆ–æU&÷w2‡&V6÷&G2ÂÖöFR’°¢6öç7BÖÒæWrÖ‚“°¢&V6÷&G2æf÷$V6‚‚‡&V6÷&B’Óâ°¢6öç7B&u7&–çBÒ6ÆVä–×÷'FVEFW‡B‡&V6÷&Bç7&–çBÇÂ.(	B"“°¢6öç7B7&–çDÆ&VÂÒæ÷&ÖÆ—¦U6V&6…FW‡B‡&u7&–çB’æ–æ6ÇVFW2‚'7&–çB"’ò&u7&–çB¢7&–çBG·&u7&–çGÖ°¢6öç7B¶W’ÒÖöFRÓÓÒ&ÖöçF‚"ò‡&V6÷&BæFF÷7FvVÒò&V6÷&BæFF÷7FvVÒç6Æ–6RƒÂr’¢'6VÒÖFF"’¢7&–çDÆ&VÃ°¢6öç7BÆ&VÂÐ¢ÖöFRÓÓÒ&ÖöçF‚ ¢ò¶W’ÓÓÒ'6VÒÖFF ¢ò%6VÒFF ¢¢æWrFFR†G¶¶W—ÒÓC££’çFôÆö6ÆTFFU7G&–ær‚'BÔ%""Â²ÖöçFƒ¢'6†÷'B"Â–V#¢#"ÖF–v—B"Ò’ç&WÆ6R‚"â"Â""¢¢¶W“°¢6öç7B7W'&VçBÒÖævWB†¶W’’ÇÂ²¶W’ÂÆ&VÂÂfÆ÷#¢Â6–4–G3¢æWr6WB‚’Ó°¢7W'&VçBçfÆ÷"³ÒÖF‚æ'2‡&V6÷&BçfÆ÷"ÇÂ“°¢7W'&VçBç6–4–G2æFB‡&V6÷&Bæ–B“°¢Öç6WB†¶W’Â7W'&VçB“°¢Ò“°¢&WGW&â²ââæÖçfÇVW2‚•Ð¢æÖ‚‡&÷r’Óâ‡²ââç&÷rÂ6–73¢&÷rç6–4–G2ç6—¦RÒ’¢ç6÷'B‚†Â"’Óâ7G&–ær†æ¶W’’æÆö6ÆT6ö×&R…7G&–ær†"æ¶W’’Â'BÔ%""Â²çVÖW&–3¢G'VRÒ’“°§Ð ¦gVæ7F–öâ&VæFW%6–5F–ÖVÆ–æR‡&÷w2ÂÖöFRÒ&ÖöçF‚"’°¢–b‚&÷w2æÆVæwF‚’&WGW&âÆF—b6Æ73Ò&V×G’×7FFR#å6VÒFF÷2FRÆ–æ†FòFV×òãÂöF—cæ°¢6öç7BÖ‚ÒÖF‚æÖ‚‚ââç&÷w2æÖ‚‡&÷r’Óâ&÷rçfÆ÷"’Â“°¢&WGW&â ¢ÆF—b6Æ73Ò'6–2×F–ÖVÆ–æR#à¢G·&÷w0¢æÖ€¢‡&÷r’Óâ ¢Æ'F–6ÆR&öÆSÒ&'WGFöâ"F&–æFWƒÒ#"FFÖ7F–öãÒ&÷Vâ×6–2×F–ÖVÆ–æR"FFÖÖöFSÒ"G¶ÖöFWÒ"FFÖ¶W“Ò"G¶W66TGG&–'WFR‡&÷ræ¶W’—Ò#à¢Ç7ãâG·&÷ræÆ&VÇÓÂ÷7ãà¢Æ“ãÆVÒ7G–ÆSÒ&†V–v‡C¢G´ÖF‚æÖ‚‚‡&÷rçfÆ÷"òÖ‚’¢Â‚—ÒR#ãÂöVÓãÂö“à¢Ç7G&öæsâG·&÷rç6–77ÓÂ÷7G&öæsà¢Ç6ÖÆÃâG¶ÖöæW’‡&÷rçfÆ÷"—ÓÂ÷6ÖÆÃà¢Âö'F–6ÆSà¢ ¢¢æ¦ö–â‚""—Ð¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW%6–467V×VÆFVEF–ÖVÆ–æR‡&÷w2’°¢–b‚&÷w2æÆVæwF‚’&WGW&âÆF—b6Æ73Ò&V×G’×7FFR#å6VÒFF÷27V×VÆF÷2ãÂöF—cæ°¢ÆWB67V×VÆFVEfÇVRÒ°¢ÆWB67V×VÆFVE6–72Ò°¢6öç7B67V×VÆFVBÒ&÷w2æÖ‚‡&÷r’Óâ°¢67V×VÆFVEfÇVR³Ò&÷rçfÆ÷#°¢67V×VÆFVE6–72³Ò&÷rç6–73°¢&WGW&â²ââç&÷rÂfÆ÷#¢67V×VÆFVEfÇVRÂ6–73¢67V×VÆFVE6–72Ó°¢Ò“°¢&WGW&â&VæFW%6–5F–ÖVÆ–æR†67V×VÆFVBÂ&ÖöçF‚"“°§Ð ¦gVæ7F–öâ&VæFW%6–5G—öÆöw”6&G2‡&÷w2’°¢–b‚&÷w2æÆVæwF‚’&WGW&âÆF—b6Æ73Ò&V×G’×7FFR#å6VÒF—öÆöv–2&Vv—7G&F2ãÂöF—cæ°¢&WGW&â ¢ÆF—b6Æ73Ò'6–2×G—öÆöw’Ö6&G2#à¢G·&÷w0¢æÖ€¢‡&÷r’Óâ ¢Æ'F–6ÆR&öÆSÒ&'WGFöâ"F&–æFWƒÒ#"FFÖ7F–öãÒ&÷Vâ×6–2×6Æ–6R"FFÖf–VÆCÒ'F—öÆöv–"FFÖÆ&VÃÒ"G¶W66TGG&–'WFR‡&÷ræÆ&VÂ—Ò#à¢Ç7G&öæsâG·&÷rçv÷&·7ÓÂ÷7G&öæsà¢Ç7ãäö'&3Â÷7ãà¢Ç7G&öæsâG·&÷rç6–77ÓÂ÷7G&öæsà¢Ç7ãå4”73Â÷7ãà¢Æ#âG·&÷ræÆ&VÇÓÂö#à¢Âö'F–6ÆSà¢ ¢¢æ¦ö–â‚""—Ð¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW%6–57FFTw&–B‡&÷w2’°¢–b‚&÷w2æÆVæwF‚’&WGW&âÆF—b6Æ73Ò&V×G’×7FFR#å6VÒW7FF÷2&Vv—7G&F÷2ãÂöF—cæ°¢6öç7BÖ‚ÒÖF‚æÖ‚‚ââç&÷w2æÖ‚‡&÷r’Óâ&÷rç6–72’Â“°¢&WGW&â ¢ÆF—b6Æ73Ò'6–2×7FFRÖw&–B#à¢G·&÷w0¢æÖ€¢‡&÷r’Óâ ¢Æ'F–6ÆR7G–ÆSÒ"Ò×vV–v‡C¢G´ÖF‚æÖ‚‚‡&÷rç6–72òÖ‚’¢Â—ÒR"&öÆSÒ&'WGFöâ"F&–æFWƒÒ#"FFÖ7F–öãÒ&÷Vâ×6–2×6Æ–6R"FFÖf–VÆCÒ&W7FFò"FFÖÆ&VÃÒ"G¶W66TGG&–'WFR‡&÷ræÆ&VÂ—Ò#à¢Ç7G&öæsâG·&÷ræÆ&VÇÓÂ÷7G&öæsà¢Ç7ãâG·&÷rç6–77Ò4”72ÂG·&÷rçv÷&·7Òö'&3Â÷7ãà¢Ç6ÖÆÃâG¶ÖöæW’‡&÷rçfÆ÷"—ÓÂ÷6ÖÆÃà¢Âö'F–6ÆSà¢ ¢¢æ¦ö–â‚""—Ð¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW%6–5F&ÆUæVÂ‡F—FÆRÂ7V'F—FÆRÂ&÷w2ÂÆ&VÅF—FÆRÂf–VÆBÒ""’°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò'æVÂ6–2×F&ÆR×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#âG·F—FÆWÓÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#âG·7V'F—FÆWÓÂ÷à¢ÂöF—cà¢ÂöF—cà¢ÆF—b6Æ73Ò'F&ÆR×w&#à¢ÇF&ÆR6Æ73Ò&FF×F&ÆR#à¢ÇF†VCà¢ÇG#à¢ÇFƒâG¶Æ&VÅF—FÆRÇÂ$6FVv÷&–'ÓÂ÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#äö'&3Â÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#å4”73Â÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#ä7W7FóÂ÷Fƒà¢Â÷G#à¢Â÷F†VCà¢ÇF&öG“à¢G·&÷w0¢æÖ€¢‡&÷r’Óâ ¢ÇG"G¶f–VÆBòFFÖ7F–öãÒ&÷Vâ×6–2×6Æ–6R"FFÖf–VÆCÒ"G¶f–VÆGÒ"FFÖÆ&VÃÒ"G¶W66TGG&–'WFR‡&÷ræÆ&VÂÇÂ&÷rææöÖTö'&—Ò"&öÆSÒ&'WGFöâ"F&–æFWƒÒ#&¢"'Óà¢ÇFCãÇ7G&öæsâG·&÷ræÆ&VÂÇÂ&÷rææöÖTö'&ÓÂ÷7G&öæsãÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG·&÷rçv÷&·2ÇÂ.(	B'ÓÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG·&÷rç6–72ÇÂ&÷ræ–BÇÂ.(	B'ÓÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG¶ÖöæW’„ÖF‚æ'2‡&÷rçfÆ÷"ÇÂ’—ÓÂ÷FCà¢Â÷G#à¢ ¢¢æ¦ö–â‚""—Ð¢Â÷F&öG“à¢Â÷F&ÆSà¢ÂöF—cà¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ&VæFW%6–4†—7F÷'•æVÂ‡&÷w2’°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#ä&6RFR4”72FFVÖæF÷W&6–öæÃÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#äW7F&6R:’f÷&ÖFW†6ÇW6—fÖVçFRVÆ÷26&G2FòF—ò4”27&–F÷2æò¶æ&â÷W&6–öæÃÂ÷à¢ÂöF—cà¢ÂöF—cà¢ÆF—b6Æ73Ò'F&ÆR×w&#à¢ÇF&ÆR6Æ73Ò&FF×F&ÆR#à¢ÇF†VCà¢ÇG#à¢ÇFƒå4”2ò6&CÂ÷Fƒà¢ÇFƒäö'&Â÷Fƒà¢ÇFƒäÖ÷F—fóÂ÷Fƒà¢ÇFƒå7FGW3Â÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#åfÆ÷"vW&FóÂ÷Fƒà¢ÇFƒå7&–çBòæÆ—7FÂ÷Fƒà¢ÇFƒäFFFR7&–:|:6óÂ÷Fƒà¢Â÷G#à¢Â÷F†VCà¢ÇF&öG“à¢G°¢&÷w2æÆVæwF€¢ò&÷w0¢ç6Æ–6RƒÂ#S¢æÖ€¢‡6–2’Óâ ¢ÇG"FFÖ7F–öãÒ&÷Vâ×6–2ÖFWF–Â"FFÖ¶W“Ò"G¶W66TGG&–'WFR‡6–57VÖÖ'”¶W’‡6–2’—Ò"&öÆSÒ&'WGFöâ"F&–æFWƒÒ##à¢ÇFCãÇ7G&öæsâG¶W66TGG&–'WFR‡6–2æ–B—ÓÂ÷7G&öæsãÆ'"óãÇ7â6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR‡6–2æ6&D–BÇÂ6–2æ7F–öä–BÇÂ""—ÓÂ÷7ããÂ÷FCà¢ÇFCãÇ7G&öæsâG¶W66TGG&–'WFR‡6–2ææöÖTö'&—ÓÂ÷7G&öæsãÆ'"óãÇ7â6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR†G·6–2æö'&ÒÂG·6–2æW7FF÷Ö—ÓÂ÷7ããÂ÷FCà¢ÇFCâG·6–2æÖ÷F—f÷2ç6Æ–6RƒÂ"’æÖ‚†—FVÒ’ÓâÇ7â6Æ73Ò'Fr#âG¶W66TGG&–'WFR†—FVÒ—ÓÂ÷7ãæ’æ¦ö–â‚""—ÓÂ÷FCà¢ÇFCãÇ7â6Æ73Ò'7FGW2×–ÆÂ#âG¶W66TGG&–'WFR‡6–2ç7FGW2—ÓÂ÷7ããÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG¶ÖöæW’‡6–2çfÆ÷"—ÓÂ÷FCà¢ÇFCâG¶W66TGG&–'WFR‡6–2ç7&–çB—ÓÆ'"óãÇ7â6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR‡6–2ææÆ—7F—ÓÂ÷7ããÂ÷FCà¢ÇFCâG·6–2æFF÷7FvVÒòFFUFW‡B‡6–2æFF÷7FvVÒ’¢.(	B'ÓÂ÷FCà¢Â÷G#à¢ ¢¢æ¦ö–â‚""¢¢ÇG#ãÇFB6öÇ7ãÒ#r#ãÆF—b6Æ73Ò&V×G’×7FFR#äæVæ‡VÒ6&BFR4”2fö’7&–FòæFVÖæF÷W&6–öæÂãÂöF—cãÂ÷FCãÂ÷G#æ ¢Ð¢Â÷F&öG“à¢Â÷F&ÆSà¢ÂöF—cà¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ6–57VÖÖ'”¶W’‡6–2’°¢&WGW&âG·6–2ç6÷W&6W×ÂG·6–2æ–G×ÂG·6–2æö'&×ÂG·6–2ææöÖTö'&×ÂG·6–2æÖ÷f–ÖVçF÷Ö°§Ð ¦gVæ7F–öâ÷Vå6–4FWF–ÄÖöFÂ†¶W’’°¢6öç7B&÷rÒ6–57VÖÖ'•&÷w2‡6–4Æ–æU&V6÷&G2‚’’æf–æB‚‡6–2’Óâ6–57VÖÖ'”¶W’‡6–2’ÓÓÒ¶W’“°¢–b‚&÷r’&WGW&ã°¢6öç7B&VÆFVBÒ6–4Æ–æU&V6÷&G2‚’æf–ÇFW"‚‡&V6÷&B’Óâ6–57VÖÖ'”¶W’‡&V6÷&B’ÓÓÒ¶W’“°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Ç6V7F–öâ6Æ73Ò&ÖöFÂÖ6&B·’ÖÖöFÂÖ6&B"&–ÖÆ&VÆÆVF'“Ò'6–4FWF–ÅF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#å4”2FFVÖæF÷W&6–öæÃÂ÷7ãà¢Æƒ"–CÒ'6–4FWF–ÅF—FÆR#âG¶W66TGG&–'WFR‡&÷ræ–B—ÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR‡&÷rææöÖTö'&—ÒÂG¶W66TGG&–'WFR‡&÷ræö'&—ÒÂG¶W66TGG&–'WFR‡&÷ræW7FFò—ÓÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&·’ÖFWF–ÂÖw&–B#à¢G·7Æ—D—FVÒ‚%7FGW2"Â&÷rç7FGW2ÇÂ.(	B"—Ð¢G·7Æ—D—FVÒ‚$Ö÷F—fò"Â&÷ræÖ÷F—f÷3òæ¦ö–â‚"Â"’ÇÂ&÷ræÖ÷F—fòÇÂ.(	B"—Ð¢G·7Æ—D—FVÒ‚$æÆ—7F"Â&÷rææÆ—7FÇÂ.(	B"—Ð¢G·7Æ—D—FVÒ‚%fÆ÷"vW&Fò"ÂÖöæW’‡&÷rçfÆ÷"’—Ð¢ÂöF—cà¢G·&VæFW%6–5&V6÷&G5F&ÆR‡&VÆFVB—Ð¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢G·&÷ræ7F–öä–BòÆ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷VâÖFVÖæBÖFWF–Â"FFÖ–CÒ"G¶W66TGG&–'WFR‡&÷ræ7F–öä–B—Ò#ä'&—"6&B÷W&6–öæÃÂö'WGFöãæ¢"'Ð¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#äfV6†#Âö'WGFöãà¢Âöfö÷FW#à¢Â÷6V7F–öãà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ&VæFW%6–5&V6÷&G5F&ÆR‡&V6÷&G2’°¢6öç7B7VÖÖ&–W2Ò6–57VÖÖ'•&÷w2‡&V6÷&G2“°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò'æVÂ6ögB×æVÂ6–2Ö†—7F÷'’ÖFWF–Â×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ3äFF÷2Fò6&CÂöƒ3à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#ä–æf÷&Ö:|;VW2G&¦–F2F—&WFÖVçFRFFVÖæF÷W&6–öæÃÂ÷à¢ÂöF—cà¢ÂöF—cà¢ÆF—b6Æ73Ò'F&ÆR×w&#à¢ÇF&ÆR6Æ73Ò&FF×F&ÆR#à¢ÇF†VCà¢ÇG#à¢ÇFƒä6&CÂ÷Fƒà¢ÇFƒå4”2òÄT4ôÓÂ÷Fƒà¢ÇFƒäö'&Â÷Fƒà¢ÇFƒäÖ÷F—fóÂ÷Fƒà¢ÇFƒå7FGW3Â÷Fƒà¢ÇFƒå7&–çBòæÆ—7FÂ÷Fƒà¢Â÷G#à¢Â÷F†VCà¢ÇF&öG“à¢G·7VÖÖ&–W0¢æÖ€¢‡6–2’Óâ ¢ÇG#à¢ÇFCãÇ7G&öæsâG¶W66TGG&–'WFR‡6–2æ6&D–BÇÂ6–2æ7F–öä–BÇÂ.(	B"—ÓÂ÷7G&öæsãÂ÷FCà¢ÇFCãÇ7G&öæsâG¶W66TGG&–'WFR‡6–2æ–B—ÓÂ÷7G&öæsãÆ'"óãÇ7â6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR‡6–2æÆV6öÒÇÂ""—ÓÂ÷7ããÂ÷FCà¢ÇFCãÇ7G&öæsâG¶W66TGG&–'WFR‡6–2ææöÖTö'&—ÓÂ÷7G&öæsãÆ'"óãÇ7â6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR‡6–2æW7FFò—ÓÂ÷7ããÂ÷FCà¢ÇFCâG¶W66TGG&–'WFR‡6–2æÖ÷F—f÷2ç6Æ–6RƒÂ2’æ¦ö–â‚"Â"’—ÓÂ÷FCà¢ÇFCâG¶W66TGG&–'WFR‡6–2ç7FGW2—ÓÂ÷FCà¢ÇFCâG¶W66TGG&–'WFR‡6–2ç7&–çB—ÓÆ'"óãÇ7â6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR‡6–2ææÆ—7F—ÓÂ÷7ããÂ÷FCà¢Â÷G#à¢ ¢¢æ¦ö–â‚""’ÇÂÇG#ãÇFB6öÇ7ãÒ#b#ãÆF—b6Æ73Ò&V×G’×7FFR#å6VÒ&Vv—7G&÷2&W7FR&V6÷'FRãÂöF—cãÂ÷FCãÂ÷G#æÐ¢Â÷F&öG“à¢Â÷F&ÆSà¢ÂöF—cà¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ&VæFW$æÇ—F–72‚’°¢6öç7B6÷7DFFÒ6÷7EW$Ó$'”F—66—Æ–æR‚’ç6Æ–6RƒÂ’“°¢6öç7BföÆF–Æ—G’ÒföÆF–Æ—G”'”F—66—Æ–æR‚’ç6Æ–6RƒÂ’“°¢6öç7BG—öÆöw’Ò6W„'•G—öÆöw’‚“° ¢&WGW&â ¢G·&VæFW%FööÆ&"‚$F—66—Æ–æbF—öÆöv–"Â$7W7Fò÷"Ü+"ÂFW7f–òRföÆF–Æ–FFR÷"F—66—Æ–æ"Â""ÂÖöGVÆT†VFW'2æ'VFvWB—Ð¢Ç6V7F–öâ6Æ73Ò&·’Öw&–B#à¢G¶·’‚$F—66—Æ–æ2&7G&VF2"Â7G&–ær†6öæf–wW&VDF—66—Æ–æW2‡²–æ6ÇVFT–æ7F—fS¢fÇ6RÒ’æf–ÇFW"‚†—FVÒ’Óâ—FVÒç6VÆV6–öæfVÅ&4”2’æÆVæwF‚’Â$F–6–öì:&–ò6ì;Fæ–6òF—fò"Â&&ÇVR"—Ð¢G¶·’‚%föÆF–Æ–FFR&÷fF"ÂÖöæW’†&÷fVE6–5F÷FÂ‚’’Â%6öÖFR4”72&÷fF2"Â&÷&ævR"—Ð¢G¶·’‚%F—öÆöv–2"Â7G&–ær†æWr6WB‡7FFRçv÷&·2æÖ‚‡v÷&²’Óâv÷&²çF—öÆöv–ö'&’’ç6—¦R’Â%6VvÖVçF÷26öÒö'&26F7G&F2"Â&w&VVâ"—Ð¢G¶·’‚$—FVç2&Æ÷VVF÷2"Â#""Â%4”2w2RF†FR&—66ò"Â'&VB"—Ð¢Â÷6V7F–öãà ¢ÆF—b6Æ73Ò&6öçFVçBÖw&–BF‡&VR#à¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#ä7W7Fò÷"Ü+#Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#åF÷F—66—Æ–æ3Â÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B†6÷7DFFÂ'fÆ÷""Â‡fÇVR’ÓâG¶ÖöæW’‡fÇVR—ÒöÜ+&—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#åföÆF–Æ–FFSÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#å4”72&÷fF2÷"F—66—Æ–æÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡föÆF–Æ—G’Â'fÆ÷""ÂÖöæW’—Ð¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#ä4U‚÷"F—öÆöv–Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#ä÷,:vFò²F—F—fFò&÷fFóÂ÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B‡G—öÆöw’Â'fÆ÷""ÂÖöæW’—Ð¢Â÷6V7F–öãà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW%7WÆ–W'2‚’°¢&WGW&â ¢G·&VæFW%FööÆ&"‚$f÷&æV6VF÷&W2"Â$6öçG&F:|;VW2W7G'WGW&F2÷"ö'&RF—66—Æ–æ"Â ¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷VâÖ6öçG&7B#äæ÷f6öçG&F:|:6óÂö'WGFöãà¢ÂÖöGVÆT†VFW'2æ'VFvWB—Ð¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#äV×&W626F7G&F3Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#ä6F7G&ò6VçG&Â&WWF–Æ—¬:fVÂVçG&Rö'&3Â÷à¢ÂöF—cà¢ÂöF—cà¢ÆF—b6Æ73Ò'F&ÆR×w&#à¢ÇF&ÆR6Æ73Ò&FF×F&ÆR#à¢ÇF†VCà¢ÇG#à¢ÇFƒäf÷&æV6VF÷#Â÷Fƒà¢ÇFƒä4å£Â÷Fƒà¢ÇFƒä6öçFFóÂ÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#ä6öçG&FFóÂ÷Fƒà¢Â÷G#à¢Â÷F†VCà¢ÇF&öG“à¢G·7FFRç7WÆ–W'0¢æÖ‚‡7WÆ–W"’Óâ°¢6öç7BF÷FÂÒ7FFRæ6öçG&7G0¢æf–ÇFW"‚†6öçG&7B’Óâ6öçG&7Bæf÷&æV6VF÷$–BÓÓÒ7WÆ–W"æ–B¢ç&VGV6R‚‡7VÒÂ6öçG&7B’Óâ7VÒ²6öçG&7BçfÆ÷"Â“°¢&WGW&â ¢ÇG#à¢ÇFCãÇ7G&öæsâG·7WÆ–W"ç&¦õ6ö6–ÇÓÂ÷7G&öæsãÂ÷FCà¢ÇFCâG·7WÆ–W"æ6ç§ÓÂ÷FCà¢ÇFCâG·7WÆ–W"æ6öçFFõ&–æ6—ÇÓÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG¶ÖöæW’‡F÷FÂ—ÓÂ÷FCà¢Â÷G#à¢°¢Ò¢æ¦ö–â‚""—Ð¢Â÷F&öG“à¢Â÷F&ÆSà¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#ä6öçG&F:|;VW3Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#åfÆ÷&W26öç7VÖ–æFò6ÆFò÷"F—66—Æ–æÂ÷à¢ÂöF—cà¢ÂöF—cà¢ÆF—b6Æ73Ò'F&ÆR×w&#à¢ÇF&ÆR6Æ73Ò&FF×F&ÆR#à¢ÇF†VCà¢ÇG#à¢ÇFƒä6öçG&FóÂ÷Fƒà¢ÇFƒäö'&Â÷Fƒà¢ÇFƒäF—66—Æ–æÂ÷Fƒà¢ÇFƒäf÷&æV6VF÷#Â÷Fƒà¢ÇF‚6Æ73Ò&çVÖW&–2#åfÆ÷#Â÷Fƒà¢ÇFƒäFFÂ÷Fƒà¢Â÷G#à¢Â÷F†VCà¢ÇF&öG“à¢G·7FFRæ6öçG&7G0¢æÖ‚†6öçG&7B’Óâ ¢ÇG#à¢ÇFCãÇ7G&öæsâG¶6öçG&7BæçVÖW&ô6öçG&F÷ÓÂ÷7G&öæsãÂ÷FCà¢ÇFCâG·v÷&´'”–B†6öçG&7Bæö'&–B“òææöÖRÇÂ$ö'&ì:6òÆö6Æ—¦F'ÓÂ÷FCà¢ÇFCâG¶F—66—Æ–æT'”–B†6öçG&7BæF—66—Æ–æ–B’ææöÖWÓÂ÷FCà¢ÇFCâG·7WÆ–W$'”–B†6öçG&7Bæf÷&æV6VF÷$–B“òç&¦õ6ö6–ÂÇÂ$f÷&æV6VF÷"ì:6òÆö6Æ—¦Fò'ÓÂ÷FCà¢ÇFB6Æ73Ò&çVÖW&–2#âG¶ÖöæW’†6öçG&7BçfÆ÷"—ÓÂ÷FCà¢ÇFCâG¶FFUFW‡B†6öçG&7BæFF—ÓÂ÷FCà¢Â÷G#à¢¢æ¦ö–â‚""—Ð¢Â÷F&öG“à¢Â÷F&ÆSà¢ÂöF—cà¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ&VæFW%v÷&·56WGF–æw2‚’°¢&WGW&â ¢G·&VæFW%v÷&·5FööÆ&"‚'v÷&·56WGF–æw2"Â$6öæf–wW&:|;VW2FRö'&2"Â$ÆVvVæFF6†fRRÆ—7F2FRö–òFòÜ;6GVÆòö'&2"Â ¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FF×f–WsÒ'6WGF–æw2#ä6öæf–wW&:|:6òvÆö&ÃÂö'WGFöãà¢—Ð ¢ÆF—b6Æ73Ò&6öçFVçBÖw&–B#à¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#äæöÖVæ6ÆGW&2FòUbG,:6óÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#äÆ–æ†2FR7W7FòÖçF–F2÷"÷6œ:|:6ò&&W6W'f"÷2Ug2W†—7FVçFW3Â÷à¢ÂöF—cà¢ÂöF—cà¢ÆF—b6Æ73Ò&WbÖF–7F–öæ'’#à¢G·&VæFW$F—66—Æ–æTF–7F–öæ'’‚$7W7F÷4Fö'&"Â$7W7F÷2Fö'&"—Ð¢G·&VæFW$F—66—Æ–æTF–7F–öæ'’‚$÷WG&46FVv÷&–2"Â$÷WG&26FVv÷&–2"—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#å7FGW2FòUcÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#ä6Æ76–f–6:|:6òWFöÜ:F–6VÆò6öçF\;¦FòFòW7GVFòFRf–&–Æ–FFSÂ÷à¢ÂöF—cà¢ÂöF—cà¢ÆF—b6Æ73Ò&6öæf–wW&F–öâÖ6FÆörÖÆ—7B#à¢ÆF—b6Æ73Ò&6öæf–wW&F–öâÖ6FÆörÖ—FVÒ#à¢ÆF—cãÇ7G&öæså6VÒUcÂ÷7G&öæsãÇ6ÖÆÃäö'&–æFì:6ò÷77V’&VVæ6†–ÖVçFòFRUbãÂ÷6ÖÆÃãÂöF—cà¢ÂöF—cà¢ÆF—b6Æ73Ò&6öæf–wW&F–öâÖ6FÆörÖ—FVÒ#à¢ÆF—cãÇ7G&öæsä–æ6ö×ÆWFóÂ÷7G&öæsãÇ6ÖÆÃäW†—7FR&VVæ6†–ÖVçFòÂÖ2òUb–æFì:6òFVæFR÷27&—L:—&–÷2FR6öæ6ÇW<:6òãÂ÷6ÖÆÃãÂöF—cà¢ÂöF—cà¢ÆF—b6Æ73Ò&6öæf–wW&F–öâÖ6FÆörÖ—FVÒ#à¢ÆF—cãÇ7G&öæsä6ö×ÆWFóÂ÷7G&öæsãÇ6ÖÆÃäò&VVæ6†–ÖVçFòFVæFR÷27&—L:—&–÷2FVf–æ–F÷2&6öæ6ÇW<:6òFòUbãÂ÷6ÖÆÃãÂöF—cà¢ÂöF—cà¢ÂöF—cà¢Ç6Æ73Ò'6WGF–æw2Ö†VÇ×FW‡B#äW7FW27FGW2<:6òf—†÷2R6Æ7VÆF÷2WFöÖF–6ÖVçFRâì:6òW†—7FRWFFR&67Væ†òRò7FGW2ì:6ò:’VF—L:fVÂÖçVÆÖVçFRãÂ÷à¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#åW7\:&–÷2R66–FFSÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#äæÆ—7F2Öö&–Æ—¦F÷2æòfÇW†òFRö'&3Â÷à¢ÂöF—cà¢ÂöF—cà¢G¶&$Æ—7B†æÇ—7DÆöB‡G'VR’Â'fÆ÷""Â‡fÇVR’ÓâG·fÇVWÒFVÖæFG·fÇVRÓÓÒò""¢'2'Ö—Ð¢Â÷6V7F–öãà¢ÂöF—cà ¢ÆF—b6Æ73Ò&6öçFVçBÖw&–B#à¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#äÆVvVæFF6†fR9¦æ–6Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#å6W\:¦æ6–ÂæòÂF—òFRVæ–FFRÂ6Æ76–f–6:|:6òÂF—öÆöv–RTcÂ÷à¢ÂöF—cà¢ÂöF—cà¢G·&VæFW$¶W”ÆVvVæB‚—Ð¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#å7&–çG2vÆö&—3Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#åW,:ÖöF÷2Væ–f–6F÷2&ö'&2ÂÖçWFVì:|:6òÂVævVæ†&–6Ì:Öæ–6RFVÖ—2Ü;6GVÆ÷3Â÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FF×f–WsÒ'6WGF–æw2#ä'&—"6öæf–wW&:|:6óÂö'WGFöãà¢ÂöF—cà¢Ç6Æ73Ò'6WGF–æw2Ö†VÇ×FW‡B#ä27&–çG276&Ò6W"6F7G&F2VÖ;¦æ–6fW¢VÒ6öæf–wW&:|:6òÂ–wVÂòG&:vòâ6FÜ;6GVÆòVæ26öç6öÖR7&–çBF—fãÂ÷à¢G·&VæFW%7&–çG5F&ÆR‚—Ð¢Â÷6V7F–öãà¢ÂöF—cà ¢Ç6V7F–öâ6Æ73Ò'æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#äÆ—7F2FRö–óÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#ä6F7G&÷2W6F÷2VÒf–ÇG&÷2ÂFVÖæF2R6†fW3Â÷à¢ÂöF—cà¢ÂöF—cà¢ÆF—b6Æ73Ò'7W÷'BÖw&–B#à¢G·7W÷'DÆ—7B‚$æÆ—7F2"ÂVæ—VTæÇ—7G2‚’—Ð¢G·7W÷'DÆ—7B‚%F—÷2FRVæ–FFR"ÂVæ—VUv÷&µfÇVW2‚'F—õVæ–FFR"’—Ð¢G·7W÷'DÆ—7B‚$6Æ76–f–6:|:6òFö'&"ÂVæ—VUv÷&µfÇVW2‚&6Æ76–f–66ôö'&"’—Ð¢G·7W÷'DÆ—7B‚%F—öÆöv–Fö'&"ÂVæ—VUv÷&µfÇVW2‚'F—öÆöv–ö'&"’—Ð¢G·7W÷'DÆ—7B‚%F—òFRF—f–FFR"Â²ââææWr6WB‡7FFRæFVÖæG2æÖ‚†FVÖæB’ÓâFVÖæEG—TÆ&VÂ†FVÖæBçF—ò’’•Ò—Ð¢G·7W÷'DÆ—7B‚%7FGW2F2FVÖæF2"Â6öÇVÖç2æÖ‚†6öÇVÖâ’Óâ6öÇVÖâæÆ&VÂ’—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ&VæFW$F—66—Æ–æTF–7F–öæ'’†6FVv÷'’ÂF—FÆR’°¢6öç7B—FV×2Ò6öæf–wW&VDF—66—Æ–æW2‚’æf–ÇFW"‚†F—66—Æ–æR’ÓâF—66—Æ–æRæ6FVv÷&–ÓÓÒ6FVv÷'’“°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò&F–7F–öæ'’Ö&Æö6²#à¢Æƒ3âG·F—FÆWÓÂöƒ3à¢ÆF—b6Æ73Ò&F–7F–öæ'’ÖÆ—7B#à¢G¶—FV×0¢æÖ€¢†F—66—Æ–æR’Óâ ¢ÆF—b6Æ73Ò&F–7F–öæ'’Ö—FVÒ#à¢Ç7ãâGµ7G&–ær†F—66—Æ–æRç÷6–6ò’çE7F'Bƒ"Â#"—ÓÂ÷7ãà¢Ç7G&öæsâG¶F—66—Æ–æRææöÖWÓÂ÷7G&öæsà¢G¶F—66—Æ–æRç6VÆV6–öæfVÅ&4”2ò""¢ÆVÓåG&fFÂöVÓæÐ¢ÂöF—cà¢ ¢¢æ¦ö–â‚""—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ&VæFW$¶W”ÆVvVæB‚’°¢6öç7B¶W•'G2Ò°¢²#"Â%6WâFö'&%ÒÀ¢²##b"Â$æò%ÒÀ¢²#"Â%F—òFRVæ–FFR%ÒÀ¢²$""Â$6Æ76–f–6:|:6ò%ÒÀ¢²%$eB"Â%F—öÆöv–%ÒÀ¢²$4R"Â%Tb%ÒÀ¢Ó°¢&WGW&â ¢ÆF—b6Æ73Ò&¶W’ÖÆVvVæB#à¢ÆF—b6Æ73Ò&¶W’ÖW†×ÆR#à¢G¶¶W•'G2æÖ‚†—FVÒ’ÓâÇ7ãâG¶—FVÕ³×ÓÂ÷7ãæ’æ¦ö–â‚#Æ#åóÂö#â"—Ð¢ÂöF—cà¢ÆF—b6Æ73Ò'7W÷'BÖw&–B6ö×7B#à¢G·7W÷'DÆ—7B‚%F—òFRVæ–FFR"Â²#6Ì:Öæ–6"Â#"†÷7—FÂ"Â#2F–vì;77F–6ò"Â#B&öçFòFVæF–ÖVçFò"Â#RFÖ–æ—7G&F—fò"Â#b6VçG&òFRF—7G&–'Vœ:|:6ò"Â#rDT"Â#‚6öÆWF"Â#’ÖVG&Wb%Ò—Ð¢G·7W÷'DÆ—7B‚$6Æ76–f–6:|:6ò"Â²$"FWV:|:6ò&VwVÆL;7&–"Â$TòVf–6œ:¦æ6–÷W&6–öæÂ"Â$d2f6†F"Â$TÒö'&VÖW&vVæ6–Â"Â$TRö'&W7G&L:–v–6"Â%5"7Vf–6œ:¦æ6–FR&VFR"Â%e¢fW'F–6Æ—¦:|:6ò"Â%e2fVæFFR6W'fœ:vò"Â%RG&öæ—¦:|:6òFRVæ–FFR%Ò—Ð¢G·7W÷'DÆ—7B‚%F—öÆöv–"Â²$åeRæ÷fVæ–FFR"Â%$eB&WG&öf—BVæ–FFRW†—7FVçFR"Â$Õ×Æ–:|:6òVæ–FFRW†—7FVçFR"Â%$d&WG&öf—B²×Æ–:|:6ò%Ò—Ð¢G·7W÷'DÆ—7B‚%6W²æò²Tb"Â²#Ó““’ì+¢6WVVæ6–Â"Â##bÂ#râââæòFR6F7G&ò"Â$4RÂ5âââTbG,:6ò”$tR%Ò—Ð¢ÂöF—cà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW%7&–çE6WGF–æw5æVÂ‚’°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò'æVÂ7&–çB×6WGF–æw2×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#å7&–çG2vÆö&—3Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#ä6F7G&ò;¦æ–6òW6Fòæ2f—<;VW2÷W&6–öæ—2FRö'&2ÂÖçWFVì:|:6òÂVævVæ†&–6Ì:Öæ–6R6öçG&öÆRFRfW&&3Â÷à¢ÂöF—cà¢Ç7â6Æ73Ò'Fr#å7&–çBF—f¢G¶7W'&VçE7&–çB‚“òææöÖRÇÂ'6VÒ7&–çBF—f'ÓÂ÷7ãà¢ÂöF—cà¢Æf÷&Ò6Æ73Ò&–æÆ–æR×7&–çBÖf÷&Ò"–CÒ'7&–çD–æÆ–æTf÷&Ò#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚–æÆ–æRÖf÷&ÒÖW'&÷""FFÖf÷&ÒÖW'&÷#ãÂöF—cà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäæöÖRF7&–çCÂ÷7ãà¢Æ–çWBæÖSÒ&æöÖR"&WV—&VBÆ6V†öÆFW#Ò$W‚ã¢7&–çBR"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäFF–ì:Ö6–óÂ÷7ãà¢Æ–çWBæÖSÒ&FF–æ–6–ò"G—SÒ&FFR"&WV—&VBóà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäFFf–ÓÂ÷7ãà¢Æ–çWBæÖSÒ&FFf–Ò"G—SÒ&FFR"&WV—&VBóà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãå7FGW3Â÷7ãà¢Ç6VÆV7BæÖSÒ'7FGW2#à¢Æ÷F–öâfÇVSÒ%ÆæV¦F#åÆæV¦FÂö÷F–öãà¢Æ÷F–öâfÇVSÒ$F—f#äF—fÂö÷F–öãà¢Æ÷F–öâfÇVSÒ$Væ6W'&F#äVæ6W'&FÂö÷F–öãà¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#ä7&–"7&–çCÂö'WGFöãà¢Âöf÷&Óà¢G·&VæFW%7&–çG5F&ÆR‚—Ð¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ&VæFW%7&–çG5F&ÆR‚’°¢6öç7B7&–çG2Ò'&’æ—4'&’‡7FFRç7&–çG2’ò7FFRç7&–çG2¢µÓ°¢&WGW&â ¢ÆF—b6Æ73Ò'F&ÆR×w&7&–çB×F&ÆR×w&#à¢ÇF&ÆR6Æ73Ò&FF×F&ÆR7&–çB×F&ÆR#à¢ÇF†VCà¢ÇG#à¢ÇFƒå7&–çCÂ÷Fƒà¢ÇFƒä–ì:Ö6–óÂ÷Fƒà¢ÇFƒäf–ÓÂ÷Fƒà¢ÇFƒå7FGW3Â÷Fƒà¢ÇFƒåW6óÂ÷Fƒà¢ÇFƒä:|;VW3Â÷Fƒà¢Â÷G#à¢Â÷F†VCà¢ÇF&öG“à¢G°¢7&–çG2æÆVæwF€¢ò7&–çG0¢æÖ€¢‡7&–çB’Óâ ¢ÇG#à¢ÇFCà¢ÆF—b6Æ73Ò&–æÆ–æRÖ7F–öç2#à¢Ç7G&öæsâG·7&–çBææöÖWÓÂ÷7G&öæsà¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&VF—B×7&–çB"FFÖ–CÒ"G¶W66TGG&–'WFR‡7&–çBæ–B—Ò"&–ÖÆ&VÃÒ$VF—F"(	BG¶W66TGG&–'WFR‡7&–çBææöÖR—Ò#äVF—F#Âö'WGFöãà¢ÂöF—cà¢Â÷FCà¢ÇFCâG¶FFUFW‡B‡7&–çBæFF–æ–6–ò—ÓÂ÷FCà¢ÇFCâG¶FFUFW‡B‡7&–çBæFFf–Ò—ÓÂ÷FCà¢ÇFCãÇ7â6Æ73Ò'7FGW2×–ÆÂ"FF×7FGW3Ò"G·7&–çBç7FGW2ÓÓÒ$F—f"ò$6ö×ÆWFò"¢$wV&FæFò'Ò#âG·7&–çBç7FGW7ÓÂ÷7ããÂ÷FCà¢ÇFCãÇ7â6Æ73Ò'Fr#åFöF÷2÷2Ü;6GVÆ÷3Â÷7ããÂ÷FCà¢ÇFCà¢G·7&–çBç7FGW2ÓÓÒ$F—f ¢òÇ7â6Æ73Ò'Fr#äGVÃÂ÷7ãæ ¢¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'WFFR×7&–çB×7FGW2"FFÖ–CÒ"G¶W66TGG&–'WFR‡7&–çBæ–B—Ò"&–ÖÆ&VÃÒ%F÷&æ"GVÂ(	BG¶W66TGG&–'WFR‡7&–çBææöÖR—Ò#åF÷&æ"GVÃÂö'WGFöãæÐ¢Â÷FCà¢Â÷G#à¢ ¢¢æ¦ö–â‚""¢¢ ¢ÇG#à¢ÇFB6öÇ7ãÒ#b#ãÇ7â6Æ73Ò&×WFVB#äæVæ‡VÖ7&–çB6F7G&Fâ7&–R&–ÖV—&7&–çBvÆö&Â&Æ–ÖVçF"÷2¶æ&ç2ãÂ÷7ããÂ÷FCà¢Â÷G#à¢ ¢Ð¢Â÷F&öG“à¢Â÷F&ÆSà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ7W÷'DÆ—7B‡F—FÆRÂ—FV×2’°¢&WGW&â ¢Æ'F–6ÆR6Æ73Ò'7W÷'BÖÆ—7B#à¢Æƒ3âG·F—FÆWÓÂöƒ3à¢ÆF—cà¢G¶—FV×2æÖ‚†—FVÒ’ÓâÇ7â6Æ73Ò'Fr#âG¶—FV×ÓÂ÷7ãæ’æ¦ö–â‚""’ÇÂÇ7â6Æ73Ò&×WFVB#å6VÒFF÷3Â÷7ãæÐ¢ÂöF—cà¢Âö'F–6ÆSà¢°§Ð ¦gVæ7F–öâVæ—VUv÷&µfÇVW2†f–VÆB’°¢&WGW&â²ââææWr6WB‡7FFRçv÷&·2æÖ‚‡v÷&²’Óâv÷&µ¶f–VÆEÒ’æf–ÇFW"„&ööÆVâ’•Ó°§Ð ¦gVæ7F–öâ&VæFW%W6W'56WGF–æw5æVÂ‚’²&WGW&â&VæFW%W6W'5æVÂ†vÆö&ÅF†—2å4ÅEô4ÄõTB’²&VæFW$&6·W5æVÂ†vÆö&ÅF†—2å4ÅEô4ÄõTB“²Ð ¦gVæ7F–öâ&VæFW%W6W$66W746†—2‡W6W"’°¢6öç7BÖöGVÆW2Òæ÷&ÖÆ—¦T66W74ÖöGVÆW2‡W6W#òæ66W74ÖöGVÆW2ÂW6W#òçW&f–Â“°¢&WGW&â ¢ÆF—b6Æ73Ò'W6W"Ö66W72Ö6†—ÖÆ—7B#à¢G·W6W$66W74ÖöGVÆW0¢æf–ÇFW"‚†ÖöGVÆR’ÓâÖöGVÆW2æ–æ6ÇVFW2†ÖöGVÆRæ–B’¢æÖ‚†ÖöGVÆR’ÓâÇ7â6Æ73Ò'Fr#âG¶ÖöGVÆRæÆ&VÇÓÂ÷7ãæ¢æ¦ö–â‚""’ÇÂÇ7â6Æ73Ò&×WFVB#å6VÒÜ;6GVÆ÷2Æ–&W&F÷3Â÷7ãæÐ¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ6öæf–wW&F–öä—FVÔFWF–Â‡G—RÂ—FVÒ’°¢–b‡G—RÓÓÒ&F—66—Æ–æR"’°¢&WGW&âGµ7G&–ær†—FVÒç÷6—F–öâÇÂ’çE7F'Bƒ"Â#"—Ò+rG¶6FVv÷'”Æ&VÂ†—FVÒæ6FVv÷'’—Ò+rG¶—FVÒç6VÆV7F&ÆTf÷%4”2ÓÓÒfÇ6Rò&&Æ÷VVF&4”2"¢'6VÆV6–öì:fVÂ&4”2'Ö°¢Ð¢–b‡G—RÓÓÒ'7FFR"’&WGW&â—FVÒæ7F—fRÓÓÒfÇ6Rò$–æF—fò"¢$F—fò#°¢&WGW&â—FVÒæ7F—fRÓÓÒfÇ6Rò$–æF—fò"¢$F—fò#°§Ð ¦gVæ7F–öâ&VæFW$6öæf–wW&F–öä6FÆöt6&B‡G—R’°¢6öç7BFVf–æ—F–öâÒ6öæf–wW&F–öä6FÆötFVf–æ—F–öç5·G—UÓ°¢6öç7B—FV×2Ò6öæf–wW&F–öä—FV×2‡G—RÂ²–æ6ÇVFT–æ7F—fS¢G'VRÒ“°¢&WGW&â ¢Æ'F–6ÆR6Æ73Ò&6öæf–wW&F–öâÖ6FÆörÖ6&B"FFÖ6öæf–wW&F–öâ×G—SÒ"G·G—WÒ#à¢Æ†VFW#à¢ÆF—cãÆƒ3âG¶FVf–æ—F–öâæÆ&VÇÓÂöƒ3ãÇ6ÖÆÃâG¶—FV×2æÆVæwF‡Ò—FVÒ†ç2’6öæf–wW&Fò‡2“Â÷6ÖÆÃãÂöF—cà¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷VâÖ6öæf–rÖ6FÆör"FFÖ6FÆör×G—SÒ"G·G—WÒ#äæ÷fóÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&6öæf–wW&F–öâÖ6FÆörÖÆ—7B#à¢G¶—FV×2æÖ‚†—FVÒ’Óâ ¢ÆF—b6Æ73Ò&6öæf–wW&F–öâÖ6FÆörÖ—FVÒG¶—FVÒæ7F—fRÓÓÒfÇ6Rò&—2Ö–æ7F—fR"¢"'Ò#à¢ÆF—cà¢Ç7G&öæsâG¶W66TGG&–'WFR‡G—RÓÓÒ'7FFR"ò—FVÒæ6öFRÇÂ""¢—FVÒæÆ&VÂ—ÓÂ÷7G&öæsà¢Ç6ÖÆÃâG¶W66TGG&–'WFR†6öæf–wW&F–öä—FVÔFWF–Â‡G—RÂ—FVÒ’—ÓÂ÷6ÖÆÃà¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷VâÖ6öæf–rÖ6FÆör"FFÖ6FÆör×G—SÒ"G·G—WÒ"FFÖ6FÆörÖ–CÒ"G¶W66TGG&–'WFR†—FVÒæ–B—Ò#äVF—F#Âö'WGFöãà¢ÂöF—cà¢’æ¦ö–â‚""’ÇÂÆF—b6Æ73Ò&V×G’×7FFR#äæVæ‡VÒ—FVÒ6öæf–wW&FòãÂöF—cæÐ¢ÂöF—cà¢Âö'F–6ÆSà¢°§Ð ¦gVæ7F–öâ&VæFW$UdÆ–fV7–6ÆT6öæf–wW&F–öä6&B‚’°¢&WGW&â ¢Æ'F–6ÆR6Æ73Ò&6öæf–wW&F–öâÖ6FÆörÖ6&B"FFÖ6öæf–wW&F–öâ×G—SÒ&Wb×7FGW2#à¢Æ†VFW#à¢ÆF—cãÆƒ3å7FGW2FòUcÂöƒ3ãÇ6ÖÆÃã2W7FF÷2f—†÷3Â÷6ÖÆÃãÂöF—cà¢Ç7â6Æ73Ò'Fr#äì:6òVF—L:fVÃÂ÷7ãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&6öæf–wW&F–öâÖ6FÆörÖÆ—7B#à¢G´UeôÄ”dT5”4ÄUõ5DEU4U2æÖ‚‡7FGW2’Óâ ¢ÆF—b6Æ73Ò&6öæf–wW&F–öâÖ6FÆörÖ—FVÒ#à¢ÆF—cà¢Ç7G&öæsâG·7FGW7ÓÂ÷7G&öæsà¢Ç6ÖÆÃâG·7FGW2ÓÓÒ%6VÒUb ¢ò$ö'&ì:6ò÷77V’Ub&VVæ6†–Fòâ ¢¢7FGW2ÓÓÒ$–æ6ö×ÆWFò ¢ò$òUbfö’Ö&6Fò6öÖò–æ6ö×ÆWFòæò,;7&–òW7GVFòâ ¢¢$òUbfö’Ö&6Fò6öÖò6ö×ÆWFòæò,;7&–òW7GVFòâ'ÓÂ÷6ÖÆÃà¢ÂöF—cà¢ÂöF—cà¢’æ¦ö–â‚""—Ð¢ÂöF—cà¢Ç6Æ73Ò'6WGF–æw2Ö†VÇ×FW‡B#î(	Å6VÒUn(	Ò:’WFöÜ:F–6òVæ2VæFòì:6òW†—7FRW7GVFòâ(	Ä–æ6ö×ÆWFþ(	ÒR(	Ä6ö×ÆWFþ(	Ò<:6òFVf–æ–F÷2ÖçVÆÖVçFRæò,;7&–òUbRW76W66öÆ†Æ–ÖVçFFöF22FVÖ—2FVÆ2ãÂ÷à¢Âö'F–6ÆSà¢°§Ð ¦gVæ7F–öâ&VæFW$6öæf–wW&F–öä6FÆöw5æVÂ‚’°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò'æVÂ6öæf–wW&F–öâÖ6FÆöw2×æVÂ#à¢ÆF—b6Æ73Ò'æVÂÖ†VFW"#à¢ÆF—cà¢Æƒ#ä6F7G&÷2RF–6–öì:&–÷3Âöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#äÆ—7F2;¦æ–62WF–Æ—¦F2æ÷2Ug2Âö'&2Âf÷&×VÌ:&–÷2Rf–ÇG&÷2FòÆ–6F—fóÂ÷à¢ÂöF—cà¢Ç7â6Æ73Ò'Fr#ä6öæf–wW&:|:6ò6ö×'F–Æ†FÂ÷7ãà¢ÂöF—cà¢ÆF—b6Æ73Ò&6öæf–wW&F–öâÖ6FÆörÖw&–B#à¢G·&VæFW$UdÆ–fV7–6ÆT6öæf–wW&F–öä6&B‚—Ð¢G´ö&¦V7Bæ¶W—2†6öæf–wW&F–öä6FÆötFVf–æ—F–öç2’æÖ‡&VæFW$6öæf–wW&F–öä6FÆöt6&B’æ¦ö–â‚""—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ÷Vä6öæf–wW&F–öä6FÆötÖöFÂ‡G—RÂ—FVÔ–BÒ""’°¢6öç7BFVf–æ—F–öâÒ6öæf–wW&F–öä6FÆötFVf–æ—F–öç5·G—UÓ°¢–b‚FVf–æ—F–öâ’&WGW&ã°¢6öç7B—FV×2Ò6öæf–wW&F–öä—FV×2‡G—RÂ²–æ6ÇVFT–æ7F—fS¢G'VRÒ“°¢6öç7B—FVÒÒ—FV×2æf–æB‚†VçG'’’ÓâVçG'’æ–BÓÓÒ—FVÔ–B’ÇÂçVÆÃ°¢6öç7B—4VF—F–ærÒ&ööÆVâ†—FVÒ“°¢6öç7BæW‡E÷6—F–öâÒ—FV×2ç&VGV6R‚††–v†W7BÂVçG'’’ÓâÖF‚æÖ‚††–v†W7BÂçVÖ&W"†VçG'’ç÷6—F–öâÇÂ’’Â’²°¢6öç7B&Vv–öä÷F–öç2Ò6öæf–wW&F–öä—FV×2‚'&Vv–öâ"Â²–æ6ÇVFT–æ7F—fS¢G'VRÒ“°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&B6öæf–wW&F–öâÖ6FÆörÖÖöFÂ"–CÒ&6öæf–wW&F–öä6FÆötf÷&Ò"&–ÖÆ&VÆÆVF'“Ò&6öæf–wW&F–öä6FÆöuF—FÆR#à¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'G—R"fÇVSÒ"G·G—WÒ"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&—FVÔ–B"fÇVSÒ"G¶W66TGG&–'WFR†—FVÓòæ–BÇÂ""—Ò"óà¢Æ†VFW#à¢ÆF—cà¢Æƒ"–CÒ&6öæf–wW&F–öä6FÆöuF—FÆR#âG¶—4VF—F–ærò$VF—F""¢$æ÷f'ÒG¶FVf–æ—F–öâç6–æwVÆ'ÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#äÇFW&:|:6ò76fÆW"æ2÷:|;VW26ö×'F–Æ†F2FòÆ–6F—fòãÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"FFÖf÷&ÒÖW'&÷#ãÂöF—cà¢ÆF—b6Æ73Ò&f÷&ÒÖw&–B#à¢G·G—RÓÓÒ'7FFR"ò ¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãåTb£Â÷7ããÆ–çWBæÖSÒ&6öFR"&WV—&VBÖ–æÆVæwFƒÒ#""Ö†ÆVæwFƒÒ#""fÇVSÒ"G¶W66TGG&–'WFR†—FVÓòæ6öFRÇÂ""—Ò"Æ6V†öÆFW#Ò%5"óãÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãå&Vvœ:6ò£Â÷7ããÇ6VÆV7BæÖSÒ'&Vv–öâ"&WV—&VCãÆ÷F–öâfÇVSÒ"#å6VÆV6–öæSÂö÷F–öãâG·&Vv–öä÷F–öç2æÖ‚‡&Vv–öâ’ÓâÆ÷F–öâfÇVSÒ"G¶W66TGG&–'WFR‡&Vv–öâæÆ&VÂ—Ò"G·&Vv–öâæÆ&VÂÓÓÒ—FVÓòç&Vv–öâò'6VÆV7FVB"¢"'ÓâG¶W66TGG&–'WFR‡&Vv–öâæÆ&VÂ—ÒG·&Vv–öâæ7F—fRÓÓÒfÇ6Rò"+r–æF—f"¢"'ÓÂö÷F–öãæ’æ¦ö–â‚""—ÓÂ÷6VÆV7CãÂöÆ&VÃà¢¢ ¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãâG·G—RÓÓÒ'–V""ò$æò"¢$æöÖR'Ò£Â÷7ããÆ–çWBæÖSÒ&Æ&VÂ"&WV—&VBÖ–æÆVæwFƒÒ"G·G—RÓÓÒ'–V""ò#B"¢#"'Ò"Ö†ÆVæwFƒÒ"G·G—RÓÓÒ'–V""ò#B"¢#c'Ò"G·G—RÓÓÒ'–V""òv–çWFÖöFSÒ&çVÖW&–2"GFW&ãÒ%ÅÆG³GÒ"r¢"'ÒfÇVSÒ"G¶W66TGG&–'WFR†—FVÓòæÆ&VÂÇÂ""—Ò"óãÂöÆ&VÃà¢Ð¢G·G—RÓÓÒ&F—66—Æ–æR"ò ¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãä–FVçF–f–6F÷"£Â÷7ããÆ–çWBæÖSÒ&6öFR"&WV—&VBÖ†ÆVæwFƒÒ##"fÇVSÒ"G¶W66TGG&–'WFR†—FVÓòæ6öFRÇÂ""—Ò"G¶—4VF—F–ærò'&VFöæÇ’"¢"'ÒÆ6V†öÆFW#Ò&–ç7FÆ6öW2ÖVÆWG&–62"óãÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãäw'WòFòUb£Â÷7ããÇ6VÆV7BæÖSÒ&6FVv÷'’"&WV—&VCãÆ÷F–öâfÇVSÒ$7W7F÷4Fö'&"G¶—FVÓòæ6FVv÷'’ÓÓÒ$7W7F÷4Fö'&"ò'6VÆV7FVB"¢"'Óä7W7F÷2Fö'&Âö÷F–öããÆ÷F–öâfÇVSÒ$÷WG&46FVv÷&–2"G¶—FVÓòæ6FVv÷'’ÓÒ$7W7F÷4Fö'&"ò'6VÆV7FVB"¢"'Óä÷WG&26FVv÷&–3Âö÷F–öããÂ÷6VÆV7CãÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãå÷6œ:|:6ò£Â÷7ããÆ–çWBæÖSÒ'÷6—F–öâ"G—SÒ&çVÖ&W""Ö–ãÒ#"ÖƒÒ#““’"&WV—&VBfÇVSÒ"G¶W66TGG&–'WFR†—FVÓòç÷6—F–öâÇÂæW‡E÷6—F–öâ—Ò"óãÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB6†V6¶&÷‚Öf–VÆB#ãÆ–çWBæÖSÒ'6VÆV7F&ÆTf÷%4”2"G—SÒ&6†V6¶&÷‚"G¶—FVÓòç6VÆV7F&ÆTf÷%4”2ÓÒfÇ6Rò&6†V6¶VB"¢"'ÒóãÇ7ãå6VÆV6–öì:fVÂVÒ4”3Â÷7ããÂöÆ&VÃà¢¢"'Ð¢ÆÆ&VÂ6Æ73Ò&f–VÆB6†V6¶&÷‚Öf–VÆB#ãÆ–çWBæÖSÒ&7F—fR"G—SÒ&6†V6¶&÷‚"G¶—FVÓòæ7F—fRÓÒfÇ6Rò&6†V6¶VB"¢"'ÒóãÇ7ãä—FVÒF—fóÂ÷7ããÂöÆ&VÃà¢ÂöF—cà¢ÂöF—cà¢ÆF—b6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#âG¶—4VF—F–ærò%6Çf"ÇFW&:|;VW2"¢$7&–"—FVÒ'ÓÂö'WGFöãà¢ÂöF—cà¢Âöf÷&Óà¢ÂöF—cà¢“°¢ÖöFÅ&ö÷BçVW'•6VÆV7F÷"‡G—RÓÓÒ'7FFR"òu¶æÖSÒ&6öFR%Òr¢u¶æÖSÒ&Æ&VÂ%Òr“òæfö7W2‚“°§Ð ¦7–æ2gVæ7F–öâ†æFÆT6öæf–wW&F–öä6FÆöu7V&Ö—B†f÷&Ò’°¢6öç7Bf÷&ÔFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7BG—RÒ7G&–ær†f÷&ÔFFævWB‚'G—R"’ÇÂ""“°¢6öç7BFVf–æ—F–öâÒ6öæf–wW&F–öä6FÆötFVf–æ—F–öç5·G—UÓ°¢–b‚FVf–æ—F–öâ’&WGW&ã°¢6öç7B—FVÔ–BÒ7G&–ær†f÷&ÔFFævWB‚&—FVÔ–B"’ÇÂ""“°¢6öç7B—FV×2Ò6öæf–wW&F–öä—FV×2‡G—RÂ²–æ6ÇVFT–æ7F—fS¢G'VRÒ’æÖ‚†—FVÒ’Óâ‡²ââæ—FVÒÒ’“°¢6öç7BW†—7F–æt–æFW‚Ò—FV×2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ—FVÔ–B“°¢6öç7BW†—7F–ærÒW†—7F–æt–æFW‚ãÒò—FV×5¶W†—7F–æt–æFW…Ò¢çVÆÃ°¢6öç7B6öFRÒ7G&–ær†f÷&ÔFFævWB‚&6öFR"’ÇÂ""’çG&–Ò‚’çFõWW$66R‚“°¢6öç7B7V&Ö—GFVDÆ&VÂÒ7G&–ær†f÷&ÔFFævWB‚&Æ&VÂ"’ÇÂ""’çG&–Ò‚“°¢6öç7BÆ&VÂÒG—RÓÓÒ'7FFR"ò6öFR¢7V&Ö—GFVDÆ&VÃ°¢–b‡G—RÓÓÒ&6FVv÷'’"bb6æöæ–6Åv÷&´6FVv÷'’†Æ&VÂ’’°¢6†÷tf÷&ÔW'&÷"‚$W7F6FVv÷&–FWfRW&ÖæV6W"f¦–æ2ö'&2â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢–b‡G—RÓÓÒ'G—öÆöw’"bb6æöæ–6Åv÷&µG—öÆöw’†Æ&VÂ’’°¢6†÷tf÷&ÔW'&÷"†W6R6öÖVçFS¢G·v÷&µG—öÆöw”÷F–öç2æ¦ö–â‚"Â"—ÒæÂf÷&Ò“°¢&WGW&ã°¢Ð¢–b†—FV×2ç6öÖR‚†—FVÒ’Óâ—FVÒæ–BÓÒ—FVÔ–Bbbæ÷&ÖÆ—¦U6V&6…FW‡B†—FVÒæÆ&VÂ’ÓÓÒæ÷&ÖÆ—¦U6V&6…FW‡B†Æ&VÂ’’’°¢6†÷tf÷&ÔW'&÷"†W7FG¶FVf–æ—F–öâç6–æwVÆ'Ò¬:W7L:6F7G&FæÂf÷&Ò“°¢&WGW&ã°¢Ð¢–b‡G—RÓÓÒ'7FFR"bbõå´Õ¥×³'ÒBòçFW7B†6öFR’’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRTb6öÒGV2ÆWG&2â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢–b‡G—RÓÓÒ'–V""bbõåÆG³GÒBòçFW7B†Æ&VÂ’’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRòæò6öÒVG&òì;¦ÖW&÷2â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BF—66—Æ–æT6öFRÒG—RÓÓÒ&F—66—Æ–æR ¢ò7G&–ær†f÷&ÔFFævWB‚&6öFR"’ÇÂ""’çG&–Ò‚’çFôÆ÷vW$66R‚’ç&WÆ6R‚õµæ×£Ó’ÕÒ²örÂ"Ò"’ç&WÆ6R‚õâ×ÂÒBörÂ""¢¢"#°¢6öç7B6ö×&&ÆT6öFRÒG—RÓÓÒ&F—66—Æ–æR"òF—66—Æ–æT6öFR¢6öFS°¢–b…²&F—66—Æ–æR"Â'7FFR%Òæ–æ6ÇVFW2‡G—R’bb‚6ö×&&ÆT6öFRÇÂ—FV×2ç6öÖR‚†—FVÒ’Óâ—FVÒæ–BÓÒ—FVÔ–Bbb7G&–ær†—FVÒæ6öFRÇÂ""’çFõWW$66R‚’ÓÓÒ6ö×&&ÆT6öFRçFõWW$66R‚’’’’°¢6†÷tf÷&ÔW'&÷"‚$ò–FVçF–f–6F÷"–æf÷&ÖFò¬:W†—7FR÷R:’–çl:Æ–Fòâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BæW‡D—FVÒÒ°¢âââ†W†—7F–ærÇÂ·Ò’À¢–C¢W†—7F–æsòæ–BÇÂG·G—WÒòG¶7'—Fòç&æFöÕUT”B‚—ÖÀ¢G—RÀ¢Æ&VÂÀ¢7F—fS¢f÷&ÔFFævWB‚&7F—fR"’ÓÓÒ&öâ"À¢Ó°¢–b‡G—RÓÓÒ'7FFR"’ö&¦V7Bæ76–vâ†æW‡D—FVÒÂ²6öFRÂ&Vv–öã¢7G&–ær†f÷&ÔFFævWB‚'&Vv–öâ"’ÇÂ""’çG&–Ò‚’Ò“°¢–b‡G—RÓÓÒ&F—66—Æ–æR"’ö&¦V7Bæ76–vâ†æW‡D—FVÒÂ°¢6öFS¢F—66—Æ–æT6öFRÀ¢6FVv÷'“¢7G&–ær†f÷&ÔFFævWB‚&6FVv÷'’"’ÇÂ$÷WG&46FVv÷&–2"’À¢÷6—F–öã¢çVÖ&W"†f÷&ÔFFævWB‚'÷6—F–öâ"’ÇÂ““’’À¢6VÆV7F&ÆTf÷%4”3¢f÷&ÔFFævWB‚'6VÆV7F&ÆTf÷%4”2"’ÓÓÒ&öâ"À¢Ò“°¢–b†W†—7F–æt–æFW‚ãÒ’—FV×5¶W†—7F–æt–æFW…ÒÒæW‡D—FVÓ°¢VÇ6R—FV×2çW6‚†æW‡D—FVÒ“°¢W'6—7D6öæf–wW&F–öåG—R‡G—RÂ—FV×2“°¢–b‡G—RÓÓÒ'&Vv–öâ"bbW†—7F–ærbbW†—7F–æræÆ&VÂÓÒÆ&VÂ’°¢6öç7B7FFW2Ò6öæf–wW&F–öä—FV×2‚'7FFR"Â²–æ6ÇVFT–æ7F—fS¢G'VRÒ’æÖ‚‡7FFT—FVÒ’Óà¢7FFT—FVÒç&Vv–öâÓÓÒW†—7F–æræÆ&VÂò²ââç7FFT—FVÒÂ&Vv–öã¢Æ&VÂÒ¢7FFT—FVÐ¢“°¢W'6—7D6öæf–wW&F–öåG—R‚'7FFR"Â7FFW2“°¢Ð¢7FFRæ†—7F÷'’Ò·°¢–C¢„•5BÒG´FFRææ÷r‚—ÖÀ¢VçF–FFS¢&6öæf–wW&6ò"À¢VçF–FFT–C¢æW‡D—FVÒæ–BÀ¢6×ó¢W†—7F–ærò&VFœ:|:6ò"¢&7&–:|:6ò"À¢fÆ÷$çFW&–÷#¢W†—7F–æsòæÆ&VÂÇÂ""À¢fÆ÷$æ÷fó¢æW‡D—FVÒæÆ&VÂÀ¢W7V&–ó¢7W'&VçEW6W"‚“òææöÖRÇÂ%6—7FVÖ"À¢F–ÖW7F×¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢ÒÂââæ'&”÷$fÆÆ&6²‡7FFRæ†—7F÷'’•Ó°¢–b‚v—B6fU7FFR‚’’&WGW&âfÇ6S°¢6Æ÷6TÖöFÂ‚“°¢&VæFW"‚“°¢6†÷uFö7B†G¶FVf–æ—F–öâæÆ&VÇÓ¢6F7G&òG¶W†—7F–ærò&GVÆ—¦Fò"¢&7&–Fò'Òæ“°§Ð ¦gVæ7F–öâ&VæFW%6WGF–æw2‚’°¢6öç7B†—7F÷'’Ò'&’æ—4'&’‡7FFRæ†—7F÷'’’ò7FFRæ†—7F÷'’¢µÓ°¢&WGW&â ¢G·&VæFW%FööÆ&"‚$6öæf–wW&:|:6ò"Â%7&–çG2ÂWV—RÂW&f—2ÂF–6–öì:&–÷2RVF—F÷&–vÆö&ÂFò4ÅB3c"—Ð¢G·&VæFW%7&–çE6WGF–æw5æVÂ‚—Ð¢G·&VæFW%W6W'56WGF–æw5æVÂ‚—Ð¢G·&VæFW$6öæf–wW&F–öä6FÆöw5æVÂ‚—Ð¢ÆFWF–Ç26Æ73Ò'æVÂ6WGF–æw2Ö†—7F÷'’×æVÂ#à¢Ç7VÖÖ'’6Æ73Ò'æVÂÖ†VFW"6WGF–æw2Ö†—7F÷'’×7VÖÖ'’#à¢ÆF—cà¢Æƒ#ä†—7L;7&–6óÂöƒ#à¢Ç6Æ73Ò'æVÂ×7V'F—FÆR#äVF—F÷&–F2ÇFW&:|;VW2&VÆWfçFW3Â÷à¢ÂöF—cà¢Ç7â6Æ73Ò'6WGF–æw2Ö†—7F÷'’×FövvÆR#à¢Ç7â6Æ73Ò'6WGF–æw2Ö†—7F÷'’ÖW‡æB#äW‡æF—#Â÷7ãà¢Ç7â6Æ73Ò'6WGF–æw2Ö†—7F÷'’Ö6öÆÆ6R#å&V6öÆ†W#Â÷7ãà¢Ç7â6Æ73Ò'6WGF–æw2Ö†—7F÷'’Ö6†Wg&öâ"&–Ö†–FFVãÒ'G'VR#î(ÈCÂ÷7ãà¢Â÷7ãà¢Â÷7VÖÖ'“à¢ÆF—b6Æ73Ò&†—7F÷'’ÖÆ—7B#à¢G¶†—7F÷'¢ç6Æ–6RƒÂ"¢æÖ‡&VæFW$†—7F÷'”—FVÒ¢æ¦ö–â‚""’ÇÂÆF—b6Æ73Ò&V×G’×7FFR#å6VÒ†—7L;7&–6ò&Vv—7G&FòãÂöF—cæÐ¢ÂöF—cà¢ÂöFWF–Ç3à¢°§Ð ¦gVæ7F–öâ&VæFW$†—7F÷'”—FVÒ†—FVÒÒ·Ò’°¢6öç7BVçF—G’Ò7G&–ær†—FVÒæVçF–FFRÇÂ—FVÒæVçF—G’ÇÂ'6—7FVÖ"’çFõWW$66R‚“°¢6öç7BVçF—G”–BÒ—FVÒæVçF–FFT–BÇÂ—FVÒæVçF—G”–BÇÂ—FVÒæ–BÇÂ"#°¢6öç7Bf–VÆBÒ—FVÒæ6×òÇÂ—FVÒæ7F–öâÇÂ&WfVçFò#°¢6öç7B&Wf–÷W2Ò—FVÒçfÆ÷$çFW&–÷"óò"#°¢6öç7BæW‡BÒ—FVÒçfÆ÷$æ÷fòóò—FVÒæFWF–Âóò"#°¢6öç7BF–ÖW7F×ÒæWrFFR†—FVÒçF–ÖW7F×ÇÂ""“°¢6öç7BF–ÖW7F×FW‡BÒçVÖ&W"æ—4æâ‡F–ÖW7F×ævWEF–ÖR‚’’ò'6VÒFF"¢F–ÖW7F×çFôÆö6ÆU7G&–ær‚'BÔ%""“°¢&WGW&â ¢Æ'F–6ÆR6Æ73Ò&†—7F÷'’Ö—FVÒ#à¢Ç7G&öæsâG¶W66TGG&–'WFR†G¶VçF—G—ÒG¶VçF—G”–GÒÂG¶f–VÆGÖ—ÓÂ÷7G&öæsà¢Ç7ãâG¶W66TGG&–'WFR‡&Wf–÷W2òG·&Wf–÷W7ÒÓâG¶æW‡GÖ¢æW‡BÇÂ$WfVçFò&Vv—7G&Fò"—ÓÂ÷7ããÆ'"óà¢Ç7ãâG¶W66TGG&–'WFR†—FVÒçW7V&–òÇÂ—FVÒçW6W"ÇÂ%6—7FVÖ"—ÒÂG·F–ÖW7F×FW‡GÓÂ÷7ãà¢Âö'F–6ÆSà¢°§Ð ¦gVæ7F–öâ6W„'•G—öÆöw’‚’°¢6öç7BÖÒæWrÖ‚“°¢'VFvWEv÷&·2‚’æf÷$V6‚‚‡v÷&²’Óâ°¢6öç7BfÇVW2Òv÷&µF÷FÇ2‡v÷&²“°¢Öç6WB‡v÷&²çF—öÆöv–ö'&Â†ÖævWB‡v÷&²çF—öÆöv–ö'&’ÇÂ’²fÇVW2æ÷&6Fò²fÇVW2æF—F—fFò“°¢Ò“°¢&WGW&â²ââæÖæVçG&–W2‚•Ð¢æÖ‚…¶Æ&VÂÂfÆ÷%Ò’Óâ‡²Æ&VÂÂfÆ÷"Ò’¢ç6÷'B‚†Â"’Óâ"çfÆ÷"ÒçfÆ÷"“°§Ð ¦gVæ7F–öâ6÷7EW$Ó$'”F—66—Æ–æR‚’°¢6öç7BÖÒæWrÖ‚“°¢'VFvWEv÷&·2‚’æf÷$V6‚‚‡v÷&²’Óâ°¢v÷&²æWbæÆ–æW2æf÷$V6‚‚†Æ–æR’Óâ°¢–b†—5&—6´Æ–æR†Æ–æR’’&WGW&ã°¢6öç7BfÇVW2ÒÆ–æUF÷FÇ2‡v÷&²ÂÆ–æR“°¢6öç7B–BÒ6æöæ–6ÄF—66—Æ–æT–B†Æ–æRæF—66—Æ–æ–B“°¢6öç7B7W'&VçBÒÖævWB†–B’ÇÂ²fÆ÷#¢Â&V¢Ó°¢7W'&VçBçfÆ÷"³ÒfÇVW2æ÷&6Fò²fÇVW2æF—F—fFó°¢7W'&VçBæ&V³Òv÷&²æ&VWV—fÆVçFS°¢Öç6WB†–BÂ7W'&VçB“°¢Ò“°¢Ò“°¢&WGW&â²ââæÖæVçG&–W2‚•Ð¢æÖ‚…¶–BÂ—FVÕÒ’Óâ‡²Æ&VÃ¢F—66—Æ–æT'”–B†–B’ææöÖRÂfÆ÷#¢—FVÒçfÆ÷"òÖF‚æÖ‚†—FVÒæ&VÂ’Ò’¢ç6÷'B‚†Â"’Óâ"çfÆ÷"ÒçfÆ÷"“°§Ð ¦gVæ7F–öâföÆF–Æ—G”'”F—66—Æ–æR‚’°¢6öç7BÖÒæWrÖ‚“°¢7FFRç6–70¢æf–ÇFW"‚‡6–2’Óâ6–2ç7FGW2ÓÓÒ$&÷fFò"¢æf÷$V6‚‚‡6–2’Óâ°¢6–2æF—66—Æ–æ4fWFF2æf÷$V6‚‚†—FVÒ’Óâ°¢6öç7B–BÒ6æöæ–6ÄF—66—Æ–æT–B†—FVÒæF—66—Æ–æ–B“°¢Öç6WB†–BÂ†ÖævWB†–B’ÇÂ’²ÖF‚æ'2†—FVÒçfÆ÷$FVÇF’“°¢Ò“°¢Ò“°¢&WGW&â²ââæÖæVçG&–W2‚•Ð¢æÖ‚…¶–BÂfÆ÷%Ò’Óâ‡²Æ&VÃ¢F—66—Æ–æT'”–B†–B’ææöÖRÂfÆ÷"Ò’¢ç6÷'B‚†Â"’Óâ"çfÆ÷"ÒçfÆ÷"“°§Ð ¦gVæ7F–öâ&–Ö'•6–4f÷$FVÖæB†FVÖæB’°¢&WGW&â†FVÖæBç6–4–G2ÇÂµÒ¢æÖ‚†–B’Óâ7FFRç6–72æf–æB‚‡6–2’Óâ6–2æ–BÓÓÒ–B’¢æf–æB„&ööÆVâ“°§Ð ¦gVæ7F–öâFVÖæE6–4–æfò†FVÖæB’°¢6öç7B6–2Ò&–Ö'•6–4f÷$FVÖæB†FVÖæB“°¢–b†FVÖæEG—T¶W’†FVÖæBçF—ò’ÓÒ%4”2"bb6–2bbFVÖæBç6–4ÖWFFF’&WGW&âçVÆÃ°¢6öç7BÖWFFFÒFVÖæBç6–4ÖWFFFÇÂ·Ó°¢6öç7BæW†÷2Ò²âââ†ÖWFFFææW†÷2ÇÂµÒ’Ââââ‡6–3òææW†÷2ÇÂµÒ•Òæf–ÇFW"„&ööÆVâ“°¢6öç7BVæ—VU6–4GF6†ÖVçG2ÒVæ—VTGF6†ÖVçG2†æW†÷2“°¢&WGW&â°¢ÆV6öÔçVÖ&W#¢ÖWFFFæÆV6öÔçVÖ&W"ÇÂ6–3òæÆV6öÔçVÖ&W"ÇÂ.(	B"À¢ö'&çVÖ&W#¢ÖWFFFæö'&çVÖ&W"ÇÂ6–3òæö'&çVÖ&W"ÇÂ.(	B"À¢ö'&æöÖS¢ÖWFFFæö'&æöÖRÇÂ6–3òæö'&æöÖRÇÂv÷&´'”–B†FVÖæBæö'&–B“òææöÖRÇÂ.(	B"À¢F—GVÆõ6–3¢ÖWFFFçF—GVÆõ6–2ÇÂ6–3òçF—GVÆòÇÂFVÖæBçF—GVÆõ6–2ÇÂFVÖæBçF—GVÆòÇÂ.(	B"À¢çVÖW&õ6–3¢ÖWFFFæçVÖW&õ6–2ÇÂ6–3òæçVÖW&õ6–2ÇÂ6–3òæ–BÇÂ.(	B"À¢FW67&–6õ6–3¢ÖWFFFæFW67&–6õ6–2ÇÂ6–3òæFW67&–6òÇÂFVÖæBæö'6W'f6òÇÂ.(	B"À¢æÆ—7F6ÆFV6æ–6¢ÖWFFFææÆ—7F6ÆFV6æ–6ÇÂ6–3òææÆ—7F6ÆFV6æ–6ÇÂFVÖæBææÆ—7F&W7öç6fVÂÇÂ.(	B"À¢Ö÷F—fó¢ÖWFFFæÖ÷F—fòÇÂ6–3òæÖ÷F—fòÇÂ%&Wf—6õ&ö¦WFò"À¢æW†÷3¢Væ—VU6–4GF6†ÖVçG2À¢Ó°§Ð ¦gVæ7F–öâ&VæFW%6–4&÷fÅ7–æ5æVÂ†FVÖæB’°¢6öç7B&÷fÂÒ6–4&÷fÅ&VF–ær†FVÖæB“°¢6öç7B&÷fVDBÒFVÖæBç6–4&÷fÄ&÷fVDBò&÷fFVÒG¶FFUFW‡B†FVÖæBç6–4&÷fÄ&÷fVDB—Ö¢"#°¢6öç7B&WVW7FVDBÒFVÖæBç6–4&÷fÅ&WVW7FVDBò6öÆ–6—FFVÒG¶FFUFW‡B†FVÖæBç6–4&÷fÅ&WVW7FVDB—Ö¢$VçG&F6–æ7&öæ—¦F6öÒf–ÆFR&÷f:|:6ò#°¢6öç7B&V¦V7FVDBÒFVÖæBç6–4&÷fÅ&V¦V7FVDBò&W&÷fFVÒG¶FFUFW‡B†FVÖæBç6–4&÷fÅ&V¦V7FVDB—Ö¢"#°¢6öç7Bæ÷FRÒ&÷fÂç7FGW2ÓÓÒ%÷7FF"ò÷7FFæòUbVÒG¶FFUFW‡B†FVÖæBç6–5÷7FVDB—Ö¢&÷fÂç7FGW2ÓÓÒ$&÷fFò"ò&÷fVDB¢&÷fÂç7FGW2ÓÓÒ%&W&÷fFò"ò&V¦V7FVDB¢&WVW7FVDC°¢&WGW&â ¢ÆF—b6Æ73Ò'6–2Ö&÷fÂ×7–æ2"FF×FöæSÒ"G¶&÷fÂçFöæWÒ#à¢ÆF—cà¢Ç7ãäfÇW†òFR&÷f:|:6óÂ÷7ãà¢Ç7G&öæsâG¶&÷fÂæÆ&VÇÓÂ÷7G&öæsà¢Ç6ÖÆÃâG¶æ÷FRÇÂ$wV&FæFòfÆ–F:|:6òF6ÆL:–6æ–6'ÓÂ÷6ÖÆÃà¢ÂöF—cà¢ÆF—b6Æ73Ò&–æÆ–æRÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷Vâ×6–2Ö&÷fÂ"FFÖ–CÒ"G¶FVÖæBæ–GÒ#ä'&—"&÷f:|:6óÂö'WGFöãà¢ÂöF—cà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW$FVÖæE6–4ÖWFFF†FVÖæB’°¢6öç7B–æfòÒFVÖæE6–4–æfò†FVÖæB“°¢–b‚–æfò’&WGW&â"#°¢6öç7Bf–VÆEfÇVRÒ‡fÇVR’Óâ‡fÇVRÓÓÒ.(	B"ò""¢W66TGG&–'WFR‡fÇVR’“°¢6öç7B6W'f–6TW†V7WFVBÒ6–5v÷&·56W'f–6TW†V7WFVB†FVÖæB“°¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ6–2ÖFWF–Â×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäFF÷2F4”3Â÷7ãà¢ÂöF—cà¢ÆF—b6Æ73Ò&f÷&ÒÖw&–B#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäì+¢FòÄT4ôÒ£Â÷7ãà¢Æ–çWBæÖSÒ&ÆV6öÔçVÖ&W""fÇVSÒ"G¶f–VÆEfÇVR†–æfòæÆV6öÔçVÖ&W"—Ò"Æ6V†öÆFW#Ò$W‚ã¢ã3ƒ’ã##’"WFö6ö×ÆWFSÒ&öfb"&WV—&VBóà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåL:×GVÆòF4”3Â÷7ãà¢Æ–çWBæÖSÒ'F—GVÆõ6–2"fÇVSÒ"G¶f–VÆEfÇVR†–æfòçF—GVÆõ6–2—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäì+¢F4”3Â÷7ãà¢Æ–çWBæÖSÒ&çVÖW&õ6–2"fÇVSÒ"G¶f–VÆEfÇVR†–æfòæçVÖW&õ6–2—Ò"Æ6V†öÆFW#Ò$W‚ã¢4”2Ó÷R<;6F–vòF6öçG&FF"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäÖ÷F—fóÂ÷7ãà¢Ç6VÆV7BæÖSÒ&Ö÷F—fò#à¢G·6–4Ö÷F—fô÷F–öç2†–æfòæÖ÷F—fò—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÂöF—cà¢ÆÆ&VÂ6Æ73Ò'6–2ÖFW67&—F–öâÖ&÷‚#à¢Ç7ãäFW67&œ:|:6òF4”3Â÷7ãà¢ÇFW‡F&VæÖSÒ'6–4FW67&–6ò#âG¶f–VÆEfÇVR†–æfòæFW67&–6õ6–2—ÓÂ÷FW‡F&Và¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò'6–2ÖVæv–æVW&–ærÖÖVWF–ær×FövvÆR#à¢Æ–çWBæÖSÒ'6–4Væv–æVW&–ætÖVWF–ær"G—SÒ&6†V6¶&÷‚"G¶FVÖæBç6–4Væv–æVW&–ætÖVWF–ærÓÓÒG'VRò&6†V6¶VB"¢"'Òóà¢Ç7ããÇ7G&öæsä6ö'&FòVÒ&WVæœ:6óÂ÷7G&öæsãÇ6ÖÆÃäÖ'VRVæFò6ÆL:–6æ–6W7F—fW"6VæFò6ö'&F÷"W7F4”2VÒ&WVæœ:6òãÂ÷6ÖÆÃãÂ÷7ãà¢ÂöÆ&VÃà¢G·6W'f–6TW†V7WFVBÓÓÒçVÆÂò""¢ÆF—b6Æ73Ò'6–2×6W'f–6RÖW†V7WF–öâ×&VF÷WB"FFÖW†V7WFVCÒ"G·6W'f–6TW†V7WFVGÒ#ãÇ7ãäW†V7\:|:6òFò6W'fœ:vóÂ÷7ããÇ7G&öæsâG·6W'f–6TW†V7WFVBò$W†V7WFFò"¢$ì:6òW†V7WFFò'ÓÂ÷7G&öæsãÇ6ÖÆÃä–æf÷&Ö:|:6ò6öæf—&ÖFæfÆ–F:|:6òFRö'&2ãÂ÷6ÖÆÃãÂöF—cæÐ¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ÷7FVE6–4F—7Æ•7VÖÖ'’†FVÖæB’°¢&WGW&â†FVÖæBç6–4–G2ÇÂµÒ¢æÖ‚†–B’Óâ°¢6öç7B6–2Ò7FFRç6–72æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢–b‚6–2’&WGW&âW66TGG&–'WFR†–B“°¢&WGW&âW66TGG&–'WFR†G·6–4F—7Æ•&VfW&Væ6R‡6–2—Ò+rG·6–4F—7Æ•F—FÆR‡6–2—Ö“°¢Ò¢æ¦ö–â‚"Â"“°§Ð ¦gVæ7F–öâ&VæFW$FVÖæE6–5&—6´ÆW'B†FVÖæB’°¢6öç7Bv÷&²Òv÷&´'”–B†FVÖæBæö'&–B“°¢–b‚v÷&²’&WGW&â"#°¢6öç7B÷7FVE6–72Ò†FVÖæBç6–4–G2ÇÂµÒ’æÖ‚†–B’Óâ7FFRç6–72æf–æB‚‡6–2’Óâ6–2æ–BÓÓÒ–B’’æf–ÇFW"„&ööÆVâ“° ¢–b‡÷7FVE6–72æÆVæwF‚’°¢6öç7BÆW'G2Ò÷7FVE6–70¢æÖ‚‡6–2’Óâ‡²6–2Â&—6³¢6–5&—6µ&VF–ær‡v÷&²Â6–2’Ò’¢æf–ÇFW"‚‡²&—6²Ò’Óâ&—6²æW†6VVFVB“°¢–b‚ÆW'G2æÆVæwF‚’&WGW&â"#°¢&WGW&â ¢ÆF—b6Æ73Ò'6–2×&—6²ÖÆW'B"&öÆSÒ&ÆW'B#à¢Ç7G&öæsäÆW'FFR&—66óÂ÷7G&öæsà¢G¶ÆW'G0¢æÖ€¢‡²6–2Â&—6²Ò’Óâ ¢Çà¢G¶W66TGG&–'WFR†G·6–4F—7Æ•&VfW&Væ6R‡6–2—Ò+rG·6–4F—7Æ•F—FÆR‡6–2—Ö—Òfö’÷7FF6öÒG¶ÖöæW’‡&—6²çF÷FÂ—ÒÂ6–ÖFò&—66òF—7öì:×fVÂFRG¶ÖöæW’‡&—6²æf–Æ&ÆR—Òà¢W†6W76òW7F–ÖFó¢Æ#âG¶ÖöæW’‡&—6²æW†6W72—ÓÂö#âà¢Â÷à¢ ¢¢æ¦ö–â‚""—Ð¢ÂöF—cà¢°¢Ð ¢6öç7BG&gEF÷FÂÒ†FVÖæBç6–4G&gDF—66—Æ–æW2ÇÂµÒ’ç&VGV6R‚‡7VÒÂ—FVÒ’Óâ7VÒ²ÖF‚æÖ‚„çVÖ&W"†—FVÒçfÆ÷$FVÇF’ÇÂÂ’Â“°¢6öç7B&—6²Ò6–5&—6µ&VF–ær‡v÷&²ÂçVÆÂÂG&gEF÷FÂ“°¢–b‚G&gEF÷FÂÇÂ&—6²æW†6VVFVB’&WGW&â"#°¢&WGW&â ¢ÆF—b6Æ73Ò'6–2×&—6²ÖÆW'B"&öÆSÒ&ÆW'B#à¢Ç7G&öæsäÆW'FFR&—66óÂ÷7G&öæsà¢Çà¢òfÆ÷"&Wf—7FòF4”2:’G¶ÖöæW’‡&—6²çF÷FÂ—ÒÂ6–ÖFò&—66òF—7öì:×fVÂFRG¶ÖöæW’‡&—6²æf–Æ&ÆR—Òà¢W†6W76òW7F–ÖFó¢Æ#âG¶ÖöæW’‡&—6²æW†6W72—ÓÂö#âà¢Â÷à¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW$FVÖæEVæ—D6öçFW‡B†FVÖæBÂv÷&²ÒçVÆÂ’°¢6öç7B—4W†—7F–ærÒFVÖæBçVæ–FFTÖöFòÓÓÒ&W†—7FVçFR#°¢6öç7BVæ—DæÖRÒFVÖæBçVæ–FFTæöÖRÇÂ†—4W†—7F–ærò""¢v÷&³òææöÖRÇÂ""“°¢6öç7BVæ—EG—RÒFVÖæBçVæ–FFUF—òÇÂ†—4W†—7F–ærò""¢v÷&³òçF—õVæ–FFRÇÂ""“°¢6öç7BVæ—D6—G’ÒFVÖæBçVæ–FFT×Væ–6—–òÇÂ†—4W†—7F–ærò""¢·v÷&³òæ6–FFRÂv÷&³òçVeÒæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"ò"’“°¢6öç7BVæ—D6ç¢ÒFVÖæBçVæ–FFT6ç¢ÇÂ†—4W†—7F–ærò""¢v÷&³òæ6ç¢ÇÂ""“°¢6öç7BVæ—D6VçFW"ÒFVÖæBçVæ–FFT6VçG&òÇÂ†—4W†—7F–ærò""¢v÷&³òæ6öF–vô÷&–v–æÂÇÂ""“°¢6öç7B6÷W&6RÒFVÖæBçVæ–FFU6÷W&6RÇÂ†—4W†—7F–ærò$6F7G&òvW&ÂFRVæ–FFW2"¢%÷'Fl;6Æ–òFRö'&2"“° ¢–b‚Væ—DæÖRbb—4W†—7F–ær’&WGW&â"#° ¢&WGW&â ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãä6öçFW‡FòFVæ–FFSÂ÷7ãà¢ÂöF—cà¢ÆF—b6Æ73Ò'7Æ—BÖÆ—7B6ö×7BFVÖæBÖ6öçFW‡BÖw&–B#à¢G·7Æ—D—FVÒ‚%F—òFR–çFW'fVì:|:6ò"Â—4W†—7F–ærò$ö'&VÒVæ–FFRW†—7FVçFR"¢%Væ–FFRæ÷f"—Ð¢G·7Æ—D—FVÒ‚%Væ–FFR"ÂVæ—DæÖRÇÂ$ì:6òf–æ7VÆF"—Ð¢G·7Æ—D—FVÒ‚%F—òòÆö6Â"Â·Væ—EG—RÂVæ—D6—G•Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"Â"’ÇÂ.(	B"—Ð¢G·7Æ—D—FVÒ‚$4å¢"ÂVæ—D6ç¢ÇÂ$ì:6ò–æf÷&ÖFò"—Ð¢G·7Æ—D—FVÒ‚$6VçG&òò÷&–vVÒ"Â·Væ—D6VçFW"Â6÷W&6UÒæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"Â"’ÇÂ.(	B"—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢°§Ð ¦gVæ7F–öâ÷VäFVÖæDFWF–ÄÖöFÂ†–B’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢–b‚FVÖæB’&WGW&ã°¢6öç7Bv÷&²Òv÷&´'”–B†FVÖæBæö'&–B“°¢6öç7B†—7F÷&–W2Ò7FFRæ†—7F÷'’æf–ÇFW"‚†—FVÒ’Óâ—FVÒæVçF–FFT–BÓÓÒFVÖæBæ–BÇÂ†FVÖæBç6–4–G2ÇÂµÒ’æ–æ6ÇVFW2†—FVÒæVçF–FFT–B’“°¢6öç7B7FvUF–ÖRÒFVÖæE7FvUF–ÖT–æfò†FVÖæB“°¢6öç7BF—&V7F÷%v—fW"Ò6–4F—&V7F÷%v—fW$FF†FVÖæB“°¢6öç7BF—&V7F÷%v—fW$FFRÒF—&V7F÷%v—fW"òæWrFFR†F—&V7F÷%v—fW"çv—fVDB’¢çVÆÃ°¢6öç7BF—&V7F÷%v—fW$FFUFW‡BÒF—&V7F÷%v—fW$FFRbbçVÖ&W"æ—4æâ†F—&V7F÷%v—fW$FFRævWEF–ÖR‚’¢òF—&V7F÷%v—fW$FFRçFôÆö6ÆU7G&–ær‚'BÔ%""¢¢&FFì:6ò–æf÷&ÖF#°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&BFVÖæBÖÖöFÂÖ6&BFVÖæBÖFWF–ÂÖf÷&Ò"–CÒ&FVÖæDFWF–Äf÷&Ò"FFÖ–CÒ"G¶FVÖæBæ–GÒ"&–ÖÆ&VÆÆVF'“Ò&FVÖæDFWF–ÅF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#âG¶FVÖæBæ–GÒ(	BG¶FVÖæEG—TÆ&VÂ†FVÖæBçF—ò—ÓÂ÷7ãà¢Æƒ"–CÒ&FVÖæDFWF–ÅF—FÆR#âG·v÷&³òææöÖRÇÂ$ö'&ì:6òÆö6Æ—¦F'ÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#âG·v÷&³òæ6†fUVæ–6ÇÂv÷&³òæ6öF–vô÷&–v–æÂÇÂ'6VÒ<;6F–vò'Ò+rG¶W66TGG&–'WFR†FVÖæE7&–çDæÖW2†FVÖæBÂ"(i""’—ÓÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâFVÖæBÖæÇ—7B×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäæÆ—7F2FFVÖæFÂ÷7ãà¢ÂöF—cà¢G¶æÇ—7D6†—÷F–öç2†FVÖæB—Ð¢Â÷6V7F–öãà ¢G°¢FVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2 ¢ò" ¢¢ÆÆ&VÂ6Æ73Ò&f–VÆBÖöFÂ×6V7F–öâ#à¢Ç7ãäFW67&œ:|:6òFFVÖæFÂ÷7ãà¢ÇFW‡F&VæÖSÒ&FW67&–6ò"Æ6V†öÆFW#Ò$FW67&WfòW66÷òFW7FFVÖæFâââ#âG¶W66TGG&–'WFR†FVÖæBæö'6W'f6òÇÂ""—ÓÂ÷FW‡F&Và¢ÂöÆ&VÃæ ¢Ð ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãä–FVçF–f–6:|:6òFFVÖæFÂ÷7ãà¢ÂöF—cà¢ÆF—b6Æ73Ò&f÷&ÒÖw&–B#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåF—òFRF—f–FFSÂ÷7ãà¢Ç6VÆV7BæÖSÒ'F—ò#à¢G·v÷&´FVÖæEG—TFVf–æ—F–öç2æÖ‚‡G—R’ÓâÆ÷F–öâfÇVSÒ"G·G—Ræ–GÒ"G·G—Ræ–BÓÓÒFVÖæEG—T¶W’†FVÖæBçF—ò’ò'6VÆV7FVB"¢"'ÓâG·G—RæÆ&VÇÓÂö÷F–öãæ’æ¦ö–â‚""—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆF—b6Æ73Ò&f–VÆB#à¢Ç7ãå7&–çG3Â÷7ãà¢G·7&–çD6†V6¶&÷†W2†FVÖæE7&–çD–G2†FVÖæB’—Ð¢Ç6ÖÆÂ6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR†FVÖæE7&–çEW&–öEFW‡B†FVÖæB’—Òâ6VÆV6–öæRVÖ÷RÖ—3²7&–çBÖ—2&V6VçFR6W,:&VfW,:¦æ6–FR6öæ6ÇW<:6òR&öG\:|:6òãÂ÷6ÖÆÃà¢ÂöF—cà¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäö'&f–æ7VÆF£Â÷7ãà¢ÂöF—cà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&ö'&–B"fÇVSÒ"G¶W66TGG&–'WFR‡v÷&³òæ–BÇÂFVÖæBæö'&–BÇÂ""—Ò"óà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãä'W66"ö'&Â÷7ãà¢Æ–çWBæÖSÒ&ö'&'W66"FFÖFVÖæB×v÷&²×6V&6‚Æ—7CÒ&FVÖæEv÷&´÷F–öç2"fÇVSÒ"G¶W66TGG&–'WFR‡v÷&³òææöÖRÇÂ""—Ò"Æ6V†öÆFW#Ò$F–v—FRòæöÖRFö'&âââ"WFö6ö×ÆWFSÒ&öfb"&WV—&VBóà¢ÂöÆ&VÃà¢G¶FVÖæEv÷&´FFÆ—7B‡²–æ6ÇVFT†—7F÷&–6Ã¢G'VRÒ—Ð¢Â÷6V7F–öãà ¢G·&VæFW$FVÖæE6–4ÖWFFF†FVÖæB—Ð ¢Ç6V7F–öâ6Æ73Ò&FVÖæB×7FGW2Ö&÷‚FVÖæB×7FGW2Ö6öçG&öÂ"FF×7FGW3Ò"G¶FVÖæBæ6öÇVæÒ#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãå7FGW2GVÂ+rÇFW&R&Ö÷fW"ò6&CÂ÷7ãà¢Ç6VÆV7BæÖSÒ&6öÇVæ#à¢G¶6öÇVÖä÷F–öç2†FVÖæB—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆBgVÆÂ×7â"FFÖFVÖæB×7FGW2×&V6öâÖf–VÆBGµ²'W6Fò"Â&6æ6VÆFò%Òæ–æ6ÇVFW2†FVÖæBæ6öÇVæ’ò""¢&†–FFVâ'Óà¢Ç7âFFÖFVÖæB×7FGW2×&V6öâÖÆ&VÃâG¶FVÖæE7FGW5&V6öäÆ&VÂ†FVÖæBæ6öÇVæ—ÓÂ÷7ãà¢ÇFW‡F&VæÖSÒ'7FGW5&V6öâ"&÷w3Ò#2"Ö–æÆVæwFƒÒ#R"Gµ²'W6Fò"Â&6æ6VÆFò%Òæ–æ6ÇVFW2†FVÖæBæ6öÇVæ’ò'&WV—&VB"¢"'ÒÆ6V†öÆFW#Ò$W‡Æ—VR÷"VRW7FFVÖæFW7L:6VæFòG¶FVÖæBæ6öÇVæÓÓÒ&6æ6VÆFò"ò&6æ6VÆF"¢'W6F'Òâââ#âG¶W66TGG&–'WFR†FVÖæE7FGW5&V6öâ†FVÖæB’—ÓÂ÷FW‡F&Và¢Ç6ÖÆÂ6Æ73Ò&×WFVB#äö'&–vL;7&–òòW6"÷R6æ6VÆ"âòÖ÷F—fòf–66Çfòæò6&BRæò†—7L;7&–6òãÂ÷6ÖÆÃà¢ÂöÆ&VÃà¢Â÷6V7F–öãà ¢G¶F—&V7F÷%v—fW"ò ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò&–æfòÖ&÷‚#à¢Ç7G&öæsä&÷f:|:6òFF—&WF÷&–F—7Vç6FÂ÷7G&öæsà¢Ç7ãâG¶W66TGG&–'WFR†F—&V7F÷%v—fW"ç&V6öâ—ÓÂ÷7ãà¢Ç6ÖÆÃå&Vv—7G&Fò÷"G¶W66TGG&–'WFR†F—&V7F÷%v—fW"çv—fVD'’—ÒVÒG¶W66TGG&–'WFR†F—&V7F÷%v—fW$FFUFW‡B—ÒâF—7Vç6ì:6òWV—fÆRVÖ&÷f:|:6òFF—&WF÷&–ãÂ÷6ÖÆÃà¢ÂöF—cà¢Â÷6V7F–öãà¢¢"'Ð ¢G¶FVÖæBæ6öÇVæÓÓÒ&6öæ6ÇV–Fò"ò ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâFVÖæB×&öGV6VB×fÇVR×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆRv—F‚Ö7F–öâ#à¢Ç7ãä–×7Fòf–ææ6V—&òF6öæ6ÇW<:6óÂ÷7ãà¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&VF—BÖ6ö×ÆWFVBÖFVÖæB×fÇVR"FFÖ–CÒ"G¶FVÖæBæ–GÒ#âG¶FVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2"ò†FVÖæD†5&V6÷&FVEfÇVR†FVÖæB’ò$§W7F"fÆ÷"FFVÖæF"¢$–æf÷&Ö"fÆ÷"FFVÖæF"’¢†FVÖæD†5&V6÷&FVEfÇVR†FVÖæB’ò$§W7F"fÆ÷"vW&Fò"¢$–æf÷&Ö"fÆ÷"vW&Fò"—ÓÂö'WGFöãà¢ÂöF—cà¢ÆF—b6Æ73Ò'7Æ—BÖÆ—7B6ö×7B#à¢G·7Æ—D—FVÒ‚%fÆ÷"vW&Fò"ÂFVÖæD†5&V6÷&FVEfÇVR†FVÖæB’òÖöæW’†FVÖæBçfÆ÷$vW&Fò’¢$ì:6ò–æf÷&ÖFò"—Ð¢G·7Æ—D—FVÒ‚%6—GV:|:6òæòUb"ÂFVÖæBæWe6VÔ×VFæ6ÓÓÒG'VRò%6VÒ×VFì:væòUb"¢FVÖæD†4UeWFFTf÷$6ö×ÆWF–öâ†FVÖæB’ò$UbGVÆ—¦Fò"¢$ì:6ò–æf÷&ÖFò"—Ð¢ÂöF—cà¢Ç6Æ73Ò&×WFVB#äFVÖæF26öæ6Ç\:ÖF2öFVÒFW"òfÆ÷"vW&Fò6ö×ÆVÖVçFFò÷R6÷'&–v–Fò6VÒ&V'&—"ò6&Bâò§W7FRf–6&Vv—7G&Fòæò†—7L;7&–6òR<;2:’6öæf—&ÖFò;72w&f:|:6òæò&æ6òãÂ÷à¢Â÷6V7F–öãà¢¢"'Ð ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäFWFÆ†W3Â÷7ãà¢ÂöF—cà¢ÆF—b6Æ73Ò&f÷&ÒÖw&–B6ö×7BÖf÷&ÒÖw&–B#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãå&–÷&–FFSÂ÷7ãà¢Ç6VÆV7BæÖSÒ'&–÷&–FFR#à¢G·&–÷&—G”÷F–öç2†FVÖæBç&–÷&–FFR—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢G·&VæFW$FVÖæDÆ&VÇ4f–VÆB†FVÖæBæWF—VWF2—Ð¢G¶FVÖæBæ6öÇVæÓÓÒ&6öæ6ÇV–Fò"ò""¢ ¢ÆF—b6Æ73Ò&FWF–ÂÖ6&BFVÖæB×7FvR×7VÖÖ'’#à¢Ç7ãåFV×òæWFGVÃÂ÷7ãà¢Ç7G&öæsâG·7FvUF–ÖRæGW&F–öäÆ&VÇÓÂ÷7G&öæsà¢Ç6ÖÆÃâG¶FVÖæE7FGW4Æ&VÂ†FVÖæB—Ò+rG·7FvUF–ÖRæ6Æ÷6VBò6öçFvVÒVæ6W'&FVÒG·7FvUF–ÖRæVæFVDÆ&VÇÖ¢FW6FRG·7FvUF–ÖRç7F'FVDÆ&VÇÖÒG·7FvUF–ÖRæW7F–ÖFVBò"+r&VfW,:¦æ6–W7F–ÖF&FVÖæFçF–v"¢"'ÓÂ÷6ÖÆÃà¢ÂöF—cà¢Ð¢ÆF—b6Æ73Ò&FVÖæB×7FvRÖ†—7F÷'’Ö&Æö6²gVÆÂ×7â#à¢Ç7G&öæsä†—7L;7&–6òFRW&Öì:¦æ6–÷"WFÂ÷7G&öæsà¢Ç6Æ73Ò&×WFVB#äò6öçFF÷"&V–æ–6–6F×VFì:vFR7FGW3²÷2W,:ÖöF÷2çFW&–÷&W2W&ÖæV6VÒ&Vv—7G&F÷2ãÂ÷à¢G·&VæFW$FVÖæE7FvUW&–öG2†FVÖæB—Ð¢ÂöF—cà¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäFF3Â÷7ãà¢ÂöF—cà¢ÆF—b6Æ73Ò&FFRÖw&–BFVÖæBÖFFRÖw&–B#à¢G¶FFTf–VÆB‚#+rFF&Wf—7FFR–ì:Ö6–ò"Â&FF&Wf—7F–æ–6–ò"ÂFVÖæBæFF&Wf—7F–æ–6–ò—Ð¢G¶FFTf–VÆB‚#"+rFFFR–ì:Ö6–ò&VÂ"Â&FF–æ–6–õ&VÂ"ÂFVÖæBæFF–æ–6–õ&VÂ—Ð¢G¶FFTf–VÆB‚#2+r&WbâVçf–òòfÆ–F:|:6òö'&2"Â&FF&WdVçf–õfÆ–F6ôö'&2"ÂFVÖæBæFF&WdVçf–õfÆ–F6ôö'&2—Ð¢G¶FFTf–VÆB‚#B+rVçf–ò&VÂòfÆ–F:|:6òö'&2"Â&FFVçf–õ&VÅfÆ–F6ôö'&2"ÂFVÖæBæFFVçf–õ&VÅfÆ–F6ôö'&2—Ð¢ÆÆ&VÂ6Æ73Ò'fÆ–FF–öâ×6¶—gVÆÂ×7â#à¢Æ–çWBæÖSÒ&æôVçf–%fÆ–F6ôö'&2"G—SÒ&6†V6¶&÷‚"G¶FVÖæBææôVçf–%fÆ–F6ôö'&2ò&6†V6¶VB"¢"'Òóà¢Ç7ãäW7FFVÖæFì:6òfö’÷6W,:Vçf–F&fÆ–F:|:6òFWV—RFRö'&3Â÷7ãà¢ÂöÆ&VÃà¢G¶FFTf–VÆB‚#R+rFFFRfÆ–F:|:6òFRö'&2"Â&FFfÆ–F6ôö'&2"ÂFVÖæBæFFfÆ–F6ôö'&2—Ð¢G¶FFTf–VÆB‚#b+rFF&Wf—7FFVçG&Vv"Â&FF&Wf—7FVçG&Vv"ÂFVÖæBæFF&Wf—7FVçG&Vv—Ð¢G¶FFTf–VÆB‚#r+rFFVçG&Vv&VÂ"Â&FFVçG&Vv&VÂ"ÂFVÖæBæFFVçG&Vv&VÂÂG'VR—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆRv—F‚Ö7F–öâ#à¢Ç7ãä†—7L;7&–6òFRÇFW&:|;VW3Â÷7ãà¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'FövvÆRÖFVÖæBÖ†—7F÷'’#åfW"†—7L;7&–6óÂö'WGFöãà¢ÂöF—cà¢ÆF—b6Æ73Ò&FVÖæBÖ†—7F÷'’×æVÂ"†–FFVãà¢G·&VæFW$FVÖæD†—7F÷'’††—7F÷&–W2—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäö'6W'f:|:6óÂ÷7ãà¢ÂöF—cà¢ÇFW‡F&VæÖSÒ&æ÷F"Æ6V†öÆFW#Ò%&Vv—7G&Rö'6W'f:|;VW2&VÆWfçFW26ö'&RW7FFVÖæFâââ#âG¶FVÖæBææ÷FÇÂ"'ÓÂ÷FW‡F&Và¢Â÷6V7F–öãà ¢G¶FVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2"ò""¢ ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆRv—F‚Ö7F–öâ#à¢Ç7ãå&ö¦WF÷2VçföÇf–F÷3Â÷7ãà¢ÂöF—cà¢G·&VæFW$FVÖæE&ö¦V7G2†FVÖæB—Ð¢Â÷6V7F–öãà¢Ð ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâFVÖæBÖWb×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäW7GVFòFRf–&–Æ–FFR„Ub“Â÷7ãà¢ÂöF—cà¢Ç6Æ73Ò&×WFVB#äW7FFVÖæFÆ–ÖVçFF—&WFÖVçFRòUbFö'&f–æ7VÆFâ6Rö'&–æFW7F—fW"6VÒUbÂòW7GVFò76W†—7F—"VæFò†÷WfW"ò&–ÖV—&ò&VVæ6†–ÖVçFò6ÇfòãÂ÷à¢ÆF—b6Æ73Ò'7Æ—BÖÆ—7B6ö×7B#à¢G·7Æ—D—FVÒ‚$UbGVÂ"Âv÷&²òG¶VffV7F—fTUe7FGW2‡v÷&²’ÓÓÒ%6VÒUb"ò%6VÒfW'<:6ò"¢$UbGµ7G&–ær‡v÷&²æWcòçfW'6ôGVÂÇÂ’çE7F'Bƒ"Â#"—ÖÒ+rG¶VffV7F—fTUe7FGW2‡v÷&²—Ö¢.(	B"—Ð¢ÂöF—cà¢G·v÷&²òÆ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâgVÆÂ×v–GF‚"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷Vâ×v÷&²ÖWb"FFÖ–CÒ"G·v÷&²æ–GÒ#ä'&—"UbFö'&f–æ7VÆFÂö'WGFöãæ¢"'Ð¢Â÷6V7F–öãà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢G¶6äFVÆWFTFVÖæB‚’òÆ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâFævW"Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷VâÖFVÆWFRÖFVÖæB"FFÖ–CÒ"G¶FVÖæBæ–GÒ#äW†6ÇV—"FVÖæFÂö'WGFöãæ¢"'Ð¢G¶FVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2"bbFVÖæBæ6öÇVæÓÓÒ&&÷f6ôF—&WF÷&–"bb6åv—fU6–4F—&V7F÷$&÷fÂ‚¢òÆ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'v—fR×6–2ÖF—&V7F÷"Ö&÷fÂ"FFÖ–CÒ"G¶W66TGG&–'WFR†FVÖæBæ–B—Ò#âG¶F—&V7F÷%v—fW"ò$6öçF–çV"6öæ6ÇW<:6ò6öÒF—7Vç6"¢$F—7Vç6"F—&WF÷&–R6öæ6ÇV—"'ÓÂö'WGFöãæ ¢¢"'Ð¢G·v÷&²òÆ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷Vâ×v÷&²ÖWb"FFÖ–CÒ"G¶W66TGG&–'WFR‡v÷&²æ–B—Ò#ä'&—"UcÂö'WGFöãæ¢"'Ð¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#äfV6†#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#å6Çf#Âö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ÷VäFVÆWFTFVÖæDÖöFÂ†–B’°¢–b‚6äFVÆWFTFVÖæB‚’’°¢6†÷uFö7B‚%6öÖVçFRvW7F÷&W2RFÖ–ç26öÒW&Ö—7<:6òFRVFœ:|:6òöFVÒW†6ÇV—"FVÖæF2â"“°¢&WGW&ã°¢Ð¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢–b‚FVÖæB’&WGW&ã°¢6öç7Bv÷&²Òv÷&´'”–B†FVÖæBæö'&–B“°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&BFVÆWFRÖFVÖæBÖ6&B"–CÒ&FVÆWFTFVÖæDf÷&Ò"FFÖ–CÒ"G¶FVÖæBæ–GÒ"&–ÖÆ&VÆÆVF'“Ò&FVÆWFTFVÖæEF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#äW†6ÇV—"FVÖæFÂ÷7ãà¢Æƒ"–CÒ&FVÆWFTFVÖæEF—FÆR#âG¶FVÖæBæ–GÒ(	BG¶FVÖæEG—TÆ&VÂ†FVÖæBçF—ò—ÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#âG·v÷&³òææöÖRÇÂ$ö'&ì:6òÆö6Æ—¦F'Ò+rG¶FVÖæE7FGW4Æ&VÂ†FVÖæB—ÓÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãä§W7F–f–6F—fö'&–vL;7&–Â÷7ãà¢ÂöF—cà¢ÇFW‡F&VæÖSÒ&§W7F–f–6F—f"&WV—&VBÖ–æÆVæwFƒÒ#R"Æ6V†öÆFW#Ò$–æf÷&ÖRòÖ÷F—fòFW†6ÇW<:6òFFVÖæFâââ#ãÂ÷FW‡F&Và¢Ç6Æ73Ò&×WFVB#äò6&B6W,:&VÖ÷f–FòFf—<:6ò÷W&6–öæÂR§W7F–f–6F—ff–6,:&Vv—7G&Fæò†—7L;7&–6òãÂ÷à¢Â÷6V7F–öãà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò&FævW"Ö7F–öâ"G—SÒ'7V&Ö—B#äW†6ÇV—"FVÖæFÂö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâæÇ—7D76–væÖVçDg&öÔf÷&Ò†f÷&ÒÂfÆÆ&6²Ò·Ò’°¢6öç7B†–FFVâÒf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ&æÆ—7F56VÆV6–öæF÷2%Òr“°¢ÆWB6VÆV7FVBÒµÓ°¢–b††–FFVâ’°¢G'’°¢6öç7B'6VBÒ¥4ôâç'6R††–FFVâçfÇVRÇÂ%µÒ"“°¢–b„'&’æ—4'&’‡'6VB’’6VÆV7FVBÒ'6VC°¢Ò6F6‚°¢6VÆV7FVBÒµÓ°¢Ð¢ÒVÇ6R°¢6öç7Bf÷&ÔFFÒf÷&ÒòæWrf÷&ÔFF†f÷&Ò’¢çVÆÃ°¢6VÆV7FVBÒ¶f÷&ÔFFòævWB‚&æÆ—7F&W7öç6fVÂ"’ÇÂf÷&ÔFFòævWB‚&æÆ—7F6ÆFV6æ–6"’ÇÂfÆÆ&6²ææÆ—7F&W7öç6fVÂÂââæ'&”÷$fÆÆ&6²†fÆÆ&6²ææÆ—7F46ö×ÆVÖVçF&W2•Ó°¢Ð¢&WGW&âæ÷&ÖÆ—¦TFVÖæDæÇ—7G2‡²æÆ—7F&W7öç6fVÃ¢6VÆV7FVE³ÒÂæÆ—7F46ö×ÆVÖVçF&W3¢6VÆV7FVBç6Æ–6Rƒ’Ò“°§Ð ¦gVæ7F–öâfÆ–FFTFVÖæDæÇ—7G2†76–væÖVçBÂf÷&Ò’°¢6öç7BVæ¶æ÷vâÒFVÖæDæÇ—7DæÖW2†76–væÖVçB’æf–æB‚†æÖR’Óâ&Vv—7FW&VDæÇ—7DæÖR†æÖR’“°¢–b‚Væ¶æ÷vâ’&WGW&âG'VS°¢6†÷tf÷&ÔW'&÷"†òæÆ—7F"G·Væ¶æ÷vçÒ"ì:6òW7L:6F7G&FòVÒ6öæf–wW&:|;VW2â6VÆV6–öæRVÒæÆ—7F6F7G&FòæÂf÷&Ò“°¢&WGW&âfÇ6S°§Ð ¦gVæ7F–öâæÇ—7E6VÆV7F–öå7VÖÖ'’†æÇ—7G2ÒµÒ’°¢–b‚æÇ—7G2æÆVæwF‚’&WGW&â$æVæ‡VÒæÆ—7F6VÆV6–öæFòâ#°¢&WGW&âÌ:ÖFW#¢G¶æÇ—7G5³×Ò+r6ö×ÆVÖVçF&W3¢G¶æÇ—7G2ç6Æ–6Rƒ’æ¦ö–â‚"Â"’ÇÂ$æVæ‡VÒ'Ö°§Ð ¦gVæ7F–öâæÇ—7D6†—÷F–öç2†FVÖæBÒ·Ò’°¢6öç7B6VÆV7FVBÒFVÖæDæÇ—7DæÖW2†FVÖæB’æÖ‡&Vv—7FW&VDæÇ—7DæÖR’æf–ÇFW"„&ööÆVâ“°¢6öç7B6VÆV7FVD¶W—2ÒæWr6WB‡6VÆV7FVBæÖ†æ÷&ÖÆ—¦U6V&6…FW‡B’“°¢6öç7B÷F–öç2Ò°¢ââç6VÆV7FVBÀ¢ââçVæ—VTæÇ—7G2‚’æf–ÇFW"‚†æÇ—7B’Óâ6VÆV7FVD¶W—2æ†2†æ÷&ÖÆ—¦U6V&6…FW‡B†æÇ—7B’’’À¢Ó°¢&WGW&â ¢ÆF—b6Æ73Ò&FVÖæBÖæÇ—7B×6VÆV7F÷""FFÖFVÖæBÖæÇ—7B×6VÆV7F÷#à¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&æÆ—7F56VÆV6–öæF÷2"fÇVSÒ"G¶W66TGG&–'WFR„¥4ôâç7G&–æv–g’‡6VÆV7FVB’—Ò"óà¢ÆF—b6Æ73Ò&æÇ—7BÖ6†—Öw&–B#à¢Æ'WGFöâ6Æ73Ò&æÇ—7BÖ6†—æÇ—7BÖ6†—Ö6ÆV"G·6VÆV7FVBæÆVæwF‚ò""¢&—2Ö7F—fR'Ò"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6ÆV"ÖFVÖæBÖæÇ—7G2#à¢Ç7ãå6VÒæÆ—7FÂ÷7ãà¢Âö'WGFöãà¢G¶÷F–öç2æÖ‚†æÇ—7B’Óâ°¢6öç7B–æFW‚Ò6VÆV7FVBæ–æFW„öb†æÇ—7B“°¢6öç7B&öÆRÒ–æFW‚ÓÓÒò$Ì:ÖFW""¢–æFW‚âò6ö×ÆVÖVçF"G¶–æFW‡Ö¢"#°¢&WGW&â ¢ÆÆ&VÂ6Æ73Ò&æÇ—7BÖ6†—G¶–æFW‚ãÒò&—2Ö7F—fR"¢"'Ò#à¢Æ–çWBG—SÒ&6†V6¶&÷‚"fÇVSÒ"G¶W66TGG&–'WFR†æÇ—7B—Ò"FFÖFVÖæBÖæÇ—7BÖ÷F–öâG¶–æFW‚ãÒò&6†V6¶VB"¢"'Òóà¢Ç7ãâG¶W66TGG&–'WFR†æÇ—7B—ÒÇ6ÖÆÂFFÖFVÖæBÖæÇ—7B×&öÆSâG·&öÆWÓÂ÷6ÖÆÃãÂ÷7ãà¢ÂöÆ&VÃà¢°¢Ò’æ¦ö–â‚""—Ð¢ÂöF—cà¢Ç6Æ73Ò&×WFVB"FFÖFVÖæBÖæÇ—7B×7VÖÖ'“âG¶W66TGG&–'WFR†æÇ—7E6VÆV7F–öå7VÖÖ'’‡6VÆV7FVB’—ÓÂ÷à¢Ç6Æ73Ò&×WFVB#å6VÆV6–öæRæ÷&FVÒFW6V¦F¢ò&–ÖV—&ò6W,:òÌ:ÖFW"R÷26VwV–çFW26W,:6ò6ö×ÆVÖVçF&W2ãÂ÷à¢ÂöF—cà¢°§Ð ¦gVæ7F–öâWFFTFVÖæDæÇ—7E6VÆV7F÷"†–çWB’°¢6öç7B6VÆV7F÷"Ò–çWCòæ6Æ÷6W7B‚%¶FFÖFVÖæBÖæÇ—7B×6VÆV7F÷%Ò"“°¢6öç7B†–FFVâÒ6VÆV7F÷#òçVW'•6VÆV7F÷"‚u¶æÖSÒ&æÆ—7F56VÆV6–öæF÷2%Òr“°¢–b‚6VÆV7F÷"ÇÂ†–FFVâ’&WGW&ã°¢ÆWB6VÆV7FVBÒµÓ°¢G'’°¢6öç7B'6VBÒ¥4ôâç'6R††–FFVâçfÇVRÇÂ%µÒ"“°¢–b„'&’æ—4'&’‡'6VB’’6VÆV7FVBÒ'6VBæÖ‚†æÖR’Óâ7G&–ær†æÖRÇÂ""’çG&–Ò‚’’æf–ÇFW"„&ööÆVâ“°¢Ò6F6‚°¢6VÆV7FVBÒµÓ°¢Ð¢6öç7BæÇ—7BÒ7G&–ær†–çWBçfÇVRÇÂ""’çG&–Ò‚“°¢6VÆV7FVBÒ6VÆV7FVBæf–ÇFW"‚†æÖR’Óâæ÷&ÖÆ—¦U6V&6…FW‡B†æÖR’ÓÒæ÷&ÖÆ—¦U6V&6…FW‡B†æÇ—7B’“°¢–b†–çWBæ6†V6¶VBbbæÇ—7B’6VÆV7FVBçW6‚†æÇ—7B“°¢6VÆV7FVBÒFVÖæDæÇ—7DæÖW2‡²æÆ—7F&W7öç6fVÃ¢6VÆV7FVE³ÒÂæÆ—7F46ö×ÆVÖVçF&W3¢6VÆV7FVBç6Æ–6Rƒ’Ò“°¢†–FFVâçfÇVRÒ¥4ôâç7G&–æv–g’‡6VÆV7FVB“°¢6VÆV7F÷"çVW'•6VÆV7F÷$ÆÂ‚%¶FFÖFVÖæBÖæÇ—7BÖ÷F–öåÒ"’æf÷$V6‚‚†÷F–öâ’Óâ°¢6öç7B–æFW‚Ò6VÆV7FVBæf–æD–æFW‚‚†æÖR’Óâæ÷&ÖÆ—¦U6V&6…FW‡B†æÖR’ÓÓÒæ÷&ÖÆ—¦U6V&6…FW‡B†÷F–öâçfÇVR’“°¢÷F–öâæ6†V6¶VBÒ–æFW‚ãÒ°¢÷F–öâæ6Æ÷6W7B‚"ææÇ—7BÖ6†—"“òæ6Æ74Æ—7BçFövvÆR‚&—2Ö7F—fR"Â–æFW‚ãÒ“°¢6öç7B&öÆRÒ÷F–öâæ6Æ÷6W7B‚"ææÇ—7BÖ6†—"“òçVW'•6VÆV7F÷"‚%¶FFÖFVÖæBÖæÇ—7B×&öÆUÒ"“°¢–b‡&öÆR’&öÆRçFW‡D6öçFVçBÒ–æFW‚ÓÓÒò$Ì:ÖFW""¢–æFW‚âò6ö×ÆVÖVçF"G¶–æFW‡Ö¢"#°¢Ò“°¢6VÆV7F÷"çVW'•6VÆV7F÷"‚%¶FFÖ7F–öãÕÂ&6ÆV"ÖFVÖæBÖæÇ—7G5Â%Ò"“òæ6Æ74Æ—7BçFövvÆR‚&—2Ö7F—fR"Â6VÆV7FVBæÆVæwF‚ÓÓÒ“°¢6öç7B7VÖÖ'’Ò6VÆV7F÷"çVW'•6VÆV7F÷"‚%¶FFÖFVÖæBÖæÇ—7B×7VÖÖ'•Ò"“°¢–b‡7VÖÖ'’’7VÖÖ'’çFW‡D6öçFVçBÒæÇ—7E6VÆV7F–öå7VÖÖ'’‡6VÆV7FVB“°§Ð ¦gVæ7F–öâ6ÆV$FVÖæDæÇ—7E6VÆV7F÷"†'WGFöâ’°¢6öç7B6VÆV7F÷"Ò'WGFöãòæ6Æ÷6W7B‚%¶FFÖFVÖæBÖæÇ—7B×6VÆV7F÷%Ò"“°¢6öç7B†–FFVâÒ6VÆV7F÷#òçVW'•6VÆV7F÷"‚u¶æÖSÒ&æÆ—7F56VÆV6–öæF÷2%Òr“°¢–b‚6VÆV7F÷"ÇÂ†–FFVâ’&WGW&ã°¢†–FFVâçfÇVRÒ%µÒ#°¢6VÆV7F÷"çVW'•6VÆV7F÷$ÆÂ‚%¶FFÖFVÖæBÖæÇ—7BÖ÷F–öåÒ"’æf÷$V6‚‚†÷F–öâ’Óâ°¢÷F–öâæ6†V6¶VBÒfÇ6S°¢÷F–öâæ6Æ÷6W7B‚"ææÇ—7BÖ6†—"“òæ6Æ74Æ—7Bç&VÖ÷fR‚&—2Ö7F—fR"“°¢6öç7B&öÆRÒ÷F–öâæ6Æ÷6W7B‚"ææÇ—7BÖ6†—"“òçVW'•6VÆV7F÷"‚%¶FFÖFVÖæBÖæÇ—7B×&öÆUÒ"“°¢–b‡&öÆR’&öÆRçFW‡D6öçFVçBÒ"#°¢Ò“°¢'WGFöâæ6Æ74Æ—7BæFB‚&—2Ö7F—fR"“°¢6öç7B7VÖÖ'’Ò6VÆV7F÷"çVW'•6VÆV7F÷"‚%¶FFÖFVÖæBÖæÇ—7B×7VÖÖ'•Ò"“°¢–b‡7VÖÖ'’’7VÖÖ'’çFW‡D6öçFVçBÒæÇ—7E6VÆV7F–öå7VÖÖ'’…µÒ“°§Ð ¦gVæ7F–öâ&VæFW$FVÖæE&ö¦V7G56VÆV7F÷"‡6VÆV7FVBÒµÒÂ6fVDFWF–Ç2Ò·Ò’°¢6öç7B6VÆV7FVD–G2ÒæWr6WB†'&”÷$fÆÆ&6²‡6VÆV7FVB’æÖ‚†–B’Óâ7G&–ær†–BÇÂ""’çG&–Ò‚’çFõWW$66R‚’’æf–ÇFW"„&ööÆVâ’“°¢6öç7BFWF–Ç2Òæ÷&ÖÆ—¦TFVÖæE&ö¦V7DFWF–Ç2‡6fVDFWF–Ç2“°¢&WGW&â ¢ÆF—b6Æ73Ò&FVÖæB×&ö¦V7B×6VÆV7F÷"#à¢G¶FVÖæE&ö¦V7D÷F–öç2‚’æÖ‚‡&ö¦V7B’Óâ°¢6öç7BFWF–ÂÒFWF–Ç5·&ö¦V7Bæ–EÒÇÂ·Ó°¢&WGW&â ¢ÆFWF–Ç26Æ73Ò&FVÖæB×&ö¦V7BÖ—FVÒG·6VÆV7FVD–G2æ†2‡&ö¦V7Bæ–B’ò&—2Ö7F—fR"¢"'Ò"FFÖFVÖæB×&ö¦V7CÒ"G·&ö¦V7Bæ–GÒ#à¢Ç7VÖÖ'’F—FÆSÒ"G¶W66TGG&–'WFR‡&ö¦V7BæÆ&VÂ—Ò#âG·&ö¦V7Bæ–GÓÂ÷7VÖÖ'“à¢ÆF—b6Æ73Ò&FVÖæB×&ö¦V7B×÷7F–ærÖ&÷‚#à¢ÆÆ&VÂ6Æ73Ò&FVÖæB×&ö¦V7BÖ–æ6ÇW6–öâ#à¢Æ–çWBG—SÒ&6†V6¶&÷‚"æÖSÒ'&ö¦WF÷4VçföÇf–F÷2"fÇVSÒ"G·&ö¦V7Bæ–GÒ"G·6VÆV7FVD–G2æ†2‡&ö¦V7Bæ–B’ò&6†V6¶VB"¢"'Òóà¢Ç7ãä–æ6ÇV—"æFVÖæFÂ÷7ãà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãå&W7öç<:fVÂVÆ÷7FvVÓÂ÷7ãà¢Æ–çWBFF×&ö¦V7B×÷7F–ærÖ÷væW"fÇVSÒ"G¶W66TGG&–'WFR†FWF–Âç&W7öç6fVÅ÷7FvVÒÇÂ""—Ò"Æ6V†öÆFW#Ò$æöÖRFò&W7öç<:fVÂ"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäFFFR÷7FvVÓÂ÷7ãà¢Æ–çWBFF×&ö¦V7B×÷7F–ærÖFFRG—SÒ&FFR"fÇVSÒ"G¶W66TGG&–'WFR†FWF–ÂæFF÷7FvVÒÇÂ""—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäÆö6ÂFò'V—fóÂ÷7ãà¢Æ–çWBFF×&ö¦V7BÖf–ÆRÖÆö6F–öâfÇVSÒ"G¶W66TGG&–'WFR†FWF–ÂæÆö6Ä'V—fòÇÂ""—Ò"Æ6V†öÆFW#Ò%7FÂÆ–æ²÷R6Ö–æ†òFò'V—fò"óà¢ÂöÆ&VÃà¢ÂöF—cà¢ÂöFWF–Ç3à¢²Ò’æ¦ö–â‚""—Ð¢ÂöF—cà¢Ç6Æ73Ò&×WFVB#ä6Æ—VRæ6–vÆ&–æf÷&Ö"÷2FF÷2FR÷7FvVÒR–æ6ÇV—"F—66—Æ–ææFVÖæFãÂ÷à¢°§Ð ¦gVæ7F–öâ&VDFVÖæE&ö¦V7G4g&öÔf÷&Ò†f÷&Ò’°¢6öç7B6VÆV7FVBÒµÓ°¢6öç7BFWF–Ç2Ò·Ó°¢f÷&ÒçVW'•6VÆV7F÷$ÆÂ‚%¶FFÖFVÖæB×&ö¦V7EÒ"’æf÷$V6‚‚†6&B’Óâ°¢6öç7B6†V6¶&÷‚Ò6&BçVW'•6VÆV7F÷"‚u¶æÖSÒ'&ö¦WF÷4VçföÇf–F÷2%Òr“°¢–b‚6†V6¶&÷ƒòæ6†V6¶VB’&WGW&ã°¢6öç7B&ö¦V7D–BÒ7G&–ær†6†V6¶&÷‚çfÇVRÇÂ""’çG&–Ò‚’çFõWW$66R‚“°¢–b‚&ö¦V7D–B’&WGW&ã°¢6VÆV7FVBçW6‚‡&ö¦V7D–B“°¢FWF–Ç5·&ö¦V7D–EÒÒ°¢&W7öç6fVÅ÷7FvVÓ¢7G&–ær†6&BçVW'•6VÆV7F÷"‚%¶FF×&ö¦V7B×÷7F–ærÖ÷væW%Ò"“òçfÇVRÇÂ""’çG&–Ò‚’À¢FF÷7FvVÓ¢7G&–ær†6&BçVW'•6VÆV7F÷"‚%¶FF×&ö¦V7B×÷7F–ærÖFFUÒ"“òçfÇVRÇÂ""’çG&–Ò‚’À¢Æö6Ä'V—fó¢7G&–ær†6&BçVW'•6VÆV7F÷"‚%¶FF×&ö¦V7BÖf–ÆRÖÆö6F–öåÒ"“òçfÇVRÇÂ""’çG&–Ò‚’À¢Ó°¢Ò“°¢&WGW&â²6VÆV7FVBÂFWF–Ç2Ó°§Ð ¦gVæ7F–öâFVÖæEG—T÷F–öç2‡6VÆV7FVBÂ–æ6ÇVFU6–2ÒG'VR’°¢6öç7BG—W2Ò–æ6ÇVFU6–2ò²$VÖ—76ô–æ–6–Â"Â%&VVÖ—76ô6ö×ÆWF"Â$FVÖæFW‡G&"Â%4”2%Ò¢²$VÖ—76ô–æ–6–Â"Â%&VVÖ—76ô6ö×ÆWF"Â$FVÖæFW‡G&%Ó°¢&WGW&âG—W0¢æÖ‚‡G—R’ÓâÆ÷F–öâfÇVSÒ"G·G—WÒ"G¶FVÖæEG—T¶W’‡6VÆV7FVB’ÓÓÒG—Rò'6VÆV7FVB"¢"'ÓâG¶FVÖæEG—TÆ&VÂ‡G—R—ÓÂö÷F–öãæ¢æ¦ö–â‚""“°§Ð ¦gVæ7F–öâ7&–çD÷F–öç2‡6VÆV7FVB’°¢6öç7B6VÆV7FVD–G2ÒæWr6WB‚„'&’æ—4'&’‡6VÆV7FVB’ò6VÆV7FVB¢6VÆV7FVBò·6VÆV7FVEÒ¢µÒ’æÖ‚†–B’Óâ7G&–ær†–B’’“°¢&WGW&â¶Æ÷F–öâfÇVSÒ""G·6VÆV7FVD–G2ç6—¦Rò""¢'6VÆV7FVB'Óå6VÒ7&–çCÂö÷F–öãæÐ¢æ6öæ6B‚‡7FFRç7&–çG2ÇÂµÒ’æÖ‚‡7&–çB’ÓâÆ÷F–öâfÇVSÒ"G·7&–çBæ–GÒ"G·6VÆV7FVD–G2æ†2…7G&–ær‡7&–çBæ–B’’ò'6VÆV7FVB"¢"'ÓâG·7&–çBææöÖWÓÂö÷F–öãæ’¢æ¦ö–â‚""“°§Ð¦gVæ7F–öâ7&–çD6†V6¶&÷†W2‡6VÆV7FVB’°¢6öç7B6VÆV7FVD–G2ÒæWr6WB†FVÖæE7&–çD–G2‡²7&–çD–G3¢'&’æ—4'&’‡6VÆV7FVB’ò6VÆV7FVB¢6VÆV7FVBò·6VÆV7FVEÒ¢µÒÒ’“°¢6öç7BÆ&VÂÒ²ââç6VÆV7FVD–G5ÒæÖ‚†–B’Óâ7&–çD'”–B†–B“òææöÖRÇÂ–B’æ¦ö–â‚"Â"’ÇÂ%6VÆV6–öæ"7&–çG2#°¢&WGW&âÆFWF–Ç26Æ73Ò'7&–çB×–6¶W"#ãÇ7VÖÖ'’6Æ73Ò'7&–çB×–6¶W"×7VÖÖ'’#ãÇ7â6Æ73Ò'7&–çB×–6¶W"×fÇVR#âG¶W66TGG&–'WFR†Æ&VÂ—ÓÂ÷7ããÇ7â6Æ73Ò'7&–çB×–6¶W"Ö6÷VçB#âG·6VÆV7FVD–G2ç6—¦Rò6VÆV7FVD–G2ç6—¦R²"6VÆV6–öæF‡2’"¢$æVæ‡VÖ6VÆV6–öæF'ÓÂ÷7ããÂ÷7VÖÖ'“à¢ÆF—b6Æ73Ò'7&–çBÖ6†V6¶&÷‚ÖÆ—7B"&öÆSÒ&w&÷W"&–ÖÆ&VÃÒ%7&–çG2#âG²‡7FFRç7&–çG2ÇÂµÒ’æÖ‚‡7&–çB’Óâ ¢ÆÆ&VÂ6Æ73Ò'7&–çBÖ6†V6¶&÷‚Ö÷F–öâ#ãÆ–çWBG—SÒ&6†V6¶&÷‚"æÖSÒ'7&–çD–B"fÇVSÒ"G¶W66TGG&–'WFR‡7&–çBæ–B—Ò"G·6VÆV7FVD–G2æ†2…7G&–ær‡7&–çBæ–B’’ò&6†V6¶VB"¢"'Òóà¢Ç7ãâG¶W66TGG&–'WFR‡7&–çBææöÖR—ÒÇ6ÖÆÃâG¶FFUFW‡B‡7&–çBæFF–æ–6–ò—Ò(i"G¶FFUFW‡B‡7&–çBæFFf–Ò—ÓÂ÷6ÖÆÃãÂ÷7ãà¢ÂöÆ&VÃæ’æ¦ö–â‚""’ÇÂsÇ7â6Æ73Ò&×WFVB#äæVæ‡VÖ7&–çB6F7G&FãÂ÷7ãâwÓÂöF—cãÂöFWF–Ç3æ°§Ð ¦gVæ7F–öâ6äGfæ6U6–5FôF—&V7F÷$&÷fÂ‚’°¢&WGW&â²$FÖ–â"Â$vW7F÷"%Òæ–æ6ÇVFW2†7F—fU&öÆR‚’’bbvÆö&ÅF†—2å4ÅEô4ÄõTBæ6åw&—FR‚'v÷&·2"“°§Ð ¦gVæ7F–öâ6äF—&V7FÇ”&÷fU6–4g&öÕfÆ–FFVB‚’°¢6öç7B†5v÷&·5w&—FUW&Ö—76–öâÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6åw&—FUW&Ö—76–öãòâ‚'v÷&·2"¢óòvÆö&ÅF†—2å4ÅEô4ÄõTBæ6åw&—FR‚'v÷&·2"“°¢&WGW&â²$FÖ–â"Â$vW7F÷"%Òæ–æ6ÇVFW2†7F—fU&öÆR‚’’bb†5v÷&·5w&—FUW&Ö—76–öã°§Ð ¦gVæ7F–öâ6–4F—&V7F÷%v—fW$FF†FVÖæB’°¢6öç7Bv—fW"ÒFVÖæCòç6–4F—&V7F÷%v—fW#°¢–b‚v—fW"ÇÂ³Â%Òæ–æ6ÇVFW2„çVÖ&W"‡v—fW"çfW'6–öâ’’’&WGW&âçVÆÃ°¢–b„çVÖ&W"‡v—fW"çfW'6–öâ’ÓÓÒbb7G&–ær‡v—fW"ç&V6öâÇÂ""’çG&–Ò‚’æÆVæwF‚Â’&WGW&âçVÆÃ°¢–b„çVÖ&W"‡v—fW"çfW'6–öâ’ÓÓÒ"’°¢6öç7B6öæf—&ÖVDÖ÷VçBÒçVÖ&W"‡v—fW"æ6öæf—&ÖVDÖ÷VçB“°¢–b‡v—fW"ç&WV—&VBÓÒfÇ6RÇÂv—fW"ç6÷W&6U†6RÓÒ'fÆ–FFôö'&2"’&WGW&âçVÆÃ°¢–b‚çVÖ&W"æ—4f–æ—FR†6öæf—&ÖVDÖ÷VçB’’&WGW&âçVÆÃ°¢–b‚FVÖæD†5&V6÷&FVEfÇVR†FVÖæB’ÇÂÖF‚æ'2„çVÖ&W"†FVÖæBçfÆ÷$vW&Fò’Ò6öæf—&ÖVDÖ÷VçB’ãÒã’&WGW&âçVÆÃ°¢Ð¢–b‚7G&–ær‡v—fW"çv—fVDBÇÂ""’çG&–Ò‚’ÇÂ7G&–ær‡v—fW"çv—fVD'’ÇÂ""’çG&–Ò‚’ÇÂ7G&–ær‡v—fW"çv—fVD'”–BÇÂ""’çG&–Ò‚’’&WGW&âçVÆÃ°¢&WGW&âv—fW#°§Ð ¦gVæ7F–öâ6–4F—&V7D6ö×ÆWF–öäFF†FVÖæB’°¢6öç7Bv—fW"Ò6–4F—&V7F÷%v—fW$FF†FVÖæB“°¢&WGW&âçVÖ&W"‡v—fW#òçfW'6–öâ’ÓÓÒ"òv—fW"¢çVÆÃ°§Ð ¦gVæ7F–öâ6åv—fU6–4F—&V7F÷$&÷fÂ‚’°¢&WGW&â²$FÖ–â"Â$vW7F÷"%Òæ–æ6ÇVFW2†7F—fU&öÆR‚’’bbvÆö&ÅF†—2å4ÅEô4ÄõTBæ6åw&—FR‚'v÷&·2"“°§Ð ¦gVæ7F–öâ6öÇVÖç4f÷$FVÖæB†FVÖæB’°¢6öç7B—56–4FVÖæBÒFVÖæEG—T¶W’†FVÖæCòçF—ò’ÓÓÒ%4”2#°¢&WGW&â6öÇVÖç2æÖ‚†6öÇVÖâ’Óâ°¢ÆWBF—6&ÆVBÒ²&&÷f6ôF—&WF÷&–"Â&&÷fFôF—&WF÷&–%Òæ–æ6ÇVFW2†6öÇVÖâæ–B’bb—56–4FVÖæC° ¢–b†—56–4FVÖæBbb6öÇVÖâæ–BÓÓÒ&&÷fFôF—&WF÷&–"bbFVÖæCòæ6öÇVæÓÒ&&÷fFôF—&WF÷&–"’°¢F—6&ÆVBÒFVÖæCòæ6öÇVæÓÒ&&÷f6ôF—&WF÷&– ¢bb†FVÖæCòæ6öÇVæÓÓÒ'fÆ–FFôö'&2"bb6äF—&V7FÇ”&÷fU6–4g&öÕfÆ–FFVB‚’“°¢Ð ¢&WGW&â²ââæ6öÇVÖâÂF—6&ÆVBÓ°¢Ò“°§Ð ¦gVæ7F–öâ6öÇVÖä÷F–öç2†FVÖæB’°¢&WGW&â6öÇVÖç4f÷$FVÖæB†FVÖæB¢æÖ‚†6öÇVÖâ’ÓâÆ÷F–öâfÇVSÒ"G¶6öÇVÖâæ–GÒ"G¶6öÇVÖâæ–BÓÓÒFVÖæBæ6öÇVæò'6VÆV7FVB"¢"'ÒG¶6öÇVÖâæF—6&ÆVBò&F—6&ÆVB"¢"'ÓâG¶6öÇVÖâæÆ&VÇÓÂö÷F–öãæ¢æ¦ö–â‚""“°§Ð ¦gVæ7F–öâFVÖæE7FGW5&V6öâ†FVÖæBÂ6öÇVÖä–BÒFVÖæCòæ6öÇVæ’°¢–b†6öÇVÖä–BÓÓÒ'W6Fò"’&WGW&â7G&–ær†FVÖæCòæÖ÷F—fõW6ÇÂ""’çG&–Ò‚“°¢–b†6öÇVÖä–BÓÓÒ&6æ6VÆFò"’&WGW&â7G&–ær†FVÖæCòæÖ÷F—fô6æ6VÆÖVçFòÇÂ""’çG&–Ò‚“°¢&WGW&â"#°§Ð ¦gVæ7F–öâFVÖæE7FGW5&V6öäÆ&VÂ†6öÇVÖä–B’°¢&WGW&â6öÇVÖä–BÓÓÒ&6æ6VÆFò"ò$Ö÷F—fòFò6æ6VÆÖVçFò¢"¢$Ö÷F—fòFW6¢#°§Ð ¦gVæ7F–öâ&–÷&—G”÷F–öç2‡6VÆV7FVB’°¢&WGW&â²$ÇF"Â$Ü:–F–"Â$&—†%Ð¢æÖ‚‡&–÷&—G’’ÓâÆ÷F–öâfÇVSÒ"G·&–÷&—G—Ò"G·&–÷&—G’ÓÓÒ6VÆV7FVBò'6VÆV7FVB"¢"'ÓâG·&–÷&—G—ÓÂö÷F–öãæ¢æ¦ö–â‚""“°§Ð ¦gVæ7F–öâFFTf–VÆB†Æ&VÂÂæÖRÂfÇVRÂv–FRÒfÇ6R’°¢&WGW&â ¢ÆÆ&VÂ6Æ73Ò&f–VÆBG·v–FRò&gVÆÂ×7â"¢"'Ò#à¢Ç7ãâG¶Æ&VÇÓÂ÷7ãà¢Æ–çWBæÖSÒ"G¶æÖWÒ"G—SÒ&FFR"fÇVSÒ"G·fÇVRÇÂ"'Ò"óà¢ÂöÆ&VÃà¢°§Ð ¦gVæ7F–öâ&VæFW$FVÖæE&ö¦V7G2†FVÖæB’°¢6öç7BVçG&–W2ÒµÓ°¢ö&¦V7BæVçG&–W2†FVÖæBç&ö¦WF÷2ÇÂ·Ò’æf÷$V6‚‚…¶F—66—Æ–æRÂ7FGW5Ò’Óâ°¢VçG&–W2çW6‚†G¶F—66—Æ–æWÓ¢G¶f÷&ÖDÖ7FW%7FGW2‡7FGW2—Ö“°¢Ò“°¢†FVÖæBç&ö¦WF÷47W7FöÒÇÂµÒ’æf÷$V6‚‚†—FVÒ’Óâ°¢6öç7BæÖRÒ—FVÒææöÖRÇÂ—FVÒæF—66—Æ–æÇÂ%&ö¦WFò6ö×ÆVÖVçF"#°¢VçG&–W2çW6‚†G¶æÖWÓ¢G¶f÷&ÖDÖ7FW%7FGW2†—FVÒç7FGW2ÇÂ—FVÒæ6Ö–æ†òÇÂ—FVÒ—Ö“°¢Ò“°¢&WGW&â ¢G·&VæFW$FVÖæE&ö¦V7G56VÆV7F÷"†FVÖæBç&ö¦WF÷4VçföÇf–F÷2ÂFVÖæBç&ö¦WF÷4VçföÇf–F÷4FWFÆ†W2—Ð¢G¶VçG&–W2æÆVæwF‚òÆF—b6Æ73Ò&Ö7FW"ÖÆ—7B#âG¶VçG&–W2ç6Æ–6RƒÂ"’æÖ‚†—FVÒ’ÓâÇ7â6Æ73Ò'Fr#âG¶—FV×ÓÂ÷7ãæ’æ¦ö–â‚""—ÓÂöF—cæ¢"'Ð¢°§Ð ¦gVæ7F–öâ&VæFW$FVÖæD†—7F÷'’††—7F÷&–W2’°¢–b‚†—7F÷&–W2æÆVæwF‚’&WGW&âÆF—b6Æ73Ò&V×G’×7FFR#å6VÒ†—7L;7&–6ò&Vv—7G&Fò&W7FFVÖæFãÂöF—cæ°¢&WGW&â ¢ÆF—b6Æ73Ò'F–ÖVÆ–æRÖÆ—7B#à¢G¶†—7F÷&–W0¢ç6Æ–6RƒÂ‚¢æÖ€¢†—FVÒ’Óâ ¢Æ'F–6ÆSà¢Ç7G&öæsâG¶—FVÒæ6×÷ÓÂ÷7G&öæsà¢Ç7ãâG¶—FVÒçfÆ÷$çFW&–÷'Ò(i"G¶—FVÒçfÆ÷$æ÷f÷ÓÂ÷7ãà¢Ç6ÖÆÃâG¶æWrFFR†—FVÒçF–ÖW7F×’çFôÆö6ÆU7G&–ær‚'BÔ%""—ÓÂ÷6ÖÆÃà¢Âö'F–6ÆSà¢ ¢¢æ¦ö–â‚""—Ð¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ÷Vå7&–çDÖöFÂ‡7&–çD–BÒ""’°¢6öç7B7&–çBÒ‡7FFRç7&–çG2ÇÂµÒ’æf–æB‚†—FVÒ’Óâ7G&–ær†—FVÒæ–B’ÓÓÒ7G&–ær‡7&–çD–B’’ÇÂçVÆÃ°¢6öç7B—4VF—F–ærÒ&ööÆVâ‡7&–çB“°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&B"–CÒ'7&–çDf÷&Ò"&–ÖÆ&VÆÆVF'“Ò'7&–çEF—FÆR#à¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'7&–çD–B"fÇVSÒ"G¶W66TGG&–'WFR‡7&–çCòæ–BÇÂ""—Ò"óà¢Æ†VFW#à¢Æƒ"–CÒ'7&–çEF—FÆR#âG¶—4VF—F–ærò$VF—F"7&–çBvÆö&Â"¢$æ÷f7&–çBvÆö&Â'ÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#âG¶—4VF—F–ærò$GVÆ—¦RæöÖRÂW,:ÖöFò÷R7FGW26VÒW&FW"÷2l:Öæ7VÆ÷2W†—7FVçFW2â"¢%W6RW,:ÖöF÷2V–ç¦Væ—2&÷&væ—¦"2W7FV—&2÷W&6–öæ—2FRFöF÷2÷2Ü;6GVÆ÷2â'ÓÂ÷à¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷""FFÖf÷&ÒÖW'&÷#ãÂöF—cà¢ÆF—b6Æ73Ò&f÷&ÒÖw&–B#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäæöÖRF7&–çCÂ÷7ãà¢Æ–çWBæÖSÒ&æöÖR"&WV—&VBÆ6V†öÆFW#Ò%7&–çBB"fÇVSÒ"G¶W66TGG&–'WFR‡7&–çCòææöÖRÇÂ""—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãå7FGW3Â÷7ãà¢Ç6VÆV7BæÖSÒ'7FGW2#à¢Æ÷F–öâfÇVSÒ$F—f"G·7&–çCòç7FGW2ÓÓÒ$F—f"ò'6VÆV7FVB"¢"'ÓäF—fÂö÷F–öãà¢Æ÷F–öâfÇVSÒ%ÆæV¦F"G²7&–çBÇÂ7&–çCòç7FGW2ÓÓÒ%ÆæV¦F"ò'6VÆV7FVB"¢"'ÓåÆæV¦FÂö÷F–öãà¢Æ÷F–öâfÇVSÒ$Væ6W'&F"G·7&–çCòç7FGW2ÓÓÒ$Væ6W'&F"ò'6VÆV7FVB"¢"'ÓäVæ6W'&FÂö÷F–öãà¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäFF–ì:Ö6–óÂ÷7ãà¢Æ–çWBæÖSÒ&FF–æ–6–ò"G—SÒ&FFR"&WV—&VBfÇVSÒ"G¶W66TGG&–'WFR‡7&–çCòæFF–æ–6–òÇÂ""—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäFFf–ÓÂ÷7ãà¢Æ–çWBæÖSÒ&FFf–Ò"G—SÒ&FFR"&WV—&VBfÇVSÒ"G¶W66TGG&–'WFR‡7&–çCòæFFf–ÒÇÂ""—Ò"óà¢ÂöÆ&VÃà¢ÂöF—cà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#âG¶—4VF—F–ærò%6Çf"ÇFW&:|;VW2"¢$6F7G&"7&–çBvÆö&Â'ÓÂö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ÷Våv÷&´ÖöFÂ‡v÷&´–BÒ""Â²†—7F÷&–6Å&V6÷&D–BÒ""ÒÒ·Ò’°¢6öç7Bv÷&²Ò7FFRçv÷&·2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒv÷&´–B’ÇÂçVÆÃ°¢6öç7B†—7F÷&–6Å&V6÷&BÒ†—7F÷&–6Å&V6÷&D–Bò'&”÷$fÆÆ&6²‡7FFRæWg2’æf–æB‚‡&V6÷&B’Óâ&V6÷&Bæ–BÓÓÒ†—7F÷&–6Å&V6÷&D–B’¢çVÆÃ°¢6öç7B†—7F÷&–6ÅVbÒ7G&–ær††—7F÷&–6Å&V6÷&CòçVbÇÂVdg&öÕv÷&´æÖR††—7F÷&–6Å&V6÷&Còç&ö¦V7B’ÇÂ""’çG&–Ò‚’çFõWW$66R‚“°¢6öç7B†—7F÷&–6ÄG&gBÒ†—7F÷&–6Å&V6÷&Bò°¢6÷W&6T†—7F÷&–6Å&V6÷&D–C¢†—7F÷&–6Å&V6÷&Bæ–BÀ¢6†fUVæ–6¢†—7F÷&–6Å&V6÷&Bæ6öFRbb†—7F÷&–6Å&V6÷&Bæ6öFRÓÒ#"ò†—7F÷&–6Å&V6÷&Bæ6öFR¢†—7F÷&–6Å&V6÷&Bæ–BÀ¢6öF–vô÷&–v–æÃ¢†—7F÷&–6Å&V6÷&Bæ6öFRÇÂ#"À¢æöÖS¢†—7F÷&–6Å&V6÷&Bç&ö¦V7BÇÂ""À¢F—õVæ–FFS¢†—7F÷&–6Å&V6÷&BçG—öÆöw’ÇÂ$ì:6ò–æf÷&ÖF"À¢6–FFS¢""À¢Vc¢†—7F÷&–6ÅVbÀ¢&Vv–ó¢†—7F÷&–6Å&V6÷&Bç&Vv–öâÇÂ&Vv–öäg&öÕVb††—7F÷&–6ÅVb’ÇÂ""À¢6Æ76–f–66ôö'&¢""À¢F—öÆöv–ö'&¢6æöæ–6Åv÷&µG—öÆöw’††—7F÷&–6Å&V6÷&BçG—öÆöw’’À¢&V6öç7G'V–F¢çVÖ&W"††—7F÷&–6Å&V6÷&Bæ&VÇÂ’À¢&VWV—fÆVçFS¢çVÖ&W"††—7F÷&–6Å&V6÷&Bæ&VÇÂ’À¢F—õfW&&¢$4U‚"À¢fÆ÷%fW&&÷'FF¢çVÖ&W"††—7F÷&–6Å&V6÷&BçF÷FÂÇÂ’À¢fÆ÷$W7F–ÖFó¢çVÖ&W"††—7F÷&–6Å&V6÷&BçF÷FÂÇÂ’À¢æôö'&¢7G&–ær††—7F÷&–6Å&V6÷&Bç–V"ÇÂ""’ç6Æ–6RƒÂB’À¢Ò¢çVÆÃ°¢6öç7B—4VF—F–ærÒ&ööÆVâ‡v÷&²ÇÂ†—7F÷&–6Å&V6÷&B“°¢6öç7BG&gBÒv÷&²òçVÆÂ¢†—7F÷&–6ÄG&gBÇÂv÷&´ÖöFÅÆäG&gC°¢6öç7Bf–VÆEfÇVRÒ†f–VÆBÂfÆÆ&6²Ò""’ÓâW66TGG&–'WFR‡v÷&³òå¶f–VÆEÒóòG&gCòå¶f–VÆEÒóòfÆÆ&6²óò""“°¢6öç7B7W'&Væ7”f–VÆEfÇVRÒ‡fÇVR’ÓâW66TGG&–'WFR†7W'&Væ7”–çWEfÇVR‡fÇVR’“°¢6öç7B&uF—õfW&&fÇVRÒ7G&–ær‡v÷&³òçF—õfW&&óòv÷&³òæ÷&–vVÕfW&&óòG&gCòçF—õfW&&óòG&gCòæ÷&–vVÕfW&&óò""’çG&–Ò‚’çFõWW$66R‚“°¢6öç7BF—õfW&&fÇVRÒ²$4U‚"Â$õU‚%Òæ–æ6ÇVFW2‡&uF—õfW&&fÇVR’ò&uF—õfW&&fÇVR¢"#°¢6öç7BfW&&÷'FFfÇVRÒv÷&³òçfÆ÷%fW&&÷'FFóòv÷&³òçÆææVEfÇVRóòv÷&³òçfÆ÷$&÷fFòóòv÷&³òæ6W„&÷fFòóòG&gCòçfÆ÷%fW&&÷'FFóòG&gCòçÆææVEfÇVRóòG&gCòçfÆ÷$&÷fFòóòG&gCòæ6W„&÷fFòóò°¢6öç7BfÆ÷$W7F–ÖFõfÇVRÒv÷&³òçfÆ÷$W7F–ÖFòóòG&gCòçfÆ÷$W7F–ÖFòóò°¢6öç7BÖWF7W7FôÓ%F&vWD–EfÇVRÒv÷&³òæÖWF7W7FôÓ%F&vWD–BóòG&gCòæÖWF7W7FôÓ%F&vWD–Bóò"#°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&Bv÷&²ÖÖöFÂÖ6&B"–CÒ'v÷&´f÷&Ò"&–ÖÆ&VÆÆVF'“Ò'v÷&µF—FÆR#à¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'v÷&´–B"fÇVSÒ"G¶f–VÆEfÇVR‚&–B"—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'6÷W&6T†—7F÷&–6Å&V6÷&D–B"fÇVSÒ"G¶f–VÆEfÇVR‚'6÷W&6T†—7F÷&–6Å&V6÷&D–B"—Ò"óà¢Æ†VFW#à¢ÆF—cà¢Æƒ"–CÒ'v÷&µF—FÆR#âG¶—4VF—F–ærò$VF—F"ö'&"¢$æ÷fö'&'ÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#âG¶†—7F÷&–6Å&V6÷&Bò$6ö×ÆWFR÷2FF÷26F7G&—2FW7Fö'&†—7L;7&–6²òUbW†—7FVçFR6W,:&W6W'fFòRf–æ7VÆFò6VÒGWÆ–6–FFRâ"¢—4VF—F–ærò$GVÆ—¦R÷2FF÷26F7G&—2Fò÷'Fl;6Æ–ò6VÒW&FW"òUbf–æ7VÆFòâ"¢$6F7G&Rö'&æò÷'Fl;6Æ–òâVÆW&ÖæV6W,:6VÒUbL:’ò&–ÖV—&ò&VVæ6†–ÖVçFòFòW7GVFòâ'ÓÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢ÆF—b6Æ73Ò&f÷&ÒÖw&–B#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäæöÖRFö'&£Â÷7ãà¢Æ–çWBæÖSÒ&æöÖR"&WV—&VBÆ6V†öÆFW#Ò$W‚ã¢æ÷f6Ì:Öæ–66V6–"fÇVSÒ"G¶f–VÆEfÇVR‚&æöÖR"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãä6†fR;¦æ–6Â÷7ãà¢Æ–çWBæÖSÒ&6†fUVæ–6"Æ6V†öÆFW#Ò$vW&FWFöÖF–6ÖVçFR6Rf–6"VÒ'&æ6ò"fÇVSÒ"G¶f–VÆEfÇVR‚&6†fUVæ–6"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãä<;6Bâ÷&–rãÂ÷7ãà¢Æ–çWBæÖSÒ&6öF–vô÷&–v–æÂ"Æ6V†öÆFW#Ò$W‚ã¢““"fÇVSÒ"G¶f–VÆEfÇVR‚&6öF–vô÷&–v–æÂ"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåF—òFRVæ–FFR£Â÷7ãà¢Æ–çWBæÖSÒ'F—õVæ–FFR"Æ—7CÒ'F—õVæ–FFT÷F–öç2"&WV—&VBÆ6V†öÆFW#Ò$†÷7—FÂÂ6Ì:Öæ–6ÂDTâââ"fÇVSÒ"G¶f–VÆEfÇVR‚'F—õVæ–FFR"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãä6–FFR£Â÷7ãà¢Æ–çWBæÖSÒ&6–FFR"&WV—&VBÆ6V†öÆFW#Ò$W‚ã¢f÷'FÆW¦"fÇVSÒ"G¶f–VÆEfÇVR‚&6–FFR"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåTb£Â÷7ãà¢Æ–çWBæÖSÒ'Vb"Æ—7CÒ'Vd÷F–öç2"&WV—&VBÖ†ÆVæwFƒÒ#""Æ6V†öÆFW#Ò$4R"fÇVSÒ"G¶f–VÆEfÇVR‚'Vb"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãå&Vvœ:6ò£Â÷7ãà¢Æ–çWBæÖSÒ'&Vv–ò"Æ—7CÒ'&Vv–ô÷F–öç2"&WV—&VBÆ6V†öÆFW#Ò$æ÷&FW7FR"fÇVSÒ"G¶f–VÆEfÇVR‚'&Vv–ò"Â&Vv–öäg&öÕVb‡v÷&³òçVbÇÂG&gCòçVb’—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãå&¦ò†F–2“Â÷7ãà¢Æ–çWBæÖSÒ'&¦ôF–2"–çWFÖöFSÒ&çVÖW&–2"Æ6V†öÆFW#Ò#“"fÇVSÒ"G¶f–VÆEfÇVR‚'&¦ôF–2"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäæòFö'&Â÷7ãà¢Æ–çWBæÖSÒ&æôö'&"Æ—7CÒ&æôö'&÷F–öç2"–çWFÖöFSÒ&çVÖW&–2"Ö†ÆVæwFƒÒ#B"Æ6V†öÆFW#Ò###b"fÇVSÒ"G¶f–VÆEfÇVR‚&æôö'&"Â—4VF—F–ærò""¢7G&–ær†æWrFFR‚’ævWDgVÆÅ–V"‚’’—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãä6Æ76–f–6:|:6óÂ÷7ãà¢Æ–çWBæÖSÒ&6Æ76–f–66ôö'&"Æ—7CÒ&6Æ76–f–66ô÷F–öç2"Æ6V†öÆFW#Ò%7Vf–6œ:¦æ6–FR&VFR"fÇVSÒ"G¶f–VÆEfÇVR‚&6Æ76–f–66ôö'&"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåF—öÆöv–Â÷7ãà¢Ç6VÆV7BæÖSÒ'F—öÆöv–ö'&#à¢Æ÷F–öâfÇVSÒ"#å6VÆV6–öæSÂö÷F–öãà¢G·v÷&µG—öÆöw”÷F–öç2æÖ‚†÷F–öâ’ÓâÆ÷F–öâfÇVSÒ"G¶W66TGG&–'WFR†÷F–öâ—Ò"G¶÷F–öâÓÓÒ‡v÷&³òçF—öÆöv–ö'&ÇÂG&gCòçF—öÆöv–ö'&ÇÂ""’ò'6VÆV7FVB"¢"'ÓâG¶W66TGG&–'WFR†÷F–öâ—ÓÂö÷F–öãæ’æ¦ö–â‚""—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆBgVÆÂ×7â#à¢Ç7ãäÖWFFR7W7Fò÷"Ü+#Â÷7ãà¢Ç6VÆV7BæÖSÒ&ÖWF7W7FôÓ%F&vWD–B#à¢G·7G&FVv–46÷7EF&vWD÷F–öç2†ÖWF7W7FôÓ%F&vWD–EfÇVR—Ð¢Â÷6VÆV7Cà¢Ç6ÖÆÃåW6R&&V6Æ76–f–6"ö'&VæFò&Vw&WFöÜ:F–6ì:6ò&W&W6VçF"6÷'&WFÖVçFRF—öÆöv–W†V7WF—fãÂ÷6ÖÆÃà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãì8&VWV—fÆVçFR†Ü+"“Â÷7ãà¢Æ–çWBæÖSÒ&&VWV—fÆVçFR"–çWFÖöFSÒ&FV6–ÖÂ"Æ6V†öÆFW#Ò#Ã"fÇVSÒ"G¶f–VÆEfÇVR‚&&VWV—fÆVçFR"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãì8&V6öç7G'\:ÖF†Ü+"“Â÷7ãà¢Æ–çWBæÖSÒ&&V6öç7G'V–F"–çWFÖöFSÒ&FV6–ÖÂ"Æ6V†öÆFW#Ò#Ã"fÇVSÒ"G¶f–VÆEfÇVR‚&&V6öç7G'V–F"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãä÷&–vVÒFfW&&Â÷7ãà¢Ç6VÆV7BæÖSÒ'F—õfW&&#à¢Æ÷F–öâfÇVSÒ""G·F—õfW&&fÇVRò""¢'6VÆV7FVB'Óäì:6ò–æf÷&ÖFÂö÷F–öãà¢Æ÷F–öâfÇVSÒ$4U‚"G·F—õfW&&fÇVRÓÓÒ$4U‚"ò'6VÆV7FVB"¢"'Óä4UƒÂö÷F–öãà¢Æ÷F–öâfÇVSÒ$õU‚"G·F—õfW&&fÇVRÓÓÒ$õU‚"ò'6VÆV7FVB"¢"'ÓäõUƒÂö÷F–öãà¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãå4òô“Â÷7ãà¢Æ–çWBæÖSÒ&÷&FVÔ–çFW&æ4"Æ6V†öÆFW#Ò$ì;¦ÖW&òF÷&FVÒ–çFW&æ"fÇVSÒ"G¶f–VÆEfÇVR‚&÷&FVÔ–çFW&æ4"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåfÆ÷"FfW&&÷'FFÂ÷7ãà¢Æ–çWBæÖSÒ'fÆ÷%fW&&÷'FF"–çWFÖöFSÒ&FV6–ÖÂ"Æ6V†öÆFW#Ò#Ã"fÇVSÒ"G¶7W'&Væ7”f–VÆEfÇVR‡fW&&÷'FFfÇVR—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåfÆ÷"W7F–ÖFóÂ÷7ãà¢Æ–çWBæÖSÒ'fÆ÷$W7F–ÖFò"–çWFÖöFSÒ&FV6–ÖÂ"Æ6V†öÆFW#Ò#Ã"fÇVSÒ"G¶7W'&Væ7”f–VÆEfÇVR‡fÆ÷$W7F–ÖFõfÇVR—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãä4å£Â÷7ãà¢Æ–çWBæÖSÒ&6ç¢"Æ6V†öÆFW#Ò#ããóÓ"fÇVSÒ"G¶f–VÆEfÇVR‚&6ç¢"—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆBgVÆÂ×7â#à¢Ç7ãäVæFW&\:vóÂ÷7ãà¢Æ–çWBæÖSÒ&VæFW&V6ò"Æ6V†öÆFW#Ò%'VÂì;¦ÖW&òÂ&—'&ò"fÇVSÒ"G¶f–VÆEfÇVR‚&VæFW&V6ò"—Ò"óà¢ÂöÆ&VÃà¢ÂöF—cà¢G·v÷&´f÷&ÔFFÆ—7G2‚—Ð¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢G·v÷&²bb6äFVÆWFUv÷&·2‚’òÆ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâFævW"Ö7F–öâv÷&²ÖFVÆWFR×G&–vvW""G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷VâÖFVÆWFR×v÷&²"FFÖ–CÒ"G¶W66TGG&–'WFR‡v÷&²æ–B—Ò#äW†6ÇV—"ö'&Âö'WGFöãæ¢"'Ð¢G·v÷&²òÆ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷Vâ×v÷&²ÖWb"FFÖ–CÒ"G¶W66TGG&–'WFR‡v÷&²æ–B—Ò#ä'&—"UcÂö'WGFöãæ¢"'Ð¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#âG¶—4VF—F–ærò%6Çf"ÇFW&:|;VW2"¢$6F7G&"ö'&'ÓÂö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâv÷&´f÷&ÔFFÆ—7G2‚’°¢6öç7BFFÆ—7BÒ†–BÂfÇVW2’Óâ ¢ÆFFÆ—7B–CÒ"G¶–GÒ#à¢G·fÇVW2æÖ‚‡fÇVR’ÓâÆ÷F–öâfÇVSÒ"G·fÇVWÒ#ãÂö÷F–öãæ’æ¦ö–â‚""—Ð¢ÂöFFÆ—7Cà¢°¢&WGW&â ¢G¶FFÆ—7B‚'F—õVæ–FFT÷F–öç2"ÂVæ—VUv÷&µfÇVW2‚'F—õVæ–FFR"’—Ð¢G¶FFÆ—7B‚'Vd÷F–öç2"Â6öæf–wW&F–öäÆ&VÇ2‚'7FFR"’—Ð¢G¶FFÆ—7B‚'&Vv–ô÷F–öç2"Â6öæf–wW&F–öäÆ&VÇ2‚'&Vv–öâ"’—Ð¢G¶FFÆ—7B‚&æôö'&÷F–öç2"Â6öæf–wW&F–öäÆ&VÇ2‚'–V""’—Ð¢G¶FFÆ—7B‚&6Æ76–f–66ô÷F–öç2"Â6öæf–wW&F–öäÆ&VÇ2‚&6FVv÷'’"’—Ð¢°§Ð ¦gVæ7F–öâ÷VävÆö&ÄFVÖæDÖöFÂ‚’°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢ÆF—b6Æ73Ò&ÖöFÂÖ6&BFVÖæB×G—RÖ6&B"&öÆSÒ&F–Æör"&–ÖÆ&VÆÆVF'“Ò&vÆö&ÄFVÖæEF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#äæ÷fFVÖæFÂ÷7ãà¢Æƒ"–CÒ&vÆö&ÄFVÖæEF—FÆR#äW66öÆ†òfÇW†òFR÷,:vÖVçFóÂöƒ#à¢Ç6Æ73Ò&×WFVB#å6VÆV6–öæRòÜ;6GVÆò&'&—"ò6F7G&ò6÷'&WFòF6ÆL:–6æ–6ãÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&FVÖæB×G—RÖ÷F–öç2#à¢Æ'WGFöâ6Æ73Ò&FVÖæB×G—RÖ÷F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷VâÖvÆö&ÂÖFVÖæB×G—R"FFÖÖöGVÆR×F&vWCÒ'v÷&·2#à¢Ç7â6Æ73Ò&FVÖæB×G—RÖ–6öâ"&–Ö†–FFVãÒ'G'VR#äô#Â÷7ãà¢Ç7ãà¢Ç7G&öæsä÷,:vÖVçFòFRö'&3Â÷7G&öæsà¢Ç6ÖÆÃäUbÂ&Wf—<:6ò÷,:vÖVçL:&–Â4”2RfÇW†ò÷W&6–öæÂFRö'&3Â÷6ÖÆÃà¢Â÷7ãà¢Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò&FVÖæB×G—RÖ÷F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷VâÖvÆö&ÂÖFVÖæB×G—R"FFÖÖöGVÆR×F&vWCÒ&Ö–çFVææ6R#à¢Ç7â6Æ73Ò&FVÖæB×G—RÖ–6öâFVÖæB×G—RÖ–6öâÒÖ÷&ævR"&–Ö†–FFVãÒ'G'VR#äÔãÂ÷7ãà¢Ç7ãà¢Ç7G&öæsä÷,:vÖVçFòFRÖçWFVì:|:6óÂ÷7G&öæsà¢Ç6ÖÆÃäõ2&VF–ÂÂVæ–FFRÂfÆ÷&W2ÂÆVBF–ÖRRf6W2—Vg“Â÷6ÖÆÃà¢Â÷7ãà¢Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò&FVÖæB×G—RÖ÷F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷VâÖvÆö&ÂÖFVÖæB×G—R"FFÖÖöGVÆR×F&vWCÒ&6Æ–æ–6Â#à¢Ç7â6Æ73Ò&FVÖæB×G—RÖ–6öâFVÖæB×G—RÖ–6öâÒÖw&VVâ"&–Ö†–FFVãÒ'G'VR#äT3Â÷7ãà¢Ç7ãà¢Ç7G&öæsä÷,:vÖVçFòFRVævVæ†&–6Ì:Öæ–6Â÷7G&öæsà¢Ç6ÖÆÃåVæ–FFRÂWV—ÖVçFòÂF—fò76—7FVæ6–ÂR†—7L;7&–6òFRõ3Â÷6ÖÆÃà¢Â÷7ãà¢Âö'WGFöãà¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ÷VävÆö&ÄFVÖæD'”ÖöGVÆR†ÖöGVÆR’°¢–b†ÖöGVÆRÓÓÒ&Ö–çFVææ6R"’°¢6WEf–Wr‚&Ö–çFVææ6T÷W&F–öæÂ"“°¢÷VäÖ–çFVææ6TFVÖæDÖöFÂ‚“°¢&WGW&ã°¢Ð¢–b†ÖöGVÆRÓÓÒ&6Æ–æ–6Â"’°¢6WEf–Wr‚&6Æ–æ–6Ä÷W&F–öæÂ"“°¢÷VäÖ–çFVææ6TFVÖæDÖöFÂ‚“°¢&WGW&ã°¢Ð¢6WEf–Wr‚'v÷&·4÷W&F–öæÂ"“°¢÷VäFVÖæDÖöFÂ‚“°§Ð ¦gVæ7F–öâ÷VäFVÖæDÖöFÂ†ÖöFRÒ&FVÖæB"’°¢–b†ÖöFRÓÓÒ'6–2"’°¢÷Vå6–4FVÖæDÖöFÂ‚“°¢&WGW&ã°¢Ð¢FVÖæEv—¦&DG&gBÒ·Ó°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢ÆF—b6Æ73Ò&ÖöFÂÖ6&BFVÖæB×G—RÖ6&B"&öÆSÒ&F–Æör"&–ÖÆ&VÆÆVF'“Ò&FVÖæEG—UF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#äæ÷fFVÖæFÂ÷7ãà¢Æƒ"–CÒ&FVÖæEG—UF—FÆR#äæ÷fFVÖæFÂöƒ#à¢Ç6Æ73Ò&×WFVB#åVÂòF—òFW7FFVÖæFóÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&FVÖæB×G—RÖ÷F–öç2#à¢G·v÷&´FVÖæEG—TFVf–æ—F–öç2æÖ‚‡G—R’Óâ ¢Æ'WGFöâ6Æ73Ò&FVÖæB×G—RÖ÷F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'7F'BÖFVÖæB×v—¦&B"FF×G—SÒ"G·G—Ræ–GÒ#à¢Ç7â6Æ73Ò&FVÖæB×G—RÖ–6öâG·G—Ræ–6öä6Æ77Ò"&–Ö†–FFVãÒ'G'VR#âG·G—Ræ–6öçÓÂ÷7ãà¢Ç7ãà¢Ç7G&öæsâG·G—RæÆ&VÇÓÂ÷7G&öæsà¢Ç6ÖÆÃâG·G—RæFW67&—F–öçÓÂ÷6ÖÆÃà¢Â÷7ãà¢Âö'WGFöãà¢’æ¦ö–â‚""—Ð¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ÷VäFVÖæEv—¦&DÖöFÂ‡G—RÒ$VÖ—76ô–æ–6–Â"Â7FWÒÂG&gBÒ·Ò’°¢FVÖæEv—¦&DG&gBÒFVÖæEv—¦&DFVfVÇDG&gB‡G—RÂG&gB“°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ‡7FWÓÓÒò&VæFW$FVÖæEv—¦&E7FW†FVÖæEv—¦&DG&gB’¢&VæFW$FVÖæEv—¦&E7FW"†FVÖæEv—¦&DG&gB’“°§Ð ¦gVæ7F–öâFVÖæEv—¦&DFVfVÇDG&gB‡G—RÂG&gBÒ·Ò’°¢6öç7B6æF–FFRÒG&gBæö'&–@¢òv÷&´'”–B†G&gBæö'&–B’ÇÂFVÖæEv÷&´6FÆör‚’æf–æB‚†—FVÒ’Óâ7G&–ær†—FVÒæ–B’ÓÓÒ7G&–ær†G&gBæö'&–B’¢¢çVÆÃ°¢6öç7Bv÷&²Ò—4FVÖæEv÷&´VÆ–v–&ÆR†6æF–FFR’ò6æF–FFR¢çVÆÃ°¢6öç7BfÆÆ&6µ7&–çBÒ7W'&VçE7&–çB‚“°¢6öç7B7&–çD–G2Òæ÷&ÖÆ—¦U6VÆV7FVE7&–çD–G2€¢'&’æ—4'&’†G&gBç7&–çD–G2¢òG&gBç7&–çD–G0¢¢G&gBç7&–çD–@¢ò¶G&gBç7&–çD–EÐ¢¢7VvvW7FVDFVÖæE7&–çD–G2†G&gBæFF&Wf—7F–æ–6–òÇÂFöF”•4ò‚’ÂG&gBæFF&Wf—7FVçG&VvÇÂfÆÆ&6µ7&–çCòæFFf–ÒÇÂFDF—4•4ò‡FöF”•4ò‚’ÂR’¢“°¢6öç7B7&–çBÒ7&–çD'”–B‡7&–çD–G2æB‚Ó’’ÇÂçVÆÃ°¢6öç7BVæ—DÖöFRÒG&gBçVæ–FFTÖöFòÓÓÒ&W†—7FVçFR"ò&W†—7FVçFR"¢&æ÷f#°¢6öç7BæÇ—7D76–væÖVçBÒæ÷&ÖÆ—¦TFVÖæDæÇ—7G2†G&gB“°¢6öç7B7VvvW7FVDæÇ—7BÒæÇ—7D76–væÖVçBææÆ—7F&W7öç6fVÂò""¢FVÖæDÆVDf÷%v÷&²‡v÷&²“°¢&WGW&â°¢F—ó¢FVÖæEG—T¶W’‡G—R’ÇÂ$VÖ—76ô–æ–6–Â"À¢ö'&–C¢v÷&³òæ–BÇÂ""À¢ö'&'W66¢v÷&²òG&gBæö'&'W66ÇÂv÷&²ææöÖR¢G&gBæö'&–Bò""¢G&gBæö'&'W66ÇÂ""À¢Væ–FFTÖöFó¢Væ—DÖöFRÀ¢Væ–FFT–C¢G&gBçVæ–FFT–BÇÂ""À¢Væ–FFT'W66¢G&gBçVæ–FFT'W66ÇÂ""À¢Væ–FFTæöÖS¢G&gBçVæ–FFTæöÖRÇÂ""À¢Væ–FFUF—ó¢G&gBçVæ–FFUF—òÇÂ""À¢Væ–FFT6ç£¢G&gBçVæ–FFT6ç¢ÇÂ""À¢Væ–FFT×Væ–6—–ó¢G&gBçVæ–FFT×Væ–6—–òÇÂ""À¢Væ–FFT6VçG&ó¢G&gBçVæ–FFT6VçG&òÇÂ""À¢Væ–FFU6÷W&6S¢G&gBçVæ–FFU6÷W&6RÇÂ""À¢7&–çD–G2À¢7&–çD–C¢7&–çCòæ–BÇÂ""À¢æÆ—7F&W7öç6fVÃ¢æÇ—7D76–væÖVçBææÆ—7F&W7öç6fVÂÇÂ7VvvW7FVDæÇ—7BÀ¢æÆ—7F46ö×ÆVÖVçF&W3¢æÇ—7D76–væÖVçBææÆ—7F46ö×ÆVÖVçF&W2À¢WF—VWF3¢æ÷&ÖÆ—¦TFVÖæDÆ&VÇ2†G&gBæWF—VWF2’À¢FW67&–6ó¢G&gBæFW67&–6òÇÂ""À¢&ö¦WF÷4VçföÇf–F÷3¢'&”÷$fÆÆ&6²†G&gBç&ö¦WF÷4VçföÇf–F÷2’À¢&ö¦WF÷4VçföÇf–F÷4FWFÆ†W3¢æ÷&ÖÆ—¦TFVÖæE&ö¦V7DFWF–Ç2†G&gBç&ö¦WF÷4VçföÇf–F÷4FWFÆ†W2’À¢&–÷&–FFS¢G&gBç&–÷&–FFRÇÂ$Ü:–F–"À¢FF&Wf—7F–æ–6–ó¢G&gBæFF&Wf—7F–æ–6–òÇÂ""À¢FF–æ–6–õ&VÃ¢G&gBæFF–æ–6–õ&VÂÇÂ""À¢FF&WdVçf–õfÆ–F6ôö'&3¢G&gBæFF&WdVçf–õfÆ–F6ôö'&2ÇÂ""À¢FFVçf–õ&VÅfÆ–F6ôö'&3¢G&gBæFFVçf–õ&VÅfÆ–F6ôö'&2ÇÂ""À¢FFfÆ–F6ôö'&3¢G&gBæFFfÆ–F6ôö'&2ÇÂ""À¢FF&Wf—7FVçG&Vv¢G&gBæFF&Wf—7FVçG&VvÇÂ""À¢FFVçG&Vv&VÃ¢G&gBæFFVçG&Vv&VÂÇÂ""À¢æôVçf–%fÆ–F6ôö'&3¢&ööÆVâ†G&gBææôVçf–%fÆ–F6ôö'&2’À¢æ÷F¢G&gBææ÷FÇÂ""À¢Ó°§Ð ¦gVæ7F–öâFVÖæEVæ—D6öçFW‡Df–VÆG2‡Væ—BÂÖöFRÒ&W†—7FVçFR"ÂfÆÆ&6²Ò·Ò’°¢6öç7B—4W†—7F–ærÒÖöFRÓÓÒ&W†—7FVçFR#°¢&WGW&â°¢Væ–FFTÖöFó¢—4W†—7F–ærò&W†—7FVçFR"¢&æ÷f"À¢Væ–FFT–C¢—4W†—7F–æròVæ—Còæ–BÇÂfÆÆ&6²çVæ–FFT–BÇÂ""¢""À¢Væ–FFT'W66¢—4W†—7F–ærò‡Væ—Bò6†&VEVæ—E6V&6„Æ&VÂ‡Væ—B’¢fÆÆ&6²çVæ–FFT'W66ÇÂ""’¢""À¢Væ–FFTæöÖS¢—4W†—7F–æròVæ—CòææöÖRÇÂfÆÆ&6²çVæ–FFTæöÖRÇÂ""¢fÆÆ&6²çVæ–FFTæöÖRÇÂ""À¢Væ–FFUF—ó¢—4W†—7F–æròVæ—CòçF—òÇÂfÆÆ&6²çVæ–FFUF—òÇÂ""¢fÆÆ&6²çVæ–FFUF—òÇÂ""À¢Væ–FFT6ç£¢—4W†—7F–æròVæ—Còæ6ç¢ÇÂfÆÆ&6²çVæ–FFT6ç¢ÇÂ""¢fÆÆ&6²çVæ–FFT6ç¢ÇÂ""À¢Væ–FFT×Væ–6—–ó¢—4W†—7F–æròVæ—Còæ×Væ–6—–òÇÂfÆÆ&6²çVæ–FFT×Væ–6—–òÇÂ""¢fÆÆ&6²çVæ–FFT×Væ–6—–òÇÂ""À¢Væ–FFT6VçG&ó¢—4W†—7F–æròVæ—Còæ6VçG&òÇÂfÆÆ&6²çVæ–FFT6VçG&òÇÂ""¢fÆÆ&6²çVæ–FFT6VçG&òÇÂ""À¢Væ–FFU6÷W&6S¢—4W†—7F–æròVæ—Còç6÷W&6RÇÂfÆÆ&6²çVæ–FFU6÷W&6RÇÂ""¢fÆÆ&6²çVæ–FFU6÷W&6RÇÂ""À¢Ó°§Ð ¦gVæ7F–öâ&VæFW$FVÖæEv—¦&E7FW†G&gB’°¢6öç7B7&–çBÒFVÖæE&–Ö'•7&–çB†G&gB“°¢6öç7BF—FÆRÒFVÖæEG—TÆ&VÂ†G&gBçF—ò“°¢&WGW&â ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&BFVÖæBÖÖöFÂÖ6&BFVÖæBÖFWF–ÂÖf÷&ÒFVÖæBÖ7&VFRÖ6&BFVÖæB×v—¦&BÖ6&B"–CÒ&FVÖæEv—¦&E7FW"&–ÖÆ&VÆÆVF'“Ò&FVÖæEF—FÆR"FF×G—SÒ"G¶G&gBçF—÷Ò#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#äæ÷fFVÖæFÂ÷7ãà¢Æƒ"–CÒ&FVÖæEF—FÆR#äæ÷fFVÖæF(	BG·F—FÆWÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#äWFFR"+r–FVçF–f–6:|:6óÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâFVÖæBÖæÇ—7B×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäæÆ—7F2FFVÖæFÂ÷7ãà¢ÂöF—cà¢G¶æÇ—7D6†—÷F–öç2†G&gB—Ð¢Â÷6V7F–öãà ¢ÆÆ&VÂ6Æ73Ò&f–VÆBÖöFÂ×6V7F–öâ#à¢Ç7ãäFW67&œ:|:6òFFVÖæFÂ÷7ãà¢ÇFW‡F&VæÖSÒ&FW67&–6ò"Æ6V†öÆFW#Ò$FW67&WfòW66÷òFW7FFVÖæFâââ#âG¶W66TGG&–'WFR†G&gBæFW67&–6ò—ÓÂ÷FW‡F&Và¢ÂöÆ&VÃà ¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'F—ò"fÇVSÒ"G¶W66TGG&–'WFR†G&gBçF—ò—Ò"óà¢ÆF—b6Æ73Ò&f–VÆBÖöFÂ×6V7F–öâ#à¢Ç7ãå7&–çG3Â÷7ãà¢G·7&–çD6†V6¶&÷†W2†FVÖæE7&–çD–G2†G&gB’—Ð¢Ç6ÖÆÂ6Æ73Ò&×WFVB"FF×7&–çBÖWFòÖ†–çCâG¶W66TGG&–'WFR†FVÖæE7&–çEW&–öEFW‡B†G&gB’—Òâfö<:¢öFRf–æ7VÆ"FVÖæFÖ—2FRVÖ7&–çBãÂ÷6ÖÆÃà¢ÂöF—cà¢ÆF—b6Æ73Ò&f÷&ÒÖw&–BÖöFÂ×6V7F–öâ#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãä–ì:Ö6–ò&Wf—7FóÂ÷7ãà¢Æ–çWBG—SÒ&FFR"æÖSÒ&FF&Wf—7F–æ–6–ò"fÇVSÒ"G¶W66TGG&–'WFR†G&gBæFF&Wf—7F–æ–6–òÇÂFöF”•4ò‚’—Ò"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäVçG&Vv&Wf—7FÂ÷7ãà¢Æ–çWBG—SÒ&FFR"æÖSÒ&FF&Wf—7FVçG&Vv"fÇVSÒ"G¶W66TGG&–'WFR†G&gBæFF&Wf—7FVçG&VvÇÂ7&–çCòæFFf–ÒÇÂ""—Ò"óà¢ÂöÆ&VÃà¢ÂöF—cà¢Ç6ÖÆÂ6Æ73Ò&×WFVB#äòÇFW&"2FF2Âò6—7FVÖ,:’×6VÆV6–öæ27&–çG26÷'&W7öæFVçFW3²fö<:¢öFR§W7F"ÖçVÆÖVçFRãÂ÷6ÖÆÃà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäö'&f–æ7VÆF£Â÷7ãà¢ÂöF—cà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&ö'&–B"fÇVSÒ"G¶W66TGG&–'WFR†G&gBæö'&–B—Ò"óà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãä'W66"ö'&Â÷7ãà¢Æ–çWBæÖSÒ&ö'&'W66"FFÖFVÖæB×v÷&²×6V&6‚Æ—7CÒ&FVÖæEv÷&´÷F–öç2"fÇVSÒ"G¶W66TGG&–'WFR†G&gBæö'&'W66—Ò"Æ6V†öÆFW#Ò$F–v—FRòæöÖRFö'&âââ"WFö6ö×ÆWFSÒ&öfb"&WV—&VBóà¢ÂöÆ&VÃà¢G¶FVÖæEv÷&´FFÆ—7B‚—Ð¢Â÷6V7F–öãà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'7V&Ö—BÖFVÖæB×7FW#äfì:v"(i#Âö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW$FVÖæEv—¦&E7FW"†G&gB’°¢6öç7Bv÷&²ÒVÆ–v–&ÆTFVÖæEv÷&´6FÆör‚’æf–æB‚†—FVÒ’Óâ7G&–ær†—FVÒæ–B’ÓÓÒ7G&–ær†G&gBæö'&–B’“°¢6öç7BF—FÆRÒFVÖæEG—TÆ&VÂ†G&gBçF—ò“°¢&WGW&â ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&BFVÖæBÖÖöFÂÖ6&BFVÖæBÖFWF–ÂÖf÷&ÒFVÖæBÖ7&VFRÖ6&BFVÖæB×v—¦&BÖ6&B"–CÒ&FVÖæDf÷&Ò"&–ÖÆ&VÆÆVF'“Ò&FVÖæEF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#äæ÷fFVÖæFÂ÷7ãà¢Æƒ"–CÒ&FVÖæEF—FÆR#äæ÷fFVÖæF(	BG·F—FÆWÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#äWF"FR"+rFWFÆ†ÖVçFóÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢G¶FVÖæEv—¦&D†–FFVäf–VÆG2†G&gB—Ð ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäFWFÆ†W3Â÷7ãà¢ÂöF—cà¢ÆÆ&VÂ6Æ73Ò&f–VÆBFVÖæB×&–÷&—G’Öf–VÆB#à¢Ç7ãå&–÷&–FFSÂ÷7ãà¢Ç6VÆV7BæÖSÒ'&–÷&–FFR#à¢G·&–÷&—G”÷F–öç2†G&gBç&–÷&–FFR—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢G·&VæFW$FVÖæDÆ&VÇ4f–VÆB†G&gBæWF—VWF2—Ð¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäFF3Â÷7ãà¢ÂöF—cà¢ÆF—b6Æ73Ò&FFRÖw&–BFVÖæBÖFFRÖw&–B#à¢G¶FFTf–VÆB‚#+rFF&Wf—7FFR–ì:Ö6–ò"Â&FF&Wf—7F–æ–6–ò"ÂG&gBæFF&Wf—7F–æ–6–ò—Ð¢G¶FFTf–VÆB‚#"+rFFFR–ì:Ö6–ò&VÂ"Â&FF–æ–6–õ&VÂ"ÂG&gBæFF–æ–6–õ&VÂ—Ð¢G¶FFTf–VÆB‚#2+r&WbâVçf–òòfÆ–F:|:6òö'&2"Â&FF&WdVçf–õfÆ–F6ôö'&2"ÂG&gBæFF&WdVçf–õfÆ–F6ôö'&2—Ð¢G¶FFTf–VÆB‚#B+rVçf–ò&VÂòfÆ–F:|:6òö'&2"Â&FFVçf–õ&VÅfÆ–F6ôö'&2"ÂG&gBæFFVçf–õ&VÅfÆ–F6ôö'&2—Ð¢ÆÆ&VÂ6Æ73Ò'fÆ–FF–öâ×6¶—gVÆÂ×7â#à¢Æ–çWBæÖSÒ&æôVçf–%fÆ–F6ôö'&2"G—SÒ&6†V6¶&÷‚"G¶G&gBææôVçf–%fÆ–F6ôö'&2ò&6†V6¶VB"¢"'Òóà¢Ç7ãäW7FFVÖæFì:6òfö’÷6W,:Vçf–F&fÆ–F:|:6òFWV—RFRö'&3Â÷7ãà¢ÂöÆ&VÃà¢G¶FFTf–VÆB‚#R+rFFFRfÆ–F:|:6òFRö'&2"Â&FFfÆ–F6ôö'&2"ÂG&gBæFFfÆ–F6ôö'&2—Ð¢G¶FFTf–VÆB‚#b+rFF&Wf—7FFVçG&Vv"Â&FF&Wf—7FVçG&Vv"ÂG&gBæFF&Wf—7FVçG&Vv—Ð¢G¶FFTf–VÆB‚#r+rFFVçG&Vv&VÂ"Â&FFVçG&Vv&VÂ"ÂG&gBæFFVçG&Vv&VÂÂG'VR—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆRv—F‚Ö7F–öâ#à¢Ç7ãä†—7L;7&–6òFRÇFW&:|;VW3Â÷7ãà¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'FövvÆRÖFVÖæBÖ†—7F÷'’#åfW"†—7L;7&–6óÂö'WGFöãà¢ÂöF—cà¢ÆF—b6Æ73Ò&FVÖæBÖ†—7F÷'’×æVÂ"†–FFVãà¢ÆF—b6Æ73Ò&V×G’×7FFR#ä†—7L;7&–6ò6W,:7&–Fò;726Çf"FVÖæFãÂöF—cà¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäö'6W'f:|:6óÂ÷7ãà¢ÂöF—cà¢ÇFW‡F&VæÖSÒ&æ÷F"Æ6V†öÆFW#Ò%&Vv—7G&Rö'6W'f:|;VW2&VÆWfçFW26ö'&RW7FFVÖæFâââ#âG¶G&gBææ÷FÓÂ÷FW‡F&Và¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãå&ö¦WF÷2VçföÇf–F÷3Â÷7ãà¢ÂöF—cà¢G·&VæFW$FVÖæE&ö¦V7G56VÆV7F÷"†G&gBç&ö¦WF÷4VçföÇf–F÷2ÂG&gBç&ö¦WF÷4VçföÇf–F÷4FWFÆ†W2—Ð¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâFVÖæBÖWb×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäW7GVFòFRf–&–Æ–FFR„Ub“Â÷7ãà¢ÂöF—cà¢Ç6Æ73Ò&×WFVB#äW7FFVÖæFÆ–ÖVçFF—&WFÖVçFRòUbFö'&f–æ7VÆFâ&VÖ—7<:6ò–æ–6–ÂÂòUbæ66RvW&Fò&&VVæ6†W"÷27W7F÷2ãÂ÷à¢G·v÷&²òÆ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâgVÆÂ×v–GF‚"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷Vâ×v÷&²ÖWb"FFÖ–CÒ"G·v÷&²æ–GÒ#ä'&—"UbFö'&f–æ7VÆFÂö'WGFöãæ¢"'Ð¢Â÷6V7F–öãà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&&6²ÖFVÖæB×7FW#åföÇF#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'7V&Ö—BÖFVÖæBÖf÷&Ò#å6Çf"FVÖæFÂö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâFVÖæEv—¦&D†–FFVäf–VÆG2†G&gB’°¢&WGW&â ¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&ö'&–B"fÇVSÒ"G¶W66TGG&–'WFR†G&gBæö'&–B—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&ö'&'W66"fÇVSÒ"G¶W66TGG&–'WFR†G&gBæö'&'W66—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'Væ–FFTÖöFò"fÇVSÒ"G¶W66TGG&–'WFR†G&gBçVæ–FFTÖöFò—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'Væ–FFT–B"fÇVSÒ"G¶W66TGG&–'WFR†G&gBçVæ–FFT–B—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'Væ–FFT'W66"fÇVSÒ"G¶W66TGG&–'WFR†G&gBçVæ–FFT'W66—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'Væ–FFTæöÖR"fÇVSÒ"G¶W66TGG&–'WFR†G&gBçVæ–FFTæöÖR—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'Væ–FFUF—ò"fÇVSÒ"G¶W66TGG&–'WFR†G&gBçVæ–FFUF—ò—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'Væ–FFT6ç¢"fÇVSÒ"G¶W66TGG&–'WFR†G&gBçVæ–FFT6ç¢—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'Væ–FFT×Væ–6—–ò"fÇVSÒ"G¶W66TGG&–'WFR†G&gBçVæ–FFT×Væ–6—–ò—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'Væ–FFT6VçG&ò"fÇVSÒ"G¶W66TGG&–'WFR†G&gBçVæ–FFT6VçG&ò—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'Væ–FFU6÷W&6R"fÇVSÒ"G¶W66TGG&–'WFR†G&gBçVæ–FFU6÷W&6R—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ'F—ò"fÇVSÒ"G¶W66TGG&–'WFR†G&gBçF—ò—Ò"óà¢G¶FVÖæE7&–çD–G2†G&gB’æÖ‚‡7&–çD–B’ÓâÆ–çWBG—SÒ&†–FFVâ"æÖSÒ'7&–çD–B"fÇVSÒ"G¶W66TGG&–'WFR‡7&–çD–B—Ò"óæ’æ¦ö–â‚""—Ð¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&æÆ—7F&W7öç6fVÂ"fÇVSÒ"G¶W66TGG&–'WFR†G&gBææÆ—7F&W7öç6fVÂ—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&æÆ—7F56VÆV6–öæF÷2"fÇVSÒ"G¶W66TGG&–'WFR„¥4ôâç7G&–æv–g’†FVÖæDæÇ—7DæÖW2†G&gB’’—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&FW67&–6ò"fÇVSÒ"G¶W66TGG&–'WFR†G&gBæFW67&–6ò—Ò"óà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&6öÇVæ"fÇVSÒ"G¶æWuv÷&´FVÖæD6öÇVÖâ†G&gBçF—ò—Ò"óà¢°§Ð ¦gVæ7F–öâFVÖæEv÷&´FFÆ—7B‡²–æ6ÇVFT†—7F÷&–6ÂÒfÇ6RÒÒ·Ò’°¢6öç7Bv÷&·2Ò–æ6ÇVFT†—7F÷&–6ÂòFVÖæEv÷&´6FÆör‚’¢VÆ–v–&ÆTFVÖæEv÷&´6FÆör‚“°¢&WGW&â ¢ÆFFÆ—7B–CÒ&FVÖæEv÷&´÷F–öç2#à¢G·v÷&·2æÖ‚‡v÷&²’ÓâÆ÷F–öâfÇVSÒ"G¶W66TGG&–'WFR‡v÷&²ææöÖR—Ò#âG¶W66TGG&–'WFR†FVÖæEv÷&µ–V"‡v÷&²’—ÓÂö÷F–öãæ’æ¦ö–â‚""—Ð¢ÂöFFÆ—7Cà¢°§Ð ¦gVæ7F–öâFVÖæEv÷&´6FÆör‚’°¢&WGW&â²ââææWrÖ†'VFvWEv÷&·2‚’æÖ‚‡v÷&²’Óâµ7G&–ær‡v÷&²æ–B’Âv÷&µÒ’’çfÇVW2‚•Ó°§Ð ¦gVæ7F–öâ—4FVÖæEv÷&´VÆ–v–&ÆR‡v÷&²’°¢6öç7B&V6÷&BÒv÷&³òåö†—7F÷&–6Ä'VFvWEv÷&°¢ò'&”÷$fÆÆ&6²‡7FFRæWg2’æf–æB‚†—FVÒ’Óâ7G&–ær†—FVÒæ–B’ÓÓÒ7G&–ær‡v÷&²æ†—7F÷&–6Å&V6÷&D–B’¢¢çVÆÃ°¢6öç7B–V"Ò7G&–ær‡v÷&³òææôö'&ÇÂ&V6÷&Còç–V"ÇÂ""’ç6Æ–6RƒÂB“°¢–b‚õåÆG³GÒBòçFW7B‡–V"’’&WGW&âçVÖ&W"‡–V"’ãÒ##S°¢6öç7B—4ÖçVÅ÷'FföÆ–õv÷&²Ð¢õäô%"ÕÆB²Bö’çFW7B…7G&–ær‡v÷&³òæ–BÇÂ""’’b`¢v÷&³òåö†—7F÷&–6Ä'VFvWEv÷&²b`¢v÷&³òç6÷W&6T†—7F÷&–6Å&V6÷&D–C°¢&WGW&â—4ÖçVÅ÷'FföÆ–õv÷&²bbæWrFFR‚’ævWDgVÆÅ–V"‚’ãÒ##S°§Ð ¦gVæ7F–öâVÆ–v–&ÆTFVÖæEv÷&´6FÆör‚’°¢&WGW&âFVÖæEv÷&´6FÆör‚’æf–ÇFW"†—4FVÖæEv÷&´VÆ–v–&ÆR“°§Ð ¦gVæ7F–öâFVÖæEv÷&µ–V"‡v÷&²’°¢6öç7B&V6÷&BÒv÷&³òåö†—7F÷&–6Ä'VFvWEv÷&°¢ò'&”÷$fÆÆ&6²‡7FFRæWg2’æf–æB‚†—FVÒ’Óâ7G&–ær†—FVÒæ–B’ÓÓÒ7G&–ær‡v÷&²æ†—7F÷&–6Å&V6÷&D–B’¢¢çVÆÃ°¢6öç7BÆFW7EfW'6–öâÒ'&”÷$fÆÆ&6²‡v÷&³òæWcòçfW'6–öç2’æB‚Ó“°¢6öç7BW‡Æ–6—E–V"Ò7G&–ær‡v÷&³òææôö'&ÇÂ&V6÷&Còç–V"ÇÂÆFW7EfW'6–öãòæFFÇÂ""’ç6Æ–6RƒÂB“°¢–b‚õåÆG³GÒBòçFW7B†W‡Æ–6—E–V"’’&WGW&âW‡Æ–6—E–V#°¢6öç7B—4ÖçVÅ÷'FföÆ–õv÷&²Ð¢õäô%"ÕÆB²Bö’çFW7B…7G&–ær‡v÷&³òæ–BÇÂ""’’b`¢v÷&³òåö†—7F÷&–6Ä'VFvWEv÷&²b`¢v÷&³òç6÷W&6T†—7F÷&–6Å&V6÷&D–C°¢&WGW&â—4ÖçVÅ÷'FföÆ–õv÷&²ò7G&–ær†æWrFFR‚’ævWDgVÆÅ–V"‚’’¢"#°§Ð ¦gVæ7F–öâ†—7F÷&–6Å&V6÷&Df÷%v÷&²‡v÷&²’°¢–b‚v÷&²’&WGW&âçVÆÃ°¢6öç7B&V6÷&G2Ò'&”÷$fÆÆ&6²‡7FFRæWg2“°¢6öç7B6÷W&6T–BÒv÷&²æ†—7F÷&–6Å&V6÷&D–BÇÂv÷&²ç6÷W&6T†—7F÷&–6Å&V6÷&D–C°¢&WGW&â&V6÷&G2æf–æB‚‡&V6÷&B’Óâ7G&–ær‡&V6÷&Bæ–B’ÓÓÒ7G&–ær‡6÷W&6T–BÇÂ""’¢ÇÂ&V6÷&G2æf–æB‚‡&V6÷&B’Óâ7G&–ær‡&V6÷&Bçv÷&´–BÇÂ""’ÓÓÒ7G&–ær‡v÷&²æ–BÇÂ""’¢ÇÂ&V6÷&G2æf–æB‚‡&V6÷&B’ÓâWeVæ–f–VEv÷&´f÷$†—7F÷&–6Â‡&V6÷&B“òæ–BÓÓÒv÷&²æ–B¢ÇÂçVÆÃ°§Ð ¦gVæ7F–öâFVÖæDÆVDf÷%v÷&²‡v÷&²’°¢–b‚v÷&²’&WGW&â"#°¢òòö'&2çF–v26öçF–çVÒW6æFòW†6ÇW6—fÖVçFR&Vw&†—7L;7&–6à¢–b‡v÷&²æÆVDÆV&æ–ætVæ&ÆVBÓÓÒG'VR’&WGW&â&Vv—7FW&VDæÇ—7DæÖR‡v÷&²æÆVDÆV&æVDæÖR“°¢&WGW&â&Vv—7FW&VDæÇ—7DæÖR††—7F÷&–6ÄæÇ—7Df÷%v÷&²‡v÷&²’“°§Ð ¦gVæ7F–öâÆV&åv÷&´ÆVDg&öÔ6ö×ÆWF–öâ†FVÖæB’°¢6öç7Bv÷&²Òv÷&´'”–B†FVÖæCòæö'&–B“°¢–b‚v÷&²ÇÂv÷&²æÆVDÆV&æ–ætVæ&ÆVBÓÒG'VRÇÂv÷&²æÆVDÆV&æVDFVÖæD–BÇÂFVÖæCòæ6öÇVæÓÒ&6öæ6ÇV–Fò"’&WGW&âfÇ6S°¢6öç7BÆVFW"Ò&Vv—7FW&VDæÇ—7DæÖR†FVÖæBææÆ—7F&W7öç6fVÂ“°¢–b‚ÆVFW"’&WGW&âfÇ6S°¢v÷&²æÆVDÆV&æVDæÖRÒÆVFW#°¢v÷&²æÆVDÆV&æVDFVÖæD–BÒFVÖæBæ–C°¢FD†—7F÷'’‡²VçF–FFS¢&ö'&"ÂVçF–FFT–C¢v÷&²æ–BÂ6×ó¢&æÆ—7FÆ–FW$&VæF–Fò"ÂfÆ÷$çFW&–÷#¢$ì:6ò–æf÷&ÖFò"ÂfÆ÷$æ÷fó¢ÆVFW"Ò“°¢&WGW&âG'VS°§Ð ¦gVæ7F–öâ†—7F÷&–6ÄæÇ—7Df÷%v÷&²‡v÷&²’°¢6öç7BæÇ—7BÒ7G&–ær††—7F÷&–6Å&V6÷&Df÷%v÷&²‡v÷&²“òçFV6†æ–6–âÇÂ""’çG&–Ò‚“°¢&WGW&âæÇ—7Bbb²&æò–æf÷&ÖFò"Â'6VÒFV6æ–6ò"Â"Ò"Â.(	B%Òæ–æ6ÇVFW2†æ÷&ÖÆ—¦U6V&6…FW‡B†æÇ—7B’’òæÇ—7B¢"#°§Ð ¦gVæ7F–öâ7VvvW7D†—7F÷&–6ÄæÇ—7D–äf÷&Ò†f÷&ÒÂv÷&²’°¢6öç7B6VÆV7F÷"Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FFÖFVÖæBÖæÇ—7B×6VÆV7F÷%Ò"“°¢–b‚6VÆV7F÷"ÇÂæÇ—7D76–væÖVçDg&öÔf÷&Ò†f÷&Ò’ææÆ—7F&W7öç6fVÂ’&WGW&ã°¢6öç7BæÇ—7BÒFVÖæDÆVDf÷%v÷&²‡v÷&²“°¢–b‚æÇ—7B’&WGW&ã°¢6VÆV7F÷"æ÷WFW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ†æÇ—7D6†—÷F–öç2‡²æÆ—7F&W7öç6fVÃ¢æÇ—7BÒ’“°§Ð ¦gVæ7F–öâ&W6öÇfTFVÖæEv÷&´g&öÕVW'’‡VW'’Â&VfW'&VD–BÒ""’°¢6öç7Bv÷&·2ÒVÆ–v–&ÆTFVÖæEv÷&´6FÆör‚“°¢6öç7B&VfW'&VBÒv÷&·2æf–æB‚‡v÷&²’Óâ7G&–ær‡v÷&²æ–B’ÓÓÒ7G&–ær‡&VfW'&VD–B’“°¢–b‡&VfW'&VB’&WGW&â&VfW'&VC°¢6öç7Bæ÷&ÖÆ—¦VBÒæ÷&ÖÆ—¦U6V&6…FW‡B‡VW'’“°¢–b‚æ÷&ÖÆ—¦VB’&WGW&âçVÆÃ°¢6öç7BG—VD6öFRÒ7G&–ær‡VW'’ÇÂ""’çG&–Ò‚’æÖF6‚‚õâ…ÆG³ÃÒ’ƒó¥Ç2¥²å×ÅÇ7ÂB’ò“òå³ÒÇÂ"#°¢–b‡G—VD6öFR’°¢6öç7B6öFTÖF6†W2Òv÷&·2æf–ÇFW"‚‡v÷&²’Óâ÷'FföÆ–õv÷&´F—7Æ”6öFR‡v÷&²’ÓÓÒG—VD6öFR“°¢–b†6öFTÖF6†W2æÆVæwF‚ÓÓÒ’&WGW&â6öFTÖF6†W5³Ó°¢6öç7BFW&×5v—F†÷WD6öFRÒæ÷&ÖÆ—¦VBç&WÆ6R†æWr&VtW‡†âG·G—VD6öFWÕÅÇ2¦’Â""’ç7Æ—B‚õÇ2²ò’æf–ÇFW"„&ööÆVâ“°¢6öç7B–FVçF–f–VBÒ6öFTÖF6†W2æf–æB‚‡v÷&²’Óâ°¢6öç7BFW‡BÒæ÷&ÖÆ—¦U6V&6…FW‡B‡v÷&´÷F–öäÆ&VÂ‡v÷&²’“°¢&WGW&âFW&×5v—F†÷WD6öFRæWfW'’‚‡FW&Ò’ÓâFW‡Bæ–æ6ÇVFW2‡FW&Ò’“°¢Ò“°¢–b†–FVçF–f–VB’&WGW&â–FVçF–f–VC°¢Ð¢&WGW&âf–æEv÷&´'”W†7EG—VE6V&6‚‡VW'’Âv÷&·2’ÇÂf–æEv÷&´'•G—VE6V&6‚‡VW'’Âv÷&·2“°§Ð ¦gVæ7F–öâ†æFÆTFVÖæEv—¦&E7FW†f÷&Ò’°¢6öç7Bf÷&ÔFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7B6VÆV7FVDæÇ—7G2ÒæÇ—7D76–væÖVçDg&öÔf÷&Ò†f÷&Ò“°¢–b‚fÆ–FFTFVÖæDæÇ—7G2‡6VÆV7FVDæÇ—7G2Âf÷&Ò’’&WGW&ã°¢6öç7Bv÷&²Ò&W6öÇfTFVÖæEv÷&´g&öÕVW'’†f÷&ÔFFævWB‚&ö'&'W66"’Âf÷&ÔFFævWB‚&ö'&–B"’“°¢–b‚v÷&²’°¢6†÷tf÷&ÔW'&÷"‚%6VÆV6–öæRVÖö'&6F7G&FFòæòFR##RVÒF–çFRçFW2FRfì:v"â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BVæ–FFTÖöFòÒf÷&ÔFFævWB‚'Væ–FFTÖöFò"’ÓÓÒ&W†—7FVçFR"ò&W†—7FVçFR"¢&æ÷f#°¢6öç7BVæ—BÒVæ–FFTÖöFòÓÓÒ&W†—7FVçFR"òÖ–çFVææ6UVæ—D'”–B†f÷&ÔFFævWB‚'Væ–FFT–B"’’ÇÂf–æDÖ–çFVææ6UVæ—D'•G—VE6V&6‚†f÷&ÔFFævWB‚'Væ–FFT'W66"’’¢çVÆÃ°¢–b‡Væ–FFTÖöFòÓÓÒ&W†—7FVçFR"bbVæ—B’°¢6†÷tf÷&ÔW'&÷"‚%6VÆV6–öæRVÖVæ–FFRW†—7FVçFRVÆò76—7FVçFRFR'W66çFW2FRfì:v"â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7B7&–çD–G2Ò7&–çD–G4g&öÔf÷&ÔFF†f÷&ÔFF“°¢6öç7B7&–çBÒ7&–çD–G2æÆVæwF‚ò7&–çD'”–B‡7&–çD–G2æB‚Ó’’¢çVÆÃ°¢6öç7BVæ—D6öçFW‡BÒFVÖæEVæ—D6öçFW‡Df–VÆG2‡Væ—BÂVæ–FFTÖöFò“°¢6öç7BæÇ—7D76–væÖVçBÒ6VÆV7FVDæÇ—7G2ææÆ—7F&W7öç6fVÀ¢ò6VÆV7FVDæÇ—7G0¢¢æ÷&ÖÆ—¦TFVÖæDæÇ—7G2‡²æÆ—7F&W7öç6fVÃ¢&Vv—7FW&VDæÇ—7DæÖR††—7F÷&–6ÄæÇ—7Df÷%v÷&²‡v÷&²’’Ò“°¢FVÖæEv—¦&DG&gBÒFVÖæEv—¦&DFVfVÇDG&gB†f÷&ÔFFævWB‚'F—ò"’Â°¢ö'&–C¢v÷&²æ–BÀ¢ö'&'W66¢v÷&²ææöÖRÀ¢ââçVæ—D6öçFW‡BÀ¢7&–çD–G2À¢7&–çD–C¢7&–çCòæ–BÇÂ""À¢ââææÇ—7D76–væÖVçBÀ¢FW67&–6ó¢f÷&ÔFFævWB‚&FW67&–6ò"’À¢FF&Wf—7F–æ–6–ó¢f÷&ÔFFævWB‚&FF&Wf—7F–æ–6–ò"’ÇÂFöF”•4ò‚’À¢FF&Wf—7FVçG&Vv¢f÷&ÔFFævWB‚&FF&Wf—7FVçG&Vv"’ÇÂ7&–çCòæFFf–ÒÇÂ""À¢Ò“°¢÷VäFVÖæEv—¦&DÖöFÂ†FVÖæEv—¦&DG&gBçF—òÂ"ÂFVÖæEv—¦&DG&gB“°§Ð ¦gVæ7F–öâv÷&´÷F–öäÆ&VÂ‡v÷&²’°¢6öç7BÆö6F–öâÒ·v÷&²æ6–FFRÂv÷&²çVeÒæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"ò"“°¢&WGW&â·v÷&²ææöÖRÂv÷&µ6V&6…–V%FW‡B‡v÷&²’Âv÷&²æ6†fUVæ–6ÇÂv÷&²æ6öF–vô÷&–v–æÂÂÆö6F–öåÒæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"Â"“°§Ð ¦gVæ7F–öâv÷&µ6V&6…–V%FW‡B‡v÷&²’°¢&WGW&âæó¢G¶FVÖæEv÷&µ–V"‡v÷&²’ÇÂ$ì:6ò–æf÷&ÖFò'Ö°§Ð ¦gVæ7F–öâf–æEv÷&´'•G—VE6V&6‚‡fÇVRÂv÷&·2ÒFVÖæEv÷&´6FÆör‚’’°¢6öç7BFW&×2Òæ÷&ÖÆ—¦U6V&6…FW‡B‡fÇVR’ç7Æ—B‚õÇ2²ò’æf–ÇFW"„&ööÆVâ“°¢–b‚FW&×2æÆVæwF‚’&WGW&âçVÆÃ°¢&WGW&âv÷&·2æf–æB‚‡v÷&²’Óâ°¢6öç7BFW‡BÒæ÷&ÖÆ—¦U6V&6…FW‡B…°¢v÷&²æ–BÀ¢v÷&´÷F–öäÆ&VÂ‡v÷&²’À¢v÷&²æ6öF–vô÷&–v–æÂÀ¢v÷&²çF—õVæ–FFRÀ¢v÷&²ç&Vv–òÀ¢v÷&²æ6Æ76–f–66ôö'&À¢v÷&²çF—öÆöv–ö'&À¢Òæ¦ö–â‚""’“°¢&WGW&âFW&×2æWfW'’‚‡FW&Ò’ÓâFW‡Bæ–æ6ÇVFW2‡FW&Ò’“°¢Ò’ÇÂçVÆÃ°§Ð ¦gVæ7F–öâf–æEv÷&´'”W†7EG—VE6V&6‚‡fÇVRÂv÷&·2ÒFVÖæEv÷&´6FÆör‚’’°¢6öç7Bæ÷&ÖÆ—¦VBÒæ÷&ÖÆ—¦U6V&6…FW‡B‡fÇVR’çG&–Ò‚“°¢–b‚æ÷&ÖÆ—¦VB’&WGW&âçVÆÃ°¢&WGW&â€¢v÷&·2æf–æB‚‡v÷&²’Óâæ÷&ÖÆ—¦U6V&6…FW‡B‡v÷&´÷F–öäÆ&VÂ‡v÷&²’’ÓÓÒæ÷&ÖÆ—¦VB’ÇÀ¢v÷&·2æf–æB‚‡v÷&²’Óâæ÷&ÖÆ—¦U6V&6…FW‡B‡v÷&²ææöÖR’ÓÓÒæ÷&ÖÆ—¦VB’ÇÀ¢v÷&·2æf–æB‚‡v÷&²’Óâæ÷&ÖÆ—¦U6V&6…FW‡B‡v÷&²æ6†fUVæ–6ÇÂv÷&²æ6öF–vô÷&–v–æÂ’ÓÓÒæ÷&ÖÆ—¦VB¢“°§Ð ¦gVæ7F–öâ&W6öÇfUv÷&´–Dg&öÔFVÖæDf÷&Ò†f÷&ÔFFÂ²VÆ–v–&ÆTöæÇ’ÒfÇ6RÒÒ·Ò’°¢6öç7Bv÷&·2ÒVÆ–v–&ÆTöæÇ’òVÆ–v–&ÆTFVÖæEv÷&´6FÆör‚’¢FVÖæEv÷&´6FÆör‚“°¢6öç7B6VÆV7FVD–BÒf÷&ÔFFævWB‚&ö'&–B"“°¢–b‡v÷&·2ç6öÖR‚‡v÷&²’Óâ7G&–ær‡v÷&²æ–B’ÓÓÒ7G&–ær‡6VÆV7FVD–B’’’&WGW&â6VÆV7FVD–C°¢6öç7BÆöö·WfÇVW2Ò¶f÷&ÔFFævWB‚&ö'&'W66"•Ó°¢–b†f÷&ÔFFævWB‚'F—ò"’ÓÓÒ%4”2"’°¢Æöö·WfÇVW2çW6‚†f÷&ÔFFævWB‚&ö'&çVÖ&W""’Âf÷&ÔFFævWB‚&ö'&æöÖR"’ÂG¶f÷&ÔFFævWB‚&ö'&çVÖ&W""’ÇÂ"'ÒG¶f÷&ÔFFævWB‚&ö'&æöÖR"’ÇÂ"'Ö“°¢Ð¢f÷"†6öç7BfÇVRöbÆöö·WfÇVW2’°¢6öç7BW†7Ev÷&²Òf–æEv÷&´'”W†7EG—VE6V&6‚‡fÇVRÂv÷&·2“°¢–b†W†7Ev÷&²’&WGW&âW†7Ev÷&²æ–C°¢6öç7BG—VEv÷&²Òf–æEv÷&´'•G—VE6V&6‚‡fÇVRÂv÷&·2“°¢–b‡G—VEv÷&²’&WGW&âG—VEv÷&²æ–C°¢Ð¢&WGW&â"#°§Ð ¦gVæ7F–öâVç7W&TFVÖæEv÷&µW'6—7FVB‡v÷&²’°¢–b‚v÷&²’&WGW&âçVÆÃ°¢6öç7BW†—7F–ærÒ7FFRçv÷&·2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒv÷&²æ–B“°¢–b†W†—7F–ær’&WGW&âW†—7F–æs°¢–b‚v÷&²åö†—7F÷&–6Ä'VFvWEv÷&²ÇÂv÷&²æ†—7F÷&–6Å&V6÷&D–B’&WGW&âçVÆÃ° ¢6öç7B&V6÷&BÒ'&”÷$fÆÆ&6²‡7FFRæWg2’æf–æB‚†—FVÒ’Óâ7G&–ær†—FVÒæ–B’ÓÓÒ7G&–ær‡v÷&²æ†—7F÷&–6Å&V6÷&D–B’“°¢–b‚&V6÷&B’&WGW&âçVÆÃ° ¢6öç7B–BÒæW‡D6öFR‚$ô%""Â7FFRçv÷&·2“°¢6öç7BW'6—7FVBÒ7G'V7GW&VD6ÆöæR‡v÷&²“°¢W'6—7FVBæ–BÒ–C°¢W'6—7FVBç7FGW2ÒW'6—7FVBç7FGW2ÇÂ$†—7L;7&–6ò#°¢FVÆWFRW'6—7FVBåö†—7F÷&–6Ä'VFvWEv÷&³°¢FVÆWFRW'6—7FVBæ†—7F÷&–6Å&V6÷&D–C°¢&V6÷&Bçv÷&´–BÒ–C°¢7FFRçv÷&·2çVç6†–gB‡W'6—7FVB“°¢FD†—7F÷'’‡°¢VçF–FFS¢&ö'&"À¢VçF–FFT–C¢–BÀ¢6×ó¢&6öç6öÆ–F:|:6ò"À¢fÆ÷$çFW&–÷#¢–×÷'F:|:6ò†—7L;7&–6G·&V6÷&Bæ–GÖÀ¢fÆ÷$æ÷fó¢G·W'6—7FVBææöÖWÒf–æ7VÆFò6F7G&òÖW7G&VÀ¢Ò“°¢&WGW&âW'6—7FVC°§Ð ¦gVæ7F–öâ&VæFW%6–5v÷&µ6V&6…&W7VÇG2‡VW'’Ò""Â6VÆV7FVD–BÒ""’°¢6öç7B6æF–FFRÒv÷&´'”–B‡6VÆV7FVD–B“°¢6öç7B6VÆV7FVEv÷&²Ò—4FVÖæEv÷&´VÆ–v–&ÆR†6æF–FFR’ò6æF–FFR¢çVÆÃ°¢6öç7BFW&×2Òæ÷&ÖÆ—¦U6V&6…FW‡B‡VW'’’ç7Æ—B‚õÇ2²ò’æf–ÇFW"„&ööÆVâ“°¢–b‡6VÆV7FVEv÷&²’°¢&WGW&â ¢ÆF—b6Æ73Ò'6–2×v÷&²×6VÆV7FVB#à¢Ç7G&öæsâG·6VÆV7FVEv÷&²ææöÖWÓÂ÷7G&öæsà¢Ç6ÖÆÃäæó¢G¶W66TGG&–'WFR†FVÖæEv÷&µ–V"‡6VÆV7FVEv÷&²’ÇÂ$ì:6ò–æf÷&ÖFò"—ÓÂ÷6ÖÆÃà¢Ç7ãâG·6VÆV7FVEv÷&²æ6†fUVæ–6ÒÂG·6VÆV7FVEv÷&²çF—õVæ–FFWÒÂG·6VÆV7FVEv÷&²æ6–FFWÒòG·6VÆV7FVEv÷&²çVgÒÂG·6VÆV7FVEv÷&²ç&Vv–÷ÓÂ÷7ãà¢ÂöF—cà¢°¢Ð¢–b‚FW&×2æÆVæwF‚’°¢&WGW&âÇ6Æ73Ò&×WFVB#äF–v—FR'FRFòæöÖRÂ6†fRÂ6–FFRÂTbÂF—ò÷R&Vvœ:6ò&Æö6Æ—¦"ö'&Fò÷'Fl;6Æ–òãÂ÷æ°¢Ð¢6öç7B7VvvW7F–öç2Ò7FFRçv÷&·0¢æf–ÇFW"‚‡v÷&²’Óâ—4FVÖæEv÷&´VÆ–v–&ÆR‡v÷&²’bbFW&×2æWfW'’‚‡FW&Ò’Óâv÷&µ6V&6…FW‡B‡v÷&²’æ–æ6ÇVFW2‡FW&Ò’’¢ç6Æ–6RƒÂ‚“°¢–b‚7VvvW7F–öç2æÆVæwF‚’°¢&WGW&âÆF—b6Æ73Ò&V×G’×7FFR6ö×7B#äæVæ‡VÖö'&Væ6öçG&Fâfö<:¢öFR§W7F"'W66÷R6F7G&"VÖæ÷fö'&ãÂöF—cæ°¢Ð¢&WGW&â ¢ÆF—b6Æ73Ò'6–2×v÷&²×&W7VÇG2"&–ÖÆ&VÃÒ%7VvW7L;VW2FRö'&2#à¢G·7VvvW7F–öç0¢æÖ€¢‡v÷&²’Óâ ¢Æ'WGFöâG—SÒ&'WGFöâ"FFÖ7F–öãÒ'6VÆV7B×6–2×v÷&²"FFÖ–CÒ"G·v÷&²æ–GÒ#à¢Ç7G&öæsâG·v÷&²ææöÖWÓÂ÷7G&öæsà¢Ç6ÖÆÃäæó¢G¶W66TGG&–'WFR†FVÖæEv÷&µ–V"‡v÷&²’ÇÂ$ì:6ò–æf÷&ÖFò"—ÓÂ÷6ÖÆÃà¢Ç7ãâG·v÷&²æ6†fUVæ–6ÒÂG·v÷&²çF—õVæ–FFWÒÂG·v÷&²æ6–FFWÒòG·v÷&²çVgÒÂG·v÷&²ç&Vv–÷ÓÂ÷7ãà¢Âö'WGFöãà¢ ¢¢æ¦ö–â‚""—Ð¢ÂöF—cà¢Ç6Æ73Ò&×WFVB#äÖ÷7G&æFòG·7VvvW7F–öç2æÆVæwF‡Ò7VvW7L:6òG·7VvvW7F–öç2æÆVæwF‚ÓÓÒò""¢,;VW2'Ò&"G¶W66TGG&–'WFR‡VW'’—Ò"ãÂ÷à¢°§Ð ¦gVæ7F–öâWFFU6–5v÷&µ6V&6‚†–çWB’°¢6öç7Bf÷&ÒÒ–çWBæ6Æ÷6W7B‚&f÷&Ò"“°¢6öç7B†–FFVâÒf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ&ö'&–B%Òr“°¢6öç7B&W7VÇG2Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2×v÷&²×&W7VÇG5Ò"“°¢–b††–FFVâ’†–FFVâçfÇVRÒ"#°¢–b‡&W7VÇG2’&W7VÇG2æ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ‡&VæFW%6–5v÷&µ6V&6…&W7VÇG2†–çWBçfÇVR’“°§Ð ¦gVæ7F–öâ÷Vå6–4FVÖæDÖöFÂ‡v÷&´–BÒ""’°¢6öç7B6æF–FFRÒv÷&´'”–B‡v÷&´–B“°¢6öç7B6VÆV7FVEv÷&²Ò—4FVÖæEv÷&´VÆ–v–&ÆR†6æF–FFR’ò6æF–FFR¢çVÆÃ°¢6öç7B7VvvW7FVDæÇ—7BÒFVÖæDÆVDf÷%v÷&²‡6VÆV7FVEv÷&²“°¢6öç7B6VÆV7FVE7&–çBÒ7W'&VçE7&–çB‚“°¢6öç7B7VvvW7FVE6–57&–çD–G2Ò7VvvW7FVDFVÖæE7&–çD–G2‡FöF”•4ò‚’ÂFDF—4•4ò‡FöF”•4ò‚’ÂR’“°¢6öç7B6VÆV7FVDÆ&VÂÒ6VÆV7FVEv÷&²òv÷&´÷F–öäÆ&VÂ‡6VÆV7FVEv÷&²’¢"#°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&B6–2ÖFVÖæBÖ6&B"–CÒ&FVÖæDf÷&Ò"&–ÖÆ&VÆÆVF'“Ò&FVÖæEF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#äæ÷fFVÖæFÂ÷7ãà¢Æƒ"–CÒ&FVÖæEF—FÆR#å4”2Ò6öÆ–6—F:|:6òFR–æf÷&Ö:|:6òF6öçG&FFÂöƒ#à¢Ç6Æ73Ò&×WFVB#ä'W7VRVÖö'&÷&ö¦WFòW†—7FVçFR÷R6F7G&RVÖæ÷fö'&çFW2FR6Çf"FVÖæFæò¶æ&âRVçfœ:ÖÆ&&÷f:|:6òãÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâFVÖæBÖæÇ—7B×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäæÆ—7F2FFVÖæFÂ÷7ãà¢ÂöF—cà¢G¶æÇ—7D6†—÷F–öç2‡²æÆ—7F&W7öç6fVÃ¢7VvvW7FVDæÇ—7BÒ—Ð¢Â÷6V7F–öãà¢ÆF—b6Æ73Ò&f–VÆBÖöFÂ×6V7F–öâ#à¢Ç7ãå7&–çG3Â÷7ãà¢G·7&–çD6†V6¶&÷†W2‡7VvvW7FVE6–57&–çD–G2æÆVæwF‚ò7VvvW7FVE6–57&–çD–G2¢6VÆV7FVE7&–çCòæ–Bò·6VÆV7FVE7&–çBæ–EÒ¢µÒ—Ð¢Ç6ÖÆÂ6Æ73Ò&×WFVB"FF×7&–çBÖWFòÖ†–çCâG·6VÆV7FVE7&–çBòG¶FFUFW‡B‡6VÆV7FVE7&–çBæFF–æ–6–ò—Ò(i"G¶FFUFW‡B‡6VÆV7FVE7&–çBæFFf–Ò—Ö¢%6VÒW,:ÖöFòf–æ7VÆFò'Òâò§W7F"VçG&Vv&Wf—7FÂ6W,:6ò7VvW&–F227&–çG2FòW,:ÖöFòãÂ÷6ÖÆÃà¢ÂöF—cà¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ6–2×v÷&²ÖÆ–æ²×æVÂ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆRv—F‚Ö7F–öâ#à¢Ç7ãå&ö¦WFòòö'&f–æ7VÆFÂ÷7ãà¢Æ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ6ö×7BÖ7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&÷Vâ×v÷&²Ög&öÒ×6–2#â²6F7G&"æ÷fö'&Âö'WGFöãà¢ÂöF—cà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&ö'&–B"fÇVSÒ"G·6VÆV7FVEv÷&³òæ–BÇÂ"'Ò"óà¢ÆÆ&VÂ6Æ73Ò&f–VÆB6–2×v÷&²×6V&6‚Öf–VÆB#à¢Ç7ãä76—7FVçFRFR'W66FRö'&3Â÷7ãà¢Æ–çWBæÖSÒ&ö'&'W66"FF×6–2×v÷&²×6V&6‚fÇVSÒ"G¶W66TGG&–'WFR‡6VÆV7FVDÆ&VÂ—Ò"Æ6V†öÆFW#Ò$'W66"÷"æöÖRÂ6†fRÂ6–FFRÂTbÂF—ò÷R&Vvœ:6òâââ"WFö6ö×ÆWFSÒ&öfb"&WV—&VBóà¢ÂöÆ&VÃà¢ÆF—bFF×6–2×v÷&²×&W7VÇG3à¢G·&VæFW%6–5v÷&µ6V&6…&W7VÇG2‡6VÆV7FVDÆ&VÂÂ6VÆV7FVEv÷&³òæ–BÇÂ""—Ð¢ÂöF—cà¢Ç6Æ73Ò&×WFVB#äò6Çf"Âò6&BVçG&æò¶æ&âFRö'&2f–æ7VÆFò:ö'&6VÆV6–öæFãÂ÷à¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ6–2Öf–VÆG2×æVÂ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#à¢Ç7ãäFF÷2F4”3Â÷7ãà¢ÂöF—cà¢ÆF—b6Æ73Ò&f÷&ÒÖw&–B#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäì+¢FòÄT4ôÒ£Â÷7ãà¢Æ–çWBæÖSÒ&ÆV6öÔçVÖ&W""Æ6V†öÆFW#Ò$W‚ã¢ã3ƒ’ã##’"WFö6ö×ÆWFSÒ&öfb"&WV—&VBóà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåL:×GVÆòF4”2£Â÷7ãà¢Æ–çWBæÖSÒ'F—GVÆõ6–2"Æ6V†öÆFW#Ò$W‚ã¢§W7FRFRW66÷ò6öÆ–6—FFòVÆ6öçG&FF"&WV—&VBóà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäì+¢F4”3Â÷7ãà¢Æ–çWBæÖSÒ&çVÖW&õ6–2"Æ6V†öÆFW#Ò$W‚ã¢4”2Ó÷R<;6F–vòF6öçG&FF"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆBgVÆÂ×7â#à¢Ç7ãäFW67&œ:|:6òF4”2£Â÷7ãà¢ÇFW‡F&VæÖSÒ&FW67&–6ò"&WV—&VBÆ6V†öÆFW#Ò$FW67&Wf6öÆ–6—F:|:6òÂ6öçFW‡FòÂ–×7FòW7W&FòRVæ6Ö–æ†ÖVçFòæV6W7<:&–òâââ#ãÂ÷FW‡F&Và¢ÂöÆ&VÃà¢ÂöF—cà¢ÆÆ&VÂ6Æ73Ò'6–2ÖVæv–æVW&–ærÖÖVWF–ær×FövvÆR#à¢Æ–çWBæÖSÒ'6–4Væv–æVW&–ætÖVWF–ær"G—SÒ&6†V6¶&÷‚"óà¢Ç7ããÇ7G&öæsä6ö'&FòVÒ&WVæœ:6óÂ÷7G&öæsãÇ6ÖÆÃäÖ'VRVæFò6ÆL:–6æ–6W7F—fW"6VæFò6ö'&F÷"W7F4”2VÒ&WVæœ:6òãÂ÷6ÖÆÃãÂ÷7ãà¢ÂöÆ&VÃà¢Â÷6V7F–öãà ¢ÆF—b6Æ73Ò&f÷&ÒÖw&–B#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåF—óÂ÷7ãà¢Ç6VÆV7BæÖSÒ'F—ò"–CÒ&FVÖæEG—R#à¢Æ÷F–öâfÇVSÒ%4”2#å4”2Ò6öÆ–6—F:|:6òFR–æf÷&Ö:|:6òF6öçG&FFÂö÷F–öãà¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãå&–÷&–FFSÂ÷7ãà¢Ç6VÆV7BæÖSÒ'&–÷&–FFR#à¢Æ÷F–öãäÇFÂö÷F–öãà¢Æ÷F–öãäÜ:–F–Âö÷F–öãà¢Æ÷F–öãä&—†Âö÷F–öãà¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäVçG&Vv&Wf—7FÂ÷7ãà¢Æ–çWBæÖSÒ&FF&Wf—7FVçG&Vv"G—SÒ&FFR"fÇVSÒ"G¶FDF—4•4ò‡FöF”•4ò‚’ÂR—Ò"&WV—&VBóà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäÖ÷F—fóÂ÷7ãà¢Ç6VÆV7BæÖSÒ&Ö÷F—fò#à¢G·6–4Ö÷F—fô÷F–öç2‚%&Wf—6õ&ö¦WFò"—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢G·&VæFW$FVÖæDÆ&VÇ4f–VÆB‚—Ð¢ÂöF—cà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'7V&Ö—BÖFVÖæBÖf÷&Ò#å6Çf"FVÖæFÂö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâF—66—Æ–æU&÷uFV×ÆFR‚’°¢&WGW&â ¢ÆF—b6Æ73Ò&F—66—Æ–æR×&÷r#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäF—66—Æ–æÂ÷7ãà¢Ç6VÆV7BæÖSÒ&F—66—Æ–æ–B#à¢Æ÷F–öâfÇVSÒ"#å6VÆV6–öæ#Âö÷F–öãà¢G¶6öæf–wW&VDF—66—Æ–æW2‡²–æ6ÇVFT–æ7F—fS¢fÇ6RÒ¢æf–ÇFW"‚†F—66—Æ–æR’ÓâF—66—Æ–æRç6VÆV6–öæfVÅ&4”2¢æÖ‚†F—66—Æ–æR’ÓâÆ÷F–öâfÇVSÒ"G¶F—66—Æ–æRæ–GÒ#âG¶F—66—Æ–æRç÷6–6÷ÒâG¶F—66—Æ–æRææöÖWÓÂö÷F–öãæ¢æ¦ö–â‚""—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåfÆ÷"FVÇFÂ÷7ãà¢Æ–çWBæÖSÒ'fÆ÷$FVÇF"–çWFÖöFSÒ&FV6–ÖÂ"Æ6V†öÆFW#Ò#Ã"óà¢ÂöÆ&VÃà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ%&VÖ÷fW"F—66—Æ–æ"FFÖ7F–öãÒ'&VÖ÷fRÖF—66—Æ–æR×&÷r#ì9sÂö'WGFöãà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ6–4G&gDF—66—Æ–æU&÷uFV×ÆFR†—FVÒÒ·Ò’°¢&WGW&â ¢ÆF—b6Æ73Ò&F—66—Æ–æR×&÷r6–2ÖG&gB×&÷r#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäF—66—Æ–æÂ÷7ãà¢Ç6VÆV7BæÖSÒ'6–4G&gDF—66—Æ–æ–B#à¢Æ÷F–öâfÇVSÒ"#å6VÆV6–öæ#Âö÷F–öãà¢G¶6öæf–wW&VDF—66—Æ–æW2‡²–æ6ÇVFT–æ7F—fS¢fÇ6RÒ¢æf–ÇFW"‚†F—66—Æ–æR’ÓâF—66—Æ–æRç6VÆV6–öæfVÅ&4”2¢æÖ‚†F—66—Æ–æR’ÓâÆ÷F–öâfÇVSÒ"G¶F—66—Æ–æRæ–GÒ"G¶F—66—Æ–æRæ–BÓÓÒ—FVÒæF—66—Æ–æ–Bò'6VÆV7FVB"¢"'ÓâG¶F—66—Æ–æRç÷6–6÷ÒâG¶F—66—Æ–æRææöÖWÓÂö÷F–öãæ¢æ¦ö–â‚""—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåfÆ÷"FVÇFÂ÷7ãà¢Æ–çWBæÖSÒ'6–4G&gEfÆ÷$FVÇF"–çWFÖöFSÒ&FV6–ÖÂ"fÇVSÒ"G¶—FVÒçfÆ÷$FVÇFò7W'&Væ7”–çWEfÇVR†—FVÒçfÆ÷$FVÇF’¢"'Ò"Æ6V†öÆFW#Ò#Ã"óà¢ÂöÆ&VÃà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ%&VÖ÷fW"F—66—Æ–æ"FFÖ7F–öãÒ'&VÖ÷fR×6–2ÖG&gB×&÷r#ì9sÂö'WGFöãà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VæFW%6–4G&gDF—66—Æ–æTVF—F÷"†FVÖæB’°¢–b‚†FVÖæBç6–4–G2ÇÂµÒ’æÆVæwF‚’&WGW&â"#°¢6öç7B&÷w2Ò†FVÖæBç6–4G&gDF—66—Æ–æW2ÇÂµÒ’æÆVæwF‚òFVÖæBç6–4G&gDF—66—Æ–æW2¢·²F—66—Æ–æ–C¢""ÂfÆ÷$FVÇF¢ÕÓ°¢&WGW&â ¢ÆF—b6Æ73Ò'6–2ÖG&gBÖVF—F÷"#à¢Ç7ãäF—66—Æ–æ2&÷7FvVÒæòUcÂ÷7ãà¢ÆF—bFF×6–2ÖG&gB×&÷w3à¢G·&÷w2æÖ‚†—FVÒ’Óâ6–4G&gDF—66—Æ–æU&÷uFV×ÆFR†—FVÒ’’æ¦ö–â‚""—Ð¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&FB×6–2ÖG&gB×&÷r#äF–6–öæ"F—66—Æ–æÂö'WGFöãà¢ÂöF—cà¢°§Ð ¦gVæ7F–öâ&VE6–4G&gDF—66—Æ–æW4g&öÔf÷&Ò†f÷&Ò’°¢–b‚f÷&Ò’&WGW&âµÓ°¢&WGW&â²ââæf÷&ÒçVW'•6VÆV7F÷$ÆÂ‚"ç6–2ÖG&gB×&÷r"•Ð¢æÖ‚‡&÷r’Óâ‡°¢F—66—Æ–æ–C¢&÷rçVW'•6VÆV7F÷"‚u¶æÖSÒ'6–4G&gDF—66—Æ–æ–B%Òr“òçfÇVRÇÂ""À¢fÆ÷$FVÇF¢'6T7W'&Væ7’‡&÷rçVW'•6VÆV7F÷"‚u¶æÖSÒ'6–4G&gEfÆ÷$FVÇF%Òr“òçfÇVRÇÂ""’À¢Ò’¢æf–ÇFW"‚†—FVÒ’Óâ—FVÒæF—66—Æ–æ–BÇÂ—FVÒçfÆ÷$FVÇF“°§Ð ¦gVæ7F–öâ÷Vä6öçG&7DÖöFÂ‚’°¢6öç7Bv÷&²Òv÷&´'”–B‡6VÆV7FVEv÷&´–B’ÇÂ7FFRçv÷&·5³Ó°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&B"–CÒ&6öçG&7Df÷&Ò"&–ÖÆ&VÆÆVF'“Ò&6öçG&7EF—FÆR#à¢Æ†VFW#à¢Æƒ"–CÒ&6öçG&7EF—FÆR#äæ÷f6öçG&F:|:6óÂöƒ#à¢Ç6Æ73Ò&×WFVB#ä6öçG&Fòf–æ7VÆFò:ö'&ÂF—66—Æ–æRf÷&æV6VF÷"ãÂ÷à¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢ÆF—b6Æ73Ò&f÷&ÒÖw&–B#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäö'&Â÷7ãà¢Ç6VÆV7BæÖSÒ&ö'&–B"&WV—&VBFFÖ7F–öãÒ&6öçG&7B×v÷&²×6VÆV7B#à¢G·7FFRçv÷&·2æÖ‚†—FVÒ’ÓâÆ÷F–öâfÇVSÒ"G¶—FVÒæ–GÒ"G¶—FVÒæ–BÓÓÒv÷&²æ–Bò'6VÆV7FVB"¢"'ÓâG¶W66TGG&–'WFR†G¶—FVÒææöÖWÒÂG·v÷&µ6V&6…–V%FW‡B†—FVÒ—Ö—ÓÂö÷F–öãæ’æ¦ö–â‚""—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäF—66—Æ–æÂ÷7ãà¢Ç6VÆV7BæÖSÒ&F—66—Æ–æ–B"&WV—&VB–CÒ&6öçG&7DF—66—Æ–æU6VÆV7B#à¢G¶6öçG&7DF—66—Æ–æT÷F–öç2‡v÷&²æ–B—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäf÷&æV6VF÷#Â÷7ãà¢Ç6VÆV7BæÖSÒ&f÷&æV6VF÷$–B"&WV—&VCà¢G·7FFRç7WÆ–W'2æÖ‚‡7WÆ–W"’ÓâÆ÷F–öâfÇVSÒ"G·7WÆ–W"æ–GÒ#âG·7WÆ–W"ç&¦õ6ö6–ÇÓÂö÷F–öãæ’æ¦ö–â‚""—Ð¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãåfÆ÷#Â÷7ãà¢Æ–çWBæÖSÒ'fÆ÷""–çWFÖöFSÒ&FV6–ÖÂ"&WV—&VBÆ6V†öÆFW#Ò#Ã"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãäì;¦ÖW&òFò6öçG&FóÂ÷7ãà¢Æ–çWBæÖSÒ&çVÖW&ô6öçG&Fò"fÇVSÒ"G¶æW‡D6öçG&7DçVÖ&W"‚—Ò"&WV—&VBóà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãå&W7öç<:fVÂ7W&–ÖVçF÷3Â÷7ãà¢Æ–çWBæÖSÒ'&W7öç6fVÅ7W&–ÖVçF÷2"fÇVSÒ$6&ÆçVæW2"&WV—&VBóà¢ÂöÆ&VÃà¢ÂöF—cà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#å6Çf"6öçG&F:|:6óÂö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ6öçG&7DF—66—Æ–æT÷F–öç2‡v÷&´–B’°¢6öç7Bv÷&²Òv÷&´'”–B‡v÷&´–B’ÇÂ7FFRçv÷&·5³Ó°¢&WGW&âv÷&²æWbæÆ–æW0¢æf–ÇFW"‚†Æ–æR’ÓâF—66—Æ–æT'”–B†Æ–æRæF—66—Æ–æ–B’ç6VÆV6–öæfVÅ&4”2¢æÖ‚†Æ–æR’ÓâÆ÷F–öâfÇVSÒ"G¶Æ–æRæF—66—Æ–æ–GÒ#âG¶F—66—Æ–æT'”–B†Æ–æRæF—66—Æ–æ–B’ææöÖWÓÂö÷F–öãæ¢æ¦ö–â‚""“°§Ð ¦gVæ7F–öâ'6T7W'&Væ7’‡fÇVR’°¢6öç7Bæ÷&ÖÆ—¦VBÒ7G&–ær‡fÇVRÇÂ""¢ç&WÆ6R‚õÂâörÂ""¢ç&WÆ6R‚"Â"Â"â"¢ç&WÆ6R‚õµåÆBâÕÒörÂ""“°¢6öç7B'6VBÒçVÖ&W"†æ÷&ÖÆ—¦VB“°¢&WGW&âçVÖ&W"æ—4f–æ—FR‡'6VB’ò'6VB¢°§Ð ¦ÆWBGF6†ÖVçDF%&öÖ—6RÒçVÆÃ° ¦gVæ7F–öâGF6†ÖVçE&V6÷&D–B‚’°¢&WGW&âEBÒG¶vÆö&ÅF†—2æ7'—Fóòç&æFöÕUT”Còâ‚’ÇÂG´FFRææ÷r‚—ÒÒG´ÖF‚ç&æFöÒ‚’çFõ7G&–ærƒ3b’ç6Æ–6Rƒ"—ÖÖ°§Ð ¦7–æ2gVæ7F–öâ6fTGF6†ÖVçE&V6÷&B‡&V6÷&B’°¢6öç7BÖöGVÆW2Ò²&ö¦V7G3¢'&ö¦V7G2"Âv÷&·3¢&'VFvWB"ÂÖ–çFVææ6S¢&Ö–çFVææ6R"Â6Æ–æ–6Ã¢&6Æ–æ–6Â"Â'VFvWC¢&f–ææ6R"Ó°¢&WGW&âvÆö&ÅF†—2å4ÅEô4ÄõTBç6fTGF6†ÖVçB‡²ââç&V6÷&BÂÖöGVÆS¢ÖöGVÆW5·f–WtÖöGVÆR†7W'&VçEf–Wr•ÒÇÂ&'VFvWB"Ò“°§Ð ¦7–æ2gVæ7F–öâ&VDGF6†ÖVçE&V6÷&B†–B’°¢&WGW&âvÆö&ÅF†—2å4ÅEô4ÄõTBç&VDGF6†ÖVçB†–B“°§Ð ¦7–æ2gVæ7F–öâ7F÷&TGF6†ÖVçDf–ÆR†f–ÆRÂ6öçFW‡BÒ·Ò’°¢6öç7B–BÒGF6†ÖVçE&V6÷&D–B‚“°¢6öç7BÖWFFFÒ°¢–BÀ¢æöÖS¢f–ÆRææÖRÀ¢FÖæ†ó¢f–ÆRç6—¦RÀ¢F—ó¢f–ÆRçG—RÇÂ&'V—fò"À¢FF¢FöF”•4ò‚’À¢7F÷&vS¢&–æFW†VDD""À¢ââæ6öçFW‡BÀ¢Ó°¢v—B6fTGF6†ÖVçE&V6÷&B‡²ââæÖWFFFÂ&Æö#¢f–ÆRÒ“°¢&WGW&âÖWFFF°§Ð ¦7–æ2gVæ7F–öâf–ÆTGF6†ÖVçDÖWFFF†–çWBÂ6öçFW‡BÒ·Ò’°¢6öç7Bf–ÆW2Ò²âââ†–çWCòæf–ÆW2ÇÂµÒ•Ó°¢–b‚f–ÆW2æÆVæwF‚’&WGW&âµÓ°¢&WGW&â&öÖ—6RæÆÂ†f–ÆW2æÖ‚†f–ÆR’Óâ7F÷&TGF6†ÖVçDf–ÆR†f–ÆRÂ6öçFW‡B’’“°§Ð ¦gVæ7F–öâVæ—VTGF6†ÖVçG2†f–ÆW2ÒµÒ’°¢&WGW&â²ââææWrÖ†f–ÆW2æf–ÇFW"„&ööÆVâ’æÖ‚†f–ÆR’Óâ¶f–ÆRæ–BÇÂG¶f–ÆRææöÖW×ÂG¶f–ÆRçFÖæ†÷ÖÂf–ÆUÒ’’çfÇVW2‚•Ó°§Ð ¦gVæ7F–öâ&VæFW$GF6†ÖVçD6†—†f–ÆR’°¢6öç7BæÖRÒf–ÆSòææöÖRÇÂf–ÆSòææÖRÇÂ$'V—fò#°¢6öç7B6—¦RÒf÷&ÖDf–ÆU6—¦R†f–ÆSòçFÖæ†òÇÂf–ÆSòç6—¦R“°¢–b†f–ÆSòæ–B’°¢&WGW&â ¢Æ'WGFöâ6Æ73Ò&GF6†ÖVçBÖ6†—"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&F÷væÆöBÖGF6†ÖVçB"FFÖGF6†ÖVçBÖ–CÒ"G¶W66TGG&–'WFR†f–ÆRæ–B—Ò"F—FÆSÒ$&—†"G¶W66TGG&–'WFR†æÖR—Ò#à¢Ç7ãâG¶W66TGG&–'WFR†æÖR—ÓÂ÷7ãà¢Ç6ÖÆÃâG·6—¦WÓÂ÷6ÖÆÃà¢Âö'WGFöãà¢°¢Ð¢&WGW&â ¢Ç7â6Æ73Ò&GF6†ÖVçBÖ6†——2×Væf–Æ&ÆR"F—FÆSÒ$æW†òçF–vò6VÒ'V—fò6ÇfòÆö6ÆÖVçFRâ&VæW†Rò'V—fò&†&–Æ—F"ò6W76òâ#à¢Ç7ãâG¶W66TGG&–'WFR†æÖR—ÓÂ÷7ãà¢Ç6ÖÆÃâG·6—¦WÒ+r–æF—7öì:×fVÃÂ÷6ÖÆÃà¢Â÷7ãà¢°§Ð ¦gVæ7F–öâ&VæFW$GF6†ÖVçDÆ—7B†f–ÆW2ÒµÒÂV×G•FW‡BÒ$æVæ‡VÒ'V—fòæW†Fòâ"’°¢6öç7BGF6†ÖVçG2ÒVæ—VTGF6†ÖVçG2†f–ÆW2“°¢–b‚GF6†ÖVçG2æÆVæwF‚’&WGW&âÇ6Æ73Ò&×WFVB#âG¶V×G•FW‡GÓÂ÷æ°¢&WGW&âÆF—b6Æ73Ò&GF6†ÖVçBÖÆ—7B#âG¶GF6†ÖVçG2æÖ‡&VæFW$GF6†ÖVçD6†—’æ¦ö–â‚""—ÓÂöF—cæ°§Ð ¦7–æ2gVæ7F–öâF÷væÆöE7F÷&VDGF6†ÖVçB†–B’°¢–b‚–B’°¢6†÷uFö7B‚$W7FRæW†òçF–vòì:6òFVÒ'V—fò6Çfòâ&VæW†R&†&–Æ—F"ò6W76òâ"“°¢&WGW&ã°¢Ð¢G'’°¢6öç7B&V6÷&BÒv—B&VDGF6†ÖVçE&V6÷&B†–B“°¢6öç7B&Æö"Ò&V6÷&Còæ&Æö#°¢–b‚&V6÷&BÇÂ&Æö"’°¢6†÷uFö7B‚$'V—fòì:6òVæ6öçG&Fòæò&Ö¦VæÖVçFòÆö6Ââ&VæW†Rò'V—fòæW7FR6&Bâ"“°¢&WGW&ã°¢Ð¢6öç7BW&ÂÒU$Âæ7&VFTö&¦V7EU$Â†&Æö"“°¢6öç7BÆ–æ²ÒFö7VÖVçBæ7&VFTVÆVÖVçB‚&"“°¢Æ–æ²æ‡&VbÒW&Ã°¢Æ–æ²æF÷væÆöBÒ&V6÷&BææöÖRÇÂ&'V—fò#°¢Fö7VÖVçBæ&öG’æVæD6†–ÆB†Æ–æ²“°¢Æ–æ²æ6Æ–6²‚“°¢Æ–æ²ç&VÖ÷fR‚“°¢6WEF–ÖV÷WB‚‚’ÓâU$Âç&Wfö¶Tö&¦V7EU$Â‡W&Â’Â“°¢Ò6F6‚†W'&÷"’°¢6öç6öÆRçv&â‚$fÆ†ò6W76"æW†òâ"ÂW'&÷"“°¢6†÷uFö7B‚$ì:6ò6öç6VwV’6W76"òæW†ò6ÇfòæW7FRæfVvF÷"â"“°¢Ð§Ð ¦gVæ7F–öâf÷&ÖDf–ÆU6—¦R†'—FW2’°¢6öç7BfÇVRÒçVÖ&W"†'—FW2ÇÂ“°¢–b‚fÇVR’&WGW&â#´"#°¢–b‡fÇVRÂ#B¢#B’&WGW&âG¶çVÖ&W"‡fÇVRò#BÂ—Ò´&°¢&WGW&âG¶çVÖ&W"‡fÇVRòƒ#B¢#B’Â—ÒÔ&°§Ð ¦gVæ7F–öâ6†÷tf÷&ÔW'&÷"†ÖW76vRÂf÷&ÒÒçVÆÂ’°¢6öç7B&÷‚Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FFÖf÷&ÒÖW'&÷%ÒÂ6f÷&ÔW'&÷""’ÇÂFö7VÖVçBçVW'•6VÆV7F÷"‚"6f÷&ÔW'&÷""“°¢–b‚&÷‚’°¢6†÷uFö7B†ÖW76vR“°¢&WGW&ã°¢Ð¢†FV57—7FVÔæ÷F–6R†ÖW76vRÂ&W'&÷%öÆW'B"“°¢&÷‚çFW‡D6öçFVçBÒÖW76vS°¢&÷‚æ6Æ74Æ—7BæFB‚&—2×f—6–&ÆR"“°¢Fö7BçFW‡D6öçFVçBÒÖW76vS°¢Fö7Bæ6Æ74Æ—7BæFB‚&—2×f—6–&ÆR"“°¢6WEF–ÖV÷WB‚‚’ÓâFö7Bæ6Æ74Æ—7Bç&VÖ÷fR‚&—2×f—6–&ÆR"’Â#c“°¢6öç7BÖöFÄ&öG’Ò&÷‚æ6Æ÷6W7Còâ‚"æÖöFÂÖ&öG’"“°¢ÖöFÄ&öG“òç67&öÆÅFóòâ‡²F÷¢ÖF‚æÖ‚‚†&÷‚æöfg6WEF÷ÇÂ’Ò#Â’Â&V†f–÷#¢'6Öö÷F‚"Ò“°¢&÷‚ç67&öÆÄ–çFõf–Wsòâ‡²&Æö6³¢&6VçFW""Â&V†f–÷#¢'6Öö÷F‚"Ò“°§Ð ¦gVæ7F–öâf–VÆDÆ&VÄf÷%fÆ–FF–öâ†f–VÆB’°¢6öç7BÆ&VÅFW‡BÒf–VÆBæ6Æ÷6W7Còâ‚&Æ&VÂ"“òçVW'•6VÆV7F÷"‚'7â"“òçFW‡D6öçFVçBÇÂf–VÆBævWDGG&–'WFSòâ‚&&–ÖÆ&VÂ"’ÇÂf–VÆBææÖRÇÂ&6×òö'&–vL;7&–ò#°¢&WGW&â6ÆVä–×÷'FVEFW‡B†Æ&VÅFW‡B’ç&WÆ6R‚õÇ2¥Â¥Ç2¢BòÂ""’çG&–Ò‚’ÇÂ&6×òö'&–vL;7&–ò#°§Ð ¦gVæ7F–öâæF—fUfÆ–FF–öäÖW76vR†f–VÆB’°¢6öç7BÆ&VÂÒf–VÆDÆ&VÄf÷%fÆ–FF–öâ†f–VÆB“°¢–b†f–VÆBçfÆ–F—G“òçfÇVTÖ—76–ær’&WGW&â÷Âì:6òW7VV6W"FR&VVæ6†W"G¶Æ&VÇÒâW76R6×ò:’ö'&–vL;7&–òçFW2FR6Çf"æ°¢–b†f–VÆBçfÆ–F—G“òçG—TÖ—6ÖF6‚’&WGW&â&Wf—6Ròf÷&ÖFòFRG¶Æ&VÇÒâ&V6RVRÆwVÒFFòFVçF÷R6—"VÆFævVçFRV’æ°¢–b†f–VÆBçfÆ–F—G“òçGFW&äÖ—6ÖF6‚’&WGW&â&Wf—6RG¶Æ&VÇÒâòf÷&ÖFò–æf÷&ÖFòì:6òW7L:æòG,:6òW7W&Fòæ°¢–b†f–VÆBçfÆ–F—G“òç&ævUVæFW&fÆ÷rÇÂf–VÆBçfÆ–F—G“òç&ævT÷fW&fÆ÷r’&WGW&â&Wf—6RG¶Æ&VÇÒâòfÆ÷"f–6÷Rf÷&FòÆ–Ö—FRW7W&Fòæ°¢&WGW&â&Wf—6RG¶Æ&VÇÒçFW2FR6Çf"æ°§Ð ¦gVæ7F–öâ6Æ÷6TÖöFÂ‚’°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ‚""“°§Ð ¦gVæ7F–öâ6†÷uFö7B†ÖW76vR’°¢Fö7Bæ6Æ74Æ—7Bç&VÖ÷fR‚&—2Ö&æ²×6fVB"“°¢Fö7Bç&VÖ÷fTGG&–'WFR‚&FFÖ&æ²×6fVBÖÖW76vR"“°¢Fö7BçFW‡D6öçFVçBÒÖW76vS°¢Fö7Bæ6Æ74Æ—7BæFB‚&—2×f—6–&ÆR"“°¢6öç7B†FV4f6RÒ†FV4f6Tf÷%7—7FVÔÖW76vR†ÖW76vR“°¢–b††FV4f6R’†FV57—7FVÔæ÷F–6R†ÖW76vRÂ†FV4f6R“°¢6WEF–ÖV÷WB‚‚’ÓâFö7Bæ6Æ74Æ—7Bç&VÖ÷fR‚&—2×f—6–&ÆR"’Â#c“°§Ð ¦gVæ7F–öâ6†÷t&æµ6fVD6öæf—&ÖF–öâ†ÖW76vRÒ$ÇFW&:|:6ò6Çfæò&æ6òâ"’°¢6öç7B7W'&VçDÖW76vRÒ7G&–ær‡Fö7BçFW‡D6öçFVçBÇÂ""’çG&–Ò‚“°¢–b‡Fö7Bæ6Æ74Æ—7Bæ6öçF–ç2‚&—2×f—6–&ÆR"’bb7W'&VçDÖW76vR’°¢–b‚õÅÆ&&æ6õÅÆ"ö’çFW7B†7W'&VçDÖW76vR’’°¢Fö7BæFF6WBæ&æµ6fVDÖW76vRÒ)É2G¶ÖW76vWÖ°¢Fö7Bæ6Æ74Æ—7BæFB‚&—2Ö&æ²×6fVB"“°¢Ð¢&WGW&ã°¢Ð¢6†÷uFö7B†ÖW76vR“°§Ð §v–æF÷ræFDWfVçDÆ—7FVæW"‚'6ÇC3c¦&æ²×6fVB"Â†WfVçB’Óâ°¢6†÷t&æµ6fVD6öæf—&ÖF–öâ†WfVçCòæFWF–ÃòæÖW76vRÇÂ$ÇFW&:|:6ò6Çfæò&æ6òâ"“°§Ò“° ¦gVæ7F–öâWFFTUd&V&Wf–Wr†f÷&Ò’°¢–b‚f÷&Ò’&WGW&ã°¢6öç7BF÷FÇ2ÒWFFTUdw&÷WF÷FÇ2†f÷&Ò’ÇÂWdf÷&ÕF÷FÇ2†f÷&Ò“°¢6öç7Bv÷&²Òv÷&´'”–B†f÷&ÒæFF6WBçv÷&´–B“°¢6öç7B&Vg&öÔf–VÆBÒ'6T7W'&Væ7’†f÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ&Wd&VWV—fÆVçFR%Òr“òçfÇVR“°¢6öç7B&VWV—fÆVçFRÒ&Vg&öÔf–VÆBÇÂçVÖ&W"‡v÷&³òæ&VWV—fÆVçFRÇÂ’ÇÂ°¢6öç7B&Wf–WrÒf÷&ÒçVW'•6VÆV7F÷"‚%¶FFÖWbÖ&V×&Wf–WuÒ"“°¢–b‡&Wf–Wr’&Wf–WrçFW‡D6öçFVçBÒ&VWV—fÆVçFRòG¶ÖöæW’‡F÷FÇ2çF÷FÄæõ&—6²ò&VWV—fÆVçFR—ÒöÜ+&¢.(	B#°¢WFFTUd†—7F÷&–6ÄFWf–F–öäÆW'G2†f÷&Ò“°§Ð ¦gVæ7F–öâWd†—7F÷&–6ÄFWf–F–öå&VF–æw2‡v÷&²ÂfÇVW4'”F—66—Æ–æRÂ&6UF÷FÂ’°¢–b‚&6UF÷FÂ’&WGW&âµÓ°¢6öç7BG—öÆöw’ÒWd†—7F÷&–6ÅG—öÆöw”f÷%v÷&²‡v÷&²“°¢6öç7B6÷W&6RÒWd†—7F÷&–6Å6÷W&6U&V6÷&G2‚“°¢6öç7B6ÖUG—öÆöw’ÒG—öÆöw’ò6÷W&6Ræf–ÇFW"‚‡&V6÷&B’Óâ&V6÷&BçG—öÆöw’ÓÓÒG—öÆöw’’¢µÓ°¢6öç7B&Væ6†Ö&µ&V6÷&G2Ò6ÖUG—öÆöw’æÆVæwF‚ãÒ#ò6ÖUG—öÆöw’¢6÷W&6S°¢&WGW&âö&¦V7BæVçG&–W2‡fÇVW4'”F—66—Æ–æR¢æf–ÇFW"‚…¶–BÂfÇVUÒ’ÓâfÇVRâbb²'F†×&—66ò"Â'6–72"Â&÷WG&2ÖÆ–æ†2ÖWb%Òæ–æ6ÇVFW2†–B’¢æÖ‚…¶–BÂfÇVUÒ’Óâ°¢6öç7B&Væ6†Ö&²ÒWd†—7F÷&–6Ä&Væ6†Ö&²†&Væ6†Ö&µ&V6÷&G2Â–B“°¢6öç7B6†&RÒ‡fÇVRò&6UF÷FÂ’¢°¢6öç7B¥66÷&RÒ&Væ6†Ö&²ç7FDFWbâò‡6†&RÒ&Væ6†Ö&²æÖVâ’ò&Væ6†Ö&²ç7FDFWb¢°¢&WGW&â²–BÂfÇVRÂ6†&RÂ¥66÷&RÂ&Væ6†Ö&²ÂG—öÆöw“¢6ÖUG—öÆöw’æÆVæwF‚ãÒ#òG—öÆöw’¢$&6RvW&Â"Ó°¢Ò¢æf–ÇFW"‚‡&VF–ær’Óâ&VF–æræ&Væ6†Ö&²æ6÷VçBãÒ‚bbÖF‚æ'2‡&VF–ærç¥66÷&R’ãÒ"¢ç6÷'B‚†Â"’ÓâÖF‚æ'2†"ç¥66÷&R’ÒÖF‚æ'2†ç¥66÷&R’“°§Ð ¦gVæ7F–öâWd†—7F÷&–6ÄFWf–F–öäÖ&·W‡v÷&²ÂfÇVW4'”F—66—Æ–æRÂ&6UF÷FÂ’°¢6öç7B&VF–æw2ÒWd†—7F÷&–6ÄFWf–F–öå&VF–æw2‡v÷&²ÂfÇVW4'”F—66—Æ–æRÂ&6UF÷FÂ“°¢–b‚&6UF÷FÂ’&WGW&âÆF—b6Æ73Ò&WbÖFWf–F–öâÖV×G’#ãÇ7ãìø3Â÷7ããÆF—cãÇ7G&öæsä–çFVÆ–|:¦æ6–†—7L;7&–6wV&FæFòfÆ÷&W3Â÷7G&öæsãÇ6ÖÆÃå&VVæ6†2F—66—Æ–æ2&6ö×&"òUb6öÒ&6RFR####bãÂ÷6ÖÆÃãÂöF—cãÂöF—cæ°¢–b‚&VF–æw2æÆVæwF‚’&WGW&âÆF—b6Æ73Ò&WbÖFWf–F–öâÖö²#ãÇ7ãî)É3Â÷7ããÆF—cãÇ7G&öæsä6ö×÷6œ:|:6òFVçG&òFò6ö×÷'FÖVçFò†—7L;7&–6óÂ÷7G&öæsãÇ6ÖÆÃäæVæ‡VÖF—66—Æ–æ&VVæ6†–FVÇG&76"FW7f–÷2×G,:6òF&6R6ö×,:fVÂãÂ÷6ÖÆÃãÂöF—cãÂöF—cæ°¢&WGW&âÆF—b6Æ73Ò&WbÖFWf–F–öâÖ†VFW"#ãÆF—cãÇ7â6Æ73Ò&W–V'&÷r#äÆW'FW7FL:×7F–6óÂ÷7ããÆƒ3âG·&VF–æw2æÆVæwF‡ÒFW7f–òG·&VF–æw2æÆVæwF‚ÓÓÒò""¢'2'Ò6–ÖFR,ø3Âöƒ3ãÇå&Wf—6R÷2W&6VçGV—2çFW2FR6öæ6ÇV—"òUbâòÆW'F÷&–VçFì:Æ—6RRì:6ò&Æ÷VV–ò6ÇfÖVçFòãÂ÷ãÂöF—cãÇ7â6Æ73Ò'7FGW2×–ÆÂ"FF×7FGW3Ò%VæFVçFR#å&Wf—<:6ò&V6öÖVæFFÂ÷7ããÂöF—cãÆF—b6Æ73Ò&WbÖFWf–F–öâÖÆ—7B#âG·&VF–æw2æÖ‚‡&VF–ær’Óâ°¢6öç7BÆ÷vW"ÒÖF‚æÖ‚ƒÂ&VF–æræ&Væ6†Ö&²æÖVâÒ"¢&VF–æræ&Væ6†Ö&²ç7FDFWb“°¢6öç7BWW"Ò&VF–æræ&Væ6†Ö&²æÖVâ²"¢&VF–æræ&Væ6†Ö&²ç7FDFWc°¢6öç7BF—&V7F–öâÒ&VF–ærç¥66÷&Râò&6–Ö"¢&&—†ò#°¢&WGW&âÆ'F–6ÆR6Æ73Ò"G´ÖF‚æ'2‡&VF–ærç¥66÷&R’ãÒ2ò&—2Ö7&—F–6Â"¢"'Ò#ãÇ7â6Æ73Ò&WbÖFWf–F–öâ×6–vÖ#âG¶çVÖ&W"„ÖF‚æ'2‡&VF–ærç¥66÷&R’Â—Üø3Â÷7ããÆF—cãÇ7G&öæsâG¶W66TGG&–'WFR†F—66—Æ–æT'”–B‡&VF–æræ–B’ææöÖR—ÓÂ÷7G&öæsãÇ6ÖÆÃâG¶çVÖ&W"‡&VF–ærç6†&RÂ—ÒRFòUb+rG¶F—&V7F–öçÒFò–çFW'fÆòW7W&FòFRG¶çVÖ&W"†Æ÷vW"Â—ÒRG¶çVÖ&W"‡WW"Â—ÒSÂ÷6ÖÆÃãÆVÓâG·&VF–æræ&Væ6†Ö&²æ6÷VçGÒUg2FR&VfW,:¦æ6–+rG¶W66TGG&–'WFR‡&VF–ærçG—öÆöw’—Ò+rÜ:–F–G¶çVÖ&W"‡&VF–æræ&Væ6†Ö&²æÖVâÂ—ÒSÂöVÓãÂöF—cãÂö'F–6ÆSæ°¢Ò’æ¦ö–â‚""—ÓÂöF—cæ°§Ð ¦gVæ7F–öâWdf÷&ÔFWf–F–öäFF†f÷&Ò’°¢6öç7BfÇVW2Ò·Ó°¢f÷&ÓòçVW'•6VÆV7F÷$ÆÂ‚"æWbÖÆ–æR×&÷r"’æf÷$V6‚‚‡&÷r’Óâ°¢6öç7B–BÒ&÷ræFF6WBæF—66—Æ–æT–C°¢6öç7B7FGW2Òæ÷&ÖÆ—¦TUdÆ–æU7FGW2‡&÷rçVW'•6VÆV7F÷"‚"æWb×7FGW2×6VÆV7B"“òçfÇVR“°¢6öç7BfÇVRÒ7FGW2ÓÓÒ$ì:6ò6RÆ–6"ò¢'6T7W'&Væ7’‡&÷rçVW'•6VÆV7F÷"‚"æWb×fÇVRÖ–çWB"“òçfÇVR“°¢fÇVW5¶–EÒÒ‡fÇVW5¶–EÒÇÂ’²fÇVS°¢Ò“°¢6öç7BF÷FÇ2ÒWdf÷&ÕF÷FÇ2†f÷&Ò“°¢&WGW&â²fÇVW2Â&6UF÷FÃ¢F÷FÇ2çF÷FÄæõ&—6²Ó°§Ð ¦gVæ7F–öâWFFTUd†—7F÷&–6ÄFWf–F–öäÆW'G2†f÷&Ò’°¢6öç7BæVÂÒf÷&ÓòçVW'•6VÆV7F÷"‚%¶FFÖWbÖFWf–F–öâ×æVÅÒ"“°¢–b‚æVÂ’&WGW&ã°¢6öç7Bv÷&²Òv÷&´'”–B†f÷&ÒæFF6WBçv÷&´–B“°¢6öç7B²fÇVW2Â&6UF÷FÂÒÒWdf÷&ÔFWf–F–öäFF†f÷&Ò“°¢æVÂæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ†Wd†—7F÷&–6ÄFWf–F–öäÖ&·W‡v÷&²ÂfÇVW2Â&6UF÷FÂ’“°§Ð ¦gVæ7F–öâ6†÷tUd†FV46öæf—&ÖF–öâ†f÷&ÒÂÖöFRÂ&VF–æw2’°¢Fö7VÖVçBçVW'•6VÆV7F÷"‚%¶FFÖWbÖ†FV2Ö6öæf—&ÕÒ"“òç&VÖ÷fR‚“°¢6öç7B7&—F–6ÂÒ&VF–æw2æf–ÇFW"‚‡&VF–ær’ÓâÖF‚æ'2‡&VF–ærç¥66÷&R’ãÒ2’æÆVæwFƒ°¢6öç7B÷fW&Æ’ÒFö7VÖVçBæ7&VFTVÆVÖVçB‚&F—b"“°¢÷fW&Æ’æ6Æ74æÖRÒ&WbÖ†FV2Ö6öæf—&ÒÖ&6¶G&÷#°¢÷fW&Æ’æFF6WBæWd†FV46öæf—&ÒÒ'G'VR#°¢÷fW&Æ’æ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢Æ'F–6ÆR6Æ73Ò&WbÖ†FV2Ö6öæf—&ÒÖ6&B"&öÆSÒ&F–Æör"&–ÖÖöFÃÒ'G'VR"&–ÖÆ&VÆÆVF'“Ò&Wd†FV46öæf—&ÕF—FÆR#à¢Æ†VFW#à¢ÆF—b6Æ73Ò&WbÖ†FV2ÖfF"#ãÇ7ãâÂ÷7ããÂöF—cà¢ÆF—cãÇ7â6Æ73Ò&W–V'&÷r#å7W÷'FS3c+rfÆ–F:|:6ò†—7L;7&–6Â÷7ããÆƒ"–CÒ&Wd†FV46öæf—&ÕF—FÆR#äfW&–wVR÷2fÆ÷&W2çFW2FR6öæf—&Ö#Âöƒ#ãÇäW7FRUb÷77V’G·&VF–æw2æÆVæwF‡ÒF—66—Æ–æG·&VF–æw2æÆVæwF‚ÓÓÒò""¢'2'Òf÷&Ff—††—7L;7&–6G¶7&—F–6ÂòÂ6VæFòG¶7&—F–6ÇÒ7,:×F–6G¶7&—F–6ÂÓÓÒò""¢'2'Ö¢"'ÒãÂ÷ãÂöF—cà¢Âö†VFW#à¢ÆF—b6Æ73Ò&WbÖ†FV2Ö6öæf—&ÒÖÆ—7B#à¢G·&VF–æw2ç6Æ–6RƒÂb’æÖ‚‡&VF–ær’Óâ°¢6öç7BÆ÷vW"ÒÖF‚æÖ‚ƒÂ&VF–æræ&Væ6†Ö&²æÖVâÒ"¢&VF–æræ&Væ6†Ö&²ç7FDFWb“°¢6öç7BWW"Ò&VF–æræ&Væ6†Ö&²æÖVâ²"¢&VF–æræ&Væ6†Ö&²ç7FDFWc°¢&WGW&âÆ'F–6ÆR6Æ73Ò"G´ÖF‚æ'2‡&VF–ærç¥66÷&R’ãÒ2ò&—2Ö7&—F–6Â"¢"'Ò#ãÆ#âG¶çVÖ&W"„ÖF‚æ'2‡&VF–ærç¥66÷&R’Â—Üø3Âö#ãÆF—cãÇ7G&öæsâG¶W66TGG&–'WFR†F—66—Æ–æT'”–B‡&VF–æræ–B’ææöÖR—ÓÂ÷7G&öæsãÇ6ÖÆÃä–æf÷&ÖFó¢G¶çVÖ&W"‡&VF–ærç6†&RÂ—ÒR+rf—††—7L;7&–6¢G¶çVÖ&W"†Æ÷vW"Â—ÒRG¶çVÖ&W"‡WW"Â—ÒSÂ÷6ÖÆÃãÂöF—cãÂö'F–6ÆSæ°¢Ò’æ¦ö–â‚""—Ð¢ÂöF—cà¢G·&VF–æw2æÆVæwF‚âbòÇ6Æ73Ò&×WFVB#äRÖ—2G·&VF–æw2æÆVæwF‚ÒgÒF—66—Æ–æG·&VF–æw2æÆVæwF‚ÒbÓÓÒò""¢'2'Ò6öÒFW7f–òãÂ÷æ¢"'Ð¢ÆÆ&VÂ6Æ73Ò&WbÖ†FV2Ö6öæf—&ÒÖ6†V6²#ãÆ–çWBG—SÒ&6†V6¶&÷‚"FFÖWbÖ†FV2Ö6†V6²óâÇ7ãäWRfW&–wVV’2–æf÷&Ö:|;VW2R6öæf—&ÖòVR÷2fÆ÷&W2W7L:6ò6÷'&WF÷2ãÂ÷7ããÂöÆ&VÃà¢Ç6Æ73Ò&WbÖ†FV2Ö6öæf—&ÒÖ†–çB"FFÖWbÖ†FV2Ö†–çCäÖ'VR6öæf—&Ö:|:6ò&Æ–&W&"ò6ÇfÖVçFòf–æÂãÂ÷à¢Æfö÷FW#ãÆ'WGFöâ6Æ73Ò'6V6öæF'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6æ6VÂÖWbÖFWf–F–öâ×6fR#åföÇF"R&Wf—6#Âö'WGFöããÆ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6öæf—&ÒÖWbÖFWf–F–öâ×6fR"FFÖÖöFSÒ"G¶W66TGG&–'WFR†ÖöFR—Ò"F—6&ÆVCä6öæf—&Ö"R6Çf"UcÂö'WGFöããÂöfö÷FW#à¢Âö'F–6ÆSæ“°¢ÖöFÅ&ö÷BæVæD6†–ÆB†÷fW&Æ’“°¢†FV57—7FVÔæ÷F–6R†Væ6öçG&V’G·&VF–æw2æÆVæwF‡ÒF—fW&|:¦æ6–G·&VF–æw2æÆVæwF‚ÓÓÒò""¢'2'Ò&VÆWfçFRG·&VF–æw2æÆVæwF‚ÓÓÒò""¢'2'ÒæW7FRUbâfW&–wVR÷2fÆ÷&W2R6öæf—&ÖRçFW2FR6Çf"æÂ&W'&÷%öÆW'B"“°§Ð ¦gVæ7F–öâWe&Wf—6–öä6ö×&&ÆU7FFR‡v÷&²’°¢6öç7BÆÄÆ–æW2Ò'&”÷$fÆÆ&6²‡v÷&³òæWcòæÆ–æW2“°¢6öç7BÆ–æTÖÒæWrÖ€¢ÆÄÆ–æW0¢æf–ÇFW"‚†Æ–æR’Óâ—4Æö6ÄUdÆ–æR†Æ–æR’¢æÖ‚†Æ–æR’Óâ¶6æöæ–6ÄF—66—Æ–æT–B†Æ–æRæF—66—Æ–æ–B’ÂÆ–æUÒ¢“°¢6öç7B6öæf–wW&VBÒ6öæf–wW&VDF—66—Æ–æW2‚’æÖ‚†F—66—Æ–æR’Óâ°¢6öç7BÆ–æRÒÆ–æTÖævWB†F—66—Æ–æRæ–B“°¢6öç7B7FGW2Òæ÷&ÖÆ—¦TUdÆ–æU7FGW2†Æ–æSòç7FGW2ÇÂ$W7F–ÖFò"“°¢&WGW&â°¢F—66—Æ–æ–C¢F—66—Æ–æRæ–BÀ¢7FGW2À¢fÆ÷$÷&6Fó¢7FGW2ÓÓÒ$ì:6ò6RÆ–6"ò¢çVÖ&W"†Æ–æSòçfÆ÷$÷&6FòÇÂ’À¢—4Æö6ÄUdÆ–æS¢fÇ6RÀ¢Æö6ÄæÖS¢""À¢Æö6Ä6FVv÷'“¢F—66—Æ–æRæ–BÓÓÒ'6–72"ò%6–72"¢F—66—Æ–æRæ6FVv÷&–À¢6–4FWF–Ç3¢F—66—Æ–æRæ–BÓÓÒ'6–72 ¢ò'&”÷$fÆÆ&6²†Æ–æSòç6–4FWF–Ç2’æÖ‚†—FVÒ’Óâ‡°¢–C¢7G&–ær†—FVÓòæ–BÇÂ""’À¢çVÖW&õ6–3¢7G&–ær†—FVÓòæçVÖW&õ6–2ÇÂ""’À¢ÆV6öÔçVÖ&W#¢7G&–ær†—FVÓòæÆV6öÔçVÖ&W"ÇÂ""’À¢F—GVÆó¢7G&–ær†—FVÓòçF—GVÆòÇÂ""’À¢fÆ÷#¢çVÖ&W"†—FVÓòçfÆ÷"ÇÂ’À¢7FGW3¢7G&–ær†—FVÓòç7FGW2ÇÂ""’À¢Ò’¢¢VæFVf–æVBÀ¢Ó°¢Ò“°¢6öç7BÆö6ÂÒÆÄÆ–æW0¢æf–ÇFW"†—4Æö6ÄUdÆ–æR¢æÖ‚†Æ–æRÂ–æFW‚’Óâ°¢6öç7B7FGW2Òæ÷&ÖÆ—¦TUdÆ–æU7FGW2†Æ–æRç7FGW2ÇÂ$W7F–ÖFò"“°¢&WGW&â°¢F—66—Æ–æ–C¢7G&–ær†Æ–æRæF—66—Æ–æ–B’À¢7FGW2À¢fÆ÷$÷&6Fó¢7FGW2ÓÓÒ$ì:6ò6RÆ–6"ò¢çVÖ&W"†Æ–æRçfÆ÷$÷&6FòÇÂ’À¢—4Æö6ÄUdÆ–æS¢G'VRÀ¢Æö6ÄæÖS¢WdÆ–æTF—7Æ”æÖR†Æ–æR’À¢Æö6Ä6FVv÷'“¢WdÆ–æT6FVv÷'’†Æ–æR’À¢Æö6Å÷6—F–öã¢çVÖ&W"†Æ–æRæÆö6Å÷6—F–öâÇÂ“²–æFW‚’À¢Ó°¢Ò¢ç6÷'B‚†Â"’Óà¢7G&–ær†æÆö6Ä6FVv÷'’’æÆö6ÆT6ö×&R…7G&–ær†"æÆö6Ä6FVv÷'’’Â'BÔ%""’ÇÀ¢çVÖ&W"†æÆö6Å÷6—F–öâÇÂ““’’ÒçVÖ&W"†"æÆö6Å÷6—F–öâÇÂ““’’ÇÀ¢7G&–ær†æF—66—Æ–æ–B’æÆö6ÆT6ö×&R…7G&–ær†"æF—66—Æ–æ–B’Â'BÔ%""¢“°¢&WGW&â°¢Æ–fV7–6ÆU7FGW3¢VffV7F—fTUe7FGW2‡v÷&²’ÓÓÒ$6ö×ÆWFò"ò$6ö×ÆWFò"¢$–æ6ö×ÆWFò"À¢Æ–æW3¢²ââæ6öæf–wW&VBÂââæÆö6ÅÒÀ¢Ó°§Ð ¦gVæ7F–öâWe&Wf—6–öå7FFT6†ævVB†&Vf÷&RÂgFW"’°¢&WGW&â¥4ôâç7G&–æv–g’†&Vf÷&R’ÓÒ¥4ôâç7G&–æv–g’†gFW"“°§Ð ¦gVæ7F–öâWe&Wf—6–öäF—66—Æ–æTF–fb†&Vf÷&RÂgFW"’°¢6öç7B&Vf÷&T'”–BÒæWrÖ†'&”÷$fÆÆ&6²†&Vf÷&SòæÆ–æW2’æÖ‚†Æ–æR’Óâ¶Æ–æRæF—66—Æ–æ–BÂÆ–æUÒ’“°¢&WGW&â'&”÷$fÆÆ&6²†gFW#òæÆ–æW2¢æÖ‚†Æ–æR’Óâ°¢6öç7B&Wf–÷W2Ò&Vf÷&T'”–BævWB†Æ–æRæF—66—Æ–æ–B’ÇÂ°¢fÆ÷$÷&6Fó¢À¢7FGW3¢$W7F–ÖFò"À¢Æö6ÄæÖS¢""À¢Æö6Ä6FVv÷'“¢""À¢Ó°¢–b€¢çVÖ&W"‡&Wf–÷W2çfÆ÷$÷&6FòÇÂ’ÓÓÒçVÖ&W"†Æ–æRçfÆ÷$÷&6FòÇÂ¢bb7G&–ær‡&Wf–÷W2ç7FGW2ÇÂ""’ÓÓÒ7G&–ær†Æ–æRç7FGW2ÇÂ""¢bb7G&–ær‡&Wf–÷W2æÆö6ÄæÖRÇÂ""’ÓÓÒ7G&–ær†Æ–æRæÆö6ÄæÖRÇÂ""¢bb7G&–ær‡&Wf–÷W2æÆö6Ä6FVv÷'’ÇÂ""’ÓÓÒ7G&–ær†Æ–æRæÆö6Ä6FVv÷'’ÇÂ""¢bb¥4ôâç7G&–æv–g’‡&Wf–÷W2ç6–4FWF–Ç2ÇÂµÒ’ÓÓÒ¥4ôâç7G&–æv–g’†Æ–æRç6–4FWF–Ç2ÇÂµÒ¢’&WGW&âçVÆÃ°¢&WGW&â°¢F—66—Æ–æ–C¢Æ–æRæF—66—Æ–æ–BÀ¢fÆ÷$çFW3¢çVÖ&W"‡&Wf–÷W2çfÆ÷$÷&6FòÇÂ’À¢fÆ÷$FWö—3¢çVÖ&W"†Æ–æRçfÆ÷$÷&6FòÇÂ’À¢7FGW4çFW3¢&Wf–÷W2ç7FGW2ÇÂ$W7F–ÖFò"À¢7FGW4FWö—3¢Æ–æRç7FGW2ÇÂ$W7F–ÖFò"À¢æöÖTçFW3¢&Wf–÷W2æÆö6ÄæÖRÇÂ""À¢æöÖTFWö—3¢Æ–æRæÆö6ÄæÖRÇÂ""À¢6FVv÷&–çFW3¢&Wf–÷W2æÆö6Ä6FVv÷'’ÇÂ""À¢6FVv÷&–FWö—3¢Æ–æRæÆö6Ä6FVv÷'’ÇÂ""À¢6–4FWF–Ç4çFW3¢&Wf–÷W2ç6–4FWF–Ç2ÇÂµÒÀ¢6–4FWF–Ç4FWö—3¢Æ–æRç6–4FWF–Ç2ÇÂµÒÀ¢Ó°¢Ò¢æf–ÇFW"„&ööÆVâ“°§Ð ¦gVæ7F–öâFVÖæD†5VæF–ætUd6†ævTf÷$6ö×ÆWF–öâ†FVÖæB’°¢–b‚FVÖæBÇÂFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÒ%4”2"’&WGW&âfÇ6S°¢–b‚†FVÖæBç6–5÷7FVDBÇÂ'&”÷$fÆÆ&6²†FVÖæBç6–4–G2’æÆVæwF‚’’&WGW&âfÇ6S°¢&WGW&âFVÖæD†4UeWFFTf÷$6ö×ÆWF–öâ†FVÖæB“°§Ð ¦7–æ2gVæ7F–öâ†æFÆTUe7V&Ö—B†f÷&ÒÂÖöFRÒ&f–æÂ"’°¢6öç7Bv÷&²Òv÷&´'”–B†f÷&ÒæFF6WBçv÷&´–B“°¢–b‚v÷&²’&WGW&ã°¢6öç7B6ö×ÆWF–öäFVÖæD–BÒ7G&–ær€¢f÷&ÒæFF6WBæ6ö×ÆWF–öäFVÖæD–@¢ÇÂ‡VæF–ætFVÖæD6ö×ÆWF–öãòçv÷&´–BÓÓÒv÷&²æ–BòVæF–ætFVÖæD6ö×ÆWF–öâæFVÖæD–B¢""¢ÇÂ" ¢“°¢6öç7B6ö×ÆWF–öäFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ6ö×ÆWF–öäFVÖæD–Bbb—FVÒæö'&–BÓÓÒv÷&²æ–B’ÇÂçVÆÃ°¢6öç7BæW‡DUe7FGW2Òf÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ&WdÆ–fV7–6ÆU7FGW2%Òr“òçfÇVRÓÓÒ$6ö×ÆWFò"ò$6ö×ÆWFò"¢$–æ6ö×ÆWFò#°¢6öç7B&Wf–÷W4Ue7FGW2ÒVffV7F—fTUe7FGW2‡v÷&²“° ¢–b†ÖöFRÓÓÒ&f–æÂ"bbf÷&ÒæFF6WBæWdFWf–F–öä6öæf—&ÖVBÓÒ'G'VR"’°¢6öç7B²fÇVW2Â&6UF÷FÂÒÒWdf÷&ÔFWf–F–öäFF†f÷&Ò“°¢6öç7B&VF–æw2ÒWd†—7F÷&–6ÄFWf–F–öå&VF–æw2‡v÷&²ÂfÇVW2Â&6UF÷FÂ“°¢–b‡&VF–æw2æÆVæwF‚’°¢6†÷tUd†FV46öæf—&ÖF–öâ†f÷&ÒÂÖöFRÂ&VF–æw2“°¢&WGW&ã°¢Ð¢Ð¢FVÆWFRf÷&ÒæFF6WBæWdFWf–F–öä6öæf—&ÖVC° ¢6öç7Bv÷&´–æFW‚Ò7FFRçv÷&·2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒv÷&²æ–B“°¢6öç7Bv÷&µ6æ6†÷BÒ6ÆöæR‡v÷&²“°¢6öç7B†—7F÷'•6æ6†÷BÒ6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢6öç7B&Wf–÷W5&Wf—6–öå7FFRÒWe&Wf—6–öä6ö×&&ÆU7FFR‡v÷&µ6æ6†÷B“°¢6öç7B&Wf–÷W5F÷FÇ2Òv÷&µF÷FÇ2‡v÷&²“°¢6öç7B&Wf–÷W5F÷FÂÒ&Wf–÷W5F÷FÇ2æ÷&6Fò²&Wf–÷W5F÷FÇ2æF—F—fFó° ¢6öç7B&Wf–÷W5&Wf—6–öäçVÖ&W"ÒçVÖ&W"‡v÷&²æWbçfW'6ôGVÂÇÂ“°¢v÷&²æWbæÆ–æW2Òv÷&²æWbæÆ–æW2ÇÂµÓ° ¢6öç7BVF—F÷%&÷w2Ò²ââæf÷&ÒçVW'•6VÆV7F÷$ÆÂ‚"æWbÖÆ–æR×&÷r"•Ó°¢6öç7B–çfÆ–DÆö6Å&÷rÒVF—F÷%&÷w2æf–æB€¢‡&÷r’Óâ&÷ræFF6WBæÆö6ÄÆ–æRÓÓÒ'G'VR"bb7G&–ær‡&÷rçVW'•6VÆV7F÷"‚"æWbÖÆö6ÂÖæÖRÖ–çWB"“òçfÇVRÇÂ""’çG&–Ò‚¢“°¢–b†–çfÆ–DÆö6Å&÷r’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRòæöÖRFæ÷fÆ–æ†çFW2FR6Çf"òUbâ"Âf÷&Ò“°¢–çfÆ–DÆö6Å&÷ræ†–FFVâÒfÇ6S°¢–çfÆ–DÆö6Å&÷rçVW'•6VÆV7F÷"‚"æWbÖÆö6ÂÖæÖRÖ–çWB"“òæfö7W2‚“°¢&WGW&ã°¢Ð ¢ÆWBFVÆWFVDÆö6ÄÆ–æT–G2ÒµÓ°¢G'’°¢FVÆWFVDÆö6ÄÆ–æT–G2Ò¥4ôâç'6R†f÷&ÒæFF6WBæFVÆWFVDÆö6ÄÆ–æT–G2ÇÂ%µÒ"“°¢Ò6F6‚°¢FVÆWFVDÆö6ÄÆ–æT–G2ÒµÓ°¢Ð¢–b†FVÆWFVDÆö6ÄÆ–æT–G2æÆVæwF‚’°¢6öç7BFVÆWFVE6WBÒæWr6WB†FVÆWFVDÆö6ÄÆ–æT–G2æÖ…7G&–ær’“°¢v÷&²æWbæÆ–æW2Òv÷&²æWbæÆ–æW2æf–ÇFW"€¢†Æ–æR’Óâ†—4Æö6ÄUdÆ–æR†Æ–æR’bbFVÆWFVE6WBæ†2…7G&–ær†Æ–æRæF—66—Æ–æ–B’’¢“°¢Ð ¢VF—F÷%&÷w2æf÷$V6‚‚‡&÷r’Óâ°¢6öç7BF—66—Æ–æT–BÒ&÷ræFF6WBæF—66—Æ–æT–C°¢6öç7B—4Æö6ÂÒ&÷ræFF6WBæÆö6ÄÆ–æRÓÓÒ'G'VR#°¢6öç7B7FGW2Òæ÷&ÖÆ—¦TUdÆ–æU7FGW2‡&÷rçVW'•6VÆV7F÷"‚"æWb×7FGW2×6VÆV7B"“òçfÇVR“°¢6öç7B–çWBÒ&÷rçVW'•6VÆV7F÷"‚"æWb×fÇVRÖ–çWB"“°¢6öç7BfÇVRÒ7FGW2ÓÓÒ$ì:6ò6RÆ–6"ò¢'6T7W'&Væ7’†–çWCòçfÇVR“°¢ÆWBÆ–æRÒv÷&²æWbæÆ–æW2æf–æB‚†—FVÒ’Óà¢—4Æö6À¢ò7G&–ær†—FVÒæF—66—Æ–æ–B’ÓÓÒ7G&–ær†F—66—Æ–æT–B¢¢6æöæ–6ÄF—66—Æ–æT–B†—FVÒæF—66—Æ–æ–B’ÓÓÒF—66—Æ–æT–Bbb—4Æö6ÄUdÆ–æR†—FVÒ¢“°¢–b‚Æ–æR’°¢Æ–æRÒ²F—66—Æ–æ–C¢F—66—Æ–æT–BÂfÆ÷$÷&6Fó¢Â7FGW2Ó°¢v÷&²æWbæÆ–æW2çW6‚†Æ–æR“°¢Ð¢Æ–æRæF—66—Æ–æ–BÒF—66—Æ–æT–C°¢Æ–æRçfÆ÷$÷&6FòÒfÇVS°¢Æ–æRç7FGW2Ò7FGW3°¢–b†—4Æö6Â’°¢Æ–æRæ—4Æö6ÄUdÆ–æRÒG'VS°¢Æ–æRæÆö6ÄæÖRÒ7G&–ær‡&÷rçVW'•6VÆV7F÷"‚"æWbÖÆö6ÂÖæÖRÖ–çWB"“òçfÇVRÇÂ""’çG&–Ò‚“°¢Æ–æRæÆö6Ä6FVv÷'’Ò²$7W7F÷4Fö'&"Â$÷WG&46FVv÷&–2"Â%6–72%Òæ–æ6ÇVFW2‡&÷ræFF6WBæWdw&÷W¢ò&÷ræFF6WBæWdw&÷W ¢¢$÷WG&46FVv÷&–2#°¢Æ–æRæÆö6Å÷6—F–öâÒçVÖ&W"†Æ–æRæÆö6Å÷6—F–öâÇÂFFRææ÷r‚’“°¢Ð¢Ò“° ¢6öç7BÆVv7•6–5&÷rÒf÷&ÒçVW'•6VÆV7F÷"‚ræWb×6–2×÷7FVB×&÷u¶FFÖWbÖÆVv7’×6–3Ò'G'VR%Òr“°¢–b†f÷&ÒæFF6WBæFVÆWFVDÆVv7•6–2ÓÓÒ'G'VR"’°¢v÷&²æWbæÆ–æW2Òv÷&²æWbæÆ–æW2æf–ÇFW"€¢†Æ–æR’Óâ—4Æö6ÄUdÆ–æR†Æ–æR’ÇÂ6æöæ–6ÄF—66—Æ–æT–B†Æ–æRæF—66—Æ–æ–B’ÓÒ'6–72 ¢“°¢ÒVÇ6R–b†ÆVv7•6–5&÷r’°¢6öç7BfÇVRÒ'6T7W'&Væ7’†ÆVv7•6–5&÷rçVW'•6VÆV7F÷"‚%¶FFÖWbÖÆVv7’×6–2×fÇVUÒ"“òçfÇVR“°¢6öç7B&VfW&Væ6RÒ7G&–ær†ÆVv7•6–5&÷rçVW'•6VÆV7F÷"‚%¶FFÖWbÖÆVv7’×6–2×&VfW&Væ6UÒ"“òçfÇVRÇÂ""’çG&–Ò‚“°¢6öç7BF—FÆRÒ7G&–ær†ÆVv7•6–5&÷rçVW'•6VÆV7F÷"‚%¶FFÖWbÖÆVv7’×6–2×F—FÆUÒ"“òçfÇVRÇÂ""’çG&–Ò‚¢ÇÂ%4”2w26öç6öÆ–FF2††—7L;7&–6ò6VÒFWFÆ†ÖVçFò’#°¢ÆWB7VÖÖ'”Æ–æRÒv÷&²æWbæÆ–æW2æf–æB€¢†Æ–æR’Óâ—4Æö6ÄUdÆ–æR†Æ–æR’bb6æöæ–6ÄF—66—Æ–æT–B†Æ–æRæF—66—Æ–æ–B’ÓÓÒ'6–72 ¢“°¢–b‚7VÖÖ'”Æ–æR’°¢7VÖÖ'”Æ–æRÒ²F—66—Æ–æ–C¢'6–72"ÂfÆ÷$÷&6Fó¢Â7FGW3¢$÷,:vFò"Ó°¢v÷&²æWbæÆ–æW2çW6‚‡7VÖÖ'”Æ–æR“°¢Ð¢7VÖÖ'”Æ–æRæF—66—Æ–æ–BÒ'6–72#°¢7VÖÖ'”Æ–æRçfÆ÷$÷&6FòÒfÇVS°¢7VÖÖ'”Æ–æRç7FGW2ÒfÇVRò$÷,:vFò"¢$ì:6ò6RÆ–6#°¢7VÖÖ'”Æ–æRç6–4FWF–Ç2Ò·°¢–C¢&ÆVv7’×6–2×F÷FÂ"À¢çVÖW&õ6–3¢&VfW&Væ6RÀ¢ÆV6öÔçVÖ&W#¢""À¢F—GVÆó¢F—FÆRÀ¢fÆ÷#¢fÇVRÀ¢7FGW3¢$†—7L;7&–6ò"À¢ÕÓ°¢Ð ¢6öç7Bw&÷W÷&FW"Ò²7W7F÷4Fö'&¢Â÷WG&46FVv÷&–3¢Â6–73¢"Ó°¢v÷&²æWbæÆ–æW2ç6÷'B‚†Â"’Óâ°¢6öç7B6FVv÷'”F–ffW&Væ6RÐ¢çVÖ&W"†w&÷W÷&FW%¶WdÆ–æT6FVv÷'’†•Òóò’’ÒçVÖ&W"†w&÷W÷&FW%¶WdÆ–æT6FVv÷'’†"•Òóò’“°¢–b†6FVv÷'”F–ffW&Væ6R’&WGW&â6FVv÷'”F–ffW&Væ6S°¢&WGW&âWdÆ–æU÷6—F–öâ†’ÒWdÆ–æU÷6—F–öâ†"“°¢Ò“°¢v÷&²æWbç7FGW2ÒæW‡DUe7FGW3° ¢6öç7BæW‡E&Wf—6–öå7FFRÒWe&Wf—6–öä6ö×&&ÆU7FFR‡v÷&²“°¢6öç7B6†ævVD–äVF—F÷"ÒWe&Wf—6–öå7FFT6†ævVB‡&Wf–÷W5&Wf—6–öå7FFRÂæW‡E&Wf—6–öå7FFR“°¢6öç7BVæF–ætFVÖæD6†ævRÒ&ööÆVâ†6ö×ÆWF–öäFVÖæBbbFVÖæD†5VæF–ætUd6†ævTf÷$6ö×ÆWF–öâ†6ö×ÆWF–öäFVÖæB’“°¢6öç7B†4Ud6†ævRÒ6†ævVD–äVF—F÷"ÇÂVæF–ætFVÖæD6†ævS° ¢–b†ÖöFRÓÓÒ&f–æÂ"bb†4Ud6†ævR’°¢–b‡v÷&´–æFW‚ãÒ’7FFRçv÷&·5·v÷&´–æFW…ÒÒv÷&µ6æ6†÷C°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢VæF–ætFVÖæD6ö×ÆWF–öâÒçVÆÃ°¢6†÷uFö7B‚$æVæ‡VÖÇFW&:|:6òæòUbâæVæ‡VÖæ÷f&Wf—<:6òfö’7&–Fâ"“°¢–b†6ö×ÆWF–öäFVÖæB’°¢÷VäFVÖæD6ö×ÆWF–öäÖöFÂ†6ö×ÆWF–öäFVÖæBæ–BÂ²f÷&6T6†V6¶Æ—7C¢G'VRÒ“°¢ÒVÇ6R–b†f÷&Òæ6Æ÷6W7B‚"æWbÖÖöFÂÖ6&B"’’°¢÷VäUdÖöFÂ‡v÷&²æ–B“°¢ÒVÇ6R°¢&VæFW"‚“°¢Ð¢&WGW&ã°¢Ð ¢FVÆWFRv÷&²æWbå÷f—'GVÄV×G”Uc°¢6öç7BF÷FÇ2Òv÷&µF÷FÇ2‡v÷&²“°¢6öç7BF÷FÅfÇVRÒF÷FÇ2æ÷&6Fò²F÷FÇ2æF—F—fFó° ¢–b†ÖöFRÓÓÒ&f–æÂ"’°¢v÷&²æWbçfW'6ôGVÂÒçVÖ&W"‡v÷&²æWbçfW'6ôGVÂÇÂ’²°¢v÷&²æWbçfW'6–öç2Òv÷&²æWbçfW'6–öç2ÇÂµÓ°¢6öç7B&Wf—6–öä÷&–v–âÒ6ö×ÆWF–öäFVÖæBò6öæ6ÇW<:6òG¶6ö×ÆWF–öäFVÖæBæ–GÖ¢$VFœ:|:6òÖçVÂ4ÅB3c#°¢v÷&²æWbçfW'6–öç2çW6‚‡°¢çVÖW&ó¢v÷&²æWbçfW'6ôGVÂÀ¢FF¢FöF”•4ò‚’À¢÷&–vVÓ¢&Wf—6–öä÷&–v–âÀ¢fÆ÷$çFW&–÷#¢&Wf–÷W5F÷FÂÀ¢fÆ÷%F÷FÃ¢F÷FÅfÇVRÀ¢–×7FôFVÖæF¢ÖF‚æ'2‡F÷FÅfÇVRÒ&Wf–÷W5F÷FÂ’À¢7W7FôÓ#¢v÷&²æ&VWV—fÆVçFRòF÷FÅfÇVRòçVÖ&W"‡v÷&²æ&VWV—fÆVçFR’¢À¢F–fe÷$F—66—Æ–æ¢We&Wf—6–öäF—66—Æ–æTF–fb‡&Wf–÷W5&Wf—6–öå7FFRÂæW‡E&Wf—6–öå7FFR’À¢Ò“°¢FD†—7F÷'’‡°¢VçF–FFS¢&Wb"À¢VçF–FFT–C¢v÷&²æWbæ–BÇÂv÷&²æ–BÀ¢6×ó¢'&Wf—<:6ò"À¢fÆ÷$çFW&–÷#¢$UbGµ7G&–ær‡&Wf–÷W5&Wf—6–öäçVÖ&W"’çE7F'Bƒ"Â#"—ÖÀ¢fÆ÷$æ÷fó¢$UbGµ7G&–ær‡v÷&²æWbçfW'6ôGVÂ’çE7F'Bƒ"Â#"—ÒÂG·&Wf—6–öä÷&–v–çÖÀ¢Ò“°¢Ð ¢FD†—7F÷'’‡°¢VçF–FFS¢&Wb"À¢VçF–FFT–C¢v÷&²æWbæ–BÇÂv÷&²æ–BÀ¢6×ó¢'6ÇfÖVçFò"À¢fÆ÷$çFW&–÷#¢ÖöæW’‡&Wf–÷W5F÷FÂ’À¢fÆ÷$æ÷fó¢ÖöæW’‡F÷FÅfÇVR’À¢Ò“°¢–b‡&Wf–÷W4Ue7FGW2ÓÒæW‡DUe7FGW2’°¢FD†—7F÷'’‡°¢VçF–FFS¢&Wb"À¢VçF–FFT–C¢v÷&²æWbæ–BÇÂv÷&²æ–BÀ¢6×ó¢'7FGW2FòUb"À¢fÆ÷$çFW&–÷#¢&Wf–÷W4Ue7FGW2À¢fÆ÷$æ÷fó¢æW‡DUe7FGW2À¢Ò“°¢Ð ¢G'’°¢6öç7B6öæf—&ÖVEw&—FRÒv—B6fU7FFTæEv—B‚“°¢–b‚6öæf—&ÖVEw&—FR’°¢F‡&÷ræWrW'&÷"‚$ò&æ6òì:6ò&V6V&WRæVæ‡VÖÇFW&:|:6òFW7FRUbâò6ÇfÖVçFòfö’–çFW'&ö×–Fò&Wf—F"VÖ6öæf—&Ö:|:6òfÇ6â"“°¢Ð¢Ò6F6‚†W'&÷"’°¢6öç7B7W'&VçD–æFW‚Ò7FFRçv÷&·2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒv÷&²æ–B“°¢–b†7W'&VçD–æFW‚ãÒ’°¢–b‡v÷&´–æFW‚ãÒ’7FFRçv÷&·5¶7W'&VçD–æFW…ÒÒv÷&µ6æ6†÷C°¢VÇ6R7FFRçv÷&·2ç7Æ–6R†7W'&VçD–æFW‚Â“°¢Ð¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢6†÷tf÷&ÔW'&÷"†W'&÷#òæÖW76vRÇÂ$òUbì:6òfö’6öæf—&ÖFòVÆò&æ6òâ&V6'&VwVR÷2FF÷2çFW2FRFVçF"æ÷fÖVçFRâ"Âf÷&Ò“°¢&WGW&ã°¢Ð ¢6†÷uFö7B‚$Ub6Çfòæò&æ6ò"“° ¢–b†ÖöFRÓÓÒ&f–æÂ"bb6ö×ÆWF–öäFVÖæB’°¢VæF–ætFVÖæD6ö×ÆWF–öâÒçVÆÃ°¢–b†FVÖæEG—T¶W’†6ö×ÆWF–öäFVÖæBçF—ò’ÓÓÒ%4”2"’°¢÷VäFVÖæD6ö×ÆWF–öäÖöFÂ†6ö×ÆWF–öäFVÖæBæ–BÂ²f÷&6T6†V6¶Æ—7C¢G'VRÂ&W7VÖVDgFW$Uc¢G'VRÒ“°¢ÒVÇ6R°¢÷VäFVÖæD6ö×ÆWF–öäÖ÷VçDÖöFÂ†6ö×ÆWF–öäFVÖæBæ–BÂ²Wdæô6†ævS¢fÇ6RÂ&W7VÖVDgFW$Uc¢G'VRÒ“°¢Ð¢&WGW&ã°¢Ð¢–b†f÷&Òæ6Æ÷6W7B‚"æWbÖÖöFÂÖ6&B"’’÷VäUdÖöFÂ‡v÷&²æ–B“°¢VÇ6R&VæFW"‚“°§Ð ¦gVæ7F–öâFW&—fTUe7FGW2‡v÷&²’°¢–b‚v÷&³òæWbÇÂv÷&²æWbå÷f—'GVÄV×G”UbÇÂWd†4'VFvWDFF‡v÷&²æWb’’&WGW&â$–æ6ö×ÆWFò#°¢&WGW&âv÷&²æWbç7FGW2ÓÓÒ$6ö×ÆWFò"ò$6ö×ÆWFò"¢$–æ6ö×ÆWFò#°§Ð ¦7–æ2gVæ7F–öâ†æFÆU7&–çE7V&Ö—B†f÷&Ò’°¢6öç7Bf÷&ÔFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7B7&–çD–BÒ7G&–ær†f÷&ÔFFævWB‚'7&–çD–B"’ÇÂ""’çG&–Ò‚“°¢6öç7BW†—7F–ærÒ7&–çD–Bò‡7FFRç7&–çG2ÇÂµÒ’æf–æB‚‡7&–çB’Óâ7G&–ær‡7&–çBæ–B’ÓÓÒ7&–çD–B’¢çVÆÃ°¢6öç7BæöÖRÒ7G&–ær†f÷&ÔFFævWB‚&æöÖR"’ÇÂ""’çG&–Ò‚“°¢6öç7BFF–æ–6–òÒf÷&ÔFFævWB‚&FF–æ–6–ò"“°¢6öç7BFFf–ÒÒf÷&ÔFFævWB‚&FFf–Ò"“°¢–b‚æöÖR’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRòæöÖRF7&–çBvÆö&Ââ"Âf÷&Ò“°¢f÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ&æöÖR%Òr“òæfö7W2‚“°¢&WGW&ã°¢Ð¢–b‚FF–æ–6–òÇÂFFf–ÒÇÂFFf–ÒÂFF–æ–6–ò’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRVÒW,:ÖöFòl:Æ–Fò&7&–çBâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BGWÆ–6FVBÒ‡7FFRç7&–çG2ÇÂµÒ’ç6öÖR‚‡7&–çB’Óà¢7G&–ær‡7&–çBæ–B’ÓÒ7G&–ær†W†—7F–æsòæ–BÇÂ""’b`¢æ÷&ÖÆ—¦U6V&6…FW‡B‡7&–çBææöÖR’ÓÓÒæ÷&ÖÆ—¦U6V&6…FW‡B†æöÖR¢“°¢–b†GWÆ–6FVB’°¢6†÷tf÷&ÔW'&÷"‚$¬:W†—7FRVÖ7&–çB6öÒW76RæöÖRâ§W7FRòæöÖRçFW2FR6Çf"â"Âf÷&Ò“°¢f÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ&æöÖR%Òr“òæfö7W2‚“°¢&WGW&ã°¢Ð ¢6öç7B&u7FGW2Ò7G&–ær†f÷&ÔFFævWB‚'7FGW2"’ÇÂ""“°¢6öç7B7FGW2Ò²$F—f"Â%ÆæV¦F"Â$Væ6W'&F%Òæ–æ6ÇVFW2‡&u7FGW2’ò&u7FGW2¢%ÆæV¦F#°¢6öç7B7&–çG56æ6†÷BÒ6ÆöæR‡7FFRç7&–çG2ÇÂµÒ“°¢6öç7B†—7F÷'•6æ6†÷BÒ6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“° ¢–b‡7FGW2ÓÓÒ$F—f"’°¢7FFRç7&–çG2Ò‡7FFRç7&–çG2ÇÂµÒ’æÖ‚‡7&–çB’Óâ‡°¢ââç7&–çBÀ¢7FGW3¢7G&–ær‡7&–çBæ–B’ÓÒ7G&–ær†W†—7F–æsòæ–BÇÂ""’bb7&–çBç7FGW2ÓÓÒ$F—f"ò$Væ6W'&F"¢7&–çBç7FGW2À¢Ò’“°¢Ð ¢6öç7B7&–çBÒ°¢âââ†W†—7F–ærÇÂ·Ò’À¢–C¢W†—7F–æsòæ–BÇÂæW‡D6öFR‚'7&–çB"Â7FFRç7&–çG2ÇÂµÒ’À¢æöÖRÀ¢FF–æ–6–òÀ¢FFf–ÒÀ¢7FGW2À¢Ó° ¢–b†W†—7F–ær’°¢7FFRç7&–çG2Ò‡7FFRç7&–çG2ÇÂµÒ’æÖ‚†—FVÒ’Óâ7G&–ær†—FVÒæ–B’ÓÓÒ7G&–ær†W†—7F–æræ–B’ò7&–çB¢—FVÒ“°¢FD†—7F÷'’‡°¢VçF–FFS¢'7&–çB"À¢VçF–FFT–C¢7&–çBæ–BÀ¢6×ó¢&VFœ:|:6ò"À¢fÆ÷$çFW&–÷#¢G¶W†—7F–ærææöÖWÒÂG¶FFUFW‡B†W†—7F–æræFF–æ–6–ò—ÒG¶FFUFW‡B†W†—7F–æræFFf–Ò—ÒÂG¶W†—7F–ærç7FGW7ÖÀ¢fÆ÷$æ÷fó¢G·7&–çBææöÖWÒÂG¶FFUFW‡B†FF–æ–6–ò—ÒG¶FFUFW‡B†FFf–Ò—ÒÂG·7FGW7ÖÀ¢Ò“°¢ÒVÇ6R°¢7FFRç7&–çG2Ò²âââ‡7FFRç7&–çG2ÇÂµÒ’Â7&–çEÓ°¢FD†—7F÷'’‡°¢VçF–FFS¢'7&–çB"À¢VçF–FFT–C¢7&–çBæ–BÀ¢6×ó¢&7&–:|:6ò"À¢fÆ÷$çFW&–÷#¢$ì:6òW†—7F–"À¢fÆ÷$æ÷fó¢G·7&–çBææöÖWÒÂG¶FFUFW‡B†FF–æ–6–ò—ÒG¶FFUFW‡B†FFf–Ò—ÖÀ¢Ò“°¢Ð ¢–b‚v—B6fU7FFR‚’’°¢7FFRç7&–çG2Ò7&–çG56æ6†÷C°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢&WGW&âfÇ6S°¢Ð¢–b†f÷&Òæ6Æ÷6W7B‚"æÖöFÂÖ6&B"’’6Æ÷6TÖöFÂ‚“°¢6†÷uFö7B†W†—7F–ærò%7&–çBvÆö&ÂGVÆ—¦Fâ"¢%7&–çBvÆö&Â6F7G&F&FöF÷2÷2Ü;6GVÆ÷2â"“°¢&VæFW"‚“°§Ð ¦7–æ2gVæ7F–öâ7F—fFU7&–çB†–B’°¢6öç7B7&–çBÒ‡7FFRç7&–çG2ÇÂµÒ’æf–æB‚†—FVÒ’Óâ7G&–ær†—FVÒæ–B’ÓÓÒ7G&–ær†–B’“°¢–b‚7&–çBÇÂ7&–çBç7FGW2ÓÓÒ$F—f"’&WGW&ã°¢6öç7B&Wf–÷W47F—fRÒ7W'&VçE7&–çB‚“°¢7FFRç7&–çG2Ò‡7FFRç7&–çG2ÇÂµÒ’æÖ‚†—FVÒ’Óâ‡°¢ââæ—FVÒÀ¢7FGW3¢—FVÒæ–BÓÓÒ7&–çBæ–Bò$F—f"¢—FVÒç7FGW2ÓÓÒ$F—f"ò$Væ6W'&F"¢—FVÒç7FGW2À¢Ò’“°¢FD†—7F÷'’‡°¢VçF–FFS¢'7&–çB"À¢VçF–FFT–C¢7&–çBæ–BÀ¢6×ó¢'7FGW2"À¢fÆ÷$çFW&–÷#¢7&–çBç7FGW2À¢fÆ÷$æ÷fó¢F—fG·&Wf–÷W47F—fRòÂG·&Wf–÷W47F—fRææöÖWÒVæ6W'&F¢"'ÖÀ¢Ò“°¢–b‚v—B6fU7FFR‚’’&WGW&âfÇ6S°¢&VæFW"‚“°¢6†÷uFö7B†G·7&–çBææöÖWÒv÷&:’7&–çBGVÂæ“°§Ð ¦7–æ2gVæ7F–öâ†æFÆUv÷&µ7V&Ö—B†f÷&Ò’°¢–b†f÷&ÒæFF6WBç6f–ærÓÓÒ'G'VR"’&WGW&ã°¢6öç7Bf÷&ÔFFÒæWrf÷&ÔFF†f÷&Ò“°¢ÆWBæöÖRÒ7G&–ær†f÷&ÔFFævWB‚&æöÖR"’ÇÂ""’çG&–Ò‚“°¢6öç7BF—õVæ–FFRÒ7G&–ær†f÷&ÔFFævWB‚'F—õVæ–FFR"’ÇÂ""’çG&–Ò‚“°¢6öç7B6–FFRÒ7G&–ær†f÷&ÔFFævWB‚&6–FFR"’ÇÂ""’çG&–Ò‚“°¢6öç7BVbÒ7G&–ær†f÷&ÔFFævWB‚'Vb"’ÇÂ""’çG&–Ò‚’çFõWW$66R‚“°¢6öç7B&Vv–òÒ7G&–ær†f÷&ÔFFævWB‚'&Vv–ò"’ÇÂ&Vv–öäg&öÕVb‡Vb’ÇÂ""’çG&–Ò‚“°¢æöÖRÒ÷'FföÆ–õv÷&´F—7Æ”æÖR‡²æöÖRÂVbÒ“° ¢–b‚æöÖRÇÂF—õVæ–FFRÇÂ6–FFRÇÂVbÇÂ&Vv–ò’°¢6†÷tf÷&ÔW'&÷"‚%&VVæ6†æöÖRÂF—òFRVæ–FFRÂ6–FFRÂTbR&Vvœ:6ò&6F7G&"ö'&â"Âf÷&Ò“°¢&WGW&ã°¢Ð ¢6öç7B6÷W&6T†—7F÷&–6Å&V6÷&D–BÒ7G&–ær†f÷&ÔFFævWB‚'6÷W&6T†—7F÷&–6Å&V6÷&D–B"’ÇÂ""’çG&–Ò‚“°¢6öç7B&VWV—fÆVçFRÒ'6T7W'&Væ7’†f÷&ÔFFævWB‚&&VWV—fÆVçFR"’“°¢6öç7B&V6öç7G'V–FÒ'6T7W'&Væ7’†f÷&ÔFFævWB‚&&V6öç7G'V–F"’“°¢6öç7B&¦ôF–2ÒçVÖ&W"…7G&–ær†f÷&ÔFFævWB‚'&¦ôF–2"’ÇÂ""’ç&WÆ6R‚õµåÆEÒörÂ""’“°¢6öç7Bæôö'&–æf÷&ÖFòÒ7G&–ær†f÷&ÔFFævWB‚&æôö'&"’ÇÂ""’ç&WÆ6R‚õµåÆEÒörÂ""’ç6Æ–6RƒÂB“°¢6öç7Bæôö'&Òæôö'&–æf÷&ÖFòæÆVæwF‚ÓÓÒBòæôö'&–æf÷&ÖFò¢7G&–ær†æWrFFR‚’ævWDgVÆÅ–V"‚’“°¢6öç7B6öF–vô÷&–v–æÂÒ7G&–ær†f÷&ÔFFævWB‚&6öF–vô÷&–v–æÂ"’ÇÂ""’çG&–Ò‚’ç&WÆ6R‚õ²åÇ5Ò²BörÂ""’ÇÂ##°¢6öç7BF—õfW&&Ò7G&–ær†f÷&ÔFFævWB‚'F—õfW&&"’ÇÂ""’çG&–Ò‚’çFõWW$66R‚“°¢6öç7B÷&FVÔ–çFW&æ4Ò7G&–ær†f÷&ÔFFævWB‚&÷&FVÔ–çFW&æ4"’ÇÂ""’çG&–Ò‚“°¢6öç7BfÆ÷%fW&&÷'FFÒ'6T7W'&Væ7’†f÷&ÔFFævWB‚'fÆ÷%fW&&÷'FF"’“°¢6öç7BfÆ÷$W7F–ÖFòÒ'6T7W'&Væ7’†f÷&ÔFFævWB‚'fÆ÷$W7F–ÖFò"’“°¢–b‡F—õfW&&bb²$4U‚"Â$õU‚%Òæ–æ6ÇVFW2‡F—õfW&&’’°¢6†÷tf÷&ÔW'&÷"‚%6VÆV6–öæRVÖ÷&–vVÒFfW&&l:Æ–F„4U‚÷RõU‚’â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BæVVG4f–ææ6–Ä–çFVw&F–öâÒ²$4U‚"Â$õU‚%Òæ–æ6ÇVFW2‡F—õfW&&’bb÷&FVÔ–çFW&æ4bbfÆ÷%fW&&÷'FFâ°¢–b†æVVG4f–ææ6–Ä–çFVw&F–öâ’°¢G'’°¢v—BvÆö&ÅF†—2å4ÅEô4ÄõTBæVç7W&TÖöGVÆR‚&'VFvWB"“°¢–b‚vÆö&ÅF†—2å4ÅEô4ÄõTBæ6åw&—FR‚&'VFvWB"’’°¢6†÷tf÷&ÔW'&÷"‚%&–çFVw&"fW&&FW7Fö'&Â:’æV6W7<:&–W&Ö—7<:6òFRVFœ:|:6òVÒ6öçG&öÆRFRfW&&2â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢Ò6F6‚†W'&÷"’°¢6†÷tf÷&ÔW'&÷"†W'&÷#òæÖW76vRÇÂ$ì:6òfö’÷7<:×fVÂ6'&Vv"ò&æ6òFò6öçG&öÆRFRfW&&2âFVçFRæ÷fÖVçFRâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢Ð¢òò6'&Vv"fW&&2&V–G&FòW7FFò–çFV—&ó²Æö6Æ—¦"ö'&6öÖVçFRFWö—2à¢6öç7BW†—7F–æuv÷&²Òv÷&´'”–B†f÷&ÔFFævWB‚'v÷&´–B"’“°¢–b†f÷&ÔFFævWB‚'v÷&´–B"’bbW†—7F–æuv÷&²’°¢6†÷tf÷&ÔW'&÷"‚$W7Fö'&ì:6òfö’Væ6öçG&Fæò&æ6òâ&V6'&VwVRçFW2FRVF—F"â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7Bæ÷&ÖÆ—¦VDæÖRÒæ÷&ÖÆ—¦U6V&6…FW‡B†æöÖR“°¢6öç7BGWÆ–6FUv÷&²Ò‡7FFRçv÷&·2ÇÂµÒ’æf–æB‚‡v÷&²’Óâ°¢–b‡v÷&²ÓÓÒW†—7F–æuv÷&²ÇÂv÷&³òåöFVÆWFVB’&WGW&âfÇ6S°¢–b†æ÷&ÖÆ—¦U6V&6…FW‡B‡÷'FföÆ–õv÷&´F—7Æ”æÖR‡v÷&²’’ÓÒæ÷&ÖÆ—¦VDæÖR’&WGW&âfÇ6S°¢&WGW&â7G&–ær‡v÷&²ææôö'&ÇÂ""’ÓÓÒæôö'&°¢Ò“°¢–b†GWÆ–6FUv÷&²’°¢6†÷tf÷&ÔW'&÷"†W7Fö'&¬:W7L:6F7G&F6öÖòG·v÷&´F—7Æ”Æ&VÂ†GWÆ–6FUv÷&²—ÒâVF—FRò6F7G&òW†—7FVçFR&Wf—F"GWÆ–6–FFRæÂf÷&Ò“°¢f÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ&æöÖR%Òr“òæfö7W2‚“°¢&WGW&ã°¢Ð ¢6öç7Bv÷&´f–VÆG2Ò°¢6÷W&6T†—7F÷&–6Å&V6÷&D–BÀ¢6†fUVæ–6¢7G&–ær†f÷&ÔFFævWB‚&6†fUVæ–6"’ÇÂ""’çG&–Ò‚’À¢6öF–vô÷&–v–æÂÀ¢æöÖRÀ¢F—õVæ–FFRÀ¢6–FFRÀ¢VbÀ¢&Vv–òÀ¢6Æ76–f–66ôö'&¢6æöæ–6Åv÷&´6FVv÷'’†f÷&ÔFFævWB‚&6Æ76–f–66ôö'&"’’À¢F—öÆöv–ö'&¢6æöæ–6Åv÷&µG—öÆöw’†f÷&ÔFFævWB‚'F—öÆöv–ö'&"’’À¢ÖWF7W7FôÓ%F&vWD–C¢7G&–ær†f÷&ÔFFævWB‚&ÖWF7W7FôÓ%F&vWD–B"’ÇÂ""’çG&–Ò‚’À¢&V6öç7G'V–FÀ¢&VWV—fÆVçFRÀ¢÷&FVÔ–çFW&æ4À¢F—õfW&&À¢÷&–vVÕfW&&¢F—õfW&&À¢fÆ÷%fW&&÷'FFÀ¢fÆ÷$W7F–ÖFòÀ¢ÆææVEfÇVS¢fÆ÷%fW&&÷'FFÀ¢fÆ÷$&÷fFó¢fÆ÷%fW&&÷'FFÀ¢6W„&÷fFó¢F—õfW&&ÓÓÒ$4U‚"òfÆ÷%fW&&÷'FF¢À¢÷W„&÷fFó¢F—õfW&&ÓÓÒ$õU‚"òfÆ÷%fW&&÷'FF¢À¢6ç£¢7G&–ær†f÷&ÔFFævWB‚&6ç¢"’ÇÂ""’çG&–Ò‚’À¢VæFW&V6ó¢7G&–ær†f÷&ÔFFævWB‚&VæFW&V6ò"’ÇÂ""’çG&–Ò‚’À¢&¦ôF–3¢çVÖ&W"æ—4f–æ—FR‡&¦ôF–2’bb&¦ôF–2âò&¦ôF–2¢""À¢æôö'&¢æôö'&æÆVæwF‚ÓÓÒBòæôö'&¢""À¢Ó° ¢–b†W†—7F–æuv÷&²’°¢6öç7B&Wf–÷W5v÷&²Ò6ÆöæR†W†—7F–æuv÷&²“°¢6öç7B&Wf–÷W4gVæG2Ò6ÆöæR‡7FFRægVæG2ÇÂµÒ“°¢6öç7B&Wf–÷W4ö•&÷w2Ò6ÆöæR‡7FFRæ6W„ÖçVÄö•&÷w2ÇÂµÒ“°¢6öç7B&Wf–÷W4†—7F÷'’Ò6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢6öç7B&Wf–÷W2ÒG¶W†—7F–æuv÷&²ææöÖWÒÂG¶W†—7F–æuv÷&²æ6†fUVæ–6Ö°¢ö&¦V7Bæ76–vâ†W†—7F–æuv÷&²Â°¢ââçv÷&´f–VÆG2À¢6†fUVæ–6¢v÷&´f–VÆG2æ6†fUVæ–6ÇÂW†—7F–æuv÷&²æ6†fUVæ–6ÇÂvVæW&FUv÷&´¶W’‡7FFRçv÷&·2æ–æFW„öb†W†—7F–æuv÷&²’²ÂVbÂF—õVæ–FFRÂv÷&´f–VÆG2çF—öÆöv–ö'&’À¢Ò“°¢7–æ5v÷&´'VFvWD–çFVw&F–öâ†W†—7F–æuv÷&²“°¢6VÆV7FVEv÷&´–BÒW†—7F–æuv÷&²æ–C°¢FD†—7F÷'’‡°¢VçF–FFS¢&ö'&"À¢VçF–FFT–C¢W†—7F–æuv÷&²æ–BÀ¢6×ó¢&VFœ:|:6ò"À¢fÆ÷$çFW&–÷#¢&Wf–÷W2À¢fÆ÷$æ÷fó¢G¶W†—7F–æuv÷&²ææöÖWÒÂG¶W†—7F–æuv÷&²æ6†fUVæ–6ÖÀ¢Ò“°¢f÷&ÒæFF6WBç6f–ærÒ'G'VR#°¢ÆWBv÷&µ6fVBÒfÇ6S°¢G'’°¢6öç7B6æ6†÷BÒW'6—7FVE7FFU–ÆöB‚“°¢v—BvÆö&ÅF†—2å4ÅEô4ÄõTBç6fTæEv—B‚'v÷&·2"Â6æ6†÷B“°¢v÷&µ6fVBÒG'VS°¢–b†æVVG4f–ææ6–Ä–çFVw&F–öâ’v—BvÆö&ÅF†—2å4ÅEô4ÄõTBç6fTæEv—B‚&'VFvWB"Â6æ6†÷B“°¢Ò6F6‚†W'&÷"’°¢–b‚v÷&µ6fVB’°¢ö&¦V7Bæ76–vâ†W†—7F–æuv÷&²Â&Wf–÷W5v÷&²“°¢7FFRægVæG2Ò&Wf–÷W4gVæG3°¢7FFRæ6W„ÖçVÄö•&÷w2Ò&Wf–÷W4ö•&÷w3°¢7FFRæ†—7F÷'’Ò&Wf–÷W4†—7F÷'“°¢Ð¢6†÷tf÷&ÔW'&÷"‡v÷&µ6fV@¢ò$ö'&fö’6ÇfÂÖ2–çFVw&:|:6òf–ææ6V—&fÆ†÷Râ&V6'&VwVRFò&æ6òçFW2FR6öçF–çV"â ¢¢W'&÷#òæÖW76vRÇÂ$VFœ:|:6òFö'&ì:6òfö’6öæf—&ÖFVÆò&æ6òâ"Âf÷&Ò“°¢&WGW&ã°¢Òf–æÆÇ’°¢FVÆWFRf÷&ÒæFF6WBç6f–æs°¢Ð¢6Æ÷6TÖöFÂ‚“°¢v÷&´ÖöFÅÆäG&gBÒçVÆÃ°¢6†÷uFö7B‚$FF÷2Fö'&GVÆ—¦F÷2æò÷'Fl;6Æ–òâ"“°¢&VæFW"‚“°¢&WGW&ã°¢Ð ¢6öç7B–BÒæW‡D6öFR‚$ô%""Â7FFRçv÷&·2“°¢6öç7BvVæW&FVD¶W’ÒvVæW&FUv÷&´¶W’‡7FFRçv÷&·2æÆVæwF‚²ÂVbÂF—õVæ–FFRÂf÷&ÔFFævWB‚'F—öÆöv–ö'&"’“°¢6öç7Bv÷&²Ò°¢–BÀ¢ââçv÷&´f–VÆG2À¢ÆVDÆV&æ–ætVæ&ÆVC¢6÷W&6T†—7F÷&–6Å&V6÷&D–BÀ¢ÆVDÆV&æVDæÖS¢""À¢ÆVDÆV&æVDFVÖæD–C¢""À¢6†fUVæ–6¢v÷&´f–VÆG2æ6†fUVæ–6ÇÂvVæW&FVD¶W’À¢7FGW3¢%ÆæV¦F"À¢Wc¢°¢ââçf—'GVÄV×G”Ub‡²–BÒ’À¢–C¢WbÒG¶–BçFôÆ÷vW$66R‚—ÖÀ¢ÒÀ¢Ó° ¢6öç7B&Wf–÷W4gVæG2Ò6ÆöæR‡7FFRægVæG2ÇÂµÒ“°¢6öç7B&Wf–÷W4ö•&÷w2Ò6ÆöæR‡7FFRæ6W„ÖçVÄö•&÷w2ÇÂµÒ“°¢6öç7B&Wf–÷W4†—7F÷'’Ò6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢6öç7B&Wf–÷W56VÆV7FVEv÷&´–BÒ6VÆV7FVEv÷&´–C°¢7FFRçv÷&·2çVç6†–gB‡v÷&²“°¢7–æ5v÷&´'VFvWD–çFVw&F–öâ‡v÷&²“°¢6VÆV7FVEv÷&´–BÒv÷&²æ–C°¢v÷&´ÖöFÅÆäG&gBÒçVÆÃ°¢÷'FföÆ–õV–6´f–ÇFW'2Ò7&VFU÷'FföÆ–õV–6´f–ÇFW'2‚“°¢÷'FföÆ–ôf–ÇFW'2Òö&¦V7Bæg&öÔVçG&–W2„ö&¦V7Bæ¶W—2‡÷'FföÆ–ôf–ÇFW'2’æÖ‚†¶W’’Óâ¶¶W’Â"%Ò’“°¢FD†—7F÷'’‡°¢VçF–FFS¢&ö'&"À¢VçF–FFT–C¢v÷&²æ–BÀ¢6×ó¢&7&–:|:6ò"À¢fÆ÷$çFW&–÷#¢$ì:6òW†—7F–"À¢fÆ÷$æ÷fó¢G·v÷&²ææöÖWÒÂG·v÷&²æ6†fUVæ–6ÖÀ¢Ò“°¢f÷&ÒæFF6WBç6f–ærÒ'G'VR#°¢ÆWBv÷&µ6fVBÒfÇ6S°¢G'’°¢6öç7B6æ6†÷BÒW'6—7FVE7FFU–ÆöB‚“°¢v—BvÆö&ÅF†—2å4ÅEô4ÄõTBç6fTæEv—B‚'v÷&·2"Â6æ6†÷B“°¢v÷&µ6fVBÒG'VS°¢–b†æVVG4f–ææ6–Ä–çFVw&F–öâ’v—BvÆö&ÅF†—2å4ÅEô4ÄõTBç6fTæEv—B‚&'VFvWB"Â6æ6†÷B“°¢Ò6F6‚†W'&÷"’°¢–b‚v÷&µ6fVB’°¢7FFRçv÷&·2Ò7FFRçv÷&·2æf–ÇFW"‚†—FVÒ’Óâ—FVÒæ–BÓÒv÷&²æ–B“°¢7FFRægVæG2Ò&Wf–÷W4gVæG3°¢7FFRæ6W„ÖçVÄö•&÷w2Ò&Wf–÷W4ö•&÷w3°¢7FFRæ†—7F÷'’Ò&Wf–÷W4†—7F÷'“°¢6VÆV7FVEv÷&´–BÒ&Wf–÷W56VÆV7FVEv÷&´–C°¢Ð¢6†÷tf÷&ÔW'&÷"‡v÷&µ6fV@¢ò$ö'&fö’6ÇfÂÖ2–çFVw&:|:6òf–ææ6V—&fÆ†÷Râ&V6'&VwVRFò&æ6òçFW2FR6öçF–çV"â ¢¢W'&÷#òæÖW76vRÇÂ$ò6F7G&òFö'&ì:6òfö’6öæf—&ÖFòVÆò&æ6òâ"Âf÷&Ò“°¢&WGW&ã°¢Òf–æÆÇ’°¢FVÆWFRf÷&ÒæFF6WBç6f–æs°¢Ð¢–b‡v÷&´ÖöFÅ&WGW&äÖöFRÓÓÒ'6–2"’°¢v÷&´ÖöFÅ&WGW&äÖöFRÒ"#°¢6†÷uFö7B†ö'&6F7G&FG¶æVVG4f–ææ6–Ä–çFVw&F–öâò"6öÒfW&&–çFVw&F"¢"'Òâ6öçF–çVRò&Vv—7G&òF4”2f–æ7VÆFòUbæ“°¢÷Vå6–4FVÖæDÖöFÂ‡v÷&²æ–B“°¢&WGW&ã°¢Ð¢6Æ÷6TÖöFÂ‚“°¢6†÷uFö7B‡6÷W&6T†—7F÷&–6Å&V6÷&D–@¢ò$FF÷2Fö'&†—7L;7&–6GVÆ—¦F÷2æò÷'Fl;6Æ–ò6VÒGWÆ–6"òUbâ ¢¢ö'&6F7G&Fæò÷'Fl;6Æ–ò6VÒUbG¶æVVG4f–ææ6–Ä–çFVw&F–öâò"R6öÒfW&&–çFVw&Fò6öçG&öÆRFRfW&&2"¢"'Òæ“°¢&VæFW"‚“°§Ð ¦gVæ7F–öâvVæW&FUv÷&´¶W’†–æFW‚ÂVbÂF—õVæ–FFRÂF—öÆöv–’°¢6öç7B6ÆVåVbÒ7G&–ær‡VbÇÂ%…‚"’çFõWW$66R‚’ç&WÆ6R‚õµäÕ¥ÒörÂ""’ç6Æ–6RƒÂ"’ÇÂ%…‚#°¢6öç7BG—UFW‡BÒæ÷&ÖÆ—¦U6V&6…FW‡B†6ÆVä–×÷'FVEFW‡B‡F—õVæ–FFR’“°¢6öç7BG—T6öFRÒG—UFW‡Bæ–æ6ÇVFW2‚&†÷7—FÂ"¢ò$„õ5 ¢¢G—UFW‡Bæ–æ6ÇVFW2‚&6Æ–â"¢ò$4Ä’ ¢¢G—UFW‡Bæ–æ6ÇVFW2‚'FV"¢ò%DT ¢¢G—UFW‡Bæ–æ6ÇVFW2‚'&öçFò"’ÇÂG—UFW‡BÓÓÒ' ¢ò% ¢¢%TäB#°¢6öç7Bæ÷&ÖÆ—¦VEG—öÆöw’Ò6æöæ–6Åv÷&µG—öÆöw’‡F—öÆöv–“°¢6öç7BG—öÆöw”6öFRÒæ÷&ÖÆ—¦VEG—öÆöw’ÓÓÒ%&WG&öf—BVæ–FFRW†—7FVçFR ¢ò%$eB ¢¢æ÷&ÖÆ—¦VEG—öÆöw’ÓÓÒ$×Æ–:|:6òVæ–FFRW†—7FVçFR ¢ò$Õ ¢¢æ÷&ÖÆ—¦VEG—öÆöw’ÓÓÒ%&WG&öf—B²×Æ–:|:6ò"ò%$d"¢$åeR#°¢&WGW&âGµ7G&–ær†–æFW‚’çE7F'BƒRÂ#"—Õõ4ÅEòG·G—T6öFWÕòG·G—öÆöw”6öFWÕòG¶6ÆVåVgÖ°§Ð ¦7–æ2gVæ7F–öâ†æFÆTFVÖæE7V&Ö—B†f÷&Ò’°¢–b‚Vç7W&TFVÖæDÆ–fV7–6ÆTÆÆ÷vVB†f÷&Ò’’&WGW&ã°¢6öç7Bf÷&ÔFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7BæÇ—7D76–væÖVçBÒæÇ—7D76–væÖVçDg&öÔf÷&Ò†f÷&ÒÂ°¢æÆ—7F&W7öç6fVÃ¢f÷&ÔFFævWB‚&æÆ—7F6ÆFV6æ–6"’ÇÂf÷&ÔFFævWB‚&æÆ—7F&W7öç6fVÂ"’ÇÂf÷&ÔFFævWB‚&æÆ—7F"’À¢Ò“°¢–b‚fÆ–FFTFVÖæDæÇ—7G2†æÇ—7D76–væÖVçBÂf÷&Ò’’&WGW&ã°¢6öç7B&ö¦V7E6VÆV7F–öâÒ&VDFVÖæE&ö¦V7G4g&öÔf÷&Ò†f÷&Ò“°¢6öç7BF—òÒf÷&ÔFFævWB‚'F—ò"“°¢ÆWBö'&–BÒ&W6öÇfUv÷&´–Dg&öÔFVÖæDf÷&Ò†f÷&ÔFFÂ²VÆ–v–&ÆTöæÇ“¢G'VRÒ“°¢òòFVÖæF2W†6Ç\:ÖF26öçF–çVÒ&W6W'fæFòò<;6F–vòæò&æ6òâ6öç6–FW,:ÖÆ0¢òòWf—FFVçF"&V7&–"Â÷"W†V×ÆòÂDTÒÓ#6ö'&RVÒ&Vv—7G&ò'V—fFòà¢6öç7BFVÖæD–BÒæW‡DFVÖæD6öFR‚“°¢6öç7B6–4–G2ÒµÓ°¢ÆWB6–4ÖWFFFÒçVÆÃ°¢ÆWB6–4G&gDF—66—Æ–æW2ÒµÓ°¢6öç7B6–4Væv–æVW&–ætÖVWF–ærÒF—òÓÓÒ%4”2"bbf÷&ÔFFævWB‚'6–4Væv–æVW&–ætÖVWF–ær"’ÓÓÒ&öâ#° ¢–b‚ö'&–B’°¢6†÷tf÷&ÔW'&÷"‚%6VÆV6–öæRVÖö'&6F7G&FFòæòFR##RVÒF–çFRçFW2FR6Çf"FVÖæFâ"Âf÷&Ò“°¢&WGW&ã°¢Ð ¢ÆWBÆ–æ¶VEv÷&²Òv÷&´'”–B†ö'&–B“°¢–b‚Æ–æ¶VEv÷&²’°¢6†÷tf÷&ÔW'&÷"‚$ö'&f–æ7VÆFì:6òW7L:F—fâ6VÆV6–öæRVÖö'&6F7G&Fæò÷'Fl;6Æ–òçFW2FR6Çf"FVÖæFâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢–b‚—4FVÖæEv÷&´VÆ–v–&ÆR†Æ–æ¶VEv÷&²’’°¢6†÷tf÷&ÔW'&÷"‚%&6F7G&"VÖFVÖæFÂ6VÆV6–öæRVÖö'&FòæòFR##RVÒF–çFRâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BVæ–FFTÖöFòÒf÷&ÔFFævWB‚'Væ–FFTÖöFò"’ÓÓÒ&W†—7FVçFR"ò&W†—7FVçFR"¢&æ÷f#°¢6öç7B6VÆV7FVEVæ—BÒVæ–FFTÖöFòÓÓÒ&W†—7FVçFR"òÖ–çFVææ6UVæ—D'”–B†f÷&ÔFFævWB‚'Væ–FFT–B"’’ÇÂf–æDÖ–çFVææ6UVæ—D'•G—VE6V&6‚†f÷&ÔFFævWB‚'Væ–FFT'W66"’’¢çVÆÃ°¢–b‡Væ–FFTÖöFòÓÓÒ&W†—7FVçFR"bb6VÆV7FVEVæ—B’°¢6†÷tf÷&ÔW'&÷"‚%6VÆV6–öæRVÖVæ–FFRW†—7FVçFRVÆò76—7FVçFRFR'W66çFW2FR6Çf"FVÖæFâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BVæ—D6öçFW‡BÒFVÖæEVæ—D6öçFW‡Df–VÆG2‡6VÆV7FVEVæ—BÂVæ–FFTÖöFòÂ°¢Væ–FFT–C¢f÷&ÔFFævWB‚'Væ–FFT–B"’ÇÂ""À¢Væ–FFT'W66¢f÷&ÔFFævWB‚'Væ–FFT'W66"’ÇÂ""À¢Væ–FFTæöÖS¢f÷&ÔFFævWB‚'Væ–FFTæöÖR"’ÇÂ‡Væ–FFTÖöFòÓÓÒ&æ÷f"òÆ–æ¶VEv÷&³òææöÖRÇÂ""¢""’À¢Væ–FFUF—ó¢f÷&ÔFFævWB‚'Væ–FFUF—ò"’ÇÂ‡Væ–FFTÖöFòÓÓÒ&æ÷f"òÆ–æ¶VEv÷&³òçF—õVæ–FFRÇÂ""¢""’À¢Væ–FFT6ç£¢f÷&ÔFFævWB‚'Væ–FFT6ç¢"’ÇÂ‡Væ–FFTÖöFòÓÓÒ&æ÷f"òÆ–æ¶VEv÷&³òæ6ç¢ÇÂ""¢""’À¢Væ–FFT×Væ–6—–ó¢f÷&ÔFFævWB‚'Væ–FFT×Væ–6—–ò"’ÇÂ‡Væ–FFTÖöFòÓÓÒ&æ÷f"ò¶Æ–æ¶VEv÷&³òæ6–FFRÂÆ–æ¶VEv÷&³òçVeÒæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"ò"’¢""’À¢Væ–FFT6VçG&ó¢f÷&ÔFFævWB‚'Væ–FFT6VçG&ò"’ÇÂ‡Væ–FFTÖöFòÓÓÒ&æ÷f"òÆ–æ¶VEv÷&³òæ6öF–vô÷&–v–æÂÇÂ""¢""’À¢Væ–FFU6÷W&6S¢f÷&ÔFFævWB‚'Væ–FFU6÷W&6R"’ÇÂ‡Væ–FFTÖöFòÓÓÒ&æ÷f"ò%÷'Fl;6Æ–òFRö'&2"¢""’À¢Ò“° ¢–b‡F—òÓÓÒ%4”2"’°¢6öç7BÆV6öÔçVÖ&W"Ò7G&–ær†f÷&ÔFFævWB‚&ÆV6öÔçVÖ&W""’ÇÂ""’çG&–Ò‚“°¢6öç7Bö'&çVÖ&W"Ò7G&–ær†Æ–æ¶VEv÷&³òæ6†fUVæ–6ÇÂÆ–æ¶VEv÷&³òæ6öF–vô÷&–v–æÂÇÂ""’çG&–Ò‚“°¢6öç7Bö'&æöÖRÒ7G&–ær†Æ–æ¶VEv÷&³òææöÖRÇÂ""’çG&–Ò‚“°¢6öç7BF—GVÆõ6–2Ò7G&–ær†f÷&ÔFFævWB‚'F—GVÆõ6–2"’ÇÂ""’çG&–Ò‚“°¢6öç7BçVÖW&õ6–2Ò7G&–ær†f÷&ÔFFævWB‚&çVÖW&õ6–2"’ÇÂ""’çG&–Ò‚“°¢6öç7BFW67&–6õ6–2Ò7G&–ær†f÷&ÔFFævWB‚&FW67&–6ò"’ÇÂ""’çG&–Ò‚“°¢6öç7BæÆ—7F6ÆFV6æ–6ÒæÇ—7D76–væÖVçBææÆ—7F&W7öç6fVÃ°¢6öç7BÖ÷F—fòÒæ÷&ÖÆ—¦U6–4Ö÷F—fò†f÷&ÔFFævWB‚&Ö÷F—fò"’ÇÂ%&Wf—6õ&ö¦WFò"“°¢6öç7BæW†÷2ÒµÓ° ¢–b‚ÆV6öÔçVÖ&W"ÇÂF—GVÆõ6–2ÇÂFW67&–6õ6–2ÇÂæÆ—7F6ÆFV6æ–6’°¢6†÷tf÷&ÔW'&÷"‚%&VVæ6†òì;¦ÖW&òFòÄT4ôÒÂL:×GVÆòÂFW67&œ:|:6òF4”2RæÆ—7FF6ÆL:–6æ–6â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BÆV6öÔ6öæfÆ–7BÒf–æE6–4ÆV6öÔ6öæfÆ–7B†ÆV6öÔçVÖ&W"“°¢–b†ÆV6öÔ6öæfÆ–7B’°¢6†÷tf÷&ÔW'&÷"‡6–4ÆV6öÔ6öæfÆ–7DÖW76vR†ÆV6öÔçVÖ&W"ÂÆV6öÔ6öæfÆ–7B’Âf÷&Ò“°¢f÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ&ÆV6öÔçVÖ&W"%Òr“òæfö7W2‚“°¢&WGW&ã°¢Ð ¢6–4G&gDF—66—Æ–æW2ÒµÓ°¢6–4ÖWFFFÒ°¢ÆV6öÔçVÖ&W"À¢ö'&çVÖ&W"À¢ö'&æöÖRÀ¢F—GVÆõ6–2À¢çVÖW&õ6–2À¢FW67&–6õ6–2À¢æÆ—7F6ÆFV6æ–6À¢Ö÷F—fòÀ¢æW†÷2À¢Ó°¢Ð ¢Æ–æ¶VEv÷&²ÒVç7W&TFVÖæEv÷&µW'6—7FVB†Æ–æ¶VEv÷&²“°¢–b‚Æ–æ¶VEv÷&²’°¢6†÷tf÷&ÔW'&÷"‚$ì:6òfö’÷7<:×fVÂ6öç6öÆ–F"ö'&6VÆV6–öæFæò6F7G&òÖW7G&Râ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢ö'&–BÒÆ–æ¶VEv÷&²æ–C° ¢6öç7B7&–çD–G2Ò7&–çD–G4g&öÔf÷&ÔFF†f÷&ÔFF“°¢6öç7BFVÖæD7&VFVDBÒæWrFFR‚’çFô•4õ7G&–ær‚“°¢7FFRæFVÖæG2çVç6†–gB‡°¢–C¢FVÖæD–BÀ¢ö'&–BÀ¢ââçVæ—D6öçFW‡BÀ¢F—òÀ¢7&–çD–G2À¢7&–çD–C¢7&–çD–G2æB‚Ó’ÇÂ""À¢ââææÇ—7D76–væÖVçBÀ¢&–÷&–FFS¢f÷&ÔFFævWB‚'&–÷&–FFR"’À¢WF—VWF3¢æ÷&ÖÆ—¦TFVÖæDÆ&VÇ2†f÷&ÔFFævWB‚&WF—VWF2"’’À¢6öÇVæ¢æWuv÷&´FVÖæD6öÇVÖâ‡F—ò’À¢†6U7F'FVDC¢FVÖæD7&VFVDBÀ¢†6TVæFVDC¢""À¢†6U7F'FVDDW7F–ÖFVC¢fÇ6RÀ¢7&VFVDC¢FVÖæD7&VFVDBÀ¢FF&Wf—7F–æ–6–ó¢f÷&ÔFFævWB‚&FF&Wf—7F–æ–6–ò"’ÇÂFöF”•4ò‚’À¢FF–æ–6–õ&VÃ¢f÷&ÔFFævWB‚&FF–æ–6–õ&VÂ"’ÇÂ""À¢FF&WdVçf–õfÆ–F6ôö'&3¢f÷&ÔFFævWB‚&FF&WdVçf–õfÆ–F6ôö'&2"’ÇÂ""À¢FFVçf–õ&VÅfÆ–F6ôö'&3¢f÷&ÔFFævWB‚&FFVçf–õ&VÅfÆ–F6ôö'&2"’ÇÂ""À¢FFfÆ–F6ôö'&3¢f÷&ÔFFævWB‚&FFfÆ–F6ôö'&2"’ÇÂ""À¢FF&Wf—7FVçG&Vv¢f÷&ÔFFævWB‚&FF&Wf—7FVçG&Vv"’ÇÂ‡F—òÓÓÒ%4”2"òFDF—4•4ò‡FöF”•4ò‚’ÂR’¢""’À¢FFVçG&Vv&VÃ¢f÷&ÔFFævWB‚&FFVçG&Vv&VÂ"’ÇÂ""À¢æôVçf–%fÆ–F6ôö'&3¢f÷&ÔFFævWB‚&æôVçf–%fÆ–F6ôö'&2"’ÓÓÒ&öâ"À¢ö'6W'f6ó¢f÷&ÔFFævWB‚&FW67&–6ò"’ÇÂf÷&ÔFFævWB‚&ö'6W'f6ò"’À¢æ÷F¢f÷&ÔFFævWB‚&æ÷F"’ÇÂ""À¢&ö¦WF÷4VçföÇf–F÷3¢&ö¦V7E6VÆV7F–öâç6VÆV7FVBÀ¢&ö¦WF÷4VçföÇf–F÷4FWFÆ†W3¢&ö¦V7E6VÆV7F–öâæFWF–Ç2À¢6–4ÖWFFFÀ¢6–4Væv–æVW&–ætÖVWF–ærÀ¢6–4G&gDF—66—Æ–æW2À¢6–4&÷fÅ7FGW3¢""À¢6–4&÷fÅ&WVW7FVDC¢""À¢6–4&÷fÄ&÷fVDC¢""À¢6–4&÷fÄ&÷fVD'“¢""À¢6–4&÷fÅ&V¦V7FVDC¢""À¢6–4&÷fÅ&V¦V7FVD'“¢""À¢6–5÷7FVDC¢""À¢æW†÷3¢6–4ÖWFFFòææW†÷2ÇÂµÒÀ¢6–4–G2À¢Ò“° ¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæD–BÀ¢6×ó¢&7&–:|:6ò"À¢fÆ÷$çFW&–÷#¢$ì:6òW†—7F–"À¢fÆ÷$æ÷fó¢G¶FVÖæEG—TÆ&VÂ‡F—ò—Ò7&–FÀ¢Ò“°¢–b‡6–4Væv–æVW&–ætÖVWF–ær’°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæD–BÀ¢6×ó¢'&WVæ–ôVævVæ†&–"À¢fÆ÷$çFW&–÷#¢$ì:6ò6–æÆ—¦F"À¢fÆ÷$æ÷fó¢$6ö'&FòVÒ&WVæœ:6ò"À¢Ò“°¢Ð ¢6öç7B7V&Ö—D'WGFöâÒf÷&ÒçVW'•6VÆV7F÷"‚u¶FFÖ7F–öãÒ'7V&Ö—BÖFVÖæBÖf÷&Ò%Òr“°¢–b‡7V&Ö—D'WGFöâ’7V&Ö—D'WGFöâæF—6&ÆVBÒG'VS°¢G'’°¢v—B6fU7FFTæEv—B‚“°¢Ò6F6‚†W'&÷"’°¢7FFRæFVÖæG2Ò7FFRæFVÖæG2æf–ÇFW"‚†FVÖæB’ÓâFVÖæBæ–BÓÒFVÖæD–B“°¢7FFRæ†—7F÷'’Ò7FFRæ†—7F÷'’æf–ÇFW"‚†VçG'’’Óâ†VçG'’æVçF–FFRÓÓÒ&FVÖæF"bbVçG'’æVçF–FFT–BÓÓÒFVÖæD–B’“°¢–b‡7V&Ö—D'WGFöâ’7V&Ö—D'WGFöâæF—6&ÆVBÒfÇ6S°¢6öç7B&æ´ÖW76vRÒ7G&–ær†W'&÷#òæÖW76vRÇÂ""“°¢6†÷tf÷&ÔW'&÷"‚ôÄT4ôÒâ¶¬:W†—7FRö’çFW7B†&æ´ÖW76vR¢ò&æ´ÖW76vP¢¢$FVÖæFì:6òfö’6öæf—&ÖFæò&æ6òRfö’&WF—&FFFVÆâ&V6'&VwVR÷2FF÷2çFW2FRFVçF"æ÷fÖVçFRâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6Æ÷6TÖöFÂ‚“°¢6VÆV7FVEv÷&´–BÒö'&–C°¢–b‡F—òÓÓÒ%4”2"’°¢&W6WD÷W&F–öæÄf–ÇFW'2‚“°¢÷W&F–öæÅf–WtÖöFRÒ&¶æ&â#°¢6†÷uFö7B‚$FVÖæFFR4”26Çfæò¶æ&ââ"“°¢6WEf–Wr‚'v÷&·4÷W&F–öæÂ"“°¢&WGW&ã°¢Ð¢6†÷uFö7B‚$FVÖæF7&–F6öÒ&7G&V&–Æ–FFR÷"F—66—Æ–æâ"“°¢&VæFW"‚“°§Ð ¦7–æ2gVæ7F–öâ÷7DFVÖæE6–5FôUb†FVÖæD–B’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒFVÖæD–B“°¢–b‚FVÖæBÇÂFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÒ%4”2"’&WGW&ã°¢–b‚†FVÖæBç6–4–G2ÇÂµÒ’æÆVæwF‚’°¢6†÷uFö7B‚$W7F4”2¬:fö’÷7FFæòUbâ"“°¢&WGW&ã°¢Ð¢6öç7B&÷fÂÒ6–4&÷fÅ&VF–ær†FVÖæB“°¢–b†&÷fÂç7FGW2ÓÒ$&÷fFò"’°¢6†÷tf÷&ÔW'&÷"‚$4”2&V6—66W"&÷fFæ&4”72â&÷f:|:6òçFW2F÷7FvVÒæòUbâ"ÂFö7VÖVçBçVW'•6VÆV7F÷"†6FVÖæDFWF–Äf÷&Õ¶FFÖ–CÒ"G¶FVÖæBæ–GÒ%Ö’“°¢&WGW&ã°¢Ð¢6öç7Bv÷&²Òv÷&´'”–B†FVÖæBæö'&–B“°¢6öç7BFVÖæD–æFW‚Ò7FFRæFVÖæG2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒFVÖæBæ–B“°¢6öç7Bv÷&´–æFW‚Ò7FFRçv÷&·2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒv÷&³òæ–B“°¢6öç7BFVÖæE6æ6†÷BÒ6ÆöæR†FVÖæB“°¢6öç7Bv÷&µ6æ6†÷BÒv÷&²ò6ÆöæR‡v÷&²’¢çVÆÃ°¢6öç7B6–756æ6†÷BÒ6ÆöæR‡7FFRç6–72ÇÂµÒ“°¢6öç7B†—7F÷'•6æ6†÷BÒ6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢6öç7BÖWFFFÒFVÖæBç6–4ÖWFFFÇÂ·Ó°¢6öç7BFWF–Äf÷&ÒÒFö7VÖVçBçVW'•6VÆV7F÷"†6FVÖæDFWF–Äf÷&Õ¶FFÖ–CÒ"G¶FVÖæBæ–GÒ%Ö“°¢6öç7BFW67&—F–öäg&öÔf÷&ÒÒFWF–Äf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ'6–4FW67&–6ò%Òr“òçfÇVS°¢–b†FW67&—F–öäg&öÔf÷&ÒÒçVÆÂ’°¢ÖWFFFæFW67&–6õ6–2ÒFW67&—F–öäg&öÔf÷&Ó°¢FVÖæBç6–4ÖWFFFÒÖWFFF°¢FVÖæBæö'6W'f6òÒFW67&—F–öäg&öÔf÷&Ó°¢Ð¢ÆWBæWtGF6†ÖVçG2ÒµÓ°¢G'’°¢æWtGF6†ÖVçG2Òv—Bf–ÆTGF6†ÖVçDÖWFFF†FWF–Äf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ'6–4FWF–Äf–ÆW2%Òr’Â²VçF–FFS¢&FVÖæF"ÂVçF–FFT–C¢FVÖæBæ–BÂF—ó¢%4”2"Ò“°¢Ò6F6‚†W'&÷"’°¢6öç6öÆRçv&â‚$fÆ†òw&f"æW†÷2çFW2F÷7FvVÒF4”2â"ÂW'&÷"“°¢6†÷tf÷&ÔW'&÷"‚$ì:6ò6öç6VwV’6Çf"÷2æW†÷2çFW2F÷7FvVÒæòUbâFVçFRæW†"æ÷fÖVçFR÷R&VGW¦òFÖæ†òF÷2'V—f÷2â"ÂFWF–Äf÷&Ò“°¢&WGW&ã°¢Ð¢–b†æWtGF6†ÖVçG2æÆVæwF‚’°¢ÖWFFFææW†÷2ÒVæ—VTGF6†ÖVçG2…²âââ†ÖWFFFææW†÷2ÇÂµÒ’ÂââææWtGF6†ÖVçG5Ò“°¢FVÖæBç6–4ÖWFFFÒÖWFFF°¢FVÖæBææW†÷2ÒVæ—VTGF6†ÖVçG2…²âââ†FVÖæBææW†÷2ÇÂµÒ’ÂââææWtGF6†ÖVçG5Ò“°¢Ð¢6öç7B–æfòÒFVÖæE6–4–æfò†FVÖæB“°¢6öç7BG&gDg&öÔf÷&ÒÒ&VE6–4G&gDF—66—Æ–æW4g&öÔf÷&Ò†FWF–Äf÷&Ò“°¢–b†G&gDg&öÔf÷&ÒæÆVæwF‚’FVÖæBç6–4G&gDF—66—Æ–æW2ÒG&gDg&öÔf÷&Ó°¢6öç7BffV7FVBÒ†FVÖæBç6–4G&gDF—66—Æ–æW2ÇÂµÒ¢æÖ‚†—FVÒ’Óâ‡°¢F—66—Æ–æ–C¢—FVÒæF—66—Æ–æ–BÀ¢fÆ÷$FVÇF¢çVÖ&W"†—FVÒçfÆ÷$FVÇF’ÇÂÀ¢Ò’¢æf–ÇFW"‚†—FVÒ’Óâ—FVÒæF—66—Æ–æ–BÇÂ—FVÒçfÆ÷$FVÇF“° ¢–b‚v÷&²ÇÂ–æfò’°¢6†÷tf÷&ÔW'&÷"‚$ì:6òfö’÷7<:×fVÂÆö6Æ—¦"ö'&f–æ7VÆF&÷7F"4”2æòUbâ"“°¢&WGW&ã°¢Ð¢–b‚ffV7FVBæÆVæwF‚’°¢6†÷tf÷&ÔW'&÷"‚$6F7G&RòÖVæ÷2VÖF—66—Æ–æfWFFçFW2FR÷7F"4”2æòUbâ"“°¢&WGW&ã°¢Ð ¢6öç7B6–4Ö÷F—fòÒæ÷&ÖÆ—¦U6–4Ö÷F—fò†ÖWFFFæÖ÷F—fòÇÂ–æfòæÖ÷F—fò“°¢6öç7B—4–æf÷&ÖF–öæÅ6–2Ò²$–æf÷&Ö6ô6öçG&FF"Â%6öÆ–6—F6ô6×ò%Òæ–æ6ÇVFW2‡6–4Ö÷F—fò“°¢6öç7B–çfÆ–BÒffV7FVBæf–æB‚†—FVÒ’Óâ°¢6öç7BF—66—Æ–æRÒF—66—Æ–æT'”–B†—FVÒæF—66—Æ–æ–B“°¢&WGW&â—FVÒæF—66—Æ–æ–BÇÂF—66—Æ–æRç6VÆV6–öæfVÅ&4”2ÇÂ‚—4–æf÷&ÖF–öæÅ6–2bb—FVÒçfÆ÷$FVÇFÓÓÒ“°¢Ò“° ¢–b†–çfÆ–B’°¢6†÷tf÷&ÔW'&÷"†—4–æf÷&ÖF–öæÅ6–2ò$6FÆ–æ†F4”2&V6—6FW"VÖF—66—Æ–æ6VÆV6–öì:fVÂâ"¢%&÷7F"æòUbÂ6FÆ–æ†&V6—6FW"F—66—Æ–æ6VÆV6–öì:fVÂRfÆ÷"FVÇFl:Æ–Fòâ"“°¢&WGW&ã°¢Ð ¢6öç7B÷6—F—fTFVÇFÒffV7FVBç&VGV6R‚‡7VÒÂ—FVÒ’Óâ7VÒ²ÖF‚æÖ‚†—FVÒçfÆ÷$FVÇFÂ’Â“°¢6öç7B&VÖ–æ–æu&—6²Òv÷&µ&—6µ&W6W'fR‡v÷&²’Ò&÷fVE÷6—F—fU6–5F÷FÄf÷%v÷&²‡v÷&²æ–B“°¢6öç7B&—6µ&VF–ærÒ6–5&—6µ&VF–ær‡v÷&²ÂçVÆÂÂ÷6—F—fTFVÇF“°¢6öç7B&—6´W†6VVFVBÒ÷6—F—fTFVÇFâÖF‚æÖ‚‡&VÖ–æ–æu&—6²Â“° ¢6öç7B6–4–BÒæW‡D6öFR‚%4”2"Â7FFRç6–72“°¢6öç7BF6…FôV×G’Ò‡fÇVR’Óâ‡fÇVRbbfÇVRÓÒ.(	B"òfÇVR¢""“°¢6öç7B6–2Ò°¢–C¢6–4–BÀ¢ö'&–C¢v÷&²æ–BÀ¢FVÖæF–C¢FVÖæBæ–BÀ¢ÆV6öÔçVÖ&W#¢F6…FôV×G’†–æfòæÆV6öÔçVÖ&W"’À¢ö'&çVÖ&W#¢F6…FôV×G’†–æfòæö'&çVÖ&W"’À¢ö'&æöÖS¢F6…FôV×G’†–æfòæö'&æöÖR’À¢F—GVÆó¢F6…FôV×G’†–æfòçF—GVÆõ6–2’À¢çVÖW&õ6–3¢F6…FôV×G’†–æfòæçVÖW&õ6–2’ÇÂ6–4–BÀ¢F—66—Æ–æ4fWFF3¢ffV7FVBÀ¢Ö÷F—fó¢æ÷&ÖÆ—¦U6–4Ö÷F—fò†ÖWFFFæÖ÷F—fòÇÂ–æfòæÖ÷F—fòÇÂ%&Wf—6õ&ö¦WFò"’À¢FW67&–6ó¢F6…FôV×G’†–æfòæFW67&–6õ6–2’À¢Fö7VÖVçFõW&Ã¢†–æfòææW†÷2ÇÂµÒ’æÖ‚†f–ÆR’Óâf–ÆRææöÖR’æ¦ö–â‚"Â"’À¢æW†÷3¢–æfòææW†÷2ÇÂµÒÀ¢æÆ—7F6ÆFV6æ–6¢F6…FôV×G’†–æfòææÆ—7F6ÆFV6æ–6’À¢WdÆ–æTF—66—Æ–æT–C¢'6–72"À¢&—6´W†6VVFVBÀ¢&—6µ&W6W'fTE÷7C¢&—6µ&VF–ærç&W6W'fRÀ¢&—6´f–Æ&ÆTE÷7C¢&—6µ&VF–æræf–Æ&ÆRÀ¢&—6´W†6W74E÷7C¢&—6µ&VF–æræW†6W72À¢7FGW3¢$&÷fFò"À¢&÷fFõ÷#¢FVÖæBç6–4&÷fÄ&÷fVD'’ÇÂ7W'&VçEW6W"‚“òææöÖRÇÂ$vW7L:6ò5B"À¢FF&W'GW&¢FöF”•4ò‚’À¢FF&÷f6ó¢FVÖæBç6–4&÷fÄ&÷fVDBÇÂFöF”•4ò‚’À¢Ó° ¢7FFRç6–72çVç6†–gB‡6–2“°¢7–æ56–5v—F„Ub‡v÷&²Â6–2“°¢7–æ5v÷&µ6–57VÖÖ'”Æ–æR‡v÷&²“°¢FVÖæBç6–4–G2Ò·6–2æ–EÓ°¢FVÖæBç6–5÷7FVDBÒFöF”•4ò‚“°¢FVÖæBç6–4&÷fÅ7FGW2Ò%÷7FF#°¢FVÖæBç6–4ÖWFFFÒ°¢ââæÖWFFFÀ¢çVÖW&õ6–3¢6–2æçVÖW&õ6–2À¢7FGW3¢%÷7FFæòUb"À¢Ó° ¢FD†—7F÷'’‡°¢VçF–FFS¢'6–2"À¢VçF–FFT–C¢6–2æ–BÀ¢6×ó¢'÷7FvVÒæòUb"À¢fÆ÷$çFW&–÷#¢$FVÖæF÷W&6–öæÂ"À¢fÆ÷$æ÷fó¢ffV7FVBæÖ‚†—FVÒ’ÓâF—66—Æ–æT'”–B†—FVÒæF—66—Æ–æ–B’ææöÖR’æ¦ö–â‚"Â"’À¢Ò“°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢%4”2"À¢fÆ÷$çFW&–÷#¢%&67Væ†ò÷W&6–öæÂ"À¢fÆ÷$æ÷fó¢G·6–2æ–GÒ÷7FFæòUfÀ¢Ò“° ¢G'’°¢v—B6fU7FFTæEv—B‚“°¢Ò6F6‚†W'&÷"’°¢–b†FVÖæD–æFW‚ãÒ’7FFRæFVÖæG5¶FVÖæD–æFW…ÒÒFVÖæE6æ6†÷C°¢–b‡v÷&´–æFW‚ãÒbbv÷&µ6æ6†÷B’7FFRçv÷&·5·v÷&´–æFW…ÒÒv÷&µ6æ6†÷C°¢7FFRç6–72Ò6–756æ6†÷C°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢6†÷tf÷&ÔW'&÷"†W'&÷#òæÖW76vRÇÂ$÷7FvVÒF4”2ì:6òfö’6öæf—&ÖFVÆò&æ6òâ&V6'&VwVR÷2FF÷2çFW2FRFVçF"æ÷fÖVçFRâ"ÂFWF–Äf÷&Ò“°¢&WGW&ã°¢Ð¢6VÆV7FVEv÷&´–BÒv÷&²æ–C°¢6†÷uFö7B‚%4”2÷7FFæòUbâ"“°¢&VæFW"‚“°¢÷VäUdÖöFÂ‡v÷&²æ–B“°§Ð ¦7–æ2gVæ7F–öâ†æFÆTFVÖæDFWF–Å7V&Ö—B†f÷&Ò’°¢6öç7BFVÖæD–æFW‚Ò7FFRæFVÖæG2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒf÷&ÒæFF6WBæ–B“°¢6öç7BFVÖæBÒ7FFRæFVÖæG5¶FVÖæD–æFW…Ó°¢–b‚FVÖæB’&WGW&ã°¢6öç7BFVÖæE6æ6†÷BÒ6ÆöæR†FVÖæB“°¢6öç7B&Wf–÷W5v÷&´–BÒFVÖæBæö'&–BÇÂ"#°¢6öç7Bv÷&´–æFW‚Ò7FFRçv÷&·2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒFVÖæBæö'&–B“°¢6öç7Bv÷&µ6æ6†÷BÒv÷&´–æFW‚ãÒò6ÆöæR‡7FFRçv÷&·5·v÷&´–æFW…Ò’¢çVÆÃ°¢6öç7B6–756æ6†÷BÒ6ÆöæR‡7FFRç6–72ÇÂµÒ“°¢6öç7B†—7F÷'•6æ6†÷BÒ6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢6öç7Bf÷&ÔFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7B6VÆV7FVD6öÇVÖäg&öÔf÷&ÒÒf÷&ÔFFævWB‚&6öÇVæ"’ÇÂFVÖæBæ6öÇVæ°¢6öç7BÖ÷fVÖVçE&V6öâÒ7G&–ær†f÷&ÔFFævWB‚'7FGW5&V6öâ"’ÇÂ""’çG&–Ò‚“°¢–b…²'W6Fò"Â&6æ6VÆFò%Òæ–æ6ÇVFW2‡6VÆV7FVD6öÇVÖäg&öÔf÷&Ò’bbÖ÷fVÖVçE&V6öâæÆVæwF‚ÂR’°¢6†÷tf÷&ÔW'&÷"‡6VÆV7FVD6öÇVÖäg&öÔf÷&ÒÓÓÒ&6æ6VÆFò ¢ò$W‡Æ—VRòÖ÷F—fòFò6æ6VÆÖVçFòçFW2FR6Çf"â ¢¢$W‡Æ—VRòÖ÷F—fòFW6çFW2FR6Çf"â"Âf÷&Ò“°¢f÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ'7FGW5&V6öâ%Òr“òæfö7W2‚“°¢&WGW&ã°¢Ð¢6öç7B&Wf–÷W57FGW5&V6öâÒFVÖæE7FGW5&V6öâ†FVÖæBÂ6VÆV7FVD6öÇVÖäg&öÔf÷&Ò“°¢6öç7B&Wf–÷W4æÇ—7G2ÒFVÖæDæÇ—7DæÖW2†FVÖæB“°¢6öç7B&Wf–÷W5&ö¦V7G2Ò'&”÷$fÆÆ&6²†FVÖæBç&ö¦WF÷4VçföÇf–F÷2’æÖ‚‡fÇVR’Óâ7G&–ær‡fÇVR’“°¢6öç7B&Wf–÷W5&ö¦V7DFWF–Ç2Òæ÷&ÖÆ—¦TFVÖæE&ö¦V7DFWF–Ç2†FVÖæBç&ö¦WF÷4VçföÇf–F÷4FWFÆ†W2“°¢6öç7BæÇ—7D76–væÖVçBÒæÇ—7D76–væÖVçDg&öÔf÷&Ò†f÷&ÒÂFVÖæB“°¢–b‚fÆ–FFTFVÖæDæÇ—7G2†æÇ—7D76–væÖVçBÂf÷&Ò’’&WGW&ã°¢6öç7B6VÆV7FVEv÷&´–BÒ&W6öÇfUv÷&´–Dg&öÔFVÖæDf÷&Ò†f÷&ÔFF“°¢6öç7B6VÆV7FVEv÷&²Òv÷&´'”–B‡6VÆV7FVEv÷&´–B“°¢–b‚6VÆV7FVEv÷&²’°¢6†÷tf÷&ÔW'&÷"‚%6VÆV6–öæRVÖö'&l:Æ–FFò÷'Fl;6Æ–òçFW2FR6Çf"FVÖæFâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢–b†FVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2"bb†FVÖæBç6–4–G2ÇÂµÒ’æÆVæwF‚bb6VÆV7FVEv÷&²æ–BÓÒ&Wf–÷W5v÷&´–B’°¢6†÷tf÷&ÔW'&÷"‚%VÖ4”2¬:÷7FFæòUbì:6òöFR6W"G&ç6fW&–F&÷WG&ö'&âVF—FR÷2FVÖ—26×÷2÷R7&–RVÖæ÷f4”2æö'&6÷'&WFâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7B—56–4FVÖæBÒFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2#°¢–b†—56–4FVÖæB’°¢6öç7BÆV6öÔçVÖ&W"Ò7G&–ær†f÷&ÔFFævWB‚&ÆV6öÔçVÖ&W""’ÇÂ""’çG&–Ò‚“°¢–b‚ÆV6öÔçVÖ&W"’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRòì;¦ÖW&òFòÄT4ôÒçFW2FR6Çf"4”2â"Âf÷&Ò“°¢f÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ&ÆV6öÔçVÖ&W"%Òr“òæfö7W2‚“°¢&WGW&ã°¢Ð¢6öç7BÆV6öÔ6†ævVBÒæ÷&ÖÆ—¦U6–4ÆV6öÒ†ÆV6öÔçVÖ&W"’ÓÒæ÷&ÖÆ—¦U6–4ÆV6öÒ‡6–4ÆV6öÔg&öÔFVÖæB†FVÖæB’“°¢–b†ÆV6öÔ6†ævVB’°¢6öç7BÆV6öÔ6öæfÆ–7BÒf–æE6–4ÆV6öÔ6öæfÆ–7B†ÆV6öÔçVÖ&W"ÂFVÖæBæ–B“°¢–b†ÆV6öÔ6öæfÆ–7B’°¢6†÷tf÷&ÔW'&÷"‡6–4ÆV6öÔ6öæfÆ–7DÖW76vR†ÆV6öÔçVÖ&W"ÂÆV6öÔ6öæfÆ–7B’Âf÷&Ò“°¢f÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ&ÆV6öÔçVÖ&W"%Òr“òæfö7W2‚“°¢&WGW&ã°¢Ð¢Ð¢Ð¢6öç7B&Wf–÷W57&–çD–G2ÒFVÖæE7&–çD–G2†FVÖæB“°¢6öç7B&Wf–÷W57&–çDÆ&VÂÒFVÖæE7&–çDæÖW2†FVÖæBÂ"(i""“°¢6öç7B&Wf–÷W5&–÷&—G’ÒFVÖæBç&–÷&–FFRÇÂ"#°¢6öç7B&Wf–÷W4Æ&VÇ2Òæ÷&ÖÆ—¦TFVÖæDÆ&VÇ2†FVÖæBæWF—VWF2“°¢6öç7B&Wf–÷W4Væv–æVW&–ætÖVWF–ærÒFVÖæBç6–4Væv–æVW&–ætÖVWF–ærÓÓÒG'VS° ¢ö&¦V7Bæ76–vâ†FVÖæBÂæÇ—7D76–væÖVçB“°¢FVÖæBæö'&–BÒ6VÆV7FVEv÷&²æ–C°¢–b†FVÖæBçVæ–FFTÖöFòÓÒ&W†—7FVçFR"’°¢FVÖæBçVæ–FFTæöÖRÒ6VÆV7FVEv÷&²ææöÖRÇÂ"#°¢FVÖæBçVæ–FFUF—òÒ6VÆV7FVEv÷&²çF—õVæ–FFRÇÂ"#°¢FVÖæBçVæ–FFT6ç¢Ò6VÆV7FVEv÷&²æ6ç¢ÇÂ"#°¢FVÖæBçVæ–FFT×Væ–6—–òÒ·6VÆV7FVEv÷&²æ6–FFRÂ6VÆV7FVEv÷&²çVeÒæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"ò"“°¢FVÖæBçVæ–FFT6VçG&òÒ6VÆV7FVEv÷&²æ6öF–vô÷&–v–æÂÇÂ"#°¢FVÖæBçVæ–FFU6÷W&6RÒ%÷'Fl;6Æ–òFRö'&2#°¢Ð¢FVÖæBçF—òÒf÷&ÔFFævWB‚'F—ò"’ÇÂFVÖæBçF—ó°¢FVÖæBç7&–çD–G2Ò7&–çD–G4g&öÔf÷&ÔFF†f÷&ÔFF“°¢FVÖæBç7&–çD–BÒFVÖæBç7&–çD–G2æB‚Ó’ÇÂ"#°¢FVÖæBç&–÷&–FFRÒf÷&ÔFFævWB‚'&–÷&–FFR"’ÇÂFVÖæBç&–÷&–FFS°¢FVÖæBæWF—VWF2Òæ÷&ÖÆ—¦TFVÖæDÆ&VÇ2†f÷&ÔFFævWB‚&WF—VWF2"’“°¢–b†—56–4FVÖæB’°¢FVÖæBç6–4Væv–æVW&–ætÖVWF–ærÒf÷&ÔFFævWB‚'6–4Væv–æVW&–ætÖVWF–ær"’ÓÓÒ&öâ#°¢FVÖæBç6–4ÖWFFFÒFVÖæBç6–4ÖWFFFÇÂ·Ó°¢FVÖæBç6–4ÖWFFFææÆ—7F6ÆFV6æ–6ÒFVÖæBææÆ—7F&W7öç6fVÂÇÂ"#°¢FVÖæBç6–4ÖWFFFæÆV6öÔçVÖ&W"Ò7G&–ær†f÷&ÔFFævWB‚&ÆV6öÔçVÖ&W""’ÇÂ""’çG&–Ò‚“°¢FVÖæBç6–4ÖWFFFæö'&çVÖ&W"Ò7G&–ær‡6VÆV7FVEv÷&²æ6†fUVæ–6ÇÂ6VÆV7FVEv÷&²æ6öF–vô÷&–v–æÂÇÂ""’çG&–Ò‚“°¢FVÖæBç6–4ÖWFFFæö'&æöÖRÒ7G&–ær‡6VÆV7FVEv÷&²ææöÖRÇÂ""’çG&–Ò‚“°¢FVÖæBç6–4ÖWFFFçF—GVÆõ6–2Ò7G&–ær†f÷&ÔFFævWB‚'F—GVÆõ6–2"’ÇÂ""’çG&–Ò‚“°¢FVÖæBç6–4ÖWFFFæçVÖW&õ6–2Ò7G&–ær†f÷&ÔFFævWB‚&çVÖW&õ6–2"’ÇÂ""’çG&–Ò‚“°¢FVÖæBç6–4ÖWFFFæFW67&–6õ6–2Ò7G&–ær†f÷&ÔFFævWB‚'6–4FW67&–6ò"’ÇÂ""’çG&–Ò‚“°¢FVÖæBç6–4ÖWFFFæÖ÷F—fòÒæ÷&ÖÆ—¦U6–4Ö÷F—fò†f÷&ÔFFævWB‚&Ö÷F—fò"’ÇÂFVÖæBç6–4ÖWFFFæÖ÷F—fòÇÂ%&Wf—6õ&ö¦WFò"“°¢FVÖæBæö'6W'f6òÒFVÖæBç6–4ÖWFFFæFW67&–6õ6–3°¢†FVÖæBç6–4–G2ÇÂµÒ’æf÷$V6‚‚‡6–4–B’Óâ°¢6öç7B6–2Ò7FFRç6–72æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ6–4–B“°¢–b‚6–2’&WGW&ã°¢6–2æÆV6öÔçVÖ&W"ÒFVÖæBç6–4ÖWFFFæÆV6öÔçVÖ&W#°¢6–2æö'&çVÖ&W"ÒFVÖæBç6–4ÖWFFFæö'&çVÖ&W#°¢6–2æö'&æöÖRÒFVÖæBç6–4ÖWFFFæö'&æöÖS°¢6–2çF—GVÆòÒFVÖæBç6–4ÖWFFFçF—GVÆõ6–3°¢6–2æçVÖW&õ6–2ÒFVÖæBç6–4ÖWFFFæçVÖW&õ6–2ÇÂ6–2æ–C°¢6–2æFW67&–6òÒFVÖæBç6–4ÖWFFFæFW67&–6õ6–3°¢6–2ææÆ—7F6ÆFV6æ–6ÒFVÖæBç6–4ÖWFFFææÆ—7F6ÆFV6æ–6°¢6–2æÖ÷F—fòÒFVÖæBç6–4ÖWFFFæÖ÷F—fó°¢Ò“° ¢ÒVÇ6R°¢FVÖæBæö'6W'f6òÒf÷&ÔFFævWB‚&FW67&–6ò"’ÇÂ"#°¢Ð¢FVÖæBææ÷FÒf÷&ÔFFævWB‚&æ÷F"’ÇÂ"#°¢6öç7B&ö¦V7E6VÆV7F–öâÒ&VDFVÖæE&ö¦V7G4g&öÔf÷&Ò†f÷&Ò“°¢–b‚—56–4FVÖæB’°¢FVÖæBç&ö¦WF÷4VçföÇf–F÷2Ò&ö¦V7E6VÆV7F–öâç6VÆV7FVC°¢FVÖæBç&ö¦WF÷4VçföÇf–F÷4FWFÆ†W2Ò&ö¦V7E6VÆV7F–öâæFWF–Ç3°¢Ð¢FVÖæBææôVçf–%fÆ–F6ôö'&2Òf÷&ÔFFævWB‚&æôVçf–%fÆ–F6ôö'&2"’ÓÓÒ&öâ#°¢°¢&FF&Wf—7F–æ–6–ò"À¢&FF–æ–6–õ&VÂ"À¢&FF&WdVçf–õfÆ–F6ôö'&2"À¢&FFVçf–õ&VÅfÆ–F6ôö'&2"À¢&FFfÆ–F6ôö'&2"À¢&FF&Wf—7FVçG&Vv"À¢&FFVçG&Vv&VÂ"À¢Òæf÷$V6‚‚†f–VÆB’Óâ°¢FVÖæE¶f–VÆEÒÒf÷&ÔFFævWB†f–VÆB’ÇÂ"#°¢Ò“°¢6öç7B6VÆV7FVD6öÇVÖâÒ6VÆV7FVD6öÇVÖäg&öÔf÷&Ó°¢6öç7BfÆ–FF–öåv4§W7E6VçBÒFVÖæE6æ6†÷BæFFVçf–õ&VÅfÆ–F6ôö'&2bb&ööÆVâ†FVÖæBæFFVçf–õ&VÅfÆ–F6ôö'&2“°¢6öç7BfÆ–FF–öä6öÇVÖä–æFW‚Ò6öÇVÖç2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ'fÆ–F6ôö'&2"“°¢6öç7B6VÆV7FVD6öÇVÖä–æFW‚Ò6öÇVÖç2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ6VÆV7FVD6öÇVÖâ“°¢6öç7B6†÷VÆDWFôGfæ6UFõv÷&·5fÆ–FF–öâÒ&ööÆVâ€¢fÆ–FF–öåv4§W7E6Vç@¢bbFVÖæBææôVçf–%fÆ–F6ôö'&0¢bb6VÆV7FVD6öÇVÖä–æFW‚ãÒ ¢bbfÆ–FF–öä6öÇVÖä–æFW‚ãÒ ¢bb6VÆV7FVD6öÇVÖä–æFW‚ÂfÆ–FF–öä6öÇVÖä–æFW€¢“°¢6öç7B&WVW7FVD6öÇVÖâÒ6†÷VÆDWFôGfæ6UFõv÷&·5fÆ–FF–öâò'fÆ–F6ôö'&2"¢6VÆV7FVD6öÇVÖã°¢6öç7BæW‡EG—T—56–2ÒFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2#°¢6öç7B6ö×ÆWF–öå&WVW7FVBÒFVÖæE6æ6†÷Bæ6öÇVæÓÒ&6öæ6ÇV–Fò"bb&WVW7FVD6öÇVÖâÓÓÒ&6öæ6ÇV–Fò"bb†æW‡EG—T—56–2bbFVÖæE6æ6†÷Bæ6öÇVæÓÒ&&÷fFôF—&WF÷&–"“°¢6öç7B7FGW46†ævVBÒFVÖæE6æ6†÷Bæ6öÇVæÓÒ&WVW7FVD6öÇVÖã°¢–b‚7FGW46†ævVBbb6VÆV7FVD6öÇVÖâÓÓÒ'W6Fò"bbÖ÷fVÖVçE&V6öâÓÒ&Wf–÷W57FGW5&V6öâ’°¢FVÖæBæÖ÷F—fõW6ÒÖ÷fVÖVçE&V6öã°¢FD†—7F÷'’‡²VçF–FFS¢&FVÖæF"ÂVçF–FFT–C¢FVÖæBæ–BÂ6×ó¢&Ö÷F—fõW6"ÂfÆ÷$çFW&–÷#¢&Wf–÷W57FGW5&V6öâÇÂ$ì:6ò–æf÷&ÖFò"ÂfÆ÷$æ÷fó¢Ö÷fVÖVçE&V6öâÒ“°¢Ð¢–b‚7FGW46†ævVBbb6VÆV7FVD6öÇVÖâÓÓÒ&6æ6VÆFò"bbÖ÷fVÖVçE&V6öâÓÒ&Wf–÷W57FGW5&V6öâ’°¢FVÖæBæÖ÷F—fô6æ6VÆÖVçFòÒÖ÷fVÖVçE&V6öã°¢FD†—7F÷'’‡²VçF–FFS¢&FVÖæF"ÂVçF–FFT–C¢FVÖæBæ–BÂ6×ó¢&Ö÷F—fô6æ6VÆÖVçFò"ÂfÆ÷$çFW&–÷#¢&Wf–÷W57FGW5&V6öâÇÂ$ì:6ò–æf÷&ÖFò"ÂfÆ÷$æ÷fó¢Ö÷fVÖVçE&V6öâÒ“°¢Ð¢6öç7B7FGW5WFFRÒ6ö×ÆWF–öå&WVW7FVBòFVÖæB¢v—BWFFTFVÖæD6öÇVÖâ†FVÖæBæ–BÂ&WVW7FVD6öÇVÖâÂ²W'6—7C¢fÇ6RÂÖ÷fVÖVçE&V6öâÒ“°¢–b‡7FGW5WFFRÓÓÒfÇ6R’°¢7FFRæFVÖæG5¶FVÖæD–æFW…ÒÒFVÖæE6æ6†÷C°¢–b‡v÷&´–æFW‚ãÒbbv÷&µ6æ6†÷B’7FFRçv÷&·5·v÷&´–æFW…ÒÒv÷&µ6æ6†÷C°¢7FFRç6–72Ò6–756æ6†÷C°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢&WGW&ã°¢Ð ¢6öç7B7W'&VçDæÇ—7G2ÒFVÖæDæÇ—7DæÖW2†FVÖæB“°¢–b„¥4ôâç7G&–æv–g’‡&Wf–÷W4æÇ—7G2’ÓÒ¥4ôâç7G&–æv–g’†7W'&VçDæÇ—7G2’’°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&WV—TæÆ—7F2"À¢fÆ÷$çFW&–÷#¢æÇ—7E6VÆV7F–öå7VÖÖ'’‡&Wf–÷W4æÇ—7G2’À¢fÆ÷$æ÷fó¢æÇ—7E6VÆV7F–öå7VÖÖ'’†7W'&VçDæÇ—7G2’À¢Ò“°¢Ð¢–b„¥4ôâç7G&–æv–g’‡&Wf–÷W5&ö¦V7G2’ÓÒ¥4ôâç7G&–æv–g’†FVÖæBç&ö¦WF÷4VçföÇf–F÷2’’°¢6öç7B&ö¦V7DÆ&VÇ2Ò†—FV×2’Óà¢—FV×0¢æÖ‚†–B’ÓâFVÖæE&ö¦V7D÷F–öç2‚’æf–æB‚†÷F–öâ’Óâ÷F–öâæ–BÓÓÒ–B“òæÆ&VÂÇÂ–B¢æ¦ö–â‚"Â"’ÇÂ$æVæ‡VÒ#°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢'&ö¦WF÷4VçföÇf–F÷2"À¢fÆ÷$çFW&–÷#¢&ö¦V7DÆ&VÇ2‡&Wf–÷W5&ö¦V7G2’À¢fÆ÷$æ÷fó¢&ö¦V7DÆ&VÇ2†FVÖæBç&ö¦WF÷4VçföÇf–F÷2’À¢Ò“°¢Ð¢–b„¥4ôâç7G&–æv–g’‡&Wf–÷W5&ö¦V7DFWF–Ç2’ÓÒ¥4ôâç7G&–æv–g’†FVÖæBç&ö¦WF÷4VçföÇf–F÷4FWFÆ†W2’’°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&FWFÆ†W5&ö¦WF÷4VçföÇf–F÷2"À¢fÆ÷$çFW&–÷#¢$FF÷2FR÷7FvVÒçFW&–÷&W2"À¢fÆ÷$æ÷fó¢%&W7öç<:fV—2ÂFF2÷RÆö6—2F÷2'V—f÷2GVÆ—¦F÷2"À¢Ò“°¢Ð¢–b„¥4ôâç7G&–æv–g’‡&Wf–÷W57&–çD–G2’ÓÒ¥4ôâç7G&–æv–g’†FVÖæE7&–çD–G2†FVÖæB’’’°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢'7&–çG2"À¢fÆ÷$çFW&–÷#¢&Wf–÷W57&–çDÆ&VÂÀ¢fÆ÷$æ÷fó¢FVÖæE7&–çDæÖW2†FVÖæBÂ"(i""’À¢Ò“°¢Ð¢–b‡&Wf–÷W5&–÷&—G’ÓÒFVÖæBç&–÷&–FFR’°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢'&–÷&–FFR"À¢fÆ÷$çFW&–÷#¢&Wf–÷W5&–÷&—G’ÇÂ%6VÒ&–÷&–FFR"À¢fÆ÷$æ÷fó¢FVÖæBç&–÷&–FFRÇÂ%6VÒ&–÷&–FFR"À¢Ò“°¢Ð¢–b„¥4ôâç7G&–æv–g’‡&Wf–÷W4Æ&VÇ2’ÓÒ¥4ôâç7G&–æv–g’†FVÖæBæWF—VWF2’’°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&WF—VWF2"À¢fÆ÷$çFW&–÷#¢&Wf–÷W4Æ&VÇ2æ¦ö–â‚"Â"’ÇÂ$æVæ‡VÖ"À¢fÆ÷$æ÷fó¢FVÖæBæWF—VWF2æ¦ö–â‚"Â"’ÇÂ$æVæ‡VÖ"À¢Ò“°¢Ð¢–b‡&Wf–÷W4Væv–æVW&–ætÖVWF–ærÓÒ†FVÖæBç6–4Væv–æVW&–ætÖVWF–ærÓÓÒG'VR’’°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢'&WVæ–ôVævVæ†&–"À¢fÆ÷$çFW&–÷#¢&Wf–÷W4Væv–æVW&–ætÖVWF–ærò$6ö'&FòVÒ&WVæœ:6ò"¢$ì:6ò6–æÆ—¦F"À¢fÆ÷$æ÷fó¢FVÖæBç6–4Væv–æVW&–ætÖVWF–ærò$6ö'&FòVÒ&WVæœ:6ò"¢$ì:6ò6–æÆ—¦F"À¢Ò“°¢Ð¢–b‡&Wf–÷W5v÷&´–BÓÒFVÖæBæö'&–B’°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&ö'&f–æ7VÆF"À¢fÆ÷$çFW&–÷#¢v÷&´'”–B‡&Wf–÷W5v÷&´–B“òææöÖRÇÂ&Wf–÷W5v÷&´–BÇÂ%6VÒö'&"À¢fÆ÷$æ÷fó¢6VÆV7FVEv÷&²ææöÖRÇÂ6VÆV7FVEv÷&²æ–BÀ¢Ò“°¢Ð ¢G'’°¢v—B6fU7FFTæEv—B‚“°¢Ò6F6‚†W'&÷"’°¢7FFRæFVÖæG5¶FVÖæD–æFW…ÒÒFVÖæE6æ6†÷C°¢–b‡v÷&´–æFW‚ãÒbbv÷&µ6æ6†÷B’7FFRçv÷&·5·v÷&´–æFW…ÒÒv÷&µ6æ6†÷C°¢7FFRç6–72Ò6–756æ6†÷C°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢6öç7B&æ´ÖW76vRÒ7G&–ær†W'&÷#òæÖW76vRÇÂ""“°¢6†÷tf÷&ÔW'&÷"‚ôÄT4ôÒâ¶¬:W†—7FRö’çFW7B†&æ´ÖW76vR¢ò&æ´ÖW76vP¢¢$2ÇFW&:|;VW2Fò6&Bì:6òf÷&Ò6öæf—&ÖF2æò&æ6òâ&Wf—6R7VW&Ö—7<:6ò÷R&V6'&VwVR÷2FF÷2çFW2FRFVçF"æ÷fÖVçFRâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6Æ÷6TÖöFÂ‚“°¢–b†6ö×ÆWF–öå&WVW7FVB’°¢÷VäFVÖæD6ö×ÆWF–öäÖöFÂ†FVÖæBæ–B“°¢&WGW&ã°¢Ð¢6†÷uFö7B‚$FVÖæFGVÆ—¦FR¶æ&â6–æ7&öæ—¦Fòâ"“°¢&VæFW"‚“°§Ð ¦7–æ2gVæ7F–öâ†æFÆTFVÆWFTFVÖæE7V&Ö—B†f÷&Ò’°¢–b‚6äFVÆWFTFVÖæB‚’’°¢6†÷tf÷&ÔW'&÷"‚%6öÖVçFRvW7F÷&W2RFÖ–ç26öÒW&Ö—7<:6òFRVFœ:|:6òöFVÒW†6ÇV—"FVÖæF2â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒf÷&ÒæFF6WBæ–B“°¢–b‚FVÖæB’&WGW&ã°¢6öç7Bf÷&ÔFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7B§W7F–f–6F—fÒ7G&–ær†f÷&ÔFFævWB‚&§W7F–f–6F—f"’ÇÂ""’çG&–Ò‚“°¢–b†§W7F–f–6F—fæÆVæwF‚ÂR’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRVÖ§W7F–f–6F—f&W†6ÇV—"FVÖæFâ"“°¢&WGW&ã°¢Ð ¢6öç7Bv÷&²Òv÷&´'”–B†FVÖæBæö'&–B“°¢6öç7BFVÖæG56æ6†÷BÒ6ÆöæR‡7FFRæFVÖæG2ÇÂµÒ“°¢6öç7BFVÆWFVE6æ6†÷BÒ6ÆöæR‡7FFRæFVÆWFVDFVÖæG2ÇÂµÒ“°¢6öç7B†—7F÷'•6æ6†÷BÒ6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢6öç7BFVÆWFVE&V6÷&BÒ°¢ââæ6ÆöæR†FVÖæB’À¢ö'&æöÖS¢v÷&³òææöÖRÇÂ""À¢7FGW4çFW&–÷#¢FVÖæE7FGW4Æ&VÂ†FVÖæB’À¢§W7F–f–6F—fW†6ÇW6ó¢§W7F–f–6F—fÀ¢W†6ÇV–Fõ÷#¢$vW7L:6ò5B"À¢W†6ÇV–FôVÓ¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢Ó° ¢7FFRæFVÆWFVDFVÖæG2Ò¶FVÆWFVE&V6÷&BÂâââ‡7FFRæFVÆWFVDFVÖæG2ÇÂµÒ•Ó°¢7FFRæFVÖæG2Ò7FFRæFVÖæG2æf–ÇFW"‚†—FVÒ’Óâ—FVÒæ–BÓÒFVÖæBæ–B“°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&W†6ÇW<:6ò"À¢fÆ÷$çFW&–÷#¢G¶FVÖæE7FGW4Æ&VÂ†FVÖæB—ÒÂG·v÷&³òææöÖRÇÂ$ö'&ì:6òÆö6Æ—¦F'ÖÀ¢fÆ÷$æ÷fó¢§W7F–f–6F—fÀ¢Ò“° ¢G'’°¢v—B6fU7FFTæEv—B‚“°¢Ò6F6‚†W'&÷"’°¢7FFRæFVÖæG2ÒFVÖæG56æ6†÷C°¢7FFRæFVÆWFVDFVÖæG2ÒFVÆWFVE6æ6†÷C°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢6†÷tf÷&ÔW'&÷"†W'&÷#òæÖW76vRÇÂ$W†6ÇW<:6òì:6òfö’6öæf—&ÖFVÆò&æ6òâ&V6'&VwVR÷2FF÷2çFW2FRFVçF"æ÷fÖVçFRâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6Æ÷6TÖöFÂ‚“°¢6†÷uFö7B†G¶FVÖæBæ–GÒW†6Ç\:ÖFFò¶æ&â6öÒ§W7F–f–6F—f6öæf—&ÖFæò&æ6òæ“°¢&VæFW"‚“°§Ð ¦7–æ2gVæ7F–öâ†æFÆT6öçG&7E7V&Ö—B†f÷&Ò’°¢6öç7Bf÷&ÔFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7BfÇVRÒ'6T7W'&Væ7’†f÷&ÔFFævWB‚'fÆ÷""’“°¢–b‡fÇVRÃÒ’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRVÒfÆ÷"6öçG&FFòl:Æ–Fòâ"“°¢&WGW&ã°¢Ð ¢6öç7B6öçG&7G56æ6†÷BÒ6ÆöæR‡7FFRæ6öçG&7G2ÇÂµÒ“°¢6öç7B†—7F÷'•6æ6†÷BÒ6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢6öç7B6öçG&7BÒ°¢–C¢æW‡D6öFR‚$5E""Â7FFRæ6öçG&7G2’À¢ö'&–C¢f÷&ÔFFævWB‚&ö'&–B"’À¢F—66—Æ–æ–C¢f÷&ÔFFævWB‚&F—66—Æ–æ–B"’À¢f÷&æV6VF÷$–C¢f÷&ÔFFævWB‚&f÷&æV6VF÷$–B"’À¢fÆ÷#¢fÇVRÀ¢FF¢FöF”•4ò‚’À¢&W7öç6fVÅ7W&–ÖVçF÷3¢f÷&ÔFFævWB‚'&W7öç6fVÅ7W&–ÖVçF÷2"’À¢çVÖW&ô6öçG&Fó¢f÷&ÔFFævWB‚&çVÖW&ô6öçG&Fò"’À¢Ó°¢7FFRæ6öçG&7G2çVç6†–gB†6öçG&7B“°¢FD†—7F÷'’‡°¢VçF–FFS¢&6öçG&F6ò"À¢VçF–FFT–C¢6öçG&7Bæ–BÀ¢6×ó¢'fÆ÷""À¢fÆ÷$çFW&–÷#¢$ì:6òW†—7F–"À¢fÆ÷$æ÷fó¢G¶6öçG&7BæçVÖW&ô6öçG&F÷ÒÂG¶ÖöæW’†6öçG&7BçfÆ÷"—ÖÀ¢Ò“°¢G'’°¢v—B6fU7FFTæEv—B‚“°¢Ò6F6‚†W'&÷"’°¢7FFRæ6öçG&7G2Ò6öçG&7G56æ6†÷C°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢6†÷tf÷&ÔW'&÷"†W'&÷#òæÖW76vRÇÂ$6öçG&F:|:6òì:6òfö’6öæf—&ÖFVÆò&æ6òâ&V6'&VwVR÷2FF÷2çFW2FRFVçF"æ÷fÖVçFRâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6Æ÷6TÖöFÂ‚“°¢6†÷uFö7B‚$6öçG&F:|:6òf–æ7VÆF:F—66—Æ–æR6öæf—&ÖFæò&æ6òâ"“°¢&VæFW"‚“°§Ð ¦7–æ2gVæ7F–öâ&÷fU6–4FVÖæB†–B’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢–b‚FVÖæBÇÂFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÒ%4”2"’&WGW&ã°¢–b‚†FVÖæBç6–4–G2ÇÂµÒ’æÆVæwF‚’°¢6†÷uFö7B‚$W7F4”2¬:fö’÷7FFæòUbâ"“°¢&WGW&ã°¢Ð¢6öç7BFVÖæD–æFW‚Ò7FFRæFVÖæG2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒFVÖæBæ–B“°¢6öç7BFVÖæE6æ6†÷BÒ6ÆöæR†FVÖæB“°¢6öç7B†—7F÷'•6æ6†÷BÒ6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢6öç7B&Wf–÷W2Ò6–4&÷fÅ&VF–ær†FVÖæB’æÆ&VÃ°¢FVÖæBç6–4&÷fÅ7FGW2Ò$&÷fFò#°¢FVÖæBç6–4&÷fÄ&÷fVDBÒFöF”•4ò‚“°¢FVÖæBç6–4&÷fÄ&÷fVD'’Ò7W'&VçEW6W"‚“òææöÖRÇÂ$vW7L:6ò5B#°¢FVÖæBç6–4&÷fÅ&V¦V7FVDBÒ"#°¢FVÖæBç6–4&÷fÅ&V¦V7FVD'’Ò"#°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&&÷f:|:6ò4”2"À¢fÆ÷$çFW&–÷#¢&Wf–÷W2À¢fÆ÷$æ÷fó¢&÷fF÷"G¶FVÖæBç6–4&÷fÄ&÷fVD'—ÖÀ¢Ò“°¢6öç7B&V÷VäFWF–ÂÒ&ööÆVâ†Fö7VÖVçBçVW'•6VÆV7F÷"†6FVÖæDFWF–Äf÷&Õ¶FFÖ–CÒ"G¶FVÖæBæ–GÒ%Ö’“°¢G'’°¢v—B6fU7FFTæEv—B‚“°¢Ò6F6‚†W'&÷"’°¢–b†FVÖæD–æFW‚ãÒ’7FFRæFVÖæG5¶FVÖæD–æFW…ÒÒFVÖæE6æ6†÷C°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢6†÷uFö7B†W'&÷#òæÖW76vRÇÂ$&÷f:|:6òF4”2ì:6òfö’6öæf—&ÖFVÆò&æ6òâ&V6'&VwVR÷2FF÷2â"“°¢&VæFW"‚“°¢&WGW&ã°¢Ð¢6†÷uFö7B†G¶FVÖæBæ–GÒ&÷fF&÷7FvVÒæòUbæ“°¢&VæFW"‚“°¢–b‡&V÷VäFWF–Â’÷VäFVÖæDFWF–ÄÖöFÂ†FVÖæBæ–B“°§Ð ¦7–æ2gVæ7F–öâ&V¦V7E6–4FVÖæB†–B’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢–b‚FVÖæBÇÂFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÒ%4”2"’&WGW&ã°¢–b‚†FVÖæBç6–4–G2ÇÂµÒ’æÆVæwF‚’°¢6†÷uFö7B‚%4”2¬:÷7FFæòUbâì:6ò:’÷7<:×fVÂ&W&÷f"æW7FWFâ"“°¢&WGW&ã°¢Ð¢6öç7BFVÖæD–æFW‚Ò7FFRæFVÖæG2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒFVÖæBæ–B“°¢6öç7BFVÖæE6æ6†÷BÒ6ÆöæR†FVÖæB“°¢6öç7B†—7F÷'•6æ6†÷BÒ6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢6öç7B&Wf–÷W2Ò6–4&÷fÅ&VF–ær†FVÖæB’æÆ&VÃ°¢FVÖæBç6–4&÷fÅ7FGW2Ò%&W&÷fFò#°¢FVÖæBç6–4&÷fÅ&V¦V7FVDBÒFöF”•4ò‚“°¢FVÖæBç6–4&÷fÅ&V¦V7FVD'’Ò7W'&VçEW6W"‚“òææöÖRÇÂ$vW7L:6ò5B#°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&&÷f:|:6ò4”2"À¢fÆ÷$çFW&–÷#¢&Wf–÷W2À¢fÆ÷$æ÷fó¢&W&÷fF÷"G¶FVÖæBç6–4&÷fÅ&V¦V7FVD'—ÖÀ¢Ò“°¢6öç7B&V÷VäFWF–ÂÒ&ööÆVâ†Fö7VÖVçBçVW'•6VÆV7F÷"†6FVÖæDFWF–Äf÷&Õ¶FFÖ–CÒ"G¶FVÖæBæ–GÒ%Ö’“°¢G'’°¢v—B6fU7FFTæEv—B‚“°¢Ò6F6‚†W'&÷"’°¢–b†FVÖæD–æFW‚ãÒ’7FFRæFVÖæG5¶FVÖæD–æFW…ÒÒFVÖæE6æ6†÷C°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢6†÷uFö7B†W'&÷#òæÖW76vRÇÂ$&W&÷f:|:6òF4”2ì:6òfö’6öæf—&ÖFVÆò&æ6òâ&V6'&VwVR÷2FF÷2â"“°¢&VæFW"‚“°¢&WGW&ã°¢Ð¢6†÷uFö7B†G¶FVÖæBæ–GÒ&W&÷fF&&Wf—<:6òçFW2FòUbæ“°¢&VæFW"‚“°¢–b‡&V÷VäFWF–Â’÷VäFVÖæDFWF–ÄÖöFÂ†FVÖæBæ–B“°§Ð ¦7–æ2gVæ7F–öâ&÷fU6–2†–B’°¢6öç7B6–2Ò7FFRç6–72æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢6öç7Bv÷&²Ò6–2bbv÷&´'”–B‡6–2æö'&–B“°¢–b‚6–2ÇÂv÷&²’&WGW&ã°¢v÷&²æWbæÆ–æW2Òv÷&²æWbæÆ–æW2ÇÂµÓ° ¢6–2æF—66—Æ–æ4fWFF2æf÷$V6‚‚†—FVÒ’Óâ°¢6öç7BÆ–æRÒv÷&²æWbæÆ–æW2æf–æB‚†VçG'’’Óâ6æöæ–6ÄF—66—Æ–æT–B†VçG'’æF—66—Æ–æ–B’ÓÓÒ6æöæ–6ÄF—66—Æ–æT–B†—FVÒæF—66—Æ–æ–B’“°¢–b‚Æ–æR’°¢v÷&²æWbæÆ–æW2çW6‚‡°¢F—66—Æ–æ–C¢—FVÒæF—66—Æ–æ–BÀ¢fÆ÷$÷&6Fó¢À¢7FGW3¢$÷,:vFò"À¢Ò“°¢Ð¢Ò“° ¢6–2ç7FGW2Ò$&÷fFò#°¢6–2æ&÷fFõ÷"Ò$vW7L:6ò5B#°¢6–2æFF&÷f6òÒFöF”•4ò‚“° ¢FD†—7F÷'’‡°¢VçF–FFS¢'6–2"À¢VçF–FFT–C¢6–2æ–BÀ¢6×ó¢'7FGW2"À¢fÆ÷$çFW&–÷#¢%VæFVçFR"À¢fÆ÷$æ÷fó¢$&÷fFò"À¢Ò“° ¢–b‚v—B6fU7FFR‚’’&WGW&âfÇ6S°¢6†÷uFö7B†G·6–2æ–GÒ&÷fFâòUb<;2væ†,:æ÷f&Wf—<:6òVæFò†÷WfW"ÇFW&:|:6ò6Çfæ“°¢&VæFW"‚“°§Ð ¦gVæ7F–öâFVÖæD6ö×ÆWF–öäUe&Wf—6–öâ†FVÖæB’°¢6öç7Bv÷&²Òv÷&´'”–B†FVÖæCòæö'&–B“°¢–b‚v÷&²ÇÂFVÖæCòæ–B’&WGW&âçVÆÃ°¢6öç7B6ö×ÆWF–öä÷&–v–âÒ6öæ6ÇW<:6òG¶FVÖæBæ–GÖ°¢&WGW&â'&”÷$fÆÆ&6²‡v÷&²æWcòçfW'6–öç2¢æf–ÇFW"‚‡fW'6–öâ’Óâ7G&–ær‡fW'6–öâæ÷&–vVÒÇÂ""’ÓÓÒ6ö×ÆWF–öä÷&–v–â¢ç6÷'B‚†f—'7BÂ6V6öæB’ÓâçVÖ&W"†f—'7BæçVÖW&òÇÂ’ÒçVÖ&W"‡6V6öæBæçVÖW&òÇÂ’¢æB‚Ó’ÇÂçVÆÃ°§Ð ¦gVæ7F–öâFVÖæD†4UeWFFTf÷$6ö×ÆWF–öâ†FVÖæB’°¢&WGW&â&ööÆVâ†FVÖæD6ö×ÆWF–öäUe&Wf—6–öâ†FVÖæB’“°§Ð ¦gVæ7F–öâFVÖæD6ö×ÆWF–öäUe7VvvW7FVEfÇVR†FVÖæB’°¢6öç7BfW'6–öâÒFVÖæD6ö×ÆWF–öäUe&Wf—6–öâ†FVÖæB“°¢–b‚fW'6–öâ’&WGW&âçVÆÃ°¢6öç7BF÷FÂÒçVÖ&W"‡fW'6–öâçfÆ÷%F÷FÂ“°¢6öç7B&Wf–÷W2ÒçVÖ&W"‡fW'6–öâçfÆ÷$çFW&–÷"“°¢–b„çVÖ&W"æ—4f–æ—FR‡F÷FÂ’bbçVÖ&W"æ—4f–æ—FR‡&Wf–÷W2’’&WGW&âF÷FÂÒ&Wf–÷W3°¢6öç7BF–fg2Ò'&”÷$fÆÆ&6²‡fW'6–öâæF–fe÷$F—66—Æ–æ“°¢–b†F–fg2æÆVæwF‚’°¢&WGW&âF–fg2ç&VGV6R€¢‡7VÒÂ—FVÒ’Óâ7VÒ²„çVÖ&W"†—FVÒçfÆ÷$FWö—2ÇÂ’ÒçVÖ&W"†—FVÒçfÆ÷$çFW2ÇÂ’’À¢ ¢“°¢Ð¢6öç7B&V6÷&FVD–×7BÒçVÖ&W"‡fW'6–öâæ–×7FôFVÖæF“°¢&WGW&âçVÖ&W"æ—4f–æ—FR‡&V6÷&FVD–×7B’ò&V6÷&FVD–×7B¢çVÆÃ°§Ð ¦gVæ7F–öâ÷VäFVÖæD6ö×ÆWF–öäÖ÷VçDÖöFÂ†–BÂ²Wdæô6†ævRÒfÇ6RÂ&W7VÖVDgFW$UbÒfÇ6RÂVF—EfÇVRÒfÇ6RÒÒ·Ò’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢6öç7Bv÷&²ÒFVÖæBbbv÷&´'”–B†FVÖæBæö'&–B“°¢–b‚FVÖæBÇÂv÷&²’&WGW&ã°¢6öç7B—56–4FVÖæBÒFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2#°¢6öç7B6–væVE7VvvW7FVEfÇVRÒWdæô6†ævRòçVÆÂ¢FVÖæD6ö×ÆWF–öäUe7VvvW7FVEfÇVR†FVÖæB“°¢6öç7B7VvvW7FVEfÇVRÒ‡6–væVE7VvvW7FVEfÇVRÓÓÒçVÆÂÇÂ—56–4FVÖæB¢ò6–væVE7VvvW7FVEfÇVP¢¢ÖF‚æ'2‡6–væVE7VvvW7FVEfÇVR“°¢6öç7BWFôf–ÆÆVDg&öÔUbÒFVÖæD†5&V6÷&FVEfÇVR†FVÖæB’bb7VvvW7FVEfÇVRÓÒçVÆÃ°¢6öç7BfÇVRÒFVÖæD†5&V6÷&FVEfÇVR†FVÖæB¢ò7W'&Væ7”–çWEfÇVR†FVÖæBçfÆ÷$vW&Fò¢¢WFôf–ÆÆVDg&öÔU`¢ò7W'&Væ7”–çWEfÇVR‡7VvvW7FVEfÇVR¢¢"#°¢6öç7BFVÆ—fW'”FFRÒFFTöæÇ’†FVÖæBæFFVçG&Vv&VÂ’ÇÂ"#°¢6öç7B—4F—&V7E6–46ö×ÆWF–öâÒVæF–ætF—&V7E6–46ö×ÆWF–öãòæFVÖæD–BÓÓÒFVÖæBæ–BbbFVÖæBæ6öÇVæÓÓÒ'fÆ–FFôö'&2#°¢–b‡VæF–ætFVÖæD6ö×ÆWF–öãòæFVÖæD–BÓÓÒFVÖæBæ–B’VæF–ætFVÖæD6ö×ÆWF–öâÒçVÆÃ°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&BFVÖæBÖ6ö×ÆWF–öâÖ6&B"–CÒ&FVÖæD6ö×ÆWF–öäf÷&Ò"FFÖ–CÒ"G¶FVÖæBæ–GÒ"FFÖVF—B×fÇVSÒ"G¶VF—EfÇVRò'G'VR"¢&fÇ6R'Ò"G¶—4F—&V7E6–46ö×ÆWF–öâòFFÖF—&V7B×6–2Ö6ö×ÆWF–öãÒ"G¶W66TGG&–'WFR†FVÖæBæ–B—Ò&¢"'Ò&–ÖÆ&VÆÆVF'“Ò&FVÖæD6ö×ÆWF–öåF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#âG¶—56–4FVÖæBò$6öæ6ÇW<:6òF4”2"¢$6öæ6ÇW<:6òFFVÖæF'ÓÂ÷7ãà¢Æƒ"–CÒ&FVÖæD6ö×ÆWF–öåF—FÆR#âG¶VF—EfÇVRò$§W7F"fÆ÷"FFVÖæF"¢—56–4FVÖæBò$–æf÷&ÖR÷2FF÷2f–æ—2F4”2"¢$6öæf—&ÖR6öæ6ÇW<:6òFFVÖæF'ÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR†FVÖæBæ–B—Ò+rG¶W66TGG&–'WFR‡v÷&²ææöÖRÇÂ$ö'&f–æ7VÆF"—ÓÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢Æ–çWBG—SÒ&†–FFVâ"æÖSÒ&We6VÔ×VFæ6"fÇVSÒ"G¶Wdæô6†ævRò'G'VR"¢&fÇ6R'Ò"óà¢G¶—4F—&V7E6–46ö×ÆWF–öâò ¢ÆF—b6Æ73Ò&6ö×ÆWF–öâ×&W7VÖRÖæ÷F–6R#à¢Ç7ãî)É3Â÷7ãà¢ÆF—cãÇ7G&öæsäF—&WF÷&–ì:6òæV6W7<:&–Â÷7G&öæsãÇ6ÖÆÃä4”26öçF–çV,:VÒfÆ–FFòö'&2L:’VRòUbÂFFRòfÆ÷"f–æÂ6V¦Ò6öæf—&ÖF÷2ãÂ÷6ÖÆÃãÂöF—cà¢ÂöF—cà¢¢"'Ð¢G·&W7VÖVDgFW$Ubò ¢ÆF—b6Æ73Ò&6ö×ÆWF–öâ×&W7VÖRÖæ÷F–6R#à¢Ç7ãî)É3Â÷7ãà¢ÆF—cãÇ7G&öæsäUb6ÇfóÂ÷7G&öæsãÇ6ÖÆÃäv÷&<;2fÇFÒ÷2FF÷2f–æ—2&6öæ6ÇV—"W7FFVÖæFãÂ÷6ÖÆÃãÂöF—cà¢ÂöF—cà¢¢"'Ð¢Ç6V7F–öâ6Æ73Ò&ÖöFÂ×6V7F–öâ#à¢ÆF—b6Æ73Ò'6V7F–öâ×F—FÆR#ãÇ7ãäFF÷2F6öæ6ÇW<:6óÂ÷7ããÂöF—cà¢ÆF—b6Æ73Ò&f÷&ÒÖw&–B#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB"G¶VF—EfÇVRò&†–FFVâ"¢"'Óà¢Ç7ãäFFVçG&Vv&VÂ£Â÷7ãà¢Æ–çWBæÖSÒ&FFVçG&Vv&VÂ"G—SÒ&FFR"G¶VF—EfÇVRò""¢'&WV—&VB'ÒfÇVSÒ"G¶W66TGG&–'WFR†FVÆ—fW'”FFR—Ò"G¶FVÆ—fW'”FFRò""¢&WFöfö7W2'Òóà¢Ç6ÖÆÃäö'&–vL;7&–&6öæ6ÇV—"VÇVW"FVÖæFãÂ÷6ÖÆÃà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãâG¶—56–4FVÖæBò%fÆ÷"FFVÖæF…"B’¢"¢%fÆ÷"vW&Fò…"B’¢'ÓÂ÷7ãà¢Æ–çWBæÖSÒ'fÆ÷$vW&Fò"–çWFÖöFSÒ&FV6–ÖÂ"&WV—&VBfÇVSÒ"G¶W66TGG&–'WFR‡fÇVR—Ò"Æ6V†öÆFW#Ò#Ã"G¶FVÆ—fW'”FFRò&WFöfö7W2"¢"'Òóà¢Ç6ÖÆÃâG¶WFôf–ÆÆVDg&öÔU`¢ò%&VVæ6†–FòWFöÖF–6ÖVçFR6öÒò–×7Fòf–ææ6V—&òF&Wf—<:6ò6ÇfæòUbâfö<:¢öFR§W7F"çFW2FR6öæ6ÇV—"â ¢¢—56–4FVÖæ@¢ò$–æf÷&ÖRòfÆ÷"F4”2âfÆ÷&W2æVvF—f÷2<:6òW&Ö—F–F÷2&&VG\:|;VW2FRW66÷ó²W6RÃVæFòì:6ò†÷WfW"–×7Fòf–ææ6V—&òâ ¢¢$–æf÷&ÖRÃVæFòFVÖæFì:6òF—fW"vW&Fò–×7Fòf–ææ6V—&òâ'ÓÂ÷6ÖÆÃà¢ÂöÆ&VÃà¢ÂöF—cà¢Â÷6V7F–öãà¢Ç6Æ73Ò&×WFVB#âG¶VF—EfÇVRò$ò§W7FRf–6&Vv—7G&Fòæò†—7L;7&–6òâFVÖæFW&ÖæV6R6öæ6Ç\:ÖFR2&÷f:|;VW2çFW&–÷&W2<:6ò&W6W'fF2â"¢Wdæô6†ævRò%&Vv—7G&Fó¢W7FFVÖæFì:6òÇFW&÷RòUbâ"¢$UbGVÆ—¦Fò&W7FFVÖæFâò6&B6W,:6öæ6Ç\:ÖFò;726öæf—&Ö:|:6òF÷2FF÷26–Öâ'ÓÂ÷à¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ'6fRÖFVÖæBÖ6ö×ÆWF–öâ#âG¶VF—EfÇVRò%6Çf"fÆ÷""¢$6öæ6ÇV—"FVÖæF'ÓÂö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ÷VäFVÖæD6ö×ÆWF–öäÖöFÂ†–BÂ²f÷&6T6†V6¶Æ—7BÒfÇ6RÂ&W7VÖVDgFW$UbÒfÇ6RÒÒ·Ò’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢6öç7Bv÷&²ÒFVÖæBbbv÷&´'”–B†FVÖæBæö'&–B“°¢–b‚FVÖæBÇÂv÷&²’°¢6†÷uFö7B‚$ì:6òfö’÷7<:×fVÂÆö6Æ—¦"ö'&f–æ7VÆFçFW2F6öæ6ÇW<:6òâ"“°¢&WGW&ã°¢Ð¢6öç7B—56–4FVÖæBÒFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2#°¢6öç7B—4F—&V7E6–46ö×ÆWF–öâÒVæF–ætF—&V7E6–46ö×ÆWF–öãòæFVÖæD–BÓÓÒFVÖæBæ–BbbFVÖæBæ6öÇVæÓÓÒ'fÆ–FFôö'&2#°¢6öç7B†4UeWFFRÒFVÖæD†4UeWFFTf÷$6ö×ÆWF–öâ†FVÖæB“°¢6öç7BVæF–ætUd6†ævRÒFVÖæD†5VæF–ætUd6†ævTf÷$6ö×ÆWF–öâ†FVÖæB“°¢6öç7BWe&WV—&VÖVçE6F—6f–VBÒ&ööÆVâ€¢†4UeWFFRÇÂ‚—4F—&V7E6–46ö×ÆWF–öâbbVæF–ætUd6†ævRbbFVÖæBæWe6VÔ×VFæ6ÓÓÒG'VR¢“°¢6öç7BWe&WV—&VÖVçEFW‡BÒ†4UeWFFP¢ò$UbGVÆ—¦FòR6Çfò ¢¢VæF–ætUd6†ævP¢ò$Œ:ÇFW&:|:6òVæFVçFRæòUc²6ÇfRVÖæ÷f&Wf—<:6ò&6öæ6ÇV—" ¢¢FVÖæBæWe6VÔ×VFæ6ÓÓÒG'VP¢ò%6VÒ×VFì:væòUbFV6Æ&F ¢¢%&VVæ6†W"öÇFW&"òUb÷RFV6Æ&"VRì:6ò†÷WfR×VFì:v#° ¢–b‚—56–4FVÖæBbbf÷&6T6†V6¶Æ—7Bbb†4UeWFFR’°¢÷VäFVÖæD6ö×ÆWF–öäÖ÷VçDÖöFÂ†–BÂ²Wdæô6†ævS¢fÇ6RÒ“°¢&WGW&ã°¢Ð¢–b‚—56–4FVÖæBbbf÷&6T6†V6¶Æ—7BbbFVÖæBæWe6VÔ×VFæ6ÓÓÒG'VR’°¢÷VäFVÖæD6ö×ÆWF–öäÖ÷VçDÖöFÂ†–BÂ²Wdæô6†ævS¢G'VRÒ“°¢&WGW&ã°¢Ð ¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#à¢Ç6V7F–öâ6Æ73Ò&ÖöFÂÖ6&BFVÖæBÖ6ö×ÆWF–öâÖ6&B"G¶—4F—&V7E6–46ö×ÆWF–öâòFFÖF—&V7B×6–2Ö6ö×ÆWF–öãÒ"G¶W66TGG&–'WFR†FVÖæBæ–B—Ò&¢"'Ò&–ÖÆ&VÆÆVF'“Ò&FVÖæD6ö×ÆWF–öäWeF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#âG¶—56–4FVÖæBò$6öæ6ÇW<:6òF4”2"¢$6öæ6ÇW<:6òFFVÖæF'ÓÂ÷7ãà¢Æƒ"–CÒ&FVÖæD6ö×ÆWF–öäWeF—FÆR#âG¶—56–4FVÖæBò$ö'&–vF÷&–VFFW2&6öæ6ÇV—"4”2"¢$6öæf—&ÖRò–×7FòæòUb'ÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#âG¶—56–4FVÖæ@¢òçFW2FR6öæ6ÇV—"G¶W66TGG&–'WFR†FVÖæBæ–B—ÒÂ6öæf—&2ö'&–vF÷&–VFFW2&—†òæ ¢¢çFW2FR6öæ6ÇV—"G¶W66TGG&–'WFR†FVÖæBæ–B—ÒÂGVÆ—¦RòW7GVFòFRf–&–Æ–FFR÷R–æf÷&ÖRVRW7FFVÖæFì:6òvW&÷R×VFì:væòUbæÓÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢G¶—4F—&V7E6–46ö×ÆWF–öâò ¢ÆF—b6Æ73Ò&6ö×ÆWF–öâ×&W7VÖRÖæ÷F–6R#à¢Ç7ãî)É3Â÷7ãà¢ÆF—cãÇ7G&öæsäF—&WF÷&–ì:6òæV6W7<:&–Â÷7G&öæsãÇ6ÖÆÃäFV6—<:6òfö’6öæf—&ÖFâò6&B<;26W,:6öæ6Ç\:ÖFòFWö—2F6öæfW,:¦æ6–FòUbRF÷2FF÷2f–æ—2ãÂ÷6ÖÆÃãÂöF—cà¢ÂöF—cà¢¢"'Ð¢G¶—56–4FVÖæBò ¢G·&W7VÖVDgFW$Ubò ¢ÆF—b6Æ73Ò&6ö×ÆWF–öâ×&W7VÖRÖæ÷F–6R#à¢Ç7ãî)É3Â÷7ãà¢ÆF—cãÇ7G&öæsäUb6ÇfóÂ÷7G&öæsãÇ6ÖÆÃäò&WV—6—FòFòUbfö’FVæF–Fòâ6öçF–çVR&–æf÷&Ö"÷2FF÷2f–æ—2F4”2ãÂ÷6ÖÆÃãÂöF—cà¢ÂöF—cà¢¢"'Ð¢ÆF—b6Æ73Ò'7Æ—BÖÆ—7B#à¢G·7Æ—D—FVÒ‚$Ub"ÂWe&WV—&VÖVçE6F—6f–VBò)É2G¶We&WV—&VÖVçEFW‡GÖ¢We&WV—&VÖVçEFW‡B—Ð¢G·7Æ—D—FVÒ‚$FFVçG&Vv&VÂ"Â$ö'&–vL;7&–"—Ð¢G·7Æ—D—FVÒ‚%fÆ÷"FFVÖæF"Â$ö'&–vL;7&–ò"—Ð¢ÂöF—cà¢¢"'Ð¢G¶We&WV—&VÖVçE6F—6f–VBò ¢ÆF—b6Æ73Ò&FVÖæBÖ6ö×ÆWF–öâÖ÷F–öç2#à¢Æ'WGFöâ6Æ73Ò&FVÖæB×G—RÖ÷F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6öçF–çVRÖFVÖæBÖ6ö×ÆWF–öâ"FFÖ–CÒ"G¶FVÖæBæ–GÒ"FFÖWbÖæòÖ6†ævSÒ"G¶FVÖæBæWe6VÔ×VFæ6ÓÓÒG'VRò'G'VR"¢&fÇ6R'Ò#à¢Ç7â6Æ73Ò&FVÖæB×G—RÖ–6öâFVÖæB×G—RÖ–6öâÒÖw&VVâ#î)É3Â÷7ãà¢Ç7ããÇ7G&öæsä6öçF–çV"&÷2FF÷2f–æ—3Â÷7G&öæsãÇ6ÖÆÃä–æf÷&Ö"FFVçG&Vv&VÂRfÆ÷"FFVÖæFãÂ÷6ÖÆÃãÂ÷7ãà¢Âö'WGFöãà¢ÂöF—cà¢¢ ¢ÆF—b6Æ73Ò&FVÖæBÖ6ö×ÆWF–öâÖ÷F–öç2#à¢Æ'WGFöâ6Æ73Ò&FVÖæB×G—RÖ÷F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6ö×ÆWFRÖFVÖæB×WFFRÖWb"FFÖ–CÒ"G¶FVÖæBæ–GÒ#à¢Ç7â6Æ73Ò&FVÖæB×G—RÖ–6öâ#äUcÂ÷7ãà¢Ç7ããÇ7G&öæsäGVÆ—¦"òUcÂ÷7G&öæsãÇ6ÖÆÃâG·VæF–ætUd6†ævRò$Œ:ÇFW&:|:6òVæFVçFRFW7FFVÖæFâ6ÇfRòUb&&Vv—7G&"æ÷f&Wf—<:6òâ"¢$'&—"òUbFö'&Â&Vv—7G&"2ÇFW&:|;VW2R6Çf"VÖæ÷f&Wf—<:6òâ'ÓÂ÷6ÖÆÃãÂ÷7ãà¢Âö'WGFöãà¢G·VæF–ætUd6†ævRò""¢ ¢Æ'WGFöâ6Æ73Ò&FVÖæB×G—RÖ÷F–öâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6ö×ÆWFRÖFVÖæBÖæòÖWbÖ6†ævR"FFÖ–CÒ"G¶FVÖæBæ–GÒ#à¢Ç7â6Æ73Ò&FVÖæB×G—RÖ–6öâFVÖæB×G—RÖ–6öâÒÖw&VVâ#î)É3Â÷7ãà¢Ç7ããÇ7G&öæsäì:6ò†÷WfR×VFì:væòUcÂ÷7G&öæsãÇ6ÖÆÃå&Vv—7G&"W‡Æ–6—FÖVçFRVRW7FFVÖæFì:6òÇFW&÷RòW7GVFòãÂ÷6ÖÆÃãÂ÷7ãà¢Âö'WGFöãà¢Ð¢ÂöF—cà¢Ð¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Âöfö÷FW#à¢Â÷6V7F–öãà¢ÂöF—cà¢“°§Ð ¦7–æ2gVæ7F–öâ†æFÆTFVÖæD6ö×ÆWF–öå7V&Ö—B†f÷&Ò’°¢6öç7BFVÖæD–æFW‚Ò7FFRæFVÖæG2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒf÷&ÒæFF6WBæ–B“°¢6öç7BFVÖæBÒ7FFRæFVÖæG5¶FVÖæD–æFW…Ó°¢–b‚FVÖæB’&WGW&ã°¢6öç7B—56–4FVÖæBÒFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2#°¢6öç7Bf÷&ÔFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7BVF—EfÇVRÒf÷&ÒæFF6WBæVF—EfÇVRÓÓÒ'G'VR#°¢6öç7BF—&V7E6–46ö×ÆWF–öâÒ&ööÆVâ€¢VF—EfÇVP¢bbFVÖæBæ6öÇVæÓÓÒ'fÆ–FFôö'&2 ¢bbVæF–ætF—&V7E6–46ö×ÆWF–öãòæFVÖæD–BÓÓÒFVÖæBæ–@¢“°¢–b†VF—EfÇVRbb†FVÖæBæ6öÇVæÓÒ&6öæ6ÇV–Fò"ÇÂFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÒ%4”2"’’&WGW&ã°¢–b‚VF—EfÇVRbbFVÖæBæ6öÇVæÓÓÒ'fÆ–FFôö'&2"bbFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2"bbF—&V7E6–46ö×ÆWF–öâ’°¢6†÷tf÷&ÔW'&÷"‚$6öæf—&ÖR&–ÖV—&òVRW7F4”2ì:6òæV6W76—FFR&÷f:|:6òFF—&WF÷&–â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BFFVçG&Vv&VÂÒ7G&–ær†f÷&ÔFFævWB‚&FFVçG&Vv&VÂ"’ÇÂ""’çG&–Ò‚“°¢–b‚VF—EfÇVRbbFFVçG&Vv&VÂ’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRFFVçG&Vv&VÂçFW2FR6öæ6ÇV—"FVÖæFâ"Âf÷&Ò“°¢f÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ&FFVçG&Vv&VÂ%Òr“òæfö7W2‚“°¢&WGW&ã°¢Ð¢6öç7B&ufÇVRÒ7G&–ær†f÷&ÔFFævWB‚'fÆ÷$vW&Fò"’ÇÂ""’çG&–Ò‚“°¢–b‚&ufÇVR’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRVçFòW7FFVÖæFvW&÷RâW6RÃVæFòì:6ò†÷WfW"–×7Fòf–ææ6V—&òâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BfÆ÷$vW&FòÒ'6T7W'&Væ7’‡&ufÇVR“°¢–b‚—56–4FVÖæBbbfÆ÷$vW&FòÂ’°¢6†÷tf÷&ÔW'&÷"‚$òfÆ÷"vW&FòFWfR6W"¦W&ò÷R÷6—F—fòâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BWe6VÔ×VFæ6Òf÷&ÔFFævWB‚&We6VÔ×VFæ6"’ÓÓÒ'G'VR#°¢–b‚VF—EfÇVRbbWe6VÔ×VFæ6bbFVÖæD†4UeWFFTf÷$6ö×ÆWF–öâ†FVÖæB’’°¢6†÷tf÷&ÔW'&÷"‚$GVÆ—¦RR6ÇfRòUb÷R–æf÷&ÖRVRì:6ò†÷WfR×VFì:vçFW2FR6öæ6ÇV—"â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BFVÖæE6æ6†÷BÒ6ÆöæR†FVÖæB“°¢6öç7B†—7F÷'•6æ6†÷BÒ6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢6öç7BÆV&æ–æuv÷&²Òv÷&´'”–B†FVÖæBæö'&–B“°¢6öç7BÆV&æ–æuv÷&µ6æ6†÷BÒÆV&æ–æuv÷&²ò6ÆöæR†ÆV&æ–æuv÷&²’¢çVÆÃ°¢–b†F—&V7E6–46ö×ÆWF–öâ’°¢FVÖæBç6–4F—&V7F÷%v—fW"Ò°¢ââæ6ÆöæR‡VæF–ætF—&V7E6–46ö×ÆWF–öâçv—fW"’À¢6öæf—&ÖVDÖ÷VçC¢fÆ÷$vW&FòÀ¢Ó°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&&÷f:|:6òFF—&WF÷&–"À¢fÆ÷$çFW&–÷#¢$æV6W76–FFRì:6ò6öæf—&ÖF"À¢fÆ÷$æ÷fó¢ì:6òæV6W7<:&–(	B6öæf—&ÖFò÷"G¶FVÖæBç6–4F—&V7F÷%v—fW"çv—fVD'—ÖÀ¢Ò“°¢Ð¢FVÖæBçfÆ÷$vW&FòÒfÆ÷$vW&Fó°¢–b‚VF—EfÇVR’°¢FVÖæBæFFVçG&Vv&VÂÒFFVçG&Vv&VÃ°¢FVÖæBæWe6VÔ×VFæ6ÒWe6VÔ×VFæ6°¢Ð¢6öç7BWFFVBÒVF—EfÇVRòFVÖæB¢v—BWFFTFVÖæD6öÇVÖâ†FVÖæBæ–BÂ&6öæ6ÇV–Fò"Â°¢W'6—7C¢fÇ6RÀ¢6¶—6ö×ÆWF–öävFS¢G'VRÀ¢F—&V7E6–46ö×ÆWF–öâÀ¢Ò“°¢–b‡WFFVBÓÓÒfÇ6R’°¢–b†FVÖæD–æFW‚ãÒ’7FFRæFVÖæG5¶FVÖæD–æFW…ÒÒFVÖæE6æ6†÷C°¢–b†ÆV&æ–æuv÷&²bbÆV&æ–æuv÷&µ6æ6†÷B’ö&¦V7Bæ76–vâ†ÆV&æ–æuv÷&²ÂÆV&æ–æuv÷&µ6æ6†÷B“°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢&WGW&ã°¢Ð¢–b‚VF—EfÇVRbbFFTöæÇ’†FVÖæE6æ6†÷BæFFVçG&Vv&VÂ’ÓÒFFVçG&Vv&VÂ’°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&FFVçG&Vv&VÂ"À¢fÆ÷$çFW&–÷#¢FFTöæÇ’†FVÖæE6æ6†÷BæFFVçG&Vv&VÂ’òFFUFW‡B†FVÖæE6æ6†÷BæFFVçG&Vv&VÂ’¢$ì:6ò–æf÷&ÖF"À¢fÆ÷$æ÷fó¢FFUFW‡B†FFVçG&Vv&VÂ’À¢Ò“°¢Ð¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢'fÆ÷"vW&Fò"À¢fÆ÷$çFW&–÷#¢FVÖæD†5&V6÷&FVEfÇVR†FVÖæE6æ6†÷B’òÖöæW’†FVÖæE6æ6†÷BçfÆ÷$vW&Fò’¢$ì:6ò–æf÷&ÖFò"À¢fÆ÷$æ÷fó¢ÖöæW’‡fÆ÷$vW&Fò’À¢Ò“°¢G'’°¢v—B6fU7FFTæEv—B‚“°¢Ò6F6‚†W'&÷"’°¢–b†FVÖæD–æFW‚ãÒ’7FFRæFVÖæG5¶FVÖæD–æFW…ÒÒFVÖæE6æ6†÷C°¢–b†ÆV&æ–æuv÷&²bbÆV&æ–æuv÷&µ6æ6†÷B’ö&¦V7Bæ76–vâ†ÆV&æ–æuv÷&²ÂÆV&æ–æuv÷&µ6æ6†÷B“°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢6†÷tf÷&ÔW'&÷"†W'&÷#òæÖW76vRÇÂ$6öæ6ÇW<:6òì:6òfö’6öæf—&ÖFæò&æ6òâ&V6'&VwVR÷2FF÷2çFW2FRFVçF"æ÷fÖVçFRâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢–b†F—&V7E6–46ö×ÆWF–öâ’VæF–ætF—&V7E6–46ö×ÆWF–öâÒçVÆÃ°¢6Æ÷6TÖöFÂ‚“°¢v—B6WEf–Wr‚'v÷&·4÷W&F–öæÂ"“°¢6†÷uFö7B†VF—EfÇVRòG¶FVÖæBæ–GÓ¢fÆ÷"FFVÖæFGVÆ—¦Fò&G¶ÖöæW’‡fÆ÷$vW&Fò—Òæ¢G¶FVÖæBæ–GÒ6öæ6Ç\:ÖFâfÆ÷"vW&Fó¢G¶ÖöæW’‡fÆ÷$vW&Fò—Òæ“°§Ð ¦gVæ7F–öâ6–5v÷&·5fÆ–FFVDÖ÷VçB†FVÖæB’°¢6öç7B&V6÷&FVBÒçVÖ&W"†FVÖæCòç6–5v÷&·5fÆ–FF–öãòæÖ÷VçB“°¢–b„çVÖ&W"æ—4f–æ—FR‡&V6÷&FVB’’&WGW&â&V6÷&FVC°¢&WGW&âFVÖæD†5&V6÷&FVEfÇVR†FVÖæB’òFVÖæE&V6÷&FVEfÇVR†FVÖæB’¢çVÆÃ°§Ð ¦gVæ7F–öâ6–5v÷&·56W'f–6TW†V7WFVB†FVÖæB’°¢6öç7BfÇVRÒFVÖæCòç6–5v÷&·5fÆ–FF–öãòç6W'f–6TW†V7WFVC°¢&WGW&âG—VöbfÇVRÓÓÒ&&ööÆVâ"òfÇVR¢çVÆÃ°§Ð ¦gVæ7F–öâ6–4F—&V7F÷%&VfW&Væ6TÖ÷VçB†FVÖæB’°¢6öç7BVWVVBÒçVÖ&W"†FVÖæCòç6–4F—&V7F÷$&÷fÃòç6–5fÇVR“°¢–b„çVÖ&W"æ—4f–æ—FR‡VWVVB’’&WGW&âVWVVC°¢&WGW&â6–5v÷&·5fÆ–FFVDÖ÷VçB†FVÖæB“°§Ð ¦gVæ7F–öâ÷Vå6–5v÷&·5fÆ–FF–öäÖöFÂ†–B’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢6öç7Bv÷&²ÒFVÖæBbbv÷&´'”–B†FVÖæBæö'&–B“°¢–b‚FVÖæBÇÂv÷&²’°¢6†÷uFö7B‚$4”2&V6—6W7F"f–æ7VÆFVÖö'&l:Æ–FçFW2FfÆ–F:|:6òâ"“°¢&WGW&ã°¢Ð¢6öç7B7W'&VçDÖ÷VçBÒ6–5v÷&·5fÆ–FFVDÖ÷VçB†FVÖæB“°¢6öç7B7W'&VçE6W'f–6TW†V7WFVBÒ6–5v÷&·56W'f–6TW†V7WFVB†FVÖæB“°¢6öç7B–æfòÒFVÖæE6–4–æfò†FVÖæB’ÇÂ·Ó°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&B6–2×fÇVRÖÖöFÂ"–CÒ'6–5v÷&·5fÆ–FF–öäf÷&Ò"FFÖ–CÒ"G¶W66TGG&–'WFR†–B—Ò"&–ÖÆ&VÆÆVF'“Ò'6–5v÷&·5fÆ–FF–öåF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#âG¶W66TGG&–'WFR†FVÖæBæ–B—Ò+rG¶W66TGG&–'WFR†–æfòæÆV6öÔçVÖ&W"ÇÂ%4”2"—ÓÂ÷7ãà¢Æƒ"–CÒ'6–5v÷&·5fÆ–FF–öåF—FÆR#åfÆ–F"4”2VÒö'&3Âöƒ#à¢Ç6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR‡v÷&²ææöÖR—Ò+r6öæf—&ÖRòfÆ÷"R–æf÷&ÖR6Rò6W'fœ:vòF4”2¬:fö’W†V7WFFòãÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢ÆÆ&VÂ6Æ73Ò&f–VÆB6–2×&–Ö'’×fÇVRÖf–VÆB#à¢Ç7ãåfÆ÷"fÆ–FFò÷"ö'&2…"B’£Â÷7ãà¢Æ–çWBæÖSÒ'6–5v÷&·4Ö÷VçB"–çWFÖöFSÒ&FV6–ÖÂ"&WV—&VBWFö6ö×ÆWFSÒ&öfb"fÇVSÒ"G¶7W'&VçDÖ÷VçBÓÓÒçVÆÂò""¢W66TGG&–'WFR†7W'&Væ7”–çWEfÇVR†7W'&VçDÖ÷VçB’—Ò"Æ6V†öÆFW#Ò#Ã"WFöfö7W3à¢Ç6ÖÆÃåW6RVÒfÆ÷"æVvF—fòVæFò4”2&W&W6VçF"&VG\:|:6òFRW66÷òRÃ6öÖVçFRVæFòì:6ò†÷WfW"–×7Fòf–ææ6V—&òãÂ÷6ÖÆÃà¢ÂöÆ&VÃà¢Æf–VÆG6WB6Æ73Ò'6–2×fÇVRÖFV6—6–öâÖ÷F–öç26–2×6W'f–6RÖW†V7WF–öâÖ÷F–öç2#à¢ÆÆVvVæCäò6W'fœ:vòFW7F4”2¬:fö’W†V7WFFóò£ÂöÆVvVæCà¢ÆÆ&VÂ6Æ73Ò'6–2×fÇVRÖFV6—6–öâÖ÷F–öâ#à¢Æ–çWBG—SÒ'&F–ò"æÖSÒ'6–56W'f–6TW†V7WFVB"fÇVSÒ'G'VR"&WV—&VBG¶7W'&VçE6W'f–6TW†V7WFVBÓÓÒG'VRò&6†V6¶VB"¢"'Óà¢Ç7ããÇ7G&öæså6–ÒÂ6W'fœ:vòW†V7WFFóÂ÷7G&öæsãÇ6ÖÆÃäò6W'fœ:vò6÷'&W7öæFVçFR:4”2¬:fö’&VÆ—¦FòãÂ÷6ÖÆÃãÂ÷7ãà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò'6–2×fÇVRÖFV6—6–öâÖ÷F–öâ#à¢Æ–çWBG—SÒ'&F–ò"æÖSÒ'6–56W'f–6TW†V7WFVB"fÇVSÒ&fÇ6R"&WV—&VBG¶7W'&VçE6W'f–6TW†V7WFVBÓÓÒfÇ6Rò&6†V6¶VB"¢"'Óà¢Ç7ããÇ7G&öæsäì:6òW†V7WFFóÂ÷7G&öæsãÇ6ÖÆÃäò6W'fœ:vò–æFì:6òfö’&VÆ—¦FòãÂ÷6ÖÆÃãÂ÷7ãà¢ÂöÆ&VÃà¢Âöf–VÆG6WCà¢ÆF—b6Æ73Ò&–æfòÖ&÷‚#à¢Ç7G&öæså&7G&V&–Æ–FFSÂ÷7G&öæsà¢Ç7ãäòfÆ÷"Â6—GV:|:6òFRW†V7\:|:6òÂòW7\:&–òRFFFW7FfÆ–F:|:6ò6W,:6ò&Vv—7G&F÷2æò†—7L;7&–6òFFVÖæFãÂ÷7ãà¢ÂöF—cà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#ä6öæf—&Ö"fÆ–F:|:6óÂö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°§Ð ¦7–æ2gVæ7F–öâ†æFÆU6–5v÷&·5fÆ–FF–öå7V&Ö—B†f÷&Ò’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒf÷&ÒæFF6WBæ–B“°¢–b‚FVÖæB’&WGW&ã°¢6öç7BFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7B&ufÇVRÒ7G&–ær†FFævWB‚'6–5v÷&·4Ö÷VçB"’ÇÂ""’çG&–Ò‚“°¢–b‚&ufÇVR’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRòfÆ÷"fÆ–FFò÷"ö'&2â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7B6W'f–6TW†V7WFVEfÇVRÒ7G&–ær†FFævWB‚'6–56W'f–6TW†V7WFVB"’ÇÂ""“°¢–b‚²'G'VR"Â&fÇ6R%Òæ–æ6ÇVFW2‡6W'f–6TW†V7WFVEfÇVR’’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖR6Rò6W'fœ:vòFW7F4”2¬:fö’W†V7WFFòâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BÖ÷VçBÒ'6T7W'&Væ7’‡&ufÇVR“°¢6öç7B6W'f–6TW†V7WFVBÒ6W'f–6TW†V7WFVEfÇVRÓÓÒ'G'VR#°¢6öç7BWFFVBÒv—BWFFTFVÖæD6öÇVÖâ†FVÖæBæ–BÂ'fÆ–FFôö'&2"Â°¢v÷&·5fÆ–FF–öäFF¢°¢fW'6–öã¢"À¢Ö÷VçBÀ¢6W'f–6TW†V7WFVBÀ¢fÆ–FFVDC¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢fÆ–FFVD'“¢7W'&VçEW6W"‚“òææöÖRÇÂ%W7\:&–ò4ÅC3c"À¢ÒÀ¢Ò“°¢–b‚WFFVB’&WGW&ã°¢6Æ÷6TÖöFÂ‚“°¢&VæFW"‚“°¢6†÷uFö7B†4”2fÆ–FF÷"ö'&26öÒfÆ÷"FRG¶ÖöæW’†Ö÷VçB—Ò+r6W'fœ:vòG·6W'f–6TW†V7WFVBò&W†V7WFFò"¢&ì:6òW†V7WFFò'Òæ“°§Ð ¦gVæ7F–öâ÷Vå6–4F—&V7F÷$FV6—6–öäÖöFÂ†–BÂ²F—&V7DfÆ÷rÒfÇ6RÒÒ·Ò’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢6öç7Bv÷&²ÒFVÖæBbbv÷&´'”–B†FVÖæBæö'&–B“°¢–b‚FVÖæBÇÂv÷&²’&WGW&ã°¢6öç7B&VfW&Væ6TÖ÷VçBÒ6–4F—&V7F÷%&VfW&Væ6TÖ÷VçB†FVÖæB“°¢6öç7B–æfòÒFVÖæE6–4–æfò†FVÖæB’ÇÂ·Ó°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&B6–2×fÇVRÖÖöFÂ"–CÒ'6–4F—&V7F÷$FV6—6–öäf÷&Ò"FFÖ–CÒ"G¶W66TGG&–'WFR†–B—Ò"&–ÖÆ&VÆÆVF'“Ò'6–4F—&V7F÷$FV6—6–öåF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#âG¶W66TGG&–'WFR†FVÖæBæ–B—Ò+rG¶W66TGG&–'WFR†–æfòæÆV6öÔçVÖ&W"ÇÂ%4”2"—ÓÂ÷7ãà¢Æƒ"–CÒ'6–4F—&V7F÷$FV6—6–öåF—FÆR#âG¶F—&V7DfÆ÷rò$6öæ6ÇV—"&÷f:|:6òF—&WFVÆF—&WF÷&–"¢$6öæf—&Ö"fÆ÷"&÷fFòVÆF—&WF÷&–'ÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR‡v÷&²ææöÖR—Ò+rG¶F—&V7DfÆ÷rò&WF"FR#¢"¢"'Ö6öæf—&ÖR6RF—&WF÷&–ÖçFWfRòfÆ÷"&W6VçFFò÷R&÷f÷RVÖ&Wf—<:6òãÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢ÆF—b6Æ73Ò'6–2×&VfW&Væ6R×fÇVR#à¢Ç7ãåfÆ÷"&W6VçFFò:F—&WF÷&–Â÷7ãà¢Ç7G&öæsâG·&VfW&Væ6TÖ÷VçBÓÓÒçVÆÂò$ì:6ò&Vv—7G&Fò"¢ÖöæW’‡&VfW&Væ6TÖ÷VçB—ÓÂ÷7G&öæsà¢ÂöF—cà¢Æf–VÆG6WB6Æ73Ò'6–2×fÇVRÖFV6—6–öâÖ÷F–öç2#à¢ÆÆVvVæCå&W7VÇFFòF&÷f:|:6ò£ÂöÆVvVæCà¢ÆÆ&VÂ6Æ73Ò'6–2×fÇVRÖFV6—6–öâÖ÷F–öâG·&VfW&Væ6TÖ÷VçBÓÓÒçVÆÂò&—2ÖF—6&ÆVB"¢"'Ò#à¢Æ–çWBG—SÒ'&F–ò"æÖSÒ&F—&V7F÷%fÇVTFV6—6–öâ"fÇVSÒ&¶VW"&WV—&VBG·&VfW&Væ6TÖ÷VçBÓÓÒçVÆÂò&F—6&ÆVB"¢"'Óà¢Ç7ããÇ7G&öæsäÖçFW"òfÆ÷"&W6VçFFóÂ÷7G&öæsãÇ6ÖÆÃäòfÆ÷"&÷fFò6W,:G·&VfW&Væ6TÖ÷VçBÓÓÒçVÆÂò&òfÆ÷"&Vv—7G&FòçFW&–÷&ÖVçFR"¢ÖöæW’‡&VfW&Væ6TÖ÷VçB—ÒãÂ÷6ÖÆÃãÂ÷7ãà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò'6–2×fÇVRÖFV6—6–öâÖ÷F–öâ#à¢Æ–çWBG—SÒ'&F–ò"æÖSÒ&F—&V7F÷%fÇVTFV6—6–öâ"fÇVSÒ'&Wf—6R"&WV—&VCà¢Ç7ããÇ7G&öæsä–æf÷&Ö"fÆ÷"&Wf—6FóÂ÷7G&öæsãÇ6ÖÆÃåW6RVæFòF—&WF÷&–&÷f"VÒfÆ÷"F–fW&VçFRãÂ÷6ÖÆÃãÂ÷7ãà¢ÂöÆ&VÃà¢Âöf–VÆG6WCà¢ÆÆ&VÂ6Æ73Ò&f–VÆB6–2×&Wf—6VB×fÇVRÖf–VÆB"†–FFVãà¢Ç7ãåfÆ÷"&Wf—6Fò&÷fFò…"B’£Â÷7ãà¢Æ–çWBæÖSÒ'6–4F—&V7F÷$Ö÷VçB"–çWFÖöFSÒ&FV6–ÖÂ"WFö6ö×ÆWFSÒ&öfb"Æ6V†öÆFW#Ò#Ã#à¢Ç6ÖÆÃäW7FRfÆ÷"7V'7F—GV—,:òfÆ÷"&W6VçFFòRf–6,:&Vv—7G&Fòæò†—7L;7&–6òâ&VG\:|;VW2FRW66÷òöFVÒ6W"–æf÷&ÖF26öÒ6–æÂæVvF—fòãÂ÷6ÖÆÃà¢ÂöÆ&VÃà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#âG¶F—&V7DfÆ÷rò$6öæ6ÇV—"&÷f:|:6òF—&WF"¢$6öæf—&Ö"R&÷f"'ÓÂö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°§Ð ¦7–æ2gVæ7F–öâ†æFÆU6–4F—&V7F÷$FV6—6–öå7V&Ö—B†f÷&Ò’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒf÷&ÒæFF6WBæ–B“°¢–b‚FVÖæB’&WGW&ã°¢6öç7BFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7BFV6—6–öâÒ7G&–ær†FFævWB‚&F—&V7F÷%fÇVTFV6—6–öâ"’ÇÂ""“°¢6öç7B&VfW&Væ6TÖ÷VçBÒ6–4F—&V7F÷%&VfW&Væ6TÖ÷VçB†FVÖæB“°¢–b‚FV6—6–öâ’°¢6†÷tf÷&ÔW'&÷"‚$6öæf—&ÖR6RòfÆ÷"fö’ÖçF–Fò÷R&Wf—6FòVÆF—&WF÷&–â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢ÆWBf–æÄÖ÷VçBÒ&VfW&Væ6TÖ÷VçC°¢–b†FV6—6–öâÓÓÒ'&Wf—6R"’°¢6öç7B&ufÇVRÒ7G&–ær†FFævWB‚'6–4F—&V7F÷$Ö÷VçB"’ÇÂ""’çG&–Ò‚“°¢–b‚&ufÇVR’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRòfÆ÷"&Wf—6Fò&÷fFòVÆF—&WF÷&–â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢f–æÄÖ÷VçBÒ'6T7W'&Væ7’‡&ufÇVR“°¢Ð¢–b†f–æÄÖ÷VçBÓÓÒçVÆÂÇÂçVÖ&W"æ—4f–æ—FR†f–æÄÖ÷VçB’’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRVÒfÆ÷"&÷fFòl:Æ–Fòâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BWFFVBÒv—BWFFTFVÖæD6öÇVÖâ†FVÖæBæ–BÂ&&÷fFôF—&WF÷&–"Â°¢F—&V7F÷$FV6—6–öäFF¢°¢fW'6–öã¢À¢&W6VçFVDÖ÷VçC¢&VfW&Væ6TÖ÷VçBÀ¢f–æÄÖ÷VçBÀ¢&Wf—6VC¢FV6—6–öâÓÓÒ'&Wf—6R"À¢FV6–FVDC¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢FV6–FVD'“¢7W'&VçEW6W"‚“òææöÖRÇÂ%W7\:&–ò4ÅC3c"À¢ÒÀ¢Ò“°¢–b‚WFFVB’&WGW&ã°¢6Æ÷6TÖöFÂ‚“°¢&VæFW"‚“°¢6†÷uFö7B†4”2&÷fFVÆF—&WF÷&–6öÒfÆ÷"FRG¶ÖöæW’†f–æÄÖ÷VçB—Òæ“°§Ð ¦gVæ7F–öâ÷Vå6–4F—&V7F÷%v—fW$ÖöFÂ†–B’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢6öç7Bv÷&²ÒFVÖæBbbv÷&´'”–B†FVÖæBæö'&–B“°¢–b‚FVÖæBÇÂv÷&²ÇÂFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÒ%4”2"ÇÂFVÖæBæ6öÇVæÓÒ&&÷f6ôF—&WF÷&–"’°¢6†÷uFö7B‚$F—7Vç6<;2öFR6W"&Vv—7G&F&VÖ4”2VÒwV&FæFò&÷f:|:6òF—&WF÷&–â"“°¢&WGW&ã°¢Ð¢–b‚6åv—fU6–4F—&V7F÷$&÷fÂ‚’’°¢6†÷uFö7B‚%6öÖVçFRW7\:&–÷2vW7F÷"÷RFÖ–âöFVÒF—7Vç6"&÷f:|:6òFF—&WF÷&–â"“°¢&WGW&ã°¢Ð¢–b‡6–4F—&V7F÷%v—fW$FF†FVÖæB’’°¢÷VäFVÖæD6ö×ÆWF–öäÖöFÂ†FVÖæBæ–B“°¢&WGW&ã°¢Ð¢6öç7B–æfòÒFVÖæE6–4–æfò†FVÖæB’ÇÂ·Ó°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&B6–2×fÇVRÖÖöFÂ"–CÒ'6–4F—&V7F÷%v—fW$f÷&Ò"FFÖ–CÒ"G¶W66TGG&–'WFR†–B—Ò"&–ÖÆ&VÆÆVF'“Ò'6–4F—&V7F÷%v—fW%F—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#âG¶W66TGG&–'WFR†FVÖæBæ–B—Ò+rG¶W66TGG&–'WFR†–æfòæÆV6öÔçVÖ&W"ÇÂ%4”2"—ÓÂ÷7ãà¢Æƒ"–CÒ'6–4F—&V7F÷%v—fW%F—FÆR#äF—7Vç6"&÷f:|:6òFF—&WF÷&–Âöƒ#à¢Ç6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR‡v÷&²ææöÖR—Ò+rW6R6öÖVçFRVæFòW7F4”2VFW"6W"6öæ6Ç\:ÖF6VÒ6W"&W6VçFF:F—&WF÷&–ãÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢ÆF—b6Æ73Ò&–æfòÖ&÷‚#à¢Ç7G&öæsäW†6\:|:6òVF—FFÂ÷7G&öæsà¢Ç7ãäW7F:|:6òì:6ò&Vv—7G&&÷f:|:6òFF—&WF÷&–âVÆ&Vv—7G&f÷&ÖÆÖVçFRF—7Vç6RÖçL:–ÒòfÇW†òFR6öæ6ÇW<:6òÂ–æ6ÇV–æFò6öæfW,:¦æ6–FòUbÂFFFRFòfÆ÷"f–æÂãÂ÷7ãà¢ÂöF—cà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãä§W7F–f–6F—fFF—7Vç6£Â÷7ãà¢ÇFW‡F&VæÖSÒ'v—fW%&V6öâ"&÷w3Ò#B"Ö–æÆVæwFƒÒ#"&WV—&VBÆ6V†öÆFW#Ò$W‚ã¢4”2&÷fFF—&WFÖVçFRÂ6VÒæV6W76–FFRFR&W6VçF:|:6ò:F—&WF÷&–â"WFöfö7W3ãÂ÷FW‡F&Và¢Ç6ÖÆÂ6Æ73Ò&×WFVB#ä§W7F–f–6F—fÂòW7\:&–òRFFf–6,:6òæò†—7L;7&–6òFFVÖæFãÂ÷6ÖÆÃà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò'fÆ–FF–öâ×6¶—#à¢Æ–çWBæÖSÒ&6öæf—&Õv—fW""G—SÒ&6†V6¶&÷‚"fÇVSÒ'G'VR"&WV—&VCà¢Ç7ãä6öæf—&ÖòVRW7F4”2ì:6ò&V6—66W"&W6VçFF:F—&WF÷&–RFWfR6VwV—"&ò6†V6¶Æ—7BFR6öæ6ÇW<:6òãÂ÷7ãà¢ÂöÆ&VÃà¢Ç6Æ73Ò&×WFVB#äò6&BFWF6VÖæÂì:6ò6W,:&VÖ÷f–FòWFöÖF–6ÖVçFRâW6R(	ÄW†6ÇV—"F6VÖæ(	Òæ&&÷f:|:6òFR4”2w2VæFòVÆR–æFW7F—fW"f—<:×fVÂãÂ÷à¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#å&Vv—7G&"F—7Vç6R6öçF–çV#Âö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ÷Vå6–4F—&V7F÷%&WV—&VÖVçDÖöFÂ†–B’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢6öç7Bv÷&²ÒFVÖæBbbv÷&´'”–B†FVÖæBæö'&–B“°¢–b‚FVÖæBÇÂv÷&²ÇÂFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÒ%4”2"ÇÂFVÖæBæ6öÇVæÓÒ'fÆ–FFôö'&2"’°¢6†÷uFö7B‚$6öæf—&Ö:|:6ò<;2öFR6W"fV—F&VÖ4”2VÒfÆ–FFòö'&2â"“°¢&WGW&ã°¢Ð¢6öç7B–æfòÒFVÖæE6–4–æfò†FVÖæB’ÇÂ·Ó°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&B6–2×fÇVRÖÖöFÂ"–CÒ'6–4F—&V7F÷%&WV—&VÖVçDf÷&Ò"FFÖ–CÒ"G¶W66TGG&–'WFR†–B—Ò"&–ÖÆ&VÆÆVF'“Ò'6–4F—&V7F÷%&WV—&VÖVçEF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#âG¶W66TGG&–'WFR†FVÖæBæ–B—Ò+rG¶W66TGG&–'WFR†–æfòæÆV6öÔçVÖ&W"ÇÂ%4”2"—ÓÂ÷7ãà¢Æƒ"–CÒ'6–4F—&V7F÷%&WV—&VÖVçEF—FÆR#äæV6W7<:&–&÷f:|:6òFF—&WF÷&–óÂöƒ#à¢Ç6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR‡v÷&²ææöÖR—Ò+r6öæf—&ÖRòfÇW†òçFW2FR6öæ6ÇV—"W7F4”2ãÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢Æf–VÆG6WB6Æ73Ò'6–2×fÇVRÖFV6—6–öâÖ÷F–öç2#à¢ÆÆVvVæCäW66öÆ†VÖ÷:|:6ò£ÂöÆVvVæCà¢ÆÆ&VÂ6Æ73Ò'6–2×fÇVRÖFV6—6–öâÖ÷F–öâ#à¢Æ–çWBG—SÒ'&F–ò"æÖSÒ&F—&V7F÷$&÷fÅ&WV—&VB"fÇVSÒ'–W2"&WV—&VBWFöfö7W3à¢Ç7ããÇ7G&öæså6–ÒÂ:’æV6W7<:&–Â÷7G&öæsãÇ6ÖÆÃäò6&BW&ÖæV6W,:VÒfÆ–FFòö'&2RFWfW,:6VwV—"&wV&FæFò&÷f:|:6òF—&WF÷&–ãÂ÷6ÖÆÃãÂ÷7ãà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò'6–2×fÇVRÖFV6—6–öâÖ÷F–öâ#à¢Æ–çWBG—SÒ'&F–ò"æÖSÒ&F—&V7F÷$&÷fÅ&WV—&VB"fÇVSÒ&æò"&WV—&VCà¢Ç7ããÇ7G&öæsäì:6ò:’æV6W7<:&–Â÷7G&öæsãÇ6ÖÆÃå6VwV—"&6öæfW,:¦æ6–FòUbR&÷2FF÷2f–æ—2F4”2ãÂ÷6ÖÆÃãÂ÷7ãà¢ÂöÆ&VÃà¢Âöf–VÆG6WCà¢ÆF—b6Æ73Ò&–æfòÖ&÷‚#à¢Ç7G&öæså&Vv—7G&òVF—L:fVÃÂ÷7G&öæsà¢Ç7ãäò6—7FVÖ&Vv—7G&,:òW7\:&–òÂFFÂFV6—<:6òFRì:6òVçf–":F—&WF÷&–RòfÆ÷"f–æÂ–æf÷&ÖFòæ6öæ6ÇW<:6òãÂ÷7ãà¢ÂöF—cà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#ä6öæf—&Ö"FV6—<:6óÂö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°§Ð ¦7–æ2gVæ7F–öâ†æFÆU6–4F—&V7F÷%&WV—&VÖVçE7V&Ö—B†f÷&Ò’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒf÷&ÒæFF6WBæ–B“°¢–b‚FVÖæBÇÂFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÒ%4”2"ÇÂFVÖæBæ6öÇVæÓÒ'fÆ–FFôö'&2"’°¢6†÷tf÷&ÔW'&÷"‚$4”2ì:6òW7L:Ö—2VÒfÆ–FFòö'&2â&V6'&VwVR÷2FF÷2çFW2FRFVçF"æ÷fÖVçFRâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7Bf÷&ÔFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7B&÷fÅ&WV—&VBÒ7G&–ær†f÷&ÔFFævWB‚&F—&V7F÷$&÷fÅ&WV—&VB"’ÇÂ""“°¢–b‚&÷fÅ&WV—&VB’°¢6†÷tf÷&ÔW'&÷"‚$6öæf—&ÖR6RW7F4”2æV6W76—FFR&÷f:|:6òFF—&WF÷&–â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢–b†&÷fÅ&WV—&VBÓÓÒ'–W2"’°¢–b‡VæF–ætF—&V7E6–46ö×ÆWF–öãòæFVÖæD–BÓÓÒFVÖæBæ–B’VæF–ætF—&V7E6–46ö×ÆWF–öâÒçVÆÃ°¢6Æ÷6TÖöFÂ‚“°¢&VæFW"‚“°¢6†÷uFö7B‚$Ö÷f–ÖVçF:|:6ò6æ6VÆFâ4”2FWfR6VwV—"&wV&FæFò&÷f:|:6òF—&WF÷&–â"“°¢&WGW&ã°¢Ð¢6öç7B7F÷"Ò7W'&VçEW6W"‚’ÇÂ·Ó°¢VæF–ætF—&V7E6–46ö×ÆWF–öâÒ°¢FVÖæD–C¢FVÖæBæ–BÀ¢v÷&´–C¢FVÖæBæö'&–BÀ¢v—fW#¢°¢fW'6–öã¢"À¢&WV—&VC¢fÇ6RÀ¢&V6öã¢$&÷f:|:6òFF—&WF÷&–ì:6òæV6W7<:&–"À¢6÷W&6U†6S¢'fÆ–FFôö'&2"À¢v—fVDC¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢v—fVD'“¢7F÷"ææöÖRÇÂ%W7\:&–ò4ÅC3c"À¢v—fVD'”–C¢7F÷"æ–BÇÂ""À¢ÒÀ¢Ó°¢÷VäFVÖæD6ö×ÆWF–öäÖöFÂ†FVÖæBæ–BÂ²f÷&6T6†V6¶Æ—7C¢G'VRÒ“°§Ð ¦7–æ2gVæ7F–öâ†æFÆU6–4F—&V7F÷%v—fW%7V&Ö—B†f÷&Ò’°¢6öç7BFVÖæD–æFW‚Ò7FFRæFVÖæG2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒf÷&ÒæFF6WBæ–B“°¢6öç7BFVÖæBÒ7FFRæFVÖæG5¶FVÖæD–æFW…Ó°¢–b‚FVÖæB’&WGW&ã°¢–b‚6åv—fU6–4F—&V7F÷$&÷fÂ‚’’°¢6†÷tf÷&ÔW'&÷"‚%6öÖVçFRW7\:&–÷2vW7F÷"÷RFÖ–âöFVÒF—7Vç6"&÷f:|:6òFF—&WF÷&–â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢–b†FVÖæEG—T¶W’†FVÖæBçF—ò’ÓÒ%4”2"ÇÂFVÖæBæ6öÇVæÓÒ&&÷f6ôF—&WF÷&–"’°¢6†÷tf÷&ÔW'&÷"‚$4”2ì:6òW7L:Ö—2VÒwV&FæFò&÷f:|:6òF—&WF÷&–â&V6'&VwVR÷2FF÷2â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7B&V6öâÒ7G&–ær†FFævWB‚'v—fW%&V6öâ"’ÇÂ""’çG&–Ò‚“°¢–b‡&V6öâæÆVæwF‚Â’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRVÖ§W7F–f–6F—f6öÒVÆòÖVæ÷26&7FW&W2â"Âf÷&Ò“°¢f÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ'v—fW%&V6öâ%Òr“òæfö7W2‚“°¢&WGW&ã°¢Ð¢–b†FFævWB‚&6öæf—&Õv—fW""’ÓÒ'G'VR"’°¢6†÷tf÷&ÔW'&÷"‚$6öæf—&ÖRVR&÷f:|:6òFF—&WF÷&–fö’F—7Vç6Fâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7B7F÷"Ò7W'&VçEW6W"‚’ÇÂ·Ó°¢6öç7BFVÖæE6æ6†÷BÒ6ÆöæR†FVÖæB“°¢6öç7B†—7F÷'•6æ6†÷BÒ6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢FVÖæBç6–4F—&V7F÷%v—fW"Ò°¢fW'6–öã¢À¢&V6öâÀ¢v—fVDC¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢v—fVD'“¢7F÷"ææöÖRÇÂ%W7\:&–ò4ÅC3c"À¢v—fVD'”–C¢7F÷"æ–BÇÂ""À¢Ó°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&&÷f:|:6òFF—&WF÷&–"À¢fÆ÷$çFW&–÷#¢$wV&FæFò&W6VçF:|:6ò"À¢fÆ÷$æ÷fó¢F—7Vç6F(	BG·&V6öçÖÀ¢Ò“°¢G'’°¢v—B6fU7FFTæEv—B‚“°¢Ò6F6‚†W'&÷"’°¢–b†FVÖæD–æFW‚ãÒ’7FFRæFVÖæG5¶FVÖæD–æFW…ÒÒFVÖæE6æ6†÷C°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢6†÷tf÷&ÔW'&÷"†W'&÷#òæÖW76vRÇÂ$F—7Vç6ì:6òfö’6öæf—&ÖFæò&æ6òâ&V6'&VwVR÷2FF÷2çFW2FRFVçF"æ÷fÖVçFRâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢÷VäFVÖæD6ö×ÆWF–öäÖöFÂ†FVÖæBæ–B“°§Ð ¦ÆWB6–4F—&V7F÷%VWVT6öçFW‡BÒçVÆÃ° ¦gVæ7F–öâ&÷fÅvVV´÷F–öäÆ&VÂ‡vVV²’°¢6öç7BW&–öBÒvVV³òç7F'BbbvVV³òæVæBòG¶FFUFW‡B‡vVV²ç7F'B—ÒG¶FFUFW‡B‡vVV²æVæB—Ö¢&FF2FVf–æ—"#°¢6öç7B7FGW2Ò&÷fÅvVVµ7FGW2‡vVV²ÂFöF”•4ò‚’’ÓÓÒ'&÷f—6–öæÂ"ò"+r&÷f—<;7&–"¢"#°¢&WGW&âG·vVV³òæÆ&VÂÇÂ%6VÖæ'Ò(	BG·W&–öGÒG·7FGW7Ö°§Ð ¦7–æ2gVæ7F–öâ7–æ6‡&öæ—¦T&÷fÄ6ÆVæF"‡&÷r’°¢6öç7B–ÆöBÒ&÷sòç–ÆöC°¢–b‚–ÆöBÇÂ'&’æ—4'&’‡–ÆöBçvVV·2’’&WGW&â&÷s°¢6öç7B6ÆVæF"Ò&V6öæ6–ÆT&÷fÅvVV·2‡–ÆöBçvVV·2ÂFöF”•4ò‚’“°¢–b‚6ÆVæF"æ6†ævVB’&WGW&â&÷s°¢6öç7Bæ÷&ÖÆ—¦VE–ÆöBÒ²ââç–ÆöBÂvVV·3¢6ÆVæF"çvVV·2Ó°¢–b‚vÆö&ÅF†—2å4ÅEô4ÄõTBæ6åw&—FR‚'v÷&·2"’’&WGW&â²ââç&÷rÂ–ÆöC¢æ÷&ÖÆ—¦VE–ÆöBÓ°¢6öç7B6fVBÒv—BvÆö&ÅF†—2å4ÅEô4ÄõTBç6fU6–4&÷fÅ6æ6†÷B†æ÷&ÖÆ—¦VE–ÆöBÂ&÷rç&Wf—6–öâ“°¢–b‡6fVB’&WGW&â²–ÆöC¢æ÷&ÖÆ—¦VE–ÆöBÂ&Wf—6–öã¢6fVBç&Wf—6–öâÓ°¢6öç7BÆFW7BÒv—BvÆö&ÅF†—2å4ÅEô4ÄõTBç6–4&÷fÅ6æ6†÷B‚“°¢6öç7BÆFW7D6ÆVæF"Ò&V6öæ6–ÆT&÷fÅvVV·2†ÆFW7Còç–ÆöCòçvVV·2ÂFöF”•4ò‚’“°¢&WGW&âÆFW7Còç–Æö@¢ò²ââæÆFW7BÂ–ÆöC¢²ââæÆFW7Bç–ÆöBÂvVV·3¢ÆFW7D6ÆVæF"çvVV·2ÒÐ¢¢&÷s°§Ð ¦gVæ7F–öâ&Vg&W6„&÷fÅvVV´7&VF÷"†f÷&Ò’°¢6öç7B†÷7BÒf÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2×vVV²Ö7&VF÷%Ò"“°¢–b‚†÷7BÇÂ6–4F—&V7F÷%VWVT6öçFW‡B’&WGW&ã°¢6öç7B7&VF–ærÒ7G&–ær†æWrf÷&ÔFF†f÷&Ò’ævWB‚&&÷fÅvVV´–B"’ÇÂ""’ÓÓÒ%õöæWuõò#°¢–b‚7&VF–ær’°¢†÷7Bæ–ææW$…DÔÂÒ"#°¢FVÆWFR†÷7BæFF6WBæ7F—fS°¢&WGW&ã°¢Ð¢–b††÷7BæFF6WBæ7F—fRÓÓÒ'G'VR"’&WGW&ã°¢6öç7BG&gBÒæW‡D&÷fÅvVV´G&gB‡6–4F—&V7F÷%VWVT6öçFW‡Bç–ÆöBçvVV·2ÂFöF”•4ò‚’“°¢†÷7Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&–æfòÖ&÷‚#à¢Ç7G&öæsä7&–"æ÷f6VÖæFR&W6VçF:|:6óÂ÷7G&öæsà¢Ç7ãäòW,:ÖöFò:’7VvW&–FòVÆò6ÆVæL:&–òÂÖ2fö<:¢öFRÇFW&"2FF2VæFò&WVæœ:6òFF—&WF÷&–f÷"&VÖ&6FãÂ÷7ãà¢ÂöF—cà¢ÆF—b6Æ73Ò&f÷&ÒÖw&–BF‡&VRÖ6öÇVÖç2#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãäæöÖRF6VÖæ£Â÷7ããÆ–çWBæÖSÒ&&÷fÅvVV´Æ&VÂ"&WV—&VBfÇVSÒ"G¶W66TGG&–'WFR†G&gBæÆ&VÂ—Ò"Ö†ÆVæwFƒÒ#ƒ#ãÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãäFF–æ–6–Â£Â÷7ããÆ–çWBæÖSÒ&&÷fÅvVVµ7F'B"G—SÒ&FFR"&WV—&VBfÇVSÒ"G¶W66TGG&–'WFR†G&gBç7F'B—Ò#ãÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãäFFf–æÂ£Â÷7ããÆ–çWBæÖSÒ&&÷fÅvVV´VæB"G—SÒ&FFR"&WV—&VBfÇVSÒ"G¶W66TGG&–'WFR†G&gBæVæB—Ò#ãÂöÆ&VÃà¢ÂöF—cà¢Ç6ÖÆÂ6Æ73Ò&×WFVB#å6VÖæ27&–F2ÖçVÆÖVçFR¬:æ66VÒF—f2âVæ26VÖæ2vW&F2÷"F–ÖVçFòf–6Ò&÷f—<;7&–2L:’7VFF–æ–6–ÂãÂ÷6ÖÆÃà¢“°¢†÷7BæFF6WBæ7F—fRÒ'G'VR#°§Ð ¦7–æ2gVæ7F–öâ7&VFT&÷fÅvVV´g&öÔf÷&Ò†f÷&ÒÂ6öçFW‡BÂFF’°¢6öç7BÆ&VÂÒ7G&–ær†FFævWB‚&&÷fÅvVV´Æ&VÂ"’ÇÂ""’çG&–Ò‚“°¢6öç7B7F'BÒ7G&–ær†FFævWB‚&&÷fÅvVVµ7F'B"’ÇÂ""’çG&–Ò‚“°¢6öç7BVæBÒ7G&–ær†FFævWB‚&&÷fÅvVV´VæB"’ÇÂ""’çG&–Ò‚“°¢–b‚Æ&VÂÇÂ7F'BÇÂVæB’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRòæöÖRÂFF–æ–6–ÂRFFf–æÂFæ÷f6VÖæâ"Âf÷&Ò“°¢&WGW&âçVÆÃ°¢Ð¢–b‡7F'BâVæB’°¢6†÷tf÷&ÔW'&÷"‚$FFf–æÂF6VÖæì:6òöFR6W"çFW&–÷":FF–æ–6–Ââ"Âf÷&Ò“°¢&WGW&âçVÆÃ°¢Ð¢6öç7BW†—7F–ærÒ'&’æ—4'&’†6öçFW‡Bç–ÆöBçvVV·2’ò6öçFW‡Bç–ÆöBçvVV·2¢µÓ°¢6öç7BGWÆ–6FTÆ&VÂÒW†—7F–ærç6öÖR†—FVÒÓâæ÷&ÖÆ—¦U6V&6…FW‡B†—FVÓòæÆ&VÂ’ÓÓÒæ÷&ÖÆ—¦U6V&6…FW‡B†Æ&VÂ’“°¢–b†GWÆ–6FTÆ&VÂ’°¢6†÷tf÷&ÔW'&÷"‚$¬:W†—7FRVÖ6VÖæ6öÒW76RæöÖRâW66öÆ†6VÖæW†—7FVçFR÷RÇFW&RòæöÖRâ"Âf÷&Ò“°¢&WGW&âçVÆÃ°¢Ð¢6öç7B÷fW&ÆÒW†—7F–æræf–æB†—FVÒÓâ—FVÓòç7F'Bbb—FVÓòæVæBbb7F'BÃÒ—FVÒæVæBbbVæBãÒ—FVÒç7F'B“°¢–b†÷fW&Æ’°¢6†÷tf÷&ÔW'&÷"†òW,:ÖöFò–æf÷&ÖFò6ö–æ6–FR6öÒG¶÷fW&ÆæÆ&VÂÇÂ&÷WG&6VÖæ'Òâ§W7FR2FF2÷R6VÆV6–öæR6VÖæW†—7FVçFRæÂf÷&Ò“°¢&WGW&âçVÆÃ°¢Ð¢6öç7Bæ÷rÒæWrFFR‚’çFô•4õ7G&–ær‚“°¢6öç7BvVV²Ò°¢–C¢rÖ6ÆVæF"ÒG·7F'GÒÒG´FFRææ÷r‚—ÖÀ¢Æ&VÂÀ¢7F'BÀ¢VæBÀ¢–×÷'FVDC¢æ÷rÀ¢f–ævW'&–çC¢çVÆÂÀ¢Æ6V†öÆFW#¢fÇ6RÀ¢7&VFVD'•÷7GöæS¢fÇ6RÀ¢7FGW3¢&÷Vâ"À¢Ó°¢6öç7BæW‡E–ÆöBÒ²ââæ6öçFW‡Bç–ÆöBÂvVV·3¢²ââæW†—7F–ærÂvVVµÒÓ°¢6öç7B6fVBÒv—BvÆö&ÅF†—2å4ÅEô4ÄõTBç6fU6–4&÷fÅ6æ6†÷B†æW‡E–ÆöBÂ6öçFW‡Bç&Wf—6–öâ“°¢–b‚6fVB’°¢6†÷tf÷&ÔW'&÷"‚$÷WG&òW7\:&–òÇFW&÷Rò6ÆVæL:&–òâfV6†RW7FRf÷&×VÌ:&–òÂ'&æ÷fÖVçFRR6öæf—&ÖRæ÷f6VÖæâ"Âf÷&Ò“°¢&WGW&âçVÆÃ°¢Ð¢6öçFW‡Bç–ÆöBÒæW‡E–ÆöC°¢6öçFW‡Bç&Wf—6–öâÒ6fVBç&Wf—6–öã°¢&WGW&âvVV³°§Ð ¦gVæ7F–öâ&÷fÄ6&Df÷%VWVR†f÷&Ò’°¢6öç7B6VÆV7FVBÒ7G&–ær†æWrf÷&ÔFF†f÷&Ò’ævWB‚&&÷fÄ6&D–B"’ÇÂ""“°¢–b‚6VÆV7FVBÇÂ6VÆV7FVBÓÓÒ%õöæWuõò"’&WGW&âçVÆÃ°¢&WGW&â6–4F—&V7F÷%VWVT6öçFW‡Còç–ÆöCòæö'&3òæf–æB‚†6&B’Óâ7G&–ær†6&Bæ–B’ÓÓÒ6VÆV7FVB’ÇÂçVÆÃ°§Ð ¦gVæ7F–öâ&÷fÄ6&E6V&6„FWF–Ç2†6&B’°¢6öç7B–FVçF–f–W'2Ò°¢âââ„'&’æ—4'&’†6&Còæö”Æ—7B’ò6&Bæö”Æ—7B¢µÒ’À¢âââ„'&’æ—4'&’†6&Còæö”Æ–6W2’ò6&Bæö”Æ–6W2¢µÒ’À¢6&Còæö•&rÀ¢ÒæÖ‚‡fÇVR’Óâ7G&–ær‡fÇVRÇÂ""’çG&–Ò‚’’æf–ÇFW"„&ööÆVâ“°¢&WGW&â²ââææWr6WB†–FVçF–f–W'2•Ó°§Ð ¦gVæ7F–öâ&÷fÄ6&DÖF6†W56V&6‚†6&BÂVW'’’°¢6öç7Bæ÷&ÖÆ—¦VBÒæ÷&ÖÆ—¦U6V&6…FW‡B‡VW'’’çG&–Ò‚“°¢–b‚æ÷&ÖÆ—¦VB’&WGW&âG'VS°¢6öç7BFWF–Ç2Ò&÷fÄ6&E6V&6„FWF–Ç2†6&B“°¢6öç7B6V&6†&ÆRÒæ÷&ÖÆ—¦U6V&6…FW‡B†G¶6&CòæFW67&–6òÇÂ"'ÒG¶6&Còæ–BÇÂ"'ÒG¶6&Còç÷'FföÆ–õv÷&´–BÇÂ"'ÒG¶FWF–Ç2æ¦ö–â‚""—Ö“°¢6öç7BFW&×2Òæ÷&ÖÆ—¦VBç7Æ—B‚õÇ2²ò’æf–ÇFW"„&ööÆVâ“°¢6öç7B–æ—F–Ç2Òæ÷&ÖÆ—¦U6V&6…FW‡B†6&CòæFW67&–6òÇÂ""¢ç7Æ—B‚õµæ×£Ó•Ò²ò¢æf–ÇFW"„&ööÆVâ¢æÖ‚‡v÷&B’Óâv÷&E³Ò¢æ¦ö–â‚""“°¢&WGW&âFW&×2æWfW'’‚‡FW&Ò’Óâ6V&6†&ÆRæ–æ6ÇVFW2‡FW&Ò’’ÇÂ–æ—F–Ç2æ–æ6ÇVFW2†æ÷&ÖÆ—¦VBç&WÆ6R‚õÇ2²örÂ""’“°§Ð ¦gVæ7F–öâ6Æ÷6T&÷fÄ6&E6V&6‚†f÷&Ò’°¢6öç7B6V&6‚Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2Ö6&B×6V&6…Ò"“°¢6öç7B&W7VÇG2Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2Ö6&B×&W7VÇG5Ò"“°¢–b‡6V&6‚’6V&6‚ç6WDGG&–'WFR‚&&–ÖW‡æFVB"Â&fÇ6R"“°¢–b‡&W7VÇG2’&W7VÇG2æ†–FFVâÒG'VS°§Ð ¦gVæ7F–öâ&VæFW$&÷fÄ6&E6V&6…&W7VÇG2†f÷&Ò’°¢6öç7B6V&6‚Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2Ö6&B×6V&6…Ò"“°¢6öç7B&W7VÇG2Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2Ö6&B×&W7VÇG5Ò"“°¢6öç7B†VÇW"Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2Ö6&B×6V&6‚Ö†VÇÒ"“°¢–b‚6V&6‚ÇÂ&W7VÇG2ÇÂ6–4F—&V7F÷%VWVT6öçFW‡B’&WGW&ã°¢6öç7BVW'’Ò6V&6‚çfÇVRçG&–Ò‚“°¢6öç7Bf–Æ&ÆRÒ6–4F—&V7F÷%VWVT6öçFW‡BæVÆ–v–&ÆT6&G2ÇÂµÓ°¢6öç7BÖF6†W2Òf–Æ&ÆRæf–ÇFW"‚†6&B’Óâ&÷fÄ6&DÖF6†W56V&6‚†6&BÂVW'’’“°¢6öç7Bf—6–&ÆRÒÖF6†W2ç6Æ–6RƒÂ#“°¢6öç7B&W7VÇD‡FÖÂÒf—6–&ÆRæÖ‚†6&B’Óâ°¢6öç7BFWF–Ç2Ò&÷fÄ6&E6V&6„FWF–Ç2†6&B“°¢&WGW&âÆ'WGFöâ6Æ73Ò'6–2Ö6&B×6V&6‚Ö÷F–öâ"G—SÒ&'WGFöâ"&öÆSÒ&÷F–öâ"FFÖ7F–öãÒ'6VÆV7B×6–2Ö&÷fÂÖ6&B"FFÖ6&BÖ–CÒ"G¶W66TGG&–'WFR†6&Bæ–B—Ò#ãÇ7G&öæsâG¶W66TGG&–'WFR†6&BæFW67&–6òÇÂ6&Bæ–B—ÓÂ÷7G&öæsãÇ6ÖÆÃâG¶FWF–Ç2æÆVæwF‚òô’ö<;6F–vó¢G¶W66TGG&–'WFR†FWF–Ç2æ¦ö–â‚"+r"’—Ö¢$6&BW†—7FVçFRæ&÷f:|:6òFR4”72'ÓÂ÷6ÖÆÃãÂö'WGFöãæ°¢Ò’æ¦ö–â‚""“°¢&W7VÇG2æ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò'6–2Ö6&B×6V&6‚×7VÖÖ'’#âG·VW'’òG¶ÖF6†W2æÆVæwF‡Ò6&BG¶ÖF6†W2æÆVæwF‚ÓÓÒò""¢'2'ÒVæ6öçG&FòG¶ÖF6†W2æÆVæwF‚ÓÓÒò""¢'2'Ö¢G¶f–Æ&ÆRæÆVæwF‡Ò6&G2F—7öì:×fV—2+rF–v—FR&f–ÇG&&ÓÂöF—cà¢G·&W7VÇD‡FÖÂÇÂÆF—b6Æ73Ò'6–2Ö6&B×6V&6‚ÖV×G’#äæVæ‡VÒ6&BW†—7FVçFR6÷'&W7öæFR:'W66ãÂöF—cæÐ¢Æ'WGFöâ6Æ73Ò'6–2Ö6&B×6V&6‚Ö÷F–öâ6–2Ö6&B×6V&6‚Ö7&VFR"G—SÒ&'WGFöâ"&öÆSÒ&÷F–öâ"FFÖ7F–öãÒ'6VÆV7B×6–2Ö&÷fÂÖ6&B"FFÖ6&BÖ–CÒ%õöæWuõò#ãÇ7G&öæsä7&–"æ÷fò6&B&W7Fö'&Â÷7G&öæsãÇ6ÖÆÃåW6R6öÖVçFRFWö—2FR6öæf—&Ö"VRæVæ‡VÒ6&BW†—7FVçFR6÷'&W7öæFR:ö'&ãÂ÷6ÖÆÃãÂö'WGFöãà¢“°¢&W7VÇG2æ†–FFVâÒfÇ6S°¢6V&6‚ç6WDGG&–'WFR‚&&–ÖW‡æFVB"Â'G'VR"“°¢–b††VÇW"’†VÇW"çFW‡D6öçFVçBÒVW'¢òG¶ÖF6†W2æÆVæwF‡Ò6÷'&W7öæL:¦æ6–G¶ÖF6†W2æÆVæwF‚ÓÓÒò""¢'2'ÒâW7V—6RVÆòæöÖRÂì;¦ÖW&òFòUbÂ<;6F–vò÷Rô’æ ¢¢%W7V—6RVÆòæöÖRFö'&Âì;¦ÖW&òFòUbÂ<;6F–vò÷Rô’â#°§Ð ¦gVæ7F–öâ6VÆV7D&÷fÄ6&Dg&öÕ6V&6‚†f÷&ÒÂ6&D–B’°¢6öç7B6VÆV7BÒf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ&&÷fÄ6&D–B%Òr“°¢6öç7B6V&6‚Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2Ö6&B×6V&6…Ò"“°¢6öç7B†VÇW"Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2Ö6&B×6V&6‚Ö†VÇÒ"“°¢–b‚6VÆV7BÇÂ6V&6‚’&WGW&ã°¢6VÆV7BçfÇVRÒ6&D–C°¢6öç7B6&BÒ6&D–BÓÓÒ%õöæWuõò ¢òçVÆÀ¢¢‡6–4F—&V7F÷%VWVT6öçFW‡CòæVÆ–v–&ÆT6&G2ÇÂµÒ’æf–æB‚†—FVÒ’Óâ7G&–ær†—FVÒæ–B’ÓÓÒ7G&–ær†6&D–B’“°¢6V&6‚çfÇVRÒ6&Bò7G&–ær†6&BæFW67&–6òÇÂ6&Bæ–B’¢$7&–"æ÷fò6&B&W7Fö'&#°¢6V&6‚æFF6WBç6VÆV7FVD6&D–BÒ6&D–C°¢–b††VÇW"’†VÇW"çFW‡D6öçFVçBÒ6&@¢ò6&B6VÆV6–öæFó¢G¶6&BæFW67&–6òÇÂ6&Bæ–GÒæ ¢¢$æ÷fò6&B6VÆV6–öæFòâ6öæf—&ÖRçFW26R&VÆÖVçFRì:6òW†—7FRVÒ6&B&W7Fö'&â#°¢6Æ÷6T&÷fÄ6&E6V&6‚†f÷&Ò“°¢&Vg&W6…6–4F—&V7F÷%VWVTf÷&Ò†f÷&Ò“°§Ð ¦gVæ7F–öâVWVTf–ææ6–ÅfÇVR‡fÇVR’°¢6öç7B&rÒ7G&–ær‡fÇVRóò""’çG&–Ò‚“°¢&WGW&â&rò'6T7W'&Væ7’‡&r’¢çVÆÃ°§Ð ¦gVæ7F–öâ&Vg&W6…6–4F—&V7F÷%VWVTf÷&Ò†f÷&Ò’°¢–b‚f÷&ÒÇÂ6–4F—&V7F÷%VWVT6öçFW‡B’&WGW&ã°¢&Vg&W6„&÷fÅvVV´7&VF÷"†f÷&Ò“°¢6öç7BFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7BvVV´–BÒ7G&–ær†FFævWB‚&&÷fÅvVV´–B"’ÇÂ""“°¢6öç7B6&BÒ&÷fÄ6&Df÷%VWVR†f÷&Ò“°¢6öç7B—4æWt6&BÒ7G&–ær†FFævWB‚&&÷fÄ6&D–B"’ÇÂ""’ÓÓÒ%õöæWuõò#°¢6öç7B6æ6†÷BÒ6&BbbvVV´–Bò&÷fÅ6æ6†÷Df÷"‡6–4F—&V7F÷%VWVT6öçFW‡Bç–ÆöBÂ6&Bæ–BÂvVV´–B’¢çVÆÃ°¢6öç7Bv÷&²Ò6–4F—&V7F÷%VWVT6öçFW‡Bçv÷&³°¢6öç7B÷'FföÆ–õF÷FÂÒ÷'FföÆ–ôUev—F†÷WE&—6²‡v÷&²“°¢6öç7B÷'FföÆ–ôFF—F—fW2Ò÷'FföÆ–ô&÷fVDFF—F—fW2‡v÷&²“°¢6öç7B6&EF÷FÂÒçVÖ&W"†6&CòæWcòçF÷FÂóò÷'FföÆ–õF÷FÂ’ÇÂ°¢6öç7BF–ffW&Væ6RÒÖF‚ç&÷VæB‚‡÷'FföÆ–õF÷FÂÒ6&EF÷FÂ’¢’ò°¢6öç7B&–÷$–çfö–6W2ÒçVÖ&W"†6&Còç6òæfGW&4æ÷4çFW&–÷&W2“°¢6öç7B6Æ76–f–6F–öâÒ7G&–ær‡v÷&³òæ6Æ76–f–66ôö'&ÇÂ6&Còæ6Æ76–f–66òÇÂ""’çG&–Ò‚“°¢6öç7B&VÒçVÖ&W"†6&CòæWcòæ&VÓ"óòv÷&³òæ&VWV—fÆVçFRóòv÷&³òæ&V6öç7G'V–Fóòv÷&³òæ&V’ÇÂ°¢6öç7BG–æÖ–2Òf÷&ÒçVW'•6VÆV7F÷"‚%¶FF×6–2ÖF—&V7F÷"ÖG–æÖ–5Ò"“°¢–b‚G–æÖ–2’&WGW&ã°¢G–æÖ–2æ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢G¶6&BbbÖF‚æ'2†F–ffW&Væ6R’ãÒãò ¢ÆF—b6Æ73Ò'v&æ–ærÖ&ææW""&öÆSÒ&ÆW'B#à¢Ç7G&öæsäUbF—fW&vVçFRFò÷'Fl;6Æ–óÂ÷7G&öæsà¢Ç7ãä6&C¢G¶ÖöæW’†6&EF÷FÂ—Ò+r÷'Fl;6Æ–ò6VÒ&—66ó¢G¶ÖöæW’‡÷'FföÆ–õF÷FÂ—Ò+rF–fW&Vì:v¢G¶ÖöæW’†F–ffW&Væ6R—ÒâòUb6÷'&WFòFò6&B6W,:&W6W'fFòRòÆW'Ff–6,:F—fòãÂ÷7ãà¢ÂöF—cà¢¢"'Ð¢ÆF—b6Æ73Ò&·’Öw&–B6ö×7BÖw&–B6–2ÖF—&V7F÷"Ö·’Öw&–B#à¢Æ'F–6ÆR6Æ73Ò&·’Ö6&B#ãÇ7ãäUb2òF—F—f÷3Â÷7ããÇ7G&öæsâG¶ÖöæW’†6&CòæWcòç6VÔF—F—f÷2óò‡÷'FföÆ–õF÷FÂÒ÷'FföÆ–ôFF—F—fW2’—ÓÂ÷7G&öæsãÂö'F–6ÆSà¢Æ'F–6ÆR6Æ73Ò&·’Ö6&B#ãÇ7ãäF—F—f÷2&÷fF÷3Â÷7ããÇ7G&öæsâG¶ÖöæW’†6&CòæWcòæF—F—f÷4&÷fF÷2óò÷'FföÆ–ôFF—F—fW2—ÓÂ÷7G&öæsãÂö'F–6ÆSà¢Æ'F–6ÆR6Æ73Ò&·’Ö6&B#ãÇ7ãäUbGVÂ6VÒ&—66óÂ÷7ããÇ7G&öæsâG¶ÖöæW’†6&EF÷FÂ—ÓÂ÷7G&öæsãÂö'F–6ÆSà¢Æ'F–6ÆR6Æ73Ò&·’Ö6&B#ãÇ7ãå"BöÜ+#Â÷7ããÇ7G&öæsâG¶&VòÖöæW’†6&EF÷FÂò&V’¢$ì:6òF—7öì:×fVÂ'ÓÂ÷7G&öæsãÂö'F–6ÆSà¢ÂöF—cà¢G¶—4æWt6&Bò ¢ÆF—b6Æ73Ò&f÷&ÒÖw&–BGvòÖ6öÇVÖç2#à¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãäô’‡2’Fö'&£Â÷7ããÆ–çWBæÖSÒ&&÷fÄö—2"&WV—&VBÆ6V†öÆFW#Ò$W‚ã¢SSs##²SSƒ3b#ãÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãä6Æ76–f–6:|:6ò£Â÷7ããÆ–çWBæÖSÒ&&÷fÄ6Æ76–f–6F–öâ"&WV—&VBfÇVSÒ"G¶W66TGG&–'WFR†6Æ76–f–6F–öâ—Ò"Æ6V†öÆFW#Ò$6Æ76–f–6:|:6òFö'&#ãÂöÆ&VÃà¢ÂöF—cà¢¢"'Ð¢G·6æ6†÷Bò ¢ÆF—b6Æ73Ò&–æfòÖ&÷‚#à¢Ç7G&öæsåfÆ÷&W26VÖæ—2¬:&VVæ6†–F÷3Â÷7G&öæsà¢Ç7ãäG&–'\:ÖFó¢G¶ÖöæW’‡6æ6†÷Bç6òæG&–'V–FôGVÂ—Ò+r6ö×&öÖ—76Fó¢G¶ÖöæW’‡6æ6†÷Bç6òæ6ö×&öÖWF–FôGVÂ—Ò+r6ÆFó¢G¶ÖöæW’‡6æ6†÷Bç6òç6ÆFôGVÂ—ÒãÂ÷7ãà¢Ç6ÖÆÃä6öÖòW7Fö'&¬:÷77V’4”2æW7F6VÖæÂW76W2fÆ÷&W26W,:6ò&WWF–Æ—¦F÷2WFöÖF–6ÖVçFRãÂ÷6ÖÆÃà¢ÂöF—cà¢¢ ¢ÆF—b6Æ73Ò&f÷&ÒÖw&–BG´çVÖ&W"æ—4f–æ—FR‡&–÷$–çfö–6W2’ò'GvòÖ6öÇVÖç2"¢'F‡&VRÖ6öÇVÖç2'Ò#à¢G´çVÖ&W"æ—4f–æ—FR‡&–÷$–çfö–6W2’ò""¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãäfGW&2VÒæ÷2çFW&–÷&W2£Â÷7ããÆ–çWBæÖSÒ&&÷fÅ&–÷$–çfö–6W2"–çWFÖöFSÒ&FV6–ÖÂ"&WV—&VBÆ6V†öÆFW#Ò%"BÃ#ãÂöÆ&VÃæÐ¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãäG&–'\:ÖFòGVÂ£Â÷7ããÆ–çWBæÖSÒ&&÷fÄ76–væVB"–çWFÖöFSÒ&FV6–ÖÂ"&WV—&VBÆ6V†öÆFW#Ò%"BÃ#ãÂöÆ&VÃà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãä6ö×&öÖ—76FòGVÂ£Â÷7ããÆ–çWBæÖSÒ&&÷fÄ6öÖÖ—GFVB"–çWFÖöFSÒ&FV6–ÖÂ"&WV—&VBÆ6V†öÆFW#Ò%"BÃ#ãÂöÆ&VÃà¢ÂöF—cà¢G´çVÖ&W"æ—4f–æ—FR‡&–÷$–çfö–6W2’òÇ6ÖÆÂ6Æ73Ò&×WFVB#äfGW&2VÒæ÷2çFW&–÷&W2&WWF–Æ—¦F2Fò6&C¢G¶ÖöæW’‡&–÷$–çfö–6W2—ÒãÂ÷6ÖÆÃæ¢"'Ð¢Ð¢“°§Ð ¦7–æ2gVæ7F–öâ÷Vå6–4F—&V7F÷%VWVTÖöFÂ†–BÂ²&÷fTgFW%VWVRÒfÇ6RÒÒ·Ò’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢6öç7Bv÷&²Òv÷&´'”–B†FVÖæCòæö'&–B“°¢–b‚FVÖæBÇÂv÷&²’°¢6†÷uFö7B‚$4”2&V6—6W7F"f–æ7VÆFVÖö'&l:Æ–FFò÷'Fl;6Æ–òâ"“°¢&WGW&ã°¢Ð¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷#ãÆF—b6Æ73Ò&ÖöFÂÖ6&B6–2ÖF—&V7F÷"×VWVRÖÖöFÂ#ãÆ†VFW#ãÆF—cãÇ7â6Æ73Ò&W–V'&÷r#âG¶W66TGG&–'WFR†FVÖæBæ–B—ÓÂ÷7ããÆƒ#å&W&æFò&÷f:|:6òFF—&WF÷&–Âöƒ#ãÇ6Æ73Ò&×WFVB#ä6'&VvæFò6VÖæ2RFF÷26ö×'F–Æ†F÷>(
cÂ÷ãÂöF—cãÂö†VFW#ãÂöF—cãÂöF—cà¢“°¢G'’°¢6öç7B&÷rÒv—B7–æ6‡&öæ—¦T&÷fÄ6ÆVæF"†v—BvÆö&ÅF†—2å4ÅEô4ÄõTBç6–4&÷fÅ6æ6†÷B‚’“°¢6öç7B–ÆöBÒ&÷sòç–ÆöC°¢6öç7BvVV·2Ò6VÆV7F&ÆT&÷fÅvVV·2‡–ÆöCòçvVV·2ÂFöF”•4ò‚’“°¢6öç7BÖF6‚ÒÖF6„&÷fÄ6&B‡–ÆöCòæö'&2Âv÷&²“°¢6öç7BVÆ–v–&ÆT6&G2Ò‡–ÆöBæö'&2ÇÂµÒ¢æf–ÇFW"‚†6&B’Óâ6&Bç÷'FföÆ–õv÷&´–BÇÂ7G&–ær†6&Bç÷'FföÆ–õv÷&´–B’ÓÓÒ7G&–ær‡v÷&²æ–B’¢ç6÷'B‚†Â"’Óâ7G&–ær†æFW67&–6òÇÂ""’æÆö6ÆT6ö×&R…7G&–ær†"æFW67&–6òÇÂ""’Â'BÔ%""’“°¢6–4F—&V7F÷%VWVT6öçFW‡BÒ²FVÖæD–C¢–BÂv÷&²Â–ÆöBÂ&Wf—6–öã¢&÷rç&Wf—6–öâÂVÆ–v–&ÆT6&G2Â&÷fTgFW%VWVRÓ°¢6öç7B–æfòÒFVÖæE6–4–æfò†FVÖæB’ÇÂ·Ó°¢6öç7BfÆ–FFVDÖ÷VçBÒ6–5v÷&·5fÆ–FFVDÖ÷VçB†FVÖæB“°¢6öç7BÆ–æ¶VD6&BÒÖF6‚æ6&C°¢6öç7B6&D÷F–öç2ÒVÆ–v–&ÆT6&G0¢æÖ‚†6&B’ÓâÆ÷F–öâfÇVSÒ"G¶W66TGG&–'WFR†6&Bæ–B—Ò#âG¶W66TGG&–'WFR†6&BæFW67&–6òÇÂ6&Bæ–B—ÓÂö÷F–öãæ¢æ¦ö–â‚""“°¢6öç7B6&E6VÆV7F÷"ÒÆ–æ¶VD6&@¢òÆ–çWBG—SÒ&†–FFVâ"æÖSÒ&&÷fÄ6&D–B"fÇVSÒ"G¶W66TGG&–'WFR†Æ–æ¶VD6&Bæ–B—Ò#ãÆF—b6Æ73Ò&–æfòÖ&÷‚#ãÇ7G&öæsä6&B–FVçF–f–6FòWFöÖF–6ÖVçFSÂ÷7G&öæsãÇ7ãâG¶W66TGG&–'WFR†Æ–æ¶VD6&BæFW67&–6ò—ÓÂ÷7ããÂöF—cæ ¢¢ÆF—b6Æ73Ò&f–VÆB6–2Ö6&B×6V&6‚Öf–VÆB#ãÇ7ãä6&BFö'&£Â÷7ããÆF—b6Æ73Ò'6–2Ö6&BÖ6öÖ&ö&÷‚"FF×6–2Ö6&BÖ6öÖ&ö&÷ƒãÆ–çWBG—SÒ'6V&6‚"FF×6–2Ö6&B×6V&6‚&öÆSÒ&6öÖ&ö&÷‚"&–ÖWFö6ö×ÆWFSÒ&Æ—7B"&–ÖW‡æFVCÒ&fÇ6R"&–Ö6öçG&öÇ3Ò'6–4&÷fÄ6&E6V&6…&W7VÇG2"WFö6ö×ÆWFSÒ&öfb"Æ6V†öÆFW#Ò$F–v—FRòæöÖRFö'&Âì;¦ÖW&òÂ<;6F–vò÷Rô’#ãÇ6VÆV7BæÖSÒ&&÷fÄ6&D–B"†–FFVããÆ÷F–öâfÇVSÒ"#äæVæ‡VÒ6&B6VÆV6–öæFóÂö÷F–öããÆ÷F–öâfÇVSÒ%õöæWuõò#ä7&–"æ÷fò6&B&W7Fö'&Âö÷F–öãâG¶6&D÷F–öç7ÓÂ÷6VÆV7CãÆF—b6Æ73Ò'6–2Ö6&B×6V&6‚×&W7VÇG2"–CÒ'6–4&÷fÄ6&E6V&6…&W7VÇG2"FF×6–2Ö6&B×&W7VÇG2&öÆSÒ&Æ—7F&÷‚"†–FFVããÂöF—cãÂöF—cãÇ6ÖÆÂFF×6–2Ö6&B×6V&6‚Ö†VÇâG¶ÖF6‚æÖ&–wV÷W2ò$Œ:Ö—2FRVÒ6&B6ö×L:×fVÂâW7V—6RR6öæf—&ÖRòl:Öæ7VÆò6÷'&WFòâ"¢%W7V—6R&6öæf—&Ö"VÒ6&BW†—7FVçFR÷R7&–"VÒæ÷fòâ'ÓÂ÷6ÖÆÃãÂöF—cæ°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&B6–2ÖF—&V7F÷"×VWVRÖÖöFÂ"–CÒ'6–4F—&V7F÷%VWVTf÷&Ò"FFÖ–CÒ"G¶W66TGG&–'WFR†–B—Ò"&–ÖÆ&VÆÆVF'“Ò'6–4F—&V7F÷%VWVUF—FÆR#à¢Æ†VFW#à¢ÆF—cãÇ7â6Æ73Ò&W–V'&÷r#âG¶W66TGG&–'WFR†FVÖæBæ–B—Ò+rG¶W66TGG&–'WFR†–æfòæÆV6öÔçVÖ&W"ÇÂ%4”2"—ÓÂ÷7ããÆƒ"–CÒ'6–4F—&V7F÷%VWVUF—FÆR#âG¶&÷fTgFW%VWVRò$&÷f"F—&WFÖVçFRVÆF—&WF÷&–"¢$Vçf–"&&÷f:|:6òFF—&WF÷&–'ÓÂöƒ#ãÇ6Æ73Ò&×WFVB#âG¶W66TGG&–'WFR‡v÷&²ææöÖR—ÒâG¶&÷fTgFW%VWVRò$WFFR#¢&Vv—7G&RWFçFW2FR6öæf—&Ö"òfÆ÷"&÷fFòâ"¢$6VÖæFWfR6W"W66öÆ†–FÖçVÆÖVçFRâ'ÓÂ÷ãÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#ãÇ7ãå6VÖæFR&W6VçF:|:6ò£Â÷7ããÇ6VÆV7BæÖSÒ&&÷fÅvVV´–B"&WV—&VCãÆ÷F–öâfÇVSÒ"#å6VÆV6–öæR6VÖæÂö÷F–öãâG·vVV·2æÖ‚‡vVV²’ÓâÆ÷F–öâfÇVSÒ"G¶W66TGG&–'WFR‡vVV²æ–B—Ò#âG¶W66TGG&–'WFR†&÷fÅvVV´÷F–öäÆ&VÂ‡vVV²’—ÓÂö÷F–öãæ’æ¦ö–â‚""—ÓÆ÷F–öâfÇVSÒ%õöæWuõò"G·vVV·2æÆVæwF‚ò""¢'6VÆV7FVB'Óâ²7&–"æ÷f6VÖæFR&W6VçF:|:6óÂö÷F–öããÂ÷6VÆV7CãÇ6ÖÆÃäò6ÆVæL:&–òVæ6W'&6VÖæ276F2RF—fWFöÖF–6ÖVçFR2&÷f—<;7&–2VæFòFF–æ–6–Â6†VvãÂ÷6ÖÆÃãÂöÆ&VÃà¢ÆF—bFF×6–2×vVV²Ö7&VF÷#ãÂöF—cà¢G¶6&E6VÆV7F÷'Ð¢ÆÆ&VÂ6Æ73Ò&f–VÆB6–2×VWVR×fÇVRÖf–VÆB#ãÇ7ãåfÆ÷"fÆ–FFò÷"ö'&2£Â÷7ããÆ–çWBæÖSÒ&&÷fÅ6–5fÇVR"–çWFÖöFSÒ&FV6–ÖÂ"&WV—&VBWFö6ö×ÆWFSÒ&öfb"fÇVSÒ"G·fÆ–FFVDÖ÷VçBÓÓÒçVÆÂò""¢W66TGG&–'WFR†7W'&Væ7”–çWEfÇVR‡fÆ–FFVDÖ÷VçB’—Ò"Æ6V†öÆFW#Ò%"BÃ"G·fÆ–FFVDÖ÷VçBÓÓÒçVÆÂò""¢'&VFöæÇ’'ÓãÇ6ÖÆÃâG·fÆ–FFVDÖ÷VçBÓÓÒçVÆÂò$W7F4”2¬:W7FfVÒfÆ–FFòö'&2çFW2FWFöÖ:|:6òâ–æf÷&ÖRòfÆ÷"VÖ;¦æ–6fW£²&VG\:|;VW2FRW66÷òöFVÒFW"6–æÂæVvF—fòâ"¢&VVæ6†–FòWFöÖF–6ÖVçFRæfÆ–F:|:6òFRö'&2F4”2G¶W66TGG&–'WFR†–æfòæÆV6öÔçVÖ&W"ÇÂFVÖæBæ–B—ÒæÓÂ÷6ÖÆÃãÂöÆ&VÃà¢ÆF—bFF×6–2ÖF—&V7F÷"ÖG–æÖ–3ãÂöF—cà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#ãÆ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ä6æ6VÆ#Âö'WGFöããÆ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#âG¶&÷fTgFW%VWVRò%&Vv—7G&"WFR6öçF–çV""¢$6öæf—&Ö"RÖ÷fW"'ÓÂö'WGFöããÂöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°¢&Vg&W6…6–4F—&V7F÷%VWVTf÷&Ò†ÖöFÅ&ö÷BçVW'•6VÆV7F÷"‚"76–4F—&V7F÷%VWVTf÷&Ò"’“°¢Ò6F6‚†W'&÷"’°¢6–4F—&V7F÷%VWVT6öçFW‡BÒçVÆÃ°¢6Æ÷6TÖöFÂ‚“°¢6†÷uFö7B†W'&÷#òæÖW76vRÇÂ$ì:6òfö’÷7<:×fVÂ6'&Vv"26VÖæ2FR&÷f:|:6òFR4”72â"“°¢Ð§Ð ¦7–æ2gVæ7F–öâ†æFÆU6–4F—&V7F÷%VWVU7V&Ö—B†f÷&Ò’°¢6öç7B6öçFW‡BÒ6–4F—&V7F÷%VWVT6öçFW‡C°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒf÷&ÒæFF6WBæ–B“°¢–b‚6öçFW‡BÇÂFVÖæBÇÂ6öçFW‡BæFVÖæD–BÓÒFVÖæBæ–B’&WGW&ã°¢6öç7BFFÒæWrf÷&ÔFF†f÷&Ò“°¢6öç7BvVV´–BÒ7G&–ær†FFævWB‚&&÷fÅvVV´–B"’ÇÂ""“°¢ÆWBvVV²Ò6VÆV7F&ÆT&÷fÅvVV·2†6öçFW‡Bç–ÆöBçvVV·2ÂFöF”•4ò‚’’æf–æB‚†—FVÒ’Óâ7G&–ær†—FVÒæ–B’ÓÓÒvVV´–B“°¢6öç7B6&D–EfÇVRÒ7G&–ær†FFævWB‚&&÷fÄ6&D–B"’ÇÂ""“°¢6öç7B6&BÒ&÷fÄ6&Df÷%VWVR†f÷&Ò“°¢–b‚6&D–EfÇVR’°¢6†÷tf÷&ÔW'&÷"‚$6öæf—&ÖRò6&BFö'&â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢–b‡vVV´–BÓÓÒ%õöæWuõò"’°¢vVV²Òv—B7&VFT&÷fÅvVV´g&öÔf÷&Ò†f÷&ÒÂ6öçFW‡BÂFF“°¢–b‚vVV²’&WGW&ã°¢Ð¢–b‚vVV²’°¢6†÷tf÷&ÔW'&÷"‚$W66öÆ†VÖ6VÖæF—f÷R7&–RVÖæ÷f6VÖæFR&W6VçF:|:6òâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7B6–5fÇVU&rÒ7G&–ær†FFævWB‚&&÷fÅ6–5fÇVR"’ÇÂ""’çG&–Ò‚“°¢–b‚6–5fÇVU&r’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRòfÆ÷"FW7F4”2â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BvVV¶Ç’Ò6&Bò&÷fÅ6æ6†÷Df÷"†6öçFW‡Bç–ÆöBÂ6&Bæ–BÂvVV²æ–B’¢çVÆÃ°¢6öç7B&–÷$–çfö–6W2ÒvVV¶Ç¢òçVÖ&W"‡vVV¶Ç’ç6òæfGW&4æ÷4çFW&–÷&W2ÇÂ¢¢çVÖ&W"æ—4f–æ—FR„çVÖ&W"†6&Còç6òæfGW&4æ÷4çFW&–÷&W2’¢òçVÖ&W"†6&Bç6æfGW&4æ÷4çFW&–÷&W2¢¢VWVTf–ææ6–ÅfÇVR†FFævWB‚&&÷fÅ&–÷$–çfö–6W2"’“°¢6öç7B76–væVBÒvVV¶Ç’òçVÖ&W"‡vVV¶Ç’ç6òæG&–'V–FôGVÂÇÂ’¢VWVTf–ææ6–ÅfÇVR†FFævWB‚&&÷fÄ76–væVB"’“°¢6öç7B6öÖÖ—GFVBÒvVV¶Ç’òçVÖ&W"‡vVV¶Ç’ç6òæ6ö×&öÖWF–FôGVÂÇÂ’¢VWVTf–ææ6–ÅfÇVR†FFævWB‚&&÷fÄ6öÖÖ—GFVB"’“°¢–b…·&–÷$–çfö–6W2Â76–væVBÂ6öÖÖ—GFVEÒç6öÖR‚‡fÇVR’ÓâfÇVRÓÓÒçVÆÂÇÂçVÖ&W"æ—4f–æ—FR‡fÇVR’’’°¢6†÷tf÷&ÔW'&÷"‚%&VVæ6†fGW&2VÒæ÷2çFW&–÷&W2ÂG&–'\:ÖFòGVÂR6ö×&öÖ—76FòGVÂâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7Bö”Æ—7BÒ6&@¢ò†6&Bæö”Æ—7BÇÂµÒ¢¢7G&–ær†FFævWB‚&&÷fÄö—2"’ÇÂ""’ç7Æ—B‚õ³²ÅÆåÒ²ò’æÖ‚‡fÇVR’ÓâfÇVRçG&–Ò‚’’æf–ÇFW"„&ööÆVâ“°¢–b‚6&Bbbö”Æ—7BæÆVæwF‚’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖRVÆòÖVæ÷2VÖô’&7&–"òæ÷fò6&Bâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7B6Æ76–f–6F–öâÒ6&Còæ6Æ76–f–66òÇÂ7G&–ær†FFævWB‚&&÷fÄ6Æ76–f–6F–öâ"’ÇÂ""’çG&–Ò‚“°¢–b‚6Æ76–f–6F–öâ’°¢6†÷tf÷&ÔW'&÷"‚$–æf÷&ÖR6Æ76–f–6:|:6òFö'&â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BWFFVBÒv—BWFFTFVÖæD6öÇVÖâ†FVÖæBæ–BÂ&&÷f6ôF—&WF÷&–"Â°¢F—&V7F÷$&÷fÄFF¢°¢fW'6–öã¢À¢vVV´–C¢vVV²æ–BÀ¢&÷fÄ6&D–C¢6&Còæ–BÇÂ""À¢6–5fÇVS¢'6T7W'&Væ7’‡6–5fÇVU&r’À¢&–÷$–çfö–6W2À¢76–væVDÖ÷VçC¢76–væVBÀ¢6öÖÖ—GFVDÖ÷VçC¢6öÖÖ—GFVBÀ¢ö”Æ—7C¢²ââææWr6WB†ö”Æ—7B•ÒÀ¢6Æ76–f–6F–öâÀ¢VWVVDC¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢ÒÀ¢Ò“°¢–b‚WFFVB’&WGW&ã°¢6öç7B&÷fTgFW%VWVRÒ6öçFW‡Bæ&÷fTgFW%VWVRÓÓÒG'VS°¢6–4F—&V7F÷%VWVT6öçFW‡BÒçVÆÃ°¢&VæFW"‚“°¢–b†&÷fTgFW%VWVR’°¢÷Vå6–4F—&V7F÷$FV6—6–öäÖöFÂ†FVÖæBæ–BÂ²F—&V7DfÆ÷s¢G'VRÒ“°¢&WGW&ã°¢Ð¢6Æ÷6TÖöFÂ‚“°¢6†÷uFö7B†4”2–æ6Ç\:ÖFVÒG·vVV²æÆ&VÇÒRÖ÷f–F&wV&FæFò&÷f:|:6òF—&WF÷&–æ“°§Ð ¦gVæ7F–öâ÷VäFVÖæE7FGW5&V6öäÖöFÂ†–BÂæW‡D6öÇVÖä–B’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢6öç7B6öÇVÖâÒ6öÇVÖä'”–B†æW‡D6öÇVÖä–B“°¢–b‚FVÖæBÇÂ6öÇVÖâÇÂ²'W6Fò"Â&6æ6VÆFò%Òæ–æ6ÇVFW2†æW‡D6öÇVÖä–B’’&WGW&ã°¢6öç7B—46æ6VÂÒæW‡D6öÇVÖä–BÓÓÒ&6æ6VÆFò#°¢ÖöFÅ&ö÷Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ† ¢ÆF—b6Æ73Ò&ÖöFÂÖ&6¶G&÷#à¢Æf÷&Ò6Æ73Ò&ÖöFÂÖ6&B·’ÖÖöFÂÖ6&B"–CÒ&FVÖæE7FGW5&V6öäf÷&Ò"FFÖ–CÒ"G¶W66TGG&–'WFR†–B—Ò"FFÖ6öÇVÖãÒ"G¶W66TGG&–'WFR†æW‡D6öÇVÖä–B—Ò"&–ÖÆ&VÆÆVF'“Ò&FVÖæE7FGW5&V6öåF—FÆR#à¢Æ†VFW#à¢ÆF—cà¢Ç7â6Æ73Ò&W–V'&÷r#âG¶W66TGG&–'WFR†FVÖæBæ–B—Ò+rG¶W66TGG&–'WFR†6öÇVÖâæÆ&VÂ—ÓÂ÷7ãà¢Æƒ"–CÒ&FVÖæE7FGW5&V6öåF—FÆR#âG¶—46æ6VÂò$–æf÷&ÖRòÖ÷F—fòFò6æ6VÆÖVçFò"¢$–æf÷&ÖRòÖ÷F—fòFW6'ÓÂöƒ#à¢Ç6Æ73Ò&×WFVB#äÖ÷f–ÖVçF:|:6ò<;26W,:6öæ6Ç\:ÖFFWö—2VRòÖ÷F—fòf÷"&Vv—7G&FòãÂ÷à¢ÂöF—cà¢Æ'WGFöâ6Æ73Ò&–6öâÖ'WGFöâ"G—SÒ&'WGFöâ"&–ÖÆ&VÃÒ$fV6†""FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#ì9sÂö'WGFöãà¢Âö†VFW#à¢ÆF—b6Æ73Ò&ÖöFÂÖ&öG’#à¢ÆF—b6Æ73Ò&W'&÷"Ö&÷‚"–CÒ&f÷&ÔW'&÷"#ãÂöF—cà¢ÆÆ&VÂ6Æ73Ò&f–VÆB#à¢Ç7ãâG¶—46æ6VÂò$Ö÷F—fòFò6æ6VÆÖVçFò¢"¢$Ö÷F—fòFW6¢'ÓÂ÷7ãà¢ÇFW‡F&VæÖSÒ&Ö÷fVÖVçE&V6öâ"&÷w3Ò#R"Ö–æÆVæwFƒÒ#R"&WV—&VBWFöfö7W2Æ6V†öÆFW#Ò$W‡Æ—VRòÖ÷F—fòâââ#ãÂ÷FW‡F&Và¢Ç6ÖÆÂ6Æ73Ò&×WFVB#äòFW‡Fòf–6,:f–æ7VÆFò:FVÖæFR&Vv—7G&Fòæò†—7L;7&–6òãÂ÷6ÖÆÃà¢ÂöÆ&VÃà¢ÂöF—cà¢Æfö÷FW"6Æ73Ò&ÖöFÂÖ7F–öç2#à¢Æ'WGFöâ6Æ73Ò&v†÷7BÖ'WGFöâ"G—SÒ&'WGFöâ"FFÖ7F–öãÒ&6Æ÷6RÖÖöFÂ#åföÇF#Âö'WGFöãà¢Æ'WGFöâ6Æ73Ò'&–Ö'’Ö7F–öâ"G—SÒ'7V&Ö—B#âG¶—46æ6VÂò$6öæf—&Ö"6æ6VÆÖVçFò"¢$6öæf—&Ö"W6'ÓÂö'WGFöãà¢Âöfö÷FW#à¢Âöf÷&Óà¢ÂöF—cà¢“°¢6WEF–ÖV÷WB‚‚’ÓâÖöFÅ&ö÷BçVW'•6VÆV7F÷"‚u¶æÖSÒ&Ö÷fVÖVçE&V6öâ%Òr“òæfö7W2‚’Â“°§Ð ¦7–æ2gVæ7F–öâ†æFÆTFVÖæE7FGW5&V6öå7V&Ö—B†f÷&Ò’°¢6öç7B&V6öâÒ7G&–ær†æWrf÷&ÔFF†f÷&Ò’ævWB‚&Ö÷fVÖVçE&V6öâ"’ÇÂ""’çG&–Ò‚“°¢6öç7BæW‡D6öÇVÖä–BÒf÷&ÒæFF6WBæ6öÇVÖâÇÂ"#°¢–b‡&V6öâæÆVæwF‚ÂR’°¢6†÷tf÷&ÔW'&÷"†æW‡D6öÇVÖä–BÓÓÒ&6æ6VÆFò ¢ò$W‡Æ—VRòÖ÷F—fòFò6æ6VÆÖVçFòâ ¢¢$W‡Æ—VRòÖ÷F—fòFW6â"Âf÷&Ò“°¢&WGW&ã°¢Ð¢6öç7BWFFVBÒv—BWFFTFVÖæD6öÇVÖâ†f÷&ÒæFF6WBæ–BÂæW‡D6öÇVÖä–BÂ²Ö÷fVÖVçE&V6öã¢&V6öâÒ“°¢–b‚WFFVB’&WGW&ã°¢6Æ÷6TÖöFÂ‚“°¢&VæFW"‚“°¢6†÷uFö7B†6&BÖ÷f–Fò&G¶FVÖæE7FGW4Æ&VÂ‡WFFVB—Ò6öÒÖ÷F—fò&Vv—7G&Fòæ“°§Ð ¦7–æ2gVæ7F–öâWFFTFVÖæD6öÇVÖâ†–BÂæW‡D6öÇVÖä–BÂ°¢W'6—7BÒG'VRÀ¢6¶—6ö×ÆWF–öävFRÒfÇ6RÀ¢F—&V7E6–46ö×ÆWF–öâÒfÇ6RÀ¢Ö÷fVÖVçE&V6öâÒ""À¢v÷&·5fÆ–FF–öäFFÒçVÆÂÀ¢F—&V7F÷$&÷fÄFFÒçVÆÂÀ¢F—&V7F÷$FV6—6–öäFFÒçVÆÂÀ§ÒÒ·Ò’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢ÆWBæW‡D6öÇVÖâÒ6öÇVÖä'”–B†æW‡D6öÇVÖä–B“°¢–b‚FVÖæBÇÂæW‡D6öÇVÖâ’&WGW&âfÇ6S°¢–b†FVÖæBæ6öÇVæÓÓÒæW‡D6öÇVÖä–B’&WGW&âFVÖæC°¢6öç7B—56–4FVÖæBÒFVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2#°¢–b…²&&÷f6ôF—&WF÷&–"Â&&÷fFôF—&WF÷&–%Òæ–æ6ÇVFW2†æW‡D6öÇVÖä–B’bb—56–4FVÖæB’°¢6†÷uFö7B‚%6öÖVçFRFVÖæF2FòF—ò4”2öFVÒW6"2WF2FF—&WF÷&–â"“°¢&WGW&âfÇ6S°¢Ð¢–b†—56–4FVÖæBbbæW‡D6öÇVÖä–BÓÓÒ'fÆ–FFôö'&2"bbFVÖæBæ6öÇVæÓÓÒ'fÆ–F6ôö'&2"bbv÷&·5fÆ–FF–öäFF’°¢÷Vå6–5v÷&·5fÆ–FF–öäÖöFÂ†FVÖæBæ–B“°¢&WGW&âfÇ6S°¢Ð¢–b†—56–4FVÖæBbbæW‡D6öÇVÖä–BÓÓÒ&&÷f6ôF—&WF÷&–"bbFVÖæBæ6öÇVæÓÒ&&÷f6ôF—&WF÷&–"’°¢–b†FVÖæBæ6öÇVæÓÒ'fÆ–FFôö'&2"’°¢6†÷uFö7B‚$WFwV&FæFò&÷f:|:6òF—&WF÷&–<;2öFR6W"6W76F'F—"FRfÆ–FFòö'&2â"“°¢&WGW&âfÇ6S°¢Ð¢–b‚6äGfæ6U6–5FôF—&V7F÷$&÷fÂ‚’’°¢6†÷uFö7B‚%6öÖVçFRW7\:&–÷2vW7F÷"÷RFÖ–âöFVÒÖ÷fW"VÖ4”2FRfÆ–FFòö'&2&wV&FæFò&÷f:|:6òF—&WF÷&–â"“°¢&WGW&âfÇ6S°¢Ð¢–b‚F—&V7F÷$&÷fÄFF’°¢v—B÷Vå6–4F—&V7F÷%VWVTÖöFÂ†FVÖæBæ–B“°¢&WGW&âfÇ6S°¢Ð¢Ð¢–b†—56–4FVÖæBbbæW‡D6öÇVÖä–BÓÓÒ&&÷fFôF—&WF÷&–"bbFVÖæBæ6öÇVæÓÒ&&÷fFôF—&WF÷&–"’°¢–b†FVÖæBæ6öÇVæÓÓÒ'fÆ–FFôö'&2"bbF—&V7F÷$FV6—6–öäFF’°¢–b‚6äF—&V7FÇ”&÷fU6–4g&öÕfÆ–FFVB‚’’°¢6†÷uFö7B‚%6öÖVçFRW7\:&–÷2vW7F÷"÷RFÖ–â6öÒW&Ö—7<:6òFRW67&—FVÒö'&2öFVÒÖ÷fW"VÖ4”2F—&WFÖVçFRFRfÆ–FFòö'&2&&÷fFòF—&WF÷&–â"“°¢&WGW&âfÇ6S°¢Ð¢÷Vå6–4F—&V7F÷$FV6—6–öäÖöFÂ†FVÖæBæ–B“°¢&WGW&âfÇ6S°¢Ð¢–b†FVÖæBæ6öÇVæÓÓÒ'fÆ–FFôö'&2"bb6äF—&V7FÇ”&÷fU6–4g&öÕfÆ–FFVB‚’’°¢6†÷uFö7B‚%6öÖVçFRW7\:&–÷2vW7F÷"÷RFÖ–â6öÒW&Ö—7<:6òFRW67&—FVÒö'&2öFVÒÖ÷fW"VÖ4”2F—&WFÖVçFRFRfÆ–FFòö'&2&&÷fFòF—&WF÷&–â"“°¢&WGW&âfÇ6S°¢Ð¢–b†FVÖæBæ6öÇVæÓÒ&&÷f6ôF—&WF÷&–"bbFVÖæBæ6öÇVæÓÒ'fÆ–FFôö'&2"’°¢6†÷uFö7B‚$WF&÷fFòF—&WF÷&–<;2öFR6W"6W76F'F—"FRfÆ–FFòö'&2÷RwV&FæFò&÷f:|:6òF—&WF÷&–â"“°¢&WGW&âfÇ6S°¢Ð¢–b‚F—&V7F÷$FV6—6–öäFF’°¢÷Vå6–4F—&V7F÷$FV6—6–öäÖöFÂ†FVÖæBæ–B“°¢&WGW&âfÇ6S°¢Ð¢Ð¢–b†—56–4FVÖæBbbæW‡D6öÇVÖä–BÓÓÒ&6öæ6ÇV–Fò"bbFVÖæBæ6öÇVæÓÒ&&÷fFôF—&WF÷&–"’°¢6öç7BÆVv7•v—fW"ÒFVÖæBæ6öÇVæÓÓÒ&&÷f6ôF—&WF÷&–"bbçVÖ&W"‡6–4F—&V7F÷%v—fW$FF†FVÖæB“òçfW'6–öâ’ÓÓÒ°¢6öç7B6öæf—&ÖVDF—&V7D6ö×ÆWF–öâÒFVÖæBæ6öÇVæÓÓÒ'fÆ–FFôö'&2"bbF—&V7E6–46ö×ÆWF–öâbb6–4F—&V7D6ö×ÆWF–öäFF†FVÖæB“°¢–b†FVÖæBæ6öÇVæÓÓÒ'fÆ–FFôö'&2"bb6öæf—&ÖVDF—&V7D6ö×ÆWF–öâ’°¢÷Vå6–4F—&V7F÷%&WV—&VÖVçDÖöFÂ†FVÖæBæ–B“°¢&WGW&âfÇ6S°¢Ð¢–b‚6öæf—&ÖVDF—&V7D6ö×ÆWF–öâbb‚ÆVv7•v—fW"ÇÂ6åv—fU6–4F—&V7F÷$&÷fÂ‚’’’°¢6†÷uFö7B€¢FVÖæBæ6öÇVæÓÓÒ&&÷f6ôF—&WF÷&– ¢ò$W7F4”2&V6—66W"&÷fFVÆF—&WF÷&–÷RFW"VÖF—7Vç6&Vv—7G&F÷"vW7F÷"ôFÖ–âçFW2FR—"&6öæ6Ç\:ÖFòâ ¢¢$6öæ6ÇW<:6òF—&WF<;2:’W&Ö—F–F'F—"FRfÆ–FFòö'&2Â;726öæf—&Ö"VRF—&WF÷&–ì:6ò:’æV6W7<:&–â ¢“°¢&WGW&âfÇ6S°¢Ð¢Ð¢–b†æW‡D6öÇVÖä–BÓÓÒ'fÆ–FFôö'&2"bbFVÖæBæ6öÇVæÓÓÒ'fÆ–F6ôö'&2"bbFVÖæBæFFfÆ–F6ôö'&2’°¢FVÖæBæFFfÆ–F6ôö'&2ÒFöF”•4ò‚“°¢Ð¢6öç7Bæ÷&ÖÆ—¦VDÖ÷fVÖVçE&V6öâÒ7G&–ær†Ö÷fVÖVçE&V6öâÇÂ""’çG&–Ò‚“°¢–b…²'W6Fò"Â&6æ6VÆFò%Òæ–æ6ÇVFW2†æW‡D6öÇVÖä–B’bbæ÷&ÖÆ—¦VDÖ÷fVÖVçE&V6öâæÆVæwF‚ÂR’°¢÷VäFVÖæE7FGW5&V6öäÖöFÂ†FVÖæBæ–BÂæW‡D6öÇVÖä–B“°¢&WGW&âfÇ6S°¢Ð¢–b†æW‡D6öÇVÖä–BÓÓÒ&6öæ6ÇV–Fò"bb6¶—6ö×ÆWF–öävFR’°¢÷VäFVÖæD6ö×ÆWF–öäÖöFÂ†FVÖæBæ–B“°¢&WGW&âfÇ6S°¢Ð¢–b†æW‡D6öÇVÖä–BÓÓÒ&6öæ6ÇV–Fò"bb6¶—6ö×ÆWF–öävFRbbFFTöæÇ’†FVÖæBæFFVçG&Vv&VÂ’’°¢6†÷uFö7B‚$–æf÷&ÖRFFVçG&Vv&VÂçFW2FR6öæ6ÇV—"FVÖæFâ"“°¢&WGW&âfÇ6S°¢Ð ¢6öç7BFVÖæD–æFW‚Ò7FFRæFVÖæG2æf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒFVÖæBæ–B“°¢6öç7BFVÖæE6æ6†÷BÒ6ÆöæR†FVÖæB“°¢6öç7B†—7F÷'•6æ6†÷BÒ6ÆöæR‡7FFRæ†—7F÷'’ÇÂµÒ“°¢6öç7B&Wf–÷W57FvUF–ÖRÒFVÖæE7FvUF–ÖT–æfò†FVÖæB“°¢6öç7BG&ç6—F–öæVDBÒæWrFFR‚’çFô•4õ7G&–ær‚“°¢6öç7B7W'&VçD–æFW‚Ò6öÇVÖç2æf–æD–æFW‚‚†6öÇVÖâ’Óâ6öÇVÖâæ–BÓÓÒFVÖæBæ6öÇVæ“°¢6öç7B&Wf–÷W2Ò6öÇVÖç5¶7W'&VçD–æFW…ÓòæÆ&VÂÇÂFVÖæBæ6öÇVæÇÂ%6VÒ7FGW2#°¢–b‡v÷&·5fÆ–FF–öäFF’°¢6öç7B&Wf–÷W4Ö÷VçBÒ6–5v÷&·5fÆ–FFVDÖ÷VçB†FVÖæB“°¢6öç7B&Wf–÷W56W'f–6TW†V7WFVBÒ6–5v÷&·56W'f–6TW†V7WFVB†FVÖæB“°¢FVÖæBç6–5v÷&·5fÆ–FF–öâÒ6ÆöæR‡v÷&·5fÆ–FF–öäFF“°¢FVÖæBçfÆ÷$vW&FòÒçVÖ&W"‡v÷&·5fÆ–FF–öäFFæÖ÷VçB’ÇÂ°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢'fÆ÷"fÆ–FFò÷"ö'&2"À¢fÆ÷$çFW&–÷#¢&Wf–÷W4Ö÷VçBÓÓÒçVÆÂò$ì:6ò–æf÷&ÖFò"¢ÖöæW’‡&Wf–÷W4Ö÷VçB’À¢fÆ÷$æ÷fó¢ÖöæW’†FVÖæBçfÆ÷$vW&Fò’À¢Ò“°¢–b‡&Wf–÷W56W'f–6TW†V7WFVBÓÒv÷&·5fÆ–FF–öäFFç6W'f–6TW†V7WFVB’°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&W†V7\:|:6òFò6W'fœ:vòF4”2"À¢fÆ÷$çFW&–÷#¢&Wf–÷W56W'f–6TW†V7WFVBÓÓÒçVÆÂò$ì:6ò–æf÷&ÖF"¢&Wf–÷W56W'f–6TW†V7WFVBò$W†V7WFFò"¢$ì:6òW†V7WFFò"À¢fÆ÷$æ÷fó¢v÷&·5fÆ–FF–öäFFç6W'f–6TW†V7WFVBò$W†V7WFFò"¢$ì:6òW†V7WFFò"À¢Ò“°¢Ð¢Ð¢–b†F—&V7F÷$&÷fÄFF’FVÖæBç6–4F—&V7F÷$&÷fÂÒ6ÆöæR†F—&V7F÷$&÷fÄFF“°¢–b†F—&V7F÷$FV6—6–öäFF’°¢6öç7B&W6VçFVDÖ÷VçBÒ6–4F—&V7F÷%&VfW&Væ6TÖ÷VçB†FVÖæB“°¢6öç7Bf–æÄÖ÷VçBÒçVÖ&W"†F—&V7F÷$FV6—6–öäFFæf–æÄÖ÷VçB’ÇÂ°¢FVÖæBç6–4F—&V7F÷$FV6—6–öâÒ6ÆöæR†F—&V7F÷$FV6—6–öäFF“°¢FVÖæBçfÆ÷$vW&FòÒf–æÄÖ÷VçC°¢–b†FVÖæBç6–4F—&V7F÷$&÷fÂ’FVÖæBç6–4F—&V7F÷$&÷fÂç6–5fÇVRÒf–æÄÖ÷VçC°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢'fÆ÷"&÷fFòVÆF—&WF÷&–"À¢fÆ÷$çFW&–÷#¢&W6VçFVDÖ÷VçBÓÓÒçVÆÂò$ì:6ò–æf÷&ÖFò"¢ÖöæW’‡&W6VçFVDÖ÷VçB’À¢fÆ÷$æ÷fó¢G¶ÖöæW’†f–æÄÖ÷VçB—ÒG¶F—&V7F÷$FV6—6–öäFFç&Wf—6VBò"‡&Wf—6Fò’"¢"†ÖçF–Fò’'ÖÀ¢Ò“°¢Ð¢FVÖæBç†6T†—7F÷'’Ò°¢ââæ'&”÷$fÆÆ&6²†FVÖæBç†6T†—7F÷'’’À¢°¢7FvT–C¢FVÖæBæ6öÇVæÀ¢7FvTÆ&VÃ¢&Wf–÷W2À¢7F'FVDC¢&Wf–÷W57FvUF–ÖRç7F'FVDBçFô•4õ7G&–ær‚’À¢VæFVDC¢&Wf–÷W57FvUF–ÖRæ6Æ÷6VBò&Wf–÷W57FvUF–ÖRæVæFVDBçFô•4õ7G&–ær‚’¢G&ç6—F–öæVDBÀ¢W7F–ÖFVC¢&Wf–÷W57FvUF–ÖRæW7F–ÖFVBÀ¢ÒÀ¢Ó°¢FVÖæBæ6öÇVæÒæW‡D6öÇVÖä–C°¢–b†æW‡D6öÇVÖä–BÓÓÒ'W6Fò"’FVÖæBæÖ÷F—fõW6Òæ÷&ÖÆ—¦VDÖ÷fVÖVçE&V6öã°¢–b†æW‡D6öÇVÖä–BÓÓÒ&6æ6VÆFò"’FVÖæBæÖ÷F—fô6æ6VÆÖVçFòÒæ÷&ÖÆ—¦VDÖ÷fVÖVçE&V6öã°¢FVÖæBç†6U7F'FVDBÒG&ç6—F–öæVDC°¢FVÖæBç†6TVæFVDBÒ²&6öæ6ÇV–Fò"Â&6æ6VÆFò%Òæ–æ6ÇVFW2†æW‡D6öÇVÖä–B’òG&ç6—F–öæVDB¢"#°¢FVÖæBç†6U7F'FVDDW7F–ÖFVBÒfÇ6S°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&6öÇVæ"À¢fÆ÷$çFW&–÷#¢&Wf–÷W2À¢fÆ÷$æ÷fó¢æW‡D6öÇVÖâæÆ&VÂÀ¢Ò“°¢–b…²'W6Fò"Â&6æ6VÆFò%Òæ–æ6ÇVFW2†æW‡D6öÇVÖä–B’’°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢æW‡D6öÇVÖä–BÓÓÒ&6æ6VÆFò"ò&Ö÷F—fô6æ6VÆÖVçFò"¢&Ö÷F—fõW6"À¢fÆ÷$çFW&–÷#¢$ì:6ò–æf÷&ÖFò"À¢fÆ÷$æ÷fó¢æ÷&ÖÆ—¦VDÖ÷fVÖVçE&V6öâÀ¢Ò“°¢Ð¢6öç7BÆV&æVEv÷&²ÒæW‡D6öÇVÖä–BÓÓÒ&6öæ6ÇV–Fò"òv÷&´'”–B†FVÖæBæö'&–B’¢çVÆÃ°¢6öç7BÆV&æVEv÷&µ6æ6†÷BÒÆV&æVEv÷&²ò6ÆöæR†ÆV&æVEv÷&²’¢çVÆÃ°¢–b†æW‡D6öÇVÖä–BÓÓÒ&6öæ6ÇV–Fò"’ÆV&åv÷&´ÆVDg&öÔ6ö×ÆWF–öâ†FVÖæB“°¢–b‡W'6—7B’°¢G'’°¢v—B6fU7FFTæEv—B‚“°¢Ò6F6‚†W'&÷"’°¢–b†FVÖæD–æFW‚ãÒ’7FFRæFVÖæG5¶FVÖæD–æFW…ÒÒFVÖæE6æ6†÷C°¢–b†ÆV&æVEv÷&²bbÆV&æVEv÷&µ6æ6†÷B’ö&¦V7Bæ76–vâ†ÆV&æVEv÷&²ÂÆV&æVEv÷&µ6æ6†÷B“°¢7FFRæ†—7F÷'’Ò†—7F÷'•6æ6†÷C°¢6†÷uFö7B†W'&÷#òæÖW76vRÇÂ$Ö÷f–ÖVçF:|:6òFò6&Bì:6òfö’6öæf—&ÖFæò&æ6òâ&V6'&VwVR÷2FF÷2â"“°¢&VæFW"‚“°¢&WGW&âfÇ6S°¢Ð¢Ð¢&WGW&âFVÖæC°§Ð ¦7–æ2gVæ7F–öâÖ÷fTFVÖæB†–BÂF—&V7F–öâ’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ–B“°¢–b‚FVÖæB’&WGW&âfÇ6S°¢6öç7BÆÆ÷vVD6öÇVÖç2Ò6öÇVÖç4f÷$FVÖæB†FVÖæB“°¢6öç7B7W'&VçD–æFW‚ÒÆÆ÷vVD6öÇVÖç2æf–æD–æFW‚‚†6öÇVÖâ’Óâ6öÇVÖâæ–BÓÓÒFVÖæBæ6öÇVæ“°¢6öç7BæW‡D–æFW‚ÒÖF‚æÖ‚ƒÂÖF‚æÖ–â†ÆÆ÷vVD6öÇVÖç2æÆVæwF‚ÒÂ7W'&VçD–æFW‚²F—&V7F–öâ’“°¢6öç7BWFFVBÒv—BWFFTFVÖæD6öÇVÖâ†–BÂÆÆ÷vVD6öÇVÖç5¶æW‡D–æFW…Òæ–B“°¢–b‡WFFVBÓÓÒfÇ6R’&WGW&âfÇ6S°¢&VæFW"‚“°¢&WGW&âWFFVC°§Ð ¦gVæ7F–öâ7&VFT'VFvWDFVÖæDg&öÕ&ö¦V7B‡&÷tçVÖ&W"Â÷F–öç2Ò·Ò’°¢6öç7B&V6÷&BÒ&ö¦V7EÆå&÷w2†fÇ6R’æf–æB‚‡&÷r’Óâ7G&–ær‡&÷rç&÷r’ÓÓÒ7G&–ær‡&÷tçVÖ&W"’“°¢–b‚&V6÷&BÇÂ&V6÷&Bæ—5&ö¦V7B’&WGW&âçVÆÃ° ¢6öç7BW†—7F–ærÒ&ö¦V7D'VFvWDFVÖæDf÷%&÷r‡&V6÷&B“°¢–b†W†—7F–ær’°¢–b†÷F–öç2ææf–vFR’°¢6VÆV7FVEv÷&´–BÒW†—7F–æræö'&–BÇÂ6VÆV7FVEv÷&´–C°¢&W6WD÷W&F–öæÄf–ÇFW'2‚“°¢÷W&F–öæÄf–ÇFW'2çVW'’ÒW†—7F–æræ–C°¢÷W&F–öæÅf–WtÖöFRÒ&¶æ&â#°¢6Æ÷6TÖöFÂ‚“°¢6WEf–Wr‚'v÷&·4÷W&F–öæÂ"“°¢6†÷uFö7B†G¶W†—7F–æræ–GÒ¬:W7Ff7&–FòVÒö'&2æ“°¢Ð¢&WGW&âW†—7F–æs°¢Ð ¢–b‚Vç7W&TFVÖæDÆ–fV7–6ÆTÆÆ÷vVB†÷F–öç2æf÷&ÒÇÂçVÆÂ’’&WGW&âçVÆÃ° ¢6öç7Bv÷&²Ò&V6÷&Bæö'&–Bòv÷&´'”–B‡&V6÷&Bæö'&–B’¢Æåv÷&´ÖF6‚‡&V6÷&B“°¢–b‚v÷&²’°¢6öç7BÖW76vRÒ$çFW2FRVçG&Vv"&5BÂ6F7G&R÷Rf–æ7VÆRW7FR&ö¦WFòò÷'Fl;6Æ–òFRö'&2â#°¢–b†÷F–öç2æf÷&Ò’6†÷tf÷&ÔW'&÷"†ÖW76vRÂ÷F–öç2æf÷&Ò“°¢VÇ6R6†÷uFö7B†ÖW76vR“°¢&WGW&âçVÆÃ°¢Ð¢–b‚—4FVÖæEv÷&´VÆ–v–&ÆR‡v÷&²’’°¢6öç7BÖW76vRÒ%&7&–"VÖFVÖæFVÒö'&2Âf–æ7VÆRVÖö'&FòæòFR##RVÒF–çFRâ#°¢–b†÷F–öç2æf÷&Ò’6†÷tf÷&ÔW'&÷"†ÖW76vRÂ÷F–öç2æf÷&Ò“°¢VÇ6R6†÷uFö7B†ÖW76vR“°¢&WGW&âçVÆÃ°¢Ð ¢6öç7B7&–çBÒ7W'&VçE7&–çB‚“°¢6öç7B7F'DFFRÒ&V6÷&Bæ–æ–6–ô÷&6ÖVçF6òÇÂFDF—4•4ò‡&V6÷&BçFW&Ö–æõÆæV¦FòÂ’ÇÂFöF”•4ò‚“°¢6öç7BFVÖæD7&VFVDBÒæWrFFR‚’çFô•4õ7G&–ær‚“°¢6öç7BFVÖæBÒ°¢–C¢æW‡DFVÖæD6öFR‚’À¢ö'&–C¢v÷&²æ–BÀ¢Væ–FFTÖöFó¢&æ÷f"À¢Væ–FFT–C¢""À¢Væ–FFT'W66¢""À¢Væ–FFTæöÖS¢v÷&²ææöÖRÇÂ""À¢Væ–FFUF—ó¢v÷&²çF—õVæ–FFRÇÂ""À¢Væ–FFT6ç£¢v÷&²æ6ç¢ÇÂ""À¢Væ–FFT×Væ–6—–ó¢·v÷&²æ6–FFRÂv÷&²çVeÒæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"ò"’À¢Væ–FFT6VçG&ó¢v÷&²æ6öF–vô÷&–v–æÂÇÂ""À¢Væ–FFU6÷W&6S¢$VçG&VvFR&ö¦WF÷23c"À¢F—ó¢$VÖ—76ô–æ–6–Â"À¢7&–çD–C¢7&–çCòæ–BÇÂ""À¢æÆ—7F&W7öç6fVÃ¢""À¢æÆ—7F46ö×ÆVÖVçF&W3¢µÒÀ¢&–÷&–FFS¢$Ü:–F–"À¢6öÇVæ¢æWuv÷&´FVÖæD6öÇVÖâ‚$VÖ—76ô–æ–6–Â"’À¢FF&Wf—7F–æ–6–ó¢7F'DFFRÀ¢FF–æ–6–õ&VÃ¢""À¢FF&WdVçf–õfÆ–F6ôö'&3¢FDF—4•4ò‡7F'DFFRÂ’À¢FFVçf–õ&VÅfÆ–F6ôö'&3¢""À¢FFfÆ–F6ôö'&3¢""À¢FF&Wf—7FVçG&Vv¢FDF—4•4ò‡7F'DFFRÂB’À¢FFVçG&Vv&VÃ¢""À¢æôVçf–%fÆ–F6ôö'&3¢fÇ6RÀ¢ö'6W'f6ó¢÷,:vÖVçF:|:6ò–æ–6–Â7&–F;72VçG&VvFR&ö¦WF÷2&5C¢G·&V6÷&Bæö'&ÒæÀ¢æ÷F¢""À¢6–4ÖWFFF¢çVÆÂÀ¢6–4G&gDF—66—Æ–æW3¢µÒÀ¢6–5÷7FVDC¢""À¢æW†÷3¢µÒÀ¢6–4–G3¢µÒÀ¢÷&–vVÔÖöGVÆó¢%&ö¦WF÷23c"À¢&ö¦V7EÆå&÷s¢&ö¦V7E7FGW4÷fW'&–FT¶W’‡&V6÷&B’À¢÷&–vVÕ&ö¦WFõ&÷s¢&ö¦V7E7FGW4÷fW'&–FT¶W’‡&V6÷&B’À¢†6U7F'FVDC¢FVÖæD7&VFVDBÀ¢†6TVæFVDC¢""À¢†6U7F'FVDDW7F–ÖFVC¢fÇ6RÀ¢7&VFVDC¢FVÖæD7&VFVDBÀ¢WFFVDC¢FVÖæD7&VFVDBÀ¢Ó° ¢7FFRæFVÖæG2çVç6†–gB†FVÖæB“°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&7&–:|:6ò"À¢fÆ÷$çFW&–÷#¢%&ö¦WFòVçG&VwVR&5B"À¢fÆ÷$æ÷fó¢6&B7&–FòVÒö'&2âVÆÂÆææ–ær&G·v÷&²ææöÖWÖÀ¢Ò“° ¢–b†÷F–öç2ææf–vFR’°¢6VÆV7FVEv÷&´–BÒv÷&²æ–C°¢&W6WD÷W&F–öæÄf–ÇFW'2‚“°¢÷W&F–öæÄf–ÇFW'2çVW'’ÒFVÖæBæ–C°¢÷W&F–öæÅf–WtÖöFRÒ&¶æ&â#°¢6Æ÷6TÖöFÂ‚“°¢6WEf–Wr‚'v÷&·4÷W&F–öæÂ"“°¢6†÷uFö7B†G¶FVÖæBæ–GÒ7&–FòVÒö'&2æWFVÆÂÆææ–æræ“°¢Ð¢&WGW&âFVÖæC°§Ð ¦7–æ2gVæ7F–öâWFFU&ö¦V7E7FGW2‡&÷tçVÖ&W"ÂæW‡E7FGW2Âf÷&ÒÒçVÆÂ’°¢6öç7B&V6÷&BÒ&ö¦V7D÷W&F–öæÅ&÷w2†fÇ6R’æf–æB‚‡&÷r’Óâ7G&–ær‡&÷rç&÷r’ÓÓÒ7G&–ær‡&÷tçVÖ&W"’“°¢6öç7BæW‡D6öÇVÖâÒ&ö¦V7D6öÇVÖç2æf–æB‚†6öÇVÖâ’Óâ6öÇVÖâæ–BÓÓÒæW‡E7FGW2“°¢–b‚&V6÷&B’&WGW&ã°¢–b‚æW‡D6öÇVÖâ’°¢6†÷tf÷&ÔW'&÷"‚%6VÆV6–öæRVÒ7FGW2l:Æ–Fò&GVÆ—¦"ò&ö¦WFòâ"Âf÷&Ò“°¢&WGW&ã°¢Ð ¢6öç7B&Wf–÷W57FGW2Ò&ö¦V7D6öÇVÖä'”–B‡&ö¦V7E7FGW4¶W’‡&V6÷&B’“° ¢–b‡&V6÷&Bæ7W7FöÕ&ö¦V7DFVÖæB’°¢6öç7BFVÖæBÒ‡7FFRç&ö¦V7DFVÖæG2ÇÂµÒ’æf–æB‚†—FVÒ’Óâ7G&–ær†—FVÒæ–B’ÓÓÒ7G&–ær‡&V6÷&Bæ7W7FöÔFVÖæD–B’“°¢–b‚FVÖæB’&WGW&ã°¢FVÖæBç7FGW2ÒæW‡D6öÇVÖâæ–C°¢FVÖæBçWFFVDBÒFöF”•4ò‚“°¢–b†æW‡D6öÇVÖâæ–BÓÓÒ'6ÆFV6æ–6"bbFVÖæBæFFVçG&Vv&VÂ’FVÖæBæFFVçG&Vv&VÂÒFöF”•4ò‚“°¢FD†—7F÷'’‡°¢VçF–FFS¢'&ö¦WFò"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢'7FGW2"À¢fÆ÷$çFW&–÷#¢&Wf–÷W57FGW2æÆ&VÂÀ¢fÆ÷$æ÷fó¢æW‡D6öÇVÖâæÆ&VÂÀ¢Ò“°¢–b‚v—B6fU7FFR‚’’&WGW&âfÇ6S°¢6Æ÷6TÖöFÂ‚“°¢&VæFW"‚“°¢6†÷uFö7B†FVÖæFFR&ö¦WF÷2Ö÷f–F&G¶æW‡D6öÇVÖâæÆ&VÇÒæ“°¢&WGW&ã°¢Ð ¢–b‚7FFRç&ö¦V7E7FGW4÷fW'&–FW2ÇÂG—Vöb7FFRç&ö¦V7E7FGW4÷fW'&–FW2ÓÒ&ö&¦V7B"’7FFRç&ö¦V7E7FGW4÷fW'&–FW2Ò·Ó°¢ÆWB'VFvWDFVÖæBÒ&ö¦V7D'VFvWDFVÖæDf÷%&÷r‡&V6÷&B“° ¢–b†æW‡D6öÇVÖâæ–BÓÓÒ'6ÆFV6æ–6"’°¢'VFvWDFVÖæBÒ7&VFT'VFvWDFVÖæDg&öÕ&ö¦V7B‡&V6÷&Bç&÷rÂ²f÷&ÒÂ6fS¢fÇ6RÒ“°¢–b‚'VFvWDFVÖæB’&WGW&ã°¢Ð ¢7FFRç&ö¦V7E7FGW4÷fW'&–FW5·&ö¦V7E7FGW4÷fW'&–FT¶W’‡&V6÷&B•ÒÒ°¢7FGW3¢æW‡D6öÇVÖâæ–BÀ¢WFFVDC¢FöF”•4ò‚’À¢WFFVD'“¢7W'&VçEW6W"‚“òææöÖRÇÂ$vW7L:6ò5B"À¢'VFvWDFVÖæD–C¢'VFvWDFVÖæCòæ–BÇÂ""À¢Ó° ¢FD†—7F÷'’‡°¢VçF–FFS¢'&ö¦WFò"À¢VçF–FFT–C¢&ö¦V7E7FGW4÷fW'&–FT¶W’‡&V6÷&B’À¢6×ó¢'7FGW2"À¢fÆ÷$çFW&–÷#¢&Wf–÷W57FGW2æÆ&VÂÀ¢fÆ÷$æ÷fó¢æW‡D6öÇVÖâæÆ&VÂÀ¢Ò“° ¢–b‚v—B6fU7FFR‚’’&WGW&âfÇ6S° ¢–b†æW‡D6öÇVÖâæ–BÓÓÒ'6ÆFV6æ–6"’°¢6VÆV7FVEv÷&´–BÒ'VFvWDFVÖæBæö'&–BÇÂ6VÆV7FVEv÷&´–C°¢&W6WD÷W&F–öæÄf–ÇFW'2‚“°¢÷W&F–öæÄf–ÇFW'2çVW'’Ò'VFvWDFVÖæBæ–C°¢÷W&F–öæÅf–WtÖöFRÒ&¶æ&â#°¢6Æ÷6TÖöFÂ‚“°¢6WEf–Wr‚'v÷&·4÷W&F–öæÂ"“°¢6†÷uFö7B†G¶'VFvWDFVÖæBæ–GÒ7&–Fò÷f–æ7VÆFòVÒö'&2æWFf¦W"æ“°¢&WGW&ã°¢Ð ¢6Æ÷6TÖöFÂ‚“°¢&VæFW"‚“°¢6†÷uFö7B†&ö¦WFòÖ÷f–Fò&G¶æW‡D6öÇVÖâæÆ&VÇÒæ“°§Ð ¦gVæ7F–öâ7F'D'VFvWDg&öÔ–çfW7FÖVçEÆâ‡&÷tçVÖ&W"’°¢6öç7B&V6÷&BÒ–çfW7FÖVçEÆå&÷w2†fÇ6R’æf–æB‚‡&÷r’Óâ7G&–ær‡&÷rç&÷r’ÓÓÒ7G&–ær‡&÷tçVÖ&W"’“°¢–b‚&V6÷&BÇÂ&V6÷&Bæ—5&ö¦V7B’&WGW&ã°¢6öç7Bv÷&²Ò&V6÷&Bæö'&–Bòv÷&´'”–B‡&V6÷&Bæö'&–B’¢Æåv÷&´ÖF6‚‡&V6÷&B“°¢–b‚v÷&²’°¢6†÷uFö7B‚$W7FÆ–æ†–æFì:6òW7L:f–æ7VÆFò÷'Fl;6Æ–òâ6F7G&R÷RVF—FRö'&çFW2FR7&–"÷,:vÖVçF:|:6òâ"“°¢&WGW&ã°¢Ð¢6öç7B7F'DFFRÒ&V6÷&Bæ–æ–6–ô÷&6ÖVçF6òÇÂFDF—4•4ò‡&V6÷&BçFW&Ö–æõÆæV¦FòÂ’ÇÂFöF”•4ò‚“°¢÷VäFVÖæEv—¦&DÖöFÂ‚$VÖ—76ô–æ–6–Â"ÂÂ°¢ö'&–C¢v÷&²æ–BÀ¢ö'&'W66¢v÷&²ææöÖRÀ¢FW67&–6ó¢÷,:vÖVçF:|:6ò–æ–6–Â;72VçG&VvFR&ö¦WF÷2æòÆæòFR–çfW7F–ÖVçFó¢G·&V6÷&Bæö'&ÒæÀ¢FF&Wf—7F–æ–6–ó¢7F'DFFRÀ¢FF&WdVçf–õfÆ–F6ôö'&3¢FDF—4•4ò‡7F'DFFRÂ’À¢FF&Wf—7FVçG&Vv¢FDF—4•4ò‡7F'DFFRÂB’À¢Ò“°§Ð ¦gVæ7F–öâ÷VåÆåv÷&´–å÷'FföÆ–ò‡v÷&´–B’°¢6öç7Bv÷&²Òv÷&´'”–B‡v÷&´–B“°¢–b‚v÷&²’&WGW&ã°¢–çfW7FÖVçEÆäf–ÇFW'2Ò²VW'“¢v÷&²ææöÖRÂWF¢""Â7FGW3¢""Â&Vv–ó¢""ÂFFTg&öÓ¢""ÂFFUFó¢""Ó°¢÷'FföÆ–õV–6´f–ÇFW'2Ò7&VFU÷'FföÆ–õV–6´f–ÇFW'2‚“°¢÷'FföÆ–õV–6´f–ÇFW'2çVW'’Òv÷&²ææöÖS°¢÷'FföÆ–ôf–ÇFW'2Òö&¦V7Bæg&öÔVçG&–W2„ö&¦V7Bæ¶W—2‡÷'FföÆ–ôf–ÇFW'2’æÖ‚†¶W’’Óâ¶¶W’Â"%Ò’“°¢6VÆV7FVEv÷&´–BÒv÷&²æ–C°¢6WEf–Wr‚'÷'FföÆ–ò"“°§Ð ¦gVæ7F–öâv÷&´G&gDg&öÕÆå&÷r‡&÷r’°¢&WGW&â°¢æöÖS¢&÷ræö'&ÇÂ""À¢6öF–vô÷&–v–æÃ¢&÷rç&Vv—7G&òÇÂ&÷rç&÷rÇÂ#"À¢F—õVæ–FFS¢&÷rçF—õVæ–FFRÇÂ""À¢6–FFS¢&÷rç&6ÇÂ""À¢Vc¢&÷rçVbÇÂ""À¢&Vv–ó¢&÷rç&Vv–òÇÂ""À¢6Æ76–f–66ôö'&¢6æöæ–6Åv÷&´6FVv÷'’‡&÷ræ6Æ76–f–66ôö'&’À¢F—öÆöv–ö'&¢6æöæ–6Åv÷&µG—öÆöw’‡&÷rçF—öÆöv–ö'&’À¢&¦ôF–3¢&÷rç6ÆF–2ÇÂ""À¢Ó°§Ð ¦gVæ7F–öâ÷Våv÷&´g&öÔ–çfW7FÖVçEÆâ‡&÷tçVÖ&W"’°¢6öç7B&V6÷&BÒ–çfW7FÖVçEÆå&÷w2†fÇ6R’æf–æB‚‡&÷r’Óâ7G&–ær‡&÷rç&÷r’ÓÓÒ7G&–ær‡&÷tçVÖ&W"’“°¢–b‚&V6÷&B’°¢6†÷uFö7B‚$ì:6òVæ6öçG&V’W7FÆ–æ†æòÆæòFR–çfW7F–ÖVçFò##bâ"“°¢&WGW&ã°¢Ð¢v÷&´ÖöFÅ&WGW&äÖöFRÒ"#°¢v÷&´ÖöFÅÆäG&gBÒv÷&´G&gDg&öÕÆå&÷r‡&V6÷&B“°¢÷Våv÷&´ÖöFÂ‚“°§Ð ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&¶W–F÷vâ"Â†WfVçB’Óâ°¢–b†WfVçBçF&vWBæÖF6†W3òâ‚%¶FF×6–2Ö6&B×6V&6…Ò"’’°¢6öç7Bf÷&ÒÒWfVçBçF&vWBæ6Æ÷6W7B‚"76–4F—&V7F÷%VWVTf÷&Ò"“°¢–b†WfVçBæ¶W’ÓÓÒ$'&÷tF÷vâ"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢&VæFW$&÷fÄ6&E6V&6…&W7VÇG2†f÷&Ò“°¢f÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2Ö6&B×&W7VÇG5Òç6–2Ö6&B×6V&6‚Ö÷F–öâ"“òæfö7W2‚“°¢&WGW&ã°¢Ð¢–b†WfVçBæ¶W’ÓÓÒ$W66R"’°¢6Æ÷6T&÷fÄ6&E6V&6‚†f÷&Ò“°¢&WGW&ã°¢Ð¢Ð¢6öç7B&÷rÒWfVçBçF&vWBæ6Æ÷6W7Còâ‚"ç÷'FföÆ–ò×v÷&²×&÷u¶FFÖ7F–öãÕÂ&÷Vâ×÷'FföÆ–ò×v÷&µÂ%Ò"“°¢–b‚&÷rÇÂWfVçBçF&vWBÓÒ&÷rÇÂ²$VçFW""Â"%Òæ–æ6ÇVFW2†WfVçBæ¶W’’’&WGW&ã°¢WfVçBç&WfVçDFVfVÇB‚“°¢÷Vå÷'FföÆ–õv÷&´VF—F÷"‡&÷ræFF6WBæ–B“°§Ò“° ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&6Æ–6²"Â7–æ2†WfVçB’Óâ°¢Fö7VÖVçBçVW'•6VÆV7F÷$ÆÂ‚&FWF–Ç2ç7&–çB×–6¶W%¶÷VåÒ"’æf÷$V6‚‚†FWF–Ç2’Óâ°¢–b‚FWF–Ç2æ6öçF–ç2†WfVçBçF&vWB’’FWF–Ç2ç&VÖ÷fTGG&–'WFR‚&÷Vâ"“°¢Ò“°¢Fö7VÖVçBçVW'•6VÆV7F÷$ÆÂ‚&FWF–Ç2æ÷W&F–öæÂÖ×VÇF—6VÆV7E¶÷VåÒ"’æf÷$V6‚‚†FWF–Ç2’Óâ°¢–b‚FWF–Ç2æ6öçF–ç2†WfVçBçF&vWB’’FWF–Ç2ç&VÖ÷fTGG&–'WFR‚&÷Vâ"“°¢Ò“°¢Fö7VÖVçBçVW'•6VÆV7F÷$ÆÂ‚%¶FF×6–2Ö6&BÖ6öÖ&ö&÷…Ò"’æf÷$V6‚‚†6öÖ&ö&÷‚’Óâ°¢–b‚6öÖ&ö&÷‚æ6öçF–ç2†WfVçBçF&vWB’’6Æ÷6T&÷fÄ6&E6V&6‚†6öÖ&ö&÷‚æ6Æ÷6W7B‚&f÷&Ò"’“°¢Ò“°¢–b„FFRææ÷r‚’ÂFVÖæDG&u7W&W746Æ–6µVçF–ÂbbWfVçBçF&vWBæ6Æ÷6W7B‚"æ÷W&F–öæÂÖ&ö&B×æVÂæFVÖæBÖ6&B"’’°¢WfVçBç&WfVçDFVfVÇB‚“°¢WfVçBç7F÷&÷vF–öâ‚“°¢&WGW&ã°¢Ð¢6öç7Bf–Wt'WGFöâÒWfVçBçF&vWBæ6Æ÷6W7B‚%¶FF×f–WuÒ"“°¢–b‡f–Wt'WGFöâ’°¢–b‡f–Wt'WGFöâæ6Æ÷6W7B‚"æÖöFÂÖ6&B"’’6Æ÷6TÖöFÂ‚“°¢–b‡f–Wt'WGFöâæFF6WBçf–WrÓÓÒ&Wb"bbf–Wt'WGFöâæ6Æ÷6W7B‚"æÖöFÂÖ6&B"’’6VÆV7FVEv÷&´–BÒ&ÆÂ#°¢v—B6WEf–Wr‡f–Wt'WGFöâæFF6WBçf–Wr“°¢&WGW&ã°¢Ð ¢6öç7B7F–öä'WGFöâÒWfVçBçF&vWBæ6Æ÷6W7B‚%¶FFÖ7F–öåÒ"“°¢–b‚7F–öä'WGFöâ’&WGW&ã° ¢6öç7B7F–öâÒ7F–öä'WGFöâæFF6WBæ7F–öã°¢–b‚6ä×WFFUT’†7F–öâ’’°¢6†÷uFö7B†æÇ—7DFVÖæDÆ–fV7–6ÆT&Æö6¶VB†7F–öâ’òFVÖæDÆ–fV7–6ÆTFVæ–VDÖW76vR‚’¢%6WR6W76òW&Ö—FRVæ26öç7VÇFâ"“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&F÷væÆöBÖGF6†ÖVçB"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—BF÷væÆöE7F÷&VDGF6†ÖVçB†7F–öä'WGFöâæFF6WBæGF6†ÖVçD–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'FövvÆRÖ†FV2"’°¢†FV4÷VâÒ†FV4÷Vã°¢&VæFW"‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&f–ÆÂÖÆöv–âÖVÖ–Â"’°¢6öç7Bf÷&ÒÒFö7VÖVçBçVW'•6VÆV7F÷"‚"6Æöv–äf÷&Ò"“°¢6öç7BVÖ–Ä–çWBÒf÷&ÓòæVÆVÖVçG3òæVÖ–Ã°¢6öç7B77v÷&D–çWBÒf÷&ÓòæVÆVÖVçG3òç6Væ†°¢–b†VÖ–Ä–çWB’VÖ–Ä–çWBçfÇVRÒ7F–öä'WGFöâæFF6WBæVÖ–ÂÇÂ"#°¢77v÷&D–çWCòæfö7W2‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&Æöv÷WB"’°¢Æöv÷WEW6W"‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&†FV2Ö6²"’°¢†æFÆT†FV5VW7F–öâ†7F–öä'WGFöâæFF6WBç&ö×BÇÂ$§VF"“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&†FV2×7V²"’°¢7V´†FV2‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&†FV2Öæb"’°¢6öç7Bf–WrÒ7F–öä'WGFöâæFF6WBçF&vWEf–WrÇÂ&F6†&ö&B#°¢†FV4÷VâÒG'VS°¢FD†FV4ÖW76vR‚&&÷B"Â6W'Fòâf÷RFRÆWf"&G¶7F–öä'WGFöâçFW‡D6öçFVçBçG&–Ò‚—Òæ“°¢6WEf–Wr‡f–Wr“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&fVGW&R×6ööâ"’°¢6†÷uFö7B‚$W7F:|:6òVçG&,:æ,;7†–ÖWFFò6F7G&òÖW7G&Râ"“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'6VÆV7B×6–2Ö&÷fÂÖ6&B"’°¢6VÆV7D&÷fÄ6&Dg&öÕ6V&6‚†7F–öä'WGFöâæ6Æ÷6W7B‚"76–4F—&V7F÷%VWVTf÷&Ò"’Â7F–öä'WGFöâæFF6WBæ6&D–BÇÂ""“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'7V&Ö—BÖFVÖæB×7FW"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢†æFÆTFVÖæEv—¦&E7FW†7F–öä'WGFöâæ6Æ÷6W7B‚&f÷&Ò"’“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'7V&Ö—BÖFVÖæBÖf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆTFVÖæE7V&Ö—B†7F–öä'WGFöâæ6Æ÷6W7B‚&f÷&Ò"’“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖF6†&ö&B×&W÷'B"’°¢F6†&ö&E&W÷'G4f–ÇFW"Ò7F–öä'WGFöâæFF6WBç&W÷'Df–ÇFW"ÇÂ&7F—fR#°¢6WEf–Wr‚'&W÷'G2"“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'6WBÖF6†&ö&B×&W÷'BÖf–ÇFW""’°¢F6†&ö&E&W÷'G4f–ÇFW"Ò7F–öä'WGFöâæFF6WBç&W÷'Df–ÇFW"ÇÂ&7F—fR#°¢&VæFW"‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖvÆö&ÂÖFVÖæB"’°¢÷VävÆö&ÄFVÖæDÖöFÂ‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖvÆö&ÂÖFVÖæB×G—R"’°¢÷VävÆö&ÄFVÖæD'”ÖöGVÆR†7F–öä'WGFöâæFF6WBæÖöGVÆUF&vWBÇÂ'v÷&·2"“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷Vâ×v÷&²"’°¢v÷&´ÖöFÅ&WGW&äÖöFRÒ"#°¢v÷&´ÖöFÅÆäG&gBÒçVÆÃ°¢÷Våv÷&´ÖöFÂ‚“°¢Ð¢–b†7F–öâÓÓÒ&÷Vâ×v÷&²Ög&öÒ×6–2"’°¢v÷&´ÖöFÅ&WGW&äÖöFRÒ'6–2#°¢v÷&´ÖöFÅÆäG&gBÒçVÆÃ°¢÷Våv÷&´ÖöFÂ‚“°¢Ð¢–b†7F–öâÓÓÒ&VF—B×v÷&²"’°¢v÷&´ÖöFÅ&WGW&äÖöFRÒ"#°¢v÷&´ÖöFÅÆäG&gBÒçVÆÃ°¢÷Våv÷&´ÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢Ð¢–b†7F–öâÓÓÒ'6÷'B×÷'FföÆ–ò"’°¢6öç7B¶W’Ò7F–öä'WGFöâæFF6WBç6÷'D¶W’ÇÂ'–V"#°¢6öç7BçVÖW&–4¶W—2ÒæWr6WB…²'–V""Â&&VWV—fÆVçFR"Â&6W‚"Â&7W7FôÓ""Â&6öF–vò%Ò“°¢–b‡÷'FföÆ–õ6÷'Bæ¶W’ÓÓÒ¶W’’°¢÷'FföÆ–õ6÷'BæF—&V7F–öâÒ÷'FföÆ–õ6÷'BæF—&V7F–öâÓÓÒ&62"ò&FW62"¢&62#°¢ÒVÇ6R°¢÷'FföÆ–õ6÷'BÒ²¶W’ÂF—&V7F–öã¢çVÖW&–4¶W—2æ†2†¶W’’ò&FW62"¢&62"Ó°¢Ð¢&VæFW"‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷Vâ×÷'FföÆ–ò×v÷&²"’°¢÷Vå÷'FföÆ–õv÷&´VF—F÷"†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖFVÆWFR×v÷&²"’°¢÷VäFVÆWFUv÷&´ÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&FVÆWFR×v÷&²×&V6÷&B"’°¢v—BFVÆWFUv÷&µ&V6÷&B†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷Vâ×v÷&²Ög&öÒ×Æâ"’÷Våv÷&´g&öÔ–çfW7FÖVçEÆâ†7F–öä'WGFöâæFF6WBç&÷r“°¢–b†7F–öâÓÓÒ&÷Vâ×&ö¦V7BÖFVÖæB"’°¢÷Vå&ö¦V7DFVÖæDÖöFÂ‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&7&VFRÖ'VFvWBÖg&öÒ×&ö¦V7B"’°¢v—BWFFU&ö¦V7E7FGW2†7F–öä'WGFöâæFF6WBç&÷rÂ'6ÆFV6æ–6"Â7F–öä'WGFöâæ6Æ÷6W7B‚%¶FF×&ö¦V7B×7FGW2Öf÷&ÕÒ"’“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'WFFR×&ö¦V7B×7FGW2"’°¢6öç7Bf÷&ÒÒ7F–öä'WGFöâæ6Æ÷6W7B‚%¶FF×&ö¦V7B×7FGW2Öf÷&ÕÒ"“°¢v—BWFFU&ö¦V7E7FGW2†7F–öä'WGFöâæFF6WBç&÷rÂf÷&ÓòæVÆVÖVçG3òç&ö¦V7E7FGW3òçfÇVRÂf÷&Ò“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'7F'BÖ'VFvWBÖg&öÒ×Æâ"’7F'D'VFvWDg&öÔ–çfW7FÖVçEÆâ†7F–öä'WGFöâæFF6WBç&÷r“°¢–b†7F–öâÓÓÒ'6VÆV7B×Æâ×v÷&²"’÷VåÆåv÷&´–å÷'FföÆ–ò†7F–öä'WGFöâæFF6WBæ–B“°¢–b†7F–öâÓÓÒ&÷VâÖFVÖæB"’°¢–b†Ö–çFVææ6Uf–Wt–G2æ–æ6ÇVFW2†7W'&VçEf–Wr’ÇÂ6Æ–æ–6Åf–Wt–G2æ–æ6ÇVFW2†7W'&VçEf–Wr’’°¢÷VäÖ–çFVææ6TFVÖæDÖöFÂ‚“°¢&WGW&ã°¢Ð¢6öç7B'WGFöåFW‡BÒæ÷&ÖÆ—¦U6V&6…FW‡B†7F–öä'WGFöâçFW‡D6öçFVçBÇÂ""“°¢6öç7BÖöFRÒ7W'&VçEf–WrÓÓÒ'6–72"ÇÂ'WGFöåFW‡Bæ–æ6ÇVFW2‚'6–2"’ò'6–2"¢&FVÖæB#°¢÷VäFVÖæDÖöFÂ†ÖöFR“°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖÖ–çFVææ6RÖFVÖæB"’÷VäÖ–çFVææ6TFVÖæDÖöFÂ‚“°¢–b†7F–öâÓÓÒ&6ÆV"ÖFVÖæBÖæÇ—7G2"’°¢6ÆV$FVÖæDæÇ—7E6VÆV7F÷"†7F–öä'WGFöâ“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&7&VFRÖ6Æ–æ–6ÂÖFVÖæBÖf÷"Ö76WB"’°¢÷VäÖ–çFVææ6TFVÖæDÖöFÂ†7F–öä'WGFöâæFF6WBæ–BÇÂ""“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖÖ–çFVææ6RÖ6&B"’÷VäÖ–çFVææ6T6&DÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢–b†7F–öâÓÓÒ&÷VâÖÖ–çFVææ6R×6Æ–6R"’÷VäÖ–çFVææ6U6Æ–6TFWF–ÄÖöFÂ†7F–öä'WGFöâæFF6WBæf–VÆBÂ7F–öä'WGFöâæFF6WBæÆ&VÂ“°¢–b†7F–öâÓÓÒ&W‡÷'B×v÷&·2Ö÷W&F–öæÂ"’°¢W‡÷'Ev÷&·4÷W&F–öæÅ&W÷'B‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&W‡÷'BÖÖ–çFVææ6RÖ÷W&F–öæÂ"’°¢W‡÷'DÖ–çFVææ6T÷W&F–öæÅ&W÷'B‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖFVÆWFRÖFVÖæB"’°¢÷VäFVÆWFTFVÖæDÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖFVÖæBÖFWF–Â"’÷VäFVÖæDFWF–ÄÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢–b†7F–öâÓÓÒ'÷7B×6–2×FòÖWb"’°¢v—B÷7DFVÖæE6–5FôUb†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖ6öçG&7B"’÷Vä6öçG&7DÖöFÂ‚“°¢–b†7F–öâÓÓÒ&÷Vâ×7&–çB"’÷Vå7&–çDÖöFÂ‚“°¢–b†7F–öâÓÓÒ&VF—B×7&–çB"’°¢÷Vå7&–çDÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'WFFR×7&–çB×7FGW2"’°¢v—B7F—fFU7&–çB†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖ6öæf–rÖ6FÆör"’°¢÷Vä6öæf–wW&F–öä6FÆötÖöFÂ†7F–öä'WGFöâæFF6WBæ6FÆöuG—RÂ7F–öä'WGFöâæFF6WBæ6FÆöt–BÇÂ""“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖWbÖÖöFÂ"’÷VäUdÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢–b†7F–öâÓÓÒ&÷VâÖ†—7F÷&–6ÂÖWb"’°¢VF—D†—7F÷&–6ÄUb†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'f–WrÖ†—7F÷&–6ÂÖ6ö×÷6—F–öâ"’°¢VF—D†—7F÷&–6ÄUb†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖWb×&VfW&Væ6R×F&vWG2"’°¢÷VäUe&VfW&Væ6UF&vWG4ÖöFÂ‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"×7G&FVv–2ÖFV6—6–öâÖf–ÇFW'2"’°¢7G&FVv–4UdFV6—6–öäf–ÇFW'2Ò²VW'“¢""Â7FGW3¢""ÂF&vWD–C¢""Â–V#¢""Ó°¢&VæFW"‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"×7G&FVv–2ÖWbÖf–ÇFW'2"’°¢7G&FVv–4Udf–ÇFW'2Ò²–V#¢""ÂG—öÆöw“¢""ÂF—66—Æ–æS¢""Ó°¢&VæFW"‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'6VÆV7B×7G&FVv–2ÖF—66—Æ–æR"’°¢7G&FVv–4Udf–ÇFW'2æF—66—Æ–æRÒ7F–öä'WGFöâæFF6WBæF—66—Æ–æT–BÇÂ"#°¢&VæFW"‚“°¢Fö7VÖVçBçVW'•6VÆV7F÷"‚"ç7G&FVv–2ÖF—66—Æ–æRÖFWF–Â"“òç67&öÆÄ–çFõf–Wr‡²&V†f–÷#¢'6Öö÷F‚"Â&Æö6³¢'7F'B"Ò“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"×7G&FVv–2ÖF—66—Æ–æR"’°¢7G&FVv–4Udf–ÇFW'2æF—66—Æ–æRÒ"#°¢&VæFW"‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'6fRÖWb×&VfW&Væ6R×F&vWG2"’°¢6fTUe&VfW&Væ6UF&vWG2‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&VF—BÖ†—7F÷&–6ÂÖWb"’°¢VF—D†—7F÷&–6ÄUb†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&VF—BÖWb×G—öÆöw’"’°¢÷VäUeG—öÆöw”ÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&FVÆWFRÖWb×&V6÷&B"’°¢÷VäFVÆWFTUe&V6÷&DÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&6öæf—&ÒÖFVÆWFRÖWb×&V6÷&B"’°¢FVÆWFTUe&V6÷&DWfW'—v†W&R†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&ÆöBÖWbÖ–æ62"’°¢ÆöEVæ–f–VDUd–çFô”ä42†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&6æ6VÂÖWbÖFWf–F–öâ×6fR"’°¢7F–öä'WGFöâæ6Æ÷6W7B‚%¶FFÖWbÖ†FV2Ö6öæf—&ÕÒ"“òç&VÖ÷fR‚“°¢Fö7VÖVçBçVW'•6VÆV7F÷"‚"6Wdf÷&ÒæWb×fÇVRÖ–çWB"“òæfö7W2‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&6öæf—&ÒÖWbÖFWf–F–öâ×6fR"’°¢6öç7B÷fW&Æ’Ò7F–öä'WGFöâæ6Æ÷6W7B‚%¶FFÖWbÖ†FV2Ö6öæf—&ÕÒ"“°¢6öç7B6öæf—&ÖVBÒ÷fW&Æ“òçVW'•6VÆV7F÷"‚%¶FFÖWbÖ†FV2Ö6†V6µÒ"“òæ6†V6¶VC°¢–b‚6öæf—&ÖVB’&WGW&ã°¢6öç7Bf÷&ÒÒFö7VÖVçBçVW'•6VÆV7F÷"‚"6Wdf÷&Ò"“°¢–b‚f÷&Ò’&WGW&ã°¢f÷&ÒæFF6WBæWdFWf–F–öä6öæf—&ÖVBÒ'G'VR#°¢÷fW&Æ’ç&VÖ÷fR‚“°¢v—B†æFÆTUe7V&Ö—B†f÷&ÒÂ7F–öä'WGFöâæFF6WBæÖöFRÇÂ&f–æÂ"“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖ–çfW7FÖVçBÖFWF–Â"’÷Vä–çfW7FÖVçDFWF–ÄÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢–b†7F–öâÓÓÒ&÷Vâ×6–2ÖFWF–Â"’÷Vå6–4FWF–ÄÖöFÂ†7F–öä'WGFöâæFF6WBæ¶W’“°¢–b†7F–öâÓÓÒ&÷Vâ×6–2×6Æ–6R"’÷Vå6–56Æ–6TFWF–ÄÖöFÂ†7F–öä'WGFöâæFF6WBæf–VÆBÂ7F–öä'WGFöâæFF6WBæÆ&VÂ“°¢–b†7F–öâÓÓÒ&÷Vâ×6–2×F–ÖVÆ–æR"’÷Vå6–5F–ÖVÆ–æTFWF–ÄÖöFÂ†7F–öä'WGFöâæFF6WBæÖöFRÂ7F–öä'WGFöâæFF6WBæ¶W’“°¢–b†7F–öâÓÓÒ&÷VâÖ·’ÖFWF–Â"’÷Vä·”FWF–Â†7F–öä'WGFöâæFF6WBæ·’“°¢–b†7F–öâÓÓÒ&÷VâÖÖævVÖVçBÖFWF–Â"’÷Vä·”FWF–Â‚""ÂÖævVÖVçDFWF–ÄFF†7F–öä'WGFöâæFF6WBæÖWG&–2Â7F–öä'WGFöâæFF6WBæw&÷WÂ7F–öä'WGFöâæFF6WBçfÇVRÂ7F–öä'WGFöâæFF6WBæ6öÇVÖâ’“°¢–b†7F–öâÓÓÒ&Ç’Ö÷W&F–öæÂÖf–ÇFW""’Ç”÷W&F–öæÄ·”f–ÇFW"†7F–öä'WGFöâæFF6WBæ·’“°¢–b†7F–öâÓÓÒ'&V÷&FW"Ö¶æ&âÖ6öÇVÖâ"’°¢6öç7B6öÇVÖâÒ6öÇVÖç2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ7F–öä'WGFöâæFF6WBæ6öÇVÖâ“°¢–b‚6öÇVÖâ’&WGW&ã°¢&VæFW"‚“°¢6†÷uFö7B†6öÇVÖâæ–BÓÓÒ'VÆÅÆææ–ær ¢òG¶6öÇVÖâæÆ&VÇÓ¢÷&FVæFòVÆ&Wf—<:6òFR–ì:Ö6–òÂFÖ—2,;7†–Ö&Ö—2F—7FçFRæ ¢¢6öÇVÖâæ–BÓÓÒ&6öæ6ÇV–Fò ¢òG¶6öÇVÖâæÆ&VÇÓ¢÷&FVæFòVÆ6öæ6ÇW<:6ò&VÂÂFòÖ—2&V6VçFR&òÖ—2çF–vòæ ¢¢G¶6öÇVÖâæÆ&VÇÓ¢÷&FVæFòVÆòÖ&6òW†–&–Fòæò6&BRÂVÒV×FRÂVÆ7&–:|:6òæ“°¢Ð¢–b†7F–öâÓÓÒ'6WBÖ÷W&F–öæÂ×f–Wr"’°¢÷W&F–öæÅf–WtÖöFRÒ7F–öä'WGFöâæFF6WBæÖöFRÇÂ&¶æ&â#°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'6WB×&ö¦V7BÖ÷W&F–öæÂ×f–Wr"’°¢&ö¦V7D÷W&F–öæÅf–WtÖöFRÒ7F–öä'WGFöâæFF6WBæÖöFRÇÂ&¶æ&â#°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'6WBÖÖ–çFVææ6R×f–Wr"’°¢6WDÖ–çFVææ6Uf–WtÖöFTf÷$7F—fTÖöGVÆR†7F–öä'WGFöâæFF6WBæÖöFRÇÂ&¶æ&â"“°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'6WBÖÖævVÖVçBÖf–ÇFW""’°¢ÖævVÖVçE7FGW4f–ÇFW"Ò7F–öä'WGFöâæFF6WBæf–ÇFW"ÇÂ&ÆÂ#°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"×7G&FVv–2Ö†—7F÷'’"’°¢7G&FVv–4†—7F÷&–6ÅVW'’Ò"#°¢7G&FVv–4†—7F÷&–6Äf–ÇFW'2Ò²–V#¢""Â&Vv–öã¢""Â7FGW3¢""Ó°¢&VæFW"‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'6V&6‚Ö†—7F÷&–6Â×v÷&²"’°¢7G&FVv–4†—7F÷&–6ÅVW'’Ò7F–öä'WGFöâæFF6WBæ6öFRÇÂ"#°¢7G&FVv–4†—7F÷&–6Äf–ÇFW'2Ò²–V#¢""Â&Vv–öã¢""Â7FGW3¢""Ó°¢&VæFW"‚“°¢Fö7VÖVçBçVW'•6VÆV7F÷"‚%¶FF×7G&FVv–2Ö†—7F÷'’×6V&6…Ò"“òæfö7W2‚“°¢6†÷uFö7B‚$ö'&Æö6Æ—¦Fæ&6RvW&Ââ"“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'6WB×6–2×f–Wr"’°¢6–5f–WtÖöFRÒ7F–öä'WGFöâæFF6WBçf–WtÖöFRÇÂ'&W÷'B#°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&÷Vâ×6–2Ö&÷fÂ"’°¢6–5f–WtÖöFRÒ&&÷fÂ#°¢–b†7F–öä'WGFöâæFF6WBæ–B’6–56V&6…VW'’Ò7F–öä'WGFöâæFF6WBæ–C°¢6Æ÷6TÖöFÂ‚“°¢6WEf–Wr‚'6–72"“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'6WBÖ'VFvWB×F""’°¢'VFvWEf–WtÖöFRÒ7F–öä'WGFöâæFF6WBçF"ÇÂ&–æ–6–ò#°¢'VFvWEG&ç6fW$6†V6²ÒçVÆÃ°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'6WBÖ6W‚Ö7W'fR×F&ÆR"’°¢6W„7W'fUF&ÆTÖöFRÒ7F–öä'WGFöâæFF6WBæÖöFRÇÂ'&Wf—7Fò#°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'6WBÖ6W‚Ö7W'fR×66÷R"’°¢6W„7W'fU66÷RÒ7F–öä'WGFöâæFF6WBç66÷RÇÂ&ö'&2#°¢'VFvWDf–ÇFW'2Ò²VW'“¢""Â6FVv÷&–÷&3¢""Â7FGW3¢""Â6VçG&ôf–ææ6V—&ó¢""Ó°¢6W„7W'fTÖöçF„f–ÇFW"ÒµÓ°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'6WBÖ6W‚Ö7W'fRÖÖöçF‚"’°¢6öç7BÖöçF‚Ò7F–öä'WGFöâæFF6WBæÖöçF‚ÇÂ"#°¢–b‚ÖöçF‚’°¢6W„7W'fTÖöçF„f–ÇFW"ÒµÓ°¢ÒVÇ6R°¢6öç7B6VÆV7FVDÖöçF‡2Ò6W„7W'fU6VÆV7FVDÖöçF‡2‚“°¢6W„7W'fTÖöçF„f–ÇFW"Ò6VÆV7FVDÖöçF‡2æ–æ6ÇVFW2†ÖöçF‚¢ò6VÆV7FVDÖöçF‡2æf–ÇFW"‚†—FVÒ’Óâ—FVÒÓÒÖöçF‚¢¢6÷'D6W„7W'fTÖöçF‡2…²ââç6VÆV7FVDÖöçF‡2ÂÖöçF…Ò“°¢Ð¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'6WBÖ6W‚Ö7W'fRÖ6FVv÷'’"’°¢'VFvWDf–ÇFW'2æ6FVv÷&–÷&2Ò7F–öä'WGFöâæFF6WBæ6FVv÷'’ÇÂ"#°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&÷VâÖ6W‚Ö7W'fRÖFWF–Â"’°¢÷Vä6W„7W'fTFWF–Â†7F–öä'WGFöâæFF6WBæFWF–ÂÇÂ""Â7F–öä'WGFöâæFF6WBæÆ&VÂÇÂ""“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'6WB×G&ç6fW"ÖfÆ÷r×f–Wr"’°¢G&ç6fW$fÆ÷uf–WtÖöFRÒ7F–öä'WGFöâæFF6WBæÖöFRÇÂ&ö’#°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'6WB×G&ç6fW"ÖÖöçF‚Öf–ÇFW""’°¢G&ç6fW$ÖöçF„f–ÇFW"Ò7F–öä'WGFöâæFF6WBæÖöçF‚ÇÂ"#°¢G&ç6fW$ÆÅvRÒ°¢G&ç6fW$æWEvRÒ°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'G&ç6fW"ÖæWB×vR"’°¢G&ç6fW$æWEvRÒÖF‚æÖ‚ƒÂG&ç6fW$æWEvR²çVÖ&W"†7F–öä'WGFöâæFF6WBæF—&V7F–öâÇÂ’“°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'G&ç6fW"ÖÆÂ×vR"’°¢G&ç6fW$ÆÅvRÒÖF‚æÖ‚ƒÂG&ç6fW$ÆÅvR²çVÖ&W"†7F–öä'WGFöâæFF6WBæF—&V7F–öâÇÂ’“°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&÷Vâ×G&ç6fW"ÖFWF–Â"’°¢÷VåG&ç6fW$FWF–ÄÖöFÂ†7F–öä'WGFöâæFF6WBæ–BÇÂ""“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷Vâ×G&ç6fW"Öö’"’°¢÷VåG&ç6fW$ö”ÖöFÂ†7F–öä'WGFöâæFF6WBæö’ÇÂ""“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"×G&ç6fW"Öf–ÇFW'2"’°¢G&ç6fW%G&6¶W%VW'’Ò"#°¢G&ç6fW%G&6¶W%VW'“"Ò"#°¢G&ç6fW$ÆÅ6V&6‚Ò"#°¢G&ç6fW$æWE6V&6‚Ò"#°¢G&ç6fW$ÖöçF„f–ÇFW"Ò"#°¢G&ç6fW$ÆÅvRÒ°¢G&ç6fW$æWEvRÒ°¢'VFvWEG&ç6fW$6†V6²ÒçVÆÃ°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"Ö÷W&F–öæÂÖf–ÇFW'2"’°¢&W6WD÷W&F–öæÄf–ÇFW'2‚“°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"×&ö¦V7B×ÆâÖf–ÇFW'2"’°¢&W6WE&ö¦V7EÆäf–ÇFW'2‚“°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"×&ö¦V7BÖ÷W&F–öæÂÖf–ÇFW'2"’°¢&W6WE&ö¦V7D÷W&F–öæÄf–ÇFW'2‚“°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"ÖÖ–çFVææ6RÖf–ÇFW'2"’°¢&W6WDÖ–çFVææ6Tf–ÇFW'2‚“°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'6÷'BÖWbÖ†—7F÷'’"’°¢6öç7B¶W’Ò7F–öä'WGFöâæFF6WBç6÷'D¶W’ÇÂ"#°¢–b†Wd†—7F÷&–6Å6÷'Bæ¶W’ÓÒ¶W’’Wd†—7F÷&–6Å6÷'BÒ²¶W’ÂF—&V7F–öã¢&FW62"Ó°¢VÇ6R–b†Wd†—7F÷&–6Å6÷'BæF—&V7F–öâÓÓÒ&FW62"’Wd†—7F÷&–6Å6÷'BÒ²¶W’ÂF—&V7F–öã¢&62"Ó°¢VÇ6R–b†Wd†—7F÷&–6Å6÷'BæF—&V7F–öâÓÓÒ&62"’Wd†—7F÷&–6Å6÷'BÒ²¶W“¢""ÂF—&V7F–öã¢""Ó°¢VÇ6RWd†—7F÷&–6Å6÷'BÒ²¶W’ÂF—&V7F–öã¢&FW62"Ó°¢&VæFW"‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'6÷'BÖvVæW&–2×F&ÆR"’°¢6÷'DvVæW&–5F&ÆR†7F–öä'WGFöâ“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"ÖWbÖf–ÇFW'2"’°¢6V&6…FW&ÒÒ"#°¢Wd76—7FçEVW'’Ò"#°¢Wd†—7F÷&–6Äf–ÇFW'2Ò²VW'“¢""Â–V#¢""ÂG—öÆöw“¢""ÂF—66—Æ–æS¢""ÂFV6†æ–6–ã¢""Ó°¢Wd†—7F÷&–6Å6÷'BÒ²¶W“¢""ÂF—&V7F–öã¢""Ó°¢6VÆV7FVEv÷&´–BÒ&ÆÂ#°¢6†÷uFö7B‚$f–ÇG&÷2FòUbÆ–×÷2â"“°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"×6–2×6V&6‚"’°¢6–56V&6…VW'’Ò"#°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"Ö'VFvWBÖf–ÇFW'2"’°¢'VFvWDf–ÇFW'2Ò²VW'“¢""Â6FVv÷&–÷&3¢""Â7FGW3¢""Â6VçG&ôf–ææ6V—&ó¢""Ó°¢'VFvWEG&ç6fW$6†V6²ÒçVÆÃ°¢6W„7W'fTÖöçF„f–ÇFW"ÒµÓ°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'fÆ–FFRÖ'VFvWB×G&ç6fW""’°¢fÆ–FFT'VFvWEG&ç6fW"‚“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'FövvÆRÖFVÖæBÖ†—7F÷'’"’°¢6öç7BæVÂÒ7F–öä'WGFöâæ6Æ÷6W7B‚"æÖöFÂ×6V7F–öâ"“òçVW'•6VÆV7F÷"‚"æFVÖæBÖ†—7F÷'’×æVÂ"“°¢–b‡æVÂ’æVÂæ†–FFVâÒæVÂæ†–FFVã°¢Ð¢–b†7F–öâÓÓÒ'7F'BÖFVÖæB×v—¦&B"’°¢–b†7F–öä'WGFöâæFF6WBçG—RÓÓÒ%4”2"’°¢÷Vå6–4FVÖæDÖöFÂ‚“°¢&WGW&ã°¢Ð¢÷VäFVÖæEv—¦&DÖöFÂ†7F–öä'WGFöâæFF6WBçG—RÇÂ$VÖ—76ô–æ–6–Â"Â“°¢Ð¢–b†7F–öâÓÓÒ&&6²ÖFVÖæB×7FW"’°¢÷VäFVÖæEv—¦&DÖöFÂ†FVÖæEv—¦&DG&gBçF—òÇÂ$VÖ—76ô–æ–6–Â"ÂÂFVÖæEv—¦&DG&gB“°¢Ð ¢–b†7F–öâÓÓÒ&FBÖWbÖÆö6ÂÖÆ–æR"’°¢6öç7Bf÷&ÒÒ7F–öä'WGFöâæ6Æ÷6W7B‚"6Wdf÷&Ò"“°¢6öç7B6FVv÷'’Ò7F–öä'WGFöâæFF6WBæ6FVv÷'“°¢–b‚f÷&ÒÇÂ²$7W7F÷4Fö'&"Â$÷WG&46FVv÷&–2"Â%6–72%Òæ–æ6ÇVFW2†6FVv÷'’’’&WGW&ã°¢6öç7Bv÷&²Òv÷&´'”–B†f÷&ÒæFF6WBçv÷&´–B“°¢6öç7B&öG’Òf÷&ÒçVW'•6VÆV7F÷"†¶FFÖWbÖw&÷WÖ&öG“Ò"G¶6FVv÷'—Ò%Ö“°¢–b‚v÷&²ÇÂ&öG’’&WGW&ã°¢6öç7B&æFöÕ'BÒvÆö&ÅF†—2æ7'—Fóòç&æFöÕUT”Còâ‚’ÇÂG´FFRææ÷r‚—ÒÒG´ÖF‚æfÆö÷"„ÖF‚ç&æFöÒ‚’¢—Ö°¢6öç7B–BÒÆö6ÂÒG¶6FVv÷'’çFôÆ÷vW$66R‚—ÒÒGµ7G&–ær‡&æFöÕ'B’ç&WÆ6R‚õµæ×¤Õ£Ó’ÕÒörÂ""—Ö°¢6öç7BÆ–æRÒ°¢F—66—Æ–æ–C¢–BÀ¢fÆ÷$÷&6Fó¢À¢7FGW3¢6FVv÷'’ÓÓÒ%6–72"ò$÷,:vFò"¢$W7F–ÖFò"À¢—4Æö6ÄUdÆ–æS¢G'VRÀ¢Æö6ÄæÖS¢""À¢Æö6Ä6FVv÷'“¢6FVv÷'’À¢Æö6Å÷6—F–öã¢FFRææ÷r‚’À¢Ó°¢6öç7B&÷rÒ°¢F—66—Æ–æS¢²–BÂæöÖS¢""Â6FVv÷&–¢6FVv÷'’Â÷6–6ó¢Æ–æRæÆö6Å÷6—F–öâÂÆö6Ã¢G'VRÒÀ¢Æ–æRÀ¢7FGW3¢Æ–æRç7FGW2À¢fÇVS¢À¢6FVv÷'’À¢Æö6Ã¢G'VRÀ¢Ó°¢6öç7B&÷tÖ&·WÒ&VæFW$Udw&÷WVDVF—F&ÆU&÷r€¢v÷&²À¢&÷rÀ¢Wdf÷&ÕF÷FÇ2†f÷&Ò’çF÷FÂÀ¢²†–FTV×G“¢fÇ6RÂW†—7F–ætÆö6Ã¢fÇ6RÐ¢“°¢6öç7B&÷t†÷7BÒFö7VÖVçBæ7&VFTVÆVÖVçB‚&F—b"“°¢&÷t†÷7Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ†ÇF&ÆSãÇF&öG“âG·&÷tÖ&·WÓÂ÷F&öG“ãÂ÷F&ÆSæ“°¢6öç7BFFVE&÷rÒ&÷t†÷7BçVW'•6VÆV7F÷"‚"æWbÖÆ–æR×&÷r"“°¢–b‚FFVE&÷r’°¢6†÷tf÷&ÔW'&÷"‚$ì:6òfö’÷7<:×fVÂ7&–"æ÷fÆ–æ†FòUbâ"Âf÷&Ò“°¢&WGW&ã°¢Ð¢&öG’æVæD6†–ÆB†FFVE&÷r“°¢FFVE&÷sòçVW'•6VÆV7F÷"‚"æWbÖÆö6ÂÖæÖRÖ–çWB"“òæfö7W2‚“°¢WFFTUd&V&Wf–Wr†f÷&Ò“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'&VÖ÷fRÖWbÖÆö6ÂÖÆ–æR"’°¢6öç7B&÷rÒ7F–öä'WGFöâæ6Æ÷6W7B‚"æWbÖÆ–æR×&÷r"“°¢6öç7Bf÷&ÒÒ&÷sòæ6Æ÷6W7B‚"6Wdf÷&Ò"“°¢–b‚&÷rÇÂf÷&ÒÇÂ&÷ræFF6WBæÆö6ÄÆ–æRÓÒ'G'VR"’&WGW&ã°¢–b‡&÷ræFF6WBæW†—7F–ætÆö6ÂÓÓÒ'G'VR"’°¢ÆWBFVÆWFVBÒµÓ°¢G'’°¢FVÆWFVBÒ¥4ôâç'6R†f÷&ÒæFF6WBæFVÆWFVDÆö6ÄÆ–æT–G2ÇÂ%µÒ"“°¢Ò6F6‚°¢FVÆWFVBÒµÓ°¢Ð¢FVÆWFVBçW6‚‡&÷ræFF6WBæF—66—Æ–æT–B“°¢f÷&ÒæFF6WBæFVÆWFVDÆö6ÄÆ–æT–G2Ò¥4ôâç7G&–æv–g’…²ââææWr6WB†FVÆWFVB•Ò“°¢Ð¢&÷rç&VÖ÷fR‚“°¢WFFTUd&V&Wf–Wr†f÷&Ò“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'&VÖ÷fRÖWbÖÆVv7’×6–2"’°¢6öç7B&÷rÒ7F–öä'WGFöâæ6Æ÷6W7B‚ræWb×6–2×÷7FVB×&÷u¶FFÖWbÖÆVv7’×6–3Ò'G'VR%Òr“°¢6öç7Bf÷&ÒÒ&÷sòæ6Æ÷6W7B‚"6Wdf÷&Ò"“°¢–b‚&÷rÇÂf÷&Ò’&WGW&ã°¢f÷&ÒæFF6WBæFVÆWFVDÆVv7•6–2Ò'G'VR#°¢&÷rç&VÖ÷fR‚“°¢WFFTUd&V&Wf–Wr†f÷&Ò“°¢6†÷uFö7B‚%4”2†—7L;7&–6Ö&6F&W†6ÇW<:6òâ6Æ—VRVÒ6Çf"Ub&6öæf—&Ö"â"“°¢&WGW&ã°¢Ð ¢–b†7F–öâÓÓÒ'6WBÖWbÖÆ–æRÖæ"’°¢6öç7B&÷rÒ7F–öä'WGFöâæ6Æ÷6W7B‚"æWbÖÆ–æR×&÷r"“°¢6öç7B6VÆV7BÒ&÷sòçVW'•6VÆV7F÷"‚"æWb×7FGW2×6VÆV7B"“°¢6öç7B–çWBÒ&÷sòçVW'•6VÆV7F÷"‚"æWb×fÇVRÖ–çWB"“°¢–b‡6VÆV7B’°¢6VÆV7BçfÇVRÒ$ì:6ò6RÆ–6#°¢6VÆV7BæFF6WBç7FGW2Ò$ì:6ò6RÆ–6#°¢Ð¢–b†–çWB’°¢–çWBçfÇVRÒ#Ã#°¢–çWBæF—6&ÆVBÒG'VS°¢Ð¢&÷sòæ6Æ74Æ—7BæFB‚&—2Öæ÷BÖÆ–6&ÆR"“°¢WFFTUd&V&Wf–Wr†7F–öä'WGFöâæ6Æ÷6W7B‚"6Wdf÷&Ò"’“°¢Ð¢–b†7F–öä'WGFöâæFF6WBç6fTÖöFR’°¢6öç7Bf÷&ÒÒ7F–öä'WGFöâæ6Æ÷6W7B‚&f÷&Ò"“°¢6öç7B†–FFVâÒf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ'6fTÖöFR%Òr“°¢–b††–FFVâ’†–FFVâçfÇVRÒ7F–öä'WGFöâæFF6WBç6fTÖöFS°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"×÷'FföÆ–òÖf–ÇFW'2"’°¢÷'FföÆ–õV–6´f–ÇFW'2Ò7&VFU÷'FföÆ–õV–6´f–ÇFW'2‚“°¢÷'FföÆ–ôf–ÇFW'2Òö&¦V7Bæg&öÔVçG&–W2„ö&¦V7Bæ¶W—2‡÷'FföÆ–ôf–ÇFW'2’æÖ‚†¶W’’Óâ¶¶W’Â"%Ò’“°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&6ÆV"Ö–çfW7FÖVçB×ÆâÖf–ÇFW'2"’°¢–çfW7FÖVçEÆäf–ÇFW'2Ò²VW'“¢""ÂWF¢%&ö¦WF÷2"Â7FGW3¢""Â&Vv–ó¢""ÂFFTg&öÓ¢""ÂFFUFó¢""Ó°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ&6Æ÷6RÖÖöFÂ"bbWfVçBçF&vWBÓÓÒ7F–öä'WGFöâ’°¢–b†7F–öä'WGFöâæ6Æ74Æ—7Bæ6öçF–ç2‚&ÖöFÂÖ&6¶G&÷"’bb7F–öä'WGFöâçVW'•6VÆV7F÷"‚&f÷&ÒæÖöFÂÖ6&B"’’°¢&WGW&ã°¢Ð¢6öç7BWd6ö×ÆWF–öäFVÖæD–BÒ7F–öä'WGFöâæ6Æ÷6W7B‚"æWbÖÖöFÂÖ6&B"“òçVW'•6VÆV7F÷"‚"6Wdf÷&Õ¶FFÖ6ö×ÆWF–öâÖFVÖæBÖ–EÒ"“òæFF6WBæ6ö×ÆWF–öäFVÖæD–BÇÂ"#°¢6öç7BF—&V7D6ö×ÆWF–öäFVÖæD–BÒ7F–öä'WGFöâæ6Æ÷6W7B‚%¶FFÖF—&V7B×6–2Ö6ö×ÆWF–öåÒ"“òæFF6WBæF—&V7E6–46ö×ÆWF–öâÇÂ"#°¢–b†Wd6ö×ÆWF–öäFVÖæD–B’°¢VæF–ætFVÖæD6ö×ÆWF–öâÒçVÆÃ°¢Ð¢–b€¢VæF–ætF—&V7E6–46ö×ÆWF–öà¢bb¶Wd6ö×ÆWF–öäFVÖæD–BÂF—&V7D6ö×ÆWF–öäFVÖæD–EÒæ–æ6ÇVFW2‡VæF–ætF—&V7E6–46ö×ÆWF–öâæFVÖæD–B¢’VæF–ætF—&V7E6–46ö×ÆWF–öâÒçVÆÃ°¢v÷&´ÖöFÅ&WGW&äÖöFRÒ"#°¢6Æ÷6TÖöFÂ‚“°¢Ð¢–b†7F–öâÓÓÒ&FBÖF—66—Æ–æR×&÷r"’°¢Fö7VÖVçBçVW'•6VÆV7F÷"‚"6F—66—Æ–æU&÷w2"’æ–ç6W'DF¦6VçD…DÔÂ‚&&Vf÷&VVæB"ÂF—66—Æ–æU&÷uFV×ÆFR‚’“°¢Ð¢–b†7F–öâÓÓÒ'&VÖ÷fRÖF—66—Æ–æR×&÷r"’°¢6öç7B&÷w2ÒFö7VÖVçBçVW'•6VÆV7F÷$ÆÂ‚"æF—66—Æ–æR×&÷r"“°¢–b‡&÷w2æÆVæwF‚â’7F–öä'WGFöâæ6Æ÷6W7B‚"æF—66—Æ–æR×&÷r"’ç&VÖ÷fR‚“°¢Ð¢–b†7F–öâÓÓÒ&FB×6–2ÖG&gB×&÷r"’°¢7F–öä'WGFöâæ6Æ÷6W7B‚"ç6–2ÖG&gBÖVF—F÷""“òçVW'•6VÆV7F÷"‚%¶FF×6–2ÖG&gB×&÷w5Ò"“òæ–ç6W'DF¦6VçD…DÔÂ‚&&Vf÷&VVæB"Â6–4G&gDF—66—Æ–æU&÷uFV×ÆFR‚’“°¢Ð¢–b†7F–öâÓÓÒ'&VÖ÷fR×6–2ÖG&gB×&÷r"’°¢6öç7BVF—F÷"Ò7F–öä'WGFöâæ6Æ÷6W7B‚"ç6–2ÖG&gBÖVF—F÷""“°¢6öç7B&÷w2ÒVF—F÷#òçVW'•6VÆV7F÷$ÆÂ‚"ç6–2ÖG&gB×&÷r"’ÇÂµÓ°¢–b‡&÷w2æÆVæwF‚â’7F–öä'WGFöâæ6Æ÷6W7B‚"ç6–2ÖG&gB×&÷r"“òç&VÖ÷fR‚“°¢Ð¢–b†7F–öâÓÓÒ&&÷fR×6–2ÖFVÖæB"’°¢v—B&÷fU6–4FVÖæB†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'&V¦V7B×6–2ÖFVÖæB"’°¢v—B&V¦V7E6–4FVÖæB†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&&÷fR×6–2"’v—B&÷fU6–2†7F–öä'WGFöâæFF6WBæ–B“°¢–b†7F–öâÓÓÒ&Ö÷fRÖFVÖæB"’°¢v—BÖ÷fTFVÖæB†7F–öä'WGFöâæFF6WBæ–BÂçVÖ&W"†7F–öä'WGFöâæFF6WBæF—&V7F–öâ’“°¢–b†7F–öä'WGFöâæ6Æ÷6W7B‚"æFVÖæBÖÖöFÂÖ6&B"’’÷VäFVÖæDFWF–ÄÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢Ð¢–b†7F–öâÓÓÒ&VF—BÖ6ö×ÆWFVBÖFVÖæB×fÇVR"’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ7F–öä'WGFöâæFF6WBæ–B“°¢–b‚FVÖæBÇÂFVÖæBæ6öÇVæÓÒ&6öæ6ÇV–Fò"’&WGW&ã°¢–b†FVÖæEG—T¶W’†FVÖæBçF—ò’ÓÓÒ%4”2"’÷VäFVÖæD6ö×ÆWF–öäÖ÷VçDÖöFÂ†FVÖæBæ–BÂ²VF—EfÇVS¢G'VRÒ“°¢VÇ6R÷VäFVÖæD6ö×ÆWF–öäÖöFÂ†FVÖæBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'v—fR×6–2ÖF—&V7F÷"Ö&÷fÂ"’°¢÷Vå6–4F—&V7F÷%v—fW$ÖöFÂ†7F–öä'WGFöâæFF6WBæ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'FövvÆRÖWb×¦W&òÖÆ–æW2"’°¢6öç7Bf÷&ÒÒ7F–öä'WGFöâæ6Æ÷6W7B‚"6Wdf÷&Ò"“°¢–b‚f÷&Ò’&WGW&ã°¢6öç7B6†÷VÆD†–FRÒ7F–öä'WGFöâæFF6WBæ†–FFVâÓÒ'G'VR#°¢6öç7B&÷w2Ò²ââæf÷&ÒçVW'•6VÆV7F÷$ÆÂ‚"æWb×¦W&ò×FövvÆR×&÷r"•Ó°¢&÷w2æf÷$V6‚‚‡&÷r’Óâ°¢6öç7BfÇVRÒ&÷ræ6Æ74Æ—7Bæ6öçF–ç2‚&Wb×6–2×÷7FVB×&÷r"¢ò‡&÷rçVW'•6VÆV7F÷"‚%¶FFÖWbÖÆVv7’×6–2×fÇVUÒ"¢ò'6T7W'&Væ7’‡&÷rçVW'•6VÆV7F÷"‚%¶FFÖWbÖÆVv7’×6–2×fÇVUÒ"’çfÇVR¢¢çVÖ&W"‡&÷ræFF6WBæWe7FF–5fÇVRÇÂ’¢¢'6T7W'&Væ7’‡&÷rçVW'•6VÆV7F÷"‚"æWb×fÇVRÖ–çWB"“òçfÇVRÇÂ""“°¢&÷ræ†–FFVâÒ6†÷VÆD†–FRbbÖF‚æ'2‡fÇVR’Âã°¢Ò“°¢7F–öä'WGFöâæFF6WBæ†–FFVâÒ6†÷VÆD†–FRò'G'VR"¢&fÇ6R#°¢7F–öä'WGFöâç6WDGG&–'WFR‚&&–×&W76VB"Â6†÷VÆD†–FRò'G'VR"¢&fÇ6R"“°¢7F–öä'WGFöâçFW‡D6öçFVçBÒ6†÷VÆD†–FRò$W†–&—"f¦–÷2"¢$ö7VÇF"f¦–÷2#°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'FövvÆRÖWbÖ6ö×ÆWFVæW72"’°¢6öç7Bf÷&ÒÒ7F–öä'WGFöâæ6Æ÷6W7B‚"6Wdf÷&Ò"“°¢6öç7B–çWBÒf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ&WdÆ–fV7–6ÆU7FGW2%Òr“°¢–b‚–çWB’&WGW&ã°¢6öç7BæW‡E7FGW2Ò–çWBçfÇVRÓÓÒ$6ö×ÆWFò"ò$–æ6ö×ÆWFò"¢$6ö×ÆWFò#°¢–çWBçfÇVRÒæW‡E7FGW3°¢7F–öä'WGFöâæFF6WBç7FGW2ÒæW‡E7FGW3°¢7F–öä'WGFöâç6WDGG&–'WFR‚&&–×&W76VB"ÂæW‡E7FGW2ÓÓÒ$6ö×ÆWFò"ò'G'VR"¢&fÇ6R"“°¢7F–öä'WGFöâæ6Æ74Æ—7BçFövvÆR‚&—2Ö6ö×ÆWFR"ÂæW‡E7FGW2ÓÓÒ$6ö×ÆWFò"“°¢7F–öä'WGFöâæ6Æ74Æ—7BçFövvÆR‚&—2Ö–æ6ö×ÆWFR"ÂæW‡E7FGW2ÓÒ$6ö×ÆWFò"“°¢6öç7BÆ&VÂÒ7F–öä'WGFöâçVW'•6VÆV7F÷"‚'7G&öær"“°¢–b†Æ&VÂ’Æ&VÂçFW‡D6öçFVçBÒæW‡E7FGW2ÓÓÒ$6ö×ÆWFò"ò%6–Ò"¢$ì:6ò#°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&6öçF–çVRÖFVÖæBÖ6ö×ÆWF–öâ"’°¢÷VäFVÖæD6ö×ÆWF–öäÖ÷VçDÖöFÂ†7F–öä'WGFöâæFF6WBæ–BÂ°¢Wdæô6†ævS¢7F–öä'WGFöâæFF6WBæWdæô6†ævRÓÓÒ'G'VR"À¢&W7VÖVDgFW$Uc¢7F–öä'WGFöâæFF6WBæWdæô6†ævRÓÒ'G'VR"À¢Ò“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&6ö×ÆWFRÖFVÖæBÖæòÖWbÖ6†ævR"’°¢÷VäFVÖæD6ö×ÆWF–öäÖ÷VçDÖöFÂ†7F–öä'WGFöâæFF6WBæ–BÂ²Wdæô6†ævS¢G'VRÒ“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'6fRÖFVÖæBÖ6ö×ÆWF–öâ"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢6öç7Bf÷&ÒÒ7F–öä'WGFöâæ6Æ÷6W7B‚"6FVÖæD6ö×ÆWF–öäf÷&Ò"“°¢–b‚f÷&Ò’&WGW&ã°¢6öç7B÷&–v–æÄÆ&VÂÒ7F–öä'WGFöâçFW‡D6öçFVçC°¢7F–öä'WGFöâæF—6&ÆVBÒG'VS°¢7F–öä'WGFöâçFW‡D6öçFVçBÒ$6öæ6ÇV–æFþ(
b#°¢G'’°¢v—B†æFÆTFVÖæD6ö×ÆWF–öå7V&Ö—B†f÷&Ò“°¢Òf–æÆÇ’°¢–b†7F–öä'WGFöâæ—46öææV7FVB’°¢7F–öä'WGFöâæF—6&ÆVBÒfÇ6S°¢7F–öä'WGFöâçFW‡D6öçFVçBÒ÷&–v–æÄÆ&VÃ°¢Ð¢Ð¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&6ö×ÆWFRÖFVÖæB×WFFRÖWb"’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ7F–öä'WGFöâæFF6WBæ–B“°¢6öç7Bv÷&²ÒFVÖæBbbv÷&´'”–B†FVÖæBæö'&–B“°¢–b‚FVÖæBÇÂv÷&²’&WGW&ã°¢6VÆV7FVEv÷&´–BÒv÷&²æ–C°¢6Æ÷6TÖöFÂ‚“°¢VæF–ætFVÖæD6ö×ÆWF–öâÒ²FVÖæD–C¢FVÖæBæ–BÂv÷&´–C¢v÷&²æ–BÓ°¢v—B6WEf–Wr‚&Wb"“°¢÷VäUdÖöFÂ‡v÷&²æ–BÂ²6ö×ÆWF–öäFVÖæD–C¢FVÖæBæ–BÒ“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷Vâ×v÷&²ÖWb"’°¢6öç7Bv÷&²Òv÷&´'”–B†7F–öä'WGFöâæFF6WBæ–B“°¢–b‚v÷&²’&WGW&ã°¢6VÆV7FVEv÷&´–BÒv÷&²æ–C°¢6Æ÷6TÖöFÂ‚“°¢6WEf–Wr‚&Wb"“°¢÷VäUdÖöFÂ‡v÷&²æ–B“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ&÷Vâ×&ö¦V7B×ÆâÖFWF–Â"’°¢÷Vå&ö¦V7EÆäFWF–Â†7F–öä'WGFöâæFF6WBç&÷r“°¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'6VÆV7BÖWb×v÷&²"’°¢6VÆV7FVEv÷&´–BÒ7F–öä'WGFöâæFF6WBæ–C°¢Wd76—7FçEVW'’Ò"#°¢&VæFW"‚“°¢Ð¢–b†7F–öâÓÓÒ'6VÆV7B×6–2×v÷&²"’°¢6öç7Bv÷&²Òv÷&´'”–B†7F–öä'WGFöâæFF6WBæ–B“°¢6öç7Bf÷&ÒÒ7F–öä'WGFöâæ6Æ÷6W7B‚&f÷&Ò"“°¢6öç7B–çWBÒf÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2×v÷&²×6V&6…Ò"“°¢6öç7B†–FFVâÒf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ&ö'&–B%Òr“°¢6öç7B&W7VÇG2Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FF×6–2×v÷&²×&W7VÇG5Ò"“°¢–b†—4FVÖæEv÷&´VÆ–v–&ÆR‡v÷&²’bb–çWBbb†–FFVâ’°¢–çWBçfÇVRÒv÷&´÷F–öäÆ&VÂ‡v÷&²“°¢†–FFVâçfÇVRÒv÷&²æ–C°¢–b‡&W7VÇG2’&W7VÇG2æ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ‡&VæFW%6–5v÷&µ6V&6…&W7VÇG2†–çWBçfÇVRÂv÷&²æ–B’“°¢7VvvW7D†—7F÷&–6ÄæÇ—7D–äf÷&Ò†f÷&ÒÂv÷&²“°¢6öç7BW'&÷$&÷‚Òf÷&ÒçVW'•6VÆV7F÷"‚"6f÷&ÔW'&÷""“°¢–b†W'&÷$&÷‚’W'&÷$&÷‚æ6Æ74Æ—7Bç&VÖ÷fR‚&—2×f—6–&ÆR"“°¢Ð¢Ð¢–b†7F–öâÓÓÒ'6VÆV7BÖÖ–çFVææ6R×Væ—B"’°¢6öç7BVæ—BÒÖ–çFVææ6UVæ—D'”–B†7F–öä'WGFöâæFF6WBæ–B“°¢6öç7Bf÷&ÒÒ7F–öä'WGFöâæ6Æ÷6W7B‚&f÷&Ò"“°¢6öç7B–çWBÒf÷&ÓòçVW'•6VÆV7F÷"‚%¶FFÖÖ–çFVææ6R×Væ—B×6V&6…ÒÂ¶FFÖFVÖæB×Væ—B×6V&6…Ò"“°¢6öç7B†–FFVâÒf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ'Væ–FFT–B%Òr“°¢6öç7B&W7VÇG2Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FFÖÖ–çFVææ6R×Væ—B×&W7VÇG5ÒÂ¶FFÖFVÖæB×Væ—B×&W7VÇG5Ò"“°¢–b‡Væ—Bbb–çWBbb†–FFVâ’°¢–çWBçfÇVRÒ6†&VEVæ—E6V&6„Æ&VÂ‡Væ—B“°¢†–FFVâçfÇVRÒVæ—Bæ–C°¢–b‡&W7VÇG2’&W7VÇG2æ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ†Ö–çFVææ6UVæ—E6V&6…&W7VÇG2†–çWBçfÇVRÂVæ—Bæ–B’“°¢6öç7BW'&÷$&÷‚Òf÷&ÒçVW'•6VÆV7F÷"‚"6f÷&ÔW'&÷""“°¢–b†W'&÷$&÷‚’W'&÷$&÷‚æ6Æ74Æ—7Bç&VÖ÷fR‚&—2×f—6–&ÆR"“°¢Ð¢Ð¢–b†7F–öâÓÓÒ'6VÆV7BÖ6Æ–æ–6ÂÖWV—ÖVçB"’°¢6öç7Bf÷&ÒÒ7F–öä'WGFöâæ6Æ÷6W7B‚&f÷&Ò"“°¢6öç7B76WBÒ6Æ–æ–6ÄWV—ÖVçD'”–B†7F–öä'WGFöâæFF6WBæ–B“°¢–b†f÷&Òbb76WB’°¢Ç”6Æ–æ–6ÄWV—ÖVçEFôf÷&Ò†f÷&ÒÂ76WB“°¢6öç7BW'&÷$&÷‚Òf÷&ÒçVW'•6VÆV7F÷"‚"6f÷&ÔW'&÷""“°¢–b†W'&÷$&÷‚’W'&÷$&÷‚æ6Æ74Æ—7Bç&VÖ÷fR‚&—2×f—6–&ÆR"“°¢Ð¢&WGW&ã°¢Ð¢–b†7F–öâÓÓÒ'&W6WBÖFVÖò"’°¢7FFRÒ6ÆöæR†&6U7FFR“°¢6VÆV7FVEv÷&´–BÒ7FFRçv÷&·5³Óòæ–BÇÂ"#°¢–b‚v—B6fU7FFR‚’’&WGW&âfÇ6S°¢6†÷uFö7B‚$&6Rö'&2&W7FW&Fâ"“°¢&VæFW"‚“°¢Ð§Ò“° ¦gVæ7F–öâ6ÆV$FVÖæDG&u7FFR‚’°¢6öç7BG&u7FFRÒFVÖæEö–çFW$G&u7FFS°¢–b†G&u7FFSòç67&öÆÄg&ÖR’6æ6VÄæ–ÖF–öäg&ÖR†G&u7FFRç67&öÆÄg&ÖR“°¢–b†G&u7FFSòæv†÷7Còæ—46öææV7FVB’G&u7FFRæv†÷7Bç&VÖ÷fR‚“°¢–b†G&u7FFSòæ6&BbbG&u7FFRçö–çFW$–BÓÒVæFVf–æVB’°¢G'’°¢–b†G&u7FFRæ6&Bæ†5ö–çFW$6GW&Sòâ†G&u7FFRçö–çFW$–B’’G&u7FFRæ6&Bç&VÆV6Uö–çFW$6GW&R†G&u7FFRçö–çFW$–B“°¢Ò6F6‚·Ð¢Ð¢Fö7VÖVçBæ&öG’æ6Æ74Æ—7Bç&VÖ÷fR‚&FVÖæBÖG&rÖ7F—fR"“°¢Fö7VÖVçBçVW'•6VÆV7F÷$ÆÂ‚"æFVÖæBÖ6&Bæ—2ÖG&vv–ær"’æf÷$V6‚‚†6&B’Óâ6&Bæ6Æ74Æ—7Bç&VÖ÷fR‚&—2ÖG&vv–ær"’“°¢Fö7VÖVçBçVW'•6VÆV7F÷$ÆÂ‚"æ÷W&F–öæÂÖ&ö&B×æVÂæ¶æ&âÖ6öÇVÖâ"’æf÷$V6‚‚†6öÇVÖâ’Óâ°¢6öÇVÖâæ6Æ74Æ—7Bç&VÖ÷fR‚&—2ÖG&rÖ÷fW""Â&—2ÖG&÷ÖVÆ–v–&ÆR"Â&—2ÖG&÷ÖF—6&ÆVB"“°¢Ò“°¢FVÖæEö–çFW$G&u7FFRÒçVÆÃ°§Ð ¦gVæ7F–öâFVÖæDG&uF&vWDB†6Æ–VçE‚Â6Æ–VçE’’°¢6öç7BG&u7FFRÒFVÖæEö–çFW$G&u7FFS°¢–b‚G&u7FFR’&WGW&âçVÆÃ°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒG&u7FFRæFVÖæD–B“°¢–b‚FVÖæB’&WGW&âçVÆÃ°¢6öç7B6öÇVÖâÒFö7VÖVç@¢æVÆVÖVçDg&öÕö–çB†6Æ–VçE‚Â6Æ–VçE’¢òæ6Æ÷6W7Còâ‚"æ÷W&F–öæÂÖ&ö&B×æVÂæ¶æ&âÖ6öÇVÖå¶FFÖ6öÇVÖåÒ"“°¢6öç7BÆÆ÷vVD6öÇVÖç2Ò6öÇVÖç4f÷$FVÖæB†FVÖæB“°¢Fö7VÖVçBçVW'•6VÆV7F÷$ÆÂ‚"æ÷W&F–öæÂÖ&ö&B×æVÂæ¶æ&âÖ6öÇVÖå¶FFÖ6öÇVÖåÒ"’æf÷$V6‚‚†6æF–FFR’Óâ°¢6öç7BF&vWBÒÆÆ÷vVD6öÇVÖç2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ6æF–FFRæFF6WBæ6öÇVÖâ“°¢6öç7BVÆ–v–&ÆRÒ&ööÆVâ‡F&vWBbbF&vWBæF—6&ÆVB“°¢6æF–FFRæ6Æ74Æ—7BçFövvÆR‚&—2ÖG&÷ÖVÆ–v–&ÆR"ÂVÆ–v–&ÆR“°¢6æF–FFRæ6Æ74Æ—7BçFövvÆR‚&—2ÖG&÷ÖF—6&ÆVB"ÂVÆ–v–&ÆR“°¢6æF–FFRæ6Æ74Æ—7BçFövvÆR‚&—2ÖG&rÖ÷fW""ÂVÆ–v–&ÆRbb6æF–FFRÓÓÒ6öÇVÖâ“°¢Ò“°¢6öç7BF&vWBÒÆÆ÷vVD6öÇVÖç2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ6öÇVÖãòæFF6WBæ6öÇVÖâ“°¢G&u7FFRçF&vWD6öÇVÖä–BÒ6öÇVÖâÇÂF&vWBÇÂF&vWBæF—6&ÆVBò""¢6öÇVÖâæFF6WBæ6öÇVÖã°¢&WGW&âG&u7FFRçF&vWD6öÇVÖä–Bò6öÇVÖâ¢çVÆÃ°§Ð ¦gVæ7F–öâFVÖæDG&t†÷&—¦öçFÅfVÆö6—G’†6Æ–VçE‚Â&ö&E&V7B’°¢6öç7BVFvRÒÖF‚æÖ–âƒÂÖF‚æÖ‚ƒcBÂ&ö&E&V7Bçv–GF‚¢ã"’“°¢–b†6Æ–VçE‚Â&ö&E&V7BæÆVgB²VFvR’°¢6öç7B&F–òÒÖF‚æÖ–âƒÂÖF‚æÖ‚ƒÂ†&ö&E&V7BæÆVgB²VFvRÒ6Æ–VçE‚’òVFvR’“°¢&WGW&âÒƒB²&F–ò¢#B“°¢Ð¢–b†6Æ–VçE‚â&ö&E&V7Bç&–v‡BÒVFvR’°¢6öç7B&F–òÒÖF‚æÖ–âƒÂÖF‚æÖ‚ƒÂ†6Æ–VçE‚Ò†&ö&E&V7Bç&–v‡BÒVFvR’’òVFvR’“°¢&WGW&âB²&F–ò¢#C°¢Ð¢&WGW&â°§Ð ¦gVæ7F–öâ÷6—F–öäFVÖæDG&tv†÷7B†6Æ–VçE‚Â6Æ–VçE’’°¢6öç7BG&u7FFRÒFVÖæEö–çFW$G&u7FFS°¢–b‚G&u7FFSòæv†÷7B’&WGW&ã°¢6öç7BÆVgBÒ6Æ–VçE‚ÒG&u7FFRæw&$öfg6WEƒ°¢6öç7BF÷Ò6Æ–VçE’ÒG&u7FFRæw&$öfg6WE“°¢G&u7FFRæv†÷7Bç7G–ÆRçG&ç6f÷&ÒÒ'G&ç6ÆFS6B‚"²ÆVgB²'‚Â"²F÷²'‚Â’#°§Ð ¦gVæ7F–öâ7F'DFVÖæDG&tWFõ67&öÆÂ‚’°¢6öç7BG&u7FFRÒFVÖæEö–çFW$G&u7FFS°¢–b‚G&u7FFSòæÖ÷fVBÇÂG&u7FFRç67&öÆÄg&ÖR’&WGW&ã°¢6öç7BF–6²Ò‚’Óâ°¢6öç7B7W'&VçBÒFVÖæEö–çFW$G&u7FFS°¢–b‚7W'&VçCòæÖ÷fVB’&WGW&ã°¢6öç7B&ö&BÒFö7VÖVçBçVW'•6VÆV7F÷"‚"æ÷W&F–öæÂÖ&ö&B×æVÂ¶FFÖ¶æ&â×67&öÆÂÖ&ö&EÒ"“°¢–b†&ö&B’°¢6öç7BfVÆö6—G’ÒFVÖæDG&t†÷&—¦öçFÅfVÆö6—G’†7W'&VçBæÆ7E‚Â&ö&BævWD&÷VæF–æt6Æ–VçE&V7B‚’“°¢–b‡fVÆö6—G’’°¢&ö&Bç67&öÆÄÆVgB³ÒfVÆö6—G“°¢FVÖæDG&uF&vWDB†7W'&VçBæÆ7E‚Â7W'&VçBæÆ7E’“°¢Ð¢Ð¢7W'&VçBç67&öÆÄg&ÖRÒ&WVW7Dæ–ÖF–öäg&ÖR‡F–6²“°¢Ó°¢G&u7FFRç67&öÆÄg&ÖRÒ&WVW7Dæ–ÖF–öäg&ÖR‡F–6²“°§Ð ¦gVæ7F–öâ7F—fFTFVÖæEö–çFW$G&r†WfVçB’°¢6öç7BG&u7FFRÒFVÖæEö–çFW$G&u7FFS°¢–b‚G&u7FFRÇÂG&u7FFRæÖ÷fVB’&WGW&ã°¢G&u7FFRæÖ÷fVBÒG'VS°¢G&u7FFRæÆ7E‚ÒWfVçBæ6Æ–VçEƒ°¢G&u7FFRæÆ7E’ÒWfVçBæ6Æ–VçE“°¢6öç7B&V7BÒG&u7FFRæ6&BævWD&÷VæF–æt6Æ–VçE&V7B‚“°¢G&u7FFRæw&$öfg6WE‚ÒWfVçBæ6Æ–VçE‚Ò&V7BæÆVgC°¢G&u7FFRæw&$öfg6WE’ÒWfVçBæ6Æ–VçE’Ò&V7BçF÷°¢6öç7Bv†÷7BÒG&u7FFRæ6&Bæ6ÆöæTæöFR‡G'VR“°¢v†÷7Bæ6Æ74Æ—7Bç&VÖ÷fR‚&—2ÖG&vv–ær"“°¢v†÷7Bæ6Æ74Æ—7BæFB‚&FVÖæBÖG&rÖv†÷7B"“°¢v†÷7Bç&VÖ÷fTGG&–'WFR‚'&öÆR"“°¢v†÷7Bç&VÖ÷fTGG&–'WFR‚'F&–æFW‚"“°¢v†÷7Bç7G–ÆRçv–GF‚Ò&V7Bçv–GF‚²'‚#°¢v†÷7Bç7G–ÆRæ†V–v‡BÒ&V7Bæ†V–v‡B²'‚#°¢Fö7VÖVçBæ&öG’æVæD6†–ÆB†v†÷7B“°¢G&u7FFRæv†÷7BÒv†÷7C°¢G&u7FFRæ6&Bæ6Æ74Æ—7BæFB‚&—2ÖG&vv–ær"“°¢Fö7VÖVçBæ&öG’æ6Æ74Æ—7BæFB‚&FVÖæBÖG&rÖ7F—fR"“°¢G'’²G&u7FFRæ6&Bç6WEö–çFW$6GW&Sòâ†G&u7FFRçö–çFW$–B“²Ò6F6‚·Ð¢÷6—F–öäFVÖæDG&tv†÷7B†WfVçBæ6Æ–VçE‚ÂWfVçBæ6Æ–VçE’“°¢FVÖæDG&uF&vWDB†WfVçBæ6Æ–VçE‚ÂWfVçBæ6Æ–VçE’“°¢7F'DFVÖæDG&tWFõ67&öÆÂ‚“°§Ð ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚'ö–çFW&F÷vâ"Â†WfVçB’Óâ°¢–b†WfVçBçö–çFW%G—RÓÓÒ&Ö÷W6R"bbWfVçBæ'WGFöâÓÒ’&WGW&ã°¢6öç7B6&BÒWfVçBçF&vWBæ6Æ÷6W7Còâ‚"æ÷W&F–öæÂÖ&ö&B×æVÂæFVÖæBÖ6&E¶FFÖ–EÒ"“°¢–b‚6&BÇÂWfVçBçF&vWBæ6Æ÷6W7Còâ‚&'WGFöâÂ–çWBÂ6VÆV7BÂFW‡F&VÂ"’’&WGW&ã°¢6öç7B†æFÆRÒWfVçBçF&vWBæ6Æ÷6W7Còâ‚%¶FFÖFVÖæBÖG&rÖ†æFÆUÒ"“°¢–b†WfVçBçö–çFW%G—RÓÓÒ'F÷V6‚"bb†æFÆR’&WGW&ã°¢–b‚6ä×WFFUT’‚'WFFRÖFVÖæB×7FGW2"’’°¢6†÷uFö7B‚%6WR6W76òW&Ö—FRVæ26öç7VÇFâ"“°¢&WGW&ã°¢Ð¢6öç7B&V7BÒ6&BævWD&÷VæF–æt6Æ–VçE&V7B‚“°¢FVÖæEö–çFW$G&u7FFRÒ°¢FVÖæD–C¢6&BæFF6WBæ–BÇÂ""À¢6&BÀ¢ö–çFW$–C¢WfVçBçö–çFW$–BÀ¢ö–çFW%G—S¢WfVçBçö–çFW%G—RÀ¢7F'Eƒ¢WfVçBæ6Æ–VçE‚À¢7F'E“¢WfVçBæ6Æ–VçE’À¢Æ7Eƒ¢WfVçBæ6Æ–VçE‚À¢Æ7E“¢WfVçBæ6Æ–VçE’À¢w&$öfg6WEƒ¢WfVçBæ6Æ–VçE‚Ò&V7BæÆVgBÀ¢w&$öfg6WE“¢WfVçBæ6Æ–VçE’Ò&V7BçF÷À¢F&vWD6öÇVÖä–C¢""À¢v†÷7C¢çVÆÂÀ¢67&öÆÄg&ÖS¢çVÆÂÀ¢Ö÷fVC¢fÇ6RÀ¢Ó°¢–b†WfVçBçö–çFW%G—RÓÓÒ'F÷V6‚"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢G'’²6&Bç6WEö–çFW$6GW&Sòâ†WfVçBçö–çFW$–B“²Ò6F6‚·Ð¢Ð§Ò“° ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚'ö–çFW&Ö÷fR"Â†WfVçB’Óâ°¢6öç7BG&u7FFRÒFVÖæEö–çFW$G&u7FFS°¢–b‚G&u7FFRÇÂWfVçBçö–çFW$–BÓÒG&u7FFRçö–çFW$–B’&WGW&ã°¢–b†WfVçBçö–çFW%G—RÓÓÒ&Ö÷W6R"bb†WfVçBæ'WGFöç2b’’°¢6ÆV$FVÖæDG&u7FFR‚“°¢&WGW&ã°¢Ð¢G&u7FFRæÆ7E‚ÒWfVçBæ6Æ–VçEƒ°¢G&u7FFRæÆ7E’ÒWfVçBæ6Æ–VçE“°¢6öç7BG‚ÒWfVçBæ6Æ–VçE‚ÒG&u7FFRç7F'Eƒ°¢6öç7BG’ÒWfVçBæ6Æ–VçE’ÒG&u7FFRç7F'E“°¢–b‚G&u7FFRæÖ÷fVBbbÖF‚æ‡—÷B†G‚ÂG’’Â†WfVçBçö–çFW%G—RÓÓÒ'F÷V6‚"òB¢r’’&WGW&ã°¢–b‚G&u7FFRæÖ÷fVB’7F—fFTFVÖæEö–çFW$G&r†WfVçB“°¢WfVçBç&WfVçDFVfVÇB‚“°¢÷6—F–öäFVÖæDG&tv†÷7B†WfVçBæ6Æ–VçE‚ÂWfVçBæ6Æ–VçE’“°¢FVÖæDG&uF&vWDB†WfVçBæ6Æ–VçE‚ÂWfVçBæ6Æ–VçE’“°§Ò“° ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚'ö–çFW'W"Â7–æ2†WfVçB’Óâ°¢6öç7BG&u7FFRÒFVÖæEö–çFW$G&u7FFS°¢–b‚G&u7FFRÇÂWfVçBçö–çFW$–BÓÒG&u7FFRçö–çFW$–B’&WGW&ã°¢–b†G&u7FFRæÖ÷fVB’FVÖæDG&uF&vWDB†WfVçBæ6Æ–VçE‚ÂWfVçBæ6Æ–VçE’“°¢6öç7B²FVÖæD–BÂF&vWD6öÇVÖä–BÂÖ÷fVBÒÒG&u7FFS°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒFVÖæD–B“°¢6öç7B&Wf–÷W46öÇVÖä–BÒFVÖæCòæ6öÇVæÇÂ"#°¢6öç7B&W6öÇfVEF&vWBÒFVÖæ@¢ò6öÇVÖç4f÷$FVÖæB†FVÖæB’æf–æB‚†6öÇVÖâ’Óâ6öÇVÖâæ–BÓÓÒF&vWD6öÇVÖä–B¢¢çVÆÃ°¢6ÆV$FVÖæDG&u7FFR‚“°¢–b‚Ö÷fVB’&WGW&ã°¢FVÖæDG&u7W&W746Æ–6µVçF–ÂÒFFRææ÷r‚’²#°¢WfVçBç&WfVçDFVfVÇB‚“°¢–b‚FVÖæBÇÂ&W6öÇfVEF&vWBÇÂ&W6öÇfVEF&vWBæF—6&ÆVBÇÂ&Wf–÷W46öÇVÖä–BÓÓÒF&vWD6öÇVÖä–B’&WGW&ã°¢6öç7BWFFVBÒv—BWFFTFVÖæD6öÇVÖâ†FVÖæD–BÂF&vWD6öÇVÖä–B“°¢–b‚WFFVB’&WGW&ã°¢&VæFW"‚“°¢6†÷uFö7B‚$6&BÖ÷f–Fò&"²FVÖæE7FGW4Æ&VÂ‡WFFVB’²"â"“°§Ò“° ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚'ö–çFW&6æ6VÂ"Â6ÆV$FVÖæDG&u7FFR“° ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&¶W–F÷vâ"Â†WfVçB’Óâ°¢–b†WfVçBçF&vWBæÖF6†W2‚rç÷'FföÆ–ò×v÷&²×&÷rr’bb²$VçFW""Â"%Òæ–æ6ÇVFW2†WfVçBæ¶W’’’°¢WfVçBç&WfVçDFVfVÇB‚“°¢WfVçBçF&vWBæ6Æ–6²‚“°¢&WGW&ã°¢Ð¢–b†—5FW‡DVF—F–æuF&vWB†WfVçBçF&vWB’’&WGW&ã°¢6öç7BÖöGVÆT6&BÒWfVçBçF&vWBæ6Æ÷6W7B‚u·&öÆSÒ&'WGFöâ%Õ¶FF×f–WuÒÂ·&öÆSÒ&'WGFöâ%Õ¶FFÖ7F–öåÒr“°¢–b‚ÖöGVÆT6&BÇÂ²$VçFW""Â"%Òæ–æ6ÇVFW2†WfVçBæ¶W’’’&WGW&ã°¢WfVçBç&WfVçDFVfVÇB‚“°¢–b†ÖöGVÆT6&BæFF6WBçf–Wr’6WEf–Wr†ÖöGVÆT6&BæFF6WBçf–Wr“°¢VÇ6RÖöGVÆT6&Bæ6Æ–6²‚“°§Ò“° ¦gVæ7F–öâ—5FW‡DVF—F–æuF&vWB‡F&vWB’°¢–b‚F&vWBÇÂF&vWBææöFUG—RÓÒ’&WGW&âfÇ6S°¢6öç7BFtæÖRÒF&vWBçFtæÖS°¢–b…²$”åUB"Â%DU…D$T"Â%4TÄT5B%Òæ–æ6ÇVFW2‡FtæÖR’’&WGW&âG'VS°¢&WGW&â&ööÆVâ‡F&vWBæ6Æ÷6W7Còâ‚u¶6öçFVçFVF—F&ÆSÒ'G'VR%ÒÂ¶6öçFVçFVF—F&ÆSÒ"%Òr’“°§Ð ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&6†ævR"Â7–æ2†WfVçB’Óâ°¢–b†WfVçBçF&vWBæÖF6†W2‚rç7&–çB×–6¶W"–çWE¶æÖSÒ'7&–çD–B%Òr’’°¢&Vg&W6…7&–çE–6¶W"†WfVçBçF&vWBæ6Æ÷6W7B‚&f÷&Ò"’“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚r6FVÖæEv—¦&E7FW¶æÖSÒ&FF&Wf—7F–æ–6–ò%ÒÂ6FVÖæEv—¦&E7FW¶æÖSÒ&FF&Wf—7FVçG&Vv%Òr’’°¢6öç7Bf÷&ÒÒWfVçBçF&vWBæ6Æ÷6W7B‚"6FVÖæEv—¦&E7FW"“°¢7VvvW7E7&–çG4–äFVÖæDf÷&Ò†f÷&ÒÂf÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ&FF&Wf—7F–æ–6–ò%Òr“òçfÇVRÂf÷&ÒçVW'•6VÆV7F÷"‚u¶æÖSÒ&FF&Wf—7FVçG&Vv%Òr“òçfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚r6FVÖæDf÷&Òç6–2ÖFVÖæBÖ6&B¶æÖSÒ&FF&Wf—7FVçG&Vv%Òr’’°¢6öç7Bf÷&ÒÒWfVçBçF&vWBæ6Æ÷6W7B‚"6FVÖæDf÷&Ò"“°¢7VvvW7E7&–çG4–äFVÖæDf÷&Ò†f÷&ÒÂFöF”•4ò‚’ÂWfVçBçF&vWBçfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚r76–4F—&V7F÷$FV6—6–öäf÷&Ò¶æÖSÒ&F—&V7F÷%fÇVTFV6—6–öâ%Òr’’°¢6öç7Bf÷&ÒÒWfVçBçF&vWBæ6Æ÷6W7B‚"76–4F—&V7F÷$FV6—6–öäf÷&Ò"“°¢6öç7B&Wf—6VDf–VÆBÒf÷&ÓòçVW'•6VÆV7F÷"‚"ç6–2×&Wf—6VB×fÇVRÖf–VÆB"“°¢6öç7B&Wf—6VD–çWBÒ&Wf—6VDf–VÆCòçVW'•6VÆV7F÷"‚u¶æÖSÒ'6–4F—&V7F÷$Ö÷VçB%Òr“°¢6öç7B&Wf—6VBÒWfVçBçF&vWBçfÇVRÓÓÒ'&Wf—6R#°¢–b‡&Wf—6VDf–VÆB’&Wf—6VDf–VÆBæ†–FFVâÒ&Wf—6VC°¢–b‡&Wf—6VD–çWB’&Wf—6VD–çWBç&WV—&VBÒ&Wf—6VC°¢–b‡&Wf—6VB’&Wf—6VD–çWCòæfö7W2‚“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚r76–4F—&V7F÷%VWVTf÷&Ò¶æÖSÒ&&÷fÅvVV´–B%ÒÂ76–4F—&V7F÷%VWVTf÷&Ò¶æÖSÒ&&÷fÄ6&D–B%Òr’’°¢&Vg&W6…6–4F—&V7F÷%VWVTf÷&Ò†WfVçBçF&vWBæ6Æ÷6W7B‚"76–4F—&V7F÷%VWVTf÷&Ò"’“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚r6FVÖæDFWF–Äf÷&Ò¶æÖSÒ&6öÇVæ%Òr’’°¢6öç7Bf÷&ÒÒWfVçBçF&vWBæ6Æ÷6W7B‚"6FVÖæDFWF–Äf÷&Ò"“°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒf÷&ÓòæFF6WBæ–B“°¢6öç7Bf–VÆBÒf÷&ÓòçVW'•6VÆV7F÷"‚%¶FFÖFVÖæB×7FGW2×&V6öâÖf–VÆEÒ"“°¢6öç7BFW‡F&VÒf–VÆCòçVW'•6VÆV7F÷"‚u¶æÖSÒ'7FGW5&V6öâ%Òr“°¢6öç7BÆ&VÂÒf–VÆCòçVW'•6VÆV7F÷"‚%¶FFÖFVÖæB×7FGW2×&V6öâÖÆ&VÅÒ"“°¢6öç7B6VÆV7FVBÒWfVçBçF&vWBçfÇVS°¢–b€¢FVÖæEG—T¶W’†FVÖæCòçF—ò’ÓÓÒ%4”2 ¢bbFVÖæCòæ6öÇVæÓÓÒ'fÆ–FFôö'&2 ¢bb6VÆV7FVBÓÓÒ&&÷f6ôF—&WF÷&– ¢bb6äGfæ6U6–5FôF—&V7F÷$&÷fÂ‚¢’°¢6†÷uFö7B‚%6öÖVçFRW7\:&–÷2vW7F÷"÷RFÖ–âöFVÒÖ÷fW"VÖ4”2FRfÆ–FFòö'&2&wV&FæFò&÷f:|:6òF—&WF÷&–â"“°¢WfVçBçF&vWBçfÇVRÒFVÖæBæ6öÇVæ°¢&WGW&ã°¢Ð¢–b€¢FVÖæEG—T¶W’†FVÖæCòçF—ò’ÓÓÒ%4”2 ¢bb6VÆV7FVBÓÓÒ&6öæ6ÇV–Fò ¢bbFVÖæCòæ6öÇVæÓÒ&&÷fFôF—&WF÷&– ¢bbFVÖæCòæ6öÇVæÓÒ'fÆ–FFôö'&2 ¢’°¢6†÷uFö7B€¢FVÖæCòæ6öÇVæÓÓÒ&&÷f6ôF—&WF÷&– ¢ò6åv—fU6–4F—&V7F÷$&÷fÂ‚¢ò%W6R(	ÄF—7Vç6"F—&WF÷&–R6öæ6ÇV—.(	Ò&&Vv—7G&"W†6\:|:6òçFW2FR6öæ6ÇV—"W7F4”2â ¢¢$W7F4”2&V6—66W"&÷fFVÆF—&WF÷&–çFW2FR—"&6öæ6Ç\:ÖFòâ ¢¢%VÖ4”2<;2öFR6W"6öæ6Ç\:ÖFFWö—2FRW7F"VÒ&÷fFòF—&WF÷&–â ¢“°¢WfVçBçF&vWBçfÇVRÒFVÖæBæ6öÇVæ°¢&WGW&ã°¢Ð¢6öç7B&WV—&VBÒ²'W6Fò"Â&6æ6VÆFò%Òæ–æ6ÇVFW2‡6VÆV7FVB“°¢–b†f–VÆB’f–VÆBæ†–FFVâÒ&WV—&VC°¢–b‡FW‡F&V’°¢FW‡F&Vç&WV—&VBÒ&WV—&VC°¢FW‡F&VçÆ6V†öÆFW"Ò6VÆV7FVBÓÓÒ&6æ6VÆFò"ò$W‡Æ—VR÷"VRW7FFVÖæFW7L:6VæFò6æ6VÆFâââ"¢$W‡Æ—VR÷"VRW7FFVÖæFW7L:6VæFòW6Fâââ#°¢FW‡F&VçfÇVRÒ&WV—&VBbbFVÖæCòæ6öÇVæÓÓÒ6VÆV7FVBòFVÖæE7FGW5&V6öâ†FVÖæBÂ6VÆV7FVB’¢"#°¢Ð¢–b†Æ&VÂ’Æ&VÂçFW‡D6öçFVçBÒFVÖæE7FGW5&V6öäÆ&VÂ‡6VÆV7FVB“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖFVÖæBÖæÇ—7BÖ÷F–öåÒ"’’°¢WFFTFVÖæDæÇ—7E6VÆV7F÷"†WfVçBçF&vWB“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×7G&FVv–2ÖFV6—6–öâÖf–ÇFW%Ò"’’°¢7G&FVv–4UdFV6—6–öäf–ÇFW'5¶WfVçBçF&vWBæFF6WBç7G&FVv–4FV6—6–öäf–ÇFW%ÒÒWfVçBçF&vWBçfÇVS°¢6WEF–ÖV÷WB‚‚’Óâ&VæFW"‚’Â3“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×7G&FVv–2ÖWbÖf–ÇFW%Ò"’’°¢7G&FVv–4Udf–ÇFW'5¶WfVçBçF&vWBæFF6WBç7G&FVv–4Wdf–ÇFW%ÒÒWfVçBçF&vWBçfÇVS°¢&VæFW"‚“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×7G&FVv–2Ö†—7F÷'’Öf–ÇFW%Ò"’’°¢6öç7B¶W’ÒWfVçBçF&vWBæFF6WBç7G&FVv–4†—7F÷'”f–ÇFW#°¢–b„ö&¦V7Bç&÷F÷G—Ræ†4÷vå&÷W'G’æ6ÆÂ‡7G&FVv–4†—7F÷&–6Äf–ÇFW'2Â¶W’’’°¢7G&FVv–4†—7F÷&–6Äf–ÇFW'5¶¶W•ÒÒWfVçBçF&vWBçfÇVS°¢&VæFW"‚“°¢Ð¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚u¶æÖSÒ'W&f–Â%Òr’bbWfVçBçF&vWBæ6Æ÷6W7B‚"7W6W$f÷&Ò"’’°¢6öç7Bf÷&ÒÒWfVçBçF&vWBæ6Æ÷6W7B‚"7W6W$f÷&Ò"“°¢6öç7BFVfVÇG2ÒæWr6WB†FVfVÇD66W74ÖöGVÆW4f÷%&öf–ÆR†WfVçBçF&vWBçfÇVR’“°¢f÷&ÒçVW'•6VÆV7F÷$ÆÂ‚v–çWE¶æÖSÒ&66W74ÖöGVÆW2%Òr’æf÷$V6‚‚†–çWB’Óâ°¢–çWBæ6†V6¶VBÒFVfVÇG2æ†2†–çWBçfÇVR“°¢Ò“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×&ö¦V7BÖFVÖæB×G—UÒ"’’°¢÷Vå&ö¦V7DFVÖæDÖöFÂ†WfVçBçF&vWBçfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚u¶FFÖ7F–öãÒ'6VÆV7B×v÷&²%Òr’’°¢6VÆV7FVEv÷&´–BÒWfVçBçF&vWBçfÇVS°¢&VæFW"‚“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚u¶FFÖ7F–öãÒ'WFFRÖÖ–çFVææ6R×7FGW2%Òr’’°¢6öç7B—FVÒÒv—BWFFTÖ–çFVææ6TFVÖæE†6R†WfVçBçF&vWBæFF6WBæ–BÂWfVçBçF&vWBçfÇVR“°¢–b†—FVÒÓÓÒfÇ6R’&WGW&ã°¢6öç7B&÷‚ÒWfVçBçF&vWBæ6Æ÷6W7B‚"æFVÖæB×7FGW2Ö&÷‚"“°¢–b†&÷‚bb—FVÒ’&÷‚æFF6WBç7FGW2Ò—FVÒæ6öÇVæ°¢&VæFW"‚“°¢–b†—FVÒ’6†÷uFö7B†6&BÖ÷f–Fò&G¶Ö–çFVææ6U7FGW4Æ&VÂ†—FVÒ—Òæ“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚u¶FFÖ7F–öãÒ'WFFRÖÖ–çFVææ6R×7&–çB%Òr’’°¢6öç7B—FVÒÒÖ–çFVææ6T—FV×2‚’æf–æB‚†VçG'’’ÓâVçG'’æ–BÓÓÒWfVçBçF&vWBæFF6WBæ–B“°¢–b‚—FVÒ’&WGW&ã°¢6öç7B&Wf–÷W57&–çBÒÖ–çFVææ6U7&–çDæÖR†—FVÒ“°¢6öç7BæW‡E7&–çBÒ7&–çD'”–B†WfVçBçF&vWBçfÇVR“°¢6öç7BæW‡E7&–çDæÖRÒæW‡E7&–çCòææöÖRÇÂ%6VÒ7&–çB#°¢–b†Ö–çFVææ6U7&–çD–B†—FVÒ’ÓÓÒ†æW‡E7&–çCòæ–BÇÂ""’bb&Wf–÷W57&–çBÓÓÒæW‡E7&–çDæÖR’&WGW&ã°¢—FVÒç7&–çD–BÒæW‡E7&–çCòæ–BÇÂ"#°¢—FVÒç7&–çBÒæW‡E7&–çDæÖS°¢—FVÒçWFFVDBÒFöF”•4ò‚“°¢—FVÒæ†—7F÷&–6òÒ°¢âââ†—FVÒæ†—7F÷&–6òÇÂµÒ’À¢²f6S¢%7&–çB"ÂFF¢FöF”•4ò‚’Âö'6W'f6ó¢7&–çBÇFW&FFRG·&Wf–÷W57&–çGÒ&G¶æW‡E7&–çDæÖWÒæÒÀ¢Ó°¢FD†—7F÷'’‡°¢VçF–FFS¢Ö–çFVææ6TÖöGVÆTÆ&VÇ2‚’æ—46Æ–æ–6Âò&6Æ–æ–6"¢&ÖçWFVæ6ò"À¢VçF–FFT–C¢—FVÒæ–BÀ¢6×ó¢'7&–çB"À¢fÆ÷$çFW&–÷#¢&Wf–÷W57&–çBÀ¢fÆ÷$æ÷fó¢æW‡E7&–çDæÖRÀ¢Ò“°¢–b‚v—B6fU7FFR‚’’&WGW&âfÇ6S°¢&VæFW"‚“°¢÷VäÖ–çFVææ6T6&DÖöFÂ†—FVÒæ–B“°¢6†÷uFö7B†7&–çBFò6&BGVÆ—¦F&G¶æW‡E7&–çDæÖWÒæ“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖÖ–çFVææ6RÖW‡Vç6R×6VÆV7EÒ"’’°¢7–æ4Ö–çFVææ6TæVv÷F–FVDf–VÆB†WfVçBçF&vWBæ6Æ÷6W7B‚&f÷&Ò"’“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚u¶FFÖ7F–öãÒ&6öçG&7B×v÷&²×6VÆV7B%Òr’’°¢6öç7B6VÆV7BÒFö7VÖVçBçVW'•6VÆV7F÷"‚"66öçG&7DF—66—Æ–æU6VÆV7B"“°¢–b‡6VÆV7B’6VÆV7Bæ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ†6öçG&7DF—66—Æ–æT÷F–öç2†WfVçBçF&vWBçfÇVR’“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚u¶FFÖ7F–öãÒ&76–vâÖæÇ—7B%Òr’’°¢6öç7BFVÖæBÒ7FFRæFVÖæG2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒWfVçBçF&vWBæFF6WBæ–B“°¢–b‚FVÖæB’&WGW&ã°¢6öç7B&Wf–÷W2ÒFVÖæBææÆ—7F&W7öç6fVÂÇÂ$FVf–æ—"#°¢FVÖæBææÆ—7F&W7öç6fVÂÒWfVçBçF&vWBçfÇVS°¢FD†—7F÷'’‡°¢VçF–FFS¢&FVÖæF"À¢VçF–FFT–C¢FVÖæBæ–BÀ¢6×ó¢&æÆ—7F&W7öç6fVÂ"À¢fÆ÷$çFW&–÷#¢&Wf–÷W2À¢fÆ÷$æ÷fó¢FVÖæBææÆ—7F&W7öç6fVÂÇÂ$FVf–æ—""À¢Ò“°¢–b‚v—B6fU7FFR‚’’&WGW&âfÇ6S°¢&VæFW"‚“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖ÷W&F–öæÂÖf–ÇFW%Ò"’’°¢6öç7B¶W’ÒWfVçBçF&vWBæFF6WBæ÷W&F–öæÄf–ÇFW#°¢6öç7B6VÆV7FVBÒæWr6WB†÷W&F–öæÄf–ÇFW%fÇVW2†¶W’’“°¢–b†WfVçBçF&vWBæ6†V6¶VB’6VÆV7FVBæFB†WfVçBçF&vWBçfÇVR“°¢VÇ6R6VÆV7FVBæFVÆWFR†WfVçBçF&vWBçfÇVR“°¢÷W&F–öæÄf–ÇFW'5¶¶W•ÒÒ²ââç6VÆV7FVEÓ°¢–b†¶W’ÓÓÒ'7FGW2"’÷W&F–öæÄf–ÇFW'2çfÆ–FF–öäw&÷WÒfÇ6S°¢&VæFW"‚“°¢Fö7VÖVçBçVW'•6VÆV7F÷"†¶FFÖ÷W&F–öæÂÖf–ÇFW"Öw&÷WÒ"G¶¶W—Ò%Ö“òç6WDGG&–'WFR‚&÷Vâ"Â""“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖ÷W&F–öæÂÖFFRÖf–ÇFW%Ò"’’°¢6öç7B¶W’ÒWfVçBçF&vWBæFF6WBæ÷W&F–öæÄFFTf–ÇFW#°¢–b…²&FFTg&öÒ"Â&FFUFò%Òæ–æ6ÇVFW2†¶W’’’°¢÷W&F–öæÄf–ÇFW'5¶¶W•ÒÒWfVçBçF&vWBçfÇVRÇÂ"#°¢&VæFW"‚“°¢Ð¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×&ö¦V7B×ÆâÖf–ÇFW%Ò"’’°¢&ö¦V7EÆäf–ÇFW'5¶WfVçBçF&vWBæFF6WBç&ö¦V7EÆäf–ÇFW%ÒÒWfVçBçF&vWBçfÇVS°¢&VæFW"‚“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×&ö¦V7BÖ÷W&F–öæÂÖf–ÇFW%Ò"’’°¢&ö¦V7D÷W&F–öæÄf–ÇFW'5¶WfVçBçF&vWBæFF6WBç&ö¦V7D÷W&F–öæÄf–ÇFW%ÒÒWfVçBçF&vWBçfÇVS°¢&VæFW"‚“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖÖ–çFVææ6RÖf–ÇFW%Ò"’’°¢6öç7Bf–ÇFW'2ÒÖ–çFVææ6Tf–ÇFW'4f÷$7F—fTÖöGVÆR‚“°¢f–ÇFW'5¶WfVçBçF&vWBæFF6WBæÖ–çFVææ6Tf–ÇFW%ÒÒWfVçBçF&vWBçfÇVS°¢&VæFW"‚“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖ'VFvWBÖf–ÇFW%Ò"’’°¢'VFvWDf–ÇFW'5¶WfVçBçF&vWBæFF6WBæ'VFvWDf–ÇFW%ÒÒWfVçBçF&vWBçfÇVS°¢'VFvWEG&ç6fW$6†V6²ÒçVÆÃ°¢&VæFW"‚“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×G&ç6fW"ÖÖöçF‚Öf–ÇFW%Ò"’’°¢G&ç6fW$ÖöçF„f–ÇFW"ÒWfVçBçF&vWBçfÇVS°¢G&ç6fW$ÆÅvRÒ°¢G&ç6fW$æWEvRÒ°¢&VæFW"‚“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×÷'FföÆ–ò×V–6²Öf–ÇFW%Ò"’’°¢÷'FföÆ–õV–6´f–ÇFW'5¶WfVçBçF&vWBæFF6WBç÷'FföÆ–õV–6´f–ÇFW%ÒÒWfVçBçF&vWBçfÇVS°¢&VæFW"‚“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖ–çfW7FÖVçB×ÆâÖf–ÇFW%Ò"’’°¢–çfW7FÖVçEÆäf–ÇFW'5¶WfVçBçF&vWBæFF6WBæ–çfW7FÖVçEÆäf–ÇFW%ÒÒWfVçBçF&vWBçfÇVS°¢&VæFW"‚“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖWbÖ†—7F÷'’Öf–ÇFW%Ò"’’°¢Wd†—7F÷&–6Äf–ÇFW'5¶WfVçBçF&vWBæFF6WBæWd†—7F÷'”f–ÇFW%ÒÒWfVçBçF&vWBçfÇVS°¢&VæFW"‚“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×6ÇBÖ–æ62×W&–öEÒ"’’°¢6ÇD”ä446Æ7VÆF÷"æ&6UW&–öBÒWfVçBçF&vWBçfÇVS°¢WFFU4ÅD”ä45&W7VÇG2‚“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚"æWb×7FGW2×6VÆV7B"’’°¢6öç7B&÷rÒWfVçBçF&vWBæ6Æ÷6W7B‚"æWbÖÆ–æR×&÷r"“°¢6öç7B–çWBÒ&÷sòçVW'•6VÆV7F÷"‚"æWb×fÇVRÖ–çWB"“°¢6öç7B—4äÒWfVçBçF&vWBçfÇVRÓÓÒ$ì:6ò6RÆ–6#°¢WfVçBçF&vWBæFF6WBç7FGW2ÒWfVçBçF&vWBçfÇVS°¢&÷sòæ6Æ74Æ—7BçFövvÆR‚&—2Öæ÷BÖÆ–6&ÆR"Â—4ä“°¢–b†–çWB’°¢–çWBæF—6&ÆVBÒ—4ä°¢–b†—4ä’–çWBçfÇVRÒ#Ã#°¢Ð¢WFFTUd&V&Wf–Wr†WfVçBçF&vWBæ6Æ÷6W7B‚"6Wdf÷&Ò"’“°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖf–ÇFW"Öf–VÆEÒ"’’°¢÷'FföÆ–ôf–ÇFW'5¶WfVçBçF&vWBæFF6WBæf–ÇFW$f–VÆEÒÒWfVçBçF&vWBçfÇVS°¢&VæFW"‚“°¢Ð§Ò“° ¦ÆWBÆ7DæF—fUfÆ–FF–öäæ÷F–6RÒ²¶W“¢""ÂC¢Ó° ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"€¢&–çfÆ–B"À¢†WfVçB’Óâ°¢6öç7Bf–VÆBÒWfVçBçF&vWC°¢6öç7Bf÷&ÒÒf–VÆCòæ6Æ÷6W7Còâ‚&f÷&Ò"“°¢–b‚f÷&ÒÇÂf÷&Òæ–BÓÓÒ&†FV4f÷&Ò"’&WGW&ã°¢WfVçBç&WfVçDFVfVÇB‚“°¢6öç7B¶W’ÒG¶f÷&Òæ–BÇÂ&f÷&Ò'Ó¢G¶f–VÆBææÖRÇÂf–VÆBæ–BÇÂf–VÆBçFtæÖWÖ°¢6öç7Bæ÷rÒFFRææ÷r‚“°¢–b†Æ7DæF—fUfÆ–FF–öäæ÷F–6Ræ¶W’ÓÓÒ¶W’bbæ÷rÒÆ7DæF—fUfÆ–FF–öäæ÷F–6RæBÂ“’&WGW&ã°¢Æ7DæF—fUfÆ–FF–öäæ÷F–6RÒ²¶W’ÂC¢æ÷rÓ°¢6†÷tf÷&ÔW'&÷"†æF—fUfÆ–FF–öäÖW76vR†f–VÆB’Âf÷&Ò“°¢f–VÆBæ6Æ74Æ—7BæFB‚&—2Öf–VÆBÖÆW'B"“°¢6WEF–ÖV÷WB‚‚’Óâf–VÆBæ6Æ74Æ—7Bç&VÖ÷fR‚&—2Öf–VÆBÖÆW'B"’Â##“°¢6WEF–ÖV÷WB‚‚’Óâf–VÆBæfö7W3òâ‡²&WfVçE67&öÆÃ¢fÇ6RÒ’Â“°¢ÒÀ¢G'VP¢“° ¦gVæ7F–öâ7–æ4Ö–çFVææ6TæVv÷F–FVDf–VÆB†f÷&Ò’°¢–b‚f÷&Ò’&WGW&ã°¢6öç7B6VÆV7BÒf÷&ÒçVW'•6VÆV7F÷"‚%¶FFÖÖ–çFVææ6RÖW‡Vç6R×6VÆV7EÒ"“°¢6öç7Bf–VÆBÒf÷&ÒçVW'•6VÆV7F÷"‚%¶FFÖÖ–çFVææ6RÖæVv÷F–FVBÖf–VÆEÒ"“°¢6öç7B–çWBÒf–VÆCòçVW'•6VÆV7F÷"‚v–çWE¶æÖSÒ'fÆ÷$æVvö6–Fò%Òr“°¢6öç7B6†÷rÒæ÷&ÖÆ—¦U6V&6…FW‡B‡6VÆV7CòçfÇVRÇÂ""’æ–æ6ÇVFW2‚&6W‚"“°¢–b†f–VÆB’f–VÆBæ†–FFVâÒ6†÷s°¢–b†–çWB’°¢–çWBæF—6&ÆVBÒ6†÷s°¢–b‚6†÷r’–çWBçfÇVRÒ"#°¢Ð§Ð ¦gVæ7F–öâ†4FVÖæE7V&Ö—Df–VÆG2†f÷&Ò’°¢–b‚f÷&ÒÇÂf÷&ÒçFtæÖRÓÒ$dõ$Ò"’&WGW&âfÇ6S°¢&WGW&âFVÖæDf÷&ÕVW'”¶W—2ç6öÖR‚†¶W’’Óâ&ööÆVâ†f÷&ÒæVÆVÖVçG3òå¶¶W•Ò’“°§Ð ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚'7V&Ö—B"Â7–æ2†WfVçB’Óâ°¢–b‚vÆö&ÅF†—2å4ÅEô4ÄõTBæ6åw&—FR†FFT”ÖöGVÆTf÷%f–Wr†7W'&VçEf–Wr’’’°¢WfVçBç&WfVçDFVfVÇB‚“°¢6†÷uFö7B‚%6WR6W76òW&Ö—FRVæ26öç7VÇFæW7F:&Vâ"“°¢&WGW&ã°¢Ð ¢–b†WfVçBçF&vWBæ–BÓÓÒ&†FV4f÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢6öç7BVW7F–öâÒWfVçBçF&vWBæVÆVÖVçG3òçVW7F–öãòçfÇVRÇÂ"#°¢WfVçBçF&vWBç&W6WB‚“°¢†æFÆT†FV5VW7F–öâ‡VW7F–öâ“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ'v÷&´f÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆUv÷&µ7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ&Wdf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢6öç7BÖöFRÒWfVçBç7V&Ö—GFW#òæFF6WBç6fTÖöFRÇÂWfVçBçF&vWBçVW'•6VÆV7F÷"‚u¶æÖSÒ'6fTÖöFR%Òr“òçfÇVRÇÂ&f–æÂ#°¢v—B†æFÆTUe7V&Ö—B†WfVçBçF&vWBÂÖöFR“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ&WeG—öÆöw”f÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆTUeG—öÆöw•7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ'7&–çDf÷&Ò"ÇÂWfVçBçF&vWBæ–BÓÓÒ'7&–çD–æÆ–æTf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆU7&–çE7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ&6öæf–wW&F–öä6FÆötf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆT6öæf–wW&F–öä6FÆöu7V&Ö—B†WfVçBçF&vWB“°¢Ð ¢–b†WfVçBçF&vWBæ–BÓÓÒ&FVÖæEv—¦&E7FW"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢†æFÆTFVÖæEv—¦&E7FW†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ&FVÖæDf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆTFVÖæE7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ'&ö¦V7DFVÖæDf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆU&ö¦V7DFVÖæE7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ&FVÖæDFWF–Äf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆTFVÖæDFWF–Å7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ&FVÖæE7FGW5&V6öäf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆTFVÖæE7FGW5&V6öå7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ'6–5v÷&·5fÆ–FF–öäf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆU6–5v÷&·5fÆ–FF–öå7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ'6–4F—&V7F÷%VWVTf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆU6–4F—&V7F÷%VWVU7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ'6–4F—&V7F÷$FV6—6–öäf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆU6–4F—&V7F÷$FV6—6–öå7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ'6–4F—&V7F÷%&WV—&VÖVçDf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆU6–4F—&V7F÷%&WV—&VÖVçE7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ'6–4F—&V7F÷%v—fW$f÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆU6–4F—&V7F÷%v—fW%7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ&FVÖæD6ö×ÆWF–öäf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆTFVÖæD6ö×ÆWF–öå7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ&FVÆWFTFVÖæDf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆTFVÆWFTFVÖæE7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ&Ö–çFVææ6TFVÖæDf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆTÖ–çFVææ6TFVÖæE7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ&Ö–çFVææ6TFWF–Äf÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆTÖ–çFVææ6TFWF–Å7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b†WfVçBçF&vWBæ–BÓÓÒ&6öçG&7Df÷&Ò"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢v—B†æFÆT6öçG&7E7V&Ö—B†WfVçBçF&vWB“°¢Ð¢–b‚WfVçBæFVfVÇE&WfVçFVBbb†4FVÖæE7V&Ö—Df–VÆG2†WfVçBçF&vWB’’°¢WfVçBç&WfVçDFVfVÇB‚“°¢6†÷uFö7B‚$Vçf–ò&÷FVv–Fó¢&Wf—6RòÖöFÂRW6Rò&÷L:6òFR6Çf"æ÷fÖVçFRâ"“°¢Ð§Ò“° ¦ÆWB–çWE&VæFW%F–ÖW"ÒçVÆÃ° ¦gVæ7F–öâ66†VGVÆT–çWE&VæFW"†fö7W56VÆV7F÷"Ò""ÂfÇVRÒ""ÂFVÆ’Òƒ’°¢6ÆV%F–ÖV÷WB†–çWE&VæFW%F–ÖW"“°¢–çWE&VæFW%F–ÖW"Ò6WEF–ÖV÷WB‚‚’Óâ°¢&VæFW"‚“°¢–b‚fö7W56VÆV7F÷"’&WGW&ã°¢6öç7BæW‡D–çWBÒFö7VÖVçBçVW'•6VÆV7F÷"†fö7W56VÆV7F÷"“°¢–b‚æW‡D–çWB’&WGW&ã°¢æW‡D–çWBæfö7W2‡²&WfVçE67&öÆÃ¢G'VRÒ“°¢–b‡G—VöbæW‡D–çWBç6WE6VÆV7F–öå&ævRÓÓÒ&gVæ7F–öâ"’°¢æW‡D–çWBç6WE6VÆV7F–öå&ævR‡fÇVRæÆVæwF‚ÂfÇVRæÆVæwF‚“°¢Ð¢ÒÂFVÆ’“°§Ð ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&–çWB"Â†WfVçB’Óâ°¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×6–2Ö6&B×6V&6…Ò"’’°¢6öç7Bf÷&ÒÒWfVçBçF&vWBæ6Æ÷6W7B‚"76–4F—&V7F÷%VWVTf÷&Ò"“°¢6öç7B6VÆV7BÒf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ&&÷fÄ6&D–B%Òr“°¢–b‡6VÆV7B’6VÆV7BçfÇVRÒ"#°¢FVÆWFRWfVçBçF&vWBæFF6WBç6VÆV7FVD6&D–C°¢&VæFW$&÷fÄ6&E6V&6…&W7VÇG2†f÷&Ò“°¢&Vg&W6…6–4F—&V7F÷%VWVTf÷&Ò†f÷&Ò“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖFVÖæB×v÷&²×6V&6…Ò"’’°¢6öç7Bv÷&·2ÒWfVçBçF&vWBæ6Æ÷6W7B‚"6FVÖæEv—¦&E7FW"’òVÆ–v–&ÆTFVÖæEv÷&´6FÆör‚’¢FVÖæEv÷&´6FÆör‚“°¢6öç7Bv÷&²Òf–æEv÷&´'”W†7EG—VE6V&6‚†WfVçBçF&vWBçfÇVRÂv÷&·2“°¢6öç7Bf÷&ÒÒWfVçBçF&vWBæ6Æ÷6W7B‚&f÷&Ò"“°¢6öç7Bv÷&´–BÒf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ&ö'&–B%Òr“°¢–b‡v÷&´–B’v÷&´–BçfÇVRÒv÷&³òæ–BÇÂ"#°¢–b‡v÷&²’7VvvW7D†—7F÷&–6ÄæÇ—7D–äf÷&Ò†f÷&ÒÂv÷&²“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖ6Æ–æ–6Â×&²×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢6Æ–æ–6Å&µVW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FFÖ6Æ–æ–6Â×&²×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖ6Æ–æ–6ÂÖ76WB×6V&6…Ò"’’°¢6öç7Bf÷&ÒÒWfVçBçF&vWBæ6Æ÷6W7B‚&f÷&Ò"“°¢6öç7B†–FFVâÒf÷&ÓòçVW'•6VÆV7F÷"‚u¶æÖSÒ&6Æ–æ–6Ä76WD–B%Òr“°¢–b††–FFVâ’†–FFVâçfÇVRÒ"#°¢6öç7B&W7VÇG2Òf÷&ÓòçVW'•6VÆV7F÷"‚%¶FFÖ6Æ–æ–6ÂÖWV—ÖVçB×&W7VÇG5Ò"“°¢–b‡&W7VÇG2’&W7VÇG2æ–ææW$…DÔÂÒvÆö&ÅF†—2å4ÅEô4ÄõTBæ6ÆVä…DÔÂ†6Æ–æ–6ÄWV—ÖVçE6V&6…&W7VÇG2†WfVçBçF&vWBçfÇVR’“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×7G&FVv–2ÖFV6—6–öâ×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢7G&FVv–4UdFV6—6–öäf–ÇFW'2çVW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FF×7G&FVv–2ÖFV6—6–öâ×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖWbÖFVÆWFRÖ6†V6µÒÂ¶FFÖWbÖFVÆWFR×&V6öåÒ"’’°¢6öç7BÖöFÂÒWfVçBçF&vWBæ6Æ÷6W7B‚"æWbÖFVÆWFRÖÖöFÂ"“°¢6öç7B'WGFöâÒÖöFÃòçVW'•6VÆV7F÷"‚u¶FFÖ7F–öãÒ&6öæf—&ÒÖFVÆWFRÖWb×&V6÷&B%Òr“°¢6öç7B6†V6¶VBÒ&ööÆVâ†ÖöFÃòçVW'•6VÆV7F÷"‚%¶FFÖWbÖFVÆWFRÖ6†V6µÒ"“òæ6†V6¶VB“°¢6öç7B&V6öâÒ7G&–ær†ÖöFÃòçVW'•6VÆV7F÷"‚%¶FFÖWbÖFVÆWFR×&V6öåÒ"“òçfÇVRÇÂ""’çG&–Ò‚“°¢–b†'WGFöâ’'WGFöâæF—6&ÆVBÒ6†V6¶VBÇÂ&V6öã°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×v÷&²ÖFVÆWFRÖ6†V6µÒ"’’°¢6öç7BÖöFÂÒWfVçBçF&vWBæ6Æ÷6W7B‚"çv÷&²ÖFVÆWFRÖÖöFÂ"“°¢6öç7B'WGFöâÒÖöFÃòçVW'•6VÆV7F÷"‚u¶FFÖ7F–öãÒ&FVÆWFR×v÷&²×&V6÷&B%Òr“°¢–b†'WGFöâ’'WGFöâæF—6&ÆVBÒWfVçBçF&vWBæ6†V6¶VC°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×6ÇBÖ–æ62×fÇVUÒ"’’°¢6ÇD”ä446Æ7VÆF÷"çfÇVRÒ'6T7W'&Væ7’†WfVçBçF&vWBçfÇVR“°¢WFFU4ÅD”ä45&W7VÇG2‚“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖWbÖ†FV2Ö6†V6µÒ"’’°¢6öç7B÷fW&Æ’ÒWfVçBçF&vWBæ6Æ÷6W7B‚%¶FFÖWbÖ†FV2Ö6öæf—&ÕÒ"“°¢6öç7B'WGFöâÒ÷fW&Æ“òçVW'•6VÆV7F÷"‚u¶FFÖ7F–öãÒ&6öæf—&ÒÖWbÖFWf–F–öâ×6fR%Òr“°¢–b†'WGFöâ’'WGFöâæF—6&ÆVBÒWfVçBçF&vWBæ6†V6¶VC°¢÷fW&Æ“òçVW'•6VÆV7F÷"‚%¶FFÖWbÖ†FV2Ö†–çEÒ"“òæ6Æ74Æ—7BçFövvÆR‚&—2Ö6öæf—&ÖVB"ÂWfVçBçF&vWBæ6†V6¶VB“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖWbÖ†—7F÷'’×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢Wd†—7F÷&–6Äf–ÇFW'2çVW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FFÖWbÖ†—7F÷'’×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×7G&FVv–2Ö†—7F÷'’×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢7G&FVv–4†—7F÷&–6ÅVW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FF×7G&FVv–2Ö†—7F÷'’×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖWbÖ&VÖ–çWEÒÂæWb×fÇVRÖ–çWB"’’°¢WFFTUd&V&Wf–Wr†WfVçBçF&vWBæ6Æ÷6W7B‚"6Wdf÷&Ò"’“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖ·’ÖÖöFÂ×6V&6…Ò"’’°¢6öç7BFW&×2Òæ÷&ÖÆ—¦U6V&6…FW‡B†WfVçBçF&vWBçfÇVR’ç7Æ—B‚õÇ2²ò’æf–ÇFW"„&ööÆVâ“°¢6öç7B&÷w2Ò²ââæFö7VÖVçBçVW'•6VÆV7F÷$ÆÂ‚%¶FFÖ·’×&÷uÒ"•Ó°¢ÆWBf—6–&ÆRÒ°¢&÷w2æf÷$V6‚‚‡&÷r’Óâ°¢6öç7BFW‡BÒæ÷&ÖÆ—¦U6V&6…FW‡B‡&÷rçFW‡D6öçFVçB“°¢6öç7BÖF6†W2ÒFW&×2æÆVæwF‚ÇÂFW&×2æWfW'’‚‡FW&Ò’ÓâFW‡Bæ–æ6ÇVFW2‡FW&Ò’“°¢&÷ræ†–FFVâÒÖF6†W3°¢–b†ÖF6†W2’f—6–&ÆR³Ò°¢Ò“°¢6öç7B6÷VçFW"ÒFö7VÖVçBçVW'•6VÆV7F÷"‚%¶FFÖ·’×&W7VÇBÖ6÷VçEÒ"“°¢–b†6÷VçFW"’6÷VçFW"çFW‡D6öçFVçBÒÖ÷7G&æFòG·f—6–&ÆWÒFRG·&÷w2æÆVæwF‡Ò&Vv—7G&÷2æ°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖWbÖ76—7FçB×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢Wd76—7FçEVW'’ÒfÇVS°¢6VÆV7FVEv÷&´–BÒ&ÆÂ#°¢66†VGVÆT–çWE&VæFW"‚%¶FFÖWbÖ76—7FçB×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×6–2×v÷&²×6V&6…Ò"’’°¢WFFU6–5v÷&µ6V&6‚†WfVçBçF&vWB“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×÷'FföÆ–ò×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢÷'FföÆ–õV–6´f–ÇFW'2çVW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FF×÷'FföÆ–ò×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖ–çfW7FÖVçB×Æâ×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢–çfW7FÖVçEÆäf–ÇFW'2çVW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FFÖ–çfW7FÖVçB×Æâ×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×&ö¦V7B×Æâ×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢&ö¦V7EÆäf–ÇFW'2çVW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FF×&ö¦V7B×Æâ×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×&ö¦V7BÖ÷W&F–öæÂ×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢&ö¦V7D÷W&F–öæÄf–ÇFW'2çVW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FF×&ö¦V7BÖ÷W&F–öæÂ×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖ÷W&F–öæÂ×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢÷W&F–öæÄf–ÇFW'2çVW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FFÖ÷W&F–öæÂ×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖÖ–çFVææ6R×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢Ö–çFVææ6Tf–ÇFW'4f÷$7F—fTÖöGVÆR‚’çVW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FFÖÖ–çFVææ6R×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖ'VFvWB×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢'VFvWDf–ÇFW'2çVW'’ÒfÇVS°¢'VFvWEG&ç6fW$6†V6²ÒçVÆÃ°¢66†VGVÆT–çWE&VæFW"‚%¶FFÖ'VFvWB×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×G&ç6fW"×G&6¶W"×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢G&ç6fW%G&6¶W%VW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FF×G&ç6fW"×G&6¶W"×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×G&ç6fW"×G&6¶W"×6V&6ƒ%Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢G&ç6fW%G&6¶W%VW'“"ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FF×G&ç6fW"×G&6¶W"×6V&6ƒ%Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×G&ç6fW"ÖÆÂ×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢G&ç6fW$ÆÅ6V&6‚ÒfÇVS°¢G&ç6fW$ÆÅvRÒ°¢66†VGVÆT–çWE&VæFW"‚%¶FF×G&ç6fW"ÖÆÂ×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×G&ç6fW"ÖæWB×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢G&ç6fW$æWE6V&6‚ÒfÇVS°¢G&ç6fW$æWEvRÒ°¢66†VGVÆT–çWE&VæFW"‚%¶FF×G&ç6fW"ÖæWB×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖ6Æ–æ–6ÂÖWV—ÖVçB×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢6Æ–æ–6Äf–ÇFW'2æWV—ÖVçBÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FFÖ6Æ–æ–6ÂÖWV—ÖVçB×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖÖ–çFVææ6R×Væ—B×6V&6…Ò"’’°¢WFFTÖ–çFVææ6UVæ—E6V&6‚†WfVçBçF&vWB“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FFÖFVÖæB×Væ—B×6V&6…Ò"’’°¢WFFTFVÖæEVæ—E6V&6‚†WfVçBçF&vWB“°¢&WGW&ã°¢Ð¢–b†WfVçBçF&vWBæÖF6†W2‚%¶FF×6–2×6V&6…Ò"’’°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢6–56V&6…VW'’ÒfÇVS°¢66†VGVÆT–çWE&VæFW"‚%¶FF×6–2×6V&6…Ò"ÂfÇVR“°¢&WGW&ã°¢Ð¢–b‚WfVçBçF&vWBæÖF6†W2‚%¶FFÖf–ÇFW"Öf–VÆEÒ"’’&WGW&ã°¢6öç7Bf–VÆBÒWfVçBçF&vWBæFF6WBæf–ÇFW$f–VÆC°¢6öç7BfÇVRÒWfVçBçF&vWBçfÇVS°¢÷'FföÆ–ôf–ÇFW'5¶f–VÆEÒÒfÇVS°¢66†VGVÆT–çWE&VæFW"†¶FFÖf–ÇFW"Öf–VÆCÒ"G¶f–VÆGÒ%ÖÂfÇVR“°§Ò“° ¦Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&fö7W6–â"Â†WfVçB’Óâ°¢–b†WfVçBçF&vWBæÖF6†W3òâ‚%¶FF×6–2Ö6&B×6V&6…Ò"’’°¢&VæFW$&÷fÄ6&E6V&6…&W7VÇG2†WfVçBçF&vWBæ6Æ÷6W7B‚"76–4F—&V7F÷%VWVTf÷&Ò"’“°¢Ð§Ò“° ¦gVæ7F–öâ†—7F÷&–6Ä'VFvWEv÷&´g&öÕ&V6÷&B‡&V6÷&BÂÆ–æ¶VEv÷&²ÒçVÆÂ’°¢6öç7BG—öÆöw’Ò6æöæ–6Åv÷&µG—öÆöw’‡&V6÷&CòçG—öÆöw’“°¢6öç7B&VÒçVÖ&W"‡&V6÷&Còæ&VÇÂ“°¢6öç7B&Wf—6–öäÖF6‚Ò7G&–ær‡&V6÷&Còç&Wf—6–öâÇÂ""’æÖF6‚‚õÆB²ò“°¢6öç7B&Wf—6–öäçVÖ&W"Ò&Wf—6–öäÖF6‚òçVÖ&W"‡&Wf—6–öäÖF6…³Ò’¢°¢6öç7BÆ–æW2Òæ÷&ÖÆ—¦TUdÆ–æW2„ö&¦V7BæVçG&–W2‡&V6÷&CòæF—66—Æ–æW2ÇÂ·Ò’æÖ‚…¶F—66—Æ–æ–BÂfÆ÷$÷&6FõÒ’Óâ‡°¢F—66—Æ–æ–BÀ¢fÆ÷$÷&6Fó¢çVÖ&W"‡fÆ÷$÷&6FòÇÂ’À¢7FGW3¢$÷,:vFò"À¢Ò’’“°¢6öç7B†—7F÷&–6ÄUbÒ°¢–C¢&V6÷&Bæ–BÀ¢fW'6ôGVÃ¢&Wf—6–öäçVÖ&W"À¢7FGW3¢$6ö×ÆWFò"À¢Æ–æW2À¢fW'6–öç3¢·°¢çVÖW&ó¢&Wf—6–öäçVÖ&W"À¢FF¢&V6÷&CòæFFRÇÂ""À¢÷&–vVÓ¢$&6R†—7L;7&–6"À¢fÆ÷%F÷FÃ¢çVÖ&W"‡&V6÷&CòçF÷FÂÇÂ’À¢7W7FôÓ#¢&VòçVÖ&W"‡&V6÷&CòçF÷FÂÇÂ’ò&V¢À¢ÕÒÀ¢FVÖæF–G3¢µÒÀ¢6–4–G3¢µÒÀ¢Ó°¢&WGW&â°¢âââ†Æ–æ¶VEv÷&²ÇÂ·Ò’À¢–C¢Æ–æ¶VEv÷&³òæ–BÇÂ†—7F÷&–6ÂÖ'VFvWBÒG·&V6÷&Bæ–GÖÀ¢6†fUVæ–6¢Æ–æ¶VEv÷&³òæ6†fUVæ–6ÇÂ&V6÷&Còæ6öFRÇÂ""À¢6öF–vô÷&–v–æÃ¢Æ–æ¶VEv÷&³òæ6öF–vô÷&–v–æÂÇÂ&V6÷&Còæ6öFRÇÂ""À¢æöÖS¢Æ–æ¶VEv÷&³òææöÖRÇÂ&V6÷&Còç&ö¦V7BÇÂ$Ub†—7L;7&–6ò"À¢F—õVæ–FFS¢Æ–æ¶VEv÷&³òçF—õVæ–FFRÇÂ""À¢F—öÆöv–ö'&¢G—öÆöw’À¢&V6öç7G'V–F¢Æ–æ¶VEv÷&³òæ&V6öç7G'V–FÇÂ&VÀ¢&VWV—fÆVçFS¢Æ–æ¶VEv÷&³òæ&VWV—fÆVçFRÇÂ&VÀ¢æôö'&¢Æ–æ¶VEv÷&³òææôö'&ÇÂ7G&–ær‡&V6÷&Còç–V"ÇÂ""’ç6Æ–6RƒÂB’À¢Vc¢6æöæ–6Å7FFT6öFR†Æ–æ¶VEv÷&³òçVbÇÂ&V6÷&CòçVb’À¢&Vv–ó¢Æ–æ¶VEv÷&³òç&Vv–òÇÂ6æöæ–6Å7FFU&Vv–öâ‡&V6÷&CòçVb’ÇÂ&V6÷&Còç&Vv–öâÇÂ""À¢7FGW3¢Æ–æ¶VEv÷&³òç7FGW2ÇÂ$†—7L;7&–6ò"À¢ö†—7F÷&–6Ä'VFvWEv÷&³¢G'VRÀ¢†—7F÷&–6Å&V6÷&D–C¢&V6÷&Bæ–BÀ¢Wc¢Æ–æ¶VEv÷&³òæWbbbÆ–æ¶VEv÷&²æWbå÷f—'GVÄV×G”UbòÆ–æ¶VEv÷&²æWb¢†—7F÷&–6ÄUbÀ¢Ó°§Ð ¦gVæ7F–öâ†—7F÷&–6Ä'VFvWEv÷&·2‚’°¢&WGW&âWd†—7F÷&–6Å6÷W&6U&V6÷&G2‚’æÖ‚‡&V6÷&B’Óâ°¢6öç7BÆ–æ¶VEv÷&²ÒWeVæ–f–VEv÷&´f÷$†—7F÷&–6Â‡&V6÷&B“°¢&WGW&â†—7F÷&–6Ä'VFvWEv÷&´g&öÕ&V6÷&B‡&V6÷&BÂÆ–æ¶VEv÷&²“°¢Ò“°§Ð ¦gVæ7F–öâ'VFvWEv÷&·2‚’°¢6öç7B†—7F÷&–6ÂÒ†—7F÷&–6Ä'VFvWEv÷&·2‚“°¢6öç7Böff–6–Ä–G2ÒæWr6WB††—7F÷&–6Âæf–ÇFW"‚‡v÷&²’Óâv÷&²åö†—7F÷&–6Ä'VFvWEv÷&²bb7G&–ær‡v÷&²æ–B’ç7F'G5v—F‚‚&†—7F÷&–6ÂÖ'VFvWBÒ"’’æÖ‚‡v÷&²’Óâ7G&–ær‡v÷&²æ–B’’“°¢6öç7B7W'&VçBÒ‡7FFRçv÷&·2ÇÂµÒ’æf–ÇFW"‚‡v÷&²’Óâöff–6–Ä–G2æ†2…7G&–ær‡v÷&²æ–BÇÂ""’’“°¢&WGW&â²ââæ†—7F÷&–6ÂÂââæ7W'&VçEÓ°§Ð ¦gVæ7F–öâ&V6V—fT6Æ÷VDÖöGVÆU–ÆöB‡–ÆöB’°¢&6U7FFRÒ7&VFT&6U7FFR‡°¢âââ‡–ÆöBç7FFRÇÂ·Ò’À¢W6W'3¢¶vÆö&ÅF†—2å4ÅEô4ÄõTBç&öf–ÆUÒÀ¢7F—fU&öÆS¢vÆö&ÅF†—2å4ÅEô4ÄõTBç&öf–ÆRçW&f–ÂÀ¢Ò“°¢†6W…&VfW&Væ6RÒvÆö&ÅF†—2ä„4U…õ$TdU$Tä4RÇÂ¶6W„–æ–6–Ã£Â6öçF–ævVæ6–ÖVçF÷3£Â÷'FW4W‡G&3£Â6W„GVÃ£Â&Wf—7Fô†—7F÷&–6ó§·×Ó°¢7FFRÒÆöE7FFR‚“°¢WF…6W76–öâÒÆöDWF…6W76–öâ‚“°¢–b‚7FFRçv÷&·2ç6öÖR‚‡v÷&²’Óâv÷&²æ–BÓÓÒ6VÆV7FVEv÷&´–B’’6VÆV7FVEv÷&´–BÒ7FFRçv÷&·5³Óòæ–BÇÂ"#°¢vÆö&ÅF†—2äUeô„•5Dõ$”4ÅôDDÒ²6÷W&6S¢$DDõ2Ue2ƒ’ç†Ç7‚"Â6†VWC¢%Ææ–Æ†"Â&V6÷&G3¢'&”÷$fÆÆ&6²‡7FFRæWg2’Ó°¢&WGW&âW'6—7FVE7FFU–ÆöB‚“°§Ð ¦vÆö&ÅF†—2äUeô„•5Dõ$”4ÅôDDÒ²6÷W&6S¢$DDõ2Ue2ƒ’ç†Ç7‚"Â6†VWC¢%Ææ–Æ†"Â&V6÷&G3¢'&”÷$fÆÆ&6²‡7FFRæWg2’Ó°¦vÆö&ÅF†—2å4ÅEô4ÄõTBç&Vv—7FW$ÖöGVÆU&V6V—fW"‡&V6V—fT6Æ÷VDÖöGVÆU–ÆöB“°¦Ö÷VçEW6W'4FÖ–â†vÆö&ÅF†—2å4ÅEô4ÄõTBÂ†6öçFW‡B’Óâ°¢6öç7B&VæÖRÒ6öçFW‡CòææÇ—7E&VæÖS°¢–b‡&VæÖSòæg&öÒbb&VæÖRçFòbb&VæÖRæg&öÒÓÒ&VæÖRçFò’°¢6öç7BWFFTFVÖæBÒ†FVÖæB’Óâ°¢–b†FVÖæBææÆ—7F&W7öç6fVÂÓÓÒ&VæÖRæg&öÒ’FVÖæBææÆ—7F&W7öç6fVÂÒ&VæÖRçFó°¢FVÖæBææÆ—7F46ö×ÆVÖVçF&W2Ò'&”÷$fÆÆ&6²†FVÖæBææÆ—7F46ö×ÆVÖVçF&W2’æÖ‚†æÖR’ÓâæÖRÓÓÒ&VæÖRæg&öÒò&VæÖRçFò¢æÖR“°¢–b†FVÖæBç6–4ÖWFFFòææÆ—7F6ÆFV6æ–6ÓÓÒ&VæÖRæg&öÒ’FVÖæBç6–4ÖWFFFææÆ—7F6ÆFV6æ–6Ò&VæÖRçFó°¢Ó°¢'&”÷$fÆÆ&6²‡7FFRæFVÖæG2’æf÷$V6‚‡WFFTFVÖæB“°¢'&”÷$fÆÆ&6²‡7FFRç&ö¦V7DFVÖæG2’æf÷$V6‚‡WFFTFVÖæB“°¢'&”÷$fÆÆ&6²‡7FFRæÖ–çFVææ6TFVÖæG2’æf÷$V6‚‡WFFTFVÖæB“°¢'&”÷$fÆÆ&6²‡7FFRç6–72’æf÷$V6‚‚‡6–2’Óâ°¢–b‡6–2ææÆ—7F6ÆFV6æ–6ÓÓÒ&VæÖRæg&öÒ’6–2ææÆ—7F6ÆFV6æ–6Ò&VæÖRçFó°¢Ò“°¢Ð¢&VæFW"‚“°§Ò“°¦Ö÷VçD&6·W2†vÆö&ÅF†—2å4ÅEô4ÄõTB“°¦vÆö&ÅF†—2å4ÅEôô”ä•D”Ä•¤RÒ7–æ2‚’Óâ°¢v—B6WEf–Wr‡&VÖVÖ&W&VEf–Wr‚’Â²ÆÆ÷u&Wf–Ws¢fÇ6RÂ67&öÆÃ¢fÇ6RÒ“°§Ó°