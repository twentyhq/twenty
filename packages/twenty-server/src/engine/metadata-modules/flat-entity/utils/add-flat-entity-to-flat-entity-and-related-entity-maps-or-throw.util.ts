import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_RELATED_METADATA_BY_FOREIGN_KEY } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-many-to-one-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';
import { isDefined } from 'twenty-shared/utils';

type AddFlatEntityToFlatEntityAndRelatedEntityMapsOrThrowArgs<
  T extends AllMetadataName,
> = {
  metadataName: T;
  flatEntity: MetadataFlatEntity<T>;
  flatEntityAndRelatedMapsToMutate: MetadataFlatEntityAndRelatedFlatEntityMaps<T>;
};
export const addFlatEntityToFlatEntityAndRelatedEntityMapsOrThrow = <
  T extends AllMetadataName,
>({
  metadataName,
  flatEntity,
  flatEntityAndRelatedMapsToMutate,
}: AddFlatEntityToFlatEntityAndRelatedEntityMapsOrThrowArgs<T>) => {
  const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);

  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity,
    flatEntityMapsToMutate: flatEntityAndRelatedMapsToMutate[flatEntityMapsKey],
  });

  const manyToOneRelatedMetadataName = Object.entries(
    ALL_METADATA_RELATED_METADATA_BY_FOREIGN_KEY[metadataName],
  ) as Array<[keyof MetadataFlatEntity<T>, AllMetadataName]>;

  for (const [
    foreignKey,
    relatedMetadataName,
  ] of manyToOneRelatedMetadataName) {
    const relatedFlatEntityMapsKey =
      getMetadataFlatEntityMapsKey(relatedMetadataName);
    // @ts-expect-error TODO improve
    const relatedFLatEntityMetadataMaps = flatEntityAndRelatedMapsToMutate[
      relatedFlatEntityMapsKey
    ] as FlatEntityMaps<MetadataFlatEntity<typeof relatedMetadataName>>;

    const flatEntityRelatedEntityForeignKeyValue = flatEntity[foreignKey] as
      | string
      | undefined;
    if (!isDefined(flatEntityRelatedEntityForeignKeyValue)) {
      continue;
    }

    const relatedFlatEntity = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatEntityRelatedEntityForeignKeyValue,
      flatEntityMaps: relatedFLatEntityMetadataMaps,
    });

    // Does not work here :thinking:
    const flatForeignKeyAggregatorProperty = `${metadataName as string}Ids`;
    if (
      !Object.prototype.hasOwnProperty.call(
        relatedFlatEntity,
        flatForeignKeyAggregatorProperty,
      )
    ) {
      throw new FlatEntityMapsException(
        `Should never occur, invalid flat entity typing. flat ${metadataName} should contain ${flatForeignKeyAggregatorProperty}`,
        FlatEntityMapsExceptionCode.ENTITY_MALFORMED,
      );
    }

    const updatedRelatedEntity = {
      ...relatedFlatEntity,
      [flatForeignKeyAggregatorProperty]: [
        // @ts-expect-error TODO improve
        ...(relatedFlatEntity[flatForeignKeyAggregatorProperty] as string[]),
        flatEntity.id,
      ],
    };

    replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
      flatEntity: updatedRelatedEntity,
      flatEntityMapsToMutate: relatedFLatEntityMetadataMaps,
    });
  }
};
