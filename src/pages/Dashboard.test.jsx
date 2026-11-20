// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { Dashboard } from './Dashboard.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
// jsdom has no ResizeObserver, which the chart's ResponsiveContainer needs
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }

function render(role) {
  const el = document.createElement('div')
  const root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole={role}>
        <DemoStoreProvider>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </DemoStoreProvider>
      </RoleProvider>,
    ),
  )
  return { el, root }
}

describe('Dashboard', () => {
  it('shows Profit this month to the owner only', () => {
    const owner = render('owner')
    expect(owner.el.textContent).toContain('Profit this month')
    act(() => owner.root.unmount())
    const rec = render('receptionist')
    expect(rec.el.textContent).not.toContain('Profit this month')
    expect(rec.el.textContent).toContain('Bookings today')
    act(() => rec.root.unmount())
  })
})
