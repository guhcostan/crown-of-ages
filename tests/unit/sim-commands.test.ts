import { describe, expect, it } from "vitest";
import { applyCommand } from "@sim/commands";
import { stepTick } from "@sim/tick";
import { createWorld } from "@sim/world";
import type { Command, MatchConfig, World } from "@sim/types";

const config: MatchConfig = {
  seed: 77,
  civ: "english",
  map: "steppes",
  size: "small",
  bots: [],
  victory: "landmarks",
  gameSpeed: 1,
};

function firstVillager(w: World, owner = 0) {
  const v = w.entities.find((e) => e.type === "villager" && e.owner === owner);
  if (!v) throw new Error("sem aldeao");
  return v;
}

describe("applyCommand", () => {
  it("move: apos 600 ticks o aldeao chega perto do destino (< 1 tile)", () => {
    const w = createWorld(config);
    const v = firstVillager(w);
    const tile = w.map.tile;
    // Destino livre a algumas casas do aldeao: procura tile nao bloqueado vizinho.
    const tx = Math.floor(v.x / tile) + 3;
    const tz = Math.floor(v.z / tile);
    const dest = { x: tx * tile + tile / 2, z: tz * tile + tile / 2 };
    const cmd: Command = { tick: 0, type: "move", unitIds: [v.id], x: dest.x, z: dest.z };
    applyCommand(w, cmd, 0);
    for (let i = 0; i < 600; i++) stepTick(w);
    const dist = Math.hypot(v.x - dest.x, v.z - dest.z);
    expect(dist).toBeLessThan(tile);
  });

  it("stop zera velocidade (path vazio) e ordens", () => {
    const w = createWorld(config);
    const v = firstVillager(w);
    applyCommand(w, { tick: 0, type: "move", unitIds: [v.id], x: v.x + 20, z: v.z }, 0);
    for (let i = 0; i < 5; i++) stepTick(w);
    applyCommand(w, { tick: 5, type: "stop", unitIds: [v.id] }, 0);
    expect(v.path).toEqual([]);
    expect(v.orders).toEqual([]);
    const x0 = v.x;
    const z0 = v.z;
    for (let i = 0; i < 10; i++) stepTick(w);
    expect(v.x).toBe(x0);
    expect(v.z).toBe(z0);
  });

  it("queue=true empilha 2 ou mais ordens", () => {
    const w = createWorld(config);
    const v = firstVillager(w);
    applyCommand(w, { tick: 0, type: "move", unitIds: [v.id], x: v.x + 4, z: v.z }, 0);
    applyCommand(w, { tick: 0, type: "move", unitIds: [v.id], x: v.x + 4, z: v.z + 4, queue: true }, 0);
    applyCommand(w, { tick: 0, type: "attackMove", unitIds: [v.id], x: v.x, z: v.z + 8, queue: true }, 0);
    expect(v.orders?.length).toBe(3);
  });

  it("sem queue substitui a fila", () => {
    const w = createWorld(config);
    const v = firstVillager(w);
    applyCommand(w, { tick: 0, type: "move", unitIds: [v.id], x: v.x + 4, z: v.z, queue: true }, 0);
    applyCommand(w, { tick: 0, type: "move", unitIds: [v.id], x: v.x + 6, z: v.z }, 0);
    expect(v.orders?.length).toBe(1);
  });

  it("ignora unidades de outro jogador", () => {
    const w = createWorld({ ...config, bots: [{ difficulty: "easy" }] });
    const enemy = firstVillager(w, 1);
    applyCommand(w, { tick: 0, type: "move", unitIds: [enemy.id], x: enemy.x + 10, z: enemy.z }, 0);
    expect(enemy.path ?? []).toEqual([]);
    expect(enemy.orders ?? []).toEqual([]);
  });

  it("hold impede movimento e registra ordem hold", () => {
    const w = createWorld(config);
    const v = firstVillager(w);
    applyCommand(w, { tick: 0, type: "hold", unitIds: [v.id] }, 0);
    expect(v.orders?.[0]?.type).toBe("hold");
    expect(v.path).toEqual([]);
  });
});
