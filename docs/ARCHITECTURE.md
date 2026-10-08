# ARCHITECTURE — Crown of Ages

Documento de coordenação. Define fronteiras de módulo, contratos e regras para que **builders
paralelos nunca colidam em arquivos** e para que os críticos tenham critério objetivo.

## 1. Stack

- TypeScript estrito (ver `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`)
- Vite 7 (build), Vitest 3 (unit), Playwright (e2e)
- three.js 0.186 (render WebGL2 com `InstancedMesh` por tipo de unidade)
- Deploy: Cloudflare Pages (`wrangler pages deploy dist --project-name crown-of-ages`)
- CI: `.github/workflows/ci.yml` (lint, typecheck, unit, build, e2e-local, e2e-prod opcional)

Aliases: `@sim/*` → `src/sim/*`, `@render/*` → `src/render/*`, `@game/*` → `src/game/*`,
`@ui/*` → `src/ui/*`, `@tests/*` → `tests/*`.

## 2. Módulos e fronteiras

```
src/
  sim/      SIMULACAO DETERMINISTICA. TypeScript puro. PROIBIDO importar three, DOM, Date, Math.random.
            Roda headless em Node (vitest e CLI). Exporta: createMatch, stepTick, applyCommand, serialize.
  render/   RENDER 3D. three.js. Le estado da sim via interface WorldView. Nunca muta a sim.
  game/     COLA: input (mouse/teclado), camera controls, selecao, fila de comandos, sincronismo
            sim<->render, window.__game. Importa sim + render.
  ui/       HUD em DOM overlay (HTML/CSS sobre o canvas): painel de recursos, command card, minimapa,
            info de selecao, fila de producao, menu inicial, tela de vitoria. Le estado da sim.
  main.ts   bootstrap do browser.
```

Regras de dependência: `sim` depende de nada. `render` depende de `sim` (só tipos/leitura). `game`
depende de `sim` + `render`. `ui` depende de tipos de `sim` (só leitura). Nada em `render/ui/game`
pode escrever no estado da sim: comandos entram por `applyCommand(world, cmd, tick)`.

## 3. Determinismo

- Tick fixo de simulação: **10 Hz** (100 ms por tick). Render interpola entre `prevWorld` e `world`.
- Estado do mundo é JSON-serializável (números, strings, arrays, `Map` **não** — usar objetos/arrays).
- Semente: RNG `mulberry32`/`splitmix32` em `src/sim/rng.ts`, uma instância por partida; toda
  aleatoriedade (mapa, spawns, dano) sai do RNG da partida.
- `serialize(world)` → JSON estável (chaves ordenadas) usado em testes de determinismo:
  mesma seed + mesmos comandos por tick ⇒ mesmo JSON ⇒ mesmo hash SHA-256.
- Teste de determinismo canônico: `tests/unit/determinism.test.ts` compara hashes de 2 execuções.

## 4. Contrato `window.__game`

```ts
interface GameApi {
  version: string;            // semver do contrato
  newMatch(config: MatchConfig): MatchHandle;
  tick(n?: number): void;     // avanca N ticks deterministicos (testes/e2e)
  send(command: Command): void; // enfileira comando no tick atual
  getState(): WorldSnapshot;  // snapshot serializavel do mundo
  getSelection(): number[];   // ids de entidades selecionadas
  stats(): { fps: number; entities: number; ticks: number };
  headless(): boolean;        // true quando rodando em Node (vitest/CLI)
}
```

`MatchConfig`: `{ seed: number; civ: "english" | "french"; map: string; size: ...; bots: {...}; victory: ...; gameSpeed }`.
`Command`: `{ tick: number; type: "move" | "attackMove" | "stop" | "hold" | "build" | "train" | "setRally" | "garrison" | "ungarrison" | "repair" | "gather" | "attack"; unitIds: number[]; x?: number; z?: number; entityId?: number; queue?: boolean }`.
E2E usa **somente** `window.__game` + DOM do HUD. Sem cliques internos de engine.

## 5. Modelo de dados da simulação (resumo)

