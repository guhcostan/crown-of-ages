/**
 * main.ts — bootstrap do jogo (integração Lead).
 *
 * Liga os módulos: simulação determinística (@sim), render 3D (@render), cola
 * (@game) e HUD (@ui). Loop de tick fixo (10 Hz) desacoplado do render (rAF).
 * Expõe `window.__game` (contrato em docs/ARCHITECTURE.md §4).
 */
import "./style.css";
import { createGameApi } from "@game/api";
import { attachInput } from "@game/input";
import { boxSelect, controlGroupOp, pickAt, type ControlGroupsModel } from "@game/selection";
import { drawMinimap } from "@render/minimap";
import { createRenderer } from "@render/scene";
import { applyCommand } from "@sim/commands";
import { stepTick } from "@sim/tick";
import { TICK_SECONDS, type Command, type MatchConfig, type World } from "@sim/types";
import { createWorld } from "@sim/world";
import { mountHud } from "@ui/hud";

declare global {
  interface Window {
    __game: ReturnType<typeof createGameApi>;
  }
}

const DEFAULT_CONFIG: MatchConfig = {
  seed: 1,
  civ: "english",
  map: "valley",
  size: "small",
  bots: [{ difficulty: "easy" }],
  victory: "landmarks",
  gameSpeed: 1,
};

/** Config a partir de query string (?seed=7&civ=french&map=highlands&size=medium&bots=2&victory=wonder). */
function configFromUrl(): MatchConfig {
  const cfg: MatchConfig = { ...DEFAULT_CONFIG };
  if (typeof window === "undefined") return cfg;
  const q = new URLSearchParams(window.location.search);
  const seed = Number(q.get("seed"));
  if (Number.isFinite(seed) && seed > 0) cfg.seed = Math.floor(seed);
  const civ = q.get("civ");
  if (civ === "english" || civ === "french") cfg.civ = civ;
  const map = q.get("map");
  if (map === "highlands" || map === "valley" || map === "steppes") cfg.map = map;
  const size = q.get("size");
  if (size === "small" || size === "medium" || size === "large") cfg.size = size;
  const victory = q.get("victory");
  if (victory === "landmarks" || victory === "wonder" || victory === "sacred-sites") cfg.victory = victory;
  const bots = Number(q.get("bots"));
  if (Number.isFinite(bots) && bots >= 0 && bots <= 3) {
    const diffs = ["easy", "medium", "hard"] as const;
    cfg.bots = Array.from({ length: Math.floor(bots) }, (_, i) => ({
      difficulty: diffs[Math.min(i, diffs.length - 1)] ?? "easy",
    }));
  }
  return cfg;
}

