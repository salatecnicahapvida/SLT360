import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
const root = process.cwd();
const dest = path.join(root,'dist');
if (path.basename(root) !== 'slt360-release' && !(await fs.readFile('package.json','utf8')).includes('"name": "slt360"')) throw new Error('Diretório de projeto inválido');
await fs.rm(dest,{recursive:true,force:true});
await fs.mkdir(dest,{recursive:true});
await fs.cp('public',dest,{recursive:true});
const result = await build({entryPoints:['src/boot.js'],outdir:dest,bundle:true,splitting:true,format:'esm',target:'es2022',minify:true,sourcemap:false,entryNames:'boot-[hash]',chunkNames:'chunk-[hash]',legalComments:'eof',metafile:true});
const entry = Object.entries(result.metafile.outputs).find(([, info]) => info.entryPoint === 'src/boot.js');
if (!entry) throw new Error('Entrada do aplicativo não encontrada no pacote');
let html = await fs.readFile(path.join(dest,'index.html'),'utf8');
if (!html.includes('src="boot.js"')) throw new Error('Referência da entrada não encontrada no HTML');
html = html.replace('src="boot.js"', `src="${path.basename(entry[0])}"`);
// Cada publicação referencia seus próprios recursos, mesmo com cache do navegador/CDN.
for (const name of ['cloud.css','styles.css']) {
 const content = await fs.readFile(path.join(dest,name));
 const version = createHash('sha256').update(content).digest('hex').slice(0,16);
 const versionedName = name.replace('.css',`-${version}.css`);
 await fs.rename(path.join(dest,name),path.join(dest,versionedName));
 const reference = new RegExp(`href="${name.replace('.', '\\.')}[^\"]*"`);
 if (!reference.test(html)) throw new Error('Referência de estilo não encontrada: '+name);
 html = html.replace(reference, `href="${versionedName}"`);
}
await fs.writeFile(path.join(dest,'index.html'),html);
await fs.writeFile(path.join(dest,'.nojekyll'),'');
const forbidden = /admin360|gestao360|analista360|sb_secret_[A-Za-z0-9_-]{15,}|\bOBR-\d{4}\b|\bDEM-\d{3}\b|Novo Hospital Ibirapuera/;
async function scan(dir) {
 for (const item of await fs.readdir(dir,{withFileTypes:true})) {
  const file = path.join(dir,item.name);
  if (item.isDirectory()) await scan(file);
  else if (/\.(js|html|json)$/i.test(item.name) && forbidden.test(await fs.readFile(file,'utf8'))) throw new Error('Revisar possível conteúdo privado: '+file);
 }
}
await scan(dest);
await scan('src');
console.log('Pacote público gerado e verificado em dist/. Nenhuma base privada é copiada.');
