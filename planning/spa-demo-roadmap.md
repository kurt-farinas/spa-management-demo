# Spa system showcase demo — roadmap

Kanban card: #139 (Side Hustle → General)

## 1. Status, goal and success criteria

**Status:** Phase 0 done. The design comp was approved 2026-11-20: https://claude.ai/artifact/AcE6TcSYSJtZtdnRiWaLC1 (Dashboard, Clients, Point of Sale, phone). Phase 1 is in progress.

**Goal:** a clickable, good-looking demo of a spa management system that you can send to spa owners as a link. They browse employees, clients, appointments, services, inventory, a checkout, a sales report and a financial statement, all filled with realistic fake data. It is built so it can later become the real system (React pages move into Laravel + Inertia, like PIS).

**Success looks like:**
- A spa owner opens the link on a laptop or phone, picks "Owner", and can reach all nine pages without a dead end.
- Ringing up a sale at the checkout makes it appear in the sales report and lowers stock in inventory, without a reload.
- Picking "Receptionist" hides the financial statement and the profit numbers, even when the URL is typed in directly.
- Changing one settings file (`src/config/spa.config.js`) re-skins it for a prospect: name, logo text, colours and service menu. That takes about 15 minutes.
- A reload puts the demo back to the same clean data.

**Anti-goals:** a real backend, real logins or real payments. A look that feels like a generic admin template.

## 2. Scope

**Included:** Login (role picker), Dashboard, Employees (list and profile), Clients (list, profile, add), Appointments (calendar and booking), Services (menu), Inventory (products and stock), Point of Sale (checkout), Sales report, Financial statement. Responsive layout. A free hosted link.

**Excluded:** database, server, passwords, saving between reloads, a Therapist role, editing employees/services/products (their buttons open the form and saving shows "Demo only"), printing/exporting PDFs, SMS/email reminders, online booking for spa customers.

## 3. Decisions and rationale

