/**
 * train.ts — definições de unidades treináveis e progresso das filas de produção.
 *
 * Stats vêm de data/aoe4/units/{english,french}/*.json (weapons[0].damage, durations.cooldown,
 * range.max, movement.speed, hitpoints, costs). Escopo do milestone: versão BASE de cada
 * unidade (sem evoluções por era), exceto onde o id já é o da unidade base no dataset.
 *
 * Fontes de referência por unidade (arquivo JSON usado):
 *  - villager: villager-1 (EN) — 50 F, 20 s (FR: 19 s).
 *  - spearman: spearman-1 (FR, única base) — EN começa em spearman-2 (60F/20W, 15 s).
 *  - man-at-arms: man-at-arms-1 (EN, Vanguard) — 90F/20G, 14.65 s.
 *  - archer: archer-2 (FR) — 30F/50W, 15 s.
 *  - crossbowman: crossbowman-3 (EN) — 80F/40G, 22.5 s.
 *  - arbaletrier: arbaletrier-3 (FR) — 80F/40G, 22.5 s.
 *  - horseman: horseman-2 (EN) — 100F/20W, 22.5 s.
 *  - knight: knight-3 (EN) — 140F/100G, 35 s.
 *  - royal-knight: royal-knight-2 (FR) — 140F/100G, 35 s.
 *  - scout: scout-1 (EN) — 65F, 23 s (FR: 21 s).
 *  - mangonel: mangonel-3 (EN) — 400W/200G, 40 s, pop 3.
 *  - monk: monk-3 (EN) — 150G, 30 s. Sem arma (cura/conversão, fase 6).
 *  - longbowman: longbowman-2 (EN, única) — 40F/50W, 15 s.
 *
 * Armadura: o campo `armor[]` do dataset está VAZIO para várias unidades base (ex.: spearman,
 * archer, villager). Para elas usamos valores APROXIMADOS derivados das classes (leve=0,
 * pesado=armadura do armor[] quando existir). Marcado com 'aproximado' nos comentários.
 */

import { findPath } from "./pathfinding";
import type { CivId, Entity, World } from "./types";
import { TICK_SECONDS } from "./types";

export interface UnitDef {
  id: string;
  namePt: string;
  age: number;
  cost: { food: number; wood: number; gold: number; stone: number };
  time: number;
  hp: number;
  speed: number;
  damage: number;
  range: number;
  cooldown: number;
  armorMelee: number;
  armorRanged: number;
  pop: number;
  producedBy: string[];
  classes: string[];
  bonusVs: Record<string, number>;
}

/** Máximo de itens na fila de treino de uma construção. */
export const MAX_TRAINING_QUEUE = 5;

/** Unidade de custo zero em tudo menos o que é explicitado (helper legível). */
function cost(food: number, wood: number, gold: number, stone: number): UnitDef["cost"] {
  return { food, wood, gold, stone };
}

/** Sem bônus de dano contra alvos específicos. */
const NO_BONUS: Record<string, number> = {};

