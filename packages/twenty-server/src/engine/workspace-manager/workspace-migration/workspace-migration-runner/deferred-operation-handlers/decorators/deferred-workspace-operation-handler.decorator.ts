import { SetMetadata } from '@nestjs/common';

import { DEFERRED_WORKSPACE_OPERATION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/constants/deferred-workspace-operation-handler-metadata-key.constant';
import { type DeferredWorkspaceOperationName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

export const DeferredWorkspaceOperationHandlerDecorator = (
  name: DeferredWorkspaceOperationName,
) => SetMetadata(DEFERRED_WORKSPACE_OPERATION_HANDLER_METADATA_KEY, name);
