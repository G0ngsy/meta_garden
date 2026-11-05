import * as THREE from 'three'
import { random } from './world-layout'

export function woodTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128; canvas.height = 512
  const c = canvas.getContext('2d')!
  c.fillStyle = '#79513b'; c.fillRect(0, 0, 128, 512)
  const rand = random(33)
  for (let i = 0; i < 450; i++) {
    const x = rand() * 128
    c.strokeStyle = rand() > 0.5 ? '#b2896030' : '#321c1838'
    c.lineWidth = rand() * 1.4 + 0.3
    c.beginPath(); c.moveTo(x, 0)
    for (let y = 0; y <= 512; y += 16) c.lineTo(x + Math.sin(y * 0.025 + x) * 1.5, y)
    c.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

export function grassTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const context = canvas.getContext('2d')!, pixels = context.createImageData(128, 128), rand = random(482)
  for (let i = 0; i < pixels.data.length; i += 4) {
    const value = rand() * 24
    pixels.data[i] = 106 + value; pixels.data[i + 1] = 124 + value; pixels.data[i + 2] = 78 + value; pixels.data[i + 3] = 255
  }
  context.putImageData(pixels, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(16, 16)
  return texture
}
