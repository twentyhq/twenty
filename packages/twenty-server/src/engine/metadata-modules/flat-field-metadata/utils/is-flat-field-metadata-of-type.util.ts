import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

// Constrained to the ORM shape so both the full field metadata and its ORM projection can be
// narrowed on `type` (the record query path only ever holds the ORM projection). Full callers
// keep narrowing to the full field type as before.
export function isFlatFieldMetadataOfType<
  Field extends OrmFlatFieldMetadata<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is Field & FlatFieldMetadata<Type> {
  return fieldMetadata.type === type;
}
