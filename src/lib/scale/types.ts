export type ScaleStatus = 'idle' | 'connecting' | 'connected' | 'brewing' | 'disconnected';
export type WeightCallback = (weight: number) => void;

export interface ScaleProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  startTimer(): void;
  stopTimer(): void;
  tare(): void;
  subscribeToWeight(callback: WeightCallback): () => void;
  getStatus(): ScaleStatus;
}
