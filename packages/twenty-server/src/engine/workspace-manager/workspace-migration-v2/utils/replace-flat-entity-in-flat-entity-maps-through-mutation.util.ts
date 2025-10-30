import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';

export type ReplaceFlatEntityInFlatEntityMapsThroughMutationArgs<
  T extends FlatEntity,
> = {
  flatEntity: T;
  flatEntityMaps: FlatEntityMaps<T>;
};

export const replaceFlatEntityInFlatEntityMapsThroughMutation = <
  T extends FlatEntity,
>({
  flatEntity,
  flatEntityMaps,
}: ReplaceFlatEntityInFlatEntityMapsThroughMutationArgs<T>): boolean => {
  try {
    replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
      flatEntity,
      flatEntityMaps,
    });

    return true;
  } catch {
    return false;
  }
};
