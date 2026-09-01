# SLT 360 / Traço 360

Sistema de Gestão da Sala Técnica de Engenharia.

O SLT 360, evolução do Traço 360, é a plataforma de gestão integrada da Sala Técnica de Engenharia. O sistema centraliza obras, estudos de viabilidade, demandas técnicas, CAPEX, SICs, contratações de Suprimentos, fornecedores, histórico e indicadores de produção, prazo e assertividade.

Existe uma versão em produção em HTML, CSS e JavaScript puro, com Firebase Firestore e hospedagem em GitHub Pages, usada por uma equipe real e com aproximadamente 130 obras cadastradas. A direção do projeto é evoluir o que já existe, corrigindo o modelo de dados e preservando histórico.

## Objetivo

Substituir controles descentralizados por uma única plataforma onde prazo, verba e disciplina técnica estejam sincronizados.

O sistema deve responder:

- Operacional: quem está fazendo o quê e quando entrega?
- Gerencial: estamos produzindo no ritmo esperado?
- Estratégico: quanto CAPEX temos, onde está alocado e qual é o risco?
- Disciplina & Tipologia: quanto custa cada disciplina por m² e onde estão os desvios recorrentes?

## Princípio Central

A unidade principal do sistema é a obra/projeto.

```text
1 obra = 1 EV principal com histórico de versões
```

Não devem existir múltiplos EVs principais para a mesma obra. O EV acompanha toda a vida do projeto por meio de versões internas.

## Módulos do Sistema

O SLT 360 deve unir o ecossistema completo da Sala Técnica em quatro módulos:

1. Obras
2. Manutenção
3. Engenharia Clínica
4. Controle de Verbas

O dashboard inicial deve apresentar os principais KPIs desses quatro módulos para dar uma leitura rápida da operação, do orçamento e dos pontos críticos.

## Correção Estrutural Prioritária

Foi identificado um bug de modelo no sistema em produção: revisões de orçamento estavam acumulando diferenças financeiras em itens genéricos como `SIC's` ou `Outras Linhas do EV`. Isso registrava corretamente o aumento total do EV, mas destruía a rastreabilidade por disciplina.

A correção oficial é:

- Toda alteração pontual deve ser registrada como SIC.
- Toda SIC deve apontar para uma ou mais disciplinas reais do EV.
- A linha `SIC's` permanece apenas por compatibilidade histórica.
- Novos lançamentos em linhas genéricas são proibidos.
- O comparador de versões deve mostrar diferenças decompostas por disciplina.

Critério de aceite:

```json
[
  { "disciplinaId": "adequacoes-civis", "valorDelta": 9800000.00 },
  { "disciplinaId": "equipamentos-climatizacao", "valorDelta": 3200000.00 },
  { "disciplinaId": "quadros-eletricos", "valorDelta": 1684426.56 }
]
```

O resultado acima deve aparecer como três impactos separados no comparador de versões, nunca como um item agregado.

## Visões do Sistema

### 1. Operacional

Gestão do dia a dia por Kanban e Sprint.

Colunas:

```text
Fazer -> Fazendo -> Pausado -> Aguardando Validação Sala Técnica -> Aguardando Validação Obras -> Concluído / Cancelado
```

### 2. Gerencial

Produção, SLA, backlog, gargalos, capacidade por analista, demandas atrasadas e retrabalho.

### 3. Estratégica

CAPEX total, CAPEX por regional, tipologia, disciplina, evolução do orçamento, total aditivado e total contratado.

### 4. Disciplina & Tipologia

Custo por m² por disciplina, desvio sistemático por tipologia, ranking de volatilidade e frequência de SICs por disciplina.

## Stack Atual

- Frontend: HTML, CSS e JavaScript puro
- Banco: Firebase Firestore
- Hospedagem: GitHub Pages
- Evolução recomendada: React ou Vue mantendo Firestore
- Integração futura: SAP, Ordem Interna e Programa Orçamentário

## Documentação

- [Prompt mestre](docs/prompt-mestre.md)
- [Diagnóstico e correção do SIC por disciplina](docs/diagnostico-correcao-sic.md)
- [Especificação técnica](docs/especificacao-tecnica.md)
- [Modelo Firebase e ER lógico](docs/modelo-firebase.md)
- [Dicionário canônico de disciplinas](docs/dicionario-disciplinas.md)
- [Fluxos do Miro](docs/fluxos-miro.md)
- [Backlog e roadmap](docs/backlog-roadmap.md)

## Aplicação Local

A primeira versão navegável está em [index.html](index.html).

Ela implementa:

- Tela inicial como portal de escolha entre os módulos.
- Dashboard inicial com CAPEX, contratado, saldo e alertas.
- Tela Início em formato de dashboard gerencial clicável, com identidade Hapvida e cards por módulo.
- Painel executivo por módulo: Obras, Manutenção, Engenharia Clínica e Controle de Verbas.
- Módulo Obras no formato Traço 360, com Início, Operacional, Gerencial, Estratégica, Portfólio, EV e Configurações.
- Portfólio do Plano de Investimento com carteira de obras, filtros por coluna, CAPEX, marcos, EVs pendentes e distribuição regional.
- Link para o Miro de fluxos e primeiro SLA de Manutenção mapeado.
- Fluxo de valor de orçamentação de projetos incorporado no módulo Obras.
- Kanban operacional com movimentação de demandas, cadastro de sprint e atribuição de analista por card.
- EV por disciplina com Orçado, Aditivado, Contratado e Saldo, com modal de abertura por obra e rastreabilidade de versões.
- Controle de Verbas com ciclo FEL 01, FEL 02, FEL 03, Suprimentos e Execução.
- BI de SICs com aditivos, supressões, impacto, disciplina, causa e vínculo com verba disponível.
- Formulário de SIC multi-disciplina com validação obrigatória.
- Aprovação de SIC refletindo no EV e no comparador de versões.
- Visão Disciplina & Tipologia.
- Fornecedores, contratações e histórico.

Nesta fase, o módulo Obras já inicia com base importada do Traço 360: 130 obras do portfólio, 19 demandas e 11 estudos de viabilidade preenchidos. As alterações feitas na interface continuam salvas no navegador via `localStorage`; a próxima etapa é conectar esses fluxos ao Firebase Firestore.

## Regras Inegociáveis

1. Nunca criar dois EVs principais para a mesma obra.
2. Revisão completa de EV não é SIC.
3. SIC sempre altera uma ou mais disciplinas específicas.
4. Todo valor financeiro deve estar vinculado ao dicionário canônico de disciplinas.
5. A posição das disciplinas é imutável.
6. A linha `SIC's` não recebe novos lançamentos.
7. Saldo de linha é derivado: `orçado + aditivado aprovado - contratado`.
8. Toda alteração relevante deve gerar histórico.
9. O modelo deve permitir integração futura com SAP sem remodelar as coleções principais.

## Próximo Foco Técnico

Implementar a correção do SIC multi-disciplina no fluxo real:

```text
Demanda -> SIC com disciplinas afetadas -> Aprovação -> EV atualizado por disciplina -> Comparador de versões decomposto
```
