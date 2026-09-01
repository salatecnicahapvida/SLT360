# Prompt Mestre - Traço 360 / SLT 360

Sistema de Gestão da Sala Técnica de Engenharia.

## Instrução para a IA que ler este prompt

Você está assumindo o contexto completo de um projeto já em andamento, chamado Traço 360 e em evolução para SLT 360.

Existe uma versão em produção em HTML, CSS e JavaScript puro, com Firebase Firestore e hospedagem em GitHub Pages, usada ativamente por uma equipe real e com aproximadamente 130 obras cadastradas.

Este documento consolida:

- Conceito do produto
- Diagnóstico de um bug estrutural real encontrado no sistema em produção
- Modelo de dados corrigido
- Regras de negócio
- Telas e funcionalidades
- Backlog
- Roadmap
- Dicionário canônico de disciplinas

Não proponha reescrever o projeto do zero. A tarefa é evoluir o que já existe, corrigindo especificamente a lacuna estrutural descrita em "Diagnóstico Real".

## 1. Contexto e Objetivo

O SLT 360 é a plataforma de gestão integrada da Sala Técnica de Engenharia de uma rede hospitalar.

O sistema gerencia três escopos de orçamentação:

- Orçamentos de Obras
- Orçamentos de Manutenção
- Orçamentos de Engenharia Clínica

Também centraliza:

- Estudo de Viabilidade de cada obra
- Demandas técnicas do dia a dia
- Controle de CAPEX
- SICs e aditivos
- Contratações de Suprimentos
- Fornecedores
- Indicadores de produção
- Indicadores de assertividade

O objetivo é substituir controles descentralizados, como planilhas manuais, quadros isolados por escopo e EVs sem rastreabilidade financeira granular, por uma única plataforma onde prazo e verba estejam sempre sincronizados.

## 2. Princípio Central do Sistema

A unidade principal do sistema é a obra/projeto.

```text
1 obra = 1 EV principal com histórico de versões
```

Toda obra possui:

- Identificador único interno
- Código original
- Nome
- Tipo de unidade
- Cidade e UF
- Região
- Classificação da obra
- Tipologia da obra
- Área construída
- Área equivalente
- Ordem interna SAP
- Estudo de Viabilidade principal

O EV acompanha toda a vida do projeto por meio de versões internas, como v1, v2 e v3, não por múltiplos EVs independentes.

## 3. Diagnóstico Real - Bug que Motiva a Evolução

Sintoma relatado pela Sala Técnica:

O sistema não consegue extrair custo por m² por disciplina, nem desvio sistemático de disciplinas específicas, como marcenaria, climatização e instalações elétricas, segmentado por tipologia de obra.

Causa raiz confirmada no sistema real:

- O dicionário de disciplinas do EV inclui uma linha genérica chamada `SIC's`.
- O comparador de versões do EV usa como fallback um item chamado `Outras Linhas do EV`.
- Quando uma demanda de revisão de orçamento é concluída, o valor delta pode ser lançado nesse item genérico.
- O sistema registra o delta total do EV, mas não registra em qual disciplina a mudança ocorreu.

Caso real observado:

```text
Obra: Novo Hospital Ibirapuera
Demanda: DEM-007
Revisão: v3 -> v4
Item: Outras Linhas do EV
Antes: R$ 0,00 (Não se aplica)
Depois: R$ 14.684.426,56 (Orçado)
Diferença: +R$ 14.684.426,56
```

O sistema registrou corretamente que o EV aumentou R$ 14,68 milhões, mas não registrou a disciplina. Isso torna impossível extrair indicadores confiáveis por disciplina.

Correção:

- Toda revisão pontual de orçamento passa a ser tratada como um ou mais SICs.
- Cada SIC deve estar obrigatoriamente vinculada a uma ou mais disciplinas específicas do EV.
- O valor nunca pode ser lançado solto.
- A linha `SIC's` fica apenas por compatibilidade histórica.
- A linha `SIC's` não deve receber novos lançamentos.
- O comparador de versões deve usar `diffPorDisciplina`, não um fallback genérico.

Critério de aceite:

```json
[
  { "disciplinaId": "adequacoes-civis", "valorDelta": 9800000.00 },
  { "disciplinaId": "equipamentos-climatizacao", "valorDelta": 3200000.00 },
  { "disciplinaId": "quadros-eletricos", "valorDelta": 1684426.56 }
]
```

Ao reproduzir o caso DEM-007, o comparador de versão v3 -> v4 deve listar as três linhas separadamente, nunca um item agregado genérico.

