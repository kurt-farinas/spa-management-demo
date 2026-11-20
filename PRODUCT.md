# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary (now):** owners of mid-range Philippine day spas (mall or city spas, 5–15 staff, massage, facials, body and nails). They open a link Kurt sends them, on a laptop or phone, and decide whether this system is worth a meeting. They browse as "Owner" or "Receptionist".
- **Later (when it becomes the real system):** the spa's receptionist at the front desk all day, and the owner checking sales and the income statement.

## Product Purpose

A clickable demo of a spa management system (dashboard, appointments, clients, employees, services, inventory, point of sale, sales report, financial statement) filled with realistic fake data. It exists to win a meeting with a spa owner. Success: the owner reaches every page without a dead end, sees a sale flow into the report and stock, and believes this is a real, modern product built for a spa like theirs.

## Positioning

Built for one spa at a time: the name, logo text, colours, fonts and service menu change in one settings file (`src/config/spa.config.js`) in about 15 minutes, so each prospect sees their own spa, not a generic SaaS.

## Operating Context

- Shown in a sales conversation or opened alone from a chat link; often on a phone first.
- Prices in pesos (₱), English, Philippine names. Payment methods: Cash, Card, GCash.
- Two roles: Owner sees everything; Receptionist does not see profit, cost, commission or the financial statement.

## Capabilities and Constraints

- React 18 + Vite + Tailwind 4 + Recharts, static build, hash routes, hosted on Vercel from `main`.
- All data is fake, seeded, in memory; a reload resets it. Working forms: add client, book appointment, checkout. Other edit buttons show "Demo only".
- Theme colours and fonts come from `spa.config.js` through CSS variables; components must never hard-code brand colours, so the re-skin keeps working.
- Must grow into the real system later (pages move into Laravel + Inertia).

## Brand Commitments

- Demo spa: "Lumière Day Spa", tagline "Unhurried care, beautifully kept." (fictional, replaceable per prospect).
- Anti-goals confirmed 2026-11-20: must not feel cold or corporate, must not look like a generic admin template, must not be dark or heavy.

## Evidence on Hand

No real customers, testimonials or spa clients yet. Every number in the demo is synthetic and labelled as a demo ("sample data, resets on reload"). Do not invent client logos, reviews or claims.

## Product Principles

1. Every screen must look like it belongs to the prospect's own spa after a re-skin.
2. The front-desk tasks (book, check in, sell) are fast and obvious; reports are readable by a non-accountant owner.
3. Works on a phone as well as a laptop.
4. Nothing fake is presented as real.

## Accessibility & Inclusion

Text contrast at least 4.5:1 (also after a re-skin), touch targets at least 44px, keyboard focus visible.
