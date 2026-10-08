/**
 * minimap.ts — minimapa 2D em canvas (independente do three.js).
 *
 * Desenha o terreno por bioma (escala nearest, via ImageData), recursos como pontos,
 * entidades por dono (construções como quadrados 2x2) e o retângulo da visão atual
 * da câmera (borda branca de 1px). Respeita a visibilidade do jogador do viewer.
 */
import type { MapData, MapResource, World } from "@sim/types";

/** Paleta de times (mesma ordem de units.ts; duplicada para não puxar o three.js aqui). */
const TEAM_COLORS: readonly number[] = [
  0x3b7dd8, 0xd84b3b, 0x3ba55d, 0xd8b53b, 0x8b5cf6, 0x3bb8d8, 0xd8813b, 0x333333,
];

/** Cores por bioma no minimapa (0=grama, 1=floresta, 2=areia, 3=neve, 4=seco). */
const BIOME_RGB: readonly [number, number, number][] = [
  [0x4a, 0x7a, 0x3a],
  [0x2f, 0x5d, 0x2e],
  [0xc2, 0xb2, 0x80],
  [0xe8, 0xec, 0xef],
  [0x9a, 0x8f, 0x5a],
];
const WATER_RGB: readonly [number, number, number] = [0x2e, 0x5f, 0x7a];
const UNSEEN_DARKEN = 0.45;
const WATER_HEIGHT_MAX = 0.12;

/** Cores de recurso no minimapa (SPEC: árvore, ouro, pedra, comida). */
const RESOURCE_COLOR: Record<string, number> = {
  tree: 0x1d4a1c,
  "gold-mine": 0xd8b53b,
  "stone-mine": 0x9a9a9a,
  berry: 0xc0392b,
  sheep: 0xc0392b,
  deer: 0xc0392b,
  boar: 0xc0392b,
};

/** Cache do terreno pré-renderizado, por referência de mapa (evita reconstruir a cada frame). */
let cachedMap: MapData | null = null;
let cachedImage: ImageData | null = null;

