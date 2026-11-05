import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { blocked, groundHeight } from './world-layout'

function skirtGeometry() {
  const positions: number[] = [], indices: number[] = []
  for (let ring = 0; ring <= 6; ring++) for (let i = 0; i <= 72; i++) {
    const t = ring / 6, a = i * Math.PI / 36, r = 0.2 + 0.17 * t * t + Math.cos(a * 18) * 0.009 * t
    positions.push(Math.sin(a) * r, 1.1 - t * 0.7, Math.cos(a) * r)
    if (ring < 6 && i < 72) { const n = ring * 73 + i; indices.push(n, n + 73, n + 1, n + 1, n + 73, n + 74) }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals()
  return geometry
}

export function Player({ third, name, color, touch }: { third: boolean; name: string; color: string; touch: MutableRefObject<Set<string>> }) {
  const root = useRef<THREE.Group>(null), body = useRef<THREE.Group>(null)
  const leftLeg = useRef<THREE.Group>(null), rightLeg = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null), rightArm = useRef<THREE.Group>(null)
  const label = useRef<HTMLSpanElement>(null)
  const keys = useRef(new Set<string>())
  const position = useRef(new THREE.Vector3(-1, 0.06, 10))
  const heading = useRef(Math.PI), walk = useRef(0), ready = useRef(false)
  const orbit = useRef({ yaw: 0, pitch: 0.22, distance: 6.6 })
  const desired = useRef(new THREE.Vector3()), target = useRef(new THREE.Vector3()), direction = useRef(new THREE.Vector3())
  const ray = useRef(new THREE.Raycaster()), obstacles = useRef<THREE.Object3D[]>([])
  const { gl } = useThree()
  const skirt = useMemo(skirtGeometry, [])
  useEffect(() => () => skirt.dispose(), [skirt])
  useEffect(() => {
    const canvas = gl.domElement
    const down = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, [contenteditable="true"]')) return
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) { event.preventDefault(); keys.current.add(event.code) }
    }
    const up = (event: KeyboardEvent) => keys.current.delete(event.code)
    let drag: { id: number; x: number; y: number } | null = null
    const clear = () => { keys.current.clear(); touch.current.clear(); drag = null }
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY }
      canvas.setPointerCapture(event.pointerId)
    }
    const pointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return
      orbit.current.yaw -= (event.clientX - drag.x) * 0.006
      orbit.current.pitch = THREE.MathUtils.clamp(orbit.current.pitch + (event.clientY - drag.y) * 0.004, -0.08, 0.65)
      drag.x = event.clientX; drag.y = event.clientY
    }
    const pointerEnd = () => { drag = null }
    const zoom = (event: WheelEvent) => { event.preventDefault(); orbit.current.distance = THREE.MathUtils.clamp(orbit.current.distance + event.deltaY * 0.006, 4, 10) }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointermove', pointerMove)
    canvas.addEventListener('pointerup', pointerEnd); canvas.addEventListener('pointercancel', pointerEnd); canvas.addEventListener('lostpointercapture', pointerEnd)
    canvas.addEventListener('wheel', zoom, { passive: false })
    return () => {
      clear(); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', clear)
      canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove)
      canvas.removeEventListener('pointerup', pointerEnd); canvas.removeEventListener('pointercancel', pointerEnd); canvas.removeEventListener('lostpointercapture', pointerEnd)
      canvas.removeEventListener('wheel', zoom)
    }
  }, [gl, touch])
  useFrame(({ camera, scene }, frameDt) => {
    const dt = Math.min(frameDt, 0.05), k = keys.current, t = touch.current, p = position.current
    const right = Number(k.has('KeyD') || k.has('ArrowRight') || t.has('KeyD')) - Number(k.has('KeyA') || k.has('ArrowLeft') || t.has('KeyA'))
    const forward = Number(k.has('KeyW') || k.has('ArrowUp') || t.has('KeyW')) - Number(k.has('KeyS') || k.has('ArrowDown') || t.has('KeyS'))
    const yaw = third ? orbit.current.yaw : -Math.PI / 4
    const dx = right * Math.cos(yaw) + forward * Math.sin(yaw), dz = right * Math.sin(yaw) - forward * Math.cos(yaw)
    const length = Math.hypot(dx, dz)
    let moving = false
    if (length) {
      const step = 3.4 * dt / length, x = p.x, z = p.z
      if (!blocked(p.x + dx * step, p.z)) p.x += dx * step
      if (!blocked(p.x, p.z + dz * step)) p.z += dz * step
      moving = Math.hypot(p.x - x, p.z - z) > 0.0001
      const next = Math.atan2(dx, dz)
      heading.current += Math.atan2(Math.sin(next - heading.current), Math.cos(next - heading.current)) * (1 - Math.exp(-dt * 14))
    }
    p.y = groundHeight(p.x, p.z)
    root.current?.position.copy(p)
    if (moving) walk.current += dt * 9
    const swing = moving ? Math.sin(walk.current) * 0.45 : 0
    if (leftLeg.current) leftLeg.current.rotation.x = swing
    if (rightLeg.current) rightLeg.current.rotation.x = -swing
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.7
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.7
    if (body.current) { body.current.rotation.y = heading.current; body.current.position.y = moving ? Math.abs(Math.sin(walk.current)) * 0.025 : 0 }
    if (label.current) { label.current.dataset.x = p.x.toFixed(4); label.current.dataset.z = p.z.toFixed(4); label.current.dataset.yaw = orbit.current.yaw.toFixed(4) }
    target.current.set(p.x, p.y + (third ? 2.4 : 1.6), p.z)
    if (third) {
      const { pitch, distance } = orbit.current
      desired.current.set(p.x - Math.sin(yaw) * distance, p.y + 1.6 + Math.sin(pitch) * distance, p.z + Math.cos(yaw) * distance)
    } else desired.current.set(p.x + 12, p.y + 16, p.z + 13)
    if (!obstacles.current.length) scene.traverse(object => { if (object.userData.cameraObstacle) obstacles.current.push(object) })
    const hitAt = (point: THREE.Vector3) => {
      direction.current.subVectors(point, target.current)
      ray.current.set(target.current, direction.current.clone().normalize())
      ray.current.far = direction.current.length()
      return ray.current.intersectObjects(obstacles.current, false).find(hit => hit.distance > 0.4)
    }
    if (third && hitAt(desired.current)) {
      desired.current.y += 2.8
      const hit = hitAt(desired.current)
      if (hit) desired.current.copy(target.current).addScaledVector(direction.current.normalize(), Math.max(1.4, hit.distance - 0.3))
    }
    if (!ready.current) { camera.position.copy(desired.current); ready.current = true }
    else camera.position.lerp(desired.current, 1 - Math.exp(-frameDt * 8))
    if (third && hitAt(camera.position)) camera.position.copy(desired.current)
    camera.lookAt(target.current)
  })
  return <group ref={root} position={[-1, 0.06, 10]}>
    <Html position={[0, 2.05, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}><span ref={label} className="nameplate" data-x="-1" data-z="10">🌱 {name}</span></Html>
    <group ref={body} rotation={[0, Math.PI, 0]}>
      {[{ ref: leftLeg, x: -0.13 }, { ref: rightLeg, x: 0.13 }].map(({ ref, x }) => <group ref={ref} key={x} position={[x, 0.53, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow><capsuleGeometry args={[0.09, 0.28, 4, 10]}/><meshStandardMaterial color="#e3dfcc"/></mesh>
        <mesh position={[0, -0.43, 0.05]} scale={[0.1, 0.065, 0.17]} castShadow><sphereGeometry args={[1, 12, 8]}/><meshStandardMaterial color="#655e4b"/></mesh>
      </group>)}
      <mesh geometry={skirt} castShadow><meshStandardMaterial color={color} roughness={0.95} side={THREE.DoubleSide}/></mesh>
      <mesh position={[0, 1.11, 0]} scale={[0.28, 0.27, 0.19]} castShadow><sphereGeometry args={[1, 16, 12]}/><meshStandardMaterial color="#ece7d5"/></mesh>
      <mesh position={[0.035, 1.12, 0.19]} rotation={[0, 0, -0.55]}><boxGeometry args={[0.045, 0.33, 0.025]}/><meshStandardMaterial color="#cfbfa0"/></mesh>
      <mesh position={[-0.06, 0.98, 0.21]} rotation={[0, 0, -0.15]}><boxGeometry args={[0.05, 0.22, 0.025]}/><meshStandardMaterial color="#f4e9cf"/></mesh>
      {[{ ref: leftArm, x: -0.29, sign: -1 }, { ref: rightArm, x: 0.29, sign: 1 }].map(({ ref, x, sign }) => <group ref={ref} key={x} position={[x, 1.2, 0]}>
        <mesh position={[sign * 0.06, -0.2, 0]} rotation={[0, 0, sign * 0.15]} castShadow><capsuleGeometry args={[0.115, 0.27, 4, 12]}/><meshStandardMaterial color="#ece7d5"/></mesh>
        <mesh position={[sign * 0.09, -0.4, 0]}><sphereGeometry args={[0.09, 12, 8]}/><meshStandardMaterial color="#e5c9a7"/></mesh>
      </group>)}
      <mesh position={[0, 1.57, 0]} scale={[0.3, 0.32, 0.28]} castShadow><sphereGeometry args={[1, 24, 18]}/><meshStandardMaterial color="#e7ccad" roughness={0.8}/></mesh>
      <mesh position={[0, 1.65, -0.075]} scale={[0.315, 0.31, 0.27]} castShadow><sphereGeometry args={[1, 24, 18]}/><meshStandardMaterial color="#69533e" roughness={0.95}/></mesh>
      <mesh position={[0, 1.46, -0.3]} scale={[0.15, 0.15, 0.12]} castShadow><sphereGeometry args={[1, 16, 10]}/><meshStandardMaterial color="#69533e"/></mesh>
      <mesh position={[0, 1.48, -0.39]}><torusGeometry args={[0.075, 0.025, 6, 14]}/><meshStandardMaterial color="#ded3b8"/></mesh>
      {[-1, 1].map(sign => <group key={sign}><mesh position={[sign * 0.105, 1.57, 0.263]}><sphereGeometry args={[0.026, 10, 8]}/><meshStandardMaterial color="#3e3d32"/></mesh><mesh position={[sign * 0.19, 1.49, 0.23]} scale={[1, 0.5, 0.25]}><sphereGeometry args={[0.045, 10, 6]}/><meshStandardMaterial color="#d9ab91"/></mesh></group>)}
    </group>
  </group>
}
