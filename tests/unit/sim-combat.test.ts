import { describe, expect, it } from "vitest";
import { stepCombat } from "@sim/combat";
import { createWorld } from "@sim/world";
import type { Entity, MatchConfig, World } from "@sim/types";

const config: MatchConfig = {
  seed: 91,
  civ: "english",
  map: "steppes",
  size: "small",
  bots: [{ difficulty: "easy" }],
  victory: "landmarks",
  gameSpeed: 1,
};

/** Cria um mundo com 2 jogadores e substitui as entidades por um cenário literal. */
function scenario(entities: Entity[]): World {
  const w = createWorld(config);
  w.entities = entities;
  return w;
}

/** Spearman literal conforme spec: hp 80, dano 8, alcance 0.3, cadência 0.75, speed 1.25. */
function spearman(id: number, owner: number, x: number, z: number): Entity {
  return {
    id,
    kind: "unit",
    type: "spearman",
    owner,
    x,
    z,
    y: 0,
    hp: 80,
    maxHp: 80,
    facing: 0,
    movementSpeed: 1.25,
    sight: 20,
    orders: [{ type: "attackMove", queue: false }],
    path: [],
    pathIndex: 0,
    attackCooldown: 0,
  };
}

describe("stepCombat — duelo de spearmen", () => {
  it("mata o inimigo em 500 ticks, mantém atacantes vivos e limita a perseguição", () => {
    // Dois atacantes (dono 0) e um inimigo parado (dono 1), a 3 unidades de distância.
    const a1 = spearman(1, 0, 10, 10);
    const a2 = spearman(2, 0, 10, 11);
    const enemy = spearman(3, 1, 13, 10);
    const w = scenario([a1, a2, enemy]);
    // Sem o unitario de dono 1 ter ordem, ele não revida: isolamos o comportamento de perseguição.
    enemy.orders = [];

    for (let t = 0; t < 500; t++) stepCombat(w);

    expect(w.entities.find((e) => e.id === 3)).toBeUndefined();
    const survivors = w.entities.filter((e) => e.kind === "unit");
    expect(survivors.map((e) => e.id).sort()).toEqual([1, 2]);
    expect(a1.hp).toBe(80);
    expect(a2.hp).toBe(80);
    // Perseguição limitada: os atacantes não atravessam a posição do alvo.
    expect(a1.x).toBeLessThanOrEqual(13);
    expect(a2.x).toBeLessThanOrEqual(13);
    expect(a1.x).toBeGreaterThanOrEqual(10);
  });

  it("aplica dano e define cooldown > 0 após o golpe", () => {
    // Inimigo já dentro do alcance: distância 0.5 <= alcance 0.295 + raio 0.5.
    const a1 = spearman(1, 0, 10, 10);
    const a2 = spearman(2, 0, 10, 10.1);
    const enemy = spearman(3, 1, 10.5, 10);
    enemy.orders = [];
    const w = scenario([a1, a2, enemy]);

    stepCombat(w);

    // Ambos atacam no mesmo tick (cooldown 0 inicial): 2 x 8 de dano, armadura 0.
    expect(enemy.hp).toBe(64);
    expect(a1.attackCooldown).toBeGreaterThan(0);
    expect(a2.attackCooldown).toBeGreaterThan(0);
    expect(a1.attackTargetId).toBe(3);
  });

  it("não ataca aliados nem neutros e não move unidade parada sem ordem de ataque", () => {
    const parado = spearman(1, 0, 10, 10);
    parado.orders = [];
    const amigo = spearman(2, 0, 10.2, 10);
    const neutro = spearman(3, -1, 10.2, 10.2);
    neutro.orders = [];
    const w = scenario([parado, amigo, neutro]);

    stepCombat(w);

    expect(amigo.hp).toBe(80);
    expect(neutro.hp).toBe(80);
    expect(parado.x).toBe(10);
    expect(parado.z).toBe(10);
  });
});
