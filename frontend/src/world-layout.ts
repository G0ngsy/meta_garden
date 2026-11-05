export const PAVILION = { x: -4, z: -9 }
export const POND = { x: 11, z: -1, rx: 6, rz: 8 }
export const BRIDGE = { x: 11, z: -4, halfLength: 6.8, halfWidth: 1.05 }
export const TREES = [
  { x: -13, z: 6, scale: 1.25, maple: false },
  { x: -17, z: -5, scale: 1.05, maple: false },
  { x: -15, z: -17, scale: 1.1, maple: true },
  { x: 7, z: -16, scale: 1.3, maple: false },
  { x: 18, z: 5, scale: 1.3, maple: true },
  { x: 20, z: -11, scale: 1.1, maple: true },
  { x: -3, z: -23, scale: 1.2, maple: false },
  { x: -22, z: 14, scale: 1, maple: true },
  { x: 24, z: 16, scale: 1.1, maple: false },
  { x: 15, z: -24, scale: 1.1, maple: true },
]
export function blocked(x: number, z: number) {
  if (x < -23 || x > 25 || z < -25 || z > 24) return true
  const pond = ((x - POND.x) / (POND.rx + 0.35)) ** 2 + ((z - POND.z) / (POND.rz + 0.35)) ** 2 < 1
  const onBridge = Math.abs(z - BRIDGE.z) < BRIDGE.halfWidth - 0.32 && Math.abs(x - BRIDGE.x) < BRIDGE.halfLength + 0.35
  if (pond && !onBridge) return true
  if (TREES.some(t => Math.hypot(x - t.x, z - t.z) < 0.65 * t.scale + 0.3)) return true
  const lx = x - PAVILION.x, lz = z - PAVILION.z
  if ([-7, -2.35, 2.35, 7].some(px => [-3.3, 3.3].some(pz => Math.hypot(lx - px, lz - pz) < 0.58))) return true
  // Railings leave the central staircase open.
  if (Math.abs(lx) > 2 && Math.abs(lx) < 7.6 && Math.abs(lz - 3.8) < 0.4) return true
  if (Math.abs(lx) < 7.8 && Math.abs(lz + 3.8) < 0.4) return true
  return Math.abs(Math.abs(lx) - 7.6) < 0.4 && Math.abs(lz) < 4.1
}
export function groundHeight(x: number, z: number) {
  if (Math.abs(z - BRIDGE.z) < BRIDGE.halfWidth && Math.abs(x - BRIDGE.x) < BRIDGE.halfLength) {
    const t = (x - BRIDGE.x) / BRIDGE.halfLength
    return 0.06 + 0.95 * (1 - t * t)
  }
  const lx = x - PAVILION.x, lz = z - PAVILION.z
  if (Math.abs(lx) < 7.8 && Math.abs(lz) < 4) return 0.88
  if (Math.abs(lx) < 2 && lz >= 4 && lz < 6.1) return Math.max(0.06, (6.1 - lz) / 2.1 * 0.88)
  return 0.06
}

export function random(seed: number) {
  let n = seed >>> 0
  return () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296 }
}
