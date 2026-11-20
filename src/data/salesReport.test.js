import { describe, it, expect } from 'vitest'
import { rangePreset, salesTotals, salesInRange, fillPeriods, salesSummary } from './selectors.js'

const friday = new Date('2026-11-20T12:00')

const service = (id, name, unitPrice, qty = 1) => ({ type: 'service', id, name, qty, unitPrice })
const product = (id, name, unitPrice, qty = 1) => ({ type: 'product', id, name, qty, unitPrice })
const sales = [
  { id: 'S1', date: '2026-11-18T10:00', employeeId: 'e1', lines: [service('s1', 'Swedish massage', 1200), product('p1', 'Massage oil', 350, 2)], total: 1900, payment: 'cash' },
  { id: 'S2', date: '2026-11-19T15:00', employeeId: 'e1', lines: [service('s2', 'Gold facial', 1800)], total: 1800, payment: 'gcash' },
  { id: 'S3', date: '2026-11-20T11:00', employeeId: null, lines: [product('p1', 'Massage oil', 352)], total: 352, payment: 'card' },
]

describe('rangePreset', () => {
  it('works from Friday 2026-11-20', () => {
    expect(rangePreset('today', friday)).toEqual({ from: '2026-11-20', to: '2026-11-20' })
    expect(rangePreset('week', friday)).toEqual({ from: '2026-11-16', to: '2026-11-20' })
    expect(rangePreset('month', friday)).toEqual({ from: '2026-11-01', to: '2026-11-20' })
    expect(rangePreset('last-month', friday)).toEqual({ from: '2026-10-01', to: '2026-10-31' })
    expect(rangePreset('6-months', friday)).toEqual({ from: '2026-05-21', to: '2026-11-20' })
  })

  it('6 months back from a 31st clamps to the shorter month first', () => {
    expect(rangePreset('6-months', new Date('2026-08-31T12:00'))).toEqual({ from: '2026-03-01', to: '2026-08-31' })
  })

  it('this week on a Sunday starts the Monday before', () => {
    expect(rangePreset('week', new Date('2026-11-22T12:00'))).toEqual({ from: '2026-11-16', to: '2026-11-22' })
  })
})

describe('salesTotals', () => {
  it('totals, rounded average, line-type split and payment mix', () => {
    expect(salesTotals(sales)).toEqual({
      total: 4052,
      count: 3,
      average: 1351, // 4052 / 3 = 1350.67
      services: 3000,
      products: 1052,
      byPayment: { cash: 1900, card: 352, gcash: 1800 },
    })
  })

  it('is all zero for no sales', () => {
    expect(salesTotals([])).toEqual({ total: 0, count: 0, average: 0, services: 0, products: 0, byPayment: { cash: 0, card: 0, gcash: 0 } })
  })
})

describe('salesInRange', () => {
  it('keeps both ends', () => {
    expect(salesInRange(sales, '2026-11-18', '2026-11-19').map((s) => s.id)).toEqual(['S1', 'S2'])
    expect(salesInRange(sales, '2026-11-20', '2026-11-20').map((s) => s.id)).toEqual(['S3'])
  })
})

describe('fillPeriods', () => {
  it('fills a 3-day range with sales on one day', () => {
    const rows = fillPeriods(salesSummary(sales.slice(1, 2), { groupBy: 'day' }), { from: '2026-11-18', to: '2026-11-20', groupBy: 'day' })
    expect(rows).toEqual([
      { key: '2026-11-18', label: 'Nov 18', total: 0, count: 0 },
      { key: '2026-11-19', label: 'Nov 19', total: 1800, count: 1 },
      { key: '2026-11-20', label: 'Nov 20', total: 0, count: 0 },
    ])
  })

  it('fills months across a year end', () => {
    const rows = fillPeriods([], { from: '2025-11-15', to: '2026-01-02', groupBy: 'month' })
    expect(rows.map((r) => [r.key, r.label, r.total])).toEqual([
      ['2025-11', 'Nov 2025', 0],
      ['2025-12', 'Dec 2025', 0],
      ['2026-01', 'Jan 2026', 0],
    ])
  })

  it('leaves service and therapist rows as they are', () => {
    const rows = [{ key: 's1', label: 'Swedish massage', total: 1200, count: 1 }]
    expect(fillPeriods(rows, { from: '2026-11-18', to: '2026-11-20', groupBy: 'service' })).toBe(rows)
  })
})
