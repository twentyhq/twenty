import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type CreateFieldAction = {
  type: 'create_field';
  objectMetadataId: string;
  flatFieldMetadatas: FlatFieldMetadata[];
};

export type UpdateFieldAction = {
  type: 'update_field';
  fieldMetadataId: string;
  objectMetadataId: string;
  updates: FlatEntityPropertiesUpdates<'fieldMetadata'>;
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
