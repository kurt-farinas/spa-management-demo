import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PiMagnifyingGlass } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { employeeStats } from '../data/selectors.js'
import { toDateStr } from '../data/dates.js'
import { WEEK } from '../lib/format.js'
import { Avatar } from '../components/Avatar.jsx'
import { demoOnly } from '../components/demoOnly.js'
import { pillClass, primaryButton, textButton } from '../components/ui.js'

const ROLES = ['All', 'Therapist', 'Receptionist', 'Manager']

function WorkingDays({ schedule }) {
  return (
    <span className="flex gap-1" aria-label={`Works ${schedule.join(', ')}`} role="img">
      {WEEK.map((d) => {
        const on = schedule.includes(d)
        return (
          <span key={d} className={`w-9 rounded-md border py-1 text-center text-[11px] ${on ? 'border-transparent bg-soft font-semibold text-ink' : 'border-dashed border-line text-muted'}`}>
            {d}
          </span>
        )
      })}
    </span>
  )
}

export function Employees() {
  const { state } = useDemoStore()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('All')
  const month = toDateStr(new Date()).slice(0, 7)
  const q = query.trim().toLowerCase()
  const list = state.employees.filter((e) => (role === 'All' || e.role === role) && e.name.toLowerCase().includes(q))
  const therapists = state.employees.filter((e) => e.role === 'Therapist').length

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] leading-7 font-bold md:text-2xl md:leading-8">Employees</h1>
          <p className="text-sm text-muted tabular-nums">
            {state.employees.length} on the team · {therapists} therapists
          </p>
        </div>
        <button type="button" className={primaryButton} onClick={demoOnly}>
          + Add employee
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="relative flex min-w-0 flex-[1_1_260px]">
          <span className="sr-only">Search employees by name</span>
          <PiMagnifyingGlass aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            className="h-11 w-full rounded-md border border-line bg-surface pr-4 pl-10 text-sm placeholder:text-muted"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by role">
          {ROLES.map((r) => (
            <button key={r} type="button" aria-pressed={role === r} className={pillClass(role === r)} onClick={() => setRole(r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <section aria-label="Employee list" className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
        {list.length === 0 ? (
          <p className="px-3.5 py-6 text-sm text-muted md:px-5">No employees match that search.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="h-9 border-b border-line text-left text-xs font-semibold text-muted">
                <th scope="col" className="px-3.5 md:px-5">Employee</th>
                <th scope="col" className="hidden px-3 md:table-cell">Phone</th>
                <th scope="col" className="hidden px-3 lg:table-cell">Working days</th>
                <th scope="col" className="px-3 text-right">
                  <span className="md:hidden">This month</span>
                  <span className="max-md:hidden">Appointments this month</span>
                </th>
                <th scope="col" className="pr-1.5 md:pr-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-b-0">
                  <td className="py-2 pl-3.5 md:pl-5">
                    <Link to={`/employees/${e.id}`} className="group flex min-h-11 items-center gap-2.5">
                      <Avatar name={e.name} />
                      <span>
                        <span className="block font-semibold underline-offset-4 group-hover:underline">{e.name}</span>
                        <span className="text-xs text-muted">{e.role}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-3 py-2 whitespace-nowrap tabular-nums md:table-cell">{e.phone}</td>
                  <td className="hidden px-3 py-2 lg:table-cell">
                    <WorkingDays schedule={e.schedule} />
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{employeeStats(state, e.id, month).appointments}</td>
                  <td className="py-2 pr-1.5 text-right md:pr-3">
                    <button
                      type="button"
                      aria-label={`Edit ${e.name}`}
                      className={textButton}
                      onClick={demoOnly}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
