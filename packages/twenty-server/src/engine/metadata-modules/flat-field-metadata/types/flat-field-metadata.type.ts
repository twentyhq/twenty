import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const fieldMetadataRelationProperties = [
  'relationTargetFieldMetadata',
  'relationTargetObjectMetadata',
  'fieldPermissions',
  'indexFieldMetadatas',
  'object',
] as const satisfies (keyof FieldMetadataEntity)[];

export type FieldMetadataEntityRelationProperties =
  (typeof fieldMetadataRelationProperties)[number];

export type FlatFieldMetadata<T extends FieldMetadataType = FieldMetadataType> =
  Omit<FieldMetadataEntity<T>, FieldMetadataEntityRelationProperties> & {
    universalIdentifier: string;
    // Could add indexField metadatas and so on ?
  };