export const UNIT_DEFS: Record<string, UnitDef> = {
  villager: {
    // villager-1.json (EN): hp 50, speed 1.125, Bow 5 dano / cd 2 s / alcance 5 (usado: Torch
    // 10/1.25 s seria o corpo a corpo). Armadura: vazia no dataset -> 0 (aproximado).
    id: "villager",
    namePt: "Aldeão",
    age: 1,
    cost: cost(50, 0, 0, 0),
    time: 20,
    hp: 50,
    speed: 1.125,
    damage: 5,
    range: 5,
    cooldown: 2,
    armorMelee: 0,
    armorRanged: 0,
    pop: 1,
    producedBy: ["town-center", "capital-town-center", "kings-palace"],
    classes: ["villager", "worker", "human", "builder"],
    bonusVs: NO_BONUS,
  },
  spearman: {
    // spearman-1 (FR) / spearman-2 (EN, base mais antiga): 60F/20W, 15 s, hp 90 (EN-2).
    // Dano 8 / cd 0.75 s / alcance 0.295. Bônus vs cavalaria +20 (modifier do dataset).
    // Armadura: vazia -> 0 (aproximado).
    id: "spearman",
    namePt: "Lanceiro",
    age: 1,
    cost: cost(60, 20, 0, 0),
    time: 15,
    hp: 90,
    speed: 1.25,
    damage: 8,
    range: 0.295,
    cooldown: 0.75,
    armorMelee: 0,
    armorRanged: 0,
    pop: 1,
    producedBy: ["barracks", "keep", "the-white-tower", "berkshire-palace"],
    classes: ["infantry", "melee", "spearman", "light"],
    bonusVs: { cavalry: 20 },
  },
  "man-at-arms": {
    // man-at-arms-1 (EN, Vanguard): 90F/20G, 14.65 s, hp 100, armor melee 2 / ranged 3.
    // Dano 8 / cd 0 (sem cooldown no dataset: aproximado para 1 ataque/ tick útil) -> 1.0.
    id: "man-at-arms",
    namePt: "Homem de Armas",
    age: 1,
    cost: cost(90, 0, 20, 0),
    time: 14.65,
    hp: 100,
    speed: 1.125,
    damage: 8,
    range: 0.295,
    cooldown: 1,
    armorMelee: 2,
    armorRanged: 3,
    pop: 1,
    producedBy: ["barracks", "keep", "the-white-tower", "berkshire-palace"],
    classes: ["infantry", "melee", "armored", "heavy", "manatarms"],
    bonusVs: NO_BONUS,
  },
  archer: {
    // archer-2 (FR): 30F/50W, 15 s, hp 70, speed 1.25. Bow 5 dano, cd 0.75 s (reload),
    // alcance 5. Bônus vs leve/infantaria (rangedAttack +5 no dataset).
    id: "archer",
    namePt: "Arqueiro",
    age: 2,
    cost: cost(30, 50, 0, 0),
    time: 15,
    hp: 70,
    speed: 1.25,
    damage: 5,
    range: 5,
    cooldown: 0.75,
    armorMelee: 0,
    armorRanged: 0,
    pop: 1,
    producedBy: ["archery-range", "council-hall", "the-white-tower", "berkshire-palace"],
    classes: ["infantry", "ranged", "archer", "light"],
    bonusVs: { "light-infantry": 5 },
  },
  crossbowman: {
    // crossbowman-3 (EN): 80F/40G, 22.5 s, hp 80, speed 1.125. Dano 11, reload 1.75 s,
    // alcance 5. Bônus vs pesado +10 (modifier rangedAttack no dataset).
    id: "crossbowman",
    namePt: "Besteiro",
    age: 3,
    cost: cost(80, 0, 40, 0),
    time: 22.5,
    hp: 80,
    speed: 1.125,
    damage: 11,
    range: 5,
    cooldown: 1.75,
    armorMelee: 0,
    armorRanged: 0,
    pop: 1,
    producedBy: ["archery-range", "council-hall", "the-white-tower", "berkshire-palace", "keep"],
    classes: ["infantry", "ranged", "crossbowman", "light"],
    bonusVs: { heavy: 10 },
  },
  arbaletrier: {
    // arbaletrier-3 (FR, única): mesmo perfil do besteiro EN: 80F/40G, 22.5 s, hp 80, dano 11.
    // Armadura melee 1 (JSON). Bônus vs pesado +10.
    id: "arbaletrier",
    namePt: "Arbalétrier",
    age: 3,
    cost: cost(80, 0, 40, 0),
    time: 22.5,
    hp: 80,
    speed: 1.125,
    damage: 11,
    range: 5,
    cooldown: 1.75,
    armorMelee: 1,
    armorRanged: 0,
    pop: 1,
    producedBy: ["archery-range"],
    classes: ["infantry", "ranged", "crossbowman", "light"],
    bonusVs: { heavy: 10 },
  },
  horseman: {
    // horseman-2 (EN): 100F/20W, 22.5 s, hp 125, speed 1.875. Spear 9, cd 1.125 s, alcance
    // 0.375. Armadura ranged 2 (JSON). Bônus vs ranged/siege +9 (modifier meleeAttack).
    id: "horseman",
    namePt: "Cavaleiro Leve",
    age: 2,
    cost: cost(100, 20, 0, 0),
    time: 22.5,
    hp: 125,
    speed: 1.875,
    damage: 9,
    range: 0.375,
    cooldown: 1.125,
    armorMelee: 0,
    armorRanged: 2,
    pop: 1,
    producedBy: ["stable", "school-of-cavalry", "keep", "the-white-tower", "berkshire-palace"],
    classes: ["cavalry", "light", "horse"],
    bonusVs: { ranged: 9, siege: 9 },
  },
  knight: {
    // knight-3 (EN): 140F/100G, 35 s, hp 230, speed 1.625. Sword 24, cd 0.875 s, alcance
    // 0.2875. Armadura melee 4 / ranged 4 (JSON). Blindado, pesado.
    id: "knight",
    namePt: "Cavaleiro",
    age: 3,
    cost: cost(140, 0, 100, 0),
    time: 35,
    hp: 230,
    speed: 1.625,
    damage: 24,
    range: 0.2875,
    cooldown: 0.875,
    armorMelee: 4,
    armorRanged: 4,
    pop: 1,
    producedBy: ["stable", "keep", "the-white-tower", "berkshire-palace"],
    classes: ["cavalry", "armored", "heavy", "knight"],
    bonusVs: NO_BONUS,
  },
  "royal-knight": {
    // royal-knight-2 (FR, única): 140F/100G, 35 s, hp 190, speed 1.625. Sword 19 (base),
    // cd 0.875 s, alcance 0.2875. Armadura melee 3 / ranged 3 (JSON).
    id: "royal-knight",
    namePt: "Cavaleiro Real",
    age: 2,
    cost: cost(140, 0, 100, 0),
    time: 35,
    hp: 190,
    speed: 1.625,
    damage: 19,
    range: 0.2875,
    cooldown: 0.875,
    armorMelee: 3,
    armorRanged: 3,
    pop: 1,
    producedBy: ["school-of-cavalry", "stable"],
    classes: ["cavalry", "armored", "heavy", "knight"],
    bonusVs: NO_BONUS,
  },
  scout: {
    // scout-1 (EN): 65F, 23 s, hp 110, speed 1.625. Short Sword 1 (+10 vs scout/siege),
    // cd 1.5 s, alcance 0.2875. Armadura: vazia -> 0 (aproximado).
    id: "scout",
    namePt: "Batedor",
    age: 1,
    cost: cost(65, 0, 0, 0),
    time: 23,
    hp: 110,
    speed: 1.625,
    damage: 1,
    range: 0.2875,
    cooldown: 1.5,
    armorMelee: 0,
    armorRanged: 0,
    pop: 1,
    producedBy: ["town-center", "capital-town-center", "kings-palace", "stable", "school-of-cavalry"],
    classes: ["cavalry", "light", "scout", "horse"],
    bonusVs: { scout: 10, siege: 10 },
  },
  mangonel: {
    // mangonel-3 (EN): 400W/200G, 40 s, hp 130, speed 0.75, pop 3. Arma siege dano 10,
    // cd 0 no dataset (aproximado: 1 disparo a cada 5 s), alcance 3 a 8 (mínimo 3).
    // Bônus vs prédio +30 (siegeAttack). Armadura: vazia -> 0 (aproximado).
    id: "mangonel",
    namePt: "Mangonela",
    age: 3,
    cost: cost(0, 400, 200, 0),
    time: 40,
    hp: 130,
    speed: 0.75,
    damage: 10,
    range: 8,
    cooldown: 5,
    armorMelee: 0,
    armorRanged: 0,
    pop: 3,
    producedBy: ["siege-workshop", "keep", "the-white-tower", "berkshire-palace", "college-of-artillery"],
    classes: ["siege", "catapult", "mangonel"],
    bonusVs: { building: 30 },
  },
  monk: {
    // monk-3 (EN/FR): 150G, 30 s, hp 90, speed 1.125, pop 1. Sem arma de dano (cura e
    // conversão ficam para a fase 6). Dano 0.
    id: "monk",
    namePt: "Monge",
    age: 3,
    cost: cost(0, 0, 150, 0),
    time: 30,
    hp: 90,
    speed: 1.125,
    damage: 0,
    range: 0,
    cooldown: 0,
    armorMelee: 0,
    armorRanged: 0,
    pop: 1,
    producedBy: ["monastery"],
    classes: ["monk", "support"],
    bonusVs: NO_BONUS,
  },
  longbowman: {
    // longbowman-2 (EN, única): 40F/50W, 15 s, hp 70, speed 1.125. Longbow 6, reload 0,
    // alcance 7. Bônus vs leve/infantaria +6.
    id: "longbowman",
    namePt: "Arqueiro Longo",
    age: 2,
    cost: cost(40, 50, 0, 0),
    time: 15,
    hp: 70,
    speed: 1.125,
    damage: 6,
    range: 7,
    cooldown: 1.25,
    armorMelee: 0,
    armorRanged: 0,
    pop: 1,
    producedBy: ["archery-range", "council-hall", "the-white-tower", "berkshire-palace"],
    classes: ["infantry", "ranged", "longbow", "light"],
    bonusVs: { "light-infantry": 6 },
  },
};

