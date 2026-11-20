# Deployments

Live: https://spa-management-demo.vercel.app (Vercel, team "kurt's things", project spa-management-demo, deploys on every push to `main`).

## 2026-11-20 19:01 — 74f1e67 — Pandan & Calamansi redesign of all screens
- By: Claude, requested by Kurt
- Card: #141
- Code: 3a009d0 → 74f1e67 (fast-forward of redesign/pandan into main)
- Migrations: none
- Backup: none (static site, no database)
- Data changes: none (all data is fake and lives in the browser)
- Verified: live site serves the new bundle (assets/index-afa3INHG.js); logged in as Owner at 1440x900 and 390x844, all 9 pages (dashboard, appointments, clients, employees, services, inventory, point of sale, sales report, financial statement) load with their headings, the new rail colour #2E6B4F, page width equal to the window (no sideways scroll), and 0 page errors. Login page shows "Lumière Day Spa".

## 2026-11-20 16:46 — c5c3922 — First public deploy of the spa demo
- By: Claude, requested by Kurt
- Card: #139
- Code: none → c5c3922
- Migrations: none
- Backup: none (static site, no database)
- Data changes: none (all data is fake and lives in the browser)
- Verified: https://spa-management-demo.vercel.app returns 200 with title "Lumière Day Spa"; logged in as Owner and all 9 pages (dashboard, appointments, clients, employees, services, inventory, point of sale, sales report, financial statement) load with their headings. Phone width not re-checked live (Chrome window would not resize); checked locally at 375px before deploy.
