import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type BaseFlatCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-create-workspace-migration-action.type';
import { type BaseFlatDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-delete-workspace-migration-action.type';
import { type BaseFlatUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-update-workspace-migration-action.type';
import { type BaseUniversalCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-create-workspace-migration-action.type';
import { type BaseUniversalDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-delete-workspace-migration-action.type';
import { type BaseUniversalUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-update-workspace-migration-action.type';

export type UniversalCreateIndexAction =
  BaseUniversalCreateWorkspaceMigrationAction<'index'>;

export type UniversalUpdateIndexAction =
  BaseUniversalUpdateWorkspaceMigrationAction<'index'> & {
    updatedUniversalFlatIndex: UniversalFlatIndexMetadata;
  };

export type UniversalDeleteIndexAction =
  BaseUniversalDeleteWorkspaceMigrationAction<'index'>;

export type FlatCreateIndexAction =
  BaseFlatCreateWorkspaceMigrationAction<'index'>;

export type FlatDeleteIndexAction =
  BaseFlatDeleteWorkspaceMigrationAction<'index'>;

export type FlatUpdateIndexAction =
  BaseFlatUpdateWorkspaceMigrationAction<'index'> & {
    // Note: Literally drop and create under the hood
    updatedFlatIndex: FlatIndexMetadata;
  };
