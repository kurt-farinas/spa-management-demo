export function StatCard({ label, value, note, dark = false }) {
  const sub = dark ? 'text-rail-ink' : 'text-muted'
  return (
    <div className={`rounded-lg border px-3.5 py-3 md:px-5 md:py-4 ${dark ? 'border-rail bg-rail' : 'border-line bg-surface'}`}>
      <div className={`text-[13px] font-semibold ${sub}`}>{label}</div>
      <div className={`mt-0.5 text-2xl font-semibold tabular-nums md:mt-1 md:text-[28px] md:leading-9 ${dark ? 'text-rail-ink' : 'text-ink'}`}>{value}</div>
      {note && <div className={`mt-0.5 text-xs md:mt-1 md:text-[13px] ${sub}`}>{note}</div>}
    </div>
  )
}
