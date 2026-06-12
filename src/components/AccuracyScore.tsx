import type { BrewScore } from '@/types/brew';

export function AccuracyScore({ score }: { score: BrewScore }) {
  const rows = [
    ['Timing match', score.timingMatch],
    ['Weight match', score.weightMatch],
    ['Flow stability', score.flowStability],
  ] as const;

  return (
    <div className="card p-6">
      <p className="eyebrow">Brew result</p>
      <div className="mt-4 flex items-end gap-3">
        <span className="text-7xl font-bold tracking-tight text-espresso">{score.overall}</span>
        <span className="pb-3 text-xl font-semibold text-stone-400">/100</span>
      </div>
      <div className="mt-6 space-y-4">
        {rows.map(([label, value]) => (
          <div key={label}>
            <div className="mb-2 flex justify-between text-sm font-semibold text-stone-600"><span>{label}</span><span>{value}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-cream"><div className="h-full rounded-full bg-caramel" style={{ width: `${value}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
