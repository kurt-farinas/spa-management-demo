import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts'
import { formatPeso, kilo } from '../../lib/money.js'

// past days in a calm pandan tint; today in calamansi with a darker edge so it holds against the tint
const PAST = 'fill-[color-mix(in_srgb,var(--color-rail)_32%,var(--color-surface))]'
const TODAY = 'fill-highlight stroke-[color-mix(in_srgb,var(--color-highlight)_60%,var(--color-ink))]'

// unit: [one, many], the word after the count
export function PesoTooltip({ active, payload, unit = ['sale', 'sales'] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-soft bg-surface px-3 py-2 text-xs shadow-[0_4px_12px_color-mix(in_srgb,var(--brand-rail)_12%,transparent)]">
      <div className="text-muted">{d.label}</div>
      <div className="mt-0.5 font-medium text-ink tabular-nums">
        {formatPeso(d.total)} · {d.count} {d.count === 1 ? unit[0] : unit[1]}
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
          <BarChart data={days} margin={{ top: 24, right: 8, bottom: 0, left: 0 }} barCategoryGap="18%">
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-line)" />
            <YAxis width={40} tickCount={4} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickFormatter={kilo} />
            <XAxis
              dataKey="label"
              interval={0}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-line)' }}
              tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
              tickFormatter={tick}
            />
            <Tooltip cursor={{ fill: 'var(--color-soft)', fillOpacity: 0.6 }} content={<PesoTooltip />} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {days.map((d, i) => (
                <Cell key={d.key} className={i === last ? TODAY : PAST} />
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
