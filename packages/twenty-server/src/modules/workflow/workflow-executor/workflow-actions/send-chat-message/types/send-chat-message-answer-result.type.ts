export type SendChatMessageAnswerResult = {
  threadId: string;
  isApproved: boolean;
  approvedToolName: string | null;
  status: string | null;
  arguments: Record<string, unknown> | null;
  output: unknown;
  feedback: string | null;
  error: string | null;
};
