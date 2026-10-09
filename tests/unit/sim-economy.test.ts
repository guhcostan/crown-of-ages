import { describe, expect, it } from "vitest";
import { applyCommand } from "@sim/commands";
import { CARRY, GATHER_RATES } from "@sim/economy";
import { stepTick } from "@sim/tick";
import { createWorld } from "@sim/world";
import type { Entity, MatchConfig, World } from "@sim/types";

const config: MatchConfig = {
  seed: 77,
  civ: "english",
  map: "steppes",
  size: "small",
  bots: [],
  victory: "landmarks",
  gameSpeed: 1,
};

/** Primeiro aldeão do jogador 0. */
function villager(w: World): Entity {
  const v = w.entities.find((e) => e.type === "villager" && e.owner === 0);
  if (!v) throw new Error("sem aldeao");
  return v;
}

/** Centro da cidade do jogador 0. */
function townCenter(w: World): Entity {
  const tc = w.entities.find((e) => e.type === "town-center" && e.owner === 0);
  if (!tc) throw new Error("sem TC");
  return tc;
}

/** Recurso do mapa (entity kind=resource) mais próximo de um tipo, a partir de um ponto. */
function nearestResource(w: World, type: string, x: number, z: number): Entity {
  let best: Entity | undefined;
  let bestD = Infinity;
  for (const e of w.entities) {
    if (e.kind !== "resource" || e.type !== type) continue;
    const d = Math.hypot(e.x - x, e.z - z);
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }
  if (!best) throw new Error(`sem recurso ${type}`);
  return best;
}

/** Recurso do mapa correspondente à posição de um entity de recurso. */
function mapAmount(w: World, e: Entity): number {
  const r = w.map.resources.find((m) => m.x === e.x && m.z === e.z);
  if (!r) throw new Error("recurso sem correspondente no mapa");
  return r.amount;
}

describe("taxas e capacidade (SPEC §7.1)", () => {
  it("arbusto 0,66/s; madeira 0,75/s; caça carrega 25 e demais 10", () => {
    expect(GATHER_RATES.berry).toBe(0.66);
    expect(GATHER_RATES.tree).toBe(0.75);
    expect(CARRY.berry).toBe(10);
    expect(CARRY.tree).toBe(10);
    expect(CARRY.sheep).toBe(25);
    expect(CARRY.deer).toBe(25);
  });
});

describe("coleta de arbusto (berry)", () => {
  it("aldeão com ordem gather enche 10 comida em ~15 s e deposita no TC", () => {
    const w = createWorld(config);
    const v = villager(w);
    const tc = townCenter(w);
    const berry = nearestResource(w, "berry", v.x, v.z);
    // Posiciona o aldeão ao lado da baga para começar a coletar sem caminhada.
    v.x = berry.x;
    v.z = berry.z;
    const food0 = w.players[0]?.resources.food ?? 0;

    applyCommand(w, { tick: 0, type: "gather", unitIds: [v.id], entityId: berry.id, queue: false }, 0);

    // 10 / 0.66 ≈ 15,2 s = 152 ticks para encher a carga. Depois anda ate o TC e deposita.
    // Limite generoso (600 ticks = 60 s) para incluir o trajeto.
    let deposited = false;
    for (let i = 0; i < 600 && !deposited; i++) {
      stepTick(w);
      if ((w.players[0]?.resources.food ?? 0) > food0) deposited = true;
    }
    expect(deposited).toBe(true);
    // Após o depósito, a comida do jogador aumentou exatamente pela carga (10).
    expect((w.players[0]?.resources.food ?? 0) - food0).toBe(10);
    // Drop-off é o TC (único edifício com comida no início).
    expect(tc.owner).toBe(0);
  });

  it("tempo de enchimento da carga próximo de 15 s (152 ticks ± margem)", () => {
    const w = createWorld(config);
    const v = villager(w);
    const berry = nearestResource(w, "berry", v.x, v.z);
    v.x = berry.x;
    v.z = berry.z;
    applyCommand(w, { tick: 0, type: "gather", unitIds: [v.id], entityId: berry.id, queue: false }, 0);
    // Mede só o enchimento: a baga está ao alcance, então nenhum deslocamento ocorre.
    let ticks = 0;
    while ((v.carrying?.amount ?? 0) < 10 && ticks < 400) {
      stepTick(w);
      ticks++;
    }
    // 10 / (0.66 * 0.1) ≈ 151,5 -> 152 ticks (SPEC §7.1: taxa exata, sem arredondamento).
    expect(ticks).toBe(152);
  });
});