/** Retorna a definição de uma unidade; lança erro para id desconhecido. */
export function unitDef(id: string): UnitDef {
  const def = UNIT_DEFS[id];
  if (!def) throw new Error(`unitDef: unidade desconhecida "${id}"`);
  return def;
}

/**
 * Quais unidades cada civilização pode treinar (subconjunto de UNIT_DEFS). Usado pelo HUD
 * e pelo comando de treino para evitar unidades de outra civ.
 */
export const CIV_UNITS: Record<CivId, readonly string[]> = {
  english: ["villager", "spearman", "man-at-arms", "archer", "crossbowman", "longbowman", "horseman", "knight", "scout", "mangonel", "monk"],
  french: ["villager", "spearman", "man-at-arms", "archer", "arbaletrier", "horseman", "royal-knight", "scout", "mangonel", "monk"],
};

/**
 * Avança a fila de treino de cada construção concluída. Quando o item termina, cria a
 * unidade (com stats do UnitDef) junto à construção e aplica a ordem de rally, se houver.
 */
export function stepProduction(world: World): void {
  // Coleta primeiro os spawns, para não mutar a lista de entidades durante a iteração.
  const spawns: Array<{ building: Entity; type: string }> = [];
  for (const e of world.entities) {
    if (e.kind !== "building" || !e.built || !e.training || e.training.length === 0) continue;
    const head = e.training[0];
    if (!head) continue;
    head.progress += TICK_SECONDS;
    // Tolerância de meio tick: a soma repetida de 0,1 em float pode ficar em 14,9999…
    // e atrasar o spawn em 1 tick sem motivo de jogo.
    if (head.progress >= head.total - TICK_SECONDS / 2) {
      e.training.shift();
      spawns.push({ building: e, type: head.type });
    }
  }

  for (const { building, type } of spawns) {
    spawnUnit(world, building, type);
  }
}

