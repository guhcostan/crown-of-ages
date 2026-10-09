/**
 * combat.ts — sistema de combate da simulação (1 passo = 1 tick de 0.1 s).
 *
 * Regras:
 * - Dano é instantâneo (sem projétil): o golpe aplica dano no tick em que o cooldown zera.
 * - Torres NÃO atiram sozinhas (esta fase não tem torre ativa; construções só são alvo).
 * - Recursos nunca são alvo nem atacam.
 * - Alcance de aquisição = alcance da arma + raio do alvo (sem visão nesta fase).
 *
 * Dados vêm dos JSONs do dataset (data/aoe4/units/*); `Entity` não tem campos de combate,
 * então `CombatFields` os estende de forma opcional. Sem `Math.random`, `Date` ou `any`.
 */

import { heightAt } from "./map";
import { findPath } from "./pathfinding";
import { TICK_SECONDS } from "./types";
import type { Entity, World } from "./types";

/** Campos de combate opcionais (estendem Entity sem alterar types.ts). */
export interface CombatFields {
  /** Dano base por golpe. Quando ausente, usa WEAPON_TABLE pelo tipo. */
  damage?: number;
  /** Alcance máximo da arma (unidades de mundo). */
  range?: number;
  /** Cadência em segundos entre golpes. */
  cooldown?: number;
  /** true = ataque à distância (contra armadura "ranged"). */
  ranged?: boolean;
}

/** Entidade com campos de combate preenchidos (uso em testes e spawns). */
export type CombatEntity = Entity & CombatFields;

/** Raio aproximado de colisão para alvos (unidades de mundo). Valor de projeto, não do dataset. */
const UNIT_RADIUS = 0.5;
/** Raio aproximado de construções (tile = 2 unidades). Valor de projeto. */
const BUILDING_RADIUS = 2;

interface WeaponStats {
  /** Dano base (weapons[0].damage do arma principal). */
  damage: number;
  /** Alcance máximo (weapons[0].range.max). */
  range: number;
  /**
   * Cadência em segundos. É `durations.cooldown` do JSON; quando 0 (arqueiros/besteiros),
   * usa-se `weapon.speed`, que é a soma aim+windup+attack+winddown+reload (ex.: 0.25+0+0.125+0.5+0.75 = 1.625).
   */
  cadence: number;
  ranged: boolean;
}

/**
 * Armas principais por tipo, lidas dos JSONs (english/french). Fonte de cada linha no comentário.
 * Usadas quando a entidade não traz `damage`/`range`/`cooldown` explícitos.
 */
const WEAPON_TABLE: Record<string, WeaponStats> = {
  // villager-1.json: Bow (ranged) dano 5, alcance 5, cooldown 2.
  villager: { damage: 5, range: 5, cadence: 2, ranged: true },
  // spearman-2.json (english): Spear dano 8, alcance 0.295, cooldown 0.75.
  spearman: { damage: 8, range: 0.295, cadence: 0.75, ranged: false },
  // archer-2.json (french): Bow dano 5, alcance 5, cooldown 0 -> speed 1.625.
  archer: { damage: 5, range: 5, cadence: 1.625, ranged: true },
  // longbowman-2.json (english): Longbow dano 6, alcance 7, cooldown 0 -> speed 1.625.
  longbowman: { damage: 6, range: 7, cadence: 1.625, ranged: true },
  // crossbowman-3.json (english): Crossbow dano 11, alcance 5, cooldown 0 -> speed 2.125.
  crossbowman: { damage: 11, range: 5, cadence: 2.125, ranged: true },
  // man-at-arms-2.json (english): Sword dano 10, alcance 0.295, cooldown 0 -> speed 1.375.
  "man-at-arms": { damage: 10, range: 0.295, cadence: 1.375, ranged: false },
  // horseman-2.json (english): Spear dano 9, alcance 0.375, cooldown 1.125.
  horseman: { damage: 9, range: 0.375, cadence: 1.125, ranged: false },
  // scout-1.json (english): Short Sword dano 1, alcance 0.2875, cooldown 1.5.
  scout: { damage: 1, range: 0.2875, cadence: 1.5, ranged: false },
  // knight-3.json (english): Sword dano 24, alcance 0.2875, cooldown 0.875.
  knight: { damage: 24, range: 0.2875, cadence: 0.875, ranged: false },
};

/**
 * Classes-alvo por tipo, derivadas das `classes` dos JSONs e mapeadas para as categorias
 * usadas em BONUS_TABLE / ARMOR_TABLE. Edifícios usam sempre ["building"].
 */
