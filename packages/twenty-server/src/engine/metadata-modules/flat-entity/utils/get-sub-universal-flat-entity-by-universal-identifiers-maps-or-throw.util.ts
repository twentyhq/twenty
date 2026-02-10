import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

export const getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow = <
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
>({
  universalIdentifiers,
  universalFlatEntityMaps,
}: {
  universalFlatEntityMaps: UniversalFlatEntityMaps<T>;
  universalIdentifiers: string[];
}): UniversalFlatEntityMaps<T> => {
  const subUniversalFlatEntityMaps: UniversalFlatEntityMaps<T> = {
    byUniversalIdentifier: {},
  };

  for (const universalIdentifier of universalIdentifiers) {
    const flatEntity = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: universalFlatEntityMaps,
      universalIdentifier,
    });

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: flatEntity,
      universalFlatEntityMapsToMutate: subUniversalFlatEntityMaps,
    });
  }

  return subUniversalFlatEntityMaps;
};
