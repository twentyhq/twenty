import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';

export type BaseUpdateWorkspaceMigrationAction<T extends AllMetadataName> = {
  type: typeof WORKSPACE_MIGRATION_ACTION_TYPE.update;
  metadataName: T;
  entityId: string;
  updates: FlatEntityPropertiesUpdates<T>;
};
