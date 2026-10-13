import { FieldMetadataType } from 'twenty-shared/types';
import { isMorphRelationHead } from 'twenty-shared/utils';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export const isMorphOrRelationFlatFieldMetadataWithTarget = <
  TFieldMetadata extends Pick<
    OrmFlatFieldMetadata,
    'type' | 'universalIdentifier'
  > & {
    morphId?: string | null;
  },
>(
  fieldMetadata: TFieldMetadata,
): fieldMetadata is TFieldMetadata &
  FlatFieldMetadata<MorphOrRelationFieldMetadataType> & {
    relationTargetFieldMetadataId: string;
    relationTargetObjectMetadataId: string;
  } =>
  fieldMetadata.type === FieldMetadataType.RELATION ||
  (fieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
    !isMorphRelationHead(fieldMetadata));
