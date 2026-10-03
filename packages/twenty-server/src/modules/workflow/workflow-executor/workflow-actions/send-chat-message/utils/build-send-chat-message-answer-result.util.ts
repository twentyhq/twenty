import { isString } from '@sniptt/guards';
import {
  PROPOSE_TOOL_CALL_TOOL_STATUSES,
  type ProposeToolCallToolStatus,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type SendChatMessageAnswerResult } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/types/send-chat-message-answer-result.type';

// a conflict or a failure was still approved, but nothing ran, so steps that rely on the action check isExecuted
const APPROVED_STATUSES = new Set<ProposeToolCallToolStatus>([
  'running',
  'approved',
  'failed',
  'conflict',
]);

const isProposeToolCallToolStatus = (
  status: unknown,
): status is ProposeToolCallToolStatus =>
  PROPOSE_TOOL_CALL_TOOL_STATUSES.some(
    (proposeToolCallToolStatus) => proposeToolCallToolStatus === status,
  );

// flattens the answered call so later steps can branch on the decision and use the result
export const buildSendChatMessageAnswerResult = ({
  threadId,
  toolResult,
}: {
  threadId: string;
  toolResult: Record<string, unknown>;
}): SendChatMessageAnswerResult => {
  const result = isPlainObject(toolResult.result) ? toolResult.result : {};
  const proposal = isPlainObject(result.proposal) ? result.proposal : {};

  const status = isProposeToolCallToolStatus(result.status)
    ? result.status
    : null;
  const isApproved = isDefined(status) && APPROVED_STATUSES.has(status);

  return {
    threadId,
    isApproved,
    isExecuted: status === 'approved',
    // the member may approve an alternative, such as saving an email as a draft instead of sending it
    approvedToolName:
      isApproved && isString(proposal.toolName) ? proposal.toolName : null,
    status,
    arguments: isPlainObject(proposal.arguments) ? proposal.arguments : null,
    output: result.output ?? null,
    feedback: isString(result.feedback) ? result.feedback : null,
    error: isString(result.error) ? result.error : null,
  };
};
