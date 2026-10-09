import { describe, expect, it } from "vitest";
import { applyCommand } from "@sim/commands";
import { UNIT_DEFS, unitDef } from "@sim/train";
import { stepTick } from "@sim/tick";
import { createWorld } from "@sim/world";
import type { Entity, MatchConfig, World } from "@sim/types";

const config: MatchConfig = {
  seed: 77,
  civ: "english",
  map: "steppes",
  size: "small",
  bots: [],
  victory: "landmarks",
  gameSpeed: 1,
};

function townCenter(w: World): Entity {
  const tc = w.entities.find((e) => e.type === "town-center" && e.owner === 0);
  if (!tc) throw new Error("sem TC");
  return tc;
}

/** Quantidade de unidades de um tipo do jogador 0. */
function countUnits(w: World, type: string): number {
  return w.entities.filter((e) => e.kind === "unit" && e.owner === 0 && e.type === type).length;
}

/** Adiciona um edifício concluído de um tipo para o jogador 0 (fixture de teste). */
function addBuilt(w: World, type: string, x: number, z: number): Entity {
  const b: Entity = {
    id: w.nextId++,
    kind: "building",
    type,
    owner: 0,
    x,
    z,
    y: 0,
    hp: 1500,
    maxHp: 1500,
    facing: 0,
    built: true,
    training: [],
    dropOff: [],
  };
  w.entities.push(b);
  return b;
}

describe("UNIT_DEFS (dataset)", () => {
  it("villager: 50 comida, 20 s, 50 HP, produzido no centro da cidade", () => {
    const v = unitDef("villager");
    expect(v.cost).toEqual({ food: 50, wood: 0, gold: 0, stone: 0 });
    expect(v.time).toBe(20);
    expect(v.hp).toBe(50);
    expect(v.producedBy).toContain("town-center");
  });

  it("spearman: 60 comida / 20 madeira, produzido no quartel", () => {
    const s = unitDef("spearman");
    expect(s.cost).toEqual({ food: 60, wood: 20, gold: 0, stone: 0 });
    expect(s.producedBy).toContain("barracks");
  });

  it("todas as unidades do milestone existem e têm produtor", () => {
    for (const id of ["villager", "spearman", "man-at-arms", "archer", "crossbowman", "arbaletrier", "horseman", "knight", "royal-knight", "scout", "mangonel", "monk", "longbowman"]) {
      expect(UNIT_DEFS[id], id).toBeDefined();
      expect(unitDef(id).producedBy.length, id).toBeGreaterThan(0);
    }
  });

  it("unitDef lança erro para id desconhecido", () => {
    expect(() => unitDef("nao-existe")).toThrow(/desconhecida/);
  });
});

describe("treino (train)", () => {
  it("TC treina villager (50 comida, 20 s): após 200 ticks existe 1 aldeão novo e pop sobe", () => {
    const w = createWorld(config);
    const tc = townCenter(w);
    const player = w.players[0];
    if (!player) throw new Error("sem jogador");
    const vill0 = countUnits(w, "villager");
    const food0 = player.resources.food;
    const pop0 = player.pop;

    applyCommand(w, { tick: 0, type: "train", unitIds: [tc.id], buildingType: "villager", queue: false }, 0);
    expect(player.resources.food).toBe(food0 - 50);

    for (let i = 0; i < 200; i++) stepTick(w);

    expect(countUnits(w, "villager")).toBe(vill0 + 1);
    expect(player.pop).toBe(pop0 + 1);
    expect(tc.training?.length).toBe(0);
  });

  it("villager não sai antes de 20 s (200 ticks)", () => {
    const w = createWorld(config);
    const tc = townCenter(w);
    const vill0 = countUnits(w, "villager");
    applyCommand(w, { tick: 0, type: "train", unitIds: [tc.id], buildingType: "villager", queue: false }, 0);
    for (let i = 0; i < 199; i++) stepTick(w);
    expect(countUnits(w, "villager")).toBe(vill0);
  });

  it("barracks treina spearman (60 comida, 20 madeira)", () => {
    const w = createWorld(config);
    const player = w.players[0];
    if (!player) throw new Error("sem jogador");
    const barracks = addBuilt(w, "barracks", townCenter(w).x + 6, townCenter(w).z);
    const food0 = player.resources.food;
    const wood0 = player.resources.wood;
    const sp0 = countUnits(w, "spearman");

    applyCommand(w, { tick: 0, type: "train", unitIds: [barracks.id], buildingType: "spearman", queue: false }, 0);
    expect(player.resources.food).toBe(food0 - 60);
    expect(player.resources.wood).toBe(wood0 - 20);

    // 15 s = 150 ticks (dataset spearman-2 EN).
    for (let i = 0; i < 150; i++) stepTick(w);
    expect(countUnits(w, "spearman")).toBe(sp0 + 1);
  });

  it("recursos insuficientes: não enfileira e não debita", () => {
    const w = createWorld(config);
    const tc = townCenter(w);
    const player = w.players[0];
    if (!player) throw new Error("sem jogador");
    player.resources.food = 10;
    applyCommand(w, { tick: 0, type: "train", unitIds: [tc.id], buildingType: "villager", queue: false }, 0);
    expect(tc.training?.length).toBe(0);
    expect(player.resources.food).toBe(10);
  });

  it("edifício errado para a unidade (quartel não treina aldeão): ignora", () => {
    const w = createWorld(config);
    const barracks = addBuilt(w, "barracks", townCenter(w).x + 6, townCenter(w).z);
    const player = w.players[0];
    if (!player) throw new Error("sem jogador");
    const food0 = player.resources.food;
    applyCommand(w, { tick: 0, type: "train", unitIds: [barracks.id], buildingType: "villager", queue: false }, 0);
    expect(barracks.training?.length).toBe(0);
    expect(player.resources.food).toBe(food0);
  });

  it("fila máxima de 5: o 6º item é ignorado (e não é debitado)", () => {
    const w = createWorld(config);
    const tc = townCenter(w);
    const player = w.players[0];
    if (!player) throw new Error("sem jogador");
    player.resources.food = 10_000;
    for (let i = 0; i < 6; i++) {
      applyCommand(w, { tick: 0, type: "train", unitIds: [tc.id], buildingType: "villager", queue: false }, 0);
    }
    expect(tc.training?.length).toBe(5);
    expect(player.resources.food).toBe(10_000 - 5 * 50);
  });

  it("rally: unidade treinada recebe ordem de movimento até o ponto de encontro", () => {
    const w = createWorld(config);
    const tc = townCenter(w);
    applyCommand(w, { tick: 0, type: "setRally", unitIds: [], entityId: tc.id, x: tc.x + 10, z: tc.z }, 0);
    applyCommand(w, { tick: 0, type: "train", unitIds: [tc.id], buildingType: "villager", queue: false }, 0);
    const vill0 = countUnits(w, "villager");
    for (let i = 0; i < 200; i++) stepTick(w);
    const nova = w.entities.filter((e) => e.kind === "unit" && e.owner === 0 && e.type === "villager").at(-1);
    expect(countUnits(w, "villager")).toBe(vill0 + 1);
    expect(nova?.orders?.[0]?.type).toBe("move");
    expect(nova?.path?.length ?? 0).toBeGreaterThan(0);
  });
});
