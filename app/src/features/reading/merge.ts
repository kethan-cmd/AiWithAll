// Several documents can hold the same fact. Pick the best reading of each
// fact across every document: surest first, then the document that is the
// natural home of that fact.

import type { Box, Confidence, DocKind, FactKey, FactValue, ReadHit, ReadMode } from '@/contracts'
import { DOC_KINDS } from '@/contracts'

/** One fact ready for the caregiver to check. */
export interface FactCandidate {
  key: FactKey
  value: FactValue
  source: DocKind | 'manual'
  mode: ReadMode
  confidence: Confidence
  snippet?: string
  box?: Box
}

const RANK: Record<Confidence, number> = { high: 3, medium: 2, low: 1 }

/** Where each fact normally lives, best first. */
export const FACT_HOME: Record<FactKey, DocKind[]> = {
  birth_date: ['tax_return', 'medicare_card', 'ssa_letter'],
  medicare_parts: ['medicare_card'],
  monthly_income: ['ssa_letter', 'tax_return', 'bank_statement'],
  bank_balance: ['bank_statement'],
}

export function bestFacts(
  hits: Partial<Record<DocKind, ReadHit[]>>,
  modes: Partial<Record<DocKind, ReadMode | null>> = {},
): Partial<Record<FactKey, FactCandidate>> {
  const out: Partial<Record<FactKey, FactCandidate>> = {}
  for (const kind of DOC_KINDS) {
    for (const hit of hits[kind] ?? []) {
      const cand: FactCandidate = {
        key: hit.key,
        value: hit.value,
        source: kind,
        mode: modes[kind] ?? 'ocr',
        confidence: hit.confidence,
        snippet: hit.snippet,
        box: hit.box,
      }
      const prev = out[hit.key]
      if (!prev || better(cand, prev)) out[hit.key] = cand
    }
  }
  return out
}

function better(a: FactCandidate, b: FactCandidate): boolean {
  if (RANK[a.confidence] !== RANK[b.confidence]) return RANK[a.confidence] > RANK[b.confidence]
  const home = FACT_HOME[a.key]
  const ia = a.source === 'manual' ? 99 : home.indexOf(a.source)
  const ib = b.source === 'manual' ? 99 : home.indexOf(b.source)
  return (ia === -1 ? 50 : ia) < (ib === -1 ? 50 : ib)
}
