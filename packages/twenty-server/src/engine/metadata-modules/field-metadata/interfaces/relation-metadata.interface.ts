import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

import { ObjectMetadataInterface } from './object-metadata.interface';
import { FieldMetadataInterface } from './field-metadata.interface';

export interface RelationMetadataInterface {
  id: string;

  relationType: RelationMetadataType;

  fromObjectMetadataId: string;
  fromObjectMetadata: ObjectMetadataInterface;

  toObjectMetadataId: string;
  toObjectMetadata: ObjectMetadataInterface;

  fromFieldMetadataId: string;
  fromFieldMetadata: FieldMetadataInterface;

  toFieldMetadataId: string;
  toFieldMetadata: FieldMetadataInterface;
}
