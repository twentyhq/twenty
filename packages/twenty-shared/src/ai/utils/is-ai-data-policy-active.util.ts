import { isDefined } from '@/utils/validation/isDefined';

import { type AiDataPolicy } from '../types/AiDataPolicy';

export const isAiDataPolicyActive = (
  policy: Pick<AiDataPolicy, 'dataResidency' | 'isZeroDataRetentionRequired'>,
): boolean =>
  isDefined(policy.dataResidency) || policy.isZeroDataRetentionRequired;
