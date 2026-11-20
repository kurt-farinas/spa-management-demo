// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { incomeStatement } from '../data/selectors.js'
import { formatPeso } from '../lib/money.js'
import { AppRoutes } from '../app/routes.jsx'
import { FinancialStatement } from './FinancialStatement.jsx'

vi.mock('react-hot-toast', () => ({ default: vi.fn() }))

globalThis.IS_REACT_ACT_ENVIRONMENT = true
// jsdom has no ResizeObserver, which the chart's ResponsiveContainer needs
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }

const service = (date, unitPrice) => ({ id: date, date, employeeId: 'e1', clientId: 'c1', lines: [{ type: 'service', id: 's1', name: 'Swedish massage', qty: 1, unitPrice }], total: unitPrice })
const state = {
  employees: [],
  clients: [],
  services: [],
  products: [],
  appointments: [],
  sales: [service('2026-09-01T10:00', 5000), service('2026-10-02T10:00', 6000), service('2026-10-18T14:00', 1500)],
  expenses: [
    { id: 'X-1', date: '2026-09-01', category: 'Rent', amount: 2000 },
    { id: 'X-5', date: '2026-09-01', category: 'Marketing', amount: 4000 },
    { id: 'X-2', date: '2026-10-01', category: 'Rent', amount: 2000 },
    { id: 'X-3', date: '2026-10-01', category: 'Salaries', amount: 3000 },
    // December: costs but no sales
    { id: 'X-4', date: '2026-12-01', category: 'Rent', amount: 1200 },
  ],
}

function render(element, path, role = 'owner', initialState = state) {
  const el = document.createElement('div')
  const root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole={role}>
        <DemoStoreProvider initialState={initialState}>
          <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
        </DemoStoreProvider>
      </RoleProvider>,
    ),
  )
  return { el, root }
}

const rowCells = (el, label) => [...[...el.querySelectorAll('tr')].find((tr) => tr.querySelector('th')?.textContent === label).querySelectorAll('td')].map((td) => td.textContent)

afterEach(() => vi.useRealTimers())

describe('FinancialStatement', () => {
  it('shows the month from the URL, with net income from incomeStatement and the change on last month', () => {
    const { el, root } = render(<FinancialStatement />, '/financial-statement?month=2026-10')
    expect(el.textContent).toContain('Income statement · October 2026')
    const [current, previous, change] = rowCells(el, 'Total revenue')
    expect([current, previous]).toEqual([formatPeso(7500), formatPeso(5000)])
    expect(change).toContain('50.0%')
    expect(rowCells(el, 'Net income')[0]).toBe(formatPeso(incomeStatement(state, '2026-10').netIncome))
    act(() => root.unmount())
  })

  it('shows a loss in parentheses and has no previous month for the first month', () => {
    const { el, root } = render(<FinancialStatement />, '/financial-statement?month=2026-09')
    expect(rowCells(el, 'Net income')[0]).toBe('(₱1,000)')
    expect(rowCells(el, 'Total revenue')[1]).toBe('—')
    act(() => root.unmount())
    const { el: oct, root: octRoot } = render(<FinancialStatement />, '/financial-statement?month=2026-10')
    // October's Salaries line is new, so it has no change to show
    expect(rowCells(oct, 'Salaries')[2]).toBe('—')
    act(() => octRoot.unmount())
  })

  it('says No sales this month for a month with costs but no sales', () => {
    const { el, root } = render(<FinancialStatement />, '/financial-statement?month=2026-12')
    expect(el.textContent).toContain('No sales this month')
    expect(el.querySelector('#statement-title').nextElementSibling.nextElementSibling.tagName).toBe('P')
    act(() => root.unmount())
  })
})

describe('FinancialStatement review fixes', () => {
  const tile = (el, label) => [...el.querySelectorAll('section[aria-label^="Key figures"] > div')].find((d) => d.textContent.startsWith(label)).textContent

  it('a month with costs and no sales still shows its net income and biggest expense', () => {
    const { el, root } = render(<FinancialStatement />, '/financial-statement?month=2026-12')
    expect(tile(el, 'Net income')).toContain('(₱1,200)')
    expect(tile(el, 'Biggest expense')).toContain('Rent')
    act(() => root.unmount())
  })

  it('shows a negative net margin in parentheses', () => {
    const { el, root } = render(<FinancialStatement />, '/financial-statement?month=2026-09')
    expect(tile(el, 'Net margin')).toContain('(20.0%)')
    act(() => root.unmount())
  })

  it('compares the month so far with the same days of the last month', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-20T12:00'))
    const so = { ...state, sales: [service('2026-10-05T10:00', 6000), service('2026-10-25T10:00', 1500), service('2026-11-03T10:00', 3000)], expenses: [] }
    const { el, root } = render(<FinancialStatement />, '/financial-statement?month=2026-11', 'owner', so)
    expect(el.querySelector('thead').textContent).toContain('Oct 1–20')
    expect(rowCells(el, 'Total revenue').slice(0, 2)).toEqual([formatPeso(3000), formatPeso(6000)])
    act(() => root.unmount())
  })

  it('does not compare with a first month that starts mid-month', () => {
    const mid = { ...state, sales: [service('2026-09-04T10:00', 5000), ...state.sales.slice(1)] }
    const { el, root } = render(<FinancialStatement />, '/financial-statement?month=2026-10', 'owner', mid)
    expect([...el.querySelectorAll('option')].map((o) => o.textContent)).toContain('September 2026 (partial)')
    expect(rowCells(el, 'Total revenue')[2]).toBe('—')
    expect(el.textContent).toContain('Previous month is partial')
    act(() => root.unmount())
  })

  it('the trend is 6 calendar months ending at the selected one, empty ones at 0', () => {
    const { el, root } = render(<FinancialStatement />, '/financial-statement?month=2026-10')
    const rows = [...el.querySelectorAll('.sr-only table tbody tr')].map((tr) => tr.firstChild.textContent)
    expect(rows).toEqual(['May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026'])
    act(() => root.unmount())
  })
})

describe('financial-statement route', () => {
  // pages are lazy-loaded: let the import settle inside act before asserting
  const loaded = (el, text) =>
    vi.waitFor(async () => {
      await act(async () => {})
      expect(el.textContent).toContain(text)
    })

  it('shows the real statement to the owner', async () => {
    const { el, root } = render(<AppRoutes />, '/financial-statement?month=2026-10')
    await loaded(el, 'Income statement · October 2026')
    act(() => root.unmount())
  })

  it('sends a receptionist away from the statement', async () => {
    const { el, root } = render(<AppRoutes />, '/financial-statement?month=2026-10', 'receptionist')
    await loaded(el, 'Bookings today')
    expect(el.textContent).not.toContain('Income statement')
    act(() => root.unmount())
  })
})

describe('FinancialStatement change marker', () => {
  it('marks a change with an icon plus the spoken direction, not a text glyph', () => {
    const { el, root } = render(<FinancialStatement />, '/financial-statement?month=2026-10')
    const td = [...el.querySelectorAll('tr')].find((tr) => tr.querySelector('th')?.textContent === 'Total revenue').querySelectorAll('td')[2]
    expect(td.textContent).not.toMatch(/[▲▼]/)
    expect(td.textContent).toContain('up 50.0%')
    expect(td.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
    act(() => root.unmount())
  })
})
