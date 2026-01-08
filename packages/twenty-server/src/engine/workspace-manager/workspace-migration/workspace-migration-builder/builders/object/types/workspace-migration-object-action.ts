import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-update-workspace-migration-action.type';

export type CreateObjectAction =
  BaseCreateWorkspaceMigrationAction<'objectMetadata'> & {
    flatFieldMetadatas: FlatFieldMetadata[];
  };

export type UpdateObjectAction =
  BaseUpdateWorkspaceMigrationAction<'objectMetadata'>;

export type DeleteObjectAction =
  BaseDeleteWorkspaceMigrationAction<'objectMetadata'>;
