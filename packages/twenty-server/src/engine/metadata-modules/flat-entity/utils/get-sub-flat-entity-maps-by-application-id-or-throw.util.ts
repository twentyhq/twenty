import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { getFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/get-flat-entities-by-application-id.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-or-throw.util';

export const getSubFlatEntityMapsByApplicationIdOrThrow = <
  T extends SyncableFlatEntity,
>({
  applicationId,
  flatEntityMaps,
}: {
  applicationId: string;
  flatEntityMaps: FlatEntityMaps<T>;
}) => {
  const allApplicationFlatEntity = getFlatEntitiesByApplicationId({
    applicationId,
    flatEntityMaps,
  });

  return getSubFlatEntityMapsOrThrow({
    flatEntityIds: allApplicationFlatEntity.map((flatEntity) => flatEntity.id),
    flatEntityMaps,
  });
};
