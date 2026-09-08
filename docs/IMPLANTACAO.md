# Implantação e recuperação

Destinos: [GitHub](https://github.com/salatecnicahapvida/SLT360), [site](https://salatecnicahapvida.github.io/SLT360/), Supabase `mgpkgxcenxnqvvujlclh` (us-east-2). Não usa Netlify.

## Atualização de uma instalação existente

1. Conferir branch, diff, versão remota e testes. Executar `pnpm check` e `pnpm audit --prod`.
2. Fazer snapshot privado antes da migração; não exportar dados para GitHub.
3. Conferir o esquema real. A instalação histórica recebeu SQL pelo editor, então a lista de migrações remotas não contém todos os arquivos iniciais do repositório. **Não reaplicar as migrações iniciais.**
4. Aplicar somente migrações novas e testadas. `20260908170325_unified_app.sql` é aditiva: inclui sete entidades, composição histórica protegida, bloqueios de consistência e restrição de execução anônima de helpers. `20260908172018_client_compatibility.sql` preserva a leitura por clientes antigos durante a publicação; o novo cliente anuncia seu catálogo no cabeçalho `x-client-info`. As permissões continuam verificadas no servidor.
5. A base SIC anteriormente embutida é transferida privadamente para as três entidades `budget_approval_*`, preservando os IDs. A carga é separada do código e não deve substituir registros existentes. Não reimportar por cima de edições.
6. Publicar pelo workflow Pages, disparado por push em `main`. O workflow executa lint, testes SQL/adaptador, build e navegador antes de enviar o artefato.
7. Conferir status do Actions, HTTP do site, ausência do antigo `/sic-approval-dashboard.html` e login. Confirmar com uma conta autorizada os fluxos operacionais que dependem do ambiente real.

O Pages não aplica SQL nem publica a Edge Function. A função `slt-users` continua exigindo autenticação, perfil Admin ativo e troca de senha concluída. Sua origem autorizada é `https://salatecnicahapvida.github.io`.

## Instalação nova

Aplicar as migrações iniciais em ordem em um projeto vazio. Configurar Auth sem cadastro público, criar a primeira conta e seu perfil e ativar a base modular conforme os scripts privados de importação. Não usar dados fictícios como carga operacional. Configurar URL de autenticação e publicar `slt-users` antes do frontend.

`prepare-module-import.mjs` e `verify-module-import.mjs` são ferramentas de operação, não etapas do build. Os arquivos de entrada e saída devem ficar em diretório privado externo. Migrações já aplicadas são histórico imutável; o gerador antigo que sobrescrevia a migração inicial foi removido.

## Recuperação

Os snapshots do aplicativo são privados. O automático ocorre na entrada de usuário, não por um agendador independente. O snapshot copia os registros e metadados; não contém os binários do Storage nem credenciais Auth. A rotina de restauração reaplica as entidades de negócio e cria uma cópia do estado anterior. Contas, permissões e arquivos exigem procedimento administrativo próprio.

Gravações, captura de snapshot e restauração usam bloqueio transacional comum para evitar alterações intercaladas. Depois de uma restauração, outras sessões devem recarregar; suas revisões antigas não podem sobrescrever o estado restaurado.

Se a nova interface apresentar falha, preserve o banco e investigue o erro antes de reverter. As tabelas adicionadas não devem ser apagadas para rollback. A versão anterior publicava um HTML SIC com dados embutidos: **não republicar esse artefato**. Um rollback precisa manter o bloqueio dessa página e compatibilidade com as entidades novas; preferir correção incremental.

Dados salvos no `localStorage` de navegadores antigos não estão no repositório e não são recuperáveis pelo servidor. As chaves antigas não são apagadas por esta versão. Eventual conciliação dessas cópias deve ser privada e preservar os dados mais recentes.

## Limites verificados

- Testes SQL locais usam PGlite com Auth/Storage mínimos simulados; não substituem testes do Storage real.
- Os testes de navegador usam o build de produção e backend simulado, incluindo login, permissões, fila e recarga de SIC.
- A leitura inicial ainda busca os módulos autorizados em conjunto. As funções remotas de carregamento inicial parcial não são usadas pelo frontend atual.
- A carga financeira histórica distingue agregados completos dos detalhes disponíveis; não inventar lançamentos ausentes.
- Consultar os advisors após mudanças de esquema. RPCs públicas de escrita com `SECURITY DEFINER` são intencionais e exigem validação de sessão, módulo e revisão no corpo.
