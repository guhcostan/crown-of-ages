/**
 * scene.ts — renderer principal (three.js/WebGL2) e orquestração das camadas.
 *
 * - WebGLRenderer com antialias e pixelRatio limitado a 2.
 * - Cena com neblina (0x0e1626, near 30, far 220), luz direcional 0.8 e ambiente 0.5.
 * - Fundo (céu) 0x8fb3c9.
 * - render(): se `world.map` mudou (referência), reconstrói terreno e recursos; sincroniza
 *   unidades/construções; na primeira vez centraliza a câmera no meio do mapa.
 */
import * as THREE from "three";
import type { World } from "@sim/types";
import { buildTerrain } from "./terrain";
import { createCameraControls, type CameraControls, type CameraRig } from "./camera";
import { buildResourceLayer, buildUnitLayer, type ResourceLayer, type UnitLayer } from "./units";

const SKY_COLOR = 0x8fb3c9;
const FOG_COLOR = 0x0e1626;
const FOG_NEAR = 30;
const FOG_FAR = 220;
const AMBIENT_INTENSITY = 0.5;
const SUN_INTENSITY = 0.8;
const MAX_PIXEL_RATIO = 2;

/** Renderer de cena exposto ao main. */
export interface SceneRenderer {
  resize(w: number, h: number): void;
  render(world: World, viewerPlayer: number): void;
  camera: CameraControls;
  dispose(): void;
}

/**
 * Cria o renderer 3D sobre o canvas dado. A câmera inicial é centralizada no mapa
 * na primeira chamada de `render`.
 */
export function createRenderer(canvas: HTMLCanvasElement, width: number, height: number): SceneRenderer {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.setSize(width, height, false);
  renderer.setClearColor(SKY_COLOR, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY_COLOR);
  scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);

  const ambient = new THREE.AmbientLight(0xffffff, AMBIENT_INTENSITY);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, SUN_INTENSITY);
  sun.position.set(40, 80, 30);
  scene.add(sun);

  // Câmera de controle: centro provisório; `focusOn` ajusta no primeiro render.
  const rig: CameraRig = createCameraControls(canvas, 0, 0, width, height);
  const camera = rig;

  let terrainGroup: THREE.Group | null = null;
  let resourceLayer: ResourceLayer | null = null;
  let unitLayer: UnitLayer | null = null;
  let builtFor: World["map"] | null = null;
  let cameraCentered = false;

  unitLayer = buildUnitLayer(scene);

  /** Reconstrói terreno e recursos quando o mapa muda (referência). */
  function ensureMap(world: World): void {
    if (builtFor === world.map) return;
    builtFor = world.map;

    if (terrainGroup) {
      scene.remove(terrainGroup);
      disposeGroup(terrainGroup);
    }
    resourceLayer?.dispose();

    terrainGroup = buildTerrain(world.map);
    scene.add(terrainGroup);
    resourceLayer = buildResourceLayer(scene, world.map);

    if (!cameraCentered) {
      const cx = (world.map.w * world.map.tile) / 2;
      const cz = (world.map.h * world.map.tile) / 2;
      camera.focusOn(cx, cz);
      cameraCentered = true;
    }
  }

  return {
    camera,

    resize(w: number, h: number): void {
      renderer.setSize(w, h, false);
      rig.setViewport(w, h);
    },

    render(world: World, viewerPlayer: number): void {
      ensureMap(world);
      unitLayer?.sync(world, viewerPlayer);
      // A câmera é avançada pelo loop do main (camera.update(dt)); não atualizar aqui.
      renderer.render(scene, rig.camera);
    },

    dispose(): void {
      camera.dispose();
      if (terrainGroup) {
        scene.remove(terrainGroup);
        disposeGroup(terrainGroup);
      }
      resourceLayer?.dispose();
      unitLayer?.dispose();
      renderer.dispose();
    },
  };
}

/** Libera geometrias e materiais de um grupo (terreno). */
function disposeGroup(group: THREE.Group): void {
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      const mat = obj.material;
      if (mat instanceof THREE.Material) mat.dispose();
    }
  });
}
