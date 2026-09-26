import { useId, useState } from 'react'
import { Check, Copy, ExternalLink, ShieldCheck, Users } from 'lucide-react'
import type { Household, Member } from '@/contracts'
import { Button } from '@/components/ui/button'
import MemberAvatar from './MemberAvatar'
import { inviteUrl } from './helpers'

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older browsers and some iframes block the clipboard API.
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  }
}

/** "Daniel", "Daniel and Anna", "Daniel, Anna and Sam". */
function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** "Bring in your family": the invite link, with a copy button. */
export default function InviteLink({ household, members }: { household: Household; members: Member[] }) {
  const [copied, setCopied] = useState(false)
  const uid = useId()
  const titleId = `${uid}-invite-title`
  const urlId = `${uid}-invite-url`
  const url = inviteUrl(household.invite_code)
  const family = members.filter((m) => m.role === 'family')

  async function onCopy() {
    if (await copyText(url)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <section
      aria-labelledby={titleId}
      className="relative overflow-hidden rounded-2xl bg-evergreen-deep p-5 text-on-deep shadow-lift grain sm:p-6"
    >
      <div className="relative z-10">
        <p className="eyebrow flex items-center gap-2 text-gold">
          <Users className="size-3.5" aria-hidden="true" />
          No one does this alone
        </p>
        <h2 id={titleId} className="mt-3 text-2xl leading-tight font-medium text-on-deep">
          Bring in your family
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-on-deep-muted">
          Send this link to a brother, a sister, a neighbor. They pick a task from their phone, and you see it here the moment
          they do.
        </p>

        {family.length > 0 ? (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              {family.map((m) => (
                <MemberAvatar key={m.id} name={m.alias} className="ring-2 ring-evergreen-deep" />
              ))}
            </div>
            <span className="text-sm text-on-deep-muted">
              {joinNames(family.map((m) => m.alias))} {family.length === 1 ? 'has' : 'have'} joined
            </span>
          </div>
        ) : null}

        <label htmlFor={urlId} className="sr-only">
          Family invite link
        </label>
        <div className="mt-5 flex items-stretch gap-2 rounded-xl bg-white/8 p-1.5 ring-1 ring-white/15">
          <input
            id={urlId}
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 truncate bg-transparent px-2 font-mono text-[0.8rem] text-on-deep outline-none"
          />
          <Button
            onClick={onCopy}
            className="h-10 gap-1.5 bg-gold px-4 font-semibold text-evergreen-deep hover:bg-gold/85"
            aria-label={copied ? 'Link copied' : 'Copy family link'}
          >
            {copied ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <p className="mt-2 text-xs text-on-deep-muted">
          Family code <span className="font-mono font-semibold tracking-wider text-on-deep">{household.invite_code}</span>
        </p>

        <div className="mt-5 flex flex-col gap-3 border-t border-white/12 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-on-deep-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
            Family sees tasks, never documents.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-on-deep underline decoration-gold/60 underline-offset-4 hover:decoration-gold"
          >
            Open the family view
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  )
}
