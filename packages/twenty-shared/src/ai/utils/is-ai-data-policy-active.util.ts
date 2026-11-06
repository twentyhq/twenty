import { isDefined } from '@/utils/validation/isDefined';

import { type AiDataPolicy } from '../types/AiDataPolicy';

export const isAiDataPolicyActive = (
  policy: Pick<
    AiDataPolicy,
    'requiredDataResidencyRegion' | 'isZeroDataRetentionRequired'
  >,
): boolean =>
  isDefined(policy.requiredDataResidencyRegion) ||
  policy.isZeroDataRetentionRequired;
