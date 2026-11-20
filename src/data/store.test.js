import { describe, it, expect } from 'vitest'
import { demoReducer, validateCheckout, validateBooking, buildSale } from './store.js'
import { dashboardStats, salesSummary, incomeStatement } from './selectors.js'

const swedish = { id: 'svc-swedish', name: 'Swedish massage', category: 'Massage', durationMin: 60, price: 800, commissionRate: 0.1 }

const fixture = () => ({
  employees: [{ id: 'e1', name: 'Ana', role: 'Therapist' }],
  clients: [{ id: 'c1', name: 'Bea Santos', joinedOn: '2026-11-02', tags: ['New'] }],
  services: [swedish],
  products: [{ id: 'p1', name: 'Lavender oil', category: 'Oils', price: 350, cost: 100, stock: 10, reorderAt: 3 }],
  appointments: [
    { id: 'A-1', clientId: 'c1', employeeId: 'e1', serviceId: 'svc-swedish', start: '2026-11-20T10:00', durationMin: 60, status: 'booked' },
    { id: 'A-2', clientId: 'c1', employeeId: 'e1', serviceId: 'svc-swedish', start: '2026-11-20T12:00', durationMin: 60, status: 'cancelled' },
  ],
  sales: [
    {
      id: 'S-1', date: '2026-11-19T15:00', clientId: 'c1', employeeId: 'e1', payment: 'cash', total: 1800,
      lines: [{ type: 'service', id: 'svc-swedish', name: 'Swedish massage', qty: 1, unitPrice: 800 }, { type: 'product', id: 'p1', name: 'Lavender oil', qty: 2, unitPrice: 250 }, { type: 'service', id: 'svc-x', name: 'Gold facial', qty: 1, unitPrice: 500 }],
    },
    {
      id: 'S-2', date: '2026-11-20T09:00', clientId: 'c1', employeeId: 'e1', payment: 'gcash', total: 800,
      lines: [{ type: 'service', id: 'svc-swedish', name: 'Swedish massage', qty: 1, unitPrice: 800 }],
    },
    {
      id: 'S-3', date: '2026-11-20T11:00', clientId: 'c1', employeeId: 'e1', payment: 'card', total: 900,
      lines: [{ type: 'service', id: 'svc-y', name: 'Shiatsu', qty: 1, unitPrice: 900 }],
    },
  ],
  expenses: [
    { id: 'X-1', date: '2026-11-01', category: 'Rent', amount: 600 },
    { id: 'X-2', date: '2026-11-15', category: 'Supplies', amount: 400 },
    { id: 'X-3', date: '2026-10-01', category: 'Rent', amount: 999 },
  ],
})

describe('store', () => {
  it('checkout adds a sale and lowers stock', () => {
    const state = fixture()
    const before = JSON.stringify(state)
    const sale = buildSale(state, { clientId: 'c1', employeeId: 'e1', lines: [{ type: 'product', id: 'p1', qty: 2 }], payment: 'cash' }, new Date('2026-11-20T14:05'))
    const next = demoReducer(state, { type: 'checkout', sale })
    expect(next.sales).toHaveLength(state.sales.length + 1)
    expect(next.products.find((p) => p.id === 'p1').stock).toBe(8)
    expect(sale.total).toBe(700)
    expect(sale).toMatchObject({ id: 'S-4', date: '2026-11-20T14:05' })
    expect(JSON.stringify(state)).toBe(before)
  })

  it('checkout rejects empty cart', () => {
    expect(validateCheckout(fixture(), { lines: [] })).toBe('Add at least one item')
  })

  it('checkout rejects qty above stock', () => {
    expect(validateCheckout(fixture(), { lines: [{ type: 'product', id: 'p1', qty: 11 }] })).toBe('Only 10 left')
  })

  it('booking rejects overlap', () => {
    const state = fixture()
    const at = (start) => validateBooking(state, { employeeId: 'e1', start, durationMin: 60 })
    expect(at('2026-11-20T10:30')).toContain('is booked')
    expect(at('2026-11-20T10:30')).toBe('Ana is booked 10:00–11:00')
    expect(at('2026-11-20T11:00')).toBeNull()
    expect(at('2026-11-20T12:00')).toBeNull()
  })
})

describe('selectors', () => {
  it('incomeStatement totals', () => {
    // November: services 800 + 500 + 800 + 900 = 3000, product 2 × 250 = 500
    const r = incomeStatement(fixture(), '2026-11')
    expect(r).toMatchObject({ serviceRevenue: 3000, productRevenue: 500, totalRevenue: 3500, costOfProducts: 200, grossProfit: 3300, totalExpenses: 1000, netIncome: 2300 })
    expect(r.expenses).toEqual([{ category: 'Rent', amount: 600 }, { category: 'Supplies', amount: 400 }])
  })

  it('salesSummary by service', () => {
    const sales = fixture().sales.filter((s) => s.id === 'S-2')
    sales.push({ ...sales[0], id: 'S-9', date: '2026-11-18T10:00' })
    const rows = salesSummary(sales, { from: '2026-11-01', to: '2026-11-30', groupBy: 'service' })
    expect(rows).toEqual([{ key: 'svc-swedish', label: 'Swedish massage', total: 1600, count: 2 }])
  })

  it('salesSummary by day', () => {
    const rows = salesSummary(fixture().sales, { from: '2026-11-19', to: '2026-11-20', groupBy: 'day' })
    expect(rows).toEqual([
      { key: '2026-11-19', label: 'Nov 19', total: 1800, count: 1 },
      { key: '2026-11-20', label: 'Nov 20', total: 1700, count: 2 },
    ])
  })

  it('dashboardStats', () => {
    const stats = dashboardStats(fixture(), new Date('2026-11-20T12:00'))
    expect(stats.salesToday).toBe(1700)
    expect(stats.bookingsToday).toBe(1)
    expect(stats.newClientsThisMonth).toBe(1)
    expect(stats.topServices[0]).toEqual({ name: 'Swedish massage', count: 2 })
  })
})
