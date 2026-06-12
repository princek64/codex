import type { Guidance } from '@/types/brew';

const styles: Record<Guidance, string> = {
  'Pour faster': 'border-amber-200 bg-amber-50 text-amber-800',
  'Slow down': 'border-rose-200 bg-rose-50 text-rose-800',
  'On target': 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

export function GuidanceMessage({ guidance, difference }: { guidance: Guidance; difference: number }) {
  return (
    <div className={`rounded-[2rem] border p-5 ${styles[guidance]}`} aria-live="polite">
      <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">Live guidance</p>
      <p className="mt-2 text-3xl font-bold">{guidance}</p>
      <p className="mt-1 text-sm font-semibold">{difference >= 0 ? '+' : ''}{difference.toFixed(1)}g vs target</p>
    </div>
  );
}
