import { PartialObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { PartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';

export class WorkspaceSyncStorage {
  // Object metadata
  private readonly _objectMetadataCreateCollection: PartialObjectMetadata[] =
    [];
  private readonly _objectMetadataUpdateCollection: Partial<PartialObjectMetadata>[] =
    [];
  private readonly _objectMetadataDeleteCollection: ObjectMetadataEntity[] = [];

  // Field metadata
  private readonly _fieldMetadataCreateCollection: PartialFieldMetadata[] = [];
  private readonly _fieldMetadataUpdateCollection: Partial<
    PartialFieldMetadata & { id: string }
  >[] = [];
  private readonly _fieldMetadataDeleteCollection: FieldMetadataEntity[] = [];

  // Relation metadata
  private readonly _relationMetadataCreateCollection: Partial<RelationMetadataEntity>[] =
    [];
  private readonly _relationMetadataDeleteCollection: RelationMetadataEntity[] =
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

  get relationMetadataDeleteCollection() {
    return this._relationMetadataDeleteCollection;
  }

  addCreateObjectMetadata(object: PartialObjectMetadata) {
    this._objectMetadataCreateCollection.push(object);
  }

  addUpdateObjectMetadata(object: Partial<PartialObjectMetadata>) {
    this._objectMetadataUpdateCollection.push(object);
  }

  addDeleteObjectMetadata(object: ObjectMetadataEntity) {
    this._objectMetadataDeleteCollection.push(object);
  }

  addCreateFieldMetadata(field: PartialFieldMetadata) {
    this._fieldMetadataCreateCollection.push(field);
  }

  addUpdateFieldMetadata(field: Partial<PartialFieldMetadata>) {
    this._fieldMetadataUpdateCollection.push(field);
  }

  addDeleteFieldMetadata(field: FieldMetadataEntity) {
    this._fieldMetadataDeleteCollection.push(field);
  }

  addCreateRelationMetadata(relation: Partial<RelationMetadataEntity>) {
    this._relationMetadataCreateCollection.push(relation);
  }

  addDeleteRelationMetadata(relation: RelationMetadataEntity) {
    this._relationMetadataDeleteCollection.push(relation);
  }
}
