import type { PipelineStatus, ProgramMatch, ProgramStatus } from '@/contracts'

/** Where a program stands. With no stored record, a likely draft program is
 *  already "drafted": the app filled the form the moment facts were confirmed. */
export function statusFor(program: ProgramMatch['program'], statuses: ProgramStatus[]): PipelineStatus {
  return statuses.find((s) => s.program === program)?.status ?? 'drafted'
}

/** Full family invite URL for this page's location. */
export function inviteUrl(code: string): string {
  if (typeof window === 'undefined') return `#/family?h=${encodeURIComponent(code)}`
  const { origin, pathname } = window.location
  return `${origin}${pathname}#/family?h=${encodeURIComponent(code)}`
}

