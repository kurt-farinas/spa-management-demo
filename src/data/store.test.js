import { describe, it, expect } from 'vitest'
import { demoReducer, validateCheckout, validateBooking, buildSale } from './store.js'
import { inSpaNow, isActiveBooking, dashboardStats, salesSummary, incomeStatement, dailySales } from './selectors.js'

const swedish = { id: 'svc-swedish', name: 'Swedish massage', category: 'Massage', durationMin: 60, price: 800, commissionRate: 0.1 }

const fixture = () => ({
  employees: [{ id: 'e1', name: 'Ana', role: 'Therapist' }],
  clients: [{ id: 'c1', name: 'Bea Santos', joinedOn: '2026-11-02', tags: ['New'] }],
  services: [swedish],
  products: [{ id: 'p1', name: 'Lavender oil', category: 'Oils', price: 350, cost: 100, stock: 10, reorderAt: 3 }],
  appointments: [
    { id: 'A-1', clientId: 'c1', employeeId: 'e1', serviceId: 'svc-swedish', start: '2026-11-20T10:00', durationMin: 60, status: 'booked' },
    { id: 'A-2', clientId: 'c1', employeeId: 'e1', serviceId: 'svc-swedish', start: '2026-11-20T12:00', durationMin: 60, status: 'cancelled' },
    { id: 'A-3', clientId: 'c1', employeeId: 'e1', serviceId: 'svc-swedish', start: '2026-11-20T14:00', durationMin: 60, status: 'no-show' },
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

  it('checkout sums qty across lines of the same product', () => {
    const line = { type: 'product', id: 'p1', qty: 6 }
    expect(validateCheckout(fixture(), { lines: [line, line] })).toBe('Only 10 left')
  })

  it('checkout rejects bad quantities and unknown items', () => {
    const check = (line) => validateCheckout(fixture(), { lines: [line] })
    expect(check({ type: 'product', id: 'p1', qty: 0 })).toBe('Quantity must be at least 1')
    expect(check({ type: 'service', id: 'svc-swedish', qty: -5 })).toBe('Quantity must be at least 1')
    expect(check({ type: 'product', id: 'p1', qty: 1.5 })).toBe('Quantity must be at least 1')
    expect(check({ type: 'product', id: 'nope', qty: 1 })).toBe('Item not found')
    expect(check({ type: 'service', id: 'nope', qty: 1 })).toBe('Item not found')
  })

  it('reducer ignores a checkout that would oversell', () => {
    const state = fixture()
    const sale = { id: 'S-4', lines: [{ type: 'product', id: 'p1', qty: 11, unitPrice: 350 }] }
    expect(demoReducer(state, { type: 'checkout', sale })).toBe(state)
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

  it('salesSummary by employee groups product-only sales under "none"', () => {
    const sale = (id, employeeId, total) => ({ id, employeeId, total, date: '2026-11-18T10:00', lines: [] })
    const sales = [sale('S-1', null, 650), sale('S-2', null, 350), sale('S-3', 'e1', 1200)]
    const rows = salesSummary(sales, { groupBy: 'employee' }, { employees: [{ id: 'e1', name: 'Ana Cruz' }] })
    expect(rows).toEqual([
      { key: 'e1', label: 'Ana Cruz', total: 1200, count: 1 },
      { key: 'none', label: 'No therapist (retail)', total: 1000, count: 2 },
    ])
  })

  it('isActiveBooking leaves out cancelled and no-show', () => {
    const active = (status) => isActiveBooking({ status })
    expect(['booked', 'done'].map(active)).toEqual([true, true])
    expect(['cancelled', 'no-show'].map(active)).toEqual([false, false])
  })

  it('salesSummary by day', () => {
    const rows = salesSummary(fixture().sales, { from: '2026-11-19', to: '2026-11-20', groupBy: 'day' })
    expect(rows).toEqual([
      { key: '2026-11-19', label: 'Nov 19', total: 1800, count: 1 },
      { key: '2026-11-20', label: 'Nov 20', total: 1700, count: 2 },
    ])
  })

  it('dailySales fills every day, empty days as 0', () => {
    const days = dailySales(fixture().sales, new Date('2026-11-20T12:00'), 14)
    expect(days).toHaveLength(14)
    expect(days[0]).toEqual({ key: '2026-11-07', label: 'Nov 7', total: 0, count: 0 })
    expect(days.slice(-2).map((d) => d.total)).toEqual([1800, 1700])
  })

  it('inSpaNow counts booked or done appointments under way, not finished, future or no-show ones', () => {
    const at = (id, clientId, start, status) => ({ id, clientId, start: `2026-11-20T${start}`, durationMin: 60, status })
    const rows = [
      at('in-progress', 'c1', '10:00', 'booked'),
      at('finished', 'c2', '09:00', 'done'),
      at('future', 'c3', '11:00', 'booked'),
      at('no-show', 'c4', '10:00', 'no-show'),
      at('done-early', 'c5', '10:15', 'done'),
    ]
    expect(inSpaNow(rows, new Date('2026-11-20T10:30')).map((a) => a.id)).toEqual(['in-progress', 'done-early'])
    // start counts, start + duration does not
    expect(inSpaNow([rows[0]], new Date('2026-11-20T10:00'))).toHaveLength(1)
    expect(inSpaNow([rows[0]], new Date('2026-11-20T11:00'))).toHaveLength(0)
  })

  it('dashboardStats', () => {
    const stats = dashboardStats(fixture(), new Date('2026-11-20T12:00'))
    expect(stats.salesToday).toBe(1700)
    // every appointment of the day, cancelled and no-show included
    expect(stats.bookingsToday).toBe(3)
    expect(stats.topServices[0]).toEqual({ name: 'Swedish massage', count: 2 })
  })
})