- `World`: `{ tick, map, resources[], entities[], players[], rngState, ... }` tudo plain-object.
- Entidades: unidade, construção, recurso (árvore/mina/ovelha/etc.), projétil, item no chão.
- Componentes por campo fixo (ECS-lite): `kind`, `owner`, `pos`, `hp`, `path`, `orders[]`, `stats`,
  `carrying`, `producing`, `garrison[]`, `targetId`.
- Fila de ordens: array de ordens por entidade; `queue: true` adiciona ao fim; sem `queue` substitui.
- Pathfinding: A* em grade + fluxo local (steering) para destinos; custo por terreno (floresta,
  água intransponível); recalculado quando bloqueado. Grid cacheado por mapa.

## 6. Render (three.js)

- Terreno: `PlaneGeometry` com altura do heightmap (vertex colors por bioma).
- Unidades: **um `InstancedMesh` por tipo**, matriz por entidade (posição, rotação Y, escala).
- Construções: instancing por tipo; fantasmas de construção com material translúcido.
- Fog of war: textura de visão (0=não explorado, 1=explorado, 2=visível) atualizada por jogador,
  aplicada via overlay no terreno/mínima escurecida de entidades.
- Minimapa: canvas 2D independente, desenha terreno/entidades/visão.
- Budget: **60 fps com 200 unidades em tela** (medido por `window.__game.stats().fps` em e2e).

## 7. HUD (DOM)

Layout fiel a `docs/spec-parts/04-hud.md` (preencher após Fase 0). Regiões obrigatórias:
recursos topo-esquerda (com aldeões por recurso), command card, info de seleção + fila de produção,
minimapa, indicador de era, botão de aldeão ocioso, fila global, placar, objetivos.
Ids DOM estáveis para e2e: `data-hud="resources"`, `"command-card"`, `"selection"`,
`"production-queue"`, `"minimap"`, `"age-indicator"`, `"idle-villager"`, `"objectives"`,
`"victory-screen"`, `"menu"`.

## 8. Testes (catraca: a suíte só cresce)

- `tests/unit/**/*.test.ts`: sim pura (economia, combate, pathfinding, eras, techs, IA, vitória,
  determinismo). Vitest, ambiente node. Números confrontados com `docs/SPEC.md`.
- `tests/e2e/**/*.spec.ts`: Playwright. Dirige o jogo só por `window.__game` + DOM. Inclui
  fidelidade visual (screenshots comparados com `docs/reference/` pelos críticos).
- Proibido apagar/enfraquecer testes para ficar verde. Novo comportamento ⇒ novo teste.

## 9. Processo por fase

1. Quebrar a fase em tarefas pequenas (cada uma: objetivo, arquivos, critério de aceite, como testar).
2. Builders (subagentes `opencodex`/`anthropic-claude-haiku-5-5`) trabalham em **escopos de arquivo
   disjuntos**; cada builder só escreve nos arquivos da sua tarefa.
3. `pnpm lint && pnpm typecheck && pnpm test` ⇒ correções ⇒ commit/push ⇒ deploy wrangler.
4. E2E Playwright contra a URL de produção publicada.
5. Críticos (subagentes novos, **nunca** os builders) recebem: SPEC + critérios + URL + screenshots
   + diff — nunca o raciocínio do builder. Um critica fidelidade (layout HUD, ângulo de câmera,
   escala, paleta, legibilidade vs `docs/reference/`), outro confere números vs `docs/SPEC.md`.
6. Corrigir achados, repetir até limpo (máx. 5 rodadas por fase; não convergindo, registrar em
   `docs/PROGRESS.md` e seguir). Tag `vN`.

## 10. Performance

- Budget medido em e2e: `stats().fps >= 55` com 200 unidades em cena.
- Instancing obrigatório; nada de `Mesh` individual por unidade em jogo.
- Sim aloca pouco por tick (objetos pré-alocados onde possível); zero GC spike > 16 ms/tick.

## 11. Convenções

- PT-BR em comentários/docs e strings de UI; identificadores em inglês.
- Commits: `fase-N: descrição` (Conventional + fase). Tags: `v0.N` por fase fechada.
- `docs/PROGRESS.md` atualizado a cada rodada (fase, feito, pendente, decisões, bugs).
