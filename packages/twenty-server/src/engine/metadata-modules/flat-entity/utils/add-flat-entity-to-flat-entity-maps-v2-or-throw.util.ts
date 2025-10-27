import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMapsV2 } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

type AddFlatEntityToFlatEntityMapsV2OrThrowArgs<T extends FlatEntity> = {
  flatEntity: T;
  flatEntityMaps: FlatEntityMapsV2<T>;
};

export const addFlatEntityToFlatEntityMapsV2OrThrow = <T extends FlatEntity>({
  flatEntity,
  flatEntityMaps,
}: AddFlatEntityToFlatEntityMapsV2OrThrowArgs<T>): FlatEntityMapsV2<T> => {
  if (
    isDefined(
      flatEntityMaps.byUniversalIdentifier[flatEntity.universalIdentifier],
    )
  ) {
    throw new FlatEntityMapsException(
      'addFlatEntityToFlatEntityMapsV2OrThrow: flat entity to add already exists',
      FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
    );
  }

  const updatedUniversalIdentifiersByApplicationId = {
    ...flatEntityMaps.universalIdentifiersByApplicationId,
    // TODO prastoin make non nullable
    [flatEntity.applicationId!]: [
      ...new Set([
        ...(flatEntityMaps.universalIdentifiersByApplicationId?.[
          // TODO prastoin make non nullable
          flatEntity.applicationId!
        ] ?? []),
        flatEntity.universalIdentifier,
      ]),
    ],
  };

  return {
    byUniversalIdentifier: {
      ...flatEntityMaps.byUniversalIdentifier,
      [flatEntity.universalIdentifier]: flatEntity,
    },
    idByUniversalIdentifier: {
      ...flatEntityMaps.idByUniversalIdentifier,
      [flatEntity.universalIdentifier]: flatEntity.id,
    },
    universalIdentifiersByApplicationId:
      updatedUniversalIdentifiersByApplicationId,
  };
};
