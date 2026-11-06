import { isDefined } from '@/utils/validation/isDefined';

import { type AiDataPolicy } from '../types/AiDataPolicy';

export const isAiDataPolicyActive = (
  policy: Pick<
    AiDataPolicy,
    'requiredDataResidency' | 'isZeroDataRetentionRequired'
  >,
): boolean =>
  isDefined(policy.requiredDataResidency) || policy.isZeroDataRetentionRequired;
