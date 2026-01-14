import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-update-workspace-migration-action.type';

export type WorkspaceMigrationActionType =
  | BaseCreateWorkspaceMigrationAction<AllMetadataName>['type']
  | BaseUpdateWorkspaceMigrationAction<AllMetadataName>['type']
  | BaseDeleteWorkspaceMigrationAction<AllMetadataName>['type'];

export type MetadataWorkspaceMigrationActionsRecord<T extends AllMetadataName> =
  {
    [K in WorkspaceMigrationActionType]: MetadataWorkspaceMigrationAction<
      T,
      K
    >[];
  };

export type MetadataWorkspaceMigrationAction<
  TMetadataName extends AllMetadataName,
  TActionType extends WorkspaceMigrationActionType,
> = AllFlatEntityTypesByMetadataName[TMetadataName]['actions'][TActionType] extends infer Action
  ? Action extends Array<unknown>
    ? Action[number]
    : Action
  : never;
