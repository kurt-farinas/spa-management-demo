import { describe, it, expect } from 'vitest'
import { statementMonths, compareStatements, monthlyTrend, incomeStatement } from './selectors.js'

const sale = (date, lines) => ({ id: date, date, lines, total: lines.reduce((t, l) => t + l.qty * l.unitPrice, 0) })
const state = {
  products: [{ id: 'p1', cost: 200 }],
  sales: [
    sale('2026-09-03T10:00', [{ type: 'service', id: 's1', qty: 1, unitPrice: 1000 }]),
    sale('2026-10-05T10:00', [{ type: 'service', id: 's1', qty: 1, unitPrice: 1000 }, { type: 'product', id: 'p1', qty: 2, unitPrice: 500 }]),
    sale('2026-10-20T15:00', [{ type: 'service', id: 's1', qty: 1, unitPrice: 1200 }]),
  ],
  expenses: [
    { id: 'X-1', date: '2026-09-01', category: 'Rent', amount: 300 },
    { id: 'X-2', date: '2026-10-01', category: 'Rent', amount: 300 },
    { id: 'X-3', date: '2026-10-01', category: 'Supplies', amount: 100 },
    // a month with costs and no sales still has a statement
    { id: 'X-4', date: '2026-11-01', category: 'Rent', amount: 300 },
  ],
}

describe('statementMonths', () => {
  it('lists every month with sales or expenses, newest first, once each', () => {
    expect(statementMonths(state)).toEqual(['2026-11', '2026-10', '2026-09'])
  })
})

describe('compareStatements', () => {
  it('gives the change as a percent of the previous month, 1 decimal', () => {
    const cur = { ...incomeStatement(state, '2026-10'), totalRevenue: 1200 }
    const prev = { ...incomeStatement(state, '2026-09'), totalRevenue: 1000 }
    expect(compareStatements(cur, prev).totalRevenue).toEqual({ current: 1200, previous: 1000, change: 20 })
  })

  it('has no change when the previous month is 0 or missing', () => {
    const cur = incomeStatement(state, '2026-10')
    const prev = incomeStatement(state, '2026-09')
    const c = compareStatements(cur, prev)
    expect(c.productRevenue).toEqual({ current: 1000, previous: 0, change: null })
    expect(c.netIncome).toEqual({ current: 2400, previous: 700, change: 242.9 })
    expect(compareStatements(cur, null).totalRevenue).toEqual({ current: 3200, previous: null, change: null })
  })

  it('lines up expense categories from both months', () => {
    const c = compareStatements(incomeStatement(state, '2026-10'), incomeStatement(state, '2026-09'))
    expect(c.expenses).toEqual([
      { category: 'Rent', current: 300, previous: 300, change: 0 },
      { category: 'Supplies', current: 100, previous: 0, change: null },
    ])
  })

  it('measures change against the size of a loss, so a smaller loss is an increase', () => {
    const c = compareStatements({ ...incomeStatement(state, '2026-10'), netIncome: -500 }, { ...incomeStatement(state, '2026-09'), netIncome: -1000 })
    expect(c.netIncome.change).toBe(50)
  })
})

describe('monthlyTrend', () => {
  it('gives revenue, costs (products sold plus expenses) and net income per month, in the order given', () => {
    expect(monthlyTrend(state, ['2026-09', '2026-10'])).toEqual([
      { month: '2026-09', label: 'Sep', revenue: 1000, costs: 300, netIncome: 700 },
      { month: '2026-10', label: 'Oct', revenue: 3200, costs: 400 + 400, netIncome: 2400 },
    ])
  })
})
