import type { BrewCurvePoint } from '@/types/brew';
import { interpolateTargetWeight } from '../brewMath';
import type { ScaleProvider, ScaleStatus, WeightCallback } from './types';

export class MockScaleProvider implements ScaleProvider {
  private status: ScaleStatus = 'idle';
  private callbacks = new Set<WeightCallback>();
  private intervalId: ReturnType<typeof setInterval> | undefined;
  private startedAt = 0;
  private tareOffset = 0;

  constructor(private readonly targetCurve: BrewCurvePoint[]) {}

  async connect() {
    this.status = 'connecting';
    await new Promise((resolve) => setTimeout(resolve, 250));
    this.status = 'connected';
  }

  async disconnect() {
    this.stopTimer();
    this.callbacks.clear();
    this.status = 'disconnected';
  }

  startTimer() {
    this.startedAt = Date.now();
    this.status = 'brewing';
    this.intervalId = setInterval(() => this.emitWeight(), 1000);
    this.emitWeight();
  }

  stopTimer() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = undefined;
    if (this.status === 'brewing') this.status = 'connected';
  }

  tare() {
    this.tareOffset = this.currentSimulatedWeight();
    this.emitWeight();
  }

  subscribeToWeight(callback: WeightCallback) {
    this.callbacks.add(callback);
    callback(Math.max(0, this.currentSimulatedWeight() - this.tareOffset));
    return () => this.callbacks.delete(callback);
  }

  getStatus() {
    return this.status;
  }

  private emitWeight() {
    const weight = Math.max(0, this.currentSimulatedWeight() - this.tareOffset);
    this.callbacks.forEach((callback) => callback(weight));
  }

  private currentSimulatedWeight() {
    if (!this.startedAt) return 0;
    const seconds = (Date.now() - this.startedAt) / 1000;
    const target = interpolateTargetWeight(this.targetCurve, seconds);
    // Deterministic wave + slight ramp drift keeps the curve realistic and repeatable.
    const wave = Math.sin(seconds / 7) * 6 + Math.sin(seconds / 17) * 4;
    const drift = seconds > 70 ? 8 : -4;
    return Math.max(0, target + wave + drift);
  }
}
