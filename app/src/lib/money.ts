// Money helpers. Everything is integer cents so totals never drift.

/** 2026 standard Medicare Part B premium: $202.90/month (medicare.gov). */
export const PART_B_2026_CENTS = 20290

export function formatUSD(cents: number, opts: { whole?: boolean } = {}): string {
  const whole = opts.whole ?? false
  const value = whole ? Math.round(cents / 100) : cents / 100
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })
}

/** Parse "$1,640.00", "1,640", "1640.5" into cents. Null if no number found. */
export function parseUSD(text: string): number | null {
  const m = text.replace(/\s/g, '').match(/-?\$?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?/)
  if (!m) return null
  const dollars = Number(m[1].replace(/,/g, ''))
  const centsPart = m[2] ? Number(m[2].padEnd(2, '0')) : 0
  const sign = m[0].startsWith('-') ? -1 : 1
  return sign * (dollars * 100 + centsPart)
}

/** Monthly cents to yearly cents. */
export function perYear(monthlyCents: number): number {
  return monthlyCents * 12
}

/** "about $8,100" style rounding for headline estimates (nearest $100). */
export function formatAbout(cents: number): string {
  return `about ${formatUSD(Math.round(cents / 10000) * 10000, { whole: true })}`
}
