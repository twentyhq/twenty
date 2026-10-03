import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';

export type RecordableAgentExecution = {
  steps?: Pick<NonNullable<AgentExecutionResult['steps']>[number], 'content'>[];
  isPaused?: boolean;
};
