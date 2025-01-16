import { RelationMetadataTypeV2 } from 'src/engine/metadata-modules/relation-metadata-v2/relation-metadata-v2.entity';

import { FieldMetadataInterface } from './field-metadata.interface';
import { ObjectMetadataInterface } from './object-metadata.interface';

export interface RelationMetadataInterfaceV2 {
  id: string;

  relationType: RelationMetadataTypeV2;

  sourceObjectMetadataId: string;
  sourceObjectMetadata: ObjectMetadataInterface;

  targetObjectMetadataId: string;
  targetObjectMetadata: ObjectMetadataInterface;

  sourceFieldMetadataId: string;
  sourceFieldMetadata: FieldMetadataInterface;

  targetFieldMetadataId: string;
  targetFieldMetadata: FieldMetadataInterface;
}
