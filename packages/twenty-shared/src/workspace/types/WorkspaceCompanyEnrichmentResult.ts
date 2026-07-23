import { type WorkspaceCompanyEnrichment } from '@/workspace/types/WorkspaceCompanyEnrichment';

export type WorkspaceCompanyEnrichmentResult = {
  outcome: 'matched' | 'unavailable' | 'transientError';
  enrichment: WorkspaceCompanyEnrichment | null;
};
