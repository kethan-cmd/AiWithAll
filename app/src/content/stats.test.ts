import { STATS, HEADLINE_ESTIMATE, citationNumber } from './stats'
import { FAQ } from './faq'

describe('STATS', () => {
  it('has unique ids and https sources', () => {
    const ids = STATS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of STATS) expect(s.source_url.startsWith('https://')).toBe(true)
  })
  it('numbers citations from 1', () => {
    expect(citationNumber('benefits-gap')).toBe(1)
    expect(citationNumber('nope')).toBe(0)
  })
  it('headline estimate is Part B x 12 plus Extra Help', () => {
    expect(HEADLINE_ESTIMATE.msp_cents).toBe(243480)
    expect(HEADLINE_ESTIMATE.total_cents).toBe(813480)
  })
  it('copy has no em dashes', () => {
    const text = JSON.stringify([STATS, FAQ])
    expect(text.includes(String.fromCharCode(0x2014))).toBe(false)
  })
})
