/**
 * api.ts — contrato `window.__game` (docs/ARCHITECTURE.md §4).
 *
 * Fábrica pura: as dependências (criação de mundo, tick, comandos, seleção, fps) são
 * injetadas, então este módulo não importa `sim` nem `render` diretamente.
 */
import type { Command, MatchConfig, World } from "@sim/types";

/** Limite de ticks por chamada de `tick`, para evitar travar o navegador. */
const MAX_TICKS_PER_CALL = 10000;

/** Superfície pública exposta em `window.__game`. */
export interface GameApi {
  version: string;
  newMatch(config: MatchConfig): string;
  tick(n?: number): void;
  send(command: Command): void;
  getState(): World;
  getSelection(): number[];
  stats(): { fps: number; entities: number; ticks: number };
  headless(): boolean;
}

/** Dependências injetadas pelo bootstrap do jogo. */
export interface GameApiDeps {
  createWorld: (config: MatchConfig) => World;
  stepTick: (world: World) => void;
  applyCommand: (world: World, cmd: Command) => void;
  getSelection: () => number[];
  getFps: () => number;
}

/** Cria a API do jogo sobre as dependências injetadas. */
export function createGameApi(deps: GameApiDeps): GameApi {
  let world: World | undefined;
  let matchCounter = 0;

  const requireWorld = (): World => {
    if (!world) throw new Error("Nenhuma partida ativa: chame newMatch antes.");
    return world;
  };

  return {
    version: "0.1.0",
    newMatch(config: MatchConfig): string {
      world = deps.createWorld(config);
      matchCounter += 1;
      return `match-${matchCounter}`;
    },
    tick(n = 1): void {
      const w = requireWorld();
      const count = Math.min(Math.max(0, Math.floor(n)), MAX_TICKS_PER_CALL);
      for (let i = 0; i < count; i += 1) {
        deps.stepTick(w);
      }
    },
    send(command: Command): void {
      const w = requireWorld();
      command.tick = w.tick;
      deps.applyCommand(w, command);
    },
    getState(): World {
      return requireWorld();
    },
    getSelection(): number[] {
      return deps.getSelection();
    },
    stats(): { fps: number; entities: number; ticks: number } {
      // Sem partida ativa, retorna contagens zeradas em vez de lançar erro.
      return {
        fps: deps.getFps(),
        entities: world ? world.entities.length : 0,
        ticks: world ? world.tick : 0,
      };
    },
    headless(): boolean {
      return typeof window === "undefined";
    },
  };
}
