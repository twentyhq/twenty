import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

type AddFlatEntityToFlatEntityMapsOrThrowArgs<T extends SyncableFlatEntity> = {
  flatEntity: T;
  flatEntityMaps: FlatEntityMaps<T>;
};

export const addFlatEntityToFlatEntityMapsOrThrow = <
  T extends SyncableFlatEntity,
>({
  flatEntity,
  flatEntityMaps,
}: AddFlatEntityToFlatEntityMapsOrThrowArgs<T>): FlatEntityMaps<T> => {
  if (isDefined(flatEntityMaps.byId[flatEntity.id])) {
    throw new FlatEntityMapsException(
      'addFlatEntityToFlatEntityMapsOrThrow: flat entity to add already exists',
      FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
    );
  }

  return {
    byId: {
      ...flatEntityMaps.byId,
      [flatEntity.id]: flatEntity,
    },
    idByUniversalIdentifier: {
      ...flatEntityMaps.idByUniversalIdentifier,
      [flatEntity.universalIdentifier]: flatEntity.id,
    },
    universalIdentifiersByApplicationId: {
      ...flatEntityMaps.universalIdentifiersByApplicationId,
      ...(isDefined(flatEntity.applicationId)
        ? {
            [flatEntity.applicationId]: Array.from(
              new Set([
                ...(flatEntityMaps.universalIdentifiersByApplicationId?.[
                  flatEntity.applicationId
                ] ?? []),
                flatEntity.universalIdentifier,
              ]),
            ),
          }
        : {}),
    },
  };
};
