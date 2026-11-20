import { describe, it, expect } from 'vitest'
import { PAGES, canSee } from './roles.js'

describe('roles', () => {
  it('hides owner-only keys from the receptionist', () => {
    expect(canSee('receptionist', 'financial-statement')).toBe(false)
    expect(canSee('receptionist', 'profit')).toBe(false)
    expect(canSee('receptionist', 'pos')).toBe(true)
  })

  it('lets the owner see everything known', () => {
    expect(canSee('owner', 'financial-statement')).toBe(true)
    expect(canSee('owner', 'nope')).toBe(false)
  })

  it('sees nothing without a role', () => {
    expect(canSee(null, 'dashboard')).toBe(false)
  })

  it('lists the 9 pages in menu order', () => {
    expect(PAGES.map((p) => p.key)).toEqual([
      'dashboard', 'appointments', 'clients', 'employees', 'services', 'inventory', 'pos', 'sales-report', 'financial-statement',
    ])
    expect(PAGES[0].path).toBe('/')
    expect(PAGES.slice(1).every((p) => p.path === `/${p.key}`)).toBe(true)
  })
})
