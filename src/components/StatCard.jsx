export function StatCard({ label, value, note, dark = false }) {
  return (
    <div className={`rounded-xl p-3.5 md:rounded-2xl md:px-5 md:py-[18px] ${dark ? 'bg-rail' : 'border border-soft bg-surface'}`}>
      <div className={`text-xs md:text-[13px] ${dark ? 'text-line' : 'text-muted'}`}>{label}</div>
      <div className={`mt-1 font-heading text-[22px] tabular-nums md:mt-1.5 md:text-[30px] ${dark ? 'text-rail-ink' : 'text-ink'}`}>{value}</div>
      {note && <div className={`mt-1 hidden text-xs md:block ${dark ? 'text-line' : 'text-muted'}`}>{note}</div>}
    </div>
  )
}
