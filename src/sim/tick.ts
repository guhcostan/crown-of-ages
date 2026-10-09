/**
 * tick.ts — avanço de 1 tick lógico (10 Hz) da simulação.
 *
 * Fases do milestone jogável: construções, treino, economia (coleta/entrega/fazendas),
 * combate (aquisição, cooldowns, dano, perseguição, mortes), movimento, visibilidade
 * (fog of war), derrota, vitória e sincronismo de eras.
 * Tudo determinístico: sem Date/performance/crypto/Math.random no estado.
 */

import { buildingDef } from "./buildings";
import { stepCombat } from "./combat";
import { FARM_FOOD, stepEconomy } from "./economy";
import { syncAges } from "./ages";
import { stepProduction } from "./train";
import { stepVictory } from "./victory";
import { revealAround } from "./world";
import { TICK_SECONDS } from "./types";
import type { Entity, World } from "./types";

/** Distância abaixo da qual um waypoint é considerado alcançado (unidades de mundo). */
const ARRIVE_EPS = 0.05;

/** Distância (unidades de mundo) em que o aldeão alcança o fantasma para construir. */
const BUILD_RANGE = 1.2;

/**
 * Avança a construção: cada aldeão com `constructingId` perto do fantasma soma progresso.
 * Sem construtor, o fantasma fica parado (sem decaimento nesta fase). Ao completar:
 * built=true, hp = maxHp e a população provida pela construção entra no popCap do dono.
 */
function stepBuildings(world: World): void {
  for (const site of world.entities) {
    if (site.kind !== "building" || site.built) continue;
    const max = site.buildProgressMax ?? 0;
    if (max <= 0) {
      completeBuilding(world, site);
      continue;
    }
    const builders = countBuilders(world, site);
    if (builders === 0) continue;
    // Progresso proporcional ao número de construtores (cada um soma 1 tick de tempo).
    site.buildProgress = (site.buildProgress ?? 0) + TICK_SECONDS * builders;
    if (site.buildProgress >= max) {
      site.buildProgress = max;
      completeBuilding(world, site);
    }
  }
}

/** Aldeões que estão construindo `site` e perto dele (alcance de 1.2 unidades). */
function countBuilders(world: World, site: Entity): number {
  let n = 0;
  for (const u of world.entities) {
    if (u.kind !== "unit" || u.constructingId !== site.id) continue;
    const dx = u.x - site.x;
    const dz = u.z - site.z;
    if (dx * dx + dz * dz <= BUILD_RANGE * BUILD_RANGE) n++;
  }
  return n;
}

/** Conclui a construção: marca built, enche o hp e aplica a população provida. */
function completeBuilding(world: World, site: Entity): void {
  site.built = true;
  site.hp = site.maxHp;
  for (const u of world.entities) {
    if (u.constructingId === site.id) u.constructingId = undefined;
  }
  const pop = site.popProvided ?? 0;
  const player = world.players[site.owner];
  if (pop > 0 && player) player.popCap += pop;
  // Fazenda: `maxHp` vira o pool de comida restante (FARM_FOOD = 120) e `hp` segue como
  // vida (300). Decisão de simplificação do milestone: não há campo dedicado em types.ts.
  if (site.type === "farm") {
    site.maxHp = FARM_FOOD;
    site.hp = buildingDef("farm").hp;
  }
}

/** Movimento: anda ao longo de `path` a `movementSpeed` (unidades/s) e atualiza facing. */
function stepMovement(world: World): void {
  for (const e of world.entities) {
    if (e.kind !== "unit") continue;
    const path = e.path;
    if (!path || path.length === 0) continue;
    const speed = e.movementSpeed ?? 0;
    let budget = speed * TICK_SECONDS;
    let index = e.pathIndex ?? 0;

    while (budget > 0 && index < path.length) {
      const target = path[index];
      if (!target) break;
      const dx = target.x - e.x;
      const dz = target.z - e.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= ARRIVE_EPS) {
        index++;
        continue;
      }
      // Orientação aponta para o próximo waypoint.
      e.facing = Math.atan2(dx, dz);
      if (dist <= budget) {
        e.x = target.x;
        e.z = target.z;
        budget -= dist;
        index++;
      } else {
        const k = budget / dist;
        e.x += dx * k;
        e.z += dz * k;
        budget = 0;
      }
    }

    e.pathIndex = index;
    if (index >= path.length) {
      // Chegou ao fim do caminho.
      e.path = [];
      e.pathIndex = 0;
      advanceOrders(e);
    }
    e.y = heightOf(world, e);
  }
}

