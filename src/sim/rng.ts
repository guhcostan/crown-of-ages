/**
 * rng.ts — RNG determinístico (mulberry32) da partida.
 *
 * Toda aleatoriedade da simulação passa por aqui. O estado é um uint32, o que o
 * mantém JSON-serializável (determinismo verificável por hash do mundo).
 */
import type { Rng } from "./types";

/** Cria um RNG mulberry32 com a semente dada. Estado = uint32 (JSON-serializável). */
export function createRng(seed: number): Rng {
  let a = seed | 0;

  const next = (): number => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int(min: number, max: number): number {
      if (max < min) throw new Error(`rng.int: intervalo invertido [${min}, ${max}]`);
      return Math.floor(next() * (max - min + 1)) + min;
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error("rng.pick: lista vazia");
      const item = items[Math.floor(next() * items.length)];
      if (item === undefined) throw new Error("rng.pick: índice fora do intervalo");
      return item;
    },
    state(): number {
      return a >>> 0;
    },
    restore(state: number): void {
      a = state | 0;
    },
  };
}
