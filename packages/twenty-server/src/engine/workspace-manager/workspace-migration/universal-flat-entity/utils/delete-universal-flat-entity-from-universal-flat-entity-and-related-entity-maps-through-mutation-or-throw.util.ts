import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { type MetadataUniversalFlatEntityAndRelatedUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { ALL_UNIVERSAL_METADATA_RELATIONS } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-metadata-relations.constant';
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

    const universalManyToOneRelations = Object.values(
      ALL_UNIVERSAL_METADATA_RELATIONS[metadataName].manyToOne,
    ) as Array<{
      metadataName: AllMetadataName;
      universalFlatEntityForeignKeyAggregator: string | null;
      universalForeignKey: string;
    } | null>;

    for (const universalRelation of universalManyToOneRelations) {
      if (!isDefined(universalRelation)) {
        continue;
      }

      const {
        metadataName: relatedMetadataName,
        universalFlatEntityForeignKeyAggregator,
        universalForeignKey,
      } = universalRelation;

      if (!isDefined(universalFlatEntityForeignKeyAggregator)) {
        continue;
      }

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
