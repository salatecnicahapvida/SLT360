# Diagnóstico e Correção do SIC por Disciplina

## 1. Resumo

O principal problema estrutural identificado no SLT 360 é a perda de rastreabilidade financeira por disciplina em revisões de orçamento.

O sistema em produção consegue registrar o aumento total do EV, mas em alguns fluxos registra o delta em linhas genéricas, como `SIC's` ou `Outras Linhas do EV`. Isso impede análises como custo por m² por disciplina, desvio sistemático por tipologia e ranking de disciplinas mais voláteis.

## 2. Sintoma

A Sala Técnica não consegue extrair com confiança:

- Custo por m² por disciplina.
- Desvio de disciplinas específicas.
- Desvio por tipologia de obra.
- Volatilidade de disciplinas.
- Frequência de SIC por disciplina.

Exemplos de disciplinas afetadas:

- Marcenaria
- Instalações de Climatização e Exaustão
- Equipamentos de Climatização
- Instalações Elétricas e SPDA
- Quadros Elétricos
- Adequações Civis

## 3. Causa Raiz

O dicionário de disciplinas possui uma linha genérica chamada `SIC's`.

Além disso, o comparador de versões possui fallback para `Outras Linhas do EV`.

Quando uma demanda de revisão é concluída, o sistema pode registrar o delta financeiro na linha genérica, em vez de decompor o valor nas disciplinas reais que explicam a mudança.

## 4. Caso Real Observado

```text
Obra: Novo Hospital Ibirapuera
Demanda: DEM-007
Revisão: v3 -> v4
Item: Outras Linhas do EV
Antes: R$ 0,00 (Não se aplica)
Depois: R$ 14.684.426,56 (Orçado)
Diferença: +R$ 14.684.426,56
```

O sistema registrou corretamente o aumento total do EV, mas não registrou a disciplina correspondente. O dado ficou contabilmente útil no total, mas analiticamente fraco.

## 5. Correção Oficial

Toda alteração pontual de orçamento deve ser registrada como SIC.

Uma SIC deve conter uma ou mais disciplinas afetadas:

```json
{
  "sicId": "SIC-xxx",
  "obraId": "obraId",
  "demandaId": "DEM-007",
  "disciplinasAfetadas": [
    {
      "disciplinaId": "adequacoes-civis",
      "valorDelta": 9800000.00
    },
    {
      "disciplinaId": "equipamentos-climatizacao",
      "valorDelta": 3200000.00
    },
    {
      "disciplinaId": "quadros-eletricos",
      "valorDelta": 1684426.56
    }
  ]
}
```

## 6. Regras de Validação

- `disciplinasAfetadas` é obrigatório.
- A lista deve ter ao menos um item.
- Cada item deve apontar para disciplina existente.
- Cada disciplina deve ter `selecionavelParaSIC = true`.
- `SIC's` não pode ser selecionada.
- `Taxa de Risco (5%)` não pode ser selecionada.
- `Outras Linhas do EV` não pode ser usada como fallback.
- Cada valor delta deve ser numérico e diferente de vazio.

## 7. Comparador de Versões

O comparador deve abandonar o item agregado e mostrar `diffPorDisciplina`.

Modelo esperado:

```json
{
  "numero": 4,
  "origem": "DEM-007",
  "diffPorDisciplina": [
    {
      "disciplinaId": "adequacoes-civis",
      "valorAntes": 0,
      "valorDepois": 9800000.00
    },
    {
      "disciplinaId": "equipamentos-climatizacao",
      "valorAntes": 0,
      "valorDepois": 3200000.00
    },
    {
      "disciplinaId": "quadros-eletricos",
      "valorAntes": 0,
      "valorDepois": 1684426.56
    }
  ]
}
```

## 8. Critério de Aceite

Ao reproduzir o caso DEM-007:

- O delta total continua sendo R$ 14.684.426,56.
- O delta aparece dividido por disciplina.
- O comparador v3 -> v4 mostra três linhas separadas.
- Nenhum novo registro usa `SIC's` como linha financeira.
- Nenhum novo registro usa `Outras Linhas do EV`.
- A visão Disciplina & Tipologia consegue usar os dados gerados.

## 9. Impacto nos Indicadores

Com a correção, passam a ser possíveis:

- CAPEX por disciplina.
- Custo por m² por disciplina.
- Custo por m² por tipologia.
- Ranking de volatilidade.
- Frequência de SIC por disciplina.
- Análise de desvio recorrente.

## 10. Compatibilidade Histórica

A linha `SIC's` não deve ser removida, porque EVs antigos podem depender da posição dela no dicionário.

Tratamento correto:

- Manter a linha.
- Marcar como não selecionável.
- Exibir em histórico quando necessário.
- Bloquear novos lançamentos.
- Não usar em indicadores futuros, exceto em análises de legado claramente marcadas.
