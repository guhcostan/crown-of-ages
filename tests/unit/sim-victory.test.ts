import { describe, expect, it } from "vitest";
import { createWorld } from "@sim/world";
import { hasAnyLandmark, stepVictory } from "@sim/victory";
import { syncAges } from "@sim/ages";
import type { Entity, MatchConfig, World } from "@sim/types";

const baseConfig: MatchConfig = {
  seed: 314,
  civ: "english",
  map: "valley",
  size: "small",
  bots: [{ difficulty: "easy" }],
  victory: "landmarks",
  gameSpeed: 1,
};

/** Cria mundo com 2 jogadores (humano 0 + bot 1) e o modo de vitória pedido. */
function makeWorld(victory: MatchConfig["victory"] = "landmarks"): World {
  return createWorld({ ...baseConfig, victory });
}

/** Adiciona um edifício concluído (built) para o jogador. */
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

/** Remove todas as entidades de um jogador que matam a sobrevivência (unidades e TC). */
function stripTownCentersAndUnits(world: World, owner: number): void {
  world.entities = world.entities.filter(
    (e) => !(e.owner === owner && (e.kind === "unit" || e.type === "town-center")),
  );
}

/** Remove todos os landmarks/maravilhas de um jogador (ou os marca como hp 0). */
function killLandmarks(world: World, owner: number): void {
  for (const e of world.entities) {
    if (e.owner === owner && e.kind === "building" && (e.type === "council-hall" || e.type === "abbey-of-kings")) {
      e.hp = 0;
    }
  }
}

/** Jogador com era 2 (landmark de era 2) e sem a Torre do Centro. */
function setupAgeTwo(world: World, owner: number): void {
  addBuilt(world, "council-hall", owner);
}

describe("stepVictory — modo landmarks", () => {
  it("bot com era 2 que perde o landmark é derrotado; o humano vence", () => {
    const w = makeWorld("landmarks");
    setupAgeTwo(w, 0);
    setupAgeTwo(w, 1);
    syncAges(w); // era 2 registrada enquanto o landmark existia
    killLandmarks(w, 1);
    stepVictory(w);
    expect(w.players[1]?.defeated).toBe(true);
    expect(w.victory).toEqual({ kind: "victory", player: 0, reason: "landmarks" });
  });

  it("humano com era 2 que perde o landmark é derrotado (derrota)", () => {
    const w = makeWorld("landmarks");
    setupAgeTwo(w, 0);
    setupAgeTwo(w, 1);
    syncAges(w);
    killLandmarks(w, 0);
    stepVictory(w);
    expect(w.players[0]?.defeated).toBe(true);
    expect(w.victory).toEqual({ kind: "defeat" });
  });

  it("era 1 sem landmark NÃO é derrotado pela regra de landmark", () => {
    const w = makeWorld("landmarks");
    setupAgeTwo(w, 1);
    stepVictory(w);
    expect(w.players[0]?.defeated).toBe(false);
    expect(w.victory.kind).toBe("playing");
  });

  it("quando todos são derrotados no mesmo tick => defeat", () => {
    const w = makeWorld("landmarks");
    setupAgeTwo(w, 0);
    setupAgeTwo(w, 1);
    syncAges(w); // era 2 registrada enquanto o landmark existia
    killLandmarks(w, 0);
    killLandmarks(w, 1);
    stepVictory(w);
    expect(w.victory).toEqual({ kind: "defeat" });
  });
});

describe("stepVictory — modo wonder", () => {
  it("maravilha concluída dá vitória imediata (reason wonder)", () => {
    const w = makeWorld("wonder");
    addBuilt(w, "wonder", 1);
    stepVictory(w);
    expect(w.victory).toEqual({ kind: "victory", player: 1, reason: "wonder" });
  });
});

describe("stepVictory — sacred-sites", () => {
  it("usa fallback para landmarks: bot com era 2 sem landmark é derrotado", () => {
    const w = makeWorld("sacred-sites");
    setupAgeTwo(w, 0);
    setupAgeTwo(w, 1);
    syncAges(w);
    killLandmarks(w, 1);
    stepVictory(w);
    expect(w.players[1]?.defeated).toBe(true);
    expect(w.victory).toEqual({ kind: "victory", player: 0, reason: "sacred-sites" });
  });
});

describe("stepVictory — derrota humana e eliminação", () => {
  it("jogador 0 sem unidades e sem centro da cidade => defeat", () => {
    const w = makeWorld("landmarks");
    stripTownCentersAndUnits(w, 0);
    stepVictory(w);
    expect(w.players[0]?.defeated).toBe(true);
    expect(w.victory).toEqual({ kind: "defeat" });
  });

  it("jogador sem unidades/TC/landmark é derrotado em qualquer modo (wonder)", () => {
    const w = makeWorld("wonder");
    stripTownCentersAndUnits(w, 1);
    stepVictory(w);
    expect(w.players[1]?.defeated).toBe(true);
    // Sobrou só o jogador 0 não derrotado: vence, com o motivo do modo wonder.
    expect(w.victory).toEqual({ kind: "victory", player: 0, reason: "wonder" });
  });
});

describe("stepVictory — idempotência", () => {
  it("tick repetido não altera victory já definido", () => {
    const w = makeWorld("landmarks");
    setupAgeTwo(w, 0);
    setupAgeTwo(w, 1);
    syncAges(w); // era 2 registrada enquanto o landmark existia
    killLandmarks(w, 0);
    stepVictory(w);
    const first = JSON.stringify(w.victory);
    stepVictory(w);
    stepVictory(w);
    expect(JSON.stringify(w.victory)).toBe(first);
  });
});

describe("hasAnyLandmark", () => {
  it("true com landmark concluído e false sem", () => {
    const w = makeWorld("landmarks");
    expect(hasAnyLandmark(w, 0)).toBe(false);
    addBuilt(w, "council-hall", 0);
    expect(hasAnyLandmark(w, 0)).toBe(true);
  });
});
