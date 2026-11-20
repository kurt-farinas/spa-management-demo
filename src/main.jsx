import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { spaConfig } from './config/spa.config.js'
import { applyTheme, applyFonts } from './config/applyTheme.js'

applyTheme(spaConfig.theme)
applyFonts(spaConfig.fonts)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
