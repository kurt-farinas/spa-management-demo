import { HashRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { RoleProvider } from './auth/RoleProvider.jsx'
import { DemoStoreProvider } from './data/DemoStore.jsx'
import { AppRoutes } from './app/routes.jsx'

export default function App() {
  return (
    <RoleProvider>
      <DemoStoreProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
        <Toaster position="top-center" toastOptions={{ style: { background: 'var(--color-rail)', color: 'var(--color-rail-ink)' } }} />
      </DemoStoreProvider>
    </RoleProvider>
  )
}
