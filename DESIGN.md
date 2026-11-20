---
name: Lumière Day Spa (spa demo)
description: A re-skinnable front-desk system for a Philippine day spa, dressed as a fresh botanical label.
colors:
  rail: "#2E6B4F"
  rail-ink: "#EEF4EF"
  rail-active: "#24573F"
  page: "#F5F7F0"
  surface: "#FFFFFF"
  line: "#DDE3D6"
  soft: "#EAF0E2"
  ink: "#1D2A23"
  muted: "#55635A"
  accent: "#E39B3A"
  accent-ink: "#7A4E0E"
  highlight: "#D9E46B"
  warn-bg: "#FAEEDA"
  warn-ink: "#633806"
  success-bg: "#EAF3DE"
  success: "#3B6D11"
  danger: "#A32D2D"
  cat-massage: "#2E6B4F"
  cat-facial: "#D9E46B"
  cat-body: "#7A5235"
  cat-nails: "#C2413B"
  cat-package: "#E39B3A"
typography:
  display:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "88px"
    fontWeight: 700
    lineHeight: "88px"
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "32px"
  figure:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "36px"
    fontFeature: "tnum"
  title:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
  caption:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
  micro:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  tap: "44px"
  card-x-phone: "14px"
  card-x: "20px"
  page-x-phone: "16px"
  page-x: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.soft}"
  pill-on:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.rail-ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  pill-off:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  status-booked:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.ink}"
    typography: "{typography.micro}"
    rounded: "{rounded.full}"
  status-done:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    typography: "{typography.micro}"
    rounded: "{rounded.full}"
  status-cancelled:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.micro}"
    rounded: "{rounded.sm}"
  status-no-show:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
    typography: "{typography.micro}"
    rounded: "{rounded.sm}"
  stat-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  stat-card-dark:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.rail-ink}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  nav-item-active:
    backgroundColor: "{colors.rail-active}"
    textColor: "{colors.rail-ink}"
    rounded: "{rounded.md}"
    height: "44px"
---

# Design System: Lumière Day Spa (spa demo)

## Overview

**Creative North Star: "The Botanical Label"**

The front desk reads like a fresh local product label: pandan green, calamansi yellow-green, coconut white, amber. It is a working tool first. White panels sit on a pale green-white ground, separated by thin hairlines instead of shadows, and colour appears only where it does a job: the rail you navigate with, the one action you take, the booking you are looking at, the category of a service, the state of an appointment. It must not read as a purple-on-grey admin template, nor as a cream-and-serif "luxury" page, and it must never be dark or heavy.

The theme is re-skinned per prospect. Every value below is the current Lumière skin, set in `src/config/spa.config.js` and pushed into CSS variables (`--brand-*`) by `applyTheme`; `src/index.css` maps those into Tailwind tokens (`bg-rail`, `text-ink`, `border-line`, ...). The roles are the system; the hex values are one skin. A new skin changes the values, never the roles.

Density is medium: 44px tap targets everywhere, 13–15px working text, tabular figures for every number a spa owner would compare.

**Key Characteristics:**
- Green side rail on desktop, green top bar plus white bottom nav on phones.
- Flat white panels with 1px hairlines; shadow only on things that float.
- One family (Figtree) at several weights; tabular numbers.
- Amber is the single primary action, always with ink text.
- Status is shown by words and shape, colour only reinforces it.

## Colors

A cool botanical palette: green structure, white surfaces, one warm action colour and one acid highlight.

### Primary
- **Pandan Rail** (rail): the side rail, phone top bar, phone menu sheet, selected pills, the dark StatCard and the focus ring on light ground. The brand's structural colour.
- **Rail Ink** (rail-ink): all text and icons on the rail. Also the focus-ring colour inside rail areas (`.on-rail`, `.on-rail-mobile`).
- **Rail Active** (rail-active): hover and active fill for rail nav items; the menu backdrop at 60%.

### Secondary
- **Amber** (accent): the primary action fill (New sale, Checkout, Book, Save) and the small demo-note dot. Text on it is always ink.
- **Amber Ink** (accent-ink): text links and text buttons on surface or page. Amber itself is never used as text.

### Tertiary
- **Calamansi** (highlight): highlight fill only. Today's bar in the 14-day sales chart, the active bottom-nav icon capsule, the active rail item's 3px marker, and the Booked status at 45% opacity. Text on it is always ink.

