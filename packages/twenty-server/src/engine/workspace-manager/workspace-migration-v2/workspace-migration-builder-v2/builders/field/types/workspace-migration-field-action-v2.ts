import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CreateFieldAction = {
  type: 'create_field';
  objectMetadataId: string;
  flatFieldMetadatas: FlatFieldMetadata[];
};

export type UpdateFieldAction = {
  type: 'update_field';
  fieldMetadataId: string;
  objectMetadataId: string;
  updates: Array<
    {
      [P in FlatFieldMetadataPropertiesToCompare]: PropertyUpdate<
        FlatFieldMetadata,
        P
      >;
    }[FlatFieldMetadataPropertiesToCompare]
  >;
};

export type DeleteFieldAction = {
  type: 'delete_field';
  fieldMetadataId: string;
  objectMetadataId: string;
};

export type WorkspaceMigrationFieldActionV2 =
  | CreateFieldAction
  | UpdateFieldAction
  | DeleteFieldAction;

export type WorkspaceMigrationFieldActionTypeV2 =
  WorkspaceMigrationFieldActionV2['type'];
