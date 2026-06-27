<div align="center">

# SplitMateApp

**App para dividir despesas em grupo com autenticação, participantes, saldos e sugestão de acertos.**

![Next.js](https://img.shields.io/badge/Next.js-111827?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-111827?style=for-the-badge&logo=typescript&logoColor=60a5fa)
![Supabase](https://img.shields.io/badge/Supabase-111827?style=for-the-badge&logo=supabase&logoColor=34d399)
![Capacitor](https://img.shields.io/badge/Capacitor-111827?style=for-the-badge&logo=capacitor&logoColor=60a5fa)

[Demo](https://splitmateapp.vercel.app/) · [Portfólio](https://www.brunomafra.website/pt)

</div>

---

## Descrição do problema

Dividir contas em grupo costuma virar ruído: alguém paga mais, alguém esquece uma despesa, alguém não sabe quanto deve e o acerto final fica confuso.

Esse problema aparece em viagens, encontros, casais, repúblicas e qualquer situação em que várias pessoas compartilham gastos ao longo do tempo.

## Solução proposta

O SplitMateApp organiza o ciclo completo da despesa compartilhada:

- cria grupos e participantes;
- registra despesas e quem pagou;
- divide valores entre participantes;
- calcula saldos pendentes;
- sugere acertos para reduzir transferências desnecessárias.

O foco é entregar uma experiência mobile-first simples o suficiente para ser usada no momento em que a despesa acontece.

## Stack utilizada

| Camada | Tecnologias |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| UI | Radix UI, React Hook Form, Zod, Lucide React |
| Dados | Supabase Auth, tabelas relacionais e migrations |
| Domínio | Cálculo de saldo, divisão, auditoria financeira e simplificação de dívidas |
| Mobile | Capacitor Android e APK em `public/apk/` |

## Arquitetura resumida

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
  logo/
android/
```

## Screenshots

| Tela | O que demonstrar |
| --- | --- |
| Dashboard / grupos | Lista de grupos e entrada rápida no fluxo |
| Despesa em grupo | Registro de valor, pagador e participantes |
| Saldos e acertos | Cálculo de pendências e sugestão de pagamentos |
| Perfil e configurações | Preferências, termos e estado de autenticação |

> As capturas devem ser adicionadas em `docs/screenshots/` quando houver uma rodada visual final da demo pública.

## Funcionalidades

- Cadastro, login e autenticação com Supabase.
- Criação e gestão de grupos.
- Participantes manuais e membros autenticados.
- Registro de despesas em grupo.
- Divisão de valores por participante.
- Cálculo de saldos pendentes.
- Sugestão de acertos entre participantes.
- Registro de pagamentos.
- Perfil, configurações e consentimento legal.
- Auditoria financeira e estrutura de segurança por migrations.
- Build Android com Capacitor.

## Roadmap

- Adicionar screenshots reais em `docs/screenshots/`.
- Adicionar testes automatizados para saldos, divisão e simplificação de dívidas.
- Refinar onboarding para grupos, convites e participantes.
- Melhorar a experiência de fechamento de acertos.
- Revisar nome do projeto no `package.json`.
- Evoluir distribuição mobile a partir do APK atual.

## Aprendizados

- Apps financeiros exigem cuidado com arredondamento, integridade e auditoria.
- Participantes manuais e usuários autenticados precisam conviver no mesmo domínio.
- Simplificar dívidas melhora muito a experiência final do usuário.
- Uma boa experiência mobile reduz fricção em uso social e compartilhado.
- Documentação clara ajuda a mostrar valor mesmo quando a demo depende de infraestrutura gratuita.

## Como executar

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

Scripts úteis:

```bash
npm run build
npm run build:capacitor
npm run start
```

## Link para Demo

https://splitmateapp.vercel.app/

## Link para Portfólio

https://www.brunomafra.website/pt