| # | Decision | Basis | Why |
|---|---|---|---|
| Q1 | Demo with fake data, shaped so it can grow into the real system | User-confirmed | No spa client yet. Win the meeting fast, but don't throw the work away. |
| Q2 | React + Tailwind 4 + Vite, static build, no Laravel yet | User-confirmed | Same React/Tailwind as PIS, so the pages carry over. Free hosting. Considered: full Laravel now (needs hosting, slower), plain HTML (doesn't carry over). |
| Q3 | Pages: Dashboard, Employees, Clients, Appointments, Services, Inventory, POS, Sales report, Financial statement | User-confirmed | |
| Q4 | Forms save in memory; a checkout updates sales and stock; reload resets | User-confirmed | |
| Q4a | Working forms: add client, book appointment, checkout. Other add/edit buttons show "Demo only" | Assumption | Keeps the effort to the forms that prove the system works. |
| Q5 | Made-up spa "Lumière Day Spa"; name, logo text, colours and services in one settings file | User-confirmed | |
| Q6 | Fake login with an Owner / Receptionist picker; the receptionist doesn't see the financial statement or profit | User-confirmed | |
| Q7 | Style B: luxe plum and gold (deep plum sidebar, gold accents, serif headings, warm off-white page) | User-confirmed | |
| Q8 | Design skills: impeccable (screens), ui-ux-pro-max (palette and fonts), dataviz (charts), Claude Design (comp first) | User-confirmed | |
| Q8a | "Claude Design" means a design comp of the key screens, made as a Design artifact on claude.ai and approved before code | Assumption | |
| A1 | Currency is pesos (₱), English, Philippine names | Assumption | |
| A2 | Financial statement = monthly income statement (revenue, cost of products sold, expenses, net income). No balance sheet | Assumption | This is what a spa owner reads. A balance sheet needs assets and loans that a demo can't fake convincingly. |
| A3 | HashRouter (`/#/clients`) so any static host works without rewrite rules | Delegated | |
| A4 | Hosting on Vercel's free tier from a GitHub repo | Delegated | You already have the Vercel connector. Hostinger also works. |
| A5 | Fake data: 8 employees, 60 clients, 12 services, 15 products, 6 months of appointments, sales and expenses, all generated from a fixed seed | Delegated | The same data every load, so the demo is repeatable. |

## 4. Implementation plan

**User flow:** open link → Login screen ("Enter as Owner" / "Enter as Receptionist") → Dashboard → left menu to each page. Role switch is in the top bar. The checkout flow: pick client → add services/products → pick therapist → payment method (Cash / Card / GCash) → "Complete sale" → receipt panel → the sale now shows in Sales report and stock drops in Inventory.

**Technical approach:**
- `src/config/spa.config.js`: brand and services. Its theme colours are written to CSS variables at startup (`src/config/applyTheme.js`), and Tailwind reads those variables, so a re-skin never touches components.
- `src/data/seed.js`: a deterministic fake-data builder (small seeded random number generator, no extra dependency).
- `src/data/store.js`: one pure reducer `demoReducer(state, action)` holding every change (add client, book, checkout). `src/data/DemoStore.jsx` wraps it in React context. When this becomes Laravel, the reducer actions map to controller endpoints.
- `src/data/selectors.js`: pure functions for the reports (sales summary, income statement, dashboard numbers). Tested directly.
- `src/auth/roles.js` + `src/auth/RoleProvider.jsx`: the current role in memory, plus `canSee(role, pageKey)`. Both the menu and the route guard use `canSee`.
- Charts: Recharts, picked by the dataviz skill's rules (bar for sales by period, horizontal bar for by service and by therapist, simple table for the income statement).
- Tests: Vitest for the data, selectors and role rules. A manual browse checklist for the screens.

**Edge cases decided:** empty cart → "Complete sale" shows "Add at least one item" and does nothing. Quantity above stock → "Only N left". A therapist already booked at that time → "Ana is booked 10:00–11:00", booking blocked. A month with no sales → the chart shows "No sales this month" instead of empty axes. Receptionist on a hidden URL → redirect to Dashboard with a "Owner only" toast.

## 5. Phase-by-phase roadmap

### Phase 0 — Design comp (Claude Design)
**Outcome:** you approve how the Dashboard, Clients list and POS checkout look in plum and gold before any code.
- [ ] Use ui-ux-pro-max to pick the exact palette (plum, gold, page, text, success/danger) and a font pair (serif headings, sans body)
- [ ] Make a Design artifact with 3 screens: Dashboard, Clients list, POS checkout, desktop plus one phone view
- [ ] You review it; changes go into the comp, not into code

**Acceptance:** you say "approved". The palette hex values and font names are copied into Phase 1's `spa.config.js` task.
**Decision gate:** no Phase 1 UI work until this is approved (the data/store tasks 1.2–1.4 can start in parallel).

### Phase 1 — Foundation: app shell, fake data, store, login, dashboard
**Outcome:** `npm run dev` opens a login screen. Owner and Receptionist both land on a working dashboard with real-looking numbers, and the menu hides what the receptionist can't see. The data tests pass.

**Task 1.1 — Scaffold**
- Files: create `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`, `.gitignore`. Then `git init` with the `main` branch.
- Dependencies: `react@18`, `react-dom@18`, `react-router-dom@7` (the same majors as PIS), `tailwindcss@4` + `@tailwindcss/vite`, `recharts`, `react-icons`; dev: `vite@6`, `@vitejs/plugin-react`, `vitest`.
- Scripts: `dev`, `build`, `test` (`vitest run`).
- Check: `npm run build` prints `built in` with no errors.

**Task 1.2 — Settings file and theme**
- Files: `src/config/spa.config.js`, `src/config/applyTheme.js`, `src/index.css` (`@theme` uses `var(--brand-*)`).
- Interfaces:
  - `spaConfig = { name: string, tagline: string, logoText: string, currency: 'PHP', theme: { primary, primaryDark, accent, page, surface, text, muted }, fonts: { heading, body }, services: Array<{ id: string, name: string, category: 'Massage'|'Facial'|'Body'|'Nails'|'Package', durationMin: number, price: number, commissionRate: number }> }`, with 12 services
  - `applyTheme(theme): void` sets `--brand-primary` and the rest on `document.documentElement`
- Test first (`src/config/applyTheme.test.js`, jsdom): `applyTheme({ primary: '#26215C', ... })` → `getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim() === '#26215C'`.

**Task 1.3 — Fake data**
- Files: `src/data/random.js` (`createRandom(seed: number) → () => number` in [0,1)), `src/data/seed.js`.
- Interface: `buildSeed(seed = 42, today = new Date('2026-11-20')) → { employees, clients, services, products, appointments, sales, expenses }`
  - employee `{ id, name, role: 'Therapist'|'Receptionist'|'Manager', phone, hiredOn, schedule: string[], commissionRate }`
  - client `{ id, name, phone, email, birthday, joinedOn, notes, tags: string[] }`
  - product `{ id, name, category, price, cost, stock, reorderAt }`
  - appointment `{ id, clientId, employeeId, serviceId, start: ISO string, durationMin, status: 'booked'|'done'|'cancelled'|'no-show' }`
  - sale `{ id, date: ISO, clientId, employeeId, lines: Array<{ type: 'service'|'product', id, name, qty, unitPrice }>, total, payment: 'cash'|'card'|'gcash' }`
  - expense `{ id, date: ISO, category: 'Rent'|'Salaries'|'Utilities'|'Supplies'|'Marketing', amount }`
- Test first (`src/data/seed.test.js`):
  - `buildSeed is deterministic`: `JSON.stringify(buildSeed(42)) === JSON.stringify(buildSeed(42))`
  - `buildSeed sizes`: employees 8, clients 60, services 12, products 15
  - `every done appointment has a sale`: each appointment with status `done` has a sale with the same clientId, employeeId and date
  - `sales cover six months`: the earliest sale date ≥ `2026-05-20`, the latest ≤ `2026-11-20`

**Task 1.4 — Store and selectors**
- Files: `src/data/store.js`, `src/data/DemoStore.jsx`, `src/data/selectors.js`.
- Interfaces:
  - `demoReducer(state, action) → state`. Actions: `{ type: 'addClient', client }`, `{ type: 'bookAppointment', appointment }`, `{ type: 'checkout', sale }`
  - `validateCheckout(state, { lines }) → null | string` (an error message)
  - `validateBooking(state, { employeeId, start, durationMin }) → null | string`
  - `DemoStoreProvider`, `useDemoStore() → { state, addClient(input) → client, bookAppointment(input) → { ok: true, appointment } | { ok: false, error }, checkout(input) → { ok: true, sale } | { ok: false, error } }`
  - `dashboardStats(state, today) → { salesToday, bookingsToday, newClientsThisMonth, topServices: Array<{ name, count }> }`
  - `salesSummary(sales, { from, to, groupBy: 'day'|'month'|'service'|'employee' }) → Array<{ key, label, total, count }>`
  - `incomeStatement(state, 'YYYY-MM') → { serviceRevenue, productRevenue, totalRevenue, costOfProducts, expenses: Array<{ category, amount }>, totalExpenses, netIncome }`
- Test first (`src/data/store.test.js`, with a small hand-made fixture state):
  - `checkout adds a sale and lowers stock`: product `p1` stock 10 price 350. Checkout of 2 × `p1` → sales length +1, `p1.stock === 8`, `sale.total === 700`
  - `checkout rejects empty cart`: `validateCheckout(state, { lines: [] }) === 'Add at least one item'`
  - `checkout rejects qty above stock`: 11 × `p1` → `'Only 10 left'`
  - `booking rejects overlap`: employee `e1` booked 10:00 for 60 min; a booking at 10:30 → message contains `'is booked'`; a booking at 11:00 → `null`
  - `incomeStatement totals`: fixture with 3000 service revenue, 500 product revenue, product cost 200, expenses 1000 → `netIncome === 2300`
  - `salesSummary by service`: two sales of the "Swedish Massage" line at 800 → one row with `total 1600`, `count 2`

**Task 1.5 — Roles, login and layout**
- Files: `src/auth/roles.js`, `src/auth/RoleProvider.jsx`, `src/pages/Login.jsx`, `src/layout/AppShell.jsx` (sidebar, top bar, role switch), `src/app/routes.jsx`, `src/components/RequireRole.jsx`.
- Interfaces:
  - `PAGES = [{ key, label, path, icon }]` for 9 pages
  - `canSee(role: 'owner'|'receptionist', pageKey: string) → boolean`
  - `useRole() → { role: 'owner'|'receptionist'|null, login(role), logout() }`
  - Profit is hidden through `canSee(role, 'profit')`, which is false for the receptionist
- Test first (`src/auth/roles.test.js`): `canSee('receptionist','financial-statement') === false`; `canSee('owner','financial-statement') === true`; `canSee('receptionist','pos') === true`; `canSee('receptionist','profit') === false`.

**Task 1.6 — Dashboard**
- Files: `src/pages/Dashboard.jsx`, `src/components/StatCard.jsx`, `src/components/charts/SalesBarChart.jsx`. Uses `dashboardStats`, `salesSummary(groupBy 'day', last 14 days)`, and today's appointments.
- The owner also sees "Profit this month" (from `incomeStatement`); the receptionist doesn't.
- Check: manual. Log in as Owner → 4 stat cards. As Receptionist → 3 cards and no Financial statement in the menu. Typing `/#/financial-statement` as receptionist goes to the dashboard.

**Phase 1 acceptance:** `npm test` shows all the tests above passing (0 failed), `npm run build` succeeds, and the manual check in 1.6 passes. A reviewer agent checks the diff against this plan.

### Phase 2 — People and services
**Outcome:** Employees, Clients and Services pages are browsable. Add client works.
- [ ] Employees list (search, role filter), employee profile (schedule, this month's appointments, commission earned)
- [ ] Clients list (search, tag filter), client profile (contact, visit history, total spent, notes)
- [ ] Add client form (name and phone required) → appears at the top of the list
- [ ] Services menu from `spaConfig.services`, grouped by category
- [ ] "Demo only" message on edit/add buttons for employees and services

**Acceptance:** add a client, open their profile, and they show 0 visits. Searching "ana" finds Ana. A receptionist sees no commission amounts. *(Assumption: commission counts as staff pay, hidden like profit.)*

### Phase 3 — Bookings, checkout and stock
**Outcome:** a booking and a sale can be made end to end.
- [ ] Appointments: week view per therapist, plus a day list on phone. "Book" form with the overlap check from `validateBooking`
- [ ] Point of Sale: cart, therapist picker, payment method, receipt panel, using `checkout`
- [ ] Inventory: products table with a stock badge (low when `stock <= reorderAt`), "Demo only" on edits

**Acceptance:** sell 2 massage oils → Inventory shows the stock down by 2, Sales report today goes up by the total, and the Dashboard's "Today's sales" goes up too. Booking an overlapping slot shows the error.

### Phase 4 — Reports (dataviz)
**Outcome:** the Sales report and Financial statement look like something an accountant would trust.
- [ ] Sales report: date range picker, group by day/month/service/therapist, chart plus table, totals row
- [ ] Financial statement (owner only): month picker, income statement layout, a small revenue vs expenses chart over 6 months
- [ ] Empty month shows "No sales this month"

**Acceptance:** the income statement's net income for the current month matches `incomeStatement` (spot-check one month by hand against the table rows).

### Phase 5 — Polish, re-skin test, publish
- [ ] impeccable audit pass: spacing, empty states, mobile (375 px wide), keyboard focus, contrast
- [ ] Re-skin test: change `spa.config.js` to a second brand and confirm nothing else needs editing
- [ ] Push to GitHub, deploy on Vercel, open the link on a phone
- [ ] Add `DEPLOYMENTS.md` with the first entry (Card: #139)

**Acceptance:** the public link works on desktop and phone. The re-skin test changed only `spa.config.js`.

## 6. Dependencies, remaining uncertainties and next step

- **Order:** Phase 0 → 1 → 2 → 3 → 4 → 5. Within Phase 1, tasks 1.3–1.4 (data) don't touch UI files and can run alongside the Phase 0 design review. Phases 2–4 all share `AppShell.jsx` and `routes.jsx`, so they run one after another, not in parallel.
- **Open assumptions to confirm whenever you like:** Q4a (which forms work), A1 (pesos), A2 (income statement only), and commission hidden from the receptionist.
- **Not verified:** whether you have a GitHub account linked for Vercel deploys. That's needed only in Phase 5.

**Next step:** Phase 0. Pick the palette and fonts with ui-ux-pro-max, then make the 3-screen Design comp for your approval.

## Builder answers (from the plan read-through, all Assumption unless noted)
1. **Theme (picked in Phase 0 with ui-ux-pro-max, final once you approve the comp):** primary `#26215C` (plum), primaryDark `#1A1640`, accent `#BA7517` (gold, for fills and chart bars only), accentText `#854F0B` (gold text, passes 4.5:1 on white), goldOnPlum `#FAC775`, page `#FBF8F3`, surface `#FFFFFF`, text `#26215C`, muted `#5F5A73`, tint `#EEEDFE`, success `#3B6D11`, danger `#A32D2D`. Fonts: Playfair Display (headings) and Inter (body), loaded with a Google Fonts `<link>` in `index.html`. The database suggested pink and lavender; we kept your plum and gold choice and took only its font pair.
2. **Dates:** local time, stored as `'YYYY-MM-DDTHH:mm'` strings with no zone. The app passes the real `new Date()` to `buildSeed`, so the data is always "the last 6 months" and never looks stale. Tests pass the fixed `2026-11-20`. Both range ends are inclusive.
3. **State shape** = what `buildSeed` returns. `state.services` is a copy of `spaConfig.services` (buildSeed reads the config). The role is not in the store.
4. **Store inputs:** `checkout({ clientId, employeeId, lines: [{ type, id, qty }], payment })`. The store method looks up names and prices, computes `total`, and makes `id` (`S-<n>`, n = sales.length + 1) and `date` (now). Then it dispatches the finished sale; the reducer trusts it. In the same way, `addClient` makes `C-<n>` and `bookAppointment` makes `A-<n>`.
5. **costOfProducts** = Σ qty × `products[].cost`, looked up by line id. In the test fixture `p1` has cost 100 and 2 are sold, so 200. Commissions are inside the seeded Salaries expense, not counted separately.
6. **salesSummary:** `from`/`to` are `'YYYY-MM-DD'`, inclusive. key/label:
   - day: `'2026-11-20'` / `'Nov 20'`
   - month: `'2026-11'` / `'Nov 2026'`
   - service: service id / service name
   - employee: employee id / employee name

   `service` grouping counts service lines only (count = qty). `day`/`month`/`employee` use the sale total (count = number of sales).
7. **Booking fixture** employees have names (e1 = "Ana"). `cancelled` and `no-show` appointments don't block a slot. Message: `` `${name} is booked ${HH:mm}–${HH:mm}` ``.
8. **PAGES keys:** dashboard, employees, clients, appointments, services, inventory, pos, sales-report, financial-statement. Each path is `/<key>`, except dashboard, which is `/`.
   - `profit` is a pseudo-key, not a page. `/login` is a route, not in PAGES.
   - `canSee` returns false for an unknown key.
   - Commission hiding uses the `commission` pseudo-key (false for the receptionist), added in Phase 2.
9. **Tests:** add `jsdom` as a dev dependency. Tests that touch the DOM use `// @vitest-environment jsdom`.
10. **Repo:** the project is `C:\xampp\htdocs\side-hustle\spa-demo`. `.gitignore` = `node_modules`, `dist`. Commit after each task. Versions: `recharts@^2.15`, `react-icons@^5`, `react-hot-toast@^2` (same as PIS, used for toasts), and the latest `@vitejs/plugin-react` that supports Vite 6.
11. **Dashboard:**
    - Add `todaysAppointments(state, today) → Array<{ id, time: 'HH:mm', clientName, employeeName, serviceName, status }>`, sorted by time.
    - Owner cards: Sales today, Bookings today, New clients this month, Profit this month. The receptionist gets the first three.
    - `topServices` = top 5, shown as a short ranked list.
12. **Role:** not kept across reloads (a reload goes back to Login). The top-bar switch changes role in place. A hidden URL redirects to `/` with the toast "Owner only". Pages 2–9 in Phase 1 are one `ComingSoon.jsx` stub ("Coming in Phase N"), so the menu never dead-ends.

## Watch out for
1. Empty cart on "Complete sale". Covered by `checkout rejects empty cart` (task 1.4).
2. A therapist double-booked. Covered by `booking rejects overlap` (task 1.4).
3. A receptionist typing a hidden URL. Covered by the `canSee` tests (1.5) and the manual check in 1.6.
4. A month with no sales leaving an empty chart. Phase 4 empty-state check.
5. Floating-point peso totals (₱700.0000001). All money is whole pesos (integers) in the seed and the store; the `incomeStatement totals` test uses exact equality.
