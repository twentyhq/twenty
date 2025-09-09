import { type FromTo } from 'twenty-shared/types';

import { type FlatIndexMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata-properties-to-compare.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

export type FlatIndexMetadataPropertyUpdate<
  P extends FlatIndexMetadataPropertiesToCompare,
> = {
  property: P;
} & FromTo<FlatIndexMetadata[P]>;
