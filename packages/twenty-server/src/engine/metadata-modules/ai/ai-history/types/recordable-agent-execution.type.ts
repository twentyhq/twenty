import { type StepResult, type ToolSet } from 'ai';

import { type AgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/agent-turn-usage.type';

// what recording a turn reads from an execution; usage is absent when the execution ran elsewhere
export type RecordableAgentExecution = {
  steps?: Pick<StepResult<ToolSet>, 'content'>[];
  isPaused?: boolean;
  modelId?: string;
  turnUsage?: AgentTurnUsage;
  hasNoMoreAvailableCredits?: boolean;
};
