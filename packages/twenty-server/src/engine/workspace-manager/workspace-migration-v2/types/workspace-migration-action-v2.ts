import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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
  updates: (FromTo<Partial<ObjectMetadataEntity>> & { property: string })[];
}

export interface DeleteObjectAction {
  type: 'delete_object';
  objectMetadataId: string;
}

export type WorkspaceMigrationV2ObjectAction = (
  | CreateObjectAction
  | UpdateObjectAction
  | DeleteObjectAction
) & {
  uniqueIdentifier: string;
};

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

export type WorkspaceMigrationFieldActionV2 =
  | CreateFieldAction
  | UpdateFieldAction
  | DeleteFieldAction;

export interface CreateRelationAction {
  type: 'create_relation';
}

export interface UpdateRelationAction {
  type: 'update_relation';
}

export interface DeleteRelationAction {
  type: 'delete_relation';
}

export type WorkspaceMigrationRelationActionV2 =
  | CreateRelationAction
  | UpdateRelationAction
  | DeleteRelationAction;

export interface CreateIndexAction {
  type: 'create_index';
}

export interface DeleteIndexAction {
  type: 'delete_index';
}

export type WorkspaceMigrationIndexActionV2 =
  | CreateIndexAction
  | DeleteIndexAction;

export interface AddUniquenessConstraintAction {
  type: 'add_uniqueness_constraint';
}

export interface RemoveUniquenessConstraintAction {
  type: 'remove_uniqueness_constraint';
}

export type WorkspaceMigrationUniquenessActionV2 =
  | CreateIndexAction
  | DeleteIndexAction;

export type WorkspaceMigrationActionV2 =
  | WorkspaceMigrationRelationActionV2
  | WorkspaceMigrationV2ObjectAction
  | WorkspaceMigrationFieldActionV2
  | WorkspaceMigrationUniquenessActionV2
  | WorkspaceMigrationIndexActionV2;

export type WorkspaceMigrationActionTypeV2 = WorkspaceMigrationActionV2['type'];
