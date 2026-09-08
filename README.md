# SLT360 — Sala Técnica

Aplicativo de Orçamento, EV, SIC, Manutenção, Engenharia Clínica e Controle de Verbas. Interface estática no GitHub Pages; autenticação, dados e arquivos no Supabase.

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
- `src/boot.js`: login, sessão, inicialização e API Supabase.
- `src/module-model.js`: catálogo relacional e conversão entre registros e estado.
- `src/module-store.js`: diferenças por registro, fila, revisões e confirmação de gravação.
- `src/sic-dashboard.js`: acompanhamento de SIC/SAP integrado, sem iframe nem base pública.
- `src/users-admin.js` e `src/backups-ui.js`: gestão de contas e backups.
- `src/dates.js`, `src/csv.js`, `src/arithmetic.js`: regras compartilhadas e testáveis.
- `public/`: HTML inicial, estilos e imagens; nunca dados operacionais.

O build compila diretamente `src/boot.js` e seus imports. Não há cópia standalone nem reescrita de funções durante o build. Edite `src/`; `dist/` é gerado.

As permissões vêm do banco. Admin administra o sistema; Gestor e Analista recebem consulta/edição por módulo. Projetos permanece no banco e no código, mas está indisponível na navegação atual.

## Publicação e dados

Push em `main` executa testes e publica `dist/` no GitHub Pages. Migrações de banco e Edge Functions são etapas separadas: consulte [implantação](docs/IMPLANTACAO.md).

Uma gravação só é confirmada depois que o servidor retorna todas as revisões. Falha ou conflito bloqueia a fila; não há mesclagem automática. Anexos usam Storage privado, até 10 MB.

Snapshots automáticos são solicitados ao entrar, quando não há um das últimas 24 horas. O painel apresenta 14 dias de histórico. A restauração cobre registros de negócio; arquivos binários, contas e permissões têm recuperação separada.

Nunca adicionar exportações, planilhas operacionais, senhas ou chaves administrativas ao repositório. A configuração em `src/config.js` contém somente a URL e a chave pública do projeto.

Veja [auditoria e mudanças](docs/AUDITORIA-20260908.md), [mapa do banco](docs/MAPA-DO-BANCO.md) e [usuários](docs/USUARIOS-E-EQUIPE.md).
