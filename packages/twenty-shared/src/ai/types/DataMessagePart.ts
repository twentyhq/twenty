export type CodeExecutionFile = {
  filename: string;
  url: string;
  mimeType: string;
};

export type CodeExecutionState = 'pending' | 'running' | 'completed' | 'error';

export type CodeExecutionData = {
  executionId: string;
  state: CodeExecutionState;
  code: string;
  language: 'python';
  stdout: string;
  stderr: string;
  exitCode?: number;
  executionTimeMs?: number;
  files: CodeExecutionFile[];
  error?: string;
};

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
      fastModel?: string;
      smartModel?: string;
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
      // Plan execution
      planReasoning?: string;
      totalSteps?: number;
      steps?: Array<{
        stepNumber: number;
        agent: string;
        task: string;
      }>;
    };
  };
  'code-execution': CodeExecutionData;
};
