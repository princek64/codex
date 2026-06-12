import type { ScaleProvider, ScaleStatus, WeightCallback } from './types';

abstract class PlaceholderScaleProvider implements ScaleProvider {
  protected status: ScaleStatus = 'idle';

  async connect() {
    this.status = 'connected';
  }

  async disconnect() {
    this.status = 'disconnected';
  }

  startTimer() {
    this.status = 'brewing';
  }

  stopTimer() {
    this.status = 'connected';
  }

  tare() {
    // Placeholder for future Bluetooth tare command.
  }

  subscribeToWeight(_callback: WeightCallback) {
    return () => undefined;
  }

  getStatus() {
    return this.status;
  }
}

export class AcaiaScaleProvider extends PlaceholderScaleProvider {}
export class FelicitaScaleProvider extends PlaceholderScaleProvider {}
export class TimemoreScaleProvider extends PlaceholderScaleProvider {}
