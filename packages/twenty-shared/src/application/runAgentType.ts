export type RunAgentInput = {
  agentUniversalIdentifier: string;
  prompt: string;
  runAsWorkspaceMemberId?: string;
};

export type RunAgentResult = {
  result: object | null;
  error: string | null;
  success: boolean;
};
