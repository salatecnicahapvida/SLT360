# Especificação Técnica - SLT 360 / Traço 360

## 1. Visão Geral

O SLT 360 é um sistema web para gestão integrada da Sala Técnica de Engenharia. A aplicação existente roda em HTML, CSS e JavaScript puro, usa Firebase Firestore e está hospedada em GitHub Pages.

O projeto não deve ser reescrito do zero. A evolução técnica deve preservar o sistema em produção e corrigir a principal lacuna estrutural: deltas financeiros de revisão precisam ser vinculados a disciplinas reais do EV.

## 2. Objetivos

- Centralizar obras, EVs, demandas, SICs, contratações e fornecedores.
- Corrigir a rastreabilidade financeira por disciplina.
- Permitir custo por m² por disciplina e tipologia.
- Controlar produção, prazo, backlog e gargalos da equipe.
- Preservar histórico de versões do EV e auditoria de alterações.
- Preparar o modelo para integração futura com SAP.

## 3. Escopos de Orçamentação

- Obras
- Manutenção
- Engenharia Clínica

## 4. Papéis

| Papel | Responsabilidade |
| --- | --- |
| Analista | Executar demandas, atualizar Kanban, registrar orçamentos e documentos. |
| Gestão | Priorizar demandas, acompanhar indicadores, validar regras e aprovações. |
| Administrador | Gerenciar usuários, configurações, permissões e dicionários. |
| Suprimentos | Registrar fornecedores e contratações estruturadas. |
| Consulta | Acessar dados e indicadores sem alteração crítica. |

## 5. Visões do Sistema

### 5.1 Operacional

Gestão diária por Kanban e Sprint.

Colunas oficiais:

```text
Fazer -> Fazendo -> Pausado -> Aguardando Validação Sala Técnica -> Aguardando Validação Obras -> Concluído / Cancelado
```

Campos principais da demanda:

- ID no padrão DEM-xxx
- Obra vinculada
- Sprint
- Analista responsável líder
- Analistas complementares
- Tipo: Emissão Inicial, SIC ou Revisão completa do EV
- Prioridade: Alta, Média ou Baixa
- Datas planejadas e reais do fluxo de validação
- Observações
- SICs vinculadas

### 5.2 Gerencial

Indicadores:

- Demandas recebidas
- Demandas concluídas
- Backlog
- Produção por analista
- Produção por sprint
- SLA médio
- Demandas atrasadas
- Tempo médio de orçamentação
- Retrabalho
- Gargalo por status
- Analistas sobrecarregados
- Obras críticas

### 5.3 Estratégica

Indicadores:

- CAPEX total
- CAPEX por regional
- CAPEX por tipologia
- CAPEX por disciplina
- Evolução de orçamento por versão de EV
- Total aditivado por SIC
- Total contratado
- Saldo consolidado

### 5.4 Disciplina & Tipologia

Nova visão analítica dependente da correção do SIC:

- Custo por m² por disciplina
- Custo por m² por tipologia de obra
- Desvio por disciplina
- Orçado inicial vs. orçado + aditivos
- Ranking de disciplinas mais voláteis
- Frequência e valor de SICs por disciplina

## 6. Correção Central do Modelo

### Problema

O sistema em produção permitia que diferenças de revisão fossem registradas em itens genéricos:

- `SIC's`
- `Outras Linhas do EV`

Isso impedia análises por disciplina.

### Regra Corrigida

Toda alteração pontual deve gerar uma SIC vinculada a uma ou mais disciplinas reais.

```json
{
  "sicId": "SIC-001",
  "obraId": "obraId",
  "demandaId": "DEM-007",
  "disciplinasAfetadas": [
    { "disciplinaId": "adequacoes-civis", "valorDelta": 9800000.00 },
    { "disciplinaId": "equipamentos-climatizacao", "valorDelta": 3200000.00 }
  ]
}
```

### Critérios de Aceite

- Formulário de SIC não salva sem disciplina.
- Linha `SIC's` não pode ser selecionada para novos lançamentos.
- `Taxa de Risco (5%)` não pode ser selecionada para SIC.
- Comparador de versões usa `diffPorDisciplina`.
- Nenhum delta financeiro novo deve cair em fallback genérico.

## 7. Módulos Funcionais

### Dashboard

- Cards de CAPEX
- Cards operacionais
- Alertas de saldo crítico
- Alertas de atraso
- SICs pendentes
- Recortes por regional, tipologia e disciplina

### Gestão de Obras

Funcionalidades:

