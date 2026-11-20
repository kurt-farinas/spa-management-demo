import { describe, it, expect } from 'vitest'
import { contrastRatio } from './contrast.js'

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBe(21)
  })

  it('is 1 for the same colour', () => {
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBe(1)
  })

  it('gets mid-range colours right (catches wrong channel weights or cutoff)', () => {
    expect(contrastRatio('#777777', '#FFFFFF')).toBe(4.48)
    expect(contrastRatio('#2E6B4F', '#FFFFFF')).toBe(6.3)
  })

  it('does not depend on argument order', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBe(21)
  })
})
