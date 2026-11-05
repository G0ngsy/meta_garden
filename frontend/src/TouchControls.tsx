import { useEffect, type MutableRefObject } from 'react'

export function TouchControls({ keys }: { keys: MutableRefObject<Set<string>> }) {
  useEffect(() => {
    const clear = () => keys.current.clear()
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    return () => { clear(); window.removeEventListener('blur', clear); document.removeEventListener('visibilitychange', clear) }
  }, [keys])
  return <div className="touch-controls" role="group" aria-label="터치 이동. 방향 버튼을 누르는 동안 걸어요">
    {([['KeyW', '앞으로', '↑'], ['KeyA', '왼쪽으로', '←'], ['KeyS', '뒤로', '↓'], ['KeyD', '오른쪽으로', '→']] as const).map(([code, label, arrow]) =>
      <button key={code} className={code} aria-label={label}
        onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); keys.current.add(code) }}
        onPointerUp={() => keys.current.delete(code)} onPointerCancel={() => keys.current.delete(code)} onLostPointerCapture={() => keys.current.delete(code)}
        onKeyDown={event => { if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); keys.current.add(code) } }}
        onKeyUp={() => keys.current.delete(code)} onBlur={() => keys.current.delete(code)}>{arrow}</button>
    )}
  </div>
}
