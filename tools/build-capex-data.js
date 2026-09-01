const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourcePath =
  process.argv[2] ||
  "C:\\Users\\thalles.silveira\\Downloads\\CONTROLE DE CAPEX SISTEMA.xlsx";
const outputPath = path.join(root, "data", "capex-control-data.js");

function decodeXml(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function columnIndex(ref = "") {
  const letters = String(ref).replace(/[0-9]/g, "");
  return [...letters].reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0);
}

function parseNumber(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const cleaned = raw.replace(/R\$/g, "").replace(/\s/g, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

function excelDate(value) {
  const serial = Number(value);
  if (!Number.isFinite(serial) || serial <= 0) return String(value || "");
  const date = new Date(Date.UTC(1899, 11, 30));
  date.setUTCDate(date.getUTCDate() + Math.floor(serial));
  return date.toISOString().slice(0, 10);
}

function extractWorkbook(filePath) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "slt360-capex-"));
  childProcess.execFileSync("tar", ["-xf", filePath, "-C", tempDir], {
    stdio: "ignore",
  });
  return tempDir;
}

function parseSharedStrings(tempDir) {
  const file = path.join(tempDir, "xl", "sharedStrings.xml");
  if (!fs.existsSync(file)) return [];
  const xml = fs.readFileSync(file, "utf8");
  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) =>
    decodeXml(match[1])
  );
}

function parseRows(tempDir, sheetNumber, sharedStrings) {
  const file = path.join(tempDir, "xl", "worksheets", `sheet${sheetNumber}.xml`);
  const xml = fs.readFileSync(file, "utf8");
  return [...xml.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)].map((rowMatch) => {
    const rowNumber = Number((rowMatch[1].match(/\br="(\d+)"/) || [])[1] || 0);
    const cells = {};
    for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const ref = (attrs.match(/\br="([A-Z]+\d+)"/) || [])[1] || "";
      const type = (attrs.match(/\bt="([^"]+)"/) || [])[1] || "";
      const valueMatch = body.match(/<v>([\s\S]*?)<\/v>/);
      const inlineMatch = body.match(/<is\b[^>]*>([\s\S]*?)<\/is>/);
      let value = "";
      if (type === "s" && valueMatch) {
        value = sharedStrings[Number(valueMatch[1])] || "";
      } else if (type === "inlineStr" && inlineMatch) {
        value = decodeXml(inlineMatch[1]);
      } else if (valueMatch) {
        value = decodeXml(valueMatch[1]);
      }
      if (value !== "") cells[columnIndex(ref)] = value;
    }
    return { rowNumber, cells };
  });
}

function cell(cells, index) {
  return String(cells[index] ?? "");
}

function addAgg(map, key, value) {
  const label = key || "Não informado";
  map.set(label, (map.get(label) || 0) + value);
}

function toRows(map) {
  return [...map.entries()]
    .map(([label, valor]) => ({ label, valor: Math.round(valor * 100) / 100 }))
    .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor));
}

