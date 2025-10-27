import { type FlatEntityMapsV2 } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsV2OrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-v2-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsV2OrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-v2-or-throw.util';

export type ReplaceFlatEntityInFlatEntityMapsV2OrThrowArgs<
  T extends FlatEntity,
> = {
  flatEntity: T;
  flatEntityMaps: FlatEntityMapsV2<T>;
};

export const replaceFlatEntityInFlatEntityMapsV2OrThrow = <
  T extends FlatEntity,
>({
  flatEntity,
  flatEntityMaps,
}: ReplaceFlatEntityInFlatEntityMapsV2OrThrowArgs<T>): FlatEntityMapsV2<T> => {
  const flatEntityMapsToReplace = deleteFlatEntityFromFlatEntityMapsV2OrThrow({
    flatEntityMaps,
    entityToDeleteUniversalIdentifier: flatEntity.universalIdentifier,
  });

  return addFlatEntityToFlatEntityMapsV2OrThrow({
    flatEntity,
    flatEntityMaps: flatEntityMapsToReplace,
  });
};

