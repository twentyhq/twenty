import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

type UniqueIdentifierRecord<TTarget extends string> = {
  [P in `${TTarget}UniqueIdentifier`]: string;
};
type ObjectMetadataUniqueIdentifier = UniqueIdentifierRecord<'objectMetadata'>;
type FieldMetadataUniqueIdentifier = UniqueIdentifierRecord<'fieldMetadata'>;

export type FromTo<T> = {
  from: T;
  to: T;
};

type ObjectActionCommon = ObjectMetadataUniqueIdentifier;
export type CreateObjectAction = {
  type: 'create_object';
  object: ObjectMetadataEntity;
} & ObjectActionCommon;

export type UpdateObjectAction = {
  type: 'update_object';
  updates: (FromTo<Partial<ObjectMetadataEntity>> & { property: string })[];
} & ObjectActionCommon;

export type DeleteObjectAction = {
  type: 'delete_object';
} & ObjectActionCommon;

export type WorkspaceMigrationV2ObjectAction =
  | CreateObjectAction
  | UpdateObjectAction
  | DeleteObjectAction;

type FieldActionCommon = {
  field: Partial<FieldMetadataEntity>;
} & ObjectMetadataUniqueIdentifier &
  FieldMetadataUniqueIdentifier;
export type CreateFieldAction = {
  type: 'create_field';
} & FieldActionCommon;

export type UpdateFieldAction = {
  type: 'update_field';
} & FieldActionCommon;

export type DeleteFieldAction = {
  type: 'delete_field';
} & Omit<FieldActionCommon, 'field'>;

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
