/**
 * victory.ts — tela de VITÓRIA / DERROTA (overlay DOM).
 *
 * Exibida quando a partida termina (`world.victory.kind !== "playing"`). Usa a mesma
 * paleta do HUD (dourado/escuro). Sem imagens do jogo original: visual é CSS e texto.
 * `data-victory` são ids estáveis usados pelo e2e.
 */
import "./victory.css";
import type { VictoryId } from "@sim/types";

/** Dados mínimos para montar a tela de fim de partida. */
export interface VictoryInfo {
  /** Jogador vencedor. */
  player: number;
  /** Condição que encerrou a partida. */
  reason: VictoryId;
  /** Tempo decorrido em milissegundos. */
  timeMs: number;
  /** Jogador controlado pelo humano (padrão 0). */
  humanPlayer?: number;
}

/** Handle devolvido por `showVictory`. */
export interface VictoryHandle {
  onMenu(cb: () => void): void;
  hide(): void;
}

/** Jogador humano padrão. */
const HUMAN = 0;

/** Motivo de vitória/derrota em PT-BR. */
const REASON_TEXT: Readonly<Record<VictoryId, string>> = {
  landmarks: "Todos os edifícios lendários inimigos foram destruídos.",
  wonder: "Uma Maravilha foi concluída.",
  "sacred-sites": "Todos os locais sagrados foram controlados.",
};

/** Texto exibido quando o humano perde. */
const DEFEAT_TEXT = "Seu império caiu diante dos inimigos.";

/** Formata milissegundos em mm:ss. */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Cria um botão de ação do overlay com `data-victory` estável. */
function makeButton(dataId: string, label: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "victory-btn";
  btn.dataset["victory"] = dataId;
  btn.textContent = label;
  return btn;
}

/** Remove qualquer overlay de vitória já montado em `root`. */
export function hideVictory(root: HTMLElement): void {
  for (const node of root.querySelectorAll<HTMLElement>('[data-victory="screen"]')) {
    node.remove();
  }
}

/**
 * Mostra a tela de fim de partida dentro de `root`. Substitui qualquer overlay anterior.
 * O callback `onMenu` deve ser ligado antes do clique do jogador (é chamado depois).
 */
export function showVictory(root: HTMLElement, info: VictoryInfo): VictoryHandle {
  hideVictory(root);

  const human = info.humanPlayer ?? HUMAN;
  const won = info.player === human;

  const screen = document.createElement("div");
  screen.className = `victory-screen ${won ? "is-victory" : "is-defeat"}`;
  screen.dataset["victory"] = "screen";
  screen.setAttribute("role", "dialog");
  screen.setAttribute("aria-modal", "true");

  const title = document.createElement("h2");
  title.className = "victory-title";
  title.dataset["victory"] = "title";
  title.textContent = won ? "VITÓRIA" : "DERROTA";

  const reason = document.createElement("p");
  reason.className = "victory-reason";
  reason.dataset["victory"] = "reason";
  // Na derrota o texto de motivo descreve a falha, não a condição de vitória.
  reason.textContent = won ? REASON_TEXT[info.reason] : DEFEAT_TEXT;

  const time = document.createElement("p");
  time.className = "victory-time";
  time.textContent = `Tempo: ${formatTime(info.timeMs)}`;

  const actions = document.createElement("div");
  actions.className = "victory-actions";
  const menuBtn = makeButton("menu", "MENU PRINCIPAL");
  const closeBtn = makeButton("close", "FECHAR");
  actions.append(menuBtn, closeBtn);

  screen.append(title, reason, time, actions);
  root.appendChild(screen);

  let menuCb: (() => void) | undefined;
  menuBtn.addEventListener("click", () => {
    menuCb?.();
  });
  closeBtn.addEventListener("click", () => {
    hideVictory(root);
  });

  return {
    onMenu(cb: () => void): void {
      menuCb = cb;
    },
    hide(): void {
      hideVictory(root);
    },
  };
}
