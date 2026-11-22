import { type DeferredWorkspaceOperationName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

const IS_DEFERRED_WORKSPACE_OPERATION_NAME = {
  build_index: true,
  validate_foreignKey: true,
  rebuild_object: true,
  delete_logicFunctionResources: true,
  delete_workflowRuns: true,
  compute_recordAccessGroupIds: true,
} satisfies Record<DeferredWorkspaceOperationName, true>;

export const DEFERRED_WORKSPACE_OPERATION_NAMES = Object.keys(
  IS_DEFERRED_WORKSPACE_OPERATION_NAME,
) as DeferredWorkspaceOperationName[];
