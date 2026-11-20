export function applyTheme(theme) {
  const style = document.documentElement.style
  for (const [key, value] of Object.entries(theme)) {
    const kebab = key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())
    style.setProperty(`--brand-${kebab}`, value)
  }
}

export function applyFonts(fonts) {
  const style = document.documentElement.style
  style.setProperty('--font-heading', `'${fonts.heading}', system-ui, sans-serif`)
  style.setProperty('--font-body', `'${fonts.body}', system-ui, sans-serif`)
}
