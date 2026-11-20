import { useParams } from 'react-router-dom'
import { PiPhone } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { useRole } from '../auth/RoleProvider.jsx'
import { canSee } from '../auth/roles.js'
import { employeeStats, employeeMonthAppointments } from '../data/selectors.js'
import { toDateStr } from '../data/dates.js'
import { formatPeso } from '../lib/money.js'
import { StatCard } from '../components/StatCard.jsx'
import { WEEK, clock, nameOf } from '../lib/format.js'
import { Avatar } from '../components/Avatar.jsx'
import { BackLink } from '../components/BackLink.jsx'
import { STATUS_PILL as PILL, categoryBand } from '../components/ui.js'
const dayLabel = (day) => new Date(`${day}T00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

export function EmployeeProfile() {
  const { id } = useParams()
  const { state } = useDemoStore()
  const { role } = useRole()
  const employee = state.employees.find((e) => e.id === id)

  if (!employee) {
    return (
      <div className="flex flex-col gap-3 pt-6 md:pt-4">
        <h1 className="text-[22px] leading-7 font-bold md:text-2xl md:leading-8">Employee not found</h1>
        <p className="text-muted">There is no one on the team with that link.</p>
        <BackLink to="/employees">Back to employees</BackLink>
      </div>
    )
  }

  const now = new Date()
  const month = toDateStr(now).slice(0, 7)
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const stats = employeeStats(state, employee.id, month)
  const appointments = employeeMonthAppointments(state, employee.id, month)
  const categoryOf = (serviceId) => state.services.find((s) => s.id === serviceId)?.category
  const since = new Date(`${employee.hiredOn}T00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <BackLink to="/employees">All employees</BackLink>

      <div className="flex flex-col gap-4 md:gap-5">
        <section aria-label={`${employee.name} details`} className="flex flex-wrap items-start gap-x-12 gap-y-4 rounded-lg border border-line bg-surface px-3.5 py-4 md:px-5">
          <div className="flex items-center gap-3.5">
            <Avatar name={employee.name} large />
            <div className="min-w-0">
              <h1 className="text-[22px] leading-7 font-bold md:text-2xl md:leading-8">{employee.name}</h1>
              <div className="text-sm text-muted">
                {employee.role} · On the team since {since}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[13px] font-semibold text-muted">Contact</h2>
            <a href={`tel:${employee.phone.replaceAll(' ', '')}`} className="inline-flex min-h-11 items-center gap-2 text-sm tabular-nums underline-offset-4 hover:underline">
              <PiPhone aria-hidden="true" className="text-muted" /> {employee.phone}
            </a>
          </div>

          <div className="w-full max-w-[320px]">
            <h2 className="text-[13px] font-semibold text-muted">Weekly schedule</h2>
            <ul className="mt-2 grid grid-cols-7 gap-1">
              {WEEK.map((d) => {
                const on = employee.schedule.includes(d)
                return (
                  <li key={d} className={`rounded-md border px-0.5 py-1.5 text-center ${on ? 'border-transparent bg-soft text-ink' : 'border-dashed border-line text-muted'}`}>
                    <span className="block text-xs font-semibold">{d}</span>
                    <span className="mt-0.5 block text-[11px]">{on ? 'In' : 'Off'}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          <section aria-label="This month" className="flex flex-col gap-2.5">
            <h2 className="text-[15px] font-semibold">{monthName}</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fit,minmax(190px,1fr))] md:gap-6">
              <StatCard label="Appointments" value={stats.appointments} note="Not counting cancelled" />
              <StatCard label="Services done" value={stats.servicesDone} note="From paid sales" />
              <StatCard label="Service sales" value={formatPeso(stats.serviceSales)} />
              {canSee(role, 'commission') && <StatCard label="Commission earned" value={formatPeso(stats.commission)} note="Owner only" />}
            </div>
          </section>

          <section aria-label="Appointments this month" className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
            <h2 className="flex min-h-11 items-center border-b border-line px-3.5 text-[15px] font-semibold md:min-h-14 md:px-5">Appointments this month</h2>
            {appointments.length === 0 ? (
              <p className="px-3.5 py-6 text-sm text-muted md:px-5">No appointments this month</p>
            ) : (
              <ul>
                {appointments.map((a) => {
                  const [label, pill] = PILL[a.status] ?? PILL.booked
                  // cancelled and no-show stay listed, struck through
                  const off = a.status === 'cancelled' || a.status === 'no-show'
                  return (
                    <li key={a.id} className={`flex min-h-[60px] items-center gap-3 border-b border-line pr-3.5 last:border-b-0 md:gap-4 md:pr-5 ${off ? 'text-muted' : ''}`}>
                      <span aria-hidden="true" className={`w-1 shrink-0 self-stretch ${categoryBand(categoryOf(a.serviceId))}`} />
                      <span className={`w-[92px] shrink-0 text-[13px] tabular-nums ${off ? 'line-through' : ''}`}>
                        <span className="block font-semibold">{dayLabel(a.start.slice(0, 10))}</span>
                        <span className="block text-xs text-muted">{clock(a.start.slice(11))}</span>
                      </span>
                      <span className={`min-w-0 flex-1 ${off ? 'line-through' : ''}`}>
                        <span className="block truncate text-sm font-semibold">{nameOf(state.clients, a.clientId)}</span>
                        <span className="block truncate text-xs text-muted">{nameOf(state.services, a.serviceId)}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${pill}`}>{label}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
