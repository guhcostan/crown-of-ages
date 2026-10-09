/**
 * commands.ts — aplica comandos do jogador ao mundo.
 *
 * `issuer` é o jogador que emite o comando (padrão 0 = humano). Comandos só afetam
 * unidades/edifícios do próprio emissor; ids de outros jogadores são ignorados.
 * Ordens são fila por unidade: `queue=true` acrescenta ao fim (máx. 12); senão substitui.
 *
 * Economia/construção:
 *  - build: cria fantasma (built=false) e desconta o custo; o 1º aldeão recebe a ordem.
 *  - train: desconta o custo ao ENFILEIRAR e coloca na fila do edifício (máx. 5).
 *  - setRally: define o ponto de encontro do edifício.
 *  - gather: aldeão passa a coletar a fonte (entityId = recurso ou fazenda).
 */

import { BUILDINGS, buildingDef } from "./buildings";
import { findPath } from "./pathfinding";
import { MAX_TRAINING_QUEUE, UNIT_DEFS } from "./train";
import type { Command, Entity, Order, ResourceKind, World } from "./types";

/** Máximo de ordens na fila de cada unidade. */
const MAX_ORDERS = 12;

type Cost = { food: number; wood: number; gold: number; stone: number };

/** Entidades do emissor que são unidades e têm id na lista do comando. */
function ownUnits(world: World, unitIds: number[], issuer: number): Entity[] {
  const wanted = new Set(unitIds);
  const out: Entity[] = [];
  for (const e of world.entities) {
    if (e.kind !== "unit" || e.owner !== issuer) continue;
    if (wanted.has(e.id)) out.push(e);
  }
  return out;
}

/** Entidade de construção do emissor pelo id (ou undefined). */
function ownBuilding(world: World, id: number, issuer: number): Entity | undefined {
  for (const e of world.entities) {
    if (e.id === id && e.kind === "building" && e.owner === issuer) return e;
  }
  return undefined;
}

/** Destino em mundo de uma ordem, se houver. */
function destinationOf(order: Order): { x: number; z: number } | undefined {
  if (order.x === undefined || order.z === undefined) return undefined;
  return { x: order.x, z: order.z };
}

/** Aplica uma ordem de movimento (move/attackMove) a uma unidade, respeitando a fila. */
function setMoveOrder(world: World, e: Entity, order: Order, queue: boolean): void {
  if (!queue) {
    e.orders = [order];
  } else {
    const orders = e.orders ?? [];
    if (orders.length >= MAX_ORDERS) return;
    orders.push(order);
    e.orders = orders;
  }
  // Recalcula o caminho apenas se esta é a ordem ativa (primeira da fila).
  if (e.orders[0] === order) {
    const dest = destinationOf(order);
    if (dest) {
      e.path = findPath(world.map, e.x, e.z, dest.x, dest.z);
      e.pathIndex = 0;
    }
  }
}

/** Verifica se o jogador tem recursos suficientes para o custo. */
function canAfford(res: Record<ResourceKind, number>, cost: Cost): boolean {
  return res.food >= cost.food && res.wood >= cost.wood && res.gold >= cost.gold && res.stone >= cost.stone;
}

/** Debita o custo do jogador (assume que `canAfford` já foi verificado). */
function pay(res: Record<ResourceKind, number>, cost: Cost): void {
  res.food -= cost.food;
  res.wood -= cost.wood;
  res.gold -= cost.gold;
  res.stone -= cost.stone;
}

/** Footprint (quadrado de `size` tiles centrado no ponto) livre de bloqueio no mapa. */
function footprintFree(world: World, x: number, z: number, size: number): boolean {
  const tile = world.map.tile;
  const cx = Math.floor(x / tile);
  const cz = Math.floor(z / tile);
  const half = Math.floor(size / 2);
  for (let dz = -half; dz < size - half; dz++) {
    for (let dx = -half; dx < size - half; dx++) {
      const tx = cx + dx;
      const tz = cz + dz;
      if (tx < 0 || tz < 0 || tx >= world.map.w || tz >= world.map.h) return false;
      if (world.map.blocked[tz * world.map.w + tx]) return false;
    }
  }
  return true;
}

/** Cria o fantasma de construção (built=false, hp = 10% do máximo). */
function spawnConstruction(world: World, owner: number, type: string, x: number, z: number): Entity {
  const def = buildingDef(type);
  const e: Entity = {
    id: world.nextId++,
    kind: "building",
    type,
    owner,
    x,
    z,
    y: 0,
    hp: def.hp * 0.1,
    maxHp: def.hp,
    facing: 0,
    built: false,
    buildProgress: 0,
    buildProgressMax: def.buildTime,
    popProvided: def.providesPop,
    dropOff: [...def.dropOff],
    training: [],
  };
  world.entities.push(e);
  return e;
}

