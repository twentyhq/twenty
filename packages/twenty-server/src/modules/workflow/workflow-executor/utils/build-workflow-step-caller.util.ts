import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';

type WorkflowStepCaller = Extract<AgentRunCaller, { type: 'WORKFLOW_STEP' }>;

export const buildWorkflowStepCaller = (
  ref: WorkflowStepCaller['ref'],
): WorkflowStepCaller => ({ type: 'WORKFLOW_STEP', ref });
