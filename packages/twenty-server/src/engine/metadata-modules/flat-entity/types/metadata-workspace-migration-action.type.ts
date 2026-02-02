import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';

export type WorkspaceMigrationActionType =
  keyof typeof WORKSPACE_MIGRATION_ACTION_TYPE;

// Universal action types (use universal identifiers)
export type MetadataUniversalWorkspaceMigrationActionsRecord<
  T extends AllMetadataName,
> = {
  [K in WorkspaceMigrationActionType]: MetadataUniversalWorkspaceMigrationAction<
    T,
    K
  >[];
};

export type MetadataUniversalWorkspaceMigrationAction<
  TMetadataName extends AllMetadataName,
  TActionType extends WorkspaceMigrationActionType,
> = AllFlatEntityTypesByMetadataName[TMetadataName]['universalActions'][TActionType];

export type MetadataFlatWorkspaceMigrationAction<
  TMetadataName extends AllMetadataName,
  TActionType extends WorkspaceMigrationActionType,
> = AllFlatEntityTypesByMetadataName[TMetadataName]['flatActions'][TActionType];
