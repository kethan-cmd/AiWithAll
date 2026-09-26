import { Bell, X } from 'lucide-react'
import MemberAvatar from './MemberAvatar'
import type { TaskToast } from './useTaskToasts'

/** Small live notices when someone else claims or finishes a task. */
export default function TaskToasts({ toasts, onDismiss }: { toasts: TaskToast[]; onDismiss: (id: string) => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:right-6 sm:bottom-6 sm:left-auto sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 rounded-xl border border-border bg-popover p-3 pr-2 text-sm text-popover-foreground shadow-lift"
        >
          <span className="relative mt-0.5">
            <MemberAvatar name={t.who} />
            <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full bg-gold text-evergreen-deep ring-2 ring-popover">
              <Bell className="size-2.5" aria-hidden="true" />
            </span>
          </span>
          <p className="min-w-0 flex-1 leading-snug">
            <span className="font-semibold">
              {t.who} {t.verb}:
            </span>{' '}
            <span className="text-muted-foreground">{t.title}</span>
          </p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss notice"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
