import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type LiteFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/lite-flat-field-metadata.type';

// See isFlatFieldMetadataOfType: constrained to the lite shape so full and lite fields both narrow.
export function isFlatFieldMetadataOfTypes<
  Field extends LiteFlatFieldMetadata<FieldMetadataType>,
  Types extends FieldMetadataType[],
>(
  fieldMetadata: Pick<Field, 'type'>,
  types: Types,
): fieldMetadata is Field & FlatFieldMetadata<Types[number]> {
  return types.includes(fieldMetadata.type);
}
