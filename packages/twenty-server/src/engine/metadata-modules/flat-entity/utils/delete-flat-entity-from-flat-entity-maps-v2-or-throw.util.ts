import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMapsV2 } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type DeleteFlatEntityFromFlatEntityMapsV2OrThrowArgs<
  T extends FlatEntity,
> = {
  entityToDeleteUniversalIdentifier: string;
  flatEntityMaps: FlatEntityMapsV2<T>;
};

export const deleteFlatEntityFromFlatEntityMapsV2OrThrow = <
  T extends FlatEntity,
>({
  flatEntityMaps,
  entityToDeleteUniversalIdentifier,
}: DeleteFlatEntityFromFlatEntityMapsV2OrThrowArgs<T>): FlatEntityMapsV2<T> => {
  const existingFlatEntity =
    flatEntityMaps.byUniversalIdentifier[entityToDeleteUniversalIdentifier];

  if (!isDefined(existingFlatEntity)) {
    throw new FlatEntityMapsException(
      'deleteFlatEntityFromFlatEntityMapsV2OrThrow: entity to delete not found',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const universalIdentifiers =
    flatEntityMaps.universalIdentifiersByApplicationId[
      // TODO prastoin make non nullable
      existingFlatEntity.applicationId!
    ] ?? [];

  const updatedUniversalIdentifiers = universalIdentifiers?.filter(
    (universalIdentifier) =>
      universalIdentifier !== entityToDeleteUniversalIdentifier,
  );

  const updatedUniversalIdentifiersByApplicationId =
    updatedUniversalIdentifiers.length > 0
      ? {
          ...flatEntityMaps.universalIdentifiersByApplicationId,
          // TODO prastoin make non nullable
          [existingFlatEntity.applicationId!]: updatedUniversalIdentifiers,
        }
      : removePropertiesFromRecord(
          flatEntityMaps.universalIdentifiersByApplicationId,
          // TODO prastoin make non nullable
          [existingFlatEntity.applicationId!],
        );

  return {
    byUniversalIdentifier: removePropertiesFromRecord(
      flatEntityMaps.byUniversalIdentifier,
      [entityToDeleteUniversalIdentifier],
    ),
    idByUniversalIdentifier: removePropertiesFromRecord(
      flatEntityMaps.idByUniversalIdentifier,
      [entityToDeleteUniversalIdentifier],
    ),
    universalIdentifiersByApplicationId:
      updatedUniversalIdentifiersByApplicationId,
  };
};
