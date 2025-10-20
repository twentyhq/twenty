import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-and-stringify.constant';
import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/metadata-modules/flat-entity/constant/empty-flat-entity-maps.constant';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { type FlatEntityPropertiesToStringify } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-stringify.type';
import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { compareTwoFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/compare-two-flat-entity.util';
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
    createdFlatEntityMaps: EMPTY_FLAT_ENTITY_MAPS,
    deletedFlatEntityMaps: EMPTY_FLAT_ENTITY_MAPS,
    updatedFlatEntityMaps: { byId: {} },
  };

  const fromMap = new Map(from.map((obj) => [obj.universalIdentifier, obj]));
  const toMap = new Map(to.map((obj) => [obj.universalIdentifier, obj]));

  if (buildOptions.inferDeletionFromMissingEntities?.[metadataName]) {
    for (const [universalIdentifier, fromEntity] of fromMap) {
      if (toMap.has(universalIdentifier)) {
        continue;
      }
      initialDispatcher.deletedFlatEntityMaps =
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: fromEntity,
          flatEntityMaps: initialDispatcher.deletedFlatEntityMaps,
        });
    }
  }

  for (const [universalIdentifier, toFlatEntity] of toMap) {
    if (fromMap.has(universalIdentifier)) {
      continue;
    }
    initialDispatcher.createdFlatEntityMaps =
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: toFlatEntity,
        flatEntityMaps: initialDispatcher.createdFlatEntityMaps,
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
