import { spaConfig } from '../config/spa.config.js'

const PESO = { style: 'currency', currency: spaConfig.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }
const peso = new Intl.NumberFormat(spaConfig.locale, PESO)

export const formatPeso = (n) => peso.format(n)

// accountant style: a negative amount shows in parentheses, (₱1,200)
const accounting = new Intl.NumberFormat(spaConfig.locale, { ...PESO, currencySign: 'accounting' })
export const formatAccounting = (n) => accounting.format(n)

// chart axis ticks: ₱2k, millions to 1 decimal ₱1.2M, a negative in parentheses (₱2k)
export const kilo = (v) => {
  const n = Math.abs(v)
  const text = `₱${n >= 1e6 ? `${Math.round(n / 1e5) / 10}M` : n ? `${Math.round(n / 1000)}k` : 0}`
  return v < 0 ? `(${text})` : text
}
