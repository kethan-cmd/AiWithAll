// The reading seam. Pages ask for a provider here and never import a
// specific reader, so the hosted Base44 reader can slot in later.

import type { ReadInput, ReadingProvider, ReadMode } from '@/contracts'
import { base44Provider } from './base44Provider'
import { manualProvider } from './manualProvider'
import { ocrProvider } from './ocrProvider'
import { sampleProvider } from './sampleProvider'

const PROVIDERS: Record<ReadMode, ReadingProvider> = {
  sample: sampleProvider,
  ocr: ocrProvider,
  manual: manualProvider,
  base44: base44Provider,
}

export function getProvider(mode: ReadMode): ReadingProvider {
  return PROVIDERS[mode]
}

/** Sample documents use the scripted reader; real photos are read on the
 *  device; anything else is typed by hand. */
export function pickProvider(input: ReadInput): ReadingProvider {
  if (input.sampleId) return sampleProvider
  if (input.file) return ocrProvider
  return manualProvider
}

export { sampleProvider, readSampleNow } from './sampleProvider'
export { ocrProvider } from './ocrProvider'
export { manualProvider, manualHit, makeManualProvider } from './manualProvider'
export { base44Provider } from './base44Provider'
export { isAbort } from './abort'
