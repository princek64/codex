export function WeightDisplay({ weight, flowRate }: { weight: number; flowRate: number }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-stone-200/50">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Scale</p>
      <p className="mt-2 font-mono text-6xl font-bold tracking-tight text-espresso">{weight.toFixed(1)}g</p>
      <p className="mt-2 text-sm font-semibold text-caramel">{flowRate.toFixed(1)} g/min flow</p>
    </div>
  );
}
