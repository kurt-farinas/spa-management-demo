import { createContext, useContext, useReducer } from 'react'
import { buildSeed } from './seed.js'
import { demoReducer, validateCheckout, validateBooking, buildSale, buildClient, buildAppointment } from './store.js'

const DemoStoreContext = createContext(null)

export function DemoStoreProvider({ children, initialState }) {
  const [state, dispatch] = useReducer(demoReducer, initialState, (s) => s ?? buildSeed(42, new Date()))

  // shortcut: ids are built from this render's state, so two calls in one event share an id; fine while each form submits once
  const addClient = (input) => {
    const client = buildClient(state, input, new Date())
    dispatch({ type: 'addClient', client })
    return client
  }
  const bookAppointment = (input) => {
    const error = validateBooking(state, input)
    if (error) return { ok: false, error }
    const appointment = buildAppointment(state, input)
    dispatch({ type: 'bookAppointment', appointment })
    return { ok: true, appointment }
  }
  const checkout = (input) => {
    const error = validateCheckout(state, input)
    if (error) return { ok: false, error }
    const sale = buildSale(state, input, new Date())
    dispatch({ type: 'checkout', sale })
    return { ok: true, sale }
  }

  return (
    <DemoStoreContext.Provider value={{ state, addClient, bookAppointment, checkout }}>
      {children}
    </DemoStoreContext.Provider>
  )
}

export function useDemoStore() {
  const store = useContext(DemoStoreContext)
  if (!store) throw new Error('useDemoStore must be used inside DemoStoreProvider')
  return store
}
