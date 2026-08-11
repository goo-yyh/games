export type RandomSource = {
  next(): number;
  int(min: number, maxInclusive: number): number;
  pick<T>(items: readonly T[]): T;
};

export function createRandom(seed?: number): RandomSource {
  let state = seed ?? cryptoSeed();
  const next = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(min, maxInclusive) { return Math.floor(next() * (maxInclusive - min + 1)) + min; },
    pick<T>(items: readonly T[]) { return items[Math.floor(next() * items.length)]; },
  };
}

function cryptoSeed() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0];
  }
  return Date.now() >>> 0;
}
