// Copies the on-device OCR assets (tesseract.js worker, LSTM wasm cores,
// English model) from node_modules into public/ocr/ so the app never loads
// them from a CDN. Runs before dev and build. Output is gitignored.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'ocr')
mkdirSync(out, { recursive: true })

const nm = join(root, 'node_modules')
const files = [
  ['tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'],
  ['@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'eng.traineddata.gz'],
]

for (const [from, to] of files) {
  const src = join(nm, from)
  if (!existsSync(src)) {
    console.warn(`[ocr-assets] missing ${from}; on-device reading will fall back to manual entry`)
    continue
  }
  copyFileSync(src, join(out, to))
}
console.log(`[ocr-assets] copied to ${out}`)
