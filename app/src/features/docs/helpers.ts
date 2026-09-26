// Small non-component helpers shared by the document screens.

import type { DocumentSlot, FactKey, ReadMode, ReadProgress } from '@/contracts'

export type TileState = 'needed' | 'sample' | 'photo' | 'skipped' | 'read'

/** What a tile is showing, from its session slot. */
export function tileState(slot: DocumentSlot): TileState {
  if (slot.status === 'skipped') return 'skipped'
  if (slot.status === 'read' || slot.status === 'confirmed') return 'read'
  if (slot.mode === 'sample') return 'sample'
  if (slot.mode === 'ocr' && slot.preview_url) return 'photo'
  return 'needed'
}

export const FACT_ORDER: FactKey[] = ['birth_date', 'medicare_parts', 'monthly_income', 'bank_balance']

/** Easy-to-read invite code like "HKMP-4827" (no I, O, 0 or 1). */
export function makeInviteCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits = '23456789'
  const pick = (set: string, n: number) => {
    const bytes = new Uint32Array(n)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => set[b % set.length]).join('')
  }
  return `${pick(letters, 4)}-${pick(digits, 4)}`
}

/** Words for each reading stage, per mode. */
export function stageText(progress: ReadProgress | null, mode: ReadMode | null): string {
  if (!progress) return 'Getting ready'
  switch (progress.stage) {
    case 'loading':
      return mode === 'ocr' ? 'Loading the reader on your device' : 'Opening the document'
    case 'recognizing':
      return 'Reading'
    case 'parsing':
      return 'Finding the facts'
    case 'done':
      return 'Done'
  }
}
