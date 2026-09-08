import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';

const root = process.cwd();
const dest = path.resolve(root, 'dist');
if (JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).name !== 'slt360' || path.dirname(dest) !== root) throw new Error('Diretório de projeto inválido');
await fs.rm(dest, {recursive:true,force:true});
await fs.mkdir(dest, {recursive:true});
// Explicit allowlist: operational exports and standalone pages never enter the release.
for (const file of ['index.html','styles.css','cloud.css','assets']) await fs.cp(path.join(root,'public',file),path.join(dest,file),{recursive:true});
const result = await build({
  entryPoints:['src/boot.js'], outdir:dest, bundle:true, splitting:true, format:'esm',
  platform:'browser', target:'es2022', minify:true, sourcemap:false,
  loader:{'.css':'text','.html':'text'},
  entryNames:'boot-[hash]', chunkNames:'chunk-[hash]', legalComments:'eof', metafile:true,
});
const entry = Object.entries(result.metafile.outputs).find(([,info]) => info.entryPoint === 'src/boot.js');
if (!entry) throw new Error('Entrada do aplicativo não encontrada');
let html = await fs.readFile(path.join(dest,'index.html'),'utf8');
if (!html.includes('src="boot.js"')) throw new Error('Entrada ausente no HTML');
html = html.replace('src="boot.js"', `src="${path.basename(entry[0])}"`);
for (const name of ['styles.css','cloud.css']) {
  const file = path.join(dest,name);
  const hash = createHash('sha256').update(await fs.readFile(file)).digest('hex').slice(0,16);
  const versioned = name.replace('.css',`-${hash}.css`);
  await fs.rename(file,path.join(dest,versioned));
  html = html.replace(new RegExp(`href="${name.replace('.','\\.')}[^\"]*"`),`href="${versioned}"`);
}
await fs.writeFile(path.join(dest,'index.html'),html);
await fs.writeFile(path.join(dest,'.nojekyll'),'');
const forbidden = /sb_secret_[A-Za-z0-9_-]{15,}|SEED_OBRAS|controle-evs:obras|sic-approval-dashboard\.html|admin360|gestao360|analista360/;
for (const name of await fs.readdir(dest)) if (/\.(js|html|json)$/.test(name) && forbidden.test(await fs.readFile(path.join(dest,name),'utf8'))) throw new Error(`Conteúdo legado ou privado no pacote: ${name}`);
await fs.mkdir(path.join(root,'outputs'),{recursive:true});
await fs.writeFile(path.join(root,'outputs','build-meta.json'),JSON.stringify(result.metafile));
console.log('Build verificado em dist/: fonte única em src/, dados operacionais no Supabase.');
