import { type WorkspacePersonEnrichment } from '@/workspace/types/WorkspacePersonEnrichment';

export type WorkspacePersonEnrichmentResult =
  | {
      outcome: 'matched';
      enrichment: WorkspacePersonEnrichment;
    }
  | {
      outcome: 'unavailable' | 'transientError';
      enrichment: null;
    };
