/**
 * selection.ts — consultas puras de seleção sobre o mundo (sem estado de UI).
 *
 * Complementa src/game/selection.ts (que tem a lógica de interação). Aqui ficam só as
 * queries determinísticas sobre o World: retângulo, ponto e expansão por tipo.
 */

import type { Entity, World } from "./types";

/** Retângulo em coordenadas de mundo (x,z), normalizado por quem chama. */
export interface WorldRect {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

/** Ids de unidades do jogador `forPlayer` dentro do retângulo (ordem de entidades). */
export function queryUnits(world: World, rect: WorldRect, forPlayer: number): number[] {
  const minX = rect.x0 < rect.x1 ? rect.x0 : rect.x1;
  const maxX = rect.x0 < rect.x1 ? rect.x1 : rect.x0;
  const minZ = rect.z0 < rect.z1 ? rect.z0 : rect.z1;
  const maxZ = rect.z0 < rect.z1 ? rect.z1 : rect.z0;
  const out: number[] = [];
  for (const e of world.entities) {
    if (e.kind !== "unit" || e.owner !== forPlayer) continue;
    if (e.x >= minX && e.x <= maxX && e.z >= minZ && e.z <= maxZ) out.push(e.id);
  }
  return out;
}

/**
 * Unidades do jogador a até `radius` do ponto (x,z). Compara quadrados (sem sqrt),
 * então o resultado é exato e determinístico.
 */
export function unitsAtPoint(
  world: World,
  x: number,
  z: number,
  radius: number,
  forPlayer: number,
): number[] {
  const r2 = radius * radius;
  const out: number[] = [];
  for (const e of world.entities) {
    if (e.kind !== "unit" || e.owner !== forPlayer) continue;
    const dx = e.x - x;
    const dz = e.z - z;
    if (dx * dx + dz * dz <= r2) out.push(e.id);
  }
  return out;
}

/**
 * Duplo clique: a partir dos ids selecionados, devolve todos os ids do mesmo `type`
 * pertencentes ao mesmo dono da primeira unidade válida. Ordem = ordem das entidades.
 */
export function selectSameType(world: World, ids: number[]): number[] {
  let anchor: Entity | undefined;
  for (const id of ids) {
    const e = world.entities.find((c) => c.id === id);
    if (e && e.kind === "unit") {
      anchor = e;
      break;
    }
  }
  if (!anchor) return [];
  const out: number[] = [];
  for (const e of world.entities) {
    if (e.kind === "unit" && e.owner === anchor.owner && e.type === anchor.type) out.push(e.id);
  }
  return out;
}
