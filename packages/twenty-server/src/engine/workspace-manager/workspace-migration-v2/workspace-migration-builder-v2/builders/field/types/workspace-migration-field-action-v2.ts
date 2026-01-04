import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-delete-workspace-migration-action.type';
import { type BaseUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/base-update-workspace-migration-action.type';

export type CreateFieldAction = Omit<
  BaseCreateWorkspaceMigrationAction<'fieldMetadata'>,
  'flatEntity'
> & {
  objectMetadataId: string;
  flatFieldMetadatas: FlatFieldMetadata[];
};

export type UpdateFieldAction =
  BaseUpdateWorkspaceMigrationAction<'fieldMetadata'> & {
    objectMetadataId: string;
  };

export type DeleteFieldAction =
  BaseDeleteWorkspaceMigrationAction<'fieldMetadata'> & {
    objectMetadataId: string;
  };
