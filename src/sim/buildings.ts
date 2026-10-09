/**
 * buildings.ts — definições de construções (dados do dataset data/aoe4).
 *
 * Números vêm dos JSONs em data/aoe4/buildings/{english,french}. Onde o dataset não traz
 * um valor numérico, o comentário indica a fonte alternativa (SPEC §7.1) ou a aproximação.
 *
 * Divergências conhecidas entre o briefing e o dataset (decisão: vale o dataset):
 *  - Landmarks ficam nas eras 1, 2 e 3 (campo `age` do JSON), não II/III/IV.
 *  - Maravilha: 5000 de cada recurso e 600 s (dataset). SPEC §7.1 cita 6000 (não usado).
 */

import type { ResourceKind } from "./types";

export interface BuildingDef {
  id: string;
  namePt: string;
  age: number;
  cost: { food: number; wood: number; gold: number; stone: number };
  buildTime: number;
  hp: number;
  size: number;
  providesPop: number;
  dropOff: ResourceKind[];
  produces: string[];
  isLandmark: boolean;
  civ: "english" | "french" | null;
}

/**
 * Tamanho de footprint (em tiles). O dataset NÃO traz footprint (verificado: nenhum JSON de
 * construção tem campo de obstrução). Valores aproximados, marcados como tal: pequeno = 2,
 * grande = 4 (centro da cidade/landmarks/quartéis grandes). Fonte: APROXIMADO.
 */
const SIZE_SMALL = 2;
const SIZE_LARGE = 4;

/** Custo sem recursos (helper para deixar a tabela legível). */
function cost(food: number, wood: number, gold: number, stone: number): BuildingDef["cost"] {
  return { food, wood, gold, stone };
}

/**
 * Construções base (não-landmark). Fonte: data/aoe4/buildings/english/*-N.json; onde o
 * número difere entre civs, a linha indica a diferença (FR) em comentário.
 */