function buildData() {
  const tempDir = extractWorkbook(sourcePath);
  const shared = parseSharedStrings(tempDir);

  const dePara = parseRows(tempDir, 1, shared)
    .filter(({ rowNumber }) => rowNumber >= 3)
    .map(({ rowNumber, cells }) => ({
      ordemInterna: cell(cells, 2),
      descricao: cell(cells, 3),
      obraPlano: cell(cells, 7),
      classificacaoPacote: cell(cells, 8),
      classificacaoHead: cell(cells, 9),
      grupoExecutivo: cell(cells, 10),
      detalhamento: cell(cells, 11),
      categoriaOrc: cell(cells, 12),
      detalhamentoOrc: cell(cells, 13),
      sourceRow: rowNumber,
    }))
    .filter((row) => row.ordemInterna || row.descricao || row.obraPlano);

  const baseOi = parseRows(tempDir, 2, shared)
    .filter(({ rowNumber }) => rowNumber >= 3)
    .map(({ rowNumber, cells }) => ({
      ordemInterna: cell(cells, 2),
      descricao: cell(cells, 3),
      montantePlanejado: parseNumber(cell(cells, 4)),
      recursosAtribuidos: parseNumber(cell(cells, 5)),
      montanteDisponivel: parseNumber(cell(cells, 6)),
      exercicio: cell(cells, 7),
      sourceRow: rowNumber,
    }))
    .filter((row) => row.ordemInterna || row.descricao);

  const byOi = new Map();
  const byMonth = new Map();
  const byMonthPlanned = new Map();
  const byMonthUnplanned = new Map();
  const byMonthOper = new Map();
  const byCategory = new Map();
  const byCostCenter = new Map();
  const consumoTopLines = [];
  let consumoCount = 0;
  let consumoTotal = 0;

  for (const { rowNumber, cells } of parseRows(tempDir, 3, shared)) {
    if (rowNumber < 3) continue;
    const valor = parseNumber(cell(cells, 22));
    const descricaoPrograma = cell(cells, 2);
    const ordemInterna = cell(cells, 3);
    if (!valor && !descricaoPrograma && !ordemInterna) continue;
    const obraPlano = cell(cells, 19);
    const categoriaResumo = cell(cells, 21);
    const mes = cell(cells, 23);
    const centroCusto = cell(cells, 15);
    const workKey = `${obraPlano} ${descricaoPrograma}`.toUpperCase();
    const isOper = /_OPER\b|OPERACIONAL|OPREACIONAL/.test(workKey);
    const isUnplanned = /NAO PLANEJADA|NÃO PLANEJADA|NAO_PLANEJADA|NÃO_PLANEJADA/.test(workKey);
    consumoCount += 1;
    consumoTotal += valor;
    addAgg(byOi, obraPlano, valor);
    addAgg(byMonth, mes, valor);
    if (isUnplanned) addAgg(byMonthUnplanned, mes, valor);
    else if (isOper) addAgg(byMonthOper, mes, valor);
    else addAgg(byMonthPlanned, mes, valor);
    addAgg(byCategory, categoriaResumo, valor);
    addAgg(byCostCenter, centroCusto, valor);
    if (valor) {
      consumoTopLines.push({
        obraPlano,
        ordemInterna,
        descricaoPrograma,
        categoriaValor: cell(cells, 4),
        categoriaResumo,
        valor,
        mes,
        fornecedor: cell(cells, 7),
        centroCusto,
        dataLancamento: excelDate(cell(cells, 6)),
        documentoReferencia: cell(cells, 10),
        sourceRow: rowNumber,
      });
    }
  }

  const transferencias = parseRows(tempDir, 4, shared)
    .filter(({ rowNumber }) => rowNumber >= 3)
    .map(({ rowNumber, cells }) => ({
      codOrigem: cell(cells, 3),
      origem: cell(cells, 4),
      grupoOrigem: cell(cells, 5),
      codDestino: cell(cells, 6),
      destino: cell(cells, 7),
      grupoDestino: cell(cells, 8),
      valor: parseNumber(cell(cells, 9)),
      orcOrigem: "",
      orcDestino: "",
      numeroDocumento: cell(cells, 10),
      justificativa: cell(cells, 11),
      data: excelDate(cell(cells, 12)),
      sourceRow: rowNumber,
    }))
    .filter((row) => row.origem || row.destino || row.justificativa);

  const data = {
    source: path.basename(sourcePath),
    importedAt: new Date().toISOString(),
    baseOi,
    dePara,
    transferencias,
    consumo: {
      count: consumoCount,
      total: Math.round(consumoTotal * 100) / 100,
      byOi: toRows(byOi),
      byMonth: toRows(byMonth),
      byMonthPlanned: toRows(byMonthPlanned),
      byMonthUnplanned: toRows(byMonthUnplanned),
      byMonthOper: toRows(byMonthOper),
      byCategory: toRows(byCategory),
      byCostCenter: toRows(byCostCenter),
      topLines: consumoTopLines
        .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
        .slice(0, 500),
    },
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `globalThis.CAPEX_CONTROL_DATA = ${JSON.stringify(data)};\n`,
    "utf8"
  );

  console.log(
    `CAPEX data: OIs=${baseOi.length}, DePara=${dePara.length}, Consumo=${consumoCount}, Transferencias=${transferencias.length}`
  );
  console.log(outputPath);
}

buildData();
