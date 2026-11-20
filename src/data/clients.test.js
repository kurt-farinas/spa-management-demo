import { describe, it, expect } from 'vitest'
import { clientSummaries, clientHistory } from './selectors.js'

const state = {
  employees: [
    { id: 'e1', name: 'Ana Cruz' },
    { id: 'e2', name: 'Jomar Reyes' },
  ],
  clients: [
    { id: 'C-3', name: 'Pia Dizon', tags: ['New'] },
    { id: 'c1', name: 'Bea Santos', tags: ['VIP', 'Regular'] },
    { id: 'c2', name: 'Carlo Reyes', tags: ['Regular'] },
  ],
  sales: [
    { id: 'S-1', date: '2026-11-02T10:00', clientId: 'c1', employeeId: 'e1', total: 1200, lines: [{ type: 'service', id: 's1', name: 'Swedish massage', qty: 1, unitPrice: 1200 }] },
    {
      id: 'S-2',
      date: '2026-11-14T15:30',
      clientId: 'c1',
      employeeId: 'e2',
      total: 2450,
      lines: [
        { type: 'service', id: 's2', name: 'Gold facial', qty: 1, unitPrice: 1800 },
        { type: 'product', id: 'p1', name: 'Lavender massage oil', qty: 1, unitPrice: 650 },
      ],
    },
    { id: 'S-3', date: '2026-11-09T11:00', clientId: 'c2', employeeId: 'e1', total: 800, lines: [{ type: 'service', id: 's3', name: 'Foot reflexology', qty: 1, unitPrice: 800 }] },
    {
      id: 'S-4',
      date: '2026-11-07T12:00',
      clientId: 'c1',
      employeeId: 'e1',
      total: 1750,
      lines: [
        { type: 'service', id: 's4', name: 'Spa manicure', qty: 1, unitPrice: 450 },
        { type: 'service', id: 's5', name: 'Shiatsu', qty: 1, unitPrice: 1300 },
      ],
    },
  ],
}
const today = new Date(2026, 10, 20)
const numbers = ({ id, visits, totalSpent, lastVisit }) => ({ id, visits, totalSpent, lastVisit })

describe('clientSummaries', () => {
  it('adds visits, total spent and last visit to each client, newest client first', () => {
    expect(clientSummaries(state, today).map(numbers)).toEqual([
      { id: 'C-3', visits: 0, totalSpent: 0, lastVisit: null },
      { id: 'c1', visits: 3, totalSpent: 5400, lastVisit: '2026-11-14' },
      { id: 'c2', visits: 1, totalSpent: 800, lastVisit: '2026-11-09' },
    ])
  })

  it('keeps the client fields', () => {
    expect(clientSummaries(state, today)[1]).toMatchObject({ name: 'Bea Santos', tags: ['VIP', 'Regular'] })
  })

  it('counts only sales up to today', () => {
    expect(numbers(clientSummaries(state, new Date(2026, 10, 10))[1])).toEqual({ id: 'c1', visits: 2, totalSpent: 2950, lastVisit: '2026-11-07' })
  })
})

describe('clientHistory', () => {
  it("lists the client's visits newest first with services and therapist", () => {
    expect(clientHistory(state, 'c1').map(({ id, ...rest }) => rest)).toEqual([
      { date: '2026-11-14', serviceNames: 'Gold facial', therapistName: 'Jomar Reyes', total: 2450 },
      { date: '2026-11-07', serviceNames: 'Spa manicure, Shiatsu', therapistName: 'Ana Cruz', total: 1750 },
      { date: '2026-11-02', serviceNames: 'Swedish massage', therapistName: 'Ana Cruz', total: 1200 },
    ])
  })

  it('is empty for a client with no visits', () => {
    expect(clientHistory(state, 'C-3')).toEqual([])
  })
})
