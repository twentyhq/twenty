import { isDefined } from '@/utils/validation/isDefined';

import { DATA_RESIDENCIES_BY_AI_DATA_RESIDENCY_POLICY } from '../constants/data-residencies-by-ai-data-residency-policy.const';
import { type AiDataPolicy } from '../types/AiDataPolicy';
import { isDataResidency } from './is-data-residency.util';

// undefined residency or retention means the route never asserted it, so it never satisfies a policy
export const isAiModelCompliantWithDataPolicy = ({
  model,
  aiDataPolicy,
}: {
  model: {
    dataResidency?: string | null;
    zeroDataRetention?: boolean | null;
  };
  aiDataPolicy: AiDataPolicy;
}): boolean => {
  if (
    aiDataPolicy.isAiZeroDataRetentionRequired &&
    model.zeroDataRetention !== true
  ) {
    return false;
  }

  if (!isDefined(aiDataPolicy.aiDataResidency)) {
    return true;
  }

  return (
    isDefined(model.dataResidency) &&
    isDataResidency(model.dataResidency) &&
    DATA_RESIDENCIES_BY_AI_DATA_RESIDENCY_POLICY[
      aiDataPolicy.aiDataResidency
    ].includes(model.dataResidency)
  );
};
