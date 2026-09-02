import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { cloudifyPublicApp } from './cloudify-public-app.mjs';

const root = process.cwd();
const dest = path.join(root, 'dist');
const tempDir = path.join(root, '.slt360-build');
const cloudAppPath = path.join(tempDir, 'app-cloud.js');
const bootPath = path.resolve(root, 'src', 'boot.js');

const packageJson = await fs.readFile(path.join(root, 'package.json'), 'utf8');
if (!packageJson.includes('"name": "slt360"')) throw new Error('Diretório de projeto inválido');

await fs.rm(dest, { recursive: true, force: true });
await fs.rm(tempDir, { recursive: true, force: true });
await fs.mkdir(dest, { recursive: true });
await fs.mkdir(tempDir, { recursive: true });

try {
  // O public continua sendo a fonte dos ajustes visuais mais recentes.
  await fs.cp(path.join(root, 'public'), dest, { recursive: true });

  // A versão standalone não é publicada. O build gera uma cópia cloud-safe do app atual.
  const latestPublicApp = await fs.readFile(path.join(root, 'public', 'app.js'), 'utf8');
  const cloudApp = cloudifyPublicApp(latestPublicApp);
  await fs.writeFile(cloudAppPath, cloudApp, 'utf8');

  await fs.rm(path.join(dest, 'app.js'), { force: true });
  await fs.rm(path.join(dest, 'data'), { recursive: true, force: true });

  const result = await build({
    entryPoints: [bootPath],
    outdir: dest,
    bundle: true,
    splitting: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    sourcemap: false,
    entryNames: 'boot-[hash]',
    chunkNames: 'chunk-[hash]',
    legalComments: 'eof',
    metafile: true,
    plugins: [
      {
        name: 'slt360-latest-public-app',
        setup(buildApi) {
          buildApi.onResolve({ filter: /^\.\/app\.js$/ }, args => {
            if (path.resolve(args.importer) === bootPath) return { path: cloudAppPath };
            return null;
          });
        },
      },
    ],
  });

  const entry = Object.entries(result.metafile.outputs).find(([, info]) => {
    if (!info.entryPoint) return false;
    return info.entryPoint === 'src/boot.js' || path.resolve(root, info.entryPoint) === bootPath;
  });
  if (!entry) throw new Error('Entrada do aplicativo não encontrada no pacote');

  let html = await fs.readFile(path.join(dest, 'index.html'), 'utf8');
  if (!html.includes('src="boot.js"')) throw new Error('Referência da entrada não encontrada no HTML');
  html = html.replace('src="boot.js"', `src="${path.basename(entry[0])}"`);

  for (const name of ['cloud.css', 'styles.css']) {
    const file = path.join(dest, name);
    const content = await fs.readFile(file);
    const version = createHash('sha256').update(content).digest('hex').slice(0, 16);
    const versionedName = name.replace('.css', `-${version}.css`);
    await fs.rename(file, path.join(dest, versionedName));
    const reference = new RegExp(`href="${name.replace('.', '\\.')}[^\"]*"`);
    if (!reference.test(html)) throw new Error(`Referência de estilo não encontrada: ${name}`);
    html = html.replace(reference, `href="${versionedName}"`);
  }

  await fs.writeFile(path.join(dest, 'index.html'), html, 'utf8');
  await fs.writeFile(path.join(dest, '.nojekyll'), '');

  const forbidden = /admin360|gestao360|analista360|orcamento360|projetos360|sb_secret_[A-Za-z0-9_-]{15,}|\bOBR-\d{4}-\d{3}\b|\bDEM-\d{3}\b|Novo Hospital Ibirapuera/;
  async function scan(dir) {
    for (const item of await fs.readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isDirectory()) {
        await scan(file);
      } else if (/\.(js|html|json)$/i.test(item.name) && forbidden.test(await fs.readFile(file, 'utf8'))) {
        throw new Error(`Revisar possível conteúdo privado: ${file}`);
      }
    }
  }

  await scan(dest);
  await scan(path.join(root, 'src'));
  console.log('Pacote público gerado e verificado em dist/. Interface atual preservada; login e persistência usam Supabase.');
} finally {
  await fs.rm(tempDir, { recursive: true, force: true });
}
