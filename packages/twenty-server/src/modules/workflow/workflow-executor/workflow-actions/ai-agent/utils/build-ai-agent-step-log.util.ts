import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';

export const buildAiAgentStepLog = ({
  summary,
  threadId,
}: {
  summary: AgentRunSummary;
  threadId: string;
}): WorkflowRunStepLog => ({
  details: { type: 'AI_AGENT', ...summary, threadId },
  entries: [],
  sizeBytes: 0,
});
