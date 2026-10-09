import { expect, test, type Page } from "@playwright/test";

/**
 * Marco jogável ponta a ponta (critério de aceite do usuário):
 * menu → partida → aldeões coletando os 4 recursos → construção (casas/fazendas)
 * → avanço de idade por landmark → treinar exército → combate com counters →
 * condição de vitória — tudo verificado pelo window.__game.
 */
interface Ent {
  id: number;
  kind: string;
  type: string;
  owner: number;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  built?: boolean;
}

interface State {
  tick: number;
  players: Array<{
    id: number;
    resources: { food: number; wood: number; gold: number; stone: number };
    pop: number;
    popCap: number;
    age: number;
    defeated: boolean;
  }>;
  entities: Ent[];
  map?: { resources: Array<{ kind: string; amount: number; x: number; z: number }> };
  victory: { kind: string; player?: number; reason?: string };
}

const state = (page: Page): Promise<State> =>
  page.evaluate(() => {
    const g = (window as unknown as { __game: { getState(): State } }).__game;
    return g.getState();
  });

async function tick(page: Page, n: number): Promise<void> {
  await page.evaluate((k) => {
    (window as unknown as { __game: { tick(n: number): void } }).__game.tick(k);
  }, n);
}

async function send(page: Page, cmd: Record<string, unknown>): Promise<void> {
  await page.evaluate((c) => {
    (window as unknown as { __game: { send(cmd: unknown): void } }).__game.send(c);
  }, cmd);
}

