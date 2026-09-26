// Turn the text of one document into the facts it holds. Each document kind
// only yields the facts it is meant to hold, so a date on a bank statement
// never becomes a birthday.

import type { DocKind, OcrWord, ReadHit } from '@/contracts'
import { parseBalance } from './balance'
import { parseDob } from './dob'
import { parseIncome, parseIncomeFromTaxReturn } from './income'
import { parseMedicare } from './medicare'
import { toSnippet } from './redact'
import { boxFor, type Found } from './text'

export { redact, toSnippet, MASK } from './redact'
export { findDates } from './dob'
export { findMoney } from './text'

const PARSERS: Record<DocKind, ((text: string) => Found | null)[]> = {
  medicare_card: [parseMedicare, parseDob],
  ssa_letter: [parseIncome, parseDob],
  bank_statement: [parseBalance],
  tax_return: [parseDob, parseIncomeFromTaxReturn],
}

/**
 * Read the facts out of one document's text.
 * @param words OCR words with pixel boxes, used to place highlight boxes.
 * @param size  The pixel size of the image the words were read from.
 */
export function parse(
  kind: DocKind,
  text: string,
  words?: OcrWord[],
  size?: { width: number; height: number },
): ReadHit[] {
  const hits: ReadHit[] = []
  for (const parser of PARSERS[kind]) {
    const found = parser(text)
    if (!found || hits.some((h) => h.key === found.key)) continue
    const hit: ReadHit = {
      key: found.key,
      value: found.value,
      confidence: found.confidence,
      snippet: toSnippet(found.line),
    }
    const box = boxFor(words, found.needles, size)
    if (box) hit.box = box
    hits.push(hit)
  }
  return hits
}
