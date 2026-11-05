import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useTexture, Sky } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { PAVILION, POND, BRIDGE, TREES, random } from './world-layout'
import { woodTexture, grassTexture } from './materials'

type V = [number, number, number]
function Piece({ p, s, c, material, r = [0, 0, 0], obstacle = false }: { p: V; s: V; c?: string; material?: THREE.Material; r?: V; obstacle?: boolean }) {
  return <mesh position={p} rotation={r} material={material} castShadow receiveShadow userData={{ cameraObstacle: obstacle }}><boxGeometry args={s}/>{!material && <meshStandardMaterial color={c || '#b2ab98'} roughness={0.9}/>}</mesh>
}
function line(a: V, b: V, radius: number, sides = 8) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b)
  const geometry = new THREE.CylinderGeometry(radius * 0.7, radius, start.distanceTo(end), sides)
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize()))
  geometry.translate(...start.add(end).multiplyScalar(0.5).toArray())
  return geometry
}
function roofPoint(side: number, u: number, t: number, hip = false) {
  const wide = 10.2 - 4.1 * u
  const y = 5.25 + 2.45 * u * u + 0.23 * Math.exp(-u * 14) + Math.pow(Math.abs(t), 6) * (1 - u) * 0.5
  return hip ? new THREE.Vector3(side * wide, y, t * 5.7 * (1 - u)) : new THREE.Vector3(t * wide, y, side * 5.7 * (1 - u))
}
function roofGeometry() {
  const surfaces: THREE.BufferGeometry[] = [], tiles: THREE.BufferGeometry[] = [], ends: THREE.BufferGeometry[] = []
  for (const hip of [false, true]) for (const side of [-1, 1]) {
    const vertices: number[] = []
    for (let y = 0; y < 12; y++) for (let x = 0; x < 36; x++) {
      const a = roofPoint(side, y / 12, x / 18 - 1, hip), b = roofPoint(side, (y + 1) / 12, x / 18 - 1, hip)
      const c = roofPoint(side, (y + 1) / 12, (x + 1) / 18 - 1, hip), d = roofPoint(side, y / 12, (x + 1) / 18 - 1, hip)
      vertices.push(...a, ...b, ...c, ...a, ...c, ...d)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geo.computeVertexNormals(); surfaces.push(geo)
    const count = hip ? 22 : 50
    for (let i = 0; i <= count; i++) {
      const t = i / count * 2 - 1
      const points = Array.from({ length: 13 }, (_, j) => roofPoint(side, j / 12, t, hip).add(new THREE.Vector3(0, 0.07, 0)))
      tiles.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 16, 0.085, 5, false))
      const p = points[0]
      const end = new THREE.SphereGeometry(0.115, 8, 5); end.scale(1, 0.8, 1); end.translate(p.x, p.y, p.z); ends.push(end)
    }
  }
  const result = { surface: mergeGeometries(surfaces), tile: mergeGeometries(tiles), end: mergeGeometries(ends) }
  ;[...surfaces, ...tiles, ...ends].forEach(g => g.dispose())
  return result
}
function Pavilion() {
  const roof = useMemo(roofGeometry, [])
  const timber = useMemo(() => { const map = woodTexture(); return new THREE.MeshStandardMaterial({ map, roughness: 0.85 }) }, [])
  useEffect(() => () => { Object.values(roof).forEach(g => g.dispose()); timber.map?.dispose(); timber.dispose() }, [roof, timber])
  return <group position={[PAVILION.x, 0, PAVILION.z]}>
    <Piece p={[0, 0.35, 0]} s={[16.3, 0.7, 8.7]} c="#aaa595"/>
    <Piece p={[0, 0.78, 0]} s={[15.7, 0.22, 8.2]} material={timber}/>
    {Array.from({ length: 4 }, (_, i) => <Piece key={i} p={[0, 0.1 + i * 0.11, 5.7 - i * 0.5]} s={[4.2, 0.2 + i * 0.22, 0.55]} c={i % 2 ? '#bbb5a3' : '#c5beaa'}/>)}
    {[-7, -2.35, 2.35, 7].flatMap(x => [-3.3, 3.3].map(z => <group key={`${x}-${z}`}>
      <mesh position={[x, 2.95, z]} material={timber} castShadow userData={{ cameraObstacle: true }}><cylinderGeometry args={[0.22, 0.29, 4.2, 16]}/></mesh>
      <mesh position={[x, 0.88, z]}><cylinderGeometry args={[0.44, 0.49, 0.24, 10]}/><meshStandardMaterial color="#b6b0a0"/></mesh>
      <Piece p={[x, 4.74, z]} s={[0.85, 0.3, 0.8]} c="#6c4b36"/>
      <Piece p={[x, 4.94, z]} s={[1.2, 0.2, 0.9]} c="#527462"/>
      <Piece p={[x, 5.08, z]} s={[1.5, 0.1, 1.05]} c="#985e45"/>
    </group>))}
    {[-3.6, 3.6].map(z => <group key={z}>
      <Piece p={[0, 4.6, z]} s={[15.3, 0.35, 0.3]} material={timber}/>
      <Piece p={[0, 4.95, z]} s={[16, 0.3, 0.3]} c="#456a5c"/>
      {Array.from({ length: 40 }, (_, i) => <group key={i}>
        <Piece p={[-7.8 + i * 0.4, 5.12, z]} s={[0.18, 0.12, 0.6]} c={i % 2 ? '#b09a65' : '#8d5140'}/>
        <Piece p={[-7.8 + i * 0.4, 4.9, z + (z > 0 ? 0.17 : -0.17)]} s={[0.11, 0.14, 0.06]} c="#c9b47b"/>
      </group>)}
    </group>)}
    {[-6.9, 6.9].map(x => <Piece key={x} p={[x, 4.7, 0]} s={[0.3, 0.35, 7.6]} material={timber}/>)}
    {[-3.9, 3.9].map(z => <group key={z}>
      {(z < 0 ? [0] : [-4.9, 4.9]).map(x => <Piece key={x} p={[x, 1.58, z]} s={[z < 0 ? 15 : 5.2, 0.14, 0.14]} material={timber}/>)}
      {Array.from({ length: 29 }, (_, i) => -7 + i * 0.5).filter(x => z < 0 || Math.abs(x) > 2).map(x => <Piece key={x} p={[x, 1.27, z]} s={[0.075, 0.62, 0.08]} material={timber}/>)}
    </group>)}
    {[-7.6, 7.6].map(x => <group key={x}><Piece p={[x, 1.58, 0]} s={[0.14, 0.14, 8]} material={timber}/>{Array.from({ length: 17 }, (_, i) => <Piece key={i} p={[x, 1.27, -4 + i * 0.5]} s={[0.08, 0.62, 0.08]} material={timber}/>)}</group>)}
    <mesh geometry={roof.surface} castShadow receiveShadow userData={{ cameraObstacle: true }}><meshStandardMaterial color="#515c60" side={THREE.DoubleSide} roughness={0.85}/></mesh>
    <mesh geometry={roof.tile} castShadow><meshStandardMaterial color="#697476" roughness={0.85}/></mesh>
    <mesh geometry={roof.end}><meshStandardMaterial color="#a2a394"/></mesh>
    <Piece p={[0, 7.78, 0]} s={[12.5, 0.25, 0.24]} c="#8b938b"/>
  </group>
}
type Leaf = { position: V; scale: V; rotation: V; color: string }
function Vegetation() {
  const leafMap = useTexture('/textures/leaves.png')
  const leaves = useRef<THREE.InstancedMesh>(null)
  const data = useMemo(() => {
    const rand = random(78), branches: THREE.BufferGeometry[] = [], foliage: Leaf[] = []
    for (const tree of TREES) {
      const { x, z, scale: s, maple } = tree
      branches.push(line([x, 0, z], [x + 0.6 * s, 5.8 * s, z], 0.43 * s, 12))
      for (let b = 0; b < 8; b++) {
        const a = b * 2.4, y = (3.4 + b * 0.35) * s, reach = (b < 5 ? 3.2 : 2.3) * s
        const cx = x + Math.cos(a) * reach, cz = z + Math.sin(a) * reach
        branches.push(line([x + 0.35 * s, y - 0.7 * s, z], [cx, y + 0.4 * s, cz], 0.13 * s))
        for (let j = 0; j < 75; j++) {
          const theta = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 2.1 * s
          const lx = cx + Math.cos(theta) * r, lz = cz + Math.sin(theta) * r, ly = y + 0.7 * s + (rand() - 0.5) * (maple ? 2.1 : 0.9) * s
          const leafSize = (maple ? 0.28 : 0.38) * s * (0.6 + rand())
          foliage.push({ position: [lx, ly, lz], scale: [leafSize, leafSize * (maple ? 1 : 0.45), leafSize], rotation: [rand() * 2, rand() * 6.28, rand() * 2], color: (maple ? ['#a75c39', '#b76c3b', '#c58b4b', '#905939', '#cf9b54'] : ['#5f754d', '#738253', '#8a955f', '#526b4a', '#9c9e68'])[Math.floor(rand() * 5)] })
        }
      }
    }
    const trunk = mergeGeometries(branches); branches.forEach(g => g.dispose())
    return { trunk, foliage }
  }, [])
  useLayoutEffect(() => {
    const mesh = leaves.current!, object = new THREE.Object3D(), color = new THREE.Color()
    data.foliage.forEach((leaf, i) => { object.position.set(...leaf.position); object.scale.set(...leaf.scale); object.rotation.set(...leaf.rotation); object.updateMatrix(); mesh.setMatrixAt(i, object.matrix); mesh.setColorAt(i, color.set(leaf.color)) })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
    return () => data.trunk.dispose()
  }, [data])
  return <group><mesh geometry={data.trunk} castShadow><meshStandardMaterial color="#69533b" roughness={1}/></mesh><instancedMesh ref={leaves} args={[undefined, undefined, data.foliage.length]} castShadow><planeGeometry args={[3, 3]}/><meshStandardMaterial map={leafMap} alphaTest={0.4} side={THREE.DoubleSide} roughness={1}/></instancedMesh></group>
}
function Bridge() {
  const geometry = useMemo(() => {
    const g: THREE.BufferGeometry[] = []
    const h = (x: number) => 0.04 + 0.95 * (1 - (x / BRIDGE.halfLength) ** 2)
    for (let i = 0; i < 30; i++) {
      const x = -6.8 + (i + 0.5) * 13.6 / 30, geo = new THREE.BoxGeometry(13.6 / 30 + 0.01, 0.28, 2.1)
      geo.translate(x, h(x) - 0.13, 0); g.push(geo)
    }
    for (const z of [-1.1, 1.1]) {
      for (let x = -6.5; x <= 6.5; x += 1.3) {
        const column = new THREE.BoxGeometry(0.18, 0.9, 0.18); column.translate(x, h(x) + 0.42, z); g.push(column)
        const cap = new THREE.SphereGeometry(0.16, 8, 6); cap.translate(x, h(x) + 0.92, z); g.push(cap)
      }
      const points = Array.from({ length: 30 }, (_, i) => { const x = -6.8 + i * 13.6 / 29; return new THREE.Vector3(x, h(x) + 0.73, z) })
      g.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 30, 0.085, 6, false))
    }
    const merged = mergeGeometries(g.map(geo => { if (geo.index) { const nonIndexed = geo.toNonIndexed(); geo.dispose(); return nonIndexed } return geo }))
    g.forEach(geo => geo.dispose()); return merged
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <mesh geometry={geometry} position={[BRIDGE.x, 0, BRIDGE.z]} castShadow receiveShadow userData={{ cameraObstacle: true }}><meshStandardMaterial color="#c6c4b2" roughness={0.85}/></mesh>
}
function Pond() {
  const water = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ time: { value: 0 } }), [])
  useFrame((_, dt) => { if (water.current) water.current.uniforms.time.value += dt })
  const rand = random(94)
  return <group>
    <mesh position={[POND.x, 0.085, POND.z]} rotation={[-Math.PI / 2, 0, 0]} scale={[POND.rx, POND.rz, 1]}><circleGeometry args={[1, 72]}/><shaderMaterial ref={water} uniforms={uniforms} vertexShader="varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }" fragmentShader="varying vec2 vUv; uniform float time; void main(){float w=sin(vUv.x*110.+sin(vUv.y*80.+time*.4)*2.+time*.5);float r=pow(max(0.,w),28.);vec3 c=mix(vec3(.27,.43,.38),vec3(.51,.64,.54),vUv.y);c+=r*.09;gl_FragColor=vec4(c,1.);}"/></mesh>
    {Array.from({ length: 49 }, (_, i) => { const a = i * Math.PI * 2 / 49, z = POND.z + Math.sin(a) * 8.2; if (Math.abs(z - BRIDGE.z) < 1.4) return null; return <mesh key={i} position={[POND.x + Math.cos(a) * 6.2, 0.1, z]} scale={[0.6 + rand() * 0.65, 0.35 + rand() * 0.4, 0.5 + rand() * 0.5]} rotation={[rand(), rand() * 3, 0]} castShadow receiveShadow><dodecahedronGeometry args={[1, 1]}/><meshStandardMaterial color={i % 2 ? '#8c9481' : '#a9ac95'} roughness={1}/></mesh> })}
    {Array.from({ length: 14 }, (_, i) => { const x = POND.x + (rand() - 0.5) * 8, z = POND.z + rand() * 6; return <group key={i}><mesh position={[x, 0.1, z]} rotation={[-Math.PI / 2, 0, i]}><circleGeometry args={[0.3, 12, 0, Math.PI * 1.8]}/><meshStandardMaterial color="#879e67" side={THREE.DoubleSide}/></mesh>{i % 3 === 0 && <mesh position={[x, 0.22, z]} scale={[1, 0.5, 1]}><sphereGeometry args={[0.16, 8, 6]}/><meshStandardMaterial color="#dfb8a6"/></mesh>}</group> })}
    <Bridge/>
  </group>
}
function Surroundings() {
  const rand = random(22)
  return <group>
    {[-26, 28].map(x => <group key={x}><Piece p={[x, 0.7, -1]} s={[0.65, 1.4, 54]} c="#aaa791"/><Piece p={[x, 1.48, -1]} s={[0.95, 0.18, 54]} c="#65706b"/></group>)}
    <Piece p={[0, 0.7, -27]} s={[54, 1.4, 0.65]} c="#aaa791"/><Piece p={[0, 1.48, -27]} s={[54, 0.18, 0.95]} c="#65706b"/>
    {Array.from({ length: 17 }, (_, i) => <mesh key={i} position={[-85 + i * 11, 2, -65 - rand() * 30]} scale={[16 + rand() * 10, 12 + rand() * 13, 14]}><icosahedronGeometry args={[1, 1]}/><meshStandardMaterial color={i % 2 ? '#849a85' : '#9cab94'} roughness={1}/></mesh>)}
    {Array.from({ length: 28 }, (_, i) => { const x = -22 + rand() * 7, z = -12 + rand() * 18, height = 5 + rand() * 3; return <group key={i}><mesh position={[x, height / 2, z]} castShadow><cylinderGeometry args={[0.055, 0.085, height, 6]}/><meshStandardMaterial color="#7d8c59"/></mesh>{[0.6, 0.8, 0.95].map((h, n) => <group key={h}><Piece p={[x + 0.3, height * h, z]} s={[0.9, 0.05, 0.15]} c="#819759" r={[0, i, 0.2 + n * 0.15]}/><Piece p={[x - 0.35, height * h + 0.2, z]} s={[0.8, 0.05, 0.16]} c="#99aa71" r={[0, -i, -0.4]}/></group>)}</group> })}
    {Array.from({ length: 65 }, (_, i) => { const x = -16 + rand() * 37, z = -18 + rand() * 31; if (x > -10 && x < 4 && z > -13) return null; if (((x - POND.x) / 7.1) ** 2 + ((z - POND.z) / 9.1) ** 2 < 1) return null; return <group key={i} position={[x, 0, z]}><mesh position={[0, 0.2, 0]} scale={[0.7 + rand(), 0.5, 0.8]} castShadow><dodecahedronGeometry args={[0.5, 0]}/><meshStandardMaterial color="#8d9973"/></mesh>{[0, 1, 2].map(j => <mesh key={j} position={[(j - 1) * 0.2, 0.45, Math.sin(j) * 0.25]} scale={[1, 0.4, 1]}><icosahedronGeometry args={[0.12, 1]}/><meshStandardMaterial color={i % 2 ? '#d8bb9b' : '#d4c9b1'}/></mesh>)}</group> })}
  </group>
}
export function World({ onReady }: { onReady: () => void }) {
  const stone = useTexture('/textures/courtyard-stone.png')
  const grass = useMemo(grassTexture, [])
  useEffect(() => () => grass.dispose(), [grass])
  useLayoutEffect(() => { stone.wrapS = stone.wrapT = THREE.RepeatWrapping; stone.repeat.set(9, 9); stone.colorSpace = THREE.SRGBColorSpace; stone.anisotropy = 8; stone.needsUpdate = true }, [stone])
  useEffect(onReady, [onReady])
  return <>
    <Sky distance={1000} sunPosition={[-30, 35, 20]} inclination={0.5} turbidity={6} rayleigh={0.7}/>
    <fog attach="fog" args={['#c4cbb7', 38, 130]}/>
    <hemisphereLight args={['#f5e7c9', '#657158', 1.65]}/>
    <directionalLight position={[-18, 28, 15]} color="#fff1d4" intensity={2.5} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-camera-near={1} shadow-camera-far={85} shadow-normalBias={0.04} shadow-bias={-0.0001}/>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow><planeGeometry args={[180, 180]}/><meshStandardMaterial color="#859571" roughness={1}/></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[54, 54]}/><meshStandardMaterial map={stone} roughness={0.95} color="#eeeade"/></mesh>
    {[{ x: -19, z: 1, rx: 9, rz: 25 }, { x: 23, z: 0, rx: 10, rz: 25 }].map(patch => <mesh key={patch.x} position={[patch.x, 0.018, patch.z]} rotation={[-Math.PI / 2, 0, 0]} scale={[patch.rx, patch.rz, 1]} receiveShadow><circleGeometry args={[1, 48]}/><meshStandardMaterial map={grass} roughness={1}/></mesh>)}
    <Pavilion/><Pond/><Vegetation/><Surroundings/>
  </>
}
