# Deployments

Live: https://spa-management-demo.vercel.app (Vercel, team "kurt's things", project spa-management-demo, deploys on every push to `main`).

## 2026-11-20 16:46 — c5c3922 — First public deploy of the spa demo
- By: Claude, requested by Kurt
- Card: #139
- Code: none → c5c3922
- Migrations: none
- Backup: none (static site, no database)
- Data changes: none (all data is fake and lives in the browser)
- Verified: https://spa-management-demo.vercel.app returns 200 with title "Lumière Day Spa"; logged in as Owner and all 9 pages (dashboard, appointments, clients, employees, services, inventory, point of sale, sales report, financial statement) load with their headings. Phone width not re-checked live (Chrome window would not resize); checked locally at 375px before deploy.
