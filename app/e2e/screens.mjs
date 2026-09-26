// End-to-end screenshots and the two-tab family flow.
// Usage: npm run build && node e2e/screens.mjs
// Starts "vite preview" on port 4173 unless something already answers there.
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const here = path.dirname(fileURLToPath(import.meta.url))
const appDir = path.resolve(here, '..')
const outDir = path.join(here, 'screens')
mkdirSync(outDir, { recursive: true })

const PORT = 4173
const BASE = `http://localhost:${PORT}/`
const INVITE = 'PARK-4821'

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const root = '/opt/pw-browsers'
  if (!existsSync(root)) return undefined
  const dirs = readdirSync(root).filter((d) => d.startsWith('chromium') && !d.includes('headless'))
  dirs.sort().reverse()
  for (const d of dirs) {
    for (const rel of ['chrome-linux/chrome', 'chrome-linux64/chrome']) {
      const p = path.join(root, d, rel)
      if (existsSync(p)) return p
    }
  }
  return undefined
}

async function isUp() {
  try {
    const r = await fetch(BASE)
    return r.ok
  } catch {
    return false
  }
}

async function startServer() {
  if (await isUp()) return null
  const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: appDir,
    stdio: 'ignore',
    detached: true,
  })
  for (let i = 0; i < 60; i++) {
    if (await isUp()) return proc
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('vite preview did not start on port ' + PORT)
}

const errors = []
function watch(page, label) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[${label}] console: ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`[${label}] pageerror: ${err.message}`))
}

async function settle(page, ms = 900) {
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(ms)
}

async function go(page, hash) {
  await page.goto(BASE + hash)
  await settle(page)
}

async function shot(page, name, w, scheme) {
  const file = path.join(outDir, `${name}-${w}-${scheme}.png`)
  await page.screenshot({ path: file, fullPage: true })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (overflow > 1) errors.push(`[${name}-${w}-${scheme}] horizontal overflow of ${overflow}px`)
  shots.push(path.relative(appDir, file))
}
const shots = []

/** From a loaded sample Start page: read, confirm all four, land on Matches. */
async function readAndConfirm(page) {
  await page.getByRole('button', { name: /Read my documents/ }).click()
  await page.waitForURL(/#\/read/)
  const confirms = page.getByRole('button', { name: /^Confirm /, pressed: false })
  await confirms.first().waitFor({ timeout: 60_000 })
  await settle(page, 600)
  const n = await confirms.count()
  if (n !== 4) throw new Error(`expected 4 facts to confirm, saw ${n}`)
  return confirms
}

async function confirmAll(page) {
  const confirms = page.getByRole('button', { name: /^Confirm /, pressed: false })
  while ((await confirms.count()) > 0) await confirms.first().click()
  await page.getByRole('button', { name: /Save and find programs/ }).click()
  await page.waitForURL(/#\/matches/, { timeout: 15_000 })
  await settle(page, 2200)
}

async function screensFor(browser, w, h, scheme) {
  const context = await browser.newContext({
    viewport: { width: w, height: h },
    colorScheme: scheme,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const label = `${w}-${scheme}`
  watch(page, label)

  await go(page, '#/')
  await shot(page, 'landing', w, scheme)
  await go(page, '#/start')
  await shot(page, 'start', w, scheme)
  await go(page, '#/start?sample=1')
  await page.getByRole('button', { name: /Read my documents/ }).waitFor({ timeout: 15_000 })
  await settle(page)
  await shot(page, 'start-sample', w, scheme)
  await readAndConfirm(page)
  await shot(page, 'read', w, scheme)
  await confirmAll(page)
  await shot(page, 'matches', w, scheme)
  await go(page, '#/draft/msp')
  await shot(page, 'draft-msp', w, scheme)
  await go(page, '#/draft/extra_help')
  await shot(page, 'draft-extra_help', w, scheme)
  await go(page, '#/plan')
  await settle(page, 1200)
  await shot(page, 'plan', w, scheme)
  await go(page, '#/sources')
  await shot(page, 'sources', w, scheme)

  // A family member opens the invite link in a fresh tab (no caregiver identity).
  const fam = await context.newPage()
  watch(fam, label + ' family')
  await go(fam, `#/family?h=${INVITE}`)
  await shot(fam, 'family-picker', w, scheme)
  await fam.getByRole('button', { name: /I'm Daniel/ }).click()
  await settle(fam)
  await shot(fam, 'family-daniel', w, scheme)

  if (w === 1440 && scheme === 'light') {
    await page.bringToFront()
    await go(page, '#/draft/msp')
    await page.emulateMedia({ media: 'print' })
    await page.pdf({ path: path.join(outDir, 'draft-msp-print.pdf'), format: 'Letter', printBackground: true })
    await page.screenshot({ path: path.join(outDir, 'draft-msp-print.png'), fullPage: true })
    shots.push('e2e/screens/draft-msp-print.pdf', 'e2e/screens/draft-msp-print.png')
    await page.emulateMedia({ media: 'screen' })
  }
  await context.close()
}

async function flow(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const a = await context.newPage()
  watch(a, 'flow caregiver')
  await go(a, '#/start?sample=1')
  await a.getByRole('button', { name: /Read my documents/ }).waitFor({ timeout: 15_000 })
  await readAndConfirm(a)
  await confirmAll(a)
  const body = await a.locator('main').innerText()
  const counter = body.match(/about \$[\d,]+/)?.[0]
  if (!counter) throw new Error('Matches page shows no "about $X/yr" estimate')
  await go(a, '#/plan')
  await a.getByRole('button', { name: /^Claim: / }).first().waitFor({ timeout: 15_000 })

  const b = await context.newPage()
  watch(b, 'flow family')
  await go(b, `#/family?h=${INVITE}`)
  await b.getByRole('button', { name: /I'm Daniel/ }).click()
  const claim = b.getByRole('button', { name: /^Claim: / }).first()
  await claim.waitFor({ timeout: 10_000 })
  const title = (await claim.getAttribute('aria-label')).replace(/^Claim: /, '')
  await claim.click()
  await b.getByRole('button', { name: `Mark done: ${title}` }).waitFor({ timeout: 5_000 })

  const t0 = Date.now()
  await a.getByText(/Daniel\s+is on it/).first().waitFor({ timeout: 3_000 })
  const ms = Date.now() - t0
  await context.close()
  return { counter, claimed: title, seenOnCaregiverTabMs: ms }
}

const server = await startServer()
const browser = await chromium.launch({ executablePath: findChrome() })
let result
let failed = false
try {
  for (const [w, h] of [
    [390, 844],
    [1440, 900],
  ]) {
    for (const scheme of ['light', 'dark']) await screensFor(browser, w, h, scheme)
  }
  result = await flow(browser)
} catch (e) {
  failed = true
  console.error('FAILED:', e instanceof Error ? e.stack : e)
} finally {
  await browser.close()
  if (server) process.kill(-server.pid)
}

console.log(`screenshots (${shots.length}):\n  ` + shots.join('\n  '))
if (result) console.log('flow:', JSON.stringify(result))
if (errors.length) {
  console.error(`errors (${errors.length}):\n  ` + errors.join('\n  '))
  failed = true
}
process.exit(failed ? 1 : 0)
