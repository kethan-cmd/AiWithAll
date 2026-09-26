import { Outlet } from 'react-router-dom'

// Placeholder shell. Builder A replaces this with the real header/footer.
export default function AppShell() {
  return (
    <main>
      <Outlet />
    </main>
  )
}