/**
 * Ao concluir o caminho, remove a ordem de movimento atual da fila (se houver).
 * `attackMove` NAO e removida aqui: ela permanece ativa para que o combate ataque
 * o que aparecer no destino (semantica de atacar-mover). Ela acaba quando o
 * jogador manda outra ordem ou quando a ordem `attack` (alvo fixo) morre.
 */
function advanceOrders(e: Entity): void {
  const orders = e.orders;
  if (!orders || orders.length === 0) return;
  const head = orders[0];
  if (head && head.type === "move") {
    orders.shift();
  }
}

/** Altura do terreno sob a entidade (cache em `y`). */
function heightOf(world: World, e: Entity): number {
  const tile = world.map.tile;
  const tx = Math.floor(e.x / tile);
  const tz = Math.floor(e.z / tile);
  if (tx < 0 || tz < 0 || tx >= world.map.w || tz >= world.map.h) return 0;
  return (world.map.heights[tz * world.map.w + tx] ?? 0) * world.map.maxHeight;
}

/**
 * Nota: o cooldown de ataque é decrementado dentro de `stepCombat` (fonte única),
 * para não acelerar a cadência das armas.
 */

/**
 * Visibilidade: tiles visíveis agora (2) são rebaixados para memória (1) e, depois,
 * recalculados a partir das entidades próprias e aliadas (sem aliados por ora = próprias).
 */
function stepVisibility(world: World): void {
  const n = world.map.w * world.map.h;
  for (let p = 0; p < world.players.length; p++) {
    const vis = world.visibility[p];
    if (!vis) continue;
    for (let i = 0; i < n; i++) {
      if (vis[i] === 2) vis[i] = 1;
    }
  }
  for (const e of world.entities) {
    if (e.kind === "resource" || e.owner < 0) continue;
    const sight = e.sight ?? 0;
    if (sight > 0) revealAround(world, e.owner, e.x, e.z, sight);
  }
}

/** Derrota: jogador sem unidades e sem centro da cidade é marcado como derrotado. */
function stepDefeat(world: World): void {
  for (const player of world.players) {
    if (player.defeated) continue;
    let hasUnit = false;
    let hasTownCenter = false;
    for (const e of world.entities) {
      if (e.owner !== player.id) continue;
      if (e.kind === "unit") hasUnit = true;
      if (e.kind === "building" && e.type === "town-center") hasTownCenter = true;
    }
    if (!hasUnit && !hasTownCenter) player.defeated = true;
  }
}

/**
 * Desatola unidades: se uma unidade parou em tile bloqueado (perseguição em linha reta
 * pode levar para lá), move-a para o centro do tile caminhável mais próximo. Sem isso,
 * o A* não consegue sair de um tile bloqueado e a unidade trava para sempre.
 */
function unstickUnits(world: World): void {
  const map = world.map;
  for (const e of world.entities) {
    if (e.kind !== "unit") continue;
    const tx = Math.floor(e.x / map.tile);
    const tz = Math.floor(e.z / map.tile);
    if (tx < 0 || tz < 0 || tx >= map.w || tz >= map.h) continue;
    if (!(map.blocked[tz * map.w + tx] ?? false)) continue;
    // busca em anéis de 1 a 3 tiles
    let moved = false;
    for (let r = 1; r <= 3 && !moved; r++) {
      for (let dz = -r; dz <= r && !moved; dz++) {
        for (let dx = -r; dx <= r && !moved; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
          const nx = tx + dx;
          const nz = tz + dz;
          if (nx < 0 || nz < 0 || nx >= map.w || nz >= map.h) continue;
          if (map.blocked[nz * map.w + nx] ?? false) continue;
          e.x = (nx + 0.5) * map.tile;
          e.z = (nz + 0.5) * map.tile;
          e.path = [];
          e.pathIndex = 0;
          moved = true;
        }
      }
    }
  }
}

/**
 * Executa 1 tick lógico. Ordem fixa das fases (determinismo):
 * construções → treino → economia → combate (cooldowns+aquisição+dano+perseguição)
 * → movimento → desatolar → visibilidade → derrota → vitória → sincronismo de eras → tick++.
 *
 * Notas de integração:
 * - `stepCombat` já decrementa `attackCooldown`; por isso `stepCooldowns` não é chamado.
 * - `stepVictory` roda ANTES de `syncAges` para enxergar a era histórica (player.age)
 *   do jogador que acabou de perder o landmark neste tick.
 */
export function stepTick(world: World): void {
  stepBuildings(world);
  stepProduction(world);
  stepEconomy(world);
  stepCombat(world);
  stepMovement(world);
  unstickUnits(world);
  stepVisibility(world);
  stepDefeat(world);
  stepVictory(world);
  syncAges(world);
  world.tick++;
}
