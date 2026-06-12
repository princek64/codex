import type { BrewCurvePoint, Guidance, SessionPoint } from '@/types/brew';

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function interpolateTargetWeight(curve: BrewCurvePoint[], seconds: number) {
  if (!curve.length) return 0;
  if (seconds <= curve[0].time) return curve[0].weight;

  for (let index = 1; index < curve.length; index += 1) {
    const previous = curve[index - 1];
    const current = curve[index];
    if (seconds <= current.time) {
      const span = current.time - previous.time || 1;
      const progress = (seconds - previous.time) / span;
      return previous.weight + (current.weight - previous.weight) * progress;
    }
  }

  return curve[curve.length - 1].weight;
}

export function guidanceForDifference(difference: number): Guidance {
  if (difference < -10) return 'Pour faster';
  if (difference > 10) return 'Slow down';
  return 'On target';
}

export function flowRate(points: SessionPoint[]) {
  if (points.length < 2) return 0;
  const latest = points[points.length - 1];
  const previous = points[Math.max(0, points.length - 4)];
  const elapsed = latest.time - previous.time;
  if (elapsed <= 0) return 0;
  return ((latest.weight - previous.weight) / elapsed) * 60;
}