/** Converte hex 0xRRGGBB em tupla RGB. */
function hexToRgb(hex: number): [number, number, number] {
  return [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
}

/** Terreno em ImageData (1 pixel por tile), com água e neblina de guerra não aplicadas. */
function buildTerrainImage(map: MapData): ImageData {
  const img = new ImageData(map.w, map.h);
  const data = img.data;
  for (let i = 0; i < map.w * map.h; i++) {
    const isWater = (map.blocked[i] ?? false) && (map.heights[i] ?? 0) < WATER_HEIGHT_MAX;
    const rgb = isWater ? WATER_RGB : (BIOME_RGB[map.biome[i] ?? 0] ?? BIOME_RGB[0]!);
    const o = i * 4;
    data[o] = rgb[0];
    data[o + 1] = rgb[1];
    data[o + 2] = rgb[2];
    data[o + 3] = 255;
  }
  return img;
}

/** ImageData do terreno, reaproveitado enquanto o mapa for o mesmo objeto. */
function terrainImageFor(map: MapData): ImageData {
  if (cachedMap !== map || !cachedImage) {
    cachedMap = map;
    cachedImage = buildTerrainImage(map);
  }
  return cachedImage;
}

/** Escurece um pixel (neblina: tile não explorado). */
function darken(img: ImageData, tileIdx: number, factor: number): void {
  const o = tileIdx * 4;
  img.data[o] = Math.round((img.data[o] ?? 0) * factor);
  img.data[o + 1] = Math.round((img.data[o + 1] ?? 0) * factor);
  img.data[o + 2] = Math.round((img.data[o + 2] ?? 0) * factor);
}

/** Cor de time segura (fallback para índice fora da paleta). */
function teamRgb(colorIndex: number): [number, number, number] {
  return hexToRgb(TEAM_COLORS[colorIndex] ?? 0x888888);
}

/**
 * Desenha o minimapa no contexto dado (quadrado de `size` px).
 * `viewRect` (coordenadas de mundo) é desenhado como retângulo branco de 1px.
 */
export function drawMinimap(
  ctx: CanvasRenderingContext2D,
  world: World,
  viewerPlayer: number,
  size: number,
  viewRect?: { x0: number; z0: number; x1: number; z1: number },
): void {
  const map = world.map;
  const base = terrainImageFor(map);
  const visRow = world.visibility[viewerPlayer];

  // Cópia para aplicar neblina sem alterar o cache.
  const img = new ImageData(new Uint8ClampedArray(base.data), map.w, map.h);
  if (visRow) {
    for (let i = 0; i < map.w * map.h; i++) {
      if ((visRow[i] ?? 0) === 0) darken(img, i, UNSEEN_DARKEN);
    }
  }

  // Desenha o terreno em um canvas auxiliar do tamanho do mapa e escala nearest.
  const off = document.createElement("canvas");
  off.width = map.w;
  off.height = map.h;
  const offCtx = off.getContext("2d");
  if (!offCtx) return;
  offCtx.putImageData(img, 0, 0);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(off, 0, 0, size, size);

  const scaleX = size / (map.w * map.tile);
  const scaleZ = size / (map.h * map.tile);

  // Recursos (apenas os que ainda têm quantidade e estão explorados).
  for (const r of map.resources) {
    if (r.amount <= 0 || !isExplored(map, visRow, r)) continue;
    const color = RESOURCE_COLOR[r.kind] ?? 0xffffff;
    ctx.fillStyle = hexCss(color);
    ctx.fillRect(r.x * scaleX - 1, r.z * scaleZ - 1, 2, 2);
  }

  // Entidades: unidades = ponto; construções = quadrado 2x2.
  for (const e of world.entities) {
    if (e.kind === "resource") continue;
    if (e.kind === "unit" && visRow && !isVisibleAt(map, visRow, e.x, e.z)) continue;
    if (e.kind === "building" && visRow && !isExplored(map, visRow, { x: e.x, z: e.z })) continue;

    const [r, g, b] = teamRgb(world.players[e.owner]?.color ?? e.owner);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    const px = e.x * scaleX;
    const pz = e.z * scaleZ;
    if (e.kind === "building") {
      ctx.fillRect(px - 1, pz - 1, 2, 2);
    } else {
      ctx.fillRect(px - 0.5, pz - 0.5, 1, 1);
    }
  }

  if (viewRect) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    const x0 = viewRect.x0 * scaleX;
    const z0 = viewRect.z0 * scaleZ;
    const w = (viewRect.x1 - viewRect.x0) * scaleX;
    const h = (viewRect.z1 - viewRect.z0) * scaleZ;
    ctx.strokeRect(x0 + 0.5, z0 + 0.5, w, h);
  }
}

/** Converte o inteiro 0xRRGGBB em string CSS. */
function hexCss(hex: number): string {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

/** Tile de uma posição de mundo, ou -1 fora do mapa. */
function tileIndex(map: MapData, x: number, z: number): number {
  const tx = Math.floor(x / map.tile);
  const tz = Math.floor(z / map.tile);
  if (tx < 0 || tz < 0 || tx >= map.w || tz >= map.h) return -1;
  return tz * map.w + tx;
}

/** Verdadeiro se o tile da posição está explorado (visibilidade >= 1). */
function isExplored(map: MapData, visRow: number[] | undefined, p: Pick<MapResource, "x" | "z">): boolean {
  if (!visRow) return true;
  const idx = tileIndex(map, p.x, p.z);
  return idx >= 0 && (visRow[idx] ?? 0) >= 1;
}

/** Verdadeiro se o tile da posição está visível agora (visibilidade == 2). */
function isVisibleAt(map: MapData, visRow: number[], x: number, z: number): boolean {
  const idx = tileIndex(map, x, z);
  return idx >= 0 && (visRow[idx] ?? 0) === 2;
}
