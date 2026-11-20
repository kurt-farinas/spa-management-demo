// mulberry32: a tiny seeded generator, so the fake data is the same on every load
export function createRandom(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const int = (rand, min, max) => min + Math.floor(rand() * (max - min + 1))
export const pick = (rand, list) => list[Math.floor(rand() * list.length)]
