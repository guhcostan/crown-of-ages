/**
 * terrain.ts — malha do terreno e da água a partir do MapData.
 *
 * - Terreno: PlaneGeometry (w*tile x h*tile) com altura por vértice e cor por bioma
 *   (variação determinística de ±8% por tile, via hash do índice — sem Math.random).
 * - Água: uma única geometria (merge de quads) para todos os tiles de água, com
 *   material translúcido em y=0.35.
 */
import * as THREE from "three";
import type { MapData } from "@sim/types";

/** Cores por bioma (0=grama, 1=floresta, 2=areia, 3=neve, 4=seco). */
const BIOME_COLORS: readonly number[] = [0x4a7a3a, 0x2f5d2e, 0xc2b280, 0xe8ecef, 0x9a8f5a];
const WATER_COLOR = 0x2e5f7a;
const WATER_LEVEL = 0.35;
const WATER_OPACITY = 0.78;
/** Limiar de água: tile bloqueado com altura normalizada abaixo disto. */
const WATER_HEIGHT_MAX = 0.12;
const VARIATION = 0.08;

/**
 * Hash inteiro determinístico (xorshift-multiply) para um índice de tile.
 * Retorna um valor em [0,1). Não depende do RNG da simulação.
 */
function hash01(index: number): number {
  let h = index | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

/** Multiplica um canal RGB pelo fator (clamp 0..1). */
function scaleColor(hex: number, factor: number, out: THREE.Color): void {
  const r = ((hex >> 16) & 0xff) / 255;
  const g = ((hex >> 8) & 0xff) / 255;
  const b = (hex & 0xff) / 255;
  out.setRGB(Math.min(1, r * factor), Math.min(1, g * factor), Math.min(1, b * factor));
}

function biomeColor(biome: number): number {
  return BIOME_COLORS[biome] ?? BIOME_COLORS[0] ?? 0x4a7a3a;
}

/**
 * Constrói a malha do terreno (com vertexColors) e a malha da água.
 * Retorna um Group contendo as duas, pronto para adicionar à cena.
 */
export function buildTerrain(map: MapData): THREE.Group {
  const group = new THREE.Group();
  group.name = "terrain";

  const worldW = map.w * map.tile;
  const worldH = map.h * map.tile;
  // PlaneGeometry: (w-1)x(h-1) quads => w x h vértices, um por tile.
  const geometry = new THREE.PlaneGeometry(worldW, worldH, map.w - 1, map.h - 1);
  geometry.rotateX(-Math.PI / 2);
  // PlaneGeometry nasce centrado na origem; transladamos para o intervalo [0, w*tile].
  geometry.translate(worldW / 2, 0, worldH / 2);

  const position = geometry.attributes.position;
  if (!position) throw new Error("PlaneGeometry sem atributo position");
  const vertexCount = position.count;
  const colors = new Float32Array(vertexCount * 3);
  const color = new THREE.Color();

  // No PlaneGeometry rotacionado, o vértice (i,j) tem índice j*w + i com j
  // crescendo em z; alinhamos com heights[z*w+x] usando o mesmo layout.
  for (let v = 0; v < vertexCount; v++) {
    const ix = v % map.w;
    const iz = Math.floor(v / map.w);
    const tileIdx = iz * map.w + ix;
    const h = map.heights[tileIdx] ?? 0;
    position.setY(v, h * map.maxHeight);

    const biome = map.biome[tileIdx] ?? 0;
    const variation = 1 + (hash01(tileIdx) * 2 - 1) * VARIATION;
    scaleColor(biomeColor(biome), variation, color);
    colors[v * 3] = color.r;
    colors[v * 3 + 1] = color.g;
    colors[v * 3 + 2] = color.b;
  }
  position.needsUpdate = true;
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const terrainMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const terrain = new THREE.Mesh(geometry, terrainMat);
  terrain.name = "terrain-ground";
  terrain.receiveShadow = false;
  group.add(terrain);

  const water = buildWater(map);
  if (water) group.add(water);

  return group;
}

/**
 * Malha de água: um quad por tile de água, fundidos em uma única BufferGeometry.
 * Retorna null quando o mapa não tem água.
 */
function buildWater(map: MapData): THREE.Mesh | null {
  const positions: number[] = [];
  const indices: number[] = [];
  const tile = map.tile;

  for (let tz = 0; tz < map.h; tz++) {
    for (let tx = 0; tx < map.w; tx++) {
      const idx = tz * map.w + tx;
      const isWater = (map.blocked[idx] ?? false) && (map.heights[idx] ?? 0) < WATER_HEIGHT_MAX;
      if (!isWater) continue;

      const x0 = tx * tile;
      const x1 = (tx + 1) * tile;
      const z0 = tz * tile;
      const z1 = (tz + 1) * tile;
      const base = positions.length / 3;
      positions.push(x0, WATER_LEVEL, z0, x1, WATER_LEVEL, z0, x1, WATER_LEVEL, z1, x0, WATER_LEVEL, z1);
      indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
    }
  }

  if (indices.length === 0) return null;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshLambertMaterial({
    color: WATER_COLOR,
    transparent: true,
    opacity: WATER_OPACITY,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "terrain-water";
  return mesh;
}
