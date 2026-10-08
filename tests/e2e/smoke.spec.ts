import { expect, test } from "@playwright/test";

/**
 * Smoke de producao: a pagina carrega, sem erros de console, e expoe window.__game
 * com o contrato vigente (newMatch/tick/getState). (Catraca: esta suite so cresce —
 * nunca apagar/enfraquecer testes.)
 */
test("smoke: pagina carrega e expoe window.__game funcional sem erros de console", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");
  await expect(page).toHaveTitle(/Crown of Ages/);
  await page.waitForFunction(() => typeof window.__game !== "undefined");

  const api = await page.evaluate(() => {
    const g = (window as unknown as { __game?: Record<string, unknown> }).__game;
    if (!g) return null;
    const cfg = {
      seed: 1,
      civ: "english",
      map: "valley",
      size: "small",
      bots: [{ difficulty: "easy" }],
      victory: "landmarks",
      gameSpeed: 1,
    };
    const id = (g.newMatch as (c: unknown) => string)(cfg);
    (g.tick as (n?: number) => void)(5);
    const state = (g.getState as () => { tick: number; entities: unknown[] })();
    return {
      version: g.version as string,
      matchId: id,
      tick: state.tick,
      entities: state.entities.length,
      hasCanvas: document.querySelector("canvas") !== null,
    };
  });

  expect(api).not.toBeNull();
  expect(api?.version).toBe("0.1.0");
  expect(api?.matchId).toMatch(/^match-/);
  expect(api?.tick).toBeGreaterThanOrEqual(5);
  expect(api?.entities).toBeGreaterThan(10);
  expect(api?.hasCanvas).toBe(true);
  expect(consoleErrors).toEqual([]);
});
