/**
 * map.ts — geração determinística de mapas (heightmap, biomas, recursos, spawns).
 *
 * Tudo sai de uma única instância `createRng(seed)`: mesma seed + mesmo preset + mesmo
 * tamanho ⇒ mesmo MapData (testado por stableStringify). Sem Math/Date (lint).
 */

import { createRng } from "./rng";
import { MAP_SIZES } from "./types";
import type { MapData, MapPresetId, MapResource, MapSize, ResSubKind, Rng, SpawnPoint } from "./types";

/** Altura máxima do relevo em unidades de mundo (contrato: maxHeight=6). */
const MAX_HEIGHT = 6;
/** Tamanho do tile em unidades de mundo (contrato: tile=2). */
const TILE = 2;
/** Água: heights < 0.12 (ver brief/ARCHITECTURE). */
const WATER_LEVEL = 0.12;
/** Penhasco: média 3x3 > 0.92 (ver brief). */
const CLIFF_LEVEL = 0.92;
/** Raio (em tiles) da área plana ao redor de cada spawn. */
const SPAWN_FLAT_RADIUS = 4;
/** Número fixo de cantos de spawn gerados. world.ts usa os primeiros 1 + bots.length. */
const SPAWN_COUNT = 4;

/**
 * Quantidades de recurso (plano da fase 1 — brief de simulação; fonte: docs/SPEC.md §6).
 * Árvore: 120 madeira por árvore. Mina de ouro 900, pedra 500. Arbusto de fruta 125 comida.
 * Ovelha 100, cervo 140, javali 200 comida.
 */
const AMOUNT: Record<ResSubKind, number> = {
  tree: 120,
  "gold-mine": 900,
  "stone-mine": 500,
  berry: 125,
  sheep: 100,
  deer: 140,
  boar: 200,
};

/** Parâmetros de cada preset (rugosidade, bioma). */
interface PresetParams {
  forestMoisture: number;
  dryMoisture: number;
}

const PRESETS: Record<MapPresetId, PresetParams> = {
  highlands: { forestMoisture: 0.6, dryMoisture: 0.3 },
  valley: { forestMoisture: 0.55, dryMoisture: 0.3 },
  steppes: { forestMoisture: 0.72, dryMoisture: 0.42 },
};

/** Limita v ao intervalo [lo, hi]. */
function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Quadrado da distância entre dois pontos em tiles. */
function dist2(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
}

/** Ruído de valor bilinear suavizado sobre uma grade de lattice; u,v em [0,1). */
function valueNoise(lattice: number[], cells: number, u: number, v: number): number {
  const gx = u * cells;
  const gz = v * cells;
  const ix = Math.floor(gx);
  const iz = Math.floor(gz);
  const fx = gx - ix;
  const fz = gz - iz;
  const sx = fx * fx * (3 - 2 * fx);
  const sz = fz * fz * (3 - 2 * fz);
  const stride = cells + 1;
  const a = lattice[iz * stride + ix] ?? 0;
  const b = lattice[iz * stride + ix + 1] ?? 0;
  const c = lattice[(iz + 1) * stride + ix] ?? 0;
  const d = lattice[(iz + 1) * stride + ix + 1] ?? 0;
  const top = a + (b - a) * sx;
  const bottom = c + (d - c) * sx;
  return top + (bottom - top) * sz;
}

/** Gera uma lattice (cells+1)^2 de valores aleatórios do RNG da partida. */
function makeLattice(rng: Rng, cells: number): number[] {
  const count = (cells + 1) * (cells + 1);
  const lattice: number[] = [];
  for (let i = 0; i < count; i++) lattice.push(rng.next());
  return lattice;
}

/**
 * Campo fractal (fBm) normalizado para [0,1].
 * Três oitavas (cells base, 2x, 4x) com pesos fixos.
 */
