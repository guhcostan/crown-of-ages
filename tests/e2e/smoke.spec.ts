import { expect, test } from "@playwright/test";

/**
 * Smoke de producao: a pagina carrega, sem erros de console, e expoe window.__game.
 * (Catraca: esta suite so cresce — nunca apagar/enfraquecer testes.)
 */
test("smoke: pagina carrega e expoe window.__game sem erros de console", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");
  await expect(page).toHaveTitle(/Crown of Ages/);
  const api = await page.evaluate(() => {
    const g = (window as unknown as { __game?: { version?: string; status?: string } }).__game;
    return g ? { version: g.version ?? null, status: g.status ?? null } : null;
  });
  expect(api).not.toBeNull();
  expect(api?.version).toBe("scaffold");
  expect(consoleErrors).toEqual([]);
});
