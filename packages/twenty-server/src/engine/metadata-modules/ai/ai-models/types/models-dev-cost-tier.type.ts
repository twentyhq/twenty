import { type ModelsDevCost } from './models-dev-cost.type';

export type ModelsDevCostTier = ModelsDevCost & {
  tier: { type: string; size: number };
};