/**
 * Cria a unidade treinada próxima ao edifício e envia para o rally point, se existir.
 * A população já foi reservada em commands.ts ao enfileirar; aqui NÃO é somada de novo.
 */
function spawnUnit(world: World, building: Entity, type: string): void {
  const def = unitDef(type);
  const id = world.nextId++;
  // Posição: deslocada do centro do edifício (determinística: sem aleatoriedade).
  const x = building.x + 2;
  const z = building.z + 2;
  const unit: Entity = {
    id,
    kind: "unit",
    type: def.id,
    owner: building.owner,
    x,
    z,
    y: 0,
    hp: def.hp,
    maxHp: def.hp,
    facing: 0,
    movementSpeed: def.speed,
    sight: 0,
    orders: [],
    path: [],
    pathIndex: 0,
    attackCooldown: 0,
  };
  world.entities.push(unit);

  // Rally: se o edifício tem ponto de encontro, a unidade recebe ordem de movimento até ele.
  // O caminho é calculado já no spawn, pois stepMovement só anda por `path`.
  if (building.rallyX !== undefined && building.rallyZ !== undefined) {
    unit.orders = [{ type: "move", x: building.rallyX, z: building.rallyZ, queue: false }];
    unit.path = findPath(world.map, x, z, building.rallyX, building.rallyZ);
    unit.pathIndex = 0;
  }

}
