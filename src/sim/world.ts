/**
 * world.ts — criação do estado inicial da partida (World).
 *
 * Stats das unidades vêm dos JSONs do dataset (data/aoe4), não de números inventados.
 * Valores lidos: villager hp 50, speed 1.125, sight 28; scout hp 110, speed 1.625,
 * sight 41; town-center hp 2500, buildTime 150 s (costs.time).
 */

import villagerJson from "../../data/aoe4/units/english/villager-1.json";
import scoutJson from "../../data/aoe4/units/english/scout-1.json";
import townCenterJson from "../../data/aoe4/buildings/english/town-center-1.json";
import { generateMap, heightAt } from "./map";
import { createRng } from "./rng";
import type { Entity, MatchConfig, PlayerState, World } from "./types";

/** Tipo mínimo dos JSONs que usamos (campos lidos explicitamente, sem `any`). */
interface UnitStats {
  hp: number;
  speed: number;
  sight: number;
}

interface BuildingStats {
  hp: number;
  buildTime: number;
  sight: number;
}

function readUnitStats(json: {
  hitpoints: number;
  movement: { speed: number };
  sight: { outer_radius: number };
}): UnitStats {
  return {
    hp: json.hitpoints,
    speed: json.movement.speed,
    sight: json.sight.outer_radius,
  };
}

function readBuildingStats(json: {
  hitpoints: number;
  costs: { time: number };
  sight: { outer_radius: number };
}): BuildingStats {
  return {
    hp: json.hitpoints,
    buildTime: json.costs.time,
    sight: json.sight.outer_radius,
  };
}

/** Stats lidos uma vez dos JSONs (constantes puras de módulo). */
export const VILLAGER_STATS: UnitStats = readUnitStats(villagerJson);
export const SCOUT_STATS: UnitStats = readUnitStats(scoutJson);
export const TOWN_CENTER_STATS: BuildingStats = readBuildingStats(townCenterJson);

/** Offsets (em unidades de mundo, tile=2) dos 3 aldeões iniciais, em triângulo. */
const VILLAGER_RING: ReadonlyArray<readonly [number, number]> = [
  [6, 0],
  [-3, 5.196],
  [-3, -5.196],
];

/** Recursos iniciais por jogador (SPEC/brief de simulação). */
const START_RESOURCES = { food: 200, wood: 200, gold: 100, stone: 100 } as const;
const START_POP = 4;
const START_POP_CAP = 10;

/** Nome de exibição do jogador (humano = "Jogador", bots numerados). */
function playerName(id: number, isBot: boolean): string {
  return isBot ? `Bot ${id}` : "Jogador";
}

/**
 * Cria uma entidade com id dado. Helper interno para manter o formato uniforme.
 */
function makeEntity(
  id: number,
  base: Omit<Entity, "id" | "y">,
  world: Pick<World, "map">,
): Entity {
  return { ...base, id, y: heightAt(world.map, base.x, base.z) };
}

/** Marca como visível (2) os tiles dentro do raio `sight` (unidades de mundo) de (x,z). */
export function revealAround(world: World, player: number, x: number, z: number, sight: number): void {
  const vis = world.visibility[player];
  if (!vis) return;
  const tile = world.map.tile;
  const cx = roundNum(x / tile);
  const cz = roundNum(z / tile);
  const r = roundNum(sight / tile);
  for (let dz = -r; dz <= r; dz++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dz * dz > r * r) continue;
      const tx = cx + dx;
      const tz = cz + dz;
      if (tx < 0 || tz < 0 || tx >= world.map.w || tz >= world.map.h) continue;
      vis[tz * world.map.w + tx] = 2;
    }
  }
}

/** Arredonda para o inteiro mais próximo (metade para cima), sem Math. */
function roundNum(v: number): number {
  return Math.floor(v + 0.5);
}

/**
 * Cria o mundo inicial de uma partida. Um jogador humano (id 0) + um por bot.
 * Cada jogador começa com 1 Centro da Cidade (built), 3 aldeões e 1 batedor.
 */
