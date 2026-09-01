const STORAGE_KEY = "slt360-state-v6-historico";

const MIRO_FLOW_URL = "https://miro.com/app/board/uXjVKxg3MFc=/";
const AUTH_SESSION_KEY = "slt360-auth-session-v1";
const HAPTEC_POSITION_KEY = "slt360-haptec-position-v1";
const ATTACHMENT_DB_NAME = "slt360-attachments-v1";
const ATTACHMENT_STORE_NAME = "files";
const TODAY_ISO = "2026-08-03";
const INVESTMENT_PLAN_YEAR = "2026";

const viewAliases = {
  worksPortfolio: "portfolio",
  worksHistory: "portfolio",
  worksIntelligence: "worksManagement",
  worksOverview: "worksHome",
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
    targetLabel: "até R$ 5.000/m²",
  },
  {
    id: "hospital-media",
    label: "Hospital média complexidade",
    targetMin: 3500,
    targetMax: 4000,
    targetLabel: "R$ 3.500 a R$ 4.000/m²",
  },
  {
    id: "pronto-atendimento",
    label: "Pronto atendimento",
    targetMax: 3000,
    targetLabel: "até R$ 3.000/m²",
  },
  {
    id: "clinicas-diagnosticos-labs-teas",
    label: "Clínicas, diagnósticos, laboratórios e TEAs",
    targetMax: 2000,
    targetLabel: "até R$ 2.000/m²",
  },
];

const hapcapexReference = {
  capexInicial: 286137351,
  contingenciamentos: 52331203,
  aportesExtras: 3347836.71,
  capexAtual: 237153984.71,
  previstoHistorico: {
    JAN: 17045693.261,
    FEV: 20316465.204913463,
    MAR: 21406238.50691346,
    ABR: 23752282.418254368,
    MAI: 21756900.62125437,
    JUN: 20597676.51212937,
  },
};

const columns = [
  { id: "fazer", label: "Fazer" },
  { id: "fazendo", label: "Fazendo" },
  { id: "pausado", label: "Pausado" },
  { id: "validacaoST", label: "Aguardando Validação Sala Técnica" },
  { id: "validacaoObras", label: "Aguardando Validação Obras" },
  { id: "concluido", label: "Concluído" },
  { id: "cancelado", label: "Cancelado" },
];

const worksViewIds = [
  "worksHome",
  "worksOperational",
  "worksManagement",
  "worksStrategic",
  "portfolio",
  "ev",
  "sics",
  "worksSettings",
];

const worksNavItems = [
  { view: "worksHome", label: "Início" },
  { view: "portfolio", label: "Portfólio" },
  { view: "worksOperational", label: "Operacional" },
  { view: "worksManagement", label: "Gerencial" },
  { view: "worksStrategic", label: "Estratégica" },
  { view: "ev", label: "EV" },
  { view: "sics", label: "SICs" },
  { view: "worksSettings", label: "Configurações" },
];

const projectColumns = [
  { id: "planejado", label: "Planejado", tone: "blue" },
  { id: "emProjetos", label: "Em projetos", tone: "orange" },
  { id: "salaTecnica", label: "Entregue para ST", tone: "green" },
  { id: "atrasado", label: "Atrasado", tone: "red" },
  { id: "concluido", label: "Concluído", tone: "green" },
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
    label: "SDR - Solicitação de Regulatório",
    shortLabel: "SDR",
    detail: "Solicitação originada pela VISA ou por outro órgão regulador.",
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
    detail: "Solicitação de área terceira demandante.",
  },
];

const projectViewIds = [
  "projectsHome",
  "projectsPortfolio",
  "projectsPlan",
  "projectsOperational",
  "projectsManagement",
  "projectsStrategic",
];

const projectNavItems = [
  { view: "projectsHome", label: "Início" },
  { view: "projectsPortfolio", label: "Portfólio" },
  { view: "projectsOperational", label: "Operacional" },
  { view: "projectsManagement", label: "Gerencial" },
  { view: "projectsStrategic", label: "Estratégica" },
];

const maintenanceColumns = [
  { id: "naoIniciado", label: "Não iniciada", tone: "blue", pipefy: ["NÃO INICIADO", "NAO INICIADO"] },
  { id: "emDuplicidade", label: "Em duplicidade", tone: "gray", pipefy: ["EM DUPLICIDADE"] },
  { id: "andamento", label: "Andamento", tone: "green", pipefy: ["ANDAMENTO"] },
  { id: "validacao", label: "Validação", tone: "orange", pipefy: ["VALIDAÇÃO", "VALIDACAO"] },
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
  { view: "maintenance", label: "Início" },
  { view: "maintenanceOperational", label: "Operacional" },
  { view: "maintenanceReports", label: "BI Manutenção" },
  { view: "maintenanceTimeline", label: "Linha do Tempo" },
  { view: "maintenanceExecutive", label: "Executiva" },
  { view: "maintenanceSettings", label: "Configurações" },
];

const clinicalNavItems = [
  { view: "clinical", label: "Início" },
  { view: "clinicalOperational", label: "Operacional" },
  { view: "clinicalReports", label: "BI Eng. Clínica" },
  { view: "clinicalTimeline", label: "Linha do Tempo" },
  { view: "clinicalExecutive", label: "Executiva" },
  { view: "clinicalSettings", label: "Parque Tecnológico" },
];

const moduleHeaders = {
  projects: {
    eyebrow: "Módulo 01",
    label: "Projetos 360",
    logo: "assets/module-icon-projetos.png",
    tone: "cyan",
  },
  works: {
    eyebrow: "Módulo 02",
    label: "Orçamento 360",
    logo: "assets/module-icon-obras.png",
    tone: "blue",
  },
  maintenance: {
    eyebrow: "Módulo 03",
    label: "Manutenção 360",
    logo: "assets/module-icon-manutencao.png",
    tone: "orange",
  },
  clinical: {
    eyebrow: "Módulo 04",
    label: "Eng. Clínica 360",
    logo: "assets/module-icon-clinica.png",
    tone: "green",
  },
  budget: {
    eyebrow: "Módulo 05",
    label: "Controle de Verba 360",
    logo: "assets/module-icon-verbas.png",
    tone: "red",
  },
};

const roleDefinitions = {
  Admin: {
    label: "Admin",
    description: "Acesso completo, cadastros globais, configurações e controle financeiro.",
    blockedViews: [],
  },
  Gestão: {
    label: "Gestão",
    description: "Acesso gerencial às visões executivas, obras, SICs e controle de verbas.",
    blockedViews: [],
  },
  Analista: {
    label: "Analista",
    description: "Acesso operacional ao Orçamento 360, EVs, sprints e SICs sem Controle de Verbas.",
    blockedViews: ["budget", "settings", "worksSettings", "maintenanceSettings", "clinicalSettings", "analytics", "suppliers"],
  },
  "Analista de Orçamento": {
    label: "Analista de Orçamento",
    description: "Acesso restrito ao módulo Orçamento 360, incluindo portfólio, operacional, EVs e SICs.",
    blockedViews: ["budget", "settings", "worksSettings", "maintenanceSettings", "clinicalSettings", "analytics", "suppliers"],
  },
  "Analista de Projetos": {
    label: "Analista de Projetos",
    description: "Acesso restrito ao módulo Projetos 360, incluindo portfólio, plano e Kanban de projetos.",
    blockedViews: ["budget", "settings", "worksSettings", "maintenanceSettings", "clinicalSettings", "analytics", "suppliers"],
  },
};

const userAccessModules = [
  {
    id: "projects",
    label: "Projetos 360",
    detail: "Início, portfólio, operacional, gerencial e estratégica.",
    views: projectViewIds,
  },
  {
    id: "works",
    label: "Orçamento 360",
    detail: "Portfólio, operacional, EV, SICs, gerencial e estratégica.",
    views: worksViewIds,
  },
  {
    id: "maintenance",
    label: "Manutenção 360",
    detail: "Início, operacional, BI, linha do tempo e executiva.",
    views: maintenanceViewIds,
  },
  {
    id: "clinical",
    label: "Eng. Clínica 360",
    detail: "Início, operacional, BI, linha do tempo e executiva.",
    views: clinicalViewIds,
  },
  {
    id: "budget",
    label: "Controle de Verbas",
    detail: "CAPEX/OPEX, transferências e curva de CAPEX.",
    views: ["budget"],
  },
  {
    id: "settings",
    label: "Configuração",
    detail: "Usuários, sprints, equipe, dicionários e auditoria.",
    views: ["settings", "team", "analytics", "suppliers", "worksSettings", "maintenanceSettings", "clinicalSettings"],
  },
];

const disciplines = [
  ["fundacoes-e-contencoes", "Fundações e Contenções", "CustosDaObra", true],
  ["estruturas", "Estruturas", "CustosDaObra", true],
  ["adequacoes-civis", "Adequações Civis", "CustosDaObra", true],
  ["fachadas", "Fachadas", "CustosDaObra", true],
  ["instalacoes-eletricas-e-spda", "Instalações Elétricas e SPDA", "CustosDaObra", true],
  ["instalacoes-hidrossanitarias", "Instalações Hidrossanitárias", "CustosDaObra", true],
  ["instalacoes-de-gases-medicinais", "Instalações de Gases Medicinais", "CustosDaObra", true],
  ["instalacoes-de-combate-a-incendio", "Instalações de Combate a Incêndio", "CustosDaObra", true],
  ["instalacoes-de-spda", "Instalações de SPDA", "CustosDaObra", true],
  ["instalacoes-de-climatizacao-e-exaustao", "Instalações de Climatização e Exaustão", "CustosDaObra", true],
  ["dados-voz-cftv-chamada", "Infraestrutura de Dados/Voz/Seg. Patrimonial/CFTV/Chamada", "CustosDaObra", true],
  ["custos-indiretos", "Custos Indiretos", "CustosDaObra", true],
  ["instalacoes-de-glp", "Instalações de GLP", "CustosDaObra", true],
  ["projetos-tecnicos", "Projetos Técnicos", "OutrasCategorias", true],
  ["projetos-legalizacao", "Projetos Legalização", "OutrasCategorias", true],
  ["dados-e-voz-seguranca-patrimonial-chamada-hospitalar", "Dados e Voz/Segurança Patrimonial/Chamada Hospitalar", "OutrasCategorias", true],
  ["equipamentos-de-climatizacao", "Equipamentos de Climatização", "OutrasCategorias", true],
  ["artefatos-inox", "Artefatos em Inox", "OutrasCategorias", true],
  ["marcenaria", "Marcenaria", "OutrasCategorias", true],
  ["reguas-medicinais", "Réguas Medicinais", "OutrasCategorias", true],
  ["gerador-subestacao-transformador-cubiculos", "Gerador/Subestação/Transformador/Cubículos", "OutrasCategorias", true],
  ["elevadores-plataforma-elevatoria", "Elevadores/Plataforma Elevatória", "OutrasCategorias", true],
  ["compressor-bomba-de-vacuo-driox", "Compressor/Bomba de Vácuo/Driox", "OutrasCategorias", true],
  ["it-medico-nobreak", "IT Médico/Nobreak", "OutrasCategorias", true],
  ["ete-eta", "ETE/ETA", "OutrasCategorias", true],
  ["correio-pneumatico", "Correio Pneumático", "OutrasCategorias", true],
  ["controle-acessos", "Controle de Acessos", "OutrasCategorias", true],
  ["planejamento-obras", "Planejamento de Obras", "OutrasCategorias", true],
  ["contas-consumo", "Contas de Consumo", "OutrasCategorias", true],
  ["comunicacao-visual-externa-e-interna", "Comunicação Visual Externa e Interna", "OutrasCategorias", true],
  ["quadros-eletricos", "Quadros Elétricos", "OutrasCategorias", true],
  ["sics", "SIC's", "OutrasCategorias", false],
  ["sistemas-de-automacao", "Sistemas de Automação", "OutrasCategorias", true],
  ["taxa-risco", "Taxa de Risco (5%)", "OutrasCategorias", false],
  ["blindagem", "Blindagem", "OutrasCategorias", true],
  ["paisagismo-e-ou-compensacao-ambiental", "Paisagismo e/ou Compensação Ambiental", "OutrasCategorias", true],
  ["camara-fria", "Câmara Fria", "OutrasCategorias", true],
  ["outras-linhas-ev", "Outras Linhas do EV", "OutrasCategorias", false],
  ["sistema-de-aquecimento-de-agua", "Sistema de Aquecimento de Água", "OutrasCategorias", true],
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
  "instalacoes-spda": "instalacoes-de-spda",
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

const defaultState = {
  version: 6,
  works: [
    {
      id: "obra-ibirapuera",
      chaveUnica: "APP-001",
      codigoOriginal: "OBR-2026-014",
      nome: "Novo Hospital Ibirapuera",
      tipoUnidade: "Hospital",
      cidade: "São Paulo",
      uf: "SP",
      regiao: "Sudeste",
      classificacaoObra: "Expansão",
      tipologiaObra: "Hospital Geral",
      areaConstruida: 29500,
      areaEquivalente: 24200,
      ordemInternaSAP: "OI-452910",
      status: "Em execução",
      ev: {
        id: "ev-ibirapuera",
        versaoAtual: 4,
        status: "Completo",
        lines: [
          ["adequacoes-civis", 38200000, "Orçado"],
          ["estruturas", 28400000, "Orçado"],
          ["climatizacao-exaustao", 11800000, "Cotado"],
          ["equipamentos-climatizacao", 9200000, "Orçado"],
          ["instalacoes-eletricas-spda", 13200000, "Orçado"],
          ["quadros-eletricos", 3800000, "Orçado"],
          ["marcenaria", 6900000, "Cotado"],
          ["reguas-medicinais", 3200000, "Orçado"],
          ["projetos-tecnicos", 2600000, "Contratado"],
          ["sics", 0, "NãoSeAplica"],
          ["taxa-risco", 5900000, "Orçado"],
        ].map(([disciplinaId, valorOrcado, status]) => ({
          disciplinaId,
          valorOrcado,
          status,
        })),
        versions: [
          {
            numero: 3,
            data: "2026-05-19",
            origem: "Base importada",
            valorTotal: 123200000,
            custoM2: 5090.91,
            diffPorDisciplina: [],
          },
          {
            numero: 4,
            data: "2026-06-28",
            origem: "DEM-007",
            valorTotal: 137884426.56,
            custoM2: 5697.70,
            diffPorDisciplina: [
              { disciplinaId: "adequacoes-civis", valorAntes: 38200000, valorDepois: 48000000 },
              { disciplinaId: "equipamentos-climatizacao", valorAntes: 9200000, valorDepois: 12400000 },
              { disciplinaId: "quadros-eletricos", valorAntes: 3800000, valorDepois: 5484426.56 },
            ],
          },
        ],
      },
    },
    {
      id: "obra-recife",
      chaveUnica: "APP-002",
      codigoOriginal: "OBR-2026-021",
      nome: "Pronto Atendimento Recife Norte",
      tipoUnidade: "PA",
      cidade: "Recife",
      uf: "PE",
      regiao: "Nordeste",
      classificacaoObra: "Nova unidade",
      tipologiaObra: "Pronto Atendimento",
      areaConstruida: 7200,
      areaEquivalente: 6400,
      ordemInternaSAP: "OI-453100",
      status: "Em orçamento",
      ev: {
        id: "ev-recife",
        versaoAtual: 2,
        status: "Em cotação",
        lines: [
          ["adequacoes-civis", 9200000, "Orçado"],
          ["instalacoes-eletricas-spda", 3600000, "Cotado"],
          ["climatizacao-exaustao", 2800000, "Orçado"],
          ["equipamentos-climatizacao", 1700000, "Orçado"],
          ["marcenaria", 1200000, "Orçado"],
          ["projetos-tecnicos", 720000, "Contratado"],
          ["comunicacao-visual", 410000, "Orçado"],
          ["taxa-risco", 980000, "Orçado"],
        ].map(([disciplinaId, valorOrcado, status]) => ({
          disciplinaId,
          valorOrcado,
          status,
        })),
        versions: [
          {
            numero: 1,
            data: "2026-04-11",
            origem: "DEM-002",
            valorTotal: 19410000,
            custoM2: 3032.81,
            diffPorDisciplina: [],
          },
          {
            numero: 2,
            data: "2026-06-02",
            origem: "SIC-004",
            valorTotal: 20610000,
            custoM2: 3220.31,
            diffPorDisciplina: [
              { disciplinaId: "climatizacao-exaustao", valorAntes: 2800000, valorDepois: 3400000 },
              { disciplinaId: "marcenaria", valorAntes: 1200000, valorDepois: 1800000 },
            ],
          },
        ],
      },
    },
    {
      id: "obra-campinas",
      chaveUnica: "APP-003",
      codigoOriginal: "OBR-2026-032",
      nome: "Clínica Diagnóstico Campinas",
      tipoUnidade: "Clínica",
      cidade: "Campinas",
      uf: "SP",
      regiao: "Sudeste",
      classificacaoObra: "Adequação",
      tipologiaObra: "Diagnóstico",
      areaConstruida: 4100,
      areaEquivalente: 3400,
      ordemInternaSAP: "OI-453380",
      status: "Planejada",
      ev: {
        id: "ev-campinas",
        versaoAtual: 1,
        status: "Rascunho",
        lines: [
          ["adequacoes-civis", 3900000, "Orçado"],
          ["instalacoes-eletricas-spda", 1450000, "Orçado"],
          ["equipamentos-climatizacao", 860000, "Cotado"],
          ["blindagem", 1280000, "Orçado"],
          ["marcenaria", 780000, "Orçado"],
          ["projetos-legalizacao", 260000, "Contratado"],
          ["taxa-risco", 430000, "Orçado"],
        ].map(([disciplinaId, valorOrcado, status]) => ({
          disciplinaId,
          valorOrcado,
          status,
        })),
        versions: [
          {
            numero: 1,
            data: "2026-07-03",
            origem: "DEM-011",
            valorTotal: 8960000,
            custoM2: 2635.29,
            diffPorDisciplina: [],
          },
        ],
      },
    },
  ],
  demands: [
    {
      id: "DEM-007",
      obraId: "obra-ibirapuera",
      tipo: "SIC",
      sprintId: "sprint-3",
      analistaResponsavel: "Marina Lopes",
      analistasComplementares: ["João Pires"],
      prioridade: "Alta",
      coluna: "concluido",
      dataPrevistaInicio: "2026-06-17",
      dataInicioReal: "2026-06-17",
      dataPrevEnvioValidacaoObras: "2026-06-25",
      dataEnvioRealValidacaoObras: "2026-06-26",
      dataValidacaoObras: "2026-06-28",
      dataPrevistaEntrega: "2026-06-28",
      dataEntregaReal: "2026-06-28",
      observacao: "Decomposição obrigatória do delta v3 para v4.",
      sicIds: ["SIC-007"],
    },
    {
      id: "DEM-014",
      obraId: "obra-recife",
      tipo: "EmissaoInicial",
      sprintId: "sprint-4",
      analistaResponsavel: "Renata Alves",
      analistasComplementares: [],
      prioridade: "Média",
      coluna: "fazendo",
      dataPrevistaInicio: "2026-07-18",
      dataInicioReal: "2026-07-18",
      dataPrevEnvioValidacaoObras: "2026-07-29",
      dataEnvioRealValidacaoObras: "",
      dataValidacaoObras: "",
      dataPrevistaEntrega: "2026-08-02",
      dataEntregaReal: "",
      observacao: "Fechamento do EV base para PA Recife Norte.",
      sicIds: [],
    },
    {
      id: "DEM-018",
      obraId: "obra-campinas",
      tipo: "SIC",
      sprintId: "sprint-4",
      analistaResponsavel: "Bruno Sato",
      analistasComplementares: [],
      prioridade: "Alta",
      coluna: "validacaoST",
      dataPrevistaInicio: "2026-07-20",
      dataInicioReal: "2026-07-20",
      dataPrevEnvioValidacaoObras: "2026-07-26",
      dataEnvioRealValidacaoObras: "",
      dataValidacaoObras: "",
      dataPrevistaEntrega: "2026-07-30",
      dataEntregaReal: "",
      observacao: "Blindagem de sala de imagem.",
      sicIds: ["SIC-018"],
    },
    {
      id: "DEM-019",
      obraId: "obra-ibirapuera",
      tipo: "ReemissaoCompleta",
      sprintId: "sprint-4",
      analistaResponsavel: "Marina Lopes",
      analistasComplementares: ["Renata Alves"],
      prioridade: "Baixa",
      coluna: "fazer",
      dataPrevistaInicio: "2026-08-01",
      dataInicioReal: "",
      dataPrevEnvioValidacaoObras: "2026-08-10",
      dataEnvioRealValidacaoObras: "",
      dataValidacaoObras: "",
      dataPrevistaEntrega: "2026-08-14",
      dataEntregaReal: "",
      observacao: "Revisão ampla prevista após projeto arquitetônico executivo.",
      sicIds: [],
    },
  ],
  sics: [
    {
      id: "SIC-007",
      obraId: "obra-ibirapuera",
      demandaId: "DEM-007",
      disciplinasAfetadas: [
        { disciplinaId: "adequacoes-civis", valorDelta: 9800000 },
        { disciplinaId: "equipamentos-climatizacao", valorDelta: 3200000 },
        { disciplinaId: "quadros-eletricos", valorDelta: 1684426.56 },
      ],
      motivo: "AlteracaoProjeto",
      descricao: "Decomposição do delta v3 para v4 sem uso de linha genérica.",
      documentoUrl: "",
      status: "Aprovado",
      aprovadoPor: "Gestão ST",
      dataAbertura: "2026-06-26",
      dataAprovacao: "2026-06-28",
    },
    {
      id: "SIC-004",
      obraId: "obra-recife",
      demandaId: "DEM-012",
      disciplinasAfetadas: [
        { disciplinaId: "climatizacao-exaustao", valorDelta: 600000 },
        { disciplinaId: "marcenaria", valorDelta: 600000 },
      ],
      motivo: "SolicitacaoCampo",
      descricao: "Ajuste de carga térmica e layout de recepção.",
      documentoUrl: "",
      status: "Aprovado",
      aprovadoPor: "Gestão ST",
      dataAbertura: "2026-06-01",
      dataAprovacao: "2026-06-02",
    },
    {
      id: "SIC-018",
      obraId: "obra-campinas",
      demandaId: "DEM-018",
      disciplinasAfetadas: [{ disciplinaId: "blindagem", valorDelta: 460000 }],
      motivo: "AlteracaoProjeto",
      descricao: "Blindagem adicional para sala de tomografia.",
      documentoUrl: "",
      status: "Pendente",
      aprovadoPor: "",
      dataAbertura: "2026-07-25",
      dataAprovacao: "",
    },
  ],
  contracts: [
    {
      id: "CTR-001",
      obraId: "obra-ibirapuera",
      disciplinaId: "projetos-tecnicos",
      fornecedorId: "forn-engebase",
      valor: 2400000,
      data: "2026-04-18",
      responsavelSuprimentos: "Carla Nunes",
      numeroContrato: "CT-2026-091",
    },
    {
      id: "CTR-002",
      obraId: "obra-ibirapuera",
      disciplinaId: "adequacoes-civis",
      fornecedorId: "forn-construmais",
      valor: 21400000,
      data: "2026-06-30",
      responsavelSuprimentos: "Carla Nunes",
      numeroContrato: "CT-2026-113",
    },
    {
      id: "CTR-003",
      obraId: "obra-recife",
      disciplinaId: "projetos-tecnicos",
      fornecedorId: "forn-engebase",
      valor: 690000,
      data: "2026-05-04",
      responsavelSuprimentos: "Daniel Rocha",
      numeroContrato: "CT-2026-104",
    },
    {
      id: "CTR-004",
      obraId: "obra-campinas",
      disciplinaId: "projetos-legalizacao",
      fornecedorId: "forn-prolegal",
      valor: 240000,
      data: "2026-07-10",
      responsavelSuprimentos: "Daniel Rocha",
      numeroContrato: "CT-2026-141",
    },
  ],
  suppliers: [
    {
      id: "forn-engebase",
      razaoSocial: "Engebase Projetos Integrados",
      cnpj: "12.345.678/0001-90",
      contatoPrincipal: "Luciana Ramos",
    },
    {
      id: "forn-construmais",
      razaoSocial: "Construmais Engenharia Hospitalar",
      cnpj: "22.418.779/0001-40",
      contatoPrincipal: "Eduardo Melo",
    },
    {
      id: "forn-prolegal",
      razaoSocial: "ProLegal Licenciamento Técnico",
      cnpj: "31.200.888/0001-18",
      contatoPrincipal: "Patrícia Gomes",
    },
  ],
  users: [
    { id: "usr-admin", nome: "Administrador SLT", email: "admin.slt@hapvida.com.br", perfil: "Admin", senha: "admin360", status: "Ativo" },
    { id: "usr-gestao", nome: "Gestão Sala Técnica", email: "gestao.slt@hapvida.com.br", perfil: "Gestão", senha: "gestao360", status: "Ativo" },
    { id: "usr-analista", nome: "Analista Obras", email: "analista.obras@hapvida.com.br", perfil: "Analista", senha: "analista360", status: "Ativo" },
    { id: "usr-analista-orcamento", nome: "Analista de Orçamento", email: "analista.orcamento@hapvida.com.br", perfil: "Analista de Orçamento", senha: "orcamento360", status: "Ativo" },
    { id: "usr-analista-projetos", nome: "Analista de Projetos", email: "analista.projetos@hapvida.com.br", perfil: "Analista de Projetos", senha: "projetos360", status: "Ativo" },
  ],
  activeRole: "Gestão",
  deletedDemands: [],
  sprints: [
    { id: "sprint-3", nome: "Sprint 3", dataInicio: "2026-06-15", dataFim: "2026-06-30", status: "Encerrada" },
    { id: "sprint-4", nome: "Sprint 4", dataInicio: "2026-07-15", dataFim: "2026-07-31", status: "Ativa" },
  ],
  history: [
    {
      id: "HIS-001",
      entidade: "sic",
      entidadeId: "SIC-007",
      campo: "disciplinasAfetadas",
      valorAnterior: "Outras Linhas do EV",
      valorNovo: "Adequações Civis, Equipamentos de Climatização, Quadros Elétricos",
      usuario: "Gestão ST",
      timestamp: "2026-06-28T14:20:00",
    },
  ],
};

const importedState = globalThis.TRACO_IMPORTED_STATE || {};
const IMPORT_SIGNATURE = [
  importedState.storageKey || STORAGE_KEY,
  importedState.source || "base-interna",
  importedState.sourceSheet || "",
  importedState.schemaSource || "",
  importedState.version || "",
  importedState.works?.length || 0,
  importedState.history?.[0]?.timestamp || "",
]
  .filter(Boolean)
  .join("|");
const baseState = {
  ...defaultState,
  ...importedState,
  importSignature: IMPORT_SIGNATURE,
  users: importedState.users || defaultState.users,
  activeRole: importedState.activeRole || defaultState.activeRole,
  sicBi: globalThis.SIC_BI_DATA || { records: [], demandSummary: [] },
  investmentPlan: globalThis.INVESTMENT_PLAN_DATA || { source: "", sheet: "", records: [] },
  unitRegistry: globalThis.UNIT_REGISTRY_DATA || { source: "", sheet: "", records: [] },
  maintenanceBi: globalThis.MAINTENANCE_DATA || { source: "", sheet: "", records: [] },
  capexControl: globalThis.CAPEX_CONTROL_DATA || { source: "", baseOi: [], dePara: [], transferencias: [], consumo: {} },
  commissionObras: globalThis.COMMISSION_OBRAS_DATA || { source: "", sheet: "", summary: {}, records: [] },
  maintenanceDemands:
    importedState.maintenanceDemands ||
    maintenanceDemandsFromImportedData(globalThis.MAINTENANCE_DATA?.records || []),
};

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
let selectedWorkId = state.works[0]?.id || "";
let searchTerm = "";
let operationalViewMode = "kanban";
let operationalFilters = {
  query: "",
  sprintId: "",
  analyst: "",
  type: "",
  status: "",
  punctuality: "",
};
let managementStatusFilter = "all";
let strategicHistoricalQuery = "";
let strategicHistoricalFilters = { year: "", region: "", status: "" };
let evShowNotApplicable = false;
let evAssistantQuery = "";
let evHistoricalFilters = { query: "", year: "", typology: "", discipline: "" };
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
let haptecPosition = loadHaptecPosition();
let haptecDragState = null;
let haptecSuppressToggleClick = false;
let demandWizardDraft = {};
let workModalReturnMode = "";
let workModalPlanDraft = null;
let portfolioQuickFilters = {
  query: "",
  tipoUnidade: "",
  regional: "",
  evStatus: "",
};
let investmentPlanFilters = {
  query: "",
  etapa: "Projetos",
  status: "",
  regiao: "",
  dateFrom: "",
  dateTo: "",
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

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.importSignature === baseState.importSignature) {
        return normalizeState(parsed);
      }
      console.info("Base do Orçamento 360 atualizada; estado local anterior ignorado.", {
        anterior: parsed.importSignature || "sem assinatura",
        atual: baseState.importSignature,
      });
    }
  } catch (error) {
    console.warn("Não foi possível carregar estado local.", error);
  }
  return normalizeState(baseState);
}

function normalizeState(saved) {
  const base = clone(baseState);
  const sprints = arrayOrFallback(saved.sprints, base.sprints);
  const savedMaintenanceDemands = Array.isArray(saved.localMaintenanceDemands)
    ? saved.localMaintenanceDemands
    : arrayOrFallback(saved.maintenanceDemands);
  const baseMaintenanceDemands = arrayOrFallback(base.maintenanceDemands);
  const works = arrayOrFallback(saved.works, base.works);
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
    activeRole: roleDefinitions[saved.activeRole] ? saved.activeRole : base.activeRole || "Gestão",
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
    projectDemands: arrayOrFallback(saved.projectDemands, base.projectDemands),
    projectStatusOverrides: saved.projectStatusOverrides && typeof saved.projectStatusOverrides === "object" ? saved.projectStatusOverrides : {},
    history: arrayOrFallback(saved.history, base.history),
  };
}

function normalizeDemands(demands = [], works = []) {
  return arrayOrFallback(demands).map((item) => normalizeDemandRecord(item, works));
}

function normalizeDemandRecord(item = {}, works = []) {
  const demand = {
    ...item,
    analistasComplementares: arrayOrFallback(item.analistasComplementares),
    sicIds: arrayOrFallback(item.sicIds),
    anexos: arrayOrFallback(item.anexos),
  };
  if (demandTypeKey(demand.tipo) !== "SIC") return demand;

  const rawMetadata = demand.sicMetadata && typeof demand.sicMetadata === "object" ? demand.sicMetadata : {};
  const metadataAttachments = arrayOrFallback(rawMetadata.anexos);
  const attachments = uniqueAttachments([...demand.anexos, ...metadataAttachments]);
  const posted = demand.sicIds.length > 0 || rawMetadata.postadaNoEv === true || demand.sicApprovalStatus === "Postada";
  const knownStatus = ["Pendente", "Em revisão", "Aprovado", "Reprovado", "Postada"].includes(demand.sicApprovalStatus);
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
      tituloSic: rawMetadata.tituloSic || demand.tituloSic || demand.titulo || demand.observacao || "",
      numeroSic: rawMetadata.numeroSic || demand.numeroSic || rawMetadata.lecomNumber || demand.lecomNumber || "",
      descricaoSic: rawMetadata.descricaoSic || demand.descricaoSic || demand.observacao || "",
      analistaSalaTecnica: rawMetadata.analistaSalaTecnica || demand.analistaSalaTecnica || demand.analistaResponsavel || "",
      motivo: rawMetadata.motivo || demand.motivo || "InformacaoContratada",
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

function normalizeMaintenanceDemands(demands = [], sprints = []) {
  return normalizeMaintenanceFinancials(demands).map((item) => normalizeMaintenanceSprintLink(item, sprints));
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

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedStatePayload()));
  } catch (error) {
    console.warn("Não foi possível persistir no localStorage; alteração mantida na sessão atual.", error);
    showToast("A demanda foi salva na tela, mas o navegador bloqueou a gravação local. Exporte antes de atualizar.");
  }
}

function persistedStatePayload() {
  return {
    importSignature: state.importSignature,
    works: arrayOrFallback(state.works),
    demands: arrayOrFallback(state.demands),
    sics: arrayOrFallback(state.sics),
    contracts: arrayOrFallback(state.contracts),
    suppliers: arrayOrFallback(state.suppliers),
    funds: arrayOrFallback(state.funds),
    fundMovements: arrayOrFallback(state.fundMovements),
    budgetRevisions: arrayOrFallback(state.budgetRevisions),
    users: arrayOrFallback(state.users),
    activeRole: state.activeRole || "Gestão",
    deletedDemands: arrayOrFallback(state.deletedDemands),
    deletedMaintenanceDemands: arrayOrFallback(state.deletedMaintenanceDemands),
    sprints: arrayOrFallback(state.sprints),
    history: arrayOrFallback(state.history),
    capexManualOiRows: arrayOrFallback(state.capexManualOiRows),
    projectStatusOverrides: state.projectStatusOverrides || {},
    evTypologyOverrides: state.evTypologyOverrides || {},
    localMaintenanceDemands: compactMaintenanceDemandsForStorage(state.maintenanceDemands),
  };
}

function activeUsers() {
  return arrayOrFallback(state.users).filter((user) => normalizeSearchText(user.status || "Ativo") !== "inativo");
}

function userById(id) {
  return activeUsers().find((user) => user.id === id);
}

function normalizeUserProfile(perfil) {
  return roleDefinitions[perfil] ? perfil : "Analista";
}

function defaultPasswordForProfile(perfil) {
  const profile = normalizeUserProfile(perfil);
  if (profile === "Admin") return "admin360";
  if (profile === "Gestão") return "gestao360";
  if (profile === "Analista de Orçamento") return "orcamento360";
  if (profile === "Analista de Projetos") return "projetos360";
  return "analista360";
}

function defaultAccessModulesForProfile(perfil) {
  const profile = normalizeUserProfile(perfil);
  if (profile === "Analista de Orçamento") return ["works"];
  if (profile === "Analista de Projetos") return ["projects"];
  if (profile === "Analista") return ["projects", "works", "maintenance", "clinical"];
  return userAccessModules.map((module) => module.id);
}

function normalizeAccessModules(modules, perfil) {
  const valid = new Set(userAccessModules.map((module) => module.id));
  const source = Array.isArray(modules) && modules.length ? modules : defaultAccessModulesForProfile(perfil);
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
    ...user,
    perfil,
    senha: String(user.senha || user.password || defaultPasswordForProfile(perfil)).trim(),
    status: user.status || "Ativo",
    accessModules,
    accessViews: accessViewsForModules(accessModules),
    mustChangePassword: user.mustChangePassword === true || user.senhaProvisoria === true || user.forcePasswordChange === true,
    senhaProvisoria: user.senhaProvisoria === true || user.mustChangePassword === true || user.forcePasswordChange === true,
  };
}

function loadAuthSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
    if (saved?.userId) return saved;
  } catch (error) {
    console.warn("Não foi possível carregar a sessão do SLT 360.", error);
  }
  return null;
}

function saveAuthSession(session = authSession) {
  try {
    if (session?.userId) localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(AUTH_SESSION_KEY);
  } catch (error) {
    console.warn("Não foi possível salvar a sessão do SLT 360.", error);
  }
}

function currentUser() {
  if (!authSession?.userId) return null;
  const user = userById(authSession.userId);
  if (!user) {
    authSession = null;
    saveAuthSession(null);
    return null;
  }
  return user;
}

function isAuthenticated() {
  return Boolean(currentUser());
}

function loginUser(userId) {
  const user = userById(userId);
  if (!user) return false;
  authSession = {
    userId: user.id,
    nome: user.nome,
    perfil: normalizeUserProfile(user.perfil),
    loggedAt: new Date().toISOString(),
  };
  state.activeRole = authSession.perfil;
  saveAuthSession(authSession);
  saveState();
  return true;
}

function userByEmail(email) {
  const normalizedEmail = normalizeSearchText(email);
  if (!normalizedEmail) return null;
  return activeUsers().find((user) => normalizeSearchText(user.email) === normalizedEmail) || null;
}

function validateUserPassword(user, senha) {
  return String(user?.senha || "").trim() === String(senha || "").trim();
}

function loginWithCredentials(email, senha) {
  const user = userByEmail(email);
  if (!user || !validateUserPassword(user, senha)) return false;
  return loginUser(user.id);
}

function logoutUser() {
  authSession = null;
  saveAuthSession(null);
  currentView = "dashboard";
  closeModal();
  render();
}

function authenticatedRole() {
  return normalizeUserProfile(currentUser()?.perfil || state.activeRole || "Gestão");
}

function roleModuleAccessConfig(role = authenticatedRole()) {
  const base = {
    projects: true,
    works: true,
    maintenance: true,
    clinical: true,
    budget: true,
    settings: true,
  };
  if (role === "Analista de Orçamento") {
    return { ...base, projects: false, maintenance: false, clinical: false, budget: false, settings: false };
  }
  if (role === "Analista de Projetos") {
    return { ...base, works: false, maintenance: false, clinical: false, budget: false, settings: false };
  }
  if (role === "Analista") {
    return { ...base, budget: false, settings: false };
  }
  return base;
}

function moduleAccessConfig(role = authenticatedRole(), user = currentUser()) {
  const modules = normalizeAccessModules(user?.accessModules, role);
  if (user && modules.length) {
    return userAccessModules.reduce((config, option) => {
      config[option.id] = modules.includes(option.id);
      return config;
    }, {});
  }
  return roleModuleAccessConfig(role);
}

function canAccessModule(module, role = authenticatedRole(), user = currentUser()) {
  return moduleAccessConfig(role, user)[module] !== false;
}

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

function compactMaintenanceDemandsForStorage(demands = []) {
  const normalizedBase = normalizeMaintenanceDemands(arrayOrFallback(baseState.maintenanceDemands), state.sprints || baseState.sprints || []);
  const baseMap = new Map(normalizedBase.map((item) => [maintenanceDemandKey(item), JSON.stringify(item)]));
  return arrayOrFallback(demands).filter((item) => {
    const key = maintenanceDemandKey(item);
    return !baseMap.has(key) || baseMap.get(key) !== JSON.stringify(item);
  });
}

function money(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
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
  if (abs >= 1000000000) return `R$ ${number(amount / 1000000000, 1)} bi`;
  if (abs >= 1000000) return `R$ ${number(amount / 1000000, 1)} mi`;
  if (abs >= 1000) return `R$ ${number(amount / 1000, 0)} mil`;
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

function executiveMoney(value) {
  const amount = Number(value) || 0;
  const compact = moneyCompact(amount);
  const exact = money(amount);
  return Math.abs(amount) >= 1000000
    ? `<span class="executive-money" title="${escapeAttribute(exact)}"><strong>${compact}</strong><small>${exact}</small></span>`
    : `<span class="executive-money"><strong>${exact}</strong></span>`;
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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

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
  if (!/[ÃÂ]/.test(text)) return text || "Não informado";
  try {
    const bytes = Array.from(text)
      .map((char) => {
        const code = char.charCodeAt(0);
        return code <= 255 ? `%${code.toString(16).padStart(2, "0")}` : encodeURIComponent(char);
      })
      .join("");
    return decodeURIComponent(bytes).replace(/Â/g, "").trim() || text;
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
  if (normalized.includes("nao iniciado") || normalized.includes("não iniciado")) return "naoIniciado";
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
    const rawPhase = importedText(recordValue(record, ["Fase atual", "FASE ATUAL", "Status"]), "NÃO INICIADO");
    const phase = normalizeMaintenancePhase(rawPhase);
    const unitName = importedText(recordValue(record, ["NOME DA UNIDADE", "UNIDADE"]), "Unidade não informada");
    const workName = importedText(recordValue(record, ["NOME DA OBRA", "OBRA", "Título", "TITULO"]), unitName);
    const os = importedText(recordValue(record, ["ORDEM DE SERVIÇO", "OS"]), "S/OS");
    const code = importedText(recordValue(record, ["Código", "CODIGO"]), "");
    const tipoDespesa = importedText(recordValue(record, ["TIPO DE DESPESA"]), "OPEX");
    const isOpex = normalizeSearchText(tipoDespesa).includes("opex");
    return {
      id: `MAN-${String(index + 1).padStart(4, "0")}`,
      codigoOrigem: code,
      ordemInterna: importedText(recordValue(record, ["ORDEM INTERNA"]), ""),
      ordemServico: os,
      titulo: workName,
      unidadeNome: unitName,
      unidadeId: importedText(recordValue(record, ["CÓDIGO UNIDADE", "CODIGO UNIDADE", "CENTRO"]), ""),
      tipologia: importedText(recordValue(record, ["TIPOLOGIA"]), "Não informada"),
      uf: importedText(recordValue(record, ["ESTADO DA UNIDADE", "UF"]), ""),
      estado: importedText(recordValue(record, ["ESTADO"]), ""),
      regiao: importedText(recordValue(record, ["REGIÃO", "REGIAO", "REGIÃO 2", "REGIAO 2"]), ""),
      regional: importedText(recordValue(record, ["REGIONAL"]), ""),
      cnpj: importedText(recordValue(record, ["CNPJ"]), ""),
      endereco: "",
      cep: importedText(recordValue(record, ["CEP"]), ""),
      requisicaoCompra: code && code !== "S/CÓDIGO" ? code : "",
      centroCusto: importedText(recordValue(record, ["CENTRO DE CUSTO"]), "Manutenção predial"),
      tipoDemanda: "Normal",
      tipoDespesa,
      coluna: phase,
      fasePipefy: rawPhase,
      dataInicio: createdAt,
      dataFim: finishedAt,
      dataPrevistaEntrega: dueAt || finishedAt || "",
      valorProposta: parseImportedNumber(recordValue(record, ["VALOR DA PROPOSTA INICIAL", "VALOR PROPOSTA INICIAL", "PROPOSTA INICIAL", "VALOR DA PROPOSTA"])),
      valorSalaTecnica: parseImportedNumber(recordValue(record, ["VALOR SALA TECNICA", "VALOR SALA TÉCNICA"])),
      valorNegociado: isOpex ? 0 : parseImportedNumber(recordValue(record, ["VALOR NEGOCIADO"])),
      sprintId: "",
      sprint: importedText(recordValue(record, ["SPRINT"]), "Sem sprint"),
      planejamento: importedText(recordValue(record, ["DESCRIÇÃO CENTRO FINANCEIRO", "PLANEJAMENTO"]), ""),
      observacoes: importedText(recordValue(record, ["OBSERVAÇÕES GERAIS", "OBSERVACOES GERAIS"]), ""),
      analistaResponsavel: importedText(recordValue(record, ["Responsáveis", "RESPONSAVEIS", "RESPONSÁVEIS"]), ""),
      prioridade: phase === "devolvido" ? "Alta" : "Média",
      phaseStartedAt: phase === "naoIniciado" ? createdAt : updatedAt,
      createdAt,
      updatedAt,
      historico: [
        { fase: "Entrada", data: createdAt, observacao: "Registro importado do relatório de manutenção." },
        ...(finishedAt ? [{ fase: rawPhase, data: finishedAt, observacao: "Última fase registrada no relatório." }] : []),
      ],
    };
  });
}

function maintenanceDemandKey(item) {
  return normalizeSearchText([item?.id, item?.ordemServico, item?.titulo, item?.unidadeNome].filter(Boolean).join("|"));
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
  return disciplines.find((discipline) => discipline.id === canonicalId) || {
    id,
    nome: id,
    categoria: "OutrasCategorias",
    posicao: 999,
    selecionavelParaSIC: false,
  };
}

function isRiskLine(line) {
  return canonicalDisciplineId(line.disciplinaId) === "taxa-risco";
}

function workById(id) {
  return state.works.find((work) => work.id === id);
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
  line.status = total ? "Orçado" : "Não se aplica";
  line.sicIds = postedSics.map((sic) => sic.id);
  line.riskExceeded = riskReadings.some((reading) => reading.exceeded);
  line.sicDetails = postedSics.map((sic) => {
    const risk = sicRiskReading(work, sic);
    return {
      id: sic.id,
      numeroSic: sic.numeroSic || sic.id,
      lecomNumber: sic.lecomNumber || "",
      titulo: sic.titulo || sic.descricao || "SIC sem título",
      valor: sicTotal(sic),
      status: sic.status || "Pendente",
      riskExceeded: risk.exceeded,
      riskReserve: risk.reserve,
      riskAvailable: risk.available,
      riskExcess: risk.excess,
    };
  });
}

function syncCompletedDemandWithEV(work, demand) {
  if (!work || !demand) return false;
  work.ev.lines = work.ev.lines || [];
  const applicableLines = work.ev.lines.filter((line) => {
    const status = normalizeEVLineStatus(line.status);
    return !isRiskLine(line) && status !== "Não se aplica" && Number(line.valorOrcado || 0) > 0;
  });
  if (!applicableLines.length) return false;

  work.ev.demandaIds = [...new Set([...(work.ev.demandaIds || []), demand.id])];
  applicableLines.forEach((line) => {
    line.demandaIds = [...new Set([...(line.demandaIds || []), demand.id])];
  });

  const totals = workTotals(work);
  const totalValue = totals.orcado + totals.aditivado;
  const existingVersion = (work.ev.versions || []).find((version) => version.origem === demand.id);
  if (!existingVersion) {
    work.ev.versaoAtual = Number(work.ev.versaoAtual || 0) + 1;
    work.ev.versions = work.ev.versions || [];
    work.ev.versions.push({
      numero: work.ev.versaoAtual,
      data: todayISO(),
      origem: demand.id,
      valorTotal: totalValue,
      custoM2: totalValue / Math.max(work.areaEquivalente || 0, 1),
      diffPorDisciplina: applicableLines.map((line) => ({
        disciplinaId: canonicalDisciplineId(line.disciplinaId),
        valorAntes: 0,
        valorDepois: Number(line.valorOrcado || 0),
      })),
    });
  }

  work.ev.status = deriveEVStatus(work);
  addHistory({
    entidade: "ev",
    entidadeId: work.ev.id || work.id,
    campo: "conclusão operacional",
    valorAnterior: existingVersion ? `EV já vinculado ao card ${demand.id}` : "Sem versão do card",
    valorNovo: `${demand.id} | ${demandTypeLabel(demand.tipo)} | ${money(totalValue)}`,
  });
  return true;
}

function workTotals(work, options = {}) {
  const includeRisk = options.includeRisk === true;
  const includeInitialBudgetFallback = options.includeInitialBudgetFallback === true;
  const lines = work?.ev?.lines || [];
  const totals = lines.reduce(
    (total, line) => {
      if (normalizeEVLineStatus(line.status) === "Não se aplica") return total;
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
    (line) => !isRiskLine(line) && normalizeEVLineStatus(line.status) !== "Não se aplica" && Number(line.valorOrcado || 0) > 0
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

function strategicCostTargetForWork(work) {
  const manualTargetId = String(work?.metaCustoM2TargetId || work?.metaCustoM2 || "").trim();
  const manualTarget = strategicCostTargets.find((target) => target.id === manualTargetId);
  if (manualTarget) return manualTarget;

  const type = normalizeSearchText(work.tipoUnidade);
  const text = normalizeSearchText(`${work.nome} ${work.tipoUnidade} ${work.tipologiaObra} ${work.classificacaoObra}`);

  if (type.includes("pronto atendimento")) {
    return strategicCostTargets.find((target) => target.id === "pronto-atendimento");
  }

  if (type.includes("hospital")) {
    const highComplexitySignals = ["novo hospital", "nova unidade", "hemodinam", "leitos", "uti", "centro cirurg", "maternidade", "alta complexidade"];
    const isHighComplexity = highComplexitySignals.some((signal) => text.includes(signal));
    return strategicCostTargets.find((target) => target.id === (isHighComplexity ? "hospital-alta" : "hospital-media"));
  }

  const compactCareTypes = ["clinica", "diagnostico", "laboratorio", "lab", "tea", "coleta", "medprev"];
  if (compactCareTypes.some((signal) => type.includes(signal) || text.includes(signal))) {
    return strategicCostTargets.find((target) => target.id === "clinicas-diagnosticos-labs-teas");
  }

  return null;
}

function strategicCostTargetOptions(selected = "") {
  return [`<option value="" ${!selected ? "selected" : ""}>Classificação automática pelo sistema</option>`]
    .concat(
      strategicCostTargets.map(
        (target) => `<option value="${target.id}" ${selected === target.id ? "selected" : ""}>${target.label} (${target.targetLabel})</option>`
      )
    )
    .join("");
}

function strategicCostTargetModeLabel(work) {
  const manualTargetId = String(work?.metaCustoM2TargetId || work?.metaCustoM2 || "").trim();
  return manualTargetId ? "Revisada manualmente" : "Automática";
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
    return strategicCostTargets.find((target) => target.id === (isHighComplexity ? "hospital-alta" : "hospital-media"));
  }

  if (type.includes("pronto atendimento") || text.includes("pronto atendimento") || /\bpa\b/.test(text)) {
    return strategicCostTargets.find((target) => target.id === "pronto-atendimento");
  }

  const compactCareTypes = ["clinica", "diagnostico", "laboratorio", "lab", "tea", "coleta", "medprev", "ambulator"];
  if (compactCareTypes.some((signal) => type.includes(signal) || text.includes(signal))) {
    return strategicCostTargets.find((target) => target.id === "clinicas-diagnosticos-labs-teas");
  }

  return null;
}

function commissionBenchmarkByTarget() {
  const grouped = new Map();
  validCommissionObrasRecords().forEach((record) => {
    const target = strategicCostTargetForCommissionRecord(record);
    if (!target) return;
    if (!grouped.has(target.id)) {
      grouped.set(target.id, {
        target,
        records: [],
        area: 0,
        valorSalaTecnica: 0,
        valorNegociado: 0,
        gapSalaTecnicaVsNegociado: 0,
        precoM2Values: [],
      });
    }
    const row = grouped.get(target.id);
    row.records.push(record);
    row.area += Number(record.areaM2) || 0;
    row.valorSalaTecnica += Number(record.valorSalaTecnica) || 0;
    row.valorNegociado += Number(record.valorNegociado) || 0;
    row.gapSalaTecnicaVsNegociado += Number(record.gapSalaTecnicaVsNegociado) || 0;
    row.precoM2Values.push(Number(record.precoM2) || 0);
  });

  grouped.forEach((row) => {
    row.count = row.records.length;
    row.precoM2Ponderado = row.area ? row.valorNegociado / row.area : 0;
    row.precoM2Mediana = median(row.precoM2Values);
    row.savingTecnico = row.valorSalaTecnica - row.valorNegociado;
  });

  return grouped;
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
  const grouped = strategicCostTargets.map((target) => ({
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
  if (status === "Acima da meta") return "Saldo crítico";
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
    return !isRiskLine(line) && status !== "Não se aplica" && Number(line.valorOrcado || 0) > 0;
  });
}

function worksWithCriticalBalance() {
  return state.works.filter((work) => {
    const values = workTotals(work);
    const approvedBudget = values.orcado + values.aditivado;
    return approvedBudget > 0 && values.saldo / approvedBudget < 0.18;
  });
}

function compactNames(items, mapper, limit = 4) {
  if (!items.length) return "";
  const names = items.slice(0, limit).map(mapper);
  const remaining = items.length - names.length;
  return `${names.join(", ")}${remaining > 0 ? ` e mais ${remaining}` : ""}`;
}

function allTotals(options = {}) {
  return state.works.reduce(
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
      demand.dataPrevistaEntrega < TODAY_ISO
  );
}

function isHistoricalWork(work) {
  const status = normalizeSearchText(
    [work?.situacao, work?.status, work?.statusObra, work?.stage, work?.archivedAt ? "arquivada" : ""].filter(Boolean).join(" ")
  );
  return ["concluida", "concluido", "cancelada", "cancelado", "arquivada", "arquivado"].some((item) => status.includes(item));
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
      validation: ["validacaoST", "validacaoObras"].includes(demand.coluna) || normalizeSearchText(status).includes("validacao"),
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
      module: isClinical ? "Eng. Clínica" : "Manutenção",
      title: item.titulo || item.unidadeNome || item.ordemServico || item.id,
      status,
      rawStatus: item.coluna || "",
      dueDate: item.dataPrevistaEntrega || item.dataFim || "",
      responsible: item.analistaResponsavel || "",
      value: maintenanceValue(item),
      active,
      overdue: active && (isMaintenanceLate(item) || Boolean(item.dataPrevistaEntrega && item.dataPrevistaEntrega < TODAY_ISO)),
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

function dashboardSummaryV6() {
  const indicators = dashboardDemandIndicators();
  const activeWorks = (state.works || []).filter((work) => !isHistoricalWork(work));
  const historicalWorks = (state.works || []).filter(isHistoricalWork);
  const investment = (state.works || []).reduce((sum, work) => sum + bestHistoricalWorkValue(work), 0);
  return {
    indicators,
    activeWorks,
    historicalWorks,
    investment,
    availableBalance: positiveFundsBalanceTotal(),
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
    rows = dashboardDemandRows().filter((row) => row.module === "Manutenção");
    value = maintenanceValueTotals(items).salaTecnica;
  }
  if (module === "clinical") {
    const items = maintenanceItemsForModule("clinical");
    rows = dashboardDemandRows().filter((row) => row.module === "Eng. Clínica");
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
  return category === "CustosDaObra" ? "Custos da Obra" : "Outras Categorias";
}

function motivationLabel(value) {
  if (value === "AlteracaoProjeto") return "Alteração de Projeto";
  if (value === "InformacaoContratada") return "Solicitação de Informação da Contratada";
  return "Solicitação de Campo";
}

function demandTypeKey(value) {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (normalized.includes("emissao")) return "EmissaoInicial";
  if (normalized.includes("reemissao") || normalized.includes("revisao")) return "ReemissaoCompleta";
  if (normalized === "sic") return "SIC";
  return value;
}

function demandTypeLabel(value) {
  const map = {
    EmissaoInicial: "Emissão Inicial",
    SIC: "SIC - Solicitação de Informação",
    ReemissaoCompleta: "Revisão completa do EV",
  };
  return map[demandTypeKey(value)] || value;
}

function nextCode(prefix, collection) {
  const items = Array.isArray(collection) ? collection : [];
  const highest = items.reduce((max, item) => {
    const numeric = Number(String(item?.id || "").replace(`${prefix}-`, ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);
  return `${prefix}-${String(highest + 1).padStart(3, "0")}`;
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
    usuario: "Gestão ST",
    timestamp: new Date().toISOString(),
  });
}

function csvCell(value) {
  const text = String(value ?? "").replace(/\r?\n/g, " ").trim();
  return `"${text.replace(/"/g, '""')}"`;
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
      work?.nome || demand.obraNome || "Obra não vinculada",
      work?.codigoOriginal || work?.chaveUnica || "",
      demand.unidadeModo === "existente" ? "Obra em unidade existente" : "Unidade nova",
      demand.unidadeNome || "",
      demand.unidadeTipo || "",
      demand.unidadeMunicipio || "",
      demand.unidadeCnpj || "",
      demand.unidadeCentro || "",
      demand.analistaResponsavel || "A definir",
      sprintById(demand.sprintId)?.nome || demand.sprintId || "",
      demandStatusLabel(demand),
      demand.prioridade || "",
      demand.dataPrevistaInicio || "",
      demand.dataPrevistaEntrega || "",
      demand.dataEntregaReal || "",
      isDemandLate(demand) ? "Atrasado" : "Em dia",
      sicInfo.lecomNumber || "",
      sicInfo.tituloSic || "",
      work ? money(workBudgetValue(work)) : "",
      demand.observacao || "",
    ];
  });
  downloadCsv(
    `SLT360-obras-kanban-${TODAY_ISO}.csv`,
    ["Código", "Tipo", "Obra", "Código obra", "Tipo intervenção", "Unidade base", "Tipo unidade base", "Cidade/UF base", "CNPJ base", "Centro base", "Analista", "Sprint", "Status", "Prioridade", "Início previsto", "Entrega prevista", "Entrega real", "Prazo", "Nº LECOM", "Título SIC", "Valor EV", "Observação"],
    rows
  );
  showToast(`Relatório de Obras exportado com ${rows.length} card(s).`);
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
    `SLT360-${labels.isClinical ? "engenharia-clinica" : "manutencao"}-kanban-${TODAY_ISO}.csv`,
    ["ID", "OS", "Código origem", "Título", "Unidade", "UF", "CNPJ", "Centro de custo", "Tipo demanda", "Tipo despesa", "Tipologia", "Sprint", "Fase", "Analista", "Prioridade", "Início", "Entrega prevista", "Fim", "Lead time", "Tempo na fase", "Valor proposta", "Valor Sala Técnica", "Valor negociado CAPEX", "Equipamento", "Patrimônio/série", "Fabricante", "Modelo", "Planejamento", "Observações"],
    rows
  );
  showToast(`Relatório de ${labels.short} exportado com ${rows.length} card(s).`);
}

function activeRole() {
  return authenticatedRole();
}

function canAccessView(view) {
  if (view === "dashboard") return true;
  const normalized = viewAliases[view] || view;
  const user = currentUser();
  const module = viewModule(view);
  if (module !== "home" && !canAccessModule(module)) return false;
  if (user?.accessViews?.length && module !== "home") return user.accessViews.includes(normalized);
  const blockedViews = roleDefinitions[activeRole()]?.blockedViews || [];
  return !blockedViews.includes(normalized);
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
    chip.textContent = user ? `${user.nome} · ${requiresPasswordChange ? "Primeiro acesso" : role}` : "Acesso";
    chip.title = user?.email || roleDefinitions[role]?.description || "";
  }
  const headerSearch = document.querySelector(".header-actions .search-box");
  const headerNewDemand = document.querySelector('.header-actions [data-action="open-demand"], .header-actions [data-action="open-global-demand"]');
  const isHome = currentView === "dashboard" || !user || requiresPasswordChange;
  if (headerSearch) headerSearch.hidden = isHome;
  if (headerNewDemand) headerNewDemand.hidden = isHome;
  const logoutButton = document.querySelector('[data-action="logout"]');
  if (logoutButton) logoutButton.hidden = !user;
}

function setView(view) {
  if (view === "investmentPlan" || view === "projectsPlan") view = "projectsPortfolio";
  view = viewAliases[view] || view;
  if (!canAccessView(view)) {
    showToast("Seu perfil não possui acesso a esta visão.");
    view = "dashboard";
  }
  currentView = view;
  document.querySelectorAll("[data-view]").forEach((button) => {
    const isTopProjects = button.dataset.module === "projects" && projectViewIds.includes(view);
    const isTopWorks = button.dataset.module === "works" && worksViewIds.includes(view);
    const isTopMaintenance = button.dataset.module === "maintenance" && maintenanceViewIds.includes(view);
    const isTopClinical = button.dataset.module === "clinical" && clinicalViewIds.includes(view);
    const aliasedButtonView = viewAliases[button.dataset.view] || button.dataset.view;
    button.classList.toggle("is-active", aliasedButtonView === view || isTopProjects || isTopWorks || isTopMaintenance || isTopClinical);
  });
  render();
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.querySelector(".app-shell")?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
}

function render() {
  if (!isAuthenticated()) {
    app.innerHTML = renderLoginScreen();
    applyRolePermissions();
    return;
  }
  const authenticatedUser = currentUser();
  if (authenticatedUser?.mustChangePassword || authenticatedUser?.senhaProvisoria) {
    app.innerHTML = renderFirstAccessPasswordScreen(authenticatedUser);
    applyRolePermissions();
    return;
  }
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
    worksSettings: renderWorksSettings,
    kanban: renderWorksOperational,
    portfolio: renderPortfolio,
    investmentPlan: renderProjectsPortfolio,
    ev: renderEV,
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
    analytics: renderAnalytics,
    suppliers: renderSuppliers,
    settings: renderSettings,
  };
  app.innerHTML = `${(views[currentView] || renderDashboard)()}${renderHaptecAssistant()}`;
  applyRolePermissions();
  scheduleDashboardCharts();
}

function scheduleDashboardCharts() {
  const callback = () => {
    renderTransferDashboardCharts();
    renderHapcapexDashboardCharts();
    hydrateSicApprovalDashboardFrame();
  };
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(callback);
    return;
  }
  setTimeout(callback, 0);
}

function hydrateSicApprovalDashboardFrame() {
  const frame = document.querySelector("[data-sic-approval-dashboard-frame]");
  if (!frame || frame.dataset.loaded === "true") return;
  frame.dataset.loaded = "true";
  if (typeof window !== "undefined" && window.SIC_APPROVAL_DASHBOARD_HTML) {
    frame.srcdoc = window.SIC_APPROVAL_DASHBOARD_HTML;
  }
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
  name: "Haptec360",
  role: "assistente generativo, guia de navegação, analista de dados e auditor proativo do SLT 360",
  missingData:
    "Ainda não encontrei esse dado atualizado no SLT 360. Gostaria de navegar até a tela de cadastro para inseri-lo?",
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
  if (currentView === "dashboard") return "Início";
  if (projectViewIds.includes(currentView)) return "Projetos 360";
  if (["portfolio", "investmentPlan"].includes(currentView)) return "Portfólio de Orçamento";
  if (["worksOperational", "kanban"].includes(currentView)) return "Operacional de Orçamento";
  if (currentView === "worksManagement") return "Gerencial de Orçamento";
  if (currentView === "worksStrategic") return "Estratégica de Orçamento";
  if (currentView === "ev") return "EV";
  if (currentView === "sics") return "SICs";
  if (currentView === "maintenanceOperational") return "Operacional de Manutenção";
  if (maintenanceViewIds.includes(currentView)) return "Manutenção 360";
  if (currentView === "clinical") return "Engenharia Clínica";
  if (currentView === "budget") return "Controle de Verbas";
  return "SLT 360";
}

function haptecWelcomeText() {
  return haptecWithFace(
    "smiling_ready",
    `${haptecGreeting()}! Sou o Haptec360, seu guia, analista de dados e auditor da Sala Técnica. Posso te ajudar a navegar, encontrar obras, conferir Kanban, EVs, SICs, verbas e indicadores. Você está em ${haptecCurrentContext()}.`
  );
}

function haptecViewHelp() {
  if (currentView === "dashboard") {
    return "Na tela inicial você escolhe o módulo principal: Projetos 360, Orçamento 360, Manutenção 360, Eng. Clínica 360 ou Controle de Verbas 360. É o hub integrador da Sala Técnica, feito para entrar rápido no fluxo certo.";
  }
  if (projectViewIds.includes(currentView)) {
    return "Em Projetos 360 você acompanha o Plano de Investimento, prazos de entrega de projetos e o Kanban que alimenta o início da orçamentação na Sala Técnica.";
  }
  if (["portfolio", "investmentPlan"].includes(currentView)) {
    return "No Portfólio de Orçamento ficam as obras cadastradas para EV e orçamento. Use a busca e filtros para localizar a obra, abrir o EV, editar cadastro ou criar uma demanda de orçamento.";
  }
  if (["worksOperational", "kanban"].includes(currentView)) {
    return "No Operacional do Orçamento 360 você acompanha a esteira em Kanban ou lista. Caminho rápido: filtre a sprint ou analista, clique no card, atualize status e confira EV antes de concluir.";
  }
  if (currentView === "ev") {
    return "Na aba EV você consulta ou preenche o Estudo de Viabilidade por obra. Use a busca assistida, abra o EV e preencha valores por disciplina, inclusive SICs na linha 32.";
  }
  if (currentView === "sics") {
    return "Na visão de SICs você acompanha histórico, linha do tempo, visão executiva e diagnóstico. Use os filtros para achar obra, disciplina, sprint ou tipologia.";
  }
  if (currentView === "maintenanceOperational") {
    return "No Operacional de Manutenção o Kanban segue as fases Pipefy. Use os filtros de sprint, fase, tipo de despesa, centro de custo e tipologia para limpar a fila.";
  }
  if (maintenanceViewIds.includes(currentView)) {
    return "Em Manutenção 360 você analisa OS, lead time, valores de proposta, valor Sala Técnica, saving técnico e concentração por unidade, estado, tipologia e centro de custo.";
  }
  if (currentView === "budget") {
    return "No Controle de Verbas você cruza verba aportada, EV, contratação, risco e SICs. É a régua financeira do projeto, antes que algum valor saia do prumo.";
  }
  return `Você está em ${haptecCurrentContext()}. Posso te indicar filtros, atalhos e próximos passos da navegação.`;
}

function haptecModuleSummary() {
  return [
    "Projetos 360: Plano de Investimento, prazos de entrega de projetos, Kanban e gatilho para início da orçamentação.",
    "Orçamento 360: portfólio, EV, orçamentação, SICs, planejamento, cronograma e visões gerenciais.",
    "Manutenção 360: OS, unidades, Kanban, SLA, lead time, valores, saving técnico e desempenho operacional.",
    "Eng. Clínica 360: parque tecnológico, ativos, OS, demandas assistenciais, qualidade e histórico por equipamento.",
    "Controle de Verbas 360: FEL, verba aportada, EV, contratação, risco, aditivos, SICs e governança orçamentária."
  ].join("\n");
}

function haptecTopEVWork() {
  return state.works
    .map((work) => ({ work, value: workBudgetValue(work) }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)[0];
}

function haptecTopEVAnswer() {
  const top = haptecTopEVWork();
  if (!top) return haptecMissingDataMessage("Ainda não encontrei EV com valor preenchido. Caminho sugerido: Orçamento 360 > EV > Abrir EV.");
  const area = top.work.areaEquivalente || top.work.areaConstruida || 0;
  const costM2 = area ? top.value / area : 0;
  return [
    `A obra com maior valor de EV hoje é ${top.work.nome}.`,
    `Valor do EV: ${money(top.value)}.`,
    `${top.work.regiao || "Sem região"} | ${top.work.tipoUnidade || "Sem tipologia"}${costM2 ? ` | ${money(costM2)}/m²` : ""}.`,
    "Próximo passo: abrir a composição do EV para validar disciplinas de maior impacto."
  ].join("\n");
}

function haptecPortfolioDataAnswer() {
  const totals = allTotals();
  const capex = totals.orcado + totals.aditivado;
  const completed = state.works.filter((work) => work.ev.status === "Completo").length;
  const pending = state.works.length - completed;
  const top = haptecTopEVWork();
  return [
    `O portfólio tem ${state.works.length} obra(s).`,
    `CAPEX/EV consolidado: ${money(capex)}.`,
    `${completed} EV(s) completo(s), ${pending} pendente(s).`,
    top ? `Maior EV: ${top.work.nome}, com ${money(top.value)}.` : "Ainda sem EV valorizado."
  ].join("\n");
}

function haptecSicDataAnswer() {
  const total = state.sics.length;
  if (!total) return haptecMissingDataMessage("Ainda não há SIC cadastrada na base atual.");
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
    const key = getKey(item) || "Não informado";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || String(a.label).localeCompare(String(b.label), "pt-BR"));
}

function haptecValueBy(items, getKey, getValue) {
  const map = new Map();
  items.forEach((item) => {
    const key = getKey(item) || "Não informado";
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
  return operationalActiveFilterText() ? "no filtro atual do Operacional de Orçamento" : "na esteira de Orçamento";
}

function haptecWorksKanbanAnswer(text) {
  const items = haptecWorksKanbanItems();
  const scope = haptecWorksKanbanScope();
  const late = items.filter(isDemandLate);
  const active = items.filter((item) => !["concluido", "cancelado"].includes(item.coluna));
  const doing = items.filter((item) => item.coluna === "fazendo");
  const validation = items.filter((item) => ["validacaoST", "validacaoObras"].includes(item.coluna));
  const sicCards = items.filter((item) => demandTypeKey(item.tipo) === "SIC");

  if (haptecHasAny(text, ["analista", "responsavel"])) {
    const rows = haptecCountBy(items, (item) => item.analistaResponsavel || "A definir");
    return `Cards de Orçamento por analista ${scope}:\n${haptecRowsText(rows, (value) => `${value} card(s)`)}.`;
  }

  if (haptecHasAny(text, ["obra com mais", "mais cards", "maior fila", "mais demandas"])) {
    const rows = haptecCountBy(active, (item) => workById(item.obraId)?.nome || "Obra não vinculada");
    return `Projetos/obras com mais cards ativos ${scope}:\n${haptecRowsText(rows, (value) => `${value} card(s)`)}.`;
  }

  if (haptecHasAny(text, ["bucket", "coluna", "status", "fase"])) {
    const rows = columns.map((column) => ({
      label: column.label,
      count: items.filter((item) => item.coluna === column.id).length,
    }));
    return `Distribuição por coluna ${scope}:\n${haptecRowsText(rows, (value) => `${value} card(s)`, rows.length)}.`;
  }

  if (haptecHasAny(text, ["atras", "fora do prazo"]) && haptecHasAny(text, ["andamento", "fazendo", "execucao"])) {
    return `Hoje ${scope}: ${doing.length} card(s) em andamento/Fazendo e ${late.length} card(s) em atraso. Total ativo: ${active.length}.`;
  }

  if (haptecHasAny(text, ["atras", "fora do prazo"])) {
    const sample = late.slice(0, 4).map((item) => `${item.id} - ${workById(item.obraId)?.nome || item.obraNome || "sem obra"}`).join("; ");
    return `${late.length} card(s) de Orçamento estão em atraso ${scope}.${sample ? ` Principais: ${sample}.` : ""}`;
  }

  if (haptecHasAny(text, ["andamento", "fazendo", "execucao"])) {
    return `${doing.length} card(s) estão em andamento/Fazendo ${scope}. A fila ativa total tem ${active.length} card(s).`;
  }

  if (haptecHasAny(text, ["validacao", "validar"])) {
    return `${validation.length} card(s) aguardam validação ${scope}: ${items.filter((item) => item.coluna === "validacaoST").length} na Sala Técnica e ${items.filter((item) => item.coluna === "validacaoObras").length} em Obras.`;
  }

  if (haptecHasAny(text, ["sic"])) {
    return `${sicCards.length} card(s) de SIC estão ${scope}. Destes, ${sicCards.filter(isDemandLate).length} estão em atraso.`;
  }

  return `Resumo do Kanban de Orçamento ${scope}: ${items.length} card(s), ${active.length} ativo(s), ${doing.length} em andamento, ${validation.length} aguardando validação e ${late.length} em atraso.`;
}

function haptecEVDataAnswer(text) {
  const works = state.works || [];
  const completed = works.filter((work) => work.ev.status === "Completo");
  const pending = works.filter((work) => work.ev.status !== "Completo");
  const total = works.reduce((sum, work) => sum + workBudgetValue(work), 0);
  const top = haptecTopEVWork();

  if (haptecHasAny(text, ["pendente", "rascunho"])) return `Hoje temos ${pending.length} EV(s) pendente(s)/rascunho(s) e ${completed.length} completo(s).`;
  if (haptecHasAny(text, ["completo", "cotacao completa", "finalizado"])) return `${completed.length} EV(s) estão completos. Isso representa ${number((completed.length / Math.max(works.length, 1)) * 100, 1)}% do portfólio.`;
  if (haptecHasAny(text, ["total", "consolidado", "somatorio", "soma"])) return `O valor total de EV consolidado é ${money(total)}. ${top ? `O maior EV é ${top.work.nome}, com ${money(top.value)}.` : ""}`;
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
  const direct = disciplines.find((item) => text.includes(normalizeSearchText(item.nome)));
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
    return `Composição principal do EV ${record.project} (${record.year}):\n${rows.map(([id, value], index) => `${index + 1}. ${disciplineById(id).nome}: ${money(value)} (${number(Number(value) / Math.max(Number(record.total), 1) * 100, 2)}%)`).join("\n")}\nTotal do EV: ${money(record.total)}.`;
  }
  const value = disciplineIds.reduce((sum, id) => sum + Number(record.disciplines?.[id] || 0), 0);
  const share = Number(record.total) ? value / Number(record.total) * 100 : 0;
  const comparable = evHistoricalSourceRecords().filter((item) => item.typology === record.typology);
  const benchmark = haptecCombinedBenchmark(comparable.length >= 20 ? comparable : evHistoricalSourceRecords(), disciplineIds);
  const zScore = benchmark.stdDev ? (share - benchmark.mean) / benchmark.stdDev : 0;
  const label = disciplineIds.length > 1 ? disciplineIds.map((id) => disciplineById(id).nome).join(" + ") : disciplineById(disciplineIds[0]).nome;
  const assessment = Math.abs(zScore) >= 2 ? `Atenção: está ${number(Math.abs(zScore), 1)}σ ${zScore > 0 ? "acima" : "abaixo"} da média histórica; recomendo averiguar o escopo e as quantidades.` : "A participação está dentro do comportamento histórico esperado.";
  return `${label} no EV ${record.project}:\nValor: ${money(value)}.\nParticipação no EV total: ${number(share, 2)}%.\nReferência ${record.typology}: média ${number(benchmark.mean, 2)}%, mediana ${number(benchmark.median, 2)}% e faixa central de ${number(benchmark.p25, 2)}% a ${number(benchmark.p75, 2)}% (${benchmark.count} EVs).\n${assessment}`;
}

function haptecNewEVCopilotAnswer(text) {
  const typologies = [...new Set(evHistoricalSourceRecords().map((record) => record.typology))];
  const typology = typologies.find((item) => text.includes(normalizeSearchText(item))) || (text.includes("hospital") ? "Hospital" : text.includes("tea") ? "TEA" : text.includes("clinica") ? "Clínica e Medicina Preventiva" : "");
  const records = typology ? evHistoricalSourceRecords().filter((record) => record.typology === typology) : evHistoricalSourceRecords();
  const rows = evHistoricalBenchmarkRows(records).filter((row) => row.count >= 8).slice(0, 6);
  return `Copiloto para novo EV${typology ? ` de ${typology}` : ""}:\nBase utilizada: ${records.length} EVs históricos.\nComposições de referência:\n${rows.map((row, index) => `${index + 1}. ${row.discipline.nome}: mediana ${number(row.median, 1)}% | faixa central ${number(row.p25, 1)}%–${number(row.p75, 1)}% | ${row.count} EVs`).join("\n")}\nComo conduzir: preencha primeiro área e escopo; compare as disciplinas críticas; investigue desvios acima de 2σ; valide omissões com valor zero; e só então confirme risco e total do EV. Posso analisar cada disciplina enquanto você preenche.`;
}

function haptecINCCAnswer(text) {
  const record = haptecEVRecordFromQuestion(text);
  if (!record) return `A Calculadora SLT usa o INCC-M oficial da FGV, com atualização composta até ${sltINCCData.latestLabel}. Abra Orçamento 360 > EV > Calculadoras SLT e informe o valor e o ano-base.`;
  if (Number(record.year) >= 2026) return `O EV ${record.project} é de ${record.year}, mesma competência anual da referência atual (${sltINCCData.latestLabel}). Para uma atualização precisa dentro de 2026, informe também o mês-base.`;
  const reading = sltINCCReading(record.total, record.year);
  return `Atualização INCC-M do EV ${record.project}:\nValor original (${record.year}): ${money(record.total)}.\nFator composto até ${sltINCCData.latestLabel}: ${number(reading.factor, 4)}× (${number(reading.percentage, 2)}%).\nCorreção estimada: ${money(reading.correction)}.\nValor atualizado: ${money(reading.updated)}.\nFonte: FGV IBRE. Estimativa gerencial; valide a cláusula contratual aplicável.`;
}

function haptecPortfolioQuestionAnswer(text) {
  const works = state.works || [];
  if (haptecHasAny(text, ["regiao", "regional"])) {
    return `Portfólio por região:\n${haptecRowsText(haptecCountBy(works, (work) => work.regiao), (value) => `${value} obra(s)`)}.`;
  }
  if (haptecHasAny(text, ["tipo", "tipologia", "unidade"])) {
    return `Portfólio por tipo de unidade:\n${haptecRowsText(haptecCountBy(works, (work) => work.tipoUnidade), (value) => `${value} obra(s)`)}.`;
  }
  if (haptecHasAny(text, ["classificacao", "classe", "motivo"])) {
    return `Portfólio por classificação:\n${haptecRowsText(haptecCountBy(works, (work) => work.classificacaoObra), (value) => `${value} obra(s)`)}.`;
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
    `Manutenção no filtro atual: ${items.length} demanda(s).`,
    `${metrics.active.length} em fluxo, ${metrics.late.length} acima de 23 dias.`,
    `Valor Sala Técnica: ${money(values.salaTecnica)}.`,
    `Saving técnico: ${money(Math.max(values.savingTecnico, 0))}.`
  ].join("\n");
}

function haptecMaintenanceQuestionAnswer(text) {
  const items = filteredMaintenanceDemands();
  const metrics = maintenanceMetrics(items);
  if (haptecHasAny(text, ["centro de custo", "custo"])) {
    const rows = haptecValueBy(items, (item) => item.centroCusto, maintenanceValue);
    return `Manutenção por centro de custo:\n${haptecRowsText(rows, money)}.`;
  }
  if (haptecHasAny(text, ["estado", "uf"])) {
    const rows = haptecValueBy(items, (item) => item.uf, maintenanceValue);
    return `Manutenção por estado:\n${haptecRowsText(rows, money)}.`;
  }
  if (haptecHasAny(text, ["fase", "pipefy", "bucket", "coluna", "status"])) {
    const rows = maintenanceColumns.map((column) => ({
      label: column.label,
      count: items.filter((item) => item.coluna === column.id).length,
    }));
    return `Kanban de Manutenção por fase:\n${haptecRowsText(rows, (value) => `${value} card(s)`, rows.length)}.`;
  }
  if (haptecHasAny(text, ["atras", "lead time", "fora do prazo"])) return `${metrics.late.length} demanda(s) de Manutenção estão acima do lead time de 23 dias. Lead time médio: ${number(metrics.avgLead)} dia(s).`;
  if (haptecHasAny(text, ["andamento", "ativo", "fluxo"])) return `${metrics.active.length} demanda(s) de Manutenção estão em fluxo no filtro atual. Valor Sala Técnica: ${money(metrics.values.salaTecnica)}.`;
  return haptecMaintenanceDataAnswer();
}

function haptecBudgetDataAnswer() {
  const totals = allTotals();
  return [
    `Controle de Verbas consolidado: ${money(totals.orcado + totals.aditivado)}.`,
    `Contratado: ${money(totals.contratado)}.`,
    `Saldo disponível: ${money(totals.saldo)}.`,
    `Se o saldo apertar, é hora de conferir risco, SICs e aporte antes da obra pedir passagem.`
  ].join("\n");
}

function haptecStrategicQuestionAnswer(text) {
  const rows = strategicCostTargetRows();
  const summary = strategicCostTargetSummary(rows);
  if (haptecHasAny(text, ["meta", "m2", "m²", "custo por m"])) {
    const targetText = rows
      .map((row) => `${row.label}: ${row.measuredCount ? `${number(row.adherence, 1)}% dentro da meta, ${money(row.costM2)}/m²` : "sem leitura"}`)
      .join("\n");
    return `Aderência às metas de custo/m²: ${number(summary.adherence, 1)}% geral.\n${targetText}`;
  }
  const above = worksAboveStrategicCostTarget();
  return above.length
    ? `Temos ${above.length} obra(s) acima da meta de custo/m². Top desvio: ${above[0].work.nome}, com ${money(above[0].costM2)}/m².`
    : "Nenhuma obra medida está acima da meta de custo/m². Por enquanto, o prumo executivo está alinhado.";
}

function haptecQuestionSuggestions() {
  return [
    "Onde estou no sistema?",
    "Explique os módulos do SLT 360.",
    "Quantos cards estão em andamento no Kanban de Orçamento?",
    "Quantos cards de Orçamento estão em atraso?",
    "Quantos cards aguardam validação?",
    "Qual analista tem mais cards em Orçamento?",
    "Qual obra tem mais cards ativos?",
    "Qual a obra com o maior valor de EV hoje?",
    "Qual o percentual de marcenaria no EV Atibaia?",
    "Mostre a composição do EV 4343.",
    "Ajude a conduzir um novo EV de Hospital.",
    "Atualize o EV 4343 pelo INCC.",
    "Quantos EVs estão pendentes?",
    "Qual o valor total de EV consolidado?",
    "Quantas SICs estão pendentes?",
    "Qual o maior valor de SIC?",
    "Quais os principais motivos de SIC?",
    "Quais disciplinas têm maior impacto de SIC?",
    "Quantas demandas de Manutenção estão atrasadas?",
    "Qual centro de custo tem maior valor em Manutenção?",
    "Qual o valor Sala Técnica de Manutenção?",
    "Qual o saldo disponível no Controle de Verbas?",
    "Como está a meta de custo por m²?",
    "Quais obras estão acima da meta de custo por m²?",
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
  if (haptecHasAny(text, ["quem e voce", "quem é voce", "quem é você", "haptec", "copiloto", "co-piloto"])) {
    return `Sou o ${haptecPersona.name}, ${haptecPersona.role}. Eu ajudo na navegação e respondo perguntas com base nos dados visíveis do SLT 360 para o seu perfil.`;
  }
  if (!text || text.includes("explicar tela") || text.includes("ajuda")) return haptecViewHelp();
  if (haptecHasAny(text, ["perguntas", "o que voce sabe", "o que você sabe", "exemplos", "treinado"])) return haptecQuestionBankAnswer();
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
  if (haptecHasAny(text, ["meta", "m2", "m²", "custo por m", "acima da meta"])) return haptecStrategicQuestionAnswer(text);
  if (text.includes("portfolio") || text.includes("portifolio") || text.includes("quantas obras") || text.includes("capex")) return haptecPortfolioQuestionAnswer(text);
  if (text.includes("verba") || text.includes("saldo") || text.includes("contratado")) return haptecBudgetDataAnswer();
  if (text.includes("modulo") || text.includes("dashboard") || text.includes("inicio")) return haptecModuleSummary();
  if (text.includes("nova demanda") || text.includes("demanda")) {
    if (maintenanceViewIds.includes(currentView)) return "Para criar demanda de Manutenção: Manutenção 360 > Operacional > + Nova demanda. Busque a unidade, confira CNPJ/endereço, preencha datas, valores e salve para entrar no Kanban.";
    return "Para criar demanda de Orçamento: Orçamento 360 > Operacional > + Nova demanda. Escolha Emissão Inicial, Revisão de Orçamento ou SIC, vincule a obra e salve para entrar na coluna inicial do Kanban.";
  }
  if (text.includes("sic")) return "Para SIC: Orçamento 360 > SICs ou Operacional > + Nova demanda > SIC. Preencha LECOM, obra, título, descrição, disciplinas e anexo. A postagem no EV leva os valores para a linha 32.";
  if (text.includes("verba") || text.includes("orcamento") || text.includes("custo")) return "Para verba/custo: Controle de Verbas 360 consolida aportes, EV, contratação e SICs. Em Orçamento, a visão Estratégica mostra CAPEX, metas por m² e maiores investimentos.";
  if (text.includes("kpi") || text.includes("indicador") || text.includes("relatorio")) return "Para indicadores: use as abas Gerencial, Estratégica, BI Manutenção ou Linha do Tempo. Os KPIs clicáveis abrem detalhes, para você sair do número e chegar na causa.";
  if (text.includes("filtro") || text.includes("buscar") || text.includes("pesquisar")) return "Use a busca principal da aba e combine com os selects. No Portfólio busque por obra/cidade; em Manutenção use OS, unidade, centro de custo ou tipologia; em EV use a busca assistida.";
  return "Entendi. Me diga se você quer achar uma obra, criar demanda, abrir EV, analisar SICs ou navegar para um módulo. Eu te passo o caminho mais curto.";
}

function haptecFaceForAnswer(question = "", answer = "") {
  const text = normalizeSearchText(`${question} ${answer}`);
  if (haptecFaceTagRegex.test(String(answer || ""))) return haptecExtractFace(answer);
  if (haptecHasAny(text, ["documento", "arquivo", "anexo", "prancha", "especificacao", "especificação", "repositorio", "repositório"])) return "searching";
  if (haptecHasAny(text, ["salvo", "salva", "sucesso", "concluido com sucesso", "preenchidos corretamente", "registrado com sucesso"])) return "validating";
  if (haptecHasAny(text, ["atras", "fora do prazo", "acima da meta", "acima do lead time", "saldo apertar", "falt", "obrigatorio", "obrigatório", "inconsist", "pendente", "sem dados", "ainda nao", "ainda não"])) return "error_alert";
  if (haptecHasAny(text, ["quanto", "quant", "valor", "r$", "maior", "total", "capex", "ev", "sic", "saldo", "contratado", "meta", "m2", "m²", "kanban", "kamban", "cards", "analista", "centro de custo", "lead time", "saving", "dashboard report", "diagnostico", "diagnóstico", "indicador", "kpi"])) return "thinking";
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

function haptecSystemNotice(message, face = "smiling_ready", shouldOpen = false) {
  const clean = String(message || "").trim();
  if (!clean) return;
  addHaptecMessage("bot", haptecWithFace(face, clean));
  if (shouldOpen) haptecOpen = true;
  refreshHaptecAssistant();
}

function refreshHaptecAssistant() {
  const assistant = document.querySelector(".haptec-assistant");
  if (assistant) assistant.outerHTML = renderHaptecAssistant();
}

function haptecFaceForSystemMessage(message = "") {
  const text = normalizeSearchText(message);
  if (haptecHasAny(text, ["antes de", "nao encontrei", "não encontrei", "nao possui", "não possui", "revise", "protegido", "obrigatorio", "obrigatório", "pendente", "erro", "falha", "atras", "risco"])) return "error_alert";
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

function loadHaptecPosition() {
  try {
    const saved = JSON.parse(localStorage.getItem(HAPTEC_POSITION_KEY) || "null");
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return saved;
  } catch (error) {
    console.warn("Não foi possível carregar a posição do Haptec360.", error);
  }
  return null;
}

function clampHaptecPosition(position = {}) {
  const margin = 12;
  const width = haptecOpen ? 390 : 248;
  const height = haptecOpen ? Math.min(560, Math.max(window.innerHeight - 24, 280)) : 104;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);
  return {
    x: Math.min(Math.max(Number(position.x) || margin, margin), maxX),
    y: Math.min(Math.max(Number(position.y) || margin, margin), maxY),
  };
}

function saveHaptecPosition(position = haptecPosition) {
  if (!position) return;
  try {
    localStorage.setItem(HAPTEC_POSITION_KEY, JSON.stringify(clampHaptecPosition(position)));
  } catch (error) {
    console.warn("Não foi possível salvar a posição do Haptec360.", error);
  }
}

function haptecPositionStyle() {
  if (!haptecPosition) return "";
  haptecPosition = clampHaptecPosition(haptecPosition);
  return ` style="left:${haptecPosition.x}px; top:${haptecPosition.y}px; right:auto; bottom:auto;"`;
}

function speakHaptec(text = latestHaptecBotText()) {
  if (!("speechSynthesis" in window)) {
    showToast("Seu navegador não liberou voz para o Haptec360.");
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
    <aside class="haptec-assistant ${haptecOpen ? "is-open" : ""}" data-face="${currentFace}" aria-label="Haptec360 - assistente do SLT 360"${haptecPositionStyle()}>
      <button class="haptec-launcher" type="button" data-action="toggle-haptec" data-haptec-drag-handle title="Arraste para mover o Haptec360" aria-expanded="${haptecOpen ? "true" : "false"}">
        ${renderHaptecRobot("is-launcher", currentFace)}
        <span>
          <strong>Haptec360</strong>
          <small>${haptecFaceLabel(currentFace)} · Guia SLT</small>
        </span>
      </button>
      ${
        haptecOpen
          ? `
            <section class="haptec-panel">
              <header data-haptec-drag-handle title="Arraste para mover o Haptec360">
                <div class="haptec-title">
                  ${renderHaptecRobot("is-panel", currentFace)}
                  <div>
                    <strong>Haptec360</strong>
                    <small><span class="haptec-face-state" data-face="${currentFace}">${haptecFaceLabel(currentFace)}</span> · ${haptecCurrentContext()}</small>
                  </div>
                </div>
                <div class="haptec-header-actions">
                  <button class="ghost-button compact-action" type="button" data-action="haptec-speak">Ouvir</button>
                  <button class="icon-button" type="button" aria-label="Minimizar Haptec360" data-action="toggle-haptec">×</button>
                </div>
              </header>
              <div class="haptec-body">
                <div class="haptec-messages">
                  ${messages.map(renderHaptecMessage).join("")}
                </div>
                <details class="haptec-suggestions">
                  <summary>Atalhos e perguntas</summary>
                  <div class="haptec-suggestion-block">
                    <span>Rápidos</span>
                    <div class="haptec-quick-actions">
                      <button type="button" data-action="haptec-ask" data-prompt="Explicar tela">Explicar tela</button>
                      <button type="button" data-action="haptec-ask" data-prompt="Qual a obra com o maior valor de EV hoje?">Maior EV</button>
                      <button type="button" data-action="haptec-ask" data-prompt="Quais perguntas você sabe responder?">Perguntas</button>
                    </div>
                  </div>
                  <div class="haptec-suggestion-block">
                    <span>Navegação</span>
                    <div class="haptec-shortcuts">
                      <button type="button" data-action="haptec-nav" data-target-view="portfolio">Orçamento</button>
                      <button type="button" data-action="haptec-nav" data-target-view="maintenanceOperational">Manutenção</button>
                      <button type="button" data-action="haptec-nav" data-target-view="ev">EV</button>
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
                <input name="question" autocomplete="off" placeholder="Pergunte ao Haptec360..." />
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

function renderWorksTabs(activeView) {
  return `
    <nav class="module-tabs" aria-label="Navegação interna de Orçamento">
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
    <nav class="module-tabs" aria-label="Navegação interna de Projetos">
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
  if (row.inicioPlanejado && row.inicioPlanejado <= TODAY_ISO) return "emProjetos";
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
  let rows = [...projectPlanRows(false).filter((row) => row.isProject), ...projectCustomDemandRows()];
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
  return groupRowsBy(rows.map((row) => ({ ...row, [field]: row[field] || "Não informado" })), field);
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
  const next = projectRows.filter((row) => row.terminoPlanejado && row.terminoPlanejado >= TODAY_ISO && daysBetween(TODAY_ISO, row.terminoPlanejado) <= 30);
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
    ${renderProjectToolbar("projectsHome", "Projetos 360", "Setor de Projetos como fonte oficial para alimentar o Orçamento 360", `
      <span class="tag">${metrics.rows.length} linhas no plano</span>
      <button class="secondary-action" type="button" data-view="projectsPortfolio">Abrir portfólio</button>
      <button class="primary-action" type="button" data-view="projectsOperational">Abrir Kanban</button>
    `)}

    <section class="kpi-grid">
      ${kpi("Projetos no plano", String(metrics.projectRows.length), "Etapa Projetos no investimento 2026", "blue")}
      ${kpi("Próximas entregas", String(metrics.next.length), "Término planejado em até 30 dias", "orange")}
      ${kpi("Projetos atrasados", String(metrics.late.length), "Sem término real e prazo vencido", metrics.late.length ? "red" : "green")}
      ${kpi("Entregues à ST", String(metrics.delivered.length), "Base disponível para orçamentação", "green")}
      ${kpi("Regiões atendidas", String(metrics.regions), "Cobertura no plano", "blue")}
      ${kpi("Tipos de unidade", String(metrics.types), "Perfis no portfólio de Projetos", "orange")}
    </section>

    <div class="content-grid three">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Projetos por região</h2>
            <p class="panel-subtitle">Distribuição da carteira do plano</p>
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
            <h2>Próximas entregas</h2>
            <p class="panel-subtitle">Fila que alimenta o Orçamento 360</p>
          </div>
        </div>
        <div class="alert-list">
          ${metrics.next.slice(0, 6).map(renderProjectAlertItem).join("") || `<div class="empty-state">Sem entregas de projeto nos próximos 30 dias.</div>`}
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
        <span class="muted">${escapeAttribute(row.regiao || "Sem região")} | término ${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "sem data"}</span>
      </div>
    </button>
  `;
}

function renderProjectsPortfolio() {
  const allRows = projectPlanRows(false);
  const rows = projectPlanRows(true);
  const metrics = projectMetrics(allRows);
  return `
    ${renderProjectToolbar("projectsPortfolio", "Portfólio / Plano de Investimento", "Base única do Projetos 360 para prazos, entregas e início da orçamentação", `
      <span class="tag">${rows.length} registros no filtro</span>
      <button class="secondary-action" type="button" data-action="clear-project-plan-filters">Limpar filtros</button>
    `)}
    <section class="kpi-grid">
      ${kpi("Registros no plano", String(metrics.rows.length), "Plano de Investimento 2026", "blue")}
      ${kpi("Etapa Projetos", String(metrics.projectRows.length), "Itens aguardados pela Sala Técnica", "orange")}
      ${kpi("Atrasados", String(metrics.late.length), "Projetos com prazo vencido", metrics.late.length ? "red" : "green")}
      ${kpi("Tipos de unidade", String(metrics.types), "Perfis distintos", "blue")}
    </section>
    <section class="panel investment-plan-panel">
      ${renderProjectPlanFilters(allRows)}
      ${renderProjectPlanTable(rows)}
    </section>
  `;
}

function renderProjectsPlan() {
  return renderProjectsPortfolio();
}

function renderProjectPlanFilters(allRows) {
  const etapas = [...new Set(allRows.map((row) => row.etapa).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const status = [...new Set(allRows.map((row) => row.status).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const regioes = [...new Set(allRows.map((row) => row.regiao).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return `
    <div class="investment-filter-bar project-filter-bar">
      <label class="field investment-search-field">
        <span>Buscar no plano</span>
        <input data-project-plan-search value="${escapeAttribute(projectPlanFilters.query)}" placeholder="Buscar por obra, etapa, cidade, UF, status ou observação..." />
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
        <span>Região</span>
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
        <span>Projeto até</span>
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
            <th>Cód. Obra</th>
            <th>Tipo</th>
            <th>Cidade / UF</th>
            <th>Região</th>
            <th>Etapa</th>
            <th class="numeric">SLA</th>
            <th>Início Planejado</th>
            <th>Término Projeto</th>
            <th>Término Real</th>
            <th>Status Projeto</th>
            <th>Início Orçamentação</th>
            <th>Ações</th>
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
                    <td>${escapeAttribute(work?.tipoUnidade || row.tipoUnidade || "—")}</td>
                    <td>${escapeAttribute(`${work?.cidade || row.praca || "—"}/${work?.uf || row.uf || "—"}`)}</td>
                    <td>${escapeAttribute(work?.regiao || row.regiao || "—")}</td>
                    <td><span class="tag">${escapeAttribute(row.etapa || "—")}</span></td>
                    <td class="numeric">${row.slaDias ?? "—"}</td>
                    <td>${row.inicioPlanejado ? dateText(row.inicioPlanejado) : "—"}</td>
                    <td><strong>${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "—"}</strong></td>
                    <td>${row.terminoReal ? dateText(row.terminoReal) : "—"}</td>
                    <td><span class="status-pill" data-status="${projectStatus.tone}">${projectStatus.label}</span></td>
                    <td>${row.inicioOrcamentacao ? `<strong>${dateText(row.inicioOrcamentacao)}</strong><br /><span class="muted">após Projetos</span>` : "—"}</td>
                    <td>
                      <div class="table-actions">
                        ${row.obraId ? `<button class="secondary-action compact-action" type="button" data-action="start-budget-from-plan" data-row="${row.row}">Criar orçamento</button>` : `<button class="secondary-action compact-action" type="button" data-action="open-work-from-plan" data-row="${row.row}">Cadastrar</button>`}
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
    ${renderProjectToolbar("projectsOperational", "Operacional de Projetos", "Kanban de entregas de Projetos que abastecem a esteira do Orçamento 360", `
      <button class="secondary-action" type="button" data-action="clear-project-operational-filters">Limpar filtros</button>
      <button class="primary-action" type="button" data-action="open-project-demand">+ Nova demanda</button>
      <button class="primary-action" type="button" data-view="projectsPortfolio">Abrir portfólio</button>
    `)}
    ${renderProjectOperationalFilters(allRows)}
    <section class="kpi-grid">
      ${kpi("Projetos no filtro", String(filtered.length), "Registros visíveis", "blue")}
      ${kpi("Planejados", String(projectRowsByStatus(filtered, "planejado").length), "Ainda não iniciados", "blue")}
      ${kpi("Em projetos", String(projectRowsByStatus(filtered, "emProjetos").length), "Em execução", "orange")}
      ${kpi("Entregues à ST", String(projectRowsByStatus(filtered, "salaTecnica").length), "Prontos para orçamento", "green")}
      ${kpi("Atrasados", String(projectRowsByStatus(filtered, "atrasado").length), "Prazo vencido", projectRowsByStatus(filtered, "atrasado").length ? "red" : "green")}
      ${kpi("Paralisados", String(projectRowsByStatus(filtered, "paralisado").length), "Sem avanço", "red")}
    </section>
    <section class="panel operational-board-panel">
      <div class="panel-header">
        <div>
          <h2>Kanban de Projetos</h2>
          <p class="panel-subtitle">Clique no card para ver prazos, etapa, vínculo e início da orçamentação</p>
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
        <input data-project-operational-search value="${escapeAttribute(projectOperationalFilters.query)}" placeholder="Buscar por obra, cidade, UF, etapa ou observação..." />
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
          <span>Região</span>
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
        <span>${escapeAttribute(row.regiao || "Sem região")}</span>
        <b>${escapeAttribute(row.tipoUnidade || "—")}</b>
      </div>
      <div class="demand-card-unit-badge">${escapeAttribute(type.label)}</div>
      ${budgetDemand ? `<div class="demand-card-unit-badge">Orçamento criado · ${escapeAttribute(budgetDemand.id)}</div>` : ""}
      <span class="demand-card-date">Término: ${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "sem data"}</span>
      <div class="demand-card-alert" data-tone="${status.tone === "red" ? "red" : status.tone === "orange" ? "orange" : "green"}">
        <i></i>
        <strong>${escapeAttribute(row.statusInfo?.label || status.label)}</strong>
      </div>
      ${row.inicioOrcamentacao ? `<div class="demand-card-value"><span>Início orçamento</span><strong>${dateText(row.inicioOrcamentacao)}</strong></div>` : ""}
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
            <th>Região</th>
            <th>Etapa</th>
            <th>Término Projeto</th>
            <th>Status</th>
            <th>Início Orçamentação</th>
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
                  <td>${escapeAttribute(row.tipoUnidade || "—")}</td>
                  <td>${escapeAttribute(row.regiao || "—")}</td>
                  <td>${escapeAttribute(row.etapa || "—")}</td>
                  <td>${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "—"}</td>
                  <td><span class="status-pill" data-status="${status.tone}">${status.label}</span></td>
                  <td>${row.inicioOrcamentacao ? dateText(row.inicioOrcamentacao) : "—"}</td>
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
  return `${row.obra || "Projeto sem nome"} | ${row.praca || "Sem cidade"}/${row.uf || "UF"} | ${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "sem término"}`;
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
      ${state.works.map((work) => `<option value="${escapeAttribute(workOptionLabel(work))}">${escapeAttribute(work.codigoOriginal || work.chaveUnica || "")}</option>`).join("")}
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
        <span>A demanda será vinculada à linha selecionada do plano e entrará no kanban de Projetos como Planejado.</span>
      </div>
    `;
  }

  return `
    <label class="field">
      <span>Título da demanda *</span>
      <input name="titulo" placeholder="${type.id === "sdr" ? "Ex.: Adequação solicitada pela VISA" : type.id === "sic" ? "Ex.: Ajuste de projeto solicitado por Obras" : "Ex.: Estudo solicitado pela área demandante"}" required />
    </label>
    <label class="field">
      <span>${type.id === "sdr" ? "Órgão regulador" : "Solicitante / área demandante"}</span>
      <input name="${type.id === "sdr" ? "orgaoRegulador" : "solicitante"}" placeholder="${type.id === "sdr" ? "VISA, Corpo de Bombeiros, Prefeitura..." : "Obras, Operações, Diretoria, unidade..."}" />
    </label>
    <label class="field full-span">
      <span>Vincular obra/unidade existente</span>
      <input name="obraBusca" list="projectDemandWorkOptions" autocomplete="off" placeholder="Digite nome da obra, chave, cidade ou UF..." />
    </label>
    ${projectWorkDatalist()}
    <label class="field">
      <span>Prioridade</span>
      <select name="prioridade">${priorityOptions(type.id === "sdr" ? "Alta" : "Média")}</select>
    </label>
    <label class="field">
      <span>Data prevista de entrega</span>
      <input name="dataPrevistaEntrega" type="date" />
    </label>
    <label class="field full-span">
      <span>Descrição da demanda</span>
      <textarea name="descricao" rows="4" placeholder="Descreva o escopo, origem da solicitação, premissas e observações relevantes..."></textarea>
    </label>
  `;
}

function openProjectDemandModal(selectedType = "planoInvestimento") {
  const type = projectDemandTypeById(selectedType);
  modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <section class="modal-card kpi-modal-card project-demand-modal" aria-labelledby="projectDemandTitle">
        <header>
          <div>
            <span class="eyebrow">Projetos 360</span>
            <h2 id="projectDemandTitle">Nova demanda de Projetos</h2>
            <p class="muted">Classifique a origem da demanda e envie para o kanban operacional.</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
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
            ${renderProjectDemandFields(type)}
          </div>
        </form>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
          <button class="primary-action" type="submit" form="projectDemandForm">Salvar demanda</button>
        </footer>
      </section>
    </div>
  `;
}

function handleProjectDemandSubmit(form) {
  const formData = new FormData(form);
  const typeId = String(formData.get("tipoDemanda") || "planoInvestimento");
  const type = projectDemandTypeById(typeId);

  if (type.id === "planoInvestimento") {
    const record = findProjectPlanByTypedSearch(formData.get("planBusca"));
    if (!record) {
      showFormError("Selecione uma obra válida do Plano de Investimento.", form);
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
    };
    addHistory({
      entidade: "projeto",
      entidadeId: key,
      campo: "criação",
      valorAnterior: "Plano de Investimento",
      valorNovo: "Demanda criada no kanban de Projetos",
    });
    saveState();
    projectOperationalFilters.query = record.obra || "";
    projectOperationalViewMode = "kanban";
    closeModal();
    setView("projectsOperational");
    showToast("Demanda do Plano de Investimento enviada para o kanban de Projetos.");
    return;
  }

  const title = String(formData.get("titulo") || "").trim();
  if (!title) {
    showFormError("Informe o título da demanda para criar o card de Projetos.", form);
    return;
  }

  const work = findWorkByTypedSearch(formData.get("obraBusca"));
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
    prioridade: String(formData.get("prioridade") || "Média"),
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
  };

  if (!Array.isArray(state.projectDemands)) state.projectDemands = [];
  state.projectDemands.unshift(demand);
  addHistory({
    entidade: "projeto",
    entidadeId: id,
    campo: "criação",
    valorAnterior: "Nova demanda",
    valorNovo: `${type.label}: ${title}`,
  });
  saveState();
  projectOperationalFilters.query = id;
  projectOperationalViewMode = "kanban";
  closeModal();
  setView("projectsOperational");
  showToast(`${type.shortLabel} criada no kanban de Projetos em Planejado.`);
}

function renderProjectsManagement() {
  const rows = projectPlanRows(true).filter((row) => row.isProject);
  return `
    ${renderProjectToolbar("projectsManagement", "Visão Gerencial de Projetos", "Leitura tática de atrasos, regiões, etapas e alimentação da Sala Técnica", `
      <button class="secondary-action" type="button" data-action="clear-project-plan-filters">Limpar filtros</button>
    `)}
    <section class="kpi-grid">
      ${kpi("Projetos analisados", String(rows.length), "Filtro atual", "blue")}
      ${kpi("Atrasados", String(projectRowsByStatus(rows, "atrasado").length), "Exigem tratativa", projectRowsByStatus(rows, "atrasado").length ? "red" : "green")}
      ${kpi("Em andamento", String(projectRowsByStatus(rows, "emProjetos").length), "Execução de projetos", "orange")}
      ${kpi("Entregues à ST", String(projectRowsByStatus(rows, "salaTecnica").length), "Liberados para orçamento", "green")}
    </section>
    <div class="content-grid three">
      <section class="panel">
        <div class="panel-header"><div><h2>Status da carteira</h2><p class="panel-subtitle">Distribuição da esteira de Projetos</p></div></div>
        ${barList(projectColumns.map((column) => ({ label: column.label, valor: projectRowsByStatus(rows, column.id).length })), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>Regiões</h2><p class="panel-subtitle">Carga de projetos por região</p></div></div>
        ${barList(projectGroupRows(rows, "regiao"), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>Entregas por mês</h2><p class="panel-subtitle">Término planejado de Projetos</p></div></div>
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
    ${renderProjectToolbar("projectsStrategic", "Visão Estratégica de Projetos", "Panorama executivo das entregas que habilitam orçamento, verba e execução", ``)}
    <section class="budget-hero project-hero">
      <div>
        <span class="eyebrow">Resumo executivo</span>
        <strong>${number(adherence, 0)}%</strong>
        <p>dos projetos medidos já foram entregues ou liberados para a Sala Técnica.</p>
      </div>
      <div class="budget-hero-grid">
        ${splitItem("Projetos", String(metrics.projectRows.length))}
        ${splitItem("Atrasados", String(metrics.late.length))}
        ${splitItem("Próximos 30 dias", String(metrics.next.length))}
        ${splitItem("Regiões", String(metrics.regions))}
      </div>
    </section>
    <div class="content-grid three">
      <section class="panel">
        <div class="panel-header"><div><h2>Tipo de unidade</h2><p class="panel-subtitle">Onde está a maior carga de Projetos</p></div></div>
        ${barList(projectGroupRows(rows, "tipoUnidade"), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>Classificação</h2><p class="panel-subtitle">Motivação de investimento</p></div></div>
        ${barList(projectGroupRows(rows, "classificacaoObra"), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>Fila crítica</h2><p class="panel-subtitle">Projetos atrasados para atuação executiva</p></div></div>
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
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card project-detail-modal" aria-labelledby="projectDetailTitle">
        <header>
          <div>
            <span class="eyebrow">Projetos 360 · ${escapeAttribute(type.label)}</span>
            <h2 id="projectDetailTitle">${escapeAttribute(row.obra || "Projeto sem nome")}</h2>
            <p class="muted">${escapeAttribute(row.regiao || "Sem região")} | ${escapeAttribute(row.tipoUnidade || "Sem tipo")} | ${escapeAttribute(row.chaveEtapa || "Plano de Investimento")}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${splitItem("Tipo de demanda", type.label)}
            ${splitItem("Status Projeto", status.label)}
            ${splitItem("Etapa", row.etapa || "—")}
            ${splitItem("SLA", row.slaDias ? `${row.slaDias} dias` : "—")}
            ${splitItem("Início orçamento", row.inicioOrcamentacao ? dateText(row.inicioOrcamentacao) : "—")}
            ${row.solicitante ? splitItem("Solicitante", row.solicitante) : ""}
            ${row.orgaoRegulador ? splitItem("Órgão regulador", row.orgaoRegulador) : ""}
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <tbody>
                <tr><th>Início planejado</th><td>${row.inicioPlanejado ? dateText(row.inicioPlanejado) : "—"}</td></tr>
                <tr><th>Término planejado</th><td>${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "—"}</td></tr>
                <tr><th>Término real</th><td>${row.terminoReal ? dateText(row.terminoReal) : "—"}</td></tr>
                <tr><th>Cidade / UF</th><td>${escapeAttribute(`${row.praca || "—"}/${row.uf || "—"}`)}</td></tr>
                <tr><th>Classificação</th><td>${escapeAttribute(row.classificacaoObra || "—")}</td></tr>
                <tr><th>Tipologia</th><td>${escapeAttribute(row.tipologiaObra || "—")}</td></tr>
                <tr><th>Observações</th><td>${escapeAttribute(row.observacoes || "—")}</td></tr>
                <tr><th>Vínculo Orçamento</th><td>${work ? escapeAttribute(work.nome) : "Sem cadastro vinculado no Orçamento 360"}</td></tr>
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
                <span>Integração com Orçamento 360</span>
                <strong>${row.customProjectDemand ? "Demanda interna de Projetos" : budgetDemand ? `${budgetDemand.id} · ${budgetColumn?.label || "Fazer"}` : work ? "Pronto para gerar card" : "Aguardando cadastro no Orçamento"}</strong>
                <small>${row.customProjectDemand ? "Use o status para controlar o fluxo de Projetos. As demandas do Plano continuam gerando card no Orçamento ao entregar para ST." : budgetDemand ? "Card já criado na esteira de orçamento." : "Ao salvar como Entregue para ST, será criado um card em Orçamento 360 > Fazer."}</small>
              </div>
            </div>
            <div class="project-status-actions">
              <button class="primary-action" type="button" data-action="update-project-status" data-row="${row.row}">Salvar status</button>
              ${budgetDemand ? `<button class="secondary-action" type="button" data-action="open-demand-detail" data-id="${budgetDemand.id}">Abrir card no Orçamento</button>` : ""}
            </div>
          </form>
        </div>
        <footer class="modal-actions">
          ${row.customProjectDemand ? "" : budgetDemand ? `<button class="primary-action" type="button" data-action="open-demand-detail" data-id="${budgetDemand.id}">Abrir Orçamento</button>` : work ? `<button class="primary-action" type="button" data-action="create-budget-from-project" data-row="${row.row}">Criar card no Orçamento</button>` : `<button class="primary-action" type="button" data-action="open-work-from-plan" data-row="${row.row}">Cadastrar no Orçamento</button>`}
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
        </footer>
      </section>
    </div>
  `;
}

function renderMaintenanceTabs(activeView) {
  return `
    <nav class="module-tabs" aria-label="Navegação interna de Manutenção">
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
    <nav class="module-tabs" aria-label="Navegação interna de Engenharia Clínica">
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
        <span class="eyebrow">SLT 360º</span>
        <h1>Sala Técnica 360º</h1>
        <p>Hub Integrador da Sala Técnica</p>
      </div>
      <div class="home-brand-seal" aria-hidden="true">
        <img src="assets/logo-hapvida.png" alt="" />
        <span>Gestão integrada de engenharia</span>
      </div>
    </section>

    ${renderHomeFlower(modules)}
  `;
}

function renderHomeFlower(modules) {
  const orderedModules = ["projetos", "orcamento", "manutencao", "clinica", "gestao"]
    .map((id) => modules.find((module) => module.id === id))
    .filter(Boolean);
  return `
    <section class="home-launchpad-section" aria-label="Módulos do SLT 360">
      <div class="home-launchpad-panel">
        <span class="eyebrow">Hub integrador</span>
        <h2>Escolha o módulo de trabalho</h2>
        <p>Uma entrada única para conectar projetos, orçamento, manutenção, engenharia clínica e controle de verbas no mesmo fluxo de gestão.</p>
        <div class="home-launchpad-flow" aria-label="Fluxo de valor da Sala Técnica">
          <span>Projetar</span>
          <i aria-hidden="true"></i>
          <span>Orçar</span>
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
    projetos: "Entrada do plano, marcos de projeto e entregas para a Sala Técnica.",
    orcamento: "Esteira de EVs, sprints, retroanálise e validação orçamentária.",
    manutencao: "Demandas prediais, fluxo operacional, CAPEX/OPEX e indicadores.",
    clinica: "Parque tecnológico, ordens de serviço e desempenho assistencial.",
    gestao: "CAPEX, OPEX, OIs, transferências, saldo e curva financeira.",
  };
  const description = module.description || descriptions[module.id] || "Acesse as visões operacionais, gerenciais e executivas.";
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
        Abrir módulo
        <i aria-hidden="true"></i>
      </span>
    </button>
  `;
}

function renderLoginScreen() {
  const users = activeUsers();
  return `
    <section class="login-screen" aria-label="Login do SLT 360">
      <div class="login-hero">
        <div class="login-brand">
          <img src="assets/logo-slt360.png" alt="SLT 360" />
          <span></span>
          <img src="assets/logo-hapvida.png" alt="Hapvida" />
        </div>
        <p class="login-eyebrow">Sala Técnica Hapvida</p>
        <h1>SLT 360</h1>
        <p>Entre com seu e-mail e senha cadastrados para acessar as visões liberadas da Sala Técnica.</p>
      </div>

      <div class="login-card">
        <div>
          <h2>Acesso seguro por equipe</h2>
          <p>Use o e-mail cadastrado em Configuração. O sistema ajusta os módulos, indicadores e ações conforme o perfil do usuário.</p>
        </div>
        <form id="loginForm" class="login-form">
          <div class="error-box inline-form-error" data-form-error></div>
          <label class="field">
            <span>E-mail</span>
            <input name="email" type="email" required autocomplete="username" placeholder="nome@hapvida.com.br" />
          </label>
          <label class="field">
            <span>Senha</span>
            <input name="senha" type="password" required autocomplete="current-password" placeholder="Senha de acesso" />
          </label>
          <button class="primary-action" type="submit">Entrar no SLT 360</button>
        </form>

        <div class="login-users-grid">
          ${users.map(renderLoginUserCard).join("") || `<div class="empty-state">Nenhum usuário ativo cadastrado.</div>`}
        </div>
      </div>
    </section>
  `;
}

function renderFirstAccessPasswordScreen(user) {
  return `
    <section class="login-screen first-access-screen" aria-label="Troca de senha no primeiro acesso">
      <div class="login-hero">
        <div class="login-brand">
          <img src="assets/logo-slt360.png" alt="SLT 360" />
          <span></span>
          <img src="assets/logo-hapvida.png" alt="Hapvida" />
        </div>
        <p class="login-eyebrow">Primeiro acesso</p>
        <h1>Troque sua senha</h1>
        <p>Esta conta foi criada com senha provisória. Para continuar os testes, defina uma senha definitiva.</p>
      </div>

      <div class="login-card first-access-card">
        <div>
          <h2>${user.nome}</h2>
          <p>${user.email} · ${normalizeUserProfile(user.perfil)}</p>
        </div>
        <form id="firstAccessPasswordForm" class="first-access-form">
          <div class="error-box inline-form-error" data-form-error></div>
          <label class="field">
            <span>Senha provisória atual</span>
            <input name="senhaAtual" type="password" required autocomplete="current-password" placeholder="Informe a senha recebida" />
          </label>
          <label class="field">
            <span>Nova senha</span>
            <input name="novaSenha" type="password" required autocomplete="new-password" placeholder="Mínimo de 8 caracteres" />
          </label>
          <label class="field">
            <span>Confirmar nova senha</span>
            <input name="confirmarSenha" type="password" required autocomplete="new-password" placeholder="Repita a nova senha" />
          </label>
          <button class="primary-action" type="submit">Salvar senha e entrar</button>
        </form>
        <div class="first-access-rules">
          <strong>Regra de acesso</strong>
          <span>A senha definitiva não pode ser igual à provisória e precisa ter pelo menos 8 caracteres.</span>
        </div>
      </div>
    </section>
  `;
}

function renderLoginUserCard(user) {
  const perfil = normalizeUserProfile(user.perfil);
  const modules = userAccessModuleLabels(user) || loginModulesForRole(perfil);
  return `
    <button class="login-user-card" type="button" data-action="fill-login-email" data-email="${user.email || ""}">
      <span class="login-avatar">${initials(user.nome)}</span>
      <strong>${user.nome}</strong>
      <small>${user.email || "sem e-mail cadastrado"}</small>
      <em>${perfil}</em>
      <span>${modules}</span>
      ${user.mustChangePassword || user.senhaProvisoria ? `<span class="temporary-password-note">Senha provisória</span>` : ""}
      <b>Usar este e-mail</b>
    </button>
  `;
}

function userAccessModuleLabels(user) {
  const modules = normalizeAccessModules(user?.accessModules, user?.perfil);
  return userAccessModules
    .filter((module) => modules.includes(module.id))
    .map((module) => module.label.replace(" 360", ""))
    .join(" · ");
}

function loginModulesForRole(role) {
  const access = moduleAccessConfig(role);
  return [
    access.projects ? "Projetos" : "",
    access.works ? "Orçamento" : "",
    access.maintenance ? "Manutenção" : "",
    access.clinical ? "Eng. Clínica" : "",
    access.budget ? "Controle de Verbas" : "",
    access.settings ? "Configuração" : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function initials(name = "") {
  return String(name || "ST")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

function dashboardKpi(label, value, hint, tone, view = "", reportFilter = "") {
  const attrs = reportFilter
    ? ` data-action="open-dashboard-report" data-report-filter="${reportFilter}" role="button" tabindex="0"`
    : view
      ? ` data-view="${view}" role="button" tabindex="0"`
      : "";
  return `
    <article class="kpi-card is-clickable" data-tone="${tone}" data-click-label="Abrir visão"${attrs}>
      <small>${label}</small>
      <strong>${value}</strong>
      <span>${hint}</span>
    </article>
  `;
}

function renderCoordinationAttention(indicators = dashboardDemandIndicators()) {
  const alerts = [
    {
      total: indicators.overdue.length,
      title: "Demandas atrasadas",
      detail: "Priorizar revisão de prazos e redistribuição.",
      tone: "red",
      filter: "overdue",
    },
    {
      total: indicators.unassigned.length,
      title: "Demandas sem responsável",
      detail: "Distribuir atividades para a equipe.",
      tone: "orange",
      filter: "unassigned",
    },
    {
      total: indicators.waitingFunds.length,
      title: "Orçamentos aguardando verba",
      detail: "Vincular ou disponibilizar verba para permitir conclusão.",
      tone: "orange",
      view: "fundsOverview",
    },
    {
      total: indicators.validation.length,
      title: "Demandas aguardando validação",
      detail: "Revisar entregas e registrar decisões.",
      tone: "cyan",
      filter: "validation",
    },
  ].filter((item) => item.total > 0);

  if (!alerts.length) {
    return `<div class="attention-empty"><strong>Nenhuma pendência crítica</strong><span>A coordenação não possui bloqueios relevantes neste momento.</span></div>`;
  }

  return `
    <div class="alert-list">
      ${alerts.map(renderAttentionItem).join("")}
    </div>
  `;
}

function renderAttentionItem(item) {
  const attrs = item.view
    ? `data-view="${item.view}"`
    : `data-action="open-dashboard-report" data-report-filter="${item.filter}"`;
  return `
    <button class="alert-item attention-item" type="button" data-tone="${item.tone}" ${attrs}>
      <div>
        <strong>${number(item.total)} ${item.title}</strong>
        <span class="muted">${item.detail}</span>
      </div>
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
    validation: "Aguardando validação",
    waitingFunds: "Aguardando verba",
    waitingInfo: "Aguardando informações",
    unassigned: "Sem responsável",
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
    ${renderToolbar("Relatórios 360", "Demandas consolidadas dos módulos de Orçamento, Manutenção e Engenharia Clínica", "")}
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
              <th>Módulo</th>
              <th>Código</th>
              <th>Demanda</th>
              <th>Status</th>
              <th>Responsável</th>
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
    ${renderToolbar("Equipe", "Distribuição de demandas e perfis de acesso da Sala Técnica", `
      <button class="secondary-action" type="button" data-view="settings">Configurações</button>
    `)}
    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Carga da equipe</h2>
            <p class="panel-subtitle">Demandas abertas por responsável</p>
          </div>
        </div>
        ${barList(load, "valor", (value) => `${number(value)} demanda(s)`)}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Usuários</h2>
            <p class="panel-subtitle">Perfis Admin, Gestão e Analista</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Nome</th><th>Perfil</th><th>Status</th><th>Módulos liberados</th></tr>
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

function cycleStep(label, title, detail) {
  return `
    <article class="cycle-step">
      <span>${label}</span>
      <strong>${title}</strong>
      <small>${detail}</small>
    </article>
  `;
}

function insightTile(title, detail, view) {
  return `
    <button class="insight-tile" type="button" data-view="${view}">
      <strong>${title}</strong>
      <span>${detail}</span>
    </button>
  `;
}

function moduleSummaries() {
  const projectPortfolio = projectPlanRows(false);
  const projectMetricsSummary = projectMetrics(projectPortfolio);
  const worksMetrics = moduleDemandMetrics("works");
  const maintenancePortfolio = maintenanceItemsForModule("maintenance");
  const clinicalPortfolio = maintenanceItemsForModule("clinical");
  const maintenancePortfolioMetrics = moduleDemandMetrics("maintenance");
  const clinicalPortfolioMetrics = moduleDemandMetrics("clinical");
  const fundsBalance = positiveFundsBalanceTotal();
  const totals = allTotals();
  const pendingEvs = (state.works || []).filter((work) => work.ev?.status !== "Completo").length;

  return [
    {
      id: "projetos",
      view: "projectsOverview",
      eyebrow: "01",
      title: "Projetos 360",
      logo: moduleHeaders.projects.logo,
      tone: "cyan",
      metrics: [
        { label: "Projetos", value: String(projectMetricsSummary.projectRows.length) },
        { label: "Próximos", value: String(projectMetricsSummary.next.length) },
        { label: "Atrasados", value: String(projectMetricsSummary.late.length) },
      ],
    },
    {
      id: "orcamento",
      view: "worksOverview",
      eyebrow: "02",
      title: "Orçamento 360",
      logo: moduleHeaders.works.logo,
      tone: "blue",
      metrics: [
        { label: "Obras", value: String(state.works.length) },
        { label: "Demandas", value: String(worksMetrics.active.length) },
        { label: "EVs pendentes", value: String(pendingEvs) },
      ],
    },
    {
      id: "manutencao",
      view: "maintenanceOverview",
      eyebrow: "03",
      title: "Manutenção 360",
      logo: moduleHeaders.maintenance.logo,
      tone: "orange",
      metrics: [
        { label: "Demandas", value: String(maintenancePortfolio.length) },
        { label: "Em fluxo", value: String(maintenancePortfolioMetrics.active.length) },
        { label: "Atrasadas", value: String(maintenancePortfolioMetrics.overdue.length) },
      ],
    },
    {
      id: "clinica",
      view: "clinicalOverview",
      eyebrow: "04",
      title: "Eng. Clínica 360",
      logo: moduleHeaders.clinical.logo,
      tone: "green",
      metrics: [
        { label: "Demandas", value: String(clinicalPortfolio.length) },
        { label: "Em fluxo", value: String(clinicalPortfolioMetrics.active.length) },
        { label: "Atrasadas", value: String(clinicalPortfolioMetrics.overdue.length) },
      ],
    },
    {
      id: "gestao",
      view: "fundsOverview",
      eyebrow: "05",
      title: "Controle de Verba 360",
      logo: moduleHeaders.budget.logo,
      tone: "red",
      metrics: [
        { label: "Verbas", value: String(state.funds?.length || 0) },
        { label: "Contratado", value: moneyCompact(totals.contratado) },
        { label: "Saldo", value: moneyCompact(fundsBalance) },
      ],
    },
  ].filter((module) => canAccessView(viewAliases[module.view] || module.view));
}

function renderHomeModuleCard(module) {
  return `
    <article class="module-card module-card--entry home-module-card" data-tone="${module.tone}" data-view="${module.view}" role="button" tabindex="0">
      <header>
        <span class="home-module-logo" aria-hidden="true">
          <img src="${module.logo}" alt="" />
        </span>
        <div>
          <span class="home-module-number">${module.eyebrow}</span>
          <h2>${module.title}</h2>
        </div>
      </header>
      <div class="module-metrics home-module-metrics">
        ${module.metrics
          .map(
            (metric) => `
              <div>
                <span>${metric.label}</span>
                <strong>${metric.value}</strong>
              </div>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderModuleCard(module) {
  return `
    <article class="module-card module-card--entry" data-tone="${module.tone}" data-view="${module.view}" role="button" tabindex="0">
      <header>
        <span class="module-acronym" aria-hidden="true">${module.abbr}</span>
        <div>
          <h2>${module.title}</h2>
          <p>${module.description}</p>
        </div>
      </header>
      <div class="module-metrics">
        ${module.metrics
          .map(
            (metric) => `
              <div>
                <span>${metric.label}</span>
                <strong>${metric.value}</strong>
              </div>
            `
          )
          .join("")}
      </div>
      <span class="ghost-button module-card__cta">Abrir módulo</span>
    </article>
  `;
}

function kpi(label, value, hint, tone, view = "", detailKey = "") {
  const viewAttr = view ? ` data-view="${view}" role="button" tabindex="0"` : "";
  const detailAttr = detailKey ? ` data-action="open-kpi-detail" data-kpi="${detailKey}" role="button" tabindex="0"` : "";
  const isClickable = view || detailKey;
  const clickLabel = detailKey ? "Abrir detalhe" : "Abrir visão";
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

function openKpiDetail(key) {
  const detail = kpiDetailData(key);
  if (!detail) return;
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card" aria-labelledby="kpiDetailTitle">
        <header>
          <div>
            <span class="eyebrow">${detail.eyebrow || "Indicador"}</span>
            <h2 id="kpiDetailTitle">${detail.title}</h2>
            <p class="muted">${detail.subtitle}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${detail.metrics.map((metric) => splitItem(metric.label, metric.value)).join("")}
          </div>
          ${
            detail.rows.length
              ? `<label class="field kpi-modal-search">
                  <span>Buscar neste indicador</span>
                  <input data-kpi-modal-search placeholder="Digite obra, região, tipo, status, analista..." />
                </label>`
              : ""
          }
          ${renderKpiDetailTable(detail)}
        </div>
        <footer class="modal-actions">
          ${detail.operationalFilter ? `<button class="secondary-action" type="button" data-action="apply-operational-filter" data-kpi="${detail.operationalFilter}">Filtrar no operacional</button>` : ""}
          ${detail.view ? `<button class="primary-action" type="button" data-view="${detail.view}">${detail.viewLabel || "Abrir visão"}</button>` : ""}
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
        </footer>
      </section>
    </div>
  `;
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
  const rows = portfolioRows(false, false);
  const totals = allTotals();
  const capex = totals.orcado + totals.aditivado;
  const active = pendingDemands();
  const completed = completedDemands();
  const overdue = overdueDemands();
  const pendingEvs = state.works.filter((work) => work.ev.status !== "Completo");
  const nearMilestone = rows.filter((row) => row.marcoStatus === "Próximo");

  const workDetail = (title, subtitle, works, metrics, view = "portfolio", viewLabel = "Abrir portfólio") => ({
    title,
    subtitle,
    eyebrow: "Portfólio de Orçamento",
    metrics,
    columns: ["Obra", "Região", "Tipo", "EV", "CAPEX"],
    rows: works.map((work) => {
      const item = work.id ? work : workById(work.id);
      const values = item ? workTotals(item) : { orcado: 0, aditivado: 0 };
      return [
        `<strong>${item?.nome || work.nome}</strong>`,
        item?.regiao || work.regional || "—",
        item?.tipoUnidade || work.tipoUnidade || "—",
        item?.ev?.status || work.evStatus || "—",
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
    columns: ["Código", "Obra", "Tipo", "Analista", "Sprint", "Status", "Prazo"],
    rows: demandRows(demands),
    operationalFilter,
    view,
    viewLabel: "Abrir operacional",
  });

  if (key === "worksPortfolio") {
    return workDetail("Obras no portfólio", "Carteira cadastrada do plano de investimento.", state.works, [
      { label: "Total de obras", value: String(state.works.length) },
      { label: "Regiões", value: String(new Set(state.works.map((work) => work.regiao)).size) },
      { label: "CAPEX", value: money(capex) },
      { label: "EVs pendentes", value: String(pendingEvs.length) },
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
      { label: "Data base", value: dateText(TODAY_ISO) },
    ], "overdueDemands");
  }
  if (key === "capexConsolidated") {
    const ranked = state.works
      .map((work) => ({ work, total: workTotals(work).orcado + workTotals(work).aditivado }))
      .sort((a, b) => b.total - a.total)
      .map((item) => item.work);
    return workDetail("CAPEX consolidado", "Maiores EVs que compõem a carteira de investimento.", ranked, [
      { label: "EV + SICs", value: money(capex) },
      { label: "Contratado", value: money(totals.contratado) },
      { label: "Saldo", value: money(totals.saldo) },
      { label: "Obras", value: String(state.works.length) },
    ], "budget", "Abrir Controle de Verba");
  }
  if (key === "nearMilestone") {
    const works = nearMilestone.map((row) => workById(row.id)).filter(Boolean);
    return workDetail("Próximas do marco", "Obras com marco de acompanhamento próximo ou EV ainda pendente.", works, [
      { label: "Próximas", value: String(works.length) },
      { label: "EVs pendentes", value: String(pendingEvs.length) },
      { label: "Marco dominante", value: topLabel(groupRowsBy(nearMilestone, "proximoMarco")) },
      { label: "Carteira", value: String(rows.length) },
    ]);
  }
  if (key === "pendingEvs") {
    return workDetail("EVs com pendência", "Obras com estudo de viabilidade em rascunho ou cotação aberta.", pendingEvs, [
      { label: "Pendentes", value: String(pendingEvs.length) },
      { label: "Completos", value: String(state.works.length - pendingEvs.length) },
      { label: "% pendente", value: `${number((pendingEvs.length / Math.max(state.works.length, 1)) * 100)}%` },
      { label: "Total obras", value: String(state.works.length) },
    ], "ev", "Abrir EVs");
  }
  if (key === "completedDemands") {
    return demandDetail("Demandas concluídas", "Entregas registradas no fluxo operacional.", completed, [
      { label: "Concluídas", value: String(completed.length) },
      { label: "No prazo", value: String(completed.filter((demand) => demandDeliveryDelay(demand) <= 0).length) },
      { label: "Com atraso", value: String(completed.filter((demand) => demandDeliveryDelay(demand) > 0).length) },
      { label: "Valor produzido", value: money(completed.reduce((sum, demand) => sum + demandProducedValue(demand), 0)) },
    ], "completedDemands", "worksManagement");
  }
  if (key === "analysts") {
    return {
      title: "Analistas mobilizados",
      subtitle: "Carga aberta, entregas concluídas e atraso por responsável.",
      eyebrow: "Capacidade Operacional",
      metrics: [
        { label: "Analistas", value: String(uniqueAnalysts().length) },
        { label: "Demandas abertas", value: String(active.length) },
        { label: "Concluídas", value: String(completed.length) },
        { label: "Atrasadas", value: String(overdue.length) },
      ],
      columns: ["Analista", "Abertas", "Concluídas", "Atrasadas", "Valor produzido"],
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
    sicImpact: "Impacto líquido das SICs",
    sicAdditives: "Valores de Aditivos",
    sicSuppressions: "Supressões",
    sicWorks: "Obras impactadas por SICs",
    sicTotal: "SICs analisadas",
  };
  const records = selectors[key];
  if (!records) return null;
  const rows = sicSummaryRows(records);
  return {
    title: titles[key],
    subtitle: "Detalhe filtrado da base histórica de SICs.",
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
      eyebrow: "Visão Estratégica · Base EV",
      title: key === "strategicUnifiedTop5" ? "Cinco maiores EVs da base unificada" : "Base estratégica unificada de EVs",
      subtitle: "A mesma origem de dados da aba EV, sem indicadores paralelos da antiga Base Geral.",
      metrics: [
        { label: "EVs", value: String(records.length) },
        { label: "Valor total", value: money(total) },
        { label: "Área válida", value: `${number(area)} m²` },
        { label: "EVs com área válida", value: String(valid.length) },
      ],
      columns: ["Ano / EV", "Tipologia", "Origem", "Valor", "Área", "Custo/m²", "% da base"],
      rows: selected.map((record) => [
        `<strong>${record.year} · ${escapeAttribute(record.project)}</strong><br /><span class="muted">${escapeAttribute(record.code || "Sem código")} · ${escapeAttribute(record.revision || "")}</span>`,
        record.typology || "Não informada",
        record.sourceLabel || "Base EV",
        money(record.total),
        record.area ? `${number(record.area)} m²` : "—",
        record.area && record.total ? `${money(record.total / record.area)}/m²` : "—",
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
  const workColumns = ["Obra", "Região", "Tipo", "Classificação", "Valor", "Custo/m²"];
  const workRows = (works) =>
    works.map((work) => {
      const values = workTotals(work);
      const total = values.orcado + values.aditivado;
      return [
        `<strong>${work.nome}</strong>`,
        work.regiao || "—",
        work.tipoUnidade || "—",
        work.classificacaoObra || "—",
        money(total),
        work.areaEquivalente ? `${money(total / work.areaEquivalente)}/m²` : "—",
      ];
    });
  const targetRows = strategicCostTargetRows();
  const targetSummary = strategicCostTargetSummary(targetRows);
  const commissionSummary = commissionBenchmarkSummary();
  const targetWorkColumns = ["Obra", "Classificação", "Cidade/UF", "EV / CAPEX", "Área válida", "Custo/m²", "Desvio", "Status"];
  const targetWorkRows = (readings) =>
    readings
      .filter(isStrategicCostReadingValid)
      .map((reading) => [
        `<strong>${reading.work.nome}</strong><br /><span class="muted">${reading.work.tipoUnidade || "Tipo não informado"} · ${reading.work.classificacaoObra || "Sem classificação"}</span>`,
        strategicCostTargetModeLabel(reading.work),
        `${reading.work.cidade || "—"}/${reading.work.uf || "—"}`,
        money(reading.value),
        `${number(reading.area)} m²`,
        `${money(reading.costM2)}/m²`,
        reading.target ? `${money(reading.costM2 - reading.target.targetMax)}/m²` : "—",
        `<span class="status-pill" data-status="${strategicCostTargetStatusTone(reading.status)}">${reading.status}</span>`,
      ]);
  const detailBase = {
    eyebrow: "Visão Estratégica",
    metrics: [
      { label: "Sala Técnica", value: money(capex) },
      { label: "Negociado", value: money(negotiatedTotal) },
      { label: "Obras", value: String(sourceRecords.length) },
      { label: "Área", value: `${number(sourceSummary.area)} m²` },
    ],
    view: "worksStrategic",
    viewLabel: "Abrir estratégica",
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
      subtitle: `Somente obras da Base Geral com valor negociado, área e custo/m² válidos entram nesta leitura. Meta SLT: ${row.targetLabel}.`,
      metrics: [
        { label: "Obras válidas", value: String(readings.length) },
        { label: "Valor negociado", value: money(row.capex) },
        { label: "Área válida", value: `${number(row.area)} m²` },
        { label: "Custo médio m²", value: row.costM2 ? `${money(row.costM2)}/m²` : "Sem leitura" },
        { label: "Dentro da meta", value: String(row.withinCount) },
        { label: "Acima da meta", value: String(row.aboveCount) },
        { label: "Abaixo da faixa", value: String(row.belowRangeCount) },
        { label: "Aderência", value: row.measuredCount ? `${number(row.adherence)}%` : "Sem leitura" },
        { label: "Histórico Comissão", value: row.historicalCount ? `${money(row.historicalPrecoM2Mediana || row.historicalPrecoM2Ponderado)}/m²` : "Sem base" },
        { label: "Hist. negociado", value: money(row.historicalNegociado) },
      ],
      columns: targetWorkColumns,
      rows: targetWorkRows(readings),
    };
  }

  if (key === "strategicCostTargets") {
    return {
      ...detailBase,
      title: "Aderência à meta de custo por m²",
      subtitle: "Comparação por tipologia contra as premissas da Sala Técnica.",
      metrics: [
        { label: "Obras válidas", value: String(targetSummary.measured) },
        { label: "Dentro da meta", value: String(targetSummary.within) },
        { label: "Acima da meta", value: String(targetSummary.above) },
        { label: "Aderência", value: targetSummary.measured ? `${number(targetSummary.adherence)}%` : "Sem leitura" },
        { label: "Base histórica", value: String(commissionSummary.count) },
        { label: "M² histórico", value: commissionSummary.count ? `${money(commissionSummary.precoM2Mediana || commissionSummary.precoM2Ponderado)}/m²` : "Sem base" },
      ],
      columns: ["Tipologia", "Meta SLT", "Obras válidas", "Negociado", "Área válida", "Custo/m²", "Aderência", "Mediana m²", "Negociado total", "Status"],
      rows: targetRows.map((row) => [
        `<strong>${row.label}</strong>`,
        row.targetLabel,
        String(row.measuredCount),
        money(row.capex),
        `${number(row.area)} m²`,
        row.costM2 ? `${money(row.costM2)}/m²` : "—",
        row.measuredCount ? `${number(row.adherence)}%` : "—",
        row.historicalCount ? `${money(row.historicalPrecoM2Mediana || row.historicalPrecoM2Ponderado)}/m²` : "—",
        row.historicalCount ? money(row.historicalNegociado) : "—",
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
        { label: "Valor Sala Técnica", value: money(sourceSummary.salaTecnica) },
        { label: "Valor negociado", value: money(sourceSummary.negociado) },
        { label: "Saving técnico", value: money(sourceSummary.saving) },
        { label: "Área histórica", value: `${number(sourceSummary.area)} m²` },
        { label: "Preço/m² mediano", value: commissionSummary.count ? `${money(commissionSummary.precoM2Mediana)}/m²` : "Sem base" },
      ],
      columns: ["Obra", "UF", "Região", "Classificação", "Tipo", "Sala Técnica", "Negociado", "Área", "Preço/m²", "Status"],
      rows: records.map((record) => [
        `<strong>${record.nomeObra || record.nomeObraOriginal || "Sem nome"}</strong><br /><span class="muted">${record.codigoObra || "Sem código"} · ${dateText(record.mes)}</span>`,
        record.uf || "—",
        record.regiao || "—",
        record.classificacaoObra || "—",
        record.tipoObra || record.tipoObras || "—",
        money(record.valorSalaTecnica),
        money(record.valorNegociado),
        `${number(record.areaM2)} m²`,
        `${money(record.precoM2)}/m²`,
        record.status || "—",
      ]),
    };
  }

  if (key === "strategicAboveTarget") {
    const readings = worksAboveStrategicCostTarget();
    return {
      ...detailBase,
      title: "Obras acima da meta de custo por m²",
      subtitle: "Obras que ultrapassam o teto definido para a tipologia.",
      metrics: [
        { label: "Acima da meta", value: String(readings.length) },
        { label: "Maior custo/m²", value: readings[0] ? `${money(readings[0].costM2)}/m²` : "—" },
        { label: "Meta mais crítica", value: readings[0]?.target?.label || "Sem leitura" },
        { label: "Desvio máximo", value: readings[0]?.target ? `${money(readings[0].costM2 - readings[0].target.targetMax)}/m²` : "—" },
      ],
      columns: targetWorkColumns,
      rows: targetWorkRows(readings),
    };
  }

  if (key === "strategicRegions") {
    const rows = historicalNegotiatedByRegion();
    return {
      ...detailBase,
      title: "Regiões atendidas",
      subtitle: "Distribuição regional do valor negociado nas 485 obras da Base Geral.",
      columns: ["Região", "Valor negociado", "% do total"],
      rows: rows.map((row) => [row.label, money(row.valor), `${number((row.valor / Math.max(negotiatedTotal, 1)) * 100, 1)}%`]),
    };
  }

  if (key === "strategicTop5") {
    const rows = historicalInvestmentRankingRows().slice(0, 5);
    return {
      ...detailBase,
      title: "Concentração Top 5",
      subtitle: "Cinco maiores valores negociados da Base Geral atualizada.",
      columns: ["Obra", "Região", "Classificação", "Negociado", "% do total", "Área", "Custo/m²"],
      rows: rows.map(({ record, valor }) => [
        `<strong>${record.nomeObra}</strong><br /><span class="muted">${record.codigoObra || "Sem código"}</span>`,
        record.regiao || "—",
        historicalClassificationLabel(record.classificacaoObra),
        money(valor),
        `${number((valor / Math.max(negotiatedTotal, 1)) * 100, 1)}%`,
        `${number(record.areaM2)} m²`,
        record.precoM2 ? `${money(record.precoM2)}/m²` : "—",
      ]),
    };
  }

  const map = {
    strategicCapex: {
      title: "CAPEX total",
      subtitle: "Composição executiva dos EVs consolidados.",
      works: ranked.map((row) => row.work),
    },
    strategicWorks: {
      title: "Obras estratégicas",
      subtitle: "Projetos classificados como estratégicos, expansão ou verticalização.",
      works: state.works.filter(isStrategicWork),
    },
    strategicNewUnits: {
      title: "Novas unidades",
      subtitle: "Projetos associados à expansão de rede e novas operações.",
      works: state.works.filter(isNewUnit),
    },
    strategicPendingEvs: {
      title: "EVs pendentes",
      subtitle: "Estudos de viabilidade ainda em rascunho ou cotação.",
      works: state.works.filter((work) => work.ev.status !== "Completo"),
    },
    strategicCriticalBalance: {
      title: "Saldo crítico",
      subtitle: "Obras com saldo financeiro em atenção para decisão executiva.",
      works: worksWithCriticalBalance(),
    },
    strategicTop5: {
      title: "Concentração Top 5",
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
    const sprint = sprintById(demand.sprintId);
    return [
      `<strong>${demand.id}</strong>`,
      work?.nome || "Obra não localizada",
      demandTypeLabel(demand.tipo),
      demand.analistaResponsavel || "—",
      sprint?.nome || "—",
      demandStatusLabel(demand),
      isDemandLate(demand) ? "Atrasada" : dateText(demand.dataPrevistaEntrega),
    ];
  });
}

function operationalKpiDetailData(key) {
  const filtered = filteredDemands();
  const map = {
    opTotal: { title: "Total no filtro operacional", demands: filtered, metric: "Total", filter: "opTotal" },
    opFazer: { title: "Demandas a iniciar", demands: filtered.filter((demand) => demand.coluna === "fazer"), metric: "A iniciar", filter: "opFazer" },
    opFazendo: { title: "Demandas em execução", demands: filtered.filter((demand) => demand.coluna === "fazendo"), metric: "Em execução", filter: "opFazendo" },
    opPausado: { title: "Demandas pausadas", demands: filtered.filter((demand) => demand.coluna === "pausado"), metric: "Pausadas", filter: "opPausado" },
    opValidacao: {
      title: "Demandas em validação",
      demands: filtered.filter((demand) => ["validacaoST", "validacaoObras"].includes(demand.coluna)),
      metric: "Validação",
      filter: "opValidacao",
    },
    opConcluido: { title: "Demandas concluídas", demands: filtered.filter((demand) => demand.coluna === "concluido"), metric: "Concluídas", filter: "opConcluido" },
    opCancelado: { title: "Demandas canceladas", demands: filtered.filter((demand) => demand.coluna === "cancelado"), metric: "Canceladas", filter: "opCancelado" },
    opAtrasadas: { title: "Demandas atrasadas", demands: filtered.filter(isDemandLate), metric: "Atrasadas", filter: "opAtrasadas" },
  };
  const item = map[key];
  if (!item) return null;
  return {
    title: item.title,
    subtitle: operationalActiveFilterText() || "Leitura do painel operacional no filtro atual.",
    eyebrow: "Painel Operacional",
    metrics: [
      { label: item.metric, value: String(item.demands.length) },
      { label: "Analistas", value: String(new Set(item.demands.map((demand) => demand.analistaResponsavel).filter(Boolean)).size) },
      { label: "Atrasadas", value: String(item.demands.filter(isDemandLate).length) },
      { label: "Valor estimado", value: money(item.demands.reduce((sum, demand) => sum + demandProducedValue(demand), 0)) },
    ],
    columns: ["Código", "Obra", "Tipo", "Analista", "Sprint", "Status", "Prazo"],
    rows: demandRows(item.demands),
    operationalFilter: item.filter,
    view: "worksOperational",
    viewLabel: "Abrir operacional",
  };
}

function groupRowsBy(rows, field) {
  const map = new Map();
  rows.forEach((row) => {
    const label = row[field] || "Não informado";
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

function renderStrategicCostTargetList(rows) {
  if (!rows.length) return `<div class="empty-state">Sem metas configuradas.</div>`;
  return `
    <div class="target-list">
      ${rows
        .map((row) => {
          const width = row.costM2 ? Math.min((row.costM2 / row.targetMax) * 100, 120) : 0;
          const overTarget = row.costM2 > row.targetMax;
          return `
            <button class="target-row" type="button" data-action="open-kpi-detail" data-kpi="strategicCostTarget:${row.id}">
              <span>
                <strong>${row.label}</strong>
                <small>${row.targetLabel} · ${row.measuredCount} obra(s) válida(s)</small>
                ${row.sourceHistoricalOnly
                  ? `<small>${moneyCompact(row.capex)} negociados · ${metricCompact(row.area, " m²")}</small>`
                  : row.historicalCount ? `<small>Base histórica: ${money(row.historicalPrecoM2Mediana || row.historicalPrecoM2Ponderado)}/m² · ${row.historicalCount} registro(s)</small>` : ""}
              </span>
              <span class="target-meter" aria-hidden="true">
                <i style="width:${Math.max(width, row.measuredCount ? 4 : 0)}%" data-over="${overTarget ? "true" : "false"}"></i>
              </span>
              <span class="target-values">
                <b>${row.costM2 ? `${money(row.costM2)}/m²` : "—"}</b>
                <em>${number(row.adherence)}% dentro</em>
              </span>
              <span class="status-pill" data-status="${strategicCostTargetStatusTone(row.status)}">${row.status}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderStrategicTargetSpotlight(summary) {
  const tone = summary.adherence >= 80 ? "green" : summary.adherence >= 60 ? "orange" : "red";
  const value = summary.measured ? `${number(summary.adherence)}%` : "Sem leitura";
  const statusText = summary.above ? `${summary.above} obra(s) acima da meta` : "Carteira dentro da premissa";
  const below = Math.max(summary.measured - summary.within - summary.above, 0);
  return `
    <button class="strategic-main-kpi" type="button" data-tone="${tone}" data-action="open-kpi-detail" data-kpi="strategicCostTargets" style="--hero-progress:${Math.max(0, Math.min(summary.adherence, 100)) * 3.6}deg">
      <header><span class="eyebrow">Indicador principal</span><em>${statusText}</em></header>
      <div class="strategic-main-kpi__body">
        <span class="strategic-main-ring"><b>${value}</b><small>aderência</small></span>
        <span class="strategic-main-copy">
          <strong>Aderência à meta de custo por m²</strong>
          <small>${summary.within} de ${summary.measured} obras elegíveis estão dentro da premissa SLT.</small>
          <span class="strategic-main-breakdown">
            <span data-tone="green"><i></i><b>${summary.within}</b><small>Dentro</small></span>
            <span data-tone="red"><i></i><b>${summary.above}</b><small>Acima</small></span>
            <span data-tone="orange"><i></i><b>${below}</b><small>Abaixo</small></span>
          </span>
        </span>
      </div>
      <span class="strategic-main-footer"><i>Base Geral · custo negociado por m²</i><b>Ver análise completa →</b></span>
    </button>
  `;
}

function renderWorksTable(works) {
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID App</th>
            <th>Obra</th>
            <th>Regional</th>
            <th>Tipologia</th>
            <th class="numeric">EV atualizado</th>
            <th class="numeric">Contratado</th>
            <th class="numeric">Saldo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${works
            .map((work) => {
              const values = workTotals(work);
              return `
                <tr>
                  <td>${work.chaveUnica}</td>
                  <td>
                    <strong>${work.nome}</strong><br />
                    <span class="muted">${work.codigoOriginal} | ${work.cidade}/${work.uf}</span>
                  </td>
                  <td>${work.regiao}</td>
                  <td>${work.tipologiaObra}</td>
                  <td class="numeric">${money(values.orcado + values.aditivado)}</td>
                  <td class="numeric">${money(values.contratado)}</td>
                  <td class="numeric">${money(values.saldo)}</td>
                  <td><span class="status-pill" data-status="${work.ev.status}">${work.ev.status}</span></td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderKanban() {
  return renderWorksOperational();
}

function renderWorksHome() {
  const rows = portfolioRows();
  const totals = allTotals();
  const capex = totals.orcado + totals.aditivado;
  const overdue = overdueDemands();
  const activeDemands = pendingDemands();
  const completed = completedDemands();
  const analysts = uniqueAnalysts();
  const pendingEvs = rows.filter((row) => row.evStatus !== "Completo").length;
  const nearMilestone = rows.filter((row) => row.marcoStatus === "Próximo").length;

  return `
    ${renderWorksToolbar("worksHome", "Orçamento 360", "Central de orçamentação da Sala Técnica com portfólio, EV, SICs e visões gerenciais", `
      ${miroButton("Fluxos no Miro")}
      <button class="secondary-action" type="button" data-view="portfolio">Consultar portfólio</button>
      <button class="primary-action" type="button" data-action="open-demand">Nova demanda</button>
    `)}

    <section class="kpi-grid">
      ${kpi("Obras no portfólio", String(rows.length), "Carteira do plano de investimento", "blue", "", "worksPortfolio")}
      ${kpi("Demandas ativas", String(activeDemands.length), "Fluxo operacional de obras", "orange", "", "activeDemands")}
      ${kpi("Demandas atrasadas", String(overdue.length), "Itens fora do prazo previsto", overdue.length ? "red" : "green", "", "overdueDemands")}
      ${kpi("CAPEX consolidado", money(capex), "EVs + SICs aprovadas", "blue", "", "capexConsolidated")}
      ${kpi("Próximas do marco", String(nearMilestone), "Acompanhamento executivo", "green", "", "nearMilestone")}
      ${kpi("EVs com pendência", String(pendingEvs), "Rascunho ou em cotação", pendingEvs ? "red" : "green", "", "pendingEvs")}
      ${kpi("Demandas concluídas", String(completed.length), "Entregas registradas", "green", "", "completedDemands")}
      ${kpi("Analistas mobilizados", String(analysts.length), analysts.join(", ") || "Sem analistas", "orange", "", "analysts")}
    </section>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Fila crítica</h2>
            <p class="panel-subtitle">Demandas atrasadas ou aguardando validação</p>
          </div>
          <button class="secondary-action" type="button" data-view="worksOperational">Ver todas</button>
        </div>
        <div class="alert-list">
          ${criticalDemandItems().join("") || `<div class="empty-state">Sem demanda crítica no momento.</div>`}
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
            <h2>Distribuição regional</h2>
            <p class="panel-subtitle">Quantidade de obras por região</p>
          </div>
        </div>
        ${barList(workCountBy("regiao"), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Composição do portfólio</h2>
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
  const awaitingValidation = filtered.filter((demand) => ["validacaoST", "validacaoObras"].includes(demand.coluna)).length;
  const inProgress = filtered.filter((demand) => demand.coluna === "fazendo").length;
  const paused = filtered.filter((demand) => demand.coluna === "pausado").length;
  const concluded = filtered.filter((demand) => demand.coluna === "concluido").length;
  const canceled = filtered.filter((demand) => demand.coluna === "cancelado").length;
  const late = filtered.filter(isDemandLate).length;

  return `
    ${renderWorksToolbar("worksOperational", "Visão Operacional", "Planejamento, fluxo de trabalho e controle dos marcos de entrega por sprint", `
      <button class="secondary-action" type="button" data-view="settings">Sprints globais</button>
      <button class="secondary-action" type="button" data-action="export-works-operational">Exportar relatório</button>
      <button class="primary-action" type="button" data-action="open-demand">Nova demanda</button>
    `)}
    <section class="status-line module-status-line">
      <span class="tag">Sprint atual: ${activeSprint?.nome || "Sem sprint ativa"}</span>
      <span class="tag">Busca global aplicada: ${searchTerm || "sem filtro"}</span>
      <span class="tag">Pendências de cotação: ${state.works.filter((work) => work.ev.status !== "Completo").length}</span>
    </section>

    ${renderOperationalFilters()}

    <section class="kpi-grid">
      ${kpi("Total na sprint", String(filtered.length), "Demandas no filtro atual", "blue", "", "opTotal")}
      ${kpi("A iniciar", String(filtered.filter((demand) => demand.coluna === "fazer").length), "Fila Fazer", "orange", "", "opFazer")}
      ${kpi("Em execução", String(inProgress), "Fila Fazendo", "green", "", "opFazendo")}
      ${kpi("Pausado", String(paused), "Aguardando destrava", "orange", "", "opPausado")}
      ${kpi("Validação", String(awaitingValidation), "Sala Técnica e Obras", "blue", "", "opValidacao")}
      ${kpi("Concluído", String(concluded), "Entregas registradas", "green", "", "opConcluido")}
      ${kpi("Cancelado", String(canceled), "Itens encerrados sem entrega", "red", "", "opCancelado")}
      ${kpi("Atrasadas", String(late), "Prazo previsto vencido", late ? "red" : "green", "", "opAtrasadas")}
    </section>

    <section class="panel operational-board-panel">
      <div class="panel-header">
        <div>
          <h2>Kanban operacional</h2>
          <p class="panel-subtitle">Demandas por status, responsável e prazo</p>
        </div>
        <div class="inline-actions">
          <div class="segmented">
            <button class="${operationalViewMode === "kanban" ? "is-active" : ""}" type="button" data-action="set-operational-view" data-mode="kanban">Kanban</button>
            <button class="${operationalViewMode === "list" ? "is-active" : ""}" type="button" data-action="set-operational-view" data-mode="list">Lista</button>
          </div>
          <button class="secondary-action" type="button" data-action="clear-operational-filters">Limpar filtros</button>
          <button class="secondary-action" type="button" data-view="worksManagement">Visão gerencial</button>
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
    const sprint = sprintById(demand.sprintId);
    const sicInfo = demandSicInfo(demand) || {};
    const text = normalizeSearchText(
      `${demand.id} ${work?.nome || ""} ${demand.analistaResponsavel} ${demand.tipo} ${demand.observacao || ""} ${sicInfo.lecomNumber || ""} ${sicInfo.numeroSic || ""} ${sicInfo.tituloSic || ""} ${sicInfo.obraNumber || ""} ${sicInfo.obraNome || ""}`
    );
    const query = normalizeSearchText([searchTerm, operationalFilters.query].filter(Boolean).join(" ")).trim();
    if (query && !query.split(/\s+/).every((part) => text.includes(part))) return false;
    if (operationalFilters.sprintId && demand.sprintId !== operationalFilters.sprintId) return false;
    if (operationalFilters.analyst && demand.analistaResponsavel !== operationalFilters.analyst) return false;
    if (operationalFilters.type && demandTypeKey(demand.tipo) !== operationalFilters.type) return false;
    if (operationalFilters.status === "validacao" && !["validacaoST", "validacaoObras"].includes(demand.coluna)) return false;
    if (operationalFilters.status && operationalFilters.status !== "validacao" && demand.coluna !== operationalFilters.status) return false;
    if (operationalFilters.punctuality === "late" && !isDemandLate(demand)) return false;
    if (operationalFilters.punctuality === "onTime" && isDemandLate(demand)) return false;
    if (operationalFilters.sprintId && !sprint) return false;
    return true;
  });
}

function renderOperationalFilters() {
  return `
    <section class="panel filter-panel">
      <label class="field">
        <span>Buscar demanda</span>
        <input data-operational-search value="${escapeAttribute(operationalFilters.query)}" placeholder="Buscar por código, obra ou descrição..." />
      </label>
      <div class="filter-grid">
        <label class="field">
          <span>Sprint</span>
          <select data-operational-filter="sprintId">
            <option value="">Todas</option>
            ${(state.sprints || []).map((sprint) => `<option value="${sprint.id}" ${operationalFilters.sprintId === sprint.id ? "selected" : ""}>${sprint.nome}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Analista</span>
          <select data-operational-filter="analyst">
            <option value="">Todos</option>
            ${uniqueAnalysts().map((analyst) => `<option value="${analyst}" ${operationalFilters.analyst === analyst ? "selected" : ""}>${analyst}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Tipo de atividade</span>
          <select data-operational-filter="type">
            <option value="">Todas</option>
            ${["EmissaoInicial", "ReemissaoCompleta", "SIC"].map((type) => `<option value="${type}" ${operationalFilters.type === type ? "selected" : ""}>${demandTypeLabel(type)}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Situação</span>
          <select data-operational-filter="status">
            <option value="">Todas</option>
            ${columns.map((column) => `<option value="${column.id}" ${operationalFilters.status === column.id ? "selected" : ""}>${column.label}</option>`).join("")}
            <option value="validacao" ${operationalFilters.status === "validacao" ? "selected" : ""}>Aguardando validação</option>
          </select>
        </label>
        <label class="field">
          <span>Prazo</span>
          <select data-operational-filter="punctuality">
            <option value="">Todos</option>
            <option value="late" ${operationalFilters.punctuality === "late" ? "selected" : ""}>Atrasadas</option>
            <option value="onTime" ${operationalFilters.punctuality === "onTime" ? "selected" : ""}>No prazo</option>
          </select>
        </label>
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
    <div class="kanban-board">
      ${columns
        .map((column) => {
          const demands = filtered.filter((demand) => demand.coluna === column.id);
          return `
            <section class="kanban-column" data-column="${column.id}">
              <header>
                <h2>${column.label}</h2>
                <span class="kanban-count" aria-label="${demands.length} demandas">${demands.length}</span>
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
            <th>Código</th>
            <th>Obra</th>
            <th>Tipo</th>
            <th>Analista</th>
            <th>Sprint</th>
            <th>Status</th>
            <th>Prioridade</th>
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
  const sprint = sprintById(demand.sprintId);
  const isSic = demandTypeKey(demand.tipo) === "SIC";
  const approval = isSic ? sicApprovalReading(demand) : null;
  const value = demandProducedValue(demand) || (approval ? sicApprovalValue(demand) : 0);
  return `
    <tr data-action="open-demand-detail" data-id="${demand.id}" role="button" tabindex="0">
      <td><strong>${demand.id}</strong></td>
      <td><strong>${work?.nome || "Obra não localizada"}</strong></td>
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
      <td>${demand.analistaResponsavel || "—"}</td>
      <td>${sprint?.nome || "—"}</td>
      <td><span class="status-dot" data-status="${demand.coluna}"></span>${demandStatusLabel(demand)}</td>
      <td><span class="tag">${demand.prioridade}</span></td>
      <td class="numeric">${value ? money(value) : "—"}</td>
      <td>${isDemandLate(demand) ? `<span class="status-pill" data-status="Atrasada">Atrasada</span>` : dateText(demand.dataPrevistaEntrega)}</td>
    </tr>
  `;
}

function renderDemandCard(demand) {
  const work = workById(demand.obraId);
  const sprint = sprintById(demand.sprintId);
  const sprintName = sprint?.nome || demand.sprintId || "Sem sprint";
  const sprintFlag = sprintFlagLabel(sprintName);
  const timing = demandTimingInfo(demand);
  const complementCount = (demand.analistasComplementares || []).length;
  const isSic = demandTypeKey(demand.tipo) === "SIC";
  const approval = isSic ? sicApprovalReading(demand) : null;
  const value = demandProducedValue(demand) || (approval ? sicApprovalValue(demand) : 0);
  return `
    <article class="demand-card ${isSic ? "is-sic" : ""}" data-status="${demand.coluna}" data-action="open-demand-detail" data-id="${demand.id}" role="button" tabindex="0">
      <div class="demand-card-top">
        <div class="demand-card-id">
          <span class="demand-code">${demand.id}</span>
          ${isSic ? `<span class="demand-type-badge">SIC</span>` : ""}
        </div>
        <div class="demand-card-actions">
          <span class="sprint-flag" title="${escapeAttribute(sprintName)}">${sprintFlag}</span>
          <span class="priority-pill">${demand.prioridade || "Média"}</span>
          <button class="card-delete-button" type="button" aria-label="Excluir ${demand.id}" title="Excluir demanda" data-action="open-delete-demand" data-id="${demand.id}">×</button>
        </div>
      </div>
      <h3>${work?.nome || "Obra não localizada"}</h3>
      ${
        approval
          ? `<div class="sic-card-sync">
              <span class="sic-approval-badge" data-status="${approval.dataStatus}">${approval.label}</span>
              <button class="sic-card-sync-button" type="button" data-action="open-sic-approval" data-id="${demand.id}">Aprovação</button>
            </div>`
          : ""
      }
      ${demand.unidadeModo === "existente" ? `<div class="demand-card-unit-badge">Unidade existente · ${escapeAttribute(demand.unidadeNome || "cadastro mestre")}</div>` : ""}
      <div class="demand-card-meta">
        <span>${demand.analistaResponsavel || "Analista a definir"}</span>
        ${complementCount ? `<b>+${complementCount}</b>` : ""}
      </div>
      <span class="demand-card-date">${timing.dateLabel}</span>
      <div class="demand-card-alert" data-tone="${timing.tone}">
        <i></i>
        <strong>${timing.label}</strong>
      </div>
      ${
        demand.coluna === "concluido" && value
          ? `<div class="demand-card-value"><span>Valor da demanda</span><strong>${money(value)}</strong></div>`
          : ""
      }
    </article>
  `;
}

function demandTimingInfo(demand) {
  if (demand.coluna === "cancelado") {
    return { tone: "gray", label: "Cancelada", dateLabel: "Sem entrega ativa" };
  }
  if (demand.coluna === "concluido") {
    return {
      tone: "green",
      label: demandDeliveryDelay(demand) > 0 ? `Concluída com ${demandDeliveryDelay(demand)} d de atraso` : "Entregue no prazo",
      dateLabel: demand.dataEntregaReal ? `Concluída em ${dateText(demand.dataEntregaReal)}` : "Concluída",
    };
  }
  if (isDemandLate(demand)) {
    const lateDays = daysBetween(demand.dataPrevistaEntrega, TODAY_ISO);
    return {
      tone: "red",
      label: `Atrasada há ${lateDays} dia${lateDays === 1 ? "" : "s"}`,
      dateLabel: `Entrega prevista: ${dateText(demand.dataPrevistaEntrega)}`,
    };
  }
  if (demand.dataPrevEnvioValidacaoObras) {
    const daysToValidation = daysBetween(TODAY_ISO, demand.dataPrevEnvioValidacaoObras);
    if (daysToValidation >= 0 && daysToValidation <= 5) {
      return {
        tone: "orange",
        label: "Próximo do envio p/ validação",
        dateLabel: `Envio p/ validação: ${dateText(demand.dataPrevEnvioValidacaoObras)}`,
      };
    }
  }
  return {
    tone: "green",
    label: "Em dia",
    dateLabel: demand.dataPrevistaEntrega ? `Entrega prevista: ${dateText(demand.dataPrevistaEntrega)}` : "Sem data prevista",
  };
}

function completedDemands() {
  return state.demands.filter((demand) => demand.coluna === "concluido");
}

function currentSprint() {
  const sprints = Array.isArray(state.sprints) ? state.sprints : [];
  return sprints.find((sprint) => sprint.status === "Ativa") || sprints[sprints.length - 1];
}

function sprintById(id) {
  return (state.sprints || []).find((sprint) => sprint.id === id);
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

function isDemandLate(demand) {
  return (
    !["concluido", "cancelado"].includes(demand.coluna) &&
    demand.dataPrevistaEntrega &&
    demand.dataPrevistaEntrega < TODAY_ISO
  );
}

function resetOperationalFilters() {
  operationalFilters = {
    query: "",
    sprintId: "",
    analyst: "",
    type: "",
    status: "",
    punctuality: "",
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
  if (operationalFilters.sprintId) active.push(sprintById(operationalFilters.sprintId)?.nome || "sprint selecionada");
  if (operationalFilters.analyst) active.push(`analista ${operationalFilters.analyst}`);
  if (operationalFilters.type) active.push(demandTypeLabel(operationalFilters.type));
  if (operationalFilters.status) {
    active.push(operationalFilters.status === "validacao" ? "aguardando validação" : columnById(operationalFilters.status)?.label || operationalFilters.status);
  }
  if (operationalFilters.punctuality === "late") active.push("atrasadas");
  if (operationalFilters.punctuality === "onTime") active.push("no prazo");
  return active.length ? `Filtrando por: ${active.join(" | ")}` : "";
}

function applyOperationalKpiFilter(key) {
  const map = {
    opTotal: {},
    activeDemands: {},
    opFazer: { status: "fazer" },
    opFazendo: { status: "fazendo" },
    opPausado: { status: "pausado" },
    opValidacao: { status: "validacao" },
    opConcluido: { status: "concluido" },
    completedDemands: { status: "concluido" },
    opCancelado: { status: "cancelado" },
    overdueDemands: { punctuality: "late" },
    opAtrasadas: { punctuality: "late" },
  };
  const filter = map[key];
  if (!filter) return;
  operationalFilters.status = filter.status || "";
  operationalFilters.punctuality = filter.punctuality || "";
  operationalViewMode = "list";
  closeModal();
  setView("worksOperational");
}

function uniqueAnalysts() {
  return [
    ...new Set(
      state.demands.flatMap((demand) => [
        demand.analistaResponsavel,
        ...(demand.analistasComplementares || []),
      ])
    ),
  ].filter(Boolean);
}

function analystOptions(selected = "") {
  const analysts = uniqueAnalysts();
  const options = selected && !analysts.includes(selected) ? [selected, ...analysts] : analysts;
  return [`<option value="">A definir</option>`]
    .concat(options.map((analyst) => `<option value="${analyst}" ${analyst === selected ? "selected" : ""}>${analyst}</option>`))
    .join("");
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
        demand.dataPrevistaEntrega < TODAY_ISO;
      return isLate || ["validacaoST", "validacaoObras"].includes(demand.coluna);
    })
    .slice(0, 5);

  return critical.map((demand) => {
    const work = workById(demand.obraId);
    const lateDays =
      demand.dataPrevistaEntrega && demand.dataPrevistaEntrega < TODAY_ISO
        ? daysBetween(demand.dataPrevistaEntrega, TODAY_ISO)
        : 0;
    const column = columns.find((item) => item.id === demand.coluna)?.label || demand.coluna;
    const statusText = lateDays > 0 ? `Atrasada há ${lateDays} dia${lateDays === 1 ? "" : "s"}` : column;
    return alertItem(
      `${work?.nome || "Obra não localizada"} | ${demand.id}`,
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
  state.works.forEach((work) => {
    const label = work[field] || "Não informado";
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
    const label = work?.[field] || "Não informado";
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

function disciplineBenchmarkRows() {
  const groups = new Map();
  state.works.forEach((work) => {
    if (!work.areaEquivalente) return;
    work.ev.lines.forEach((line) => {
      if (isRiskLine(line) || !line.valorOrcado) return;
      const id = canonicalDisciplineId(line.disciplinaId);
      const unitCost = line.valorOrcado / work.areaEquivalente;
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push(unitCost);
    });
  });

  const medians = new Map([...groups.entries()].map(([id, values]) => [id, median(values)]));
  const rows = [];
  state.works.forEach((work) => {
    if (!work.areaEquivalente) return;
    work.ev.lines.forEach((line) => {
      if (isRiskLine(line) || !line.valorOrcado) return;
      const id = canonicalDisciplineId(line.disciplinaId);
      const historical = medians.get(id) || 0;
      if (!historical) return;
      const unitCost = line.valorOrcado / work.areaEquivalente;
      const deviation = ((unitCost - historical) / historical) * 100;
      if (Math.abs(deviation) < 35) return;
      rows.push({
        work,
        disciplineId: id,
        discipline: disciplineById(id).nome,
        unitCost,
        historical,
        deviation,
        value: line.valorOrcado,
      });
    });
  });
  return rows.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation)).slice(0, 12);
}

function renderBenchmarkInsights(rows) {
  const above = rows.filter((row) => row.deviation > 0);
  const critical = rows.filter((row) => Math.abs(row.deviation) > 150);
  const maxRow = rows[0];
  const totalExposure = above.reduce((sum, row) => sum + Math.max(row.value - row.historical * row.work.areaEquivalente, 0), 0);
  return `
    <div class="retro-insight-grid">
      ${miniMetric("Itens acima da base", String(above.length))}
      ${miniMetric("Exposição estimada", money(totalExposure))}
      ${miniMetric("Críticos >150%", String(critical.length))}
      ${miniMetric("Maior desvio", maxRow ? `${number(maxRow.deviation, 1)}%` : "—")}
    </div>
  `;
}

function renderBenchmarkTable(rows) {
  if (!rows.length) return `<div class="empty-state">Sem desvio relevante acima de 35% contra a base histórica.</div>`;
  return `
    ${renderBenchmarkInsights(rows)}
    <div class="table-wrap">
      <table class="data-table benchmark-table">
        <thead>
          <tr>
            <th>Obra</th>
            <th>Disciplina</th>
            <th class="numeric">Custo/m²</th>
            <th class="numeric">Base histórica</th>
            <th class="numeric">Desvio</th>
            <th>Sinalização</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td><strong>${row.work.nome}</strong><br /><span class="muted">${row.work.cidade}/${row.work.uf}</span></td>
                  <td><strong>${row.discipline}</strong><br /><span class="muted">${row.deviation > 0 ? "Solicitar validação do item no EV" : "Possível oportunidade ou suborçamento"}</span></td>
                  <td class="numeric">${money(row.unitCost)}/m²</td>
                  <td class="numeric">${money(row.historical)}/m²</td>
                  <td class="numeric">${number(row.deviation, 1)}%</td>
                  <td><span class="status-pill" data-status="${Math.abs(row.deviation) > 75 ? "Saldo crítico" : "Pendente"}">${row.deviation > 0 ? "Acima da base" : "Abaixo da base"}</span></td>
                  <td><button class="secondary-action compact-action" type="button" data-action="open-benchmark-detail" data-work-id="${row.work.id}" data-discipline-id="${row.disciplineId}">Analisar EV</button></td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function openBenchmarkDetailModal(workId, disciplineId) {
  const row = disciplineBenchmarkRows().find((item) => item.work.id === workId && item.disciplineId === disciplineId);
  const work = workById(workId);
  if (!row || !work) return;
  const recommended = row.deviation > 0
    ? "Validar quantitativos, premissas e cotações antes de liberar a versão final do EV."
    : "Conferir se a disciplina está completa para evitar suborçamento e futura SIC.";
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card" aria-labelledby="benchmarkTitle">
        <header>
          <div>
            <span class="eyebrow">Retroanálise por disciplina</span>
            <h2 id="benchmarkTitle">${row.discipline}</h2>
            <p class="muted">${work.nome} | ${work.cidade}/${work.uf}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${splitItem("Custo do EV", `${money(row.unitCost)}/m²`)}
            ${splitItem("Base histórica", `${money(row.historical)}/m²`)}
            ${splitItem("Desvio", `${number(row.deviation, 1)}%`)}
            ${splitItem("Valor da linha", money(row.value))}
          </div>
          <section class="panel soft-panel">
            <h3>Inteligência da Sala Técnica</h3>
            <p>${recommended}</p>
          </section>
          ${renderEVLinesTable(work)}
        </div>
        <footer class="modal-actions">
          <button class="primary-action" type="button" data-action="open-work-ev" data-id="${work.id}">Abrir EV da obra</button>
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
        </footer>
      </section>
    </div>
  `;
}

function renderWorksManagement() {
  const scopedDemands = managementFilteredDemands();
  const completed = scopedDemands.filter((demand) => demand.coluna === "concluido");
  const active = scopedDemands.filter((demand) => !["concluido", "cancelado"].includes(demand.coluna));
  const canceled = scopedDemands.filter((demand) => demand.coluna === "cancelado");
  const completedWithDates = completed.filter((demand) => demand.dataPrevistaEntrega && demand.dataEntregaReal);
  const punctual = completedWithDates.filter((demand) => demandDeliveryDelay(demand) <= 0).length;
  const delayedCompleted = completedWithDates.filter((demand) => demandDeliveryDelay(demand) > 0);
  const noDateCompleted = completed.length - completedWithDates.length;
  const averageDelay =
    delayedCompleted.reduce((sum, demand) => sum + demandDeliveryDelay(demand), 0) /
    Math.max(delayedCompleted.length, 1);
  const producedValue = completed.reduce((sum, demand) => sum + demandProducedValue(demand), 0);
  const punctualPercent = (punctual / Math.max(completedWithDates.length, 1)) * 100;
  const benchmarkRows = disciplineBenchmarkRows();

  return `
    ${renderWorksToolbar("worksManagement", "Visão Gerencial", "Produção, capacidade, eficiência de prazo e valor entregue pela equipe", `
      <button class="secondary-action" type="button" data-view="worksOperational">Operacional</button>
      <button class="primary-action" type="button" data-action="open-demand">Nova demanda</button>
    `)}

    ${renderManagementStatusTabs()}

    <section class="kpi-grid">
      ${kpi("Demandas concluídas", String(completed.length), "Entregas finalizadas", "green")}
      ${kpi("Entregas no prazo", `${number(punctualPercent)}%`, `${punctual} de ${completedWithDates.length} com datas`, "blue")}
      ${kpi("Valor produzido", money(producedValue), "EV inicial, revisão ou SIC", "orange")}
      ${kpi("Atraso médio", `${number(averageDelay, 1)} d`, "Demandas concluídas com atraso", delayedCompleted.length ? "red" : "green")}
      ${kpi("Em andamento", String(active.length), "Demandas abertas no fluxo", "blue")}
      ${kpi("Analistas", String(uniqueAnalysts().length), "Equipe mobilizada em obras", "green")}
      ${kpi("Revisões/SICs", String(scopedDemands.filter((demand) => demandTypeKey(demand.tipo) !== "EmissaoInicial").length), "Mudanças sobre EV", "orange")}
      ${kpi("Sem data registrada", String(noDateCompleted), "Concluídas sem ciclo completo", noDateCompleted ? "red" : "green")}
    </section>

    <div class="content-grid three">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Produção por analista</h2>
            <p class="panel-subtitle">Demandas concluídas no período</p>
          </div>
        </div>
        ${barList(productionByAnalyst(completed), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Valor produzido por analista</h2>
            <p class="panel-subtitle">EV emitido ou diferença aprovada</p>
          </div>
        </div>
        ${barList(valueByAnalyst(completed), "valor", money)}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Produção por sprint</h2>
            <p class="panel-subtitle">Demandas concluídas em cada sprint</p>
          </div>
        </div>
        ${barList(productionBySprint(completed), "valor", (value) => String(value))}
      </section>
    </div>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Entregas concluídas x prazo</h2>
            <p class="panel-subtitle">Separação entre no prazo, com atraso e sem data registrada</p>
          </div>
        </div>
        ${renderDeliveryDonut(punctual, delayedCompleted.length, noDateCompleted)}
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Demandas por tipo de atividade</h2>
            <p class="panel-subtitle">Distribuição dentro do filtro gerencial</p>
          </div>
        </div>
        ${barList(demandCountByType(scopedDemands), "valor", (value) => String(value))}
      </section>
    </div>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Por classificação da obra</h2>
            <p class="panel-subtitle">Demandas agrupadas pela motivação do investimento</p>
          </div>
        </div>
        ${barList(workCountByForDemands(scopedDemands, "classificacaoObra"), "valor", (value) => String(value))}
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Status do filtro atual</h2>
            <p class="panel-subtitle">Leitura tática da carteira selecionada</p>
          </div>
        </div>
        <div class="split-list">
          ${splitItem("Todas", String(scopedDemands.length))}
          ${splitItem("Em andamento", String(active.length))}
          ${splitItem("Concluídas", String(completed.length))}
          ${splitItem("Canceladas", String(canceled.length))}
        </div>
      </section>
    </div>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Retroanálise de custos por disciplina</h2>
          <p class="panel-subtitle">Sinalização automática de obras que destoam da mediana histórica da carteira</p>
        </div>
        <button class="secondary-action" type="button" data-view="analytics">Ver Disciplina & Tipologia</button>
      </div>
      ${renderBenchmarkTable(benchmarkRows)}
    </section>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Detalhe por analista</h2>
            <p class="panel-subtitle">Concluídas, prazo, valor e carga aberta</p>
          </div>
        </div>
        ${renderAnalystDetailTable()}
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Eficiência e perfil</h2>
            <p class="panel-subtitle">Prazo, tipo de demanda e classificação</p>
          </div>
        </div>
        <div class="split-list">
          ${splitItem("No prazo", `${punctual} (${number(punctualPercent)}%)`)}
          ${splitItem("Com atraso", String(delayedCompleted.length))}
          ${splitItem("Tipo dominante", topLabel(demandCountByType(scopedDemands)))}
          ${splitItem("Classificação dominante", topLabel(workCountByForDemands(scopedDemands, "classificacaoObra")))}
        </div>
        <div class="mini-chart-stack">
          ${barList(demandCountByType(scopedDemands), "valor", (value) => String(value))}
          ${barList(workCountByForDemands(scopedDemands, "classificacaoObra"), "valor", (value) => String(value))}
        </div>
      </section>
    </div>
  `;
}

function managementFilteredDemands() {
  if (managementStatusFilter === "completed") return state.demands.filter((demand) => demand.coluna === "concluido");
  if (managementStatusFilter === "todo") return state.demands.filter((demand) => demand.coluna === "fazer");
  if (managementStatusFilter === "progress") return state.demands.filter((demand) => !["concluido", "cancelado"].includes(demand.coluna));
  if (managementStatusFilter === "canceled") return state.demands.filter((demand) => demand.coluna === "cancelado");
  return state.demands;
}

function renderManagementStatusTabs() {
  const tabs = [
    { id: "completed", label: "Concluídas" },
    { id: "todo", label: "A fazer" },
    { id: "progress", label: "Em andamento" },
    { id: "canceled", label: "Canceladas" },
    { id: "all", label: "Todas" },
  ];
  return `
    <section class="management-tabs">
      ${tabs
        .map(
          (tab) => `
            <button class="${managementStatusFilter === tab.id ? "is-active" : ""}" type="button" data-action="set-management-filter" data-filter="${tab.id}">
              ${tab.label}
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
        <small>concluídas</small>
      </div>
      <div class="donut-legend">
        ${legendItem("No prazo", `${onTime} (${number((onTime / total) * 100)}%)`, "green")}
        ${legendItem("Com atraso", `${delayed} (${number((delayed / total) * 100)}%)`, "red")}
        ${legendItem("Sem data registrada", `${noDate} (${number((noDate / total) * 100)}%)`, "gray")}
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

function historicalWorkYear(record) {
  return String(record.mes || record.terminoReal || record.terminoPlanejado || "").slice(0, 4);
}

function historicalWorksFiltered() {
  const terms = normalizeSearchText(strategicHistoricalQuery).split(/\s+/).filter(Boolean);
  return historicalWorksRecords().filter((record) => {
    if (strategicHistoricalFilters.year && historicalWorkYear(record) !== strategicHistoricalFilters.year) return false;
    if (strategicHistoricalFilters.region && record.regiao !== strategicHistoricalFilters.region) return false;
    if (strategicHistoricalFilters.status && record.status !== strategicHistoricalFilters.status) return false;
    if (!terms.length) return true;
    const searchable = normalizeSearchText([
      record.codigoObra, record.nomeObra, record.nomeObraOriginal, record.cidade, record.uf,
      record.regiao, record.empresa, record.status, record.classificacaoObra,
      record.tipologiaObra, record.tipoObra, record.observacoes,
    ].join(" "));
    return terms.every((term) => searchable.includes(term));
  });
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

function historicalFilterOptions(values, selected, placeholder) {
  const options = [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
  return `<option value="">${placeholder}</option>${options.map((value) => `<option value="${escapeAttribute(value)}" ${value === selected ? "selected" : ""}>${escapeAttribute(value)}</option>`).join("")}`;
}

function executiveKpi(label, value, exact, hint, tone, detailKey, tag = "KPI") {
  return `
    <article class="executive-kpi-card is-clickable" data-tone="${tone}" data-action="open-kpi-detail" data-kpi="${detailKey}" role="button" tabindex="0">
      <header><span>${escapeAttribute(tag)}</span><small>${escapeAttribute(label)}</small></header>
      <strong>${value}</strong>
      ${exact ? `<b>${exact}</b>` : ""}
      <p>${hint}</p>
      <em>Ver análise →</em>
    </article>
  `;
}

function historicalSummaryCard(label, value, exact = "", tone = "blue") {
  return `
    <article class="historical-summary-card" data-tone="${tone}">
      <small>${label}</small>
      <strong>${value}</strong>
      ${exact ? `<span>${exact}</span>` : ""}
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
    "adequacao regulatoria": "Adequação Regulatória",
    "suficiencia de rede": "Suficiência de Rede",
    "eficiencia operacional": "Eficiência Operacional",
    "obra estrategica": "Obra Estratégica",
    "verticalizacao": "Verticalização",
    "venda de servico": "Venda de Serviço",
    "obra emergencial": "Obra Emergencial",
    "padronizacao de unidade": "Padronização de Unidade",
    "fachada": "Fachada",
  };
  return labels[key] || (value && value !== "-" ? value : "Não informada");
}

function historicalClassificationRows() {
  const grouped = new Map();
  historicalWorksRecords().forEach((record) => {
    const label = historicalClassificationLabel(record.classificacaoObra);
    grouped.set(label, (grouped.get(label) || 0) + 1);
  });
  return [...grouped.entries()].map(([label, valor]) => ({ label, valor })).sort((a, b) => b.valor - a.valor);
}

function historicalNegotiatedByRegion() {
  const grouped = new Map();
  historicalWorksRecords().forEach((record) => {
    const label = record.regiao || "Não informada";
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

function renderHistoricalInvestmentRanking() {
  const rows = historicalInvestmentRankingRows();
  const total = rows.reduce((sum, row) => sum + row.valor, 0);
  const max = Math.max(...rows.map((row) => row.valor), 1);
  return `
    <div class="ranking-list">
      ${rows.slice(0, 12).map((row, index) => {
        const record = row.record;
        const target = strategicCostTargetForCommissionRecord(record);
        const costM2 = Number(record.precoM2) || 0;
        const above = Boolean(target && costM2 > target.targetMax);
        const below = Boolean(target?.targetMin && costM2 < target.targetMin);
        const status = !target || !costM2 ? "Sem meta" : above ? "Acima da meta" : below ? "Abaixo da faixa" : "Dentro da meta";
        const width = Math.max((row.valor / max) * 100, 2);
        return `
          <article class="ranking-item strategic-ranking-item ${above ? "is-above-target" : ""}">
            <span>${index + 1}</span>
            <div class="strategic-ranking-main">
              <strong>${escapeAttribute(record.nomeObra)}</strong>
              <small>${escapeAttribute(record.regiao || "—")} | ${escapeAttribute(record.tipoObra || record.tipologiaObra || "—")} | ${escapeAttribute(record.cidade || "—")}/${escapeAttribute(record.uf || "—")}</small>
              <div class="strategic-ranking-meta">
                <span><small>Custo/m²</small><b>${costM2 ? `${money(costM2)}/m²` : "—"}</b></span>
                <span><small>Meta SLT</small><b>${target?.targetLabel || "Sem meta aplicável"}</b></span>
              </div>
              <i class="ranking-track"><em style="width:${width}%"></em></i>
            </div>
            <div class="ranking-value">
              <b>${moneyCompact(row.valor)}</b>
              <small>${money(row.valor)} · ${number((row.valor / Math.max(total, 1)) * 100, 1)}% do negociado</small>
              <span class="status-pill" data-status="${strategicCostTargetStatusTone(status)}">${status}</span>
              <button class="ghost-button compact-action" type="button" data-action="search-historical-work" data-code="${escapeAttribute(record.codigoObra || record.nomeObra)}">Localizar na base</button>
            </div>
          </article>`;
      }).join("")}
    </div>
  `;
}

function renderHistoricalRegionalChart() {
  const rows = historicalNegotiatedByRegion();
  const total = rows.reduce((sum, row) => sum + row.valor, 0);
  const max = Math.max(...rows.map((row) => row.valor), 1);
  const colors = ["#0067b9", "#f59a12", "#009b68", "#16829a", "#bd7d17"];
  return `
    <div class="executive-region-chart">
      <div class="region-chart-summary">
        <span>Negociado total</span>
        <strong>${moneyCompact(total)}</strong>
        <small>${money(total)} · ${rows.length} regiões</small>
      </div>
      <div class="region-chart-list">
        ${rows.map((row, index) => {
          const share = (row.valor / Math.max(total, 1)) * 100;
          const width = Math.max((row.valor / max) * 100, 2);
          return `
            <button type="button" class="region-chart-row" data-action="open-kpi-detail" data-kpi="strategicRegions" style="--chart-color:${colors[index % colors.length]};--chart-width:${width}%">
              <span class="region-chart-rank">${index + 1}</span>
              <span class="region-chart-content">
                <span><strong>${row.label}</strong><em>${number(share, 1)}%</em></span>
                <i><b></b></i>
              </span>
              <span class="region-chart-value"><strong>${moneyCompact(row.valor)}</strong><small>${money(row.valor)}</small></span>
            </button>`;
        }).join("")}
      </div>
    </div>
  `;
}

function renderHistoricalTargetChart(rows) {
  return `
    <div class="executive-target-grid">
      ${rows.map((row) => {
        const tone = row.status === "Dentro da meta" ? "green" : row.status === "Acima da meta" ? "red" : row.status === "Abaixo da faixa" ? "orange" : "blue";
        const adherence = Math.max(0, Math.min(row.adherence, 100));
        return `
          <button class="executive-target-card" type="button" data-tone="${tone}" data-action="open-kpi-detail" data-kpi="strategicCostTarget:${row.id}" style="--adherence:${adherence * 3.6}deg">
            <span class="target-ring"><b>${number(row.adherence)}%</b><small>aderência</small></span>
            <span class="target-card-content">
              <strong>${row.label}</strong>
              <small>${row.targetLabel}</small>
              <span><b>${row.costM2 ? `${money(row.costM2)}/m²` : "—"}</b><em>${row.measuredCount} obras</em></span>
              <i>${moneyCompact(row.capex)} negociados · ${metricCompact(row.area, " m²")}</i>
              <mark>${row.status}</mark>
            </span>
          </button>`;
      }).join("")}
    </div>
  `;
}

function renderHistoricalClassificationChart() {
  const rows = historicalClassificationRows();
  const total = rows.reduce((sum, row) => sum + row.valor, 0);
  const colors = ["#0067b9", "#f59a12", "#009b68", "#16829a", "#bd7d17", "#5b7cfa", "#ef7d00", "#16a36a", "#3b82a0", "#d2a02a", "#7a66c7"];
  return `
    <div class="classification-chart-summary"><strong>${total}</strong><span>obras classificadas</span></div>
    <div class="classification-treemap">
      ${rows.map((row, index) => {
        const share = (row.valor / Math.max(total, 1)) * 100;
        const weight = row.valor >= 100 ? "large" : row.valor >= 30 ? "medium" : "small";
        return `
          <article class="classification-tile" data-size="${weight}" style="--tile-color:${colors[index % colors.length]};--tile-share:${Math.max(share, 3)}%">
            <span><i></i>${row.label}</span>
            <strong>${row.valor}</strong>
            <small>${number(share, 1)}% da base</small>
            <em><b></b></em>
          </article>`;
      }).join("")}
    </div>
  `;
}

function renderHistoricalWorksAssistant() {
  const allRecords = historicalWorksRecords();
  const records = historicalWorksFiltered();
  const summary = historicalWorksSummary(records);
  const visibleRows = records.slice(0, 60);
  const source = globalThis.GENERAL_WORKS_DATA?.source || "Base histórica de obras";
  const hasFilters = strategicHistoricalQuery || Object.values(strategicHistoricalFilters).some(Boolean);
  return `
    <section class="panel historical-works-assistant">
      <div class="panel-header historical-works-header">
        <div>
          <span class="historical-assistant-eyebrow">Assistente de busca</span>
          <h2>Consulta histórica de obras</h2>
          <p class="panel-subtitle">Pesquise por código, nome da obra, cidade, UF, região, classificação ou tipologia.</p>
        </div>
        <span class="historical-source-badge">${allRecords.length} obras · ${escapeAttribute(source)}</span>
      </div>
      <div class="historical-search-bar">
        <label class="historical-search-field"><span>Buscar obra</span><input type="search" data-strategic-history-search value="${escapeAttribute(strategicHistoricalQuery)}" placeholder="Ex.: 2182, Jardim América, hospital, retrofit..." autocomplete="off" /></label>
        <label><span>Ano</span><select data-strategic-history-filter="year">${historicalFilterOptions(allRecords.map(historicalWorkYear), strategicHistoricalFilters.year, "Todos os anos")}</select></label>
        <label><span>Região</span><select data-strategic-history-filter="region">${historicalFilterOptions(allRecords.map((row) => row.regiao), strategicHistoricalFilters.region, "Todas as regiões")}</select></label>
        <label><span>Status</span><select data-strategic-history-filter="status">${historicalFilterOptions(allRecords.map((row) => row.status), strategicHistoricalFilters.status, "Todos os status")}</select></label>
        ${hasFilters ? `<button class="secondary-action" type="button" data-action="clear-strategic-history">Limpar</button>` : ""}
      </div>
      <div class="historical-summary-grid">
        ${historicalSummaryCard("Obras encontradas", number(summary.count), `${number((summary.count / Math.max(allRecords.length, 1)) * 100, 1)}% da base`, "blue")}
        ${historicalSummaryCard("Sala Técnica", moneyCompact(summary.salaTecnica), money(summary.salaTecnica), "blue")}
        ${historicalSummaryCard("Valor negociado", moneyCompact(summary.negociado), money(summary.negociado), "green")}
        ${historicalSummaryCard("Área construída", metricCompact(summary.area, " m²"), `${number(summary.area, 2)} m²`, "blue")}
        ${historicalSummaryCard("Construção por m²", summary.precoM2 ? `${money(summary.precoM2)}/m²` : "Sem leitura", "Média ponderada", "orange")}
        ${historicalSummaryCard("Saving na negociação", moneyCompact(summary.saving), money(summary.saving), summary.saving >= 0 ? "green" : "red")}
      </div>
      <p class="historical-result-count">Mostrando ${visibleRows.length} de ${records.length} resultado(s)${records.length > visibleRows.length ? " — refine a busca para localizar uma obra específica" : ""}.</p>
      <div class="table-wrap historical-results-wrap">
        <table class="data-table historical-results-table">
          <thead><tr><th>Obra</th><th>Local / Região</th><th>Status</th><th>Sala Técnica</th><th>Negociado</th><th>Área construída</th><th>Valor por m²</th><th>Diferença</th></tr></thead>
          <tbody>
            ${visibleRows.length ? visibleRows.map((record) => `
              <tr>
                <td><strong>${escapeAttribute(record.codigoObra ? `${record.codigoObra} · ${record.nomeObra}` : record.nomeObra)}</strong><small>${escapeAttribute([record.classificacaoObra, record.tipoObra].filter(Boolean).join(" · ") || "Sem classificação")}</small></td>
                <td>${escapeAttribute([record.cidade, record.uf].filter(Boolean).join("/") || "—")}<small>${escapeAttribute(record.regiao || "—")}</small></td>
                <td><span class="status-pill" data-status="${escapeAttribute(record.status || "Não informado")}">${escapeAttribute(record.status || "Não informado")}</span></td>
                <td>${record.valorSalaTecnica == null ? "—" : executiveMoney(record.valorSalaTecnica)}</td>
                <td>${record.valorNegociado == null ? "—" : executiveMoney(record.valorNegociado)}</td>
                <td>${record.areaM2 == null ? "—" : `${number(record.areaM2, 2)} m²`}</td>
                <td>${record.precoM2 == null ? "—" : `${money(record.precoM2)}/m²`}</td>
                <td class="${Number(record.gapSalaTecnicaVsNegociado) <= 0 ? "historical-saving" : "historical-overrun"}">${record.gapSalaTecnicaVsNegociado == null ? "—" : executiveMoney(record.gapSalaTecnicaVsNegociado)}</td>
              </tr>`).join("") : `<tr><td colspan="8"><div class="empty-state"><strong>Nenhuma obra encontrada</strong><span>Tente outro nome, código ou remova um dos filtros.</span></div></td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderWorksStrategic() {
  const sourceRecords = evUnifiedRecords();
  const validAreaRecords = sourceRecords.filter((record) => Number(record.total) > 0 && Number(record.area) > 0);
  const totalValue = sourceRecords.reduce((sum, record) => sum + Number(record.total || 0), 0);
  const validValue = validAreaRecords.reduce((sum, record) => sum + Number(record.total || 0), 0);
  const totalArea = validAreaRecords.reduce((sum, record) => sum + Number(record.area || 0), 0);
  const historicalCount = sourceRecords.filter((record) => record.sourceKind === "historical").length;
  const currentCount = sourceRecords.filter((record) => record.sourceKind === "current").length;
  const years = new Set(sourceRecords.map((record) => String(record.year)).filter(Boolean)).size;
  const typologies = new Set(sourceRecords.map((record) => record.typology).filter(Boolean)).size;
  const investmentRows = sourceRecords.map((record) => ({ record, valor: Number(record.total) || 0 })).filter((row) => row.valor > 0).sort((a, b) => b.valor - a.valor);
  const topInvestment = investmentRows[0];
  const topFiveValue = investmentRows.slice(0, 5).reduce((sum, row) => sum + row.valor, 0);
  const topFiveShare = totalValue ? (topFiveValue / totalValue) * 100 : 0;
  const byYear = [...sourceRecords.reduce((map, record) => map.set(String(record.year || "Não informado"), (map.get(String(record.year || "Não informado")) || 0) + Number(record.total || 0)), new Map())]
    .map(([label, valor]) => ({ label, valor })).sort((a, b) => String(a.label).localeCompare(String(b.label), "pt-BR"));
  const byTypology = [...sourceRecords.reduce((map, record) => map.set(record.typology || "Não informada", (map.get(record.typology || "Não informada") || 0) + Number(record.total || 0)), new Map())]
    .map(([label, valor]) => ({ label, valor })).sort((a, b) => b.valor - a.valor);
  const byDiscipline = disciplines.map((discipline) => ({
    label: discipline.nome,
    valor: sourceRecords.reduce((sum, record) => sum + Number(record.disciplines?.[discipline.id] || 0), 0),
  })).filter((row) => row.valor > 0).sort((a, b) => b.valor - a.valor);

  return `
    ${renderWorksToolbar("worksStrategic", "Visão Estratégica", `Base unificada de ${sourceRecords.length} EVs · mesma inteligência da aba EV`, `
      <button class="secondary-action" type="button" data-view="portfolio">Portfólio</button>
      <button class="primary-action" type="button" data-view="budget">Controle de Verbas</button>
    `)}

    <section class="strategic-hero panel">
      <article class="strategic-main-kpi" data-tone="green" style="--hero-progress:360deg">
        <header><span class="eyebrow">Indicador principal</span><em>Fonte única · Base de EVs</em></header>
        <div class="strategic-main-kpi__body">
          <span class="strategic-main-ring"><b>${number(sourceRecords.length)}</b><small>EVs</small></span>
          <span class="strategic-main-copy">
            <strong>Base estratégica totalmente unificada</strong>
            <small>Todos os indicadores abaixo são recalculados diretamente com os mesmos registros da aba EV.</small>
            <span class="strategic-main-breakdown">
              <span data-tone="green"><i></i><b>${historicalCount}</b><small>Históricos</small></span>
              <span data-tone="blue"><i></i><b>${currentCount}</b><small>Atuais</small></span>
              <span data-tone="orange"><i></i><b>${validAreaRecords.length}</b><small>Com área válida</small></span>
            </span>
          </span>
        </div>
        <span class="strategic-main-footer"><i>Base unificada · EV histórico + cadastro atual</i><b>Atualização automática</b></span>
      </article>
      <div class="strategic-hero-metrics">
        ${strategicHeroMetric("Valor total dos EVs", moneyCompact(totalValue), money(totalValue), "EV", "blue", 100)}
        ${strategicHeroMetric("Maior EV", topInvestment ? topInvestment.record.project : "Sem carteira", topInvestment ? `${moneyCompact(topInvestment.valor)} · ${number((topInvestment.valor / Math.max(totalValue, 1)) * 100, 1)}% da base` : "", "TOP 1", "orange", topInvestment ? (topInvestment.valor / Math.max(totalValue, 1)) * 100 : 0)}
        ${strategicHeroMetric("Área equivalente", metricCompact(totalArea, " m²"), `${number(totalArea, 2)} m² · ${validAreaRecords.length} EVs válidos`, "ÁREA", "green", 100)}
        ${strategicHeroMetric("Concentração Top 5", `${number(topFiveShare, 1)}%`, `${moneyCompact(topFiveValue)} · ${money(topFiveValue)}`, "TOP 5", "purple", topFiveShare)}
      </div>
    </section>

    <div class="strategic-section-heading">
      <div><span>Painel executivo</span><h2>Indicadores estratégicos</h2></div>
      <p>Valores abreviados para leitura rápida, com o montante exato logo abaixo.</p>
    </div>
    <section class="strategic-kpis">
      ${executiveKpi("EVs unificados", number(sourceRecords.length), `${historicalCount} históricos + ${currentCount} atuais`, "Quantidade da mesma base exibida na aba EV", "blue", "strategicUnifiedEV", "EV")}
      ${executiveKpi("Valor total dos EVs", moneyCompact(totalValue), money(totalValue), "Soma dos valores dos EVs unificados", "green", "strategicUnifiedEV", "VALOR")}
      ${executiveKpi("Área equivalente válida", metricCompact(totalArea, " m²"), `${number(totalArea, 2)} m²`, `${validAreaRecords.length} EVs com valor e área`, "blue", "strategicUnifiedEV", "ÁREA")}
      ${executiveKpi("Registros históricos", number(historicalCount), `${number((historicalCount / Math.max(sourceRecords.length, 1)) * 100, 1)}% da base`, "EVs históricos disponíveis para inteligência", "green", "strategicUnifiedEV", "HIST")}
      ${executiveKpi("Sem leitura de m²", number(sourceRecords.length - validAreaRecords.length), `${validAreaRecords.length} leituras válidas`, "EVs sem valor ou área equivalente", sourceRecords.length > validAreaRecords.length ? "orange" : "green", "strategicUnifiedEV", "QUALIDADE")}
      ${executiveKpi("Tipologias", number(typologies), "Classificações disponíveis na base EV", "Agrupamento unificado por tipologia", "green", "strategicUnifiedEV", "TIPO")}
      ${executiveKpi("Anos disponíveis", number(years), "Histórico de 2020 a 2026 + atuais", "Períodos disponíveis para inteligência", "blue", "strategicUnifiedEV", "ANO")}
      ${executiveKpi("Concentração Top 5", `${number(topFiveShare, 1)}%`, `${moneyCompact(topFiveValue)} · ${money(topFiveValue)}`, "Participação dos cinco maiores EVs", topFiveShare > 80 ? "orange" : "blue", "strategicUnifiedTop5", "TOP 5")}
    </section>

    ${renderEVHistoricalIntelligence()}

    <div class="content-grid three strategic-chart-grid">
      <section class="panel strategic-visual-panel region-visual-panel">
        <div class="panel-header">
          <div>
            <h2>Valor dos EVs por ano</h2>
            <p class="panel-subtitle">Evolução histórica da mesma base unificada</p>
          </div>
        </div>
        ${barList(byYear, "valor", moneyCompact)}
      </section>
      <section class="panel strategic-visual-panel target-visual-panel">
        <div class="panel-header">
          <div>
            <h2>Valor por tipologia</h2>
            <p class="panel-subtitle">Distribuição financeira dos EVs por tipo de empreendimento</p>
          </div>
        </div>
        ${barList(byTypology.slice(0, 10), "valor", moneyCompact)}
      </section>
      <section class="panel strategic-visual-panel classification-visual-panel">
        <div class="panel-header">
          <div>
            <h2>Disciplinas com maior valor</h2>
            <p class="panel-subtitle">Composição consolidada de todas as filhas dos EVs</p>
          </div>
        </div>
        ${barList(byDiscipline.slice(0, 10), "valor", moneyCompact)}
      </section>
    </div>

    <section class="panel strategic-investment-panel">
      <div class="panel-header">
        <div>
          <h2>Maiores EVs da base unificada</h2>
          <p class="panel-subtitle">Ranking calculado diretamente com histórico e cadastros atuais</p>
        </div>
        <span class="historical-source-badge">${sourceRecords.length} EVs analisados</span>
      </div>
      <div class="ranking-list">
        ${investmentRows.slice(0, 12).map((row, index) => {
          const costM2 = Number(row.record.area) > 0 ? row.valor / Number(row.record.area) : 0;
          const openAction = row.record.sourceKind === "historical" ? "open-historical-ev" : "open-ev-modal";
          const openId = row.record.sourceKind === "historical" ? row.record.id : row.record.workId;
          return `<article class="ranking-item strategic-ranking-item"><span>${index + 1}</span><div class="strategic-ranking-main"><strong>${escapeAttribute(row.record.project)}</strong><small>${escapeAttribute(String(row.record.year))} · ${escapeAttribute(row.record.typology)} · ${escapeAttribute(row.record.code || "Sem código")}</small><div class="strategic-ranking-meta"><span><small>Custo/m²</small><b>${costM2 ? `${money(costM2)}/m²` : "—"}</b></span><span><small>Área</small><b>${row.record.area ? `${number(row.record.area, 0)} m²` : "—"}</b></span></div><i class="ranking-track"><em style="width:${Math.max((row.valor / Math.max(topInvestment?.valor || 1, 1)) * 100, 2)}%"></em></i></div><div class="ranking-value"><b>${moneyCompact(row.valor)}</b><small>${money(row.valor)} · ${number((row.valor / Math.max(totalValue, 1)) * 100, 1)}% da base</small><button class="ghost-button compact-action" type="button" data-action="${openAction}" data-id="${escapeAttribute(openId)}">Ver EV</button></div></article>`;
        }).join("")}
      </div>
    </section>
  `;
}

function demandDeliveryDelay(demand) {
  if (!demand.dataPrevistaEntrega || !demand.dataEntregaReal) return 0;
  return Math.max(daysBetween(demand.dataPrevistaEntrega, demand.dataEntregaReal), 0);
}

function demandProducedValue(demand) {
  const work = workById(demand.obraId);
  if (!work) return 0;
  if (demandTypeKey(demand.tipo) === "SIC") {
    return (demand.sicIds || [])
      .map((id) => state.sics.find((sic) => sic.id === id))
      .filter(Boolean)
      .reduce((sum, sic) => sum + Math.abs(sicTotal(sic)), 0);
  }
  if (demandTypeKey(demand.tipo) === "ReemissaoCompleta" && demand.valorAlteracaoEV != null) {
    return Math.abs(Number(demand.valorAlteracaoEV) || 0);
  }
  const version = work.ev.versions.find((item) => item.origem === demand.id);
  if (version?.diffPorDisciplina?.length) {
    return version.diffPorDisciplina.reduce((sum, diff) => sum + Math.abs(diff.valorDepois - diff.valorAntes), 0);
  }
  return version?.valorTotal || workTotals(work).orcado;
}

function productionByAnalyst(demands = completedDemands()) {
  const map = new Map();
  demands.forEach((demand) => {
    const analyst = demand.analistaResponsavel || "Não informado";
    map.set(analyst, (map.get(analyst) || 0) + 1);
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function valueByAnalyst(demands = completedDemands()) {
  const map = new Map();
  demands.forEach((demand) => {
    const analyst = demand.analistaResponsavel || "Não informado";
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

function renderAnalystDetailTable() {
  const analysts = uniqueAnalysts();
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Analista</th>
            <th class="numeric">Concluídas</th>
            <th class="numeric">No prazo</th>
            <th class="numeric">Com atraso</th>
            <th class="numeric">% no prazo</th>
            <th class="numeric">Atraso médio</th>
            <th class="numeric">Valor produzido</th>
            <th class="numeric">Em andamento</th>
          </tr>
        </thead>
        <tbody>
          ${analysts
            .map((analyst) => {
              const concluded = completedDemands().filter((demand) => demand.analistaResponsavel === analyst);
              const open = pendingDemands().filter((demand) => demand.analistaResponsavel === analyst);
              const onTime = concluded.filter((demand) => demandDeliveryDelay(demand) <= 0).length;
              const late = concluded.filter((demand) => demandDeliveryDelay(demand) > 0);
              const delay = late.reduce((sum, demand) => sum + demandDeliveryDelay(demand), 0) / Math.max(late.length, 1);
              const value = concluded.reduce((sum, demand) => sum + demandProducedValue(demand), 0);
              return `
                <tr>
                  <td><strong>${analyst}</strong></td>
                  <td class="numeric">${concluded.length}</td>
                  <td class="numeric">${onTime}</td>
                  <td class="numeric">${late.length}</td>
                  <td class="numeric">${concluded.length ? `${number((onTime / concluded.length) * 100)}%` : "—"}</td>
                  <td class="numeric">${late.length ? `${number(delay, 1)} d` : "—"}</td>
                  <td class="numeric">${money(value)}</td>
                  <td class="numeric">${open.length}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function isStrategicWork(work) {
  const text = `${work.classificacaoObra} ${work.tipologiaObra} ${work.nome}`.toLowerCase();
  return text.includes("estratég") || text.includes("expans") || text.includes("vertical");
}

function isNewUnit(work) {
  const text = `${work.classificacaoObra} ${work.tipologiaObra} ${work.nome}`.toLowerCase();
  return text.includes("nova") || text.includes("novo");
}

function investmentRankingRows() {
  return state.works
    .map((work) => {
      const values = workTotals(work);
      return { work, valor: values.orcado + values.aditivado };
    })
    .sort((a, b) => b.valor - a.valor);
}

function renderInvestmentRanking() {
  const rows = investmentRankingRows();
  const capex = rows.reduce((sum, row) => sum + row.valor, 0);
  const max = Math.max(...rows.map((row) => row.valor), 1);
  return `
    <div class="ranking-list">
      ${rows
        .slice(0, 12)
        .map(
          (row, index) => {
            const reading = strategicCostReadingForWork(row.work);
            const statusTone = strategicCostTargetStatusTone(reading.status);
            const rankingWidth = Math.max((row.valor / max) * 100, 2);
            const costM2Text = reading.costM2 ? `${money(reading.costM2)}/m²` : "—";
            return `
              <article class="ranking-item strategic-ranking-item ${reading.aboveTarget ? "is-above-target" : ""}">
                <span>${index + 1}</span>
                <div class="strategic-ranking-main">
                  <strong>${row.work.nome}</strong>
                  <small>${row.work.regiao} | ${row.work.tipoUnidade} | ${row.work.cidade}/${row.work.uf}</small>
                  <div class="strategic-ranking-meta">
                    <span>
                      <small>Custo/m²</small>
                      <b>${costM2Text}</b>
                    </span>
                    <span>
                      <small>Meta SLT</small>
                      <b>${reading.target?.targetLabel || "Sem meta"}</b>
                    </span>
                  </div>
                  <i class="ranking-track">
                    <em style="width:${rankingWidth}%"></em>
                  </i>
                </div>
                <div class="ranking-value">
                  <b>${money(row.valor)}</b>
                  <small>${capex ? number((row.valor / capex) * 100, 1) : 0}% do CAPEX</small>
                  <span class="status-pill" data-status="${statusTone}">${reading.status}</span>
                  <button class="ghost-button compact-action" type="button" data-action="open-investment-detail" data-id="${row.work.id}">Ver composição</button>
                </div>
              </article>
            `;
          }
        )
        .join("")}
    </div>
  `;
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
      discipline: { id: "capex-aprovado", nome: "CAPEX aprovado sem decomposição no EV" },
      status: "Estimado",
      value: plannedWorkValue(work),
      percent: 100,
      unit: work.areaEquivalente ? plannedWorkValue(work) / work.areaEquivalente : 0,
    });
  }
  const foundation = rows.find((row) => row.discipline.id === "fundacoes-e-contencoes");
  const targetReading = strategicCostReadingForWork(work);
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card" aria-labelledby="investmentTitle">
        <header>
          <div>
            <span class="eyebrow">Composição do investimento</span>
            <h2 id="investmentTitle">${work.nome}</h2>
            <p class="muted">${work.regiao} | ${work.tipoUnidade} | ${work.cidade}/${work.uf}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${splitItem("Investimento total", money(total))}
            ${splitItem("Fundação", foundation ? `${number(foundation.percent, 1)}%` : "N/A")}
            ${splitItem("Área equivalente", `${number(work.areaEquivalente)} m²`)}
            ${splitItem("Custo por m²", work.areaEquivalente ? `${money(total / work.areaEquivalente)}/m²` : "—")}
            ${splitItem("Meta SLT", targetReading.target?.targetLabel || "Sem meta por tipologia")}
            ${splitItem("Aderência", targetReading.status)}
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th class="numeric">Valor</th>
                  <th class="numeric">% do EV</th>
                  <th class="numeric">R$/m²</th>
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
                        <td class="numeric">${row.unit ? money(row.unit) : "—"}</td>
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
  `;
}

function renderPortfolio() {
  const allRows = investmentPlanRows(false);
  const rows = investmentPlanRows(true);
  const projectRows = allRows.filter((row) => row.isProject);
  const uniqueWorks = new Set(allRows.map((row) => row.obra)).size;
  const linkedWorks = allRows.filter((row) => row.obraId).length;
  const upcomingProjects = projectRows.filter((row) => row.terminoPlanejado && row.terminoPlanejado >= TODAY_ISO && daysBetween(TODAY_ISO, row.terminoPlanejado) <= 30);
  const overdueProjects = projectRows.filter((row) => planDeliveryStatus(row).label === "Projeto atrasado");

  return `
    ${renderWorksToolbar("portfolio", "Portfólio de Orçamento", "Carteira unificada do Orçamento 360 com Plano de Investimento 2026, cadastro técnico e EV", `
      <span class="tag">${uniqueWorks} obras no plano</span>
      <button class="secondary-action" type="button" data-action="feature-soon">Importar base</button>
      <button class="primary-action" type="button" data-action="open-work">+ Nova obra</button>
    `)}

    <section class="kpi-grid portfolio-kpis">
      ${kpi("Obras no plano", String(uniqueWorks), `${rows.length} linha(s) no filtro atual`, "blue")}
      ${kpi("Etapas de Projetos", String(projectRows.length), "Base para entrada na Sala Técnica", "orange")}
      ${kpi("Projetos próximos", String(upcomingProjects.length), "Término planejado nos próximos 30 dias", "green")}
      ${kpi("Projetos atrasados", String(overdueProjects.length), "Sem término real e data planejada vencida", "red")}
      ${kpi("Vínculos com EV", String(linkedWorks), "Linhas encontradas no cadastro Orçamento 360", "blue")}
    </section>

    <section class="panel portfolio-panel">
      <div class="panel-heading">
        <div>
          <h2>Carteira unificada 2026</h2>
          <p class="panel-subtitle">O nome da obra segue o Plano de Investimento; dados técnicos e EV aparecem quando houver vínculo cadastrado.</p>
        </div>
        <button class="secondary-action" type="button" data-action="clear-investment-plan-filters">Limpar filtros</button>
      </div>
      ${renderInvestmentPlanFilters(allRows)}
      ${renderPortfolioInvestmentPlanTable(rows)}
    </section>
  `;
}

function renderPortfolioInvestmentPlanTable(rows) {
  return `
    <div class="table-wrap portfolio-plan-table-wrap">
      <table class="data-table portfolio-table portfolio-plan-table">
        <thead>
          <tr>
            <th>Nome da obra (Plano)</th>
            <th>Cód. Obra</th>
            <th>Tipo</th>
            <th>Cidade / UF</th>
            <th>Região</th>
            <th>Etapa</th>
            <th class="numeric">SLA</th>
            <th>Término Projeto</th>
            <th>Início Orçamentação</th>
            <th>Classificação</th>
            <th>Tipologia</th>
            <th class="numeric">Área Eq. (m²)</th>
            <th>SAP</th>
            <th>EV</th>
            <th>Ações</th>
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
                const cityUf = `${work?.cidade || row.praca || "—"}/${work?.uf || row.uf || "—"}`;
                const prazo = work?.prazoDias || (work ? plannedDurationForWork(work) : "") || row.slaDias || "—";
                return `
                  <tr>
                    <td>
                      <strong>${escapeAttribute(planName)}</strong>
                      <br /><span class="muted">${escapeAttribute(planReference)}</span>
                    </td>
                    <td>${work ? `<strong>${escapeAttribute(work.codigoOriginal || "0000")}</strong>` : `<span class="status-pill" data-status="Pendente">Sem cadastro</span>`}</td>
                    <td>${escapeAttribute(work?.tipoUnidade || row.tipoUnidade || "—")}</td>
                    <td>${escapeAttribute(cityUf)}</td>
                    <td>${escapeAttribute(work?.regiao || row.regiao || "—")}</td>
                    <td><span class="tag">${escapeAttribute(row.etapa || "—")}</span></td>
                    <td class="numeric">${row.slaDias ?? "—"}</td>
                    <td><strong>${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "—"}</strong><br /><span class="status-pill" data-status="${row.statusInfo.tone}">${row.statusInfo.label}</span></td>
                    <td>${row.inicioOrcamentacao ? `<strong>${dateText(row.inicioOrcamentacao)}</strong><br /><span class="muted">após Projetos</span>` : "—"}</td>
                    <td>${escapeAttribute(work?.classificacaoObra || row.classificacaoObra || "—")}</td>
                    <td>${escapeAttribute(work?.tipologiaObra || row.tipologiaObra || "—")}</td>
                    <td class="numeric">${work?.areaEquivalente ? number(work.areaEquivalente) : "–"}</td>
                    <td>${escapeAttribute(work?.ordemInternaSAP || "—")}</td>
                    <td>${work?.ev ? `<span class="status-pill" data-status="${work.ev.status}">${work.ev.status}</span>` : `<span class="muted">Sem EV</span>`}</td>
                    <td>
                      <div class="table-actions portfolio-actions">
                        ${work ? `<button class="secondary-action compact-action" type="button" data-action="open-ev-modal" data-id="${work.id}">Abrir EV</button>` : ""}
                        ${canBudget ? `<button class="ghost-button compact-action" type="button" data-action="start-budget-from-plan" data-row="${row.row}">Criar orçamento</button>` : ""}
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

function renderPortfolioFilters() {
  return `
    <div class="portfolio-filter-bar">
      <input data-portfolio-search value="${escapeAttribute(portfolioQuickFilters.query)}" placeholder="Buscar por nome, chave, cidade, UF, região, tipo..." />
      <select data-portfolio-quick-filter="tipoUnidade" aria-label="Filtrar por tipo de unidade">
        <option value="">Todas</option>
        ${uniqueWorkValues("tipoUnidade").map((value) => `<option value="${value}" ${portfolioQuickFilters.tipoUnidade === value ? "selected" : ""}>${value}</option>`).join("")}
      </select>
      <select data-portfolio-quick-filter="regional" aria-label="Filtrar por região">
        <option value="">Todas</option>
        ${uniqueWorkValues("regiao").map((value) => `<option value="${value}" ${portfolioQuickFilters.regional === value ? "selected" : ""}>${value}</option>`).join("")}
      </select>
      <select data-portfolio-quick-filter="evStatus" aria-label="Filtrar por status do EV">
        <option value="">Todas</option>
        ${[...new Set(state.works.map((work) => work.ev.status).filter(Boolean))]
          .map((value) => `<option value="${value}" ${portfolioQuickFilters.evStatus === value ? "selected" : ""}>${value}</option>`)
          .join("")}
      </select>
      <button class="secondary-action" type="button" data-action="clear-portfolio-filters">Limpar filtros</button>
    </div>
  `;
}

function portfolioRows(applySearch = false, applyColumnFilters = true) {
  const milestones = ["EV aprovado", "Orçamento executivo", "Contratação", "Início de obra", "Entrega técnica"];
  const works = applySearch ? state.works.filter(workMatchesPortfolioFilters) : state.works;
  const rows = works.map((work, index) => {
    const totals = workTotals(work);
    const capex = totals.orcado + totals.aditivado;
    const saldoRatio = totals.saldo / Math.max(capex, 1);
    return {
      id: work.id,
      idApp: work.chaveUnica,
      codigo: work.codigoOriginal,
      nome: work.nome,
      regional: work.regiao,
      cidadeUf: `${work.cidade}/${work.uf}`,
      tipoUnidade: work.tipoUnidade,
      tipologia: work.tipologiaObra,
      classificacao: work.classificacaoObra,
      prazo: work.prazoDias || plannedDurationForWork(work),
      areaEquivalente: work.areaEquivalente || 0,
      areaConstruida: work.areaConstruida || 0,
      sap: work.ordemInternaSAP || "—",
      cnpj: work.cnpj || "—",
      endereco: work.endereco || "—",
      status: work.status,
      evStatus: work.ev.status,
      capex,
      contratado: totals.contratado,
      saldo: totals.saldo,
      proximoMarco: milestones[index % milestones.length],
      marcoStatus: index === 0 || work.ev.status !== "Completo" ? "Próximo" : "Planejado",
      risco: saldoRatio < 0.18 ? "Alto" : work.ev.status !== "Completo" ? "Médio" : "Baixo",
    };
  });
  return applyColumnFilters ? rows.filter(portfolioRowMatchesFilters) : rows;
}

function workMatchesPortfolioFilters(work) {
  const terms = normalizeSearchText([searchTerm, portfolioQuickFilters.query].filter(Boolean).join(" ")).trim();
  if (terms && !terms.split(/\s+/).every((term) => workSearchText(work).includes(term))) return false;
  if (portfolioQuickFilters.tipoUnidade && work.tipoUnidade !== portfolioQuickFilters.tipoUnidade) return false;
  if (portfolioQuickFilters.regional && work.regiao !== portfolioQuickFilters.regional) return false;
  if (portfolioQuickFilters.evStatus && work.ev.status !== portfolioQuickFilters.evStatus) return false;
  return true;
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
  if (!relatedDemands.length) return "—";
  return Math.max(...relatedDemands.map((demand) => Math.max(daysBetween(demand.dataPrevistaInicio, demand.dataPrevistaEntrega), 1)));
}

function workMatchesSearch(work) {
  const terms = normalizeSearchText(searchTerm).split(/\s+/).filter(Boolean);
  return !terms.length || terms.every((term) => workSearchText(work).includes(term));
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

function filterCell(field, placeholder) {
  return `<input class="table-filter" data-filter-field="${field}" value="${escapeAttribute(portfolioFilters[field] || "")}" placeholder="${escapeAttribute(placeholder)}" />`;
}

function renderPortfolioTable(rows) {
  return `
    <div class="table-wrap">
      <table class="data-table portfolio-table">
        <thead>
          <tr>
            <th>Chave</th>
            <th>Cód. Orig.</th>
            <th>Nome da Obra</th>
            <th>Tipo</th>
            <th>Cidade / UF</th>
            <th>Região</th>
            <th>Prazo</th>
            <th>Classificação</th>
            <th>Tipologia</th>
            <th class="numeric">Área Eq. (m²)</th>
            <th class="numeric">Área Const. (m²)</th>
            <th>SAP</th>
            <th>CNPJ</th>
            <th>Endereço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td><span class="key-badge">${row.idApp}</span></td>
                  <td>${row.codigo}</td>
                  <td><strong>${row.nome}</strong></td>
                  <td>${row.tipoUnidade}</td>
                  <td>${row.cidadeUf}</td>
                  <td>${row.regional}</td>
                  <td>${row.prazo === "—" ? "—" : `${row.prazo} dias`}</td>
                  <td>${row.classificacao}</td>
                  <td>${row.tipologia}</td>
                  <td class="numeric">${row.areaEquivalente ? number(row.areaEquivalente) : "–"}</td>
                  <td class="numeric">${row.areaConstruida ? number(row.areaConstruida) : "–"}</td>
                  <td>${row.sap}</td>
                  <td>${row.cnpj}</td>
                  <td>${row.endereco}</td>
                  <td>
                    <div class="table-actions portfolio-actions">
                      <button class="secondary-action compact-action" type="button" data-action="open-ev-modal" data-id="${row.id}">Abrir EV</button>
                      <button class="ghost-button compact-action" type="button" data-action="edit-work" data-id="${row.id}">Editar</button>
                    </div>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
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
  if (normalizedStatus.includes("nao se aplica")) return { label: "Não se aplica", tone: "Rascunho" };
  if (row.terminoReal) {
    const late = row.terminoPlanejado && row.terminoReal > row.terminoPlanejado;
    return { label: late ? "Entregue com atraso" : "Entregue", tone: late ? "Atrasada" : "Completo" };
  }
  if (row.terminoPlanejado && row.terminoPlanejado < TODAY_ISO) return { label: "Projeto atrasado", tone: "Saldo crítico" };
  if (row.terminoPlanejado && daysBetween(TODAY_ISO, row.terminoPlanejado) <= 30) return { label: "Próximo", tone: "Pendente" };
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
      classificacaoObra: work.classificacaoObra || "Não informada",
      tipologiaObra: work.tipologiaObra || "Não informada",
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

function renderInvestmentPlan() {
  const allRows = investmentPlanRows(false);
  const rows = investmentPlanRows(true);
  const projectRows = allRows.filter((row) => row.isProject);
  const uniqueWorks = new Set(allRows.map((row) => row.obra)).size;
  const linkedWorks = allRows.filter((row) => row.obraId).length;
  const upcomingProjects = projectRows.filter((row) => row.terminoPlanejado && row.terminoPlanejado >= TODAY_ISO && daysBetween(TODAY_ISO, row.terminoPlanejado) <= 30);
  const overdueProjects = projectRows.filter((row) => planDeliveryStatus(row).label === "Projeto atrasado");

  return `
    ${renderWorksToolbar("investmentPlan", "Plano de Investimento", "Consulta das datas de entrega de Projetos para iniciar a orçamentação da Sala Técnica", `
      <span class="tag">${projectRows.length} projetos</span>
      <button class="secondary-action" type="button" data-action="clear-investment-plan-filters">Limpar filtros</button>
    `)}

    <section class="kpi-grid investment-kpis">
      ${kpi("Obras no plano", String(uniqueWorks), "Demandas da aba Plano de Investimento", "blue")}
      ${kpi("Etapas de Projetos", String(projectRows.length), `${rows.length} registro(s) no filtro atual`, "orange")}
      ${kpi("Projetos próximos", String(upcomingProjects.length), "Término planejado nos próximos 30 dias", "green")}
      ${kpi("Projetos atrasados", String(overdueProjects.length), "Sem término real e data planejada vencida", "red")}
      ${kpi("Linhas vinculadas", String(linkedWorks), "Encontradas no Portfólio Orçamento 360", "blue")}
    </section>

    <section class="panel investment-plan-panel">
      ${renderInvestmentPlanFilters(allRows)}
      ${renderInvestmentPlanTable(rows)}
    </section>
  `;
}

function renderInvestmentPlanFilters(allRows) {
  const etapas = [...new Set(allRows.map((row) => row.etapa).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const status = [...new Set(allRows.map((row) => row.status).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const regioes = [...new Set(allRows.map((row) => row.regiao).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return `
    <div class="investment-filter-bar">
      <label class="field investment-search-field">
        <span>Buscar no plano</span>
        <input data-investment-plan-search value="${escapeAttribute(investmentPlanFilters.query)}" placeholder="Buscar por obra, etapa, cidade, UF, status ou observação..." />
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
        <span>Região</span>
        <select data-investment-plan-filter="regiao">
          <option value="">Todas</option>
          ${regioes.map((value) => `<option value="${escapeAttribute(value)}" ${investmentPlanFilters.regiao === value ? "selected" : ""}>${value}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span>Projeto de</span>
        <input type="date" data-investment-plan-filter="dateFrom" value="${investmentPlanFilters.dateFrom}" />
      </label>
      <label class="field">
        <span>Projeto até</span>
        <input type="date" data-investment-plan-filter="dateTo" value="${investmentPlanFilters.dateTo}" />
      </label>
    </div>
  `;
}

function renderInvestmentPlanTable(rows) {
  return `
    <div class="table-wrap investment-plan-table-wrap">
      <table class="data-table investment-plan-table">
        <thead>
          <tr>
            <th>Obra</th>
            <th>Tipo</th>
            <th>Praça / UF</th>
            <th>Região</th>
            <th>Etapa</th>
            <th class="numeric">SLA</th>
            <th>Início Plan.</th>
            <th>Término Projeto</th>
            <th>Término Real</th>
            <th>Status</th>
            <th>Início Orçamentação</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((row) => {
              const canBudget = row.isProject && row.inicioOrcamentacao;
              return `
                <tr>
                  <td><strong>${row.obra}</strong><br /><span class="muted">${row.chaveEtapa}</span></td>
                  <td>${row.tipoUnidade || "—"}</td>
                  <td>${row.praca || "—"}/${row.uf || "—"}</td>
                  <td>${row.regiao || "—"}</td>
                  <td><span class="tag">${row.etapa}</span></td>
                  <td class="numeric">${row.slaDias ?? "—"}</td>
                  <td>${row.inicioPlanejado ? dateText(row.inicioPlanejado) : "—"}</td>
                  <td><strong>${row.terminoPlanejado ? dateText(row.terminoPlanejado) : "—"}</strong></td>
                  <td>${row.terminoReal ? dateText(row.terminoReal) : "—"}</td>
                  <td><span class="status-pill" data-status="${row.statusInfo.tone}">${row.statusInfo.label}</span></td>
                  <td>${canBudget ? `<strong>${dateText(row.inicioOrcamentacao)}</strong><br /><span class="muted">após entrega de Projetos</span>` : "—"}</td>
                  <td>
                    <div class="table-actions">
                      ${canBudget ? `<button class="secondary-action compact-action" type="button" data-action="start-budget-from-plan" data-row="${row.row}">Criar orçamento</button>` : ""}
                      ${row.obraId ? `<button class="ghost-button compact-action" type="button" data-action="select-plan-work" data-id="${row.obraId}">Portfólio</button>` : `<span class="muted">Sem vínculo</span>`}
                    </div>
                  </td>
                </tr>
              `;
            })
            .join("") || `<tr><td colspan="12"><div class="empty-state">Nenhum registro encontrado no Plano de Investimento.</div></td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function evHistoricalSourceRecords() {
  return Array.isArray(window.EV_HISTORICAL_DATA?.records) ? window.EV_HISTORICAL_DATA.records : [];
}

function evUnifiedCode(value) {
  const text = String(value || "").trim();
  const digits = text.match(/\d+/)?.[0] || "";
  if (!digits || /^0+$/.test(digits)) return "";
  return String(Number(digits));
}

function evUnifiedName(value) {
  return normalizeSearchText(value || "")
    .replace(/^projeto\s+/, "")
    .replace(/^0+\s*/, "")
    .replace(/\b(hs|ho|hc)\b/g, "hospital")
    .replace(/\b(novo|nova)\b/g, "")
    .replace(/\s+[a-z]{2}\s+tec\s+\d+.*$/, "")
    .replace(/\s+tec\s+\d+.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function evUnifiedWorkForHistorical(record) {
  const recordCode = evUnifiedCode(record.code);
  if (recordCode) {
    const byCode = state.works.find((work) => [work.chaveUnica, work.codigoOriginal, work.idApp].some((value) => evUnifiedCode(value) === recordCode));
    if (byCode) return byCode;
  }
  const recordName = evUnifiedName(record.project);
  if (recordName.length < 10) return null;
  return state.works.find((work) => {
    const workName = evUnifiedName(work.nome);
    return workName === recordName || (workName.length >= 12 && (workName.includes(recordName) || recordName.includes(workName)));
  }) || null;
}

function evUnifiedRecords() {
  const matchedWorkIds = new Set();
  const historicalRows = evHistoricalSourceRecords().map((record) => {
    const work = evUnifiedWorkForHistorical(record);
    if (work) matchedWorkIds.add(work.id);
    const typology = state.evTypologyOverrides?.[record.id] || record.typology || "Não informada";
    return { ...record, typology, sourceKind: "historical", workId: work?.id || "", sourceLabel: work ? "Histórico + cadastro" : "Histórico", searchAliases: work?.nome || "" };
  });
  const currentRows = state.works
    .filter((work) => !matchedWorkIds.has(work.id))
    .map((work) => {
      const totals = workTotals(work);
      const values = {};
      const items = (work.ev?.lines || []).map((line, index) => {
        const id = canonicalDisciplineId(line.disciplinaId);
        const value = Number(line.valorOrcado || 0);
        values[id] = (values[id] || 0) + value;
        return { item: String(disciplineById(id).posicao || index + 1), description: disciplineById(id).nome, disciplineId: id, value };
      });
      const risk = Number(values["taxa-risco"] || 0);
      const latest = work.ev?.versions?.[work.ev.versions.length - 1];
      const date = latest?.data || "";
      return {
        id: `current-${work.id}`, code: work.chaveUnica || work.codigoOriginal || "", project: work.nome,
        revision: `REV${String(work.ev?.versaoAtual || 0).padStart(2, "0")}`, date,
        year: date ? String(date).slice(0, 4) : "Atual", typology: state.evTypologyOverrides?.[`current-${work.id}`] || evHistoricalTypologyForWork(work) || work.tipologiaObra || work.tipoUnidade || "Não informada",
        area: Number(work.areaEquivalente || work.areaConstruida || 0), total: totals.orcado + totals.aditivado,
        baseTotal: Math.max(0, totals.orcado - risk), disciplines: values, items,
        sourceKind: "current", workId: work.id, sourceLabel: "Cadastro SLT 360", searchAliases: `${work.nome} ${work.chaveUnica || ""} ${work.codigoOriginal || ""}`,
      };
    });
  return [...historicalRows, ...currentRows];
}

function evHistoricalTypologyForWork(work) {
  const text = normalizeSearchText(`${work?.tipologiaObra || ""} ${work?.tipoUnidade || ""} ${work?.nome || ""}`);
  if (/\btea\b|autismo/.test(text)) return "TEA";
  if (/diagnost|laborat|imagem|coleta|terapia/.test(text)) return "Diagnóstico, Laboratório e Terapias";
  if (/pronto atendimento|\bpa\b(?!\s+tec\b)|urgencia|emergencia/.test(text)) return "Pronto Atendimento";
  if (/hospital|\bhs\b|\bho\b|\bhc\b|\buti\b/.test(text)) return "Hospital";
  if (/clinica|medprev|centro clinico/.test(text)) return "Clínica e Medicina Preventiva";
  if (/administr|logistic|centro de distribuicao/.test(text)) return "Administrativo e Logística";
  return "";
}

function evHistoricalFilteredRecords({ ignoreDiscipline = false } = {}) {
  const terms = normalizeSearchText(evHistoricalFilters.query).split(/\s+/).filter(Boolean);
  return evUnifiedRecords().filter((record) => {
    if (evHistoricalFilters.year && String(record.year) !== evHistoricalFilters.year) return false;
    if (evHistoricalFilters.typology && record.typology !== evHistoricalFilters.typology) return false;
    if (!ignoreDiscipline && evHistoricalFilters.discipline && !Number(record.disciplines?.[evHistoricalFilters.discipline] || 0)) return false;
    const haystack = normalizeSearchText(`${record.code || ""} ${record.project} ${record.revision} ${record.typology} ${record.searchAliases || ""}`);
    return !terms.length || terms.every((term) => haystack.includes(term));
  });
}

function evPercentile(values, ratio) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * ratio;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return lower === upper ? sorted[lower] : sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function evHistoricalBenchmark(records, disciplineId) {
  const shares = records
    .filter((record) => Number(record.baseTotal) > 0 && Number(record.disciplines?.[disciplineId]) > 0)
    .map((record) => (Number(record.disciplines[disciplineId]) / Number(record.baseTotal)) * 100)
    .filter(Number.isFinite);
  const mean = shares.length ? shares.reduce((sum, value) => sum + value, 0) / shares.length : 0;
  const variance = shares.length ? shares.reduce((sum, value) => sum + (value - mean) ** 2, 0) / shares.length : 0;
  return { count: shares.length, mean, median: evPercentile(shares, 0.5), p25: evPercentile(shares, 0.25), p75: evPercentile(shares, 0.75), stdDev: Math.sqrt(variance) };
}

function evHistoricalBenchmarkRows(records) {
  return disciplines
    .filter((item) => !["taxa-risco", "sics", "outras-linhas-ev"].includes(item.id))
    .map((item) => ({ discipline: item, ...evHistoricalBenchmark(records, item.id) }))
    .filter((row) => row.count >= 5)
    .sort((a, b) => b.mean - a.mean);
}

function evHistoricalFilterOptions(values, selected, allLabel, labelFor = (value) => value) {
  return `<option value="">${allLabel}</option>${[...new Set(values)].filter(Boolean).sort((a, b) => String(labelFor(a)).localeCompare(String(labelFor(b)), "pt-BR"))
    .map((value) => `<option value="${escapeAttribute(value)}" ${String(value) === String(selected) ? "selected" : ""}>${escapeAttribute(labelFor(value))}</option>`).join("")}`;
}

function renderEVHistoricalIntelligence() {
  const source = evUnifiedRecords();
  if (!source.length) return "";
  const records = evHistoricalFilteredRecords();
  const benchmarkBase = evHistoricalFilteredRecords({ ignoreDiscipline: true });
  let benchmarks = evHistoricalBenchmarkRows(benchmarkBase);
  if (evHistoricalFilters.discipline) benchmarks = benchmarks.filter((row) => row.discipline.id === evHistoricalFilters.discipline);
  const total = records.reduce((sum, record) => sum + Number(record.total || 0), 0);
  const totalArea = records.reduce((sum, record) => sum + Number(record.area || 0), 0);
  const costM2Records = records.filter((record) => Number(record.area) > 0 && Number(record.total) > 0);
  const costM2Area = costM2Records.reduce((sum, record) => sum + Number(record.area || 0), 0);
  const costM2Value = costM2Records.reduce((sum, record) => sum + Number(record.total || 0), 0);
  const typologyCostM2 = costM2Area > 0 ? costM2Value / costM2Area : 0;
  const selectedBenchmark = benchmarks[0];
  const maxMean = Math.max(...benchmarks.map((row) => row.mean), 1);
  const selectableDisciplines = disciplines.filter((d) => !["taxa-risco", "sics"].includes(d.id));
  return `
    <section class="panel ev-history-panel">
      <div class="panel-header ev-history-heading"><div><span class="eyebrow">Base única de inteligência · 2020 a 2026 + carteira atual</span><h2>Todos os EVs em uma única visão</h2><p class="panel-subtitle">${source.length} EVs unificados entre o histórico importado e os cadastros do SLT 360. Registros vinculados por código ou nome aparecem uma única vez.</p></div><span class="ev-history-badge">Base unificada</span></div>
      <div class="ev-history-filters">
        <label class="field ev-history-search"><span>Buscar EV histórico</span><input data-ev-history-search value="${escapeAttribute(evHistoricalFilters.query)}" placeholder="Código ou nome do projeto..." /></label>
        <label class="field"><span>Ano</span><select data-ev-history-filter="year">${evHistoricalFilterOptions(source.map((r) => String(r.year)), evHistoricalFilters.year, "Todos os anos")}</select></label>
        <label class="field"><span>Tipologia</span><select data-ev-history-filter="typology">${evHistoricalFilterOptions(source.map((r) => r.typology), evHistoricalFilters.typology, "Todas as tipologias")}</select></label>
        <label class="field"><span>Disciplina</span><select data-ev-history-filter="discipline">${evHistoricalFilterOptions(selectableDisciplines.map((d) => d.id), evHistoricalFilters.discipline, "Todas as disciplinas", (id) => disciplineById(id).nome)}</select></label>
      </div>
      <div class="ev-history-kpis">
        <article><span>EVs encontrados</span><strong>${number(records.length)}</strong><small>${number((records.length / Math.max(source.length, 1)) * 100, 1)}% da base</small></article>
        <article><span>Valor histórico</span><strong>${moneyCompact(total)}</strong><small>${money(total)}</small></article>
        <article><span>Área equivalente</span><strong>${metricCompact(totalArea, " m²")}</strong><small>${number(totalArea, 0)} m²</small></article>
        ${evHistoricalFilters.typology ? `<article class="ev-history-cost-m2"><span>Valor da tipologia por m²</span><strong>${typologyCostM2 ? `${money(typologyCostM2)}/m²` : "Sem leitura"}</strong><small>${escapeAttribute(evHistoricalFilters.typology)} · média ponderada de ${number(costM2Records.length)} EVs com área válida</small></article>` : ""}
        <article><span>${selectedBenchmark ? escapeAttribute(selectedBenchmark.discipline.nome) : "Média por disciplina"}</span><strong>${selectedBenchmark ? `${number(selectedBenchmark.mean, 1)}%` : `${number(benchmarks.reduce((s, r) => s + r.mean, 0) / Math.max(benchmarks.length, 1), 1)}%`}</strong><small>${selectedBenchmark ? `mediana ${number(selectedBenchmark.median, 1)}% · σ ${number(selectedBenchmark.stdDev, 1)} p.p.` : `${benchmarks.length} disciplinas com histórico`}</small></article>
      </div>
      <div class="ev-history-grid">
        <article class="ev-history-chart-card"><div class="panel-header"><div><h3>Composição histórica</h3><p class="panel-subtitle">Percentual médio nos EVs em que a disciplina foi utilizada</p></div></div><div class="ev-history-bars">
          ${benchmarks.slice(0, 10).map((row, index) => `<div class="ev-history-bar"><span class="ev-history-rank">${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeAttribute(row.discipline.nome)}</strong><small>${row.count} EVs · mediana ${number(row.median, 1)}% · σ ${number(row.stdDev, 1)} p.p.</small></div><i><b style="width:${Math.max(3, (row.mean / maxMean) * 100)}%"></b></i><em>${number(row.mean, 1)}%</em></div>`).join("") || `<div class="empty-state">Sem dados para os filtros selecionados.</div>`}
        </div></article>
        <article class="ev-history-table-card"><div class="panel-header"><div><h3>Carteira unificada de EVs</h3><p class="panel-subtitle">Histórico completo e cadastros atuais na mesma pesquisa</p></div><span class="tag">${records.length} EVs</span></div><div class="table-wrap ev-history-table-wrap"><table class="data-table"><thead><tr><th>Ano / EV</th><th>Tipologia</th><th class="numeric">Valor</th><th class="numeric">Área</th><th class="numeric">% disciplina</th><th>Ação</th></tr></thead><tbody>
          ${records.slice(0, 60).map((record) => { const disciplineValue = evHistoricalFilters.discipline ? Number(record.disciplines?.[evHistoricalFilters.discipline] || 0) : 0; const share = record.baseTotal ? (disciplineValue / record.baseTotal) * 100 : 0; const historical = record.sourceKind === "historical"; const openAction = historical ? "open-historical-ev" : "open-ev-modal"; const openId = historical ? record.id : record.workId; return `<tr><td><button class="ev-history-project-link" type="button" data-action="${openAction}" data-id="${openId}">${record.year} · ${escapeAttribute(record.project)}</button><br /><span class="muted">${escapeAttribute(record.code || "Sem código")} · ${escapeAttribute(record.revision)} · ${number(record.items?.length || 0)} filhas</span><br /><span class="ev-unified-source" data-source="${record.sourceKind}">${escapeAttribute(record.sourceLabel)}</span></td><td><strong>${escapeAttribute(record.typology)}</strong><br /><button class="ev-typology-edit" type="button" data-action="edit-ev-typology" data-id="${escapeAttribute(record.id)}">Editar tipologia</button></td><td class="numeric">${moneyCompact(record.total)}</td><td class="numeric">${record.area ? `${number(record.area, 0)} m²` : "—"}</td><td class="numeric">${evHistoricalFilters.discipline ? `${number(share, 1)}%` : "Selecione"}</td><td><div class="table-actions">${historical ? `<button class="secondary-action compact-action" type="button" data-action="open-historical-ev" data-id="${record.id}">Ver composição</button><button class="primary-action compact-action" type="button" data-action="edit-historical-ev" data-id="${record.id}">Editar EV</button>` : `<button class="primary-action compact-action" type="button" data-action="open-ev-modal" data-id="${record.workId}">Editar EV</button>`}<button class="ghost-button compact-action" type="button" data-action="load-ev-incc" data-id="${record.id}">Simular INCC</button></div></td></tr>`; }).join("") || `<tr><td colspan="6"><div class="empty-state">Nenhum EV encontrado.</div></td></tr>`}
        </tbody></table></div></article>
      </div>
    </section>`;
}

function openHistoricalEVModal(recordId) {
  const record = evHistoricalSourceRecords().find((item) => item.id === recordId);
  if (!record) return;
  const items = Array.isArray(record.items) ? record.items : [];
  const risk = Number(record.disciplines?.["taxa-risco"] || 0);
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <article class="modal-card ev-historical-modal" aria-labelledby="historicalEVTitle">
        <header class="ev-modal-header">
          <div><span class="eyebrow">EV histórico · ${record.year}</span><h2 id="historicalEVTitle">${escapeAttribute(record.project)}</h2><p class="muted">${escapeAttribute(record.code || "Sem código")} · ${escapeAttribute(record.revision)} · ${escapeAttribute(record.typology)} · ${dateText(String(record.date || "").slice(0, 10))}</p></div>
          <div class="ev-modal-status"><span class="tag">${items.length} filhas</span><button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button></div>
        </header>
        <div class="modal-body ev-modal-body">
          <section class="ev-summary-grid ev-historical-summary">
            ${miniMetric("Valor total do EV", money(record.total))}
            ${miniMetric("EV sem taxa de risco", money(record.baseTotal))}
            ${miniMetric("Taxa de risco", money(risk))}
            ${miniMetric("Área equivalente", record.area ? `${number(record.area, 2)} m²` : "—")}
            ${miniMetric("Custo total por m²", record.area ? `${money(record.total / record.area)}/m²` : "—")}
            ${miniMetric("Filhas da coluna F", number(items.length))}
          </section>
          <section class="ev-historical-source-note"><span>Coluna F</span><div><strong>Composição completa do EV</strong><small>Cada linha abaixo corresponde a uma filha da coluna “Descrição” da planilha de origem.</small></div></section>
          <div class="table-wrap ev-historical-items-wrap">
            <table class="data-table ev-historical-items-table">
              <thead><tr><th>Item</th><th>Filha / descrição da coluna F</th><th>Disciplina SLT 360</th><th class="numeric">Valor</th><th class="numeric">% do EV</th><th class="numeric">R$/m²</th></tr></thead>
              <tbody>${items.map((item) => { const share = record.total ? (Number(item.value || 0) / record.total) * 100 : 0; return `<tr><td>${escapeAttribute(item.item || "—")}</td><td><strong>${escapeAttribute(item.description || "Sem descrição")}</strong></td><td><span class="tag">${escapeAttribute(disciplineById(item.disciplineId).nome)}</span></td><td class="numeric"><strong>${money(Number(item.value || 0))}</strong></td><td class="numeric">${number(share, 2)}%</td><td class="numeric">${record.area ? money(Number(item.value || 0) / record.area) : "—"}</td></tr>`; }).join("") || `<tr><td colspan="6"><div class="empty-state">Este EV não possui filhas registradas.</div></td></tr>`}</tbody>
              <tfoot><tr class="ev-total-row"><td colspan="3"><strong>Total Geral</strong></td><td class="numeric"><strong>${money(record.total)}</strong></td><td class="numeric"><strong>100%</strong></td><td class="numeric"><strong>${record.area ? money(record.total / record.area) : "—"}</strong></td></tr></tfoot>
            </table>
          </div>
        </div>
        <footer class="modal-actions"><span class="muted">Fonte: ${escapeAttribute(window.EV_HISTORICAL_DATA.source)} · Planilha1 · coluna F</span><div class="table-actions"><button class="ghost-button" type="button" data-action="load-ev-incc" data-id="${record.id}">Simular INCC</button><button class="secondary-action" type="button" data-action="close-modal">Fechar composição</button><button class="primary-action" type="button" data-action="edit-historical-ev" data-id="${record.id}">Editar EV</button></div></footer>
      </article>
    </div>`;
}

function ensureEditableHistoricalEV(recordId) {
  const record = evHistoricalSourceRecords().find((item) => item.id === recordId);
  if (!record) return null;
  const linked = evUnifiedWorkForHistorical(record);
  if (linked) {
    const hasExistingValues = (linked.ev?.lines || []).some((line) => Number(line.valorOrcado || 0) > 0);
    if (!hasExistingValues) {
      linked.ev.lines = Object.entries(record.disciplines || {}).map(([disciplinaId, valorOrcado]) => ({ disciplinaId, valorOrcado: Number(valorOrcado || 0), status: "Estimado" }));
      if (!Number(linked.areaEquivalente || 0)) linked.areaEquivalente = Number(record.area || 0);
      if (!Number(linked.areaConstruida || 0)) linked.areaConstruida = Number(record.area || 0);
      linked.area = linked.areaEquivalente || linked.areaConstruida || 0;
      const revisionNumber = Number(String(record.revision || "").match(/\d+/)?.[0] || 0);
      linked.ev.versaoAtual = Math.max(Number(linked.ev.versaoAtual || 0), revisionNumber);
      if (!(linked.ev.versions || []).length) {
        linked.ev.versions = [{ numero: revisionNumber, data: String(record.date || "").slice(0, 10), origem: `Importado de ${window.EV_HISTORICAL_DATA.source}`, valorTotal: Number(record.total || 0), diffs: [] }];
      }
    }
    return linked;
  }
  const revisionNumber = Number(String(record.revision || "").match(/\d+/)?.[0] || 0);
  const uf = String(record.project || "").match(/\s-\s([A-Z]{2})\s(?:-|$)/)?.[1] || "";
  const work = {
    id: `historical-work-${record.id}`,
    chaveUnica: record.code && record.code !== "0000" ? record.code : record.id,
    codigoOriginal: record.code || record.id,
    nome: record.project,
    tipoUnidade: record.typology || "Não informada",
    cidade: "Não informada",
    uf,
    regiao: "Não informada",
    classificacaoObra: "Histórico importado",
    tipologiaObra: record.typology || "Não informada",
    areaConstruida: Number(record.area || 0),
    areaEquivalente: Number(record.area || 0),
    area: Number(record.area || 0),
    ordemInternaSAP: "",
    status: "Histórico",
    ev: {
      id: `editable-${record.id}`,
      versaoAtual: revisionNumber,
      status: "Completo",
      anexos: [],
      lines: Object.entries(record.disciplines || {}).map(([disciplinaId, valorOrcado]) => ({ disciplinaId, valorOrcado: Number(valorOrcado || 0), status: "Estimado" })),
      versions: [{ numero: revisionNumber, data: String(record.date || "").slice(0, 10), origem: `Importado de ${window.EV_HISTORICAL_DATA.source}`, valorTotal: Number(record.total || 0), diffs: [] }],
    },
  };
  state.works.push(work);
  return work;
}

function editHistoricalEV(recordId) {
  const work = ensureEditableHistoricalEV(recordId);
  if (!work) return;
  closeModal();
  openEVModal(work.id);
}

function openEVTypologyModal(recordId) {
  const record = evUnifiedRecords().find((item) => item.id === recordId);
  if (!record) return;
  const options = [...new Set(evUnifiedRecords().map((item) => item.typology).concat([
    "Hospital", "Pronto Atendimento", "Clínica e Medicina Preventiva", "Diagnóstico, Laboratório e Terapias",
    "TEA", "Administrativo e Logística", "Adequação Regulatória", "Outros", "Não informada",
  ]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <article class="modal-card compact-modal" aria-labelledby="evTypologyTitle">
        <header class="modal-header"><div><span class="eyebrow">Classificação unificada</span><h2 id="evTypologyTitle">Editar tipologia do EV</h2><p class="muted">${escapeAttribute(record.project)} · ${escapeAttribute(record.code || "Sem código")}</p></div><button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button></header>
        <form id="evTypologyForm" class="modal-body" data-record-id="${escapeAttribute(record.id)}">
          <label class="field"><span>Tipologia</span><select name="typology" required>${options.map((option) => `<option value="${escapeAttribute(option)}" ${option === record.typology ? "selected" : ""}>${escapeAttribute(option)}</option>`).join("")}</select></label>
          <div class="info-callout"><strong>Atualização integrada</strong><span>A nova tipologia atualizará a aba EV, os filtros, o R$/m², os gráficos estratégicos e a inteligência do Haptec.</span></div>
          <footer class="modal-actions"><button class="secondary-action" type="button" data-action="close-modal">Cancelar</button><button class="primary-action" type="submit">Salvar tipologia</button></footer>
        </form>
      </article>
    </div>`;
}

function handleEVTypologySubmit(form) {
  const recordId = form.dataset.recordId;
  const typology = String(new FormData(form).get("typology") || "").trim();
  const record = evUnifiedRecords().find((item) => item.id === recordId);
  if (!record || !typology) return;
  state.evTypologyOverrides = { ...(state.evTypologyOverrides || {}), [record.id]: typology };
  if (record.sourceKind === "historical") {
    const linked = evUnifiedWorkForHistorical(record);
    if (linked) {
      linked.tipoUnidade = typology;
      linked.tipologiaObra = typology;
    }
  } else {
    const work = workById(record.workId);
    if (work) {
      work.tipoUnidade = typology;
      work.tipologiaObra = typology;
    }
  }
  if (evHistoricalFilters.typology && evHistoricalFilters.typology !== typology) evHistoricalFilters.typology = "";
  saveState();
  closeModal();
  render();
  showToast(`Tipologia atualizada para ${typology}.`);
}

const sltINCCData = Object.freeze({
  latestLabel: "ago/2026",
  annualRates: { 2021: 14.03, 2022: 9.40, 2023: 3.32, 2024: 6.34, 2025: 6.10 },
  monthly2026: [0.63, 0.34, 0.36, 1.04, 0.77, 0.85, 0.62, 0.85],
  sourceUrl: "https://portal.fgv.br/especiais/incc-m-resultados",
  sourceLabel: "FGV IBRE · INCC-M Resultados",
});

function sltINCCFactor(basePeriod) {
  const [yearText, monthText] = String(basePeriod || "2023-12").split("-");
  const year = Number(yearText);
  const month = Number(monthText || 12);
  let factor = 1;
  Object.entries(sltINCCData.annualRates).forEach(([rateYear, rate]) => {
    if (Number(rateYear) > year) factor *= 1 + Number(rate) / 100;
  });
  sltINCCData.monthly2026.forEach((rate, index) => {
    if (year < 2026 || index + 1 > month) factor *= 1 + rate / 100;
  });
  return factor;
}

function sltINCCReading(value = sltINCCCalculator.value, basePeriod = sltINCCCalculator.basePeriod) {
  const amount = Number(value) || 0;
  const factor = sltINCCFactor(basePeriod);
  return { amount, factor, correction: amount * (factor - 1), updated: amount * factor, percentage: (factor - 1) * 100 };
}

function renderSLTCalculator() {
  const reading = sltINCCReading();
  return `
    <section class="panel slt-calculator" id="sltCalculator">
      <div class="panel-header"><div><span class="eyebrow">Calculadoras SLT</span><h2>Simulador de atualização por INCC-M</h2><p class="panel-subtitle">Receba um EV da carteira ou informe um valor avulso para atualizar da competência-base até ${sltINCCData.latestLabel}.</p></div><a class="secondary-action" href="${sltINCCData.sourceUrl}" target="_blank" rel="noopener noreferrer">Consultar fonte FGV</a></div>
      <div class="slt-calculator-layout">
        <div class="slt-calculator-form">
          <label class="field"><span>Valor original</span><input data-slt-incc-value inputmode="decimal" value="${currencyInputValue(sltINCCCalculator.value)}" placeholder="R$ 0,00" /></label>
          <label class="field"><span>Competência-base do EV</span><select data-slt-incc-period>${[2020,2021,2022,2023,2024,2025].map((year) => ({ value: `${year}-12`, label: `dez/${year}` })).concat([1,2,3,4,5,6,7,8].map((month) => ({ value: `2026-${String(month).padStart(2,"0")}`, label: `${["jan","fev","mar","abr","mai","jun","jul","ago"][month-1]}/2026` }))).map((period) => `<option value="${period.value}" ${period.value === sltINCCCalculator.basePeriod ? "selected" : ""}>${period.label}</option>`).join("")}</select></label>
          <div class="slt-calculator-method"><strong>Metodologia</strong><span>Valor atualizado = valor original × fator INCC composto</span><small>Estimativa gerencial. Não substitui cláusula contratual, índice regional ou parecer financeiro.</small></div>
        </div>
        <div class="slt-calculator-results" data-slt-incc-results>
          ${renderSLTINCCResults(reading)}
        </div>
      </div>
      <footer><span>Fonte: ${sltINCCData.sourceLabel}</span><span>Última competência disponível: ${sltINCCData.latestLabel}</span></footer>
    </section>`;
}

function renderSLTINCCResults(reading) {
  return `
    <article><span>Fator acumulado</span><strong>${number(reading.factor, 4)}×</strong><small>Variação de ${number(reading.percentage, 2)}%</small></article>
    <article><span>Correção estimada</span><strong>${money(reading.correction)}</strong><small>Acréscimo pelo INCC-M</small></article>
    <article class="is-primary"><span>Valor atualizado</span><strong>${money(reading.updated)}</strong><small>Referência ${sltINCCData.latestLabel}</small></article>`;
}

function updateSLTINCCResults() {
  const root = document.querySelector("[data-slt-incc-results]");
  if (root) root.innerHTML = renderSLTINCCResults(sltINCCReading());
}

function loadUnifiedEVIntoINCC(recordId) {
  const record = evUnifiedRecords().find((item) => item.id === recordId);
  if (!record) return;
  const recordYear = Number(record.year) || 2025;
  const dateMonth = Number(String(record.date || "").slice(5, 7)) || 12;
  const basePeriod = recordYear >= 2026 ? `2026-${String(Math.min(dateMonth, 8)).padStart(2, "0")}` : `${Math.max(2020, Math.min(recordYear, 2025))}-12`;
  sltINCCCalculator = { value: Number(record.total || 0), basePeriod };
  closeModal();
  render();
  document.querySelector("#sltCalculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`EV enviado para a Calculadora SLT (${record.year}).`);
}

function renderEV() {
  return `
    ${renderWorksToolbar("ev", "Base unificada de EVs", "Histórico, carteira atual, composição por disciplina e alertas estatísticos em uma única visão", `
      <button class="secondary-action" type="button" data-view="portfolio">Portfólio</button>
      <button class="secondary-action" type="button" data-action="clear-ev-filters">Limpar filtros</button>
      ${miroButton("Fluxo Miro")}
      <button class="primary-action" type="button" data-action="open-demand">Nova SIC</button>
    `)}
    ${renderEVHistoricalIntelligence()}
    ${renderSLTCalculator()}
    ${renderBudgetingFlowPanel()}
  `;
}

function filteredEVWorks() {
  const terms = normalizeSearchText([searchTerm, evAssistantQuery].filter(Boolean).join(" "))
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!terms.length) return state.works;
  return state.works.filter((work) => terms.every((term) => workSearchText(work).includes(term)));
}

function renderEVSearchAssistant(evWorks) {
  const hasQuery = Boolean(evAssistantQuery);
  const suggestions = hasQuery ? evWorks.slice(0, 10) : [];
  return `
    <section class="panel ev-search-assistant">
      <label class="field">
        <span>Assistente de busca EV</span>
        <input data-ev-assistant-search value="${escapeAttribute(evAssistantQuery)}" placeholder="Buscar por obra, chave, cidade, UF, tipo, região ou classificação..." />
      </label>
      ${
        hasQuery
          ? suggestions.length
            ? `
              <div class="ev-search-results" aria-label="Sugestões de obras">
                ${suggestions
                  .map(
                    (work) => `
                      <button type="button" data-action="select-ev-work" data-id="${work.id}">
                        <strong>${work.nome}</strong>
                        <span>${work.chaveUnica} | ${work.tipoUnidade} | ${work.cidade}/${work.uf} | ${work.regiao}</span>
                      </button>
                    `
                  )
                  .join("")}
              </div>
              <p class="muted">Mostrando ${suggestions.length} de ${evWorks.length} obra${evWorks.length === 1 ? "" : "s"} encontrada${evWorks.length === 1 ? "" : "s"}.</p>
            `
            : `<div class="empty-state">Nenhuma obra encontrada para "${evAssistantQuery}".</div>`
          : `<p class="muted">Digite parte do nome, chave, cidade, UF ou tipo para localizar rapidamente o EV de uma obra cadastrada.</p>`
      }
    </section>
  `;
}

function totalsForWorks(works) {
  return works.reduce(
    (total, work) => {
      const values = workTotals(work);
      total.orcado += values.orcado;
      total.aditivado += values.aditivado;
      total.contratado += values.contratado;
      total.saldo += values.saldo;
      return total;
    },
    { orcado: 0, aditivado: 0, contratado: 0, saldo: 0 }
  );
}

function renderEVVersionPanel(work) {
  const latestVersion = work.ev.versions[work.ev.versions.length - 1];
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Comparador de versões</h2>
          <p class="panel-subtitle">${latestVersion?.origem || "Sem versão"} | diferenças por disciplina</p>
        </div>
        <button class="primary-action" type="button" data-action="open-ev-modal" data-id="${work.id}">Abrir EV</button>
      </div>
      ${renderVersionDiff(latestVersion)}
    </section>
  `;
}

function renderEVOverviewTable(selectedWork = null) {
  const works = selectedWork ? [selectedWork] : filteredEVWorks();
  if (!works.length) return `<div class="empty-state">Nenhum EV encontrado para o filtro atual.</div>`;
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Obra</th>
            <th>Cidade/UF</th>
            <th>Versão</th>
            <th>Última atualização</th>
            <th>Pendência</th>
            <th class="numeric">Valor total</th>
            <th class="numeric">Valor por m²</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          ${works
            .map((work) => {
              const totals = workTotals(work);
              const totalValue = totals.orcado + totals.aditivado;
              const lastVersion = work.ev.versions[work.ev.versions.length - 1];
              const pending = work.ev.status === "Completo" ? "OK" : "Pendente";
              return `
                <tr>
                  <td><strong>${work.nome}</strong><br /><span class="muted">${work.chaveUnica}</span></td>
                  <td>${work.cidade}/${work.uf}</td>
                  <td>REV${String(work.ev.versaoAtual).padStart(2, "0")} · ${work.ev.versions.length} versão${work.ev.versions.length === 1 ? "" : "es"}</td>
                  <td>${lastVersion?.data ? dateText(lastVersion.data) : "Rascunho"}</td>
                  <td><span class="status-pill" data-status="${pending === "OK" ? "Completo" : "Pendente"}">${pending}</span></td>
                  <td class="numeric">${money(totalValue)}</td>
                  <td class="numeric">${work.areaEquivalente ? `${money(totalValue / work.areaEquivalente)}/m²` : "—"}</td>
                  <td><button class="secondary-action" type="button" data-action="open-ev-modal" data-id="${work.id}">Abrir EV</button></td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function projectMasterItems(work) {
  const demands = state.demands.filter((demand) => demand.obraId === work.id);
  const items = [];
  (work.ev.anexos || []).forEach((file) => {
    items.push(`Arquivo EV: ${file.nome}`);
  });
  demands.forEach((demand) => {
    Object.entries(demand.projetos || {}).forEach(([disciplina, status]) => {
      if (status) items.push(`${disciplina}: ${formatMasterStatus(status)}`);
    });
    (demand.projetosCustom || []).forEach((item) => {
      const name = item.nome || item.disciplina || "Projeto complementar";
      const status = formatMasterStatus(item.status || item.caminho || item);
      items.push(`${name}: ${status}`);
    });
  });
  return [...new Set(items)].slice(0, 10);
}

function formatMasterStatus(value) {
  if (value == null) return "Cadastro importado";
  if (typeof value === "string") return value || "Cadastro importado";
  if (typeof value === "object") {
    return value.status || value.nome || value.caminho || value.url || value.name || "Cadastro importado";
  }
  return String(value);
}

function openEVModal(workId) {
  const work = workById(workId);
  if (!work) return;
  selectedWorkId = work.id;
  const totals = workTotals(work);
  const riskTotal = work.ev.lines.filter(isRiskLine).reduce((sum, line) => sum + (line.valorOrcado || 0), 0);
  const totalValue = totals.orcado + totals.aditivado;
  const lastVersion = work.ev.versions[work.ev.versions.length - 1];
  const masterItems = projectMasterItems(work);
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <article class="modal-card ev-modal-card" aria-labelledby="evModalTitle">
        <header class="ev-modal-header">
          <div>
            <span class="eyebrow">Estudo de Viabilidade</span>
            <h2 id="evModalTitle">${work.nome}</h2>
            <p class="muted">${work.chaveUnica} | ${work.tipoUnidade} | ${work.cidade}/${work.uf}</p>
          </div>
          <div class="ev-modal-status">
            <span class="tag">REV${String(work.ev.versaoAtual).padStart(2, "0")}</span>
            <span class="status-pill" data-status="${work.ev.status}">${work.ev.status}</span>
            <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
          </div>
        </header>
        <div class="modal-body ev-modal-body">
          <section class="ev-summary-grid">
            ${miniMetric("Valor da obra", money(totals.orcado))}
            ${miniMetric("Taxa de risco 5%", money(riskTotal))}
            ${miniMetric("Total do EV", money(totalValue))}
            ${miniMetric("Custo por m²", work.areaEquivalente ? `${money(totalValue / work.areaEquivalente)}/m²` : "—")}
            ${miniMetric("Área construída", `${number(work.areaConstruida)} m²`)}
            ${miniMetric("Área equivalente", `${number(work.areaEquivalente)} m²`)}
          </section>

          <section class="ev-master-panel">
            <div>
              <h3>Lista mestre do projeto</h3>
              <p class="muted">Cadastro de documentos e disciplinas que embasam o orçamento.</p>
            </div>
            <div class="master-list">
              ${
                masterItems.length
                  ? masterItems.map((item) => `<span class="tag">${item}</span>`).join("")
                  : `<span class="muted">Lista mestre pendente para esta obra.</span>`
              }
            </div>
          </section>

          <section>
            <div class="panel-header">
              <div>
                <h3>Nomenclatura do EV padrão</h3>
                <p class="panel-subtitle">Estrutura oficial de disciplinas, valores e status do estudo selecionado.</p>
              </div>
            </div>
            ${renderEVStandardStructure(work)}
          </section>

          <section class="ev-version-panel">
            <h3>Rastreabilidade de versões</h3>
            <div class="timeline-list">
              ${
                work.ev.versions.length
                  ? work.ev.versions
                      .map(
                        (version) => `
                          <article>
                            <strong>REV${String(version.numero).padStart(2, "0")} | ${dateText(version.data)}</strong>
                            <span>${version.origem || "Versão importada"} | ${money(version.valorTotal || 0)}</span>
                          </article>
                        `
                      )
                      .join("")
                  : `<div class="empty-state">Sem versões registradas.</div>`
              }
            </div>
          </section>
        </div>
        <footer class="modal-actions">
          <button class="secondary-action" type="button" data-action="open-work-ev" data-id="${work.id}">Abrir na aba EV</button>
          <button class="primary-action" type="button" data-view="budget">Ver controle de verba</button>
        </footer>
      </article>
    </div>
  `;
}

function miniMetric(label, value) {
  return `
    <article class="mini-metric">
      <small>${label}</small>
      <strong>${value}</strong>
    </article>
  `;
}

function renderBudgetingFlowPanel() {
  const steps = [
    "Entrada",
    "Triagem",
    "Orçamentação",
    "Validação",
    "Consolidação",
    "Verbas",
  ];
  return `
    <section class="panel compact-flow-panel">
      <div class="panel-header">
        <div>
          <h2>Fluxo de valor de orçamentação de projetos</h2>
          <p class="panel-subtitle">Sequência resumida do fluxo-base do Miro para Obras</p>
        </div>
        ${miroButton("Ver board")}
      </div>
      <div class="compact-flow-list">
        ${steps.map((step, index) => `<span>${index + 1}. ${step}</span>`).join("")}
      </div>
    </section>
  `;
}

function processStage(numberLabel, title, detail) {
  return `
    <article class="process-stage">
      <span>${numberLabel}</span>
      <strong>${title}</strong>
      <p>${detail}</p>
    </article>
  `;
}

function renderEVStandardStructure(work) {
  const lineMap = new Map();
  (work.ev.lines || []).forEach((line) => {
    lineMap.set(canonicalDisciplineId(line.disciplinaId), line);
  });
  const rows = disciplines.map((discipline) => {
    const line = lineMap.get(discipline.id);
    const status = normalizeEVLineStatus(line?.status || "Estimado");
    const value = status === "Não se aplica" ? 0 : Number(line?.valorOrcado || 0);
    return { discipline, line, status, value };
  });
  const hiddenCount = rows.filter((row) => row.status === "Não se aplica").length;
  const visibleRows = evShowNotApplicable ? rows : rows.filter((row) => row.status !== "Não se aplica");
  const applicableRows = rows.filter((row) => row.status !== "Não se aplica");
  const baseTotal = applicableRows.reduce((sum, row) => sum + row.value, 0);
  const baseTotalNoRisk = applicableRows
    .filter((row) => !isRiskLine({ disciplinaId: row.discipline.id }))
    .reduce((sum, row) => sum + row.value, 0);
  const valuesByDiscipline = Object.fromEntries(applicableRows.map((row) => [row.discipline.id, row.value]));
  const currentCostPerM2 = work.areaEquivalente ? baseTotalNoRisk / work.areaEquivalente : 0;
  const renderRows = (category) =>
    visibleRows
      .filter((row) => row.discipline.categoria === category)
      .map((row) => renderEVEditableRow(work, row, baseTotal))
      .join("");
  const anexos = work.ev.anexos || [];
  return `
    <form class="ev-editor" id="evForm" data-work-id="${work.id}" data-ev-total-no-risk="${baseTotalNoRisk}">
      <input type="hidden" name="saveMode" value="final" />
      <div class="error-box" id="formError" role="alert"></div>
      <section class="ev-area-panel">
        <div>
          <h3>Dados de área do EV</h3>
          <p class="muted">Campos usados para recalcular automaticamente o custo por m² deste estudo.</p>
        </div>
        <div class="form-grid ev-area-grid">
          <label class="field">
            <span>Área construída (m²)</span>
            <input name="evAreaConstruida" data-ev-area-input inputmode="decimal" value="${currencyInputValue(work.areaConstruida)}" placeholder="0,00" />
          </label>
          <label class="field">
            <span>Área equivalente (m²)</span>
            <input name="evAreaEquivalente" data-ev-area-input inputmode="decimal" value="${currencyInputValue(work.areaEquivalente)}" placeholder="0,00" />
          </label>
          <div class="mini-metric ev-area-preview">
            <small>Custo/m² sem risco</small>
            <strong data-ev-area-preview>${currentCostPerM2 ? `${money(currentCostPerM2)}/m²` : "—"}</strong>
          </div>
        </div>
      </section>
      <section class="ev-deviation-panel" data-ev-deviation-panel>
        ${evHistoricalDeviationMarkup(work, valuesByDiscipline, baseTotalNoRisk)}
      </section>
      <div class="ev-editor-toolbar">
        <button class="secondary-action" type="button" data-action="toggle-ev-na">
          ${evShowNotApplicable ? "Ocultar" : "Mostrar"} ${hiddenCount} item(ns) não aplicável(is)
        </button>
      </div>
      <div class="table-wrap ev-editor-table">
        <table class="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Descrição</th>
              <th class="numeric">Valor</th>
              <th class="numeric">%</th>
              <th>Status</th>
              <th class="numeric">R$/m²</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr class="ev-section-row"><td colspan="7">Obra</td></tr>
            ${renderRows("CustosDaObra") || `<tr><td colspan="7" class="empty-state">Todos os custos da obra estão marcados como N/A.</td></tr>`}
            <tr class="ev-section-row"><td colspan="7">Outras categorias</td></tr>
            ${renderRows("OutrasCategorias") || `<tr><td colspan="7" class="empty-state">Todas as outras categorias estão marcadas como N/A.</td></tr>`}
            <tr class="ev-total-row">
              <td colspan="2"><strong>Total Geral</strong></td>
              <td class="numeric"><strong>${money(baseTotal)}</strong></td>
              <td class="numeric"><strong>100%</strong></td>
              <td></td>
              <td class="numeric"><strong>${work.areaEquivalente ? money(baseTotal / work.areaEquivalente) : "—"}</strong></td>
              <td></td>
            </tr>
            <tr class="ev-total-row is-secondary">
              <td colspan="2"><strong>Total Geral (Sem Taxa de Risco)</strong></td>
              <td class="numeric"><strong>${money(baseTotalNoRisk)}</strong></td>
              <td class="numeric"><strong>${baseTotal ? `${number((baseTotalNoRisk / baseTotal) * 100, 2)}%` : "—"}</strong></td>
              <td></td>
              <td class="numeric"><strong>${work.areaEquivalente ? money(baseTotalNoRisk / work.areaEquivalente) : "—"}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <section class="ev-attachments">
        <div>
          <h3>Arquivos do EV</h3>
          <p class="muted">Anexe planilhas, memórias de cálculo, cotações ou documentos que sustentam este orçamento.</p>
        </div>
        <label class="file-drop">
          <input name="evFiles" type="file" multiple />
          <span>Selecionar arquivo(s)</span>
          <small>${anexos.length ? `${anexos.length} arquivo(s) anexado(s) ao EV.` : "Nenhum arquivo anexado ao EV."}</small>
        </label>
        ${renderAttachmentList(anexos, "Nenhum arquivo anexado ao EV.")}
      </section>

      <footer class="ev-editor-actions">
        <button class="secondary-action" type="submit" data-save-mode="draft">Salvar rascunho</button>
        <button class="primary-action" type="submit" data-save-mode="final">Salvar EV</button>
      </footer>
    </form>
  `;
}

function renderEVEditableRow(work, row, baseTotal) {
  const { discipline, line, status, value } = row;
  const isNA = status === "Não se aplica";
  const percent = baseTotal && !isNA ? (value / baseTotal) * 100 : 0;
  const unitCost = work.areaEquivalente && !isNA ? value / work.areaEquivalente : 0;
  return `
    <tr class="ev-line-row ${isNA ? "is-not-applicable" : ""}" data-discipline-id="${discipline.id}">
      <td>${discipline.posicao}</td>
      <td>
        <strong>${discipline.nome}</strong>
        ${renderEVSicLineDetails(line)}
      </td>
      <td class="numeric">
        <input class="ev-value-input" name="evValue_${discipline.id}" inputmode="decimal" value="${currencyInputValue(value)}" ${isNA ? "disabled" : ""} />
      </td>
      <td class="numeric">${isNA ? "–" : `${number(percent, 2)}%`}</td>
      <td>
        <select class="ev-status-select" name="evStatus_${discipline.id}" data-status="${status}">
          ${evStatusOptions(status)}
        </select>
      </td>
      <td class="numeric">${isNA || !unitCost ? "–" : money(unitCost)}</td>
      <td>
        <button class="ghost-button compact-action" type="button" data-action="set-ev-line-na">N/A</button>
      </td>
    </tr>
  `;
}

function renderEVSicLineDetails(line) {
  if (canonicalDisciplineId(line?.disciplinaId) !== "sics" || !(line.sicDetails || []).length) return "";
  return `
    <div class="ev-sic-detail-list">
      ${line.sicDetails
        .map((rawItem) => {
          const item = evSicDetailViewModel(rawItem);
          return `
            <span class="${item.riskExceeded ? "is-risk-alert" : ""}">
              <b>${escapeAttribute(sicDisplayReference(item))}</b>
              <em>${escapeAttribute(sicDisplayTitle(item))}</em>
              <strong>${money(item.valor)}</strong>
              ${
                item.riskExceeded
                  ? `<small class="ev-sic-risk-warning">Alerta: valor da SIC maior que o risco disponível (${money(item.riskAvailable)}). Excesso: ${money(item.riskExcess)}.</small>`
                  : ""
              }
            </span>
          `;
        })
        .join("")}
    </div>
  `;
}

function evSicDetailViewModel(item) {
  const sic = state.sics.find((candidate) => candidate.id === item.id || candidate.numeroSic === item.numeroSic);
  if (!sic) return item;
  const risk = sicRiskReading(workById(sic.obraId), sic);
  return {
    ...item,
    id: sic.id || item.id,
    numeroSic: sic.numeroSic || item.numeroSic,
    lecomNumber: sic.lecomNumber || item.lecomNumber,
    titulo: sicDisplayTitle(sic),
    valor: Number(item.valor ?? sicTotal(sic)) || 0,
    riskExceeded: Boolean(item.riskExceeded || risk.exceeded),
    riskAvailable: Number(item.riskAvailable ?? risk.available) || 0,
    riskExcess: Number(item.riskExcess ?? risk.excess) || 0,
  };
}

function sicDisplayReference(sic) {
  const lecom = String(sic?.lecomNumber || "").trim();
  if (lecom && lecom !== "—") return `LECOM ${lecom}`;
  return `SIC ${sic?.numeroSic || sic?.id || "—"}`;
}

function sicDisplayTitle(sic) {
  return sic?.titulo || sic?.tituloSic || sic?.descricao || "SIC sem título";
}

function evStatusOptions(selected) {
  return ["Estimado", "Orçado", "Cotado", "Não se aplica"]
    .map((status) => `<option value="${status}" ${status === selected ? "selected" : ""}>${status}</option>`)
    .join("");
}

function normalizeEVLineStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (value === "naoseaplica" || value === "não se aplica" || value === "nao se aplica") return "Não se aplica";
  if (value === "cotado") return "Cotado";
  if (value === "orcado" || value === "orçado") return "Orçado";
  return "Estimado";
}

function currencyInputValue(value) {
  return number(Number(value || 0), 2);
}

function renderEVLinesTable(work) {
  const sorted = [...work.ev.lines].sort(
    (a, b) => disciplineById(a.disciplinaId).posicao - disciplineById(b.disciplinaId).posicao
  );
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Pos.</th>
            <th>Disciplina</th>
            <th>Categoria</th>
            <th class="numeric">Orçado</th>
            <th class="numeric">Aditivado</th>
            <th class="numeric">Contratado</th>
            <th class="numeric">Saldo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${sorted
            .map((line) => {
              const discipline = disciplineById(line.disciplinaId);
              const values = lineTotals(work, line);
              const linkedSics = [...new Set([...(line.sicIds || [])])];
              const linkedDemands = [...new Set([...(line.demandaIds || [])])];
              return `
                <tr>
                  <td>${discipline.posicao}</td>
                  <td>
                    <strong>${discipline.nome}</strong>
                    ${renderEVSicLineDetails(line)}
                    ${linkedSics.length ? `<br /><span class="muted">SIC vinculada: ${linkedSics.join(", ")}</span>` : ""}
                    ${linkedDemands.length ? `<br /><span class="muted">Card operacional: ${linkedDemands.join(", ")}</span>` : ""}
                  </td>
                  <td>${categoryLabel(discipline.categoria)}</td>
                  <td class="numeric">${money(values.orcado)}</td>
                  <td class="numeric">${money(values.aditivado)}</td>
                  <td class="numeric">${money(values.contratado)}</td>
                  <td class="numeric">${money(values.saldo)}</td>
                  <td><span class="status-pill" data-status="${line.status}">${line.status}</span></td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderVersionDiff(version) {
  if (!version || !version.diffPorDisciplina.length) {
    return `<div class="empty-state">Versão base sem diferenças registradas.</div>`;
  }
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Disciplina</th>
            <th class="numeric">Antes</th>
            <th class="numeric">Depois</th>
            <th class="numeric">Diferença</th>
          </tr>
        </thead>
        <tbody>
          ${version.diffPorDisciplina
            .map((diff) => {
              const delta = diff.valorDepois - diff.valorAntes;
              return `
                <tr>
                  <td><strong>${disciplineById(diff.disciplinaId).nome}</strong></td>
                  <td class="numeric">${money(diff.valorAntes)}</td>
                  <td class="numeric">${money(diff.valorDepois)}</td>
                  <td class="numeric">${money(delta)}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

const CLINICAL_COST_CENTER_LABEL = "ENGENHARIA CLÍNICA";

function isClinicalView(view = currentView) {
  return clinicalViewIds.includes(view);
}

function activeMaintenanceModule() {
  return isClinicalView() ? "clinical" : "maintenance";
}

function isClinicalCostCenter(value) {
  const text = normalizeSearchText(value || "");
  return text.includes("clinica") && (text.includes("engenharia") || text.includes("eng ") || text.includes("eng.") || text.includes("engª"));
}

function isClinicalMaintenanceDemand(item) {
  return isClinicalCostCenter(item?.centroCusto);
}

function maintenanceItemsForModule(module = activeMaintenanceModule()) {
  const items = state.maintenanceDemands || [];
  return module === "clinical" ? items.filter(isClinicalMaintenanceDemand) : items.filter((item) => !isClinicalMaintenanceDemand(item));
}

function maintenanceItems() {
  return maintenanceItemsForModule();
}

function clinicalItems() {
  return maintenanceItemsForModule("clinical");
}

function maintenanceFiltersForActiveModule() {
  return activeMaintenanceModule() === "clinical" ? clinicalFilters : maintenanceFilters;
}

function maintenanceViewModeForActiveModule() {
  return activeMaintenanceModule() === "clinical" ? clinicalViewMode : maintenanceViewMode;
}

function setMaintenanceViewModeForActiveModule(mode) {
  if (activeMaintenanceModule() === "clinical") clinicalViewMode = mode;
  else maintenanceViewMode = mode;
}

function maintenanceModuleLabels() {
  if (activeMaintenanceModule() === "clinical") {
    return {
      short: "Eng. Clínica",
      title: "Eng. Clínica 360",
      homeView: "clinical",
      operationalView: "clinicalOperational",
      reportsView: "clinicalReports",
      timelineView: "clinicalTimeline",
      executiveView: "clinicalExecutive",
      settingsView: "clinicalSettings",
      reportsLabel: "BI Eng. Clínica",
      operationalTitle: "Operacional de Engenharia Clínica",
      operationalSubtitle: "Kanban por fases Pipefy, OS, unidade, equipamento, lead time e histórico do ativo",
      boardTitle: "Kanban Engenharia Clínica",
      settingsTitle: "Parque Tecnológico",
      settingsSubtitle: "Base de unidades, ativos clínicos, fases, SLA e parâmetros do módulo",
      demandTitle: "Eng. Clínica - Nova OS",
      demandToast: "Demanda de Engenharia Clínica criada na coluna Não iniciada.",
      costCenter: CLINICAL_COST_CENTER_LABEL,
      source: "Effort / Pipefy clínico",
      isClinical: true,
    };
  }
  return {
    short: "Manutenção",
    title: "Manutenção 360",
    homeView: "maintenance",
    operationalView: "maintenanceOperational",
    reportsView: "maintenanceReports",
    timelineView: "maintenanceTimeline",
    executiveView: "maintenanceExecutive",
    settingsView: "maintenanceSettings",
    reportsLabel: "BI Manutenção",
    operationalTitle: "Operacional de Manutenção",
    operationalSubtitle: "Kanban por fases Pipefy, contador de tempo por bucket e lead time total da OS",
    boardTitle: "Kanban manutenção",
    settingsTitle: "Configurações Manutenção",
    settingsSubtitle: "Base de unidades, tipologias, fases e parâmetros de SLA do módulo",
    demandTitle: "Manutenção - Nova OS",
    demandToast: "Demanda de manutenção criada na coluna Não iniciada.",
    costCenter: "MANUTENÇÃO PREDIAL",
    source: "Relatório de manutenção",
    isClinical: false,
  };
}

function renderMaintenanceContextToolbar(activeView, title, subtitle, actions = "") {
  return activeMaintenanceModule() === "clinical"
    ? renderClinicalToolbar(activeView, title, subtitle, actions)
    : renderMaintenanceToolbar(activeView, title, subtitle, actions);
}

function isMaintenanceOpex(item) {
  return normalizeSearchText(item?.tipoDespesa || "").includes("opex");
}

function isMaintenanceCapex(item) {
  return normalizeSearchText(item?.tipoDespesa || "").includes("capex");
}

function maintenanceValue(item) {
  return Number(item.valorSalaTecnica || 0) || 0;
}

function maintenanceMoneyValue(item, key) {
  if (key === "valorNegociado" && isMaintenanceOpex(item)) return 0;
  return Number(item?.[key] || 0) || 0;
}

function maintenanceValueTotals(items = maintenanceItems()) {
  const totals = items.reduce(
    (acc, item) => {
      acc.proposta += maintenanceMoneyValue(item, "valorProposta");
      acc.salaTecnica += maintenanceMoneyValue(item, "valorSalaTecnica");
      acc.negociado += maintenanceMoneyValue(item, "valorNegociado");
      if (isMaintenanceCapex(item)) acc.capexProposta += maintenanceMoneyValue(item, "valorProposta");
      acc.referencia += maintenanceValue(item);
      return acc;
    },
    { proposta: 0, salaTecnica: 0, negociado: 0, capexProposta: 0, referencia: 0 }
  );
  totals.savingTecnico = totals.proposta - totals.salaTecnica;
  totals.savingNegociado = totals.capexProposta - totals.negociado;
  return totals;
}

function maintenanceShowsNegotiated(items = maintenanceItems()) {
  return items.some(isMaintenanceCapex);
}

function maintenanceSummary() {
  return state.maintenanceBi?.summary || {};
}

function maintenanceSummaryCostRows() {
  return (state.maintenanceBi?.summaryCostLines || []).map((row) => ({
    label: row.linha || "Não informado",
    value: row.linha || "Não informado",
    field: "planejamento",
    count: 1,
    valor: Number(row.valor || 0) || 0,
  }));
}

function maintenanceMonthLabel(value) {
  if (!/^\d{4}-\d{2}$/.test(value)) return value.replace("-", "/");
  const [year, month] = value.split("-");
  const names = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${names[Number(month) - 1]}/${year.slice(2)}`;
}

function maintenanceLeadTime(item) {
  if (!item?.dataInicio) return 0;
  return Math.max(0, daysBetween(item.dataInicio, item.dataFim || TODAY_ISO));
}

function maintenancePhaseDays(item) {
  return item?.phaseStartedAt ? Math.max(0, daysBetween(item.phaseStartedAt, TODAY_ISO)) : maintenanceLeadTime(item);
}

function isMaintenanceClosed(item) {
  return ["postado", "postadoComRc", "cardsArquivados", "finalizada"].includes(item.coluna);
}

function isMaintenanceLate(item) {
  return !isMaintenanceClosed(item) && maintenanceLeadTime(item) > 23;
}

function clinicalEquipmentName(item) {
  if (item?.equipamento || item?.assetName) return item.equipamento || item.assetName;
  const title = normalizeSearchText(item?.titulo || "");
  const patterns = [
    ["tomogra", "Tomógrafo"],
    ["ressonancia", "Ressonância magnética"],
    ["videogastro", "Videogastroscópio"],
    ["videocolono", "Videocolonoscópio"],
    ["ultrassom", "Ultrassom"],
    ["angio", "Angiógrafo"],
    ["hemodinamica", "Hemodinâmica"],
    ["arco", "Arco cirúrgico"],
    ["raio", "Raio-X"],
    ["anestesia", "Aparelho de anestesia"],
    ["termodesinfectora", "Termodesinfectora"],
    ["maquina", "Equipamento clínico"],
  ];
  return patterns.find(([term]) => title.includes(term))?.[1] || "";
}

function maintenanceSearchText(item) {
  return normalizeSearchText([
    item.id,
    item.codigoOrigem,
    item.ordemInterna,
    item.ordemServico,
    item.titulo,
    item.unidadeNome,
    item.tipologia,
    item.uf,
    item.estado,
    item.regiao,
    item.regional,
    item.centroCusto,
    item.tipoDespesa,
    item.sprintId,
    item.sprint,
    maintenanceSprintName(item),
    item.planejamento,
    item.observacoes,
    item.equipamento,
    item.assetName,
    item.patrimonio,
    item.fabricante,
    item.modelo,
    item.numeroSerie,
    clinicalEquipmentName(item),
  ].join(" "));
}

function maintenanceUnits() {
  const unitRows = (state.unitRegistry?.records || []).map((row, index) => ({
    id: `unit-${index + 1}`,
    centro: importedText(recordValue(row, ["CENTRO"]), ""),
    tipo: importedText(recordValue(row, ["TIPO"]), "Não informado"),
    cnpj: importedText(recordValue(row, ["CNPJ"]), ""),
    cep: importedText(recordValue(row, ["CEP"]), ""),
    endereco: importedText(recordValue(row, ["ENDEREÇO", "ENDERECO", "ENDEREÇO COMPLETO", "ENDERECO COMPLETO", "LOGRADOURO", "RUA"]), ""),
    municipio: importedText(recordValue(row, ["MUNICIPIO", "MUNICÍPIO", "CIDADE", "MUNICÍPIO/UF", "MUNICIPIO/UF"]), ""),
    uf: importedText(recordValue(row, ["UF", "ESTADO DA UNIDADE", "ESTADO"]), ""),
    regiao: importedText(recordValue(row, ["REGIÃO", "REGIAO", "REGIÃO 2", "REGIAO 2"]), ""),
    regional: importedText(recordValue(row, ["REGIONAL"]), ""),
    nome: importedText(recordValue(row, ["NOME UNIDADE", "UNIDADE"]), "Unidade não informada"),
    source: "Cadastro de unidades",
  }));
  const workRows = state.works.map((work) => ({
    id: `work-${work.id}`,
    centro: work.codigoOriginal || "",
    tipo: work.tipoUnidade || "Obra",
    cnpj: work.cnpj || "",
    cep: "",
    municipio: [work.cidade, work.uf].filter(Boolean).join("/"),
    uf: work.uf || "",
    regiao: work.regiao || "",
    regional: "",
    nome: work.nome,
    endereco: work.endereco || "",
    source: "Portfólio de obras",
  }));
  const seen = new Set();
  return [...unitRows, ...workRows].filter((unit) => {
    const key = normalizeSearchText(`${unit.nome}|${unit.cnpj}|${unit.centro}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function maintenanceUnitById(id) {
  return maintenanceUnits().find((unit) => unit.id === id);
}

function maintenanceUnitSearchResults(query = "", selectedId = "") {
  const selected = maintenanceUnitById(selectedId);
  if (selected) {
    const selectedLocation = unitLocationFields(selected);
    const selectedAddress = selected.endereco || selected.cep || "Endereço não informado";
    return `
      <div class="sic-work-selected">
        <strong>${selected.nome}</strong>
        <span>${selected.tipo} | ${[selectedLocation.cidade, selectedLocation.uf].filter(Boolean).join("/") || "Cidade não informada"} | ${selectedLocation.regiao || "Região não informada"} | ${selected.centro ? `Centro ${selected.centro}` : "Centro não informado"} | ${selected.cnpj || "CNPJ não informado"} | ${selectedAddress}</span>
      </div>
    `;
  }
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return `<p class="muted">Digite nome, CNPJ, centro, município, UF ou tipo da unidade.</p>`;
  const suggestions = maintenanceUnits()
    .filter((unit) => {
      const location = unitLocationFields(unit);
      const text = normalizeSearchText([unit.nome, unit.tipo, unit.cnpj, unit.cep, unit.endereco, unit.municipio, location.cidade, location.uf, location.regiao, unit.centro, unit.source].join(" "));
      return terms.every((term) => text.includes(term));
    })
    .slice(0, 8);
  if (!suggestions.length) return `<div class="empty-state compact">Nenhuma unidade encontrada na base de cadastro.</div>`;
  return `
    <div class="sic-work-results maintenance-unit-results" aria-label="Sugestões de unidades">
      ${suggestions
        .map(
          (unit) => `
            <button type="button" data-action="select-maintenance-unit" data-id="${unit.id}">
              <strong>${unit.nome}</strong>
              <span>${unit.tipo} | ${unitLocationLabel(unit)} | ${unit.cnpj || "CNPJ não informado"} | ${unit.centro ? `Centro ${unit.centro}` : unit.source}</span>
            </button>
          `
        )
        .join("")}
    </div>
    <p class="muted">Mostrando ${suggestions.length} sugestão${suggestions.length === 1 ? "" : "ões"} para "${escapeAttribute(query)}".</p>
  `;
}

function maintenanceFieldOptions(values, selected, emptyLabel = "Todos") {
  const normalizedValues = [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
  return [`<option value="">${emptyLabel}</option>`]
    .concat(normalizedValues.map((value) => `<option value="${escapeAttribute(value)}" ${String(selected) === String(value) ? "selected" : ""}>${value}</option>`))
    .join("");
}

function maintenanceSprintFilterOptions(selected = "") {
  const selectedSprintId = sprintByReference(selected)?.id || "";
  return [`<option value="">Todas</option>`]
    .concat((state.sprints || []).map((sprint) => `<option value="${sprint.id}" ${sprint.id === selectedSprintId ? "selected" : ""}>${sprint.nome}${sprint.status === "Ativa" ? " (ativa)" : ""}</option>`))
    .join("");
}

function filteredMaintenanceDemands() {
  const filters = maintenanceFiltersForActiveModule();
  return maintenanceItems().filter((item) => {
    const query = normalizeSearchText([searchTerm, filters.query].filter(Boolean).join(" ")).trim();
    if (query && !query.split(/\s+/).every((term) => maintenanceSearchText(item).includes(term))) return false;
    if (filters.sprint && maintenanceSprintId(item) !== (sprintByReference(filters.sprint)?.id || filters.sprint)) return false;
    if (filters.analyst && item.analistaResponsavel !== filters.analyst) return false;
    if (filters.phase && item.coluna !== filters.phase) return false;
    if (filters.expense && item.tipoDespesa !== filters.expense) return false;
    if (filters.costCenter && item.centroCusto !== filters.costCenter) return false;
    if (filters.unitType && item.tipologia !== filters.unitType) return false;
    if (filters.equipment) {
      const equipmentText = normalizeSearchText([item.equipamento, item.assetName, item.patrimonio, item.fabricante, item.modelo, item.numeroSerie, clinicalEquipmentName(item)].join(" "));
      const equipmentTerms = normalizeSearchText(filters.equipment).split(/\s+/).filter(Boolean);
      if (!equipmentTerms.every((term) => equipmentText.includes(term))) return false;
    }
    return true;
  });
}

function resetMaintenanceFilters() {
  if (activeMaintenanceModule() === "clinical") {
    clinicalFilters = { query: "", sprint: "", analyst: "", phase: "", expense: "", equipment: "", unitType: "" };
  } else {
    maintenanceFilters = { query: "", sprint: "", analyst: "", phase: "", expense: "", costCenter: "", unitType: "" };
  }
}

function maintenanceMetrics(items = maintenanceItems()) {
  const values = maintenanceValueTotals(items);
  const totalValue = values.referencia;
  const active = items.filter((item) => !isMaintenanceClosed(item));
  const closed = items.filter(isMaintenanceClosed);
  const late = active.filter(isMaintenanceLate);
  const economy = Math.max(values.savingTecnico, 0);
  const avgLead = closed.length
    ? closed.reduce((sum, item) => sum + maintenanceLeadTime(item), 0) / closed.length
    : active.reduce((sum, item) => sum + maintenanceLeadTime(item), 0) / Math.max(active.length, 1);
  return { totalValue, active, closed, late, economy, avgLead, values };
}

function maintenanceGroup(items, field, valueMode = "count") {
  const map = new Map();
  items.forEach((item) => {
    const label = maintenanceGroupValue(item, field);
    const current = map.get(label) || { label, count: 0, valor: 0, field, value: label };
    current.count += 1;
    current.valor += valueMode === "economy" ? Math.max(Number(item.valorProposta || 0) - Number(item.valorSalaTecnica || 0), 0) : maintenanceValue(item);
    map.set(label, current);
  });
  return [...map.values()].sort((a, b) => (valueMode === "count" ? b.count - a.count : b.valor - a.valor));
}

function maintenanceGroupValue(item, field) {
  if (field === "equipamento") return clinicalEquipmentName(item) || item.equipamento || item.assetName || "Não informado";
  if (field === "coluna") return item.coluna || "Não informado";
  if (field === "sprint") return maintenanceSprintName(item);
  if (field === "month") return (item.dataInicio || "").slice(0, 7) || "Sem data";
  return item[field] || "Não informado";
}

function maintenanceBarList(items, mode = "count") {
  if (!items.length) return `<div class="empty-state">Sem dados para exibir.</div>`;
  const valueKey = mode === "count" ? "count" : "valor";
  const max = Math.max(...items.map((item) => item[valueKey]), 1);
  const colors = ["var(--blue)", "var(--orange)", "var(--green)", "var(--cyan)", "var(--yellow)"];
  return `
    <div class="bar-list">
      ${items
        .slice(0, 12)
        .map((item, index) => {
          const width = Math.max((item[valueKey] / max) * 100, 2);
          return `
            <button class="bar-row is-clickable" type="button" data-action="open-maintenance-slice" data-field="${item.field}" data-label="${escapeAttribute(item.value)}">
              <span class="bar-label">${item.label}</span>
              <span class="bar-track"><span class="bar-fill" style="width:${width}%; background:${colors[index % colors.length]}"></span></span>
              <span class="bar-value">${mode === "count" ? item.count : money(item.valor)}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderMaintenance() {
  return renderMaintenanceHome();
}

function renderMaintenanceHome() {
  const items = maintenanceItems();
  const metrics = maintenanceMetrics(items);
  const units = new Set(items.map((item) => item.unidadeNome).filter(Boolean)).size;
  const states = new Set(items.map((item) => item.uf).filter(Boolean)).size;
  const labels = maintenanceModuleLabels();
  const assetCount = labels.isClinical ? clinicalAssets().length : 0;
  return `
    ${renderMaintenanceContextToolbar(labels.homeView, labels.title, labels.isClinical ? "Central de demandas de equipamentos, ativos assistenciais, OS, prazo, valor e fase Pipefy" : "Central de demandas prediais e técnicas por unidade, OS, prazo, valor e fase Pipefy", `
      <button class="secondary-action" type="button" data-view="${labels.reportsView}">${labels.reportsLabel}</button>
      <button class="primary-action" type="button" data-action="open-maintenance-demand">+ Nova demanda</button>
    `)}
    <section class="kpi-grid">
      ${kpi("Demandas importadas", String(items.length), `${units} unidades | ${states} estados`, "blue", labels.operationalView)}
      ${kpi("Em fluxo", String(metrics.active.length), `${metrics.late.length} acima do lead time`, metrics.late.length ? "red" : "green", labels.operationalView)}
      ${kpi("Valor Sala Técnica", money(metrics.totalValue), "Somente valor validado pela Sala Técnica", "orange", labels.reportsView)}
      ${kpi(labels.isClinical ? "Ativos em demanda" : "Saving técnico", labels.isClinical ? String(assetCount) : money(metrics.economy), labels.isClinical ? "Equipamentos vinculados às OS" : "Diferença positiva entre proposta e Sala Técnica", "green", labels.executiveView)}
    </section>
    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Esteira operacional</h2>
            <p class="panel-subtitle">Mesmas regras de Kanban, agora com fases do Pipefy de manutenção</p>
          </div>
          <button class="secondary-action" type="button" data-view="${labels.operationalView}">Abrir operacional</button>
        </div>
        ${maintenanceBarList(maintenanceGroup(items, "coluna").map((item) => ({ ...item, label: maintenancePhaseById(item.label).label, value: item.label })))}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Maiores exposições</h2>
            <p class="panel-subtitle">Leitura por tipologia, estado${labels.isClinical ? " e equipamento" : " e centro de custo"}</p>
          </div>
        </div>
        <div class="split-list">
          ${splitItem("Lead time médio", `${number(metrics.avgLead)} dias`)}
          ${splitItem("Postadas/finalizadas", String(metrics.closed.length))}
          ${splitItem("Base de unidades", `${state.unitRegistry?.records?.length || 0} registros`)}
          ${splitItem("Fonte", state.maintenanceBi?.source || labels.source)}
        </div>
      </section>
    </div>
    <div class="content-grid three">
      <section class="panel">
        <h2>Valor Sala Técnica por tipologia</h2>
        ${maintenanceBarList(maintenanceGroup(items, "tipologia", "value"), "value")}
      </section>
      <section class="panel">
        <h2>Demandas por estado</h2>
        ${maintenanceBarList(maintenanceGroup(items, "uf"))}
      </section>
      <section class="panel">
        <h2>${labels.isClinical ? "Equipamentos / ativos" : "Centro de custo"}</h2>
        ${maintenanceBarList(maintenanceGroup(items, labels.isClinical ? "equipamento" : "centroCusto"))}
      </section>
    </div>
  `;
}

function renderMaintenanceOperational() {
  const filtered = filteredMaintenanceDemands();
  const metrics = maintenanceMetrics(filtered);
  const labels = maintenanceModuleLabels();
  const mode = maintenanceViewModeForActiveModule();
  return `
    ${renderMaintenanceContextToolbar(labels.operationalView, labels.operationalTitle, labels.operationalSubtitle, `
      <button class="secondary-action" type="button" data-action="export-maintenance-operational">Exportar relatório</button>
      <button class="secondary-action" type="button" data-action="clear-maintenance-filters">Limpar filtros</button>
      <button class="primary-action" type="button" data-action="open-maintenance-demand">+ Nova demanda</button>
    `)}
    ${renderMaintenanceFilters()}
    <section class="kpi-grid">
      ${kpi("Total no filtro", String(filtered.length), "Demandas visíveis", "blue")}
      ${kpi("Em andamento", String(filtered.filter((item) => ["naoIniciado", "andamento", "validacao", "devolvido"].includes(item.coluna)).length), "Fluxo ativo", "orange")}
      ${kpi("Atrasadas", String(metrics.late.length), "Lead time acima de 23 dias", metrics.late.length ? "red" : "green")}
      ${kpi("Lead time médio", `${number(metrics.avgLead)} d`, "Média do fluxo completo", "blue")}
      ${kpi("Valor Sala Técnica", money(metrics.totalValue), "Carteira filtrada", "green")}
      ${kpi("Saving técnico", money(metrics.economy), "Proposta - Sala Técnica", "green")}
    </section>
    <section class="panel operational-board-panel">
      <div class="panel-header">
        <div>
          <h2>${labels.boardTitle}</h2>
          <p class="panel-subtitle">Clique no card para editar fase, datas, valores e histórico.</p>
        </div>
        <div class="inline-actions">
          <div class="segmented">
            <button class="${mode === "kanban" ? "is-active" : ""}" type="button" data-action="set-maintenance-view" data-mode="kanban">Kanban</button>
            <button class="${mode === "list" ? "is-active" : ""}" type="button" data-action="set-maintenance-view" data-mode="list">Lista</button>
          </div>
          <button class="secondary-action" type="button" data-view="${labels.reportsView}">BI</button>
        </div>
      </div>
      ${mode === "kanban" ? renderMaintenanceKanbanBoard(filtered) : renderMaintenanceList(filtered)}
    </section>
  `;
}

function renderMaintenanceFilters() {
  const items = maintenanceItems();
  const filters = maintenanceFiltersForActiveModule();
  const labels = maintenanceModuleLabels();
  return `
    <section class="panel filter-panel">
      <label class="field">
        <span>${labels.isClinical ? "Buscar OS, unidade, CNPJ, equipamento ou ativo" : "Buscar OS, unidade, CNPJ, obra ou centro de custo"}</span>
        <input data-maintenance-search value="${escapeAttribute(filters.query)}" placeholder="${labels.isClinical ? "Digite OS, unidade, equipamento, patrimônio, cidade ou UF..." : "Digite OS, unidade, cidade, estado, tipologia..."}" />
      </label>
      <div class="filter-grid">
        <label class="field">
          <span>Sprint</span>
          <select data-maintenance-filter="sprint">
            ${maintenanceSprintFilterOptions(filters.sprint)}
          </select>
        </label>
        <label class="field">
          <span>Fase Pipefy</span>
          <select data-maintenance-filter="phase">
            <option value="">Todas</option>
            ${maintenanceColumns.map((column) => `<option value="${column.id}" ${filters.phase === column.id ? "selected" : ""}>${column.label}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Tipo de despesa</span>
          <select data-maintenance-filter="expense">
            ${maintenanceFieldOptions(items.map((item) => item.tipoDespesa), filters.expense)}
          </select>
        </label>
        ${
          labels.isClinical
            ? `
              <label class="field">
                <span>Equipamento / ativo</span>
                <input data-clinical-equipment-search value="${escapeAttribute(filters.equipment || "")}" placeholder="Buscar equipamento, patrimônio ou fabricante..." />
              </label>
            `
            : `
              <label class="field">
                <span>Centro de custo / financeiro</span>
                <select data-maintenance-filter="costCenter">
                  ${maintenanceFieldOptions(items.map((item) => item.centroCusto), filters.costCenter)}
                </select>
              </label>
            `
        }
        <label class="field">
          <span>Tipologia</span>
          <select data-maintenance-filter="unitType">
            ${maintenanceFieldOptions(items.map((item) => item.tipologia), filters.unitType)}
          </select>
        </label>
      </div>
    </section>
  `;
}

function renderMaintenanceKanbanBoard(filtered) {
  return `
    <div class="kanban-board maintenance-kanban-board">
      ${maintenanceColumns
        .map((column) => {
          const items = filtered.filter((item) => item.coluna === column.id);
          const avgPhase = items.length ? items.reduce((sum, item) => sum + maintenancePhaseDays(item), 0) / items.length : 0;
          return `
            <section class="kanban-column maintenance-column" data-column="${column.id}" data-tone="${column.tone}">
              <header>
                <h2>${column.label}</h2>
                <span class="maintenance-column-counter">${items.length} | ${number(avgPhase)} d</span>
              </header>
              <div class="demand-list">
                ${items.length ? items.map(renderMaintenanceCard).join("") : `<div class="empty-state kanban-empty">Nenhuma demanda</div>`}
              </div>
            </section>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderMaintenanceCard(item) {
  const value = maintenanceValue(item);
  const labels = maintenanceModuleLabels();
  const equipmentName = clinicalEquipmentName(item);
  const sprintName = maintenanceSprintName(item);
  const sprintFlag = sprintFlagLabel(sprintName);
  const timing = isMaintenanceLate(item)
    ? { tone: "red", label: `Lead time ${maintenanceLeadTime(item)} d`, dateLabel: "Acima da referência" }
    : { tone: "green", label: `Fase há ${maintenancePhaseDays(item)} d`, dateLabel: `Lead time ${maintenanceLeadTime(item)} d` };
  return `
    <article class="demand-card maintenance-card" data-status="${item.coluna}" data-action="open-maintenance-card" data-id="${item.id}" role="button" tabindex="0">
      <div class="demand-card-top">
        <span class="demand-code">${item.ordemServico || item.id}</span>
        <div class="demand-card-actions">
          <span class="sprint-flag" title="${escapeAttribute(sprintName)}">${sprintFlag}</span>
          <span class="priority-pill">${item.tipoDespesa || "OPEX"}</span>
        </div>
      </div>
      <h3>${item.titulo}</h3>
      <div class="demand-card-meta">
        <span>${item.unidadeNome}</span>
        <b>${item.uf || "UF"}</b>
      </div>
      ${labels.isClinical ? `<span class="maintenance-asset-label">${equipmentName || "Equipamento a vincular"}</span>` : ""}
      <span class="demand-card-date">${dateText(item.dataInicio)} → ${item.dataFim ? dateText(item.dataFim) : "em aberto"}</span>
      <div class="demand-card-alert" data-tone="${timing.tone}">
        <i></i>
        <strong>${timing.label}</strong>
      </div>
      <div class="maintenance-card-foot">
        <span>${labels.isClinical ? item.patrimonio || item.numeroSerie || item.centroCusto : item.centroCusto}</span>
        <strong>${money(value)}</strong>
      </div>
    </article>
  `;
}

function renderMaintenanceList(filtered) {
  if (!filtered.length) return `<div class="empty-state">Nenhuma demanda encontrada no filtro atual.</div>`;
  const labels = maintenanceModuleLabels();
  return `
    <div class="table-wrap">
      <table class="data-table operational-list-table">
        <thead>
          <tr>
            <th>OS</th>
            <th>Obra / unidade</th>
            <th>Tipologia</th>
            <th>Fase</th>
            <th>Sprint</th>
            ${labels.isClinical ? `<th>Equipamento</th>` : ""}
            <th>Início</th>
            <th>Lead time</th>
            <th class="numeric">Valor SLT</th>
          </tr>
        </thead>
        <tbody>
          ${filtered
            .slice(0, 300)
            .map(
              (item) => `
                <tr data-action="open-maintenance-card" data-id="${item.id}" role="button" tabindex="0">
                  <td><strong>${item.ordemServico || item.id}</strong><br /><span class="muted">${item.codigoOrigem || "sem código"}</span></td>
                  <td><strong>${item.titulo}</strong><br /><span class="muted">${item.unidadeNome} | ${item.uf || "UF não informada"}</span></td>
                  <td>${item.tipologia}</td>
                  <td><span class="status-dot" data-status="${item.coluna}"></span>${maintenanceStatusLabel(item)}</td>
                  <td>${maintenanceSprintName(item)}</td>
                  ${labels.isClinical ? `<td>${clinicalEquipmentName(item) || "A vincular"}<br /><span class="muted">${item.patrimonio || item.numeroSerie || ""}</span></td>` : ""}
                  <td>${dateText(item.dataInicio)}</td>
                  <td>${maintenanceLeadTime(item)} d</td>
                  <td class="numeric">${money(maintenanceValue(item))}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
      ${filtered.length > 300 ? `<p class="muted">Mostrando 300 de ${filtered.length} registros. Use a busca para refinar.</p>` : ""}
    </div>
  `;
}

function renderMaintenanceReports() {
  const items = filteredMaintenanceDemands();
  const metrics = maintenanceMetrics(items);
  const labels = maintenanceModuleLabels();
  return `
    ${renderMaintenanceContextToolbar(labels.reportsView, labels.reportsLabel, labels.isClinical ? "Visão consolidada de OS clínicas, ativos, fases, unidades, valores e concentração por equipamento" : "Visão consolidada de custos, fases, unidades e concentração da manutenção", `
      <button class="secondary-action" type="button" data-view="${labels.operationalView}">Kanban</button>
      <button class="primary-action" type="button" data-action="open-maintenance-demand">+ Nova demanda</button>
    `)}
    ${renderMaintenanceFilters()}
    <section class="kpi-grid">
      ${kpi("Valor Sala Técnica", money(metrics.totalValue), `${items.length} demandas`, "blue")}
      ${kpi("Planejadas", String(items.filter((item) => item.coluna === "naoIniciado").length), "Não iniciadas", "orange")}
      ${kpi("Entregues", String(metrics.closed.length), "Postadas, finalizadas ou arquivadas", "green")}
      ${kpi("On hold", String(items.filter((item) => ["validacao", "devolvido"].includes(item.coluna)).length), "Validação/devolução", "red")}
    </section>
    <div class="content-grid">
      <section class="panel">
        <h2>${labels.isClinical ? "Custo por equipamento" : "Custo por centro de custo"}</h2>
        ${maintenanceBarList(maintenanceGroup(items, labels.isClinical ? "equipamento" : "centroCusto", "value"), "value")}
      </section>
      <section class="panel">
        <h2>Valor Sala Técnica por tipologia</h2>
        ${maintenanceBarList(maintenanceGroup(items, "tipologia", "value"), "value")}
      </section>
    </div>
    <div class="content-grid">
      <section class="panel">
        <h2>Nº de demandas por fase</h2>
        ${maintenanceBarList(maintenanceGroup(items, "coluna").map((item) => ({ ...item, label: maintenancePhaseById(item.label).label, value: item.label })))}
      </section>
      <section class="panel">
        <h2>Base histórica</h2>
        ${renderMaintenanceMiniTable(items.slice(0, 12))}
      </section>
    </div>
  `;
}

function renderMaintenanceTimeline() {
  const items = filteredMaintenanceDemands();
  const values = maintenanceValueTotals(items);
  const metrics = maintenanceMetrics(items);
  const labels = maintenanceModuleLabels();
  const showNegotiated = maintenanceShowsNegotiated(items);
  const byMonth = maintenanceTimelineSeries(items, (item) => (item.dataInicio || "").slice(0, 7), "month");
  const bySprint = maintenanceTimelineSeries(items, maintenanceSprintName, "sprint");
  const accumulated = maintenanceAccumulatedRows(byMonth);
  const topMonth = byMonth.slice().sort((a, b) => b.valorSalaTecnica - a.valorSalaTecnica)[0];
  return `
    ${renderMaintenanceContextToolbar(labels.timelineView, labels.isClinical ? "Linha do Tempo Eng. Clínica" : "Linha do Tempo Manutenção", "Evolução mês a mês e por sprint, com leitura acumulada de custos", "")}
    ${renderMaintenanceFilters()}
    <section class="maintenance-exec-kpi-grid">
      ${maintenanceExecutiveKpi("Proposta inicial", money(values.proposta), `${items.length} demandas`, "Valor bruto informado na entrada", "blue")}
      ${maintenanceExecutiveKpi("Valor Sala Técnica", money(values.salaTecnica), money(values.savingTecnico), "Economia técnica sobre proposta", "orange")}
      ${showNegotiated ? maintenanceExecutiveKpi("Valor Negociado CAPEX", money(values.negociado), money(values.savingNegociado), "Somente demandas CAPEX", "green") : ""}
      ${maintenanceExecutiveKpi("Maior mês SLT", topMonth?.label || "—", topMonth ? money(topMonth.valorSalaTecnica) : "—", topMonth ? `${topMonth.count} demandas` : "Sem leitura", "red", "month", topMonth?.value)}
    </section>
    <div class="content-grid">
      <section class="panel">
        <h2>Evolução mensal dos valores</h2>
        <p class="panel-subtitle">Proposta Inicial, Sala Técnica${showNegotiated ? " e Negociado CAPEX" : ""} por mês</p>
        ${renderMaintenanceTimelineChart(byMonth, { showNegotiated })}
      </section>
      <section class="panel">
        <h2>Acumulado</h2>
        <p class="panel-subtitle">Curva acumulada de demandas e valor Sala Técnica</p>
        ${renderMaintenanceCumulativeChart(accumulated)}
      </section>
    </div>
    <section class="maintenance-exec-kpi-grid">
      ${maintenanceExecutiveKpi("Demandas no período", String(items.length), `${byMonth.length} mês(es)`, "Registros do filtro atual", "blue")}
      ${maintenanceExecutiveKpi("Média mensal SLT", money(values.salaTecnica / Math.max(byMonth.length, 1)), `${number(items.length / Math.max(byMonth.length, 1))} demandas/mês`, "Valor médio por mês", "orange")}
      ${maintenanceExecutiveKpi("Lead time médio", `${number(metrics.avgLead)} d`, `${metrics.late.length} atrasadas`, "Referência: 23 dias", metrics.avgLead > 23 ? "red" : "green")}
      ${maintenanceExecutiveKpi("Saving técnico", money(values.savingTecnico), `${number(values.proposta ? (values.savingTecnico / values.proposta) * 100 : 0, 1)}%`, "Proposta Inicial - Sala Técnica", values.savingTecnico >= 0 ? "green" : "red")}
    </section>
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Demandas e valores por sprint</h2>
          <p class="panel-subtitle">Leitura operacional com volume e Valor Sala Técnica</p>
        </div>
      </div>
      ${renderMaintenanceDualBarList(bySprint.slice().sort((a, b) => b.valor - a.valor), { valueMode: "both", field: "sprint" })}
    </section>
    <section class="panel">
      <h2>Histórico acessível</h2>
      ${renderMaintenanceMiniTable(items.slice(0, 40))}
    </section>
  `;
}

function maintenanceTimelineSeries(items, keyFn, field = "") {
  const map = new Map();
  items.forEach((item) => {
    const value = keyFn(item) || "Sem data";
    const currentField = field || (value.includes("-") ? "month" : "sprint");
    const label = value === "Sem data" ? value : currentField === "month" ? maintenanceMonthLabel(value) : value.replace("-", "/");
    const current = map.get(value) || {
      label,
      value,
      field: currentField,
      count: 0,
      valor: 0,
      valorProposta: 0,
      valorSalaTecnica: 0,
      valorNegociado: 0,
    };
    current.count += 1;
    current.valor += maintenanceValue(item);
    current.valorProposta += maintenanceMoneyValue(item, "valorProposta");
    current.valorSalaTecnica += maintenanceMoneyValue(item, "valorSalaTecnica");
    current.valorNegociado += maintenanceMoneyValue(item, "valorNegociado");
    map.set(value, current);
  });
  return [...map.values()].sort((a, b) => String(a.value).localeCompare(String(b.value), "pt-BR"));
}

function maintenanceAccumulatedRows(rows) {
  let count = 0;
  let valor = 0;
  let valorProposta = 0;
  let valorSalaTecnica = 0;
  let valorNegociado = 0;
  return rows.map((row) => {
    count += row.count;
    valor += row.valor;
    valorProposta += row.valorProposta || 0;
    valorSalaTecnica += row.valorSalaTecnica || 0;
    valorNegociado += row.valorNegociado || 0;
    return { ...row, count, valor, valorProposta, valorSalaTecnica, valorNegociado };
  });
}

function maintenanceValueForItems(items, key = "") {
  if (key) return items.reduce((sum, item) => sum + maintenanceMoneyValue(item, key), 0);
  return items.reduce((sum, item) => sum + maintenanceValue(item), 0);
}

function maintenancePrimaryValueForItems(items) {
  return maintenanceValueForItems(items, "valorSalaTecnica") || maintenanceValueForItems(items);
}

function maintenanceGroupRows(items, field, options = {}) {
  const rows = maintenanceGroup(items, field, options.valueMode || "value");
  return rows.map((row) => ({
    ...row,
    label: options.labelFor ? options.labelFor(row) : row.label,
    value: row.value,
    field,
  }));
}

function maintenancePhaseRows(items) {
  return maintenanceColumns.map((column) => {
    const columnItems = items.filter((item) => item.coluna === column.id);
    const count = columnItems.length;
    return {
      label: column.label,
      value: column.id,
      field: "coluna",
      count,
      valor: maintenanceValueForItems(columnItems),
      avgLead: columnItems.reduce((sum, item) => sum + maintenancePhaseDays(item), 0) / Math.max(count, 1),
    };
  }).filter((row) => row.count);
}

function maintenanceExecutiveKpi(title, primary, secondary, note, tone = "blue", field = "", label = "") {
  const attrs = field && label ? `type="button" data-action="open-maintenance-slice" data-field="${field}" data-label="${escapeAttribute(label)}"` : "";
  const tag = attrs ? "button" : "article";
  return `
    <${tag} class="maintenance-exec-kpi" data-tone="${tone}" ${attrs}>
      <span>${title}</span>
      <strong>${primary}</strong>
      <b>${secondary}</b>
      <small>${note}</small>
    </${tag}>
  `;
}

function renderMaintenanceTimelineChart(rows, options = {}) {
  if (!rows.length) return `<div class="empty-state">Sem dados mensais para o filtro atual.</div>`;
  const showNegotiated = options.showNegotiated !== false;
  const maxValue = Math.max(...rows.flatMap((row) => [row.valorProposta || 0, row.valorSalaTecnica || 0, showNegotiated ? row.valorNegociado || 0 : 0]), 1);
  return `
    <div class="maintenance-timeline-chart">
      <div class="timeline-legend" aria-label="Legenda do gráfico mensal">
        <span><i data-series="proposal"></i>Proposta Inicial</span>
        <span><i data-series="slt"></i>Sala Técnica</span>
        ${showNegotiated ? `<span><i data-series="negotiated"></i>Negociado CAPEX</span>` : ""}
      </div>
      ${rows
        .map(
          (row) => `
            <button type="button" data-action="open-maintenance-slice" data-field="${row.field}" data-label="${escapeAttribute(row.value)}">
              <span class="timeline-period">${row.label}</span>
              <span class="timeline-value-stack">
                <span data-series="proposal">
                  <b>Proposta</b>
                  <i style="width:${Math.max(((row.valorProposta || 0) / maxValue) * 100, 3)}%"></i>
                  <em>${money(row.valorProposta || 0)}</em>
                </span>
                <span data-series="slt">
                  <b>SLT</b>
                  <i style="width:${Math.max(((row.valorSalaTecnica || 0) / maxValue) * 100, 3)}%"></i>
                  <em>${money(row.valorSalaTecnica || 0)}</em>
                </span>
                ${showNegotiated ? `
                  <span data-series="negotiated">
                    <b>Negociado CAPEX</b>
                    <i style="width:${Math.max(((row.valorNegociado || 0) / maxValue) * 100, 3)}%"></i>
                    <em>${money(row.valorNegociado || 0)}</em>
                  </span>
                ` : ""}
              </span>
              <span class="timeline-count">
                <strong>${row.count}</strong>
                <small>demandas</small>
              </span>
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMaintenanceCumulativeChart(rows) {
  if (!rows.length) return `<div class="empty-state">Sem acumulado para o filtro atual.</div>`;
  const maxValue = Math.max(...rows.map((row) => row.valorSalaTecnica || row.valor), 1);
  return `
    <div class="maintenance-cumulative-chart">
      ${rows
        .map(
          (row) => `
            <button type="button" style="--height:${Math.max(((row.valorSalaTecnica || row.valor) / maxValue) * 100, 8)}%" data-action="open-maintenance-slice" data-field="${row.field}" data-label="${escapeAttribute(row.value)}">
              <strong>${money(row.valorSalaTecnica || row.valor)}</strong>
              <i></i>
              <span>${row.label}</span>
              <small>${row.count} demandas</small>
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMaintenanceDualBarList(rows, options = {}) {
  if (!rows.length) return `<div class="empty-state">Sem dados para exibir.</div>`;
  const maxCount = Math.max(...rows.map((row) => row.count), 1);
  const maxValue = Math.max(...rows.map((row) => row.valor), 1);
  const field = options.field || "";
  return `
    <div class="maintenance-dual-bars">
      ${rows
        .slice(0, options.limit || 12)
        .map((row) => {
          const rowField = field || row.field;
          return `
            <button type="button" data-action="open-maintenance-slice" data-field="${rowField}" data-label="${escapeAttribute(row.value)}">
              <span class="dual-label">${row.label}</span>
              <span class="dual-bars">
                <i class="is-count" style="width:${Math.max((row.count / maxCount) * 100, 3)}%"></i>
                <i class="is-value" style="width:${Math.max((row.valor / maxValue) * 100, 3)}%"></i>
              </span>
              <span class="dual-metrics">
                <strong>${row.count}</strong>
                <small>${money(row.valor)}</small>
              </span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderMaintenanceExecutive() {
  const items = filteredMaintenanceDemands();
  const metrics = maintenanceMetrics(items);
  const values = maintenanceValueTotals(items);
  const labels = maintenanceModuleLabels();
  const showNegotiated = maintenanceShowsNegotiated(items);
  const summary = labels.isClinical ? {} : maintenanceSummary();
  const summaryRows = labels.isClinical ? [] : maintenanceSummaryCostRows();
  const totalValue = values.salaTecnica || values.referencia;
  const closed = items.filter(isMaintenanceClosed);
  const inSla = closed.filter((item) => maintenanceLeadTime(item) <= 23);
  const activeValue = maintenancePrimaryValueForItems(metrics.active);
  const closedValue = maintenancePrimaryValueForItems(closed);
  const lateValue = maintenancePrimaryValueForItems(metrics.late);
  const topItem = items.slice().sort((a, b) => maintenanceValue(b) - maintenanceValue(a))[0];
  const unitCount = new Set(items.map((item) => item.unidadeNome).filter(Boolean)).size;
  const assetCount = labels.isClinical ? clinicalAssets().length : 0;
  const topStates = maintenanceGroupRows(items, "uf").slice(0, 12);
  const typologyRows = maintenanceGroupRows(items, "tipologia").slice(0, 12);
  const phaseRows = maintenancePhaseRows(items);
  const expenseRows = maintenanceGroupRows(items, "tipoDespesa").slice(0, 8);
  const costCenterRows = maintenanceGroupRows(items, labels.isClinical ? "equipamento" : "centroCusto").slice(0, 10);
  const economyRows = maintenanceGroupRows(items, "tipologia", { valueMode: "economy" }).slice(0, 10);
  return `
    ${renderMaintenanceContextToolbar(labels.executiveView, labels.isClinical ? "Executiva Eng. Clínica" : "Executiva Manutenção", labels.isClinical ? "Resumo executivo por ativo, unidade, estado, tipologia, fase e valor da carteira clínica" : "Resumo executivo para tomada de decisão por unidade, estado e tipologia", "")}
    ${renderMaintenanceFilters()}
    <section class="maintenance-exec-hero">
      <div class="maintenance-exec-main">
        <span class="eyebrow">Valor Sala Técnica</span>
        <strong>${money(totalValue)}</strong>
        <p>${items.length} demandas no filtro. Proposta inicial ${money(values.proposta)}, ${showNegotiated ? `negociado CAPEX ${money(values.negociado)}, ` : ""}${metrics.late.length} com lead time acima de 23 dias.</p>
      </div>
      <div class="maintenance-exec-tiles">
        <article>
          <span>${labels.isClinical ? "Fonte Effort/Pipefy" : "CAPEX aprovado"}</span>
          <strong>${labels.isClinical ? `${assetCount} ativos` : summary.capexAprovado ? money(summary.capexAprovado) : "—"}</strong>
          <small>${labels.isClinical ? "Base Effort preparada" : "Aba RESUMO"}</small>
        </article>
        <article>
          <span>${labels.isClinical ? "OS clínicas" : "Total realizado"}</span>
          <strong>${labels.isClinical ? String(items.length) : summary.totalRealizado ? money(summary.totalRealizado) : money(totalValue)}</strong>
          <small>${labels.isClinical ? money(totalValue) : summary.investimentosExtrasTotal ? `${money(summary.investimentosExtrasTotal)} em extras` : "Filtro atual"}</small>
        </article>
        <article>
          <span>${labels.isClinical ? "Unidades impactadas" : "Saldo manutenção"}</span>
          <strong>${labels.isClinical ? String(unitCount) : summary.saldoManutencao ? money(summary.saldoManutencao) : "—"}</strong>
          <small>${labels.isClinical ? `${new Set(items.map((item) => item.uf).filter(Boolean)).size} estados` : summary.capexAprovado ? `${number((summary.saldoManutencao / summary.capexAprovado) * 100, 1)}% do CAPEX` : "Sem base"}</small>
        </article>
        <article>
          <span>Maior demanda</span>
          <strong>${topItem?.titulo || "—"}</strong>
          <small>${topItem ? `${money(maintenanceValue(topItem))} | ${topItem.unidadeNome}` : "Sem leitura"}</small>
        </article>
      </div>
    </section>
    <section class="maintenance-exec-kpi-grid">
      ${maintenanceExecutiveKpi("Valor da Proposta Inicial", money(values.proposta), `${items.length} demandas`, "Entrada original da proposta", "blue")}
      ${maintenanceExecutiveKpi("Valor Sala Técnica", money(values.salaTecnica), `${number(values.proposta ? (values.salaTecnica / values.proposta) * 100 : 0, 1)}% da proposta`, "Leitura técnica validada", "orange")}
      ${showNegotiated ? maintenanceExecutiveKpi("Valor Negociado CAPEX", money(values.negociado), `${number(values.capexProposta ? (values.negociado / values.capexProposta) * 100 : 0, 1)}% da proposta CAPEX`, "Fechamento com fornecedor", "green") : ""}
      ${maintenanceExecutiveKpi("Saving técnico", money(values.savingTecnico), `${number(values.proposta ? (values.savingTecnico / values.proposta) * 100 : 0, 1)}%`, "Proposta Inicial - Sala Técnica", values.savingTecnico >= 0 ? "green" : "red")}
    </section>
    <section class="maintenance-exec-kpi-grid">
      ${maintenanceExecutiveKpi("Em fluxo", String(metrics.active.length), money(activeValue), "Não iniciada, andamento, validação ou devolução", "orange")}
      ${maintenanceExecutiveKpi("Concluídas", String(closed.length), money(closedValue), "Postadas, arquivadas ou finalizadas", "green")}
      ${maintenanceExecutiveKpi("Lead time crítico", String(metrics.late.length), money(lateValue), "Acima de 23 dias", metrics.late.length ? "red" : "green")}
      ${maintenanceExecutiveKpi("Unidades impactadas", String(unitCount), `${new Set(items.map((item) => item.uf).filter(Boolean)).size} estados`, `${number((inSla.length / Math.max(closed.length, 1)) * 100)}% entregas no prazo`, "blue")}
    </section>
    <div class="content-grid">
      <section class="panel">
        <h2>Demandas e valores por tipologia</h2>
        <p class="panel-subtitle">Barras superiores = volume; barras inferiores = valor</p>
        ${renderMaintenanceDualBarList(typologyRows)}
      </section>
      <section class="panel">
        <h2>Demandas e valores por estado</h2>
        <p class="panel-subtitle">Concentração geográfica da carteira</p>
        ${renderMaintenanceStateGrid(topStates)}
      </section>
    </div>
    <div class="content-grid">
      <section class="panel">
        <h2>${labels.isClinical ? "Resumo da carteira clínica" : "Resumo CAPEX manutenção"}</h2>
        <p class="panel-subtitle">${labels.isClinical ? "Leitura executiva enquanto a base de equipamentos Effort não é importada" : "Dados da aba RESUMO do relatório"}</p>
        <div class="maintenance-summary-strip">
          ${splitItem("CAPEX aprovado", summary.capexAprovado ? money(summary.capexAprovado) : "—")}
          ${splitItem("Total realizado", summary.totalRealizado ? money(summary.totalRealizado) : "—")}
          ${splitItem("Saldo atual", summary.saldoManutencao ? money(summary.saldoManutencao) : "—")}
          ${splitItem("Investimentos extras", summary.investimentosExtrasTotal ? money(summary.investimentosExtrasTotal) : "—")}
        </div>
      </section>
      <section class="panel">
        <h2>Realizado por linha</h2>
        <p class="panel-subtitle">Composição da aba RESUMO</p>
        ${summaryRows.length ? barList(summaryRows, "valor", money) : `<div class="empty-state">Sem linhas do resumo importadas.</div>`}
      </section>
    </div>
    <div class="content-grid">
      <section class="panel">
        <h2>Fases Pipefy</h2>
        <p class="panel-subtitle">Volume e valor por bucket operacional</p>
        ${renderMaintenanceDualBarList(phaseRows)}
      </section>
      <section class="panel">
        <h2>Tipo de despesa</h2>
        <p class="panel-subtitle">Distribuição executiva entre CAPEX e OPEX</p>
        ${renderMaintenanceDualBarList(expenseRows)}
      </section>
    </div>
    <div class="content-grid">
      <section class="panel">
        <h2>${labels.isClinical ? "Diagnóstico por equipamento" : "Diagnóstico por centro de custo"}</h2>
        <p class="panel-subtitle">Onde estão concentrados volume e custo</p>
        ${renderMaintenanceDualBarList(costCenterRows)}
      </section>
      <section class="panel">
        <h2>Performance de economia</h2>
        <p class="panel-subtitle">Saving técnico por tipologia</p>
        ${renderMaintenanceDualBarList(economyRows)}
      </section>
    </div>
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Carteira executiva</h2>
          <p class="panel-subtitle">Clique em qualquer linha para abrir o card da demanda</p>
        </div>
      </div>
      ${renderMaintenanceMiniTable(items.slice(0, 35))}
    </section>
  `;
}

function renderMaintenanceDiagnostic() {
  return renderMaintenanceExecutive();
}

function renderMaintenancePerformance() {
  return renderMaintenanceExecutive();
}

function renderMaintenanceStateGrid(rows) {
  if (!rows.length) return `<div class="empty-state">Sem estados registrados no filtro atual.</div>`;
  const maxValue = Math.max(...rows.map((row) => row.valor), 1);
  return `
    <div class="maintenance-state-grid">
      ${rows
        .map(
          (item) => `
            <button type="button" style="--weight:${Math.max((item.valor / maxValue) * 100, 8)}%" data-action="open-maintenance-slice" data-field="uf" data-label="${escapeAttribute(item.value)}">
              <strong>${item.label || "Sem UF"}</strong>
              <span>${item.count} demandas</span>
              <small>${money(item.valor)}</small>
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMaintenanceSettings() {
  const units = maintenanceUnits();
  const labels = maintenanceModuleLabels();
  const assets = clinicalAssets();
  return `
    ${renderMaintenanceContextToolbar(labels.settingsView, labels.settingsTitle, labels.settingsSubtitle, `
      <button class="primary-action" type="button" data-action="open-maintenance-demand">+ Nova demanda</button>
    `)}
    <div class="content-grid">
      <section class="panel">
        <h2>Fases Pipefy configuradas</h2>
        <div class="flow-steps">
          ${maintenanceColumns.map((column, index) => flowStep(String(index + 1), column.label, `Aliases: ${column.pipefy.join(", ")}`)).join("")}
        </div>
      </section>
      <section class="panel">
        <h2>Parâmetros de tempo</h2>
        <div class="split-list">
          ${splitItem("Lead time referência", "23 dias")}
          ${splitItem("Alerta de fase", "Contador individual por bucket")}
          ${splitItem("Fonte de unidades", `${state.unitRegistry?.records?.length || 0} registros`)}
          ${splitItem("Fonte BI", state.maintenanceBi?.source || labels.source)}
        </div>
      </section>
    </div>
    ${
      labels.isClinical
        ? `
          <section class="panel">
            <div class="panel-header">
              <div>
                <h2>Parque tecnológico</h2>
                <p class="panel-subtitle">Estrutura pronta para receber a lista do Effort e vincular OS ao histórico do equipamento.</p>
              </div>
              <span class="tag">${assets.length} ativo(s)</span>
            </div>
            ${renderClinicalAssetRegistry(assets)}
          </section>
        `
        : ""
    }
    <section class="panel">
      <h2>Cadastro de unidades</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Centro</th><th>Unidade</th><th>Tipo</th><th>Município</th><th>CNPJ</th><th>CEP</th></tr></thead>
          <tbody>
            ${units
              .slice(0, 120)
              .map((unit) => `<tr><td>${unit.centro || "—"}</td><td><strong>${unit.nome}</strong></td><td>${unit.tipo}</td><td>${unit.municipio || "—"}</td><td>${unit.cnpj || "—"}</td><td>${unit.cep || "—"}</td></tr>`)
              .join("")}
          </tbody>
        </table>
      </div>
      <p class="muted">Mostrando 120 de ${units.length} unidades. Use o assistente de busca no cadastro de demanda para localizar rapidamente.</p>
    </section>
  `;
}

function clinicalAssets() {
  const seen = new Map();
  clinicalItems().forEach((item, index) => {
    const name = clinicalEquipmentName(item) || "Equipamento a vincular";
    const key = normalizeSearchText([item.unidadeNome, name, item.patrimonio, item.numeroSerie].join("|")) || `asset-${index}`;
    const current = seen.get(key) || {
      id: key,
      equipamento: name,
      unidadeNome: item.unidadeNome || "Unidade não informada",
      patrimonio: item.patrimonio || item.numeroSerie || "",
      fabricante: item.fabricante || "",
      modelo: item.modelo || "",
      tipologia: item.tipologia || "Não informada",
      os: 0,
      valor: 0,
    };
    current.os += 1;
    current.valor += maintenanceValue(item);
    seen.set(key, current);
  });
  return [...seen.values()].sort((a, b) => b.os - a.os || b.valor - a.valor);
}

function renderClinicalAssetRegistry(assets) {
  if (!assets.length) {
    return `
      <div class="empty-state">
        Nenhum equipamento vinculado ainda. Ao criar uma OS clínica, informe unidade e equipamento para começar o histórico do ativo.
      </div>
    `;
  }
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Equipamento</th>
            <th>Unidade</th>
            <th>Patrimônio / série</th>
            <th>Tipologia</th>
            <th>OS vinculadas</th>
            <th class="numeric">Valor SLT</th>
          </tr>
        </thead>
        <tbody>
          ${assets
            .slice(0, 120)
            .map(
              (asset) => `
                <tr>
                  <td><strong>${asset.equipamento}</strong><br /><span class="muted">${asset.fabricante || "Fabricante a informar"} ${asset.modelo || ""}</span></td>
                  <td>${asset.unidadeNome}</td>
                  <td>${asset.patrimonio || "A informar"}</td>
                  <td>${asset.tipologia}</td>
                  <td>${asset.os}</td>
                  <td class="numeric">${money(asset.valor)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function maintenanceBubbleList(items) {
  if (!items.length) return `<div class="empty-state">Sem dados para exibir.</div>`;
  const max = Math.max(...items.map((item) => item.valor), 1);
  return `
    <div class="maintenance-bubble-list">
      ${items.slice(0, 10).map((item) => {
        const size = 42 + (item.valor / max) * 72;
        return `
          <button type="button" style="width:${size}px;height:${size}px" data-action="open-maintenance-slice" data-field="${item.field}" data-label="${escapeAttribute(item.value)}">
            <strong>${item.count}</strong>
            <span>${item.label}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function maintenanceStackedBy(items, field) {
  const groups = maintenanceGroup(items, field).slice(0, 8);
  if (!groups.length) return `<div class="empty-state">Sem dados para exibir.</div>`;
  const colors = ["var(--blue)", "var(--green)", "var(--orange)", "var(--red)", "var(--cyan)", "var(--yellow)", "#586a85", "#9aaaba"];
  return `
    <div class="maintenance-stack-list">
      ${groups
        .map((group) => {
          const subset = items.filter((item) => (item[field] || "Não informado") === group.value);
          const total = Math.max(subset.length, 1);
          return `
            <button type="button" data-action="open-maintenance-slice" data-field="${field}" data-label="${escapeAttribute(group.value)}">
              <span>${group.label}</span>
              <i>
                ${maintenanceColumns
                  .map((column, index) => {
                    const count = subset.filter((item) => item.coluna === column.id).length;
                    return count ? `<b style="width:${(count / total) * 100}%;background:${colors[index % colors.length]}">${number((count / total) * 100)}%</b>` : "";
                  })
                  .join("")}
              </i>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderMaintenanceMiniTable(items) {
  if (!items.length) return `<div class="empty-state">Sem registros no filtro atual.</div>`;
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>OS</th>
            <th>Unidade</th>
            <th>Fase</th>
            <th>Tipologia</th>
            <th>Lead time</th>
            <th class="numeric">Valor SLT</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
                <tr data-action="open-maintenance-card" data-id="${item.id}" role="button" tabindex="0">
                  <td><strong>${item.ordemServico || item.id}</strong></td>
                  <td>${item.unidadeNome}<br /><span class="muted">${item.uf || ""} ${item.titulo}</span></td>
                  <td>${maintenanceStatusLabel(item)}</td>
                  <td>${item.tipologia}</td>
                  <td>${maintenanceLeadTime(item)} d</td>
                  <td class="numeric">${money(maintenanceValue(item))}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function maintenanceAnalystOptions(selected = "") {
  const analysts = [...new Set([...uniqueAnalysts(), "Thalles", "Skarth", "Rosa", "Herbson", "Leonardo", "Robério"].filter(Boolean))];
  return [`<option value="">A definir</option>`]
    .concat(analysts.map((analyst) => `<option value="${analyst}" ${analyst === selected ? "selected" : ""}>${analyst}</option>`))
    .join("");
}

function findMaintenanceUnitByTypedSearch(value) {
  const terms = normalizeSearchText(value).split(/\s+/).filter(Boolean);
  if (!terms.length) return null;
  return maintenanceUnits().find((unit) => {
    const location = unitLocationFields(unit);
    const text = normalizeSearchText([unit.nome, unit.tipo, unit.cnpj, unit.cep, unit.endereco, unit.municipio, location.cidade, location.uf, location.regiao, unit.centro].join(" "));
    return terms.every((term) => text.includes(term));
  });
}

function sharedUnitSearchLabel(unit) {
  return `${unit.nome} | ${unit.tipo} | ${unitLocationLabel(unit)}`;
}

function splitUnitMunicipioUf(value = "") {
  const text = String(value || "").trim();
  const match = text.match(/^(.+?)\s*(?:\/|-)\s*([A-Z]{2})$/i);
  if (!match) return { cidade: text, uf: "" };
  return { cidade: match[1].trim(), uf: match[2].toUpperCase() };
}

function regionFromUf(uf = "") {
  const stateCode = String(uf || "").trim().toUpperCase();
  if (["AC", "AM", "AP", "PA", "RO", "RR", "TO"].includes(stateCode)) return "Norte";
  if (["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"].includes(stateCode)) return "Nordeste";
  if (["DF", "GO", "MS", "MT"].includes(stateCode)) return "Centro Oeste";
  if (["ES", "MG", "RJ", "SP"].includes(stateCode)) return "Sudeste";
  if (["PR", "RS", "SC"].includes(stateCode)) return "Sul";
  return "";
}

function unitLocationFields(unit = {}) {
  const location = splitUnitMunicipioUf(unit.municipio || unit.cidade || "");
  const cidade = String(unit.cidade || location.cidade || "").trim();
  const uf = String(unit.uf || location.uf || "").trim().toUpperCase();
  const regiao = String(unit.regiao || unit.regional || regionFromUf(uf) || "").trim();
  return { cidade, uf, regiao };
}

function unitLocationLabel(unit = {}) {
  const location = unitLocationFields(unit);
  return [location.cidade, location.uf].filter(Boolean).join("/") || unit.cep || "sem cidade";
}

function exactMaintenanceUnitBySearchLabel(value = "") {
  const text = normalizeSearchText(value).trim();
  if (!text) return null;
  return maintenanceUnits().find((unit) => {
    const labels = [
      sharedUnitSearchLabel(unit),
      unit.nome,
      [unit.nome, unit.tipo, unitLocationLabel(unit)].filter(Boolean).join(" | "),
    ];
    return labels.some((label) => normalizeSearchText(label).trim() === text);
  });
}

function updateSharedUnitSearch(input, resultsSelector) {
  const form = input.closest("form");
  const hidden = form?.querySelector('[name="unidadeId"]');
  const results = form?.querySelector(resultsSelector);
  if (hidden) hidden.value = "";
  if (results) results.innerHTML = maintenanceUnitSearchResults(input.value);
}

function updateMaintenanceUnitSearch(input) {
  updateSharedUnitSearch(input, "[data-maintenance-unit-results]");
}

function updateDemandUnitSearch(input) {
  updateSharedUnitSearch(input, "[data-demand-unit-results]");
}

function updateWorkUnitSearch(input) {
  const form = input.closest("form");
  const exactUnit = exactMaintenanceUnitBySearchLabel(input.value);
  if (exactUnit) {
    const hidden = form?.querySelector('[name="unidadeId"]');
    const results = form?.querySelector("[data-work-unit-results]");
    if (hidden) hidden.value = exactUnit.id;
    applyUnitToWorkForm(form, exactUnit);
    if (results) results.innerHTML = maintenanceUnitSearchResults(input.value, exactUnit.id);
    return;
  }
  updateSharedUnitSearch(input, "[data-work-unit-results]");
}

function applyUnitToWorkForm(form, unit) {
  if (!form || !unit) return;
  const location = unitLocationFields(unit);
  const setValue = (name, value, overwrite = true) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field && value !== undefined && value !== null && String(value).trim() && (overwrite || !field.value)) {
      field.value = value;
    }
  };
  const mode = form.querySelector('[name="unidadeModo"]');
  if (mode) mode.value = "existente";
  const hidden = form.querySelector('[name="unidadeId"]');
  if (hidden) hidden.value = unit.id || "";
  const input = form.querySelector("[data-work-unit-search]");
  if (input) input.value = sharedUnitSearchLabel(unit);
  setValue("tipoUnidade", unit.tipo);
  setValue("cidade", location.cidade);
  setValue("uf", location.uf);
  setValue("regiao", location.regiao);
  setValue("cnpj", unit.cnpj);
  setValue("endereco", unit.endereco || unit.cep);
}

function openMaintenanceDemandModal() {
  const labels = maintenanceModuleLabels();
  const activeSprint = currentSprint();
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal-card demand-modal-card maintenance-demand-form" id="maintenanceDemandForm" aria-labelledby="maintenanceDemandTitle">
        <header>
          <div>
            <span class="eyebrow">Nova demanda</span>
            <h2 id="maintenanceDemandTitle">${labels.demandTitle}</h2>
            <p class="muted">${labels.isClinical ? "Busque a unidade, vincule o equipamento e crie a OS no histórico do ativo." : "Busque a unidade no cadastro mestre para trazer CNPJ, CEP, município e tipologia."}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="error-box" id="formError"></div>
          <section class="modal-section sic-work-link-panel">
            <div class="section-title">
              <span>Unidade vinculada</span>
            </div>
            <input type="hidden" name="unidadeId" />
            <label class="field">
              <span>Assistente de busca de unidades</span>
              <input name="unidadeBusca" data-maintenance-unit-search placeholder="Digite nome, CNPJ, centro, cidade, UF ou tipo..." autocomplete="off" required />
            </label>
            <div data-maintenance-unit-results>
              ${maintenanceUnitSearchResults()}
            </div>
          </section>
          <section class="modal-section">
            <div class="section-title">
              <span>Formulário inicial</span>
            </div>
            <div class="form-grid">
              <label class="field">
                <span>Ordem de serviço *</span>
                <input name="ordemServico" placeholder="Ex.: 20260658262" required />
              </label>
              <label class="field">
                <span>Requisição de compra</span>
                <input name="requisicaoCompra" placeholder="Código Coupa / RC" />
              </label>
              <label class="field full-span">
                <span>Nome da obra *</span>
                <input name="titulo" placeholder="Descrição da intervenção ou serviço..." required />
              </label>
              <label class="field">
                <span>Centro de custo</span>
                ${
                  labels.isClinical
                    ? `<input name="centroCusto" value="${CLINICAL_COST_CENTER_LABEL}" readonly />`
                    : `
                      <select name="centroCusto">
                        <option>MANUTENÇÃO PREDIAL</option>
                        <option>ENG CLINICA</option>
                        <option>SEG. PATRIMONIAL</option>
                      </select>
                    `
                }
              </label>
              <label class="field">
                <span>Tipo de demanda</span>
                <select name="tipoDemanda">
                  <option>Normal</option>
                  <option>Preventiva</option>
                  <option>Corretiva</option>
                  <option>Emergencial</option>
                </select>
              </label>
              <label class="field">
                <span>Tipo de despesa</span>
                <select name="tipoDespesa" data-maintenance-expense-select>
                  <option>OPEX</option>
                  <option>CAPEX</option>
                </select>
              </label>
              <label class="field">
                <span>Sprint</span>
                <select name="sprintId">
                  ${sprintOptions(activeSprint?.id || "")}
                </select>
                <small class="muted">${activeSprint ? `${dateText(activeSprint.dataInicio)} → ${dateText(activeSprint.dataFim)}` : "Sem sprint ativa cadastrada"}</small>
              </label>
              <label class="field">
                <span>Analista responsável</span>
                <select name="analistaResponsavel">
                  ${maintenanceAnalystOptions()}
                </select>
              </label>
              <label class="field">
                <span>Prioridade</span>
                <select name="prioridade">
                  <option>Média</option>
                  <option>Alta</option>
                  <option>Baixa</option>
                </select>
              </label>
              ${
                labels.isClinical
                  ? `
                    <label class="field">
                      <span>Equipamento / ativo</span>
                      <input name="equipamento" placeholder="Ex.: Tomógrafo, raio-X, autoclave..." />
                    </label>
                    <label class="field">
                      <span>Patrimônio / nº de série</span>
                      <input name="patrimonio" placeholder="Patrimônio, série ou TAG do ativo" />
                    </label>
                    <label class="field">
                      <span>Fabricante</span>
                      <input name="fabricante" placeholder="Fabricante do equipamento" />
                    </label>
                    <label class="field">
                      <span>Modelo</span>
                      <input name="modelo" placeholder="Modelo do equipamento" />
                    </label>
                  `
                  : ""
              }
            </div>
          </section>
          <section class="modal-section">
            <div class="section-title">
              <span>Datas e valores</span>
            </div>
            <div class="form-grid">
              <label class="field">
                <span>Data de início</span>
                <input name="dataInicio" type="date" value="${TODAY_ISO}" />
              </label>
              <label class="field">
                <span>Data fim prevista</span>
                <input name="dataPrevistaEntrega" type="date" value="${activeSprint?.dataFim || ""}" />
              </label>
              <label class="field">
                <span>Valor da proposta inicial</span>
                <input name="valorProposta" inputmode="decimal" placeholder="0,00" />
              </label>
              <label class="field">
                <span>Valor Sala Técnica</span>
                <input name="valorSalaTecnica" inputmode="decimal" placeholder="0,00" />
              </label>
              <label class="field" data-maintenance-negotiated-field hidden>
                <span>Valor negociado CAPEX</span>
                <input name="valorNegociado" inputmode="decimal" placeholder="0,00" disabled />
              </label>
            </div>
          </section>
          <label class="field modal-section">
            <span>Planejamento</span>
            <input name="planejamento" placeholder="Ex.: Coberta, climatização, elétrica..." />
          </label>
          <label class="field modal-section">
            <span>Observações gerais</span>
            <textarea name="observacoes" placeholder="Registre informações relevantes sobre a OS..."></textarea>
          </label>
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
          <button class="primary-action" type="submit">Salvar demanda</button>
        </footer>
      </form>
    </div>
  `;
}

function openMaintenanceCardModal(id) {
  const item = maintenanceItems().find((entry) => entry.id === id);
  if (!item) return;
  const showNegotiated = isMaintenanceCapex(item);
  const labels = maintenanceModuleLabels();
  const equipmentName = clinicalEquipmentName(item);
  const sprint = maintenanceSprint(item);
  const sprintName = maintenanceSprintName(item);
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal-card demand-modal-card maintenance-demand-form" id="maintenanceDetailForm" data-id="${item.id}" aria-labelledby="maintenanceDetailTitle">
        <header>
          <div>
            <span class="eyebrow">${item.ordemServico || item.id} — ${maintenanceStatusLabel(item)}</span>
            <h2 id="maintenanceDetailTitle">${item.titulo}</h2>
            <p class="muted">${item.unidadeNome} · ${item.uf || "UF não informada"} · ${sprintName}${labels.isClinical ? ` · ${equipmentName || "Equipamento a vincular"}` : ""}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="error-box" id="formError"></div>
          <section class="demand-status-box demand-status-control" data-status="${item.coluna}">
            <label class="field">
              <span>Fase atual · altere para mover o card</span>
              <select name="coluna" data-action="update-maintenance-status" data-id="${item.id}">
                ${maintenanceColumns.map((column) => `<option value="${column.id}" ${column.id === item.coluna ? "selected" : ""}>${column.label}</option>`).join("")}
              </select>
            </label>
            <div class="maintenance-time-grid">
              ${splitItem("Tempo na fase", `${maintenancePhaseDays(item)} dias`)}
              ${splitItem("Lead time total", `${maintenanceLeadTime(item)} dias`)}
            </div>
          </section>
          <section class="modal-section">
            <div class="section-title">
              <span>Formulário inicial</span>
            </div>
            <div class="form-grid">
              <label class="field">
                <span>Ordem de serviço</span>
                <input name="ordemServico" value="${escapeAttribute(item.ordemServico || "")}" />
              </label>
              <label class="field">
                <span>Requisição de compra</span>
                <input name="requisicaoCompra" value="${escapeAttribute(item.requisicaoCompra || "")}" />
              </label>
              <label class="field full-span">
                <span>Nome da obra</span>
                <input name="titulo" value="${escapeAttribute(item.titulo || "")}" required />
              </label>
              <label class="field">
                <span>Nome da unidade</span>
                <input name="unidadeNome" value="${escapeAttribute(item.unidadeNome || "")}" />
              </label>
              <label class="field">
                <span>Estado da unidade</span>
                <input name="uf" value="${escapeAttribute(item.uf || "")}" />
              </label>
              <label class="field">
                <span>CNPJ</span>
                <input name="cnpj" value="${escapeAttribute(item.cnpj || "")}" />
              </label>
              <label class="field">
                <span>Endereço / CEP</span>
                <input name="endereco" value="${escapeAttribute(item.endereco || item.cep || "")}" />
              </label>
              <label class="field">
                <span>Centro de custo</span>
                <input name="centroCusto" value="${escapeAttribute(labels.isClinical ? CLINICAL_COST_CENTER_LABEL : item.centroCusto || "")}" ${labels.isClinical ? "readonly" : ""} />
              </label>
              <label class="field">
                <span>Tipo de demanda</span>
                <input name="tipoDemanda" value="${escapeAttribute(item.tipoDemanda || "Normal")}" />
              </label>
              <label class="field">
                <span>Tipo de despesa</span>
                <select name="tipoDespesa" data-maintenance-expense-select>
                  <option ${item.tipoDespesa === "OPEX" ? "selected" : ""}>OPEX</option>
                  <option ${item.tipoDespesa === "CAPEX" ? "selected" : ""}>CAPEX</option>
                </select>
              </label>
              <label class="field">
                <span>Sprint</span>
                <select name="sprintId" data-action="update-maintenance-sprint" data-id="${item.id}">
                  ${sprintOptions(sprint?.id || "")}
                </select>
                <small class="muted">${sprint ? `${dateText(sprint.dataInicio)} → ${dateText(sprint.dataFim)}` : "Sem período vinculado"}</small>
              </label>
              <label class="field">
                <span>Analista responsável</span>
                <select name="analistaResponsavel">
                  ${maintenanceAnalystOptions(item.analistaResponsavel)}
                </select>
              </label>
              ${
                labels.isClinical
                  ? `
                    <label class="field">
                      <span>Equipamento / ativo</span>
                      <input name="equipamento" value="${escapeAttribute(equipmentName || "")}" />
                    </label>
                    <label class="field">
                      <span>Patrimônio / nº de série</span>
                      <input name="patrimonio" value="${escapeAttribute(item.patrimonio || item.numeroSerie || "")}" />
                    </label>
                    <label class="field">
                      <span>Fabricante</span>
                      <input name="fabricante" value="${escapeAttribute(item.fabricante || "")}" />
                    </label>
                    <label class="field">
                      <span>Modelo</span>
                      <input name="modelo" value="${escapeAttribute(item.modelo || "")}" />
                    </label>
                  `
                  : ""
              }
            </div>
          </section>
          <section class="modal-section">
            <div class="section-title">
              <span>Datas</span>
            </div>
            <div class="date-grid demand-date-grid">
              ${dateField("Data de início", "dataInicio", item.dataInicio)}
              ${dateField("Data fim", "dataFim", item.dataFim)}
              ${dateField("Entrega prevista", "dataPrevistaEntrega", item.dataPrevistaEntrega)}
            </div>
          </section>
          <section class="modal-section">
            <div class="section-title">
              <span>Valores</span>
            </div>
            <div class="form-grid">
              <label class="field">
                <span>Valor da proposta inicial</span>
                <input name="valorProposta" inputmode="decimal" value="${number(item.valorProposta, 2)}" />
              </label>
              <label class="field">
                <span>Valor Sala Técnica</span>
                <input name="valorSalaTecnica" inputmode="decimal" value="${number(item.valorSalaTecnica, 2)}" />
              </label>
              <label class="field" data-maintenance-negotiated-field ${showNegotiated ? "" : "hidden"}>
                <span>Valor negociado CAPEX</span>
                <input name="valorNegociado" inputmode="decimal" value="${number(item.valorNegociado, 2)}" ${showNegotiated ? "" : "disabled"} />
              </label>
            </div>
          </section>
          <label class="field modal-section">
            <span>Planejamento</span>
            <input name="planejamento" value="${escapeAttribute(item.planejamento || "")}" />
          </label>
          <label class="field modal-section">
            <span>Observações gerais</span>
            <textarea name="observacoes">${item.observacoes || ""}</textarea>
          </label>
          <section class="modal-section">
            <div class="section-title">
              <span>Histórico</span>
            </div>
            ${renderMaintenanceHistory(item)}
          </section>
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
          <button class="primary-action" type="submit">Salvar</button>
        </footer>
      </form>
    </div>
  `;
}

function renderMaintenanceHistory(item) {
  const history = item.historico || [];
  if (!history.length) return `<div class="empty-state">Sem histórico registrado.</div>`;
  return `
    <div class="timeline-list">
      ${history
        .slice(-8)
        .reverse()
        .map((entry) => `<article><strong>${entry.fase}</strong><span>${dateText(entry.data)} · ${entry.observacao || "Atualização de fase"}</span></article>`)
        .join("")}
    </div>
  `;
}

function openMaintenanceSliceDetailModal(field, label) {
  const labels = maintenanceModuleLabels();
  const items = maintenanceItems().filter((item) => {
    if (field === "month") return (item.dataInicio || "").slice(0, 7) === label;
    if (field === "sprint") {
      const sprint = sprintByReference(label);
      return sprint ? maintenanceSprintId(item) === sprint.id : maintenanceSprintName(item) === label;
    }
    return String(maintenanceGroupValue(item, field)) === String(label);
  });
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card" aria-labelledby="maintenanceSliceTitle">
        <header>
          <div>
            <span class="eyebrow">${labels.title}</span>
            <h2 id="maintenanceSliceTitle">${label}</h2>
            <p class="muted">${items.length} demanda${items.length === 1 ? "" : "s"} encontradas no recorte selecionado.</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          ${renderMaintenanceMiniTable(items.slice(0, 80))}
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
          <button class="primary-action" type="button" data-view="${labels.operationalView}">Abrir operacional</button>
        </footer>
      </section>
    </div>
  `;
}

function updateMaintenanceDemandPhase(id, nextColumnId) {
  const item = maintenanceItems().find((entry) => entry.id === id);
  const next = maintenancePhaseById(nextColumnId);
  if (!item || !next) return false;
  if (item.coluna === nextColumnId) return item;
  const previous = maintenanceStatusLabel(item);
  item.coluna = nextColumnId;
  item.fasePipefy = next.label.toUpperCase();
  item.phaseStartedAt = TODAY_ISO;
  item.updatedAt = TODAY_ISO;
  if (isMaintenanceClosed(item) && !item.dataFim) item.dataFim = TODAY_ISO;
  item.historico = [
    ...(item.historico || []),
    { fase: next.label, data: TODAY_ISO, observacao: `Movido de ${previous} para ${next.label}.` },
  ];
  addHistory({
    entidade: "manutencao",
    entidadeId: item.id,
    campo: "fase",
    valorAnterior: previous,
    valorNovo: next.label,
  });
  saveState();
  return item;
}

function handleMaintenanceDemandSubmit(form) {
  const labels = maintenanceModuleLabels();
  const formData = new FormData(form);
  const unit = maintenanceUnitById(formData.get("unidadeId")) || findMaintenanceUnitByTypedSearch(formData.get("unidadeBusca"));
  if (!unit) {
    showFormError("Selecione uma unidade válida pelo assistente de busca.");
    return;
  }
  const title = String(formData.get("titulo") || "").trim();
  if (!title) {
    showFormError("Informe o nome da obra ou intervenção.");
    return;
  }
  const tipoDespesa = String(formData.get("tipoDespesa") || "OPEX").trim() || "OPEX";
  const isOpex = normalizeSearchText(tipoDespesa).includes("opex");
  const selectedSprint = sprintById(formData.get("sprintId")) || currentSprint();
  const demand = {
    id: nextCode(labels.isClinical ? "EC" : "MAN", state.maintenanceDemands || []),
    codigoOrigem: "",
    ordemInterna: "",
    ordemServico: String(formData.get("ordemServico") || "").trim() || "S/OS",
    titulo: title,
    unidadeNome: unit.nome,
    unidadeId: unit.id,
    tipologia: unit.tipo || "Não informada",
    uf: String(unit.municipio || "").split("/").pop()?.trim().slice(0, 2).toUpperCase() || "",
    estado: "",
    regiao: "",
    regional: "",
    cnpj: unit.cnpj || "",
    endereco: unit.endereco || "",
    cep: unit.cep || "",
    requisicaoCompra: String(formData.get("requisicaoCompra") || "").trim(),
    centroCusto: labels.isClinical ? CLINICAL_COST_CENTER_LABEL : String(formData.get("centroCusto") || "MANUTENÇÃO PREDIAL"),
    tipoDemanda: String(formData.get("tipoDemanda") || "Normal"),
    tipoDespesa,
    coluna: "naoIniciado",
    fasePipefy: "NÃO INICIADO",
    dataInicio: formData.get("dataInicio") || TODAY_ISO,
    dataFim: "",
    dataPrevistaEntrega: formData.get("dataPrevistaEntrega") || selectedSprint?.dataFim || "",
    valorProposta: parseCurrency(formData.get("valorProposta")),
    valorSalaTecnica: parseCurrency(formData.get("valorSalaTecnica")),
    valorNegociado: isOpex ? 0 : parseCurrency(formData.get("valorNegociado")),
    sprintId: selectedSprint?.id || "",
    sprint: selectedSprint?.nome || "Sem sprint",
    planejamento: String(formData.get("planejamento") || "").trim(),
    observacoes: String(formData.get("observacoes") || "").trim(),
    analistaResponsavel: String(formData.get("analistaResponsavel") || "").trim(),
    prioridade: String(formData.get("prioridade") || "Média"),
    equipamento: String(formData.get("equipamento") || "").trim(),
    assetName: String(formData.get("equipamento") || "").trim(),
    patrimonio: String(formData.get("patrimonio") || "").trim(),
    fabricante: String(formData.get("fabricante") || "").trim(),
    modelo: String(formData.get("modelo") || "").trim(),
    phaseStartedAt: TODAY_ISO,
    createdAt: TODAY_ISO,
    updatedAt: TODAY_ISO,
    historico: [{ fase: "Não iniciada", data: TODAY_ISO, observacao: "Demanda criada no SLT 360." }],
  };
  state.maintenanceDemands = [demand, ...(state.maintenanceDemands || [])];
  addHistory({
    entidade: "manutencao",
    entidadeId: demand.id,
    campo: "criação",
    valorAnterior: "Não existia",
    valorNovo: `${demand.ordemServico} | ${demand.unidadeNome}`,
  });
  saveState();
  closeModal();
  if (labels.isClinical) clinicalFilters.phase = "naoIniciado";
  else maintenanceFilters.phase = "naoIniciado";
  setView(labels.operationalView);
  showToast(labels.demandToast);
}

function handleMaintenanceDetailSubmit(form) {
  const item = maintenanceItems().find((entry) => entry.id === form.dataset.id);
  if (!item) return;
  const labels = maintenanceModuleLabels();
  const formData = new FormData(form);
  const previousPhase = item.coluna;
  const tipoDespesa = String(formData.get("tipoDespesa") || "").trim();
  const isOpex = normalizeSearchText(tipoDespesa).includes("opex");
  const selectedSprint = sprintById(formData.get("sprintId"));
  Object.assign(item, {
    ordemServico: String(formData.get("ordemServico") || "").trim(),
    requisicaoCompra: String(formData.get("requisicaoCompra") || "").trim(),
    titulo: String(formData.get("titulo") || "").trim(),
    unidadeNome: String(formData.get("unidadeNome") || "").trim(),
    uf: String(formData.get("uf") || "").trim().toUpperCase(),
    cnpj: String(formData.get("cnpj") || "").trim(),
    endereco: String(formData.get("endereco") || "").trim(),
    centroCusto: labels.isClinical ? CLINICAL_COST_CENTER_LABEL : String(formData.get("centroCusto") || "").trim(),
    tipoDemanda: String(formData.get("tipoDemanda") || "").trim(),
    tipoDespesa,
    sprintId: selectedSprint?.id || "",
    sprint: selectedSprint?.nome || "Sem sprint",
    analistaResponsavel: String(formData.get("analistaResponsavel") || "").trim(),
    dataInicio: formData.get("dataInicio") || "",
    dataFim: formData.get("dataFim") || "",
    dataPrevistaEntrega: formData.get("dataPrevistaEntrega") || "",
    valorProposta: parseCurrency(formData.get("valorProposta")),
    valorSalaTecnica: parseCurrency(formData.get("valorSalaTecnica")),
    valorNegociado: isOpex ? 0 : parseCurrency(formData.get("valorNegociado")),
    planejamento: String(formData.get("planejamento") || "").trim(),
    observacoes: String(formData.get("observacoes") || "").trim(),
    equipamento: String(formData.get("equipamento") || item.equipamento || item.assetName || "").trim(),
    assetName: String(formData.get("equipamento") || item.assetName || item.equipamento || "").trim(),
    patrimonio: String(formData.get("patrimonio") || item.patrimonio || item.numeroSerie || "").trim(),
    fabricante: String(formData.get("fabricante") || item.fabricante || "").trim(),
    modelo: String(formData.get("modelo") || item.modelo || "").trim(),
    updatedAt: TODAY_ISO,
  });
  const update = updateMaintenanceDemandPhase(item.id, formData.get("coluna") || item.coluna);
  if (update === false) return;
  if (previousPhase === item.coluna) saveState();
  closeModal();
  showToast(`${labels.short} atualizada.`);
  render();
}

function renderClinical() {
  return renderMaintenanceHome();
}

function renderClinicalOperational() {
  return renderMaintenanceOperational();
}

function renderClinicalReports() {
  return renderMaintenanceReports();
}

function renderClinicalTimeline() {
  return renderMaintenanceTimeline();
}

function renderClinicalExecutive() {
  return renderMaintenanceExecutive();
}

function renderClinicalSettings() {
  return renderMaintenanceSettings();
}

function renderBudgetControlLegacy() {
  const totals = allTotals();
  const totalCAPEX = totals.orcado + totals.aditivado;
  const pendingSics = state.sics.filter((sic) => sic.status === "Pendente");
  const budgetRows = budgetControlRows();
  const riskReserve = state.works.reduce(
    (sum, work) => sum + work.ev.lines.filter(isRiskLine).reduce((lineSum, line) => lineSum + (line.valorOrcado || 0), 0),
    0
  );
  const approvedSics = approvedSicTotal();
  const riskUse = (approvedSics / Math.max(riskReserve, 1)) * 100;

  return `
    ${renderToolbar("Controle de Verba 360", "Orçamento aprovado, aditivos, contratos e saldo disponível", `
      <button class="secondary-action" type="button" data-view="analytics">Disciplina & Tipologia</button>
      <button class="primary-action" type="button" data-view="sics">Abrir SICs</button>
    `, moduleHeaders.budget)}
    <section class="kpi-grid">
      ${kpi("Verba aprovada", money(totalCAPEX), "EV + SICs aprovadas", "blue")}
      ${kpi("Contratado", money(totals.contratado), `${number((totals.contratado / Math.max(totalCAPEX, 1)) * 100, 1)}% do CAPEX`, "green")}
      ${kpi("Saldo disponível", money(totals.saldo), "Orçado + aditivado - contratado", "orange")}
      ${kpi("Aditivos pendentes", String(pendingSics.length), `${money(pendingSics.reduce((sum, sic) => sum + sicTotal(sic), 0))} em análise`, "red")}
      ${kpi("Reserva de risco 5%", money(riskReserve), `${number(riskUse, 1)}% consumido por SICs`, riskUse > 100 ? "red" : "green")}
      ${kpi("SICs aprovadas", money(approvedSics), "Aporte adicional já reconhecido", "orange", "sics")}
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Ciclo de verba do projeto</h2>
          <p class="panel-subtitle">Integração entre estimativa, EV, contratação, risco e necessidade de novo aporte</p>
        </div>
      </div>
      <div class="budget-flow">
        ${budgetStage("FEL 01", "Verba inicial", "Estimativa do plano de investimento", money(totalCAPEX + riskReserve))}
        ${budgetStage("FEL 02", "Escopo validado", "Premissas, área e tipologia", `${state.works.length} obras`)}
        ${budgetStage("FEL 03", "EV Sala Técnica", "Valor por disciplina", money(totalCAPEX))}
        ${budgetStage("Suprimentos", "Contratado", "Consumo real por linha do EV", money(totals.contratado))}
        ${budgetStage("Execução", "SICs e risco", "Aditivos até o limite de risco", `${number(riskUse, 1)}%`)}
      </div>
    </section>

    ${renderBudgetSicPanel(riskReserve)}

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Carteira de verbas</h2>
            <p class="panel-subtitle">Controle financeiro por módulo da Sala Técnica</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Módulo</th>
                <th class="numeric">Verba aprovada</th>
                <th class="numeric">Contratado</th>
                <th class="numeric">Saldo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${budgetRows
                .map(
                  (row) => `
                    <tr>
                      <td><strong>${row.modulo}</strong><br /><span class="muted">${row.descricao}</span></td>
                      <td class="numeric">${money(row.verba)}</td>
                      <td class="numeric">${money(row.contratado)}</td>
                      <td class="numeric">${money(row.saldo)}</td>
                      <td><span class="status-pill" data-status="${row.saldoCritico ? "Saldo crítico" : "Completo"}">${row.saldoCritico ? "Saldo crítico" : "Controlado"}</span></td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Alertas de verba</h2>
            <p class="panel-subtitle">O que precisa de decisão financeira</p>
          </div>
        </div>
        <div class="alert-list">
          ${alertItem("SICs sem disciplina são bloqueadas", "Nenhum aditivo novo entra sem disciplina real")}
          ${alertItem(`${pendingSics.length} aditivo pendente`, pendingSics.map((sic) => `${sic.id}: ${money(sicTotal(sic))}`).join(", ") || "Sem aditivo pendente")}
          ${alertItem("Saldo deve ser sempre derivado", "Orçado + aditivado aprovado - contratado")}
          ${alertItem("Integração futura SAP", "Ordem Interna e contrato já aparecem como campos estruturais")}
        </div>
      </section>
    </div>
  `;
}

function renderBudgetSicPanel(riskReserve) {
  const records = sicLineRecords();
  const additions = records.filter((record) => record.valor > 0);
  const suppressions = records.filter((record) => record.valor < 0);
  const additiveValue = additions.reduce((sum, record) => sum + record.valor, 0);
  const suppressionValue = Math.abs(suppressions.reduce((sum, record) => sum + record.valor, 0));
  const netValue = records.reduce((sum, record) => sum + record.valor, 0);
  const riskUse = (additiveValue / Math.max(riskReserve, 1)) * 100;
  const pending = state.sics.filter((sic) => sic.status === "Pendente");
  return `
    <section class="panel budget-sic-panel">
      <div class="panel-header">
        <div>
          <h2>Atualização financeira das SICs</h2>
          <p class="panel-subtitle">SICs integradas ao controle de verba, com aditivos, supressões, saldo de risco e causas de variação</p>
        </div>
        <button class="secondary-action" type="button" data-view="sics">Abrir BI de SICs</button>
      </div>
      <div class="budget-sic-grid">
        ${miniMetric("Valores de Aditivos", money(additiveValue))}
        ${miniMetric("Supressões", `-${money(suppressionValue)}`)}
        ${miniMetric("Impacto líquido", money(netValue))}
        ${miniMetric("Uso da reserva", `${number(riskUse, 1)}%`)}
        ${miniMetric("SICs pendentes", String(pending.length))}
      </div>
      <div class="content-grid">
        <section>
          <h3>Disciplinas que mais consomem aditivo</h3>
          ${barList(sicCostRows("disciplina", 6, additions), "valor", money)}
        </section>
        <section>
          <h3>Motivos que mais geram variação</h3>
          ${barList(sicCostRows("motivo", 6, records), "valor", money)}
        </section>
      </div>
    </section>
  `;
}

function budgetStage(label, title, detail, value) {
  return `
    <article class="budget-stage">
      <span>${label}</span>
      <strong>${title}</strong>
      <small>${detail}</small>
      <b>${value}</b>
    </article>
  `;
}

function budgetDisciplineRows() {
  const map = new Map();
  state.works.forEach((work) => {
    work.ev.lines.forEach((line) => {
      if (isRiskLine(line)) return;
      const id = canonicalDisciplineId(line.disciplinaId);
      const current = map.get(id) || { id, ev: 0, sic: 0, contratado: 0, saldo: 0 };
      const values = lineTotals(work, line);
      current.ev += values.orcado;
      current.sic += values.aditivado;
      current.contratado += values.contratado;
      current.saldo += values.saldo;
      map.set(id, current);
    });
  });
  return [...map.values()].sort((a, b) => b.ev + b.sic - (a.ev + a.sic));
}

function renderBudgetDisciplineTable() {
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Disciplina</th>
            <th class="numeric">EV</th>
            <th class="numeric">SICs aprovadas</th>
            <th class="numeric">Verba atual</th>
            <th class="numeric">Contratado</th>
            <th class="numeric">Saldo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${budgetDisciplineRows()
            .slice(0, 20)
            .map((row) => {
              const verba = row.ev + row.sic;
              const saldoRatio = row.saldo / Math.max(verba, 1);
              return `
                <tr>
                  <td><strong>${disciplineById(row.id).nome}</strong></td>
                  <td class="numeric">${money(row.ev)}</td>
                  <td class="numeric">${money(row.sic)}</td>
                  <td class="numeric">${money(verba)}</td>
                  <td class="numeric">${money(row.contratado)}</td>
                  <td class="numeric">${money(row.saldo)}</td>
                  <td><span class="status-pill" data-status="${saldoRatio < 0.05 ? "Saldo crítico" : saldoRatio < 0.18 ? "Pendente" : "Completo"}">${saldoRatio < 0.05 ? "Crítico" : saldoRatio < 0.18 ? "Atenção" : "Controlado"}</span></td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function budgetControlRows() {
  const totals = allTotals();
  const obraVerba = totals.orcado + totals.aditivado;
  return [
    {
      modulo: "01. Obras",
      descricao: "EV, SICs, contratações e CAPEX de obras",
      verba: obraVerba,
      contratado: totals.contratado,
      saldo: totals.saldo,
      saldoCritico: totals.saldo / Math.max(obraVerba, 1) < 0.18,
    },
    {
      modulo: "02. Manutenção",
      descricao: "Orçamentos corretivos e preventivos",
      verba: 2850000,
      contratado: 960000,
      saldo: 1890000,
      saldoCritico: false,
    },
    {
      modulo: "03. Engenharia Clínica",
      descricao: "Equipamentos, salas críticas e infraestrutura assistencial",
      verba: 1920000,
      contratado: 640000,
      saldo: 1280000,
      saldoCritico: false,
    },
    {
      modulo: "04. Reserva e Governança",
      descricao: "Reserva técnica, contingência e verbas em aprovação",
      verba: 4200000,
      contratado: 0,
      saldo: 4200000,
      saldoCritico: false,
    },
  ];
}

function capexData() {
  return state.capexControl || globalThis.CAPEX_CONTROL_DATA || { source: "", baseOi: [], dePara: [], transferencias: [], consumo: {} };
}

function normalizeOiKey(value) {
  return String(value || "").trim().replace(/\s+/g, "").toUpperCase();
}

function capexOiSourceKey(row, fallback = "") {
  const oi = normalizeOiKey(row?.ordemInterna);
  if (oi) return `oi:${oi}`;
  if (row?.workId || row?.obraId) return `work:${row.workId || row.obraId}`;
  return fallback;
}

function capexOiSourceRows() {
  const map = new Map();
  (capexData().baseOi || []).forEach((row, index) => {
    map.set(capexOiSourceKey(row, `base:${index}`), row);
  });
  (state.capexManualOiRows || []).forEach((row, index) => {
    map.set(capexOiSourceKey(row, `manual:${index}`), row);
  });
  (state.works || []).forEach((work) => {
    const ordemInterna = String(work.ordemInternaSAP || "").trim();
    const verbaAportada = Number(work.valorVerbaAportada || work.plannedValue || work.valorAprovado || work.capexAprovado || work.opexAprovado || 0) || 0;
    if (!ordemInterna || verbaAportada <= 0) return;
    const origem = String(work.tipoVerba || work.origemVerba || "CAPEX").toUpperCase() === "OPEX" ? "OPEX" : "CAPEX";
    const key = capexOiSourceKey({ ordemInterna }, `work:${work.id}`);
    if (capexRowFromSltCadastro(map.get(key))) return;
    map.set(key, {
      ordemInterna,
      descricao: `${work.codigoOriginal || "0000"}. ${work.nome}`,
      obraPlano: work.nome,
      codigoObra: work.codigoOriginal || "",
      montantePlanejado: verbaAportada,
      recursosAtribuidos: 0,
      montanteDisponivel: verbaAportada,
      exercicio: "2026",
      sourceRow: `SLT-${work.id}`,
      workId: work.id,
      obraId: work.id,
      tipoVerba: origem,
      categoriaOrc: origem === "OPEX" ? "OPEX / Manutenção" : "Projetos 2026",
      classificacaoPacote: work.classificacaoObra || "Cadastro SLT 360",
      classificacaoHead: origem,
      grupoExecutivo: "Hub SLT 360",
      detalhamentoOrc: work.tipologiaObra || "Não informado",
      valorEstimado: Number(work.valorEstimado || 0) || 0,
      origemCadastro: "Cadastro de obra",
    });
  });
  return [...map.values()];
}

function syncWorkBudgetIntegration(work) {
  if (!work) return;
  const origem = String(work.tipoVerba || work.origemVerba || "CAPEX").toUpperCase() === "OPEX" ? "OPEX" : "CAPEX";
  const ordemInterna = String(work.ordemInternaSAP || "").trim();
  const verbaAportada = Number(work.valorVerbaAportada || work.plannedValue || work.valorAprovado || work.capexAprovado || work.opexAprovado || 0) || 0;
  if (!ordemInterna || verbaAportada <= 0) return;

  syncWorkFundRecord(work, origem, ordemInterna, verbaAportada);
  syncWorkCapexOiRecord(work, origem, ordemInterna, verbaAportada);
}

function syncWorkFundRecord(work, origem, ordemInterna, verbaAportada) {
  state.funds = arrayOrFallback(state.funds);
  const oiKey = normalizeOiKey(ordemInterna);
  const existing = state.funds.find((fund) => {
    const fundOi = normalizeOiKey(fund.ordemInternaSAP || fund.ordemInterna || fund.account || "");
    return fund.workId === work.id || fund.obraId === work.id || (oiKey && fundOi === oiKey);
  });
  const now = new Date().toISOString();
  const fund = existing || {
    id: nextCode("VRB", state.funds),
    createdAt: now,
    committed: 0,
    used: 0,
  };

  Object.assign(fund, {
    workId: work.id,
    obraId: work.id,
    type: origem === "OPEX" ? "opex" : "works",
    requested: verbaAportada,
    approved: verbaAportada,
    unit: work.nome,
    status: "aprovada",
    code: `${origem}-${ordemInterna}`,
    ordemInternaSAP: ordemInterna,
    ordemInterna,
    account: ordemInterna,
    year: 2026,
    costCenter: fund.costCenter || "",
    updatedAt: now,
    notes: `Verba ${origem} integrada automaticamente pelo cadastro de obra no SLT 360.`,
  });

  if (!existing) state.funds.unshift(fund);
}

function syncWorkCapexOiRecord(work, origem, ordemInterna, verbaAportada) {
  state.capexManualOiRows = arrayOrFallback(state.capexManualOiRows);
  const oiKey = normalizeOiKey(ordemInterna);
  const existing =
    state.capexManualOiRows.find((row) => row.workId === work.id || row.obraId === work.id) ||
    state.capexManualOiRows.find((row) => {
      const rowOi = normalizeOiKey(row.ordemInterna);
      return !row.workId && !row.obraId && oiKey && rowOi === oiKey;
    });
  const row = existing || {};
  const consumido = Number(row.recursosAtribuidos || row.consumido || 0) || 0;

  Object.assign(row, {
    ordemInterna,
    descricao: `${work.codigoOriginal || "0000"}. ${work.nome}`,
    obraPlano: work.nome,
    codigoObra: work.codigoOriginal || "",
    montantePlanejado: verbaAportada,
    recursosAtribuidos: consumido,
    montanteDisponivel: verbaAportada - consumido,
    exercicio: "2026",
    sourceRow: `SLT-${work.id}`,
    workId: work.id,
    obraId: work.id,
    tipoVerba: origem,
    categoriaOrc: origem === "OPEX" ? "OPEX / Manutenção" : "Projetos 2026",
    classificacaoPacote: work.classificacaoObra || "Cadastro SLT 360",
    classificacaoHead: origem,
    grupoExecutivo: "Hub SLT 360",
    detalhamentoOrc: work.tipologiaObra || "Não informado",
    valorEstimado: Number(work.valorEstimado || 0) || 0,
    origemCadastro: "Cadastro de obra",
  });

  if (!existing) state.capexManualOiRows.unshift(row);
}

function cleanCapexText(value) {
  const text = cleanImportedText(value || "");
  return text === "Não informado" ? "" : text;
}

function capexDescriptionCode(text) {
  const match = String(text || "").match(/\b(\d{4,10})\b/);
  return match?.[1] || "";
}

function capexNormalizeName(text) {
  return normalizeSearchText(cleanCapexText(text))
    .replace(/^\d+\s*[\.\-]\s*/, "")
    .replace(/\b(obra|projeto|manutencao|manut|reg|oper|proj|2026|2025)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function capexSignificantTokens(text) {
  return capexNormalizeName(text)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && !["0000", "hospital", "clinica", "unidade"].includes(token));
}

function isPlaceholderCapexCode(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return !digits || /^0+$/.test(digits);
}

function capexNamesCompatible(first, second) {
  const left = capexNormalizeName(first);
  const right = capexNormalizeName(second);
  if (!left || !right) return false;
  if (left === right || left.includes(right) || right.includes(left)) return true;
  const leftTokens = capexSignificantTokens(left);
  const rightTokens = new Set(capexSignificantTokens(right));
  if (!leftTokens.length || !rightTokens.size) return false;
  const overlap = leftTokens.filter((token) => rightTokens.has(token)).length;
  return overlap >= Math.min(2, leftTokens.length, rightTokens.size);
}

function capexSecondaryDescription(primary, secondary) {
  const cleanSecondary = cleanCapexText(secondary);
  if (!cleanSecondary) return "";
  return capexNamesCompatible(primary, cleanSecondary) ? cleanSecondary : "";
}

function capexRowFromSltCadastro(row = {}) {
  return Boolean(row.workId || row.obraId || String(row.sourceRow || "").startsWith("SLT-") || row.origemCadastro === "Cadastro de obra");
}

function capexCategoryKind(row) {
  const text = normalizeSearchText([row.categoriaOrc, row.classificacaoPacote, row.grupoExecutivo, row.descricao].join(" "));
  if (text.includes("manut") || text.includes("opex") || text.includes("dia a dia")) return "OPEX / Manutenção";
  return "CAPEX";
}

function capexDeParaIndex() {
  const byOi = new Map();
  const byDescription = new Map();
  const byCode = new Map();
  (capexData().dePara || []).forEach((row) => {
    const normalizedRow = {
      ...row,
      descricao: cleanCapexText(row.descricao),
      obraPlano: cleanCapexText(row.obraPlano),
      classificacaoPacote: cleanCapexText(row.classificacaoPacote),
      classificacaoHead: cleanCapexText(row.classificacaoHead),
      grupoExecutivo: cleanCapexText(row.grupoExecutivo),
      detalhamento: cleanCapexText(row.detalhamento),
      categoriaOrc: cleanCapexText(row.categoriaOrc),
      detalhamentoOrc: cleanCapexText(row.detalhamentoOrc),
    };
    if (normalizedRow.ordemInterna) byOi.set(String(normalizedRow.ordemInterna), normalizedRow);
    [normalizedRow.descricao, normalizedRow.obraPlano].filter(Boolean).forEach((label) => {
      byDescription.set(capexNormalizeName(label), normalizedRow);
      const code = capexDescriptionCode(label);
      if (code) byCode.set(code, normalizedRow);
    });
  });
  return { byOi, byDescription, byCode };
}

function capexConsumptionByLabel() {
  const map = new Map();
  (capexData().consumo?.byOi || []).forEach((row) => {
    const label = capexNormalizeName(row.label);
    if (label) map.set(label, Number(row.valor) || 0);
    const code = capexDescriptionCode(row.label);
    if (code) map.set(code, Number(row.valor) || 0);
  });
  return map;
}

function capexWorkMatch(row) {
  const directWork = workById(row.workId || row.obraId);
  if (directWork) return directWork;

  const rowCode = capexDescriptionCode(row.codigoObra || row.descricao || row.obraPlano);
  const rowOi = String(row.ordemInterna || "").replace(/\D/g, "");
  const rowName = capexNormalizeName(row.obraPlano || row.descricao);
  return state.works.find((work) => {
    const workOi = String(work.ordemInternaSAP || "").replace(/\D/g, "");
    const workCode = String(work.codigoOriginal || "").replace(/\D/g, "");
    const workName = capexNormalizeName(work.nome);
    if (rowOi && workOi && rowOi === workOi) {
      return !rowName || capexNamesCompatible(rowName, workName) || (!isPlaceholderCapexCode(rowCode) && rowCode === workCode);
    }
    if (!isPlaceholderCapexCode(rowCode) && !isPlaceholderCapexCode(workCode) && workCode.includes(rowCode)) return true;
    return capexNamesCompatible(rowName, workName);
  });
}

function capexOiRows() {
  const index = capexDeParaIndex();
  const consumption = capexConsumptionByLabel();
  return capexOiSourceRows().map((row, indexNumber) => {
    const fromSltCadastro = capexRowFromSltCadastro(row);
    const descricao = cleanCapexText(row.descricao);
    const code = cleanCapexText(row.codigoObra) || capexDescriptionCode(descricao);
    const dePara =
      index.byOi.get(String(row.ordemInterna || "")) ||
      index.byDescription.get(capexNormalizeName(descricao)) ||
      index.byCode.get(code) ||
      {};
    const ordemInterna = String(row.ordemInterna || dePara.ordemInterna || "").trim();
    const work = capexWorkMatch({ ...row, ...dePara, descricao, obraPlano: cleanCapexText(row.obraPlano) || cleanCapexText(dePara.obraPlano), ordemInterna });
    const obraPlano = fromSltCadastro
      ? cleanCapexText(work?.nome) || cleanCapexText(row.obraPlano) || descricao || cleanCapexText(dePara.obraPlano)
      : cleanCapexText(dePara.obraPlano) || cleanCapexText(row.obraPlano) || cleanCapexText(work?.nome) || descricao;
    const descricaoExibicao = capexSecondaryDescription(obraPlano, descricao);
    const consumptionKey = capexNormalizeName(obraPlano || descricao);
    const consumedByLaunch = consumption.get(consumptionKey) || consumption.get(code) || 0;
    const workBudget = work ? workTotals(work, { includeRisk: true, includeInitialBudgetFallback: true }) : null;
    const evTotal = workBudget ? workBudget.orcado + workBudget.aditivado : 0;
    const riskReserve = work ? workRiskReserve(work) : 0;
    const riskUsed = work ? approvedPositiveSicTotalForWork(work.id) : 0;
    const pickField = (field, fallback = "Não informado") =>
      fromSltCadastro
        ? cleanCapexText(row[field]) || cleanCapexText(dePara[field]) || fallback
        : cleanCapexText(dePara[field]) || cleanCapexText(row[field]) || fallback;
    return {
      id: `${ordemInterna || "sem-oi"}-${row.sourceRow || indexNumber}`,
      ordemInterna,
      codigoObra: code || ordemInterna || "Sem código",
      descricao,
      descricaoExibicao,
      obraPlano,
      classificacaoPacote: pickField("classificacaoPacote", "Não classificado"),
      classificacaoHead: pickField("classificacaoHead", "Não informado"),
      grupoExecutivo: pickField("grupoExecutivo", "Não informado"),
      categoriaOrc: pickField("categoriaOrc", inferCapexCategory(descricao)),
      detalhamentoOrc: pickField("detalhamentoOrc", "Não informado"),
      tipoVerba: cleanCapexText(row.tipoVerba) || "",
      verba: Number(row.montantePlanejado ?? row.verba ?? row.valorVerbaAportada) || 0,
      consumido: Number(row.recursosAtribuidos ?? row.consumido) || 0,
      saldo: Number(row.montanteDisponivel ?? row.saldo) || 0,
      consumoLancado: consumedByLaunch,
      exercicio: row.exercicio || "2026",
      sourceRow: row.sourceRow,
      work,
      evTotal,
      riskReserve,
      riskUsed,
    };
  });
}

function inferCapexCategory(description) {
  const text = normalizeSearchText(description);
  if (text.includes("manut") || text.includes("_man")) return "Manutenção";
  if (text.includes("saving")) return "Saving";
  if (text.includes("carry") || text.includes("2025")) return "Carry Over";
  if (text.includes("projeto") || text.includes("_proj")) return "Projetos 2026";
  if (text.includes("oper") || text.includes("virose")) return "Pacote Operacional";
  return "Não informado";
}

function capexRowStatus(row) {
  if (row.verba && row.evTotal > row.verba) {
    return { label: "EV acima da verba", tone: "Saldo crítico", detail: "Solicitar incremento antes de seguir." };
  }
  if (row.riskReserve && row.riskUsed > row.riskReserve) {
    return { label: "Risco excedido", tone: "Saldo crítico", detail: "SICs acima da linha 34 do EV." };
  }
  if (row.saldo < 0) return { label: "Trava financeira", tone: "Saldo crítico", detail: "Saldo negativo na OI." };
  if (row.verba && row.saldo / row.verba < 0.05) return { label: "Saldo crítico", tone: "Pendente", detail: "Abaixo de 5% da verba." };
  if (!row.ordemInterna) return { label: "Criar OI", tone: "Pendente", detail: "Ordem interna não localizada." };
  return { label: "Controlado", tone: "Completo", detail: "Dentro da governança." };
}

function filteredCapexRows() {
  const query = normalizeSearchText([searchTerm, budgetFilters.query].filter(Boolean).join(" ")).trim();
  return capexOiRows().filter((row) => {
    const rowStatus = capexRowStatus(row).label;
    const text = normalizeSearchText([
      row.ordemInterna,
      row.codigoObra,
      row.descricao,
      row.obraPlano,
      row.categoriaOrc,
      row.classificacaoHead,
      row.classificacaoPacote,
      row.grupoExecutivo,
      rowStatus,
    ].join(" "));
    if (query && !query.split(/\s+/).every((term) => text.includes(term))) return false;
    if (budgetFilters.categoriaOrc && row.categoriaOrc !== budgetFilters.categoriaOrc) return false;
    if (budgetFilters.centroFinanceiro && row.classificacaoHead !== budgetFilters.centroFinanceiro) return false;
    if (budgetFilters.status && rowStatus !== budgetFilters.status) return false;
    return true;
  });
}

function capexSummary(rows = capexOiRows()) {
  const splitRows = rows.reduce(
    (acc, row) => {
      const key = capexCategoryKind(row).startsWith("OPEX") ? "opex" : "capex";
      acc[key].verba += row.verba;
      acc[key].consumido += row.consumido;
      acc[key].saldo += row.saldo;
      acc[key].count += 1;
      return acc;
    },
    {
      capex: { verba: 0, consumido: 0, saldo: 0, count: 0 },
      opex: { verba: 0, consumido: 0, saldo: 0, count: 0 },
    }
  );
  const totalVerba = rows.reduce((sum, row) => sum + row.verba, 0);
  const totalConsumido = rows.reduce((sum, row) => sum + row.consumido, 0);
  const totalSaldo = rows.reduce((sum, row) => sum + row.saldo, 0);
  const alerts = rows.filter((row) => capexRowStatus(row).tone !== "Completo");
  const realized = (capexData().consumo?.byCategory || []).find((row) => normalizeSearchText(row.label).includes("realizado"))?.valor || 0;
  const committed = (capexData().consumo?.byCategory || []).find((row) => normalizeSearchText(row.label).includes("compromissado"))?.valor || 0;
  return {
    totalVerba,
    totalConsumido,
    totalSaldo,
    realized,
    committed,
    alerts,
    ...splitRows,
  };
}

function capexGroupRows(rows, field, valueField = "verba", limit = 8) {
  const map = new Map();
  rows.forEach((row) => {
    const label = row[field] || "Não informado";
    map.set(label, (map.get(label) || 0) + (Number(row[valueField]) || 0));
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, limit);
}

function budgetBarList(rows, formatter = money) {
  if (!rows.length) return `<div class="empty-state">Sem dados para exibir.</div>`;
  const max = Math.max(...rows.map((row) => Math.abs(Number(row.valor) || 0)), 1);
  return `
    <div class="bar-list budget-bar-list">
      ${rows
        .map((row, index) => {
          const width = Math.max((Math.abs(Number(row.valor) || 0) / max) * 100, 2);
          return `
            <div class="bar-row">
              <span class="bar-label">${row.label}</span>
              <span class="bar-track">
                <span class="bar-fill" data-highlight="${index === 0 ? "true" : "false"}" style="width:${width}%"></span>
              </span>
              <span class="bar-value">${formatter(row.valor)}</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function capexFilterOptions(values, selected, allLabel = "Todos") {
  const options = [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
  return `<option value="">${allLabel}</option>${options
    .map((value) => `<option value="${escapeAttribute(value)}" ${selected === value ? "selected" : ""}>${value}</option>`)
    .join("")}`;
}

function renderBudgetTabs() {
  const tabs = [
    ["inicio", "Início"],
    ["capex", "Controle de CAPEX"],
    ["transferencias", "Transferências"],
    ["curva", "Curva de CAPEX"],
  ];
  return `
    <div class="segmented budget-tabs" role="tablist" aria-label="Abas do Controle de Verbas">
      ${tabs
        .map(
          ([id, label]) =>
            `<button class="${budgetViewMode === id ? "is-active" : ""}" type="button" data-action="set-budget-tab" data-tab="${id}">${label}</button>`
        )
        .join("")}
    </div>
  `;
}

function renderBudgetControl() {
  const subtitle = "Governança de OIs, CAPEX/OPEX, transferências, consumo e curva financeira da Sala Técnica";
  return `
    ${renderToolbar("Controle de Verba 360", subtitle, ``, moduleHeaders.budget)}
    ${renderBudgetTabs()}
    ${budgetViewMode === "inicio" ? renderBudgetHome() : ""}
    ${budgetViewMode === "capex" ? renderCapexControlTab() : ""}
    ${budgetViewMode === "transferencias" ? renderBudgetTransfersTab() : ""}
    ${budgetViewMode === "curva" ? renderCapexCurveTab() : ""}
  `;
}

function renderBudgetHome() {
  const rows = capexOiRows();
  const summary = capexSummary(rows);
  const riskReserve = state.works.reduce((sum, work) => sum + workRiskReserve(work), 0);
  const approvedSics = approvedSicTotal();
  const riskUse = (approvedSics / Math.max(riskReserve, 1)) * 100;
  const topCritical = [...rows]
    .filter((row) => capexRowStatus(row).tone !== "Completo")
    .sort((a, b) => a.saldo - b.saldo)
    .slice(0, 8);
  return `
    <section class="budget-hero">
      <div>
        <span>HAPCAPEX</span>
        <h2>${money(summary.totalVerba)}</h2>
        <p>Verba aportada em ${rows.length} OIs, com leitura separada de CAPEX, OPEX/Manutenção, consumo lançado e risco de SICs.</p>
      </div>
      <div class="budget-hero-grid">
        ${splitItem("Saldo disponível", money(summary.totalSaldo))}
        ${splitItem("Consumido em OI", money(summary.totalConsumido))}
        ${splitItem("Realizado lançado", money(summary.realized))}
        ${splitItem("Alertas ativos", String(summary.alerts.length))}
      </div>
    </section>

    <section class="kpi-grid">
      ${kpi("CAPEX aportado", money(summary.capex.verba), `${summary.capex.count} OIs de investimento`, "blue", "", "budget-capex")}
      ${kpi("CAPEX saldo", money(summary.capex.saldo), `${number((summary.capex.saldo / Math.max(summary.capex.verba, 1)) * 100, 1)}% disponível`, summary.capex.saldo < 0 ? "red" : "green", "", "budget-capex-saldo")}
      ${kpi("OPEX / Manutenção", money(summary.opex.verba), `${summary.opex.count} OIs de manutenção`, "orange", "", "budget-opex")}
      ${kpi("Saldo OPEX", money(summary.opex.saldo), `${number((summary.opex.saldo / Math.max(summary.opex.verba, 1)) * 100, 1)}% disponível`, summary.opex.saldo < 0 ? "red" : "green", "", "budget-opex-saldo")}
      ${kpi("Reserva de risco EV", money(riskReserve), `${number(riskUse, 1)}% consumido por SICs`, riskUse > 100 ? "red" : "green", "sics")}
      ${kpi("Compromissado", money(summary.committed), "Pedidos e requisições no controle", "blue", "", "budget-committed")}
    </section>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Verba por categoria ORC</h2>
            <p class="panel-subtitle">Separação do pacote financeiro sem misturar verba inicial com EV executado</p>
          </div>
          <button class="secondary-action" type="button" data-action="set-budget-tab" data-tab="capex">Abrir CAPEX</button>
        </div>
        ${budgetBarList(capexGroupRows(rows, "categoriaOrc", "verba", 8))}
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Fila de governança</h2>
            <p class="panel-subtitle">OIs e EVs que pedem decisão antes de consumir verba</p>
          </div>
        </div>
        <div class="alert-list">
          ${
            topCritical.length
              ? topCritical
                  .map((row) => {
                    const status = capexRowStatus(row);
                    return alertItem(`${status.label}: ${row.obraPlano}`, `${row.ordemInterna || "sem OI"} · Saldo ${moneyCents(row.saldo)} · ${status.detail}`);
                  })
                  .join("")
              : `<div class="empty-state">Nenhuma trava financeira crítica no filtro atual.</div>`
          }
        </div>
      </section>
    </div>

    ${renderBudgetSicPanel(riskReserve)}
  `;
}

function renderBudgetFilterPanel(rows) {
  return `
    <section class="panel filter-panel">
      <label class="field">
        <span>Buscar OI, obra, pacote, centro financeiro ou status</span>
        <input data-budget-search value="${escapeAttribute(budgetFilters.query)}" placeholder="Digite OI, obra, pacote ORC, centro financeiro..." />
      </label>
      <div class="filter-grid">
        <label class="field">
          <span>Categoria ORC</span>
          <select data-budget-filter="categoriaOrc">${capexFilterOptions(rows.map((row) => row.categoriaOrc), budgetFilters.categoriaOrc)}</select>
        </label>
        <label class="field">
          <span>Centro financeiro</span>
          <select data-budget-filter="centroFinanceiro">${capexFilterOptions(rows.map((row) => row.classificacaoHead), budgetFilters.centroFinanceiro)}</select>
        </label>
        <label class="field">
          <span>Status financeiro</span>
          <select data-budget-filter="status">${capexFilterOptions(rows.map((row) => capexRowStatus(row).label), budgetFilters.status)}</select>
        </label>
        <button class="secondary-action" type="button" data-action="clear-budget-filters">Limpar filtros</button>
      </div>
    </section>
  `;
}

function renderCapexControlTab() {
  const allRows = capexOiRows();
  const rows = filteredCapexRows();
  const summary = capexSummary(rows);
  return `
    ${renderBudgetFilterPanel(allRows)}
    <section class="kpi-grid">
      ${kpi("OIs no filtro", String(rows.length), `${allRows.length} OIs na base`, "blue")}
      ${kpi("Verba aportada", money(summary.totalVerba), "FEL 1 até verba atual da OI", "blue")}
      ${kpi("Consumido", money(summary.totalConsumido), "Recursos atribuídos / lançados", "orange")}
      ${kpi("Saldo", money(summary.totalSaldo), "Verba aportada - consumo", summary.totalSaldo < 0 ? "red" : "green")}
      ${kpi("Travas", String(summary.alerts.filter((row) => capexRowStatus(row).label === "Trava financeira").length), "Saldo negativo ou bloqueio", "red")}
      ${kpi("EV acima da verba", String(summary.alerts.filter((row) => capexRowStatus(row).label === "EV acima da verba").length), "Solicitar incremento", "red")}
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Controle de CAPEX por Ordem Interna</h2>
          <p class="panel-subtitle">Verba aportada, consumida, saldo, EV vinculado e alertas de governança financeira</p>
        </div>
        <span class="tag">Fonte: ${capexData().source || "CONTROLE DE CAPEX SISTEMA.xlsx"}</span>
      </div>
      <div class="table-wrap capex-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>OI</th>
              <th>Obra / pacote</th>
              <th>Categoria ORC</th>
              <th>Centro financeiro</th>
              <th class="numeric">Verba aportada</th>
              <th class="numeric">Consumido</th>
              <th class="numeric">Saldo</th>
              <th class="numeric">EV SLT</th>
              <th>Risco / SIC</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .slice(0, 220)
              .map((row) => {
                const status = capexRowStatus(row);
                const riskLabel = row.riskReserve ? `${moneyCents(row.riskUsed)} / ${moneyCents(row.riskReserve)}` : "Sem EV vinculado";
                return `
                  <tr>
                    <td><strong>${row.ordemInterna || "Criar OI"}</strong><br /><span class="muted">${row.codigoObra}</span></td>
                    <td><strong>${row.obraPlano}</strong>${row.descricaoExibicao ? `<br /><span class="muted">${row.descricaoExibicao}</span>` : ""}</td>
                    <td>${row.categoriaOrc}<br /><span class="muted">${row.detalhamentoOrc}</span></td>
                    <td>${row.classificacaoHead}<br /><span class="muted">${row.grupoExecutivo}</span></td>
                    <td class="numeric">${moneyCents(row.verba)}</td>
                    <td class="numeric">${moneyCents(row.consumido)}</td>
                    <td class="numeric">${moneyCents(row.saldo)}</td>
                    <td class="numeric">${row.work ? moneyCents(row.evTotal) : "—"}</td>
                    <td>${riskLabel}</td>
                    <td><span class="status-pill" data-status="${status.tone}">${status.label}</span></td>
                    <td>
                      ${
                        row.work
                          ? `<button class="compact-action" type="button" data-action="open-work-ev" data-id="${row.work.id}">Abrir EV</button>`
                          : `<button class="compact-action" type="button" data-action="feature-soon">Criar OI</button>`
                      }
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      <p class="muted table-note">Mostrando ${Math.min(rows.length, 220)} de ${rows.length} OIs do filtro. Use a busca para refinar.</p>
    </section>
  `;
}

function renderBudgetTransfersTab() {
  const allTransfers = capexTransferRows();
  const transfers = filteredTransferRows(allTransfers);
  const rows = capexOiRows();
  const transferValue = transfers.reduce((sum, row) => sum + Math.abs(row.valor), 0);
  const allValue = allTransfers.reduce((sum, row) => sum + Math.abs(row.valor), 0);
  const differentCategories = transfers.filter((row) => !transferHasSameCategory(row)).length;
  const uniqueOis = new Set(transfers.flatMap((row) => [row.codOrigem, row.codDestino]).filter(Boolean)).size;
  const averageTicket = transferValue / Math.max(transfers.length, 1);
  const monthLabel = transferMonthFilter ? transferMonthName(transferMonthFilter) : "Todos os meses";
  return `
    <section class="transfer-exec-dashboard transfer-exact-dashboard">
      <header class="transfer-exec-header">
        <div>
          <div class="transfer-brand">
            <img src="assets/logo-hapvida.png" alt="Hapvida" />
          </div>
          <h2>Painel Executivo — Transferências entre Ordens Internas (OI) 2026</h2>
          <p>Clique em qualquer card, barra, OI ou linha da tabela para abrir o detalhe da movimentação.</p>
        </div>
        <div class="transfer-source-pill">Fonte: ${capexData().source || "CONTROLE DE CAPEX SISTEMA.xlsx"}</div>
      </header>

      <nav class="transfer-page-nav" aria-label="Navegação local de controle de verbas">
        <button class="is-active" type="button">Transferências entre OI</button>
        <button type="button" data-action="set-budget-tab" data-tab="capex">Grandes Obras — Estudo de Verbas</button>
      </nav>

      <section class="transfer-kpis">
        ${renderTransferKpi("Transferências", String(transfers.length), `${allTransfers.length} registros na base 2026`, "blue", "transferencias")}
        ${renderTransferKpi("Valor movimentado", money(transferValue), `${money(allValue)} na base completa`, "orange", "valor")}
        ${renderTransferKpi("OIs envolvidas", String(uniqueOis), "Origem ou destino no filtro atual", "blue", "ois")}
        ${renderTransferKpi("Alertas ORC", String(differentCategories), "Categoria diferente exige aprovação", differentCategories ? "red" : "green", "orc")}
        ${renderTransferKpi("Ticket médio", money(averageTicket), "Média por transferência no filtro", "blue", "ticket")}
      </section>

      <section class="transfer-card transfer-tracker-card">
        <div class="transfer-card-head">
          <div>
            <h3>Rastreador de OI / Projeto</h3>
            <p>Pesquise uma OI principal e, se necessário, unifique com outra OI da mesma obra.</p>
          </div>
          <button class="ghost-button" type="button" data-action="clear-transfer-filters">Limpar filtros</button>
        </div>
        <div class="transfer-tracker-controls">
          <input list="transferOiList" data-transfer-tracker-search value="${escapeAttribute(transferTrackerQuery)}" placeholder="OI principal — código ou nome..." />
          <input list="transferOiList" data-transfer-tracker-search2 value="${escapeAttribute(transferTrackerQuery2)}" placeholder="+ Unificar com outra OI da mesma obra (opcional)..." />
          <datalist id="transferOiList">${transferOiDatalist(allTransfers)}</datalist>
        </div>
        ${renderTransferTrackerResult(allTransfers)}
      </section>

      <section class="transfer-card">
        <div class="transfer-card-head">
          <div>
            <h3>Fluxo de recursos entre OI, Pacotes e Heads</h3>
            <p>Visual executivo das maiores rotas de verba no filtro atual.</p>
          </div>
          <div class="transfer-tabs">
            ${["oi", "pacote", "head"]
              .map((mode) => `<button class="${transferFlowViewMode === mode ? "is-active" : ""}" type="button" data-action="set-transfer-flow-view" data-mode="${mode}">${transferFlowModeLabel(mode)}</button>`)
              .join("")}
          </div>
        </div>
        <div id="sankeyChart" class="transfer-chart chart" style="height:580px;"></div>
      </section>

      <section class="transfer-card">
        <div class="transfer-card-head">
          <div>
            <h3>Evolução mensal das transferências</h3>
            <p>Filtro atual: <strong>${monthLabel}</strong>. Clique em um mês para concentrar a análise.</p>
          </div>
          <button class="secondary-action" type="button" data-action="set-transfer-month-filter" data-month="">Todos os meses</button>
        </div>
        <div id="monthlyChart" class="transfer-chart chart" style="height:280px;"></div>
      </section>

      <div class="transfer-row2">
        <section class="transfer-card">
          <div class="transfer-card-head">
            <div>
              <h3>OIs que mais cederam saldo</h3>
              <p>Origem das transferências no filtro atual</p>
            </div>
          </div>
          <div id="sendersChart" class="transfer-chart chart" style="height:420px;"></div>
        </section>
        <section class="transfer-card">
          <div class="transfer-card-head">
            <div>
              <h3>OIs que mais receberam saldo</h3>
              <p>Destino das transferências no filtro atual</p>
            </div>
          </div>
          <div id="receiversChart" class="transfer-chart chart" style="height:420px;"></div>
        </section>
      </div>

      <section class="transfer-card">
        <div class="transfer-card-head">
          <div>
            <h3>Maiores transferências individuais</h3>
            <p>Histórico ordenado por valor absoluto transferido.</p>
          </div>
        </div>
        ${renderTransferTopTable(transfers)}
      </section>

      <section class="transfer-card">
        <div class="transfer-card-head">
          <div>
            <h3>Posição líquida por OI</h3>
            <p>Saldo líquido entre entradas e saídas por ordem interna.</p>
          </div>
        </div>
        <div class="transfer-controls">
          <input data-transfer-net-search value="${escapeAttribute(transferNetSearch)}" placeholder="Buscar OI, nome do projeto ou pacote..." />
        </div>
        ${renderTransferNetTable(transfers)}
      </section>

      <section class="transfer-card">
        <div class="transfer-card-head">
          <div>
            <h3>Explorador completo</h3>
            <p>Assistente de busca para pesquisar e filtrar todo o histórico de transferências.</p>
          </div>
          <div class="transfer-source-pill">${transfers.length} de ${allTransfers.length} registros</div>
        </div>
        <div class="transfer-controls transfer-controls--split">
          <input data-transfer-all-search value="${escapeAttribute(transferAllSearch)}" placeholder="Digite OI, obra, pacote, justificativa, documento..." />
          <select data-transfer-month-filter>
            <option value="">Todos os meses</option>
            ${transferMonthOptions(allTransfers)
              .map((month) => `<option value="${month}" ${transferMonthFilter === month ? "selected" : ""}>${transferMonthName(month)}</option>`)
              .join("")}
          </select>
        </div>
        ${renderTransferAllTable(transfers)}
      </section>
    </section>
  `;
}

function capexTransferRows() {
  return (capexData().transferencias || []).map((row, index) => ({
    id: `transfer-${row.sourceRow || index}`,
    index,
    ...row,
    origem: cleanCapexText(row.origem),
    destino: cleanCapexText(row.destino),
    grupoOrigem: cleanCapexText(row.grupoOrigem),
    grupoDestino: cleanCapexText(row.grupoDestino),
    valor: Number(row.valor) || 0,
  }));
}

function renderTransferKpi(label, value, hint, tone, detail) {
  return `
    <button class="transfer-kpi" data-tone="${tone}" type="button" data-action="open-transfer-detail" data-id="${detail}">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${hint}</small>
    </button>
  `;
}

function transferSearchText(row) {
  return normalizeSearchText(
    [
      row.codOrigem,
      row.origem,
      row.grupoOrigem,
      row.codDestino,
      row.destino,
      row.grupoDestino,
      row.valor,
      row.numeroDocumento,
      row.justificativa,
      row.data,
      transferMonthName(transferMonthKey(row)),
    ].join(" ")
  );
}

function filteredTransferRows(rows = capexTransferRows()) {
  const terms = normalizeSearchText(transferAllSearch).split(/\s+/).filter(Boolean);
  return rows.filter((row) => {
    if (transferMonthFilter && transferMonthKey(row) !== transferMonthFilter) return false;
    if (!terms.length) return true;
    const text = transferSearchText(row);
    return terms.every((term) => text.includes(term));
  });
}

function transferHasSameCategory(row) {
  const origin = normalizeSearchText(row.grupoOrigem || row.orcOrigem || "");
  const target = normalizeSearchText(row.grupoDestino || row.orcDestino || "");
  return Boolean(origin && target && origin === target);
}

function transferMonthKey(row) {
  const value = typeof row === "string" ? row : row?.data || "";
  const match = String(value).match(/^(\d{4})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : "";
}

function transferMonthName(key) {
  if (!key) return "Sem data";
  const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const [, month] = key.split("-");
  return `${monthNames[(Number(month) || 1) - 1] || month}/${String(key).slice(2, 4)}`;
}

function transferMonthOptions(rows) {
  return [...new Set(rows.map(transferMonthKey).filter(Boolean))].sort();
}

function transferFlowModeLabel(mode) {
  if (mode === "pacote") return "Por Pacote Capex";
  if (mode === "head") return "Por Head / Área";
  return "Por OI / Projeto";
}

function transferOiDatalist(rows) {
  const entries = new Map();
  rows.forEach((row) => {
    if (row.codOrigem || row.origem) entries.set(`${row.codOrigem} ${row.origem}`, `${row.codOrigem || "Sem OI"} | ${row.origem || "Origem sem nome"}`);
    if (row.codDestino || row.destino) entries.set(`${row.codDestino} ${row.destino}`, `${row.codDestino || "Sem OI"} | ${row.destino || "Destino sem nome"}`);
  });
  return [...entries.values()]
    .slice(0, 300)
    .map((label) => `<option value="${escapeAttribute(label)}"></option>`)
    .join("");
}

function transferMatchesQuery(row, query, side = "any") {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return false;
  const text =
    side === "origem"
      ? normalizeSearchText([row.codOrigem, row.origem, row.grupoOrigem].join(" "))
      : side === "destino"
        ? normalizeSearchText([row.codDestino, row.destino, row.grupoDestino].join(" "))
        : transferSearchText(row);
  return terms.every((term) => text.includes(term));
}

function renderTransferTrackerResult(rows) {
  const primary = transferTrackerQuery.trim();
  const secondary = transferTrackerQuery2.trim();
  if (!primary && !secondary) {
    return `
      <div class="transfer-empty">
        Digite uma OI, projeto ou pacote para montar o rastreio executivo de entrada, saída e saldo líquido.
      </div>
    `;
  }
  const selectedRows = rows.filter((row) => {
    const primaryOk = primary ? transferMatchesQuery(row, primary) : true;
    const secondaryOk = secondary ? transferMatchesQuery(row, secondary) : true;
    return primaryOk && secondaryOk;
  });
  const sent = selectedRows.filter((row) => transferMatchesQuery(row, primary || secondary, "origem")).reduce((sum, row) => sum + Math.abs(row.valor), 0);
  const received = selectedRows.filter((row) => transferMatchesQuery(row, primary || secondary, "destino")).reduce((sum, row) => sum + Math.abs(row.valor), 0);
  const net = received - sent;
  const latest = selectedRows
    .slice()
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")) || Math.abs(b.valor) - Math.abs(a.valor))
    .slice(0, 8);
  if (!selectedRows.length) {
    return `<div class="transfer-empty">Nenhuma transferência encontrada para a busca informada.</div>`;
  }
  return `
    <div class="transfer-tracker-result">
      <div class="transfer-tracker-head">
        ${splitItem("Movimentações", String(selectedRows.length))}
        ${splitItem("Recebido", money(received))}
        ${splitItem("Enviado", money(sent))}
        ${splitItem("Saldo líquido", money(net))}
      </div>
      <div class="transfer-mini-table">
        ${latest
          .map(
            (row) => `
              <button type="button" data-action="open-transfer-detail" data-id="${row.id}">
                <span>${dateText(row.data)} · Doc. ${row.numeroDocumento || "—"}</span>
                <strong>${row.codOrigem || "—"} → ${row.codDestino || "—"}</strong>
                <small>${moneyCents(Math.abs(row.valor))} · ${row.justificativa || "Sem justificativa"}</small>
              </button>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function transferGroupKey(row, side, mode) {
  if (mode === "pacote") return side === "origem" ? row.grupoOrigem || "Sem pacote" : row.grupoDestino || "Sem pacote";
  if (mode === "head") {
    const group = side === "origem" ? row.grupoOrigem : row.grupoDestino;
    return (group || "Sem head").split("|")[0].trim();
  }
  const code = side === "origem" ? row.codOrigem : row.codDestino;
  const name = side === "origem" ? row.origem : row.destino;
  return `${code || "Sem OI"} · ${name || "Não informado"}`;
}

function transferGroupedFlows(rows, mode = transferFlowViewMode) {
  const groups = new Map();
  rows.forEach((row) => {
    const source = transferGroupKey(row, "origem", mode);
    const target = transferGroupKey(row, "destino", mode);
    const key = `${source}=>${target}`;
    const current = groups.get(key) || { source, target, value: 0, count: 0, ids: [] };
    current.value += Math.abs(row.valor);
    current.count += 1;
    current.ids.push(row.id);
    groups.set(key, current);
  });
  return [...groups.values()].sort((a, b) => b.value - a.value).slice(0, 18);
}

function renderTransferFlowPanel(rows) {
  const flows = transferGroupedFlows(rows);
  if (!flows.length) return `<div class="transfer-empty">Sem fluxo para o filtro atual.</div>`;
  const maxValue = Math.max(...flows.map((row) => row.value), 1);
  return `
    <div class="transfer-flow-board">
      ${flows
        .map((row, index) => `
          <button class="transfer-flow-row" type="button" data-action="open-transfer-detail" data-id="${row.ids[0]}">
            <span class="transfer-flow-node">${row.source}</span>
            <span class="transfer-flow-bar">
              <i style="width:${Math.max((row.value / maxValue) * 100, 4)}%"></i>
            </span>
            <span class="transfer-flow-node">${row.target}</span>
            <strong>${moneyCompact(row.value)}</strong>
            <small>${row.count} mov.</small>
          </button>
        `)
        .join("")}
    </div>
  `;
}

function renderTransferMonthlyChart(rows) {
  const months = transferMonthOptions(rows);
  if (!months.length) return `<div class="transfer-empty">Sem datas de transferência para gerar evolução mensal.</div>`;
  const monthly = months.map((month) => {
    const monthRows = rows.filter((row) => transferMonthKey(row) === month);
    return {
      month,
      value: monthRows.reduce((sum, row) => sum + Math.abs(row.valor), 0),
      count: monthRows.length,
    };
  });
  const maxValue = Math.max(...monthly.map((row) => row.value), 1);
  return `
    <div class="transfer-month-chart">
      ${monthly
        .map((row) => `
          <button class="${transferMonthFilter === row.month ? "is-active" : ""}" type="button" data-action="set-transfer-month-filter" data-month="${row.month}">
            <span>${transferMonthName(row.month)}</span>
            <i style="height:${Math.max((row.value / maxValue) * 100, 6)}%"></i>
            <strong>${moneyCompact(row.value)}</strong>
            <small>${row.count} mov.</small>
          </button>
        `)
        .join("")}
    </div>
  `;
}

function transferSideRows(rows, side) {
  const groups = new Map();
  rows.forEach((row) => {
    const code = side === "origem" ? row.codOrigem : row.codDestino;
    const name = side === "origem" ? row.origem : row.destino;
    const group = side === "origem" ? row.grupoOrigem : row.grupoDestino;
    const key = `${code || "Sem OI"}|${name || "Não informado"}`;
    const current = groups.get(key) || { code: code || "Sem OI", name: name || "Não informado", group, value: 0, count: 0 };
    current.value += Math.abs(row.valor);
    current.count += 1;
    groups.set(key, current);
  });
  return [...groups.values()].sort((a, b) => b.value - a.value);
}

function renderTransferSideChart(rows, side) {
  const data = transferSideRows(rows, side).slice(0, 10);
  if (!data.length) return `<div class="transfer-empty">Sem dados para o filtro atual.</div>`;
  const maxValue = Math.max(...data.map((row) => row.value), 1);
  return `
    <div class="transfer-bar-list">
      ${data
        .map((row, index) => `
          <button type="button" data-action="open-transfer-oi" data-oi="${escapeAttribute(`${row.code} ${row.name}`)}">
            <span>
              <strong>${row.code}</strong>
              <small>${row.name}</small>
            </span>
            <i><b style="width:${Math.max((row.value / maxValue) * 100, 4)}%"></b></i>
            <em>${moneyCompact(row.value)}</em>
          </button>
        `)
        .join("")}
    </div>
  `;
}

function disposeTransferChart(id) {
  const element = document.getElementById(id);
  if (!element || !globalThis.echarts) return null;
  const current = globalThis.echarts.getInstanceByDom(element);
  if (current) current.dispose();
  return globalThis.echarts.init(element);
}

function renderTransferChartEmpty(id, message) {
  const element = document.getElementById(id);
  if (element) element.innerHTML = `<div class="transfer-empty transfer-chart-empty">${message}</div>`;
}

function renderTransferDashboardCharts() {
  if (!document.getElementById("sankeyChart")) return;
  if (!globalThis.echarts) {
    ["sankeyChart", "monthlyChart", "sendersChart", "receiversChart"].forEach((id) =>
      renderTransferChartEmpty(id, "Biblioteca ECharts carregando. Atualize a tela se o gráfico não aparecer em alguns segundos.")
    );
    return;
  }

  const allTransfers = capexTransferRows();
  const transfers = filteredTransferRows(allTransfers);
  renderTransferSankeyChart(transfers);
  renderTransferMonthlyEchart(allTransfers);
  renderTransferRankEchart("sendersChart", transferSideRows(transfers, "origem").slice(0, 15), "enviado");
  renderTransferRankEchart("receiversChart", transferSideRows(transfers, "destino").slice(0, 15), "recebido");
}

function renderTransferSankeyChart(rows) {
  const chart = disposeTransferChart("sankeyChart");
  if (!chart) return;
  const flows = transferGroupedFlows(rows, transferFlowViewMode).slice(0, transferFlowViewMode === "oi" ? 22 : 30);
  if (!flows.length) {
    renderTransferChartEmpty("sankeyChart", "Sem fluxo para o filtro atual.");
    return;
  }
  const nodeNames = [...new Set(flows.flatMap((row) => [row.source, row.target]))];
  chart.setOption({
    backgroundColor: "transparent",
    color: ["#0B2E8A", "#1E52D6", "#0067B1", "#FF8702", "#008F5A", "#EF3E42"],
    tooltip: {
      trigger: "item",
      backgroundColor: "#fff",
      borderColor: "#E1E7F2",
      textStyle: { color: "#152048" },
      extraCssText: "box-shadow:0 8px 24px rgba(10,15,40,.15);border-radius:8px;",
      formatter: (params) => {
        if (params.dataType === "edge") {
          return `${params.data.source} → ${params.data.target}<br><b>${moneyCents(params.data.value)}</b> · ${params.data.count} transferência(s)<br><span style="opacity:.7">clique para detalhar</span>`;
        }
        return `<b>${params.name}</b><br><span style="opacity:.7">clique para abrir o rastreador</span>`;
      },
    },
    series: [
      {
        type: "sankey",
        data: nodeNames.map((name) => ({ name })),
        links: flows.map((row) => ({
          source: row.source,
          target: row.target,
          value: row.value,
          count: row.count,
          ids: row.ids,
        })),
        top: 8,
        right: 16,
        bottom: 8,
        left: 16,
        nodeWidth: 14,
        nodeGap: 11,
        draggable: true,
        emphasis: { focus: "adjacency" },
        label: { color: "#152048", fontSize: 11, fontWeight: 700 },
        lineStyle: { color: "gradient", curveness: 0.52, opacity: 0.32 },
      },
    ],
  });
  chart.off("click");
  chart.on("click", (params) => {
    if (params.dataType === "edge" && params.data?.ids?.[0]) {
      openTransferDetailModal(params.data.ids[0]);
      return;
    }
    if (params.name) openTransferOiModal(params.name);
  });
  transferEchartInstances.sankeyChart = chart;
}

function transferMonthlySeries(rows) {
  return transferMonthOptions(rows).map((month) => {
    const monthRows = rows.filter((row) => transferMonthKey(row) === month);
    return {
      month,
      label: transferMonthName(month),
      value: monthRows.reduce((sum, row) => sum + Math.abs(row.valor), 0),
      count: monthRows.length,
    };
  });
}

function renderTransferMonthlyEchart(rows) {
  const chart = disposeTransferChart("monthlyChart");
  if (!chart) return;
  const monthly = transferMonthlySeries(rows);
  if (!monthly.length) {
    renderTransferChartEmpty("monthlyChart", "Sem datas de transferência para gerar evolução mensal.");
    return;
  }
  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderColor: "#E1E7F2",
      textStyle: { color: "#152048" },
      extraCssText: "box-shadow:0 8px 24px rgba(10,15,40,.15);border-radius:8px;",
      formatter: (params) => {
        const item = monthly[params[0].dataIndex];
        return `<b>${item.label}</b><br>Valor: <b>${moneyCents(item.value)}</b><br>Transferências: <b>${item.count}</b><br><span style="opacity:.7">clique para filtrar o mês</span>`;
      },
    },
    legend: { top: 0, textStyle: { color: "#67719A" } },
    grid: { left: 44, right: 44, top: 42, bottom: 34, containLabel: true },
    xAxis: { type: "category", data: monthly.map((row) => row.label), axisLabel: { color: "#67719A" }, axisTick: { show: false } },
    yAxis: [
      { type: "value", axisLabel: { color: "#67719A", formatter: (value) => moneyCompact(value) }, splitLine: { lineStyle: { color: "#EEF1F8" } } },
      { type: "value", axisLabel: { color: "#67719A" }, splitLine: { show: false } },
    ],
    series: [
      {
        name: "Valor movimentado",
        type: "bar",
        data: monthly.map((row) => row.value),
        barWidth: "42%",
        itemStyle: {
          borderRadius: [7, 7, 0, 0],
          color: (params) => (monthly[params.dataIndex].month === transferMonthFilter ? "#FF8702" : "#0B2E8A"),
        },
      },
      {
        name: "Quantidade",
        type: "line",
        yAxisIndex: 1,
        data: monthly.map((row) => row.count),
        symbolSize: 8,
        smooth: true,
        lineStyle: { width: 3, color: "#1E52D6" },
        itemStyle: { color: "#1E52D6" },
      },
    ],
  });
  chart.off("click");
  chart.on("click", (params) => {
    const selected = monthly[params.dataIndex]?.month || "";
    transferMonthFilter = transferMonthFilter === selected ? "" : selected;
    transferAllPage = 1;
    transferNetPage = 1;
    render();
  });
  transferEchartInstances.monthlyChart = chart;
}

function renderTransferRankEchart(id, rows, label) {
  const chart = disposeTransferChart(id);
  if (!chart) return;
  if (!rows.length) {
    renderTransferChartEmpty(id, "Sem dados para o filtro atual.");
    return;
  }
  const sorted = rows.slice().sort((a, b) => a.value - b.value);
  const color = label === "enviado" ? "#EF3E42" : "#1E52D6";
  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderColor: "#E1E7F2",
      textStyle: { color: "#152048" },
      extraCssText: "box-shadow:0 8px 24px rgba(10,15,40,.15);border-radius:8px;",
      formatter: (params) => {
        const item = sorted[params[0].dataIndex];
        return `${item.code} — ${item.name}<br><b>${moneyCents(item.value)}</b> · ${item.count} mov.<br><span style="opacity:.6">clique para detalhar</span>`;
      },
    },
    grid: { left: 10, right: 76, top: 10, bottom: 10, containLabel: true },
    xAxis: { type: "value", axisLabel: { color: "#67719A", formatter: (value) => moneyCompact(value) }, splitLine: { lineStyle: { color: "#EEF1F8" } } },
    yAxis: {
      type: "category",
      data: sorted.map((row) => `${row.code} — ${row.name}`),
      axisLabel: { color: "#152048", fontSize: 10, width: 260, overflow: "truncate" },
      axisTick: { show: false },
    },
    series: [
      {
        name: label === "enviado" ? "Enviado" : "Recebido",
        type: "bar",
        data: sorted.map((row) => row.value),
        barWidth: 12,
        itemStyle: { color, borderRadius: [0, 7, 7, 0] },
        label: { show: true, position: "right", formatter: (params) => moneyCompact(params.value), color: "#67719A", fontSize: 10 },
      },
    ],
  });
  chart.off("click");
  chart.on("click", (params) => {
    const item = sorted[params.dataIndex];
    if (item) openTransferOiModal(`${item.code} ${item.name}`);
  });
  transferEchartInstances[id] = chart;
}

function renderTransferTopTable(rows) {
  const data = rows.slice().sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor)).slice(0, 20);
  return `
    <div class="table-wrap transfer-table-wrap">
      <table class="data-table transfer-data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Origem</th>
            <th>Destino</th>
            <th class="numeric">Valor</th>
            <th>Justificativa</th>
          </tr>
        </thead>
        <tbody>
          ${
            data.length
              ? data
                  .map(
                    (row) => `
                      <tr role="button" tabindex="0" data-action="open-transfer-detail" data-id="${row.id}">
                        <td>${dateText(row.data)}</td>
                        <td><strong>${row.codOrigem || "—"}</strong><br /><span class="muted">${row.origem}</span></td>
                        <td><strong>${row.codDestino || "—"}</strong><br /><span class="muted">${row.destino}</span></td>
                        <td class="numeric">${moneyCents(Math.abs(row.valor))}</td>
                        <td>${row.justificativa || "Sem justificativa"}</td>
                      </tr>
                    `
                  )
                  .join("")
              : `<tr><td colspan="5">Nenhuma transferência encontrada.</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function transferNetRows(rows) {
  const map = new Map();
  rows.forEach((row) => {
    [
      ["origem", row.codOrigem, row.origem, row.grupoOrigem, 0, Math.abs(row.valor)],
      ["destino", row.codDestino, row.destino, row.grupoDestino, Math.abs(row.valor), 0],
    ].forEach(([, code, name, group, received, sent]) => {
      const key = `${code || "Sem OI"}|${name || "Não informado"}`;
      const current = map.get(key) || { code: code || "Sem OI", name: name || "Não informado", group, received: 0, sent: 0, count: 0 };
      current.received += received;
      current.sent += sent;
      current.count += 1;
      map.set(key, current);
    });
  });
  return [...map.values()]
    .map((row) => ({ ...row, net: row.received - row.sent }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

function renderTransferNetTable(rows) {
  const terms = normalizeSearchText(transferNetSearch).split(/\s+/).filter(Boolean);
  const filtered = transferNetRows(rows).filter((row) => {
    if (!terms.length) return true;
    const text = normalizeSearchText([row.code, row.name, row.group].join(" "));
    return terms.every((term) => text.includes(term));
  });
  const pageSize = 18;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  transferNetPage = Math.min(Math.max(transferNetPage, 1), totalPages);
  const pageRows = filtered.slice((transferNetPage - 1) * pageSize, transferNetPage * pageSize);
  return `
    <div class="table-wrap transfer-table-wrap">
      <table class="data-table transfer-data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th class="numeric">Recebido</th>
            <th class="numeric">Enviado</th>
            <th class="numeric">Saldo líquido</th>
            <th class="numeric">Mov.</th>
          </tr>
        </thead>
        <tbody>
          ${
            pageRows.length
              ? pageRows
                  .map(
                    (row) => `
                      <tr role="button" tabindex="0" data-action="open-transfer-oi" data-oi="${escapeAttribute(`${row.code} ${row.name}`)}">
                        <td><strong>${row.code}</strong></td>
                        <td>${row.name}<br /><span class="muted">${row.group || "Sem grupo"}</span></td>
                        <td class="numeric">${moneyCents(row.received)}</td>
                        <td class="numeric">${moneyCents(row.sent)}</td>
                        <td class="numeric"><strong>${moneyCents(row.net)}</strong></td>
                        <td class="numeric">${row.count}</td>
                      </tr>
                    `
                  )
                  .join("")
              : `<tr><td colspan="6">Nenhuma OI localizada.</td></tr>`
          }
        </tbody>
      </table>
    </div>
    ${renderTransferPager("transfer-net-page", transferNetPage, totalPages, filtered.length)}
  `;
}

function renderTransferAllTable(rows) {
  const data = rows.slice().sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")) || Math.abs(b.valor) - Math.abs(a.valor));
  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  transferAllPage = Math.min(Math.max(transferAllPage, 1), totalPages);
  const pageRows = data.slice((transferAllPage - 1) * pageSize, transferAllPage * pageSize);
  return `
    <div class="table-wrap transfer-table-wrap transfer-table-wrap--tall">
      <table class="data-table transfer-data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Doc.</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>Grupo origem</th>
            <th>Grupo destino</th>
            <th class="numeric">Valor</th>
            <th>Regra</th>
          </tr>
        </thead>
        <tbody>
          ${
            pageRows.length
              ? pageRows
                  .map((row) => {
                    const sameCategory = transferHasSameCategory(row);
                    return `
                      <tr role="button" tabindex="0" data-action="open-transfer-detail" data-id="${row.id}">
                        <td>${dateText(row.data)}</td>
                        <td>${row.numeroDocumento || "—"}</td>
                        <td><strong>${row.codOrigem || "—"}</strong><br /><span class="muted">${row.origem}</span></td>
                        <td><strong>${row.codDestino || "—"}</strong><br /><span class="muted">${row.destino}</span></td>
                        <td>${row.grupoOrigem || "—"}</td>
                        <td>${row.grupoDestino || "—"}</td>
                        <td class="numeric">${moneyCents(Math.abs(row.valor))}</td>
                        <td><span class="status-pill" data-status="${sameCategory ? "Completo" : "Pendente"}">${sameCategory ? "Mesma ORC" : "Aprovação"}</span></td>
                      </tr>
                    `;
                  })
                  .join("")
              : `<tr><td colspan="8">Nenhuma transferência encontrada para os filtros informados.</td></tr>`
          }
        </tbody>
      </table>
    </div>
    ${renderTransferPager("transfer-all-page", transferAllPage, totalPages, data.length)}
  `;
}

function renderTransferPager(action, page, totalPages, totalRows) {
  return `
    <div class="transfer-pager">
      <span>Mostrando página ${page} de ${totalPages} · ${totalRows} registro(s)</span>
      <div>
        <button type="button" data-action="${action}" data-direction="-1" ${page <= 1 ? "disabled" : ""}>Anterior</button>
        <button type="button" data-action="${action}" data-direction="1" ${page >= totalPages ? "disabled" : ""}>Próxima</button>
      </div>
    </div>
  `;
}

function openTransferDetailModal(id) {
  const allTransfers = capexTransferRows();
  const filtered = filteredTransferRows(allTransfers);
  const summaryValue = filtered.reduce((sum, row) => sum + Math.abs(row.valor), 0);
  const detailMap = {
    transferencias: {
      title: "Transferências registradas",
      subtitle: "Histórico filtrado das movimentações entre ordens internas.",
      metrics: [
        { label: "Registros", value: String(filtered.length) },
        { label: "Valor movimentado", value: money(summaryValue) },
        { label: "Mesma ORC", value: String(filtered.filter(transferHasSameCategory).length) },
        { label: "Com alerta", value: String(filtered.filter((row) => !transferHasSameCategory(row)).length) },
      ],
      body: renderTransferTopTable(filtered.slice().sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor)).slice(0, 40)),
    },
    valor: {
      title: "Valor movimentado",
      subtitle: "Maiores transferências por valor absoluto no filtro atual.",
      metrics: [
        { label: "Total", value: money(summaryValue) },
        { label: "Maior transferência", value: money(Math.max(...filtered.map((row) => Math.abs(row.valor)), 0)) },
        { label: "Média", value: money(summaryValue / Math.max(filtered.length, 1)) },
        { label: "Filtro", value: transferMonthFilter ? transferMonthName(transferMonthFilter) : "Todos" },
      ],
      body: renderTransferTopTable(filtered),
    },
    ois: {
      title: "OIs envolvidas",
      subtitle: "Ranking líquido de OIs com entrada, saída e saldo.",
      metrics: [
        { label: "OIs", value: String(new Set(filtered.flatMap((row) => [row.codOrigem, row.codDestino]).filter(Boolean)).size) },
        { label: "Transferências", value: String(filtered.length) },
        { label: "Valor", value: money(summaryValue) },
        { label: "Mês", value: transferMonthFilter ? transferMonthName(transferMonthFilter) : "Todos" },
      ],
      body: renderTransferNetTable(filtered),
    },
    orc: {
      title: "Alertas de categoria ORC",
      subtitle: "Transferências em que origem e destino não estão na mesma categoria.",
      metrics: [
        { label: "Alertas", value: String(filtered.filter((row) => !transferHasSameCategory(row)).length) },
        { label: "Dentro da regra", value: String(filtered.filter(transferHasSameCategory).length) },
        { label: "Valor em alerta", value: money(filtered.filter((row) => !transferHasSameCategory(row)).reduce((sum, row) => sum + Math.abs(row.valor), 0)) },
        { label: "Base", value: String(filtered.length) },
      ],
      body: renderTransferTopTable(filtered.filter((row) => !transferHasSameCategory(row))),
    },
  };
  const transfer = allTransfers.find((row) => row.id === id);
  const content = detailMap[id] || (transfer ? transferDetailContent(transfer) : detailMap.transferencias);
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card transfer-detail-modal" aria-labelledby="transferDetailTitle">
        <header>
          <div>
            <span class="eyebrow">Transferências entre OI</span>
            <h2 id="transferDetailTitle">${content.title}</h2>
            <p class="muted">${content.subtitle}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${content.metrics.map((metric) => splitItem(metric.label, metric.value)).join("")}
          </div>
          ${content.body}
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
        </footer>
      </section>
    </div>
  `;
}

function transferDetailContent(row) {
  const sameCategory = transferHasSameCategory(row);
  return {
    title: `${row.codOrigem || "Origem"} → ${row.codDestino || "Destino"}`,
    subtitle: row.justificativa || "Transferência sem justificativa registrada.",
    metrics: [
      { label: "Data", value: dateText(row.data) },
      { label: "Documento", value: row.numeroDocumento || "—" },
      { label: "Valor", value: moneyCents(Math.abs(row.valor)) },
      { label: "Regra ORC", value: sameCategory ? "Mesma categoria" : "Exige aprovação" },
    ],
    body: `
      <div class="split-list">
        ${splitItem("Origem", `${row.codOrigem || "—"} · ${row.origem}`)}
        ${splitItem("Destino", `${row.codDestino || "—"} · ${row.destino}`)}
        ${splitItem("Grupo origem", row.grupoOrigem || "—")}
        ${splitItem("Grupo destino", row.grupoDestino || "—")}
        ${splitItem("Justificativa", row.justificativa || "Sem justificativa")}
      </div>
    `,
  };
}

function openTransferOiModal(query) {
  transferTrackerQuery = query || transferTrackerQuery;
  const rows = capexTransferRows().filter((row) => transferMatchesQuery(row, transferTrackerQuery));
  const sent = rows.filter((row) => transferMatchesQuery(row, transferTrackerQuery, "origem")).reduce((sum, row) => sum + Math.abs(row.valor), 0);
  const received = rows.filter((row) => transferMatchesQuery(row, transferTrackerQuery, "destino")).reduce((sum, row) => sum + Math.abs(row.valor), 0);
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card transfer-detail-modal" aria-labelledby="transferOiTitle">
        <header>
          <div>
            <span class="eyebrow">Rastreador de OI</span>
            <h2 id="transferOiTitle">${transferTrackerQuery || "OI pesquisada"}</h2>
            <p class="muted">Entradas, saídas e histórico de movimentações relacionadas.</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${splitItem("Movimentações", String(rows.length))}
            ${splitItem("Recebido", money(received))}
            ${splitItem("Enviado", money(sent))}
            ${splitItem("Saldo líquido", money(received - sent))}
          </div>
          ${renderTransferTopTable(rows)}
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
        </footer>
      </section>
    </div>
  `;
}

function renderBudgetTransferCheck() {
  const tone = budgetTransferCheck.blocked ? "red" : budgetTransferCheck.needsApproval ? "orange" : "green";
  return `
    <div class="budget-transfer-result" data-tone="${tone}">
      <strong>${budgetTransferCheck.title}</strong>
      <ul>
        ${budgetTransferCheck.messages.map((message) => `<li>${message}</li>`).join("")}
      </ul>
    </div>
  `;
}

function findCapexRowByTerm(term) {
  const normalized = normalizeSearchText(term);
  if (!normalized) return null;
  return capexOiRows().find((row) => {
    const text = normalizeSearchText([row.ordemInterna, row.codigoObra, row.obraPlano, row.descricao].join(" "));
    return text.includes(normalized);
  });
}

function validateBudgetTransfer() {
  const originTerm = document.querySelector("[data-transfer-origin]")?.value || "";
  const targetTerm = document.querySelector("[data-transfer-target]")?.value || "";
  const requestedCategory = document.querySelector("[data-transfer-category]")?.value || "";
  const origin = findCapexRowByTerm(originTerm);
  const target = findCapexRowByTerm(targetTerm);
  const messages = [];
  let blocked = false;
  let needsApproval = false;

  if (!origin) {
    blocked = true;
    messages.push("OI de saída não localizada na base de CAPEX.");
  } else {
    messages.push(`Saída localizada: ${origin.ordemInterna || "sem OI"} · ${origin.obraPlano} · ${origin.categoriaOrc}.`);
  }
  if (!target) {
    blocked = true;
    messages.push("OI de chegada não localizada. Crie a ordem interna antes de transferir verba.");
  } else {
    messages.push(`Chegada localizada: ${target.ordemInterna || "sem OI"} · ${target.obraPlano} · ${target.categoriaOrc}.`);
  }
  if (origin && target && normalizeSearchText(origin.categoriaOrc) !== normalizeSearchText(target.categoriaOrc)) {
    needsApproval = true;
    messages.push(`Categorias ORC diferentes: ${origin.categoriaOrc} → ${target.categoriaOrc}. Solicitar aprovação formal.`);
  }
  if (origin && requestedCategory && normalizeSearchText(requestedCategory) !== normalizeSearchText(origin.categoriaOrc)) {
    needsApproval = true;
    messages.push(`Categoria solicitada (${requestedCategory}) difere da categoria de saída (${origin.categoriaOrc}).`);
  }
  if (!blocked && !needsApproval) messages.push("Transferência dentro da mesma categoria ORC. Pronta para seguir fluxo de aprovação.");

  budgetTransferCheck = {
    blocked,
    needsApproval,
    title: blocked ? "Transferência bloqueada" : needsApproval ? "Transferência exige aprovação" : "Transferência validada",
    messages,
  };
  render();
}

function renderCapexCurveTab() {
  const allRows = capexCurveScopedRows(capexOiRows());
  const rows = capexCurveScopedRows(filteredCapexRows());
  const summary = capexSummary(rows);
  const monthRows = capexMonthlyRows(capexCurveScope === "manutencao" ? Math.max(summary.totalVerba, 1) : hapcapexReference.capexAtual);
  const metrics = capexCurveMetrics(monthRows);
  const topWorks = capexCurveWorkRows(rows, metrics.ytdFactor);
  const typeRows = capexCurveGroupRows(rows, "categoriaOrc", "verba", 12);
  const scopeTitle = capexCurveScope === "manutencao" ? "Manutenção" : "Obras";
  return `
    <section class="hapcapex-page">
      <header class="hapcapex-local-header">
        <div>
          <h2>HAPCAPEX - Controle Financeiro de ${scopeTitle}</h2>
          <p>Curva financeira integrada ao Controle de Verba 360, preservando previsto aprovado, consumo planejado e consumo não planejado.</p>
        </div>
        <button class="hapcapex-badge" type="button" data-action="open-capex-curve-detail" data-detail="governanca">Coordenação Sala Técnica</button>
      </header>

      <nav class="hapcapex-page-nav" aria-label="Navegação local HAPCAPEX">
        <button class="page-btn ${capexCurveScope === "obras" ? "active" : ""}" type="button" data-action="set-capex-curve-scope" data-scope="obras">Obras</button>
        <button class="page-btn ${capexCurveScope === "manutencao" ? "active" : ""}" type="button" data-action="set-capex-curve-scope" data-scope="manutencao">Manutenção</button>
      </nav>

      <div class="hapcapex-container">
        <div class="desktop-filter-reset">
          <button class="btn-clear" type="button" data-action="clear-budget-filters">Limpar todos os filtros</button>
        </div>

        ${renderHapcapexMonthFilter(monthRows, metrics.closedIndex)}
        ${renderHapcapexKpis(summary, metrics, rows.length, allRows.length)}
        ${renderHapcapexTipoSection(typeRows)}
        ${renderHapcapexFinancialTable(rows, monthRows, metrics)}
        ${renderHapcapexCharts(monthRows, topWorks, rows)}
        ${renderHapcapexRiskPanel(topWorks)}
        ${renderHapcapexAnalysis(metrics, topWorks)}
      </div>
    </section>
  `;
}

function capexCurveSelectedMonths() {
  if (Array.isArray(capexCurveMonthFilter)) return capexCurveMonthFilter.filter(Boolean);
  return capexCurveMonthFilter ? [capexCurveMonthFilter] : [];
}

function sortCapexCurveMonths(months) {
  const order = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  return [...new Set(months.filter(Boolean))].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function capexCurvePeriodLabel(months, closedMonth = "JUL") {
  if (!months.length) return `YTD até ${closedMonth}/26`;
  return months.length === 1 ? `${months[0]}/26` : `${months.join(" + ")}/26`;
}

function capexCurveMetrics(monthRows) {
  const selectedMonths = capexCurveSelectedMonths();
  const selectedIndexes = selectedMonths
    .map((month) => monthRows.find((row) => row.month === month)?.index)
    .filter((index) => Number.isFinite(index));
  const hasMonthSelection = selectedIndexes.length > 0;
  const closedIndex = hasMonthSelection ? Math.max(...selectedIndexes) : capexClosedMonthIndex();
  const ytdRows = hasMonthSelection
    ? monthRows.filter((row) => selectedMonths.includes(row.month))
    : monthRows.filter((row) => row.index <= closedIndex);
  const plannedYtd = ytdRows.reduce((sum, row) => sum + row.previsto, 0);
  const plannedRealizedYtd = ytdRows.reduce((sum, row) => sum + row.realizadoPlanejado, 0);
  const unplannedYtd = ytdRows.reduce((sum, row) => sum + row.realizadoNaoPlanejado + row.realizadoOper, 0);
  const realizedYtd = plannedRealizedYtd + unplannedYtd;
  const deviation = realizedYtd - plannedYtd;
  const deviationPercent = plannedYtd ? (deviation / plannedYtd) * 100 : 0;
  const status = capexDeviationStatus(deviationPercent);
  const totalPlanned = monthRows.reduce((sum, row) => sum + row.previsto, 0);
  return {
    closedIndex,
    monthLabel: monthRows[closedIndex]?.month || "JUL",
    plannedYtd,
    plannedRealizedYtd,
    unplannedYtd,
    realizedYtd,
    deviation,
    deviationPercent,
    status,
    totalPlanned,
    selectedMonths,
    hasMonthSelection,
    ytdFactor: totalPlanned ? plannedYtd / totalPlanned : 0,
    periodLabel: capexCurvePeriodLabel(selectedMonths, monthRows[closedIndex]?.month || "JUL"),
  };
}

function capexCurveScopedRows(rows) {
  return rows.filter((row) => {
    const kind = capexCategoryKind(row);
    return capexCurveScope === "manutencao" ? kind.startsWith("OPEX") : kind === "CAPEX";
  });
}

function capexCurveWorkRows(rows, ytdFactor) {
  return rows
    .map((row) => {
      const capex = Number(row.verba) || 0;
      const realized = Math.max(Number(row.consumoLancado) || 0, Number(row.consumido) || 0);
      const plannedYtd = capex * ytdFactor;
      const deviation = realized - plannedYtd;
      const deviationPercent = plannedYtd ? (deviation / plannedYtd) * 100 : 0;
      return {
        ...row,
        capex,
        realized,
        plannedYtd,
        deviation,
        deviationPercent,
        status: capexDeviationStatus(deviationPercent),
      };
    })
    .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
}

function capexCurveGroupRows(rows, field, valueField = "verba", limit = 12) {
  const map = new Map();
  rows.forEach((row) => {
    const label = cleanCapexText(row[field]) || "Não informado";
    map.set(label, (map.get(label) || 0) + (Number(row[valueField]) || 0));
  });
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function renderHapcapexMonthFilter(monthRows, closedIndex) {
  const selectedMonths = capexCurveSelectedMonths();
  const hasSelection = selectedMonths.length > 0;
  return `
    <div class="month-filter-bar">
      <div class="mf-label">Filtro por Período</div>
      <div class="mf-chips">
        ${monthRows
          .map((row) => {
            const selected = selectedMonths.includes(row.month);
            const active = hasSelection ? selected : row.index <= closedIndex;
            return `<button class="mf-chip ${active ? "active" : ""} ${selected ? "selected" : ""}" type="button" data-action="set-capex-curve-month" data-month="${row.month}" aria-pressed="${selected ? "true" : "false"}">${row.month}</button>`;
          })
          .join("")}
      </div>
      <span class="mf-info">${hasSelection ? `Período selecionado: ${selectedMonths.join(" + ")}/26` : `Referência YTD até ${monthRows[closedIndex]?.month || "JUL"}/26`}</span>
      <button class="btn-mf-clear" type="button" data-action="set-capex-curve-month" data-month="">Todos os meses</button>
    </div>
  `;
}

function renderHapcapexKpis(summary, metrics, visibleRows, totalRows) {
  return `
    <div class="kpi-grid hapcapex-kpi-grid" id="kpi-section">
      ${renderHapcapexKpi("CAPEX Atual", money(hapcapexReference.capexAtual), "Inicial + aportes - contingenciamentos", "blue", "capexAtual")}
      ${renderHapcapexKpi(metrics.hasMonthSelection ? "Previsto no período" : "Previsto YTD", money(metrics.plannedYtd), metrics.periodLabel, "blue", "previsto")}
      ${renderHapcapexKpi("Realizado planejado", money(metrics.plannedRealizedYtd), "Consumo de obras planejadas", "green", "realizado")}
      ${renderHapcapexKpi("Não planejadas / OPER", money(metrics.unplannedYtd), "Separado do CAPEX individual do projeto", "orange", "naoPlanejado")}
      ${renderHapcapexKpi("Desvio YTD", `${money(metrics.deviation)} (${number(metrics.deviationPercent, 1)}%)`, metrics.status.label, metrics.status.tone, "desvio")}
      ${renderHapcapexKpi("OIs no filtro", String(visibleRows), `${totalRows} OIs importadas`, "blue", "ois")}
      ${renderHapcapexKpi("Soma OIs importada", money(summary.totalVerba), "Base de controle de CAPEX", "blue", "somaOis")}
      ${renderHapcapexKpi("Saldo das OIs", money(summary.totalSaldo), "Verba aportada - consumo", summary.totalSaldo < 0 ? "red" : "green", "saldo")}
    </div>
  `;
}

function renderHapcapexKpi(title, value, detail, tone = "blue", detailKey = "") {
  return `
    <article class="hapcapex-kpi is-clickable" data-tone="${tone}" data-action="open-capex-curve-detail" data-detail="${detailKey || normalizeSearchText(title)}" role="button" tabindex="0">
      <span>${title}</span>
      <strong>${value}</strong>
      <small>${detail}</small>
    </article>
  `;
}

function renderHapcapexTipoSection(rows) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return `
    <section class="tipo-section">
      <div class="section-title">CAPEX por Tipologia - seleção múltipla: clique para filtrar <span>clique em "Todas" para limpar</span></div>
      <div class="tipo-grid">
        ${rows
          .map((row, index) => {
            const percent = total ? (row.value / total) * 100 : 0;
            return `
              <article class="tipo-card ${index === 0 ? "is-main" : ""}" data-action="set-capex-curve-category" data-category="${escapeAttribute(row.label)}" role="button" tabindex="0">
                <strong>${row.label}</strong>
                <span>${money(row.value)}</span>
                <em>${number(percent, 1)}%</em>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderHapcapexFinancialTable(rows, monthRows, metrics) {
  const tableRows = [...rows].sort((a, b) => (Number(b.verba) || 0) - (Number(a.verba) || 0)).slice(0, 120);
  const monthTotal = Math.max(monthRows.reduce((sum, row) => sum + row.previsto, 0), 1);
  return `
    <section class="table-card hapcapex-table-card">
      <div class="section-title">Fluxo Financeiro Mensal por Obra (R$)</div>
      <div class="filter-bar">
        <input type="text" data-budget-search value="${escapeAttribute(budgetFilters.query)}" placeholder="Buscar obra, OI, pacote ou categoria..." />
        <select data-budget-filter="categoriaOrc">${capexFilterOptions(capexOiRows().map((row) => row.categoriaOrc), budgetFilters.categoriaOrc, "Todas as tipologias")}</select>
        <button class="btn-clear" type="button" data-action="clear-budget-filters">Limpar busca</button>
        <span class="filter-count">Mostrando ${tableRows.length} de ${rows.length} OIs</span>
      </div>
      <div class="tab-bar">
        <button class="tab-btn ${capexCurveTableMode === "previsto" ? "active" : ""}" type="button" data-action="set-capex-curve-table" data-mode="previsto">Fluxo Previsto (15/75/10)</button>
        <button class="tab-btn ${capexCurveTableMode === "realizado" ? "active" : ""}" type="button" data-action="set-capex-curve-table" data-mode="realizado">Previsto vs Realizado</button>
      </div>
      <div class="tab-content active">
        <div class="table-wrapper">
          ${capexCurveTableMode === "previsto" ? renderHapcapexPlannedTable(tableRows, monthRows, monthTotal) : renderHapcapexRealizedTable(tableRows, metrics)}
        </div>
      </div>
    </section>
  `;
}

function renderHapcapexPlannedTable(rows, monthRows, monthTotal) {
  return `
    <table class="data-table hapcapex-data-table">
      <thead>
        <tr>
          <th>Obra</th>
          <th>OI</th>
          <th>Tipologia</th>
          <th class="numeric">CAPEX</th>
          ${monthRows.map((row) => `<th class="numeric">${row.month}</th>`).join("")}
          <th class="numeric">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map((row) => {
            const capex = Number(row.verba) || 0;
            return `
              <tr data-action="open-capex-curve-detail" data-detail="obra" data-label="${escapeAttribute(row.obraPlano)}" role="button" tabindex="0">
                <td><strong>${row.obraPlano}</strong><br /><span class="muted">${row.descricao}</span></td>
                <td><strong>${row.ordemInterna || "Sem OI"}</strong></td>
                <td>${row.categoriaOrc}</td>
                <td class="numeric">${moneyCents(capex)}</td>
                ${monthRows.map((month) => `<td class="numeric">${moneyCents(capex * (month.previsto / monthTotal))}</td>`).join("")}
                <td class="numeric"><strong>${moneyCents(capex)}</strong></td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderHapcapexRealizedTable(rows, metrics) {
  return `
    <table class="data-table hapcapex-data-table">
      <thead>
        <tr>
          <th>Obra</th>
          <th>OI</th>
          <th>Categoria ORC</th>
          <th class="numeric">Previsto YTD</th>
          <th class="numeric">Realizado</th>
          <th class="numeric">Desvio</th>
          <th class="numeric">Desvio %</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map((row) => {
            const item = capexCurveWorkRows([row], metrics.ytdFactor)[0];
            return `
              <tr data-action="open-capex-curve-detail" data-detail="obra" data-label="${escapeAttribute(item.obraPlano)}" role="button" tabindex="0">
                <td><strong>${item.obraPlano}</strong><br /><span class="muted">${item.descricao}</span></td>
                <td><strong>${item.ordemInterna || "Sem OI"}</strong></td>
                <td>${item.categoriaOrc}</td>
                <td class="numeric">${moneyCents(item.plannedYtd)}</td>
                <td class="numeric">${moneyCents(item.realized)}</td>
                <td class="numeric">${moneyCents(item.deviation)}</td>
                <td class="numeric">${number(item.deviationPercent, 1)}%</td>
                <td><span class="status-pill" data-status="${item.status.tone === "green" ? "Completo" : item.status.tone === "orange" ? "Pendente" : "Saldo crítico"}">${item.status.label}</span></td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderHapcapexCharts(monthRows, topWorks, rows) {
  return `
    <div class="charts-row hapcapex-charts-row">
      <section class="chart-card full is-clickable" data-action="open-capex-curve-detail" data-detail="mensal" role="button" tabindex="0">
        <h3>Fluxo Previsto vs Realizado (Jan-Dez 2026)</h3>
        <div class="chart-container" style="height:420px"><canvas id="chartLine"></canvas></div>
      </section>
      <section class="chart-card full is-clickable" data-action="open-capex-curve-detail" data-detail="curvaS" role="button" tabindex="0">
        <h3 id="accumulatedChartTitle">Curva S do CAPEX - Previsto vs Realizado acumulado</h3>
        <div class="chart-container" style="height:340px"><canvas id="chartAcumulado"></canvas></div>
      </section>
      <section class="chart-card full is-clickable" data-action="open-capex-curve-detail" data-detail="desvios" role="button" tabindex="0">
        <h3>Desvio Previsto vs Realizado por Obra</h3>
        <div class="chart-container" id="chartDesvioContainer" style="height:280px"><canvas id="chartDesvio"></canvas></div>
      </section>
      <section class="chart-card full is-clickable" data-action="open-capex-curve-detail" data-detail="tipologias" role="button" tabindex="0">
        <h3>Desembolso Mensal por Tipologia de Obra (Jan-Dez 2026)</h3>
        <div class="chart-container" style="height:340px"><canvas id="chartStacked"></canvas></div>
      </section>
    </div>
  `;
}

function destroyChartJsInstance(store, id) {
  if (store[id]) {
    store[id].destroy();
    delete store[id];
  }
}

function chartCurrencyOptions() {
  return {
    callback: (value) => moneyCompact(value),
    color: "#667085",
  };
}

function renderHapcapexChartEmpty(id, message) {
  const canvas = document.getElementById(id);
  const container = canvas?.closest(".chart-container");
  if (container) container.innerHTML = `<div class="empty-state">${message}</div>`;
}

function renderHapcapexDashboardCharts() {
  if (!document.getElementById("chartLine")) return;
  if (!globalThis.Chart) {
    ["chartLine", "chartAcumulado", "chartDesvio", "chartStacked"].forEach((id) =>
      renderHapcapexChartEmpty(id, "Biblioteca Chart.js carregando. Atualize a tela se o gráfico não aparecer em alguns segundos.")
    );
    return;
  }
  const scopedRows = capexCurveScopedRows(filteredCapexRows());
  const summary = capexSummary(scopedRows);
  const monthRows = capexMonthlyRows(capexCurveScope === "manutencao" ? Math.max(summary.totalVerba, 1) : hapcapexReference.capexAtual);
  const metrics = capexCurveMetrics(monthRows);
  const topWorks = capexCurveWorkRows(scopedRows, metrics.ytdFactor).slice(0, 12);
  const groups = capexCurveGroupRows(scopedRows, "categoriaOrc", "verba", 8);
  renderHapcapexMonthlyCanvas(monthRows);
  renderHapcapexSCurveCanvas(monthRows);
  renderHapcapexDeviationCanvas(topWorks);
  renderHapcapexStackedCanvas(monthRows, groups);
}

function chartBaseOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { labels: { color: "#344054", boxWidth: 12, boxHeight: 12, usePointStyle: true } },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#152048",
        bodyColor: "#152048",
        borderColor: "#E1E7F2",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${moneyCents(context.parsed.y ?? context.parsed.x ?? context.raw)}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#667085" }, grid: { display: false } },
      y: { ticks: chartCurrencyOptions(), grid: { color: "#EEF1F8" } },
    },
    ...extra,
  };
}

function renderHapcapexMonthlyCanvas(rows) {
  const canvas = document.getElementById("chartLine");
  if (!canvas) return;
  destroyChartJsInstance(hapcapexChartInstances, "chartLine");
  const labels = rows.map((row) => row.month);
  hapcapexChartInstances.chartLine = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { type: "bar", label: "Previsto aprovado", data: rows.map((row) => row.previsto), backgroundColor: "#0B2E8A", borderRadius: 7, barPercentage: 0.58 },
        { type: "bar", label: "Realizado planejado", data: rows.map((row) => row.realizadoPlanejado), backgroundColor: "#008F5A", borderRadius: 7, barPercentage: 0.58 },
        { type: "bar", label: "Não planejadas / OPER", data: rows.map((row) => row.realizadoNaoPlanejado + row.realizadoOper), backgroundColor: "#FF8702", borderRadius: 7, barPercentage: 0.58 },
        {
          type: "line",
          label: "Realizado total",
          data: rows.map((row) => row.realizadoPlanejado + row.realizadoNaoPlanejado + row.realizadoOper),
          borderColor: "#FF5007",
          backgroundColor: "#FF5007",
          tension: 0.32,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
      ],
    },
    options: chartBaseOptions({
      onClick: (_event, elements) => {
        const item = elements?.[0];
        if (!item) return;
        capexCurveMonthFilter = [labels[item.index]];
        render();
      },
    }),
  });
}

function renderHapcapexSCurveCanvas(rows) {
  const canvas = document.getElementById("chartAcumulado");
  if (!canvas) return;
  destroyChartJsInstance(hapcapexChartInstances, "chartAcumulado");
  hapcapexChartInstances.chartAcumulado = new Chart(canvas, {
    type: "line",
    data: {
      labels: rows.map((row) => row.month),
      datasets: [
        {
          label: "Previsto acumulado",
          data: rows.map((row) => row.previstoAcumulado),
          borderColor: "#0B2E8A",
          backgroundColor: "rgba(11,46,138,.08)",
          tension: 0.35,
          fill: false,
          borderWidth: 3,
          pointRadius: 4,
        },
        {
          label: "Realizado planejado",
          data: rows.map((row) => row.realizadoPlanejadoAcumulado),
          borderColor: "#008F5A",
          backgroundColor: "rgba(0,143,90,.08)",
          tension: 0.35,
          fill: false,
          borderWidth: 3,
          pointRadius: 4,
        },
        {
          label: "Realizado total",
          data: rows.map((row) => row.realizadoTotalAcumulado),
          borderColor: "#FF8702",
          backgroundColor: "rgba(255,135,2,.08)",
          tension: 0.35,
          fill: false,
          borderWidth: 3,
          pointRadius: 4,
        },
      ],
    },
    options: chartBaseOptions(),
  });
}

function renderHapcapexDeviationCanvas(rows) {
  const canvas = document.getElementById("chartDesvio");
  if (!canvas) return;
  destroyChartJsInstance(hapcapexChartInstances, "chartDesvio");
  if (!rows.length) {
    renderHapcapexChartEmpty("chartDesvio", "Sem desvios para exibir no filtro atual.");
    return;
  }
  const ordered = rows.slice().sort((a, b) => Math.abs(a.deviation) - Math.abs(b.deviation));
  hapcapexChartInstances.chartDesvio = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ordered.map((row) => row.obraPlano),
      datasets: [
        {
          label: "Desvio previsto x realizado",
          data: ordered.map((row) => row.deviation),
          backgroundColor: ordered.map((row) => (row.status.tone === "red" ? "#FF212C" : row.status.tone === "orange" ? "#FF8702" : "#008F5A")),
          borderRadius: 7,
          barPercentage: 0.62,
        },
      ],
    },
    options: chartBaseOptions({
      indexAxis: "y",
      plugins: {
        ...chartBaseOptions().plugins,
        legend: { display: false },
      },
      scales: {
        x: { ticks: chartCurrencyOptions(), grid: { color: "#EEF1F8" } },
        y: { ticks: { color: "#344054", font: { size: 10 } }, grid: { display: false } },
      },
      onClick: (_event, elements) => {
        const item = elements?.[0];
        if (item) openCapexCurveDetail("obra", ordered[item.index]?.obraPlano || "");
      },
    }),
  });
}

function renderHapcapexStackedCanvas(monthRows, groups) {
  const canvas = document.getElementById("chartStacked");
  if (!canvas) return;
  destroyChartJsInstance(hapcapexChartInstances, "chartStacked");
  const total = Math.max(groups.reduce((sum, row) => sum + row.value, 0), 1);
  const monthTotal = Math.max(monthRows.reduce((sum, row) => sum + row.previsto, 0), 1);
  const palette = ["#0B2E8A", "#1E52D6", "#008F5A", "#FF8702", "#087F9C", "#B7791F", "#FF5007", "#667085"];
  hapcapexChartInstances.chartStacked = new Chart(canvas, {
    type: "bar",
    data: {
      labels: monthRows.map((row) => row.month),
      datasets: groups.map((group, index) => ({
        label: group.label,
        data: monthRows.map((month) => group.value * (month.previsto / monthTotal)),
        backgroundColor: palette[index % palette.length],
        stack: "capex",
        borderRadius: 4,
      })),
    },
    options: chartBaseOptions({
      plugins: {
        ...chartBaseOptions().plugins,
        tooltip: {
          ...chartBaseOptions().plugins.tooltip,
          callbacks: {
            label: (context) => `${context.dataset.label}: ${moneyCents(context.parsed.y)} (${number(((context.parsed.y || 0) / total) * 100, 1)}% da categoria)`,
          },
        },
      },
      scales: {
        x: { stacked: true, ticks: { color: "#667085" }, grid: { display: false } },
        y: { stacked: true, ticks: chartCurrencyOptions(), grid: { color: "#EEF1F8" } },
      },
    }),
  });
}

function renderHapcapexSCurve(rows) {
  const width = 760;
  const height = 300;
  const left = 58;
  const right = 20;
  const top = 20;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const max = Math.max(
    ...rows.map((row) => Math.max(row.previstoAcumulado, row.realizadoPlanejadoAcumulado, row.realizadoTotalAcumulado)),
    1
  );
  const xFor = (index) => left + (plotWidth / Math.max(rows.length - 1, 1)) * index;
  const yFor = (value) => top + plotHeight - (Math.max(value, 0) / max) * plotHeight;
  const points = (field) => rows.map((row, index) => `${numberRaw(xFor(index))},${numberRaw(yFor(row[field]))}`).join(" ");
  const monthTicks = rows
    .map((row, index) => {
      const x = xFor(index);
      return `<text x="${numberRaw(x)}" y="${height - 17}" text-anchor="middle">${row.month}</text>`;
    })
    .join("");
  const circles = (field, cls) =>
    rows
      .map((row, index) => {
        const x = xFor(index);
        const y = yFor(row[field]);
        return `<circle class="${cls}" cx="${numberRaw(x)}" cy="${numberRaw(y)}" r="4"><title>${row.month}: ${moneyCents(row[field])}</title></circle>`;
      })
      .join("");
  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map((step) => {
      const y = top + plotHeight - plotHeight * step;
      return `
        <line x1="${left}" x2="${width - right}" y1="${numberRaw(y)}" y2="${numberRaw(y)}"></line>
        <text x="8" y="${numberRaw(y + 4)}">${moneyCompact(max * step)}</text>
      `;
    })
    .join("");
  return `
    <div class="hapcapex-scurve">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Curva S do CAPEX com previsto e realizado acumulado">
        <g class="hapcapex-scurve-grid">${grid}</g>
        <polyline class="planned" points="${points("previstoAcumulado")}"></polyline>
        <polyline class="real-planned" points="${points("realizadoPlanejadoAcumulado")}"></polyline>
        <polyline class="real-total" points="${points("realizadoTotalAcumulado")}"></polyline>
        ${circles("previstoAcumulado", "planned-dot")}
        ${circles("realizadoPlanejadoAcumulado", "real-planned-dot")}
        ${circles("realizadoTotalAcumulado", "real-total-dot")}
        <g class="hapcapex-scurve-months">${monthTicks}</g>
      </svg>
    </div>
    <div class="chart-legend">
      <span><i data-tone="blue"></i>Previsto acumulado</span>
      <span><i data-tone="green"></i>Realizado planejado</span>
      <span><i data-tone="orange"></i>Realizado total</span>
    </div>
  `;
}

function numberRaw(value) {
  return (Number(value) || 0).toFixed(2);
}

function renderHapcapexMonthlyComparison(rows) {
  const max = Math.max(...rows.map((row) => Math.max(row.previsto, row.realizadoPlanejado, row.realizadoNaoPlanejado + row.realizadoOper)), 1);
  return `
    <div class="hapcapex-month-chart">
      ${rows
        .map((row) => {
          const unplanned = row.realizadoNaoPlanejado + row.realizadoOper;
          return `
            <article>
              <div class="hapcapex-month-bars">
                <i title="Previsto ${moneyCents(row.previsto)}" style="height:${Math.max((row.previsto / max) * 100, 2)}%"></i>
                <b title="Realizado planejado ${moneyCents(row.realizadoPlanejado)}" style="height:${Math.max((row.realizadoPlanejado / max) * 100, row.realizadoPlanejado ? 2 : 0)}%"></b>
                <em title="Não planejado / OPER ${moneyCents(unplanned)}" style="height:${Math.max((unplanned / max) * 100, unplanned ? 2 : 0)}%"></em>
              </div>
              <strong>${row.month}</strong>
            </article>
          `;
        })
        .join("")}
    </div>
    <div class="chart-legend">
      <span><i data-tone="blue"></i>Previsto</span>
      <span><i data-tone="green"></i>Realizado planejado</span>
      <span><i data-tone="orange"></i>Não planejado / OPER</span>
    </div>
  `;
}

function renderHapcapexAccumulatedComparison(rows) {
  const max = Math.max(...rows.map((row) => Math.max(row.previstoAcumulado, row.realizadoPlanejadoAcumulado, row.realizadoTotalAcumulado)), 1);
  return `
    <div class="hapcapex-accumulated">
      ${rows
        .map((row) => `
          <article>
            <span>${row.month}</span>
            <div>
              <em title="Previsto acumulado ${moneyCents(row.previstoAcumulado)}"><i style="width:${Math.max((row.previstoAcumulado / max) * 100, 2)}%"></i></em>
              <em title="Realizado planejado acumulado ${moneyCents(row.realizadoPlanejadoAcumulado)}"><b style="width:${Math.max((row.realizadoPlanejadoAcumulado / max) * 100, row.realizadoPlanejadoAcumulado ? 2 : 0)}%"></b></em>
              <em title="Realizado total acumulado ${moneyCents(row.realizadoTotalAcumulado)}"><u style="width:${Math.max((row.realizadoTotalAcumulado / max) * 100, row.realizadoTotalAcumulado ? 2 : 0)}%"></u></em>
            </div>
            <strong>${moneyCompact(row.realizadoTotalAcumulado)}</strong>
          </article>
        `)
        .join("")}
    </div>
    <div class="chart-legend">
      <span><i data-tone="blue"></i>Previsto acumulado</span>
      <span><i data-tone="green"></i>Planejado</span>
      <span><i data-tone="orange"></i>Total</span>
    </div>
  `;
}

function renderHapcapexDeviationBars(rows) {
  if (!rows.length) return `<div class="empty-state">Sem desvios para exibir no filtro atual.</div>`;
  const max = Math.max(...rows.map((row) => Math.abs(row.deviation)), 1);
  return `
    <div class="hapcapex-deviation-list">
      ${rows
        .map((row) => {
          const tone = row.status.tone;
          return `
            <article data-tone="${tone}">
              <div>
                <strong>${row.obraPlano}</strong>
                <span>${row.categoriaOrc} · ${row.ordemInterna || "sem OI"}</span>
              </div>
              <em><i data-tone="${tone}" style="width:${Math.max((Math.abs(row.deviation) / max) * 100, 2)}%"></i></em>
              <b>${moneyCents(row.deviation)}</b>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderHapcapexCategoryStack(rows) {
  const groups = capexCurveGroupRows(rows, "categoriaOrc", "verba", 10);
  const total = Math.max(groups.reduce((sum, row) => sum + row.value, 0), 1);
  return `
    <div class="hapcapex-stack">
      <div class="hapcapex-stack-bar">
        ${groups
          .map((row, index) => `<span data-index="${index % 5}" style="width:${Math.max((row.value / total) * 100, 1)}%" title="${row.label} ${moneyCents(row.value)}"></span>`)
          .join("")}
      </div>
      <div class="hapcapex-stack-legend">
        ${groups
          .map((row, index) => `
            <article>
              <i data-index="${index % 5}"></i>
              <strong>${row.label}</strong>
              <span>${money(row.value)}</span>
              <small>${number((row.value / total) * 100, 1)}%</small>
            </article>
          `)
          .join("")}
      </div>
    </div>
  `;
}

function renderHapcapexRiskPanel(rows) {
  const riskyRows = rows.filter((row) => row.status.tone !== "green").slice(0, 10);
  return `
    <section class="risk-card is-clickable" data-action="open-capex-curve-detail" data-detail="riscos" role="button" tabindex="0">
      <div class="section-title">Painel de Riscos - Desvio Previsto vs Realizado</div>
      <div class="hapcapex-risk-grid">
        ${
          riskyRows.length
            ? riskyRows
                .map((row) => `
                  <article data-tone="${row.status.tone}" data-action="open-capex-curve-detail" data-detail="obra" data-label="${escapeAttribute(row.obraPlano)}" role="button" tabindex="0">
                    <strong>${row.obraPlano}</strong>
                    <span>${row.status.label} · ${number(row.deviationPercent, 1)}%</span>
                    <em>${moneyCents(row.deviation)}</em>
                  </article>
                `)
                .join("")
            : `<div class="empty-state">Nenhum desvio crítico no filtro atual.</div>`
        }
      </div>
    </section>
  `;
}

function renderHapcapexAnalysis(metrics, topWorks) {
  const worst = topWorks.find((row) => row.status.tone !== "green") || topWorks[0];
  const statusText =
    metrics.status.tone === "green"
      ? "A curva acumulada está dentro da faixa de controle de 10%."
      : `A curva acumulada está em ${metrics.status.label.toLowerCase()}, com desvio de ${number(metrics.deviationPercent, 1)}% sobre o previsto YTD.`;
  return `
    <section class="analysis-card is-clickable" data-action="open-capex-curve-detail" data-detail="analise" role="button" tabindex="0">
      <div class="section-title">Análise Interpretativa de Riscos - Coordenação Sala Técnica</div>
      <p>${statusText}</p>
      <p>${
        worst
          ? `Principal ponto de atenção: <strong>${worst.obraPlano}</strong>, com desvio de <strong>${moneyCents(worst.deviation)}</strong> frente à referência YTD estimada.`
          : "Ainda não há obra com desvio calculado no filtro atual."
      }</p>
      <p>Recomendação: revisar OIs com status crítico antes de aprovar novas SICs ou transferências, garantindo que o consumo esteja dentro da verba aportada.</p>
    </section>
  `;
}

function openCapexCurveDetail(detailKey, label = "") {
  const allRows = capexCurveScopedRows(filteredCapexRows());
  const monthRows = capexMonthlyRows(capexCurveScope === "manutencao" ? Math.max(capexSummary(allRows).totalVerba, 1) : hapcapexReference.capexAtual);
  const metrics = capexCurveMetrics(monthRows);
  const curveRows = capexCurveWorkRows(allRows, metrics.ytdFactor);
  const selectedRows = detailKey === "obra" && label ? curveRows.filter((row) => row.obraPlano === label) : curveRows;
  const detail = capexCurveDetailContent(detailKey, label, selectedRows, monthRows, metrics);
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card capex-curve-detail-modal" aria-labelledby="capexCurveDetailTitle">
        <header>
          <div>
            <span class="eyebrow">Curva de CAPEX</span>
            <h2 id="capexCurveDetailTitle">${detail.title}</h2>
            <p class="muted">${detail.subtitle}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${detail.metrics.map((metric) => splitItem(metric.label, metric.value)).join("")}
          </div>
          ${detail.body}
        </div>
        <footer class="modal-actions">
          <button class="secondary-action" type="button" data-action="set-budget-tab" data-tab="capex">Abrir Controle de CAPEX</button>
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
        </footer>
      </section>
    </div>
  `;
}

function capexCurveDetailContent(detailKey, label, rows, monthRows, metrics) {
  const summary = capexSummary(rows);
  const baseMetrics = [
    { label: "OIs", value: String(rows.length) },
    { label: "Verba", value: money(summary.totalVerba) },
    { label: "Realizado", value: money(rows.reduce((sum, row) => sum + row.realized, 0)) },
    { label: "Saldo", value: money(summary.totalSaldo) },
  ];
  if (["curvaS", "mensal", "acumulado", "previsto", "realizado", "naoPlanejado", "desvio"].includes(detailKey)) {
    return {
      title: capexCurveDetailTitle(detailKey),
      subtitle: `${metrics.hasMonthSelection ? "Período selecionado" : "Referência acumulada"}: ${metrics.periodLabel}. Previsto e realizado separados por governança.`,
      metrics: [
        { label: "Previsto YTD", value: money(metrics.plannedYtd) },
        { label: "Realizado planejado", value: money(metrics.plannedRealizedYtd) },
        { label: "Não planejadas / OPER", value: money(metrics.unplannedYtd) },
        { label: "Desvio", value: `${money(metrics.deviation)} (${number(metrics.deviationPercent, 1)}%)` },
      ],
      body: `
        ${renderHapcapexSCurve(monthRows)}
        <div class="table-wrap capex-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th class="numeric">Previsto</th>
                <th class="numeric">Realizado planejado</th>
                <th class="numeric">Não planejado / OPER</th>
                <th class="numeric">Realizado total</th>
                <th class="numeric">Previsto acumulado</th>
                <th class="numeric">Realizado acumulado</th>
              </tr>
            </thead>
            <tbody>
              ${monthRows
                .map((row) => {
                  const unplanned = row.realizadoNaoPlanejado + row.realizadoOper;
                  return `
                    <tr>
                      <td><strong>${row.month}/26</strong></td>
                      <td class="numeric">${moneyCents(row.previsto)}</td>
                      <td class="numeric">${moneyCents(row.realizadoPlanejado)}</td>
                      <td class="numeric">${moneyCents(unplanned)}</td>
                      <td class="numeric">${moneyCents(row.realizadoPlanejado + unplanned)}</td>
                      <td class="numeric">${moneyCents(row.previstoAcumulado)}</td>
                      <td class="numeric">${moneyCents(row.realizadoTotalAcumulado)}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      `,
    };
  }

  if (detailKey === "tipologias") {
    const groups = capexCurveGroupRows(rows, "categoriaOrc", "verba", 30);
    return {
      title: "CAPEX por tipologia",
      subtitle: "Composição da verba por categoria ORC no filtro atual.",
      metrics: baseMetrics,
      body: renderCapexCurveDetailTable(
        ["Tipologia", "Verba", "% do total"],
        groups.map((row) => [row.label, moneyCents(row.value), `${number((row.value / Math.max(summary.totalVerba, 1)) * 100, 1)}%`])
      ),
    };
  }

  if (["riscos", "desvios", "analise"].includes(detailKey)) {
    const risky = rows.filter((row) => row.status.tone !== "green").slice(0, 80);
    return {
      title: "Riscos e desvios da curva",
      subtitle: "Obras com maior afastamento entre referência YTD e realizado identificado.",
      metrics: [
        ...baseMetrics,
        { label: "Itens em risco", value: String(risky.length) },
      ],
      body: renderCapexCurveDetailTable(
        ["Obra", "OI", "Categoria", "Previsto YTD", "Realizado", "Desvio", "Status"],
        risky.map((row) => [
          row.obraPlano,
          row.ordemInterna || "Sem OI",
          row.categoriaOrc,
          moneyCents(row.plannedYtd),
          moneyCents(row.realized),
          moneyCents(row.deviation),
          row.status.label,
        ])
      ),
    };
  }

  if (detailKey === "governanca") {
    return {
      title: "Governança da curva",
      subtitle: "Regras usadas para ler a Curva de CAPEX dentro do SLT 360.",
      metrics: [
        { label: "CAPEX inicial", value: money(hapcapexReference.capexInicial) },
        { label: "Aportes extras", value: money(hapcapexReference.aportesExtras) },
        { label: "Contingenciamentos", value: money(hapcapexReference.contingenciamentos) },
        { label: "CAPEX atual", value: money(hapcapexReference.capexAtual) },
      ],
      body: `
        <div class="split-list">
          ${splitItem("Fórmula", "CAPEX Atual = CAPEX Inicial + Aportes Extras - Contingenciamentos")}
          ${splitItem("Histórico", "Jan/26 a Jun/26 preservam o previsto aprovado do prompt mestre")}
          ${splitItem("Separação", "Não planejadas / OPER ficam separadas do CAPEX individual do projeto")}
          ${splitItem("Trava", "EV e SIC só devem consumir verba existente na OI vinculada")}
        </div>
      `,
    };
  }

  const limitedRows = rows.slice(0, 80);
  return {
    title: detailKey === "obra" && label ? label : capexCurveDetailTitle(detailKey),
    subtitle: "Detalhamento das OIs e verbas do filtro atual.",
    metrics: baseMetrics,
    body: renderCapexCurveDetailTable(
      ["Obra", "OI", "Categoria", "Verba", "Consumido", "Saldo", "Status"],
      limitedRows.map((row) => {
        const status = capexRowStatus(row);
        return [
          row.obraPlano,
          row.ordemInterna || "Sem OI",
          row.categoriaOrc,
          moneyCents(row.verba),
          moneyCents(row.consumido),
          moneyCents(row.saldo),
          status.label,
        ];
      })
    ),
  };
}

function capexCurveDetailTitle(key) {
  const titles = {
    capexAtual: "CAPEX Atual",
    previsto: "Previsto YTD",
    realizado: "Realizado planejado",
    naoPlanejado: "Não planejadas / OPER",
    desvio: "Desvio YTD",
    ois: "OIs no filtro",
    somaOis: "Soma das OIs importadas",
    saldo: "Saldo das OIs",
    curvaS: "Curva S do CAPEX",
    mensal: "Fluxo mensal",
    acumulado: "Consumo acumulado",
    desvios: "Desvios por obra",
  };
  return titles[key] || "Detalhe da Curva de CAPEX";
}

function renderCapexCurveDetailTable(columns, rows) {
  if (!rows.length) return `<div class="empty-state">Sem registros para exibir neste detalhe.</div>`;
  return `
    <div class="table-wrap capex-table-wrap">
      <table class="data-table">
        <thead>
          <tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell, index) => `<td class="${index > 2 ? "numeric" : ""}">${cell}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function capexMonthlyRows(totalVerba) {
  const order = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const values = new Map((capexData().consumo?.byMonth || []).map((row) => [String(row.label || "").toUpperCase(), Number(row.valor) || 0]));
  const plannedValues = new Map((capexData().consumo?.byMonthPlanned || []).map((row) => [String(row.label || "").toUpperCase(), Number(row.valor) || 0]));
  const unplannedValues = new Map((capexData().consumo?.byMonthUnplanned || []).map((row) => [String(row.label || "").toUpperCase(), Number(row.valor) || 0]));
  const operValues = new Map((capexData().consumo?.byMonthOper || []).map((row) => [String(row.label || "").toUpperCase(), Number(row.valor) || 0]));
  const history = hapcapexReference.previstoHistorico;
  const historyTotal = Object.values(history).reduce((sum, value) => sum + value, 0);
  const futureMonths = order.filter((month) => !history[month]);
  const futureReference = futureMonths.length ? Math.max(totalVerba - historyTotal, 0) / futureMonths.length : 0;
  let cumulative = 0;
  let plannedCumulative = 0;
  let plannedRealizedCumulative = 0;
  let totalCumulative = 0;
  return order.map((month, index) => {
    const realizadoTotal = values.get(month) || 0;
    const realizadoPlanejado = plannedValues.has(month) ? plannedValues.get(month) || 0 : realizadoTotal;
    const realizadoNaoPlanejado = unplannedValues.get(month) || 0;
    const realizadoOper = operValues.get(month) || 0;
    const previsto = history[month] || futureReference;
    cumulative += realizadoTotal;
    plannedCumulative += previsto;
    plannedRealizedCumulative += realizadoPlanejado;
    totalCumulative += realizadoPlanejado + realizadoNaoPlanejado + realizadoOper;
    return {
      month,
      index,
      realizado: realizadoTotal,
      realizadoTotal,
      realizadoPlanejado,
      realizadoNaoPlanejado,
      realizadoOper,
      acumulado: cumulative,
      previsto,
      previstoAcumulado: plannedCumulative,
      realizadoPlanejadoAcumulado: plannedRealizedCumulative,
      realizadoTotalAcumulado: totalCumulative,
    };
  });
}

function renderCapexMonthChart(rows) {
  const max = Math.max(...rows.map((row) => Math.max(row.realizadoPlanejado + row.realizadoNaoPlanejado + row.realizadoOper, row.previsto)), 1);
  return `
    <div class="capex-curve-bars">
      ${rows
        .map((row) => {
          const total = row.realizadoPlanejado + row.realizadoNaoPlanejado + row.realizadoOper;
          const tone = capexDeviationStatus(row.previsto ? ((total - row.previsto) / row.previsto) * 100 : 0).tone;
          return `
            <article class="capex-month-row" data-tone="${tone}">
              <div>
                <strong>${row.month}</strong>
                <span>${moneyCompact(total)}</span>
              </div>
              <div class="capex-dual-bars">
                <em title="Previsto ${moneyCents(row.previsto)}"><i style="width:${Math.max((row.previsto / max) * 100, 2)}%"></i></em>
                <em title="Realizado total ${moneyCents(total)}">
                  <b data-tone="${tone}" style="width:${Math.max((total / max) * 100, total ? 2 : 0)}%"></b>
                </em>
              </div>
              <small>Previsto ${moneyCompact(row.previsto)}</small>
            </article>
          `;
        })
        .join("")}
    </div>
    <div class="chart-legend">
      <span><i data-tone="blue"></i>Previsto</span>
      <span><i data-tone="green"></i>Dentro da referência</span>
      <span><i data-tone="orange"></i>Atenção</span>
      <span><i data-tone="red"></i>Crítico</span>
    </div>
  `;
}

function renderCapexCumulativeChart(rows) {
  const max = Math.max(...rows.map((row) => Math.max(row.realizadoTotalAcumulado, row.previstoAcumulado)), 1);
  return `
    <div class="budget-cumulative-list capex-cumulative-list">
      ${rows
        .map((row) => {
          const deviationPercent = row.previstoAcumulado ? ((row.realizadoTotalAcumulado - row.previstoAcumulado) / row.previstoAcumulado) * 100 : 0;
          const tone = capexDeviationStatus(deviationPercent).tone;
          return `
            <div data-tone="${tone}">
              <span>${row.month}</span>
              <em>
                <i data-tone="${tone}" style="width:${Math.max((row.realizadoTotalAcumulado / max) * 100, row.realizadoTotalAcumulado ? 3 : 0)}%"></i>
                <b style="left:${Math.min((row.previstoAcumulado / max) * 100, 100)}%"></b>
              </em>
              <strong>${moneyCompact(row.realizadoTotalAcumulado)}</strong>
            </div>
          `;
        })
        .join("")}
    </div>
    <div class="chart-legend">
      <span><i data-tone="green"></i>Realizado total acumulado</span>
      <span><i data-tone="orange"></i>Marcador do previsto acumulado</span>
    </div>
  `;
}

function renderCapexMonthlyTable(rows) {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Tabela mensal da curva</h2>
          <p class="panel-subtitle">Detalhamento com previsto, realizado planejado, não planejado/OPER e desvio</p>
        </div>
      </div>
      <div class="table-wrap capex-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th class="numeric">Previsto</th>
              <th class="numeric">Realizado planejado</th>
              <th class="numeric">Não planejadas / OPER</th>
              <th class="numeric">Realizado total</th>
              <th class="numeric">Desvio</th>
              <th class="numeric">Desvio %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map((row) => {
                const unplanned = row.realizadoNaoPlanejado + row.realizadoOper;
                const total = row.realizadoPlanejado + unplanned;
                const deviation = total - row.previsto;
                const deviationPercent = row.previsto ? (deviation / row.previsto) * 100 : 0;
                const status = capexDeviationStatus(deviationPercent);
                return `
                  <tr>
                    <td><strong>${row.month}/26</strong></td>
                    <td class="numeric">${moneyCents(row.previsto)}</td>
                    <td class="numeric">${moneyCents(row.realizadoPlanejado)}</td>
                    <td class="numeric">${moneyCents(unplanned)}</td>
                    <td class="numeric">${moneyCents(total)}</td>
                    <td class="numeric">${moneyCents(deviation)}</td>
                    <td class="numeric">${number(deviationPercent, 1)}%</td>
                    <td><span class="status-pill" data-status="${status.tone === "green" ? "Completo" : status.tone === "orange" ? "Pendente" : "Saldo crítico"}">${status.label}</span></td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function capexClosedMonthIndex() {
  const date = new Date(`${TODAY_ISO}T00:00:00`);
  const previousMonth = Number.isFinite(date.getMonth()) ? date.getMonth() - 1 : 6;
  return Math.max(0, Math.min(previousMonth, 11));
}

function capexDeviationStatus(percent) {
  const absolute = Math.abs(Number(percent) || 0);
  if (absolute <= 10) return { label: "Normal", tone: "green" };
  if (absolute <= 25) return { label: "Atenção", tone: "orange" };
  return { label: "Crítico", tone: "red" };
}

function splitItem(label, value) {
  return `
    <div class="split-item">
      <strong>${label}</strong>
      <span class="muted">${value}</span>
    </div>
  `;
}

function flowStep(numberLabel, title, detail) {
  return `
    <div class="flow-step">
      <span>${numberLabel}</span>
      <div>
        <strong>${title}</strong>
        <small>${detail}</small>
      </div>
    </div>
  `;
}

function sicSignedValue(record) {
  const value = Number(record.valor) || 0;
  return String(record.movimento || "").toLowerCase().includes("supress") ? -Math.abs(value) : Math.abs(value);
}

function sicLineRecords() {
  const imported = (state.sicBi?.records || []).map((record, index) => ({
    source: "BI SIC",
    id: record.numeroSic || `BI-${index + 1}`,
    obra: record.obra,
    nomeObra: cleanImportedText(record.nomeObra || "Obra não informada"),
    disciplina: cleanImportedText(record.disciplina || "Não informada"),
    valor: sicSignedValue(record),
    motivo: cleanImportedText(record.descricao || record.observacao || "Não informado"),
    movimento: cleanImportedText(record.movimento || "ADITIVO").toUpperCase(),
    sprint: record.sprint || "—",
    estado: cleanImportedText(record.estado || "—"),
    analista: cleanImportedText(record.analistaSic || record.analistaObra || "Não informado"),
    tipologia: cleanImportedText(record.tipologia || "Não informada"),
    grupo: cleanImportedText(record.grupos || "Não informado"),
    dataPostagem: record.dataPostagem || "",
    status: "Importado",
    actionId: "",
  }));

  const created = (state.sics || []).flatMap((sic) => {
    const work = workById(sic.obraId);
    return sic.disciplinasAfetadas.map((item) => ({
      source: "SLT 360",
      id: sic.id,
      obra: work?.codigoOriginal || sic.obraId,
      nomeObra: work?.nome || "Obra não localizada",
      disciplina: disciplineById(item.disciplinaId).nome,
      valor: item.valorDelta || 0,
      motivo: motivationLabel(sic.motivo),
      movimento: item.valorDelta < 0 ? "SUPRESSÃO" : "ADITIVO",
      sprint: "—",
      estado: work?.uf || "—",
      analista: sic.aprovadoPor || "Gestão ST",
      tipologia: work?.tipoUnidade || "Não informada",
      grupo: "SLT 360",
      dataPostagem: sic.dataAprovacao || sic.dataSolicitacao || "",
      status: sic.status,
      actionId: sic.id,
    }));
  });

  return [...imported, ...created];
}

function sicSummaryRows(records = sicLineRecords()) {
  const map = new Map();
  records.forEach((record) => {
    const key = `${record.source}|${record.id}|${record.obra}|${record.nomeObra}|${record.movimento}`;
    const current =
      map.get(key) ||
      {
        ...record,
        valor: 0,
        disciplinas: new Set(),
        motivos: new Set(),
        tipologias: new Set(),
        grupos: new Set(),
      };
    current.valor += record.valor;
    current.disciplinas.add(record.disciplina);
    current.motivos.add(record.motivo);
    current.tipologias.add(record.tipologia);
    current.grupos.add(record.grupo);
    map.set(key, current);
  });
  return [...map.values()]
    .map((row) => ({
      ...row,
      disciplinas: [...row.disciplinas],
      motivos: [...row.motivos],
      tipologias: [...row.tipologias],
      grupos: [...row.grupos],
    }))
    .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor));
}

function sicApprovalReading(demand) {
  if (demandTypeKey(demand?.tipo) !== "SIC") {
    return { label: "Não é SIC", status: "", dataStatus: "Não se aplica", tone: "gray" };
  }
  if ((demand.sicIds || []).length || demand.sicApprovalStatus === "Postada") {
    return { label: "Postada no EV", status: "Postada", dataStatus: "Aprovado", tone: "green" };
  }
  const status = demand.sicApprovalStatus || "Pendente";
  if (status === "Aprovado") return { label: "Aprovada para postagem", status, dataStatus: "Aprovado", tone: "green" };
  if (status === "Reprovado") return { label: "Reprovada", status, dataStatus: "Reprovado", tone: "red" };
  if (status === "Em revisão") return { label: "Em revisão", status, dataStatus: "Cotado", tone: "blue" };
  return { label: "Aguardando aprovação", status: "Pendente", dataStatus: "Pendente", tone: "orange" };
}

function sicApprovalValue(demand) {
  if ((demand.sicIds || []).length) {
    return (demand.sicIds || [])
      .map((id) => state.sics.find((sic) => sic.id === id))
      .filter(Boolean)
      .reduce((sum, sic) => sum + Math.abs(sicTotal(sic)), 0);
  }
  const draftTotal = (demand.sicDraftDisciplines || []).reduce((sum, item) => sum + Math.abs(Number(item.valorDelta) || 0), 0);
  if (draftTotal) return draftTotal;
  return [
    demand.valorSicHistorico,
    demand.valorSic,
    demand.valorEstimado,
    demand.valorPrevisto,
    demand.sicMetadata?.valorSic,
    demand.sicMetadata?.valorPrevisto,
  ].reduce((total, value) => {
    if (total) return total;
    const direct = Number(value);
    const parsed = Number.isFinite(direct) ? direct : parseCurrency(value);
    return Math.abs(parsed || 0);
  }, 0);
}

function sicApprovalItems(ignoreSearch = false) {
  const terms = ignoreSearch ? [] : normalizeSearchText(sicSearchQuery).split(/\s+/).filter(Boolean);
  return (state.demands || [])
    .filter((demand) => demandTypeKey(demand.tipo) === "SIC")
    .map((demand) => {
      const work = workById(demand.obraId);
      const info = demandSicInfo(demand) || {};
      const approval = sicApprovalReading(demand);
      const value = sicApprovalValue(demand);
      const text = normalizeSearchText([
        demand.id,
        work?.nome,
        work?.codigoOriginal,
        work?.chaveUnica,
        work?.cidade,
        work?.uf,
        info.lecomNumber,
        info.tituloSic,
        info.numeroSic,
        info.analistaSalaTecnica,
        approval.label,
        demandStatusLabel(demand),
      ].join(" "));
      return { demand, work, info, approval, value, searchableText: text };
    })
    .filter((item) => !terms.length || terms.every((term) => item.searchableText.includes(term)))
    .sort((a, b) => {
      const order = { Pendente: 1, Reprovado: 2, Aprovado: 3, Postada: 4 };
      return (order[a.approval.status] || 9) - (order[b.approval.status] || 9) || b.value - a.value;
    });
}

function sicApprovalDashboardData() {
  const items = sicApprovalItems();
  const allItems = sicApprovalItems(true);
  const pending = items.filter((item) => item.approval.status === "Pendente");
  const approved = items.filter((item) => item.approval.status === "Aprovado");
  const rejected = items.filter((item) => item.approval.status === "Reprovado");
  const posted = items.filter((item) => item.approval.status === "Postada");
  return {
    items,
    allItems,
    pending,
    approved,
    rejected,
    posted,
    totalValue: items.reduce((sum, item) => sum + item.value, 0),
    pendingValue: pending.reduce((sum, item) => sum + item.value, 0),
  };
}

function renderSics() {
  const data = sicDashboardData();
  const active = sicViewMeta().find((view) => view.id === sicViewMode) || sicViewMeta()[0];

  return `
    ${renderWorksToolbar("sics", active.title, active.subtitle, `
      <button class="primary-action" type="button" data-action="open-demand">Nova SIC</button>
    `)}
    ${renderSicViewTabs()}
    ${sicViewMode === "approval" ? "" : renderSicFilterBar(data)}
    ${renderSicView(data)}
  `;
}

function sicViewMeta() {
  return [
    {
      id: "report",
      label: "SIC's Report",
      title: "SIC's Report",
      subtitle: "Visão consolidada dos principais indicadores estratégicos da operação",
    },
    {
      id: "timeline",
      label: "Linha do Tempo",
      title: "Linha do Tempo de SICs",
      subtitle: "Evolução das solicitações, custo e volume por sprint e postagem",
    },
    {
      id: "executive",
      label: "Executivo",
      title: "Relatório Executivo",
      subtitle: "Indicadores estratégicos para suporte à tomada de decisão",
    },
    {
      id: "diagnostic",
      label: "Diagnóstico",
      title: "Relatório Diagnóstico",
      subtitle: "Principais desvios, causas e impactos para direcionar ações corretivas",
    },
    {
      id: "performance",
      label: "Performance",
      title: "Relatório Performance",
      subtitle: "Monitoramento da evolução, produtividade e eficiência na conclusão das SICs",
    },
    {
      id: "approval",
      label: "Aprovação",
      title: "Aprovação de SICs",
      subtitle: "Fila de validação antes da postagem no EV e consumo da linha 32",
    },
  ];
}

function renderSicViewTabs() {
  return `
    <nav class="sic-view-tabs" aria-label="Visões de SICs">
      ${sicViewMeta()
        .map(
          (view) => `
            <button class="${sicViewMode === view.id ? "is-active" : ""}" type="button" data-action="set-sic-view" data-view-mode="${view.id}">
              ${view.label}
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function sicDashboardData(options = {}) {
  const allRecords = sicLineRecords();
  const records = options.ignoreSearch ? allRecords : filterSicRecords(allRecords);
  const rows = sicSummaryRows(records);
  const additions = records.filter((record) => record.valor > 0);
  const suppressions = records.filter((record) => record.valor < 0);
  const additiveValue = additions.reduce((sum, record) => sum + record.valor, 0);
  const suppressionValue = Math.abs(suppressions.reduce((sum, record) => sum + record.valor, 0));
  const netImpact = records.reduce((sum, record) => sum + record.valor, 0);
  return {
    allRecords,
    records,
    rows,
    pending: rows.filter((sic) => sic.status === "Pendente"),
    additions,
    suppressions,
    additiveValue,
    suppressionValue,
    netImpact,
    totalAbs: records.reduce((sum, record) => sum + Math.abs(record.valor), 0),
    impactedWorks: new Set(records.map((record) => `${record.obra}|${record.nomeObra}`)).size,
    uniqueSics: new Set(records.map((record) => record.id)).size,
    period: sicPeriodLabel(records),
  };
}

function filterSicRecords(records) {
  const terms = normalizeSearchText(sicSearchQuery).split(/\s+/).filter(Boolean);
  if (!terms.length) return records;
  return records.filter((record) => {
    const text = normalizeSearchText([
      record.id,
      record.obra,
      record.nomeObra,
      record.disciplina,
      record.motivo,
      record.movimento,
      record.sprint,
      record.estado,
      record.analista,
      record.tipologia,
      record.grupo,
      record.status,
      record.source,
    ].join(" "));
    return terms.every((term) => text.includes(term));
  });
}

function sicPeriodLabel(records) {
  const dates = records
    .map((record) => record.dataPostagem)
    .filter(Boolean)
    .sort();
  if (!dates.length) return "Período não informado";
  return `${dateText(dates[0])} - ${dateText(dates[dates.length - 1])}`;
}

function sicGroupedRecords(records, getLabel) {
  const map = new Map();
  records.forEach((record) => {
    const label = cleanImportedText(typeof getLabel === "function" ? getLabel(record) : record[getLabel]) || "Não informado";
    const current =
      map.get(label) ||
      {
        label,
        valor: 0,
        signed: 0,
        count: 0,
        additions: 0,
        suppressions: 0,
        sicIds: new Set(),
        workIds: new Set(),
      };
    const value = Number(record.valor) || 0;
    current.valor += Math.abs(value);
    current.signed += value;
    current.count += 1;
    if (value >= 0) current.additions += value;
    else current.suppressions += Math.abs(value);
    current.sicIds.add(record.id);
    current.workIds.add(`${record.obra}|${record.nomeObra}`);
    map.set(label, current);
  });
  return [...map.values()]
    .map((row) => ({
      ...row,
      sics: row.sicIds.size,
      works: row.workIds.size,
    }))
    .sort((a, b) => b.valor - a.valor);
}

function sicCostRows(field, limit = 10, records = sicLineRecords()) {
  return sicGroupedRecords(records, field)
    .map((row) => ({ ...row, valor: row.valor, drillField: field }))
    .slice(0, limit);
}

function sicCountRows(field, limit = 10, records = sicLineRecords()) {
  return sicGroupedRecords(records, field)
    .map((row) => ({ ...row, valor: row.sics, drillField: field }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, limit);
}

function renderSicFilterBar(data) {
  if (sicViewMode === "approval") {
    const approvalData = sicApprovalDashboardData();
    return `
      <section class="sic-filter-bar sic-approval-filter-bar">
        <label class="field sic-search-field">
          <span>Assistente de busca da aprovação</span>
          <input data-sic-search value="${escapeAttribute(sicSearchQuery)}" placeholder="Buscar por obra, LECOM, título, analista, status ou card..." />
        </label>
        <div class="sic-filter-summary">
          <span>${approvalData.items.length} SIC(s) no filtro</span>
          <span>${approvalData.pending.length} aguardando</span>
          <span>${approvalData.approved.length} aprovadas</span>
          <span>${approvalData.posted.length} postadas</span>
          <span>${money(approvalData.pendingValue)} em análise</span>
        </div>
        ${sicSearchQuery ? `<button class="secondary-action" type="button" data-action="clear-sic-search">Limpar busca</button>` : ""}
      </section>
    `;
  }
  const sprints = new Set(data.records.map((record) => record.sprint).filter(Boolean)).size;
  const disciplines = new Set(data.records.map((record) => record.disciplina).filter(Boolean)).size;
  const typologies = new Set(data.records.map((record) => record.tipologia).filter(Boolean)).size;
  return `
    <section class="sic-filter-bar">
      <label class="field sic-search-field">
        <span>Buscar SIC</span>
        <input data-sic-search value="${escapeAttribute(sicSearchQuery)}" placeholder="Buscar por SIC, obra, disciplina, motivo, estado, sprint ou analista..." />
      </label>
      <div class="sic-filter-summary">
        <span>${data.records.length} linha(s)</span>
        <span>${data.uniqueSics} SICs</span>
        <span>${data.impactedWorks} obras</span>
        <span>${disciplines} disciplinas</span>
        <span>${sprints} sprints</span>
        <span>${typologies} tipologias</span>
        <span>${data.period}</span>
      </div>
      ${sicSearchQuery ? `<button class="secondary-action" type="button" data-action="clear-sic-search">Limpar busca</button>` : ""}
    </section>
  `;
}

function renderSicView(data) {
  const views = {
    report: renderSicReportView,
    timeline: renderSicTimelineView,
    executive: renderSicExecutiveView,
    diagnostic: renderSicDiagnosticView,
    performance: renderSicPerformanceView,
    approval: renderSicApprovalView,
  };
  return (views[sicViewMode] || renderSicReportView)(data);
}

function renderSicApprovalView() {
  return `
    <section class="sic-approval-exact-shell">
      <iframe
        class="sic-approval-dashboard-frame"
        data-sic-approval-dashboard-frame
        src="sic-approval-dashboard.html"
        title="Controle de EVs - Aditivos e Revisões"
      ></iframe>
    </section>
    ${renderSicApprovalSyncedList()}
  `;
}

function renderSicApprovalSyncedList() {
  const data = sicApprovalDashboardData();
  const rows = data.items;
  return `
    <section class="panel sic-approval-panel sic-approval-sync-list-panel">
      <div class="panel-header">
        <div>
          <h2>Lista sincronizada SLT 360</h2>
          <p class="panel-subtitle">Apoio operacional ligado aos cards do Kanban. A postagem no EV continua bloqueada até a aprovação.</p>
        </div>
        ${renderSicApprovalSyncedSummary(data)}
      </div>
      <section class="sic-filter-bar sic-approval-filter-bar">
        <label class="field sic-search-field">
          <span>Buscar na lista sincronizada</span>
          <input data-sic-search value="${escapeAttribute(sicSearchQuery)}" placeholder="Buscar por obra, LECOM, título, analista, status ou card..." />
        </label>
        ${sicSearchQuery ? `<button class="secondary-action" type="button" data-action="clear-sic-search">Limpar busca</button>` : ""}
      </section>
      ${
        rows.length
          ? `<div class="table-wrap sic-approval-table-wrap">
              <table class="data-table sic-approval-table">
                <thead>
                  <tr>
                    <th>Card</th>
                    <th>Obra</th>
                    <th>LECOM / título</th>
                    <th>Analista ST</th>
                    <th class="numeric">Valor previsto</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(renderSicApprovalRow).join("")}
                </tbody>
              </table>
            </div>`
          : `<div class="empty-state">Nenhuma SIC encontrada para aprovação no filtro atual.</div>`
      }
    </section>
  `;
}

function renderSicApprovalSyncedSummary(data) {
  return `
    <div class="sic-approval-sync-summary">
      <span>${data.items.length} SIC(s) no filtro</span>
      <span>${data.pending.length} aguardando</span>
      <span>${data.approved.length} aprovadas</span>
      <span>${data.posted.length} postadas</span>
      <strong>${money(data.pendingValue)} em análise</strong>
    </div>
  `;
}

function renderSicApprovalRow(item) {
  const { demand, work, info, approval, value } = item;
  const canApprove = approval.status !== "Aprovado" && approval.status !== "Postada";
  const canPost = approval.status === "Aprovado";
  const canReject = approval.status !== "Reprovado" && approval.status !== "Postada";
  return `
    <tr>
      <td>
        <strong>${demand.id}</strong>
        <small>${demandStatusLabel(demand)} · ${sprintById(demand.sprintId)?.nome || "Sem sprint"}</small>
      </td>
      <td>
        <strong>${work?.nome || info.obraNome || "Obra não localizada"}</strong>
        <small>${[work?.codigoOriginal || info.obraNumber, work?.cidade && work?.uf ? `${work.cidade}/${work.uf}` : ""].filter(Boolean).join(" · ") || "Sem referência"}</small>
      </td>
      <td>
        <strong>${info.lecomNumber && info.lecomNumber !== "—" ? info.lecomNumber : "Sem LECOM"}</strong>
        <small>${info.tituloSic || "Sem título"}</small>
      </td>
      <td>${info.analistaSalaTecnica || demand.analistaResponsavel || "—"}</td>
      <td class="numeric">${value ? money(value) : "—"}</td>
      <td><span class="status-pill" data-status="${approval.dataStatus}">${approval.label}</span></td>
      <td>
        <div class="inline-actions">
          <button class="secondary-action compact-action" type="button" data-action="open-demand-detail" data-id="${demand.id}">Abrir card</button>
          ${canApprove ? `<button class="primary-action compact-action" type="button" data-action="approve-sic-demand" data-id="${demand.id}">Aprovar</button>` : ""}
          ${canPost ? `<button class="primary-action compact-action" type="button" data-action="post-sic-to-ev" data-id="${demand.id}">Postar EV</button>` : ""}
          ${canReject ? `<button class="ghost-button compact-action danger-action" type="button" data-action="reject-sic-demand" data-id="${demand.id}">Reprovar</button>` : ""}
        </div>
      </td>
    </tr>
  `;
}

function renderSicKpis(data, mode = "default") {
  const totalLabel = mode === "performance" ? "Impacto" : "Previsão de custo";
  return `
    <section class="kpi-grid sic-kpi-grid">
      ${kpi(totalLabel, money(Math.abs(data.netImpact)), "Impacto líquido das SICs", "blue", "", "sicImpact")}
      ${kpi("Aditivos", money(data.additiveValue), `${data.additions.length} linhas aditivas`, "orange", "", "sicAdditives")}
      ${kpi("Supressões", `-${money(data.suppressionValue)}`, `${data.suppressions.length} linhas de supressão`, "green", "", "sicSuppressions")}
      ${kpi("Obras", String(data.impactedWorks), "Projetos impactados", "blue", "", "sicWorks")}
      ${kpi("SICs", String(data.uniqueSics), `${data.records.length} linhas analisadas`, "blue", "", "sicTotal")}
    </section>
  `;
}

function renderSicReportView(data) {
  return `
    ${renderSicKpis(data)}
    <div class="content-grid sic-report-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Custo por disciplina</h2>
            <p class="panel-subtitle">Participação financeira no impacto total</p>
          </div>
        </div>
        ${renderRingChart(sicCostRows("disciplina", 7, data.records), money(Math.abs(data.netImpact)), "impacto")}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Previsão de custo por motivos</h2>
            <p class="panel-subtitle">Causas mais relevantes em valor</p>
          </div>
        </div>
        ${barList(sicCostRows("motivo", 10, data.records), "valor", money)}
      </section>
    </div>
    <div class="content-grid sic-report-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Previsão de custo e Nº de SICs por analista</h2>
            <p class="panel-subtitle">Custo total e volume sob responsabilidade</p>
          </div>
        </div>
        ${barList(sicCostRows("analista", 8, data.records), "valor", money)}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Custo por grupos de motivos</h2>
            <p class="panel-subtitle">Projetos, Obras, Sala Técnica e outros motivos</p>
          </div>
        </div>
        ${barList(sicCostRows("grupo", 8, data.records), "valor", money)}
      </section>
    </div>
    ${renderSicHistoryPanel(data.rows)}
  `;
}

function renderSicTimelineView(data) {
  const months = sicTimelineRows(data.records, "month");
  const sprints = sicTimelineRows(data.records, "sprint");
  return `
    ${renderSicKpis(data)}
    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Mês a mês</h2>
            <p class="panel-subtitle">Impacto financeiro e volume por data de postagem</p>
          </div>
        </div>
        ${renderSicTimeline(months, "month")}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Acumulado</h2>
            <p class="panel-subtitle">Curva acumulada de custo e SICs no período</p>
          </div>
        </div>
        ${renderSicAccumulatedTimeline(months)}
      </section>
    </div>
    <div class="content-grid three">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>SICs por sprint</h2>
            <p class="panel-subtitle">Volume de solicitações no ciclo operacional</p>
          </div>
        </div>
        ${barList(sprints.slice(0, 12).map((row) => ({ label: row.label, valor: row.sics, drillField: "sprint", drillLabel: row.key })), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Custo por sprint</h2>
            <p class="panel-subtitle">Impacto financeiro por ciclo</p>
          </div>
        </div>
        ${barList(sprints.slice(0, 12).map((row) => ({ ...row, drillField: "sprint", drillLabel: row.key })), "valor", money)}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>SICs por mês</h2>
            <p class="panel-subtitle">Leitura mensal de volume, separada de sprint</p>
          </div>
        </div>
        ${barList(months.map((row) => ({ ...row, valor: row.sics, drillField: "month", drillLabel: row.key })), "valor", (value) => String(value))}
      </section>
    </div>
    ${renderSicHistoryPanel(data.rows.slice(0, 120))}
  `;
}

function renderSicExecutiveView(data) {
  return `
    ${renderSicKpis(data)}
    <div class="content-grid sic-executive-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Nº de Obras e SICs</h2>
            <p class="panel-subtitle">Resumo por tipologia da unidade</p>
          </div>
        </div>
        ${renderSicTypologyCards(sicGroupedRecords(data.records, "tipologia").slice(0, 7))}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Nº de SICs por tipologia</h2>
            <p class="panel-subtitle">Composição quantitativa da carteira</p>
          </div>
        </div>
        ${renderRingChart(sicCountRows("tipologia", 8, data.records), String(data.uniqueSics), "SICs")}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Nº de SICs por estado</h2>
            <p class="panel-subtitle">Concentração geográfica dos desvios</p>
          </div>
        </div>
        ${renderSicStateGrid(sicGroupedRecords(data.records, "estado").slice(0, 12))}
      </section>
    </div>
    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Previsão de custo por tipologia</h2>
            <p class="panel-subtitle">Maiores impactos financeiros</p>
          </div>
        </div>
        ${barList(sicCostRows("tipologia", 10, data.records), "valor", money)}
      </section>
      ${renderSicTablePanel("Resumo por estado", "Obras, SICs e custo consolidado", sicGroupedRecords(data.records, "estado").slice(0, 15), "Estado", "estado")}
    </div>
  `;
}

function renderSicDiagnosticView(data) {
  return `
    ${renderSicKpis(data)}
    <div class="content-grid diagnostic-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Nº de SICs e previsão de custo por motivo</h2>
            <p class="panel-subtitle">Cruzamento de frequência e impacto para causa raiz</p>
          </div>
        </div>
        ${renderSicBubbleChart(sicGroupedRecords(data.records, "motivo").slice(0, 11), "motivo")}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>% de SICs por motivo e disciplina</h2>
            <p class="panel-subtitle">Composição das disciplinas dentro de cada causa</p>
          </div>
        </div>
        ${renderSicStackedRows(sicStackedRows(data.records, "motivo", "disciplina").slice(0, 9))}
      </section>
    </div>
    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>% de SICs por motivo e tipologia</h2>
            <p class="panel-subtitle">Onde cada causa aparece com mais força</p>
          </div>
        </div>
        ${renderSicStackedRows(sicStackedRows(data.records, "motivo", "tipologia").slice(0, 9))}
      </section>
      <div class="stacked-panels">
        ${renderSicTablePanel("Disciplina", "Nº de SICs e custo", sicGroupedRecords(data.records, "disciplina").slice(0, 10), "Disciplina", "disciplina")}
        ${renderSicTablePanel("Tipologia", "Nº de SICs e custo", sicGroupedRecords(data.records, "tipologia").slice(0, 10), "Tipologia", "tipologia")}
      </div>
    </div>
  `;
}

function renderSicPerformanceView(data) {
  const groups = sicGroupedRecords(data.records, "grupo");
  return `
    ${renderSicKpis(data, "performance")}
    <div class="content-grid performance-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Performance por grupos</h2>
            <p class="panel-subtitle">Volume, custo, aditivos e supressões por causa macro</p>
          </div>
        </div>
        ${renderSicGroupCards(groups)}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Nº de SICs e previsão de custo por grupos</h2>
            <p class="panel-subtitle">Dispersão de volume versus impacto financeiro</p>
          </div>
        </div>
        ${renderSicBubbleChart(groups, "grupo")}
      </section>
      ${renderSicTablePanel("Obras com maior impacto", "Ranking importado do BI de SICs", sicGroupedRecords(data.records, "nomeObra").slice(0, 40), "Obra", "nomeObra")}
    </div>
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>% de SICs por motivo de cada grupo</h2>
          <p class="panel-subtitle">Composição das causas dentro de Projetos, Obras, Sala Técnica e outros</p>
        </div>
      </div>
      ${renderSicStackedRows(sicStackedRows(data.records, "grupo", "motivo").slice(0, 8))}
    </section>
  `;
}

function renderRingChart(items, centerValue, centerLabel) {
  if (!items.length) return `<div class="empty-state">Sem dados para exibir.</div>`;
  const colors = ["#005ca9", "#2f80ed", "#008f5a", "#f79009", "#0f7c9b", "#9aaaba", "#d92d20", "#b7791f"];
  const total = items.reduce((sum, item) => sum + Math.abs(item.valor || 0), 0) || 1;
  let cursor = 0;
  const stops = items
    .map((item, index) => {
      const share = (Math.abs(item.valor || 0) / total) * 100;
      const start = cursor;
      cursor += share;
      return `${colors[index % colors.length]} ${start}% ${cursor}%`;
    })
    .join(", ");
  return `
    <div class="ring-panel">
      <div class="ring-chart" style="background: conic-gradient(${stops})">
        <span>${centerValue}</span>
        <small>${centerLabel}</small>
      </div>
      <div class="ring-legend">
        ${items
          .map(
            (item, index) => `
              <span>
                <i style="background:${colors[index % colors.length]}"></i>
                <strong>${item.label}</strong>
                <small>${money(Math.abs(item.valor || 0))}</small>
              </span>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function sicTimelineRows(records, mode) {
  const map = new Map();
  records.forEach((record) => {
    const rawSprint = cleanImportedText(record.sprint || "—");
    const sprintLabel = normalizeSearchText(rawSprint).includes("sprint") ? rawSprint : `Sprint ${rawSprint}`;
    const key = mode === "month" ? (record.dataPostagem ? record.dataPostagem.slice(0, 7) : "sem-data") : sprintLabel;
    const label =
      mode === "month"
        ? key === "sem-data"
          ? "Sem data"
          : new Date(`${key}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "")
        : key;
    const current = map.get(key) || { key, label, valor: 0, sicIds: new Set() };
    current.valor += Math.abs(record.valor || 0);
    current.sicIds.add(record.id);
    map.set(key, current);
  });
  return [...map.values()]
    .map((row) => ({ ...row, sics: row.sicIds.size }))
    .sort((a, b) => String(a.key).localeCompare(String(b.key), "pt-BR", { numeric: true }));
}

function renderSicTimeline(rows, mode = "month") {
  if (!rows.length) return `<div class="empty-state">Sem dados de linha do tempo.</div>`;
  const max = Math.max(...rows.map((row) => row.valor), 1);
  return `
    <div class="sic-timeline">
      ${rows
        .map(
          (row) => `
            <article role="button" tabindex="0" data-action="open-sic-timeline" data-mode="${mode}" data-key="${escapeAttribute(row.key)}">
              <span>${row.label}</span>
              <i><em style="height:${Math.max((row.valor / max) * 100, 8)}%"></em></i>
              <strong>${row.sics}</strong>
              <small>${money(row.valor)}</small>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSicAccumulatedTimeline(rows) {
  if (!rows.length) return `<div class="empty-state">Sem dados acumulados.</div>`;
  let accumulatedValue = 0;
  let accumulatedSics = 0;
  const accumulated = rows.map((row) => {
    accumulatedValue += row.valor;
    accumulatedSics += row.sics;
    return { ...row, valor: accumulatedValue, sics: accumulatedSics };
  });
  return renderSicTimeline(accumulated, "month");
}

function renderSicTypologyCards(rows) {
  if (!rows.length) return `<div class="empty-state">Sem tipologias registradas.</div>`;
  return `
    <div class="sic-typology-cards">
      ${rows
        .map(
          (row) => `
            <article role="button" tabindex="0" data-action="open-sic-slice" data-field="tipologia" data-label="${escapeAttribute(row.label)}">
              <strong>${row.works}</strong>
              <span>Obras</span>
              <strong>${row.sics}</strong>
              <span>SICs</span>
              <b>${row.label}</b>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSicStateGrid(rows) {
  if (!rows.length) return `<div class="empty-state">Sem estados registrados.</div>`;
  const max = Math.max(...rows.map((row) => row.sics), 1);
  return `
    <div class="sic-state-grid">
      ${rows
        .map(
          (row) => `
            <article style="--weight:${Math.max((row.sics / max) * 100, 10)}%" role="button" tabindex="0" data-action="open-sic-slice" data-field="estado" data-label="${escapeAttribute(row.label)}">
              <strong>${row.label}</strong>
              <span>${row.sics} SICs | ${row.works} obras</span>
              <small>${money(row.valor)}</small>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSicBubbleChart(rows, field = "motivo") {
  if (!rows.length) return `<div class="empty-state">Sem dados para diagnóstico.</div>`;
  const maxCount = Math.max(...rows.map((row) => row.sics), 1);
  const maxValue = Math.max(...rows.map((row) => row.valor), 1);
  return `
    <div class="sic-bubble-chart">
      ${rows
        .map((row, index) => {
          const left = 8 + (row.sics / maxCount) * 76;
          const bottom = 10 + (row.valor / maxValue) * 72;
          const size = 34 + (row.valor / maxValue) * 52;
          return `
            <article style="left:${left}%; bottom:${bottom}%; width:${size}px; height:${size}px" data-index="${index}" role="button" tabindex="0" data-action="open-sic-slice" data-field="${field}" data-label="${escapeAttribute(row.label)}">
              <strong>${row.sics}</strong>
              <span>${row.label}</span>
            </article>
          `;
        })
        .join("")}
      <b class="axis-y">Custo</b>
      <b class="axis-x">Nº de SICs</b>
    </div>
  `;
}

function sicStackedRows(records, primaryField, secondaryField) {
  const primaryRows = sicGroupedRecords(records, primaryField).slice(0, 10);
  return primaryRows.map((primary) => {
    const scoped = records.filter((record) => cleanImportedText(record[primaryField]) === primary.label);
    const segments = sicGroupedRecords(scoped, secondaryField).slice(0, 6);
    const total = segments.reduce((sum, segment) => sum + segment.sics, 0) || 1;
    return {
      label: primary.label,
      primaryField,
      secondaryField,
      total,
      segments: segments.map((segment) => ({
        label: segment.label,
        valor: segment.sics,
        percent: (segment.sics / total) * 100,
      })),
    };
  });
}

function renderSicStackedRows(rows) {
  if (!rows.length) return `<div class="empty-state">Sem dados para composição.</div>`;
  const colors = ["#005ca9", "#2f80ed", "#9aaaba", "#f79009", "#24364f", "#42b7b1"];
  return `
    <div class="sic-stacked-list">
      ${rows
        .map(
          (row) => `
            <article role="button" tabindex="0" data-action="open-sic-slice" data-field="${row.primaryField}" data-label="${escapeAttribute(row.label)}">
              <strong>${row.label}</strong>
              <div>
                ${row.segments
                  .map(
                    (segment, index) => `
                      <span title="${segment.label}: ${number(segment.percent, 1)}%" style="width:${Math.max(segment.percent, 2)}%; background:${colors[index % colors.length]}">
                        ${segment.percent >= 10 ? `${number(segment.percent, 0)}%` : ""}
                      </span>
                    `
                  )
                  .join("")}
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSicGroupCards(rows) {
  if (!rows.length) return `<div class="empty-state">Sem grupos cadastrados.</div>`;
  return `
    <div class="sic-group-cards">
      ${rows
        .map((row) => {
          const total = row.additions + row.suppressions || 1;
          return `
            <article role="button" tabindex="0" data-action="open-sic-slice" data-field="grupo" data-label="${escapeAttribute(row.label)}">
              <strong>${row.sics}</strong>
              <span>Nº SICs</span>
              <strong>${money(row.valor)}</strong>
              <span>Total</span>
              <b>${number((row.additions / total) * 100, 1)}% aditivos</b>
              <b>${number((row.suppressions / total) * 100, 1)}% supressões</b>
              <small>${row.label}</small>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderSicTablePanel(title, subtitle, rows, labelTitle, field = "") {
  return `
    <section class="panel sic-table-panel">
      <div class="panel-header">
        <div>
          <h2>${title}</h2>
          <p class="panel-subtitle">${subtitle}</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>${labelTitle}</th>
              <th class="numeric">Obras</th>
              <th class="numeric">SICs</th>
              <th class="numeric">Custo</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr ${field ? `data-action="open-sic-slice" data-field="${field}" data-label="${escapeAttribute(row.label || row.nomeObra)}" role="button" tabindex="0"` : ""}>
                    <td><strong>${row.label || row.nomeObra}</strong></td>
                    <td class="numeric">${row.works || "—"}</td>
                    <td class="numeric">${row.sics || row.id || "—"}</td>
                    <td class="numeric">${money(Math.abs(row.valor || 0))}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderSicHistoryPanel(rows) {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Histórico de SICs</h2>
          <p class="panel-subtitle">Nº de SIC, obra, disciplinas, impacto, status e aprovação</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>SIC</th>
              <th>Obra</th>
              <th>Movimento</th>
              <th>Disciplinas</th>
              <th class="numeric">Valor</th>
              <th>Sprint / Analista</th>
              <th>Origem</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length
                ? rows
                    .slice(0, 250)
                    .map(
                      (sic) => `
                        <tr data-action="open-sic-detail" data-key="${escapeAttribute(sicSummaryKey(sic))}" role="button" tabindex="0">
                          <td><strong>${sic.id}</strong><br /><span class="muted">${sic.motivos.slice(0, 2).join(" | ")}</span></td>
                          <td><strong>${sic.nomeObra}</strong><br /><span class="muted">${sic.obra} | ${sic.estado}</span></td>
                          <td><span class="status-pill" data-status="${sic.valor < 0 ? "Completo" : "Pendente"}">${sic.movimento}</span></td>
                          <td>${sic.disciplinas.slice(0, 4).map((item) => `<span class="tag">${item}</span>`).join(" ")}${sic.disciplinas.length > 4 ? ` <span class="muted">+${sic.disciplinas.length - 4}</span>` : ""}</td>
                          <td class="numeric">${money(sic.valor)}</td>
                          <td>${sic.sprint}<br /><span class="muted">${sic.analista}</span></td>
                          <td>
                            ${
                              sic.status === "Pendente" && sic.actionId
                                ? `<button class="secondary-action" type="button" data-action="approve-sic" data-id="${sic.id}">Aprovar</button>`
                                : `<span class="muted">${sic.source}</span>`
                            }
                          </td>
                        </tr>
                      `
                    )
                    .join("")
                : `<tr><td colspan="7"><div class="empty-state">Sem SIC histórica importada. O painel já está preparado para registrar aditivos, supressões, causa raiz e impacto financeiro.</div></td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function sicSummaryKey(sic) {
  return `${sic.source}|${sic.id}|${sic.obra}|${sic.nomeObra}|${sic.movimento}`;
}

function openSicDetailModal(key) {
  const row = sicSummaryRows(sicLineRecords()).find((sic) => sicSummaryKey(sic) === key);
  if (!row) return;
  const related = sicLineRecords().filter((record) => `${record.source}|${record.id}|${record.obra}|${record.nomeObra}|${record.movimento}` === key);
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card" aria-labelledby="sicDetailTitle">
        <header>
          <div>
            <span class="eyebrow">Histórico de SICs</span>
            <h2 id="sicDetailTitle">${row.id} | ${row.movimento}</h2>
            <p class="muted">${row.nomeObra} | ${row.obra} | ${row.estado}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${splitItem("Impacto", money(row.valor))}
            ${splitItem("Disciplinas", String(row.disciplinas.length))}
            ${splitItem("Tipologia", row.tipologias.join(", ") || "—")}
            ${splitItem("Origem", row.source)}
          </div>
          ${renderSicRecordsTable(related)}
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
        </footer>
      </section>
    </div>
  `;
}

function openSicSliceDetailModal(field, label) {
  const records = filterSicRecords(sicLineRecords()).filter((record) => {
    if (field === "month") {
      const key = record.dataPostagem ? record.dataPostagem.slice(0, 7) : "sem-data";
      return key === label;
    }
    if (field === "sprint") {
      const rawSprint = cleanImportedText(record.sprint || "—");
      const sprintLabel = normalizeSearchText(rawSprint).includes("sprint") ? rawSprint : `Sprint ${rawSprint}`;
      return sprintLabel === label;
    }
    return cleanImportedText(record[field]) === label;
  });
  const title = field === "month" ? (label === "sem-data" ? "Sem data" : dateText(`${label}-01`)) : label;
  const rows = sicSummaryRows(records);
  const total = records.reduce((sum, record) => sum + record.valor, 0);
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal-card kpi-modal-card" aria-labelledby="sicSliceTitle">
        <header>
          <div>
            <span class="eyebrow">Detalhe de SICs</span>
            <h2 id="sicSliceTitle">${title}</h2>
            <p class="muted">${fieldLabel(field)} | ${records.length} linha(s) | ${rows.length} SIC(s)</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="kpi-detail-grid">
            ${splitItem("Impacto líquido", money(total))}
            ${splitItem("Aditivos", money(records.filter((record) => record.valor > 0).reduce((sum, record) => sum + record.valor, 0)))}
            ${splitItem("Supressões", `-${money(Math.abs(records.filter((record) => record.valor < 0).reduce((sum, record) => sum + record.valor, 0)))}`)}
            ${splitItem("Obras", String(new Set(records.map((record) => `${record.obra}|${record.nomeObra}`)).size))}
          </div>
          ${renderSicRecordsTable(records)}
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
        </footer>
      </section>
    </div>
  `;
}

function openSicTimelineDetailModal(mode, key) {
  openSicSliceDetailModal(mode === "month" ? "month" : "sprint", key);
}

function fieldLabel(field) {
  const labels = {
    month: "Mês",
    sprint: "Sprint",
    motivo: "Motivo",
    disciplina: "Disciplina",
    tipologia: "Tipologia",
    estado: "Estado",
    grupo: "Grupo",
    nomeObra: "Obra",
    analista: "Analista",
  };
  return labels[field] || field;
}

function renderSicRecordsTable(records) {
  const summaries = sicSummaryRows(records);
  return `
    <section class="panel soft-panel sic-history-detail-panel">
      <div class="panel-header">
        <div>
          <h3>Histórico de SICs</h3>
          <p class="panel-subtitle">Dados importados da base histórica para auditoria do recorte selecionado</p>
        </div>
      </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>SIC</th>
            <th>Obra</th>
            <th>Motivo</th>
            <th>Disciplina</th>
            <th class="numeric">Valor</th>
            <th>Sprint / Data</th>
          </tr>
        </thead>
        <tbody>
          ${summaries
            .map(
              (sic) => `
                <tr>
                  <td><strong>${sic.id}</strong><br /><span class="muted">${sic.source}</span></td>
                  <td><strong>${sic.nomeObra}</strong><br /><span class="muted">${sic.estado}</span></td>
                  <td>${sic.motivos.slice(0, 3).join(" | ")}</td>
                  <td>${sic.disciplinas.slice(0, 4).map((item) => `<span class="tag">${item}</span>`).join(" ")}</td>
                  <td class="numeric">${money(sic.valor)}</td>
                  <td>${sic.sprint}<br /><span class="muted">${dateText(sic.dataPostagem)}</span></td>
                </tr>
              `
            )
            .join("") || `<tr><td colspan="6"><div class="empty-state">Sem registros para este recorte.</div></td></tr>`}
        </tbody>
      </table>
    </div>
    </section>
  `;
}

function sicsByDiscipline() {
  const map = new Map();
  sicLineRecords().forEach((sic) => {
    const label = sic.disciplina || "Não informada";
    map.set(label, (map.get(label) || 0) + Math.abs(sic.valor || 0));
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);
}

function sicsByMotivation() {
  const map = new Map();
  sicSummaryRows().forEach((sic) => {
    const label = sic.motivos[0] || "Não informado";
    map.set(label, (map.get(label) || 0) + 1);
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function sicsByWork() {
  const map = new Map();
  sicLineRecords().forEach((sic) => {
    const label = sic.nomeObra || "Obra não informada";
    map.set(label, (map.get(label) || 0) + Math.abs(sic.valor || 0));
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);
}

function renderAnalytics() {
  const costData = costPerM2ByDiscipline().slice(0, 9);
  const volatility = volatilityByDiscipline().slice(0, 9);
  const typology = capexByTypology();

  return `
    ${renderToolbar("Disciplina & Tipologia", "Custo por m², desvio e volatilidade por disciplina", "", moduleHeaders.budget)}
    <section class="kpi-grid">
      ${kpi("Disciplinas rastreadas", String(disciplines.filter((item) => item.selecionavelParaSIC).length), "Dicionário canônico ativo", "blue")}
      ${kpi("Volatilidade aprovada", money(approvedSicTotal()), "Soma de SICs aprovadas", "orange")}
      ${kpi("Tipologias", String(new Set(state.works.map((work) => work.tipologiaObra)).size), "Segmentos com obras cadastradas", "green")}
      ${kpi("Itens bloqueados", "2", "SIC's e Taxa de Risco", "red")}
    </section>

    <div class="content-grid three">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Custo por m²</h2>
            <p class="panel-subtitle">Top disciplinas</p>
          </div>
        </div>
        ${barList(costData, "valor", (value) => `${money(value)}/m²`)}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Volatilidade</h2>
            <p class="panel-subtitle">SICs aprovadas por disciplina</p>
          </div>
        </div>
        ${barList(volatility, "valor", money)}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>CAPEX por tipologia</h2>
            <p class="panel-subtitle">Orçado + aditivado aprovado</p>
          </div>
        </div>
        ${barList(typology, "valor", money)}
      </section>
    </div>
  `;
}

function renderSuppliers() {
  return `
    ${renderToolbar("Fornecedores", "Contratações estruturadas por obra e disciplina", `
      <button class="primary-action" type="button" data-action="open-contract">Nova contratação</button>
    `, moduleHeaders.budget)}
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Empresas cadastradas</h2>
          <p class="panel-subtitle">Cadastro central reutilizável entre obras</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th>CNPJ</th>
              <th>Contato</th>
              <th class="numeric">Contratado</th>
            </tr>
          </thead>
          <tbody>
            ${state.suppliers
              .map((supplier) => {
                const total = state.contracts
                  .filter((contract) => contract.fornecedorId === supplier.id)
                  .reduce((sum, contract) => sum + contract.valor, 0);
                return `
                  <tr>
                    <td><strong>${supplier.razaoSocial}</strong></td>
                    <td>${supplier.cnpj}</td>
                    <td>${supplier.contatoPrincipal}</td>
                    <td class="numeric">${money(total)}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Contratações</h2>
          <p class="panel-subtitle">Valores consumindo saldo por disciplina</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Obra</th>
              <th>Disciplina</th>
              <th>Fornecedor</th>
              <th class="numeric">Valor</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            ${state.contracts
              .map((contract) => `
                <tr>
                  <td><strong>${contract.numeroContrato}</strong></td>
                  <td>${workById(contract.obraId)?.nome || "Obra não localizada"}</td>
                  <td>${disciplineById(contract.disciplinaId).nome}</td>
                  <td>${supplierById(contract.fornecedorId)?.razaoSocial || "Fornecedor não localizado"}</td>
                  <td class="numeric">${money(contract.valor)}</td>
                  <td>${dateText(contract.data)}</td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderWorksSettings() {
  return `
    ${renderWorksToolbar("worksSettings", "Configurações de Obras", "Legenda da chave e listas de apoio do módulo Obras", `
      <button class="secondary-action" type="button" data-view="settings">Configuração global</button>
      <button class="danger-action" type="button" data-action="reset-demo">Restaurar base Orçamento 360</button>
    `)}

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Nomenclaturas do EV Padrão</h2>
            <p class="panel-subtitle">Linhas de custo mantidas por posição para preservar os EVs existentes</p>
          </div>
        </div>
        <div class="ev-dictionary">
          ${renderDisciplineDictionary("CustosDaObra", "Custos da Obra")}
          ${renderDisciplineDictionary("OutrasCategorias", "Outras Categorias")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Usuários e capacidade</h2>
            <p class="panel-subtitle">Analistas mobilizados no fluxo de Obras</p>
          </div>
        </div>
        ${barList(analystLoad(true), "valor", (value) => `${value} demanda${value === 1 ? "" : "s"}`)}
      </section>
    </div>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Legenda da Chave Única</h2>
            <p class="panel-subtitle">Sequência, ano, tipo de unidade, classificação, tipologia e UF</p>
          </div>
        </div>
        ${renderKeyLegend()}
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Sprints globais</h2>
            <p class="panel-subtitle">Períodos unificados para Obras, Manutenção, Engenharia Clínica e demais módulos</p>
          </div>
          <button class="secondary-action" type="button" data-view="settings">Abrir configuração</button>
        </div>
        <p class="settings-help-text">As sprints passaram a ser cadastradas uma única vez em Configuração, igual ao Traço. Cada módulo apenas consome a sprint ativa.</p>
        ${renderSprintsTable()}
      </section>
    </div>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Listas de apoio</h2>
          <p class="panel-subtitle">Cadastros usados em filtros, demandas e chaves</p>
        </div>
      </div>
      <div class="support-grid">
        ${supportList("Analistas", uniqueAnalysts())}
        ${supportList("Tipos de Unidade", uniqueWorkValues("tipoUnidade"))}
        ${supportList("Classificação da Obra", uniqueWorkValues("classificacaoObra"))}
        ${supportList("Tipologia da Obra", uniqueWorkValues("tipologiaObra"))}
        ${supportList("Tipo de Atividade", [...new Set(state.demands.map((demand) => demandTypeLabel(demand.tipo)))])}
        ${supportList("Status das Demandas", columns.map((column) => column.label))}
      </div>
    </section>
  `;
}

function renderDisciplineDictionary(category, title) {
  const items = disciplines.filter((discipline) => discipline.categoria === category);
  return `
    <section class="dictionary-block">
      <h3>${title}</h3>
      <div class="dictionary-list">
        ${items
          .map(
            (discipline) => `
              <div class="dictionary-item">
                <span>${String(discipline.posicao).padStart(2, "0")}</span>
                <strong>${discipline.nome}</strong>
                ${discipline.selecionavelParaSIC ? "" : `<em>Travada</em>`}
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderKeyLegend() {
  const keyParts = [
    ["001", "Seq. da obra"],
    ["26", "Ano"],
    ["01", "Tipo de unidade"],
    ["AR", "Classificação"],
    ["RFT", "Tipologia"],
    ["CE", "UF"],
  ];
  return `
    <div class="key-legend">
      <div class="key-example">
        ${keyParts.map((item) => `<span>${item[0]}</span>`).join("<b>_</b>")}
      </div>
      <div class="support-grid compact">
        ${supportList("Tipo de Unidade", ["01 Clínica", "02 Hospital", "03 Diagnóstico", "04 Pronto Atendimento", "05 Administrativo", "06 Centro de Distribuição", "07 TEA", "08 Coleta", "09 Medprev"])}
        ${supportList("Classificação", ["AR Adequação Regulatória", "EO Eficiência Operacional", "FC Fachada", "EM Obra Emergencial", "EE Obra Estratégica", "SR Suficiência de Rede", "VZ Verticalização", "VS Venda de Serviços", "PU Padronização de Unidade"])}
        ${supportList("Tipologia", ["NVU Nova Unidade", "RFT Retrofit", "AMP Ampliação"])}
        ${supportList("Seq + Ano + UF", ["001-999 Nº sequencial", "26, 27... Ano de cadastro", "CE, SP... UF padrão IBGE"])}
      </div>
    </div>
  `;
}

function renderSprintSettingsPanel() {
  return `
    <section class="panel sprint-settings-panel">
      <div class="panel-header">
        <div>
          <h2>Sprints globais</h2>
          <p class="panel-subtitle">Cadastro único usado nas visões operacionais de Orçamento, Manutenção, Engenharia Clínica e Controle de Verbas</p>
        </div>
        <span class="tag">Sprint ativa: ${currentSprint()?.nome || "sem sprint ativa"}</span>
      </div>
      <form class="inline-sprint-form" id="sprintInlineForm">
        <div class="error-box inline-form-error" data-form-error></div>
        <label class="field">
          <span>Nome da sprint</span>
          <input name="nome" required placeholder="Ex.: Sprint 15" />
        </label>
        <label class="field">
          <span>Data início</span>
          <input name="dataInicio" type="date" required />
        </label>
        <label class="field">
          <span>Data fim</span>
          <input name="dataFim" type="date" required />
        </label>
        <label class="field">
          <span>Status</span>
          <select name="status">
            <option value="Planejada">Planejada</option>
            <option value="Ativa">Ativa</option>
            <option value="Encerrada">Encerrada</option>
          </select>
        </label>
        <button class="primary-action" type="submit">Criar sprint</button>
      </form>
      ${renderSprintsTable()}
    </section>
  `;
}

function renderSprintsTable() {
  const sprints = Array.isArray(state.sprints) ? state.sprints : [];
  return `
    <div class="table-wrap sprint-table-wrap">
      <table class="data-table sprint-table">
        <thead>
          <tr>
            <th>Sprint</th>
            <th>Início</th>
            <th>Fim</th>
            <th>Status</th>
            <th>Uso</th>
          </tr>
        </thead>
        <tbody>
          ${
            sprints.length
              ? sprints
                  .map(
                    (sprint) => `
                <tr>
                  <td><strong>${sprint.nome}</strong></td>
                  <td>${dateText(sprint.dataInicio)}</td>
                  <td>${dateText(sprint.dataFim)}</td>
                  <td><span class="status-pill" data-status="${sprint.status === "Ativa" ? "Completo" : "Aguardando"}">${sprint.status}</span></td>
                  <td><span class="tag">Todos os módulos</span></td>
                </tr>
              `
                  )
                  .join("")
              : `
                <tr>
                  <td colspan="5"><span class="muted">Nenhuma sprint cadastrada. Crie a primeira sprint global para alimentar os kanbans.</span></td>
                </tr>
              `
          }
        </tbody>
      </table>
    </div>
  `;
}

function supportList(title, items) {
  return `
    <article class="support-list">
      <h3>${title}</h3>
      <div>
        ${items.map((item) => `<span class="tag">${item}</span>`).join("") || `<span class="muted">Sem dados</span>`}
      </div>
    </article>
  `;
}

function uniqueWorkValues(field) {
  return [...new Set(state.works.map((work) => work[field]).filter(Boolean))];
}

function renderUsersSettingsPanel() {
  const users = Array.isArray(state.users) ? state.users : [];
  const user = currentUser();
  return `
    <section class="panel users-settings-panel">
      <div class="panel-header">
        <div>
          <h2>Equipe e perfis globais</h2>
          <p class="panel-subtitle">Cadastro único de usuários, papéis e acessos para todos os módulos do SLT 360</p>
        </div>
        <div class="active-user-badge">
          <span>Usuário conectado</span>
          <strong>${user?.nome || "Não conectado"}</strong>
          <em>${activeRole()}</em>
        </div>
      </div>

      <form class="user-inline-form" id="userForm">
        <div class="error-box inline-form-error" data-form-error></div>
        <label class="field">
          <span>Nome</span>
          <input name="nome" required placeholder="Ex.: Mariana Silva" />
        </label>
        <label class="field">
          <span>E-mail</span>
          <input name="email" type="email" required placeholder="nome@hapvida.com.br" />
        </label>
        <label class="field">
          <span>Senha provisória</span>
          <input name="senha" type="password" required autocomplete="new-password" placeholder="Ex.: SLT@2026" />
        </label>
        <label class="field">
          <span>Perfil</span>
          <select name="perfil">
            ${Object.keys(roleDefinitions).map((role) => `<option value="${role}" ${role === "Analista" ? "selected" : ""}>${role}</option>`).join("")}
          </select>
        </label>
        <fieldset class="user-access-picker">
          <legend>Módulos liberados</legend>
          ${renderUserAccessCheckboxes(defaultAccessModulesForProfile("Analista"))}
        </fieldset>
        <label class="user-force-password">
          <input name="mustChangePassword" type="checkbox" checked />
          <span>Exigir troca de senha no primeiro acesso</span>
        </label>
        <button class="primary-action" type="submit">Criar usuário</button>
      </form>

      <div class="content-grid users-access-grid">
        <div class="table-wrap users-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Módulos liberados</th>
                <th>Senha</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${users
                .map(
                  (user) => `
                    <tr>
                      <td><strong>${user.nome}</strong></td>
                      <td><span class="muted">${user.email}</span></td>
                      <td>${user.perfil}</td>
                      <td>${renderUserAccessChips(user)}</td>
                      <td><span class="status-pill" data-status="${user.mustChangePassword || user.senhaProvisoria ? "Aguardando" : "Completo"}">${user.mustChangePassword || user.senhaProvisoria ? "Provisória" : "Definitiva"}</span></td>
                      <td><span class="status-pill" data-status="Completo">${user.status || "Ativo"}</span></td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="role-matrix">
          ${Object.entries(roleDefinitions)
            .map(
              ([role, config]) => `
                <article>
                  <strong>${config.label}</strong>
                  <p>${config.description}</p>
                  <span class="status-pill" data-status="${config.blockedViews.includes("budget") ? "Reprovado" : "Aprovado"}">
                    Controle de Verbas: ${config.blockedViews.includes("budget") ? "bloqueado" : "liberado"}
                  </span>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderUserAccessCheckboxes(selectedModules = []) {
  const selected = new Set(selectedModules);
  return userAccessModules
    .map(
      (module) => `
        <label class="user-access-option">
          <input name="accessModules" type="checkbox" value="${module.id}" ${selected.has(module.id) ? "checked" : ""} />
          <span>
            <strong>${module.label}</strong>
            <small>${module.detail}</small>
          </span>
        </label>
      `
    )
    .join("");
}

function renderUserAccessChips(user) {
  const modules = normalizeAccessModules(user?.accessModules, user?.perfil);
  return `
    <div class="user-access-chip-list">
      ${userAccessModules
        .filter((module) => modules.includes(module.id))
        .map((module) => `<span class="tag">${module.label}</span>`)
        .join("") || `<span class="muted">Sem módulos liberados</span>`}
    </div>
  `;
}

function renderSettings() {
  const history = Array.isArray(state.history) ? state.history : [];
  return `
    ${renderToolbar("Configuração", "Sprints, equipe, perfis, dicionários e auditoria global do SLT 360", `
      <button class="danger-action" type="button" data-action="reset-demo">Restaurar base Orçamento 360</button>
    `)}
    ${renderSprintSettingsPanel()}
    ${renderUsersSettingsPanel()}
    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Dicionário de disciplinas</h2>
            <p class="panel-subtitle">Posição imutável e bloqueio de itens genéricos</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Disciplina</th>
                <th>Categoria</th>
                <th>SIC</th>
              </tr>
            </thead>
            <tbody>
              ${disciplines
                .map((discipline) => `
                  <tr>
                    <td>${discipline.posicao}</td>
                    <td><strong>${discipline.nome}</strong></td>
                    <td>${categoryLabel(discipline.categoria)}</td>
                    <td>
                      <span class="status-pill" data-status="${discipline.selecionavelParaSIC ? "Aprovado" : "Reprovado"}">
                        ${discipline.selecionavelParaSIC ? "Selecionável" : "Bloqueado"}
                      </span>
                    </td>
                  </tr>
                `)
                .join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Histórico</h2>
            <p class="panel-subtitle">Auditoria das alterações relevantes</p>
          </div>
        </div>
        <div class="history-list">
          ${history
            .slice(0, 12)
            .map(renderHistoryItem)
            .join("") || `<div class="empty-state">Sem histórico registrado.</div>`}
        </div>
      </section>
    </div>
  `;
}

function renderHistoryItem(item = {}) {
  const entity = String(item.entidade || item.entity || "sistema").toUpperCase();
  const entityId = item.entidadeId || item.entityId || item.id || "";
  const field = item.campo || item.action || "evento";
  const previous = item.valorAnterior ?? "";
  const next = item.valorNovo ?? item.detail ?? "";
  const timestamp = new Date(item.timestamp || "");
  const timestampText = Number.isNaN(timestamp.getTime()) ? "sem data" : timestamp.toLocaleString("pt-BR");
  return `
    <article class="history-item">
      <strong>${escapeAttribute(`${entity} ${entityId} | ${field}`)}</strong>
      <span>${escapeAttribute(previous ? `${previous} -> ${next}` : next || "Evento registrado")}</span><br />
      <span>${escapeAttribute(item.usuario || item.user || "Sistema")} | ${timestampText}</span>
    </article>
  `;
}

function capexByDiscipline() {
  const map = new Map();
  state.works.forEach((work) => {
    work.ev.lines.forEach((line) => {
      if (isRiskLine(line)) return;
      const values = lineTotals(work, line);
      const id = canonicalDisciplineId(line.disciplinaId);
      map.set(id, (map.get(id) || 0) + values.orcado + values.aditivado);
    });
  });
  return [...map.entries()]
    .map(([id, valor]) => ({ label: disciplineById(id).nome, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function capexByTypology() {
  const map = new Map();
  state.works.forEach((work) => {
    const values = workTotals(work);
    map.set(work.tipologiaObra, (map.get(work.tipologiaObra) || 0) + values.orcado + values.aditivado);
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function capexByRegional() {
  const map = new Map();
  state.works.forEach((work) => {
    const values = workTotals(work);
    map.set(work.regiao, (map.get(work.regiao) || 0) + values.orcado + values.aditivado);
  });
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function costPerM2ByDiscipline() {
  const map = new Map();
  state.works.forEach((work) => {
    work.ev.lines.forEach((line) => {
      if (isRiskLine(line)) return;
      const values = lineTotals(work, line);
      const id = canonicalDisciplineId(line.disciplinaId);
      const current = map.get(id) || { valor: 0, area: 0 };
      current.valor += values.orcado + values.aditivado;
      current.area += work.areaEquivalente;
      map.set(id, current);
    });
  });
  return [...map.entries()]
    .map(([id, item]) => ({ label: disciplineById(id).nome, valor: item.valor / Math.max(item.area, 1) }))
    .sort((a, b) => b.valor - a.valor);
}

function volatilityByDiscipline() {
  const map = new Map();
  state.sics
    .filter((sic) => sic.status === "Aprovado")
    .forEach((sic) => {
      sic.disciplinasAfetadas.forEach((item) => {
        const id = canonicalDisciplineId(item.disciplinaId);
        map.set(id, (map.get(id) || 0) + Math.abs(item.valorDelta));
      });
    });
  return [...map.entries()]
    .map(([id, valor]) => ({ label: disciplineById(id).nome, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function primarySicForDemand(demand) {
  return (demand.sicIds || [])
    .map((id) => state.sics.find((sic) => sic.id === id))
    .find(Boolean);
}

function demandSicInfo(demand) {
  const sic = primarySicForDemand(demand);
  if (demandTypeKey(demand.tipo) !== "SIC" && !sic && !demand.sicMetadata) return null;
  const metadata = demand.sicMetadata || {};
  const anexos = [...(metadata.anexos || []), ...(sic?.anexos || [])].filter(Boolean);
  const uniqueSicAttachments = uniqueAttachments(anexos);
  return {
    lecomNumber: metadata.lecomNumber || sic?.lecomNumber || "—",
    obraNumber: metadata.obraNumber || sic?.obraNumber || "—",
    obraNome: metadata.obraNome || sic?.obraNome || workById(demand.obraId)?.nome || "—",
    tituloSic: metadata.tituloSic || sic?.titulo || demand.observacao || "—",
    numeroSic: metadata.numeroSic || sic?.numeroSic || sic?.id || "—",
    descricaoSic: metadata.descricaoSic || sic?.descricao || demand.observacao || "—",
    analistaSalaTecnica: metadata.analistaSalaTecnica || sic?.analistaSalaTecnica || demand.analistaResponsavel || "—",
    motivo: metadata.motivo || sic?.motivo || "InformacaoContratada",
    anexos: uniqueSicAttachments,
  };
}

function renderSicApprovalSyncPanel(demand) {
  const approval = sicApprovalReading(demand);
  const approvedAt = demand.sicApprovalApprovedAt ? `Aprovada em ${dateText(demand.sicApprovalApprovedAt)}` : "";
  const requestedAt = demand.sicApprovalRequestedAt ? `Solicitada em ${dateText(demand.sicApprovalRequestedAt)}` : "Entrada sincronizada com a fila de aprovação";
  const rejectedAt = demand.sicApprovalRejectedAt ? `Reprovada em ${dateText(demand.sicApprovalRejectedAt)}` : "";
  const note = approval.status === "Postada" ? `Postada no EV em ${dateText(demand.sicPostedAt)}` : approval.status === "Aprovado" ? approvedAt : approval.status === "Reprovado" ? rejectedAt : requestedAt;
  return `
    <div class="sic-approval-sync" data-tone="${approval.tone}">
      <div>
        <span>Fluxo de aprovação</span>
        <strong>${approval.label}</strong>
        <small>${note || "Aguardando validação da Sala Técnica"}</small>
      </div>
      <div class="inline-actions">
        <button class="secondary-action compact-action" type="button" data-action="open-sic-approval" data-id="${demand.id}">Abrir aprovação</button>
      </div>
    </div>
  `;
}

function renderDemandSicMetadata(demand) {
  const info = demandSicInfo(demand);
  if (!info) return "";
  const approval = sicApprovalReading(demand);
  const canPost = approval.status === "Aprovado";
  const safeDescription = info.descricaoSic === "—" ? "" : escapeAttribute(info.descricaoSic);
  return `
    <section class="modal-section sic-detail-section">
      <div class="section-title">
        <span>Dados da SIC</span>
      </div>
      <div class="sic-detail-grid">
        ${sicDetailItem("Nº do LECOM", info.lecomNumber)}
        ${sicDetailItem("Nº da obra", info.obraNumber)}
        ${sicDetailItem("Nome da obra", info.obraNome)}
        ${sicDetailItem("Título da SIC", info.tituloSic)}
        ${sicDetailItem("Analista ST", info.analistaSalaTecnica)}
      </div>
      <label class="sic-description-box">
        <span>Descrição da SIC</span>
        <textarea name="sicDescricao" required>${safeDescription}</textarea>
      </label>
      ${renderSicDraftDisciplineEditor(demand)}
      ${renderSicApprovalSyncPanel(demand)}
      ${renderDemandSicRiskAlert(demand)}
      <div class="sic-attachments-list">
        <span>Arquivos anexados</span>
        ${renderAttachmentList(info.anexos)}
        <label class="file-drop attachment-file-drop">
          <input name="sicDetailFiles" type="file" multiple />
          <span>Adicionar arquivo(s)</span>
          <small>Arquivos adicionais da SIC</small>
        </label>
      </div>
      <div class="sic-posting-actions">
        ${
          (demand.sicIds || []).length
            ? `<span class="tag">Postada no EV: ${postedSicDisplaySummary(demand)}</span>`
            : canPost
              ? `<button class="primary-action" type="button" data-action="post-sic-to-ev" data-id="${demand.id}">Postar SIC no EV</button>
                 <small class="muted">Aprovada: a postagem cria a SIC no EV e vincula as disciplinas informadas ao estudo.</small>`
              : `<button class="secondary-action" type="button" data-action="open-sic-approval" data-id="${demand.id}">Enviar para aprovação</button>
                 <small class="muted">A SIC precisa ser aprovada na aba SICs > Aprovação antes da postagem no EV.</small>`
        }
      </div>
    </section>
  `;
}

function postedSicDisplaySummary(demand) {
  return (demand.sicIds || [])
    .map((id) => {
      const sic = state.sics.find((item) => item.id === id);
      if (!sic) return escapeAttribute(id);
      return escapeAttribute(`${sicDisplayReference(sic)} · ${sicDisplayTitle(sic)}`);
    })
    .join(", ");
}

function renderDemandSicRiskAlert(demand) {
  const work = workById(demand.obraId);
  if (!work) return "";
  const postedSics = (demand.sicIds || []).map((id) => state.sics.find((sic) => sic.id === id)).filter(Boolean);

  if (postedSics.length) {
    const alerts = postedSics
      .map((sic) => ({ sic, risk: sicRiskReading(work, sic) }))
      .filter(({ risk }) => risk.exceeded);
    if (!alerts.length) return "";
    return `
      <div class="sic-risk-alert" role="alert">
        <strong>Alerta de risco</strong>
        ${alerts
          .map(
            ({ sic, risk }) => `
              <p>
                A ${escapeAttribute(`${sicDisplayReference(sic)} · ${sicDisplayTitle(sic)}`)} foi postada com ${money(risk.total)}, acima do risco disponível de ${money(risk.available)}.
                Excesso estimado: <b>${money(risk.excess)}</b>.
              </p>
            `
          )
          .join("")}
      </div>
    `;
  }

  const draftTotal = (demand.sicDraftDisciplines || []).reduce((sum, item) => sum + Math.max(Number(item.valorDelta) || 0, 0), 0);
  const risk = sicRiskReading(work, null, draftTotal);
  if (!draftTotal || !risk.exceeded) return "";
  return `
    <div class="sic-risk-alert" role="alert">
      <strong>Alerta de risco</strong>
      <p>
        O valor previsto da SIC é ${money(risk.total)}, acima do risco disponível de ${money(risk.available)}.
        Excesso estimado: <b>${money(risk.excess)}</b>.
      </p>
    </div>
  `;
}

function sicDetailItem(label, value) {
  return `
    <div class="detail-card">
      <span>${label}</span>
      <strong>${escapeAttribute(value || "—")}</strong>
    </div>
  `;
}

function renderDemandUnitContext(demand, work = null) {
  const isExisting = demand.unidadeModo === "existente";
  const unitName = demand.unidadeNome || (isExisting ? "" : work?.nome || "");
  const unitType = demand.unidadeTipo || (isExisting ? "" : work?.tipoUnidade || "");
  const unitCity = demand.unidadeMunicipio || (isExisting ? "" : [work?.cidade, work?.uf].filter(Boolean).join("/"));
  const unitCnpj = demand.unidadeCnpj || (isExisting ? "" : work?.cnpj || "");
  const unitCenter = demand.unidadeCentro || (isExisting ? "" : work?.codigoOriginal || "");
  const source = demand.unidadeSource || (isExisting ? "Cadastro geral de unidades" : "Portfólio de obras");

  if (!unitName && !isExisting) return "";

  return `
    <section class="modal-section">
      <div class="section-title">
        <span>Contexto da unidade</span>
      </div>
      <div class="split-list compact">
        ${splitItem("Tipo de intervenção", isExisting ? "Obra em unidade existente" : "Unidade nova")}
        ${splitItem("Unidade", unitName || "Não vinculada")}
        ${splitItem("Tipo / Local", [unitType, unitCity].filter(Boolean).join(" | ") || "—")}
        ${splitItem("CNPJ", unitCnpj || "Não informado")}
        ${splitItem("Centro / origem", [unitCenter, source].filter(Boolean).join(" | ") || "—")}
      </div>
    </section>
  `;
}

function openDemandDetailModal(id) {
  const demand = state.demands.find((item) => item.id === id);
  if (!demand) return;
  const work = workById(demand.obraId);
  const sprint = sprintById(demand.sprintId);
  const histories = state.history.filter((item) => item.entidadeId === demand.id || (demand.sicIds || []).includes(item.entidadeId));
  const values = work ? workTotals(work) : { orcado: 0, aditivado: 0, contratado: 0, saldo: 0 };
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal-card demand-modal-card demand-detail-form" id="demandDetailForm" data-id="${demand.id}" aria-labelledby="demandDetailTitle">
        <header>
          <div>
            <span class="eyebrow">${demand.id} — ${demandTypeLabel(demand.tipo)}</span>
            <h2 id="demandDetailTitle">${work?.nome || "Obra não localizada"}</h2>
            <p class="muted">${work?.chaveUnica || work?.codigoOriginal || "sem código"} · ${sprint?.nome || "Sem sprint"}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="error-box" id="formError"></div>

          <section class="modal-section demand-analyst-section">
            <div class="section-title">
              <span>Analista responsável</span>
            </div>
            <div class="analyst-chip-grid">
              ${analystChipOptions(demand)}
            </div>
            <p class="muted">Líder: ${demand.analistaResponsavel || "A definir"} · Complementares: ${(demand.analistasComplementares || []).join(", ") || "Nenhum"}</p>
          </section>

          ${
            demandTypeKey(demand.tipo) === "SIC"
              ? ""
              : `<label class="field modal-section">
                  <span>Descrição da demanda *</span>
                  <textarea name="observacao" required>${demand.observacao || ""}</textarea>
                </label>`
          }

          ${renderDemandUnitContext(demand, work)}

          ${renderDemandSicMetadata(demand)}

          <section class="modal-section">
            <div class="section-title">
              <span>Classificação</span>
            </div>
            <div class="form-grid">
              <label class="field">
                <span>Tipo de atividade</span>
                <select name="tipo">
                  ${demandTypeOptions(demand.tipo)}
                </select>
              </label>
              <label class="field">
                <span>Sprint</span>
                <select name="sprintId" data-action="update-demand-sprint" data-id="${demand.id}">
                  ${sprintOptions(demand.sprintId)}
                </select>
                <small class="muted">${sprint ? `${dateText(sprint.dataInicio)} → ${dateText(sprint.dataFim)}` : "Sem período vinculado"}</small>
              </label>
            </div>
          </section>

          <section class="demand-status-box demand-status-control" data-status="${demand.coluna}">
            <label class="field">
              <span>Status atual · altere para mover o card</span>
              <select name="coluna" data-action="update-demand-status" data-id="${demand.id}">
                ${columnOptions(demand.coluna)}
              </select>
            </label>
          </section>

          <section class="modal-section">
            <div class="section-title">
              <span>Detalhes</span>
            </div>
            <div class="form-grid compact-form-grid">
              <label class="field">
                <span>Prioridade</span>
                <select name="prioridade">
                  ${priorityOptions(demand.prioridade)}
                </select>
              </label>
              <div class="detail-card">
                <span>Sprint atual</span>
                <strong>${sprint?.nome || "Sem sprint"}</strong>
                <small>${sprint ? `${dateText(sprint.dataInicio)} a ${dateText(sprint.dataFim)}` : "Sem período vinculado"}</small>
              </div>
            </div>
          </section>

          <section class="modal-section">
            <div class="section-title">
              <span>Datas</span>
            </div>
            <div class="date-grid demand-date-grid">
              ${dateField("1 · Data prevista de início", "dataPrevistaInicio", demand.dataPrevistaInicio)}
              ${dateField("2 · Data de início real", "dataInicioReal", demand.dataInicioReal)}
              ${dateField("3 · Prev. envio p/ validação Obras", "dataPrevEnvioValidacaoObras", demand.dataPrevEnvioValidacaoObras)}
              ${dateField("4 · Envio real p/ validação Obras", "dataEnvioRealValidacaoObras", demand.dataEnvioRealValidacaoObras)}
              <label class="validation-skip full-span">
                <input name="naoEnviarValidacaoObras" type="checkbox" ${demand.naoEnviarValidacaoObras ? "checked" : ""} />
                <span>Esta demanda não foi/será enviada para validação da equipe de Obras</span>
              </label>
              ${dateField("5 · Data de validação de Obras", "dataValidacaoObras", demand.dataValidacaoObras)}
              ${dateField("6 · Data prevista da entrega", "dataPrevistaEntrega", demand.dataPrevistaEntrega)}
              ${dateField("7 · Data entrega real", "dataEntregaReal", demand.dataEntregaReal, true)}
            </div>
          </section>

          <section class="modal-section">
            <div class="section-title with-action">
              <span>Histórico de alterações</span>
              <button class="secondary-action compact-action" type="button" data-action="toggle-demand-history">Ver histórico</button>
            </div>
            <div class="demand-history-panel" hidden>
              ${renderDemandHistory(histories)}
            </div>
          </section>

          <section class="modal-section">
            <div class="section-title">
              <span>Observação</span>
            </div>
            <textarea name="nota" placeholder="Registre observações relevantes sobre esta demanda...">${demand.nota || ""}</textarea>
          </section>

          <section class="modal-section">
            <div class="section-title with-action">
              <span>Projetos envolvidos</span>
            </div>
            ${renderDemandProjects(demand)}
          </section>

          <section class="modal-section demand-ev-section">
            <div class="section-title">
              <span>Estudo de Viabilidade (EV)</span>
            </div>
            <p class="muted">Esta demanda alimenta diretamente o EV da obra vinculada. Para a emissão inicial, o EV nasce gerado para preencher os custos.</p>
            <div class="split-list compact">
              ${splitItem("EV atual", work ? `REV${String(work.ev.versaoAtual).padStart(2, "0")} | ${money(values.orcado + values.aditivado)}` : "—")}
              ${splitItem("Saldo", money(values.saldo))}
            </div>
            ${work ? `<button class="primary-action full-width" type="button" data-action="open-work-ev" data-id="${work.id}">Abrir EV da obra vinculada</button>` : ""}
          </section>
        </div>
        <footer class="modal-actions">
          <button class="ghost-button danger-action" type="button" data-action="open-delete-demand" data-id="${demand.id}">Excluir demanda</button>
          <button class="ghost-button" type="button" data-action="close-modal">Fechar</button>
          <button class="primary-action" type="submit">Salvar</button>
        </footer>
      </form>
    </div>
  `;
}

function openDeleteDemandModal(id) {
  const demand = state.demands.find((item) => item.id === id);
  if (!demand) return;
  const work = workById(demand.obraId);
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal-card delete-demand-card" id="deleteDemandForm" data-id="${demand.id}" aria-labelledby="deleteDemandTitle">
        <header>
          <div>
            <span class="eyebrow">Excluir demanda</span>
            <h2 id="deleteDemandTitle">${demand.id} — ${demandTypeLabel(demand.tipo)}</h2>
            <p class="muted">${work?.nome || "Obra não localizada"} · ${demandStatusLabel(demand)}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="error-box" id="formError"></div>
          <section class="modal-section">
            <div class="section-title">
              <span>Justificativa obrigatória</span>
            </div>
            <textarea name="justificativa" required minlength="5" placeholder="Informe o motivo da exclusão da demanda..."></textarea>
            <p class="muted">O card será removido da visão operacional e a justificativa ficará registrada no histórico.</p>
          </section>
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
          <button class="danger-action" type="submit">Excluir demanda</button>
        </footer>
      </form>
    </div>
  `;
}

function analystChipOptions(demand) {
  const analysts = uniqueAnalysts();
  const current = demand.analistaResponsavel || "";
  const options = current && !analysts.includes(current) ? [current, ...analysts] : analysts;
  return options
    .map(
      (analyst) => `
        <label class="analyst-chip ${analyst === current ? "is-active" : ""}">
          <input name="analistaResponsavel" type="radio" value="${analyst}" ${analyst === current ? "checked" : ""} />
          <span>${analyst}</span>
        </label>
      `
    )
    .join("");
}

function demandTypeOptions(selected, includeSic = true) {
  const types = includeSic ? ["EmissaoInicial", "ReemissaoCompleta", "SIC"] : ["EmissaoInicial", "ReemissaoCompleta"];
  return types
    .map((type) => `<option value="${type}" ${demandTypeKey(selected) === type ? "selected" : ""}>${demandTypeLabel(type)}</option>`)
    .join("");
}

function sprintOptions(selected) {
  return [`<option value="">Sem sprint</option>`]
    .concat((state.sprints || []).map((sprint) => `<option value="${sprint.id}" ${sprint.id === selected ? "selected" : ""}>${sprint.nome}</option>`))
    .join("");
}

function columnOptions(selected) {
  return columns.map((column) => `<option value="${column.id}" ${column.id === selected ? "selected" : ""}>${column.label}</option>`).join("");
}

function priorityOptions(selected) {
  return ["Alta", "Média", "Baixa"]
    .map((priority) => `<option value="${priority}" ${priority === selected ? "selected" : ""}>${priority}</option>`)
    .join("");
}

function dateField(label, name, value, wide = false) {
  return `
    <label class="field ${wide ? "full-span" : ""}">
      <span>${label}</span>
      <input name="${name}" type="date" value="${value || ""}" />
    </label>
  `;
}

function renderDemandProjects(demand) {
  const entries = [];
  Object.entries(demand.projetos || {}).forEach(([discipline, status]) => {
    entries.push(`${discipline}: ${formatMasterStatus(status)}`);
  });
  (demand.projetosCustom || []).forEach((item) => {
    const name = item.nome || item.disciplina || "Projeto complementar";
    entries.push(`${name}: ${formatMasterStatus(item.status || item.caminho || item)}`);
  });
  if (!entries.length) return `<div class="empty-state">Nenhum projeto vinculado a esta demanda.</div>`;
  return `<div class="master-list">${entries.slice(0, 12).map((item) => `<span class="tag">${item}</span>`).join("")}</div>`;
}

function renderDemandHistory(histories) {
  if (!histories.length) return `<div class="empty-state">Sem histórico registrado para esta demanda.</div>`;
  return `
    <div class="timeline-list">
      ${histories
        .slice(0, 8)
        .map(
          (item) => `
            <article>
              <strong>${item.campo}</strong>
              <span>${item.valorAnterior} → ${item.valorNovo}</span>
              <small>${new Date(item.timestamp).toLocaleString("pt-BR")}</small>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function openSprintModal() {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal-card" id="sprintForm" aria-labelledby="sprintTitle">
        <header>
          <h2 id="sprintTitle">Nova sprint global</h2>
          <p class="muted">Use períodos quinzenais para organizar as esteiras operacionais de todos os módulos.</p>
        </header>
        <div class="modal-body">
          <div class="error-box" id="formError" data-form-error></div>
          <div class="form-grid">
            <label class="field">
              <span>Nome da sprint</span>
              <input name="nome" required placeholder="Sprint 14" />
            </label>
            <label class="field">
              <span>Status</span>
              <select name="status">
                <option value="Ativa">Ativa</option>
                <option value="Planejada">Planejada</option>
                <option value="Encerrada">Encerrada</option>
              </select>
            </label>
            <label class="field">
              <span>Data início</span>
              <input name="dataInicio" type="date" required />
            </label>
            <label class="field">
              <span>Data fim</span>
              <input name="dataFim" type="date" required />
            </label>
          </div>
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
          <button class="primary-action" type="submit">Cadastrar sprint global</button>
        </footer>
      </form>
    </div>
  `;
}

function openWorkModal(workId = "") {
  const work = workById(workId);
  const isEditing = Boolean(work);
  const draft = isEditing ? null : workModalPlanDraft;
  const fieldValue = (field, fallback = "") => escapeAttribute(work?.[field] ?? draft?.[field] ?? fallback ?? "");
  const currencyFieldValue = (value) => escapeAttribute(currencyInputValue(value));
  const tipoVerbaValue = String(work?.tipoVerba ?? work?.origemVerba ?? draft?.tipoVerba ?? draft?.origemVerba ?? "CAPEX").toUpperCase() === "OPEX" ? "OPEX" : "CAPEX";
  const verbaAportadaValue = work?.valorVerbaAportada ?? work?.plannedValue ?? work?.valorAprovado ?? work?.capexAprovado ?? draft?.valorVerbaAportada ?? draft?.plannedValue ?? draft?.valorAprovado ?? draft?.capexAprovado ?? 0;
  const valorEstimadoValue = work?.valorEstimado ?? draft?.valorEstimado ?? 0;
  const unidadeModoValue = String(work?.unidadeModo ?? draft?.unidadeModo ?? "nova") === "existente" ? "existente" : "nova";
  const unidadeIdValue = work?.unidadeId ?? draft?.unidadeId ?? "";
  const selectedUnit = unidadeIdValue ? maintenanceUnitById(unidadeIdValue) : null;
  const unidadeBuscaValue = work?.unidadeBusca ?? draft?.unidadeBusca ?? (selectedUnit ? sharedUnitSearchLabel(selectedUnit) : "");
  const metaCustoM2TargetIdValue = work?.metaCustoM2TargetId ?? draft?.metaCustoM2TargetId ?? "";
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal-card work-modal-card" id="workForm" aria-labelledby="workTitle">
        <input type="hidden" name="workId" value="${fieldValue("id")}" />
        <header>
          <div>
            <h2 id="workTitle">${isEditing ? "Editar obra" : "Nova obra"}</h2>
            <p class="muted">${isEditing ? "Atualize os dados cadastrais do portfólio sem perder o EV vinculado." : "Cadastre a demanda do plano de investimento e vincule automaticamente um EV rascunho."}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="error-box" id="formError"></div>
          <section class="modal-section sic-work-link-panel">
            <div class="section-title">
              <span>Contexto da unidade</span>
            </div>
            <div class="form-grid">
              <label class="field">
                <span>Tipo de cadastro</span>
                <select name="unidadeModo">
                  ${renderDemandUnitModeOptions(unidadeModoValue)}
                </select>
              </label>
              <label class="field full-span">
                <span>Assistente de busca de unidades</span>
                <input name="unidadeBusca" data-work-unit-search value="${escapeAttribute(unidadeBuscaValue)}" placeholder="Digite nome, CNPJ, centro, cidade, UF ou tipo..." autocomplete="off" />
              </label>
            </div>
            <input type="hidden" name="unidadeId" value="${escapeAttribute(unidadeIdValue)}" />
            <div data-work-unit-results>
              ${maintenanceUnitSearchResults(unidadeBuscaValue, unidadeIdValue)}
            </div>
            <p class="muted">Escolha unidade nova para expansão/greenfield ou selecione uma unidade existente para puxar os dados cadastrais da base geral.</p>
          </section>
          <div class="form-grid">
            <label class="field">
              <span>Nome da obra *</span>
              <input name="nome" required placeholder="Ex.: Nova Clínica Caucaia" value="${fieldValue("nome")}" />
            </label>
            <label class="field">
              <span>Chave única</span>
              <input name="chaveUnica" placeholder="Gerada automaticamente se ficar em branco" value="${fieldValue("chaveUnica")}" />
            </label>
            <label class="field">
              <span>Cód. Orig.</span>
              <input name="codigoOriginal" placeholder="Ex.: 9091" value="${fieldValue("codigoOriginal")}" />
            </label>
            <label class="field">
              <span>Tipo de unidade *</span>
              <input name="tipoUnidade" list="tipoUnidadeOptions" required placeholder="Hospital, Clínica, TEA..." value="${fieldValue("tipoUnidade")}" />
            </label>
            <label class="field">
              <span>Cidade *</span>
              <input name="cidade" required placeholder="Ex.: Fortaleza" value="${fieldValue("cidade")}" />
            </label>
            <label class="field">
              <span>UF *</span>
              <input name="uf" required maxlength="2" placeholder="CE" value="${fieldValue("uf")}" />
            </label>
            <label class="field">
              <span>Região *</span>
              <input name="regiao" list="regiaoOptions" required placeholder="Nordeste" value="${fieldValue("regiao")}" />
            </label>
            <label class="field">
              <span>Prazo (dias)</span>
              <input name="prazoDias" inputmode="numeric" placeholder="90" value="${fieldValue("prazoDias")}" />
            </label>
            <label class="field">
              <span>Classificação</span>
              <input name="classificacaoObra" list="classificacaoOptions" placeholder="Suficiência de rede" value="${fieldValue("classificacaoObra")}" />
            </label>
            <label class="field">
              <span>Tipologia</span>
              <input name="tipologiaObra" list="tipologiaOptions" placeholder="Nova unidade" value="${fieldValue("tipologiaObra")}" />
            </label>
            <label class="field full-span">
              <span>Meta de custo por m²</span>
              <select name="metaCustoM2TargetId">
                ${strategicCostTargetOptions(metaCustoM2TargetIdValue)}
              </select>
              <small>Use para reclassificar a obra quando a regra automática não representar corretamente a tipologia executiva.</small>
            </label>
            <label class="field">
              <span>Área equivalente (m²)</span>
              <input name="areaEquivalente" inputmode="decimal" placeholder="0,00" value="${fieldValue("areaEquivalente")}" />
            </label>
            <label class="field">
              <span>Área construída (m²)</span>
              <input name="areaConstruida" inputmode="decimal" placeholder="0,00" value="${fieldValue("areaConstruida")}" />
            </label>
            <label class="field">
              <span>Origem da verba *</span>
              <select name="tipoVerba" required>
                <option value="CAPEX" ${tipoVerbaValue === "CAPEX" ? "selected" : ""}>CAPEX</option>
                <option value="OPEX" ${tipoVerbaValue === "OPEX" ? "selected" : ""}>OPEX</option>
              </select>
            </label>
            <label class="field">
              <span>SAP / OI *</span>
              <input name="ordemInternaSAP" required placeholder="Número da Ordem Interna" value="${fieldValue("ordemInternaSAP")}" />
            </label>
            <label class="field">
              <span>Valor da verba aportada *</span>
              <input name="valorVerbaAportada" required inputmode="decimal" placeholder="0,00" value="${currencyFieldValue(verbaAportadaValue)}" />
            </label>
            <label class="field">
              <span>Valor estimado</span>
              <input name="valorEstimado" inputmode="decimal" placeholder="0,00" value="${currencyFieldValue(valorEstimadoValue)}" />
            </label>
            <label class="field">
              <span>CNPJ</span>
              <input name="cnpj" placeholder="00.000.000/0000-00" value="${fieldValue("cnpj")}" />
            </label>
            <label class="field full-span">
              <span>Endereço</span>
              <input name="endereco" placeholder="Rua, número, bairro" value="${fieldValue("endereco")}" />
            </label>
          </div>
          ${workFormDatalists()}
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
          <button class="primary-action" type="submit">${isEditing ? "Salvar alterações" : "Cadastrar obra"}</button>
        </footer>
      </form>
    </div>
  `;
}

function workFormDatalists() {
  const datalist = (id, values) => `
    <datalist id="${id}">
      ${values.map((value) => `<option value="${value}"></option>`).join("")}
    </datalist>
  `;
  return `
    ${datalist("tipoUnidadeOptions", uniqueWorkValues("tipoUnidade"))}
    ${datalist("regiaoOptions", uniqueWorkValues("regiao"))}
    ${datalist("classificacaoOptions", uniqueWorkValues("classificacaoObra"))}
    ${datalist("tipologiaOptions", uniqueWorkValues("tipologiaObra"))}
  `;
}

function openGlobalDemandModal() {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal-card demand-type-card" role="dialog" aria-labelledby="globalDemandTitle">
        <header>
          <div>
            <span class="eyebrow">Nova demanda</span>
            <h2 id="globalDemandTitle">Escolha o fluxo de orçamento</h2>
            <p class="muted">Selecione o módulo para abrir o cadastro correto da Sala Técnica.</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="demand-type-options">
            <button class="demand-type-option" type="button" data-action="open-global-demand-type" data-module-target="works">
              <span class="demand-type-icon" aria-hidden="true">OB</span>
              <span>
                <strong>Orçamento de Obras</strong>
                <small>EV, revisão orçamentária, SIC e fluxo operacional de obras</small>
              </span>
            </button>
            <button class="demand-type-option" type="button" data-action="open-global-demand-type" data-module-target="maintenance">
              <span class="demand-type-icon demand-type-icon--orange" aria-hidden="true">MN</span>
              <span>
                <strong>Orçamento de Manutenção</strong>
                <small>OS predial, unidade, valores, lead time e fases Pipefy</small>
              </span>
            </button>
            <button class="demand-type-option" type="button" data-action="open-global-demand-type" data-module-target="clinical">
              <span class="demand-type-icon demand-type-icon--green" aria-hidden="true">EC</span>
              <span>
                <strong>Orçamento de Engenharia Clínica</strong>
                <small>Unidade, equipamento, ativo assistencial e histórico de OS</small>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openGlobalDemandByModule(module) {
  if (module === "maintenance") {
    setView("maintenanceOperational");
    openMaintenanceDemandModal();
    return;
  }
  if (module === "clinical") {
    setView("clinicalOperational");
    openMaintenanceDemandModal();
    return;
  }
  setView("worksOperational");
  openDemandModal();
}

function openDemandModal(mode = "demand") {
  if (mode === "sic") {
    openSicDemandModal();
    return;
  }
  demandWizardDraft = {};
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal-card demand-type-card" role="dialog" aria-labelledby="demandTypeTitle">
        <header>
          <div>
            <span class="eyebrow">Nova demanda</span>
            <h2 id="demandTypeTitle">Nova Demanda</h2>
            <p class="muted">Qual o tipo desta demanda?</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="demand-type-options">
            <button class="demand-type-option" type="button" data-action="start-demand-wizard" data-type="EmissaoInicial">
              <span class="demand-type-icon" aria-hidden="true">▣</span>
              <span>
                <strong>Emissão Inicial</strong>
                <small>Primeira análise orçamentária de uma obra nova</small>
              </span>
            </button>
            <button class="demand-type-option" type="button" data-action="start-demand-wizard" data-type="ReemissaoCompleta">
              <span class="demand-type-icon demand-type-icon--blue" aria-hidden="true">↻</span>
              <span>
                <strong>Revisão de Orçamento</strong>
                <small>Atualiza o EV de uma obra que já possui estudo de viabilidade</small>
              </span>
            </button>
            <button class="demand-type-option" type="button" data-action="start-demand-wizard" data-type="SIC">
              <span class="demand-type-icon demand-type-icon--green" aria-hidden="true">?</span>
              <span>
                <strong>SIC</strong>
                <small>Solicitação de Informação da Contratada vinculada a uma obra e ao EV</small>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openDemandWizardModal(type = "EmissaoInicial", step = 1, draft = {}) {
  demandWizardDraft = demandWizardDefaultDraft(type, draft);
  modalRoot.innerHTML = step === 1 ? renderDemandWizardStep1(demandWizardDraft) : renderDemandWizardStep2(demandWizardDraft);
}

function demandWizardDefaultDraft(type, draft = {}) {
  const work = draft.obraId ? workById(draft.obraId) : null;
  const sprint = sprintById(draft.sprintId) || currentSprint();
  const analysts = uniqueAnalysts();
  const preferredAnalyst = analysts.includes("Thalles") ? "Thalles" : analysts[0] || "Skarth";
  const unitMode = draft.unidadeModo === "existente" ? "existente" : "nova";
  return {
    tipo: demandTypeKey(type) || "EmissaoInicial",
    obraId: work?.id || "",
    obraBusca: draft.obraBusca || work?.nome || "",
    unidadeModo: unitMode,
    unidadeId: draft.unidadeId || "",
    unidadeBusca: draft.unidadeBusca || "",
    unidadeNome: draft.unidadeNome || "",
    unidadeTipo: draft.unidadeTipo || "",
    unidadeCnpj: draft.unidadeCnpj || "",
    unidadeMunicipio: draft.unidadeMunicipio || "",
    unidadeCentro: draft.unidadeCentro || "",
    unidadeSource: draft.unidadeSource || "",
    sprintId: sprint?.id || "",
    analistaResponsavel: draft.analistaResponsavel || preferredAnalyst,
    descricao: draft.descricao || "",
    prioridade: draft.prioridade || "Média",
    dataPrevistaInicio: draft.dataPrevistaInicio || "",
    dataInicioReal: draft.dataInicioReal || "",
    dataPrevEnvioValidacaoObras: draft.dataPrevEnvioValidacaoObras || "",
    dataEnvioRealValidacaoObras: draft.dataEnvioRealValidacaoObras || "",
    dataValidacaoObras: draft.dataValidacaoObras || "",
    dataPrevistaEntrega: draft.dataPrevistaEntrega || "",
    dataEntregaReal: draft.dataEntregaReal || "",
    naoEnviarValidacaoObras: Boolean(draft.naoEnviarValidacaoObras),
    nota: draft.nota || "",
  };
}

function demandUnitContextFields(unit, mode = "existente", fallback = {}) {
  const isExisting = mode === "existente";
  return {
    unidadeModo: isExisting ? "existente" : "nova",
    unidadeId: isExisting ? unit?.id || fallback.unidadeId || "" : "",
    unidadeBusca: isExisting ? (unit ? sharedUnitSearchLabel(unit) : fallback.unidadeBusca || "") : "",
    unidadeNome: isExisting ? unit?.nome || fallback.unidadeNome || "" : fallback.unidadeNome || "",
    unidadeTipo: isExisting ? unit?.tipo || fallback.unidadeTipo || "" : fallback.unidadeTipo || "",
    unidadeCnpj: isExisting ? unit?.cnpj || fallback.unidadeCnpj || "" : fallback.unidadeCnpj || "",
    unidadeMunicipio: isExisting ? unit?.municipio || fallback.unidadeMunicipio || "" : fallback.unidadeMunicipio || "",
    unidadeCentro: isExisting ? unit?.centro || fallback.unidadeCentro || "" : fallback.unidadeCentro || "",
    unidadeSource: isExisting ? unit?.source || fallback.unidadeSource || "" : fallback.unidadeSource || "",
  };
}

function renderDemandUnitModeOptions(selected = "nova") {
  return `
    <option value="nova" ${selected !== "existente" ? "selected" : ""}>Unidade nova</option>
    <option value="existente" ${selected === "existente" ? "selected" : ""}>Obra em unidade existente</option>
  `;
}

function renderDemandWizardStep1(draft) {
  const sprint = sprintById(draft.sprintId) || currentSprint();
  const title = demandTypeLabel(draft.tipo);
  return `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal-card demand-modal-card demand-detail-form demand-create-card demand-wizard-card" id="demandWizardStep1" aria-labelledby="demandTitle" data-type="${draft.tipo}">
        <header>
          <div>
            <span class="eyebrow">Nova demanda</span>
            <h2 id="demandTitle">Nova Demanda — ${title}</h2>
            <p class="muted">Etapa 1 de 2 · Identificação</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="error-box" id="formError"></div>

          <section class="modal-section demand-analyst-section">
            <div class="section-title">
              <span>Analista responsável</span>
            </div>
            <div class="analyst-chip-grid">
              ${analystChipOptions({ analistaResponsavel: draft.analistaResponsavel })}
            </div>
            <p class="muted">Líder: ${draft.analistaResponsavel || "A definir"}</p>
          </section>

          <label class="field modal-section">
            <span>Descrição da demanda *</span>
            <textarea name="descricao" required placeholder="Descreva o escopo desta demanda...">${draft.descricao}</textarea>
          </label>

          <section class="modal-section sic-work-link-panel">
            <div class="section-title">
              <span>Contexto da unidade</span>
            </div>
            <div class="form-grid">
              <label class="field">
                <span>Tipo de intervenção</span>
                <select name="unidadeModo">
                  ${renderDemandUnitModeOptions(draft.unidadeModo)}
                </select>
              </label>
              <label class="field full-span">
                <span>Assistente de busca de unidades</span>
                <input name="unidadeBusca" data-demand-unit-search value="${escapeAttribute(draft.unidadeBusca)}" placeholder="Digite nome, CNPJ, centro, cidade, UF ou tipo..." autocomplete="off" />
              </label>
            </div>
            <input type="hidden" name="unidadeId" value="${escapeAttribute(draft.unidadeId)}" />
            <div data-demand-unit-results>
              ${maintenanceUnitSearchResults(draft.unidadeBusca, draft.unidadeId)}
            </div>
            <p class="muted">Use o assistente quando a obra for intervenção em uma unidade existente. Para unidade nova, siga apenas com a obra vinculada.</p>
          </section>

          <section class="modal-section">
            <div class="section-title">
              <span>Classificação</span>
            </div>
            <div class="form-grid">
              <label class="field">
                <span>Tipo de atividade</span>
                <select name="tipo">
                  ${demandTypeOptions(draft.tipo, false)}
                </select>
              </label>
              <label class="field">
                <span>Sprint</span>
                <select name="sprintId">
                  ${sprintOptions(sprint?.id || "")}
                </select>
                <small class="muted">${sprint ? `${dateText(sprint.dataInicio)} → ${dateText(sprint.dataFim)}` : "Sem período vinculado"}</small>
              </label>
            </div>
          </section>

          <section class="modal-section">
            <div class="section-title">
              <span>Obra vinculada *</span>
            </div>
            <label class="field">
              <span>Buscar obra</span>
              <input name="obraBusca" list="demandWorkOptions" value="${draft.obraBusca}" placeholder="Digite nome, chave ou cidade..." autocomplete="off" required />
            </label>
            ${demandWorkDatalist()}
          </section>
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
          <button class="primary-action" type="button" data-action="submit-demand-step">Avançar →</button>
        </footer>
      </form>
    </div>
  `;
}

function renderDemandWizardStep2(draft) {
  const work = workById(draft.obraId) || workById(selectedWorkId) || state.works[0];
  const title = demandTypeLabel(draft.tipo);
  return `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal-card demand-modal-card demand-detail-form demand-create-card demand-wizard-card" id="demandForm" aria-labelledby="demandTitle">
        <header>
          <div>
            <span class="eyebrow">Nova demanda</span>
            <h2 id="demandTitle">Nova Demanda — ${title}</h2>
            <p class="muted">Etapa 2 de 2 · Detalhamento</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="error-box" id="formError"></div>
          ${demandWizardHiddenFields(draft)}

          <section class="modal-section">
            <div class="section-title">
              <span>Detalhes</span>
            </div>
            <label class="field demand-priority-field">
              <span>Prioridade</span>
              <select name="prioridade">
                ${priorityOptions(draft.prioridade)}
              </select>
            </label>
          </section>

          <section class="modal-section">
            <div class="section-title">
              <span>Datas</span>
            </div>
            <div class="date-grid demand-date-grid">
              ${dateField("1 · Data prevista de início", "dataPrevistaInicio", draft.dataPrevistaInicio)}
              ${dateField("2 · Data de início real", "dataInicioReal", draft.dataInicioReal)}
              ${dateField("3 · Prev. envio p/ validação Obras", "dataPrevEnvioValidacaoObras", draft.dataPrevEnvioValidacaoObras)}
              ${dateField("4 · Envio real p/ validação Obras", "dataEnvioRealValidacaoObras", draft.dataEnvioRealValidacaoObras)}
              <label class="validation-skip full-span">
                <input name="naoEnviarValidacaoObras" type="checkbox" ${draft.naoEnviarValidacaoObras ? "checked" : ""} />
                <span>Esta demanda não foi/será enviada para validação da equipe de Obras</span>
              </label>
              ${dateField("5 · Data de validação de Obras", "dataValidacaoObras", draft.dataValidacaoObras)}
              ${dateField("6 · Data prevista da entrega", "dataPrevistaEntrega", draft.dataPrevistaEntrega)}
              ${dateField("7 · Data entrega real", "dataEntregaReal", draft.dataEntregaReal, true)}
            </div>
          </section>

          <section class="modal-section">
            <div class="section-title with-action">
              <span>Histórico de alterações</span>
              <button class="secondary-action compact-action" type="button" data-action="toggle-demand-history">Ver histórico</button>
            </div>
            <div class="demand-history-panel" hidden>
              <div class="empty-state">Histórico será criado após salvar a demanda.</div>
            </div>
          </section>

          <section class="modal-section">
            <div class="section-title">
              <span>Observação</span>
            </div>
            <textarea name="nota" placeholder="Registre observações relevantes sobre esta demanda...">${draft.nota}</textarea>
          </section>

          <section class="modal-section">
            <div class="section-title with-action">
              <span>Projetos envolvidos</span>
              <button class="secondary-action compact-action" type="button" data-action="feature-soon">Expandir grupo</button>
            </div>
            <div class="master-list">
              <span class="tag">ARQ: a cadastrar</span>
              <span class="tag">CLI: a cadastrar</span>
              <span class="tag">ELE: a cadastrar</span>
              <span class="tag">HID: a cadastrar</span>
            </div>
          </section>

          <section class="modal-section demand-ev-section">
            <div class="section-title">
              <span>Estudo de Viabilidade (EV)</span>
            </div>
            <p class="muted">Esta demanda alimenta diretamente o EV da obra vinculada. Para a emissão inicial, o EV nasce gerado para preencher os custos.</p>
            ${work ? `<button class="primary-action full-width" type="button" data-action="open-work-ev" data-id="${work.id}">Abrir EV da obra vinculada</button>` : ""}
          </section>
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="back-demand-step">Voltar</button>
          <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
          <button class="primary-action" type="button" data-action="submit-demand-form">Salvar demanda</button>
        </footer>
      </form>
    </div>
  `;
}

function demandWizardHiddenFields(draft) {
  return `
    <input type="hidden" name="obraId" value="${escapeAttribute(draft.obraId)}" />
    <input type="hidden" name="obraBusca" value="${escapeAttribute(draft.obraBusca)}" />
    <input type="hidden" name="unidadeModo" value="${escapeAttribute(draft.unidadeModo)}" />
    <input type="hidden" name="unidadeId" value="${escapeAttribute(draft.unidadeId)}" />
    <input type="hidden" name="unidadeBusca" value="${escapeAttribute(draft.unidadeBusca)}" />
    <input type="hidden" name="unidadeNome" value="${escapeAttribute(draft.unidadeNome)}" />
    <input type="hidden" name="unidadeTipo" value="${escapeAttribute(draft.unidadeTipo)}" />
    <input type="hidden" name="unidadeCnpj" value="${escapeAttribute(draft.unidadeCnpj)}" />
    <input type="hidden" name="unidadeMunicipio" value="${escapeAttribute(draft.unidadeMunicipio)}" />
    <input type="hidden" name="unidadeCentro" value="${escapeAttribute(draft.unidadeCentro)}" />
    <input type="hidden" name="unidadeSource" value="${escapeAttribute(draft.unidadeSource)}" />
    <input type="hidden" name="tipo" value="${escapeAttribute(draft.tipo)}" />
    <input type="hidden" name="sprintId" value="${escapeAttribute(draft.sprintId)}" />
    <input type="hidden" name="analistaResponsavel" value="${escapeAttribute(draft.analistaResponsavel)}" />
    <input type="hidden" name="descricao" value="${escapeAttribute(draft.descricao)}" />
    <input type="hidden" name="coluna" value="fazer" />
  `;
}

function demandWorkDatalist() {
  return `
    <datalist id="demandWorkOptions">
      ${state.works.map((work) => `<option value="${work.nome}">${work.chaveUnica || work.codigoOriginal || ""} · ${work.cidade}/${work.uf}</option>`).join("")}
    </datalist>
  `;
}

function resolveDemandWorkFromQuery(query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return null;
  return findWorkByExactTypedSearch(query) || findWorkByTypedSearch(query);
}

function handleDemandWizardStep1(form) {
  const formData = new FormData(form);
  const work = resolveDemandWorkFromQuery(formData.get("obraBusca"));
  if (!work) {
    showFormError("Selecione uma obra válida do portfólio antes de avançar.", form);
    return;
  }
  const unidadeModo = formData.get("unidadeModo") === "existente" ? "existente" : "nova";
  const unit = unidadeModo === "existente" ? maintenanceUnitById(formData.get("unidadeId")) || findMaintenanceUnitByTypedSearch(formData.get("unidadeBusca")) : null;
  if (unidadeModo === "existente" && !unit) {
    showFormError("Selecione uma unidade existente pelo assistente de busca antes de avançar.", form);
    return;
  }
  const sprint = sprintById(formData.get("sprintId")) || currentSprint();
  const unitContext = demandUnitContextFields(unit, unidadeModo);
  demandWizardDraft = demandWizardDefaultDraft(formData.get("tipo"), {
    obraId: work.id,
    obraBusca: work.nome,
    ...unitContext,
    sprintId: sprint?.id || "",
    analistaResponsavel: formData.get("analistaResponsavel"),
    descricao: formData.get("descricao"),
    dataPrevistaEntrega: sprint?.dataFim || "",
  });
  openDemandWizardModal(demandWizardDraft.tipo, 2, demandWizardDraft);
}

function workOptionLabel(work) {
  return `${work.nome} | ${work.chaveUnica} | ${work.cidade}/${work.uf}`;
}

function findWorkByTypedSearch(value) {
  const terms = normalizeSearchText(value).split(/\s+/).filter(Boolean);
  if (!terms.length) return null;
  return state.works.find((work) => {
    const text = normalizeSearchText([
      work.id,
      workOptionLabel(work),
      work.codigoOriginal,
      work.tipoUnidade,
      work.regiao,
      work.classificacaoObra,
      work.tipologiaObra,
    ].join(" "));
    return terms.every((term) => text.includes(term));
  }) || null;
}

function findWorkByExactTypedSearch(value) {
  const normalized = normalizeSearchText(value).trim();
  if (!normalized) return null;
  return (
    state.works.find((work) => normalizeSearchText(workOptionLabel(work)) === normalized) ||
    state.works.find((work) => normalizeSearchText(work.nome) === normalized) ||
    state.works.find((work) => normalizeSearchText(work.chaveUnica || work.codigoOriginal) === normalized)
  );
}

function resolveWorkIdFromDemandForm(formData) {
  const selectedId = formData.get("obraId");
  if (workById(selectedId)) return selectedId;
  const lookupValues = [formData.get("obraBusca")];
  if (formData.get("tipo") === "SIC") {
    lookupValues.push(formData.get("obraNumber"), formData.get("obraNome"), `${formData.get("obraNumber") || ""} ${formData.get("obraNome") || ""}`);
  }
  for (const value of lookupValues) {
    const exactWork = findWorkByExactTypedSearch(value);
    if (exactWork) return exactWork.id;
    const typedWork = findWorkByTypedSearch(value);
    if (typedWork) return typedWork.id;
  }
  return "";
}

function renderSicWorkSearchResults(query = "", selectedId = "") {
  const selectedWork = workById(selectedId);
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (selectedWork) {
    return `
      <div class="sic-work-selected">
        <strong>${selectedWork.nome}</strong>
        <span>${selectedWork.chaveUnica} | ${selectedWork.tipoUnidade} | ${selectedWork.cidade}/${selectedWork.uf} | ${selectedWork.regiao}</span>
      </div>
    `;
  }
  if (!terms.length) {
    return `<p class="muted">Digite parte do nome, chave, cidade, UF, tipo ou região para localizar a obra do portfólio.</p>`;
  }
  const suggestions = state.works
    .filter((work) => terms.every((term) => workSearchText(work).includes(term)))
    .slice(0, 8);
  if (!suggestions.length) {
    return `<div class="empty-state compact">Nenhuma obra encontrada. Você pode ajustar a busca ou cadastrar uma nova obra.</div>`;
  }
  return `
    <div class="sic-work-results" aria-label="Sugestões de obras">
      ${suggestions
        .map(
          (work) => `
            <button type="button" data-action="select-sic-work" data-id="${work.id}">
              <strong>${work.nome}</strong>
              <span>${work.chaveUnica} | ${work.tipoUnidade} | ${work.cidade}/${work.uf} | ${work.regiao}</span>
            </button>
          `
        )
        .join("")}
    </div>
    <p class="muted">Mostrando ${suggestions.length} sugestão${suggestions.length === 1 ? "" : "ões"} para "${escapeAttribute(query)}".</p>
  `;
}

function updateSicWorkSearch(input) {
  const form = input.closest("form");
  const hidden = form?.querySelector('[name="obraId"]');
  const results = form?.querySelector("[data-sic-work-results]");
  const workCode = form?.querySelector("[data-sic-work-code]");
  const workName = form?.querySelector("[data-sic-work-name]");
  if (hidden) hidden.value = "";
  if (workCode) workCode.value = "";
  if (workName) workName.value = "";
  if (results) results.innerHTML = renderSicWorkSearchResults(input.value);
}

function openSicDemandModal(workId = "") {
  const selectedWork = workId ? workById(workId) : null;
  const selectedLabel = selectedWork ? workOptionLabel(selectedWork) : "";
  const selectedWorkNumber = selectedWork ? selectedWork.chaveUnica || selectedWork.codigoOriginal || "" : "";
  const selectedWorkName = selectedWork ? selectedWork.nome || "" : "";
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal-card sic-demand-card" id="demandForm" aria-labelledby="demandTitle">
        <header>
          <div>
            <span class="eyebrow">Nova demanda</span>
            <h2 id="demandTitle">SIC - Solicitação de Informação da Contratada</h2>
            <p class="muted">Busque uma obra/projeto existente ou cadastre uma nova obra antes de salvar a demanda no Kanban e enviá-la para aprovação.</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" data-action="close-modal">×</button>
        </header>
        <div class="modal-body">
          <div class="error-box" id="formError"></div>
          <section class="modal-section sic-work-link-panel">
            <div class="section-title with-action">
              <span>Projeto / obra vinculada</span>
              <button class="secondary-action compact-action" type="button" data-action="open-work-from-sic">+ Cadastrar nova obra</button>
            </div>
            <input type="hidden" name="obraId" value="${selectedWork?.id || ""}" />
            <label class="field sic-work-search-field">
              <span>Assistente de busca de obras</span>
              <input name="obraBusca" data-sic-work-search value="${escapeAttribute(selectedLabel)}" placeholder="Buscar por nome, chave, cidade, UF, tipo ou região..." autocomplete="off" required />
            </label>
            <div data-sic-work-results>
              ${renderSicWorkSearchResults(selectedLabel, selectedWork?.id || "")}
            </div>
            <p class="muted">Ao salvar, o card entra em A iniciar e fica sincronizado com SICs > Aprovação. A postagem no EV só libera após aprovação.</p>
          </section>

          <section class="modal-section sic-fields-panel">
            <div class="section-title">
              <span>Dados da SIC</span>
            </div>
            <div class="form-grid">
              <label class="field">
                <span>Nº do LECOM</span>
                <input name="lecomNumber" placeholder="Ex.: LECOM-2026-0000" />
              </label>
              <label class="field">
                <span>Nº da obra</span>
                <input name="obraNumber" data-sic-work-code value="${escapeAttribute(selectedWorkNumber)}" placeholder="Chave, OI ou nº de referência da obra" />
              </label>
              <label class="field full-span">
                <span>Nome da obra</span>
                <input name="obraNome" data-sic-work-name value="${escapeAttribute(selectedWorkName)}" placeholder="Nome da obra vinculada à SIC" />
              </label>
              <label class="field">
                <span>Título da SIC *</span>
                <input name="tituloSic" placeholder="Ex.: Ajuste de escopo solicitado pela contratada" required />
              </label>
              <label class="field">
                <span>Nº da SIC</span>
                <input name="numeroSic" placeholder="Ex.: SIC-001 ou código da contratada" />
              </label>
              <label class="field full-span">
                <span>Descrição da SIC *</span>
                <textarea name="descricao" required placeholder="Descreva a solicitação, contexto, impacto esperado e encaminhamento necessário..."></textarea>
              </label>
            </div>
          </section>

          <div class="form-grid">
            <label class="field">
              <span>Tipo</span>
              <select name="tipo" id="demandType">
                <option value="SIC">SIC - Solicitação de Informação da Contratada</option>
              </select>
            </label>
            <label class="field">
              <span>Prioridade</span>
              <select name="prioridade">
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </label>
            <label class="field">
              <span>Analista da Sala Técnica</span>
              <input name="analistaSalaTecnica" list="sicAnalystOptions" value="${escapeAttribute(uniqueAnalysts()[0] || "Skarth")}" required />
              <datalist id="sicAnalystOptions">
                ${uniqueAnalysts().map((analyst) => `<option value="${escapeAttribute(analyst)}"></option>`).join("")}
              </datalist>
            </label>
            <label class="field">
              <span>Entrega prevista</span>
              <input name="dataPrevistaEntrega" type="date" value="${currentSprint()?.dataFim || TODAY_ISO}" required />
            </label>
            <label class="field">
              <span>Motivo</span>
              <select name="motivo">
                <option value="InformacaoContratada">Solicitação de Informação da Contratada</option>
                <option value="AlteracaoProjeto">Alteração de Projeto</option>
                <option value="SolicitacaoCampo">Solicitação de Campo</option>
              </select>
            </label>
          </div>

          <div class="field" style="margin-top:14px">
            <span>Disciplinas afetadas</span>
            <small class="muted">Opcional para criar a demanda. Obrigatório apenas antes de postar a SIC no EV.</small>
            <div id="disciplineRows">
              ${disciplineRowTemplate()}
            </div>
            <button class="ghost-button" type="button" data-action="add-discipline-row">Adicionar disciplina</button>
          </div>

          <section class="modal-section">
            <div class="section-title">
              <span>Arquivo em anexo</span>
            </div>
            <label class="file-drop">
              <span>Anexar arquivo da SIC</span>
              <input name="sicFiles" type="file" multiple />
              <small>PDF, imagem, planilha ou documento recebido da contratada.</small>
            </label>
          </section>
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
          <button class="primary-action" type="button" data-action="submit-demand-form">Salvar demanda</button>
        </footer>
      </form>
    </div>
  `;
}

function disciplineRowTemplate() {
  return `
    <div class="discipline-row">
      <label class="field">
        <span>Disciplina</span>
        <select name="disciplinaId">
          <option value="">Selecionar</option>
          ${disciplines
            .filter((discipline) => discipline.selecionavelParaSIC)
            .map((discipline) => `<option value="${discipline.id}">${discipline.posicao}. ${discipline.nome}</option>`)
            .join("")}
        </select>
      </label>
      <label class="field">
        <span>Valor delta</span>
        <input name="valorDelta" inputmode="decimal" placeholder="0,00" />
      </label>
      <button class="icon-button" type="button" aria-label="Remover disciplina" data-action="remove-discipline-row">×</button>
    </div>
  `;
}

function sicDraftDisciplineRowTemplate(item = {}) {
  return `
    <div class="discipline-row sic-draft-row">
      <label class="field">
        <span>Disciplina</span>
        <select name="sicDraftDisciplinaId">
          <option value="">Selecionar</option>
          ${disciplines
            .filter((discipline) => discipline.selecionavelParaSIC)
            .map((discipline) => `<option value="${discipline.id}" ${discipline.id === item.disciplinaId ? "selected" : ""}>${discipline.posicao}. ${discipline.nome}</option>`)
            .join("")}
        </select>
      </label>
      <label class="field">
        <span>Valor delta</span>
        <input name="sicDraftValorDelta" inputmode="decimal" value="${item.valorDelta ? currencyInputValue(item.valorDelta) : ""}" placeholder="0,00" />
      </label>
      <button class="icon-button" type="button" aria-label="Remover disciplina" data-action="remove-sic-draft-row">×</button>
    </div>
  `;
}

function renderSicDraftDisciplineEditor(demand) {
  if ((demand.sicIds || []).length) return "";
  const rows = (demand.sicDraftDisciplines || []).length ? demand.sicDraftDisciplines : [{ disciplinaId: "", valorDelta: 0 }];
  return `
    <div class="sic-draft-editor">
      <span>Disciplinas para postagem no EV</span>
      <div data-sic-draft-rows>
        ${rows.map((item) => sicDraftDisciplineRowTemplate(item)).join("")}
      </div>
      <button class="ghost-button" type="button" data-action="add-sic-draft-row">Adicionar disciplina</button>
    </div>
  `;
}

function readSicDraftDisciplinesFromForm(form) {
  if (!form) return [];
  return [...form.querySelectorAll(".sic-draft-row")]
    .map((row) => ({
      disciplinaId: row.querySelector('[name="sicDraftDisciplinaId"]')?.value || "",
      valorDelta: parseCurrency(row.querySelector('[name="sicDraftValorDelta"]')?.value || ""),
    }))
    .filter((item) => item.disciplinaId || item.valorDelta);
}

function openContractModal() {
  const work = workById(selectedWorkId) || state.works[0];
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal-card" id="contractForm" aria-labelledby="contractTitle">
        <header>
          <h2 id="contractTitle">Nova contratação</h2>
          <p class="muted">Contrato vinculado à obra, disciplina e fornecedor.</p>
        </header>
        <div class="modal-body">
          <div class="error-box" id="formError"></div>
          <div class="form-grid">
            <label class="field">
              <span>Obra</span>
              <select name="obraId" required data-action="contract-work-select">
                ${state.works.map((item) => `<option value="${item.id}" ${item.id === work.id ? "selected" : ""}>${item.nome}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>Disciplina</span>
              <select name="disciplinaId" required id="contractDisciplineSelect">
                ${contractDisciplineOptions(work.id)}
              </select>
            </label>
            <label class="field">
              <span>Fornecedor</span>
              <select name="fornecedorId" required>
                ${state.suppliers.map((supplier) => `<option value="${supplier.id}">${supplier.razaoSocial}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>Valor</span>
              <input name="valor" inputmode="decimal" required placeholder="0,00" />
            </label>
            <label class="field">
              <span>Número do contrato</span>
              <input name="numeroContrato" value="${nextContractNumber()}" required />
            </label>
            <label class="field">
              <span>Responsável Suprimentos</span>
              <input name="responsavelSuprimentos" value="Carla Nunes" required />
            </label>
          </div>
        </div>
        <footer class="modal-actions">
          <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
          <button class="primary-action" type="submit">Salvar contratação</button>
        </footer>
      </form>
    </div>
  `;
}

function contractDisciplineOptions(workId) {
  const work = workById(workId) || state.works[0];
  return work.ev.lines
    .filter((line) => disciplineById(line.disciplinaId).selecionavelParaSIC)
    .map((line) => `<option value="${line.disciplinaId}">${disciplineById(line.disciplinaId).nome}</option>`)
    .join("");
}

function parseCurrency(value) {
  const normalized = String(value || "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

let attachmentDbPromise = null;

function attachmentRecordId() {
  return `ATT-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

function openAttachmentDb() {
  if (!globalThis.indexedDB) return Promise.reject(new Error("IndexedDB indisponível neste navegador."));
  if (attachmentDbPromise) return attachmentDbPromise;
  attachmentDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(ATTACHMENT_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ATTACHMENT_STORE_NAME)) {
        db.createObjectStore(ATTACHMENT_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Falha ao abrir banco de anexos."));
  });
  return attachmentDbPromise;
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Falha na transação de anexos."));
    transaction.onabort = () => reject(transaction.error || new Error("Transação de anexos cancelada."));
  });
}

async function saveAttachmentRecord(record) {
  const db = await openAttachmentDb();
  const transaction = db.transaction(ATTACHMENT_STORE_NAME, "readwrite");
  transaction.objectStore(ATTACHMENT_STORE_NAME).put(record);
  await transactionDone(transaction);
}

async function readAttachmentRecord(id) {
  if (!id) return null;
  const db = await openAttachmentDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(ATTACHMENT_STORE_NAME, "readonly").objectStore(ATTACHMENT_STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("Falha ao buscar anexo."));
  });
}

async function storeAttachmentFile(file, context = {}) {
  const id = attachmentRecordId();
  const metadata = {
    id,
    nome: file.name,
    tamanho: file.size,
    tipo: file.type || "arquivo",
    data: todayISO(),
    storage: "indexedDB",
    ...context,
  };
  await saveAttachmentRecord({ ...metadata, blob: file });
  return metadata;
}

async function fileAttachmentMetadata(input, context = {}) {
  const files = [...(input?.files || [])];
  if (!files.length) return [];
  return Promise.all(files.map((file) => storeAttachmentFile(file, context)));
}

function uniqueAttachments(files = []) {
  return [...new Map(files.filter(Boolean).map((file) => [file.id || `${file.nome}|${file.tamanho}`, file])).values()];
}

function renderAttachmentChip(file) {
  const name = file?.nome || file?.name || "Arquivo";
  const size = formatFileSize(file?.tamanho || file?.size);
  if (file?.id) {
    return `
      <button class="attachment-chip" type="button" data-action="download-attachment" data-attachment-id="${escapeAttribute(file.id)}" title="Baixar ${escapeAttribute(name)}">
        <span>${escapeAttribute(name)}</span>
        <small>${size}</small>
      </button>
    `;
  }
  return `
    <span class="attachment-chip is-unavailable" title="Anexo antigo sem arquivo salvo localmente. Reanexe o arquivo para habilitar o acesso.">
      <span>${escapeAttribute(name)}</span>
      <small>${size} · indisponível</small>
    </span>
  `;
}

function renderAttachmentList(files = [], emptyText = "Nenhum arquivo anexado.") {
  const attachments = uniqueAttachments(files);
  if (!attachments.length) return `<p class="muted">${emptyText}</p>`;
  return `<div class="attachment-list">${attachments.map(renderAttachmentChip).join("")}</div>`;
}

async function downloadStoredAttachment(id) {
  if (!id) {
    showToast("Este anexo antigo não tem arquivo salvo. Reanexe para habilitar o acesso.");
    return;
  }
  try {
    const record = await readAttachmentRecord(id);
    const blob = record?.blob;
    if (!record || !blob) {
      showToast("Arquivo não encontrado no armazenamento local. Reanexe o arquivo neste card.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = record.nome || "arquivo";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.warn("Falha ao acessar anexo.", error);
    showToast("Não consegui acessar o anexo salvo neste navegador.");
  }
}

function formatFileSize(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "0 KB";
  if (value < 1024 * 1024) return `${number(value / 1024, 1)} KB`;
  return `${number(value / (1024 * 1024), 1)} MB`;
}

function showFormError(message, form = null) {
  const box = form?.querySelector("[data-form-error], #formError") || document.querySelector("#formError");
  if (!box) {
    showToast(message);
    return;
  }
  haptecSystemNotice(message, "error_alert", true);
  box.textContent = message;
  box.classList.add("is-visible");
  toast.textContent = message;
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 2600);
  const modalBody = box.closest?.(".modal-body");
  modalBody?.scrollTo?.({ top: Math.max((box.offsetTop || 0) - 20, 0), behavior: "smooth" });
  box.scrollIntoView?.({ block: "center", behavior: "smooth" });
}

function fieldLabelForValidation(field) {
  const labelText = field.closest?.("label")?.querySelector("span")?.textContent || field.getAttribute?.("aria-label") || field.name || "campo obrigatório";
  return cleanImportedText(labelText).replace(/\s*\*\s*$/, "").trim() || "campo obrigatório";
}

function nativeValidationMessage(field) {
  const label = fieldLabelForValidation(field);
  if (field.validity?.valueMissing) return `Opa, não esquecer de preencher ${label}. Esse campo é obrigatório antes de salvar.`;
  if (field.validity?.typeMismatch) return `Revise o formato de ${label}. Parece que algum dado tentou sair pela tangente aqui.`;
  if (field.validity?.patternMismatch) return `Revise ${label}. O formato informado não está no padrão esperado.`;
  if (field.validity?.rangeUnderflow || field.validity?.rangeOverflow) return `Revise ${label}. O valor ficou fora do limite esperado.`;
  return `Revise ${label} antes de salvar.`;
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  const haptecFace = haptecFaceForSystemMessage(message);
  if (haptecFace) haptecSystemNotice(message, haptecFace, haptecFace === "error_alert");
  setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function updateEVAreaPreview(form) {
  const areaEquivalente = parseCurrency(form?.querySelector('[name="evAreaEquivalente"]')?.value);
  const editableRows = [...(form?.querySelectorAll(".ev-line-row") || [])];
  const totalNoRisk =
    editableRows.length
      ? editableRows.reduce((sum, row) => {
          const status = normalizeEVLineStatus(row.querySelector(".ev-status-select")?.value);
          if (status === "Não se aplica" || isRiskLine({ disciplinaId: row.dataset.disciplineId })) return sum;
          return sum + parseCurrency(row.querySelector(".ev-value-input")?.value);
        }, 0)
      : Number(form?.dataset.evTotalNoRisk || 0);
  const preview = form?.querySelector("[data-ev-area-preview]");
  if (preview) preview.textContent = areaEquivalente ? `${money(totalNoRisk / areaEquivalente)}/m²` : "—";
  updateEVHistoricalDeviationAlerts(form);
}

function evHistoricalDeviationReadings(work, valuesByDiscipline, baseTotal) {
  if (!baseTotal) return [];
  const typology = evHistoricalTypologyForWork(work);
  const source = evHistoricalSourceRecords();
  const sameTypology = typology ? source.filter((record) => record.typology === typology) : [];
  const benchmarkRecords = sameTypology.length >= 20 ? sameTypology : source;
  return Object.entries(valuesByDiscipline)
    .filter(([id, value]) => value > 0 && !["taxa-risco", "sics", "outras-linhas-ev"].includes(id))
    .map(([id, value]) => {
      const benchmark = evHistoricalBenchmark(benchmarkRecords, id);
      const share = (value / baseTotal) * 100;
      const zScore = benchmark.stdDev > 0 ? (share - benchmark.mean) / benchmark.stdDev : 0;
      return { id, value, share, zScore, benchmark, typology: sameTypology.length >= 20 ? typology : "Base geral" };
    })
    .filter((reading) => reading.benchmark.count >= 8 && Math.abs(reading.zScore) >= 2)
    .sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
}

function evHistoricalDeviationMarkup(work, valuesByDiscipline, baseTotal) {
  const readings = evHistoricalDeviationReadings(work, valuesByDiscipline, baseTotal);
  if (!baseTotal) return `<div class="ev-deviation-empty"><span>σ</span><div><strong>Inteligência histórica aguardando valores</strong><small>Preencha as disciplinas para comparar o EV com a base de 2020 a 2026.</small></div></div>`;
  if (!readings.length) return `<div class="ev-deviation-ok"><span>✓</span><div><strong>Composição dentro do comportamento histórico</strong><small>Nenhuma disciplina preenchida ultrapassa 2 desvios-padrão da base comparável.</small></div></div>`;
  return `<div class="ev-deviation-header"><div><span class="eyebrow">Alerta estatístico</span><h3>${readings.length} desvio${readings.length === 1 ? "" : "s"} acima de 2σ</h3><p>Revise os percentuais antes de concluir o EV. O alerta orienta a análise e não bloqueia o salvamento.</p></div><span class="status-pill" data-status="Pendente">Revisão recomendada</span></div><div class="ev-deviation-list">${readings.map((reading) => {
    const lower = Math.max(0, reading.benchmark.mean - 2 * reading.benchmark.stdDev);
    const upper = reading.benchmark.mean + 2 * reading.benchmark.stdDev;
    const direction = reading.zScore > 0 ? "acima" : "abaixo";
    return `<article class="${Math.abs(reading.zScore) >= 3 ? "is-critical" : ""}"><span class="ev-deviation-sigma">${number(Math.abs(reading.zScore), 1)}σ</span><div><strong>${escapeAttribute(disciplineById(reading.id).nome)}</strong><small>${number(reading.share, 1)}% do EV · ${direction} do intervalo esperado de ${number(lower, 1)}% a ${number(upper, 1)}%</small><em>${reading.benchmark.count} EVs de referência · ${escapeAttribute(reading.typology)} · média ${number(reading.benchmark.mean, 1)}%</em></div></article>`;
  }).join("")}</div>`;
}

function evFormDeviationData(form) {
  const values = {};
  let baseTotal = 0;
  form?.querySelectorAll(".ev-line-row").forEach((row) => {
    const id = row.dataset.disciplineId;
    const status = normalizeEVLineStatus(row.querySelector(".ev-status-select")?.value);
    const value = status === "Não se aplica" ? 0 : parseCurrency(row.querySelector(".ev-value-input")?.value);
    values[id] = value;
    if (!isRiskLine({ disciplinaId: id })) baseTotal += value;
  });
  return { values, baseTotal };
}

function updateEVHistoricalDeviationAlerts(form) {
  const panel = form?.querySelector("[data-ev-deviation-panel]");
  if (!panel) return;
  const work = workById(form.dataset.workId);
  const { values, baseTotal } = evFormDeviationData(form);
  panel.innerHTML = evHistoricalDeviationMarkup(work, values, baseTotal);
}

function showEVHaptecConfirmation(form, mode, readings) {
  document.querySelector("[data-ev-haptec-confirm]")?.remove();
  const critical = readings.filter((reading) => Math.abs(reading.zScore) >= 3).length;
  const overlay = document.createElement("div");
  overlay.className = "ev-haptec-confirm-backdrop";
  overlay.dataset.evHaptecConfirm = "true";
  overlay.innerHTML = `
    <article class="ev-haptec-confirm-card" role="dialog" aria-modal="true" aria-labelledby="evHaptecConfirmTitle">
      <header>
        <div class="ev-haptec-avatar"><span>!</span></div>
        <div><span class="eyebrow">Haptec360 · validação histórica</span><h2 id="evHaptecConfirmTitle">Averigue os valores antes de confirmar</h2><p>Este EV possui ${readings.length} disciplina${readings.length === 1 ? "" : "s"} fora da faixa histórica${critical ? `, sendo ${critical} crítica${critical === 1 ? "" : "s"}` : ""}.</p></div>
      </header>
      <div class="ev-haptec-confirm-list">
        ${readings.slice(0, 6).map((reading) => {
          const lower = Math.max(0, reading.benchmark.mean - 2 * reading.benchmark.stdDev);
          const upper = reading.benchmark.mean + 2 * reading.benchmark.stdDev;
          return `<article class="${Math.abs(reading.zScore) >= 3 ? "is-critical" : ""}"><b>${number(Math.abs(reading.zScore), 1)}σ</b><div><strong>${escapeAttribute(disciplineById(reading.id).nome)}</strong><small>Informado: ${number(reading.share, 1)}% · faixa histórica: ${number(lower, 1)}% a ${number(upper, 1)}%</small></div></article>`;
        }).join("")}
      </div>
      ${readings.length > 6 ? `<p class="muted">E mais ${readings.length - 6} disciplina${readings.length - 6 === 1 ? "" : "s"} com desvio.</p>` : ""}
      <label class="ev-haptec-confirm-check"><input type="checkbox" data-ev-haptec-check /> <span>Eu averiguei as informações e confirmo que os valores estão corretos.</span></label>
      <p class="ev-haptec-confirm-hint" data-ev-haptec-hint>Marque a confirmação para liberar o salvamento final.</p>
      <footer><button class="secondary-action" type="button" data-action="cancel-ev-deviation-save">Voltar e revisar</button><button class="primary-action" type="button" data-action="confirm-ev-deviation-save" data-mode="${escapeAttribute(mode)}" disabled>Confirmar e salvar EV</button></footer>
    </article>`;
  modalRoot.appendChild(overlay);
  haptecSystemNotice(`Encontrei ${readings.length} divergência${readings.length === 1 ? "" : "s"} relevante${readings.length === 1 ? "" : "s"} neste EV. Averigue os valores e confirme antes de salvar.`, "error_alert", true);
}

async function handleEVSubmit(form, mode = "final") {
  const work = workById(form.dataset.workId);
  if (!work) return;
  if (mode === "final" && form.dataset.evDeviationConfirmed !== "true") {
    const { values, baseTotal } = evFormDeviationData(form);
    const readings = evHistoricalDeviationReadings(work, values, baseTotal);
    if (readings.length) {
      showEVHaptecConfirmation(form, mode, readings);
      return;
    }
  }
  delete form.dataset.evDeviationConfirmed;
  const previousTotal = workTotals(work).orcado;
  const previousAreaConstruida = Number(work.areaConstruida || 0);
  const previousAreaEquivalente = Number(work.areaEquivalente || 0);
  const nextAreaConstruida = parseCurrency(form.querySelector('[name="evAreaConstruida"]')?.value);
  const nextAreaEquivalente = parseCurrency(form.querySelector('[name="evAreaEquivalente"]')?.value);
  const missingAreaFields = [
    !nextAreaConstruida ? "área construída" : "",
    !nextAreaEquivalente ? "área equivalente" : "",
  ].filter(Boolean);
  if (missingAreaFields.length) {
    haptecSystemNotice(
      `EV salvo pode seguir, mas falta preencher ${missingAreaFields.join(" e ")} para calcular o custo por m² com precisão.`,
      "error_alert",
      true
    );
  }
  work.areaConstruida = nextAreaConstruida;
  work.areaEquivalente = nextAreaEquivalente;
  work.area = nextAreaEquivalente || nextAreaConstruida || 0;
  work.ev.lines = work.ev.lines || [];

  form.querySelectorAll(".ev-line-row").forEach((row) => {
    const disciplineId = row.dataset.disciplineId;
    const status = normalizeEVLineStatus(row.querySelector(".ev-status-select")?.value);
    const input = row.querySelector(".ev-value-input");
    const value = status === "Não se aplica" ? 0 : parseCurrency(input?.value);
    let line = work.ev.lines.find((item) => canonicalDisciplineId(item.disciplinaId) === disciplineId);
    if (!line) {
      line = { disciplinaId: disciplineId, valorOrcado: 0, status };
      work.ev.lines.push(line);
    }
    line.disciplinaId = disciplineId;
    line.valorOrcado = value;
    line.status = status;
  });

  work.ev.lines.sort((a, b) => disciplineById(a.disciplinaId).posicao - disciplineById(b.disciplinaId).posicao);

  const fileInput = form.querySelector('[name="evFiles"]');
  let files = [];
  try {
    files = await fileAttachmentMetadata(fileInput, { entidade: "ev", entidadeId: work.ev.id || work.id, workId: work.id });
  } catch (error) {
    console.warn("Falha ao gravar anexos do EV.", error);
    showFormError("Não consegui salvar os anexos do EV no navegador. Tente anexar novamente ou reduza o tamanho dos arquivos.", form);
    return;
  }
  if (files.length) {
    work.ev.anexos = uniqueAttachments([...(work.ev.anexos || []), ...files]);
  }

  const totals = workTotals(work);
  const totalValue = totals.orcado + totals.aditivado;
  work.ev.status = mode === "draft" ? "Rascunho" : deriveEVStatus(work);

  if (mode === "final") {
    work.ev.versaoAtual = Number(work.ev.versaoAtual || 0) + 1;
    work.ev.versions = work.ev.versions || [];
    work.ev.versions.push({
      numero: work.ev.versaoAtual,
      data: todayISO(),
      origem: "Edição manual SLT 360",
      valorTotal: totalValue,
      custoM2: totalValue / Math.max(work.areaEquivalente || 0, 1),
      diffPorDisciplina: [],
    });
  }

  addHistory({
    entidade: "ev",
    entidadeId: work.ev.id || work.id,
    campo: mode === "draft" ? "rascunho" : "salvamento",
    valorAnterior: money(previousTotal),
    valorNovo: money(totalValue),
  });

  if (previousAreaConstruida !== work.areaConstruida) {
    addHistory({
      entidade: "obra",
      entidadeId: work.id,
      campo: "área construída",
      valorAnterior: `${number(previousAreaConstruida, 2)} m²`,
      valorNovo: `${number(work.areaConstruida, 2)} m²`,
    });
  }

  if (previousAreaEquivalente !== work.areaEquivalente) {
    addHistory({
      entidade: "obra",
      entidadeId: work.id,
      campo: "área equivalente",
      valorAnterior: `${number(previousAreaEquivalente, 2)} m²`,
      valorNovo: `${number(work.areaEquivalente, 2)} m²`,
    });
  }

  saveState();
  showToast(mode === "draft" ? "Rascunho do EV salvo." : "EV salvo com nova versão.");

  if (form.closest(".ev-modal-card")) openEVModal(work.id);
  else render();
}

function deriveEVStatus(work) {
  const applicable = (work.ev.lines || []).filter((line) => normalizeEVLineStatus(line.status) !== "Não se aplica");
  if (!applicable.some((line) => Number(line.valorOrcado || 0) > 0)) return "Rascunho";
  if (applicable.some((line) => normalizeEVLineStatus(line.status) === "Estimado")) return "Rascunho";
  if (applicable.some((line) => normalizeEVLineStatus(line.status) === "Cotado")) return "Em cotação";
  return "Completo";
}

function handleSprintSubmit(form) {
  const formData = new FormData(form);
  const nome = String(formData.get("nome") || "").trim();
  const dataInicio = formData.get("dataInicio");
  const dataFim = formData.get("dataFim");
  if (!nome) {
    showFormError("Informe o nome da sprint global.", form);
    form.querySelector('[name="nome"]')?.focus();
    return;
  }
  if (!dataInicio || !dataFim || dataFim < dataInicio) {
    showFormError("Informe um período válido para a sprint.", form);
    return;
  }
  const duplicated = (state.sprints || []).some((sprint) => normalizeSearchText(sprint.nome) === normalizeSearchText(nome));
  if (duplicated) {
    showFormError("Já existe uma sprint com esse nome. Ajuste o nome antes de salvar.", form);
    form.querySelector('[name="nome"]')?.focus();
    return;
  }
  const status = formData.get("status");
  if (status === "Ativa") {
    state.sprints = (state.sprints || []).map((sprint) => ({
      ...sprint,
      status: sprint.status === "Ativa" ? "Encerrada" : sprint.status,
    }));
  }
  const sprint = {
    id: nextCode("sprint", state.sprints || []),
    nome,
    dataInicio,
    dataFim,
    status,
  };
  state.sprints = [...(state.sprints || []), sprint];
  addHistory({
    entidade: "sprint",
    entidadeId: sprint.id,
    campo: "criação",
    valorAnterior: "Não existia",
    valorNovo: `${sprint.nome} | ${dateText(dataInicio)} a ${dateText(dataFim)}`,
  });
  saveState();
  if (form.closest(".modal-card")) closeModal();
  showToast("Sprint global cadastrada para todos os módulos.");
  render();
}

function handleUserSubmit(form) {
  const formData = new FormData(form);
  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const senha = String(formData.get("senha") || "").trim();
  const perfil = String(formData.get("perfil") || "Analista");
  const accessModules = formData.getAll("accessModules").map(String);
  const mustChangePassword = formData.get("mustChangePassword") === "on";
  if (!nome || !email || !senha) {
    showFormError("Informe nome, e-mail e senha para criar o usuário.", form);
    return;
  }
  if (!accessModules.length) {
    showFormError("Selecione pelo menos um módulo de acesso para o usuário.", form);
    return;
  }
  if (userByEmail(email)) {
    showFormError("Já existe um usuário ativo com este e-mail cadastrado.", form);
    return;
  }
  if (senha.length < 6) {
    showFormError("A senha provisória precisa ter pelo menos 6 caracteres.", form);
    return;
  }
  const user = {
    id: nextCode("usr", state.users || []),
    nome,
    email,
    senha,
    perfil: normalizeUserProfile(perfil),
    accessModules: normalizeAccessModules(accessModules, perfil),
    accessViews: accessViewsForModules(accessModules),
    mustChangePassword,
    senhaProvisoria: mustChangePassword,
    status: "Ativo",
    createdAt: new Date().toISOString(),
  };
  state.users = [...(state.users || []), user];
  addHistory({
    entidade: "usuario",
    entidadeId: user.id,
    campo: "criação",
    valorAnterior: "Não existia",
    valorNovo: `${user.nome} | ${user.perfil}`,
  });
  saveState();
  showToast(mustChangePassword ? "Usuário criado com senha provisória e troca obrigatória." : "Usuário criado com perfil de acesso.");
  render();
}

function handleFirstAccessPasswordSubmit(form) {
  const user = currentUser();
  if (!user) return;
  const formData = new FormData(form);
  const senhaAtual = String(formData.get("senhaAtual") || "").trim();
  const novaSenha = String(formData.get("novaSenha") || "").trim();
  const confirmarSenha = String(formData.get("confirmarSenha") || "").trim();
  if (!validateUserPassword(user, senhaAtual)) {
    showFormError("A senha provisória atual não confere.", form);
    return;
  }
  if (novaSenha.length < 8) {
    showFormError("A nova senha precisa ter pelo menos 8 caracteres.", form);
    return;
  }
  if (novaSenha === senhaAtual) {
    showFormError("A nova senha não pode ser igual à senha provisória.", form);
    return;
  }
  if (novaSenha !== confirmarSenha) {
    showFormError("A confirmação não confere com a nova senha.", form);
    return;
  }
  state.users = (state.users || []).map((item) =>
    item.id === user.id
      ? {
          ...item,
          senha: novaSenha,
          mustChangePassword: false,
          senhaProvisoria: false,
          passwordUpdatedAt: new Date().toISOString(),
        }
      : item
  );
  addHistory({
    entidade: "usuario",
    entidadeId: user.id,
    campo: "senha",
    valorAnterior: "Senha provisória",
    valorNovo: "Senha definitiva cadastrada no primeiro acesso",
  });
  saveState();
  showToast("Senha atualizada. Acesso liberado.");
  render();
}

function handleWorkSubmit(form) {
  const formData = new FormData(form);
  const nome = String(formData.get("nome") || "").trim();
  const unidadeModo = formData.get("unidadeModo") === "existente" ? "existente" : "nova";
  const selectedUnit = unidadeModo === "existente" ? maintenanceUnitById(formData.get("unidadeId")) || findMaintenanceUnitByTypedSearch(formData.get("unidadeBusca")) : null;

  if (unidadeModo === "existente" && !selectedUnit) {
    showFormError("Selecione uma unidade existente pelo assistente de busca antes de cadastrar a obra.", form);
    return;
  }

  const unitLocation = selectedUnit ? unitLocationFields(selectedUnit) : { cidade: "", uf: "", regiao: "" };
  const tipoUnidade = String(formData.get("tipoUnidade") || selectedUnit?.tipo || "").trim();
  const cidade = String(formData.get("cidade") || unitLocation.cidade || "").trim();
  const uf = String(formData.get("uf") || unitLocation.uf || "").trim().toUpperCase();
  const regiao = String(formData.get("regiao") || unitLocation.regiao || regionFromUf(uf) || "").trim();

  if (!nome || !tipoUnidade || !cidade || !uf || !regiao) {
    showFormError("Preencha nome, tipo de unidade, cidade, UF e região para cadastrar a obra.", form);
    return;
  }

  const existingWork = workById(formData.get("workId"));
  const areaEquivalente = parseCurrency(formData.get("areaEquivalente"));
  const areaConstruida = parseCurrency(formData.get("areaConstruida"));
  const prazoDias = Number(String(formData.get("prazoDias") || "").replace(/[^\d]/g, ""));
  const tipoVerba = String(formData.get("tipoVerba") || "").trim().toUpperCase();
  const ordemInternaSAP = String(formData.get("ordemInternaSAP") || "").trim();
  const valorVerbaAportada = parseCurrency(formData.get("valorVerbaAportada"));
  const valorEstimado = parseCurrency(formData.get("valorEstimado"));
  const unitContext = demandUnitContextFields(selectedUnit, unidadeModo, {
    unidadeBusca: String(formData.get("unidadeBusca") || "").trim(),
    unidadeNome: selectedUnit?.nome || nome,
    unidadeTipo: selectedUnit?.tipo || tipoUnidade,
    unidadeCnpj: selectedUnit?.cnpj || String(formData.get("cnpj") || "").trim(),
    unidadeMunicipio: selectedUnit?.municipio || [cidade, uf].filter(Boolean).join("/"),
    unidadeCentro: selectedUnit?.centro || "",
    unidadeSource: selectedUnit?.source || "Orçamento 360",
  });

  if (!["CAPEX", "OPEX"].includes(tipoVerba) || !ordemInternaSAP || valorVerbaAportada <= 0) {
    showFormError("Informe a origem da verba (CAPEX/OPEX), o número da OI e o valor da verba aportada.", form);
    return;
  }

  const workFields = {
    chaveUnica: String(formData.get("chaveUnica") || "").trim(),
    codigoOriginal: String(formData.get("codigoOriginal") || "").trim() || "0000",
    nome,
    tipoUnidade,
    cidade,
    uf,
    regiao,
    classificacaoObra: String(formData.get("classificacaoObra") || "").trim() || "Não informada",
    tipologiaObra: String(formData.get("tipologiaObra") || "").trim() || "Não informada",
    metaCustoM2TargetId: String(formData.get("metaCustoM2TargetId") || "").trim(),
    areaConstruida,
    areaEquivalente,
    ordemInternaSAP,
    tipoVerba,
    origemVerba: tipoVerba,
    valorVerbaAportada,
    valorEstimado,
    plannedValue: valorVerbaAportada,
    valorAprovado: valorVerbaAportada,
    capexAprovado: tipoVerba === "CAPEX" ? valorVerbaAportada : 0,
    opexAprovado: tipoVerba === "OPEX" ? valorVerbaAportada : 0,
    cnpj: String(formData.get("cnpj") || selectedUnit?.cnpj || "").trim(),
    endereco: String(formData.get("endereco") || selectedUnit?.endereco || selectedUnit?.cep || "").trim(),
    prazoDias: Number.isFinite(prazoDias) && prazoDias > 0 ? prazoDias : "",
    ...unitContext,
  };

  if (existingWork) {
    const previous = `${existingWork.nome} | ${existingWork.chaveUnica}`;
    Object.assign(existingWork, {
      ...workFields,
      chaveUnica: workFields.chaveUnica || existingWork.chaveUnica || generateWorkKey(state.works.indexOf(existingWork) + 1, uf, tipoUnidade, workFields.tipologiaObra),
    });
    syncWorkBudgetIntegration(existingWork);
    selectedWorkId = existingWork.id;
    addHistory({
      entidade: "obra",
      entidadeId: existingWork.id,
      campo: "edição",
      valorAnterior: previous,
      valorNovo: `${existingWork.nome} | ${existingWork.chaveUnica}`,
    });
    saveState();
    closeModal();
    workModalPlanDraft = null;
    showToast("Dados da obra e verba atualizados no portfólio e no Controle de Verbas.");
    render();
    return;
  }

  const id = nextCode("OBR", state.works);
  const generatedKey = generateWorkKey(state.works.length + 1, uf, tipoUnidade, formData.get("tipologiaObra"));
  const work = {
    id,
    ...workFields,
    chaveUnica: workFields.chaveUnica || generatedKey,
    status: "Planejada",
    ev: {
      id: `ev-${id.toLowerCase()}`,
      versaoAtual: 0,
      status: "Rascunho",
      lines: [],
      versions: [],
      anexos: [],
    },
  };

  state.works.unshift(work);
  syncWorkBudgetIntegration(work);
  selectedWorkId = work.id;
  workModalPlanDraft = null;
  portfolioQuickFilters = { query: "", tipoUnidade: "", regional: "", evStatus: "" };
  portfolioFilters = Object.fromEntries(Object.keys(portfolioFilters).map((key) => [key, ""]));
  addHistory({
    entidade: "obra",
    entidadeId: work.id,
    campo: "criação",
    valorAnterior: "Não existia",
    valorNovo: `${work.nome} | ${work.chaveUnica}`,
  });
  saveState();
  if (workModalReturnMode === "sic") {
    workModalReturnMode = "";
    showToast("Obra cadastrada com verba integrada. Continue o registro da SIC vinculada ao EV.");
    openSicDemandModal(work.id);
    return;
  }
  closeModal();
  showToast("Obra cadastrada no portfólio com EV rascunho e verba integrada ao Controle de Verbas.");
  render();
}

function generateWorkKey(index, uf, tipoUnidade, tipologia) {
  const cleanUf = String(uf || "XX").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2) || "XX";
  const typeText = normalizeSearchText(cleanImportedText(tipoUnidade));
  const typeCode = typeText.includes("hospital")
    ? "HOSP"
    : typeText.includes("clin")
      ? "CLI"
      : typeText.includes("tea")
        ? "TEA"
        : typeText.includes("pronto") || typeText === "pa"
          ? "PA"
          : "UND";
  const typologyCode = normalizeSearchText(tipologia).includes("retrofit") ? "RFT" : "NVU";
  return `${String(index).padStart(5, "0")}_SLT_${typeCode}_${typologyCode}_${cleanUf}`;
}

async function handleDemandSubmit(form) {
  const formData = new FormData(form);
  const tipo = formData.get("tipo");
  const obraId = resolveWorkIdFromDemandForm(formData);
  const demandId = nextCode("DEM", state.demands);
  const sicIds = [];
  let sicMetadata = null;
  let sicDraftDisciplines = [];

  if (!obraId) {
    showFormError("Use o assistente de busca para selecionar uma obra do portfólio ou cadastre uma nova obra antes de salvar a demanda.", form);
    return;
  }

  const linkedWork = workById(obraId);
  const unidadeModo = formData.get("unidadeModo") === "existente" ? "existente" : "nova";
  const selectedUnit = unidadeModo === "existente" ? maintenanceUnitById(formData.get("unidadeId")) || findMaintenanceUnitByTypedSearch(formData.get("unidadeBusca")) : null;
  if (unidadeModo === "existente" && !selectedUnit) {
    showFormError("Selecione uma unidade existente pelo assistente de busca antes de salvar a demanda.", form);
    return;
  }
  const unitContext = demandUnitContextFields(selectedUnit, unidadeModo, {
    unidadeId: formData.get("unidadeId") || "",
    unidadeBusca: formData.get("unidadeBusca") || "",
    unidadeNome: formData.get("unidadeNome") || (unidadeModo === "nova" ? linkedWork?.nome || "" : ""),
    unidadeTipo: formData.get("unidadeTipo") || (unidadeModo === "nova" ? linkedWork?.tipoUnidade || "" : ""),
    unidadeCnpj: formData.get("unidadeCnpj") || (unidadeModo === "nova" ? linkedWork?.cnpj || "" : ""),
    unidadeMunicipio: formData.get("unidadeMunicipio") || (unidadeModo === "nova" ? [linkedWork?.cidade, linkedWork?.uf].filter(Boolean).join("/") : ""),
    unidadeCentro: formData.get("unidadeCentro") || (unidadeModo === "nova" ? linkedWork?.codigoOriginal || "" : ""),
    unidadeSource: formData.get("unidadeSource") || (unidadeModo === "nova" ? "Portfólio de obras" : ""),
  });

  if (tipo === "SIC") {
    const lecomNumber = String(formData.get("lecomNumber") || "").trim();
    const obraNumber = String(formData.get("obraNumber") || linkedWork?.chaveUnica || linkedWork?.codigoOriginal || "").trim();
    const obraNome = String(formData.get("obraNome") || linkedWork?.nome || "").trim();
    const tituloSic = String(formData.get("tituloSic") || "").trim();
    const numeroSic = String(formData.get("numeroSic") || "").trim();
    const descricaoSic = String(formData.get("descricao") || "").trim();
    const analistaSalaTecnica = String(formData.get("analistaSalaTecnica") || formData.get("analista") || "").trim();
    let anexos = [];
    try {
      anexos = await fileAttachmentMetadata(form.querySelector('[name="sicFiles"]'), { entidade: "demanda", entidadeId: demandId, tipo: "SIC" });
    } catch (error) {
      console.warn("Falha ao gravar anexos da SIC.", error);
      showFormError("Não consegui salvar os anexos da SIC no navegador. Tente anexar novamente ou reduza o tamanho dos arquivos.", form);
      return;
    }

    if (!obraNumber || !obraNome || !tituloSic || !descricaoSic || !analistaSalaTecnica) {
      showFormError("Preencha nº da obra, nome da obra, título, descrição da SIC e analista da Sala Técnica.", form);
      return;
    }

    const affected = [...form.querySelectorAll(".discipline-row")]
      .map((row) => ({
        disciplinaId: row.querySelector('[name="disciplinaId"]').value,
        valorDelta: parseCurrency(row.querySelector('[name="valorDelta"]').value),
      }))
      .filter((item) => item.disciplinaId || item.valorDelta);

    const invalid = affected.find((item) => {
      const discipline = disciplineById(item.disciplinaId);
      return !item.disciplinaId || !discipline.selecionavelParaSIC;
    });

    if (invalid) {
      showFormError("Cada linha da SIC precisa ter uma disciplina selecionável.", form);
      return;
    }

    sicDraftDisciplines = affected;
    sicMetadata = {
      lecomNumber,
      obraNumber,
      obraNome,
      tituloSic,
      numeroSic,
      descricaoSic,
      analistaSalaTecnica,
      motivo: formData.get("motivo") || "InformacaoContratada",
      anexos,
    };
  }

  state.demands.unshift({
    id: demandId,
    obraId,
    ...unitContext,
    tipo,
    sprintId: formData.get("sprintId") || currentSprint()?.id || "sprint-4",
    analistaResponsavel: formData.get("analistaSalaTecnica") || formData.get("analistaResponsavel") || formData.get("analista"),
    analistasComplementares: [],
    prioridade: formData.get("prioridade"),
    coluna: tipo === "SIC" ? "fazer" : formData.get("coluna") || "fazer",
    dataPrevistaInicio: formData.get("dataPrevistaInicio") || todayISO(),
    dataInicioReal: formData.get("dataInicioReal") || "",
    dataPrevEnvioValidacaoObras: formData.get("dataPrevEnvioValidacaoObras") || "",
    dataEnvioRealValidacaoObras: formData.get("dataEnvioRealValidacaoObras") || "",
    dataValidacaoObras: formData.get("dataValidacaoObras") || "",
    dataPrevistaEntrega: formData.get("dataPrevistaEntrega"),
    dataEntregaReal: formData.get("dataEntregaReal") || "",
    naoEnviarValidacaoObras: formData.get("naoEnviarValidacaoObras") === "on",
    observacao: formData.get("descricao") || formData.get("observacao"),
    nota: formData.get("nota") || "",
    sicMetadata,
    sicDraftDisciplines,
    sicApprovalStatus: tipo === "SIC" ? "Pendente" : "",
    sicApprovalRequestedAt: tipo === "SIC" ? todayISO() : "",
    sicApprovalApprovedAt: "",
    sicApprovalApprovedBy: "",
    sicApprovalRejectedAt: "",
    sicApprovalRejectedBy: "",
    sicPostedAt: "",
    anexos: sicMetadata?.anexos || [],
    sicIds,
  });

  addHistory({
    entidade: "demanda",
    entidadeId: demandId,
    campo: "criação",
    valorAnterior: "Não existia",
    valorNovo: `${demandTypeLabel(tipo)} criada`,
  });

  saveState();
  closeModal();
  selectedWorkId = obraId;
  if (tipo === "SIC") {
    resetOperationalFilters();
    operationalViewMode = "kanban";
    showToast("Demanda de SIC salva no Kanban em A iniciar e enviada para a fila de aprovação.");
    setView("worksOperational");
    return;
  }
  showToast("Demanda criada com rastreabilidade por disciplina.");
  render();
}

async function postDemandSicToEV(demandId) {
  const demand = state.demands.find((item) => item.id === demandId);
  if (!demand || demandTypeKey(demand.tipo) !== "SIC") return;
  if ((demand.sicIds || []).length) {
    showToast("Esta SIC já foi postada no EV.");
    return;
  }
  const approval = sicApprovalReading(demand);
  if (approval.status !== "Aprovado") {
    showFormError("A SIC precisa ser aprovada na aba SICs > Aprovação antes da postagem no EV.", document.querySelector(`#demandDetailForm[data-id="${demand.id}"]`));
    return;
  }
  const work = workById(demand.obraId);
  const metadata = demand.sicMetadata || {};
  const detailForm = document.querySelector(`#demandDetailForm[data-id="${demand.id}"]`);
  const descriptionFromForm = detailForm?.querySelector('[name="sicDescricao"]')?.value;
  if (descriptionFromForm != null) {
    metadata.descricaoSic = descriptionFromForm;
    demand.sicMetadata = metadata;
    demand.observacao = descriptionFromForm;
  }
  let newAttachments = [];
  try {
    newAttachments = await fileAttachmentMetadata(detailForm?.querySelector('[name="sicDetailFiles"]'), { entidade: "demanda", entidadeId: demand.id, tipo: "SIC" });
  } catch (error) {
    console.warn("Falha ao gravar anexos antes da postagem da SIC.", error);
    showFormError("Não consegui salvar os anexos antes da postagem no EV. Tente anexar novamente ou reduza o tamanho dos arquivos.", detailForm);
    return;
  }
  if (newAttachments.length) {
    metadata.anexos = uniqueAttachments([...(metadata.anexos || []), ...newAttachments]);
    demand.sicMetadata = metadata;
    demand.anexos = uniqueAttachments([...(demand.anexos || []), ...newAttachments]);
  }
  const info = demandSicInfo(demand);
  const draftFromForm = readSicDraftDisciplinesFromForm(detailForm);
  if (draftFromForm.length) demand.sicDraftDisciplines = draftFromForm;
  const affected = (demand.sicDraftDisciplines || [])
    .map((item) => ({
      disciplinaId: item.disciplinaId,
      valorDelta: Number(item.valorDelta) || 0,
    }))
    .filter((item) => item.disciplinaId || item.valorDelta);

  if (!work || !info) {
    showFormError("Não foi possível localizar a obra vinculada para postar a SIC no EV.");
    return;
  }
  if (!affected.length) {
    showFormError("Cadastre ao menos uma disciplina afetada antes de postar a SIC no EV.");
    return;
  }

  const isInformationalSic = (metadata.motivo || info.motivo) === "InformacaoContratada";
  const invalid = affected.find((item) => {
    const discipline = disciplineById(item.disciplinaId);
    return !item.disciplinaId || !discipline.selecionavelParaSIC || (!isInformationalSic && item.valorDelta === 0);
  });

  if (invalid) {
    showFormError(isInformationalSic ? "Cada linha da SIC precisa ter uma disciplina selecionável." : "Para postar no EV, cada linha precisa ter disciplina selecionável e valor delta válido.");
    return;
  }

  const positiveDelta = affected.reduce((sum, item) => sum + Math.max(item.valorDelta, 0), 0);
  const remainingRisk = workRiskReserve(work) - approvedPositiveSicTotalForWork(work.id);
  const riskReading = sicRiskReading(work, null, positiveDelta);
  const riskExceeded = positiveDelta > Math.max(remainingRisk, 0);

  const sicId = nextCode("SIC", state.sics);
  const dashToEmpty = (value) => (value && value !== "—" ? value : "");
  const sic = {
    id: sicId,
    obraId: work.id,
    demandaId: demand.id,
    lecomNumber: dashToEmpty(info.lecomNumber),
    obraNumber: dashToEmpty(info.obraNumber),
    obraNome: dashToEmpty(info.obraNome),
    titulo: dashToEmpty(info.tituloSic),
    numeroSic: dashToEmpty(info.numeroSic) || sicId,
    disciplinasAfetadas: affected,
    motivo: metadata.motivo || info.motivo || "InformacaoContratada",
    descricao: dashToEmpty(info.descricaoSic),
    documentoUrl: (info.anexos || []).map((file) => file.nome).join(", "),
    anexos: info.anexos || [],
    analistaSalaTecnica: dashToEmpty(info.analistaSalaTecnica),
    evLineDisciplineId: "sics",
    riskExceeded,
    riskReserveAtPost: riskReading.reserve,
    riskAvailableAtPost: riskReading.available,
    riskExcessAtPost: riskReading.excess,
    status: "Aprovado",
    aprovadoPor: demand.sicApprovalApprovedBy || currentUser()?.nome || "Gestão ST",
    dataAbertura: todayISO(),
    dataAprovacao: demand.sicApprovalApprovedAt || todayISO(),
  };

  state.sics.unshift(sic);
  syncSicWithEV(work, sic);
  syncWorkSicSummaryLine(work);
  demand.sicIds = [sic.id];
  demand.sicPostedAt = todayISO();
  demand.sicApprovalStatus = "Postada";
  demand.sicMetadata = {
    ...metadata,
    numeroSic: sic.numeroSic,
    status: "Postada no EV",
  };

  addHistory({
    entidade: "sic",
    entidadeId: sic.id,
    campo: "postagem no EV",
    valorAnterior: "Demanda operacional",
    valorNovo: affected.map((item) => disciplineById(item.disciplinaId).nome).join(", "),
  });
  addHistory({
    entidade: "demanda",
    entidadeId: demand.id,
    campo: "SIC",
    valorAnterior: "Rascunho operacional",
    valorNovo: `${sic.id} postada no EV`,
  });

  saveState();
  selectedWorkId = work.id;
  showToast("SIC postada no EV: valor lançado na linha 32 (SIC's).");
  render();
  openEVModal(work.id);
}

async function handleDemandDetailSubmit(form) {
  const demand = state.demands.find((item) => item.id === form.dataset.id);
  if (!demand) return;
  const formData = new FormData(form);
  const previousAnalyst = demand.analistaResponsavel || "A definir";
  const previousSprint = demand.sprintId || "";
  const previousPriority = demand.prioridade || "";
  const isSicDemand = demandTypeKey(demand.tipo) === "SIC";
  const previousSicApproval = isSicDemand ? sicApprovalReading(demand) : null;
  const previousSicPayload =
    isSicDemand && !(demand.sicIds || []).length
      ? JSON.stringify({
          descricao: demand.sicMetadata?.descricaoSic || demand.observacao || "",
          disciplinas: demand.sicDraftDisciplines || [],
        })
      : "";

  demand.analistaResponsavel = formData.get("analistaResponsavel") || demand.analistaResponsavel || "";
  demand.tipo = formData.get("tipo") || demand.tipo;
  demand.sprintId = formData.get("sprintId") || "";
  demand.prioridade = formData.get("prioridade") || demand.prioridade;
  if (isSicDemand) {
    demand.sicMetadata = demand.sicMetadata || {};
    demand.sicMetadata.descricaoSic = formData.get("sicDescricao") || demand.sicMetadata.descricaoSic || demand.observacao || "";
    demand.observacao = demand.sicMetadata.descricaoSic;
    let newAttachments = [];
    try {
      newAttachments = await fileAttachmentMetadata(form.querySelector('[name="sicDetailFiles"]'), { entidade: "demanda", entidadeId: demand.id, tipo: "SIC" });
    } catch (error) {
      console.warn("Falha ao gravar novos anexos da SIC.", error);
      showFormError("Não consegui salvar os novos anexos no navegador. Tente anexar novamente ou reduza o tamanho dos arquivos.", form);
      return;
    }
    if (newAttachments.length) {
      demand.sicMetadata.anexos = uniqueAttachments([...(demand.sicMetadata.anexos || []), ...newAttachments]);
      demand.anexos = uniqueAttachments([...(demand.anexos || []), ...newAttachments]);
      (demand.sicIds || []).forEach((sicId) => {
        const sic = state.sics.find((item) => item.id === sicId);
        if (!sic) return;
        sic.anexos = uniqueAttachments([...(sic.anexos || []), ...newAttachments]);
        sic.documentoUrl = (sic.anexos || []).map((file) => file.nome).join(", ");
      });
      addHistory({
        entidade: "demanda",
        entidadeId: demand.id,
        campo: "anexos",
        valorAnterior: "Sem novos arquivos",
        valorNovo: `${newAttachments.length} arquivo(s) anexado(s)`,
      });
    }
  } else {
    demand.observacao = formData.get("observacao") || "";
  }
  demand.nota = formData.get("nota") || "";
  if (isSicDemand && !(demand.sicIds || []).length) {
    const draftDisciplines = readSicDraftDisciplinesFromForm(form);
    if (draftDisciplines.length) demand.sicDraftDisciplines = draftDisciplines;
    const nextSicPayload = JSON.stringify({
      descricao: demand.sicMetadata?.descricaoSic || demand.observacao || "",
      disciplinas: demand.sicDraftDisciplines || [],
    });
    if (previousSicPayload && previousSicPayload !== nextSicPayload && ["Aprovado", "Reprovado", "Em revisão"].includes(previousSicApproval?.status)) {
      demand.sicApprovalStatus = "Pendente";
      demand.sicApprovalRequestedAt = todayISO();
      demand.sicApprovalApprovedAt = "";
      demand.sicApprovalApprovedBy = "";
      demand.sicApprovalRejectedAt = "";
      demand.sicApprovalRejectedBy = "";
      addHistory({
        entidade: "demanda",
        entidadeId: demand.id,
        campo: "aprovação SIC",
        valorAnterior: previousSicApproval.label,
        valorNovo: "Reenviada para aprovação após edição do card",
      });
    }
  }
  demand.naoEnviarValidacaoObras = formData.get("naoEnviarValidacaoObras") === "on";
  [
    "dataPrevistaInicio",
    "dataInicioReal",
    "dataPrevEnvioValidacaoObras",
    "dataEnvioRealValidacaoObras",
    "dataValidacaoObras",
    "dataPrevistaEntrega",
    "dataEntregaReal",
  ].forEach((field) => {
    demand[field] = formData.get(field) || "";
  });
  const statusUpdate = updateDemandColumn(demand.id, formData.get("coluna") || demand.coluna);
  if (statusUpdate === false) return;

  if (previousAnalyst !== (demand.analistaResponsavel || "A definir")) {
    addHistory({
      entidade: "demanda",
      entidadeId: demand.id,
      campo: "analistaResponsavel",
      valorAnterior: previousAnalyst,
      valorNovo: demand.analistaResponsavel || "A definir",
    });
  }
  if (previousSprint !== demand.sprintId) {
    addHistory({
      entidade: "demanda",
      entidadeId: demand.id,
      campo: "sprint",
      valorAnterior: previousSprint || "Sem sprint",
      valorNovo: sprintById(demand.sprintId)?.nome || "Sem sprint",
    });
  }
  if (previousPriority !== demand.prioridade) {
    addHistory({
      entidade: "demanda",
      entidadeId: demand.id,
      campo: "prioridade",
      valorAnterior: previousPriority || "Sem prioridade",
      valorNovo: demand.prioridade || "Sem prioridade",
    });
  }

  saveState();
  closeModal();
  showToast("Demanda atualizada e Kanban sincronizado.");
  render();
}

function handleDeleteDemandSubmit(form) {
  const demand = state.demands.find((item) => item.id === form.dataset.id);
  if (!demand) return;
  const formData = new FormData(form);
  const justificativa = String(formData.get("justificativa") || "").trim();
  if (justificativa.length < 5) {
    showFormError("Informe uma justificativa para excluir a demanda.");
    return;
  }

  const work = workById(demand.obraId);
  const deletedRecord = {
    ...clone(demand),
    obraNome: work?.nome || "",
    statusAnterior: demandStatusLabel(demand),
    justificativaExclusao: justificativa,
    excluidoPor: "Gestão ST",
    excluidoEm: new Date().toISOString(),
  };

  state.deletedDemands = [deletedRecord, ...(state.deletedDemands || [])];
  state.demands = state.demands.filter((item) => item.id !== demand.id);
  addHistory({
    entidade: "demanda",
    entidadeId: demand.id,
    campo: "exclusão",
    valorAnterior: `${demandStatusLabel(demand)} | ${work?.nome || "Obra não localizada"}`,
    valorNovo: justificativa,
  });

  saveState();
  closeModal();
  showToast(`${demand.id} excluída do Kanban com justificativa registrada.`);
  render();
}

function handleContractSubmit(form) {
  const formData = new FormData(form);
  const value = parseCurrency(formData.get("valor"));
  if (value <= 0) {
    showFormError("Informe um valor contratado válido.");
    return;
  }

  const contract = {
    id: nextCode("CTR", state.contracts),
    obraId: formData.get("obraId"),
    disciplinaId: formData.get("disciplinaId"),
    fornecedorId: formData.get("fornecedorId"),
    valor: value,
    data: todayISO(),
    responsavelSuprimentos: formData.get("responsavelSuprimentos"),
    numeroContrato: formData.get("numeroContrato"),
  };
  state.contracts.unshift(contract);
  addHistory({
    entidade: "contratacao",
    entidadeId: contract.id,
    campo: "valor",
    valorAnterior: "Não existia",
    valorNovo: `${contract.numeroContrato} | ${money(contract.valor)}`,
  });
  saveState();
  closeModal();
  showToast("Contratação vinculada à disciplina.");
  render();
}

function approveSicDemand(id) {
  const demand = state.demands.find((item) => item.id === id);
  if (!demand || demandTypeKey(demand.tipo) !== "SIC") return;
  if ((demand.sicIds || []).length) {
    showToast("Esta SIC já foi postada no EV.");
    return;
  }
  const previous = sicApprovalReading(demand).label;
  demand.sicApprovalStatus = "Aprovado";
  demand.sicApprovalApprovedAt = todayISO();
  demand.sicApprovalApprovedBy = currentUser()?.nome || "Gestão ST";
  demand.sicApprovalRejectedAt = "";
  demand.sicApprovalRejectedBy = "";
  addHistory({
    entidade: "demanda",
    entidadeId: demand.id,
    campo: "aprovação SIC",
    valorAnterior: previous,
    valorNovo: `Aprovada por ${demand.sicApprovalApprovedBy}`,
  });
  const reopenDetail = Boolean(document.querySelector(`#demandDetailForm[data-id="${demand.id}"]`));
  saveState();
  showToast(`${demand.id} aprovada para postagem no EV.`);
  render();
  if (reopenDetail) openDemandDetailModal(demand.id);
}

function rejectSicDemand(id) {
  const demand = state.demands.find((item) => item.id === id);
  if (!demand || demandTypeKey(demand.tipo) !== "SIC") return;
  if ((demand.sicIds || []).length) {
    showToast("SIC já postada no EV. Não é possível reprovar nesta etapa.");
    return;
  }
  const previous = sicApprovalReading(demand).label;
  demand.sicApprovalStatus = "Reprovado";
  demand.sicApprovalRejectedAt = todayISO();
  demand.sicApprovalRejectedBy = currentUser()?.nome || "Gestão ST";
  addHistory({
    entidade: "demanda",
    entidadeId: demand.id,
    campo: "aprovação SIC",
    valorAnterior: previous,
    valorNovo: `Reprovada por ${demand.sicApprovalRejectedBy}`,
  });
  const reopenDetail = Boolean(document.querySelector(`#demandDetailForm[data-id="${demand.id}"]`));
  saveState();
  showToast(`${demand.id} reprovada para revisão antes do EV.`);
  render();
  if (reopenDetail) openDemandDetailModal(demand.id);
}

function approveSic(id) {
  const sic = state.sics.find((item) => item.id === id);
  const work = sic && workById(sic.obraId);
  if (!sic || !work) return;

  const diffs = sic.disciplinasAfetadas.map((item) => {
    const line = work.ev.lines.find((entry) => canonicalDisciplineId(entry.disciplinaId) === canonicalDisciplineId(item.disciplinaId));
    if (!line) {
      work.ev.lines.push({
        disciplinaId: item.disciplinaId,
        valorOrcado: 0,
        status: "Orçado",
      });
    }
    const baseLine = work.ev.lines.find((entry) => canonicalDisciplineId(entry.disciplinaId) === canonicalDisciplineId(item.disciplinaId));
    const before = baseLine.valorOrcado + aditivadoByDiscipline(work.id, item.disciplinaId);
    return {
      disciplinaId: item.disciplinaId,
      valorAntes: before,
      valorDepois: before + item.valorDelta,
    };
  });

  sic.status = "Aprovado";
  sic.aprovadoPor = "Gestão ST";
  sic.dataAprovacao = todayISO();
  work.ev.versaoAtual += 1;
  const updatedValues = workTotals(work);
  work.ev.versions.push({
    numero: work.ev.versaoAtual,
    data: todayISO(),
    origem: sic.demandaId,
    valorTotal: updatedValues.orcado + updatedValues.aditivado,
    custoM2: (updatedValues.orcado + updatedValues.aditivado) / Math.max(work.areaEquivalente, 1),
    diffPorDisciplina: diffs,
  });

  addHistory({
    entidade: "sic",
    entidadeId: sic.id,
    campo: "status",
    valorAnterior: "Pendente",
    valorNovo: "Aprovado",
  });

  saveState();
  showToast(`${sic.id} aprovada e refletida no EV por disciplina.`);
  render();
}

function updateDemandColumn(id, nextColumnId) {
  const demand = state.demands.find((item) => item.id === id);
  const nextColumn = columnById(nextColumnId);
  if (!demand || !nextColumn) return false;
  if (demand.coluna === nextColumnId) return demand;
  const isSicDemand = demandTypeKey(demand.tipo) === "SIC";
  if (nextColumnId === "concluido") {
    const work = workById(demand.obraId);
    if (isSicDemand && sicApprovalReading(demand).status !== "Postada") {
      sicViewMode = "approval";
      sicSearchQuery = demand.id;
      closeModal();
      showToast("A SIC precisa ser aprovada e postada no EV antes de concluir o card.");
      setView("sics");
      return false;
    }
    if (!isSicDemand && !workHasEVValuesForConclusion(work)) {
      selectedWorkId = work?.id || demand.obraId || selectedWorkId;
      closeModal();
      showToast("Antes de concluir, preencha e salve os valores do EV da obra.");
      setView("ev");
      return false;
    }
  }
  const currentIndex = columns.findIndex((column) => column.id === demand.coluna);
  const previous = columns[currentIndex]?.label || demand.coluna || "Sem status";
  demand.coluna = nextColumnId;
  if (demand.coluna === "concluido") {
    if (!demand.dataEntregaReal) demand.dataEntregaReal = todayISO();
    if (!isSicDemand) syncCompletedDemandWithEV(workById(demand.obraId), demand);
  }
  addHistory({
    entidade: "demanda",
    entidadeId: demand.id,
    campo: "coluna",
    valorAnterior: previous,
    valorNovo: nextColumn.label,
  });
  saveState();
  return demand;
}

function moveDemand(id, direction) {
  const demand = state.demands.find((item) => item.id === id);
  if (!demand) return;
  const currentIndex = columns.findIndex((column) => column.id === demand.coluna);
  const nextIndex = Math.max(0, Math.min(columns.length - 1, currentIndex + direction));
  const updated = updateDemandColumn(id, columns[nextIndex].id);
  if (updated === false) return;
  render();
}

function createBudgetDemandFromProject(rowNumber, options = {}) {
  const record = projectPlanRows(false).find((row) => String(row.row) === String(rowNumber));
  if (!record || !record.isProject) return null;

  const existing = projectBudgetDemandForRow(record);
  if (existing) {
    if (options.navigate) {
      selectedWorkId = existing.obraId || selectedWorkId;
      resetOperationalFilters();
      operationalFilters.query = existing.id;
      operationalViewMode = "kanban";
      closeModal();
      setView("worksOperational");
      showToast(`${existing.id} já estava criado no Orçamento 360.`);
    }
    return existing;
  }

  const work = record.obraId ? workById(record.obraId) : planWorkMatch(record);
  if (!work) {
    const message = "Antes de entregar para ST, cadastre ou vincule este projeto ao Portfólio do Orçamento 360.";
    if (options.form) showFormError(message, options.form);
    else showToast(message);
    return null;
  }

  const sprint = currentSprint();
  const startDate = record.inicioOrcamentacao || addDaysISO(record.terminoPlanejado, 1) || todayISO();
  const demand = {
    id: nextCode("DEM", state.demands),
    obraId: work.id,
    unidadeModo: "nova",
    unidadeId: "",
    unidadeBusca: "",
    unidadeNome: work.nome || "",
    unidadeTipo: work.tipoUnidade || "",
    unidadeCnpj: work.cnpj || "",
    unidadeMunicipio: [work.cidade, work.uf].filter(Boolean).join("/"),
    unidadeCentro: work.codigoOriginal || "",
    unidadeSource: "Entrega de Projetos 360",
    tipo: "EmissaoInicial",
    sprintId: sprint?.id || "",
    analistaResponsavel: "",
    analistasComplementares: [],
    prioridade: "Média",
    coluna: "fazer",
    dataPrevistaInicio: startDate,
    dataInicioReal: "",
    dataPrevEnvioValidacaoObras: addDaysISO(startDate, 10),
    dataEnvioRealValidacaoObras: "",
    dataValidacaoObras: "",
    dataPrevistaEntrega: addDaysISO(startDate, 14),
    dataEntregaReal: "",
    naoEnviarValidacaoObras: false,
    observacao: `Orçamentação inicial criada após entrega de Projetos para ST: ${record.obra}.`,
    nota: "",
    sicMetadata: null,
    sicDraftDisciplines: [],
    sicPostedAt: "",
    anexos: [],
    sicIds: [],
    origemModulo: "Projetos 360",
    projectPlanRow: projectStatusOverrideKey(record),
    origemProjetoRow: projectStatusOverrideKey(record),
    createdAt: todayISO(),
    updatedAt: todayISO(),
  };

  state.demands.unshift(demand);
  addHistory({
    entidade: "demanda",
    entidadeId: demand.id,
    campo: "criação",
    valorAnterior: "Projeto entregue para ST",
    valorNovo: `Card criado em Orçamento 360 > Fazer para ${work.nome}`,
  });

  if (options.navigate) {
    selectedWorkId = work.id;
    resetOperationalFilters();
    operationalFilters.query = demand.id;
    operationalViewMode = "kanban";
    closeModal();
    setView("worksOperational");
    showToast(`${demand.id} criado no Orçamento 360 em Fazer.`);
  }
  return demand;
}

function updateProjectStatus(rowNumber, nextStatus, form = null) {
  const record = projectOperationalRows(false).find((row) => String(row.row) === String(rowNumber));
  const nextColumn = projectColumns.find((column) => column.id === nextStatus);
  if (!record) return;
  if (!nextColumn) {
    showFormError("Selecione um status válido para atualizar o projeto.", form);
    return;
  }

  const previousStatus = projectColumnById(projectStatusKey(record));

  if (record.customProjectDemand) {
    const demand = (state.projectDemands || []).find((item) => String(item.id) === String(record.customDemandId));
    if (!demand) return;
    demand.status = nextColumn.id;
    demand.updatedAt = todayISO();
    if (nextColumn.id === "salaTecnica" && !demand.dataEntregaReal) demand.dataEntregaReal = todayISO();
    addHistory({
      entidade: "projeto",
      entidadeId: demand.id,
      campo: "status",
      valorAnterior: previousStatus.label,
      valorNovo: nextColumn.label,
    });
    saveState();
    closeModal();
    render();
    showToast(`Demanda de Projetos movida para ${nextColumn.label}.`);
    return;
  }

  if (!state.projectStatusOverrides || typeof state.projectStatusOverrides !== "object") state.projectStatusOverrides = {};
  let budgetDemand = projectBudgetDemandForRow(record);

  if (nextColumn.id === "salaTecnica") {
    budgetDemand = createBudgetDemandFromProject(record.row, { form, save: false });
    if (!budgetDemand) return;
  }

  state.projectStatusOverrides[projectStatusOverrideKey(record)] = {
    status: nextColumn.id,
    updatedAt: todayISO(),
    updatedBy: currentUser()?.nome || "Gestão ST",
    budgetDemandId: budgetDemand?.id || "",
  };

  addHistory({
    entidade: "projeto",
    entidadeId: projectStatusOverrideKey(record),
    campo: "status",
    valorAnterior: previousStatus.label,
    valorNovo: nextColumn.label,
  });

  saveState();

  if (nextColumn.id === "salaTecnica") {
    selectedWorkId = budgetDemand.obraId || selectedWorkId;
    resetOperationalFilters();
    operationalFilters.query = budgetDemand.id;
    operationalViewMode = "kanban";
    closeModal();
    setView("worksOperational");
    showToast(`${budgetDemand.id} criado/vinculado no Orçamento 360 em Fazer.`);
    return;
  }

  closeModal();
  render();
  showToast(`Projeto movido para ${nextColumn.label}.`);
}

function startBudgetFromInvestmentPlan(rowNumber) {
  const record = investmentPlanRows(false).find((row) => String(row.row) === String(rowNumber));
  if (!record || !record.isProject) return;
  const work = record.obraId ? workById(record.obraId) : planWorkMatch(record);
  if (!work) {
    showToast("Esta linha ainda não está vinculada ao Portfólio. Cadastre ou edite a obra antes de criar a orçamentação.");
    return;
  }
  const startDate = record.inicioOrcamentacao || addDaysISO(record.terminoPlanejado, 1) || todayISO();
  openDemandWizardModal("EmissaoInicial", 1, {
    obraId: work.id,
    obraBusca: work.nome,
    descricao: `Orçamentação inicial após entrega de Projetos no Plano de Investimento: ${record.obra}.`,
    dataPrevistaInicio: startDate,
    dataPrevEnvioValidacaoObras: addDaysISO(startDate, 10),
    dataPrevistaEntrega: addDaysISO(startDate, 14),
  });
}

function openPlanWorkInPortfolio(workId) {
  const work = workById(workId);
  if (!work) return;
  investmentPlanFilters = { query: work.nome, etapa: "", status: "", regiao: "", dateFrom: "", dateTo: "" };
  portfolioQuickFilters = { query: "", tipoUnidade: "", regional: "", evStatus: "" };
  portfolioFilters = Object.fromEntries(Object.keys(portfolioFilters).map((key) => [key, ""]));
  selectedWorkId = work.id;
  setView("portfolio");
}

function workDraftFromPlanRow(row) {
  return {
    nome: row.obra || "",
    codigoOriginal: row.registro || row.row || "0000",
    tipoUnidade: row.tipoUnidade || "",
    cidade: row.praca || "",
    uf: row.uf || "",
    regiao: row.regiao || "",
    classificacaoObra: row.classificacaoObra || "Não informada",
    tipologiaObra: row.tipologiaObra || "Não informada",
    prazoDias: row.slaDias || "",
  };
}

function openWorkFromInvestmentPlan(rowNumber) {
  const record = investmentPlanRows(false).find((row) => String(row.row) === String(rowNumber));
  if (!record) {
    showToast("Não encontrei esta linha no Plano de Investimento 2026.");
    return;
  }
  workModalReturnMode = "";
  workModalPlanDraft = workDraftFromPlanRow(record);
  openWorkModal();
}

document.addEventListener("click", async (event) => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    if (viewButton.closest(".modal-card")) closeModal();
    if (viewButton.dataset.view === "ev" && !viewButton.closest(".modal-card")) selectedWorkId = "all";
    setView(viewButton.dataset.view);
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  if (action === "download-attachment") {
    event.preventDefault();
    await downloadStoredAttachment(actionButton.dataset.attachmentId);
    return;
  }
  if (action === "toggle-haptec") {
    if (haptecSuppressToggleClick) {
      event.preventDefault();
      haptecSuppressToggleClick = false;
      return;
    }
    haptecOpen = !haptecOpen;
    render();
    return;
  }
  if (action === "fill-login-email") {
    const form = document.querySelector("#loginForm");
    const emailInput = form?.elements?.email;
    const passwordInput = form?.elements?.senha;
    if (emailInput) emailInput.value = actionButton.dataset.email || "";
    passwordInput?.focus();
    return;
  }
  if (action === "logout") {
    logoutUser();
    return;
  }
  if (action === "haptec-ask") {
    handleHaptecQuestion(actionButton.dataset.prompt || "Ajuda");
    return;
  }
  if (action === "haptec-speak") {
    speakHaptec();
    return;
  }
  if (action === "haptec-nav") {
    const view = actionButton.dataset.targetView || "dashboard";
    haptecOpen = true;
    addHaptecMessage("bot", `Certo. Vou te levar para ${actionButton.textContent.trim()}.`);
    setView(view);
    return;
  }
  if (action === "feature-soon") {
    showToast("Esta ação entrará na próxima etapa do cadastro mestre.");
    return;
  }
  if (action === "submit-demand-step") {
    event.preventDefault();
    handleDemandWizardStep1(actionButton.closest("form"));
    return;
  }
  if (action === "submit-demand-form") {
    event.preventDefault();
    await handleDemandSubmit(actionButton.closest("form"));
    return;
  }
  if (action === "open-dashboard-report") {
    dashboardReportsFilter = actionButton.dataset.reportFilter || "active";
    setView("reports");
    return;
  }
  if (action === "set-dashboard-report-filter") {
    dashboardReportsFilter = actionButton.dataset.reportFilter || "active";
    render();
    return;
  }
  if (action === "open-global-demand") {
    openGlobalDemandModal();
    return;
  }
  if (action === "open-global-demand-type") {
    openGlobalDemandByModule(actionButton.dataset.moduleTarget || "works");
    return;
  }
  if (action === "open-work") {
    workModalReturnMode = "";
    workModalPlanDraft = null;
    openWorkModal();
  }
  if (action === "open-work-from-sic") {
    workModalReturnMode = "sic";
    workModalPlanDraft = null;
    openWorkModal();
  }
  if (action === "edit-work") {
    workModalReturnMode = "";
    workModalPlanDraft = null;
    openWorkModal(actionButton.dataset.id);
  }
  if (action === "open-work-from-plan") openWorkFromInvestmentPlan(actionButton.dataset.row);
  if (action === "open-project-demand") {
    openProjectDemandModal();
    return;
  }
  if (action === "create-budget-from-project") {
    updateProjectStatus(actionButton.dataset.row, "salaTecnica", actionButton.closest("[data-project-status-form]"));
    return;
  }
  if (action === "update-project-status") {
    const form = actionButton.closest("[data-project-status-form]");
    updateProjectStatus(actionButton.dataset.row, form?.elements?.projectStatus?.value, form);
    return;
  }
  if (action === "start-budget-from-plan") startBudgetFromInvestmentPlan(actionButton.dataset.row);
  if (action === "select-plan-work") openPlanWorkInPortfolio(actionButton.dataset.id);
  if (action === "open-demand") {
    if (maintenanceViewIds.includes(currentView) || clinicalViewIds.includes(currentView)) {
      openMaintenanceDemandModal();
      return;
    }
    const buttonText = normalizeSearchText(actionButton.textContent || "");
    const mode = currentView === "sics" || buttonText.includes("sic") ? "sic" : "demand";
    openDemandModal(mode);
  }
  if (action === "open-maintenance-demand") openMaintenanceDemandModal();
  if (action === "open-maintenance-card") openMaintenanceCardModal(actionButton.dataset.id);
  if (action === "open-maintenance-slice") openMaintenanceSliceDetailModal(actionButton.dataset.field, actionButton.dataset.label);
  if (action === "export-works-operational") {
    exportWorksOperationalReport();
    return;
  }
  if (action === "export-maintenance-operational") {
    exportMaintenanceOperationalReport();
    return;
  }
  if (action === "open-delete-demand") {
    openDeleteDemandModal(actionButton.dataset.id);
    return;
  }
  if (action === "open-demand-detail") openDemandDetailModal(actionButton.dataset.id);
  if (action === "post-sic-to-ev") {
    await postDemandSicToEV(actionButton.dataset.id);
    return;
  }
  if (action === "open-contract") openContractModal();
  if (action === "open-sprint") openSprintModal();
  if (action === "open-ev-modal") openEVModal(actionButton.dataset.id);
  if (action === "open-historical-ev") {
    openHistoricalEVModal(actionButton.dataset.id);
    return;
  }
  if (action === "edit-historical-ev") {
    editHistoricalEV(actionButton.dataset.id);
    return;
  }
  if (action === "edit-ev-typology") {
    openEVTypologyModal(actionButton.dataset.id);
    return;
  }
  if (action === "load-ev-incc") {
    loadUnifiedEVIntoINCC(actionButton.dataset.id);
    return;
  }
  if (action === "cancel-ev-deviation-save") {
    actionButton.closest("[data-ev-haptec-confirm]")?.remove();
    document.querySelector("#evForm .ev-value-input")?.focus();
    return;
  }
  if (action === "confirm-ev-deviation-save") {
    const overlay = actionButton.closest("[data-ev-haptec-confirm]");
    const confirmed = overlay?.querySelector("[data-ev-haptec-check]")?.checked;
    if (!confirmed) return;
    const form = document.querySelector("#evForm");
    if (!form) return;
    form.dataset.evDeviationConfirmed = "true";
    overlay.remove();
    handleEVSubmit(form, actionButton.dataset.mode || "final");
    return;
  }
  if (action === "open-benchmark-detail") openBenchmarkDetailModal(actionButton.dataset.workId, actionButton.dataset.disciplineId);
  if (action === "open-investment-detail") openInvestmentDetailModal(actionButton.dataset.id);
  if (action === "open-sic-detail") openSicDetailModal(actionButton.dataset.key);
  if (action === "open-sic-slice") openSicSliceDetailModal(actionButton.dataset.field, actionButton.dataset.label);
  if (action === "open-sic-timeline") openSicTimelineDetailModal(actionButton.dataset.mode, actionButton.dataset.key);
  if (action === "open-kpi-detail") openKpiDetail(actionButton.dataset.kpi);
  if (action === "apply-operational-filter") applyOperationalKpiFilter(actionButton.dataset.kpi);
  if (action === "set-operational-view") {
    operationalViewMode = actionButton.dataset.mode || "kanban";
    render();
  }
  if (action === "set-project-operational-view") {
    projectOperationalViewMode = actionButton.dataset.mode || "kanban";
    render();
  }
  if (action === "set-maintenance-view") {
    setMaintenanceViewModeForActiveModule(actionButton.dataset.mode || "kanban");
    render();
  }
  if (action === "set-management-filter") {
    managementStatusFilter = actionButton.dataset.filter || "all";
    render();
  }
  if (action === "clear-strategic-history") {
    strategicHistoricalQuery = "";
    strategicHistoricalFilters = { year: "", region: "", status: "" };
    render();
    return;
  }
  if (action === "search-historical-work") {
    strategicHistoricalQuery = actionButton.dataset.code || "";
    strategicHistoricalFilters = { year: "", region: "", status: "" };
    render();
    document.querySelector("[data-strategic-history-search]")?.focus();
    showToast("Obra localizada na Base Geral.");
    return;
  }
  if (action === "set-sic-view") {
    sicViewMode = actionButton.dataset.viewMode || "report";
    render();
  }
  if (action === "open-sic-approval") {
    sicViewMode = "approval";
    if (actionButton.dataset.id) sicSearchQuery = actionButton.dataset.id;
    closeModal();
    setView("sics");
    return;
  }
  if (action === "set-budget-tab") {
    budgetViewMode = actionButton.dataset.tab || "inicio";
    budgetTransferCheck = null;
    render();
  }
  if (action === "set-capex-curve-table") {
    capexCurveTableMode = actionButton.dataset.mode || "previsto";
    render();
  }
  if (action === "set-capex-curve-scope") {
    capexCurveScope = actionButton.dataset.scope || "obras";
    budgetFilters = { query: "", categoriaOrc: "", status: "", centroFinanceiro: "" };
    capexCurveMonthFilter = [];
    render();
  }
  if (action === "set-capex-curve-month") {
    const month = actionButton.dataset.month || "";
    if (!month) {
      capexCurveMonthFilter = [];
    } else {
      const selectedMonths = capexCurveSelectedMonths();
      capexCurveMonthFilter = selectedMonths.includes(month)
        ? selectedMonths.filter((item) => item !== month)
        : sortCapexCurveMonths([...selectedMonths, month]);
    }
    render();
  }
  if (action === "set-capex-curve-category") {
    budgetFilters.categoriaOrc = actionButton.dataset.category || "";
    render();
  }
  if (action === "open-capex-curve-detail") {
    openCapexCurveDetail(actionButton.dataset.detail || "", actionButton.dataset.label || "");
    return;
  }
  if (action === "set-transfer-flow-view") {
    transferFlowViewMode = actionButton.dataset.mode || "oi";
    render();
  }
  if (action === "set-transfer-month-filter") {
    transferMonthFilter = actionButton.dataset.month || "";
    transferAllPage = 1;
    transferNetPage = 1;
    render();
  }
  if (action === "transfer-net-page") {
    transferNetPage = Math.max(1, transferNetPage + Number(actionButton.dataset.direction || 0));
    render();
  }
  if (action === "transfer-all-page") {
    transferAllPage = Math.max(1, transferAllPage + Number(actionButton.dataset.direction || 0));
    render();
  }
  if (action === "open-transfer-detail") {
    openTransferDetailModal(actionButton.dataset.id || "");
    return;
  }
  if (action === "open-transfer-oi") {
    openTransferOiModal(actionButton.dataset.oi || "");
    return;
  }
  if (action === "clear-transfer-filters") {
    transferTrackerQuery = "";
    transferTrackerQuery2 = "";
    transferAllSearch = "";
    transferNetSearch = "";
    transferMonthFilter = "";
    transferAllPage = 1;
    transferNetPage = 1;
    budgetTransferCheck = null;
    render();
  }
  if (action === "clear-operational-filters") {
    resetOperationalFilters();
    render();
  }
  if (action === "clear-project-plan-filters") {
    resetProjectPlanFilters();
    render();
  }
  if (action === "clear-project-operational-filters") {
    resetProjectOperationalFilters();
    render();
  }
  if (action === "clear-maintenance-filters") {
    resetMaintenanceFilters();
    render();
  }
  if (action === "clear-ev-filters") {
    searchTerm = "";
    evAssistantQuery = "";
    evHistoricalFilters = { query: "", year: "", typology: "", discipline: "" };
    selectedWorkId = "all";
    const globalSearch = document.querySelector("#globalSearch");
    if (globalSearch) globalSearch.value = "";
    showToast("Filtros do EV limpos.");
    render();
  }
  if (action === "clear-sic-search") {
    sicSearchQuery = "";
    render();
  }
  if (action === "clear-budget-filters") {
    budgetFilters = { query: "", categoriaOrc: "", status: "", centroFinanceiro: "" };
    budgetTransferCheck = null;
    capexCurveMonthFilter = [];
    render();
  }
  if (action === "validate-budget-transfer") {
    validateBudgetTransfer();
    return;
  }
  if (action === "toggle-ev-na") {
    evShowNotApplicable = !evShowNotApplicable;
    if (actionButton.closest(".ev-modal-card")) openEVModal(selectedWorkId);
    else render();
  }
  if (action === "toggle-demand-history") {
    const panel = actionButton.closest(".modal-section")?.querySelector(".demand-history-panel");
    if (panel) panel.hidden = !panel.hidden;
  }
  if (action === "start-demand-wizard") {
    if (actionButton.dataset.type === "SIC") {
      openSicDemandModal();
      return;
    }
    openDemandWizardModal(actionButton.dataset.type || "EmissaoInicial", 1);
  }
  if (action === "back-demand-step") {
    openDemandWizardModal(demandWizardDraft.tipo || "EmissaoInicial", 1, demandWizardDraft);
  }
  if (action === "set-ev-line-na") {
    const row = actionButton.closest(".ev-line-row");
    const select = row?.querySelector(".ev-status-select");
    const input = row?.querySelector(".ev-value-input");
    if (select) {
      select.value = "Não se aplica";
      select.dataset.status = "Não se aplica";
    }
    if (input) {
      input.value = "0,00";
      input.disabled = true;
    }
    row?.classList.add("is-not-applicable");
    updateEVAreaPreview(actionButton.closest("#evForm"));
  }
  if (actionButton.dataset.saveMode) {
    const form = actionButton.closest("form");
    const hidden = form?.querySelector('[name="saveMode"]');
    if (hidden) hidden.value = actionButton.dataset.saveMode;
  }
  if (action === "clear-portfolio-filters") {
    portfolioQuickFilters = { query: "", tipoUnidade: "", regional: "", evStatus: "" };
    portfolioFilters = Object.fromEntries(Object.keys(portfolioFilters).map((key) => [key, ""]));
    render();
  }
  if (action === "clear-investment-plan-filters") {
    investmentPlanFilters = { query: "", etapa: "Projetos", status: "", regiao: "", dateFrom: "", dateTo: "" };
    render();
  }
  if (action === "close-modal" && event.target === actionButton) {
    if (actionButton.classList.contains("modal-backdrop") && actionButton.querySelector("form.modal-card")) {
      return;
    }
    workModalReturnMode = "";
    closeModal();
  }
  if (action === "add-discipline-row") {
    document.querySelector("#disciplineRows").insertAdjacentHTML("beforeend", disciplineRowTemplate());
  }
  if (action === "remove-discipline-row") {
    const rows = document.querySelectorAll(".discipline-row");
    if (rows.length > 1) actionButton.closest(".discipline-row").remove();
  }
  if (action === "add-sic-draft-row") {
    actionButton.closest(".sic-draft-editor")?.querySelector("[data-sic-draft-rows]")?.insertAdjacentHTML("beforeend", sicDraftDisciplineRowTemplate());
  }
  if (action === "remove-sic-draft-row") {
    const editor = actionButton.closest(".sic-draft-editor");
    const rows = editor?.querySelectorAll(".sic-draft-row") || [];
    if (rows.length > 1) actionButton.closest(".sic-draft-row")?.remove();
  }
  if (action === "approve-sic-demand") {
    approveSicDemand(actionButton.dataset.id);
    return;
  }
  if (action === "reject-sic-demand") {
    rejectSicDemand(actionButton.dataset.id);
    return;
  }
  if (action === "approve-sic") approveSic(actionButton.dataset.id);
  if (action === "move-demand") {
    moveDemand(actionButton.dataset.id, Number(actionButton.dataset.direction));
    if (actionButton.closest(".demand-modal-card")) openDemandDetailModal(actionButton.dataset.id);
  }
  if (action === "open-work-ev") {
    selectedWorkId = actionButton.dataset.id;
    closeModal();
    setView("ev");
  }
  if (action === "open-project-plan-detail") {
    openProjectPlanDetail(actionButton.dataset.row);
    return;
  }
  if (action === "select-ev-work") {
    selectedWorkId = actionButton.dataset.id;
    evAssistantQuery = "";
    render();
  }
  if (action === "select-sic-work") {
    const work = workById(actionButton.dataset.id);
    const form = actionButton.closest("form");
    const input = form?.querySelector("[data-sic-work-search]");
    const hidden = form?.querySelector('[name="obraId"]');
    const results = form?.querySelector("[data-sic-work-results]");
    const workCode = form?.querySelector("[data-sic-work-code]");
    const workName = form?.querySelector("[data-sic-work-name]");
    if (work && input && hidden) {
      input.value = workOptionLabel(work);
      hidden.value = work.id;
      if (workCode) workCode.value = work.chaveUnica || work.codigoOriginal || "";
      if (workName) workName.value = work.nome || "";
      if (results) results.innerHTML = renderSicWorkSearchResults(input.value, work.id);
      const errorBox = form.querySelector("#formError");
      if (errorBox) errorBox.classList.remove("is-visible");
    }
  }
  if (action === "select-maintenance-unit") {
    const unit = maintenanceUnitById(actionButton.dataset.id);
    const form = actionButton.closest("form");
    const input = form?.querySelector("[data-maintenance-unit-search], [data-demand-unit-search], [data-work-unit-search]");
    const hidden = form?.querySelector('[name="unidadeId"]');
    const results = form?.querySelector("[data-maintenance-unit-results], [data-demand-unit-results], [data-work-unit-results]");
    if (unit && input && hidden) {
      input.value = sharedUnitSearchLabel(unit);
      hidden.value = unit.id;
      if (form?.id === "workForm") applyUnitToWorkForm(form, unit);
      if (results) results.innerHTML = maintenanceUnitSearchResults(input.value, unit.id);
      const errorBox = form.querySelector("#formError");
      if (errorBox) errorBox.classList.remove("is-visible");
    }
  }
  if (action === "reset-demo") {
    state = clone(baseState);
    selectedWorkId = state.works[0]?.id || "";
    saveState();
    showToast("Base Orçamento 360 restaurada.");
    render();
  }
});

document.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest("[data-haptec-drag-handle]");
  if (!handle || event.target.closest(".haptec-header-actions, .haptec-form")) return;
  const assistant = handle.closest(".haptec-assistant");
  if (!assistant) return;
  const rect = assistant.getBoundingClientRect();
  haptecDragState = {
    assistant,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: rect.left,
    originY: rect.top,
    moved: false,
  };
  assistant.classList.add("is-dragging");
  handle.setPointerCapture?.(event.pointerId);
});

document.addEventListener("pointermove", (event) => {
  if (!haptecDragState) return;
  const dx = event.clientX - haptecDragState.startX;
  const dy = event.clientY - haptecDragState.startY;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) haptecDragState.moved = true;
  haptecPosition = clampHaptecPosition({
    x: haptecDragState.originX + dx,
    y: haptecDragState.originY + dy,
  });
  haptecDragState.assistant.style.left = `${haptecPosition.x}px`;
  haptecDragState.assistant.style.top = `${haptecPosition.y}px`;
  haptecDragState.assistant.style.right = "auto";
  haptecDragState.assistant.style.bottom = "auto";
});

document.addEventListener("pointerup", () => {
  if (!haptecDragState) return;
  haptecDragState.assistant.classList.remove("is-dragging");
  if (haptecDragState.moved) {
    haptecSuppressToggleClick = true;
    saveHaptecPosition(haptecPosition);
    setTimeout(() => {
      haptecSuppressToggleClick = false;
    }, 260);
  }
  haptecDragState = null;
});

document.addEventListener("keydown", (event) => {
  if (isTextEditingTarget(event.target)) return;
  const moduleCard = event.target.closest('[role="button"][data-view], [role="button"][data-action]');
  if (!moduleCard || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  if (moduleCard.dataset.view) setView(moduleCard.dataset.view);
  else moduleCard.click();
});

function isTextEditingTarget(target) {
  if (!target || target.nodeType !== 1) return false;
  const tagName = target.tagName;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tagName)) return true;
  return Boolean(target.closest?.('[contenteditable="true"], [contenteditable=""]'));
}

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-strategic-history-filter]")) {
    const key = event.target.dataset.strategicHistoryFilter;
    if (Object.prototype.hasOwnProperty.call(strategicHistoricalFilters, key)) {
      strategicHistoricalFilters[key] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches('[name="perfil"]') && event.target.closest("#userForm")) {
    const form = event.target.closest("#userForm");
    const defaults = new Set(defaultAccessModulesForProfile(event.target.value));
    form.querySelectorAll('input[name="accessModules"]').forEach((input) => {
      input.checked = defaults.has(input.value);
    });
    return;
  }
  if (event.target.matches("[data-project-demand-type]")) {
    openProjectDemandModal(event.target.value);
    return;
  }
  if (event.target.matches('[data-action="select-work"]')) {
    selectedWorkId = event.target.value;
    render();
  }
  if (event.target.matches('[data-action="update-demand-status"]')) {
    const demand = updateDemandColumn(event.target.dataset.id, event.target.value);
    if (demand === false) return;
    const box = event.target.closest(".demand-status-box");
    if (box && demand) box.dataset.status = demand.coluna;
    render();
    if (demand) showToast(`Card movido para ${demandStatusLabel(demand)}.`);
  }
  if (event.target.matches('[data-action="update-demand-sprint"]')) {
    const demand = state.demands.find((item) => item.id === event.target.dataset.id);
    if (!demand) return;
    const previousSprint = demand.sprintId || "";
    const nextSprint = event.target.value || currentSprint()?.id || "";
    if (previousSprint === nextSprint) return;
    demand.sprintId = nextSprint;
    addHistory({
      entidade: "demanda",
      entidadeId: demand.id,
      campo: "sprint",
      valorAnterior: sprintById(previousSprint)?.nome || "Sem sprint",
      valorNovo: sprintById(nextSprint)?.nome || "Sem sprint",
    });
    saveState();
    render();
    openDemandDetailModal(demand.id);
    showToast(`Sprint do card atualizada para ${sprintById(nextSprint)?.nome || "Sem sprint"}.`);
  }
  if (event.target.matches('[data-action="update-maintenance-status"]')) {
    const item = updateMaintenanceDemandPhase(event.target.dataset.id, event.target.value);
    if (item === false) return;
    const box = event.target.closest(".demand-status-box");
    if (box && item) box.dataset.status = item.coluna;
    render();
    if (item) showToast(`Card movido para ${maintenanceStatusLabel(item)}.`);
  }
  if (event.target.matches('[data-action="update-maintenance-sprint"]')) {
    const item = maintenanceItems().find((entry) => entry.id === event.target.dataset.id);
    if (!item) return;
    const previousSprint = maintenanceSprintName(item);
    const nextSprint = sprintById(event.target.value);
    const nextSprintName = nextSprint?.nome || "Sem sprint";
    if (maintenanceSprintId(item) === (nextSprint?.id || "") && previousSprint === nextSprintName) return;
    item.sprintId = nextSprint?.id || "";
    item.sprint = nextSprintName;
    item.updatedAt = TODAY_ISO;
    item.historico = [
      ...(item.historico || []),
      { fase: "Sprint", data: TODAY_ISO, observacao: `Sprint alterada de ${previousSprint} para ${nextSprintName}.` },
    ];
    addHistory({
      entidade: maintenanceModuleLabels().isClinical ? "clinica" : "manutencao",
      entidadeId: item.id,
      campo: "sprint",
      valorAnterior: previousSprint,
      valorNovo: nextSprintName,
    });
    saveState();
    render();
    openMaintenanceCardModal(item.id);
    showToast(`Sprint do card atualizada para ${nextSprintName}.`);
  }
  if (event.target.matches("[data-maintenance-expense-select]")) {
    syncMaintenanceNegotiatedField(event.target.closest("form"));
  }
  if (event.target.matches('[data-action="contract-work-select"]')) {
    const select = document.querySelector("#contractDisciplineSelect");
    if (select) select.innerHTML = contractDisciplineOptions(event.target.value);
  }
  if (event.target.matches('[data-action="assign-analyst"]')) {
    const demand = state.demands.find((item) => item.id === event.target.dataset.id);
    if (!demand) return;
    const previous = demand.analistaResponsavel || "A definir";
    demand.analistaResponsavel = event.target.value;
    addHistory({
      entidade: "demanda",
      entidadeId: demand.id,
      campo: "analistaResponsavel",
      valorAnterior: previous,
      valorNovo: demand.analistaResponsavel || "A definir",
    });
    saveState();
    render();
  }
  if (event.target.matches("[data-operational-filter]")) {
    operationalFilters[event.target.dataset.operationalFilter] = event.target.value;
    render();
  }
  if (event.target.matches("[data-project-plan-filter]")) {
    projectPlanFilters[event.target.dataset.projectPlanFilter] = event.target.value;
    render();
  }
  if (event.target.matches("[data-project-operational-filter]")) {
    projectOperationalFilters[event.target.dataset.projectOperationalFilter] = event.target.value;
    render();
  }
  if (event.target.matches("[data-maintenance-filter]")) {
    const filters = maintenanceFiltersForActiveModule();
    filters[event.target.dataset.maintenanceFilter] = event.target.value;
    render();
  }
  if (event.target.matches("[data-budget-filter]")) {
    budgetFilters[event.target.dataset.budgetFilter] = event.target.value;
    budgetTransferCheck = null;
    render();
  }
  if (event.target.matches("[data-transfer-month-filter]")) {
    transferMonthFilter = event.target.value;
    transferAllPage = 1;
    transferNetPage = 1;
    render();
  }
  if (event.target.matches("[data-portfolio-quick-filter]")) {
    portfolioQuickFilters[event.target.dataset.portfolioQuickFilter] = event.target.value;
    render();
  }
  if (event.target.matches("[data-investment-plan-filter]")) {
    investmentPlanFilters[event.target.dataset.investmentPlanFilter] = event.target.value;
    render();
  }
  if (event.target.matches("[data-ev-history-filter]")) {
    evHistoricalFilters[event.target.dataset.evHistoryFilter] = event.target.value;
    render();
  }
  if (event.target.matches("[data-slt-incc-period]")) {
    sltINCCCalculator.basePeriod = event.target.value;
    updateSLTINCCResults();
  }
  if (event.target.matches(".ev-status-select")) {
    const row = event.target.closest(".ev-line-row");
    const input = row?.querySelector(".ev-value-input");
    const isNA = event.target.value === "Não se aplica";
    event.target.dataset.status = event.target.value;
    row?.classList.toggle("is-not-applicable", isNA);
    if (input) {
      input.disabled = isNA;
      if (isNA) input.value = "0,00";
    }
    updateEVAreaPreview(event.target.closest("#evForm"));
  }
  if (event.target.matches("[data-filter-field]")) {
    portfolioFilters[event.target.dataset.filterField] = event.target.value;
    render();
  }
});

let lastNativeValidationNotice = { key: "", at: 0 };

document.addEventListener(
  "invalid",
  (event) => {
    const field = event.target;
    const form = field?.closest?.("form");
    if (!form || form.id === "haptecForm") return;
    event.preventDefault();
    const key = `${form.id || "form"}:${field.name || field.id || field.tagName}`;
    const now = Date.now();
    if (lastNativeValidationNotice.key === key && now - lastNativeValidationNotice.at < 900) return;
    lastNativeValidationNotice = { key, at: now };
    showFormError(nativeValidationMessage(field), form);
    field.classList.add("is-field-alert");
    setTimeout(() => field.classList.remove("is-field-alert"), 2200);
    setTimeout(() => field.focus?.({ preventScroll: false }), 0);
  },
  true
);

function syncMaintenanceNegotiatedField(form) {
  if (!form) return;
  const select = form.querySelector("[data-maintenance-expense-select]");
  const field = form.querySelector("[data-maintenance-negotiated-field]");
  const input = field?.querySelector('input[name="valorNegociado"]');
  const show = normalizeSearchText(select?.value || "").includes("capex");
  if (field) field.hidden = !show;
  if (input) {
    input.disabled = !show;
    if (!show) input.value = "";
  }
}

function hasDemandSubmitFields(form) {
  if (!form || form.tagName !== "FORM") return false;
  return demandFormQueryKeys.some((key) => Boolean(form.elements?.[key]));
}

document.addEventListener("submit", async (event) => {
  if (event.target.id === "loginForm") {
    event.preventDefault();
    const email = event.target.elements?.email?.value || "";
    const senha = event.target.elements?.senha?.value || "";
    if (!loginWithCredentials(email, senha)) {
      showFormError("E-mail ou senha inválidos. Confira o cadastro em Configuração.", event.target);
      return;
    }
    showToast(`Bem-vindo ao SLT 360, ${currentUser()?.nome || "usuário"}.`);
    render();
  }
  if (event.target.id === "firstAccessPasswordForm") {
    event.preventDefault();
    handleFirstAccessPasswordSubmit(event.target);
  }
  if (event.target.id === "haptecForm") {
    event.preventDefault();
    const question = event.target.elements?.question?.value || "";
    event.target.reset();
    handleHaptecQuestion(question);
  }
  if (event.target.id === "workForm") {
    event.preventDefault();
    handleWorkSubmit(event.target);
  }
  if (event.target.id === "evForm") {
    event.preventDefault();
    const mode = event.submitter?.dataset.saveMode || event.target.querySelector('[name="saveMode"]')?.value || "final";
    await handleEVSubmit(event.target, mode);
  }
  if (event.target.id === "evTypologyForm") {
    event.preventDefault();
    handleEVTypologySubmit(event.target);
  }
  if (event.target.id === "sprintForm" || event.target.id === "sprintInlineForm") {
    event.preventDefault();
    handleSprintSubmit(event.target);
  }
  if (event.target.id === "userForm") {
    event.preventDefault();
    handleUserSubmit(event.target);
  }
  if (event.target.id === "demandWizardStep1") {
    event.preventDefault();
    handleDemandWizardStep1(event.target);
  }
  if (event.target.id === "demandForm") {
    event.preventDefault();
    await handleDemandSubmit(event.target);
  }
  if (event.target.id === "projectDemandForm") {
    event.preventDefault();
    handleProjectDemandSubmit(event.target);
  }
  if (event.target.id === "demandDetailForm") {
    event.preventDefault();
    await handleDemandDetailSubmit(event.target);
  }
  if (event.target.id === "deleteDemandForm") {
    event.preventDefault();
    handleDeleteDemandSubmit(event.target);
  }
  if (event.target.id === "maintenanceDemandForm") {
    event.preventDefault();
    handleMaintenanceDemandSubmit(event.target);
  }
  if (event.target.id === "maintenanceDetailForm") {
    event.preventDefault();
    handleMaintenanceDetailSubmit(event.target);
  }
  if (event.target.id === "contractForm") {
    event.preventDefault();
    handleContractSubmit(event.target);
  }
  if (!event.defaultPrevented && hasDemandSubmitFields(event.target)) {
    event.preventDefault();
    showToast("Envio protegido: revise o modal e use o botão de salvar novamente.");
  }
});

document.querySelector("#globalSearch").addEventListener("input", (event) => {
  if (!isAuthenticated()) return;
  searchTerm = event.target.value;
  if (["dashboard", "team", "reports", "kanban", "worksOperational", "portfolio", "investmentPlan", "ev", "budget", ...projectViewIds, ...maintenanceViewIds, ...clinicalViewIds].includes(currentView)) render();
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-slt-incc-value]")) {
    sltINCCCalculator.value = parseCurrency(event.target.value);
    updateSLTINCCResults();
    return;
  }
  if (event.target.matches("[data-ev-haptec-check]")) {
    const overlay = event.target.closest("[data-ev-haptec-confirm]");
    const button = overlay?.querySelector('[data-action="confirm-ev-deviation-save"]');
    if (button) button.disabled = !event.target.checked;
    overlay?.querySelector("[data-ev-haptec-hint]")?.classList.toggle("is-confirmed", event.target.checked);
    return;
  }
  if (event.target.matches("[data-ev-history-search]")) {
    const value = event.target.value;
    evHistoricalFilters.query = value;
    render();
    const nextInput = document.querySelector("[data-ev-history-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-strategic-history-search]")) {
    const value = event.target.value;
    strategicHistoricalQuery = value;
    render();
    const nextInput = document.querySelector("[data-strategic-history-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-ev-area-input], .ev-value-input")) {
    updateEVAreaPreview(event.target.closest("#evForm"));
    return;
  }
  if (event.target.matches("[data-kpi-modal-search]")) {
    const terms = normalizeSearchText(event.target.value).split(/\s+/).filter(Boolean);
    const rows = [...document.querySelectorAll("[data-kpi-row]")];
    let visible = 0;
    rows.forEach((row) => {
      const text = normalizeSearchText(row.textContent);
      const matches = !terms.length || terms.every((term) => text.includes(term));
      row.hidden = !matches;
      if (matches) visible += 1;
    });
    const counter = document.querySelector("[data-kpi-result-count]");
    if (counter) counter.textContent = `Mostrando ${visible} de ${rows.length} registros.`;
    return;
  }
  if (event.target.matches("[data-ev-assistant-search]")) {
    const value = event.target.value;
    evAssistantQuery = value;
    selectedWorkId = "all";
    render();
    const nextInput = document.querySelector("[data-ev-assistant-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-sic-work-search]")) {
    updateSicWorkSearch(event.target);
    return;
  }
  if (event.target.matches("[data-portfolio-search]")) {
    const value = event.target.value;
    portfolioQuickFilters.query = value;
    render();
    const nextInput = document.querySelector("[data-portfolio-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-investment-plan-search]")) {
    const value = event.target.value;
    investmentPlanFilters.query = value;
    render();
    const nextInput = document.querySelector("[data-investment-plan-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-project-plan-search]")) {
    const value = event.target.value;
    projectPlanFilters.query = value;
    render();
    const nextInput = document.querySelector("[data-project-plan-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-project-operational-search]")) {
    const value = event.target.value;
    projectOperationalFilters.query = value;
    render();
    const nextInput = document.querySelector("[data-project-operational-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-operational-search]")) {
    const value = event.target.value;
    operationalFilters.query = value;
    render();
    const nextInput = document.querySelector("[data-operational-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-maintenance-search]")) {
    const value = event.target.value;
    maintenanceFiltersForActiveModule().query = value;
    render();
    const nextInput = document.querySelector("[data-maintenance-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-budget-search]")) {
    const value = event.target.value;
    budgetFilters.query = value;
    budgetTransferCheck = null;
    render();
    const nextInput = document.querySelector("[data-budget-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-transfer-tracker-search]")) {
    const value = event.target.value;
    transferTrackerQuery = value;
    render();
    const nextInput = document.querySelector("[data-transfer-tracker-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-transfer-tracker-search2]")) {
    const value = event.target.value;
    transferTrackerQuery2 = value;
    render();
    const nextInput = document.querySelector("[data-transfer-tracker-search2]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-transfer-all-search]")) {
    const value = event.target.value;
    transferAllSearch = value;
    transferAllPage = 1;
    render();
    const nextInput = document.querySelector("[data-transfer-all-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-transfer-net-search]")) {
    const value = event.target.value;
    transferNetSearch = value;
    transferNetPage = 1;
    render();
    const nextInput = document.querySelector("[data-transfer-net-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-clinical-equipment-search]")) {
    const value = event.target.value;
    clinicalFilters.equipment = value;
    render();
    const nextInput = document.querySelector("[data-clinical-equipment-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-maintenance-unit-search]")) {
    updateMaintenanceUnitSearch(event.target);
    return;
  }
  if (event.target.matches("[data-demand-unit-search]")) {
    updateDemandUnitSearch(event.target);
    return;
  }
  if (event.target.matches("[data-work-unit-search]")) {
    updateWorkUnitSearch(event.target);
    return;
  }
  if (event.target.matches("[data-sic-search]")) {
    const value = event.target.value;
    sicSearchQuery = value;
    render();
    const nextInput = document.querySelector("[data-sic-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (!event.target.matches("[data-filter-field]")) return;
  const field = event.target.dataset.filterField;
  const value = event.target.value;
  portfolioFilters[field] = value;
  render();
  const nextInput = document.querySelector(`[data-filter-field="${field}"]`);
  if (nextInput) {
    nextInput.focus();
    nextInput.setSelectionRange(value.length, value.length);
  }
});

render();

