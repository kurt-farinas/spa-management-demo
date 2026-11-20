import { Navigate, Route, Routes } from 'react-router-dom'
import { PAGES } from '../auth/roles.js'
import { RequireRole } from '../components/RequireRole.jsx'
import { AppShell } from '../layout/AppShell.jsx'
import { Login } from '../pages/Login.jsx'
import { Dashboard } from '../pages/Dashboard.jsx'
import { ComingSoon } from '../pages/ComingSoon.jsx'
import { Clients } from '../pages/Clients.jsx'
import { ClientProfile } from '../pages/ClientProfile.jsx'

// One entry per built page; pages not listed here show ComingSoon.
const PAGE_ELEMENTS = {
  dashboard: <Dashboard />,
  clients: <Clients />,
}

// Detail routes: { path, page (the PAGES key that guards it), element }.
const DETAIL_ROUTES = [
  { path: '/clients/:id', page: 'clients', element: <ClientProfile /> },
]

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppShell />}>
        {PAGES.map((p) => (
          <Route
            key={p.key}
            path={p.path}
            element={<RequireRole page={p.key}>{PAGE_ELEMENTS[p.key] ?? <ComingSoon page={p} />}</RequireRole>}
          />
        ))}
        {DETAIL_ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={<RequireRole page={r.page}>{r.element}</RequireRole>} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
