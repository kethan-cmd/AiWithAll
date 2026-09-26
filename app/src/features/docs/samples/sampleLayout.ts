// Geometry for the four fake sample documents. The SVG components draw each
// fact value at exactly these spots, and the reading overlay places its
// highlight boxes from the same numbers, so they always line up.
//
// Fact values are set in a monospace face so their width is predictable:
// about 0.6em per character.

import type { Box, DocKind, FactKey, ReadHit } from '@/contracts'
import { SAMPLE } from '@/content/sampleFamily'
import { formatUSD } from '@/lib/money'

export interface TextSpot {
  x: number
  /** Baseline. */
  y: number
  size: number
  anchor: 'start' | 'end'
  text: string
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface DocLayout {
  width: number
  height: number
  /** Highlight boxes in viewBox units. */
  boxes: Partial<Record<FactKey, Rect>>
}

export const MONO_FONT = "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"
export const SANS_FONT = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"
export const SERIF_FONT = "'Fraunces Variable', Georgia, serif"

const MONO_EM = 0.6

/** The box around a monospace text spot, with a little breathing room. */
export function spotRect(s: TextSpot, padX = 7, padY = 6): Rect {
  const w = s.text.length * s.size * MONO_EM
  const x = s.anchor === 'end' ? s.x - w : s.x
  const top = s.y - s.size * 0.78
  return { x: x - padX, y: top - padY, w: w + padX * 2, h: s.size * 0.98 + padY * 2 }
}

/** "1945-03-14" as "03/14/1945". */
function us(iso: string, sep = '/'): string {
  const [y, m, d] = iso.split('-')
  return `${m}${sep}${d}${sep}${y}`
}

// ------------------------------------------------------------- spots

export const SPOTS = {
  medicare_card: {
    partAStart: { x: 520, y: 404, size: 26, anchor: 'start', text: us(SAMPLE.docs.medicare_part_a_since, '-') },
    partBStart: { x: 520, y: 446, size: 26, anchor: 'start', text: us(SAMPLE.docs.medicare_part_b_since, '-') },
  },
  ssa_letter: {
    income: { x: 564, y: 392, size: 14, anchor: 'end', text: formatUSD(SAMPLE.facts.monthly_income_cents) },
  },
  bank_statement: {
    balance: { x: 556, y: 306, size: 15, anchor: 'end', text: formatUSD(SAMPLE.facts.bank_balance_cents) },
  },
  tax_return: {
    dob: { x: 40, y: 200, size: 16, anchor: 'start', text: us(SAMPLE.facts.birth_date) },
  },
} satisfies Record<DocKind, Record<string, TextSpot>>

// ------------------------------------------------------------ layouts

export const SAMPLE_LAYOUT: Record<DocKind, DocLayout> = {
  medicare_card: {
    width: 860,
    height: 540,
    boxes: {
      // Both coverage rows: HOSPITAL (PART A) and MEDICAL (PART B) with dates.
      medicare_parts: { x: 34, y: 372, w: 700, h: 88 },
    },
  },
  ssa_letter: {
    width: 612,
    height: 792,
    boxes: { monthly_income: spotRect(SPOTS.ssa_letter.income) },
  },
  bank_statement: {
    width: 612,
    height: 792,
    boxes: { bank_balance: spotRect(SPOTS.bank_statement.balance) },
  },
  tax_return: {
    width: 612,
    height: 792,
    boxes: { birth_date: spotRect(SPOTS.tax_return.dob) },
  },
}

/** Normalized (0..1) highlight boxes for one sample document. */
export function sampleBoxes(kind: DocKind): Partial<Record<FactKey, Box>> {
  const { width, height, boxes } = SAMPLE_LAYOUT[kind]
  const out: Partial<Record<FactKey, Box>> = {}
  for (const [key, r] of Object.entries(boxes) as [FactKey, Rect][]) {
    out[key] = { x: r.x / width, y: r.y / height, w: r.w / width, h: r.h / height }
  }
  return out
}

/** The id a tile uses to say "read the built-in sample for this kind". */
export function sampleIdFor(kind: DocKind): string {
  return `park:${kind}`
}

export function kindFromSampleId(id: string): DocKind | null {
  const kind = id.startsWith('park:') ? id.slice(5) : ''
  return kind in SAMPLE_LAYOUT ? (kind as DocKind) : null
}

/** What the scripted reader "finds" on each sample document. */
export function sampleHits(kind: DocKind): ReadHit[] {
  const boxes = sampleBoxes(kind)
  const f = SAMPLE.facts
  switch (kind) {
    case 'medicare_card':
      return [
        {
          key: 'medicare_parts',
          value: { key: 'medicare_parts', parts: [...f.medicare_parts] },
          confidence: 'high',
          box: boxes.medicare_parts,
          snippet: `HOSPITAL (PART A) ${SPOTS.medicare_card.partAStart.text} · MEDICAL (PART B) ${SPOTS.medicare_card.partBStart.text}`,
        },
      ]
    case 'ssa_letter':
      return [
        {
          key: 'monthly_income',
          value: { key: 'monthly_income', cents: f.monthly_income_cents },
          confidence: 'high',
          box: boxes.monthly_income,
          snippet: `Monthly Social Security benefit before deductions ${SPOTS.ssa_letter.income.text}`,
        },
      ]
    case 'bank_statement':
      return [
        {
          key: 'bank_balance',
          value: { key: 'bank_balance', cents: f.bank_balance_cents },
          confidence: 'high',
          box: boxes.bank_balance,
          snippet: `Ending balance ${SPOTS.bank_statement.balance.text}`,
        },
      ]
    case 'tax_return':
      return [
        {
          key: 'birth_date',
          value: { key: 'birth_date', iso: f.birth_date },
          confidence: 'high',
          box: boxes.birth_date,
          snippet: `Date of birth ${SPOTS.tax_return.dob.text}`,
        },
      ]
  }
}