function fractalField(rng: Rng, w: number, h: number, baseCells: number): number[] {
  const weights = [0.55, 0.3, 0.15];
  const lattices = weights.map((_, k) => makeLattice(rng, baseCells << k));
  const field: number[] = new Array<number>(w * h).fill(0);
  let min = Infinity;
  let max = -Infinity;
  for (let z = 0; z < h; z++) {
    for (let x = 0; x < w; x++) {
      const u = (x + 0.5) / w;
      const v = (z + 0.5) / h;
      let value = 0;
      for (let k = 0; k < weights.length; k++) {
        const lat = lattices[k] ?? [];
        value += (weights[k] ?? 0) * valueNoise(lat, baseCells << k, u, v);
      }
      field[z * w + x] = value;
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  const span = max - min > 0 ? max - min : 1;
  for (let i = 0; i < field.length; i++) {
    field[i] = ((field[i] ?? 0) - min) / span;
  }
  return field;
}

/**
 * Gera o mapa completo. Ordem das etapas (cada uma consome o RNG em ordem fixa):
 * 1) relevo base + umidade; 2) ajuste por preset (rio no valley); 3) água/penhasco;
 * 4) biomas; 5) spawns em cantos com área plana; 6) corredores de conexão;
 * 7) recursos (minas, árvores, arbustos, ovelhas, cervos, javalis).
 */
export function generateMap(seed: number, preset: MapPresetId, size: MapSize): MapData {
  const { w, h } = MAP_SIZES[size];
  const params = PRESETS[preset];
  const rng = createRng(seed);
  const n = w * h;

  // 1) Relevo e umidade.
  const base = fractalField(rng, w, h, 4);
  const moisture = fractalField(rng, w, h, 4);
  const riverLattice = makeLattice(rng, 4);

  // 2) Ajuste por preset.
  const heights: number[] = new Array<number>(n).fill(0);
  for (let z = 0; z < h; z++) {
    for (let x = 0; x < w; x++) {
      const i = z * w + x;
      const b = base[i] ?? 0;
      let v: number;
      if (preset === "highlands") {
        // Relevo mais alto e acidentado: mais penhascos, menos água.
        v = clamp((b - 0.5) * 1.1 + 0.6, 0, 1);
      } else if (preset === "valley") {
        // Vales planos e suaves.
        v = 0.25 + 0.6 * b;
      } else {
        // Estepe: plana e aberta.
        v = 0.3 + 0.35 * b;
      }
      heights[i] = v;
    }
  }
  if (preset === "valley") {
    // Rio central serpenteante: fileira de água com margem de areia.
    const midZ = h / 2;
    for (let x = 0; x < w; x++) {
      const wave = valueNoise(riverLattice, 4, (x + 0.5) / w, 0.5);
      const riverZ = midZ + (wave - 0.5) * h * 0.4;
      for (let z = 0; z < h; z++) {
        const d = Math.abs(z + 0.5 - riverZ);
        const i = z * w + x;
        if (d < 1.5) heights[i] = 0.05;
        else if (d < 3) heights[i] = Math.min(heights[i] ?? 0, 0.2);
      }
    }
  }

  // 3) Água e penhascos (penhasco usa média 3x3 suavizada).
  const water: boolean[] = new Array<boolean>(n).fill(false);
  for (let i = 0; i < n; i++) water[i] = (heights[i] ?? 0) < WATER_LEVEL;
  const blocked: boolean[] = new Array<boolean>(n).fill(false);
  for (let z = 0; z < h; z++) {
    for (let x = 0; x < w; x++) {
      const i = z * w + x;
      let sum = 0;
      for (let dz = -1; dz <= 1; dz++) {
        for (let dx = -1; dx <= 1; dx++) {
          const sx = clamp(x + dx, 0, w - 1);
          const sz = clamp(z + dz, 0, h - 1);
          sum += heights[sz * w + sx] ?? 0;
        }
      }
      blocked[i] = (water[i] ?? false) || sum / 9 > CLIFF_LEVEL;
    }
  }

  // 4) Biomas: 0 grama, 1 floresta, 2 areia (perto de água), 3 neve (alto), 4 seco.
  const biome: number[] = new Array<number>(n).fill(0);
  for (let z = 0; z < h; z++) {
    for (let x = 0; x < w; x++) {
      const i = z * w + x;
      const hv = heights[i] ?? 0;
      const m = moisture[i] ?? 0;
      let nearWater = false;
      for (let dz = -2; dz <= 2 && !nearWater; dz++) {
        for (let dx = -2; dx <= 2 && !nearWater; dx++) {
          const sx = x + dx;
          const sz = z + dz;
          if (sx < 0 || sz < 0 || sx >= w || sz >= h) continue;
          if (water[sz * w + sx]) nearWater = true;
        }
      }
      if (hv > 0.8) biome[i] = 3;
      else if (nearWater) biome[i] = 2;
      else if (m > params.forestMoisture) biome[i] = 1;
      else if (m < params.dryMoisture) biome[i] = 4;
      else biome[i] = 0;
    }
  }

  // 5) Spawns: 4 cantos com leve jitter (ordem TL, BR, TR, BL ⇒ 2 jogadores ficam opostos).
  const inset = Math.floor(0.12 * w);
  const corners: Array<{ x: number; z: number }> = [
    { x: inset + rng.int(-1, 1), z: inset + rng.int(-1, 1) },
    { x: w - 1 - inset + rng.int(-1, 1), z: h - 1 - inset + rng.int(-1, 1) },
    { x: w - 1 - inset + rng.int(-1, 1), z: inset + rng.int(-1, 1) },
    { x: inset + rng.int(-1, 1), z: h - 1 - inset + rng.int(-1, 1) },
  ];
  const spawns: SpawnPoint[] = [];
  for (let p = 0; p < SPAWN_COUNT; p++) {
    const c = corners[p] ?? { x: inset, z: inset };
    const cx = clamp(c.x, SPAWN_FLAT_RADIUS, w - 1 - SPAWN_FLAT_RADIUS);
    const cz = clamp(c.z, SPAWN_FLAT_RADIUS, h - 1 - SPAWN_FLAT_RADIUS);
    // Área plana, seca e transitável ao redor do spawn.
    for (let dz = -SPAWN_FLAT_RADIUS; dz <= SPAWN_FLAT_RADIUS; dz++) {
      for (let dx = -SPAWN_FLAT_RADIUS; dx <= SPAWN_FLAT_RADIUS; dx++) {
        if (dx * dx + dz * dz > SPAWN_FLAT_RADIUS * SPAWN_FLAT_RADIUS) continue;
        const i = (cz + dz) * w + (cx + dx);
        heights[i] = 0.45;
        blocked[i] = false;
        biome[i] = 0;
      }
    }
    spawns.push({ player: p, x: (cx + 0.5) * TILE, z: (cz + 0.5) * TILE });
  }

  // 6) Corredores: ligam o spawn 0 aos demais (garante conectividade para pathfinding).
  const first = spawns[0];
  if (first) {
    const sx0 = Math.floor(first.x / TILE);
    const sz0 = Math.floor(first.z / TILE);
    for (let p = 1; p < spawns.length; p++) {
      const sp = spawns[p];
      if (!sp) continue;
      const ex = Math.floor(sp.x / TILE);
      const ez = Math.floor(sp.z / TILE);
      const steps = Math.max(Math.max(Math.abs(ex - sx0), Math.abs(ez - sz0)), 1);
      for (let s = 0; s <= steps; s++) {
        const tx = Math.floor(sx0 + ((ex - sx0) * s) / steps + 0.5);
        const tz = Math.floor(sz0 + ((ez - sz0) * s) / steps + 0.5);
        for (let dz = -1; dz <= 1; dz++) {
          for (let dx = -1; dx <= 1; dx++) {
            const cx = tx + dx;
            const cz = tz + dz;
            if (cx < 0 || cz < 0 || cx >= w || cz >= h) continue;
            const i = cz * w + cx;
            blocked[i] = false;
            if ((heights[i] ?? 0) < WATER_LEVEL) heights[i] = 0.3;
          }
        }
      }
    }
  }

  // 7) Recursos. resourceAt guarda o id do recurso em cada tile (ou -1).
  const resourceAt: number[] = new Array<number>(n).fill(-1);
  const resources: MapResource[] = [];
  const spawnTiles = spawns.map((s) => ({ x: Math.floor(s.x / TILE), z: Math.floor(s.z / TILE) }));

  const minSpawnDist2 = (tx: number, tz: number): number => {
    let best = Infinity;
    for (const s of spawnTiles) {
      const d = dist2(tx, tz, s.x, s.z);
      if (d < best) best = d;
    }
    return best;
  };

  const addResource = (kind: ResSubKind, tx: number, tz: number): void => {
    const id = resources.length;
    resources.push({
      id,
      kind,
      x: (tx + 0.5) * TILE,
      z: (tz + 0.5) * TILE,
      amount: AMOUNT[kind],
      max: AMOUNT[kind],
    });
    resourceAt[tz * w + tx] = id;
  };

  /** Sorteia tiles livres que satisfazem `ok`, até `count` (limite de tentativas fixo). */
  const scatter = (
    kind: ResSubKind,
    count: number,
    ok: (tx: number, tz: number, i: number) => boolean,
  ): void => {
    let placed = 0;
    for (let attempt = 0; attempt < 20000 && placed < count; attempt++) {
      const tx = rng.int(0, w - 1);
      const tz = rng.int(0, h - 1);
      const i = tz * w + tx;
      if (resourceAt[i] !== -1 || blocked[i]) continue;
      if (!ok(tx, tz, i)) continue;
      addResource(kind, tx, tz);
      placed++;
    }
  };

  // Minas: altura média-alta, longe dos spawns (>= 12 tiles). 2 de ouro e 2 de pedra por spawn.
  const mineOk = (tx: number, tz: number, i: number): boolean => {
    const hv = heights[i] ?? 0;
    return hv >= 0.5 && hv <= 0.85 && minSpawnDist2(tx, tz) >= 144;
  };
  scatter("gold-mine", spawns.length * 2, mineOk);
  scatter("stone-mine", spawns.length * 2, mineOk);

  // Árvores: em floresta, com clareira de 5 tiles ao redor dos spawns; ~12% dos tiles de floresta.
  for (let tz = 0; tz < h; tz++) {
    for (let tx = 0; tx < w; tx++) {
      const i = tz * w + tx;
      if (blocked[i] || resourceAt[i] !== -1 || biome[i] !== 1) continue;
      if (minSpawnDist2(tx, tz) < 25) continue;
      if (rng.next() < 0.12) addResource("tree", tx, tz);
    }
  }

  // Arbustos de fruta (4 por spawn, 5–12 tiles de distância).
  for (const s of spawnTiles) {
    scatter("berry", 4, (tx, tz) => {
      const d = dist2(tx, tz, s.x, s.z);
      return d >= 25 && d <= 144;
    });
  }

  // Ovelhas (2 por spawn, 3–8 tiles).
  for (const s of spawnTiles) {
    scatter("sheep", 2, (tx, tz) => {
      const d = dist2(tx, tz, s.x, s.z);
      return d >= 9 && d <= 64;
    });
  }

  // Cervos e javalis: em floresta e distantes dos spawns (>= 15 tiles).
  const farForest = (tx: number, tz: number, i: number): boolean =>
    biome[i] === 1 && minSpawnDist2(tx, tz) >= 225;
  scatter("deer", 6, farForest);
  scatter("boar", 4, farForest);

  return {
    w,
    h,
    tile: TILE,
    heights,
    biome,
    blocked,
    resourceAt,
    resources,
    spawns,
    maxHeight: MAX_HEIGHT,
  };
}

/** Índice do tile em `map` que contém (x,z), ou -1 se fora do mapa. */
export function tileIndexAt(map: MapData, x: number, z: number): number {
  const tx = Math.floor(x / map.tile);
  const tz = Math.floor(z / map.tile);
  if (tx < 0 || tz < 0 || tx >= map.w || tz >= map.h) return -1;
  return tz * map.w + tx;
}

/** Altura do terreno (unidades de mundo) sob (x,z). 0 fora do mapa. */
export function heightAt(map: MapData, x: number, z: number): number {
  const i = tileIndexAt(map, x, z);
  if (i < 0) return 0;
  return (map.heights[i] ?? 0) * map.maxHeight;
}

/** Distância euclidiana (unidades de mundo). Usa sqrtNum (sem Math). */
export function distance(ax: number, az: number, bx: number, bz: number): number {
  return Math.sqrt((ax - bx) * (ax - bx) + (az - bz) * (az - bz));
}
