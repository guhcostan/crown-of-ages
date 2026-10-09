import { describe, expect, it } from "vitest";
import { createWorld } from "@sim/world";
import { BUILDINGS } from "@sim/buildings";
import { canBuildLandmark, landmarkChoices, playerAge, syncAges } from "@sim/ages";
import type { Entity, MatchConfig, World } from "@sim/types";

const config: MatchConfig = {
  seed: 314,
  civ: "english",
  map: "valley",
  size: "small",
  bots: [{ difficulty: "easy" }],
  victory: "landmarks",
  gameSpeed: 1,
};

/** Adiciona um edifício concluído do tipo dado para o jogador. */
function addBuilt(world: World, type: string, owner: number): Entity {
  const e: Entity = {
    id: world.nextId++,
    kind: "building",
    type,
    owner,
    x: 0,
    z: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    facing: 0,
    built: true,
  };
  world.entities.push(e);
  return e;
}

describe("playerAge", () => {
  it("sem landmark a era é 1", () => {
    const w = createWorld(config);
    expect(playerAge(w, 0)).toBe(1);
  });

  it("landmark de era 2 (council-hall, construido na era 1) leva a era a 2", () => {
    const w = createWorld(config);
    addBuilt(w, "council-hall", 0);
    expect(playerAge(w, 0)).toBe(2);
  });

  it("landmark de era 3 (kings-palace, construido na era 2) leva a era a 3", () => {
    const w = createWorld(config);
    addBuilt(w, "kings-palace", 0);
    expect(playerAge(w, 0)).toBe(3);
  });

  it("landmark de era 4 (berkshire-palace, construido na era 3) leva a era a 4", () => {
    const w = createWorld(config);
    addBuilt(w, "berkshire-palace", 0);
    expect(playerAge(w, 0)).toBe(4);
  });

  it("maravilha (era 4) leva a era a 4", () => {
    const w = createWorld(config);
    addBuilt(w, "wonder", 0);
    expect(playerAge(w, 0)).toBe(4);
  });

  it("ignora landmark ainda não construído e de outro jogador", () => {
    const w = createWorld(config);
    const lm = addBuilt(w, "council-hall", 0);
    lm.built = false;
    addBuilt(w, "kings-palace", 1);
    expect(playerAge(w, 0)).toBe(1);
  });
});

describe("landmarkChoices", () => {
  it("devolve 2 ids da civ do jogador para a era seguinte, ordenados", () => {
    const w = createWorld(config);
    const choices = landmarkChoices(w, 0);
    expect(choices.length).toBe(2);
    expect(choices).toEqual([...choices].sort());
    for (const id of choices) {
      expect(BUILDINGS[id]?.civ).toBe("english");
      // def.age dos landmarks = era de CONSTRUCAO (1 = Idade das Trevas -> concede era 2).
      expect(BUILDINGS[id]?.age).toBe(1);
    }
  });

  it("era 4 não tem escolhas", () => {
    const w = createWorld(config);
    addBuilt(w, "wonder", 0);
    expect(landmarkChoices(w, 0)).toEqual([]);
  });
});

describe("canBuildLandmark", () => {
  it("true com recursos suficientes para landmark da próxima era", () => {
    const w = createWorld(config);
    const p = w.players[0];
    if (!p) throw new Error("jogador 0 ausente");
    p.resources = { food: 400, wood: 0, gold: 200, stone: 0 };
    expect(canBuildLandmark(w, 0, "council-hall")).toBe(true);
  });

  it("false sem recursos suficientes", () => {
    const w = createWorld(config);
    const p = w.players[0];
    if (!p) throw new Error("jogador 0 ausente");
    p.resources = { food: 399, wood: 0, gold: 200, stone: 0 };
    expect(canBuildLandmark(w, 0, "council-hall")).toBe(false);
  });

  it("false para landmark de outra era", () => {
    const w = createWorld(config);
    const p = w.players[0];
    if (!p) throw new Error("jogador 0 ausente");
    p.resources = { food: 9999, wood: 9999, gold: 9999, stone: 9999 };
    expect(canBuildLandmark(w, 0, "berkshire-palace")).toBe(false);
    expect(canBuildLandmark(w, 0, "kings-palace")).toBe(false);
  });

  it("false para landmark de outra civilização", () => {
    const w = createWorld(config);
    const p = w.players[0];
    if (!p) throw new Error("jogador 0 ausente");
    p.resources = { food: 9999, wood: 9999, gold: 9999, stone: 9999 };
    expect(canBuildLandmark(w, 0, "red-palace")).toBe(false);
  });
});

describe("syncAges", () => {
  it("reflete a era derivada em players.age", () => {
    const w = createWorld(config);
    addBuilt(w, "council-hall", 0);
    syncAges(w);
    expect(w.players[0]?.age).toBe(2);
    expect(w.players[1]?.age).toBe(1);
  });
});
