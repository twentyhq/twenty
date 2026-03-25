import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-maps-through-mutation-or-throw.util';

export type ReplaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrowArgs<
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
> = {
  universalFlatEntity: T;
  universalFlatEntityMapsToMutate: UniversalFlatEntityMaps<T>;
};

export const replaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrow =
  <T extends SyncableFlatEntity | UniversalSyncableFlatEntity>({
    universalFlatEntity,
    universalFlatEntityMapsToMutate,
  }: ReplaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrowArgs<T>): void => {
    deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntityMapsToMutate,
      universalIdentifierToDelete: universalFlatEntity.universalIdentifier,
    });

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity,
      universalFlatEntityMapsToMutate,
    });
  };
