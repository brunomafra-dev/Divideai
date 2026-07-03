# SplitMate Engineering Audit

Data: 2026-07-03

## Escopo

Esta auditoria cobre estrutura de pastas, componentes, hooks, servicos, Supabase, tipagem, performance, seguranca, dependencias, scripts, CI e documentacao. Nenhuma funcionalidade, regra de negocio, UX ou layout foi alterado.

## Principais achados

- O projeto usa Next.js App Router em `src/app`, componentes compartilhados em `src/components`, UI baseada em Radix/shadcn em `src/components/ui`, regras auxiliares em `src/lib` e migrations Supabase em `supabase/migrations`.
- Havia ausencia de CI, Dependabot, CodeQL, Prettier, `.editorconfig`, `.gitattributes`, LICENSE e documentos comunitarios.
- `npm run lint` estava quebrado por depender de `next lint`; a linha atual do Next usa ESLint CLI.
- `package.json` usava `name: template` e `next: latest`, reduzindo rastreabilidade e determinismo de builds.
- `next.config.ts` ignorava erros de TypeScript durante build, o que enfraquecia o gate de qualidade.
- `tsconfig.json` estava com `allowJs: true`, apesar do codigo ser TypeScript; havia um `src/lib/supabase.js` duplicado e nao referenciado.
- A base ainda tem varios usos de `any`, especialmente em paginas grandes e no auditor de seguranca.
- Existem arquivos grandes que misturam UI, queries, estado e regras de dominio.
- README e alguns comentarios tinham sinais de texto corrompido por encoding.
- `npm audit fix` seguro reduziu vulnerabilidades transitivas de 13 para 2 moderadas; as restantes apontam para `postcss` transitivo do Next e o npm sugere `--force` com downgrade quebrante para `next@9.3.3`, portanto nao foi aplicado.

## Arquitetura atual

- `src/app`: rotas App Router e muitos componentes de pagina client-side.
- `src/components`: componentes transversais, providers, nav, marca, componentes de dominio e UI.
- `src/hooks`: hooks pequenos (`use-premium`, `use-mobile`, `use-toast`).
- `src/lib`: dominio financeiro, Supabase, perfis, convites, auditorias, dinheiro, saldos e regras auxiliares.
- `src/types`: tipos de dominio legados e ainda superficiais.
- `supabase/migrations`: schema, RLS, policies e hardening financeiro.
- `android`: projeto Capacitor Android.

## Oportunidades para futuras sprints

- Quebrar `src/app/group/[id]/client-page.tsx` em componentes, hooks e services por responsabilidade.
- Quebrar `src/app/payments/page.tsx` em camada de dados, calculos e apresentacao.
- Consolidar rotas duplicadas/legadas entre `group`, `groups`, `grupo`, `register` e `signup`.
- Criar tipos Supabase gerados e substituir casts `any` por `Database` types.
- Mover queries Supabase repetidas para services tipados por dominio.
- Separar regras financeiras de componentes React em modulos testaveis.
- Adicionar testes unitarios para `balance`, `debt-simplifier`, `transaction-splits`, `money` e auditoria financeira.
- Adicionar testes de integracao para fluxos criticos de grupo, despesa, pagamentos e convites.
- Revisar dependencias visuais nao usadas antes de remover, validando com bundle analyzer.
- Padronizar encoding e reformatar arquivos gradualmente com Prettier em PR dedicado.

## Supabase

- RLS esta habilitado nas tabelas principais nas migrations.
- Existem policies para grupos, participantes, transacoes, pagamentos, perfis, notificacoes e lembretes.
- Ha hardening financeiro para transacoes, splits e pagamentos.
- Risco: migration inicial concede grants amplos para `anon`; RLS mitiga parte disso, mas a postura deve ser revisada tabela a tabela.
- Risco: `invite_tokens_select_all` permite leitura ampla de convites conforme migration inicial; revisar necessidade e expiracao.
- Risco: functions `security definer` devem manter `search_path` controlado e revisao de parametros.
- Nao foram encontradas migrations de buckets/storage; se storage for usado futuramente, criar policies explicitas.
- Nao ha service role key exposta no codigo; manter essa chave fora de variaveis `NEXT_PUBLIC_*`.

## Performance

- O app usa varios Client Components por necessidade de interacao e Supabase client-side.
- Ha memoizacao em alguns fluxos grandes, mas componentes longos ainda tendem a renderizar muito.
- Imagens internas de marca/avatar ainda usam `<img>` em alguns pontos; trocar para `next/image` em sprint visual/performance dedicada.
- Fontes usam `next/font` no layout, mas tambem existem imports `@fontsource`; revisar se todos sao realmente necessarios.
- Recomenda-se rodar bundle analyzer em sprint especifica antes de remover dependencias.
- O lint atual passa sem erros, mas reporta warnings de `any`, dependencias de hooks, regras novas do React Compiler e uso pontual de `<img>`.

## Produto

- O dominio ja contempla grupos, participantes manuais, usuarios autenticados, pagamentos e simplificacao de dividas.
- Para evoluir Pix, notificacoes e convites, vale criar uma camada clara de dominio financeiro e services por contexto.
- Para multiplos grupos em escala, consolidar queries e cache client-side reduziria acoplamento das telas.
- Regras de integridade financeira devem continuar protegidas tambem no banco, nao apenas na UI.
