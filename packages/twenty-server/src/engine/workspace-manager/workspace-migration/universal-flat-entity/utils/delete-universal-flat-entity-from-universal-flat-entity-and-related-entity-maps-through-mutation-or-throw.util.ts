import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { type MetadataUniversalFlatEntityAndRelatedUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-maps-through-mutation-or-throw.util';
import { replaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/replace-universal-flat-entity-in-universal-flat-entity-maps-through-mutation-or-throw.util';

type DeleteUniversalFlatEntityFromUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrowArgs<
  T extends AllMetadataName,
> = {
  metadataName: T;
  universalFlatEntity: MetadataUniversalFlatEntity<T>;
  universalFlatEntityAndRelatedMapsToMutate: MetadataUniversalFlatEntityAndRelatedUniversalFlatEntityMaps<T>;
};

export const deleteUniversalFlatEntityFromUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow =
  <T extends AllMetadataName>({
    metadataName,
    universalFlatEntity,
    universalFlatEntityAndRelatedMapsToMutate,
  }: DeleteUniversalFlatEntityFromUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrowArgs<T>) => {
    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);

    deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow({
      universalIdentifierToDelete: universalFlatEntity.universalIdentifier,
      universalFlatEntityMapsToMutate:
        universalFlatEntityAndRelatedMapsToMutate[
          flatEntityMapsKey
        ] as UniversalFlatEntityMaps<
          MetadataUniversalFlatEntity<typeof metadataName>
        >,
    });

    const manyToOneRelations = ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName];

    for (const relationPropertyName of Object.keys(manyToOneRelations)) {
      const relation = manyToOneRelations[
        relationPropertyName as keyof typeof manyToOneRelations
      ] as {
        metadataName: AllMetadataName;
        inverseOneToManyProperty: string | null;
        universalForeignKey: string;
      } | null;

      if (!isDefined(relation)) {
        continue;
      }

      const {
        metadataName: relatedMetadataName,
        inverseOneToManyProperty,
        universalForeignKey,
      } = relation;

      if (!isDefined(inverseOneToManyProperty)) {
        continue;
      }

      const oneToManyRelations =
        ALL_ONE_TO_MANY_METADATA_RELATIONS[relatedMetadataName];

      const inverseRelation = oneToManyRelations[
        inverseOneToManyProperty as keyof typeof oneToManyRelations
      ] as {
        universalFlatEntityForeignKeyAggregator: string;
      } | null;

      if (!isDefined(inverseRelation)) {
        continue;
      }

      const { universalFlatEntityForeignKeyAggregator } = inverseRelation;

      const relatedFlatEntityMapsKey =
        getMetadataFlatEntityMapsKey(relatedMetadataName);

      const relatedUniversalFlatEntityMaps =
        universalFlatEntityAndRelatedMapsToMutate[
          relatedFlatEntityMapsKey as MetadataRelatedFlatEntityMapsKeys<T>
        ] as UniversalFlatEntityMaps<
          MetadataUniversalFlatEntity<typeof relatedMetadataName>
        >;

      const universalForeignKeyValue = (
        universalFlatEntity as unknown as Record<string, string | undefined>
      )[universalForeignKey];

      if (!isDefined(universalForeignKeyValue)) {
        continue;
      }

      const relatedUniversalFlatEntity = findFlatEntityByUniversalIdentifier({
        universalIdentifier: universalForeignKeyValue,
        flatEntityMaps: relatedUniversalFlatEntityMaps,
      });

      if (!isDefined(relatedUniversalFlatEntity)) {
        continue;
      }

      if (
        !Object.prototype.hasOwnProperty.call(
          relatedUniversalFlatEntity,
          universalFlatEntityForeignKeyAggregator,
        )
      ) {
        throw new FlatEntityMapsException(
          `Should never occur, invalid flat entity typing. flat ${relatedMetadataName} should contain ${universalFlatEntityForeignKeyAggregator}`,
          FlatEntityMapsExceptionCode.ENTITY_MALFORMED,
        );
      }

      const updatedRelatedEntity = {
        ...relatedUniversalFlatEntity,
        [universalFlatEntityForeignKeyAggregator]: (
          (relatedUniversalFlatEntity as unknown as Record<string, string[]>)[
            universalFlatEntityForeignKeyAggregator
          ] ?? []
        ).filter(
          (universalIdentifier) =>
            universalIdentifier !== universalFlatEntity.universalIdentifier,
        ),
      };

      replaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrow(
        {
          universalFlatEntity: updatedRelatedEntity,
          universalFlatEntityMapsToMutate: relatedUniversalFlatEntityMaps,
        },
      );
    }
  };
