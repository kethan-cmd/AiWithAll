// Words and icons for each document tile, in one place.

import type { LucideIcon } from 'lucide-react'
import { CreditCard, FileText, Landmark, ReceiptText } from 'lucide-react'
import type { DocKind, FactKey } from '@/contracts'

export interface DocCopy {
  /** The fact this document gives us. */
  fact: FactKey
  /** Why we ask for it, short. */
  why: string
  /** Where to find it at home. */
  where: string
  icon: LucideIcon
}

export const DOC_COPY: Record<DocKind, DocCopy> = {
  medicare_card: {
    fact: 'medicare_parts',
    why: 'For which parts of Medicare they have',
    where: 'The red, white and blue card, usually in a wallet.',
    icon: CreditCard,
  },
  ssa_letter: {
    fact: 'monthly_income',
    why: 'For the monthly income',
    where: 'Mailed each December. Look for "Your new benefit amount".',
    icon: FileText,
  },
  bank_statement: {
    fact: 'bank_balance',
    why: 'For the bank balance',
    where: 'The latest month. Paper or a phone screenshot both work.',
    icon: Landmark,
  },
  tax_return: {
    fact: 'birth_date',
    why: 'For the date of birth',
    where: "Last year's Form 1040, first page. A preparer's summary works too.",
    icon: ReceiptText,
  },
}

/** Short hints shown when a fact is typed by hand. */
export const FACT_HINTS: Record<FactKey, string> = {
  birth_date: "As printed on a driver's license, state ID or benefit letter.",
  medicare_parts: 'Check each part shown on the Medicare card.',
  monthly_income: 'Social Security before the Medicare premium is taken out. It is on the benefit letter.',
  bank_balance: 'Checking plus savings, from the latest statements.',
}
