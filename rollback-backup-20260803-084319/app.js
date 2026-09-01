const STORAGE_KEY = "slt360-state-v6-historico";

const MIRO_FLOW_URL = "https://miro.com/app/board/uXjVKxg3MFc=/";
const TODAY_ISO = "2026-08-03";
const INVESTMENT_PLAN_YEAR = "2026";

const viewAliases = {
  worksPortfolio: "portfolio",
  worksHistory: "portfolio",
  worksIntelligence: "worksManagement",
  worksOverview: "worksHome",
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

const maintenanceColumns = [
  { id: "naoIniciado", label: "Não iniciada", tone: "blue", pipefy: ["NÃO INICIADO", "NAO INICIADO"] },
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
  works: {
    eyebrow: "Módulo 01",
    label: "Obras 360",
    logo: "assets/module-icon-obras.png",
    tone: "blue",
  },
  maintenance: {
    eyebrow: "Módulo 02",
    label: "Manutenção 360",
    logo: "assets/module-icon-manutencao.png",
    tone: "orange",
  },
  clinical: {
    eyebrow: "Módulo 03",
    label: "Eng. Clínica 360",
    logo: "assets/module-icon-clinica.png",
    tone: "green",
  },
  budget: {
    eyebrow: "Módulo 04",
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
    description: "Acesso operacional às obras, EVs, sprints e SICs sem Controle de Verbas.",
    blockedViews: ["budget"],
  },
};

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
    { id: "usr-admin", nome: "Administrador SLT", email: "admin.slt@hapvida.com.br", perfil: "Admin", status: "Ativo" },
    { id: "usr-gestao", nome: "Gestão Sala Técnica", email: "gestao.slt@hapvida.com.br", perfil: "Gestão", status: "Ativo" },
    { id: "usr-analista", nome: "Analista Obras", email: "analista.obras@hapvida.com.br", perfil: "Analista", status: "Ativo" },
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
let evShowNotApplicable = false;
let evAssistantQuery = "";
let sicViewMode = "report";
let sicSearchQuery = "";
let dashboardReportsFilter = "active";
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
      console.info("Base de Obras atualizada; estado local anterior ignorado.", {
        anterior: parsed.importSignature || "sem assinatura",
        atual: baseState.importSignature,
      });
    }
  } catch (error) {
    console.warn("Não foi possível carregar estado local.", error);
  }
  return clone(baseState);
}

