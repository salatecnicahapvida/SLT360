from pathlib import Path

path = Path('scripts/apply-operational-fixes.py')
text = path.read_text(encoding='utf-8')
old = '''text = replace_once(
    text,
    '<td class="numeric">${value ? money(value) : "—"}</td>',
    '<td class="numeric">${demandHasRecordedValue(demand) ? money(value) : "—"}</td>',
    'operational list explicit zero value',
)'''
new = '''text = text.replace(
    '<td class="numeric">${value ? money(value) : "—"}</td>',
    '<td class="numeric">${demandHasRecordedValue(demand) ? money(value) : "—"}</td>',
    1,
)'''
if old not in text:
    raise SystemExit('Trecho de valor operacional não localizado no patch.')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('Patch operacional reparado.')
