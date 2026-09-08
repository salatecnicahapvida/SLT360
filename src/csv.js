export function csvCell(value) {
  let text=String(value ?? '').replace(/[\r\n]/g,' ').trim();
  // Spreadsheet programs interpret these prefixes even inside quoted CSV cells.
  if(typeof value!=='number' && /^[=+\-@\t]/.test(text))text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}
