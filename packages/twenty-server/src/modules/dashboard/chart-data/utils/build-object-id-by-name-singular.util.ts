import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildObjectIdByNameSingular = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
): Record<string, string> => {
  const objectIdByNameSingular: Record<string, string> = {};

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (isDefined(flatObjectMetadata)) {
      objectIdByNameSingular[flatObjectMetadata.nameSingular] =
        flatObjectMetadata.id;
    }
  }

  return objectIdByNameSingular;
};
