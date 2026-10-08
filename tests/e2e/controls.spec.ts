import { expect, test } from "@playwright/test";

/**
 * Controles básicos via window.__game: dá ordem de movimento a um aldeão e confere
 * que a posição muda. Sem erros de console.
 */
interface EntityLike {
  id: number;
  kind: string;
  type: string;
  owner: number;
  x: number;
  z: number;
}

test("controles: ordem de movimento altera a posição do aldeão", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");
  await page.waitForFunction(() => "__game" in window);

  const result = await page.evaluate(() => {
    const game = (window as unknown as { __game: Record<string, unknown> }).__game;
    type Api = {
      newMatch(config: unknown): string;
      tick(n?: number): void;
      send(command: unknown): void;
      getState(): { entities: EntityLike[] };
    };
    const api = game as unknown as Api;
    api.newMatch({
      seed: 42,
      civ: "english",
      map: "valley",
      size: "small",
      bots: [{ difficulty: "easy" }],
      victory: "landmarks",
      gameSpeed: 1,
    });
    api.tick(10);
    const villager = api
      .getState()
      .entities.find((e) => e.kind === "unit" && e.type === "villager" && e.owner === 0);
    if (!villager) return null;
    const before = { x: villager.x, z: villager.z };
    api.send({ tick: 0, type: "move", unitIds: [villager.id], x: 40, z: 40, queue: false });
    api.tick(600);
    const after = api
      .getState()
      .entities.find((e) => e.id === villager.id);
    return { id: villager.id, before, after: after ? { x: after.x, z: after.z } : null };
  });

  expect(result).not.toBeNull();
  expect(result?.after).not.toBeNull();
  const moved = Math.hypot(
    (result?.after?.x ?? 0) - (result?.before.x ?? 0),
    (result?.after?.z ?? 0) - (result?.before.z ?? 0),
  );
  expect(moved).toBeGreaterThan(0.5);

  await page.screenshot({ path: "test-results/controls.png" });
  expect(consoleErrors).toEqual([]);
});
