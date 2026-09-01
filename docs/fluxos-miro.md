# Fluxos do Miro

Board de referência:

<https://miro.com/app/board/uXjVKxg3MFc=/>

Título carregado no Miro:

```text
Fluxo Sala Técnica - Obras
```

## Conteúdo Observado

O board contém fluxos para os módulos da Sala Técnica, incluindo Manutenção e Engenharia Clínica.

Também foi fornecida uma captura do fluxo:

```text
Fluxo de Valor de Orçamentação de Projetos
Fluxo Sala Técnica - Obras
```

## Fluxo de Orçamentação de Projetos

O fluxo de orçamentação do módulo Obras deve ser tratado como a entrada estruturada para EV, SIC, contratação e controle de verbas.

Fluxo-base adotado no SLT 360:

1. Entrada da demanda
2. Triagem técnica
3. Orçamentação por disciplinas
4. Validação e devoluções
5. Consolidação do EV
6. Controle de verbas

Regras derivadas:

- A entrada deve registrar solicitante, obra, escopo e documentos técnicos.
- A triagem deve identificar pendências e classificar a demanda.
- A orçamentação deve sempre usar disciplinas canônicas.
- Devoluções devem gerar histórico, motivo e responsável.
- A consolidação deve atualizar EV, custo/m² e comparador por disciplina.
- O controle de verbas deve receber aditivos, contratações e saldo disponível.

Decisões possíveis:

- Prosseguir com orçamento.
- Devolver para complementação.
- Reclassificar como SIC.
- Reclassificar como revisão completa do EV.
- Concluir e liberar para controle de verbas.

Foi possível abrir o quadro `SLA MÍNIMO`, que apresenta a sequência base:

1. Abertura da OS
2. SLA PCM
3. SLA Sala Técnica
4. SLA de Devolução
5. Conclusão

## Prazos Observados

### SLA Mínimo

- Total indicado: 14 dias
- Marcos visíveis: 7 dias, 1 dia, 3 dias, 3 dias, fim e conclusão

### SLA Máximo

- Total indicado: 23 dias
- Marcos visíveis: 7 dias, 3 dias, 3 dias, 10 dias, fim e conclusão

## Entrada de Manutenção

No fluxo de Manutenção, o primeiro passo visível é:

```text
Envio de arquivos técnicos do serviço a ser executado ao PCM
```

Na sequência inicial também aparecem:

- Cadastro da Ordem de Serviço no ConstruManager
- Download da ordem de serviço na plataforma ConstruManager
- Criação de pasta na rede
- Atualização do Pipefy para atendimento

## Como Usar no SLT 360

O Miro deve ser tratado como referência de fluxo de negócio. No sistema, esses fluxos devem virar:

- Etapas controladas por status.
- Datas planejadas e reais por etapa.
- SLA mínimo e máximo por tipo de demanda.
- Alertas de atraso.
- Histórico de devoluções.
- Indicadores por módulo.

## Próximo Refinamento

Ler os quadros de Obras, Manutenção e Engenharia Clínica com mais detalhe e transformar cada fluxo em:

- Campos do formulário.
- Estados do Kanban.
- Regras de SLA.
- Responsáveis por etapa.
- Critérios de conclusão.
