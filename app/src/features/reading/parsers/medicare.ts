// Medicare parts from a Medicare card or letter. "HOSPITAL (PART A)" and
// "MEDICAL (PART B)" are printed on every red, white and blue card.

import type { MedicarePart } from '@/contracts'
import { loose, toLines, type Found } from './text'

const PART = /\bpart[\s\-_]*([abd8])\b/g
const HOSPITAL = /hosp[il1|]ta[l1|]/
const MEDICAL = /\bmed[il1|]ca[l1|]\b/
const DRUG = /prescription drug|drug (plan|coverage)/
const NEGATED = /\b(not|no)\s+(entitled|enrolled|covered)?\s*(to|in)?\s*part/

export function parseMedicare(text: string): Found | null {
  const explicit = new Set<MedicarePart>()
  const implied = new Set<MedicarePart>()
  const used: string[] = []

  for (const line of toLines(text)) {
    const l = loose(line).replace(/\bpart[\s\-_]*8\b/g, 'part b')
    if (NEGATED.test(l)) continue
    let touched = false
    for (const m of l.matchAll(PART)) {
      const p = (m[1] === '8' ? 'B' : m[1].toUpperCase()) as MedicarePart
      explicit.add(p)
      touched = true
    }
    if (HOSPITAL.test(l)) {
      implied.add('A')
      touched = true
    }
    if (MEDICAL.test(l)) {
      implied.add('B')
      touched = true
    }
    if (DRUG.test(l)) {
      implied.add('D')
      touched = true
    }
    if (touched) used.push(line)
  }

  const all = new Set<MedicarePart>([...explicit, ...implied])
  if (!all.has('A') && !all.has('B')) return null
  const parts = (['A', 'B', 'D'] as const).filter((p) => all.has(p))
  const allExplicit = parts.every((p) => explicit.has(p))

  return {
    key: 'medicare_parts',
    value: { key: 'medicare_parts', parts },
    confidence: allExplicit ? 'high' : 'medium',
    line: used.slice(0, 3).join(' · '),
    needles: ['hospital', 'medical', 'part'],
  }
}
