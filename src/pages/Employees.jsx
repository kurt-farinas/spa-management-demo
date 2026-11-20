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
          <span key={d} className={`w-9 rounded-md border border-transparent py-1 text-center text-[11px] ${on ? 'bg-tint font-medium text-plum-light' : 'border border-dashed border-lavender text-muted'}`}>
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
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[13px] text-muted">
            {state.employees.length} on the team · {therapists} therapists
          </div>
          <h1 className="mt-1 font-heading text-[32px] font-medium">Employees</h1>
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
            className="h-11 w-full rounded-full border border-lavender bg-surface pr-4 pl-10 text-sm placeholder:text-muted"
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

      <section aria-label="Employee list" className="min-w-0 overflow-x-auto rounded-2xl border border-tint bg-surface">
        {list.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">No employees match that search.</p>
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className="px-5 py-3.5 font-medium">Employee</th>
                <th scope="col" className="px-3 py-3.5 font-medium">Phone</th>
                <th scope="col" className="px-3 py-3.5 font-medium">Working days</th>
                <th scope="col" className="px-3 py-3.5 text-right font-medium">Appointments this month</th>
                <th scope="col" className="px-5 py-3.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className="border-t border-tint">
                  <td className="px-5 py-3">
                    <Link to={`/employees/${e.id}`} className="group flex items-center gap-2.5">
                      <Avatar name={e.name} />
                      <span>
                        <span className="block font-medium underline-offset-4 group-hover:underline">{e.name}</span>
                        <span className="text-xs text-muted">{e.role}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap tabular-nums">{e.phone}</td>
                  <td className="px-3 py-3">
                    <WorkingDays schedule={e.schedule} />
                  </td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">{employeeStats(state, e.id, month).appointments}</td>
                  <td className="px-5 py-3 text-right">
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
