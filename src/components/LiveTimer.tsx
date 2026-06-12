export function LiveTimer({ seconds }: { seconds: number }) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
  return (
    <div className="rounded-[2rem] bg-espresso p-6 text-cream shadow-xl">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cream/60">Timer</p>
      <p className="mt-2 font-mono text-6xl font-bold tracking-tight">{minutes}:{remaining}</p>
    </div>
  );
}
