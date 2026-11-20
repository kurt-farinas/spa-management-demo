import { describe, it, expect } from 'vitest'
import { stockStatus, inventorySummary, cartTotal } from './selectors.js'

const product = (stock, reorderAt = 5) => ({ id: 'p', name: 'Oil', price: 650, cost: 260, stock, reorderAt })

describe('stockStatus', () => {
  it('is out at 0, low at or below the reorder point, ok above it', () => {
    expect(stockStatus(product(0))).toBe('out')
    expect(stockStatus(product(0, 0))).toBe('out')
    expect(stockStatus(product(1))).toBe('low')
    expect(stockStatus(product(5))).toBe('low')
    expect(stockStatus(product(6))).toBe('ok')
  })
})

describe('inventorySummary', () => {
  it('counts products, the ones at or below reorder (out included), and stock value at cost', () => {
    const state = {
      products: [
        { id: 'p1', price: 650, cost: 260, stock: 10, reorderAt: 4 },
        { id: 'p2', price: 500, cost: 200, stock: 4, reorderAt: 4 },
        { id: 'p3', price: 300, cost: 100, stock: 0, reorderAt: 2 },
      ],
    }
    expect(inventorySummary(state)).toEqual({ products: 3, lowStock: 2, stockValueAtCost: 10 * 260 + 4 * 200 })
  })
})

describe('cartTotal', () => {
  it('adds up price × qty across services and products', () => {
    const state = {
      services: [{ id: 's1', price: 1200 }],
      products: [{ id: 's1', price: 99 }, { id: 'p1', price: 650 }],
    }
    expect(cartTotal(state, [])).toBe(0)
    expect(cartTotal(state, [{ type: 'service', id: 's1', qty: 1 }, { type: 'product', id: 'p1', qty: 2 }])).toBe(2500)
  })
})
