import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type BaseCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-create-workspace-migration-action.type';
import { type BaseDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-delete-workspace-migration-action.type';

export type CreateIndexAction = BaseCreateWorkspaceMigrationAction<'index'>;

export type DeleteIndexAction = BaseDeleteWorkspaceMigrationAction<'index'>;

export type UpdateIndexAction = {
  type: 'update';
  metadataName: 'index';
  entityId: string;
  updatedFlatEntity: FlatIndexMetadata;
};
