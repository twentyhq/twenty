import { type WorkspaceCompanyEnrichment } from '@/workspace/types/WorkspaceCompanyEnrichment';

export type WorkspaceCompanyEnrichmentResult =
  | {
      outcome: 'matched';
      enrichment: WorkspaceCompanyEnrichment;
    }
  | {
      outcome: 'unavailable' | 'transientError';
      enrichment: null;
    };
