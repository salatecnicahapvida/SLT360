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
text = text.replace(old, new, 1)
text = text.replace(
    '''text = text.replace("'Salvo no banco'", "'Sincronizado'")''',
    '''text = text.replace("'Salvo no banco'", "'Sincronizado'")\ntext = text.replace("'Não salvo — recarregue antes de continuar'", "'Falha na sincronização'")''',
    1,
)
text = text.replace(
    "await expect(card.locator('.demand-card-value')).toContainText('R$ 0,00');",
    "await expect(card.locator('.demand-card-value')).toContainText(/R\\$\\s*0/);",
    1,
)
path.write_text(text, encoding='utf-8')
print('Patch operacional reparado.')
