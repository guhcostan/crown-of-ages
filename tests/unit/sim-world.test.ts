import { describe, expect, it } from "vitest";
import { createWorld } from "@sim/world";
import { stableStringify } from "@sim/serialize";
import type { MatchConfig } from "@sim/types";

const config: MatchConfig = {
  seed: 314,
  civ: "english",
  map: "valley",
  size: "small",
  bots: [{ difficulty: "easy" }],
  victory: "landmarks",
  gameSpeed: 1,
};

describe("createWorld", () => {
  it("cria 1 humano + 1 bot com centro da cidade, 3 aldeoes e 1 batedor cada", () => {
    const w = createWorld(config);
    expect(w.players.length).toBe(2);
    for (const p of w.players) {
      const mine = w.entities.filter((e) => e.owner === p.id);
      const tc = mine.filter((e) => e.type === "town-center");
      const vill = mine.filter((e) => e.type === "villager");
      const scout = mine.filter((e) => e.type === "scout");
      expect(tc.length).toBe(1);
      expect(tc[0]?.built).toBe(true);
      expect(vill.length).toBe(3);
      expect(scout.length).toBe(1);
    }
  });

  it("usa stats do dataset: villager hp 50 / speed 1.125 / sight 28; scout hp 110", () => {
    const w = createWorld(config);
    const v = w.entities.find((e) => e.type === "villager");
    const s = w.entities.find((e) => e.type === "scout");
    expect(v?.hp).toBe(50);
    expect(v?.movementSpeed).toBe(1.125);
    expect(v?.sight).toBe(28);
    expect(s?.hp).toBe(110);
    expect(s?.movementSpeed).toBe(1.625);
  });

  it("recursos iniciais e populacao conforme o brief", () => {
    const w = createWorld(config);
    for (const p of w.players) {
      expect(p.resources).toEqual({ food: 200, wood: 200, gold: 100, stone: 100 });
      expect(p.pop).toBe(4);
      expect(p.popCap).toBe(10);
      expect(p.age).toBe(1);
      expect(p.defeated).toBe(false);
    }
  });

  it("ids sao unicos", () => {
    const w = createWorld(config);
    const ids = w.entities.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("visibilidade inicial marca tiles ao redor das entidades e tem tamanho w*h", () => {
    const w = createWorld(config);
    expect(w.visibility.length).toBe(w.players.length);
    for (const vis of w.visibility) {
      expect(vis.length).toBe(w.map.w * w.map.h);
      expect(vis.some((v) => v === 2)).toBe(true);
    }
  });

  it("estado e JSON valido e round-trip preserva o mundo", () => {
    const w = createWorld(config);
    const json = JSON.stringify(w);
    const back = JSON.parse(json) as typeof w;
    expect(stableStringify(back)).toBe(stableStringify(w));
    expect(victoryIsPlaying(w)).toBe(true);
  });
});

function victoryIsPlaying(w: { victory: { kind: string } }): boolean {
  return w.victory.kind === "playing";
}
