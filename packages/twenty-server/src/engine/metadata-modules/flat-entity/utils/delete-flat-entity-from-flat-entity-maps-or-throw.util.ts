import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type DeleteFlatEntityFromFlatEntityMapsOrThrowArgs<
  T extends FlatEntity,
> = {
  entityToDeleteId: string;
  flatEntityMaps: FlatEntityMaps<T>;
};

export const deleteFlatEntityFromFlatEntityMapsOrThrow = <
  T extends FlatEntity,
>({
  flatEntityMaps,
  entityToDeleteId,
}: DeleteFlatEntityFromFlatEntityMapsOrThrowArgs<T>): FlatEntityMaps<T> => {
  if (!isDefined(flatEntityMaps.byId[entityToDeleteId])) {
    throw new FlatEntityMapsException(
      'deleteFlatEntityFromFlatEntityMapsOrThrow: entity to delete not found',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const updatedIdByUniversalIdentifierEntries = Object.entries(
    flatEntityMaps.idByUniversalIdentifier,
  ).filter(([_universalIdentifier, id]) => id !== entityToDeleteId);

  const updatedUniversalIdentifiersByApplicationIdEntries = Object.entries(
    flatEntityMaps.universalIdentifiersByApplicationId,
  ).map(([applicationId, universalIdentifiers]) => {
    const stillPresentUniversalIdentifiers = universalIdentifiers?.filter(
      (universalIdentifier) =>
        updatedIdByUniversalIdentifierEntries.some(
          ([existingUniversalIdentifier]) =>
            existingUniversalIdentifier === universalIdentifier,
        ),
    );

    return [applicationId, stillPresentUniversalIdentifiers];
  });

  return {
    byId: removePropertiesFromRecord(flatEntityMaps.byId, [entityToDeleteId]),
    idByUniversalIdentifier: Object.fromEntries(
      updatedIdByUniversalIdentifierEntries,
    ),
    universalIdentifiersByApplicationId: Object.fromEntries(
      updatedUniversalIdentifiersByApplicationIdEntries,
    ),
  };
};
