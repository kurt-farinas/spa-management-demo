import { spaConfig } from '../config/spa.config.js'

const PESO = { style: 'currency', currency: spaConfig.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }
const peso = new Intl.NumberFormat(spaConfig.locale, PESO)

export const formatPeso = (n) => peso.format(n)

// accountant style: a negative amount shows in parentheses, (₱1,200)
const accounting = new Intl.NumberFormat(spaConfig.locale, { ...PESO, currencySign: 'accounting' })
export const formatAccounting = (n) => accounting.format(n)
