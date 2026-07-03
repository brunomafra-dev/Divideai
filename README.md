# SplitMate

App mobile-first para dividir despesas em grupo com autenticacao, participantes, saldos, pagamentos e sugestao de acertos.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Radix UI / shadcn-style components
- Supabase Auth, Database, RLS e migrations
- Capacitor Android

## Estrutura

```txt
src/
  app/                 Rotas do Next.js App Router
  components/          Componentes compartilhados e UI
  context/             Providers de contexto
  hooks/               Hooks reutilizaveis
  lib/                 Dominio, Supabase, calculos e services auxiliares
  types/               Tipos compartilhados
supabase/
  migrations/          Schema, RLS, policies e hardening financeiro
android/               Projeto Capacitor Android
public/                Assets publicos, logos e APK
docs/                  Documentacao tecnica
```

## Setup local

Requisitos:

- Node.js 20.9 ou superior
- npm 10 ou superior

Instale dependencias:

```bash
npm ci
```

Crie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Rode o app:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run dev:turbo
npm run lint
npm run typecheck
npm run build
npm run check
npm run format
npm run format:check
npm run build:capacitor
npm run start
```

## Qualidade

O gate local recomendado antes de abrir PR e:

```bash
npm run check
```

O CI executa:

1. instalacao com `npm ci`
2. lint
3. typecheck
4. build

## Supabase

As migrations em `supabase/migrations` documentam schema, RLS, policies e regras de integridade financeira.

Variaveis publicas esperadas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GA_ID` opcional
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` opcional
- `NEXT_PUBLIC_ENABLE_CLIENT_SECURITY_AUDIT` opcional

Nunca exponha service role keys em variaveis `NEXT_PUBLIC_*`.

## Mobile

O projeto inclui estrutura Capacitor Android em `android/`.

Build web exportavel para Capacitor:

```bash
npm run build:capacitor
```

## Documentacao tecnica

- [Auditoria de engenharia](docs/ENGINEERING_AUDIT.md)
- [Politica de seguranca](SECURITY.md)
- [Guia de contribuicao](CONTRIBUTING.md)
- [Codigo de conduta](CODE_OF_CONDUCT.md)

## Licenca

MIT. Consulte [LICENSE](LICENSE).
