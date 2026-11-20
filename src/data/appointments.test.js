import { describe, it, expect } from 'vitest'
import { weekDays, appointmentsInRange, validateBookingForm as validate } from './selectors.js'

const state = {
  employees: [
    { id: 'e1', name: 'Ana Cruz', role: 'Therapist', schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    { id: 'e2', name: 'Jomar Reyes', role: 'Therapist', schedule: ['Fri', 'Sat', 'Sun'] },
  ],
  clients: [{ id: 'c1', name: 'Bea Santos' }],
  services: [
    { id: 's1', name: 'Swedish massage', durationMin: 60 },
    { id: 's2', name: 'Half-day escape', durationMin: 150 },
  ],
  appointments: [
    { id: 'A-3', clientId: 'c1', employeeId: 'e2', serviceId: 's1', start: '2026-11-20T09:00', durationMin: 60, status: 'booked' },
    { id: 'A-1', clientId: 'c1', employeeId: 'e1', serviceId: 's1', start: '2026-11-20T13:00', durationMin: 60, status: 'done' },
    { id: 'A-2', clientId: 'c1', employeeId: 'e1', serviceId: 's2', start: '2026-11-15T10:00', durationMin: 150, status: 'booked' },
    { id: 'A-4', clientId: 'c1', employeeId: 'e1', serviceId: 's1', start: '2026-11-23T10:00', durationMin: 60, status: 'booked' },
  ],
}

describe('weekDays', () => {
  it('gives the Monday-first week of any date', () => {
    const days = weekDays('2026-11-20')
    expect(days).toHaveLength(7)
    expect(days[0]).toBe('2026-11-16')
    expect(days[6]).toBe('2026-11-22')
    expect(weekDays('2026-11-16')[0]).toBe('2026-11-16')
    expect(weekDays('2026-11-22')[0]).toBe('2026-11-16')
  })
})

describe('appointmentsInRange', () => {
  it('keeps both ends of the range, sorts by start and joins the names', () => {
    const list = appointmentsInRange(state, '2026-11-16', '2026-11-22')
    expect(list.map((a) => a.id)).toEqual(['A-3', 'A-1'])
    expect(list[1]).toMatchObject({ clientName: 'Bea Santos', employeeName: 'Ana Cruz', serviceName: 'Swedish massage' })
  })

  it('filters to one therapist', () => {
    expect(appointmentsInRange(state, '2026-11-15', '2026-11-23', 'e1').map((a) => a.id)).toEqual(['A-2', 'A-1', 'A-4'])
  })
})

describe('validateBookingForm', () => {
  const validateBookingForm = (st, form, today = '2026-11-01') => validate(st, form, today)
  const ok = { clientId: 'c1', serviceId: 's1', employeeId: 'e1', date: '2026-11-20', time: '10:00' }

  it('rejects a client id that is not in the state', () => {
    expect(validateBookingForm(state, { ...ok, clientId: 'c999' })).toEqual({ clientId: 'Choose a client' })
  })

  it('rejects a date before today, accepts today', () => {
    expect(validateBookingForm(state, { ...ok, date: '2026-11-19' }, '2026-11-20')).toEqual({ date: 'Pick today or a later date' })
    expect(validateBookingForm(state, ok, '2026-11-20')).toEqual({})
  })

  it('passes a complete booking', () => {
    expect(validate(state, ok)).toEqual({})
  })

  it('asks for a missing client', () => {
    expect(validate(state, { ...ok, clientId: '' })).toEqual({ clientId: 'Choose a client' })
  })

  it('rejects a therapist on their day off', () => {
    // 2026-11-22 is a Sunday
    expect(validate(state, { ...ok, date: '2026-11-22' })).toEqual({ employeeId: 'Ana Cruz is off on Sunday' })
  })

  it('rejects a service that ends after closing', () => {
    expect(validate(state, { ...ok, serviceId: 's2', time: '17:45' })).toEqual({ time: 'Ends after closing (8:00 PM)' })
    expect(validate(state, { ...ok, serviceId: 's2', time: '17:30' })).toEqual({})
  })
})
