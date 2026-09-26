// Shared contracts for Money on the Table. Every feature imports its types
// from here so parallel work stays compatible. Treat this file as frozen:
// if a feature needs a new field, add it here in one place, never redefine
// a type locally.
//
// Money is always integer cents. Dates are ISO strings (YYYY-MM-DD for
// calendar dates, full ISO for timestamps). String unions only, no enums
// (tsconfig has erasableSyntaxOnly).
//
// Shared component APIs (built once, used across features):
//   <MoneyCounter cents={number} label?={string} suffix?={string} size?={'md'|'lg'|'xl'} />
//     src/components/brand/MoneyCounter.tsx: animates between values, respects
//     prefers-reduced-motion, renders formatUSD(cents, { whole: true }).
//   <RulesDateStamp asOf={string} />
//     src/components/layout/RulesDateStamp.tsx: "Rules checked <date>" chip.
//   <LikelyBadge />
//     src/features/programs/LikelyBadge.tsx: "Likely match, confirm with a
//     free counselor".

// ---------------------------------------------------------------- records

export interface BaseRecord {
  id: string
  created_at: string
  updated_at: string
}

export type Role = 'caregiver' | 'family'

/** One family working on one person's benefits. Stored (entity). */
export interface Household extends BaseRecord {
  /** First name or nickname of the person with dementia, e.g. "Mom (Helen)". */
  care_recipient_alias: string
  caregiver_alias: string
  /** Two-letter state code whose rules we use. */
  state: string
  dementia_dx: boolean
  /** 1 = single, 2 = married couple (affects limits). */
  household_size: 1 | 2
  /** Short code for the family invite link: #/family?h=<code> */
  invite_code: string
  is_sample: boolean
}

/** A family member who can claim tasks. Stored (entity). */
export interface Member extends BaseRecord {
  household_id: string
  alias: string
  relation: string
  role: Role
}

// -------------------------------------------------------------- documents

export type DocKind = 'medicare_card' | 'ssa_letter' | 'bank_statement' | 'tax_return'

export const DOC_KINDS: readonly DocKind[] = [
  'medicare_card',
  'ssa_letter',
  'bank_statement',
  'tax_return',
] as const

export const DOC_LABELS: Record<DocKind, string> = {
  medicare_card: 'Medicare card',
  ssa_letter: 'Social Security letter',
  bank_statement: 'Bank statement',
  tax_return: 'Tax return',
}

/** Per-tab UI state for a document tile. Never stored in localStorage. */
export interface DocumentSlot {
  kind: DocKind
  status: 'empty' | 'reading' | 'read' | 'confirmed' | 'skipped' | 'failed'
  mode: ReadMode | null
  /** Object URL for the preview. Session memory only, revoked after confirm. */
  preview_url: string | null
  error?: string
}

// ------------------------------------------------------------------ facts

/** The only four facts the app ever extracts. Never SSNs or account numbers. */
export type FactKey = 'birth_date' | 'medicare_parts' | 'monthly_income' | 'bank_balance'

export const FACT_LABELS: Record<FactKey, string> = {
  birth_date: 'Date of birth',
  medicare_parts: 'Medicare coverage',
  monthly_income: 'Monthly income',
  bank_balance: 'Bank balance',
}

export type ReadMode = 'sample' | 'ocr' | 'manual' | 'base44'
export type Confidence = 'high' | 'medium' | 'low'
export type MedicarePart = 'A' | 'B' | 'D'

export type FactValue =
  | { key: 'birth_date'; iso: string }
  | { key: 'medicare_parts'; parts: MedicarePart[] }
  | { key: 'monthly_income'; cents: number }
  | { key: 'bank_balance'; cents: number }

/** Normalized box, 0..1 of the document image width/height. */
export interface Box {
  x: number
  y: number
  w: number
  h: number
}

/** A confirmed-or-pending fact. Stored (entity), caregiver-only by convention:
 *  the family view never reads Facts. */
export interface Fact extends BaseRecord {
  household_id: string
  key: FactKey
  value: FactValue
  source: DocKind | 'manual'
  mode: ReadMode
  confidence: Confidence
  confirmed: boolean
  /** Short redacted text the value came from, e.g. "Monthly benefit $1,542.00". */
  snippet?: string
}

