/**
 * economy.ts — coleta de recursos, entrega (drop-off) e fazendas.
 *
 * Regras (SPEC §7.1):
 *  - Taxa bruta de coleta por aldeão (recurso/s): arbusto 0.66, fazenda 0.75, rebanho 0.75,
 *    madeira 0.75, ouro 0.75, pedra 0.75; caça 0.825–1.00 (fugindo/perigosa).
 *  - Capacidade de carga: 10 (caça: 25).
 *  - Drop-off imediato no edifício dono com dropOff compatível (sem tempo de entrega).
 *
 * Fonte de verdade da quantidade de recurso de mapa: `world.map.resources[id].amount`
 * (o entity `kind:"resource"` tem o mesmo `id` que o recurso do mapa; ver world.ts, onde o
 * entity recebe `type = r.kind` e a posição). Para localizar o MapResource a partir do
 * entity, usa-se a posição (x,z) — ver `mapResourceOf`.
 *
 * Simplificações desta fase (aceitas no milestone):
 *  - Fazenda: o pool de comida restante fica em `maxHp` (começa em FARM_FOOD); `hp` segue
 *    como vida. Fazenda esgotada deixa de ser alvo válido.
 *  - Caça não foge; o aldeão alcança o alvo.
 *  - Sem bônus de tecnologia nem de moinho (fase de upgrades).
 */

import { findPath } from "./pathfinding";
import type { Entity, MapResource, ResourceKind, ResSubKind, World } from "./types";
import { TICK_SECONDS } from "./types";

/** Distância (unidades de mundo) abaixo da qual o aldeão coleta a fonte de mapa. */
const GATHER_RANGE = 1.2;

/**
 * Alcance de interação com um edifício (fazenda, drop-off). Edifícios têm footprint; o
 * aldeão para na borda, então o limiar é maior que o do recurso (centro do edifício).
 */
const BUILDING_RANGE = 3;

/** Comida inicial de cada fazenda (SPEC §7.1: 120 comida total). */
export const FARM_FOOD = 120;

/** Taxa de coleta de fazenda (comida/s), SPEC §7.1. */
const FARM_RATE = 0.75;

/** Taxa de coleta por aldeão em recurso/s (SPEC §7.1). */
export const GATHER_RATES: Record<ResSubKind, number> = {
  berry: 0.66,
  sheep: 0.75,
  deer: 0.825,
  boar: 0.9,
  "gold-mine": 0.75,
  "stone-mine": 0.75,
  tree: 0.75,
};

/** Capacidade de carga por subtipo (caça = 25; o resto = 10). */
export const CARRY: Record<ResSubKind, number> = {
  berry: 10,
  sheep: 25,
  deer: 25,
  boar: 25,
  "gold-mine": 10,
  "stone-mine": 10,
  tree: 10,
};

/** Recurso de inventário correspondente a cada subtipo de mapa. */
const RESOURCE_OF: Record<ResSubKind, ResourceKind> = {
  berry: "food",
  sheep: "food",
  deer: "food",
  boar: "food",
  "gold-mine": "gold",
  "stone-mine": "stone",
  tree: "wood",
};

/** Recurso de inventário de um subtipo (ponte pública para testes e outros módulos). */
export function resourceOf(kind: ResSubKind): ResourceKind {
  return RESOURCE_OF[kind];
}

function dist(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return Math.sqrt(dx * dx + dz * dz);
}

function findById(world: World, id: number): Entity | undefined {
  for (const e of world.entities) if (e.id === id) return e;
  return undefined;
}

/** Acha o MapResource correspondente a um entity de recurso pela posição (única por tile). */
function mapResourceOf(world: World, target: Entity): MapResource | undefined {
  for (const r of world.map.resources) {
    if (r.x === target.x && r.z === target.z && r.kind === target.type) return r;
  }
  return undefined;
}

