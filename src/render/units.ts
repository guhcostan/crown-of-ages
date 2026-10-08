/**
 * units.ts — camadas instanciadas de unidades, construções e recursos estáticos.
 *
 * INSTANCING OBRIGATÓRIO: um InstancedMesh por (tipo, jogador) para unidades e por
 * (tipo de construção) para edifícios. Nunca criar Mesh por entidade em jogo.
 * Recursos estáticos são instanciados por subtipo na construção (não mudam com tick).
 */
import * as THREE from "three";
import type { Entity, MapData, World } from "@sim/types";

/** Paleta de cores de time (SPEC §8.3). Índice = cor do jogador. */
export const TEAM_COLORS: readonly number[] = [
  0x3b7dd8, // azul
  0xd84b3b, // vermelho
  0x3ba55d, // verde
  0xd8b53b, // amarelo
  0x8b5cf6, // roxo
  0x3bb8d8, // ciano
  0xd8813b, // laranja
  0x333333, // preto
];

/** Cor de fallback para jogador sem índice de cor definido. */
const FALLBACK_TEAM_COLOR = 0x888888;

/** Altura do centro da unidade acima do terreno (metade do corpo). */
const UNIT_Y_OFFSET = 0.55;
/** Cor do recurso de fauna (ovelha/veado/javali). */
const WILDLIFE_COLOR = 0xcfc9b8;

/** Número máximo de instâncias por InstancedMesh (margem sobre 200 unidades em jogo). */
const MAX_INSTANCES = 512;

/** Dimensões de construção por tipo: [largura, altura, profundidade]. */
const BUILDING_SIZES: Record<string, [number, number, number]> = {
  "town-center": [3.2, 3.2, 3.2],
};
const DEFAULT_BUILDING_SIZE: [number, number, number] = [2, 1.6, 2];

/** Tipos de unidade reconhecidos explicitamente; demais caem em "unit-body". */
const UNIT_TYPES: readonly string[] = ["villager", "scout"];

/** Camada de unidades/construções (sync por tick). */
export interface UnitLayer {
  sync(world: World, viewerPlayer: number): void;
  dispose(): void;
}

/** Camada de recursos estáticos (construída uma vez por mapa). */
export interface ResourceLayer {
  dispose(): void;
  readonly group: THREE.Group;
}

/** Chave única para (tipo, jogador). */
function unitKey(type: string, owner: number): string {
  return `${type}|${owner}`;
}

/** Converte índice de cor de time em hex (com fallback). */
function teamColor(colorIndex: number): number {
  return TEAM_COLORS[colorIndex] ?? FALLBACK_TEAM_COLOR;
}

/** Tile de uma coordenada de mundo, ou -1 se fora do mapa. */
function tileIndexOf(map: MapData, x: number, z: number): number {
  const tx = Math.floor(x / map.tile);
  const tz = Math.floor(z / map.tile);
  if (tx < 0 || tz < 0 || tx >= map.w || tz >= map.h) return -1;
  return tz * map.w + tx;
}

/**
 * Cria um InstancedMesh com capacidade fixa. A cor do time é gravada em `instanceColor`
 * (material branco), para que o mesmo material sirva a qualquer dono.
 */
