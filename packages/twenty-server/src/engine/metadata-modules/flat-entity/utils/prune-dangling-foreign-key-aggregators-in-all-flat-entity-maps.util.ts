import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

type LooseAllFlatEntityMaps = Record<
  string,
  FlatEntityMaps<SyncableFlatEntity>
>;

type OneToManyRelation = {
  metadataName: AllMetadataName;
  universalFlatEntityForeignKeyAggregator: string;
} | null;

type OneToManyAggregatorWithChildIdentifiers = {
  aggregatorProperty: string;
  childUniversalIdentifiers: Set<string>;
};

// Drops one-to-many aggregator references to children absent from the slice
// (e.g. an app-owned view referencing a view field owned by another
// application), keeping the slice a closed, internally consistent graph.
export const pruneDanglingForeignKeyAggregatorsInAllFlatEntityMaps = ({
  allFlatEntityMaps,
}: {
  allFlatEntityMaps: AllFlatEntityMaps;
}): AllFlatEntityMaps => {
  const looseAllFlatEntityMaps =
    allFlatEntityMaps as unknown as LooseAllFlatEntityMaps;

  const prunedAllFlatEntityMaps: LooseAllFlatEntityMaps = {
    ...looseAllFlatEntityMaps,
  };

  for (const metadataName of Object.values(ALL_METADATA_NAME)) {
    const oneToManyRelations = Object.values(
      ALL_ONE_TO_MANY_METADATA_RELATIONS[metadataName],
    ) as OneToManyRelation[];

    const aggregatorsWithChildIdentifiers: OneToManyAggregatorWithChildIdentifiers[] =
      oneToManyRelations.filter(isDefined).map((relation) => ({
        aggregatorProperty: relation.universalFlatEntityForeignKeyAggregator,
        childUniversalIdentifiers: new Set(
          Object.keys(
            looseAllFlatEntityMaps[
              getMetadataFlatEntityMapsKey(relation.metadataName)
            ].byUniversalIdentifier,
          ),
        ),
      }));

    if (aggregatorsWithChildIdentifiers.length === 0) {
      continue;
    }

    const parentFlatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
    const parentFlatEntityMaps =
      looseAllFlatEntityMaps[parentFlatEntityMapsKey];

    const prunedByUniversalIdentifier: Record<string, SyncableFlatEntity> = {};

    for (const [universalIdentifier, parentFlatEntity] of Object.entries(
      parentFlatEntityMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(parentFlatEntity)) {
        continue;
      }

      let prunedFlatEntity = parentFlatEntity;

      for (const {
        aggregatorProperty,
        childUniversalIdentifiers,
      } of aggregatorsWithChildIdentifiers) {
        const currentReferences = (prunedFlatEntity as Record<string, unknown>)[
          aggregatorProperty
        ];

        if (!Array.isArray(currentReferences)) {
          continue;
        }

        const prunedReferences = currentReferences.filter(
          (childUniversalIdentifier: string) =>
            childUniversalIdentifiers.has(childUniversalIdentifier),
        );

        if (prunedReferences.length === currentReferences.length) {
          continue;
        }

        prunedFlatEntity = {
          ...(prunedFlatEntity as Record<string, unknown>),
          [aggregatorProperty]: prunedReferences,
        } as SyncableFlatEntity;
      }

      prunedByUniversalIdentifier[universalIdentifier] = prunedFlatEntity;
    }

    prunedAllFlatEntityMaps[parentFlatEntityMapsKey] = {
      ...parentFlatEntityMaps,
      byUniversalIdentifier: prunedByUniversalIdentifier,
    };
  }

  return prunedAllFlatEntityMaps as unknown as AllFlatEntityMaps;
};
