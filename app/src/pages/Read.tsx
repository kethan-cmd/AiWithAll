import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, CircleAlert, CircleSlash, FastForward, Loader2, ShieldCheck, Trash2 } from 'lucide-react'
import type { DocKind, FactKey, ReadHit, ReadInput, ReadMode, ReadProgress } from '@/contracts'
import { DOC_KINDS, DOC_LABELS, FACT_LABELS } from '@/contracts'
import StepNav from '@/components/layout/StepNav'
import { Button, buttonVariants } from '@/components/ui/button'
import { FactEntity } from '@/data/entities'
import { clearPhotos, getFile, getSessionState, setHits, updateSlot, useSession } from '@/data/session'
import { cn } from '@/lib/utils'
import FactsConfirm from '@/features/docs/FactsConfirm'
import ReadingOverlay, { type OverlayState } from '@/features/docs/ReadingOverlay'
import { stageText } from '@/features/docs/helpers'
import { sampleIdFor } from '@/features/docs/samples/sampleLayout'
import { bestFacts, type FactCandidate } from '@/features/reading/merge'
import { toSnippet } from '@/features/reading/parsers'
import { isAbort, pickProvider, readSampleNow } from '@/features/reading/providers'
import { wait } from '@/features/reading/abort'

type Phase = 'reading' | 'confirm' | 'saved'

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Documents this tab will read: a sample or a photo, not skipped. */
function readableKinds(): DocKind[] {
  const { slots } = getSessionState()
  return DOC_KINDS.filter((k) => (slots[k].mode === 'sample' || slots[k].mode === 'ocr') && slots[k].status !== 'skipped')
}

/** Best facts across everything read so far in this tab. */
function currentBestFacts() {
  const { hits, slots } = getSessionState()
  const modes: Partial<Record<DocKind, ReadMode | null>> = {}
  for (const k of DOC_KINDS) modes[k] = slots[k].mode
  return bestFacts(hits, modes)
}

/** Forward an abort from one signal to a controller. */
function linkAbort(from: AbortSignal, to: AbortController) {
  if (from.aborted) to.abort()
  else from.addEventListener('abort', () => to.abort(), { once: true })
}

