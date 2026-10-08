import { expect, test } from "@playwright/test";

/**
 * Render 3D: a partida sobe, o canvas WebGL tem tamanho e não há erros de console.
 * Gera screenshot em test-results/render.png para inspeção visual.
 * (Catraca: esta suite só cresce — nunca apagar/enfraquecer testes.)
 */
test("render: partida sobe com canvas 3D sem erros de console", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");
  await page.waitForFunction(() => (window as unknown as { __game?: unknown }).__game !== undefined);

  await page.evaluate(() => {
    const g = (window as unknown as { __game: { newMatch: (c: unknown) => void; tick: (n: number) => void } }).__game;
    g.newMatch({
      seed: 3,
      civ: "english",
      map: "valley",
      size: "small",
      bots: [],
      victory: "landmarks",
      gameSpeed: 1,
    });
    g.tick(2);
  });

  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(0);
  expect(box?.height ?? 0).toBeGreaterThan(0);

  // Dá alguns frames para o renderer desenhar a cena.
  await page.waitForTimeout(500);
  await page.screenshot({ path: "test-results/render.png", fullPage: false });

  expect(consoleErrors).toEqual([]);
});
