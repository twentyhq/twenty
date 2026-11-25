import { type AllMetadataName } from 'twenty-shared/metadata';

import { type DeferredWorkspaceOperationExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-execution-args.type';
import {
  type DeferredWorkspaceOperationName,
  type DeferredWorkspaceOperationPayload,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

export type DeferredWorkspaceOperationHandler<
  TName extends DeferredWorkspaceOperationName = DeferredWorkspaceOperationName,
> = {
  metadataNamesToLoad: AllMetadataName[];
  execute(
    args: DeferredWorkspaceOperationExecutionArgs<
      DeferredWorkspaceOperationPayload<TName>
    >,
  ): Promise<void>;
};
