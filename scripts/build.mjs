import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
const root = process.cwd();
const dest = path.join(root,'dist');
if (path.basename(root) !== 'slt360-release' && !(await fs.readFile('package.json','utf8')).includes('"name": "slt360"')) throw new Error('Diretório de projeto inválido');
await fs.rm(dest,{recursive:true,force:true});
await fs.mkdir(dest,{recursive:true});
await fs.cp('public',dest,{recursive:true});
await build({entryPoints:['src/boot.js'],outdir:dest,bundle:true,splitting:true,format:'esm',target:'es2022',minify:true,sourcemap:false,entryNames:'boot',chunkNames:'chunk-[hash]',legalComments:'eof'});
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
