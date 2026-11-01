import { type AgentRunSummary } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

export const buildAiAgentStepLog = ({
  summary,
  threadId,
}: {
  summary: AgentRunSummary;
  threadId: string | null;
}): WorkflowRunStepLog => ({
  details: {
    type: 'AI_AGENT',
    ...summary,
    ...(isDefined(threadId) ? { threadId } : {}),
  },
  entries: [],
  sizeBytes: 0,
});
