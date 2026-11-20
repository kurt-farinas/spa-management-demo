import { createContext, useContext, useState } from 'react'

const RoleContext = createContext(null)

// in memory only: a reload goes back to the login screen
export function RoleProvider({ children, initialRole = null }) {
  const [role, setRole] = useState(initialRole)
  return (
    <RoleContext.Provider value={{ role, login: setRole, logout: () => setRole(null) }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const value = useContext(RoleContext)
  if (!value) throw new Error('useRole must be used inside RoleProvider')
  return value
}
