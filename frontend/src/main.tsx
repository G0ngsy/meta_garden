import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { World } from './World'
import { Player } from './Player'
import { PwaPanel } from './PwaPanel'
import { TouchControls } from './TouchControls'
import './style.css'

class SceneBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <div className="scene-error" role="alert"><strong>정원을 열지 못했어요</strong><p>연결 상태와 브라우저의 3D 지원을 확인한 뒤 다시 시도해주세요.</p><button onClick={() => location.reload()}>다시 열기</button></div>
    return this.props.children
  }
}
function App() {
  const [third, setThird] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [guide, setGuide] = useState(false)
  const guideButton = useRef<HTMLButtonElement>(null)
  const touch = useRef(new Set<string>())
  const onReady = useCallback(() => setLoaded(true), [])
  const [identity] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('garden-visitor-v1') || 'null')
      if (saved && typeof saved.name === 'string' && saved.name.length < 30 && /^#[0-9a-f]{6}$/i.test(saved.color)) return saved as { name: string; color: string }
    } catch { /* Storage can be unavailable. Walking still works. */ }
    return { name: ['느긋한', '산책하는', '다정한'][Math.floor(Math.random() * 3)] + ' ' + ['솔잎', '달빛', '새싹'][Math.floor(Math.random() * 3)], color: ['#9cae91', '#b89491', '#87a49b'][Math.floor(Math.random() * 3)] }
  })
  useEffect(() => { try { localStorage.setItem('garden-visitor-v1', JSON.stringify(identity)) } catch { /* Optional persistence. */ } }, [identity])
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.code === 'KeyC' && !event.repeat) setThird(v => !v)
      if (event.code === 'Escape') { setGuide(false); guideButton.current?.focus() }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  return <main className="experience" aria-label="느긋한 정원">
    <section className="garden" aria-label="전통 정원 산책. WASD 또는 방향 버튼으로 이동하고 화면을 드래그해 둘러보세요.">
      <SceneBoundary>
        <Canvas shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [-1, 3.1, 16.6], fov: 50, near: 0.08, far: 220 }} dpr={[1, 1.5]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
          fallback={<div className="scene-error">이 브라우저에서 3D 화면을 열 수 없어요. WebGL 지원 브라우저에서 다시 열어주세요.</div>}>
          <color attach="background" args={['#c4cbb7']}/>
          <Suspense fallback={null}><World onReady={onReady}/><Player third={third} name={identity.name} color={identity.color} touch={touch}/></Suspense>
        </Canvas>
      </SceneBoundary>
      {!loaded && <div className="loading-note" role="status">정원으로 이어지는 길을 준비하고 있어요…</div>}
      <TouchControls keys={touch}/>
    </section>
    <header className="world-header">
      <h1><span aria-hidden="true">❧</span> 느긋한 정원</h1>
      <div className="visitor"><i style={{ background: identity.color }}/><span>{identity.name}</span><small>혼자 산책 중</small></div>
    </header>
    <PwaPanel/>
    <section className="world-caption" aria-label="장소"><span>바람이 머무는 곳</span><strong>소담원</strong></section>
    <nav className="actionbar" aria-label="산책 조작">
      <span className="keyboard-hint">이동 <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span>
      <span className="keyboard-hint separator">둘러보기 <b>마우스 드래그</b></span>
      <button className="camera" onClick={() => setThird(v => !v)} aria-label="카메라 시점 전환">{third ? '3인칭' : '쿼터뷰'} <kbd>C</kbd></button>
      <button ref={guideButton} className="guide-button" aria-expanded={guide} aria-controls="walk-guide" onClick={() => setGuide(v => !v)}>조작 안내</button>
    </nav>
    <span className="touch-hint">화면을 드래그해 둘러보세요</span>
    {guide && <section className="walk-guide" id="walk-guide" aria-label="산책 방법">
      <span className="eyebrow">천천히 둘러보세요</span><h2>정원에서 걷는 방법</h2>
      <p>PC에서는 WASD·방향키로 이동하고, 마우스를 누른 채 움직이면 주변을 둘러볼 수 있어요. 휠로 거리를 조절해보세요.</p>
      <p>휴대폰에서는 왼쪽 방향 버튼을 꾹 눌러 걷고, 정원 화면을 드래그해 둘러보세요.</p>
      <p>C 키나 시점 버튼으로 넓게 내려다보는 쿼터뷰로 전환할 수 있어요. 연못은 돌다리로 건너세요.</p>
      <button className="soft-button" onClick={() => { setGuide(false); guideButton.current?.focus() }}>알겠어요</button>
    </section>}
  </main>
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
