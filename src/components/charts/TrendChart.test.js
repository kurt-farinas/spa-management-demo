import { describe, it, expect } from 'vitest'
import { tickLabel } from './TrendChart.jsx'

const months = [{ month: '2026-10', label: 'Oct' }, { month: '2026-11', label: 'Nov' }]

describe('tickLabel', () => {
  it('stars the partial month by its label, whatever the tick index', () => {
    expect(tickLabel(months, '2026-11', 'Nov')).toBe('Nov*')
    expect(tickLabel(months, '2026-11', 'Oct')).toBe('Oct')
    expect(tickLabel(months, '2026-11', 'Dec')).toBe('Dec')
  })
})
