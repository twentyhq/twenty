import { type ProposeToolCallToolStatus } from 'twenty-shared/ai';

export type SendChatMessageAnswerResult = {
  threadId: string;
  isApproved: boolean;
  isExecuted: boolean;
  approvedToolName: string | null;
  status: ProposeToolCallToolStatus | null;
  arguments: Record<string, unknown> | null;
  output: unknown;
  feedback: string | null;
  error: string | null;
};
