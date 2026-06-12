'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AccuracyScore } from '@/components/AccuracyScore';
import { BrewChart } from '@/components/BrewChart';
import { getRecipeBySlug } from '@/lib/mockData';
import { scoreBrewSession } from '@/lib/scoring';
import type { BrewScore, SessionPoint } from '@/types/brew';

export default function BrewResultPage() {
  const params = useParams<{ slug: string }>();
  const recipe = getRecipeBySlug(params.slug);
  const [notes, setNotes] = useState('');
  const [points, setPoints] = useState<SessionPoint[]>([]);
  const [score, setScore] = useState<BrewScore>({ overall: 0, timingMatch: 0, weightMatch: 0, flowStability: 0 });

  useEffect(() => {
    if (!recipe) return;
    const raw = window.localStorage.getItem(`champion-brew-result:${recipe.slug}`);
    if (raw) {
      const parsed = JSON.parse(raw) as { score: BrewScore; points: SessionPoint[] };
      setScore(parsed.score);
      setPoints(parsed.points);
      return;
    }
    setScore(scoreBrewSession(recipe.curve, []));
  }, [recipe]);

  if (!recipe) return <main className="card p-6">Recipe not found.</main>;

  return (
    <main className="grid gap-6 pb-12 lg:grid-cols-[360px_1fr]">
      <AccuracyScore score={score} />
      <section className="space-y-6">
        <div>
          <p className="eyebrow">Session complete</p>
          <h1 className="mt-2 text-4xl font-bold text-espresso">{recipe.name}</h1>
          <p className="mt-2 text-stone-600">Review your target match and capture tasting notes for the next iteration.</p>
        </div>
        <div className="card p-4"><BrewChart targetCurve={recipe.curve} userCurve={points} /></div>
        <label className="block card p-5">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-stone-400">Notes</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} placeholder="Aroma, sweetness, acidity, body, grind adjustment..." className="mt-3 w-full resize-none rounded-3xl border border-stone-200 bg-white p-4 text-stone-700 outline-none focus:border-caramel" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href={`/recipes/${recipe.slug}/live`} className="button-primary text-center">Brew again</Link>
          <Link href="/recipes" className="button-secondary text-center">Browse recipes</Link>
        </div>
      </section>
    </main>
  );
}