const TYPE_CLASSES: Record<string, readonly string[]> = {
  // villager-1.json: "worker".
  villager: ["worker"],
  // spearman-2.json: "light_melee_infantry" (+ "melee", "infantry_light").
  spearman: ["light_melee_infantry"],
  // archer-2.json / longbowman-2.json / crossbowman-3.json: "ranged_infantry", "infantry_light".
  archer: ["light_ranged_infantry", "ranged"],
  longbowman: ["light_ranged_infantry", "ranged"],
  crossbowman: ["light_ranged_infantry", "ranged"],
  // man-at-arms-2.json: "armored", "heavy".
  "man-at-arms": ["armored", "heavy"],
  // horseman-2.json: "cavalry".
  horseman: ["cavalry"],
  // scout-1.json: "cavalry", "scout".
  scout: ["cavalry", "scout"],
  // knight-3.json: "cavalry", "cavalry_armored", "armored", "heavy".
  knight: ["cavalry", "armored", "heavy"],
};

/**
 * Bônus de dano por tipo atacante e classe-alvo (modificadores `effect: "change"` do dataset,
 * SPEC §2.13). Quando há mais de uma classe-alvo, usa-se o MAIOR bônus (sem somar).
 */
export const BONUS_TABLE: Record<string, Record<string, number>> = {
  // spearman-2.json (english): meleeAttack cavalry +20.
  // Omitidos: "worker+elephant" (+24) e "war+elephant" (+4): no dataset são conjunções (AND),
  // e "elephant" não existe nas categorias do projeto; aldeões não recebem o bônus.
  spearman: { cavalry: 20 },
  // archer-2.json (french): rangedAttack light+melee+infantry +5.
  archer: { light_melee_infantry: 5 },
  // longbowman-2.json (english): rangedAttack light+melee+infantry +6.
  longbowman: { light_melee_infantry: 6 },
  // crossbowman-3.json (english): rangedAttack heavy +10.
  crossbowman: { heavy: 10 },
  // horseman-2.json (english): meleeAttack ranged +9 (siege +9 omitido: sem tipo de cerco nesta fase).
  horseman: { ranged: 9 },
  // scout-1.json (english): meleeAttack scout +10 (siege +10 omitido).
  scout: { scout: 10 },
};

/**
 * Armadura por classe-alvo: { melee, ranged }. Valores APROXIMADOS (decisão de projeto),
 * baseados nas categorias da SPEC: light 0/0, heavy 2/2, armored 3/3, cavalry 0/0, siege 0/0,
 * building 6/6, worker 0/0. Observação: knight-3.json tem armadura 4/4 no dataset; aqui 3/3.
 */
export const ARMOR_TABLE: Record<string, { melee: number; ranged: number }> = {
  light_melee_infantry: { melee: 0, ranged: 0 },
  light_ranged_infantry: { melee: 0, ranged: 0 },
  ranged: { melee: 0, ranged: 0 },
  scout: { melee: 0, ranged: 0 },
  heavy: { melee: 2, ranged: 2 },
  armored: { melee: 3, ranged: 3 },
  cavalry: { melee: 0, ranged: 0 },
  siege: { melee: 0, ranged: 0 },
  building: { melee: 6, ranged: 6 },
  worker: { melee: 0, ranged: 0 },
};

/** Classes-alvo de uma entidade (edifícios = "building"; unidades pela tabela de tipos). */
function classesOf(e: Entity): readonly string[] {
  if (e.kind === "building") return ["building"];
  return TYPE_CLASSES[e.type] ?? [];
}

/** Campos de combate lidos com fallback para a tabela de armas. */
function fieldsOf(e: Entity): CombatFields {
  return e as CombatEntity;
}

function weaponOf(type: string): WeaponStats | undefined {
  return WEAPON_TABLE[type];
}

function rangedOf(e: Entity): boolean {
  return fieldsOf(e).ranged ?? weaponOf(e.type)?.ranged ?? false;
}

function rangeOf(e: Entity): number {
  return fieldsOf(e).range ?? weaponOf(e.type)?.range ?? 0;
}

function cadenceOf(e: Entity): number {
  const cadence = fieldsOf(e).cooldown ?? weaponOf(e.type)?.cadence ?? 1;
  return cadence > 0 ? cadence : 1;
}

function radiusOf(e: Entity): number {
  return e.kind === "building" ? BUILDING_RADIUS : UNIT_RADIUS;
}

/** Unidade militar: unidade que não é trabalhador (aldeão). */
export function isMilitary(e: Entity): boolean {
  if (e.kind !== "unit") return false;
  return !classesOf(e).includes("worker");
}

