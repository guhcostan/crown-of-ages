/**
 * commands.ts — aplica comandos do jogador ao mundo.
 *
 * `issuer` é o jogador que emite o comando (padrão 0 = humano). Comandos só afetam
 * unidades do próprio emissor; ids de outros jogadores são ignorados silenciosamente.
 * Ordens são fila por unidade: `queue=true` acrescenta ao fim (máx. 12); senão substitui.
 */

import { findPath } from "./pathfinding";
import type { Command, Entity, Order, World } from "./types";

/** Máximo de ordens na fila de cada unidade. */
const MAX_ORDERS = 12;

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

/** Destino em mundo de uma ordem, se houver. */
function destinationOf(order: Order): { x: number; z: number } | undefined {
  if (order.x === undefined || order.z === undefined) return undefined;
  return { x: order.x, z: order.z };
}

/**
 * Aplica um comando ao mundo. Comandos não-movimento (build, train, gather...) são
 * aceitos mas só registram a ordem nesta fase; a semântica completa fica para as fases
 * de economia e combate.
 */
export function applyCommand(world: World, cmd: Command, issuer: number = 0): void {
  const units = ownUnits(world, cmd.unitIds, issuer);
  if (units.length === 0) return;
  const queue = cmd.queue === true;

  for (const e of units) {
    switch (cmd.type) {
      case "move":
      case "attackMove": {
        if (cmd.x === undefined || cmd.z === undefined) break;
        setMoveOrder(world, e, { type: cmd.type, x: cmd.x, z: cmd.z, queue }, queue);
        break;
      }
      case "stop": {
        // Stop substitui tudo: zera ordens, caminho e velocidade efetiva.
        e.orders = [];
        e.path = [];
        e.pathIndex = 0;
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
