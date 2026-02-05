import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-by-metadata-name.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { compareTwoFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/compare-two-flat-entity.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { shouldInferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration/utils/should-infer-deletion-from-missing-entities.util';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export type DeletedCreatedUpdatedMatrix<T extends AllMetadataName> = {
  createdFlatEntityMaps: MetadataUniversalFlatEntityMaps<T>;
  deletedFlatEntityMaps: MetadataUniversalFlatEntityMaps<T>;
  updatedFlatEntityMaps: {
    byUniversalIdentifier: Record<
      string,
      {
        update: UniversalFlatEntityUpdate<T>;
        // TMP remove when maps is universal based
        id: string;
      }
    >;
  };
};

export type UniversalIdentifierItem = {
  universalIdentifier: string;
};

type FlatEntityDeletedCreatedUpdatedMatrixDispatcherArgs<
  T extends AllMetadataName,
> = FromTo<MetadataUniversalFlatEntity<T>[]> & {
  metadataName: T;
  buildOptions: WorkspaceMigrationBuilderOptions;
};

export const flatEntityDeletedCreatedUpdatedMatrixDispatcher = <
  T extends AllMetadataName,
>({
  from,
  to,
  metadataName,
  buildOptions,
}: FlatEntityDeletedCreatedUpdatedMatrixDispatcherArgs<T>): DeletedCreatedUpdatedMatrix<T> => {
  const initialDispatcher: DeletedCreatedUpdatedMatrix<T> = {
    createdFlatEntityMaps: createEmptyFlatEntityMaps(),
    deletedFlatEntityMaps: createEmptyFlatEntityMaps(),
    updatedFlatEntityMaps: { byUniversalIdentifier: {} },
  };

  const fromMap = new Map(from.map((obj) => [obj.universalIdentifier, obj]));
  const toMap = new Map(to.map((obj) => [obj.universalIdentifier, obj]));

  if (shouldInferDeletionFromMissingEntities({ buildOptions, metadataName })) {
    for (const [universalIdentifier, fromEntity] of fromMap) {
      if (toMap.has(universalIdentifier)) {
        continue;
      }

      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: fromEntity,
        universalFlatEntityMapsToMutate:
          initialDispatcher.deletedFlatEntityMaps,
      });
    }
  }

  for (const [universalIdentifier, toFlatEntity] of toMap) {
    if (fromMap.has(universalIdentifier)) {
      continue;
    }
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: toFlatEntity,
      universalFlatEntityMapsToMutate: initialDispatcher.createdFlatEntityMaps,
    });
  }

  const { propertiesToCompare, propertiesToStringify } =
    ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME[metadataName];

  for (const [universalIdentifier, fromFlatEntity] of fromMap) {
    const toFlatEntity = toMap.get(universalIdentifier);

    if (!isDefined(toFlatEntity)) {
      continue;
    }
    const update = compareTwoFlatEntity({
      fromFlatEntity,
      toFlatEntity,
      propertiesToCompare,
      propertiesToStringify,
    });

    if (!isDefined(update)) {
      continue;
    }

    initialDispatcher.updatedFlatEntityMaps.byUniversalIdentifier[
      fromFlatEntity.universalIdentifier
    ] = {
      // TODO to handle as we want api metadata to allow doing so anyway
      id: toFlatEntity.id,
      update,
    };
  }

  return initialDispatcher;
};
