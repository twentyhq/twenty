import { type FromTo } from 'twenty-shared/types';

import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { type AllFlatEntities } from 'src/engine/core-modules/common/types/all-flat-entities.type';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

export type DeletedCreatedUpdatedMatrix<T extends AllFlatEntities> = {
  createdFlatEntityMaps: FlatEntityMaps<T>;
  deletedFlatEntityMaps: FlatEntityMaps<T>;
  updatedFlatEntityMaps: FromTo<FlatEntityMaps<T>>;
};

export type UniversalIdentifierItem = {
  universalIdentifier: string;
};

export const flatEntityDeletedCreatedUpdatedMatrixDispatcher = <
  T extends AllFlatEntities,
>({
  from,
  to,
  buildOptions,
}: FromTo<T[]> & {
  buildOptions: WorkspaceMigrationBuilderOptions;
}): DeletedCreatedUpdatedMatrix<T> => {
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
      if (!toMap.has(universalIdentifier)) {
        initialDispatcher.deletedFlatEntityMaps =
          addFlatEntityToFlatEntityMapsOrThrow({
            flatEntity: fromEntity,
            flatEntityMaps: initialDispatcher.deletedFlatEntityMaps,
          });
      }
    }
  }

  for (const [universalIdentifier, toFlatEntity] of toMap) {
    if (!fromMap.has(universalIdentifier)) {
      initialDispatcher.createdFlatEntityMaps =
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: toFlatEntity,
          flatEntityMaps: initialDispatcher.createdFlatEntityMaps,
        });
    }
  }

  for (const [universalIdentifier, fromFlatEntity] of fromMap) {
    const toFlatEntity = toMap.get(universalIdentifier);

    // TODO Perf improvement compare directly here to avoid mapping the whole workspaces + avoid compare duplication
    // Would not have FromTo anymore but an PropertyUpdates[]
    if (toFlatEntity) {
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
  }

  return initialDispatcher;
};
