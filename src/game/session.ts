/**
 * session.ts — fluxo de sessão: menu → partida → vitória, e command card.
 *
 * Orquestra a partida sem conhecer o DOM do jogo: recebe as dependências por injeção
 * (api, hud, menu, seleção, câmera). Responsabilidades:
 *  - `start`: fecha o menu, cria a partida a partir da config do menu e ajusta objetivos.
 *  - `poll`: chamado a cada frame; atualiza o command card com a seleção atual e mostra
 *    a tela de vitória/derrota quando a partida termina.
 *  - `commandActionsFor`: decide quais ações (construir, treinar, landmark) a seleção oferece.
 *  - ao clicar numa ação do command card, emite o comando correspondente à simulação.
 *
 * Simplificações do milestone (documentadas):
 *  - Construção usa a média das posições dos aldeões selecionados como ponto de obra.
 *  - Sem atalhos de teclado nas ações (`hotkey` não é preenchido).
 *  - Ações de treino só aparecem quando o edifício já está concluído.
 */
import { buildingDef } from "@sim/buildings";
import { landmarkChoices, canBuildLandmark } from "@sim/ages";
import { UNIT_DEFS } from "@sim/train";
import type { Command, Entity, MatchConfig, ResourceKind, World } from "@sim/types";
import type { SkirmishConfig } from "@ui/menu";
import { showVictory, hideVictory, type VictoryHandle } from "@ui/victory";
import type { CommandAction } from "@ui/hud";

export type { CommandAction } from "@ui/hud";

/** Jogador controlado pelo humano. */
const HUMAN = 0;
/** Milissegundos por tick (TICK_HZ = 10). */
const MS_PER_TICK = 100;
/** Tipo do aldeão (único construtor do milestone). */
const VILLAGER_TYPE = "villager";
/** Ações de construção oferecidas ao selecionar aldeões (ordem da UI). */
const BUILD_ACTION_TYPES: readonly string[] = ["house", "farm", "mill", "lumber-camp", "mining-camp"];
const TOWN_CENTER_TYPE = "town-center";
const BARRACKS_TYPE = "barracks";
const ARCHERY_RANGE_TYPE = "archery-range";
const STABLE_TYPE = "stable";

/** Unidades treináveis por edifício (ordem da UI). */
const TRAIN_BY_BUILDING: Readonly<Record<string, readonly string[]>> = {
  [TOWN_CENTER_TYPE]: ["villager"],
  [BARRACKS_TYPE]: ["spearman", "man-at-arms"],
  [ARCHERY_RANGE_TYPE]: ["archer", "crossbowman"],
  [STABLE_TYPE]: ["horseman", "knight"],
};

/** Abreviações de recurso para o texto de custo. */
const RES_SHORT: Readonly<Record<ResourceKind, string>> = {
  food: "C",
  wood: "M",
  gold: "O",
  stone: "P",
};
const RES_ORDER: readonly ResourceKind[] = ["food", "wood", "gold", "stone"];

/** Dependências injetadas pela sessão (contrato com o Lead). */
export interface SessionDeps {
  api: {
    newMatch(cfg: MatchConfig): string;
    getState(): World;
    send(cmd: Command): void;
  };
  hud: {
    update(s: World, ids: readonly number[], extra: { fps: number; timeMs: number }): void;
    setObjectives(cfg: MatchConfig): void;
    setCommandActions(actions: readonly CommandAction[], cb: (a: CommandAction) => void): void;
    onIdleVillagerClick(cb: () => void): void;
  };
  menu: { show(): void; hide(): void };
  getSelection: () => number[];
  setSelection: (ids: number[]) => void;
  focusOn: (x: number, z: number) => void;
  isPaused?: () => boolean;
  /** Raiz onde a tela de vitória é montada (ausente => sem overlay). */
  victoryRoot?: HTMLElement;
}

/** Contrato público da sessão. */
export interface Session {
  start(cfg: SkirmishConfig): void;
  poll(): void;
  commandActionsFor(world: World, selectionIds: readonly number[]): CommandAction[];
  onCommandAction(cb: (a: CommandAction) => void): void;
}

