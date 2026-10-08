import { describe, expect, it } from "vitest";
import { findPath, hasLineOfWalk } from "@sim/pathfinding";
import type { MapData } from "@sim/types";

/** Mapa plano 10x10 com tile=2 (mundo 20x20), sem bloqueios. */
function flatMap(w = 10, h = 10): MapData {
  return {
    w,
    h,
    tile: 2,
    heights: new Array<number>(w * h).fill(0.5),
    biome: new Array<number>(w * h).fill(0),
    blocked: new Array<boolean>(w * h).fill(false),
    resourceAt: new Array<number>(w * h).fill(-1),
    resources: [],
    spawns: [],
    maxHeight: 6,
  };
}

/** Centro de mundo do tile (tx,tz). */
const c = (t: number): number => t * 2 + 1;

describe("pathfinding", () => {
  it("linha reta sem bloqueio: caminho curto e sem desvio", () => {
    const m = flatMap();
    const path = findPath(m, c(1), c(1), c(8), c(1));
    expect(path.length).toBeGreaterThan(0);
    const last = path[path.length - 1];
    expect(last?.x).toBeCloseTo(c(8), 5);
    expect(last?.z).toBeCloseTo(c(1), 5);
    // Em linha reta o string pulling deve reduzir a um único waypoint final.
    expect(path.length).toBe(1);
  });

  it("contorna um muro de bloqueio", () => {
    const m = flatMap();
    // Muro vertical em x=5 cobrindo z=0..8; passagem apenas em z=9.
    for (let z = 0; z <= 8; z++) m.blocked[z * m.w + 5] = true;
    const path = findPath(m, c(1), c(1), c(8), c(1));
    expect(path.length).toBeGreaterThan(1);
    // Nenhum waypoint pode estar dentro de tile bloqueado.
    for (const p of path) {
      const tx = Math.floor(p.x / m.tile);
      const tz = Math.floor(p.z / m.tile);
      expect(m.blocked[tz * m.w + tx]).toBe(false);
    }
    // O caminho precisa descer até a passagem (z >= 9 em tiles) para cruzar o muro.
    expect(Math.max(...path.map((p) => p.z))).toBeGreaterThan(c(8));
  });

  it("destino bloqueado devolve []", () => {
    const m = flatMap();
    m.blocked[3 * m.w + 3] = true;
    expect(findPath(m, c(0), c(0), c(3), c(3))).toEqual([]);
  });

  it("destino inalcancavel (cercado) devolve []", () => {
    const m = flatMap();
    // Cerca o tile (5,5) por todos os lados (inclusive diagonais).
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dz === 0) continue;
        m.blocked[(5 + dz) * m.w + (5 + dx)] = true;
      }
    }
    expect(findPath(m, c(0), c(0), c(5), c(5))).toEqual([]);
  });

  it("nao corta diagonal entre dois tiles bloqueados", () => {
    const m = flatMap();
    // Tiles (4,5) e (5,4) bloqueados: a diagonal (4,4)->(5,5) atravessa o canto.
    m.blocked[5 * m.w + 4] = true;
    m.blocked[4 * m.w + 5] = true;
    const path = findPath(m, c(4), c(4), c(5), c(5));
    // Precisa dar a volta; caminho direto de 1 passo seria proibido.
    expect(path.length).toBeGreaterThan(1);
  });

  it("hasLineOfWalk e verdadeiro em campo livre e falso atras de muro", () => {
    const m = flatMap();
    expect(hasLineOfWalk(m, c(0), c(0), c(9), c(9))).toBe(true);
    for (let z = 0; z < 10; z++) m.blocked[z * m.w + 5] = true;
    expect(hasLineOfWalk(m, c(1), c(1), c(8), c(1))).toBe(false);
  });

  it("inicio == fim devolve []", () => {
    expect(findPath(flatMap(), c(2), c(2), c(2), c(2))).toEqual([]);
  });
});
