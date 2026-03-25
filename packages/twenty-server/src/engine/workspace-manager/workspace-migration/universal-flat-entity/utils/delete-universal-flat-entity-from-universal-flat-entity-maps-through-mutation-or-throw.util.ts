import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export type DeleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrowArgs<
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
> = {
  universalIdentifierToDelete: string;
  universalFlatEntityMapsToMutate: UniversalFlatEntityMaps<T>;
};

export const deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow =
  <T extends SyncableFlatEntity | UniversalSyncableFlatEntity>({
    universalFlatEntityMapsToMutate,
    universalIdentifierToDelete,
  }: DeleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrowArgs<T>): void => {
    const entityToDelete =
      universalFlatEntityMapsToMutate.byUniversalIdentifier[
        universalIdentifierToDelete
      ];

    if (!isDefined(entityToDelete)) {
      throw new FlatEntityMapsException(
        'deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow: entity to delete not found',
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    delete universalFlatEntityMapsToMutate.byUniversalIdentifier[
      universalIdentifierToDelete
    ];
  };
