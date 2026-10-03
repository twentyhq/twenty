import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type SendChatMessageAnswerOutcome } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/types/send-chat-message-answer-outcome.type';
import { type SendChatMessageAnswerResult } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/types/send-chat-message-answer-result.type';

const OUTCOME_BY_STATUS: ReadonlyMap<string, SendChatMessageAnswerOutcome> =
  new Map([
    ['approved', 'executed'],
    ['rejected', 'rejected'],
    ['failed', 'failed'],
    ['conflict', 'conflict'],
  ]);

export const buildSendChatMessageAnswerResult = ({
  threadId,
  toolResult,
}: {
  threadId: string;
  toolResult: Record<string, unknown>;
}): SendChatMessageAnswerResult => {
  const result = isPlainObject(toolResult.result) ? toolResult.result : {};
  const proposal = isPlainObject(result.proposal) ? result.proposal : {};
  const outcome = isString(result.status)
    ? OUTCOME_BY_STATUS.get(result.status)
    : undefined;

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
    // a conflict carries the record's latest values
    output: result.output ?? null,
    feedback: isString(result.feedback) ? result.feedback : null,
    error: isString(result.error) ? result.error : null,
  };
};
