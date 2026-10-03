import { isString } from '@sniptt/guards';
import { type ProposeToolCallToolStatus } from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type SendChatMessageAnswerOutcome } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/types/send-chat-message-answer-outcome.type';
import { type SendChatMessageAnswerResult } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/types/send-chat-message-answer-result.type';

const OUTCOME_BY_STATUS: Partial<
  Record<ProposeToolCallToolStatus, SendChatMessageAnswerOutcome>
> = {
  approved: 'executed',
  rejected: 'rejected',
  failed: 'failed',
  conflict: 'conflict',
};

const findOutcome = (
  status: unknown,
): SendChatMessageAnswerOutcome | undefined =>
  Object.entries(OUTCOME_BY_STATUS).find(
    ([answeredStatus]) => answeredStatus === status,
  )?.[1];

export const buildSendChatMessageAnswerResult = ({
  threadId,
  toolResult,
}: {
  threadId: string;
  toolResult: Record<string, unknown>;
}): SendChatMessageAnswerResult => {
  const result = isPlainObject(toolResult.result) ? toolResult.result : {};
  const proposal = isPlainObject(result.proposal) ? result.proposal : {};
  const outcome = findOutcome(result.status);

  if (!isDefined(outcome) || !isString(proposal.toolName)) {
    throw new WorkflowStepExecutorException(
      'The answer to the action could not be read',
      WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
    );
  }

  return {
    threadId,
    outcome,
    // the member may approve an alternative, such as saving an email as a draft instead of sending it
    toolName: proposal.toolName,
    arguments: isPlainObject(proposal.arguments) ? proposal.arguments : {},
    output: outcome === 'executed' ? (result.output ?? null) : null,
    feedback: isString(result.feedback) ? result.feedback : null,
    error: isString(result.error) ? result.error : null,
  };
};
