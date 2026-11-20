# Spa management demo

A clickable demo of a spa management system: dashboard, appointments, clients, employees, services, inventory, point of sale, sales report and financial statement. All data is made up and lives in the browser; a reload resets it.

Log in as **Owner** (sees everything) or **Receptionist** (no profit, cost, commission or financial statement). No password.

## Run it

```
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # static files in dist/
```

## Re-skin for a prospect (about 15 minutes)

1. Edit `src/config/spa.config.js`: `name`, `tagline`, `logoText`, `subtitle`, `staff` names, `theme` colours, `fonts` (any Google Fonts family) and the `services` menu with prices.
2. For link previews on chat apps and social sites, also update the static copies, because those sites don't run JavaScript:
   - `index.html`: `<title>`, `description` and `og:` tags
   - `public/favicon.svg`: the two colours
3. Run `npm test` and `npm run dev`, then check the login page and the dashboard.

Keep text readable: dark text on light colours needs at least 4.5:1 contrast.

## Stack

React 18, Vite 6, Tailwind 4, Recharts 2, React Router 7 (hash routes, so any static host works), Vitest.
