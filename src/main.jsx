import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { spaConfig } from './config/spa.config.js'
import { applyTheme, applyFonts } from './config/applyTheme.js'

applyTheme(spaConfig.theme)
applyFonts(spaConfig.fonts)
document.title = spaConfig.name

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
