import { describe, it, expect } from 'vitest'
import { initials, nameOf, visitDate } from './format.js'

describe('initials', () => {
  it('takes the first letter of the first and the last word', () => {
    expect(initials('Ramon dela Cruz')).toBe('RC')
    expect(initials('Ana')).toBe('A')
  })
})

describe('nameOf', () => {
  it('finds a name by id, or gives an empty string', () => {
    expect(nameOf([{ id: 'a', name: 'Ana' }], 'a')).toBe('Ana')
    expect(nameOf([], 'x')).toBe('')
  })
})

describe('visitDate', () => {
  it('says Today, drops the year in this year and keeps it otherwise', () => {
    const today = new Date(2026, 10, 20)
    expect(visitDate('2026-11-20', today)).toBe('Today')
    expect(visitDate('2026-11-14', today)).toBe('Nov 14')
    expect(visitDate('2025-11-14', today)).toBe('Nov 14, 2025')
    expect(visitDate(null, today)).toBe('No visits yet')
  })
})
