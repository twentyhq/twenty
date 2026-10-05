import { isNonEmptyString } from '@sniptt/guards';
import { type WorkflowValidationIssue } from 'twenty-shared/workflow';

import {
  type WorkflowAiAgentAction,
  type WorkflowSendChatMessageAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// A draft can pick sharing by key before typing the key, so it is caught before activation rather than on save
export const validateWorkflowConversationStep = (
  step: WorkflowAiAgentAction | WorkflowSendChatMessageAction,
): WorkflowValidationIssue[] => {
  const conversation = step.settings?.input?.conversation;

  if (
    conversation?.scope !== 'KEY' ||
    isNonEmptyString(conversation.key?.trim())
  ) {
    return [];
  }

  return [
    {
      severity: 'error',
      code: 'CONVERSATION_MISSING_KEY',
      message: `Step "${step.name ?? step.id}" shares its conversation by key but has no key.`,
      stepId: step.id,
    },
  ];
};
