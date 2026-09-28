# Matriz de Regras de Negócio — SLT360

Estado consolidado em **28/09/2026**.

Esta matriz consolida as regras operacionais ativas do SLT360 após a revisão do fluxo de SIC e a descontinuação do módulo Projetos. A numeração preserva os IDs usados na auditoria preliminar para manter rastreabilidade. **As regras 67 e 68 foram excluídas por decisão de negócio e, por isso, não aparecem na tabela.**

## Convenções

- **Sim** em “Trava no banco” significa que há trigger, função/RPC, RLS, constraint ou regra de persistência no PostgreSQL/Supabase que impede a operação inválida.
- **Parcial** significa que parte da regra é garantida pelo banco e parte permanece na aplicação.
- **UI** significa regra de apresentação/fluxo que não deve ser tratada como autorização de segurança.
- **Projetos** não é mais módulo operacional. Tabelas com prefixo `slt_projects_` são legado técnico; quando necessárias ao fluxo atual, a regra pertence a **Obras**.

| ID | Regra | Perfil autorizado | Módulo | Ação | Trava no banco | Observação |
|---:|---|---|---|---|---|---|
| 1 | Toda operação de dados exige usuário autenticado. | Todos autenticados | Global | Ler/gravar | Sim | Supabase Auth + RLS/RPC. |
| 2 | O perfil precisa estar ativo. | Admin/Gestor/Analista | Global | Ler/gravar | Sim | Perfil inativo perde novas leituras e gravações. |
| 3 | Usuário com troca de senha pendente não carrega dados operacionais. | Todos | Global | Acessar | Sim | `must_change_password` bloqueia o uso normal. |
| 4 | Admin possui acesso aos módulos operacionais ativos e à administração. | Admin | Global | Administrar | Sim | Não reativa Projetos. |
| 5 | Gestor só acessa módulos concedidos. | Gestor | Global | Ler/gravar | Sim | Permissão por `slt_core_module_access`. |
| 6 | Analista só acessa módulos concedidos. | Analista | Global | Ler/gravar | Sim | Permissão por `slt_core_module_access`. |
| 7 | Permissão de escrita pressupõe permissão de leitura. | Admin | Configuração | Conceder acesso | Sim | Constraint de acesso. |
| 8 | Cadastros administrativos e permissões são controlados por Admin. | Admin | Configuração | Administrar | Sim | Gestor/Analista não alteram perfis diretamente. |
| 9 | A permissão é conferida em cada operação no banco. | Todos | Global | Ler/gravar | Sim | A UI nunca é a única barreira. |
| 10 | Projetos está descontinuado e não concede acesso operacional, mesmo que exista grant legado. | Nenhum | Legado técnico | Abrir módulo | Sim + UI | `moduleAllowed(...,'projects')` retorna falso. |
| 11 | Somente Admin cria contas pelo fluxo administrativo. | Admin | Configuração | Criar usuário | Sim | Edge Function valida o Admin autenticado. |
| 12 | Senha provisória é gerada no servidor e exibida uma única vez. | Admin | Configuração | Criar usuário | Sim | Não é persistida no estado operacional. |
| 13 | Primeiro acesso exige troca da senha provisória. | Próprio usuário | Global | Ativar acesso | Sim | Dados só carregam depois da troca. |
| 14 | Senha definitiva deve ter ao menos 8 caracteres e não pode ser igual à provisória. | Próprio usuário | Global | Trocar senha | Sim | Validação do fluxo de primeiro acesso. |
| 15 | Conta existente apenas no Auth, sem perfil SLT360, não possui acesso. | Nenhum | Global | Ler/gravar | Sim | Perfil da aplicação é obrigatório. |
| 16 | Uma identidade de analista só pode estar vinculada a uma conta. | Admin | Configuração | Vincular analista | Sim | Evita duplicidade de identidade operacional. |
| 17 | Alterar vínculo de analista não apaga nomes nem históricos anteriores. | Admin | Configuração | Editar usuário | Sim | Histórico usa identificadores próprios. |
| 18 | Somente Admin altera perfil e módulos de outro usuário. | Admin | Configuração | Editar acesso | Sim | Operação administrativa protegida. |
| 19 | Admin não pode desativar a própria conta pelo fluxo administrativo. | Admin | Configuração | Desativar conta | Sim | Proteção contra auto-bloqueio. |
| 20 | Admin não pode remover o próprio perfil Admin pelo fluxo administrativo. | Admin | Configuração | Alterar perfil | Sim | Proteção contra auto-rebaixamento. |
| 21 | Edição concorrente de acesso usa revisão otimista. | Admin | Configuração | Editar acesso | Sim | Revisão divergente gera conflito. |
| 22 | Alterações de perfil e permissões são transacionais. | Admin | Configuração | Editar acesso | Sim | Não deixa perfil e grants parcialmente atualizados. |
| 23 | Alterações administrativas de acesso geram auditoria própria. | Admin | Configuração | Editar acesso | Sim | `slt_core_access_audit`. |
| 24 | Desativar conta bloqueia novas operações sem apagar o histórico. | Admin | Configuração | Desativar | Sim | Dados históricos permanecem. |
| 25 | Dados já exibidos em uma sessão não são apagados retroativamente após mudança de acesso. | N/A | Global | Revogar acesso | N/A | Novas chamadas já são bloqueadas; usuário deve sair. |
| 26 | O Supabase é a fonte única dos dados operacionais compartilhados. | Todos | Global | Persistir | Sim | Não existe dado operacional válido somente na máquina. |
| 27 | Armazenamento local é restrito a autenticação, sessão e preferências técnicas. | Todos | Global | Persistir localmente | UI | Não substitui a persistência do banco. |
| 28 | “Salvo” só aparece após confirmação das revisões pelo servidor. | Todos com escrita | Global | Salvar | Sim + UI | Sem confirmação não há sucesso visual. |
| 29 | Durante gravação pendente o sistema sinaliza “Salvando…”. | Todos com escrita | Global | Salvar | UI | Estado global de persistência. |
| 30 | Falha de persistência é exibida e a fila permanece pendente/bloqueada. | Todos com escrita | Global | Salvar | Parcial | Não mascara erro como sucesso. |
| 31 | Fechar/recarregar a página com gravação pendente gera aviso do navegador. | Todos com escrita | Global | Sair durante gravação | UI | `beforeunload` quando a fila está suja. |
| 32 | Gravações são enfileiradas por módulo. | Todos com escrita | Global | Salvar | Sim + cliente | Evita corrida de alterações locais. |
| 33 | Conflitos de revisão são explícitos; não existe merge automático silencioso. | Todos com escrita | Global | Resolver conflito | Sim | Usuário precisa recarregar/reconciliar. |
| 34 | Repetição da mesma requisição usa `request_id` idempotente. | Todos com escrita | Global | Salvar | Sim | Evita duplicação após timeout/retry. |
| 35 | Locks de registros são reservados em ordem determinística entidade → chave. | Todos com escrita | Global | Salvar concorrente | Sim | Reduz deadlocks. |
| 36 | Gravações pai/filho preservam a ordem lógica do lote. | Todos com escrita | Global | Salvar | Sim | Lock order não altera dependências. |
| 37 | Registros operacionais possuem revisão por registro. | Todos | Global | Atualizar | Sim | Base do controle de concorrência. |
| 38 | Exclusões de negócio são preferencialmente lógicas/históricas, não apagamento silencioso. | Conforme módulo | Global | Excluir/arquivar | Sim | `deleted_at`/tabelas de arquivamento. |
| 39 | Tabelas de origem/importação são somente leitura para a aplicação. | Todos | Global | Importar/consultar | Sim | Novas gravações vão às tabelas operacionais. |
| 40 | Ausência de registro na origem não autoriza criar dado fictício. | Todos | Global | Carregar/importar | Sim por modelo | O sistema preserva ausência real. |
| 41 | A obra é a unidade central do fluxo de Orçamento/EV/SIC. | Todos com acesso | Obras | Consultar/editar | Sim por relacionamento | Relações apontam para a obra. |
| 42 | Portfólio, demandas de orçamento, EV e SIC pertencem operacionalmente a Obras. | Conforme grant | Obras | Operar | Sim + UI | “Projetos” não recebe regra operacional nova. |
| 43 | `slt_projects_works` permanece como relação física legada de obras. | Conforme Obras | Obras | Consultar | Sim | Nome da tabela é legado técnico. |
| 44 | Escrita em `projects_works` herda permissão de escrita de Obras. | Admin/Gestor/Analista com escrita em Obras | Obras | Editar obra | Sim + cliente | Exceção explícita de compatibilidade. |
| 45 | Entidades específicas de Projetos não são expostas para novas operações pela interface. | Nenhum | Legado técnico | Criar/editar demanda de Projeto | UI + acesso | Dados históricos permanecem preservados. |
| 46 | Unidades, fornecedores e sprints funcionam como referências compartilhadas. | Usuários autorizados | Global | Consultar | Sim | Não limitadas ao analista da demanda. |
| 47 | Controle de Verbas pode relacionar seus registros às obras existentes. | Conforme grant Finance | Controle de Verbas | Consultar vínculo | Sim | FK/relação com obra. |
| 48 | Arquivar obra/demanda não apaga histórico relacionado. | Gestor/Admin ou perfil autorizado | Obras | Arquivar | Sim | Preserva rastreabilidade. |
| 49 | Revisões/importações de obra preservam histórico de versões. | Sistema/Admin | Obras | Importar/revisar | Sim | Não sobrescrevem silenciosamente versões anteriores. |
| 50 | Chaves de obra usadas nos vínculos não são recriadas apenas por mudança de descrição. | Sistema/Admin | Obras | Editar cadastro | Sim por chave | Evita quebrar relacionamentos. |
| 51 | Cada obra possui um único EV principal com histórico de versões. | Usuários com escrita em Obras | Obras/EV | Criar/editar EV | Sim por modelo | Não criar dois EVs principais para a mesma obra. |
| 52 | Status operacional do EV é “Completo” ou “Incompleto”, derivado do conteúdo vigente. | Sistema/usuário com escrita | Obras/EV | Classificar EV | Parcial | “Rascunho” não é estado operacional vigente. |
| 53 | Novos EVs começam incompletos até atenderem os critérios de conteúdo. | Usuários com escrita em Obras | Obras/EV | Criar EV | Parcial | Estado calculado. |
| 54 | Versões anteriores do EV são preservadas. | Usuários com escrita em Obras | Obras/EV | Revisar EV | Sim | Nova versão não apaga a anterior. |
| 55 | Revisão completa do EV não é automaticamente uma SIC. | Usuários com escrita em Obras | Obras/EV | Revisar | Regra de domínio | SIC é alteração pontual vinculada ao fluxo próprio. |
| 56 | O Kanban de Obras usa fases controladas; a movimentação altera a fase da demanda. | Usuário com escrita em Obras | Obras | Mover card | Sim + UI | Fases críticas têm travas adicionais abaixo. |
| 57 | Mover para Pausado exige motivo com pelo menos 5 caracteres. | Usuário com escrita | Obras | Pausar | Parcial | Motivo também entra no histórico. |
| 58 | Mover para Cancelado exige motivo com pelo menos 5 caracteres. | Usuário com escrita | Obras | Cancelar | Parcial | Vale para seletor e drag-and-drop. |
| 59 | Analista pode alterar e mover demandas existentes dentro do módulo autorizado. | Analista com escrita | Obras/Manutenção/Clínica | Atualizar | Sim | Guard de ciclo de vida. |
| 60 | Analista não pode criar nova demanda operacional. | Gestor/Admin | Obras/Manutenção/Clínica | Criar demanda | Sim | Analista recebe 42501. |
| 61 | Analista não pode excluir demanda. | Gestor/Admin | Obras/Manutenção/Clínica | Excluir | Sim | Guard de ciclo de vida. |
| 62 | Analista não pode arquivar nem restaurar demanda por troca de `deleted_at`. | Gestor/Admin | Obras/Manutenção/Clínica | Arquivar/restaurar | Sim | Mesmo guard de ciclo de vida. |
| 63 | Gestor/Admin podem criar e administrar demandas se possuírem escrita no módulo. | Gestor/Admin com escrita | Obras/Manutenção/Clínica | Criar/administrar | Sim | RLS/permissão de módulo continua obrigatória. |
| 64 | Toda demanda concluída exige Data entrega real. | Usuário que conclui | Obras | Concluir | Sim | `delivered_on` obrigatório. |
| 65 | Card concluído não exibe tempo de permanência na coluna Concluído. | Todos | Obras | Visualizar | UI | Regra de visualização. |
| 66 | Histórico das etapas anteriores permanece após conclusão. | Todos com leitura | Obras | Consultar histórico | Sim | Não é descartado ao fechar demanda. |
| 69 | **Aguardando Validação Obras → Validado Obras** confirma somente a etapa e não exige valor validado de Obras. | Qualquer usuário com escrita em Obras | Obras/SIC | Validar Obras | Sim | Substitui as regras de valor removidas. |
| 70 | Para validar Obras o usuário precisa ter escrita em Obras. | Admin/Gestor/Analista com escrita | Obras/SIC | Validar Obras | Sim | Permissão de módulo continua valendo. |
| 71 | **Validado Obras → Aguardando Aprovação Diretoria** é exclusiva de Gestor/Admin. | Gestor/Admin com escrita | Obras/SIC | Enviar à Diretoria | Sim | Analista é rejeitado. |
| 72 | A transição para Aguardando Aprovação Diretoria exige escrita em Obras. | Gestor/Admin com escrita | Obras/SIC | Enviar à Diretoria | Sim | Perfil sozinho não basta. |
| 73 | Aguardando Aprovação Diretoria só pode ser acessado a partir de Validado Obras no fluxo padrão. | Gestor/Admin | Obras/SIC | Enviar à Diretoria | Sim | Mantém ordem da esteira. |
| 74 | **Aguardando Aprovação Diretoria → Aprovado Diretoria é exclusiva de Gestor/Admin.** | Gestor/Admin com escrita | Obras/SIC | Aprovar Diretoria | Sim | Regra revisada em 28/09/2026. |
| 75 | A aprovação da Diretoria exige decisão com valor final informado e coerente com o valor vigente da demanda. | Gestor/Admin | Obras/SIC | Aprovar Diretoria | Sim | `sicDirectorDecision.finalAmount`. |
| 76 | Aprovado Diretoria só pode ser acessado a partir de Aguardando Aprovação Diretoria. | Gestor/Admin | Obras/SIC | Aprovar Diretoria | Sim | Mantém ordem da esteira. |
| 77 | Dispensa da aprovação da Diretoria só pode ser registrada por Gestor/Admin. | Gestor/Admin | Obras/SIC | Registrar dispensa | Sim | Exceção auditada. |
| 78 | A dispensa exige justificativa com pelo menos 10 caracteres. | Gestor/Admin | Obras/SIC | Registrar dispensa | Sim | Campo obrigatório. |
| 79 | A dispensa exige data, nome e identificador do responsável. | Gestor/Admin | Obras/SIC | Registrar dispensa | Sim | Metadados auditáveis. |
| 80 | Ao registrar a dispensa, `waivedById` precisa corresponder ao usuário autenticado. | Gestor/Admin | Obras/SIC | Registrar dispensa | Sim | Impede atribuir a decisão a terceiro. |
| 81 | No fluxo normal, SIC só conclui após Aprovado Diretoria. | Usuário com escrita | Obras/SIC | Concluir | Sim | Depois de aprovada, Analista pode concluir se cumprir as demais obrigações. |
| 82 | A exceção de conclusão sem Aprovado Diretoria só existe a partir de Aguardando Aprovação Diretoria com dispensa auditada. | Gestor/Admin | Obras/SIC | Concluir por dispensa | Sim | Não vale para fases anteriores. |
| 83 | Conclusão por dispensa é exclusiva de Gestor/Admin. | Gestor/Admin | Obras/SIC | Concluir por dispensa | Sim | Analista é rejeitado. |
| 84 | A conclusão por dispensa continua exigindo Data entrega real. | Gestor/Admin | Obras/SIC | Concluir | Sim | Mesma obrigação geral de conclusão. |
| 85 | Ao concluir SIC, o impacto no EV deve ser declarado: atualizar EV ou registrar que não houve mudança. | Usuário com escrita | Obras/SIC/EV | Concluir | Parcial | Fluxo de obrigatoriedades da aplicação. |
| 86 | A conclusão de SIC exige Valor da demanda explicitamente informado; zero é válido. | Usuário com escrita | Obras/SIC | Concluir | Parcial | Valor ausente é diferente de R$ 0,00. |
| 87 | Para demandas não SIC, o mesmo campo segue tratado como valor gerado. | Usuário com escrita | Obras | Concluir | Parcial | Sem semântica de aprovação SIC. |
| 88 | Escolher “Atualizar o EV” cria/salva a revisão correspondente antes de finalizar o fluxo. | Usuário com escrita | Obras/EV | Atualizar EV | Parcial | Mantém versionamento. |
| 89 | Escolher “Não houve mudança no EV” registra explicitamente a ausência de alteração. | Usuário com escrita | Obras/EV | Confirmar sem mudança | Parcial | Evita conclusão ambígua. |
| 90 | SIC não depende de o EV estar aprovado/postado para existir ou avançar no seu próprio fluxo. | Usuário autorizado | Obras/SIC | Operar SIC | Regra de domínio | As travas são as fases e obrigatoriedades da SIC. |
| 91 | O valor de delta da SIC é persistido em campo financeiro próprio. | Sistema/usuário com escrita | Obras/SIC | Salvar SIC | Sim | `delta_amount`. |
| 92 | Postagem/efetivação de SIC que altera o EV gera nova versão do EV. | Sistema/usuário com escrita | Obras/SIC/EV | Postar SIC | Sim + fluxo | Mantém rastreabilidade financeira. |
| 93 | SIC deve permanecer vinculada à obra e, quando aplicável, à demanda de origem. | Usuário com escrita | Obras/SIC | Criar/editar | Sim | Relacionamentos físicos. |
| 94 | Itens de SIC registram impactos por disciplina. | Usuário com escrita | Obras/SIC | Detalhar impacto | Sim por modelo | `slt_budget_sic_items`. |
| 95 | Linhas genéricas históricas de SIC não devem receber novos impactos quando houver disciplina real identificável. | Usuário com escrita | Obras/SIC/EV | Lançar impacto | Parcial | Regra de rastreabilidade por disciplina. |
| 96 | Valores financeiros do EV/SIC devem usar o dicionário canônico de disciplinas quando aplicável. | Usuário com escrita | Obras/EV/SIC | Classificar valor | Parcial | Evita categorias livres equivalentes. |
| 97 | A posição canônica das disciplinas não deve ser reordenada por edição operacional. | Admin/configuração controlada | Obras/EV | Manter dicionário | Parcial | Ordem tem significado histórico. |
| 98 | Saldo da linha de EV é derivado de orçado + aditivado aprovado − contratado. | Sistema | Obras/EV | Calcular saldo | Regra de cálculo | Não é valor manual independente. |
| 99 | Valores financeiros exibidos ao usuário usam duas casas decimais. | Todos | Global financeiro | Exibir valor | UI | Padronização monetária. |
| 100 | Registros históricos consolidados de SIC podem ser editados/excluídos somente pelos fluxos autorizados, preservando vínculos e auditoria. | Gestor/Admin conforme permissão | Obras/SIC | Corrigir legado | Parcial | Inclui registros legados consolidados. |
| 101 | Manutenção possui escopo próprio de leitura/escrita por módulo. | Conforme grant | Manutenção | Operar OS | Sim | Não herda permissão de Obras. |
| 102 | Engenharia Clínica possui escopo próprio de leitura/escrita por módulo. | Conforme grant | Engenharia Clínica | Operar OS/ativos | Sim | Não herda permissão de Manutenção. |
| 103 | Eventos de OS são filhos da ordem correspondente. | Usuário com escrita | Manutenção/Clínica | Registrar evento | Sim | Integridade pai/filho. |
| 104 | Arquivamento de OS preserva dados e histórico. | Gestor/Admin ou autorizado | Manutenção/Clínica | Arquivar | Sim | Não é perda silenciosa. |
| 105 | Valores proposto, técnico e negociado possuem campos separados. | Usuário com escrita | Manutenção/Clínica | Registrar valor | Sim por modelo | Não colapsar semânticas financeiras. |
| 106 | Ativo clínico pode ser vinculado à unidade e às OS clínicas. | Usuário com escrita | Engenharia Clínica | Vincular ativo | Sim | Relações físicas no banco. |
| 107 | Unidades e sprints são referências compartilhadas nas OS. | Usuário autorizado | Manutenção/Clínica | Vincular referência | Sim | Cadastro central. |
| 108 | Analista com escrita pode alterar OS existente. | Analista com escrita | Manutenção/Clínica | Atualizar OS | Sim | Mesmo guard de ciclo de vida. |
| 109 | Analista não cria nem exclui OS operacionais. | Gestor/Admin | Manutenção/Clínica | Criar/excluir OS | Sim | Mesmo guard geral. |
| 110 | Leituras importadas de Manutenção/Clínica não são substituídas por dados fictícios. | Sistema/Admin | Manutenção/Clínica | Importar | Sim por modelo | Fontes permanecem rastreáveis. |
| 111 | Controle de Verbas possui permissão própria (`finance`). | Conforme grant | Controle de Verbas | Ler/gravar | Sim | Independente de Obras para edição financeira. |
| 112 | Movimentos financeiros devem permanecer vinculados à verba/obra correspondente quando o modelo exigir. | Usuário com escrita Finance | Controle de Verbas | Lançar movimento | Sim | FKs e relações. |
| 113 | Remanejamento não pode consumir valor superior ao saldo disponível da origem. | Usuário autorizado | Controle de Verbas | Transferir verba | Parcial/Sim conforme fluxo | Regra financeira de origem. |
| 114 | EV/SIC deve consumir verba existente na OI vinculada quando houver integração de verba. | Usuário autorizado | Obras/Controle de Verbas | Consumir verba | Parcial | Evita consumo sem origem orçamentária. |
| 115 | Transferência entre categorias ORC diferentes é tratada como exceção e exige aprovação/alerta específico. | Gestor/Admin conforme fluxo | Controle de Verbas | Transferir | Parcial | Mesma categoria segue fluxo normal. |
| 116 | Snapshot automático é solicitado ao entrar quando não existe backup das últimas 24 horas. | Sistema | Backup | Criar snapshot | Sim + cliente | Backup versionado em nuvem. |
| 117 | Painel de backup apresenta histórico operacional de 14 dias. | Admin | Backup | Consultar | UI | Janela de visualização. |
| 118 | Restauração cobre registros de negócio; arquivos binários, contas e permissões têm recuperação separada. | Admin | Backup | Restaurar | Sim por escopo | Evita falsa garantia de restauração total. |
| 119 | Anexos ficam em Storage privado, têm metadado de módulo e limite de 10 MB; falha de upload remove metadado incompleto. | Usuário autorizado no módulo | Global | Anexar arquivo | Sim | Legados sem escopo ficam restritos ao Admin. |
| 120 | Alterações relevantes geram trilha de auditoria/histórico e migrações antigas permanecem imutáveis como registro de implantação. | Sistema/usuários autorizados | Global | Auditar | Sim | `slt_core_change_log`, histórico global e migrações versionadas. |