// ---------------------------------------------------------------- reading

export interface ReadInput {
  kind: DocKind
  /** A real photo or scan (OCR mode). Kept in memory only. */
  file?: File
  /** A built-in sample document (sample mode). */
  sampleId?: string
}

export interface ReadHit {
  key: FactKey
  value: FactValue
  confidence: Confidence
  /** Where on the document the value was found, for the highlight overlay. */
  box?: Box
  /** Redacted source text. Must pass redact() first. */
  snippet?: string
}

export interface ReadProgress {
  stage: 'loading' | 'recognizing' | 'parsing' | 'done'
  /** 0..1 */
  pct: number
}

/** The seam for "the AI reads your documents". Implementations:
 *  sample (scripted, never fails), ocr (tesseract.js on-device),
 *  manual (caregiver types), base44 (InvokeLLM when hosted on Base44). */
export interface ReadingProvider {
  mode: ReadMode
  available(): Promise<boolean>
  read(
    input: ReadInput,
    onProgress?: (p: ReadProgress) => void,
    signal?: AbortSignal,
  ): Promise<ReadHit[]>
}

/** One word from OCR with its box (pixels of the source image). */
export interface OcrWord {
  text: string
  bbox: { x0: number; y0: number; x1: number; y1: number }
  confidence: number
}

// ----------------------------------------------------------------- rules

/** Confirmed facts in the shape the rules engine needs. */
export interface ConfirmedFacts {
  birth_date: string
  medicare_parts: MedicarePart[]
  monthly_income_cents: number
  bank_balance_cents: number
}

export type ProgramId = 'msp' | 'extra_help' | 'guide'
export type MspTier = 'QMB' | 'SLMB' | 'QI'

export interface ProgramMatch {
  program: ProgramId
  name: string
  likely: boolean
  tier?: MspTier
  /** Plain-English reasons, e.g. "Income $1,542/mo is under the $1,616 SLMB limit". */
  reasons: string[]
  /** Estimated yearly value in cents (0 if not counted in the total). */
  est_annual_cents: number
  estimate_note: string
  /** 'draft' = we pre-fill an application; 'task' = a person does it (GUIDE). */
  kind: 'draft' | 'task'
  rules_as_of: string
  source_url: string
}

export type PipelineStatus = 'likely' | 'drafted' | 'signed' | 'submitted' | 'approved'

export const PIPELINE: readonly PipelineStatus[] = [
  'likely',
  'drafted',
  'signed',
  'submitted',
  'approved',
] as const

/** Where each program stands for a household. Stored (entity). */
export interface ProgramStatus extends BaseRecord {
  household_id: string
  program: ProgramId
  status: PipelineStatus
}

export interface DraftField {
  id: string
  label: string
  /** Where this sits on the real form, e.g. "Section 1, line 3". */
  form_ref: string
  value: string | null
  source: DocKind | 'household' | 'manual' | null
  /** True for SSN, Medicare number, signatures: always blank in the draft. */
  fill_by_hand: boolean
  note?: string
}

export interface Draft {
  program: 'msp' | 'extra_help'
  form_name: string
  form_url: string
  fields: DraftField[]
  still_needed: string[]
}

export type MatchFn = (f: ConfirmedFacts, h: Household) => ProgramMatch[]
export type BuildDraftFn = (
  program: 'msp' | 'extra_help',
  f: ConfirmedFacts,
  facts: Fact[],
  h: Household,
) => Draft
/** Sum of est_annual_cents for likely programs not yet dropped. */
export type TotalFn = (matches: ProgramMatch[]) => number

// ------------------------------------------------------------------ tasks

export type TaskKind = 'sign' | 'ship_review_submit' | 'find_guide' | 'missing_doc' | 'custom'

/** Something only a person can do. Stored (entity), shared with family. */
export interface Task extends BaseRecord {
  household_id: string
  kind: TaskKind
  title: string
  detail: string
  program: ProgramId | null
  status: 'open' | 'claimed' | 'done'
  claimed_by: string | null
  done_at: string | null
}

/** Per-tab identity (sessionStorage). */
export interface Identity {
  household_id: string
  member_id: string | null
  alias: string
  role: Role
}
