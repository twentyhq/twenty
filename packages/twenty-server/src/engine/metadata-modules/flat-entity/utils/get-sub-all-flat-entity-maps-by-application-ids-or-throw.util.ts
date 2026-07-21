import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getSubFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-ids-or-throw.util';
import { pruneDanglingForeignKeyAggregatorsInAllFlatEntityMapsThroughMutation } from 'src/engine/metadata-modules/flat-entity/utils/prune-dangling-foreign-key-aggregators-in-all-flat-entity-maps-through-mutation.util';

export const getSubAllFlatEntityMapsByApplicationIdsOrThrow = ({
  applicationIds,
  metadataNames,
  fromAllFlatEntityMaps,
}: {
  applicationIds: string[];
  metadataNames: AllMetadataName[];
  fromAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
}): Partial<AllFlatEntityMaps> => {
  const subAllFlatEntityMaps: Partial<AllFlatEntityMaps> = {};

  for (const metadataName of metadataNames) {
    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
    const fromFlatEntityMaps = fromAllFlatEntityMaps[flatEntityMapsKey];

    if (!isDefined(fromFlatEntityMaps)) {
      throw new FlatEntityMapsException(
        `Missing flat entity maps for metadata "${metadataName}" while building application-scoped slice`,
        FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    // @ts-expect-error Metadata flat entity maps cache key and metadataName colliding
    subAllFlatEntityMaps[flatEntityMapsKey] =
      getSubFlatEntityMapsByApplicationIdsOrThrow<
        MetadataFlatEntity<typeof metadataName>
      >({
        applicationIds,
        flatEntityMaps: fromFlatEntityMaps,
      });
  }

  pruneDanglingForeignKeyAggregatorsInAllFlatEntityMapsThroughMutation({
    allFlatEntityMapsToMutate: subAllFlatEntityMaps,
  });

  return subAllFlatEntityMaps;
};
