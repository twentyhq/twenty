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

// Builds an application-scoped slice of the requested metadata names and prunes any
// one-to-many aggregator references left dangling by the slice (e.g. a standard
// view's `viewFieldUniversalIdentifiers` still pointing at a view field owned by an
// application outside the slice). Pruning is intrinsic to producing a slice the
// migration builder can walk safely, so it always runs here — callers cannot forget
// it. Works over a partial map universe: pass only the metadata names you loaded.
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
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
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
