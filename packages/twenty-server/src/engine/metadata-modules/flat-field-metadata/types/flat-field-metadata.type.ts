import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type AssignTypeIfIsMorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/assign-type-if-is-morph-or-relation-field-metadata-type.type';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatObjectMetadataWithoutFields } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

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
    flatRelationTargetFieldMetadata: AssignTypeIfIsMorphOrRelationFieldMetadataType<
      Omit<
        FlatFieldMetadata<MorphOrRelationFieldMetadataType>,
        'flatRelationTargetFieldMetadata' | 'flatRelationTargetObjectMetadata'
      >,
      T
    >;
    flatRelationTargetObjectMetadata: AssignTypeIfIsMorphOrRelationFieldMetadataType<
      FlatObjectMetadataWithoutFields,
      T
    >;
  };
