import { isDefined } from '@/utils/validation/isDefined';

import { type AiDataPolicy } from '../types/AiDataPolicy';

export const isAiDataPolicyActive = (policy: AiDataPolicy): boolean =>
  isDefined(policy.aiDataResidency) || policy.isAiZeroDataRetentionRequired;
