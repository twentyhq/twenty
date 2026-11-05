import { type AiDataResidencyPolicy } from '../constants/ai-data-residency-policy.const';

export type AiDataPolicy = {
  aiDataResidency: AiDataResidencyPolicy | null;
  isAiZeroDataRetentionRequired: boolean;
};
