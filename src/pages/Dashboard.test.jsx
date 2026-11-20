// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { Dashboard } from './Dashboard.jsx'
import { buildSeed } from '../data/seed.js'
import { toDateStr } from '../data/dates.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
// jsdom has no ResizeObserver, which the chart's ResponsiveContainer needs
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }

function render(role, initialState) {
  const el = document.createElement('div')
  const root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole={role}>
        <DemoStoreProvider initialState={initialState}>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </DemoStoreProvider>
      </RoleProvider>,
    ),
  )
  return { el, root }
}

describe('Dashboard', () => {
  it('shows Profit this month to the owner only', () => {
    const owner = render('owner')
    expect(owner.el.textContent).toContain('Profit this month')
    act(() => owner.root.unmount())
    const rec = render('receptionist')
    expect(rec.el.textContent).not.toContain('Profit this month')
    expect(rec.el.textContent).toContain('Bookings today')
    act(() => rec.root.unmount())
  })

  it('keeps no-show and cancelled appointments of today in the list', () => {
    const seed = buildSeed(42, new Date())
    const day = toDateStr(new Date())
    const client = (id, name) => ({ id, name, joinedOn: '2026-01-01', tags: [] })
    const appt = (id, clientId, time, status) => ({ id, clientId, employeeId: seed.employees[0].id, serviceId: seed.services[0].id, start: `${day}T${time}`, durationMin: 60, status })
    const state = {
      ...seed,
      clients: [...seed.clients, client('t1', 'Bea Booked'), client('t2', 'Nina Noshow'), client('t3', 'Carl Cancelled')],
      appointments: [appt('T-1', 't1', '10:00', 'booked'), appt('T-2', 't2', '11:00', 'no-show'), appt('T-3', 't3', '12:00', 'cancelled')],
    }
    const { el, root } = render('owner', state)
    const rows = [...el.querySelectorAll(`[aria-label="Today's appointments"] li`)].map((li) => li.textContent)
    expect(rows.some((t) => t.includes('Nina Noshow') && t.includes('No-show'))).toBe(true)
    expect(rows.some((t) => t.includes('Carl Cancelled') && t.includes('Cancelled'))).toBe(true)
    act(() => root.unmount())
  })

  it('has one New sale link to the point of sale', () => {
    const { el, root } = render('receptionist')
    const links = [...el.querySelectorAll('a')].filter((a) => a.textContent.trim() === 'New sale')
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/pos'])
    act(() => root.unmount())
  })
})
