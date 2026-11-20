// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
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

// a day of the seed with only these appointments; rows are [clientName, 'HH:MM', status]
function dayOf(rows) {
  const seed = buildSeed(42, new Date())
  const day = toDateStr(new Date())
  return {
    ...seed,
    clients: [...seed.clients, ...rows.map(([name], i) => ({ id: `t${i}`, name, joinedOn: '2026-01-01', tags: [] }))],
    appointments: rows.map(([, time, status], i) => ({ id: `T-${i}`, clientId: `t${i}`, employeeId: seed.employees[0].id, serviceId: seed.services[0].id, start: `${day}T${time}`, durationMin: 60, status })),
  }
}
const listRows = (el) => [...el.querySelectorAll(`[aria-label="Today's appointments"] > ul > li`)].map((li) => li.textContent)
const tile = (el, label) => [...el.querySelectorAll('div')].find((d) => d.textContent === label).parentElement

describe('Dashboard', () => {
  afterEach(() => vi.useRealTimers())

  it('counts the same bookings in the tile and the See all link, no-show included', () => {
    const { el, root } = render('owner', dayOf([['Ana A', '10:00', 'done'], ['Ben B', '11:00', 'no-show'], ['Cy C', '19:00', 'booked']]))
    const value = tile(el, 'Bookings today').children[1].textContent
    const seeAll = [...el.querySelectorAll('a')].find((a) => a.textContent.startsWith('See all')).textContent
    expect(value).toBe('3')
    expect(seeAll).toBe(`See all ${value}`)
    expect(tile(el, 'Bookings today').textContent).toContain('1 done, 1 to go, 1 no-show')
    act(() => root.unmount())
  })

  it('lists every appointment of today in time order', () => {
    const times = ['10:00', '10:30', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
    const rows = times.map((t, i) => [`Client ${i}`, t, i === 0 ? 'done' : i === 7 ? 'no-show' : 'booked'])
    const { el, root } = render('owner', dayOf([...rows].reverse()))
    const names = listRows(el).map((t) => t.match(/Client \d/)[0])
    expect(names).toEqual(times.map((_, i) => `Client ${i}`))
    act(() => root.unmount())
  })

  it('shows who is in the spa now instead of new clients', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-20T10:30'))
    const { el, root } = render('owner', dayOf([['Maria Reyes', '10:00', 'booked'], ['Paolo Cruz', '10:00', 'no-show'], ['Lea Lim', '11:00', 'booked']]))
    expect(el.textContent).not.toContain('New clients this month')
    expect(tile(el, 'In the spa now').children[1].textContent).toBe('1')
    expect(tile(el, 'In the spa now').children[2].textContent).toBe('Maria Reyes')
    act(() => root.unmount())
  })

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
