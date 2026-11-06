import { isDefined } from '@/utils/validation/isDefined';

import { DATA_RESIDENCIES_BY_REGION } from '../constants/data-residencies-by-region.const';
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
  aiDataPolicy: Pick<
    AiDataPolicy,
    'requiredDataResidencyRegion' | 'isZeroDataRetentionRequired'
  >;
}): boolean => {
  if (
    aiDataPolicy.isZeroDataRetentionRequired &&
    model.zeroDataRetention !== true
  ) {
    return false;
  }

  if (!isDefined(aiDataPolicy.requiredDataResidencyRegion)) {
    return true;
  }

  const allowedDataResidencies: readonly DataResidency[] =
    DATA_RESIDENCIES_BY_REGION[aiDataPolicy.requiredDataResidencyRegion];

  return (
    isDefined(model.dataResidency) &&
    isDataResidency(model.dataResidency) &&
    allowedDataResidencies.includes(model.dataResidency)
  );
};
