import { type RunAgentMessageAttachment } from './runAgentMessageAttachmentType';

export type RunAgentMessageRole = 'user' | 'assistant';

export type RunAgentMessage = {
  role: RunAgentMessageRole;
  content: string;
  attachments?: RunAgentMessageAttachment[];
};

export type RunAgentThread = {
  key: string;
  title?: string;
};

export type RunAgentInput = {
  agentUniversalIdentifier: string;
  additionalInstructions?: string;
  thread?: RunAgentThread;
  runAsWorkspaceMemberId?: string;
} & (
  | {
      input: string | RunAgentMessage[];
      prompt?: never;
      messages?: never;
    }
  | {
      /** @deprecated Use `input` instead. */
      prompt: string;
      input?: never;
      messages?: never;
    }
  | {
      /** @deprecated Use `input` instead. */
      messages: RunAgentMessage[];
      input?: never;
      prompt?: never;
    }
);

export type RunAgentResult = {
  result: object | null;
  error: string | null;
  success: boolean;
  threadId: string | null;
};
