import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_RELATED_METADATA_BY_FOREIGN_KEY } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-many-to-one-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

type AddFlatEntityToFlatEntityAndRelatedEntityMapsOrThrowArgs<
  T extends AllMetadataName,
> = {
  metadataName: T;
  flatEntity: MetadataFlatEntity<T>;
  flatEntityAndRelatedMaps: MetadataFlatEntityAndRelatedFlatEntityMaps<T>;
};
export const addFlatEntityToFlatEntityAndRelatedEntityMapsOrThrow = <
  T extends AllMetadataName,
>({
  metadataName,
  flatEntity,
  flatEntityAndRelatedMaps: initialFlatEntityAndRelatedMaps,
}: AddFlatEntityToFlatEntityAndRelatedEntityMapsOrThrowArgs<T>): MetadataFlatEntityAndRelatedFlatEntityMaps<T> => {
  const flatEntityMapsKey: keyof MetadataFlatEntityAndRelatedFlatEntityMaps<T> =
    getMetadataFlatEntityMapsKey(metadataName);

  const updatedFlatEntityMaps = addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity,
    flatEntityMaps: initialFlatEntityAndRelatedMaps[flatEntityMapsKey],
  });

  // TODO refactor
  const manyToOneRelatedMetadataName = Object.entries(
    ALL_METADATA_RELATED_METADATA_BY_FOREIGN_KEY[metadataName],
  );

  return manyToOneRelatedMetadataName.reduce(
    (flatEntityAndRelatedMaps, [relatedMetadataName, foreignKey]) => {
      const relatedFlatEntityMapsKey = getMetadataFlatEntityMapsKey(
        relatedMetadataName as AllMetadataName,
      );
      const relatedFLatEntityMetadataMaps =
        flatEntityAndRelatedMaps[relatedFlatEntityMapsKey];

      const relatedFlatEntity = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatEntity[
          foreignKey as keyof MetadataFlatEntity<T>
        ] as string,
        flatEntityMaps: relatedFLatEntityMetadataMaps,
      });

      const foreignKeyAggregatorProperty = `${metadataName}Ids`;

      if (
        !Object.prototype.hasOwnProperty.call(
          relatedFlatEntity,
          foreignKeyAggregatorProperty,
        )
      ) {
        throw new FlatEntityMapsException(
          'Should never occur, invalid cached format',
          FlatEntityMapsExceptionCode.ENTITY_MALFORMED,
        );
      }

      const updatedRelatedFlatEntityMetadataMaps = {
        ...relatedFlatEntity,
        [foreignKeyAggregatorProperty]: [
          ...(relatedFlatEntity[
            foreignKeyAggregatorProperty as keyof MetadataFlatEntity<T>
          ] as string[]),
          flatEntity.id,
        ],
      };

      return {
        ...flatEntityAndRelatedMaps,
        [relatedFlatEntityMapsKey]: updatedRelatedFlatEntityMetadataMaps,
      };
    },
    {
      ...initialFlatEntityAndRelatedMaps,
      [flatEntityMapsKey]: updatedFlatEntityMaps,
    },
  );
};
