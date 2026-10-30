import { type RequestFormField, type SetuAiErrorCode } from 'twenty-shared/ai';

import { type SetuAiResearchCrmContext } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-research-crm-context.type';
import { type SetuAiTaskStepCheckpoint } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-step-checkpoint.type';
import { type SetuAiTaskUsage } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-usage.type';

export type SetuAiResearchModelOutput = {
  summary: string;
  sections: { heading: string; body: string; evidenceIds: string[] }[];
  unknowns: string[];
  suggestedNextSteps: string[];
};

export type SetuAiResearchRunInput = {
  modelId: string;
  companyName: string;
  focus: string | null;
  answers: NonNullable<SetuAiTaskStepCheckpoint['answers']>;
  loadCrmContext: () => Promise<SetuAiResearchCrmContext>;
  isWebSearchEnabled: boolean;
  tokenBudget: number;
  signal: AbortSignal;
};

// Only sources the run actually retrieved may be cited: CRM items it read
// and URLs the search provider returned.
export type SetuAiResearchRunResult = {
  usage: SetuAiTaskUsage;
  retrievedCrmSources: SetuAiResearchCrmContext | null;
  citedUrls: { url: string; title: string | null }[];
} & (
  | { outcome: 'brief'; output: SetuAiResearchModelOutput }
  | { outcome: 'clarification'; prompt: string; fields: RequestFormField[] }
  | { outcome: 'failed'; errorCode: SetuAiErrorCode; isRetryable: boolean }
);
