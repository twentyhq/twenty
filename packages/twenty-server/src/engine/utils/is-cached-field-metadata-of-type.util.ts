import { FieldMetadataType } from 'twenty-shared/types';

import { CachedFieldMetadataEntity } from 'src/engine/metadata-modules/types/cached-field-metadata-entity';

export function isCachedFieldMetadataEntityOfType<
  Field extends CachedFieldMetadataEntity<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is CachedFieldMetadataEntity &
  CachedFieldMetadataEntity<Type> {
  return fieldMetadata.type === type;
}
