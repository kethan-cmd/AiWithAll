import type { JSX } from 'react'
import type { DocKind } from '@/contracts'
import type { SampleDocProps } from './chrome'
import BankStatement from './BankStatement'
import MedicareCard from './MedicareCard'
import SsaAwardLetter from './SsaAwardLetter'
import TaxReturn from './TaxReturn'

const DOCS = {
  medicare_card: MedicareCard,
  ssa_letter: SsaAwardLetter,
  bank_statement: BankStatement,
  tax_return: TaxReturn,
} satisfies Record<DocKind, (p: SampleDocProps) => JSX.Element>

/** The fake sample document for a document kind. */
export default function SampleDoc({ kind, ...props }: SampleDocProps & { kind: DocKind }) {
  const Doc = DOCS[kind]
  return <Doc {...props} />
}
