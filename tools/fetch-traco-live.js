const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "data", "tracoapp-live.html");
const tracoUrl = "https://cicerochavesf.github.io/tracoapp/";

function extractConfig(html) {
  const url = html.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/)?.[1];
  const key = html.match(/SUPABASE_KEY\s*=\s*['"]([^'"]+)['"]/)?.[1];
  if (!url || !key) {
    throw new Error("Não encontrei SUPABASE_URL/SUPABASE_KEY no HTML do Traço.");
  }
  return { url, key };
}

async function fetchJson(url, key, table, query = "select=*") {
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Falha ao buscar ${table}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

async function main() {
  const htmlResponse = await fetch(tracoUrl);
  if (!htmlResponse.ok) {
    throw new Error(`Falha ao baixar HTML do Traço: ${htmlResponse.status}`);
  }
  const html = await htmlResponse.text();
  fs.writeFileSync(htmlPath, html, "utf8");

  const { url, key } = extractConfig(html);
  const [demandas, sprints] = await Promise.all([
    fetchJson(url, key, "demandas", "select=*&order=codigo.asc"),
    fetchJson(url, key, "sprints", "select=*&order=nome.asc"),
  ]);

  fs.writeFileSync(path.join(root, "data", "traco-live-demandas.json"), `${JSON.stringify(demandas, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(root, "data", "traco-live-sprints.json"), `${JSON.stringify(sprints, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({ demandas: demandas.length, sprints: sprints.length }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
