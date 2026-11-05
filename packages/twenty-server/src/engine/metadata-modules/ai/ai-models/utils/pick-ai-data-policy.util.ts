import { type AiDataPolicy } from 'twenty-shared/ai';

export const pickAiDataPolicy = ({
  aiDataResidency,
  isAiZeroDataRetentionRequired,
}: AiDataPolicy): AiDataPolicy => ({
  aiDataResidency,
  isAiZeroDataRetentionRequired,
});
