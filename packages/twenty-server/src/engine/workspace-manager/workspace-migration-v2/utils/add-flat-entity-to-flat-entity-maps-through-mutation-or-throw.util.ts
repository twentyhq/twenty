import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

type AddFlatEntityToFlatEntityMapsThroughMutationOrThrowArgs<
  T extends FlatEntity,
> = {
  flatEntity: T;
  flatEntityMaps: FlatEntityMaps<T>;
};

export const addFlatEntityToFlatEntityMapsThroughMutationOrThrow = <
  T extends FlatEntity,
>({
  flatEntity,
  flatEntityMaps,
}: AddFlatEntityToFlatEntityMapsThroughMutationOrThrowArgs<T>): void => {
  if (isDefined(flatEntityMaps.byId[flatEntity.id])) {
    throw new FlatEntityMapsException(
      'addFlatEntityToFlatEntityMapsThroughMutationOrThrow: flat entity to add already exists',
      FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
    );
  }

  flatEntityMaps.byId[flatEntity.id] = flatEntity;

  flatEntityMaps.idByUniversalIdentifier[flatEntity.universalIdentifier] =
    flatEntity.id;

  if (isDefined(flatEntity.applicationId)) {
    const existingUniversalIdentifiers =
      flatEntityMaps.universalIdentifiersByApplicationId[
        flatEntity.applicationId
      ];

    if (isDefined(existingUniversalIdentifiers)) {
      if (
        !existingUniversalIdentifiers.includes(flatEntity.universalIdentifier)
      ) {
        existingUniversalIdentifiers.push(flatEntity.universalIdentifier);
      }
    } else {
      flatEntityMaps.universalIdentifiersByApplicationId[
        flatEntity.applicationId
      ] = [flatEntity.universalIdentifier];
    }
  }
};
