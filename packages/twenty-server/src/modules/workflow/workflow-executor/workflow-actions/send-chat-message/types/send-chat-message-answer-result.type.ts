import { type SendChatMessageAnswerOutcome } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/types/send-chat-message-answer-outcome.type';

export type SendChatMessageAnswerResult = {
  threadId: string;
  outcome: SendChatMessageAnswerOutcome;
  toolName: string;
  arguments: Record<string, unknown>;
  output: unknown;
  feedback: string | null;
  error: string | null;
};
