# SLT360 — piloto administrativo

Sistema da Sala Técnica preparado para GitHub Pages e Supabase, sem Netlify.
Esta versão exige login real e um perfil administrativo habilitado no banco.
Não contém bases operacionais, senhas de demonstração nem chaves secretas.

## Executar e verificar

Requisitos: Node.js 24 e pnpm. Execute `pnpm install --frozen-lockfile`,
`pnpm test` e `pnpm build`. Sirva a pasta `dist` por HTTP para abrir o aplicativo.
O login só funciona depois da instalação do banco e da criação dos acessos.

- `src/config.js`: URL e chave **publishable** do projeto Supabase; não são segredo.
- `supabase/migrations/202608310001_pilot.sql`: estrutura e políticas do piloto.
- `supabase/migrations/202608310003_modules.sql`: banco relacional por módulo, vínculos, RLS e auditoria.
- `docs/ADR-001-BANCO-MODULAR.md`: decisão de arquitetura, segurança e consequências.
- `docs/IMPLANTACAO.md`: instalação, validação, limites e recuperação.
- `.github/workflows/pages.yml`: testes e publicação manual no GitHub Pages.

Os dados históricos e arquivos originais ficam fora deste repositório e fora de `dist`.
Nunca adicionar exportações, planilhas operacionais, senhas, tokens administrativos,
chaves `secret`/`service_role` ou o arquivo privado de carga inicial ao GitHub.

## Comportamento

Somente administradores explicitamente habilitados podem ler e salvar dados.
Uma conta criada no Supabase Auth, sozinha, não recebe acesso ao sistema.
Gravações usam revisão esperada por registro: alterações independentes podem ocorrer
em paralelo; duas alterações no mesmo registro exigem recarregamento. Um lote relacionado
é salvo em uma única transação. Não existe mesclagem automática do mesmo registro.
O indicador "Salvo no banco" só aparece após confirmação do servidor.

Projetos, Orçamento, Manutenção, Engenharia Clínica e Controle de Verbas possuem
tabelas independentes. Cadastros compartilhados ficam no núcleo. Datas, valores,
fases e vínculos são tipados e indexados; atributos legados adicionais ficam em uma
extensão controlada até serem promovidos a campos oficiais.

Anexos novos usam um bucket privado com limite de 10 MB por arquivo. Anexos que
existiam apenas no IndexedDB de outro navegador não fazem parte do arquivo original
e precisam ser enviados novamente. Não há recuperação automática desses arquivos.

Os ajustes visuais solicitados foram preservados: títulos dos cartões sem o sufixo
"360" e assistente Haptec em tamanho menor. O painel SIC utiliza a lista do aplicativo;
o HTML antigo com dados incorporados não é publicado.
