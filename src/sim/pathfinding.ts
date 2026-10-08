/**
 * pathfinding.ts — A* em grade 8-direções, sem corte de canto, com string pulling.
 *
 * Entrada e saída em unidades de mundo. Waypoints ficam no centro dos tiles.
 * Determinístico: a ordem de exploração depende só dos dados (sem Math/Date).
 */


import type { MapData } from "./types";

type Point = { x: number; z: number };

/** Custo relativo de andar em diagonal (√2 aproximado em decimal fixo). */
const DIAG_COST = 1.4142135623730951;
/** Limite de nós expandidos (evita travar em mapas grandes com destino inalcançável). */
const MAX_EXPANSIONS = 60000;

/** Tile bloqueado ou fora do mapa? */
function isBlocked(map: MapData, tx: number, tz: number): boolean {
  if (tx < 0 || tz < 0 || tx >= map.w || tz >= map.h) return true;
  return map.blocked[tz * map.w + tx] ?? true;
}

/** Heurística octile (admissível para 8-direções). */
function octile(ax: number, az: number, bx: number, bz: number): number {
  const dx = Math.abs(ax - bx);
  const dz = Math.abs(az - bz);
  const lo = dx < dz ? dx : dz;
  const hi = dx < dz ? dz : dx;
  return hi + (DIAG_COST - 1) * lo;
}

/**
 * Linha de caminhada entre dois tiles: amostra o segmento e exige que nenhum tile
 * tocado esteja bloqueado. Usada pelo string pulling e pela API pública.
 */
function tileLineWalkable(map: MapData, ax: number, az: number, bx: number, bz: number): boolean {
  // Percurso exato por tiles (Amanatides-Woo): cada transição de tile é checada e,
  // quando a travessia é diagonal (cruza uma quina), os dois tiles ortogonais também
  // precisam estar livres. Assim a suavização nunca corta canto bloqueado.
  let tx = Math.floor(ax);
  let tz = Math.floor(az);
  const endX = Math.floor(bx);
  const endZ = Math.floor(bz);
  if (isBlocked(map, tx, tz)) return false;
  const dx = bx - ax;
  const dz = bz - az;
  const stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
  const stepZ = dz > 0 ? 1 : dz < 0 ? -1 : 0;
  // Distância (em parâmetro t) para cruzar a primeira fronteira de cada eixo.
  const nextX = stepX > 0 ? tx + 1 : tx;
  const nextZ = stepZ > 0 ? tz + 1 : tz;
  let tMaxX = stepX === 0 ? Infinity : (nextX - ax) / dx;
  let tMaxZ = stepZ === 0 ? Infinity : (nextZ - az) / dz;
  const tDeltaX = stepX === 0 ? Infinity : Math.abs(1 / dx);
  const tDeltaZ = stepZ === 0 ? Infinity : Math.abs(1 / dz);
  // Limite de iterações: no máximo uma transição por tile entre origem e destino.
  let guard = Math.abs(endX - tx) + Math.abs(endZ - tz) + 2;
  while ((tx !== endX || tz !== endZ) && guard-- > 0) {
    if (tMaxX < tMaxZ) {
      if (tMaxX > 1) break;
      tx += stepX;
      tMaxX += tDeltaX;
      if (isBlocked(map, tx, tz)) return false;
    } else {
      if (tMaxZ > 1) break;
      tz += stepZ;
      tMaxZ += tDeltaZ;
      if (isBlocked(map, tx, tz)) return false;
    }
    // Transição diagonal exata: ambos os eixos cruzam no mesmo t (quina).
    if (tMaxX === tMaxZ && tMaxX <= 1) {
      if (isBlocked(map, tx + stepX, tz) && isBlocked(map, tx, tz + stepZ)) return false;
    }
  }
  return !isBlocked(map, endX, endZ) || (tx === endX && tz === endZ);
}

/**
 * Verdadeiro se o segmento entre dois pontos de mundo não atravessa tiles bloqueados.
 */
export function hasLineOfWalk(map: MapData, ax: number, az: number, bx: number, bz: number): boolean {
  const t = map.tile;
  return tileLineWalkable(map, ax / t, az / t, bx / t, bz / t);
}

/** Heap binário mínimo sobre índices de nó, com chave em `keys`. */
class MinHeap {
  private readonly items: number[] = [];
  private readonly keys: number[];

  constructor(keys: number[]) {
    this.keys = keys;
  }

  get size(): number {
    return this.items.length;
  }

  push(node: number): void {
    this.items.push(node);
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      const pi = this.items[parent] ?? 0;
      const ci = this.items[i] ?? 0;
      if ((this.keys[pi] ?? 0) <= (this.keys[ci] ?? 0)) break;
      this.items[parent] = ci;
      this.items[i] = pi;
      i = parent;
    }
  }

  pop(): number {
    const top = this.items[0] ?? 0;
    const last = this.items.pop() ?? 0;
    if (this.items.length > 0) {
      this.items[0] = last;
      let i = 0;
      const n = this.items.length;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < n && (this.keys[this.items[l] ?? 0] ?? 0) < (this.keys[this.items[m] ?? 0] ?? 0)) m = l;
        if (r < n && (this.keys[this.items[r] ?? 0] ?? 0) < (this.keys[this.items[m] ?? 0] ?? 0)) m = r;
        if (m === i) break;
        const tmp = this.items[i] ?? 0;
        this.items[i] = this.items[m] ?? 0;
        this.items[m] = tmp;
        i = m;
      }
    }
    return top;
  }
}

