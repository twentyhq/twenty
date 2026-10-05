import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  type WorkflowConversation,
  type WorkflowConversationScope,
} from 'twenty-shared/workflow';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

// The thread key picks the conversation with the recipient. A custom key is
// prefixed so it never names the conversation of a run whose id it happens to equal.
export const resolveConversationThreadKey = ({
  conversation,
  defaultScope,
  workflowRunId,
  stepExecutionKey,
}: {
  conversation: WorkflowConversation | undefined;
  defaultScope: WorkflowConversationScope;
  workflowRunId: string;
  stepExecutionKey: string;
}): string => {
  const scope = conversation?.scope ?? defaultScope;

  switch (scope) {
    case 'RUN':
      return workflowRunId;
    case 'STEP':
      return `${workflowRunId}:${stepExecutionKey}`;
    case 'KEY': {
      const key = isDefined(conversation?.key)
        ? String(conversation.key).trim()
        : '';

      if (!isNonEmptyString(key)) {
        throw new WorkflowStepExecutorException(
          'A conversation key is required to share a conversation by key',
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
      }

      return `key:${key}`;
    }
  }
};
