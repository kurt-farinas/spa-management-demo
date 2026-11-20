import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { spaConfig } from './config/spa.config.js'
import { applyTheme, applyFonts } from './config/applyTheme.js'

applyTheme(spaConfig.theme)
applyFonts(spaConfig.fonts)
document.title = spaConfig.name

const description = `${spaConfig.tagline} A spa management demo with sample data.`
const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.head.appendChild(document.createElement('meta'))
    el.setAttribute(attr, key)
  }
  el.setAttribute('content', content)
}
setMeta('name', 'description', description)
setMeta('property', 'og:title', spaConfig.name)
setMeta('property', 'og:description', description)

// favicon from the theme, so a re-skin changes it too; public/favicon.svg is the static fallback
const { primary, goldOnPlum } = spaConfig.theme
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${primary}"/><circle cx="32" cy="32" r="23" fill="none" stroke="${goldOnPlum}" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" fill="${goldOnPlum}">${spaConfig.logoText[0]}</text></svg>`
const icon = document.head.querySelector('link[rel="icon"]') ?? document.head.appendChild(document.createElement('link'))
icon.rel = 'icon'
icon.type = 'image/svg+xml'
icon.href = URL.createObjectURL(new Blob([favicon], { type: 'image/svg+xml' }))

const family = (name, weights) => `family=${name.replaceAll(' ', '+')}:wght@${weights}`
const fonts = document.createElement('link')
fonts.rel = 'stylesheet'
fonts.href = `https://fonts.googleapis.com/css2?${family(spaConfig.fonts.body, '400;500;600')}&${family(spaConfig.fonts.heading, '500;600')}&display=swap`
document.head.append(fonts)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
