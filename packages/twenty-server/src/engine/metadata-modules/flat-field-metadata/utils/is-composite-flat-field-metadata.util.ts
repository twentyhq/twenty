import {
  COMPOSITE_FIELD_TYPES,
  type CompositeFieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataEntityOfTypes } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-falt-field-metadata-of-types.util';

export const isCompositeFlatFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata,
): flatFieldMetadata is FlatFieldMetadata<CompositeFieldMetadataType> =>
  isFlatFieldMetadataEntityOfTypes(flatFieldMetadata, COMPOSITE_FIELD_TYPES);
