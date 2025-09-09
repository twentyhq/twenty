import {
  MORPH_OR_RELATION_FIELD_TYPES,
  type MorphOrRelationFieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfTypes } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-types.util';

export const isMorphOrRelationFlatFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata,
): flatFieldMetadata is FlatFieldMetadata<MorphOrRelationFieldMetadataType> =>
  isFlatFieldMetadataOfTypes(flatFieldMetadata, [
    ...MORPH_OR_RELATION_FIELD_TYPES,
  ]);
