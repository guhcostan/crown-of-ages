/**
 * camera.ts — câmera orbital estilo RTS (three.js PerspectiveCamera).
 *
 * A câmera sempre olha para um alvo no plano y=0. O pitch é fixo (48°), o yaw é
 * livre (rotação) e o zoom é a distância câmera→alvo, com interpolação suave.
 *
 * Convenções:
 * - Roda do mouse NÃO é tratada aqui: o main já repassa o delta via `zoomBy`
 *   (evita zoom duplo). Um notch (100 px) equivale a 2 unidades de zoom.
 * - Botão direito arrastado rotaciona o yaw.
 * - WASD não é tratado aqui (responsabilidade do main).
 */
import * as THREE from "three";

export interface CameraControls {
  update(dt: number): void;
  focusOn(x: number, z: number): void;
  panBy(dx: number, dz: number): void;
  rotateBy(delta: number): void;
  zoomBy(delta: number): void;
  /**
   * Estado atual: x/z = alvo no plano; y = altura da câmera no mundo;
   * yaw/pitch em radianos; zoom = distância câmera→alvo.
   */
  state(): { x: number; y: number; z: number; yaw: number; pitch: number; zoom: number };
  project(x: number, z: number): { x: number; y: number };
  unproject(sx: number, sy: number): { x: number; z: number };
  dispose(): void;
}

/** Câmera de controle com acesso ao objeto three.js (uso interno do renderer). */
export interface CameraRig extends CameraControls {
  readonly camera: THREE.PerspectiveCamera;
  /** Atualiza a proporção de tela (chamado em resize). */
  setViewport(w: number, h: number): void;
}

const FOV_DEG = 45;
const PITCH_RAD = (48 * Math.PI) / 180;
const ZOOM_MIN = 12;
const ZOOM_MAX = 60;
const ZOOM_DEFAULT = 34;
/** Unidades de zoom por notch de roda (100 px). */
const ZOOM_PER_NOTCH = 2;
const ZOOM_SMOOTHING = 12;
const DRAG_ROTATE_RAD_PER_PX = 0.008;
const INITIAL_YAW = -0.6;
const NEAR = 0.5;
const FAR = 400;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Cria a câmera orbital e registra apenas o clique direito (rotação) no `dom`.
 * `centerX/centerZ` é o alvo inicial; `viewportW/H` define a proporção.
 */
export function createCameraControls(
  dom: HTMLElement,
  centerX: number,
  centerZ: number,
  viewportW: number,
  viewportH: number,
): CameraRig {
  const camera = new THREE.PerspectiveCamera(FOV_DEG, viewportW / Math.max(1, viewportH), NEAR, FAR);

  // Estado de controle (alvo, yaw, zoom atual e desejado).
  let targetX = centerX;
  let targetZ = centerZ;
  let yaw = INITIAL_YAW;
  let zoom = ZOOM_DEFAULT;
  let zoomTarget = ZOOM_DEFAULT;

  // Estado do arrasto com botão direito.
  let dragging = false;
  let lastDragX = 0;

  const target = new THREE.Vector3();
  const ndc = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  /** Recalcula a posição da câmera a partir do alvo, yaw, pitch e zoom. */
  function syncCamera(): void {
    const horizontal = zoom * Math.cos(PITCH_RAD);
    const height = zoom * Math.sin(PITCH_RAD);
    // A câmera fica "atrás" do alvo na direção oposta ao forward horizontal.
    camera.position.set(targetX + Math.sin(yaw) * horizontal, height, targetZ + Math.cos(yaw) * horizontal);
    target.set(targetX, 0, targetZ);
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
  }

  function onPointerDown(ev: PointerEvent): void {
    if (ev.button !== 2) return;
    dragging = true;
    lastDragX = ev.clientX;
  }

  function onPointerMove(ev: PointerEvent): void {
    if (!dragging) return;
    const dx = ev.clientX - lastDragX;
    lastDragX = ev.clientX;
    yaw += dx * DRAG_ROTATE_RAD_PER_PX;
    syncCamera();
  }

  function onPointerUp(ev: PointerEvent): void {
    if (ev.button === 2) dragging = false;
  }

  dom.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  syncCamera();

  return {
    camera,

    update(dt: number): void {
      const k = 1 - Math.exp(-dt * ZOOM_SMOOTHING);
      zoom += (zoomTarget - zoom) * k;
      syncCamera();
    },

    focusOn(x: number, z: number): void {
      targetX = x;
      targetZ = z;
      syncCamera();
    },

    panBy(dx: number, dz: number): void {
      // Eixos de tela no plano: "direita" e "frente" (forward aponta para longe da câmera).
      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);
      const fwdX = -Math.sin(yaw);
      const fwdZ = -Math.cos(yaw);
      targetX += dx * rightX + dz * fwdX;
      targetZ += dx * rightZ + dz * fwdZ;
      syncCamera();
    },

    rotateBy(delta: number): void {
      yaw += delta;
      syncCamera();
    },

    zoomBy(delta: number): void {
      // `delta` vem em pixels de roda (deltaY); 100 px = 1 notch.
      zoomTarget = clamp(zoomTarget + (delta / 100) * ZOOM_PER_NOTCH, ZOOM_MIN, ZOOM_MAX);
    },

    state() {
      return { x: targetX, y: camera.position.y, z: targetZ, yaw, pitch: PITCH_RAD, zoom };
    },

    project(x: number, z: number): { x: number; y: number } {
      syncCamera();
      ndc.set(x, 0, z).project(camera);
      const w = viewportW;
      const h = viewportH;
      return { x: ((ndc.x + 1) / 2) * w, y: ((1 - ndc.y) / 2) * h };
    },

    unproject(sx: number, sy: number): { x: number; z: number } {
      syncCamera();
      pointer.set((sx / viewportW) * 2 - 1, -((sy / viewportH) * 2 - 1));
      raycaster.setFromCamera(pointer, camera);
      const origin = raycaster.ray.origin;
      const dir = raycaster.ray.direction;
      // Interseção com o plano y=0.
      if (Math.abs(dir.y) > 1e-6) {
        const t = -origin.y / dir.y;
        if (t > 0) return { x: origin.x + dir.x * t, z: origin.z + dir.z * t };
      }
      // Raio não cruza o plano: devolve o ponto do plano na direção horizontal do raio.
      const horiz = Math.hypot(dir.x, dir.z) || 1;
      const reach = zoom * 2;
      return { x: origin.x + (dir.x / horiz) * reach, z: origin.z + (dir.z / horiz) * reach };
    },

    setViewport(w: number, h: number): void {
      viewportW = w;
      viewportH = h;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      syncCamera();
    },

    dispose(): void {
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      dragging = false;
    },
  };
}
