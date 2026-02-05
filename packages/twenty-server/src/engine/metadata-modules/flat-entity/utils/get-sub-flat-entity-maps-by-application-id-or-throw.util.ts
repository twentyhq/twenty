import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { getSubFlatEntityByIdsMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-by-ids-maps-or-throw.util';

export const getSubFlatEntityMapsByApplicationIdOrThrow = <
  T extends SyncableFlatEntity,
>({
  applicationId,
  flatEntityMaps,
}: {
  applicationId: string;
  flatEntityMaps: FlatEntityMaps<T>;
}) => {
  const allApplicationFlatEntity = findFlatEntitiesByApplicationId({
    applicationId,
    flatEntityMaps,
  });

  return getSubFlatEntityByIdsMapsOrThrow({
    flatEntityIds: allApplicationFlatEntity.map((flatEntity) => flatEntity.id),
    flatEntityMaps,
  });
};
