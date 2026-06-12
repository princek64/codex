import Link from 'next/link';
import { RecipeCard } from '@/components/RecipeCard';
import { recipes } from '@/lib/mockData';

export default function Home() {
  const featured = recipes.slice(0, 2);
  return (
    <main className="space-y-8 pb-12">
      <section className="card overflow-hidden p-6 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="eyebrow">Premium live brew companion</p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-espresso sm:text-7xl">Recreate champion-style coffee at home.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">Choose a beautiful bean, follow a fictional champion-style recipe, and run a live brew session with timer, simulated scale data, and instant curve guidance.</p>
            <p className="mt-4 rounded-2xl bg-cream p-4 text-sm font-semibold leading-6 text-stone-600">Recipe data is fictional placeholder content for this MVP. Real champion recipes should only be added when sourced or licensed.</p>
            <div className="mt-8 grid gap-3 sm:flex">
              <Link href="/recipes/aurora-pulse/live" className="button-primary text-center">Start brewing</Link>
              <Link href="/recipes" className="button-secondary text-center">Browse recipes</Link>
            </div>
          </div>
          <div className="rounded-[2.5rem] bg-espresso p-6 text-cream shadow-2xl">
            <p className="eyebrow text-cream/70">Today&apos;s profile</p>
            <div className="mt-10 space-y-6">
              <Metric label="Target" value="300g" />
              <Metric label="Brew time" value="3:00" />
              <Metric label="Guidance" value="On target" />
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">Featured</p>
            <h2 className="mt-2 text-3xl font-bold text-espresso">Champion-style recipes</h2>
          </div>
          <Link href="/recipes" className="hidden font-bold text-caramel sm:block">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">{featured.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cream/50">{label}</p>
      <p className="mt-1 text-4xl font-bold">{value}</p>
    </div>
  );
}
