import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMapsV2 } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { getSubFlatEntityMapsByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-universal-identifier-or-throw.util';

export type FindManyFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrowArgs<
  T extends FlatEntity,
> = {
  flatEntityMaps: FlatEntityMapsV2<T>;
  flatEntityUniversalIdentifiers: string[];
};

export const findManyFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrow = <
  T extends FlatEntity,
>({
  flatEntityMaps,
  flatEntityUniversalIdentifiers,
}: FindManyFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrowArgs<T>): T[] => {
  const subFlatEntityMaps =
    getSubFlatEntityMapsByUniversalIdentifierOrThrow<T>({
      flatEntityUniversalIdentifiers,
      flatEntityMaps,
    });

  return Object.values(subFlatEntityMaps.byUniversalIdentifier).filter(
    isDefined,
  ) as T[];
};

