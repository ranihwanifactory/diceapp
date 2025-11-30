export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface RollResult {
  dice1: DiceValue;
  dice2: DiceValue;
  total: number;
  timestamp: number;
  commentary?: string;
}

export interface ShakeOptions {
  threshold?: number;
  timeout?: number;
}
