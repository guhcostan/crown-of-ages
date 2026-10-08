/**
 * input.ts — estado de mouse e teclado da cola do jogo.
 *
 * Captura eventos de ponteiro/roda no elemento DOM informado e de teclado na janela
 * (o canvas raramente tem foco de teclado). Não implementa câmera: só expõe estado.
 * O main deve chamar `endFrame()` uma vez por frame para limpar `justPressed` e `wheelDelta`.
 */

/** Distância mínima (px) para um arrasto com botão esquerdo ser considerado drag. */
const DRAG_THRESHOLD_PX = 4;

export interface InputState {
  mouse: { x: number; y: number };
  left: boolean;
  right: boolean;
  middle: boolean;
  dragging: boolean;
  dragStart: { x: number; y: number };
  shift: boolean;
  ctrl: boolean;
  /** Acumulado de rolagem da roda desde o último consumo/frame. */
  wheelDelta: number;
  /** Teclas atualmente pressionadas (valor `KeyboardEvent.key`). */
  keys: Set<string>;
  /** Teclas pressionadas neste frame (limpo por `endFrame`). */
  justPressed: Set<string>;
}

export interface InputHandle {
  state: InputState;
  /** Lê e zera o acumulado da roda. */
  consumeWheel(): number;
  /** Limpa `justPressed` e `wheelDelta`; chamar uma vez por frame. */
  endFrame(): void;
  /** Remove todos os listeners. */
  dispose(): void;
}

/** Posição do ponteiro relativa ao elemento. */
function localPoint(dom: HTMLElement, e: PointerEvent | WheelEvent): { x: number; y: number } {
  const rect = dom.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

/**
 * Anexa listeners de entrada ao elemento `dom` (ponteiro, roda, contextmenu) e à janela
 * (teclado). Retorna o estado vivo e funções de consumo/limpeza.
 */
export function attachInput(dom: HTMLElement): InputHandle {
  const state: InputState = {
    mouse: { x: 0, y: 0 },
    left: false,
    right: false,
    middle: false,
    dragging: false,
    dragStart: { x: 0, y: 0 },
    shift: false,
    ctrl: false,
    wheelDelta: 0,
    keys: new Set<string>(),
    justPressed: new Set<string>(),
  };

  const syncModifiers = (e: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }): void => {
    state.shift = e.shiftKey;
    // Cmd (metaKey) conta como ctrl no macOS.
    state.ctrl = e.ctrlKey || e.metaKey;
  };

  const onPointerDown = (e: PointerEvent): void => {
    syncModifiers(e);
    const p = localPoint(dom, e);
    state.mouse = p;
    if (e.button === 0) {
      state.left = true;
      state.dragStart = p;
      state.dragging = false;
    } else if (e.button === 1) {
      state.middle = true;
    } else if (e.button === 2) {
      state.right = true;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    syncModifiers(e);
    const p = localPoint(dom, e);
    state.mouse = p;
    if (state.left && !state.dragging) {
      const dx = p.x - state.dragStart.x;
      const dy = p.y - state.dragStart.y;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) state.dragging = true;
    }
  };

  const onPointerUp = (e: PointerEvent): void => {
    syncModifiers(e);
    state.mouse = localPoint(dom, e);
    if (e.button === 0) {
      state.left = false;
      state.dragging = false;
    } else if (e.button === 1) {
      state.middle = false;
    } else if (e.button === 2) {
      state.right = false;
    }
  };

  const onPointerCancel = (): void => {
    state.left = false;
    state.right = false;
    state.middle = false;
    state.dragging = false;
  };

  const onWheel = (e: WheelEvent): void => {
    syncModifiers(e);
    e.preventDefault();
    state.wheelDelta += e.deltaY;
  };

  const onContextMenu = (e: Event): void => {
    // Botão direito é usado para comandos; o menu nativo não deve aparecer.
    e.preventDefault();
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    syncModifiers(e);
    if (!state.keys.has(e.key) && !e.repeat) state.justPressed.add(e.key);
    state.keys.add(e.key);
  };

  const onKeyUp = (e: KeyboardEvent): void => {
    syncModifiers(e);
    state.keys.delete(e.key);
  };

  dom.addEventListener("pointerdown", onPointerDown);
  dom.addEventListener("pointermove", onPointerMove);
  dom.addEventListener("pointerup", onPointerUp);
  dom.addEventListener("pointercancel", onPointerCancel);
  dom.addEventListener("wheel", onWheel, { passive: false });
  dom.addEventListener("contextmenu", onContextMenu);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return {
    state,
    consumeWheel(): number {
      const delta = state.wheelDelta;
      state.wheelDelta = 0;
      return delta;
    },
    endFrame(): void {
      state.justPressed.clear();
      state.wheelDelta = 0;
    },
    dispose(): void {
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerCancel);
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    },
  };
}
