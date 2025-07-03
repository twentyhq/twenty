import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export type WorkspaceMigrationActionV2 =
  | WorkspaceMigrationObjectActionV2
  | CreateFieldAction
  | UpdateFieldAction
  | DeleteFieldAction;

export type WorkspaceMigrationObjectActionV2 =
  | CreateObjectAction
  | UpdateObjectAction
  | DeleteObjectAction;

export type FromTo<T> = {
  from: T;
  to: T;
};
export interface CreateObjectAction {
  type: 'create_object';
  object: ObjectMetadataEntity;
}

export interface UpdateObjectAction {
  type: 'update_object';
  object: FromTo<Partial<ObjectMetadataEntity>>;
}

export interface DeleteObjectAction {
  type: 'delete_object';
  objectMetadataId: string;
}

export interface CreateFieldAction {
  type: 'create_field';
  field: FieldMetadataEntity;
}

export interface UpdateFieldAction {
  type: 'update_field';
  field: Partial<FieldMetadataEntity>;
}

export interface DeleteFieldAction {
  type: 'delete_field';
  fieldMetadataId: string;
}
