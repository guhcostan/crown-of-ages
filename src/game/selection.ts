/**
 * selection.ts — lógica PURA de seleção de unidades e grupos de controle.
 *
 * Sem three, sem DOM: roda em Node (testes unitários). A projeção câmera↔mundo é injetada
 * via `Projector`, então a cola de render pode fornecer a implementação real.
 */
import type { Entity, World } from "@sim/types";

/** Conversão entre tela (pixels) e plano do chão do mundo (x,z). */
export interface Projector {
  worldToScreen(x: number, z: number): { x: number; y: number };
  screenToWorld(x: number, y: number): { x: number; z: number };
}

/** Modelo de grupos de controle (teclas 0–9). */
export interface ControlGroupsModel {
  groups: Map<number, number[]>;
}

/** Raio de acerto de clique, em tiles. */
const PICK_RADIUS_TILES = 0.6;

/** União preservando a ordem: primeiro `a`, depois os itens de `b` ainda ausentes. */
function unionIds(a: readonly number[], b: readonly number[]): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const id of [...a, ...b]) {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

/** Verdadeiro se a entidade é uma unidade do jogador dado. */
function isOwnUnit(entity: Entity, forPlayer: number): boolean {
  return entity.kind === "unit" && entity.owner === forPlayer;
}

/**
 * Verdadeiro se o tile sob (x,z) é visível (visibility != 0) para o jogador.
 * Fora do mapa retorna falso.
 */
function isTileVisible(world: World, forPlayer: number, x: number, z: number): boolean {
  const vis = world.visibility[forPlayer];
  if (!vis) return false;
  const tx = Math.floor(x / world.map.tile);
  const tz = Math.floor(z / world.map.tile);
  if (tx < 0 || tz < 0 || tx >= world.map.w || tz >= world.map.h) return false;
  return (vis[tz * world.map.w + tx] ?? 0) !== 0;
}

/**
 * Unidade própria mais próxima do ponto de tela, dentro do raio de acerto.
 * Retorna undefined se nenhuma unidade está ao alcance.
 */
function findUnitAt(
  world: World,
  projector: Projector,
  screenX: number,
  screenY: number,
  forPlayer: number,
): Entity | undefined {
  const pt = projector.screenToWorld(screenX, screenY);
  const radius = PICK_RADIUS_TILES * world.map.tile;
  let best: Entity | undefined;
  let bestDist = Infinity;
  for (const e of world.entities) {
    if (!isOwnUnit(e, forPlayer)) continue;
    const d = Math.hypot(e.x - pt.x, e.z - pt.z);
    if (d <= radius && d < bestDist) {
      best = e;
      bestDist = d;
    }
  }
  return best;
}

/**
 * Seleção por clique em um ponto da tela.
 *
 * - Clique em unidade própria: seleciona (sem shift substitui; com shift alterna adição/remoção).
 * - `doubleClick`: seleciona todas as unidades próprias visíveis do mesmo tipo (selectSameType).
 * - Clique em vazio/outra entidade: limpa a seleção (sem shift); com shift mantém `current`.
 */
export function pickAt(
  world: World,
  projector: Projector,
  screenX: number,
  screenY: number,
  forPlayer: number,
  additive: boolean,
  current: readonly number[],
  doubleClick: boolean,
): number[] {
  const hit = findUnitAt(world, projector, screenX, screenY, forPlayer);

  if (!hit) {
    return additive ? [...current] : [];
  }

  if (doubleClick) {
    const sameType = world.entities
      .filter((e) => isOwnUnit(e, forPlayer) && e.type === hit.type)
      .filter((e) => isTileVisible(world, forPlayer, e.x, e.z))
      .map((e) => e.id);
    return additive ? unionIds(current, sameType) : sameType;
  }

  if (!additive) return [hit.id];

  // Shift: alterna o item clicado na seleção atual.
  if (current.includes(hit.id)) {
    return current.filter((id) => id !== hit.id);
  }
  return unionIds(current, [hit.id]);
}

/**
 * Seleção por retângulo arrastado (cantos em coordenadas de tela).
 *
 * Converte os cantos para o plano do mundo, pega a caixa envolvente e devolve as unidades
 * próprias (`forPlayer`) dentro dela cujo tile é visível. Sem `additive` substitui a seleção.
 */
export function boxSelect(
  world: World,
  projector: Projector,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  forPlayer: number,
  additive: boolean,
  current: readonly number[],
): number[] {
  const a = projector.screenToWorld(x0, y0);
  const b = projector.screenToWorld(x1, y1);
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minZ = Math.min(a.z, b.z);
  const maxZ = Math.max(a.z, b.z);

  const picked: number[] = [];
  for (const e of world.entities) {
    if (!isOwnUnit(e, forPlayer)) continue;
    if (e.x < minX || e.x > maxX || e.z < minZ || e.z > maxZ) continue;
    if (!isTileVisible(world, forPlayer, e.x, e.z)) continue;
    picked.push(e.id);
  }

  return additive ? unionIds(current, picked) : picked;
}

/**
 * Operação de grupo de controle para a tecla numérica `key`.
 *
 * - `ctrl`: define o grupo como a seleção atual (copia).
 * - `shift`: adiciona o grupo à seleção atual.
 * - Sem modificador: seleciona o grupo (vazio se não definido).
 *
 * Mutaciona apenas `model.groups` (no caso de `ctrl`). Retorna sempre um array novo.
 */
export function controlGroupOp(
  model: ControlGroupsModel,
  key: number,
  ctrl: boolean,
  shift: boolean,
  currentSelection: readonly number[],
): number[] {
  if (ctrl) {
    model.groups.set(key, [...currentSelection]);
    return [...currentSelection];
  }
  const group = model.groups.get(key) ?? [];
  if (shift) {
    return unionIds(currentSelection, group);
  }
  return [...group];
}
