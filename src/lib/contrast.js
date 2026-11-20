// WCAG 2 relative luminance of a #RRGGBB colour
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// WCAG 2 contrast ratio, rounded to 2 decimals; argument order does not matter
export function contrastRatio(hexA, hexB) {
  const [hi, lo] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a)
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100
}
