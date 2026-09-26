// On-device reading with tesseract.js. The photo never leaves the browser:
// the worker, the WebAssembly core and the English model are served from
// this site's own /ocr/ folder, and the library itself is only downloaded
// the first time someone picks a real photo.

import type { OcrWord, ReadHit, ReadingProvider, ReadProgress } from '@/contracts'
import { abortError, isAbort } from './abort'
import { parse } from './parsers'

/** Longest side we hand to OCR. Phone photos are huge; this keeps reading
 *  fast while leaving letters large enough to read. */
const MAX_SIDE = 2200

const FRIENDLY = {
  decode: "We couldn't open this photo. Try a JPG or PNG, or type the facts instead.",
  load: "The reader couldn't start on this device. You can type the facts instead.",
  read: "We couldn't read this photo. Try a flatter, brighter photo, or type the facts instead.",
}

class FriendlyError extends Error {}

function ocrAsset(name: string): string {
  return new URL(`./ocr/${name}`, document.baseURI).href
}

/** Draw the photo onto a canvas, scaled down if it is very large. */
async function prepare(file: File): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new FriendlyError(FRIENDLY.decode)
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new FriendlyError(FRIENDLY.decode)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return { canvas, width, height }
}

/** Map tesseract's log messages onto our three stages. */
function toProgress(status: string, progress: number): ReadProgress {
  if (status === 'recognizing text') return { stage: 'recognizing', pct: 0.3 + 0.6 * progress }
  const loadingSteps = [
    'loading tesseract core',
    'initializing tesseract',
    'loading language traineddata',
    'initializing api',
  ]
  const i = Math.max(0, loadingSteps.indexOf(status))
  return { stage: 'loading', pct: Math.min(0.3, 0.04 + (i + progress) * 0.065) }
}

export const ocrProvider: ReadingProvider = {
  mode: 'ocr',
  async available() {
    return typeof window !== 'undefined' && typeof WebAssembly === 'object' && typeof Worker === 'function'
  },
  async read(input, onProgress, signal): Promise<ReadHit[]> {
    if (!input.file) throw new Error('There is no photo to read. Add one, or type the facts instead.')
    if (signal?.aborted) throw abortError()
    onProgress?.({ stage: 'loading', pct: 0.02 })

    const image = await prepare(input.file)

    let worker: Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>> | null = null
    const onAbort = () => {
      void worker?.terminate()
    }
    signal?.addEventListener('abort', onAbort, { once: true })

    try {
      let createWorker: (typeof import('tesseract.js'))['createWorker']
      try {
        ;({ createWorker } = await import('tesseract.js'))
        if (signal?.aborted) throw abortError()
        worker = await createWorker('eng', 1 /* OEM.LSTM_ONLY */, {
          workerPath: ocrAsset('worker.min.js'),
          corePath: new URL('./ocr/', document.baseURI).href,
          langPath: new URL('./ocr/', document.baseURI).href,
          gzip: true,
          workerBlobURL: false,
          logger: (m) => {
            if (!signal?.aborted) onProgress?.(toProgress(m.status, m.progress))
          },
        })
      } catch (e) {
        if (isAbort(e) || signal?.aborted) throw abortError()
        throw new FriendlyError(FRIENDLY.load)
      }

      let text = ''
      let words: OcrWord[] = []
      try {
        const { data } = await worker.recognize(image.canvas, {}, { text: true, blocks: true })
        text = data.text ?? ''
        words = (data.blocks ?? []).flatMap((b) =>
          b.paragraphs.flatMap((p) =>
            p.lines.flatMap((l) =>
              l.words.map((w) => ({ text: w.text, bbox: w.bbox, confidence: w.confidence })),
            ),
          ),
        )
      } catch (e) {
        if (isAbort(e) || signal?.aborted) throw abortError()
        throw new FriendlyError(FRIENDLY.read)
      }

      if (signal?.aborted) throw abortError()
      onProgress?.({ stage: 'parsing', pct: 0.94 })
      const hits = parse(input.kind, text, words, { width: image.width, height: image.height })
      onProgress?.({ stage: 'done', pct: 1 })
      return hits
    } catch (e) {
      if (isAbort(e)) throw e
      if (e instanceof FriendlyError) throw new Error(e.message)
      throw new Error(FRIENDLY.read)
    } finally {
      signal?.removeEventListener('abort', onAbort)
      // One worker per document, always shut down: nothing lingers in memory.
      try {
        await worker?.terminate()
      } catch {
        // already stopped
      }
      image.canvas.width = 0
      image.canvas.height = 0
    }
  },
}
