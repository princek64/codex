import Link from 'next/link';

export function BrewControls({ onEnd, recipeSlug }: { onEnd: () => void; recipeSlug: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link href={`/recipes/${recipeSlug}`} className="button-secondary text-center">Recipe</Link>
      <button type="button" onClick={onEnd} className="button-primary">End brew</button>
    </div>
  );
}
