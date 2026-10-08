import { describe, expect, it } from "vitest";
import { queryUnits, selectSameType, unitsAtPoint } from "@sim/selection";
import { createWorld } from "@sim/world";
import type { MatchConfig } from "@sim/types";

const config: MatchConfig = {
  seed: 9,
  civ: "english",
  map: "valley",
  size: "small",
  bots: [{ difficulty: "medium" }],
  victory: "landmarks",
  gameSpeed: 1,
};

describe("selection (queries de mundo)", () => {
  it("queryUnits pega so unidades do jogador dentro do retangulo", () => {
    const w = createWorld(config);
    const mine = w.entities.filter((e) => e.kind === "unit" && e.owner === 0);
    // Retangulo que cobre o mapa inteiro: deve pegar todas as unidades do jogador 0.
    const ids = queryUnits(w, { x0: -1e6, z0: -1e6, x1: 1e6, z1: 1e6 }, 0);
    expect(ids.sort()).toEqual(mine.map((e) => e.id).sort());
    for (const id of ids) {
      expect(w.entities.find((e) => e.id === id)?.owner).toBe(0);
    }
  });

  it("queryUnits aceita retangulo com cantos invertidos", () => {
    const w = createWorld(config);
    const v = w.entities.find((e) => e.type === "villager" && e.owner === 0);
    expect(v).toBeDefined();
    if (!v) return;
    const ids = queryUnits(w, { x0: v.x + 1, z0: v.z + 1, x1: v.x - 1, z1: v.z - 1 }, 0);
    expect(ids).toContain(v.id);
  });

  it("unitsAtPoint respeita o raio e o dono", () => {
    const w = createWorld(config);
    const v = w.entities.find((e) => e.type === "villager" && e.owner === 0);
    if (!v) throw new Error("sem aldeao");
    expect(unitsAtPoint(w, v.x, v.z, 0.5, 0)).toContain(v.id);
    expect(unitsAtPoint(w, v.x, v.z, 0.5, 1)).not.toContain(v.id);
  });

  it("selectSameType (duplo clique) expande para todos do mesmo tipo do jogador", () => {
    const w = createWorld(config);
    const v = w.entities.find((e) => e.type === "villager" && e.owner === 0);
    if (!v) throw new Error("sem aldeao");
    const ids = selectSameType(w, [v.id]);
    const villagers = w.entities.filter((e) => e.type === "villager" && e.owner === 0);
    expect(ids.sort()).toEqual(villagers.map((e) => e.id).sort());
    // Nao inclui batedores nem aldeoes do bot.
    for (const id of ids) {
      const e = w.entities.find((c) => c.id === id);
      expect(e?.type).toBe("villager");
      expect(e?.owner).toBe(0);
    }
  });

  it("selectSameType com lista vazia ou sem unidades devolve []", () => {
    const w = createWorld(config);
    expect(selectSameType(w, [])).toEqual([]);
    const tc = w.entities.find((e) => e.type === "town-center");
    expect(selectSameType(w, tc ? [tc.id] : [])).toEqual([]);
  });
});
