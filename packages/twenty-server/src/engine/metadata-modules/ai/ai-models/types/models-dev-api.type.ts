export type ModelsDevModel = {
  id: string;
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

export type ModelsDevProvider = {
  id: string;
  models: Record<string, ModelsDevModel>;
};

export type ModelsDevData = Record<string, ModelsDevProvider>;
