# ADR 001 — Banco modular relacional

**Status:** aprovado e implementado em 31/08/2026

## Contexto e decisão

O piloto armazenava toda a operação em um único documento JSON. Isso permitiu recuperar o legado com segurança, mas fazia uma alteração em qualquer módulo concorrer com todas as demais alterações. Também dificultava vínculos, pesquisa, permissões e auditoria por registro.

O SLT360 passa a usar um monólito modular no PostgreSQL do Supabase. Projetos, Orçamento, Manutenção, Engenharia Clínica e Controle de Verbas possuem tabelas físicas independentes. Unidades, fornecedores, sprints, acessos e auditoria formam o núcleo compartilhado. Essa abordagem mantém uma transação única para fluxos que atravessam módulos, sem criar vários serviços e bancos antes de existir essa necessidade operacional.

Há 54 tabelas de negócio. Os campos de identidade, vínculo, fase, data e valor são colunas tipadas. A coluna `extra` guarda somente extensões legadas ainda não promovidas a campos oficiais; ela não substitui as colunas principais. Linhas de EV, versões, eventos de OS e itens de SIC são registros filhos com chaves estrangeiras.

## Integridade, concorrência e segurança

- Cada registro possui sua própria revisão. Uma alteração em Manutenção não conflita com uma alteração independente em Orçamento.
- Um lote relacionado é atômico: ou todas as linhas são gravadas, ou nenhuma é.
- Uma chave idempotente impede a repetição acidental da mesma operação.
- Chaves estrangeiras preservam os vínculos entre obra, demanda, contrato, fundo, unidade, ativo e seus registros filhos.
- Todas as tabelas têm RLS. A autorização é conferida no servidor por módulo e por operação.
- O aplicativo não recebe permissão direta de escrita nas tabelas. A função de gravação valida a lista de entidades, a revisão e o tamanho do lote.
- O histórico registra autor, módulo, tabela, registro, antes e depois. Não pode ser alterado pelo aplicativo.
- O snapshot anterior permanece privado para rollback e rastreabilidade, sem continuar como base operacional.

## Alternativas consideradas

Manter um JSON por módulo reduziria o conflito global, mas ainda deixaria concorrência e validação no nível do módulo. Criar um banco ou serviço por módulo aumentaria custos, operação e risco de inconsistência sem benefício proporcional para o volume atual. O monólito modular oferece a separação necessária e permite extrair um módulo no futuro caso volume ou governança justifiquem.

## Consequências

Novos campos oficiais devem ser adicionados ao catálogo e à migração. Relatórios podem consultar colunas e índices, sem interpretar documentos completos. A tela atual continua funcionando por meio de um adaptador que monta o formato esperado pelo legado, enquanto cada gravação envia somente as entidades alteradas.

O módulo de Engenharia Clínica começa com 306 OS históricas e uma tabela própria de ativos. A carga não possuía um cadastro mestre de equipamentos; novos equipamentos passam a ser cadastrados e vinculados automaticamente quando uma OS clínica é criada ou editada.

Referências de implementação: [tabelas](https://supabase.com/docs/guides/database/tables), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [funções](https://supabase.com/docs/guides/database/functions) e [migrações](https://supabase.com/docs/guides/local-development/database-migrations) do Supabase.
