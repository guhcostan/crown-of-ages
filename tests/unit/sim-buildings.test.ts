import { describe, expect, it } from "vitest";
import { BUILDINGS, buildingDef } from "@sim/buildings";

describe("buildingDef (dataset)", () => {
  it("house: 50 madeira, 15 s, 750 HP, +10 população", () => {
    const h = buildingDef("house");
    expect(h.cost).toEqual({ food: 0, wood: 50, gold: 0, stone: 0 });
    expect(h.buildTime).toBe(15);
    expect(h.hp).toBe(750);
    expect(h.providesPop).toBe(10);
  });

  it("farm: 37 madeira (EN), 6 s, 300 HP, sem população", () => {
    const f = buildingDef("farm");
    expect(f.cost.wood).toBe(37);
    expect(f.buildTime).toBe(6);
    expect(f.hp).toBe(300);
    expect(f.providesPop).toBe(0);
  });

  it("town-center existe: 400 madeira, 300 pedra, 150 s, 2500 HP, drop-off de tudo", () => {
    const tc = buildingDef("town-center");
    expect(tc.cost).toEqual({ food: 0, wood: 400, gold: 0, stone: 300 });
    expect(tc.buildTime).toBe(150);
    expect(tc.hp).toBe(2500);
    expect([...tc.dropOff].sort()).toEqual(["food", "gold", "stone", "wood"]);
    expect(tc.produces).toContain("villager");
  });

  it("drop-offs: mill=comida, lumber-camp=madeira, mining-camp=ouro+pedra", () => {
    expect(buildingDef("mill").dropOff).toEqual(["food"]);
    expect(buildingDef("lumber-camp").dropOff).toEqual(["wood"]);
    expect([...buildingDef("mining-camp").dropOff].sort()).toEqual(["gold", "stone"]);
  });

  it("wonder: 5000 de cada recurso, 600 s, 5000 HP (dataset)", () => {
    const w = buildingDef("wonder");
    expect(w.cost).toEqual({ food: 5000, wood: 5000, gold: 5000, stone: 5000 });
    expect(w.buildTime).toBe(600);
    expect(w.hp).toBe(5000);
  });

  it("buildingDef lança erro para id desconhecido", () => {
    expect(() => buildingDef("nao-existe")).toThrow(/desconhecida/);
  });
});

describe("landmarks", () => {
  const landmarks = Object.values(BUILDINGS).filter((b) => b.isLandmark);

  it("6 landmarks por civilização (3 eras x 2)", () => {
    for (const civ of ["english", "french"] as const) {
      expect(landmarks.filter((b) => b.civ === civ).length).toBe(6);
    }
  });

  it("2 landmarks por era 1, 2 e 3 em cada civilização (era do dataset)", () => {
    for (const civ of ["english", "french"] as const) {
      for (const age of [1, 2, 3]) {
        const n = landmarks.filter((b) => b.civ === civ && b.age === age).length;
        expect(n, `${civ} era ${age}`).toBe(2);
      }
    }
  });

  it("landmarks têm custo e HP do dataset (ex.: Kings Palace 1200 F / 600 G, 5000 HP)", () => {
    const kp = buildingDef("kings-palace");
    expect(kp.cost).toEqual({ food: 1200, wood: 0, gold: 600, stone: 0 });
    expect(kp.hp).toBe(5000);
    expect(kp.isLandmark).toBe(true);
    expect(kp.civ).toBe("english");
  });

  it("King's Palace produz villagers; The White Tower produz tropas", () => {
    expect(buildingDef("kings-palace").produces).toContain("villager");
    expect(buildingDef("the-white-tower").produces.length).toBeGreaterThan(3);
  });
});
