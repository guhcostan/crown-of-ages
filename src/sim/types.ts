/**
 * types.ts — vocabulário compartilhado da simulação (CONTRATO).
 *
 * Este arquivo é a costura entre simulação, render e HUD. TODOS os módulos importam
 * daqui. A simulação é determinística e headless: nada de três/dom/Date/Math.random
 * em src/sim (lint proíbe). Todo estado é JSON-serializável (sem Map/Set/typed arrays)
 * para que `serialize()` + hash provem determinismo.
 */

// ---------------------------------------------------------------------------
// Configuração de partida
// ---------------------------------------------------------------------------

export type CivId = "english" | "french";

/** Presets de mapa (nossos nomes; bioma/rugosidade variam). */
export type MapPresetId = "highlands" | "valley" | "steppes";

export type MapSize = "small" | "medium" | "large";

export type VictoryId = "landmarks" | "wonder" | "sacred-sites";

export type BotDifficulty = "easy" | "medium" | "hard";

export interface BotConfig {
  difficulty: BotDifficulty;
}

export interface MatchConfig {
  seed: number;
  civ: CivId;
  /** Preset escolhido no menu (skirmish). */
  map: MapPresetId;
  size: MapSize;
  /** 0–3 bots; dificuldades alinhadas por índice. */
  bots: BotConfig[];
  victory: VictoryId;
  /** Multiplicador de velocidade do jogo (1 = normal). */
  gameSpeed: number;
}

// ---------------------------------------------------------------------------
// Mapa
// ---------------------------------------------------------------------------

export type ResSubKind =
  | "berry"
  | "sheep"
  | "deer"
  | "boar"
  | "gold-mine"
  | "stone-mine"
  | "tree";

export interface MapResource {
  id: number;
  kind: ResSubKind;
  /** Posição em unidades de mundo. */
  x: number;
  z: number;
  /** Quantidade restante (comida/madeira/ouro/pedra). */
  amount: number;
  max: number;
}

export interface SpawnPoint {
  player: number;
  x: number;
  z: number;
}

export interface MapData {
  /** Dimensões em tiles. */
  w: number;
  h: number;
  /** Unidades de mundo por tile. */
  tile: number;
  /** Altura por tile, indexado z*w+x. 0..1 normalizado (altura real = height * maxHeight). */
  heights: number[];
  /** Bioma por tile: 0=grama, 1=floresta, 2=areia, 3=neve, 4=seco. */
  biome: number[];
  /** true = intransponível (água profunda, penhasco). */
  blocked: boolean[];
  /** Recurso por tile (id) ou -1. */
  resourceAt: number[];
  resources: MapResource[];
  spawns: SpawnPoint[];
  /** Altura máxima do relevo em unidades de mundo. */
  maxHeight: number;
}

// ---------------------------------------------------------------------------
// Entidades
// ---------------------------------------------------------------------------

export type EntityKind = "unit" | "building" | "resource";

export type CommandType =
  | "move"
  | "attackMove"
  | "stop"
  | "hold"
  | "attack"
  | "build"
  | "train"
  | "gather"
  | "repair"
  | "setRally"
  | "garrison"
  | "ungarrison";

export interface Order {
  type: CommandType;
  /** Destino em unidades de mundo (quando aplicável). */
  x?: number;
  z?: number;
  /** Alvo por id (ataque/gather/build/repair). */
  targetId?: number;
  /** Tipo de construção para ordem `build`. */
  buildingType?: string;
  /** true = ordem enfileirada (shift), false = substitui a fila. */
  queue: boolean;
}

export interface Entity {
  id: number;
  kind: EntityKind;
  /** Identificador do tipo (ex.: "villager", "town-center", "tree"). */
  type: string;
  /** -1 = neutro; 0..n = jogador. */
  owner: number;
  x: number;
  z: number;
  /** Altura do terreno sob a entidade (cache do render). */
  y: number;
  hp: number;
  maxHp: number;
  /** Facing em radianos (Y). */
  facing: number;

  // --- específicos de unidade ---
  movementSpeed?: number;
  sight?: number;
  /** Fila de ordens (1..n; shift adiciona no fim). */
  orders?: Order[];
  /** Caminho atual em waypoints de mundo [{x,z},...] (vazio = parado). */
  path?: Array<{ x: number; z: number }>;
  pathIndex?: number;
  /** Estado de coleta (recurso alvo e quantidade carregada). */
  carrying?: { resource: ResSubKind; amount: number };
  gatherTargetId?: number;
  /** Estado de cooldown de ataque em segundos restantes. */
  attackCooldown?: number;
  attackTargetId?: number;
  /** Recurso sendo construído (building em progresso por esta unidade). */
  constructingId?: number;
  buildProgress?: number;
  /** Id da edificação/muralha onde esta unidade está abrigada (garrison). */
  garrisonIn?: number;
  /** true se a unidade (monge) carrega uma relíquia. */
  carryingRelic?: boolean;

