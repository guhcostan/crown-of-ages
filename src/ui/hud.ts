/**
 * hud.ts — HUD em DOM overlay (docs/SPEC.md §8, docs/ARCHITECTURE.md §7).
 *
 * Monta divs com `data-hud` estáveis (ids usados pelo e2e) e os atualiza a partir do
 * snapshot do mundo. Não usa imagens do jogo original: ícones são unicode/CSS.
 * Os containers não capturam ponteiro (pointer-events: none); só os botões capturam.
 */
import "./hud.css";
import type { Entity, MapResource, MatchConfig, ResourceKind, World } from "@sim/types";

/** Contrato público do HUD. */
export interface HudHandle {
  update(snapshot: World, selectionIds: readonly number[], extra: { fps: number; timeMs: number }): void;
  setObjectives(config: MatchConfig): void;
  onIdleVillagerClick(cb: () => void): void;
  dispose(): void;
}

/** Jogador controlado pelo humano. */
const HUMAN = 0;
/** Máximo de miniaturas mostradas na multisseleção. */
const MAX_MINIATURES = 12;
/** Algarismos romanos das eras I–IV. */
const ROMAN_NUMERALS: readonly string[] = ["I", "II", "III", "IV"];
/** Cores de time (SPEC §8.3): azul, vermelho, verde, amarelo, roxo, ciano, laranja, preto. */
const PLAYER_COLORS: readonly string[] = [
  "#2f6fd6",
  "#d63c3c",
  "#3cb451",
  "#e0c23a",
  "#8a4fd6",
  "#2fc4cf",
  "#e8862a",
  "#222222",
];
/** Cor usada para entidades neutras (owner -1). */
const NEUTRAL_COLOR = "#7a7a7a";
/** Ordem fixa das colunas de recursos. */
const RES_ORDER: readonly ResourceKind[] = ["food", "wood", "gold", "stone"];
const RES_LABEL: Readonly<Record<ResourceKind, string>> = {
  food: "Comida",
  wood: "Madeira",
  gold: "Ouro",
  stone: "Pedra",
};
/** Ícones unicode/CSS (sem arte do jogo original). */
const RES_ICON: Readonly<Record<ResourceKind, string>> = {
  food: "🌾",
  wood: "🌲",
  gold: "●",
  stone: "■",
};
/** Tipo de subrecurso do mapa → recurso econômico. */
const RES_BY_SUB: Readonly<Record<string, ResourceKind | undefined>> = {
  berry: "food",
  sheep: "food",
  deer: "food",
  boar: "food",
  "gold-mine": "gold",
  "stone-mine": "stone",
  tree: "wood",
};
/** Nomes PT-BR de tipos conhecidos (fallback: id formatado). */
const TYPE_NAMES: Readonly<Record<string, string | undefined>> = {
  villager: "Aldeão",
  scout: "Batedor",
  spearman: "Lanceiro",
  "man-at-arms": "Homem de Armas",
  archer: "Arqueiro",
  "town-center": "Centro de Cidade",
  house: "Casa",
  mill: "Moinho",
  barracks: "Quartel",
  tree: "Árvore",
  "gold-mine": "Mina de Ouro",
  "stone-mine": "Mina de Pedra",
  berry: "Frutas Silvestres",
  sheep: "Ovelha",
  deer: "Veado",
  boar: "Javali",
};
const KIND_LABEL: Readonly<Record<Entity["kind"], string>> = {
  unit: "Unidade",
  building: "Edifício",
  resource: "Recurso",
};

