import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PAGES } from '../auth/roles.js'
import { RequireRole } from '../components/RequireRole.jsx'
import { AppShell } from '../layout/AppShell.jsx'
import { Login } from '../pages/Login.jsx'
import { ComingSoon } from '../pages/ComingSoon.jsx'

// pages load on first visit (AppShell's Suspense shows the fallback); they use named exports
const named = (load, name) => lazy(() => load().then((m) => ({ default: m[name] })))
const Dashboard = named(() => import('../pages/Dashboard.jsx'), 'Dashboard')
const Clients = named(() => import('../pages/Clients.jsx'), 'Clients')
const ClientProfile = named(() => import('../pages/ClientProfile.jsx'), 'ClientProfile')
const Employees = named(() => import('../pages/Employees.jsx'), 'Employees')
const EmployeeProfile = named(() => import('../pages/EmployeeProfile.jsx'), 'EmployeeProfile')
const Services = named(() => import('../pages/Services.jsx'), 'Services')
const Appointments = named(() => import('../pages/Appointments.jsx'), 'Appointments')
const Pos = named(() => import('../pages/Pos.jsx'), 'Pos')
const Inventory = named(() => import('../pages/Inventory.jsx'), 'Inventory')
const FinancialStatement = named(() => import('../pages/FinancialStatement.jsx'), 'FinancialStatement')
const SalesReport = named(() => import('../pages/SalesReport.jsx'), 'SalesReport')

// One entry per built page; pages not listed here show ComingSoon.
const PAGE_ELEMENTS = {
  dashboard: <Dashboard />,
  appointments: <Appointments />,
  clients: <Clients />,
  employees: <Employees />,
  services: <Services />,
  pos: <Pos />,
  inventory: <Inventory />,
  'financial-statement': <FinancialStatement />,
  'sales-report': <SalesReport />,
}

// Detail routes: { path, page (the PAGES key that guards it), element }.
const DETAIL_ROUTES = [
  { path: '/clients/:id', page: 'clients', element: <ClientProfile /> },
  { path: '/employees/:id', page: 'employees', element: <EmployeeProfile /> },
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