  // --- específicos de construção ---
  /** true quando a construção está 100% concluída. */
  built?: boolean;
  buildProgressMax?: number;
  /** População que a construção provê (casas). */
  popProvided?: number;
  /** Fila de treinamento: tipos em produção com progresso. */
  training?: Array<{ type: string; progress: number; total: number }>;
  /** Pesquisa em andamento no edifício (ferraria/universidade/mosteiro). */
  researching?: { techId: string; progress: number; total: number };
  rallyX?: number;
  rallyZ?: number;
  /** Drop-off deste edifício por recurso. */
  dropOff?: Array<"food" | "wood" | "gold" | "stone">;
  /** Unidades abrigadas (garrison) — ids de unidades dentro desta entidade. */
  garrison?: number[];
  /** Número de vagas de garrison (muralhas de pedra: 1+ por segmento; torres: 5). */
  garrisonSlots?: number;
  /** Dano de ataque próprio (torres/keep quando guarnecidos ou inatos). */
  attackDamage?: number;
  attackRange?: number;
  attackCooldownMax?: number;
}

// ---------------------------------------------------------------------------
// Jogadores e mundo
// ---------------------------------------------------------------------------

export type ResourceKind = "food" | "wood" | "gold" | "stone";

export interface PlayerState {
  id: number;
  name: string;
  civ: CivId;
  /** Índice de cor do time (ver SPEC §8.3). */
  color: number;
  resources: Record<ResourceKind, number>;
  pop: number;
  popCap: number;
  /** 1..4 (Dark/Feudal/Castle/Imperial). */
  age: number;
  isBot: boolean;
  difficulty?: BotDifficulty;
  defeated: boolean;
  /** Progresso de vitória (ex.: locais sagrados controlados). */
  score: number;
  /** Ids de tecnologias já pesquisadas. */
  techs?: string[];
  /** Relíquias depositadas no mosteiro (geram ouro). */
  relics?: number;
  /** Comida gerada por relic/segundo (cache do tick). */
  relicGoldPerSec?: number;
  /** Rotas de comércio ativas do mercado (ids de trader). */
  traders?: number[];
}

export type VictoryState =
  | { kind: "playing" }
  | { kind: "victory"; player: number; reason: VictoryId }
  | { kind: "defeat" };

export interface World {
  /** Número do tick atual (0 = estado inicial). */
  tick: number;
  config: MatchConfig;
  map: MapData;
  entities: Entity[];
  players: PlayerState[];
  /** Estado do RNG (mulberry32) — serializado para determinismo. */
  rngState: number;
  nextId: number;
  /**
   * Visibilidade por jogador: Uint8Array-like via number[] de tamanho w*h.
   * 0 = não explorado, 1 = explorado (memória), 2 = visível agora.
   */
  visibility: number[][];
  victory: VictoryState;
}

/** Snapshot = World (já é JSON puro). */
export type WorldSnapshot = World;

// ---------------------------------------------------------------------------
// Comandos (entrada → simulação)
// ---------------------------------------------------------------------------

export interface Command {
  tick: number;
  type: CommandType;
  unitIds: number[];
  x?: number;
  z?: number;
  entityId?: number;
  buildingType?: string;
  /** true = enfileirar (shift) em vez de substituir. */
  queue?: boolean;
}

// ---------------------------------------------------------------------------
// Contratos entre módulos (assinaturas fixas — não trocar sem migrar todos)
// ---------------------------------------------------------------------------

export interface Rng {
  /** Float [0,1). */
  next(): number;
  /** Inteiro em [min,max]. */
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  state(): number;
  restore(state: number): void;
}

export const TICK_HZ = 10;
export const TICK_SECONDS = 1 / TICK_HZ;

export const MAP_SIZES: Record<MapSize, { w: number; h: number }> = {
  small: { w: 72, h: 72 },
  medium: { w: 96, h: 96 },
  large: { w: 128, h: 128 },
};

export const CIV_IDS: readonly CivId[] = ["english", "french"] as const;
