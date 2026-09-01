# Backlog e Roadmap - SLT 360 / Traço 360

## 1. Direção do Produto

O projeto já possui uma versão em produção. O roadmap deve evoluir a base existente, não recomeçar do zero.

Prioridade técnica:

```text
Corrigir SIC e revisão de orçamento para sempre preservar disciplina.
```

## 2. MVP Corrigido

Fluxo que precisa funcionar ponta a ponta:

```text
Obra -> EV -> Linha por disciplina -> Demanda -> SIC multi-disciplina -> Aprovação -> EV atualizado -> Comparador por disciplina -> Indicadores
```

Critérios mínimos:

- Obra mantém um único EV principal.
- EV possui linhas por disciplina canônica.
- SIC exige ao menos uma disciplina afetada.
- Linha `SIC's` fica bloqueada para novos lançamentos.
- Comparador de versões mostra `diffPorDisciplina`.
- Dashboard consegue calcular CAPEX por disciplina.
- Visão Disciplina & Tipologia calcula custo por m².

## 3. Backlog por Épico

### E1 - Fundação de Dados

| ID | Item | Prioridade |
| --- | --- | --- |
| E1-001 | Criar ou revisar coleções Firestore oficiais | Alta |
| E1-002 | Migrar dicionário canônico de 34+3 disciplinas | Alta |
| E1-003 | Travar posição das disciplinas | Alta |
| E1-004 | Marcar `SIC's` como não selecionável para novos lançamentos | Alta |
| E1-005 | Marcar `Taxa de Risco (5%)` como não selecionável para SIC | Alta |
| E1-006 | Importar ou reconciliar obras existentes | Alta |
| E1-007 | Criar rotina de auditoria base em `historicos` | Média |

### E2 - Correção do SIC

| ID | Item | Prioridade |
| --- | --- | --- |
| E2-001 | Criar formulário de SIC multi-disciplina | Alta |
| E2-002 | Exigir ao menos uma disciplina afetada | Alta |
| E2-003 | Validar `selecionavelParaSIC` antes de salvar | Alta |
| E2-004 | Permitir valor delta por disciplina | Alta |
| E2-005 | Bloquear fallback em `Outras Linhas do EV` | Alta |
| E2-006 | Bloquear novos lançamentos em `SIC's` | Alta |
| E2-007 | Registrar SIC vinculada à demanda | Alta |
| E2-008 | Registrar histórico da criação/aprovação/reprovação | Média |

### E3 - EV, Saldos e Comparador

| ID | Item | Prioridade |
| --- | --- | --- |
| E3-001 | Exibir Orçado, Aditivado, Contratado e Saldo por disciplina | Alta |
| E3-002 | Calcular saldo derivado | Alta |
| E3-003 | Somar aditivado apenas de SIC aprovada | Alta |
| E3-004 | Registrar versões imutáveis do EV | Alta |
| E3-005 | Criar `diffPorDisciplina` nas versões | Alta |
| E3-006 | Atualizar comparador para exibir diferenças por disciplina | Alta |
| E3-007 | Reproduzir caso DEM-007 como teste de aceite | Alta |

### E4 - Contratações Estruturadas

| ID | Item | Prioridade |
| --- | --- | --- |
| E4-001 | Criar cadastro de fornecedores | Alta |
| E4-002 | Registrar contratação vinculada a obra e disciplina | Alta |
| E4-003 | Registrar número de contrato e responsável de Suprimentos | Média |
| E4-004 | Atualizar valor contratado por disciplina | Alta |
| E4-005 | Exibir contratação na tela do EV | Média |

### E5 - Kanban Operacional

| ID | Item | Prioridade |
| --- | --- | --- |
| E5-001 | Migrar demandas para o novo modelo | Alta |
| E5-002 | Preservar histórico de DEM-xxx existentes | Alta |
| E5-003 | Implementar colunas oficiais do Kanban | Alta |
| E5-004 | Vincular demandas a SICs | Alta |
| E5-005 | Implementar analista líder e complementares | Média |
| E5-006 | Calcular atraso e SLA | Média |

### E6 - Visão Gerencial

| ID | Item | Prioridade |
| --- | --- | --- |
| E6-001 | Dashboard de demandas recebidas e concluídas | Alta |
| E6-002 | Backlog por sprint | Alta |
| E6-003 | Produção por analista | Alta |
| E6-004 | SLA médio | Média |
| E6-005 | Gargalo por status | Média |
| E6-006 | Obras críticas | Média |

