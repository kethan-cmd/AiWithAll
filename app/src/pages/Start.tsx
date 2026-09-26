import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, CircleSlash, Loader2, Minus, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import type { DocKind, Household } from '@/contracts'
import { DOC_KINDS, DOC_LABELS } from '@/contracts'
import StepNav from '@/components/layout/StepNav'
import { Button } from '@/components/ui/button'
import { HouseholdEntity } from '@/data/entities'
import { loadSampleFamily } from '@/data/seed'
import { resetSession, setFile, setHits, setIdentity, updateSlot, useSession } from '@/data/session'
import { cn } from '@/lib/utils'
import DocTile from '@/features/docs/DocTile'
import { tileState } from '@/features/docs/helpers'
import FamilyForm from '@/features/docs/FamilyForm'
import EmptyState from '@/features/plan/EmptyState'

function pickSample(kind: DocKind) {
  setFile(kind, null)
  setHits(kind, null)
  updateSlot(kind, { mode: 'sample', status: 'empty', error: undefined })
}

export default function Start() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { slots, identity } = useSession()
  const [loaded, setLoaded] = useState<{ id: string; household: Household | null } | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seedError, setSeedError] = useState<string | null>(null)
  const handledKey = useRef<string | null>(null)
  const familyHeading = useId()
  const docsHeading = useId()

  useEffect(() => {
    document.title = 'Snap your paperwork · Money on the Table'
  }, [])

  // ?sample=1 loads the Park family and puts a sample document on every tile.
  useEffect(() => {
    if (params.get('sample') !== '1' || handledKey.current === location.key) return
    handledKey.current = location.key
    setSeeding(true)
    setSeedError(null)
    loadSampleFamily()
      .then(() => {
        for (const kind of DOC_KINDS) pickSample(kind)
        setParams({}, { replace: true })
      })
      .catch(() => setSeedError('The sample family did not load. Try again, or start with your own family below.'))
      .finally(() => setSeeding(false))
  }, [params, location.key, setParams])

  // The household this tab is working on.
  const householdId = identity?.household_id ?? null
  useEffect(() => {
    if (!householdId) return
    let alive = true
    HouseholdEntity.get(householdId).then((h) => alive && setLoaded({ id: householdId, household: h }))
    return () => {
      alive = false
    }
  }, [householdId])
  // undefined while loading, null when there is no household yet.
  const household: Household | null | undefined = !householdId
    ? null
    : loaded?.id === householdId
      ? loaded.household
      : undefined

  const startOver = () => {
    resetSession()
    setIdentity(null)
    setLoaded(null)
  }

  const states = DOC_KINDS.map((k) => tileState(slots[k]))
  const readyCount = states.filter((s) => s === 'sample' || s === 'photo' || s === 'read').length
  const skippedCount = states.filter((s) => s === 'skipped').length
  const neededCount = 4 - readyCount - skippedCount
  const canRead = !!household && !seeding
  const readLabel = readyCount === 0 ? 'Type the facts instead' : 'Read my documents'

  // A family member's tab never sees or changes the paperwork.
  if (identity && identity.role !== 'caregiver' && household && !seeding) {
    return (
      <div className="container-page pt-10 pb-20 sm:pt-14">
        <EmptyState
          icon={<UsersRound className="size-6" aria-hidden="true" />}
          title="The paperwork stays with the caregiver"
          body={`${household.caregiver_alias} keeps ${household.care_recipient_alias}'s documents private. You can see and claim tasks on the family page.`}
          primary={{ to: `/family?h=${encodeURIComponent(household.invite_code)}`, label: 'Open the family view' }}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="mesh-hero pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] opacity-70" aria-hidden="true" />
      <div className="container-page pt-6 pb-20 sm:pt-8">
        <StepNav />

        <header className="mt-10 max-w-3xl animate-rise sm:mt-14">
          <p className="eyebrow text-evergreen">Step 1 of 3 · Snap your paperwork</p>
          <h1 className="mt-3 text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl">
            Start with the paperwork <span className="marker">you already have</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Four documents, a few minutes. We read four facts from them, you check each one, and we draft the
            applications. Missing something? Skip it and type the fact instead.
          </p>
        </header>

        {seeding ? (
          <div role="status" className="mt-8 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm shadow-card">
            <Loader2 className="size-4 animate-spin text-evergreen" aria-hidden="true" />
            Loading the sample family
          </div>
        ) : null}
        {seedError ? (
          <p role="alert" className="mt-8 max-w-2xl rounded-xl bg-warn-soft px-4 py-3 text-sm text-warn">
            {seedError}
          </p>
        ) : null}

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-12">
          <div className="min-w-0 space-y-12">
            {/* About your family */}
            <section aria-labelledby={familyHeading}>
              {household?.is_sample ? (
                <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gold/40 bg-gold-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-start gap-2.5 text-sm text-gold-foreground">
                    <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>
                      <strong className="font-semibold">You're looking at the Park family.</strong> They are made up for
                      this demo, and every document here is fake.
                    </span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 shrink-0 rounded-xl bg-card px-4 text-sm font-semibold"
                    onClick={startOver}
                  >
                    Use my own family
                  </Button>
                </div>
              ) : null}

              <div className="rounded-3xl border bg-card p-5 shadow-card sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-evergreen-soft text-evergreen" aria-hidden="true">
                    <UsersRound className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 id={familyHeading} className="text-2xl font-semibold">
                      About your family
                    </h2>
                    {household === undefined ? (
                      <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-muted" aria-busy="true" />
                    ) : household ? (
                      <p className="mt-1 text-muted-foreground">You're set up. Your family can join once the drafts are ready.</p>
                    ) : (
                      <p className="mt-1 text-muted-foreground">A few quick answers so we use the right rules.</p>
                    )}
                  </div>
                </div>

                {household ? (
                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="text-muted-foreground">Helping</dt>
                        <dd className="mt-0.5 font-semibold">{household.care_recipient_alias}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Caregiver</dt>
                        <dd className="mt-0.5 font-semibold">{household.caregiver_alias}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">State</dt>
                        <dd className="mt-0.5 font-semibold">{household.state === 'WA' ? 'Washington' : household.state}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Dementia diagnosis</dt>
                        <dd className="mt-0.5 font-semibold">{household.dementia_dx ? 'Yes' : 'No'}</dd>
                      </div>
                    </dl>
                    {!household.is_sample ? (
                      <Button type="button" variant="ghost" className="h-10 self-start rounded-xl px-3 text-sm text-muted-foreground sm:self-auto" onClick={startOver}>
                        Start over
                      </Button>
                    ) : null}
                  </div>
                ) : household === null ? (
                  <div className="mt-6">
                    <FamilyForm onCreated={(h) => setLoaded({ id: h.id, household: h })} />
                  </div>
                ) : null}
              </div>
            </section>

            {/* Documents */}
            <section aria-labelledby={docsHeading}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-xl">
                  <h2 id={docsHeading} className="text-3xl font-semibold">
                    Your documents
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    A clear photo from your phone is fine. Lay the paper flat, in good light.
                  </p>
                </div>
                {readyCount < 4 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl px-4 text-sm font-semibold"
                    onClick={() => DOC_KINDS.forEach(pickSample)}
                  >
                    <Sparkles aria-hidden="true" />
                    Use all four samples
                  </Button>
                ) : null}
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {DOC_KINDS.map((kind, i) => (
                  <DocTile
                    key={kind}
                    kind={kind}
                    slot={slots[kind]}
                    className="animate-rise delay-var"
                    disabled={seeding}
                    onFile={(file) => {
                      setHits(kind, null)
                      setFile(kind, file)
                      updateSlot(kind, { mode: 'ocr', status: 'empty', error: undefined })
                    }}
                    onUseSample={() => pickSample(kind)}
                    onSkip={() => {
                      setFile(kind, null)
                      setHits(kind, null)
                      updateSlot(kind, { mode: null, status: 'skipped', error: undefined })
                    }}
                    onClear={() => {
                      setFile(kind, null)
                      setHits(kind, null)
                      updateSlot(kind, { mode: null, status: 'empty', error: undefined })
                    }}
                    style={{ '--delay': `${i * 70}ms` } as CSSProperties}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Summary + call to action */}
          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Ready to read">
            <div className="rounded-3xl border bg-card p-5 shadow-card sm:p-6">
              <p className="eyebrow text-muted-foreground">Your checklist</p>
              <ul className="mt-4 space-y-2.5">
                {DOC_KINDS.map((kind, i) => {
                  const s = states[i]
                  const ready = s === 'sample' || s === 'photo' || s === 'read'
                  return (
                    <li key={kind} className="flex items-center gap-3 text-sm">
                      <span
                        aria-hidden="true"
                        className={cn(
                          'grid size-6 shrink-0 place-items-center rounded-full',
                          ready ? 'bg-good text-paper' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {ready ? (
                          <Check className="size-3.5" strokeWidth={3} />
                        ) : s === 'skipped' ? (
                          <CircleSlash className="size-3.5" />
                        ) : (
                          <Minus className="size-3.5" />
                        )}
                      </span>
                      <span className={cn('flex-1', !ready && 'text-muted-foreground')}>{DOC_LABELS[kind]}</span>
                      <span className="text-xs text-muted-foreground">
                        {s === 'sample' ? 'Sample' : s === 'photo' ? 'Photo' : s === 'read' ? 'Read' : s === 'skipped' ? 'Type it' : 'Needed'}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <Button
                type="button"
                disabled={!canRead}
                onClick={() => navigate('/read')}
                className="mt-6 hidden h-14 w-full rounded-2xl text-base font-semibold shadow-card lg:inline-flex"
              >
                {readLabel}
                <ArrowRight aria-hidden="true" />
              </Button>
              <p className="mt-3 hidden text-center text-sm text-muted-foreground lg:block" aria-live="polite">
                {!household
                  ? 'Tell us about your family first.'
                  : neededCount > 0
                    ? `${readyCount} of 4 ready. Anything not added, you can type.`
                    : readyCount === 4
                      ? 'All four ready. Reading takes a few seconds.'
                      : `${readyCount} ready, ${skippedCount} to type by hand.`}
              </p>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-good/25 bg-good-soft/60 p-4 text-sm leading-relaxed">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-good" aria-hidden="true" />
              <p>
                <strong className="font-semibold">Read on this device.</strong> Photos are never saved. We never read SSNs or
                account numbers.
              </p>
            </div>
          </aside>
        </div>

        {/* Phones: the next step is always in reach, not 4,000px down the page. */}
        {household ? (
          <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t bg-background/90 px-4 py-3 backdrop-blur-lg sm:-mx-6 sm:px-6 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                <span className="font-semibold text-foreground tabular-nums">{readyCount} of 4</span> ready
                {skippedCount > 0 ? `, ${skippedCount} to type` : ''}
              </p>
              <Button
                type="button"
                disabled={!canRead}
                onClick={() => navigate('/read')}
                className="h-12 shrink-0 rounded-xl px-5 text-base font-semibold shadow-card"
              >
                {readLabel}
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
