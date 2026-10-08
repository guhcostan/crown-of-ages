import { describe, expect, it } from "vitest";
import { createRng } from "@sim/rng";
import { hashString, stableStringify } from "@sim/serialize";

describe("rng (mulberry32)", () => {
  it("mesma seed produz a mesma sequencia", () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 50 }, () => a.next());
    const seqB = Array.from({ length: 50 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it("seeds diferentes produzem sequencias diferentes", () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toBe(b.next());
  });

  it("next() fica em [0,1)", () => {
    const r = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("int() respeita o intervalo inclusivo", () => {
    const r = createRng(99);
    for (let i = 0; i < 500; i++) {
      const v = r.int(3, 9);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(9);
    }
  });

  it("restore() retoma a sequencia a partir do estado salvo", () => {
    const r = createRng(5);
    r.next();
    r.next();
    const saved = r.state();
    const expected = r.next();
    r.restore(saved);
    expect(r.next()).toBe(expected);
  });

  it("pick() escolhe item da lista", () => {
    const r = createRng(3);
    const items = ["a", "b", "c"] as const;
    for (let i = 0; i < 100; i++) expect(items).toContain(r.pick(items));
  });
});

describe("serialize", () => {
  it("stableStringify ordena chaves recursivamente", () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it("hashString e estavel e distingue entradas", () => {
    expect(hashString("crown")).toBe(hashString("crown"));
    expect(hashString("crown")).not.toBe(hashString("crowm"));
    expect(hashString("")).toMatch(/^[0-9a-f]{16}$/);
  });
});
