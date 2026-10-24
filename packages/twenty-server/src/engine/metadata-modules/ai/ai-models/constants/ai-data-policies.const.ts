import {
  AI_DATA_RESIDENCY_POLICIES,
  type AiDataPolicy,
} from 'twenty-shared/ai';

export const AI_DATA_POLICIES: AiDataPolicy[] = [
  null,
  ...AI_DATA_RESIDENCY_POLICIES,
].flatMap((aiDataResidency) =>
  [false, true].map((isAiZeroDataRetentionRequired) => ({
    aiDataResidency,
    isAiZeroDataRetentionRequired,
  })),
);
