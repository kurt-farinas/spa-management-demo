import { Navigate, Route, Routes } from 'react-router-dom'
import { PAGES } from '../auth/roles.js'
import { RequireRole } from '../components/RequireRole.jsx'
import { AppShell } from '../layout/AppShell.jsx'
import { Login } from '../pages/Login.jsx'
import { Dashboard } from '../pages/Dashboard.jsx'
import { ComingSoon } from '../pages/ComingSoon.jsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppShell />}>
        {PAGES.map((p) => (
          <Route
            key={p.key}
            path={p.path}
            element={<RequireRole page={p.key}>{p.key === 'dashboard' ? <Dashboard /> : <ComingSoon page={p} />}</RequireRole>}
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