export function createWorld(config: MatchConfig): World {
  const map = generateMap(config.seed, config.map, config.size);
  const rng = createRng(config.seed);
  const playerCount = 1 + config.bots.length;

  const players: PlayerState[] = [];
  for (let p = 0; p < playerCount; p++) {
    const isBot = p > 0;
    const bot = isBot ? config.bots[p - 1] : undefined;
    const state: PlayerState = {
      id: p,
      name: playerName(p, isBot),
      civ: config.civ,
      color: p,
      resources: { ...START_RESOURCES },
      pop: START_POP,
      popCap: START_POP_CAP,
      age: 1,
      isBot,
      defeated: false,
      score: 0,
    };
    if (bot) state.difficulty = bot.difficulty;
    players.push(state);
  }

  const visibility: number[][] = [];
  for (let p = 0; p < playerCount; p++) {
    visibility.push(new Array<number>(map.w * map.h).fill(0));
  }

  const world: World = {
    tick: 0,
    config,
    map,
    entities: [],
    players,
    rngState: rng.state(),
    nextId: 1,
    visibility,
    victory: { kind: "playing" },
  };

  // Spawns: usa os primeiros `playerCount` cantos gerados pelo mapa.
  for (let p = 0; p < playerCount; p++) {
    const spawn = map.spawns[p];
    if (!spawn) throw new Error(`createWorld: spawn ausente para o jogador ${p}`);
    const cx = spawn.x;
    const cz = spawn.z;

    // Centro da cidade: construído desde o início.
    const tc = makeEntity(
      world.nextId++,
      {
        kind: "building",
        type: "town-center",
        owner: p,
        x: cx,
        z: cz,
        hp: TOWN_CENTER_STATS.hp,
        maxHp: TOWN_CENTER_STATS.hp,
        facing: 0,
        built: true,
        buildProgressMax: TOWN_CENTER_STATS.buildTime,
        dropOff: ["food", "wood", "gold", "stone"],
        training: [],
        rallyX: cx,
        rallyZ: cz,
        popProvided: 0,
      },
      world,
    );
    world.entities.push(tc);
    revealAround(world, p, cx, cz, TOWN_CENTER_STATS.sight);

    // 3 aldeões em anel de 3 tiles ao redor do centro.
    for (let v = 0; v < 3; v++) {
      // Posições fixas em triângulo (sem trigonometria): distância de 3 tiles.
      const ox = VILLAGER_RING[v]?.[0] ?? 0;
      const oz = VILLAGER_RING[v]?.[1] ?? 0;
      const villager = makeEntity(
        world.nextId++,
        {
          kind: "unit",
          type: "villager",
          owner: p,
          x: cx + ox,
          z: cz + oz,
          hp: VILLAGER_STATS.hp,
          maxHp: VILLAGER_STATS.hp,
          facing: 0,
          movementSpeed: VILLAGER_STATS.speed,
          sight: VILLAGER_STATS.sight,
          orders: [],
          path: [],
          pathIndex: 0,
          attackCooldown: 0,
        },
        world,
      );
      world.entities.push(villager);
      revealAround(world, p, villager.x, villager.z, VILLAGER_STATS.sight);
    }

    // 1 batedor à frente do centro.
    const scout = makeEntity(
      world.nextId++,
      {
        kind: "unit",
        type: "scout",
        owner: p,
        x: cx + 5 * map.tile,
        z: cz,
        hp: SCOUT_STATS.hp,
        maxHp: SCOUT_STATS.hp,
        facing: 0,
        movementSpeed: SCOUT_STATS.speed,
        sight: SCOUT_STATS.sight,
        orders: [],
        path: [],
        pathIndex: 0,
        attackCooldown: 0,
      },
      world,
    );
    world.entities.push(scout);
    revealAround(world, p, scout.x, scout.z, SCOUT_STATS.sight);
  }

  // Recursos do mapa viram entidades kind "resource" (ids após os jogadores).
  for (const r of map.resources) {
    const res = makeEntity(
      world.nextId++,
      {
        kind: "resource",
        type: r.kind,
        owner: -1,
        x: r.x,
        z: r.z,
        hp: 1,
        maxHp: 1,
        facing: 0,
      },
      world,
    );
    world.entities.push(res);
  }

  world.rngState = rng.state();
  return world;
}

