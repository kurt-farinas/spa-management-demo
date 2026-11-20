import { Suspense, useRef, useState } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { PiList, PiX, PiSignOut, PiCaretDown } from 'react-icons/pi'
import { useRole } from '../auth/RoleProvider.jsx'
import { PAGES, canSee } from '../auth/roles.js'
import { Brand } from '../components/Brand.jsx'
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
        `flex min-h-11 items-center gap-3 rounded-lg px-3.5 text-sm transition-colors ${
          isActive ? 'bg-rail-active font-medium text-rail-ink' : 'text-line hover:bg-rail-active/50 hover:text-white'
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
          <div className="mx-3 my-3.5 h-px bg-rail-active" />
          <div className="px-3.5 pb-1.5 text-[11px] tracking-[0.1em] text-line">REPORTS</div>
          {reports.map(item)}
        </>
      )}
    </>
  )
}

function RoleSwitch({ role, login, dark }) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Viewing as</span>
      <select
        value={role}
        onChange={(e) => login(e.target.value)}
        className={`h-11 cursor-pointer appearance-none rounded-full border pr-9 pl-4 text-sm ${
          dark ? 'border-rail-active bg-rail text-line' : 'border-line bg-surface text-ink'
        }`}
      >
        <option value="owner">Owner</option>
        <option value="receptionist">Receptionist</option>
      </select>
      <PiCaretDown aria-hidden="true" className={`pointer-events-none absolute right-3.5 size-4 ${dark ? 'text-line' : 'text-muted'}`} />
    </label>
  )
}

function DemoNote({ onDismiss, className }) {
  return (
    <p className={`flex items-center gap-1 text-xs ${className}`}>
      Demo · sample data, resets on reload
      <button type="button" aria-label="Dismiss demo note" onClick={onDismiss} className="-my-2 inline-flex size-11 items-center justify-center rounded-full">
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

  return (
    <div className="flex min-h-dvh">
      <nav aria-label="Main" className="on-rail sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-1 overflow-y-auto bg-rail px-4 py-7 md:flex">
        <div className="px-3 pb-7">
          <Brand />
        </div>
        <NavItems role={role} />
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* phone top bar; the page header below continues its rail band */}
        <header className="on-rail flex flex-wrap items-center justify-between gap-2 bg-rail px-4 pt-4 pb-3 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => menu.current?.showModal()}
            className="inline-flex size-11 items-center justify-center rounded-full border border-rail-active text-rail-ink"
          >
            <PiList aria-hidden="true" className="size-5" />
          </button>
          <span className="font-heading text-xl text-rail-ink">{spaConfig.logoText}</span>
          <RoleSwitch role={role} login={login} dark />
          {demoNote && <DemoNote onDismiss={() => setDemoNote(false)} className="basis-full justify-center text-line" />}
        </header>

        <div className="hidden items-center justify-end gap-2 px-10 pt-6 md:flex">
          {demoNote && <DemoNote onDismiss={() => setDemoNote(false)} className="mr-auto text-muted" />}
          <RoleSwitch role={role} login={login} />
          <button type="button" onClick={signOut} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-muted hover:text-ink">
            <PiSignOut aria-hidden="true" className="size-4" />
            Log out
          </button>
        </div>

        <main className="flex-1 px-4 pb-28 md:px-10 md:pb-12">
          <Suspense fallback={<p role="status" className="py-16 text-center text-sm text-muted">Loading…</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <dialog
        ref={menu}
        aria-label="Menu"
        onClick={(e) => e.target === menu.current && closeMenu()}
        className="on-rail m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-rail p-0 text-line backdrop:bg-rail-active/60"
      >
        <div className="flex h-full flex-col gap-1 px-4 py-5">
          <div className="flex items-center justify-between pb-5 pl-3">
            <Brand />
            <button type="button" aria-label="Close menu" onClick={closeMenu} className="inline-flex size-11 items-center justify-center rounded-full text-rail-ink">
              <PiX aria-hidden="true" className="size-5" />
            </button>
          </div>
          <NavItems role={role} onNavigate={closeMenu} />
          <button type="button" onClick={signOut} className="mt-auto flex min-h-11 items-center gap-3 rounded-lg px-3.5 text-sm text-line hover:bg-rail-active/50">
            <PiSignOut aria-hidden="true" className="size-[18px]" />
            Log out
          </button>
        </div>
      </dialog>

      <nav aria-label="Quick" className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t border-soft bg-surface px-1 pt-1.5 pb-3.5 md:hidden">
        {BOTTOM_NAV.filter(([key]) => canSee(role, key)).map(([key, label]) => (
          <NavLink
            key={key}
            to={PAGES.find((p) => p.key === key).path}
            end
            className={({ isActive }) =>
              `flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] ${isActive ? 'font-semibold text-ink' : 'text-muted'}`
            }
          >
            {({ isActive }) => (
              <>
                <span aria-hidden="true" className={`size-1.5 rounded-full ${isActive ? 'bg-accent' : 'bg-transparent'}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
