// Manual mode: the caregiver types a fact. This provider exists so manual
// entry flows through the same seam as every other reader, and so a typed
// value becomes a ReadHit with the same shape.

import type { FactValue, ReadHit, ReadingProvider } from '@/contracts'

/** A typed fact, as a ReadHit. The person typed it, so confidence is high. */
export function manualHit(value: FactValue): ReadHit {
  return { key: value.key, value, confidence: 'high' }
}

/** A provider that "reads" the values a person typed. */
export function makeManualProvider(values: FactValue[]): ReadingProvider {
  return {
    mode: 'manual',
    async available() {
      return true
    },
    // The person chose what to type, so the document kind does not matter.
    async read(_input, onProgress) {
      onProgress?.({ stage: 'done', pct: 1 })
      return values.map(manualHit)
    },
  }
}

/** The default manual provider: nothing typed yet. */
export const manualProvider: ReadingProvider = makeManualProvider([])
