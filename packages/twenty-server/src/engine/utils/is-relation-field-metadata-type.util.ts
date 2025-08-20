import { type FieldMetadataType } from 'twenty-shared/types';

import {
  RELATION_FIELD_TYPES,
  type RelationFieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/types/relation-field-metadata-type.type';
export const isRelationFieldMetadataType = (
  type: FieldMetadataType,
): type is RelationFieldMetadataType => {
  return RELATION_FIELD_TYPES.includes(type);
};
