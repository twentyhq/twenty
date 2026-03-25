import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type ExtractUniversalForeignKeyAggregatorForMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-flat-entity-foreign-key-aggregator-properties.constant';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type BaseFlatCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-create-workspace-migration-action.type';
import { type BaseFlatDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-delete-workspace-migration-action.type';
import { type BaseFlatUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-update-workspace-migration-action.type';
import { type BaseUniversalCreateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-create-workspace-migration-action.type';
import { type BaseUniversalDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-delete-workspace-migration-action.type';
import { type BaseUniversalUpdateWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-universal-update-workspace-migration-action.type';

// Universal action types (always use universal identifiers)
export type UniversalCreateObjectAction =
  BaseUniversalCreateWorkspaceMigrationAction<'objectMetadata'> & {
    universalFlatFieldMetadatas: Omit<
      UniversalFlatFieldMetadata,
      ExtractUniversalForeignKeyAggregatorForMetadataName<'fieldMetadata'>
    >[];
    // Optional map to provide specific IDs for field creation (for API metadata).
    fieldIdByUniversalIdentifier?: Record<string, string>;
  };

export type UniversalUpdateObjectAction =
  BaseUniversalUpdateWorkspaceMigrationAction<'objectMetadata'>;

export type UniversalDeleteObjectAction =
  BaseUniversalDeleteWorkspaceMigrationAction<'objectMetadata'>;

// Flat action types (always use entity IDs)
export type FlatCreateObjectAction =
  BaseFlatCreateWorkspaceMigrationAction<'objectMetadata'> & {
    flatFieldMetadatas: FlatFieldMetadata[];
  };

export type FlatUpdateObjectAction =
  BaseFlatUpdateWorkspaceMigrationAction<'objectMetadata'>;

export type FlatDeleteObjectAction =
  BaseFlatDeleteWorkspaceMigrationAction<'objectMetadata'>;
