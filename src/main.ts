/**
 * Bootstrap placeholder de scaffold.
 *
 * Fase 1 substitui este arquivo pelo bootstrap real (render 3D + input + HUD),
 * mantendo o contrato documentado em docs/ARCHITECTURE.md.
 */
const app = document.getElementById("app");
if (app) {
  app.textContent = "Crown of Ages — scaffold";
}

interface ScaffoldApi {
  readonly version: string;
  readonly status: string;
}

declare global {
  interface Window {
    __game: ScaffoldApi;
  }
}

window.__game = { version: "scaffold", status: "not-implemented" };
