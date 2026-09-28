import { SetMetadata } from '@nestjs/common';

import { DEFERRED_WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/constants/deferred-workspace-migration-action-handler-metadata-key.constant';
import { type DeferredWorkspaceMigrationActionName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';

export const DeferredWorkspaceMigrationActionHandlerDecorator = (
  name: DeferredWorkspaceMigrationActionName,
) =>
  SetMetadata(DEFERRED_WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY, name);
