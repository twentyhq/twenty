import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type MetadataFlatEntityAndOneToManyDescendantFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-one-to-many-descendant-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

type GenericOneToManyRelation = {
  metadataName: AllMetadataName;
  universalFlatEntityForeignKeyAggregator: string;
} | null;

type GenericManyToOneRelation = {
  metadataName: AllMetadataName;
  inverseOneToManyProperty: string | null;
  isNullable: boolean;
} | null;

type GenericFlatEntity = { universalIdentifier: string } & Record<
  string,
  unknown
>;

// Only required links are followed: the relation constants don't say whether an optional
// link cascades or is set to null, so children attached through one are left to the caller
const isDeletedWithParent = ({
  childMetadataName,
  parentMetadataName,
  oneToManyProperty,
}: {
  childMetadataName: AllMetadataName;
  parentMetadataName: AllMetadataName;
  oneToManyProperty: string;
}): boolean =>
  (
    Object.values(
      ALL_MANY_TO_ONE_METADATA_RELATIONS[childMetadataName],
    ) as GenericManyToOneRelation[]
  ).some(
    (relation) =>
      isDefined(relation) &&
      relation.metadataName === parentMetadataName &&
      relation.inverseOneToManyProperty === oneToManyProperty &&
      !relation.isNullable,
  );

const DEFAULT_MAX_DEPTH = 10;

export const computeFlatEntityAndRelatedFlatEntitiesToDelete = <
  TMetadataName extends AllMetadataName,
>({
  metadataName,
  flatEntity,
  flatEntityMaps,
  maxDepth = DEFAULT_MAX_DEPTH,
}: {
  metadataName: TMetadataName;
  flatEntity: MetadataFlatEntity<TMetadataName>;
  flatEntityMaps: MetadataFlatEntityAndOneToManyDescendantFlatEntityMaps<TMetadataName>;
  maxDepth?: number;
}): AllFlatEntityOperationByMetadataName => {
  const flatEntitiesToDeleteByMetadataName: Partial<
    Record<AllMetadataName, GenericFlatEntity[]>
  > = {};
  const visitedKeys = new Set<string>();

  const visit = (
    currentMetadataName: AllMetadataName,
    currentFlatEntity: GenericFlatEntity,
    depth: number,
  ) => {
    const visitedKey = `${currentMetadataName}:${currentFlatEntity.universalIdentifier}`;

    if (visitedKeys.has(visitedKey)) {
      return;
    }

    if (depth > maxDepth) {
      throw new FlatEntityMapsException(
        `Deleting ${metadataName} ${flatEntity.universalIdentifier} reaches ${currentMetadataName} ${currentFlatEntity.universalIdentifier} beyond the maximum depth of ${maxDepth}`,
        FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    visitedKeys.add(visitedKey);
    (flatEntitiesToDeleteByMetadataName[currentMetadataName] ??= []).push(
      currentFlatEntity,
    );

    const oneToManyRelations = Object.entries(
      ALL_ONE_TO_MANY_METADATA_RELATIONS[currentMetadataName],
    ) as [string, GenericOneToManyRelation][];

    for (const [oneToManyProperty, relation] of oneToManyRelations) {
      if (
        !isDefined(relation) ||
        !isDeletedWithParent({
          childMetadataName: relation.metadataName,
          parentMetadataName: currentMetadataName,
          oneToManyProperty,
        })
      ) {
        continue;
      }

      const childUniversalIdentifiers = currentFlatEntity[
        relation.universalFlatEntityForeignKeyAggregator
      ] as string[] | undefined;

      if (!isDefined(childUniversalIdentifiers)) {
        continue;
      }

      const childFlatEntityMapsKey = getMetadataFlatEntityMapsKey(
        relation.metadataName,
      );
      const childFlatEntityMaps = (
        flatEntityMaps as Partial<AllFlatEntityMaps>
      )[childFlatEntityMapsKey] as
        | FlatEntityMaps<MetadataFlatEntity<AllMetadataName>>
        | undefined;

      if (!isDefined(childFlatEntityMaps)) {
        throw new FlatEntityMapsException(
          `${childFlatEntityMapsKey} is required to delete the ${relation.metadataName} entities of ${currentMetadataName} ${currentFlatEntity.universalIdentifier}`,
          FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR,
        );
      }

      for (const childFlatEntity of findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps(
        {
          flatEntityMaps: childFlatEntityMaps,
          universalIdentifiers: childUniversalIdentifiers,
        },
      )) {
        visit(
          relation.metadataName,
          childFlatEntity as GenericFlatEntity,
          depth + 1,
        );
      }
    }
  };

  visit(metadataName, flatEntity as unknown as GenericFlatEntity, 0);

  return Object.fromEntries(
    Object.entries(flatEntitiesToDeleteByMetadataName).map(
      ([currentMetadataName, flatEntityToDelete]) => [
        currentMetadataName,
        { flatEntityToCreate: [], flatEntityToUpdate: [], flatEntityToDelete },
      ],
    ),
  ) as AllFlatEntityOperationByMetadataName;
};
