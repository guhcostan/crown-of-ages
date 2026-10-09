/**
 * menu.ts — menu inicial em DOM (docs/SPEC.md §8.3–8.5).
 *
 * Telas: título (JOGAR / CONTROLES / CREDITOS), configuração de partida skirmish
 * (setup), controles (atalhos da §8.4) e créditos. Apenas uma seção fica visível por
 * vez. Sem imagens do jogo original: visual é CSS puro e texto/unicode.
 * Os `data-menu` são estáveis e usados pelo e2e.
 */
import "./menu.css";
import type { CivId, MapPresetId, MapSize, VictoryId, BotDifficulty } from "@sim/types";

/** Configuração escolhida na tela de skirmish. */
export interface SkirmishConfig {
  seed: number;
  civ: "english" | "french";
  map: "highlands" | "valley" | "steppes";
  size: "small" | "medium" | "large";
  bots: number;
  difficulty: "easy" | "medium" | "hard";
  victory: "landmarks" | "wonder" | "sacred-sites";
}

/** Contrato público do menu. */
export interface MenuHandle {
  onStart(cb: (cfg: SkirmishConfig) => void): void;
  show(): void;
  hide(): void;
  dispose(): void;
}

/** Seções do menu; no máximo uma visível por vez. */
type Section = "title" | "setup" | "controls" | "credits";

/** Opção de um grupo de botões. */
interface Option<T extends string | number> {
  value: T;
  label: string;
}

/** Grupo de botões de escolha única, lido pelo menu ao iniciar. */
interface OptionGroup<T extends string | number> {
  element: HTMLElement;
  get(): T;
  set(value: T): void;
}

/** Maior seed aceito (inteiro positivo de 31 bits). */
const MAX_SEED = 0x7fffffff;
/** Seed padrão quando o campo está vazio ou inválido. */
const DEFAULT_SEED = 1;

const CIV_OPTIONS: readonly Option<CivId>[] = [
  { value: "english", label: "Ingleses" },
  { value: "french", label: "Franceses" },
];

const MAP_OPTIONS: readonly Option<MapPresetId>[] = [
  { value: "highlands", label: "Terras Altas" },
  { value: "valley", label: "Vale" },
  { value: "steppes", label: "Estepes" },
];

const SIZE_OPTIONS: readonly Option<MapSize>[] = [
  { value: "small", label: "Pequeno" },
  { value: "medium", label: "Médio" },
  { value: "large", label: "Grande" },
];

const BOT_OPTIONS: readonly Option<number>[] = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
];

const DIFFICULTY_OPTIONS: readonly Option<BotDifficulty>[] = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Média" },
  { value: "hard", label: "Difícil" },
];

const VICTORY_OPTIONS: readonly Option<VictoryId>[] = [
  { value: "landmarks", label: "Landmarks" },
  { value: "wonder", label: "Maravilha" },
  { value: "sacred-sites", label: "Locais Sagrados" },
];

/** Atalhos exibidos na tela CONTROLES (SPEC §8.4 e pedido do Lead). */
const CONTROL_ROWS: readonly { keys: string; text: string }[] = [
  { keys: "Arraste", text: "Seleção em caixa" },
  { keys: "Clique", text: "Selecionar unidade ou construção" },
  { keys: "Duplo clique", text: "Selecionar todas do mesmo tipo" },
  { keys: "Clique direito", text: "Mover / comandar" },
  { keys: "WASD / setas", text: "Mover a câmera (pan)" },
  { keys: "Roda do mouse", text: "Zoom" },
  { keys: "Q / E", text: "Rotacionar câmera" },
  { keys: "Ctrl + N", text: "Criar grupo de controle N" },
  { keys: "N", text: "Selecionar grupo N" },
  { keys: "Shift + N", text: "Adicionar seleção ao grupo N" },
  { keys: "Tab", text: "Alternar subgrupo na seleção" },
  { keys: "H", text: "Focar na seleção" },
  { keys: "ESC", text: "Desselecionar / voltar ao menu" },
];

/** Texto de créditos original (sem nomes ou identidade do jogo de referência). */
const CREDITS_LINES: readonly string[] = [
  "Crown of Ages é um jogo de estratégia em tempo real para navegador.",
  "Arte, áudio e nomes próprios são originais deste projeto.",
  "Os números de mecânica são inspirados no clássico RTS medieval.",
  "Desenvolvimento: equipe Crown of Ages.",
  "Este jogo não usa imagens, ícones ou sons do jogo original.",
];

/**
 * Cria um grupo de botões de escolha única (`data-group` + `data-value`).
 * Estado selecionado é refletido em `aria-pressed` e na classe `is-selected`.
 */
