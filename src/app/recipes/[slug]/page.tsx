import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BrewChart } from '@/components/BrewChart';
import { RecipeStepList } from '@/components/RecipeStepList';
import { getRecipeBySlug, recipes } from '@/lib/mockData';

export function generateStaticParams() {
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) notFound();

  return (
    <main className="space-y-6 pb-12">
      <section className="card p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="eyebrow">{recipe.champion.competition}</p>
            <h1 className="mt-3 text-5xl font-bold tracking-tight text-espresso">{recipe.name}</h1>
            <p className="mt-3 text-lg text-stone-600">{recipe.overview}</p>
            <p className="mt-4 rounded-2xl bg-cream p-4 text-sm font-semibold leading-6 text-stone-600">{recipe.champion.disclaimer}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Spec label="Bean" value={recipe.bean.name} />
              <Spec label="Dose" value={`${recipe.dose}g`} />
              <Spec label="Water" value={`${recipe.water}g`} />
              <Spec label="Temp" value={`${recipe.temperature}°C`} />
              <Spec label="Time" value={`${recipe.targetTime}s`} />
            </div>
          </div>
          <div className="rounded-[2rem] bg-espresso p-6 text-cream">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cream/60">Champion-style profile</p>
            <p className="mt-3 text-3xl font-bold">{recipe.champion.name}</p>
            <p className="mt-2 text-cream/70">{recipe.bean.origin} · {recipe.bean.process} · {recipe.bean.roast}</p>
            <Link href={`/recipes/${recipe.slug}/live`} className="button-primary mt-8 block bg-cream text-center text-espresso shadow-none">Start live brew</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="card p-6">
          <p className="eyebrow">Brewing steps</p>
          <div className="mt-5"><RecipeStepList steps={recipe.steps} /></div>
        </div>
        <div className="card p-6">
          <p className="eyebrow">Target curve preview</p>
          <h2 className="mt-2 text-2xl font-bold text-espresso">Target vs time</h2>
          <div className="mt-5"><BrewChart targetCurve={recipe.curve} /></div>
          <div className="mt-5">
            <p className="mb-2 text-sm font-bold text-stone-600">Equipment</p>
            <div className="flex flex-wrap gap-2">{recipe.equipment.map((item) => <span key={item} className="rounded-full bg-cream px-3 py-2 text-sm font-semibold text-stone-600">{item}</span>)}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-espresso">{value}</p>
    </div>
  );
}
