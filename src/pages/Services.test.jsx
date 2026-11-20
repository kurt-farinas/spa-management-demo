// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { spaConfig } from '../config/spa.config.js'
import { Services } from './Services.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const state = { employees: [], clients: [], products: [], expenses: [], appointments: [], sales: [], services: spaConfig.services }
const names = (category) => spaConfig.services.filter((s) => s.category === category).map((s) => s.name)

describe('Services', () => {
  it("filters the menu to one category with its pill", () => {
    const el = document.createElement('div')
    const root = createRoot(el)
    act(() =>
      root.render(
        <RoleProvider initialRole="owner">
          <DemoStoreProvider initialState={state}>
            <MemoryRouter>
              <Services />
            </MemoryRouter>
          </DemoStoreProvider>
        </RoleProvider>,
      ),
    )
    expect(el.textContent).toContain('Swedish massage')
    const pill = [...el.querySelectorAll('button')].find((b) => b.textContent === 'Facial')
    act(() => pill.click())
    const shown = [...el.querySelectorAll('h3')].map((h) => h.textContent)
    expect(shown).toEqual(names('Facial'))
    expect(pill.getAttribute('aria-pressed')).toBe('true')
    act(() => root.unmount())
  })

  it('hides the commission rate from a receptionist', () => {
    const el = document.createElement('div')
    const root = createRoot(el)
    act(() =>
      root.render(
        <RoleProvider initialRole="receptionist">
          <DemoStoreProvider initialState={state}>
            <MemoryRouter>
              <Services />
            </MemoryRouter>
          </DemoStoreProvider>
        </RoleProvider>,
      ),
    )
    expect(el.textContent).toContain('Swedish massage')
    expect(el.textContent).not.toMatch(/commission/i)
    act(() => root.unmount())
  })

  it('gives a Massage service row its category band', () => {
    const el = document.createElement('div')
    const root = createRoot(el)
    act(() =>
      root.render(
        <RoleProvider initialRole="owner">
          <DemoStoreProvider initialState={state}>
            <MemoryRouter>
              <Services />
            </MemoryRouter>
          </DemoStoreProvider>
        </RoleProvider>,
      ),
    )
    const row = [...el.querySelectorAll('li')].find((li) => li.querySelector('h3')?.textContent === 'Swedish massage')
    expect(row.querySelector('.bg-cat-massage')).not.toBeNull()
    act(() => root.unmount())
  })
})
