import { type FromTo } from 'twenty-shared/types';

import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/metadata-modules/flat-entity/constant/empty-flat-entity-maps.constant';
import {
  AllFlatEntityConfigurationByMetadataName,
  AllMetadataName,
  MetadataFlatEntity,
  MetadataFlatEntityMaps,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { compareTwoFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/compare-two-flat-entity.util';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';
import { isDefined } from 'twenty-shared/utils';

export type DeletedCreatedUpdatedMatrix<T extends AllMetadataName> = {
  createdFlatEntityMaps: MetadataFlatEntityMaps<T>;
  deletedFlatEntityMaps: MetadataFlatEntityMaps<T>;
  updatedFlatEntityMaps: FromTo<MetadataFlatEntityMaps<T>>;
};

export type UniversalIdentifierItem = {
  universalIdentifier: string;
};

type FlatEntityDeletedCreatedUpdatedMatrixDispatcherArgs<
  T extends AllMetadataName,
> = FromTo<MetadataFlatEntity<T>[]> & {
  buildOptions: WorkspaceMigrationBuilderOptions;
  comparisonOptions: Pick<
    AllFlatEntityConfigurationByMetadataName[T]['configuration'],
    'propertiesToCompare' | 'propertiesToStringify'
  >;
};

export const flatEntityDeletedCreatedUpdatedMatrixDispatcher = <
  T extends AllMetadataName,
>({
  from,
  to,
  buildOptions,
  comparisonOptions: { propertiesToCompare, propertiesToStringify },
}: FlatEntityDeletedCreatedUpdatedMatrixDispatcherArgs<T>): DeletedCreatedUpdatedMatrix<T> => {
  const initialDispatcher: DeletedCreatedUpdatedMatrix<T> = {
    createdFlatEntityMaps: EMPTY_FLAT_ENTITY_MAPS,
    deletedFlatEntityMaps: EMPTY_FLAT_ENTITY_MAPS,
    updatedFlatEntityMaps: {
      from: EMPTY_FLAT_ENTITY_MAPS,
      to: EMPTY_FLAT_ENTITY_MAPS,
    },
  };

  const fromMap = new Map(from.map((obj) => [obj.universalIdentifier, obj]));
  const toMap = new Map(to.map((obj) => [obj.universalIdentifier, obj]));

  if (buildOptions.inferDeletionFromMissingEntities) {
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

  for (const [universalIdentifier, fromFlatEntity] of fromMap) {
    const toFlatEntity = toMap.get(universalIdentifier);
    // TODO Perf improvement compare directly here to avoid mapping the whole workspaces + avoid compare duplication
    // Would not have FromTo anymore but an PropertyUpdates[]
    if (!isDefined(toFlatEntity)) {
      continue;
    }
    const updates = compareTwoFlatEntity({
      fromFlatEntity,
      toFlatEntity,
      propertiesToCompare,
      propertiesToStringify,
    });

    if (updates.length === 0) {
      continue;
    }

    initialDispatcher.updatedFlatEntityMaps.from =
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: fromFlatEntity,
        flatEntityMaps: initialDispatcher.updatedFlatEntityMaps.from,
      });

    initialDispatcher.updatedFlatEntityMaps.to =
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: toFlatEntity,
        flatEntityMaps: initialDispatcher.updatedFlatEntityMaps.to,
      });
  }

  return initialDispatcher;
};
