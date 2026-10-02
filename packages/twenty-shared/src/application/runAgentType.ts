import { type RunAgentMessageAttachment } from './runAgentMessageAttachmentType';

export type RunAgentMessageRole = 'user' | 'assistant';

export type RunAgentMessage = {
  role: RunAgentMessageRole;
  content: string;
  attachments?: RunAgentMessageAttachment[];
};

export type RunAgentInput = {
  agentUniversalIdentifier: string;
  runAsWorkspaceMemberId?: string;
  threadKey?: string;
  threadTitle?: string;
  context?: string;
} & (
  | { prompt: string; messages?: never }
  | { messages: RunAgentMessage[]; prompt?: never }
);

export type RunAgentResult = {
  result: object | null;
  error: string | null;
  success: boolean;
  threadId: string | null;
};
