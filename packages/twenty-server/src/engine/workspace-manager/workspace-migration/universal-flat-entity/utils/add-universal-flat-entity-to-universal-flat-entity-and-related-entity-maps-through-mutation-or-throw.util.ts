import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataUniversalFlatEntityAndRelatedUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { type MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { ALL_UNIVERSAL_METADATA_RELATIONS } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-metadata-relations.constant';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { replaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/replace-universal-flat-entity-in-universal-flat-entity-maps-through-mutation-or-throw.util';

type AddUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrowArgs<
  T extends AllMetadataName,
> = {
  metadataName: T;
  universalFlatEntity: MetadataUniversalFlatEntity<T>;
  universalFlatEntityAndRelatedMapsToMutate: MetadataUniversalFlatEntityAndRelatedUniversalFlatEntityMaps<T>;
};

export const addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow =
  <T extends AllMetadataName>({
    metadataName,
    universalFlatEntity,
    universalFlatEntityAndRelatedMapsToMutate,
  }: AddUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrowArgs<T>) => {
    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity,
      universalFlatEntityMapsToMutate:
        universalFlatEntityAndRelatedMapsToMutate[flatEntityMapsKey],
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

      const relatedUniversalFlatEntity =
        findFlatEntityByUniversalIdentifierOrThrow({
          universalIdentifier: universalForeignKeyValue,
          flatEntityMaps: relatedUniversalFlatEntityMaps,
        });

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
        [universalFlatEntityForeignKeyAggregator]: [
          ...((
            relatedUniversalFlatEntity as unknown as Record<string, string[]>
          )[universalFlatEntityForeignKeyAggregator] ?? []),
          universalFlatEntity.universalIdentifier,
        ],
      };

      replaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrow(
        {
          universalFlatEntity: updatedRelatedEntity,
          universalFlatEntityMapsToMutate: relatedUniversalFlatEntityMaps,
        },
      );
    }
  };
