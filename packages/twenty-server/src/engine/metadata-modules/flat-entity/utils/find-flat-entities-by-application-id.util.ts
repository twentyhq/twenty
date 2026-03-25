import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export const findFlatEntitiesByApplicationId = <T extends SyncableFlatEntity>({
  applicationId,
  flatEntityMaps,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  applicationId: string;
}): T[] => {
  const universalIdentifiers =
    flatEntityMaps.universalIdentifiersByApplicationId[applicationId];

  if (!isDefined(universalIdentifiers)) {
    return [];
  }

  return universalIdentifiers
    .map((universalId) => {
      const entity = flatEntityMaps.byUniversalIdentifier[universalId];

      if (!isDefined(entity)) {
        return undefined;
      }

      if (entity.applicationId !== applicationId) {
        return undefined;
      }

      return entity;
    })
    .filter(isDefined);
};
