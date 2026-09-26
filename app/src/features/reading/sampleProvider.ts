// Sample mode: a scripted reader for the built-in fake documents. It never
// fails and takes about 1.6 seconds, so the scan animation reads well on a
// projector.

import type { ReadHit, ReadingProvider, ReadProgress } from '@/contracts'
import { kindFromSampleId, sampleHits } from '@/features/docs/samples/sampleLayout'
import { wait } from './abort'

/** Stages and how long each one takes, in ms. Adds up to about 1.6s. */
const SCRIPT: { stage: ReadProgress['stage']; from: number; to: number; ms: number }[] = [
  { stage: 'loading', from: 0, to: 0.12, ms: 240 },
  { stage: 'recognizing', from: 0.12, to: 0.82, ms: 960 },
  { stage: 'parsing', from: 0.82, to: 1, ms: 400 },
]
const TICK = 80

export const sampleProvider: ReadingProvider = {
  mode: 'sample',
  async available() {
    return true
  },
  async read(input, onProgress, signal): Promise<ReadHit[]> {
    const kind = (input.sampleId && kindFromSampleId(input.sampleId)) || input.kind
    for (const step of SCRIPT) {
      const ticks = Math.max(1, Math.round(step.ms / TICK))
      for (let i = 0; i < ticks; i++) {
        onProgress?.({ stage: step.stage, pct: step.from + ((step.to - step.from) * i) / ticks })
        await wait(step.ms / ticks, signal)
      }
    }
    onProgress?.({ stage: 'done', pct: 1 })
    return sampleHits(kind)
  },
}

/** The same results with no animation (for "Skip ahead"). */
export function readSampleNow(kind: Parameters<typeof sampleHits>[0]): ReadHit[] {
  return sampleHits(kind)
}
