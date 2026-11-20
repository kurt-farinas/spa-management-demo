import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, LabelList } from 'recharts'
import { formatPeso } from '../../lib/money.js'

function PesoTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-tint bg-surface px-3 py-2 text-xs shadow-[0_4px_12px_color-mix(in_srgb,var(--brand-primary)_12%,transparent)]">
      <div className="text-muted">{d.label}</div>
      <div className="mt-0.5 font-medium text-ink tabular-nums">
        {formatPeso(d.total)} · {d.count} {d.count === 1 ? 'sale' : 'sales'}
      </div>
    </div>
  )
}

// days: [{ key, label, total, count }], oldest first; the last one is today
export function SalesBarChart({ days }) {
  const last = days.length - 1
  const tick = (label, i) => (i === last ? 'Today' : i === 0 || i === Math.floor(last / 2) ? label : '')
  const todayLabel = ({ x, y, width, index }) =>
    index === last && (
      <text x={x + width} y={y - 8} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--color-ink)">
        {formatPeso(days[last].total)}
      </text>
    )
  return (
    <>
      <div aria-hidden="true" className="mt-4 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={days} margin={{ top: 24, right: 16, bottom: 0, left: 16 }} barCategoryGap="18%">
            <XAxis
              dataKey="label"
              interval={0}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-tint)' }}
              tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
              tickFormatter={tick}
            />
            <Tooltip cursor={{ fill: 'var(--color-tint)', fillOpacity: 0.6 }} content={<PesoTooltip />} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {days.map((d, i) => (
                <Cell key={d.key} className={i === last ? 'fill-gold' : 'fill-lavender'} />
              ))}
              <LabelList dataKey="total" content={todayLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Sales per day, last {days.length} days</caption>
        <tbody>
          {days.map((d) => (
            <tr key={d.key}>
              <th scope="row">{d.label}</th>
              <td>{formatPeso(d.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
