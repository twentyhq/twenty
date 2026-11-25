import { type AiDataPolicy } from '../types/AiDataPolicy';
import { isAiDataPolicyActive } from './is-ai-data-policy-active.util';

export const isAiContentRecordingAllowed = (
  aiDataPolicy: AiDataPolicy,
): boolean =>
  !isAiDataPolicyActive(aiDataPolicy) &&
  aiDataPolicy.isProductImprovementDataSharingEnabled;
