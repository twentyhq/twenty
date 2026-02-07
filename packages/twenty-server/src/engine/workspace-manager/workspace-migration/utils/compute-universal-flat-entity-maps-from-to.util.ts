import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-universal-flat-entity-by-universal-identifiers-maps-or-throw.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-maps-through-mutation-or-throw.util';
import { replaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/replace-universal-flat-entity-in-universal-flat-entity-maps-through-mutation-or-throw.util';

export type ComputeUniversalFlatEntityMapsFromToArgs<
  T extends AllMetadataName,
> = {
  flatEntityMaps: MetadataUniversalFlatEntityMaps<T>;
} & FlatEntityToCreateDeleteUpdate<T>;

export const computeUniversalFlatEntityMapsFromTo = <
  T extends AllMetadataName,
>({
  flatEntityMaps,
  flatEntityToCreate,
  flatEntityToDelete,
  flatEntityToUpdate,
}: ComputeUniversalFlatEntityMapsFromToArgs<T>): {
  from: MetadataUniversalFlatEntityMaps<T>;
  to: MetadataUniversalFlatEntityMaps<T>;
} => {
  const fromFlatEntityMaps =
    flatEntityToDelete.length > 0
      ? getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow({
          universalIdentifiers: [
            ...flatEntityToDelete,
            ...flatEntityToUpdate,
          ].map(({ universalIdentifier }) => universalIdentifier),
          universalFlatEntityMaps: flatEntityMaps,
        })
      : flatEntityMaps;

  const toFlatEntityMaps: MetadataUniversalFlatEntityMaps<T> =
    structuredClone(fromFlatEntityMaps);

  for (const flatEntity of flatEntityToDelete) {
    deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow({
      universalIdentifierToDelete: flatEntity.universalIdentifier,
      universalFlatEntityMapsToMutate: toFlatEntityMaps,
    });
  }

  for (const flatEntity of flatEntityToUpdate) {
    replaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: flatEntity,
      universalFlatEntityMapsToMutate: toFlatEntityMaps,
    });
  }

  for (const flatEntity of flatEntityToCreate) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: flatEntity,
      universalFlatEntityMapsToMutate: toFlatEntityMaps,
    });
  }

  return {
    from: fromFlatEntityMaps,
    to: toFlatEntityMaps,
  };
};
