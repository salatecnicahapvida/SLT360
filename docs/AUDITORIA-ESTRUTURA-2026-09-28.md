# Auditoria estrutural — 28/09/2026

## Objetivo

Reduzir código e automações históricas sem alterar regras de negócio, permissões, cálculos, persistência ou fluxos atualmente usados no SLT360.

A auditoria tomou `src/boot-entry.js` como entrada oficial do build, seguiu o grafo de imports — inclusive imports dinâmicos — e conferiu referências no repositório. Arquivos de migração do Supabase foram tratados como histórico imutável de implantação, não como código descartável.

## Removido

### Aplicadores históricos de patch

Foram removidos três workflows de aplicação automática/manual de correções textuais já incorporadas à fonte:

- `.github/workflows/apply-fast-module-preview.yml`
- `.github/workflows/apply-kanban-column-sort.yml`
- `.github/workflows/apply-validation-flow-intelligence.yml`

E seus scripts auxiliares:

- `scripts/patch-fast-module-preview.mjs`
- `scripts/patch-kanban-column-sort.mjs`
- `scripts/patch-kanban-column-sort-accessibility.mjs`
- `scripts/patch-validation-flow-intelligence.mjs`

Também foram removidos os arquivos-gatilho históricos:

- `docs/deploy-fast-preview-trigger.txt`
- `docs/deploy-kanban-sort-trigger.txt`
- `docs/deploy-validation-flow-trigger.txt`

Esses artefatos não participavam do `package.json`, do build oficial nem do fluxo normal de validação. Mantê-los permitia reexecutar transformações antigas sobre uma fonte que já incorporou essas mudanças.

## Item investigado e preservado

`src/sic-dashboard.js`, `src/sic-dashboard.css` e `src/sic-dashboard.html` foram inicialmente identificados como candidatos à limpeza por não aparecerem entre os imports estáticos do topo de `app.js`. A validação de build mostrou que `app.js` carrega `sic-dashboard.js` dinamicamente em `mountSicApprovalView()` para o host `#sicApprovalDashboard`.

Os três arquivos foram, portanto, preservados integralmente. Nenhuma regra, cálculo ou comportamento desse painel foi alterado. Esse achado reforçou o critério conservador da auditoria: ausência em busca simples não é suficiente para exclusão; o build completo é parte obrigatória da validação.

## Mantido de propósito

Não foram removidos nem alterados:

- regras de negócio de `src/app.js`;
- fluxo atual de persistência e conflitos (`boot-entry`, `boot`, `module-store`, `lazy-module-store`, `persistence-coordinator` e `cloud-retry`);
- regras atuais de EV, SIC, Kanban, validação, aprovação da Diretoria, conclusão de demandas e Controle de Verbas;
- painel integrado `sic-dashboard.*` e a visão dedicada `sic-approvals.*`;
- permissões e RLS do Supabase;
- aliases de navegação e compatibilidade ainda presentes no código ativo;
- compatibilidade de sessão de autenticação entre `sessionStorage` e `localStorage` no boot;
- migrações antigas do Supabase, pois representam a sequência histórica necessária para reconstrução e auditoria do banco;
- testes de negócio existentes.

## Ajustes documentais e de teste

- O `README.md` foi alinhado à arquitetura real: entrada por `src/boot-entry.js`, painel integrado por `sic-dashboard.*`, visão dedicada por `sic-approvals.*` e fila por `sic-director-queue.js`.
- O teste de arquitetura continua cobrindo `sic-dashboard.js` como fonte operacional.
- Foi incluída uma verificação estrutural para impedir a reintrodução dos aplicadores históricos de patch removidos.

## Critério de segurança da limpeza

Um item só pode ser removido quando atende simultaneamente aos seguintes critérios:

1. não faz parte do grafo de execução do build atual, incluindo imports dinâmicos; ou é apenas um aplicador histórico de alteração já incorporada;
2. não é referenciado por uma regra atual de negócio;
3. sua remoção não muda dados, cálculos, permissões, estados ou transições atuais;
4. não é uma migração de banco nem mecanismo de compatibilidade ainda consumido pelo runtime;
5. lint, testes, build e testes de navegador continuam aprovados após a alteração.

## Resultado esperado

A aplicação mantém o mesmo comportamento funcional, com menos caminhos históricos capazes de confundir manutenção futura ou reaplicar regras antigas sobre a fonte atual.
