import { describe, it, expect } from 'vitest'
import { formatPeso, kilo } from './money.js'

describe('formatPeso', () => {
  it('formats whole pesos with a peso sign and no decimals', () => {
    expect(formatPeso(18450)).toBe('₱18,450')
    expect(formatPeso(0)).toBe('₱0')
  })
})

describe('kilo', () => {
  it('shortens axis ticks, millions to 1 decimal and a negative in parentheses', () => {
    expect([kilo(0), kilo(2000), kilo(1234567), kilo(2000000)]).toEqual(['₱0', '₱2k', '₱1.2M', '₱2M'])
    expect([kilo(-2000), kilo(-1500000)]).toEqual(['(₱2k)', '(₱1.5M)'])
  })
})
