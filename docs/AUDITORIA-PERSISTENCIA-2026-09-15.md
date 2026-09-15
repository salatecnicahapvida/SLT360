# Auditoria de persistência — SLT360

Data de fechamento: 15/09/2026

## Escopo

Auditoria da persistência entre a interface do SLT360 e o Supabase, cobrindo gravação, confirmação de escrita, concorrência, relacionamentos, histórico/auditoria, anexos, RLS e os módulos Obras, Manutenção, Engenharia Clínica, Controle de Verbas, Projetos e Configurações.

## Correções aplicadas

- Escritas críticas passaram a aguardar confirmação do Supabase antes de anunciar sucesso.
- As gravações legadas que ainda utilizavam `saveState()` deixaram de ser fire-and-forget: `saveState()` agora usa `saveAndWait()` e retorna sucesso/falha somente após a confirmação do banco.
- Foi incluído teste de regressão que impede novas chamadas `saveState()` sem `await`.
- Fluxos de EV, SIC, contratos, exclusão/movimentação de demandas, conclusão de demanda e integração de verba já usam confirmação explícita.
- O valor de SIC (`valorDelta`) é persistido em `delta_amount`.
- A postagem de SIC cria versão do EV.
- O histórico técnico (`slt_core_change_log`) é espelhado no histórico global (`slt_core_history`).
- Falha de upload de anexos limpa o metadado incompleto.
- As políticas RLS de anexos foram otimizadas para avaliar `auth.uid()` uma vez por consulta.

## Integridade validada no banco de produção

As verificações abaixo retornaram zero inconsistências:

- demandas duplicadas;
- demandas sem obra;
- demandas sem sprint válida;
- SIC sem demanda ou obra;
- item de SIC sem SIC;
- linha ou versão de EV sem EV pai;
- evento de Manutenção sem OS;
- evento de Engenharia Clínica sem OS;
- verba ou movimentação financeira com vínculos inexistentes;
- acesso de módulo sem perfil;
- perfil sem usuário de autenticação;
- anexo sem usuário criador;
- alteração técnica sem espelho no histórico global.

Todas as tabelas públicas da aplicação com prefixo `slt` estão com RLS habilitado e políticas aplicadas.

## Validação automatizada

No fechamento da auditoria foram executados com sucesso:

- lint;
- testes unitários;
- teste específico contra persistência fire-and-forget;
- build de produção;
- suíte completa de testes de navegador.

O pipeline de fechamento terminou com sucesso antes da publicação do código auditado.

## Observações não bloqueantes

O linter do Supabase ainda pode apontar recomendações de endurecimento/performance que não representam perda de persistência: funções `SECURITY DEFINER` usadas como RPC e protegidas internamente por checagem de usuário/permissão, FKs sem índice dedicado em colunas pouco consultadas e índices ainda classificados como não utilizados. A proteção de senhas vazadas é uma configuração do Supabase Auth e deve ser tratada como melhoria de segurança da autenticação, não como falha de gravação dos dados do SLT360.

## Resultado

A auditoria de persistência está encerrada sem inconsistências de relacionamento detectadas e sem fluxos legados de `saveState()` executados sem confirmação do banco.
