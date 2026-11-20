// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { formatPeso } from '../lib/money.js'
import { SalesReport } from './SalesReport.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
// jsdom has no ResizeObserver, which the chart's ResponsiveContainer needs
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }

const line = (id, name, unitPrice) => ({ type: 'service', id, name, qty: 1, unitPrice })
const sale = (id, date, l, payment = 'cash') => ({ id, date, clientId: 'c1', employeeId: 'e1', lines: [l], total: l.unitPrice, payment })
const sales = [
  sale('S0', '2026-11-17T18:00', line('s1', 'Swedish massage', 1200)),
  sale('S1', '2026-11-18T10:00', line('s1', 'Swedish massage', 1200)),
  sale('S2', '2026-11-19T15:00', line('s2', 'Gold facial', 1800), 'gcash'),
  sale('S3', '2026-11-20T11:00', line('s2', 'Gold facial', 1800)),
]
const initialState = {
  employees: [{ id: 'e1', name: 'Ana Cruz', role: 'Therapist' }],
  clients: [{ id: 'c1', name: 'Bea Santos', phone: '0917 000 0000', joinedOn: '2025-01-01', tags: [] }],
  services: [],
  products: [],
  appointments: [],
  sales,
  expenses: [],
}

let mounted
function render(url, state = initialState) {
  const el = document.createElement('div')
  document.body.append(el)
  const root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole="receptionist">
        <DemoStoreProvider initialState={state}>
          <MemoryRouter initialEntries={[url]}>
            <SalesReport />
          </MemoryRouter>
        </DemoStoreProvider>
      </RoleProvider>,
    ),
  )
  mounted = { el, root }
  return el
}
afterEach(() => {
  vi.useRealTimers()
  act(() => mounted.root.unmount())
  mounted.el.remove()
})

describe('SalesReport', () => {
  it("the table's totals row is the sum of the sales in range", () => {
    const el = render('/sales-report?from=2026-11-18&to=2026-11-19&group=service')
    const inRange = sales.filter((s) => s.date >= '2026-11-18' && s.date < '2026-11-20')
    const cells = [...el.querySelectorAll('tfoot td')].map((td) => td.textContent)
    expect(cells).toEqual([String(inRange.length), formatPeso(inRange.reduce((t, s) => t + s.total, 0)), '100%'])
    expect(el.querySelectorAll('tbody tr')).toHaveLength(2)
  })

  it('an empty range says so and keeps the tiles at zero', () => {
    const el = render('/sales-report?from=2026-10-01&to=2026-10-05&group=day')
    expect(el.textContent).toContain('No sales in this period')
    expect(el.querySelector('table')).toBeNull()
    expect(el.textContent).toContain(`Total sales${formatPeso(0)}`)
  })

  it('a start after the end shows the range error', () => {
    const el = render('/sales-report?from=2026-11-20&to=2026-11-18')
    expect(el.textContent).toContain('Start date must be before end date')
  })

  it('with Group by service the retail products get a row, so the totals row is the Total sales tile', () => {
    const mixed = {
      ...initialState,
      sales: [
        { id: 'M1', date: '2026-11-18T10:00', clientId: 'c1', employeeId: 'e1', payment: 'cash', total: 1900, lines: [line('s1', 'Swedish massage', 1200), { type: 'product', id: 'p1', name: 'Massage oil', qty: 2, unitPrice: 350 }] },
      ],
    }
    const el = render('/sales-report?from=2026-11-18&to=2026-11-18&group=service', mixed)
    const rows = [...el.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((c) => c.textContent))
    expect(rows).toEqual([
      ['Swedish massage', '1', formatPeso(1200), '63.2%'],
      ['Retail products', '2', formatPeso(700), '36.8%'],
    ])
    expect(el.textContent).toContain(`Total sales${formatPeso(1900)}`)
    expect([...el.querySelectorAll('tfoot td')].map((td) => td.textContent)).toEqual(['3', formatPeso(1900), '100%'])
  })

  it('a range with only product sales shows the retail row, not an empty table', () => {
    const retail = { ...initialState, sales: [{ id: 'R1', date: '2026-11-18T10:00', clientId: 'c1', employeeId: null, payment: 'cash', total: 350, lines: [{ type: 'product', id: 'p1', name: 'Massage oil', qty: 1, unitPrice: 350 }] }] }
    const el = render('/sales-report?from=2026-11-18&to=2026-11-18&group=service', retail)
    expect([...el.querySelectorAll('tbody tr')].map((tr) => tr.firstChild.textContent)).toEqual(['Retail products'])
    expect([...el.querySelectorAll('tfoot td')].map((td) => td.textContent)).toEqual(['1', formatPeso(350), '100%'])
  })

  it('a range over 2 years shows the error and builds no table', () => {
    const el = render('/sales-report?from=2024-11-18&to=2026-11-20&group=day')
    expect(el.textContent).toContain('Pick a range of 2 years or less')
    expect(el.querySelector('table')).toBeNull()
    expect(el.querySelector('[aria-label="Totals for this period"]')).toBeNull()
  })

  it('the by-service breakdown marks a Massage service with its category colour', () => {
    const withCategories = { ...initialState, services: [{ id: 's1', name: 'Swedish massage', category: 'Massage' }, { id: 's2', name: 'Gold facial', category: 'Facial' }] }
    const el = render('/sales-report?from=2026-11-17&to=2026-11-20&group=service', withCategories)
    const row = [...el.querySelectorAll('tbody tr')].find((tr) => tr.firstChild.textContent === 'Swedish massage')
    expect(row.querySelector('.bg-cat-massage')).not.toBeNull()
    expect(row.querySelector('.bg-cat-facial')).toBeNull()
  })

  it('keeps the clicked preset highlighted when two presets give the same dates', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-01T12:00'))
    const pressed = (el) => [...el.querySelectorAll('[aria-label="Date range"] button[aria-pressed="true"]')].map((b) => b.textContent)
    expect(pressed(render('/sales-report?from=2026-11-01&to=2026-11-01&preset=month'))).toEqual(['This month'])
    expect(pressed(render('/sales-report?from=2026-11-01&to=2026-11-01'))).toEqual(['Today'])
  })
})
