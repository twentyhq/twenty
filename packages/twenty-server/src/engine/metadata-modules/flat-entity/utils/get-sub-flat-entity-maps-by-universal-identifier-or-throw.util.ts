import { EMPTY_FLAT_ENTITY_MAPS_V2 } from 'src/engine/metadata-modules/flat-entity/constant/empty-flat-entity-maps-v2.constant';
import { type FlatEntityMapsV2 } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsV2OrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-v2-or-throw.util';
import { findFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-in-flat-entity-maps-or-throw.util';

export const getSubFlatEntityMapsByUniversalIdentifierOrThrow = <
  T extends FlatEntity,
>({
  flatEntityUniversalIdentifiers,
  flatEntityMaps,
}: {
  flatEntityMaps: FlatEntityMapsV2<T>;
  flatEntityUniversalIdentifiers: string[];
}): FlatEntityMapsV2<T> => {
  return flatEntityUniversalIdentifiers.reduce<FlatEntityMapsV2<T>>(
    (acc, flatEntityUniversalIdentifier) => {
      const flatEntity =
        findFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrow({
          flatEntityUniversalIdentifier,
          flatEntityMaps,
        });

      return addFlatEntityToFlatEntityMapsV2OrThrow({
        flatEntity,
        flatEntityMaps: acc,
      });
    },
    EMPTY_FLAT_ENTITY_MAPS_V2,
  );
};

