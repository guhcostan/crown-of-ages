import { expect, test } from "@playwright/test";

/**
 * Menu inicial (src/ui/menu.ts). Usa os `data-menu` estáveis do menu.
 * Observação: o callback onStart não é exposto em window; o início de partida é
 * verificado pelo menu ficar escondido após INICIAR PARTIDA.
 */

test("menu: título CROWN OF AGES e botões principais existem", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");

  const title = page.locator('[data-menu="title"]');
  await expect(title).toBeVisible();
  await expect(title).toContainText("CROWN OF AGES");

  await expect(page.locator('[data-menu="play"]')).toBeVisible();
  await expect(page.locator('[data-menu="controls"]')).toBeVisible();
  await expect(page.locator('[data-menu="credits"]')).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test("menu: JOGAR abre o setup e INICIAR com config escolhida esconde o menu", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");
  await page.locator('[data-menu="play"]').click();

  const setup = page.locator('[data-menu="setup"]');
  await expect(setup).toBeVisible();
  await expect(page.locator('[data-menu="title"]')).toBeHidden();

  // Escolhas: civ english, bots 1, victory landmarks (padrões), seed 11.
  await page.locator('[data-group="civ"][data-value="english"]').click();
  await page.locator('[data-group="bots"][data-value="1"]').click();
  await page.locator('[data-group="victory"][data-value="landmarks"]').click();
  await page.locator('[data-menu="seed"]').fill("11");

  await expect(page.locator('[data-group="civ"][data-value="english"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-group="bots"][data-value="1"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-group="victory"][data-value="landmarks"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator('[data-menu="seed"]')).toHaveValue("11");

  await page.locator('[data-menu="start"]').click();

  // Partida iniciada: o menu some (setup escondido).
  await expect(setup).toBeHidden();

  expect(consoleErrors).toEqual([]);
});

test("menu: CONTROLES abre e VOLTAR retorna ao título", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");
  await page.locator('[data-menu="controls"]').click();

  const controls = page.locator('section[data-screen="controls"]');
  await expect(controls).toBeVisible();
  await expect(page.locator('[data-menu="title"]')).toBeHidden();
  await expect(controls).toContainText("Clique direito");

  await page.locator('[data-menu="controls-back"]').click();
  await expect(page.locator('[data-menu="title"]')).toBeVisible();
  await expect(controls).toBeHidden();

  expect(consoleErrors).toEqual([]);
});

test("menu: CREDITOS abre e VOLTAR retorna ao título", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");
  await page.locator('[data-menu="credits"]').click();

  const credits = page.locator('section[data-screen="credits"]');
  await expect(credits).toBeVisible();
  await expect(page.locator('[data-menu="title"]')).toBeHidden();

  await page.locator('[data-menu="credits-back"]').click();
  await expect(page.locator('[data-menu="title"]')).toBeVisible();
  await expect(credits).toBeHidden();

  expect(consoleErrors).toEqual([]);
});

test("menu: ESC no setup volta ao menu principal", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-menu="play"]').click();
  await expect(page.locator('section[data-menu="setup"]')).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator('[data-menu="title"]')).toBeVisible();
  await expect(page.locator('section[data-menu="setup"]')).toBeHidden();
});