/** Texto de custo: "50 M", "150 M 20 C" etc. Recursos zerados são omitidos. */
function costText(cost: Readonly<Record<ResourceKind, number>>): string {
  const parts = RES_ORDER.filter((kind) => cost[kind] > 0).map((kind) => `${cost[kind]} ${RES_SHORT[kind]}`);
  return parts.length > 0 ? parts.join(" ") : "Grátis";
}

/** Converte a configuração do menu (SkirmishConfig) na MatchConfig da simulação. */
export function skirmishToMatchConfig(cfg: SkirmishConfig): MatchConfig {
  return {
    seed: cfg.seed,
    civ: cfg.civ,
    map: cfg.map,
    size: cfg.size,
    bots: Array.from({ length: cfg.bots }, () => ({ difficulty: cfg.difficulty })),
    victory: cfg.victory,
    gameSpeed: 1,
  };
}

/** Aldeões do jogador humano dentre os ids selecionados. */
function ownVillagers(world: World, ids: readonly number[]): Entity[] {
  const wanted = new Set(ids);
  return world.entities.filter(
    (e) => e.kind === "unit" && e.owner === HUMAN && e.type === VILLAGER_TYPE && wanted.has(e.id),
  );
}

/** Edifícios do jogador humano dentre os ids selecionados. */
function ownBuildings(world: World, ids: readonly number[]): Entity[] {
  const wanted = new Set(ids);
  return world.entities.filter((e) => e.kind === "building" && e.owner === HUMAN && wanted.has(e.id));
}

/** Ação de construção de um aldeão. */
function buildAction(buildingType: string): CommandAction {
  const def = buildingDef(buildingType);
  return {
    id: `build-${def.id}`,
    label: def.namePt,
    kind: "build",
    buildingType: def.id,
    cost: costText(def.cost),
  };
}

/** Ação de treino de uma unidade. */
function trainAction(unitType: string): CommandAction {
  const def = UNIT_DEFS[unitType];
  return {
    id: `train-${unitType}`,
    label: def?.namePt ?? unitType,
    kind: "train",
    buildingType: unitType,
    cost: def ? costText(def.cost) : undefined,
  };
}

/** Ações do command card para o conjunto de edifícios/aldeões selecionados. */
function actionsFor(world: World, ids: readonly number[]): CommandAction[] {
  const villagers = ownVillagers(world, ids);
  const buildings = ownBuildings(world, ids);

  // Aldeões: só ações de construção (ignora seleção mista com edifícios).
  if (villagers.length > 0) {
    if (buildings.length > 0) return [];
    return BUILD_ACTION_TYPES.map(buildAction);
  }

  // Um único edifício concluído define as ações (seleção ambígua => nenhuma).
  if (buildings.length !== 1) return [];
  const building = buildings[0];
  if (building === undefined || building.built !== true) return [];

  const actions: CommandAction[] = (TRAIN_BY_BUILDING[building.type] ?? []).map(trainAction);
  if (building.type === ARCHERY_RANGE_TYPE && world.players[HUMAN]?.civ === "french") {
    actions.push(trainAction("arbaletrier"));
  }
  if (building.type === TOWN_CENTER_TYPE) {
    for (const landmarkId of landmarkChoices(world, HUMAN)) {
      const def = buildingDef(landmarkId);
      actions.push({
        id: `landmark-${def.id}`,
        label: def.namePt,
        kind: "landmark",
        buildingType: def.id,
        cost: costText(def.cost),
      });
    }
  }
  return actions;
}

/** Assinatura estável das ações (para não repintar o HUD à toa). */
function actionsSignature(actions: readonly CommandAction[]): string {
  return actions.map((a) => `${a.id}|${a.label}|${a.cost ?? ""}`).join(";");
}

