import type { BrewStep } from '@/types/brew';

export function RecipeStepList({ steps }: { steps: BrewStep[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-espresso text-sm font-bold text-white">{index + 1}</span>
          <div>
            <p className="font-semibold text-espresso">{step.label} · {step.time}s · {step.targetWeight}g</p>
            <p className="mt-1 text-sm leading-6 text-stone-500">{step.instruction}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
