/**
 * serialize.ts — serialização estável (chaves ordenadas) e hash FNV-1a 64 bits.
 *
 * Usado nos testes de determinismo: mesma entrada ⇒ mesma string ⇒ mesmo hash,
 * em Node e no browser. Não usa node:crypto (precisa rodar no navegador).
 */



/**
 * JSON estável: objetos com chaves ordenadas, recursivamente. Arrays mantêm a ordem.
 * Valores `undefined` em objetos são omitidos (como JSON.stringify).
 */
export function stableStringify(v: unknown): string {
  if (v === null) return "null";
  const t = typeof v;
  if (t === "number") {
    // NaN/Infinity viram null, como em JSON.
    return Number.isFinite(v as number) ? JSON.stringify(v) : "null";
  }
  if (t === "boolean") return v ? "true" : "false";
  if (t === "string") return JSON.stringify(v);
  if (t === "undefined" || t === "function" || t === "symbol") return "null";
  if (Array.isArray(v)) {
    const parts: string[] = [];
    for (const item of v) {
      // undefined dentro de array vira null (como JSON).
      parts.push(item === undefined ? "null" : stableStringify(item));
    }
    return "[" + parts.join(",") + "]";
  }
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts: string[] = [];
  for (const key of keys) {
    const val = obj[key];
    if (val === undefined || typeof val === "function" || typeof val === "symbol") continue;
    parts.push(JSON.stringify(key) + ":" + stableStringify(val));
  }
  return "{" + parts.join(",") + "}";
}

// Constantes FNV-1a 64 bits como pares (alto, baixo) de 32 bits.
const FNV_OFFSET_HI = 0xcbf29ce4;
const FNV_OFFSET_LO = 0x84222325;
const FNV_PRIME_HI = 0x00000100;
const FNV_PRIME_LO = 0x000001b3;

/**
 * Multiplica (hi,lo) de 64 bits por (ph,pl) módulo 2^64 e devolve [hi, lo] uint32.
 * Sem Math e sem BigInt: produto 32x32 completo via divisão em 16 bits.
 */
function mul64(hi: number, lo: number, ph: number, pl: number): [number, number] {
  const al = lo & 0xffff;
  const ah = lo >>> 16;
  const bl = pl & 0xffff;
  const bh = pl >>> 16;

  const p00 = al * bl;
  const p01 = al * bh;
  const p10 = ah * bl;
  const p11 = ah * bh;

  // Soma das partes do meio (cada termo < 2^32, cabe com folga em double).
  const mid = (p00 >>> 16) + (p01 & 0xffff) + (p10 & 0xffff);
  const low = ((mid & 0xffff) * 65536 + (p00 & 0xffff)) >>> 0;
  const carryHigh = p11 + (p01 >>> 16) + (p10 >>> 16) + (mid >>> 16);

  // Parte alta: produto completo de lo*pl + apenas os 32 bits baixos dos produtos cruzados.
  const high = (carryHigh + Math.imul(hi, pl) + Math.imul(lo, ph)) >>> 0;
  return [high, low];
}

/**
 * Hash FNV-1a 64 bits de uma string (UTF-16 code units), em hex de 16 caracteres.
 * Implementação em TS puro (pares de 32 bits), idêntica em Node e no browser.
 */
export function hashString(s: string): string {
  let hi = FNV_OFFSET_HI;
  let lo = FNV_OFFSET_LO;
  for (let i = 0; i < s.length; i++) {
    lo = (lo ^ s.charCodeAt(i)) >>> 0;
    const [nh, nl] = mul64(hi, lo, FNV_PRIME_HI, FNV_PRIME_LO);
    hi = nh;
    lo = nl;
  }
  return hi.toString(16).padStart(8, "0") + lo.toString(16).padStart(8, "0");
}
