import { type FieldMetadataType, type FromTo } from 'twenty-shared/types';

import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type FlatFieldMetadataPropertyUpdate<
  P extends FlatFieldMetadataPropertiesToCompare,
  T extends FieldMetadataType = FieldMetadataType,
> = {
  property: P;
} & FromTo<FlatFieldMetadata<T>[P]>;