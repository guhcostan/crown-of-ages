# PROGRESS — Crown of Ages

> Réplica de RTS estilo Age of Empires IV (mecânicas, HUD, visual 3D), 100% original em arte/áudio/nome.

## Estado atual: FASE 0 EM ANDAMENTO — pesquisa + scaffold

- Correção do usuário (sessão atual): **Haiku 5.5 EXISTE neste harness** via
  provider `opencodex`, model `Merge/anthropic-claude-haiku-5-5` (sonda de confirmação retornou `OK`).
- Política de modelo daqui em diante:
  - **Todos os subagentes** (workflow `agent()`) rodam com `{provider: "opencodex", model: "Merge/anthropic-claude-haiku-5-5"}` fixado em cada chamada.
  - O agente principal (Lead) não pode selecionar o próprio modelo nesta sessão
    (roda `step-5-preview-free`); divergência registrada para o relatório final conforme
    instrução do usuário ("siga com o step-5-preview e registre a divergência — NÃO pare").

## Bloqueios

### 1. Modelo — RESOLVIDO (ver acima)

### 2. Cloudflare — RESOLVIDO (verificado)

- Usuário informou que o wrangler já estava autenticado via OAuth no host — confirmado:
  - `npx wrangler@4 whoami` → OAuth Token, e-mail `guhcostan@gmail.com`,
    conta `a6294ef6f6ef77aec9e05f8aabb47bb0`, credenciais em
    `~/Library/Preferences/.wrangler/config/default.toml`,
    permissões incluem `pages (write)`, `workers (write)`, `workers_scripts (write)`,
    `zone (read)`, `workers_routes (write)`.
- Deploy de produção via wrangler funcionará; e2e rodará contra a URL publicada.

## infra pronta

| Item | Estado |
|---|---|
| Node / pnpm | node v26.4.0, npm 12.0.2, pnpm 11.9.0 |
| GitHub (`gh`) | autenticado como `guhcostan`, escopos `gist, read:org, repo, workflow` |
| Registro npm | acessível (wrangler 4.148.0, playwright 1.64.0, three 0.186.1) |
| Cloudflare | ver bloqueio 2 |
| git identity | Gustavo <guhcostan@gmail.com> |

## Identidade do projeto (definida com o usuário)

- Repositório: `github.com/guhcostan/crown-of-ages`
- Nome do jogo: **Crown of Ages** (original; não usar nome/logos/assets do jogo original)
- Civilizações iniciais: English + French (assimétricas, completas); demais só após "Pronto"

## Decisões

1. Parada por modelo indisponível — regra da missão + confirmação do usuário.
2. Nenhum arquivo de código/SPEC/pesquisa criado enquanto o bloqueio 1 persistir
   (usar subagentes = usar modelo substituto).
3. Nome/repo confirmados para retomada imediata.

## Bugs abertos

- nenhum (nada executado ainda).

## Plano de retomada (Fase 0)

1. Criar repo `crown-of-ages` (gh), scaffold Vite+TS+Three.js, wrangler, CI (lint/typecheck/unit/e2e).
2. Pesquisa à parte (wikis/patch notes) → `docs/SPEC.md` (unidades, custos, HP, ataque, armadura,
   alcance, tempos, techs, landmarks, bônus de civilização, layout do HUD, atalhos).
3. Seguir fases 1–9 com catraca de testes, críticos independentes, tags vN.
