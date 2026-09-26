// Shared helpers for turning noisy OCR text into numbers, dates and boxes.
// Pure functions only, so they are easy to test.

import type { Box, Confidence, FactKey, FactValue, OcrWord } from '@/contracts'
import { parseUSD } from '@/lib/money'

/** What a parser found, before it becomes a ReadHit. */
export interface Found {
  key: FactKey
  value: FactValue
  confidence: Confidence
  /** The raw source line (redacted later). */
  line: string
  /** Text fragments to look for in the OCR words to place the highlight box. */
  needles: string[]
}

/** Letters OCR often reads in place of digits. */
const CONFUSABLE: Record<string, string> = {
  O: '0',
  o: '0',
  Q: '0',
  D: '0',
  I: '1',
  l: '1',
  i: '1',
  '|': '1',
  '!': '1',
  S: '5',
  s: '5',
  B: '8',
  Z: '2',
  z: '2',
}

/** Split text into trimmed, non-empty lines. */
export function toLines(text: string): string[] {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
}

/** Lowercase text where digits that look like letters become letters, for
 *  label matching: "Ending ba1ance" reads as "ending balance". */
export function loose(line: string): string {
  return line
    .toLowerCase()
    .replace(/(?<=[a-z])[1|](?=[a-z])/g, 'l')
    .replace(/(?<=[a-z])0|0(?=[a-z])/g, 'o')
    .replace(/(?<=[a-z])5(?=[a-z])/g, 's')
    .replace(/\s+/g, ' ')
}

/** Replace confusable letters with digits in a number-like token.
 *  Returns null when the token is not a plausible number. */
export function fixDigits(token: string): { text: string; fuzzy: boolean } | null {
  const digits = (token.match(/\d/g) ?? []).length
  if (digits === 0) return null
  let mapped = 0
  let out = ''
  for (const ch of token) {
    if (/\d/.test(ch) || ch === ',' || ch === '.' || ch === '$' || ch === '-' || ch === '/') {
      out += ch
    } else if (CONFUSABLE[ch]) {
      out += CONFUSABLE[ch]
      mapped++
    } else {
      return null
    }
  }
  return { text: out, fuzzy: mapped > 0 }
}

export interface MoneyToken {
  cents: number
  raw: string
  fuzzy: boolean
  hasDollar: boolean
  hasCents: boolean
  index: number
}

/** Tidy the spacing OCR adds inside amounts: "$ 1, 420 . 00" -> "$1,420.00". */
function tidyAmounts(line: string): string {
  return line
    .replace(/\$\s+/g, '$')
    .replace(/(\d)\s*,\s+(\d{3})/g, '$1,$2')
    .replace(/(\d)\s+\.\s*(\d{2})\b/g, '$1.$2')
    .replace(/(\d)\.\s+(\d{2})\b/g, '$1.$2')
    .replace(/\$(\d{1,3})\s(\d{3}(?:[.,]\d{2})?)\b/g, '$$$1,$2')
}

/** Every dollar amount on a line, tolerant of OCR noise. */
export function findMoney(line: string): MoneyToken[] {
  const tidy = tidyAmounts(line)
  const out: MoneyToken[] = []
  for (const m of tidy.matchAll(/\S+/g)) {
    let tok = m[0].replace(/^[(+[]+/, '').replace(/[)\]:;,.*]+$/, '')
    if (tok.startsWith('-')) tok = tok.slice(1)
    const hasDollar = tok.startsWith('$')
    if (hasDollar) tok = tok.slice(1)
    if (!tok) continue
    const fixed = fixDigits(tok)
    if (!fixed) continue
    let s = fixed.text
    if (s.includes('/') || s.includes('$') || s.includes('-')) continue
    // "1,420,00" is almost always "1,420.00" misread.
    if (!s.includes('.') && /,\d{2}$/.test(s)) s = s.replace(/,(\d{2})$/, '.$1')
    if (!/^(\d{1,3}(,\d{3})+|\d+)(\.\d{2})?$/.test(s)) continue
    const cents = parseUSD(s)
    if (cents === null) continue
    out.push({
      cents,
      raw: m[0],
      fuzzy: fixed.fuzzy,
      hasDollar,
      hasCents: /\.\d{2}$/.test(s),
      index: m.index ?? 0,
    })
  }
  return out
}

/** A money token that reads like a real amount, not a year or line number. */
export function isAmountLike(t: MoneyToken): boolean {
  return t.hasDollar || t.hasCents
}

/** Step confidence down one level. */
export function lower(c: Confidence): Confidence {
  return c === 'high' ? 'medium' : 'low'
}

// ------------------------------------------------------------- boxes

/** Characters that matter when comparing a word to a needle. Numbers compare
 *  by digits only (with confusables fixed); words compare by letters. */
function signature(text: string): string {
  if (/\d/.test(text)) {
    let out = ''
    for (const ch of text) {
      if (/\d/.test(ch)) out += ch
      else if (CONFUSABLE[ch]) out += CONFUSABLE[ch]
    }
    return out
  }
  return text.toLowerCase().replace(/[^a-z]/g, '')
}

type Px = { x0: number; y0: number; x1: number; y1: number }

function union(a: Px | null, b: Px): Px {
  if (!a) return { ...b }
  return {
    x0: Math.min(a.x0, b.x0),
    y0: Math.min(a.y0, b.y0),
    x1: Math.max(a.x1, b.x1),
    y1: Math.max(a.y1, b.y1),
  }
}

/** Find the OCR words that hold each needle and return one normalized box
 *  around them. Numbers may be split across up to four words. */
export function boxFor(
  words: OcrWord[] | undefined,
  needles: string[],
  size?: { width: number; height: number },
): Box | undefined {
  if (!words?.length || !needles.length) return undefined
  const sigs = words.map((w) => signature(w.text))
  let px: Px | null = null

  for (const needle of needles) {
    const target = signature(needle)
    if (target.length < 2) continue
    const numeric = /\d/.test(needle)
    let hit = false
    for (let i = 0; i < words.length && !hit; i++) {
      if (numeric) {
        let acc = ''
        let bb: Px | null = null
        for (let j = i; j < Math.min(words.length, i + 4); j++) {
          acc += sigs[j]
          bb = union(bb, words[j].bbox)
          if (acc === target) {
            px = union(px, bb)
            hit = true
            break
          }
          if (!target.startsWith(acc)) break
        }
      } else if (sigs[i] && sigs[i].startsWith(target)) {
        px = union(px, words[i].bbox)
        hit = true
      }
    }
  }
  if (!px) return undefined

  const width = size?.width ?? Math.max(...words.map((w) => w.bbox.x1))
  const height = size?.height ?? Math.max(...words.map((w) => w.bbox.y1))
  if (!width || !height) return undefined
  const padX = 0.006
  const padY = 0.004
  const x = Math.max(0, px.x0 / width - padX)
  const y = Math.max(0, px.y0 / height - padY)
  const x1 = Math.min(1, px.x1 / width + padX)
  const y1 = Math.min(1, px.y1 / height + padY)
  return { x, y, w: x1 - x, h: y1 - y }
}
