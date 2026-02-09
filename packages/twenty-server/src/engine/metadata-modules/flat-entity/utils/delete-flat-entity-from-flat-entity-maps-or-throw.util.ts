import isEmpty from 'lodash.isempty';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export type DeleteFlatEntityFromFlatEntityMapsOrThrowArgs<
  T extends SyncableFlatEntity,
> = {
  entityToDeleteId: string;
  flatEntityMaps: FlatEntityMaps<T>;
};

export const deleteFlatEntityFromFlatEntityMapsOrThrow = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  entityToDeleteId,
}: DeleteFlatEntityFromFlatEntityMapsOrThrowArgs<T>): FlatEntityMaps<T> => {
  const universalIdentifierToDelete =
    flatEntityMaps.universalIdentifierById[entityToDeleteId];

  if (!isDefined(universalIdentifierToDelete)) {
    throw new FlatEntityMapsException(
      'deleteFlatEntityFromFlatEntityMapsOrThrow: entity to delete not found',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const updatedUniversalIdentifierByIdEntries = Object.entries(
    flatEntityMaps.universalIdentifierById,
  ).filter(([id]) => id !== entityToDeleteId);

  const updatedUniversalIdentifiersByApplicationIdEntries = Object.entries(
    flatEntityMaps.universalIdentifiersByApplicationId,
  )
    .map(([applicationId, universalIdentifiers]) => {
      const stillPresentUniversalIdentifiers = universalIdentifiers?.filter(
        (universalIdentifier) =>
          universalIdentifier !== universalIdentifierToDelete,
      );

      if (
        !isDefined(stillPresentUniversalIdentifiers) ||
        isEmpty(stillPresentUniversalIdentifiers)
      ) {
        return undefined;
      }

      return [applicationId, stillPresentUniversalIdentifiers];
    })
    .filter(isDefined);

  return {
    byUniversalIdentifier: removePropertiesFromRecord(
      flatEntityMaps.byUniversalIdentifier,
      [universalIdentifierToDelete],
    ),
    universalIdentifierById: Object.fromEntries(
      updatedUniversalIdentifierByIdEntries,
    ),
    universalIdentifiersByApplicationId: Object.fromEntries(
      updatedUniversalIdentifiersByApplicationIdEntries,
    ),
  };
};