## 4. Arquitetura - Quatro Visões

### Visão 1 - Operacional

Dia a dia da equipe, Kanban e Sprint.

Colunas exatas do Kanban:

```text
Fazer -> Fazendo -> Pausado -> Aguardando Validação Sala Técnica -> Aguardando Validação Obras -> Concluído / Cancelado
```

Campos de cada demanda:

- ID, no padrão DEM-xxx
- Sprint
- Obra vinculada
- Analista responsável líder
- Analistas complementares
- Tipo de atividade
- Prioridade
- Data prevista de início
- Data de início real
- Data prevista de envio para validação Obras
- Data real de envio para validação Obras
- Data de validação Obras
- Data de entrega prevista
- Data de entrega real

Tipos de atividade:

- Emissão Inicial
- SIC
- Revisão completa do EV

Prioridades:

- Alta
- Média
- Baixa

### Visão 2 - Gerencial

Produção e gargalos:

- Demandas recebidas
- Demandas concluídas
- Backlog
- Produção por analista
- Produção por sprint
- SLA médio
- Demandas atrasadas
- Tempo médio de orçamentação
- Retrabalho
- Status acumulados
- Analistas sobrecarregados
- Obras críticas

### Visão 3 - Estratégica

Gestão de CAPEX:

- CAPEX total
- CAPEX por regional
- CAPEX por tipologia
- CAPEX por disciplina
- Evolução de orçamento
- Total em aditivos
- Total contratado

### Visão 4 - Disciplina & Tipologia

Nova visão viabilizada pela correção do SIC por disciplina:

- Custo por m² por disciplina
- Segmentação por tipologia de obra
- Desvio sistemático por disciplina
- Comparação entre orçado inicial e orçado + aditivos
- Ranking de disciplinas mais voláteis
- Volume de SICs por disciplina
- Frequência de SICs por disciplina

## 5. Modelo de Dados

Coleções principais:

- `obras`
- `evs`
- `evs/{evId}/versoes`
- `evs/{evId}/linhas`
- `disciplinas`
- `demandas`
- `sprints`
- `sics`
- `contratacoes`
- `fornecedores`
- `historicos`
- `configuracoes`
- `usuarios`

A correção central está em:

```text
evs/{evId}/versoes/{versaoId}.diffPorDisciplina
sics/{sicId}.disciplinasAfetadas
disciplinas/{disciplinaId}.selecionavelParaSIC
```

## 6. Regras de Negócio Inegociáveis

1. Nunca criar dois EVs para a mesma obra.
2. Revisão completa de EV não é SIC.
3. SIC sempre altera uma ou mais linhas de disciplina específicas.
4. O formulário de SIC deve obrigar ao menos uma disciplina antes de salvar.
5. Todo valor lançado no EV precisa estar vinculado ao dicionário canônico.
6. Texto livre é proibido como linha financeira de EV.
7. A posição de cada disciplina no dicionário é imutável.
8. Disciplinas nunca devem ser excluídas; apenas inativadas.
9. Novas disciplinas devem ser adicionadas ao final.
10. Toda alteração relevante deve gravar histórico.
11. Saldo de linha é sempre derivado.
12. O modelo deve permitir integração futura com SAP.

Fórmula de saldo:

```text
saldo = valor_orcado + aditivado_aprovado - contratado
```

## 7. Telas e Funcionalidades

### Dashboard Principal

CAPEX:

- Valor total EV
- Valor contratado
- Valor disponível

Operação:

- Demandas abertas
- Demandas em andamento
- Demandas aguardando validação
- Demandas concluídas

Alertas:

- Obras com saldo crítico
- Demandas atrasadas
- SICs aguardando aprovação

### Gestão de Obras

O módulo Obras deve absorver a estrutura principal do Traço 360 dentro do perfil Obra.

Navegação interna esperada:

- Início
- Visão Operacional
- Visão Gerencial
- Visão Estratégica
- Portfólio
- Estudos de Viabilidade
- Configurações

A tela inicial de Obras deve funcionar como Central de Projetos, com indicadores de carteira, demandas, atrasos, CAPEX, marcos, EVs pendentes, fila crítica, carga ativa por obra, capacidade por analista e distribuição regional.

A visão operacional deve consolidar demandas, sprints, filtros e Kanban.

A visão gerencial deve consolidar produção por analista, eficiência de prazo, valor produzido, produção por sprint, tipo de demanda e classificação da obra.

A visão estratégica deve consolidar CAPEX, custo por m², regiões atendidas, novas unidades, maiores investimentos e classificação do portfólio.

