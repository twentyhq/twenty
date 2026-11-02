// a system agent is the hidden agent an older step was built with, so no other step may run it
export const isAgentRunnableAsWorkflowStep = (agent: {
  isActive: boolean;
  isSystem: boolean;
}): boolean => agent.isActive && !agent.isSystem;
