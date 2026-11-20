# Spa demo redesign ("Pandan & Calamansi") — roadmap

Kanban card: #141

## 1. Status, goal and success criteria

**Status:** Ready for implementation. Phase 1 (screen mockups) starts now.

**Goal:** replace the plum-and-gold look with a fresh, warm, local look so a mid-range day spa owner sees a modern product made for a spa like theirs, not a template.

**Success looks like:**
- All 10 screens (login + 9 pages) use the new look on laptop (1440px) and phone (390px), with no leftover plum/gold.
- The one-file re-skin still works: changing `theme` in `src/config/spa.config.js` recolours everything, and a test fails when a theme text colour drops below 4.5:1 contrast.
- Every service category has one colour, used the same way in appointments, POS and reports.
- No-show and cancelled bookings stay visible, marked, never silently hidden.
- All existing tests still pass; the live Vercel demo shows the new look.

**Anti-goals (user-confirmed):** cold or corporate, generic admin template, dark or heavy.

## 2. Scope

**Included:** colour and font tokens, app shell (side rail, top bar, phone menu and bottom nav), shared components, all 10 screens, charts' colours, favicon and link-preview colours, README re-skin steps, DESIGN.md.

**Excluded:** new features or pages, data or behaviour changes, dark mode, new dependencies (no component library), photos.

## 3. Decisions and rationale

| # | Decision | Basis | Why |
|---|---|---|---|
| Q1 | Replace the visual world, keep the re-skin file | User-confirmed | Cream + Playfair + gold is the look AI tools give every "luxury" brand. |
| Q2 | Target: mid-range day spas (mall/city, 5–15 staff) | User-confirmed | Biggest group of prospects. |
| Q3 | Must not be cold/corporate, template-like, or dark/heavy | User-confirmed | |
| Q4 | Direction "Pandan & Calamansi" (mockup `.impeccable/mocks/decision/assigned.html`) | User-confirmed | Picked over "Banig Weave" (my recommendation) and the category standard. |
| D1 | Pandan green rail #2E6B4F, coconut-white page #F5F7F0, white surfaces with 1px #DDE3D6 hairlines, ink #1D2A23, amber #E39B3A for the main action, calamansi #D9E46B only as a highlight fill | Delegated (in the chosen mockup) | Warm and fresh; references show warm off-white plus one strong accent beats grey-plus-violet SaaS. |
| D2 | One font, Figtree, tabular numbers; Playfair removed | Delegated | Product screens read better in one family. |
| D3 | Category colours: Massage pandan, Facial calamansi, Body coffee #7A5235, Nails gumamela #C2413B, Package amber | Delegated | The direction's signature: a 4px colour band per row, the same colour in POS and reports. |
| D4 | Rename colour tokens from looks (`plum`, `gold`, `lavender`) to roles (`rail`, `accent`, `highlight`) | Assumption | After a re-skin, "plum" may be green; role names keep the config honest. Mechanical sweep, about 177 usages. |
| D5 | Build approach: change tokens and shared components first, then restyle page by page in the existing React/Tailwind code | Delegated | The only sensible way: a component library adds a dependency and fights the token re-skin; rewriting pages risks the tested behaviour. |
| D6 | Mockups of the key screens are approved before code (Phase 1) | User request ("generate me mockups") | Cheap to change a mockup, expensive to change 10 pages. |

**References used:** Boulevard (warm neutrals, one accent, mono-ish labels), Glowbar (warm ground, one saturated accent), thespa.com.ph (local market: mint, gold, serif), Fresha/Vagaro/Zenoti as "don't" (violet SaaS, busy). ui-ux-pro-max suggested pink + lavender for spas; rejected as cliché.

## 4. Implementation plan

**Flow stays the same:** login → dashboard → pages; only the look changes.

**Technical approach:**
- `spa.config.js` `theme` gets role-named keys (below); `applyTheme` already writes any key as `--brand-<kebab>`, so it needs no change.
- `src/index.css` `@theme` maps `--color-<role>` to `--brand-<role>`; fonts become Figtree only.
- Shared class strings in `src/components/ui.js` (buttons, pills, status, category bands) carry the look so pages stay thin.
- Recharts colours read the CSS variables (`var(--color-…)`), never hex.

**Edge cases decided:** text on amber and calamansi is ink, never white. A theme whose pairs fail 4.5:1 fails `npm test`. A service whose category is unknown gets the muted band.

**Validation:** `npm test` green each phase; screenshots at 1440 and 390 px of every touched page; impeccable finish review at the end.

## 5. Phase-by-phase roadmap

### Phase 1 — Mockups of the key screens (approval gate)

**Outcome:** approved static mockups in the new look for the screens with the most design in them.

- [ ] `.impeccable/mocks/screens/login.html` (1440×900)
- [ ] `.impeccable/mocks/screens/appointments.html` (1440×900, day calendar by therapist, booking panel)
- [ ] `.impeccable/mocks/screens/pos.html` (1440×900, service tiles with category bands, cart, payment)
- [ ] `.impeccable/mocks/screens/dashboard-phone.html` (390×844, phone dashboard with bottom nav)
- [ ] Same palette, font and real demo content as `.impeccable/mocks/decision/assigned.html`.

**Acceptance:** you approve them, or one change round. **Decision gate:** no Phase 2 code before approval.

