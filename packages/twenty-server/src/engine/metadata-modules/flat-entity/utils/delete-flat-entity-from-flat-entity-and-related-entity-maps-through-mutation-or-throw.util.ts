import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { deleteUniversalFlatEntityFromUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';

type DeleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrowArgs<
  T extends AllMetadataName,
> = {
  metadataName: T;
  flatEntity: MetadataFlatEntity<T>;
  flatEntityAndRelatedMapsToMutate: MetadataFlatEntityAndRelatedFlatEntityMaps<T>;
};

export const deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow =
  <T extends AllMetadataName>({
    metadataName,
    flatEntity,
    flatEntityAndRelatedMapsToMutate,
  }: DeleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrowArgs<T>) => {
    deleteUniversalFlatEntityFromUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
      {
        metadataName,
        universalFlatEntity: flatEntity,
        universalFlatEntityAndRelatedMapsToMutate:
          flatEntityAndRelatedMapsToMutate,
      },
    );

    const manyToOneRelations = ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName];

    for (const relationPropertyName of Object.keys(manyToOneRelations)) {
      const relation = manyToOneRelations[
        relationPropertyName as keyof typeof manyToOneRelations
      ] as {
        metadataName: AllMetadataName;
        foreignKey: string;
        inverseOneToManyProperty: string | null;
      } | null;

      if (!isDefined(relation)) {
        continue;
      }

      const {
        metadataName: relatedMetadataName,
        foreignKey,
        inverseOneToManyProperty,
      } = relation;

      if (!isDefined(inverseOneToManyProperty)) {
        continue;
      }

      const oneToManyRelations =
        ALL_ONE_TO_MANY_METADATA_RELATIONS[relatedMetadataName];

      const inverseRelation = oneToManyRelations[
        inverseOneToManyProperty as keyof typeof oneToManyRelations
      ] as {
        flatEntityForeignKeyAggregator: string;
      } | null;

      if (!isDefined(inverseRelation)) {
        continue;
      }

      const { flatEntityForeignKeyAggregator } = inverseRelation;

      const relatedFlatEntityMapsKey =
        getMetadataFlatEntityMapsKey(relatedMetadataName);

      const relatedFlatEntityMetadataMaps = flatEntityAndRelatedMapsToMutate[
        relatedFlatEntityMapsKey as MetadataRelatedFlatEntityMapsKeys<T>
      ] as FlatEntityMaps<MetadataFlatEntity<typeof relatedMetadataName>>;

      const flatEntityRelatedEntityForeignKeyValue = (
        flatEntity as unknown as Record<string, string | undefined>
      )[foreignKey];

      if (!isDefined(flatEntityRelatedEntityForeignKeyValue)) {
        continue;
      }

      const relatedFlatEntity = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatEntityRelatedEntityForeignKeyValue,
        flatEntityMaps: relatedFlatEntityMetadataMaps,
      });

      if (!isDefined(relatedFlatEntity)) {
        continue;
      }

      if (
        !Object.prototype.hasOwnProperty.call(
          relatedFlatEntity,
          flatEntityForeignKeyAggregator,
        )
      ) {
        throw new FlatEntityMapsException(
          `Should never occur, invalid flat entity typing. flat ${relatedMetadataName} should contain ${flatEntityForeignKeyAggregator}`,
          FlatEntityMapsExceptionCode.ENTITY_MALFORMED,
        );
      }

      const updatedRelatedEntity = {
        ...relatedFlatEntity,
        [flatEntityForeignKeyAggregator]: (
          (relatedFlatEntity as unknown as Record<string, string[]>)[
            flatEntityForeignKeyAggregator
          ] ?? []
        ).filter((id) => id !== flatEntity.id),
      };

      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: updatedRelatedEntity,
        flatEntityMapsToMutate: relatedFlatEntityMetadataMaps,
      });
    }
  };
