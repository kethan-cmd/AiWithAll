import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'

// Every page is its own chunk, so the landing page stays light and the
// on-device reading code only loads on the pages that use it.
const Landing = lazy(() => import('@/pages/Landing'))
const Start = lazy(() => import('@/pages/Start'))
const Read = lazy(() => import('@/pages/Read'))
const Matches = lazy(() => import('@/pages/Matches'))
const Draft = lazy(() => import('@/pages/Draft'))
const Plan = lazy(() => import('@/pages/Plan'))
const Family = lazy(() => import('@/pages/Family'))
const Sources = lazy(() => import('@/pages/Sources'))

function PageFallback() {
  return <div className="min-h-[50vh]" aria-busy="true" />
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Landing />} />
            <Route path="start" element={<Start />} />
            <Route path="read" element={<Read />} />
            <Route path="matches" element={<Matches />} />
            <Route path="draft/:programId" element={<Draft />} />
            <Route path="plan" element={<Plan />} />
            <Route path="family" element={<Family />} />
            <Route path="sources" element={<Sources />} />
            <Route path="*" element={<Landing />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