function buildOptionGroup<T extends string | number>(
  group: string,
  legend: string,
  options: readonly Option<T>[],
  initial: T,
): OptionGroup<T> {
  const fieldset = document.createElement("fieldset");
  fieldset.className = "menu-field";
  const legendEl = document.createElement("legend");
  legendEl.textContent = legend;
  const row = document.createElement("div");
  row.className = "menu-options";
  row.setAttribute("role", "group");
  row.setAttribute("aria-label", legend);

  let current = initial;
  const buttons: { value: T; el: HTMLButtonElement }[] = [];

  const paint = (): void => {
    for (const entry of buttons) {
      const on = entry.value === current;
      entry.el.setAttribute("aria-pressed", on ? "true" : "false");
      entry.el.classList.toggle("is-selected", on);
    }
  };

  for (const opt of options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu-btn menu-option";
    btn.dataset.group = group;
    btn.dataset.value = String(opt.value);
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      current = opt.value;
      paint();
    });
    buttons.push({ value: opt.value, el: btn });
    row.append(btn);
  }

  paint();
  fieldset.append(legendEl, row);
  return {
    element: fieldset,
    get: () => current,
    set: (value: T) => {
      current = value;
      paint();
    },
  };
}

/** Cria um botão de ação do menu com `data-menu` estável. */
function buildButton(dataMenu: string, label: string, variant: "primary" | "normal"): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = variant === "primary" ? "menu-btn menu-btn-primary" : "menu-btn";
  btn.dataset.menu = dataMenu;
  btn.textContent = label;
  return btn;
}

