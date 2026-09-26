// The fictional demo family. Sample documents, seed data and tests all read
// from here so the numbers agree everywhere. Every value is invented.

export const SAMPLE = {
  household: {
    care_recipient_alias: 'Helen Park',
    caregiver_alias: 'Grace',
    state: 'WA',
    dementia_dx: true,
    household_size: 1 as const,
    invite_code: 'PARK-4821',
  },
  members: [
    { alias: 'Grace', relation: 'Daughter (main caregiver)', role: 'caregiver' as const },
    { alias: 'Daniel', relation: 'Son, lives 2 hours away', role: 'family' as const },
    { alias: 'Anna', relation: 'Daughter, lives out of state', role: 'family' as const },
  ],
  facts: {
    birth_date: '1945-03-14',
    medicare_parts: ['A', 'B'] as ('A' | 'B' | 'D')[],
    /** Social Security benefit per month, in cents. */
    monthly_income_cents: 142000,
    /** Checking + savings on the latest statement, in cents. */
    bank_balance_cents: 320000,
  },
  /** Display-only details printed on the fake documents. */
  docs: {
    person_name: 'HELEN M PARK',
    address: '1847 Alder Street, Tacoma, WA 98405',
    medicare_part_a_since: '2010-03-01',
    medicare_part_b_since: '2010-03-01',
    ssa_letter_date: 'December 2, 2025',
    bank_name: 'Evergreen Community Credit Union',
    statement_period: 'August 1 - August 31, 2026',
    tax_year: 2025,
    /** Form 1040 line 6a, Social Security benefits, in cents. */
    tax_ss_benefits_cents: 1704000,
  },
} as const