### Phase 2 — Tokens, shell and shared components

**Prerequisite:** Phase 1 approved.

**Task 2.1 — contrast helper and theme test**
- Files: create `src/lib/contrast.js`, `src/lib/contrast.test.js`, `src/config/themeContrast.test.js`.
- Interface: `contrastRatio(hexA: string, hexB: string): number` (WCAG relative luminance, rounded to 2 decimals).
- Test first: `contrastRatio('#000000', '#FFFFFF')` is `21`; `contrastRatio('#FFFFFF', '#FFFFFF')` is `1`; `themeContrast.test.js` asserts ≥ 4.5 for these `spaConfig.theme` pairs: `text/page`, `text/surface`, `muted/page`, `muted/surface`, `railText/rail`, `text/accent`, `text/highlight`, `warnText/warnBg`, `success/successBg`, `danger/surface`.
- Check: `npm test -- contrast` → all pass.

**Task 2.2 — role-named theme**
- Files: `src/config/spa.config.js` (theme block), `src/index.css` (`@theme` block, fonts), `src/config/applyTheme.test.js` if it names old keys, `index.html` (Figtree font link, drop Playfair), `public/favicon.svg` colours.
- Theme keys: `rail #2E6B4F`, `railText #EEF4EF`, `railActive #24573F`, `page #F5F7F0`, `surface #FFFFFF`, `line #DDE3D6`, `text #1D2A23`, `muted #55635A`, `accent #E39B3A`, `highlight #D9E46B`, `warnBg`, `warnText`, `successBg`, `success`, `danger` (keep current values unless the contrast test fails), `catMassage #2E6B4F`, `catFacial #D9E46B`, `catBody #7A5235`, `catNails #C2413B`, `catPackage #E39B3A`.
- Tailwind tokens: `--color-rail`, `--color-rail-ink`, `--color-rail-active`, `--color-page`, `--color-surface`, `--color-line`, `--color-ink`, `--color-muted`, `--color-accent`, `--color-highlight`, `--color-cat-massage` … `--color-cat-package`, plus the state colours. `fonts: { heading: 'Figtree', body: 'Figtree' }`.
- Check: `npm test` green; `grep -rE "plum|gold|lavender|font-heading" src` returns nothing after Task 2.3.

**Task 2.3 — shell and shared components**
- Files: `src/layout/AppShell.jsx`, `src/components/ui.js`, `src/components/StatCard.jsx`, `src/components/Brand.jsx`, `src/components/Avatar.jsx`, plus the class-name sweep across `src/pages/*.jsx` and `src/components/**` (old token names → role names only, no layout changes yet).
- Interfaces in `ui.js`: keep `linkClass`, `pillClass(on)`, `primaryButton`, `textButton`, `STATUS_PILL` names; add `CATEGORY_BAND: Record<category, string>` (Tailwind `bg-cat-*` classes, fallback `bg-muted`) and `categoryBand(category): string`.
- Test first: `src/components/ui.test.js`: `categoryBand('Massage')` is `'bg-cat-massage'`, `categoryBand('Unknown')` is `'bg-muted'`; `STATUS_PILL['no-show'][0]` is `'No-show'`.
- Check: `npm test` green; screenshot of the dashboard at 1440 and 390 px shows green rail and amber "New sale".

### Phase 3 — Dashboard, Appointments, Point of Sale

**Outcome:** the three key screens match the approved mockups (category bands, stamped no-shows, amber primary action, chart colours from tokens).
- [ ] Dashboard matches `assigned.html`.
- [ ] Appointments matches `appointments.html`.
- [ ] POS matches `pos.html`; checkout behaviour unchanged.
- **Acceptance:** existing page tests pass; side-by-side screenshots against the mockups.

### Phase 4 — Remaining screens

**Outcome:** Login, Clients (+ profile), Employees (+ profile), Services, Inventory, Sales report, Financial statement in the new look, desktop and phone.
- **Acceptance:** tests pass; screenshots at 1440 and 390 px; no horizontal scroll at 390.

### Phase 5 — Finish, document, ship

- [ ] impeccable finish review (fresh reviewer) and fixes.
- [ ] `DESIGN.md` via the impeccable documenter.
- [ ] README re-skin section lists the new theme keys.
- [ ] Merge, push `main` (Vercel deploys), check the live link, log in `DEPLOYMENTS.md` with `Card: #141`.

## 6. Dependencies, remaining uncertainties and next step

- Order: 1 → 2 → 3 → 4 → 5. Phase 3 and 4 pages are independent of each other once Phase 2 lands, so they can run in parallel worktrees.
- **Assumptions to watch:** green might read "clinic" on some screens; Phase 1 mockups are where we catch it. The calamansi highlight must never carry white text.
- **Watch out for:**
  1. A re-skin with a light `rail` colour makes `railText` unreadable → covered by the theme contrast test.
  2. A service with a category outside the five → `categoryBand` fallback test.
  3. No-show rows hidden by a filter on the dashboard → Dashboard test asserts the no-show row is listed.
  4. Long client names in the 390px appointment list overflow → phone screenshot check in Phase 3.
  5. Charts keeping old hex colours → grep for `#` in `src/components/charts` returns none.
- **Next step:** Phase 1 mockups.
