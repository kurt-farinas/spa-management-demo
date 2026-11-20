import { describe, it, expect } from 'vitest'
import { monthsBack, toDateStr } from './dates.js'

describe('monthsBack', () => {
  it('keeps the calendar day', () => {
    expect(toDateStr(monthsBack(new Date('2026-11-20T12:00'), 6))).toBe('2026-05-20')
    expect(toDateStr(monthsBack(new Date('2026-03-10T12:00'), 6))).toBe('2025-09-10')
  })

  it('clamps to the last day of a shorter month', () => {
    expect(toDateStr(monthsBack(new Date('2026-08-31T12:00'), 6))).toBe('2026-02-28')
  })
})
