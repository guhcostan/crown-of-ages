import { describe, expect, it } from "vitest";
import { applyCommand } from "@sim/commands";
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

function villager(w: World): Entity {
  const v = w.entities.find((e) => e.type === "villager" && e.owner === 0);
  if (!v) throw new Error("sem aldeao");
  return v;
}

/** Um ponto de construção livre a 4 unidades do centro da cidade (ao lado do TC). */
function freeSpotNearTc(w: World): { x: number; z: number } {
  const tc = w.entities.find((e) => e.type === "town-center" && e.owner === 0);
  if (!tc) throw new Error("sem TC");
  const tile = w.map.tile;
  // Procura um tile livre (não bloqueado) em anel ao redor do TC, de forma determinística.
  for (let r = 4; r < 12; r++) {
    for (let dz = -r; dz <= r; dz++) {
      for (let dx = -r; dx <= r; dx++) {
        const tx = Math.floor(tc.x / tile) + dx;
        const tz = Math.floor(tc.z / tile) + dz;
        if (tx < 1 || tz < 1 || tx >= w.map.w - 1 || tz >= w.map.h - 1) continue;
        if (w.map.blocked[tz * w.map.w + tx]) continue;
        if (w.map.blocked[tz * w.map.w + tx + 1] || w.map.blocked[(tz + 1) * w.map.w + tx]) continue;
        if (w.map.blocked[(tz + 1) * w.map.w + tx + 1] || w.map.blocked[(tz - 1) * w.map.w + tx]) continue;
        if (w.map.blocked[tz * w.map.w + tx - 1] || w.map.blocked[(tz - 1) * w.map.w + tx - 1]) continue;
        return { x: (tx + 0.5) * tile, z: (tz + 0.5) * tile };
      }
    }
  }
  throw new Error("sem tile livre perto do TC");
}

function houses(w: World): Entity[] {
  return w.entities.filter((e) => e.kind === "building" && e.type === "house" && e.owner === 0);
}

describe("build (fantasma de construção)", () => {
  it("send build house -> fantasma existe com built=false e custo descontado", () => {
    const w = createWorld(config);
    const v = villager(w);
    const spot = freeSpotNearTc(w);
    const wood0 = w.players[0]?.resources.wood ?? 0;

    applyCommand(
      w,
      { tick: 0, type: "build", unitIds: [v.id], buildingType: "house", x: spot.x, z: spot.z, queue: false },
      0,
    );

    const ghosts = houses(w);
    expect(ghosts.length).toBe(1);
    expect(ghosts[0]?.built).toBe(false);
    expect(ghosts[0]?.buildProgress).toBe(0);
    expect(ghosts[0]?.buildProgressMax).toBe(15);
    expect(w.players[0]?.resources.wood).toBe(wood0 - 50);
  });

  it("600 ticks depois a casa está pronta (built=true) e popCap sobe +10", () => {
    const w = createWorld(config);
    const v = villager(w);
    const spot = freeSpotNearTc(w);
    const cap0 = w.players[0]?.popCap ?? 0;

    applyCommand(
      w,
      { tick: 0, type: "build", unitIds: [v.id], buildingType: "house", x: spot.x, z: spot.z, queue: false },
      0,
    );
    for (let i = 0; i < 600; i++) stepTick(w);

    const h = houses(w)[0];
    expect(h?.built).toBe(true);
    expect(h?.hp).toBe(h?.maxHp);
    expect(w.players[0]?.popCap).toBe(cap0 + 10);
  });

  it("recursos insuficientes => nada acontece (sem fantasma, sem débito)", () => {
    const w = createWorld(config);
    const v = villager(w);
    const spot = freeSpotNearTc(w);
    const player = w.players[0];
    if (!player) throw new Error("sem jogador");
    player.resources.wood = 10; // casa custa 50
    const before = { ...player.resources };

    applyCommand(
      w,
      { tick: 0, type: "build", unitIds: [v.id], buildingType: "house", x: spot.x, z: spot.z, queue: false },
      0,
    );

    expect(houses(w).length).toBe(0);
    expect(player.resources).toEqual(before);
  });

  it("aldeão recebe o fantasma como alvo de construção (constructingId)", () => {
    const w = createWorld(config);
    const v = villager(w);
    const spot = freeSpotNearTc(w);
    applyCommand(
      w,
      { tick: 0, type: "build", unitIds: [v.id], buildingType: "house", x: spot.x, z: spot.z, queue: false },
      0,
    );
    const h = houses(w)[0];
    expect(h).toBeDefined();
    expect(v.constructingId).toBe(h?.id);
  });

  it("local bloqueado no mapa => ignora o comando (sem débito)", () => {
    const w = createWorld(config);
    const v = villager(w);
    const tile = w.map.tile;
    const idx = w.map.blocked.findIndex((b) => b);
    if (idx < 0) return; // mapa sem bloqueio nesta seed: nada a testar.
    const bx = (idx % w.map.w + 0.5) * tile;
    const bz = (Math.floor(idx / w.map.w) + 0.5) * tile;
    const wood0 = w.players[0]?.resources.wood ?? 0;

    applyCommand(
      w,
      { tick: 0, type: "build", unitIds: [v.id], buildingType: "house", x: bx, z: bz, queue: false },
      0,
    );
    expect(houses(w).length).toBe(0);
    expect(w.players[0]?.resources.wood).toBe(wood0);
  });
});
