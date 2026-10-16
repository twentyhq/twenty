import { isDefined } from '@/utils/validation/isDefined';

import { DATA_RESIDENCIES_BY_AI_DATA_RESIDENCY_POLICY } from '../constants/data-residencies-by-ai-data-residency-policy.const';
import { type AiDataPolicy } from '../types/AiDataPolicy';

// undefined residency or retention means the route never asserted it, so it never satisfies a policy
export const isAiModelCompliantWithDataPolicy = (
  model: {
    dataResidency?: string | null;
    zeroDataRetention?: boolean | null;
  },
  policy: AiDataPolicy,
): boolean => {
  if (
    policy.isAiZeroDataRetentionRequired &&
    model.zeroDataRetention !== true
  ) {
    return false;
  }

  if (!isDefined(policy.aiDataResidency)) {
    return true;
  }

  return (
    isDefined(model.dataResidency) &&
    (
      DATA_RESIDENCIES_BY_AI_DATA_RESIDENCY_POLICY[
        policy.aiDataResidency
      ] as string[]
    ).includes(model.dataResidency)
  );
};
