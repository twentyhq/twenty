import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';

export const buildAiAgentStepLog = (
  summary: AgentRunSummary,
): WorkflowRunStepLog => ({
  details: { type: 'AI_AGENT', ...summary },
  entries: [],
  sizeBytes: 0,
});
