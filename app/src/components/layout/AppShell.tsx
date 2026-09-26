import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SkipLink from './SkipLink'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

/** Scroll to the top on a new page, or to #anchor when the route has one.
 *  Pages load lazily, so the anchor is retried for a moment until it exists. */
function useScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      return
    }
    const id = decodeURIComponent(hash.slice(1))
    let tries = 0
    let timer = 0
    const attempt = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ block: 'start' })
        return
      }
      if (tries++ < 20) timer = window.setTimeout(attempt, 50)
    }
    attempt()
    return () => window.clearTimeout(timer)
  }, [pathname, hash])
}

export default function AppShell() {
  useScrollManager()
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
