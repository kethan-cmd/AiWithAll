import { formatAbout, formatUSD, parseUSD, perYear, PART_B_2026_CENTS } from './money'

describe('money', () => {
  it('formats cents', () => {
    expect(formatUSD(164000)).toBe('$1,640.00')
    expect(formatUSD(243480, { whole: true })).toBe('$2,435')
  })
  it('parses common money text', () => {
    expect(parseUSD('$1,640.00')).toBe(164000)
    expect(parseUSD('1,640')).toBe(164000)
    expect(parseUSD('Balance: $3,200.5')).toBe(320050)
    expect(parseUSD('no money here')).toBeNull()
  })
  it('annualizes the Part B premium', () => {
    expect(perYear(PART_B_2026_CENTS)).toBe(243480)
  })
  it('rounds headline estimates to the nearest $100', () => {
    expect(formatAbout(813480)).toBe('about $8,100')
  })
})
