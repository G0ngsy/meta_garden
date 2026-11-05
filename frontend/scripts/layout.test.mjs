import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/world-layout.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { blocked, groundHeight, POND, BRIDGE, PAVILION, TREES } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))

test('entrance and central stairs are traversable while pillars and garden limits block movement', () => {
  assert.equal(blocked(-1, 10), false)
  for (let z = PAVILION.z + 6; z > PAVILION.z; z -= 0.1) assert.equal(blocked(PAVILION.x, z), false)
  assert.equal(blocked(PAVILION.x + 7, PAVILION.z + 3.3), true)
  assert.equal(blocked(-24, 0), true)
  assert.equal(blocked(TREES[0].x, TREES[0].z), true)
})
test('pond can only be crossed along the bridge with a continuous curved deck', () => {
  assert.equal(blocked(POND.x, POND.z), true)
  for (let x = BRIDGE.x - 6.8; x <= BRIDGE.x + 6.8; x += 0.05) assert.equal(blocked(x, BRIDGE.z), false)
  assert.equal(blocked(BRIDGE.x, BRIDGE.z + 1), true)
  assert.ok(groundHeight(BRIDGE.x, BRIDGE.z) > groundHeight(BRIDGE.x + 6, BRIDGE.z))
  let previous = groundHeight(BRIDGE.x - 6.8, BRIDGE.z)
  for (let x = BRIDGE.x - 6.8; x <= BRIDGE.x + 6.8; x += 0.05) {
    const height = groundHeight(x, BRIDGE.z)
    assert.ok(Math.abs(height - previous) < 0.03)
    previous = height
  }
})
