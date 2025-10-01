import { type FromTo } from 'twenty-shared/types';

import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { type AllFlatEntities } from 'src/engine/core-modules/common/types/all-flat-entities.type';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';

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
}: FromTo<T[]>): DeletedCreatedUpdatedMatrix<T> => {
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

  for (const [identifier, fromEntity] of fromMap) {
    if (!toMap.has(identifier)) {
      initialDispatcher.deletedFlatEntityMaps =
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: fromEntity,
          flatEntityMaps: initialDispatcher.deletedFlatEntityMaps,
        });
    }
  }

  for (const [identifier, toFlatEntity] of toMap) {
    if (!fromMap.has(identifier)) {
      initialDispatcher.createdFlatEntityMaps =
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: toFlatEntity,
          flatEntityMaps: initialDispatcher.createdFlatEntityMaps,
        });
    }
  }

  for (const [identifier, fromFlatEntity] of fromMap) {
    const toFlatEntity = toMap.get(identifier);

    // TODO Perf improvement compare directly here to avoid mapping the whole workspaces + avoid compare duplication
    // Would not have FromTo anymoe but an PropertyUpdates[]
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
