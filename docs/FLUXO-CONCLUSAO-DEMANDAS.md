# Fluxo de conclusão das demandas operacionais

Na visão operacional de Obras, o Kanban controla o ciclo da demanda e não realiza checagem de saldo disponível.

Ao mover uma demanda para **Pausado** ou **Cancelado**, é obrigatório informar um motivo com pelo menos 5 caracteres. O motivo fica salvo na própria demanda e também no histórico de alterações. A regra vale tanto para movimentação pelo seletor de status quanto pelo arraste do card no Kanban.

Para demandas do tipo **SIC**, não existe mais aprovação paralela da SIC nem trava de "postagem no EV". O fluxo válido do Kanban é **Aguardando Aprovação Diretoria** → **Aprovado Pela Diretoria** → **Concluído**. Somente usuários **Gestor** ou **Admin** com permissão de escrita em Obras podem executar a passagem de **Aguardando Aprovação Diretoria** para **Aprovado Pela Diretoria**. Uma SIC só pode entrar em **Concluído** quando já estiver em **Aprovado Pela Diretoria**.

Ao mover qualquer demanda para **Concluído**, a **Data entrega real** é obrigatória. O sistema não preenche mais essa data automaticamente; ela precisa ser informada pelo usuário no fechamento da demanda.

Na sequência, o sistema exige a confirmação do impacto no EV:

- **Atualizar o EV**: abre o EV da obra e, após salvar a nova versão, continua a conclusão da demanda.
- **Não houve mudança no EV**: registra explicitamente que a demanda não alterou o estudo.

Para SICs, essa etapa é apresentada como uma caixa de obrigatoriedades: confirmar o EV (alterando-o ou declarando que não houve mudança), informar a **Data entrega real** e informar o **Valor da demanda**. O valor pode ser `R$ 0,00`, mas precisa ser informado explicitamente. Para os demais tipos, o mesmo campo continua sendo tratado como valor gerado.

Cards concluídos não exibem tempo de permanência na etapa **Concluído**. O histórico das etapas anteriores continua preservado.

Os tipos de atividade usados na criação e na edição são os mesmos: **Emissão Inicial**, **Revisão de Orçamento**, **Demanda Extra** e **SIC**.