/** Bônus de dano do tipo atacante contra o alvo (maior bônus entre as classes do alvo). */
export function bonusContra(attackerType: string, target: Entity): number {
  const row = BONUS_TABLE[attackerType];
  if (!row) return 0;
  let best = 0;
  for (const cls of classesOf(target)) {
    const value = row[cls];
    if (value !== undefined && value > best) best = value;
  }
  return best;
}

/** Armadura efetiva do alvo contra ataque corpo a corpo (ranged=false) ou à distância (ranged=true). */
export function armorDo(alvo: Entity, ranged: boolean): number {
  let best = 0;
  for (const cls of classesOf(alvo)) {
    const row = ARMOR_TABLE[cls];
    if (!row) continue;
    const value = ranged ? row.ranged : row.melee;
    if (value > best) best = value;
  }
  return best;
}

/**
 * Dano efetivo de um golpe: max(1, base + bonusClasse - armadura).
 * `_world` é reservado para bônus de tecnologia (ainda não modelados nesta fase).
 */
export function danoEfetivo(attacker: Entity, target: Entity, _world: World): number {
  const base = fieldsOf(attacker).damage ?? weaponOf(attacker.type)?.damage ?? 0;
  const bonus = bonusContra(attacker.type, target);
  const armor = armorDo(target, rangedOf(attacker));
  return Math.max(1, base + bonus - armor);
}

/** Busca entidade pelo id (sem reutilizar ids). */
function findById(world: World, id: number): Entity | undefined {
  return world.entities.find((e) => e.id === id);
}

function distance(ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax;
  const dz = bz - az;
  return Math.sqrt(dx * dx + dz * dz);
}

/** Alvo válido: unidade ou construção de outro dono (não neutro), vivo e de jogador não derrotado. */
function isEnemy(attacker: Entity, e: Entity, world: World): boolean {
  if (e.kind !== "unit" && e.kind !== "building") return false;
  if (e.owner < 0 || e.owner === attacker.owner) return false;
  if (e.hp <= 0) return false;
  const owner = world.players[e.owner];
  return !(owner?.defeated ?? false);
}

/** Alvo está no alcance de ataque do atacante (alcance da arma + raio do alvo). */
function inReach(attacker: Entity, target: Entity): boolean {
  const d = distance(attacker.x, attacker.z, target.x, target.z);
  return d <= rangeOf(attacker) + radiusOf(target) + 1e-6;
}

/**
 * Inimigo mais próximo dentro de `acquire` unidades (empates: o primeiro na ordem do array).
 * `acquire` é a visão da unidade em attackMove (para poder perseguir) e o alcance em hold.
 */
function findNearestEnemy(world: World, attacker: Entity, acquire: number): Entity | undefined {
  let best: Entity | undefined;
  let bestDist = Infinity;
  for (const e of world.entities) {
    if (!isEnemy(attacker, e, world)) continue;
    const d = distance(attacker.x, attacker.z, e.x, e.z);
    if (d > acquire + radiusOf(e)) continue;
    if (d < bestDist) {
      bestDist = d;
      best = e;
    }
  }
  return best;
}

/** Vira o atacante para o alvo (facing em radianos, convenção de tick.ts: atan2(dx, dz)). */
function faceTowards(attacker: Entity, target: Entity): void {
  attacker.facing = Math.atan2(target.x - attacker.x, target.z - attacker.z);
}

/**
 * Perseguicao do alvo: movimento direto parando em `stopDist`. Se o passo seguinte
 * entraria em tile bloqueado (penhasco/agua), recalcula caminho por A* e deixa o
 * sistema de movimento andar (evita travar em obstaculos).
 */
function pursue(world: World, attacker: Entity, target: Entity): void {
  const dx = target.x - attacker.x;
  const dz = target.z - attacker.z;
  const d = Math.sqrt(dx * dx + dz * dz);
  const stopDist = rangeOf(attacker) + radiusOf(target);
  if (d <= stopDist) return;
  const speed = attacker.movementSpeed ?? 0;
  // Chegando: snap direto para a distancia de parada. Sem isso, o passo limitado a
  // `d - stopDist` empata na fronteira por arredondamento float e a unidade nunca ataca.
  if (d - stopDist < 0.05) {
    const ux = dx / d;
    const uz = dz / d;
    attacker.x = target.x - ux * stopDist;
    attacker.z = target.z - uz * stopDist;
    attacker.facing = Math.atan2(dx, dz);
    attacker.y = heightAt(world.map, attacker.x, attacker.z);
    return;
  }
  const step = Math.min(speed * TICK_SECONDS, d - stopDist);
  if (step <= 0) return;
  const nx = attacker.x + (dx / d) * step;
  const nz = attacker.z + (dz / d) * step;
  if (!walkableAt(world, nx, nz)) {
    if (!attacker.path || attacker.path.length === 0) {
      attacker.path = findPath(world.map, attacker.x, attacker.z, target.x, target.z);
      attacker.pathIndex = 0;
    }
    return;
  }
  attacker.x = nx;
  attacker.z = nz;
  attacker.facing = Math.atan2(dx, dz);
  attacker.y = heightAt(world.map, attacker.x, attacker.z);
}

