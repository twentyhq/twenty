import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

export type SendChatMessageAnswerResult = {
  threadId: string;
  isApproved: boolean;
  status: string | null;
  arguments: Record<string, unknown> | null;
  output: unknown;
  feedback: string | null;
  error: string | null;
};

// the member approved whenever the call was attempted, whatever its outcome, which status carries
const APPROVED_STATUSES = new Set(['approved', 'failed', 'conflict']);

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

  return {
    threadId,
    isApproved: isString(result.status) && APPROVED_STATUSES.has(result.status),
    status: isString(result.status) ? result.status : null,
    arguments: isPlainObject(proposal.arguments) ? proposal.arguments : null,
    output: result.output ?? null,
    feedback: isString(result.feedback) ? result.feedback : null,
    error: isString(result.error) ? result.error : null,
  };
};
