import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export const getFlatEntitiesByApplicationId = <T extends FlatEntity>(
  maps: FlatEntityMaps<T>,
  applicationId: string,
): T[] => {
  const universalIdentifiers =
    maps.universalIdentifiersByApplicationId[applicationId];

  if (!isDefined(universalIdentifiers)) {
    return [];
  }

  return universalIdentifiers
    .map((universalId) => {
      const id = maps.idByUniversalIdentifier[universalId];

      if (!isDefined(id)) {
        return undefined;
      }

      const entity = maps.byId[id];

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
