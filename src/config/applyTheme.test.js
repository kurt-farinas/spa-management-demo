// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { applyTheme, applyFonts } from './applyTheme.js'
import { spaConfig } from './spa.config.js'

describe('applyTheme', () => {
  it('sets one --brand-<kebab> variable per theme key', () => {
    applyTheme({ primary: '#26215C', primaryDark: '#1A1640' })
    const style = document.documentElement.style
    expect(style.getPropertyValue('--brand-primary').trim()).toBe('#26215C')
    expect(style.getPropertyValue('--brand-primary-dark').trim()).toBe('#1A1640')
  })

  it('sets the font variables', () => {
    applyFonts({ heading: 'Playfair Display', body: 'Inter' })
    const style = document.documentElement.style
    expect(style.getPropertyValue('--font-heading')).toContain('Playfair Display')
    expect(style.getPropertyValue('--font-body')).toContain('Inter')
  })
})

describe('spaConfig.services', () => {
  const services = spaConfig.services

  it('has 12 services with unique ids', () => {
    expect(services).toHaveLength(12)
    expect(new Set(services.map((s) => s.id)).size).toBe(12)
  })

  it('has whole-peso prices above zero', () => {
    for (const s of services) {
      expect(Number.isInteger(s.price) && s.price > 0, s.id).toBe(true)
    }
  })
})