Antes do detalhe do EV, o módulo Obras também deve possuir uma visão de Portfólio do Plano de Investimento.

A versão local do SLT 360 deve iniciar com a base importada do Traço 360: 130 obras do portfólio, 19 demandas e 11 EVs preenchidos. Obras sem EV preenchido entram como EV pendente/rascunho para manter a carteira completa.

Essa visão consolida:

- Obras no portfólio
- CAPEX consolidado
- EVs com pendência
- Obras próximas de marco
- Distribuição regional
- Status, tipologia e risco da carteira

Tabela:

- Chave única
- Código original
- Nome da obra
- Tipo de unidade
- Cidade / UF
- Região
- Prazo
- Classificação da obra
- Tipologia da obra
- Área equivalente
- Área construída
- SAP
- CNPJ
- Endereço
- EV
- CAPEX
- Risco

Ação principal por linha:

- Abrir EV

### Estudo de Viabilidade

Cabeçalho:

- Valor total
- Área construída
- Área equivalente
- Custo médio por m²

Corpo:

- Tabela por disciplina
- Agrupamento em Custos da Obra e Outras Categorias
- Colunas Orçado, Aditivado, Contratado, Saldo e Status

Rodapé:

- Comparador de versões
- Lista de mudanças decomposta por disciplina

### Nova Demanda

Tipo `SIC`:

```text
obra -> disciplinas afetadas -> valor por disciplina -> motivo -> descrição -> documento -> aprovação
```

Tipo `Revisão completa do EV`:

- Reabre todas as linhas para reorçamento.
- Gera nova versão inteira.
- Não deve ser usada como substituto para SIC pontual.

### Fornecedores

Cadastro central de empresas contratadas, reutilizável entre obras.

### Configurações

- Nomenclaturas do EV padrão
- Dicionário de disciplinas
- Usuários e níveis de acesso
- Histórico de alterações
- Sprints
- Listas de apoio

## 8. Stack Tecnológica

Estado atual:

- HTML
- CSS
- JavaScript puro
- Firebase Firestore
- GitHub Pages

Evolução recomendada:

- React ou Vue
- Firestore mantido
- Firebase Auth
- Firebase Storage
- Integração futura com SAP

O gargalo principal do projeto não é a tecnologia atual, mas o modelo de dados: linhas de EV genéricas e SIC sem disciplina.

## 9. Padrão Visual

Paleta:

- Azul institucional: `#2F5FE0`
- Laranja destaque: `#E8792F`
- Navy escuro: `#131C34`

Elementos:

- Header fixo
- Logo e nome do sistema
- Navegação: Início, Visões, Portfólio, Configurações
- Busca
- Botão `+ Nova demanda`
- Chip de usuário
- Cards de KPI com borda colorida à esquerda
- Kanban com colunas de largura fixa
- Tabelas com cabeçalho navy e linhas zebradas
- Modais centrais com rodapé de ações fixo
- Responsivo

## 10. Backlog por Épico

- E1: Fundação de dados
- E2: Correção do SIC
- E3: EV com Aditivado, Contratado, Saldo e comparador por disciplina
- E4: Contratações estruturadas
- E5: Kanban operacional migrado para o novo modelo
- E6: Visão Gerencial
- E7: Visão Estratégica + Disciplina & Tipologia
- E8: Configurações e auditoria
- E9: Autenticação e perfis
- E10: Integração SAP

## 11. Roadmap

- Sprint 1: coleções criadas, dicionário migrado, obras importadas.
- Sprint 2: formulário de SIC multi-disciplina funcionando.
- Sprint 3: EV com Aditivado, Contratado, Saldo; fornecedores e contratações.
- Sprint 4: Kanban migrado sem perda de histórico.
- Sprint 5: Visão Gerencial, Configurações e auditoria.
- Sprint 6: Visão Estratégica + Disciplina & Tipologia validada com dados reais.
- Sprint 7+: autenticação, perfis e desenho de integração SAP.

## 12. Estado Atual do Protótipo

Já existe um protótipo funcional single-file chamado SLT 360, sem backend, que demonstra:

- Navegação igual ao sistema real
- Kanban operacional
- Tela de EV com Orçado, Aditivado, Contratado e Saldo por disciplina
- Formulário de SIC com disciplina obrigatória
- Tela de fornecedores
- Usuários
- Histórico de auditoria
- Aba Disciplina & Tipologia
- Custo por m²
- Ranking de volatilidade

Esse protótipo é a referência de UX e fluxo para a implementação real em React + Firestore.
