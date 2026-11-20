import { spaConfig } from '../config/spa.config.js'

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: spaConfig.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const formatPeso = (n) => peso.format(n)
