import { describe, it, expect } from 'vitest'
import { employeeStats, employeeMonthAppointments } from './selectors.js'

const state = {
  services: [
    { id: 's1', name: 'Swedish massage', category: 'Massage', durationMin: 60, price: 1000, commissionRate: 0.1 },
    { id: 's2', name: 'Gold facial', category: 'Facial', durationMin: 75, price: 1500, commissionRate: 0.15 },
  ],
  appointments: [
    { id: 'a3', employeeId: 'e1', serviceId: 's1', clientId: 'c1', start: '2026-11-20T15:00', durationMin: 60, status: 'booked' },
    { id: 'a1', employeeId: 'e1', serviceId: 's1', clientId: 'c1', start: '2026-11-03T10:00', durationMin: 60, status: 'done' },
    { id: 'a2', employeeId: 'e1', serviceId: 's2', clientId: 'c1', start: '2026-11-05T09:00', durationMin: 75, status: 'cancelled' },
    { id: 'a4', employeeId: 'e2', serviceId: 's1', clientId: 'c1', start: '2026-11-04T10:00', durationMin: 60, status: 'done' },
    { id: 'a5', employeeId: 'e1', serviceId: 's1', clientId: 'c1', start: '2026-10-30T10:00', durationMin: 60, status: 'done' },
  ],
  sales: [
    {
      id: 'S-1',
      date: '2026-11-03T11:00',
      employeeId: 'e1',
      lines: [
        { type: 'service', id: 's1', name: 'Swedish massage', qty: 1, unitPrice: 1000 },
        { type: 'product', id: 'p1', name: 'Oil', qty: 2, unitPrice: 650 },
      ],
    },
    { id: 'S-2', date: '2026-11-10T12:00', employeeId: 'e1', lines: [{ type: 'service', id: 's1', name: 'Swedish massage', qty: 1, unitPrice: 1000 }] },
    { id: 'S-3', date: '2026-11-11T12:00', employeeId: 'e2', lines: [{ type: 'service', id: 's2', name: 'Gold facial', qty: 1, unitPrice: 1500 }] },
    { id: 'S-4', date: '2026-10-29T12:00', employeeId: 'e1', lines: [{ type: 'service', id: 's2', name: 'Gold facial', qty: 1, unitPrice: 1500 }] },
  ],
}

describe('employeeStats', () => {
  it('sums one employee\'s month: appointments not cancelled, service lines, commission at each service\'s rate', () => {
    expect(employeeStats(state, 'e1', '2026-11')).toEqual({ appointments: 2, servicesDone: 2, serviceSales: 2000, commission: 200 })
  })

  it('rounds commission to whole pesos', () => {
    const odd = { ...state, sales: [{ id: 'S-9', date: '2026-11-02T10:00', employeeId: 'e2', lines: [{ type: 'service', id: 's2', name: 'Gold facial', qty: 1, unitPrice: 1003 }] }] }
    expect(employeeStats(odd, 'e2', '2026-11').commission).toBe(150)
  })

  it('is all zero for an employee with nothing that month', () => {
    expect(employeeStats(state, 'e9', '2026-11')).toEqual({ appointments: 0, servicesDone: 0, serviceSales: 0, commission: 0 })
  })
})

describe('employeeMonthAppointments', () => {
  it("lists the employee's appointments that month, cancelled included, sorted by start", () => {
    expect(employeeMonthAppointments(state, 'e1', '2026-11').map((a) => a.id)).toEqual(['a1', 'a2', 'a3'])
  })
})
