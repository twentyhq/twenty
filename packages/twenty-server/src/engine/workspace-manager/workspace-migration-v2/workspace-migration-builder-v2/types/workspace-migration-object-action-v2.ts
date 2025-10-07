import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-properties-to-compare.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CreateObjectAction = {
  type: 'create_object';
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadatas: FlatFieldMetadata[];
};

export type UpdateObjectAction = {
  type: 'update_object';
  objectMetadataId: string;
  updates: Array<
    {
      [P in FlatObjectMetadataPropertiesToCompare]: PropertyUpdate<
        FlatObjectMetadata,
        P
      >;
    }[FlatObjectMetadataPropertiesToCompare]
  >;
};

export type DeleteObjectAction = {
  type: 'delete_object';
  objectMetadataId: string;
};

export type WorkspaceMigrationObjectActionV2 =
  | CreateObjectAction
  | UpdateObjectAction
  | DeleteObjectAction;

export type WorkspaceMigrationObjectActionTypeV2 =
  WorkspaceMigrationObjectActionV2['type'];

export const WORKSPACE_MIGRATION_OBJECT_ACTION_TYPES = [
  'create_object',
  'delete_object',
  'update_object',
] as const satisfies WorkspaceMigrationObjectActionTypeV2[];
