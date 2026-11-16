import {
  type DeferredWorkspaceOperationName,
  type DeferredWorkspaceOperationPayload,
  type PersistedDeferredWorkspaceOperation,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

export const isDeferredWorkspaceOperationNamed = <
  TOperation extends PersistedDeferredWorkspaceOperation,
  TName extends DeferredWorkspaceOperationName,
>(
  deferredOperation: TOperation,
  name: TName,
): deferredOperation is TOperation & {
  name: TName;
  payload: DeferredWorkspaceOperationPayload<TName>;
} => deferredOperation.name === name;
