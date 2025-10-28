import {
  ENUM_FIELD_TYPES,
  type EnumFieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/types/enum-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfTypes } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-types.util';

export const isEnumFlatFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata,
): flatFieldMetadata is FlatFieldMetadata<EnumFieldMetadataType> =>
  isFlatFieldMetadataOfTypes(flatFieldMetadata, ENUM_FIELD_TYPES);
