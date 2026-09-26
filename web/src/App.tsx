import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { RequireRole } from '@/components/RequireRole'
import CaregiverSetup from '@/pages/CaregiverSetup'
import Home from '@/pages/Home'
import RestGridPage from '@/pages/RestGridPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="caregiver"
            element={
              <RequireRole role="caregiver">
                <CaregiverSetup />
              </RequireRole>
            }
          />
          <Route path="grid/:circleId" element={<RestGridPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
