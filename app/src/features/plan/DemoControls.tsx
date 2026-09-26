import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FastForward, Loader2, RotateCcw, Trash2, Users, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { loadSampleFamily, loadSampleFamilyWithFacts, resetEverything } from '@/data/seed'

type Busy = null | 'load' | 'jump' | 'reset' | 'delete'

/** Small, tucked-away tools for running the demo. */
export default function DemoControls() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState<Busy>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  async function run(kind: Exclude<Busy, null>, fn: () => Promise<void>, message: string) {
    setBusy(kind)
    try {
      await fn()
      setNote(message)
    } finally {
      setBusy(null)
    }
  }

  const spin = (k: Busy) => (busy === k ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null)

  return (
    <details data-print-hide className="group rounded-2xl border border-dashed border-border bg-muted/40 open:bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <Wrench className="size-4" aria-hidden="true" />
          Demo tools
        </span>
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-border px-5 pt-4 pb-5">
        <p className="text-sm text-muted-foreground">
          Everything here uses the fictional Park family and lives only in this browser.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-10 gap-2"
            disabled={busy !== null}
            onClick={() =>
              run('load', async () => {
                await loadSampleFamily()
                navigate('/start?sample=1')
              }, 'Sample family loaded.')
            }
          >
            {spin('load') ?? <Users className="size-4" aria-hidden="true" />}
            Load sample family
          </Button>
          <Button
            variant="outline"
            className="h-10 gap-2"
            disabled={busy !== null}
            onClick={() =>
              run('jump', async () => {
                await loadSampleFamilyWithFacts()
                navigate('/plan')
              }, 'Jumped to the finished plan.')
            }
          >
            {spin('jump') ?? <FastForward className="size-4" aria-hidden="true" />}
            Skip to the plan
          </Button>
          <Button
            variant="outline"
            className="h-10 gap-2"
            disabled={busy !== null}
            onClick={() =>
              run('reset', async () => {
                await resetEverything()
                await loadSampleFamily()
                navigate('/start?sample=1')
              }, 'Demo reset. Starting fresh.')
            }
          >
            {spin('reset') ?? <RotateCcw className="size-4" aria-hidden="true" />}
            Reset demo
          </Button>
          <Button variant="destructive" className="h-10 gap-2" disabled={busy !== null} onClick={() => setConfirmOpen(true)}>
            <Trash2 className="size-4" aria-hidden="true" />
            Delete everything
          </Button>
        </div>
        <p role="status" aria-live="polite" className="mt-3 min-h-5 text-xs text-muted-foreground">
          {note}
        </p>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete everything?</DialogTitle>
            <DialogDescription className="leading-relaxed">
              This removes every record and photo from this browser: the family, the confirmed facts, the drafts and every
              task. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="h-10" />}>Keep it</DialogClose>
            <Button
              variant="destructive"
              className="h-10 gap-2 bg-destructive text-white hover:bg-destructive/85"
              disabled={busy !== null}
              onClick={() =>
                run('delete', async () => {
                  await resetEverything()
                  setConfirmOpen(false)
                  navigate('/')
                }, 'Everything was deleted from this browser.')
              }
            >
              {spin('delete') ?? <Trash2 className="size-4" aria-hidden="true" />}
              Delete everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </details>
  )
}
