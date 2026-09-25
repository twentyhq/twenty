import { type AllMetadataName } from 'twenty-shared/metadata';

import { type DeferredWorkspaceMigrationActionExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action-execution-args.type';
import {
  type DeferredWorkspaceMigrationActionName,
  type DeferredWorkspaceMigrationActionPayload,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';

export type DeferredWorkspaceMigrationActionHandler<
  TName extends DeferredWorkspaceMigrationActionName =
    DeferredWorkspaceMigrationActionName,
> = {
  metadataNamesToLoad: AllMetadataName[];
  execute(
    args: DeferredWorkspaceMigrationActionExecutionArgs<
      DeferredWorkspaceMigrationActionPayload<TName>
    >,
  ): Promise<void>;
};
