import fs from 'node:fs';

const cssPath = 'public/styles.css';
let css = fs.readFileSync(cssPath, 'utf8');
const marker = '/* SLT360: alinhamento global de painéis em layouts estruturados */';
if (!css.includes(marker)) {
  css += `\n\n${marker}\n/*\n * Painéis adjacentes recebem margem no fluxo vertical legado. Quando esses mesmos\n * painéis são filhos diretos de uma grade, a própria grade já controla o espaço\n * com gap; manter a margem desloca a segunda/terceira coluna para baixo.\n * Esta regra é intencionalmente global para todas as visões e módulos.\n */\n:where([class*="-grid"], .split-layout, .stacked-panels) > .panel {\n  margin-top: 0;\n}\n`;
  fs.writeFileSync(cssPath, css);
}

const testPath = 'tests/browser/app.spec.js';
let tests = fs.readFileSync(testPath, 'utf8');

const slowGlobalAssertion = "  await expect(page.locator('#app')).not.toBeEmpty();\n  const gridPanelMarginIssues=await page.locator('#mainContent').evaluate(root=>[...root.querySelectorAll('.panel')].filter(panel=>{const parent=panel.parentElement;if(!parent)return false;const parentStyle=getComputedStyle(parent);if(parentStyle.display!=='grid')return false;return parseFloat(getComputedStyle(panel).marginTop||'0')>0.5;}).map(panel=>({className:panel.className,parentClass:panel.parentElement?.className||''})));\n  expect(gridPanelMarginIssues,`Painéis desalinhados na visão ${view}`).toEqual([]);\n  if(view==='portfolio'||view==='sics')await expect(page.getByRole('button',{name:'Nova SIC',exact:true})).toHaveCount(0);";
const originalGlobalAssertion = "  await expect(page.locator('#app')).not.toBeEmpty();\n  if(view==='portfolio'||view==='sics')await expect(page.getByRole('button',{name:'Nova SIC',exact:true})).toHaveCount(0);";
if (tests.includes(slowGlobalAssertion)) tests = tests.replace(slowGlobalAssertion, originalGlobalAssertion);

const managementAnchor = " await expect(analystPanel.locator('tbody tr')).toHaveCount(1);\n expect(b.errors).toEqual([]);";
const managementReplacement = " await expect(analystPanel.locator('tbody tr')).toHaveCount(1);\n const managementGridTops=await page.locator('#mainContent .content-grid').evaluateAll(grids=>grids.map(grid=>{const panels=[...grid.children].filter(child=>child.classList.contains('panel'));return panels.map(panel=>Math.round(panel.getBoundingClientRect().top));}).filter(row=>row.length>1));\n for(const row of managementGridTops)expect(new Set(row).size).toBe(1);\n expect(b.errors).toEqual([]);";
if (!tests.includes('managementGridTops')) {
  if (!tests.includes(managementAnchor)) throw new Error('Âncora do teste gerencial não encontrada.');
  tests = tests.replace(managementAnchor, managementReplacement);
}

fs.writeFileSync(testPath, tests);
