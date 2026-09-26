import { Link } from 'react-router-dom'
import Wordmark from '@/components/brand/Wordmark'

const footLink = 'rounded-sm text-on-deep-muted underline-offset-4 transition-colors hover:text-on-deep hover:underline'

export default function SiteFooter() {
  return (
    <footer data-print-hide className="grain relative mt-24 overflow-hidden bg-evergreen-deep text-on-deep">
      <div className="container-page relative z-10 py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-md">
            <Wordmark onDark />
            <p className="mt-4 font-heading text-xl leading-snug text-on-deep">
              The paperwork you already have, turned into applications ready to sign.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-on-deep-muted">
              Caregiving is a good deed done every day, often alone. This turns a scattered family into one team.
            </p>
          </div>
          <div>
            <h2 className="eyebrow font-sans text-gold">The app</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className={footLink} to="/start?sample=1">Try the sample family</Link></li>
              <li><Link className={footLink} to="/start">Use my own documents</Link></li>
              <li><Link className={footLink} to={{ pathname: '/', hash: '#how-it-works' }}>How it works</Link></li>
              <li><Link className={footLink} to={{ pathname: '/', hash: '#privacy' }}>Privacy promises</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="eyebrow font-sans text-gold">Trust</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className={footLink} to="/sources">Sources and rules we use</Link></li>
              <li><Link className={footLink} to={{ pathname: '/sources', hash: '#method' }}>Method and limits</Link></li>
              <li><Link className={footLink} to={{ pathname: '/', hash: '#faq' }}>Questions</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/12 pt-6 text-xs leading-relaxed text-on-deep-muted sm:flex-row sm:items-start sm:justify-between">
          <p>Built for the AI with All Youth Hackathon, 9/11 Day of Service.</p>
          <p className="max-w-xl sm:text-right">
            Not affiliated with Medicare, SSA or NCOA. Estimates only; confirm with a free SHIP counselor.
          </p>
        </div>
      </div>
    </footer>
  )
}
