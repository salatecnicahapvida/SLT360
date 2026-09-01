# SLT 360 - Guia de testes, Netlify e Supabase

## 1. Teste de usuários no SLT 360

1. Abra `index.html`.
2. Entre com um usuário Admin já existente.
3. Acesse `Configuração`.
4. Em `Equipe e perfis globais`, cadastre:
   - Nome.
   - E-mail.
   - Senha provisória.
   - Perfil.
   - Módulos liberados.
   - Mantenha marcada a opção `Exigir troca de senha no primeiro acesso`.
5. Saia do sistema.
6. Entre com o e-mail criado e a senha provisória.
7. O sistema deve bloquear a navegação e abrir a tela de troca de senha.
8. Informe a senha provisória, cadastre a senha definitiva e entre.
9. Confirme se o usuário visualiza apenas os módulos liberados.

## 2. Regras implantadas para os testes

- Cada usuário tem `perfil`, `módulos liberados` e `status`.
- A senha provisória exige troca no primeiro acesso.
- Enquanto a senha não for trocada, o menu fica bloqueado.
- O menu superior, menu lateral e cards da home respeitam os módulos liberados.
- O cadastro local é adequado para piloto interno; para produção multiusuário, migrar autenticação e persistência para Supabase.

Perfis operacionais disponíveis:

- `Analista`: acesso operacional amplo, sem Controle de Verbas e sem Configuração.
- `Analista de Orçamento`: acesso somente ao Orçamento 360.
- `Analista de Projetos`: acesso somente ao Projetos 360.

Usuários de teste em ambiente limpo:

| Usuário | E-mail | Senha | Perfil |
|---|---|---|---|
| Analista de Orçamento | `analista.orcamento@hapvida.com.br` | `orcamento360` | Analista de Orçamento |
| Analista de Projetos | `analista.projetos@hapvida.com.br` | `projetos360` | Analista de Projetos |

## 3. Deploy no Netlify

### Opção A - Deploy manual por pasta

1. Rode no terminal, dentro da pasta do SLT 360:

```bash
node build-netlify-dist.js
```

2. Entre em `https://app.netlify.com/drop`.
3. Arraste a pasta `dist`.
4. Abra a URL `netlify.app` gerada.
5. Teste login, módulos e aba `SICs > Aprovação`.

### Opção B - Deploy conectado ao Git

1. Suba a pasta do projeto para um repositório Git.
2. No Netlify, escolha `Add new site` e conecte o repositório.
3. Configure:
   - Build command: `node build-netlify-dist.js`
   - Publish directory: `dist`
4. Faça o deploy.

O arquivo `netlify.toml` já contém essa configuração.

## 4. Preparação do Supabase

1. Crie um projeto no Supabase.
2. Em `Authentication`, habilite login por e-mail/senha.
3. Em `Project Settings > API Keys`, copie:
   - Project URL.
   - Publishable key ou `anon` key.
4. Não coloque `service_role` ou secret key no navegador.
5. Crie uma tabela de perfis para guardar permissões do SLT 360.

Modelo inicial de tabela:

```sql
create table if not exists public.slt360_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  perfil text not null default 'Analista',
  access_modules text[] not null default array['works'],
  must_change_password boolean not null default true,
  status text not null default 'Ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.slt360_profiles enable row level security;
```

## 5. Próxima etapa recomendada para produção

Para produção, o cadastro de usuários deve sair do `localStorage` e ir para:

- `auth.users` do Supabase para e-mail/senha.
- `public.slt360_profiles` para perfil, módulos liberados e status.
- Netlify Function para criação administrativa de usuários, porque a criação com senha provisória usando chave de serviço não pode rodar no navegador.

Fluxo futuro recomendado:

1. Admin cria usuário no SLT 360.
2. Netlify Function chama `supabase.auth.admin.createUser`.
3. A função grava o perfil em `slt360_profiles`.
4. Usuário entra com senha provisória.
5. App força troca de senha.
6. App lê `slt360_profiles` e monta o menu conforme permissões.
