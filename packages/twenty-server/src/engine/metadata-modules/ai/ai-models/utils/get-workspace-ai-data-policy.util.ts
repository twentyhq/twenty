import { type AiDataPolicy } from 'twenty-shared/ai';

import { NO_AI_DATA_POLICY } from 'src/engine/metadata-modules/ai/ai-models/constants/no-ai-data-policy.constant';

export const getWorkspaceAiDataPolicy = (workspace?: {
  aiDataPolicy?: AiDataPolicy;
}): AiDataPolicy => workspace?.aiDataPolicy ?? NO_AI_DATA_POLICY;