const BASE_BUILDINGS: BuildingDef[] = [
  {
    // house-1.json (EN): 50 W, 15 s, 750 HP. Pop: o JSON não traz valor numérico;
    // +10 por casa segue SPEC §7.1 (dump building_house.json, schema).
    id: "house",
    namePt: "Casa",
    age: 1,
    cost: cost(0, 50, 0, 0),
    buildTime: 15,
    hp: 750,
    size: SIZE_SMALL,
    providesPop: 10,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // farm-1.json: EN 37 W / FR 75 W; 6 s; 300 HP. Fazenda = 120 comida (SPEC §7.1).
    id: "farm",
    namePt: "Fazenda",
    age: 1,
    cost: cost(0, 37, 0, 0),
    buildTime: 6,
    hp: 300,
    size: SIZE_SMALL,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // town-center-1.json (EN): 400 W, 300 pedra, 150 s, 2500 HP. Produz villager, scout.
    id: "town-center",
    namePt: "Centro da Cidade",
    age: 1,
    cost: cost(0, 400, 0, 300),
    buildTime: 150,
    hp: 2500,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: ["food", "wood", "gold", "stone"],
    produces: ["villager", "scout"],
    isLandmark: false,
    civ: null,
  },
  {
    // barracks-1.json: 150 W, 30 s, 1500 HP. Produz infantaria corpo a corpo.
    id: "barracks",
    namePt: "Quartel",
    age: 1,
    cost: cost(0, 150, 0, 0),
    buildTime: 30,
    hp: 1500,
    size: SIZE_SMALL,
    providesPop: 0,
    dropOff: [],
    produces: ["spearman", "man-at-arms"],
    isLandmark: false,
    civ: null,
  },
  {
    // archery-range-2.json: 150 W, 30 s, 1500 HP (idade 2 no dataset EN).
    id: "archery-range",
    namePt: "Arquearia",
    age: 2,
    cost: cost(0, 150, 0, 0),
    buildTime: 30,
    hp: 1500,
    size: SIZE_SMALL,
    providesPop: 0,
    dropOff: [],
    produces: ["archer", "crossbowman", "arbaletrier"],
    isLandmark: false,
    civ: null,
  },
  {
    // stable-2.json: 150 W, 30 s, 1500 HP (idade 2 no dataset).
    id: "stable",
    namePt: "Estábulo",
    age: 2,
    cost: cost(0, 150, 0, 0),
    buildTime: 30,
    hp: 1500,
    size: SIZE_SMALL,
    providesPop: 0,
    dropOff: [],
    produces: ["horseman", "knight", "royal-knight", "scout"],
    isLandmark: false,
    civ: null,
  },
  {
    // blacksmith-2.json: 150 W, 25 s, 1500 HP (idade 2 no dataset).
    id: "blacksmith",
    namePt: "Ferraria",
    age: 2,
    cost: cost(0, 150, 0, 0),
    buildTime: 25,
    hp: 1500,
    size: SIZE_SMALL,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // monastery-3.json: 200 W, 25 s, 2100 HP (idade 3 no dataset). Produz monge.
    id: "monastery",
    namePt: "Mosteiro",
    age: 3,
    cost: cost(0, 200, 0, 0),
    buildTime: 25,
    hp: 2100,
    size: SIZE_SMALL,
    providesPop: 0,
    dropOff: [],
    produces: ["monk"],
    isLandmark: false,
    civ: null,
  },
  {
    // market-2.json: 100 W, 20 s, 1000 HP (idade 2 no dataset). Produz trader.
    id: "market",
    namePt: "Mercado",
    age: 2,
    cost: cost(0, 100, 0, 0),
    buildTime: 20,
    hp: 1000,
    size: SIZE_SMALL,
    providesPop: 0,
    dropOff: [],
    produces: ["trader"],
    isLandmark: false,
    civ: null,
  },
  {
    // mill-1.json: EN 50 W / FR 25 W; 20 s; 750 HP. Drop-off de comida.
    id: "mill",
    namePt: "Moinho",
    age: 1,
    cost: cost(0, 50, 0, 0),
    buildTime: 20,
    hp: 750,
    size: SIZE_SMALL,
    providesPop: 0,
    dropOff: ["food"],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // lumber-camp-1.json: EN 50 W / FR 25 W; 20 s; 750 HP. Drop-off de madeira.
    id: "lumber-camp",
    namePt: "Acampamento de Madeira",
    age: 1,
    cost: cost(0, 50, 0, 0),
    buildTime: 20,
    hp: 750,
    size: SIZE_SMALL,
    providesPop: 0,
    dropOff: ["wood"],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // mining-camp-1.json: EN 50 W / FR 25 W; 20 s; 750 HP. Drop-off de ouro e pedra.
    id: "mining-camp",
    namePt: "Acampamento de Mineração",
    age: 1,
    cost: cost(0, 50, 0, 0),
    buildTime: 20,
    hp: 750,
    size: SIZE_SMALL,
    providesPop: 0,
    dropOff: ["gold", "stone"],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // palisade-1.json: 7 W, 8 s, 1350 HP.
    id: "palisade",
    namePt: "Paliçada",
    age: 1,
    cost: cost(0, 7, 0, 0),
    buildTime: 8,
    hp: 1350,
    size: 1,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // palisade-gate-1.json: 25 W, 10 s, 1350 HP.
    id: "palisade-gate",
    namePt: "Portão de Paliçada",
    age: 1,
    cost: cost(0, 25, 0, 0),
    buildTime: 10,
    hp: 1350,
    size: 1,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // stone-wall-2.json: 25 pedra, 16 s, 3000 HP (idade 2).
    id: "stone-wall",
    namePt: "Muralha de Pedra",
    age: 2,
    cost: cost(0, 0, 0, 25),
    buildTime: 16,
    hp: 3000,
    size: 1,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // stone-wall-gate-2.json: 50 pedra, 30 s, 3000 HP (idade 2).
    id: "stone-wall-gate",
    namePt: "Portão de Muralha",
    age: 2,
    cost: cost(0, 0, 0, 50),
    buildTime: 30,
    hp: 3000,
    size: 1,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // stone-wall-tower-2.json: 250 pedra, 90 s, 3000 HP (idade 2).
    id: "tower",
    namePt: "Torre de Muralha",
    age: 2,
    cost: cost(0, 0, 0, 250),
    buildTime: 90,
    hp: 3000,
    size: 2,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // outpost-1.json: 100 W, 60 s, 750 HP (idade 1).
    id: "outpost",
    namePt: "Posto Avançado",
    age: 1,
    cost: cost(0, 100, 0, 0),
    buildTime: 60,
    hp: 750,
    size: SIZE_SMALL,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // keep-3.json (EN): 900 pedra, 180 s, 5000 HP (idade 3). FR: 810 pedra.
    id: "keep",
    namePt: "Torreão",
    age: 3,
    cost: cost(0, 0, 0, 900),
    buildTime: 180,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // siege-workshop-3.json: 250 W, 45 s, 2100 HP (idade 3). Produz cerco.
    id: "siege-workshop",
    namePt: "Oficina de Cerco",
    age: 3,
    cost: cost(0, 250, 0, 0),
    buildTime: 45,
    hp: 2100,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: ["mangonel"],
    isLandmark: false,
    civ: null,
  },
  {
    // university-4.json: 450 W, 60 s, 2100 HP (idade 4).
    id: "university",
    namePt: "Universidade",
    age: 4,
    cost: cost(0, 450, 0, 0),
    buildTime: 60,
    hp: 2100,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
  {
    // wonder: building_wonder_age4 (SPEC §7.1) e cathedral-of-st-thomas-4 / notre-dame-4:
    // 5000 de cada recurso, 600 s, 5000 HP (dataset). SPEC §7.1 cita 6000 — não usado.
    id: "wonder",
    namePt: "Maravilha",
    age: 4,
    cost: cost(5000, 5000, 5000, 5000),
    buildTime: 600,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: false,
    civ: null,
  },
];

/**
 * Landmarks (2 por era II/III/IV no briefing; o dataset traz 2 por era 1/2/3 — usado aqui).
 * Custos/HP/tempo de cada JSON (EN e FR). `produces` = unidades/funções que o landmark libera.
 */
const LANDMARKS: BuildingDef[] = [
  // ---- Inglês ----
  {
    // abbey-of-kings-1.json: 400 F / 200 G, 190 s, 5000 HP, era 1. Produz rei (King).
    id: "abbey-of-kings",
    namePt: "Abadia dos Reis",
    age: 1,
    cost: cost(400, 0, 200, 0),
    buildTime: 190,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: ["king"],
    isLandmark: true,
    civ: "english",
  },
  {
    // council-hall-1.json: 400 F / 200 G, 190 s, 5000 HP, era 1. Age de arquearia.
    id: "council-hall",
    namePt: "Salão do Conselho",
    age: 1,
    cost: cost(400, 0, 200, 0),
    buildTime: 190,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: ["archer", "longbowman", "crossbowman"],
    isLandmark: true,
    civ: "english",
  },
  {
    // kings-palace-2.json: 1200 F / 600 G, 220 s, 5000 HP, era 2. Age de centro da cidade.
    id: "kings-palace",
    namePt: "Palácio do Rei",
    age: 2,
    cost: cost(1200, 0, 600, 0),
    buildTime: 220,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: ["food", "wood", "gold", "stone"],
    produces: ["villager", "scout"],
    isLandmark: true,
    civ: "english",
  },
  {
    // the-white-tower-2.json: 1200 F / 600 G, 220 s, 5000 HP, era 2. Age de Keep.
    id: "the-white-tower",
    namePt: "Torre Branca",
    age: 2,
    cost: cost(1200, 0, 600, 0),
    buildTime: 220,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: ["spearman", "man-at-arms", "archer", "crossbowman", "horseman", "knight", "mangonel", "monk"],
    isLandmark: true,
    civ: "english",
  },
  {
    // berkshire-palace-3.json: 2400 F / 1200 G, 250 s, 6500 HP, era 3.
    id: "berkshire-palace",
    namePt: "Palácio de Berkshire",
    age: 3,
    cost: cost(2400, 0, 1200, 0),
    buildTime: 250,
    hp: 6500,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: ["spearman", "man-at-arms", "crossbowman", "longbowman", "horseman", "knight", "mangonel"],
    isLandmark: true,
    civ: "english",
  },
  {
    // wynguard-palace-3.json: 2400 F / 1200 G, 250 s, 5000 HP, era 3. Batalhões Wynguard.
    id: "wynguard-palace",
    namePt: "Palácio de Wynguard",
    age: 3,
    cost: cost(2400, 0, 1200, 0),
    buildTime: 250,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: true,
    civ: "english",
  },
  // ---- Francês ----
  {
    // school-of-cavalry-1.json: 400 F / 200 G, 190 s, 5000 HP, era 1. Age de estábulo.
    id: "school-of-cavalry",
    namePt: "Escola de Cavalaria",
    age: 1,
    cost: cost(400, 0, 200, 0),
    buildTime: 190,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: ["horseman", "royal-knight", "scout"],
    isLandmark: true,
    civ: "french",
  },
  {
    // chamber-of-commerce-1.json: 400 F / 200 G, 190 s, 5000 HP, era 1. Age de mercado.
    id: "chamber-of-commerce",
    namePt: "Câmara do Comércio",
    age: 1,
    cost: cost(400, 0, 200, 0),
    buildTime: 190,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: ["trader"],
    isLandmark: true,
    civ: "french",
  },
  {
    // royal-institute-2.json: 1200 F / 600 G, 220 s, 5000 HP, era 2. Tecnologias FR.
    id: "royal-institute",
    namePt: "Instituto Real",
    age: 2,
    cost: cost(1200, 0, 600, 0),
    buildTime: 220,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: true,
    civ: "french",
  },
  {
    // guild-hall-2.json: 1200 F / 600 G, 220 s, 5000 HP, era 2. Gera recursos ao longo do tempo.
    id: "guild-hall",
    namePt: "Casa da Guilda",
    age: 2,
    cost: cost(1200, 0, 600, 0),
    buildTime: 220,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: true,
    civ: "french",
  },
  {
    // red-palace-3.json: 2400 F / 1200 G, 250 s, 5000 HP, era 3. Age de Keep (FR).
    id: "red-palace",
    namePt: "Palácio Vermelho",
    age: 3,
    cost: cost(2400, 0, 1200, 0),
    buildTime: 250,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: [],
    isLandmark: true,
    civ: "french",
  },
  {
    // college-of-artillery-3.json: 2400 F / 1200 G, 250 s, 5000 HP, era 3. Artilharia real.
    id: "college-of-artillery",
    namePt: "Colégio de Artilharia",
    age: 3,
    cost: cost(2400, 0, 1200, 0),
    buildTime: 250,
    hp: 5000,
    size: SIZE_LARGE,
    providesPop: 0,
    dropOff: [],
    produces: ["mangonel"],
    isLandmark: true,
    civ: "french",
  },
];

/** Catálogo completo: construções base + landmarks, indexado por id. */
export const BUILDINGS: Record<string, BuildingDef> = Object.fromEntries(
  [...BASE_BUILDINGS, ...LANDMARKS].map((b) => [b.id, b]),
);

/**
 * Retorna a definição de uma construção pelo id. Lança erro para id desconhecido (sem
 * fallback silencioso, para não mascarar typo em comando).
 */
export function buildingDef(id: string): BuildingDef {
  const def = BUILDINGS[id];
  if (!def) throw new Error(`buildingDef: construção desconhecida "${id}"`);
  return def;
}
