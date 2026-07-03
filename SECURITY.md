# Security Policy

## Supported Versions

O projeto acompanha a branch principal e as versoes instaladas em `package-lock.json`.

## Reporting a Vulnerability

Reporte vulnerabilidades de forma privada ao mantenedor do projeto. Inclua:

- descricao do impacto;
- passos de reproducao;
- arquivos, endpoints ou migrations relacionadas;
- sugestao de mitigacao, se houver.

Nao publique detalhes exploraveis antes de uma correcao estar disponivel.

## Baseline de seguranca

- Secrets devem ficar somente em variaveis de ambiente.
- Nunca use service role key no cliente.
- Migrations Supabase devem manter RLS e policies explicitas.
- Mudancas em regras financeiras devem passar por `npm run typecheck`, `npm run lint` e `npm run build`.
