import { FieldMetadataType } from 'twenty-shared/types';

import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';

export function isFlatFieldMetadataEntityOfType<
  Field extends FlatFieldMetadata<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is Field & FlatFieldMetadata<Type> {
  return fieldMetadata.type === type;
}
