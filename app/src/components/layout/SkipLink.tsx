import type { MouseEvent } from 'react'

/** First focusable element on every page. Moves focus to <main id="main">
 *  without touching the URL hash (the router lives in the hash). */
export default function SkipLink() {
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const main = document.getElementById('main')
    if (main) {
      main.focus()
      main.scrollIntoView({ block: 'start' })
    }
  }
  return (
    <a
      href="#main"
      onClick={onClick}
      data-print-hide
      className="sr-only z-[100] rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lift focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to main content
    </a>
  )
}
