import { expect, test } from "@playwright/test";

/**
 * e2e da sessão (src/game/session.ts): menu → partida → construção.
 * Inicia pelo menu real (data-menu=play → INICIAR) e dirige a simulação só por
 * window.__game, verificando o efeito no estado do mundo.
 */

interface BuildingEntity {
  id: number;
  kind: string;
  type: string;
  owner: number;
  x: number;
  z: number;
  built?: boolean;
}

interface GameLike {
  getState(): {
    entities: BuildingEntity[];
    players: Array<{ id: number; popCap: number }>;
    tick: number;
  };
  send(cmd: unknown): void;
  tick(n: number): void;
}

test("sessão: menu inicia partida e construção de casa conclui", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();

  // Partida iniciada: HUD de recursos visível e menu escondido.
  await expect(page.locator('[data-hud="resources"]')).toBeVisible();
  await expect(page.locator('[data-menu="setup"]')).toBeHidden();

  const before = await page.evaluate(() => {
    const g = (window as unknown as { __game: GameLike }).__game;
    const state = g.getState();
    const villagers = state.entities.filter((e) => e.owner === 0 && e.type === "villager");
    const tc = state.entities.find((e) => e.owner === 0 && e.type === "town-center");
    const popCap = state.players.find((p) => p.id === 0)?.popCap ?? 0;
    return { villagerCount: villagers.length, tcX: tc?.x ?? 0, tcZ: tc?.z ?? 0, popCap };
  });
  expect(before.villagerCount).toBeGreaterThan(0);

  // Constrói casa perto dos aldeões iniciais (ao lado do centro da cidade).
  await page.evaluate(
    ({ x, z }) => {
      const g = (window as unknown as { __game: GameLike }).__game;
      const tick = g.getState().tick;
      const villagerIds = g
        .getState()
        .entities.filter((e) => e.owner === 0 && e.type === "villager")
        .map((e) => e.id);
      g.send({ tick, type: "build", unitIds: villagerIds, buildingType: "house", x, z, queue: false });
      g.tick(800);
    },
    { x: before.tcX + 8, z: before.tcZ + 8 },
  );

  const after = await page.evaluate(() => {
    const g = (window as unknown as { __game: GameLike }).__game;
    const state = g.getState();
    const house = state.entities.find((e) => e.owner === 0 && e.type === "house");
    const popCap = state.players.find((p) => p.id === 0)?.popCap ?? 0;
    return { houseBuilt: house?.built === true, popCap };
  });

  expect(after.houseBuilt).toBe(true);
  expect(after.popCap).toBeGreaterThan(before.popCap);

  await page.screenshot({ path: "test-results/session.png", fullPage: true });
  expect(consoleErrors).toEqual([]);
});
