import type { BrewCurvePoint, BrewScore, SessionPoint } from '@/types/brew';
import { clamp, interpolateTargetWeight } from './brewMath';

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pointFlow(points: BrewCurvePoint[], index: number) {
  if (index === 0) return 0;
  const current = points[index];
  const previous = points[index - 1];
  const elapsed = current.time - previous.time;
  if (elapsed <= 0) return 0;
  return (current.weight - previous.weight) / elapsed;
}

export function scoreBrewSession(targetCurve: BrewCurvePoint[], userCurve: SessionPoint[]): BrewScore {
  if (!targetCurve.length || !userCurve.length) {
    return { overall: 0, timingMatch: 0, weightMatch: 0, flowStability: 0 };
  }

  const targetFinal = targetCurve[targetCurve.length - 1];
  const userFinal = userCurve[userCurve.length - 1];
  const errors = userCurve.map((point) => Math.abs(point.weight - interpolateTargetWeight(targetCurve, point.time)));
  const meanError = average(errors);
  const weightMatch = clamp(Math.round(100 - meanError * 2.4), 0, 100);

  const timingDelta = Math.abs(targetFinal.time - userFinal.time);
  const timingMatch = clamp(Math.round(100 - timingDelta * 1.6), 0, 100);

  const flowDeltas = userCurve.slice(1).map((point, index) => {
    const targetFlow = pointFlow(targetCurve, Math.min(index + 1, targetCurve.length - 1));
    const userFlow = pointFlow(userCurve, index + 1);
    return Math.abs(userFlow - targetFlow);
  });
  const flowStability = clamp(Math.round(100 - average(flowDeltas) * 28), 0, 100);

  const finalWeightPenalty = Math.abs(targetFinal.weight - userFinal.weight) * 1.2;
  const overall = clamp(Math.round(weightMatch * 0.45 + timingMatch * 0.25 + flowStability * 0.3 - finalWeightPenalty), 0, 100);

  return { overall, timingMatch, weightMatch, flowStability };
}
