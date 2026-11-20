import { Link } from 'react-router-dom'
import { useDemoStore } from '../data/DemoStore.jsx'
import { useRole } from '../auth/RoleProvider.jsx'
import { canSee } from '../auth/roles.js'
import { dashboardStats, todaysAppointments, dailySales, incomeStatement } from '../data/selectors.js'
import { toDateStr } from '../data/dates.js'
import { spaConfig } from '../config/spa.config.js'
import { formatPeso } from '../lib/money.js'
import { StatCard } from '../components/StatCard.jsx'
import { linkClass, primaryButton, STATUS_PILL as PILL, CATEGORY_BAND, categoryBand } from '../components/ui.js'
import { clock } from '../lib/format.js'
import { SalesBarChart } from '../components/charts/SalesBarChart.jsx'

const FIRST_NAME = { owner: spaConfig.staff.ownerName, receptionist: spaConfig.staff.receptionistName }

const greeting = (hour) => (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening')

// one link: in the header from md up, a floating button above the bottom nav below md
const NEW_SALE = `${primaryButton} max-md:fixed max-md:right-4 max-md:bottom-[88px] max-md:z-20 max-md:h-12 max-md:rounded-full max-md:pr-5 max-md:pl-4 max-md:text-[15px] max-md:shadow-[0_2px_6px_color-mix(in_srgb,var(--color-ink)_18%,transparent)]`

function Panel({ title, action, children }) {
  return (
    <section aria-label={title} className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-line px-3.5 md:min-h-14 md:px-5">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

const ROW = 'flex items-center gap-3 pr-3.5 md:gap-4 md:pr-5'
const TIME = 'w-[58px] shrink-0 md:w-[72px]'
const WHO = 'min-w-0 flex-1 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5rem] md:items-center md:gap-4'
const STATUS = 'shrink-0 md:w-24'

export function Dashboard() {
  const { state } = useDemoStore()
  const { role } = useRole()
  const now = new Date()
  const stats = dashboardStats(state, now)
  const appointments = todaysAppointments(state, now)
  // still to come first, then the rest; cancelled and no-show stay listed
  const list = [...appointments.filter((a) => a.status === 'booked'), ...appointments.filter((a) => a.status !== 'booked')]
  const serviceIdOf = new Map(state.appointments.map((a) => [a.id, a.serviceId]))
  const categoryById = (id) => state.services.find((s) => s.id === id)?.category
  const categoryByName = (name) => state.services.find((s) => s.name === name)?.category
  const days = dailySales(state.sales, now, 14)
  const done = appointments.filter((a) => a.status === 'done').length
  const toGo = appointments.filter((a) => a.status === 'booked').length
  const lowStock = state.products.filter((p) => p.stock <= p.reorderAt).sort((a, b) => a.stock - b.stock)
  const salesCount = days.at(-1).count
  const topMax = Math.max(1, ...stats.topServices.map((s) => s.count))

  return (
    <div className="flex flex-col gap-4 max-md:pb-10 md:gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] leading-7 font-bold md:text-2xl md:leading-8">
            {greeting(now.getHours())}, {FIRST_NAME[role]}
          </h1>
          <p className="text-sm text-muted">
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/pos" className={NEW_SALE}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" />
          </svg>
          New sale
        </Link>
      </header>

      <section aria-label="Today at a glance" className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fit,minmax(190px,1fr))] md:gap-6">
        <StatCard label="Today's sales" value={formatPeso(stats.salesToday)} note={`${salesCount} ${salesCount === 1 ? 'sale' : 'sales'} so far`} />
        <StatCard label="Bookings today" value={stats.bookingsToday} note={`${done} done · ${toGo} to go`} />
        <StatCard label="New clients this month" value={stats.newClientsThisMonth} note={`${state.clients.length} clients in all`} />
        {canSee(role, 'profit') && (
          <StatCard label="Profit this month" value={formatPeso(incomeStatement(state, toDateStr(now).slice(0, 7)).netIncome)} note="Owner only" />
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-4 md:gap-6 lg:col-span-7">
          <Panel
            title="Today's appointments"
            action={
              <div className="flex items-center gap-4">
                <ul aria-hidden="true" className="hidden gap-3 text-xs text-muted xl:flex">
                  {Object.keys(CATEGORY_BAND).map((c) => (
                    <li key={c} className="inline-flex items-center gap-1">
                      <span className={`size-2 rounded-sm ${categoryBand(c)}`} />
                      {c}
                    </li>
                  ))}
                </ul>
                <Link to="/appointments" className={`${linkClass} min-w-11 justify-end`}>
                  See all{appointments.length > 0 && ` ${appointments.length}`}
                </Link>
              </div>
            }
          >
            {list.length === 0 ? (
              <p className="px-3.5 py-6 text-sm text-muted md:px-5">No appointments today</p>
            ) : (
              <>
                <div aria-hidden="true" className={`${ROW} hidden h-9 border-b border-line text-xs font-semibold text-muted md:flex`}>
                  <span className="w-1 shrink-0" />
                  <span className={TIME}>Time</span>
                  <span className={WHO}>
                    <span>Client</span>
                    <span>Service</span>
                    <span>Therapist</span>
                  </span>
                  <span className={STATUS}>Status</span>
                </div>
                <ul>
                  {list.slice(0, 6).map((a) => {
                    const [label, pill] = PILL[a.status] ?? PILL.booked
                    const off = a.status === 'cancelled' || a.status === 'no-show'
                    return (
                      <li key={a.id} className={`${ROW} min-h-[60px] border-b border-line last:border-b-0 md:min-h-11 ${off ? 'text-muted' : ''}`}>
                        <span aria-hidden="true" className={`w-1 shrink-0 self-stretch ${categoryBand(categoryById(serviceIdOf.get(a.id)))}`} />
                        <span className={`${TIME} text-[13px] font-semibold tabular-nums md:text-sm ${off ? 'line-through' : ''}`}>{clock(a.time)}</span>
                        <span className={`${WHO} ${off ? 'line-through' : ''}`}>
                          <span className="block truncate text-sm font-semibold md:font-normal">{a.clientName}</span>
                          <span className={`block truncate text-xs text-muted md:contents md:text-sm ${off ? '' : 'md:text-ink'}`}>
                            <span className="md:truncate">{a.serviceName}</span>
                            <span className="md:hidden"> · </span>
                            <span className="md:truncate">{a.employeeName.split(' ')[0]}</span>
                          </span>
                        </span>
                        <span className={STATUS}>
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${pill}`}>{label}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </Panel>

          <Panel title="Running low" action={canSee(role, 'inventory') && <Link to="/inventory" className={linkClass}>Open inventory</Link>}>
            {lowStock.length === 0 ? (
              <p className="px-3.5 py-4 text-sm text-muted md:px-5">Nothing is running low</p>
            ) : (
              <ul>
                {lowStock.map((p) => (
                  <li key={p.id} className="flex min-h-12 items-center gap-3 border-b border-line px-3.5 text-sm last:border-b-0 md:px-5">
                    <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    <span className="shrink-0 font-semibold tabular-nums">{p.stock} left</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-4 md:gap-6 lg:col-span-5">
          <Panel title="Sales, last 14 days" action={canSee(role, 'sales-report') && <Link to="/sales-report" className={linkClass}>Sales report</Link>}>
            <div className="px-3.5 pb-3 md:px-5">
              <SalesBarChart days={days} />
            </div>
          </Panel>

          <Panel title="Top services this month" action={<span className="text-[13px] text-muted">Sold</span>}>
            {stats.topServices.length === 0 ? (
              <p className="px-3.5 py-4 text-sm text-muted md:px-5">No services sold yet this month</p>
            ) : (
              <ol className="px-3.5 py-2 md:px-5 md:pb-4">
                {stats.topServices.map((s) => (
                  <li key={s.name} className="grid min-h-9 grid-cols-[8.75rem_1fr_2rem] items-center gap-3 text-sm">
                    <span className="truncate">{s.name}</span>
                    <span aria-hidden="true" className="h-2 rounded-full bg-soft">
                      <span className={`block h-2 rounded-full ${categoryBand(categoryByName(s.name))}`} style={{ width: `${(s.count / topMax) * 100}%` }} />
                    </span>
                    <span className="text-right font-semibold tabular-nums">{s.count}</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
