'use client';

import { useMemo, useState } from 'react';
import { BeanFilter, type BeanFilters } from '@/components/BeanFilter';
import { RecipeCard } from '@/components/RecipeCard';
import { recipes } from '@/lib/mockData';

const initialFilters: BeanFilters = { origin: 'All', process: 'All', roast: 'All' };

export function RecipeBrowser() {
  const [filters, setFilters] = useState(initialFilters);
  const filteredRecipes = useMemo(() => recipes.filter((recipe) => (
    (filters.origin === 'All' || recipe.bean.origin === filters.origin)
    && (filters.process === 'All' || recipe.bean.process === filters.process)
    && (filters.roast === 'All' || recipe.bean.roast === filters.roast)
  )), [filters]);

  return (
    <main className="grid gap-6 pb-12 lg:grid-cols-[360px_1fr]">
      <BeanFilter filters={filters} onChange={setFilters} />
      <section>
        <p className="eyebrow">Recipe list</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-espresso">Browse champion-style brews</h1>
        <p className="mt-3 max-w-2xl text-stone-600">Filter by origin, process, and roast to find the right fictional placeholder recipe for your beans.</p>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
      </section>
    </main>
  );
}
