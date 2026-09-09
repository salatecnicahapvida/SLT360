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
  const totalCents = Math.round(Number(record.total || 0) * 100);
  const originalCents = totalCents - cents;
  const percentage = totalCents > 0 ? (cents / totalCents) * 100 : null;
  const threshold = percentage !== null && percentage > 5
    ? "alert"
    : percentage !== null && percentage >= 3 ? "warning" : "normal";
  return {
    included,
    total: cents / 100,
    original: originalCents / 100,
    percentage,
    exceedsLimit: percentage !== null && percentage > 5,
    threshold,
    detailed: items.length > 0,
  };
}
