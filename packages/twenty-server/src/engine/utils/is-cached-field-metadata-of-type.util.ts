import { type FieldMetadataType } from 'twenty-shared/types';

import { type CachedFieldMetadataEntity } from 'src/engine/metadata-modules/types/cached-field-metadata-entity';

export const isCachedFieldMetadataEntityOfType = <
  Field extends CachedFieldMetadataEntity<FieldMetadataType>,
  Type extends FieldMetadataType,
>(
  fieldMetadata: Pick<Field, 'type'>,
  type: Type,
): fieldMetadata is CachedFieldMetadataEntity &
  CachedFieldMetadataEntity<Type> => {
  return fieldMetadata.type === type;
};