/** Verdadeiro se o ponto (x,z) esta em tile caminhavel do mapa. */
function walkableAt(world: World, x: number, z: number): boolean {
  const tx = Math.floor(x / world.map.tile);
  const tz = Math.floor(z / world.map.tile);
  if (tx < 0 || tz < 0 || tx >= world.map.w || tz >= world.map.h) return false;
  return !(world.map.blocked[tz * world.map.w + tx] ?? false);
}

/** Golpe instantâneo: aplica dano e reinicia o cooldown da arma. */
function strike(world: World, attacker: Entity, target: Entity): void {
  target.hp -= danoEfetivo(attacker, target, world);
  attacker.attackCooldown = cadenceOf(attacker);
}

/**
 * Passo de combate de uma unidade: aquisição, perseguição e ataque.
 * Só age com ordem attack, attackMove ou hold no topo da fila.
 */
function stepUnitCombat(world: World, unit: Entity): void {
  const head = unit.orders?.[0];
  if (!head || (head.type !== "attack" && head.type !== "attackMove" && head.type !== "hold")) {
    unit.attackTargetId = undefined;
    return;
  }

  let target: Entity | undefined;
  if (head.type === "attack") {
    // Ordem de ataque explícita: o alvo é fixo; ao morrer/sumir, a ordem é concluída.
    const fixed = head.targetId !== undefined ? findById(world, head.targetId) : undefined;
    if (!fixed || !isEnemy(unit, fixed, world)) {
      unit.orders?.shift();
      unit.attackTargetId = undefined;
      return;
    }
    target = fixed;
  } else {
    // Alvo travado continua sendo perseguido (attackMove) ou só mantido no alcance (hold).
    const locked = unit.attackTargetId !== undefined ? findById(world, unit.attackTargetId) : undefined;
    if (locked && isEnemy(unit, locked, world) && (head.type === "attackMove" || inReach(unit, locked))) {
      target = locked;
    } else {
      // attackMove adquire pela visao (piso de 10 tiles: unidades treinadas podem
      // nascer sem `sight` definido no blueprint); hold so pelo alcance da arma.
      const acquire = head.type === "attackMove" ? Math.max(unit.sight ?? 0, 10) : rangeOf(unit);
      target = findNearestEnemy(world, unit, acquire);
    }
  }

  unit.attackTargetId = target?.id;
  if (!target) return;

  if (inReach(unit, target)) {
    faceTowards(unit, target);
    if ((unit.attackCooldown ?? 0) <= 0) strike(world, unit, target);
    return;
  }

  // Hold nunca persegue. Em attackMove, unidade em caminho (path) não desvia para perseguir.
  if (head.type === "hold") {
    unit.attackTargetId = undefined;
    return;
  }
  if (unit.path && unit.path.length > 0) return;
  pursue(world, unit, target);
}

/** Decrementa o cooldown de ataque de todas as unidades até zero (passo 1). */
function decrementCooldowns(world: World): void {
  for (const e of world.entities) {
    if (e.kind !== "unit") continue;
    const cd = e.attackCooldown ?? 0;
    if (cd > 0) e.attackCooldown = Math.max(0, cd - TICK_SECONDS);
  }
}

/** Remove mortos (hp <= 0) de unidades e construções; recursos nunca morrem por combate. */
function removeDead(world: World): void {
  const dead = (e: Entity): boolean => (e.kind === "unit" || e.kind === "building") && e.hp <= 0;
  for (const e of world.entities) {
    if (!dead(e) || e.kind !== "unit") continue;
    const player = world.players[e.owner];
    if (player && player.pop > 0) player.pop -= 1;
  }
  world.entities = world.entities.filter((e) => !dead(e));
}

/**
 * Avança o combate em 1 tick. Ordem: cooldowns → aquisição/perseguição/ataque → mortes.
 * NOTA DE INTEGRAÇÃO: tick.ts também decrementa cooldowns (stepCooldowns); o Lead deve manter
 * apenas um dos dois para não acelerar a cadência de ataque.
 */
export function stepCombat(world: World): void {
  decrementCooldowns(world);
  for (const e of world.entities) {
    if (e.kind === "unit" && e.hp > 0) stepUnitCombat(world, e);
  }
  removeDead(world);
}
