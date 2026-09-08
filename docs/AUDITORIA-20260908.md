# Auditoria e unificação — 08/09/2026

Base analisada: `0db2359`. Escopo: fonte efetiva, build, permissões, persistência, painel SIC, migrações, backups, dependências, publicação e testes.

## Correções

| Achado | Correção |
|---|---|
| Duas cópias da aplicação e transformações textuais no build | Uma fonte em `src/app.js`; build direto com imports. |
| HTML SIC público, base embutida e gravação no navegador | Componente nativo com estilos isolados, dados privados por registro e fila Supabase. Importação Excel e histórico preservados. |
| Credenciais e formulários locais antigos sobrepostos ao Auth | Removidos os fluxos sem uso; autenticação fica no boot e contas no módulo administrativo. |
| Ajustes feitos por MutationObservers e scripts paralelos | Navegação e nomes incorporados à fonte; gestão administrativa nativa. |
| Referência fixa a 03/08/2026 | Calendário de São Paulo consultado em cada operação. |
| Tipologias, metas e exclusões históricas não persistidas | Quatro entidades novas com revisão e RLS de Orçamento. |
| Regras antigas de perfil contrariavam permissões | Consulta/edição guiadas pelos grants efetivos do Supabase; controles de consulta bloqueiam mutações. |
| Resposta incompleta poderia anunciar salvamento | A fila exige confirmação de cada chave e revisão do lote. |
| Restauração poderia intercalar com gravações | Bloqueio comum entre commit, snapshot e restauração. |
| Detalhes históricos existiam apenas em esquema remoto | Estrutura e RPC documentadas em migração; composição carregada quando necessária. |
| HTML dinâmico e tooltips sem saneamento uniforme | Saneamento dos pontos de inserção e CSP sem scripts externos, iframe ou eval. |
| Fórmulas JavaScript na importação e CSV potencialmente executável | Interpretador aritmético restrito e neutralização de prefixos de fórmulas no CSV. |
| Dependências antigas | ECharts 6.1.0 e SheetJS 0.20.3, com versões travadas e recursos incluídos no bundle. |
| Testes repetidos/importados e migrações recentes sem cobertura | Helpers separados, testes de todas as migrações, persistência, backup, permissões e navegador. |
| Documentação de publicação manual/Node 22 incompatível | Ambiente e CI alinhados com Node 24/pnpm 11.19.0; publicação automática documentada. |

Foram removidas 94 funções de topo sem referências, além da cópia standalone e ferramentas substituídas. As migrações antigas foram preservadas como histórico; não são código a apagar de uma instalação ativa.

## Estruturas novas

`budget_ev_typologies`, `budget_ev_targets`, `budget_strategic_targets`, `budget_hidden_estimates`, `budget_approval_works`, `budget_approval_weeks`, `budget_approval_snapshots`. O catálogo passa de 54 para 61 entidades. O painel de acompanhamento SAP e os cards de SIC mantêm seus registros e fluxos próprios, ambos protegidos pelo módulo Orçamento; não foi criado vínculo automático por nomes ou códigos ambíguos.

## Evidências e limites

Validações executadas: análise estática, suíte SQL/adaptador com PGlite, build, testes no Edge com backend simulado e auditoria de dependências de produção. Os testes verificam recarga de SIC, acesso de analista a Verbas quando autorizado, bloqueio de edição em consulta e remoção do endpoint público antigo. Não equivalem a uma certificação de ausência de defeitos nem ao ensaio com credenciais reais de cada usuário.

Backups são descritos conforme a implementação: restauração de registros de negócio, arquivos/Auth separados, gatilho diário por acesso. Foi criado snapshot privado antes da implantação. As migrações aditivas e a compatibilidade foram aplicadas no Supabase, com conferência da preservação dos registros existentes e da leitura do novo catálogo. O painel SIC foi transferido do HTML antigo para as tabelas privadas. A ausência de acesso anônimo às tabelas novas e aos helpers restritos foi verificada.

O advisor de execução autenticada de `SECURITY DEFINER` pode continuar apontando RPCs intencionais. A proteção contra senhas vazadas é uma configuração do serviço Auth; verificar disponibilidade do plano antes de ativá-la.

O advisor de desempenho ainda indica 65 chaves estrangeiras sem índice (principalmente autoria), 86 índices sem uso observado e uma avaliação de Auth por linha na política de inserção de anexos. Esses avisos não comprovam lentidão no fluxo atual: não foram criados ou removidos índices em massa sem medir as consultas. A política de anexos mantém sua verificação de identidade; a avaliação por linha permanece como oportunidade de otimização. Referências: [chaves estrangeiras](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys), [Auth por linha](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan), [índices sem uso](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

Referências: [correção ECharts](https://github.com/advisories/GHSA-fgmj-fm8m-jvvx), [migração ECharts 6](https://echarts.apache.org/handbook/en/basics/release-note/v6-upgrade-guide/), [distribuição oficial SheetJS](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/), [Storage privado](https://supabase.com/docs/guides/storage/buckets/fundamentals), [advisor de RPC anônima](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).
