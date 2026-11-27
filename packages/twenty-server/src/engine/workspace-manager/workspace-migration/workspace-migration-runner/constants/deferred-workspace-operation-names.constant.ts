import { type DeferredWorkspaceOperationName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

export const DEFERRED_WORKSPACE_OPERATION_NAMES = {
  build_index: 'build_index',
  validate_foreignKey: 'validate_foreignKey',
  rebuild_object: 'rebuild_object',
  delete_logicFunctionResources: 'delete_logicFunctionResources',
  delete_workflowRuns: 'delete_workflowRuns',
  compute_recordAccessGroupIds: 'compute_recordAccessGroupIds',
  compute_storedFormulaFields: 'compute_storedFormulaFields',
} as const satisfies {
  [TName in DeferredWorkspaceOperationName]: TName;
};
