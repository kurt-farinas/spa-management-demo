import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts'
import { formatPeso } from '../../lib/money.js'
import { PesoTooltip } from './SalesBarChart.jsx'

// one series, one hue: the Dashboard chart's bar colour (3.6:1 on surface)
const BAR = 'fill-[color-mix(in_srgb,var(--color-plum-light)_60%,var(--color-surface))]'
const tick = { fontSize: 12, fill: 'var(--color-muted)' }
const cursor = { fill: 'var(--color-tint)', fillOpacity: 0.6 }

// rows: [{ key, label, total, count }]. Over time: vertical bars in row order. Ranked: horizontal bars, top 12.
// aria-hidden: the report's table right below holds every number the chart draws
export function SalesReportChart({ rows, ranked, unit }) {
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
              {top.map((r) => (
                <Cell key={r.key} className={BAR} />
              ))}
              <LabelList dataKey="total" position="right" formatter={formatPeso} fontSize={12} fill="var(--color-ink)" />
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
          <CartesianGrid vertical={false} stroke="var(--color-tint)" />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'var(--color-tint)' }} tick={tick} minTickGap={16} />
          <YAxis tickFormatter={formatPeso} tickLine={false} axisLine={false} tick={tick} width={80} />
          <Tooltip cursor={cursor} content={<PesoTooltip unit={unit} />} />
          <Bar dataKey="total" maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {rows.map((r) => (
              <Cell key={r.key} className={BAR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
