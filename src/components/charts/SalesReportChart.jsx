import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts'
import { formatPeso, kilo } from '../../lib/money.js'
import { PesoTooltip } from './SalesBarChart.jsx'

// the Dashboard chart's marks: other bars in a calm pandan tint, the current period in calamansi with a darker edge
export const PAST = 'color-mix(in srgb, var(--color-rail) 32%, var(--color-surface))'
const CURRENT = 'fill-highlight stroke-[color-mix(in_srgb,var(--color-highlight)_60%,var(--color-ink))]'
// a service's category colour (the CATEGORY_BAND tokens); no category (retail) keeps the neutral tint
export const categoryFill = (category) => (category ? `var(--color-cat-${category.toLowerCase()})` : PAST)
const tick = { fontSize: 12, fill: 'var(--color-muted)' }
const cursor = { fill: 'var(--color-soft)', fillOpacity: 0.6 }
const grid = <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-line)" />

// rows: [{ key, label, total, count, category? }]. Over time: vertical bars in row order, currentKey highlighted.
// Ranked: horizontal bars, top 12; by category colour when rows carry one.
// aria-hidden: the report's table right below holds every number the chart draws
export function SalesReportChart({ rows, ranked, unit, currentKey }) {
  if (ranked) {
    const top = rows.slice(0, 12)
    return (
      <div aria-hidden="true" className="mt-4" style={{ height: top.length * 40 + 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={top} margin={{ top: 4, right: 76, bottom: 4, left: 0 }} barCategoryGap="30%">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="label" width={128} tickLine={false} axisLine={false} tick={{ ...tick, fill: 'var(--color-ink)' }} />
            <Tooltip cursor={cursor} content={<PesoTooltip unit={unit} />} />
            <Bar dataKey="total" maxBarSize={24} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {top.map((r) => {
                const fill = categoryFill(r.category)
                // the darker edge holds the light category colours (Facial) against the surface
                return <Cell key={r.key} fill={fill} stroke={`color-mix(in srgb, ${fill} 60%, var(--color-ink))`} />
              })}
              <LabelList dataKey="total" position="right" formatter={formatPeso} fontSize={12} fontWeight={600} fill="var(--color-ink)" stroke="none" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }
  return (
    <div aria-hidden="true" className="mt-4 h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="18%">
          {grid}
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'var(--color-line)' }} tick={tick} minTickGap={16} />
          <YAxis tickFormatter={kilo} tickLine={false} axisLine={false} tick={{ ...tick, fontSize: 11 }} width={40} tickCount={4} />
          <Tooltip cursor={cursor} content={<PesoTooltip unit={unit} />} />
          <Bar dataKey="total" maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {rows.map((r) => (r.key === currentKey ? <Cell key={r.key} className={CURRENT} /> : <Cell key={r.key} fill={PAST} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
