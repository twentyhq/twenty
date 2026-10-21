import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';

export const buildWorkflowStepCaller = (ref: {
  workflowRunId: string;
  stepId: string;
}): AgentRunCaller => ({ type: 'WORKFLOW_STEP', ref });
