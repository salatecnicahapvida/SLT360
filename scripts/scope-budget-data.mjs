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

function transformFunction(source, name, transform) {
  const pattern = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`);
  const match = pattern.exec(source);
  if (!match) return source;
  const paramsClose = source.indexOf(")", match.index + match[0].length);
  if (paramsClose === -1) throw new Error(`Parâmetros não encerrados: ${name}`);
  const open = source.indexOf("{", paramsClose + 1);
  if (open === -1) throw new Error(`Corpo não encontrado: ${name}`);
  const close = matchingBrace(source, open);
  const body = source.slice(open + 1, close);
  return `${source.slice(0, open + 1)}${transform(body)}${source.slice(close)}`;
}

const BUDGET_SCOPED_FUNCTIONS = [
  "strategicCostTargetRows",
  "worksAboveStrategicCostTarget",
  "worksWithCriticalBalance",
  "allTotals",
  "haptecTopEVWork",
  "haptecPortfolioDataAnswer",
  "haptecEVDataAnswer",
  "haptecPortfolioQuestionAnswer",
  "kpiDetailData",
  "strategicKpiDetailData",
  "workCountBy",
  "disciplineBenchmarkRows",
  "renderWorksStrategic",
  "investmentRankingRows",
  "renderPortfolioFilters",
  "portfolioRows",
  "budgetDisciplineRows",
  "capexByDiscipline",
  "capexByTypology",
  "capexByRegional",
  "costPerM2ByDiscipline",
];

const helpers = `
function historicalBudgetWorks() {
  return arrayOrFallback(state.evs).map((record) => {
    const typology = evTypologyFromProjectName(record?.project) || record?.typology || "Não informada";
    const area = Number(record?.area || 0);
    const revisionMatch = String(record?.revision || "").match(/\\d+/);
    const revisionNumber = revisionMatch ? Number(revisionMatch[0]) : 0;
    const lines = Object.entries(record?.disciplines || {}).map(([disciplinaId, valorOrcado]) => ({
      disciplinaId,
      valorOrcado: Number(valorOrcado || 0),
      status: "Orçado",
    }));
    return {
      id: \`historical-budget-\${record.id}\`,
      chaveUnica: record?.code || "",
      codigoOriginal: record?.code || "",
      nome: record?.project || "EV histórico",
      tipoUnidade: typology,
      tipologiaObra: typology,
      areaConstruida: area,
      areaEquivalente: area,
      uf: record?.uf || "",
      regiao: record?.region || "",
      status: "Histórico",
      _historicalBudgetWork: true,
      historicalRecordId: record.id,
      ev: {
        id: record.id,
        versaoAtual: revisionNumber,
        status: "Completo",
        lines,
        versions: [{
          numero: revisionNumber,
          data: record?.date || "",
          origem: "Base histórica",
          valorTotal: Number(record?.total || 0),
          custoM2: area ? Number(record?.total || 0) / area : 0,
        }],
        demandaIds: [],
        sicIds: [],
      },
    };
  });
}

function budgetWorks() {
  const ids = new Set();
  for (const demand of state.demands || []) if (demand?.obraId) ids.add(String(demand.obraId));
  for (const sic of state.sics || []) if (sic?.obraId) ids.add(String(sic.obraId));
  for (const contract of state.contracts || []) if (contract?.obraId) ids.add(String(contract.obraId));
  for (const revision of state.budgetRevisions || []) {
    const id = revision?.obraId || revision?.workId;
    if (id) ids.add(String(id));
  }
  const current = (state.works || []).filter((work) => !work?.ev?._virtualEmptyEV || ids.has(String(work?.id || "")));
  return [...historicalBudgetWorks(), ...current];
}
`;

export function scopeBudgetData(input) {
  let source = String(input || "");

  for (const name of BUDGET_SCOPED_FUNCTIONS) {
    source = transformFunction(source, name, body => body.replace(/\bstate\.works\b/g, "budgetWorks()"));
  }

  source = transformFunction(source, "workTotals", body => body.replace(
    "const includeRisk = options.includeRisk === true;",
    "const includeRisk = options.includeRisk === true || work?._historicalBudgetWork === true;"
  ));

  source = transformFunction(source, "renderEV", body => body
    .replace(/\bstate\.works\b/g, "budgetWorks()")
    .replace("Nenhuma obra cadastrada.", "Nenhum EV cadastrado."));

  source = transformFunction(source, "filteredEVWorks", body => body.replace(
    /arrayOrFallback\(state\.works\)\.filter\(\(work\) => !work\.ev\?\._virtualEmptyEV\)/g,
    "arrayOrFallback(budgetWorks()).filter((work) => !work.ev?._virtualEmptyEV && !work._historicalBudgetWork)"
  ));

  const marker = "globalThis.SLT_CLOUD.acceptInitialState(persistedStatePayload());";
  const index = source.lastIndexOf(marker);
  if (index === -1) throw new Error("Ponto de inicialização cloud não encontrado");
  const historicalGlobal = `globalThis.EV_HISTORICAL_DATA = { source: "DADOS EVS(1).xlsx", sheet: "Planilha1", records: arrayOrFallback(state.evs) };\n`;
  source = `${source.slice(0, index)}${helpers}\n${historicalGlobal}${source.slice(index)}`;
  return source;
}
