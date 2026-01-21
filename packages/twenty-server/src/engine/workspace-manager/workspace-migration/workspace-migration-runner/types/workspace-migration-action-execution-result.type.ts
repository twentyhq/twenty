import { WorkspaceMigrationAction } from "src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common";

export type WorkspaceMigrationActionExecutionResult<
  TAction extends WorkspaceMigrationAction,
  TPartialCache,
> =
  | {
      status: 'success';
      action: TAction;
      partialOptimisticCache: TPartialCache;
    }
  | {
      status: 'failure';
      action: TAction;
      errors: {
        metadata?: Error;
        workspaceSchema?: Error;
      };
    };
