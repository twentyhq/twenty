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
    isApproved: result.status === 'approved',
    status: typeof result.status === 'string' ? result.status : null,
    arguments: isPlainObject(proposal.arguments) ? proposal.arguments : null,
    output: result.output ?? null,
    feedback: typeof result.feedback === 'string' ? result.feedback : null,
    error: typeof result.error === 'string' ? result.error : null,
  };
};
