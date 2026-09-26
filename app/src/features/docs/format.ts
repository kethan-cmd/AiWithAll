// Display helpers for facts.

import type { Confidence, DocKind, FactValue, MedicarePart, ReadHit } from '@/contracts'
import { DOC_LABELS, FACT_LABELS } from '@/contracts'
import { formatUSD } from '@/lib/money'

export const PART_NAMES: Record<MedicarePart, string> = {
  A: 'Hospital',
  B: 'Medical',
  D: 'Drug plan',
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Whole years between a birth date and today. */
export function ageFrom(iso: string, today = new Date()): number {
  const [y, m, d] = iso.split('-').map(Number)
  let age = today.getFullYear() - y
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--
  return age
}

export function formatParts(parts: MedicarePart[]): string {
  if (!parts.length) return 'None'
  return parts.map((p) => `Part ${p} (${PART_NAMES[p]})`).join(' + ')
}

/** The main display value for a fact. */
export function formatFactValue(v: FactValue): string {
  switch (v.key) {
    case 'birth_date':
      return formatDateLong(v.iso)
    case 'medicare_parts':
      return formatParts(v.parts)
    case 'monthly_income':
      return formatUSD(v.cents)
    case 'bank_balance':
      return formatUSD(v.cents)
  }
}

/** A short second line under the value. */
export function factDetail(v: FactValue): string | null {
  switch (v.key) {
    case 'birth_date':
      return `Age ${ageFrom(v.iso)}`
    case 'monthly_income':
      return 'a month, before deductions'
    case 'bank_balance':
      return 'in the bank'
    default:
      return null
  }
}

/** Compact text for the highlight chip on a document. */
export function chipText(hit: Pick<ReadHit, 'value'>): string {
  const v = hit.value
  if (v.key === 'medicare_parts') return `Medicare Part ${v.parts.join(' + ')}`
  return `${FACT_LABELS[v.key]} ${formatFactValue(v)}`
}

export function sourceLabel(source: DocKind | 'manual'): string {
  return source === 'manual' ? 'Typed by you' : DOC_LABELS[source]
}

export const CONFIDENCE_COPY: Record<Confidence, { label: string; tone: 'good' | 'warn' | 'low' }> = {
  high: { label: 'Read clearly', tone: 'good' },
  medium: { label: 'Please double-check', tone: 'warn' },
  low: { label: 'Best guess, please check', tone: 'low' },
}

/** Whether two fact values are the same. */
export function sameValue(a: FactValue, b: FactValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
