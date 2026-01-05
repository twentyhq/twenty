import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';

type AddFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrowArgs<
  T extends AllMetadataName,
> = {
  metadataName: T;
  flatEntity: MetadataFlatEntity<T>;
  flatEntityAndRelatedMapsToMutate: MetadataFlatEntityAndRelatedFlatEntityMaps<T>;
};
export const addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow =
  <T extends AllMetadataName>({
    metadataName,
    flatEntity,
    flatEntityAndRelatedMapsToMutate,
  }: AddFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrowArgs<T>) => {
    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity,
      flatEntityMapsToMutate:
        flatEntityAndRelatedMapsToMutate[flatEntityMapsKey],
    });

    const manyToOneRelations = Object.values(
      ALL_METADATA_RELATIONS[metadataName].manyToOne,
    ) as Array<{
      metadataName: AllMetadataName;
      flatEntityForeignKeyAggregator: keyof MetadataFlatEntity<AllMetadataName>;
      foreignKey: keyof MetadataFlatEntity<T>;
    } | null>;

    for (const relation of manyToOneRelations) {
      if (!isDefined(relation)) {
        continue;
      }

      const {
        metadataName: relatedMetadataName,
        flatEntityForeignKeyAggregator,
        foreignKey,
      } = relation;

      if (!isDefined(flatEntityForeignKeyAggregator)) {
        continue;
      }

      const relatedFlatEntityMapsKey =
        getMetadataFlatEntityMapsKey(relatedMetadataName);
      const relatedFlatEntityMetadataMaps = flatEntityAndRelatedMapsToMutate[
        relatedFlatEntityMapsKey as MetadataRelatedFlatEntityMapsKeys<T>
      ] as FlatEntityMaps<MetadataFlatEntity<typeof relatedMetadataName>>;

      const flatEntityRelatedEntityForeignKeyValue = flatEntity[foreignKey] as
        | string
        | undefined;

      if (!isDefined(flatEntityRelatedEntityForeignKeyValue)) {
        continue;
      }

      const relatedFlatEntity = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatEntityRelatedEntityForeignKeyValue,
        flatEntityMaps: relatedFlatEntityMetadataMaps,
      });

      if (
        !Object.prototype.hasOwnProperty.call(
          relatedFlatEntity,
          flatEntityForeignKeyAggregator,
        )
      ) {
        throw new FlatEntityMapsException(
          `Should never occur, invalid flat entity typing. flat ${metadataName} should contain ${flatEntityForeignKeyAggregator}`,
          FlatEntityMapsExceptionCode.ENTITY_MALFORMED,
        );
      }

      const updatedRelatedEntity = {
        ...relatedFlatEntity,
        [flatEntityForeignKeyAggregator]: [
          ...(relatedFlatEntity[
            flatEntityForeignKeyAggregator
          ] as unknown as string[]),
          flatEntity.id,
        ],
      };

      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: updatedRelatedEntity,
        flatEntityMapsToMutate: relatedFlatEntityMetadataMaps,
      });
    }
  };
