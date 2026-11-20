import { describe, it, expect } from 'vitest'
import { contrastRatio } from '../lib/contrast.js'
import { spaConfig } from './spa.config.js'

// text colour / background colour pairs that must meet WCAG AA for normal text
const pairs = [
  ['text', 'page'],
  ['text', 'surface'],
  ['muted', 'page'],
  ['muted', 'surface'],
  ['railInk', 'rail'],
  ['railInk', 'railActive'],
  ['text', 'accent'],
  ['text', 'highlight'],
  ['text', 'soft'],
  ['accentInk', 'surface'],
  ['accentInk', 'page'],
  ['warnText', 'warnBg'],
  ['success', 'successBg'],
  ['danger', 'surface'],
]

describe('theme contrast', () => {
  it.each(pairs)('%s on %s is at least 4.5:1', (fg, bg) => {
    const ratio = contrastRatio(spaConfig.theme[fg], spaConfig.theme[bg])
    expect(ratio, `${fg}/${bg} is ${ratio}:1`).toBeGreaterThanOrEqual(4.5)
  })
})
