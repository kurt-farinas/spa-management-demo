// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { DemoStoreProvider, useDemoStore } from '../data/DemoStore.jsx'
import { formatPeso } from '../lib/money.js'
import { clock } from '../lib/format.js'
import { Pos } from './Pos.jsx'
import { Inventory } from './Inventory.jsx'
import { Dashboard } from './Dashboard.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
// jsdom has no ResizeObserver, which the dashboard chart needs
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { success: vi.fn() }) }))

const initialState = {
  employees: [
    { id: 'e1', name: 'Ana Cruz', role: 'Therapist' },
    { id: 'e2', name: 'Kristine Garcia', role: 'Receptionist' },
  ],
  clients: [{ id: 'c1', name: 'Bea Santos', phone: '0917 000 0000', joinedOn: '2025-01-01', tags: ['VIP'] }],
  services: [
    { id: 's1', name: 'Swedish massage', category: 'Massage', durationMin: 60, price: 1200 },
    { id: 'pk1', name: 'Couples retreat', category: 'Package', durationMin: 180, price: 5200 },
  ],
  products: [
    { id: 'p1', name: 'Lavender massage oil', category: 'Oils', price: 650, cost: 260, stock: 3, reorderAt: 5 },
    { id: 'p2', name: 'Reed diffuser', category: 'Home', price: 980, cost: 380, stock: 0, reorderAt: 4 },
  ],
  appointments: [],
  sales: [],
  expenses: [],
}

let root
let store
const Probe = () => ((store = useDemoStore()), null)
function render(page, role = 'owner') {
  const el = document.createElement('div')
  document.body.append(el) // focus needs an attached element
  root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole={role}>
        <DemoStoreProvider initialState={initialState}>
          <MemoryRouter>
            {page}
            <Probe />
          </MemoryRouter>
        </DemoStoreProvider>
      </RoleProvider>,
    ),
  )
  return el
}
const button = (el, text) => [...el.querySelectorAll('button')].find((b) => b.textContent.includes(text))
const click = (b) => act(() => b.click())

afterEach(() => {
  act(() => root.unmount())
  document.body.replaceChildren()
})

describe('Point of Sale', () => {
  it('sells 2 of a product, shows the receipt and lowers the stock', () => {
    const el = render(<Pos />)
    click(button(el, 'Products'))
    expect(button(el, 'Reed diffuser').disabled).toBe(true)
    click(button(el, 'Lavender massage oil'))
    click(button(el, 'Lavender massage oil'))
    expect(el.textContent).toContain('Only 3 left in stock')
    click(button(el, 'Cash'))
    click(button(el, 'Complete sale'))

    expect(store.state.sales).toHaveLength(1)
    expect(store.state.sales[0]).toMatchObject({ clientId: null, total: 1300, payment: 'cash' })
    expect(store.state.products[0].stock).toBe(1)
    const receipt = el.querySelector('[aria-label="Receipt"]')
    expect(receipt.textContent).toContain('S-1')
    expect(receipt.textContent).toContain(formatPeso(1300))
    expect(receipt.textContent).toContain('Walk-in')
    expect(receipt.textContent).toContain(clock(store.state.sales[0].date.slice(11)))
    expect(toast.success).toHaveBeenCalledWith(`Sale complete · ${formatPeso(1300)}`)

    click(button(el, 'New sale'))
    expect(el.querySelector('[aria-label="Receipt"]')).toBeNull()
    expect(document.activeElement.textContent).toBe('Current sale')
    expect(button(el, 'Complete sale').textContent).toContain(formatPeso(0))
  })

  it('lists the catalog tabs as Services, Packages, Products', () => {
    const el = render(<Pos />)
    const tabs = [...el.querySelectorAll('[aria-label="Catalog section"] button')].map((b) => b.textContent)
    expect(tabs).toEqual(['Services', 'Packages', 'Products'])
  })

  it('a completed sale lowers the stock in Inventory and raises Todays sales on the Dashboard', () => {
    const el = render(
      <>
        <div data-page="pos"><Pos /></div>
        <div data-page="inventory"><Inventory /></div>
        <div data-page="dashboard"><Dashboard /></div>
      </>,
    )
    const pos = el.querySelector('[data-page="pos"]')
    const stockOf = () => {
      const row = [...el.querySelectorAll('[data-page="inventory"] tbody tr')].find((r) => r.textContent.includes('Lavender massage oil'))
      return row.querySelectorAll('td')[4].textContent // Price, Cost (owner), Stock
    }
    const salesToday = () => [...el.querySelectorAll('[data-page="dashboard"] div')].find((d) => d.textContent === "Today's sales").nextSibling.textContent
    expect(stockOf()).toBe('3')
    expect(salesToday()).toBe(formatPeso(0))

    click(button(pos, 'Products'))
    click(button(pos, 'Lavender massage oil'))
    click(button(pos, 'Lavender massage oil'))
    click(button(pos, 'Cash'))
    click(button(pos, 'Complete sale'))

    expect(stockOf()).toBe('1')
    expect(salesToday()).toBe(formatPeso(1300))
  })

  it('needs a therapist when the cart has a service', () => {
    const el = render(<Pos />)
    click(button(el, 'Swedish massage'))
    click(button(el, 'Cash'))
    click(button(el, 'Complete sale'))
    expect(el.textContent).toContain('Pick a therapist')
    expect(store.state.sales).toHaveLength(0)
    // the receptionist is not offered as a therapist
    expect(el.querySelector('#pos-therapist').textContent).not.toContain('Kristine')
  })

  it('needs a payment method', () => {
    const el = render(<Pos />)
    click(button(el, 'Products'))
    click(button(el, 'Lavender massage oil'))
    click(button(el, 'Complete sale'))
    expect(el.textContent).toContain('Pick a payment method')
    expect(store.state.sales).toHaveLength(0)
  })
})

describe('Inventory', () => {
  it('shows cost and stock value to the owner only', () => {
    let el = render(<Inventory />, 'owner')
    expect(el.textContent).toContain('Cost')
    expect(el.textContent).toContain('Stock value')
    act(() => root.unmount())

    el = render(<Inventory />, 'receptionist')
    expect(el.textContent).toContain('Lavender massage oil')
    expect(el.textContent).not.toMatch(/cost|stock value/i)
    expect(el.textContent).not.toContain(formatPeso(260))
  })

  it('marks out and low stock', () => {
    const el = render(<Inventory />)
    const rowOf = (name) => [...el.querySelectorAll('tbody tr')].find((r) => r.textContent.includes(name))
    expect(rowOf('Reed diffuser').textContent).toContain('Out')
    expect(rowOf('Lavender massage oil').textContent).toContain('Low')
  })
})
