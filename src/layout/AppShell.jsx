import { Suspense, useRef, useState } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { PiList, PiX, PiSignOut, PiCaretDown } from 'react-icons/pi'
import { useRole } from '../auth/RoleProvider.jsx'
import { PAGES, canSee } from '../auth/roles.js'
import { Brand, Leaf } from '../components/Brand.jsx'
import { secondaryButton } from '../components/ui.js'
import { spaConfig } from '../config/spa.config.js'

const BOTTOM_NAV = [
  ['dashboard', 'Home'],
  ['appointments', 'Bookings'],
  ['clients', 'Clients'],
  ['pos', 'Sell'],
]

function NavItems({ role, onNavigate }) {
  const visible = PAGES.filter((p) => canSee(role, p.key))
  const item = (p) => (
    <NavLink
      key={p.key}
      to={p.path}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        // rail-ink on rail is covered by themeContrast.test.js
        `flex min-h-11 items-center gap-3 rounded-md border-l-[3px] px-3 text-sm transition-colors ${
          isActive
            ? 'border-highlight bg-rail-active font-semibold text-rail-ink'
            : 'border-transparent font-medium text-rail-ink hover:bg-rail-active hover:text-rail-ink'
        }`
      }
    >
      <p.icon aria-hidden="true" className="size-[18px] shrink-0" />
      {p.label}
    </NavLink>
  )
  const reports = visible.filter((p) => p.section === 'Reports')
  return (
    <>
      {visible.filter((p) => !p.section).map(item)}
      {reports.length > 0 && (
        <>
          <div className="px-3 pt-6 pb-2 text-[11px] font-semibold tracking-[0.14em] text-rail-ink">REPORTS</div>
          {reports.map(item)}
        </>
      )}
    </>
  )
}

function RoleSwitch({ role, login }) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px] text-muted">
      <span className="sr-only">Viewing as</span>
      <span className="relative inline-flex items-center">
        <select
          value={role}
          onChange={(e) => login(e.target.value)}
          className="h-11 cursor-pointer appearance-none rounded-md border border-line bg-surface pr-8 pl-3 text-sm font-medium text-ink"
        >
          <option value="owner">Owner</option>
          <option value="receptionist">Receptionist</option>
        </select>
        <PiCaretDown aria-hidden="true" className="pointer-events-none absolute right-2.5 size-4 text-muted" />
      </span>
    </label>
  )
}

function DemoNote({ onDismiss, className }) {
  return (
    <p className={`flex items-center gap-2 text-[13px] text-muted ${className}`}>
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />
      Demo · sample data, resets on reload
      <button
        type="button"
        aria-label="Dismiss demo note"
        onClick={onDismiss}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-md hover:text-ink"
      >
        <PiX aria-hidden="true" className="size-3.5" />
      </button>
    </p>
  )
}

export function AppShell() {
  const { role, login, logout } = useRole()
  const navigate = useNavigate()
  const menu = useRef(null)
  const [demoNote, setDemoNote] = useState(true)
  if (!role) return <Navigate to="/login" replace />

  const signOut = () => {
    logout()
    navigate('/login')
  }
  const closeMenu = () => menu.current?.close()
  const dismissNote = () => setDemoNote(false)

  return (
    <div className="flex min-h-dvh">
      <nav aria-label="Main" className="on-rail sticky top-0 hidden h-dvh w-58 shrink-0 flex-col gap-1 overflow-y-auto bg-rail px-4 py-6 md:flex">
        <div className="px-2 pb-6">
          <Brand />
        </div>
        <NavItems role={role} />
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="on-rail flex h-14 items-center gap-1 bg-rail pr-3 pl-1 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => menu.current?.showModal()}
            className="inline-flex size-11 items-center justify-center rounded-md text-rail-ink"
          >
            <PiList aria-hidden="true" className="size-[22px]" />
          </button>
          <span className="mr-auto flex items-center gap-1.5 text-lg font-bold text-rail-ink">
            <Leaf className="size-5" />
            {spaConfig.logoText}
          </span>
          <RoleSwitch role={role} login={login} />
        </header>
        {demoNote && <DemoNote onDismiss={dismissNote} className="h-11 border-b border-line bg-surface pl-4 md:hidden [&>button]:ml-auto" />}

        <div className="hidden h-14 items-center justify-end gap-2 border-b border-line px-8 md:flex">
          {demoNote && <DemoNote onDismiss={dismissNote} className="mr-auto" />}
          <RoleSwitch role={role} login={login} />
          <button type="button" onClick={signOut} className={secondaryButton}>
            <PiSignOut aria-hidden="true" className="size-4" />
            Log out
          </button>
        </div>

        <main className="flex-1 px-4 pt-4 pb-28 md:px-8 md:pt-6 md:pb-12">
          <Suspense fallback={<p role="status" className="py-16 text-center text-sm text-muted">Loading…</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <dialog
        ref={menu}
        aria-label="Menu"
        onClick={(e) => e.target === menu.current && closeMenu()}
        className="on-rail m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-rail p-0 text-rail-ink backdrop:bg-rail-active/60"
      >
        <div className="flex h-full flex-col gap-1 px-4 py-5">
          <div className="flex items-center justify-between pb-5 pl-2">
            <Brand />
            <button type="button" aria-label="Close menu" onClick={closeMenu} className="inline-flex size-11 items-center justify-center rounded-md text-rail-ink">
              <PiX aria-hidden="true" className="size-5" />
            </button>
          </div>
          <NavItems role={role} onNavigate={closeMenu} />
          <button
            type="button"
            onClick={signOut}
            className="mt-auto flex min-h-11 items-center gap-3 rounded-md px-3.5 text-sm font-medium text-rail-ink hover:bg-rail-active hover:text-rail-ink"
          >
            <PiSignOut aria-hidden="true" className="size-[18px]" />
            Log out
          </button>
        </div>
      </dialog>

      <nav aria-label="Quick" className="fixed inset-x-0 bottom-0 grid h-16 grid-cols-4 border-t border-line bg-surface md:hidden">
        {BOTTOM_NAV.filter(([key]) => canSee(role, key)).map(([key, label]) => {
          const page = PAGES.find((p) => p.key === key)
          return (
            <NavLink
              key={key}
              to={page.path}
              end
              className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 text-xs ${isActive ? 'font-bold text-ink' : 'font-medium text-muted'}`}
            >
              {({ isActive }) => (
                <>
                  <span aria-hidden="true" className={`grid h-7 w-13 place-items-center rounded-full ${isActive ? 'bg-highlight' : ''}`}>
                    <page.icon className="size-5" />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
