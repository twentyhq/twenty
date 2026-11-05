import {
  type AiDataPolicy,
  type AiDataResidencyPolicy,
  MODEL_RESIDENCIES_ALLOWED_BY_POLICY,
} from 'twenty-shared/ai';

import { NO_AI_DATA_POLICY } from 'src/engine/metadata-modules/ai/ai-models/constants/no-ai-data-policy.constant';

const DATA_RESIDENCIES: (AiDataResidencyPolicy | null)[] = [
  NO_AI_DATA_POLICY.dataResidency,
  ...(Object.keys(
    MODEL_RESIDENCIES_ALLOWED_BY_POLICY,
  ) as AiDataResidencyPolicy[]),
];

export const AI_DATA_POLICIES: AiDataPolicy[] = DATA_RESIDENCIES.flatMap(
  (dataResidency) =>
    [
      NO_AI_DATA_POLICY.isZeroDataRetentionRequired,
      !NO_AI_DATA_POLICY.isZeroDataRetentionRequired,
    ].map((isZeroDataRetentionRequired) => ({
      dataResidency,
      isZeroDataRetentionRequired,
    })),
);
