import { type DeferredWorkspaceOperationName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

export const SCHEMA_AFFECTING_DEFERRED_WORKSPACE_OPERATIONS = [
  'build_index',
  'validate_foreignKey',
] as const satisfies readonly DeferredWorkspaceOperationName[];