function makeInstanced(geometry: THREE.BufferGeometry, color: number, name: string): THREE.InstancedMesh {
  const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const mesh = new THREE.InstancedMesh(geometry, material, MAX_INSTANCES);
  mesh.name = name;
  mesh.count = 0;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  // Cor do time (uniforme no mesh, já que o mesh é por (tipo, jogador)).
  const tint = new THREE.Color(color);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_INSTANCES * 3), 3);
  for (let i = 0; i < MAX_INSTANCES; i++) {
    mesh.setColorAt(i, tint);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

/**
 * Cria a camada de unidades e construções. Os InstancedMesh são criados sob demanda
 * por (tipo, jogador) e reutilizados entre ticks; `sync` só reescreve matrizes e count.
 */
export function buildUnitLayer(scene: THREE.Scene): UnitLayer {
  const group = new THREE.Group();
  group.name = "units";
  scene.add(group);

  // Geometrias compartilhadas por tipo (uma por tipo, reutilizada por todos os jogadores).
  const unitGeometry = new THREE.CapsuleGeometry(0.35, 0.9, 2, 6);
  const buildingGeometries = new Map<string, THREE.BufferGeometry>();

  const unitMeshes = new Map<string, THREE.InstancedMesh>();
  const buildingMeshes = new Map<string, THREE.InstancedMesh>();

  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scale = new THREE.Vector3(1, 1, 1);
  const euler = new THREE.Euler(0, 0, 0, "YXZ");

  function unitMeshFor(type: string, owner: number, colorIndex: number): THREE.InstancedMesh {
    const key = unitKey(type, owner);
    let mesh = unitMeshes.get(key);
    if (!mesh) {
      mesh = makeInstanced(unitGeometry, teamColor(colorIndex), `unit-${type}-${owner}`);
      unitMeshes.set(key, mesh);
      group.add(mesh);
    }
    return mesh;
  }

  function buildingGeometryFor(type: string): THREE.BufferGeometry {
    let geo = buildingGeometries.get(type);
    if (!geo) {
      const [w, h, d] = BUILDING_SIZES[type] ?? DEFAULT_BUILDING_SIZE;
      geo = new THREE.BoxGeometry(w, h, d);
      geo.translate(0, h / 2, 0);
      buildingGeometries.set(type, geo);
    }
    return geo;
  }

  function buildingMeshFor(type: string, owner: number, colorIndex: number): THREE.InstancedMesh {
    // Construções são instanciadas por (tipo, dono): a cor do dono entra no material.
    const key = unitKey(type, owner);
    let mesh = buildingMeshes.get(key);
    if (!mesh) {
      mesh = makeInstanced(buildingGeometryFor(type), teamColor(colorIndex), `building-${type}-${owner}`);
      buildingMeshes.set(key, mesh);
      group.add(mesh);
    }
    return mesh;
  }

  function writeInstance(mesh: THREE.InstancedMesh, index: number, e: Entity, yOffset: number): void {
    pos.set(e.x, e.y + yOffset, e.z);
    euler.set(0, e.facing, 0);
    quat.setFromEuler(euler);
    matrix.compose(pos, quat, scale);
    mesh.setMatrixAt(index, matrix);
  }

  function sync(world: World, viewerPlayer: number): void {
    // Zera contadores; cada sync reconta as entidades visíveis.
    for (const mesh of unitMeshes.values()) mesh.count = 0;
    for (const mesh of buildingMeshes.values()) mesh.count = 0;

    const visRow = world.visibility[viewerPlayer];
    const players = world.players;

    for (const e of world.entities) {
      if (e.kind === "unit") {
        // Fog of war: pula unidades em tiles não visíveis (inimigos fora da visão).
        if (visRow) {
          const idx = tileIndexOf(world.map, e.x, e.z);
          if (idx < 0 || (visRow[idx] ?? 0) === 0) continue;
        }
        const type = UNIT_TYPES.includes(e.type) ? e.type : "unit-body";
        const colorIndex = players[e.owner]?.color ?? e.owner;
        const mesh = unitMeshFor(type, e.owner, colorIndex);
        const index = mesh.count;
        if (index >= MAX_INSTANCES) continue;
        writeInstance(mesh, index, e, UNIT_Y_OFFSET);
        mesh.count = index + 1;
        mesh.instanceMatrix.needsUpdate = true;
      } else if (e.kind === "building") {
        const colorIndex = players[e.owner]?.color ?? e.owner;
        const mesh = buildingMeshFor(e.type, e.owner, colorIndex);
        const index = mesh.count;
        if (index >= MAX_INSTANCES) continue;
        // Construções usam a base no terreno: a geometria já é deslocada para cima.
        writeInstance(mesh, index, e, 0);
        mesh.count = index + 1;
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  }

  function dispose(): void {
    for (const mesh of [...unitMeshes.values(), ...buildingMeshes.values()]) {
      mesh.dispose();
      const mat = mesh.material;
      if (mat instanceof THREE.Material) mat.dispose();
      group.remove(mesh);
    }
    unitMeshes.clear();
    buildingMeshes.clear();
    unitGeometry.dispose();
    for (const geo of buildingGeometries.values()) geo.dispose();
    buildingGeometries.clear();
    scene.remove(group);
  }

  return { sync, dispose };
}

/**
 * Recursos estáticos do mapa: árvore (tronco + 2 cones), pedra (icosaedro),
 * arbusto (esfera achatada) e fauna (cápsula clara). Instanciado por subtipo.
 */
export function buildResourceLayer(scene: THREE.Scene, map: MapData): ResourceLayer {
  const group = new THREE.Group();
  group.name = "resources";
  scene.add(group);

  const dummy = new THREE.Object3D();
  const createdGeometries: THREE.BufferGeometry[] = [];
  const createdMaterials: THREE.Material[] = [];
  const createdMeshes: THREE.InstancedMesh[] = [];

  /** Agrupa recursos por subtipo para gerar um InstancedMesh por subtipo. */
  const byKind = new Map<string, Array<{ x: number; z: number; y: number }>>();
  for (const r of map.resources) {
    if (r.amount <= 0) continue;
    const idx = tileIndexOf(map, r.x, r.z);
    const y = idx >= 0 ? (map.heights[idx] ?? 0) * map.maxHeight : 0;
    const list = byKind.get(r.kind) ?? [];
    list.push({ x: r.x, z: r.z, y });
    byKind.set(r.kind, list);
  }

  function addInstanced(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    items: Array<{ x: number; z: number; y: number }>,
    name: string,
  ): void {
    if (items.length === 0) return;
    const mesh = new THREE.InstancedMesh(geometry, material, items.length);
    mesh.name = name;
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y, it.z);
      dummy.rotation.set(0, (i * 2.399) % (Math.PI * 2), 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    group.add(mesh);
    createdMeshes.push(mesh);
  }

  // Árvore: tronco (caixa 0.25x1.2) + 2 cones sobrepostos. Geometria mesclada em uma só.
  const treeTrunk = new THREE.BoxGeometry(0.25, 1.2, 0.25);
  treeTrunk.translate(0, 0.6, 0);
  const treeCrown1 = new THREE.ConeGeometry(0.9, 1.4, 6);
  treeCrown1.translate(0, 1.6, 0);
  const treeCrown2 = new THREE.ConeGeometry(0.65, 1.1, 6);
  treeCrown2.translate(0, 2.4, 0);
  const treeGeometry = mergeGeometries([treeTrunk, treeCrown1, treeCrown2]);
  createdGeometries.push(treeGeometry, treeTrunk, treeCrown1, treeCrown2);

  const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x2f5d2e });
  createdMaterials.push(treeMaterial);

  const stoneGeometry = new THREE.IcosahedronGeometry(0.6, 0);
  stoneGeometry.translate(0, 0.3, 0);
  createdGeometries.push(stoneGeometry);
  const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0x9a9a9a });
  createdMaterials.push(stoneMaterial);

  const bushGeometry = new THREE.SphereGeometry(0.5, 6, 4);
  bushGeometry.scale(1, 0.6, 1);
  bushGeometry.translate(0, 0.3, 0);
  createdGeometries.push(bushGeometry);
  const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x5e8c3a });
  createdMaterials.push(bushMaterial);

  const wildlifeGeometry = new THREE.CapsuleGeometry(0.3, 0.6, 2, 6);
  createdGeometries.push(wildlifeGeometry);
  const wildlifeMaterial = new THREE.MeshLambertMaterial({ color: WILDLIFE_COLOR });
  createdMaterials.push(wildlifeMaterial);

  const kindGeometry: Record<string, [THREE.BufferGeometry, THREE.Material]> = {
    tree: [treeGeometry, treeMaterial],
    "stone-mine": [stoneGeometry, stoneMaterial],
    berry: [bushGeometry, bushMaterial],
    sheep: [wildlifeGeometry, wildlifeMaterial],
    deer: [wildlifeGeometry, wildlifeMaterial],
    boar: [wildlifeGeometry, wildlifeMaterial],
  };

  for (const [kind, items] of byKind) {
    const pair = kindGeometry[kind];
    if (pair) addInstanced(pair[0], pair[1], items, `resource-${kind}`);
  }

  function dispose(): void {
    for (const mesh of createdMeshes) {
      mesh.dispose();
      group.remove(mesh);
    }
    for (const geo of createdGeometries) geo.dispose();
    for (const mat of createdMaterials) mat.dispose();
    scene.remove(group);
  }

  return { dispose, group };
}

/**
 * Funde geometrias não indexadas/indexadas com os mesmos atributos num único BufferGeometry.
 * Usado para a árvore (tronco + copas) sem depender de addons do three.
 */
function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  for (const geo of geometries) {
    const nonIndexed = geo.index ? geo.toNonIndexed() : geo;
    const pos = nonIndexed.attributes.position;
    const nrm = nonIndexed.attributes.normal;
    if (!pos) continue;
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (nrm) normals.push(nrm.getX(i), nrm.getY(i), nrm.getZ(i));
    }
    if (nonIndexed !== geo) nonIndexed.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length === positions.length) {
    merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  } else {
    merged.computeVertexNormals();
  }
  return merged;
}
