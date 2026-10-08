import { describe, expect, it } from "vitest";
import { generateMap, heightAt, tileIndexAt } from "@sim/map";
import { findPath } from "@sim/pathfinding";
import { stableStringify } from "@sim/serialize";
import type { MapPresetId, MapSize } from "@sim/types";

const PRESETS: MapPresetId[] = ["highlands", "valley", "steppes"];
const SIZES: MapSize[] = ["small", "medium", "large"];

describe("generateMap", () => {
  it("mesma seed, preset e tamanho geram JSON identico", () => {
    for (const preset of PRESETS) {
      const a = generateMap(12345, preset, "small");
      const b = generateMap(12345, preset, "small");
      expect(stableStringify(a)).toBe(stableStringify(b));
    }
  });

  it("seeds diferentes geram mapas diferentes", () => {
    const a = generateMap(1, "valley", "small");
    const b = generateMap(2, "valley", "small");
    expect(stableStringify(a)).not.toBe(stableStringify(b));
  });

  it("dimensoes batem com MAP_SIZES e arrays tem tamanho w*h", () => {
    for (const size of SIZES) {
      const m = generateMap(7, "steppes", size);
      expect(m.heights.length).toBe(m.w * m.h);
      expect(m.biome.length).toBe(m.w * m.h);
      expect(m.blocked.length).toBe(m.w * m.h);
      expect(m.resourceAt.length).toBe(m.w * m.h);
    }
  });

  it("alturas ficam em 0..1 e biomas em 0..4", () => {
    const m = generateMap(99, "highlands", "medium");
    for (const h of m.heights) {
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(1);
    }
    for (const b of m.biome) {
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(4);
    }
    expect(m.maxHeight).toBe(6);
    expect(m.tile).toBe(2);
  });

  it("gera recursos e cada recurso tem quantidade positiva", () => {
    const m = generateMap(5, "valley", "medium");
    expect(m.resources.length).toBeGreaterThan(0);
    for (const r of m.resources) {
      expect(r.amount).toBeGreaterThan(0);
      expect(r.amount).toBe(r.max);
    }
    const kinds = new Set(m.resources.map((r) => r.kind));
    expect(kinds.has("gold-mine")).toBe(true);
    expect(kinds.has("stone-mine")).toBe(true);
    expect(kinds.has("tree")).toBe(true);
  });

  it("indice resourceAt aponta para recursos existentes", () => {
    const m = generateMap(5, "valley", "small");
    m.resourceAt.forEach((id, i) => {
      if (id === -1) return;
      const res = m.resources[id];
      expect(res).toBeDefined();
      const tx = i % m.w;
      const tz = Math.floor(i / m.w);
      expect(tileIndexAt(m, (tx + 0.5) * m.tile, (tz + 0.5) * m.tile)).toBe(i);
    });
  });

  it("tem pelo menos 2 spawns distantes (> 40% da diagonal) e tiles solidos", () => {
    for (const preset of PRESETS) {
      const m = generateMap(2024, preset, "small");
      expect(m.spawns.length).toBeGreaterThanOrEqual(2);
      const diag = Math.hypot(m.w * m.tile, m.h * m.tile);
      let maxD = 0;
      for (const a of m.spawns) {
        for (const b of m.spawns) {
          maxD = Math.max(maxD, Math.hypot(a.x - b.x, a.z - b.z));
        }
      }
      expect(maxD).toBeGreaterThan(0.4 * diag);
      for (const s of m.spawns) {
        const i = tileIndexAt(m, s.x, s.z);
        expect(i).toBeGreaterThanOrEqual(0);
        expect(m.blocked[i]).toBe(false);
        expect(heightAt(m, s.x, s.z)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("findPath entre spawns nao e vazio", () => {
    const m = generateMap(2024, "valley", "small");
    const a = m.spawns[0];
    const b = m.spawns[1];
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    if (!a || !b) return;
    expect(findPath(m, a.x, a.z, b.x, b.z).length).toBeGreaterThan(0);
  });
});
