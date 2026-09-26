// Per-tab state that must NOT go into shared storage.
//
// - Identity (who is using this tab) lives in sessionStorage, so a caregiver
//   tab and a family tab can sit side by side on one computer.
// - Photos, document slots and unconfirmed reading results live in memory
//   only. They are never serialized, and photos are revoked once the facts
//   are confirmed (the "deleted after reading" promise).

import { useSyncExternalStore } from 'react'
import type { DocKind, DocumentSlot, Identity, ReadHit } from '@/contracts'
import { DOC_KINDS } from '@/contracts'

const IDENTITY_KEY = 'motd:identity'

// ------------------------------------------------------------- identity

export function getIdentity(): Identity | null {
  try {
    const raw = sessionStorage.getItem(IDENTITY_KEY)
    return raw ? (JSON.parse(raw) as Identity) : null
  } catch {
    return null
  }
}

export function setIdentity(identity: Identity | null) {
  if (identity) sessionStorage.setItem(IDENTITY_KEY, JSON.stringify(identity))
  else sessionStorage.removeItem(IDENTITY_KEY)
  emit()
}

// ------------------------------------------------------- in-memory store

interface MemoryState {
  slots: Record<DocKind, DocumentSlot>
  /** Unconfirmed reading results per document. */
  hits: Partial<Record<DocKind, ReadHit[]>>
  /** Real photos. Never leave this module; never written to storage. */
  files: Partial<Record<DocKind, File>>
  identity: Identity | null
}

function emptySlots(): Record<DocKind, DocumentSlot> {
  const slots = {} as Record<DocKind, DocumentSlot>
  for (const kind of DOC_KINDS) {
    slots[kind] = { kind, status: 'empty', mode: null, preview_url: null }
  }
  return slots
}

let state: MemoryState = {
  slots: emptySlots(),
  hits: {},
  files: {},
  identity: typeof sessionStorage === 'undefined' ? null : getIdentity(),
}

const listeners = new Set<() => void>()
function emit() {
  state = { ...state, identity: getIdentity() }
  listeners.forEach((l) => l())
}

export function subscribeSession(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function getSessionState(): MemoryState {
  return state
}

/** React hook: the live per-tab session state. */
export function useSession(): MemoryState {
  return useSyncExternalStore(subscribeSession, getSessionState, getSessionState)
}

export function updateSlot(kind: DocKind, patch: Partial<DocumentSlot>) {
  state = { ...state, slots: { ...state.slots, [kind]: { ...state.slots[kind], ...patch } } }
  emit()
}

export function setFile(kind: DocKind, file: File | null) {
  const files = { ...state.files }
  const prev = state.slots[kind].preview_url
  if (prev) URL.revokeObjectURL(prev)
  if (file) files[kind] = file
  else delete files[kind]
  state = {
    ...state,
    files,
    slots: {
      ...state.slots,
      [kind]: { ...state.slots[kind], preview_url: file ? URL.createObjectURL(file) : null },
    },
  }
  emit()
}

export function getFile(kind: DocKind): File | undefined {
  return state.files[kind]
}

export function setHits(kind: DocKind, hits: ReadHit[] | null) {
  const next = { ...state.hits }
  if (hits) next[kind] = hits
  else delete next[kind]
  state = { ...state, hits: next }
  emit()
}

/** Forget every photo and preview (after facts are confirmed, on reset,
 *  and when the tab is closed). */
export function clearPhotos() {
  for (const slot of Object.values(state.slots)) {
    if (slot.preview_url) URL.revokeObjectURL(slot.preview_url)
  }
  const slots = { ...state.slots }
  for (const kind of DOC_KINDS) slots[kind] = { ...slots[kind], preview_url: null }
  state = { ...state, files: {}, slots }
  emit()
}

/** Full reset of this tab's in-memory reading state. */
export function resetSession() {
  clearPhotos()
  state = { ...state, slots: emptySlots(), hits: {} }
  emit()
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', clearPhotos)
}
