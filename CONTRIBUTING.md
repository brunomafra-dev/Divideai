# Contributing

Obrigado por contribuir com o SplitMate.

## Setup local

1. Use Node.js 20.9 ou superior.
2. Instale as dependencias com `npm ci`.
3. Crie `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Rode `npm run dev`.

## Qualidade

Antes de abrir uma alteracao, rode:

```bash
npm run lint
npm run typecheck
npm run build
```

Use `npm run format` para aplicar Prettier e `npm run format:check` para validar formatacao.

## Diretrizes

- Nao altere UX, layout ou regras financeiras junto com refatoracoes.
- Mantenha regras de dominio financeiro fora de componentes quando criar codigo novo.
- Evite `any`; prefira tipos explicitos e modelos compartilhados.
- Nao versionar secrets, dumps locais, builds Android ou artefatos gerados.
