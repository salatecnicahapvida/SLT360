# SLT360 — Sala Técnica

Aplicativo de Obras, EV, SIC, Manutenção, Engenharia Clínica e Controle de Verbas. Interface estática no GitHub Pages; autenticação, dados e arquivos no Supabase.

## Desenvolvimento

Node.js 24 e pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm dev
```

`pnpm check` executa análise estática, testes de banco/adaptador, build e testes de navegador. Em Linux, instale o navegador com `pnpm exec playwright install --with-deps chromium`. Os testes usam dados sintéticos e interceptam o Supabase; não alteram a produção. No Windows, usam o Edge instalado.

`pnpm dev` serve a última saída de `pnpm build` em http://127.0.0.1:4173. O aplicativo normal exige uma conta real. Criação/redefinição de usuários usa a origem autorizada na Edge Function.

## Fonte única

- `src/app.js`: telas e regras de negócio vigentes.
- `src/boot-entry.js` e `src/boot.js`: entrada do aplicativo, coordenação de persistência, login, sessão, inicialização e API Supabase.
- `src/module-model.js`: catálogo relacional e conversão entre registros e estado.
- `src/module-store.js` e `src/lazy-module-store.js`: diferenças por registro, fila, revisões, carga modular e confirmação de gravação.
- `src/sic-dashboard.js`, `src/sic-dashboard.css` e `src/sic-dashboard.html`: painel integrado de SIC/SAP, carregado dinamicamente pela aplicação.
- `src/sic-approvals.js` e `src/sic-approvals.html`: visão dedicada de Aprovação de SICs, com estado compartilhado persistido no Supabase.
- `src/sic-director-queue.js`: regras de vínculo entre Portfólio, fila de SICs e aprovação da Diretoria.
- `src/users-admin.js` e `src/backups-ui.js`: gestão de contas e backups.
- `src/dates.js`, `src/csv.js`, `src/arithmetic.js`: regras compartilhadas e testáveis.
- `public/`: HTML inicial, estilos e imagens; nunca dados operacionais.

O build compila diretamente `src/boot-entry.js` e seus imports. Não há cópia standalone nem reescrita de funções durante o build. Edite `src/`; `dist/` é gerado.

As permissões vêm do banco. Admin administra o sistema; Gestor e Analista recebem consulta/edição por módulo. **Projetos está descontinuado como módulo operacional e não concede acesso pela interface.** As tabelas e identificadores legados de Projetos permanecem apenas como estrutura técnica compartilhada; `projects_works`, por exemplo, continua sendo usado pelo Portfólio de Obras e herda a permissão de escrita de **Obras**.

## Publicação e dados

Push em `main` executa testes e publica `dist/` no GitHub Pages. Migrações de banco e Edge Functions são etapas separadas: consulte [implantação](docs/IMPLANTACAO.md).

Uma gravação só é confirmada depois que o servidor retorna todas as revisões. Falha ou conflito bloqueia a fila; não há mesclagem automática. Anexos usam Storage privado, até 10 MB.

Snapshots automáticos são solicitados ao entrar, quando não há um das últimas 24 horas. O painel apresenta 14 dias de histórico. A restauração cobre registros de negócio; arquivos binários, contas e permissões têm recuperação separada.

Nunca adicionar exportações, planilhas operacionais, senhas ou chaves administrativas ao repositório. A configuração em `src/config.js` contém somente a URL e a chave pública do projeto.

Veja [matriz de regras de negócio](docs/MATRIZ-REGRAS-DE-NEGOCIO.md), [auditoria e mudanças](docs/AUDITORIA-20260908.md), [auditoria estrutural](docs/AUDITORIA-ESTRUTURA-2026-09-28.md), [mapa do banco](docs/MAPA-DO-BANCO.md) e [usuários](docs/USUARIOS-E-EQUIPE.md).
