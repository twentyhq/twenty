import { getSeededObjectViewUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const computeSeededObjectViewUniversalIdentifiers = ({
  flatObjectMetadataMaps,
  seededViewApplicationUniversalIdentifier,
}: Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'> & {
  seededViewApplicationUniversalIdentifier: string;
}): Set<string> =>
  new Set(
    Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map((flatObjectMetadata) =>
        getSeededObjectViewUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            seededViewApplicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        }),
      ),
  );
