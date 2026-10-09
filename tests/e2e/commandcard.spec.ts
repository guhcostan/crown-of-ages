import { expect, test } from "@playwright/test";

/**
 * e2e do command card (src/ui/hud.ts → setCommandActions).
 * Inicia a partida pelo menu e tenta selecionar um aldeão com clique real no canvas.
 * A câmera pode não enquadrar o aldeão; o teste é tolerante: aceita seleção vazia
 * (sem botões), mas exige que o command card exista e que, quando há botões, eles
 * sejam os de construção de aldeão.
 */

const VILLAGER_BUILD_LABELS = ["Casa", "Fazenda", "Moinho", "Acampamento de Madeira", "Acampamento de Mineração"];

test("command card: existe, é tolerante à seleção e não gera erros", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect(page.locator('[data-hud="command-card"]')).toHaveCount(1);

  // Centraliza a câmera na seleção inicial (tecla H foca na sua primeira unidade).
  await page.locator("#game-canvas").click({ position: { x: 800, y: 450 } });
  await page.keyboard.press("h");
  await page.waitForTimeout(300);

  // Clique no centro do canvas: pode selecionar aldeão, centro da cidade ou nada.
  await page.mouse.click(800, 450);
  await page.waitForTimeout(300);

  const card = page.locator('[data-hud="command-card"]');
  await expect(card).toBeVisible();
  const buttons = card.locator("button");
  await expect(buttons).toHaveCount(9);

  const enabledLabels = await buttons.evaluateAll((nodes) =>
    nodes
      .filter((n): n is HTMLButtonElement => n instanceof HTMLButtonElement && !n.disabled)
      .map((n) => n.textContent ?? ""),
  );

  if (enabledLabels.length > 0) {
    // Se há botões ativos, eles devem vir de uma seleção válida: construção de aldeão
    // (conjunto completo) ou treino/landmark de edifício. Nunca um rótulo estranho.
    const isVillagerSet = VILLAGER_BUILD_LABELS.every((label) => enabledLabels.includes(label));
    const isBuildingSet = enabledLabels.every((label) => !VILLAGER_BUILD_LABELS.includes(label));
    expect(isVillagerSet || isBuildingSet).toBe(true);
    if (isVillagerSet) {
      for (const label of VILLAGER_BUILD_LABELS) {
        expect(enabledLabels).toContain(label);
      }
    }
  } else {
    // Sem seleção útil: o card existe, mas todos os slots estão desabilitados.
    await expect(buttons.first()).toBeDisabled();
  }

  expect(consoleErrors).toEqual([]);
});