/** Cria a sessão sobre as dependências injetadas. */
export function createSession(deps: SessionDeps): Session {
  const victoryRoot = deps.victoryRoot;

  let started = false;
  let matchConfig: MatchConfig | undefined;
  let victoryHandle: VictoryHandle | undefined;
  let victoryShown = false;
  let cardSig = "";
  const listeners: Array<(a: CommandAction) => void> = [];

  const world = (): World | undefined => (started ? deps.api.getState() : undefined);

  /** Executa o comando correspondente à ação clicada no command card. */
  const issue = (action: CommandAction): void => {
    const w = world();
    if (!w) return;
    const selection = deps.getSelection();

    if (action.kind === "build" || action.kind === "landmark") {
      // Landmark exige a checagem de era/recursos da simulação antes de emitir.
      if (action.kind === "landmark" && !canBuildLandmark(w, HUMAN, action.buildingType)) return;
      const villagers = ownVillagers(w, selection);
      if (villagers.length === 0) return;
      // Ponto de obra: média das posições dos aldeões selecionados (simplificação).
      const sumX = villagers.reduce((acc, v) => acc + v.x, 0);
      const sumZ = villagers.reduce((acc, v) => acc + v.z, 0);
      deps.api.send({
        tick: w.tick,
        type: "build",
        unitIds: villagers.map((v) => v.id),
        buildingType: action.buildingType,
        x: sumX / villagers.length,
        z: sumZ / villagers.length,
        queue: false,
      });
    } else if (action.kind === "train") {
      // Edifício selecionado que produz esta unidade.
      const producer = ownBuildings(w, selection).find(
        (b) => b.built === true && (UNIT_DEFS[action.buildingType]?.producedBy.includes(b.type) ?? false),
      );
      if (!producer) return;
      deps.api.send({
        tick: w.tick,
        type: "train",
        unitIds: [producer.id],
        buildingType: action.buildingType,
      });
    }
    // 'cancel': sem efeito no milestone (ver cabeçalho).

    for (const cb of listeners) cb(action);
  };

  /** Repinta o command card somente quando as ações mudam. */
  const refreshCommandCard = (): void => {
    const w = world();
    const actions = w ? actionsFor(w, deps.getSelection()) : [];
    const sig = actionsSignature(actions);
    if (sig === cardSig) return;
    cardSig = sig;
    deps.hud.setCommandActions(actions, issue);
  };

  /** Mostra a tela de fim de partida uma única vez por partida. */
  const checkVictory = (): void => {
    if (victoryShown || !matchConfig || victoryRoot === undefined) return;
    const w = world();
    if (!w || w.victory.kind === "playing") return;
    victoryShown = true;
    const timeMs = w.tick * MS_PER_TICK;
    // Derrota (kind 'defeat') não traz vencedor: usa player -1 (não é o humano) e o
    // objetivo configurado como motivo.
    const info =
      w.victory.kind === "victory"
        ? { player: w.victory.player, reason: w.victory.reason, timeMs, humanPlayer: HUMAN }
        : { player: -1, reason: matchConfig.victory, timeMs, humanPlayer: HUMAN };
    victoryHandle = showVictory(victoryRoot, info);
    victoryHandle.onMenu(() => {
      hideVictory(victoryRoot);
      victoryHandle = undefined;
      cardSig = "";
      deps.menu.show();
    });
  };

  return {
    start(cfg: SkirmishConfig): void {
      const next = skirmishToMatchConfig(cfg);
      if (victoryRoot !== undefined) hideVictory(victoryRoot);
      victoryHandle = undefined;
      victoryShown = false;
      cardSig = "";
      deps.menu.hide();
      deps.api.newMatch(next);
      matchConfig = next;
      started = true;
      deps.hud.setObjectives(next);
      deps.setSelection([]);
    },

    poll(): void {
      if (!started) return;
      refreshCommandCard();
      checkVictory();
    },

    commandActionsFor(w: World, selectionIds: readonly number[]): CommandAction[] {
      return actionsFor(w, selectionIds);
    },

    onCommandAction(cb: (a: CommandAction) => void): void {
      listeners.push(cb);
    },
  };
}
