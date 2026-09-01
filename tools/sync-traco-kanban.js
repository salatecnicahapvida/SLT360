const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const statePath = path.join(root, "data", "traco-imported-state.js");
const demandPath = path.join(root, "data", "traco-live-demandas.json");
const sprintPath = path.join(root, "data", "traco-live-sprints.json");

function readImportedState() {
  const code = fs.readFileSync(statePath, "utf8");
  const sandbox = {};
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.runInNewContext(code, sandbox);
  return sandbox.TRACO_IMPORTED_STATE || sandbox.window.TRACO_IMPORTED_STATE;
}

function readJson(pathname) {
  return JSON.parse(fs.readFileSync(pathname, "utf8").replace(/^\uFEFF/, ""));
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slug(value) {
  return normalizeText(value).replace(/\s+/g, "-").slice(0, 52) || "sem-nome";
}

function sprintId(name) {
  const number = String(name || "").match(/\d+/)?.[0];
  return number ? `sprint-${number}` : `sprint-${slug(name)}`;
}

function toIsoDate(value) {
  const text = String(value || "").trim();
  if (!text || text === "—") return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  return "";
}

function typeToSlt(value) {
  const text = normalizeText(value);
  if (text.includes("reemissao")) return "ReemissaoCompleta";
  if (text.includes("emissaoinicial")) return "EmissaoInicial";
  if (text.includes("revisao")) return "ReemissaoCompleta";
  if (text.includes("sic") || text.includes("informacao")) return "SIC";
  return "EmissaoInicial";
}

function statusToColumn(value) {
  const text = normalizeText(value);
  if (text === "fazer" || text.includes("iniciar")) return "fazer";
  if (text === "fazendo" || text.includes("execucao")) return "fazendo";
  if (text.includes("paus")) return "pausado";
  if (text.includes("sala tecnica")) return "validacaoST";
  if (text.includes("validacao obras") || text.includes("validacao")) return "validacaoObras";
  if (text.includes("conclu")) return "concluido";
  if (text.includes("cancel")) return "cancelado";
  return "fazer";
}

function scoreName(source, candidate) {
  const tokens = normalizeText(source).split(" ").filter((part) => part.length > 2);
  const target = normalizeText(candidate);
  if (!tokens.length || !target) return 0;
  return tokens.filter((part) => target.includes(part)).length / tokens.length;
}

function blankEv(id) {
  return {
    id: `ev-${id.toLowerCase()}`,
    versaoAtual: 0,
    status: "Rascunho",
    lines: [],
    versions: [],
    anexos: [],
  };
}

function findWork(workRows, obraName) {
  const normalized = normalizeText(obraName);
  const exact = workRows.find((work) => normalizeText(work.nome || work.name || work.unit) === normalized);
  if (exact) return exact;

  const code = String(obraName || "").match(/\b\d{4}\b/)?.[0];
  if (code) {
    const byCode = workRows.find((work) => String(work.codigoOriginal || work.code || "").trim() === code);
    if (byCode) return byCode;
  }

  const scored = workRows
    .map((work) => ({ work, score: scoreName(obraName, work.nome || work.name || work.unit) }))
    .filter((item) => item.score >= 0.6)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.work || null;
}

function makePlaceholderWork(sourceRow, usedIds, ordinal) {
  let id = `TRACO-DEMANDA-${String(ordinal).padStart(3, "0")}`;
  while (usedIds.has(id)) id = `TRACO-DEMANDA-${String(++ordinal).padStart(3, "0")}`;
  usedIds.add(id);
  const nome = String(sourceRow.obra || "Obra sem cadastro").trim();
  return {
    id,
    nome,
    name: nome,
    unit: nome,
    codigoOriginal: "0000",
    code: "0000",
    chaveUnica: `TRACO-${slug(nome).toUpperCase().slice(0, 20)}`,
    tipoUnidade: "Não informada",
    type: "Não informada",
    cidade: "",
    city: "",
    uf: "",
    state: "",
    regiao: "",
    region: "",
    prazoDias: "",
    classificacaoObra: "Não informada",
    classification: "Não informada",
    tipologiaObra: "Não informada",
    typology: "Não informada",
    areaEquivalente: 0,
    areaConstruida: 0,
    ordemInternaSAP: "",
    cnpj: "",
    endereco: "",
    status: "Planejada",
    plannedValue: 0,
    valorAprovado: 0,
    capexAprovado: 0,
    ev: blankEv(id),
    notes: "Cadastro placeholder criado pela sincronização de demandas do Traço.",
    createdAt: sourceRow.created_at || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function sicDemandId(demand, usedIds, fallbackIndex) {
  const lecom = demand?.sicMetadata?.lecomNumber || demand?.sicMetadata?.numeroSic || "";
  const digits = String(lecom).replace(/\D/g, "");
  const rawBase = digits ? `SIC-${digits}` : `SIC-${String(demand.id || fallbackIndex).replace(/^SIC-?/i, "")}`;
  let candidate = rawBase;
  let suffix = 2;
  while (usedIds.has(candidate)) {
    candidate = `${rawBase}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(candidate);
  return candidate;
}

function main() {
  const imported = readImportedState();
  const liveDemandRows = readJson(demandPath);
  const liveSprintRows = readJson(sprintPath);
  const now = new Date().toISOString();

  const works = [...(imported.works || [])];
  const previousDemandsById = new Map((imported.demands || []).map((demand) => [demand.id, demand]));
  const usedWorkIds = new Set(works.map((work) => work.id));
  const createdWorks = [];
  const matched = [];
  const missing = [];

  const nonSicDemands = liveDemandRows
    .filter((row) => typeToSlt(row.tipo) !== "SIC")
    .map((row, index) => {
      const previous = previousDemandsById.get(row.codigo) || {};
      let work = findWork(works, row.obra);
      if (!work) {
        work = makePlaceholderWork(row, usedWorkIds, index + 1);
        works.push(work);
        createdWorks.push({ demanda: row.codigo, obra: row.obra, workId: work.id });
        missing.push(row.obra);
      } else {
        matched.push({ demanda: row.codigo, obra: row.obra, workId: work.id, nomeSLT: work.nome });
      }

      const mappedColumn = statusToColumn(row.status);
      const mappedDeliveryDate = toIsoDate(row.prazo);

      return {
        id: row.codigo,
        obraId: work.id,
        obraNome: row.obra || work.nome,
        tipo: typeToSlt(row.tipo),
        sprintId: sprintId(row.sprint),
        analistaResponsavel: row.analista && row.analista !== "—" ? row.analista : "",
        analistasComplementares: Array.isArray(row.analistas_comp) ? row.analistas_comp : [],
        prioridade: row.prioridade || "Média",
        coluna: mappedColumn,
        dataPrevistaInicio: previous.dataPrevistaInicio || "",
        dataInicioReal: previous.dataInicioReal || "",
        dataPrevEnvioValidacaoObras: previous.dataPrevEnvioValidacaoObras || "",
        dataEnvioRealValidacaoObras: previous.dataEnvioRealValidacaoObras || "",
        dataValidacaoObras: previous.dataValidacaoObras || "",
        dataPrevistaEntrega: mappedDeliveryDate || previous.dataPrevistaEntrega || "",
        dataEntregaReal: mappedColumn === "concluido"
          ? previous.dataEntregaReal || mappedDeliveryDate || ""
          : previous.dataEntregaReal || "",
        observacao: previous.observacao || row.pendencia_desc || row.tipo || "",
        nota: previous.nota || "",
        sicIds: Array.isArray(previous.sicIds) ? previous.sicIds : [],
        projetos: previous.projetos || {},
        projetosCustom: Array.isArray(previous.projetosCustom) ? previous.projetosCustom : [],
        valorAlteracaoEV: row.valor_alteracao_ev ?? undefined,
        tracoSource: {
          sprint: row.sprint,
          status: row.status,
          tipo: row.tipo,
          valor: row.valor,
          prazo: row.prazo,
          pendencia: !!row.pendencia,
          pendenciaDescricao: row.pendencia_desc || "",
          createdAt: row.created_at || "",
        },
        createdAt: row.created_at || now,
        updatedAt: now,
      };
    })
    .sort((a, b) => String(a.id).localeCompare(String(b.id), "pt-BR", { numeric: true }));

  const demandIds = new Set(nonSicDemands.map((demand) => demand.id));
  const existingSicDemands = (imported.demands || [])
    .filter((demand) => typeToSlt(demand.tipo) === "SIC")
    .map((demand, index) => {
      const shouldNamespace = demandIds.has(demand.id) || /^DEM-/i.test(String(demand.id || ""));
      if (!shouldNamespace) {
        demandIds.add(demand.id);
        return demand;
      }
      return {
        ...demand,
        id: sicDemandId(demand, demandIds, index + 1),
        previousDemandId: demand.previousDemandId || demand.id,
        updatedAt: now,
      };
    });
  const updatedSprints = liveSprintRows.map((row) => ({
    id: sprintId(row.nome),
    nome: row.nome,
    dataInicio: row.inicio || row.dataInicio || "",
    dataFim: row.fim || row.dataFim || "",
    status: row.status || "Planejada",
  }));

  const updated = {
    ...imported,
    works,
    sprints: updatedSprints,
    demands: [...nonSicDemands, ...existingSicDemands],
    version: `${imported.version || "base"} + traco-live-kanban-${now.slice(0, 10)}`,
    source: `${imported.source || "SLT360"} + Traço live Supabase`,
    tracoDemandSync: {
      total: nonSicDemands.length,
      previousTotal: (imported.demands || []).length,
      preservedSicDemands: existingSicDemands.length,
      matchedWorks: matched.length,
      createdPlaceholderWorks: createdWorks.length,
      missingWorkNames: [...new Set(missing)],
      sourceFile: "data/traco-live-demandas.json",
      sprintSourceFile: "data/traco-live-sprints.json",
      sourceUrl: "https://cicerochavesf.github.io/tracoapp/",
      syncedAt: now,
    },
  };

  const stamp = now.replace(/[-:.TZ]/g, "").slice(0, 14);
  const backupPath = path.join(root, "data", `traco-imported-state.before-traco-live-kanban-${stamp}.js`);
  fs.copyFileSync(statePath, backupPath);
  fs.writeFileSync(
    statePath,
    `window.TRACO_IMPORTED_STATE = ${JSON.stringify(updated, null, 2)};\n`,
    "utf8"
  );

  console.log(
    JSON.stringify(
      {
        backup: path.relative(root, backupPath),
        works: works.length,
        demands: updated.demands.length,
        nonSicDemands: nonSicDemands.length,
        preservedSicDemands: existingSicDemands.length,
        sprints: updatedSprints.length,
        matchedWorks: matched.length,
        createdPlaceholderWorks: createdWorks.length,
        missingWorkNames: [...new Set(missing)],
      },
      null,
      2
    )
  );
}

main();
