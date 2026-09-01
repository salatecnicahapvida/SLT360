const fs = require("fs");
const path = require("path");

const root = __dirname;
const outputFile = path.join(root, "SLT360-export-teste.html");

const files = {
  html: "index.html",
  css: "styles.css",
  tracoState: path.join("data", "traco-imported-state.js"),
  sicBi: path.join("data", "sic-bi-data.js"),
  investmentPlan: path.join("data", "investment-plan-data.js"),
  unitRegistry: path.join("data", "unit-registry-data.js"),
  maintenanceData: path.join("data", "maintenance-data.js"),
  capexControl: path.join("data", "capex-control-data.js"),
  commissionObras: path.join("data", "commission-obras-data.js"),
  sicApprovalDashboard: path.join("data", "sic-approval-dashboard-html.js"),
  app: "app.js",
};

const mimeByExtension = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function escapeScript(code) {
  return code.replace(/<\/script/gi, "<\\/script");
}

function escapeStyle(css) {
  return css.replace(/<\/style/gi, "<\\/style");
}

function assetDataUri(fileName) {
  const absolutePath = path.join(root, "assets", fileName);
  const mime = mimeByExtension[path.extname(fileName).toLowerCase()] || "application/octet-stream";
  const content = fs.readFileSync(absolutePath).toString("base64");
  return `data:${mime};base64,${content}`;
}

function inlineAssets(text) {
  const assetDir = path.join(root, "assets");
  return fs.readdirSync(assetDir).reduce((result, fileName) => {
    const escapedName = fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`assets/${escapedName}`, "g");
    return result.replace(pattern, assetDataUri(fileName));
  }, text);
}

function scriptTag(code) {
  return `<script>\n${escapeScript(code)}\n</script>`;
}

const styles = inlineAssets(readText(files.css));
const scripts = [
  readText(files.tracoState),
  readText(files.sicBi),
  readText(files.investmentPlan),
  readText(files.unitRegistry),
  readText(files.maintenanceData),
  readText(files.capexControl),
  readText(files.commissionObras),
  readText(files.sicApprovalDashboard),
  inlineAssets(readText(files.app)),
];

let html = inlineAssets(readText(files.html));

html = html.replace(
  /<link rel="stylesheet" href="styles\.css(?:\?[^"]*)?" \/>/,
  `<style>\n${escapeStyle(styles)}\n</style>`
);

html = html
  .replace(/    <script src="data\/traco-imported-state\.js(?:\?[^"]*)?"><\/script>\n/, "")
  .replace(/    <script src="data\/sic-bi-data\.js(?:\?[^"]*)?"><\/script>\n/, "")
  .replace(/    <script src="data\/investment-plan-data\.js(?:\?[^"]*)?"><\/script>\n/, "")
  .replace(/    <script src="data\/unit-registry-data\.js(?:\?[^"]*)?"><\/script>\n/, "")
  .replace(/    <script src="data\/maintenance-data\.js(?:\?[^"]*)?"><\/script>\n/, "")
  .replace(/    <script src="data\/capex-control-data\.js(?:\?[^"]*)?"><\/script>\n/, "")
  .replace(/    <script src="data\/commission-obras-data\.js(?:\?[^"]*)?"><\/script>\n/, "")
  .replace(/    <script src="data\/sic-approval-dashboard-html\.js(?:\?[^"]*)?"><\/script>\n/, "")
  .replace(/    <script src="app\.js(?:\?[^"]*)?"><\/script>/, scripts.map(scriptTag).join("\n"));

html = html.replace(
  "<title>SLT 360</title>",
  "<title>SLT 360 - Exportação Portátil</title>"
);

html = `<!--\n  SLT 360 - Exportação portátil para teste.\n  Gerado em ${new Date().toISOString()}.\n  Arquivo único: CSS, dados, scripts e imagens embutidos.\n-->\n${html}`;

fs.writeFileSync(outputFile, html, "utf8");

const sizeMb = fs.statSync(outputFile).size / 1024 / 1024;
console.log(`Exportação criada: ${outputFile}`);
console.log(`Tamanho: ${sizeMb.toFixed(2)} MB`);
