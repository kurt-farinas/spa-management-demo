import { describe, it, expect } from 'vitest'
import { formatPeso } from './money.js'

describe('formatPeso', () => {
  it('formats whole pesos with a peso sign and no decimals', () => {
    expect(formatPeso(18450)).toBe('₱18,450')
    expect(formatPeso(0)).toBe('₱0')
  })
})