export default function Read() {
  const navigate = useNavigate()
  const { slots, hits, identity } = useSession()
  const [queue] = useState<DocKind[]>(readableKinds)
  const [phase, setPhase] = useState<Phase>(() =>
    readableKinds().some((k) => !getSessionState().hits[k]) ? 'reading' : 'confirm',
  )
  // Opened straight into the confirm step ("Change a fact", or after a
  // reload): start from the facts already saved, not only this tab's readings.
  const [openedToConfirm] = useState(() => phase === 'confirm')
  // The best reading of each fact, computed once when the confirm step opens.
  const [initialFacts, setInitialFacts] = useState<ReturnType<typeof bestFacts> | null>(null)
  const [savedKeys, setSavedKeys] = useState<Partial<Record<FactKey, boolean>>>({})
  const saveCtrl = useRef(new AbortController())
  const [current, setCurrent] = useState<DocKind | null>(null)
  const [progress, setProgress] = useState<ReadProgress | null>(null)
  const [overlay, setOverlay] = useState<OverlayState>('waiting')
  const [shownHits, setShownHits] = useState<ReadHit[]>([])
  const [skipping, setSkipping] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const skipCtrl = useRef(new AbortController())
  const confirmHeading = useId()
  const savedHeading = useId()

  useEffect(() => {
    document.title = 'Check what we found · Money on the Table'
  }, [])

  // ------------------------------------------------------------ reading loop
  useEffect(() => {
    if (phase !== 'reading') return
    const main = new AbortController()
    const reduced = prefersReducedMotion()

    ;(async () => {
      for (const kind of queue) {
        if (main.signal.aborted) return
        const state = getSessionState()
        if (state.hits[kind]) continue
        const slot = state.slots[kind]

        setCurrent(kind)
        setProgress(null)
        setShownHits([])
        setOverlay('reading')
        updateSlot(kind, { status: 'reading', error: undefined })

        const input: ReadInput =
          slot.mode === 'sample' ? { kind, sampleId: sampleIdFor(kind) } : { kind, file: getFile(kind) }

        try {
          let found: ReadHit[]
          if (slot.mode === 'sample' && skipCtrl.current.signal.aborted) {
            found = readSampleNow(kind)
          } else {
            if (!input.sampleId && !input.file) {
              throw new Error('This photo is no longer in memory (the page was reloaded). Type the facts below, or add it again.')
            }
            // Sample reads also stop when "Skip ahead" is pressed.
            const doc = new AbortController()
            linkAbort(main.signal, doc)
            if (slot.mode === 'sample') linkAbort(skipCtrl.current.signal, doc)
            try {
              found = await pickProvider(input).read(input, (p) => !main.signal.aborted && setProgress(p), doc.signal)
            } catch (e) {
              if (isAbort(e) && !main.signal.aborted && slot.mode === 'sample') found = readSampleNow(kind)
              else throw e
            }
          }
          if (main.signal.aborted) return
          setHits(kind, found)
          updateSlot(kind, { status: 'read', error: undefined })
          setProgress({ stage: 'done', pct: 1 })
          setShownHits(found)
          setOverlay('done')
          if (!skipCtrl.current.signal.aborted || slot.mode !== 'sample') {
            await wait(reduced ? 700 : 1500 + found.length * 220, main.signal)
          }
        } catch (e) {
          if (main.signal.aborted || isAbort(e)) return
          const message = e instanceof Error ? e.message : 'We could not read this document.'
          updateSlot(kind, { status: 'failed', error: message })
          setOverlay('failed')
          try {
            await wait(reduced ? 900 : 1800, main.signal)
          } catch {
            return
          }
        }
      }
      if (!main.signal.aborted) {
        setInitialFacts(currentBestFacts())
        setPhase('confirm')
      }
    })().catch(() => {
      // Aborted while waiting: the effect is being torn down.
    })

    return () => {
      main.abort()
      // Anything mid-read goes back to waiting, so a remount reads it again.
      for (const k of DOC_KINDS) {
        if (getSessionState().slots[k].status === 'reading') updateSlot(k, { status: 'empty' })
      }
    }
  }, [phase, queue])

  // Leaving the page cancels the "Facts saved" pause, so we never pull the
  // person back to Matches after they clicked somewhere else.
  useEffect(() => {
    const ctrl = new AbortController()
    saveCtrl.current = ctrl
    return () => ctrl.abort()
  }, [])

  // Seed the confirm step: saved, confirmed facts first, then this tab's readings.
  const householdId = identity?.household_id ?? null
  useEffect(() => {
    // Without a household the page shows "start with your family" instead.
    if (!openedToConfirm || !householdId) return
    let alive = true
    const fromReading = currentBestFacts()
    FactEntity.list((f) => f.household_id === householdId && f.confirmed)
      .then((saved) => {
        if (!alive) return
        const merged: ReturnType<typeof bestFacts> = { ...fromReading }
        const keys: Partial<Record<FactKey, boolean>> = {}
        for (const f of saved) {
          merged[f.key] = {
            key: f.key,
            value: f.value,
            source: f.source,
            mode: f.mode,
            confidence: 'high',
            snippet: f.snippet,
            box: fromReading[f.key]?.source === f.source ? fromReading[f.key]?.box : undefined,
          }
          keys[f.key] = true
        }
        setSavedKeys(keys)
        setInitialFacts(merged)
      })
      .catch(() => alive && setInitialFacts(fromReading))
    return () => {
      alive = false
    }
  }, [openedToConfirm, householdId])

  // Move focus to the new heading when the phase changes.
  useEffect(() => {
    const id = phase === 'confirm' ? confirmHeading : phase === 'saved' ? savedHeading : null
    if (id) requestAnimationFrame(() => document.getElementById(id)?.focus())
  }, [phase, confirmHeading, savedHeading])

  // ------------------------------------------------------------------ facts
  const failedDocs = DOC_KINDS.filter((k) => slots[k].status === 'failed')

  const save = useCallback(
    async (facts: FactCandidate[]) => {
      if (!identity) {
        setSaveError('We lost track of your family in this tab. Go back to step 1 and try again.')
        return
      }
      if (identity.role !== 'caregiver') {
        setSaveError('Only the caregiver can change the facts.')
        return
      }
      setSaving(true)
      setSaveError(null)
      try {
        const hid = identity.household_id
        const existing = await FactEntity.list((f) => f.household_id === hid)
        for (const c of facts) {
          const data = {
            household_id: hid,
            key: c.key,
            value: c.value,
            source: c.source,
            mode: c.mode,
            confidence: c.confidence,
            confirmed: true,
            snippet: c.snippet ? toSnippet(c.snippet) : undefined,
          }
          const prev = existing.find((f) => f.key === c.key)
          if (prev) await FactEntity.update(prev.id, data)
          else await FactEntity.create(data)
        }
        // The promise: photos are gone once the facts are confirmed.
        clearPhotos()
        for (const k of DOC_KINDS) {
          if (getSessionState().slots[k].status === 'read') updateSlot(k, { status: 'confirmed' })
        }
        setPhase('saved')
        const signal = saveCtrl.current.signal
        await wait(prefersReducedMotion() ? 1200 : 2000, signal)
        if (!signal.aborted) navigate('/matches')
      } catch (e) {
        if (isAbort(e)) return
        setSaveError('We could not save the facts on this device. Try again.')
        setSaving(false)
      }
    },
    [identity, navigate],
  )

  // -------------------------------------------------------------- no family
  if (!identity) {
    return (
      <div className="container-page pt-6 pb-24 sm:pt-8">
        <StepNav />
        <div className="mx-auto mt-16 max-w-xl rounded-3xl border bg-card p-8 text-center shadow-card">
          <h1 className="text-3xl font-semibold">Let's start with your family</h1>
          <p className="mt-3 text-muted-foreground">
            Tell us who you're helping and add your documents first. It takes about two minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/start" className={buttonVariants({ className: 'h-12 rounded-xl px-5 text-base font-semibold' })}>
              Go to step 1
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              to="/start?sample=1"
              className={buttonVariants({ variant: 'outline', className: 'h-12 rounded-xl px-5 text-base font-semibold' })}
            >
              Try the sample family
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------- family member
  if (identity.role !== 'caregiver') {
    return (
      <div className="container-page pt-6 pb-24 sm:pt-8">
        <div className="mx-auto mt-16 max-w-xl rounded-3xl border bg-card p-8 text-center shadow-card">
          <h1 className="text-3xl font-semibold">The paperwork stays with the caregiver</h1>
          <p className="mt-3 text-muted-foreground">
            You can see and claim tasks from the family view. The documents and the numbers on them stay private.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/plan" className={buttonVariants({ className: 'h-12 rounded-xl px-5 text-base font-semibold' })}>
              Go to the family tasks
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------------ saved
  if (phase === 'saved') {
    return (
      <div className="container-page pt-6 pb-24 sm:pt-8">
        <StepNav />
        <div className="mx-auto mt-16 max-w-lg animate-rise rounded-3xl border bg-card p-8 text-center shadow-lift sm:p-10">
          <span className="mx-auto grid size-16 animate-pulse-ring place-items-center rounded-full bg-good text-paper [animation-iteration-count:1]">
            <Check className="size-8 animate-mark" strokeWidth={3} aria-hidden="true" />
          </span>
          <h1 id={savedHeading} tabIndex={-1} className="mt-6 text-3xl font-semibold">
            Facts saved
          </h1>
          <p className="mt-2 text-muted-foreground">Now we match them against the programs and draft the applications.</p>
          <p
            role="status"
            className="rd-deleted mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-good/30 bg-good-soft px-4 py-2 text-sm font-semibold text-good"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Photos deleted from memory
          </p>
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Finding programs
          </p>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------- reading
  if (phase === 'reading') {
    const kind = current ?? queue[0]
    const slot = slots[kind]
    const pct = Math.round((progress?.pct ?? 0) * 100)
    const onlySamplesLeft = queue
      .filter((k) => !hits[k] && slots[k].status !== 'failed')
      .every((k) => slots[k].mode === 'sample')
    const statusLine =
      overlay === 'failed'
        ? slot.error ?? 'We could not read this document.'
        : overlay === 'done'
          ? shownHits.length
            ? `Found ${shownHits.map((h) => FACT_LABELS[h.key].toLowerCase()).join(' and ')}`
            : 'No facts found on this one. You can type them next.'
          : stageText(progress, slot.mode)

    return (
      <div className="container-page pt-6 pb-24 sm:pt-8">
        <StepNav />
        <header className="mt-10 max-w-3xl sm:mt-12">
          <p className="eyebrow text-evergreen">Step 2 of 3 · Reading</p>
          <h1 className="mt-3 text-4xl leading-[1.05] font-semibold sm:text-5xl">Reading your documents</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            This happens here, on this device. We look for four facts and nothing else.
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <section aria-label={`Reading the ${DOC_LABELS[kind].toLowerCase()}`} className="min-w-0">
            <div className="rounded-3xl border bg-muted/40 px-4 pt-12 pb-6 sm:px-10 sm:pt-14 sm:pb-8">
              <ReadingOverlay
                key={kind}
                kind={kind}
                photoUrl={slot.mode === 'ocr' ? slot.preview_url : null}
                state={overlay}
                hits={shownHits}
              />
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="flex items-center gap-2 font-semibold" role="status" aria-live="polite">
                  {overlay === 'reading' ? (
                    <Loader2 className="size-4 animate-spin text-evergreen" aria-hidden="true" />
                  ) : overlay === 'failed' ? (
                    <CircleAlert className="size-4 text-warn" aria-hidden="true" />
                  ) : (
                    <Check className="size-4 text-good" strokeWidth={3} aria-hidden="true" />
                  )}
                  <span>
                    <span className="sr-only">{DOC_LABELS[kind]}: </span>
                    {statusLine}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {DOC_LABELS[kind]} · {slot.mode === 'sample' ? 'Sample document' : 'Your photo'}
                </p>
              </div>
              <div
                className="rd-bar"
                role="progressbar"
                aria-label={`Reading progress for the ${DOC_LABELS[kind].toLowerCase()}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
              >
                <span style={{ width: `${pct}%` }} />
              </div>
            </div>
          </section>

          <aside aria-label="Documents" className="lg:pt-2">
            <p className="eyebrow text-muted-foreground">Documents</p>
            <ol className="mt-4 space-y-2">
              {DOC_KINDS.map((k) => {
                const s = slots[k]
                const isNow = k === kind && overlay === 'reading'
                const found = hits[k]
                const skipped = !queue.includes(k)
                return (
                  <li
                    key={k}
                    aria-current={isNow ? 'step' : undefined}
                    className={cn(
                      'flex items-start gap-3 rounded-2xl border px-4 py-3 transition-colors',
                      isNow ? 'border-gold/60 bg-gold-soft/60' : 'border-transparent bg-card shadow-card',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full',
                        found ? 'bg-good text-paper' : s.status === 'failed' ? 'bg-warn-soft text-warn' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {isNow ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : found ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : s.status === 'failed' ? (
                        <CircleAlert className="size-3.5" />
                      ) : skipped ? (
                        <CircleSlash className="size-3.5" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{DOC_LABELS[k]}</span>
                      <span className="block text-sm text-muted-foreground">
                        {isNow
                          ? 'Reading now'
                          : found
                            ? found.length
                              ? `Found: ${found.map((h) => FACT_LABELS[h.key].toLowerCase()).join(', ')}`
                              : 'Nothing found, you will type it'
                            : s.status === 'failed'
                              ? "Couldn't read, you will type it"
                              : skipped
                                ? 'Skipped, you will type it'
                                : 'Waiting'}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ol>
            {onlySamplesLeft && !skipping ? (
              <Button
                type="button"
                variant="ghost"
                className="mt-4 h-10 rounded-xl px-3 text-sm text-muted-foreground"
                onClick={() => {
                  setSkipping(true)
                  skipCtrl.current.abort()
                }}
              >
                <FastForward aria-hidden="true" />
                Skip ahead
              </Button>
            ) : null}
          </aside>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------- confirm
  const readKinds = DOC_KINDS.filter((k) => hits[k] && (slots[k].mode === 'sample' || slots[k].preview_url))
  return (
    <div className="container-page pt-6 pb-24 sm:pt-8">
      <StepNav />
      <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div className="min-w-0">
          {initialFacts ? (
            <FactsConfirm
              initial={initialFacts}
              initialConfirmed={savedKeys}
              failedDocs={failedDocs}
              saving={saving}
              onSubmit={save}
              headingId={confirmHeading}
            />
          ) : null}
          {saveError ? (
            <p role="alert" className="mt-4 rounded-xl bg-warn-soft px-4 py-3 text-sm text-warn">
              {saveError}
            </p>
          ) : null}
        </div>

        <aside aria-label="What we read" className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          {readKinds.length ? (
            <div className="rounded-3xl border bg-card p-5 shadow-card">
              <p className="eyebrow text-muted-foreground">What we read</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Gold boxes show where each fact came from. Tap “Show where” on a fact to zoom in.
              </p>
              <ul className="-mx-5 mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-1 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
                {readKinds.map((k) => (
                  <li key={k} className="w-28 shrink-0 snap-start lg:w-auto lg:min-w-0">
                    <div className="grid aspect-[3/4] place-items-center rounded-xl bg-muted/50 p-2">
                      <ReadingOverlay
                        kind={k}
                        size="sm"
                        state="done"
                        hits={hits[k]}
                        photoUrl={slots[k].mode === 'ocr' ? slots[k].preview_url : null}
                      />
                    </div>
                    <p className="mt-2 truncate text-xs font-medium">{DOC_LABELS[k]}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex items-start gap-3 rounded-2xl border border-good/25 bg-good-soft/60 p-4 text-sm leading-relaxed">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-good" aria-hidden="true" />
            <p>
              <strong className="font-semibold">Photos stay in this tab's memory</strong> until you confirm. Then they
              are deleted. We never read SSNs, Medicare numbers or account numbers.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
