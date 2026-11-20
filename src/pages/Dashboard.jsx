import { Link } from 'react-router-dom'
import { useDemoStore } from '../data/DemoStore.jsx'
import { useRole } from '../auth/RoleProvider.jsx'
import { canSee } from '../auth/roles.js'
import { dashboardStats, todaysAppointments, agenda, dailySales, incomeStatement } from '../data/selectors.js'
import { toDateStr } from '../data/dates.js'
import { spaConfig } from '../config/spa.config.js'
import { formatPeso } from '../lib/money.js'
import { StatCard } from '../components/StatCard.jsx'
import { linkClass, STATUS_PILL as PILL } from '../components/ui.js'
import { clock } from '../lib/format.js'
import { SalesBarChart } from '../components/charts/SalesBarChart.jsx'

const FIRST_NAME = { owner: spaConfig.staff.ownerName, receptionist: spaConfig.staff.receptionistName }

const greeting = (hour) => (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening')

function Panel({ title, action, className = 'border border-tint bg-surface', titleClass = '', children }) {
  return (
    <section aria-label={title} className={`min-w-0 rounded-2xl px-5 py-4 md:px-[22px] ${className}`}>
      <div className="flex min-h-11 items-center justify-between gap-3">
        <h2 className={`font-heading text-[19px] font-medium ${titleClass}`}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Dashboard() {
  const { state } = useDemoStore()
  const { role } = useRole()
  const now = new Date()
  const stats = dashboardStats(state, now)
  const appointments = todaysAppointments(state, now)
  const list = agenda(appointments)
  const days = dailySales(state.sales, now, 14)
  const done = appointments.filter((a) => a.status === 'done').length
  const toGo = appointments.filter((a) => a.status === 'booked').length
  const lowStock = state.products.filter((p) => p.stock <= p.reorderAt).sort((a, b) => a.stock - b.stock)
  const salesCount = days.at(-1).count

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <header className="on-plum-mobile -mx-4 flex flex-wrap items-end justify-between gap-4 bg-plum px-4 pt-1 pb-6 md:mx-0 md:bg-transparent md:p-0">
        <div>
          <div className="text-xs text-lavender md:text-[13px] md:text-muted">
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 className="mt-1 font-heading text-[26px] font-medium text-white md:text-[32px] md:text-ink">
            {greeting(now.getHours())}, {FIRST_NAME[role]}
          </h1>
        </div>
        <Link
          to="/pos"
          className="inline-flex h-11 items-center rounded-full bg-gold-on-plum px-5 text-sm font-medium text-plum hover:bg-white md:bg-plum md:text-gold-on-plum md:hover:bg-plum-light"
        >
          New sale
        </Link>
      </header>

      <section aria-label="Today at a glance" className="grid grid-cols-2 gap-2.5 md:grid-cols-[repeat(auto-fit,minmax(190px,1fr))] md:gap-4">
        <StatCard label="Today's sales" value={formatPeso(stats.salesToday)} note={`${salesCount} ${salesCount === 1 ? 'sale' : 'sales'} so far`} />
        <StatCard label="Bookings today" value={stats.bookingsToday} note={`${done} done · ${toGo} to go`} />
        <StatCard label="New clients this month" value={stats.newClientsThisMonth} note={`${state.clients.length} clients in all`} />
        {canSee(role, 'profit') && (
          <StatCard dark label="Profit this month" value={formatPeso(incomeStatement(state, toDateStr(now).slice(0, 7)).netIncome)} note="Owner only" />
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Sales, last 14 days" className="self-start border border-tint bg-surface" action={canSee(role, 'sales-report') && <Link to="/sales-report" className={linkClass}>Sales report</Link>}>
          <SalesBarChart days={days} />
        </Panel>

        <Panel title="Today's appointments" action={<Link to="/appointments" className={linkClass}>See all</Link>}>
          {list.length === 0 ? (
            <p className="py-6 text-sm text-muted">No appointments today</p>
          ) : (
            <ul className="mt-1">
              {list.slice(0, 6).map((a) => {
                const [label, pill] = PILL[a.status] ?? PILL.booked
                return (
                  <li key={a.id} className="flex items-center gap-3.5 border-b border-tint py-2.5 last:border-b-0">
                    <span className="w-[68px] shrink-0 text-[13px] font-semibold tabular-nums">{clock(a.time)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{a.clientName}</span>
                      <span className="block truncate text-xs text-muted">
                        {a.serviceName} · {a.employeeName.split(' ')[0]}
                      </span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${pill}`}>{label}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Top services this month">
          {stats.topServices.length === 0 ? (
            <p className="py-4 text-sm text-muted">No services sold yet this month</p>
          ) : (
            <ol>
              {stats.topServices.map((s, i) => (
                <li key={s.name} className="flex justify-between gap-3 py-2 text-sm">
                  <span>
                    {i + 1} · {s.name}
                  </span>
                  <span className="shrink-0 text-muted tabular-nums">{s.count} booked</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel
          title="Running low"
          className="bg-warn-bg text-warn-ink"
          titleClass="text-warn-ink"
          action={canSee(role, 'inventory') && <Link to="/inventory" className={`${linkClass} text-warn-ink underline`}>Open inventory</Link>}
        >
          {lowStock.length === 0 ? (
            <p className="py-4 text-sm">Nothing is running low</p>
          ) : (
            <ul>
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between gap-3 py-2 text-sm">
                  <span>{p.name}</span>
                  <span className="shrink-0 tabular-nums">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
