import { FileSearch, MapPin, PenLine, Stethoscope, ListChecks } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PipelineStatus, ProgramId, TaskKind } from '@/contracts'

export const PROGRAM_CHIP: Record<ProgramId, string> = {
  msp: 'Medicare Savings Program',
  extra_help: 'Extra Help',
  guide: 'GUIDE respite',
}

export const TASK_KIND: Record<TaskKind, { icon: LucideIcon; label: string }> = {
  sign: { icon: PenLine, label: 'Signature' },
  ship_review_submit: { icon: Stethoscope, label: 'Counselor visit' },
  find_guide: { icon: MapPin, label: 'Phone calls' },
  missing_doc: { icon: FileSearch, label: 'Find a paper' },
  custom: { icon: ListChecks, label: 'To do' },
}

export const STATUS_LABEL: Record<PipelineStatus, string> = {
  likely: 'Likely',
  drafted: 'Drafted',
  signed: 'Signed',
  submitted: 'Submitted',
  approved: 'Approved',
}

/** Button text for moving a program to the given step. */
export const ADVANCE_LABEL: Record<PipelineStatus, string> = {
  likely: 'Mark likely',
  drafted: 'Mark drafted',
  signed: 'Mark signed',
  submitted: 'Mark submitted',
  approved: 'Mark approved (demo)',
}