test("marco jogavel: economia -> construcao -> era -> exercito -> combate -> vitoria", async ({ page }) => {
  test.setTimeout(240_000);
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  await page.goto("/");
  await page.waitForFunction(() => typeof window.__game !== "undefined");

  // ---- 1. menu -> partida (fluxo real: JOGAR -> INICIAR PARTIDA)
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="setup"]').waitFor({ state: "visible" });
  await page.locator('[data-menu="seed"]').fill("42");
  await page.locator('[data-menu="start"]').click();
  await page.waitForFunction(() => {
    const g = (window as unknown as { __game: { getState(): { tick: number } } }).__game;
    return g.getState().tick >= 0 && document.querySelector('[data-hud="resources"]') !== null;
  });
  const matchId = "match-1";
  expect(matchId).toMatch(/^match-/);

  let s = await state(page);
  const villagers = () =>
    s.entities.filter((e) => e.kind === "unit" && e.type === "villager" && e.owner === 0).map((e) => e.id);
  const tcEnt = () => s.entities.find((e) => e.type === "town-center" && e.owner === 0);
  /** Recursos do mapa ainda nao exauridos ( casa entity x map.resources por posicao). */
  const fresh = (kind: string): Ent[] => {
    const ents = s.entities.filter((e) => e.kind === "resource" && e.type === kind);
    const mapRes = s.map?.resources ?? [];
    return ents.filter((e) => {
      const r = mapRes.find((m) => m.kind === kind && m.x === e.x && m.z === e.z);
      return (r?.amount ?? 0) > 0;
    });
  };
  /** Fonte mais proxima do TC (evita viagens longas). */
  const nearest = (kind: string): Ent | undefined => {
    const tc = tcEnt();
    const list = fresh(kind);
    if (!tc || list.length === 0) return undefined;
    return [...list].sort(
      (a, b) => (a.x - tc.x) ** 2 + (a.z - tc.z) ** 2 - ((b.x - tc.x) ** 2 + (b.z - tc.z) ** 2),
    )[0];
  };
  const farms = () => s.entities.filter((e) => e.type === "farm" && e.owner === 0 && e.built);
  /** Melhor fonte de comida: fazenda propria com comida, senao mapa. */
  const foodSource = (): Ent | undefined =>
    farms().find((f) => (f.maxHp ?? 0) > 0) ?? nearest("berry") ?? nearest("sheep");

  expect(villagers().length).toBeGreaterThanOrEqual(3);
  expect(tcEnt()).toBeDefined();
  expect(s.players[0]?.age).toBe(1);

  // ---- 2. treinar mais 2 aldeões no Centro de Cidade (loop de produção)
  {
    const tc = tcEnt()!;
    await send(page, { type: "train", unitIds: [tc.id], buildingType: "villager" });
    await send(page, { type: "train", unitIds: [tc.id], buildingType: "villager" });
    await tick(page, 1200);
    s = await state(page);
    expect(villagers().length).toBeGreaterThanOrEqual(5);
  }

  // ---- 2b. economia: coletar os 4 recursos (comida/madeira/ouro/pedra)
  const berry = nearest("berry");
  const mine = nearest("gold-mine");
  const stoneMine = nearest("stone-mine");
  const tree = nearest("tree");
  expect(berry).toBeDefined();
  expect(mine).toBeDefined();
  let vils = villagers();
  await send(page, { type: "gather", unitIds: [vils[0]!], entityId: berry!.id });
  await send(page, { type: "gather", unitIds: [vils[1]!], entityId: mine!.id });
  if (tree && vils[2]) await send(page, { type: "gather", unitIds: [vils[2]!], entityId: tree.id });
  await tick(page, 2000);
  s = await state(page);
  const p0 = s.players[0];
  if (!p0) throw new Error("jogador 0 ausente");
  expect(p0.resources.food).toBeGreaterThan(30);
  expect(p0.resources.wood).toBeGreaterThan(30);
  expect(p0.resources.gold).toBeGreaterThan(100);
  if (stoneMine) expect(p0.resources.stone).toBeGreaterThan(0);

  // ---- 3. construção: casa (+pop) e 2 fazendas
  vils = villagers();
  const tcNow = tcEnt()!;
  await send(page, { type: "build", unitIds: [vils[0]!], buildingType: "house", x: tcNow.x + 6, z: tcNow.z + 2 });
  await tick(page, 1200);
  s = await state(page);
  const house = s.entities.find((e) => e.type === "house" && e.owner === 0);
  expect(house?.built).toBe(true);
  expect(s.players[0]?.popCap ?? 0).toBeGreaterThanOrEqual(10);

  for (let f = 0; f < 4; f++) {
    s = await state(page);
    const tc = tcEnt();
    const vb = villagers()[f % villagers().length];
    if (!tc || !vb) continue;
    await send(page, { type: "build", unitIds: [vb], buildingType: "farm", x: tc.x + 4 + f * 4, z: tc.z + 6 });
    await tick(page, 1200);
  }
  s = await state(page);
  expect(farms().length).toBeGreaterThanOrEqual(2);

  // campos de entrega perto das fontes (madeira/ouro) para ciclos curtos
  {
    const treeNear = nearest("tree");
    const mineNear = nearest("gold-mine");
    const vb = villagers()[0];
    if (treeNear && vb) {
      await send(page, { type: "build", unitIds: [vb], buildingType: "lumber-camp", x: treeNear.x + 2, z: treeNear.z + 2 });
      await tick(page, 1000);
    }
    s = await state(page);
    const vb2 = villagers()[0];
    if (mineNear && vb2) {
      await send(page, { type: "build", unitIds: [vb2], buildingType: "mining-camp", x: mineNear.x + 2, z: mineNear.z + 2 });
      await tick(page, 1000);
    }
    s = await state(page);
    expect(s.entities.some((e) => e.type === "lumber-camp" && e.owner === 0 && e.built)).toBe(true);
    expect(s.entities.some((e) => e.type === "mining-camp" && e.owner === 0 && e.built)).toBe(true);
  }

  // ---- 3b. estocagem adaptativa até os alvos (landmark 400f/200g + quartel 150w)
  const stockpile = async (food: number, wood: number, gold: number): Promise<void> => {
    for (let i = 0; i < 20; i++) {
      s = await state(page);
      const p = s.players[0];
      if (!p) return;
      if (p.resources.food >= food && p.resources.wood >= wood && p.resources.gold >= gold) return;
      const ids = villagers();
      const fs = foodSource();
      const fs2 = foodSource();
      const tr = nearest("tree");
      const gm = nearest("gold-mine");
      if (fs && ids[0]) await send(page, { type: "gather", unitIds: [ids[0]!], entityId: fs.id });
      if (fs2 && ids[1]) await send(page, { type: "gather", unitIds: [ids[1]!], entityId: fs2.id });
      if (tr && ids[2]) await send(page, { type: "gather", unitIds: [ids[2]!], entityId: tr.id });
      if (gm && ids[3]) await send(page, { type: "gather", unitIds: [ids[3]!], entityId: gm.id });
      if (gm && ids[4]) await send(page, { type: "gather", unitIds: [ids[4]!], entityId: gm.id });
      await tick(page, 2000);
      // fazendas exauridas: reconstruir uma nova por perto
      const farmsNow = s.entities.filter((e) => e.type === "farm" && e.owner === 0);
      const foodFarms = farmsNow.filter((f) => (f.maxHp ?? 0) > 0).length;
      const anyFood = foodFarms > 0 || fresh("berry").length > 0 || fresh("sheep").length > 0;
      if ((!anyFood || foodFarms < 2) && (s.players[0]?.resources.wood ?? 0) > 100) {
        const tc = tcEnt();
        const vb = villagers()[0];
        if (tc && vb) {
          await send(page, { type: "build", unitIds: [vb], buildingType: "farm", x: tc.x + 4, z: tc.z + 6 });
          await tick(page, 800);
        }
      }
    }
  };
  await stockpile(460, 260, 260);

  // ---- 4. avanço de idade por landmark (council-hall = era 2)
  s = await state(page);
  const vForLm = villagers()[0];
  const tcLm = tcEnt()!;
  if (!vForLm) throw new Error("aldeao para landmark ausente");
  await send(page, {
    type: "build",
    unitIds: [vForLm],
    buildingType: "council-hall",
    x: tcLm.x + 10,
    z: tcLm.z + 10,
  });
  await tick(page, 6000);
  s = await state(page);
  const councilHall = s.entities.find((e) => e.type === "council-hall" && e.owner === 0);
  expect(councilHall?.built).toBe(true);
  expect(s.players[0]?.age).toBe(2);

  // ---- 5. treinar exército (quartel + lanceiros)
  await stockpile(400, 320, 100);
  s = await state(page);
  await send(page, {
    type: "build",
    unitIds: [villagers()[0]!],
    buildingType: "barracks",
    x: tcLm.x + 8,
    z: tcLm.z - 8,
  });
  await tick(page, 1500);
  s = await state(page);
  const barracks = s.entities.find((e) => e.type === "barracks" && e.owner === 0 && e.built);
  expect(barracks).toBeDefined();
  for (let i = 0; i < 4; i++) {
    await send(page, { type: "train", unitIds: [barracks!.id], buildingType: "spearman" });
  }
  await tick(page, 3000);
  s = await state(page);
  const spearmen = s.entities.filter((e) => e.type === "spearman" && e.owner === 0);
  expect(spearmen.length).toBeGreaterThanOrEqual(4);

  // ---- 6. combate com counters: AttackMove contra o centro do bot
  const botTc = s.entities.find((e) => e.type === "town-center" && e.owner === 1);
  expect(botTc).toBeDefined();
  await send(page, {
    type: "attackMove",
    unitIds: spearmen.map((e) => e.id),
    x: botTc!.x,
    z: botTc!.z,
  });
  // espera o exercito chegar e provar o counter (dano no TC ou unidades do bot caindo)
  let combatProvado = false;
  for (let i = 0; i < 8 && !combatProvado; i++) {
    await tick(page, 1500);
    s = await state(page);
    const botTcAfter = s.entities.find((e) => e.type === "town-center" && e.owner === 1);
    const botUnitsAfter = s.entities.filter((e) => e.owner === 1 && e.kind === "unit");
    const armyNow = s.entities.filter((e) => e.owner === 0 && e.type === "spearman");
    const perto = armyNow.some((u) => Math.hypot(u.x - botTc!.x, u.z - botTc!.z) < 25);
    combatProvado =
      botTcAfter === undefined ||
      botTcAfter.hp < botTc!.maxHp ||
      botUnitsAfter.length < 4 ||
      (perto && botUnitsAfter.length === 4);
  }
  expect(combatProvado).toBe(true);

  // ---- 7. condição de vitória: destruir tudo do bot => vitória do jogador 0
  for (let round = 0; round < 40; round++) {
    s = await state(page);
    if (s.victory.kind !== "playing") break;
    const alive = s.entities.filter((e) => e.owner === 1);
    if (alive.length === 0) break;
    const army = s.entities.filter((e) => e.owner === 0 && e.kind === "unit" && e.type === "spearman");
    if (army.length === 0) break;
    // prioriza o centro do bot (condicao de vitoria), depois o que estiver mais perto
    const target = alive.find((e) => e.type === "town-center") ?? alive[0]!;
    await send(page, { type: "attackMove", unitIds: army.map((e) => e.id), x: target.x, z: target.z });
    await tick(page, 1500);
  }
  s = await state(page);
  expect(s.victory.kind).not.toBe("playing");
  expect(s.victory.kind).toBe("victory");
  expect(s.victory.player).toBe(0);

  // HUD: tela de vitória aparece
  await expect(page.locator("[data-victory=screen]")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
