// Rules data for Money on the Table, 2026. Constant data only: the matching
// logic lives in the rules engine, not here.
//
// Every limit is integer cents and carries the page it came from, the date it
// was checked and whether a human-readable primary page was actually opened
// to confirm it (verified: true). Screens show RULES_AS_OF and RULESET_LABEL
// so nobody mistakes an estimate for a promise.
//
// Ruleset choice: the demo household lives in Washington, and Washington is
// more generous than the federal baseline (no resource test for the Medicare
// Savings Programs, and higher income bands: QMB 110%, SLMB 120%, QI-1 138% of
// the poverty level). Using the federal numbers would wrongly tell some
// Washington families they have too much in the bank. So MSP matching uses
// Washington's 2026 standards; the federal baseline is kept below for
// reference and for other states. Extra Help is a federal program with one
// national set of limits.

/** Unit of a money rule. All values are integer cents. */
export type RuleUnit = 'cents_per_month' | 'cents' | 'cents_per_year'

/** One sourced number from the rules table. */
export interface RuleValue {
  /** Integer cents, in the given unit. */
  value: number
  unit: RuleUnit
  /** Date the source says the value applies from, or the year it covers (YYYY-MM-DD). */
  as_of: string
  source_url: string
  source_name: string
  /** True only when the number was read on a page we actually opened. */
  verified: boolean
  note?: string
}

/** A sourced yes/no rule. */
export interface RuleFlag {
  value: boolean
  as_of: string
  source_url: string
  source_name: string
  verified: boolean
  note?: string
}

/** Date these rules were last checked against the sources (shown on screen). */
export const RULES_AS_OF = '2026-09-26'

/** Short label for the rule set, shown next to every "Likely match". */
export const RULESET_LABEL = 'Washington, 2026'

/** Longer explanation for a tooltip or footnote under the label. */
export const RULESET_NOTE =
  'Medicare Savings Program limits are Washington State standards (effective April 1, 2026). Extra Help limits are national. Other states may use different limits.'

// ------------------------------------------------------------- source URLs

const HCA_STANDARDS_URL = 'https://www.hca.wa.gov/assets/free-or-low-cost/income-standards.pdf'
const HCA_STANDARDS_NAME = 'Washington HCA 19-0096, Apple Health Income and Resource Standards (July 2026)'
const HCA_FLYER_URL = 'https://www.hca.wa.gov/assets/free-or-low-cost/22-500.pdf'
const WAC_MSP_URL = 'https://app.leg.wa.gov/wac/default.aspx?cite=182-517-0100'
const MEDICARE_MSP_URL = 'https://www.medicare.gov/basics/costs/help/medicare-savings-programs'
const MEDICARE_DRUG_HELP_URL = 'https://www.medicare.gov/basics/costs/help/drug-costs'
const MEDICARE_COSTS_URL = 'https://www.medicare.gov/basics/costs/medicare-costs'
const NCOA_LIS_URL =
  'https://www.ncoa.org/article/what-are-the-benefits-of-medicare-part-d-low-income-subsidy-lis/'
const CMS_GUIDE_URL = 'https://www.cms.gov/priorities/innovation/innovation-models/guide'
const CMS_GUIDE_FAQ_URL = 'https://www.cms.gov/priorities/innovation/guide/faqs'

const WA_MSP_NOTE =
  'Compare to gross monthly income. This figure already includes the $20 general income disregard (HCA 22-500 lists the same band as the lower number after subtracting $20 yourself).'

function waMsp(value: number, note = WA_MSP_NOTE): RuleValue {
  return {
    value,
    unit: 'cents_per_month',
    as_of: '2026-04-01',
    source_url: HCA_STANDARDS_URL,
    source_name: HCA_STANDARDS_NAME,
    verified: true,
    note,
  }
}

function fedMsp(value: number, unit: RuleUnit): RuleValue {
  return {
    value,
    unit,
    as_of: '2026-01-01',
    source_url: MEDICARE_MSP_URL,
    source_name: 'Medicare.gov, Medicare Savings Programs',
    verified: true,
  }
}

// ------------------------------------------------------------ MSP limits

/**
 * $20 general income disregard (one per household). Already built into every
 * MSP_LIMITS income figure below, so the engine must NOT subtract it again.
 * Exported so the UI can explain the math.
 */
export const INCOME_DISREGARD_MONTHLY: RuleValue = {
  value: 2000,
  unit: 'cents_per_month',
  as_of: '2026-04-01',
  source_url: HCA_FLYER_URL,
  source_name: 'Washington HCA 22-500, Medicare Savings Programs flyer (May 2026)',
  verified: true,
  note: 'Flyer step 2: "Deduct $20 (one deduction per household)". HCA 19-0096 says its MSP table "Includes $20 disregard".',
}

