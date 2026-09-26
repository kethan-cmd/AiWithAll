// Date of birth: "03/14/1945", "March 14, 1945", "1945-03-14", "14 Mar 1945",
// near words like "birth", "DOB" or "born". "Born before January 2, 1961"
// (the Form 1040 checkbox) is a cutoff, not a birthday, so it is skipped.

import type { Confidence } from '@/contracts'
import { fixDigits, loose, toLines, type Found } from './text'

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

const MONTH_WORD = '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?'
const NUM = '[0-9OoIlS|]'

export interface FoundDate {
  iso: string
  raw: string
  index: number
  fuzzy: boolean
}

/** A real calendar date, as YYYY-MM-DD, or null. */
export function toIso(y: number, m: number, d: number): string | null {
  const now = new Date().getFullYear()
  if (y < 1900 || y > now || m < 1 || m > 12 || d < 1 || d > 31) return null
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function num(raw: string): { n: number; fuzzy: boolean } | null {
  const f = fixDigits(raw)
  if (!f || !/^\d+$/.test(f.text)) return null
  return { n: Number(f.text), fuzzy: f.fuzzy }
}

/** Every date on a line, in any of the supported formats. */
export function findDates(line: string): FoundDate[] {
  const out: FoundDate[] = []
  const push = (iso: string | null, raw: string, index: number, fuzzy: boolean) => {
    if (iso && !out.some((d) => d.index === index)) out.push({ iso, raw, index, fuzzy })
  }

  // 03/14/1945, 3-14-1945, 03.14.1945 (US order)
  const us = new RegExp(`(?<![0-9])(${NUM}{1,2})\\s?[/\\-.]\\s?(${NUM}{1,2})\\s?[/\\-.]\\s?(${NUM}{4})(?![0-9])`, 'g')
  for (const m of line.matchAll(us)) {
    const mo = num(m[1]), d = num(m[2]), y = num(m[3])
    if (!mo || !d || !y) continue
    const fuzzy = mo.fuzzy || d.fuzzy || y.fuzzy
    push(toIso(y.n, mo.n, d.n), m[0], m.index ?? 0, fuzzy)
  }

  // 1945-03-14 (ISO)
  for (const m of line.matchAll(/(?<![0-9])(\d{4})-(\d{2})-(\d{2})(?![0-9])/g)) {
    push(toIso(Number(m[1]), Number(m[2]), Number(m[3])), m[0], m.index ?? 0, false)
  }

  // March 14, 1945
  const named = new RegExp(`\\b${MONTH_WORD}\\s+(${NUM}{1,2}),?\\s+(${NUM}{4})\\b`, 'gi')
  for (const m of line.matchAll(named)) {
    const mo = MONTHS[m[1].toLowerCase()]
    const d = num(m[2]), y = num(m[3])
    if (!d || !y) continue
    push(toIso(y.n, mo, d.n), m[0], m.index ?? 0, d.fuzzy || y.fuzzy)
  }

  // 14 March 1945
  const dayFirst = new RegExp(`\\b(${NUM}{1,2})\\s+${MONTH_WORD},?\\s+(${NUM}{4})\\b`, 'gi')
  for (const m of line.matchAll(dayFirst)) {
    const mo = MONTHS[m[2].toLowerCase()]
    const d = num(m[1]), y = num(m[3])
    if (!d || !y) continue
    push(toIso(y.n, mo, d.n), m[0], m.index ?? 0, d.fuzzy || y.fuzzy)
  }

  return out.sort((a, b) => a.index - b.index)
}

const LABEL = /b[il1|]rth|\bd[o0]b\b|d\.o\.b|\bb[o0]rn\b|nacimiento/

/** A date right after "born before" or "born after" is a cutoff, not a birthday. */
function isCutoff(line: string, index: number): boolean {
  return /\b(before|after|on or)\s*$/i.test(line.slice(Math.max(0, index - 14), index))
}

export function parseDob(text: string): Found | null {
  const lines = toLines(text)
  const minAgeYear = new Date().getFullYear() - 50
  let guess: Found | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const dates = findDates(line).filter((d) => !isCutoff(line, d.index))
    if (!dates.length) continue
    const labeledHere = LABEL.test(loose(line))
    const labeledAbove = i > 0 && LABEL.test(loose(lines[i - 1])) && findDates(lines[i - 1]).length === 0

    if (labeledHere || labeledAbove) {
      const d = dates[0]
      let confidence: Confidence = 'high'
      if (d.fuzzy || labeledAbove) confidence = 'medium'
      return {
        key: 'birth_date',
        value: { key: 'birth_date', iso: d.iso },
        confidence,
        line: labeledAbove ? `${lines[i - 1]} ${line}` : line,
        needles: [d.raw],
      }
    }

    // An unlabeled date old enough to be a Medicare-age birthday is a guess.
    for (const d of dates) {
      const year = Number(d.iso.slice(0, 4))
      if (year <= minAgeYear && (!guess || d.iso < (guess.value as { iso: string }).iso)) {
        guess = {
          key: 'birth_date',
          value: { key: 'birth_date', iso: d.iso },
          confidence: 'low',
          line,
          needles: [d.raw],
        }
      }
    }
  }
  return guess
}
