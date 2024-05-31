import { ComputedPartialWorkspaceEntity } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { ComputedPartialFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export class WorkspaceSyncStorage {
  // Object metadata
  private readonly _objectMetadataCreateCollection: ComputedPartialWorkspaceEntity[] =
    [];
  private readonly _objectMetadataUpdateCollection: (Partial<ComputedPartialWorkspaceEntity> & {
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

  // Relation metadata
  private readonly _relationMetadataCreateCollection: Partial<RelationMetadataEntity>[] =
    [];
  private readonly _relationMetadataDeleteCollection: RelationMetadataEntity[] =
    [];
  private readonly _relationMetadataUpdateCollection: Partial<RelationMetadataEntity>[] =
    [];

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

  get relationMetadataCreateCollection() {
    return this._relationMetadataCreateCollection;
  }

  get relationMetadataUpdateCollection() {
    return this._relationMetadataUpdateCollection;
  }

  get relationMetadataDeleteCollection() {
    return this._relationMetadataDeleteCollection;
  }

  addCreateObjectMetadata(object: ComputedPartialWorkspaceEntity) {
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

  addCreateRelationMetadata(relation: Partial<RelationMetadataEntity>) {
    this._relationMetadataCreateCollection.push(relation);
  }

  addUpdateRelationMetadata(relation: Partial<RelationMetadataEntity>) {
    this._relationMetadataUpdateCollection.push(relation);
  }

  addDeleteRelationMetadata(relation: RelationMetadataEntity) {
    this._relationMetadataDeleteCollection.push(relation);
  }
}