/** True when MSP_LIMITS applies a resource (savings) limit. Washington has none. */
export const MSP_HAS_RESOURCE_TEST: RuleFlag = {
  value: false,
  as_of: '2026-01-19',
  source_url: WAC_MSP_URL,
  source_name: 'WAC 182-517-0100, Federal Medicare savings programs',
  verified: true,
  note: 'Rule text: "The federal MSPs do not require a resource test." Washington Law Help also says there is no asset limit for MSP.',
}

/**
 * Medicare Savings Program monthly income limits used for matching
 * (Washington, effective 2026-04-01). Tiers are exclusive bands: at or under
 * QMB is QMB; over QMB and at or under SLMB is SLMB; over SLMB and at or under
 * QI is QI. Compare gross monthly income (the $20 disregard is already in).
 * Resource limits are null because Washington has no MSP resource test.
 */
export const MSP_LIMITS: {
  QMB: { income_individual: RuleValue; income_couple: RuleValue }
  SLMB: { income_individual: RuleValue; income_couple: RuleValue }
  QI: { income_individual: RuleValue; income_couple: RuleValue }
  resources_individual: RuleValue | null
  resources_couple: RuleValue | null
} = {
  QMB: { income_individual: waMsp(148300), income_couple: waMsp(200400) },
  SLMB: { income_individual: waMsp(161600), income_couple: waMsp(218500) },
  QI: {
    income_individual: waMsp(185500),
    income_couple: waMsp(
      251000,
      `${WA_MSP_NOTE} QI-1 is paid until the state's yearly federal allotment runs out.`,
    ),
  },
  resources_individual: null,
  resources_couple: null,
}

/**
 * Federal baseline MSP limits for 2026 (Medicare.gov), for reference and for
 * households outside Washington. These income figures also include the $20
 * disregard (QMB $1,350 = 100% of poverty level $1,330 + $20).
 */
export const MSP_FEDERAL_BASELINE = {
  label: 'Federal baseline, 2026 (your state may be more generous)',
  QMB: {
    income_individual: fedMsp(135000, 'cents_per_month'),
    income_couple: fedMsp(182400, 'cents_per_month'),
  },
  SLMB: {
    income_individual: fedMsp(161600, 'cents_per_month'),
    income_couple: fedMsp(218400, 'cents_per_month'),
  },
  QI: {
    income_individual: fedMsp(181600, 'cents_per_month'),
    income_couple: fedMsp(245500, 'cents_per_month'),
  },
  resources_individual: fedMsp(995000, 'cents'),
  resources_couple: fedMsp(1491000, 'cents'),
} as const

// ----------------------------------------------------- Extra Help limits

/**
 * Extra Help (Medicare Part D Low-Income Subsidy) limits for 2026. National.
 * Income is 150% of the 2026 poverty level ($15,960 single, $21,640 couple),
 * stored monthly. SSA also subtracts a $20 disregard from countable income,
 * which is NOT built in here, so comparing gross income is slightly
 * conservative. Resource limits include the $1,500 per person burial
 * allowance (HCA lists $16,590 / $33,100 without it).
 */
export const EXTRA_HELP_LIMITS: {
  income_individual: RuleValue
  income_couple: RuleValue
  resources_individual: RuleValue
  resources_couple: RuleValue
} = {
  income_individual: {
    value: 199500,
    unit: 'cents_per_month',
    as_of: '2026-01-01',
    source_url: MEDICARE_DRUG_HELP_URL,
    source_name: 'Medicare.gov, Help with drug costs',
    verified: true,
    note: 'Medicare.gov lists $23,940 a year; stored as $1,995 a month.',
  },
  income_couple: {
    value: 270500,
    unit: 'cents_per_month',
    as_of: '2026-01-01',
    source_url: MEDICARE_DRUG_HELP_URL,
    source_name: 'Medicare.gov, Help with drug costs',
    verified: true,
    note: 'Medicare.gov lists $32,460 a year; stored as $2,705 a month.',
  },
  resources_individual: {
    value: 1809000,
    unit: 'cents',
    as_of: '2026-01-01',
    source_url: MEDICARE_DRUG_HELP_URL,
    source_name: 'Medicare.gov, Help with drug costs',
    verified: true,
  },
  resources_couple: {
    value: 3610000,
    unit: 'cents',
    as_of: '2026-01-01',
    source_url: MEDICARE_DRUG_HELP_URL,
    source_name: 'Medicare.gov, Help with drug costs',
    verified: true,
  },
}

/**
 * People who get help paying Part B premiums from a Medicare Savings Program
 * (QMB, SLMB or QI) automatically qualify for Extra Help and do not need to
 * apply. So an MSP match implies an Extra Help match, even if the Extra Help
 * resource check alone would fail.
 */
