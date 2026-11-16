import {
  DATA_RESIDENCY_REGIONS,
  type AiDataPolicy,
  type DataResidencyRegion,
} from 'twenty-shared/ai';

import { NO_AI_DATA_POLICY } from 'src/engine/metadata-modules/ai/ai-models/constants/no-ai-data-policy.constant';

const REQUIRED_DATA_RESIDENCIES: (DataResidencyRegion | null)[] = [
  NO_AI_DATA_POLICY.requiredDataResidencyRegion,
  ...DATA_RESIDENCY_REGIONS,
];

export const AI_DATA_POLICIES: AiDataPolicy[] =
  REQUIRED_DATA_RESIDENCIES.flatMap((requiredDataResidencyRegion) =>
    [
      NO_AI_DATA_POLICY.isZeroDataRetentionRequired,
      !NO_AI_DATA_POLICY.isZeroDataRetentionRequired,
    ].map((isZeroDataRetentionRequired) => ({
      ...NO_AI_DATA_POLICY,
      requiredDataResidencyRegion,
      isZeroDataRetentionRequired,
    })),
  );
