import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';

export const buildWorkflowStepCaller = (
  ref: AgentRunCaller['ref'],
): AgentRunCaller => ({ type: 'WORKFLOW_STEP', ref });
