import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { getSubFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/get-sub-flat-entity-maps-through-mutation-or-throw.util';

export const getSubFlatEntityMapsThroughMutation = <T extends FlatEntity>({
  flatEntityIds,
  flatEntityMaps,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityIds: string[];
}): FlatEntityMaps<T> | undefined => {
  try {
    return getSubFlatEntityMapsThroughMutationOrThrow({
      flatEntityIds,
      flatEntityMaps,
    });
  } catch {
    return undefined;
  }
};
