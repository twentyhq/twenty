import { type AgentRunSummary } from 'twenty-shared/ai';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

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
