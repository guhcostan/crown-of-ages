import { describe, expect, it } from "vitest";
import { ARMOR_TABLE, BONUS_TABLE, armorDo, bonusContra, danoEfetivo, isMilitary } from "@sim/combat";
import { createWorld } from "@sim/world";
import type { Entity, MatchConfig, World } from "@sim/types";

const config: MatchConfig = {
  seed: 13,
  civ: "english",
  map: "highlands",
  size: "small",
  bots: [{ difficulty: "easy" }],
  victory: "landmarks",
  gameSpeed: 1,
};

function world(): World {
  return createWorld(config);
}

function unit(id: number, type: string, owner = 1): Entity {
  return {
    id,
    kind: "unit",
    type,
    owner,
    x: 0,
    z: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    facing: 0,
  };
}

function building(id: number, type: string, owner = 1): Entity {
  return { id, kind: "building", type, owner, x: 0, z: 0, y: 0, hp: 500, maxHp: 500, facing: 0 };
}

describe("contadores — spearman (english) do dataset", () => {
  it("spearman tem bônus contra cavalaria: danoEfetivo > dano base 8", () => {
    const w = world();
    const spear = unit(1, "spearman", 0);
    const knight = unit(2, "knight");
    // spearman-2.json: meleeAttack cavalry +20 (base 8) vs knight-3 (cavalry + armored, armadura melee 3).
    expect(BONUS_TABLE.spearman?.cavalry).toBe(20);
    expect(danoEfetivo(spear, knight, w)).toBeGreaterThan(8);
    expect(danoEfetivo(spear, knight, w)).toBe(8 + 20 - 3);
  });

  it("knight não tem bônus contra spearman (sem contador de cavalaria)", () => {
    const w = world();
    const knight = unit(1, "knight", 0);
    const spear = unit(2, "spearman");
    expect(bonusContra("knight", spear)).toBe(0);
    // knight-3.json: Sword 24, sem bônus; spearman (light, armadura melee 0) => 24.
    expect(danoEfetivo(knight, spear, w)).toBe(24);
  });
});

describe("contadores — archer (french) vs spearman", () => {
  it("archer tem bônus contra light+melee+infantry: sinal positivo", () => {
    const w = world();
    const archer = unit(1, "archer", 0);
    const spear = unit(2, "spearman");
    // archer-2.json (french): rangedAttack light+melee+infantry +5.
    expect(bonusContra("archer", spear)).toBe(5);
    expect(danoEfetivo(archer, spear, w)).toBe(5 + 5);
  });

  it("spearman não ganha bônus contra arqueiro (sem contador reverso)", () => {
    expect(bonusContra("spearman", unit(1, "archer"))).toBe(0);
  });
});

describe("armadura e dano mínimo", () => {
  it("dano nunca fica abaixo de 1 contra alvo com armadura alta", () => {
    const w = world();
    const villager = unit(1, "villager", 0);
    const tc = building(2, "town-center");
    // villager dano 5 vs building armadura 6: 5 - 6 = -1 -> mínimo 1.
    expect(ARMOR_TABLE.building?.ranged).toBe(6);
    expect(danoEfetivo(villager, tc, w)).toBe(1);
  });

  it("armadura de construção vale 6 (ranged e melee)", () => {
    const tc = building(1, "town-center");
    expect(armorDo(tc, false)).toBe(6);
    expect(armorDo(tc, true)).toBe(6);
  });

  it("cavalaria não tem armadura (0)", () => {
    expect(armorDo(unit(1, "horseman"), false)).toBe(0);
  });
});

describe("classificação militar", () => {
  it("aldeão não é militar; spearman é", () => {
    expect(isMilitary(unit(1, "villager", 0))).toBe(false);
    expect(isMilitary(unit(2, "spearman", 0))).toBe(true);
  });
});
