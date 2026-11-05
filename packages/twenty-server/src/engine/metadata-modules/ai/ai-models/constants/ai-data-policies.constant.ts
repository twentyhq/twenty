import {
  AI_DATA_RESIDENCY_POLICIES,
  type AiDataPolicy,
  type AiDataResidencyPolicy,
} from 'twenty-shared/ai';

import { NO_AI_DATA_POLICY } from 'src/engine/metadata-modules/ai/ai-models/constants/no-ai-data-policy.constant';

const DATA_RESIDENCIES: (AiDataResidencyPolicy | null)[] = [
  NO_AI_DATA_POLICY.dataResidency,
  ...AI_DATA_RESIDENCY_POLICIES,
];

export const AI_DATA_POLICIES: AiDataPolicy[] = DATA_RESIDENCIES.flatMap(
  (dataResidency) =>
    [
      NO_AI_DATA_POLICY.isZeroDataRetentionRequired,
      !NO_AI_DATA_POLICY.isZeroDataRetentionRequired,
    ].map((isZeroDataRetentionRequired) => ({
      ...NO_AI_DATA_POLICY,
      dataResidency,
      isZeroDataRetentionRequired,
    })),
);
