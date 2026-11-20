import { Link, useParams } from 'react-router-dom'
import { PiArrowLeft, PiPhone } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { useRole } from '../auth/RoleProvider.jsx'
import { canSee } from '../auth/roles.js'
import { employeeStats, employeeMonthAppointments } from '../data/selectors.js'
import { toDateStr } from '../data/dates.js'
import { formatPeso } from '../lib/money.js'
import { StatCard } from '../components/StatCard.jsx'
import { WEEK, initials } from './Employees.jsx'

const PILL = {
  done: ['Done', 'bg-success-bg text-success'],
  booked: ['Booked', 'bg-tint text-plum-light'],
  cancelled: ['Cancelled', 'bg-muted/10 text-muted'],
  'no-show': ['No-show', 'bg-muted/10 text-muted'],
}
const backLink = 'inline-flex min-h-11 items-center gap-1.5 self-start text-[13px] text-gold-text underline-offset-4 hover:underline'

const clock = (hhmm) => new Date(`2000-01-01T${hhmm}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
const dayLabel = (day) => new Date(`${day}T00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

export function EmployeeProfile() {
  const { id } = useParams()
  const { state } = useDemoStore()
  const { role } = useRole()
  const employee = state.employees.find((e) => e.id === id)

  if (!employee) {
    return (
      <div className="flex flex-col gap-3 pt-6 md:pt-4">
        <h1 className="font-heading text-[32px] font-medium">Employee not found</h1>
        <p className="text-muted">There is no one on the team with that link.</p>
        <Link to="/employees" className={backLink}>
          <PiArrowLeft aria-hidden="true" /> Back to employees
        </Link>
      </div>
    )
  }

  const now = new Date()
  const month = toDateStr(now).slice(0, 7)
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const stats = employeeStats(state, employee.id, month)
  const appointments = employeeMonthAppointments(state, employee.id, month)
  const nameOf = (list, key) => list.find((x) => x.id === key)?.name ?? ''
  const since = new Date(`${employee.hiredOn}T00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <Link to="/employees" className={backLink}>
        <PiArrowLeft aria-hidden="true" /> All employees
      </Link>

      <div className="flex flex-col gap-4 md:gap-5">
        <section aria-label={`${employee.name} details`} className="flex flex-wrap items-start gap-x-12 gap-y-5 rounded-2xl border border-tint bg-surface p-[22px]">
          <div className="flex items-center gap-3.5">
            <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-plum font-heading text-xl text-gold-on-plum">
              {initials(employee.name)}
            </span>
            <div className="min-w-0">
              <h1 className="font-heading text-[24px] leading-tight font-medium">{employee.name}</h1>
              <div className="mt-0.5 text-[13px] text-gold-text">
                {employee.role} · On the team since {since}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[13px] font-semibold">Contact</h2>
            <a href={`tel:${employee.phone.replaceAll(' ', '')}`} className="inline-flex min-h-11 items-center gap-2 text-sm tabular-nums underline-offset-4 hover:underline">
              <PiPhone aria-hidden="true" className="text-muted" /> {employee.phone}
            </a>
          </div>

          <div className="w-full max-w-[320px]">
            <h2 className="text-[13px] font-semibold">Weekly schedule</h2>
            <ul className="mt-2 grid grid-cols-7 gap-1">
              {WEEK.map((d) => {
                const on = employee.schedule.includes(d)
                return (
                  <li key={d} className={`rounded-lg px-0.5 py-2 text-center ${on ? 'bg-tint text-plum-light' : 'bg-page text-muted'}`}>
                    <span className="block text-xs font-medium">{d}</span>
                    <span className="mt-0.5 block text-[10px]">{on ? 'In' : 'Off'}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          <section aria-label="This month" className="flex flex-col gap-2.5">
            <h2 className="font-heading text-[19px] font-medium">{monthName}</h2>
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-[repeat(auto-fit,minmax(190px,1fr))] md:gap-4">
              <StatCard label="Appointments" value={stats.appointments} note="Not counting cancelled" />
              <StatCard label="Services done" value={stats.servicesDone} note="From paid sales" />
              <StatCard label="Service sales" value={formatPeso(stats.serviceSales)} />
              {canSee(role, 'commission') && <StatCard dark label="Commission earned" value={formatPeso(stats.commission)} note="Owner only" />}
            </div>
          </section>

          <section aria-label="Appointments this month" className="min-w-0 rounded-2xl border border-tint bg-surface px-5 py-4 md:px-[22px]">
            <h2 className="flex min-h-11 items-center font-heading text-[19px] font-medium">Appointments this month</h2>
            {appointments.length === 0 ? (
              <p className="py-6 text-sm text-muted">No appointments this month</p>
            ) : (
              <ul className="mt-1">
                {appointments.map((a) => {
                  const [label, pill] = PILL[a.status] ?? PILL.booked
                  return (
                    <li key={a.id} className="flex items-center gap-3.5 border-b border-tint py-2.5 last:border-b-0">
                      <span className="w-[92px] shrink-0 text-[13px] tabular-nums">
                        <span className="block font-semibold">{dayLabel(a.start.slice(0, 10))}</span>
                        <span className="block text-xs text-muted">{clock(a.start.slice(11))}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{nameOf(state.clients, a.clientId)}</span>
                        <span className="block truncate text-xs text-muted">{nameOf(state.services, a.serviceId)}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${pill}`}>{label}</span>
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
