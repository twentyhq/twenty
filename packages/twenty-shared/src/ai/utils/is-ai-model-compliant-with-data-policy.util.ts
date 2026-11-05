import { isDefined } from '@/utils/validation/isDefined';

import { MODEL_RESIDENCIES_ALLOWED_BY_POLICY } from '../constants/model-residencies-allowed-by-policy.const';
import { type DataResidency } from '../constants/data-residency.const';
import { type AiDataPolicy } from '../types/AiDataPolicy';
import { isDataResidency } from './is-data-residency.util';

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
    aiDataPolicy.isZeroDataRetentionRequired &&
    model.zeroDataRetention !== true
  ) {
    return false;
  }

  if (!isDefined(aiDataPolicy.dataResidency)) {
    return true;
  }

  const allowedResidencies: readonly DataResidency[] =
    MODEL_RESIDENCIES_ALLOWED_BY_POLICY[aiDataPolicy.dataResidency];

  return (
    isDefined(model.dataResidency) &&
    isDataResidency(model.dataResidency) &&
    allowedResidencies.includes(model.dataResidency)
  );
};
