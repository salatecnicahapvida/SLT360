# Usuários e equipe

Entre como administrador e abra **Configuração → Usuários e Equipe → Novo usuário**.
Informe nome e e-mail, escolha Admin, Gestor ou Analista e associe um analista existente.
Se a pessoa ainda não constar da lista, deixe o vínculo vazio e preencha Novo analista.
Uma identidade de analista só pode ser vinculada a uma conta. Nomes e demandas históricos
são preservados; o vínculo usa identificadores próprios no banco.

Para cada módulo, selecione Sem acesso, Somente consulta ou Consulta e edição.
Gestores e analistas só recebem os módulos explicitamente selecionados; Admin acessa
tudo, inclusive a administração de contas. Os registros são compartilhados entre as
pessoas autorizadas ao módulo: o vínculo de analista não restringe a leitura às próprias
demandas. Unidades, fornecedores e sprints são referências compartilhadas de consulta.
O cadastro de obras é editável por Projetos e Orçamento e consultável pelo Controle de
Verba; demandas, EVs, ordens de serviço e dados financeiros mantêm escopos próprios.

Após criar, guarde a senha provisória exibida uma única vez e entregue por canal seguro.
O sistema não envia convite nem e-mail automaticamente. A primeira entrada exige uma
senha pessoal antes de carregar dados. Nenhuma senha fica na lista de usuários ou no
estado operacional. Para alterar vínculo, perfil ou módulos, use **Editar acesso**.
Desmarque **Conta ativa** para bloquear novas leituras e gravações sem apagar histórico.
Dados já visualizados não podem ser recolhidos de uma sessão aberta; peça que a pessoa
saia do sistema ao modificar seus acessos. O banco verifica a permissão em cada operação.
O administrador não pode desativar a própria conta nem remover seu próprio perfil Admin.

## Instalação e segurança

Aplicar a migração `202608310005_users_team.sql` após 001–004, uma única vez, e publicar
a função `slt-users` de `supabase/functions/slt-users`. A função usa credenciais fornecidas
somente no ambiente do servidor, verifica o token com Supabase Auth e exige um perfil
Admin ativo sem troca de senha pendente. A conclusão da criação revalida o administrador
no banco. Senhas provisórias usam aleatoriedade criptográfica e não são registradas.
A opção de verificação de JWT da plataforma permanece habilitada; o handler também
autentica a conta, pois uma chave pública isolada não identifica um administrador.

Alterações de perfil e permissões são transacionais, possuem revisão para detectar
edições concorrentes e geram auditoria em `slt_core_access_audit`. Usuários comuns não
podem editar diretamente perfis, permissões ou auditoria. Os anexos novos têm escopo
de módulo tanto nos metadados quanto no Storage. Anexos antigos sem escopo permanecem
restritos ao administrador. Contas criadas apenas no Auth continuam sem acesso.

Em resposta incerta ao cadastro, atualize a lista antes de repetir. E-mail duplicado
não substitui senha nem assume outra conta. Se o Auth criar uma conta mas o banco
rejeitar o vínculo, o serviço desfaz somente essa conta recém-criada após conferir que
o perfil não existe. Se não conseguir confirmar essa verificação, mantém a conta sem
perfil e orienta revisão administrativa; não apaga uma conta sem essa confirmação.

Recuperação de senha esquecida e convites por e-mail não fazem parte desta versão.
Esses fluxos devem ser adicionados com retorno seguro e configuração de e-mail antes
de serem oferecidos ao usuário. Nunca publique chaves administrativas ou senhas.

## Verificação

`pnpm test` cobre perfil não administrativo, primeiro acesso, desativação, leitura e
escrita por módulo, vínculos duplicados, autoelevação, revisão concorrente, anexos e
falha no provisionamento. `pnpm build` verifica o pacote público. A tela também deve ser
conferida com conta de consulta e conta administrativa em um ambiente controlado.
