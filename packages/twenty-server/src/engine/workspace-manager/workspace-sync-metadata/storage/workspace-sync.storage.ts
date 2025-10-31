import { type FieldMetadataType } from 'twenty-shared/types';

import { type ComputedPartialFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { type ComputedPartialWorkspaceEntity } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-object-metadata.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export class WorkspaceSyncStorage {
  // Object metadata
  private readonly _objectMetadataCreateCollection: Omit<
    ComputedPartialWorkspaceEntity,
    'fields' | 'indexMetadatas'
  >[] = [];
  private readonly _objectMetadataUpdateCollection: (Partial<
    Omit<ComputedPartialWorkspaceEntity, 'fields' | 'indexMetadatas'>
  > & {
    id: string;
  })[] = [];
  private readonly _objectMetadataDeleteCollection: ObjectMetadataEntity[] = [];

  // Field metadata
  private readonly _fieldMetadataCreateCollection: ComputedPartialFieldMetadata[] =
    [];
  private readonly _fieldMetadataUpdateCollection: (Partial<ComputedPartialFieldMetadata> & {
    id: string;
  })[] = [];
  private readonly _fieldMetadataDeleteCollection: FieldMetadataEntity[] = [];

  // Field relation metadata
  private readonly _fieldRelationMetadataCreateCollection: (Partial<
    ComputedPartialFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >
  > & {
    id: string;
    type?: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
  })[] = [];
  private readonly _fieldRelationMetadataUpdateCollection: (Partial<
    ComputedPartialFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >
  > & {
    id: string;
    type?: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
  })[] = [];
  private readonly _fieldRelationMetadataDeleteCollection: FieldMetadataEntity<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >[] = [];

  // Index metadata
  private readonly _indexMetadataCreateCollection: Partial<IndexMetadataEntity>[] =
    [];
  private readonly _indexMetadataDeleteCollection: IndexMetadataEntity[] = [];

  constructor() {}

  get objectMetadataCreateCollection() {
    return this._objectMetadataCreateCollection;
  }

  get objectMetadataUpdateCollection() {
    return this._objectMetadataUpdateCollection;
  }

  get objectMetadataDeleteCollection() {
    return this._objectMetadataDeleteCollection;
  }

  get fieldMetadataCreateCollection() {
    return this._fieldMetadataCreateCollection;
  }

  get fieldMetadataUpdateCollection() {
    return this._fieldMetadataUpdateCollection;
  }

  get fieldMetadataDeleteCollection() {
    return this._fieldMetadataDeleteCollection;
  }

  get fieldRelationMetadataCreateCollection() {
    return this._fieldRelationMetadataCreateCollection;
  }

  get fieldRelationMetadataUpdateCollection() {
    return this._fieldRelationMetadataUpdateCollection;
  }

  get fieldRelationMetadataDeleteCollection() {
    return this._fieldRelationMetadataDeleteCollection;
  }

  get indexMetadataCreateCollection() {
    return this._indexMetadataCreateCollection;
  }

  get indexMetadataDeleteCollection() {
    return this._indexMetadataDeleteCollection;
  }

  addCreateObjectMetadata(
    object: Omit<ComputedPartialWorkspaceEntity, 'fields' | 'indexMetadatas'>,
  ) {
    this._objectMetadataCreateCollection.push(object);
  }

  addUpdateObjectMetadata(
    object: Partial<ComputedPartialWorkspaceEntity> & { id: string },
  ) {
    this._objectMetadataUpdateCollection.push(object);
  }

  addDeleteObjectMetadata(object: ObjectMetadataEntity) {
    this._objectMetadataDeleteCollection.push(object);
  }

  addCreateFieldMetadata(field: ComputedPartialFieldMetadata) {
    this._fieldMetadataCreateCollection.push(field);
  }

  addUpdateFieldMetadata(
    field: Partial<ComputedPartialFieldMetadata> & { id: string },
  ) {
    this._fieldMetadataUpdateCollection.push(field);
  }

  addDeleteFieldMetadata(field: FieldMetadataEntity) {
    this._fieldMetadataDeleteCollection.push(field);
  }

  addCreateFieldRelationMetadata(
    field: Partial<
      ComputedPartialFieldMetadata<
        FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
      >
    > & {
      id: string;
      type: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
    },
  ) {
    this._fieldRelationMetadataCreateCollection.push(field);
  }

  addUpdateFieldRelationMetadata(
    field: Partial<
      ComputedPartialFieldMetadata<
        FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
      >
    > & {
      id: string;
      type: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
    },
  ) {
    this._fieldRelationMetadataUpdateCollection.push(field);
  }

  addDeleteFieldRelationMetadata(
    field: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >,
  ) {
    this._fieldRelationMetadataDeleteCollection.push(field);
  }

  addCreateIndexMetadata(index: Partial<IndexMetadataEntity>) {
    this._indexMetadataCreateCollection.push(index);
  }

  addDeleteIndexMetadata(index: IndexMetadataEntity) {
    this._indexMetadataDeleteCollection.push(index);
  }
}
