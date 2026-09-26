// Every snippet we keep passes through redact() first. We never extract
// Social Security numbers, Medicare numbers or account numbers, and this is
// the belt-and-braces layer that masks them if OCR text happens to hold one.

export const MASK = '•••'

/** Medicare Beneficiary Identifier: 11 characters, e.g. 1EG4-TE5-MK73.
 *  OCR often reads the leading 1 as I, l, | or !, and a digit 0 as O, so the
 *  digit positions accept those look-alikes too. */
const D = '[0-9Oo]'
const MBI = new RegExp(
  `(?<![A-Za-z0-9])[1-9Il|!][A-Z][A-Z0-9]${D}\\s*[-\\s]?\\s*[A-Z][A-Z0-9]${D}\\s*[-\\s]?\\s*[A-Z]{2}${D}{2}(?![A-Za-z0-9])`,
  'gi',
)

/** SSN: ###-##-####, ### ## ####, 9 digits in a row, OCR spaces around the
 *  dashes, and SSA claim numbers (the SSN plus a letter or two, e.g. 123-45-6789A). */
const SSN = /\b\d{3}\s*[-\s]\s*\d{2}\s*[-\s]\s*\d{4}(?:[A-Z]{1,2}\d?)?(?![0-9])|\b\d{9}[A-Z]{0,2}\d?\b/gi

/** Whatever follows a label that names an identifier is masked, whatever its
 *  shape: "Claim Number: ...", "BNC ...", "Social Security No. ...", "SSN ...". */
const LABELED_ID =
  /\b(claim\s*(?:number|no\.?|#)|bnc(?:\s*(?:number|no\.?|#))?|social\s+security\s*(?:number|no\.?|#)|medicare\s*(?:number|no\.?|#)|ssn|mbi)(\s*[:#.]?\s*)([A-Z0-9|!]+(?:\s*-\s*[A-Z0-9]+|\s+\d[A-Z0-9]*)*)/gi

/** Account, card and routing numbers: 8 or more digits, spaces or dashes allowed. */
const LONG_NUMBER = /\b\d(?:[\s-]?\d){7,}\b/g

/** Dates like 03-01-2010 or 2010-03-01 have 8 digits but are not accounts. */
const DATE_SHAPE = /^(\d{1,2}-\d{1,2}-\d{4}|\d{4}-\d{2}-\d{2})$/

/** "Account number: 12-3456" style numbers, even when shorter. */
const LABELED_ACCOUNT =
  /\b(acct|account|routing|member|card)(\s*(no\.?|number|num|#))\s*[:#]?\s*[0-9Xx*•-]{4,}/gi

/** Mask anything that looks like an SSN, Medicare number or account number. */
export function redact(text: string): string {
  return text
    .replace(LABELED_ID, (m, label: string, _sep: string, value: string) =>
      /\d/.test(value) ? `${label} ${MASK}` : m,
    )
    .replace(MBI, MASK)
    .replace(SSN, MASK)
    .replace(LONG_NUMBER, (m) => (DATE_SHAPE.test(m) ? m : MASK))
    .replace(LABELED_ACCOUNT, (_m, word: string, label: string) => `${word}${label} ${MASK}`)
}

/** Redact, collapse whitespace and cap the length of a snippet. */
export function toSnippet(text: string, max = 110): string {
  const clean = redact(text).replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean
}
