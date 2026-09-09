export type ModelsDevCost = {
  input?: number;
  output?: number;
  cache_read?: number;
  cache_write?: number;
};

export type ModelsDevModel = {
  // Model id as returned by models.dev (may match the record key in `ModelsDevProvider.models`).
  id: string;
  name: string;
  family?: string;
  status?: 'deprecated' | 'beta';
  reasoning?: boolean;
  tool_call?: boolean;
  // Providers that price long context separately nest a second set of rates
  // under `context_over_200k`, in the same shape.
  cost?: ModelsDevCost & { context_over_200k?: ModelsDevCost };
  limit?: { context?: number; output?: number };
  modalities?: { input?: string[]; output?: string[] };
  knowledge?: string;
  release_date?: string;
  last_updated?: string;
};
