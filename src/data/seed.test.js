import { describe, it, expect } from 'vitest'
import { buildSeed } from './seed.js'
import { addMinutes } from './dates.js'

const today = new Date('2026-11-20T12:00')
const seed = buildSeed(42, today)

describe('buildSeed', () => {
  it('buildSeed is deterministic', () => {
    expect(JSON.stringify(buildSeed(42, today))).toBe(JSON.stringify(seed))
  })

  it('buildSeed sizes', () => {
    expect(seed.employees).toHaveLength(8)
    expect(seed.clients).toHaveLength(60)
    expect(seed.services).toHaveLength(12)
    expect(seed.products).toHaveLength(15)
  })

  it('every done appointment has a sale', () => {
    const done = seed.appointments.filter((a) => a.status === 'done')
    expect(done.length).toBeGreaterThan(0)
    for (const a of done) {
      const sale = seed.sales.find((s) => s.date === a.start && s.clientId === a.clientId && s.employeeId === a.employeeId)
      expect(sale, a.id).toBeTruthy()
    }
  })

  it('sales cover six months', () => {
    const dates = seed.sales.map((s) => s.date).sort()
    expect(dates[0] >= '2026-05-20').toBe(true)
    expect(dates.at(-1) <= '2026-11-20T23:59').toBe(true)
  })

  it('no therapist double booking', () => {
    const active = seed.appointments
      .filter((a) => a.status !== 'cancelled' && a.status !== 'no-show')
      .sort((a, b) => a.start.localeCompare(b.start))
    const lastEnd = {}
    for (const a of active) {
      expect(a.start >= (lastEnd[a.employeeId] ?? ''), a.id).toBe(true)
      lastEnd[a.employeeId] = addMinutes(a.start, a.durationMin)
    }
  })
})
