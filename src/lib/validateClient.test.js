import { describe, it, expect } from 'vitest'
import { validateClient } from './validateClient.js'

const ok = { name: 'Ana Cruz', phone: '09171234567', email: '', birthday: '', notes: '' }

describe('validateClient', () => {
  it('passes a name and a mobile number, with or without spaces', () => {
    expect(validateClient(ok)).toEqual({})
    expect(validateClient({ ...ok, phone: '0917 123 4567' })).toEqual({})
  })

  it('asks for a name', () => {
    expect(validateClient({ ...ok, name: '' }).name).toBe('Enter a name')
    expect(validateClient({ ...ok, name: '   ' }).name).toBe('Enter a name')
  })

  it('rejects a phone that is not a PH mobile number', () => {
    for (const phone of ['', '12345', '0917-123-4567', '0817 123 4567', '0917 123 45678'])
      expect(validateClient({ ...ok, phone }).phone).toBe('Enter a mobile number like 0917 123 4567')
  })

  it('checks the email only when one is given', () => {
    expect(validateClient({ ...ok, email: 'ana@example.com' })).toEqual({})
    expect(validateClient({ ...ok, email: 'ana@' }).email).toBe('Enter an email like name@example.com')
  })
})
