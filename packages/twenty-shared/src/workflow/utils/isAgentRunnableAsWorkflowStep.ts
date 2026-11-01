import { isWorkflowStepOwnedAgent } from '@/workflow/utils/isWorkflowStepOwnedAgent';

export const isAgentRunnableAsWorkflowStep = (agent: {
  isActive: boolean;
  isSystem: boolean;
}): boolean => agent.isActive && !isWorkflowStepOwnedAgent(agent);
