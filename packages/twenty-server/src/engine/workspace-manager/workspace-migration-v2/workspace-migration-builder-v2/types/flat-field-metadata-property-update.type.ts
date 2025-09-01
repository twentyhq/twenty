import { type FieldMetadataType, type FromTo } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';

export type FlatFieldMetadataPropertyUpdate<
  P extends FlatFieldMetadataPropertiesToCompare,
  T extends FieldMetadataType = FieldMetadataType,
> = {
  property: P;
} & FromTo<FieldMetadataEntity<T>[P]>;
