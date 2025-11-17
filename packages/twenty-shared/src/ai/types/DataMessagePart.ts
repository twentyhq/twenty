export type DataMessagePart = {
  'routing-status': {
    text: string;
    state: string;
    debug?: {
      routingTimeMs?: number;
      contextBuildTimeMs?: number;
      agentExecutionStartTimeMs?: number;
      agentExecutionTimeMs?: number;
      toolGenerationTimeMs?: number;
      agentContextBuildTimeMs?: number;
      aiRequestPrepTimeMs?: number;
      selectedAgentId?: string;
      selectedAgentLabel?: string;
      availableAgents?: Array<{ id: string; label: string }>;
      routerModel?: string;
      agentModel?: string;
      context?: string;
      contextRecordCount?: number;
      contextSizeBytes?: number;
      toolCallCount?: number;
      toolCount?: number;
      // Routing AI call tokens
      routingPromptTokens?: number;
      routingCompletionTokens?: number;
      routingTotalTokens?: number;
      // Agent AI call tokens
      agentPromptTokens?: number;
      agentCompletionTokens?: number;
      agentTotalTokens?: number;
      // Cost in Twenty credits
      routingCostInCredits?: number;
      agentCostInCredits?: number;
      totalCostInCredits?: number;
    };
  };
};
