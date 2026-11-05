import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { chromium } from '@playwright/test'

test('offline first visit, server shutdown, mobile controls, update and failed caching', { timeout: 180000 }, async t => {
  let version = 1
  let failIcon = false
  const dist = resolve('dist')
  const server = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname
    if (failIcon && pathname === '/icons/garden-180.png') { res.writeHead(503).end(); return }
    const path = resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname))
    if (!path.startsWith(dist + '\\') && !path.startsWith(dist + '/')) { res.writeHead(403).end(); return }
    try {
      let body = await readFile(path)
      if (pathname === '/sw.js' && version === 2) body = Buffer.from(body.toString().replace(/meta-garden-([a-f0-9]+)/, 'meta-garden-next-$1'))
      const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.webmanifest': 'application/manifest+json' }
      res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body)
    } catch { res.writeHead(404).end() }
  })
  const listen = port => new Promise(done => server.listen(port, '127.0.0.1', done))
  const stop = () => new Promise((done, reject) => { server.close(error => error ? reject(error) : done()); server.closeAllConnections() })
  t.after(async () => { if (server.listening) await stop() })
  await listen(0)
  const port = server.address().port
  const url = `http://127.0.0.1:${port}`
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url)
    await page.getByRole('status').filter({ hasText: '오프라인 산책 준비 완료' }).waitFor({ timeout: 30000 })
    await page.locator('canvas').waitFor()
    await page.locator('.nameplate').waitFor({ timeout: 30000 })
    const nickname = await page.locator('.nameplate').innerText()
    await page.getByRole('button', { name: '설치 방법' }).click()
    await page.getByText('홈 화면에 정원을 담아보세요').waitFor()
    await page.getByRole('button', { name: '안내 닫기' }).click()
    await page.getByRole('button', { name: '카메라 시점 전환' }).click()
    assert.match(await page.locator('.camera').innerText(), /쿼터뷰/)
    const forward = page.getByRole('button', { name: '앞으로', exact: true })
    assert.equal(await forward.isVisible(), true)
    await forward.scrollIntoViewIfNeeded()
    const bounds = await forward.boundingBox()
    assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44)
    // Hold a real pointer and compare the rendered scene after the camera settles.
    await page.waitForTimeout(1600)
    const before = await page.locator('.nameplate').getAttribute('data-z')
    await page.mouse.move(bounds.x + 22, bounds.y + 22)
    await page.mouse.down()
    try { await page.waitForFunction(start => document.querySelector('.nameplate')?.getAttribute('data-z') !== start, before, { timeout: 10000 }) }
    finally { await page.mouse.up() }
    await page.waitForTimeout(1200)
    const after = await page.locator('.nameplate').getAttribute('data-z')
    assert.notEqual(before, after, 'touch hold must move the player')
    await page.waitForTimeout(300)
    assert.equal(await page.locator('.nameplate').getAttribute('data-z'), after, 'release must stop movement')
    await page.getByRole('button', { name: '카메라 시점 전환' }).click()
    await page.waitForTimeout(800)
    const canvas = await page.locator('canvas').boundingBox()
    const oldYaw = await page.locator('.nameplate').getAttribute('data-yaw')
    await page.mouse.move(canvas.x + 200, canvas.y + 260)
    await page.mouse.down(); await page.mouse.move(canvas.x + 270, canvas.y + 260, { steps: 8 }); await page.mouse.up()
    await page.waitForTimeout(300)
    assert.notEqual(await page.locator('.nameplate').getAttribute('data-yaw'), oldYaw, 'drag must orbit the camera')
    await page.screenshot({ path: '../../outputs/pwa-mobile.png', fullPage: true })
    await context.setOffline(true)
    await page.reload()
    await page.getByRole('status').filter({ hasText: '오프라인 산책 중' }).waitFor()
    await page.locator('.nameplate').waitFor()
    assert.equal(await page.locator('.nameplate').innerText(), nickname, 'visitor survives offline reload')
    await context.setOffline(false)
    await stop()
    await page.reload()
    await page.locator('canvas').waitFor()
    await page.getByRole('status').filter({ hasText: '오프라인 산책 준비 완료' }).waitFor()
    await listen(port)
    version = 2
    await page.evaluate(async () => { const reg = await navigator.serviceWorker.getRegistration(); await reg.update() })
    await page.getByRole('button', { name: '지금 업데이트' }).waitFor({ timeout: 30000 })
    assert.equal(await page.evaluate(async () => (await caches.keys()).some(k => k.startsWith('meta-garden-next-'))), true)
    await page.getByRole('button', { name: '지금 업데이트' }).click()
    await page.getByRole('status').filter({ hasText: '오프라인 산책 준비 완료' }).waitFor()
    await page.waitForFunction(async () => (await caches.keys()).every(key => !key.startsWith('meta-garden-') || key.startsWith('meta-garden-next-')))
    assert.deepEqual(errors, [])
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const desktopPage = await desktop.newPage()
    desktopPage.on('pageerror', error => errors.push(error.message))
    await desktopPage.goto(url)
    await desktopPage.locator('.nameplate').waitFor({ timeout: 30000 })
    await desktopPage.waitForTimeout(1000)
    await desktopPage.screenshot({ path: '../../outputs/garden-immersive-desktop.png' })
    await desktopPage.bringToFront()
    await desktopPage.getByRole('button', { name: '카메라 시점 전환' }).click()
    await desktopPage.getByRole('button', { name: '카메라 시점 전환' }).click()
    const keyboardStart = await desktopPage.locator('.nameplate').getAttribute('data-z')
    await desktopPage.keyboard.down('KeyW')
    try { await desktopPage.waitForFunction(start => document.querySelector('.nameplate')?.getAttribute('data-z') !== start, keyboardStart, { timeout: 10000 }) }
    finally { await desktopPage.keyboard.up('KeyW') }
    await desktopPage.waitForTimeout(200)
    assert.notEqual(await desktopPage.locator('.nameplate').getAttribute('data-z'), keyboardStart, 'desktop keyboard must move the player')
    assert.deepEqual(errors, [])
    await desktop.close()
    failIcon = true
    const fresh = await browser.newContext()
    const failurePage = await fresh.newPage()
    await failurePage.goto(url)
    await failurePage.getByRole('status').filter({ hasText: '오프라인 저장을 완료하지 못했어요' }).waitFor({ timeout: 30000 })
    assert.equal(await failurePage.getByText('오프라인 산책 준비 완료').count(), 0)
    failIcon = false
    await failurePage.getByRole('button', { name: '다시 준비하기' }).click()
    await failurePage.getByRole('status').filter({ hasText: '오프라인 산책 준비 완료' }).waitFor({ timeout: 30000 })
    await fresh.close()
    await context.close()
  } finally {
    await browser.close()
    if (server.listening) await stop()
  }
})
