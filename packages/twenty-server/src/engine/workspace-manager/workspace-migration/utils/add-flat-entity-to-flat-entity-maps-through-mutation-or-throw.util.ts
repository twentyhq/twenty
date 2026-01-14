import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

type AddFlatEntityToFlatEntityMapsThroughMutationOrThrowArgs<
  T extends SyncableFlatEntity,
> = {
  flatEntity: T;
  flatEntityMapsToMutate: FlatEntityMaps<T>;
};

export const addFlatEntityToFlatEntityMapsThroughMutationOrThrow = <
  T extends SyncableFlatEntity,
>({
  flatEntity,
  flatEntityMapsToMutate,
}: AddFlatEntityToFlatEntityMapsThroughMutationOrThrowArgs<T>): void => {
  if (isDefined(flatEntityMapsToMutate.byId[flatEntity.id])) {
    throw new FlatEntityMapsException(
      'addFlatEntityToFlatEntityMapsThroughMutationOrThrow: flat entity to add already exists',
      FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
    );
  }

  flatEntityMapsToMutate.byId[flatEntity.id] = flatEntity;

  flatEntityMapsToMutate.idByUniversalIdentifier[
    flatEntity.universalIdentifier
  ] = flatEntity.id;

  if (isDefined(flatEntity.applicationId)) {
    const existingUniversalIdentifiers =
      flatEntityMapsToMutate.universalIdentifiersByApplicationId[
        flatEntity.applicationId
      ];

    if (isDefined(existingUniversalIdentifiers)) {
      if (
        !existingUniversalIdentifiers.includes(flatEntity.universalIdentifier)
      ) {
        existingUniversalIdentifiers.push(flatEntity.universalIdentifier);
      }
    } else {
      flatEntityMapsToMutate.universalIdentifiersByApplicationId[
        flatEntity.applicationId
      ] = [flatEntity.universalIdentifier];
    }
  }
};
