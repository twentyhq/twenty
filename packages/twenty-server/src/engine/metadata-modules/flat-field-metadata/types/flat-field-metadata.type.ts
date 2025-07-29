import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { AssignTypeIfIsRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/assign-type-if-is-relation-field-metadata-type.type';
import { FlatObjectMetadataWithoutFields } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

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
  Omit<
    FieldMetadataEntity<T>,
    FieldMetadataEntityRelationProperties | 'createdAt' | 'updatedAt'
  > & {
    uniqueIdentifier: string;
    flatRelationTargetFieldMetadata: AssignTypeIfIsRelationFieldMetadataType<
      Omit<
        FlatFieldMetadata,
        'flatRelationTargetFieldMetadata' | 'flatRelationTargetObjectMetadata'
      >,
      T
    >;
    flatRelationTargetObjectMetadata: AssignTypeIfIsRelationFieldMetadataType<
      FlatObjectMetadataWithoutFields,
      T
    >;
  };
