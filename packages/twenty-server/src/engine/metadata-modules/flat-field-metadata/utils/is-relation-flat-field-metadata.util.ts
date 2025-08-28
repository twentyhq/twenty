import {
  RELATION_FIELD_TYPES,
  type RelationFieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/types/relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataEntityOfTypes } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-types.util';

export const isRelationFlatFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata,
): flatFieldMetadata is FlatFieldMetadata<RelationFieldMetadataType> =>
  isFlatFieldMetadataEntityOfTypes(flatFieldMetadata, [
    ...RELATION_FIELD_TYPES,
  ]);
