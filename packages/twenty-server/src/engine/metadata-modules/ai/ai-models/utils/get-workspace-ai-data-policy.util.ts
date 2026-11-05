import { type AiDataPolicy } from 'twenty-shared/ai';

import { NO_AI_DATA_POLICY } from 'src/engine/metadata-modules/ai/ai-models/constants/no-ai-data-policy.constant';

// The column stays hidden until its slow upgrade command has run, so it can be missing at runtime
export const getWorkspaceAiDataPolicy = (workspace?: {
  aiDataPolicy?: AiDataPolicy;
}): AiDataPolicy => workspace?.aiDataPolicy ?? NO_AI_DATA_POLICY;
