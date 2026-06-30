import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { computeUniqueFieldMetadataIdsFromIndexes } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-indexes.util';

export const computeUniqueFieldMetadataIdsFromFlatIndexMaps = (
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>,
): Set<string> =>
  computeUniqueFieldMetadataIdsFromIndexes(
    Object.values(flatIndexMaps.byUniversalIdentifier).filter(isDefined),
  );
