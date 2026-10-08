/**
 * tick.ts — avanço de 1 tick lógico (10 Hz) da simulação.
 *
 * Escopo desta fase: construção, treino, movimento ao longo do path, cooldown de ataque,
 * visibilidade (fog of war) e derrota. Economia e combate ficam para as fases seguintes.
 * Tudo determinístico: sem Math/Date; nenhum acesso a tempo real.
 */


import { revealAround } from "./world";
import { TICK_SECONDS } from "./types";
import type { Entity, World } from "./types";

/** Distância abaixo da qual um waypoint é considerado alcançado (unidades de mundo). */
const ARRIVE_EPS = 0.05;

/** Avança a construção de prédios em andamento (buildProgress em segundos). */
function stepBuildings(world: World): void {
  for (const e of world.entities) {
    if (e.kind !== "building" || e.built) continue;
    const max = e.buildProgressMax ?? 0;
    if (max <= 0) {
      e.built = true;
      continue;
    }
    e.buildProgress = (e.buildProgress ?? 0) + TICK_SECONDS;
    if (e.buildProgress >= max) {
      e.buildProgress = max;
      e.built = true;
    }
  }
}

/** Avança a fila de treino de cada construção concluída. */
function stepTraining(world: World): void {
  for (const e of world.entities) {
    if (e.kind !== "building" || !e.built || !e.training || e.training.length === 0) continue;
    const head = e.training[0];
    if (!head) continue;
    head.progress += TICK_SECONDS;
    if (head.progress >= head.total) {
      // Treino concluído: o spawn real da unidade fica para a fase de economia.
      e.training.shift();
    }
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

/** Ao concluir o caminho, remove a ordem de movimento atual da fila (se houver). */
function advanceOrders(e: Entity): void {
  const orders = e.orders;
  if (!orders || orders.length === 0) return;
  const head = orders[0];
  if (head && (head.type === "move" || head.type === "attackMove")) {
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

/** Decrementa o cooldown de ataque (segundos) até zero. */
function stepCooldowns(world: World): void {
  for (const e of world.entities) {
    if (e.kind !== "unit") continue;
    const cd = e.attackCooldown ?? 0;
    if (cd > 0) e.attackCooldown = cd - TICK_SECONDS > 0 ? cd - TICK_SECONDS : 0;
  }
}

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
 * Executa 1 tick lógico. Ordem fixa das fases (determinismo):
 * construções → treino → cooldowns → movimento → visibilidade → derrota → tick++.
 */
export function stepTick(world: World): void {
  stepBuildings(world);
  stepTraining(world);
  stepCooldowns(world);
  stepMovement(world);
  stepVisibility(world);
  stepDefeat(world);
  world.tick++;
}
