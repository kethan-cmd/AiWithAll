// Monthly income from a Social Security letter. Benefit letters list the
// benefit before deductions, the Medicare premium taken out, and the amount
// paid. Programs count the amount before deductions, so that label wins.
// A tax return can stand in (line 6a, yearly, divided by 12) as a low
// confidence guess.

import type { Confidence } from '@/contracts'
import { findMoney, isAmountLike, loose, toLines, type Found, type MoneyToken } from './text'

const LABELS: { re: RegExp; score: number }[] = [
  { re: /before deductions?/, score: 6 },
  { re: /new benefit amount|monthly benefit|benefit amount|monthly social security/, score: 5 },
  { re: /(social security|ssa|retirement) (benefit|payment)/, score: 4 },
  { re: /monthly (amount|payment|income)/, score: 4 },
  { re: /you will (receive|get)|we will pay|amount (you|we) will|net (payment|amount)/, score: 2 },
  { re: /\bbenefits?\b|\bmonthly\b|\bper month\b/, score: 2 },
  { re: /\bamount\b/, score: 1 },
]

/** Lines about money taken out, not money coming in. */
const DEDUCTION = /premium|deducted|withh[eo]ld|\btax\b|part b|medical insurance/

const MIN_MONTHLY = 5000 // $50
const MAX_MONTHLY = 2_000_000 // $20,000

function labelScore(line: string): number {
  const l = loose(line)
  if (DEDUCTION.test(l) && !/before deductions?/.test(l)) return -1
  let best = 0
  for (const { re, score } of LABELS) if (re.test(l) && score > best) best = score
  return best
}

function pickAmount(tokens: MoneyToken[]): MoneyToken | undefined {
  const good = tokens.filter((t) => isAmountLike(t) && t.cents >= MIN_MONTHLY && t.cents <= MAX_MONTHLY)
  return good[good.length - 1]
}

interface Candidate {
  score: number
  token: MoneyToken
  line: string
  nextLine: boolean
}

export function parseIncome(text: string): Found | null {
  const lines = toLines(text)
  let best: Candidate | null = null
  const consider = (c: Candidate) => {
    if (!best || c.score > best.score) best = c
  }

  for (let i = 0; i < lines.length; i++) {
    const score = labelScore(lines[i])
    if (score <= 0) continue
    const token = pickAmount(findMoney(lines[i]))
    if (token) {
      consider({ score, token, line: lines[i], nextLine: false })
      continue
    }
    // Label on one line, amount on the next (OCR often splits columns).
    const next = lines[i + 1]
    if (next && labelScore(next) === 0) {
      const t = pickAmount(findMoney(next))
      if (t) consider({ score: score - 1, token: t, line: `${lines[i]} ${next}`, nextLine: true })
    }
  }

  const found = best as Candidate | null
  if (found) {
    let confidence: Confidence
    if (found.score >= 4) confidence = found.token.fuzzy || found.nextLine ? 'medium' : 'high'
    else if (found.score >= 2) confidence = found.token.hasDollar ? 'medium' : 'low'
    else confidence = 'low'
    return {
      key: 'monthly_income',
      value: { key: 'monthly_income', cents: found.token.cents },
      confidence,
      line: found.line,
      needles: [found.token.raw],
    }
  }

  // Nothing labeled: the first dollar amount in range is a guess.
  for (const line of lines) {
    if (labelScore(line) < 0) continue
    const t = findMoney(line).find((m) => m.hasDollar && m.hasCents && m.cents >= MIN_MONTHLY && m.cents <= MAX_MONTHLY)
    if (t) {
      return {
        key: 'monthly_income',
        value: { key: 'monthly_income', cents: t.cents },
        confidence: 'low',
        line,
        needles: [t.raw],
      }
    }
  }
  return null
}

/** Form 1040 line 6a: yearly Social Security benefits, divided by 12. */
export function parseIncomeFromTaxReturn(text: string): Found | null {
  for (const line of toLines(text)) {
    // On a real 1040, 6a and 6b share one row ("6a Social security benefits
    // 6a 18,504 b Taxable amount 6b 0"). Read only the part before 6b.
    const head = line.split(/\b6b\b|\bb\s+taxable/i)[0]
    const l = loose(head)
    if (!/\b6a\b|social security benefits/.test(l)) continue
    if (/taxable/.test(l)) continue
    // Form amounts are often whole dollars with a thousands comma ("18,504").
    const tokens = findMoney(head).filter(
      (t) => (isAmountLike(t) || /\d,\d{3}/.test(t.raw)) && t.cents >= MIN_MONTHLY * 12,
    )
    const t = tokens[tokens.length - 1]
    if (!t) continue
    return {
      key: 'monthly_income',
      value: { key: 'monthly_income', cents: Math.round(t.cents / 12) },
      confidence: 'low',
      line: `${line} (yearly, divided by 12)`,
      needles: [t.raw],
    }
  }
  return null
}
