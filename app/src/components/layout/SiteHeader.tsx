import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Wordmark from '@/components/brand/Wordmark'

const navLink =
  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'

/** Sticky, translucent header. Gains a hairline and shadow once you scroll. */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  // The sample CTA belongs on the marketing pages only. Inside the flow it would
  // compete with each page's own next step, and on /family it would pull a
  // relative into the caregiver's flow.
  const showSampleCta = pathname === '/' || pathname === '/sources'
  const showPlanLink = pathname.startsWith('/matches') || pathname.startsWith('/draft')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      data-print-hide
      className={cn(
        'sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300',
        'supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150',
        scrolled
          ? 'border-border bg-background/85 shadow-[0_1px_0_0_var(--border),0_8px_24px_-16px_oklch(0.2_0.03_160/0.25)]'
          : 'border-transparent bg-background/60',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Wordmark />
        <nav aria-label="Main" className="flex items-center gap-1">
          <Link to={{ pathname: '/', hash: '#how-it-works' }} className={cn(navLink, 'hidden md:inline-flex')}>
            How it works
          </Link>
          <Link to={{ pathname: '/', hash: '#privacy' }} className={cn(navLink, 'hidden lg:inline-flex')}>
            Privacy
          </Link>
          <NavLink
            to="/sources"
            className={({ isActive }) =>
              cn(navLink, 'hidden sm:inline-flex', isActive && 'text-foreground underline decoration-gold decoration-2 underline-offset-8')
            }
          >
            Sources
          </NavLink>
          {showPlanLink ? (
            <Link to="/plan" className={cn(navLink, 'ml-1 inline-flex items-center gap-1.5 text-foreground')}>
              Your plan
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
          {showSampleCta ? (
            <Link
              to="/start?sample=1"
              className="group ml-1 inline-flex h-10 items-center whitespace-nowrap gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-card transition-[transform,background-color] hover:bg-primary/90 active:translate-y-px"
            >
              <span className="sm:hidden">Try sample</span>
              <span className="hidden sm:inline">Start with sample family</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
