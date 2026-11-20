---
version: 1
slug: "src-pages-dashboard-jsx"
primary_target: "src/pages/Dashboard.jsx"
related_targets: ["src/layout/AppShell.jsx"]
---

Scope: whole spa demo app (all 10 screens), Operate mode. Audience: mid-range Philippine day spa owners evaluating the demo; later front-desk staff. Constraint: theme stays in src/config/spa.config.js (re-skin per prospect).

## Direction contract

THESIS: The front desk feels like a fresh local botanical label (pandan, calamansi, coconut), not a purple-on-grey admin template or a cream-and-serif "luxury" page.
OWN-WORLD: Pandan-green side rail #2E6B4F with pale text; coconut-white ground #F5F7F0 (never beige); white surfaces separated by 1px #DDE3D6 hairlines, little shadow; ink #1D2A23; calamansi #D9E46B as highlight fill only; amber #E39B3A primary action. One family, Figtree, tabular numbers. Service-category label colours: Massage pandan, Facial calamansi, Body coffee #7A5235, Nails gumamela #C2413B, Package amber.
STORY: Owner sees today at a glance (sales, bookings, who is in, profit), trusts the numbers, and believes this was made for a spa like theirs.
FIRST VIEWPORT: Left green rail with nav; greeting + date + amber "New sale" top right; four KPI tiles in a row; today's appointments table (left, wider) with category bands and statuses; 14-day sales bars right with today in calamansi; top services and running-low below.
FORM: Pandan & Calamansi, candidate 3 of 7 (botanical local packaging). seed:96ac7f64c6b1d127. Raises: cancelled/no-show stay visible and stamped (ticket wallet); colour only does a job (lexicon); one family + hairlines (design annual).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
