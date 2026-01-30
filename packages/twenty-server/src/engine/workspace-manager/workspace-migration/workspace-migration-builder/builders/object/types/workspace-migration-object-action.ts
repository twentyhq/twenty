import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-update-workspace-migration-action.type';

export type CreateObjectAction =
  BaseCreateWorkspaceMigrationAction<'objectMetadata'> & {
    universalFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  };

export type UpdateObjectAction =
  BaseUpdateWorkspaceMigrationAction<'objectMetadata'>;

export type DeleteObjectAction =
  BaseDeleteWorkspaceMigrationAction<'objectMetadata'>;
