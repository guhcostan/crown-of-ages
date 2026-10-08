import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Integridade do dataset aoe4world (fonte primaria dos numeros do jogo).
 * Estes valores foram extraidos dos JSON de data/aoe4 e verificados contra o
 * dataset upstream; se alguem trocar o dataset, este teste falha.
 */
const root = fileURLToPath(new URL("../..", import.meta.url));
const read = (rel: string): unknown => JSON.parse(readFileSync(`${root}/${rel}`, "utf8")) as unknown;

describe("dataset aoe4 (english)", () => {
  it("spearman-2 (Hardened Spearman) tem custos/HP/dano do dataset", () => {
    const u = read("data/aoe4/units/english/spearman-2.json") as {
      hitpoints: number;
      costs: { food: number; wood: number; gold: number; stone: number; time: number };
      weapons: Array<{ name: string; damage: number; durations: { cooldown: number } }>;
      movement: { speed: number };
    };
    expect(u.hitpoints).toBe(90);
    expect(u.costs).toMatchObject({ food: 60, wood: 20, gold: 0, stone: 0, time: 15 });
    const spear = u.weapons.find((w) => w.name === "Spear");
    expect(spear?.damage).toBe(8);
    expect(spear?.durations.cooldown).toBe(0.75);
    expect(u.movement.speed).toBe(1.25);
  });

  it("villager-1 (Villager) tem custo/HP do dataset", () => {
    const u = read("data/aoe4/units/english/villager-1.json") as {
      hitpoints: number;
      costs: { food: number; time: number; popcap: number };
    };
    expect(u.hitpoints).toBe(50);
    expect(u.costs.food).toBe(50);
    expect(u.costs.time).toBe(20);
    expect(u.costs.popcap).toBe(1);
  });
});

describe("dataset aoe4 (french)", () => {
  it("arbaletrier (unica francesa) existe no dataset", () => {
    const u = read("data/aoe4/units/french/arbaletrier-4.json") as {
      name: string;
      unique: boolean;
      hitpoints: number;
      age: number;
    };
    expect(u.unique).toBe(true);
    expect(u.age).toBe(4);
    expect(u.hitpoints).toBeGreaterThan(0);
  });
});

describe("civilizacoes", () => {
  it("english tem bonus de farms -50% e network of castles", () => {
    const c = read("data/aoe4/civilizations/english.json") as {
      name: string;
      overview: Array<{ title: string; list?: string[] }>;
    };
    expect(c.name).toBe("English");
    const bonuses = c.overview[0]?.list?.join(" | ") ?? "";
    expect(bonuses).toContain("Farms are -50% cheaper");
    expect(bonuses).toContain("+20%");
  });

  it("french tem bonus de cavalaria real", () => {
    const c = read("data/aoe4/civilizations/french.json") as {
      name: string;
      overview: Array<{ title: string; list?: string[] }>;
    };
    expect(c.name).toBe("French");
    const text = JSON.stringify(c.overview);
    expect(text.toLowerCase()).toContain("knight");
  });
});
