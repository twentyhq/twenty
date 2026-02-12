import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';

export type BaseFlatDeleteWorkspaceMigrationAction<T extends AllMetadataName> =
  {
    entityId: string;
    type: typeof WORKSPACE_MIGRATION_ACTION_TYPE.delete;
    metadataName: T;
  };