### E7 - Estratégica + Disciplina & Tipologia

| ID | Item | Prioridade |
| --- | --- | --- |
| E7-001 | CAPEX por regional | Alta |
| E7-002 | CAPEX por tipologia | Alta |
| E7-003 | CAPEX por disciplina | Alta |
| E7-004 | Custo por m² por disciplina | Alta |
| E7-005 | Custo por m² por tipologia | Alta |
| E7-006 | Ranking de volatilidade por disciplina | Alta |
| E7-007 | Desvio orçado inicial vs. orçado + aditivos | Média |

### E8 - Configurações e Auditoria

| ID | Item | Prioridade |
| --- | --- | --- |
| E8-001 | Tela de dicionário de disciplinas | Alta |
| E8-002 | Bloquear reordenação e exclusão de disciplinas | Alta |
| E8-003 | Tela de usuários | Média |
| E8-004 | Tela de sprints | Média |
| E8-005 | Listas de apoio | Média |
| E8-006 | Histórico por entidade | Alta |

### E9 - Autenticação e Perfis

| ID | Item | Prioridade |
| --- | --- | --- |
| E9-001 | Configurar Firebase Auth | Média |
| E9-002 | Implementar perfis Analista, Gestão e Administrador | Média |
| E9-003 | Restringir aprovações | Média |
| E9-004 | Restringir configurações | Média |

### E10 - Integração SAP

| ID | Item | Prioridade |
| --- | --- | --- |
| E10-001 | Mapear Ordem Interna SAP | Baixa |
| E10-002 | Mapear Programa Orçamentário | Baixa |
| E10-003 | Desenhar sincronização de saldo real do ERP | Baixa |
| E10-004 | Registrar status de integração | Baixa |

## 4. Roadmap por Sprint

### Sprint 1 - Fundação de Dados

Duração: 2 semanas.

Entregas:

- Coleções Firestore revisadas.
- Dicionário canônico migrado.
- Posições travadas.
- Obras existentes reconciliadas.
- Campos SAP preservados.

### Sprint 2 - SIC Multi-Disciplina

Duração: 2 semanas.

Entregas:

- Formulário de SIC com disciplina obrigatória.
- Valores por disciplina.
- Bloqueio de `SIC's`.
- Bloqueio de `Outras Linhas do EV`.
- Aprovação de SIC.

### Sprint 3 - EV, Contratações e Saldos

Duração: 2 semanas.

Entregas:

- EV com Orçado, Aditivado, Contratado e Saldo.
- Saldos derivados.
- Fornecedores.
- Contratações por disciplina.
- Comparador inicial por disciplina.

### Sprint 4 - Kanban Migrado

Duração: 2 semanas.

Entregas:

- Demandas migradas.
- Kanban oficial.
- Histórico preservado.
- Vínculo entre demanda e SIC.
- Datas planejadas e reais.

### Sprint 5 - Gerencial, Configurações e Auditoria

Duração: 2 semanas.

Entregas:

- Indicadores de produção.
- Indicadores de prazo.
- Configurações.
- Histórico por entidade.
- Listas de apoio.

### Sprint 6 - Estratégica + Disciplina & Tipologia

Duração: 2 semanas.

Entregas:

- CAPEX por disciplina.
- CAPEX por tipologia.
- Custo por m² por disciplina.
- Ranking de volatilidade.
- Validação com dados reais de ao menos três obras.

### Sprint 7+ - Perfis e SAP

Entregas:

- Autenticação.
- Perfis.
- Regras de segurança.
- Desenho de integração SAP.

## 5. Teste de Regressão Obrigatório

Caso de referência:

```text
Obra: Novo Hospital Ibirapuera
Demanda: DEM-007
Revisão: v3 -> v4
Delta total: R$ 14.684.426,56
```

Resultado esperado:

```json
[
  { "disciplinaId": "adequacoes-civis", "valorDelta": 9800000.00 },
  { "disciplinaId": "equipamentos-climatizacao", "valorDelta": 3200000.00 },
  { "disciplinaId": "quadros-eletricos", "valorDelta": 1684426.56 }
]
```

Não pode existir novo registro com:

- `disciplinaId = sics`
- `disciplinaId = outras-linhas-do-ev`
- Item genérico no comparador de versões
