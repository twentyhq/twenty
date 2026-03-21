export type ModelsDevModel = {
  // Model id as returned by models.dev (may match the record key in `ModelsDevProvider.models`).
  id: string;
  // Human-readable model name from the catalog.
  name: string;
  family?: string;
  status?: 'deprecated' | 'beta';
  reasoning?: boolean;
  tool_call?: boolean;
  cost?: {
    input?: number;
    output?: number;
    cache_read?: number;
    cache_write?: number;
  };
  limit?: { context?: number; output?: number };
  modalities?: { input?: string[]; output?: string[] };
  knowledge?: string;
  release?: string;
  updated?: string;
};
