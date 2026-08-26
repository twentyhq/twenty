import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

// See isFlatFieldMetadataOfType: constrained to the ORM shape so full and ORM fields both narrow.
export function isFlatFieldMetadataOfTypes<
  Field extends OrmFlatFieldMetadata<FieldMetadataType>,
  Types extends FieldMetadataType[],
>(
  fieldMetadata: Pick<Field, 'type'>,
  types: Types,
): fieldMetadata is Field & FlatFieldMetadata<Types[number]> {
  return types.includes(fieldMetadata.type);
}
