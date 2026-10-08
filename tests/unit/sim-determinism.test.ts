import { describe, expect, it } from "vitest";
import { applyCommand } from "@sim/commands";
import { hashString, stableStringify } from "@sim/serialize";
import { stepTick } from "@sim/tick";
import { createWorld } from "@sim/world";
import type { Command, MatchConfig, World } from "@sim/types";

const config: MatchConfig = {
  seed: 2026,
  civ: "french",
  map: "highlands",
  size: "medium",
  bots: [{ difficulty: "hard" }, { difficulty: "easy" }],
  victory: "wonder",
  gameSpeed: 1,
};

/** Roteiro fixo de comandos: move de todos os aldeoes do jogador 0 e stop/queue. */
function script(w: World): Map<number, Command[]> {
  const v = w.entities.filter((e) => e.type === "villager" && e.owner === 0).map((e) => e.id);
  const s = w.entities.find((e) => e.type === "scout" && e.owner === 0);
  const plan = new Map<number, Command[]>();
  plan.set(0, [{ tick: 0, type: "move", unitIds: v, x: 40, z: 40 }]);
  plan.set(50, [{ tick: 50, type: "move", unitIds: s ? [s.id] : [], x: 100, z: 30 }]);
  plan.set(90, [{ tick: 90, type: "stop", unitIds: v }]);
  plan.set(120, [{ tick: 120, type: "move", unitIds: v, x: 30, z: 100, queue: true }]);
  return plan;
}

/** Executa N ticks com o roteiro; devolve hash do estado serializado. */
function runAndHash(ticks: number): string {
  const w = createWorld(config);
  const plan = script(w);
  for (let t = 0; t < ticks; t++) {
    for (const cmd of plan.get(t) ?? []) applyCommand(w, cmd, 0);
    stepTick(w);
  }
  return hashString(stableStringify(w));
}

describe("determinismo", () => {
  it("duas execucoes com mesma seed, comandos e 200 ticks geram o mesmo hash", () => {
    const h1 = runAndHash(200);
    const h2 = runAndHash(200);
    expect(h1).toBe(h2);
  });

  it("estados intermediarios tambem batem (tick 100)", () => {
    expect(runAndHash(100)).toBe(runAndHash(100));
  });

  it("seed diferente altera o hash (o teste nao e trivial)", () => {
    const a = createWorld(config);
    const b = createWorld({ ...config, seed: 2027 });
    expect(hashString(stableStringify(a))).not.toBe(hashString(stableStringify(b)));
  });
});