## Alterações desta consolidação

1. **Regras 67 e 68 removidas:** `Validado Obras` não exige mais “valor validado por Obras” nem igualdade entre esse valor e o valor da demanda.
2. **Regra 74 alterada:** `Aguardando Aprovação Diretoria → Aprovado Diretoria` agora é exclusiva de **Gestor/Admin com escrita em Obras**.
3. A confirmação do **valor final aprovado pela Diretoria** permanece na regra 75; a remoção de valor ocorreu somente na etapa de validação de Obras.
4. **Projetos descontinuado/oculto:** nenhuma regra operacional nova depende do módulo `projects`. O legado `projects_works` foi reclassificado funcionalmente como infraestrutura técnica de **Obras** e herda a permissão de escrita de Obras.
5. Regras estritamente específicas do antigo Kanban/portfólio de Projetos deixam de integrar a matriz operacional vigente; os dados históricos são preservados.

## Fontes técnicas principais

- `src/access.js`
- `src/boot.js`
- `src/module-model.js`
- `src/module-store.js`
- `src/lazy-module-store.js`
- `src/app.js`
- `docs/FLUXO-CONCLUSAO-DEMANDAS.md`
- `docs/USUARIOS-E-EQUIPE.md`
- `docs/MAPA-DO-BANCO.md`
- migrações em `supabase/migrations/`, especialmente `20260928182951_relax_sic_works_validation_and_lock_director_approval.sql`
