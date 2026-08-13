import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type LiteFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/lite-flat-field-metadata.type';

// Constrained to the lite shape so both the full field metadata and its lite projection can be
// narrowed on `type` (the record query path only ever holds the lite projection). Full callers
// keep narrowing to the full field type as before.
export function isFlatFieldMetadataOfType<
  Field extends LiteFlatFieldMetadata<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is Field & FlatFieldMetadata<Type> {
  return fieldMetadata.type === type;
}