/** Ponto de entrega do jogador para um recurso: edifício dono (built) com dropOff compatível. */
function findDropOff(world: World, owner: number, res: ResourceKind, fromX: number, fromZ: number): Entity | undefined {
  let best: Entity | undefined;
  let bestD = Infinity;
  for (const e of world.entities) {
    if (e.kind !== "building" || e.owner !== owner || !e.built) continue;
    if (!e.dropOff || !e.dropOff.includes(res)) continue;
    const d = dist(e.x, e.z, fromX, fromZ);
    // Desempate determinístico: menor distância; empate mantém o primeiro na ordem do array.
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}

/** Quantidade restante no alvo de coleta, ou `undefined` se o alvo não é coletável. */
function remainingOf(world: World, target: Entity): number | undefined {
  if (target.kind === "resource") return mapResourceOf(world, target)?.amount;
  if (target.kind === "building" && target.type === "farm") return target.maxHp;
  return undefined;
}

/** Retira até `want` do alvo; retorna o quanto efetivamente saiu. */
function takeFrom(world: World, target: Entity, want: number): number {
  if (target.kind === "resource") {
    const r = mapResourceOf(world, target);
    if (!r) return 0;
    const got = Math.min(want, r.amount);
    r.amount = r.amount - got;
    return got;
  }
  const have = target.maxHp;
  const got = Math.min(want, have);
  target.maxHp = have - got;
  return got;
}

/** Alcance de coleta: recurso de mapa = GATHER_RANGE; edifício (fazenda) = BUILDING_RANGE. */
function rangeOf(target: Entity): number {
  return target.kind === "building" ? BUILDING_RANGE : GATHER_RANGE;
}

/** Taxa de coleta (recurso/s) para o alvo, por tipo de fonte. */
function rateOf(target: Entity): number {
  if (target.kind === "building") return FARM_RATE;
  return GATHER_RATES[target.type as ResSubKind];
}

/** Subtipo de recurso da fonte (fazenda = comida em arbusto-equivalente). */
function kindOf(target: Entity): ResSubKind | undefined {
  if (target.kind === "building" && target.type === "farm") return "berry";
  if (target.kind === "resource") return target.type as ResSubKind;
  return undefined;
}

/**
 * Avança a economia de todos os aldeões com `gatherTargetId`. Ordem fixa e determinística
 * (iteração pela lista de entidades; sem aleatoriedade).
 */
export function stepEconomy(world: World): void {
  for (const unit of world.entities) {
    if (unit.kind !== "unit" || unit.type !== "villager") continue;
    // Aldeão sem alvo de coleta mas com carga: ainda precisa entregar (carga nunca se perde).
    if (unit.gatherTargetId === undefined) {
      if (unit.carrying && unit.carrying.amount > 0) deliver(world, unit);
      continue;
    }

    const target = findById(world, unit.gatherTargetId);
    const left = target ? remainingOf(world, target) : undefined;
    const carry = unit.carrying;
    const carrying = carry !== undefined && carry.amount > 0;

    if (!target || left === undefined || left <= 0) {
      // Fonte esgotada ou sumiu: solta o alvo. A carga NÃO se perde: continua em `carrying`
      // e é entregue pelo ramo de entrega abaixo (sem precisar de alvo).
      unit.gatherTargetId = undefined;
      if (carrying) deliver(world, unit);
      continue;
    }

    // Carga cheia: entrega e, depois, volta a coletar a mesma fonte.
    if (carrying && carry.amount >= CARRY[carry.resource]) {
      deliver(world, unit);
      continue;
    }

    // Longe da fonte: a movimentação leva o aldeão até ela (ordem gather); aqui só espera.
    if (dist(unit.x, unit.z, target.x, target.z) > rangeOf(target)) {
      if (!unit.path || unit.path.length === 0) {
        unit.path = findPath(world.map, unit.x, unit.z, target.x, target.z);
        unit.pathIndex = 0;
      }
      continue;
    }

    gatherTick(world, unit, target);
  }
}

/** Um tick de coleta: acumula fracionado no `carrying` até a capacidade da carga. */
function gatherTick(world: World, unit: Entity, target: Entity): void {
  const kind = kindOf(target);
  if (!kind) return;

  // Não mistura recursos: se carrega outro tipo, entrega antes de coletar.
  const carry = unit.carrying;
  if (carry && carry.amount > 0 && carry.resource !== kind) {
    deliver(world, unit);
    return;
  }

  const cap = CARRY[kind];
  const current = carry?.amount ?? 0;
  // Taxa por tick (fracionada, exata). O acumulador vive em `carrying.amount`.
  const want = Math.min(rateOf(target) * TICK_SECONDS, cap - current);
  const got = takeFrom(world, target, want);
  unit.carrying = { resource: kind, amount: current + got };

  // Fonte esgotada agora: o próximo tick cai no ramo de entrega acima.
}

/**
 * Entrega a carga: se perto do drop-off, deposita e volta; senão anda até ele.
 * Depois de depositar, a ordem de coleta (gatherTargetId) é mantida para continuar o loop.
 */
function deliver(world: World, unit: Entity): void {
  const carry = unit.carrying;
  if (!carry || carry.amount <= 0) return;
  const res = RESOURCE_OF[carry.resource];
  const drop = findDropOff(world, unit.owner, res, unit.x, unit.z);
  if (!drop) return; // Sem drop-off: continua carregando até existir um.

  if (dist(unit.x, unit.z, drop.x, drop.z) > BUILDING_RANGE) {
    if (!unit.path || unit.path.length === 0) {
      unit.path = findPath(world.map, unit.x, unit.z, drop.x, drop.z);
      unit.pathIndex = 0;
    }
    return;
  }

  const player = world.players[unit.owner];
  if (player) player.resources[res] += carry.amount;
  unit.carrying = undefined;
  unit.path = [];
  unit.pathIndex = 0;
}
