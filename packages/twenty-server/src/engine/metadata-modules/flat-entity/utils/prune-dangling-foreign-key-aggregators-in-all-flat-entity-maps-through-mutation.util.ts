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

const pruneFlatEntityForeignKeyAggregators = ({
  flatEntity,
  aggregatorsWithChildIdentifiers,
}: {
  flatEntity: SyncableFlatEntity;
  aggregatorsWithChildIdentifiers: OneToManyAggregatorWithChildIdentifiers[];
}): SyncableFlatEntity =>
  aggregatorsWithChildIdentifiers.reduce(
    (prunedFlatEntity, { aggregatorProperty, childUniversalIdentifiers }) => {
      const aggregatedUniversalIdentifiers = (
        prunedFlatEntity as Record<string, unknown>
      )[aggregatorProperty];

      if (
        !isDefined(aggregatedUniversalIdentifiers) ||
        !Array.isArray(aggregatedUniversalIdentifiers)
      ) {
        return prunedFlatEntity;
      }

      const prunedUniversalIdentifiers = aggregatedUniversalIdentifiers.filter(
        (childUniversalIdentifier: string) =>
          childUniversalIdentifiers.has(childUniversalIdentifier),
      );

      if (
        prunedUniversalIdentifiers.length ===
        aggregatedUniversalIdentifiers.length
      ) {
        return prunedFlatEntity;
      }

      return {
        ...prunedFlatEntity,
        [aggregatorProperty]: prunedUniversalIdentifiers,
      };
    },
    flatEntity,
  );

// Drops one-to-many aggregator references to children absent from the slice
// (e.g. an app-owned view referencing a view field owned by another
// application), keeping the slice a closed, internally consistent graph.
// Mutates the passed maps in place: the parent entry is replaced by a new
// pruned entity object, never mutating the shared entity referenced elsewhere.
export const pruneDanglingForeignKeyAggregatorsInAllFlatEntityMapsThroughMutation =
  ({
    allFlatEntityMapsToMutate,
  }: {
    allFlatEntityMapsToMutate: Partial<AllFlatEntityMaps>;
  }): void => {
    const looseAllFlatEntityMaps =
      allFlatEntityMapsToMutate as unknown as Partial<LooseAllFlatEntityMaps>;

    for (const metadataName of Object.values(ALL_METADATA_NAME)) {
      const parentFlatEntityMaps =
        looseAllFlatEntityMaps[getMetadataFlatEntityMapsKey(metadataName)];

      if (!isDefined(parentFlatEntityMaps)) {
        continue;
      }

      const oneToManyRelations = Object.values(
        ALL_ONE_TO_MANY_METADATA_RELATIONS[metadataName],
      ) as OneToManyRelation[];

      const aggregatorsWithChildIdentifiers: OneToManyAggregatorWithChildIdentifiers[] =
        oneToManyRelations.filter(isDefined).flatMap((relation) => {
          const childFlatEntityMaps =
            looseAllFlatEntityMaps[
              getMetadataFlatEntityMapsKey(relation.metadataName)
            ];

          const childUniversalIdentifiers = isDefined(childFlatEntityMaps)
            ? new Set(Object.keys(childFlatEntityMaps.byUniversalIdentifier))
            : new Set<string>();

          return [
            {
              aggregatorProperty:
                relation.universalFlatEntityForeignKeyAggregator,
              childUniversalIdentifiers,
            },
          ];
        });

      if (aggregatorsWithChildIdentifiers.length === 0) {
        continue;
      }

      const flatEntityByUniversalIdentifier =
        parentFlatEntityMaps.byUniversalIdentifier;

      for (const [universalIdentifier, parentFlatEntity] of Object.entries(
        flatEntityByUniversalIdentifier,
      )) {
        if (!isDefined(parentFlatEntity)) {
          continue;
        }

        flatEntityByUniversalIdentifier[universalIdentifier] =
          pruneFlatEntityForeignKeyAggregators({
            flatEntity: parentFlatEntity,
            aggregatorsWithChildIdentifiers,
          });
      }
    }
  };
