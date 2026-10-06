import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';

// what recording a turn reads from an execution; usage is absent when the execution ran elsewhere
export type RecordableAgentExecution = {
  steps?: Pick<AgentExecutionResult['steps'][number], 'content'>[];
  isPaused?: boolean;
} & Partial<
  Pick<
    AgentExecutionResult,
    'modelId' | 'turnUsage' | 'hasNoMoreAvailableCredits'
  >
>;
