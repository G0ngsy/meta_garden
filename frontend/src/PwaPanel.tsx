import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

type Snapshot = { ready: boolean; failed: boolean; update: boolean }
let snapshot: Snapshot = { ready: false, failed: false, update: false }
const listeners = new Set<() => void>()
const subscribe = (notify: () => void) => { listeners.add(notify); return () => { listeners.delete(notify) } }
const publish = (next: Partial<Snapshot>) => { snapshot = { ...snapshot, ...next }; listeners.forEach(fn => fn()) }
let registration: ServiceWorkerRegistration | undefined
let started = false

function checkReady(worker?: ServiceWorker | null) {
  if (!worker) return
  const channel = new MessageChannel()
  const timer = window.setTimeout(() => { channel.port1.close(); publish({ ready: false, failed: true }) }, 8000)
  channel.port1.onmessage = event => {
    window.clearTimeout(timer)
    channel.port1.close()
    publish({ ready: event.data.ready === true, failed: event.data.ready !== true })
  }
  worker.postMessage('CHECK_READY', [channel.port2])
}
function startOffline() {
  if (started || !import.meta.env.PROD || !('serviceWorker' in navigator) || !window.isSecureContext) return
  started = true
  checkReady(navigator.serviceWorker.controller)
  let previouslyControlled = Boolean(navigator.serviceWorker.controller)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (previouslyControlled) window.location.reload()
    else { previouslyControlled = true; checkReady(navigator.serviceWorker.controller) }
  })
  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(reg => {
    registration = reg
    checkReady(reg.active)
    publish({ update: Boolean(reg.waiting) })
    const watch = () => {
      const worker = reg.installing
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && reg.active) publish({ update: true })
        if (worker.state === 'activated') checkReady(worker)
        if (worker.state === 'redundant' && !snapshot.ready) publish({ failed: true })
      })
    }
    watch()
    reg.addEventListener('updatefound', watch)
    const refresh = () => {
      checkReady(reg.active)
      if (navigator.onLine) void reg.update().catch(() => { /* Cached walks still work when the host is down. */ })
    }
    window.addEventListener('online', refresh)
    window.addEventListener('focus', refresh)
  }).catch(() => { if (!snapshot.ready) publish({ failed: true }) })
}

interface InstallEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaPanel() {
  const state = useSyncExternalStore(subscribe, () => snapshot)
  const [online, setOnline] = useState(navigator.onLine)
  const [installed, setInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null)
  const [help, setHelp] = useState(false)
  const [notice, setNotice] = useState('')
  const [updating, setUpdating] = useState(false)
  const helpButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    startOffline()
    const connection = () => setOnline(navigator.onLine)
    const prompt = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallEvent) }
    const complete = () => { setInstalled(true); setInstallEvent(null); setHelp(false); setNotice('설치했어요. 홈 화면에서 정원을 열어보세요.') }
    const display = window.matchMedia('(display-mode: standalone)')
    const displayChanged = () => setInstalled(display.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
    window.addEventListener('online', connection); window.addEventListener('offline', connection)
    window.addEventListener('beforeinstallprompt', prompt); window.addEventListener('appinstalled', complete)
    display.addEventListener('change', displayChanged)
    return () => {
      window.removeEventListener('online', connection); window.removeEventListener('offline', connection)
      window.removeEventListener('beforeinstallprompt', prompt); window.removeEventListener('appinstalled', complete)
      display.removeEventListener('change', displayChanged)
    }
  }, [])
  const install = async () => {
    if (!installEvent) { setHelp(v => !v); return }
    try {
      await installEvent.prompt()
      const choice = await installEvent.userChoice
      setNotice(choice.outcome === 'accepted' ? '설치 요청을 보냈어요. 브라우저 안내를 확인해주세요.' : '괜찮아요. 브라우저에서도 계속 산책할 수 있어요.')
    } catch { setNotice('설치 창을 열지 못했어요. 브라우저 메뉴에서 설치를 확인해주세요.') }
    setInstallEvent(null)
  }
  const update = () => {
    if (!registration?.waiting) { setNotice('업데이트를 다시 확인하려면 정원을 다시 열어주세요.'); return }
    setUpdating(true)
    registration.waiting.postMessage('SKIP_WAITING')
    window.setTimeout(() => { setUpdating(false) }, 10000)
  }
  const available = import.meta.env.PROD && 'serviceWorker' in navigator && window.isSecureContext
  const status = state.ready ? (online ? '오프라인 산책 준비 완료' : '오프라인 산책 중') : !available ? '현재 환경에서는 오프라인 저장을 지원하지 않아요' : state.failed ? '오프라인 저장을 완료하지 못했어요' : !online ? '연결 후 오프라인 준비를 마쳐주세요' : '오프라인 산책을 준비하고 있어요…'
  return <aside className="pwa-panel" aria-label="설치 및 오프라인 산책">
    <div className="pwa-summary"><img src="/icons/garden-192.png" width="44" height="44" alt=""/><div><strong role="status">{status}</strong><p>지금은 혼자 산책하는 정원이에요. {state.ready ? '저장 공간을 지우면 다시 준비해야 해요.' : '첫 준비에는 인터넷 연결이 필요해요.'}</p></div></div>
    {!installed && <button ref={helpButton} className="soft-button" onClick={() => void install()} aria-expanded={help} aria-controls="install-help">{installEvent ? '정원 설치하기' : '설치 방법'}</button>}
    {help && <div id="install-help" className="install-help"><strong>홈 화면에 정원을 담아보세요</strong><p>iPhone·iPad: Safari의 공유 메뉴 → 홈 화면에 추가.<br/>Android·PC: 브라우저 메뉴의 앱 설치 또는 홈 화면에 추가를 찾아보세요.</p><p>설치 항목이 없으면 지원 브라우저에서 열어주세요. 설치 없이도 이 화면에서 산책할 수 있어요.</p><button className="soft-button" onClick={() => { setHelp(false); helpButton.current?.focus() }}>안내 닫기</button></div>}
    {!online && <p className="connection-note">인터넷 연결이 감지되지 않아요. 다른 사용자와 만나기·날씨 갱신은 향후 온라인 기능으로 제공됩니다.</p>}
    {state.failed && available && <button className="soft-button" onClick={() => window.location.reload()}>다시 준비하기</button>}
    {state.update && <div className="update-note" role="status"><span>새 정원이 준비됐어요. 적용하면 화면이 다시 열립니다.</span><button className="soft-button" disabled={updating} onClick={update}>{updating ? '새 정원 여는 중…' : '지금 업데이트'}</button><span>나중에 적용하려면 그대로 산책하세요.</span></div>}
    {notice && <p role="status" className="connection-note">{notice}</p>}
  </aside>
}
