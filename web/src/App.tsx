import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { RequireRole } from '@/components/RequireRole'
import CaregiverSetup from '@/pages/CaregiverSetup'
import FamilyView from '@/pages/FamilyView'
import Home from '@/pages/Home'
import RestGridPage from '@/pages/RestGridPage'
import StudentBoard from '@/pages/StudentBoard'
import ChaperoneView from '@/pages/ChaperoneView'
import DayOfServiceBoard from '@/pages/DayOfServiceBoard'

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
          <Route
            path="family"
            element={
              <RequireRole role="family">
                <FamilyView />
              </RequireRole>
            }
          />
          <Route
            path="student"
            element={
              <RequireRole role="student">
                <StudentBoard />
              </RequireRole>
            }
          />
          <Route
            path="chaperone"
            element={
              <RequireRole role="chaperone">
                <ChaperoneView />
              </RequireRole>
            }
          />
          <Route path="grid/:circleId" element={<RestGridPage />} />
        </Route>
        <Route path="board" element={<DayOfServiceBoard />} />
      </Routes>
    </BrowserRouter>
  )
}
