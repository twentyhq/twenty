import { type FromTo } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';

export type FlatFieldMetadataPropertyUpdate<
  T extends FlatFieldMetadataPropertiesToCompare,
> = {
  property: T;
} & FromTo<FieldMetadataEntity[T]>;
