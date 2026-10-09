# PROGRESS — Crown of Ages

> Réplica de RTS estilo Age of Empires IV (mecânicas, HUD, visual 3D), 100% original em arte/áudio/nome.

## Estado atual: MARCO JOGÁVEL PRONTO (prioridade do usuário) — tag v0.2

### Evidências (produção https://crown-of-ages.pages.dev)

- [x] CI verde na main (run mais recente: `verify` + `e2e-local` success).
- [x] Deploy wrangler pages no ar; e2e **12/12 contra a URL de produção**.
- [x] `tests/e2e/milestone.spec.ts`: **loop completo ponta a ponta** via menu +
      `window.__game`: menu → partida → aldeões coletando os 4 recursos → casa
      (+pop) e fazendas → idade 2 por landmark (council-hall) → quartel + 4
      lanceiros → combate (dano no TC/ unidades do bot) → vitória por destruição
      + tela de vitória, **0 erros de console**.
- [x] 133 testes unitários + lint + typecheck + build verdes.

### Bugs corrigidos nesta rodada (integração Lead)

1. Off-by-one na era dos landmarks (dataset: `age` = era de construção; concedida = +1).
2. Semântica de vitória: humano sem landmark = derrota; eliminar bot = vitória.
3. Perseguição do combate travava em terreno bloqueado → re-path A*.
4. **Empate float na fronteira de alcance** (unidades nunca atacavam) → snap final.
5. Unidades treinadas nasciam sem `sight` → piso de aquisição (10).
6. Unidades em tile bloqueado travavam para sempre → `unstickUnits` no tick.
7. `attackMove` não consome a ordem ao chegar (ataca o que aparecer).
8. e2e local batendo em servidor alheio na porta 4173 → porta própria 4174.

### Próximo (fases restantes da missão)

- [ ] Bots (build order, counter, ataque) — fase 7.
- [ ] Relíquias, locais sagrados, comércio — fase 6.
- [ ] Tecnologias (ferraria/universidade/mosteiro) — fase 4 restante.
- [ ] Muralhas, portões, torres, postos, unidades sobre muralha — fase 3.
- [ ] French completo/unidades únicas na pratica — fase 5.
- [ ] Áudio, 60fps/200 unidades, fidelidade fina — fase 9.
- [ ] Críticos independentes (fidelidade HUD + balanceamento) por fase.


- Correção do usuário (sessão atual): **Haiku 5.5 EXISTE neste harness** via
  provider `opencodex`, model `Merge/anthropic-claude-haiku-5-5` (sonda de confirmação retornou `OK`).
- Política de modelo daqui em diante:
  - **Todos os subagentes** (workflow `agent()`) rodam com `{provider: "opencodex", model: "Merge/anthropic-claude-haiku-5-5"}` fixado em cada chamada.
  - O agente principal (Lead) não pode selecionar o próprio modelo nesta sessão
    (roda `step-5-preview-free`); divergência registrada para o relatório final conforme
    instrução do usuário ("siga com o step-5-preview e registre a divergência — NÃO pare").
  - Alerta do usuário: o endpoint do step-5-preview sofre rate limit (429); em falha,
    esperar e retomar de onde parou.

### Feito na Fase 0

- [x] Scaffold: package.json, tsconfig (strict), vite, eslint, prettier, playwright, wrangler,
      CI (lint/typecheck/unit/build/e2e-local/e2e-prod).
- [x] **Bug de CI corrigido** (run 37821845979 vermelho): `strictPort` inexistente no
      webServer do Playwright + `declare global` sem `export {}` em `src/main.ts`.
      `pnpm exec tsc --noEmit` = 0 erros localmente. (pnpm 11 local exige allow de build do
      esbuild — resolvido em `pnpm-workspace.yaml` local, fora do git.)
- [x] Dataset oficial `aoe4world/data` (english+french) vendorizado em `data/aoe4/` com
      proveniência (`data/aoe4/README.upstream.md`, upstream commit b2cd3822).
- [x] `docs/SPEC.md` mestre (1066+ linhas): unidades, construções, techs, landmarks, eras,
      contadores, civilizações, §7.1 economia via dump `aoemods/attrib` (taxas de coleta,
      carga, fazenda, local sagrado, maravilha, idades, mercado), §8 HUD/câmera/paleta medidos
      em screenshots reais, §9 lacunas restantes.
- [x] Referências visuais: `docs/reference/aoe4/ss-01..10` (oficiais Steam) +
      `docs/reference/hud/` (2 partidas reais com HUD completo).
- [x] Repositório github.com/guhcostan/crown-of-ages criado e pushado.
- [x] Primeiros testes (catraca): `tests/unit/dataset-integrity.test.ts` (5 testes) e
      `tests/e2e/smoke.spec.ts`.

### Fase 0 — pronta (evidências)

- [x] Gate verde local (lint/typecheck/5 unit/build).
- [x] CI verde na main: run 37837080969 (`verify` + `e2e-local` success).
- [x] Produção: https://crown-of-ages.pages.dev (HTTP 200) — deploy wrangler pages.
- [x] e2e smoke contra produção: 1 passed, 0 erros de console.
- [x] Tag `v0.1` pushada.
- [x] Contrato de tipos: `src/sim/types.ts` (costura dos builders).


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
