export type RunAgentInput = {
  agentUniversalIdentifier: string;
  prompt: string;
};

export type RunAgentResult = {
  result: object;
  hasNoMoreAvailableCredits: boolean;
};
