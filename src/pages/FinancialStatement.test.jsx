// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
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
  sales: [service('2026-09-04T10:00', 5000), service('2026-10-02T10:00', 6000), service('2026-10-18T14:00', 1500)],
  expenses: [
    { id: 'X-1', date: '2026-09-01', category: 'Rent', amount: 2000 },
    { id: 'X-5', date: '2026-09-01', category: 'Marketing', amount: 4000 },
    { id: 'X-2', date: '2026-10-01', category: 'Rent', amount: 2000 },
    { id: 'X-3', date: '2026-10-01', category: 'Salaries', amount: 3000 },
    // December: costs but no sales
    { id: 'X-4', date: '2026-12-01', category: 'Rent', amount: 1200 },
  ],
}

function render(element, path, role = 'owner') {
  const el = document.createElement('div')
  const root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole={role}>
        <DemoStoreProvider initialState={state}>
          <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
        </DemoStoreProvider>
      </RoleProvider>,
    ),
  )
  return { el, root }
}

const rowCells = (el, label) => [...[...el.querySelectorAll('tr')].find((tr) => tr.querySelector('th')?.textContent === label).querySelectorAll('td')].map((td) => td.textContent)

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

describe('financial-statement route', () => {
  it('shows the real statement to the owner', () => {
    const { el, root } = render(<AppRoutes />, '/financial-statement?month=2026-10')
    expect(el.textContent).toContain('Income statement · October 2026')
    act(() => root.unmount())
  })

  it('sends a receptionist away from the statement', () => {
    const { el, root } = render(<AppRoutes />, '/financial-statement?month=2026-10', 'receptionist')
    expect(el.textContent).not.toContain('Income statement')
    expect(el.textContent).toContain('Bookings today')
    act(() => root.unmount())
  })
})
