import { readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, relative } from 'node:path'

const dist = resolve('dist')
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  return (await Promise.all(entries.map(e => e.isDirectory() ? files(resolve(dir, e.name)) : resolve(dir, e.name)))).flat()
}
const paths = (await files(dist)).filter(p => !p.endsWith('sw.js')).sort()
const hash = createHash('sha256')
for (const p of paths) hash.update(await readFile(p))
const urls = paths.map(p => '/' + relative(dist, p).replaceAll('\\', '/'))
const source = await readFile(new URL('./sw-template.js', import.meta.url), 'utf8')
await writeFile(resolve(dist, 'sw.js'), source.replace('__CACHE_VERSION__', hash.digest('hex').slice(0, 16)).replace('__PRECACHE_URLS__', JSON.stringify(urls)))
console.log(`Offline garden: ${urls.length} files included in precache`)
