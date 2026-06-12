import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreBrewSession } from './scoring';
import type { BrewCurvePoint, SessionPoint } from '@/types/brew';

const target: BrewCurvePoint[] = [
  { time: 0, weight: 0 },
  { time: 30, weight: 60 },
  { time: 60, weight: 120 },
  { time: 120, weight: 240 },
];

test('scores a close brew higher than a drifted brew', () => {
  const close: SessionPoint[] = target.map((point) => ({ ...point, targetWeight: point.weight, difference: 0 }));
  const drifted: SessionPoint[] = target.map((point) => ({
    time: point.time + 20,
    weight: point.weight * 0.78,
    targetWeight: point.weight,
    difference: point.weight * -0.22,
  }));

  assert.ok(scoreBrewSession(target, close).overall > scoreBrewSession(target, drifted).overall);
});
