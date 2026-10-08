import { expect, test } from "@playwright/test";

/**
 * e2e do HUD (docs/ARCHITECTURE.md §7): dirige a partida só por window.__game + DOM.
 * Verifica a presença dos painéis data-hud e o conteúdo mínimo esperado.
 * (Catraca: esta suíte só cresce — nunca apagar/enfraquecer testes.)
 */
test("hud: monta os painéis data-hud e não gera erros de console", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");
  await page.waitForFunction(() => (window as unknown as { __game?: unknown }).__game !== undefined);

  await page.evaluate(() => {
    const g = (window as unknown as {
      __game: { newMatch(c: unknown): unknown; tick(n: number): void };
    }).__game;
    g.newMatch({
      seed: 7,
      civ: "english",
      map: "highlands",
      size: "small",
      bots: [{ difficulty: "easy" }],
      victory: "landmarks",
      gameSpeed: 1,
    });
    g.tick(5);
  });

  // Recursos: visível e com os 4 recursos.
  const resources = page.locator('[data-hud="resources"]');
  await expect(resources).toBeVisible();
  for (const label of ["Comida", "Madeira", "Ouro", "Pedra"]) {
    await expect(resources).toContainText(label);
  }

  // Era: algarismo romano I no início da partida.
  await expect(page.locator('[data-hud="age-indicator"]')).toContainText("I");

  // Objetivos: visível (victory landmarks).
  await expect(page.locator('[data-hud="objectives"]')).toBeVisible();

  // Demais painéis presentes no DOM.
  await expect(page.locator('[data-hud="minimap"]')).toHaveCount(1);
  await expect(page.locator('[data-hud="score"]')).toHaveCount(1);
  await expect(page.locator('[data-hud="selection"]')).toHaveCount(1);
  await expect(page.locator('[data-hud="command-card"]')).toHaveCount(1);
  await expect(page.locator('[data-hud="idle-villager"]')).toHaveCount(1);

  // Nada do jogo original: as regiões obrigatórias estão no DOM e sem erros.
  expect(consoleErrors).toEqual([]);

  await page.screenshot({ path: "test-results/hud.png", fullPage: true });
});
