import fs from 'node:fs';

const replacement = fs.readFileSync(new URL('./portfolio-render.js.txt', import.meta.url), 'utf8').trim();

export function customizePortfolio(input) {
  const source = String(input || '');
  const start = source.indexOf('function renderPortfolio() {');
  const next = source.indexOf('\nfunction renderPortfolioInvestmentPlanTable', start);
  if (start === -1 || next === -1) {
    throw new Error('Função renderPortfolio não encontrada para customização');
  }
  return `${source.slice(0, start)}${replacement}\n${source.slice(next)}`;
}
