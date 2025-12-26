import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-and-stringify.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { type FlatEntityPropertiesToStringify } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-stringify.type';
import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { compareTwoFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/compare-two-flat-entity.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';
import { shouldInferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration-v2/utils/should-infer-deletion-from-missing-entities.util';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

export type DeletedCreatedUpdatedMatrix<T extends AllMetadataName> = {
  createdFlatEntityMaps: MetadataFlatEntityMaps<T>;
  deletedFlatEntityMaps: MetadataFlatEntityMaps<T>;
  updatedFlatEntityMaps: {
    byId: Record<
      string,
      {
        updates: FlatEntityPropertiesUpdates<T>;
      }
    >;
  };
};

export type UniversalIdentifierItem = {
  universalIdentifier: string;
};

type FlatEntityDeletedCreatedUpdatedMatrixDispatcherArgs<
  T extends AllMetadataName,
> = FromTo<MetadataFlatEntity<T>[]> & {
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
    updatedFlatEntityMaps: { byId: {} },
  };

  const fromMap = new Map(from.map((obj) => [obj.universalIdentifier, obj]));
  const toMap = new Map(to.map((obj) => [obj.universalIdentifier, obj]));

  if (shouldInferDeletionFromMissingEntities({ buildOptions, metadataName })) {
    for (const [universalIdentifier, fromEntity] of fromMap) {
      if (toMap.has(universalIdentifier)) {
        continue;
      }
      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: fromEntity,
        flatEntityMapsToMutate: initialDispatcher.deletedFlatEntityMaps,
      });
    }
  }

  for (const [universalIdentifier, toFlatEntity] of toMap) {
    if (fromMap.has(universalIdentifier)) {
      continue;
    }
    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: toFlatEntity,
      flatEntityMapsToMutate: initialDispatcher.createdFlatEntityMaps,
    });
  }

  const { propertiesToCompare, propertiesToStringify } =
    ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[metadataName];

  for (const [universalIdentifier, fromFlatEntity] of fromMap) {
    const toFlatEntity = toMap.get(universalIdentifier);

    if (!isDefined(toFlatEntity)) {
      continue;
    }
    const updates = compareTwoFlatEntity({
      fromFlatEntity,
      toFlatEntity,
      propertiesToCompare: propertiesToCompare as unknown as Extract<
        FlatEntityPropertiesToCompare<T>,
        keyof MetadataFlatEntity<T>
      >[],
      propertiesToStringify: propertiesToStringify as unknown as Extract<
        FlatEntityPropertiesToStringify<T>,
        keyof MetadataFlatEntity<T>
      >[],
    });

    if (updates.length === 0) {
      continue;
    }

    initialDispatcher.updatedFlatEntityMaps.byId[toFlatEntity.id] = {
      updates,
    };
  }

  return initialDispatcher;
};
