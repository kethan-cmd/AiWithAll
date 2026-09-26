// Bank balance from a statement: "Ending balance", "Closing balance",
// "New balance", "Available balance". Beginning and average balances are
// ignored. Separate checking and savings ending balances are added up.

import type { Confidence } from '@/contracts'
import { findMoney, isAmountLike, loose, toLines, type Found, type MoneyToken } from './text'

const LABELS: { re: RegExp; score: number }[] = [
  { re: /end[il1]ng (daily )?balance|clos[il1]ng balance|balance at (the )?end|statement balance|end(ing)? of period/, score: 5 },
  { re: /new balance|ava[il1]lable balance|current balance|total balance/, score: 4 },
  { re: /\bbalance\b/, score: 1 },
]
const NOT_THIS = /beginning|opening|previous|starting|prior|minimum|average|daily ledger/

function labelScore(line: string): number {
  const l = loose(line)
  if (NOT_THIS.test(l)) return 0
  let best = 0
  for (const { re, score } of LABELS) if (re.test(l) && score > best) best = score
  return best
}

function lastAmount(tokens: MoneyToken[]): MoneyToken | undefined {
  const good = tokens.filter(isAmountLike)
  return good[good.length - 1]
}

function account(line: string): 'checking' | 'savings' | null {
  const l = loose(line)
  if (/checking|share draft/.test(l)) return 'checking'
  if (/savings|\bshares?\b/.test(l)) return 'savings'
  return null
}

export function parseBalance(text: string): Found | null {
  const lines = toLines(text)
  const found: { score: number; token: MoneyToken; line: string; nextLine: boolean }[] = []

  for (let i = 0; i < lines.length; i++) {
    const score = labelScore(lines[i])
    if (score === 0) continue
    const t = lastAmount(findMoney(lines[i]))
    if (t) {
      found.push({ score, token: t, line: lines[i], nextLine: false })
      continue
    }
    const next = lines[i + 1]
    if (next && labelScore(next) === 0) {
      const tn = lastAmount(findMoney(next))
      if (tn) found.push({ score: score - 1, token: tn, line: `${lines[i]} ${next}`, nextLine: true })
    }
  }
  if (!found.length) return null

  const top = Math.max(...found.map((f) => f.score))
  const best = found.filter((f) => f.score === top)

  // Checking and savings each with their own ending balance: add them.
  const byAccount = new Map<string, (typeof best)[number]>()
  for (const f of best) {
    const a = account(f.line)
    if (a && !byAccount.has(a)) byAccount.set(a, f)
  }
  if (byAccount.size === 2 && top >= 4) {
    const parts = [...byAccount.values()]
    const cents = parts.reduce((s, p) => s + p.token.cents, 0)
    return {
      key: 'bank_balance',
      value: { key: 'bank_balance', cents },
      confidence: 'medium',
      line: parts.map((p) => p.line).join(' + '),
      needles: parts.map((p) => p.token.raw),
    }
  }

  const pick = best[0]
  let confidence: Confidence
  if (top >= 4) confidence = pick.token.fuzzy || pick.nextLine ? 'medium' : 'high'
  else confidence = 'low'
  return {
    key: 'bank_balance',
    value: { key: 'bank_balance', cents: pick.token.cents },
    confidence,
    line: pick.line,
    needles: [pick.token.raw],
  }
}
