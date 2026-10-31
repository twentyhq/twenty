// a hidden agent created for a single step before steps could run reusable agents
export const isWorkflowStepOwnedAgent = (agent: {
  isSystem: boolean;
}): boolean => agent.isSystem;
