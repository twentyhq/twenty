export type RunAgentMessageRole = 'user' | 'assistant';

export type RunAgentMessageAttachment = {
  fileId: string;
  filename?: string;
};

export type RunAgentMessage = {
  role: RunAgentMessageRole;
  content: string;
  attachments?: RunAgentMessageAttachment[];
};

export type RunAgentInput = {
  agentUniversalIdentifier: string;
  runAsWorkspaceMemberId?: string;
} & (
  | { prompt: string; messages?: never }
  | { messages: RunAgentMessage[]; prompt?: never }
);

export type RunAgentResult = {
  result: object | null;
  error: string | null;
  success: boolean;
};
