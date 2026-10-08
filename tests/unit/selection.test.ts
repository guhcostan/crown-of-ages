import { describe, expect, it } from "vitest";
import type { Entity, MapData, MatchConfig, World } from "@sim/types";
import { boxSelect, controlGroupOp, pickAt, type ControlGroupsModel, type Projector } from "@game/selection";

/** Mundo 10x10 tiles de 1 unidade; visibilidade total para o jogador 0. */
const W = 10;
const H = 10;

function unit(id: number, owner: number, type: string, x: number, z: number): Entity {
  return { id, kind: "unit", type, owner, x, z, y: 0, hp: 50, maxHp: 50, facing: 0 };
}

function makeWorld(entities: Entity[]): World {
  const config: MatchConfig = {
    seed: 1,
    civ: "english",
    map: "valley",
    size: "small",
    bots: [],
    victory: "landmarks",
    gameSpeed: 1,
  };
  const map: MapData = {
    w: W,
    h: H,
    tile: 1,
    heights: new Array<number>(W * H).fill(0),
    biome: new Array<number>(W * H).fill(0),
    blocked: new Array<boolean>(W * H).fill(false),
    resourceAt: new Array<number>(W * H).fill(-1),
    resources: [],
    spawns: [],
    maxHeight: 0,
  };
  return {
    tick: 0,
    config,
    map,
    entities,
    players: [],
    rngState: 1,
    nextId: 100,
    visibility: [new Array<number>(W * H).fill(2)],
    victory: { kind: "playing" },
  };
}

/** Projetor linear: 1 unidade de mundo = 10 px de tela; eixo z mapeia para y. */
const projector: Projector = {
  worldToScreen: (x, z) => ({ x: x * 10, y: z * 10 }),
  screenToWorld: (x, y) => ({ x: x / 10, z: y / 10 }),
};

// Três unidades do jogador 0 (dois aldeões e um lanceiro) e uma do jogador 1 (inimiga).
const world = makeWorld([
  unit(1, 0, "villager", 2, 2),
  unit(2, 0, "villager", 2.2, 2.2),
  unit(3, 0, "spearman", 3, 3),
  unit(4, 1, "villager", 5, 5),
]);

describe("pickAt", () => {
  it("acerta uma unidade própria no clique", () => {
    // Tela (30,30) = mundo (3,3): acerta o lanceiro id 3.
    expect(pickAt(world, projector, 30, 30, 0, false, [], false)).toEqual([3]);
  });

  it("não seleciona unidade inimiga", () => {
    expect(pickAt(world, projector, 50, 50, 0, false, [], false)).toEqual([]);
  });

  it("clique em vazio limpa a seleção sem shift", () => {
    expect(pickAt(world, projector, 90, 10, 0, false, [1, 2], false)).toEqual([]);
  });

  it("clique em vazio com shift mantém a seleção atual", () => {
    expect(pickAt(world, projector, 90, 10, 0, true, [1, 2], false)).toEqual([1, 2]);
  });

  it("sem shift substitui a seleção pela unidade clicada", () => {
    expect(pickAt(world, projector, 20, 20, 0, false, [3], false)).toEqual([1]);
  });

  it("com shift adiciona a unidade clicada à seleção", () => {
    expect(pickAt(world, projector, 30, 30, 0, true, [1], false)).toEqual([1, 3]);
  });

  it("com shift alterna: clicar numa unidade já selecionada a remove", () => {
    expect(pickAt(world, projector, 30, 30, 0, true, [1, 3], false)).toEqual([1]);
  });

  it("duplo clique expande para o mesmo tipo (selectSameType)", () => {
    // Clique no aldeão id 1 com duplo clique: seleciona os dois aldeões, não o lanceiro.
    expect(pickAt(world, projector, 20, 20, 0, false, [], true)).toEqual([1, 2]);
  });
});

describe("boxSelect", () => {
  it("pega as três unidades próprias dentro do retângulo, ignorando a inimiga", () => {
    expect(boxSelect(world, projector, 0, 0, 100, 100, 0, false, [])).toEqual([1, 2, 3]);
  });

  it("ignora unidades fora do retângulo", () => {
    expect(boxSelect(world, projector, 0, 0, 25, 25, 0, false, [])).toEqual([1, 2]);
  });

  it("sem shift substitui a seleção atual", () => {
    expect(boxSelect(world, projector, 0, 0, 25, 25, 0, false, [3])).toEqual([1, 2]);
  });

  it("com shift soma à seleção atual sem duplicar", () => {
    expect(boxSelect(world, projector, 0, 0, 100, 100, 0, true, [3, 9])).toEqual([3, 9, 1, 2]);
  });

  it("aceita cantos em ordem invertida", () => {
    expect(boxSelect(world, projector, 100, 100, 0, 0, 0, false, [])).toEqual([1, 2, 3]);
  });

  it("ignora unidades em tiles não visíveis", () => {
    const hidden = makeWorld([unit(1, 0, "villager", 2, 2)]);
    hidden.visibility = [new Array<number>(W * H).fill(0)];
    expect(boxSelect(hidden, projector, 0, 0, 100, 100, 0, false, [])).toEqual([]);
  });
});

describe("controlGroupOp", () => {
  it("ctrl+1 define o grupo 1 com a seleção atual", () => {
    const model: ControlGroupsModel = { groups: new Map<number, number[]>() };
    const result = controlGroupOp(model, 1, true, false, [1, 2]);
    expect(result).toEqual([1, 2]);
    expect(model.groups.get(1)).toEqual([1, 2]);
  });

  it("1 seleciona o grupo 1", () => {
    const model: ControlGroupsModel = { groups: new Map<number, number[]>([[1, [1, 2]]]) };
    expect(controlGroupOp(model, 1, false, false, [3])).toEqual([1, 2]);
  });

  it("1 sem grupo definido retorna seleção vazia", () => {
    const model: ControlGroupsModel = { groups: new Map<number, number[]>() };
    expect(controlGroupOp(model, 5, false, false, [3])).toEqual([]);
  });

  it("shift+1 adiciona o grupo 1 à seleção atual", () => {
    const model: ControlGroupsModel = { groups: new Map<number, number[]>([[1, [1, 2]]]) };
    expect(controlGroupOp(model, 1, false, true, [3])).toEqual([3, 1, 2]);
  });

  it("ctrl não altera grupos de outras teclas", () => {
    const model: ControlGroupsModel = { groups: new Map<number, number[]>([[2, [9]]]) };
    controlGroupOp(model, 1, true, false, [1]);
    expect(model.groups.get(2)).toEqual([9]);
  });
});
