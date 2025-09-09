import { type FieldMetadataType, type FromTo } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';
import { FlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';
import { FlatIndexFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-index-field-metadata/types/flat-index-field-metadata-properties-to-compare.type';

export type TMp<
  P extends FlatIndexFieldMetadataPropertiesToCompare,
  
> = {
  property: P;
} & FromTo<<FlatIndexFieldMetadata>[P]>;