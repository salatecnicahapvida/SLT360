export function isEVAdditiveItem(item) {
  const description = String(item.description || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const discipline = String(item.disciplineId || '').toLowerCase();
  if (discipline === 'taxa-risco' || /\btaxa\b.*\brisco\b/.test(description)) return false;
  return /\b(?:sic|sics|adt|aditivo|aditivos)\b/.test(description) || discipline === 'sics';
}

export function evAdditiveSummary(record, items = []) {
  const included = items.filter(isEVAdditiveItem);
  // Detailed rows are authoritative. Aggregated discipline totals omit SICs in other disciplines.
  const cents = items.length
    ? included.reduce((sum, item) => sum + Math.round(Number(item.value || 0) * 100), 0)
    : Math.round(Number(record.disciplines?.sics || 0) * 100);
  return { included, total: cents / 100, original: (Math.round(Number(record.total || 0) * 100) - cents) / 100, detailed: items.length > 0 };
}
