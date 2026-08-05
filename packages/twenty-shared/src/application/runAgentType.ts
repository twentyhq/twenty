export type RunAgentMessageRole = 'user' | 'assistant';

export type RunAgentMessage = {
  role: RunAgentMessageRole;
  content: string;
};

export type RunAgentInput = {
  agentUniversalIdentifier: string;
} & (
  | { prompt: string; messages?: never }
  | { messages: RunAgentMessage[]; prompt?: never }
);

export type RunAgentResult = {
  result: object | null;
  error: string | null;
  success: boolean;
};