function normalizeState(saved) {
  const base = clone(baseState);
  return {
    ...base,
    ...saved,
    works: saved.works || base.works,
    demands: saved.demands || base.demands,
    sics: saved.sics || base.sics,
    contracts: saved.contracts || base.contracts,
    suppliers: saved.suppliers || base.suppliers,
    users: saved.users || base.users,
    maintenanceDemands: normalizeMaintenanceFinancials(mergeMaintenanceDemands(saved.maintenanceDemands || [], base.maintenanceDemands || [])),
    activeRole: saved.activeRole || base.activeRole || "Gestão",
    deletedDemands: saved.deletedDemands || base.deletedDemands || [],
    deletedMaintenanceDemands: saved.deletedMaintenanceDemands || base.deletedMaintenanceDemands || [],
    sprints: saved.sprints || base.sprints,
    sicBi: saved.sicBi || base.sicBi || { records: [], demandSummary: [] },
    investmentPlan: base.investmentPlan || { source: "", sheet: "", records: [] },
    unitRegistry: base.unitRegistry || { source: "", sheet: "", records: [] },
    maintenanceBi: base.maintenanceBi || { source: "", sheet: "", records: [] },
    history: saved.history || base.history,
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
  const { sicBi, investmentPlan, unitRegistry, maintenanceBi, ...persistedState } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
}

function money(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value || 0);
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
    const rawPhase = importedText(recordValue(record, ["Fase atual", "FASE ATUAL", "Status"]), "NÃO INICIADO");
    const phase = normalizeMaintenancePhase(rawPhase);
    const unitName = importedText(recordValue(record, ["NOME DA UNIDADE", "UNIDADE"]), "Unidade não informada");
    const workName = importedText(recordValue(record, ["NOME DA OBRA", "OBRA"]), unitName);
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
      unidadeId: "",
      tipologia: importedText(recordValue(record, ["TIPOLOGIA"]), "Não informada"),
      uf: importedText(recordValue(record, ["ESTADO DA UNIDADE", "UF"]), ""),
      estado: importedText(recordValue(record, ["ESTADO"]), ""),
      regiao: importedText(recordValue(record, ["REGIÃO", "REGIÃO 2"]), ""),
      regional: importedText(recordValue(record, ["REGIONAL"]), ""),
      cnpj: "",
      endereco: "",
      cep: "",
      requisicaoCompra: code && code !== "S/CÓDIGO" ? code : "",
      centroCusto: importedText(recordValue(record, ["CENTRO DE CUSTO"]), "Manutenção predial"),
      tipoDemanda: "Normal",
      tipoDespesa,
      coluna: phase,
      fasePipefy: rawPhase,
      dataInicio: createdAt,
      dataFim: finishedAt,
      dataPrevistaEntrega: finishedAt || "",
      valorProposta: parseImportedNumber(recordValue(record, ["VALOR DA PROPOSTA INICIAL", "VALOR PROPOSTA INICIAL", "PROPOSTA INICIAL", "VALOR DA PROPOSTA"])),
      valorSalaTecnica: parseImportedNumber(recordValue(record, ["VALOR SALA TECNICA", "VALOR SALA TÉCNICA"])),
      valorNegociado: isOpex ? 0 : parseImportedNumber(recordValue(record, ["VALOR NEGOCIADO"])),
      sprint: importedText(recordValue(record, ["SPRINT"]), "Sem sprint"),
      planejamento: importedText(recordValue(record, ["DESCRIÇÃO CENTRO FINANCEIRO", "PLANEJAMENTO"]), ""),
      observacoes: "",
      analistaResponsavel: "",
      prioridade: phase === "devolvido" ? "Alta" : "Média",
      phaseStartedAt: phase === "naoIniciado" ? createdAt : finishedAt || createdAt,
      createdAt,
      updatedAt: finishedAt || createdAt,
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
  const lines = work?.ev?.lines || [];
  const totals = lines.reduce(
    (total, line) => {
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
  const fallbackValue = !hasDetailedEV ? plannedWorkValue(work) : 0;
  if (fallbackValue > 0) {
    totals.orcado += fallbackValue;
    totals.saldo += fallbackValue;
  }
  return totals;
}

function plannedWorkValue(work) {
  return Number(work?.plannedValue ?? work?.valorAprovado ?? work?.capexAprovado ?? 0) || 0;
}

function workBudgetValue(work) {
  const values = workTotals(work);
  return values.orcado + values.aditivado;
}

function strategicCostTargetForWork(work) {
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

function strategicCostReadingForWork(work) {
  const target = strategicCostTargetForWork(work);
  const value = workBudgetValue(work);
  const area = work.areaEquivalente || 0;
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
    status: "Sem leitura",
  }));

  state.works.forEach((work) => {
    const reading = strategicCostReadingForWork(work);
    if (!reading.target) return;
    const row = grouped.find((item) => item.id === reading.target.id);
    if (!row) return;
    row.works.push(work);
    row.readings.push(reading);
    row.capex += reading.value;
    row.area += reading.area;
  });

  grouped.forEach((row) => {
    const measuredReadings = row.readings.filter((reading) => reading.measured);
    row.measuredCount = measuredReadings.length;
    row.aboveCount = measuredReadings.filter((reading) => reading.aboveTarget).length;
    row.belowRangeCount = measuredReadings.filter((reading) => reading.belowRange).length;
    row.withinCount = measuredReadings.filter((reading) => !reading.aboveTarget).length;
    row.costM2 = row.area ? row.capex / row.area : 0;
    row.adherence = row.measuredCount ? (row.withinCount / row.measuredCount) * 100 : 0;
    row.status = !row.measuredCount ? "Sem leitura" : row.costM2 > row.targetMax ? "Acima da meta" : row.targetMin && row.costM2 < row.targetMin ? "Abaixo da faixa" : "Dentro da meta";
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
  return state.works
    .map(strategicCostReadingForWork)
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
  const highest = collection.reduce((max, item) => {
    const numeric = Number(String(item.id).replace(`${prefix}-`, ""));
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
    ["Código", "Tipo", "Obra", "Código obra", "Analista", "Sprint", "Status", "Prioridade", "Início previsto", "Entrega prevista", "Entrega real", "Prazo", "Nº LECOM", "Título SIC", "Valor EV", "Observação"],
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
    item.sprint || "",
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
  return state.activeRole || "Gestão";
}

function canAccessView(view) {
  const blockedViews = roleDefinitions[activeRole()]?.blockedViews || [];
  return !blockedViews.includes(view);
}

function applyRolePermissions() {
  const role = activeRole();
  document.querySelectorAll('[data-view="budget"]').forEach((element) => {
    element.hidden = !canAccessView("budget");
  });
  const chip = document.querySelector(".user-chip");
  if (chip) chip.textContent = role === "Gestão" ? "Coordenação ST" : `${role} ST`;
  const headerSearch = document.querySelector(".header-actions .search-box");
  const headerNewDemand = document.querySelector('.header-actions [data-action="open-demand"], .header-actions [data-action="open-global-demand"]');
  if (headerSearch) headerSearch.hidden = false;
  if (headerNewDemand) headerNewDemand.hidden = false;
}

function setView(view) {
  if (view === "investmentPlan") view = "portfolio";
  view = viewAliases[view] || view;
  if (!canAccessView(view)) {
    showToast("Perfil Analista não possui acesso ao Controle de Verbas.");
    view = "dashboard";
  }
  currentView = view;
  document.querySelectorAll("[data-view]").forEach((button) => {
    const isTopWorks = button.dataset.module === "works" && worksViewIds.includes(view);
    const isTopMaintenance = button.dataset.module === "maintenance" && maintenanceViewIds.includes(view);
    const isTopClinical = button.dataset.module === "clinical" && clinicalViewIds.includes(view);
    const aliasedButtonView = viewAliases[button.dataset.view] || button.dataset.view;
    button.classList.toggle("is-active", aliasedButtonView === view || isTopWorks || isTopMaintenance || isTopClinical);
  });
  render();
}

function render() {
  if (!canAccessView(currentView)) currentView = "dashboard";
  const views = {
    dashboard: renderDashboard,
    team: renderTeam,
    worksHome: renderWorksHome,
    worksOperational: renderWorksOperational,
    worksManagement: renderWorksManagement,
    worksStrategic: renderWorksStrategic,
    worksSettings: renderWorksSettings,
    kanban: renderWorksOperational,
    portfolio: renderPortfolio,
    investmentPlan: renderPortfolio,
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

function haptecCurrentContext() {
  if (currentView === "dashboard") return "Início";
  if (["portfolio", "investmentPlan"].includes(currentView)) return "Portfólio";
  if (["worksOperational", "kanban"].includes(currentView)) return "Operacional de Obras";
  if (currentView === "worksManagement") return "Gerencial de Obras";
  if (currentView === "worksStrategic") return "Estratégica de Obras";
  if (currentView === "ev") return "EV";
  if (currentView === "sics") return "SICs";
  if (currentView === "maintenanceOperational") return "Operacional de Manutenção";
  if (maintenanceViewIds.includes(currentView)) return "Manutenção 360";
  if (currentView === "clinical") return "Engenharia Clínica";
  if (currentView === "budget") return "Controle de Verbas";
  return "SLT 360";
}

function haptecWelcomeText() {
  return `${haptecGreeting()}! Sou o Haptec360, seu guia da Sala Técnica. Estou aqui para te levar direto ao ponto: módulos, filtros, EVs, SICs, Kanban e indicadores. Você está em ${haptecCurrentContext()}.`;
}

function haptecViewHelp() {
  if (currentView === "dashboard") {
    return "Na tela inicial você escolhe o módulo principal: Obras 360, Manutenção 360, Eng. Clínica 360 ou Controle de Verbas 360. É o hall de entrada do sistema, limpo e executivo.";
  }
  if (["portfolio", "investmentPlan"].includes(currentView)) {
    return "No Portfólio ficam as obras do plano de investimento 2026. Use a busca e filtros para localizar a obra, abrir o EV, editar cadastro ou criar uma demanda de orçamento.";
  }
  if (["worksOperational", "kanban"].includes(currentView)) {
    return "No Operacional de Obras você acompanha a esteira em Kanban ou lista. Caminho rápido: filtre a sprint ou analista, clique no card, atualize status e confira EV antes de concluir.";
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
    "Obras 360: portfólio, plano 2026, EV, orçamentação, SICs, visão operacional, gerencial e estratégica.",
    "Manutenção 360: OS, unidades, Kanban Pipefy, SLA, lead time, valores e saving técnico.",
    "Eng. Clínica 360: parque tecnológico, ativos, OS e demandas assistenciais.",
    "Controle de Verbas 360: FEL, verba aportada, EV, contratação, risco, aditivos e SICs."
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
  if (!top) return "Ainda não encontrei EV com valor preenchido. O caminho é Obras 360 > EV > Abrir EV e preencher as disciplinas.";
  const area = top.work.areaEquivalente || top.work.areaConstruida || 0;
  const costM2 = area ? top.value / area : 0;
  return [
    `A obra com maior valor de EV hoje é ${top.work.nome}.`,
    `Valor do EV: ${money(top.value)}.`,
    `${top.work.regiao || "Sem região"} | ${top.work.tipoUnidade || "Sem tipologia"}${costM2 ? ` | ${money(costM2)}/m²` : ""}.`
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
  return operationalActiveFilterText() ? "no filtro atual do Operacional de Obras" : "na esteira de Obras";
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
    return `Cards de Obras por analista ${scope}:\n${haptecRowsText(rows, (value) => `${value} card(s)`)}.`;
  }

  if (haptecHasAny(text, ["obra com mais", "mais cards", "maior fila", "mais demandas"])) {
    const rows = haptecCountBy(active, (item) => workById(item.obraId)?.nome || "Obra não vinculada");
    return `Obras com mais cards ativos ${scope}:\n${haptecRowsText(rows, (value) => `${value} card(s)`)}.`;
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
    return `${late.length} card(s) de Obras estão em atraso ${scope}.${sample ? ` Principais: ${sample}.` : ""}`;
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

  return `Resumo do Kanban de Obras ${scope}: ${items.length} card(s), ${active.length} ativo(s), ${doing.length} em andamento, ${validation.length} aguardando validação e ${late.length} em atraso.`;
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
    "Quantos cards estão em andamento no Kanban de Obras?",
    "Quantos cards de Obras estão em atraso?",
    "Quantos cards aguardam validação?",
    "Qual analista tem mais cards em Obras?",
    "Qual obra tem mais cards ativos?",
    "Qual a obra com o maior valor de EV hoje?",
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
    "Quais obras estão acima da meta de custo por m²?"
  ];
}

function haptecQuestionBankAnswer() {
  return `Posso responder perguntas como:\n${haptecQuestionSuggestions()
    .slice(0, 12)
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n")}`;
}

function haptecAnswer(question = "") {
  const text = normalizeSearchText(question);
  const operationalQuestion = haptecHasAny(text, ["kanban", "kamban", "card", "cards", "esteira", "bucket", "coluna", "fazendo", "andamento", "atras", "validacao", "analista", "fase"]);
  if (!text || text.includes("explicar tela") || text.includes("ajuda")) return haptecViewHelp();
  if (haptecHasAny(text, ["perguntas", "o que voce sabe", "o que você sabe", "exemplos", "treinado"])) return haptecQuestionBankAnswer();
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
    return "Para criar demanda de Obras: Obras 360 > Operacional > + Nova demanda. Escolha Emissão Inicial, Revisão de Orçamento ou SIC, vincule a obra e salve para entrar na coluna inicial do Kanban.";
  }
  if (text.includes("sic")) return "Para SIC: Obras 360 > SICs ou Operacional > + Nova demanda > SIC. Preencha LECOM, obra, título, descrição, disciplinas e anexo. A postagem no EV leva os valores para a linha 32.";
  if (text.includes("verba") || text.includes("orcamento") || text.includes("custo")) return "Para verba/custo: Controle de Verbas 360 consolida aportes, EV, contratação e SICs. Em Obras, a visão Estratégica mostra CAPEX, metas por m² e maiores investimentos.";
  if (text.includes("kpi") || text.includes("indicador") || text.includes("relatorio")) return "Para indicadores: use as abas Gerencial, Estratégica, BI Manutenção ou Linha do Tempo. Os KPIs clicáveis abrem detalhes, para você sair do número e chegar na causa.";
  if (text.includes("filtro") || text.includes("buscar") || text.includes("pesquisar")) return "Use a busca principal da aba e combine com os selects. No Portfólio busque por obra/cidade; em Manutenção use OS, unidade, centro de custo ou tipologia; em EV use a busca assistida.";
  return "Entendi. Me diga se você quer achar uma obra, criar demanda, abrir EV, analisar SICs ou navegar para um módulo. Eu te passo o caminho mais curto.";
}

function renderHaptecMessage(message) {
  const paragraphs = String(message.text || "")
    .split("\n")
    .filter(Boolean)
    .map((line) => `<p>${escapeAttribute(line)}</p>`)
    .join("");
  return `<div class="haptec-message" data-role="${message.role}">${paragraphs}</div>`;
}

function addHaptecMessage(role, text) {
  haptecMessages = haptecMessages.concat({ role, text }).slice(-10);
}

function handleHaptecQuestion(question) {
  const text = String(question || "").trim();
  if (!text) return;
  addHaptecMessage("user", text);
  addHaptecMessage("bot", haptecAnswer(text));
  haptecOpen = true;
  render();
}

function renderHaptecRobot(extraClass = "") {
  return `
    <span class="haptec-robot ${extraClass}" aria-hidden="true">
      <span class="haptec-robot-ear is-left"></span>
      <span class="haptec-robot-ear is-right"></span>
      <span class="haptec-robot-head">
        <span class="haptec-robot-eye is-left"></span>
        <span class="haptec-robot-eye is-right"></span>
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
    showToast("Seu navegador não liberou voz para o Haptec360.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(String(text || "").replace(/\s+/g, " ").trim());
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
  return `
    <aside class="haptec-assistant ${haptecOpen ? "is-open" : ""}" aria-label="Haptec360 - assistente do SLT 360">
      <button class="haptec-launcher" type="button" data-action="toggle-haptec" aria-expanded="${haptecOpen ? "true" : "false"}">
        ${renderHaptecRobot("is-launcher")}
        <span>
          <strong>Haptec360</strong>
          <small>Guia SLT</small>
        </span>
      </button>
      ${
        haptecOpen
          ? `
            <section class="haptec-panel">
              <header>
                <div class="haptec-title">
                  ${renderHaptecRobot("is-panel")}
                  <div>
                    <strong>Haptec360</strong>
                    <small>${haptecCurrentContext()}</small>
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
                <div class="haptec-quick-actions">
                  <button type="button" data-action="haptec-ask" data-prompt="Explicar tela">Explicar tela</button>
                  <button type="button" data-action="haptec-ask" data-prompt="Qual a obra com o maior valor de EV hoje?">Maior EV</button>
                  <button type="button" data-action="haptec-ask" data-prompt="Quais perguntas você sabe responder?">Perguntas</button>
                  <button type="button" data-action="haptec-ask" data-prompt="Resumo do portfólio">Portfólio</button>
                  <button type="button" data-action="haptec-ask" data-prompt="Como criar nova demanda?">Nova demanda</button>
                  <button type="button" data-action="haptec-ask" data-prompt="Onde vejo KPIs e relatórios?">KPIs</button>
                </div>
                <details class="haptec-question-bank">
                  <summary>Perguntas inteligentes</summary>
                  <div>
                    ${haptecQuestionSuggestions()
                      .slice(0, 8)
                      .map((prompt) => `<button type="button" data-action="haptec-ask" data-prompt="${escapeAttribute(prompt)}">${prompt}</button>`)
                      .join("")}
                  </div>
                </details>
                <div class="haptec-shortcuts">
                  <button type="button" data-action="haptec-nav" data-target-view="portfolio">Obras</button>
                  <button type="button" data-action="haptec-nav" data-target-view="maintenanceOperational">Manutenção</button>
                  <button type="button" data-action="haptec-nav" data-target-view="ev">EV</button>
                  <button type="button" data-action="haptec-nav" data-target-view="sics">SICs</button>
                  <button type="button" data-action="haptec-nav" data-target-view="budget">Verbas</button>
                </div>
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
    <nav class="module-tabs" aria-label="Navegação interna de Obras">
      ${worksNavItems
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

function renderMaintenanceTabs(activeView) {
  return `
    <nav class="module-tabs" aria-label="Navegação interna de Manutenção">
      ${maintenanceNavItems
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
  const homeSummary = dashboardSummaryV6();
  const homeIndicators = homeSummary.indicators;
  const homeModules = moduleSummaries();
  const homeMemory = [
    { label: "Revisões cadastrais", value: state.workRevisions?.length || 0, detail: "Versões preservadas das obras" },
    { label: "Revisões de orçamento", value: state.budgetRevisions?.length || 0, detail: "Valores anteriores não são sobrescritos" },
    { label: "Contratos", value: state.contracts?.length || 0, detail: "Fornecedores e valores vinculados" },
    { label: "Documentos", value: state.documents?.length || 0, detail: "Arquivos e metadados históricos" },
  ];

  return `
    <section class="dashboard-hero dashboard-hero--memory">
      <div>
        <span class="eyebrow">Hapvida | Sala Técnica 360</span>
        <h1>Gestão atual e memória histórica das obras</h1>
        <p>Uma única base para coordenar a equipe, controlar as demandas e preservar permanentemente a trajetória técnica, financeira e contratual das obras da empresa.</p>
      </div>
      <div class="hero-actions">
        <button class="secondary-action" type="button" data-view="worksHistory">Consultar histórico</button>
        <button class="primary-action" type="button" data-action="open-global-demand">+ Nova demanda</button>
      </div>
    </section>

    <section class="kpi-grid dashboard-kpi-grid" aria-label="KPIs principais da Sala Técnica">
      ${dashboardKpi("Obras na carteira", String(homeSummary.activeWorks.length), "Registros em andamento", "blue", "worksPortfolio")}
      ${dashboardKpi("Obras históricas", String(homeSummary.historicalWorks.length), "Concluídas, canceladas ou arquivadas", "green", "worksHistory")}
      ${dashboardKpi("Investimento registrado", money(homeSummary.investment), "Melhor valor histórico disponível", "blue", "worksIntelligence")}
      ${dashboardKpi("Demandas ativas", String(homeIndicators.active.length), "Todos os módulos", "orange", "", "active")}
      ${dashboardKpi("Demandas atrasadas", String(homeIndicators.overdue.length), "Prazo previsto vencido", homeIndicators.overdue.length ? "red" : "green", "", "overdue")}
      ${dashboardKpi("Saldo disponível", money(homeSummary.availableBalance), "Verbas aprovadas menos comprometidas", "green", "fundsBalances")}
    </section>

    <section class="module-entry module-entry--home module-entry--executive" aria-label="Módulos do SLT 360">
      ${homeModules.map(renderModuleCard).join("")}
    </section>

    <div class="content-grid dashboard-bottom-grid">
      <section class="panel coordination-panel">
        <div class="panel-header">
          <div>
            <h2>Atenções da coordenação</h2>
            <p class="panel-subtitle">Prazos, dependências e bloqueios</p>
          </div>
        </div>
        ${renderCoordinationAttention(homeIndicators)}
      </section>

      <section class="panel corporate-memory-panel">
        <div class="panel-header">
          <div>
            <h2>Memória corporativa</h2>
            <p class="panel-subtitle">A base histórica cresce com cada alteração</p>
          </div>
        </div>
        <div class="memory-grid">
          ${homeMemory
            .map(
              (item) => `
                <article class="memory-card">
                  <strong>${number(item.value)} ${item.label.toLowerCase()}</strong>
                  <span>${item.detail}</span>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;

  return `
    <section class="dashboard-portal" aria-label="Entrada do SLT 360">
      <div>
        <span class="eyebrow">Hapvida | Sala Técnica de Engenharia</span>
        <h1>SLT 360</h1>
        <p>Escolha um módulo para acessar as visões operacionais, gerenciais e executivas da Sala Técnica.</p>
      </div>
    </section>

    <section class="module-entry module-entry--home" aria-label="Módulos do SLT 360">
      ${moduleSummaries().map(renderModuleCard).join("")}
    </section>
  `;

  const totals = allTotals();
  const totalCAPEX = totals.orcado + totals.aditivado;
  const pendingSics = state.sics.filter((sic) => sic.status === "Pendente").length;
  const modules = moduleSummaries();
  const criticalWorks = worksWithCriticalBalance();
  const completedEvs = state.works.filter((work) => work.ev.status === "Completo").length;
  const pendingEvWorks = state.works.filter((work) => work.ev.status !== "Completo");
  const activeDemands = pendingDemands();
  const delayed = overdueDemands();
  const regions = new Set(state.works.map((work) => work.regiao).filter(Boolean)).size;
  const contractRatio = (totals.contratado / Math.max(totalCAPEX, 1)) * 100;

  return `
    <section class="dashboard-hero">
      <div>
        <span class="eyebrow">Hapvida | Sala Técnica 360</span>
        <h1>Painel gerencial da Sala Técnica</h1>
        <p>Visão integrada dos módulos de Obras, Manutenção, Engenharia Clínica e Controle de Verbas, com foco em prazo, CAPEX, execução e risco.</p>
      </div>
      <div class="hero-actions">
        ${miroButton("Fluxos no Miro")}
        <button class="secondary-action" type="button" data-view="sics">BI de SICs</button>
        <button class="primary-action" type="button" data-action="open-demand">Nova demanda</button>
      </div>
    </section>

    <section class="module-entry" aria-label="Módulos da Sala Técnica">
      ${modules.map(renderModuleCard).join("")}
    </section>

    <section class="kpi-grid">
      ${kpi("Portfólio de obras", String(state.works.length), `${completedEvs} EVs completos | ${regions} regiões`, "blue", "portfolio")}
      ${kpi("CAPEX consolidado", money(totalCAPEX), "EVs sem taxa de risco + SICs aprovadas", "blue", "worksStrategic")}
      ${kpi("Esteira ativa", String(activeDemands.length), `${delayed.length} fora do prazo previsto`, delayed.length ? "red" : "green", "worksOperational")}
      ${kpi("Contratado", money(totals.contratado), `${number(contractRatio, 1)}% do CAPEX aprovado`, "green", "budget")}
      ${kpi("Saldo disponível", money(totals.saldo), "Verba aprovada menos contratações", "orange", "budget")}
      ${kpi("EVs pendentes", String(state.works.length - completedEvs), "Rascunho ou cotação aberta", state.works.length - completedEvs ? "red" : "green", "ev")}
      ${kpi("SICs pendentes", String(pendingSics), "Aditivos aguardando decisão", pendingSics ? "red" : "green", "sics")}
      ${kpi("Pendências executivas", String(criticalWorks.length + delayed.length + pendingSics + pendingEvWorks.length), "EV, prazo, saldo e aprovações", "red", "worksManagement")}
    </section>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Ciclo orçamentário 360</h2>
            <p class="panel-subtitle">Do plano de investimento ao controle de verba e execução</p>
          </div>
        </div>
        <div class="cycle-grid">
          ${cycleStep("FEL 01", "Estimativa inicial", "Verba preliminar do plano de investimento")}
          ${cycleStep("FEL 02", "Premissas e escopo", "Base técnica, áreas, tipologia e riscos")}
          ${cycleStep("FEL 03", "EV Sala Técnica", "Orçamento por disciplina e custo por m²")}
          ${cycleStep("SUP", "Contratação", "Consumo real por linha do EV")}
          ${cycleStep("EXEC", "SICs e obra", "Aditivos, supressões e causa raiz")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Alertas executivos</h2>
            <p class="panel-subtitle">Resumo curto do que precisa de decisão ou acompanhamento</p>
          </div>
        </div>
        <div class="alert-list">
          ${
            pendingEvWorks.length
              ? alertItem(`${pendingEvWorks.length} EVs pendentes`, compactNames(pendingEvWorks, (work) => work.nome))
              : ""
          }
          ${
            criticalWorks.length
              ? alertItem(`${criticalWorks.length} obras com saldo crítico`, compactNames(criticalWorks, (work) => work.nome))
              : ""
          }
          ${delayed.length ? alertItem(`${delayed.length} demandas atrasadas`, compactNames(delayed, (demand) => demand.id)) : ""}
          ${
            pendingSics
              ? alertItem(`${pendingSics} SIC aguardando aprovação`, compactNames(state.sics.filter((sic) => sic.status === "Pendente"), (sic) => sic.id))
              : ""
          }
          ${
            !pendingEvWorks.length && !criticalWorks.length && !delayed.length && !pendingSics
              ? alertItem("Sem alertas executivos", "Nenhuma pendência crítica no momento.")
              : ""
          }
        </div>
      </section>
    </div>

    <div class="content-grid three">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>CAPEX por região</h2>
            <p class="panel-subtitle">Distribuição executiva da carteira</p>
          </div>
        </div>
        ${barList(capexByRegional().slice(0, 6), "valor", money)}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Tipo de unidade</h2>
            <p class="panel-subtitle">Mix do plano de investimento</p>
          </div>
        </div>
        ${barList(workCountBy("tipoUnidade").slice(0, 6), "valor", (value) => String(value))}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Atalhos de gestão</h2>
            <p class="panel-subtitle">Entradas rápidas para análise</p>
          </div>
        </div>
        <div class="insight-grid">
          ${insightTile("Portfólio completo", "Obras, SAP, CNPJ, áreas, prazos e EV", "portfolio")}
          ${insightTile("Kanban de sprints", "Esteira quinzenal e analistas responsáveis", "worksOperational")}
          ${insightTile("Retroanálise", "Disciplinas fora da base histórica", "worksManagement")}
          ${insightTile("Verbas e SICs", "Aporte, EV, contratado, risco e aditivos", "budget")}
        </div>
      </section>
    </div>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Verba por disciplina</h2>
          <p class="panel-subtitle">EV linha a linha, SICs aprovadas, contratado por Suprimentos e saldo disponível</p>
        </div>
        <button class="secondary-action" type="button" data-view="suppliers">Ver contratos</button>
      </div>
      ${renderBudgetDisciplineTable()}
    </section>
  `;
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
    ${renderToolbar("Relatórios 360", "Demandas consolidadas dos módulos de Obras, Manutenção e Engenharia Clínica", "")}
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
      <button class="primary-action" type="button" data-action="open-global-demand">+ Nova demanda</button>
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
              <tr><th>Nome</th><th>Perfil</th><th>Status</th><th>Acesso verba</th></tr>
            </thead>
            <tbody>
              ${(state.users || [])
                .map(
                  (user) => `
                    <tr>
                      <td><strong>${user.nome}</strong><br /><span class="muted">${user.email || ""}</span></td>
                      <td>${user.perfil}</td>
                      <td>${user.status || "Ativo"}</td>
                      <td><span class="status-pill" data-status="${roleDefinitions[user.perfil]?.blockedViews?.includes("budget") ? "Reprovado" : "Aprovado"}">${roleDefinitions[user.perfil]?.blockedViews?.includes("budget") ? "Bloqueado" : "Liberado"}</span></td>
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
  const worksMetrics = moduleDemandMetrics("works");
  const maintenancePortfolio = maintenanceItemsForModule("maintenance");
  const clinicalPortfolio = maintenanceItemsForModule("clinical");
  const maintenancePortfolioMetrics = moduleDemandMetrics("maintenance");
  const clinicalPortfolioMetrics = moduleDemandMetrics("clinical");
  const fundsBalance = positiveFundsBalanceTotal();

  return [
    {
      id: "obras",
      view: "worksOverview",
      title: "Orçamentos de Obras",
      description: "Cadastro mestre permanente, demandas, EV, revisões, contratos, documentos e verbas.",
      abbr: "OB",
      tone: "blue",
      metrics: [
        { label: "Demandas ativas", value: String(worksMetrics.active.length) },
        { label: "Atrasadas", value: String(worksMetrics.overdue.length) },
      ],
    },
    {
      id: "manutencao",
      view: "maintenanceOverview",
      title: "Orçamentos de Manutenção",
      description: "Fluxo próprio para escopo, visita, levantamento, cotação e validação.",
      abbr: "MN",
      tone: "orange",
      metrics: [
        { label: "Demandas ativas", value: String(maintenancePortfolioMetrics.active.length) },
        { label: "Atrasadas", value: String(maintenancePortfolioMetrics.overdue.length) },
      ],
    },
    {
      id: "clinica",
      view: "clinicalOverview",
      title: "Orçamentos de Engenharia Clínica",
      description: "Equipamentos, especificações, cotações e análise comparativa.",
      abbr: "EC",
      tone: "green",
      metrics: [
        { label: "Demandas ativas", value: String(clinicalPortfolioMetrics.active.length) },
        { label: "Atrasadas", value: String(clinicalPortfolioMetrics.overdue.length) },
      ],
    },
    {
      id: "gestao",
      view: "fundsOverview",
      title: "Controle de Verbas",
      description: "CAPEX de Obras e Manutenção, saldos, compromissos e remanejamentos.",
      abbr: "CV",
      tone: "red",
      metrics: [
        { label: "Verbas", value: String(state.funds?.length || 0) },
        { label: "Saldo disponível", value: money(fundsBalance) },
      ],
    },
  ].filter((module) => canAccessView(viewAliases[module.view] || module.view));
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
    eyebrow: "Portfólio de Obras",
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
  const totals = allTotals();
  const capex = totals.orcado + totals.aditivado;
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
  const targetWorkColumns = ["Obra", "Tipologia", "Meta SLT", "Custo/m²", "Desvio", "Status"];
  const targetWorkRows = (readings) =>
    readings.map((reading) => [
      `<strong>${reading.work.nome}</strong><br /><span class="muted">${reading.work.cidade}/${reading.work.uf}</span>`,
      reading.target?.label || "Sem meta",
      reading.target?.targetLabel || "—",
      reading.costM2 ? `${money(reading.costM2)}/m²` : "—",
      reading.target ? `${money(reading.costM2 - reading.target.targetMax)}/m²` : "—",
      `<span class="status-pill" data-status="${strategicCostTargetStatusTone(reading.status)}">${reading.status}</span>`,
    ]);
  const detailBase = {
    eyebrow: "Visão Estratégica",
    metrics: [
      { label: "CAPEX", value: money(capex) },
      { label: "Obras", value: String(state.works.length) },
      { label: "Contratado", value: money(totals.contratado) },
      { label: "Saldo", value: money(totals.saldo) },
    ],
    view: "worksStrategic",
    viewLabel: "Abrir estratégica",
  };

  if (key === "strategicCostTargets") {
    return {
      ...detailBase,
      title: "Aderência à meta de custo por m²",
      subtitle: "Comparação por tipologia contra as premissas da Sala Técnica.",
      metrics: [
        { label: "Obras medidas", value: String(targetSummary.measured) },
        { label: "Dentro da meta", value: String(targetSummary.within) },
        { label: "Acima da meta", value: String(targetSummary.above) },
        { label: "Aderência", value: targetSummary.measured ? `${number(targetSummary.adherence)}%` : "Sem leitura" },
      ],
      columns: ["Tipologia", "Meta SLT", "Obras medidas", "CAPEX", "Área eq.", "Custo/m²", "Aderência", "Status"],
      rows: targetRows.map((row) => [
        `<strong>${row.label}</strong>`,
        row.targetLabel,
        String(row.measuredCount),
        money(row.capex),
        `${number(row.area)} m²`,
        row.costM2 ? `${money(row.costM2)}/m²` : "—",
        row.measuredCount ? `${number(row.adherence)}%` : "—",
        `<span class="status-pill" data-status="${strategicCostTargetStatusTone(row.status)}">${row.status}</span>`,
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
    const rows = capexByRegional();
    return {
      ...detailBase,
      title: "Regiões atendidas",
      subtitle: "Distribuição regional do CAPEX e cobertura da carteira.",
      columns: ["Região", "CAPEX", "% do total"],
      rows: rows.map((row) => [row.label, money(row.valor), `${number((row.valor / Math.max(capex, 1)) * 100, 1)}%`]),
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
            <button class="target-row" type="button" data-action="open-kpi-detail" data-kpi="strategicCostTargets">
              <span>
                <strong>${row.label}</strong>
                <small>${row.targetLabel} · ${row.measuredCount} obra(s) medidas</small>
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
  const width = summary.measured ? Math.max(summary.adherence, 4) : 0;
  const statusText = summary.above ? `${summary.above} obra(s) acima da meta` : "Carteira dentro da premissa";
  return `
    <button class="strategic-main-kpi" type="button" data-tone="${tone}" data-action="open-kpi-detail" data-kpi="strategicCostTargets">
      <span class="eyebrow">Indicador principal</span>
      <strong>Aderência à meta de custo por m²</strong>
      <b>${value}</b>
      <small>${summary.within} de ${summary.measured} obras medidas dentro da premissa SLT</small>
      <span class="spotlight-meter" aria-hidden="true">
        <i style="width:${width}%"></i>
      </span>
      <em>${statusText}</em>
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
    ${renderWorksToolbar("worksHome", "Obras 360", "Central de Projetos de Engenharia com visões, portfólio e EV", `
      ${miroButton("Fluxos no Miro")}
      <button class="secondary-action" type="button" data-view="portfolio">Consultar obras</button>
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
      <button class="secondary-action" type="button" data-action="open-sprint">Nova sprint</button>
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
        <input data-operational-search value="${operationalFilters.query}" placeholder="Buscar por código, obra ou descrição..." />
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
  return `
    <tr data-action="open-demand-detail" data-id="${demand.id}" role="button" tabindex="0">
      <td><strong>${demand.id}</strong></td>
      <td><strong>${work?.nome || "Obra não localizada"}</strong></td>
      <td>${demandTypeLabel(demand.tipo)}</td>
      <td>${demand.analistaResponsavel || "—"}</td>
      <td>${sprint?.nome || "—"}</td>
      <td><span class="status-dot" data-status="${demand.coluna}"></span>${demandStatusLabel(demand)}</td>
      <td><span class="tag">${demand.prioridade}</span></td>
      <td class="numeric">${demandProducedValue(demand) ? money(demandProducedValue(demand)) : "—"}</td>
      <td>${isDemandLate(demand) ? `<span class="status-pill" data-status="Atrasada">Atrasada</span>` : dateText(demand.dataPrevistaEntrega)}</td>
    </tr>
  `;
}

function renderDemandCard(demand) {
  const work = workById(demand.obraId);
  const timing = demandTimingInfo(demand);
  const complementCount = (demand.analistasComplementares || []).length;
  const value = demandProducedValue(demand);
  const isSic = demandTypeKey(demand.tipo) === "SIC";
  return `
    <article class="demand-card ${isSic ? "is-sic" : ""}" data-status="${demand.coluna}" data-action="open-demand-detail" data-id="${demand.id}" role="button" tabindex="0">
      <div class="demand-card-top">
        <div class="demand-card-id">
          <span class="demand-code">${demand.id}</span>
          ${isSic ? `<span class="demand-type-badge">SIC</span>` : ""}
        </div>
        <div class="demand-card-actions">
          <span class="priority-pill">${demand.prioridade || "Média"}</span>
          <button class="card-delete-button" type="button" aria-label="Excluir ${demand.id}" title="Excluir demanda" data-action="open-delete-demand" data-id="${demand.id}">×</button>
        </div>
      </div>
      <h3>${work?.nome || "Obra não localizada"}</h3>
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
  const sprints = state.sprints || [];
  return sprints.find((sprint) => sprint.status === "Ativa") || sprints[sprints.length - 1];
}

function sprintById(id) {
  return (state.sprints || []).find((sprint) => sprint.id === id);
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

function renderWorksStrategic() {
  const totals = allTotals();
  const capex = totals.orcado + totals.aditivado;
  const regions = new Set(state.works.map((work) => work.regiao)).size;
  const strategicWorks = state.works.filter((work) => isStrategicWork(work)).length;
  const newUnits = state.works.filter((work) => isNewUnit(work)).length;
  const pendingEvs = state.works.filter((work) => work.ev.status !== "Completo").length;
  const investmentRows = investmentRankingRows();
  const topInvestment = investmentRows[0];
  const topFiveValue = investmentRows.slice(0, 5).reduce((sum, row) => sum + row.valor, 0);
  const topFiveShare = capex ? (topFiveValue / capex) * 100 : 0;
  const criticalBalance = worksWithCriticalBalance().length;
  const targetRows = strategicCostTargetRows();
  const targetSummary = strategicCostTargetSummary(targetRows);
  const targetTone = targetSummary.adherence >= 80 ? "green" : targetSummary.adherence >= 60 ? "orange" : "red";

  return `
    ${renderWorksToolbar("worksStrategic", "Visão Estratégica", "Leitura executiva do investimento, CAPEX e composição do portfólio", `
      <button class="secondary-action" type="button" data-view="portfolio">Portfólio</button>
      <button class="primary-action" type="button" data-view="budget">Controle de Verbas</button>
    `)}

    <section class="strategic-hero panel">
      ${renderStrategicTargetSpotlight(targetSummary)}
      <div class="strategic-hero-metrics">
        ${splitItem("CAPEX total", money(capex))}
        ${splitItem("Maior investimento", topInvestment ? topInvestment.work.nome : "Sem carteira")}
        ${splitItem("Valor do maior EV", topInvestment ? money(topInvestment.valor) : money(0))}
        ${splitItem("Top 5 concentram", `${number(topFiveShare, 1)}% do CAPEX`)}
      </div>
    </section>

    <section class="kpi-grid strategic-kpis">
      ${kpi("CAPEX total", money(capex), "EVs consolidados", "blue", "", "strategicCapex")}
      ${kpi("Aderência à meta m²", targetSummary.measured ? `${number(targetSummary.adherence)}%` : "Sem leitura", `${targetSummary.within} de ${targetSummary.measured} obras medidas`, targetTone, "", "strategicCostTargets")}
      ${kpi("Acima da meta m²", String(targetSummary.above), "Obras acima da premissa por tipologia", targetSummary.above ? "red" : "green", "", "strategicAboveTarget")}
      ${kpi("Regiões atendidas", String(regions), "Cobertura do portfólio", "green", "", "strategicRegions")}
      ${kpi("Obras estratégicas", String(strategicWorks), "Classificação estratégica", "blue", "", "strategicWorks")}
      ${kpi("Novas unidades", String(newUnits), "Expansão de rede", "green", "", "strategicNewUnits")}
      ${kpi("EVs pendentes", String(pendingEvs), "Risco para consolidação", pendingEvs ? "red" : "green", "", "strategicPendingEvs")}
      ${kpi("Saldo crítico", String(criticalBalance), "Projetos próximos ao limite", criticalBalance ? "red" : "green", "", "strategicCriticalBalance")}
      ${kpi("Concentração Top 5", `${number(topFiveShare, 1)}%`, money(topFiveValue), topFiveShare > 80 ? "orange" : "blue", "", "strategicTop5")}
    </section>

    <div class="content-grid three strategic-chart-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>CAPEX por região</h2>
            <p class="panel-subtitle">Soma dos EVs vinculados aos projetos</p>
          </div>
        </div>
        ${barList(capexByRegional(), "valor", money)}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Meta de custo por m²</h2>
            <p class="panel-subtitle">Aderência por tipologia às premissas da Sala Técnica</p>
          </div>
        </div>
        ${renderStrategicCostTargetList(targetRows)}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Classificação do portfólio</h2>
            <p class="panel-subtitle">Projetos agrupados pela motivação de investimento</p>
          </div>
        </div>
        ${barList(workCountBy("classificacaoObra"), "valor", (value) => String(value))}
      </section>
    </div>

    <section class="panel strategic-investment-panel">
      <div class="panel-header">
        <div>
          <h2>Maiores investimentos</h2>
          <p class="panel-subtitle">Ranking visual dos EVs de maior valor, com participação no CAPEX total</p>
        </div>
        <button class="secondary-action" type="button" data-view="ev">Abrir EVs</button>
      </div>
      ${renderInvestmentRanking()}
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
    ${renderWorksToolbar("portfolio", "Portfólio de Obras", "Carteira unificada com Plano de Investimento 2026, cadastro técnico e EV", `
      <span class="tag">${uniqueWorks} obras no plano</span>
      <button class="secondary-action" type="button" data-action="feature-soon">Importar base</button>
      <button class="primary-action" type="button" data-action="open-work">+ Nova obra</button>
    `)}

    <section class="kpi-grid portfolio-kpis">
      ${kpi("Obras no plano", String(uniqueWorks), `${rows.length} linha(s) no filtro atual`, "blue")}
      ${kpi("Etapas de Projetos", String(projectRows.length), "Base para entrada na Sala Técnica", "orange")}
      ${kpi("Projetos próximos", String(upcomingProjects.length), "Término planejado nos próximos 30 dias", "green")}
      ${kpi("Projetos atrasados", String(overdueProjects.length), "Sem término real e data planejada vencida", "red")}
      ${kpi("Vínculos com EV", String(linkedWorks), "Linhas encontradas no cadastro Obras 360", "blue")}
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
                const planName = row.obra || work?.nome || "Obra sem nome";
                const cityUf = `${work?.cidade || row.praca || "—"}/${work?.uf || row.uf || "—"}`;
                const prazo = work?.prazoDias || (work ? plannedDurationForWork(work) : "") || row.slaDias || "—";
                return `
                  <tr>
                    <td>
                      <strong>${escapeAttribute(planName)}</strong>
                      <br /><span class="muted">${escapeAttribute(row.chaveEtapa || "Plano de Investimento 2026")}</span>
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
      <input data-portfolio-search value="${portfolioQuickFilters.query}" placeholder="Buscar por nome, chave, cidade, UF, região, tipo..." />
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
    return normalizeSearchText(raw).includes(value);
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
  return `<input class="table-filter" data-filter-field="${field}" value="${portfolioFilters[field] || ""}" placeholder="${placeholder}" />`;
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

function investmentPlanRows(applyFilters = true) {
  const terms = normalizeSearchText([searchTerm, investmentPlanFilters.query].filter(Boolean).join(" ")).split(/\s+/).filter(Boolean);
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
        inicioOrcamentacao: isPlanProject(record) ? addDaysISO(record.terminoPlanejado, 1) : "",
      };
    })
    .sort((a, b) => {
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
      ${kpi("Linhas vinculadas", String(linkedWorks), "Encontradas no Portfólio Obras 360", "blue")}
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

function renderEV() {
  const evWorks = filteredEVWorks();
  const evHasSearch = Boolean(searchTerm || evAssistantQuery);
  if (evHasSearch && !evWorks.length) {
    return `
      ${renderWorksToolbar("ev", "Estudos de Viabilidade", "Valores, versões, indicadores por m² e pendências de cada obra", `
        <button class="secondary-action" type="button" data-view="portfolio">Portfólio</button>
        <button class="secondary-action" type="button" data-action="clear-ev-filters">Limpar filtros</button>
        ${miroButton("Fluxo Miro")}
      `)}
      ${renderEVSearchAssistant(evWorks)}
      <div class="empty-state">Nenhum EV encontrado para o filtro "${searchTerm || evAssistantQuery}".</div>
    `;
  }
  const selectedAll = selectedWorkId === "all";
  if (evHasSearch && evWorks.length && !selectedAll && !evWorks.some((item) => item.id === selectedWorkId)) {
    selectedWorkId = evWorks[0].id;
  }
  const work = selectedAll ? null : workById(selectedWorkId) || evWorks[0] || state.works[0];
  if (!work && !selectedAll) return `<div class="empty-state">Nenhuma obra cadastrada.</div>`;
  if (work) selectedWorkId = work.id;
  const totals = selectedAll ? totalsForWorks(evWorks) : workTotals(work);
  const importedSicAdditives = sicLineRecords()
    .filter((record) => record.valor > 0)
    .reduce((sum, record) => sum + record.valor, 0);
  const sicAdditiveValue = selectedAll ? Math.max(importedSicAdditives, totals.aditivado) : totals.aditivado;
  const totalArea = selectedAll
    ? evWorks.reduce((sum, item) => sum + (item.areaEquivalente || 0), 0)
    : work.areaEquivalente;

  return `
    ${renderWorksToolbar("ev", "Estudos de Viabilidade", "Valores, versões, indicadores por m² e pendências de cada obra", `
      <button class="secondary-action" type="button" data-view="portfolio">Portfólio</button>
      <button class="secondary-action" type="button" data-action="clear-ev-filters">Limpar filtros</button>
      ${miroButton("Fluxo Miro")}
      <button class="primary-action" type="button" data-action="open-demand">Nova SIC</button>
    `)}
    ${renderEVSearchAssistant(evWorks)}
    <div class="selector-row">
      <label class="field">
        <span>Obra</span>
        <select data-action="select-work">
          <option value="all" ${selectedAll ? "selected" : ""}>Todas as obras</option>
          ${evWorks.map((item) => `<option value="${item.id}" ${item.id === work?.id ? "selected" : ""}>${item.nome}</option>`).join("")}
        </select>
      </label>
      ${
        selectedAll
          ? `<span class="tag">${evWorks.length} EVs</span><span class="tag">Todas as obras</span>`
          : `<span class="status-pill" data-status="${work.ev.status}">${work.ev.status}</span><span class="tag">EV v${work.ev.versaoAtual}</span>`
      }
    </div>

    <section class="kpi-grid">
      ${kpi("Valor EV", money(totals.orcado), "Base orçada por disciplina", "blue")}
      ${kpi("Valores de Aditivos", money(sicAdditiveValue), "SICs aprovadas/importadas e decompostas", "orange")}
      ${kpi("Contratado", money(totals.contratado), "Contratações por disciplina", "green")}
      ${kpi("Custo médio m²", money((totals.orcado + totals.aditivado) / Math.max(totalArea, 1)), `${number(totalArea)} m² equivalentes`, "blue")}
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Carteira de EVs</h2>
          <p class="panel-subtitle">Versões, pendências, valor total e custo por m²</p>
        </div>
      </div>
      ${renderEVOverviewTable(selectedAll ? null : work)}
    </section>

    ${renderBudgetingFlowPanel()}

    ${selectedAll ? "" : renderEVVersionPanel(work)}
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
  const renderRows = (category) =>
    visibleRows
      .filter((row) => row.discipline.categoria === category)
      .map((row) => renderEVEditableRow(work, row, baseTotal))
      .join("");
  const anexos = work.ev.anexos || [];
  return `
    <form class="ev-editor" id="evForm" data-work-id="${work.id}">
      <input type="hidden" name="saveMode" value="final" />
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
          <small>${anexos.length ? anexos.map((item) => item.nome).join(", ") : "Nenhum arquivo anexado ao EV."}</small>
        </label>
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
    item.sprint,
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
    municipio: importedText(recordValue(row, ["MUNICIPIO", "MUNICÍPIO"]), ""),
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
    return `
      <div class="sic-work-selected">
        <strong>${selected.nome}</strong>
        <span>${selected.tipo} | ${selected.municipio || "Cidade não informada"} | ${selected.cnpj || "CNPJ não informado"} | ${selected.cep || selected.endereco || "Endereço não informado"}</span>
      </div>
    `;
  }
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return `<p class="muted">Digite nome, CNPJ, centro, município, UF ou tipo da unidade.</p>`;
  const suggestions = maintenanceUnits()
    .filter((unit) => {
      const text = normalizeSearchText([unit.nome, unit.tipo, unit.cnpj, unit.cep, unit.municipio, unit.centro, unit.source].join(" "));
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
              <span>${unit.tipo} | ${unit.municipio || "Cidade não informada"} | ${unit.cnpj || "CNPJ não informado"} | ${unit.source}</span>
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

function filteredMaintenanceDemands() {
  const filters = maintenanceFiltersForActiveModule();
  return maintenanceItems().filter((item) => {
    const query = normalizeSearchText([searchTerm, filters.query].filter(Boolean).join(" ")).trim();
    if (query && !query.split(/\s+/).every((term) => maintenanceSearchText(item).includes(term))) return false;
    if (filters.sprint && item.sprint !== filters.sprint) return false;
    if (filters.analyst && item.analistaResponsavel !== filters.analyst) return false;
    if (filters.phase && item.coluna !== filters.phase) return false;
    if (filters.expense && item.tipoDespesa !== filters.expense) return false;
    if (filters.costCenter && item.centroCusto !== filters.costCenter) return false;
    if (filters.unitType && item.tipologia !== filters.unitType) return false;
    if (filters.equipment) {
      const equipmentText = normalizeSearchText([item.equipamento, item.assetName, item.patrimonio, item.fabricante, item.modelo, item.numeroSerie, clinicalEquipmentName(item)].join(" "));
      if (!filters.equipment.split(/\s+/).every((term) => equipmentText.includes(term))) return false;
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
            ${maintenanceFieldOptions(items.map((item) => item.sprint), filters.sprint)}
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
                <span>Centro de custo</span>
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
  const timing = isMaintenanceLate(item)
    ? { tone: "red", label: `Lead time ${maintenanceLeadTime(item)} d`, dateLabel: "Acima da referência" }
    : { tone: "green", label: `Fase há ${maintenancePhaseDays(item)} d`, dateLabel: `Lead time ${maintenanceLeadTime(item)} d` };
  return `
    <article class="demand-card maintenance-card" data-status="${item.coluna}" data-action="open-maintenance-card" data-id="${item.id}" role="button" tabindex="0">
      <div class="demand-card-top">
        <span class="demand-code">${item.ordemServico || item.id}</span>
        <span class="priority-pill">${item.tipoDespesa || "OPEX"}</span>
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
                  <td>${item.sprint || "Sem sprint"}</td>
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
  const bySprint = maintenanceTimelineSeries(items, (item) => item.sprint || "Sem sprint", "sprint");
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
    const text = normalizeSearchText([unit.nome, unit.tipo, unit.cnpj, unit.cep, unit.municipio, unit.centro].join(" "));
    return terms.every((term) => text.includes(term));
  });
}

function updateMaintenanceUnitSearch(input) {
  const form = input.closest("form");
  const hidden = form?.querySelector('[name="unidadeId"]');
  const results = form?.querySelector("[data-maintenance-unit-results]");
  if (hidden) hidden.value = "";
  if (results) results.innerHTML = maintenanceUnitSearchResults(input.value);
}

function openMaintenanceDemandModal() {
  const labels = maintenanceModuleLabels();
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
                <input name="sprint" placeholder="Ex.: SPRINT 13" />
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
                <input name="dataPrevistaEntrega" type="date" />
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
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal-card demand-modal-card maintenance-demand-form" id="maintenanceDetailForm" data-id="${item.id}" aria-labelledby="maintenanceDetailTitle">
        <header>
          <div>
            <span class="eyebrow">${item.ordemServico || item.id} — ${maintenanceStatusLabel(item)}</span>
            <h2 id="maintenanceDetailTitle">${item.titulo}</h2>
            <p class="muted">${item.unidadeNome} · ${item.uf || "UF não informada"} · ${item.sprint || "Sem sprint"}${labels.isClinical ? ` · ${equipmentName || "Equipamento a vincular"}` : ""}</p>
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
                <input name="sprint" value="${escapeAttribute(item.sprint || "")}" />
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
    dataPrevistaEntrega: formData.get("dataPrevistaEntrega") || "",
    valorProposta: parseCurrency(formData.get("valorProposta")),
    valorSalaTecnica: parseCurrency(formData.get("valorSalaTecnica")),
    valorNegociado: isOpex ? 0 : parseCurrency(formData.get("valorNegociado")),
    sprint: String(formData.get("sprint") || "").trim() || "Sem sprint",
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
    sprint: String(formData.get("sprint") || "").trim() || "Sem sprint",
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

function renderBudgetControl() {
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

function renderSics() {
  const data = sicDashboardData();
  const active = sicViewMeta().find((view) => view.id === sicViewMode) || sicViewMeta()[0];

  return `
    ${renderWorksToolbar("sics", active.title, active.subtitle, `
      <button class="primary-action" type="button" data-action="open-demand">Nova SIC</button>
    `)}
    ${renderSicViewTabs()}
    ${renderSicFilterBar(data)}
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
  ];
}

function renderSicViewTabs() {
  return `
    <nav class="sic-view-tabs" aria-label="Visões do BI de SICs">
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
  };
  return (views[sicViewMode] || renderSicReportView)(data);
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
    ${renderWorksToolbar("worksSettings", "Configurações de Obras", "Legenda da chave, sprints e listas de apoio do módulo Obras", `
      <button class="secondary-action" type="button" data-view="settings">Configuração global</button>
      <button class="danger-action" type="button" data-action="reset-demo">Restaurar base Obras 360</button>
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
            <h2>Sprints</h2>
            <p class="panel-subtitle">Períodos usados na visão operacional</p>
          </div>
        </div>
        <form class="inline-sprint-form" id="sprintInlineForm">
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

function renderSprintsTable() {
  return `
    <div class="table-wrap sprint-table-wrap">
      <table class="data-table sprint-table">
        <thead>
          <tr>
            <th>Sprint</th>
            <th>Início</th>
            <th>Fim</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${(state.sprints || [])
            .map(
              (sprint) => `
                <tr>
                  <td><strong>${sprint.nome}</strong></td>
                  <td>${dateText(sprint.dataInicio)}</td>
                  <td>${dateText(sprint.dataFim)}</td>
                  <td><span class="status-pill" data-status="${sprint.status === "Ativa" ? "Completo" : "Aguardando"}">${sprint.status}</span></td>
                </tr>
              `
            )
            .join("")}
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
  const users = state.users || [];
  return `
    <section class="panel users-settings-panel">
      <div class="panel-header">
        <div>
          <h2>Usuários e perfis</h2>
          <p class="panel-subtitle">Admin, Gestão e Analista com regra de acesso ao Controle de Verbas</p>
        </div>
        <label class="field compact-field">
          <span>Perfil ativo</span>
          <select data-action="select-active-role">
            ${Object.keys(roleDefinitions)
              .map((role) => `<option value="${role}" ${activeRole() === role ? "selected" : ""}>${role}</option>`)
              .join("")}
          </select>
        </label>
      </div>

      <form class="user-inline-form" id="userForm">
        <label class="field">
          <span>Nome</span>
          <input name="nome" required placeholder="Ex.: Mariana Silva" />
        </label>
        <label class="field">
          <span>E-mail</span>
          <input name="email" type="email" required placeholder="nome@hapvida.com.br" />
        </label>
        <label class="field">
          <span>Perfil</span>
          <select name="perfil">
            ${Object.keys(roleDefinitions).map((role) => `<option value="${role}">${role}</option>`).join("")}
          </select>
        </label>
        <button class="primary-action" type="submit">Criar usuário</button>
      </form>

      <div class="content-grid users-access-grid">
        <div class="table-wrap users-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Controle de Verbas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${users
                .map(
                  (user) => `
                    <tr>
                      <td><strong>${user.nome}</strong><br /><span class="muted">${user.email}</span></td>
                      <td>${user.perfil}</td>
                      <td><span class="status-pill" data-status="${roleDefinitions[user.perfil]?.blockedViews?.includes("budget") ? "Reprovado" : "Aprovado"}">${roleDefinitions[user.perfil]?.blockedViews?.includes("budget") ? "Sem acesso" : "Liberado"}</span></td>
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

function renderSettings() {
  return `
    ${renderToolbar("Configurações", "Dicionário canônico, listas e auditoria", `
      <button class="danger-action" type="button" data-action="reset-demo">Restaurar base Obras 360</button>
    `)}
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
          ${state.history
            .slice(0, 12)
            .map(
              (item) => `
                <article class="history-item">
                  <strong>${item.entidade.toUpperCase()} ${item.entidadeId} | ${item.campo}</strong>
                  <span>${item.valorAnterior} -> ${item.valorNovo}</span><br />
                  <span>${item.usuario} | ${new Date(item.timestamp).toLocaleString("pt-BR")}</span>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
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
  const uniqueAttachments = [...new Map(anexos.map((file) => [`${file.nome}|${file.tamanho}`, file])).values()];
  return {
    lecomNumber: metadata.lecomNumber || sic?.lecomNumber || "—",
    obraNumber: metadata.obraNumber || sic?.obraNumber || "—",
    obraNome: metadata.obraNome || sic?.obraNome || workById(demand.obraId)?.nome || "—",
    tituloSic: metadata.tituloSic || sic?.titulo || demand.observacao || "—",
    numeroSic: metadata.numeroSic || sic?.numeroSic || sic?.id || "—",
    descricaoSic: metadata.descricaoSic || sic?.descricao || demand.observacao || "—",
    analistaSalaTecnica: metadata.analistaSalaTecnica || sic?.analistaSalaTecnica || demand.analistaResponsavel || "—",
    motivo: metadata.motivo || sic?.motivo || "InformacaoContratada",
    anexos: uniqueAttachments,
  };
}

function renderDemandSicMetadata(demand) {
  const info = demandSicInfo(demand);
  if (!info) return "";
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
      ${renderDemandSicRiskAlert(demand)}
      <div class="sic-attachments-list">
        <span>Arquivos anexados</span>
        ${
          info.anexos.length
            ? info.anexos
                .map((file) => `<b>${escapeAttribute(file.nome)} <small>${formatFileSize(file.tamanho)}</small></b>`)
                .join("")
            : `<p class="muted">Nenhum arquivo anexado.</p>`
        }
      </div>
      <div class="sic-posting-actions">
        ${
          (demand.sicIds || []).length
            ? `<span class="tag">Postada no EV: ${postedSicDisplaySummary(demand)}</span>`
            : `<button class="primary-action" type="button" data-action="post-sic-to-ev" data-id="${demand.id}">Postar SIC no EV</button>
               <small class="muted">A postagem cria a SIC no EV e vincula as disciplinas informadas ao estudo.</small>`
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
                <select name="sprintId">
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
              <span>Sprint</span>
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
          <h2 id="sprintTitle">Nova sprint de orçamentação</h2>
          <p class="muted">Use períodos quinzenais para organizar a esteira operacional de Obras.</p>
        </header>
        <div class="modal-body">
          <div class="error-box" id="formError"></div>
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
          <button class="primary-action" type="submit">Cadastrar sprint</button>
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
            <label class="field">
              <span>Área equivalente (m²)</span>
              <input name="areaEquivalente" inputmode="decimal" placeholder="0,00" value="${fieldValue("areaEquivalente")}" />
            </label>
            <label class="field">
              <span>Área construída (m²)</span>
              <input name="areaConstruida" inputmode="decimal" placeholder="0,00" value="${fieldValue("areaConstruida")}" />
            </label>
            <label class="field">
              <span>SAP / OI</span>
              <input name="ordemInternaSAP" placeholder="Ordem interna SAP" value="${fieldValue("ordemInternaSAP")}" />
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
  return {
    tipo: demandTypeKey(type) || "EmissaoInicial",
    obraId: work?.id || "",
    obraBusca: draft.obraBusca || work?.nome || "",
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
          <button class="primary-action" type="submit">Avançar →</button>
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
          <button class="primary-action" type="submit">Salvar demanda</button>
        </footer>
      </form>
    </div>
  `;
}

function demandWizardHiddenFields(draft) {
  return `
    <input type="hidden" name="obraId" value="${draft.obraId}" />
    <input type="hidden" name="tipo" value="${draft.tipo}" />
    <input type="hidden" name="sprintId" value="${draft.sprintId}" />
    <input type="hidden" name="analistaResponsavel" value="${draft.analistaResponsavel}" />
    <input type="hidden" name="descricao" value="${String(draft.descricao || "").replace(/"/g, "&quot;")}" />
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
  return (
    state.works.find((work) => normalizeSearchText(work.nome) === normalized) ||
    state.works.find((work) => normalizeSearchText(work.chaveUnica || work.codigoOriginal) === normalized) ||
    state.works.find((work) => normalizeSearchText([work.nome, work.chaveUnica, work.codigoOriginal, work.cidade, work.uf].join(" ")).includes(normalized))
  );
}

function handleDemandWizardStep1(form) {
  const formData = new FormData(form);
  const work = resolveDemandWorkFromQuery(formData.get("obraBusca"));
  if (!work) {
    showFormError("Selecione uma obra válida do portfólio antes de avançar.");
    return;
  }
  const sprint = sprintById(formData.get("sprintId")) || currentSprint();
  demandWizardDraft = demandWizardDefaultDraft(formData.get("tipo"), {
    obraId: work.id,
    obraBusca: work.nome,
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
  if (formData.get("tipo") === "SIC") {
    const exactWork = findWorkByExactTypedSearch(formData.get("obraBusca"));
    return exactWork?.id || "";
  }
  const typedWork = findWorkByTypedSearch(formData.get("obraBusca"));
  if (typedWork) return typedWork.id;
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
            <p class="muted">Busque uma obra/projeto existente ou cadastre uma nova obra antes de salvar a demanda no Kanban.</p>
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
            <p class="muted">Ao salvar, o card entra em A iniciar. A SIC só será vinculada ao EV quando for postada pelo card.</p>
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
          <button class="primary-action" type="submit">Salvar demanda</button>
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

function fileAttachmentMetadata(input) {
  return [...(input?.files || [])].map((file) => ({
    nome: file.name,
    tamanho: file.size,
    tipo: file.type || "arquivo",
    data: todayISO(),
  }));
}

function formatFileSize(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "0 KB";
  if (value < 1024 * 1024) return `${number(value / 1024, 1)} KB`;
  return `${number(value / (1024 * 1024), 1)} MB`;
}

function showFormError(message) {
  const box = document.querySelector("#formError");
  if (!box) {
    showToast(message);
    return;
  }
  box.textContent = message;
  box.classList.add("is-visible");
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function handleEVSubmit(form, mode = "final") {
  const work = workById(form.dataset.workId);
  if (!work) return;
  const previousTotal = workTotals(work).orcado;
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
  const files = [...(fileInput?.files || [])].map((file) => ({
    nome: file.name,
    tamanho: file.size,
    tipo: file.type || "arquivo",
    data: todayISO(),
  }));
  if (files.length) {
    work.ev.anexos = [...(work.ev.anexos || []), ...files];
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
  const dataInicio = formData.get("dataInicio");
  const dataFim = formData.get("dataFim");
  if (!dataInicio || !dataFim || dataFim < dataInicio) {
    showFormError("Informe um período válido para a sprint.");
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
    nome: formData.get("nome"),
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
  closeModal();
  showToast("Sprint cadastrada na visão operacional.");
  render();
}

function handleUserSubmit(form) {
  const formData = new FormData(form);
  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const perfil = String(formData.get("perfil") || "Analista");
  if (!nome || !email) {
    showFormError("Informe nome e e-mail para criar o usuário.");
    return;
  }
  const user = {
    id: nextCode("usr", state.users || []),
    nome,
    email,
    perfil,
    status: "Ativo",
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
  showToast("Usuário criado com perfil de acesso.");
  render();
}

function handleWorkSubmit(form) {
  const formData = new FormData(form);
  const nome = String(formData.get("nome") || "").trim();
  const tipoUnidade = String(formData.get("tipoUnidade") || "").trim();
  const cidade = String(formData.get("cidade") || "").trim();
  const uf = String(formData.get("uf") || "").trim().toUpperCase();
  const regiao = String(formData.get("regiao") || "").trim();

  if (!nome || !tipoUnidade || !cidade || !uf || !regiao) {
    showFormError("Preencha nome, tipo de unidade, cidade, UF e região para cadastrar a obra.");
    return;
  }

  const existingWork = workById(formData.get("workId"));
  const areaEquivalente = parseCurrency(formData.get("areaEquivalente"));
  const areaConstruida = parseCurrency(formData.get("areaConstruida"));
  const prazoDias = Number(String(formData.get("prazoDias") || "").replace(/[^\d]/g, ""));
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
    areaConstruida,
    areaEquivalente,
    ordemInternaSAP: String(formData.get("ordemInternaSAP") || "").trim(),
    cnpj: String(formData.get("cnpj") || "").trim(),
    endereco: String(formData.get("endereco") || "").trim(),
    prazoDias: Number.isFinite(prazoDias) && prazoDias > 0 ? prazoDias : "",
  };

  if (existingWork) {
    const previous = `${existingWork.nome} | ${existingWork.chaveUnica}`;
    Object.assign(existingWork, {
      ...workFields,
      chaveUnica: workFields.chaveUnica || existingWork.chaveUnica || generateWorkKey(state.works.indexOf(existingWork) + 1, uf, tipoUnidade, workFields.tipologiaObra),
    });
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
    showToast("Dados da obra atualizados no portfólio.");
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
    showToast("Obra cadastrada. Continue o registro da SIC vinculada ao EV.");
    openSicDemandModal(work.id);
    return;
  }
  closeModal();
  showToast("Obra cadastrada no portfólio com EV rascunho.");
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

function handleDemandSubmit(form) {
  const formData = new FormData(form);
  const tipo = formData.get("tipo");
  const obraId = resolveWorkIdFromDemandForm(formData);
  const demandId = nextCode("DEM", state.demands);
  const sicIds = [];
  let sicMetadata = null;
  let sicDraftDisciplines = [];

  if (!obraId) {
    showFormError("Use o assistente de busca para selecionar uma obra do portfólio ou cadastre uma nova obra antes de salvar a demanda.");
    return;
  }

  if (tipo === "SIC") {
    const work = workById(obraId);
    const lecomNumber = String(formData.get("lecomNumber") || "").trim();
    const obraNumber = String(formData.get("obraNumber") || work?.chaveUnica || work?.codigoOriginal || "").trim();
    const obraNome = String(formData.get("obraNome") || work?.nome || "").trim();
    const tituloSic = String(formData.get("tituloSic") || "").trim();
    const numeroSic = String(formData.get("numeroSic") || "").trim();
    const descricaoSic = String(formData.get("descricao") || "").trim();
    const analistaSalaTecnica = String(formData.get("analistaSalaTecnica") || formData.get("analista") || "").trim();
    const anexos = fileAttachmentMetadata(form.querySelector('[name="sicFiles"]'));

    if (!obraNumber || !obraNome || !tituloSic || !descricaoSic || !analistaSalaTecnica) {
      showFormError("Preencha nº da obra, nome da obra, título, descrição da SIC e analista da Sala Técnica.");
      return;
    }

    const affected = [...form.querySelectorAll(".discipline-row")]
      .map((row) => ({
        disciplinaId: row.querySelector('[name="disciplinaId"]').value,
        valorDelta: parseCurrency(row.querySelector('[name="valorDelta"]').value),
      }))
      .filter((item) => item.disciplinaId || item.valorDelta);

    if (!affected.length) {
      showFormError("Selecione ao menos uma disciplina para salvar a SIC.");
      return;
    }

    const invalid = affected.find((item) => {
      const discipline = disciplineById(item.disciplinaId);
      return !item.disciplinaId || !discipline.selecionavelParaSIC;
    });

    if (invalid) {
      showFormError("Cada linha da SIC precisa ter uma disciplina selecionável.");
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
    showToast("Demanda de SIC salva no Kanban em A iniciar. Poste a SIC no EV pelo card quando estiver pronta.");
    setView("worksOperational");
    return;
  }
  showToast("Demanda criada com rastreabilidade por disciplina.");
  render();
}

function postDemandSicToEV(demandId) {
  const demand = state.demands.find((item) => item.id === demandId);
  if (!demand || demandTypeKey(demand.tipo) !== "SIC") return;
  if ((demand.sicIds || []).length) {
    showToast("Esta SIC já foi postada no EV.");
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
    status: "Pendente",
    aprovadoPor: "",
    dataAbertura: todayISO(),
    dataAprovacao: "",
  };

  state.sics.unshift(sic);
  syncSicWithEV(work, sic);
  syncWorkSicSummaryLine(work);
  demand.sicIds = [sic.id];
  demand.sicPostedAt = todayISO();
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

function handleDemandDetailSubmit(form) {
  const demand = state.demands.find((item) => item.id === form.dataset.id);
  if (!demand) return;
  const formData = new FormData(form);
  const previousAnalyst = demand.analistaResponsavel || "A definir";
  const previousSprint = demand.sprintId || "";
  const previousPriority = demand.prioridade || "";

  demand.analistaResponsavel = formData.get("analistaResponsavel") || demand.analistaResponsavel || "";
  demand.tipo = formData.get("tipo") || demand.tipo;
  demand.sprintId = formData.get("sprintId") || "";
  demand.prioridade = formData.get("prioridade") || demand.prioridade;
  if (demandTypeKey(demand.tipo) === "SIC") {
    demand.sicMetadata = demand.sicMetadata || {};
    demand.sicMetadata.descricaoSic = formData.get("sicDescricao") || demand.sicMetadata.descricaoSic || demand.observacao || "";
    demand.observacao = demand.sicMetadata.descricaoSic;
  } else {
    demand.observacao = formData.get("observacao") || "";
  }
  demand.nota = formData.get("nota") || "";
  if (demandTypeKey(demand.tipo) === "SIC" && !(demand.sicIds || []).length) {
    const draftDisciplines = readSicDraftDisciplinesFromForm(form);
    if (draftDisciplines.length) demand.sicDraftDisciplines = draftDisciplines;
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
  if (nextColumnId === "concluido") {
    const work = workById(demand.obraId);
    if (!workHasEVValuesForConclusion(work)) {
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
    syncCompletedDemandWithEV(workById(demand.obraId), demand);
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

document.addEventListener("click", (event) => {
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
  if (action === "toggle-haptec") {
    haptecOpen = !haptecOpen;
    render();
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
    postDemandSicToEV(actionButton.dataset.id);
    return;
  }
  if (action === "open-contract") openContractModal();
  if (action === "open-sprint") openSprintModal();
  if (action === "open-ev-modal") openEVModal(actionButton.dataset.id);
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
  if (action === "set-maintenance-view") {
    setMaintenanceViewModeForActiveModule(actionButton.dataset.mode || "kanban");
    render();
  }
  if (action === "set-management-filter") {
    managementStatusFilter = actionButton.dataset.filter || "all";
    render();
  }
  if (action === "set-sic-view") {
    sicViewMode = actionButton.dataset.viewMode || "report";
    render();
  }
  if (action === "clear-operational-filters") {
    resetOperationalFilters();
    render();
  }
  if (action === "clear-maintenance-filters") {
    resetMaintenanceFilters();
    render();
  }
  if (action === "clear-ev-filters") {
    searchTerm = "";
    evAssistantQuery = "";
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
    const input = form?.querySelector("[data-maintenance-unit-search]");
    const hidden = form?.querySelector('[name="unidadeId"]');
    const results = form?.querySelector("[data-maintenance-unit-results]");
    if (unit && input && hidden) {
      input.value = `${unit.nome} | ${unit.tipo} | ${unit.municipio || unit.cep || "sem cidade"}`;
      hidden.value = unit.id;
      if (results) results.innerHTML = maintenanceUnitSearchResults(input.value, unit.id);
      const errorBox = form.querySelector("#formError");
      if (errorBox) errorBox.classList.remove("is-visible");
    }
  }
  if (action === "reset-demo") {
    state = clone(baseState);
    selectedWorkId = state.works[0]?.id || "";
    saveState();
    showToast("Base Obras 360 restaurada.");
    render();
  }
});

document.addEventListener("keydown", (event) => {
  const moduleCard = event.target.closest('[role="button"][data-view], [role="button"][data-action]');
  if (!moduleCard || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  if (moduleCard.dataset.view) setView(moduleCard.dataset.view);
  else moduleCard.click();
});

document.addEventListener("change", (event) => {
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
  if (event.target.matches('[data-action="update-maintenance-status"]')) {
    const item = updateMaintenanceDemandPhase(event.target.dataset.id, event.target.value);
    if (item === false) return;
    const box = event.target.closest(".demand-status-box");
    if (box && item) box.dataset.status = item.coluna;
    render();
    if (item) showToast(`Card movido para ${maintenanceStatusLabel(item)}.`);
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
  if (event.target.matches('[data-action="select-active-role"]')) {
    state.activeRole = event.target.value;
    saveState();
    showToast(`Perfil ativo: ${state.activeRole}.`);
    render();
  }
  if (event.target.matches("[data-operational-filter]")) {
    operationalFilters[event.target.dataset.operationalFilter] = event.target.value;
    render();
  }
  if (event.target.matches("[data-maintenance-filter]")) {
    const filters = maintenanceFiltersForActiveModule();
    filters[event.target.dataset.maintenanceFilter] = event.target.value;
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
  }
  if (event.target.matches("[data-filter-field]")) {
    portfolioFilters[event.target.dataset.filterField] = event.target.value.trim().toLowerCase();
    render();
  }
});

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

document.addEventListener("submit", (event) => {
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
    handleEVSubmit(event.target, mode);
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
    handleDemandSubmit(event.target);
  }
  if (event.target.id === "demandDetailForm") {
    event.preventDefault();
    handleDemandDetailSubmit(event.target);
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
  searchTerm = normalizeSearchText(event.target.value.trim());
  if (["dashboard", "team", "reports", "kanban", "worksOperational", "portfolio", "investmentPlan", "ev", ...maintenanceViewIds, ...clinicalViewIds].includes(currentView)) render();
});

document.addEventListener("input", (event) => {
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
    evAssistantQuery = value.trim();
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
    portfolioQuickFilters.query = normalizeSearchText(value.trim());
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
    investmentPlanFilters.query = value.trim();
    render();
    const nextInput = document.querySelector("[data-investment-plan-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-operational-search]")) {
    const value = event.target.value;
    operationalFilters.query = normalizeSearchText(value.trim());
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
    maintenanceFiltersForActiveModule().query = normalizeSearchText(value.trim());
    render();
    const nextInput = document.querySelector("[data-maintenance-search]");
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(value.length, value.length);
    }
    return;
  }
  if (event.target.matches("[data-clinical-equipment-search]")) {
    const value = event.target.value;
    clinicalFilters.equipment = normalizeSearchText(value.trim());
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
  if (event.target.matches("[data-sic-search]")) {
    const value = event.target.value;
    sicSearchQuery = value.trim();
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
  portfolioFilters[field] = normalizeSearchText(value.trim());
  render();
  const nextInput = document.querySelector(`[data-filter-field="${field}"]`);
  if (nextInput) {
    nextInput.focus();
    nextInput.setSelectionRange(value.length, value.length);
  }
});

render();

