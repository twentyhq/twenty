import { type FieldMetadataType } from 'twenty-shared/types';

import {
  MORPH_OR_RELATION_FIELD_TYPES,
  type MorphOrRelationFieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
export const isMorphOrRelationFieldMetadataType = (
  type: FieldMetadataType,
): type is MorphOrRelationFieldMetadataType => {
  return MORPH_OR_RELATION_FIELD_TYPES.includes(
    type as MorphOrRelationFieldMetadataType,
  );
};
