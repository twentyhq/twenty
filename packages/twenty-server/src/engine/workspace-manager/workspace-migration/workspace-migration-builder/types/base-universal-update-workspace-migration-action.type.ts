import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';

export type BaseUniversalUpdateWorkspaceMigrationAction<
  T extends AllMetadataName,
> = {
  type: typeof WORKSPACE_MIGRATION_ACTION_TYPE.update;
  metadataName: T;
  universalIdentifier: string;
  update: FlatEntityUpdate<T>;
};