### Neutral
- **Coconut Page** (page): the app ground behind panels and off-hours calendar columns. Green-white, never beige.
- **Surface** (surface): panels, cards, inputs, table bodies, calendar blocks, the bottom nav.
- **Hairline** (line): every 1px border and divider, calendar hour lines, text selection.
- **Soft** (soft): hover fill on secondary buttons and calendar blocks, today's column tint, chart tooltip border.
- **Ink** (ink): body text, headings, text on amber and calamansi.
- **Muted** (muted): secondary text, labels on light ground, placeholder, the Cancelled stamp.

### State
- **Warn** (warn-bg with warn-ink): running-low and caution notes.
- **Success** (success-bg with success): the Done status and positive figures.
- **Danger** (danger, on surface): the No-show stamp, errors, losses.

### Service categories
One colour per service category, drawn by `categoryBand()`: **Massage** pandan (cat-massage), **Facial** calamansi (cat-facial), **Body** coffee (cat-body), **Nails** gumamela (cat-nails), **Package** amber (cat-package). Unknown categories fall back to muted. They appear as a 4px band at the left edge of an appointment row or calendar block, a 8px swatch next to a category name, and the bar in Top services. Because calamansi is too pale to show against white, the Facial band always carries an inset ink hairline (ring 1px, ink at 25%).

### Named Rules
**The Roles Not Hex Rule.** Components never hard-code a colour. They use the role tokens (`bg-rail`, `text-ink`, `border-line`, `bg-cat-*`) or `var(--color-*)` / `var(--brand-*)` inside arbitrary values, so a prospect's re-skin in `spa.config.js` reaches every pixel.

**The Guarded Pairs Rule.** `src/config/themeContrast.test.js` asserts 4.5:1 for every text-on-ground pair the UI uses: ink on page, surface, accent, highlight and soft; muted on page and surface; rail-ink on rail and rail-active; accent-ink on surface and page; warn-ink on warn-bg; success on success-bg; danger on surface. A new skin must pass it, and a new text-on-colour pairing gets added to it.

**The Ink On Bright Rule.** Text on amber or calamansi is ink, never white.

## Typography

**Display Font:** Figtree (with system-ui, sans-serif)
**Body Font:** Figtree (with system-ui, sans-serif)

**Character:** One friendly geometric-humanist family carried by weight alone: bold for page titles, semibold for labels and figures, regular for reading. No serif, no second family.

### Hierarchy
- **Display** (700, 48px phone / 88px desktop, -0.03em): the logo word on the login screen only. The login welcome heading sits at 32px / 40px.
- **Headline** (700, 22px/28px phone, 24px/32px desktop): one page title (h1) per screen. Dialog titles step down to 20px, POS panel titles to 18px.
- **Figure** (600, 24px phone / 28px desktop, tabular): StatCard values. Sale totals in POS use 32px bold, tabular.
- **Title** (600, 15px): panel and section headings (h2).
- **Body** (400–600, 14px): table text, buttons, nav items, inputs.
- **Label** (600, 13px): StatCard labels, sub-headings, links, pills, calendar block client names.
- **Caption** (400, 12px): notes under figures, calendar block meta, bottom-nav labels.
- **Micro** (600–700, 11px): status pills and stamps, the rail's REPORTS group label. This is the floor.

### Named Rules
**The Eleven Floor Rule.** Nothing is set below 11px.

**The Tabular Figures Rule.** Every money amount, count, time and date that sits in a column, tile or total uses tabular numbers.

## Layout

Desktop (md, 768px and up): a sticky full-height green side rail (232px) holds the brand and nav; a 56px hairline-bottomed utility bar holds the demo note, role switch and Log out; content pads 32px at the sides, 24px top. Phone: a 56px green top bar with menu, logo word and role switch; the nav opens as a full-height green sheet (288px, max 85vw); a 64px white bottom nav with four destinations (Home, Bookings, Clients, Sell) sits fixed at the bottom; content pads 16px and leaves 112px at the bottom for the nav. On the dashboard the New sale action sits top right in the header on desktop and floats as a pill above the bottom nav on phones (right 16px, bottom 88px, 48px tall).

Spacing follows Tailwind's 4px steps. Panels pad 14px at the sides on phones and 20px from md up. Every interactive target is at least 44px in both dimensions, including text buttons and the icon-only close buttons.

## Elevation & Depth

