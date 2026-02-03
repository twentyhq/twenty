import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

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
  const universalIdentifierToDelete =
    flatEntityMapsToMutate.universalIdentifierById[entityToDeleteId];

  if (!isDefined(universalIdentifierToDelete)) {
    throw new FlatEntityMapsException(
      'deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow: entity to delete not found',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const entityToDelete =
    flatEntityMapsToMutate.byUniversalIdentifier[universalIdentifierToDelete];

  delete flatEntityMapsToMutate.byUniversalIdentifier[
    universalIdentifierToDelete
  ];

  delete flatEntityMapsToMutate.universalIdentifierById[entityToDeleteId];

  if (isDefined(entityToDelete?.applicationId)) {
    const universalIdentifiers =
      flatEntityMapsToMutate.universalIdentifiersByApplicationId[
        entityToDelete.applicationId
      ];

    if (isDefined(universalIdentifiers)) {
      const index = universalIdentifiers.indexOf(universalIdentifierToDelete);

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
