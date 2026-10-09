/**
 * victory.ts — condições de vitória e derrota (milestone da Fase 1).
 *
 * Ordem fixa de avaliação por tick (determinismo):
 *  1. Eliminação: jogador sem unidades, sem centro da cidade (built) e sem marco => derrotado.
 *  2. Modo `landmarks` (e fallback de `sacred-sites`): jogador com era >= 2 e SEM marco
 *     concluído agora => derrotado (perdeu o landmark).
 *  3. Derrota do humano (jogador 0) => `defeat`. Todos derrotados no mesmo tick => `defeat`.
 *  4. Modo `wonder`: Maravilha concluída de um jogador => vitória imediata dele.
 *  5. Restando exatamente 1 jogador não derrotado => vitória dele.
 *
 * Simplificações (milestone; documentadas):
 *  - Locais sagrados (`sacred-sites`): NÃO implementados (SPEC §7, NAO VERIFICADO). Usamos o
 *    fallback para `landmarks`, como acordado.
 *  - Modo `wonder`: sem timer de defesa (SPEC §9, NAO VERIFICADO). Basta a Maravilha concluída.
 *  - "Marco" = landmark (`isLandmark`) ou Maravilha. A Maravilha conta como marco para não
 *    derrotar quem já chegou à era 4 por ela.
 *  - Edifício "concluído e vivo" = `built === true && hp > 0`.
 *  - Uma vez que `victory.kind !== "playing"`, nada mais é alterado (idempotente).
 *
 * Determinismo: sem Date/performance/crypto/Math.random.
 */

import { BUILDINGS } from "./buildings";
import type { Entity, VictoryId, World } from "./types";

/** Era a partir da qual o jogador precisa manter um marco para não ser derrotado. */
const LANDMARK_REQUIRED_AGE = 2;

/** Tipo de construção da Maravilha (vitória no modo wonder). */
const WONDER_TYPE = "wonder";

/** Tipo de construção do centro da cidade (sobrevivência do jogador). */
const TOWN_CENTER_TYPE = "town-center";

/** Verdadeiro se a entidade é uma construção concluída e viva do jogador. */
function isBuiltAliveOf(e: Entity, player: number): boolean {
  return e.kind === "building" && e.owner === player && e.built === true && e.hp > 0;
}

/**
 * Verdadeiro se o jogador tem algum marco concluído (landmark ou Maravilha).
 * O centro da cidade NÃO é marco (ver cabeçalho).
 */
export function hasAnyLandmark(world: World, player: number): boolean {
  return world.entities.some((e) => {
    if (!isBuiltAliveOf(e, player)) return false;
    if (e.type === WONDER_TYPE) return true;
    return BUILDINGS[e.type]?.isLandmark === true;
  });
}

/**
 * Era histórica do jogador para fins de vitória: 1 + maior era de CONSTRUÇÃO dos
 * marcos concluídos (landmarks usam a semantica do dataset: age = era de construçao,
 *logo a era concedida é age+1). A Maravilha (age 4) concede a era 4.
 */
function landmarkAgeOf(world: World, player: number): number {
  let age = 1;
  for (const e of world.entities) {
    if (!isBuiltAliveOf(e, player)) continue;
    const def = BUILDINGS[e.type];
    if (!def) continue;
    if (def.isLandmark) age = Math.max(age, def.age + 1);
    else if (e.type === WONDER_TYPE) age = Math.max(age, def.age);
  }
  return age;
}

/** Verdadeiro se o jogador tem alguma unidade viva. */
function hasLiveUnit(world: World, player: number): boolean {
  return world.entities.some((e) => e.kind === "unit" && e.owner === player && e.hp > 0);
}

/** Verdadeiro se o jogador tem centro da cidade concluído e vivo. */
function hasTownCenter(world: World, player: number): boolean {
  return world.entities.some((e) => e.type === TOWN_CENTER_TYPE && isBuiltAliveOf(e, player));
}

/** Verdadeiro se a Maravilha do jogador está concluída (built). */
function hasBuiltWonder(world: World, player: number): boolean {
  return world.entities.some((e) => e.type === WONDER_TYPE && e.owner === player && e.built === true);
}

/**
 * Avalia vitória/derrota do tick. Só altera `world.players[].defeated` e `world.victory`.
 * Chamada depois de `stepDefeat` em tick.ts (integração feita pelo Lead).
 */
export function stepVictory(world: World): void {
  if (world.victory.kind !== "playing") return;

  const mode: VictoryId = world.config.victory;
  // sacred-sites cai no fallback de landmarks (ver cabeçalho).
  const usesLandmarks = mode === "landmarks" || mode === "sacred-sites";

  // 1. Eliminação por falta de unidades, centro da cidade e marco.
  for (const player of world.players) {
    if (player.defeated) continue;
    const id = player.id;
    if (!hasLiveUnit(world, id) && !hasTownCenter(world, id) && !hasAnyLandmark(world, id)) {
      player.defeated = true;
    }
  }

  // 2. Perda do marco (era >= 2 sem landmark), somente nos modos com marcos.
  // Usa `player.age` como ela estava ANTES do sync deste tick: `syncAges` reduz a era
  // quando o marco some, então `stepVictory` precisa rodar antes de `syncAges` (ordem no
  // tick.ts, decisão do Lead). Não escrevemos `player.age` aqui para não brigar com syncAges.
  if (usesLandmarks) {
    for (const player of world.players) {
      if (player.defeated) continue;
      const id = player.id;
      const reachedAge = Math.max(player.age, landmarkAgeOf(world, id));
      if (reachedAge >= LANDMARK_REQUIRED_AGE && !hasAnyLandmark(world, id)) {
        player.defeated = true;
      }
    }
  }

  // 3. Derrota: todos derrotados no mesmo tick, ou o humano (jogador 0) derrotado.
  const allDefeated = world.players.every((p) => p.defeated);
  const human = world.players[0];
  if (allDefeated || human?.defeated === true) {
    world.victory = { kind: "defeat" };
    return;
  }

  // 4. Modo wonder: Maravilha concluída => vitória imediata (sem timer; ver cabeçalho).
  if (mode === "wonder") {
    const winner = world.players.find((p) => !p.defeated && hasBuiltWonder(world, p.id));
    if (winner) {
      world.victory = { kind: "victory", player: winner.id, reason: "wonder" };
      return;
    }
  }

  // 5. Último jogador não derrotado vence. Motivo = modo configurado na partida
  // (o fallback de sacred-sites usa a regra de landmarks, mas reporta o modo real).
  const remaining = world.players.filter((p) => !p.defeated);
  const only = remaining[0];
  if (remaining.length === 1 && only) {
    world.victory = { kind: "victory", player: only.id, reason: mode };
  }
}