/** Comando build: cria fantasma, cobra e manda o primeiro aldeão construir. */
function applyBuild(world: World, cmd: Command, issuer: number, villagers: Entity[]): void {
  if (cmd.buildingType === undefined || cmd.x === undefined || cmd.z === undefined) return;
  if (villagers.length === 0) return;
  const def = BUILDINGS[cmd.buildingType];
  if (!def) return;
  const player = world.players[issuer];
  if (!player) return;
  if (!canAfford(player.resources, def.cost)) return;
  if (!footprintFree(world, cmd.x, cmd.z, def.size)) return;

  pay(player.resources, def.cost);
  const site = spawnConstruction(world, issuer, def.id, cmd.x, cmd.z);
  const first = villagers[0];
  if (!first) return;
  first.constructingId = site.id;
  first.gatherTargetId = undefined;
  first.carrying = undefined;
  first.path = findPath(world.map, first.x, first.z, site.x, site.z);
  first.pathIndex = 0;
}

/**
 * Comando train: edifício produtor enfileira uma unidade. O custo e a pop são reservados
 * AGORA (ao enfileirar); o spawn em train.ts não soma pop de novo.
 */
function applyTrain(world: World, cmd: Command, issuer: number): void {
  if (cmd.buildingType === undefined) return;
  const def = UNIT_DEFS[cmd.buildingType];
  if (!def) return;
  const player = world.players[issuer];
  if (!player) return;

  for (const id of cmd.unitIds) {
    const building = ownBuilding(world, id, issuer);
    if (!building || !building.built || !building.training) continue;
    if (!def.producedBy.includes(building.type)) continue;
    if (building.training.length >= MAX_TRAINING_QUEUE) continue;
    if (!canAfford(player.resources, def.cost)) continue;
    if (player.pop + def.pop > player.popCap) continue;

    pay(player.resources, def.cost);
    building.training.push({ type: def.id, progress: 0, total: def.time });
    player.pop += def.pop;
  }
}

/** Comando setRally: ponto de encontro do edifício (x/z). */
function applySetRally(world: World, cmd: Command, issuer: number): void {
  if (cmd.x === undefined || cmd.z === undefined || cmd.entityId === undefined) return;
  const building = ownBuilding(world, cmd.entityId, issuer);
  if (!building) return;
  building.rallyX = cmd.x;
  building.rallyZ = cmd.z;
}

/** Comando gather: aldeões passam a coletar a fonte (recurso do mapa ou fazenda). */
function applyGather(cmd: Command, villagers: Entity[]): void {
  const targetId = cmd.entityId;
  if (targetId === undefined) return;
  for (const v of villagers) {
    v.gatherTargetId = targetId;
    v.constructingId = undefined;
    v.path = [];
    v.pathIndex = 0;
  }
}

/**
 * Aplica um comando ao mundo. Comandos de movimento, construção, treino, rally e coleta são
 * tratados explicitamente; os demais tipos (repair, garrison...) são registrados em `orders`.
 */
export function applyCommand(world: World, cmd: Command, issuer: number = 0): void {
  const queue = cmd.queue === true;

  switch (cmd.type) {
    case "build":
      applyBuild(world, cmd, issuer, ownUnits(world, cmd.unitIds, issuer));
      return;
    case "train":
      applyTrain(world, cmd, issuer);
      return;
    case "setRally":
      applySetRally(world, cmd, issuer);
      return;
    case "gather":
      applyGather(cmd, ownUnits(world, cmd.unitIds, issuer));
      return;
    default:
      break;
  }

  const units = ownUnits(world, cmd.unitIds, issuer);
  if (units.length === 0) return;

  for (const e of units) {
    switch (cmd.type) {
      case "move":
      case "attackMove": {
        if (cmd.x === undefined || cmd.z === undefined) break;
        setMoveOrder(world, e, { type: cmd.type, x: cmd.x, z: cmd.z, queue }, queue);
        break;
      }
      case "stop": {
        // Stop substitui tudo: zera ordens, caminho, coleta e construção em andamento.
        e.orders = [];
        e.path = [];
        e.pathIndex = 0;
        e.gatherTargetId = undefined;
        e.constructingId = undefined;
        break;
      }
      case "hold": {
        e.path = [];
        e.pathIndex = 0;
        e.orders = [{ type: "hold", queue: false }];
        break;
      }
      default: {
        // Demais tipos: registra a ordem para a fase seguinte consumir.
        const order: Order = {
          type: cmd.type,
          queue,
          ...(cmd.x !== undefined ? { x: cmd.x } : {}),
          ...(cmd.z !== undefined ? { z: cmd.z } : {}),
          ...(cmd.entityId !== undefined ? { targetId: cmd.entityId } : {}),
          ...(cmd.buildingType !== undefined ? { buildingType: cmd.buildingType } : {}),
        };
        const orders = e.orders ?? [];
        if (!queue) e.orders = [order];
        else if (orders.length < MAX_ORDERS) {
          orders.push(order);
          e.orders = orders;
        }
        break;
      }
    }
  }
}