/** Monta o menu dentro de `root` e devolve o handle de controle. */
export function mountMenu(root: HTMLElement): MenuHandle {
  const container = document.createElement("div");
  container.className = "menu-root";
  container.dataset.menu = "root";

  const frame = document.createElement("div");
  frame.className = "menu-frame";

  const sections: Record<Section, HTMLElement> = {
    title: document.createElement("section"),
    setup: document.createElement("section"),
    controls: document.createElement("section"),
    credits: document.createElement("section"),
  };
  for (const key of Object.keys(sections) as Section[]) {
    const sec = sections[key];
    sec.className = "menu-section";
    // Títulos e setup usam `data-menu`; controles/créditos usam `data-screen` para não
    // colidir com os botões de mesmo nome em `data-menu`.
    if (key === "title" || key === "setup") sec.dataset.menu = key;
    else sec.dataset.screen = key;
    sec.hidden = key !== "title";
  }

  // --- Título -------------------------------------------------------------
  const titleHeading = document.createElement("h1");
  titleHeading.className = "menu-title";
  titleHeading.textContent = "CROWN OF AGES";
  const titleSub = document.createElement("p");
  titleSub.className = "menu-subtitle";
  titleSub.textContent = "Estratégia em tempo real";
  const titleButtons = document.createElement("div");
  titleButtons.className = "menu-stack";
  const playBtn = buildButton("play", "JOGAR", "primary");
  const controlsBtn = buildButton("controls", "CONTROLES", "normal");
  const creditsBtn = buildButton("credits", "CRÉDITOS", "normal");
  titleButtons.append(playBtn, controlsBtn, creditsBtn);
  sections.title.append(titleHeading, titleSub, titleButtons);

  // --- Configuração da partida (setup) -------------------------------------
  const setupTitle = document.createElement("h2");
  setupTitle.className = "menu-section-title";
  setupTitle.textContent = "Partida Skirmish";

  const civGroup = buildOptionGroup<CivId>("civ", "Civilização", CIV_OPTIONS, "english");
  const mapGroup = buildOptionGroup<MapPresetId>("map", "Mapa", MAP_OPTIONS, "valley");
  const sizeGroup = buildOptionGroup<MapSize>("size", "Tamanho", SIZE_OPTIONS, "small");
  const botGroup = buildOptionGroup<number>("bots", "Bots", BOT_OPTIONS, 1);
  const difficultyGroup = buildOptionGroup<BotDifficulty>("difficulty", "Dificuldade", DIFFICULTY_OPTIONS, "medium");
  const victoryGroup = buildOptionGroup<VictoryId>("victory", "Vitória", VICTORY_OPTIONS, "landmarks");

  // Seed: campo numérico + opção aleatória (Math.random é permitido no menu).
  const seedField = document.createElement("fieldset");
  seedField.className = "menu-field";
  const seedLegend = document.createElement("legend");
  seedLegend.textContent = "Seed";
  const seedRow = document.createElement("div");
  seedRow.className = "menu-options";
  const seedInput = document.createElement("input");
  seedInput.type = "number";
  seedInput.min = "0";
  seedInput.max = String(MAX_SEED);
  seedInput.step = "1";
  seedInput.value = String(DEFAULT_SEED);
  seedInput.dataset.menu = "seed";
  seedInput.className = "menu-input";
  seedInput.setAttribute("aria-label", "Seed da partida");
  const randomLabel = document.createElement("label");
  randomLabel.className = "menu-check";
  const randomCheck = document.createElement("input");
  randomCheck.type = "checkbox";
  randomCheck.dataset.menu = "seed-random";
  randomCheck.checked = false;
  const randomText = document.createElement("span");
  randomText.textContent = "Aleatório";
  randomLabel.append(randomCheck, randomText);
  randomCheck.addEventListener("change", () => {
    seedInput.disabled = randomCheck.checked;
  });
  seedRow.append(seedInput, randomLabel);
  seedField.append(seedLegend, seedRow);

  const setupForm = document.createElement("div");
  setupForm.className = "menu-form";
  setupForm.append(
    civGroup.element,
    mapGroup.element,
    sizeGroup.element,
    botGroup.element,
    difficultyGroup.element,
    victoryGroup.element,
    seedField,
  );

  const setupActions = document.createElement("div");
  setupActions.className = "menu-actions";
  const startBtn = buildButton("start", "INICIAR PARTIDA", "primary");
  const setupBackBtn = buildButton("back", "VOLTAR", "normal");
  setupActions.append(startBtn, setupBackBtn);
  sections.setup.append(setupTitle, setupForm, setupActions);

  // --- Controles -----------------------------------------------------------
  const controlsTitle = document.createElement("h2");
  controlsTitle.className = "menu-section-title";
  controlsTitle.textContent = "Controles";
  const controlsList = document.createElement("dl");
  controlsList.className = "menu-keys";
  for (const row of CONTROL_ROWS) {
    const dt = document.createElement("dt");
    const kbd = document.createElement("kbd");
    kbd.textContent = row.keys;
    dt.append(kbd);
    const dd = document.createElement("dd");
    dd.textContent = row.text;
    controlsList.append(dt, dd);
  }
  const controlsBackBtn = buildButton("controls-back", "VOLTAR", "normal");
  const controlsActions = document.createElement("div");
  controlsActions.className = "menu-actions";
  controlsActions.append(controlsBackBtn);
  sections.controls.append(controlsTitle, controlsList, controlsActions);

  // --- Créditos ------------------------------------------------------------
  const creditsTitle = document.createElement("h2");
  creditsTitle.className = "menu-section-title";
  creditsTitle.textContent = "Créditos";
  const creditsBody = document.createElement("div");
  creditsBody.className = "menu-credits";
  for (const line of CREDITS_LINES) {
    const p = document.createElement("p");
    p.textContent = line;
    creditsBody.append(p);
  }
  const creditsBackBtn = buildButton("credits-back", "VOLTAR", "normal");
  const creditsActions = document.createElement("div");
  creditsActions.className = "menu-actions";
  creditsActions.append(creditsBackBtn);
  sections.credits.append(creditsTitle, creditsBody, creditsActions);

  frame.append(sections.title, sections.setup, sections.controls, sections.credits);
  container.append(frame);
  root.append(container);

  // --- Estado e eventos ----------------------------------------------------
  let currentSection: Section = "title";
  const startCallbacks: ((cfg: SkirmishConfig) => void)[] = [];

  const showSection = (section: Section): void => {
    currentSection = section;
    for (const key of Object.keys(sections) as Section[]) {
      sections[key].hidden = key !== section;
    }
    // Foco no primeiro controle da tela para navegação por teclado.
    const focusTarget = section === "title" ? playBtn : section === "setup" ? startBtn : null;
    focusTarget?.focus();
  };

  /** Lê a seed do campo (ou sorteia, se "Aleatório"); devolve valor inteiro válido. */
  const resolveSeed = (): number => {
    if (randomCheck.checked) {
      const drawn = Math.floor(Math.random() * MAX_SEED) + 1;
      seedInput.value = String(drawn);
      return drawn;
    }
    const parsed = Math.trunc(Number(seedInput.value));
    if (!Number.isFinite(parsed)) return DEFAULT_SEED;
    return Math.min(MAX_SEED, Math.max(0, parsed));
  };

  const readConfig = (): SkirmishConfig => ({
    seed: resolveSeed(),
    civ: civGroup.get(),
    map: mapGroup.get(),
    size: sizeGroup.get(),
    bots: botGroup.get(),
    difficulty: difficultyGroup.get(),
    victory: victoryGroup.get(),
  });

  const onClick = (ev: MouseEvent): void => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.closest<HTMLElement>("[data-menu]");
    if (!action || action === container || action === frame) return;
    switch (action.dataset.menu) {
      case "play":
        showSection("setup");
        break;
      case "controls":
        showSection("controls");
        break;
      case "credits":
        showSection("credits");
        break;
      case "back":
      case "controls-back":
      case "credits-back":
        showSection("title");
        break;
      case "start": {
        const cfg = readConfig();
        // Esconde o menu antes do callback: a partida assume a tela.
        handle.hide();
        for (const cb of startCallbacks) cb(cfg);
        break;
      }
      default:
        break;
    }
  };

  /** ESC volta ao menu principal a partir de qualquer subtela. */
  const onKeyDown = (ev: KeyboardEvent): void => {
    if (ev.key !== "Escape" || container.hidden || currentSection === "title") return;
    showSection("title");
  };

  container.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown);

  const handle: MenuHandle = {
    onStart(cb: (cfg: SkirmishConfig) => void): void {
      startCallbacks.push(cb);
    },
    show(): void {
      showSection("title");
      container.hidden = false;
    },
    hide(): void {
      container.hidden = true;
    },
    dispose(): void {
      container.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      container.remove();
      startCallbacks.length = 0;
    },
  };

  // Estado inicial: visível na tela de título.
  showSection("title");
  return handle;
}
