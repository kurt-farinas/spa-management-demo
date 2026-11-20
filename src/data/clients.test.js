import { describe, it, expect } from 'vitest'
import { clientSummaries, clientHistory, isNewClient } from './selectors.js'

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

describe('isNewClient / New tag', () => {
  const today = new Date(2026, 10, 20)
  const people = {
    clients: [
      { id: 'a', name: 'Joined today', joinedOn: '2026-11-20', tags: ['Regular'] },
      { id: 'b', name: 'Three days', joinedOn: '2026-11-17', tags: ['Regular'] },
      { id: 'c', name: 'Forty days', joinedOn: '2026-10-11', tags: ['New'] },
      { id: 'd', name: 'Last day in', joinedOn: '2026-10-22', tags: ['VIP', 'Regular'] },
      { id: 'e', name: 'Day after', joinedOn: '2026-10-21', tags: ['New'] },
    ],
    sales: [],
  }

  it('is New for the last 30 days counting today, whatever the stored tag says', () => {
    const by = Object.fromEntries(people.clients.map((c) => [c.id, isNewClient(c, today)]))
    expect(by).toEqual({ a: true, b: true, c: false, d: true, e: false })
  })

  it('derives the New tag from the join date and keeps VIP / Regular as stored', () => {
    const tags = Object.fromEntries(clientSummaries(people, today).map((c) => [c.id, c.tags]))
    expect(tags.b).toEqual(['Regular', 'New'])
    expect(tags.c).toEqual(['Regular'])
    expect(tags.d).toEqual(['VIP', 'Regular', 'New'])
  })
})
