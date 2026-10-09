/**
 * ages.ts — avanço de era por landmark (milestone da Fase 1).
 *
 * Regra: a era de um jogador é derivada dos edifícios concluídos (`built`) e vivos (hp > 0).
 * A era é o maior `age` entre os landmarks do jogador; sem landmark, a era é 1.
 *
 * Simplificações (documentadas):
 *  - O dataset não traz campo `landmarkAge`; usamos `BuildingDef.age` dos landmarks
 *    (`isLandmark === true`). Landmarks existem nas eras 1, 2 e 3.
 *  - A era 4 é alcançada pela Maravilha (`wonder`), que é o único item de era 4 no
 *    dataset (ver SPEC §4). A Maravilha NÃO é landmark para fins de vitória (ver victory.ts).
 *  - Custos de avanço (`AGE_COSTS`) vêm de `upgrade/dev/ages/*` (SPEC §7.1). Nesta fase
 *    são apenas dados: o avanço por clique ainda não consome recursos; quem cobra é a
 *    construção do landmark (`canBuildLandmark`).
 *
 * Determinismo: sem Date/performance/crypto/Math.random.
 */

import { BUILDINGS } from "./buildings";
import type { ResourceKind, World } from "./types";

/** Era máxima (Imperial). */
const MAX_AGE = 4;

/** Era do landmark de era 1 (padrão quando o jogador não tem landmark). */
const BASE_AGE = 1;

/** Tipo de construção que equivale ao marco da era 4 (ver cabeçalho). */
const WONDER_TYPE = "wonder";

/**
 * Custo para alcançar cada era (chave = era de destino).
 * Feudal (2): 190 s / 400 F / 200 G. Castelo (3): 220 s / 1200 F / 600 G.
 * Imperial (4): 250 s / 2400 F / 1200 G. Fonte: SPEC §7.1 (upgrade/dev/ages/*).
 */
export const AGE_COSTS: Record<number, { food: number; gold: number; time: number }> = {
  2: { food: 400, gold: 200, time: 190 },
  3: { food: 1200, gold: 600, time: 220 },
  4: { food: 2400, gold: 1200, time: 250 },
};

/** Verdadeiro se a entidade é uma construção concluída e viva do jogador. */
function isBuiltAlive(e: World["entities"][number], player: number): boolean {
  return e.kind === "building" && e.owner === player && e.built === true && e.hp > 0;
}

/**
 * Era atual do jogador, derivada dos marcos concluídos.
 *
 * ATENCAO (semantica do dataset): `BuildingDef.age` dos landmarks e a era em que o
 * landmark e CONSTRUIDO (council-hall age 1 = construido na Idade das Trevas),
 * portanto a era CONCEDIDA e `def.age + 1`. A Maravilha segue a semantica comum
 * (age 4 = era Imperial, nao concede era nova).
 */
export function playerAge(world: World, player: number): number {
  let age = BASE_AGE;
  for (const e of world.entities) {
    if (!isBuiltAlive(e, player)) continue;
    const def = BUILDINGS[e.type];
    if (!def) continue;
    if (def.isLandmark) age = Math.max(age, def.age + 1);
    else if (e.type === WONDER_TYPE) age = Math.max(age, def.age);
  }
  return Math.min(age, MAX_AGE);
}

/** Atualiza `players[p].age` para a era derivada de todos os jogadores. */
export function syncAges(world: World): void {
  for (const player of world.players) {
    player.age = playerAge(world, player.id);
  }
}

/**
 * Dois ids de landmark da civilização do jogador para a era `age + 1`, em ordem de id.
 * Retorna [] se a era for 4 (não há landmark de era 4) ou se nenhum estiver disponível.
 *
 * `def.age` dos landmarks e a era de CONSTRUÇÃO (ver playerAge): para conceder a era
 * alvo, o landmark deve ter `def.age === targetAge - 1`.
 */
export function landmarkChoices(world: World, player: number): string[] {
  const owner = world.players[player];
  if (!owner) return [];
  const targetAge = playerAge(world, player) + 1;
  if (targetAge > MAX_AGE) return [];

  const ids = Object.values(BUILDINGS)
    .filter((def) => def.isLandmark && def.civ === owner.civ && def.age === targetAge - 1)
    .map((def) => def.id)
    .sort();
  return ids.slice(0, 2);
}

/**
 * Pode construir o landmark `id` agora? Exige: landmark da civilização do jogador,
 * landmark construivel na era atual (`def.age === playerAge`), e recursos cobrindo o
 * custo integral.
 */
export function canBuildLandmark(world: World, player: number, id: string): boolean {
  const owner = world.players[player];
  const def = BUILDINGS[id];
  if (!owner || !def) return false;
  if (!def.isLandmark || def.civ !== owner.civ) return false;
  if (def.age !== playerAge(world, player)) return false;

  const res = owner.resources;
  const cost = def.cost;
  const resourceKinds: ResourceKind[] = ["food", "wood", "gold", "stone"];
  return resourceKinds.every((kind) => res[kind] >= cost[kind]);
}