function main(): void {
  const app = document.getElementById("app");
  if (!app) throw new Error("elemento #app ausente");

  app.innerHTML = "";
  app.style.position = "relative";
  app.style.width = "100%";
  app.style.height = "100%";
  app.style.overflow = "hidden";

  const canvas = document.createElement("canvas");
  canvas.id = "game-canvas";
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  app.append(canvas);

  const hudRoot = document.createElement("div");
  hudRoot.style.position = "absolute";
  hudRoot.style.inset = "0";
  hudRoot.style.pointerEvents = "none";
  app.append(hudRoot);
  const hud = mountHud(hudRoot);

  const width = app.clientWidth || window.innerWidth;
  const height = app.clientHeight || window.innerHeight;

  // -------------------------------------------------------------------------
  // Estado do jogo
  // -------------------------------------------------------------------------
  let selection: number[] = [];
  const groups: ControlGroupsModel = { groups: new Map<number, number[]>() };
  const input = attachInput(canvas);
  let lastClickTime = 0;
  let lastClickPos = { x: -1, y: -1 };

  const api = createGameApi({
    createWorld,
    stepTick,
    applyCommand,
    getSelection: () => selection,
    getFps: () => fps,
  });
  window.__game = api;

  api.newMatch(configFromUrl());

  const renderer = createRenderer(canvas, width, height);
  hud.setObjectives(api.getState().config);

  const world = (): World | null => api.getState();

  // -------------------------------------------------------------------------
  // Minimapa: canvas dentro do container data-hud=minimap
  // -------------------------------------------------------------------------
  const miniContainer = document.querySelector('[data-hud="minimap"]');
  const miniCanvas = document.createElement("canvas");
  miniCanvas.width = 196;
  miniCanvas.height = 196;
  miniCanvas.style.width = "196px";
  miniCanvas.style.height = "196px";
  miniContainer?.append(miniCanvas);
  const miniCtx = miniCanvas.getContext("2d");

  // -------------------------------------------------------------------------
  // Projeção tela<->mundo: delegada para a câmera do renderer
  // -------------------------------------------------------------------------
  const projector = {
    worldToScreen: (x: number, z: number) => renderer.camera.project(x, z),
    screenToWorld: (sx: number, sy: number) => renderer.camera.unproject(sx, sy),
  };

  // -------------------------------------------------------------------------
  // Seleção (clique, caixa, duplo clique) e movimentação
  // -------------------------------------------------------------------------
  function handlePointer(): void {
    const st = input.state;
    if (!st.left) return;
    const w = world();
    if (!w) return;
    if (st.dragging) return; // arrasto é tratado no mouseup (box select)

    const now = performance.now();
    const isDouble =
      now - lastClickTime < 350 && Math.hypot(st.mouse.x - lastClickPos.x, st.mouse.y - lastClickPos.y) < 6;
    lastClickTime = now;
    lastClickPos = { x: st.mouse.x, y: st.mouse.y };

    selection = pickAt(w, projector, st.mouse.x, st.mouse.y, 0, st.shift, selection, isDouble);
  }

  function handleBoxSelect(): void {
    const st = input.state;
    const w = world();
    if (!w) return;
    const a = st.dragStart;
    const b = st.mouse;
    if (Math.hypot(b.x - a.x, b.y - a.y) < 8) return;
    selection = boxSelect(w, projector, a.x, a.y, b.x, b.y, 0, st.shift, selection);
  }

  function issueMove(x: number, z: number, queue: boolean): void {
    const w = world();
    if (!w || selection.length === 0) return;
    const cmd: Command = { tick: w.tick, type: "move", unitIds: [...selection], x, z, queue };
    api.send(cmd);
  }

  canvas.addEventListener("contextmenu", (ev) => ev.preventDefault());
  canvas.addEventListener("pointerdown", (ev) => {
    if (ev.button === 2) {
      const st = input.state;
      const p = projector.screenToWorld(st.mouse.x, st.mouse.y);
      issueMove(p.x, p.z, st.shift);
    }
  });
  canvas.addEventListener("pointerup", (ev) => {
    if (ev.button === 0 && input.state.dragging) handleBoxSelect();
  });

  // -------------------------------------------------------------------------
  // Teclado: câmera + grupos + focar
  // -------------------------------------------------------------------------
  function handleKeys(dt: number): void {
    const st = input.state;
    const panSpeed = 26 * dt;
    let dx = 0;
    let dz = 0;
    if (st.keys.has("w") || st.keys.has("arrowup")) dz += panSpeed;
    if (st.keys.has("s") || st.keys.has("arrowdown")) dz -= panSpeed;
    if (st.keys.has("a") || st.keys.has("arrowleft")) dx -= panSpeed;
    if (st.keys.has("d") || st.keys.has("arrowright")) dx += panSpeed;
    if (dx !== 0 || dz !== 0) renderer.camera.panBy(dx, dz);
    if (st.keys.has("e")) renderer.camera.rotateBy(1.2 * dt);
    if (st.keys.has("q")) renderer.camera.rotateBy(-1.2 * dt);

    for (const k of st.justPressed) {
      if (k === "escape") selection = [];
      else if (k === "h") {
        const w = world();
        const id = selection[0] ?? w?.entities.find((e) => e.type === "town-center" && e.owner === 0)?.id;
        const e = w?.entities.find((x) => x.id === id);
        if (e) renderer.camera.focusOn(e.x, e.z);
      } else if (k >= "1" && k <= "9") {
        const key = Number(k);
        selection = controlGroupOp(groups, key, st.ctrl, st.shift, selection);
      }
    }
  }

  function handleWheel(): void {
    const delta = input.consumeWheel();
    if (delta !== 0) renderer.camera.zoomBy(delta);
  }

  // -------------------------------------------------------------------------
  // Loop: tick fixo + render
  // -------------------------------------------------------------------------
  let accumulator = 0;
  let last = performance.now();
  let fps = 0;
  let fpsFrames = 0;
  let fpsAccum = 0;

  function frame(now: number): void {
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    const w = world();
    if (!w) {
      requestAnimationFrame(frame);
      return;
    }

    fpsFrames += 1;
    fpsAccum += dt;
    if (fpsAccum >= 0.5) {
      fps = Math.round(fpsFrames / fpsAccum);
      fpsFrames = 0;
      fpsAccum = 0;
    }

    // ticks fixos (velocidade do jogo aplicada)
    accumulator += dt * w.config.gameSpeed;
    let steps = 0;
    while (accumulator >= TICK_SECONDS && steps < 20) {
      stepTick(w);
      accumulator -= TICK_SECONDS;
      steps += 1;
    }

    handleKeys(dt);
    handleWheel();
    renderer.camera.update(dt);
    handlePointer();

    renderer.render(w, 0);
    hud.update(w, selection, { fps, timeMs: w.tick * 100 });

    if (miniCtx) {
      const cam = renderer.camera.state();
      const half = cam.zoom * 0.9;
      drawMinimap(miniCtx, w, 0, 196, {
        x0: cam.x - half,
        z0: cam.z - half,
        x1: cam.x + half,
        z1: cam.z + half,
      });
    }

    input.endFrame();
    requestAnimationFrame(frame);
  }

  const appEl = app;
  function resize(): void {
    const w = appEl.clientWidth || window.innerWidth;
    const h = appEl.clientHeight || window.innerHeight;
    renderer.resize(w, h);
  }
  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
}

main();
