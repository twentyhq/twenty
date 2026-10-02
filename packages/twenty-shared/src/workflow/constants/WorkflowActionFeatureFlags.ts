import { FeatureFlagKey } from '@/types';
import { WorkflowActionType } from '@/workflow/types/WorkflowActionType';

export const WORKFLOW_ACTION_FEATURE_FLAGS: Partial<
  Record<`${WorkflowActionType}`, FeatureFlagKey>
> = {
  [WorkflowActionType.SEND_CHAT_MESSAGE]:
    FeatureFlagKey.IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED,
};
