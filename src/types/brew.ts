export type Origin = 'Ethiopia' | 'Colombia' | 'Panama' | 'Kenya';
export type Process = 'Washed' | 'Natural' | 'Honey';
export type Roast = 'Light' | 'Medium';

export interface Bean {
  id: string;
  name: string;
  origin: Origin;
  region: string;
  process: Process;
  roast: Roast;
  tastingNotes: string[];
}

export interface Champion {
  id: string;
  name: string;
  competition: string;
  disclaimer: string;
}

export interface BrewCurvePoint {
  time: number;
  weight: number;
}

export interface BrewStep {
  id: string;
  time: number;
  label: string;
  instruction: string;
  targetWeight: number;
}

export interface Recipe {
  id: string;
  slug: string;
  champion: Champion;
  bean: Bean;
  name: string;
  dose: number;
  water: number;
  temperature: number;
  grind: string;
  targetTime: number;
  equipment: string[];
  steps: BrewStep[];
  curve: BrewCurvePoint[];
  overview: string;
}

export interface SessionPoint extends BrewCurvePoint {
  targetWeight: number;
  difference: number;
}

export interface BrewScore {
  overall: number;
  timingMatch: number;
  weightMatch: number;
  flowStability: number;
}

export type Guidance = 'Pour faster' | 'Slow down' | 'On target';
