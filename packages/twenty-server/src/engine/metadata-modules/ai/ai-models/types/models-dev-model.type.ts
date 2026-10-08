import { type ModelsDevCost } from './models-dev-cost.type';

export type ModelsDevModel = {
  id: string;
  name: string;
  family?: string;
  status?: 'deprecated' | 'beta';
  reasoning?: boolean;
  tool_call?: boolean;
  cost?: ModelsDevCost & { context_over_200k?: ModelsDevCost };
  limit?: { context?: number; output?: number };
  modalities?: { input?: string[]; output?: string[] };
  knowledge?: string;
  release_date?: string;
  last_updated?: string;
};
