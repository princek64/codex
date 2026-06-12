import Link from 'next/link';
import type { Recipe } from '@/types/brew';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${recipe.slug}`} className="card block space-y-5 p-5 transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{recipe.champion.competition}</p>
          <h3 className="mt-2 text-2xl font-semibold text-espresso">{recipe.name}</h3>
          <p className="mt-1 text-sm text-stone-500">Inspired by {recipe.champion.name}</p>
        </div>
        <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-caramel">{recipe.targetTime}s</span>
      </div>
      <div className="rounded-3xl bg-cream/70 p-4">
        <p className="font-semibold text-stone-800">{recipe.bean.name}</p>
        <p className="text-sm text-stone-500">{recipe.bean.origin} · {recipe.bean.process} · {recipe.bean.roast}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Spec label="Dose" value={`${recipe.dose}g`} />
        <Spec label="Water" value={`${recipe.water}g`} />
        <Spec label="Temp" value={`${recipe.temperature}°C`} />
        <Spec label="Grind" value={recipe.grind} />
      </dl>
    </Link>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.18em] text-stone-400">{label}</dt>
      <dd className="mt-1 font-semibold text-stone-800">{value}</dd>
    </div>
  );
}
