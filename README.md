# SplitMateApp

App para divisão de despesas em grupo, com Next.js, TypeScript, Supabase, autenticação e dados persistentes.

Demo ativa: https://splitmateapp.vercel.app/

## Por que esse projeto existe

Dividir contas em grupo costuma virar confusão: alguém paga mais, alguém esquece, alguém não sabe quanto deve. O SplitMateApp foi criado para organizar despesas compartilhadas de forma mais clara.

O projeto explora um fluxo full-stack com autenticação, grupos, participantes, despesas, pagamentos e simplificação de dívidas.

## Funcionalidades

- Cadastro, login e fluxo de autenticação.
- Criação e gestão de grupos.
- Participantes manuais e membros autenticados.
- Registro de despesas em grupo.
- Divisão de valores e cálculo de saldos.
- Sugestão de acertos entre participantes.
- Perfil, configurações e consentimento legal.
- Estrutura mobile-first e build Android com Capacitor.
- APK disponível em `public/apk/SplitMate.apk`.
- Migrações Supabase para segurança, auditoria e consistência financeira.

## Stack

- Next.js
- React
- TypeScript
- Supabase
- Tailwind CSS
- Radix UI
- React Hook Form
- Zod
- Capacitor Android

## Arquitetura

```txt
src/
  app/
    groups/
    group/
    payments/
    profile/
    settings/
    login/
    signup/
  components/
    group/
    debt/
    ui/
  context/
    AuthContext.tsx
  lib/
    balance.ts
    debt-simplifier.ts
    transaction-splits.ts
    financial-audit.ts
    supabase.ts
supabase/
  migrations/
public/
  apk/
```

## Decisões técnicas

- A lógica financeira fica separada em `src/lib`, para facilitar manutenção e testes futuros.
- O projeto usa migrations Supabase para evolução de políticas, auditoria e integridade financeira.
- Existem rotas e páginas duplicadas de `group`/`groups` por compatibilidade de navegação durante evolução do app.
- Capacitor permite distribuir uma versão Android além da experiência web.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Crie `.env.local` com as variáveis do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Scripts

```bash
npm run dev
npm run build
npm run build:capacitor
npm run start
```

## Aprendizados

- Apps financeiros exigem cuidado com arredondamento, auditoria e integridade.
- Autenticação e participantes manuais precisam conviver no mesmo domínio.
- Uma boa experiência mobile reduz fricção em uso social, como viagens e contas em grupo.
- Documentação clara ajuda a apresentar o valor do projeto e orientar a execução local.

## Próximos passos

- Melhorar README com prints reais da interface.
- Revisar nome do projeto no `package.json`.
- Adicionar testes automatizados para saldos, divisão e simplificação de dívidas.
- Refinar demo pública e fluxo de onboarding.
- Evoluir onboarding para grupos e convites.
