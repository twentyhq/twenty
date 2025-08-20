import { Injectable, SetMetadata } from '@nestjs/common';

import { type WorkspaceMigrationActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export const WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA =
  'workspace_migration_action_handler';

export function WorkspaceMigrationActionHandler<
  T extends WorkspaceMigrationActionTypeV2,
>(actionType: T): ClassDecorator {
  return (target: Function) => {
    Injectable()(target);
    SetMetadata(
      WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA,
      actionType,
    )(target);
  };
}
