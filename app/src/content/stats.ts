// Every number on the landing page lives here with its source, so the
// Sources page and the superscript citations never disagree.

import { PART_B_2026_CENTS, perYear } from '@/lib/money'

export interface Stat {
  /** Anchor id on #/sources, e.g. #/sources#benefits-gap */
  id: string
  /** The figure as displayed, e.g. "$58B". */
  value: string
  label: string
  detail: string
  source_name: string
  source_url: string
  /** Year the figure applies to (or the year the page was checked). */
  year: number
}

export const STATS: Stat[] = [
  {
    id: 'benefits-gap',
    value: '$58B',
    label: 'a year goes unclaimed by eligible older adults',
    detail: 'Across just three programs: SNAP, SSI and Medicare Savings Programs.',
    source_name: 'NCOA, The $58 Billion Benefits Gap',
    source_url: 'https://www.ncoa.org/article/the-58-billion-benefits-gap-affecting-older-adults/',
    year: 2026,
  },
  {
    id: 'snap-participation',
    value: '38%',
    label: 'of eligible adults 65+ get SNAP',
    detail: 'Most older adults who qualify for food help never receive it.',
    source_name: 'NCOA, The $58 Billion Benefits Gap',
    source_url: 'https://www.ncoa.org/article/the-58-billion-benefits-gap-affecting-older-adults/',
    year: 2026,
  },
  {
    id: 'msp-participation',
    value: '49%',
    label: 'Medicare Savings Program participation',
    detail: 'About half of the people who qualify are enrolled.',
    source_name: 'NCOA, The $58 Billion Benefits Gap',
    source_url: 'https://www.ncoa.org/article/the-58-billion-benefits-gap-affecting-older-adults/',
    year: 2026,
  },
  {
    id: 'caregiver-costs',
    value: '$7,242',
    label: 'a year out of pocket for the average family caregiver',
    detail: 'That is 26% of their income. The survey covers caregivers of all conditions, not only dementia.',
    source_name: 'AARP, Caregiving Out-of-Pocket Costs Study',
    source_url: 'https://www.aarp.org/pri/topics/ltss/family-caregiving/family-caregivers-cost-survey/',
    year: 2021,
  },
  {
    id: 'dementia-caregivers',
    value: '13M',
    label: 'unpaid dementia caregivers in the US',
    detail: 'Nearly 13 million family members and friends care for someone with Alzheimer\'s or another dementia.',
    source_name: "Alzheimer's Association, Facts and Figures",
    source_url: 'https://www.alz.org/alzheimers-dementia/facts-figures',
    year: 2026,
  },
  {
    id: 'caregivers-us',
    value: '63M',
    label: 'family caregivers in the US',
    detail: '7 in 10 are employed, and a quarter have taken on debt.',
    source_name: 'AARP and NAC, Caregiving in the US 2025',
    source_url: 'https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/',
    year: 2025,
  },
  {
    id: 'guide-respite',
    value: '$2,500',
    label: 'a year in respite care through Medicare GUIDE',
    detail: 'GUIDE covers respite "up to $2,500 annually" through participating dementia care providers. There is no application: you find a provider.',
    source_name: 'CMS, GUIDE Model',
    source_url: 'https://www.cms.gov/priorities/innovation/innovation-models/guide',
    year: 2026,
  },
  {
    id: 'part-b-premium',
    value: '$202.90',
    label: 'a month: the 2026 standard Part B premium',
    detail: 'A Medicare Savings Program pays it, which is $2,434.80 a year back in the household budget.',
    source_name: 'Medicare.gov, Medicare costs',
    source_url: 'https://www.medicare.gov/basics/costs/medicare-costs',
    year: 2026,
  },
  {
    id: 'extra-help-value',
    value: '$5,700',
    label: 'a year: what Extra Help is worth, about',
    detail: "Social Security's estimate of the yearly value of Extra Help with drug plan costs.",
    source_name: 'NCOA, Benefits of the Part D Low-Income Subsidy',
    source_url: 'https://www.ncoa.org/article/what-are-the-benefits-of-medicare-part-d-low-income-subsidy-lis/',
    year: 2026,
  },
  {
    id: 'benefitscheckup',
    value: '2,000+',
    label: 'programs screened by NCOA BenefitsCheckUp',
    detail: 'A free screener that returns a report with Apply Online links and blank forms.',
    source_name: 'NCOA, What is BenefitsCheckUp',
    source_url: 'https://benefitscheckup.org/article/what-is-benefitscheckup',
    year: 2026,
  },
  {
    id: 'wa-msp-form',
    value: '8',
    label: 'sections on Washington\'s Medicare Savings Program application',
    detail: "It asks for every household member's Social Security number, proof when asked, and a signature attesting to everything.",
    source_name: 'Washington HCA, form 13-691',
    source_url: 'https://www.hca.wa.gov/assets/free-or-low-cost/13-691.pdf',
    year: 2026,
  },
]

export function getStat(id: string): Stat | undefined {
  return STATS.find((s) => s.id === id)
}

/** 1-based citation number for a stat id (0 if unknown). */
export function citationNumber(id: string): number {
  return STATS.findIndex((s) => s.id === id) + 1
}

/** The landing-page estimate for the sample family. The app itself computes
 *  its counter with the rules engine; this is only the marketing preview. */
export const HEADLINE_ESTIMATE = {
  msp_cents: perYear(PART_B_2026_CENTS),
  extra_help_cents: 570000,
  get total_cents(): number {
    return this.msp_cents + this.extra_help_cents
  },
}