Flat by default. Depth comes from tonal layering (page, surface, soft) and 1px hairlines. Shadows appear only on elements that float over content.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 2px 6px color-mix(in srgb, var(--color-ink) 18%, transparent)`): the phone floating New sale pill.
- **Tooltip** (`box-shadow: 0 4px 12px color-mix(in srgb, var(--brand-rail) 12%, transparent)`): chart tooltips.
- **Sticky bar** (`box-shadow: 0 6px 16px -4px` in rail-active at 40%): the phone POS checkout bar fixed above the bottom nav.

### Named Rules
**The Hairline Not Shadow Rule.** Panels, cards and tables separate with a 1px line border, never a resting shadow.

## Shapes

Gently rounded: 8px (lg) for panels, cards and StatCards; 6px (md) for buttons, inputs, selects and nav items; 4px (sm) for calendar blocks, stamps and small swatches; full round for pills, the floating New sale, the bottom-nav active capsule and booked/done status pills. Borders are always 1px line, except the stamps (1px in their own colour) and the 3px calamansi marker on the active rail item.

## Components

### Buttons
- **Shape:** 6px corners, 44px tall, icon plus label with an 8px gap.
- **Primary:** amber fill, ink text, 14px semibold, 20px side padding. Hover dims to 95% brightness (ink on amber stays above 4.5:1 there). One per view.
- **Secondary:** surface fill, 1px line border, ink text, 16px side padding; hover fills soft.
- **Text link / text button:** 13px semibold amber-ink, underline on hover, still 44px tall and at least 44px wide.
- **Floating New sale (phone):** the primary button as a 48px full pill with the Float shadow, fixed above the bottom nav.

### Chips (filter pills)
- **Style:** full pill, 44px tall, 16px side padding, 13px.
- **State:** selected is rail fill with rail-ink semibold text; unselected is surface with a line border and ink text, border turning rail-active on hover.

### Status pills and stamps
- **Booked:** calamansi at 45% with ink, semibold, round pill.
- **Done:** success-bg with success text, semibold, round pill.
- **Cancelled / No-show:** they stay visible as stamps, not faded away: surface fill, 1px border in their own colour (muted / danger), bold uppercase 11px with 0.08em tracking, 4px corners, tilted -2deg. The appointment's time, client and service turn muted and struck through beside them.
- **Narrow calendar blocks:** when a block is too narrow for the pill (under 10rem), a 12px status icon carries the state instead: check in success for done, prohibition sign in danger for no-show, cross in muted for cancelled; booked shows none. The full appointment opens on tap with the label in words.

### Category bands
A 4px full-height band of the category colour at the left inside edge of appointment rows, history rows and calendar blocks, an 8px swatch beside category names, and the bar fill in Top services. It is data, not decoration: the service name is always written beside it. Facial always carries its inset ink hairline.

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** surface on page.
- **Shadow Strategy:** none at rest (see Elevation).
- **Border:** 1px line.
- **Internal Padding:** 14px phone, 20px desktop; panel headers are a 15px semibold title with an optional text-button action.

### StatCard
Label (13px semibold, muted), figure (24px/28px semibold, tabular, ink), optional note (12px/13px muted). A dark variant uses rail fill with rail-ink text for the one tile that leads its row (Net income on the financial statement).

### Inputs / Fields
- **Style:** 44px tall, surface fill, 1px line border, 6px corners, 12px side padding, 14px ink text, muted placeholder. Selects are the same box with a custom caret.
- **Focus:** the global 2px rail outline offset 2px (rail-ink inside rail areas).

### Navigation
- **Rail:** items 44px tall, 14px, 18px icon, 6px corners, rail-ink text; hover and active fill rail-active; active adds semibold and a 3px calamansi marker on the left. Owner-only reports sit under an 11px REPORTS group label.
- **Bottom nav (phone):** four items, 12px labels, active item bold ink with its icon in a calamansi capsule; inactive items muted.

## Do's and Don'ts

### Do:
- **Do** take every colour from a role token or `var(--color-*)`; add any new text-on-colour pair to `themeContrast.test.js`.
- **Do** put ink text on amber and calamansi.
- **Do** keep panels flat: surface, 1px line border, 8px corners.
- **Do** make every tap target at least 44px.
- **Do** use tabular numbers for money, counts, times and dates.
- **Do** keep cancelled and no-show appointments visible as stamps.
- **Do** pair every colour signal with words, a shape or an icon: status label or icon, category name beside its band.

### Don't:
- **Don't** hard-code hex values in components.
- **Don't** put white text on amber or calamansi.
- **Don't** put coloured side-stripe borders on cards or panels; the 4px category band inside an appointment row or block is the only left-edge colour, and it is data.
- **Don't** put eyebrow labels or kickers above headings.
- **Don't** let colour be the only signal of a state or category.
- **Don't** add a second type family or set text below 11px.
- **Don't** give resting panels a shadow, or turn the page ground beige.
