# Implantação do piloto

Estado em 31/08/2026: banco remoto instalado e carga inicial importada com autorização
do responsável. Conferência confirmou 214 obras, 30 demandas de orçamento e 1.105
registros de manutenção/clínica; checksum do documento idêntico ao arquivo de origem.
As quatro tabelas têm RLS habilitada e acesso anônimo negado. O site está publicado
no GitHub Pages. A conta administrativa foi provisionada por solicitação do
responsável, com troca obrigatória da senha provisória no primeiro acesso.

## Destinos

- Código: https://github.com/salatecnicahapvida/SLT360 (repositório público).
- Supabase: projeto `mgpkgxcenxnqvvujlclh`, região `us-east-2` (Ohio, EUA).
- Hospedagem: GitHub Pages. Não utiliza Netlify.

Confirmar a adequação da região e a autorização para transferir a base operacional
antes de importar dados. Os scripts privados de carga ficam fora do repositório.

## Sequência de implantação

1. Confirmar que não existem tabelas SLT360 no projeto de destino. Se houver,
   interromper e planejar a migração; não apagar ou sobrescrever.
2. No SQL Editor do projeto correto, executar as migrações em ordem de nome.
   A primeira cria tabelas, funções, políticas restritas e um bucket privado.
   A segunda acrescenta a proteção de primeiro acesso. Cada script é transacional
   e deve ser aplicado uma única vez; não executar novamente a carga inicial.
3. Executar a carga inicial privada autorizada. O script usa INSERT simples com
   id único; uma segunda importação falha sem substituir a base existente.
4. Em Authentication, desativar novos cadastros públicos. Criar a conta administrativa
   do responsável e confirmar o endereço. Usar uma senha provisória forte e
   entregá-la em canal privado; nunca incluir credenciais no código ou migrações.
   O responsável define sua senha pessoal na primeira entrada no aplicativo.
5. Copiar o UUID dessa conta para um INSERT em `slt360_profiles`, com nome e
   `perfil='Admin'`. Manter `must_change_password=true`, o valor padrão. O perfil
   concede acesso à base inteira somente após a troca da senha no Auth. Não liberar
   analistas até implementar e testar políticas por módulo no banco.
6. Enviar somente os arquivos deste repositório. Em Settings → Pages, escolher
   GitHub Actions. A ativação exige permissões administrativas do repositório.
7. Executar manualmente o fluxo `Publicar piloto SLT360`. O endereço esperado é
   `https://salatecnicahapvida.github.io/SLT360/`; só tratá-lo como ativo após a publicação.
8. Configurar o endereço publicado em Authentication → URL Configuration. Esta
   versão oferece login por senha; recuperação por link ainda não foi implementada.
9. Testar com conta real: login, leitura dos módulos, uma alteração controlada,
   recarregamento, anexo e saída. Repetir teste de conflito com duas sessões.
10. Conferir pelo acesso anônimo que não é possível ler tabelas nem baixar anexos.
    Acompanhar os logs de autenticação/API durante os primeiros 15 minutos de uso.

## O que já foi validado localmente

- Testes executam a migração exata em PostgreSQL local (PGlite), com os esquemas
  mínimos de Auth e Storage simulados: bloqueio de anônimos, contas não autorizadas,
  autoatribuição de perfil, gravação direta e acesso após revogação.
- Gravação atômica incrementa revisão e registra ator no servidor; revisão antiga
  falha sem sobrescrever o estado nem duplicar a auditoria.
- Bucket privado e políticas de acesso/identidade verificadas no modelo local.
- Fila de salvamento preserva cópias, ordena revisões e bloqueia após falha.
- Primeiro acesso impede leitura, gravação e anexos até a alteração efetiva da
  senha no Auth. Alterar metadados ou tentar editar o perfil não remove a exigência.
  O formulário confere confirmação e senha de 12 a 72 caracteres (até 72 bytes),
  incluindo maiúsculas, minúsculas e números; o Auth também aplica suas regras.
- Interface com serviço local de teste: login, dados de entrada, criação de sprint,
  confirmação, recarregamento mantendo a alteração e saída.
- Build copia apenas código e recursos visuais; varredura impede indicadores
  conhecidos de dados privados e senhas antigas. Não substitui revisão manual.

Esses testes não substituem os testes no Supabase real. O upload/download de anexos
e os gráficos devem ser verificados também no ambiente publicado.

## Limitações e recuperação

- Apenas piloto administrativo: todos os habilitados têm acesso amplo, inclusive
  aos dados operacionais e financeiros. Os perfis antigos não foram migrados.
- A base inicial corresponde aos arquivos extraídos, não a alterações feitas
  posteriormente no armazenamento local de outros navegadores.
- Salvamento envia o estado completo (limite de 25 MB). Aumentar usuários, volume
  ou frequência exige normalizar o banco e atualizar o modelo de concorrência.
- Ao ocorrer conflito ou falha, preservar anotações antes de recarregar. A versão
  não mantém cópia local nem mescla alterações. Não continuar gravando às cegas.
- Histórico legado exibido na tela é parte do documento editável. A auditoria
  confiável de gravações fica em `slt360_audit` e não pode ser alterada pelo aplicativo.
- Definir backup operacional externo antes do uso contínuo. A auditoria não guarda
  versões completas nem recupera dados. Exportar banco e anexos com ferramentas
  administrativas para armazenamento privado; testar restauração em projeto separado.
- Upload concluído seguido de falha de metadados pode deixar arquivo órfão privado.
  Limpeza, exclusão e antivírus de anexos são tarefas administrativas futuras.
- O fluxo legado de SIC mantém suas regras anteriores, inclusive lançamento agregado.
  Validar com o responsável antes de uso financeiro definitivo.

Se login, autorização, persistência ou anexos falharem na implantação, interromper
o piloto. Suspender os perfis ativos no banco e manter a prévia local para consulta.
Reverter apenas o site para uma versão compatível previamente validada; nunca
publicar a versão antiga com dados embutidos. Não remover tabelas ou executar
novamente a carga sobre dados novos. Investigar e preservar backup antes de restaurar.

Referências: [publicação por Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
[políticas RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[controle de arquivos](https://supabase.com/docs/guides/storage/security/access-control).