export const MSP_DEEMS_EXTRA_HELP: RuleFlag = {
  value: true,
  as_of: '2026-01-01',
  source_url: MEDICARE_DRUG_HELP_URL,
  source_name: 'Medicare.gov, Help with drug costs',
  verified: true,
  note: 'Automatic for: full Medicaid, a Medicare Savings Program, or SSI. Medicare.gov MSP page repeats "You\'ll also get Extra Help" for QMB, SLMB and QI. Filing SSA-1020 is still harmless while the MSP is pending.',
}

// ------------------------------------------------------------ dollar values

/**
 * Dollar values behind the "$ in progress" counter.
 * part_b_premium_monthly x 12 = $2,434.80 a year saved by SLMB or QI (QMB also
 * pays Part A premiums and cost sharing, not counted here to stay
 * conservative). extra_help_annual is SSA's estimate as quoted by NCOA.
 */
export const VALUES: {
  part_b_premium_monthly: RuleValue
  extra_help_annual: RuleValue
  guide_respite_annual_max: RuleValue
} = {
  part_b_premium_monthly: {
    value: 20290,
    unit: 'cents_per_month',
    as_of: '2026-01-01',
    source_url: MEDICARE_COSTS_URL,
    source_name: 'Medicare.gov, Medicare costs',
    verified: true,
    note: 'Standard 2026 Part B premium. Higher earners pay more; MSP pays the standard amount.',
  },
  extra_help_annual: {
    value: 570000,
    unit: 'cents_per_year',
    as_of: '2026-01-01',
    source_url: NCOA_LIS_URL,
    source_name: 'NCOA, citing Social Security Administration',
    verified: true,
    note: 'SSA estimate, "about $5,700 a year". Actual value depends on the person\'s drugs.',
  },
  guide_respite_annual_max: {
    value: 250000,
    unit: 'cents_per_year',
    as_of: '2024-07-01',
    source_url: CMS_GUIDE_URL,
    source_name: 'CMS, GUIDE Model',
    verified: true,
    note: 'Respite "up to $2,500 annually", only through a participating GUIDE provider. A cap, not a guaranteed amount.',
  },
}

// ----------------------------------------------------------------- GUIDE

/**
 * GUIDE (Guiding an Improved Dementia Experience) model basics. There is no
 * application form: a person joins through a participating provider, so the
 * app turns GUIDE into a "find a GUIDE provider" task.
 */
export const GUIDE_RULES: {
  requires: string[]
  excludes: string[]
  how_to_join: string
  model_dates: string
  source_url: string
  faq_url: string
  verified: boolean
} = {
  requires: [
    'A dementia diagnosis, confirmed by a clinician at a GUIDE provider',
    'Original Medicare with both Part A and Part B',
    'Medicare is the primary payer',
    'Lives at home or in an approved residential care community',
  ],
  excludes: [
    'Medicare Advantage (including Special Needs Plans)',
    'PACE',
    'Medicare hospice',
    'Long-term nursing home residents',
  ],
  how_to_join: 'Through a participating GUIDE provider; there is no application to file.',
  model_dates: 'Started July 1, 2024; runs 8 years',
  source_url: CMS_GUIDE_URL,
  faq_url: CMS_GUIDE_FAQ_URL,
  verified: true,
}

// --------------------------------------------------------------- sources

/** Where each program lives, for "Learn more" links and task instructions. */
export const PROGRAM_SOURCES = {
  /** Washington MSP page (HCA). */
  msp: 'https://www.hca.wa.gov/free-or-low-cost-health-care/i-need-medical-dental-or-vision-care/medicare-savings-program',
  /** National MSP overview (Medicare.gov). */
  msp_federal: MEDICARE_MSP_URL,
  /** Washington MSP flyer with the income chart. */
  msp_flyer_wa: HCA_FLYER_URL,
  /** Washington MSP paper application (HCA 13-691). Link checked: returns a PDF. */
  msp_form_wa: 'https://www.hca.wa.gov/assets/free-or-low-cost/13-691.pdf',
  extra_help: MEDICARE_DRUG_HELP_URL,
  guide: CMS_GUIDE_URL,
  guide_faq: CMS_GUIDE_FAQ_URL,
  /** Official national SHIP locator (SHIP TA Center, ACL). */
  ship_locator: 'https://www.shiphelp.org',
  /** Washington's SHIP is called SHIBA (Office of the Insurance Commissioner). */
  ship_wa: 'https://www.insurance.wa.gov/shiba',
  /** SSA-1020 Extra Help paper form (ssa.gov blocks automated checks; link not opened). */
  ssa_1020: 'https://www.ssa.gov/forms/ssa-1020.pdf',
  /** SSA-1020 online application. Link checked: loads. */
  ssa_1020_online: 'https://secure.ssa.gov/i1020/start',
} as const
