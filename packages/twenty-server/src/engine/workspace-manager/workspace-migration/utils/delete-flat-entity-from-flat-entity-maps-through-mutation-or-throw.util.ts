import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type DeleteFlatEntityFromFlatEntityMapsThroughMutationOrThrowArgs<
  T extends SyncableFlatEntity,
> = {
  entityToDeleteId: string;
  flatEntityMapsToMutate: FlatEntityMaps<T>;
};

export const deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow = <
  T extends SyncableFlatEntity,
>({
  flatEntityMapsToMutate,
  entityToDeleteId,
}: DeleteFlatEntityFromFlatEntityMapsThroughMutationOrThrowArgs<T>): void => {
  const entityToDelete = flatEntityMapsToMutate.byId[entityToDeleteId];

  if (!isDefined(entityToDelete)) {
    throw new FlatEntityMapsException(
      'deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow: entity to delete not found',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  delete flatEntityMapsToMutate.byId[entityToDeleteId];

  delete flatEntityMapsToMutate.idByUniversalIdentifier[
    entityToDelete.universalIdentifier
  ];

  if (isDefined(entityToDelete.applicationId)) {
    const universalIdentifiers =
      flatEntityMapsToMutate.universalIdentifiersByApplicationId[
        entityToDelete.applicationId
      ];

    if (isDefined(universalIdentifiers)) {
      const index = universalIdentifiers.indexOf(
        entityToDelete.universalIdentifier,
      );

      if (index !== -1) {
        universalIdentifiers.splice(index, 1);
      }

      if (universalIdentifiers.length === 0) {
        delete flatEntityMapsToMutate.universalIdentifiersByApplicationId[
          entityToDelete.applicationId
        ];
      }
    }
  }
};