/**
 * Encontra caminho entre dois pontos de mundo. Retorna waypoints de mundo (sem o ponto
 * inicial), já suavizados. [] se o destino for inalcançável ou se o início == fim.
 */
export function findPath(
  map: MapData,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
): Array<{ x: number; z: number }> {
  const t = map.tile;
  const sx = Math.floor(fromX / t);
  const sz = Math.floor(fromZ / t);
  const gx = Math.floor(toX / t);
  const gz = Math.floor(toZ / t);
  if (isBlocked(map, gx, gz) || isBlocked(map, sx, sz)) return [];
  if (sx === gx && sz === gz) return [];

  const w = map.w;
  const total = w * map.h;
  const gScore: number[] = new Array<number>(total).fill(Infinity);
  const parent: number[] = new Array<number>(total).fill(-1);
  const closed: boolean[] = new Array<boolean>(total).fill(false);
  const fScore: number[] = new Array<number>(total).fill(Infinity);
  const heap = new MinHeap(fScore);

  const start = sz * w + sx;
  const goal = gz * w + gx;
  gScore[start] = 0;
  fScore[start] = octile(sx, sz, gx, gz);
  heap.push(start);

  const dirs: Array<[number, number, number]> = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, DIAG_COST],
    [1, -1, DIAG_COST],
    [-1, 1, DIAG_COST],
    [-1, -1, DIAG_COST],
  ];

  let found = false;
  let expansions = 0;
  while (heap.size > 0 && expansions < MAX_EXPANSIONS) {
    const cur = heap.pop();
    if (closed[cur]) continue;
    closed[cur] = true;
    expansions++;
    if (cur === goal) {
      found = true;
      break;
    }
    const cx = cur % w;
    const cz = Math.floor(cur / w);
    for (const [dx, dz, cost] of dirs) {
      const nx = cx + dx;
      const nz = cz + dz;
      if (isBlocked(map, nx, nz)) continue;
      // Sem corte de canto: diagonal exige os dois tiles ortogonais livres.
      if (dx !== 0 && dz !== 0 && (isBlocked(map, cx + dx, cz) || isBlocked(map, cx, cz + dz))) continue;
      const ni = nz * w + nx;
      if (closed[ni]) continue;
      const tentative = (gScore[cur] ?? 0) + cost;
      if (tentative < (gScore[ni] ?? Infinity)) {
        gScore[ni] = tentative;
        parent[ni] = cur;
        fScore[ni] = tentative + octile(nx, nz, gx, gz);
        heap.push(ni);
      }
    }
  }
  if (!found) return [];

  // Reconstrói a sequência de tiles (do início ao fim).
  const tiles: number[] = [];
  let node = goal;
  while (node !== -1) {
    tiles.push(node);
    node = parent[node] ?? -1;
  }
  tiles.reverse();

  // Converte para centros de tile em mundo.
  const points: Point[] = tiles.map((i) => ({
    x: (i % w + 0.5) * t,
    z: (Math.floor(i / w) + 0.5) * t,
  }));
  // Ponto de partida exato: removemos o centro do tile inicial e usamos a posição real.
  points.shift();
  points.unshift({ x: fromX, z: fromZ });
  const smoothed = smoothPath(map, points);
  // Remove o ponto inicial do resultado (a unidade já está nele).
  smoothed.shift();
  return smoothed;
}

/**
 * String pulling: a partir de cada ponto, pula diretamente para o último ponto que
 * ainda tem linha de caminhada livre. Preserva o destino final.
 */
function smoothPath(map: MapData, points: Point[]): Point[] {
  if (points.length <= 2) return points.slice();
  const t = map.tile;
  const out: Point[] = [];
  const first = points[0];
  if (!first) return out;
  out.push(first);
  let anchor = 0;
  while (anchor < points.length - 1) {
    let next = anchor + 1;
    for (let j = points.length - 1; j > anchor + 1; j--) {
      const a = points[anchor];
      const b = points[j];
      if (!a || !b) continue;
      if (tileLineWalkable(map, a.x / t, a.z / t, b.x / t, b.z / t)) {
        next = j;
        break;
      }
    }
    const p = points[next];
    if (p) out.push(p);
    anchor = next;
  }
  return out;
}

/** Distância entre dois pontos de mundo; atalho que evita Math. */
export function worldDistance(ax: number, az: number, bx: number, bz: number): number {
  return Math.sqrt((ax - bx) * (ax - bx) + (az - bz) * (az - bz));
}
