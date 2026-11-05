import React from 'react'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import './style.css'

function App() {
  return <main>
    <header><span>🌱 META GARDEN</span><h1>느긋한 공동 정원</h1><p>함께 가꾸는 작은 세상, 이곳에서 시작해요.</p></header>
    <section aria-label="3D 정원 개발 환경 미리보기">
      <Canvas shadows camera={{ position: [9, 9, 9], fov: 40 }}>
        <color attach="background" args={['#eaf1e8']} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
        <mesh receiveShadow position={[0, -0.3, 0]}><boxGeometry args={[8, 0.6, 8]} /><meshStandardMaterial color="#a4bf83" /></mesh>
        <mesh receiveShadow position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2, 8]} /><meshStandardMaterial color="#e6d7bb" /></mesh>
        <mesh castShadow position={[0, 0.35, 0]}><cylinderGeometry args={[0.8, 1, 0.6, 8]} /><meshStandardMaterial color="#e2c9aa" flatShading /></mesh>
        <mesh position={[0, 0.66, 0]}><cylinderGeometry args={[0.65, 0.65, 0.04, 8]} /><meshStandardMaterial color="#79bfc4" /></mesh>
        <OrbitControls target={[0, 0, 0]} minDistance={6} maxDistance={20} maxPolarAngle={Math.PI / 2.2} />
      </Canvas>
    </section>
    <footer>개발 환경 준비 완료 · 마우스로 정원을 회전하고 확대해 보세요</footer>
  </main>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