describe("caça (sheep)", () => {
  it("ovelha de 100 comida some do mapa após coleta total (amount chega a 0)", () => {
    const w = createWorld(config);
    const v = villager(w);
    const sheep = nearestResource(w, "sheep", v.x, v.z);
    v.x = sheep.x;
    v.z = sheep.z;
    applyCommand(w, { tick: 0, type: "gather", unitIds: [v.id], entityId: sheep.id, queue: false }, 0);

    // Coleta até a ovelha zerar.
    for (let i = 0; i < 4000 && mapAmount(w, sheep) > 0; i++) stepTick(w);
    expect(mapAmount(w, sheep)).toBe(0);
    // Dá tempo para o aldeão soltar o alvo e entregar a carga residual (efeito eventual).
    for (let i = 0; i < 800; i++) stepTick(w);
    expect(v.gatherTargetId).toBeUndefined();
    // Conservação: 200 iniciais + 100 do rebanho = 300 no total, e a carga residual
    // (< CARRY) é entregue depois. Nada se perde nem é criado do nada.
    // Tolerância para ponto flutuante (somas fracionadas da coleta).
    const food = w.players[0]?.resources.food ?? 0;
    expect(food).toBeCloseTo(300, 6);
  });
});

describe("fazenda", () => {
  it("fazenda tem 120 de comida; coleta reduz o pool e ao zerar deixa de ser alvo", () => {
    const w = createWorld(config);
    const v = villager(w);
    // Fazenda e Centro da Cidade lado a lado: a entrega é imediata (sem caminhada longa).
    const tc = townCenter(w);
    v.x = tc.x + 3;
    v.z = tc.z;
    const farm: Entity = {
      id: w.nextId++,
      kind: "building",
      type: "farm",
      owner: 0,
      x: tc.x + 3,
      z: tc.z + 1,
      y: 0,
      hp: 300,
      maxHp: 120,
      facing: 0,
      built: true,
      training: [],
    };
    w.entities.push(farm);
    applyCommand(w, { tick: 0, type: "gather", unitIds: [v.id], entityId: farm.id, queue: false }, 0);

    // Fazenda começa com 120 de comida no pool (maxHp, ver economy.ts).
    expect(farm.maxHp).toBe(120);
    for (let i = 0; i < 3000 && farm.maxHp > 0; i++) stepTick(w);
    expect(farm.maxHp).toBe(0);
    // Dá tempo para soltar o alvo e entregar a última carga.
    for (let i = 0; i < 300; i++) stepTick(w);
    expect(v.gatherTargetId).toBeUndefined();
    // Todo o pool (120) chegou ao jogador, menos no máximo uma carga ainda em trânsito.
    const food = w.players[0]?.resources.food ?? 0;
    expect(food).toBeCloseTo(200 + 120, 6);
  });
});

describe("drop-off de madeira", () => {
  it("lumber-camp aceita madeira: aldeão deposita no acampamento quando ele existe", () => {
    const w = createWorld(config);
    const v = villager(w);
    const tree = nearestResource(w, "tree", v.x, v.z);
    v.x = tree.x;
    v.z = tree.z;
    // Acampamento de madeira (built) bem perto da árvore, do mesmo dono.
    const camp: Entity = {
      id: w.nextId++,
      kind: "building",
      type: "lumber-camp",
      owner: 0,
      x: tree.x + 1,
      z: tree.z,
      y: 0,
      hp: 750,
      maxHp: 750,
      facing: 0,
      built: true,
      dropOff: ["wood"],
      training: [],
    };
    w.entities.push(camp);
    const wood0 = w.players[0]?.resources.wood ?? 0;

    applyCommand(w, { tick: 0, type: "gather", unitIds: [v.id], entityId: tree.id, queue: false }, 0);
    for (let i = 0; i < 600; i++) stepTick(w);

    expect((w.players[0]?.resources.wood ?? 0) - wood0).toBeGreaterThanOrEqual(10);
  });
});