- Reproduzir a estrutura principal do Traço 360 dentro do perfil Obras.
- Organizar Obras em Início, Visão Operacional, Visão Gerencial, Visão Estratégica, Portfólio, EV e Configurações.
- Exibir Central de Projetos com indicadores de obras, demandas, atrasos, CAPEX, marcos, EVs pendentes e analistas.
- Controlar Visão Operacional com sprint, responsáveis, status de prazo, pendências e Kanban.
- Controlar Visão Gerencial com produção por analista, valor produzido, atraso médio, produção por sprint e eficiência de prazo.
- Controlar Visão Estratégica com CAPEX total, custo por m², regiões, novas unidades, maiores investimentos e classificação do portfólio.
- Exibir Portfólio do Plano de Investimento.
- Iniciar o módulo Obras com a base importada do Traço 360: 130 obras do portfólio, 19 demandas e 11 EVs preenchidos.
- Consolidar carteira de obras por regional, tipologia, status, marco e risco.
- Mostrar CAPEX aprovado, contratado, saldo disponível e EVs pendentes.
- Consultar obras
- Filtrar por regional, UF, cidade, tipo, status e tipologia
- Abrir EV
- Consultar histórico
- Visualizar indicadores da obra

Campos:

- Chave única
- Código original
- Nome
- Tipo de unidade
- Cidade
- UF
- Região
- Classificação da obra
- Tipologia da obra
- Área construída
- Área equivalente
- Ordem interna SAP
- CNPJ
- Endereço
- Status
- EV principal

### EV

Funcionalidades:

- Manter um EV principal por obra
- Registrar versões imutáveis
- Controlar linhas por disciplina
- Exibir Orçado, Aditivado, Contratado e Saldo
- Exibir custo médio por m²
- Comparar versões por disciplina

Fórmula:

```text
saldo = valor_orcado + aditivado_aprovado - contratado
```

### SIC

Funcionalidades:

- Criar SIC vinculada a demanda
- Selecionar uma ou mais disciplinas afetadas
- Informar valor delta por disciplina
- Registrar motivo
- Anexar documento
- Controlar aprovação
- Atualizar valores aditivados somente após aprovação

Motivos:

- Alteração de Projeto
- Solicitação de Campo

Status:

- Pendente
- Aprovado
- Reprovado

### Contratações

Funcionalidades:

- Cadastrar fornecedores
- Registrar contratação por obra e disciplina
- Vincular valor, data, contrato e responsável de Suprimentos
- Atualizar consumo contratado por linha de EV

### Configurações

- Dicionário de disciplinas
- Usuários e níveis de acesso
- Sprints
- Listas de apoio
- Nomenclaturas do EV padrão
- Histórico de alterações

## 8. Arquitetura Técnica

```text
Navegador
  -> HTML/CSS/JS atual ou React/Vue futuro
    -> Firebase Auth
    -> Firestore
    -> Firebase Storage
    -> GitHub Pages ou Firebase Hosting
```

### Evolução Recomendada

Migrar o frontend para React ou Vue quando a complexidade de formulários e estados justificar:

- SIC multi-disciplina
- Comparador de versões
- Visão Disciplina & Tipologia
- Configurações avançadas
- Permissões por perfil

Firestore deve ser preservado como base na próxima etapa.

## 9. Regras de Negócio

| Código | Regra |
| --- | --- |
| RN-001 | Uma obra possui somente um EV principal. |
| RN-002 | EV possui histórico de versões imutáveis. |
| RN-003 | Revisão completa de EV não é SIC. |
| RN-004 | SIC deve afetar uma ou mais disciplinas específicas. |
| RN-005 | SIC não pode usar linhas genéricas. |
| RN-006 | Todo valor financeiro deve estar vinculado a disciplina canônica. |
| RN-007 | Posição da disciplina é imutável. |
| RN-008 | Disciplinas não são excluídas; são inativadas. |
| RN-009 | Saldo de linha é derivado, não digitado. |
| RN-010 | Contratação deve estar vinculada a fornecedor e disciplina. |
| RN-011 | Alterações relevantes geram histórico. |
| RN-012 | O campo ordemInternaSAP deve ser preservado para integração futura. |

## 10. Segurança e Auditoria

Diretrizes:

- Autenticação obrigatória no ambiente real.
- Permissões por perfil.
- Exclusão física restrita.
- Histórico obrigatório para alterações críticas.
- Auditoria de antes/depois em obras, EVs, linhas, demandas e SICs.

## 11. Padrão Visual

- Azul institucional `#2F5FE0`
- Laranja destaque `#E8792F`
- Navy escuro `#131C34`
- Header fixo
- Navegação por Início, Visões, Portfólio e Configurações
- Busca global
- Botão `+ Nova demanda`
- Cards de KPI com borda lateral
- Kanban de largura fixa
- Tabelas com cabeçalho navy
- Modais com rodapé fixo
- Layout responsivo
