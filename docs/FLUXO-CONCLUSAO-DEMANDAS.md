# Fluxo de conclusão das demandas operacionais

Na visão operacional de Obras, o Kanban controla o ciclo da demanda e não realiza checagem de saldo disponível.

Para demandas do tipo **SIC**, o encerramento passa obrigatoriamente pelas etapas **Aguardando Aprovação Diretoria** → **Aprovado Pela Diretoria** → **Concluído**. A etapa antiga **Aguardando Validação Sala Técnica** foi removida; registros legados nessa fase são tratados como **Aguardando Validação Obras**.

Ao mover uma demanda para **Concluído**, o sistema exige a confirmação do impacto no EV:

- **Atualizar o EV**: abre o EV da obra e, após salvar a nova versão, continua a conclusão da demanda.
- **Não houve mudança no EV**: registra explicitamente que a demanda não alterou o estudo.

Em seguida, é obrigatório informar **quanto a demanda gerou em reais**. O valor pode ser `R$ 0,00`, mas precisa ser informado explicitamente. Esse valor pertence à própria demanda e não é calculado a partir do saldo, do valor total do EV ou de SICs.

Cards concluídos não exibem tempo de permanência na etapa **Concluído**. O histórico das etapas anteriores continua preservado.

Os tipos de atividade usados na criação e na edição são os mesmos: **Emissão Inicial**, **Revisão de Orçamento**, **Demanda Extra** e **SIC**.
