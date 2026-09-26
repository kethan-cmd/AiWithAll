// Application drafts. Pure: confirmed facts and the household in, a list of
// labeled fields out. Modeled on the key fields of Washington HCA 13-691
// (Medicare Savings Programs) and SSA-1020 (Extra Help). Social Security and
// Medicare numbers and every signature are always left blank: a person
// writes them in by hand.

import type { BuildDraftFn, DocKind, Draft, DraftField, Fact, FactKey, Household } from '@/contracts'
import { DOC_LABELS } from '@/contracts'
import { latestConfirmed, money } from '@/rules/engine'
import { MSP_HAS_RESOURCE_TEST, PROGRAM_SOURCES } from '@/rules/rules2026'

/** Human label for where a draft value came from. */
export function sourceLabel(source: DraftField['source']): string {
  if (source === null) return ''
  if (source === 'household') return 'your family details'
  if (source === 'manual') return 'typed by you'
  return DOC_LABELS[source]
}

export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function sourceOf(facts: Fact[], key: FactKey): DocKind | 'manual' {
  return latestConfirmed(facts, key)?.source ?? 'manual'
}

function byHand(id: string, label: string, form_ref: string, note: string): DraftField {
  return { id, label, form_ref, value: null, source: null, fill_by_hand: true, note }
}

function filled(
  id: string,
  label: string,
  form_ref: string,
  value: string,
  source: NonNullable<DraftField['source']>,
  note?: string,
): DraftField {
  return { id, label, form_ref, value, source, fill_by_hand: false, ...(note ? { note } : {}) }
}

const SSN_NOTE = 'Write this in yourself. The app never reads or stores Social Security numbers.'
const MEDICARE_NOTE = 'Copy it from the red, white and blue card. The app never reads or stores it.'

function partsValue(parts: string[]): string {
  const sorted = [...parts].sort()
  return sorted.length ? sorted.map((p) => `Part ${p}`).join(', ').replace(/, (?=[^,]*$)/, ' and ') : 'None'
}

/** What is still needed before the form can go in, from the facts' sources. */
function stillNeeded(program: Draft['program'], facts: Fact[], h: Household): string[] {
  const out: string[] = []
  out.push(`${h.care_recipient_alias}'s Social Security number and Medicare number, written in by hand`)
  if (sourceOf(facts, 'monthly_income') !== 'ssa_letter') {
    out.push('Proof of monthly income: the latest Social Security award letter')
  }
  if (sourceOf(facts, 'bank_balance') !== 'bank_statement') {
    out.push('The latest statement for every bank account')
  }
  if (program === 'msp') {
    if (sourceOf(facts, 'medicare_parts') !== 'medicare_card') out.push('A copy of the Medicare card (front)')
    out.push('Home address and phone number')
    out.push(`A signature from ${h.care_recipient_alias}, or from ${h.caregiver_alias} as authorized representative`)
  } else {
    out.push('Any other income (pensions, rent, work) and the value of life insurance, if any')
    out.push(`A signature from ${h.care_recipient_alias}, or from the person helping who fills it in`)
  }
  out.push('A free SHIP counselor to look it over before it is sent')
  return out
}

function buildMsp(f: Parameters<BuildDraftFn>[1], facts: Fact[], h: Household): Draft {
  const A = 'Applicant'
  const I = 'Income'
  const R = 'Resources'
  const S = 'Authorized representative and signature'
  const fields: DraftField[] = [
    filled('name', 'Applicant name', A, h.care_recipient_alias, 'household'),
    filled('dob', 'Date of birth', A, formatLongDate(f.birth_date), sourceOf(facts, 'birth_date')),
    byHand('ssn', 'Social Security number', A, SSN_NOTE),
    byHand('address', 'Home address', A, 'Where the applicant lives now. Fill by hand.'),
    filled('medicare_parts', 'Medicare coverage', A, partsValue(f.medicare_parts), sourceOf(facts, 'medicare_parts')),
    byHand('medicare_number', 'Medicare number', A, MEDICARE_NOTE),
    filled(
      'household_size',
      'People in the household',
      A,
      h.household_size === 2 ? '2 (applicant and spouse)' : '1 (applicant only)',
      'household',
    ),
    filled(
      'income',
      'Monthly Social Security benefit (before deductions)',
      I,
      `${money(f.monthly_income_cents)} per month`,
      sourceOf(facts, 'monthly_income'),
    ),
    filled(
      'resources',
      'Money in checking and savings',
      R,
      money(f.bank_balance_cents),
      sourceOf(facts, 'bank_balance'),
      MSP_HAS_RESOURCE_TEST.value ? undefined : 'Washington does not count savings for this program, but the form may still ask.',
    ),
    filled(
      'rep',
      'Authorized representative',
      S,
      h.caregiver_alias,
      'household',
      'The person who may sign and talk to the state on the applicant’s behalf. Add relationship and phone by hand.',
    ),
    byHand('signature', 'Signature and date', S, 'Signed by a person, never by the app.'),
  ]
  return {
    program: 'msp',
    form_name: 'Application for Medicare Savings Programs',
    form_url: PROGRAM_SOURCES.msp_form_wa,
    fields,
    still_needed: stillNeeded('msp', facts, h),
  }
}

function buildExtraHelp(f: Parameters<BuildDraftFn>[1], facts: Fact[], h: Household): Draft {
  const A = 'About the applicant'
  const I = 'Income'
  const R = 'Resources'
  const S = 'Signature'
  const fields: DraftField[] = [
    filled('name', 'Name', A, h.care_recipient_alias, 'household'),
    byHand('ssn', 'Social Security number', A, SSN_NOTE),
    filled('dob', 'Date of birth', A, formatLongDate(f.birth_date), sourceOf(facts, 'birth_date')),
    byHand('medicare_number', 'Medicare number', A, MEDICARE_NOTE),
    filled(
      'marital',
      'Married and living with a spouse?',
      A,
      h.household_size === 2 ? 'Yes' : 'No',
      'household',
    ),
    filled(
      'income',
      'Social Security benefit per month',
      I,
      `${money(f.monthly_income_cents)} per month`,
      sourceOf(facts, 'monthly_income'),
    ),
    filled('bank', 'Bank accounts (checking and savings)', R, money(f.bank_balance_cents), sourceOf(facts, 'bank_balance')),
    filled(
      'helper',
      'Person helping with this application',
      S,
      h.caregiver_alias,
      'household',
      'Add relationship, address and phone by hand.',
    ),
    byHand('signature', 'Signature and date', S, 'Signed by a person, never by the app.'),
  ]
  return {
    program: 'extra_help',
    form_name: 'Application for Extra Help with Medicare Prescription Drug Plan Costs',
    form_url: PROGRAM_SOURCES.ssa_1020_online,
    fields,
    still_needed: stillNeeded('extra_help', facts, h),
  }
}

/** Official form number shown on the draft header. */
export const FORM_NUMBERS: Record<Draft['program'], { number: string; agency: string }> = {
  msp: { number: 'HCA 13-691', agency: 'Washington State Health Care Authority' },
  extra_help: { number: 'SSA-1020', agency: 'Social Security Administration' },
}

export const buildDraft: BuildDraftFn = (program, f, facts, h) =>
  program === 'msp' ? buildMsp(f, facts, h) : buildExtraHelp(f, facts, h)
