'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrewChart } from '@/components/BrewChart';
import { BrewControls } from '@/components/BrewControls';
import { GuidanceMessage } from '@/components/GuidanceMessage';
import { LiveTimer } from '@/components/LiveTimer';
import { RecipeStepList } from '@/components/RecipeStepList';
import { WeightDisplay } from '@/components/WeightDisplay';
import { flowRate, guidanceForDifference, interpolateTargetWeight } from '@/lib/brewMath';
import { getRecipeBySlug } from '@/lib/mockData';
import { MockScaleProvider } from '@/lib/scale';
import { scoreBrewSession } from '@/lib/scoring';
import type { SessionPoint } from '@/types/brew';

export default function LiveBrewPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const recipe = getRecipeBySlug(params.slug);
  const providerRef = useRef<MockScaleProvider | null>(null);
  const startedAtRef = useRef<number>(0);
  const [seconds, setSeconds] = useState(0);
  const [weight, setWeight] = useState(0);
  const [points, setPoints] = useState<SessionPoint[]>([]);

  useEffect(() => {
    if (!recipe) return undefined;
    const provider = new MockScaleProvider(recipe.curve);
    providerRef.current = provider;
    let unsubscribe = () => undefined;
    let timerId: ReturnType<typeof setInterval> | undefined;

    provider.connect().then(() => {
      startedAtRef.current = Date.now();
      provider.startTimer();
      unsubscribe = provider.subscribeToWeight((nextWeight) => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        const targetWeight = interpolateTargetWeight(recipe.curve, elapsed);
        const point = { time: elapsed, weight: nextWeight, targetWeight, difference: nextWeight - targetWeight };
        setSeconds(elapsed);
        setWeight(nextWeight);
        setPoints((current) => [...current.filter((item) => item.time !== elapsed), point].slice(-240));
      });
      timerId = setInterval(() => setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000)), 500);
    });

    return () => {
      unsubscribe();
      if (timerId) clearInterval(timerId);
      provider.disconnect();
    };
  }, [recipe]);

  const latest = points[points.length - 1];
  const difference = latest?.difference ?? 0;
  const guidance = guidanceForDifference(difference);
  const liveFlowRate = useMemo(() => flowRate(points), [points]);

  if (!recipe) return <main className="card p-6">Recipe not found.</main>;

  function endBrew() {
    if (!recipe) return;
    providerRef.current?.stopTimer();
    const score = scoreBrewSession(recipe.curve, points);
    window.localStorage.setItem(`champion-brew-result:${recipe.slug}`, JSON.stringify({ score, points, endedAt: new Date().toISOString() }));
    router.push(`/recipes/${recipe.slug}/result`);
  }

  return (
    <main className="grid gap-6 pb-12 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <div>
          <p className="eyebrow">Live brew</p>
          <h1 className="mt-2 text-4xl font-bold text-espresso">{recipe.name}</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <LiveTimer seconds={seconds} />
          <WeightDisplay weight={weight} flowRate={liveFlowRate} />
        </div>
        <GuidanceMessage guidance={guidance} difference={difference} />
        <div className="card p-4"><BrewChart targetCurve={recipe.curve} userCurve={points} /></div>
        <BrewControls recipeSlug={recipe.slug} onEnd={endBrew} />
      </section>
      <aside className="card p-5">
        <p className="eyebrow">Next pours</p>
        <h2 className="mt-2 text-2xl font-bold text-espresso">Recipe steps</h2>
        <div className="mt-4"><RecipeStepList steps={recipe.steps} /></div>
      </aside>
    </main>
  );
}
