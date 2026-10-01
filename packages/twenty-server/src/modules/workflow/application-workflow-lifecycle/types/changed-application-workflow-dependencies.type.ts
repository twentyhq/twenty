export type ChangedApplicationWorkflowDependencies = {
  removedWorkflowIds: Set<string>;
  changedLogicFunctionDescriptionById: Map<string, string>;
  changedAgentDescriptionById: Map<string, string>;
};
