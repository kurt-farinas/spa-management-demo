import { describe, it, expect } from 'vitest'
import { categoryBand, STATUS_PILL } from './ui.js'

describe('ui', () => {
  it('gives Massage its band colour', () => expect(categoryBand('Massage')).toBe('bg-cat-massage'))
  it('gives Facial its band colour plus an inset ink hairline', () => {
    expect(categoryBand('Facial')).toContain('bg-cat-facial')
    expect(categoryBand('Facial')).toContain('ring-inset')
  })
  it('gives Package its band colour', () => expect(categoryBand('Package')).toBe('bg-cat-package'))
  it('falls back to muted for an unknown category', () => expect(categoryBand('Unknown')).toBe('bg-muted'))
  it('keeps the No-show label', () => expect(STATUS_PILL['no-show'][0]).toBe('No-show'))
  it('keeps the Booked label', () => expect(STATUS_PILL.booked[0]).toBe('Booked'))
})