/** Nome PT-BR de um tipo; cai para o id formatado quando desconhecido. */
function typeName(type: string): string {
  const known = TYPE_NAMES[type];
  if (known !== undefined) return known;
  return type
    .split("-")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Abreviação de 2 letras para o ícone da fila de produção. */
function abbrev(type: string): string {
  return typeName(type).slice(0, 2).toUpperCase();
}

/** Converte tempo decorrido (ms) em mm:ss. */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Limita `value` ao intervalo [0, 1] para barras de progresso. */
function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

/** Atualiza textContent somente quando muda (evita churn de DOM a cada frame). */
function setText(node: HTMLElement, text: string): void {
  if (node.textContent !== text) node.textContent = text;
}

/** Recurso de uma unidade coletora, a partir do alvo de coleta ou da ordem pendente. */
interface ResourceLookup {
  byId: ReadonlyMap<number, Entity>;
  mapById: ReadonlyMap<number, MapResource>;
}

function resourceKindOf(targetId: number, lookup: ResourceLookup): ResourceKind | undefined {
  const ent = lookup.byId.get(targetId);
  if (ent !== undefined && ent.kind === "resource") {
    const fromEntity = RES_BY_SUB[ent.type];
    if (fromEntity !== undefined) return fromEntity;
  }
  const mapRes = lookup.mapById.get(targetId);
  if (mapRes !== undefined) return RES_BY_SUB[mapRes.kind];
  return undefined;
}

/** Recurso que o aldeão coleta: alvo atual ou primeira ordem gather pendente. */
function villagerResource(villager: Entity, lookup: ResourceLookup): ResourceKind | undefined {
  if (villager.gatherTargetId !== undefined) {
    const kind = resourceKindOf(villager.gatherTargetId, lookup);
    if (kind !== undefined) return kind;
  }
  for (const order of villager.orders ?? []) {
    if (order.type === "gather" && order.targetId !== undefined) {
      const kind = resourceKindOf(order.targetId, lookup);
      if (kind !== undefined) return kind;
    }
  }
  return undefined;
}

/** Aldeão parado sem ordens, coleta nem caminho. */
function isIdleVillager(villager: Entity): boolean {
  return (
    (villager.orders?.length ?? 0) === 0 &&
    (villager.path?.length ?? 0) === 0 &&
    villager.gatherTargetId === undefined &&
    villager.constructingId === undefined
  );
}

/** Cor do dono de uma entidade (neutro = cinza). */
function ownerColor(snapshot: World, owner: number): string {
  if (owner < 0) return NEUTRAL_COLOR;
  const player = snapshot.players.find((p) => p.id === owner);
  if (player === undefined) return NEUTRAL_COLOR;
  return PLAYER_COLORS[player.color % PLAYER_COLORS.length] ?? NEUTRAL_COLOR;
}

/** Monta o HUD dentro de `root` e devolve o handle de atualização. */
export function mountHud(root: HTMLElement): HudHandle {
  const doc = root.ownerDocument;
  const created: HTMLElement[] = [];
  let disposed = false;
  let idleCallback: (() => void) | undefined;
  let config: MatchConfig | undefined;
  let objectiveSig = "";

  const make = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string,
    attrs?: Readonly<Record<string, string>>,
  ): HTMLElementTagNameMap[K] => {
    const node = doc.createElement(tag);
    if (className !== undefined) node.className = className;
    if (text !== undefined) node.textContent = text;
    if (attrs !== undefined) {
      for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    }
    return node;
  };

  /** Adiciona um painel de primeiro nível à raiz e o registra para `dispose`. */
  const addPanel = (node: HTMLElement): HTMLElement => {
    root.appendChild(node);
    created.push(node);
    return node;
  };

  root.classList.add("hud-root");

  // --- Recursos (base-esquerda) -------------------------------------------
  const resPanel = addPanel(make("div", "hud-panel hud-resources", undefined, { "data-hud": "resources" }));
  const resGrid = make("div", "hud-res-grid");
  resPanel.appendChild(resGrid);

  interface ResCol {
    kind: ResourceKind;
    amount: HTMLElement;
    /** Contagem de aldeões neste recurso (texto isolado do ícone). */
    workers: HTMLElement;
  }
  const resCols: ResCol[] = RES_ORDER.map((kind) => {
    const col = make("div", "hud-res-col", undefined, { "data-res": kind });
    const head = make("div", "hud-res-head");
    head.appendChild(make("span", `hud-res-icon hud-icon-${kind}`, RES_ICON[kind]));
    head.appendChild(make("span", "hud-res-name", RES_LABEL[kind]));
    const amount = make("div", "hud-res-amount", "0");
    const workerRow = make("div", "hud-res-workers");
    const workers = make("span", "hud-res-worker-count", "0");
    workerRow.append(make("span", "hud-icon-person", "👤"), workers);
    col.append(head, amount, workerRow);
    resGrid.appendChild(col);
    return { kind, amount, workers };
  });

  const resSummary = make("div", "hud-res-summary");
  const popEl = make("span", "hud-stat", "0/0");
  const popRow = make("div", "hud-stat-row");
  popRow.append(make("span", "hud-icon-house", "⌂"), make("span", "hud-stat-label", "População"), popEl);
  const militaryEl = make("span", "hud-stat", "0");
  const militaryRow = make("div", "hud-stat-row");
  militaryRow.append(make("span", "hud-icon-sword", "⚔"), make("span", "hud-stat-label", "Militares"), militaryEl);
  const villagerEl = make("span", "hud-stat", "0");
  const villagerRow = make("div", "hud-stat-row");
  villagerRow.append(make("span", "hud-icon-person", "👤"), make("span", "hud-stat-label", "Aldeões"), villagerEl);
  resSummary.append(popRow, militaryRow, villagerRow);
  resPanel.appendChild(resSummary);

  const idleButton = make("button", "hud-btn hud-idle", "👤 Ociosos: 0", {
    "data-hud": "idle-villager",
    type: "button",
    title: "Selecionar aldeão ocioso",
  });
  idleButton.addEventListener("click", () => {
    idleCallback?.();
  });
  resPanel.appendChild(idleButton);

  // --- Indicador de era (topo-centro) -------------------------------------
  const ageRoman = make("div", "hud-age-roman", "I");
  const ageTimer = make("div", "hud-age-timer", "00:00");
  addPanel(make("div", "hud-panel hud-age", undefined, { "data-hud": "age-indicator" })).append(ageRoman, ageTimer);

  // --- Objetivos (topo-esquerda) ------------------------------------------
  const objList = make("ul", "hud-objective-list");
  const objPanel = addPanel(make("div", "hud-panel hud-objectives", undefined, { "data-hud": "objectives" }));
  objPanel.append(make("div", "hud-panel-title", "Objetivos"), objList);

  // --- Seleção + command card (base-centro) -------------------------------
  const bottom = addPanel(make("div", "hud-bottom"));

  const selPanel = make("div", "hud-panel hud-selection", undefined, { "data-hud": "selection" });
  bottom.appendChild(selPanel);
  const selEmpty = make("div", "hud-sel-empty", "Selecione unidades");
  const selSingle = make("div", "hud-sel-single");
  const selHead = make("div", "hud-sel-head");
  const selName = make("div", "hud-sel-name");
  const selSub = make("div", "hud-sel-sub");
  selHead.append(selName, selSub);
  const hpBar = make("div", "hud-bar hud-hp");
  const hpFill = make("div", "hud-bar-fill hud-hp-fill");
  hpBar.appendChild(hpFill);
  const hpText = make("div", "hud-hp-text");
  const progWrap = make("div", "hud-prog");
  const progLabel = make("div", "hud-prog-label");
  const progBar = make("div", "hud-bar hud-prog-bar");
  const progFill = make("div", "hud-bar-fill hud-prog-fill");
  progBar.appendChild(progFill);
  progWrap.append(progLabel, progBar);
  const queueEl = make("div", "hud-queue", undefined, { "data-hud": "production-queue" });
  selSingle.append(selHead, hpBar, hpText, progWrap, queueEl);
  const selMulti = make("div", "hud-sel-multi");
  const multiCount = make("div", "hud-multi-count");
  const multiList = make("div", "hud-multi-list");
  selMulti.append(multiCount, multiList);
  selPanel.append(selEmpty, selSingle, selMulti);
  // Estado inicial: sem seleção, só a dica aparece.
  selSingle.hidden = true;
  selMulti.hidden = true;

  const cmdPanel = make("div", "hud-panel hud-command-card", undefined, { "data-hud": "command-card" });
  bottom.appendChild(cmdPanel);
  for (let i = 0; i < 9; i += 1) {
    const btn = make("button", "hud-btn hud-cmd-btn", "·", {
      type: "button",
      disabled: "",
      title: "Em breve",
    });
    cmdPanel.appendChild(btn);
  }

  // --- Minimapa (base-direita) --------------------------------------------
  addPanel(make("div", "hud-panel hud-minimap", undefined, { "data-hud": "minimap" }));

  // --- Placar (topo-direita) ----------------------------------------------
  const scoreList = make("div", "hud-score-list");
  const scoreFps = make("div", "hud-score-fps", "0 FPS");
  const scorePanel = addPanel(make("div", "hud-panel hud-score", undefined, { "data-hud": "score" }));
  scorePanel.append(make("div", "hud-panel-title", "Jogadores"), scoreList, scoreFps);
  let scoreSig = "";
  interface ScoreRow {
    row: HTMLElement;
    swatch: HTMLElement;
    name: HTMLElement;
    era: HTMLElement;
    res: HTMLElement;
  }
  let scoreRows: ScoreRow[] = [];

  const refreshObjectives = (snapshot: World | undefined): void => {
    if (config === undefined) {
      if (objectiveSig !== "waiting") {
        objectiveSig = "waiting";
        objList.replaceChildren(make("li", "hud-objective", "Aguardando partida"));
      }
      return;
    }
    const enemies = config.bots.length;
    let line: string;
    let progress: string | undefined;
    if (config.victory === "landmarks") {
      const defeated = snapshot
        ? snapshot.players.filter((p) => p.id !== HUMAN && p.defeated).length
        : 0;
      line = "Destruir todos os edifícios lendários inimigos";
      progress = `(${Math.min(defeated, enemies)}/${enemies})`;
    } else if (config.victory === "wonder") {
      line = "Construir uma Maravilha";
    } else {
      const me = snapshot?.players.find((p) => p.id === HUMAN);
      const controlled = me ? me.score : 0;
      line = "Controlar todos os locais sagrados";
      progress = `(${Math.min(controlled, enemies)}/${enemies})`;
    }
    const sig = `${config.victory}|${line}|${progress ?? ""}`;
    if (sig === objectiveSig) return;
    objectiveSig = sig;
    objList.replaceChildren();
    const item = make("li", "hud-objective");
    item.append(make("span", "hud-objective-text", line));
    if (progress !== undefined) item.append(" ", make("span", "hud-objective-progress", progress));
    objList.appendChild(item);
  };

  const refreshSelection = (
    snapshot: World,
    byId: ReadonlyMap<number, Entity>,
    selectionIds: readonly number[],
  ): void => {
    const found = selectionIds
      .map((id) => byId.get(id))
      .filter((e): e is Entity => e !== undefined);

    if (found.length === 0) {
      selEmpty.hidden = false;
      selSingle.hidden = true;
      selMulti.hidden = true;
      return;
    }

    if (selectionIds.length === 1 && found.length === 1) {
      const e = found[0];
      if (e === undefined) return;
      selEmpty.hidden = true;
      selMulti.hidden = true;
      selSingle.hidden = false;

      const ownerName =
        snapshot.players.find((p) => p.id === e.owner)?.name ?? (e.owner < 0 ? "Neutro" : "—");
      setText(selName, typeName(e.type));
      setText(selSub, `${KIND_LABEL[e.kind]} · ${ownerName}`);

      const maxHp = e.maxHp > 0 ? e.maxHp : 1;
      const hpRatio = clampRatio(e.hp / maxHp);
      hpFill.style.width = `${(hpRatio * 100).toFixed(1)}%`;
      setText(hpText, `${Math.max(0, Math.round(e.hp))}/${Math.round(e.maxHp)}`);

      const training = e.training ?? [];
      const first = training[0];
      if (e.kind === "building" && e.built === false) {
        const max = e.buildProgressMax ?? 0;
        const ratio = max > 0 ? clampRatio((e.buildProgress ?? 0) / max) : 0;
        progWrap.hidden = false;
        setText(progLabel, `Construindo ${Math.round(ratio * 100)}%`);
        progFill.style.width = `${(ratio * 100).toFixed(1)}%`;
      } else if (first !== undefined) {
        const ratio = first.total > 0 ? clampRatio(first.progress / first.total) : 0;
        progWrap.hidden = false;
        setText(progLabel, `Treinando ${typeName(first.type)} ${Math.round(ratio * 100)}%`);
        progFill.style.width = `${(ratio * 100).toFixed(1)}%`;
      } else {
        progWrap.hidden = true;
      }

      // Fila de produção: reconstrói só quando a lista de tipos muda; senão atualiza barras.
      queueEl.hidden = training.length === 0;
      const queueKey = training.map((t) => t.type).join("|");
      if (queueEl.dataset["sig"] !== queueKey) {
        queueEl.dataset["sig"] = queueKey;
        queueEl.replaceChildren();
        for (const item of training) {
          const slot = make("div", "hud-queue-slot", abbrev(item.type), { title: typeName(item.type) });
          const fill = make("div", "hud-queue-fill");
          slot.appendChild(fill);
          queueEl.appendChild(slot);
        }
      }
      training.forEach((item, index) => {
        const slot = queueEl.children[index];
        const fill = slot?.querySelector<HTMLElement>(".hud-queue-fill");
        if (fill) {
          const ratio = item.total > 0 ? clampRatio(item.progress / item.total) : 0;
          fill.style.height = `${(ratio * 100).toFixed(1)}%`;
        }
      });
      return;
    }

    selEmpty.hidden = true;
    selSingle.hidden = true;
    selMulti.hidden = false;
    setText(multiCount, `${selectionIds.length} selecionadas`);
    const minis = found.slice(0, MAX_MINIATURES);
    const miniSig = minis.map((m) => `${m.id}:${m.type}:${ownerColor(snapshot, m.owner)}`).join("|");
    if (multiList.dataset["sig"] !== miniSig) {
      multiList.dataset["sig"] = miniSig;
      multiList.replaceChildren();
      for (const m of minis) {
        const mini = make("div", "hud-mini", undefined, { title: typeName(m.type) });
        mini.style.background = ownerColor(snapshot, m.owner);
        multiList.appendChild(mini);
      }
    }
  };

  const refreshScore = (snapshot: World, fps: number): void => {
    const sig = snapshot.players.map((p) => p.id).join(",");
    if (sig !== scoreSig) {
      scoreSig = sig;
      scoreList.replaceChildren();
      scoreRows = snapshot.players.map(() => {
        const row = make("div", "hud-score-row");
        const swatch = make("span", "hud-score-swatch");
        const name = make("span", "hud-score-name");
        const era = make("span", "hud-score-era");
        const res = make("span", "hud-score-res");
        row.append(swatch, name, era, res);
        scoreList.appendChild(row);
        return { row, swatch, name, era, res };
      });
    }
    snapshot.players.forEach((p, index) => {
      const cells = scoreRows[index];
      if (cells === undefined) return;
      cells.swatch.style.background = PLAYER_COLORS[p.color % PLAYER_COLORS.length] ?? NEUTRAL_COLOR;
      setText(cells.name, p.name);
      setText(cells.era, `Era ${ROMAN_NUMERALS[Math.min(Math.max(p.age - 1, 0), 3)] ?? "I"}`);
      const total = RES_ORDER.reduce((sum, kind) => sum + Math.floor(p.resources[kind]), 0);
      setText(cells.res, String(total));
      cells.row.classList.toggle("hud-score-defeated", p.defeated);
    });
    setText(scoreFps, `${Math.round(fps)} FPS`);
  };

  refreshObjectives(undefined);

  return {
    update(snapshot, selectionIds, extra): void {
      if (disposed) return;

      const me = snapshot.players.find((p) => p.id === HUMAN);
      const byId = new Map<number, Entity>();
      const lookupMap = new Map<number, MapResource>();
      for (const r of snapshot.map.resources) lookupMap.set(r.id, r);
      for (const e of snapshot.entities) byId.set(e.id, e);
      const lookup: ResourceLookup = { byId, mapById: lookupMap };

      // Recursos, aldeões por recurso e contagens de unidades.
      const counts: Record<ResourceKind, number> = { food: 0, wood: 0, gold: 0, stone: 0 };
      let military = 0;
      let villagers = 0;
      let idle = 0;
      for (const e of snapshot.entities) {
        if (e.owner !== HUMAN || e.kind !== "unit") continue;
        if (e.type !== "villager") {
          military += 1;
          continue;
        }
        villagers += 1;
        if (isIdleVillager(e)) idle += 1;
        const kind = villagerResource(e, lookup);
        if (kind !== undefined) counts[kind] += 1;
      }
      for (const col of resCols) {
        setText(col.amount, String(Math.floor(me?.resources[col.kind] ?? 0)));
        setText(col.workers, String(counts[col.kind]));
      }
      setText(popEl, `${me?.pop ?? 0}/${me?.popCap ?? 0}`);
      setText(militaryEl, String(military));
      setText(villagerEl, String(villagers));
      setText(idleButton, `👤 Ociosos: ${idle}`);

      // Era e tempo.
      const age = me?.age ?? 1;
      setText(ageRoman, ROMAN_NUMERALS[Math.min(Math.max(age - 1, 0), ROMAN_NUMERALS.length - 1)] ?? "I");
      setText(ageTimer, formatTime(extra.timeMs));

      refreshObjectives(snapshot);
      refreshSelection(snapshot, byId, selectionIds);
      refreshScore(snapshot, extra.fps);
    },

    setObjectives(newConfig: MatchConfig): void {
      if (disposed) return;
      config = newConfig;
      objectiveSig = "";
      refreshObjectives(undefined);
    },

    onIdleVillagerClick(cb: () => void): void {
      idleCallback = cb;
    },

    dispose(): void {
      if (disposed) return;
      disposed = true;
      for (const node of created) node.remove();
      created.length = 0;
      scoreRows = [];
      idleCallback = undefined;
      root.classList.remove("hud-root");
    },
  };
}
